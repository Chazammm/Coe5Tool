# Harbor Ember status investigation and controlled preparation

**Investigation and offline preparation complete; four fresh manual game cases await the user. No game was started in this phase. No cause or Workbench defect is confirmed.** [Short A–D instructions](../../docs/STATUS-COMPARISON-016.md).

## Evidence checked

Read AGENTS.md, the consistency checklist, selected-spell extraction/return implementation and the [actual Harbor Ember report](../selected-spell-workflow-20261109-25c9d1/game-20261109/REPORT.md). Inspected the complete saved candidate, generated `.c5m`, weapon-edit-v4 Lua helper, its input/draw dock, source/body generators, native candidate validator, session launch/result code and both original debug logs. The publication checkout started clean at `815c00f81edface39517b45646b2d333b9cbd0d1`.

The completed session's definition is explicit: Harbor Ember has range 5, initiative 1, **dmgtype 4**, base dmg 0, area 0, initial impact 68 and flight 2/65. Harbor Ember Test has path 3, level 1 and spell payload 8, referencing that earlier local weapon. No special-affliction type, affliction mask, chained weapon, inherited record or explicit Feeblemind command appears. The loader recorded spell **#1029 → weapon #1200**, payload 8 and **flags=0x0**. At the attack the log names that weapon, `look 3`, `dmg8, dt4`, 2 damage and then Feebleminded on target unit #2. The saved result confirms one completed cast call and those read-back settings; it does not identify the engine path that added the status.

Crucially, the retained **fixed piercing** Cinder Trial Bolt and **fixed cold** Rimeglass Trial Bolt battles both recorded Feebleminded after their first damaging hit with **impact #68**. Those used native AI/private carriers, not the generated-pair cast/Apply experiment. [Curated historical excerpts](prior-combat-excerpts.txt). They are not matched controls: damage types, carriers, flight, battle procedure and random state differ. They do establish that the symptom is not exclusive to the new selected-spell extractor, fire, impact #3 or its live Apply action. Both still used CoE5SE's test field, so a common field/runtime issue is not ruled out.

## Source investigation and plausible explanations

The official 2.13.0 source already retained locally supplied these checks (file fingerprints are recorded in local `offline/inspected-sources.json`):

- **Workbench helper:** `run_test` resolves exact unique spell/weapon names, validates path/level/payload/base damage and baseline fields, opens the field and delegates casts to `coe5.fireTestField`. Apply writes only `dmgtype`, `aoe`, `look`, `flymode`, `flylook` on its own new weapon; it checks readback and later restores baseline values. It does not call `unitRandomAffliction`, add afflictions, change unit state bits or install an attack/effect override. Result saving is separate. Source-level absence of these calls is not a proof that every delegated engine operation is harmless.
- **`record_words.h` / `lua_get_set.h`:** look is a 4-byte field at weapon +0x74, damage type at +0x4c, 8-byte damage at +0x50, area at +0x58 and flags at +0x60. The setter checks mod ownership and writes the declared width. There is no obvious look-to-affliction-field alias in this source. This does not independently validate the game's hidden effect implementation or every binary offset.
- **`spell_table.h`:** `newspellLine` zeroes the parser block; `storeSpell` copies its explicit record, and the actual loader logged flags zero. There is no evidence that an old Feeblemind spell was intentionally copied into Harbor Ember. Native newweapon initialization is delegated to the game; no complete hidden-record reconstruction is claimed.
- **`lua_test_battle.h`:** creates fresh commander/enemy units using native allocation, adds/memorizes the selected spell on the caster, sets up/deploys the field and invokes `RVA_DOATTACK(unit,-1,spell)` followed by projectile stepping. Some ranges are temporarily extended. This field is shared by the earlier AI tests. It does not explicitly add Feebleminded, but its native calls, initialization and random-state context remain possible common factors.
- **`fanpatch/fix_feeblemind.c`:** `hk_add` calls the original add-afflictions function first, then rebuilds a spell list when the unit changed from not-feebleminded to feebleminded. Other checks respond to existing state. Thus the historical `became Feebleminded` rebuild line corroborates the state transition, not its cause. It is not evidence that the fix selected or applied that affliction.
- **Available observer, not installed here:** the pinned `coe5.lua` and `lua_sites.h` expose Windows **`coe5.observe("UNIT_RANDOM_AFFLICTION", before, after)`** and read-only `unitStateFlags`. A future diagnostic can record that call and state transitions without replacing its return. It is an observe-only site, not a `wrap` site. This batch retains the existing canonical helper unchanged; injecting extra Lua would fail the native helper validator and change the fixture under investigation. The general game attack/affliction implementation is not present as game source in this workspace. No new native hook or binary patch was attempted.

The current [official game manual, Battle Afflictions](https://www.illwinter.com/coe5/coe5manual.html) describes permanent injuries from combat wounds and increased affliction chance when cursed. The [official modding manual](https://www.illwinter.com/coe5/coe5modding.html) lists Feeblemind as affliction bit 25 and documents type-12 affliction masks separately from fire #4. Checked on 2026-11-09. These support an **ordinary battle injury** hypothesis; neither manual establishes the precise probability or the cause of this specific hit.

| Hypothesis | Current assessment | What the comparison can check |
| --- | --- | --- |
| Ordinary injury associated with HP damage | Plausible; supported by the manual and older damaging hits with impact 68. Exact random-affliction call was not recorded. | Observe baseline/new statuses; compare C against the lower-payload D, using actual logged HP loss. No probability estimate follows from four casts. |
| Impact #3 has a relevant engine effect | Not established. Its table name is not proof of semantics; #68 historical cases refute an exclusive #3 explanation. | B/C change only the selected pending impact, keeping the same Apply path and damage payload. |
| Apply or a private-weapon setter causes the symptom | No obvious source defect; older fixed tests show it without this experiment's Apply action. | A/B differ only by an unchanged-value Apply pass. It writes all five helper fields, not only look. |
| Common test-field/runtime or unit-state behavior | Still possible because all observed cases used this field/extender and the old run lacks a recorded pre-cast affliction mask. | Check target state before casting, retain field/log identity and do not call this ordinary campaign combat. Use the official observer in a later approved diagnostic if these controls cannot resolve the cause. |
| Wrong linked weapon / deliberately configured affliction | Evidence weighs against it: exact resolution, type/payload readback, named attack, zero spell flags and no affliction source command. | Keep all identities/definitions fixed; do not substitute another record. |

## Controlled comparison

All four cases use the unchanged **weapon-edit-v4 helper** and the original canonical pair. The only source change in D is spell payload **8 → 0**. Each gets a new runtime copy and profile, one selected native target type/count and one cast in a fresh process. No random seed is forced, no target immunity is invented and no unit state is cleared by a custom script.

| Case | Prepared impact / spell payload | User action before the one cast | Relevant comparison |
| --- | --- | --- | --- |
| A | 68 / 8 | No Effects and no Apply | Unchanged baseline |
| B | 68 / 8 | Apply unchanged values once | A/B: setter pass only |
| C | 68 / 8 | Select impact 3 and Apply once | B/C: impact only; reproduces the original change |
| D | 68 / 0 | Select impact 3 and Apply once | C/D: spell payload only |

Every case retains caster/target Spearman #13, count 1, fire #4, base damage 0, range 5, initiative 1, area 0, flight 2/65, path #3, level 1 and exact spell/weapon names. Mod IDs differ only to isolate the packages. D is **not promised to deal zero HP damage**: payload zero is valid syntax, but native targeting/bonuses/fallback may yield no useful attack or another result. The log and actual HP must decide whether it worked as a no-HP-loss control. Damage rolls, resistance, shield parry and random injuries prevent attributing every between-case difference to the changed value. One negative result cannot prove a fix or safety.

The user should use the same before/after target inspection method in every case, report existing status or unavailable readings and not infer Feebleminded from an unidentified red heart. If it exists before casting, stop that case before the cast. Save readback separately from observed damage/status/appearance. Do not apply diagnostic values to a real mod draft.

## Fresh preparation and safeguards

New local folder: `validation/status-investigation-20261109-4a72c1/`. **Start-A.cmd** through **Start-D.cmd** are ready. They use a frozen copy of the unchanged managed Workbench host, a small local validation launcher and separate app-owned test storage roots under `cases/A` through `cases/D`. They do not replace the normal Workbench last-session pointer. Only settings from the completed app-owned disposable profile were copied through the production `ConfigForTest`; no normal profile or saves were copied. The completed session was not launched, rewritten or reused as an execution profile.

| Case | Mod / session | State |
| --- | --- | --- |
| A | `WB_FE_A_20261109_4a72c1` / `40fb0b188f704c6f9507e67fa694cab0` | Prepared, non-stale, PID null |
| B | `WB_FE_B_20261109_4a72c1` / `e7f746ab280d4bd7815d47022e94474e` | Prepared, non-stale, PID null |
| C | `WB_FE_C_20261109_4a72c1` / `a162e86e306c47828bd90089cb29a5aa` | Prepared, non-stale, PID null |
| D | `WB_FE_D_20261109_4a72c1` / `d022c2198bf64bc7933a3905395d495f` | Prepared, non-stale, PID null |

The production game/runtime verifier accepted **CoE5 5.43 / official CoE5SE 2.13.0**, with game SHA-256 `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55` and plugin SHA-256 `26861bb0b6dffaa7150ed239e9eba4e934a955688d101c81161cf395190dd254`. Each case has **19 verified staged inputs**, only the extender and its test mod, a fresh profile and no campaign saves. No local roster overlay is used.

Preparation/check commands never call Start. Explicit user launch checks host, source/candidate, original disposable template, runtime, current private case identity/revision, stale state and inputs, then uses production Start's ownership, canonical helper, binary and active-game gates. A one-shot launch claim blocks accidental replay. The launcher waits for the exact owned process; it records status/exit/input changes after normal Quit and never closes an unrelated process. Keep its console open until the exit message. A failed case is retained; do not delete its claim or bypass a refusal.

## Offline verification

- Local validation launcher builds with **0 warnings / 0 errors**. The application, Lua helper, game/extender and production launch policy are unchanged.
- **12 source/helper/isolation assertions pass:** A/B/C source equals the completed baseline; D differs only in the one spell payload; Lua is unchanged except generated context/payload literals; all states remain prepared with no PID.
- **12 native candidate checks pass:** all four canonical packages accepted; altered source and injected affliction Lua rejected for each case.
- **4 production preflight checks pass**, each with 19 matching input hashes and private profile ready. Additional checks reject changed host fingerprint, candidate fingerprint and source fingerprint before any launch.
- **278/278 existing script tests pass.** No new game result is implied by these checks.
- All **33 files in the completed Harbor Ember session** match the full before/after manifest. Existing retained sessions, user sources, original runtime files, saves and mods were not modified. Raw candidates/profiles/runtime copies, launchers and local check outputs remain outside GitHub.

## VFX and pending analysis

No recording is required for this first comparison; a manual description is acceptable. The previous executable-name capture failed and no new capture was tested in this preparation-only phase. If recording is used, the user must verify an actual moving main-menu/field transition clip before the one cast. Failure means use a description, not another cast for footage. Saved settings and cast calls do not establish appearance.

**A–D gameplay observations, actual casts/damage/status, closure and normal exit are all pending.** After the user reports, inspect each case's `started.json`, `exited.json`, private `runtime/log.txt` / `coe5mod.log` and saved result INI. Separate before/after user observations, helper readback/cast calls and pinned debug-log evidence. Debug logs are not a stable public application API. If a reproducible defect is established, fix and verify that specific defect; otherwise preserve uncertainty and update guidance. Do not turn an inconclusive random comparison into a success claim or perform more casts solely for video.
