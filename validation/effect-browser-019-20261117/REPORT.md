# Test Effects — Workbench 0.19.0-rc.2

Date: 2026-11-17. **Corrected in-game acceptance remains pending.** Source and local Windows candidate; no new GitHub/Nexus download is published by this task.

## Implemented workflow

Test Effects opens without creating, replacing or loading an editor draft. It prepares a canonical private fixture through the existing native runtime, ownership, process, source/hash and isolated-profile gates; Start remains explicit. The new route requires the user's pinned Windows CoE5 5.43 and separately extracted official **CoE5SE 3.4.4 / API 14**. Latest official stable checked at task start was **3.5.0** (2026-11-17); it has not acquired a complete verified Workbench profile and remains refused. Existing 2.13.0, 3.2.2, 3.3.0 and 3.4.4 routes/results retain their own contracts.

The game browser reads native spell IDs 0–1028, named native weapon slots 0–1199 and effect slots 0–299 from the isolated running game. Search accepts partial names/IDs, names sort alphabetically and duplicate names keep distinct IDs. The verified pristine catalog has **1,029 spell records and 936 named weapons**. All valid native spell IDs offer a deliberate original item-style request; no scalar/mask, area, chain or flight reinterpretation is performed. This is not normal AI or proof that every spell has suitable targets/terrain/state on the grass field. Native readbacks retain original spell/weapon associations; no built-in weapon setter or standIn copy is used. The official API may extend range temporarily. Known fields are checked, not full-record equivalence.

Other categories reuse the existing pinned role metadata: **30 sprite candidates** (11 native witnesses, one unnamed witnessed entry), **55 mode-2 particle flights** (24 witnesses), **126 impacts** (101 witnesses), and **all 300 effect slots** for inspection (240 named in the pristine executable). Name suffixes provide some role hints; identity/use is not an appearance guarantee. Private previews change only a uniquely named guarded weapon's flight/impact, with fixed piercing #3, payload 1, area 0. A supported weapon preview copies visuals only, not its full behavior. Unnamed/unavailable role-incomplete effects remain inspect-only; mod-added content and adjustable private modes 3–9 are not fabricated. Originals can retain those modes through their full native records.

The rc.2 primary Cast/Reset/Close actions remain at the top. The whole bottom 140 UI units are left clear. Inspect uses the same right-hand panel, readable labels, paging, Copy values and Back to list; it no longer opens the parchment inspector. The overlay steps aside while the native cast draws, returning afterward. Viewports below 700×480 UI units refuse opening. Geometry and click release/stale-paint logic are model-checked; exact corrected game placement/visibility is still unobserved.

Bound receipts separately record requested casts, returned calls and inspected values. Old request counters remain unknown rather than inferred. Per-entry history is capped at 64 with discarded-count disclosure. Candidate/helper/runtime/session/run validation precedes read-only review, including through Prepared tests. No hit, named attack, HP damage, attack-time position or visual correctness is inferred. No draft is attached to a browser; it cannot open a misleading partial source snapshot or automatically return values. Copy explicitly exposes a native visual fragment and incomplete-definition notes. Existing protected Apply/separate-copy export remains untouched.

## Actual desktop and first user game attempt

The agent launched the initial rc.1 Windows build and observed both Test Effects entry points at **1107×794 pixels**. Its actual setup showed the verified 3.4.4 preview profile, **1,847 native target choices**, Spearman #13 ×4, enabled Prepare and disabled Start. The first welcome row mixed the forced-preview and AI-observation caption; corrected in source. Input was detected, the user asked to leave the desktop alone, and no further agent desktop input or app closure occurred. Final rc.2 rendered interaction is **not** claimed.

The user then prepared/started a disposable rc.1 session and supplied a real screenshot of its parchment inspector. Logs confirm official API 14, the private records, a Fireball #445 field with four Spearmen and inspections of **Acid Spray #401 / weapon #618 / area 2010** and **Acid Dart (fly) #164**. The bound receipt contains **zero returned casts**. The user reported no Cast action. The original helper's separate inspector lacked Cast, could relabel it Inspect only, and artificially limited original area/payload categories. These are confirmed source/UX problems; the evidence does not prove a separate native click or rendering defect.

The corrected rc.2 removes the original-record area/payload filters, makes Cast persistent at the top and replaces the separate inspector with inline inspection. The exact initial helper is archived for **read-only review**, while new launches require a fresh current browser. The completed first session and staged files were not patched or replayed. Its receipt ends at inspected; although the log contains SDL shutdown, field closure, a native-menu Quit and numeric exit code were not established from that evidence. No successful new-version cast or VFX is claimed. The agent started no game.

## Investigation and supplied prototype

Official 3.4.4 source contracts were inspected: spellInfo returns original ID linkage/payload; numeric openTestField accepts valid spell slots; fireTestField dispatches the original selected spell as an item-style attack. No area/type validator is needed to reconstruct it because no reconstruction occurs. Native setter readback and private identities still guard visual-only writes. A returned call has no public hit/success result; cleanup is not a complete game-state rollback. The 3.5.0 documentation adds field inspection/text-event APIs, but binary/profile/game acceptance is a separate task.

The separate Sandbox project was inspected read-only. Its right-side panel informed the layout; its experimental core was not used or changed. The earlier WeaponTester research was reviewed; no code without explicit reuse terms was copied.

The user attributed `spell-animations 2.zip` to musical_pianist; SHA-256 **6f4e34a8ae607a13fad1281dc3c5c3f883cbd7063fb766f810694b3a6c391e87**. It contains an HTML/WebGL viewer, builder/tests, visual-table TSV, images and how-to media. It is useful reference for flight/area variants, not an in-game cast helper or proof of native execution. Its builder expects separate game/address inputs; the supplied archive has no explicit license or executable fingerprint. It was inspected without executing its code. No supplied source, generated viewer, TSV, media or game assets were copied into Workbench or committed.

## Offline checks

- **355/355 JavaScript tests passed:** existing regression suite plus catalog search/order/duplicate IDs, all-original request policy, canonical generation, unsupported runtime/target refusal, empty data, draft/pending-edit preservation, explicit prepare/start, hidden-selection invalidation and read-only browser receipt navigation.
- **140/140 compiled native checks passed:** old runtime/profile/result vectors plus canonical browser, tamper/unknown-version refusal, private target, isolated preparation/resume/start intent, active/used/stale refusal, read-only receipt association and old rc.1 browser review without replay. Substitute processes were used; no game was launched.
- **19/19 actual Lua-VM model cases passed** using the previously built standalone test DLL checked against its manifest. Synthetic APIs cover private versus shared IDs, refused/partial writes, incomplete/wrong spawned identities, source changes, inline inspection/copy, geometry/hitboxes/release handling, overlay suppression while casting, open/close failure and receipt refusal. One case uses the user's locally decoded pinned catalog and requests **all 1,029 native IDs** with original payloads and zero shared setters. It is **not 1,029 actual game casts**. History capacity/discarding is also checked.
- The initial native regression run lacked one copied old `mixed-result.ini` fixture; restoring that local control made the suite pass without weakening code checks. The Lua runner needed a minimal math model because its standalone VM omits that standard library. Neither was a game observation.

## Windows candidate

`dist/CoE5Workbench-0.19.0-rc.2-win-x64.zip` — **60,390,784 bytes**.

SHA-256: **9a7c899109e4ad8f13310f5a8f906cd0cb9cac4cfffaea3e10d0501f9ab7f2c9**.

Fresh package inventory/privacy audit passed: **95 files**, 94 inventoried plus manifest, self-contained .NET 10.0.15 x64. All **34 packaged interface files** match final source. No game/official or derived extender, personal mods, saves, profiles, private sessions, imported catalog or machine-specific path is included. WebView2 Evergreen and the user's own supported game/extender are required. The corrected package was **not launched on the desktop**, in accordance with the user's request; no fresh corrected game was launched. This is a local candidate, not a new verified public download. Existing releases remain unchanged; no Nexus action occurred.

Use Start-Workbench.cmd or build/desktop-019-effects-candidate/CoE5Workbench.exe. The still-open first-build window does not update live. Preserve/export any user draft, close the old app when ready, open rc.2 and prepare a new browser. Do not patch or replay the old session.

## Manual acceptance and next step

1. Confirm **0.19.0-rc.2**, Test Effects, supported 3.4.4, Spearman #13 ×4. Prepare, then Start. Complete isolated profile setup if requested. Open the displayed Test Effects: WB_Effects_… main-menu entry.
2. Search **#445 Fireball**, select it, click the **top Cast** exactly once. Report the named game-log entry and actual projectile/impact, or that they were missed. The panel should step aside during animation and return afterward.
3. Inspect in the same right panel, page/copy values, and confirm Cast remains visible. Reset targets. Search **#401 Acid Spray** and request one cast; its original area 2010 is no longer disabled. Describe the real result or native limitation; do not infer success from the returned-call counter.
4. Optionally compare the supported sprite #7 and impact #3 separately with fresh targets. Keep damage/visual distinction. Close the field, native Quit, refresh the receipt and report requests, returned calls, stage/errors and your observations. Confirm the original source/pending edits remain intact.

First priority is observed corrected-field acceptance. Then verify the complete official 3.5.0 profile/text events and expand private modes 3–9 with source-checked parameters/native witnesses. The supplied viewer can inform that work after provenance, permissions and actual engine behavior are checked. No full VFX/terrain/summon/AI/save coverage or complete restoration is claimed.

Final setup-guide review removed an unpublished-release link before the last ZIP. The final extracted executable matches the native-tested build byte for byte; only documentation packaging changed. The final archive passed a new fresh inventory/privacy check. No final desktop/game acceptance was added.
