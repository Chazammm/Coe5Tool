# Existing-mod weapon journey: implementation and desktop validation

**Implemented and checked in the actual Windows desktop application. Fresh gameplay remains pending.** A modder can select a supported plain native weapon inside a larger `.c5m`, edit its properties, prepare a definition-only private-carrier test, review saved visual values against that full source, and export a separate copy. The test does not load the rest of the mod. No game was launched in this task.

## Practical obstacle and investigation

The project instructions, consistency checklist, [mixed area acceptance](../mixed-area-manual-20261108-724df2/REPORT.md), [recorded-results report](../mixed-results-20261108-0c23e9/REPORT.md), source parser/editor, creator, private-carrier package generator, native validator, isolated-session adapter and result-return flow were inspected. The publication checkout and remote main started at `bd77b763da1d5b159eb2d64e4d196d119ab7a4c6`.

The largest practical obstacle was the gap between the source workspace and testing: the private-carrier path required an exact canonical generated fragment with one weapon and its header. A supported weapon embedded in an otherwise preserved mod could be edited but could not reach the test. The user would have had to extract/recreate it and later transfer changes manually. [Actual desktop before the change](01-before-blocked.png).

Two related obstacles were found in source and reproduced offline: ranged-value return rejected a destination containing any spells, and opening a schema-4 mixed comparison's tested source incorrectly used the generated-spell-pair parser. The native weapon detail chooser also lacked the existing mode-scoped current effect catalog used by creation/comparison.

## Focused change and supported scope

- The source editor offers **Test selected melee/ranged weapon with CoE5SE…** for an eligible selected native weapon. The whole draft stays open. Pending fields must first be applied/discarded.
- A narrow source adapter requires an unprefixed `.c5m` `newweapon`, safe unique name, explicit range/init/type/damage/area and unambiguous recognized optional visual/sound fields. It rejects inheritance/copies, flags, extra/malformed commands, active SE prefixes, duplicate names/fields and guessed defaults. Existing carrier limits still apply; no unsupported command is dropped to enable a test.
- Only the selected explicit properties generate a canonical test copy. The unchanged strict native validator still validates that copy. Only the canonical weapon/private carrier/helper enter the disposable profile. Other weapons, spells, units, includes and globals are not loaded or certified.
- The preparation dialog identifies the selected name, source line/file and **definition-only** scope. Fixed melee/ranged and comparison keep their existing runtime, ownership, target and cleanup contracts. Generated pairs retain their separate **Cast once** route and existing canonical source identities.
- In native weapon details, **Find…** for impact uses the pinned 5.43 impact catalog; flight mode 1/2 uses the corresponding sprite/particle catalog. Names, IDs and provenance remain visible. Selecting a visual does not change range, damage type or mode. Other modes retain manual/general editing; no desktop VFX renderer is claimed.
- Ranged comparison return can locate a unique tested weapon inside a full source containing unrelated spells. It returns only explicitly selected visual fields. Newer conflicts, unrelated pending fields, safe optional insertion and separate-copy export keep their existing protections. A schema-4 tested-source snapshot now uses the weapon parser.

Results still associate with a source interpretation and unique exact weapon name, not a full-mod origin fingerprint. A same-named file is not automatically the original mod; inspect the session/prepared source. [Supported fields, boundaries and workflow](../../docs/SELECTED-WEAPON-016.md).

## Actual desktop observations

The current rebuilt `build/desktop-016-workspace/CoE5Workbench.exe` was operated using the authorized desktop. Captured app surface: **1107 × 794 logical pixels** at the current display scaling. Disposable self-authored examples were used; no personal mod file was published.

1. Native **Open mod file** opened the representative `Harbor-Workshop.c5m`: two native weapons, a prefixed spell reference and preserved monster text. Selecting Harbor Needle enabled the ranged test without closing the full source. Partial search `Needle` found the weapon and spell with separate source lines; the linked spell remained inspectable.
2. **Visuals & sound → Find…** opened the scoped impact picker. Partial search `Acid` exposed **Acid Splash #49** with pinned 5.43 provenance. [Rendered chooser](02-editor-impact-search.png).
3. A disposable wrapper around the previously tested **Mixed Area Needle** definition found the actual retained result from session `cbfecb30b08f4638aff95e283e6dc4c1`. It contained another weapon and an unrelated prefixed spell. This is review of old gameplay evidence, not a new run of the wrapper.
4. A newer impact **49** was applied in that draft. Review of the retained second battle clearly showed **34 → 68**, **Draft 49 → saved 68**, unchecked **Replace newer Impact effect**, and disabled Apply. The view separately stated six recorded defenders, unknown hits/attack positions and definition-only test scope. [Protected conflict](03-newer-conflict.png). The personal visual-observation checkbox was left unchecked.
5. Explicitly selecting Replace and **Apply selected to draft**, then native **Export copy**, wrote a new 505-byte file. Byte comparison confirmed exactly `look 34` → `look 68` against the wrapper original; the extra weapon/spell, BOM and line endings stayed intact. [Completed export](04-return-exported.png).
6. Reopened Harbor source, selected Needle, edited initiative **5 → 6**, applied and exported a new copy. Byte comparison confirmed only that selected weapon's initiative changed; the other weapon's initiative remained 5. Pending input disabled testing until Apply. [Edited full source](05-selected-weapon-edited.png).
7. Prepared a visual-comparison session with payload **8**, **Spearman #13 × 1**, range 5, pierce #3, weapon damage 0, area 0, sprite mode 1 / Ballista bolt #7, Blood Burst #34. The dialog clearly excluded the rest of the mod. [Initial preparation](06-selected-weapon-prepared.png).
8. Switched to Vanilla: spell content was explicitly retained outside the weapon view, the linked reference stayed visible, and the test remained labeled **with CoE5SE**. Source was not converted. [Vanilla scope](07-vanilla-scope.png). Restored CoE5SE and prepared the final session below. [Final ready state](08-final-prepared-session.png).

The compact existing editor/modal design remains. At this width, the longer selected-weapon toolbar action wraps onto the existing second toolbar row, the full-source and dependency explanations remain readable, and the return modal scrolls with Apply above the readings. Other DPI/monitor widths were not newly verified. Reopening preparation resets its options and invalidates the previous preparation by design; this pass restored the exact options and prepared a final new disposable session, without launching either preparation. Resumable preparation remains a usability limitation.

## Offline verification and preservation

- **265/265 JavaScript tests passed.** Eight focused cases cover bounded extraction/exclusion, canonical/pair compatibility, refusal of unsafe source, preparation/pending edits, mode-specific partial visual search, full-mod visual return, conflicts/duplicate names/format mismatches, unrelated pending edits and schema-4 snapshot opening/declined replacement. Existing result compatibility, optional insertion, source preservation and private-fixture checks continue to pass.
- **35/35 compiled desktop checks passed.** These exercise source import/export, canonical packaging, policies and old saved-result/session safeguards offline, using scratch inputs and a harmless test child; they are not game checks.
- Windows x64 publish succeeded with the existing locked dependencies. The native carrier/helper templates, game runtime and extender implementation were unchanged. No downloadable package was rebuilt or replaced.
- Both disposable exports were compared byte-for-byte. Harbor original SHA-256: `249e36051d751ce2c125ae76aa9282161bac8626caf81d712bb284359ca25061`; edited copy: `d4de43ad6f4eee2d3f5bf1f77b2e662ecb659a5d2b8b06fb9014fb3f22e8b9e4`. Wrapper original: `054f97e1e8c1dc6a322a08fb2e96f2f27f827237a926a5ad17ced28490c0a7ac`; impact-only export: `4114b766bae93720b897018b39b53faf43c1f9a82ecf09081d7b3688c92f02d5`.
- All **33 files** in the retained reference session match their pre-check hashes. All **19 staged files** in the final new preparation match its ledger. Local `offline/preservation-and-preparation.json`, native/script outputs and before/after manifests retain the detailed checks. Runtime binaries, profiles, candidate/session files and disposable source wrappers remain local, excluded from publication.

## Fresh manual game acceptance — pending

The app is left at **Start isolated test**, not started. Final session: `431503a2c00946189ffe5312beb742f9`, mod ID **WB_Ranged_mw89jz3l**, revision `d0dc0b65214b5e785dd11412680d9dc53d7d3beafd240e7116c40202c73c281b`. Its status is prepared, stale is false and PID is null. Local files are under `%LOCALAPPDATA%\CoE5Workbench\Tests\431503a2c00946189ffe5312beb742f9`.

The compatible prepared CoE5 5.43 executable hashes to `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55`; official CoE5SE 2.13.0 plugin to `26861bb0b6dffaa7150ed239e9eba4e934a955688d101c81161cf395190dd254`; loader to `d34232bd0ce6c8839beec7331b237878bfb93725b5e8d8c89ec80ee6017dcd8d`. This single-type test uses the released extender, without the mixed-roster overlay. Native runtime verification accepted it. No new online release research or game-binary changes were necessary.

1. In the currently open Workbench dialog click **Start isolated test**. Use that button, not the Steam launcher. At the game menu open **WB test: WB_Ranged_mw89jz3l**.
2. Choose **Battle (fresh target)**. Watch for **Harbor Needle** in the combat log and separately note whether the bolt flight and Blood Burst impact are visible. A completed battle does not guarantee that the AI used the weapon.
3. Back in comparison choose **Impact…**, search/select **Flame #68**, then **Apply visuals**. Keep mode 1 / bolt #7 unchanged. Run **Battle (fresh target)** again. Note named weapon use separately from appearance; no broad VFX claim follows from one combination.
4. Choose **Finish** to return to the main menu, then click the visible **Quit** label normally. Do not open a campaign or close an unrelated game. Report any error or failure to reach the menu/exit.
5. In Workbench use **Refresh status → Review saved test values**. Select the second battle, review the impact-only change and any unknowns, **Apply selected to draft**, then **Export copy** under a new filename. Keep the full Harbor source open. Report weapon use, flight/impact appearance, field closure, normal exit and any result/export problem independently.

If Workbench was closed or the preparation dialog reopened, its options must be re-prepared: open this folder's `Harbor-Workshop.edited.c5m`, select Harbor Needle, enable **Compare visuals in game**, use payload 8 / default target and prepare files/session anew. Do not bypass stale-state protection by launching an old runtime directly.

## Remaining limitation and next step

The most important remaining limitation is fidelity to a real mod's full context: inherited/flagged weapons, later overrides, includes, mod-added targets and spells outside a generated pair do not gain safe complete-mod execution. The new route intentionally supports only explicit plain native weapons and labels the test's scope. Melee, range, area, special payload, sound and visual restrictions are unchanged. Ranged comparison returns visuals only, not payload, roster or inferred hits. HP changes still cannot attribute an attack; attack-time positions remain unavailable in these receipts.

The most useful next step is the short new **Harbor Needle manual comparison and protected full-source export** above. Record its actual AI use/visuals and normal exit before describing this new source-to-test journey as gameplay-validated. The earlier mixed area-5 game success is preserved as separate evidence and is not reused as a fresh Harbor Needle pass.
