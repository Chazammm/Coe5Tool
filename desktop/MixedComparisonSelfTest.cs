using System.IO;
using System.Text.Json;
using System.Text.Json.Nodes;
namespace CoE5Workbench;
internal static class MixedComparisonSelfTest {
    internal static void Run(string reportFile,Action<string,Action> check){
        string evidence=Path.GetDirectoryName(Path.GetFullPath(reportFile))!,file=Path.Combine(evidence,"mixed-comparison-candidate.json");
        if(!File.Exists(file))return;
        check("Mixed visual comparison pins the canonical helper and both types, then validates independent per-battle receipts",()=>{
            void Require(bool yes){if(!yes)throw new InvalidDataException("Mixed comparison assertion failed");}
            string text=File.ReadAllText(file);var payload=JsonSerializer.Deserialize<JsonElement>(text);var c=TestCandidate.Read(payload);
            Require(c.WeaponEditing && c.PrivateRanged && c.ExpandedVisuals && c.Roster is {Length:2} && c.ComparisonBaseline!=null);
            var node=JsonNode.Parse(text)!;
            node["files"]!.AsArray().Single(f=>f!["name"]!.GetValue<string>().EndsWith(".lua"))!["text"]="return";
            bool refused=false;try{TestCandidate.Read(JsonSerializer.SerializeToElement(node));}catch(InvalidDataException){refused=true;}Require(refused);
            var s=new IsolatedTests.Session{Id=new string('a',32),Revision=GameRuntime.TextHash("c5m\0"+c.Source),ResultRun=new string('b',32),ModId=c.ModId,Status="exited"};
            string folder=Path.Combine(evidence,"mixed-comparison-replay");Directory.CreateDirectory(TestExchange.Area(folder,c.ModId));
            string ini="[meta]\nschema=wb-ranged-mixed-results-1\nsession="+s.Id+"\nrevision="+s.Revision+"\nrun="+s.ResultRun+"\nmod="+s.ModId+"\ncount=2\n";
            for(int i=1;i<=2;i++)ini+="[sample"+i+"]\nparameter="+(i-1)+"\nbattles=1\nreadback=1\nlook="+(i==1?68:49)+"\nflymode="+i+"\nflylook="+(i==1?7:197)+"\narea=0\ntargetcount=3\nclosed=1\nrestored=1\nunit1=2,609,6,6,unavailable\nunit2=3,609,6,6,unavailable\nunit3=4,487,13,8,unavailable\n";
            JsonElement Replay(string data){File.WriteAllText(TestExchange.ResultPath(folder,s),data);return JsonSerializer.SerializeToElement(TestExchange.Results(folder,s,c));}
            var p=Replay(ini);Require(p.GetProperty("samples").GetArrayLength()==2 && p.GetProperty("context").GetProperty("resultSchema").GetInt32()==4);
            Require(p.GetProperty("samples")[1].GetProperty("mixedReading").GetProperty("units")[2].GetProperty("monster").GetInt32()==487);
            foreach(string wrong in new[]{ini.Replace("restored=1","restored=0"),ini.Replace("closed=1","closed=0"),ini.Replace("3,609","2,609"),ini.Replace("4,487","4,609"),
                ini.Replace("targetcount=3","targetcount=4"),ini.Replace("area=0","area=1"),ini.Replace("readback=1","readback=0"),ini.Replace("battles=1","battles=0"),
                ini.Replace("flylook=197","flylook=299"),ini.Replace("unit3=4,487,13,8,unavailable\n",""),ini.Replace("wb-ranged-mixed-results-1","wb-ranged-results-1"),
                ini.Replace("13,8,unavailable","13,x,unavailable"),ini.Replace("unit1=2","extra=1\nunit1=2")})Require(Replay(wrong).GetProperty("samples").GetArrayLength()==0);
            File.WriteAllText(Path.Combine(evidence,"mixed-comparison-packet.json"),p.GetRawText());
            Require(LocalRosterRuntime.Expected(true)[LocalRosterRuntime.PluginKey]==LocalRosterRuntime.PluginSha256 &&
                LocalRosterRuntime.Expected(false)[LocalRosterRuntime.PluginKey]==GameRuntime.KnownFiles[LocalRosterRuntime.PluginKey]);
        });
    }
}
