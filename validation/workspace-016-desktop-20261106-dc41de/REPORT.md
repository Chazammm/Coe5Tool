# v0.16 Windows source-workspace acceptance

Date: 2026-11-06. **Partial pass: the native editing workflow passed; real Explorer drag-and-drop remains blocked and unverified.** This report records actual Windows WPF/WebView2 interaction, separately from the preceding headless browser tests. The user explicitly confirmed that the desktop was free. No game was launched.

The current `build/desktop-016-workspace/CoE5Workbench.exe` was used, with its whole output folder. The normal launcher points there. Disposable inputs and all new exports are inside this validation folder. No existing mod was used as a writable fixture.

## Results actually observed

| Check | Result / evidence |
| --- | --- |
| Native Open: .c5m | **Passed.** `01-Native-Trial.c5m` opened through the Windows file dialog; native weapon, damage 8, type 3, range 6 and actual `.c5m` format appeared. Screenshot (local evidence). |
| Native Open: .c5se | **Passed.** `02-Sidecar-Trial.c5se` opened through the Windows dialog. The app showed both its spell and weapon, and `Source .c5se · requires CoE5SE`. Screenshot (local evidence). This is parsing/UI evidence, not game compatibility. |
| Real Explorer drops | **Blocked by the computer-use tool.** A new Explorer window displayed the disposable inputs. The attempted native-file drag was rejected before completing a cross-window gesture. Consequently neither single-file format, multiple-file rejection, unsupported-file rejection, live drag feedback nor drop-specific replacement was established in Windows. These must not be marked passed from the earlier simulated DOM tests. |
| Unsaved pasted draft | **Passed through Open.** The untouched pasted draft showed `Pasted draft · not exported`; Open displayed a replacement confirmation. Cancel left the same draft visible and unsaved. A subsequent native export matched all entered text exactly. Prompt (local evidence), retained draft (local evidence), export (local evidence). |
| Pending edit | **Passed through Open.** Weapon 417's range was staged as 9. Declining the replacement confirmation retained that value and the unapplied state. Opening a different definition from the overview was also blocked until Apply/discard. Prompt (local evidence), navigation guard (local evidence). |
| Large mixed source | **Passed.** The 129,708-byte synthetic source has 1,000 weapons and 1,000 SE-prefixed spells, an unresolved include, unsupported monster/opaque text, BOM and mixed line endings. It opened directly in the paged overview; both types showed 1,000 matches. This represents large-source handling, not a validated installable mod. Default window (local evidence), maximized (local evidence). |
| Search, duplicates, relationships | **Passed.** `dup bla` found both Duplicate blade entries, separately labeled lines 99 and 107, with different payloads. Spell relationships identified two source matches as ambiguous. `wea 417` found Weapon 417 at line 3339. Duplicate search (local evidence). |
| Detail → overview / focus | **Passed.** Opening the line-107 duplicate selected payload 14. Back preserved `dup bla`; Enter then reopened that same line-107 entry, demonstrating keyboard return focus. The later weapon query survived its detail round trip; switching to spells showed that overview's separate empty query. Pending range 9 survived Return to detail. Return view (local evidence). |
| Scrolling | **Passed at observed sizes.** Mouse-wheel input inside the overview scrolled table rows independently. Normal page scrolling also worked. At the default window fewer rows are visible; maximizing exposes substantially more. Table scroll (local evidence). |
| Vanilla ↔ CoE5SE | **Passed.** Vanilla changed ordinary actions and the rail to weapons, explicitly stating that 1,000 spells were retained and nothing removed. Inspect all source exposed the spell overview while keeping range 9 pending. Returning to CoE5SE retained the edit and source format. Vanilla state (local evidence). |
| Apply / native separate export | **Passed.** Apply reported one source change. Native Save wrote `Large-Mixed.range9.exported.c5m` in this folder, then the app reported no pending changes. Offline byte comparison found exactly one changed byte: range `6` → `9`, at zero-based byte offset 53913. The complete remainder, including mixed/unsupported text and formatting, matched the input. Applied edit (local evidence), Save dialog (local evidence), completion (local evidence), comparison (local evidence). |

## Tool boundary and display limits

The rejected drag reported:

> point (562, 712) is over msedgewebview2.exe "Chrome Legacy Window", not target window explorer.exe "inputs – Datei-Explorer"; activate the target or take a fresh screenshot before retrying

This is the automation tool's target-window check, not a Workbench file-open error. No substitute paste/import gesture is counted as an Explorer drop. The test-only Explorer window was closed afterward; the three pre-existing Explorer windows were retained.

The registry's current `AppliedDPI` value was **120 (125%)**. Captured visible window bounds reported by the computer-use API were **1107 × 794 logical pixels** in the normal window and **2048 × 1104** maximized; its screenshot metadata is retained alongside each image. The application's configured initial outer size is 1120 × 800 WPF units, which is distinct from the bounded capture dimensions. No independent per-monitor DPI measurement or physical outer-window measurement was made.

Text, focus outlines and controls were readable/usable at these two observed sizes. The toolbar wrapped at the default width and aligned into one action row maximized. Attempts to resize to a narrower window did not establish a different window size: one gesture scrolled the page instead. The retained image (local evidence) is explicitly labeled as an unchanged-window attempt. Minimum-width behavior, other scale settings and monitor transitions remain unverified in the real desktop app. The earlier narrow headless render remains separate evidence.

## Issues corrected and retested

The real weapon overview displayed `pierce · #3 #3`, and a single search result said `1 matches`. Removed the duplicate appended identifier and used singular/plural result text. No parser, drop transport, native reader, source-writing or game helper behavior was changed.

Added one focused regression covering ordinary type summaries, zero/one/multiple search results and unchanged source. **210/210 script tests passed** in script-checks.txt (local evidence). The desktop output rebuilt successfully (build output (local evidence)). Reopened the actual rebuilt application and observed `pierce · #3 · payload 418` and `1 match` in the correction screenshot (local evidence). Only these affected UI checks were repeated after rebuilding. The earlier native opening, protection and export checks used the same native host and are not misrepresented as rerun after the text-only correction.

The preceding 97 native/mock checks and 24 round trips were not rerun wholesale for these two display-only changes. Their earlier results remain in the previous report. No new gameplay, VFX or AI claim is made. Existing ZIPs/friend packages were not rebuilt or published; use the current desktop output or normal launcher for these corrections.

## Preservation and cleanup

Artifact checks (local evidence) confirmed all **882 files from the earlier protected snapshot unchanged**, all **47 built UI assets matching current source**, the original-observation helper unchanged and the installed game executable fingerprint unchanged. All four disposable input files still match their preparation hashes. The pasted export matches its entered text exactly; the large exported copy differs only by the intended byte. Native dialogs/WebView may retain ordinary application-local UI history/cache; no attempt was made to restore those volatile settings.

Both Workbench instances opened for this acceptance pass were closed after their work was exported or unchanged. The new Explorer window was closed; no unrelated window or process was closed. No game process was launched, and no CoE5 or Workbench process remained in the final process check. Existing game files, mods, saves and retained sessions were not edited.

**Next acceptance:** complete the actual Explorer gesture matrix (one .c5m, one .c5se, declined unsaved replacement, unsupported and multiple-file drops), using a cross-window-capable tool or a user-operated check. The Fireball/Spear original-record observation game tests remain pending as a separate later task.
