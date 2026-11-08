# Mixed battle results: implementation and validation

**Implemented and checked in the actual Windows desktop application.** The current v0.16 build presents a compact recorded-state table for each saved mixed comparison battle and for fixed mixed observations. It shows target type/name, battle-local instance ID, HP before/after, net HP change and supported pre-battle elemental resistance. Hits, attack positions and damage attributed to the tested weapon are explicitly **unknown**, rather than inferred from HP or parsed debug text. No new game hook, helper schema or extender build was introduced.

## Investigation and bounded implementation

Read the [previous mixed area report](../mixed-area-manual-20261108-724df2/REPORT.md), current result readers/validators, both mixed helpers and the pinned official/local 2.13.0 source before selecting the approach. GitHub main and the clean publication checkout both started at `ffb94d23307d4b337213439fad7c7b710dca1380`.

The existing field-owned helpers already sample identities, signed HP and available elemental resistance within their owned callback. Their receipts bind the session/run/source, selected roster, battle revision and cleanup; IDs can be reused by another callback. Neither mixed receipt records attack attribution or attack-time positions.

The inspected `lua_sites.h` does expose low-level `coe5.observe` sites (`DAMAGE_UNIT`, `DOATTACK`, fight/round boundaries). **WEAPON_HIT is a wrap site, not an observe site**: `lObserve` rejects it. `weapon_traits.h` places that site's six-argument call in damage/trait adjustment; it is not a verified final-damage event contract. A transparent wrapper is a possible future investigation, not implemented confirmed-hit telemetry. The registered `unitX`/`unitY` fields are used by map/army code and must not be relabeled battlefield positions. A `RVA_BATTLE_UNIT_POSITION` address exists without an inspected typed read-only getter/calling contract. No address was invoked or raw engine pointer exposed.

The four inspected official/local files `lua_game_data.h`, `lua_game_call_rows.h`, `lua_sites.h` and `weapon_traits.h` have matching SHA-256 hashes. `lua_test_battle.h` differs as expected in the existing roster-v1 development copy. Local `source-inspection.json` retains all five pairs. This task changed neither extraction nor native source/plugin. [Detailed capability table, source inventory and concrete proposal for musical_pianist](../../docs/BATTLE-RESULTS-016.md).

The new view intentionally uses only trustworthy receipt fields:

- The selected battle's table preserves names, native type IDs and instance IDs; it counts lower/higher/unchanged/missing after-HP readings and keeps signed negative HP.
- **Net HP change** is arithmetic across the whole recorded battle. It is never labeled weapon damage, kill count, resistance proof or confirmed hits. No-HP-change is not labeled “missed” or “not affected.” Unknown after-HP remains unknown, not zero.
- Available fire/cold/shock resistance stays per-instance and explicitly before battle. Physical results invent no elemental reading.
- Battle-call return, field closure, record restoration, user observations and visual readbacks remain separate. Merely checking a personal observation cannot populate hit/position facts.
- Comparison readings open automatically for the selected battle. The primary Apply action remains above the expanded readings. The table has semantic column/row headings, a bounded scroll region and keyboard focus. Fixed read failures clear/hide stale rows.
- Existing source conflict decisions, unrelated pending edits, explicit visual-only Apply and separate-copy export are unchanged. Fixed/older result readers and runtime fingerprints remain unchanged.

## Actual desktop evidence

The rebuilt `build/desktop-016-workspace/CoE5Workbench.exe` opened a separate exact copy of Mixed Area Needle through the native Open dialog. Its matching result banner found retained session `cbfecb30b08f4638aff95e283e6dc4c1`, run `b5bb2f4aa8d04e7f87c2a1228f0d9d94`. The agent operated the desktop with explicit user permission. No game was launched or controlled.

The captured app surface was **1107 × 794 logical pixels** at the current display scaling. The first layout buried Apply under an auto-expanded results block; this was corrected and rebuilt before the final check. The unknown-coverage statement was also moved before the table. These are rendered observations, not a headless visual claim.

- [Final Apply/result hierarchy](02-review-action.png): Battle 2, impact 34 → 68 and the Apply action remain above the readings.
- [All six recorded defenders](03-six-defender-readings.png): six instances, two types, four lower-HP/two unchanged-HP readings; instance 3 is `6 → -4`, net `-10`.
- [Visible keyboard focus](04-table-keyboard-focus.png): Tab/Shift+Tab reached the table region and Session details with a visible outline.
- [Battle 1 selected by keyboard](05-baseline-battle.png): Blood Burst #34, no settings changed from baseline, Apply disabled. Switching back to Battle 2 restored Flame #68 and the intended impact-only choice. Both receipts happen to contain identical HP outcomes; synthetic regression cases independently check different per-battle readings.
- [Native separate export completed](06-exported-copy.png).
- [Vanilla target with explicitly SE result](07-vanilla-se-result.png): source/view mode changed without conversion; review still identified CoE5SE / local roster-v1 and recognized the impact already in the draft, leaving Apply disabled by default.

The mouse could not select a native WebView dropdown popup through the computer-use target binding; keyboard Home/End/Return completed selection. Window-resize attempts did not establish a different captured size. Other widths/DPI and real 200-defender rendering remain manual acceptance items. Large-roster DOM coverage is separate below. The older fixed-mixed screen was tested through its actual UI adapter in the offline harness, not rendered from a retained fixed session in this desktop pass.

## Preservation and export

The actual desktop applied only Battle 2's impact to the disposable draft, then used **Export copy** with a new filename:

- `Mixed-Area-Needle.review-copy.c5m`: 257 bytes, SHA-256 `e68c5db9de69641d0fb427cce82058a8f99889809dd68d321b2a6d27293e7eb4`, unchanged.
- `Mixed-Area-Needle.results-view-export.c5m`: 257 bytes, SHA-256 `6e1a127bac15547c36a3875cd1e836ca606762a674d670c611ab7af6d2c3f4cf`.
- Exact equality to the original with only `look 34` replaced by `look 68`. No roster, HP, position, hit or private-carrier metadata entered the native fragment.

All **33 files** in the retained reference session were hashed before and after the desktop/result-reader check: no additions, removals or content changes. Normal game installations/profiles, saves, mods and the official release extraction were not edited. The existing distributable ZIP was not rebuilt/replaced. Local JSON/evidence files remain under this validation folder; no session/profile/runtime data is included in publication.

## Offline verification

- **257/257 JavaScript tests passed**. Eight new cases cover signed HP/state counts, absent after-HP, higher HP, duplicate names with distinct IDs, malformed/duplicate identities, zero/nonzero/unknown elemental readings, 200 discoverable rows, plain-text rendering, unverified cleanup, battle switching, observation separation, pending edits, visual-only Apply, fixed mixed readback and stale-data removal after failure. Existing old-result, conflict, optional-field, source-preservation, single-type and generated-pair tests still pass.
- **35/35 compiled desktop checks passed**, including a new packaging/host-policy check for the results module and guide, plus the prior canonical/legacy result replay and session protections. These are offline checks, not engine tests. They use scratch fixtures and a harmless Workbench test child.
- The real retained result was read through the compiled production `IsolatedTests.ReturnValues`, independently passed through the browser validator and then the recorded-state model. Both real battle packets contain six units, two types, four lower-HP and two unchanged-HP readings. Every model hit/position/attributed-damage field remains null. Local `offline/real-packet.json` and `offline/real-replay.json` record this read-only replay; debug logs were not parsed.
- The Windows x64 desktop publish succeeded using existing locked dependencies, without rebuilding a distribution ZIP or changing the native runtime. Native helper/API gameplay checks were not rerun because their implementation and inputs did not change.

## Remaining capability and next test

This is clearer presentation of recorded state, not new hit attribution or new gameplay. The earlier real area-5 battle remains the only referenced gameplay evidence. Fixed failed/cancelled receipts can have unknown after-HP. The visual summary does not cover non-HP status changes absent from those receipts.

The concrete next requirement for musical_pianist is a field-owned, bounded/versioned observation buffer: battle/attack/parent IDs; verified attacker/weapon/spell and affected-instance identity; phase-qualified battlefield positions; separate attempted/resisted/applied outcomes and HP/non-HP changes; coverage/truncation/error flags; immutable copied results finalized before rollback; and scoped error/cleanup behavior. [Proposal and short manual acceptance steps](../../docs/BATTLE-RESULTS-016.md). Existing low-level wrappers/observers are an investigation route, not proof that this API already exists. Enabling confirmed-hit UI requires a separately verified runtime/fixture and new isolated game evidence.

No fresh in-game validation is needed for the present display-only update. A user can review the retained result now. Narrow/DPI and large-roster rendered checks are the most useful manual acceptance; any later fresh battle must use a new disposable session, then Finish and Quit normally. Vanilla weapon export stays native; this mixed test requires CoE5SE plus local roster-v1.
