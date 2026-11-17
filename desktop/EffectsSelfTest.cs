using System.Diagnostics;
using System.IO;
using System.Text.Json;
using System.Text.Json.Nodes;
namespace CoE5Workbench;

internal static class EffectsSelfTest
{
    private sealed class FakeProcess:ITestProcess {public int Id=>419019;public DateTime StartUtc{get;}=DateTime.UtcNow;public bool HasExited{get;set;}public int? ExitCode=>HasExited?0:null;}
    private sealed class FakeProcesses:ITestProcesses
    {
        internal bool Conflict;internal int Starts;internal FakeProcess Child=new();internal ProcessStartInfo? Intent;
        public bool AnyGameRunning()=>Conflict||Starts>0&&!Child.HasExited;
        public ITestProcess Start(ProcessStartInfo p){Starts++;Intent=p;return Child;}
        public ITestProcess? FindOwned(int id,DateTime start,string exe)=>id==Child.Id&&start==Child.StartUtc&&!Child.HasExited?Child:null;
    }
    internal static void Run(string report,Action<string,Action> check)
    {
        void Require(bool v){if(!v)throw new Exception("Assertion failed");}void Refused(Action a){try{a();}catch{return;}throw new Exception("Expected refusal");}
        check("Effects browser assets are host-allowlisted; no foreign navigation or files",()=>{foreach(string n in new[]{"effect-browser.js","effect-browser-template.js","effect-browser-ui.js"})Require(HostPolicy.AssetAllowed(HostPolicy.Origin+"/"+n));Require(!HostPolicy.AssetAllowed("https://example.com/effect-browser.js"));});
        string folder=Path.GetDirectoryName(Path.GetFullPath(report))!;
        foreach(string inputName in new[]{"effect-browser-input.json","effect-browser-dev-input.json"}) {
        string input=Path.Combine(folder,inputName);if(!File.Exists(input))continue;
        using var doc=JsonDocument.Parse(File.ReadAllText(input));var payload=doc.RootElement;var c=TestCandidate.Read(payload);
        check("Effects browser canonical private pair, target and API-14 runtime",()=>{Require(c.EffectsBrowser&&!c.OriginalRecord&&!c.WeaponEditing&&!c.PrivateRanged&&c.ExtenderVersion is "3.4.4" or GameRuntime.DevVersion);Require(c.Target==new NativeTarget(13,"Spearman"){count=4});Require(c.Files[c.ModId+".c5m"].Contains("#!@weapon 1 \"WBEW_"));});
        check("Effects browser refuses modified helper, source, shared payload and unsupported runtime",()=>{
            foreach(string which in new[]{"lua","c5m","source","runtime","target"}){
                var n=JsonNode.Parse(payload.GetRawText())!;if(which=="source")n["source"]="other source";
                else if(which=="lua"||which=="c5m"){var f=n["files"]!.AsArray().Single(f=>f!["name"]!.GetValue<string>()==c.ModId+"."+which)!;f["text"]=f["text"]!.GetValue<string>()+"\nchanged";}
                else {var f=n["files"]!.AsArray().Single(f=>f!["name"]!.GetValue<string>()=="manifest.json")!;var m=JsonNode.Parse(f["text"]!.GetValue<string>())!;if(which=="runtime")m["runtimeVersion"]="3.5.0";else m["target"]!["count"]=21;f["text"]=m.ToJsonString();}
                Refused(()=>TestCandidate.Read(JsonSerializer.SerializeToElement(n)));
            }
        });
        foreach(string oldName in new[]{"effect-browser-input-v019rc1.json","effect-browser-input-v019rc2.json"}) { string oldInput=Path.Combine(folder,oldName);if(File.Exists(oldInput))check("Earlier effects browser helper is preserved for read-only review, never replayed with the corrected contract",()=>{
            using var old=JsonDocument.Parse(File.ReadAllText(oldInput));Refused(()=>TestCandidate.Read(old.RootElement));var prior=TestCandidate.ReadForReview(old.RootElement);Require(prior.EffectsBrowser&&prior.ExtenderVersion=="3.4.4");
        });
        }
        string Receipt(IsolatedTests.Session s)=>"[meta]\nschema=wb-effects-1\nsession="+s.Id+"\nrevision="+s.Revision+"\nrun="+s.ResultRun+"\nmod="+s.ModId+"\nstage=closed\ncalls=1\ncount=1\ndiscarded=0\nmessage=Field close returned, not full rollback\nruntime="+c.ExtenderVersion+"\nvisualobserved=unknown\nhit=unknown\n[entry1]\nevent=cast-returned\nkind=spells\nid=445\nname=Fireball\nweapon=54\npayload=15\nreturned=1\nlook=68\nflymode=6\nflylook=65\n";
        check("Effects receipt binds identity and keeps cast-return, hits and visual observation distinct",()=>{
            var s=new IsolatedTests.Session{EffectsBrowser=true,Id=new string('a',32),Revision=new string('b',64),ResultRun=new string('c',32),ModId=c.ModId};string text=Receipt(s);var r=JsonSerializer.SerializeToElement(EffectsResults.Decode(text,s,c));Require(r.GetProperty("calls").GetInt32()==1&&r.GetProperty("summary").GetString()!.Contains("appearance are unknown"));
            foreach(string bad in new[]{text.Replace("run="+s.ResultRun,"run="+new string('d',32)),text.Replace("hit=unknown","hit=confirmed"),text.Replace("visualobserved=unknown","visualobserved=yes"),text.Replace("kind=spells","kind=effects"),text.Replace("count=1","count=2"),text.Replace("calls=1","calls=0"),text.Replace("weapon=54","weapon=1200"),text+"look=68\n"})Refused(()=>EffectsResults.Decode(bad,s,c));
        });
        check("Effects prepare/reopen/recheck/start is isolated; active, used, stale and tampered routes refuse; receipt review stays read-only",()=>{
            string root=Path.Combine(folder,"effects-native-"+Guid.NewGuid().ToString("N")),source=Path.Combine(root,"sources");Directory.CreateDirectory(source);var sources=new Dictionary<string,string>();
            foreach(string key in GameRuntime.FilesFor(c.ExtenderVersion).Keys){string file=Path.Combine(source,key.Replace('/','_'));File.WriteAllText(file,"substitute "+key);sources[key]=file;}string data=Path.Combine(source,"data");Directory.CreateDirectory(data);
            RuntimeIdentity Verify(RuntimePaths p)=>new(p,data,sources,c.ExtenderVersion);var processes=new FakeProcesses();var paths=new RuntimePaths("not-executed-CoE5.exe",source);string storage=Path.Combine(root,"tests");var manager=new IsolatedTests(storage,processes,Verify);manager.Configure(paths);
            var view=JsonSerializer.SerializeToElement(manager.Prepare(payload));string id=view.GetProperty("id").GetString()!,revision=view.GetProperty("revision").GetString()!,work=view.GetProperty("folder").GetString()!;Require(processes.Starts==0&&view.GetProperty("effectsBrowser").GetBoolean());
            manager=new IsolatedTests(storage,processes,Verify);var ready=JsonSerializer.SerializeToElement(manager.CheckPrepared(id));Require(ready.GetProperty("ready").GetBoolean()&&ready.GetProperty("source").ValueKind==JsonValueKind.Null);processes.Conflict=true;Require(!JsonSerializer.SerializeToElement(manager.CheckPrepared(id)).GetProperty("ready").GetBoolean());Refused(()=>manager.StartPrepared(id,revision));processes.Conflict=false;
            byte[] config=new byte[55];BitConverter.GetBytes(129).CopyTo(config,0);config[48]=0x4f;config[49]=7;File.WriteAllBytes(Path.Combine(work,"profile","coe5config"),config);
            var started=JsonSerializer.SerializeToElement(manager.StartPrepared(id,revision));Require(started.GetProperty("instruction").GetString()!.StartsWith("Main menu: Test Effects:"));Require(processes.Intent!.ArgumentList.Contains("-w")&&processes.Intent.Environment["COE5_SAVE"]==Path.Combine(work,"profile"));Refused(()=>manager.EffectBrowserResult(id));
            processes.Child.HasExited=true;_=manager.Status();var s=JsonSerializer.Deserialize<IsolatedTests.Session>(File.ReadAllText(Path.Combine(work,"session.json")))!;Require(s.ExitCode==0&&s.ResultRun!=null);Refused(()=>manager.StartPrepared(id,revision));
            string result=Path.Combine(TestExchange.Area(work,c.ModId),"wb-effects-"+s.ResultRun+".ini");File.WriteAllText(result,Receipt(s));string before=File.ReadAllText(Path.Combine(work,"session.json"));Require(JsonSerializer.SerializeToElement(manager.EffectBrowserResult(id)).GetProperty("calls").GetInt32()==1);Require(before==File.ReadAllText(Path.Combine(work,"session.json")));
            string lua=Path.Combine(work,"profile","mods",c.ModId,c.ModId+".lua");File.AppendAllText(lua,"\nmodified");Refused(()=>manager.EffectBrowserResult(id));
            var fresh=JsonSerializer.SerializeToElement(manager.Prepare(payload));string freshId=fresh.GetProperty("id").GetString()!;manager.Invalidate(freshId);Require(!JsonSerializer.SerializeToElement(manager.CheckPrepared(freshId)).GetProperty("ready").GetBoolean());
        });
        }
    }
}
