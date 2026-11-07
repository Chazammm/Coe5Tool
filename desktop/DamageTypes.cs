using System.Globalization;
using System.IO;
using System.Numerics;
using System.Reflection;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace CoE5Workbench;

internal static class DamageTypes
{
    private static readonly JsonDocument Data = JsonDocument.Parse(Assembly.GetExecutingAssembly().GetManifestResourceStream("CoE5Workbench.DamageData.json")!);
    internal static string Kind(int id) => Data.RootElement.GetProperty("types").EnumerateArray().FirstOrDefault(r => r.GetProperty("id").GetInt32() == id) is var row && row.ValueKind == JsonValueKind.Object ? row.GetProperty("kind").GetString()! : "unknown";
    internal static void Payload(int id, string text)
    {
        string kind = Kind(id);
        if (!Regex.IsMatch(text, "^[0-9]+\\z") || !BigInteger.TryParse(text, out var n) || n < 0 || kind is "unknown" or "manual") throw new InvalidDataException("Damage type/payload needs manual integration; no isolated candidate accepted.");
        if (kind == "scalar" && n > int.MaxValue || kind == "animate" && n != 1 && n != 2) throw new InvalidDataException("Unsupported scalar or animate payload.");
        if (kind == "mask")
        {
            BigInteger known = 0;
            foreach (var row in Data.RootElement.GetProperty("masks").GetProperty(id.ToString(CultureInfo.InvariantCulture)).EnumerateArray()) known |= BigInteger.Parse(row.GetProperty("value").GetString()!, CultureInfo.InvariantCulture);
            if (n == 0 || (n & ~known) != 0) throw new InvalidDataException("Unknown or empty effect mask.");
        }
    }
    internal static bool Allowed(int baseline, int selected, bool modern) => modern ? Kind(baseline) == "scalar" ? Kind(selected) == "scalar" : selected == baseline && Kind(baseline) is "mask" or "animate" : selected is 3 or 4;
}
