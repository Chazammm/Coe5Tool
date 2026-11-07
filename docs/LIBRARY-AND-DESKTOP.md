# Desktop application and vanilla-library evidence

**Historical version 0.3 record.** Version 0.4 now supports exact-fingerprint historical value exports and a compact typed-details UI. See [COMPACT-DATA-04.md](COMPACT-DATA-04.md) for current behavior. The names-only limits and 0.3 publication history below describe that earlier baseline.

5 November 2026 · workbench 0.3 · research and separate implementing-agent self-review. No new independent-agent review was performed. No game was launched or controlled.

## What was built

A Windows x64, framework-dependent WPF application embeds the existing interface and source-processing code using WebView2. It has an app-owned window, native read-only open and new-copy export dialogs, normal-close unsaved checking, a persistent private name-index cache, and the existing arcane workshop/editor workflow. Node is used only for development tests. The executable and ZIP are local build artifacts, not a published release or an installer.

The compiled helper tests and static runtime detection ran successfully without creating an interface window. The earlier browser tool's local-file restriction was respected; the desktop shell was not used to achieve the blocked visual inspection through another surface. Consequently actual window startup/rendering, dialogs, close warnings, resizing, keyboard traversal and documentation windows remain manual acceptance work. Build success and headless native tests do not establish those outcomes.

## Source register and findings

| Source | Exact baseline / evidence | Finding and limit |
|---|---|---|
| [Illwinter native manual](https://www.illwinter.com/coe5/coe5modding.html#_weapon_modding) | Opened 5 Nov 2026; HTML does not establish an installed binary identity | Native weapon selection and editing syntax; documentation examples/tables are not a full vanilla record dump. |
| [Public CoE5SE release](https://github.com/musical-pianist/coe5se/releases/tag/CoE5SE-v2.12.0) | Latest release check: 2.12.0, published 4 Nov 2026 02:44:29 UTC | Existing extender implementation, not proposed native functionality. |
| [Core source](https://github.com/musical-pianist/coe5se/tree/669062bf21ec74cc2530ae0090f28b1ef7797c14) | main 669062bf21ec74cc2530ae0090f28b1ef7797c14 | Source-level record layout/API evidence; no runtime acceptance. |
| [Spell API](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/coe5.lua#L1660) | spellInfo annotations; spell_table.h 21–30; coe5se_plugin.c defines VANILLA_SPELL_COUNT 1029 | Runtime spell metadata is exposed; the workbench does not invoke it. Unique names cannot identify every duplicate/variant record or its ID. |
| [Weapon data API](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/src/lua_game_data.h#L312) | weaponName/DmgType/Aoe; record_words.h 130–179; game_addresses.h 2092–2109,2465–2471 | Runtime access and layout constants exist. These do not automatically validate file offsets in an arbitrary on-disk executable. |
| [Official spell docs](https://github.com/musical-pianist/coe5se-docs/blob/093e5e44536b3a76323aad80eaa1737830579607/docs/commands/spells.md) | docs main rechecked at 093e5e44536b3a76323aad80eaa1737830579607 | Quoted weapon name or numeric reference is supported. The page documents Fireball / 54; that small fallback has no other inferred fields and no verified game-build identity. |
| [Official editor name index](https://github.com/musical-pianist/coe5se-modding-tools/blob/85643c49810b502767b37aa663fe34885ad90cdd/vscode-extension/data/names.json) | tools main 85643c49810b502767b37aa663fe34885ad90cdd; editor 0.1.8; names Git blob 581a1cfee0c071b090714324f76da148aa2641d2 | 406 unique spell names and 797 unique weapon names. No IDs or full spell/weapon definitions. The index is useful for historical name lookup, not current-game completeness. |
| [Index generation provenance](https://github.com/musical-pianist/coe5se-modding-tools/blob/85643c49810b502767b37aa663fe34885ad90cdd/vscode-extension/data/built_from.json) | metadata blob 90bed51d4252b37faf7b1f78f4b2213b665c3de9; source commit ffafed7c8fb33e3eb6deb89c9a0665f1ae7907e6 | Identifies CoE5 5.33 Spell Data and Weapon Data inputs. The current editor release therefore does not imply that its generated names are a current-game snapshot. |

The 1029 vanilla spell records in the core source and 406 unique historical names count different things. A smaller unique-name count alone does not prove omitted names: records can share a name. No complete mapping from names to IDs, variants or current records has been established here.

The earlier 180-file local SDK/public-source comparison is retained in source-checks.json. This task rechecked current public core/docs/tools commit metadata and inspected the relevant matching local sources, rather than claiming a new binary compatibility test.

## Read-only installed executable investigation

The installed Windows executable was read without loading or executing it. A bounded PE-section/RVA probe using the pinned source's spell-table location did not produce a valid name pointer under that layout. The task stopped at that failed structural check. It did not scan for a speculative table, patch a binary, recover assets or advertise guessed records. The current executable's version remains unverified after the historical hash drift documented in environment-drift.json.

No binary importer is included in the application. A future importer needs an independently identified game build, exact fingerprint/layout mapping, checked PE/RVA/pointer bounds, expected sentinel/counts, cross-checked representative records, and negative tests for unsupported binaries. An alternative is a separately authorized clean-game metadata dump through existing CoE5SE APIs. That must record enabled mods and origin, preserve duplicate IDs/variants, and check the engine snapshot before claiming a complete vanilla catalog. Neither path was executed in game here.

## Data ownership, provenance and interaction

- The distributable contains app code, upstream notices and one short documented weapon-reference fact. It contains no game binaries, art, audio, extracted tables, official name index or private cache.
- This machine's private upstream file and app cache contain the exact downloaded name index for personal local use. Upstream publishes an MIT notice, but underlying game-data redistribution was not independently resolved. These data are excluded from the ZIP and ignored by version control; do not share private-data or .workbench-profile.
- A native import computes Git-blob SHA-1 and SHA-256 from raw UTF-8 text. Only the exact known blob gets the historical vanilla-source label. File-provided origin/version claims are ignored. Every cache load recomputes proof; modified files become unknown-origin indexes. SHA-1 is a provenance fingerprint here, not an authenticity/signature mechanism against a hostile package publisher.
- The browser fallback computes the blob hash locally when Web Crypto is available; otherwise origin stays unknown. No private path or content is sent to an online endpoint.
- Current import schema is only spell/weapon name arrays. No imported field values, IDs, Lua, commands or HTML are executed. Unknown/custom/extender origins are not guessed. User source declarations have separate custom/native-syntax/extender-syntax labels.
- Missing fields remain absent and display Not provided. Zero remains zero when supplied by a supported data source. No arbitrary ID is manufactured from array position, alphabetical order or the first matching name.
- Staging a safe weapon name changes an existing editable spell-reference input only. It preserves other pending inputs, requires Apply, and uses the existing source-span patcher. Missing/ambiguous assignments are not created. Spell entries remain inspection-only. The index does not prove load-order safety or runtime resolution.

## Native security and file behavior

The implementation follows Microsoft's [WebView2 security guidance](https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/security) and [local-content guidance](https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/working-with-local-content): a fixed local virtual origin, packaged assets, checked message origins/parameters, narrow messages, disabled host objects and restricted content/navigation. A restrictive CSP disallows network connections, frames, objects and inline scripts. Remote navigation, new browser windows, permissions and browser downloads are blocked; app documentation is a whitelisted read-only native text view. No generic file-path or process-launch bridge is exposed.

Open reads at most 2 MiB using strict UTF-8 while retaining BOM. Export encodes the held draft directly, checks the source extension, permits up to 4 MiB and uses FileMode.CreateNew. It refuses all existing targets, including the original, even after a save-dialog overwrite prompt. It never truncates an existing file. Cancellation/error keeps edits unsaved. A successful older export cannot mark newer edits saved. Source reset returns to an already retained original. Forced termination and disk failures cannot guarantee preservation of an unfinished new copy, but existing source files remain separate.

Normal close queries current renderer state. Failure/timeout conservatively asks before closing; an active native operation must finish or cancel first. There is no source autosave/recovery. Reopen starts a clean example and reloads the separate reference cache. The app requires a writable extracted folder for its private profile, .NET 8 Desktop Runtime x64 and WebView2 Evergreen. The pinned SDK is [Microsoft.Web.WebView2 1.0.4314.35](https://www.nuget.org/packages/Microsoft.Web.WebView2/1.0.4314.35); packages.lock.json records its content hash. Required vendor license/notice files accompany the build. OS-native dialog language follows Windows settings.

## Separate self-review and corrections

| Review concern | Disposition |
|---|---|
| Syntax labels could imply a user-created weapon was vanilla content | Source pane now says native syntax / custom declaration; selected target origin stays unresolved. |
| A names array might be mistaken for IDs, full definitions or current completeness | Separate reference panel, historical version/proof, absent fields, null IDs and explicit partial scope. |
| Imported provenance could be self-declared | Hash computed at import/cache boundary; arbitrary file metadata ignored. |
| Library use might clobber the draft or other pending fields | Stage only an existing safe weapon-reference input, then require normal Apply; regression checks exact source and pending damage. |
| Export cancellation, failure or older asynchronous completion could clear unsaved state | Mark saved only after native write success, track the exported snapshot, retain pending newer edits; regressions cover each case. |
| Reset after export could prompt despite returning to the original | Unsaved comparison recognizes both the original and last exported source as retained. |
| Native modal reentrancy could clear another operation's busy flag | Busy ownership tracked per message; no generic parallel file operations. |
| Missing/unsafe index data could break source editing | Validate before replacing cache/library; bad cache falls back to the documented example. |
| A ZIP could accidentally include private game-derived data | Build stages publish output while excluding .workbench-profile; archive inspection verifies absence. |

## Validation and next steps

Automated results are in desktop-check-results.json and the native/TAP reports. Those are parser/app/bridge/host-helper evidence, not GUI acceptance. No independent review of 0.3 was performed. The original review files remain explicitly historical.

Before treating the desktop workflow as accepted, manually test window startup/resizing/reopen, import and save dialogs, refusal of an existing filename, cancellation, exact downloaded bytes, normal close Yes/No and successful export clearing the warning. Verify keyboard/focus/zoom and both long and empty libraries. Rebuild packaging with a private cache present and inspect its exclusion.

After that, prioritize versioned metadata with IDs/variants and clean origin evidence. Reuse existing CoE5SE native test-field APIs for actual VFX observations under a separately authorized game-testing task. Browser VFX rendering and plane work remain later investigations; no animation, assets or preview accuracy is claimed here.
