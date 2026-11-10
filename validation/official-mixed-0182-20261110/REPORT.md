# Official 3.2.2 mixed-target preview · 2026-11-10

**Implemented and verified offline and in Windows preparation; new mixed-group gameplay remains pending.** Workbench **0.18.0-rc.2** uses the user's official **CoE5SE 3.2.2 / CoE5 5.43**. No extender core was modified or distributed. Earlier rc.1 selected-spell and Fireball game evidence remains separate.

## Scope and source inspection

The official release was rechecked: latest stable tag `CoE5SE-v3.2.2`, API 11, supporting the pinned Windows 5.43 executable. The official ZIP's published SHA-256 is `c356b8ed61bee470a7a546e9e5a47098902270747b09e52a1e99dff8bfcb6c3d`; the retained verified extraction and source at commit `20431a298d3b9cd0def6b82fee2b3fbaead9f08b` were used. Game SHA-256: `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55`. Official plugin SHA-256: `87e70dead42341573889641447d04c700af359243696a57b32e89a4fac682e8a`.

Table-form `openTestField` accepts enemy groups and returns commander/friend/enemy identities. The independently authored helper verifies group order, type, owner, count and unique IDs before permitting one native AI battle. It uses only field-owned allocation and read-only battlefield getters. It does not use generic map spawning, move units, change shared records or patch the runtime.

The source cleanup marks field units inactive and restores selected borrowed state; it does not provide a full allocation/record rollback guarantee. Close returns no status value. The new receipt therefore records **close attempted/returned**, **main-menu readback**, and available tracked inactive readings separately. Setup and after-return/before-close positions are not attack-time positions. HP changes do not establish hits, an attacker, weapon damage or an area effect.

Supported first slice: a supported standalone/selected native melee or ranged weapon, 2–8 distinct eligible native target types, total up to 200 defenders, existing damage IDs 1–6, area codes 0–5 and the existing fixed visual subset. One fixed battle per launch; **no official mixed live visual iteration or draft-value return yet**. Compare visuals requires an explicit choice to disable it or return to one target type. Nothing is silently substituted. Editing and separate native export remain available.

The old 2.13.0/API-10 private roster route and its legacy result/return schemas remain separate. The official 3.2.2 single-type comparison and other existing helpers remain available. No retained session is migrated. See [API contracts and failure semantics](../../docs/OFFICIAL-MIXED-0182.md) and the separate [legacy distribution-permission question](../../docs/LEGACY-ROSTER-PERMISSIONS.md). Existing Git history and releases were not removed or rewritten.

## Checks

- **317 JavaScript tests passed.** New coverage includes official packet/source generation, limits, explicit comparison refusal, old-runtime routes, result states, identity/position validation, unknown hits/rollback, focused count editing, correct route labels and selection-bound read failures.
- **97 compiled native checks passed.** Includes both runtime profiles, canonical helper/manifest validation, unsupported-version refusal, source preservation, result binding, old result compatibility, stale/used/active-process protections, incomplete/error/cancelled receipts and production preparation/resume paths using a fake process seam. These checks did not launch a game.
- **20 standalone Lua/API-model cases passed.** Success, cancellation, stop, refused/error/partial/duplicate/wrong-owner/wrong-type setup, shared/relinked private records, missing/bad positions, fight/close/write errors and single-battle behavior are simulated. This establishes helper control flow against fake APIs, not native allocation or real-game cleanup. The local standalone Lua VM was used only for validation and is not distributed.
- Native test fixture setup initially omitted five older INI files; after copying their read-only fixtures, all checks passed. This was a verification setup error, not an observed application failure.

## Actual Windows desktop observations

Current scaling, **1107 × 794** logical-pixel application window. An intermediate package was used to exercise native Open of the included representative source, retained rc.1 saved-result review without Apply, installed target partial-name search and duplicate IDs, adding two types, payload entry and preparation. The installed eligible native target catalog contained **1,847 rows**; that is not a completeness claim for mod-added units or every game record.

Typing `12`, then `3` without refocusing produced `123`; the count was explicitly restored to 2 before preparation. A real focus-loss issue in status refresh was corrected. Selecting Compare visuals with mixed targets disabled Prepare with an explicit fixed-mode choice, preserving the roster and checkbox. Turning it off explicitly allowed preparation. The new disposable preparation contains **Deer #609 ×2 / Winter Wolf #487 ×1**, piercing #3, attack payload 12, range 5, area 5, mode-2 flight #65 and impact #68. It remains **prepared and unstarted**.

Two stale route captions were found and corrected: the target picker claimed all mixed tests needed the private plugin, and Prepared tests appended `local roster-v1` to an official field. Focused regressions cover both.

After those corrections and a documentation-only repack (all application/UI/helper bytes unchanged), the **exact final archive** was extracted into another fresh folder. It launched, opened the supported example, found the saved preparation, passed Check before resuming with pending-game evidence visible, and refused replay of the completed Harbor Ember session. The app closed normally. The final target-picker wording was observed in the preceding extraction; its identical final packaged bytes were also checked. New official mixed-result rendering has automated model/DOM coverage, **not a real game receipt or desktop acceptance of that receipt yet**. Other DPI/window sizes and large-roster rendering remain untested.

Local screenshots `01`–`15` and raw test outputs are retained privately alongside this report. Some contain local session IDs/paths, so they are not published. No game was started and no gameplay, named weapon hit, effect appearance or real closure was newly observed.

## Preservation

All **1,234** pre-existing retained-storage files were compared: only the expected `last-session.txt` selection pointer changed. Existing session contents stayed unchanged. All **19** staged inputs of the new preparation match their manifest; it has no launch journal, result run or PID. The configured game executable and old rc.1 archive are unchanged. The disposable native source remains unchanged. No source Apply/export, normal-profile modification, installation change or old-session repair was performed during these checks.

## Exact Windows package

- Archive: `dist/CoE5Workbench-0.18.0-rc.2-win-x64.zip`
- SHA-256: **`b7683527bf14c4f7616b8ecf2925c20599b664db0a37f85647ec1c397702e0b6`**
- Inventory: **86 files**, 85 inventoried payload files, **2,732,190 bytes** uncompressed, before first launch.
- Fresh-extraction inventory/hash checks, x64 apphost, executable allowlist, private path/credential scan and game/extender hash exclusion passed. No game or official/derived extender core binaries/source, personal mods, saves, profiles, private sessions, runtime paths or local test VM are included.
- Requires **Windows x64, .NET 8 Desktop Runtime x64 and WebView2 Evergreen**. Extract the entire folder. No SDK/Node is needed by the user. Editing/export work offline; integrated fields require the user's exact supported game plus their own complete official extender files. Do not share a used app folder with its generated cache/settings.

This is an explicitly limited prerelease, not a fully gameplay-accepted mixed-target update. The archive is frozen at the hash above. Publication status is recorded below after upload verification; earlier releases are preserved.

## Next acceptance

The prepared mixed field is ready for a user-operated test. Local `MANUAL-TESTS.md` gives its exact session/menu; public [operator steps](../../docs/OFFICIAL-MIXED-0182.md) explain the general route. Run Battle (AI) once, verify actual returned types/instance IDs and named weapon use separately from visual/HP readings, Close, Quit normally, then review Recorded mixed targets. Area 5 does not guarantee that the AI hits both types, and one battle cannot establish area/resistance formulas or universal compatibility. A separate fresh preparation should check Close-before-Battle cancellation; do not replay the primary preparation or deliberately exhaust allocation.

## Publication verification

Published as [v0.18.0-rc.2 prerelease](https://github.com/Chazammm/Coe5Tool/releases/tag/v0.18.0-rc.2), explicitly labelled mixed-gameplay acceptance pending. Source/tag commit: [`b077b25b875dae25b636ea61641e7df72df48b58`](https://github.com/Chazammm/Coe5Tool/commit/b077b25b875dae25b636ea61641e7df72df48b58). The ZIP and checksum were downloaded from the draft and matched the local frozen files before publication; the public asset digest and tag target match afterward. The release is not a draft, is a prerelease, and stable Latest remains v0.17.0. Earlier releases/history were preserved. A follow-up documentation commit records this receipt without changing the ZIP.

The final extracted executable was also rerun through all **97** compiled checks (exit 0), and the publication checkout passed all **317** script tests. The staged source/document audit covered **44 files** and found no game/runtime binaries, private paths or private session files. No fresh gameplay was performed during publication.
