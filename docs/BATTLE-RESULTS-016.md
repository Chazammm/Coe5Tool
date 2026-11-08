# Recorded mixed battle results

Open **Saved test values** for a mixed ranged comparison and select a battle. **Recorded defenders** opens automatically. Fixed mixed tests use **Read mixed observation** in the test bench. These are isolated **CoE5SE 2.13.0 + local Workbench roster-v1** tests; native weapon export remains a separate workflow.

The table shows the verified pre-battle native type/name, that battle's instance ID, HP before/after and **net HP change**. For fire, cold or shock it also shows the available pre-battle resistance per instance. The summary counts lower, higher, unchanged and unavailable after-HP readings. Negative HP is retained, not clamped. It is not labeled a death or attributed damage. The table scrolls for larger rosters and is keyboard focusable.

**Hits by the tested weapon, attributed damage and attack-time positions are unknown in these receipts.** A net HP change combines all causes. Unchanged HP does not rule out a miss, resisted/zero-damage hit, healing or other effects. Types/names describe the pre-battle identity; these receipts do not record a post-battle type or status-effect history. No user observation checkbox turns an unknown into a confirmed hit. Instance IDs belong only to the selected battle and may be reused after field rollback. A battle call returning, field closure, snapshotted-record restoration, process exit and visible effects remain separate facts.

Select only the visual values you want to use, resolve any newer-edit conflicts explicitly, then **Apply selected to draft** and **Export copy**. Neither opening the table nor changing battles edits source. Other pending edits remain in their forms. HP, identities and result-summary data never become weapon commands. Older fixed and comparison receipts still use their original readers; no helper or runtime update is required for this display.

## What the inspected interfaces establish

Checked against the pinned 2.13.0 release source and the unchanged local roster-v1 development source on 2026-11-08. This is a source inspection, not a new game test. Exact local source paths and hashes are in the accompanying validation report/evidence. The existing [area-5 game run](../validation/mixed-area-manual-20261108-724df2/REPORT.md) established cross-type hits by separately inspecting its debug log. This results view does not import those manually established conclusions into the receipts.

| Information | Current interface / implementation | Trust boundary |
| --- | --- | --- |
| Defender identities | `withTestFieldRoster` returns `{unit, monster}` in request order. Helpers verify the selected types/names and instances; host/browser readers bind them to a session/run/source and selected battle. | These are field-owned instances, not persistent campaign or cross-battle identities. |
| HP | `coe5.get("unitHp", unit)` reads signed `T_I16` unit HP. Mixed helpers read before and after the native fight, while the field callback still owns the units. | A state difference is not a damage event or attacker identification. Fixed failed/cancelled observations can lack after-HP. |
| Elemental resistance | The pinned Windows `unitFireResistance`, `unitColdResistance`, `unitShockResistance` calls are sampled before battle where supported. | Unknown stays unknown; no formula is inferred from percentages or random damage rolls. No elemental reading is claimed for a physical weapon. |
| Battle return / cleanup | Helper receipt plus field-owned native status; fixed observations can report refusal/error or zero battle returns. Comparison samples are accepted only after closed/restored checks. | The owner's snapshots cover specified records/globals, not every engine cache or random state. |
| World-map coordinates | `unitX` / `unitY` are registered getters and are used by the map/army code. | They must not be relabeled battlefield or attack-time coordinates. |
| Battle positions | The address table contains `RVA_BATTLE_UNIT_POSITION`, but no typed, verified read-only Lua getter was found in the inspected registration/data/call tables. | A named address is not a verified calling contract. No memory/address call was added. Setup positions would also differ from positions at a later hit. |
| Low-level observers | `lua_sites.h` registers `DOATTACK` (`x:iii`), `DAMAGE_UNIT` (`x:ii`), `BATTLE_ROUND` and fight boundaries for `coe5.observe(before, after)`. | These are not a structured per-weapon, per-target hit history. `DAMAGE_UNIT` does not supply an attacker/weapon tuple in its two-argument signature. Correlating nested calls needs validation. |
| Weapon hook | `WEAPON_HIT` is `K_CALL`, signature `i:iiiiii`. `coe5.observe` explicitly rejects it and instructs scripts to use `coe5.wrap`. `weapon_traits.h` routes this site through a damage/trait adjustment, including immunity and multipliers. | Its name/result must not be treated as final applied HP damage or a complete hit/miss outcome. A transparent wrapper is a plausible investigation tool, not implemented or live-verified telemetry here. |
| Debug log | The previous pinned game logs include named attacks, victim instances and attack coordinates. | Useful evidence for a person; not a stable public API, complete event contract or safe automatic attribution source. No parser was added. |

Implementation inspected: `lua_game_data.h` (unitHp/unitMonster/unitX/unitY), `lua_game_call_rows.h` (resistance calls), `lua_sites.h` (site table and lObserve), `weapon_traits.h` (weaponTraitDamage/weaponHitDamageAsGame), `lua_test_battle.h` (fight lifecycle), local `wb_roster.h`, `desktop/MixedRangedComparison.lua`, `desktop/MixedObservation.lua`, `desktop/TestExchange.cs`, `desktop/MixedResults.cs`, and the browser result validators. The official release extraction, shared records and native plugin were not changed.

## Concrete proposal for musical_pianist — not an existing API

The useful next step is a **field-owned, read-only battle observation buffer**, scoped to one `withTestFieldRoster` callback/fight and versioned independently of the roster API. A native implementation should copy plain values into bounded records; it should not invoke arbitrary Lua during engine damage processing or retain live unit pointers after field closure.

1. Assign a battle token, event sequence and attack ID. Carry the parent attack ID through area selections and chained/sub-attacks. Record native type plus battle-local instance IDs; distinguish attacker, carrier, selected target, affected target and empty-square selection.
2. Capture verified battlefield coordinates at the event phase. Label deployment, attack selection, application and aftermath separately. Return unavailable for off-field/removed units; never substitute world-map coordinates.
3. Expose an attack/weapon/spell identity only at a verified engine point. Keep attempted, missed, resisted, zero-effect and applied outcomes separate, with explicit unknown fields where a branch is not observed. Record adjusted payload, actual applied HP change and non-HP effects separately; do not rename a modifier's return value “damage dealt.”
4. Include coverage: installed/verified hook capabilities, game/extender fingerprints, event limit, truncation/drop/error flags, and whether the battle completed. Zero recorded hits cannot mean no hits unless coverage is complete. A partial buffer must not make negative assertions.
5. Finalize copied observations before field rollback, then expose immutable data for the completed battle. Every refusal, callback error, partial allocation, cancellation and retry must clear ownership correctly and keep battles separate. Close must restore the existing field state without world-map spawning.

An API such as **proposed** `testFieldBattleObservations()` could return this versioned snapshot; it does not exist in the pinned runtime. A first proof should validate the relevant Windows call/record layouts, zero-damage and resisted cases, nested attacks and area victims against the existing named log/recorded battle. Then test intentional event truncation, aborted battles, ID reuse and cleanup. Existing released-extender single-type routes and roster-v1 readers should remain available. Native source changes would require a new explicitly pinned development runtime and a new isolated game test before enabling confirmed-hit UI.

## Manual acceptance

No game test is needed to validate this presentation-only change. The retained area-5 receipt is sufficient; loading it is not a new gameplay observation.

1. Start the current desktop build. Open a disposable copy of the exact **Mixed Area Needle** source. Choose its matching **Saved test values** result.
2. Select Battle 1, then Battle 2. Each should show six defenders, two native types, four lower-HP and two unchanged-HP readings. Instance 3 is `6 → -4`, net `-10`, not “10 weapon damage.” Impacts are Blood Burst #34 and Flame #68 respectively. IDs may be reused.
3. Confirm that **Hits by the tested weapon: unknown** and the unavailable attack positions remain visible even after checking your personal observation. Check the separate battle-return/cleanup line. Tab into the table to scroll; narrow the app and confirm the table remains readable via scrolling.
4. Apply only impact 34 → 68 to a disposable draft and export a new filename. The original must remain unchanged and the new file must differ only at that command. A newer impact edit requires explicit replacement; unrelated pending edits must remain pending.
5. For an older fixed mixed receipt, use **Read mixed observation**. Confirm its own IDs, HP/resistance and cleanup state; cancelled/incomplete after-HP must remain unknown. Never interpret another session's rows as the current preparation.

If fresh gameplay evidence is later desired, prepare a new isolated mixed session using the existing workflow. Do not rerun or edit retained sessions. Observe named attacks and visuals separately, Finish and Quit normally, then inspect the new result. This display adds no new game hook, position reader, combat support or Vanilla-only test.
