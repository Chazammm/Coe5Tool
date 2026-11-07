# Actual Windows desktop validation · v0.12 post-test return

**Result: passed, with three small UI fixes verified.** Date: 6 November 2026, Europe/Berlin. This was an actual Windows WPF/WebView2 desktop test using computer interaction and native file dialogs. No game was launched and no new gameplay or effect-appearance result is claimed.

## Setup and boundaries

The retained Codex VFX Trial session `3bc3ad7e1ef148fdb922af627be9760f` was inspected read-only, including its candidate source, session record and structured result. The source revision is `89da88dad4211b2568a5d66673ca2d897c60673025017554e88e677ca9eaf350`; the result run is `67690ee358484641a9f70375cf85ed44`. The session was already exited, code 0, and marked stale before this task. It contains baseline impact 7, then applied impact 3 with one completed cast call; damage type 4, area 0 and flight 2/7 remain unchanged. The earlier gameplay/user appearance evidence was not repeated.

Read the v0.12 acceptance checklist and implementation/report before testing. Created five uniquely named source copies in this new folder, never inside the retained session. The normal executable at `build/desktop/CoE5Workbench.exe` reported version 0.12.0. No Workbench or CoE5 process was running at initial inspection. The two Workbench processes started for this validation were PIDs 35032 and 33932; both were closed through their own UI. No other app/process was closed. The final process check found neither CoE5 nor Workbench running.

The rendered window captures are **1427 × 954 pixels** at the existing Windows display settings. Source files and exports use the native Open/Save dialogs; source changes were made through the app's own controls. No hidden browser evaluation, injected DOM operations or game control was used. Accessibility focus metadata sometimes lagged the visible controls; visible focus rings/carets and screenshots confirmed the actual input state.

## Observed desktop results

| Check | Actual observation | Evidence |
|---|---|---|
| Discover matching result | Opening the original copy displayed a compact saved-values strip naming Codex VFX Trial. Its Review action opened the result directly. The corrected build also redisplayed the strip after switching source copies. | `02-matching-result-found.png`, `18-fixed-build-discovery.png`, `22-discovery-after-source-switch.png` |
| Correct session/configuration | Review showed **Impact effect: 7 → 3**, only that value selected, and four unchanged settings collapsed. History selected session **3bc3ad7e**, applied revision 1, type 4, area 0, impact 3, flight 2/7. Full session/source identity remained available under optional details. | `03-result-review.png`, `04-session-history.png` |
| Evidence separation | The review said helper readback was saved and recorded one completed cast call; it explicitly said the file does not establish visual appearance. The personal-observation checkbox stayed unchecked. Baseline history separately showed no completed cast call and selected no replacement by default. | `03-result-review.png`, `28-baseline-no-cast.png` |
| Direct Apply and export | Apply closed the review and updated the held draft without a staging step. Native Export saved `01-original.edited.c5se` to this folder. Only `look 7` changed to `look 3`; the new file equals the prior returned export byte for byte. | `05-direct-apply.png`, `06-native-export-dialog.png`, `07-native-export-complete.png`, `verification.json` |
| Conflict kept | In `02-conflict.c5se`, entered pending impact 9 and unrelated pending weapon damage 11. Review showed **Draft 7 · field edit 9 → saved 3**, an unchecked **Replace newer Impact effect**, and disabled Apply. Closing retained both edits. | `08-newer-and-unrelated-pending.png`, `09-conflict-kept-by-default.png`, `10-conflict-close-retains-edits.png` |
| Explicit replacement | Selected Replace and applied. Impact became 3; damage 11 stayed pending, with export blocked. After explicitly restoring that disposable pending damage field to its original 0, exported `02-conflict.edited.c5se`; only impact differs from its input. | `11-explicit-replace-keeps-other-edit.png`, `verification.json` |
| Safe missing commands | `03-missing-safe.c5se` omits look/flight commands but retains a plain numeric new weapon and an extra comment. The editor identified the three fields as optional additions. Corrected review showed explicit unchecked **Add…** choices, exact commands/values and a warning that these lines were removed since preparation. Selecting one flight field selected both partners. Applied/exported only look 3, flymode 2 and flylook 7. The comment and every other source byte remain unchanged. | `13-safe-missing-source.png`, `19-fixed-additions-and-disabled-apply.png`, `20-paired-additions-selected.png`, `03-missing-safe.edited.c5se` |
| Unsafe missing commands | `04-missing-unsafe.c5se` contains an active `arrow` flag. All three missing visual inputs were read-only, and all three return additions were disabled with the manual-edit explanation. No unsafe export was created. | `15-unsafe-source-fields-disabled.png`, `16-unsafe-insertion-refused.png`, `17-all-unsafe-visual-additions-disabled.png` |
| Pending edit in another definition | Selected the spell in `05-spell-pending.c5se`, entered pending spell weapon damage 99, then applied the tested weapon's impact. The spell remained selected, 99 remained pending, and export stayed blocked. After restoring the disposable pending field to 8, the exported file differed only at the weapon's impact. | `23-pending-spell-edit.png`, `25-spell-edit-retained-and-export-blocked.png`, `05-spell-pending.edited.c5se` |
| Already applied | Reopening the same result showed **Impact effect · already in draft**, unchecked, with Apply disabled. It did not silently reapply or export anything. | `27-already-in-draft.png` |
| Keyboard and scrolling | Tab moved visibly between form fields and into the result checkbox. After direct Apply with pending edits, the next Tab reached Discard, consistent with focus returning to Apply. Keyboard Home/Return and Down selected baseline/applied snapshots. Expanded details scrolled inside the modal without moving the source behind it. Escape closed the review and visibly returned focus to Return test values. | `12-keyboard-focus.png`, `24-review-keyboard-focus.png`, `25-spell-edit-retained-and-export-blocked.png`, `28-baseline-no-cast.png`, `30-expanded-history-scroll.png`, `31-review-closed-cleanly.png` |

The safe missing-line case intentionally differs from the canonical generated-pair test subset. The editor correctly described it as a source fragment for manual integration. This desktop result establishes safe text editing/export, not that the edited fragment is an installable or newly tested game mod.

## Issues found and corrected

1. **Missing lines were labeled “Replace newer…”** because removing a prepared field correctly counts as a conflict. The visible action now says **Add…** and explains that selecting it restores a removed line with the saved value. The conflict remains real, unchecked and subject to explicit selection; no protection was relaxed. The real safe copy was then added/exported through the corrected UI.
2. **Disabled Apply looked enabled.** The dialog's primary-button CSS overrode the generic disabled colors. A scoped disabled style now visibly distinguishes the unavailable action. The before/after screenshots show this; selecting an available value restores the primary appearance.
3. **Saved-result discovery could disappear after a file switch.** Desktop observation exposed the symptom. Focused offline reproduction demonstrated that a late rejected discovery could erase a newer success, and temporary native-dialog contention discarded usable matching metadata. The catch now respects request/draft identity and retains only previously listed matching metadata during a temporary failure. Full result review still revalidates the actual saved files. The corrected desktop build showed the strip after a source switch.

Three regression tests failed before these fixes and passed afterward. Only `return-values-ui.js`, scoped CSS, focused tests and documentation/build guidance changed. The source patcher, return conflict model, native code, game helper, test API, retained session and game/runtime files did not change.

## Rendered usability assessment

The default review is compact and has a useful hierarchy: spell name, baseline-to-saved change, selected value, evidence statement and one primary Apply action. It needs no scrolling at the tested window size. Technical hashes/session history stay behind optional details. Conflict text names both the pending and saved values and makes keeping the edit the default. The corrected Add labels explain missing fields without requiring knowledge of the command syntax. No tutorial, dashboard or decorative cards were added.

Expanded unchanged/history sections become long but remain readable and scroll correctly. Close is at the top; after scrolling far down, the user can scroll back or use Escape, which was verified. Secondary evidence/help text is small compared with the primary comparison and should be assessed by the friend at their usual display scaling. These are agent judgments, not observations of a first-time human user.

A smaller viewport was **not established reliably** through the attempted resize interactions. Those attempts did not produce a smaller captured window, so no responsive-size/DPI pass is claimed. An initial Open attempt used forward slashes and was rejected by the Windows dialog; using a native backslash path succeeded. A popup-coordinate targeting limitation was avoided by keyboard snapshot selection, which then passed. These automation issues were not treated as Workbench defects.

## Offline verification and preservation

**173/173 JavaScript tests pass.** The new cases cover stale discovery failures, temporary dialog contention with correctly associated cached metadata, and explicit safe Add labels for removed lines. `before-fix-tests.txt` records the three failures; `after-fix-tests.txt` records the final pass. No additional native headless runs were needed: regular exe/DLL and the five previously headless-tested friend binary/config/runtime fingerprints remain identical. The prior 44-check native results therefore remain applicable, rather than being described as new runs.

`verification.json` passes all **8 groups**:

- Three native exports from the original/conflict/other-definition cases are each exactly 264 UTF-8 bytes and match the earlier returned file, SHA-256 `6f28e6a4460edbfb292048444fe596233302d0e807d0ad8f297f136ffde25775`.
- The fourth native export contains exactly the three explicitly chosen inserted lines and retains all other text.
- All five disposable input files remain byte-identical; no unsafe export exists.
- All **37** recorded files in the retained real session and prior return-check folder retain their hashes. Their complete file inventory is unchanged as well.
- All **331** protected Steam/game/mod/research fingerprints remain unchanged.
- The 173-test report passes.

`package-verification.json` passes all **5 groups**. Both rebuilt ZIPs contain current UI/docs, exclude private data/game files/debug symbols, preserve native/helper fingerprints, and correspond to the recorded desktop evidence. The helper/dock templates remain unchanged and synchronized. The friend package includes the cached .NET runtime and its original notices; WebView2 remains required separately.

| Package | Bytes | SHA-256 |
|---|---:|---|
| `dist/CoE5Workbench-win-x64.zip` | 889,568 | `8960ac0851288a47a7edeae8b2f56b934a51252ef759da46cf3154907ee12b38` |
| `dist/CoE5Workbench-0.12.0-friend-win-x64.zip` | 72,939,079 | `28cd00d95e4a610c43b7d48fe97dea9f2ce49ee1015ec9f1c05967a188095fb5` |

All **31 screenshots** and their accessibility/timestamp sidecars are local to this validation folder and excluded from the distributions. Nothing was published, pushed or sent.

## Remaining uncertainty and next step

Other window sizes/DPI settings, the friend's computer and an independent first-time user remain unverified. Missing/corrupt result handling and other source formats retain offline coverage but were not exercised by modifying this real retained session. This task proves no new game behavior, effect appearance, normal combat, AI, true range, timing, audio or save compatibility.

**The single most valuable next step is for the friend to complete the return flow unaided on their own display, using their own saved isolated result, and report the first unclear step.** The desktop flow now has functional evidence; independent usability feedback will be more informative than adding another editor feature immediately.
