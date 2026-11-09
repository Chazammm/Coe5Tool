# Vanilla library and original-observation summary

Date: 9 November 2026, Europe/Berlin.

**Implemented, verified offline, and now checked in the actual Windows app. The rendered library → preparation-preview → recorded-summary journey passed on the follow-up below; no new game was launched.** The existing original-observation helper and its native AI field calls are unchanged. Previous Fireball/Spear gameplay evidence is retained, not relabelled as a new result.

## Practical improvement

The former route was hidden inside the general Game data chooser: installed and historical choices shared a list; field keys were raw; the primary Use choice action was disabled in browse mode; linked metadata could be inspected but not followed there. Original observations were excluded from saved editable values and had only raw INI/log inspection.

Added a compact **Vanilla library** entry point, automatic read-only loading of the already-configured fingerprint-verified game executable, partial-name/ID search restricted to installed spells/weapons, readable known fields, advanced raw fields, explicit linked-record navigation, unchanged draft-independent preparation, and **Previous observations…**. The latter opens the retained-session list filtered to the exact kind/ID/name. An exited original session now has a native-validated, read-only **Recorded original observation** summary. There is no Apply action for originals and no partial clone disguised as a faithful editable copy.

The general Game data chooser, historical references, mod editing, selected-spell/weapon tests, protected return/export and resume gates remain separate. A misleading general caption about a one-type API was narrowed: original observation uses one enemy type/count; private weapon tests can use the local mixed-roster extension.

## Data and API investigation

The exact local 5.43 image exposes 1,029 spells and 936 named weapons; all spell slots 0–1028 and weapon slots 0–1199 are inspected. The existing reader checks the SHA-256 before decoding PE-backed tables. It provides partial numeric fields and explicit links, not full definitions, assets or enabled-mod data. Historical 5.33/name-only data and bounded runtime exports have distinct provenance and are excluded from this library. No new extracted game data is bundled.

Rechecked the pinned 2.13.0 field source and canonical helper. Original observation passes four arguments to openTestField, uses fightTestField and has no original setter, forced fire or stand-in. Native carrier discovery remains runtime-dependent. The native API lacks a verified lossless clone contract; safe read-only observation is the supported slice. See [scope, sources and manual acceptance](../../docs/VANILLA-LIBRARY-016.md).

## Verification

- **289/289 JavaScript checks pass.** New coverage exercises installed-only search, duplicate IDs/names, related-record navigation, missing fields without defaults, unavailable/mismatched local catalogs, unchanged pending draft/target, canonical original preparation, no automatic launch, ordinary chooser restoration, prior-observation filtering and summary refusal without stale facts. Existing source/return/resume regressions remain enabled.
- **70/70 compiled checks pass.** The real executable reader confirms counts/fingerprint without writes. New checks cover bound original results, malformed IDs/stages/counts/runs, cancellation, absent results, unfinished sessions, changed launch contexts/helpers, path refusal and unchanged session metadata. Native isolated-launch tests use substitute processes, not a game.
- The new reader successfully reviewed the retained real Fireball session `04b6faaeda6f4d6fb08c39b3e174fb2a`: helper stage closed, **one battle-call return**, actor Pyromancer #55, spell #445, weapon #54, requested Spearman #13 × 1, reported known numeric fields unchanged and recorded process exit 0. This is a **read-only replay of existing data**. The earlier game log/video, independently, established two actual Fireball casts and visible flight/impact; the new summary does not infer those from battles=1.
- The native retained-result check fingerprinted every retained file before/after and found no changes or added files. New offline fixtures/output remain inside this validation folder; neither game files nor retained sessions were edited.
- Built the desktop app to `build/desktop-0161-vanilla-library/CoE5Workbench.exe`; Start-Workbench.cmd now points there. The .NET build succeeded. The source version remains 0.16.1, with post-package changes identified separately.

Local offline details: `offline/javascript-tests.txt`, `offline/native.json`, `offline/original-review-output.json` and generated synthetic fixtures. They are excluded from GitHub because local data/paths and extracted metadata belong only on this machine.

## Actual desktop attempt and limits

The computer-use inventory showed no Workbench or game before launch. Launched only the new app. It exposed a window titled CoE5 Spell & Weapon Workbench. Window activation/capture failed with **foreground window did not report a process id**. Refreshed the returned window inventory and retried capture once with a fresh window binding; the same error occurred. No screenshot, rendered control, focus, click, native dialog or preparation journey was established. No game was launched and no keyboard/mouse input was sent to another application.

Stopped desktop input after that failure. Closed only the newly created blank Workbench process by its exact PID/path; this was process cleanup, **not verified normal UI closure**. No source/draft was opened in it. Local `desktop-cleanup.json` records that limited cleanup. The user subsequently clarified an accidental Escape press and authorized another desktop attempt. That retry stopped at window inventory with the tool message **Computer Use was stopped by the user with the physical Escape key**. No further computer-use calls or input followed. The new library and summary need a real rendered desktop check in a later turn. No screenshot or gameplay success is claimed for this task.

## Distribution and remaining work

The 0.16.1 ZIP was **not rebuilt or published**. Its SHA-256 remains `ac07b8c11a9f26553aa99fd12647a074529f0d50d0b6245c1aa720ebacb4a8a8`. It does not include this new source workflow. The current source and desktop build are distinct from that immutable package; no downloadable release was created or replaced.

The follow-up rendered library/link/previous-result/preparation-preview acceptance is complete at the observed size/scale. A new game run remains optional acceptance of the improved entry point, not a new API test; concise steps are in the linked documentation. Missing capabilities remain full lossless private copies, stable native per-hit/position attribution, additional conditional carrier routes, other executable versions and a Vanilla-only field. Battle returns, HP differences and visible bursts are not promoted to confirmed hits. Do not replay completed preparations.

## Completed Windows follow-up · 9 November 2026

The user explicitly renewed desktop permission. Reset the stopped computer-use session and successfully captured/operated the actual current desktop build. The window screenshots measure **1107 × 794 pixels**, at the existing Windows scaling; no other resolution/DPI was exercised. The desktop was left alone while making the small fixes and after the checks.

Observed in the app:

1. **Vanilla library** automatically loaded **1,965 installed records** from the configured verified 5.43 executable. Partial search `fireb` showed six distinct Fireball spell/weapon records with IDs; selecting spell **#445** showed Pyromancy #3, level 2, payload 15 and linked weapon #54. **View linked record** navigated to that exact weapon, with mode 6, flight #65 and impact #68 visible as metadata. No appearance claim follows from those fields.
2. An exact `#445` search distinguished Fireball spell #445 from Nightmares weapon #445. A deliberately missing name showed a clear empty result and no observation action. Search focus was visibly indicated, text input worked and nested facts/outer-dialog scrolling worked.
3. Created only a disposable built-in example draft, then left weapon damage **19** unapplied. Opened Fireball **Observe original with CoE5SE…** and used **Prepare test files**. The real dialog identified original native AI observation, explicit in-game carrier selection, no clone/forced cast, Spearman × 1, and verified 5.43 / 2.13.0 runtime. It produced the four-file preparation preview and enabled **Prepare isolated session**. **That native preparation action and Start were not clicked**; no new retained session, runtime copy or game process was created. Closed the preview with its explicit unexported-package confirmation. The editor still showed the unapplied damage 19, the same example and CoE5SE target.
4. **Previous observations…** opened Prepared tests filtered to `spell #445 Fireball`, with two matching used sessions. Selected the retained `04b6faae…` Fireball run. The read-only summary displayed helper stage closed, **one battle-call return**, zero stop requests, recorded process exit 0, requested Spearman #13 × 1 distinguished from spawned identities, Pyromancer #55, Fireball spell #445 / weapon #54 and the recorded payload/type/visual IDs. **Start saved test stayed disabled**. No Apply action was offered. Scrolled to the separately labelled **User-reported visual outcome: expected** and the explicit warning that battle returns do not count AI casts or establish selected-record use, hits, damage, positions or visible effects. This was old saved data, not a new gameplay observation.
5. Returned to the draft: damage 19 remained unapplied. The general **Game data** browser restored All sources, its ordinary field-selection controls and coverage/runtime section. Visually read the caption separating single-type original observation from local-extension mixed private-weapon tests. No runtime export/import or observation note was written.
6. Closed the agent-created Workbench windows through **Alt+F4**. The disposable example prompted for unsaved edits; confirmed closing only that agent-created example. The final blank app closed without a prompt. Read-only process checks found **zero Workbench and zero CoE5 processes** afterward. This establishes UI closure/process absence, not a numeric app exit code. Reset the computer-use session and ended desktop interaction.

Two concrete rendered issues were fixed locally and rechecked:

- **C37:** the primary Observe action was below the fold in the initial layout. Moved Observe and Previous observations together above the facts, preserving their IDs/click handlers; removed one redundant catalog caption only in Vanilla-library mode. The rebuilt app visibly kept both actions above the scrolling facts at this window size.
- **C38:** opening general Game data retained a Vanilla-specific status sentence. Reset chooser status on opening; a regression assertion and a final real-app check confirmed the neutral **Search by partial name or #ID** message.

All **289 JavaScript checks** passed again after the UI changes. Rebuilt the desktop app successfully; no C# or helper/runtime behavior changed, so the earlier **70 compiled checks** remain the corresponding native evidence. All **1,081 retained test files** fingerprinted before/after were identical, with zero added, missing or changed files. The ZIP hash remains `ac07b8c11a9f26553aa99fd12647a074529f0d50d0b6245c1aa720ebacb4a8a8`; it was not rebuilt or published.

Local evidence is in `desktop-20261109/`: `01-start.png` through `15-browser-status-reset.png`, `preservation.json`, `closure.json` and `javascript-tests.txt`. These captures, retained-file paths and inventories remain local, outside the public repository. Only this curated report, source/tests and intended documentation updates are published.

Remaining limits: no fresh game launch, new native isolated-session preparation, completed original replay, private original clone, other display/DPI, native file-selection failure path or fresh-machine setup was tested in this follow-up. The existing game observations and 0.16.1 package retain their separate evidence.
