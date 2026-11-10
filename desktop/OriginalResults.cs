using System.IO;
using System.Text.Json;

namespace CoE5Workbench;

internal sealed partial class IsolatedTests
{
    internal object InstalledChoices() => VanillaCatalog.Read(ReadPaths().GameExe);
    internal object OriginalObservation(string id)
    {
        var s=ReadPrepared(id); string folder=SessionRoot(id);
        if(!s.OriginalRecord||s.Status!="exited")throw new InvalidDataException("Quit the original-observation game and refresh before reviewing its recorded facts.");
        using var doc=JsonDocument.Parse(LocalFiles.ReadText(Path.Combine(folder,"candidate.json"),2*1024*1024));
        var c=TestCandidate.ReadForReview(doc.RootElement);
        if(!c.OriginalRecord||c.ModId!=s.ModId||c.SpellName!=s.Spell||s.Revision!=GameRuntime.TextHash(c.Mode+"\0"+c.Source))throw new InvalidDataException("Original observation identity differs.");
        foreach(var f in c.Files){string path=Path.Combine(folder,"profile","mods",c.ModId,f.Key);GameRuntime.SafePath(path);if(LocalFiles.ReadText(path,128*1024)!=f.Value)throw new InvalidDataException("Retained helper changed; recorded facts cannot be associated safely.");}
        if(c.ExtenderVersion!=GameRuntime.SessionVersion(s))throw new InvalidDataException("Retained observation/runtime version differs.");
        if(production)foreach(var f in LocalRosterRuntime.Expected(false,c.ExtenderVersion)){string path=Path.Combine(folder,f.Key);GameRuntime.SafePath(path);if(GameRuntime.Hash(path)!=f.Value)throw new InvalidDataException("Retained runtime fingerprint changed.");}
        string area=TestExchange.Area(folder,c.ModId),run=TestExchange.Run(s.ResultRun);
        string contextPath=Path.Combine(area,"workbench-session.ini");GameRuntime.SafePath(contextPath);
        var context=TestExchange.Parse(LocalFiles.ReadText(contextPath,16384));
        var expected=TestExchange.Parse(TestExchange.ContextText(s,c));
        if(context.Count!=1||!context.TryGetValue("session",out var binding)||binding.Count!=expected["session"].Count||expected["session"].Any(p=>!binding.TryGetValue(p.Key,out var value)||value!=p.Value))throw new InvalidDataException("Observation launch binding differs.");
        string result=Path.Combine(area,"wb-original-"+run+".ini");GameRuntime.SafePath(result);
        if(!File.Exists(result))return new{id,available=false,detail="No bound helper observation was saved. Inspect the session log; no battle, hit or visual result is inferred."};
        return OriginalResults.Decode(LocalFiles.ReadText(result,32768),s,c);
    }
}

internal static class OriginalResults
{
    internal static object Decode(string text,IsolatedTests.Session s,TestCandidate c)
    {
        var all=TestExchange.Parse(text);
        if(all.Count!=1||!all.TryGetValue("meta",out var m))throw new InvalidDataException("Invalid original-observation packet.");
        using var identity=JsonDocument.Parse(c.Source);var r=identity.RootElement;
        string Get(string key)=>m.TryGetValue(key,out var value)?value:throw new InvalidDataException("Missing observation field: "+key);
        string kind=r.GetProperty("type").GetString()!,name=r.GetProperty("name").GetString()!;
        int requested=r.GetProperty("id").ValueKind==JsonValueKind.Null?-1:r.GetProperty("id").GetInt32();
        if(Get("schema")!="wb-original-1"||Get("session")!=s.Id||Get("revision")!=s.Revision||Get("run")!=TestExchange.Run(s.ResultRun)||Get("mod")!=c.ModId||Get("kind")!=kind||Get("requested")!=name||TestExchange.SignedInteger(m,"requestedid")!=requested||Get("forcedcasts")!="0")throw new InvalidDataException("Observation is not bound to this original record and launch.");
        string stage=Get("stage");if(stage is not "opened" and not "battle" and not "closed" and not "cancelled" and not "error")throw new InvalidDataException("Unknown observation stage.");
        int battles=TestExchange.Integer(m,"battles",0,int.MaxValue),stops=TestExchange.Integer(m,"stops",0,battles);
        var facts=new Dictionary<string,string>();
        if(m.ContainsKey("selected")){
            int selected=TestExchange.Integer(m,"selected",0,kind=="spell"?1028:1199),spell=TestExchange.SignedInteger(m,"spell"),weapon=TestExchange.Integer(m,"weapon",0,1199);
            if(requested>=0&&selected!=requested||spell is < -1 or >1028||kind=="spell"&&spell!=selected||kind=="weapon"&&weapon!=selected)throw new InvalidDataException("Resolved record identity differs.");
            _=TestExchange.Integer(m,"caster",0,1999);_=TestExchange.Integer(m,"knownunchanged",0,1);
            foreach(string key in new[]{"selected","spell","weapon","weaponname","caster","castername","spellname","path","level","payload","knownunchanged","dmg","dmgtype","range","init","aoe","trgrank","look","flymode","flylook","sound","flysound"})if(m.TryGetValue(key,out var v))facts[key]=v;
        }else if(stage is "opened" or "battle" or "closed")throw new InvalidDataException("Opened field has no recorded identities.");
        string? requestedTargets=null;
        if(c.Files.TryGetValue("manifest.json",out var manifestText)){
            using var manifest=JsonDocument.Parse(manifestText);var t=manifest.RootElement.GetProperty("test");
            requestedTargets=t.GetProperty("enemy").GetString()+(t.TryGetProperty("enemyId",out var enemyId)?" #"+enemyId.GetString():" · ID resolved in game")+" × "+t.GetProperty("count").GetString();
        }
        return new{id=s.Id,available=true,stage,battles,stops,facts,requestedTargets,message=m.GetValueOrDefault("message"),exitCode=s.ExitCode,reportedOutcome=s.Observation,
            limitation="Helper facts only. Battle returns do not count AI casts or confirm selected-record use, hits, damage, positions or visible effects. Check the game log and your own observations separately. No values can be returned to a shared original."};
    }
}
