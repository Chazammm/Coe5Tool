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
        return packet;
    }
    internal static object? CachedNames()
    {
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
        return u.AbsolutePath is "/index.html" or "/styles.css" or "/core.js" or "/known-words.js" or "/app.js" or "/reference.js" or "/desktop-bridge.js" or "/reference-ui.js";
    }
    internal static string? HelpFile(string value)
    {
        if (!Uri.TryCreate(value, UriKind.Absolute, out var u) || u.Scheme != "https" || u.Host != "workbench.invalid" || !u.IsDefaultPort || u.UserInfo != "" || u.Query != "") return null;
        return u.AbsolutePath switch { "/README.md" => "README.md", "/docs/TESTING.md" => "docs/TESTING.md", "/docs/LIBRARY-AND-DESKTOP.md" => "docs/LIBRARY-AND-DESKTOP.md", _ => null };
    }
}
