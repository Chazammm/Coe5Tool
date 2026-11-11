using System.Diagnostics;
using System.IO;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace CoE5Workbench;

internal static class IsolatedTestsSelfTest
{
    private sealed class FakeProcess : ITestProcess
    {
        public int Id => 424242;
        public DateTime StartUtc { get; } = DateTime.UtcNow;
        public bool HasExited { get; set; }
        public int? ExitCode => HasExited ? 0 : null;
    }
    private sealed class FakeProcesses : ITestProcesses
    {
        internal bool Conflict, FailStart, OwnershipMatches = true;
        internal int Starts, Finds;
        internal ProcessStartInfo? LastStart;
        internal readonly FakeProcess Process = new();
        public bool AnyGameRunning() => Conflict || Starts > 0 && !Process.HasExited;
        public ITestProcess Start(ProcessStartInfo start) { if (FailStart) throw new IOException("Substitute launch failure"); Starts++; LastStart = start; return Process; }
        public ITestProcess? FindOwned(int id, DateTime start, string exe) { Finds++; return OwnershipMatches && id == Process.Id && start == Process.StartUtc && !Process.HasExited ? Process : null; }
    }
    internal static void Run(string reportFile, Action<string, Action> check)
    {
        void Require(bool yes) { if (!yes) throw new Exception("Assertion failed"); }
        void Refused(Action action) { try { action(); } catch { return; } throw new Exception("Expected refusal"); }
        string baseRoot = Path.Combine(Path.GetDirectoryName(Path.GetFullPath(reportFile))!, "isolated-native-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(baseRoot);
        string packet = Path.Combine(Path.GetDirectoryName(Path.GetFullPath(reportFile))!, "isolated-package-input.json");
        using var json = JsonDocument.Parse(File.ReadAllText(packet)); var payload = json.RootElement;
        var candidate = TestCandidate.Read(payload);
        string source = Path.Combine(baseRoot, "substitute-sources"); Directory.CreateDirectory(source);
        var sources = new Dictionary<string, string>();
        foreach (string relative in GameRuntime.KnownFiles.Keys)
        {
            string p = Path.Combine(source, relative.Replace('/', '_')); File.WriteAllText(p, "substitute " + relative); sources.Add(relative, p);
        }
        string assets = Path.Combine(source, "data"); Directory.CreateDirectory(assets);
        RuntimeIdentity Verify(RuntimePaths p) => new(p, assets, sources);
        RuntimePaths paths = new("not-executed-CoE5.exe", source);
        (IsolatedTests manager, FakeProcesses processes) Manager(string label, Func<string>? id = null)
        {
            var processes = new FakeProcesses(); var manager = new IsolatedTests(Path.Combine(baseRoot, label), processes, Verify, id); manager.Configure(paths); return (manager, processes);
        }
        JsonElement View(object? o) => JsonSerializer.SerializeToElement(o);
        (string id, string revision, string folder) Prepare(IsolatedTests m)
        {
            var view = View(m.Prepare(payload)); return (view.GetProperty("id").GetString()!, view.GetProperty("revision").GetString()!, view.GetProperty("folder").GetString()!);
        }
        string originalInput=Path.Combine(Path.GetDirectoryName(Path.GetFullPath(reportFile))!,"original-candidate-input.json");
        if(File.Exists(originalInput))check("Original observation reader refuses unfinished, mismatched launch bindings and changed helpers without writing sessions",()=>{
            using var originalDoc=JsonDocument.Parse(File.ReadAllText(originalInput));var original=TestCandidate.Read(originalDoc.RootElement);
            var (m,p)=Manager("original-summary");var view=View(m.Prepare(originalDoc.RootElement));string id=view.GetProperty("id").GetString()!,revision=view.GetProperty("revision").GetString()!,folder=view.GetProperty("folder").GetString()!;
            Refused(()=>m.OriginalObservation(id));byte[] config=new byte[55];BitConverter.GetBytes(129).CopyTo(config,0);config[48]=0x4f;config[49]=7;File.WriteAllBytes(Path.Combine(folder,"profile","coe5config"),config);
            m.Start(id,revision);Refused(()=>m.OriginalObservation(id));p.Process.HasExited=true;_=m.Status();
            var s=JsonSerializer.Deserialize<IsolatedTests.Session>(File.ReadAllText(Path.Combine(folder,"session.json")))!;Require(!View(m.OriginalObservation(id)).GetProperty("available").GetBoolean());
            string result=Path.Combine(TestExchange.Area(folder,s.ModId),"wb-original-"+s.ResultRun+".ini"),ini="[meta]\nschema=wb-original-1\nsession="+id+"\nrevision="+revision+"\nrun="+s.ResultRun+"\nmod="+s.ModId+"\nkind=spell\nrequested=Fireball\nrequestedid=445\nforcedcasts=0\nstage=cancelled\nbattles=0\nstops=0\n";
            File.WriteAllText(result,ini);string record=File.ReadAllText(Path.Combine(folder,"session.json"));Require(View(m.OriginalObservation(id)).GetProperty("stage").GetString()=="cancelled");Require(record==File.ReadAllText(Path.Combine(folder,"session.json")));
            string context=Path.Combine(TestExchange.Area(folder,s.ModId),"workbench-session.ini"),before=File.ReadAllText(context);File.WriteAllText(context,before.Replace("run="+s.ResultRun,"run="+new string('d',32)));Refused(()=>m.OriginalObservation(id));File.WriteAllText(context,before);
            string helper=Path.Combine(folder,"profile","mods",s.ModId,s.ModId+".lua");File.AppendAllText(helper,"\nchanged");Refused(()=>m.OriginalObservation(id));Refused(()=>m.OriginalObservation("../outside"));Require(record==File.ReadAllText(Path.Combine(folder,"session.json")));
        });
        check("Isolated preparation uses canonical current draft, fresh paths and never starts a process", () => {
            var (m, p) = Manager("prepare"); var s = Prepare(m); Require(p.Starts == 0);
            Require(File.ReadAllText(Path.Combine(s.folder, "profile", "mods", candidate.ModId, candidate.ModId + ".lua")) == candidate.Files[candidate.ModId + ".lua"]);
            Require(!File.Exists(Path.Combine(s.folder, "profile", "coe5config")));
        });
        check("Restart lists and checks an unused preparation without changing files or last-session binding", () => {
            var (m,p)=Manager("resume-readonly");var a=Prepare(m);var b=Prepare(m);
            string record=File.ReadAllText(Path.Combine(a.folder,"session.json")),pointer=File.ReadAllText(Path.Combine(baseRoot,"resume-readonly","last-session.txt"));
            var reopened=new IsolatedTests(Path.Combine(baseRoot,"resume-readonly"),p,Verify);
            Require(View(reopened.PreparedSessions()).GetArrayLength()==2);
            Require(View(reopened.CheckPrepared(a.id)).GetProperty("ready").GetBoolean());
            Require(File.ReadAllText(Path.Combine(a.folder,"session.json"))==record && File.ReadAllText(Path.Combine(baseRoot,"resume-readonly","last-session.txt"))==pointer && p.Starts==0);
            reopened.StartPrepared(a.id,a.revision);Require(p.Starts==1 && p.LastStart!.Environment["COE5_SAVE"]==Path.Combine(a.folder,"profile"));
            Require(File.ReadAllText(Path.Combine(b.folder,"session.json")).Contains("prepared"));
        });
        check("Resumed child exit is persisted by preparation/result lists and before another saved launch",()=>{
            foreach(string route in new[]{"prepared","results","next-launch"}){
                var(m,p)=Manager("resume-exit-"+route);var first=Prepare(m);var second=Prepare(m);
                m.StartPrepared(first.id,first.revision);
                // While the owned child runs, listing must not mark it as exited.
                _=m.PreparedSessions();_=m.ReturnSessions();
                Require(JsonSerializer.Deserialize<IsolatedTests.Session>(File.ReadAllText(Path.Combine(first.folder,"session.json")))!.Status=="running");
                p.Process.HasExited=true;
                if(route=="prepared")_=m.PreparedSessions();
                else if(route=="results")_=m.ReturnSessions();
                else m.StartPrepared(second.id,second.revision);
                var saved=JsonSerializer.Deserialize<IsolatedTests.Session>(File.ReadAllText(Path.Combine(first.folder,"session.json")))!;
                Require(saved.Status=="exited" && saved.ExitCode==0);
                Refused(()=>m.StartPrepared(first.id,first.revision));
            }
        });
        check("Resume rechecks changed helpers, stale state, identity and active processes after a successful inspection",()=>{
            foreach(string kind in new[]{"helper","stale","identity","process","mode","unexpected"}){
                var(m,p)=Manager("resume-race-"+kind);var s=Prepare(m);Require(View(m.CheckPrepared(s.id)).GetProperty("ready").GetBoolean());
                if(kind=="helper")File.AppendAllText(Path.Combine(s.folder,"profile","mods",candidate.ModId,candidate.ModId+".lua"),"tampered");
                if(kind=="stale")m.Invalidate(s.id);
                if(kind=="process")p.Conflict=true;
                if(kind=="unexpected")File.WriteAllText(Path.Combine(s.folder,"runtime","unexpected.dll"),"not allowed");
                if(kind is "identity" or "mode"){string path=Path.Combine(s.folder,"session.json");var node=JsonNode.Parse(File.ReadAllText(path))!;if(kind=="identity")node["Id"]=new string('f',32);else node["PrivateMelee"]=true;File.WriteAllText(path,node.ToJsonString());}
                Refused(()=>m.StartPrepared(s.id,s.revision));Require(p.Starts==0);
            }
        });
        check("Resume refuses used, failed and incomplete sessions while listing honest reasons",()=>{
            foreach(string kind in new[]{"used","failed","incomplete"}){
                var(m,p)=Manager("resume-refuse-"+kind);var s=Prepare(m);string path=Path.Combine(s.folder,"session.json");var node=JsonNode.Parse(File.ReadAllText(path))!;
                if(kind=="used"){node["Pid"]=123;node["Status"]="exited";node["StartUtc"]=DateTime.UtcNow;}
                if(kind=="failed")node["Status"]="preparation-failed";
                if(kind=="incomplete")node["Hashes"]=new JsonObject();File.WriteAllText(path,node.ToJsonString());
                string retained=File.ReadAllText(path);Require(!View(m.CheckPrepared(s.id)).GetProperty("ready").GetBoolean());Require(View(m.PreparedSessions()).GetArrayLength()==1);Require(m.PreparedFolder(s.id)==s.folder);
                Refused(()=>m.StartPrepared(s.id,s.revision));Require(p.Starts==0 && File.ReadAllText(path)==retained);
            }
        });
        check("Resume revalidates configured runtime and root ownership, without changing the retained session",()=>{
            var(m,p)=Manager("resume-runtime");var s=Prepare(m);bool available=true;
            RuntimeIdentity Toggle(RuntimePaths paths){if(!available)throw new IOException("Changed executable fingerprint");return Verify(paths);}
            var reopened=new IsolatedTests(Path.Combine(baseRoot,"resume-runtime"),p,Toggle);Require(View(reopened.CheckPrepared(s.id)).GetProperty("ready").GetBoolean());available=false;
            Require(View(reopened.CheckPrepared(s.id)).GetProperty("state").GetString()=="incompatible");Refused(()=>reopened.StartPrepared(s.id,s.revision));Require(p.Starts==0);
            File.WriteAllText(Path.Combine(baseRoot,"resume-runtime",".workbench-tests-owner"),"unowned");Refused(()=>m.PreparedSessions());Refused(()=>m.StartPrepared(s.id,s.revision));
        });
        check("Settings-only bootstrap can continue after a normal observed exit; an actual test cannot replay",()=>{
            var(m,p)=Manager("resume-bootstrap");var s=Prepare(m);m.StartPrepared(s.id,s.revision);
            Require(p.LastStart!.ArgumentList.Contains("--nomods"));p.Process.HasExited=true;_ = m.Status();
            byte[] cfg=new byte[55];BitConverter.GetBytes(129).CopyTo(cfg,0);cfg[48]=0x4f;cfg[49]=7;File.WriteAllBytes(Path.Combine(s.folder,"profile","coe5config"),cfg);
            var reopened=new IsolatedTests(Path.Combine(baseRoot,"resume-bootstrap"),p,Verify);Require(View(reopened.CheckPrepared(s.id)).GetProperty("ready").GetBoolean());
            reopened.StartPrepared(s.id,s.revision);Require(!p.LastStart!.ArgumentList.Contains("--nomods"));_ = reopened.Status();
            Require(!View(reopened.CheckPrepared(s.id)).GetProperty("ready").GetBoolean());Refused(()=>reopened.StartPrepared(s.id,s.revision));Require(p.Starts==2);
        });
        check("Previous 0.16.0 canonical helpers remain launch-compatible",()=>{
            foreach(string version in new[]{"0.16.0","0.16.1","0.17.0"}){using var older=JsonDocument.Parse(payload.GetRawText().Replace("0.17.0",version).Replace("0.16.1",version).Replace("0.16.0",version));Require(TestCandidate.Read(older.RootElement).Source==candidate.Source);}
        });
        check("Canonical validator refuses altered Lua, changed source and mismatched manifest", () => {
            foreach (string bad in new[] { payload.GetRawText().Replace("local hooks_ok = false", "local hooks_ok = true"), payload.GetRawText().Replace("range 6", "range 9"), payload.GetRawText().Replace("0.16.1", "0.7.0").Replace("0.16.0", "0.7.0").Replace("0.17.0", "0.7.0") })
            { using var altered = JsonDocument.Parse(bad); Refused(() => TestCandidate.Read(altered.RootElement)); }
        });
        if(payload.TryGetProperty("previousUiCandidate",out var previousUi))foreach(string version in new[]{"0.12.0","0.13.0"})check("Retained "+version+" canonical template remains review-only",()=>{
            using var previous=JsonDocument.Parse(previousUi.GetRawText().Replace("0.13.0",version));
            Require(TestCandidate.ReadForReview(previous.RootElement).Source==candidate.Source);Refused(()=>TestCandidate.Read(previous.RootElement));
        });
        if(payload.TryGetProperty("damageCandidates",out var damageCandidates)){
            var packets=new List<object>();
            foreach(var item in damageCandidates.EnumerateArray()){
                var damageInput=item.Clone();check("Documented payload candidate/result "+damageInput.GetProperty("mode").GetString()+" / case "+packets.Count,()=>{
                    var c=TestCandidate.Read(damageInput);using var manifest=JsonDocument.Parse(c.Files["manifest.json"]);var d=manifest.RootElement.GetProperty("definitions");int type=int.Parse(d.GetProperty("dmgtype").GetString()!);
                    var s=new IsolatedTests.Session{Id=new string('c',32),Revision=GameRuntime.TextHash(c.Mode+"\0"+c.Source),ResultRun=new string('d',32),ModId=c.ModId};
                    string folder=Path.Combine(baseRoot,"damage-"+packets.Count);Directory.CreateDirectory(TestExchange.Area(folder,c.ModId));
                    int selected=type<=10?type%10+1:type;
                    string ini="[meta]\nschema=wb-results-2\nsession="+s.Id+"\nrevision="+s.Revision+"\nrun="+s.ResultRun+"\nmod="+c.ModId+"\nspell="+c.SpellName+"\nweapon="+c.SpellName+"\nformat="+c.Mode+"\ncount=1\nbaselinelook=7\nbaselineflymode=2\nbaselineflylook=7\n[sample1]\nindex=1\npanel=1\nparameter=1\ndmgtype="+selected+"\naoe=1\nlook=7\nflymode=2\nflylook=7\ncasts=0\nreadback=1\nkind=applied\n";
                    string path=TestExchange.ResultPath(folder,s);File.WriteAllText(path,ini);var result=View(TestExchange.Results(folder,s,c));Require(result.GetProperty("samples").GetArrayLength()==1 && result.GetProperty("context").GetProperty("damagePolicy").GetString()=="documented-v1");packets.Add(result);
                    if(type>10){File.WriteAllText(path,ini.Replace("\ndmgtype="+selected,"\ndmgtype=3"));Require(View(TestExchange.Results(folder,s,c)).GetProperty("samples").GetArrayLength()==0);}
                });
            }
            File.WriteAllText(Path.Combine(Path.GetDirectoryName(reportFile)!,"damage-packets.json"),JsonSerializer.Serialize(packets));
            check("Native damage policy rejects manual types, unknown mask bits and invalid animation",()=>{
                foreach(int type in new[]{11,14,15,16,17,18,19,20,21,22,23,24})Refused(()=>DamageTypes.Payload(type,"999"));
                Refused(()=>DamageTypes.Payload(12,"131072"));Refused(()=>DamageTypes.Payload(13,"16384"));Refused(()=>DamageTypes.Payload(25,"3"));
            });
            check("Animation source cannot become a terrain-less isolated candidate",()=>{
                var altered=JsonNode.Parse(damageCandidates[0].GetRawText())!;
                foreach(var file in altered["files"]!.AsArray())if(file!["name"]!.GetValue<string>()=="manifest.json"){
                    var manifest=JsonNode.Parse(file["text"]!.GetValue<string>())!;manifest["definitions"]!["dmgtype"]="25";file["text"]=manifest.ToJsonString();
                }
                try{TestCandidate.Read(JsonSerializer.SerializeToElement(altered));throw new Exception("Unsafe animation candidate accepted.");}
                catch(InvalidDataException e){Require(e.Message.Contains("terrain-target"));}
            });
        }
        check("Existing directories and duplicate session identity are never overwritten", () => {
            string unowned = Path.Combine(baseRoot, "unowned"); Directory.CreateDirectory(unowned); File.WriteAllText(Path.Combine(unowned, "keep.txt"), "keep");
            Refused(() => new IsolatedTests(unowned, new FakeProcesses(), Verify).Configure(paths)); Require(File.ReadAllText(Path.Combine(unowned, "keep.txt")) == "keep");
            var (m, _) = Manager("collision", () => new string('a', 32)); var s = Prepare(m); string manifest = File.ReadAllText(Path.Combine(s.folder, "session.json")); Refused(() => m.Prepare(payload)); Require(File.ReadAllText(Path.Combine(s.folder, "session.json")) == manifest);
        });
        check("Stale revision and explicit invalidation prevent launch", () => {
            var (m, p) = Manager("stale"); var s = Prepare(m); Refused(() => m.Start(s.id, "wrong")); m.Invalidate(s.id); Refused(() => m.Start(s.id, s.revision)); Require(p.Starts == 0);
        });
        check("External game conflict refuses launch without controlling any process", () => {
            var (m, p) = Manager("conflict"); var s = Prepare(m); p.Conflict = true; Refused(() => m.Start(s.id, s.revision)); Require(p.Starts == 0);
        });
        check("Prepared helper and unexpected files are rechecked before launch", () => {
            var (m, p) = Manager("tamper"); var s = Prepare(m); File.AppendAllText(Path.Combine(s.folder, "profile", "mods", candidate.ModId, candidate.ModId + ".lua"), "\nerror('tampered')"); Refused(() => m.Start(s.id, s.revision)); Require(p.Starts == 0);
            var (extra, proc) = Manager("extra"); var x = Prepare(extra); File.WriteAllText(Path.Combine(x.folder, "profile", "mods", candidate.ModId, "extra.lua"), "bad"); Refused(() => extra.Start(x.id, x.revision)); Require(proc.Starts == 0);
        });
        check("Only explicit start supplies process-local environment and records owned PID", () => {
            var (m, p) = Manager("start"); var s = Prepare(m); string? beforeSave = Environment.GetEnvironmentVariable("COE5_SAVE"); m.Start(s.id, s.revision);
            var start = p.LastStart ?? throw new Exception("No substitute start captured");
            Require(p.Starts == 1 && start.FileName == Path.Combine(s.folder, "runtime", "CoE5.exe")); Require(start.Environment["COE5_SAVE"] == Path.Combine(s.folder, "profile") && start.Environment["COE5_DATA"] == assets);
            Require(start.ArgumentList.Contains("--nomods") && Environment.GetEnvironmentVariable("COE5_SAVE") == beforeSave); Require(View(m.Status()).GetProperty("status").GetString() == "running"); Refused(() => m.Start(s.id, s.revision)); Require(p.Starts == 1);
        });
        check("Failed launch retains diagnostics and never records gameplay observation", () => {
            var (m, p) = Manager("failure"); var s = Prepare(m); p.FailStart = true; Refused(() => m.Start(s.id, s.revision)); var view = View(m.Status()); Require(view.GetProperty("status").GetString() == "launch-failed" && view.GetProperty("observation").ValueKind == JsonValueKind.Null); Require(File.Exists(Path.Combine(s.folder, "last-error.txt")));
        });
        check("Unfinished session is recovered by PID plus start time and exit is not gameplay success", () => {
            var (m, p) = Manager("recovery"); var s = Prepare(m); m.Start(s.id, s.revision); var reopened = new IsolatedTests(Path.Combine(baseRoot, "recovery"), p, Verify); Require(reopened.Running && p.Finds == 1); p.Process.HasExited = true; var view = View(reopened.Status()); Require(view.GetProperty("status").GetString() == "exited" && view.GetProperty("observation").ValueKind == JsonValueKind.Null);
            reopened.Observe(s.id, "expected", "User reported a projectile"); Require(File.ReadAllText(Directory.GetFiles(s.folder, "observation-*.json").Single()).Contains("user report"));
        });
        check("Owned config list replacement retains settings and refuses unknown formats", () => {
            string cfg = Path.Combine(baseRoot, "config"); byte[] b = new byte[55]; BitConverter.GetBytes(129).CopyTo(b, 0); b[48] = 0x4f; b[49] = 7; File.WriteAllBytes(cfg, b);
            byte[] rewritten = IsolatedTests.ConfigForTest(cfg, candidate.ModId); Require(rewritten.Take(48).SequenceEqual(b.Take(48)) && rewritten[^6] == 7); Require(File.ReadAllBytes(cfg).SequenceEqual(b));
            BitConverter.GetBytes(130).CopyTo(b, 0); File.WriteAllBytes(cfg, b); Refused(() => IsolatedTests.ConfigForTest(cfg, candidate.ModId));
        });
        check("Repeated explicit starts preserve prior logs and separate reported observations", () => {
            var (m, p) = Manager("history"); var s = Prepare(m); m.Start(s.id, s.revision); p.Process.HasExited = true; _ = m.Status();
            m.Observe(s.id, "expected", "first report"); m.Observe(s.id, "unclear", "second report"); Require(Directory.GetFiles(s.folder, "observation-*.json").Length == 2);
            File.WriteAllText(Path.Combine(s.folder, "runtime", "log.txt"), "previous game log");
            m.Start(s.id, s.revision); Require(Directory.GetFiles(s.folder, "launch-*.json").Length == 2);
            Require(Directory.GetFiles(Path.Combine(s.folder, "previous-logs"), "log.txt", SearchOption.AllDirectories).Any(x => File.ReadAllText(x) == "previous game log"));
        });
        check("PID reuse never grants ownership or permits a conflicting launch", () => {
            var (m, p) = Manager("reuse"); var s = Prepare(m); m.Start(s.id, s.revision); p.OwnershipMatches = false;
            var reopened = new IsolatedTests(Path.Combine(baseRoot, "reuse"), p, Verify); Require(!reopened.Running); Refused(() => reopened.Start(s.id, s.revision)); Require(p.Starts == 1);
        });
        check("A removed session record permits fresh preparation without reusing its files", () => {
            var (m, p) = Manager("missing-record"); var s = Prepare(m); File.Delete(Path.Combine(s.folder, "session.json"));
            var reopened = new IsolatedTests(Path.Combine(baseRoot, "missing-record"), p, Verify); Require(reopened.Status() == null); var fresh = Prepare(reopened); Require(fresh.id != s.id && Directory.Exists(s.folder) && p.Starts == 0);
        });
        if (payload.TryGetProperty("runtimeFixture", out var runtimeFixture)) check("Verified real runtime fingerprints are read without loading or executing them", () => {
            var realPaths = new RuntimePaths(runtimeFixture.GetProperty("gameExe").GetString()!, runtimeFixture.GetProperty("extenderFolder").GetString()!);
            Require(GameRuntime.Verify(realPaths).Sources.Count == 14);
            Refused(() => GameRuntime.Verify(realPaths with { ExtenderFolder = source }));
            Refused(() => GameRuntime.Verify(realPaths with { GameExe = runtimeFixture.GetProperty("legacyGameExe").GetString()! }));
        });
        if(payload.TryGetProperty("originalCandidates",out var originals))foreach(var original in originals.EnumerateArray()){
            string identity=original.GetProperty("modId").GetString()!;
            check("Original observation "+identity+": exact helper, isolated profile, bound log context, no editable result return",()=>{
                var c=TestCandidate.Read(original);Require(c.OriginalRecord&&!c.WeaponEditing);
                var (m,p)=Manager(identity);var v=View(m.Prepare(original));Require(p.Starts==0 && v.GetProperty("originalRecord").GetBoolean());
                string id=v.GetProperty("id").GetString()!,revision=v.GetProperty("revision").GetString()!,folder=v.GetProperty("folder").GetString()!;
                byte[] cfg=new byte[55];BitConverter.GetBytes(129).CopyTo(cfg,0);cfg[48]=0x4f;cfg[49]=7;File.WriteAllBytes(Path.Combine(folder,"profile","coe5config"),cfg);
                m.Start(id,revision);Require(p.Starts==1&&!p.LastStart!.ArgumentList.Contains("--nomods"));p.Process.HasExited=true;v=View(m.Status());
                Require(v.GetProperty("status").GetString()=="exited"&&v.GetProperty("instruction").GetString()!.Contains("Battle (AI)"));
                Require(File.Exists(Path.Combine(TestExchange.Area(folder,c.ModId),"workbench-session.ini")));Refused(()=>m.ReturnValues(id));Require(View(m.ReturnSessions()).GetArrayLength()==0);
                foreach(string change in new[]{original.GetRawText().Replace("No weapon/spell writes","coe5.set writes"),original.GetRawText().Replace("native-ai-battle","forced-cast"),original.GetRawText().Replace("original-record-observation","experimental-test-mod")}){using var bad=JsonDocument.Parse(change);Refused(()=>TestCandidate.Read(bad.RootElement));}
            });
        }
        if(payload.TryGetProperty("previous014Candidate",out var previous014))check("v0.14 retained results remain review-only",()=>{Require(TestCandidate.ReadForReview(previous014).WeaponEditing);Refused(()=>TestCandidate.Read(previous014));});
        if(payload.TryGetProperty("previous015Candidate",out var previous015))check("v0.15 retained editable results remain review-only",()=>{Require(TestCandidate.ReadForReview(previous015).WeaponEditing);Refused(()=>TestCandidate.Read(previous015));});
        if(payload.TryGetProperty("previous015Original",out var oldOriginal))check("v0.15 original observations remain review-only without enabling editable return",()=>{var c=TestCandidate.ReadForReview(oldOriginal);Require(c.OriginalRecord&&!c.WeaponEditing);Refused(()=>TestCandidate.Read(oldOriginal));});
        if (payload.TryGetProperty("sidecarFixture", out var sidecarFixture)) check("Canonical sidecar package passes the same native launch boundary", () => { Require(TestCandidate.Read(sidecarFixture).Mode == "c5se"); });
        foreach (string format in new[] { "c5m", "c5se" })
        {
            string editInput = Path.Combine(Path.GetDirectoryName(Path.GetFullPath(reportFile))!, "weapon-edit-" + format + "-input.json");
            if (!File.Exists(editInput)) continue;
            check("Weapon experiment " + format + " validates exact template, owned-session metadata and fixed source revision", () => {
                using var editDoc = JsonDocument.Parse(File.ReadAllText(editInput)); var editPayload = editDoc.RootElement;
                var edit = TestCandidate.Read(editPayload); Require(edit.WeaponEditing && edit.Mode == format);
                var (manager, processes) = Manager("weapon-edit-" + format); var view = View(manager.Prepare(editPayload));
                Require(processes.Starts == 0 && view.GetProperty("weaponEditing").GetBoolean());
                Require(view.GetProperty("instruction").GetString()!.Contains("Apply"));
                Require(view.GetProperty("revision").GetString() == GameRuntime.TextHash(format + "\0" + edit.Source));
            });
            check("Weapon experiment " + format + " rejects arbitrary Lua, field writes and option/contract tampering", () => {
                string raw = File.ReadAllText(editInput);
                void Alter(Action<JsonObject, JsonArray, JsonObject, JsonObject> change)
                {
                    var root = JsonNode.Parse(raw)!.AsObject(); var files = root["files"]!.AsArray();
                    var manifestFile = files.Single(x => x!["name"]!.GetValue<string>() == "manifest.json")!.AsObject();
                    var manifest = JsonNode.Parse(manifestFile["text"]!.GetValue<string>())!.AsObject();
                    var lua = files.Single(x => x!["name"]!.GetValue<string>().EndsWith(".lua"))!.AsObject();
                    change(root, files, manifest, lua); manifestFile["text"] = manifest.ToJsonString();
                    Refused(() => TestCandidate.Read(JsonSerializer.SerializeToElement(root)));
                }
                Alter((root, files, manifest, lua) => lua["text"] = lua["text"]!.GetValue<string>() + "\nerror('unreviewed')");
                Alter((root, files, manifest, lua) => lua["text"] = lua["text"]!.GetValue<string>().Replace("\"dmgtype\"", "\"dmg\""));
                Alter((root, files, manifest, lua) => manifest["test"]!["weaponEditing"] = false);
                Alter((root, files, manifest, lua) => manifest["test"]!["weaponEditing"] = "true");
                Alter((root, files, manifest, lua) => manifest["experiment"] = "arbitrary-code");
                Alter((root, files, manifest, lua) => files.Add(new JsonObject { ["name"] = "extra.lua", ["text"] = "arbitrary" }));
            });
            check("Result return " + format + " requires exit, binds fresh launch and keeps session metadata read-only", () => {
                using var editDoc = JsonDocument.Parse(File.ReadAllText(editInput)); var edit = TestCandidate.Read(editDoc.RootElement);
                var (m,p) = Manager("result-" + format); var view = View(m.Prepare(editDoc.RootElement)); string id = view.GetProperty("id").GetString()!, revision = view.GetProperty("revision").GetString()!, folder = view.GetProperty("folder").GetString()!;
                Refused(() => m.ReturnValues(id));
                byte[] config = new byte[55]; BitConverter.GetBytes(129).CopyTo(config,0); config[48]=0x4f;config[49]=7;File.WriteAllBytes(Path.Combine(folder,"profile","coe5config"),config);
                m.Start(id,revision); Refused(() => m.ReturnValues(id)); p.Process.HasExited=true; _=m.Status();
                var s = JsonSerializer.Deserialize<IsolatedTests.Session>(File.ReadAllText(Path.Combine(folder,"session.json")))!;
                string context = File.ReadAllText(Path.Combine(TestExchange.Area(folder,edit.ModId),"workbench-session.ini")); Require(context.Contains("run="+s.ResultRun) && context.Contains("revision="+revision));
                var missing = View(m.ReturnValues(id)); Require(missing.GetProperty("samples").GetArrayLength()==0 && missing.GetProperty("error").GetString()!.Contains("No structured result"));
                string ini="[meta]\nschema=wb-results-2\nsession="+id+"\nrevision="+revision+"\nrun="+s.ResultRun+"\nmod="+edit.ModId+"\nspell=WB Edit Spark\nweapon=WB Edit Effect\nformat="+format+"\ncount=2\nbaselinelook=68\nbaselineflymode=6\nbaselineflylook=65\n[sample1]\nindex=1\npanel=1\nparameter=0\ndmgtype=4\naoe=0\nlook=68\nflymode=6\nflylook=65\ncasts=0\nreadback=1\nkind=baseline\n[sample2]\nindex=2\npanel=1\nparameter=1\ndmgtype=3\naoe=5\nlook=2\nflymode=5\nflylook=2\ncasts=1\nreadback=1\nkind=applied\n";
                string result=TestExchange.ResultPath(folder,s),record=File.ReadAllText(Path.Combine(folder,"session.json"));File.WriteAllText(result,ini);
                var returned=View(m.ReturnValues(id));Require(returned.GetProperty("samples").GetArrayLength()==2 && returned.GetProperty("samples")[1].GetProperty("castCount").GetInt32()==1 && returned.GetProperty("samples")[1].GetProperty("values").GetProperty("look").GetInt32()==2);Require(File.ReadAllText(Path.Combine(folder,"session.json"))==record);
                var listed=View(m.ReturnSessions());Require(listed.GetArrayLength()==1 && listed[0].GetProperty("weapon").GetString()=="WB Edit Effect" && listed[0].GetProperty("mode").GetString()==format && listed[0].GetProperty("hasResult").GetBoolean() && listed[0].GetProperty("run").GetString()==s.ResultRun);
                string candidateFile=Path.Combine(folder,"candidate.json"),beforeCandidate=File.ReadAllText(candidateFile);
                foreach(string broken in new[]{"{}",beforeCandidate.Replace("WB Edit Spark","Wrong spell")}){File.WriteAllText(candidateFile,broken);Require(View(m.ReturnSessions()).GetArrayLength()==0);}
                File.WriteAllText(candidateFile,beforeCandidate);
                foreach(string bad in new[]{ini.Replace("schema=wb-results-2","schema=unknown"),ini.Replace("schema=wb-results-2","schema=wb-results-1"),ini.Replace("session="+id,"session="+new string('f',32)),ini.Replace("revision="+revision,"revision="+new string('e',64)),ini.Replace("run="+s.ResultRun,"run="+new string('d',32)),ini.Replace("weapon=WB Edit Effect","weapon=Other"),ini.Replace("format="+format,"format=other"),ini.Replace("index=2","index=1"),ini.Replace("casts=1","casts=-1"),ini.Replace("aoe=5","aoe=3"),ini.Replace("parameter=1","parameter=0"),ini.Replace("dmgtype=4","dmgtype=3"),ini+"[extra]\nlua=bad\n",ini.Replace("readback=1","readback=0"),ini.Replace("index=1","index=1\nindex=1"),ini.Replace("baselinelook=68","baselinelook=67"),ini.Replace("\nlook=2","\nlook=300"),ini.Replace("\nflymode=5","\nflymode=1"),ini.Replace("\nflylook=2",""),ini+"sound=16\n",ini.Replace("\nlook=2","\nlook=2147483648"),ini+"\0"}){
                    File.WriteAllText(result,bad);var rejected=View(m.ReturnValues(id));Require(rejected.GetProperty("samples").GetArrayLength()==0 && rejected.GetProperty("error").GetString()!.Length>0);
                }
                File.WriteAllBytes(result,new byte[]{255,255});Require(View(m.ReturnValues(id)).GetProperty("samples").GetArrayLength()==0 && View(m.ReturnValues(id)).GetProperty("error").GetString()!.Length>0);
                File.WriteAllText(result,ini);m.Invalidate(id);Require(View(m.ReturnValues(id)).GetProperty("context").GetProperty("stale").GetBoolean());
                Refused(()=>m.ReturnValues("../outside"));
            });
            check("Runtime catalog " + format + " retains duplicate variants, rejects partial commits and has honest bounds", () => {
                using var editDoc = JsonDocument.Parse(File.ReadAllText(editInput)); var edit = TestCandidate.Read(editDoc.RootElement);
                var (m,p) = Manager("catalog-"+format); var view=View(m.Prepare(editDoc.RootElement));string id=view.GetProperty("id").GetString()!,revision=view.GetProperty("revision").GetString()!,folder=view.GetProperty("folder").GetString()!;
                byte[] config=new byte[55];BitConverter.GetBytes(129).CopyTo(config,0);config[48]=0x4f;config[49]=7;File.WriteAllBytes(Path.Combine(folder,"profile","coe5config"),config);
                m.Start(id,revision);p.Process.HasExited=true;_=m.Status();var s=JsonSerializer.Deserialize<IsolatedTests.Session>(File.ReadAllText(Path.Combine(folder,"session.json")))!;
                Refused(()=>m.RuntimeChoices(id));
                string binding="\nsession="+id+"\nrevision="+revision+"\nrun="+s.ResultRun+"\nmod="+edit.ModId+"\nexport=1\n";
                File.WriteAllText(TestExchange.CatalogPath(folder,s,"meta"),"[meta]\nschema=wb-catalog-1"+binding);
                foreach(var part in new[]{("monsters","monster",6998),("weapons","weapon",6998),("spells","spell",4095),("effects","effect",299)}){
                    string rows=part.Item2=="monster"?"[entry1]\nid=13\nname=Spearman\n[entry2]\nid=2000\nname=Spearman\n":part.Item2=="effect"?"[entry1]\nid=299\nname=\n":"[entry1]\nid=22\nname=Custom content\n";
                    File.WriteAllText(TestExchange.CatalogPath(folder,s,part.Item1),"[meta]\nschema=wb-catalog-part-1"+binding+"kind="+part.Item2+"\ncount="+(part.Item2=="monster"?2:1)+"\ncomplete="+(part.Item2 is "monster" or "effect"?0:1)+"\nupper="+part.Item3+"\n"+rows);
                }
                var loaded=View(m.RuntimeChoices(id));Require(loaded.GetProperty("entries").GetArrayLength()==5 && !loaded.GetProperty("coverage")[0].GetProperty("complete").GetBoolean());
                string file=TestExchange.CatalogPath(folder,s,"monsters"),before=File.ReadAllText(file);
                foreach(string bad in new[]{before.Replace("export=1","export=2"),before.Replace("id=2000","id=13"),before.Replace("upper=6998","upper=13"),before.Replace("name=Spearman","name="),before+"lua=not allowed\n"}){File.WriteAllText(file,bad);Refused(()=>m.RuntimeChoices(id));}
                File.WriteAllText(file,before);string priorRun=s.ResultRun!;m.Start(id,revision);p.Process.HasExited=true;_=m.Status();var next=View(m.ReturnValues(id));Require(next.GetProperty("context").GetProperty("run").GetString()!=priorRun && next.GetProperty("samples").GetArrayLength()==0);Refused(()=>m.RuntimeChoices(id));
            });
        }
        if(payload.TryGetProperty("previousCandidate",out var previous))check("Frozen 0.10 helper/result schema remains read-only and cannot pass the new launch validator",()=>{
            Refused(()=>TestCandidate.Read(previous));var old=TestCandidate.ReadForReview(previous);Require(old.WeaponEditing);
            string folder=Path.Combine(baseRoot,"prior-result");Directory.CreateDirectory(folder);
            var s=new IsolatedTests.Session{Id=new string('a',32),Revision=GameRuntime.TextHash(old.Mode+"\0"+old.Source),ResultRun=new string('b',32),ModId=old.ModId};string area=TestExchange.Area(folder,old.ModId);Directory.CreateDirectory(area);
            using var doc=JsonDocument.Parse(old.Files["manifest.json"]);var d=doc.RootElement.GetProperty("definitions");
            string ini="[meta]\nschema=wb-results-1\nsession="+s.Id+"\nrevision="+s.Revision+"\nrun="+s.ResultRun+"\nmod="+old.ModId+"\nspell="+old.SpellName+"\nweapon="+d.GetProperty("weaponName").GetString()+"\nformat="+old.Mode+"\ncount=1\n[sample1]\nindex=1\npanel=1\nparameter=1\ndmgtype=3\naoe=5\ncasts=1\nreadback=1\nkind=applied\n";
            File.WriteAllText(TestExchange.ResultPath(folder,s),ini);var result=View(TestExchange.Results(folder,s,old));Require(result.GetProperty("samples").GetArrayLength()==1 && result.GetProperty("context").GetProperty("resultSchema").GetInt32()==1 && result.GetProperty("samples")[0].GetProperty("values").EnumerateObject().Count()==2);
        });
        foreach(string shape in new[]{"sprite","blank"}){
            string input=Path.Combine(Path.GetDirectoryName(Path.GetFullPath(reportFile))!,"vfx-"+shape+"-input.json");if(!File.Exists(input))continue;
            check("Visual results "+shape+" retain baseline interpretation without inventing absent source fields",()=>{
                using var doc=JsonDocument.Parse(File.ReadAllText(input));var c=TestCandidate.Read(doc.RootElement);var s=new IsolatedTests.Session{Id=new string('a',32),Revision=GameRuntime.TextHash(c.Mode+"\0"+c.Source),ResultRun=new string('b',32),ModId=c.ModId};
                string folder=Path.Combine(baseRoot,"vfx-"+shape);Directory.CreateDirectory(TestExchange.Area(folder,c.ModId));int mode=shape=="sprite"?1:0,flight=shape=="sprite"?37:0,look=shape=="sprite"?68:0;
                string ini="[meta]\nschema=wb-results-2\nsession="+s.Id+"\nrevision="+s.Revision+"\nrun="+s.ResultRun+"\nmod="+c.ModId+"\nspell="+c.SpellName+"\nweapon="+c.SpellName+"\nformat=c5m\ncount=1\nbaselinelook="+look+"\nbaselineflymode="+mode+"\nbaselineflylook="+flight+"\n[sample1]\nindex=1\npanel=1\nparameter=1\ndmgtype=4\naoe=0\nlook=2\nflymode="+mode+"\nflylook="+flight+"\ncasts=0\nreadback=1\nkind=applied\n";
                string path=TestExchange.ResultPath(folder,s);File.WriteAllText(path,ini);var result=View(TestExchange.Results(folder,s,c));Require(result.GetProperty("samples").GetArrayLength()==1 && result.GetProperty("samples")[0].GetProperty("castCount").GetInt32()==0);
                if(shape=="blank")Require(result.GetProperty("context").GetProperty("baseline").GetProperty("look").GetString()=="");
                File.WriteAllText(path,ini.Replace("\nflylook="+flight,"\nflylook=2"));Require(View(TestExchange.Results(folder,s,c)).GetProperty("samples").GetArrayLength()==0);
                File.WriteAllText(path,ini.Replace("\nflymode="+mode,"\nflymode=6").Replace("\nflylook="+flight,"\nflylook=299"));Require(View(TestExchange.Results(folder,s,c)).GetProperty("samples").GetArrayLength()==1);
            });
        }
        if(payload.TryGetProperty("retainedReviewFixture",out var retained))check("Actual retained 0.9 session is verified read-only, with manual fallback and no legacy launch",()=>{
            string id=retained.GetProperty("id").GetString()!,folder=Path.Combine(IsolatedTests.DefaultRoot,id),record=Path.Combine(folder,"session.json");string before=File.ReadAllText(record);
            using var doc=JsonDocument.Parse(File.ReadAllText(Path.Combine(folder,"candidate.json")));Refused(()=>TestCandidate.Read(doc.RootElement));Require(TestCandidate.ReadForReview(doc.RootElement).WeaponEditing);
            var real=new IsolatedTests();var returned=View(real.ReturnValues(id));Require(returned.GetProperty("context").GetProperty("legacy").GetBoolean() && returned.GetProperty("context").GetProperty("sourceRevision").GetString()==retained.GetProperty("revision").GetString());Require(returned.GetProperty("samples").GetArrayLength()==0 && File.ReadAllText(record)==before);
        });
        if(payload.TryGetProperty("retainedSavedFixture",out var saved))check("Actual 0.11 Codex VFX Trial result verifies read-only: impact 7 to 3 and one completed cast call",()=>{
            string id=saved.GetProperty("id").GetString()!,folder=Path.Combine(IsolatedTests.DefaultRoot,id);
            var before=Directory.EnumerateFiles(folder,"*",SearchOption.AllDirectories).ToDictionary(p=>p,p=>GameRuntime.Hash(p));
            using var doc=JsonDocument.Parse(File.ReadAllText(Path.Combine(folder,"candidate.json")));Refused(()=>TestCandidate.Read(doc.RootElement));Require(TestCandidate.ReadForReview(doc.RootElement).WeaponEditing);
            var real=new IsolatedTests();var result=View(real.ReturnValues(id));var c=result.GetProperty("context");
            Require(c.GetProperty("sourceRevision").GetString()==saved.GetProperty("revision").GetString() && c.GetProperty("spellName").GetString()=="Codex VFX Trial" && c.GetProperty("baseline").GetProperty("look").GetString()=="7");
            var samples=result.GetProperty("samples");Require(samples.GetArrayLength()==2 && samples[0].GetProperty("values").GetProperty("look").GetInt32()==7 && samples[1].GetProperty("values").GetProperty("look").GetInt32()==3 && samples[1].GetProperty("castCount").GetInt32()==1);
            var row=View(real.ReturnSessions()).EnumerateArray().Single(r=>r.GetProperty("id").GetString()==id);Require(row.GetProperty("hasResult").GetBoolean() && row.GetProperty("mode").GetString()=="c5se" && row.GetProperty("weapon").GetString()=="Codex VFX Trial");
            Require(before.Count==Directory.EnumerateFiles(folder,"*",SearchOption.AllDirectories).Count() && before.All(p=>GameRuntime.Hash(p.Key)==p.Value));
            File.WriteAllText(Path.Combine(Path.GetDirectoryName(Path.GetFullPath(reportFile))!,"actual-result-packet.json"),result.GetRawText(),LocalFiles.Utf8);
        });
        check("Data-only INI refuses repeated keys, invalid names, controls and oversized input",()=>{
            foreach(string text in new[]{"x=1","[meta]\nx=1\nx=2","[meta]\nx=1\n[meta]\nx=2","[../other]\nx=1","[meta]\nx=\t1",new string('x',1024*1024+1)})Refused(()=>TestExchange.Parse(text));
            Require(TestExchange.Parse("; comment\r\n[meta]\r\nschema=test\r\n")["meta"]["schema"]=="test");Refused(()=>TestExchange.Run("../outside"));
        });
        check("Production compatibility rejects unknown executable before any launch", () => {
            string game = Path.Combine(baseRoot, "unknown-game"); Directory.CreateDirectory(Path.Combine(game, "data")); File.WriteAllText(Path.Combine(game, "data", "asset"), "fixture"); File.WriteAllText(Path.Combine(game, "CoE5.exe"), "not a game"); Refused(() => GameRuntime.Verify(new(Path.Combine(game, "CoE5.exe"), source)));
        });
        check("Actual substitute child process receives isolated environment and exits cleanly (no game)", () => {
            string output = Path.Combine(baseRoot, "child-" + Guid.NewGuid().ToString("N") + ".txt");
            var start = new ProcessStartInfo(Path.Combine(AppContext.BaseDirectory, "CoE5Workbench.exe")) { UseShellExecute = false, CreateNoWindow = true };
            start.ArgumentList.Add("--test-child"); start.ArgumentList.Add(output); start.Environment["COE5_SAVE"] = "substitute-profile"; start.Environment["COE5_DATA"] = "substitute-assets";
            var p = new TestProcesses().Start(start); var until = DateTime.UtcNow.AddSeconds(10); while (!p.HasExited && DateTime.UtcNow < until) Thread.Sleep(30);
            Require(p.HasExited && p.ExitCode == 0 && File.ReadAllText(output) == "substitute-profile\nsubstitute-assets");
        });
    }
}
