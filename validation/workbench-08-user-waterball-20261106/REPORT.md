# Workbench 0.8 user-operated acceptance — Waterball

Reviewed 6 November 2026 after the user reported **“done”** and supplied the newest session's files.

**Functional isolated preparation/launch/spell/close/exit flow: PASSED on the available logs and user completion report.** Visual/audio results and the stale-edit UI check remain unconfirmed. No application code or user session file was changed during this review; evidence was copied here for preservation.

## Completed cast

The completed cast is in the preceding app-owned session **a3f3919cd3b148ef96f05f3c6aa5fb9d**, rather than the newest supplied folder. Its launch record identifies the workbench's isolated executable/profile, source revision and owned PID **20556**, started at **11:03:33 CET**. Native logs confirm:

- CoE5 **5.43**, supported fingerprint, `game_code_check match=1`; official 2.13.0 staged runtime files still match their recorded hashes.
- The generated **.c5se sidecar** registered **Waterball**, Hydromancy **4**, level **1**, spell damage **5**, using **Hydromancer Staff** (weapon 1200).
- One test-menu button activation, one field open at **11:03:37.128 CET**, and exactly **one** `Spearman casts Waterball` line.
- The target took **4 damage**, using damage type **3 (piercing)**. Multiple weapon-attack lines concern the supplied area code **5**; they are not additional spell casts.
- One field close at **11:03:43.360 CET**, normal SDL/OpenGL shutdown, and session exit code **0**.
- All 20 recorded prepared/runtime/mod file hashes in this completed session still match.

This adds actual sidecar loading/casting evidence to the earlier combined-.c5m fixture evidence. The record describes this particular draft and supported Windows pair, not every generated definition.

## Other preparations

The newest supplied session **607f30137f864c269e78f9050950cd44** registered the same spell and exited with code 0, but contains no field activation or cast. Its source revision is identical to the completed session (`a2384848d6bbe6aea6849582c418d91a8150bf008ce5b32aaac8c29a74776b56`). It is therefore a subsequent launch, not a second successful cast or evidence of changed-draft invalidation.

The earlier **5f7376f5c7be417095aa36420f655895** launch is recorded as profile bootstrap. **8e24d77a6b8b438d9f41cb543addff73** remains prepared without a recorded launch. `analysis.json` records all four summaries and retained-file checks. No active CoE5 process was found during review, and none was started, controlled or stopped.

## Limits and remaining acceptance

The user reported completion, but supplied no screenshot or detailed account of the effect/sound. All optional impact/flight/sound fields in this draft are blank. Hydromancy/path 4 and the name Waterball do not themselves establish a water visual or water damage: this weapon explicitly uses piercing damage. No visual defect or visual correctness is inferred.

A change followed by a disabled Start button and regeneration is not observable from these records; the relevant source revisions are identical. That UI acceptance remains unconfirmed, while automated stale-state tests remain the separate offline evidence.

The field forces an item-style cast and extends some ranges. It does not establish ordinary combat, AI, true range, timing, saves, audio or general VFX correctness. The original generated `gameTested: false` manifest and the optional user-observation state were not automatically changed.

Evidence copies for the completed and newest sessions are in their corresponding subfolders beside this report. Runtime binaries and normal-profile files were not copied. No workbench change, publication, push or external message was performed.
