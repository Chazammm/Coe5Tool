# Find and observe built-in spells and weapons

This source update adds **Vanilla library** to the desktop header. It is separate from the editor's Vanilla/CoE5SE target and from the historical **Reference library**. Opening it never converts, replaces or applies changes to a draft.

## Use it

1. Run **Start-Workbench.cmd**, which now opens `build/desktop-0161-vanilla-library/CoE5Workbench.exe`. This is a newer source build, **not the contents of the existing 0.16.1 ZIP**.
2. Open **Vanilla library**. It reads the already-configured game executable after checking its exact 5.43 fingerprint. If none is configured, use **Load installed 5.43 spells & weapons…** and select your own `CoE5.exe`. Reading does not start the game, require an extender, or cache a game-data dump.
3. Search part of a name or an explicit `#ID`. Category offers spells, weapons or both. Duplicate names retain distinct IDs. The ordinary facts use readable field labels; **Stored fields & flags** keeps the raw metadata inspectable. Documented effect names are labels, not previews or evidence of appearance.
4. **View linked record** follows a spell's explicit weapon ID, or one of the native spells that reference a selected weapon. Links use only the same installed catalog; historical IDs, names and draft records are never joined into it.
5. Choose **Observe original with CoE5SE…**, then prepare files and a new isolated session through the existing test dialog. The runtime must pass the normal CoE5 5.43 / official CoE5SE 2.13.0 checks. The game selects a supported native caster/carrier explicitly. Eligibility is checked there, not promised by the static catalog. **Battle (AI)** may use other attacks, use the selected record several times, or never use it. This is not the generated-pair **Cast once** workflow.
6. After field closure and normal game Quit, use **Previous observations…** for that record, or **Prepared tests…**. Refresh, select the exited observation, and read **Recorded original observation**. Used sessions cannot be replayed. Prepare a new session to repeat an observation.

## What can be discovered

| Data | Available scope | Boundary |
| --- | --- | --- |
| Local Windows 5.43 executable | 1,029 spell slots and 936 named weapon records among 1,200 inspected slots; IDs, duplicate names, explicit spell→weapon links | Exact SHA-256 `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55` only. Pristine tables, not a snapshot of enabled mods. Other builds are refused. |
| Spell fields | Path, level, linked weapon, attack payload and raw flags | Selected fields; not a complete source definition or description of all conditions. |
| Weapon fields | Selected damage, range/targeting, initiative, visual/sound fields, raw flags and chain words | Stored sentinel/negative/encoded values stay raw. Area is a code, not an assumed radius. Weapon damage and the attack payload are distinct. |
| Visual metadata | Flight mode, flight identifier and impact identifier; matching documented labels where supplied | No bundled assets, rendered desktop preview or appearance guarantee. Modes remain distinct; visuals do not set damage. |
| Explicit runtime catalog | Loaded names/IDs and selected fields from a bound isolated editing session | Separate **Game data** workflow; enumeration bounds are recorded per category. Per-entry origin is unavailable, so a runtime row is not automatically a native original or complete definition. |
| Historical references | 5.33 author exports or partial name-only lists | Remain in **Game data / Reference library**. They are not silently substituted for verified installed entries. |

The existing original helper reads the selected ID/name again in game. Spell routes enumerate native casters with matching path/level attack rows. Weapon routes offer matching first melee/ranged-attack carriers and/or a native spell using that weapon. Later, conditional and special attack slots, missing named effect weapons, and records without an eligible native route can be refused. Terrain, target restrictions, immunity and AI behavior can make a battle inconclusive.

## What the result summary establishes

The native reader checks owned storage, canonical candidate/helper text, source revision, staged runtime fingerprints and the launch context before reading that run's `wb-original-1` packet. It does not run a game or repair old files. Missing, malformed, mismatched, running or changed-helper sessions show an explanation instead of an inferred result.

The summary shows the helper's final stage, **battle-call returns**, stop requests, actor/spell/weapon IDs, selected numeric fields, requested targets, process exit code if recorded, and the separately labelled user-reported visual outcome. Requested targets are not spawned instance identities. A numeric-fields-unchanged report is not full-record equivalence or proof of engine cleanup.

This helper has no stable per-hit/position observation API and does not count native AI casts. The summary therefore **does not confirm selected-record use, hits, damage, target positions or visible effects**. Use the combat log and actual observation for those claims. Raw debug logs are available for inspection but are not parsed into an automatic hit verdict. A close-call return is distinct from seeing the main menu and a normal game exit.

## Copies, exports and remaining dependencies

Original observation writes no spell/weapon definition or setter, does not extend range, and does not pass a stand-in. It exports no editable original and has no values to apply to a shared built-in. The pinned APIs do not provide a verified full copy of all record words, flags, chains and spell payload/flags. Copying the few displayed fields would be a reconstruction with potentially different behavior. The interface says this directly; create a separate new definition in the editor instead. Existing mod-file editing, selected-definition tests, protected value return and separate-copy exports are unchanged.

All current observation fields require CoE5SE. Vanilla weapon creation/export remains native; a reproducible Vanilla-only map/combat fixture is still a separate dependency. No game files, catalog dumps, assets, runtime binaries, profiles, saves or personal sources are included in this source update.

## Evidence and next check

[Current verification](../validation/vanilla-library-20261109/REPORT.md) separates offline, desktop and game evidence. Prior [Fireball AI/VFX capture](../validation/fireball-vfx-016-20261107-30f946/REPORT.md) and [Fireball/Spear AI use](../validation/original-records-016-game-20261107-b325b5/REPORT.md) remain bounded historical observations, not new tests of this interface.

The rendered library → linked weapon → previous observation → preparation-preview journey has passed at the current Windows size/scale. Native isolated-session preparation and a new game were not run in that desktop follow-up. When a new game observation is desired: select **Fireball #445**, prepare a new session against one Spearman, select **Pyromancer #55** if offered, open **WB test: the new test ID**, choose **Battle (AI)** once, note actual named casts and visible flight/impact separately, **Close**, then **Quit** at the main menu. Refresh in Workbench and inspect the recorded summary. Do not replay a completed preparation or treat a battle return as a cast count.

Implementation evidence: [read-only catalog](../desktop/VanillaCatalog.cs), [new summary reader](../desktop/OriginalResults.cs), and the pinned 2.13.0 [field lifecycle and stand-in distinction](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_test_battle.h), [spell layout](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/spell_table.h) and [record words](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/record_words.h). These APIs were checked in the verified local source extraction; no claim is made about unpinned newer versions.

The fresh Fireball #445 session has now completed the full Library workflow in the real game after the user delegated operation to the agent. One native AI battle produced two named casts, captured flight/impact, closed the field and quit with exit code 0; the fresh bound summary was reviewed in Workbench. See the [actual game evidence and limits](../validation/fireball-library-manual-20261109/agent-game-20261109/REPORT.md). The completed preparation must not be replayed. No new package was built.
