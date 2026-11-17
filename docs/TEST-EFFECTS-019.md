# Test Effects — 0.19.0-rc.2

**New, awaiting in-game acceptance.** Open **Test Effects** in the Windows Workbench. No spell draft is needed. This uses your own pinned Windows CoE5 5.43 and **official CoE5SE 3.4.4 / API 14** in a separate windowed profile. Editing and native export remain separate, offline features. Other existing test routes keep their earlier runtime support.

Official **3.5.0** became stable on 2026-11-17. Its documented field, text-input and inspection additions were checked during this investigation, but its complete binary profile/game behavior has not been verified by Workbench. It is **not** silently accepted. Use a separately extracted 3.4.4 release for this browser; leave Steam and earlier preparations unchanged.

## Browse and preview

1. Choose game/extender files if needed. Search for a native target and choose 1–20 copies. Spearman #13 ×4 is the easy default; the forced caster is Spearman #13.
2. **Prepare effects browser**, then **Start isolated game**. The usual runtime, ownership, active-process and stale/used-session checks apply. If first-time profile setup is requested, enable only CoE5SE and the named WB test mod, quit normally, then recheck it under **Prepared tests…**.
3. At the main menu open **Test Effects: WB_Effects_…**. The initial field selects Fireball spell #445 but **does not cast automatically**.
4. Use **Spells**, **Weapons**, **Impacts**, **Flights**, **Sprites** or **All VFX**. All valid native spell entries offer a Cast request. Other categories default to **Castable** candidates; toggle **All entries** for inspect-only records. **Search** opens the official name box: enter part of a name or ID. Names sort alphabetically; equal names retain distinct IDs. Select a row, then **Cast**. Changing selection alone does not cast. The panel steps aside during the native cast animation and returns afterward.
5. **Reset targets** closes/reopens a fresh field. **Inspect / copy** uses the same right-hand battlefield panel, with readable labels, Previous/Next and **Copy values**. Cast, Reset and Close stay at the top; **Back to list** returns to browsing. **Hide** exposes more of the battlefield; **Show effects** returns the panel.
6. **Close** returns to the main menu. Click native **Quit** normally, then **Refresh browser receipt** in Workbench. Only returned calls and settings are recorded; inspect the actual game log and report what you saw separately.

No campaign, normal profile, installed mod or editor draft is loaded into this fixture. Each preparation is disposable; a used session is not replayed. One game launch may contain repeated casts/resets or a normal return to the browser menu. History retains 64 entries, reports discarded older entries, and keeps a cumulative returned-call count for that launch.

## Coverage and provenance

| Category | Available information | Preview boundary |
| --- | --- | --- |
| Native spells | Up to 1,029 pinned native slots; loaded spellInfo name, ID, path, level, weapon and payload; known numeric weapon fields | A deliberate item-style request for **every valid native spell ID**. Original masks, negative/large payloads, targeting codes, flags, chains and flight modes are passed through by the engine, not reconstructed or reinterpreted. Conditions can still prevent an actual effect. |
| Native weapons | Up to 1,200 slots; 936 names in the checked pristine executable; selected loaded numeric fields | A **visual-only private preview** when mode-1/2 flight and impact candidates are available. This does not reproduce damage, carrier payload, flags, chains or the original attack. Use Vanilla Library for existing original AI observation. |
| Sprite flights | 30 existing 5.43 candidates: documented labels plus native same-field witnesses; one unnamed witnessed sprite | Mode 1 only. Eleven entries have native witnesses; the rest retain reference-label provenance. No appearance guarantee. |
| Particle flights | 55 existing 5.43 candidates | Mode 2 only. Twenty-four have native mode-2 witnesses; others use the game's `(fly)` name suffix as a role hint. Loaded look-name identity is rechecked. |
| Impacts | 126 existing 5.43 candidates | 101 have native same-field witnesses; the remaining names are role candidates from the existing pinned naming policy. Loaded look-name identity is rechecked. |
| All VFX | All 300 pinned effect-table slots; 240 named in the pristine executable | Metadata index, **inspect only**. Unnamed/unavailable slots do not acquire invented names or roles. Use the separate supported role category to preview a candidate. |

These are candidates and table slots, **not a complete enumeration of every animation or parameter variant**. Sprite IDs use a different namespace from particle/impact IDs. A duplicate effect name is not merged with another ID. Related-name spell variants sort together; no visual-family relationship is inferred from a similar spelling. The loaded isolated catalog excludes the user's other mods; it does not promise mod-added records, arbitrary game versions or localization support.

The browser uses the existing independently collected 5.43 role metadata. A name or native witness establishes identity/use, not that every combination will render. Modes 3–9 may appear on inspected originals, but are not added as adjustable private-flight modes. Fields such as beam width, intensity, variants controlled by other flags, special payloads, terrain, friendly/self targeting, sounds and chained effects need further work. A visible burst does not establish area damage.

## What Cast and Inspect mean

For any valid native spell entry, Cast requests its **original spell ID and linked weapon**, without a partial clone, standIn substitution or script setter to a shared record. The official API casts it as an item; it may temporarily extend weapon range. This does not prove normal caster eligibility, AI choice, ordinary timing/range or campaign/save behavior. A request is not a guarantee: self/friendly targets, morale, corpses, terrain, water, summoning or global-state prerequisites can make a particular original do nothing or behave differently on this fixed field. The original payload is not converted to a scalar. Reset replaces field units, not all game globals; use a fresh disposable process when broader state matters. Fear is not ordinary HP damage; poison, resistances and conditions can change or delay the result. Reset when targets die or their status matters.

For visual exploration, only the browser's uniquely named **private weapon** is changed. Its damage remains piercing #3, payload 1 and area 0 regardless of selected visuals. The field closes before a write; identity/fixed fields are checked before every setter, and selected visual values must read back before a cast. A refused/partial write or identity/close failure stops further use and requires a fresh disposable session. Shared built-in setters are never used.

Inspect distinguishes record fields from a spell/carrier's attack payload. The copied text includes a **native visual fragment**, with comments about missing context. An absent/invalid flight pair is not emitted as invented syntax. It is neither a complete spell/weapon export nor a lossless clone. Full source masks/flags and dependencies are not inferred from a visual fragment. A selected configuration can be inspected before it is applied; an inspection does not establish a cast. Paste intentionally into your own draft, review/apply there and export a separate copy using the existing editor safeguards. There is no automatic browser-to-draft replacement.

The bound `wb-effects-<run>.ini` records entry kind/ID, relevant values, requests and returned calls separately. Older receipts without a request counter keep that value unknown. Workbench verifies candidate/helper/runtime/session/run identity before displaying it. It refuses forged “hit confirmed” or “visual observed” claims. A call returning does not establish a named cast, hit, HP damage or appearance. No debug-log parser is promoted to a stable API. Closure means the close call returned and known fields were checked; complete record rollback is not independently established.

Requesting an unchanged native Banish or other special effect does **not** certify a manually configured custom payload. The creator and selected-mod test routes retain their own validation and fixture limits. No arbitrary user mod or Lua is loaded into this browser.

## UI and verification limits

The right panel uses the official bottom-up UI coordinates and the entire bottom 140 UI units left clear; primary actions remain at the top. Geometry/hitboxes are checked at 700×480, 914×600, 1100×800 and 1600×900 **UI units**. Smaller views refuse opening. The panel can cover battlefield cells because the official 3.4.4 field has no panel-aware viewport contract; Hide reduces it. This is not evidence of rendered in-game log clearance, DPI behavior or effect appearance. Those remain manual acceptance items.

The separate Sandbox project was inspected read-only. Its right-side panel informed the arrangement, but its newer editor depends on additional APIs. No Sandbox or supplied WeaponTester code was copied; the latter's missing reuse permission remains respected. No experimental/official core or game data is included here.

## Short manual acceptance

1. In the new source-built Workbench, open Test Effects, keep **Spearman #13 ×4**, prepare, and start. Complete any requested isolated profile setup first. Open the displayed **Test Effects** main-menu entry.
2. Search `#445`, select **Fireball**, and press **Cast once** by clicking **Cast** one time. Report the named game-log entry and the actual projectile/impact you see, or explicitly say they were missed. The receipt alone is not enough.
3. Press **Reset targets**; confirm fresh targets. Under **Sprites**, search `7`, choose **Ballista bolt #7**, and Cast. Under **Impacts**, choose **White Flare #3**, then Cast; the flight should remain separate. Read the actual labels offered; stop on a mismatch rather than substitute.
4. Inspect the selection in the right panel, use **Copy values**, and paste into a disposable text/source copy. Cast remains at the top while inspecting. Check IDs, flight/impact values and incomplete-definition notes. Also inspect **All VFX → #299** without claiming it was rendered; the exact slot may be named or unnamed, so record what it actually says.
5. Check that right-panel controls and their click areas agree, the lower-left event log remains readable, and Hide/Show work. Close the field, click native Quit, refresh the browser receipt and report its stage/call count plus any errors. Confirm your original draft/pending edits remain unchanged.

Do not repeat a cast just for footage. An unobserved projectile, refused cast or missing named log entry stays unverified. A failure may need a fresh preparation, not reuse of the completed one.

## Next practical step

First complete the bounded manual acceptance above. Then verify the complete official 3.5.0 runtime profile and field text-event contract for inline search. Toward broader VFX coverage, classify modes 3–9 and their additional parameters using actual native witnesses and separate observed cases; avoid enabling every unnamed slot or reconstructing special spells from a few fields.

Primary contracts: [3.4.4 test-field implementation](https://github.com/musical-pianist/coe5se/blob/df09497f04a39ff8fb7b0979dedde7dfed120c64/src/lua_test_battle.h), [3.4.4 API](https://github.com/musical-pianist/coe5se/blob/df09497f04a39ff8fb7b0979dedde7dfed120c64/coe5.lua), [new official 3.5.0 release](https://github.com/musical-pianist/coe5se/releases/tag/CoE5SE-v3.5.0), [current runtime identity](COE5SE-COMPATIBILITY-0182.md). No new game success is claimed.

## First user attempt and rc.2 correction

The user reached a real 3.4.4 field and inspected Acid Spray #401 and particle flight #164, but reported no visible Cast action. The bound receipt contains **zero returned cast calls**; no successful cast or effect is claimed. The supplied screenshot shows the earlier full-screen native parchment inspector. The first helper restricted Acid Spray’s targeting code 2010; that artificial restriction is removed in rc.2 for original records. The full native definition is requested instead of reconstructing its area or payload.

In rc.2, Cast keeps its name and moves to the top beside Reset/Close. All controls stay above the lower 140 UI units. Eligibility is a separate message. Inspect is now an inline right-panel view rather than a native parchment screen, with separate Copy values and Back to list actions. Spells exposes all valid native spell IDs. Other categories keep a Castable / All entries filter. The exact old rc.1 helper is retained for read-only receipt review; a new preparation is required for the changed helper. These changes are tested offline, not yet observed in the game.

## Supplied musical_pianist prototype

The user supplied `spell-animations 2.zip` (SHA-256 `6f4e34a8ae607a13fad1281dc3c5c3f883cbd7063fb766f810694b3a6c391e87`) and attributed it to musical_pianist. It contains an HTML/WebGL animation viewer, builder/tests, a visual-table TSV and generated image/video assets. It is not a Lua game-field helper and does not establish that a native cast occurred. Its visual/flight/area references are useful for future variant support, but the build uses its own game/address inputs and the supplied archive has no explicit license file or pinned executable hash. No supplied code, generated HTML, media, TSV or game assets were copied into Workbench or published. Asset provenance/reuse terms and engine fidelity remain separate checks. The current implementation uses the official field API and its existing independently collected local metadata.
