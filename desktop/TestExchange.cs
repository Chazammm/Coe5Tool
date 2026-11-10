using System.Globalization;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace CoE5Workbench;

// Data only. Every filename is derived from an owned session and validated tokens, never a bridge path.
internal static class TestExchange
{
    internal static string Run(string? value) => value != null && Regex.IsMatch(value, "^[a-f0-9]{32}\\z") ? value : throw new InvalidDataException("This launch has no valid result binding. Prepare a new session for structured export.");
    internal static string Area(string folder, string modId)
    {
        if (!Regex.IsMatch(modId, "^[A-Za-z][A-Za-z0-9_]{0,31}\\z")) throw new InvalidDataException("Invalid test mod identity.");
        string path = Path.Combine(folder, "profile", "coe5se_data", modId); GameRuntime.SafePath(path); return path;
    }
    internal static string ContextText(IsolatedTests.Session session, TestCandidate candidate)
        => "[session]\nschema=wb-session-1\nid=" + session.Id + "\nrevision=" + session.Revision + "\nrun=" + Run(session.ResultRun) + "\nmod=" + candidate.ModId + "\n";
    internal static string ResultPath(string folder, IsolatedTests.Session s) => Path.Combine(Area(folder, s.ModId), "wb-result-" + Run(s.ResultRun) + ".ini");
    internal static string CatalogPath(string folder, IsolatedTests.Session s, string part)
    {
        if (!new[] { "meta", "monsters", "weapons", "spells", "effects" }.Contains(part)) throw new InvalidDataException("Unknown catalog part.");
        return Path.Combine(Area(folder, s.ModId), "wb-cat-" + part + "-" + Run(s.ResultRun) + ".ini");
    }
    internal static Dictionary<string, Dictionary<string, string>> Parse(string text)
    {
        if (LocalFiles.Utf8.GetByteCount(text) > 1024 * 1024 || text.Contains('\0')) throw new InvalidDataException("Result data is oversized or binary.");
        var sections = new Dictionary<string, Dictionary<string, string>>(StringComparer.Ordinal); Dictionary<string, string>? current = null;
        foreach (string raw in text.Split('\n'))
        {
            string line = raw.TrimEnd('\r');
            if (line == "" || line.StartsWith(';') || line.StartsWith('#')) continue;
            if (line.Length > 2048 || line.Any(c => c < 32)) throw new InvalidDataException("Unsupported result line.");
            if (line.StartsWith('[') && line.EndsWith(']'))
            {
                string name = line[1..^1];
                if (!Regex.IsMatch(name, "^[a-z][a-z0-9]*\\z") || !sections.TryAdd(name, current = new(StringComparer.Ordinal))) throw new InvalidDataException("Invalid or repeated result section.");
            }
            else
            {
                int eq = line.IndexOf('=');
                if (current == null || eq < 1 || !Regex.IsMatch(line[..eq], "^[a-z][a-z0-9]*\\z") || !current.TryAdd(line[..eq], line[(eq + 1)..])) throw new InvalidDataException("Malformed or repeated result key.");
            }
        }
        return sections;
    }
    internal static int Integer(Dictionary<string, string> values, string key, int min, int max)
    {
        if (!values.TryGetValue(key, out string? text) || !Regex.IsMatch(text, "^[0-9]+\\z") || !int.TryParse(text, NumberStyles.None, CultureInfo.InvariantCulture, out int n) || n < min || n > max) throw new InvalidDataException("Invalid result value: " + key + ".");
        return n;
    }
    internal static int SignedInteger(Dictionary<string,string> row,string key)
    {
        if(!row.TryGetValue(key,out string? text)||!Regex.IsMatch(text,"^-?[0-9]+\\z")||!int.TryParse(text,NumberStyles.AllowLeadingSign,CultureInfo.InvariantCulture,out int value))throw new InvalidDataException("Invalid visual value: "+key+".");return value;
    }
    private static bool VisualsAllowed(Dictionary<string,int> value,Dictionary<string,int> baseline)
        => (value["look"] is >=0 and <=299 || value["look"]==baseline["look"]) &&
        ((value["flymode"]==baseline["flymode"]&&value["flylook"]==baseline["flylook"]) || (value["flymode"] is >=2 and <=9 && value["flylook"] is >=0 and <=299));
    private static void Keys(Dictionary<string, string> row, params string[] keys)
    {
        if (row.Count != keys.Length || keys.Any(k => !row.ContainsKey(k))) throw new InvalidDataException("Missing or unsupported result fields.");
    }
    // A group receipt stores one "instance,resistance" pair per defender, numbered from 1.
    private static object GroupReading(Dictionary<string,string> row, NativeTarget target)
    {
        int id=Integer(row,"target",0,1999), count=Integer(row,"targetcount",2,200);
        if(id!=target.id || count!=target.count || row.Count!=8+count ||
                new[]{"parameter","battles","readback","look","flymode","flylook"}.Any(k=>!row.ContainsKey(k)))
            throw new InvalidDataException("Saved defender group differs from preparation.");
        var units=new List<object>();
        var seen=new HashSet<int>();
        for(int i=1;i<=count;i++){
            var parts=row.GetValueOrDefault("unit"+i.ToString(CultureInfo.InvariantCulture))?.Split(',');
            if(parts?.Length!=2 || !int.TryParse(parts[0],NumberStyles.None,CultureInfo.InvariantCulture,out int unit) ||
                unit is <0 or >=99000 || !seen.Add(unit))throw new InvalidDataException("Missing, duplicate or invalid defender instance.");
            int? resistance=null;
            if(parts[1]!="unavailable"){
                if(!int.TryParse(parts[1],NumberStyles.AllowLeadingSign,CultureInfo.InvariantCulture,out int value))
                    throw new InvalidDataException("Invalid defender resistance.");
                resistance=value;
            }
            units.Add(new {unit,resistance});
        }
        return new {id,units};
    }
    private static object MixedReading(Dictionary<string,string> row, NativeTarget[] roster) {
        int total=roster.Sum(g=>g.count);
        if(Integer(row,"targetcount",1,200)!=total || row.Count!=9+total || row.GetValueOrDefault("closed")!="1" || row.GetValueOrDefault("restored")!="1")
            throw new InvalidDataException("Incomplete mixed comparison or unverified cleanup.");
        var units=new List<object>();var seen=new HashSet<int>();int at=0;
        foreach(var g in roster)for(int n=0;n<g.count;n++){
            var parts=row.GetValueOrDefault("unit"+(++at))?.Split(',');
            if(parts?.Length!=5)throw new InvalidDataException("Missing mixed defender reading.");
            var fields=new Dictionary<string,string>{{"unit",parts[0]},{"monster",parts[1]},{"before",parts[2]},{"after",parts[3]},{"resistance",parts[4]}};
            int unit=Integer(fields,"unit",0,98999);
            if(!seen.Add(unit)||Integer(fields,"monster",0,1999)!=g.id)throw new InvalidDataException("Mixed defender identity differs.");
            int? resistance=parts[4]=="unavailable"?null:SignedInteger(fields,"resistance");
            units.Add(new{unit,monster=g.id,name=g.name,beforeHp=SignedInteger(fields,"before"),afterHp=SignedInteger(fields,"after"),resistance});
        }
        return new{units,closed=true,restored=true};
    }
    private static void Binding(Dictionary<string, string> row, IsolatedTests.Session s, TestCandidate c, string schema)
    {
        if (row.GetValueOrDefault("schema") != schema || row.GetValueOrDefault("session") != s.Id || row.GetValueOrDefault("revision") != s.Revision || row.GetValueOrDefault("run") != Run(s.ResultRun) || row.GetValueOrDefault("mod") != c.ModId)
            throw new InvalidDataException("Result belongs to another session, launch or prepared source revision.");
    }
    internal static object Context(IsolatedTests.Session s, TestCandidate c)
    {
        using var doc = JsonDocument.Parse(c.Files["manifest.json"]); var d = doc.RootElement.GetProperty("definitions");
        bool vfx=doc.RootElement.GetProperty("workbenchVersion").GetString() is "0.11.0" or "0.12.0" or "0.13.0" or "0.14.0" or "0.15.0" or "0.16.0" or "0.16.1" or "0.17.0" or "0.18.0-rc.1" or "0.18.0-rc.2" or GameRuntime.PreviewWorkbenchVersion;
        var baseline=new Dictionary<string,string?>{{"dmgtype",d.GetProperty("dmgtype").GetString()},{"aoe",d.GetProperty("aoe").GetString()}};
        if(vfx)foreach(string key in new[]{"look","flymode","flylook"})baseline[key]=d.GetProperty(key).GetString();
        return new { sessionId = s.Id, sourceRevision = s.Revision, run = s.ResultRun ?? "", modId = c.ModId, spellName = c.SpellName, weaponName = d.GetProperty("weaponName").GetString(),
            mode = c.Mode, source = c.Source, baseline, damagePolicy=doc.RootElement.GetProperty("workbenchVersion").GetString() is "0.14.0" or "0.15.0" or "0.16.0" or "0.16.1" or "0.17.0" or "0.18.0-rc.1" or "0.18.0-rc.2" or GameRuntime.PreviewWorkbenchVersion?"documented-v1":"legacy-3-4", resultSchema=vfx?2:1,
            legacy = doc.RootElement.GetProperty("workbenchVersion").GetString() == "0.9.0", stale = s.Stale, runtime = GameRuntime.LabelFor(c.ExtenderVersion) };
    }
    static object RangedResults(string folder, IsolatedTests.Session s, TestCandidate c)
    {
        var baseline = c.ComparisonBaseline!;
        var context = new { sessionId=s.Id, sourceRevision=s.Revision, run=s.ResultRun??"", modId=c.ModId,
            spellName=c.SpellName, weaponName=c.SpellName["weapon ".Length..], mode=c.Mode, source=c.Source,
            baseline, target=c.Target, roster=c.Roster, areaCode=c.AreaCode, visualCatalog=c.ExpandedVisuals?2:1, resultSchema=c.Roster!=null?4:3, legacy=false, stale=s.Stale, runtime=c.Roster!=null?LocalRosterRuntime.Label:GameRuntime.LabelFor(c.ExtenderVersion) };
        try
        {
            string path=ResultPath(folder,s); GameRuntime.SafePath(path);
            if(!File.Exists(path)) throw new InvalidDataException("No completed comparison battle was saved for this launch.");
            var data=Parse(LocalFiles.ReadText(path,c.Roster!=null||c.Target?.count>1?1024*1024:65536));
            if(!data.TryGetValue("meta",out var meta))throw new InvalidDataException("Missing comparison metadata.");
            Keys(meta,"schema","session","revision","run","mod","count"); Binding(meta,s,c,c.Roster!=null?"wb-ranged-mixed-results-1":"wb-ranged-results-1");
            int count=Integer(meta,"count",1,32);
            if(data.Count!=count+1)throw new InvalidDataException("Incomplete battle history.");
            var samples=new List<object>(); int previous=0;
            Dictionary<string,int>? last=null;
            for(int index=1;index<=count;index++)
            {
                if(!data.TryGetValue("sample"+index,out var row))throw new InvalidDataException("Missing battle readback.");
                if(c.AreaCode>0 || c.Roster!=null){
                    if(Integer(row,"area",0,5)!=c.AreaCode)throw new InvalidDataException("Battle area differs from preparation.");
                    row.Remove("area");
                }
                object? targetReading=null, mixedReading=null;
                if(c.Roster is { } roster)mixedReading=MixedReading(row,roster);
                else if(c.Target is {count: >1} group)targetReading=GroupReading(row,group);
                else if(c.Target is { } defender){
                    Keys(row,"parameter","battles","readback","look","flymode","flylook","target","targetunit","targetresistance");
                    int targetId=Integer(row,"target",0,1999),unit=Integer(row,"targetunit",0,98999);
                    if(targetId!=defender.id)throw new InvalidDataException("Saved defender differs from the prepared target.");
                    int? resistance=row["targetresistance"]=="unavailable"?null:SignedInteger(row,"targetresistance");
                    targetReading=new {id=targetId,unit,resistance};
                }else Keys(row,"parameter","battles","readback","look","flymode","flylook");
                int revision=Integer(row,"parameter",previous,1000000), mode=Integer(row,"flymode",1,2),
                    flight=Integer(row,"flylook",0,299), impact=SignedInteger(row,"look");
                bool flightAllowed=c.ExpandedVisuals?MeleeCandidate.HasVisual(mode==1?"sprite":"particle",row["flylook"])
                    :mode==1?flight is 0 or 1 or 2 or 7:MeleeCandidate.ParticleNames.ContainsKey(row["flylook"]);
                bool impactAllowed=c.ExpandedVisuals?MeleeCandidate.HasVisual("impact",row["look"]):impact is 34 or 68;
                if(row["readback"]!="1"||row["battles"]!="1"||!flightAllowed||(!impactAllowed && !(impact==-1 && baseline["look"]=="")))
                    throw new InvalidDataException("Unsupported comparison readback.");
                var values=new Dictionary<string,int>{{"look",impact},{"flymode",mode},{"flylook",flight}};
                if(revision==0 && values.Any(p=>p.Value.ToString(CultureInfo.InvariantCulture)!=(baseline[p.Key]==""?"-1":baseline[p.Key])))
                    throw new InvalidDataException("Battle baseline differs from the prepared weapon.");
                if(last!=null && revision==previous && values.Any(p=>p.Value!=last[p.Key]))
                    throw new InvalidDataException("One applied revision has conflicting battle readbacks.");
                last=values;
                samples.Add(new {index,parameterRevision=revision,kind=revision==0?"baseline":"applied",battleCount=1,readBackConfirmed=true,areaCode=c.AreaCode,targetReading,mixedReading,values});
                previous=revision;
            }
            return new {context,samples,error=(string?)null};
        }
        catch(Exception e) when(e is IOException or InvalidDataException or UnauthorizedAccessException or DecoderFallbackException)
        { return new {context,samples=Array.Empty<object>(),error=e.Message}; }
    }
    internal static object Results(string folder, IsolatedTests.Session s, TestCandidate c)
    {
        if(c.OfficialMixedComparison)return OfficialComparisonResults.Read(folder,s,c);
        if(c.ComparisonBaseline!=null)return RangedResults(folder,s,c);
        object context = Context(s, c);
        using var manifest = JsonDocument.Parse(c.Files["manifest.json"]); var definitions = manifest.RootElement.GetProperty("definitions");
        bool vfx=manifest.RootElement.GetProperty("workbenchVersion").GetString() is "0.11.0" or "0.12.0" or "0.13.0" or "0.14.0" or "0.15.0" or "0.16.0" or "0.16.1" or "0.17.0" or "0.18.0-rc.1" or "0.18.0-rc.2" or GameRuntime.PreviewWorkbenchVersion;
        Dictionary<string,int>? runtimeBaseline=null;
        try
        {
            string path = ResultPath(folder, s); GameRuntime.SafePath(path);
            if (!File.Exists(path)) return new { context, samples = Array.Empty<object>(), error = "No structured result was saved for this launch. Use the helper's Save test values button, or enter values as a clearly labeled user report." };
            var data = Parse(LocalFiles.ReadText(path, 65536));
            if (!data.TryGetValue("meta", out var meta)) throw new InvalidDataException("Result metadata is missing.");
            string[] metaKeys=["schema","session","revision","run","mod","spell","weapon","format","count"];
            Keys(meta,vfx?[..metaKeys,"baselinelook","baselineflymode","baselineflylook"]:metaKeys); Binding(meta, s, c, vfx?"wb-results-2":"wb-results-1");
            if(vfx){runtimeBaseline=new();foreach(string key in new[]{"look","flymode","flylook"}){
                runtimeBaseline[key]=SignedInteger(meta,"baseline"+key);string prepared=definitions.GetProperty(key).GetString()!;
                if(prepared!=""&&int.Parse(prepared,CultureInfo.InvariantCulture)!=runtimeBaseline[key])throw new InvalidDataException("Loaded visual baseline differs from the prepared "+key+".");
            }}
            if (meta["spell"] != c.SpellName || meta["weapon"] != definitions.GetProperty("weaponName").GetString() || meta["format"] != c.Mode) throw new InvalidDataException("Result spell, weapon or source format differs.");
            int count = Integer(meta, "count", 1, 32), baselineArea = int.Parse(definitions.GetProperty("aoe").GetString()!, CultureInfo.InvariantCulture);
            if (data.Count != count + 1) throw new InvalidDataException("Result section count differs.");
            var samples = new List<object>(); int previous = 0;
            for (int i = 1; i <= count; i++)
            {
                if (!data.TryGetValue("sample" + i, out var row)) throw new InvalidDataException("Result sample is missing.");
                string[] rowKeys=["index","panel","parameter","dmgtype","aoe","casts","readback","kind"];
                Keys(row,vfx?[..rowKeys,"look","flymode","flylook"]:rowKeys);
                int index = Integer(row, "index", 1, 1000000), panel = Integer(row, "panel", 1, 1000000), parameter = Integer(row, "parameter", 0, 1000000);
                int type = Integer(row, "dmgtype", 1, 25), area = Integer(row, "aoe", 0, 200), casts = Integer(row, "casts", 0, 1000000);
                if (!DamageTypes.Allowed(int.Parse(definitions.GetProperty("dmgtype").GetString()!),type,manifest.RootElement.GetProperty("workbenchVersion").GetString() is "0.14.0" or "0.15.0" or "0.16.0" or "0.16.1" or "0.17.0" or "0.18.0-rc.1" or "0.18.0-rc.2" or GameRuntime.PreviewWorkbenchVersion)) throw new InvalidDataException("Result type would reinterpret the fixed payload.");
                if (index <= previous || row["readback"] != "1" || (area != 0 && area != 1 && area != 5 && area != baselineArea) || row["kind"] is not "baseline" and not "applied" || (row["kind"] == "baseline") != (parameter == 0)) throw new InvalidDataException("Unsupported or unordered result sample.");
                if (row["kind"] == "baseline" && (type.ToString(CultureInfo.InvariantCulture) != definitions.GetProperty("dmgtype").GetString() || area != baselineArea)) throw new InvalidDataException("Baseline result differs from the prepared values.");
                var values=new Dictionary<string,int>{{"dmgtype",type},{"aoe",area}};
                if(vfx){foreach(string key in new[]{"look","flymode","flylook"})values[key]=SignedInteger(row,key);
                    if(!VisualsAllowed(values,runtimeBaseline!) || row["kind"]=="baseline"&&runtimeBaseline!.Any(p=>values[p.Key]!=p.Value))throw new InvalidDataException("Unsupported effect IDs or flight interpretation.");}
                previous = index; samples.Add(new { index, panel, parameterRevision = parameter, values, castCount = casts, readBackConfirmed = true, kind = row["kind"] });
            }
            return new { context, samples, runtimeBaseline, error = (string?)null };
        }
        catch (Exception e) when (e is IOException or InvalidDataException or FormatException or DecoderFallbackException or UnauthorizedAccessException)
        {
            return new { context, samples = Array.Empty<object>(), error = e.Message + " No values were staged. Manual return remains a user report." };
        }
    }
    internal static object Catalog(string folder, IsolatedTests.Session s, TestCandidate c)
    {
        var metaPath = CatalogPath(folder, s, "meta"); GameRuntime.SafePath(metaPath);
        if (!File.Exists(metaPath)) throw new InvalidDataException("No runtime catalog was exported. In the isolated main menu use WB choices: " + c.ModId + ", then Quit and load it here.");
        var header = Parse(LocalFiles.ReadText(metaPath, 16384));
        if (header.Count != 1 || !header.TryGetValue("meta", out var meta)) throw new InvalidDataException("Invalid catalog metadata.");
        Keys(meta, "schema", "session", "revision", "run", "mod", "export"); Binding(meta, s, c, "wb-catalog-1"); int export = Integer(meta, "export", 1, 1000000);
        var entries = new List<object>(); var coverage = new List<object>();
        foreach (var spec in new[] { ("monsters", "monster", 6998), ("weapons", "weapon", 6998), ("spells", "spell", 4095), ("effects", "effect", 299) })
        {
            string path = CatalogPath(folder, s, spec.Item1); GameRuntime.SafePath(path);
            var data = Parse(LocalFiles.ReadText(path, 1024 * 1024));
            if (!data.TryGetValue("meta", out var info)) throw new InvalidDataException("Catalog part metadata missing.");
            Keys(info, "schema", "session", "revision", "run", "mod", "export", "kind", "count", "complete", "upper"); Binding(info, s, c, "wb-catalog-part-1");
            if (info["kind"] != spec.Item2 || Integer(info, "export", 1, 1000000) != export) throw new InvalidDataException("Catalog export is partial or from different snapshots.");
            int upper = Integer(info,"upper",0,spec.Item3), count = Integer(info, "count", 0, upper + 1), complete = Integer(info, "complete", 0, 1);
            if (spec.Item2 == "effect" && complete == 1 && count != upper + 1) throw new InvalidDataException("Complete effect enumeration is missing table rows.");
            if (data.Count != count + 1) throw new InvalidDataException("Catalog count differs."); var ids = new HashSet<int>();
            for (int i = 1; i <= count; i++)
            {
                if (!data.TryGetValue("entry" + i, out var row)) throw new InvalidDataException("Missing catalog entry.");
                int id = Integer(row, "id", 0, upper); string name = row.GetValueOrDefault("name") ?? throw new InvalidDataException("Missing catalog name.");
                string[] allowed = spec.Item2 == "weapon" ? ["id", "name", "look", "flymode", "flylook", "sound", "flysound"] : spec.Item2 == "spell" ? ["id", "name", "path", "level", "weapon"] : ["id", "name"];
                if (!ids.Add(id) || name.Length > 200 || (name.Length == 0 && spec.Item2 != "effect") || name.Any(x => x < 32) || row.Keys.Any(k => !allowed.Contains(k))) throw new InvalidDataException("Invalid catalog record.");
                var fields = new Dictionary<string, string>();
                foreach (var pair in row.Where(x => x.Key is not "id" and not "name"))
                {
                    if (!Regex.IsMatch(pair.Value, "^-?[0-9]+\\z") || !int.TryParse(pair.Value, out _)) throw new InvalidDataException("Invalid catalog metadata.");
                    fields.Add(pair.Key, pair.Value);
                }
                entries.Add(new { id, name, type = spec.Item2, fields });
            }
            coverage.Add(new { type = spec.Item2, count, complete = complete == 1, inspectedBound = upper });
        }
        return new { sessionId = s.Id, sourceRevision = s.Revision, run = s.ResultRun, modId = c.ModId, runtime = GameRuntime.LabelFor(c.ExtenderVersion), entries, coverage };
    }
}
