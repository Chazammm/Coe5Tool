using System.IO;
using System.Text.Json;
namespace CoE5Workbench;

internal static partial class GameRuntime
{
    internal const string CurrentWorkbenchVersion = "0.19.0-rc.2";
    internal const string CurrentExtender = "3.4.4";
    internal const string Release344Sha256 = "73e88ee9b2e82bf95a1c6d88894a8ef03009116fba3d246aef943f1b965a83b8";
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
    internal static Dictionary<string,string> Files344 => new(KnownFiles)
    {
        ["runtime/glu32.dll"] = "bcc0491698280804364f95bcf3e199c36af92590daf68b150e345c87030c3793",
        ["profile/mods/CoE5SE/banner.tga"] = "a323c2ee6b339b6e1acf4f8c8bd9f6476d97ab3ff47f880bfdaed91e57ea9c19",
        ["profile/mods/CoE5SE/coe5config_layout.txt"] = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        ["profile/mods/CoE5SE/CoE5SE.c5m"] = "40b0cf53812c9e9c32ddf4c804641fff70770c8ea6273079ae21017912b73800",
        ["profile/mods/CoE5SE/coe5se.c5plugin.dll"] = "e01510bb027a000c2c9fadca7d48f0bba0e2c1a84ab8caf57991c336002ec08d",
        ["profile/mods/CoE5SE/CoE5SE.c5se"] = "c469e6c5b8a799c15d7d2640245e56d5a5862ed7a8bc409855ab6294679d301c",
        ["profile/mods/CoE5SE/coe5se_loader.dll"] = "3b5eb80c194c25dc1c9604cd56d7832978f9f5fe6470a685100c633b8987b33b"
    };
    internal static bool OfficialGroups(string version) => version is "3.2.2" or "3.3.0" or "3.4.4";
    internal static int ApiVersion(string version) => version switch { "2.13.0" => 10, "3.2.2" or "3.3.0" => 11, "3.4.4" => 14, _ => throw new InvalidDataException("Unknown official API profile.") };
    internal static string[] LogRelativePaths(string version) => version is "3.3.0" or "3.4.4"
        ? ["log.txt", "coe5se_logs/coe5mod.log", "coe5mod.log"] : ["log.txt", "coe5mod.log"];
    internal static Dictionary<string,string> FilesFor(string version) => version switch {
        "2.13.0" => KnownFiles, "3.2.2" => Files322, "3.3.0" => Files330, "3.4.4" => Files344,
        _ => throw new InvalidDataException("Unsupported extender version. Use official 2.13.0, 3.2.2, 3.3.0 or 3.4.4 (preview) for the verified 5.43 executable.")
    };
    internal static string IdentifyOfficialPlugin(string hash) => hash switch {
        "26861bb0b6dffaa7150ed239e9eba4e934a955688d101c81161cf395190dd254" => "2.13.0",
        "87e70dead42341573889641447d04c700af359243696a57b32e89a4fac682e8a" => "3.2.2",
        "26cb5c25e5aab0dc27710bbd08bc7ba9374dfa8ff8f6e4dc423b3e2cc743e14b" => "3.3.0",
        "e01510bb027a000c2c9fadca7d48f0bba0e2c1a84ab8caf57991c336002ec08d" => "3.4.4",
        _ => throw new InvalidDataException("Unrecognized official extender fingerprint. Choose the complete official 2.13.0, 3.2.2, 3.3.0 or 3.4.4 folder; filenames and version text alone are insufficient.")
    };
    internal static string LabelFor(string version) { _ = FilesFor(version); return "CoE5 5.43 / CoE5SE " + version + (version=="3.4.4"?" (preview; game acceptance pending)":""); }
    internal static string Evidence(string version) => version == "3.4.4" ? "3.4.4 preview: release checksum/attestation, API/source and offline safeguards checked. Fresh selected spell, original AI and mixed comparison game acceptance is pending. Only private test weapons may be edited; expanded shared-record access is not exposed. Field closure is not complete rollback."
        : version == "3.3.0" ? "Bounded 3.3.0 game checks cover one selected spell, original Fireball and mixed visual comparison. Other combinations remain unverified. Field closure does not establish complete record restoration."
        : version == "3.2.2" ? "Bounded game checks cover a selected spell, original Fireball, mixed targets and visual comparison. Other combinations remain unverified; field closure does not establish complete record restoration." : "Earlier bounded game evidence. Mixed targets need a separately available private roster-v1 component, not included in this download.";
    internal static string CandidateVersion(JsonElement manifest)
    {
        if (!manifest.TryGetProperty("runtimeVersion", out var value)) return "2.13.0"; // Retained contracts are immutable.
        if (!manifest.TryGetProperty("workbenchVersion", out var app) || app.GetString() is not ("0.18.0-rc.1" or "0.18.0-rc.2" or "0.18.0-rc.3" or "0.18.0" or "0.18.1" or "0.18.2-rc.1" or "0.19.0-rc.1" or CurrentWorkbenchVersion))
            throw new InvalidDataException("Unexpected runtime version on an older test contract. Prepare a fresh test; no session is migrated.");
        string version = value.GetString() ?? ""; _ = FilesFor(version);
        if (version == "3.4.4" && app.GetString() is not ("0.18.2-rc.1" or "0.19.0-rc.1" or CurrentWorkbenchVersion)) throw new InvalidDataException("3.4.4 requires a fresh current-version preparation with private-record guards. Retained sessions are not migrated.");
        if (version == "3.3.0" && app.GetString() is not ("0.18.0" or "0.18.1" or "0.18.2-rc.1" or "0.19.0-rc.1" or CurrentWorkbenchVersion)) throw new InvalidDataException("3.3.0 requires a fresh preparation from the current Workbench. Retained sessions are not migrated.");
        return version;
    }
    internal static string SessionVersion(IsolatedTests.Session session) => session.ExtenderVersion ?? "2.13.0";
}
