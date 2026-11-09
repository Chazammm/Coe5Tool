# Harbor Ember selected-spell game acceptance

**The single-cast → saved result → desktop return → full-source export workflow passed on CoE5 5.43 / official CoE5SE 2.13.0. VFX capture is inconclusive, and an additional Feebleminded status remains unexplained.** The agent operated this run at the user's request. This is a forced item-style cast of the extracted spell/weapon pair, not ordinary AI casting or validation of the complete mod.

## Preparation and isolation

Reused the exact prepared session `27a526744dad40d2b85c0397aa0d6582`, mod `WB_Test_mw9h6769`, revision `621a22a8cafdaad1487c66417f7b96d33125cdf6cb9f93b65eedba160a5e13f9`. Its candidate, generated spell and helper were not recreated or edited. Before launch it was prepared, non-stale and had no PID. All **19 staged input hashes** matched. No CoE5 process was running.

Workbench had been closed since preparation. The previously documented validation-only launcher resumed this exact session through the current production `IsolatedTests.RuntimeStatus`, `Status` and `Start` checks: host fingerprint, compatible local runtime, exact session/revision, ownership, active processes, canonical candidate/helper, profile paths and independent staged-runtime hashes. No launch gate was bypassed and no new package/profile was substituted. This launcher does not implement the still-missing product resume action in C30.

The copied game fingerprint was `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55`; the official 2.13.0 plugin fingerprint was `26861bb0b6dffaa7150ed239e9eba4e934a955688d101c81161cf395190dd254`. The production verifier also rechecked the original local game/extender sources. Only the disposable profile and runtime were used; normal profiles, campaigns and the Steam installation were not changed. No roster overlay was needed.

Owned game PID: **5792**. The game window's captured surface was **882 × 672 logical pixels** at current desktop scaling; launch requested a 1100 × 800 client. This is one observed size, not a DPI compatibility claim.

## Actual game observations

| Step | Observed evidence | Limit |
| --- | --- | --- |
| Extender/test load | Main menu showed CoE5SE and `WB test: WB_Test_mw9h6769`; loader header named both mods and game 5.43. [Main menu](01-main-menu.png). | No other mod content was loaded. |
| Field opened | Extender logged `monster=13 spell=1029 enemy=13 count=1`. The field displayed caster Spearman unit #1 at setup position (12,10) and target Spearman #2 at (18,10). [Before cast](02-field-baseline.png). | These coordinates come from this debug log, not a stable attack-observation API. |
| Settings selected/applied | Loaded impact chooser named **#3 White Flare**. Changed impact **68 → 3**, returned to the field and clicked **Apply**. Fire type #4, area 0 and particle flight 2/#65 stayed fixed. [Chooser](03-loaded-impact-choices.png), [pending](04-pending-impact.png), [applied](05-applied-before-cast.png). | Table names/IDs and readback do not prove appearance. |
| Exactly one cast | The agent clicked **Cast once** once, with no retry. The game log contains exactly one `Spearman casts Harbor Ember Test`, followed by an attack with **Harbor Ember** against unit #2, `dmg8, dt4`, and **2 damage**. [Post-cast log on screen](06-after-single-cast.png), [combat excerpt](combat-excerpt.txt). | The field forces the spell attack and extends some weapon ranges. This does not establish natural casting, normal range, AI or a damage formula. |
| Extra status | The same attack sequence also logged **Spearman got feebleminded**; the extender logged a spell-list rebuild for unit #2 becoming Feebleminded. | This was unexpected. This single run does not establish whether the cause is the impact entry, another engine/record property or the fixture. No code was changed to hide it. A controlled separate reproduction is needed before calling this a purely visual change. |
| Saved result | **Save test values** confirmed two snapshots: baseline with zero casts, and applied revision 1 with **one completed cast call**, impact 3, type 4, area 0 and flight 2/65. Readback was confirmed. [Saved](07-values-saved.png). | Two snapshots mean baseline plus applied values, not two casts. A completed call is not itself proof of a visible effect or hit; the named hit here is separate log evidence. |
| Close and Quit | **Close test** returned to the main menu; extender recorded `test_field_closed`. The agent clicked **Quit**. [Returned menu](08-returned-main-menu.png). The owned process exited normally with **exit code 0**, status exited, error null. Game log ended with sound/OpenGL shutdown. | No PID termination was used. Complete engine-allocation cleanup and restoration of every private field were not independently read back after closure. |

The bottom-center controls left the lower-left event log visible at this size. The type/area/flight/impact status text was compact; no new layout change was needed.

## Recording limitation

A 60-fps window recording was started before the cast, but ffmpeg's `gfxcapture` failed with **Failed to find capture source** for `window_exe=CoE5.exe`. No video frames or usable clip were produced. The post-cast screenshot records the units and visible damage/status log, but does not reliably establish the brief projectile or identify the full White Flare impact sequence. **Projectile capture and exact VFX appearance remain inconclusive.** The agent did not cast again to manufacture footage. Local `single-cast.ffmpeg.log` retains the capture error.

## Actual desktop result return and export

After the game exited, opened the original complete `Harbor-Spell-Workshop.c5m` through Workbench's native Open dialog and selected **Harbor Ember Test**. Its saved-result banner found this real session. Review displayed **Harbor Ember Test · weapon Harbor Ember**, applied revision 1, **1 completed cast call**, impact **68 → 3**, four unchanged settings, the visual-observation disclaimer and the other local spell sharing this weapon. The personal-observation checkbox remained unchecked; the observations here are the agent's evidence, not a user report. [Actual review](09-real-result-review.png).

**Apply selected to draft** applied only impact. Native **Export copy** wrote the new complete local file `Harbor-Spell-Workshop.game-confirmed.c5m`. [Completed export](10-full-source-exported.png).

Byte comparison verified:

- Original complete source remains **782 bytes**, SHA-256 `e63e12b87c59516ef202e22d72b2bafc79ca83d0005b9082f57a0a84c165e093`.
- New export is **781 bytes**, SHA-256 `eebd55e2450b23b7e292509b4c47cfb386c21d1956f423ee4c2be5f60a890470`.
- It equals the original with **only `look 68` changed to `look 3`** in Harbor Ember. Hook, Echo, Guard, both spell definitions, comments, BOM and mixed line endings are preserved. Echo still shares the changed weapon; it was not tested.
- All **19 staged inputs** still match, and all **100 files** across the three retained reference sessions match their earlier hashes. Only this disposable session acquired its expected launch/result/config/log data.

**45/45 focused selected-spell, creation and post-test-return regressions passed** after gameplay. The earlier 278 script / 37 compiled checks and desktop build remain separate evidence for unchanged application source. No production code changed during this acceptance. Raw runtime/session/result files, source copies, launcher and capture diagnostics remain local; only this report, curated screenshots and the combat excerpt are published.

## Remaining limits and next step

This verifies one explicit local `.c5m` spell/weapon pair through the CoE5SE field and protected full-source return. It does not establish fresh `.c5se` gameplay, normal spellcasting, path eligibility, AI, true range/timing, ordinary combat/area rules, saves, the other shared spell or full-mod compatibility. Other formats/ambiguities/dependencies retain their documented blockers.

The most useful next investigation is the additional Feebleminded status, using a separate controlled comparison and a capture source verified before casting. Until then, keep this workflow pass distinct from a claim that the selected impact is harmless decoration or that its complete visual appearance was captured.
