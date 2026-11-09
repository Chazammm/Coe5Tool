# Original vanilla record observation · v0.15

For the current source build, use **Start-Workbench.cmd** or `build/desktop-0161-vanilla-library/CoE5Workbench.exe`. **Vanilla library** now provides installed-only search, link navigation and read-only original-result summaries; see [current workflow](VANILLA-LIBRARY-016.md). The existing 0.16.1 ZIP does not contain this source update. The original-record helper/API boundaries below are unchanged; old v0.15 output is retained as a reference.

This is an experimental **CoE5SE AI-battle observation** workflow. It preserves the current draft, including pending edits, and adds no weapon or spell definitions. It does not reconstruct or privately edit an original. On 2026-11-07, the v0.16 desktop app and real 5.43 / 2.13.0 runtime completed two separate observations: Fireball #445 via Pyromancer #55 and Spear #4 via Levy #27. Native AI use, combat-log damage, field close and process exit were observed; brief projectile/impact animations were not captured. See the [bounded game evidence](../validation/original-records-016-game-20261107-b325b5/REPORT.md).

## Use it

1. Run the current v0.16 Windows build through **Start-Workbench.cmd**. Open **Game data**, then **Load installed 5.43 spells & weapons…**. Select your own Windows `CoE5.exe`. The host checks its exact fingerprint and reads it without launching the game. Cancel/error retains the previous catalog.
2. Search a partial name or `#ID`. Choose **Installed 5.43** to exclude older references. Duplicate names keep their distinct IDs. Selected fields appear below the name; spells also show their linked effect weapon's available fields. These are metadata, not complete definitions or previews.
3. Select **Observe original with CoE5SE…**. This action does not change Target or the open draft. Historical entries also have this action in **Reference library**; their ID/name must match the clean 5.43 runtime. Name-only entries must resolve uniquely. Unknown sources, draft definitions and mod-range IDs are refused.
4. Choose an enemy and count; search identifies variants. The helper chooses no caster silently: select a matching native caster/carrier in game. **Prepare test files**, review them, choose the verified 5.43 / 2.13.0 runtime, then **Prepare isolated session**. Nothing launches during preparation. The existing owned-profile and fingerprint checks remain in force.
5. Explicitly **Start isolated test**. If **Start profile setup** appears, follow its separate instructions: enable only CoE5SE in that disposable profile, Exit and Quit, Refresh status, then Start isolated test. Do not start/load a campaign.
6. Open **WB test: your test ID**. Spell mode offers native casters with a matching path/level attack row. Weapon mode offers available first melee/ranged-attack carriers, or spells using that weapon. Search these runtime lists by partial name or `#ID`. A missing carrier/route is an explained refusal, never a substitute.
7. In the field, choose **Battle (AI)** and observe. **There is no Cast once in this mode.** AI may perform zero or several casts/attacks, use other attacks, or never activate the selected effect. Use **Close**; during fighting, **Stop / close** requests a stop and field close. Quit only this disposable game. Refresh in the desktop app and record what you personally observed.
8. **Open session & logs** exposes `profile/coe5se_data/<mod ID>/wb-original-<run>.ini` and the runtime logs. The bound INI records identity, selected public fields, battle-call returns, stop requests and opened/battle/closed/cancelled/error state. It is evidence for manual inspection, not a parameter-return document. Original observations are excluded from **Saved test values**. There are no editable values to apply or export from an original observation.

The dock reuses the existing responsive UI-unit geometry: bottom center beyond a reserved lower-left log lane, upper-right fallback, **Move**, shared draw/hitbox coordinates and stale-resize guards. Initial selection requires 640 × 480 UI units. The field dock requires 384 × 280. In the two real observations, the 1100 × 800 game client (882 × 671 logical captured window including its frame at current scaling) kept controls readable and the event log unobstructed. Battle and Close hitboxes worked. Move, resizing, other DPI settings and long log lines remain unverified in game.

## Data available and its boundaries

| Source | What is available | Version / completeness |
| --- | --- | --- |
| User's fingerprint-verified Windows executable | 1,029 native spell names/IDs and 936 named native weapon slots; selected numeric fields, raw flags and chain references; spell-to-weapon linkage | Exact 5.43 executable. All spell slots 0–1028 and weapon slots 0–1199 inspected; blank weapon slots omitted. Complete names for those pristine table ranges, **not complete definitions, loaded-mod data, assets or all game behavior**. No dump is bundled or cached by the app. |
| User-imported historical author exports | 1,029 spells, 935 weapons and 1,851 unit variants, where imported | 5.33. Typed fields are partial; missing fields do not establish default values. IDs and variants can differ in the installed build. |
| Historical name-only index | Searchable names | Deduplicated, partial; no reliable ID, variant identity, complete stats or current-build guarantee. |
| Explicit isolated runtime export from the existing editing experiment | Loaded names/IDs and selected numeric metadata, with per-category enumeration bounds | Session/load-order dependent; origin of each row is not exposed. Bounded export is not a complete definition/asset exporter. Mod-added IDs remain excluded from this original-native fixture. |
| Documented choice tables | Damage/path/effect/projectile/sound identifiers and documented labels | Versioned reference tables. No full assets, modern completeness guarantee or VFX renderer. |

The static reader accepts only SHA-256 `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55`. It validates PE sections and bounds before using the published SDK's 5.43 table addresses/layouts. It never guesses offsets for another hash. Different ports/builds require a separately verified reader. Spells expose path, level, weapon, attack payload and raw flags; weapons expose selected numeric/VFX fields, raw flags and chain metadata. Negative/default values are shown as stored, not converted into creator inputs. Raw flags and `nextalwayswep` encoding are **not a source-cloning recipe**.

Example from this locally read 5.43 image: Banish spell #226 references weapon #139 Banishment, type 23, attack payload 99. There are other spells called Banish. This establishes an existing configuration, **not what 99 means for an arbitrary new Banish weapon**. The helper leaves its flags, rank, payload and references in place and checks the chosen ID/name again at runtime.

## Why this API route

The pinned public [test-field implementation](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_test_battle.h) opens a field with an original spell and memorizes it on the new unit. With only four arguments there is no `standIn`. `fightTestField` uses the native battle routine. The new helper has no spell/weapon setters, no `fireTestField` call and no stand-in substitution. `coe5.set` is used only to consume the helper's mouse click.

This is intentionally different from two other API paths:

- `fireTestField` temporarily extends some weapon ranges and forces a first-weapon/item-style spell attack. It cannot honestly be called untouched-original or ordinary spellcasting.
- A `standIn` weapon is caller-owned, but the API temporarily copies it into the original spell's shared effect-weapon record and restores that record on close. It is not a no-shared-record-modification path.

The helper compares eleven public numeric weapon fields before/after the battle/close call. It never writes them back. A close return and unchanged fields are limited helper evidence: they do not prove every flag/chain word, allocation or engine state remained unchanged. A cleanup error is recorded and shown; quit the disposable session. Source inspection establishes the intended API calls; the mock tests do not establish real engine behavior.

Runtime carrier discovery uses the pinned [monster attack-row getters](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/coe5.lua#L781-L783). Spell rows 3/6/14/15/19 are interpreted as path/level, not weapon/damage. Only original monster IDs below 2000 are considered. Weapon carrier mode supports row zero of type 1/2. A native monster can retain additional attacks and traits, affecting whether the selected attack occurs. Later/conditional/siege/assassin rows need a distinct fixture. The spell route can still work for a weapon referenced by an original spell. No matching native caster/carrier means a refusal before opening the field.

## WeaponTester comparison and private copies

The supplied `WeaponTester.zip` was read without executing it (SHA-256 `dc231d78603240c4d687750cfb100b234a9663feae1a0c3008cd851c1b808dc2`). Its listed-field copy to scratch is useful experimentation, but omitted/failed reads, extra record words, chains and spell flags prevent treating it as a lossless clone. Its spell stand-in uses the shared substitution above. Its private ranged-weapon caster illustrates a possible standalone fixture, not proof that every weapon becomes a faithful ranged attack. No supplied WeaponTester code, assets or UI text were copied.

The checked public APIs allow writes to caller-owned `newweapon` records. No full lossless weapon/spell clone allocator was found in the pinned contract/source. A faithful private experiment needs a verified copy contract covering all record words, flags, chains/references and original spell payload/flags, plus ownership and restoration tests. Reconstructing a few visible fields does not meet that requirement.

## Standalone weapons, Banish and Vanilla-only testing

An exported standalone weapon has no assigned attacker. A separate CoE5SE test package can equip a private carrier with a supported physical melee weapon or sprite-based ranged weapon. Original-record observation uses existing native units and records. [Private melee](../validation/standalone-melee-20261107T094508/REPORT.md) · [Private projectile](../validation/standalone-projectile-20261107T100248/REPORT.md).

Manual types such as Banish still allow acknowledged creation/export but do not gain custom-payload testing. Their payload, flags, target class, rank and effect-specific conditions are not sufficiently established in the generator. Observing a configured original avoids inventing them; it does not validate a new payload. Terrain effects still need appropriate terrain fixtures.

The [official native manual](https://www.illwinter.com/coe5/coe5modding.html) documents new weapons, assigning attacks to new monsters, spell-casting paths, map/event setup and item-triggered combat spells. Native-only combat fixtures are therefore a plausible separate route, with a disposable campaign/map and explicit setup. No native main-menu test-field equivalent or full weapon-copy command was found in that manual. **This version has no Vanilla-only launcher or test field.** A reproducible SE-free fixture needs its own map, mod, spawn/cast control and acceptance test; name-only spell triggers also need duplicate-name handling. This is a roadmap item, not a claim that Vanilla cannot run custom weapons.

## Validation and next acceptance

The test dialog’s explanation follows the selected mode: generated pairs describe their forced item-style attack/range extension; original observation describes the native AI battle, no forced attack or substitution, and zero/several possible uses. The earlier preflight stopped before input at the user's request. The later v0.16 real journey also exposed unrelated previous-session instructions and spell-only reporting text; those were corrected with separate offline and rendered checks. Previous sessions remain accessible and explicitly named; original observation uses **Visual outcome** plus notes for actual record use. Neither field is an automatic gameplay verdict.

Offline: script tests cover catalog provenance/coverage, name/ID search and duplicates, invalid data, canonical packages, unchanged dirty drafts/targets and explicit preparation. Native checks read the real executable, validate exact original helpers, exercise substitute-process isolation and reject changed code/identities. Mock Lua covers spell/weapon routes, cancellation, no eligible carrier, duplicate names, ID/name mismatch, missing APIs/fields, errors, stop, resize and cleanup. Existing scalar/mask/VFX-return and retained-result checks remain enabled. The Lua VM supplies mocked game APIs and minimal math for its reduced standard library; this is not the installed game.

Remaining acceptance boundaries:

1. The simple spell and first-attack carrier cases above passed for record use and closure. Capture a brief native effect with continuous video or deliberate pause/slower playback in a future new session; still check other window sizes/DPI and Move/resize. The current screenshots establish the log/outcome and control placement, not animation accuracy or audio.
2. Separately try a configured original special spell against suitable targets. AI producing no relevant cast is inconclusive, not a success or proof of a helper defect. Never infer exact cast counts from battle returns.
3. Compare known fields before/after and inspect any cleanup error. This cannot prove normal campaign AI/range/timing/saves, complete record immutability or universal VFX accuracy.
4. Extend the private carrier tests beyond regular melee and sprite-based ranged attacks, and investigate complete-copy APIs before editable original clones. Then investigate a separate native-only map/combat fixture. Do not broaden original observation by quietly switching to forced range or stand-in substitution.

Additional source references: [spell record layout](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/spell_table.h), [record words](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/record_words.h), [addresses](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/game_addresses.h), [native/mod slot boundaries](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/table_move.h). All API claims are pinned to 2.13.0, not an unverified newer release.
