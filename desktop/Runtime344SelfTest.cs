using System.IO;
using System.Text.Json;
using System.Text.Json.Nodes;
namespace CoE5Workbench;

internal static class Runtime344SelfTest
{
    internal static void Run(string reportFile, Action<string,Action> check)
    {
        void Require(bool value){if(!value)throw new Exception("Assertion failed");}
        void Refused(Action action){try{action();}catch{return;}throw new Exception("Expected refusal");}
        JsonElement Json(object value)=>JsonSerializer.SerializeToElement(value);
        check("3.4.4 API-14 identity is separate from API-11 and old helpers cannot be relabelled",()=>{
            Require(GameRuntime.ApiVersion("3.4.4")==14&&GameRuntime.ApiVersion("3.3.0")==11&&GameRuntime.ApiVersion("2.13.0")==10);
            Require(GameRuntime.FilesFor("3.4.4").Count==14&&GameRuntime.IdentifyOfficialPlugin(GameRuntime.Files344[LocalRosterRuntime.PluginKey])=="3.4.4");
            Require(GameRuntime.LabelFor("3.4.4").Contains("pending")&&GameRuntime.Evidence("3.4.4").Contains("private"));
            Require(GameRuntime.CandidateVersion(Json(new{workbenchVersion=GameRuntime.CurrentWorkbenchVersion,runtimeVersion="3.4.4"}))=="3.4.4");
            foreach(string old in new[]{"0.18.0","0.18.1","0.18.0-rc.3"})Refused(()=>GameRuntime.CandidateVersion(Json(new{workbenchVersion=old,runtimeVersion="3.4.4"})));
            foreach(string version in new[]{"3.4.3","3.4.5","latest"})Refused(()=>GameRuntime.FilesFor(version));
            foreach(string version in new[]{"3.3.0","3.2.2","2.13.0"})Require(GameRuntime.CandidateVersion(Json(new{workbenchVersion="0.18.1",runtimeVersion=version}))==version);
            Refused(()=>LocalRosterRuntime.Overlay(new(new("unused","unused"),"unused",new(),"3.4.4")));
        });
        string dir=Path.GetDirectoryName(Path.GetFullPath(reportFile))!,input=Path.Combine(dir,"runtime-compatibility-input.json");if(!File.Exists(input))return;
        using var document=JsonDocument.Parse(LocalFiles.ReadText(input,8*1024*1024));
        var rows=document.RootElement.GetProperty("runtimes").EnumerateArray().ToArray();var next=rows.FirstOrDefault(r=>r.GetProperty("version").GetString()=="3.4.4");if(next.ValueKind==JsonValueKind.Undefined)return;
        var previous=rows.First(r=>r.GetProperty("version").GetString()=="3.3.0");
        string game=next.GetProperty("gameExe").GetString()!,folder=next.GetProperty("extenderFolder").GetString()!,oldFolder=previous.GetProperty("extenderFolder").GetString()!;
        check("Complete 3.4.4 files verify and desktop metadata reports API 14 with pending game acceptance",()=>{
            var paths=new RuntimePaths(game,folder);var identity=GameRuntime.Verify(paths);Require(identity.ExtenderVersion=="3.4.4");
            string root=Path.Combine(dir,"metadata-344-"+Guid.NewGuid().ToString("N"));var manager=new IsolatedTests(root);manager.Configure(paths);var status=Json(manager.RuntimeStatus());Require(status.GetProperty("api").GetInt32()==14&&status.GetProperty("mixedSupported").GetBoolean());Require(status.GetProperty("label").GetString()!.Contains("pending"));
        });
        foreach(string name in new[]{"coe5se.c5plugin.dll","coe5se_loader.dll","CoE5SE.c5se"})check("3.4.4 refuses mixed 3.3.0 "+name+" without changing original files",()=>{
            string mixed=Path.Combine(dir,"mixed-344-"+Guid.NewGuid().ToString("N"));Directory.CreateDirectory(mixed);
            foreach(var row in GameRuntime.Files344.Where(r=>r.Key.StartsWith("profile/")||r.Key=="runtime/glu32.dll")){string file=Path.GetFileName(row.Key);File.Copy(Path.Combine(folder,file),Path.Combine(mixed,file));}
            File.Copy(Path.Combine(oldFolder,name),Path.Combine(mixed,name),true);Refused(()=>GameRuntime.Verify(new(game,mixed)));
        });
        check("3.4.4 canonical pair requires guarded helper, refuses edits to the private identity checks",()=>{
            var payload=next.GetProperty("candidates")[0];var candidate=TestCandidate.Read(payload);Require(candidate.ExtenderVersion=="3.4.4"&&candidate.Files[candidate.ModId+".lua"].Contains("Private weapon identity changed"));
            var forged=JsonNode.Parse(payload.GetRawText())!;foreach(var file in forged["files"]!.AsArray())if(file!["name"]!.GetValue<string>()==candidate.ModId+".lua")file["text"]=file["text"]!.GetValue<string>().Replace("weapon_id>=1200","weapon_id>=0",StringComparison.Ordinal);
            Refused(()=>TestCandidate.Read(JsonSerializer.SerializeToElement(forged)));
        });
    }
}
