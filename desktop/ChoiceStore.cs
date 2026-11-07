using System.Globalization;
using System.IO;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace CoE5Workbench;

internal static class ChoiceStore
{
    internal const string MonsterHash = "a0752def8cf175b73b282ff4b02521607b39dd54b65728aecc775e6eec1adc0f";
    private static string Cache => Path.Combine(LocalFiles.Profile, "choice-monsters-533.c5m");
    internal static object MonsterPacket(string path)
    {
        string text = LocalFiles.ReadText(path, 8 * 1024 * 1024);
        if (GameRuntime.TextHash(text) != MonsterHash) throw new InvalidDataException("Unsupported monster reference. Select the exact Monster Data v5.33.c5m author export; no IDs were inferred.");
        var rows = Regex.Matches(text, "^newmonster[ \\t]+\"([^\"\\r\\n]*)\"[ \\t]*#[ \\t]*([0-9]+)", RegexOptions.Multiline)
            .Select(m => new { id = int.Parse(m.Groups[2].Value, CultureInfo.InvariantCulture), name = m.Groups[1].Value, type = "monster" }).ToArray();
        if (rows.Length != 1851 || rows.Select(r => r.id).Distinct().Count() != 1851 || rows.Any(r => r.id is < 0 or > 1850)) throw new InvalidDataException("Monster reference record identity differs.");
        return new { entries = rows, source = "CoE5 Data 5.33 author export", version = "5.33", sha256 = MonsterHash, complete = false };
    }
    internal static object Import(string path)
    {
        _ = MonsterPacket(path); string text = LocalFiles.ReadText(path, 8 * 1024 * 1024);
        Directory.CreateDirectory(LocalFiles.Profile); string temp = Cache + "." + Guid.NewGuid().ToString("N") + ".tmp";
        File.WriteAllText(temp, text, LocalFiles.Utf8); File.Move(temp, Cache, true); return Packet();
    }
    internal static object Packet()
    {
        object? monsters = null, reference = null; var notes = new List<string>();
        try { if (File.Exists(Cache)) monsters = MonsterPacket(Cache); else notes.Add("Import Monster Data v5.33.c5m for the historical unit/commander variants, or export a runtime catalog."); }
        catch (Exception e) { notes.Add("Monster cache unavailable: " + e.Message); }
        try { reference = LocalFiles.CachedNames(); } catch (Exception e) { notes.Add("Reference cache unavailable: " + e.Message); }
        return new { monsters, reference, notes };
    }
}
