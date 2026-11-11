# Quit check — agent-operated follow-up, 2026-11-11

**Normal menu Quit passed in this fresh sequence:** two comparison battles → Back/Finish → Credits → return → click the actual Quit label. The owned isolated game exited with **code 0**, with no title-bar Close, force-stop or error. The earlier failure was not reproduced in this sequence; its cause remains unknown. **No Workbench or extender defect was confirmed and no production fix was made.**

The user changed the prepared manual check to an agent-operated test and explicitly confirmed desktop availability. This report records the agent's direct observations, not a human user's gameplay report.

## Setup and comparison

The normal Workbench workflow had prepared a new disposable session from `quit-check-workshop.c5m`, a byte-identical copy of the original two-weapon example. The previously completed session was not replayed. The unchanged published **0.18.0-rc.3** package was used (ZIP SHA-256 `46d37285f9aa3a80965191f83808a4a3cdf144154ef43acdf82ffe358290a777`), with the user's official **CoE5SE 3.2.2 / API 11** and **CoE5 5.43**. Game SHA-256 remains `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55`; plugin SHA-256 `87e70dead42341573889641447d04c700af359243696a57b32e89a4fac682e8a`. All 19 staged inputs matched. No other game was running.

**Start isolated test** rechecked and launched only that preparation. The main-menu test entry opened the official mixed comparison. Fixed settings remained piercing #3, carrier payload 12, base weapon damage 0, range 5, initiative 7, area 5; the roster stayed Deer #609 ×2 / Winter Wolf #487 ×1.

| Attempt | Applied/read-back visuals | Returned carrier / defenders | Saved lifecycle |
| --- | --- | --- | --- |
| 1 | Sprite 1 / Ballista bolt #7 / Flame #68 | Carrier #1; Deer #2/#3, Wolf #4 | One AI battle returned; Back closed field |
| 2 | Particle 2 / Fireball (fly) #65 / Blood Burst #34 | Fresh carrier #6; Deer #7/#8, Wolf #9 | One AI battle returned; Back closed field |

The same in-game Search/name-box route selected 65 and 34. Apply visuals confirmed revision 1 and readback before the second field. Battle was clicked **once per field**. After the second Back, Finish returned visibly to the main menu. No extra battles, VFX recording, source Apply or export were performed for this menu diagnosis.

The final journal contains two closed attempts, each with three requested/returned/verified defenders, one returned battle call, confirmed visual readback, returned close call, main-menu readback and four tracked inactive units. Final status is **finished**, no error message, original private visual values restored/read back. These facts do not establish complete record/allocation rollback, hits, attributed damage or attack-time positions.

## What the menu actually did

1. After Finish, the actual **Credits** label was clicked. The rolling native Credits screen visibly opened, demonstrating that this native menu action responded.
2. Escape had no observed effect on Credits. A normal mouse click on that screen returned visibly to the main menu. This is an observation, not a claim that Escape is documented to close Credits.
3. One click was placed directly over the **Quit** word, at approximately **(367,585)** in the captured **882 ×672 logical-pixel** game-window view. The game window disappeared and Workbench recorded **exited / exit code 0 / no error**. The title-bar X was not used and no process termination command was issued.
4. Workbench visibly showed the exited session. It was closed normally; desktop control ended.

Local screenshots `05-post-finish-menu.png`, `06-credits-opened.png`, `07-credits-returned-before-quit.png` and `08-workbench-exited.png` support the observed screen sequence. They and raw session/log data remain local. The process exit record alone would not identify which control was clicked; the input/screen observations establish the menu action separately.

## Interpretation and remaining uncertainty

There is **no reproduced general post-Finish menu lock** in this run. Normal Quit is now observed for this particular sequence. The earlier automated Quit coordinates were farther right than the successful text click, making an input/hit-region difference plausible. **That is a hypothesis, not a proven hitbox defect or a confirmed explanation.** Visiting Credits may also refresh menu state, so this test cannot establish direct Quit in an untouched post-Finish menu. No engine memory probing, hook patch, shared-record write or helper workaround was used.

A code fix would be speculative on the current evidence. If the problem is reported again, the smallest useful next comparison is direct text-label Quit immediately after Finish, without visiting Credits, in a new disposable preparation. Never replay either completed session. General GUI/input correctness, all display scales, failure cleanup and wider gameplay remain outside this acceptance.

## Preservation and publication

All **1,302** files present before preparation were compared: only the expected last-selected-session pointer changed. Completed/reference session files, the original source and the disposable source copy remain unchanged. All **19 staged inputs** still match; the normal game executable and frozen ZIP are unchanged. Normal profiles, saves, installed mods and other game processes were not operated.

This is an evidence/documentation-only follow-up. No application, helper or extender code changed; no new package or release asset was built or replaced. Public updates contain written findings only. Screenshots, raw logs, receipts, profiles and runtime files remain local. The existing script suite was rerun for this documentation follow-up: **322 passed, 0 failed**. No production code changed, so compiled/native/model checks were not repeated; their earlier scopes remain unchanged and do not become new gameplay evidence.
