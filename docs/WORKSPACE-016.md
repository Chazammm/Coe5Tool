# A source workspace for v0.16

Use **Start-Workbench.cmd**, or `build/desktop-016-workspace/CoE5Workbench.exe` with its whole folder intact. The Windows build needs .NET 8 Desktop Runtime x64 and WebView2. No game launch is needed to edit source. Earlier output folders and ZIPs are retained; they do not contain these changes.

## Target, format and preserved content

**Target** chooses creation and generated-pair test capabilities. Vanilla creates a native weapon fragment; CoE5SE creates a linked spell/weapon pair and offers SE tests. Target never converts an existing source.

Opening a file detects **.c5m** or **.c5se** from its extension. The toolbar shows that actual source format; a sidecar stays labeled **requires CoE5SE**, including when it contains native weapon commands. **Source format…** is an advanced parsing override, not a conversion. It can change which sections are recognized but cannot change the held bytes or original export extension. Resolve pending field edits before changing it. Pasted text has its own format choice.

Vanilla starts with a weapon-focused source view. If existing recognized CoE5SE spells are present, the source rail states how many are retained and offers **Inspect all source**. The expanded scope makes those entries available for inspection/editing, with a target mismatch explanation in the detail editor. Switching scope/target does not rebuild pending inputs. Other unsupported commands, monsters, includes, flags and formatting remain in **Prepared source**; the index and overviews cover recognized spell/weapon sections only. This is not whole-mod compatibility assessment.

The Vanilla example and creation form are native weapon-only. Saved test values and original observation remain explicitly labeled SE workflows. Existing mixed/SE source exports as a preserved copy; it is never certified as converted to Vanilla.

The weapon-focused view is not a Vanilla compatibility filter: existing sidecar weapons and SE-prefixed weapon lines remain inspectable. Prefix annotations and the detail warning explain that Vanilla skips `#!@` lines; an actual .c5se container remains SE-dependent. Unknown commands still require manual review.

## Open or drop a source

**Open mod file** and a file dropped anywhere on the editor use the same source reader: UTF-8 (BOM retained), 2 MiB maximum, no NUL/UTF-16/invalid encoding, and exact held source text. Existing files are opened read-only. **Export copy** always writes a separate new file.

Drop **exactly one** local `.c5m` or `.c5se`. A drag overlay explains what is accepted; unsupported files/folders or multiple files produce a message, with no partial import or merging. Drop multiple files separately, resolving/exporting the current draft between opens as needed. Older WebView2 builds without attachment support explain the fallback: use **Open mod file**. Linked/reparse/network drop paths are outside the native drop subset; use an ordinary local source copy.

Replacing an unsaved draft requires an explicit decision. If edits change while a file is being read, the application checks again before replacement. Drops are refused while an editor/test/return dialog is open. Native drops use DOM `File` objects passed as WebView2 attachments; arbitrary JSON paths are not accepted. The source file is never executed by this process.

Pasted text is also an unsaved draft, even before you edit a field. It stays protected until a confirmed desktop export; cancelling export does not mark it saved. Browser downloads cannot confirm that a file reached disk, so that fallback retains the unsaved warning.

## Overview → detail → return

Sources with more than 20 recognized definitions start in an overview. Smaller sources retain the familiar detail editor; **Source overview** opens the same overview on demand. The rail keeps a compact first 150 matching entries; search covers the full source, and the overview provides all matches in pages of 40.

- Switch **Spells · CoE5SE** / **Weapons**; type a partial name, or an exact source line such as `line:42`. Duplicate names keep their own line locations. Query/page/scroll are remembered separately for each overview type.
- Spell rows show supported explicit path/level and weapon/payload values. Weapon rows show supported explicit type/payload and range/area values. **—** means unavailable, not a game default. Partial/read-only sections remain selectable for inspection.
- Relationships are exact source-name matches already known to the parser. Multiple local matches are labeled ambiguous; external/numeric/unresolved references do not invent a game record. Source matches do not establish inheritance, effective stats, load order or runtime identity.
- Open an entry's name to use its existing detail editor. **Back to overview** restores the view context and focuses the current row if it is present. Pending fields may remain while browsing; opening another definition is blocked until they are applied/discarded. **Return to detail** recovers that form intact.

The table scrolls horizontally at narrow widths and vertically for its current page. This keeps the four columns readable without hiding data. No new dashboard, asset renderer or mandatory tutorial is introduced.

## Verification and remaining acceptance

The script suite covers scope/format consistency, source preservation, async replacement checks, drop feedback/rejections, duplicate names, relationships, paging and pending-edit navigation. Native checks cover the shared source reader and drop validation, plus existing runtime/session/result safeguards. Earlier sessions remain read-only reviewable; current launches require regenerated v0.16 canonical candidates.

The original rendered checks used the real UI files in **headless Chromium/Brave with a substitute native bridge**, at wide/narrow sizes and with a 2,000-definition synthetic mixed source. That earlier pass did not operate the Windows desktop.

A later authorized **real Windows acceptance pass** opened .c5m and .c5se through native dialogs, declined replacement of pasted and pending drafts, navigated the large mixed-source overviews, retained mixed content across target changes and exported a separate copy. The exported 129,708-byte mixed source differed by one intended byte (Weapon 417 range 6 → 9); the pasted export also matched its entered text exactly. Current desktop rendering, scrolling and keyboard return to a selected row were observed. A repeated damage-type ID and singular result-count wording found on screen were corrected with regression coverage. See [Windows evidence and limitations](../validation/workspace-016-desktop-20261106-dc41de/REPORT.md).

The computer-use tool rejected an Explorer-to-Workbench drag before completion. In a later chat, the user reported that the requested drag-and-drop check worked. This user report is distinct from an agent-recorded desktop check; it did not specify individual outcomes for each format, pending-draft replacement, unsupported files or multiple-file drops. Those cases remain separate acceptance items. Simulated DOM drops are not a substitute. Other DPI settings/monitor transitions remain untested; no game launch or new gameplay claim is involved.

Developers can reuse the [concrete consistency checklist](CONSISTENCY-CHECKLIST.md). For the native file attachment transport, see Microsoft's [WebView2 DOM File example](https://github.com/MicrosoftEdge/WebView2Feedback/blob/main/specs/WebMessageObjects.md) and [WebView2 API overview](https://learn.microsoft.com/microsoft-edge/webview2/concepts/overview-features-apis).
