# Version 0.3 verification summary

Checked 5 November 2026 on Windows x64.

- **68 Node tests passed**: source-span parser/patcher, actual application and bridge scripts in a DOM adapter, reference parsing/search/filter/paging/provenance/missing values, safe staging, export cancellation/error/races and unsaved-state logic. No npm installation is needed: `node --test tests/*.test.cjs`.
- **7 compiled native headless checks passed**: strict UTF-8/BOM/mixed-EOL reads, exact new-copy writes, refusal of existing paths, malformed/oversized input, origin/asset policy, name-index validation and WebView2 runtime detection. Run `CoE5Workbench.exe --self-test <report.json>` and wait for exit. These helpers do not open an interface window or native dialogs.
- The .NET 8 SDK 8.0.402 built a framework-dependent Windows x64 executable and a ZIP. Detected installed runtimes: Windows Desktop 8.0.8 and WebView2 148.0.3967.54. The package carries required SDK/app-host notices; it does not bundle those installed runtimes.
- Archive inspection checks required files, matching packaged UI bytes and exclusion of private data/cache. The local reference import matches Git blob 581a1cfee0c071b090714324f76da148aa2641d2: 406 spell names / 797 weapon names from historical CoE5 5.33 inputs. No complete current-game mapping or definitions are established.
- The source-processing core remains byte-identical to the 0.2 baseline. The 331 scoped protected files outside this tool remained unchanged during the desktop task. Historical executable hash drift from an earlier task remains unresolved and is not treated as current version evidence.

**Not performed:** actual desktop-window startup/rendering, native open/save dialogs, interactive close/reopen warning acceptance, native keyboard/focus/zoom/resizing, screen-reader verification, game launch or in-game VFX/gameplay checks. The existing local-content browser restriction was not bypassed through the desktop shell. Automated logic/native-helper checks do not establish GUI acceptance or game compatibility.

Machine-specific manifests, paths, private caches and raw local reports are not part of the public repository. Local development retains them under research/. Historical documents may refer to those retained reports. This summary and the checked-in tests provide the public verification boundary.

See [desktop/library evidence](LIBRARY-AND-DESKTOP.md) and [manual checklist](TESTING.md) for remaining acceptance work. The original 0.1 independent review is historical; version 0.3 received a separate implementing-agent self-review, not a new independent review.
