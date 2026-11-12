# Command diagnostics — 0.18.1

This update distinguishes editor coverage and dependencies from invalid syntax. It does not turn Workbench into a complete CoE5 or CoE5SE validator. Vorochi's actual file/messages were unavailable; his exact issue has not been reproduced.

## Reproduced cases

The released 0.18.0 parser reported no syntax errors for the official 3.3.0 MachineCult examples or the inspected local Crab Cult/Abyss sources. MachineCult's `healhumanarmy` was already recognized. Its ritual, monster, item, event and settings content instead produced many notes labelled unassessed. An external/native weapon name produced a reference warning. These were notes, not evidence that the mod was invalid.

A separate demonstrable coverage gap: `beamwidth 3 lines` inside a weapon was unknown and prevented assigning later range/damage fields to the form. `healarmy` and 19 other registered commands were also absent from the legacy recognition list. Adding all names globally would be unsafe: `battlemap` ends the current spell and clears selected records, while other commands require a particular selected record.

The 0.18.0 desktop also offered a spell-link repair instruction for a standalone .c5se weapon. The new caption explains that the bounded standalone test requires native .c5m source, while a selected linked spell uses the CoE5SE spell route. Canonical generated pairs retain their existing test action.

## What the messages mean

| Message | What it establishes |
| --- | --- |
| Syntax error | A checked rule is violated, such as spell level 4, an unclosed quote, or beamwidth outside 1–15. Only inspected rules are checked. |
| Field check | The value is outside this form's safe editing/storage bounds. This is not a complete engine validity decision. |
| CoE5SE / format; Dependency | A sidecar/prefixed command requires CoE5SE, or the .c5m prefix needs review. Choosing Target does not convert the source. |
| Editor coverage; Not fully inspected | Content is preserved outside this form or grouped section assessment. Its full syntax and dependencies are not certified. |
| Unknown validity | A directive or context cannot be established. Later field assignment stops conservatively. |
| Reference not resolved | A name/ID may refer to a built-in record, another file or dependency. No local match alone is not a syntax error. Ambiguous/later matches still need review. |

Dependency summaries group whole uninspected sections instead of issuing a repeated note per line. Spell/weapon Source checks retain their individual relevant facts. A clean field check is not whole-mod validation.

## Verified command/context coverage

These are versions inspected, not assertions about the first release that introduced a feature. No upstream parser/core code is included in this policy.

| Commands/family | Context | Checked releases | Editing policy |
| --- | --- | --- | --- |
| Spell path/weapon and established spell flags, healhumanarmy/heallivingarmy | Open spell | 2.13.0, 3.2.2, 3.3.0 | Existing fields retained. Both `weapon <damage> <reference>` and `weapon "name" <damage>` map to their actual token spans. |
| onlyaffects, doesntaffect, doubledmgvs, noexplode | Weapon | All three | Preserved additional properties; they do not move the selected record. Their arguments/trait resolution are not comprehensively validated. |
| beamwidth | Weapon | 3.2.2, 3.3.0 | Validate integer 1–15 and optional literal `lines`; subsequent fields may remain editable. Isolated fixture still rejects this extra command. |
| healarmy and dynamic heal&lt;trait&gt;army family | Spell | 3.2.2, 3.3.0 | Preserved; subsequent fields can be mapped. Runtime trait/tag resolution is not certified. |
| battlemap and battleterrain/battlefort/battlereplace/battleweight/battlewhen/battleplane/battlenoscatter/battlescatter/battleobject/battleground | Battle-map section | All three | Boundary, outside spell/weapon form. Later fields cannot leak into the previous weapon. |
| corpsekind | Monster | All three | Outside form. |
| corpsetype; newcorpsetype/newcorpsekind | Monster / declaration | 3.2.2, 3.3.0 | Context/boundary recognition, outside form. |
| needcorpses/excludecorpses/maxraise | Ritual | 3.2.2, 3.3.0 | Outside form. |
| personalmod/nomultiplayer | Mod | 3.2.2, 3.3.0 | Dependency recognized; no record-switch assumption. |

`mr 0` on a monster is not treated as a weapon flag-removal dependency. Conditional event bodies are retained, not indexed as unconditional definitions. Unknown directives, wrong-context recognized commands, repeated fields and unsupported quoting still prevent unsafe assignment. Unsupported form grammar is not automatically labelled invalid game syntax.

## Formats and protection

Official SE instructions permit a .c5se sidecar, or `#!@` lines in .c5m; Vanilla ignores these extension paths. An unprefixed SE spell in .c5m is labelled a format/dependency issue and stays read-only. The editor never adds prefixes or converts imported files automatically. Original text, BOM, mixed line endings, comments, unknown lines and token ordering survive supported edits. Export remains a separate file. Optional command insertion remains narrowly bounded; recognition does not expand test eligibility or authorize dropping commands from a fixture.

0.18.0 runtime/session/result contracts remain supported, with all existing stale/ownership/process checks. No retained session is migrated. Game fingerprints and Lua fixtures are unchanged. This patch does not need a new game test to establish its diagnostic changes, and claims no new gameplay compatibility.

## Evidence and primary sources

- [Local reproduction, regression and package report](../validation/command-diagnostics-0181-20261112/REPORT.md). Private real mod files, exact paths, copies and screenshots are excluded from publication.
- [Official 3.3.0 README and format instructions](https://github.com/musical-pianist/coe5se/blob/b1150f2786e01ba4ebd484cd4633005e003a79cb/README.md).
- Pinned official 3.3.0 source contracts: [spell_table.h](https://github.com/musical-pianist/coe5se/blob/b1150f2786e01ba4ebd484cd4633005e003a79cb/src/spell_table.h), [beam_width.h](https://github.com/musical-pianist/coe5se/blob/b1150f2786e01ba4ebd484cd4633005e003a79cb/src/beam_width.h), [heal_army.h](https://github.com/musical-pianist/coe5se/blob/b1150f2786e01ba4ebd484cd4633005e003a79cb/src/heal_army.h), [battle_maps.h](https://github.com/musical-pianist/coe5se/blob/b1150f2786e01ba4ebd484cd4633005e003a79cb/src/battle_maps.h), [corpse_kinds.h](https://github.com/musical-pianist/coe5se/blob/b1150f2786e01ba4ebd484cd4633005e003a79cb/src/corpse_kinds.h), [sidecar.h](https://github.com/musical-pianist/coe5se/blob/b1150f2786e01ba4ebd484cd4633005e003a79cb/src/sidecar.h), [personal_mods.h](https://github.com/musical-pianist/coe5se/blob/b1150f2786e01ba4ebd484cd4633005e003a79cb/src/personal_mods.h).
- Compared with verified local release source for [2.13.0](https://github.com/musical-pianist/coe5se/releases/tag/CoE5SE-v2.13.0) and [3.2.2](https://github.com/musical-pianist/coe5se/releases/tag/CoE5SE-v3.2.2). Official linked commands pages were not retrievable in this run; claims above use inspected release source and the official README, not guessed documentation.
