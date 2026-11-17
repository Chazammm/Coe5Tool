using System.IO;
using System.Text.Json;
namespace CoE5Workbench;

internal static class RuntimeDevSelfTest
{
    internal static void Run(string report,Action<string,Action> check)
    {
        void Require(bool v){if(!v)throw new Exception("Assertion failed");}
        void Refused(Action action){try{action();}catch{return;}throw new Exception("Expected refusal");}
        check("Dev API-15 profile is exact, independently pinned and does not enable other routes",()=>{
            Require(GameRuntime.ApiVersion(GameRuntime.DevVersion)==15&&GameRuntime.FilesDev.Count==14);
            Require(GameRuntime.IdentifyOfficialPlugin(GameRuntime.FilesDev[LocalRosterRuntime.PluginKey])==GameRuntime.DevVersion);
            Require(!GameRuntime.OfficialGroups(GameRuntime.DevVersion)&&GameRuntime.LabelFor(GameRuntime.DevVersion).Contains("Test Effects"));
            Refused(()=>GameRuntime.FilesFor("3.5.0"));Refused(()=>GameRuntime.FilesFor("3.5.0.1"));
            Refused(()=>GameRuntime.CandidateVersion(JsonSerializer.SerializeToElement(new{workbenchVersion="0.19.0-rc.2",runtimeVersion=GameRuntime.DevVersion})));
            Refused(()=>LocalRosterRuntime.Overlay(new(new("unused","unused"),"unused",new(),GameRuntime.DevVersion)));
        });
        string folder=Path.GetDirectoryName(Path.GetFullPath(report))!,input=Path.Combine(folder,"effect-dev-runtime-input.json");if(!File.Exists(input))return;
        using var doc=JsonDocument.Parse(File.ReadAllText(input));var data=doc.RootElement;
        string game=data.GetProperty("gameExe").GetString()!,ext=data.GetProperty("extenderFolder").GetString()!,old=data.GetProperty("oldFolder").GetString()!;
        check("Actual official dev files match all 14 fingerprints without loading game or extender",()=>{
            var id=GameRuntime.Verify(new(game,ext));Require(id.ExtenderVersion==GameRuntime.DevVersion&&id.Sources.Count==14);
            var manager=new IsolatedTests(Path.Combine(folder,"dev-status-"+Guid.NewGuid().ToString("N")));manager.Configure(id.Paths);
            var status=JsonSerializer.SerializeToElement(manager.RuntimeStatus());Require(status.GetProperty("api").GetInt32()==15&&status.GetProperty("effectsOnly").GetBoolean());
        });
        foreach(string component in new[]{"coe5se_loader.dll","coe5se.c5plugin.dll"})check("Mixed dev/3.4.4 "+component+" refuses without loading binaries",()=>{
            string mixed=Path.Combine(folder,"mixed-dev-"+Guid.NewGuid().ToString("N"));Directory.CreateDirectory(mixed);
            foreach(var f in GameRuntime.FilesDev.Where(p=>p.Key.StartsWith("profile/")||p.Key=="runtime/glu32.dll"))File.Copy(Path.Combine(ext,Path.GetFileName(f.Key)),Path.Combine(mixed,Path.GetFileName(f.Key)));
            File.Copy(Path.Combine(old,component),Path.Combine(mixed,component),true);Refused(()=>GameRuntime.Verify(new(game,mixed)));
        });
    }
}
