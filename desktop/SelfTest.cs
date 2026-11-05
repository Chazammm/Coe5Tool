using System.IO;
using System.Text.Json;

namespace CoE5Workbench;

internal static class SelfTest
{
    internal static int Run(string reportFile)
    {
        var checks = new List<object>(); string folder = Path.Combine(Path.GetDirectoryName(Path.GetFullPath(reportFile))!, "desktop-test-fixtures");
        Directory.CreateDirectory(folder);
        void Check(string name, Action test) { try { test(); checks.Add(new { name, pass = true }); } catch (Exception e) { checks.Add(new { name, pass = false, error = e.Message }); } }
        void Require(bool value) { if (!value) throw new Exception("Assertion failed"); }
        void Refused(Action action) { bool threw = false; try { action(); } catch { threw = true; } Require(threw); }
        string source = "\uFEFF# keep\r\nnewweapon \"W\"\nrange\t5 # comment\rdmg 8", input = Path.Combine(folder, "original.c5m"), copy = Path.Combine(folder, Guid.NewGuid() + ".edited.c5m");
        File.WriteAllText(input, source, LocalFiles.Utf8);
        Check("Read-only source import retains BOM and mixed EOL", () => { LocalFiles.OpenSource(input); Require(LocalFiles.ReadText(input, 1000) == source); });
        Check("CreateNew export retains exact UTF-8 and leaves original", () => { LocalFiles.ExportNew(copy, source.Replace("range\t5", "range\t9")); Require(File.ReadAllBytes(copy).SequenceEqual(LocalFiles.Utf8.GetBytes(source.Replace("range\t5", "range\t9")))); Require(LocalFiles.ReadText(input, 1000) == source); });
        Check("Original and existing copies cannot be overwritten", () => { Refused(() => LocalFiles.ExportNew(input, "changed")); Refused(() => LocalFiles.ExportNew(copy, "changed")); Require(LocalFiles.ReadText(input, 1000) == source); });
        Check("UTF-16, invalid UTF-8, NUL, size and extension refused", () => { Refused(() => LocalFiles.ReadText(input, 2)); Refused(() => LocalFiles.ExportNew(Path.Combine(folder, "bad.txt"), "x")); Refused(() => LocalFiles.ExportNew(Path.Combine(folder, "bad.c5m"), "\0")); var bad = Path.Combine(folder, "invalid.c5m"); File.WriteAllBytes(bad, [255, 255]); Refused(() => LocalFiles.OpenSource(bad)); });
        Check("Host origin, port, traversal and remote asset restrictions", () => { Require(HostPolicy.IsPage(HostPolicy.Origin + "/index.html")); foreach (string url in new[] { "file:///index.html", "https://evil.invalid/index.html", "https://workbench.invalid:444/index.html", "https://user@workbench.invalid/index.html", "https://workbench.invalid/other.html" }) Require(!HostPolicy.IsPage(url)); Require(HostPolicy.AssetAllowed(HostPolicy.Origin + "/core.js")); Require(!HostPolicy.AssetAllowed(HostPolicy.Origin + "/../private-data/names.json")); Require(!HostPolicy.AssetAllowed("https://example.com/x")); Require(HostPolicy.HelpFile("file:///README.md") == null); });
        Check("Unknown name index accepts strings without invented provenance", () => { var path = Path.Combine(folder, "index.json"); File.WriteAllText(path, "{\"spell\":[\"Test spell\"],\"weapon\":[\"Test weapon\"]}"); string packet = JsonSerializer.Serialize(LocalFiles.NamesPacket(path)); Require(!packet.Contains(LocalFiles.KnownNamesBlob)); File.WriteAllText(path, "{\"spell\":[0],\"weapon\":[]}"); Refused(() => LocalFiles.NamesPacket(path)); });
        string? runtime = null;
        Check("WebView2 runtime detection (no window)", () => { runtime = Microsoft.Web.WebView2.Core.CoreWebView2Environment.GetAvailableBrowserVersionString(); Require(!string.IsNullOrWhiteSpace(runtime)); });
        bool pass = checks.All(x => JsonSerializer.Serialize(x).Contains("\"pass\":true"));
        File.WriteAllText(reportFile, JsonSerializer.Serialize(new { passed = pass, tests = checks.Count, checks, runtime, scope = "Compiled native file/policy logic and runtime detection only; no WebView window, dialogs, keyboard or game launched." }, new JsonSerializerOptions { WriteIndented = true }));
        return pass ? 0 : 1;
    }
}
