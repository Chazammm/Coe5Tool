# Mixed area comparison: real desktop and game validation

**Passed for this bounded case.** On 2026-11-08 the agent, explicitly authorized to operate the desktop, ran two native-AI battles in one new disposable CoE5 5.43 / CoE5SE 2.13.0 + local roster-v1 session. In each battle, one area-code-5 attack damaged both Spearman and Levy instances. Both fields closed with records restored; Finish returned to the main menu and normal Quit produced exit code 0. Desktop review and separate export changed only impact `34` to `68`.

The folder retains its original `manual` name because preparation preceded the user's request to automate. `PREFLIGHT.md`, retained locally, is the unchanged preparation report, not the current outcome. The launcher/launch receipt still describe a user operator; the actual operator for this run was the agent. The earlier [area-0 mixed comparison](../mixed-visual-comparison-20261108-3153f3/REPORT.md) remains separate evidence with its original exit limitation.

## Setup and compatibility

| Item | Verified value |
| --- | --- |
| Game | CoE5 5.43; build `6aec6a32-13728000`; SHA-256 `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55` |
| Extender base | Official 2.13.0; base plugin SHA-256 `26861bb0b6dffaa7150ed239e9eba4e934a955688d101c81161cf395190dd254` |
| Mixed dependency | Unchanged local roster-v1 plugin, SHA-256 `46c982fcef57c60fa68a6fcbcc624b6ce2e78d36526991508c8d4d5ff4826ec7` |
| Workbench | Current v0.16 desktop DLL, SHA-256 `32287b796f07bbc4b813c95942a1ed8c665999db8025f3c0362550da61b544d3`; GitHub baseline `6e07c5752c16534c5a186a78226fe7d2e75d066d` |
| Source / weapon | Native standalone fragment `Mixed-Area-Needle.c5m` / Mixed Area Needle |
| Private carrier | WB Ranged Carrier, monster slot 2000, ranged attack references private weapon slot 1200 |
| Damage / payload | Piercing #3; weapon base damage 0; carrier attack-row payload 8 |
| Range / initiative / area | 5 / 5 / 5; fixed across both battles |
| Defenders per battle | Spearman #13 × 3, Levy #27 × 3 |
| Flight | Sprite mode 1, Ballista bolt #7, unchanged |
| Impacts | Battle 1 Blood Burst #34; Battle 2 Flame #68 |

The production validator prepared and started the existing canonical fixture, with its normal fingerprints, current-session and existing-process safeguards. No incompatible hooks, generic world spawning or shared-record writes were introduced. The disposable runtime/profile was separate from Steam and the normal profile. No unrelated game process was present at preflight. All **19 fingerprinted staged inputs matched after exit**.

The [official area documentation](https://www.illwinter.com/coe5/coe5modding.html) describes nearby-square counts. Code 5 is not a radius or a guarantee of five occupied targets. Native deployment, movement, armor/parry and randomness remained active. No forced cast, substituted attack or placement override was used. Flame remained a visual setting on a piercing weapon.

## What the game actually did

Both battles spawned six verified native defender instances, IDs 2–7. Fresh callbacks requested the same two types/counts. These IDs were reused after rollback; they are not persistent references.

The combat log has two **Mixed Area Needle** attack sequences per battle. The first, in round 0, hit Spearman unit 2 at `(17,10)` for 7 damage and unit 3 at `(17,9)` for 5. The second, in round 1, affected both types within the same attack sequence:

| Victim | Attack-time position | Logged damage, battle 1 | Logged damage, battle 2 |
| --- | --- | --- | --- |
| Spearman #13, instance 3 | `(16,9)` | 5; died after its earlier hit | 5; died after its earlier hit |
| Levy #27, instance 6 | `(16,8)` | 4 | 4 |
| Levy #27, instance 7 | `(16,7)` | 3 | 3 |

Each sequence explicitly names the carrier and custom weapon, with `calcaoe ... targets 5`, `forceaoe 1`, and `weaponhit ... dmg8, dt3`. Empty selected squares are also logged. This establishes cross-type area damage for this fixture independently of the animation. Spearman instance 4 and Levy instance 5 had no named Needle hit. Later native Spear attacks killed the private carrier; the battle was not a forced one-attack test. Identical rolls across these two fixtures do not establish a damage/resistance formula or independent random samples.

[Numbered attack excerpts](area-attack-excerpt.txt) preserve both round-1 sequences from the raw log. Coordinates describe attack-time log locations, not a new live position API. Initial native deployment is visible in [the pre-attack field](03-battle-1-start.png).

## Captured visuals and controls

Continuous 60-fps, game-window-only recordings captured both complete battles. [Blood Burst clip](battle-1-area-clip.mp4) and [Flame clip](battle-2-area-clip.mp4) are 16-second excerpts, beginning at 13 seconds in their full local recordings. The sprite flight and the distinct red versus flame impacts can be inspected in those recordings. The report does not infer hits from their appearance.

- [Blood Burst area frame](25-blood-mixed-area-hit.png).
- [Flame area frame with the Spearman/Levy log](24-flame-mixed-area-hit.png).
- [Applied Flame values](10-applied-flame.png) and [two saved battles](12-two-battles-saved.png).

Flight stayed mode 1 / #7. Only impact changed, with pending, Apply and readback visible before the second battle. The game client was 1100 × 800 physical pixels, mapped to 880 × 640 logical client units at the current display scaling. Comparison controls were on their own menu; native battle playback left the lower-left event log exposed. The native log pane clipped long attack names horizontally; the full debug log preserves them. Other window sizes/DPI and every catalog effect were not tested.

## Field closure and normal exit

At 14:39:07 and 14:41:13 local time, the extender logged `test_field_closed` and `wb_roster_closed version=1 made=6 requested=6 callback_ok=1 records_restored=1`. Both saved samples independently record `closed=1`, `restored=1`. This is restoration of the owner's snapshotted records/globals, not proof of a whole-engine rollback.

**Finish** visibly returned to the [main menu](13-finish-main-menu.png). Clicks near the center/right of the displayed Quit row initially did nothing. Preferences still opened and its Exit returned to the menu, without changing settings. Clicking directly on the visible **Quit** text at logical client `(366,555)` ended the exact owned PID **980** at about 14:47:21. No forced process termination or window-close shortcut was used. The persisted production session status is **exited**, **ExitCode 0**, **Error null**, and the process was absent afterward. These observations establish normal menu exit for this run; they do not retroactively repair the earlier area-0 run.

A validation-helper limitation occurred after exit: its separately acquired Process object had not retained an exit-code handle, so reading `Process.ExitCode` threw after `WaitForExit`. It copied the logs, receipt and production ledger first, but did not produce its promised `exit.json`. The **production Workbench** exit handler had already persisted code 0 in `session.json`. The exit conclusion uses that record plus the actual Quit action and process disappearance, not a fabricated helper receipt. Local `exit-integrity-verification.json` documents the distinction. This did not prevent production result review/export. The validation-only launcher was not republished or rerun.

## Actual desktop review and export

After game exit, the actual current Windows app opened the original native source read-only. Its matching-result banner identified Mixed Area Needle and Spearman #13 × 3 / Levy #27 × 3. Review automatically selected **Battle 2 · Sprite 1 / Ballista bolt #7 · Impact Flame #68** and clearly showed **Impact effect: 34 → 68**. The two unchanged flight settings remained unselected.

[Impact review](20-desktop-impact-review.png) and [per-instance readings](21-desktop-per-unit-readings.png) distinguish readback, a returned AI battle call and a personal visual observation. The personal checkbox remained unchecked. The saved receipt alone does not prove visual correctness.

| Instance / native type | HP before → after, each battle |
| --- | --- |
| 2 / Spearman #13 | 6 → -1 |
| 3 / Spearman #13 | 6 → -4 |
| 4 / Spearman #13 | 6 → 6 |
| 5 / Levy #27 | 5 → 5 |
| 6 / Levy #27 | 5 → 1 |
| 7 / Levy #27 | 5 → 2 |

Physical damage has no elemental resistance percentage in this receipt. HP differences do not identify an attacker; the named game-log evidence above does.

**Apply selected to draft** was followed by the native separate-copy export dialog. The app reported [exported, no pending changes](22-desktop-exported.png). Byte comparison established:

- Original: 257 bytes; SHA-256 `e68c5db9de69641d0fb427cce82058a8f99889809dd68d321b2a6d27293e7eb4`, unchanged.
- Export `Mixed-Area-Needle.compared.c5m`: 257 bytes; SHA-256 `6e1a127bac15547c36a3875cd1e836ca606762a674d670c611ab7af6d2c3f4cf`.
- Exact equality to the original with only `look 34` replaced by `look 68`. Area, damage, flight, comments and all other bytes were preserved. No participants, HP or private carrier text entered the native fragment.

## Offline verification and scope

**249/249 JavaScript tests passed**, zero skipped/failed. The added regression binds area 5 and all six defender identities, rejects mismatched area/missing defenders, returns only the selected impact, and retains pending area/initiative edits. Its readings are synthetic; the actual game evidence is separate. Previously working schema-3/older result, conflict, pending-edit and source-preservation tests remain in the suite. No application or extender implementation changed, so their existing compiled outputs were reused; earlier compiled/Lua checks were not rerun or claimed as new results.

Local evidence lives in this folder. Full raw files are under `observed-b5bb2f4aa8d04e7f87c2a1228f0d9d94/`: combat/extender logs, launch record, production ledger and result INI. Full `battle-1-blood.mkv` and `battle-2-flame.mkv`, export and integrity JSON remain local. Session `cbfecb30b08f4638aff95e283e6dc4c1`, run `b5bb2f4aa8d04e7f87c2a1228f0d9d94`, remains retained in the app's disposable test root. Publication includes only this report, selected game/app captures, short clips and the curated log excerpt; it excludes runtime binaries, profiles, raw session/candidate files and user data. No downloadable release was created or replaced.

This verifies one physical ranged weapon, area 5, two ordinary infantry types and two impact visuals. It does not establish every area code/shape, special payload, elemental resistance, AI, VFX, waves, mods, campaign/save compatibility or Vanilla-only testing. The most useful next capability is a field-owned read-only battle-position/attack-observation API, to correlate area selections and per-instance hits without parsing debug logs; its calling contract still needs verification.
