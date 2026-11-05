# Checks performed and manual validation plan

> Publication note: the user separately authorized uploading version 0.5 after development. Statements below about local-only work describe that development phase. Machine-specific manifests, raw local reports and private reference data are excluded from this source snapshot.

No CoE5 process was launched, controlled, attached to or modified. No profile, map, save or Script Extender was installed or changed.

## Current local version 0.5

89 Node tests cover the retained parser/data/export suite and new untouched startup, explicit example action, native source identity, assignment destination/preview and blocked-state explanations, pending edits, Apply/review/export guidance, name-only limits and source read-only states. Test fixtures that need a loaded source explicitly invoke Try example through its real handler; they do not describe automatic production startup. Native I/O/policy checks remain headless and are rerun with the build. Current artifacts are research/workflow-check-results.json, workflow-native-checks.json, workflow-full-data-checks.json and workflow-test-output.txt.

Manual acceptance — **planned / not performed**:

1. Start in the dedicated app window: confirm no file is silently loaded; Open mod file, Try example and Browse library are visible, and empty export is unavailable. Browse without a source, then explicitly open the fragment example.
2. Select a spell, choose from library, inspect known properties/version, pick the destination spell and read the exact reference change. Use the weapon with damage already pending; confirm only that input changes and Apply remains required.
3. Test no source, no source spells, a name-only reference spell, unloaded effect-weapon data, missing/ambiguous assignment, selected-in-form and already-applied states. Each unavailable action must explain a useful next step.
4. Apply, review and export a new file. Compare unrelated bytes/BOM/EOLs. Cancel dialogs, try existing targets, close/reopen with unapplied/applied/exported states, and test restoring the original. Native dialogs and close interaction are not established by the helper tests.
5. Check Tab/Shift+Tab/Enter/Space, destination selection, focus after lookup/use/errors, visible sticky status without obscuring focused controls, long names, normal/narrow widths and zoom/screen readers. No rendered layout/accessibility acceptance is claimed.

No game launch, browser-policy bypass or GitHub publication occurs. The local-content inspection restriction remains respected. Data provenance and selected historical fields are unchanged; full-game and VFX validation remain out of scope. See [workflow decisions and self-review](WORKFLOW-05.md).

## Historical local version 0.4

78 Node tests and eight compiled native headless checks pass. New tests distinguish unavailable/not-applicable/zero properties, preserve duplicate-name IDs, reject unsupported fingerprints despite supplied claims, navigate explicit effect links, stage IDs without replacing pending damage, expand invalid advanced source fields and preserve source/library state on failed import. Full private-file verification additionally parses all 1,964 records, validates explicit ID ranges/required fields, cross-checks every spell link and exercises actual reference UI code through the DOM adapter using the native serialized cache. These checks do not render a window.

Evidence: research/compact-check-results.json, compact-native-checks.json, compact-full-data-checks.json and compact-test-output.txt. The source core remains unchanged; the 331 external paths use compact-preservation-before.json. The repository was read and remains at the 0.3 commit; no publish operation is authorized for this phase.

Additional manual acceptance — **planned, not performed**:

1. Open the compact desktop at 1440×960, 1024×768 and 640px width. Check source/editor/reference separation, Apply/Discard visibility, flat contrast, scrolling, long names and 200% zoom. Verify Tab/Shift+Tab/Enter/Space, source skip link, reference link and native details focus.
2. Import both exact 5.33 exports, or import one then add the other. Confirm 1,029 spells/935 weapons and visible historical version. Reopen and confirm revalidated cache. Switch to a name index, reopen and confirm its name-only state is remembered.
3. Inspect weapon #54: base damage 0 must be visible, no path/level rows; expand known visual/sound values. Inspect a spell: its path/level/damage/effect ID must appear, and effect navigation must select that exact weapon variant. Check name-only fallback has one missing-data summary rather than repeated placeholders.
4. Try a modified export, a different version, invalid UTF-8 and an oversized input. Refusal must retain the prior library, source text and pending edits. No binary layout should be applied.
5. Stage an explicit historical weapon ID while spell damage is pending. Review the version caution, apply and export a new file. Compare unrelated bytes. Test duplicate-name records individually. Missing/ambiguous assignments must remain disabled.
6. Submit an invalid advanced VFX source value while its panel is closed. The panel must open and the input receive focus. Test exported/newer edits, cancellation, overwrite refusal and close Yes/No as in the prior desktop checklist.

The existing browser/local-content restriction was respected. There is no native GUI screenshot, actual dialog/close interaction, screen-reader acceptance or game/VFX validation for 0.4.

## Historical version 0.3

The Windows x64 .NET 8 / WPF / WebView2 executable compiles locally. The Node suite exercises the existing core, actual app/bridge scripts and reference UI through a DOM adapter; the compiled native self-test exercises real read-only import, CreateNew export, byte preservation, overwrite refusal, policy helpers, index validation and runtime detection without a window. Current reports: `research/desktop-check-results.json`, `research/desktop-native-checks.json`, `research/desktop-test-output.txt`. The original browser suites remain included. No desktop screenshot, actual window startup or dialog/close interaction is claimed.

The framework-dependent ZIP is inspected for executable/dependencies/notices and exclusion of private-data and .workbench-profile. The exact historical 406-spell/797-weapon name index is imported only into this machine's private cache; its proof/counts are checked independently of archive contents. It is not bundled. The 331 protected paths use `desktop-preservation-before.json` as this task's current baseline; original executable drift evidence remains unchanged.

Desktop acceptance checklist — **all planned, not performed through the native UI**:

1. Start with Start-Workbench.cmd and from a freshly extracted ZIP with required runtimes installed. Confirm a dedicated app window, usable resizing/minimum dimensions and offline startup. Check both cached library and cache-absent one-example fallback.
2. Open a UTF-8 copy through the native dialog; cancel another open and verify current edits remain. Edit/apply/export to a new filename and compare BOM, comments, prefixes and mixed EOL bytes.
3. Try exporting to the original and to another existing file; the host must refuse both without byte changes. Try an unsupported filename extension, then cancel and confirm edits remain unsaved.
4. Close with unapplied edits and with applied/unexported edits. Choose No and retain them, then Yes and reopen. After a successful export or reset to the retained original, normal close should not show an unsaved warning. Force-termination recovery is not implemented.
5. Search/filter/page the reference index. Check historical source/version, unknown-origin arbitrary imports, absent values versus zero, HTML-looking/long names, malformed cache fallback and no automatic network fetch.
6. Select an editable spell and stage a weapon name while damage is also pending. Confirm source remains unchanged until Apply, unrelated bytes remain intact afterward, and an unsupported/ambiguous assignment cannot be filled.
7. Check keyboard Tab/Shift+Tab/Enter/Space, inline errors, focus rings, native dialogs, documentation windows, 200% zoom and narrow window reflow. Confirm remote navigation/downloads/permissions are blocked and source text remains inert data.

These native GUI cases are distinct from the older browser checklist below. See [desktop/library evidence and self-review](LIBRARY-AND-DESKTOP.md).

## Historical browser-prototype checks (0.1 / 0.2)

Version 0.2 adds focused parser/app regressions for optional level insertion, filtering during unapplied edits, source disclosure, draft-state transitions, inline errors/associations and programmatic focus targets. The final run and static/preservation results are in `research/redesign-check-results.json`, with TAP output in `research/redesign-test-output.txt`. These supersede the automated totals for the historical 0.1 build, without replacing its evidence files. Keyboard checks assess declared native semantics and focus calls through the adapter; actual Tab/Enter/Space traversal and screen-reader output remain untested in a browser.

| Check | Result / limit |
|---|---|
| Node parser/patcher suite | Exact token replacements, mixed line endings/BOM, duplicates, numeric selections, boundaries, prefix semantics, unknown directives, integer precision and malformed values tested. |
| Actual app.js through a DOM adapter | Startup, selection, field apply/discard, linked navigation, error state, paste, UTF-8 import, byte-preserving Blob creation, reset and download naming tested. Adapter models textarea newline normalization. It is not a browser layout/file-dialog test. |
| Current public/local source comparison | All 180 compared top-level SDK/API blobs match the pinned public core. |
| Existing project excerpts | Read-only source checks confirm copied numeric fields/flags. No game behavior was retested. |
| Independent review | Astra examined format/preservation; a second reviewer checked VFX and native test-field claims. Corrections are recorded in REVIEW.md. |

The original 0.1 automated totals and hashes are in `research/check-results.json`. Run again with `node --test tests/*.test.cjs` from the project folder. No dependency installation is needed.

Historical 0.1 preservation result: 330 protected files remained unchanged. The installed CoE5.exe changed between that task's initial and final checks; the task never wrote or ran that file. The before/after hashes and observed last-write time are in research/environment-drift.json. Cause and current game version remain unknown; do not reuse the initial 5.42 binary identity as current native acceptance evidence. No restoration was attempted. The redesign takes a separate snapshot of the same 331 protected paths at its start and compares against that current baseline; see redesign-check-results.json.

## Browser check still unverified

The browser automation tool blocked local `file:` navigation. The attempt was stopped and no alternate route used to bypass that policy. No screenshot, visual-layout pass, actual native picker or actual browser download is claimed. The application logic tests above do not replace this check.

Manual checklist for the user, when opening index.html:

1. At 1440×900 and 1024×768, confirm readable parchment editor, clearly different spell/weapon labels, source controls and restrained decoration. Check 760, 460 and 360px widths and 200% zoom for reflow, clipping and focus visibility.
2. Search “javelin”, filter to spells, select the result, and clear filters. Search for a nonexistent name; verify clear empty-state recovery. Selected definition must stay unchanged when filtered out.
3. Change Range 6→9. Verify unapplied status, disabled download and guarded switching. Filtering must retain the typed 9. Return to 6 and verify pending state clears; then change/apply 9, review and reset.
4. Select the spell, try level 4, submit with Enter, observe inline error/status and focused level field. Discard, then apply level 2. Navigate a matching weapon button and confirm source-section semantics.
5. Expand/collapse source and original with keyboard Enter/Space. Review while fields are dirty; verify the source caption says pending edits are excluded. Applying must update the held source and keep the disclosure state.
6. Open a real UTF-8 file copy. Edit a field, download the new `.edited` name and compare bytes outside that value, including CRLF/BOM. Verify native picker/cancel behavior and actual download filename.
7. Open examples/missing-level.c5se, enter level 2, apply and review the added line immediately after newspell. Download and compare. Repeat with a copied prefixed/indented mixed-EOL c5m fragment. Confirm a slowcast/unknown/duplicate/incomplete block keeps missing level read-only.
8. Traverse Open, Paste/dialog, library, fields, apply/discard, review/source and download by Tab/Shift+Tab; confirm a visible focus ring and logical order, including scrollable library items. Check dialog Escape/focus return, error announcements and skip link with assistive technology. No screen-reader acceptance is implied by ARIA attributes alone.
9. Check long/HTML-looking names, narrow dialogs and source scrolling. Confirm `.c5se` prefixed comments and interpretation/download-extension behavior.

All nine native-browser cases are **PLANNED / not performed**. No screenshots or responsive-layout pass are claimed. Retain downloaded files in a separate folder; the tool does not install them.

## Real native VFX path already exists

The public CoE5SE APIs are `testBattle`, `openTestField`, `drawTestField`, `fireTestField`, `fightTestField`, `stopTestFight`, `closeTestField`, plus metadata helpers such as `spellInfo` and `lookName`. [API contracts](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/coe5.lua#L1645), [implementation](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/src/lua_test_battle.h).

Future integration should deliberately create/resolve its own test monster and exported weapon/spell in a new test-only mod. Add a **user-clicked main-menu button** in normal mod Lua, not `_commands.lua`. Keep the exported weapon before the spell reference. Existing menu callbacks and test APIs provide the route; a generated helper is intentionally deferred until its fixture, caller ownership and cleanup are validated. [Menu callback](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/coe5.lua#L789), [commands-file restrictions](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/src/lua_loading.h#L160).

Important limits from source:

- Opening is refused with an active player/game. The fixture is one commander against 1–200 enemies, default 40, on grass without a fort.
- `spell=-1` means first monster attack. A supplied spell ID memorizes that spell; an optional stand-in must be a weapon owned by the calling mod.
- `fireTestField` actually damages units and temporarily expands ranges 2–29 to 30. It cannot validate ordinary range or slowcast scheduling.
- The interactive field needs explicit close/cleanup; `testBattle` runs a full fight then cleanup. Error and repeat-session recovery still need manual acceptance.

[Open/setup](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/src/lua_test_battle.h#L53), [single shot](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/src/lua_test_battle.h#L164), [fight/cleanup](https://github.com/musical-pianist/coe5se/blob/669062bf21ec74cc2530ae0090f28b1ef7797c14/src/lua_test_battle.h#L209).

## Future game acceptance — all planned, none performed

| Case | Status | Observation |
|---|---|---|
| Fresh isolated fragment integration | BLOCKED on separately prepared complete fixture | Native definitions load; names resolve; correct field values appear in game/logs. A source fragment alone cannot pass. |
| Main-menu native field | PLANNED | Button opens/cleans field; generated monster/spell is the one tested; repeated open/close and failures restore prior state. |
| VFX settings | PLANNED | Compare impact/flight/sound in the native field. Separate flymode 1 sprite IDs from other modes' effects. No browser animation accepted as an oracle. |
| Range/initiative/slowcast/AoE targeting | PLANNED | Full fight or separate manual map/combat fixture, rather than single-shot range-extended testing. Count actual targets and observe timing. |
| Save/load and load order | PLANNED | New spells appended after existing spells; old learned spells and numeric selections remain stable. No approved save used for trials. |
| Vanilla control and other modes | PLANNED | Native-only weapon fragment tested separately; explicit extender dependency for spells. Mac/network/hotseat remain unclaimed until their own tests. |

No map/profile/launcher was generated here. Existing retained Abyss maps show a later map route is possible, but the first source tool does not pretend to deliver a complete playable test environment.
