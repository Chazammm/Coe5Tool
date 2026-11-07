# Workbench desktop/library research journal

## 2026-11-05 · local version 0.5

Scope: explain the existing workflow. Startup now offers Open mod file / Try example / Browse library without silently loading source. State-specific guidance, explicit fragment/file identity, source spell destination selection, exact reference preview and Use→Apply→review→export feedback are added. Missing/read-only assignments, name-only reference spells and missing effect data have distinct explanations. Core parsing, metadata provenance, file I/O and data formats are retained. The live assignment preview uses text nodes and preserves other pending fields. New tests exercise these states through actual scripts; native helpers/package checks remain separate from GUI acceptance. Existing local-content restrictions are respected. No game, mod/save/extender write or GitHub mutation is performed.

## 2026-11-05 · version 0.3

User scope: standalone Windows desktop app, a reliable vanilla reference workflow, no game launch or external publication/messages.

Queries/checks used:

- Direct official native-manual URL; public GitHub latest release, main commit and recursive-tree endpoints for CoE5SE/core/docs/tools.
- Read official editor data/names.json and data/built_from.json at tools commit 85643c49810b502767b37aa663fe34885ad90cdd.
- Local rg for RVA_WEAPON_TABLE, RVA_SPELL_TABLE, SPELL_SIZE, WEAPON_SIZE, VANILLA_SPELL_COUNT and spellInfo/weaponName in the previously source-matched SDK.
- Read-only bounded PE/RVA layout probe of the installed executable; stopped on invalid pointer, without data extraction or game execution.
- Microsoft WebView2 security/local-content docs and official NuGet package page; dotnet SDK/runtime and WebView2 installation detection. The um knowledge-base CLI was not available in this shell; existing SCRIPTEXT research supplied the local context.

Primary source links, exact commits/blobs, credibility/limits and the failed-layout result are recorded in docs/LIBRARY-AND-DESKTOP.md. No dead/login-gated source or archive fallback was needed. No screenshot was captured: local-content visual access remained restricted and was not bypassed.

Outcome: WPF/WebView2 compiled x64 app, framework-dependent ZIP, narrow native bridge/export, unsaved close guard, historical reference library with proof and explicit absent values. Private data is excluded from packaging. Retained evidence separates code/headless verification from still-pending GUI/native game checks. No shared-knowledge-base upload, PR, release or message was created.

Follow-up: the user explicitly authorized publishing the finished tool to the empty Chazammm/Coe5Tool repository. Prepare a curated source snapshot after checks; omit private caches/data, local binaries and machine-specific evidence. This overrides the earlier no-repository-publication constraint for that repository only.

## 2026-11-05 · local version 0.4

The latest brief requires local changes only. Read remote main and compared its 41 files with local state: README differed by the intentional local/public editions; source matched before edits. No remote mutation is performed in this phase.

Queries: fresh core/docs/tools/release metadata, official native manual, tools' names/provenance and vanilla-editor readme; primary data-author topic search for Spell Data / Weapon Data 5.33; author's canonical linked archive; local pinned source for known-build/code-hash/layout/API contracts; read-only PE and Steam build checks. A historical monorepo commit lookup was unavailable. The author's raw exports match the exact SHA-256 inputs in official built_from.json, so no unavailable Git object was treated as evidence.

Outcome: exact-hash private metadata import with 1,029 spells / 935 weapons, explicit duplicate IDs, selected actual fields and all spell-effect links checked. No current binary extractor: observed code hash/timestamp differ from the source's 5.42 profile. Compact flat interface, top Apply/Discard, advanced/source details on demand, typed zero/missing/not-applicable presentation and numeric variant staging. Full source/format decisions and attribution are in docs/COMPACT-DATA-04.md. Private inputs/cache stay excluded. No screenshot, native UI acceptance or game execution. No push, PR, release or message.

## 2026-11-05 · local version 0.6 record desk

The user requested a direct desktop tool with a stronger identity and no persistent tutorial. Replaced the numbered guide and its state machine with concise draft states, optional Help and an initially closed reference drawer. Source index, ruled editing sheet, command/line metadata and changed-field margin marks organize the work. Review/export stay in the file toolbar; reference staging still preserves pending inputs and requires Apply.

Checks: 95 Node tests pass; eight compiled native headless checks pass. The actual private 1,964-record cache passes the drawer/stage/review/export flow in the script adapter (native export stubbed there; real file I/O checked separately). HTML/link/ARIA-reference structure, JS syntax, selected contrast pairs, packaged UI bytes and private-data exclusions pass. All 331 protected external files are unchanged; parser, reference schema/importer, bridge, host Program.cs and private data/cache remain unchanged. Native policy adds only the exact local 0.6 help path, covered by the helper check.

Separate implementing-agent self-review is documented in docs/RECORD-DESK-06.md. No independent review or rendered inspection is claimed. Earlier local-content restrictions were respected without alternate-surface bypass. Native window/dialogs/keyboard/zoom/accessibility and game/VFX behavior remain unverified. Windows build and data-excluding ZIP were regenerated. No CoE5 process, push, PR, release or message. Reports: research/record-desk-*.

## 2026-11-05 · local version 0.7 linked creation and test preparation

Read the new brief, existing source/parser/host/examples/tests and retained research. Applied the game-research-websearch skill. Queries: um kb search "Conquest of Elysium 5" (no existing notes); exact test-field/newspell web queries (unhelpful, not evidence); primary GitHub main/release/annotated-tag/docs/source reads; native manual sections for metadata, weapon values and mode/ID tables; read-only Crab Cult Brine Surge, Abyss Crown Judgment and isolated-profile launchers. No downloaded tool, archive/login handoff or shared-note upload was needed.

Fresh identities remain core 669062bf21ec74cc2530ae0090f28b1ef7797c14 (also the resolved CoE5SE-v2.12.0 tag), docs 093e5e44536b3a76323aad80eaa1737830579607, tools 85643c49810b502767b37aa663fe34885ad90cdd. Sources and limitations are in docs/CREATION-AND-TEST-07.md and research/creation-sources.json. Native commands, extender declarations, historical references, source checks and future engine acceptance remain distinct.

Implemented New spell + weapon, explicit choices and bounded supported subset, linked name/order/prefix generation, clearly labeled unsaved fragments, review and original-preserving copy export. Optional effects remain metadata. Prepare test previews complete source files and exports a new ZIP via a narrow native bridge operation, with strict paths/identities/size/UTF-8 checks and an original flat banner. Generated Lua offers an explicit main-menu field, runtime name checks and scoped cleanup; it does not run on load. No game or dependency is bundled, installed or launched. Canonical generated pairs only; changed references/unsupported values explain why test preparation is unavailable.

Verification: 108 script tests, 12 compiled native checks including the local candidate, and 14 generated-Lua scenarios in the existing standalone SDK VM with mocked game APIs pass. The VM DLL matches its retained manifest, and all 24 recorded Lua C-source hashes match. No game DLL was loaded. Full private-cache script flow, static markup/links, JS syntax, packaged bytes/exclusions and preservation pass. All 331 protected external files and 11 scoped core/data/cache files are unchanged. Experimental native-written sample ZIP: dist/WB_TestSpark.experimental.test.zip; its text matches the prepared inputs and its manifest says gameTested false.

Separate implementing-agent self-review addressed reserved Windows names/newline injection, stale previews/asynchronous exports, form close warnings, generated baseline versus original identity, and avoiding closing a field whose open was refused. Actual game loading, test controls/restoration/VFX, native GUI/dialogs/keyboard/zoom/accessibility remain unverified. The previous local-content inspection restriction was respected without an alternative-surface bypass. Current known game fingerprint does not match the pinned extender profile. No CoE5 launch/control, existing mod/save/extender modification, push, PR, release or message occurred. Current reports: research/creation-*.
