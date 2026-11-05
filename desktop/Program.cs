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
        if (args.Length == 2 && args[0] == "--self-test") return SelfTest.Run(args[1]);
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
    internal WorkbenchWindow()
    {
        Title = "CoE5 Spell & Weapon Workbench"; Width = 1440; Height = 960;
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
                case "exportCopy":
                    string text = message.GetProperty("payload").GetProperty("text").GetString() ?? throw new InvalidDataException("Missing source text.");
                    string name = message.GetProperty("payload").GetProperty("filename").GetString() ?? "definition.edited.c5se";
                    if (name != Path.GetFileName(name) || name.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0) throw new InvalidDataException("Invalid suggested filename.");
                    var save = new SaveFileDialog { Title = "Export a separate copy · choose a new filename", FileName = name, Filter = "CoE5 source|*.c5m;*.c5se", OverwritePrompt = true, AddExtension = false };
                    if (save.ShowDialog(this) != true) { result = null; break; }
                    if (!Path.GetExtension(save.FileName).Equals(Path.GetExtension(name), StringComparison.OrdinalIgnoreCase)) throw new InvalidDataException("Keep the source's original extension; this tool does not convert formats.");
                    LocalFiles.ExportNew(save.FileName, text); result = new { name = Path.GetFileName(save.FileName) }; break;
                case "getLibrary": result = LocalFiles.CachedNames(); break;
                case "importNames":
                    var names = new OpenFileDialog { Title = "Import reference exports or a name index", Filter = "CoE5 reference data|*.txt;*.c5m;*.json", CheckFileExists = true, Multiselect = true };
                    if (names.ShowDialog(this) != true) { result = null; break; }
                    result = names.FileNames.Length == 1 && Path.GetExtension(names.FileName).Equals(".json", StringComparison.OrdinalIgnoreCase) ? LocalFiles.ImportNames(names.FileName) : LocalFiles.ImportData(names.FileNames); break;
                default: throw new InvalidDataException("Unsupported desktop operation.");
            }
            Reply(id, result);
        }
        catch (Exception error) { Reply(id, null, error is IOException ? "Could not complete file operation. Existing files are never overwritten; choose a new copy filename. " + error.Message : error.Message); }
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
        bool leave = !unsaved || MessageBox.Show(this, "Unapplied or unexported edits will be lost. Close without exporting a copy?", "Unsaved workbench edits", MessageBoxButton.YesNo, MessageBoxImage.Warning, MessageBoxResult.No) == MessageBoxResult.Yes;
        checkingClose = false;
        if (leave) { closingApproved = true; Close(); }
    }
}
