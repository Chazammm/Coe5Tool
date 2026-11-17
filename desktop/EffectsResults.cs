using System.IO;
using System.Text.Json;
namespace CoE5Workbench;

internal sealed partial class IsolatedTests
{
    internal object EffectBrowserResult(string id)
    {
        Refresh();var s=ReadPrepared(id);string folder=SessionRoot(id);
        if(!s.EffectsBrowser||s.Status!="exited")throw new InvalidDataException("Quit the effects-browser game normally and refresh before reading its receipt.");
        using var doc=JsonDocument.Parse(LocalFiles.ReadText(Path.Combine(folder,"candidate.json"),2*1024*1024));var c=TestCandidate.ReadForReview(doc.RootElement);
        if(!c.EffectsBrowser||c.ModId!=s.ModId||c.SpellName!=s.Spell||c.ExtenderVersion!=GameRuntime.SessionVersion(s)||s.Revision!=GameRuntime.TextHash(c.Mode+"\0"+c.Source)||c.Target!=s.Target)throw new InvalidDataException("Effects-browser session identity differs.");
        foreach(var f in c.Files){string path=Path.Combine(folder,"profile","mods",c.ModId,f.Key);GameRuntime.SafePath(path);if(LocalFiles.ReadText(path,128*1024)!=f.Value)throw new InvalidDataException("Retained browser helper changed; no receipt can be associated safely.");}
        if(production)foreach(var f in GameRuntime.FilesFor(c.ExtenderVersion)){string path=Path.Combine(folder,f.Key);GameRuntime.SafePath(path);if(GameRuntime.Hash(path)!=f.Value)throw new InvalidDataException("Retained browser runtime changed.");}
        string area=TestExchange.Area(folder,c.ModId),run=TestExchange.Run(s.ResultRun),contextPath=Path.Combine(area,"workbench-session.ini");GameRuntime.SafePath(contextPath);
        if(LocalFiles.ReadText(contextPath,16384).Replace("\r\n","\n")!=TestExchange.ContextText(s,c))throw new InvalidDataException("Browser launch binding differs.");
        string result=Path.Combine(area,"wb-effects-"+run+".ini");GameRuntime.SafePath(result);
        if(!File.Exists(result))throw new InvalidDataException("No bound browser receipt was saved. Inspect its session log; no effect or cast is inferred.");
        return EffectsResults.Decode(LocalFiles.ReadText(result,256*1024),s,c);
    }
}
internal static class EffectsResults
{
    internal static object Decode(string text,IsolatedTests.Session s,TestCandidate c)
    {
        var sections=TestExchange.Parse(text);if(!c.EffectsBrowser||!s.EffectsBrowser||!sections.TryGetValue("meta",out var m))throw new InvalidDataException("Invalid browser receipt.");
        string Get(string key)=>m.TryGetValue(key,out var v)?v:throw new InvalidDataException("Missing browser field: "+key);
        if(Get("schema")!="wb-effects-1"||Get("session")!=s.Id||Get("revision")!=s.Revision||Get("run")!=TestExchange.Run(s.ResultRun)||Get("mod")!=c.ModId||Get("runtime")!=c.ExtenderVersion||Get("visualobserved")!="unknown"||Get("hit")!="unknown")throw new InvalidDataException("Receipt is not bound to this browser launch, or claims unsupported observations.");
        string stage=Get("stage");if(stage is not("ready"or"inspected"or"cast-requested"or"cast-returned"or"closed"or"error"))throw new InvalidDataException("Unknown browser stage.");
        int calls=TestExchange.Integer(m,"calls",0,int.MaxValue),count=TestExchange.Integer(m,"count",0,64),discarded=TestExchange.Integer(m,"discarded",0,int.MaxValue),returned=0;
        int? requests=m.ContainsKey("requests")?TestExchange.Integer(m,"requests",calls,int.MaxValue):null;
        if(sections.Count!=count+1)throw new InvalidDataException("Incomplete or extra browser history.");
        var entries=new List<object>();for(int i=1;i<=count;i++){
            if(!sections.TryGetValue("entry"+i,out var e))throw new InvalidDataException("Missing browser history entry.");
            string Field(string key)=>e.TryGetValue(key,out var value)?value:throw new InvalidDataException("Missing browser history field.");
            string kind=Field("kind"),ev=Field("event"),name=Field("name");if(kind is not("spells"or"weapons"or"impact"or"particle"or"sprite"or"effects")||ev is not("inspected"or"cast-returned")||name.Length is <1 or >1500||e.Count!=10)throw new InvalidDataException("Invalid browser history fields.");
            int rid=TestExchange.Integer(e,"id",0,kind=="spells"?1028:kind=="weapons"?1199:299),ret=TestExchange.Integer(e,"returned",0,1);
            if(ret!=(ev=="cast-returned"?1:0)||kind=="effects"&&ret!=0)throw new InvalidDataException("Inspect-only slot cannot claim a returned cast.");returned+=ret;
            int weapon=TestExchange.SignedInteger(e,"weapon");if(weapon is < -1 or >6998||kind=="spells"&&weapon>1199||kind is "impact"or"particle"or"sprite"or"weapons"&&ret==1&&weapon<1200)throw new InvalidDataException("Browser weapon role differs.");
            entries.Add(new{kind,id=rid,name,@event=ev,weapon,payload=Field("payload"),look=TestExchange.SignedInteger(e,"look"),flymode=TestExchange.SignedInteger(e,"flymode"),flylook=TestExchange.SignedInteger(e,"flylook"),returned=ret});
        }
        if(returned>calls)throw new InvalidDataException("History exceeds total returned calls.");
        return new{id=s.Id,stage,requests,calls,discarded,entries,exitCode=s.ExitCode,summary=(requests.HasValue?requests+" cast request(s) · ":"Requests not recorded · ")+calls+" forced call(s) returned · "+stage+" · "+count+" retained entries"+(discarded>0?" · "+discarded+" older entries discarded":"")+". Hits, named casts and appearance are unknown. Field closure is not complete rollback. No draft values were changed.",message=Get("message")};
    }
}
