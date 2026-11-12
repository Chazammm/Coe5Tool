# CoE5SE command diagnostics / 0.18.1 verification

Date: 2026-11-12. Starting publication checkout: main b192689b10cea274a3f35ef288f73268270d4002 (released application source v0.18.0 at 184f5b064ad2e1964213eb498ab1f4d3916fd150). Exact Vorochi input/messages were unavailable; this is an investigation of demonstrated related cases, not a reproduction of his exact report.

## Findings and changes

The official 3.3.0 MachineCult files did not produce parser errors in 0.18.0. `healhumanarmy` was already in the recognition list. Three unresolved native/external weapon references were warnings; numerous unrelated sections generated unassessed notes. The problem demonstrated here was misleading scope/severity presentation and incomplete context coverage, rather than proof that the example was invalid.

A disposable source containing source-verified `beamwidth 3 lines` reproduced the separate parser gap in the released desktop: Warning, line 3, unsupported directive beamwidth; later fields were not assigned. Range and damage became read-only. The updated app recognizes the weapon context, checks the documented argument bounds, and can edit later supported fields. A genuinely unknown directive still stops assignment. A wrong-context recognized command also retains a barrier; battle-map/declaration/event boundaries do not leak fields into earlier records.

The patch adds a small context/version policy for 21 registered commands missing from the legacy list, plus the dynamic heal family. It does not globally whitelist these names or validate every argument. It distinguishes syntax errors, field limits, CoE5SE/format dependencies, editor coverage, unknown validity and unresolved references. Unsupported sections are grouped. Both documented spell weapon-argument orders map to their actual token spans without reordering source. The standalone .c5se test explanation now names the applicable limitation rather than asking to repair a generated spell link. Canonical pairs retain their action.

## Reproduction matrix

All real files were read only. Public findings contain aggregate facts, not private mod contents. Before/after models and source identities remain local.

| Input / format | Target assessed | Released parser and editing behavior | Released summary notes → updated groups |
| --- | --- | --- | --- |
| Official 3.3.0 MachineCult .c5se | CoE5SE; retained under Vanilla view | 3 spell blocks; 0 errors, 3 reference warnings. `healhumanarmy` recognized. References are now informative rather than syntax warnings. | 58 → 7 |
| Official MachineCult .c5m companion | Vanilla / CoE5SE | No spell/weapon blocks, 0 parser errors. Sections outside the form, source retained. | 17 → 3 |
| Official CoE5SE.c5se settings | CoE5SE | No inspectable definitions, 0 parser errors. Coverage/dependency only. | 23 → 2 |
| Local Crab Cult release .c5m | Vanilla / CoE5SE | 19 weapon blocks, 0 parser errors. No user file changed. | 1,200 → 8 |
| Older local Abyss .c5se reference | CoE5SE | No inspectable blocks, 0 parser errors; content retained. | 117 → 4 |
| Current local Abyss 3.2.2 prototype .c5se | CoE5SE | 1 spell; 0 errors; one unresolved external reference becomes info. | 137 → 6 |
| Disposable beamwidth/healarmy .c5se and prefixed .c5m | Both targets | Previously unknown-command warnings and read-only later fields; now checked contexts, supported later fields editable. No expanded game-fixture promise. | Grouped additional properties and dependency |
| Disposable unknown directive / level 4 / unclosed quote | Both formats | Unknown tail remains protected; checked invalid level/quote remain errors. Unsupported backslash grammar remains preserved/read-only, with validity unestablished. | Distinct categories, not suppressed |

Target does not change the file container or convert source. Unprefixed CoE5SE content in .c5m is a visible format/dependency concern; prefixed lines and sidecars retain their distinct interpretation. Version facts were compared against verified local 2.13.0, 3.2.2 and 3.3.0 release source. Pinned contracts and limits: [command coverage](../../docs/COMMAND-DIAGNOSTICS-0181.md).

## Automated and native checks

- **338/338 JavaScript tests passed**, including 11 focused new tests for contexts, partial inspection, wrong-context and unknown barriers, both formats/weapon argument orders, grouping, malformed input, browser script loading, pending edits and exact UTF-8 export. Existing creation, selected spell/weapon, result return, old results, mode and source-preservation checks remain passing.
- **117/117 compiled native checks passed** against retained fixtures: import/new-copy export, canonical validation, pinned real file identities for 2.13.0/3.2.2/3.3.0, old result/session review, ownership/stale/process refusals and captured launch intent with substitute child processes. No game was launched by these checks.
- **44/44 additional native checks passed on the exact extracted package** using current 0.18.1 producer-version vectors across all three runtime profiles, including preparation/resume/refusal and synthetic result binding. An initial local test-vector conversion accidentally retained rc suffixes (0.18.1-rc.1/2/3), which were correctly refused. Correcting the disposable fixture's producer version produced the passing run; no application guard was relaxed for that failure.
- The runtime hash profiles, Lua fixtures and game behavior are unchanged. 0.18.0 is explicitly retained when the current producer version advances; sessions are not migrated. No diagnostic gameplay tests were performed or needed for the source/UI correction.

## Actual Windows desktop check

The exact final ZIP was extracted into a fresh folder and audited before launch. The extracted app displayed 0.18.1. Actual window capture measured **1107 × 794 pixels**. Other window/DPI settings and a separate machine were not checked.

Observed using the real native Open/Export dialogs and Workbench controls:

1. The disposable .c5se example opened. Damage/range/initiative/area after beamwidth were enabled, and the unsupported standalone test had the specific .c5se explanation.
2. Range 5 → 6 was entered. Export stayed disabled before Apply. Switching to Vanilla retained the pending 6, the original .c5se format and the retained spell notice; it did not claim conversion.
3. Apply recorded exactly one change. Export wrote a new disposable .c5se file. A byte comparison matched only `range 5` → `range 6`; original bytes remained unchanged.
4. Switching back to CoE5SE and opening the official MachineCult copy showed seven grouped dependency/coverage notes. The dependency explicitly said it was not a syntax error. Its spell fields remained editable; the bounded test still refused `healhumanarmy` rather than dropping it.
5. Source checks displayed the unresolved Heal reference as information: native/external records are possible, not a syntax error.
6. A .c5m control with an unknown directive retained an editable earlier range and disabled later damage. Expanding the other-definition notes displayed a red Syntax error for spell level 4, separately from unknown validity and unresolved references.
7. Workbench closed normally. No game was launched, operated or closed. Existing user files, mods, saves, profiles and retained sessions were not changed.

Private local screenshots: baseline-desktop.jpg, desktop-export.jpg, desktop-machinecult.jpg, desktop-reference-info.jpg, desktop-unknown-barrier.jpg, desktop-syntax-error.jpg. These images and local source copies are not published. This is rendered desktop evidence, not gameplay evidence.

## Verified update package

- Local archive: `dist/CoE5Workbench-0.18.1-win-x64.zip`
- Size: **60,331,902 bytes**
- SHA-256: **271df1e9eb2b31ad363be676c9e8833555545f60b51b06b6f2478d8014f97c04**
- Inventory/privacy audit passed: **89 files**, 88 inventoried plus the inventory itself; x64 self-contained .NET 10.0.15 app. No game executables/assets/catalogs, official/derived extender files, private sessions, saves, profiles, machine-specific paths or credentials detected.
- Startup: extract the complete ZIP to a writable folder, open CoE5Workbench.exe; keep ui/examples/licenses beside it. WebView2 Evergreen is required. No .NET SDK/runtime install is needed. Editing/export work offline; integrated tests require the user's own exact supported CoE5 5.43 and official 2.13.0/3.2.2/3.3.0 files.
- This task prepares the verified update locally and pushes source/documentation. **No new downloadable GitHub release is published here.** Public v0.18.0 and its ZIP are unchanged (SHA-256 89d63fe2470235f45ebee7082f1e90c44915c45d39ede97185a43db40fa3c320).

## Remaining scope

Workbench is not a whole-mod validator. Native/internal command coverage remains bounded; include resolution, custom traits/tags, dependency state and effective engine records are not established by recognition. New recognized commands are not automatically supported by the isolated fixture. Unknown directives remain conservative barriers. No complete game syntax certificate, new runtime compatibility, VFX observation or actual Vorochi reproduction is claimed. His exact file and visible messages remain the most useful next evidence if the problem persists.
