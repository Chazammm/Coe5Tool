# Prepared-session resume and verified Windows package · 0.16.1

Date: 9 November 2026. Source baseline: `7930ad9e9bc3f457831961f27e0567abea458ebc` in `Chazammm/Coe5Tool`.

## Outcome

**Latest outcome: PASS for one real resumed baseline test.** With the user's subsequent desktop authorization, the agent launched the formerly unused preparation through **Prepared tests… → Check before resuming → Start saved test**, opened the field, cast exactly once, saved its unchanged values, closed the field, quit normally with exit code **0**, reviewed the result and exported a **748-byte, byte-identical full-source copy**. Flight and impact were captured. This supersedes the earlier pending game handoff below; it does not establish general combat or VFX compatibility.

Implemented **Prepared tests…**: searchable retained preparations, source provenance, test mode, readiness/refusal reasons, explicit recheck/start, file inspection and existing saved-result review. It launches a saved bounded snapshot without replacing the open draft. Completed tests remain evidence and cannot replay through this new path. The one exception is a verified, settings-only bootstrap continuation after an observed normal exit.

**Earlier verification passed 284 JavaScript checks and 67 compiled checks.** Its desktop-only phase covered source opening, fresh preparation, restart, discovery, readiness, used/stale refusal, pending-edit protection, retained-result return and separate export. That phase did not launch the game. The subsequent real resumed test and the source-only wording correction with **285 passing script checks** are recorded separately below.

The final source included a subsequent small text/refusal-path rebuild. Its initial desktop relaunch was stopped by the user's physical Escape key. **The subsequently requested desktop recheck of that exact, unchanged archive passed on 9 November 2026:** clean extraction/inventory, launch, native Open, unused-session readiness, used/stale refusal and normal application closure. No rebuild was required. The archive remains local; no GitHub release was created or replaced. Details of the completed check follow below.

## Investigation and launch protections

The session files survived an app restart; only the JavaScript source/options binding was transient. The former Start button intentionally required that binding, so valid preparations became inaccessible from a fresh workspace. C30 in the existing consistency checklist now records the fix.

The new path does not reconstruct transient forms or load arbitrary mod content. It lists owned 32-character session directories, then reads and validates the chosen preparation. Old records without a source filename explicitly say so. New records retain a sanitized display-only basename and preparation time. The saved canonical definition is inspectable; the complete mod remains in the editor. External original-file freshness is unknown because the original path/bytes are not persisted as launch authority; the UI explicitly launches a saved snapshot.

Inspection and launch share the existing canonical candidate/runtime/file validator. Each resumed Start re-reads the persisted session under the existing launch mutex, checks its revision, stale/used state, mode, target and roster identities, canonical helper and source, staged hashes, independent pinned game/extender hashes, mod-folder inventory, unexpected runtime binaries and active-game conflict gate. It also verifies the original local runtime files still exist and match. No stale record is silently repaired. Broken records can still open their owned folder for inspection. Review-only older helper contracts remain review-only; unchanged 0.16.0 and current 0.16.1 contracts remain accepted for launch.

Bootstrap continuation requires exclusively settings-only launch records, observed exit code 0, a valid disposable config and no result/observation. An uncertain previous launch is refused; prepare afresh. Existing same-window Start behavior and result history were preserved.

## Earlier desktop observations · before the final recheck

Window capture dimensions were **1107 × 794 physical pixels** at the current Windows scaling. Other DPI settings and monitors were not exercised.

1. Opened the ZIP's `examples/selected-spell-workshop.c5m` through the native Open dialog. Four supported source entries were shown, with unknown/unrelated source retained.
2. Selected **Harbor Ember Test**, enabled the weapon experiment and prepared files plus a fresh disposable session, `2c6170fff992451fab214656852e76b4`. No Start action was invoked. The native gate verified the user's pinned **CoE5 5.43 / official CoE5SE 2.13.0** pair. The existing released-extender setup and local roster-v1 overlay rules were unchanged.
3. Closed and reopened the packaged app. From the empty workspace, **Prepared tests…** found the new preparation. **Check before resuming** displayed the exact source basename, forced-cast mode and full session identity, then enabled **Start saved test** after real production validation. Source remained unopened. Start was deliberately not clicked; substitute-process native checks cover that route.
4. The completed Harbor Ember session `27a526744dad40d2b85c0397aa0d6582` was marked **Already used**, refused replay and opened in existing saved-value review. With no draft open, Apply remained blocked.
5. The existing Codex VFX Trial was shown as **Stale**, with a fresh-preparation instruction, disabled Start and retained review access. Its files were not changed.
6. In another clean extraction, opened the representative source and staged an unrelated **Harbor Hook damage 0 → 11** edit. Rechecked the unused Harbor Ember preparation, filtered/searched sessions, inspected refusals and closed the chooser. The pending 11 remained unapplied in the original editor.
7. Reviewed the retained Harbor Ember result: **impact 68 → 3**, **one completed cast call**, and explicit “visual appearance is not established by this file.” The personal-observation checkbox remained unchecked. Applied only impact; pending Hook damage 11 survived. Then explicitly applied that separate intentional edit and exported `desktop-return-export.c5m` through the native Save dialog to a new path.
8. Byte comparison confirmed exactly those two numeric changes, with comments, other definitions, line endings and unrelated source intact. The included original and project example remained identical. App closure after export was observed; no new game result or VFX claim is made.

A concrete inconsistency was found during this journey: filtering away a checked row left its Ready detail/action visible, and changing rows retained old Ready feedback. Fixed and regression-tested as **C33**. The next desktop run confirmed filtering clears selection/authorization and stale selection shows its own feedback.

Local screenshots: `01-open-example.png`, `02-ready-after-restart.png`, `03-used-session.png` (before feedback correction), `04-retained-review.png`, and final-UI `05-final-ready.png` through `10-separate-export.png`. These screenshots and raw session/path inventories remain local; they are not shipped or published.

## Offline verification

- `offline/scripts-release.tap`: **284/284** checks. Added search, selection/authorization invalidation, refusal, explicit native resume routing, empty/unavailable data, draft/target/pending-edit preservation and review handoff coverage.
- `offline/native-shipping-candidate.json`: **67/67**, run from the final extracted package. Includes canonical current/0.16.0 compatibility, full-source spell/weapon and mixed readbacks, new restart/read-only discovery checks, stale/helper/identity/mode/process races between check and Start, incomplete/used/failed refusal, runtime/ownership refusal, settings-only continuation, current 0.16.1 editable result exchange in both formats and legacy return protections. Launch tests use substitute processes, not CoE5.
- Real production readiness checks in the desktop validated the installed runtime and actual staged files; mock checks alone are not the basis of that compatibility statement.
- `preservation-and-export.json`: all **1,363** pre-existing retained/reference files checked. **1,362 unchanged**, none missing; only the app-owned `last-session.txt` pointer changed to the fresh preparation as expected. No completed session was rewritten. No normal game profile, campaign, save, mod or installation was changed.
- Build completed without compiler warnings. No new diagnostic cast or status investigation was performed. The original Feebleminded event remains unexplained and was not reproduced in four earlier controls.

## Verified local package · unchanged archive

File: `dist/CoE5Workbench-0.16.1-win-x64.zip` (1.60 MB approximately).

SHA-256: `ac07b8c11a9f26553aa99fd12647a074529f0d50d0b6245c1aa720ebacb4a8a8`.

The exact allowlist is derived from source project assets, known application/WebView binaries and license inputs, with a separately pinned optional open-source roster-v1 component. `PACKAGE-CONTENTS.json` records each shipped file hash. A clean extraction contains **77 files including the inventory**. Deliberate unrelated output probes in root, UI and licenses were excluded. No game executable, official release runtime/loader, assets, personal mods, saves, profiles, cached imports, runtime paths or private sessions are included. The roster DLL is the Workbench's open-source extender extension, not a game binary; the user still supplies the official compatible runtime and game data.

This is a **framework-dependent Windows x64 folder application**, not a single self-contained EXE. Extract everything and run `CoE5Workbench.exe`; .NET 8 Desktop Runtime x64 and WebView2 Evergreen are required. Source-only editing needs neither the game nor Node.js. In-game tests require the user's own verified local CoE5 5.43 and CoE5SE 2.13.0. Mixed tests additionally require roster-v1. See [setup](../../docs/WINDOWS-PACKAGE-0161.md) and [resume rules](../../docs/RESUMING-0161.md).

The final archive was initially extracted to `shipping-candidate/`, checked against every manifest hash and exercised through the 67 native checks. The later exact-archive desktop recheck below now completes its package acceptance. The ZIP was not rebuilt or rewritten to incorporate post-build documentation. Its bundled README therefore remains a build-time snapshot; this report supersedes the earlier pending-recheck notice. It is a **desktop-verified local package**, with no downloadable release publication.

## Completed exact-archive desktop recheck · 9 November 2026

**PASS for the requested package check.** Used the existing archive with SHA-256 `ac07b8c11a9f26553aa99fd12647a074529f0d50d0b6245c1aa720ebacb4a8a8`, freshly extracted to `final-desktop-20261109T184729/extracted/`. The same hash was confirmed again after closure. The application code corresponds to the 0.16.1 source published as `4cb8ceaa6fb959b34374fcba375c060f9952e051`; this follow-up changes documentation only. No implementation change or rebuild was needed.

- Inventory: **77 files**, comprising the inventory itself and **76 individually hash-verified files**. No missing, changed or unexpected entries. Previously audited game/private-data exclusions remain unchanged because the archive is byte-identical.
- Launched that extraction's `CoE5Workbench.exe`, brought Workbench into view and opened its included `examples/selected-spell-workshop.c5m` using the native Open dialog. The four source entries appeared; the editor stated **Original retained · no draft changes**. No Apply, export, configuration or preparation action was taken in this check.
- Opened **Prepared tests…**. The existing unused Harbor Ember preparation `2c6170fff992451fab214656852e76b4` showed its source basename, full session identity, **Spell & weapon · forced-cast experiment** mode and CoE5SE dependency. **Start saved test** was disabled before checking. **Check before resuming** completed the actual native validation and displayed **Ready to launch the saved snapshot. Your open draft stays unchanged.** Start became enabled. It was **not clicked**.
- Partial-ID search for the completed Harbor Ember session `27a526744dad40d2b85c0397aa0d6582` cleared the prior Ready selection. Selecting that session showed **Already used or previously started**, explicitly refused replay, disabled Start and retained **Review saved values**.
- Partial-ID search for Codex VFX Trial `3bc3ad7e1ef148fdb922af627be9760f` showed **Stale**, explained that the preparation was invalidated, requested a fresh preparation and kept Start disabled. No retained metadata was repaired, edited or substituted.
- Closed the dialog with **Close**, confirmed the original unedited example was still in the editor, then exited Workbench through **Alt+F4**. The window disappeared and a read-only monitor of the exact owned PID observed process exit. The monitor did not obtain a numeric exit code (`null`); no exit-code-0 claim is made. This was normal UI closure, not process termination.
- All **1,072 retained test files** fingerprinted before the check remained identical afterward, with **zero added, missing or changed files**, including the session pointer. The included example remained byte-identical to the project example. The unused session remains unused. No game was started; no CoE5 process was present after the check.
- Rendered size: **1107 × 794 physical pixels**, current Windows scaling. Search focus, labels, readiness and refusal controls were readable. Other DPI settings, displays, a clean Windows installation and a different account were not tested.

Local evidence remains under `final-desktop-20261109T184729/`: `archive-check.json`, `inventory-check.json`, `preservation-after.json`, `normal-exit.json`, screenshots `02-workbench-ready.png` through `09-source-unchanged-before-close.png`, and readiness/refusal accessibility captures. Raw paths, retained-file inventories, session data, app cache and screenshots are excluded from the public repository. Only this curated report and intended documentation changes are published.

The GitHub Releases query during this check listed only **v0.16.0** and its ZIP/checksum assets. **0.16.1 is available only locally**, at the package path above. This task did not upload an asset, create a release or replace an existing download. Earlier 284 script / 67 compiled checks remain prior offline evidence; no implementation changed during this follow-up, so those suites were not rerun merely for documentation updates.

## Earlier manual handoff · before the agent-operated run

**At this stage only preflight was complete.** The task initially requested a user-operated run, so the agent prepared the following handoff without launching a game. The user later authorized the agent to operate the desktop; the completed result follows in the next section. The session is now used and these historical instructions must not be treated as permission to replay it.

Rechecked the unchanged 0.16.1 archive and every inventoried file in its verified extraction. Reused the existing unused preparation `2c6170fff992451fab214656852e76b4`; no replacement package or session was created. Its status remains `prepared`, not stale, with no PID, result run or launch ledger. All staged inputs match their saved hashes; the disposable config already exists. No CoE5 process was present. The original installed game executable SHA-256 is `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55`; the normal UI subsequently revalidated the supported 5.43 / 2.13.0 runtime and canonical preparation.

Closed and reopened the actual packaged Workbench, opened the unedited included `selected-spell-workshop.c5m`, selected **Harbor Ember Test**, then used **Prepared tests…**, searched `2c6170ff`, selected the retained snapshot and clicked **Check before resuming**. It displayed **Ready** with the exact full identity and forced-cast experiment mode. Left that dialog open for the user at **Start saved test**. No Start, settings change, Apply, export or new preparation was performed. All **1,072 retained test files remained unchanged** through handoff. The original full source stays open for the later result/export check.

Prepared test: **Harbor Ember Test → Harbor Ember**, mod `WB_Test_mw9lcpbe`, native Spearman #13 as the field commander and one Spearman #13 target. Fixed baseline: **fire type 4, area 0, impact 68, flight 2/65**, weapon base damage 0 and spell attack payload 8. This is the existing CoE5SE-dependent, forced item-style field, not ordinary AI spellcasting or Vanilla-only testing. This acceptance keeps settings unchanged to isolate the resumed launch/save/exit path; damage or appearance is not predicted from the numeric values.

User-operated steps:

1. Keep Workbench open. In the checked `2c6170ff` preparation, click **Start saved test**. Launch checks run again; report any refusal instead of bypassing it.
2. In the isolated game's main menu, click **WB test: WB_Test_mw9lcpbe**. If that button is missing or an error appears, stop and report it; do not switch profiles or enable unrelated mods.
3. Leave Type, Area and Effects unchanged. Click **Cast once exactly once**. Observe the event log and any projectile/impact or unexpected status. If the effect is too brief to see, report that; do not repeat the cast for footage.
4. Click **Save test values** and note the saved-snapshots confirmation. Then click **Close test**.
5. Back at the main menu, choose **Quit** normally. Leave Workbench running so it can observe the process exit.
6. Return to Workbench, click **Refresh**, select `2c6170ff` again and open **Review saved values**. Do not apply or export yet. Report field opening, the cast's observed/logged result, save confirmation, normal Quit and any errors.

After the user's report, inspect this session's new launch identity, process status/exit evidence, logs, result context/readbacks and completed cast-call count. Separate the user's visual/status report from helper facts and combat-log evidence. Because this is an unchanged-baseline acceptance, review should retain the source values; any later separate full-source export should match the untouched original. Verify that explicitly rather than manufacturing a draft edit. Keep completed/stale sessions and unrelated pending edits protected. If no result or launch is observed, leave the acceptance pending or report the concrete failure; no success is inferred from readiness alone.

Local preparation evidence is in `resumed-manual-20261109T185913/` (private preflight, preservation baseline, handoff receipt and desktop captures). The ZIP remains byte-identical with the SHA-256 above. GitHub still lists only the 0.16.0 downloadable release; 0.16.1 remains local-only. No implementation changed, and no additional diagnostic status tests were added.

## Completed resumed game test · agent-operated, 9 November 2026

**PASS for this unchanged-baseline workflow on the exact 0.16.1 ZIP.** No new preparation, replacement runtime or alternate launcher was used. The user explicitly authorized desktop/game control after the manual handoff. These are agent-observed results, not an assumed user report.

### Launch and ownership

- Rechecked the archive hash, package inventory and unused session before Start. No CoE5 process was running. The user had closed Workbench; reopened the exact packaged EXE from its verified extraction, initially with no source open. Used the normal **Prepared tests…** interface, selected `2c6170fff992451fab214656852e76b4`, checked it and clicked **Start saved test once**. This exercised the resumed route without the former transient editor/options binding.
- The single launch created owned PID **15828**, result run **`c445e3c5d56447a997694e148b73dcc4`**, and a new process-local disposable-profile context. No other game process was controlled or closed. No bootstrap was required.
- Actually observed the game main menu and CoE5SE banner. The native log reports **CoE5 5.43**, API 10 and exactly two loaded mods, **CoE5SE, WB_Test_mw9lcpbe**. The pinned staged/base hashes establish the CoE5SE 2.13.0 identity; no version is inferred from a filename.

### Field, cast and visuals

- Clicked **WB test: WB_Test_mw9lcpbe**. The field opened with a Spearman commander and one Spearman defender (both native type #13). Native logging resolves **Harbor Ember Test as spell #1029 in this run**. Spawned caster instance #1 and defender #2 are distinct from native type #13.
- Left **fire type 4, area 0, impact 68, flight 2/65** unchanged. Did not use Apply, Reset targets or another cast. The log contains **one named Harbor Ember Test cast** and **one Harbor Ember weapon hit** against defender instance #2. The native attack line reports `dmg8, dt4`; the combat log and full-resolution frame report **3 damage**, after a logged shield-parry reduction of 1. No damage formula is inferred from this one roll.
- Recording was verified before the cast: a 4.133-second main-menu capture contained **124 frames** at 1100 × 800. Initial capture attempts from the restricted process context could not find the window; capturing the same owned title with desktop access resolved that. No cast was made during those checks.
- The real single-cast recording contains **1,826 frames over 30.434 seconds**, at 1100 × 800. Inspected contact sheets and full-resolution frames show a bright particle trail crossing the field and a flame-like impact at the defender. `flight-frame.png` (15.17 s) and `impact-frame.png` (15.67 s) are actual recorded game frames; `single-cast-clip.mp4` trims 13.8–17.6 s of that recording. No mock-up, forced second cast or substitute weapon was used for footage.
- The field dock remained clickable beside the readable lower-left event log. The window capture was 882 × 671 while the recorded client was 1100 × 800 and the game reported UI coordinates of 825 × 600. These are distinct coordinate measurements; other sizes/DPI settings were not tested.

### Save, closure and result review

- Clicked **Save test values** once and observed **Saved 1 read-back snapshots**. The fresh `wb-results-2` packet matches the session, source revision and result run. It contains one baseline sample with **`casts=1`, `readback=1`, parameter revision 0** and the five unchanged values above. A helper readback/call count is kept distinct from the combat log and captured visuals.
- Clicked **Close test**, observed return to the main menu and confirmed the native **`test_field_closed`** event. Clicked the **Quit** text in that main menu; the game process exited normally. Workbench Refresh recorded **`status=exited`, `ExitCode=0`, no error**. No process termination command or close-window shortcut was used for the game.
- After Refresh the preparation was **Already used**, Start was disabled, and **Review saved values** was available. Opened the original included full source through the native dialog, selected Harbor Ember Test, and reviewed this exact session. The interface showed **No settings changed from the saved baseline**, **5 unchanged settings kept**, and **1 completed cast call**. Apply was disabled because there was nothing to change. The personal-observation checkbox was left unchecked; the agent's recorded visual evidence is documented separately.
- Exported **`resumed-baseline-export.c5m`** through the native Save dialog to a new path. It is **748 bytes**, byte-identical to both the original included full source and the project example. SHA-256 for original/export: `0773f56cacebb6c6d01a365eedc2a7b241dafc839ea654e9c4aba85f314c8e3c`. Comments, formatting, unrelated definitions and original files were preserved. Closed the agent-opened Workbench normally afterward.

### Preservation, small wording correction and limits

Of the **1,072 pre-existing retained test files**, **1,071 were unchanged**; only this selected session's metadata changed from prepared to exited. Nine new files (launch/config backup, isolated loader state, logs and result/context) were confined to this same disposable session. No file disappeared, no unrelated retained file changed and **all staged input hashes still match**. The original installed executable hash and the exact tested ZIP hash remain unchanged. No normal profile, campaign save, installed mod or game installation was selected for writes.

The desktop review exposed one misleading sentence: **This draft has changed since preparation** appeared even for the untouched full mod, because `sourceChanged` compares full-source bytes with the smaller canonical test snapshot. That difference does not establish a modification to the original disk file. Corrected **wording only** in source to say **Current source differs from the saved test snapshot**; retained all comparison, matching, conflict and export logic. C34 records the finding. A new focused regression covers unchanged full-source baseline review, disabled Apply, cast/readback versus visual evidence and exact export; **all 285 JavaScript checks pass**. This wording correction is **source-only and not included in the immutable tested ZIP**; its new wording was checked offline, not in a rebuilt desktop. No gameplay/runtime fix was required, and the 67 compiled checks remain earlier evidence.

The combat log does not contain a Feebleminded event in this run. The target's hidden-affliction panel was not examined, and the original unexplained event remains unexplained. No additional diagnostic casts were made. Field close, main-menu return and normal process exit were observed; this does not establish every internal allocation/cleanup path, repeated-run behavior or save compatibility. The baseline run did not retest changed-value return or conflict resolution; those retain their separate earlier evidence. It is a forced item-style field, not ordinary AI combat, range, timing or universal VFX validation.

Local evidence: `resumed-manual-20261109T185913/agent-game-20261109T203600/`, including `RESULT.json`, `run-verification.json`, launch/exit receipts, copied logs/result packet, `01-ready-before-start.png` through `10-full-source-exported.png`, the recording/clip/frames and `export-comparison.json`. Raw files, session/profile contents, paths and captures remain local and are excluded from GitHub. Only intended source/tests and curated documentation are published. The ZIP remains **`ac07b8c11a9f26553aa99fd12647a074529f0d50d0b6245c1aa720ebacb4a8a8`**, and **0.16.1 remains local-only**; GitHub Releases still offers 0.16.0. No release was created or replaced.

## Remaining checks and limits

The formerly pending exact-archive desktop check is complete. A new Windows account should show an empty session list and require its own compatible runtime selection; a separate clean Windows machine/account was not tested here. The verified package remains framework-dependent and local-only until a separate release-publication action.

The actual post-restart game launch/save/close/Quit/review/baseline-export route has now passed for this one preparation. Other resumed test modes and fresh-machine/account setup remain untested. No claim is added about ordinary combat, AI selection, targeting, resistance formulas, status causes, save compatibility or broad VFX accuracy. Any repeat game test must use a fresh normal preparation; this completed session remains evidence and must not be replayed.
