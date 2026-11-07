# Damage workflow expansion · v0.14

Completed 6 November 2026. Research, implementation, offline checks and a separate Windows desktop build/package are complete. **No new rendered desktop or gameplay acceptance is claimed.** The user's existing workbench remained open; no desktop input, game launch, installation update, mod/save changes, publication, push, PR or external message occurred.

## Supported outcome

All **25 documented damage IDs** are available by name/ID in creation and searchable choices, with explicit differences between guided and manual payloads.

- **1–10:** guided scalar creation in Vanilla weapon fragments and both SE pair formats. Both fixed and editable isolated helpers accept them. Type may cycle within this scalar group; new saved results and draft returns support the same group. Fear is explained as morale damage.
- **12/13:** guided affliction/benefit masks with searchable checkbox builders, exact decimal BigInt values, and distinct weapon/spell payloads. All **38/35 documented bits**, including high bits, are present. Source creation/export and canonical SE tests are supported. Tests hold type/payload fixed; area and visual fields can be tried/read back/returned. Default enemy targeting is stated explicitly for benefits; friendly/self targeting and ritual/world-map behavior need separate manual integration/fixtures.
- **25:** guided tree/fungus selectors (**1/2**) for creation/export. Automatic test preparation is blocked: the field has no suitable terrain-target setup. This is an unestablished fixture, not a claim that the engine lacks animation.
- **11, 14–24:** an explicit advanced manual-payload acknowledgement permits literal source creation/export. Automatic testing is blocked with the specific missing interpretation/setup. No other type is substituted. The app does not certify those raw values as working effects.

Unknown IDs, unknown/empty guided masks, out-of-subset scalar values and invalid animation selectors are not silently accepted as supported presets. Existing raw source remains inspectable/exportable under the original preservation rules. The [support matrix and precise reasons](../../docs/DAMAGE-TYPES-014.md) describe every group, targeting limitations, sources and later acceptance.

## Restriction audit and implementation

| Layer inspected | Previous restriction/assumption | Current handling |
|---|---|---|
| `creation.js` | Only type strings 3/4; both damage fields limited uniformly to scalar 32-bit values | Shared type/payload policy: scalar, distinct documented masks, animate selectors and acknowledged manual payloads. Test preparation has a separate strict eligibility gate. |
| `choices.js` | Creator selection refused all documented IDs except 3/4 | All documented 1–25 can populate the control; the creator explains their guided/manual status. IDs beyond the verified table remain manual source. |
| `index.html`, `creation-ui.js` | Two-option dropdown and generic damage explanation | All names/IDs, contextual labels/help, per-field payload builders and manual acknowledgement. Type changes retain entered values and reset acknowledgement. |
| `core.js`, `app.js` | Generic numeric source editing with obsolete special-payload help | Existing span parser/storage envelopes retained. Contextual payload help/builders use an unambiguous type/link; unknown or ambiguous source stays manual. No unrelated source regeneration. |
| `WeaponEditFixture.lua`, generated `weapon-edit-fixture.js` | 3/4 validation, toggle and labels | v4 supports scalar 1–10; special masks remain at their prepared type. Scratch-only writes/readback/cleanup remain. Loaded weapon/spell payloads and association are checked before casts. |
| `TestFixture.lua` | Canonical creator implicitly limited fixed tests to 3/4; no explicit base-payload check | Eligible types are admitted by the canonical validator; loaded type/payload are checked, including again before casting. |
| `desktop/TestCandidate.cs` | Native type 3–4 and scalar-only payload parsing | The same factual policy gates canonical candidates, mask values and animation/manual rejection. Exact helper/source checks remain. |
| `desktop/TestExchange.cs` | Result `dmgtype` 3–4 | New `documented-v1` contexts permit their own scalar group or fixed mask baseline; old contexts retain 3/4. |
| `return-values.js`, `return-values-ui.js` | 3/4 result/manual-return assumptions | Context-dependent allowed types, populated manual controls and refusal to reinterpret special-payload types during a return. Pending edits, conflicts and explicit export remain protected. |
| Tests/docs | Previous 3/4 assertions and historical claims | Old success coverage retained; new typed generation, masks, manual/animation gates, native-reader round trips and Lua failure/cleanup scenarios added. |

`damage-data.json` is the factual table embedded by the native app; `damage-data.js` provides the identical browser data. A test asserts equality. `damage-types.js` owns script policy; native `DamageTypes.cs` checks the same data and boundaries. `damage-ui.js` implements the bounded, searchable payload picker. The application has no VFX preview or inferred flag/target setup.

Older v0.9–v0.13 packages remain review-only. Frozen v0.13 fixed/editing Lua resources preserve exact old canonical verification. New launches require v0.14 and `weapon-edit-v4`. Saved result-file schema and retained session data are not migrated. Payloads are fixed/read-checked, not written or exchanged as saved fields; a result never claims they looked correct.

## Research and evidence levels

The current creator, choices, source-span editor, native candidate policy, both generated helpers, saved-file reader and return UI were inspected. The official [modding manual](https://www.illwinter.com/coe5/coe5modding.html) and [game manual](https://www.illwinter.com/coe5/coe5manual.html) were checked through web access. Existing pinned editor tables and the already verified official CoE5SE 2.13.0 local source were used; no runtime was updated.

The source distinguishes 8-byte weapon damage, 4-byte damage type and signed-64-bit spell payloads. The manual specifies masks for 12/13 and selectors for 25, but does not fully specify every other special payload. Notably, ID 11 is called mirror release in Illwinter's table and phantasm in the pinned extender reference. Those differences were not resolved by guessing. The test-field source fixes terrain and exposes enemy-unit/count configuration; it does not provide this helper with an established animation-target setup.

Source hashes for `coe5.lua`, `record_words.h`, `spell_table.h` and `lua_test_battle.h` are in `artifact-checks.json`. Source URLs, per-type limitations and other browse-only dependencies are recorded in [the guide](../../docs/DAMAGE-TYPES-014.md). Historical 5.33 rows and API documentation are not treated as current in-game observations.

## Verification

| Verification | Result | Local evidence |
|---|---|---|
| Script/parser/UI-event tests | **191 / 191 pass** | `script-tests.txt`, `tests/damage-types.test.cjs` |
| Compiled native headless checks | **72 / 72 pass** | `native-checks.json` |
| Generated Lua mock scenarios | **51 / 51 pass** | `lua-checks.json`; existing standalone SDK VM and 24 source hashes verified |
| Synthetic native reader → script Apply → separate export | **24 cases pass**, both formats for types 1–10/12/13 | `native-roundtrips.json`, uniquely created round-trip export folders |
| Real retained Codex VFX Trial replay | Pass; only impact 7 → 3; exact prior export bytes | `real-result-checks.json`, `actual-result-packet.json`, unique `returned-*.c5se` |
| Static HTML, local help policy, package bytes | Pass; 281 IDs, 20 permitted scripts, 41 matching UI/docs files | `artifact-checks.json` |
| Protected game/mod/session/evidence files | All **491** unchanged | `protected-before.json`, `artifact-checks.json` |

Lua checks execute real generated source in the existing verified standalone Lua interpreter with mocked CoE5 APIs and synthetic clicks/records. They cover eligible scalar/mask types in fixed/editing helpers, wrong initial payloads, outside payload changes, refused write/readback, fire failure, saved call counts and scratch cleanup. They neither load the extender nor demonstrate actual damage/status/visual behavior. The previous 772 dock/helper scenarios are historical evidence, not claimed as rerun here.

Native checks read the real old session without writing it. Its saved impact 7 → 3 and one completed cast call remain earlier evidence; the user's prior visual observation is separate. The new round trips use synthetic result files, not additional gameplay. Existing tests continue to protect unchanged fields, unrelated pending edits, explicit conflicts, safe optional additions, unknown lines/BOM/mixed line endings and old result associations.

The static/package checks do not establish rendered layout, visible keyboard focus or display scaling. No screenshot of the new interface is provided as evidence. Review is implementing-agent self-review, not an independent review.

## Build and active-session preservation

The existing workbench process was using `build/desktop/CoE5Workbench.dll`. The initial standard publish encountered that lock. Outputs it had copied were restored from the intact previous ZIP; **every prior packaged file now matches that ZIP**, and the process was not closed. See `active-build-preservation.json`.

The new app is built separately:

`build/desktop-014-0a4ffc892b444f4caf0d6528e4c5170f/CoE5Workbench.exe`

Distribution:

`dist/CoE5Workbench-0.14.0-win-x64.zip`

Extract the whole ZIP; this build needs .NET 8 Desktop Runtime x64 and WebView2. No game/extender, private references, runtime paths, profiles, saves or sessions are included. The previous standard ZIP and friend ZIP are unchanged. `Start-Workbench.cmd` still addresses the old open build; use the separate v0.14 executable/ZIP for this revision. No friend package was rebuilt.

## Next useful checks

First run the [desktop acceptance checklist](../../docs/DAMAGE-TYPES-014.md#user-operated-acceptance-still-required) using disposable source copies, with no game launch: scalar selection, high-bit mask building, manual/animate blockers, source review and retained-result return/export at normal and smaller window sizes. Then validate one newly supported scalar and a simple mask in a fresh isolated game session, recording helper readback, cast call, visible outcome and cleanup separately.

The most useful next browse-only work is an explicit safe copy/import workflow for existing spells/weapons. Custom-path declaration/load order and verified asset/audio catalogs are separate dependencies. Mixed groups, waves and friendly/terrain targets need new verified fixture design/API support; repeated identical enemies or resets are not labeled as those features.
