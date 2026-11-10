# Official mixed-group game acceptance · 2026-11-10

**Passed for one bounded ranged mixed-group case.** The exact published Workbench **0.18.0-rc.2** ZIP resumed its previously unused preparation, opened the official group field, completed one native AI battle, saved/read the bound receipt in the actual desktop app, closed the field and quit normally with **exit code 0**. No implementation change was needed.

The attack hit one Winter Wolf. **This run did not establish area damage to multiple target types.** Cancellation, stop, allocation failure, melee and other configurations remain outside this real-game acceptance.

## Runtime and preparation

- The unchanged release ZIP SHA-256 is `b7683527bf14c4f7616b8ecf2925c20599b664db0a37f85647ec1c397702e0b6`.
- User-owned **CoE5 5.43**, game SHA-256 `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55`, official **CoE5SE 3.2.2 / API 11**. All 19 staged files matched before and after the test. The official plugin remained `87e70dead42341573889641447d04c700af359243696a57b32e89a4fac682e8a`; no private roster plugin or core patch was used.
- No other game was running. The user explicitly authorized desktop control; only the newly started isolated process/profile was operated. Its exact executable/session binding and active-process checks passed through **Prepared tests → Check before resuming → Start saved test**.
- Native weapon **Official Group Needle**, private weapon **#1200**, private **WB Ranged Carrier #2000**, carrier unit **#1**. Explicit attack payload **12**, weapon base damage **0**, piercing damage **#3**, range **5**, initiative **7**, area code **5**. Flight mode **2 / Fireball (fly) #65**, impact **Flame #68**. The fire-like visuals did not select fire damage.
- Prepared native defenders: **Deer #609 ×2 / Winter Wolf #487 ×1**. No source, payload, area, visuals or target choices were changed in game.

## What was observed

The displayed isolated main-menu entry loaded the test helper. The field visibly contained the private carrier, two Deer and a blue Winter Wolf. The official API returned exactly three unique defender IDs in the requested group order; owner/type/private-attack checks succeeded before the battle. **Battle (AI) was clicked once**; no forced cast, weapon substitution, second battle or capture retry was used.

The game log names **one WB Ranged Carrier attack with Official Group Needle**. Its area calculation selected five target cells, including empty cells. The named attack hit **Winter Wolf unit #4 at logged battle cell (17,10)** for **11 piercing damage (dt3)**. Neither Deer has a named hit from that weapon in this battle. The Wolf later used Icy Breath and the Deer used Antlers; the private carrier died and the native battle returned. These log lines are incident evidence, not a stable hit-attribution API added to Workbench.

The recording shows a fan of golden particle trails followed by several bright orange/yellow flame bursts. [Flight frame](needle-flight.png) and [impact frame](needle-impact.png) come from source times **26.80 / 27.35 seconds**. The [2.90-second attack clip](Official-mixed-one-attack.mp4) uses source seconds **25.60–28.50**, full-frame, without audio, overlays, interpolation or invented frames. Some visible bursts are over nearby squares without a named hit: the animation is not proof of multi-unit damage. [Combat excerpt](combat-excerpt.txt).

The compact bottom-center Battle/Close/Move controls remained readable and did not cover the lower-left event log. After return the button said **Battle returned**, then **Close** returned visibly to the main menu. The normal **Quit** action ended the owned game process; no process was killed.

## Saved readings and actual desktop review

| Native type | Returned unit ID | Setup cell | HP before → after return | After-return cell |
| --- | --- | --- | --- | --- |
| Deer #609 | #2 | (18,9) | 6 → 6 | Unavailable |
| Deer #609 | #3 | (18,11) | 6 → 6 | Unavailable |
| Winter Wolf #487 | #4 | (18,10) | 13 → 2 | Unavailable |

The strict `wb-official-mixed-1` receipt bound this launch/session/source/roster and reported: requested/returned/verified **3**, **one** battle call returned, **zero** stop requests, status **closed**, close attempted/returned **1**, main-menu readback **1**, tracked inactive **4**. This establishes those helper readings, **not full allocation/record rollback**. All after-return positions were unavailable; the app preserved that rather than substituting setup coordinates. Physical damage has no elemental resistance sample in this receipt.

After normal exit, **Refresh** in Prepared tests updated process status and displayed **Recorded mixed targets**. The actual Windows view showed all three rows, setup cells, unavailable after-return cells, net HP changes, close/main-menu facts, unknown weapon hits/attack-time positions and the rollback limitation. One scroll exposed the whole table at **1107 ×794** logical pixels/current scaling. No summary error appeared; replay was refused as already used. The recorded HP values alone still do not identify an attacker: the 11-damage attribution above comes separately from the named game log.

This fixed route is **read-only**. No draft Apply, live visual return or export action was expected or performed. It does not validate the full mod, ordinary campaigns, AI in general, damage/resistance formulas, save compatibility or every visual effect.

## Capture and preservation

Restricted capture preflights could not access the game window. Authorized window-only capture was then decoded and its frame inspected **before** opening/running the battle. The continuous file decoded completely: **1100 ×800, 60 fps, 3,004 frames, 50.067 seconds**. The extracted clip decoded: **174 frames / 2.90 seconds**. Capture time is not engine timing. A failed timestamp-overlay contact-sheet command was replaced with a plain inspection sheet; it did not change any game input or evidence frames.

The local evidence folder retains raw logs, receipts, before/after session records, screenshots and full video. Only this portable report, the game-only flight/impact frames, short clip and selected combat lines are published; private sessions/profiles/runtime/raw logs remain local.

All **19** staged inputs, the original native source, configured game executable and frozen ZIP remain unchanged. No pre-existing file outside the tested session changed, apart from the expected last-selected-session pointer. The other retained sessions, normal profiles, saves, installed mods and Steam installation were not operated. The new session remains consumed evidence and must not be replayed.

## Remaining acceptance and package status

Still unobserved in game: cancel-before-battle, stop during combat, refused/partial allocation, melee/other damage or visual combinations, more/larger groups, and mixed live comparison/return (not implemented on this route). Their existing offline coverage does not become gameplay evidence. A fresh group/placement would be needed to examine area hits on two types; this one named Wolf hit is inconclusive for that goal.

No new package was built and no release asset was replaced. The published **rc.2 ZIP is byte-identical**; its embedded pre-acceptance wording describes the release state. This follow-up supersedes pending statements only for the bounded run above. The release remains a prerelease, with wider acceptance and full rollback unestablished.

## Offline follow-up

The publication checkout passed all **317** existing script checks after the documentation update. No production source/helper was changed, so no replacement build was made. The actual desktop result review exercised the native strict reader on this real session/receipt, including its runtime/source association. Earlier 97 compiled and 20 API-model checks remain separate offline evidence.
