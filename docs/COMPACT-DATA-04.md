# Version 0.4: compact workflow and actual reference values

> Publication note: the user separately authorized uploading version 0.5 after development. Statements below about local-only work describe that development phase. Machine-specific manifests, raw local reports and private reference data are excluded from this source snapshot.

5 November 2026, Europe/Berlin. Local development only. No push, PR, release or external message. No game process was launched or controlled. This is a separate implementing-agent self-review, not an independent review.

## Local versus published baseline

The repository was read before changes. main remains 5ceda1cc8a1a9f7d8bfbff3192e1d0725e71788a, the verified 41-file version 0.3 snapshot. At task start, local file hashes matched all those files except README.md, whose local edition documented the personal cache/build. Local-only research, builds, private data and publication staging were not treated as published source. A new before/after snapshot protects the same 331 external paths; earlier evidence remains retained.

## Routes investigated

| Route | Evidence and status | Decision |
|---|---|---|
| Native manual and official editor | [Illwinter weapon manual](https://www.illwinter.com/coe5/coe5modding.html#_weapon_modding); editor 0.1.8/tools 85643c49810b502767b37aa663fe34885ad90cdd | Numeric fields/syntax and generated provenance are useful; names.json alone has no values or IDs. |
| Existing structured export | [Colonel Dracula joins the Navy's original pinned data topic](https://steamcommunity.com/app/1606340/discussions/1/3198114142283463845/) and its author's linked 5.33 archive | Implemented private local import. Exact file hashes match the official tools' build inputs; explicit IDs and selected values can be read without running a game. |
| Installed executable | Full fingerprint, PE headers, Steam build ID and code hash read without execution | Pinned 5.42 layout refused: current timestamp/code hash differ. No table scan/extractor is shipped. |
| Existing CoE5SE APIs | [spellInfo](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/coe5.lua#L1665); [weapon data access](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/src/lua_game_data.h#L312) | Later route for a separately authorized clean-game dump. No Lua/game integration added here. |

Current public release/core/docs/tools checks still identify CoE5SE 2.12.0, core 669062bf21ec74cc2530ae0090f28b1ef7797c14, docs 093e5e44536b3a76323aad80eaa1737830579607 and tools 85643c49810b502767b37aa663fe34885ad90cdd. These are source versions, not evidence that the installed executable matches them.

## Exact historical inputs

The original author's topic links to [CoE5 Data 5.33](https://drive.google.com/file/d/158zH0CB4gzd23VeupKylLZ1FuJGYia9T/view). The archive was downloaded for private research and only the two requested text exports were read/extracted. Raw files and archive stay under private-data/ and are excluded from packages/public snapshots. No credentials, license keys, game binaries or assets were fetched.

[Official editor built_from.json](https://github.com/musical-pianist/coe5se-modding-tools/blob/85643c49810b502767b37aa663fe34885ad90cdd/vscode-extension/data/built_from.json), blob 90bed51d4252b37faf7b1f78f4b2213b665c3de9, records these same inputs:

| File | Exact raw SHA-256 | Parsed coverage |
|---|---|---|
| Spell Data v5.33.txt | 4e2b600507274432a386de00340805261a0d465384f98f622a7b2f180cb903b8 | 1,029 explicit IDs, 0–1028; 406 names |
| Weapon Data v5.33.c5m | 536e717c3395cd0c5618634c62a2d649e417dc99a08f8e4cbbe2180d734777bb | 935 explicit IDs, 0–934; 797 names |

This establishes source identity with the editor's historical inputs. It does not independently certify every interpretation in the author's extraction, completeness of all game internals or current-game compatibility. The author's post notes possible extraction mistakes and asks readers to link rather than repost large portions. No larger dataset is redistributed.

The spell file explicitly explains that its command words are invented display notation. Its weapon name/reference and damage are separate metadata lines, unlike CoE5SE's real weapon assignment. The metadata reader never passes this pseudo syntax to the source editor or generates definitions from it.

## Reader rules and supported fields

- Native host and JavaScript independently hash the exact UTF-8 text. Only those two raw fingerprints acquire value-export provenance. Filenames, self-declared versions and supplied hash strings cannot confer it. No normalization is attempted; modified line endings/BOM/content are unsupported.
- Parsing is bounded and read-only. IDs are taken from each declaration's explicit numeric comment. Counts, unique IDs, expected ranges, required scalar shapes and spell levels are checked. Names can repeat without deduplication.
- Spells provide path/name, level, damage, effect weapon ID/name and the explicitly listed supported flags. All 1,029 links match the imported weapon ID and name when both files are loaded. An absent flag means only not listed in this export, never proven engine-level absence.
- All 935 weapons supply target rank, range, initiative, damage type, base damage and area code. Explicit optional coverage: look 494, flymode 326, flylook 271, sound 655, flysound 322. Omitted values stay unavailable; no default zero/silent sound/absent effect is inferred.
- Decimal values remain text, preserving exact large integers. No dice/expression evaluation, asset lookup, effective-stat calculation, flag-mask inference, raw-source cloning or VFX simulation occurs.
- Missing data and not-applicable are separate states. Type-inappropriate rows are omitted. Known zero is displayed. Missing applicable fields have one summary; actual extra values appear on demand.

Source field names are interpreted using the official native manual and pinned CoE5SE field map. The import provides the source's selected values, not a reconstruction of every native weapon behavior. The source editor's checks continue to be partial and do not validate IDs against these historical files as if they were installed game tables.

## Current executable: why a binary importer is not used

The fresh read found full SHA-256 489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55, timestamp 0x6aec6a32, image size 0x13728000, and .text virtual-size SHA-256 11ea0b5dc7f80c7ec32efef77e3d0b2e13c10a065786be3cf48982ef94e4bba6. Steam's local app manifest reports build 26458448. The game's human-readable version was not established.

The [pinned core's known-build row](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/src/coe5se_plugin.c#L1194) identifies 5.42 using timestamp 0x6ada0282 and code SHA-256 d39ea78899effadc76a0214b2eb5c8bcbd4aac5991f7862aaccb48a99ff4bfa8. Its [hash implementation](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/src/game_code_hash.h) hashes the .text virtual size. The current file differs on both checks. The old table-location probe remained structurally invalid; a bounded nearby diagnostic was not promoted into an extractor or trusted dataset.

Exact next diagnostic: obtain a source/layout profile matching the observed full/code fingerprints, timestamp and Steam build, then validate PE/RVA bounds, table sentinels/counts, explicit representative IDs and duplicate variants before enabling any reader. Alternatively record a clean game's version, enabled mods and full ID-bearing metadata using existing CoE5SE APIs in a separately authorized task. Do not relabel the observed file as 5.43 or another version from its timestamp alone. No data from it was imported here.

## Integration, cache and security

The same native import operation accepts the exact text exports or a single legacy JSON name index. One supported export may be imported first; the other adds its dataset. Private raw exports are serialized in .workbench-profile/data-files.json; library-choice.json remembers whether the latest selection was exports or names. Both native and UI readers revalidate on reopen. Cache validation failures retain the documented fallback and leave source edits untouched. Legacy names stay supported but do not acquire invented fields.

Follow effect uses the spell's explicit weapon ID. Stage weapon #ID uses that historical record ID so duplicate names remain distinct. The existing form's reference token alone changes; pending damage/other fields remain and Apply is required. Read-only or ambiguous assignments cannot be bypassed. Names-only entries use the earlier safe quoted-name route. No spell definition is cloned.

Native copy export, strict source decoding, close-state checks, fixed-origin WebView2/CSP and restricted bridge remain. The new script is explicitly packaged and allowlisted; no generic filesystem/process API was added. The private cache and raw files never enter the ZIP. The application itself performs no automatic network download.

## Interface and self-review

The compact wordmark, toolbar and status strip replace the large header and decorative seal. Source definitions, parchment editor and reference lookup remain distinct. Apply/Discard is above fields, VFX is an expandable group, and errors force relevant advanced fields open. Source/check scope, provenance and extra reference values use native details/summary. Flat surfaces and small functional type labels replace gradients and repeated ornamental icons. CSS reflows at 1180/850/600/380px and the native minimum width is 640px. These are implemented rules, not a visually verified layout claim.

Review corrections: optional data never becomes zero; spell-only fields are excluded from weapons; import errors remain visible near the library controls; successful cached load avoids repeated status text; actual IDs preserve duplicate names; raw pseudo spell lines cannot become mod source; unsupported hashes cannot replace the library; advanced source errors open before focus. Existing source-preservation and unsaved tests remain included. The full private dataset additionally passed actual reference UI code in the DOM adapter, with effect navigation and numeric staging.

No new independent-agent review or actual GUI inspection was performed. The earlier local-content browser restriction was respected; the desktop shell was not used as another inspection route. Native rendering/dialogs/keyboard/zoom and engine observations remain planned checks. See TESTING.md and local compact reports for performed versus pending evidence.
