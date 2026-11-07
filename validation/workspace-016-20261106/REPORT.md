# v0.16 source workspace · usability and consistency

Date: 2026-11-06. **Implemented, rebuilt and verified offline.** The user requested **“Keep verification offline; I’m using the desktop.”** No Windows desktop input, WPF application window, real file dialog, Explorer drag gesture or game was operated. The rendered evidence below is explicitly **headless browser evidence with a substitute native bridge**.

## Current application

Use [Start-Workbench.cmd](../../Start-Workbench.cmd) or CoE5Workbench.exe (local evidence) with the whole output folder intact. The launcher and standard build now select the same v0.16 output. It requires .NET 8 Desktop Runtime x64 and WebView2. A separate framework-dependent local standard ZIP (local evidence) was built; no friend package or public release was created. Previous outputs and ZIPs remain intact.

## Concrete changes

- **Target versus source format:** Vanilla defaults to a weapon-focused index/overview. Imported CoE5SE spells are explicitly counted as retained, with **Inspect all source**; they remain inspectable/editable with a mismatch explanation. Target/scope changes do not rebuild pending inputs or convert source. File format is detected on opening; **Source format…** is a separate advanced parsing override with a preservation warning. Paste has an explicit format choice. Only an empty workspace changes its default paste format with Target.
- **Related controls:** Vanilla's example is now weapon-only; its creator shows static native .c5m format instead of irrelevant disabled SE choices. Its generated-pair test action is hidden; saved values and original observation are explicitly SE workflows. Imported source is no longer mislabeled as a standalone weapon. Sidecars remain SE-dependent; SE-prefixed weapon lines receive index/overview/detail annotations and a Vanilla skip warning.
- **File drop:** One local .c5m/.c5se passes via WebView2 DOM File attachments to the existing native reader. The host does not accept arbitrary JSON paths. Feedback appears while dragging and explains dialog/read blockers; multi-file, unsupported, invalid, folder/linked and oversized input is refused without partial import. Open/drop share the replacement guard; edits made during an asynchronous read require a new decision. Dialogs block drops.
- **Pasted drafts:** An audit found untouched pasted text was treated as already saved. It now remains unsaved until confirmed desktop export. Declining replacement or cancelling export preserves that work and its warning.
- **Source overview:** Larger sources start in a compact paged overview; smaller sources keep the familiar detail editor and offer **Source overview**. Spell/weapon tabs, partial-name or explicit `line:N` search, line-qualified duplicate names, supported explicit field summaries and source-only relationships are available. Each type retains its query/page/scroll context. Back restores focus to the current row where present. Pending forms survive browsing; opening a different entry is blocked, while reopening the current entry recovers that same form. The rail lists the first 150 matches; the overview exposes all matches in pages of 40.
- **Reusable audit:** [CONSISTENCY-CHECKLIST.md](../../docs/CONSISTENCY-CHECKLIST.md) records eleven concrete cases with impact, expected behavior and verification. The original-observation forced-cast wording was already fixed before this task; its regression remains guarded rather than being claimed as a new fix.

Unknown commands, includes, unsupported sections, BOM, spacing, prefixes and line endings remain in held source. Neither the target filter nor summaries claim complete game definitions, inheritance, runtime identity or Vanilla compatibility. Editing still uses the existing explicit Apply and separate-copy export.

## Verification results

| Evidence | Result and actual scope |
| --- | --- |
| script-checks.txt (local evidence) | **209/209 pass.** Includes existing creation/edit/export/return checks and new consistency, overview, native-attachment bridge, drag feedback/rejection, duplicate/line search, untouched paste, async replacement and source-preservation coverage. Old target tests that equated preservation with an unfiltered index now check explicit retained-content inspection and unchanged bytes/pending inputs instead. |
| native-checks.json (local evidence) | **97/97 pass.** Compiled file/policy logic, native drop reader validation, exact canonical helpers, substitute-process isolation, runtime fingerprints, existing helper mocks and retained results. v0.15 editable/original candidates remain review-only; no old session was migrated or relaunched. These include mocked Lua scenarios, not actual battles. |
| native-roundtrips.json (local evidence) | **24/24** native-reader → actual application-script Apply → separate export scalar/mask cases pass. |
| retained-replay-output.txt (local evidence) | Real retained Codex VFX Trial read-only replay passes. Its older impact 7 → 3 / recorded cast call and known export remain unchanged. This is not another gameplay test. |
| render-checks.json (local evidence) | Headless Brave/Chromium uses actual UI assets and a substitute native bridge. A **129,684-byte synthetic mixed source with 2,000 recognized definitions**, BOM/mixed EOLs, an unresolved include and unsupported monster text opens without source loss. Wide 1440×960 and narrow 800×740 layouts, field focus/preservation, target/format changes, search/overview navigation, confirmation rejection, exact one-token Apply/export, DOM File/DataTransfer drops and untouched pasted text were exercised. |
| artifact-checks.json (local evidence) | All **882 snapshotted protected files unchanged**; zero volatile old-profile changes. Old v0.15 output, retained test evidence and older packages were preserved. Original observation Lua is byte-for-byte unchanged. Installed game fingerprint unchanged. All 320 HTML IDs unique, 23 scripts approved, and all 64 public output files match their source. |
| package-checks.json (local evidence) | All **64 packaged files** match output bytes. No private cache, local catalog dump, mod source, profile, retained session or game/extender binary is bundled. No upload, message, PR, GitHub push or publication. |
| Real Windows desktop | **Not performed**, per the user's offline-only instruction. Explorer→WebView2 COM transport, WPF hosting/file dialogs, OS confirmation/focus and real desktop DPI remain unverified. Headless DOM drag events are not a substitute for that acceptance. |
| Game behavior | **Not tested or changed.** This task makes no gameplay, AI, VFX or native-only testing claim. |

The prior helper-only Lua regression suite was not rerun wholesale for these source-workspace changes. Relevant native helper mocks and result round trips remained enabled. The game installation, mods and saves were not used as test fixtures or changed.

## Rendered evidence — not Windows desktop screenshots

- Wide spell overview (local evidence): compact rows, source-line identities, source relationships and full match counts.
- Vanilla with pending detail edits (local evidence): weapon scope, explicit retained spells and blocked format override, with the same pending input preserved.
- Narrow all-source overview (local evidence): retained spell inspection under Vanilla, clear scope and readable table layout.
- File-drop feedback (local evidence): source-open drag feedback over an unexported pasted draft.

These images are real browser renders of the UI files, generated without taking over the desktop. They do not show the WPF title bar, native dialog or Explorer drop transport. Partial values and unsupported/inherited behavior are not inferred from an image.

## Review and remaining limitations

This was a self-review, not independent agent review. It traced Target → file format → view scope → selected record → pending/applied state → export; a new input path was not allowed to bypass native reading or replacement checks. Rendered review led to denser overview rows, explicit subset counts, clearer scope labels and removal of the imported-source “standalone” assumption. A late safety review found and fixed the pasted-draft unsaved-state gap.

The overviews cover recognized spell/weapon blocks, not every CoE5 command/record type or included file. Relationships are source matches, not effective game records. The 2 MiB source limit remains; the rail is intentionally capped while searchable/paged overviews cover all recognized matches. Native drop supports one ordinary local file; linked/reparse/network drops and multiple-file projects are not imported. External-file watching, automatic saves, multi-file merge and format conversion are not added.

**Most useful next step:** when the desktop is available, run one Windows acceptance pass with disposable source copies: launch the current normal shortcut, use the native Open dialog, drop one .c5m and one .c5se separately from Explorer, decline replacing an unexported pasted/pending draft, reject a multi-file/unsupported drop, then navigate a large source through both overviews and export one intended edit to a new file. Check real focus, scrolling, drag feedback and DPI at the supported window sizes. No game launch is needed for that pass.
