using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace CoE5Workbench;

internal sealed partial class IsolatedTests
{
    internal static string DefaultRoot => Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "CoE5Workbench", "Tests");
    private readonly string root;
    private readonly ITestProcesses processes;
    private readonly Func<RuntimePaths, RuntimeIdentity> verify;
    private readonly Func<string> nextId;
    private readonly bool production;
    private Session? current;
    private ITestProcess? owned;
    private string? recoveryNotice;
    private static readonly JsonSerializerOptions Json = new() { WriteIndented = true };
    internal sealed class Session
    {
        public string Id { get; set; } = "";
        public string Revision { get; set; } = "";
        public string ModId { get; set; } = "";
        public string Spell { get; set; } = "";
        public string? SourceName { get; set; }
        public DateTime? PreparedUtc { get; set; }
        public string? ExtenderVersion { get; set; }
        public bool WeaponEditing { get; set; }
        public bool PrivateRanged { get; set; }
        public NativeTarget? Target { get; set; }
        public NativeTarget[]? Roster { get; set; }
        public bool PrivateMelee { get; set; }
        public bool OriginalRecord { get; set; }
        public string? ResultRun { get; set; }
        public string Status { get; set; } = "prepared";
        public bool Stale { get; set; }
        public int? Pid { get; set; }
        public DateTime? StartUtc { get; set; }
        public int? ExitCode { get; set; }
        public string? Error { get; set; }
        public string? Observation { get; set; }
        public Dictionary<string, string> Hashes { get; set; } = [];
    }
    internal IsolatedTests(string? root = null, ITestProcesses? processes = null, Func<RuntimePaths, RuntimeIdentity>? verify = null, Func<string>? nextId = null)
    {
        this.root = Path.GetFullPath(root ?? DefaultRoot); this.processes = processes ?? new TestProcesses();
        this.production = verify == null; this.verify = verify ?? GameRuntime.Verify; this.nextId = nextId ?? (() => Guid.NewGuid().ToString("N"));
        string pointer = Path.Combine(this.root, "last-session.txt");
        if (File.Exists(pointer))
        {
            if (!File.Exists(Path.Combine(this.root, ".workbench-tests-owner")) || File.ReadAllText(Path.Combine(this.root, ".workbench-tests-owner")) != "CoE5Workbench isolated tests v1") throw new IOException("Unrecognized test storage ownership marker.");
            GameRuntime.SafePath(pointer);
            try
            {
                string id = File.ReadAllText(pointer).Trim();
                current = JsonSerializer.Deserialize<Session>(LocalFiles.ReadText(Path.Combine(SessionRoot(id), "session.json"), 256 * 1024));
                if (current == null || current.Id != id) throw new InvalidDataException("Invalid saved test session.");
            }
            catch (Exception e) when (e is IOException or JsonException or InvalidDataException)
            {
                current = null; recoveryNotice = "Previous session record unavailable; use Prepared tests to inspect retained preparations, or prepare a new session. Retained files: " + this.root;
            }
        }
    }
    private string SessionRoot(string id)
    {
        if (!Regex.IsMatch(id, "^[a-f0-9]{32}\\z")) throw new InvalidDataException("Invalid isolated session identity.");
        string path = Path.Combine(root, id); GameRuntime.SafePath(path); return path;
    }
    private void InitializeRoot()
    {
        GameRuntime.SafePath(root);
        string marker = Path.Combine(root, ".workbench-tests-owner");
        if (Directory.Exists(root) && (!File.Exists(marker) || File.ReadAllText(marker) != "CoE5Workbench isolated tests v1"))
            throw new IOException("The test storage folder already exists without the workbench ownership marker. It will not be reused.");
        if (!Directory.Exists(root)) { Directory.CreateDirectory(root); WriteNew(marker, LocalFiles.Utf8.GetBytes("CoE5Workbench isolated tests v1")); }
    }
    private static void WriteNew(string path, byte[] data)
    {
        GameRuntime.SafePath(path);
        using var stream = new FileStream(path, FileMode.CreateNew, FileAccess.Write, FileShare.None); stream.Write(data); stream.Flush(true);
    }
    private static void SaveOwned(string path, string text)
    {
        GameRuntime.SafePath(path); string temp = path + "." + Guid.NewGuid().ToString("N") + ".tmp";
        WriteNew(temp, LocalFiles.Utf8.GetBytes(text)); File.Move(temp, path, true);
    }
    private void Save() { if (current != null) SaveOwned(Path.Combine(SessionRoot(current.Id), "session.json"), JsonSerializer.Serialize(current, Json)); }
    private RuntimePaths ReadPaths()
    {
        string path = Path.Combine(root, "runtime-paths.json");
        if (!File.Exists(path)) throw new InvalidDataException("Choose the local CoE5 5.43 executable and official extracted CoE5SE 3.3.0, 3.2.2 or 2.13.0 plugin first.");
        GameRuntime.SafePath(path);
        return JsonSerializer.Deserialize<RuntimePaths>(LocalFiles.ReadText(path, 16384)) ?? throw new InvalidDataException("Choose compatible runtime files first.");
    }
    internal object StandaloneTargets() => new { fingerprint=VanillaCatalog.Fingerprint, entries=VanillaCatalog.ReadTargets(ReadPaths().GameExe) };
    internal object RuntimeStatus()
    {
        try { var identity = verify(ReadPaths()); return new { compatible = true, version = identity.ExtenderVersion, api = GameRuntime.OfficialGroups(identity.ExtenderVersion)?11:10, mixedSupported = GameRuntime.OfficialGroups(identity.ExtenderVersion)||LocalRosterRuntime.Available(), mixedReason = GameRuntime.OfficialGroups(identity.ExtenderVersion)?"Official group API: fixed battles and ranged visual comparison use fresh native groups. Closure/readings do not establish complete record restoration or hit attribution.":"The private 2.13.0 roster component is not included in this download. Use one type, or retain your separately authorized legacy setup.", label = identity.Label, detail = (recoveryNotice == null ? "" : recoveryNotice + " ") + "Verified local fingerprints. " + GameRuntime.Evidence(identity.ExtenderVersion) + " Game data is read from " + identity.Data }; }
        catch (Exception e) { return new { compatible = false, label = "Runtime not ready", detail = e.Message }; }
    }
    internal object Configure(RuntimePaths paths)
    {
        var identity = verify(paths); InitializeRoot();
        SaveOwned(Path.Combine(root, "runtime-paths.json"), JsonSerializer.Serialize(identity.Paths, Json));
        return RuntimeStatus();
    }
    private void Refresh()
    {
        if (current?.Status != "running") return;
        owned ??= processes.FindOwned(current.Pid!.Value, current.StartUtc!.Value, Path.Combine(SessionRoot(current.Id), "runtime", "CoE5.exe"));
        if (owned == null || owned.HasExited)
        {
            current.Status = "exited"; current.ExitCode = owned?.ExitCode; owned = null; Save();
        }
    }
    internal bool Running { get { Refresh(); return current?.Status == "running"; } }
    internal object? Status()
    {
        Refresh(); if (current == null) return null;
        string folder = SessionRoot(current.Id);
        return new { id = current.Id, revision = current.Revision, spell = current.Spell, modId = current.ModId, status = current.Status, stale = current.Stale,
            runtime = GameRuntime.LabelFor(GameRuntime.SessionVersion(current)), runtimeVersion = GameRuntime.SessionVersion(current), runtimeEvidence = GameRuntime.Evidence(GameRuntime.SessionVersion(current)),
            pid = current.Pid, exitCode = current.ExitCode, error = current.Error, observation = current.Observation,
            folder, roster=current.Roster, target=current.Target, rangedComparison=current.PrivateRanged&&current.WeaponEditing, privateRanged=current.PrivateRanged, privateMelee = current.PrivateMelee, originalRecord = current.OriginalRecord, weaponEditing = current.WeaponEditing, needsProfileSetup = !File.Exists(Path.Combine(folder, "profile", "coe5config")),
            instruction = "Main menu: WB test: " + current.ModId + (current.Roster!=null && GameRuntime.OfficialGroups(GameRuntime.SessionVersion(current)) && current.WeaponEditing ? " → Open fresh mixed group → Battle (AI) once → Back → choose flight/impact → Apply visuals → open a fresh group again. Finish → Quit → review saved returned battles in Workbench. Up to 8 field attempts; no full record rollback or hit attribution." : current.Roster!=null && GameRuntime.OfficialGroups(GameRuntime.SessionVersion(current)) ? " → Battle (AI) once → Close → Quit normally. Official mixed groups; setup/end readings are not attack-time positions or hit attribution. No rollback receipt or live visual return." : current.Roster!=null && current.WeaponEditing ? " → Battle (fresh mixed group) → choose flight/impact → Apply visuals → Battle again → Finish → Quit. Review saved battles in Workbench. Local roster-v1 restores the selected roster after each battle." : current.Roster!=null ? " → Check cleanup or Battle (AI) → Finish → Quit. Requires local Workbench roster-v1. Open session & logs for wb-mixed-<run>.ini." : current.PrivateRanged && current.WeaponEditing ? " → Battle (fresh "+(current.Target?.count>1?"group":"target")+") → choose flight or impact → Apply visuals → Battle again → Finish → Quit. Review a saved battle in Workbench." : current.PrivateRanged ? " → Battle (AI) → watch the projectile and impact, then check the named attack, damage type and distance in the log → Close → Quit. The observation INI wb-ranged-<run>.ini includes the pre-battle target resistance for elemental weapons." : current.PrivateMelee ? " → Battle (AI) → check the private carrier, named weapon and damage type in the combat log → Close → Quit. The observation INI wb-melee-<run>.ini includes the pre-battle target resistance for elemental weapons." : current.OriginalRecord ? " → choose a native caster/carrier → Battle (AI) → Close → Quit. AI may make zero or several casts. No editing or forced cast. Open session & logs for wb-original-<run>.ini; record your observation separately." : current.WeaponEditing ? " → select Type/Area or Effects → Apply → Cast once → Reset targets → Save test values → Close test → Quit. Runtime changes only; desktop return is explicit." : " → Cast once → Close test → Quit.") + " No campaign. Restart after definition changes." };
    }
    internal object Prepare(JsonElement payload)
    {
        if (Running || processes.AnyGameRunning()) throw new IOException("A CoE5 session is running. Quit it yourself before preparing another isolated test; no process was closed.");
        var candidate = TestCandidate.Read(payload); var runtime = verify(ReadPaths());
        if(candidate.ExtenderVersion!=runtime.ExtenderVersion)throw new InvalidDataException("Test files target CoE5SE " + candidate.ExtenderVersion + ", but the configured runtime is " + runtime.ExtenderVersion + ". Prepare the files again for this runtime. No retained session was changed.");
        if(candidate.Roster!=null && production && runtime.ExtenderVersion=="2.13.0")runtime=LocalRosterRuntime.Overlay(runtime);
        if(production && candidate.Target is { } t && !VanillaCatalog.ReadTargets(runtime.Paths.GameExe).Any(r=>r.id==t.id && r.name==t.name))
            throw new InvalidDataException("The selected target is missing from this verified native catalog.");
        if(production && candidate.Roster is { } roster){
            var rows=VanillaCatalog.ReadTargets(runtime.Paths.GameExe);
            if(roster.Any(t=>!rows.Any(r=>r.id==t.id && r.name==t.name)))throw new InvalidDataException("A mixed target differs from the verified native catalog.");
        }
        InitializeRoot();
        string id = nextId(), folder = SessionRoot(id);
        if (Directory.Exists(folder) || File.Exists(folder)) throw new IOException("Test destination already exists; nothing will be overwritten.");
        // Claim is CreateNew and is never reused, including after an interrupted/failed preparation.
        WriteNew(Path.Combine(root, id + ".claim"), []); Directory.CreateDirectory(folder); GameRuntime.SafePath(folder);
        string? template = current == null ? null : Path.Combine(SessionRoot(current.Id), "profile", "coe5config");
        current = new Session { ExtenderVersion = runtime.ExtenderVersion, SourceName = OriginName(payload), PreparedUtc = DateTime.UtcNow, Id = id, ModId = candidate.ModId, Spell = candidate.SpellName, Target=candidate.Target, Roster=candidate.Roster, WeaponEditing = candidate.WeaponEditing, OriginalRecord = candidate.OriginalRecord, PrivateMelee = candidate.PrivateMelee, PrivateRanged=candidate.PrivateRanged, Revision = GameRuntime.TextHash(candidate.Mode + "\0" + candidate.Source) };
        try
        {
            Directory.CreateDirectory(Path.Combine(folder, "runtime")); Directory.CreateDirectory(Path.Combine(folder, "profile", "mods"));
            foreach (var entry in runtime.Sources)
            {
                string target = Path.Combine(folder, entry.Key); Directory.CreateDirectory(Path.GetDirectoryName(target)!);
                WriteNew(target, File.ReadAllBytes(entry.Value));
            }
            byte[] zip = TestPackage.Build(candidate.ModId, candidate.Files); WriteNew(Path.Combine(folder, "prepared.test.zip"), zip);
            using (var archive = new ZipArchive(new MemoryStream(zip), ZipArchiveMode.Read))
                foreach (var entry in archive.Entries)
                {
                    // Paths have already passed the exact filename whitelist in TestPackage.Build.
                    string target = Path.GetFullPath(Path.Combine(folder, "profile", "mods", entry.FullName));
                    if (!target.StartsWith(Path.Combine(folder, "profile", "mods") + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)) throw new IOException("Unsafe test path.");
                    Directory.CreateDirectory(Path.GetDirectoryName(target)!); using var bytes = new MemoryStream(); using var input = entry.Open(); input.CopyTo(bytes); WriteNew(target, bytes.ToArray());
                }
            WriteNew(Path.Combine(folder, "candidate.json"), LocalFiles.Utf8.GetBytes(payload.GetRawText()));
            WriteNew(Path.Combine(folder, "runtime-paths.json"), LocalFiles.Utf8.GetBytes(JsonSerializer.Serialize(runtime.Paths, Json)));
            if (template != null && File.Exists(template))
                WriteNew(Path.Combine(folder, "profile", "coe5config"), ConfigForTest(template, candidate.ModId));
            foreach (string p in Directory.EnumerateFiles(folder, "*", SearchOption.AllDirectories))
                if (p.Contains(Path.DirectorySeparatorChar + "runtime" + Path.DirectorySeparatorChar) || p.Contains(Path.DirectorySeparatorChar + "mods" + Path.DirectorySeparatorChar)) current.Hashes.Add(Path.GetRelativePath(folder, p), GameRuntime.Hash(p));
            Save(); SaveOwned(Path.Combine(root, "last-session.txt"), id);
            return Status()!;
        }
        catch (Exception e) { current.Status = "preparation-failed"; current.Error = e.Message; Save(); SaveOwned(Path.Combine(root, "last-session.txt"), id); throw new IOException("Preparation failed; files retained for inspection in " + folder + ". " + e.Message, e); }
    }
    internal void Invalidate(string id)
    {
        if (current?.Id != id) return; current.Stale = true; Save();
    }
    internal object Start(string id, string revision) => StartCore(id, revision, false);
    internal object StartPrepared(string id, string revision) => StartCore(id, revision, true);
    private object StartCore(string id, string revision, bool resume)
    {
        Refresh(); // Persist the previous owned child's exit before binding another saved test.
        if (!resume && (current == null || current.Id != id || current.Revision != revision || current.Stale || current.Status == "preparation-failed")) throw new InvalidDataException("This preparation is stale or unavailable. Regenerate it from the current draft.");
        using var mutex = new Mutex(false, "Local\\CoE5Workbench.IsolatedLaunch"); bool locked;
        try { locked = mutex.WaitOne(0); } catch (AbandonedMutexException) { locked = true; }
        if (!locked) throw new IOException("Another workbench is starting a game. No launch performed.");
        string folder = SessionRoot(id);
        bool validated = false;
        try
        {
            if (resume)
            {
                var retained = ReadPrepared(id);
                RequireResumable(retained);
                if (retained.Revision != revision) throw new IOException("Session identity changed. Refresh Prepared tests.");
                _ = ValidatePrepared(retained, revision);
                if (processes.AnyGameRunning()) throw new IOException("A CoE5 session is already running. Quit it yourself first. No process was closed.");
                // Bind only on explicit launch; never load or replace the editor draft.
                current = retained; owned = null;
            }
            if (processes.AnyGameRunning()) throw new IOException("A CoE5 session is already running. Quit it yourself first. No process was closed.");
            var (runtime, candidate) = ValidatePrepared(current!, revision);
            validated = true;
            Session active = current!;
            string config = Path.Combine(folder, "profile", "coe5config"); bool bootstrap = !File.Exists(config);
            if (!bootstrap)
            {
                byte[] bytes = ConfigForTest(config, active.ModId);
                WriteNew(Path.Combine(folder, "config-before-" + Guid.NewGuid().ToString("N") + ".bin"), File.ReadAllBytes(config));
                string temp = config + "." + Guid.NewGuid().ToString("N") + ".tmp"; WriteNew(temp, bytes); File.Move(temp, config, true);
            }
            string history = Path.Combine(folder, "previous-logs", Guid.NewGuid().ToString("N"));
            foreach (string name in GameRuntime.LogRelativePaths(GameRuntime.SessionVersion(active)))
            {
                string previous = Path.Combine(folder, "runtime", name);
                if (File.Exists(previous)) { GameRuntime.SafePath(previous); GameRuntime.SafePath(history); string backup = Path.Combine(history, name); Directory.CreateDirectory(Path.GetDirectoryName(backup)!); WriteNew(backup, File.ReadAllBytes(previous)); }
            }
            if (!bootstrap && (candidate.WeaponEditing || candidate.OriginalRecord || candidate.PrivateMelee || candidate.PrivateRanged))
            {
                active.ResultRun = Guid.NewGuid().ToString("N");
                string area = TestExchange.Area(folder, candidate.ModId); Directory.CreateDirectory(area);
                SaveOwned(Path.Combine(area, "workbench-session.ini"), TestExchange.ContextText(active, candidate));
            }
            var start = new ProcessStartInfo(Path.Combine(folder, "runtime", "CoE5.exe")) { UseShellExecute = false, WorkingDirectory = Path.Combine(folder, "runtime") };
            foreach (string arg in new[] { "-w", "--winres=1100*800", "--nofade", "--nogamepad", "-d" }) start.ArgumentList.Add(arg);
            if (bootstrap) start.ArgumentList.Add("--nomods");
            start.Environment["COE5_SAVE"] = Path.Combine(folder, "profile"); start.Environment["COE5_DATA"] = runtime.Data;
            // No Start call exists on the preparation/status paths. Only this explicit bridge action launches.
            owned = processes.Start(start); active.Pid = owned.Id; active.StartUtc = owned.StartUtc; active.Status = "running"; active.Error = null; active.Observation = null;
            WriteNew(Path.Combine(folder, "launch-" + Guid.NewGuid().ToString("N") + ".json"), LocalFiles.Utf8.GetBytes(JsonSerializer.Serialize(new { pid = owned.Id, startUtc = owned.StartUtc, executable = start.FileName, profile = start.Environment["COE5_SAVE"], data = runtime.Data, bootstrap, spell = active.Spell, revision }, Json)));
            Save(); if (resume) SaveOwned(Path.Combine(root, "last-session.txt"), id); return Status()!;
        }
        catch (Exception e)
        {
            if (validated && current != null) { if (current.Status != "running") current.Status = "launch-failed"; current.Error = e.Message; Save(); SaveOwned(Path.Combine(folder, "last-error.txt"), e.ToString()); } throw;
        }
        finally { mutex.ReleaseMutex(); }
    }
    private (RuntimeIdentity runtime, TestCandidate candidate) ValidatePrepared(Session session, string revision)
    {
        string folder = SessionRoot(session.Id);
        CheckReviewRoot();
        var paths = JsonSerializer.Deserialize<RuntimePaths>(LocalFiles.ReadText(Path.Combine(folder, "runtime-paths.json"), 16384))!;
        RuntimeIdentity runtime;
        try { runtime = verify(paths); }
        catch (Exception e) { throw new InvalidDataException("Runtime incompatible or unavailable: " + e.Message, e); }
        if(GameRuntime.SessionVersion(session)!=runtime.ExtenderVersion)throw new InvalidDataException("Runtime incompatible: this preparation belongs to CoE5SE " + GameRuntime.SessionVersion(session) + ". It cannot be migrated or silently switched.");
        var profileDirectories = new Stack<string>(); profileDirectories.Push(Path.Combine(folder, "profile")); profileDirectories.Push(Path.Combine(folder, "runtime")); int checkedDirectories = 0;
        while (profileDirectories.TryPop(out string? profileDir))
        {
            if (++checkedDirectories > 1024) throw new IOException("The disposable profile contains too many directories. Prepare a fresh session.");
            GameRuntime.SafePath(profileDir); foreach (string file in Directory.GetFiles(profileDir)) GameRuntime.SafePath(file); foreach (string child in Directory.GetDirectories(profileDir)) profileDirectories.Push(child);
        }
        foreach (var item in session.Hashes)
        {
            string target = Path.GetFullPath(Path.Combine(folder, item.Key)); GameRuntime.SafePath(target);
            if (!target.StartsWith(folder + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase) || GameRuntime.Hash(target) != item.Value) throw new IOException("Prepared files changed. Regenerate the isolated test.");
        }
        // Production hashes are independent of the editable session manifest.
        if (production)
            foreach (var entry in LocalRosterRuntime.Expected(session.Roster!=null,runtime.ExtenderVersion)) if (GameRuntime.Hash(Path.Combine(folder, entry.Key)) != entry.Value) throw new IOException("Staged runtime fingerprint changed.");
        using var saved = JsonDocument.Parse(LocalFiles.ReadText(Path.Combine(folder, "candidate.json"), 2 * 1024 * 1024));
        var candidate = TestCandidate.Read(saved.RootElement);
        if(candidate.ExtenderVersion!=runtime.ExtenderVersion)throw new IOException("Prepared runtime contract differs. Prepare a fresh session for the selected version.");
        if(candidate.WeaponEditing!=session.WeaponEditing || candidate.PrivateRanged!=session.PrivateRanged || candidate.PrivateMelee!=session.PrivateMelee || candidate.OriginalRecord!=session.OriginalRecord || candidate.Target!=session.Target || !(candidate.Roster??[]).SequenceEqual(session.Roster??[])) throw new IOException("Session mode or target identity changed.");
        if (GameRuntime.TextHash(candidate.Mode + "\0" + candidate.Source) != revision || candidate.ModId != session.ModId || candidate.SpellName != session.Spell) throw new IOException("Prepared draft fingerprint changed.");
        var allowed = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var entry in LocalRosterRuntime.Expected(session.Roster!=null,runtime.ExtenderVersion).Where(x => x.Key.StartsWith("profile/", StringComparison.Ordinal))) allowed[Path.GetFullPath(Path.Combine(folder, entry.Key))] = production ? entry.Value : GameRuntime.Hash(Path.Combine(folder, entry.Key));
        using (var zip = new ZipArchive(new MemoryStream(TestPackage.Build(candidate.ModId, candidate.Files)), ZipArchiveMode.Read))
            foreach (var entry in zip.Entries)
            {
                string target = Path.GetFullPath(Path.Combine(folder, "profile", "mods", entry.FullName));
                using var input = entry.Open(); using var content = new MemoryStream(); input.CopyTo(content);
                string hash = Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(content.ToArray())).ToLowerInvariant();
                allowed[target] = hash;
                if (GameRuntime.Hash(target) != hash) throw new IOException("The staged helper or definition changed. Regenerate the test.");
            }
        string mods = Path.Combine(folder, "profile", "mods");
        var modDirectories = Directory.GetDirectories(mods);
        if (modDirectories.Length != 2 || modDirectories.Any(p => Path.GetFileName(p) != "CoE5SE" && Path.GetFileName(p) != candidate.ModId)) throw new IOException("Unexpected mod folder in the isolated profile.");
        foreach (string directory in modDirectories)
        {
            GameRuntime.SafePath(directory);
            if (Directory.GetDirectories(directory).Length != 0) throw new IOException("Unexpected nested test-mod folder.");
            foreach (string file in Directory.GetFiles(directory))
            {
                GameRuntime.SafePath(file);
                if (!allowed.ContainsKey(file) || GameRuntime.Hash(file) != allowed[file]) throw new IOException("Unexpected or changed isolated mod file.");
            }
        }
        foreach (string binary in Directory.GetFiles(Path.Combine(folder, "runtime")).Where(p => Path.GetExtension(p).ToLowerInvariant() is ".dll" or ".exe"))
            if (!GameRuntime.KnownFiles.Keys.Any(p => string.Equals(Path.GetFullPath(Path.Combine(folder, p)), binary, StringComparison.OrdinalIgnoreCase))) throw new IOException("Unexpected runtime binary.");
        return (runtime, candidate);
    }
    // Native version 129 config: official coe5config.h defines list offset 48 and XOR key 0x4f.
    // Preserve only settings from an app-owned disposable profile; replace the entire mod-name list.
    internal static byte[] ConfigForTest(string path, string modId)
    {
        GameRuntime.SafePath(path); byte[] input = File.ReadAllBytes(path);
        if (input.Length is < 49 or > 65536 || BitConverter.ToInt32(input, 0) != 129) throw new InvalidDataException("Unrecognized disposable config format. Prepare a fresh profile instead.");
        int pos = 48;
        while (pos < input.Length)
        {
            int end = Array.IndexOf(input, (byte)0x4f, pos); if (end < 0) throw new InvalidDataException("Incomplete disposable mod list.");
            if (end == pos) { pos = end + 1; break; } pos = end + 1;
        }
        if (pos >= input.Length) throw new InvalidDataException("Incomplete disposable config settings.");
        using var result = new MemoryStream(); result.Write(input, 0, 48);
        foreach (string mod in new[] { "CoE5SE", modId }) { foreach (byte b in LocalFiles.Utf8.GetBytes(mod)) result.WriteByte((byte)(b ^ 0x4f)); result.WriteByte(0x4f); }
        result.WriteByte(0x4f); result.Write(input, pos, input.Length - pos); return result.ToArray();
    }
    internal string Folder(string id) { if (current?.Id != id) throw new InvalidDataException("No current test session."); return SessionRoot(id); }
    internal object ReturnSessions()
    {
        Refresh();
        if (!Directory.Exists(root)) return Array.Empty<object>();
        CheckReviewRoot(); var rows = new List<object>();
        foreach (string folder in Directory.EnumerateDirectories(root).Where(p => Regex.IsMatch(Path.GetFileName(p), "^[a-f0-9]{32}\\z")))
        {
            if (rows.Count >= 1024) throw new IOException("Too many retained sessions to list.");
            try
            {
                GameRuntime.SafePath(folder);
                string record = Path.Combine(folder, "session.json"); GameRuntime.SafePath(record);
                var s = JsonSerializer.Deserialize<Session>(LocalFiles.ReadText(record, 256 * 1024));
                if (s != null && s.Id == Path.GetFileName(folder) && s.WeaponEditing){
                    string packet=Path.Combine(folder,"candidate.json");GameRuntime.SafePath(packet);
                    using var doc=JsonDocument.Parse(LocalFiles.ReadText(packet,2*1024*1024));var candidate=TestCandidate.ReadForReview(doc.RootElement);
                    if(candidate.ExtenderVersion!=GameRuntime.SessionVersion(s)||!candidate.WeaponEditing||candidate.ModId!=s.ModId||candidate.SpellName!=s.Spell||s.Revision!=GameRuntime.TextHash(candidate.Mode+"\0"+candidate.Source))continue;
                    using var manifest=JsonDocument.Parse(candidate.Files["manifest.json"]);
                    bool hasResult=false;DateTime? saved=null;
                    if(s.ResultRun!=null){string path=TestExchange.ResultPath(folder,s);GameRuntime.SafePath(path);hasResult=File.Exists(path);if(hasResult)saved=File.GetLastWriteTimeUtc(path);}
                    rows.Add(new {id=s.Id,runtime=GameRuntime.LabelFor(candidate.ExtenderVersion),spell=s.Spell,target=candidate.Target,roster=candidate.Roster,rangedComparison=candidate.ComparisonBaseline!=null,weapon=candidate.ComparisonBaseline!=null?manifest.RootElement.GetProperty("weapon").GetString():manifest.RootElement.GetProperty("definitions").GetProperty("weaponName").GetString(),mode=candidate.Mode,revision=s.Revision,run=s.ResultRun,status=s.Status,started=s.StartUtc,saved,hasResult,stale=s.Stale});
                }
            }
            catch (Exception e) when (e is IOException or JsonException or InvalidDataException or System.Text.DecoderFallbackException or UnauthorizedAccessException or KeyNotFoundException or InvalidOperationException or FormatException or OverflowException) { /* A broken session is not offered as trusted context. */ }
        }
        return rows;
    }
    private void CheckReviewRoot()
    {
        GameRuntime.SafePath(root);
        string marker = Path.Combine(root, ".workbench-tests-owner"); GameRuntime.SafePath(marker);
        if (LocalFiles.ReadText(marker, 128) != "CoE5Workbench isolated tests v1") throw new IOException("Unrecognized test storage ownership.");
    }
    private (Session session, TestCandidate candidate, string folder) ReviewSession(string id)
    {
        CheckReviewRoot(); string folder = SessionRoot(id);
        string record = Path.Combine(folder, "session.json"), packet = Path.Combine(folder, "candidate.json"); GameRuntime.SafePath(record); GameRuntime.SafePath(packet);
        var session = JsonSerializer.Deserialize<Session>(LocalFiles.ReadText(record, 256 * 1024)) ?? throw new IOException("Session record is missing.");
        if (session.Id != id || session.Status != "exited" || !session.WeaponEditing) throw new InvalidDataException("Exit the weapon-editing test and refresh its status before returning values.");
        using var doc = JsonDocument.Parse(LocalFiles.ReadText(packet, 2 * 1024 * 1024));
        var candidate = TestCandidate.ReadForReview(doc.RootElement);
        if (!candidate.WeaponEditing || candidate.ModId != session.ModId || candidate.SpellName != session.Spell || session.Revision != GameRuntime.TextHash(candidate.Mode + "\0" + candidate.Source)) throw new InvalidDataException("Session, weapon or prepared source identity differs.");
        foreach (var file in candidate.Files)
        {
            string path = Path.Combine(folder, "profile", "mods", candidate.ModId, file.Key); GameRuntime.SafePath(path);
            if (LocalFiles.ReadText(path, 128 * 1024) != file.Value) throw new InvalidDataException("Retained test files changed; result association is unavailable.");
        }
        if(candidate.ExtenderVersion!=GameRuntime.SessionVersion(session))throw new InvalidDataException("Retained result/runtime version differs.");
        if (production) foreach (var file in LocalRosterRuntime.Expected(candidate.Roster!=null,candidate.ExtenderVersion))
        {
            string path = Path.Combine(folder, file.Key); GameRuntime.SafePath(path);
            if (GameRuntime.Hash(path) != file.Value) throw new InvalidDataException("Retained runtime fingerprints changed.");
        }
        return (session, candidate, folder);
    }
    internal object ReturnValues(string id)
    {
        var r = ReviewSession(id); return TestExchange.Results(r.folder, r.session, r.candidate);
    }
    internal object RuntimeChoices(string id)
    {
        var r = ReviewSession(id); if(r.candidate.ComparisonBaseline!=null) throw new InvalidDataException("The ranged comparison exports battle readbacks only."); return TestExchange.Catalog(r.folder, r.session, r.candidate);
    }
    internal object MixedObservation(string id)
    {
        string folder=SessionRoot(id);
        var saved=JsonSerializer.Deserialize<Session>(LocalFiles.ReadText(Path.Combine(folder,"session.json"),256*1024))!;
        if(saved.Id!=id)throw new InvalidDataException("Session identity differs.");
        var candidate=TestCandidate.ReadForReview(JsonSerializer.Deserialize<JsonElement>(LocalFiles.ReadText(Path.Combine(folder,"candidate.json"),2*1024*1024)));
        if(candidate.ExtenderVersion!=GameRuntime.SessionVersion(saved))throw new InvalidDataException("Mixed observation/runtime version differs.");
        if(production)foreach(var file in LocalRosterRuntime.Expected(true,candidate.ExtenderVersion)){
            string path=Path.Combine(folder,file.Key);GameRuntime.SafePath(path);
            if(GameRuntime.Hash(path)!=file.Value)throw new InvalidDataException("Retained mixed runtime fingerprints changed.");
        }
        return GameRuntime.OfficialGroups(candidate.ExtenderVersion)?OfficialMixedResults.Read(folder,saved,candidate):MixedResults.Read(folder,saved,candidate);
    }
    internal object Observe(string id, string outcome, string note)
    {
        Refresh(); if (current?.Id != id || current.Status != "exited") throw new InvalidDataException("Exit the isolated game before recording your observation.");
        if (outcome is not "expected" and not "error" and not "unclear" || note.Length > 2000 || note.Contains('\0')) throw new InvalidDataException("Choose an observation and use at most 2,000 characters.");
        WriteNew(Path.Combine(Folder(id), "observation-" + Guid.NewGuid().ToString("N") + ".json"), LocalFiles.Utf8.GetBytes(JsonSerializer.Serialize(new { reportedAtUtc = DateTime.UtcNow, pid = current.Pid, startUtc = current.StartUtc, revision = current.Revision, outcome, note, source = "user report, not automated gameplay verification" }, Json)));
        current.Observation = outcome; Save(); return Status()!;
    }
}
