using System.IO;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace CoE5Workbench;

internal sealed partial class IsolatedTests
{
    // Display provenance only. It is never used as a path or as launch authority.
    private static string? OriginName(JsonElement payload)
    {
        if (!payload.TryGetProperty("sourceName", out var value) || value.ValueKind != JsonValueKind.String) return null;
        string name = value.GetString()!;
        return name.Length is > 0 and <= 160 && name.All(c => c >= 32 && c is not '/' and not '\\' and not ':') ? name : null;
    }
    private Session ReadPrepared(string id)
    {
        CheckReviewRoot();
        var s = JsonSerializer.Deserialize<Session>(LocalFiles.ReadText(Path.Combine(SessionRoot(id), "session.json"), 256 * 1024)) ?? throw new IOException("Session record is missing.");
        if (s.Id != id || !Regex.IsMatch(s.Revision, "^[a-f0-9]{64}\\z") || s.Hashes == null || s.Hashes.Count == 0) throw new IOException("Session identity or file manifest is incomplete. Prepare a fresh test from your draft.");
        return s;
    }
    private void RequireResumable(Session s)
    {
        if (s.Stale) throw new InvalidDataException("This preparation was invalidated by a draft or setup change. Prepare a new test from the current draft.");
        string folder = SessionRoot(s.Id);
        var launches = Directory.GetFiles(folder, "launch-*.json");
        // An exited settings-only bootstrap is the one safe continuation of a prior launch.
        bool bootstrap = s.Status == "exited" && s.Pid.HasValue && s.StartUtc.HasValue && s.ExitCode == 0 && launches.Length is > 0 and <= 10 && s.ResultRun == null && s.Observation == null;
        if (bootstrap)
        {
            foreach (string file in launches)
            {
                using var doc = JsonDocument.Parse(LocalFiles.ReadText(file, 16384)); var l = doc.RootElement;
                if (!l.GetProperty("bootstrap").GetBoolean() || l.GetProperty("revision").GetString() != s.Revision ||
                    l.GetProperty("executable").GetString() != Path.Combine(folder, "runtime", "CoE5.exe") || l.GetProperty("profile").GetString() != Path.Combine(folder, "profile")) bootstrap = false;
            }
            if (bootstrap) _ = ConfigForTest(Path.Combine(folder, "profile", "coe5config"), s.ModId);
        }
        if (!bootstrap && (s.Pid != null || s.StartUtc != null || s.ResultRun != null || launches.Length != 0 || s.Observation != null))
            throw new InvalidDataException("Already used or previously started. Review its saved results, or prepare a fresh test from your draft. This session will not be replayed.");
        if (!bootstrap && s.Status != "prepared") throw new InvalidDataException("Preparation is incomplete or failed. Inspect its files and prepare a new test; retained files will not be repaired or replaced.");
    }
    private static string TestMode(Session s) => s.OriginalRecord ? "Original record · native AI" : s.PrivateRanged ? (s.WeaponEditing ? "Ranged weapon · visual comparison" : "Ranged weapon · native AI") : s.PrivateMelee ? "Melee weapon · native AI" : s.WeaponEditing ? "Spell & weapon · forced-cast experiment" : "Spell & weapon · forced cast";
    internal object PreparedSessions()
    {
        if (!Directory.Exists(root)) return Array.Empty<object>();
        CheckReviewRoot(); var rows = new List<object>();
        var folders = Directory.GetDirectories(root).Where(p => Regex.IsMatch(Path.GetFileName(p), "^[a-f0-9]{32}\\z")).ToArray();
        if (folders.Length > 1024) throw new IOException("More than 1,024 retained sessions. Open the test storage folder to archive sessions before listing them.");
        foreach (string folder in folders)
        {
            string id = Path.GetFileName(folder);
            try
            {
                var s = ReadPrepared(id); string state = "unchecked", reason = "Check files and runtime before resuming.";
                try { RequireResumable(s); } catch (Exception e) { state = s.Stale ? "stale" : s.Pid != null || s.ResultRun != null ? "used" : "incomplete"; reason = e.Message; }
                rows.Add(new { id, name = s.Spell, runtime = GameRuntime.LabelFor(GameRuntime.SessionVersion(s)), source = s.SourceName ?? "Original filename unavailable · prepared snapshot", mode = TestMode(s)+(s.Roster!=null?(GameRuntime.SessionVersion(s)=="3.2.2"?" · official groups · fixed":" · local roster-v1"):""), mixed = s.Roster != null, mixedObservation = s.Roster!=null && !s.WeaponEditing && s.Status=="exited" && s.ResultRun!=null, original = s.OriginalRecord, observation = s.OriginalRecord && s.Status == "exited" && s.ResultRun != null, state, reason, revision = s.Revision, prepared = s.PreparedUtc, review = s.WeaponEditing && s.Status == "exited" });
            }
            catch (Exception e) { rows.Add(new { id, name = "Incomplete preparation", source = "Source unavailable", mode = "Unknown", state = "incomplete", reason = e.Message, review = false }); }
        }
        return rows.OrderByDescending(r => ((JsonElement)JsonSerializer.SerializeToElement(r)).TryGetProperty("prepared", out var date) && date.ValueKind == JsonValueKind.String ? date.GetString() : "");
    }
    internal object CheckPrepared(string id)
    {
        // A read-only check: no session status, pointer, profile, source or draft is rewritten.
        string? revision = null, source = null, mode = null; bool ready = false; string state = "incomplete", detail;
        try
        {
            var s = ReadPrepared(id); revision = s.Revision;
            state = s.Stale ? "stale" : s.Pid != null || s.ResultRun != null ? "used" : "incomplete";
            RequireResumable(s);
            state = "stale";
            var valid = ValidatePrepared(s, s.Revision); source = valid.candidate.Source; mode = valid.candidate.Mode;
            state = "blocked";
            if (processes.AnyGameRunning()) throw new IOException("A CoE5 session is running. Quit it yourself, then check again. No process was closed.");
            ready = true; state = "ready";
            detail = File.Exists(Path.Combine(SessionRoot(id), "profile", "coe5config")) ? "Ready to launch the saved snapshot. Your open draft stays unchanged." : "Ready for first-time profile setup. Start, quit normally once, then check this session again to load the test.";
            if(GameRuntime.SessionVersion(s)=="3.2.2")detail+=" "+GameRuntime.Evidence("3.2.2");
        }
        catch (Exception e) { if (e.Message.StartsWith("Runtime incompatible", StringComparison.Ordinal)) state = "incompatible"; detail = e.Message + " Your draft and retained files were not changed."; }
        return new { id, revision, ready, state, detail, source, mode };
    }
    internal string PreparedFolder(string id)
    {
        // Inspection must remain available even when the session record is incomplete.
        CheckReviewRoot(); string folder = SessionRoot(id);
        if (!Directory.Exists(folder)) throw new IOException("Retained session folder is missing.");
        return folder;
    }
}
