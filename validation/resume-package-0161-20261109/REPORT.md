# Prepared-session resume and Windows candidate · 0.16.1

Date: 9 November 2026. Source baseline: `7930ad9e9bc3f457831961f27e0567abea458ebc` in `Chazammm/Coe5Tool`.

## Outcome

Implemented **Prepared tests…**: searchable retained preparations, source provenance, test mode, readiness/refusal reasons, explicit recheck/start, file inspection and existing saved-result review. It launches a saved bounded snapshot without replacing the open draft. Completed tests remain evidence and cannot replay through this new path. The one exception is a verified, settings-only bootstrap continuation after an observed normal exit.

**284 JavaScript checks and 67 compiled checks passed.** A clean ZIP extraction was operated in the real Windows application: source opening, fresh preparation, app restart, discovery and production readiness validation, used/stale refusal, pending-edit protection, retained-result return and separate full-source export all worked. No game was launched during this task.

The final source includes a subsequent small text/refusal-path rebuild. Its archive audit and all 67 native checks passed directly from its clean extraction. The attempted final desktop relaunch was stopped by the user's physical Escape key; all desktop input stopped immediately. **That exact final archive still needs a brief desktop recheck before a final downloadable release.** No GitHub release was created or replaced.

## Investigation and launch protections

The session files survived an app restart; only the JavaScript source/options binding was transient. The former Start button intentionally required that binding, so valid preparations became inaccessible from a fresh workspace. C30 in the existing consistency checklist now records the fix.

The new path does not reconstruct transient forms or load arbitrary mod content. It lists owned 32-character session directories, then reads and validates the chosen preparation. Old records without a source filename explicitly say so. New records retain a sanitized display-only basename and preparation time. The saved canonical definition is inspectable; the complete mod remains in the editor. External original-file freshness is unknown because the original path/bytes are not persisted as launch authority; the UI explicitly launches a saved snapshot.

Inspection and launch share the existing canonical candidate/runtime/file validator. Each resumed Start re-reads the persisted session under the existing launch mutex, checks its revision, stale/used state, mode, target and roster identities, canonical helper and source, staged hashes, independent pinned game/extender hashes, mod-folder inventory, unexpected runtime binaries and active-game conflict gate. It also verifies the original local runtime files still exist and match. No stale record is silently repaired. Broken records can still open their owned folder for inspection. Review-only older helper contracts remain review-only; unchanged 0.16.0 and current 0.16.1 contracts remain accepted for launch.

Bootstrap continuation requires exclusively settings-only launch records, observed exit code 0, a valid disposable config and no result/observation. An uncertain previous launch is refused; prepare afresh. Existing same-window Start behavior and result history were preserved.

## Actual desktop observations

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

## Final local candidate package

File: `dist/CoE5Workbench-0.16.1-win-x64.zip` (1.60 MB approximately).

SHA-256: `ac07b8c11a9f26553aa99fd12647a074529f0d50d0b6245c1aa720ebacb4a8a8`.

The exact allowlist is derived from source project assets, known application/WebView binaries and license inputs, with a separately pinned optional open-source roster-v1 component. `PACKAGE-CONTENTS.json` records each shipped file hash. A clean extraction contains **77 files including the inventory**. Deliberate unrelated output probes in root, UI and licenses were excluded. No game executable, official release runtime/loader, assets, personal mods, saves, profiles, cached imports, runtime paths or private sessions are included. The roster DLL is the Workbench's open-source extender extension, not a game binary; the user still supplies the official compatible runtime and game data.

This is a **framework-dependent Windows x64 folder application**, not a single self-contained EXE. Extract everything and run `CoE5Workbench.exe`; .NET 8 Desktop Runtime x64 and WebView2 Evergreen are required. Source-only editing needs neither the game nor Node.js. In-game tests require the user's own verified local CoE5 5.43 and CoE5SE 2.13.0. Mixed tests additionally require roster-v1. See [setup](../../docs/WINDOWS-PACKAGE-0161.md) and [resume rules](../../docs/RESUMING-0161.md).

The final archive was freshly extracted to `shipping-candidate/`, checked against every manifest hash and exercised through the 67 native checks. Earlier clean-package GUI checks cover the functional UI described above. The exact final rebuild differs by recovery/navigation text, incomplete-folder inspection, allowlisted setup help and this documentation; its GUI relaunch remains unobserved after Escape. It is retained as a **local candidate**, with no final release publication.

## Remaining checks and limits

Before a final downloadable release: extract the final ZIP elsewhere, open the included example, open **Prepared tests…**, select the unused Harbor Ember preparation and **Check before resuming**, then close normally. Do not press Start merely for this package check. A new Windows account should show an empty session list and require its own compatible runtime selection; a separate clean Windows machine/account was not tested here.

An actual post-restart game launch was not required or performed. Native substitute tests verify the guarded launch route; existing gameplay remains historical evidence. No claim is added about ordinary combat, AI selection, targeting, resistance formulas, status causes, save compatibility or broad VFX accuracy. The user may later start the still-unused preparation explicitly, but this report does not claim that game test passed.
