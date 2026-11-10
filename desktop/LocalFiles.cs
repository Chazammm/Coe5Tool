using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace CoE5Workbench;

internal static class LocalFiles
{
    internal const string KnownNamesBlob = "581a1cfee0c071b090714324f76da148aa2641d2";
    internal static readonly UTF8Encoding Utf8 = new(false, true);
    internal static string Profile => Path.Combine(AppContext.BaseDirectory, ".workbench-profile");
    internal static string ReadText(string path, int maximum)
    {
        using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
        if (stream.Length > maximum) throw new InvalidDataException("File exceeds the supported size. Nothing was truncated.");
        using var buffer = new MemoryStream(); stream.CopyTo(buffer);
        if (buffer.Length > maximum) throw new InvalidDataException("File exceeds the supported size.");
        string text = Utf8.GetString(buffer.ToArray()); // Deliberately retain a UTF-8 BOM.
        if (text.Contains('\0')) throw new InvalidDataException("NUL / binary / UTF-16 input is not supported.");
        return text;
    }
    internal static object OpenSource(string path)
    {
        string extension = Path.GetExtension(path).ToLowerInvariant();
        if (extension is not ".c5m" and not ".c5se") throw new InvalidDataException("Choose a .c5m or .c5se source.");
        return new { text = ReadText(path, 2 * 1024 * 1024), name = Path.GetFileName(path), mode = extension[1..] };
    }
    internal static void ExportNew(string path, string text)
    {
        if (Path.GetExtension(path).ToLowerInvariant() is not ".c5m" and not ".c5se") throw new InvalidDataException("Copy filename must end in .c5m or .c5se.");
        if (text.Contains('\0')) throw new InvalidDataException("NUL is not supported.");
        byte[] bytes = Utf8.GetBytes(text);
        if (bytes.Length > 4 * 1024 * 1024) throw new InvalidDataException("Prepared copy exceeds 4 MiB.");
        // CreateNew rejects every existing path, including the original and existing symlinks.
        using var stream = new FileStream(path, FileMode.CreateNew, FileAccess.Write, FileShare.None);
        stream.Write(bytes); stream.Flush(true);
    }
    internal static object NamesPacket(string path)
    {
        string text = ReadText(path, 1024 * 1024);
        using var json = JsonDocument.Parse(text);
        foreach (string kind in new[] { "spell", "weapon" })
        {
            var array = json.RootElement.GetProperty(kind);
            if (array.ValueKind != JsonValueKind.Array || array.GetArrayLength() > 10000) throw new InvalidDataException("Expected spell and weapon name arrays (up to 10,000 each).");
            foreach (var item in array.EnumerateArray())
                if (item.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(item.GetString()) || item.GetString()!.Length > 200 || item.GetString()!.Contains('\0'))
                    throw new InvalidDataException("Name index entries must be nonempty strings, at most 200 characters.");
        }
        byte[] bytes = Utf8.GetBytes(text), header = Utf8.GetBytes($"blob {bytes.Length}\0");
        using var git = IncrementalHash.CreateHash(HashAlgorithmName.SHA1); git.AppendData(header); git.AppendData(bytes);
        return new { text, filename = Path.GetFileName(path), gitBlob = Convert.ToHexString(git.GetHashAndReset()).ToLowerInvariant(), sha256 = Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant() };
    }
    internal static object ImportNames(string path)
    {
        var packet = NamesPacket(path); // Validate before replacing the private cache.
        Directory.CreateDirectory(Profile);
        string target = Path.Combine(Profile, "names.json"), temp = target + ".tmp";
        File.WriteAllText(temp, ReadText(path, 1024 * 1024), Utf8); File.Move(temp, target, true);
        WriteChoice("names");
        return packet;
    }
    private static void WriteChoice(string kind) => File.WriteAllText(Path.Combine(Profile, "library-choice.json"), JsonSerializer.Serialize(new { kind }), Utf8);
    private sealed record ExportSource(string text, string filename, string sha256, string type);
    private static ExportSource ValidateData(string text, string filename)
    {
        if (Utf8.GetByteCount(text) > 2 * 1024 * 1024 || text.Contains('\0')) throw new InvalidDataException("Invalid reference export size/text.");
        string sha = Convert.ToHexString(SHA256.HashData(Utf8.GetBytes(text))).ToLowerInvariant();
        string type = sha switch {
            "4e2b600507274432a386de00340805261a0d465384f98f622a7b2f180cb903b8" => "spell",
            "536e717c3395cd0c5618634c62a2d649e417dc99a08f8e4cbbe2180d734777bb" => "weapon",
            _ => throw new InvalidDataException("Unsupported reference fingerprint/version. Select the exact CoE5 Data 5.33 Spell Data and/or Weapon Data files. No game layout or values were guessed.")
        };
        return new ExportSource(text, Path.GetFileName(filename), sha, type);
    }
    private static List<ExportSource> ReadCachedData()
    {
        string file = Path.Combine(Profile, "data-files.json");
        if (!File.Exists(file)) return [];
        using var doc = JsonDocument.Parse(ReadText(file, 4 * 1024 * 1024));
        var files = doc.RootElement.GetProperty("files");
        if (files.ValueKind != JsonValueKind.Array || files.GetArrayLength() is < 1 or > 2) throw new InvalidDataException("Invalid private reference cache.");
        var validated = files.EnumerateArray().Select(x => ValidateData(x.GetProperty("text").GetString()!, x.GetProperty("filename").GetString()!)).ToList();
        if (validated.Select(x => x.type).Distinct().Count() != validated.Count) throw new InvalidDataException("Repeated dataset in private cache.");
        return validated;
    }
    internal static object ImportData(string[] paths)
    {
        if (paths.Length is < 1 or > 2) throw new InvalidDataException("Select one spell export and/or one weapon export.");
        var incoming = paths.Select(p => ValidateData(ReadText(p, 2 * 1024 * 1024), Path.GetFileName(p))).ToList();
        if (incoming.Select(x => x.type).Distinct().Count() != incoming.Count) throw new InvalidDataException("Select only one export of each type.");
        List<ExportSource> files;
        try { files = ReadCachedData(); } catch { files = []; } // A fresh valid import can recover a damaged private cache.
        foreach (var item in incoming) { files.RemoveAll(x => x.type == item.type); files.Add(item); }
        var packet = new { kind = "data533", files };
        Directory.CreateDirectory(Profile);
        string target = Path.Combine(Profile, "data-files.json"), temp = target + ".tmp";
        File.WriteAllText(temp, JsonSerializer.Serialize(packet), Utf8); File.Move(temp, target, true); WriteChoice("data533");
        return packet;
    }
    internal static object? CachedNames()
    {
        string choice = Path.Combine(Profile, "library-choice.json");
        if (File.Exists(choice)) {
            using var doc = JsonDocument.Parse(ReadText(choice, 1024));
            if (doc.RootElement.GetProperty("kind").GetString() == "data533") {
                var files = ReadCachedData(); if (files.Count == 0) throw new InvalidDataException("Private reference data is missing.");
                return new { kind = "data533", files };
            }
        }
        string path = Path.Combine(Profile, "names.json");
        return File.Exists(path) ? NamesPacket(path) : null;
    }
}

internal static class HostPolicy
{
    internal const string Origin = "https://workbench.invalid";
    internal static bool IsPage(string value) => Uri.TryCreate(value, UriKind.Absolute, out var u) && u.Scheme == "https" && u.Host == "workbench.invalid" && u.IsDefaultPort && u.UserInfo == "" && u.AbsolutePath == "/index.html" && u.Query == "";
    internal static bool AssetAllowed(string value)
    {
        if (!Uri.TryCreate(value, UriKind.Absolute, out var u) || u.Scheme != "https" || u.Host != "workbench.invalid" || !u.IsDefaultPort || u.UserInfo != "" || u.Query != "") return false;
        return u.AbsolutePath is "/prepared-sessions-ui.js" or "/melee.js" or "/melee-templates.js" or "/damage-data.js" or "/damage-types.js" or "/damage-ui.js" or "/index.html" or "/styles.css" or "/core.js" or "/target.js" or "/known-words.js" or "/app.js" or "/source-overview.js" or "/battle-results.js" or "/return-values.js" or "/return-values-ui.js" or "/documented-choices.js" or "/choices.js" or "/choices-ui.js" or "/vanilla-library.js" or "/reference.js" or "/data-import.js" or "/desktop-bridge.js" or "/reference-ui.js" or "/original-records.js" or "/original-records-policy.js" or "/creation.js" or "/weapon-edit-fixture.js" or "/creation-ui.js" or "/isolated-test-ui.js";
    }
    internal static string? HelpFile(string value)
    {
        if (!Uri.TryCreate(value, UriKind.Absolute, out var u) || u.Scheme != "https" || u.Host != "workbench.invalid" || !u.IsDefaultPort || u.UserInfo != "" || u.Query != "") return null;
        return u.AbsolutePath switch { "/docs/OFFICIAL-MIXED-0182.md" => "docs/OFFICIAL-MIXED-0182.md", "/docs/OFFICIAL-COMPARISON-0183.md" => "docs/OFFICIAL-COMPARISON-0183.md", "/docs/LEGACY-ROSTER-PERMISSIONS.md" => "docs/LEGACY-ROSTER-PERMISSIONS.md", "/docs/COE5SE-COMPATIBILITY-018.md" => "docs/COE5SE-COMPATIBILITY-018.md", "/docs/MANUAL-ACCEPTANCE-018.md" => "docs/MANUAL-ACCEPTANCE-018.md", "/docs/USER-GUIDE-018.md" => "docs/USER-GUIDE-018.md", "/docs/WINDOWS-PACKAGE-018.md" => "docs/WINDOWS-PACKAGE-018.md", "/docs/USER-GUIDE-017.md" => "docs/USER-GUIDE-017.md", "/docs/WINDOWS-PACKAGE-017.md" => "docs/WINDOWS-PACKAGE-017.md", "/docs/VANILLA-LIBRARY-016.md" => "docs/VANILLA-LIBRARY-016.md", "/docs/WINDOWS-PACKAGE-0161.md" => "docs/WINDOWS-PACKAGE-0161.md", "/docs/RESUMING-0161.md" => "docs/RESUMING-0161.md", "/README.md" => "README.md", "/docs/BATTLE-RESULTS-016.md" => "docs/BATTLE-RESULTS-016.md", "/docs/DAMAGE-TYPES-014.md" => "docs/DAMAGE-TYPES-014.md", "/docs/WORKSHOP-013.md" => "docs/WORKSHOP-013.md", "/docs/POST-TEST-RETURN-012.md" => "docs/POST-TEST-RETURN-012.md", "/docs/VFX-AND-DOCK-011.md" => "docs/VFX-AND-DOCK-011.md", "/docs/RETURN-AND-CHOICES-010.md" => "docs/RETURN-AND-CHOICES-010.md", "/docs/TARGET-AND-WEAPON-EDIT-09.md" => "docs/TARGET-AND-WEAPON-EDIT-09.md", "/docs/TESTING.md" => "docs/TESTING.md", "/docs/LIBRARY-AND-DESKTOP.md" => "docs/LIBRARY-AND-DESKTOP.md", "/docs/COMPACT-DATA-04.md" => "docs/COMPACT-DATA-04.md", "/docs/WORKFLOW-05.md" => "docs/WORKFLOW-05.md", "/docs/RECORD-DESK-06.md" => "docs/RECORD-DESK-06.md", "/docs/ISOLATED-TEST-08.md" => "docs/ISOLATED-TEST-08.md", "/docs/CREATION-AND-TEST-07.md" => "docs/CREATION-AND-TEST-07.md", _ => null };
    }
}
