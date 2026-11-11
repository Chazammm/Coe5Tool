using System.Diagnostics;
using System.IO;
using System.Security.Cryptography;

namespace CoE5Workbench;

internal sealed record RuntimePaths(string GameExe, string ExtenderFolder);
internal sealed record RuntimeIdentity(RuntimePaths Paths, string Data, Dictionary<string, string> Sources, string ExtenderVersion = "2.13.0")
{
    internal string Label => GameRuntime.LabelFor(ExtenderVersion);
}

internal static partial class GameRuntime
{
    internal const string Label = "CoE5 5.43 / CoE5SE 2.13.0 / 3.2.2 / 3.3.0";
    internal static string Hash(string path) { using var stream = File.OpenRead(path); return Convert.ToHexString(SHA256.HashData(stream)).ToLowerInvariant(); }
    internal static string TextHash(string value) => Convert.ToHexString(SHA256.HashData(LocalFiles.Utf8.GetBytes(value))).ToLowerInvariant();
    internal static void SafePath(string path)
    {
        if (!Path.IsPathFullyQualified(path) || path.StartsWith("\\\\")) throw new IOException("Use a local absolute path.");
        for (string? p = Path.GetFullPath(path); p != null; p = Path.GetDirectoryName(p))
            if ((File.Exists(p) || Directory.Exists(p)) && (File.GetAttributes(p) & FileAttributes.ReparsePoint) != 0)
                throw new IOException("Linked/reparse paths are not supported for isolated tests: " + p);
    }
    internal static RuntimeIdentity Verify(RuntimePaths input)
    {
        var paths = new RuntimePaths(Path.GetFullPath(input.GameExe), Path.GetFullPath(input.ExtenderFolder));
        SafePath(paths.GameExe); SafePath(paths.ExtenderFolder);
        if (!Path.GetFileName(paths.GameExe).Equals("CoE5.exe", StringComparison.OrdinalIgnoreCase)) throw new InvalidDataException("Choose the supported CoE5.exe.");
        string gameFolder = Path.GetDirectoryName(paths.GameExe)!, data = Path.Combine(gameFolder, "data");
        SafePath(data);
        if (!Directory.Exists(data) || !Directory.EnumerateFileSystemEntries(data).Any()) throw new DirectoryNotFoundException("The selected game's data folder is missing or empty.");
        string plugin = Path.Combine(paths.ExtenderFolder, "coe5se.c5plugin.dll"); SafePath(plugin);
        string version = IdentifyOfficialPlugin(File.Exists(plugin) ? Hash(plugin) : "");
        var sources = new Dictionary<string, string>();
        foreach (var entry in FilesFor(version))
        {
            string source = entry.Key.StartsWith("runtime/", StringComparison.Ordinal) && entry.Key != "runtime/glu32.dll"
                ? Path.Combine(gameFolder, Path.GetFileName(entry.Key)) : Path.Combine(paths.ExtenderFolder, Path.GetFileName(entry.Key));
            SafePath(source);
            if (!File.Exists(source) || Hash(source) != entry.Value)
                throw new InvalidDataException("Unsupported, mixed-release or missing " + Path.GetFileName(source) + ". Select the verified 5.43 game and a complete official CoE5SE " + version + " folder. No mismatch will be forced.");
            sources.Add(entry.Key, source);
        }
        return new(paths, data, sources, version);
    }
}

internal interface ITestProcess
{
    int Id { get; }
    DateTime StartUtc { get; }
    bool HasExited { get; }
    int? ExitCode { get; }
}
internal interface ITestProcesses
{
    bool AnyGameRunning();
    ITestProcess Start(ProcessStartInfo start);
    ITestProcess? FindOwned(int pid, DateTime startUtc, string executable);
}
internal sealed class TestProcesses : ITestProcesses
{
    private sealed class Owned(Process process) : ITestProcess
    {
        public int Id => process.Id;
        public DateTime StartUtc => process.StartTime.ToUniversalTime();
        public bool HasExited => process.HasExited;
        public int? ExitCode => process.HasExited ? process.ExitCode : null;
    }
    public bool AnyGameRunning()
    {
        var processes = Process.GetProcessesByName("CoE5");
        try { return processes.Length != 0; } finally { foreach (var p in processes) p.Dispose(); }
    }
    public ITestProcess Start(ProcessStartInfo start) => new Owned(Process.Start(start) ?? throw new IOException("The test process did not start."));
    public ITestProcess? FindOwned(int pid, DateTime startUtc, string executable)
    {
        try
        {
            var p = Process.GetProcessById(pid);
            if (p.HasExited || p.StartTime.ToUniversalTime() != startUtc || !string.Equals(p.MainModule?.FileName, executable, StringComparison.OrdinalIgnoreCase)) { p.Dispose(); return null; }
            return new Owned(p);
        }
        catch (ArgumentException) { return null; }
        // Access denial is deliberately surfaced, never treated as permission to launch again.
    }
}
