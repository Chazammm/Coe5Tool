using System.Diagnostics;
using System.IO;
using System.Text.Json;
using System.Text.Json.Nodes;
namespace CoE5Workbench;

internal static class RuntimeReleasesSelfTest
{
    // Captures launch intent; NEVER calls Process.Start or loads a game/plugin.
    private sealed class Child : ITestProcess {
        public int Id => 515151;
        public DateTime StartUtc { get; } = DateTime.UtcNow;
        public bool HasExited { get; set; }
        public int? ExitCode => HasExited ? 0 : null;
    }
    private sealed class Processes : ITestProcesses {
        internal bool Conflict; internal int Starts; internal ProcessStartInfo? Last;
        internal Child Owned = new();
        public bool AnyGameRunning() => Conflict || Starts>0&&!Owned.HasExited;
        public ITestProcess Start(ProcessStartInfo start){Starts++;Last=start;return Owned;}
        public ITestProcess? FindOwned(int pid,DateTime start,string exe)=>Starts>0&&!Owned.HasExited&&pid==Owned.Id&&start==Owned.StartUtc?Owned:null;
    }
    internal static void Run(string reportFile, Action<string,Action> check)
    {
        void Require(bool yes){if(!yes)throw new Exception("Assertion failed");}
        void Refused(Action action){try{action();}catch{return;}throw new Exception("Expected refusal");}
        JsonElement Json(object o)=>JsonSerializer.SerializeToElement(o);
        check("Runtime releases: independent official hashes, unknown-version refusal and API-10 overlay restriction",()=>{
            Require(GameRuntime.IdentifyOfficialPlugin(GameRuntime.FilesFor("2.13.0")[LocalRosterRuntime.PluginKey])=="2.13.0");
            Require(GameRuntime.IdentifyOfficialPlugin(GameRuntime.FilesFor("3.2.2")[LocalRosterRuntime.PluginKey])=="3.2.2");
            Require(GameRuntime.FilesFor("3.2.2").Count==14&&GameRuntime.FilesFor("2.13.0").Count==14);
            Refused(()=>GameRuntime.FilesFor("3.2.1"));Refused(()=>GameRuntime.IdentifyOfficialPlugin(new string('0',64)));
            Require(LocalRosterRuntime.Expected(true,"3.2.2")[LocalRosterRuntime.PluginKey]==GameRuntime.FilesFor("3.2.2")[LocalRosterRuntime.PluginKey]);
            Refused(()=>LocalRosterRuntime.Overlay(new(new("unused","unused"),"unused",new(),"3.2.2")));
            Require(LocalRosterRuntime.Expected(true,"2.13.0")[LocalRosterRuntime.PluginKey]==LocalRosterRuntime.PluginSha256);
            Require(GameRuntime.SessionVersion(new IsolatedTests.Session())=="2.13.0");
        });
        check("Runtime contracts reject a new-version annotation on a retained older helper",()=>{
            using var old=JsonDocument.Parse("{\"workbenchVersion\":\"0.17.0\",\"runtimeVersion\":\"3.2.2\"}");
            Refused(()=>GameRuntime.CandidateVersion(old.RootElement));
        });
        string dir=Path.GetDirectoryName(Path.GetFullPath(reportFile))!,file=Path.Combine(dir,"runtime-compatibility-input.json");
        if(!File.Exists(file))return;
        using var input=JsonDocument.Parse(LocalFiles.ReadText(file,8*1024*1024));
        foreach(var row in input.RootElement.GetProperty("runtimes").EnumerateArray())
        {
            string version=row.GetProperty("version").GetString()!;
            var paths=new RuntimePaths(row.GetProperty("gameExe").GetString()!,row.GetProperty("extenderFolder").GetString()!);
            check("Real "+version+" release files match the independent complete profile without loading binaries",()=>{
                var identity=GameRuntime.Verify(paths);Require(identity.ExtenderVersion==version&&identity.Sources.Count==14);
                Require(GameRuntime.Hash(identity.Sources[LocalRosterRuntime.PluginKey])==GameRuntime.FilesFor(version)[LocalRosterRuntime.PluginKey]);
            });
            foreach(var payload in row.GetProperty("candidates").EnumerateArray())
            {
                string kind=payload.GetProperty("modId").GetString()!;
                check(version+" / "+kind+": real preparation, resumed validation, conflict refusal and captured launch intent (NO GAME)",()=>{
                    string root=Path.Combine(dir,"real-runtime-model-"+Guid.NewGuid().ToString("N"));var proc=new Processes();
                    var m=new IsolatedTests(root,proc);m.Configure(paths);
                    var c=TestCandidate.Read(payload);Require(c.ExtenderVersion==version);
                    var s=Json(m.Prepare(payload));string id=s.GetProperty("id").GetString()!,revision=s.GetProperty("revision").GetString()!;
                    Require(proc.Starts==0&&s.GetProperty("runtimeVersion").GetString()==version);
                    var opened=new IsolatedTests(root,proc);var checkedPreparation=Json(opened.CheckPrepared(id));Require(checkedPreparation.GetProperty("ready").GetBoolean());
                    if(version=="3.2.2")Require(checkedPreparation.GetProperty("detail").GetString()!.Contains("acceptance is pending")&&GameRuntime.LabelFor(version).Contains("preview"));
                    proc.Conflict=true;Require(!Json(opened.CheckPrepared(id)).GetProperty("ready").GetBoolean());Refused(()=>opened.StartPrepared(id,revision));Require(proc.Starts==0);proc.Conflict=false;
                    opened.StartPrepared(id,revision);Require(proc.Starts==1&&proc.Last!=null&&!proc.Last.UseShellExecute);
                    Require(proc.Last!.Environment["COE5_SAVE"]==Path.Combine(root,id,"profile")&&proc.Last.Environment["COE5_DATA"]==Path.Combine(Path.GetDirectoryName(paths.GameExe)!,"data"));
                    Require(proc.Last.FileName==Path.Combine(root,id,"runtime","CoE5.exe")&&proc.Last.ArgumentList.Contains("--nomods"));
                    proc.Owned.HasExited=true;Require(!opened.Running);Require(!Json(opened.CheckPrepared(id)).GetProperty("ready").GetBoolean());
                    Require(GameRuntime.Hash(paths.GameExe)==GameRuntime.KnownFiles["runtime/CoE5.exe"]);
                });
            }
            check(version+": synthetic saved spell values retain version binding and reject a foreign launch (NO CAST)",()=>{
                string root=Path.Combine(dir,"result-model-"+Guid.NewGuid().ToString("N"));var proc=new Processes();var m=new IsolatedTests(root,proc);m.Configure(paths);
                var c=TestCandidate.Read(row.GetProperty("candidates")[0]);var view=Json(m.Prepare(row.GetProperty("candidates")[0]));string id=view.GetProperty("id").GetString()!,folder=Path.Combine(root,id),revision=view.GetProperty("revision").GetString()!;
                byte[] config=new byte[55];BitConverter.GetBytes(129).CopyTo(config,0);config[48]=0x4f;config[49]=7;File.WriteAllBytes(Path.Combine(folder,"profile","coe5config"),config);
                m.Start(id,revision);proc.Owned.HasExited=true;_=m.Status();Require(!proc.Last!.ArgumentList.Contains("--nomods"));
                var s=JsonSerializer.Deserialize<IsolatedTests.Session>(File.ReadAllText(Path.Combine(folder,"session.json")))!;
                using var manifest=JsonDocument.Parse(c.Files["manifest.json"]);var d=manifest.RootElement.GetProperty("definitions");Require(d.GetProperty("dmgtype").GetString()=="4"&&d.GetProperty("look").GetString()=="68"&&d.GetProperty("flymode").GetString()=="2"&&d.GetProperty("flylook").GetString()=="65");
                string ini="[meta]\nschema=wb-results-2\nsession="+id+"\nrevision="+revision+"\nrun="+s.ResultRun+"\nmod="+c.ModId+"\nspell="+c.SpellName+"\nweapon="+d.GetProperty("weaponName").GetString()+"\nformat=c5m\ncount=1\nbaselinelook=68\nbaselineflymode=2\nbaselineflylook=65\n[sample1]\nindex=1\npanel=1\nparameter=0\ndmgtype=4\naoe=0\ncasts=1\nreadback=1\nkind=baseline\nlook=68\nflymode=2\nflylook=65\n";
                string result=TestExchange.ResultPath(folder,s);File.WriteAllText(result,ini);var r=Json(m.ReturnValues(id));Require(r.GetProperty("error").ValueKind==JsonValueKind.Null&&r.GetProperty("samples").GetArrayLength()==1);
                Require(r.GetProperty("context").GetProperty("runtime").GetString()==GameRuntime.LabelFor(version)&&r.GetProperty("context").GetProperty("source").GetString()==c.Source);
                File.WriteAllText(result,ini.Replace("run="+s.ResultRun,"run="+new string('c',32)));Require(Json(m.ReturnValues(id)).GetProperty("samples").GetArrayLength()==0);
            });
            check(version+": forged staged-file manifest cannot bypass independent runtime fingerprints",()=>{
                string root=Path.Combine(dir,"tamper-model-"+Guid.NewGuid().ToString("N"));var proc=new Processes();var m=new IsolatedTests(root,proc);m.Configure(paths);
                var s=Json(m.Prepare(row.GetProperty("candidates")[0]));string id=s.GetProperty("id").GetString()!,folder=Path.Combine(root,id);
                string staged=Path.Combine(folder,"profile","mods","CoE5SE","coe5se_loader.dll");File.WriteAllText(staged,"inert corruption fixture; never executed");
                string record=Path.Combine(folder,"session.json");var forged=JsonNode.Parse(File.ReadAllText(record))!;
                forged["Hashes"]!["profile/mods/CoE5SE/coe5se_loader.dll"]=GameRuntime.Hash(staged);File.WriteAllText(record,forged.ToJsonString());
                Require(!Json(new IsolatedTests(root,proc).CheckPrepared(id)).GetProperty("ready").GetBoolean());Require(proc.Starts==0);
            });
        }
        check("Cross-version runtime selection refuses before allocating a session or migrating its candidate",()=>{
            var rows=input.RootElement.GetProperty("runtimes");var legacy=rows[0];var latest=rows[1];
            var paths=new RuntimePaths(latest.GetProperty("gameExe").GetString()!,latest.GetProperty("extenderFolder").GetString()!);
            string root=Path.Combine(dir,"cross-model-"+Guid.NewGuid().ToString("N"));var proc=new Processes();var m=new IsolatedTests(root,proc);m.Configure(paths);
            Refused(()=>m.Prepare(legacy.GetProperty("candidates")[0]));Require(Directory.GetDirectories(root).Length==0&&proc.Starts==0);
        });
        check("Swapping new and old official plugin/loader components is refused",()=>{
            var rows=input.RootElement.GetProperty("runtimes");string folder=Path.Combine(dir,"mixed-official-"+Guid.NewGuid().ToString("N"));Directory.CreateDirectory(folder);
            var next=rows[1];string game=next.GetProperty("gameExe").GetString()!,latest=next.GetProperty("extenderFolder").GetString()!,old=rows[0].GetProperty("extenderFolder").GetString()!;
            foreach(var p in GameRuntime.FilesFor("3.2.2").Where(p=>p.Key.StartsWith("profile/")||p.Key=="runtime/glu32.dll"))File.Copy(Path.Combine(latest,Path.GetFileName(p.Key)),Path.Combine(folder,Path.GetFileName(p.Key)));
            File.Copy(Path.Combine(old,"coe5se_loader.dll"),Path.Combine(folder,"coe5se_loader.dll"),true);
            Refused(()=>GameRuntime.Verify(new(game,folder)));
        });
    }
}
