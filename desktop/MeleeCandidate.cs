using System.IO;
using System.Globalization;
using System.Reflection;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace CoE5Workbench;

internal static class MeleeCandidate
{
    static string Template(string file)
    {
        using var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream("CoE5Workbench." + file)!;
        using var reader = new StreamReader(stream);
        return reader.ReadToEnd().Replace("\r\n", "\n");
    }

    static string Fill(string file, Dictionary<string, string> values) =>
        Regex.Replace(Template(file), @"\{\{([A-Z]+)\}\}", m => values[m.Groups[1].Value]);

    internal static readonly Dictionary<string,string> ParticleNames = JsonSerializer.Deserialize<Dictionary<string,string>>(Template("ParticleFlights.json"))!;

    internal sealed record VisualRow(string? name,int? witness);
    static readonly Dictionary<string,Dictionary<string,VisualRow>> Groups =
        JsonSerializer.Deserialize<Dictionary<string,Dictionary<string,VisualRow>>>(
            JsonSerializer.Deserialize<JsonElement>(Template("RangedVisuals543.json")).GetProperty("groups"))!;
    internal static bool HasVisual(string role,string id) => Groups[role].ContainsKey(id);
    static string LuaRows(string role,JsonSerializerOptions json) => string.Join(",\n",Groups[role]
        .OrderBy(p=>int.Parse(p.Key)).Select(p=>"["+p.Key+"]={"+(p.Value.name==null?"false":JsonSerializer.Serialize(p.Value.name,json))+","+(p.Value.witness?.ToString(System.Globalization.CultureInfo.InvariantCulture)??"false")+"}"));

    internal static TestCandidate Read(JsonElement payload, JsonElement manifest, string id, Dictionary<string,string> files)
    {
        bool officialCompare=manifest.GetProperty("kind").GetString()=="private-official-mixed-compare-v1";
        bool mixedCompare=officialCompare || manifest.GetProperty("kind").GetString()=="private-mixed-compare-v1";
        bool official=officialCompare || manifest.GetProperty("kind").GetString()=="private-official-mixed-v1";
        bool mixed=official || mixedCompare || manifest.GetProperty("kind").GetString()=="private-mixed-v1";
        string runtimeVersion=GameRuntime.CandidateVersion(manifest);
        if(official && (!GameRuntime.OfficialGroups(runtimeVersion) || manifest.GetProperty("workbenchVersion").GetString() is not ("0.18.0-rc.2" or "0.18.0-rc.3" or GameRuntime.CurrentWorkbenchVersion) || manifest.GetProperty("groupApi").GetString()!="official-group-1"))throw new InvalidDataException("Official mixed fields need a supported API-11 runtime and the matching contract.");
        if(officialCompare && (manifest.GetProperty("workbenchVersion").GetString() is not ("0.18.0-rc.3" or GameRuntime.CurrentWorkbenchVersion) || manifest.GetProperty("comparisonApi").GetString()!="official-compare-1"))throw new InvalidDataException("Official mixed comparison needs the current contract.");
        if(mixed && !official && runtimeVersion!="2.13.0")throw new InvalidDataException("Legacy mixed helpers require their own 2.13.0 runtime.");
        _=LocalRosterRuntime.Expected(mixed,runtimeVersion);
        const string header = "# Native weapon definition fragment; not an installable mod.\n# Supported syntax subset only. Gameplay, assets and enabled-mod capacity are unverified.\n";
        string source = payload.GetProperty("source").GetString()!;
        string native = (source.StartsWith('\uFEFF') ? source[1..] : source).Replace("\r\n", "\n").Replace('\r','\n');
        if (payload.GetProperty("mode").GetString() != "c5m" || manifest.GetProperty("sourceMode").GetString() != "c5m" ||
            manifest.GetProperty("modId").GetString() != id || !native.StartsWith(header,StringComparison.Ordinal) ||
            !manifest.GetProperty("dependencies").EnumerateArray().Select(d=>d.GetString()).SequenceEqual(["CoE5 5.43 Windows",mixed&&!official?"CoE5SE 2.13.0 + Workbench roster-v1 (local)":"CoE5SE "+runtimeVersion]))
            throw new InvalidDataException("Expected a generated standalone native weapon.");
        bool expanded = mixedCompare || manifest.GetProperty("kind").GetString()=="private-ranged-compare-v2";
        bool compare = expanded || manifest.GetProperty("kind").GetString()=="private-ranged-compare-v1";
        bool ranged = (mixed && manifest.GetProperty("route").GetString()=="ranged") || compare || manifest.GetProperty("kind").GetString()=="private-ranged-v1";
        if(mixedCompare && manifest.GetProperty("route").GetString()!="ranged")throw new InvalidDataException("Mixed visual comparison needs the private ranged route.");
        if(mixed && manifest.GetProperty("route").GetString() is not ("ranged" or "melee"))throw new InvalidDataException("Invalid mixed carrier route.");
        string route=ranged?"ranged":"melee", carrier=ranged?"WB Ranged Carrier":"WB Melee Carrier";
        string range=ranged?"[2-9]":"1";
        string visuals=ranged?@"(?:look (?<impact>34|68)\n)?(?:flymode 1\nflylook (?<sprite>[0127])|flymode 2\nflylook (?<particle>[1-9][0-9]{0,2}))\n":"";
        if(expanded) visuals=@"(?:look (?<impact>0|[1-9][0-9]{0,2})\n)?(?:flymode 1\nflylook (?<sprite>0|[1-9][0-9]?)|flymode 2\nflylook (?<particle>0|[1-9][0-9]{0,2}))\n";
        var match = Regex.Match(native[header.Length..], "\\Anewweapon \"(?<name>[ -~]{1,63})\"\\nrange (?<range>"+range+")\\ninit (?<init>[1-9][0-9]?)\\ndmgtype (?<type>[1-6])\\ndmg (?<base>0|[1-9][0-9]?)\\naoe (?<area>[0-5])\\n"+visuals+"\\z");
        string weapon = match.Groups["name"].Value;
        string attack = manifest.GetProperty("payload").GetString()!;
        if (!match.Success || weapon.Trim()!=weapon || weapon.IndexOfAny(['"', '#', '\\']) >= 0 ||
            manifest.GetProperty("weapon").GetString()!=weapon || !Regex.IsMatch(attack, @"\A[1-9][0-9]?\z"))
            throw new InvalidDataException("Unsupported private carrier definition or attack payload.");
        NativeTarget? target=null;
        if(manifest.TryGetProperty("target",out var selected)){
            int targetId=selected.GetProperty("id").GetInt32();
            string targetName=selected.GetProperty("name").GetString() ?? "";
            if(!NativeTarget.Accepts(targetId,targetName) || (compare&&!expanded))
                throw new InvalidDataException("Invalid standalone target identity.");
            int count=selected.TryGetProperty("count",out var quantity)?quantity.GetInt32():1;
            if(count is <1 or >200)throw new InvalidDataException("Expected 1–200 defenders of one native type.");
            target=new(targetId,targetName){count=count};
        }
        int area=int.Parse(match.Groups["area"].Value,CultureInfo.InvariantCulture);
        if(area>0 && target==null && !mixed)throw new InvalidDataException("An area test requires a verified native defender fixture.");
        bool areaLayout=manifest.TryGetProperty("areaLayout",out var layout);
        if(areaLayout && (layout.GetInt32()!=1 || !compare || area==0))throw new InvalidDataException("Unsupported area display layout.");
        string type = match.Groups["type"].Value;
        bool elemental = type is "4" or "5" or "6";
        if (elemental && compare && !expanded)
            throw new InvalidDataException("The historical comparison accepts physical weapons only.");
        string mod = Fill("MeleeCarrier.c5m",new(){["ROUTE"]=route,["CARRIER"]=carrier,["SOURCE"]=native.TrimEnd('\n'),["WEAPON"]=weapon,["PAYLOAD"]=attack}).Replace("\n","\r\n").Replace("CoE5SE 2.13.0","CoE5SE "+runtimeVersion);
        var json = new JsonSerializerOptions {Encoder=JavaScriptEncoder.UnsafeRelaxedJsonEscaping};
        string configuredRange=match.Groups["range"].Value;
        string impact=match.Groups["impact"].Success?match.Groups["impact"].Value:"-1";
        bool particle=match.Groups["particle"].Success;
        string flight=match.Groups[particle?"particle":"sprite"].Value;
        string particleCheck="";
        if(expanded && (!HasVisual(particle?"particle":"sprite",flight) || (impact!="-1" && !HasVisual("impact",impact))))throw new InvalidDataException("Visual ID unavailable for this 5.43 comparison role.");
        if (particle && !expanded) {
            using var names=JsonDocument.Parse(Template("ParticleFlights.json"));
            if (!names.RootElement.TryGetProperty(flight,out var name))
                throw new InvalidDataException("Unsupported standard particle flight effect.");
            string impactName=impact switch {"34"=>"Blood Burst","68"=>"Flame",_=>""};
            particleCheck=Fill("ParticleChecks.lua",new(){
                ["FLIGHTNAME"]=JsonSerializer.Serialize(name.GetString(),json), ["IMPACTNAME"]=JsonSerializer.Serialize(impactName,json)
            });
        }
        string checks=ranged?Fill("RangedChecks.lua",new(){
            ["MODE"]=particle?"2":"1", ["FLIGHTVAR"]=particle?"flight":"sprite", ["FLIGHT"]=flight,
            ["IMPACT"]=impact, ["RANGE"]=configuredRange, ["PARTICLECHECK"]=particleCheck
        }):"";
        string targetIdText=target?.id.ToString(CultureInfo.InvariantCulture)??"13";
        bool group=target?.count>1;
        string countText=(target?.count??1).ToString(CultureInfo.InvariantCulture);
        string targetHelper=target==null?"":Fill(group?"StandaloneGroup.lua":"StandaloneTarget.lua",new(){["TARGETID"]=targetIdText,["TARGETNAME"]=JsonSerializer.Serialize(target.name,json),["TYPE"]=type,["COUNT"]=countText});
        string lua = Fill(target==null?"MeleeObservationLegacy.lua":"MeleeObservation.lua",new(){
            ["TARGETID"]=targetIdText,["TARGETHELPER"]=targetHelper,["COUNT"]=countText,["AREA"]=area.ToString(CultureInfo.InvariantCulture),
            ["AREAINFO"]=area==0?"":"..\"; area code "+area+" (nearby count)\"",
            ["READING"]=(group?"saveGroup(meta,defender)":"meta.targetunit,meta.targetresistance=defender.targetunit,defender.targetresistance")+(area==0?"":";meta.area="+area),
            ["PRIVATEGUARD"]=elemental && !ranged ? "      if weapon<1200 or carrier<2000 then error(\"Expected new private melee records.\") end\n" : "",
            ["ELEMENTAL"]=elemental ? Template("ElementalTarget.lua") : "",
            ["DETAILS"]=elemental ? "..elementalDetails" : "",
            ["ROUTE"]=route, ["CARRIER"]=carrier, ["ROWTYPE"]=ranged?"2":"1", ["RANGE"]=configuredRange, ["RANGEDCHECK"]=checks,
            ["MODID"]=JsonSerializer.Serialize(id,json), ["WEAPON"]=JsonSerializer.Serialize(weapon,json),
            ["PAYLOAD"]=attack, ["TYPE"]=match.Groups["type"].Value, ["DMG"]=match.Groups["base"].Value,
            ["INIT"]=match.Groups["init"].Value, ["DOCK"]=Template("TestDock.lua")
        });
        if(compare) lua=Fill(target!=null?"RangedComparison.lua":expanded?"RangedComparisonLegacy.lua":"RangedComparisonV1.lua",new(){
            ["TARGETID"]=targetIdText,["TARGETHELPER"]=targetHelper,["COUNT"]=countText,["OPPONENT"]=group?"group":"target",["AREA"]=area.ToString(CultureInfo.InvariantCulture),
            ["AREALABEL"]=area==0||areaLayout?"":"..\" | Area #"+area+"\"",
            ["AREATEXT"]=areaLayout?"      ui.text(0,\"Area code "+area+" | nearby count\")\n":"",
            ["READING"]=(group?"saveGroup(row,defender)":"row.target,row.targetunit,row.targetresistance=defender.target,defender.targetunit,defender.targetresistance")+(area==0?"":";row.area="+area),
            ["DAMAGELABEL"]=elemental ? "..\" | Damage #"+type+"\"" : "",
            ["MODID"]=JsonSerializer.Serialize(id,json), ["WEAPON"]=JsonSerializer.Serialize(weapon,json),
            ["TYPE"]=match.Groups["type"].Value,["DMG"]=match.Groups["base"].Value,["INIT"]=match.Groups["init"].Value,
            ["PAYLOAD"]=attack,["MODE"]=particle?"2":"1",["FLIGHT"]=flight,["IMPACT"]=impact,["RANGE"]=configuredRange,
            ["SPRITES"]=expanded?LuaRows("sprite",json):"",["IMPACTS"]=expanded?LuaRows("impact",json):"",
            ["PARTICLES"]=expanded?LuaRows("particle",json):string.Join(",",ParticleNames.OrderBy(p=>int.Parse(p.Key)).Select(p=>"["+p.Key+"]="+JsonSerializer.Serialize(p.Value,json)))
        });
        NativeTarget[]? roster=null;
        if(mixed){
            roster=manifest.GetProperty("roster").EnumerateArray().Select(r=>new NativeTarget(r.GetProperty("id").GetInt32(),r.GetProperty("name").GetString()!){count=r.GetProperty("count").GetInt32()}).ToArray();
            if(roster.Length is <2 or >8 || roster.Any(r=>!NativeTarget.Accepts(r.id,r.name)||r.count is <1 or >200) ||
                roster.Select(r=>r.id).Distinct().Count()!=roster.Length || roster.Sum(r=>r.count)>200)
                throw new InvalidDataException("Invalid mixed native roster.");
            string rows="{"+string.Join(",",roster.Select(r=>"{monster="+r.id+",name="+JsonSerializer.Serialize(r.name,json)+",count="+r.count+"}"))+"}";
            string visualCheck=ranged?",flymode="+(particle?"2":"1")+",flylook="+flight+",look="+impact:"";
            lua=Fill(officialCompare?"OfficialMixedComparison.lua":official?"OfficialMixedObservation.lua":mixedCompare?"MixedRangedComparison.lua":"MixedObservation.lua",new(){
                ["DOCK"]=Template("TestDock.lua"),["RANGEDCHECK"]=checks,
                ["MODE"]=particle?"2":"1",["FLIGHT"]=flight,["IMPACT"]=impact,
                ["AREALABEL"]="",["AREATEXT"]=area>0?"      ui.text(0,\"Area code "+area+" | nearby count\")\n":"",
                ["DAMAGELABEL"]=elemental?"..\" | Damage #"+type+"\"":"",
                ["SPRITES"]=LuaRows("sprite",json),["PARTICLES"]=LuaRows("particle",json),["IMPACTS"]=LuaRows("impact",json),
                ["MODID"]=JsonSerializer.Serialize(id,json),["WEAPON"]=JsonSerializer.Serialize(weapon,json),["ROSTER"]=rows,["CARRIER"]=carrier,
                ["ROWTYPE"]=ranged?"2":"1",["PAYLOAD"]=attack,["AREA"]=area.ToString(CultureInfo.InvariantCulture),
                ["RANGE"]=configuredRange,["TYPE"]=type,["DMG"]=match.Groups["base"].Value,["INIT"]=match.Groups["init"].Value,["VISUALCHECK"]=visualCheck
            });
        }
        // Retained preparations used this exact title before 3.3.0. Accept only
        // that cosmetic variant; every other byte still matches the owned helper.
        bool knownTitle = officialCompare && files[id+".lua"] == lua.Replace("Compare mixed visuals | official groups", "Compare mixed visuals | official 3.2.2", StringComparison.Ordinal);
        if (files.Count!=4 || files[id+".c5m"]!=mod || (files[id+".lua"]!=lua && !knownTitle))
            throw new InvalidDataException("Private carrier or battle helper differs from the reviewed fixture.");
        return new(id,"weapon "+weapon,source,"c5m",files,compare){ExtenderVersion=runtimeVersion,OfficialMixedComparison=officialCompare,DamageType=int.Parse(type,CultureInfo.InvariantCulture),Roster=roster,Target=target,AreaCode=area,ExpandedVisuals=expanded,PrivateMelee=!ranged,PrivateRanged=ranged,ComparisonBaseline=compare?new() {["look"]=match.Groups["impact"].Value,["flymode"]=particle?"2":"1",["flylook"]=flight}:null};
    }
}
