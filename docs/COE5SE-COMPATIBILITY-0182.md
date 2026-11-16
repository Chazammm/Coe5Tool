# CoE5SE compatibility — Workbench 0.18.2-rc.1

Checked on 2026-11-16: official stable **CoE5SE 3.4.4 for CoE5 5.43**, API **14**. Workbench stable at the start was **0.18.1**, repository main ec6079999aaa8d14cbb355caced810048a04bf93. This Workbench update is a **prerelease**: source/API, file identity and offline safeguards are checked; fresh 3.4.4 gameplay acceptance is pending.

## Supported profiles

| Runtime with the exact pinned Windows CoE5 5.43 | Workbench routes | Evidence/status |
| --- | --- | --- |
| Official 3.4.4 / API 14 | Eligible generated/selected spell pairs, original AI observation, private melee/ranged, single-type and official mixed visual comparison | New preview. Offline/native checks; fresh game acceptance pending. |
| Official 3.3.0 / API 11 | Existing bounded routes retained | Prior selected spell, Fireball AI and mixed comparison gameplay evidence; current regression checks. |
| Official 3.2.2 / API 11 | Existing bounded routes retained | Prior bounded gameplay and current regressions. |
| Official 2.13.0 / API 10 | Existing single-type routes; mixed only with the separately available authorized private roster component | Prior bounded evidence; private component is not distributed or downloaded here. |

Every integrated test uses CoE5SE. Native source editing/export remains available offline. The exact game fingerprint is unchanged; filenames and a version string alone are insufficient. An unsupported executable, unknown extender or mixed release is refused. No Steam/game/mod/save/profile update is performed.

## Official release identity

[Official 3.4.4 release](https://github.com/musical-pianist/coe5se/releases/tag/CoE5SE-v3.4.4), published 2026-11-15. Archive: CoE5SE-3.4.4.zip, 5,305,442 bytes; SHA-256 **73e88ee9b2e82bf95a1c6d88894a8ef03009116fba3d246aef943f1b965a83b8**. Downloaded bytes matched both the release-body checksum and GitHub asset digest.

GitHub attestation verification passed for musical-pianist/coe5se. Its SLSA provenance binds the archive and Windows DLL digests to release.yml at source commit **df09497f04a39ff8fb7b0979dedde7dfed120c64**. The annotated Git tag itself is unsigned; this is separate from the verified build attestation. The archive was extracted only into an isolated local evidence folder.

The new profile checks all **14 required files**: unchanged pinned game/support files plus independently checked extender stub, header, banner, layout, sidecar, loader and plugin. The plugin, loader and sidecar differ from 3.3.0. [Version-specific pins](../desktop/RuntimeReleases.cs). No official or derived extender core is included in Workbench or its download.

## API/source comparison and ownership

- API version advances 11 → 14; the ABI enum appends new hooks. Workbench reports 14 for 3.4.4 instead of treating every official-group runtime as API 11. It uses Lua calls, not a rebuilt core plugin.
- Numeric and table-form openTestField, group arrays, per-unit identities, read-only positions, draw/fight/stop/close calls remain available. The test-field source differs only in its stand-in weapon check: it no longer requires the script's own mod to own that weapon. Closure code is unchanged. Closure still does not establish complete record rollback or attack-time positions.
- coe5.set now allows game/shared monster, weapon, item, class, terrain and ritual records. Its old weapon-maker ownership check was removed. Some refused writes return without throwing; Workbench must verify readback rather than treating a nonthrowing call as success.
- **Workbench does not expose this expanded shared access.** Canonical candidates still load only CoE5SE and a generated private test mod in a disposable main-menu profile. Private ranged/comparison helpers retain unique-name, private-ID, carrier attack-slot and fixed payload/type/area checks before writes and after readback. Only their private visual fields can return.
- New 3.4.4 spell helpers add explicit private weapon ID/name checks, including before every write and attempted restoration. Fixed forced-spell tests also refuse a built-in weapon ID. Older helper bytes remain unchanged for older runtime contracts. Failed or partial writes/readback do not authorize a cast or a successful return. These checks are not a generic permission API for arbitrary Lua.
- Spell definitions, beam-width implementation, weapon trait definitions, record-word layouts, unit/UI/data-file helpers and game code-hash definitions used here are unchanged. Getter tables and content-write plumbing expand; existing helper fields remain present. Group APIs and existing result schemas are reused without claiming new gameplay.
- New registered literal commands found in this comparison are castermaxcast (ritual), itemslots and keepweapons (monster). They are recognized as context-dependent coverage outside the spell/weapon form; wrong-context occurrences retain a barrier. Existing diagnostic categories and source-preservation rules remain. Recognition does not certify all arguments or make these commands testable.
- New LAN/replay/network features and general shared record editing are outside this Workbench update. No new faithful clone, generic map spawn or Vanilla-only field is added.

## Session and result protection

The selected runtime is recorded in the canonical candidate and session, and rechecked against original and staged complete file profiles before starting/resuming. 3.4.4 requires a fresh 0.18.2-rc.1 preparation with the guarded helper. It cannot be enabled by relabelling a 0.18.1/older candidate. Old sessions retain their original version/files; missing-version legacy records still mean 2.13.0. Used/stale/active-game, path/ownership and foreign-result protections remain.

Saved original observations remain read-only. Private comparison results retain per-attempt groups/identities and closure facts. HP changes do not prove attacker identity; setup/end positions are not attack-time positions. Selected values use existing conflict checks and explicit full-source copy export. No old result is relabelled as 3.4.4 or silently migrated.

## Setup and fresh acceptance

Extract your own official 3.4.4 release separately. In **Choose game & extender files…**, select the supported CoE5.exe and the new official plugin. Workbench checks the complete profile and labels 3.4.4 as preview/game acceptance pending. Keep earlier extracted releases for their existing preparations. Do not merge the extender into the Steam folder for Workbench.

[Focused manual acceptance](MANUAL-ACCEPTANCE-0182.md) covers one supported spell, original Fireball AI and a two-configuration mixed visual comparison. Preparation/offline checks are not observed gameplay. Record named attacks, visual observations, saved readbacks, closure and normal exit separately. The preview must not be described as fully game-verified until these observations exist.

## Primary source contracts

Pinned official source: [plugin ABI](https://github.com/musical-pianist/coe5se/blob/df09497f04a39ff8fb7b0979dedde7dfed120c64/src/jazzy_api.h), [test field](https://github.com/musical-pianist/coe5se/blob/df09497f04a39ff8fb7b0979dedde7dfed120c64/src/lua_test_battle.h), [get/set](https://github.com/musical-pianist/coe5se/blob/df09497f04a39ff8fb7b0979dedde7dfed120c64/src/lua_get_set.h), [Lua facade](https://github.com/musical-pianist/coe5se/blob/df09497f04a39ff8fb7b0979dedde7dfed120c64/coe5.lua), [3.3.0 comparison](https://github.com/musical-pianist/coe5se/compare/CoE5SE-v3.3.0...CoE5SE-v3.4.4). [Local verification report](../validation/extender-344-20261116/REPORT.md). [Earlier compatibility/evidence](COE5SE-COMPATIBILITY-018.md).
