# Manual game acceptance — 0.18.2-rc.1 / CoE5SE 3.4.4

Status: **pending fresh gameplay**. This guide describes proposed observations, not passed tests. Use the source-built or exact new prerelease Workbench, not the stable 0.18.1 ZIP.

## Before each test

1. Quit any normal game yourself. In Workbench choose your supported CoE5 5.43 and separately extracted official 3.4.4 plugin through **Choose game & extender files…**. Confirm 3.4.4 preview/game acceptance pending. Do not install over Steam or use a campaign/profile.
2. Prepare a **new** disposable session through the normal interface. Start is separate. If this profile needs its first setup launch, follow Workbench's profile instructions: enable only CoE5SE and the named WB test mod, return to the main menu and quit normally. Recheck it in Prepared tests before the actual test. Never bypass a refusal or replay a used session.

## A — supported custom spell

1. Open the included selected-spell-workshop.c5m example. Select **Harbor Ember**, inspect its linked weapon, choose **Test selected spell with CoE5SE…** and enable the supported weapon-editing experiment. Use Spearman #13 as caster/target if offered; one target. Prepare and Start explicitly.
2. At the isolated game's main menu open the displayed **WB test: [mod ID]** entry. Check the expected spell/weapon names. Cast once exactly once. Record the named cast/damage/status log and what you actually see; a completed call is not proof of correct visuals.
3. If the Effects menu offers the recorded impact choices, select one change, Apply and confirm readback; use **Save test values**. Do not make an extra cast merely to record footage. Close test, return to the main menu and click the native **Quit** label.
4. In Workbench refresh **Test results**, check runtime/session and recorded cast/readback counts. Explicitly select the saved value for review/apply. Keep unrelated edits; export to a new filename. Compare against the original full source. A saved setting alone is not a visual observation.

## B — original Fireball AI observation

1. In **Vanilla library**, load your verified installed catalog and find **Fireball spell #445**. Choose original observation, a suitable native target and a new 3.4.4 preparation. Start explicitly.
2. Use **Pyromancer #55** only if the running game's eligibility list offers it. Open the field and run one **Battle (AI)**. Record whether the log names Fireball and whether projectile/impact are actually visible. AI may use another attack; a returned battle alone is inconclusive. Do not substitute a forced cast.
3. Close the field and quit the isolated game normally. Review the bound read-only observation in Workbench. No built-in record becomes an editable clone.

## C — mixed visual comparison

1. Open the included mixed-comparison-workshop.c5m and its eligible ranged weapon. Keep the shown damage/payload/area settings. Select two eligible native types, for example **Spearman #13 ×2 and Levy #27 ×2**, and enable visual comparison. Prepare a new 3.4.4 session.
2. Open the comparison, select sprite mode 1 / Ballista bolt #7 / Flame impact #68 if available. Apply and check readback, then run one AI battle. Record actual spawned IDs/types, named weapon use and separately observed flight/impact. Use Back to return to comparison controls.
3. Choose particle mode 2 / Fireball flight #65 / White Flare impact #3 if offered by the verified chooser. Apply and run one second battle against **fresh copies of the same roster**. Use the actual chooser labels; if unavailable, stop and report the exact refusal instead of substituting silently.
4. Use Back and Finish. Record field-close/visual-restoration facts without claiming full record rollback. At the main menu check a visible control and then click **Quit** normally. If Quit does not respond, report that separately; use only the isolated game's normal title-bar Close, not force-stop.
5. Refresh Workbench results. Review each attempt separately, select the intended visual values and export a separate full-source copy. Confirm source differences are limited to those selected values and that newer draft edits/conflicts are protected.

## Report back

For each new session, send its displayed name/ID, whether the expected field opened, named cast/weapon evidence, visible effects or uncertainty, saved readbacks, closure, how you quit and any error. Screenshots/manual descriptions are useful. Logs/readings and observations will be assessed separately. No normal combat, AI-wide behavior, resistance formula, universal effect accuracy or save compatibility is established by these three cases.
