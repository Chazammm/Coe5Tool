using System.IO;
using System.Reflection;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.RegularExpressions;
namespace CoE5Workbench;

internal static class EffectsCandidate
{
    private const string Pin="https://github.com/musical-pianist/coe5se/blob/df09497f04a39ff8fb7b0979dedde7dfed120c64/";
    private static readonly JsonSerializerOptions Json=new(){Encoder=JavaScriptEncoder.UnsafeRelaxedJsonEscaping};
    private static string Q(string v)=>JsonSerializer.Serialize(v,Json);
    private static string Resource(string name){using var reader=new StreamReader(Assembly.GetExecutingAssembly().GetManifestResourceStream("CoE5Workbench."+name)!);return reader.ReadToEnd().Replace("\r\n","\n");}
    internal static string Roles()
    {
        using var data=JsonDocument.Parse(Resource("RangedVisuals543.json"));var groups=data.RootElement.GetProperty("groups");
        return "{"+string.Join(",",new[]{"sprite","particle","impact"}.Select(kind=>kind+"={"+string.Join(",",groups.GetProperty(kind).EnumerateObject().OrderBy(p=>int.Parse(p.Name)).Select(p=>"["+p.Name+"]={"+(p.Value.GetProperty("name").ValueKind==JsonValueKind.Null?"false":Q(p.Value.GetProperty("name").GetString()!))+","+(p.Value.GetProperty("witness").ValueKind==JsonValueKind.Null?"nil":p.Value.GetProperty("witness").GetRawText())+"}"))+"}"))+"}";
    }
    internal static string Source(NativeTarget t)=>"# Test Effects browser; no source draft.\n# Native target #"+t.id+" "+t.name+" x"+t.count+"\n";
    internal static string Header(string mod,string version="3.4.4")=>"icon \"banner.tga\"\r\ndescription \"Test Effects browser. CoE5SE "+version+" required; gameplay acceptance pending.\"\r\nneeds_script_extender\r\nrequires CoE5SE\r\n\r\nnewweapon \"WBEW_"+mod+"\"\r\nrange 30\r\ninit 3\r\ndmgtype 3\r\ndmg 1\r\naoe 0\r\nlook 68\r\nflymode 2\r\nflylook 65\r\n\r\n#!@newspell \"WBES_"+mod+"\"\r\n#!@path 3\r\n#!@level 1\r\n#!@weapon 1 \"WBEW_"+mod+"\"\r\n";
    internal static TestCandidate Read(JsonElement payload,JsonElement m,string mod,Dictionary<string,string> files,bool review=false)
    {
        string app=m.GetProperty("workbenchVersion").GetString()!,version=GameRuntime.CandidateVersion(m);
        bool old=app is "0.19.0-rc.1" or "0.19.0-rc.2";
        string pin=version==GameRuntime.DevVersion?"https://github.com/musical-pianist/coe5se/blob/"+GameRuntime.DevSource+"/":Pin;
        if(!Regex.IsMatch(mod,"^WB_Effects_[a-z0-9]{1,20}\\z")||!(m.GetProperty("workbenchVersion").GetString()==GameRuntime.CurrentWorkbenchVersion||review&&old)||version is not ("3.4.4" or GameRuntime.DevVersion)||m.GetProperty("sourceMode").GetString()!="c5m"||m.GetProperty("sourcePin").GetString()!=pin||m.GetProperty("gameTested").GetBoolean()||m.GetProperty("editable").GetBoolean()||m.GetProperty("execution").GetString()!="forced-preview")throw new InvalidDataException("Unrecognized or older effects-browser contract. Prepare a fresh browser with pinned official 3.4.4 or dev 3.5.0.0; older browser receipts remain read-only.");
        var row=m.GetProperty("target");var target=new NativeTarget(row.GetProperty("id").GetInt32(),row.GetProperty("name").GetString()!){count=row.GetProperty("count").GetInt32()};
        if(!NativeTarget.Accepts(target.id,target.name)||target.count is <1 or >20)throw new InvalidDataException("Choose a supported native target and count from 1 to 20.");
        string source=Source(target);var tokens=new Dictionary<string,string>{{"MODID",Q(mod)},{"TARGETID",target.id.ToString(System.Globalization.CultureInfo.InvariantCulture)},{"TARGETNAME",Q(target.name)},{"COUNT",target.count.ToString(System.Globalization.CultureInfo.InvariantCulture)},{"WEAPON",Q("WBEW_"+mod)},{"SPELL",Q("WBES_"+mod)},{"ROLES",Roles()},{"RUNTIME",Q(version)}};
        string lua=Regex.Replace(Resource(old?(app=="0.19.0-rc.1"?"EffectBrowserV019Rc1.lua":"EffectBrowserV019Rc2.lua"):"EffectBrowser.lua"),"\\{\\{([A-Z]+)\\}\\}",x=>tokens[x.Groups[1].Value]);
        if(payload.GetProperty("mode").GetString()!="c5m"||payload.GetProperty("source").GetString()!=source||files.Count!=4||files[mod+".c5m"]!=Header(mod,version)||files[mod+".lua"]!=lua)throw new InvalidDataException("Only the canonical private effects-browser helper may launch. Files changed; prepare again.");
        return new(mod,"Test Effects browser",source,"c5m",files,false){EffectsBrowser=true,Target=target,ExtenderVersion=version};
    }
}
