# Proposed target selector and user workflow

Everything in this document is a **design proposal**, not a description of controls already added. The current app's Read as `.c5m / .c5se` only changes source interpretation. Retain that distinction and source preservation. Current UI (local evidence), current safeguards (local evidence).

## Separate target from file syntax

Add a labeled **Target** choice: **Vanilla CoE5** or **CoE5SE**. Explain each once: “Native weapon output” and “Weapons, new spells and the experimental test field.” Show **Source format** separately as `.c5m` or `.c5se`. A new draft asks for its target explicitly; opening an existing file classifies it before enabling a validated build. Remembered preferences may preselect, but never silently certify an imported draft.

Keep a third status independent of those choices: **Compatibility: checked subset / requires CoE5SE / unresolved**. Show “Checked for native syntax; gameplay untested” rather than a blanket “Vanilla compatible.” State target game version and reference provenance beside the status. Runtime testing shows the separately fingerprinted **5.43 / 2.13.0** pair. Changing Target changes available creation actions and diagnostics; it does not change source bytes, prefixes, filenames or meaning.

## Controls and exports

| Area | Vanilla target | CoE5SE target |
| --- | --- | --- |
| New draft | **New weapon** | **New weapon** or **New spell + weapon** |
| Supported first fields | Name, base damage, type, range, initiative, area; optional impact/flight/sound values | Same weapon subset; linked spell path, level, damage/reference |
| File generation | Native `.c5m` fragment; separate reviewed mod packaging can follow | Combined `.c5m` with prefixed spell lines or `.c5se` definitions with main `.c5m` metadata |
| Imported spell/SE lines | Visible preserved text and dependency diagnosis; no claim they are native | Existing supported forms editable; unknown forms retained read-only |
| Experimental field | Disabled with “Requires CoE5SE. No Vanilla test field is available.” | Existing **Prepare test…** for the canonical pair; arbitrary sources still excluded |
| Source export | **Export preserved source copy** with unresolved/SE notices | Same operation; preserves text without asserting full compatibility |
| Validated generation | **Build native weapon fragment**, only for an eligible bounded draft | **Build SE fragment**; required dependencies shown in package review |
| Reference data | Historical 5.33 values with IDs/provenance | Same; enabling SE does not update data to 5.43 |

Standalone weapon testing is not currently implemented even in SE mode: the existing test validator requires a canonical linked pair. Add that route deliberately in a later helper change; do not quietly create an SE spell while the user chose a Vanilla weapon.

Initially reuse the existing conservative creator's numeric/name subset, with weapon-only validation separated from linked spell validation. Wider flags, negative damage/masks, chains, special area codes and custom paths remain inspection-only until their serialization and tests are specified. Exact numeric FX/audio IDs remain user input metadata; a dropdown label or thumbnail must not masquerade as a verified game preview. Existing creator (local evidence), test-subset gate (local evidence).

## Existing mixed or unknown files

1. Retain the complete original byte-equivalent text representation, extension, BOM, line endings and comments. Preserve current value-span editing and separate-copy export. Do not unwrap `#!@`, flatten blocks, drop Lua dependencies or move definitions on target switch.
2. Classify at the line/block level: container, active prefix, command, selected record context, argument form, explicit dependency and known capacity constraints. Link each diagnosis to the source line and evidence version. Unknown command/provider, include, inheritance or enabled-mod count stays unresolved.
3. Keep source inspection available in either target. In Vanilla, keep SE fields visible and marked “Requires CoE5SE”; disable native-generation approval for that imported source. Source preservation is allowed without a successful compatibility verdict.
4. Offer **Create separate native weapon draft** only as an explicit fork: display extracted supported values and an omission review (spell, script, dependency, flag or unknown behavior). The original stays open/retained; no conversion is implied. The resulting fragment is a new proposal, not an equivalent port.
5. Do not generate false flags as `flag 0` for Vanilla. Omitting a false flag is safe only for a new definition with established defaults. In a selected/inherited weapon, `clearwspec` can erase unmodeled flags and SE rules; block automatic removal unless the full state and intended reset are known. [Clear hook](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/weapon_traits.h#L189-L192).

A line containing a familiar native word is insufficient for approval. For example, `level` in a new spell depends on the SE block, and a quoted path in a native ability depends on the argument rewrite. Parsing a mixed `.c5m` in Vanilla may simply omit desired functionality. Classification matrix (local evidence).

## Example workflows and output

These are independently authored **proposed examples**, not exported artifacts or game-tested definitions. Fragments lack installable-mod metadata and a discovery folder; no files should be installed from this document.

### Native weapon fragment

Choose **Vanilla CoE5 → New weapon**, enter a unique name and ordinary supported values, review, then **Build native weapon fragment**:

```c5m
# Native weapon definition fragment; gameplay untested.
newweapon "Research Needle"
range 6
init 7
dmgtype 3
dmg 6
aoe 0
```

The generated weapon exists as a definition; nothing here gives it to a unit. A future normal-combat fixture must explicitly assign it and test in an SE-free runtime. Native syntax references are in the matrix (local evidence).

### Extender spell linked to that weapon

Choose **CoE5SE → New spell + weapon → combined .c5m**. Declare the weapon first, then append:

```c5m
# CoE5SE spell fragment; requires an SE-enabled mod package.
#!@newspell "Research Needle Cast"
#!@path 4
#!@level 1
#!@weapon 6 "Research Needle"
```

Path 4 is Hydromancy in the verified Waterball evidence; it does not assign water visuals. The spell's damage value is separate from weapon base damage. A **complete SE test package**, rather than this fragment, puts the following plain lines in its main `.c5m` after icon/description:

```c5m
needs_script_extender
requires CoE5SE
```

The guard intentionally rejects a Vanilla load; `requires` orders enabled scripts and does not enable SE. Keep it unprefixed. This follows [official loading rules](https://github.com/musical-pianist/coe5se-docs/blob/main/docs/commands/mod-loading.md).

For a `.c5se` version, put the weapon definition and the following **unprefixed** spell definition in the sidecar; retain main `.c5m` metadata/guard/dependency. Do not rename only the fragment and call it a complete mod:

```c5se
newspell "Research Needle Cast"
path 4
level 1
weapon 6 "Research Needle"
```

Both spell forms follow the [documented SE syntax](https://github.com/musical-pianist/coe5se-docs/blob/main/docs/commands/spells.md). Switching target back to Vanilla would leave them intact and block native generation, with a separate-weapon-fork option.

### A command whose arguments change its dependency

In an appropriate monster definition, the numeric form below is native; the quoted-name form uses SE's path translation. They are illustrative lines, not a complete monster definition:

```c5m
spellweaponbonus 4 1
# Alternative for an SE-targeted monster, not an additional line:
# spellweaponbonus "Hydromancy" 1
```

Show “Named path requires CoE5SE” at the second form if encountered as an active command. Do not silently replace it using a historical path guess. [Argument rewrite](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/spell_paths.h#L170-L226).

## Acceptance states

Keep generated, reviewed, prepared, started, field-opened, cast-observed and exited distinct. An output mode or process exit must never mark gameplay as passed. The Waterball log pass remains specific to its exact source revision and runtime; it cannot carry forward automatically after editing. Proposed runtime-edit results also need their own requested/applied revision, readback and export review. Existing isolated lifecycle (local evidence).
