# Harbor Needle: real game comparison and full-source return

**Passed for this bounded weapon/test/export workflow.** The prepared private ranged weapon was used by native AI, its bolt flight and two distinct impact appearances were recorded, three battle results were saved, Finish returned to the main menu and the visible Quit action closed the isolated game. Battle 2's impact returned to the complete representative source and a separate export changed only `look 34` → `look 68`. **The numeric game exit code was not retained** because the local validation launcher failed after process exit; this is a specific telemetry limitation, not evidence of a game crash or a Workbench defect.

This continues the [desktop implementation report](../REPORT.md). No application, helper-template, extender or installed game implementation was changed for this test. No forced attack was used.

## Preflight and isolation

Re-read AGENTS.md, the consistency checklist, the prepared source/package and earlier report, and applied the computer-use/game-automation instructions. The user explicitly authorized the agent to perform the game test; their desktop permission remained in effect. No existing game session was present. Workbench had been closed since preparation, so it was reopened at the current `build/desktop-016-workspace` output and the full `Harbor-Workshop.edited.c5m` was opened read-only for later return.

The exact existing package/profile was reused: session `431503a2c00946189ffe5312beb742f9`, revision `d0dc0b65214b5e785dd11412680d9dc53d7d3beafd240e7116c40202c73c281b`, mod **WB_Ranged_mw89jz3l**. No new package or profile was generated. All **19 staged fingerprints** verified before launch and after exit. Compatibility was accepted by the current production runtime checker:

- CoE5 5.43 executable SHA-256: `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55`.
- Official CoE5SE 2.13.0 plugin: `26861bb0b6dffaa7150ed239e9eba4e934a955688d101c81161cf395190dd254`; loader: `d34232bd0ce6c8839beec7331b237878bfb93725b5e8d8c89ec80ee6017dcd8d`.
- Running loader log: game version 5.43, build `6aec6a32-13728000`, API 10; enabled mods exactly CoE5SE and WB_Ranged_mw89jz3l. This single-type fixture does not require the local mixed-roster overlay.

Because the desktop's transient preparation binding does not survive restarting Workbench, a small **local validation-only launcher** invoked the built production `IsolatedTests.Start(id, revision)` on the unchanged current session. It used the real compatibility, profile, canonical-candidate, mod-list, hash and active-game gates, without test overrides or pointer changes. It did not reconstruct the game launch outside those checks. Its first restricted attempt could not write the disposable session metadata and started no game; its error is retained locally. Retrying with the required profile access started the sole owned game **PID 33652**, run `4a236c1a67cc45578feef9fb639245cb`.

The Steam installation and game data were not replaced or patched. The production launcher used runtime copies and the app-owned disposable profile. The separate full mod remained in the editor; its Hook, Charm and Guard were absent from the generated test package.

## What the game actually did

The test used **Harbor Needle #1200**, **WB Ranged Carrier #2000**, regular ranged attack row 0 with payload **8**, weapon base damage 0, initiative 6, pierce #3, range 5, area 0, sprite mode 1 and Ballista bolt #7. The selected target was **Spearman #13 × 1**. Only the private impact setting changed during comparison.

| Saved battle | Applied revision / impact | Actual carrier and target instances | Combat-log evidence | Visual evidence |
| --- | --- | --- | --- | --- |
| 1 | r0 / Blood Burst #34 | carrier 1 → Spearman 2 | Two named Harbor Needle attacks, dt3, 3 damage each; target died on the second hit | Initial continuous capture failed; this battle alone does not establish its appearance |
| 2 | r1 / Flame #68 | carrier 4 → Spearman 5 | Two named Harbor Needle attacks, dt3, 3 damage each; target died on the second hit | Bolt flight and yellow/orange impact visibly captured |
| 3 | r2 / Blood Burst #34 | carrier 7 → Spearman 8 | Two named Harbor Needle attacks, dt3, 3 damage each; target died on the second hit | Baseline repeated only to recover the failed capture; bolt flight and red impact visibly captured |

Each result recorded its own target instance, one returned battle call, three read-back visual values and revision. The current source draft stayed unchanged until the desktop Apply step. Physical results carry no elemental resistance reading. Identical damage rolls do not establish a damage/resistance formula. Three battles are reported explicitly; this was not an exactly-once attack test, and the native AI attacked twice in each battle.

The native debug log identifies attacks against the first target position `(17,10)` at absolute distance 4 and later `(16,10)` at distance 2. These are **manually inspected debug evidence for this build**, not a stable public API, persisted attack-position feature or new automatic hit-attribution view. Saved readbacks alone do not prove an attack, visual appearance or hit. [Curated combat excerpt](combat-excerpt.txt).

## Captured appearance and controls

The game window was **882 × 671 logical pixels**; continuous captures contain the **1100 × 800 client area at 60 fps**, without desktop or audio. The agent inspected the extracted frames directly. The same thin bolt travels from the carrier to the target; Flame shows a bright yellow/orange burst, while Blood Burst shows a red burst. Damage text is separate from that appearance evidence.

- [Loaded main menu](01-main-menu.png) and [starting comparison](02-baseline-config.png).
- [Pending Flame, still Blood Burst applied](04-pending-flame.png); [Flame applied and read back](05-applied-flame.png).
- [Bolt in flight](11-bolt-flight.png), [Flame impact](12-flame-impact.png), [Blood Burst impact](13-blood-impact.png).
- [Flame battle clip](flame-battle-clip.mp4), nine seconds from 15 seconds into the raw recording; [Blood Burst retry clip](blood-battle-clip.mp4), ten seconds from 13.4 seconds into its raw recording. These are short excerpts, not recordings of every menu/cleanup step.

The comparison menus kept pending/applied values readable. Native battle controls stayed at the top right and the lower-left event log remained visible. This route uses native AI battles, not the generated-pair **Cast once** overlay. No different DPI or window size was exercised.

The first restricted Windows Graphics Capture attempt failed with `0x80070424`; no baseline video was created. A permitted window-only capture then worked. One intermediate recording contains only effect-selection menus. The two action recordings above contain real battles. SDL ignored literal-text injection in its search box, so the agent used game key presses for IDs 68/34 and the visible OK control. These were automation/capture constraints, not reported product defects.

## Closure and exit: observed facts and gap

The extender logged **test_field_closed** after each of the three battles, and all three result rows were saved. [Three saved battles](07-three-battles-saved.png). Clicking **Finish** returned to the [main menu with the visible Quit label](08-finished-main-menu.png), without an error dialog. The existing helper's Finish path restores/checks the private weapon before returning. This result schema has no durable separate restoration receipt; no extra claim about all native allocations follows from a menu return.

The agent clicked the actual **Quit** label. The owned game window disappeared, the process was gone, and its debug log ended with `Shutting down SDL sound` and `opengl_deinit`. No process was terminated by PID or task-kill.

The validation launcher then failed while asking a separately attached `Process` object for `ExitCode`: `Process was not started by this object, so requested information cannot be determined.` Its error is retained. It failed before saving the production status. The existing production status checker was subsequently called, recognized that the owned process was gone and stored **status=exited, error=null, exitCode=null**. The numeric exit code cannot be reconstructed from this run, and **exit code 0 is not claimed**. The local launcher was corrected for future use without repeating gameplay; the app implementation was not changed to manufacture a pass. Normal Quit behavior was directly observed, while the independent exit-code journal remains incomplete.

## Actual desktop review and protected full-source export

After exit, selecting Harbor Needle inside the open full mod exposed the matching saved-result banner. Review showed all three battles. Battle 3 correctly showed no change from the source baseline; switching by keyboard to **Battle 2 / Flame #68** showed **Impact effect 34 → 68**, the correct target instance #5, mode 1/bolt #7 kept, and the explanation that readbacks do not establish appearance or complete-mod behavior. [Actual review](09-game-result-review.png). The personal user-observation checkbox stayed unchecked; the observations in this report are the agent's captured evidence, not a user report.

**Apply selected to draft → Export copy** wrote a new `Harbor-Workshop.game-confirmed.c5m` inside this local validation folder. An initially entered forward-slash filename was rejected by the native Windows dialog; using its Windows-style relative path completed export. The draft remained intact during that rejected attempt. [Completed export](10-game-exported.png).

Byte comparison verified:

- Original Harbor source still matches SHA-256 `249e36051d751ce2c125ae76aa9282161bac8626caf81d712bb284359ca25061`.
- The 654-byte prepared full source remains `d4de43ad6f4eee2d3f5bf1f77b2e662ecb659a5d2b8b06fb9014fb3f22e8b9e4`.
- The 654-byte new export hashes to `7689d72d34f71016d0a6bfa20cfe9bfad1d0b3e98b9fd53f6df185aceef9a3cb` and equals the prepared full source with **only `look 34` changed to `look 68`**. Initiative 6, the other weapon/spell/monster text, comments, BOM and mixed line endings are preserved.
- All **33 files** in the older Mixed Area Needle reference session stayed unchanged; all **19 staged input fingerprints** in this test still match. Raw logs, session/candidate/INI data, failure journals, launcher and runtime paths stay local. No profile, save, personal mod or runtime binary is published.

The prior **265 script / 35 compiled** checks and desktop build remain valid for unchanged application source. **31/31 focused selected-weapon, ranged-comparison and post-test-return regressions passed** after gameplay; their local output is `relevant-tests.txt`. No app defect was found that justified a production implementation change.

## Remaining limits

This verifies one plain native ranged weapon, one carrier/target type and two visual configurations under CoE5 5.43 / CoE5SE 2.13.0. It does not test the linked custom spell, the full mod, mixed groups, area damage (code stayed 0), inherited/flagged or special weapons, other visuals, Vanilla-only play, ordinary campaign AI/range/timing or saves. Stored result receipts still cannot attribute hits or provide attack-time positions automatically. Complete cleanup of every engine allocation and the numeric exit code were not independently established.

The most useful next product improvement is resumable preparation: reopening Workbench currently loses its UI binding/options, even when a valid disposable preparation exists. This continuation reused the exact production-validated session through a local launcher; a future supported resume action should revalidate the same inputs and preserve the owned process handle/status lifecycle. It must not bypass stale-state, active-game or hash checks.
