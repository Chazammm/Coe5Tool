# CoE5SE 3.4.4 update — Workbench 0.18.2-rc.1

Date: 2026-11-16. **Gameplay acceptance is pending; this update is a prerelease.** No game was launched, operated or closed during this task.

## Versions and verified release identity

At the start and again before publication, official GitHub latest was **CoE5SE 3.4.4**, published 2026-11-15 for CoE5 5.43. Workbench main/stable was **0.18.1**, commit ec6079999aaa8d14cbb355caced810048a04bf93. No remote application changes were found to merge.

Official archive CoE5SE-3.4.4.zip: 5,305,442 bytes, SHA-256 **73e88ee9b2e82bf95a1c6d88894a8ef03009116fba3d246aef943f1b965a83b8**. Downloaded bytes matched both the release-body checksum and GitHub asset digest. GitHub build-attestation verification passed for musical-pianist/coe5se; provenance binds the archive and Windows DLLs to source commit **df09497f04a39ff8fb7b0979dedde7dfed120c64**. The annotated Git tag itself is unsigned, a separate fact from the verified attestation.

The supported Windows CoE5 5.43 executable remains pinned to SHA-256 **489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55**. All 14 required game/support/extender files were verified as coherent profiles; no filename/version-string-only approval or forced hook was used. Official files were extracted separately, never installed over Steam or existing profiles/mods/saves.

## Findings and implementation

- New plugin API is **14**, versus API 11 for 3.3.0/3.2.2 and API 10 for 2.13.0. Runtime diagnostics now report the actual API, not a generic 11 for every group-capable release.
- Single/mixed field APIs, returned unit arrays, position readers, UI/data-file/unit helpers and close behavior remain compatible at the inspected contract level. The test-field file differs only in its stand-in ownership check. Field closure is still distinct from complete record rollback, and setup/end cells do not establish attack-time positions.
- Expanded coe5.set removes the former own-mod weapon guard and permits shared record editing. Workbench does not expose that access. Private carrier/weapon identity, attack-slot, payload/type/area and visual readback checks remain. New 3.4.4 pair helpers explicitly refuse built-in weapon IDs and recheck private identity **before** writes/restoration and after readback. A nonthrowing setter is never treated as successful without matching reads.
- A Lua model caught that the first adaptation checked identity only after a write. The pre-write check was added and the model rerun successfully. This is a local adaptation correction, not a claim that a released Workbench corrupted a record.
- Older helper bytes remain unchanged for 3.3.0, 3.2.2 and 2.13.0. Runtime-version gates explicitly retain 0.18.1 and earlier accepted contracts. New 3.4.4 preparations require the new guarded producer version; old sessions cannot be relabelled or silently migrated. Used/stale/ownership/process/path/file-integrity/result-association checks remain.
- Three new registered literal commands were found: castermaxcast in ritual context, itemslots/keepweapons in monster context. They are recognized as preserved coverage outside the spell/weapon form; their arguments are not globally certified. Wrong-context and unknown barriers remain. Existing beam/spell/trait semantics and prefixed .c5m versus .c5se handling are retained.
- The Windows 5.43 game-code hash definitions, spell table, beam-width, weapon-trait, heal-army, record-word, unit/UI/data-file contracts checked here are unchanged. Getter/content-writing plumbing and hooks expand; no general shared-record editor, LAN support, new payload type or broader test fixture was added.

[Compatibility and primary-source links](../../docs/COE5SE-COMPATIBILITY-0182.md). No official/derived extender core was modified, built for distribution or bundled. The older derived-extension permission question remains separately documented; earlier history/releases were not rewritten.

## Offline verification

- **345/345 JavaScript checks passed.** New runtime binding, private helper selection, retained old helpers, unknown-version refusal, original read-only mode, single/mixed preparation, protected visual return/conflicts and the corrected Library caption are covered alongside existing source/prefix/encoding/export tests.
- **135/135 compiled native checks passed on the packaged executable.** Actual local 2.13.0/3.2.2/3.3.0/3.4.4 files, nine new current-version candidates, preparation/resume, process conflict refusal, captured isolated launch intent, staged-file tamper refusal, foreign-result rejection and retained results were checked. These use substitute child/process models; no game/plugin was loaded to execute gameplay. API-14 metadata, wrong old producer version, modified guarded helper and mixed 3.3.0 plugin/loader/sidecar refusal received focused checks.
- **10/10 Lua model cases passed** in the previously built standalone Lua test VM, independently checked against its build-manifest DLL hash. Actual generated helper preflight and extracted write/readback functions exercise private versus native IDs, identity changes, successful private writes, silent refusal, partial write and restoration readback failure. APIs and records are synthetic; this is not engine/gameplay evidence.
- The first new native control used a different baseline from the older fire/visual receipt fixture. The local fixture was regenerated with the required fire/68/2/65 baseline and correct explicit 3.4.4 runtime before the passing run. No application validation was loosened.
- Old supported runtime/session/result checks remain passing. Broader unobserved gameplay, AI, VFX, error/partial-allocation cleanup and campaign/save behavior are not established by these results.

## Actual Windows app and preparations

The package was extracted fresh and inventory-audited before launch. The real application displayed 0.18.2-rc.1 at a captured **1107 × 794** window size. Native file dialogs selected the verified Steam executable and separately extracted official 3.4.4 plugin read-only. The visible Ready label explicitly said **preview; game acceptance pending**. The older exited 3.3.0 result remained listed.

Normal UI workflows prepared a generated spell/weapon experiment, Fireball #445 original AI observation and a selected ranged mixed comparison. The mixed example opened from the packaged .c5m, retained its other weapon/comment, and selected **Spearman #13 ×2 plus Levy #27 ×2** from available native choices. The current catalog offered several Levy variants; #27 was selected explicitly. Source and test instructions were inspected; Start was never clicked.

Changing the draft/setup invoked the existing stale protection on the first spell and Fireball preparations. They are unused **but stale**, not launch-ready; do not bypass or reset their state. The latest mixed comparison remains unused/nonstale. After closing and reopening the app, the actual **Check before resuming** verified that saved snapshot and enabled Start saved test, with pending-game evidence visible. The earlier used and stale entries remained distinguished. Prepare the spell and original cases fresh, one at a time, when performing manual acceptance.

The first desktop check found that the Library entry advertised 3.4.4 preview but its detail caption still listed only older versions. The shared detail text was corrected, covered by a focused regression and visually rechecked in the final archive. The executable in that final archive is byte-identical to the one passing the 135 compiled checks; the changed UI text passed the final 345-test suite. One computer-use geometry retry and a desktop switch required refreshing/brief user-approved access; neither is evidence of an app defect. Workbench then closed normally. Other DPI/window sizes and a separate machine were not tested.

Private preparation IDs, receipts, runtime files and raw desktop evidence remain local and excluded from GitHub/package. Local instructions: MANUAL-TESTS.txt. Public, generic steps: [manual acceptance](../../docs/MANUAL-ACCEPTANCE-0182.md). No fresh cast, original AI use, visible effect, hit, target resistance reading, field closure or game exit was observed on 3.4.4 in this task.

## Exact final package

- Version: **0.18.2-rc.1**, Windows x64 portable, self-contained .NET 10.0.15; WebView2 Evergreen required.
- ZIP: `dist/CoE5Workbench-0.18.2-rc.1-win-x64.zip`
- Size: **60,347,249 bytes**
- SHA-256: **210aa9b62ac5a340f72c0b62e75d01650d016b4b69fe4c8b154db57742f7b360**
- Fresh inventory/privacy audit: **91 files**, 90 inventoried plus inventory. A separate fresh extraction passed publication lint with **zero failures and zero warnings**. The used app folder acquired caches and is not the distribution. Only the original clean ZIP is published.
- No game executables/assets, official or modified extender core, imported catalogs, personal mods/saves/profiles/private sessions, credentials or machine-specific paths were found in the package. The prior 0.18.1 ZIP remains byte-identical to SHA-256 271df1e9eb2b31ad363be676c9e8833555545f60b51b06b6f2478d8014f97c04.

Extract the complete ZIP into a writable folder and open CoE5Workbench.exe, keeping ui/examples/licenses beside it. Source editing/export work offline. Integrated tests require the user's own exact supported game and official extender. [Preview release](https://github.com/Chazammm/Coe5Tool/releases/tag/v0.18.2-rc.1); publication verification is recorded in the follow-up below once complete. Stable 0.18.1 is preserved. Nexus is a separate distribution: this task does not upload to Nexus or verify which package is currently hosted there.

## Remaining acceptance

Perform the focused custom-spell, original Fireball and mixed visual-comparison cases on 3.4.4, recording named attacks, visual observations, bound readbacks, closure and normal exit separately. Only the latest preparation is currently ready; create fresh sequential cases for stale ones. Keep the prerelease label until these results have actually been observed. No universal compatibility, rollback, attacker attribution or visual accuracy claim is made.
