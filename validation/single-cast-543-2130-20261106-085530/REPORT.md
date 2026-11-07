# CoE5 5.43 / CoE5SE 2.13.0 — single-cast validation

**Result: PASSED for this isolated experimental test-field workflow.**

On **6 November 2026**, the assistant started one separate game process, opened the existing prepared spell fixture once, clicked **Cast once exactly once**, observed the real effect and **4 fire damage**, closed the field, and exited the owned process through the main-menu Quit control. Final logs contain **one cast**, **one field open** and **one field close**. The working 5.42 / 2.12.0 reference was preserved.

## Verified compatibility and official release

| Component | Evidence |
|---|---|
| Installed game | Steam app 1606340, build **26458448**, CoE5 **5.43** fingerprint. Copied into the new runtime; the Steam installation was not changed. |
| Executable SHA-256 | `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55` |
| PE identity | Timestamp `0x6aec6a32`, SizeOfImage `0x13728000`. |
| Game .text SHA-256 | `11ea0b5dc7f80c7ec32efef77e3d0b2e13c10a065786be3cf48982ef94e4bba6`; matches the official 2.13.0 Windows 5.43 source profile and the actual runtime `game_code_check match=1`. |
| Official release | [CoE5SE-v2.13.0](https://github.com/musical-pianist/coe5se/releases/tag/CoE5SE-v2.13.0). Release metadata and archive are preserved under `official-release/`. |
| Release archive SHA-256 | `458de3f4639830fe31dcef7908aabaaa98897aa2de6b9e52d730a6ed2082fb07`, equal to the official release asset's published digest. |

All three Windows files match the [official tag's SHA256.txt](https://github.com/musical-pianist/coe5se/blob/CoE5SE-v2.13.0/SHA256.txt), which also matches the checksum file inside the verified archive:

- `glu32.dll`: `bcc0491698280804364f95bcf3e199c36af92590daf68b150e345c87030c3793`
- `coe5se_loader.dll`: `d34232bd0ce6c8839beec7331b237878bfb93725b5e8d8c89ec80ee6017dcd8d`
- `coe5se.c5plugin.dll`: `26861bb0b6dffaa7150ed239e9eba4e934a955688d101c81161cf395190dd254`

The required Lua functions, UI drawing calls, pointer fields and BATTLE_DRAW/BATTLE_WAIT hooks are present in the pinned 2.13.0 API. Its `src/lua_test_battle.h` is text-identical to the checked 2.12.0 implementation. Sources: [API](https://github.com/musical-pianist/coe5se/blob/CoE5SE-v2.13.0/coe5.lua), [test-field implementation](https://github.com/musical-pianist/coe5se/blob/CoE5SE-v2.13.0/src/lua_test_battle.h), [supported game profiles](https://github.com/musical-pianist/coe5se/blob/CoE5SE-v2.13.0/src/coe5se_plugin.c). See `api-checks.json` and `staging.json`.

## Isolation and fixture

All new files are beneath this report's validation folder. The process used `runtime/CoE5.exe`, process-local **COE5_SAVE pointing to this folder's profile/**, and COE5_DATA pointing to the installed game data directory for reading. No global environment variables were changed. No campaign was started or loaded.

The profile contains only CoE5SE and **WB_Val20261105_201627**. Only the native config file was copied from the already-disposable 5.42 reference profile to retain those enabled mod names; no normal-profile file or save was copied. Enabled-mod flags were checked before launch. The copied test fixture retains the same spell, weapon, values and helper behavior. Only dependency-version text and pinned source URLs were updated to 2.13.0 in the new copy. `fixture-adjustments.json` records the per-file hashes. The original ZIP, fixture, manifest and 5.42 runtime were untouched.

The fixture is **WB Val 201627 Spark**, using **WB Val 201627 Spark Effect**, with a Spearman caster and one Spearman target. Spell damage remains 15 and the associated weapon uses fire damage. No workbench implementation changes or additional spell tests were performed.

## Actual observed run

Times below are **CET (Europe/Berlin)** on 6 November 2026.

| Step | Observation |
|---|---|
| Preflight | No active CoE5 process/window. Official archive/DLL hashes, supported game profile, required APIs and all 19 staged runtime/mod file hashes passed. The user explicitly authorized desktop control while away. |
| Launch | One owned PID, **3360**, started at approximately **08:58:41**, with `-w --winres=1100*800 --nofade --nogamepad -d`. It was launched directly on the interactive desktop to avoid the previously identified sandbox-desktop capture problem. |
| Runtime/mod load | Main menu visibly showed **version 5.43**, CoE5SE banner, Mod Settings and the test button. Log records the two mods in dependency order, matching game code, spell **1029** / weapon **1200**, and the exact new-profile Lua file. |
| Open field | One `test_field_opened` at **08:59:10.197**; both participants visible. `before-cast-check.json` confirms zero cast lines before input. |
| Single cast | One mouse click on Cast once at **09:00:30.691**; recorded in `cast-input.json`, with zero retries. Final native game log contains exactly one `Spearman casts WB Val 201627 Spark` line. The target took **4 fire damage** and the log records loss of an eye. |
| Visible effect | The real recording shows a bright fire-colored projectile/trail reaching the target, followed by an impact/smoke effect. The extracted frame below was selected from the actual recording, not generated or retouched. The immediate after-cast screenshot shows the smoke/result; settled screenshot shows the field and damage text. |
| Close field | One click on Close test returned visibly to the main menu. One `test_field_closed x=1 y=1` at **09:01:07.068**. |
| Quit | Quit was clicked in the owned game. The UI helper returned a user-input-detected warning rather than normal acknowledgement. No retry or further game input was sent: fresh read-only window/process checks found the game gone, and its log ends with normal SDL/OpenGL shutdown. No force-termination command was used. Exit code was not captured. |
| Final processes | **Zero CoE5 processes** on the final check. No process belonging to another session was closed. |

No matching Lua/script refusal or game-mod-error event was found in the focused final-log check. The UI helper warning on Quit is preserved in `results.json`; independent exit evidence confirms the requested final state.

## Captured evidence

!Actual 5.43 / 2.13.0 projectile frame (local evidence)

- `01-main-menu.png`: actual loaded main menu and visible version.
- `02-field-before.png`: field before the one cast.
- `03-single-cast.mkv`: **35.133 seconds**, **1100 x 800**, **30 fps**, game-window video; no audio recorded.
- `04-after-single-cast.png`, `05-result-settled.png`: actual impact/result and later field.
- `06-closed-main-menu.png`: visible return to main menu.
- `08-projectile-frame.png`: unretouched frame 717, approximately 23.9 seconds into the recording. `video-review.json` documents its selection.
- `game.log`, `coe5mod.log`: final game and extender logs.
- `owned-process.json`, `cast-input.json`, `before-cast-check.json`, `after-cast-check.json`, `process-exit-final.json`, `results.json`: session/input/result records. The earlier `process-exit.json` is an intermediate check while Quit was completing, not the final state. `07-quit-recheck.png` was not produced because the window had already disappeared at that recheck.

## Preservation and limits

All **462** protected file hashes match the pre-run baseline, including the earlier 5.42 validation/reference and tracked external mods/game files. All **110** normal-profile file size/mtime records match. All **19** staged runtime/mod files remain unchanged. No existing mod, Steam file, normal profile, campaign save or workbench implementation was altered; nothing was published, pushed or sent.

This pass establishes the specific prepared spell/helper workflow on the verified **5.43 / 2.13.0** Windows pair. It is a forced item-style test-field cast, with some ranges extended to 30. It does **not** establish normal combat, caster eligibility, AI, actual range, initiative/timing, fatigue, save compatibility or mod interactions. The capture establishes an actual effect in this run, not universal VFX accuracy. Audio was not recorded or verified. Field closure and the native close event were observed; every internal cleanup/restoration value was not separately inspected. No extra casts or additional gameplay tests were run.
