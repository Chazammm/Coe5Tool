# Official mixed visual comparison — actual game follow-up

**The two-battle comparison, recorded review and protected export passed for this bounded case. The main-menu Quit-button check did not pass.** Both fields closed, Finish returned to the main menu, and a normal title-bar Close request exited the owned game with **code 0**. Quit clicks and Escape had no observed effect first; no process termination command was used. That menu issue remains unresolved, so this is not an unqualified complete acceptance pass.

## Exact setup

The unchanged published **0.18.0-rc.3** ZIP was used, SHA-256 `46d37285f9aa3a80965191f83808a4a3cdf144154ef43acdf82ffe358290a777`. Its existing unused preparation passed **Prepared tests… → Check before resuming → Start saved test** in the actual extracted Windows application. No stale/used preparation was replayed. The user explicitly confirmed the desktop was available; no other game was running.

User-owned **CoE5 5.43**, game SHA-256 `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55`, official **CoE5SE 3.2.2 / API 11**, plugin SHA-256 `87e70dead42341573889641447d04c700af359243696a57b32e89a4fac682e8a`. All 19 staged inputs matched before and after. No extender core modification or private roster plugin was used.

Selected native definition **Official Comparison Needle**, private weapon **#1200**, **WB Ranged Carrier #2000**. Fixed settings in both attempts: **piercing #3**, explicit carrier payload **12**, base weapon damage **0**, range **5**, initiative **7**, area code **5**. Requested roster each time: **Deer #609 ×2 / Winter Wolf #487 ×1**. No source, damage, payload, area or roster change accompanied the visual changes.

## Observed battles and visuals

| Attempt | Applied/read-back visuals | Actual returned identities | Named tested-weapon evidence |
| --- | --- | --- | --- |
| 1 / revision 0 | Sprite mode **1**, Ballista bolt **#7**, Flame impact **#68** | Carrier unit **#1**; Deer **#2/#3**, Wolf **#4** | One named carrier attack; Wolf #4 at logged cell **(17,10)** took **11 piercing damage** |
| 2 / revision 1 | Particle mode **2**, Fireball (fly) **#65**, Blood Burst impact **#34** | Fresh carrier unit **#6**; Deer **#7/#8**, Wolf **#9** | One named carrier attack; Wolf #9 at logged cell **(17,10)** took **11 piercing damage** |

**Battle (AI) was clicked exactly once per field**. No forced attack, shared-record replacement, capture retry or additional battle was used. After the first battle returned, **Back** closed the field. The in-game searchable pickers found numeric **65** and **34**; Pending changed first, then **Apply visuals** showed revision 1 and explicit readback. The second **Open fresh mixed group** produced the separate identities above. After its battle returned, Back closed that field too.

The game log identifies the selected named weapon and `dt3`; it is separate incident evidence, not a public hit API. **Only each Winter Wolf has a named hit from the tested weapon. Neither Deer has one.** Area code 5 also selected empty cells. This run does not establish area damage to multiple native types, a damage formula or resistance behavior. Equal random outcomes across these two fixtures are not a general rule.

Actual recording frames show:

- Sprite bolt flight (local evidence: `bolt-flight.png`), source **24.85 s**, followed by Flame impact (local evidence: `flame-impact.png`), **25.30 s**: a fan of pale bolt sprites and bright orange/yellow bursts. Three-second clip (local evidence: `Official-comparison-bolt-flame.mp4`), source **23.80–26.80 s**.
- Particle flight (local evidence: `particle-flight.png`), source **32.00 s**, followed by Blood Burst impact (local evidence: `blood-impact.png`), **32.55 s**: golden particle trails and red patches/bursts. Three-second clip (local evidence: `Official-comparison-particle-blood.mp4`), source **30.80–33.80 s**.

The clips are full-frame, without audio, overlays, interpolation or invented frames. A window-only recording preflight was decoded and inspected before either battle. Both continuous files decoded fully: **1100 ×800 / 60 fps**, **3,620 frames / 60.334 s** and **3,623 frames / 60.384 s**. Capture time is not engine timing. The simple video-probe wrapper initially could not find ffmpeg on PATH; the existing verified capture ffmpeg was then used by absolute path. No game action was repeated for that tooling issue.

The bottom-center controls were readable and left the lower-left log lane visible in both battles. The native event log retained older lines when a fresh field first opened; those lines were not treated as evidence for the second battle. Per-attempt identities and the subsequent new log entries distinguished the battles.

## Recorded facts and desktop return

For both attempts, the strict journal reported requested/returned/verified **3**, one battle call returned, **zero** stop requests, visual readback confirmed, status **closed**, close attempted/returned **1**, main-menu readback **1**, and **four tracked units inactive** after closure. Final status was **finished**, no error message, and the three original **private visual values** were restored/read back. This is not a full allocation or record-rollback receipt.

| Attempt | Defender | Setup cell | HP before → after battle return | End cell |
| --- | --- | --- | --- | --- |
| 1 | Deer #609, unit #2 | (18,9) | 6 → 6 | Unavailable |
| 1 | Deer #609, unit #3 | (18,11) | 6 → 6 | Unavailable |
| 1 | Winter Wolf #487, unit #4 | (18,10) | 13 → 2 | Unavailable |
| 2 | Deer #609, unit #7 | (18,9) | 6 → 6 | Unavailable |
| 2 | Deer #609, unit #8 | (18,11) | 6 → 6 | Unavailable |
| 2 | Winter Wolf #487, unit #9 | (18,10) | 13 → 2 | Unavailable |

No elemental resistance reading applies to this physical case. Setup/end readings are not attack-time coordinates. HP changes do not identify hits or attackers; named Wolf-hit attribution above comes separately from the combat excerpt (local evidence: `combat-excerpt.txt`). No attribution was inferred for the Deer or for an empty-cell animation.

After exit, **Refresh** in Workbench changed the session to **exited / code 0 / no error**, refused replay as used and offered **Review saved values**. Opening that result with no source correctly required a matching draft before Apply. Opening the original complete two-weapon example produced its saved-values prompt. The actual review exposed two distinct battles: baseline **no settings changed**, then **impact 68→34 / flight mode 1→2 / flight effect 7→65**, plus the correct per-battle unit readings and explicit unknown-hit/rollback limitations. The operator did not tick the personal-user-observation checkbox; the visual evidence above is the agent's recording inspection, not a user claim embedded in saved values.

Only the three selected visual values were applied. **Export copy** wrote a unique new native file. Its **313 bytes** match the original **312 bytes** exactly after those three replacements; the unrelated weapon, comments, order, whitespace and line endings remain. Original source SHA-256 remains `e7852e8983b945a48b19b64eaa05f80e3e5ca7ad0baf70546fb7b06d89f5ff41`; exported copy SHA-256 is `1a19d150d6b4707c4f01d52421bdfdcec69c44ed318011c4aefa74ce25842c1f`. Workbench then closed normally with no pending edits.

The native Save dialog rejected an initial forward-slash absolute filename. A correctly focused filename with native Windows separators saved successfully. A WebView select popup also required keyboard selection after the automation tool refused an overlaid-window click; no application safeguard was bypassed. These interaction corrections did not alter source or repeat a battle.

## Exit issue and remaining acceptance

After Finish, the main menu was visible and the finished journal was already saved. **Two clicks on visible Quit and Escape had no observed response.** The normal title-bar Close button ended the exact owned game process; Workbench subsequently recorded code 0. No unrelated process was closed and no forced kill was issued. This demonstrates a graceful window close, **not a successful main-menu Quit action**.

The cause has not been isolated. Official UI/menu callback and field-lifecycle source was inspected, but neither an input-delivery problem nor a GUI-state defect was independently established. No production change, direct memory edit or extender patch was made to conceal it. The most useful next check is a fresh disposable comparison followed by normal Quit, separating a native-menu input problem from helper/UI-state retention; do not replay this consumed session. Existing older fixed-field normal-Quit evidence is not evidence for this new comparison route.

Native cancel/stop/partial allocation failures, larger rosters, melee, other visual combinations, summons and complete rollback remain outside this game's acceptance. Ordinary campaigns, general AI, save compatibility, a Vanilla-only field and universal VFX/area behavior are not established.

## Preservation and package status

All **1,268 pre-existing files outside the tested session** remained unchanged, as did every one of its **19 staged inputs**, the original full source, configured Steam game executable and frozen rc.3 ZIP. Only the disposable tested session gained its own logs/results/status. Normal profiles, saves, installed mods and other retained sessions were not operated. Raw receipts, session/profile/runtime data, continuous captures, export and desktop screenshots stay local; only the portable written report is public. Images, clips, combat excerpts and raw logs remain local.

The published ZIP is unchanged; no new build, asset replacement or stable promotion is required by this evidence-only follow-up. It remains a prerelease with the Quit-button issue and broader acceptance limits above. The packaged text describes publication-time acceptance; this report supersedes pending statements only for the specific two-battle comparison and desktop return/export observed here.

## Offline follow-up

All **27 focused comparison/runtime/return/selected-weapon regressions** and all **322 publication-checkout script checks** passed after the evidence update. The earlier 107 compiled and 34 simulated lifecycle checks remain separate implementation-time evidence, not newly observed native failure handling. The actual packaged desktop review exercised the native strict reader and protected return on this real journal. Both three-second evidence clips decoded fully at 180 frames each. No production source/helper change was made.

Public evidence is text-only: automatic approval review rejected public upload of the captured frames/clips as derived game content outside the source/documentation publication authorization. No upload was retried; all original evidence remains local.
