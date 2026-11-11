# CoE5SE compatibility · 0.18.0-rc.3

**3.2.2 remains a compatibility preview.** Two bounded game cases passed on the earlier exact rc.1 ZIP: selected Harbor Ember forced cast/readback/return/export and original Fireball AI observation, with visible flight/impact and normal exits. Other standalone/visual-comparison combinations remain untested; official mixed 3.2.2 has one fixed ranged two-type case with recorded readback and normal exit, while wider mixed acceptance remains pending. [Actual game evidence](../validation/extender-322-20261110/game-20261110/REPORT.md). Editing/export remain independent of this runtime choice.

Checked the live official GitHub API on 2026-11-10: latest stable **[CoE5SE 3.2.2, game patch 5.43](https://github.com/musical-pianist/coe5se/releases/tag/CoE5SE-v3.2.2)**, not a draft/prerelease. Selected Windows x64 and the same exact 5.43 executable already fingerprinted by Workbench. No Steam update or replacement is required.

| Workflow | Official 2.13.0 / API 10 | Official 3.2.2 / API 11 |
| --- | --- | --- |
| Supported selected/generated spell + linked weapon | Earlier bounded gameplay evidence; current offline regression | Selected Harbor Ember forced-cast/readback/return/export passed in game; generated-pair variants were not separately exercised |
| Original Vanilla AI observation | Earlier bounded Fireball/Spear evidence | Fireball #445 / Pyromancer #55: one AI battle, two named casts, captured VFX and normal exit; other originals remain bounded/untested |
| Private melee/ranged and single-type visual comparison | Earlier bounded gameplay evidence | Canonical preparation and offline read/launch checks; **game acceptance pending** |
| Mixed types | Earlier bounded private roster-v1 evidence; component not distributed here | Official-API fixed field: **one ranged Deer/Winter Wolf case passed**, including named weapon use, captured visuals, readback and normal exit. Melee and other mixed configurations remain unverified. No API-10 overlay. New mixed comparison: one two-battle sprite/particle case with readback, captured VFX, desktop return and separate export passed. The first menu-Quit attempt did not respond; fresh normal Quit after Credits/return passed with code 0. Original cause and other cases remain pending. |
| Retained results and unused preparation resume | Preserved, including missing-version legacy records | New preparations retain their own version and paths; no migration |

[Actual rc.3 comparison evidence and exit limitation](../validation/official-comparison-0183-20261110/game-20261110/REPORT.md). The frozen rc.3 package retains publication-time pending captions; this follow-up does not rebuild or replace it.

[Fresh normal-Quit follow-up](../validation/quit-manual-0183-20261111/agent-run/REPORT.md): no confirmed defect or production fix; the successful sequence included Credits/return.

## Release and file identity

The official `CoE5SE-3.2.2.zip` SHA-256 is **`c356b8ed61bee470a7a546e9e5a47098902270747b09e52a1e99dff8bfcb6c3d`**. The download matched both the release-body checksum and GitHub asset digest; `gh attestation verify` also passed for `musical-pianist/coe5se`. The annotated tag resolves to source commit **`20431a298d3b9cd0def6b82fee2b3fbaead9f08b`**. The previous source/release is retained separately.

The release has three changed files in Workbench's minimal runtime set: plugin, loader and `CoE5SE.c5se`. The frozen Windows `glu32.dll` stub, mod header/banner/layout and game support files remain the same. All **14** required files are verified as a complete version-specific set; changing filenames, version text, one hash or the mutable session manifest cannot authorize a mixed/unknown runtime. See [release profiles](https://github.com/Chazammm/Coe5Tool/blob/main/desktop/RuntimeReleases.cs) and [legacy/game pins](https://github.com/Chazammm/Coe5Tool/blob/main/desktop/GameRuntimeHashes.cs).

New preparation records its runtime version in both the canonical candidate manifest and session. Start/recheck verify that those agree with the session's own official source paths and staged fingerprints. Changing the current runtime selection does not upgrade a retained snapshot. Old records without the new field mean **2.13.0**, not whichever version is configured now. Used/stale/active-game/ownership protections remain. Result review verifies the retained version's files independently of the currently configured runtime.

## Source/API comparison

Primary sources: [official editor/API annotations](https://github.com/musical-pianist/coe5se/blob/20431a298d3b9cd0def6b82fee2b3fbaead9f08b/coe5.lua), [test field](https://github.com/musical-pianist/coe5se/blob/20431a298d3b9cd0def6b82fee2b3fbaead9f08b/src/lua_test_battle.h), [plugin ABI](https://github.com/musical-pianist/coe5se/blob/20431a298d3b9cd0def6b82fee2b3fbaead9f08b/src/jazzy_api.h), [full release comparison](https://github.com/musical-pianist/coe5se/compare/CoE5SE-v2.13.0...CoE5SE-v3.2.2).

- Numeric `openTestField(caster, spell, enemy, count, standIn)` remains. It now also accepts group tables and returns actual unit arrays as a second result. Existing helpers use its first boolean result, so they do not mistake the new second value for a different contract. Workbench retains its 1–200 bound although the new API allows more.
- Draw, forced fire, AI fight, stop, close, spell info and the current getters/setters remain. Getter changes add positions/preview-wheel handling; they do not change existing payload/weapon getters. `BATTLE_DRAW` / `BATTLE_WAIT` and UI calls used by the helpers remain. Public functions referenced directly by current helpers are present in both API annotation files.
- INI/file storage, unit helper and native config headers are byte-identical. Existing schema/binding/conflict checks are retained. This source evidence does not prove a real cast, AI use, sound, visual or normal exit.
- The 3.0 changes add LAN script policies and new field APIs. Workbench continues single-player disposable main-menu tests; it does not claim LAN support. Later 3.1/3.2 corpse/ritual additions and 3.2.2 random-event APIs are not new Workbench features. The unexplained historical Feebleminded event is not attributed to this update.
- Existing Lua helper bytes are unchanged. Their historical comments/source pin describe the original 2.13 contract; candidate headers, dependencies and runtime displays identify the version actually selected now.

## Why official mixed fields use a new receipt

The new official API **does** support mixed groups, spawned identities, adding field units and reading/moving battle positions. The new independently implemented helper uses table-form open and read-only positions for one fixed AI battle. It has a new strict receipt/reader and never loads the old core fork. See [exact scope and failure handling](OFFICIAL-MIXED-0182.md).

The existing local `withTestFieldRoster` / `testFieldRosterStatus` calls are absent from the official releases. They scope a callback and restore unit/commander snapshots plus additional field state. The new official close routine takes field units off, but does not provide that same full-snapshot/callback receipt contract. Current comparison/result readers must not relabel a successful close as confirmed roster rollback.

The old patch fails its dry-run against the new `lua_test_battle.h`, `lua_loading.h` and resource file. An isolated unmodified upstream 3.2.2 source build succeeded with the existing LLVM-mingw toolchain, so build infrastructure is available. That rebuild is **not** an adapted roster plugin, is not used by Workbench and is not shipped. The old pinned roster DLL/source is unchanged.

The first adaptation records setup/end cells and closure call/main-menu readings without claiming snapshot rollback. The new [rc.3 comparison helper](OFFICIAL-COMPARISON-0183.md) opens fresh groups, checks tracked closure and binds per-attempt readbacks to protected return. Its gameplay acceptance is pending; the older fixed schema remains read-only. Modifying the core instead requires the author's permission first. One fixed ranged mixed-game case passed; cancellation, stop, allocation failures and broader configurations remain pending. API-model/native checks do not replace them. No generic map spawning is needed or used.

## Distribution correction

The [official core license](https://github.com/musical-pianist/coe5se/blob/CoE5SE-v3.2.2/LICENSE.txt), also present at the old pinned source, reserves core modification and asset/code use to the author's permission. The tools/reference MIT notice does **not** license the extender core. No permission record was found in this workspace. This preview distributes neither official nor derived core binaries/source. The current public tree removes the previously vendored core and roster DLL; private working reference files, old sessions, Git history and earlier releases are preserved. Their earlier distribution needs a separate permission review and is not represented as authorized by this preview. No new core port was made.

## Setup and acceptance

Obtain/extract the official release separately. In **Choose game & extender files…**, select your own verified game EXE and the official extracted plugin. Nothing installs into the game or normal mod profile. A 3.2.2 preparation shows **compatibility preview / game acceptance pending**; Add another type selects official mixed groups for the fixed melee/ranged fixture. Compare visuals must be turned off explicitly, or the group kept to one type. The old mixed workflow needs both the complete official 2.13.0 folder and a separately available, authorized private component; choosing 2.13.0 alone does not supply it.

Follow the [manual acceptance steps](MANUAL-ACCEPTANCE-018.md) for fresh preparations. The two retained acceptance sessions have now completed and must not be replayed. The prior rc.1 ZIP remains unchanged. The unchanged rc.2 ZIP now has one bounded official mixed-game result; it does not establish area hits on both types. The new observations establish those two cases, not general/full compatibility. See the [rc.1 game report](../validation/extender-322-20261110/game-20261110/REPORT.md) and [rc.2 preparation/package report](../validation/official-mixed-0182-20261110/REPORT.md) for their separate evidence.

[Observed mixed-game evidence](../validation/official-mixed-0182-20261110/game-20261110/REPORT.md): one named weapon hit, three bound defender readings, captured flight/impact, field close and normal exit 0. No full record rollback or general compatibility claim follows.
