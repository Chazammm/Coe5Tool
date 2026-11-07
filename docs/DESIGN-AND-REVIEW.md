# Version 0.2 design and separate self-review

5 November 2026. This redesign was reviewed by the implementing agent in a separate pass. **No new independent agent review or visual browser inspection was performed.** The 0.1 independent format review remains historical evidence in REVIEW.md.

## Design decisions

- Dark stone frames the working area; the parchment editor is the primary surface. Brass identifies source/review controls. Weapon amber and spell violet accompany text labels and distinct geometric marks, so color is not the only distinction.
- Georgia/system serif headings suggest a book/workshop; system UI text and monospace values keep the tool practical. No font downloads, images, game art, animation or effect graphics are used. Decorative marks are hidden from assistive technology.
- The source toolbar, definition editor and source disclosure are numbered 01–03. Name search and native type selection narrow the library without changing selection. Empty results explain how to recover.
- Damage, targeting/timing and visuals/sound form separate weapon fieldsets. Spell path/level and weapon assignment are separate fieldsets. Unsupported fields retain reasons instead of unexplained empty controls.
- Source and original comparison use native details/summary disclosures. Opening review leaves pending form values untouched and focuses the prepared source. Applied history distinguishes token replacements from inserted lines; line numbers are local to each apply step.
- Status distinguishes unchanged, unapplied and applied drafts. Apply/discard and download availability follow actual differences from the current prepared source. Restoring a value clears pending state without a redundant apply.
- Inline errors use associated text and aria-invalid, with first-error focus on submission. Native buttons, select, search, form and details semantics are retained. A skip link targets the editor heading; no positive tabindex is introduced. CSS includes visible focus on stone and parchment, a focus-within ring for the transparent file input, and space around library focus outlines.
- Breakpoints at 1200, 1120, 760 and 460px adjust field columns, toolbar wrapping and library/editor stacking. These are implemented layout rules; actual rendering at those widths is still unverified.

## Field-addition decision

Implemented only missing spell level in a plain, otherwise complete path/weapon block. The exact eligibility, insertion and refusal rules are in README.md. The official spell page allows property order variation, and the source level handler updates only level/hasLevel before attempting storage. Header insertion avoids moving old lines or guessing an insertion point near unknown commands. Existing declaration order stays intact.

Native field addition, missing path and paired weapon assignment are deferred: they need broader context/order/reference decisions. The conservative subset also declines spells with flags such as slowcast. That is a prototype limitation, not a claim that such spells are invalid or impossible to edit safely in general.

## Self-review findings and corrections

| Finding | Action |
|---|---|
| Filtering could otherwise recreate the form and lose unapplied values | Separate library rendering; regression checks input identity/value and switching guard while filtered. |
| Old dirty tracking treated an input event with no actual value change as an edit | Compare supported input values with the current draft; regression covers returning to the original value. |
| Source below a pending form could be mistaken for including unapplied edits | Persistent status plus source caption; disclosure regression verifies old draft remains displayed until apply. |
| Selection/apply replaces DOM controls and can lose keyboard focus | Selection/discard focus the heading; apply returns focus to a changed field; invalid apply focuses its first error. Adapter tests check these calls; browser behavior remains pending. |
| An inserted line must not rewrite comments/prefix/EOL or bypass ambiguity | Fresh inspection on patch; narrowly gated eligibility; exact-splice tests for both formats, BOM, prefix spacing, mixed EOL, final-newline absence and combined edits. |
| Pale focus color on parchment and a borderline input boundary | Use dark teal focus on parchment and a darker input border. Static color ratios are recorded separately. |
| A previous independent-review label could imply coverage of new code | Removed broad UI claim; README distinguishes historical review from this self-review. |
| Old scope note treated the original game hash as current | Updated MODDING_PLAN.md to retain the known drift/current-version uncertainty. No binary was restored or run. |

## What these checks establish

Automated checks exercise actual application code through a limited DOM adapter and parser/patcher tests. Static HTML checks assess declared semantic controls/associations; numerical contrast checks assess selected solid-color pairs. Neither is a browser, an accessibility audit, a screenshot review or native game acceptance.

The previously blocked local-file browser route was not retried or bypassed. The remaining visual/native-browser checklist is in TESTING.md. No game, mods, saves, extender, external repository or messages were modified by this redesign.
