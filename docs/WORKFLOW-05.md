# Version 0.5 workflow and review

> Publication note: the user separately authorized uploading version 0.5 after development. Statements below about local-only work describe that development phase. Machine-specific manifests, raw local reports and private reference data are excluded from this source snapshot.

5 November 2026. This phase improves usability; source parsing, patching, native file I/O, metadata readers and cache contracts are retained. All changes remain local. No game, mod, save or Script Extender source was changed, and no GitHub push, PR, release or message was performed.

## First use

The app starts without a source, instead of silently loading the example. The editor states its purpose: edit spell/weapon definitions and export a new copy. Open mod file, Try example and Browse library are visible starting points. There is no wizard, dismissal preference or source autosave. Browsing references does not require a source. Export is disabled until source text has actually been opened or pasted.

Try example explicitly loads the linked starter and labels it Example fragment. A visible notice states that it is not an installable mod. Opening a real file replaces that label with Original retained; pasted text is labeled separately. The filename and selected definition/type remain visible. An empty or unsupported opened file is distinct from no file: its text remains reviewable/exportable, while unsafe editing controls are unavailable.

## Next useful action

A compact four-stage strip follows Open/example → Select/edit → Review → Export. Its sentence changes with actual state:

- No source: open a file, try the example, or browse references.
- Loaded definition: edit its supported values or select a spell for weapon assignment.
- Unapplied values: Apply changes to update the held draft.
- Applied draft: Review changes, then Export copy. The original is still separate.
- Successful native export: copy exported; continue editing or open another file.

The status strip remains visible while scrolling. Important errors stay near fields and in source checks. Advanced VFX fields open on invalid submission before focus. Read-only/unset fields explain their limitations; no value is inferred from an empty control. Prepared source is labeled as the applied draft when field edits are still pending.

## Weapon selection

The spell's Weapon assignment group has Choose a weapon from the library. It switches reference browsing to weapons and focuses search without touching source or pending values. The library also has a destination selector listing the source's spells. Selecting one uses the same guarded source-selection path: pending field edits must be applied/discarded before changing destination.

The assignment area names the selected weapon and destination spell/file and previews the exact Weapon reference token change. Use this weapon places only that value in the form. Other pending values are preserved. It becomes Selected — Apply changes until Apply; afterward it says Already assigned. No silent apply or export occurs.

Unavailable states explain recovery: open a source, select a spell, choose a weapon rather than a spell reference, import the matching weapon data, or repair a missing/ambiguous assignment in the usual source editor and reopen it. A disabled destination selector explains that Apply/discard is needed before switching. It does not disable assigning another weapon to the same spell while other fields are pending.

Historical records retain numeric IDs so duplicate names remain distinct. Name-only/documented examples retain the safe quoted-name route. The preview shows which route is used. The version caution is next to the reference details: historical 5.33 IDs may differ from the installed game, unknown indexes have unknown origin/version, and the documented fallback is not installed-game verification.

## Reference information

Spell/weapon labels, known values, zero preservation and type-appropriate details remain. Name-only entries say that IDs/properties are unavailable, rather than repeating empty rows. Fields for other types do not apply and are omitted. Additional settings, raw provenance/fingerprints and coverage remain on demand. A reference spell can lead to its weapon when that dataset is loaded; its name is not treated as an assignable weapon.

Data scope is unchanged: the private 5.33 cache may contain 1,029 spell and 935 weapon records with selected supplied fields. The distributable still excludes raw exports/cache and falls back to the single documented reference. No full/current catalog, gameplay validation or VFX rendering is implied.

## Separate self-review and checks

This is an implementing-agent review, not a new independent review. Specific concerns addressed:

| Concern | Result |
|---|---|
| Empty startup could accidentally export an empty pseudo-source | Source kind tracks no-source separately from an opened empty file; export handler and button both guard it. |
| Existing tests assumed an automatically loaded example | Their fixture now explicitly invokes the real Try example action; new tests exercise untouched startup separately. |
| A destination picker might bypass pending-edit protection | It uses the same selection guard and restores the actual selected destination after refusal. |
| The assignment preview could show the wrong participant/value | It is recomputed from current source, live field value and selected reference; text is rendered as data. |
| Using a weapon could replace pending damage or silently patch source | It changes one input, preserves other controls, and still requires Apply. |
| Repeated Use clicks could imply more work when already chosen | Pending and applied assignment states are distinct and explain the next action. |
| Generic disabled wording could misdescribe a value-bearing spell as name-only | Name-only references and unloaded effect-weapon properties have separate explanations. |
| Lookup or review could discard pending values | Lookup changes only reference filtering/focus; review shows the applied draft without clearing pending inputs. |

Automated script checks cover these states and existing preservation/export/provenance rules. Native headless checks exercise the unchanged file/policy helpers; the Windows build and ZIP are regenerated and checked for private-data exclusion. Reports are under research/workflow-*.json / workflow-test-output.txt. Static semantics/focus calls and selected numerical contrast checks do not establish native keyboard, screen-reader or rendered layout acceptance.

The existing local-content inspection restriction was respected. No desktop rendering screenshot, native picker/close interaction, responsive/zoom acceptance or in-game test is claimed. Manual acceptance should follow the five-step first-use path, test each unavailable assignment state, cancel source/export actions, compare a copied file's bytes, and check keyboard focus at ordinary and narrow window sizes.
