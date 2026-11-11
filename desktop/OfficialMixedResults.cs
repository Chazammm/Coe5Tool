using System.IO;
namespace CoE5Workbench;

// Data-only receipt for the official group API. Never maps close-returned to record rollback.
internal static class OfficialMixedResults
{
    internal static object Read(string folder,IsolatedTests.Session session,TestCandidate candidate)
    {
        if(!GameRuntime.OfficialGroups(candidate.ExtenderVersion) || GameRuntime.SessionVersion(session)!=candidate.ExtenderVersion || candidate.Roster is not {} roster || candidate.WeaponEditing ||
            session.Status!="exited" || session.Id.Length!=32 || session.ModId!=candidate.ModId || session.Spell!=candidate.SpellName ||
            session.Revision!=GameRuntime.TextHash("c5m\0"+candidate.Source) || !(session.Roster??[]).SequenceEqual(roster) )
            throw new InvalidDataException("Exit the matching official mixed session; changed associations are not accepted.");
        foreach(var f in candidate.Files){string p=Path.Combine(folder,"profile","mods",candidate.ModId,f.Key);GameRuntime.SafePath(p);if(LocalFiles.ReadText(p,256*1024)!=f.Value)throw new InvalidDataException("Retained mixed helper/source differs.");}
        string area=TestExchange.Area(folder,candidate.ModId),run=TestExchange.Run(session.ResultRun);
        var context=TestExchange.Parse(LocalFiles.ReadText(Path.Combine(area,"workbench-session.ini"),16384))["session"];
        if(context.Count!=5 || context["schema"]!="wb-session-1" || context["id"]!=session.Id || context["revision"]!=session.Revision || context["run"]!=run || context["mod"]!=candidate.ModId)
            throw new InvalidDataException("Mixed launch context differs.");
        var data=TestExchange.Parse(LocalFiles.ReadText(Path.Combine(area,"wb-mixed-"+run+".ini"),1024*1024));var m=data["meta"];
        string[] required=["schema","mod","session","revision","run","area","dmgtype","payload","total","verified","returned","battles","stopped","opened","closeattempted","closereturned","menuafterclose","status","message","phase","inactive","carrier","weapon"];
        string[] optional=["range","flymode","flylook","look","flightname","impactname"];
        if(required.Any(k=>!m.ContainsKey(k)) || m.Keys.Any(k=>!required.Contains(k)&&!optional.Contains(k)) || m["schema"]!="wb-official-mixed-1" ||
            m["session"]!=session.Id || m["revision"]!=session.Revision || m["run"]!=run || m["mod"]!=candidate.ModId || m["message"].Length>300)
            throw new InvalidDataException("Official mixed receipt binding/fields differ.");
        int Number(string key,int lo,int hi){int n=TestExchange.SignedInteger(m,key);if(n<lo||n>hi)throw new InvalidDataException("Invalid mixed value: "+key);return n;}
        int total=roster.Sum(r=>r.count),verified=Number("verified",0,total),returned=Number("returned",-1,200);
        if(Number("total",2,200)!=total || Number("area",0,5)!=candidate.AreaCode || Number("dmgtype",1,6)!=candidate.DamageType || data.Count!=verified+1)
            throw new InvalidDataException("Mixed configuration or recorded count differs.");
        using var manifest=System.Text.Json.JsonDocument.Parse(candidate.Files["manifest.json"]);
        if(m["payload"]!=manifest.RootElement.GetProperty("payload").GetString())throw new InvalidDataException("Mixed payload differs.");
        int battles=Number("battles",0,1),stopped=Number("stopped",0,1),opened=Number("opened",0,1),attempted=Number("closeattempted",0,1),closed=Number("closereturned",0,1),menu=Number("menuafterclose",0,1);
        int? inactive=m["inactive"]=="unavailable"?null:Number("inactive",0,verified+1);
        _=Number("carrier",-1,6998);_=Number("weapon",-1,6998);
        if(m["status"] is not ("closed" or "cancelled" or "error" or "opened" or "battle-returned") || m["phase"] is not ("setup" or "before-close" or "after-battle-return") ||
            closed>attempted || battles>opened || verified>0 && opened!=1 || battles==1 && (verified!=total||returned!=total))
            throw new InvalidDataException("Inconsistent official mixed lifecycle.");
        if(m["status"]!="error" && (opened!=1||verified!=total||returned!=total) ||
            m["status"]=="closed" && (closed!=1||menu!=1||inactive.HasValue&&inactive!=verified+1) ||
            m["status"]=="closed" && (battles!=1||stopped!=0||m["phase"]!="after-battle-return") ||
            m["status"]=="cancelled" && (battles==1?stopped!=1||m["phase"]!="after-battle-return":stopped!=0||m["phase"]!="before-close") ||
            m["status"]=="opened" && (battles!=0||m["phase"]!="setup") ||
            m["status"]=="battle-returned" && (battles!=1||m["phase"]!="after-battle-return"))
            throw new InvalidDataException("Incomplete closure cannot be presented as a completed observation.");
        object? Position(Dictionary<string,string> row,string prefix){
            string x=row[prefix+"x"],y=row[prefix+"y"];
            if(x=="unavailable"&&y=="unavailable")return null;
            return new{x=TestExchange.Integer(row,prefix+"x",0,1535),y=TestExchange.Integer(row,prefix+"y",0,19)};
        }
        var expected=roster.SelectMany(g=>Enumerable.Repeat(g,g.count)).ToArray();var seen=new HashSet<int>();var units=new List<object>();
        for(int i=0;i<verified;i++){
            var r=data["unit"+(i+1)];string[] keys=["instance","monster","name","beforehp","afterhp","resistance","setupx","setupy","endx","endy"];
            if(r.Count!=keys.Length||keys.Any(k=>!r.ContainsKey(k)))throw new InvalidDataException("Incomplete defender reading.");
            int unit=TestExchange.Integer(r,"instance",0,98999);var g=expected[i];
            if(!seen.Add(unit)||TestExchange.Integer(r,"monster",0,1999)!=g.id||r["name"]!=g.name)throw new InvalidDataException("Mixed defender identity differs.");
            units.Add(new{unit,monster=g.id,name=g.name,beforeHp=TestExchange.Integer(r,"beforehp",1,int.MaxValue),
                afterHp=r["afterhp"]=="unavailable"?(int?)null:TestExchange.SignedInteger(r,"afterhp"),
                resistance=r["resistance"]=="unavailable"?(int?)null:TestExchange.SignedInteger(r,"resistance"),
                setupPosition=Position(r,"setup"),endPosition=Position(r,"end")});
        }
        return new{sessionId=session.Id,stale=session.Stale,provenance="official-group-1",areaCode=candidate.AreaCode,element=candidate.DamageType switch{4=>"fire",5=>"cold",6=>"shock",_=>null},
            units,battleReturns=battles,closed=closed==1,restored=(bool?)null,status=m["status"],message=m["message"],phase=m["phase"],requested=total,returned,
            stopped=stopped==1,closeAttempted=attempted==1,mainMenuAfterClose=menu==1,trackedInactive=inactive,positionsAvailable=true,exitCode=session.ExitCode};
    }
}
