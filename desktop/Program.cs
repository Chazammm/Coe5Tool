using System.ComponentModel;
using System.IO;
using System.Text.Json;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.Wpf;
using Microsoft.Win32;

namespace CoE5Workbench;

internal static class Program
{
    [STAThread]
    public static int Main(string[] args)
    {
        if (args.Length == 2 && args[0] == "--test-child") { using var childOutput = new FileStream(args[1], FileMode.CreateNew, FileAccess.Write); childOutput.Write(LocalFiles.Utf8.GetBytes(Environment.GetEnvironmentVariable("COE5_SAVE") + "\n" + Environment.GetEnvironmentVariable("COE5_DATA"))); Thread.Sleep(600); return 0; }
        if (args.Length == 2 && args[0] == "--self-test") return SelfTest.Run(args[1]);
        if (args.Length == 2 && args[0] == "--import-monsters") { try { ChoiceStore.Import(Path.GetFullPath(args[1])); return 0; } catch { return 1; } }
        if (args.Length == 2 && args[0] == "--import-library")
        {
            try { LocalFiles.ImportNames(Path.GetFullPath(args[1])); return 0; }
            catch (Exception e) { File.WriteAllText(Path.Combine(AppContext.BaseDirectory, "library-import-error.txt"), e.Message); return 1; }
        }
        if (args.Length == 2 && args[0] == "--import-data")
        {
            try { LocalFiles.ImportData(new[] { "Spell Data v5.33.txt", "Weapon Data v5.33.c5m" }.Select(name => Path.Combine(Path.GetFullPath(args[1]), name)).ToArray()); return 0; }
            catch (Exception e) { File.WriteAllText(Path.Combine(AppContext.BaseDirectory, "library-import-error.txt"), e.Message); return 1; }
        }
        var app = new Application(); app.Run(new WorkbenchWindow()); return 0;
    }
}

internal sealed class WorkbenchWindow : Window
{
    private readonly WebView2 view = new();
    private bool closingApproved, checkingClose, busy, ready;
    private readonly string uiRoot = Path.Combine(AppContext.BaseDirectory, "ui");
    private IsolatedTests? tests;
    private IsolatedTests Tests => tests ??= new IsolatedTests();
    internal WorkbenchWindow()
    {
        Title = "CoE5 Spell & Weapon Workbench"; Width = 1120; Height = 800;
        MinWidth = 640; MinHeight = 520; WindowStartupLocation = WindowStartupLocation.CenterScreen;
        Background = new SolidColorBrush(Color.FromRgb(23, 27, 30)); Content = view;
        Loaded += async (_, _) => await Initialize(); Closing += OnClosing;
        Closed += (_, _) => view.Dispose();
    }
    private async Task Initialize()
    {
        try
        {
            Directory.CreateDirectory(LocalFiles.Profile);
            var environment = await CoreWebView2Environment.CreateAsync(null, Path.Combine(LocalFiles.Profile, "webview"));
            await view.EnsureCoreWebView2Async(environment);
            var web = view.CoreWebView2;
            view.AllowExternalDrop = true;
            web.Settings.AreHostObjectsAllowed = false; web.Settings.AreDevToolsEnabled = false;
            web.Settings.AreDefaultContextMenusEnabled = false; web.Settings.AreBrowserAcceleratorKeysEnabled = false;
            web.Settings.IsGeneralAutofillEnabled = false; web.Settings.IsPasswordAutosaveEnabled = false;
            web.SetVirtualHostNameToFolderMapping("workbench.invalid", uiRoot, CoreWebView2HostResourceAccessKind.DenyCors);
            web.AddWebResourceRequestedFilter("*", CoreWebView2WebResourceContext.All);
            web.WebResourceRequested += (_, e) => { if (!HostPolicy.AssetAllowed(e.Request.Uri)) e.Response = environment.CreateWebResourceResponse(new MemoryStream(), 403, "Blocked", "Content-Type: text/plain"); };
            web.PermissionRequested += (_, e) => e.State = CoreWebView2PermissionState.Deny;
            web.DownloadStarting += (_, e) => e.Cancel = true; // Native copy export is the only desktop write route.
            web.NavigationStarting += (_, e) =>
            {
                if (HostPolicy.IsPage(e.Uri)) return;
                e.Cancel = true; if (HostPolicy.HelpFile(e.Uri) is string relative) ShowHelp(relative);
            };
            web.NewWindowRequested += (_, e) => { e.Handled = true; if (e.IsUserInitiated && HostPolicy.HelpFile(e.Uri) is string relative) ShowHelp(relative); };
            web.WebMessageReceived += OnMessage;
            web.NavigationCompleted += (_, e) => { ready = e.IsSuccess && HostPolicy.IsPage(web.Source); if (!e.IsSuccess) MessageBox.Show(this, "The local interface could not load. Rebuild or restore the ui folder.", "Workbench startup"); };
            web.Navigate(HostPolicy.Origin + "/index.html");
        }
        catch (Exception e) { MessageBox.Show(this, "Could not start the desktop interface. Install Microsoft Edge WebView2 Evergreen Runtime and .NET 8 Desktop Runtime (x64).\n\n" + e.Message, "Workbench startup"); }
    }
    private void ShowHelp(string relative)
    {
        try
        {
            var text = new TextBox { Text = File.ReadAllText(Path.Combine(uiRoot, relative)), IsReadOnly = true, TextWrapping = TextWrapping.Wrap, VerticalScrollBarVisibility = ScrollBarVisibility.Auto, Padding = new Thickness(20), FontSize = 14 };
            new Window { Owner = this, Title = "Workbench documentation · " + Path.GetFileName(relative), Width = 820, Height = 700, Content = text, WindowStartupLocation = WindowStartupLocation.CenterOwner }.Show();
        }
        catch (Exception e) { MessageBox.Show(this, e.Message, "Documentation unavailable"); }
    }
    private async void OnMessage(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        if (!HostPolicy.IsPage(e.Source) || !HostPolicy.IsPage(view.CoreWebView2.Source)) return;
        int id = 0; bool ownsBusy = false;
        try
        {
            if (e.WebMessageAsJson.Length > 32 * 1024 * 1024) throw new InvalidDataException("Message too large.");
            using var doc = JsonDocument.Parse(e.WebMessageAsJson); var message = doc.RootElement;
            id = message.GetProperty("id").GetInt32(); if (id < 1) return;
            if (busy) { Reply(id, null, "Finish the current file dialog first."); return; }
            busy = true; ownsBusy = true; object? result;
            switch (message.GetProperty("action").GetString())
            {
                case "openSource":
                    var open = new OpenFileDialog { Title = "Open a source (read only)", Filter = "CoE5 source|*.c5m;*.c5se", CheckFileExists = true, Multiselect = false };
                    result = open.ShowDialog(this) == true ? LocalFiles.OpenSource(open.FileName) : null; break;
                case "openDroppedSource":
                    var attachments = e.AdditionalObjects;
                    if (attachments == null || attachments.Count != 1 || attachments[0] is not CoreWebView2File dropped) throw new InvalidDataException("Drop exactly one local source file. Paths in message text are not accepted.");
                    result = DroppedSource.Open(new[] { dropped.Path }); break;
                case "exportCopy":
                    string text = message.GetProperty("payload").GetProperty("text").GetString() ?? throw new InvalidDataException("Missing source text.");
                    string name = message.GetProperty("payload").GetProperty("filename").GetString() ?? "definition.edited.c5se";
                    if (name != Path.GetFileName(name) || name.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0) throw new InvalidDataException("Invalid suggested filename.");
                    var save = new SaveFileDialog { Title = "Export a separate copy · choose a new filename", FileName = name, Filter = "CoE5 source|*.c5m;*.c5se", OverwritePrompt = true, AddExtension = false };
                    if (save.ShowDialog(this) != true) { result = null; break; }
                    if (!Path.GetExtension(save.FileName).Equals(Path.GetExtension(name), StringComparison.OrdinalIgnoreCase)) throw new InvalidDataException("Keep the source's original extension; this tool does not convert formats.");
                    LocalFiles.ExportNew(save.FileName, text); result = new { name = Path.GetFileName(save.FileName) }; break;
                case "getLibrary": result = LocalFiles.CachedNames(); break;
                case "getTestRuntime": result = await Task.Run(() => Tests.RuntimeStatus()); break;
                case "chooseTestRuntime":
                    var gameFile = new OpenFileDialog { Title = "Select CoE5 5.43 (read only)", Filter = "CoE5 executable|CoE5.exe", CheckFileExists = true };
                    if (gameFile.ShowDialog(this) != true) { result = null; break; }
                    var extender = new OpenFileDialog { Title = "Select official CoE5SE 3.2.2 (preview) or 2.13.0 plugin (read only)", Filter = "CoE5SE plugin|coe5se.c5plugin.dll", CheckFileExists = true };
                    if (extender.ShowDialog(this) != true) { result = null; break; }
                    var runtimePaths = new RuntimePaths(gameFile.FileName, Path.GetDirectoryName(extender.FileName)!);
                    result = await Task.Run(() => Tests.Configure(runtimePaths)); break;
                case "prepareTestSession":
                    var candidate = message.GetProperty("payload").Clone();
                    result = await Task.Run(() => Tests.Prepare(candidate)); break;
                case "startTestSession":
                    string sessionId = message.GetProperty("payload").GetProperty("id").GetString()!;
                    string revision = message.GetProperty("payload").GetProperty("revision").GetString()!;
                    result = await Task.Run(() => Tests.Start(sessionId, revision)); break;
                case "getPreparedSessions": result = await Task.Run(() => Tests.PreparedSessions()); break;
                case "checkPreparedSession": result = await Task.Run(() => Tests.CheckPrepared(message.GetProperty("payload").GetProperty("id").GetString()!)); break;
                case "startPreparedSession":
                    result = await Task.Run(() => Tests.StartPrepared(message.GetProperty("payload").GetProperty("id").GetString()!, message.GetProperty("payload").GetProperty("revision").GetString()!)); break;
                case "openPreparedLogs":
                    string retainedFolder = Tests.PreparedFolder(message.GetProperty("payload").GetProperty("id").GetString()!);
                    System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows), "explorer.exe")) { UseShellExecute = false, ArgumentList = { retainedFolder } }); result = true; break;
                case "getTestSession": result = await Task.Run(() => Tests.Status()); break;
                case "getTestSessions": result = await Task.Run(() => Tests.ReturnSessions()); break;
                case "getMixedTestValues": result = await Task.Run(() => Tests.MixedObservation(message.GetProperty("payload").GetProperty("id").GetString()!)); break;
                case "getTestValues": result = await Task.Run(() => Tests.ReturnValues(message.GetProperty("payload").GetProperty("id").GetString()!)); break;
                case "getRuntimeChoices": result = await Task.Run(() => Tests.RuntimeChoices(message.GetProperty("payload").GetProperty("id").GetString()!)); break;
                case "getOriginalObservation": result = await Task.Run(() => Tests.OriginalObservation(message.GetProperty("payload").GetProperty("id").GetString()!)); break;
                case "getInstalledChoices": result = await Task.Run(() => Tests.InstalledChoices()); break;
                case "getStandaloneTargets": result=await Task.Run(() => Tests.StandaloneTargets()); break;
                case "loadInstalledChoices":
                    var catalogFile = new OpenFileDialog { Title = "Read installed CoE5 5.43 data (no game launch)", Filter = "CoE5 executable|CoE5.exe", CheckFileExists = true };
                    result = catalogFile.ShowDialog(this) == true ? await Task.Run(() => VanillaCatalog.Read(catalogFile.FileName)) : null; break;
                case "getChoiceData": result = ChoiceStore.Packet(); break;
                case "importChoiceData":
                    var choiceFile = new OpenFileDialog { Title = "Import historical monster variants (read only)", Filter = "CoE5 monster reference|*.c5m", CheckFileExists = true };
                    result = choiceFile.ShowDialog(this) == true ? ChoiceStore.Import(choiceFile.FileName) : null; break;
                case "invalidateTestSession": Tests.Invalidate(message.GetProperty("payload").GetProperty("id").GetString()!); result = true; break;
                case "openTestLogs":
                    string logFolder = Tests.Folder(message.GetProperty("payload").GetProperty("id").GetString()!);
                    System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows), "explorer.exe")) { UseShellExecute = false, ArgumentList = { logFolder } }); result = true; break;
                case "saveTestObservation":
                    var observation = message.GetProperty("payload");
                    result = Tests.Observe(observation.GetProperty("id").GetString()!, observation.GetProperty("outcome").GetString()!, observation.GetProperty("note").GetString()!); break;
                case "exportTestPackage":
                    var package = message.GetProperty("payload");
                    string modId = package.GetProperty("modId").GetString() ?? "";
                    var packageFiles = new Dictionary<string, string>(StringComparer.Ordinal);
                    foreach (var entry in package.GetProperty("files").EnumerateArray())
                        if (!packageFiles.TryAdd(entry.GetProperty("name").GetString()!, entry.GetProperty("text").GetString()!))
                            throw new InvalidDataException("Repeated test package filename.");
                    _ = TestPackage.Build(modId, packageFiles); // Refuse unsafe paths before offering a dialog.
                    var zipSave = new SaveFileDialog { Title = "Export experimental test ZIP · choose a new filename", FileName = modId + ".test.zip", Filter = "Test ZIP|*.zip", OverwritePrompt = true, AddExtension = false };
                    if (zipSave.ShowDialog(this) != true) { result = null; break; }
                    TestPackage.ExportNew(zipSave.FileName, modId, packageFiles); result = new { name = Path.GetFileName(zipSave.FileName) }; break;
                case "importNames":
                    var names = new OpenFileDialog { Title = "Import reference exports or a name index", Filter = "CoE5 reference data|*.txt;*.c5m;*.json", CheckFileExists = true, Multiselect = true };
                    if (names.ShowDialog(this) != true) { result = null; break; }
                    result = names.FileNames.Length == 1 && Path.GetExtension(names.FileName).Equals(".json", StringComparison.OrdinalIgnoreCase) ? LocalFiles.ImportNames(names.FileName) : LocalFiles.ImportData(names.FileNames); break;
                default: throw new InvalidDataException("Unsupported desktop operation.");
            }
            Reply(id, result);
        }
        catch (Exception error) { Reply(id, null, error.Message); }
        finally { if (ownsBusy) busy = false; }
        await Task.CompletedTask;
    }
    private void Reply(int id, object? result, string? error = null)
    {
        if (HostPolicy.IsPage(view.CoreWebView2.Source)) view.CoreWebView2.PostWebMessageAsJson(JsonSerializer.Serialize(new { id, result, error }));
    }
    private async void OnClosing(object? sender, CancelEventArgs e)
    {
        if (closingApproved) return;
        e.Cancel = true; if (checkingClose) return;
        if (busy) { MessageBox.Show(this, "Finish or cancel the current file operation before closing.", "Workbench"); return; }
        checkingClose = true;
        try
        {
            if (tests?.Running == true && MessageBox.Show(this, "Your isolated test game is still running. Closing the workbench leaves it running; use Quit inside that game. Close the workbench anyway?", "Test session still running", MessageBoxButton.YesNo, MessageBoxImage.Warning, MessageBoxResult.No) != MessageBoxResult.Yes) { checkingClose = false; return; }
        }
        catch (Exception error) { MessageBox.Show(this, "Test session status is uncertain. No process will be closed. " + error.Message, "Test session"); checkingClose = false; return; }
        bool unsaved = ready; // Before navigation there is no draft to lose.
        try
        {
            if (ready && HostPolicy.IsPage(view.CoreWebView2.Source))
            {
                var query = view.CoreWebView2.ExecuteScriptAsync("typeof window.CoeDesktopState === 'function' ? window.CoeDesktopState() : true");
                if (await Task.WhenAny(query, Task.Delay(2500)) == query) unsaved = await query != "false";
            }
        }
        catch { unsaved = true; }
        bool leave = !unsaved || MessageBox.Show(this, "Unapplied or unexported edits, and any unsaved test observation, will be lost. Close anyway?", "Unsaved workbench edits", MessageBoxButton.YesNo, MessageBoxImage.Warning, MessageBoxResult.No) == MessageBoxResult.Yes;
        checkingClose = false;
        if (leave) { closingApproved = true; Close(); }
    }
}
