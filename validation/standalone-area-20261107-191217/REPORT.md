# Standalone area-effect validation

**Passed one bounded area-5 ranged test in CoE5 5.43 / CoE5SE 2.13.0.** Native AI made one Glacier Area Trial attack that damaged three distinct defenders. Five Deer #609 were allocated and individually checked. Each read 0% cold resistance before combat. Two of the five area selections were empty squares. [Attack excerpt](area-attack-excerpt.txt) · Full game log (local evidence) · Verified group (local evidence).

| Victim instance | Logged battle position at resolution | Damage from Glacier Area Trial | Immediate result |
| --- | --- | --- | --- |
| Deer #6 | (16,10) | 6 cold, damage type 5 | Died |
| Deer #3 | (16,11) | 7 cold, damage type 5 | Died |
| Deer #4 | (16,12) | 5 cold, damage type 5 | Survived that hit |
| Deer #2 and #5 | Their positions at this impact were not identified by a victim-specific log line | No Glacier hit recorded | Both remained able to attack later |

The same attack sequence selected empty squares (15,12) and (17,11). The log records five selected locations and three populated victims. This supplies evidence of damage to multiple units from this attack. It does not establish a general shape, hit count, targeting priority, damage formula or VFX result for every combination. Parsed evidence (local evidence).

## Prepared weapon and actual placement

The weapon was generated through the existing standalone generator, opened in the desktop app, and prepared through its normal test controls. It used native weapon #1200, cold #5, base damage 0, area code 5, range 5 and initiative 5. WB Ranged Carrier #2000 had one regular ranged attack, row 0, payload 8. Flight remained sprite mode 1, Ballista bolt #7; impact remained Flame #68. The test used five copies of searchable Deer #609. Desktop setup (local evidence) · Source (local evidence).

The native deployment log places the carrier at (12,10) and the defender formation at (18,8), (18,9), (18,10), (18,11), (18,12). Those five setup lines identify the unit type, without assigning the instance IDs to the coordinates. The screenshot shows the five-unit column. By the first attack the log identifies the three populated selections at x=16. These are battle coordinates. The world-map test square was (1,1). [Initial field](03-five-defenders.jpg) · Deployment and attack log (local evidence).

The helper used native AI battle behavior and the original field placement. The game internally resolved the area selection into per-square entries logged as `forceaoe 1`. No item-style cast or `fireTestField` call was used for this test. The selected visuals did not determine the cold type or area code.

## What the application supports

Fixed melee, fixed ranged and ranged visual comparisons accept source area codes **0–5**, alongside the existing physical/fire/cold/shock types and supported visuals. Code 0 keeps its previous single-target behavior. Positive codes in this slice request a small nearby count. The source’s area stays fixed through visual comparisons. Only the three visual fields are eligible for explicit return. Pending area edits remain in the desktop draft. [Area regressions](../../tests/standalone-area.test.cjs) · [Native candidate validation](../../desktop/MeleeCandidate.cs).

The current manual describes positive `aoe` values as nearby-square counts and says an x value hits up to x nearby monsters. Code 5 is therefore presented as a count. The table also defines random-square values, circle 997, friendly/enemy groups 998/999, beam/cone families, chain lightning and larger all-square patterns. Those require separate fixture and observation work. This task leaves them outside automatic standalone testing, with an actionable refusal that preserves the real source code. Existing source editing/export remains available within its earlier limits. [Official weapon and area documentation](https://www.illwinter.com/coe5/coe5modding.html).

The pinned field takes one native enemy ID and a count up to 200, allocates defenders on (1,1), then invokes the native battle setup. The helper checks each actual allocated unit before battle. It reads and saves the configured area in nonzero-area receipts, checks it against the prepared source on return, and rejects missing or changed area evidence. Saved values alone provide no damage or appearance verdict. [Field implementation](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_test_battle.h) · [Battle helper](../../desktop/RangedComparison.lua) · [Native results](../../desktop/TestExchange.cs).

## Closure, desktop review and evidence

Session `962a88ec539f45c1a30c89250a131c9a`, PID 248, used game build `6aec6a32-13728000` and API 10. The extender logged field closure, Finish returned to the main menu, and the owned game exited with code 0. All 19 prepared file hashes matched after exit. The desktop reviewed area 5 and all five individual pre-battle readings. Its separate 258-byte native export retained exactly the source bytes. Session (local evidence) · Extender log (local evidence) · Menu after closure (local evidence) · Desktop review (local evidence) · Individual readings (local evidence) · Export confirmation (local evidence) · Native export (local evidence) · Integrity (local evidence).

The continuous recorder could not acquire the game window and saved no video frames. There is no playable clip from this run. The retained screenshots show setup and result screens; the combat log establishes the victims and damage. Projectile and impact appearance were not independently established. Recorder error (local evidence).

A real interface issue appeared during testing. The long comparison title clipped its appended area code. The corrected helper displays a separate **Area code 5 | nearby count** line. A second disposable session `9595a1015f10499c84a84b39ababf5c1` opened only this menu and then exited with code 0. It opened no battle field. Its additive layout marker preserves read-only reconstruction of the first session’s helper. Before (local evidence) · [Corrected in-game label](09-fixed-area-label.jpg) · Menu-only session (local evidence).

## Offline verification

- **241 JavaScript tests passed.** Source generation/preparation covers each code 0–5 across fixed melee, fixed ranged and comparison. Tests reject broader codes, protect the original payload/visuals, preserve pending edits and ensure area cannot enter the visual return fields. Suite output (local evidence).
- **32 compiled host checks passed**, including replay of this actual area-5 receipt, the corrected layout candidate, corrupted/missing area rejection, and the earlier three-Deer and Winter Wolf receipts. It also retained the existing large-history and source-preservation checks. Compiled report (local evidence) · Actual packet replay (local evidence).
- **18 area Lua simulations passed**, six each for fixed melee, fixed ranged and two-battle visual comparison. These check group identity, cleanup, area readback and supported visual iteration. Fixed mock scenarios interrupt drawing after the roster receipt. **Seven previous-comparison simulations also passed.** These are API models with no combat simulation. Melee (local evidence) · Ranged (local evidence) · Comparison (local evidence) · Earlier comparison (local evidence).

The desktop was rebuilt at `build/desktop-016-workspace/CoE5Workbench.exe`. Game screenshots were 882 × 671; desktop screenshots were 1107 × 794. Only area 5 with this ranged weapon received a live damage test. Codes 1–4 and area melee received offline coverage. No broader combat, save or universal effect compatibility is claimed.

## Concrete requirement for musical_pianist

Mixed target types need a supported field-owned roster operation. The current field API accepts a single enemy ID. The generic map spawner also fits terrain, rebuilds armies, checks conquest, updates sight and resets map caches. The test field’s close routine exposes no rollback contract for all those extra operations. The current workbench keeps one type plus count. [Spawn side effects](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_units.h).

The most useful addition would let a test field accept a list of `{monsterId, count}` entries and return the actual spawned instance IDs, with atomic failure on partial allocation and cleanup owned by the field. An associated read-only battlefield position getter would let the workbench bind each instance to its deployment and impact-time location. This would support controlled mixed-group tests and more precise area investigations. No proposed API name or signature is treated as existing functionality.
