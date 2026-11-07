# User-operated spell validation — 6 November 2026

**Functional spell/test-field workflow: PASSED. Strict exactly-once variant: not performed; inconclusive against that narrower criterion.**

The user reported that the test worked perfectly and explicitly confirmed **two intentional casts**. The two logged attacks agree with that report. They are not evidence of a workbench defect. No automated mouse/keyboard input, game launch or game termination was performed by the assistant during this manual test.

## Results and evidence

| Check | Result and basis |
|---|---|
| Correct isolated launch | Launcher records PID 6020, this validation's runtime and disposable profile, and no other active CoE5 at launch. `preflight.json` reports 14 matching prepared files and matching ZIP/extracted mod. |
| Compatible runtime | The fresh extender log records `game_code_check match=1`, CoE5 **5.42**, build `6ada0282-13728000`. The prepared extender is the verified **2.12.0** build. |
| Spell/mod load | `spell_added` records **WB Val 201627 Spark**, spell 1029, weapon 1200, path 3, level 1, damage 15. The exact test-mod Lua file loaded. |
| Test field | One `test_field_opened` event at **08:43:18.258 CET**: Spearman caster, Spearman enemy, count 1. |
| Casts and damage | Exactly **two** native custom-spell cast lines in this session, using **WB Val 201627 Spark Effect**, with **3** and **13** fire damage. The second attack logs target death. The user confirms that both casts were intentional. |
| Visible result | The user-supplied screenshot shows the field, the Cast once / Close test bar, a bright fire-like projectile/trail toward the target, and text reporting the custom spell and 3 damage. This is actual game evidence supplied by the user, not a workbench preview or mock-up. |
| Close/cleanup | One `test_field_closed x=1 y=1` event at **08:43:45.916 CET**. The user reports the workflow worked. The event establishes execution of the native close routine; it does not independently measure every restored internal value. |
| Exit and log collection | The game log ends with normal SDL/OpenGL shutdown; `exit.json` records PID 6020 exiting at **08:43:49 CET**, exit code **0**. Both final logs were copied into this run folder. A later read-only check found no active CoE5 process. |
| Errors | No matching Lua/script refusal or game-mod-error events were found by the focused log check. No error was reported by the user. This is not a blanket assertion that every engine diagnostic was independently audited. |

The operator's deliberate click count comes from their report; the log establishes two engine casts, not the number of physical mouse clicks. This run therefore demonstrates the functional flow but cannot be labeled a controlled exactly-one-cast run.

Evidence: `preflight.json`, `launch.json`, `exit.json`, `coe5mod.log`, `log.txt`, `analysis.json`, and **user-reported-projectile.png**. The before-* logs are preserved historical copies, not evidence of additional casts in this new session. The screenshot SHA-256 is `e1995f8ab5a89d430abcbfaf8f4d6a7bba7f045b5dc325130beabfbe57594648`.

!User-supplied actual projectile result (local evidence)

## Preservation and scope

The original test package remains the same prepared artifact. All **337** tracked protected external files still match their earlier hashes, and all **110** normal-profile file size/mtime records match. See `analysis.json`. No workbench implementation, existing mod, Steam installation, normal profile, campaign save or original package metadata was changed. The original manifest remains `gameTested: false`; this dated result records the specific exercised fixture and versions instead of silently changing the artifact.

This is a forced item-style cast in the experimental field, with some ranges extended. The result does not establish ordinary spellcasting, AI, eligibility, learning, fatigue, true range, initiative/timing, normal combat or saves. One supplied still image establishes an observed effect, not complete animation timing, sound, or VFX accuracy in all situations. Audio was not supplied or separately confirmed. Cleanup was observed through the workflow report and close event, not a full internal-state audit.

## CoE5 5.43 follow-up

The **Steam installation is already 5.43**; the manual test deliberately used the preserved 5.42 runtime. A fresh read found Steam build **26458448**, executable SHA-256 `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55`, PE timestamp `0x6aec6a32`, SizeOfImage `0x13728000`, and .text virtual-size SHA-256 `11ea0b5dc7f80c7ec32efef77e3d0b2e13c10a065786be3cf48982ef94e4bba6`.

The [CoE5SE 2.13.0 source's Windows build profile](https://github.com/musical-pianist/coe5se/blob/CoE5SE-v2.13.0/src/coe5se_plugin.c) matches that 5.43 timestamp, image size and code hash. This is verified source compatibility, **not a locally tested 2.13.0 runtime**. No new extender binary was downloaded, installed or executed in this review. See `upgrade-543-source-check.json`.

The next version task should prepare a **separate disposable 5.43 / 2.13.0 setup**, verify official release binary hashes and the required test APIs, then repeat this user-operated fixture with honest dependency labeling. Preserve this working 5.42 / 2.12.0 setup as the reference. Updating the Steam installation is unnecessary. Nothing was pushed, published or sent externally.
