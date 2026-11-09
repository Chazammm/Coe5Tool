using System.IO;
using System.Reflection;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace CoE5Workbench;

// Launch accepts only the canonical generated subset, not arbitrary uploaded Lua/mod files.
internal sealed record NativeTarget(int id,string name)
{
    public int count { get; init; } = 1;
    internal static bool Accepts(int id, string name) =>
        id is >=0 and <2000 && Regex.IsMatch(name,@"\A[ -~]{1,49}\z") && name.Trim()==name &&
        name.IndexOfAny(['"', '#', '\\'])<0 && name is not ("..." or "end") && !name.StartsWith("Debug ",StringComparison.Ordinal);
}
internal sealed record TestCandidate(string ModId, string SpellName, string Source, string Mode, Dictionary<string, string> Files, bool WeaponEditing)
{
    internal Dictionary<string,string>? ComparisonBaseline { get; init; }
    internal NativeTarget? Target { get; init; }
    internal NativeTarget[]? Roster { get; init; }
    internal int AreaCode { get; init; }
    internal int DamageType { get; init; }
    internal bool ExpandedVisuals { get; init; }
    internal bool PrivateRanged { get; init; }
    internal bool PrivateMelee { get; init; }
    internal bool OriginalRecord { get; init; }
    internal const string Pin = "https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/";
    internal static TestCandidate Read(JsonElement payload) => ReadCore(payload, false);
    // Older reviewed templates are accepted only for read-only result association, never launch.
    internal static TestCandidate ReadForReview(JsonElement payload) => ReadCore(payload, true);
    private static TestCandidate ReadCore(JsonElement payload, bool review)
    {
        string id = payload.GetProperty("modId").GetString()!;
        var files = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var file in payload.GetProperty("files").EnumerateArray())
            if (!files.TryAdd(file.GetProperty("name").GetString()!, file.GetProperty("text").GetString()!)) throw new InvalidDataException("Repeated test file.");
        _ = TestPackage.Build(id, files);
        using var manifest = JsonDocument.Parse(files["manifest.json"]);
        var m = manifest.RootElement;
        if(m.GetProperty("kind").GetString() is "private-mixed-compare-v1" or "private-mixed-v1" or "private-melee-v1" or "private-ranged-v1" or "private-ranged-compare-v1" or "private-ranged-compare-v2")return MeleeCandidate.Read(payload,m,id,files);
        if(m.GetProperty("kind").GetString()=="original-record-observation")return OriginalCandidate.Read(payload,m,id,files,review);
        string? version=m.GetProperty("workbenchVersion").GetString();
        bool legacy = review && version == "0.9.0", v010=review && version=="0.10.0", v011=review&&version=="0.11.0", v012=review&&version=="0.12.0", v013=review&&version=="0.13.0", modern=version is "0.16.0" or "0.16.1" || review&&(version=="0.14.0"||version=="0.15.0");
        if ((!legacy && !v010 && !v011 && !v012 && !v013 && !modern) || m.GetProperty("sourcePin").GetString() != Pin || m.GetProperty("gameTested").GetBoolean() || m.GetProperty("kind").GetString() != "experimental-test-mod")
            throw new InvalidDataException("Regenerate this test with the current workbench before preparing a launch.");
        var spec = m.GetProperty("definitions"); var options = m.GetProperty("test");
        bool weaponEditing = false;
        if (options.TryGetProperty("weaponEditing", out var editing))
        {
            if (editing.ValueKind is not JsonValueKind.True and not JsonValueKind.False) throw new InvalidDataException("Invalid weapon experiment choice.");
            weaponEditing = editing.GetBoolean();
        }
        bool hasExperiment = m.TryGetProperty("experiment", out var experiment);
        if (hasExperiment != weaponEditing || hasExperiment && experiment.GetString() != (legacy ? "weapon-edit-v1" : v010 ? "weapon-edit-v2" : modern ? "weapon-edit-v4" : "weapon-edit-v3")) throw new InvalidDataException("Unrecognized experiment contract.");
        var s = new Dictionary<string, string>();
        string Name(JsonElement e, string key, int max)
        {
            string value = e.GetProperty(key).GetString()!;
            if (value.Length < 1 || value.Length > max || value.Trim() != value || value.Any(c => c < 32 || c > 126 || c is '"' or '#' or '\\')) throw new InvalidDataException("Unsafe " + key + ".");
            return value;
        }
        string Number(string key, int min, int max)
        {
            string value = spec.GetProperty(key).GetString()!;
            if (!Regex.IsMatch(value, "^-?[0-9]+\\z") || !int.TryParse(value, out int n) || n < min || n > max) throw new InvalidDataException("Unsupported " + key + ".");
            return value;
        }
        s["spellName"] = Name(spec, "spellName", 47); s["weaponName"] = Name(spec, "weaponName", 63);
        s["path"] = Number("path", 1, 69); s["level"] = Number("level", 1, 3);
        foreach (string key in modern ? new[] { "aoe", "range", "init" } : new[] { "weaponDamage", "dmg", "aoe", "range", "init" }) s[key] = Number(key, key is "range" or "init" ? 1 : 0, key == "aoe" ? 200 : int.MaxValue);
        s["dmgtype"] = Number("dmgtype", modern ? 1 : 3, modern ? 25 : 4);
        if(modern&&s["dmgtype"]=="25")throw new InvalidDataException("Animation needs a verified terrain-target fixture; creation/export only.");
        if(modern)foreach(string key in new[]{"dmg","weaponDamage"}){s[key]=spec.GetProperty(key).GetString()!;DamageTypes.Payload(int.Parse(s["dmgtype"]),s[key]);}
        foreach (string key in new[] { "look", "sound", "flymode", "flylook", "flysound" })
            s[key] = spec.GetProperty(key).GetString() == "" ? "" : Number(key, key == "flysound" ? -1 : key == "flymode" ? 1 : 0, key == "flymode" ? 9 : int.MaxValue);
        if ((s["flymode"] == "") != (s["flylook"] == "")) throw new InvalidDataException("Incomplete flight settings.");
        if (options.GetProperty("modId").GetString() != id) throw new InvalidDataException("Test identity differs from its manifest.");
        string caster = Name(options, "caster", 63), enemy = Name(options, "enemy", 63), count = options.GetProperty("count").GetString()!;
        if (!Regex.IsMatch(count, "^[0-9]+\\z") || !int.TryParse(count, out int nCount) || nCount is < 1 or > 200) throw new InvalidDataException("Invalid target count.");
        string ParticipantId(string key)
        {
            if (!options.TryGetProperty(key, out var value)) return "nil";
            string text = value.GetString()!;
            if (legacy || !Regex.IsMatch(text, "^[0-9]+\\z") || !int.TryParse(text, out int id) || id is < 0 or > 6998) throw new InvalidDataException("Unsupported participant ID.");
            return text;
        }
        string casterId = ParticipantId("casterId"), enemyId = ParticipantId("enemyId");
        string mode = payload.GetProperty("mode").GetString()!, source = payload.GetProperty("source").GetString()!;
        if (mode is not "c5m" and not "c5se" || m.GetProperty("sourceMode").GetString() != mode) throw new InvalidDataException("Test format changed.");
        string Body(bool fragment)
        {
            var lines = new List<string> { fragment ? "# Definition fragment; not an installable mod." : "# Generated definitions in an experimental test mod.", "# CoE5SE required. Not tested in game.", "newweapon \"" + s["weaponName"] + "\"" };
            foreach (string key in new[] { "range", "init", "dmgtype", "dmg", "aoe", "look", "sound", "flymode", "flylook", "flysound" }) if (s[key] != "") lines.Add(key + " " + s[key]);
            string prefix = mode == "c5m" ? "#!@" : "";
            lines.AddRange(["", prefix + "newspell \"" + s["spellName"] + "\"", prefix + "path " + s["path"], prefix + "level " + s["level"], prefix + "weapon " + s["weaponDamage"] + " \"" + s["weaponName"] + "\"", ""]);
            return string.Join("\r\n", lines);
        }
        string header = "icon \"banner.tga\"\r\ndescription \"Experimental workbench test. Requires CoE5SE 2.13.0; not game-verified.\"\r\nneeds_script_extender\r\nrequires CoE5SE\r\n\r\n";
        if (source != Body(true) || files[id + ".c5m"] != header + (mode == "c5m" ? Body(false) : "") ||
            (mode == "c5se" ? !files.TryGetValue(id + ".c5se", out string? sidecar) || sidecar != Body(false) : files.ContainsKey(id + ".c5se")))
            throw new InvalidDataException("Test files do not match the current canonical draft. Regenerate them.");
        string Quote(string value) => JsonSerializer.Serialize(value, new JsonSerializerOptions { Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
        string resource = weaponEditing ? (legacy ? "WeaponEditFixtureV09.lua" : v010 ? "WeaponEditFixtureV010.lua" : modern ? "WeaponEditFixture.lua" : "WeaponEditFixtureV013.lua") : (legacy ? "TestFixtureV09.lua" : v010 ? "TestFixtureV010.lua" : modern ? "TestFixture.lua" : "TestFixtureV013.lua");
        using var reader = new StreamReader(Assembly.GetExecutingAssembly().GetManifestResourceStream("CoE5Workbench." + resource)!);
        string template = reader.ReadToEnd().Replace("\r\n", "\n");
        var tokens = new Dictionary<string, string> { ["SPELL"] = Quote(s["spellName"]), ["WEAPON"] = Quote(s["weaponName"]), ["CASTER"] = Quote(caster), ["ENEMY"] = Quote(enemy), ["PATH"] = s["path"], ["LEVEL"] = s["level"], ["DAMAGE"] = s["weaponDamage"], ["COUNT"] = count, ["MENU"] = Quote("WB test: " + id) };
        tokens["BASEDAMAGE"]=s["dmg"];tokens["MODID"] = Quote(id); tokens["DMGTYPE"] = s["dmgtype"]; tokens["AOE"] = s["aoe"];
        tokens["CASTERID"] = casterId; tokens["ENEMYID"] = enemyId; tokens["MODE"] = Quote(mode);
        tokens["LOOK"]=s["look"]==""?"nil":s["look"];tokens["FLYMODE"]=s["flymode"]==""?"nil":s["flymode"];tokens["FLYLOOK"]=s["flylook"]==""?"nil":s["flylook"];
        using var dockReader=new StreamReader(Assembly.GetExecutingAssembly().GetManifestResourceStream("CoE5Workbench.TestDock.lua")!);tokens["DOCK"]=dockReader.ReadToEnd().Replace("\r\n","\n");
        string lua = Regex.Replace(template, "\\{\\{([A-Z]+)\\}\\}", match => tokens[match.Groups[1].Value]);
        if (files[id + ".lua"] != lua) throw new InvalidDataException("The test helper changed. Only the reviewed generated helper can be launched here.");
        return new(id, s["spellName"], source, mode, files, weaponEditing);
    }
}
