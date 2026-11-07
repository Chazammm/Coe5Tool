# Format investigation and source register

Research date: **5 November 2026, Europe/Berlin**. Fresh primary-source checks are recorded in `research/baseline.json`. This record separates format evidence from game acceptance.

Current local 0.4 adds a fingerprint-gated metadata reader for actual historical exports, without changing source edit syntax. The author's spell-display notation is not treated as mod syntax. [Current data evidence](COMPACT-DATA-04.md) records fields, hashes, IDs, distribution and unsupported current-binary constraints.

The original 0.1/0.2 format findings below remain the parser baseline. Version 0.3's current source checks, historical vanilla-name index, native shell/security and failed installed-layout probe are documented separately in [LIBRARY-AND-DESKTOP.md](LIBRARY-AND-DESKTOP.md). No new native mod commands or game-rendering claims were added.

## Existing tools and chosen gap

The official CoE5 Modding extension 0.1.8 already offers block-aware completion, native/custom name suggestions, hover help, numeric tables, syntax/placement diagnostics, typo fixes and go-to-definition. Its README makes broader validation claims; the extension was inspected, not installed or independently gameplay-certified here. This prototype supplies a narrower form/linked-section/change-review workflow, rather than another full language service. [Pinned editor README](https://github.com/musical-pianist/coe5se-modding-tools/blob/85643c49810b502767b37aa663fe34885ad90cdd/vscode-extension/README.md).

`known-words.js` contains only command names from the official 957-record dataset, used to distinguish an unknown directive conservatively. Membership does not prove valid context, arguments or runtime support. Original MIT license/credit is retained in `research/UPSTREAM-LICENSE.txt`. Field help is curated for this prototype. [Pinned upstream data](https://github.com/musical-pianist/coe5se-modding-tools/blob/85643c49810b502767b37aa663fe34885ad90cdd/vscode-extension/data/words.json).

## Verification matrix

| Behavior | Primary evidence | Prototype decision |
|---|---|---|
| Native weapon declarations and scalar fields | [Illwinter native manual, weapon section](https://www.illwinter.com/coe5/coe5modding.html#_weapon_modding), local reference lines782–903 | Inspect newweapon/selectweapon, retain numeric selections/order and chained/non-form commands. No effective-stat simulation. |
| CoE5SE spell shape | [Official spell page](https://github.com/musical-pianist/coe5se-docs/blob/093e5e44536b3a76323aad80eaa1737830579607/docs/commands/spells.md) | Explicit path, level, weapon damage/reference; custom weapon must precede its reference. |
| Spell levels and storage | [spell_table.h 10–12,368–415](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/src/spell_table.h#L368) | Level 1–3; signed 64-bit spell damage; 47-byte spell header and 63-byte quoted weapon reference limits. Decimal values stay exact. |
| Path availability | [spell_table.h 337–360](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/src/spell_table.h#L337) | Docs describe built-in 1–69, but source checks loaded path count. A path such as400 is unresolved here, not automatically invalid. |
| Prefix/file distinction | [sidecar.h 174–185](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/src/sidecar.h#L174) | Decode #!@ in c5m content only. In c5se such lines are comments and cannot create phantom sections. No conversion on mode change. |
| Quotes and delimiters | [spell_table.h 255–271](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/src/spell_table.h#L255), [mod_settings.h 477](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/src/mod_settings.h#L477), official editor README | ASCII space/tab argument separation; literal quotes; unsafe hash/backslash/ambiguous lines remain read-only. BOM recognized only at start. |
| Native numeric record widths | [record_words.h 130–179](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/src/record_words.h#L130) | dmg: 8 bytes, other exposed native integers: 4 bytes. Catch gross storage overflow without claiming every value/signedness is valid. |
| VFX fields | Native manual; same public record map | look/sound/flymode/flylook/flysound metadata only. flyspr is a table heading, not a new command; no explspr invented. |
| Native test field | [lua_test_battle.h](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/src/lua_test_battle.h), [coe5.lua 1645–1706](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/coe5.lua#L1645) | Existing route for future genuine engine testing; no runtime helper or launch in this prototype. |

## Version 0.2 addition evidence

The redesign re-read the pinned official spell page through the GitHub connector (blob d7a268005dc74752f7aa2c605b8fe9ca23cecc6b) and the matching local `spell_table.h`, especially lines 311–320 and 368–377. The former permits varying property order; the latter clears state on newspell and independently assigns level/hasLevel before calling storeSpell. Combined with the already verified sidecar-prefix rules, this supports inserting a level immediately after a safely recognized header.

The supported subset is intentionally narrower than the engine: only one valid path and one valid weapon assignment, no other active commands, no opaque/malformed tail and no unsafe header/prefix. Existing levels remain replacements, not insertions. The patch re-inspects before committing, validates all supplied edits, then applies source spans in descending order. An insertion is a zero-width span; all pre-existing text stays byte-equivalent after UTF-8 re-encoding. Header indentation/prefix spacing/EOL are reused without introducing another BOM or changing the final-newline style. See regression tests and README for exact eligibility.

`examples/missing-level.c5se` uses the documented numeric path 3 / weapon 15 54 spell shape with level intentionally absent. It demonstrates preparation and the missing-field diagnostic; loaded IDs and native acceptance are not established. Native missing scalars, missing path and missing paired weapon assignments remain unsupported. A refusal is a workbench scope limit, not an engine validity judgment.

New help text retains these established distinctions: aoe is a targeting code; flymode 1 uses the sprite catalog and other modes use the look catalog; native dmg and spell weapon damage are separate fields. There is no new VFX renderer, catalog lookup or Lua integration. Public versions were not re-polled for a visual redesign: all format claims above name the pinned baseline, not an assumed latest release.

Source code permits more syntax than this form in places. Read-only rejection means outside the prototype's safe editing subset, not necessarily invalid game syntax. Conversely, passing partial checks never proves a complete mod is valid.

During the original 0.1 investigation, the native HTML was opened successfully and the PDF fetch timed out. Its preceding retained title was 5.41, not a freshly fetched 5.42 manual. Core/docs/tools commits were unchanged from the earlier research. All 180 top-level SDK/API blobs were compared to the public tree and matched; `research/source-checks.json` contains those per-file results. This is source identity, not release-binary or hook/game validation.

The installed game executable matched the retained 5.42 hash initially but changed during the session (last-write 13:29:50 UTC). This work did not write/run/revert it. Current version/cause is unverified; research/environment-drift.json preserves the hashes. All other 330 protected source/mod/research/evidence files matched. Static public-format evidence remains valid for this prototype; future runtime tests need a fresh executable/build check.

## Examples and local project evidence

- `examples/linked-starter.c5m` / `.c5se`: weapon values adapted from the documented Magic Javelin example, plus a new linked spell using the official spell shape. AoE 0 is explicit; undocumented default VFX settings were not invented. These fragments are not claimed gameplay-tested.
- `examples/crab-brine-surge.c5m`: metadata excerpt from the local Crab Cult project, `releases/v0.17/CrabCult/CrabCult.c5m`, lines 100–114. Actual source has dmgtype 2/dmg 6, look 17, sound 88, flymode 6, flylook 197, flysound 89. Full native flags are retained. Current release authority is its CURRENT-RELEASE.json, not the historical root source.
- `examples/abyss-crown-judgment.c5m`: excerpt from the local Abyss project, `Source/Monarch05/AbyssPrototype/AbyssPrototype.c5m`, lines 442–457. Weapon dmg 0 is distinct from the spell's damage 40 in companion `.c5se` lines 137–143 (weapon assignment on 142). The custom path Azure Dominion is defined earlier there; the separate weapon excerpt does not define that school or spell.
- Retained Abyss success logs record path/spell registration, not exact VFX appearance or timing. No project art, proprietary game assets or extracted game code is distributed here.

Earlier SCRIPTEXT research established the official editor/data pipeline, context-sensitive commands and limits of source-only validation. This prototype follows those findings and does not implement any previously proposed native commands. Vanilla weapon fields, implemented CoE5SE spell commands, existing Lua test APIs and future roadmap ideas stay distinct.

## VFX accuracy boundary

This app has **no rendered VFX preview**. An actual native test field would be real in-game behavior within that field's constraints. A future browser preview would need verified assets, frame/timing/blend behavior and matched native observations; a numeric look ID is insufficient. An illustrative animation must be labeled illustrative and kept separate. Free custom VFX graphic registration was not established from the inspected public surface; that is an investigation item, not a claim that all custom VFX are impossible.
