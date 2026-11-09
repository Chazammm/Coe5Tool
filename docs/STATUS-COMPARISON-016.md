# Feebleminded investigation: four manual casts

**Completed by the agent at the user’s request.** A dealt 4 damage without visible affliction; B dealt 2 and produced a Chest Wound; C dealt 6 and killed its target; D dealt 0 with no visible affliction. Feebleminded was not logged in this batch. All four saved and exited normally with code 0. Actual flight and impacts are captured. The original cause remains unresolved; ordinary wound affliction is plausible. [Results and clips](../validation/status-investigation-20261109-4a72c1/observed-20261109/REPORT.md). **The existing A–D launchers are consumed; do not rerun them.**

The original preparation and protocol below are retained for reference. The Harbor Ember workflow passed, but the cause of its Feebleminded status remains unresolved. Earlier fixed piercing and cold battles also logged the status with Flame impact #68. That weakens an impact-3-only explanation; it does not identify the cause. Ordinary injuries from combat wounds are documented in [Illwinter's Battle Afflictions section](https://www.illwinter.com/coe5/coe5manual.html), and Feeblemind appears in the [modding manual's affliction table](https://www.illwinter.com/coe5/coe5modding.html). Do not identify an impact's gameplay semantics from its name or from one status message.

## Original manual protocol (reference)

The local folder is `validation/status-investigation-20261109-4a72c1/`. It contains **Start-A.cmd** through **Start-D.cmd**. Each starts its own fresh disposable CoE5 5.43 / official CoE5SE 2.13.0 session through the existing launch safeguards. It never starts from the completed Harbor Ember profile. The console stays open to record normal exit. These validation launchers are local artifacts, not a shipped Workbench resume feature or downloadable release.

Run **A → B → C → D**, one game at a time. Do not launch through Steam, open a campaign, reset targets or repeat a used case. If a launcher says **STOP**, keep the message and report it. It refuses a second launch, changed inputs, an incompatible runtime or another active game.

All four use **Harbor Ember Test → Harbor Ember**, caster/target **Spearman #13**, one enemy, fire #4, base weapon damage 0, range 5, initiative 1, area 0, flight mode 2 / effect #65, path #3 / level 1. They start with impact #68. The only source change is D's spell payload **8 → 0**; its actual HP result must be checked rather than assumed.

| Case | Launcher / main-menu entry | Settings before the one cast |
| --- | --- | --- |
| A — untouched baseline | `Start-A.cmd` → **WB test: WB_FE_A_20261109_4a72c1** | Leave everything unchanged. **Do not click Apply or open Effects.** Impact stays 68; spell payload 8. |
| B — no-change Apply | `Start-B.cmd` → **WB test: WB_FE_B_20261109_4a72c1** | Leave everything unchanged. Click **Apply once**, then cast. Impact stays 68; spell payload 8. |
| C — original change | `Start-C.cmd` → **WB test: WB_FE_C_20261109_4a72c1** | **Effects… → Impact → #3 White Flare → Back to field → Apply once.** Spell payload 8. |
| D — zero-payload comparison | `Start-D.cmd` → **WB test: WB_FE_D_20261109_4a72c1** | Same impact selection and Apply as C. Spell payload is already **0** in this separate source; do not change damage type or other controls. |

For **each** case:

1. Run its launcher, keep its console open and open its **WB test:** entry. Before casting, inspect the right-hand target if its unit card is available (right-click); note HP and any existing Feebleminded/other affliction. Return to the field. Use the same inspection method in every case. If the target already has Feebleminded, stop that case before casting and report it. If inspection is unavailable, report **unknown** rather than assuming a clean state.
2. Follow that case's settings above. If #3 is unavailable or Apply reports an error, stop without substituting another value.
3. Click **Cast once exactly once**. Note the spell/weapon named in the log, damage, any new status message and the visible flight/impact separately. If possible, inspect the target's HP/affliction description afterward. A red heart alone does not identify which affliction it is.
4. Click **Save test values → Close test → Quit** normally. Wait for the console's exit message before closing it and starting the next case. Keep any error. Do not return/export these diagnostic settings to a mod draft.

## VFX and what to report

Manual visual descriptions are the default for this comparison. The previous ffmpeg executable-name capture failed; no new recording method has been verified here. If you choose to record, first check a short **main-menu → field** clip before casting and play it back to confirm that it contains the actual game surface. If that fails, use a description. **Do not repeat a cast for footage.** A saved impact ID is not an observed appearance.

For A–D, report: **before status/HP → damage/log text → after status/HP; visible flight/impact (or unknown); Save/Close/Quit result**. Mention whether you inspected the unit card and whether an affliction description was available. The launchers retain raw logs and receipts locally for subsequent analysis; you do not need to upload game files.

The recorded batch is described in the linked results; this original protocol did not assume an outcome. D is a no-HP-loss control only if its actual log/HP confirms that; a zero payload may produce no useful attack, which is an inconclusive control. Absence of a random affliction in one cast does not prove immunity or a fix. [Investigation, hypotheses, checks and pending results](../validation/status-investigation-20261109-4a72c1/REPORT.md).
