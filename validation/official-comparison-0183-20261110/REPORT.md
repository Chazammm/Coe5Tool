# Official mixed visual comparison — 0.18.0-rc.3

**Implemented compatibility preview; fresh gameplay acceptance is pending.** This version adds visual iteration and protected return for supported native ranged weapons against mixed native targets using the user's unmodified official CoE5SE **3.2.2 / CoE5 5.43**. No game was launched for this implementation/package check. The earlier rc.2 fixed mixed battle is separate evidence and does not establish this new lifecycle.

## Implementation and evidence basis

The pinned official release source, commit [20431a2](https://github.com/musical-pianist/coe5se/tree/20431a298d3b9cd0def6b82fee2b3fbaead9f08b), was inspected for group allocation/identity order, field closure, position readers, owned weapon setters, Lua libraries and table capacities. Official close restores selected borrowed field state and marks square units inactive; it does not restore all allocation counters/records. API-10 roster rollback receipts cannot be reused as an API-11 guarantee.

The new helper allows **2–8 distinct native defender types, up to 200 defenders per field**, and at most **eight field attempts per launch**. Each attempt checks remaining unit/commander capacity and recreates the same requested roster and private carrier. Only the private weapon's flight mode, flight effect and impact are changed, with identity and readback checks; damage, attack payload, area and targets stay fixed. Failed/partial setup or uncertain closure aborts further fields. Error cleanup requests fight stop when needed and attempts field close; it never retries a partial setup. Private visual restoration is separately recorded and skipped if field closure is uncertain.

The strict new journal and return schema 5 bind each attempt to session, launch, source revision, configuration and roster. Cancelled, stopped, failed and incomplete attempts remain in history but cannot return tested values. Individually closed, returned, read-back battles remain separately selectable, including with a warning after a later failure. Per-battle unit identities can be reused by the native allocator and are never treated as persistent cross-battle characters. [Scope and contracts](../../docs/OFFICIAL-COMPARISON-0183.md).

The existing conflict/explicit Add protections return only selected visual values to the full original draft; separate-copy export preserves unrelated definitions and text. Old fixed official, single-type 3.2.2, 2.13.0, selected-source and older-result contracts remain separate. Melee remains fixed. No extender core files were changed or distributed. The [older derived-extension permission question](../../docs/LEGACY-ROSTER-PERMISSIONS.md) remains unresolved; history/releases were preserved.

## Offline verification

- **322 script checks passed**, covering generation/validation, version/route separation, strict result association, duplicate/foreign identities, cancellation/interruption, old schemas, explicit missing-field Add, pending edits, conflicts and full-source return/export.
- **107 compiled Windows checks passed**, including both supported runtime profiles, unsupported-version refusal, canonical helpers, isolated preparation/resume/launch safeguards using a fake process, source protection and the actual generated-Lua model receipt through the native reader. These are not gameplay checks.
- **34 generated-Lua / simulated API cases passed** in the existing minimal Lua VM: two configurations, searchable choices, per-attempt identities, capacity/attempt limits, stop/cancel/error/partial allocation, stale/shared record refusal, uncertain closure, save failures and private setters. The model supplies the math library functions omitted by the tiny test SDK; the actual official runtime opens math. The test SDK's 4-KiB error transport initially truncated its exported fixture; the harness now exports two independently checked chunks. No production result is split and that fixture issue was not presented as a game defect.

Raw local evidence: `script-checks.txt`, `offline/native-final2.json`, `offline/lua-model.json`, `build-checks.txt`. The VM, official runtime, private input fixtures and raw session data are excluded from GitHub and the package.

## Actual Windows application

The source-built rc.3 app opened the new portable two-weapon example through the native Open dialog. Selecting **Official Comparison Needle** at line 10 enabled the selected ranged-weapon test. The actual chooser found **Deer #609** by partial name and **Winter Wolf #487** by name from the verified installed 5.43 catalog. Counts **2 / 1**, payload **12** and **Compare visuals in game** were set through the rendered interface. The setup correctly described official groups, fresh targets, eight attempts, fixed damage/area and pending gameplay acceptance. Normal **Prepare game test** created a new disposable preparation; Start stayed explicit and was not clicked. The draft reported no source changes. The app was closed normally.

Window: **1107 × 794 logical pixels**, current Windows scaling. Local screenshots `01-open-example.png`, `02-comparison-setup.png`, `03-prepared-ready.png`. The new in-game menu, repeated native field lifecycle and actual new journal/results rendering remain unobserved in game; model/native result checks do not replace that acceptance. Earlier real fixed mixed data retains its own interpretation.

## Manual acceptance and limits

A fresh unused official 3.2.2 preparation exists locally for the native ranged example: Deer #609 ×2 and Winter Wolf #487 ×1; piercing #3, carrier payload 12, base damage 0, range 5, area code 5. Compare sprite mode 1 / Ballista bolt #7 / Flame #68 with particle mode 2 / Fireball (fly) #65 / Blood burst #34. Private exact session/menu paths and short instructions are in local `MANUAL-TESTS.md`; no private preparation is distributed.

Still pending: real two-battle comparison, actual effect appearance, named weapon use, native cancel/stop/partial failure handling, closure/normal exit and new-result desktop review/return/export. AI may not use the weapon. A visible burst or HP change does not establish a hit, damage attribution, an attack-time position or area hits on both types. No complete record rollback, arbitrary summons, special payload, every visual combination, ordinary campaign, save or Vanilla-only testing claim is made.

## Package and publication

The exact final **CoE5Workbench-0.18.0-rc.3-win-x64.zip** passed inventory/privacy scanning and a real Windows desktop check after fresh extraction. SHA-256:

`46d37285f9aa3a80965191f83808a4a3cdf144154ef43acdf82ffe358290a777`

The ZIP is **921,397 bytes**, with **88 files** (87 hashed inputs plus the inventory), 2,821,332 extracted bytes. The executable/DLL allowlist, every input hash, source/doc/example presence, game/extender fingerprints, machine paths and credential patterns were checked. No game/core runtime binary/source, private roster component, personal mod, proprietary catalog/assets, save, profile, private session or local runtime path was included.

The freshly extracted application launched, opened its included mixed-comparison example through the native dialog and selected the ranged definition. **Prepared tests… → Check before resuming** found the new unused official mixed comparison and returned **Ready**, retaining gameplay-pending and no-full-rollback wording. Start was not clicked. Selecting the consumed rc.2 fixed session refused replay and rendered its actual three-unit saved readings, including Deer 6→6 / 6→6 and Winter Wolf 13→2, unknown hits, unavailable after-return positions and record-rollback limits. One scroll exposed all rows. The application then closed normally. Local screenshots `04-final-package-example.png` through `07-final-package-old-results.png` document this at 1107 ×794 logical pixels. This is not a new gameplay result or a rendered schema-5 game-result acceptance.

All 87 inventoried package inputs and the final ZIP remained unchanged after desktop use. The 1,268 pre-existing test-store files were compared: only the expected last-selected-session pointer changed when preparing the new session. Every retained session file remained unchanged. All **19** newly staged inputs matched their recorded hashes. The configured game and frozen rc.2 ZIP remained unchanged. The editor showed no source or field edits; both original and extracted native examples remain unchanged. No normal profile, save, installed mod or Steam installation was operated. The user's unrelated normal game was quit by the user before this Workbench-only check.

Requires Windows x64, .NET 8 Desktop Runtime x64 and WebView2; integrated fields additionally require the user's own supported game and complete official extender files. This was checked on the existing Windows environment, not a clean machine without prerequisites. The new comparison is a prerelease feature with gameplay pending. A new prerelease, rather than a stable compatibility claim, is appropriate. Older release archives are not replaced.
