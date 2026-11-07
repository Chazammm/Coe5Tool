# Bring saved test settings back into a draft · version 0.12

After the isolated game exits, review a saved configuration and apply the values you choose directly to the held draft. Export remains a separate action to a new file. No game input, live synchronization, source-file overwrite or automatic gameplay verdict is added.

## Everyday workflow

1. In the existing weapon-editing experiment, **Apply** the test settings, cast if desired, and click **Save test values**. Then **Close test** and **Quit**.
2. Back in the workbench, click **Review saved test values** in test preparation. Or use **Review saved values** beside the matching draft. **Return test values…** opens the same review. If the session still says running, **Refresh status** first. Never substitute another active game session.
3. The review names the tested spell (and weapon if different) and shows the baseline → saved changes alongside current draft and pending form values. The newest applied snapshot is chosen, even if it has no completed cast call. A cast count is shown separately; it is not a visual verdict.
4. Keep the selected changed values, or change the selection. Newer conflicting edits are **unchecked**. Explicitly select **Replace newer…** to replace that field. Missing optional commands are **unchecked Add…** choices. Flight mode/effect always travel together.
5. Click **Apply selected to draft**. This patches only the selected fields. Other pending form edits remain in the form, even when you were editing another definition. Apply/discard those separately before **Export copy**. Original source and old exports are never overwritten.

This removes the former required Load → Review → Stage → Apply sequence. There is no automatic modal or source change when the app regains focus. The small saved-values strip can be dismissed; it is hidden after the changed saved values are already in the draft. The toolbar still gives access to the result.

## Details when needed

**Unchanged settings** holds the other saved values, kept by default. A changed flight mode displays its paired effect alongside it, even when the effect ID itself stayed unchanged. Selecting both retains their interpretation.

**Session, history & manual values** contains session time/short ID, full source revision/launch association, older snapshots, source-copy opening and a manual report. The old **Stage in the field form instead** action remains optional; it retains its separate conflict acknowledgment and cannot switch away from another definition with pending edits. The direct Apply action can preserve those edits in place.

Discovery lists metadata and existing saved-file presence only. Opening a result performs the full session, source, runtime and result validation. Corrupt saved results show an error; manual reporting remains explicitly unverified. Opening the tested source copy requires the existing unsaved-draft replacement choice. A result response arriving after the dialog closes or a different session is chosen cannot be applied.

The latest matching result is the newest saved timestamp, falling back to start time if absent. Matching requires the same Read-as format and a unique exact tested weapon name linked to the unique tested spell in declaration order. A weapon-only source may receive its unique tested weapon's values without adding a spell or changing the Vanilla target. Duplicates, relinked spells and ambiguous definitions refuse the return. Name matching identifies a proposed destination; it does not prove that an edited draft has been tested.

## Safe optional additions

`look`, `flymode` and `flylook` may be inserted only into a plain unmarked `newweapon` block whose active lines are supported, unambiguous numeric weapon fields. Existing blank lines, comments, BOM, indentation, mixed line endings, value formatting and unrelated blocks are retained. Original text is spliced, not regenerated. An EOF without a newline gains only the separators needed for the explicitly added lines.

An impact addition requires effect ID 0–299. Flight additions require both a mode and an effect/sprite: mode 2–9 with effect ID 0–299, or the unchanged recorded mode-1 sprite pair from the result. The general source form can also accept explicit mode-1 sprite IDs as numeric metadata, without claiming they exist. Flight values missing from source are compared to the helper's recorded runtime baseline; no engine defaults are inferred. A baseline mode 0/unknown interpretation cannot be inserted as a supported source choice.

No insertion is offered into selected/inherited/copied weapons, active flags, unknown/opaque commands, repeated/malformed arguments or mixed active prefixes. Basic damage type and area must already be safely editable. These cases need manual source editing because the partial parser cannot establish effective inheritance or command scope reliably. A marked `#!@` line in `.c5se` remains an inactive hash comment; the same prefix in `.c5m` is active and blocks this insertion subset. Existing safely editable values can still be returned without reconstructing their surrounding text.

This is a source-editing subset, not an assertion that every supported integer is valid or visible in the installed game. Sound, spell damage/path/level, test participants and other values are outside the saved five-field exchange.

## Evidence and limits

The retained **Codex VFX Trial** session used CoE5 5.43 / CoE5SE 2.13.0. Its saved file contains baseline impact **7** and applied impact **3**, with **one completed cast call** for that applied revision. Type 4, area 0 and flight 2/7 stayed unchanged. The user reported visual success. Those are distinct claims: the saved file supplies helper-reported readback/call counts, while the user's observation supplies appearance evidence. Neither guarantees normal combat, AI, true range, timing, saves, audio or all effects/resolutions.

Version 0.12 reads the actual older package/result without changing it. The initial offline replay used a DOM adapter and exact export comparison. Subsequent **6 November 2026 Windows desktop acceptance** exercised the real WPF/WebView2 application and native Open/Export dialogs using separate disposable source copies. Direct Apply/export, explicit conflict replacement, unrelated pending edits in a weapon or spell, safe missing-line additions, unsafe-source refusal, already-applied values, keyboard snapshot selection, focus, scrolling and Escape closure passed. Four new exports contain exactly the selected changes. The retained session and earlier exports are unchanged.

That desktop pass exposed and corrected three small issues: Add labels for removed lines, a visibly disabled Apply button, and matching-result discovery surviving older failed requests/native-dialog contention. Removed-line additions remain unchecked and explain that selecting Add reverses that edit. Discovery may retain previously listed matching metadata during a temporary native-dialog error; review still validates the actual result afresh.

The rendered check used the captured 1427 × 954 window at the existing Windows display settings. A smaller viewport was not established reliably through the automation, and other window sizes/DPI settings are unverified. This was an agent-operated usability assessment, not an independent first-time-user study. No new game session or appearance observation was made. Lua helpers/dock remain unchanged from v0.11. Older canonical packages are accepted for read-only review; new launches require the current version.

## Acceptance checklist

Use a retained result and copies of its source; no game launch is needed to check this desktop flow.

1. Open the original prepared source. Review saved values and confirm the right spell, latest applied snapshot, changed impact and separate readback/cast statement. Expand history and select the baseline; no changed fields should be selected there.
2. Apply the changed impact and export to a new path. Compare source: only the chosen value should change. Reopen the result: that value should say already in draft and stay unchecked.
3. In another copy, edit impact in the form without applying it. Review: it must be unchecked with **Replace newer…**. Close without choosing it and verify the edit remains. Then explicitly select Replace and apply; only that field's pending edit should be replaced.
4. Leave an unrelated field edit pending, including while a spell/another record is selected. Apply a tested weapon value. Confirm your original selection and pending text remain, and export stays blocked until those edits are resolved.
5. Remove optional visual lines in a plain source copy. Review: additions must be unchecked and show the exact command/value. Select the desired additions, apply, and verify placement, line endings and retained comments. Inherited/opaque/repeated blocks must explain why manual editing is needed.
6. Inspect a missing/corrupt result only in a new disposable copy, never alter the retained successful session. Confirm the error, labeled manual fallback and absence of an invented cast/visual verdict.

The checklist has passed in the desktop setup described above. The highest-value next check is a friend completing the flow unaided on their own display and reporting the first unclear step. No broader in-game test is needed to verify this source-return change; any later gameplay test must use a new disposable session and stay separately documented.
