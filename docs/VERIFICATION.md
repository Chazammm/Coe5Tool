# Version 0.5 verification summary

> Publication note: the user separately authorized uploading version 0.5 after development. Statements below about local-only work describe that development phase. Machine-specific manifests, raw local reports and private reference data are excluded from this source snapshot.

Current local script suite: **89 passing tests**. New workflow tests exercise actual untouched first use, source/example identity, destination selection and safeguards, assignment token previews, pending→applied→exported guidance and clear unavailable states. Compiled native headless helpers, full private-cache adapter workflow and package/protected-file checks are recorded under research/workflow-*.json. These are not native UI or engine acceptance. The standalone app and private-data exclusions remain; no push, release, PR or message is performed. See [WORKFLOW-05.md](WORKFLOW-05.md).

## Retained 0.4 baseline

Current local checks: **78 Node tests**, **8 compiled native headless checks**, and full private data/cache integration through a DOM adapter. Exact 5.33 exports provide 1,029 spell / 935 weapon records, with unique IDs/ranges, required scalars and all 1,029 effect links checked. Native import accepts both raw fingerprints and caches privately. Zero/missing/not-applicable details, explicit-ID staging and advanced errors are tested. See [0.4 evidence](COMPACT-DATA-04.md) and local research/compact reports. No GUI, game or VFX acceptance is claimed. Changes remain local; published source is still 0.3.

## Retained 0.3 baseline

Checked 5 November 2026 on Windows x64.

- **68 Node tests passed**: source-span parser/patcher, actual application and bridge scripts in a DOM adapter, reference parsing/search/filter/paging/provenance/missing values, safe staging, export cancellation/error/races and unsaved-state logic. No npm installation is needed: `node --test tests/*.test.cjs`.
- **7 compiled native headless checks passed**: strict UTF-8/BOM/mixed-EOL reads, exact new-copy writes, refusal of existing paths, malformed/oversized input, origin/asset policy, name-index validation and WebView2 runtime detection. Run `CoE5Workbench.exe --self-test <report.json>` and wait for exit. These helpers do not open an interface window or native dialogs.
- The .NET 8 SDK 8.0.402 built a framework-dependent Windows x64 executable and a ZIP. Detected installed runtimes: Windows Desktop 8.0.8 and WebView2 148.0.3967.54. The package carries required SDK/app-host notices; it does not bundle those installed runtimes.
- Archive inspection checks required files, matching packaged UI bytes and exclusion of private data/cache. The local reference import matches Git blob 581a1cfee0c071b090714324f76da148aa2641d2: 406 spell names / 797 weapon names from historical CoE5 5.33 inputs. No complete current-game mapping or definitions are established.
- The source-processing core remains byte-identical to the 0.2 baseline. The 331 scoped protected files outside this tool remained unchanged during the desktop task. Historical executable hash drift from an earlier task remains unresolved and is not treated as current version evidence.

**Not performed:** actual desktop-window startup/rendering, native open/save dialogs, interactive close/reopen warning acceptance, native keyboard/focus/zoom/resizing, screen-reader verification, game launch or in-game VFX/gameplay checks. The existing local-content browser restriction was not bypassed through the desktop shell. Automated logic/native-helper checks do not establish GUI acceptance or game compatibility.

Machine-specific manifests, paths, private caches and raw local reports are not part of the public repository. Local development retains them under research/. Historical documents may refer to those retained reports. This summary and the checked-in tests provide the public verification boundary.

See [desktop/library evidence](LIBRARY-AND-DESKTOP.md) and [manual checklist](TESTING.md) for remaining acceptance work. The original 0.1 independent review is historical; version 0.3 received a separate implementing-agent self-review, not a new independent review.
