# v0.15 · original vanilla spells and weapons

Date: 2026-11-06. **Implemented and verified offline; no new gameplay or rendered desktop verdict.**

## Deliverable

Run the separate Windows executable (local evidence) with its supporting folder intact. It requires .NET 8 Desktop Runtime x64 and WebView2. The old normal launcher/build, v0.14 packages, installed game, existing mods, saves and retained sessions were preserved. No friend package, upload, message or GitHub action was performed.

The app now reads a fingerprint-gated native metadata catalog from the user's own Windows 5.43 executable. **Game data → Load installed 5.43 spells & weapons…** exposes 1,029 spells and 936 named weapon slots, with IDs, source/version, partial numeric fields and linked spell-weapon VFX values. Duplicate names remain distinct. Nothing is added to the draft by browsing.

**Observe original with CoE5SE…** is available for eligible spell/weapon identities in Game data and recognized references. It reuses the host's explicit prepare/start workflow, a fresh owned session/profile, exact 5.43 / 2.13.0 fingerprints and matching ID/name checks. The independently authored helper adds no definitions, selects a matching native caster/carrier in game and runs `fightTestField`, with no stand-in, forced fire or weapon/spell setter. It records bound helper evidence and supports a separate user observation. Original observations are excluded from editable result return. Draft bytes, pending fields and target selection remain intact.

See [research, source links, API distinctions and acceptance steps](../../docs/ORIGINAL-RECORDS-015.md).

## Research result

| Subject | Verified source/data finding | Remaining condition |
| --- | --- | --- |
| Original spell | The API can open with its native spell ID and no stand-in, memorizing that spell on a new field unit. The ordinary fight path has no forced range extension. | A native matching path/level caster must be found; AI may cast zero/several times, attack differently or reject the target. New workflow not run in game. |
| Original weapon | Native attack-row and spell-to-weapon getters identify first-attack carriers or original spells referencing the weapon. | Only melee/ranged row zero and the associated-spell route are implemented. Later/special rows and missing carriers require another fixture. |
| Faithful editable copy | No full public clone allocator/copy command was found in the pinned contract/manual. WeaponTester copies its listed fields and skips failures; its spell stand-in temporarily overwrites/restores the shared effect weapon. | A complete record/reference/ownership copy contract is needed. The new observation route makes no clone and does not use stand-in. |
| Standalone custom weapon | Creator/export produces native weapon source, but no assigned attacker or spell payload. | A private attacker fixture, explicit row/payload and suitable targets need separate design/validation. |
| Original Banish | The pristine 5.43 table has multiple Banish identities. #226 points to weapon #139, type 23, spell attack payload 99. | Observing that configured original does not establish payload meaning or support arbitrary custom Banish definitions. No new Banish gameplay was observed. |
| Vanilla without SE | Native commands provide weapons, unit attacks, spell paths, map/event and item-spell mechanisms. No native main-menu field equivalent was found. | A disposable native map/campaign combat fixture is plausible, but no SE-free test workflow is implemented or validated here. |

Public source pin: CoE5SE `9e22d27c32ee15392fc370027d00dbc750b5d19b` / 2.13.0. The verified local game SHA-256 is `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55`. The compiled runtime check also reverified the retained official extender/runtime file hashes without loading the plugin or starting the game. The metadata reader hashes the same immutable read buffer it decodes and refuses other images.

## Verification

| Check | Result / evidence |
| --- | --- |
| Script/unit/workflow suite | **197/197 pass**, script-checks.txt (local evidence). Includes partial-name/ID search, duplicate IDs, provenance, incomplete/unavailable data, no source/target changes, dirty edits preserved, no launch during preparation, original package boundaries and prior creation/return checks. |
| Compiled native and original-helper mocks | **94/94 pass**, native-checks.json (local evidence). Includes the real static catalog and runtime hashes, reviewed helper/candidate matching, rejected tampering, substitute-process session/profile/context handling, original exclusion from value return, older result review and **20 mocked original-helper scenarios**. No game process is started; isolation tests use substitutes. |
| Existing fixed/editing helpers | **51/51 Lua scenarios pass**, lua-checks.json (local evidence). Standalone SDK VM hash and 24 Lua source hashes checked. CoE5 APIs are mocked. |
| New helper's mocks | Spell/weapon and weapon-via-spell routes, missing/duplicate identities, missing carrier/API/field, invalid enemy, preexisting campaign, too-small/changed viewport, refused open, changed fields during open/battle, cancellation, stop, fight error and cleanup error. Successful close is a call return, not observed allocation cleanup. These 20 cases are included in the 94 total, not an additional count. |
| Native-reader → Apply → separate export | **24/24 scalar/mask round trips**, native-roundtrips.json (local evidence). v0.15 maintains documented damage policy and old v0.14 results remain review-only. |
| Real retained Codex VFX Trial | Read-only replay passed, retained-replay-output.txt (local evidence). Existing saved impact 7 → 3 and one recorded cast call export byte-for-byte as the previous known result. This is a historical-result replay, not another cast. |
| Artifact/source safeguards | artifact-checks.json (local evidence): all **493 protected files** retain their hashes; installed executable unchanged; all HTML IDs unique; all 22 scripts approved and match the desktop build. No static game dump, game binary, profile, private references or retained session is copied into the application output. The workbench executable itself is the only app host, not the game. |
| Desktop build | .NET publish succeeded into `build/desktop-015-validation`. The native tests detected installed WebView2, but no window was opened. |
| Rendered desktop / game / audiovisual result | **Not performed for v0.15.** No screenshots, casts, AI decisions or visual accuracy are claimed. No user process was closed or controlled. |

`static-probe.json` and `installed-catalog-packet.json` are local research/test evidence derived from the user's own executable. They are **not distributable application assets**. The application reads users' own copies on request; it does not ship this catalog.

## Separate self-review and corrections

This is a self-review, not independent agent review. The review traced metadata provenance → explicit identity → canonical package → isolated host → helper → bound log → separate user observation, and re-ran the previous editable-return workflow.

Corrections made during verification:

- v0.15 initially missed the native result-reader version list. The modern damage/VFX policy now explicitly includes 0.15 while keeping older versions' policies and review-only launch boundary; 24 round trips and the actual retained result verify this.
- A cancelled picker now records **cancelled**, instead of claiming a field closed. Numeric source-field comparisons also cover field opening and report unavailable values, with no shared-field writeback.
- Route-menu choices are labeled as routes, not falsely as native record IDs. Native record/caster choices retain actual IDs.
- Initial Lua mock failures exposed that the standalone VM opens fewer standard libraries than actual CoE5SE; the mock supplies only min/max and states this explicitly. The actual 2.13.0 `lua_loading.h` opens math. The test environment is not presented as the real game.

The most valuable next acceptance is one user-operated fresh isolated observation of a simple original spell and first-attack weapon carrier, with IDs, actual logs, field-close/exit, screenshot/audio and control/log clearance at supported sizes. A special original can follow against appropriate targets. Keep zero relevant AI casts inconclusive. Faithful clones, custom manual payloads, native-only testing and general combat/save compatibility remain separate dependencies.
