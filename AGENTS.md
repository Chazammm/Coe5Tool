# Working on the CoE5 Spell & Weapon Workbench

Treat the workbench as one product and follow the user's current request. Its primary workflow is to find or create spells and weapons, edit them, test supported behavior in the game, and use the result in a mod. Keep the interface understandable to modders and preserve the existing compact visual direction.

## Consistency review

For changes to a workflow or interface, consult `docs/CONSISTENCY-CHECKLIST.md` and check the entries relevant to the change. Trace the user's task through the affected screens and states, including the starting view, selection, edit, feedback, test and export when relevant. Check both Vanilla and CoE5SE paths when they are affected. Keep target, file container, source interpretation, visible scope and runtime dependency distinct.

Do not conceal, convert or discard imported source to make a view look consistent. Retain pending edits, source text and existing export protections. Distinguish searchable metadata, supported creation, actual in-game observations and unverified behavior in labels and reports. Avoid generic explanatory clutter, mandatory tutorials and controls that promise unsupported behavior.

When you encounter a concrete, reproducible inconsistency, add a concise entry to the existing checklist: what was observed, why it is confusing, the expected behavior, status and evidence or a practical verification step. Reuse or update existing entries instead of creating a parallel log. Do not add speculative findings. Clearly label a user report, an automated or simulated check, and an actual desktop or game observation as different evidence.

## Verification

Run checks appropriate to the change; the JavaScript suite is `node --test tests/*.test.cjs`. For UI changes, inspect the rendered workflow at relevant sizes when the user and environment allow it. A simulated drop is not evidence of a real Explorer-to-app drag, and a game API call or process exit is not evidence of a visible effect. Report what you actually checked and any material limitations. Never change normal game installations, saves, existing mods or retained test sessions as a side effect of verification.
