# CoE5 Spell & Weapon Workbench

**Version 0.5 · Windows desktop workbench.** Open a mod source, select a spell or weapon, edit supported values, optionally choose a reference weapon, then review and export a new copy. The desktop workbench now explains those steps in the interface. The source-processing core and separate-copy safeguards are retained.

This repository contains the version 0.5 source, tests, examples and documentation. Build the Windows application with the instructions below. Generated executables/ZIPs, private reference data/cache and machine-specific reports are excluded.

## Start

Build first with the .NET 8 SDK by running `./Build-Desktop.ps1` in PowerShell. Then double-click **Start-Workbench.cmd**, or run **build/desktop/CoE5Workbench.exe**. Keep the entire build folder. Required runtimes: **.NET 8 Desktop Runtime x64** and **Microsoft Edge WebView2 Evergreen**. The checked development environment used Desktop Runtime 8.0.8 and detected WebView2 148.0.3967.54.

The build script produces **dist/CoE5Workbench-win-x64.zip**, an unsigned framework-dependent build. Extract it to a writable folder and run its executable. The installed runtimes are not bundled; this is not an installer or a self-contained runtime. Normal use is offline, without an account, Node.js or a manually opened browser.

To rebuild, run `./Build-Desktop.ps1` in PowerShell using the .NET 8 SDK. The initial restore needs nuget.org access for the locked Microsoft.Web.WebView2 1.0.4314.35 package. `./Build-Desktop.ps1 -SkipRestore` reuses restored dependencies. Follow existing Windows script policies. Browser fallback remains available through Start-Browser-Fallback.cmd.

## Your first session

The app starts with no file open. It offers three starting points without a wizard:

1. **Open mod file** reads a .c5m / .c5se source, or **Try example** opens the linked starter. The example is visibly labeled a definition fragment, not an installable mod. **Browse library** works before a source is open.
2. Select a **spell or weapon in In this source**. The filename, source kind and selected definition are shown. Edit available fields; read-only/unset fields explain why the form cannot change them.
3. For a spell, use **Choose a weapon from the library**. Inspect a library weapon, choose the destination under **Spell in your source**, and read the exact **Weapon reference** change before pressing **Use this weapon**. Other pending values stay untouched.
4. **Apply changes** updates the held draft. Until then, the status says Unapplied field edits and export is disabled. **Review changes** opens the prepared source, history and original comparison.
5. **Export copy** writes a separate new file. A successful native export is shown as exported; cancellation/error does not mark work saved. The original file is never overwritten.

A short next-step guide follows actual state, and the unsaved/error strip stays visible while scrolling. Apply/discard is beside the editor; source text, advanced VFX, extra reference values and provenance remain on demand. Invalid advanced values open their group before focus. The compact stone/parchment workshop styling is retained. Native rendering, keyboard and zoom behavior still need manual acceptance.

## Actual historical values

After importing both supported files, the reference library reads **1,029 spell records and 935 weapon records** from Colonel Dracula joins the Navy's **CoE5 Data 5.33** exports. Their raw SHA-256 fingerprints exactly match the inputs recorded by the official CoE5SE editor tools. Duplicate names are retained with their distinct explicit IDs; names are not used to manufacture IDs.

| Record type | Supported supplied metadata |
|---|---|
| Spells | ID, name, magic path/name, level, spell damage, weapon ID/name, explicitly listed supported spell flags |
| Weapons | ID, name, target rank, range, initiative, damage type, base damage, area code; impact look, flight mode/look, impact/launch sound where explicitly present |

All 1,029 spell-to-weapon ID/name links cross-check when both exports are loaded. The 1,964 records contain 406 unique spell names and 797 unique weapon names. This explains what the older name index lost: IDs and variants, not necessarily names.

This is an **author-exported historical snapshot with selected fields**, not a verified complete current-game catalog. Optional VFX settings omitted by the export remain unavailable; no defaults or verified game-level absence are inferred. A zero is shown as zero. Inapplicable fields are omitted, and applicable missing properties have one concise summary. Weapon details do not list spell path/level. No full definitions or effect previews are synthesized.

### Import the reference files

Press **Import data…** in the reference library, then select either or both files:

- `Spell Data v5.33.txt`
- `Weapon Data v5.33.c5m`

They are available from the [data author's pinned topic and download link](https://steamcommunity.com/app/1606340/discussions/1/3198114142283463845/). Extract the author's archive yourself; the application reads the selected local text files and never downloads data. The data files must be obtained separately from the author; they are not included here.

Only the exact supported raw fingerprints are accepted for value imports. Reformatting, another version, malformed text or unknown fingerprints are refused. Importing the second supported file adds it to the first dataset. Every cache load rechecks fingerprints, and JavaScript independently rehashes source text before interpreting records. No heuristic executable extractor is included.

The spell export explicitly uses **display-only pseudo commands**. Its weapon/name/damage lines are metadata, not CoE5SE spell-definition syntax. The application reads their values and never inserts those lines into a mod.

The earlier `names.json` import remains supported. Its exact known blob identifies the historical official name index; arbitrary indexes retain unknown origin/version. Name-only entries stay name-only. Switching to a name index is remembered on reopen.

### Use a weapon in a draft

Select a spell in your source with an editable explicit weapon assignment, or choose it in **Spell in your source**. Inspect a library weapon and the preview, then press **Use this weapon**. Verified historical records use their explicit numeric ID, preserving variants when names repeat; name-only/documented examples use a safe quoted name. The preview shows which value will be placed in the reference field.

Only the reference input changes. Pending damage and other values remain. The action changes to **Selected — Apply changes**, then **Already assigned** after applying. Missing source/spell, an ambiguous assignment, a name-only reference spell and unloaded effect data each explain the next available action. Pending edits block changing destination spells; they do not block choosing a weapon for the same spell. Historical IDs still require installed-version/load-order checks. A reference spell can navigate to its weapon when matching data is loaded; it is not cloned into source.

## Source safeguards

- Original files are read-only. Edits affect a held draft. Native export uses CreateNew and refuses every existing target, even if the Windows dialog offers overwrite confirmation. The source extension is retained.
- Existing-field edits replace value spans only. Comments, unsupported text, indentation, prefixes, BOM, mixed line endings and final-newline absence remain retained. Export encodes the held text rather than the browser-normalized textarea.
- Supported weapon fields: dmg, dmgtype, range, init, aoe, look, flymode, flylook, sound, flysound. Supported CoE5SE spell fields: path, level, weapon damage/reference.
- One narrow addition remains: an optional missing level in a plain, safe path/weapon spell block. Other commands, ambiguity or incomplete assignments prevent insertion. Other missing fields remain read-only.
- Unknown or malformed content stops later field assignment conservatively. Repeated fields stay read-only. Decimal strings/BigInt avoid rounding large values.
- Source input: strict UTF-8, at most 2 MiB. Native export: up to 4 MiB. Partial checks cover supported shapes/storage bounds, not loaded game IDs, includes, assets, inheritance or gameplay compatibility.
- Unapplied edits block selection/interpretation switching and export. Normal desktop close checks live unsaved state. Export cancellation/error keeps edits unsaved; an older completed export cannot mark newer edits saved. Reset returns to the retained original.
- Source drafts are not autosaved. Reopen returns to the starting choices and reloads the separately cached reference selection. Forced termination cannot be guarded.

In .c5m, #!@ activates extender lines; in .c5se it remains a hash comment. Interpret as changes inspection without converting source or changing its download extension. Examples are definition fragments, not installable mods.

## Current-game data blocker and next diagnostic

The installed executable is still fingerprint 489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55. A fresh read found PE timestamp 0x6aec6a32 and code hash 11ea0b5dc7f80c7ec32efef77e3d0b2e13c10a065786be3cf48982ef94e4bba6. These differ from the pinned CoE5SE 5.42 build's expected timestamp/code hash. Its old table layout remains unsupported for this file; no guessed values were imported.

The next diagnostic is a build/layout profile matching that exact fingerprint and Steam build 26458448, followed by bounded table/sentinel/count and representative-ID validation. Alternatively, a separately authorized clean-game CoE5SE metadata dump could establish current IDs/variants. Neither requires guessing from the old name array, and neither was run in game here. See [research and evidence](docs/COMPACT-DATA-04.md).

## Privacy and effects

The imported exports and cache remain private. The ZIP and public repository exclude private-data/, .workbench-profile/, raw data and machine-specific manifests. The author requests linking to the original topic instead of reposting substantial data; redistribution rights were not established. The distributable still has only the documented Fireball/54 fallback when no private cache exists.

There is no game process/API connection, automatic data download, analytics or source upload. The existing fixed-origin WebView2 security policy, narrow native bridge and new-copy export remain in place. The private profile also holds WebView2 runtime cache; keep the extracted folder writable.

VFX values are metadata only: no effect renderer, illustrative animation, asset preview or audio playback. Area codes are not radii. Flight mode 1 uses a sprite ID in flylook; other modes use look IDs. Runtime appearance, catalog membership and gameplay remain unverified.

## Verification

Run `node --test tests/*.test.cjs` with Node.js; no npm install is needed. **89 tests passed**, including untouched first use, example/native source opening, destination selection/guards, assignment previews and explanations, pending→applied→exported state, existing data/provenance checks, preservation and unsaved logic. Older edit fixtures explicitly choose the real example action; startup tests exercise the untouched empty state.

**Eight compiled native headless checks passed**. The full private reference cache is also checked through the actual scripts/DOM adapter using the first-use→example→weapon→Apply→review→export path. These checks do not create or inspect a desktop window. The public [verification summary](docs/VERIFICATION.md) and checked-in tests describe these results. Detailed workflow/compact reports remain private local evidence and are not included in this repository.

The prior local-content browser restriction was respected. Actual desktop startup/rendering, dialogs, close-warning interaction, native keyboard/screen-reader behavior, resizing/zoom and in-game VFX remain **unverified**. No game was launched or modified.

See [0.5 workflow and self-review](docs/WORKFLOW-05.md), [data evidence](docs/COMPACT-DATA-04.md), [manual tests](docs/TESTING.md) and [roadmap](docs/ROADMAP.md). Earlier review/results remain historical. The user separately authorized this source update after the local development checks. No GitHub release or generated binary is included.
