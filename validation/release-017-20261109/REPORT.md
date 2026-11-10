# Workbench 0.17.0 release verification

Completed 2026-11-10. Review began 2026-11-09; the folder name is retained. **The exact Windows archive passed the desktop and package checks. No game was launched in this release task.** Publication is recorded below only after remote verification.

## Product changes and observed reasons

The prior actual Windows journey exposed three concrete problems: the welcome screen foregrounded creation instead of the three modder intentions; Try example opened a pair rejected by its test route (quoted magic path / unsupported flag); and preparing a test required two separate internal stages, with the first below the initial viewport.

The welcome screen now offers **Explore Vanilla spells & weapons**, **Open your mod…**, and target-aware creation plus **Try a supported example**. Editing/export and the CoE5SE game dependency are stated together. A single **Prepare game test** builds and checks a fresh private setup. **Start isolated test** remains a separate action. Preview/ZIP and the old reviewed-file preparation route remain under Advanced. Neither action bypasses native validation, source/option race checks, ownership, process checks or unsaved-observation protection.

Examples now use a supported canonical CoE5SE pair (numeric Pyromancy path 3) or a native melee fragment in Vanilla. They are starting fragments, not full installable mods or new in-game compatibility evidence. F1 links to a practical three-journey guide; the README and portable setup guide explain the next steps without a mandatory tutorial. See checklist C39–C41; C34's snapshot wording was also observed in this package.

## Exact archive

- Version: **0.17.0**, Windows x64, framework-dependent.
- Local archive: `dist/CoE5Workbench-0.17.0-win-x64.zip` (1,612,854 bytes).
- SHA-256: `c02ec0cfc2dc1616084ed2f7188998c6a56deda85d8ac66876a7fe49de8d4393`.
- Inventory: **81 files**, including `PACKAGE-CONTENTS.json` and 80 hashed entries; 4,308,876 uncompressed bytes.
- Tested extraction: `extracted-01` in this validation folder. The same unchanged ZIP was extracted again to `extracted-final-audit` for the final inventory/privacy gate.
- Older 0.16.1 ZIP remains unchanged, SHA-256 `ac07b8c11a9f26553aa99fd12647a074529f0d50d0b6245c1aa720ebacb4a8a8`.

The final archive was frozen after these checks. Later verification/publication documentation does not rebuild or replace it.

## Actual Windows desktop results

Checked the extracted executable, not a source build or older launcher, at **1107 × 794 captured window pixels**, current Windows scaling, WebView2 runtime **148.0.3967.54**. This was a fresh application extraction on an existing configured Windows account, not a clean-machine or all-DPI test.

| Journey/check | Actual result |
| --- | --- |
| Welcome and next actions | All three routes visible. Compact rows retain the visual identity. Dependency sentence visible; additional workflow notes scroll. [Welcome](01-final-welcome.png). |
| Supported CoE5SE example | Opened two linked definitions; Test enabled. Prepare game test created one new disposable Workbench Javelin preparation, with no game process launched. Preparation and Start were visually separate. |
| Existing full source | Native Open read the included `examples/selected-spell-workshop.c5m`; four definitions retained. Spell overview displayed both local weapon links; detail opened Harbor Ember Test with the linked Harbor Ember and the selected-spell test action. |
| Edit/apply/export | Changed only Harbor Hook initiative 5 → 6, Apply then native Export copy to `desktop-export-017.c5m`. The 748-byte complete export exactly equals the original with that one substitution. Included example bytes remain unchanged. |
| Saved-result review | The Harbor Ember reminder opened the matching prior result: five unchanged settings, one completed cast call, explicit unknown visual appearance and snapshot/full-source wording. No values or observation were applied/saved. |
| Vanilla Library | Read 1,965 spell/weapon records from the configured verified local executable. Fireball search returned six distinct records; spell #445 showed path, level, payload and weapon #54. Observe and Previous observations were visible. No built-in definition was edited or cloned. |
| Used-session refusal | Previous observations found the used Fireball preparation. Start stayed disabled with a clear no-replay explanation; read-only helper facts showed battle-return count 1 and exit 0 while hits/casts/visuals remained separately qualified. |
| Close/reopen/resume | Closed the first app normally (confirmed its conservative unsaved-preparation warning), reopened the exact extracted EXE, selected the new Workbench Javelin preparation and used Check before resuming. Ready appeared with Start enabled; **Start was not clicked**. |
| Vanilla creation and example | Target switched to Vanilla; the welcome/creator offered native weapons only, with no spell creation fields and an optional SE-test explanation. Try example opened Workbench Spear and offered its melee test action. [Vanilla start](09-final-vanilla-start.png) · [Creator](10-final-native-creator.png). |
| Help and final closure | F1 showed the workflow-guide link, target/format and Apply/export explanations with readable focus. Closed the owned app normally; no Workbench or game process remained. [Help](11-final-help.png). |

The existing account supplies runtime paths and retained results; a recipient must configure their own files. No private preparation is shipped. No real Explorer drop, alternate DPI, installer/prerequisite installation, accessibility assistive technology or different computer was newly tested in this release pass. Prior drag/drop evidence remains separate.

## Offline verification and preservation

- **301 / 301 JavaScript tests passed**. New regressions cover the three starts, both supported example formats, native example, all three combined-preparation routes, pending draft preservation, no auto-start, unavailable runtime, invalid count, asynchronous invalidation and declined observation replacement.
- **70 / 70 compiled native checks passed**, including 0.16.0 / 0.16.1 / 0.17.0 manifest acceptance, malformed refusal, source/encoding/export protection, session/result association and readiness guards. Substitute-process checks are explicitly not game tests.
- Windows Release build succeeded with locked existing dependencies. No field/helper Lua, private carrier implementation, native runtime fingerprint or roster ABI changed. Existing bounded gameplay evidence is reused; this is not a fresh game result.
- **1,115 pre-existing test-storage files fingerprinted**: only the global last-session pointer changed to the new preparation. Every retained session file stayed byte-identical. One fresh unused preparation was intentionally created and remains local. The installed game executable and older ZIP remained unchanged.
- All 80 shipped inventory entries stayed byte-identical after the desktop run. The app created `.workbench-profile` as documented. A strict whole-extraction audit correctly refused this now-used directory because of the new cache; a second untouched extraction of the same ZIP passed. Share the release ZIP, never a used app folder.
- Final fresh-extraction `tools/verify-package.cjs`: inventory/hash, x64 identity, executable allowlist, optional extension fingerprint, known official-file hash, machine-path/private-data and credential checks passed. Six synthetic regression tests verify rejection of changed/unlisted files, sessions, machine paths, game executables, traversal and wrong architecture.
- `um publish check` on the **fresh final extraction: 81 files, 0 failures, 0 warnings**. No game executables/assets/full installed catalogs, official extender runtime files, personal mods, saves, profiles, sessions or per-machine paths are included.

Raw desktop images, input snapshots, native output, test logs, audit JSON and the disposable export remain local in this folder. Only this portable report and four reviewed app-only screenshots are intended for publication; runtime/cache/session data are excluded.

## Setup and important limits

Extract the whole ZIP into a writable folder; launch `CoE5Workbench.exe`. Requires **Windows x64, .NET 8 Desktop Runtime x64 and WebView2 Evergreen Runtime**. No Node.js/SDK/account is needed to run it. See [portable setup](../../docs/WINDOWS-PACKAGE-017.md).

Editing/export can run offline. Installed-catalog discovery needs the user's own supported executable. **Every integrated game field requires the user's own fingerprint-compatible CoE5 5.43 / official CoE5SE 2.13.0**. The ZIP supplies neither game nor official runtime. The optional pinned `roster-runtime` DLL is the separately built open-source Workbench roster-v1 extension, with notices; official runtime files remain required. It is used only in disposable copies.

Original-record AI observation, forced custom-spell testing and private-carrier AI battles remain different workflows. Unknown commands and full source are preserved, but testability is bounded; arbitrary mod dependencies and special payloads may be refused. No desktop effect renderer, faithful built-in clone, Vanilla-only integrated field, general campaign/AI/range/save compatibility or universal effect guarantee is implied. HP changes do not identify an attacker. The original unexplained Feebleminded event remains uncertain and was not reproduced in four prior controls.

Prior observed examples: [fresh Fireball native AI and captured flight/impact](../fireball-library-manual-20261109/agent-game-20261109/REPORT.md), [selected spell game/return/export](../selected-spell-workflow-20261109-25c9d1/game-20261109/REPORT.md), [mixed area, comparison, export and normal exit](../mixed-area-manual-20261108-724df2/REPORT.md). The new preparation in this pass was not launched; previously resumed real-game evidence is recorded separately in the [0.16.1 report](../resume-package-0161-20261109/REPORT.md).

## Publication

**Published:** [CoE5 Spell & Weapon Workbench 0.17.0](https://github.com/Chazammm/Coe5Tool/releases/tag/v0.17.0), 2026-11-10 09:45:12 UTC. Public, non-draft, non-prerelease. The new tag resolves to verified source commit [0a8e1ab9d1faa0325b7d3271262a0d8f961b9ab1](https://github.com/Chazammm/Coe5Tool/commit/0a8e1ab9d1faa0325b7d3271262a0d8f961b9ab1). No force push or prior release replacement occurred.

Assets: [Windows ZIP](https://github.com/Chazammm/Coe5Tool/releases/download/v0.17.0/CoE5Workbench-0.17.0-win-x64.zip) and [SHA-256 checksum](https://github.com/Chazammm/Coe5Tool/releases/download/v0.17.0/CoE5Workbench-0.17.0-win-x64.zip.sha256). Both uploaded assets were downloaded into a new local verification folder and compared before publishing. The ZIP matches the exact desktop-tested hash above; the 99-byte checksum file also matches byte-for-byte (its own SHA-256 is `edac1e548791857da2deccb4027a0f555eb57423129c59b5628c48990e559f6f`). GitHub's asset digests agree. Downloaded files were not executed. Earlier v0.16.0 and the local 0.16.1 ZIP are preserved.

The report's final publication update is a later documentation-only commit; it does not rebuild or replace the verified ZIP or move the release tag. Source, portable documentation and four reviewed app-only screenshots are committed. Game/runtime binaries, private preparations and caches remain local.
