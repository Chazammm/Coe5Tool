# v0.16 original-record desktop/game validation

Date: 2026-11-07, Europe/Berlin (launch records use UTC, still 2026-11-06).

**Result: both selected-record AI-use tests passed, including field close and process exit. Visual-effect appearance remains unverified.** These were two actual Windows/game sessions operated by the agent after the user explicitly confirmed the desktop was free. They were not simulations. Each session received one **Battle (AI)** click; no forced attack was used and no battle was repeated.

## Actual results

| Check | Fireball #445 | Spear #4 |
| --- | --- | --- |
| Catalog | Installed, fingerprint-verified 5.43; path 3 / level 2 / effect weapon #54 / spell payload 15 | Installed, fingerprint-verified 5.43; weapon #4 / dmgtype 3 / range 1 |
| Runtime selection | 33 eligible casters offered; explicitly selected **Pyromancer #55** | First melee/ranged attack route; 72 eligible carriers offered; explicitly selected **Levy #27** |
| Enemy | One native **Spearman #13** | One native **Spearman #13** |
| Field | Opened with caster and target | Opened with carrier and target |
| Actual AI behavior | Pyromancer cast Fireball twice, rounds 0 and 1. Log identifies `spl 445`, path 3, level 2 and Fireball weapon. Spearman took 3, then 5 damage and died. | Units advanced to melee. Spearman first hit Levy for 2 damage. Levy attacked with Spear, dealt 6 damage and killed Spearman. Debug log identifies actor unit 1, first attack `a 0`; helper confirms weapon #4. |
| Visible evidence | On-screen cast/damage/death log and removed target. Sampled frames missed projectile/impact animation. | On-screen attack/damage/death log, unit approach and removed target. No distinct projectile/impact animation captured. |
| Close | **Close** returned to main menu | **Close** returned to main menu |
| Exit | Quit; owned PID **37988**, exit **0** | Quit; owned PID **32168**, exit **0** |
| Helper report | `stage=closed`, `battles=1`, `forcedcasts=0`, `stops=0`, `knownunchanged=1` | Same values |

The helper's `battles=1` counts one returned battle call, not one cast. Fireball's two casts are native AI behavior, confirmed independently in the actual game log. Eleven public numeric weapon fields compared equal at close; this is not a full-record or engine-state immutability proof.

The UI's manual observation was saved as **unclear**, with notes explicitly identifying successful record use and unverified transient VFX. This is not a claim that AI use was inconclusive. The original four-choice result selector is a coarse visual-observation field; the corrected UI now labels it **Visual outcome**. Detailed use evidence remains in notes, screenshots and runtime logs.

## Session identities and isolation

| Item | Fireball | Spear |
| --- | --- | --- |
| Session | `23a1fddf0324493ea58ed9ffc62b00e7` | `a6fcfdbf61b1423e95067e6936c788d7` |
| Mod | `WB_Observe_mw5l4lip` | `WB_Observe_mw5l9ode` |
| Run | `2fb9abf5d1724d7da4b32f71ba0b093f` | `875a987090b64aa187523dc3ff08e304` |
| Revision | `31f8ec557795d2733719b114e926d6212847e7bc594e963431f564e6312b64c8` | `e2fab196a82b1b526dc2c82468b8bb6923678038a5f1ecdb203f729c18eb7ca9` |

Both live session folders remain under `%LOCALAPPDATA%\CoE5Workbench\Tests\<session>`. They did not exist in the preflight inventory of nine retained sessions. Each received a copied verified runtime and a new disposable profile containing only CoE5SE and its generated observation helper. Existing app-owned disposable configuration settings were copied; the user's normal configuration/saves were not used. Both launches were `bootstrap=false`, with `COE5_SAVE` set to the new profile and `COE5_DATA` pointing read-only to installed assets. No Steam update, patch, installation change or campaign was performed.

The current `build/desktop-016-workspace/CoE5Workbench.exe` was used, not the historical v0.15 output. Desktop catalog loading used the native executable-selection dialog and did not start a game. Fireball was located by name with distinct variants shown; Spear was selected by `#4`, with categories keeping spell/weapon IDs distinct.

Preflight rehashed all **14 runtime input files**, matching the pinned 5.43 / 2.13.0 allowlist. Key SHA-256 values:

- Installed `CoE5.exe`: `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55`.
- Official retained `coe5se.c5plugin.dll`: `26861bb0b6dffaa7150ed239e9eba4e934a955688d101c81161cf395190dd254`.

The source/API route remained the previously checked four-argument `openTestField` and `fightTestField` path. The Lua helper was unchanged by this task. No stand-in, setters on native spell/weapon records or `fireTestField` were introduced. The test API memorizes the selected spell on the temporary eligible caster; this does not reproduce normal campaign spell selection or a complete unmodified army.

No game/workbench processes were present before launch. Windows reported recent input, so control waited for the user's explicit availability reply. Only owned windows/processes were operated/closed. No game or workbench window remained at completion.

## Rendered interface and consistency findings

Workbench captured window: **1107 × 794 logical pixels**. Game launch client: **1100 × 800 pixels**, captured framed window **882 × 671 logical pixels** at the current desktop scaling. These units are not interchangeable with the helper's internal UI units.

The runtime picker clearly showed names, IDs and candidate counts. Its text and the battle/event log were small at this scaling but readable; the longer generated main-menu test label extended past its narrow native button background. It remained usable here; long-name/native menu sizing was not redesigned.

The compact field dock sat at bottom center and left the lower-left event log unobstructed. Battle and Close clicks reached their visible controls. Screenshots support these observations at this one window size/scaling. Move, resizing, alternate DPI/monitors, expanded editing controls and very long event-log lines were not exercised.

Two concrete issues were corrected in the source and rebuilt desktop output:

1. **C14:** Fireball preparation initially displayed the retained Codex VFX Trial forced-cast instructions. Later Spear preparation displayed Fireball's notes. Unmatched sessions now have **Previous session** labels and a review/preparation explanation instead of unrelated launch instructions. Observation headings identify their exact session record; previous saved-value review is explicitly labeled. Notes/log access and original session bindings are retained.
2. **C15:** Spear's reporting said “spell was cast” / “successful spell test”; original preparation retained “No game has started” even after a run, and its intro referred to an absent draft. Intro/start/exit text now follows the mode, preparation wording remains true after launch, and original result reporting separates record use from visual outcome. No result schema or saved evidence was rewritten.

The rebuilt app was reopened and the same Fireball selection was viewed with the completed Spear session retained. Actual rendered screenshots show the corrected previous-session label, scoped heading and visual guidance. No third game session/package was created for this check. The current-session post-exit branch and generated-pair transitions were checked offline; games were not repeated for text-only corrections.

The original-record guide's obsolete v0.15 launch instruction and stale acceptance statements were also updated, following C13. Existing checklist entries and user-reported drag evidence were retained.

## Offline checks and preservation

- **212/212 script tests passed**, including two new regressions for unrelated retained-session identity/notes and original AI-use versus visual-outcome reporting. Existing source-preservation, pending-edit, launch-gate and return-flow tests remained enabled.
- `dotnet publish desktop/Workbench.csproj -c Release -r win-x64 --self-contained false -o build/desktop-016-workspace --no-restore` succeeded. No friend ZIP/release was rebuilt.
- All **19/19 prepared runtime/mod file hashes in each new session** still matched after the game. The helper was not changed or substituted to obtain a passing result.
- Of **326 preflight-protected files**, **325 remained byte-identical**. The only change was the expected app root `last-session.txt` pointer to the new Spear session. Retained-session contents and the normal profile snapshot were unchanged. All **14 runtime input files** were unchanged after testing. This is a scoped hash comparison, not a full disk audit.
- Historical 97 native/mock checks and 24 round trips were not rerun here; they must not be counted as new game evidence. No game-API mocks were used to claim the results above.

Both runtime logs contain `steam_init failed: 0` during copied-runtime startup. It did not prevent the main menu, extender/helper load, either AI battle or normal exit. No helper error/failed close was observed. This run does not validate Steam integration.

## Evidence map

- `preflight.json`, `protected-before.json`, `preservation-check.json`: fingerprints and scoped protection comparison.
- `session-evidence.json`: both final session states, helper metadata, copied evidence hashes and prepared-file checks.
- `fireball/` and `spear/`: copied launch/session/observation metadata, original-helper text, runtime `log.txt`/`coe5mod.log`, bound INI and manifest. No game/extender binaries copied into this evidence archive.
- `screenshots/01-fireball-catalog.jpg`, `05-fireball-eligible-casters.jpg`, `06-fireball-before-battle.jpg`, `10-fireball-completed-battle.jpg`, `11-fireball-closed-to-menu.jpg`.
- `screenshots/13-spear-catalog.jpg`, `17-spear-eligible-carriers.jpg`, `18-spear-before-battle.jpg`, `21-spear-completed-battle.jpg`, `22-spear-closed-to-menu.jpg`.
- `screenshots/02-unrelated-retained-session-before-prepare.jpg`, `14-spear-showing-fireball-history.jpg`: actual before-fix inconsistencies.
- `screenshots/24-corrected-previous-session.jpg`, `25-corrected-observation-guidance.jpg`: actual rebuilt-app verification. JSON companions contain window/capture dimensions and accessibility evidence.
- `script-tests.txt`, `build.txt`: current offline test/build output.

## Limits and next step

The selected native records were actually used; these are not merely successful battle-start calls. Nevertheless, this does not establish general combat balance, ordinary campaign AI, all ranges/targets/timing, save compatibility, complete record immutability, audio, universal VFX accuracy, faithful editable cloning or a Vanilla-only field. These two tests used CoE5SE and clean native records.

**Most useful next step:** a short continuous capture of Fireball in a fresh disposable observation session, using slower playback or pause to retain the projectile/impact frames. That would close the principal remaining evidence gap without replacing native AI with a forced cast. No additional game test was run in this task.
