# Manual 3.2.2 acceptance

Use **0.18.0-rc.1**, not the unchanged 0.17 ZIP. No 3.2.2 game result is claimed yet. Use only the new disposable preparations; leave earlier sessions and campaigns alone. Workbench must remain open to retain the process exit code.

## Selected custom spell

1. Open the included `examples/selected-spell-workshop.c5m`. Select **Harbor Ember Test** (line 20), check its linked **Harbor Ember** weapon and choose **Test selected spell with CoE5SE…**.
2. Confirm the runtime panel says **CoE5 5.43 / CoE5SE 3.2.2**, preview/pending. If needed choose your own game EXE and complete official 3.2.2 plugin folder. Use **Spearman #13**, one Spearman target, and enable **Let me adjust weapon settings in the test**. Prepare game test, then explicitly Start. Never load/start a campaign. If profile setup is requested, follow its displayed setup-only instructions, Quit, refresh and start the same checked preparation.
3. Open the exact **WB test: …** main-menu entry displayed by this preparation. For this comparison use baseline **fire #4, area 0, payload 8, flight mode 2 / flight #65, impact #68**. Change only impact to **Blood Burst #34**, Apply and check the displayed/read-back value. Leave damage/type/area/flight alone.
4. Press **Cast once exactly once**, observe the log and visible result, then **Save test values → Close test**. Record any unexpected status without assigning a cause. If an error appears, stop and report it instead of repeating casts for footage.
5. From the main menu use **Quit** normally. Back in Workbench refresh; review the exact new session under Saved test values. Report the cast call count, impact readback and what you actually saw separately. Apply **only impact 68 → 34**, then export a uniquely named separate full-source copy. Compare with the original: only the chosen impact should change; all four definitions/comments remain. The original cannot be overwritten.

## Original Fireball observation · separate new session

1. Open **Vanilla library → Load installed 5.43 spells & weapons…** if needed. Search **Fireball**, select **spell #445** (not weapon #54 or a different spell ID). Choose **Observe original with CoE5SE…**; one **Spearman #13**, official **3.2.2**. Prepare/start a fresh session.
2. Open its displayed **WB test: …** entry. Choose **Pyromancer #55** if the running game's eligible picker offers it. If not offered, report that; do not force a different attack or overwrite a record.
3. Use **Battle (AI)** once. Report whether the log names Fireball, how many casts you actually saw, and whether flight/impact were visibly observed. AI may make zero or several casts. A returned battle by itself is inconclusive for Fireball use or VFX.
4. **Close → main menu → Quit** normally. Refresh Workbench and select that session in **Previous observations…** / Prepared tests. Report the helper stage, battle returns and process exit separately from the game log and visuals. Originals are read-only; no clone or Apply/export action is expected.

Send the two new session IDs, any error text, what happened and any screenshot/clip you captured. Logs/results will be inspected afterwards. Do not rerun a used preparation. Visual evidence is optional; no claim that an effect was seen follows from a saved value. No mixed 3.2.2 test is offered until its helper/lifecycle is adapted and verified. The existing 2.13.0 mixed route remains separate.
