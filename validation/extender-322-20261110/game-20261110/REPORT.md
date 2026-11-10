# CoE5SE 3.2.2 real-game acceptance · 2026-11-10

**Passed for two bounded cases:** one resumed selected-spell forced cast with recorded-value return/full-source export, and one separate original Fireball native-AI battle. Both fields returned to the main menu and both owned game processes exited normally with **code 0**. No game or Workbench implementation change was required.

Used the exact published **0.18.0-rc.1** package, CoE5 **5.43**, and checksum-verified official CoE5SE **3.2.2 / API 11**. These results supersede the earlier “fresh game acceptance pending” statement for these two cases only. Mixed 3.2.2 remains unavailable; other standalone/visual-comparison combinations are not established by this test.

## What was observed

| Case | Game/log evidence | Recorded helper facts | Visible evidence |
| --- | --- | --- | --- |
| Selected Harbor Ember Test | **One** named cast by Spearman; private Harbor Ember attack, payload 8, damage type 4, area 0, look 34; target instance #2 took **3 damage** | Baseline impact 68, applied/read back impact **34**, flight **2/65** unchanged; baseline sample has casts=0, applied sample has casts=1 | Golden/orange particle trail toward the target, then a compact red burst over its square. [Flight](harbor-flight.png), [impact](harbor-impact.png), [three-second clip](Harbor-single-cast.mp4) |
| Original Fireball #445 | Offered **Pyromancer #55** was selected; **Battle (AI)** was pressed once; two named Fireball casts via weapon **#54** dealt **3**, then **5** damage to Spearman, killing it | battles=1, forcedcasts=0; stage=closed, knownunchanged=1 for checked numeric fields; runtime payload 15, damage type 4, area code 5, flight **6/65**, impact 68 | A bright golden/orange trail and a yellow/orange multi-square flame burst were captured for each cast. [First flight](fireball-flight.png), [first impact](fireball-impact.png), [second impact with logged 5 damage](fireball-second-flame.png), [11-second clip](Fireball-native-AI.mp4) |

The [Harbor combat excerpt](spell-combat-excerpt.txt) and [Fireball combat excerpt](original-combat-excerpt.txt) are direct, selected game-log lines. The saved helper's one battle return alone does **not** count AI casts or establish named use; the two Fireball casts are established separately by the log and recorded frames. Debug logs are incident evidence here, not a new stable Workbench hit-attribution API.

Only one Harbor cast and one original AI battle were requested. No force-cast substituted for AI, no reset/retry cast was used for footage, and the controls left the lower-left event log readable. The main-menu Quit text was selected normally; no process was killed.

## Source/result round trip

The packaged four-definition example was opened through the native Open dialog after the games. The latest saved Harbor result opened as impact **68 → 34**, one completed cast call, with the explicit warning that saved values do not establish appearance. The shared local weapon link warning correctly identified one other spell using Harbor Ember.

Only **Use Impact effect** was selected. The optional personal-observation checkbox remained unchecked: visual evidence is reported here separately. Apply changed the desktop draft, then native Export wrote a new, separately named full-source copy.

A byte comparison establishes that both original and export are **748 bytes** and the sole difference is line 18:

```diff
-look 68 # Flame reference; does not set damage type
+look 34 # Flame reference; does not set damage type
```

All four definitions, comments, formatting and other values were preserved. The retained comment was deliberately not rewritten by this single-value return. The original packaged and project example files remained identical. The original Fireball workflow remained read-only; no built-in definition was cloned or returned to a draft.

## Isolation, closure and preservation

- Reused the two unused preparations identified in the earlier local manual plan. Each passed Workbench's normal recheck immediately before Start; no ownership/runtime/session check was bypassed. No other CoE5 or Workbench process existed at preflight.
- All **19** staged runtime/mod inputs per session matched before and after. Logs identify API 11/game 5.43; the official plugin fingerprint matches the independently pinned 3.2.2 release. No local roster DLL was used.
- Harbor Close test and original Close visibly returned to the main menu. Original review showed stage **closed**, one battle return, zero stop requests and process exit **0**. Both session records say exited/0 without errors.
- The original helper reported its checked numeric fields unchanged. That is not proof of complete record equivalence or every memory cleanup operation. Isolation plus normal process exit bounds the test state.
- Of **1,216** baseline files under the local Tests folder, only the two tested session records and the latest-session pointer changed. No unrelated retained session file changed. New logs/results/launch receipts belong to these two sessions.
- The installed game executable, original examples, published ZIP and legacy private roster DLL remained unchanged. No Steam/mod installation, normal profile, campaign/save or previous completed test was used.
- Workbench closed normally after export. Final process checks found zero Workbench/game processes. Desktop interaction ended before offline media/report work.

Exact session IDs, launch records, raw result INIs, source/runtime paths, complete logs and preservation/hash reports remain private local evidence beside this report; they are not published.

## Capture and checks

The restricted recorder initially could not access Windows Graphics Capture. Those failed preflights are not treated as footage. Capture of each exact owned game window was then verified by decoding and inspecting a preflight frame **before** its cast/battle.

Both continuous recordings decoded successfully at **1100 × 800 / 60 fps**: Harbor 1,519 frames (25.317 seconds), Fireball 3,623 frames (60.383 seconds). The shared uncaptioned clips are full-frame excerpts, without audio, interpolation or invented frames: Harbor source seconds **20.7–23.7**, Fireball **15.4–26.4**. Still times: Harbor flight 21.55 / impact 22.20; Fireball flight 17.80 / first impact 18.65 / second impact 22.25. These are capture times, not engine timing measurements.

The unchanged source passed **309 JavaScript regressions** again. The earlier **88 compiled native checks** remain the offline policy/source evidence; they were not relabeled as gameplay checks or rerun unnecessarily. Actual packaged result review and protected export were observed in this run. An initial local verification assertion incorrectly expected a comment-free line; it was corrected to compare the entire expected source with only the numeric token replaced. The application export needed no fix.

## Remaining limits and package status

These tests establish the specific selected spell/weapon and Fireball paths on this exact runtime. They do not validate every mod/weapon/effect, ordinary AI casting for the forced Harbor case, range/timing rules, damage/resistance formulas, save compatibility, complete shared-record identity, mixed rosters or standalone melee/ranged comparison on 3.2.2. Flame burst coverage is not evidence of damage to multiple targets: this original test had one defender. The historical Feebleminded event remains unexplained; no further diagnostic casts were added.

The exact downloadable RC ZIP is **unchanged**, SHA-256:
`4d7665e0b7c3a697ab15ce91c5705d4948dd47b16694d8b6a1e392c17274200b`.
Its conservative preview/pending text was compiled before this follow-up and remains in that frozen artifact. This evidence update does not rebuild, replace or promote a release. [Existing prerelease download](https://github.com/Chazammm/Coe5Tool/releases/tag/v0.18.0-rc.1).

The most useful next development step remains a bounded Lua-only mixed-group adaptation to official API 11, including new ownership/cleanup receipts and separate gameplay acceptance. No core port or mixed test was attempted here.
