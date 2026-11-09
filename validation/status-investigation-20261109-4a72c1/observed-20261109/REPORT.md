# Four controlled Harbor Ember casts: actual game results

**All four planned sessions completed: exactly one cast each, saved readback, field closure and normal Quit with exit code 0. Feebleminded did not recur.** One damaging baseline-visual cast produced a **Chest Wound**. The evidence is consistent with ordinary battle injuries, but does not establish the original Feebleminded event's exact engine cause. No reproducible Workbench defect was found and no production implementation was patched.

The user asked the agent to operate the previously prepared A–D comparison. These are agent observations, not user reports. [Source investigation and original controls](../REPORT.md). No extra cast, target reset, replacement package or substituted attack was used.

## What was actually observed

Each session loaded CoE5 5.43 / official CoE5SE 2.13.0 and its own test mod. Caster and target were Spearman #13, actual unit instances #1 and #2, deployed at (12,10) and (18,10). Every before-cast unit card showed **6/6 HP**, strength 4, morale 4, magic resistance 4 and no visible affliction icon. This is a rendered-card observation, not a recorded complete state-bit mask. The field remained a forced item-style spell test; no native-AI combat was substituted.

| Case / actual action | Read-back impact / spell payload | Named weapon hit in game log | Post-cast target observation | Feebleminded evidence |
| --- | --- | --- | --- | --- |
| A: unchanged baseline, **no Apply** | 68 / 8 | Harbor Ember, `dmg8, dt4`, **4 damage** | **2/6 HP**, no visible affliction; morale/MR still 4/4 | No Feebleminded message or visible affliction |
| B: **Apply once**, all values unchanged | 68 / 8 | Harbor Ember, `dmg8, dt4`, **2 damage** | **4/4 HP**, strength 3, red heart; its popup explicitly says **Chest wound** and describes reduced strength/maximum HP | Chest Wound logged; no Feebleminded message |
| C: select impact **3**, **Apply once** | 3 / 8 | Harbor Ember, `dmg8, dt4`, **6 damage** | Target **died** and disappeared | Not logged; post-cast live status unavailable. This is inconclusive as a nonlethal status comparison |
| D: same impact-3 Apply, prepared payload **0** | 3 / 0 | Harbor Ember, `dmg0, dt4`, **0 damage** | **6/6 HP**, no visible affliction; morale/MR still 4/4 | No Feebleminded message or visible affliction |

Every log contains one **Spearman casts Harbor Ember Test** and one matching named Harbor Ember hit. The loader resolved spell #1029 / weapon #1200. Damage type remained fire #4, area 0 and flight 2/#65 in all cases. A's saved baseline snapshot contains its one call; B–D each contain a zero-call baseline and a one-call applied snapshot. Two snapshots are not two casts. The unchanged native result reader and the JavaScript result validator both accept all four receipts with readback confirmed and no packet error.

Evidence: [A before](A-03-target-before.png), [A after](A-06-target-after.png), [B before](B-01-target-before.png), [B after](B-04-target-after.png), [Chest Wound description](B-05-affliction-description.png), [C before](C-01-target-before.png), [C lethal result](C-05-cast-result.png), [D before](D-01-target-before.png), [D after zero damage](D-06-target-after.png), [combined combat excerpts](combat-excerpts.txt).

B's current/max HP is **4/4**, not 4/6: the observed Chest Wound also lowered maximum HP. A net HP reading alone would not explain that change or identify the affliction.

## What this establishes — and what it does not

- The original Feebleminded event was **not reproduced** in these four casts. It is not established as an inevitable effect of impact #3 or of the unchanged-value Apply pass.
- A/B had the same configured values and produced different damage/injury outcomes. That is consistent with variation in ordinary damage and battle afflictions. It does not prove that Apply has no possible side effects: random state and rolls were not matched.
- C reproduced the original impact-3 selection/write path and used the correct weapon, but its lethal hit makes the status comparison weaker. It is not a successful nonlethal counterexample proving the impact harmless.
- D genuinely worked as a **no-HP-loss control in this run**, because a named hit with payload 0 logged zero damage and the target stayed 6/6. Its white impact still appeared without Feebleminded. This does not promise that every zero payload, target or effect behaves this way.
- The earlier fixed piercing/cold impact-68 Feebleminded events remain valid historical evidence. The new Chest Wound adds another observed injury under baseline visuals. Alongside the manual's documented combat-wound afflictions, these make ordinary battle injury a plausible explanation. They do not identify which native routine added the original status or establish an affliction probability/formula.

There is therefore **no evidence-based Workbench bug fix to make from this batch**. Neither the original event nor the new wound was removed, suppressed or relabeled as a success. To establish the exact engine path in a later diagnostic, the pinned API already provides the observe-only `UNIT_RANDOM_AFFLICTION` site plus read-only `unitStateFlags`. A separately reviewed helper could record before/after unit bits and that call for the actual unit identity, without replacing the game's result. That instrumentation was not installed in these controls, and automatic attacker attribution must not be invented from HP changes.

## VFX capture was verified and then used

The previous executable-name capture failure was not reused as evidence of appearance. Before A's cast, a new **exact-title** capture (`^CoE 5$`, with exactly one isolated game window present) produced a valid 1100 × 800 recording. Decoded preflight frames showed the actual test field. The main-menu transition had completed before its first recorded frame; it is not presented as a captured menu-to-field transition.

All four casts were then recorded continuously at **60 fps** into about 20-second local clips, with no recording errors. Decoding counted about 1,208 frames per take. Contact-sheet/frame review established a golden/orange particle trail traveling from caster to target, an orange/yellow burst for impact #68 in A/B, and a compact bright white flash at the target for impact #3 in C/D. These are actual game frames, not desktop previews or mock-ups. In D the flash is visible despite the separately logged zero HP damage.

| Case | Short clip | Representative frame |
| --- | --- | --- |
| A, baseline Flame #68 | [A cast](A-cast-clip.mp4) | [Orange impact](A-impact-frame.png) |
| B, unchanged Apply / Flame #68 | [B cast](B-cast-clip.mp4) | [Cast and wound log](B-03-after-cast.png) |
| C, White Flare #3 / lethal hit | [C cast](C-cast-verified.mp4) | [Particle flight](C-particle-flight.png), [white impact](C-white-impact.png) |
| D, White Flare #3 / zero damage | [D cast](D-cast-verified.mp4) | [White impact with zero-damage log](D-white-impact.png) |

The short clips are uncaptioned full-resolution excerpts from the original takes, encoded for viewing with no frame interpolation or invented frames. A/B cover source seconds 6.5–11.5, C 9.2–13.2, D 8–12. Original long captures stay local. The selected IDs, visual observations, named hit and HP/status outcome are separate evidence; one animation alone proves none of the other three.

## Closure, preservation and checks

| Case | Owned PID | Saved/closed | Normal Quit / exit code |
| --- | --- | --- | --- |
| A | 29084 | One snapshot; `test_field_closed`; visible main menu | **0** |
| B | 9600 | Baseline + applied; `test_field_closed`; visible main menu | **0** |
| C | 4608 | Baseline + applied; `test_field_closed`; visible main menu | **0** |
| D | 18660 | Baseline + applied; `test_field_closed`; visible main menu | **0** |

Only these owned games were started and all exited through the visible **Quit** action. No process was terminated by PID. No game remains running. No error dialog or cleanup error was observed; the launcher status has error null and no changed staged inputs. [A returned menu](A-08-main-menu-closed.png), [B returned menu](B-07-main-menu-closed.png), [C returned menu](C-07-main-menu-closed.png), [D returned menu](D-08-main-menu-closed.png). Complete engine-allocation cleanup or every private in-memory restoration was not independently audited after closure.

All **76 staged input hashes** across the four sessions match, and all **33 files** in the completed original Harbor Ember reference session remain byte-identical to their pre-investigation manifest. No source draft or pending edit was opened/changed, and no diagnostic value was returned/exported to a mod. Normal profiles, saves, installed game files and unrelated mods were untouched. Four result packets passed both native and JavaScript validators; **45/45 focused creation, selected-spell and return regressions pass**. The earlier 278 script checks remain separate preparation evidence.

The local validation launcher only gained accurate operator labeling and a read-only result-collection command. Production Workbench, canonical Lua helper, game/extender and their launch policies did not change. Raw sessions, result packets, profiles, managed host copy and original recordings remain local; only authored documentation, curated screenshots/clips and combat excerpts are published. No downloadable release was built or replaced.

The A–D launchers are now **consumed reference cases**, not pending instructions. Do not remove their one-shot claims or repeat them. The remaining uncertainty is the original affliction's precise native path, not whether these four casts or captured effects occurred. No further casts were made to improve footage or replace the lethal result.
