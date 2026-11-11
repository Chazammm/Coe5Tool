using System.IO;
using System.Text.Json;
using System.Text.Json.Nodes;
namespace CoE5Workbench;
internal static class OfficialComparisonSelfTest
{
    internal static void Run(string reportFile,Action<string,Action> check)
    {
        string parent=Path.GetDirectoryName(Path.GetFullPath(reportFile))!,input=Path.Combine(parent,"official-comparison-candidate.json"),raw=Path.Combine(parent,"official-comparison-journal.ini");
        if(!File.Exists(input)||!File.Exists(raw))return;
        var payload=JsonSerializer.Deserialize<JsonElement>(File.ReadAllText(input));var c=TestCandidate.Read(payload);
        string folder=Path.Combine(parent,"official-comparison-"+Guid.NewGuid().ToString("N"));
        var s=new IsolatedTests.Session{Id=new string('a',32),ModId=c.ModId,Spell=c.SpellName,Revision=GameRuntime.TextHash("c5m\0"+c.Source),ExtenderVersion=c.ExtenderVersion,Status="exited",ResultRun=new string('b',32),Roster=c.Roster,ExitCode=0,PrivateRanged=true,WeaponEditing=true};
        string area=TestExchange.Area(folder,c.ModId);Directory.CreateDirectory(area);
        File.WriteAllText(Path.Combine(area,"workbench-session.ini"),TestExchange.ContextText(s,c));
        var original=TestExchange.Parse(File.ReadAllText(raw));
        Dictionary<string,Dictionary<string,string>> Copy()=>original.ToDictionary(p=>p.Key,p=>new Dictionary<string,string>(p.Value));
        JsonElement Read(Dictionary<string,Dictionary<string,string>> data) {
            string ini=string.Join("\n",data.Select(section=>"["+section.Key+"]\n"+string.Join("\n",section.Value.Select(v=>v.Key+"="+v.Value))+"\n"));
            File.WriteAllText(TestExchange.ResultPath(folder,s),ini);return JsonSerializer.SerializeToElement(TestExchange.Results(folder,s,c));
        }
        void Require(bool yes){if(!yes)throw new Exception("Assertion failed");}
        void Rejected(Dictionary<string,Dictionary<string,string>> data){var p=Read(data);Require(p.GetProperty("samples").GetArrayLength()==0&&!string.IsNullOrEmpty(p.GetProperty("error").GetString()));}
        check("Official comparison canonical JS/native helper parity and runtime/ownership contract",()=>{
            Require(c.OfficialMixedComparison&&c.WeaponEditing&&c.ExpandedVisuals&&GameRuntime.OfficialGroups(c.ExtenderVersion)&&c.Roster?.Length==2);
            foreach(string version in new[]{"2.13.0","3.2.1"}) {
                var n=JsonNode.Parse(payload.GetRawText())!;var manifest=n["files"]!.AsArray().Single(f=>f!["name"]!.GetValue<string>()=="manifest.json")!;
                var m=JsonNode.Parse(manifest["text"]!.GetValue<string>())!;m["runtimeVersion"]=version;manifest["text"]=m.ToJsonString();bool refused=false;
                try{TestCandidate.Read(JsonSerializer.SerializeToElement(n));}catch{refused=true;}Require(refused);
            }
            var bad=JsonNode.Parse(payload.GetRawText())!;var helper=bad["files"]!.AsArray().Single(f=>f!["name"]!.GetValue<string>().EndsWith(".lua"))!;
            helper["text"]=helper["text"]!.GetValue<string>()+"\nchanged";bool rejected=false;try{TestCandidate.Read(JsonSerializer.SerializeToElement(bad));}catch{rejected=true;}Require(rejected);
        });
        check("Generated Lua journal yields two independently bound native comparison readbacks",()=>{
            var p=Read(Copy());if(p.GetProperty("error").ValueKind!=JsonValueKind.Null)throw new Exception(p.GetProperty("error").GetString());Require(p.GetProperty("context").GetProperty("resultSchema").GetInt32()==5);
            var samples=p.GetProperty("samples");Require(samples.GetArrayLength()==2&&samples[1].GetProperty("values").GetProperty("look").GetInt32()==34);
            Require(samples[0].GetProperty("mixedReading").GetProperty("units")[0].GetProperty("unit").GetInt32()!=samples[1].GetProperty("mixedReading").GetProperty("units")[0].GetProperty("unit").GetInt32());
            Require(samples[1].GetProperty("mixedReading").GetProperty("restored").ValueKind==JsonValueKind.Null&&p.GetProperty("privateVisualsRestored").GetBoolean());
        });
        check("Official comparison refuses foreign run/attempt, forged payload, duplicate identities and new fields",()=>{
            foreach(var mutation in new Action<Dictionary<string,Dictionary<string,string>>>[]{d=>d["attempt2"]["run"]=new string('c',32),d=>d["attempt2"]["attempt"]="1",d=>d["attempt2"]["payload"]="99",d=>d["a2unit2"]["instance"]=d["a2unit1"]["instance"],d=>d["attempt2"]["restored"]="1",d=>d["a2unit1"]["setupy"]="20",d=>d["attempt2"]["dmgtype"]="3",d=>d["attempt2"]["unitsbefore"]="98999"}){var d=Copy();mutation(d);Rejected(d);}
        });
        check("Uncertain close or incomplete readback cannot be returned as a successful battle",()=>{
            foreach(string key in new[]{"closereturned","menuafterclose","readback"}){var d=Copy();d["attempt2"][key]="0";Rejected(d);}
            var failed=Copy();failed["attempt2"]["inactive"]="unavailable";Rejected(failed);
        });
        check("Cancelled first field retains its readings while only the later returned battle is selectable",()=>{
            var d=Copy();var row=d["attempt1"];row["status"]="cancelled";row["battles"]="0";row["readback"]="0";row["phase"]="before-close";
            var p=Read(d);Require(p.GetProperty("attempts").GetArrayLength()==2&&p.GetProperty("samples").GetArrayLength()==1&&p.GetProperty("samples")[0].GetProperty("attemptIndex").GetInt32()==2);
        });
        check("Interrupted comparison retains prior closed battle without upgrading the last open receipt",()=>{
            var d=Copy();d["meta"]["status"]="active";d["meta"]["visualsrestored"]="0";var row=d["attempt2"];
            row["status"]="battle-returned";row["closeattempted"]="0";row["closereturned"]="0";row["menuafterclose"]="0";row["inactive"]="unavailable";
            var p=Read(d);Require(p.GetProperty("samples").GetArrayLength()==1&&p.GetProperty("privateVisualsRestored").GetBoolean()==false&&!string.IsNullOrEmpty(p.GetProperty("error").GetString()));
            d["attempt1"]["status"]="error";Rejected(d);
        });
        check("Official comparison identities are scoped per attempt, including safe native ID reuse",()=>{
            var d=Copy();d["attempt2"]["carrierunit"]=d["attempt1"]["carrierunit"];for(int n=1;n<=3;n++)d["a2unit"+n]["instance"]=d["a1unit"+n]["instance"];
            Require(Read(d).GetProperty("samples").GetArrayLength()==2);
        });
        check("Private visual restore failure remains a warning distinct from earlier closed readbacks",()=>{
            var d=Copy();d["meta"]["status"]="error";d["meta"]["visualsrestored"]="0";d["meta"]["message"]="Restore unverified";
            var p=Read(d);Require(p.GetProperty("samples").GetArrayLength()==2&&!p.GetProperty("privateVisualsRestored").GetBoolean()&&!string.IsNullOrEmpty(p.GetProperty("error").GetString()));
            d["meta"]["status"]="finished";Rejected(d);
        });
        check("Stale comparison review preserves original association and refuses a different source revision",()=>{
            s.Stale=true;Require(Read(Copy()).GetProperty("context").GetProperty("stale").GetBoolean());s.Stale=false;
            string revision=s.Revision;s.Revision=new string('f',64);Rejected(Copy());s.Revision=revision;
        });
    }
}
