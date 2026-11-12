using System.IO;
using System.Text.Json;
namespace CoE5Workbench;

internal static partial class GameRuntime
{
    internal const string CurrentWorkbenchVersion = "0.18.1";
    internal const string CurrentExtender = "3.3.0";
    internal const string Release330Sha256 = "60ac4979f6cfe508da6488a84c006daf8311bac5e1fc8e86a81c865594403db9";
    // Archive digest published in the official release body AND GitHub asset metadata.
    internal const string Release322Sha256 = "c356b8ed61bee470a7a546e9e5a47098902270747b09e52a1e99dff8bfcb6c3d";
    internal static Dictionary<string,string> Files322 => new(KnownFiles)
    {
        ["profile/mods/CoE5SE/coe5se.c5plugin.dll"] = "87e70dead42341573889641447d04c700af359243696a57b32e89a4fac682e8a",
        ["profile/mods/CoE5SE/coe5se_loader.dll"] = "fa3959faf4708103f17d3de044b40b5b7d9dcd01d7e475a310dcbb930d4d687f",
        ["profile/mods/CoE5SE/CoE5SE.c5se"] = "8e181748dccd004bc65e4edf25de8f92bb4150bbd9833de2adbbde93bed32ab6"
    };
    internal static Dictionary<string,string> Files330 => new(Files322)
    {
        ["profile/mods/CoE5SE/coe5se.c5plugin.dll"] = "26cb5c25e5aab0dc27710bbd08bc7ba9374dfa8ff8f6e4dc423b3e2cc743e14b",
        ["profile/mods/CoE5SE/coe5se_loader.dll"] = "d6b9075704b89f414e1cfbbcc98b1d7158f5edc6b3ed29a999e92588bc41d12d"
    };
    internal static bool OfficialGroups(string version) => version is "3.2.2" or "3.3.0";
    internal static string[] LogRelativePaths(string version) => version == "3.3.0"
        ? ["log.txt", "coe5se_logs/coe5mod.log", "coe5mod.log"] : ["log.txt", "coe5mod.log"];
    internal static Dictionary<string,string> FilesFor(string version) => version switch {
        "2.13.0" => KnownFiles, "3.2.2" => Files322, "3.3.0" => Files330,
        _ => throw new InvalidDataException("Unsupported extender version. Use official 2.13.0, 3.2.2 or 3.3.0 for the verified 5.43 executable.")
    };
    internal static string IdentifyOfficialPlugin(string hash) => hash switch {
        "26861bb0b6dffaa7150ed239e9eba4e934a955688d101c81161cf395190dd254" => "2.13.0",
        "87e70dead42341573889641447d04c700af359243696a57b32e89a4fac682e8a" => "3.2.2",
        "26cb5c25e5aab0dc27710bbd08bc7ba9374dfa8ff8f6e4dc423b3e2cc743e14b" => "3.3.0",
        _ => throw new InvalidDataException("Unrecognized official extender fingerprint. Choose the complete official 2.13.0, 3.2.2 or 3.3.0 folder; filenames and version text alone are insufficient.")
    };
    internal static string LabelFor(string version) { _ = FilesFor(version); return "CoE5 5.43 / CoE5SE " + version; }
    internal static string Evidence(string version) => version == "3.3.0" ? "Bounded 3.3.0 game checks cover one selected spell, original Fireball and mixed visual comparison. Other combinations remain unverified. Field closure does not establish complete record restoration."
        : version == "3.2.2" ? "Bounded game checks cover a selected spell, original Fireball, mixed targets and visual comparison. Other combinations remain unverified; field closure does not establish complete record restoration." : "Earlier bounded game evidence. Mixed targets need a separately available private roster-v1 component, not included in this download.";
    internal static string CandidateVersion(JsonElement manifest)
    {
        if (!manifest.TryGetProperty("runtimeVersion", out var value)) return "2.13.0"; // Retained contracts are immutable.
        if (!manifest.TryGetProperty("workbenchVersion", out var app) || app.GetString() is not ("0.18.0-rc.1" or "0.18.0-rc.2" or "0.18.0-rc.3" or "0.18.0" or CurrentWorkbenchVersion))
            throw new InvalidDataException("Unexpected runtime version on an older test contract. Prepare a fresh test; no session is migrated.");
        string version = value.GetString() ?? ""; _ = FilesFor(version);
        if (version == "3.3.0" && app.GetString() is not ("0.18.0" or CurrentWorkbenchVersion)) throw new InvalidDataException("3.3.0 requires a fresh preparation from the current Workbench. Retained sessions are not migrated.");
        return version;
    }
    internal static string SessionVersion(IsolatedTests.Session session) => session.ExtenderVersion ?? "2.13.0";
}
