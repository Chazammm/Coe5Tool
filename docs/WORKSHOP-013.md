# Workshop interface · version 0.13

This local revision reorganizes the desktop workflow. It adds no game API, renderer, enemy-wave system or gameplay claim. The user requested continuation without desktop control, so the redesigned screens have not received a rendered Windows acceptance pass.

## Using the desk

The starting desk follows **Target**: **New spell & weapon** for CoE5SE or **New native weapon** for Vanilla. **Open source…** is available in either. Its heading, description, empty-source note and steps switch too: Vanilla uses Edit → Review → Export; CoE5SE uses Edit → Test → Bring back. Creation uses the selected target without changing it implicitly. Existing source records and pending edits remain intact on target changes. These actions use the same creation/import paths as the toolbar. Open/Paste/Example remain available; no tutorial is required.

The source index sits beside a paper-colored editor. Exact source-name relationships appear under the heading: **Linked weapon** or **Used by spell**. Each button selects an existing source record. Duplicate matches remain separate, with line-specific tooltips and an ambiguity note. These links do not resolve runtime identity. Pending edits still block changing records.

The editor shows damage, path and assignment first. **Visuals & sound** remains optional. A **?** reveals help for an editable field; unavailable fields keep visible explanations and errors stay visible. **Find…** opens searchable data. Names, explicit IDs, categories, provenance and versions remain distinct. The matching list and selected entry have separate panes; partial-name search, arrows and Enter retain their existing behavior. No catalog has been expanded or relabeled as complete.

**Apply changes** writes pending fields into the held draft. **Review changes** opens source/history. **Export copy** writes a new file and refuses existing destinations. New definitions return focus to the editor, with source review available on demand. Unknown lines, comments, formatting and unsupported commands remain preserved.

## Test bench and return

**Test bench…** places field setup beside isolated-session controls when space permits. The next-action heading reflects preparation, compatibility, profile setup, running and finished states. An outline identifies the corresponding action without performing it. Preparation never starts the game; Start stays explicit and native compatibility/process/isolation checks still apply.

Participants use name/search, with explicit IDs and source information under **Identity & source**. The field supports one enemy type with a count of 1–200, not mixed armies or waves. Generated identity and limits are under **Test identity & participant limits**; prepared text and ZIP export are under **Files & ZIP export**. Weapon editing remains opt-in.

The matching-result notice and **Saved test values** open the existing protected comparison. Changes are prominent; unchanged values and history can be expanded. Newer edits need explicit replacement. Missing optional visual commands require explicit Add selection and a supported unambiguous block. Apply retains unrelated pending edits; export is separate and stays blocked until pending edits are resolved.

Helper-reported values, completed cast calls and personal observations stay separate. Exit, readback and saved values do not prove appearance or ordinary combat. Older v0.9–v0.12 canonical packages remain reviewable; new launch preparation requires the current package. Retained sessions are not migrated or rewritten. Lua fixtures and the in-game dock are unchanged.

## Visual direction and size limits

System Georgia headings, Segoe UI controls and Consolas source text provide a restrained manual/workshop character. Cream paper, dark green ink/rail and brass rules replace blue panels. Search, reference, test and return views share surfaces, controls and focus treatment. There are no external fonts, artwork, gradients or decorative generated assets.

Native default size is 1120 × 800 device-independent units; the existing minimum remains 640 × 520. Responsive rules stack test/search panes below 850 CSS pixels, reduce the source rail, and stack source/editor below 620 pixels. Dialogs have viewport-bounded scrolling. These are implemented rules, not proof of rendering at those sizes. Small windows require more scrolling. Windows scaling, high contrast, native dialogs and visible keyboard focus need acceptance of this revision.

## Desktop acceptance still required

No game launch is needed. Use disposable source copies and the retained Codex VFX Trial result; leave its session untouched.

1. At the default size, confirm the starting actions are clear. Create a pair and a native weapon separately. Check target distinction and source review/export.
2. Open a disposable pair. Follow Spell ↔ Weapon both ways. Leave an edit pending and confirm switching is refused. Expand field help and Visuals & sound; check focus/scrolling.
3. Search Hydromancy and a duplicate unit name. Check name/ID/source readability, empty results, ArrowDown/Enter and focus restoration. Historical 5.33 data must not appear current.
4. Open Test bench. Inspect participant search, count, optional IDs, next action, compatibility and files. Do not click Start during this desktop-only review.
5. Review the retained result: impact **7 → 3**, correct spell/session, **one completed cast call**. Apply only impact and export a new copy; compare bytes. Repeat on copies with a newer impact, unrelated pending edits, safe missing visual lines and unsafe source. Use the [detailed return checklist](POST-TEST-RETURN-012.md#acceptance-checklist).
6. Repeat smaller and maximized; record actual client dimensions and Windows scaling. Check clipping, scrolling, focus, Escape and drawer closure. Other scaling remains unverified until observed.

Capture start/editor/search/test/result screenshots after this review. Existing `validation/workshop-013-20261106/before-*.png` images show v0.12 before redesign. No new rendered screenshots exist yet.
