# WeaponTester investigation and comparison

## Artifact and interpretation

The supplied ZIP (local evidence) has only a banner, a 368-line `.c5m`, and a 488-line Lua script, under `WeaponTester/`. No explicit version, license, README or game compatibility statement was found. inputs.json (local evidence) records hashes and member sizes. All WeaponTester line references below identify **members inside that ZIP**, not extracted files. Findings describe source behavior; WeaponTester was not run.

## What it lets a modder do

| Task | Supplied implementation | Qualification |
| --- | --- | --- |
| Start a new weapon draft | Own scratch and blank weapons; values compared with blank defaults | A runtime draft becomes a `newweapon` export, not a dynamically added record. `.c5m` lines 5–17; Lua 77–110. |
| Pick a weapon | Loaded-table picker and numeric IDs in labels; copies selected properties to scratch state | Not a source-file importer or lossless clone of every record field. Lua 57–75, 261–282, 454–460. |
| Pick a spell | Name lookup or loaded spell picker with path/level | Edits its weapon values; does not create or change the spell record itself. Lua 145–153, 261–282, 405–413. |
| Edit | Basic values; impact/flight/sound; chaining; flags; SE trait filters and `noexplode` | Listed schema only. Failed reads are omitted; numeric entry is not comprehensive semantic validation. Lua 13–55, 66–75, 155–171. |
| Fire and inspect | Apply scratch values, read back, fire; draw real battle frames | Current API forces a spell as an item-style cast. A field result does not prove ordinary casting eligibility. Lua 113–142, 419; [API contract](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/coe5.lua#L3913-L3942). |
| Fight and reset | Full field battle, stop control, then reopen; Reset closes/reopens fresh field | Different execution from Fire; stand-in refresh needs a focused check. Lua 359–397, 399–427. |
| Export | Copy snippet or save a new mod | Exports weapon data/changes, not a complete new spell. Lua 77–110, 464–468. |

## In-game loop and dependencies

The `.c5m` creates a scratch weapon, a blank baseline, a Wizard with a ranged scratch-weapon attack, and path-specific spell casters. It declares caster paths **1–69 except 30**; these are monster definitions, not new magic paths or spells. Wizard/casters inherit Old Wizard statistics with weapon/special resets and invulnerability. Targets are **40 Spearmen**. Lua `openField` resolves names and passes either no spell or the selected spell plus the scratch weapon as `standIn` (Lua 124–142; `.c5m` 19–368).

A main-menu **Weapon Tester** button enters a frame loop. BATTLE_DRAW/BATTLE_WAIT wrappers draw the panel, collect actions and run them between frames. Fire, Fight, Reset, mode switching, Copy, Save and Exit are visible source-defined controls; their rendered appearance was not observed (Lua 224–397, 415–488). Hidden UI IDs described as DevTools hooks are not evidence of a desktop communication bridge (Lua 373–397).

All `coe5.*` calls, the Lua UI, loaded-data reads/writes, field controls, clipboard and save API need CoE5SE. The native weapon/monster declarations do not remove that dependency. The old guard at `.c5m` line 3 is still registered alongside the newer guard names in [2.13.0](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/mod_command_hook.h#L141-L149); its wording alone is not a compatibility failure.

## Runtime edits and spell substitution

`applyWeapon` sets the mod's scratch weapon using `coe5.set("weapon", ...)`, catches Lua errors and rereads the accepted values (Lua 113–122). In 2.13.0 the API refuses writes to weapons not created by the calling mod; rule strings, flags and numeric fields take different types. Refusals can be logged without raising a Lua error, which makes readback necessary. Narrow storage fields can truncate an accepted integer. A future editor must validate field storage and semantics, and report requested versus accepted values. [Write implementation](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_get_set.h#L818-L881); [documented lifetime](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/coe5.lua#L600).

**Source-backed inference:** supported weapon edits can be tried repeatedly without restarting CoE5. Reset/picking a spell recreates the field, not the process. Pick lists are cached and use fixed scans (spells 0–4100, weapons 1–6998); name lookup takes the first match. Future capacities, duplicate spell names and custom caster paths need explicit handling. Lua 145–153, 261–282; the current native spell-info API returns nil outside its table. Changes last until mods are reread; edited disk files and newly declared spells are not reloaded by this mechanism.

With a spell selected, the field saves its weapon record, substitutes the scratch record's non-name bytes, refreshes that substitution on Fire, and restores the saved record on close. This is temporary mutation of a loaded weapon, not a spell-definition editor. Spell damage remains a separate spell-record value: changing base weapon damage does not establish a changed spell damage assignment. [Substitution and close](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_test_battle.h#L31-L50), [open and Fire](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_test_battle.h#L134-L178); [spell metadata](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/coe5.lua#L3907-L3911).

Two static concerns deserve tests, rather than a claim of confirmed defects:

- **Fight freshness:** WeaponTester applies scratch edits before Fight, but the native Fight entry does not recopy stand-in bytes. An edit after opening the field may reach Fire but not a subsequent Fight unless another action refreshed the substitution. Compare the first Fight directly after an edit with Fire, using fresh targets. Lua 419–426; [native Fire/Fight](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_test_battle.h#L164-L193).
- **Stand-in range:** Fire adjusts the selected weapon's range before copying stand-in bytes. That copy can replace the adjustment. Do not promise every stand-in attack has the documented extended reach without a test. Same native lines 166–178.

## Visuals, sound and damage

The panel exposes impact look, flight mode/look, sound, launch sound, volume, reload sound and color flags. It includes hardcoded labels and decoders, plus `coe5.lookName` for some effect names (Lua 13–42, 175–220). These are useful semantic controls, but not a separate desktop renderer. A live field would show actual game rendering/audio on that runtime; this research did not observe it. A `lookName` is a table label, not an accuracy guarantee, and a flight sprite ID is not always an effect-table ID. The unversioned “No effect in this version” annotation for lob must not become a current-build rule. [Look-name API](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/coe5.lua#L3944-L3947).

Damage, type, area, rank, chains and flags can interact. The Wizard also assigns ranged-attack damage 10 at `.c5m` line 24; its interaction with scratch base damage needs checking. The existing Waterball pass used spell damage 5, weapon base damage 3, piercing type 3 and area 5, yielding a logged 4-damage hit. It is not a fixed damage expectation for every weapon or target. Hydromancy and a water-themed name do not determine VFX or damage type. Actual evidence (local evidence).

## Export and restoration concerns

Weapon mode exports differences from the blank weapon. Spell mode exports `selectweapon` by the original weapon's **name**, with changed properties; other content using that weapon may also change. Removing a true flag emits `clearwspec` plus remaining true flags in its schema; SE entries get `#!@` (Lua 77–110). This is reconstructive export, not preservation of imported source.

Round trips need separate checks for duplicate names, quote/newline handling in user-entered names, omitted properties, inheritance and chains. Setting a trait string to empty emits no line; removing a chain emits no replacement. A `clearwspec` triggered by another flag removal also clears SE trait rules, while unchanged trait strings are not necessarily re-emitted. These are concrete **source-derived risks**, not observed failures. The [SE clear hook](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/weapon_traits.h#L189-L192) supports the latter concern.

The current `saveNewMod` API writes `<name>/<name>.c5m` and a generated banner in the selected profile's mods directory, refuses existing folders, and adds metadata. It does not infer extender dependencies from the snippet or parse it for correctness; a failed write may leave a partial new folder. Copy just puts text on the clipboard. [Export implementation](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_mod_export.h#L94-L124). A generated SE-dependent snippet must not be advertised as fully functional in Vanilla simply because `#!@` is ignored there.

Normal Exit closes the field. The script lacks an encompassing protected cleanup around its loop, and calls close unconditionally even after an unsuccessful open (Lua 474–485). Native open rejects an active game/already-open field; close uses global field state. A search of the pinned release found `closeTestFieldNow` calls only in close and the one-shot battle wrapper. Error and refusal ownership/restoration therefore need explicit tests; do not infer universal cleanup from the happy path. [Native checks](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_test_battle.h#L53-L75).

## Comparison and useful adaptations

| Aspect | WeaponTester source | Current Workbench 0.8 |
| --- | --- | --- |
| Data | Live loaded tables, cached pick lists, older fixed scan bounds | Historical 5.33 private references with IDs/provenance; source text kept separately |
| Creation | Scratch weapon/export; existing spell's weapon | Canonical new linked spell/weapon pair with spell path, level and damage |
| Editing | Many runtime properties, no source import | Small supported fields; exact source-span patches preserve unknown text |
| Testing | Repeated edits and Fire in one process; Fight and Reset | Immutable prepared revision; edits invalidate launch; new isolated session after preparation |
| Isolation | Mod runs in whichever profile enabled it; main-menu-only field | Exact runtime hashes, app-owned disposable profile, existing-game conflicts, explicit user start |
| Evidence | No current gameplay evidence for this archive | Specific `.c5m` and `.c5se` real tests, with limits recorded |

Build on the Workbench's source safeguards and isolated launcher. Independently adapt the scratch-weapon idea inside its reviewed helper, add only allowlisted fields, verify readback, and provide a reviewed export/import of the resulting draft. That needs helper and native package-validator changes, not necessarily new CoE5SE APIs for the first in-game-only loop. A desktop live connection is separate work with no verified transport here. Do not embed the supplied script or weaken arbitrary-Lua rejection. See the implementation plan (local evidence).
