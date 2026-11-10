# CoE5SE 3.2.2 compatibility preview · 2026-11-10

**Game follow-up:** Two bounded tests now passed on the unchanged RC ZIP: selected Harbor Ember forced cast/return/export and original Fireball AI observation, with captured flight/impact and normal exits. [Actual game report](game-20261110/REPORT.md). The package-check statements below describe the earlier pre-game state; mixed 3.2.2 remains unavailable.

**Outcome:** Workbench **0.18.0-rc.1**, official **CoE5SE 3.2.2 / CoE5 5.43**, with independent retained **2.13.0** support. Source, automated/native checks and Windows desktop package checks passed. **No new game was launched. Fresh 3.2.2 gameplay acceptance is pending.** This is a prerelease, not full runtime/gameplay verification.

## Official evidence

The live official GitHub API was checked again before publication: [CoE5SE-v3.2.2](https://github.com/musical-pianist/coe5se/releases/tag/CoE5SE-v3.2.2), published 2026-11-09 09:40:31 UTC, stable/not draft, patch 5.43. Its 4,266,667-byte ZIP matches both the published checksum and GitHub asset digest:
`c356b8ed61bee470a7a546e9e5a47098902270747b09e52a1e99dff8bfcb6c3d`.
GitHub attestation verification passed for musical-pianist/coe5se. The tag resolves to source commit `20431a298d3b9cd0def6b82fee2b3fbaead9f08b`.

The user's local 5.43 executable matches the existing SHA-256 `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55`. No installation, game update, replacement or downgrade was performed. Release metadata, attestation output, downloads and exact source diffs stay in private local evidence.

## Implementation and investigation

See [compatibility matrix and primary source links](../../docs/COE5SE-COMPATIBILITY-018.md).

- Selects official 2.13.0/API 10 or 3.2.2/API 11 from the exact plugin hash, then checks the complete independent 14-file profile. Three files changed: plugin, loader and CoE5SE.c5se. Unknown or cross-version file sets refuse.
- Canonical candidates and sessions retain their own runtime version; retained missing-version contracts remain 2.13.0. Preparation, recheck/resume, launch, result review and history use that binding and their own paths. Configuring a new runtime does not migrate existing preparations/results.
- Existing generated/selected spell, standalone single-type weapon, visual comparison and original observation helpers remain byte-identical. Numeric openTestField remains; public helper calls remain in the source/API. This is compatibility evidence, not proof that a game test works.
- Source/API, event/UI/getter, INI/storage and release-note changes were inspected. API 11 adds group tables, field identities and positions; LAN/corpse/random-event additions are outside this update.
- Mixed 3.2.2 remains unavailable. The old patch does not apply, and the API-10 DLL must not be paired with API 11. An isolated unmodified 3.2.2 source rebuild succeeded; it is not a roster port, was not loaded and is not shipped. Official mixed groups exist, but Workbench needs a new helper/cleanup/receipt adaptation.

## Distribution correction

The official core license at both pinned versions requires author permission for core modification and asset/code use. The MIT notice used previously covers tools/reference, not the core. No permission record was found locally. The new package/current public source tree exclude all official or derived extender core binaries/source. The historical roster DLL and vendored core are removed from the **current Git tree only**; private working files, sessions, earlier releases and Git history remain untouched. Their earlier distribution needs a separate permission review. New legacy mixed preparation requires a separately available authorized private component; clean downloads explain its absence. Existing staged 2.13.0 sessions/results retain their verification paths. No 3.2 core modification was made.

## Offline verification

- **309 JavaScript tests passed**, including both canonical runtime versions, ordinary/selected/original/standalone routes, old results, source preservation/conflicts, changed-runtime refusal, preview labels and missing private roster component.
- **88 compiled native checks passed**, including retained actual old result reading and complete official-file checks for both versions. Eight production preparations/resume/launch policies were exercised with a captured/fake process interface, **not a game launch**.
- Native refusal checks cover active game conflicts, unknown versions, cross-version candidate/runtime, mixed official loader/plugin and a forged mutable staged-hash manifest. No launch was authorized by changing only a hash.
- Synthetic current-version saved samples accepted only their exact session/revision/run binding; foreign-run samples refused. These establish parser/policy behavior, not actual cast/cleanup behavior.
- Package audit regressions reject derived DLLs, native core source, game executables, unlisted caches/sessions, personal paths and changed inventory files.

Private local evidence: final-script-checks.txt, offline/native-final.json, api-audit.json, roster-port-check.txt and package-final.json. Those private inputs/session paths/runtime files are not committed.

## Actual Windows desktop checks

Computer Use operated only Workbench, at a captured **1107 × 794** window on this Windows account/current scaling. No new game was launched.

The built app and final extracted ZIP opened the included four-definition example through the native Open dialog. The selected spell showed Harbor Ember Test and its linked weapon, preserving the larger source. Both runtime selections were recognized in the built app. New selected-spell and Fireball-original 3.2.2 preparations were made without launch; the final archive reopened the selected preparation, checked it Ready and visibly retained **preview / fresh game acceptance pending** beside the Start action.

Retained 2.13.0 preparation readiness, used-original refusal and saved Harbor result review were checked earlier in this same desktop validation. Old result provenance stayed 2.13.0 after selecting 3.2.2; no result values were applied. A separately exported unchanged example was byte-identical to all 748 source bytes. The rendered 3.2.2 single-type weapon setup disabled mixed Add with a reason. Library general/detail text now identifies both compatible releases and the preview limit.

Concrete corrections: resumed Ready initially omitted the preview warning; Library captions still said only 2.13.0; one generated test README retained a 2.13-only sentence. All were corrected and regression-tested, with relevant desktop follow-up. Final no-core archive startup, native Open/selected-spell view and saved-preparation Ready were rechecked after rebuilding. The application closed normally; process checks found no remaining Workbench/game processes.

Screenshots 01–20 are retained locally; only the safe app-only welcome capture is suitable for publication. Other DPI/window sizes, a clean Windows account and missing prerequisites were not tested.

## Exact package

- Version: **0.18.0-rc.1**, Windows x64, framework-dependent.
- Archive: `dist/CoE5Workbench-0.18.0-rc.1-win-x64.zip`.
- SHA-256: `4d7665e0b7c3a697ab15ce91c5705d4948dd47b16694d8b6a1e392c17274200b`.
- Fresh final extraction: 84 files, 83 independently inventoried payloads, 2,665,602 uncompressed bytes.
- No official/derived extender core, game executable/assets, full proprietary catalogs, profiles, saves, private sessions, personal paths or credentials. No roster DLL. Only Workbench/WebView2 executables are allowed.
- Requires Windows x64, .NET 8 Desktop Runtime x64 and WebView2 Evergreen. Editing/export need no game; integrated fields use the user's own exact game and complete official extender files.
- Prior 0.17 ZIP is unchanged. Earlier intermediary RC ZIPs were local build artifacts and are superseded by this exact hash.
- Publication status is recorded below after asset verification; no stable/full-gameplay claim follows from a prerelease.

## Preservation and acceptance still needed

All 1,141 baseline files were compared: prior retained sessions unchanged. Only the global runtime-selection file and newest-preparation pointer changed through normal app actions. The game, prior stable ZIP and private old roster DLL remained byte-identical. Three new unstarted disposable preparations were added; final manual instructions identify the two intended acceptance sessions and leave the preliminary preparation untouched.

Follow [manual acceptance](../../docs/MANUAL-ACCEPTANCE-018.md). The local MANUAL-TESTS.md supplies exact prepared IDs; those identifiers/profile paths are not public. Required new evidence: selected-spell cast/readback, normal field close/Quit/exit, protected return/full-source export, then a separate original AI observation. Named Fireball use and visible flight/impact must be reported separately from battle return. Do not diagnose the historical unexplained Feebleminded event from this update.

Mixed 3.2.2 is not offered. The most useful next implementation step after acceptance is a Lua-only adaptation to official group-table fields, with honest per-battle identities and new cleanup receipts; a core fork needs permission first.

## Published preview verification

Published **[v0.18.0-rc.1](https://github.com/Chazammm/Coe5Tool/releases/tag/v0.18.0-rc.1)** as a GitHub **prerelease**, not a stable/full-gameplay release. Source/tag commit: [1e9c80655b803ee4381596394621a0572754cc2c](https://github.com/Chazammm/Coe5Tool/commit/1e9c80655b803ee4381596394621a0572754cc2c). Source push was verified; no force-push.

The uploaded **877,634-byte** ZIP and 104-byte checksum were downloaded to a separate local folder and matched the desktop-verified archive/checksum byte-for-byte. GitHub's ZIP asset digest also matches `4d7665e0b7c3a697ab15ce91c5705d4948dd47b16694d8b6a1e392c17274200b`. Public release metadata is not draft and is prerelease; the tag points to the stated source commit. The stable latest endpoint still selects **v0.17.0**. Existing releases are unchanged. The tested ZIP is frozen; this publication-evidence follow-up changes documentation only.
