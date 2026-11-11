using System.IO;
using System.Text.Json;
namespace CoE5Workbench;
internal static class OfficialMixedSelfTest
{
    internal static void Run(string reportFile,Action<string,Action> check)
    {
        string parent=Path.GetDirectoryName(Path.GetFullPath(reportFile))!,input=Path.Combine(parent,"official-mixed-candidate.json");
        if(!File.Exists(input))return;
        var payload=JsonSerializer.Deserialize<JsonElement>(File.ReadAllText(input));var c=TestCandidate.Read(payload);
        string root=Path.Combine(parent,"official-receipt-"+Guid.NewGuid().ToString("N")),mods=Path.Combine(root,"profile","mods",c.ModId);
        Directory.CreateDirectory(mods);foreach(var f in c.Files)File.WriteAllText(Path.Combine(mods,f.Key),f.Value);
        var s=new IsolatedTests.Session{Id=new string('a',32),ModId=c.ModId,Spell=c.SpellName,Revision=GameRuntime.TextHash("c5m\0"+c.Source),ExtenderVersion=c.ExtenderVersion,Status="exited",ResultRun=new string('b',32),Roster=c.Roster,ExitCode=0,PrivateRanged=true};
        string area=TestExchange.Area(root,c.ModId);Directory.CreateDirectory(area);File.WriteAllText(Path.Combine(area,"workbench-session.ini"),TestExchange.ContextText(s,c));
        string ini="[meta]\nschema=wb-official-mixed-1\nmod="+c.ModId+"\nsession="+s.Id+"\nrevision="+s.Revision+"\nrun="+s.ResultRun+
            "\narea=5\ndmgtype=5\npayload=12\ntotal=3\nverified=3\nreturned=3\nbattles=1\nstopped=0\nopened=1\ncloseattempted=1\nclosereturned=1\nmenuafterclose=1\nstatus=closed\nmessage=\nphase=after-battle-return\ninactive=4\ncarrier=2000\nweapon=1200\n";
        for(int i=1;i<=3;i++)ini+="[unit"+i+"]\ninstance="+(i+1)+"\nmonster="+(i==3?487:609)+"\nname="+(i==3?"Winter Wolf":"Deer")+"\nbeforehp="+(i==3?13:6)+"\nafterhp="+(i==1?3:0)+"\nresistance="+(i==3?100:0)+"\nsetupx=18\nsetupy="+(8+i)+"\nendx=unavailable\nendy=unavailable\n";
        string receipt=Path.Combine(area,"wb-mixed-"+s.ResultRun+".ini");
        JsonElement Read(string text){File.WriteAllText(receipt,text);return JsonSerializer.SerializeToElement(OfficialMixedResults.Read(root,s,c));}
        void Require(bool yes){if(!yes)throw new Exception("Assertion failed");}
        void Refused(Action a){try{a();}catch{return;}throw new Exception("Expected refusal");}
        check("Official mixed candidate uses only official 3.2.2 runtime, bounded roster and immutable helper",()=>{
            Require(c.Roster?.Length==2&&!c.WeaponEditing&&GameRuntime.OfficialGroups(c.ExtenderVersion)&&c.AreaCode==5);
            Require(LocalRosterRuntime.Expected(true,"3.2.2")[LocalRosterRuntime.PluginKey]==GameRuntime.FilesFor("3.2.2")[LocalRosterRuntime.PluginKey]);
            var changed=System.Text.Json.Nodes.JsonNode.Parse(payload.GetRawText())!;
            var helper=changed["files"]!.AsArray().Single(f=>f!["name"]!.GetValue<string>().EndsWith(".lua"))!;
            helper["text"]=helper["text"]!.GetValue<string>()+"\nchanged";Refused(()=>TestCandidate.Read(JsonSerializer.SerializeToElement(changed)));
        });
        check("Official result distinguishes close-returned, null rollback, positions and per-unit state",()=>{
            var r=Read(ini);Require(r.GetProperty("restored").ValueKind==JsonValueKind.Null&&r.GetProperty("closed").GetBoolean());
            Require(r.GetProperty("units").GetArrayLength()==3&&r.GetProperty("units")[2].GetProperty("resistance").GetInt32()==100);
            Require(r.GetProperty("units")[0].GetProperty("setupPosition").GetProperty("x").GetInt32()==18&&r.GetProperty("units")[0].GetProperty("endPosition").ValueKind==JsonValueKind.Null);
        });
        check("Official result rejects foreign run, count/type/instance corruption, invented rollback and invalid positions",()=>{
            foreach(string wrong in new[]{ini.Replace("run="+s.ResultRun,"run="+new string('c',32)),ini.Replace("total=3","total=4"),ini.Replace("monster=487","monster=609"),ini.Replace("instance=3","instance=2"),ini.Replace("message=\n","message=\nrestored=1\n"),ini.Replace("setupy=9","setupy=20"),ini.Replace("status=closed","status=madeup")})Refused(()=>Read(wrong));
        });
        check("Official incomplete closure is not a completed result; error readings remain inspectable",()=>{
            string unknown=ini.Replace("closereturned=1","closereturned=0").Replace("menuafterclose=1","menuafterclose=0");Refused(()=>Read(unknown));
            var r=Read(unknown.Replace("status=closed","status=error"));Require(!r.GetProperty("closed").GetBoolean()&&r.GetProperty("restored").ValueKind==JsonValueKind.Null);
        });
        check("Official creation failure keeps requested count and explicitly zero verified identities",()=>{
            string failed=ini[..ini.IndexOf("[unit1]",StringComparison.Ordinal)].Replace("verified=3","verified=0").Replace("returned=3","returned=-1").Replace("battles=1","battles=0").Replace("opened=1","opened=0").Replace("status=closed","status=error").Replace("phase=after-battle-return","phase=setup").Replace("inactive=4","inactive=unavailable");
            Require(Read(failed).GetProperty("units").GetArrayLength()==0);
        });
        check("Official interrupted open/battle receipts preserve unknown closure rather than claiming cleanup",()=>{
            string opened=ini.Replace("status=closed","status=opened").Replace("battles=1","battles=0").Replace("closeattempted=1","closeattempted=0").Replace("closereturned=1","closereturned=0").Replace("menuafterclose=1","menuafterclose=0").Replace("phase=after-battle-return","phase=setup");
            Require(!Read(opened).GetProperty("closed").GetBoolean());
            Require(Read(opened.Replace("status=opened","status=battle-returned").Replace("battles=0","battles=1").Replace("phase=setup","phase=after-battle-return")).GetProperty("battleReturns").GetInt32()==1);
        });
        check("Official cancellation and unknown after-position/HP are separate from complete battle and damage",()=>{
            var r=Read(ini.Replace("status=closed","status=cancelled").Replace("battles=1","battles=0").Replace("phase=after-battle-return","phase=before-close").Replace("afterhp=3","afterhp=unavailable"));
            Require(r.GetProperty("battleReturns").GetInt32()==0&&r.GetProperty("units")[0].GetProperty("afterHp").ValueKind==JsonValueKind.Null);
        });
        check("Stale official snapshot stays reviewable but changed source/helper cannot gain result association",()=>{
            s.Stale=true;Require(Read(ini).GetProperty("stale").GetBoolean());s.Stale=false;
            string helper=Path.Combine(mods,c.ModId+".lua"),original=File.ReadAllText(helper);File.AppendAllText(helper,"\nchanged");Refused(()=>Read(ini));File.WriteAllText(helper,original);
        });
    }
}
