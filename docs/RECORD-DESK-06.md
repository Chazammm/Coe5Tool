# Record desk · version 0.6

5 November 2026. Local redesign of the existing Windows workbench. No game, save, mod or Script Extender is changed. Nothing is pushed or released during this phase.

## Design direction

The organizing idea is a record desk: a source index, an editing sheet, and a reference drawer. Structure comes from typography, rules and material contrast rather than ornamental artwork. A blue-black shell holds the file controls and index. A warm, neutral sheet marks the editable source record. Monospaced command names, line locations and counts distinguish machine data from readable record titles. Muted teal identifies weapon records; violet identifies spells, alongside explicit text labels. The title stays small, controls are squared, and the layout has no gradients, fantasy icons, game art or simulated effects.

The previous interface repeated a next-step sentence, a numbered workflow strip, generic editor hints and action feedback. The library also occupied a permanent third column. Those choices made the tool feel instructional and gave reference browsing the same weight as editing. Version 0.6 removes the workflow component, its state machine and its copy. It does not replace it with a progress indicator or checklist.

## Working directly

- **Open mod file**, **Paste** and **Try example** are available in the file toolbar. Startup has no loaded source and no required example. An empty opened file remains distinct from no source.
- **Source index** finds and selects definitions without changing their order. The selected record shows its source command, line and syntax family. Unsupported values remain read-only with local explanations.
- **Apply changes** and **Discard field edits** stay beside the fields. Changed inputs have a small rust-colored margin mark; reverting or applying clears it. A short text state reports pending values. The sticky live status distinguishes no draft changes, unapplied fields, an applied draft not yet exported, and a successfully exported copy. Errors remain visible when relevant.
- **Review changes** is beside **Export copy** in the toolbar. It opens Prepared source and focuses the read-only draft. Pending field edits are explicitly excluded from that view and still block export. The inline disclosure remains available for comparing the original and reading applied history.
- **Reference library** toggles the reference drawer. It starts closed, even with a private cache. Closing it preserves its filter and selected record. Opening it focuses search; Close or Escape from inside it returns focus to the invoking control. The spell's **Choose a weapon from the library** opens the same drawer filtered to weapons, preserving typed fields.
- **Help** opens an optional, non-modal explanation of source/reference distinctions, Apply/export, unavailable fields and metadata limits. F1 toggles it outside the paste dialog. Close or Escape within help returns focus to Help. It does not apply edits, reset a source or require dismissal before working.

Unavailable review/export actions have descriptive text associated through aria-describedby, plus a title. Apply/discard explain their no-edit state. The source strip and editor state explain why an unapplied draft cannot be exported. Assignment controls retain their specific reasons for unavailable actions and the exact reference-token preview.

## Reference and safety boundaries

Source records and reference records have separate text labels and surfaces. Reference origin, historical version warning, known values, unavailable properties and raw provenance remain intact. The exact-fingerprint CoE5 Data 5.33 importer and name-only fallback are unchanged. Private reference exports and caches are excluded from the ZIP. The single documented Fireball reference remains the fallback without private data; no complete current-game database is claimed.

Using a reference weapon stages only the weapon-reference input. Pending damage or other inputs are retained; Apply is still required. Destination changes use the existing pending-edit guard. Numeric historical IDs and quoted-name routes remain distinct. Unknown, duplicate or ambiguous source content is not made editable by this redesign.

The parser/patcher, metadata importer, reference schema, bridge and native file implementation are retained. Original files cannot be overwritten: native writes still use FileMode.CreateNew. Existing comments, whitespace, prefixes, BOM and mixed line endings remain held and patched by source span. The only host policy addition is the exact new local documentation path; remote navigation, assets, permissions and browser download restrictions are retained. Native headless coverage checks that help path as well.

There is no game connection or visual/audio renderer. VFX values remain metadata. Partial source checks do not establish gameplay compatibility, asset availability or current-game ID validity.

## Layout and keyboard scope

The editor occupies the main column. Above 1,250 CSS pixels, an open reference drawer uses a third column. At smaller widths it moves below the editor. At 850 pixels and below, the source index moves above the sheet with a bounded list. At 600 pixels and below, fields and optional help use one column. A container query lets wide editing sheets put property groups alongside one another; narrower sheets keep them stacked. Long names, token values and provenance hashes wrap. The interface uses native buttons, details, selects and a modal paste dialog, visible focus outlines, a skip link, disclosure state and a forced-colors selection treatment.

These are implemented layout rules, not observed rendered results. No screenshot or visual acceptance was obtained: the previous local-content inspection restriction remains in force and was not bypassed through a different surface. Script-level focus and Escape/F1 handlers are tested; native Tab order, key delivery, screen readers, zoom, scroll positioning and responsive rendering require manual acceptance.

## Verification and separate self-review

The implementing agent performed a separate self-review; this is not a new independent review. Retained source-preservation tests, reference/data tests, export races and close-state logic are rerun alongside focused drawer/help tests. See [verification](VERIFICATION.md) for results and [manual acceptance](TESTING.md) for remaining checks.

| Review concern | Result |
|---|---|
| A hidden drawer could receive lookup focus | Spell lookup opens the drawer before focusing its search. Closing restores the invoking lookup or falls back to the header toggle. |
| Optional help could drop typed values | Help/drawer actions change only visibility and focus, without rebuilding the editor. Pending-form identity and text are tested. |
| Removing the guide could hide unsaved state | Draft state stays in the sticky strip; export stays guarded, with an associated explanation. |
| References could be mistaken for editable source | The drawer explicitly says reference, retains provenance/version warnings, and stages one field only. |
| Tests might conceal automatic onboarding | Untouched startup is tested without loading the example. Existing edit fixtures explicitly choose Try example. |
| Style rules could be mistaken for verified accessibility | Only semantic, script, static structure and selected contrast checks are claimed. Native rendering/accessibility acceptance remains open. |

Next: accept the desktop interface at ordinary and narrow sizes with keyboard and zoom, then address any observed clipping/focus issues. Broader current-game metadata, actual in-game tests and VFX support remain separate research. Plane-editor work stays behind reliable spell/weapon workflows; this version adds no engine capability.
