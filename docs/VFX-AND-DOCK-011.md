# VFX iteration and test-field controls · version 0.11

Historical implementation record. The subsequent user-operated Codex VFX Trial saved impact 7 → 3 with one completed cast call and a successful source return. The user's visual success report remains separate evidence. Version 0.12 changes desktop review and permits explicit safe optional-line additions; see [the current workflow](POST-TEST-RETURN-012.md). The original phase's unobserved claims and staging restrictions below describe its state at that time.

This is a local, bounded extension of the existing isolated **CoE5 5.43 / CoE5SE 2.13.0** experiment. It adds impact/flight choices and an adaptive dock, with explicit result return. **No CoE5 process was launched or controlled during implementation.** The new controls, visual changes and result exchange have not been observed in the real game.

## Evidence and chosen scope

The earlier 5.43 single-cast report records a real projectile/impact and damage with fixed settings. The retained v0.9 Waterball user run records two casts, piercing damage, field close/reopen/final close and normal shutdown; the user reported the accepted type/area revisions. Neither proves that changing a visual property changes the next cast's appearance. The old screenshots are evidence of the old UI, not of this layout.

The official API permits reading weapon command fields and writing those on a weapon created by the calling mod. The pinned source maps all five investigated visual/audio properties to **signed four-byte fields**, with ownership checks and signed 32-bit writes. Readback is necessary because refusals can return without throwing. The values persist until mods are read again. The field's Fire path calls the attack and flight-step functions after our writes, without closing/reopening or restarting the process. This supports trying the next cast with the updated record; it does **not** establish every renderer/cache/timing detail or audible/visible outcome.

| Property | Source establishes | Implemented experiment |
|---|---|---|
| `look` | Own-record read/write, 4 bytes at offset 0x74; `lookName` reads the 300-row effect table. | New impact IDs **0–299**; runtime-name/#ID search and paged browsing. Original value retained for restoration. |
| `flymode` | Own-record read/write, 4 bytes at 0x68. Documented modes distinguish sprite mode 1 from effect-based modes. | New modes **2–9**, using the pinned documented labels. Mode 1 is baseline-only. |
| `flylook` | Own-record read/write, 4 bytes at 0x6c. Interpretation depends on mode. | New effect IDs **0–299** with modes 2–9. A new sprite choice is not synthesized from effect names. |
| `sound` | Own-record read/write, 4 bytes at 0x78. | **Unchanged**. No complete sound-name/valid-asset enumeration or verified audio behavior was established. |
| `flysound` | Own-record read/write, 4 bytes at 0x70; launch -1 is documented separately. | **Unchanged**, including a prepared -1 value. Existing source/export support remains. |

These are Workbench limits for this pinned build, not new engine rules. An original baseline outside the new-choice subset can be retained/restored; that does not certify its asset validity or appearance. Future game/extender versions or larger effect tables require a new verified contract. Native `.c5m` declarations remain separate from the Lua editing feature.

## One-session effect iteration

Enable the weapon-editing experiment when preparing a new canonical test. Its own associated `newweapon` remains the scratch record; no built-in/other-mod weapon or stand-in is written.

**Effects…** opens a native game menu between battle frames. It shows applied/read-back values separately from pending choices. Impact and flight-effect pickers inspect **all 300 rows** of the loaded `lookName` table, preserve IDs, label unnamed rows, and offer partial-name or `#ID` search through the documented native name-entry box. Search is optional: paged rows remain usable if input is unavailable. Duplicate names retain distinct IDs. Labels are from this runtime; a name is still not a preview or appearance guarantee.

Flight mode 1 uses sprites, so only its original mode/look pair can be kept/restored here. Switching from that/default interpretation to mode 2–9 requires an explicit flight-effect selection before Apply; an existing sprite number is not silently treated as an effect. The menu offers **Use original impact/flight values**. Other fields are retained. A complete sprite picker and audio experiment are deferred until their catalogs/validation and behavior are established.

Return to the field and **Apply** explicitly. All five supported values (`dmgtype`, `aoe`, `look`, `flymode`, `flylook`) are written and read back before a snapshot is recorded. **Cast once** blocks pending/incomplete settings and detects outside changes to these fields. A completed API call does not establish a hit, damage, an animation or a human observation. **Reset targets** reopens the same one-enemy-type/count field with accepted values retained; it is not a wave system.

**Close test** attempts closure and restoration of all five original values. After a partial write it also attempts restoration; if one restoration write throws, the other fields are still attempted. Readback/error messages retain uncertainty. Quit the disposable session if cleanup fails. Sound, spell declarations, normal profiles, campaigns and saves are not edited by this loop.

## Coordinates, scaling and log clearance

The pinned API exposes **`screenW`/`screenH` in UI units** and `uiPointerX`/`uiPointerY` in the same space. The origin is bottom-left, with y increasing upward. The API gives 914 UI units wide at a 1152×756 window as an example; window pixels, Windows DPI and UI units must not be interchanged. The implementation reads the actual game dimensions, never derives them from a guessed pixel ratio, and never changes global scaling/window settings.

The actual previous `05-result-settled.png` shows the old controls over the lower-left event text. It informed a **reserved left lane of 300 UI units**, with a 112-unit lower log band for upper-right fallback. No public exact runtime log-rectangle getter was found. These are conservative layout reservations based on that evidence, not engine-wide log bounds.

| State | Layout |
|---|---|
| Experiment expanded | 360 UI units wide ×112 high; 26-unit buttons in two rows. Bottom edge at y=6, with the primary row at y=14. This is lower than the previous primary row at y=65. |
| Experiment collapsed | Same width, 42 high. Apply/Cast/Reset/Close and **+** remain; hidden settings/status have no hitboxes. **−** collapses it. |
| Fixed helper | 248 wide ×74 high; Cast once, Close test and **Move**. |
| Bottom placement | Centered horizontally when possible, clamped to x≥300 to preserve the observed left lane. At narrower widths this is slightly right of center. |
| Narrow/manual upper right | Right margin 12; top margin 48 below the observed playback strip. Used automatically if the dock cannot fit beside the left lane, or explicitly through **Effects… → Dock** / fixed **Move**. |

The field controls require **384×280 UI units**. Native Effects menus require **640×480 UI units**; below that they report the limitation while the compact field remains usable. Very small/invalid field dimensions cause the owned field to close and attempt restoration, rather than trapping the user with unreachable controls. These are supported UI sizes, not pixel-resolution promises.

Draw and hit testing use the **same captured layout** and half-open rectangles. If dimensions change between drawing and input, that frame's clicks are ignored and a held press must be released before acting on a fresh layout. Existing press/hold suppression remains; moving a panel underneath a held pointer must not cast again.

Status summaries stay inside the dock; tap status for full applied/pending values and messages in a separate native box. No long status/disclaimer is drawn across the event log. Long names are shortened only for display; selection keeps the full row ID and search text uses the full name.

**Remaining layout uncertainty:** glyph measurements, readable scaling, long unit names, custom font sizes, expanded/wider event logs, native menu text fit and all monitor/DPI combinations have not been observed. If the log extends beyond the reserved lane, use upper-right placement and/or collapse, or enlarge the window. The mathematical reserved-region checks do not prove that every actual log stays in that region. The upper-right margin is based on the saved playback-strip evidence; native visual acceptance remains required.

## Saving and returning visual values

**Save test values** now writes `wb-results-2` in the same fixed, per-launch mod data location. It retains the existing session/source/mod/spell/weapon/run binding, adds the original runtime impact/flight baseline, and saves up to 32 accepted/read-back snapshots with all five values and completed-call counts. Pending controls are excluded. Save again after later actions if you want them included. The file carries no automatic visual-observation verdict.

After quitting and refreshing status, **Return test values… → Load values → Review proposed changes** shows prepared/current/pending/proposed values. Visual values return only into **explicit, unambiguous, editable fields**. Missing fields are shown unavailable; no command is inserted. To return all visual settings, explicitly set look, flight mode and flight look in the creator before preparing. Otherwise the experiment remains useful for inspection and manual integration, and type/area return still works.

Flight mode and flight look are a paired selection. If either is unavailable, neither is staged. If either conflicts with newer desktop edits, both stay unchecked by default. Replacing a conflict requires explicit selection/acknowledgement. Unrelated pending damage/audio fields and source bytes remain retained. **Stage selected fields**, **Apply changes**, then **Export copy** are separate; the original file is never silently overwritten. Changing the draft/forms after review requires another review.

Manual reports can optionally include the new bounded visual fields in new sessions, with flight fields together. They remain user reports without machine readback/cast proof. Missing/corrupt/stale/mismatched/unsupported results stage nothing. V0.10 `wb-results-1` imports retain their two-field scope, and v0.9 retains manual fallback. Frozen older helpers are accepted for read-only association only; they cannot pass the current launch validator. No arbitrary Lua, bridge file paths or live synchronization were added.

## Sources checked

- [Pinned 2.13 Lua contract](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/coe5.lua): weapon lifetime/ownership, screenW/H, pointer coordinates, BATTLE_DRAW/WAIT, effect names and native UI/nameBox APIs.
- [Record word layout](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/record_words.h), [own-weapon reads/writes](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_get_set.h), [test-field Fire/close](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_test_battle.h): actual storage, refusals, current-record attack path and cleanup. The native attack renderer itself is not fully described by this public wrapper.
- [UI drawing and native widgets](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_ui.h), [screen/pointer getters](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_game_data.h) and [battle drawing context](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/map_editor.h). Implementation allows battle drawing even though some older drawing-method comments list map wraps only.
- [Official editor mode/effect tables](https://github.com/musical-pianist/coe5se-modding-tools/blob/85643c49810b502767b37aa663fe34885ad90cdd/vscode-extension/data/tables.json) supply documented mode labels, not current visual proof. Runtime effect labels are read directly; old reference indexes are not used to guess loaded effects.
- Existing local 5.43 single-cast report/screenshot, retained user-run logs, v0.10 result/search research, and the WeaponTester research directory. The supplied WeaponTester source/assets were not copied or redistributed. New code is independently implemented against the public APIs.

## Later user-operated acceptance

Only the user should operate this test. Keep normal profiles, existing campaigns/mods and earlier reference sessions untouched.

1. Start the Workbench, choose CoE5SE and make a uniquely named simple pair. Explicitly select initial impact/flight fields if you want automatic return. **Apply changes**, prepare a **new** experiment and review its files. Use the verified 5.43/2.13.0 files and a new disposable profile/test ID. Follow profile setup if offered; no normal save/profile is needed.
2. Open **WB test: <ID>**. Capture the field **before casting**, including the dock and lower-left log. Check all buttons/text fit and click positions match. Try **−/+** and **Effects… → Dock**; check the log and native playback controls remain usable at the chosen placement.
3. In **Effects…**, search/browse the loaded table. Record configuration **A**: type, area, impact ID/name, flight mode and flight ID/name. Use mode 2–9 for a new flight effect. Return, **Apply**, and record the actual displayed readback. Click **Cast once** once, observe the real projectile/impact and immediate log, then let it settle. Do not infer appearance from the label alone.
4. **Reset targets**. Choose configuration **B**, changing one visual parameter at a time where practical (for example a different impact look with the same flight pair). **Apply** and capture the readback. Click **Cast once** once and record what changed or did not change. These are two deliberate comparison casts in one session.
5. If convenient, resize to another usable window size. Confirm repositioning/log clearance and readable controls. Release the pointer after resizing before clicking. Very small viewports should report the documented limit and close the owned field; don't use a normal campaign to test this. Record window size/UI dimensions shown in status details and any clipping/overlap.
6. **Save test values**, then **Close test**. Record restoration/closure errors if any; otherwise confirm the main menu returns. **Quit** this isolated session yourself. A clean exit does not independently prove every restored field.
7. Refresh status in the desktop, close preparation, and **Return test values… → Load values**. Check the chosen A/B snapshot's exact values/session, readback and completed-call count. Mark your own observation accurately. Review old/new values, paired flight selection, unavailable fields and any conflicts before staging. Confirm unrelated pending edits survive, **Apply changes**, and export a new copy.
8. Report the test ID, A/B IDs/readbacks, actual observed difference/no difference, errors, Save/import outcome, closure and dock/log/readability behavior. Include screenshots/logs from this disposable session. The accepted file/count alone is not a gameplay or VFX pass.

The comparison cannot establish ordinary combat, AI, eligibility, true range, timing, saves, every effect combination or audio. Current code/file/mock results are listed in [Verification](VERIFICATION.md); real GUI and game acceptance remain separate.
