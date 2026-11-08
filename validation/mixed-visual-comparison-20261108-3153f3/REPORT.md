# Mixed-group visual comparison

**Core workflow passed in the actual desktop and game on 8 November 2026; normal game exit remains unverified.** One new disposable Windows CoE5 5.43 session, with the pinned local CoE5SE 2.13.0 + Workbench roster-v1 plugin, compared two configurations of **Prismatic Mixed Trial** against **Deer #609 × 2 and Winter Wolf #487 × 1**. Both completed battles were reviewed in Workbench and three explicitly selected values were exported separately. No downloadable release was created or replaced.

## Actual observations

| Battle | Applied and read-back values | Named attack evidence | Recorded appearance |
| --- | --- | --- | --- |
| 1 / baseline r0 | Sprite mode 1; Ballista bolt #7; Flame impact #68 | Private WB Ranged Carrier #2000, weapon #1200, attacked Deer instance #3 at (16,11), distance 3. The named weapon dealt 7 piercing damage (dt3). | A thin bolt crossed the gap; a yellow-orange burst appeared at the Deer. [Flight](sprite-flight.png) · [Impact](sprite-impact.png) |
| 2 / applied r1 | Particle mode 2; Torrent of Water (fly) #197; Acid Splash impact #49 | The same intended private attack used the named weapon on Deer instance #3 at (16,11), distance 3, again for 7 piercing damage. | A blue-purple stream crossed the gap and a green burst appeared at the Deer. [Flight](particle-flight.png) · [Impact](particle-impact.png) |

[Side-by-side excerpt, sprite left / particle right](visual-comparison.mp4). The full 45-second recordings are sprite (local evidence) and particle (local evidence). These are real captures, with no mock rendering. Extracted representative times are sprite 13.30 / 13.70 seconds and particle 13.25 / 13.90 seconds. The later white breath is the Winter Wolf's separate Icy Breath, not the selected projectile.

The source stayed piercing #3, payload 8 on the private regular ranged row, base damage 0, range 5, initiative 5, area code 0. Changing flight and impact did not change damage behavior. Two equal random rolls are not evidence of a general damage or resistance formula.

Each callback returned these separately recorded identities and readings:

| Battle-scoped identity | Native type | HP before → after in battle 1 | HP before → after in battle 2 |
| --- | --- | --- | --- |
| unit #2 | Deer #609 | 6 → 6 | 6 → 6 |
| unit #3 | Deer #609 | 6 → -1 | 6 → -1 |
| unit #4 | Winter Wolf #487 | 13 → 13 | 13 → 13 |

These IDs were reused after native rollback; they are not persistent live references. Each battle requested and verified the same ordered roster, with a fresh carrier and defenders. Physical attacks have no elemental resistance reading in this receipt. The combat log, rather than HP changes alone, identifies the named attack and victim. The Wolf and Deer #2 received no logged Prismatic Mixed Trial hit. This test used area 0; it establishes no mixed area-effect behavior.

## Ownership, closure and exit

The existing native roster-v1 plugin was reused unchanged (SHA-256 `46c982fcef57c60fa68a6fcbcc624b6ce2e78d36526991508c8d4d5ff4826ec7`). The game executable matched `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55`; the official base plugin matched `26861bb0b6dffaa7150ed239e9eba4e934a955688d101c81161cf395190dd254`. The extender identified game build `6aec6a32-13728000`, version 5.43.

- **Cancellation:** Check cleanup deliberately raised inside an allocated callback, ran no battle and logged requested=3, made=3, callback_ok=0, records_restored=1.
- **Both battles:** native logs recorded field closure, callback_ok=1, records_restored=1. Each saved sample independently has closed=1 and restored=1.
- **Finish:** the main menu was visibly reached. The helper checks baseline visual readback on Finish; its optional Lua log output was not independently present in the coarse native log.
- **Exit limitation:** automated Quit/close attempts did not establish a normal exit. Only owned PID **24916**, verified against this session's isolated executable, was stopped. Workbench subsequently reported exited, code **1**. This is not a successful normal-menu exit. Input/window-binding issues occurred during automation; no engine or helper cause is established. A user-operated Finish → Quit check is the concrete remaining acceptance step.

All 19 fingerprinted staged inputs matched after the run. Existing game installations, mods, normal profiles, saves and older sessions were not used as test destinations. No additional battle was run to replace an inconvenient result.

Session `178cef7a0b484a48ab7d5e5b437c6082`, run `5a586cdad6ef4866ac73e8f92b05feb1`. Local evidence: native log (local evidence), combat log (local evidence), receipt (local evidence), ledger (local evidence), integrity (local evidence), main menu (local evidence).

## Desktop selection and return

The actual desktop opened the disposable native source, searched the installed catalog by #609 and partial name Winter Wolf, selected counts 2/1, enabled Compare visuals in game, and prepared/launched the local-roster session. The dependency and same roster were visible before launch. Prepared setup (local evidence).

The comparison menu separated pending and applied values, checked runtime labels/native witnesses, required Apply visuals before the revised battle, and showed fresh-group and cleanup actions. The battle itself used native playback without an extra overlay covering the event log. Captures have a 1100 × 800 game client; the computer-use surface displayed a scaled 882 × 671 window.

After exit the desktop selected Battle 2, displayed all three value changes and each defender's before/after HP, and kept the personal visual-observation checkbox unchecked. The saved receipt alone does not establish visual correctness. Rendered review (local evidence). Apply selected to draft was used explicitly, followed by the native separate-copy export dialog. Export (local evidence).

A byte comparison of original source (local evidence) and export (local evidence) established **only** `look 68 → 49`, `flymode 1 → 2`, `flylook 7 → 197`. Counts, participants, HP and cleanup metadata never entered the weapon source.

## Implementation and offline verification

The native plugin does not need modification. A separate canonical mixed comparison helper changes only the creating mod's private weapon, between field invocations. Every battle enters a new protected `withTestFieldRoster` callback. Identity, row, payload, fixed stats and visuals are checked; defenders are read within the callback. Only a completed battle with verified closure/restoration is accepted for return. A failure aborts this comparison and attempts private visual restoration. Previously saved samples remain available. The helper does not perform generic map writes or retain field pointers.

The new manifest is `private-mixed-compare-v1`, INI schema `wb-ranged-mixed-results-1`, desktop packet schema 4. Host and browser independently validate count, roster ordering, names/IDs, unique instance IDs per battle, signed HP/readings, visual roles, revisions and cleanup. Mixed result review verifies the pinned local overlay rather than the official plugin hash; single-type review retains its official runtime policy. Legacy helpers/schemas remain unchanged. Runtime readings and personal observations do not automatically modify the draft.

- **248/248 JavaScript tests passed:** canonical routing, source/row preservation, malformed/foreign/duplicate rosters, readback and cleanup refusal, schema-3 and older returns, per-battle ID reuse, three-field-only return, conflicts and unrelated pending edits. Output (local evidence).
- **34/34 compiled checks passed:** new mixed candidate/helper binding and receipt rejection, plus the retained earlier fixed mixed, single-type, area/group, expanded/older comparison and native source checks. The compiled packet passed independent JavaScript validation. Output (local evidence).
- **13/13 Lua API-model cases passed:** two battles plus cancellation, private/shared identity, wrong target/owner, partial/duplicate roster, partial setter write, relink, refused next field, interrupted battle, failed save, cleanup failure and existing history. These are simulated API cases, not additional gameplay. Actual native partial-allocation safety retains the earlier nine memory-model tests; natural exhaustion was not induced in game. Output (local evidence).

Supported scope remains bounded ranged modes 1/2, catalog-verified visual roles, scalar standalone damage types 1–6, area codes 0–5 and 2–8 native types / 200 total defenders. Only the physical, area-0, two-configuration combination above received this live check. There is no mid-battle mutation, waves, mod-added target support, general coordinate getter or broad proof of AI, VFX, area, campaign/save compatibility. The fixed melee/ranged and released-extender single-type workflows remain available.
