# Workbench release preparation — 2026-11-11

**Polish, official CoE5SE 3.3.0 bounded gameplay, protected return/export and final package checks completed. Publication status is recorded below.** The package identity below describes the verified intermediate polished build, not a claim that it supports 3.3.0.

## Completed polish and intermediate package

- Shorter ordinary captions; optional runtime/session identity diagnostics; consistent Test results action. The empty index and irrelevant draft actions are hidden until source is open.
- Source launcher now checks/starts the same release build. The badge uses the real version. Native help renders headings/paragraphs instead of raw Markdown.
- Portable self-contained Windows x64 host using Microsoft .NET 10.0.15, SDK 10.0.404. The SDK archive matched Microsoft's published SHA-512 and was extracted only into a local build-tools folder. It did not install a system runtime. WebView2 remains separate, with a user-initiated download link on missing-runtime startup.
- Updated concise installation, removal/update and first-use guides; offline START-HERE.html; third-party terms retained, including current bundled framework notices. No installer is claimed.
- An intermediate native run caught rc.3 contracts being omitted during the version bump. Explicit version gates were corrected for prepared tests, original observations and result readers. The final intermediate native suite passed.

Intermediate archive: CoE5Workbench-0.18.0-win-x64.zip, 60,321,263 bytes; SHA-256 **8af5cc32816e5009493dab716377fefd82fa09eefcc044b93ca65602ec9e7a51**. This is not yet a public download and will be rebuilt for 3.3.0 changes. Audit: 87 files, 86 inventoried; no game/extender/core/user/session files or machine-specific paths found. Runtime and SDK/library terms are included.

## Actual Windows desktop observations

Exact archive extracted into package-verified. Main window: 1107 ×794 logical pixels; native guide 807 ×694. Current system WebView2: 148.0.3967.54. Both application runs closed normally; no game launched.

- All three starting routes were visible without scrolling. New-definition form inspected; creation logic is covered offline, but a complete new form was not submitted during this desktop run.
- Vanilla Library loaded the user's verified 5.43 catalog. Partial search firebal showed six distinct records; Fireball spell #445 selected, known link to weapon #54 and read-only/CoE5SE dependency visible.
- Native Open loaded the included larger two-weapon example. Selected Official Comparison Needle. Test scope and compatible runtime were clear. One fresh private preparation enabled Start, without starting a game.
- Retained rc.3 mixed result reviewed: impact 68→34, mode 1→2, flight 7→65. Recorded values were distinguished from visual evidence. Explicit Apply selected to draft and native Export copy wrote a separate complete file. Byte comparison established exactly those three changes, with other text/BOM/formatting and the original example untouched.
- Vanilla/CoE5SE target changes retained the source; Vanilla showed New weapon and testing still named CoE5SE. F1 and the native readable guide worked.
- A disposable pending range edit 5→6 triggered the real native unsaved-close prompt. Choosing No retained the app/edit; only that temporary edit was discarded afterward.
- A second fresh preparation was rechecked as Ready after normal close/reopen. The earlier preparation was correctly stale after draft changes; an already-used rc.3 comparison showed refusal and disabled Start. No preparation was replayed.
- The exported full source was reopened through the native dialog and its intended weapon selected. Both app runs closed normally with no game process started.

Screenshots 01–14, native reports, export comparison, inventory and preservation records remain local. No media or raw session/log records are intended for public Git.

## Offline and preservation evidence

324 script checks passed. The exact extracted package passed 107 compiled native checks with installed .NET lookup disabled; it reported .NET 10.0.15. The suite includes real file fingerprints for the earlier two releases, captured launch intent/substitute child, old-result review, tamper/refusal, source and conflict protection. These are not gameplay observations.

All 24 tracked Lua helpers are unchanged. Existing bounded game reports are reused; no new game behavior is claimed. Of 1,334 pre-existing test-store files, only the expected last-selected-session pointer changed; none went missing. Two fresh disposable preparations were created. Original source and the intermediate ZIP stayed unchanged through the desktop check. Normal game files, mods, saves and profiles were not operated.

Remaining checks: actual 3.3.0 compatibility and bounded game acceptance, rebuilt final-archive checks and publication. Separate-machine first launch, missing-WebView2 UI, other DPI/sizes, installer and code-signing reputation were not verified. Drafts need explicit export before closing; automatic draft recovery is not supplied. Existing Quit cause remains unknown.

## Final 0.18.0 acceptance supplement

The earlier archive/checks above are historical intermediate evidence. The final archive has SHA-256 **89d63fe2470235f45ebee7082f1e90c44915c45d39ede97185a43db40fa3c320**, 60,324,075 bytes. Its fresh extraction passed privacy/inventory audit, 116 native checks and actual desktop Library, retained preparation/refusal, included-example editing/export and normal closure. 327 script checks pass. Fresh 3.3.0 gameplay and protected spell/mixed return/export are documented separately, including the lost original Fireball exit receipt and unresolved status-log event. See the [complete final report](../release-018-final-20261111/REPORT.md). Publication follows the verified source commit; no earlier release/archive is replaced.

Publication completed: [0.18.0](https://github.com/Chazammm/Coe5Tool/releases/tag/v0.18.0). The public ZIP was freshly downloaded and matched the exact final SHA-256 and byte count above. Previous releases remain intact. The follow-up publication record does not rebuild or replace the tested archive.
