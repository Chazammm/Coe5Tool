# CoE5 Spell & Weapon Workbench

An offline Windows modding workbench for Conquest of Elysium 5 and CoE5 Script Extender. Version 0.3 reuses a source-preserving editor inside a dedicated WPF/WebView2 desktop window, with an arcane stone/parchment/brass interface and a separate searchable reference library.

## Build and start on Windows

1. Install the .NET 8 SDK for the first build, plus .NET 8 Desktop Runtime (x64) and Microsoft Edge WebView2 Evergreen Runtime for running the app.
2. From this folder, run `./Build-Desktop.ps1` in PowerShell. Initial dependency restore requires nuget.org access. Follow the machine's existing script policy; do not disable it.
3. Run `Start-Workbench.cmd` or `build/desktop/CoE5Workbench.exe`. Keep the entire build folder. Normal use is offline and needs no account, Node.js, server or manually opened browser.
4. The script also creates `dist/CoE5Workbench-win-x64.zip`. Extract the whole ZIP to a writable folder before running its executable. This is an unsigned, framework-dependent Windows x64 build, not a bundled runtime or installer.

This repository supplies source and build instructions; generated executables/ZIPs, private data and local caches are excluded. The pinned Microsoft.Web.WebView2 SDK is 1.0.4314.35, with a dependency lock file and vendor notices. After restore, `./Build-Desktop.ps1 -SkipRestore` rebuilds locally. `Start-Browser-Fallback.cmd` retains the browser mode with fewer native capabilities.

## Source workflow

Open a UTF-8 .c5m / .c5se file, paste a fragment or load the example. Find a section in Source definitions; edit grouped fields; Apply; review the prepared source/change history; Export copy to a new filename.

- Originals are read-only. Native export refuses every existing path, including the original, and preserves the source extension. Choose a new copy filename even if the Windows dialog offered overwrite confirmation.
- Existing-field edits replace exact value spans. Comments, unsupported text, spacing, prefixes, BOM and mixed line endings stay retained. Export uses the held text rather than textarea-normalized display.
- Unknown or ambiguous content stays conservative. Partial checks cover selected source shapes/bounds, not full game validation, loaded IDs, includes or effective inherited stats.
- Supported weapon fields: dmg, dmgtype, range, init, aoe, look, flymode, flylook, sound, flysound. Supported CoE5SE spell fields: path, level, weapon damage/reference.
- Only one missing-field addition is supported: opt-in level insertion in a plain, safe spell block with a valid path and weapon assignment. Other commands, ambiguity or incomplete assignments prevent insertion. See the format documentation.
- Unapplied edits block switching/export. A normal desktop close warns about unapplied or unexported edits. Cancel/error does not mark a copy saved. Source drafts are not autosaved; reopen starts with the example. Forced termination cannot be guarded.

## Partial vanilla reference library

The official editor's historical names.json contains **406 unique spell names and 797 unique weapon names**, generated from CoE5 **5.33** data. It supplies names only: IDs, damage, paths, levels, variants and VFX are absent. This is not a verified complete catalog for a current installation.

Use **Import local name index** to open a locally saved copy of [the official index](https://github.com/musical-pianist/coe5se-modding-tools/blob/85643c49810b502767b37aa663fe34885ad90cdd/vscode-extension/data/names.json), or a JSON file with spell and weapon arrays of names. The app does not download it. Native imports are retained in a private `.workbench-profile` beside the executable; keep the app folder writable. Every cache load rechecks its raw fingerprint.

- Exact known-blob matching identifies the official historical index. Arbitrary/modified indexes are labeled unknown origin and version, regardless of self-declared metadata.
- Search, type filtering and pages of 20 keep the library manageable. Missing information displays **Not provided**, never an invented zero or array-position ID.
- Select an editable spell assignment, select a weapon reference, then **Stage weapon name in spell**. This changes one form field, preserves other pending values, and requires Apply. Availability/load order remains unresolved. Spell entries are inspection-only.
- Custom source declarations and native/extender syntax labels remain separate from reference origin. No custom/extender reference catalog or full definition cloning is bundled.

The app's bundled fallback is one short documented weapon-reference example: Fireball / ID 54 from the official CoE5SE spell page, with other fields absent and build-specific ID stability unverified. The historical index and private cache are excluded from this repository and build ZIP because underlying game-data redistribution rights were not independently established. Never publish private-data or .workbench-profile. No game binaries, art, audio or extracted tables are included.

## Effects and security

Visuals/sound are numeric settings only. There is no effect renderer, asset preview, animation or audio playback. aoe is a targeting code; flymode 1 uses sprite IDs in flylook while other modes use look IDs. No in-game appearance is claimed.

The desktop uses a fixed local WebView2 origin, checked message origins and a narrow bridge: open source, export a new copy, import names, read cached names. CSP and host rules restrict resources/navigation; there is no generic path/process API, analytics or game connection. Documentation opens as read-only native text.

## Verification and limitations

Run `node --test tests/*.test.cjs` with Node.js; no npm install is needed. **68 tests passed**, covering the core and actual scripts in a DOM adapter. **Seven compiled headless native checks passed** for file/policy helpers and WebView2 detection. After building, run the executable with `--self-test <report.json>` and wait for exit to repeat those checks.

The Windows x64 executable and framework-dependent ZIP were built locally. Archive inspection checked dependencies, matching UI files and private-cache exclusion. **Actual desktop window startup/rendering, native dialogs, close-warning interaction, keyboard/resizing/zoom and game/VFX acceptance remain unverified.** The existing local-content browser restriction was respected and was not bypassed through the desktop shell. There is no claim of gameplay compatibility or complete accessibility conformance.

- [Verification summary](docs/VERIFICATION.md)
- [Library provenance, desktop security and self-review](docs/LIBRARY-AND-DESKTOP.md)
- [Source format evidence](docs/FORMAT-AND-SOURCES.md)
- [Manual acceptance checklist](docs/TESTING.md)
- [Roadmap](docs/ROADMAP.md)

Current research baseline, checked 5 November 2026: CoE5SE 2.12.0/core 669062bf21ec74cc2530ae0090f28b1ef7797c14; docs 093e5e44536b3a76323aad80eaa1737830579607; official editor 0.1.8/tools 85643c49810b502767b37aa663fe34885ad90cdd. An installed executable layout probe failed safely; its current version is unverified, and no speculative binary importer is shipped. No game was launched or controlled.
