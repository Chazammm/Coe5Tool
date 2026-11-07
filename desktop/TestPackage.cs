using System.IO;
using System.IO.Compression;
using System.Text.RegularExpressions;

namespace CoE5Workbench;

internal static class TestPackage
{
    internal static byte[] Build(string modId, IReadOnlyDictionary<string, string> files)
    {
        if (!Regex.IsMatch(modId, "^[A-Za-z][A-Za-z0-9_]{0,31}\\z") || Regex.IsMatch(modId, "^(coe5se|con|prn|aux|nul|com[1-9]|lpt[1-9])\\z", RegexOptions.IgnoreCase))
            throw new InvalidDataException("Invalid test mod ID.");
        string[] required = [modId + ".c5m", modId + ".lua", "README.txt", "manifest.json"];
        var allowed = new HashSet<string>(required, StringComparer.Ordinal) { modId + ".c5se" };
        if (files.Count is < 4 or > 5 || required.Any(n => !files.ContainsKey(n)) || files.Keys.Any(n => !allowed.Contains(n)))
            throw new InvalidDataException("Test package requires its matching mod/Lua files, README and manifest; no other paths are accepted.");
        long total = 0;
        foreach (var item in files)
        {
            if (item.Value.Contains('\0') || LocalFiles.Utf8.GetByteCount(item.Value) > 128 * 1024)
                throw new InvalidDataException("Invalid or oversized test file.");
            total += LocalFiles.Utf8.GetByteCount(item.Value);
        }
        if (total > 512 * 1024) throw new InvalidDataException("Test package is too large.");
        using var memory = new MemoryStream();
        using (var zip = new ZipArchive(memory, ZipArchiveMode.Create, true))
        {
            void Add(string name, byte[] bytes)
            {
                var entry = zip.CreateEntry(modId + "/" + name, CompressionLevel.Optimal);
                entry.LastWriteTime = new DateTimeOffset(2000, 1, 1, 0, 0, 0, TimeSpan.Zero);
                using var stream = entry.Open(); stream.Write(bytes);
            }
            foreach (var item in files.OrderBy(x => x.Key, StringComparer.Ordinal)) Add(item.Key, LocalFiles.Utf8.GetBytes(item.Value));
            Add("banner.tga", Banner());
        }
        return memory.ToArray();
    }
    internal static void ExportNew(string path, string modId, IReadOnlyDictionary<string, string> files)
    {
        if (!Path.GetExtension(path).Equals(".zip", StringComparison.OrdinalIgnoreCase)) throw new InvalidDataException("Choose a new .zip filename.");
        byte[] bytes = Build(modId, files); // Validate and complete the archive before any output is created.
        using var stream = new FileStream(path, FileMode.CreateNew, FileAccess.Write, FileShare.None);
        stream.Write(bytes); stream.Flush(true);
    }
    private static byte[] Banner()
    {
        // Original flat label, not game art or a visual effect. Uncompressed top-origin 24-bit TGA.
        var bytes = new byte[18 + 256 * 64 * 3]; bytes[2] = 2; bytes[13] = 1; bytes[14] = 64; bytes[16] = 24; bytes[17] = 32;
        for (int y = 0; y < 64; y++) for (int x = 0; x < 256; x++)
        {
            int p = 18 + (y * 256 + x) * 3;
            (byte r, byte g, byte b) = y < 5 ? ((byte)50, (byte)107, (byte)105) : ((byte)25, (byte)35, (byte)44);
            bytes[p] = b; bytes[p + 1] = g; bytes[p + 2] = r;
        }
        return bytes;
    }
}
