# Mixed native target implementation and validation

**Implemented and observed with a locally built CoE5SE extension.** The Workbench prepared two Deer #609 and one Winter Wolf #487. All three were returned as actual instance IDs, individually verified, and read back after a native AI battle. The final pinned plugin also closed the field and restored its snapshotted state after a deliberate Lua callback error and after combat. Final setup (local evidence) · [Callback cancellation](18-pinned-cancellation.jpg) · [Mixed field](19-pinned-battle.jpg) · Final native log (local evidence).

## Actual gameplay observations

Three new disposable sessions were used while strengthening cleanup and the interface. Each ran one explicit cleanup check and one AI battle with the same source and roster. Earlier evidence remains in place. The final pinned DLL was built and tested; its fingerprint matches the shipped desktop overlay.

| Session | Development plugin SHA-256 prefix | Owned PID / outcome |
| --- | --- | --- |
| ea66183c0d7e4263834f6f2f4eb29416 | 11c9528a26cd | 30876, exited with code 0 through the game window |
| 019853f6ff1545d3af795f703eed03ee | 5f7a6f71176f | 36632, exited with code 0 through the game window |
| 306f098463ed41dd9a317a1215ff9721 | 46c982fcef57 | 29452, field closure logged; subsequently closed by verified PID after window capture became unavailable. Workbench reported exited / code 0. |

The third process was closed without taking desktop focus. Its unavailable window prevented verification of the usual menu Finish/exit interaction. Field closure and restoration had already been logged. The earlier two runs observed Finish returning to the main menu and window exit. First closure (local evidence) · Final session ledger (local evidence) · All fingerprints (local evidence).

The roster and readings were the same in each run.

| Allocated instance | Native record | Before / after HP | Pre-battle cold resistance | Named Glacier hit |
| --- | --- | --- | --- | --- |
| #2 | Deer #609 | 6 → 6 | 0% | None recorded |
| #3 | Deer #609 | 6 → 6 | 0% | None recorded |
| #4 | Winter Wolf #487 | 13 → 13 | 100% | One hit, 0 damage |

The weapon was **Glacier Area Trial**, private weapon #1200, on private WB Ranged Carrier #2000. Its first regular ranged row had payload 8. The source retained cold type #5, base damage 0, area code 5, range 5, sprite flight mode 1 / Ballista bolt #7 and Flame impact #68.

The final native log identifies the Wolf at (17,10) when hit. Four selected area locations were empty. It records no Glacier hit on either Deer. This establishes mixed spawning and named weapon use. The mixed area result is **inconclusive for damage to multiple target types**. A visible burst, an area readback and unchanged HP are not treated as splash-damage proof. Final combat log (local evidence) · Final receipt (local evidence) · Earlier desktop unit readings (local evidence) · Second-run readings (local evidence).

Snapshots show one blue Wolf and two Deer on the field. No continuous VFX clip was recorded for this task. The logs supply victim IDs and impact coordinates. Initial type-specific setup coordinates and later attack positions have their own log entries; this implementation supplies no general per-instance battlefield-coordinate API.

## Implemented workflow

**Choose target…** retains the existing searchable native catalog and single-type count. **Add another type…** turns the setup into compact rows with per-type counts, searchable Change actions and removal. The Workbench requires 2–8 distinct native IDs and a total of at most 200 defenders. Duplicate names keep their explicit IDs. Returning to one row restores the released-extender workflow. The native weapon source, row payload and visual fields remain independent of the roster. Initial selection (local evidence) · Final dependency and roster display (local evidence).

Mixed tests use a fixed AI observation helper. They support the existing bounded fixed melee/projectile and area 0–5 subset. Live mixed visual editing and automatic mixed-value return are unavailable. The single-type visual comparison remains available with its existing review/conflict protections. The mixed observation reader shows each returned unit, monster ID/name, before/after HP, elemental reading and cleanup result. It binds the result to its session and hides old readings when another session becomes current. HP changes alone do not identify an attacker. Rendered desktop result (local evidence) · [Workflow/API guide](../../docs/MIXED-TARGETS-016.md).

The separately exported native weapon matched all 258 source bytes. Test participants and the local dependency were kept in the isolated package. All 19 prepared file hashes matched after each run, including the appropriate pinned development DLL. The official release plugin and field header remained unchanged. A read-only audit recorded 272 original source-file hashes. Export (local evidence) · Export confirmation (local evidence) · Integrity (local evidence) · Release source audit (local evidence).

## Local extender build and API

The release extraction contained the complete buildable source, including Lua, fanpatch units, Windows resources and the build recipe. It was copied into `local-extender/roster-v1/CoE5SE`. llvm-mingw 20260922 was downloaded from its official release, verified against the CoE5SE-documented archive SHA-256, and extracted into the local project toolchain folder. The plugin was built using the release compilation recipe. The official loader and stub remain separate and unchanged. [Build instructions](../../local-extender/roster-v1/README.md) · Compiler and binary manifest (local evidence) · [Reviewable source patch](../../local-extender/roster-v1/field-roster.patch).

The Windows-only API is `withTestFieldRoster(carrier, groups, callback)`. It validates all groups before mutation, allocates through the field's own native primitives and passes the actual `{unit, monster}` list to a protected Lua callback. Allocation must satisfy the complete roster. On failure, callback error or completion, the native owner closes the field and restores its snapshots. Nested openings are refused while that owner is active. The numeric released `openTestField` contract remains available. [Native implementation](../../local-extender/roster-v1/CoE5SE/src/wb_roster.h).

Snapshots cover the unit and commander records/counts, field square, army/team state, map dimensions, active player and relevant battle location/control globals. Native memory-model verification exposed battle-location globals absent from the first snapshot implementation; those are included in the pinned build. The restoration flag checks these known records and globals. It is not a whole-engine/campaign snapshot. No generic map spawner is used.

The source contains a `RVA_BATTLE_UNIT_POSITION` function address, but no verified read-only getter contract was found. It was not called with a guessed signature. The desktop marks battlefield coordinates unavailable. Setup and impact-time positions remain distinct log evidence. The new API returns live unit identities only inside the callback; saved IDs are historical evidence after rollback.

Workbench stages the local DLL only for mixed sessions, verifies its exact SHA-256 independently of editable session metadata, and preserves all base game/release-file checks. The final local hash is `46c982fcef57c60fa68a6fcbcc624b6ce2e78d36526991508c8d4d5ff4826ec7`. Single-type sessions retain the original official plugin. The normal desktop launcher targets the rebuilt `build/desktop-016-workspace/CoE5Workbench.exe`.

## Verification and remaining limits

- **244 JavaScript tests passed.** Added coverage exercises roster validation, partial-name/ID selection, counts, removal back to single type, preparation invalidation, source/payload preservation, mixed comparison refusal and hiding stale result panels. Suite output (local evidence).
- **33 compiled host checks passed.** The real mixed receipt replays with both types and the Wolf's 100% reading. Changed IDs, duplicate instances and inconsistent totals are refused. Official and local plugin fingerprints remain distinct. Existing area, single-target, legacy comparison and source-preservation fixtures also replay. Compiled checks (local evidence) · Mixed packet (local evidence).
- **Nine native field-model checks passed.** They compile the actual modified field headers and bundled Lua. Cases cover success, callback error, partial defender allocation, carrier allocation failure, invalid count, 200 defenders, nested calls, explicit close/refused reopen, and failure followed by retry. Each compares the complete modeled memory before and after. The test uses deterministic allocator failures. Model output (local evidence) · [C harness](../../local-extender/roster-v1/tests/roster-test.c).
- **Real failure-path observation.** Each live cleanup check deliberately threw inside an allocated roster callback. The pinned log records requested=3, made=3, callback_ok=0 and records_restored=1. The later battle records callback_ok=1 and records_restored=1. Natural allocator exhaustion was not induced in game; partial allocation has native-model coverage. Pinned log (local evidence) · Cleanup receipt (local evidence).

Desktop screenshots were captured at 1107 × 794 and game screenshots at 882 × 671. The final battle's capture later lost its game surface; its combat and cleanup claims rely on bound logs/receipts, not that unavailable capture. Only this cold ranged mixed configuration received live battles. Melee mixed fixtures have offline coverage. Mod-added units, waves, mixed live editing, arbitrary area patterns, battlefield-position getters, Mac support and ordinary campaign/save compatibility remain outside the implemented slice.
