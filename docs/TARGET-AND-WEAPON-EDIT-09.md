# Targets and weapon editing in version 0.9

Historical implementation record. Version 0.10 adds [explicit returned values and searchable choices](RETURN-AND-CHOICES-010.md), and reviews the user's later v0.9 test. The original offline-only status below describes the time this document was written. Its assumption that detailed helper messages are always logged is superseded: `coe5.log` requires Enable copious logs. Existing reports remain evidence of their own runs.

Version 0.9 adds two separate features: a Vanilla/CoE5SE target with native weapon creation, and an opt-in in-game parameter experiment for the existing isolated SE spell test. The experiment is implemented and checked offline; **it has not been observed in CoE5**. Earlier Waterball and Spark passes concern the previous fixed-value helper.

## Target and source format

Choose **Target → Vanilla CoE5** for **New weapon**. Enter a unique weapon name, base damage, damage type, range, initiative and area code. Optional effect/sound fields remain available as numeric metadata. **Create draft & review** opens a native `.c5m` fragment; **Export native weapon…** writes a separate new file and refuses existing paths. It adds no spell, Lua, dependency guard or SE requirement. The fragment must still be integrated into a mod and assigned to a unit separately. Native gameplay, asset IDs and the enabled mod set have not been checked.

The creator deliberately supports ordinary nonnegative 32-bit damage, types 3 (piercing) and 4 (fire), positive range/initiative, simple area codes 0–200 and the existing bounded optional settings. These are Workbench creation limits, not engine-wide limits. Creating arbitrary new Vanilla spell definitions is not supported.

Choose **CoE5SE** for **New spell + weapon** and **Prepare test…**. This retains combined `.c5m` or sidecar `.c5se` output and the exact **CoE5 5.43 / CoE5SE 2.13.0** runtime gate. Native weapon-only fragments cannot use the current linked-pair test action; no hidden SE spell is added for them.

**Read as** remains separate. Changing Target retains the opened text, original extension, source interpretation, pending field inputs and source unsaved state. It changes the creation action, dependency notes and field-test availability. Changing Read as changes inspection without converting or renaming a file. Target changes can invalidate an existing SE test preparation; they do not terminate a running process.

## Existing source and partial diagnostics

An existing file remains inspectable and exportable as a **preserved source copy** in either target. Export is not a Vanilla conversion. Unknown text, prefixes, formatting, BOM and line endings retain the existing source-span protections. SE spell fields remain identifiable as SE content even while the Vanilla target is selected.

The compact dependency status and expandable notes distinguish:

- **Requires CoE5SE:** actual `.c5se` containers, active `.c5m` `#!@` content, recognized SE commands, spell/path/plane contexts, known named-path/offset forms, selected `flag 0` forms, and explicit CoE5SE dependencies.
- **Compatibility unresolved:** unassessed commands/arguments, unresolved includes/dependencies, unsupported contexts and metadata outside the weapon-only check. Missing keywords do not establish another command provider. Numeric native spellcasting/learning forms are recognized without claiming the surrounding monster/ritual was validated.
- **Native weapon syntax subset:** recognized weapon declarations and supported native forms only. The accompanying scope always excludes other files, aggregate enabled-mod capacity, references and gameplay. This is not whole-mod certification.

Assessment uses the retained file's actual extension, even after a different Read as selection. In `.c5se`, `#!@` remains a comment. In `.c5m`, prefixed content is skipped by Vanilla. `#!@requires` is diagnosed as ineffective: ordering needs a plain main-file `requires` line. `level` under a new spell is not classified as a native ritual level. Unknown commands invalidate guessed context for later fields.

The classifier is intentionally incomplete; it is not a second game parser. Its small command sets are documented in `target.js`. No automatic stripping, conversion or equivalent Vanilla fork is supplied. Historical references remain labeled **5.33**, with their original provenance; selecting a target does not update their values or IDs.

## Opt-in weapon editing experiment

In **CoE5SE → Prepare test…**, check **Enable weapon editing experiment**, then prepare files normally. It starts disabled each time preparation is opened. Toggling it invalidates the prior package/session binding; preparation itself starts no game. Both `.c5m` and `.c5se` linked-pair candidates are supported.

The canonical mod's associated `newweapon` is its own scratch weapon. This experiment edits that record directly. It does not borrow a built-in weapon, use `standIn`, alter the spell record or dynamically add definitions. The current native setter enforces own-mod writes; the host additionally enforces exact canonical definitions, names, filenames, enabled mods and reviewed helper text.

Only two record fields are writable:

| Control | Choices | What it does not change |
| --- | --- | --- |
| **Type** | 3 piercing / 4 fire | Spell damage, weapon base damage, path, level, VFX and sound |
| **Area code** | 0 / 1 / 5, plus the prepared baseline if different | Full targeting semantics, normal combat, AI or true range |

These are four-byte weapon fields in the pinned source. Integer/preset checks precede writes. **Apply** writes both fields, reads both back and shows accepted values with a new session-only parameter revision. A nil return from `set` is not treated as success. A refusal, exception, partial application or mismatch reports an error, closes the owned field if possible and attempts baseline restoration. A held mouse press queues one action until released.

**Cast once** is blocked while controls differ from the applied values. It also rereads the weapon before firing, and stops if values changed unexpectedly. **Reset targets** closes and reopens only a successfully opened field, retaining applied settings and pending choices. It does not apply pending choices. **Close test** closes the owned field and, after writes, restores both prepared baseline values with readback. No full Fight mode is included.

Each successful field open receives at most one close attempt. A refused open never grants cleanup ownership. If close/restoration throws, the helper reports and logs failure; it does not claim cleanup succeeded or repeatedly close global field state. Exit that disposable session if this happens. These fault paths have mock coverage; actual field restoration still requires gameplay evidence.

The prepared source revision in `session.json` remains the hash of the source format and canonical fragment. In-game edits do not change it, the draft, the manifest or files on disk. `wb_weapon_edit` log lines record a separate parameter revision, action and applied values. There is no return-to-draft operation, external connection, file hot reload or new-spell reload. Reopening after successful cleanup starts at baseline and parameter revision 0.

The original two-button helper remains the default. The native validator accepts only that exact helper or the exact `weapon-edit-v1` template selected by a validated boolean option and matching contract marker. Extra Lua files, modified helper text, different writes and arbitrary experiment markers are rejected. Adding this experiment did not create an imported-Lua execution path.

## Later user operated isolated test

This checklist is **planned, not performed**. You operate the game; the Workbench sends no input. Keep existing campaigns and normal profiles closed or untouched. An already running CoE5 session blocks a new isolated launch; finish it yourself before proceeding.

1. Start **Start-Workbench.cmd** and confirm **DESKTOP / 0.9**. Choose **CoE5SE → New spell + weapon**. Use fresh unique names, path **3**, level **1**, spell damage **8**, base damage **0**, type **4**, range **6**, initiative **1**, area **0**. For an optional visible-effect candidate, the earlier fixed fixture used look **68**, sound **16**, flymode **6**, flylook **65**, flysound **104**; this new draft still requires observation. Create and review it.
2. Open **Prepare test…**, retain the unique generated test ID, choose caster **Spearman**, target **Spearman**, count **3**, and enable **Enable weapon editing experiment**. Click **Prepare files for review** and inspect the manifest, Lua and README.txt. The manifest should say `weapon-edit-v1`; source definitions remain weapon-before-spell.
3. If needed, **Choose game & extender files…** for the verified 5.43 executable and official 2.13.0 plugin. Click **Prepare isolated session**. Follow **Start profile setup → Mods → enable CoE5SE only → Exit → Quit** if shown, then **Refresh status → Start isolated test**. Use only that app-owned disposable session; never force a fingerprint mismatch.
4. In the main menu click **WB test: your test ID**. Confirm the **Weapon editing experiment** panel shows type **4**, area **0**, parameter revision **0**. Capture the field before casting.
5. Click **Type** once (to **3**) and **Area code** once (to **1**). Click **Apply**. Confirm accepted type 3/area 1 and revision 1. Click **Cast once exactly once**; capture the field and damage/result. Do not predict an exact damage amount from these values.
6. Click **Reset targets**. Confirm a fresh field retains the applied values. Click **Area code** once (to **5**), then **Apply**. Confirm revision 2; click **Cast once exactly once** again. There should be **two casts total**, one for each applied configuration. Individual area-hit lines are not separate casts. Damage type does not select matching visuals.
7. Click **Close test**. Check return to the menu. Optionally reopen without casting to check type 4/area 0/revision 0, then close. Quit only this disposable game. If an error or readback mismatch appears, stop the sequence and preserve the logs; do not keep casting.
8. In the Workbench choose **Refresh status → Open session & logs**. Retain `session.json`, `candidate.json`, `coe5mod.log`, screenshots and your observations. Report loaded mod/field, requested and accepted settings, cast counts/results, reset, field close, restoration message and process exit separately. `action=applied`, `cast_requested`, `cast_returned`, `targets_reset`, `field_closed`, `baseline_restored` and `error` are useful log markers. No automatic passing verdict is recorded.

A field cast is forced/item-style and extends some ranges. Even a successful test does not establish ordinary combat, AI, caster eligibility, timing, saves, all area targeting, sound or VFX accuracy. Native Vanilla output needs a separate SE-free gameplay test.

## Sources and maintenance

The scratch-weapon iteration idea was inspired by musical_pianist's older WeaponTester. This implementation uses our existing helper and documented APIs; no supplied WeaponTester code, assets or UI text was copied or redistributed. The local project research under `docs/weapon-tester-and-mode-research-20261106/` records the original comparison and unresolved questions; that private research folder is not included in the application ZIP.

- [Pinned weapon write API](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_get_set.h#L818-L881): own-mod enforcement, types, refusals and storage writes.
- [Pinned field definitions](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/record_words.h#L130-L135): `aoe` and `dmgtype` each have four-byte storage, rechecked against public source during implementation.
- [Pinned test field contract](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/coe5.lua#L3913-L3942) and [implementation](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_test_battle.h#L31-L178): main-menu restrictions, closure and forced attacks.
- [Illwinter native format](https://www.illwinter.com/coe5/coe5modding.html), Weapon Modding: native creation/forms. No new native engine command is proposed or implemented here.

Maintain the readable Lua in `desktop/WeaponEditFixture.lua`; run `node tools/sync-weapon-edit.cjs` after editing it. The wrapper is packaged for the local UI, and the same Lua is embedded in the native validator. `node tools/sync-weapon-edit.cjs --check` and the focused script/native checks detect drift. Exact current verification results and known limits are in [VERIFICATION.md](VERIFICATION.md).
