using System.IO;
using System.Text.Json;
namespace CoE5Workbench;
internal static class MixedResults
{
    internal static object Read(string folder,IsolatedTests.Session session,TestCandidate candidate){
        if(candidate.Roster is not { } roster || session.Status!="exited" || session.Id.Length!=32 ||
            session.Revision!=GameRuntime.TextHash("c5m\0"+candidate.Source) || session.ModId!=candidate.ModId)
            throw new InvalidDataException("Exit the matching mixed session before reading its observation.");
        string path=Path.Combine(TestExchange.Area(folder,candidate.ModId),"wb-mixed-"+TestExchange.Run(session.ResultRun)+".ini");
        var data=TestExchange.Parse(LocalFiles.ReadText(path,1024*1024));
        var meta=data["meta"];
        if(meta["schema"]!="wb-mixed-1" || meta["session"]!=session.Id || meta["revision"]!=session.Revision ||
            meta["run"]!=session.ResultRun || meta["mod"]!=candidate.ModId || TestExchange.Integer(meta,"area",0,5)!=candidate.AreaCode)
            throw new InvalidDataException("Mixed receipt differs from the prepared session.");
        int total=roster.Sum(r=>r.count);
        if(TestExchange.Integer(meta,"total",1,200)!=total || data.Count!=total+1)throw new InvalidDataException("Incomplete mixed observation.");
        var units=new List<object>();var seen=new HashSet<int>();int index=0;
        foreach(var group in roster)for(int i=0;i<group.count;i++){
            var row=data["unit"+(++index)];
            int unit=TestExchange.Integer(row,"instance",0,98999);
            if(!seen.Add(unit)||TestExchange.Integer(row,"monster",0,1999)!=group.id||row["name"]!=group.name)throw new InvalidDataException("Mixed defender identity differs.");
            int? resistance=row["resistance"]=="unavailable"?null:TestExchange.SignedInteger(row,"resistance");
            units.Add(new{unit,monster=group.id,name=group.name,beforeHp=TestExchange.SignedInteger(row,"beforehp"),
                afterHp=row.ContainsKey("afterhp")?(int?)TestExchange.SignedInteger(row,"afterhp"):null,resistance});
        }
        string? element=candidate.DamageType switch{4=>"fire",5=>"cold",6=>"shock",_=>null};
        return new{sessionId=session.Id,areaCode=candidate.AreaCode,element,units,battleReturns=TestExchange.Integer(meta,"battles",0,1),
            closed=meta["closed"]=="1",restored=meta["restored"]=="1",status=meta["status"],positionsAvailable=false};
    }
}
