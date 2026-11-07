# Damage types and payloads · v0.14

The tables below describe the generated spell/weapon pair. For a standalone native weapon on v0.16, the private carrier supports slash, blunt, pierce, fire, cold and shock. Its attack-row payload is set during test preparation. Only visuals return from ranged comparisons. [Standalone elemental test and evidence](../validation/standalone-elemental-20261107-174142/REPORT.md).

## Supported workflows

All 25 entries from the documented damage-type table can be selected by name or ID in the creator and search chooser. Selection does not mean every effect has a verified automatic test fixture.

| IDs | Creator / separate-copy export | Isolated CoE5SE field / saved return |
|---|---|---|
| 1 slash, 2 blunt, 3 pierce, 4 fire, 5 cold, 6 shock, 7 magic, 8 fear, 9 poison, 10 acid | Guided nonnegative numeric payloads in the existing 32-bit generator subset | Fixed helper and editing experiment; Type cycles 1–10. Existing piercing/fire remain included. Type, area and existing visual fields can return. |
| 12 special affliction | Searchable documented-bit mask builder; decimal entry also works | Prepared mask and type stay fixed; area/VFX can be tried and returned. No in-game payload editing. |
| 13 special benefit | Same, using the distinct benefit table | Same fixed type/payload boundary. **Default targeting is enemy**; friendly/self targeting needs manual `trgrank`. Ritual/world-map effects cannot be established by this field. |
| 25 animate | Guided **1 = tree / 2 = fungus** selectors for both payload fields | **Blocked**: the helper has no suitable terrain-target configuration. A valid animation fixture has not been established. |
| 11, 14–24 | Explicit **Advanced: export my manual payload** acknowledgement; literal decimal source output | **Blocked** pending the requirements below. No substitute type is chosen. |

The manual-only group is precisely **11, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24**. Its source syntax is supported, but the application does not certify the user's raw payload or complete setup as a working effect. The advanced path uses a nonnegative signed-64-bit source subset; that is a storage/generator boundary, not an assertion about legal engine values.

Fear is not ordinary hit-point damage: the game manual describes a roll against morale. Other damage types can be resisted, delayed or affected by flags; the generator does not infer flags or resistance behavior. Zero on a scalar weapon retains the documented natural-weapon behavior. The ordinary generator bounds are unchanged.

## Mask inputs and editing

The weapon's `dmg` and the spell's `weapon <payload> "name"` value are **separate fields**. Both receive context-sensitive labels. Selecting a type does not overwrite either payload. **Choose weapon payload…** and **Choose spell payload…** change only their named field. The source editor offers the same builder when a type is known, including a spell with one exact named source weapon. An unresolved/ambiguous link stays manual.

Mask selection uses the complete checked manual tables: **38 affliction bits and 35 benefit bits**, including documented values above 32 bits. Search accepts partial names, decimal values or `bit N`. Selections survive filtering. The chosen decimal value is computed with BigInt; bit 17 in the affliction table and bit 14 in the benefit table are not invented. Unknown bits and zero masks are outside guided generation/testing; raw existing source can still be inspected and exported through the source editor. The builder warns before replacing an out-of-subset raw value.

Mask builders do not set target rank, resistance flags or extra commands. Several bits have ritual/world-map meaning or conditional behavior. A battlefield API call/readback does not establish those effects. Names and bit values are documentation facts; no effect artwork, duration, success rate or preview is invented.

The existing conservative source editor remains a source-span editor. It preserves unusual/unsupported numeric tokens and unrelated source rather than redefining them as invalid game data. Guided generation and canonical test preparation apply the stricter damage policy. Original source, pending edits, conflict choices, safe optional visual additions and separate-file export retain their existing safeguards.

## Why the other types stay manual

| ID | Missing evidence or implementation |
|---|---|
| 11 release | Illwinter calls this mirror release; the pinned CoE5SE reference calls it phantasm. Required mirror state and payload meaning are unresolved. |
| 14 charm | The resulting ownership behavior is documented; numeric payload and required resistance/target setup are not specified by the checked command sources. |
| 15 polymorph | No verified transformation-result configuration in this canonical pair. |
| 16 sleep, 17 paralyze | Status behavior is documented; the numeric payload interpretation for a new weapon is not established. |
| 18 summon | No verified summoned-unit/count/placement configuration in the pair/helper. |
| 19 enslave | Commander-status change is documented; payload and required target/resistance setup remain unresolved. |
| 20 swallow | Numeric payload and interaction with caster swallowing abilities/target state remain unresolved. |
| 21 mirror image | Payload and targeting required for a new image-generating attack remain unresolved. |
| 22 corrupt | The damage table identifies morale-based charm, without establishing its payload/setup. |
| 23 banish | Payload, destination and required banishment setup remain unresolved. |
| 24 petrify | Status label is documented; the payload interpretation for a new weapon remains unresolved. |

This does not assert that these effects need particular extra flags, or that the engine cannot execute them. It identifies what the workbench cannot yet generate/test reliably. The next investigation should compare exact built-in attack/spell records and the relevant engine/API paths, then construct isolated fixtures with the right targets. Historical 5.33 data is reference evidence, not a current behavior specification. Runtime ID 26 is mentioned as heal in CoE5SE's reference but is absent from the checked 25-entry modding table; no creation support is claimed for it.

## Test and return contract

The v0.14 canonical helper contract is `weapon-edit-v4`. It checks the loaded spell payload, weapon type/base payload and association before casting. It writes only its own scratch weapon's five existing fields: type, area, impact and flight mode/look. Payloads are not edited or returned. Scalar types may change only within 1–10; masks keep their prepared type. The native candidate validator and result reader enforce the same boundary. The ordinary item-style/range/AI/timing/save limitations still apply.

New result contexts identify `documented-v1`; old contexts retain the legacy 3/4 rule. The saved file still uses its existing schema and source/launch binding. Return cannot change between a special-payload type and an ordinary type, because that would reinterpret a numeric payload it does not return. Unrelated fields stay pending; export remains explicit.

Old v0.9–v0.13 canonical packages remain read-only review inputs. Frozen v0.13 fixed/editing templates preserve exact historical verification. New launches require v0.14. Retained sessions and saves are not migrated or rewritten. The actual older Codex VFX Trial result remains readable and replays impact 7 → 3 without altering its source/session.

## Sources and evidence level

- [Illwinter modding manual](https://www.illwinter.com/coe5/coe5modding.html): Weapon Modding, Damage Types, Special Afflictions and Special Benefits, checked 6 November 2026. The HTML reports an older revision date; it is not presented as a complete 5.43 behavior specification.
- [Illwinter game manual](https://www.illwinter.com/coe5/coe5manual.html): Special Damage, Fear, Charm & Enslave, Sleep and Paralyzation. Describes behavior, without filling in undocumented command payloads.
- [Pinned official editor tables](https://github.com/musical-pianist/coe5se-modding-tools/blob/85643c49810b502767b37aa663fe34885ad90cdd/vscode-extension/data/tables.json): the existing 25-name chooser dataset; local copy is `documented-choices.js`.
- [Pinned CoE5SE source](https://github.com/musical-pianist/coe5se/tree/9e22d27c32ee15392fc370027d00dbc750b5d19b): the already verified local 2.13.0 release source. `coe5.lua` lists type IDs and APIs; `record_words.h` records 8-byte `dmg` and 4-byte `dmgtype`; `spell_table.h` parses/stores signed-64-bit spell damage; `lua_test_battle.h` shows fixed terrain, configurable enemies and a forced attack with extended range. The wrapper does not return proof of a visible effect.

Offline source/API checks and mocks are separate from real gameplay. No newly supported type has received a new in-game observation in this task. Desktop rendering also remains unverified for this revision; the existing app/process was left open and the new build is separate.

## Other browse-only gaps

| Choice | Current use and next dependency |
|---|---|
| Existing spells | Search/inspect only; no safe clone/import workflow. Need complete declaration/flag/weapon/asset reconstruction and provenance. |
| Existing weapons | Can assign explicit source references. Automatic field tests still need the canonical owned new weapon; foreign/shared records cannot be mutated safely. Next: an explicit isolated copy workflow with verified copy semantics. |
| Custom paths | Creator uses built-ins 1–69. Runtime/custom entries need path declaration, load-order and name/ID handling beyond the canonical pair. |
| Effects, sprites and sounds | Supplied IDs can already be used as source metadata. Runtime names/coverage are partial; effects have no desktop preview. Mode-1 sprite editing and sound editing/return are not part of the in-game experiment. Need verified asset/enumeration or audio APIs and a bounded exchange contract. |
| Test participants | Historical variants and current snapshots are searchable. IDs/names are checked at load; stats and complete current coverage are not guaranteed. No mixed groups, waves, friendly-target or terrain-target configuration exists in this helper. |

## User-operated acceptance still required

1. In a disposable draft select Cold by partial name/ID, create both Vanilla and SE forms, and confirm the correct separate payload labels/values and export.
2. Select special affliction and search **Ghost shackles**; confirm decimal **1099511627776**, independent spell/weapon inputs, retained keyboard focus and source preservation. Repeat a high benefit bit and tree/fungus selection.
3. Select a manual-only type: require acknowledgement, show the specific missing setup, allow literal export, and keep automatic testing disabled. Animate should give the terrain-target blocker without manual-payload acknowledgement.
4. Check the generated test text and isolated instructions. Any later in-game test must use a new disposable session, never a retained campaign/profile. Observe type changes, mask readback, cast calls, actual effects and cleanup separately; test special targeting/world-map behavior with a suitable separate fixture.
5. Review a new scalar result and an older retained result. Confirm matching/history, explicit conflict choices, unchanged payloads, and exact separate-copy export. Repeat at a smaller window and record actual scaling. No new gameplay is implied by a desktop check.
