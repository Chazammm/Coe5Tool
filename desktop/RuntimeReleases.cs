using System.IO;
using System.Text.Json;
namespace CoE5Workbench;

internal static partial class GameRuntime
{
    internal const string PreviewWorkbenchVersion = "0.18.0-rc.2";
    internal const string CurrentExtender = "3.2.2";
    // Archive digest published in the official release body AND GitHub asset metadata.
    internal const string Release322Sha256 = "c356b8ed61bee470a7a546e9e5a47098902270747b09e52a1e99dff8bfcb6c3d";
    internal static Dictionary<string,string> Files322 => new(KnownFiles)
    {
        ["profile/mods/CoE5SE/coe5se.c5plugin.dll"] = "87e70dead42341573889641447d04c700af359243696a57b32e89a4fac682e8a",
        ["profile/mods/CoE5SE/coe5se_loader.dll"] = "fa3959faf4708103f17d3de044b40b5b7d9dcd01d7e475a310dcbb930d4d687f",
        ["profile/mods/CoE5SE/CoE5SE.c5se"] = "8e181748dccd004bc65e4edf25de8f92bb4150bbd9833de2adbbde93bed32ab6"
    };
    internal static Dictionary<string,string> FilesFor(string version) => version switch {
        "2.13.0" => KnownFiles, "3.2.2" => Files322,
        _ => throw new InvalidDataException("Unsupported extender version. Use official 2.13.0 or 3.2.2 for the verified 5.43 executable.")
    };
    internal static string IdentifyOfficialPlugin(string hash) => hash switch {
        "26861bb0b6dffaa7150ed239e9eba4e934a955688d101c81161cf395190dd254" => "2.13.0",
        "87e70dead42341573889641447d04c700af359243696a57b32e89a4fac682e8a" => "3.2.2",
        _ => throw new InvalidDataException("Unrecognized official extender fingerprint. Choose the complete official 2.13.0 or 3.2.2 folder; filenames and version text alone are insufficient.")
    };
    internal static string LabelFor(string version) { _ = FilesFor(version); return "CoE5 5.43 / CoE5SE " + version + (version=="3.2.2"?" (preview)":""); }
    internal static string Evidence(string version) => version == "3.2.2" ? "Two bounded spell/original game cases passed. Official mixed-group gameplay acceptance is pending; one fixed AI battle per launch, no record-rollback claim." : "Earlier bounded game evidence. Mixed targets need a separately available private roster-v1 component, not included in this download.";
    internal static string CandidateVersion(JsonElement manifest)
    {
        if (!manifest.TryGetProperty("runtimeVersion", out var value)) return "2.13.0"; // Retained contracts are immutable.
        if (!manifest.TryGetProperty("workbenchVersion", out var app) || app.GetString() is not ("0.18.0-rc.1" or PreviewWorkbenchVersion))
            throw new InvalidDataException("Unexpected runtime version on an older test contract. Prepare a fresh test; no session is migrated.");
        string version = value.GetString() ?? ""; _ = FilesFor(version); return version;
    }
    internal static string SessionVersion(IsolatedTests.Session session) => session.ExtenderVersion ?? "2.13.0";
}
