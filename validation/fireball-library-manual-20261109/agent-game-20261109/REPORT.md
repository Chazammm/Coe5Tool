# Fresh Vanilla Library Fireball · actual game result

Date: 9 November 2026, Europe/Berlin.

**Passed for this bounded original-record observation.** The user delegated the prepared manual test to the agent. The existing fresh preparation was launched once through the source-built Workbench, one native AI battle was requested, Fireball was actually cast twice, both flight/impact sequences were captured, the field closed and the isolated game quit normally with exit code 0. No forced cast, reconstructed weapon or editable original was used.

## Session and actual AI evidence

| Item | Evidence |
| --- | --- |
| Source entry point | Current source-built Workbench → Vanilla Library → Fireball spell #445 → original observation. The real fresh preparation is documented in the [parent report](../REPORT.md). |
| Runtime | Hash-verified CoE5 5.43 / official CoE5SE 2.13.0. Native log: game build `6aec6a32-13728000`, API 10. Only the extender and this test mod were enabled. |
| Session | `162197df1ba9477bafc0d0551b4d6c6d`; mod `WB_Observe_mw9sz4ad`; result run `996a1f365ab349e89179fda9d0b5ce12`. Owned process PID 36332, started by this test. |
| Native selection | Game offered 33 eligible casters. Explicitly selected **Pyromancer #55** from the actual picker. Native open event records monster=55, spell=445, enemy=13, count=1. |
| One requested AI battle | Clicked **Battle (AI)** once. Helper reports battles=1, forcedcasts=0, stops=0. A battle-call return is not a cast count. |
| Round 0 | Native `log.txt` lines 193–203 identify spell 445, **Pyromancer casts Fireball**, the Fireball attack against Spearman instance #2, payload 15 / dt4, and **3 damage**. |
| Round 1 | Lines 223–232 identify the same spell/caster, another named Fireball attack, **5 damage**, then Spearman's death. Caster instance is #1. These are actual combat-log events, not HP-based attribution. |

The native record's selected metadata/readback is path 3 / level 2, effect weapon #54, payload 15, weapon damage field 0, damage type 4, area code 5, flight mode 6 / flight #65 / impact #68. Nothing was changed to make this test behave differently. Two logged casts are distinct from the helper's one returned AI-battle call. Shield-parry reductions of 0 and 1 were logged; no damage or resistance formula is inferred from these rolls.

## Captured visuals

Verified recording **before** requesting the battle: a four-second menu capture decoded to **124 frames at 1100 × 800**, and an extracted frame showed this exact isolated test menu. The actual continuous battle recording contains **2,105 frames over 35.084 seconds**, at 1100 × 800. A silent eight-second MP4 trims 18.5–26.5 seconds of that real recording, preserving both attacks. No extra battle or cast was requested for footage.

| Recorded event | Full-recording seek time | Local evidence |
| --- | --- | --- |
| First flight | 20.0 s | `first-flight.png`: a bright yellow-white streak leaves the caster, with the named Fireball cast in the event text. |
| First impact | 20.9 s | `first-impact.png`: flame patches at/around the target and a red 3, with the matching 3-damage message. |
| Second flight | 23.9 s | `second-flight.png`: another streak, with the second cast after Battle Round 1. |
| Second impact | 24.4 s | `second-impact.png`: flame patches and a red 5, with the matching 5-damage/death messages. |

These are actual decoded game frames, not illustrative previews. The times identify extraction points in the recording, not precise engine timings. Native logs provide event order rather than synchronized video timestamps. The cast messages, round progression and matching damage numbers connect the two sources. Flame appearing on neighboring squares does not prove those squares contained or damaged other units. Audio was not recorded or evaluated. At the observed size, the bottom-center controls left the lower-left cast/damage log readable; Battle and Close clicks worked. Move, resizing, long overflowing log lines and other DPI settings were not tested.

## Close, exit and fresh result review

- Clicked **Close** only after the AI battle returned. Observed the main menu again. Native `coe5mod.log` line 347 records `test_field_closed`; the bound helper's final stage is closed, knownunchanged=1.
- Clicked the actual **Quit** text in this isolated game's main menu. Workbench recorded status=exited, **ExitCode=0**, Error=null. No game process was terminated or replayed.
- Returned through **Vanilla Library → Fireball #445 → Previous observations…**. Selected the new **162197df…** row, not either older Fireball run. **Recorded original observation** displayed the correct actor/spell/weapon, requested targets, one battle-call return, closed stage and exit 0. **Start saved test** was disabled and no Apply action was offered.
- The summary explicitly retained unknown hit/damage/position/VFX attribution. Its **User-reported visual outcome** remained **Not recorded**: the agent's actual observations and recording are documented here rather than impersonating a personal user report in that field.
- The editor still showed **No source open**, zero definitions and the original CoE5SE target. No draft was opened, edited, applied or exported. Closed Workbench normally with Alt+F4; subsequent process inspection found no CoE5 or Workbench process. Desktop interaction ended before offline evidence analysis.

## Preservation and limits

All **14 source runtime inputs** retain their verified hashes, and all **19 staged inputs** still match the prepared manifest. Of **1,106 files** fingerprinted before the launch, **1,105 were unchanged**; only this session's metadata changed from prepared to exited. Nine new launch/config-backup, loader-state, context/result and log files are confined to this same disposable session. Nothing disappeared and no other retained session changed. The installed executable and immutable old ZIP hash are unchanged.

The reviewed helper contains no shared spell/weapon setters, stand-in substitution, forced fire or partial clone. The original native definitions were observed, not intentionally edited or exported. Eleven numeric weapon fields were checked by the helper before/after its lifecycle; this is **not** proof of complete record-memory equivalence or every internal allocation's cleanup. Field return, main-menu visibility and normal process exit have separate evidence above. No campaign, normal profile, save, installed mod or Steam installation was used for writes.

This verifies one Fireball/caster/target configuration and its Library → preparation → launch → native AI → recording → close/Quit → fresh-summary journey. It does not establish every native spell/weapon, AI choice, targeting/range/timing, resistance, area damage to multiple units, VFX combination, ordinary campaign behavior, save compatibility, lossless cloning or Vanilla-only testing. The completed session is now evidence; any repeat must use a fresh preparation.

No reproducible implementation failure prevented this workflow and no code change was needed. Existing **289 script / 70 compiled checks** remain earlier offline evidence, not freshly rerun game tests. This task added the actual gameplay, bound-result, capture and preservation checks documented above.

## Evidence and distribution

Local-only evidence in this folder includes `verification.json`, `session-after-exit.json`, `launch.json`, copied native logs/context/result, `01-ready.png` through `10-no-source-changes.png`, `capture-check.mkv/png`, `fireball-ai-battle.mkv`, `Fireball-library-AI.mp4`, the four full-resolution frames and `contact-sheet.png`. Raw paths, private session data and game captures are excluded from the public source repository; only curated documentation is published.

**No downloadable package was built or published.** The local 0.16.1 ZIP remains SHA-256 `ac07b8c11a9f26553aa99fd12647a074529f0d50d0b6245c1aa720ebacb4a8a8` and does not contain the newer source-built Vanilla Library workflow. No GitHub release was created or replaced.
