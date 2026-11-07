# Returned values and searchable choices · version 0.10

The current desktop return flow is documented in [version 0.12](POST-TEST-RETURN-012.md): latest matching result, direct selected Apply, per-field conflict choice and explicit optional-line additions. The older multi-step staging flow below is still available under optional details.

Historical v0.10 implementation record. Version 0.11 extends the same explicit workflow with [bounded visual values and an adaptive in-game dock](VFX-AND-DOCK-011.md). Old two-field results remain read-only imports; current launches require new canonical packages. New VFX result/placement behavior is not a historical gameplay pass.

This local version adds an explicit result exchange for the two existing experiment fields, searchable metadata, and a same-name suggestion for new spell/weapon pairs. It does not add arbitrary runtime editing, a renderer, a wave system or automatic source changes. No CoE5 process was launched or controlled during implementation.

## What the existing user test established

The reviewed retained v0.9 session used **CoE5 5.43 / CoE5SE 2.13.0**, a generated `.c5se` Waterball pair and an app-owned disposable profile. All 20 recorded staged runtime/mod hashes match; the extender log reports a matching game-code check. The local evidence report preserves the session ID, exact source revision and hashes without distributing the user's session files.

The actual game log contains two Waterball casts and four type-3 damage hits (3, then 1/4/1). The extender log records field opening with Spearman #13 and three targets, closure/reopening, then final closure. Exit code is zero and the game log contains normal shutdown. The user's screenshots/report describe baseline 4/0, applied revision 1 at 3/1 with a cast, then revision 2 at 3/5 with a cast. These visual settings are **user evidence**, not independent observations made during this implementation. No duplicate-cast defect is inferred.

There are no `wb_weapon_edit` parameter messages in these retained logs. Source inspection shows that `coe5.log` and redirected `print` depend on **Enable copious logs**. Earlier v0.9 instructions assumed those messages would always exist; that assumption was incorrect. These logs independently establish type-3 damage and field lifecycle, but not the exact area revisions, accepted readback, baseline restoration or general VFX/audio correctness. The new structured exchange avoids depending on that optional logging setting.

Read-only copies, hash analysis and the detailed review are retained under `validation/workbench-010-user-edit-review-20261106/`. Original sessions and earlier reports remain intact.

## Why a small INI exchange

The verified 2.13 API offers `readIni` and `writeIni` in a mod-specific data area. With no `dataFolder` call, the area is `<game user folder>/coe5se_data/<mod ID>`. The existing isolated launcher sets process-local `COE5_SAVE` to the owned disposable profile; the extender obtains its user directory from the game. File stems cannot contain paths. The API limits one file to 1 MiB and the mod's default total to 10 MiB, writes sorted sections/keys, accepts strings/numbers, and refuses values that cannot round-trip.

Compared alternatives:

| Method | Decision |
|---|---|
| Parse detailed logs | Rejected as the primary transport: optional logging, incomplete metadata and weak source/launch association. Logs remain supporting evidence. |
| Clipboard or arbitrary filesystem export | No verified dedicated structured clipboard route is needed; arbitrary desktop paths or Lua are outside the bridge. |
| Fixed-name per-mod INI plus explicit desktop read | Implemented using documented APIs and verified private paths. Small, scoped, user-initiated and reviewable. |
| Manual return | Implemented for old helpers, absent context/APIs and missing/corrupt results. Explicitly a user report. |

The experiment remains usable without saving/importing anything. This is not a persistent desktop connection, synchronization service or hot reload.

## Binding and lifecycle

For each explicit non-bootstrap experiment launch, the desktop writes `workbench-session.ini` inside the **owned disposable profile's** mod data area. It contains a schema, session ID, source revision, mod ID and fresh launch nonce. Bootstrap/profile setup does not export a test binding. The canonical source revision is SHA-256 of `mode + NUL + retained source text`.

In the field, **Save test values** calls the mod-scoped `writeIni` with a fixed stem derived from that nonce. `wb-result-<nonce>.ini` holds the spell/weapon/format identity and up to **32 most recent read-back snapshots**. Each snapshot has an index, panel-open number, parameter revision, damage type, area code, baseline/applied kind and count of completed `fireTestField` calls. Indexes distinguish repetitions, including reopening the field. After 32 snapshots the oldest is dropped. Pending controls are never exported as accepted values.

Save is a snapshot of that moment: save again after a later cast/apply if you want those actions included. A failed cast call is not counted as completed. A completed call does not establish damage, visible effects, hits or a human observation. No visual-observation claim is created by Lua. Closing the field does not silently save or modify the desktop; the existing close/restoration attempts still report failures.

The host reads results only for a retained **exited** weapon-editing session. It rechecks the candidate's exact reviewed Lua template, canonical declarations/source revision, staged files and pinned runtime fingerprints. Names, schema, source, session, launch, limits and ordering must agree. Unknown result fields/sections, duplicate keys, controls, linked/reparse paths and arbitrary bridge paths/Lua are refused. The exchange is local evidence, not a signed anti-tamper attestation.

New starts use a new nonce; old result/catalog files remain retained but cannot become the current launch's result. Source edits may mark a retained session stale; its old values remain proposals tied visibly to that preparation. They are never relabeled as tested against a newer draft. Old v0.9 helpers are embedded solely for read-only verification of retained source association; the launch validator requires v0.10 packages.

## Return without losing work

1. In the game use **Save test values**, **Close test**, then **Quit**. In the desktop refresh session status and close the preparation dialog.
2. Open **Return test values…**, select the source session and **Load values**. Choose a saved snapshot. If unavailable, select **Manual user report** and enter values you actually recorded.
3. Mark **I observed a cast using this exact configuration** only for your own observation. Readback, completed calls and your claim appear separately.
4. Keep your current draft, or explicitly **Open tested source copy**. That action respects unsaved-change protection and opens a retained snapshot, never a writable original mod.
5. **Review proposed changes** shows prepared, current, pending and proposed `dmgtype`/`aoe` values. The spell and unique associated new weapon must still match. Changed/relinked/ambiguous definitions block safe assignment; unknown surrounding text is retained.
6. Conflicting newer values are **unchecked by default**. Select a conflicting field and acknowledge replacement only if desired. Unrelated pending fields on the same weapon remain intact. Pending edits in another definition block staging until you resolve them yourself.
7. **Stage selected fields** updates only form inputs. **Apply changes** patches the draft using existing value spans. **Export copy** is separate and refuses existing destinations. No original is overwritten, and no automatic gameplay verdict is created.

Changing the draft, selected record or pending form after review invalidates that review. Manual entry has close/session-change protection. Unsupported or missing fields are not inserted heuristically. The session-only experiment also remains useful when the user keeps no returned values.

## Search coverage and identity

Use **Browse choices** for reference browsing, or a field's Search action for selection. Partial names, explicit IDs, category/source filters, paging, empty states, Up/Down/Enter and visible focus are supported. Duplicate names keep distinct IDs; name-only data never acquires an ID from its row number. Fields retain direct entry. The existing source record search and library weapon assignment remain available; browsing a reference spell does not synthesize its definition.

| Data | Offline coverage and limits | Loaded runtime route |
|---|---|---|
| Units / commanders | All 1,851 supplied records, IDs 0–1850, 1,589 unique names in the exact **5.33 author export**. Historical variant IDs are retained. Optional name indexes remain name-only. | `monsterLastIndex` + `get("monsterName", id)`. Inspect the exposed range, refusing a bound outside 0–6998 for this pinned build. Includes named entries in the loaded profile, including mods where present. No commander-category/stat/origin field is invented. |
| Weapons | Locally all 935 supplied historical ID records; selected cache/name index and current draft entries also searchable. | Named slots 0–6998; optional look/flymode/flylook/sound/flysound numeric metadata if readable. |
| Spells | Locally all 1,029 supplied historical ID records and current draft names. | `spellInfo` through 4095 (the pinned source asserts 12-bit spell IDs). Includes named mod-added records but exposes no reliable provider attribution. |
| Paths | All 68 labels in the official editor table. The creator accepts its existing 1–69 numeric subset; no label for an absent row is invented. | Only numeric paths referenced by loaded spells; no public complete path-name enumerator was found. Custom path names/IDs are not guessed. |
| Damage types | All 25 editor-table labels; creator still accepts 3/4 only. This does not widen the in-game editing experiment. | No separate complete runtime type/name enumeration used. |
| Impact/flight effects | All 159 supplied label/range rows, expanded to 165 explicit IDs. Partial game catalog. | `lookName(0..299)` in the 300-row table, including unnamed rows. Identifier metadata only. |
| Flight sprites / modes | All 16 sprite range/label rows expanded to 29 IDs; all 9 documented modes. | Numeric sprite IDs referenced by loaded weapons in flymode 1. No complete sprite-name enumerator found. |
| Sound | 30 labeled table IDs plus launch-only `flysound -1`. Partial. | Numeric sound/flysound IDs referenced by loaded weapons; no sound-name enumeration or playback. |

The table metadata is shipped with the tool under the upstream MIT license. It is the pinned **official editor tools 0.1.8 snapshot**, not a current-game certificate. Local 5.33 value/monster exports and their caches stay private and are excluded from the application ZIP. Import `Monster Data v5.33.c5m` through **Import historical monster data…**; exact raw SHA-256 is required:

`a0752def8cf175b73b282ff4b02521607b39dd54b65728aecc775e6eec1adc0f`

No pseudo command from those author exports is installed or executed. A reference-cache error leaves documented choices available and reports missing/unavailable data. The reference detail library remains historical even after runtime choices are loaded.

### Current snapshot export

In a newly prepared **weapon-editing experiment**, main-menu **WB choices: <test ID>** explicitly scans loaded metadata and writes four scoped INI parts plus a commit header. Each part carries the same session/source/run and export number. A failed part write cannot be combined with an older part; mismatched/incomplete commits are refused. A readable but interrupted enumeration is marked partial. "Complete" means this bounded API range was inspected, not all game concepts or future builds were covered.

Quit and refresh status, close preparation, then **Browse choices → Data coverage & runtime catalog → Refresh sessions → Load runtime choices**. These controls only read files; they never start or control CoE5. Loaded entries are labeled with the exact source session and pinned runtime version. A different profile/load order requires exporting again. The UI keeps historical/documented/runtime/draft/unknown identities separate. Source drafts have no assigned runtime IDs. The API does not identify a reliable vanilla/mod provider for every row, so the tool does not guess one based on ID ranges or names.

This exporter sees only the disposable profile's CoE5SE and canonical test mod. It does not inspect the user's normal enabled-mod roster. The current safe fixture cannot declare custom units or load arbitrary other mods; their unit catalogs remain unavailable through this workflow. Broader mod-catalog support needs a separately verified user-operated export/import contract, rather than weakening the launch validator. Generated custom spell/weapon names are discoverable in that profile's runtime tables; their API provider attribution still remains unknown.

Selecting a participant preserves its supplied ID and name. The generated helper requires that ID's loaded name to match, or a name-only lookup to have exactly one match. This prevents silently choosing the first duplicate. A matching historical name/ID still cannot establish unchanged stats or variant identity between 5.33 and 5.43. Use a current snapshot when that distinction matters. Change a participant name manually and its old ID/provenance is cleared; explicit ID entry remains possible.

## Enemy groups and waves

The public 2.13 `openTestField(monster, spell, enemy, count, standIn?)` accepts **one enemy type** and a count capped at 200. The field makes the caster a commander and injects a forced item-style spell attack. No verified group-list or scheduled-wave argument/API was found. **Reset targets** closes/reopens this same homogeneous field; it is not mixed enemies or waves.

The next step for mixed enemies is an upstream explicit, bounded group API with ownership, placement and cleanup semantics; sequential waves also need a lifecycle/transition contract. Verify that upstream contract before designing a Workbench control or claims of combat realism. A plane editor remains separate future work.

## Sources checked

- [Pinned CoE5SE 2.13 Lua API](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/coe5.lua): monster properties around 589–591; optional logging around 1083–1089; `spellInfo`, `lookName`, test-field contract; `dataFolder`/`readIni`/`writeIni` around 3850–3875.
- [Per-mod data files](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_data_files.h): user-folder paths, stem rules, 1 MiB/10 MiB quotas and serialization/refusals. [Plugin user-directory setup](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/coe5se_plugin.c) and the retained isolated launch environment establish why these writes stay in the disposable profile.
- [Test-field implementation](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_test_battle.h), [table allocation](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/table_move.h) and related data-read source: supported bounds and absence of a mixed-enemy/wave contract. Existing exact version fingerprints remain in `desktop/GameRuntime.cs` / `GameRuntimeHashes.cs` and prior validation reports.
- [Official editor tables](https://github.com/musical-pianist/coe5se-modding-tools/blob/85643c49810b502767b37aa663fe34885ad90cdd/vscode-extension/data/tables.json), [input provenance](https://github.com/musical-pianist/coe5se-modding-tools/blob/85643c49810b502767b37aa663fe34885ad90cdd/vscode-extension/data/built_from.json) and [name-only index](https://github.com/musical-pianist/coe5se-modding-tools/blob/85643c49810b502767b37aa663fe34885ad90cdd/vscode-extension/data/names.json). The monster export's SHA matches the upstream recorded input exactly. Neither names-array order nor old IDs prove current membership.
- [Official native modding manual](https://www.illwinter.com/coe5/coe5modding.html) and existing creation/source-preservation research remain the native syntax baseline. Lua exporters are extender features, not new `.c5m` commands. No native-command proposal is represented as implemented here.

## Later user-operated acceptance test

Only the user should operate this next game test; none was performed during this implementation.

1. Start `Start-Workbench.cmd`, create a uniquely named **CoE5SE** spell/weapon pair, and confirm the automatic weapon-name suggestion/manual override/reset. Use documented simple piercing/fire settings. Apply any draft edits.
2. **Prepare test…**, search/select ordinary land units, choose a small count and a new test ID, enable the experiment, review files and prepare/start a **new disposable 5.43 / 2.13.0** session. Follow profile setup if offered. Keep existing/normal sessions and saves untouched.
3. From **WB test: <test ID>**, choose Type/Area and **Apply**. Record the displayed readback. Click **Cast once** once and record what you actually see. Use **Save test values**, then **Close test**. Report a close/restoration error if shown; don't infer cleanup solely from exit.
4. Optional: from the main menu choose **WB choices: <test ID>** once. Record success/refusal. **Quit** the isolated session yourself.
5. Refresh status in the Workbench, close preparation, and **Return test values… → Load values**. Verify source/session, read-back snapshot and completed-call count. Confirm no change occurs before Review/Stage; mark your own observation accurately. Stage selected fields, inspect retained unrelated inputs, **Apply changes**, then export a separate copy.
6. If you exported choices, load that session in Browse choices and search a participant and the unique custom spell/weapon. Check runtime labels, IDs, counts and any partial/unavailable messages. These are metadata checks, not an effect preview.
7. Report the test ID, readback values, observed cast result, Save/catalog messages, returned snapshot, any conflict behavior and cleanup outcome. Keep screenshots and logs from the disposable session. Do not reuse campaigns or test ordinary combat in this acceptance step.

An accepted file, completed API call or clean exit is never a gameplay verdict. Even a successful field cast does not validate normal combat, learning, AI, true range, timing, saves or all VFX/audio situations. Current checks and remaining UI/game limitations are recorded in [Verification](VERIFICATION.md).
