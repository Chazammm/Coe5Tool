# Single-spell validation · 5 November 2026

**Later work:** This report records the original offline phase. The subsequent game run is documented in `game-run-20261105-215659/REPORT.md`. On 6 November the user clarified that their own interaction caused that run's duplicate casts; those are not evidence of a tool defect. The prepared user-operated follow-up and current status are in `MANUAL-TEST.md`.

**Latest result, 6 November:** The user-operated spell/VFX/close/exit workflow passed with **two intentional casts** (3 and 13 damage). The strict exactly-once variant was not performed. See `manual-runs/run-20261106-084231-614-f34c3f/REPORT.md` for the screenshot, new logs, clean exit and the verified 5.43 / CoE5SE 2.13.0 source-profile follow-up.

**Overall outcome: BLOCKED at the in-game stage. Offline preparation passed.**

A compatible existing CoE5 5.42 / CoE5SE 2.12.0 pair was established and staged in a new disposable folder. Before any game was started, Windows reported recent desktop input. The user explicitly answered: “I’m using the desktop; keep verification offline.” The task therefore remained offline. No CoE5 process was launched, controlled or stopped. There is no observed cast, real target result, actual-result screenshot or engine-cleanup result.

## Compatibility findings

These are fresh file/header/code measurements, not version guesses from filenames or historical logs. The Windows code hash uses the PE .text section's virtual size, matching CoE5SE's game_code_hash.h method for an unmodified image.

| Component | Finding |
|---|---|
| Steam installation | Steam app 1606340, build **26458448**, state flags 4. Its executable matches the **5.43** timestamp, image size and code hash in the newly released extender source. File-version resources do not supply a product version. |
| Steam executable SHA-256 | `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55` |
| Steam PE identity | Timestamp `0x6aec6a32`; SizeOfImage `0x13728000`; .text virtual size 3,376,896; code SHA-256 `11ea0b5dc7f80c7ec32efef77e3d0b2e13c10a065786be3cf48982ef94e4bba6`. |
| Existing local extender | **2.12.0**, source/tag commit `669062bf21ec74cc2530ae0090f28b1ef7797c14`. Available release DLLs match the freshly retrieved public SHA256.txt. Its known Windows profile is **5.42**, not the installed 5.43 executable. The last reported mismatch therefore still exists for this combination. |
| Existing compatible lab executable | Found in the already-present Abyss SovereignFix01QuickTest and Extender212QuickTest labs. Both freshly match **5.42**: full SHA-256 `aef4fe703637bedf098b2b97b3c4bb43bba09c9691788724b6e66e679dc6af77`, timestamp `0x6ada0282`, SizeOfImage `0x13728000`, code SHA-256 `d39ea78899effadc76a0214b2eb5c8bcbd4aac5991f7862aaccb48a99ff4bfa8`. |
| New upstream release | **CoE5SE 2.13.0** was published at **20:19:40 UTC during this task**. Its annotated release tag resolves to `9e22d27c32ee15392fc370027d00dbc750b5d19b`. Its source profile matches the installed **5.43** identity above. These binaries were **not downloaded, installed or executed**. This is a source-profile match, not a local 2.13 runtime pass. |

The verified 2.12.0 DLL identities are:

- `glu32.dll`: `bcc0491698280804364f95bcf3e199c36af92590daf68b150e345c87030c3793`
- `coe5se_loader.dll`: `34ae8096f9179255cd142838e5739955a3d6db87bcb7e6772b2a184a2edd3003`
- `coe5se.c5plugin.dll`: `6fe18ee43a6eae8b2d79efa8b2d0da6f0ed633b4520ca960b92b5ceeef8cf6e5`

The compatibility gate passes for the already-present **5.42 / 2.12.0** pair. No hook was forced and no binary was patched. Copies of those existing files and six manifest-checked game libraries were placed under this run's runtime directory solely for an isolated session. No installer/download or replacement of the current Steam installation occurred. No existing campaign/profile was copied into the new profile.

Primary sources: [2.12.0 supported-build check](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/src/coe5se_plugin.c), [2.12.0 binary hashes](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/SHA256.txt), [2.13.0 release](https://github.com/musical-pianist/coe5se/releases/tag/CoE5SE-v2.13.0), [2.13.0 supported-build check](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/coe5se_plugin.c). Retrieval metadata and release asset digests are retained in public-sources.json.

## Processes and isolation

Initial CIM/Win32_Process enumeration returned Access denied. Read-only Get-Process enumeration then succeeded and found **zero CoE5 and zero Workbench processes**, with the same result on the final recorded check. There was no active CoE5 process/profile to attribute to the user. The default user profile was located at `%USERPROFILE%/AppData/Roaming/coe5`; it was neither used for this test nor modified.

The newly staged profile is `profile/` beneath this report. It contains only copied CoE5SE release files and the one generated test mod. No game-owned config or campaign was created because no game was started. A future run still needs first-start setup of this fresh profile and enabled dependencies; an old profile/config must not be substituted. Game assets would be read from the existing installed data directory. Source runtime files and old lab profiles remain untouched.

The applied game-automation skill (local evidence) says: “If `idle` is under a minute, ask before driving.” The probe returned 0.0 seconds; the subsequent user instruction to remain offline is the immediate reason the in-game stage was not attempted. No native/browser restriction was bypassed to inspect the workbench.

## The one prepared test

| Setting | Value |
|---|---|
| Test mod ID | `WB_Val20261105_201627` |
| Spell | `WB Val 201627 Spark` |
| Associated weapon | `WB Val 201627 Spark Effect` |
| Format | Combined .c5m: native weapon, then prefixed CoE5SE spell |
| Path / level | 3 (Pyromancy) / 1 |
| Spell damage / base weapon damage | 15 / 0 |
| Damage type / range / initiative / area | 4 (fire) / 6 / 1 / 0 (single target) |
| Optional metadata | look 68, sound 16, flymode 6, flylook 65, flysound 104 |
| Field participants | Spearman caster and one Spearman target; names must resolve in the actual runtime |

The optional values are listed by the native manual's effect/sound tables; no new effect ID was invented. The intended observation is one fireball/impact and an immediate effect on the single target. No deterministic damage amount, death, sound or visual accuracy is claimed without a game observation. The non-mage caster deliberately reflects the API's forced item-style cast; ordinary caster eligibility is outside this test.

The actual supported New/creation/Review/source-export/Prepare-files/ZIP-export handlers were exercised through the project's DOM adapter. The compiled native TestPackage writer produced the ZIP via its existing self-test fixture. This verifies the code/file workflow, **not a clicked Windows file dialog or rendered WebView interface**.

## Package audit

`WB_Val20261105_201627.test.zip` has SHA-256:

`3c4d56c849ebd1d2f3985504a31286d2ad86c8ff558f9f333db2afa0fc9cac05`

It contains exactly five entries under its matching mod-ID folder:

- `WB_Val20261105_201627.c5m`
- `WB_Val20261105_201627.lua`
- `banner.tga`
- `README.txt`
- `manifest.json`

The .c5m supplies icon/description metadata, plain needs_script_extender/requires lines, the new weapon before the spell, and the exact quoted weapon reference. Lua and main-file basenames match the folder name. The native banner is an original flat 256×64 24-bit TGA. The manifest retains gameTested false. The README states dependencies, main-menu trigger, Cast once/Close test controls, field limits and removal instructions.

Every text entry matches the workbench's prepared input byte for byte. The ZIP contains no game/loader binaries, raw reference exports, private cache, old source, config or campaign saves. Runtime binaries are separate local staging files outside the ZIP. Extraction wrote only this new profile's new mod directory and did not overwrite an existing profile/mod.

## Results and limits

| Verification | Result |
|---|---|
| Existing regression suite | **108 tests passed**. |
| Compiled native helper checks | **12 passed**, including the actual generated ZIP and refusal of existing destinations. No game window is opened by these helpers. |
| This generated helper in standalone SDK Lua | **Passed orchestration check**: one mocked field open, one fire call, one close, and normal battle-hook passthrough afterward. Game calls, table records and input are synthetic; this establishes no real damage/VFX/restoration. |
| Pair order/reference, metadata, dependencies, paths, ZIP text/banner | **Passed offline**. |
| Desktop creation/native file dialogs | **Not visually exercised**; existing local-content restriction respected. |
| Real mod loading, menu button, one cast, target outcome, image, field close/restoration | **Not attempted** after the user requested offline verification. |
| Workbench defect | **None established offline**. A CRLF-versus-normalized-text assertion in the new validation script was corrected to compare bytes; no workbench code was changed to hide a failure. |
| Preservation | **337 protected external files unchanged; 27 workbench code/test files unchanged; all 110 default-profile file metadata records unchanged.** |

The only repository housekeeping change is ignoring the local validation directory, which contains private evidence and copied runtime files. No workbench feature, interface, existing mod, game installation, save or extender source was altered. Nothing was published or sent.

The field forces an item-style attack and extends some ranges. Even a future successful cast would not establish normal spellcasting, path/level eligibility, learning, fatigue, AI choice, true range, initiative, ordinary combat timing/area behavior, save compatibility or mod interactions.

## Recommended next action

When the desktop is available, resume this single test with the already-verified **5.42 / 2.12.0** local pair: recheck processes/fingerprints, bootstrap only the fresh profile, enable its two mods, capture the field before and after exactly one Cast once, then Close test and exit only the process started for this validation. Check real logs for the expected build/hash, script/spell registration, refused calls and test-field closure, and compare protected files again.

Alternatively, in a separately authorized setup task, verify the newly published **2.13.0** binary/package and its test APIs for the installed **5.43** build, then repeat this validation with accurate dependency labeling. No such update is needed or performed here to manufacture a passing result.

Evidence files: compatibility-local.json, public-sources.json, public-sha256-2.12.txt, process-checks.json, workflow-offline.json, native-checks.json, node-tests.txt, package-checks.json, runtime-preparation.json and preservation-after.json. The exported fragment and experimental ZIP are beside this report.
