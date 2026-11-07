Current version 0.11 retains this isolation workflow. The new [visual settings and adaptive dock](VFX-AND-DOCK-011.md) extend [searchable choices and explicit return](RETURN-AND-CHOICES-010.md). Older packages must be regenerated for a new launch; retained v0.9/v0.10 sessions keep read-only/manual result association. Existing profiles/evidence are not migrated or rewritten. The application does not control the game; new visual/layout behavior still needs user-operated acceptance.

# Isolated desktop test workflow · 0.8

The workbench prepares a separate copy of a supported generated spell/weapon pair, verifies local runtime files, and starts that game only when **you click Start**. You operate the game. No keyboard or mouse input is sent to it by the workbench.

## Use the workflow

1. Start the Windows application with **Start-Workbench.cmd**. Choose **New spell + weapon**, create the pair, edit its supported fields as needed, and **Apply changes**.
2. Choose **Prepare test…**. The form supplies a unique test ID, Spearman caster/target and one target; change them if needed. Monster names resolve in your actual game. Choose **Prepare files for review**. The optional file review shows the generated mod, Lua, README and manifest. ZIP export remains available separately.
3. Choose **Choose game & extender files…**. Select your local **CoE5 5.43 CoE5.exe**, then **coe5se.c5plugin.dll** inside the official, already-extracted **CoE5SE 2.13.0** folder. Keep the whole extracted folder together, including glu32.dll. Cancel either dialog to keep the previous selection. The application downloads nothing and installs nothing globally. It checks the known executable, support libraries and official extender-file hashes; other combinations cannot start through this feature.
4. Choose **Prepare isolated session**. This copies only the required runtime/dependency files and generated fixture into a new private session folder. The game data directory beside your selected executable is read in place. No game starts during preparation. The selected spell and process/preparation state appear below the buttons.
5. For the **first** fresh profile, click **Start profile setup**. At the main menu, open **Mods**, enable **CoE5SE only**, choose **Exit**, then **Quit** without starting/loading a campaign. This makes the game save its own native config. Return to the workbench and click **Refresh status**, then **Start isolated test**. The workbench enables CoE5SE and this test mod in that app-owned config. This avoids guessing a native configuration layout or copying your normal profile. Later preparations can clone settings from the previous app-owned test config, replacing its entire mod list with just the two intended mods.
6. For a ready profile, click **Start isolated test**. Confirm version **5.43**, the CoE5SE banner and the test button. Open **WB test: <your test ID>** from the main menu. Click **Cast once**, observe the real effect/damage, then **Close test** and **Quit**. Do not load a campaign. This application has no VFX renderer or instant preview.
7. Click **Refresh status** after exiting. **Open session & logs** opens only the current app-owned session folder. Optionally expand **Record your in-game observation**, choose your result, add notes and **Save observation**. A prepared package, a running process, process exit and your reported observation are separate states; none automatically becomes a passing gameplay test.

First-profile setup and the new desktop-integrated workflow still require the user-operated acceptance below. The previous successful fixture run used a prepared disposable config; that historical pass does not prove this new application's full interaction flow.

## Changes and running sessions

Pending source edits, applied source changes, a replacement draft or changed test options invalidate the package/session binding. Apply edits and prepare files/session again. The Start action also checks the current draft revision, generated helper, staged files and pinned runtime hashes. It refuses an older or altered preparation.

Changing the source does not change a running game. Quit it yourself, regenerate, then explicitly start again. The workbench never closes a game automatically and provides no kill-process command. An existing CoE5 process blocks preparation/launch; another workbench's launch is guarded by a Windows mutex. Do not use an active campaign as a substitute.

Settings can be selected again if files move or fingerprints change. Cancelled selection retains the previous settings. A failed preparation/launch reports its error and retains the owned files for inspection. A running session survives closing the workbench: a close prompt explains that it will remain running, and a later workbench start rechecks ownership using PID, executable path and start time. Missing/corrupt session records are not trusted for process control; new preparation remains possible, subject to the existing-game check.

## Private files and dependencies

Session storage is `%LOCALAPPDATA%\CoE5Workbench\Tests\<opaque session ID>`. Each session has its own runtime, profile/mods, prepared ZIP, manifest, launch records and runtime logs (`runtime/log.txt`, `runtime/coe5mod.log`). It contains local copies of game/extender files: **keep it private**. No sessions or runtime paths are bundled in the application ZIP. The native runtime-path cache is private in the same Tests root. The workbench's separate reference cache remains in its existing private profile.

Only the known required files are copied. Existing destinations, linked/reparse paths, unexpected mod files, changed helpers and changed runtime hashes are refused. Config processing accepts the source-documented native version 129 format only. It reads/writes only app-owned disposable configs; old config snapshots are retained. Source files, approved mods, Steam installation, normal profile and saves are not overwritten. Previous runtime logs are archived before another explicit start, and each saved observation has a separate immutable file tied to the session launch. Session files are retained rather than automatically deleted. After all game processes have exited, you may archive/remove unwanted session folders yourself; the application does not delete them.

Supported integrated pair: **Windows CoE5 5.43 / CoE5SE 2.13.0** with the pinned fingerprints. The earlier **5.42 / 2.12.0** pair remains a historical reference and is not an integrated-launch target. Full executable hashes pin these exact builds; matching names/version strings alone are insufficient. A game's data folder must exist and be nonempty; the application does not claim a complete asset audit.

## Evidence and reload decision

On 6 November 2026 the existing fixture on 5.43 / 2.13.0 produced one observed projectile/impact and 4 fire damage, one field close and normal shutdown. Earlier 5.42 / 2.12.0 manual testing also established loading/damage. These were specific experimental test-field observations. Logs and actual images remain in local validation folders, outside distribution.

Fresh official-source checks for this feature use:

- [2.13.0 supported-build profiles](https://github.com/musical-pianist/coe5se/blob/CoE5SE-v2.13.0/src/coe5se_plugin.c), [official binary hashes](https://github.com/musical-pianist/coe5se/blob/CoE5SE-v2.13.0/SHA256.txt), and [release](https://github.com/musical-pianist/coe5se/releases/tag/CoE5SE-v2.13.0).
- [Lua API](https://github.com/musical-pianist/coe5se/blob/CoE5SE-v2.13.0/coe5.lua), [field implementation](https://github.com/musical-pianist/coe5se/blob/CoE5SE-v2.13.0/src/lua_test_battle.h), and [loader/script lifecycle](https://github.com/musical-pianist/coe5se/blob/CoE5SE-v2.13.0/src/lua_loading.h). The field implementation matches the checked 2.12.0 source. The same generated helper behavior is retained; version/provenance text now pins 2.13.0.
- [Official mod-loading documentation](https://github.com/musical-pianist/coe5se-docs/blob/main/docs/commands/mod-loading.md): requires orders enabled dependencies; it does not install or enable them.
- [Native config format](https://github.com/musical-pianist/coe5se/blob/CoE5SE-v2.13.0/src/coe5config.h): offset 48, XOR key 0x4f, native version 129 used here. Unknown config versions are refused.
- [Restart logic](https://github.com/musical-pianist/coe5se/blob/CoE5SE-v2.13.0/src/restart_prompt.h): source supports some mod-set/script synchronization and restart decisions. This does not establish an arbitrary-file live-reload contract. This workbench implements no watcher or hot reload and requires explicit fresh preparation/restart for changed definitions. It does not claim that the extender can never reload any content.

The native launch boundary independently validates the current canonical definition and an embedded reviewed Lua template. Arbitrary source editing/export retains its existing preservation rules, but unsupported/ambiguous records are not promoted to executable test fixtures.

## User-operated real-game acceptance

No CoE5 process is launched or controlled during implementation verification. With no other game running, follow steps 1–7 above using one uniquely named pair. Exercise the first-profile setup if offered. Confirm the extender/button/field, cast once, capture the actual effect/damage, close and quit. Report the session folder, UI errors, whether each step worked and what you observed.

Then change one supported field, verify Start becomes unavailable, apply/regenerate, and confirm the UI names the new draft. A further real cast requires your separate choice. Do not reuse campaign saves. Test cancellation/missing runtime files and the existing-game conflict without closing an unrelated process.

## Limits

The field forces an item-style attack and extends some ranges. A successful field result does not validate ordinary combat, eligibility, learning, fatigue, AI, true range, initiative/timing, saves or mod interactions. No native VFX preview is rendered. The optional report records your statement, not an automated verdict or a guarantee that visuals/audio are correct. The original generated manifest remains `gameTested: false` until separately reviewed; process exit alone never changes it.
