# Workshop redesign · local version 0.13

Completed implementation and offline verification on 6 November 2026. **Rendered acceptance remains pending.** The user stopped desktop control, then requested continuation without control. No further desktop interaction occurred after that request. No game was launched or controlled, and nothing was published, pushed, installed globally or sent externally.

## What changed

The application now uses a cream writing surface, dark green source rail, brass rules and system serif headings. This is implemented in the real WPF/WebView2 application, with no artwork, external fonts, gradients or decorative cards.

- The starting desk has direct SE-pair, Vanilla-weapon and source-open actions. These share the existing import/creation paths and do not write files automatically.
- Linked spell/weapon navigation appears under the record heading and works both directions. Duplicate source matches show line numbers and remain unresolved explicitly; pending edits block switching.
- Editable fields have optional help rather than always-visible paragraphs. Read-only explanations and errors stay visible. Advanced effects, source checks and prepared source can be expanded. A new definition returns focus to the editor.
- Search separates its result list and selected-entry detail. Names, IDs, category and provenance/version remain visible; partial-name and keyboard selection are retained. The reference library is a separate drawer instead of compressing the editor into three columns.
- Test bench separates participant/setup controls from isolated-session controls, keeps IDs/technical files in disclosures and shows the next action without performing it. It distinguishes preparation, profile bootstrap, explicit start, running, saved-value review and observation recording. One enemy type plus count is unchanged; no waves or mixed groups are added.
- The return comparison keeps v0.12's automatic matching, changed-value selection, per-field conflict choice, safe optional additions, unrelated pending edits and separate-copy export. Its controls use the same visual language as the rest of the app.

The native default changes from 1440 × 960 to 1120 × 800 device-independent units; the existing 640 × 520 minimum remains. CSS adapts panes at 850/620 pixels and bounds dialog scrolling. These are source-level rules, not observed geometry or scaling acceptance.

## Evidence inspected and preserved

The current README, verification/creation/testing/return documents, editor and choice implementations, native isolation/return reader, tests and prior actual desktop evidence were inspected before editing. `source-before/` snapshots 70 implementation/documentation files. The three `before-*.png` screenshots show the actual old v0.12 start, editor and test-preparation views, captured before desktop control stopped. **They do not show the redesign.**

The retained Codex VFX Trial session is read-only:

`%LOCALAPPDATA%\CoE5Workbench\Tests\3bc3ad7e1ef148fdb922af627be9760f`

Its source revision is `89da88dad4211b2568a5d66673ca2d897c60673025017554e88e677ca9eaf350`, launch nonce `67690ee358484641a9f70375cf85ed44`. The saved applied snapshot reports impact 7 → 3 and one completed cast call, with type 4, area 0 and flight 2/7 unchanged. This is previous-run evidence. The user's earlier visual report is separate; no new cast or appearance observation occurred here.

All **491 protected files** retain their SHA-256 hashes, including the retained session, previous exports/evidence and the previously protected game/mod paths. `Codex-VFX-Trial.original.c5se` remains identical to the retained prepared source. Core parsing, return validation/UI logic, choice data/search rules, target assessment and every Lua fixture/dock remain byte-identical to their pre-redesign versions.

## Verification results

| Check | Result | Evidence |
|---|---|---|
| JavaScript tests | **181 / 181 pass** | `script-tests.txt`; includes eight new workflow integrations |
| Native desktop checks | **45 / 45 pass** | `native-checks.json` |
| Native self-contained friend checks | **45 / 45 pass**, exit 0 | `friend-native-checks.json` |
| Final native assembly | Matches the checked assembly byte for byte | `final-build-checks.json` |
| Actual retained result, offline replay | Pass; correct result discovery, impact-only Apply/export, already-returned state, explicit conflict and retained invalid pending edit | `real-result-checks.json`, `actual-result-packet.json`, unique `returned-*.c5se` |
| Export bytes | Match the prior verified returned file exactly | SHA-256 `6f28e6a4460edbfb292048444fe596233302d0e807d0ad8f297f136ffde25775` |
| Static HTML/help links | 255 unique IDs, 74 valid references, balanced markup and approved local help links | `artifact-checks.json` |
| JavaScript syntax | 17 root scripts compile | `final-build-checks.json` |
| Source colors | Eight selected text/background pairs exceed 4.5:1 | Static calculations in `artifact-checks.json`; no rendered accessibility claim |
| Packages | 37 UI/docs files match source in each ZIP; no private data, game/extender binaries, sessions, runtime paths or PDBs | `artifact-checks.json` |
| Generated helper/native-template synchronization | Pass | `node tools/sync-weapon-edit.cjs --check` |

The retained-result replay uses the compiled native reader and actual application scripts in the DOM adapter. It does not test native dialogs, visible focus, scrolling or rendered layout. Existing tests also cover missing optional additions, unsafe/ambiguous sources, unchanged values, pending edits across records and stale/asynchronous result protection.

The canonical package version is now 0.13. Old v0.9–v0.12 packages remain read-only review inputs and cannot be used as current launch candidates. The additional native check verifies v0.12 review acceptance and launch refusal. Retained packages are not rewritten. Headless native tests use fake game processes and one harmless Workbench child process; no game binary or extender is executed.

## Builds and next check

Run `build/desktop/CoE5Workbench.exe` with its supporting files. The framework-dependent ZIP is `dist/CoE5Workbench-win-x64.zip`. The explicitly requested updated friend package is `dist/CoE5Workbench-0.13.0-friend-win-x64.zip`; extract it fully. It includes .NET but still needs WebView2. Both are local test builds, not published/signed releases.

**The single most valuable next step is a user-operated desktop acceptance pass**, especially at the smaller default window: start → edit/link → search → test preparation → retained-result Apply/export. Use [the checklist](../../docs/WORKSHOP-013.md#desktop-acceptance-still-required). No game launch is needed.

No redesigned screenshots, native dialog/focus observations, normal/smaller/maximized rendered results, other DPI checks or independent first-time-user findings are claimed. Static rules and contrast calculations cannot establish those. This is implementing-agent self-review, not independent review. Ordinary combat, AI, true range, timing, saves and general VFX accuracy remain outside the evidence.
