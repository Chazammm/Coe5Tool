using System.IO;
using System.Reflection;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace CoE5Workbench;

internal static class OriginalCandidate
{
    internal static TestCandidate Read(JsonElement payload, JsonElement m, string id, Dictionary<string,string> files,bool review)
    {
        string runtimeVersion=GameRuntime.CandidateVersion(m);
        if(!(m.GetProperty("workbenchVersion").GetString() is "0.16.0" or "0.16.1" or "0.17.0" or "0.18.0-rc.1" or GameRuntime.PreviewWorkbenchVersion||review&&m.GetProperty("workbenchVersion").GetString()=="0.15.0") || m.GetProperty("sourcePin").GetString()!=TestCandidate.Pin || m.GetProperty("gameTested").GetBoolean() || m.GetProperty("sourceMode").GetString()!="c5m" || m.GetProperty("execution").GetString()!="native-ai-battle" || m.GetProperty("editable").GetBoolean())throw new InvalidDataException("Unrecognized original-observation contract.");
        var r=m.GetProperty("record");string kind=r.GetProperty("type").GetString()!,name=r.GetProperty("name").GetString()!,origin=r.GetProperty("sourceKind").GetString()!;
        string Name(string v){if(v.Length is <1 or >63 || v.Trim()!=v || v.Any(c=>c<32||c>126||c is '"' or '#' or '\\'))throw new InvalidDataException("Unsafe record/participant name.");return v;}
        Name(name);if(kind is not "spell" and not "weapon" || origin is not "installed" and not "runtime" and not "historical")throw new InvalidDataException("Not a recognized native record reference.");
        int? rid=r.GetProperty("id").ValueKind==JsonValueKind.Null?null:r.GetProperty("id").GetInt32();
        if(rid.HasValue&&(rid<0||rid>(kind=="spell"?1028:1199)))throw new InvalidDataException("Outside the native table.");
        var json=new JsonSerializerOptions{Encoder=JavaScriptEncoder.UnsafeRelaxedJsonEscaping};string Quote(string value)=>JsonSerializer.Serialize(value,json);
        string source=JsonSerializer.Serialize(new{type=kind,id=rid,name,sourceKind=origin},json);
        if(payload.GetProperty("mode").GetString()!="c5m" || payload.GetProperty("source").GetString()!=source)throw new InvalidDataException("Original record identity changed.");
        var o=m.GetProperty("test");if(o.GetProperty("modId").GetString()!=id || o.GetProperty("caster").GetString()!="Selected in game" || o.TryGetProperty("casterId",out _) || o.TryGetProperty("weaponEditing",out _))throw new InvalidDataException("Original observations cannot edit records or override the native carrier.");
        string enemy=Name(o.GetProperty("enemy").GetString()!),count=o.GetProperty("count").GetString()!;
        if(!Regex.IsMatch(count,"^[0-9]+\\z") || !int.TryParse(count,out int n) || n is <1 or >200)throw new InvalidDataException("Invalid target count.");
        string enemyId="nil";if(o.TryGetProperty("enemyId",out var enemyValue)){enemyId=enemyValue.GetString()!;if(!Regex.IsMatch(enemyId,"^[0-9]+\\z")||!int.TryParse(enemyId,out n)||n is <0 or >6998)throw new InvalidDataException("Invalid enemy ID.");}
        string Resource(string file){using var reader=new StreamReader(Assembly.GetExecutingAssembly().GetManifestResourceStream("CoE5Workbench."+file)!);return reader.ReadToEnd().Replace("\r\n","\n");}
        var tokens=new Dictionary<string,string>{{"KIND",Quote(kind)},{"RID",rid?.ToString(System.Globalization.CultureInfo.InvariantCulture)??"nil"},{"NAME",Quote(name)},{"MODID",Quote(id)},{"ENEMY",Quote(enemy)},{"ENEMYID",enemyId},{"COUNT",count},{"DOCK",Resource("TestDock.lua")}};
        string lua=Regex.Replace(Resource("OriginalObservation.lua"),"\\{\\{([A-Z]+)\\}\\}",x=>tokens[x.Groups[1].Value]);
        string header="icon \"banner.tga\"\r\ndescription \"Original record observation. Requires CoE5SE "+runtimeVersion+"; not game-verified.\"\r\nneeds_script_extender\r\nrequires CoE5SE\r\n";
        if(files.Count!=4 || files[id+".c5m"]!=header || files[id+".lua"]!=lua)throw new InvalidDataException("Only the reviewed observation helper, with no definitions, can be launched.");
        return new(id,kind+" #"+(rid?.ToString()??"?")+" "+name,source,"c5m",files,false){OriginalRecord=true,ExtenderVersion=runtimeVersion};
    }
}
