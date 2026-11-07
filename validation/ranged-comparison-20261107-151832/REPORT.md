# Standalone ranged comparison in one game session

**Passed on Windows, 7 November 2026.** One isolated CoE5 5.43 / CoE5SE 2.13.0 process ran two native AI battles with **Prism Trial Quarrel**. The second battle used all three revised visual values. Workbench read both saved configurations and exported a separate native weapon with only those three changes. Side-by-side clip (local evidence) · Representative frames (local evidence)

## What happened in game

| Battle | Helper readback | Combat log | Captured appearance |
| --- | --- | --- | --- |
| 1, prepared baseline | Sprite mode 1, Ballista bolt #7, Flame impact #68 | WB Ranged Carrier attacked Spearman with Prism Trial Quarrel at distances 4 and 2. Damage was 4 and 2. | A narrow bolt crossed the open space. A bright yellow-orange flash covered the target at impact. Flight (local evidence) · Impact (local evidence) |
| 2, applied revision 1 | Standard particle mode 2, Icy Breath (fly) #97, Blood Burst impact #34 | A fresh carrier and Spearman fought at distances 4 and 2. The same named weapon again dealt 4 and 2 damage. The attack log reports look 34. | A white-blue stream crossed the gap. A separate red burst covered the target as the stream arrived. Flight (local evidence) · Impact (local evidence) |

The weapon used range 5, initiative 5, piercing type 3, base damage 0 and area 0. The private carrier's only attack row was regular ranged, with payload 8. The helper checked the weapon ID on that row before each battle. The game picked the actual distances. Unit-instance IDs changed from 1 and 2 to 4 and 5 between battles. Native combat log, first battle (local evidence) · Second battle (local evidence) · Bound settings from both battles (local evidence)

The desktop opted into **Compare visuals in game**. I ran the first battle, selected the particle flight and the impact independently, used **Apply visuals**, then started the second battle. Choosing a new flight left the applied configuration visible and replaced the battle action with Apply until the settings had been accepted. The game checked the loaded names for the particle and impact. Pending flight (local evidence) · Three applied values (local evidence) · Two completed battles (local evidence)

The extender recorded two field opens with carrier #2000, no spell and one Spearman #13, followed by two closes and two result writes. **Finish** returned to the main menu without a restoration error. The helper writes the original visual values back and checks all three on exit. The extender's optional verbose Lua log was off, so the post-restoration numbers were not independently recorded. The isolated PID 2052 exited with code 0. All 19 fingerprinted staged inputs still matched. Field lifecycle (local evidence) · Main menu after Finish (local evidence) · Process status (local evidence) · Integrity check (local evidence)

The two 38-second window recordings were made in the same process. Representative frame times in the **sprite** recording are 7.22 s and 7.53 s. Times in the **particle** recording are 9.33 s and 9.72 s. The six-second comparison crops the same battle region from each recording at normal speed, with the sprite on the left. Capture sampled at 60 fps. These are recording times rather than measurements of native effect duration. Full sprite recording (local evidence) · Full particle recording (local evidence)

## Desktop return

After Quit, **Review saved test values** opened the second battle. I applied the checked impact, flight mode and flight effect to the draft and used the native export dialog. A byte comparison confirmed exactly `look 68 → 34`, `flymode 1 → 2` and `flylook 7 → 97`. The original copy retained its original values and line endings. Starting native source (local evidence) · Exported native copy (local evidence)

During review the battle selector was initially tucked inside session history. The final desktop build shows **Compare saved battles** above the changes, with the flight and impact names and IDs. I reopened the same source in that build and switched between both saved battles. Battle 1 correctly showed no changes against the original draft. The picker clears the personal observation checkbox when switching samples. Final desktop, battle 2 (local evidence) · Battle 1 (local evidence)

## Ownership, result validation and scope

- The pinned extender tracks which mod created a weapon and rejects writes by other mods. The launcher independently reconstructs the reviewed Lua and private carrier before launch. The helper additionally checks the names and private slot ranges, carrier row and payload, fixed weapon stats and expected visual readbacks. It uses only the three visual setters on the private weapon, between battles. If a write fails it attempts to restore the baseline, checking identity again. An identity or restoration failure produces an error. [Pinned setter implementation](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_get_set.h) · [Pinned field lifecycle](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_test_battle.h)
- Sprite mode offers Arrow #0, Javelin #1, Sling stone #2 and Ballista bolt #7. Particle mode offers the nine documented named native-use rows from the existing chooser. Impact offers Blood Burst #34 and Flame #68. A prepared source may omit impact. Use Finish to restore an undeclared starting impact after applying an explicit one. The fresh field uses the existing supported standalone physical ranged subset. The four previous fixed observation / spell workflows retain their existing helpers.
- The helper saves up to 32 completed battles per launch. Each sample is bound to its session, run, source revision and test mod. Pending selections and applied settings that have yet to complete a battle are not saved. After finishing a comparison with saved results, exit and review before starting another launch. The native host and desktop reject unknown values and inconsistent bindings. The desktop applies the two flight words together, requires explicit choices for conflicts and new lines, and keeps unrelated pending edits. It only exports a separate source file.
- Native weapon export remains independent of CoE5SE. Only the two combinations above were observed in this run. Arbitrary VFX, sound, special damage payloads, mixed attack rows, campaign AI, saves and timing remain outside this comparison.

## Offline verification

- **225/225 JavaScript tests** passed, including fixed melee, sprite, particle and generated-spell regressions. Added cases cover opt-in routing, the same carrier definition, invalid or unbound battle histories, omitted impact, paired flight conflicts, unrelated pending fields and per-sample observation state. Suite output (local evidence) · [Regression cases](../../tests/ranged-comparison.test.cjs)
- **27/27 compiled desktop checks** passed. The new native check replayed a copy of the actual saved result with its reviewed candidate. It also rejected altered Lua, wrong launch identity, invalid flight and unconfirmed readback. Host results (local evidence) · Host replay packet (local evidence)
- **9/9 simulated Lua cases** passed in the pinned offline test VM. They exercised the two-battle path, shared/relinked IDs, a partial write, a mismatched runtime name, a refused second field, interrupted battle, failed save and a previously saved launch. Mock results (local evidence)

The live session is `2dc67e943ff347f2ac9bf7740dbbe287`, run `e46c69223e9a423c907c0e54514284fa`. The extender identified build `6aec6a32-13728000`. Verification used a newly named disposable weapon, profile and process.
