# Resume an isolated preparation · 0.16.1

Choose **Prepared tests…** in the Windows desktop toolbar. Search by part of the spell, weapon, source filename or session ID. Select a row, then **Check before resuming**. **Start saved test** is enabled only after verification and repeats the checks when clicked. Nothing launches while listing or checking.

This launches the **saved, bounded test snapshot**, not your current draft or an arbitrary mod. Your open source, target, selected entry and pending edits remain in the editor. Expand **Saved test source** to inspect the snapshot; for a selected definition this is deliberately not the complete mod. Newly prepared sessions retain a display-only source filename. Older preparations show that the original filename is unavailable. The app cannot establish whether an original file outside the session has since changed, and never silently opens or replaces it.

Every explicit resumed launch reloads the owned session from disk under the existing launch mutex. It checks canonical candidate/helper content, revision, names, mode/roster/target identity, staged hashes, independent runtime fingerprints, allowed mod folders/binaries and the absence of any active CoE5 process. It verifies the user's configured CoE5 **5.43** and official CoE5SE **2.13.0** files again. Mixed rosters additionally require the pinned Workbench **roster-v1** runtime already staged in that preparation. The existing native gates remain authoritative; changing the UI cannot bypass them.

States and next steps:

- **Not checked:** potentially unused; check the current files and runtime. This is not a compatibility claim.
- **Ready:** verified now. Launch checks again; active processes or changes since the check still refuse.
- **Already used:** a test has started or has uncertain prior launch evidence. Review saved values or inspect logs; prepare a fresh test to repeat it.
- **Stale:** invalidated options/source or changed staged content. Prepare a new test from your intended draft. No automatic repair or substitution.
- **Incomplete:** missing/corrupt identity, failed preparation or missing files. Inspect retained files, then prepare a new session.
- **Incompatible runtime:** restore access to the same verified local files, or configure a supported runtime and prepare a fresh test. The app does not patch or downgrade the game.
- **Cannot resume:** for example, another CoE5 process is running. Quit it yourself and check again. Workbench does not close it.

A first launch without disposable profile settings remains the existing **settings-only setup**, with mods disabled. Quit normally, refresh, check again and start the same preparation. Continuation is permitted only with an observed exit code 0, exclusively bootstrap launch records, a valid disposable config, and no test result/observation. If exit cannot be established after a restart, it is conservatively treated as used; prepare afresh. The app never imports the normal game profile.

After quitting the test, choose **Refresh**, then **Review saved values** where available, or use **Saved test values**. Existing result validation, explicit field selection, conflict choices and separate complete-source export remain unchanged. A saved value is a helper readback; a cast counter is a recorded call; neither proves a hit, status cause or visible effect. Original-record/fixed observation modes do not acquire editable return merely by being listed here.

Storage remains per Windows account: `%LOCALAPPDATA%\CoE5Workbench\Tests`. The ZIP carries no sessions, runtime paths or profile. Extracting another app copy on the **same** account can find its existing preparations; a friend's account starts empty and must select its own compatible runtime. Canonical 0.16.0 and 0.16.1 helpers are accepted for launch; older review-only formats remain review-only.
