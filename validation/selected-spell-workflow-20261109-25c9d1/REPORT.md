# Selected spell and linked weapon: implementation and desktop acceptance

**Implemented; offline and rendered desktop checks passed.** A [subsequent controlled game acceptance](game-20261109/REPORT.md) completed one cast, result return, full-source export and normal exit code 0; VFX capture failed and an extra status remains unexplained. The report below records the earlier preparation stage. A modder can select an eligible CoE5SE spell inside a larger `.c5m` or `.c5se`, inspect its local weapon link, prepare only those two definitions, review recorded weapon-value changes against the full draft and export a separate full-source copy. The new Harbor Ember session is prepared and unlaunched. No game was launched or controlled in this task.

## Investigation and bounded decision

Read AGENTS.md, the consistency checklist, the [selected-weapon implementation](../selected-weapon-workflow-20261108-7f91d2/REPORT.md) and [Harbor Needle gameplay report](../selected-weapon-workflow-20261108-7f91d2/game-20261108/REPORT.md). Inspected `core.js`, source relationships/overview, `creation.js`, app/test adapters, both generated helpers, `TestCandidate.cs`, isolated-session and result-return code. The clean publication checkout and GitHub main started at `c67b1db8f7fea7b8a8ed7d6a33e95ccfbdcb5bfc`.

Checked the current [official native manual](https://www.illwinter.com/coe5/coe5modding.html) on 2026-11-09: native weapon construction is distinct from monster spellcasting commands such as `spellweapon <path> <level>`. The selected `newspell`/path/level/weapon definitions in this workflow belong to CoE5SE, including when carried on `#!@` lines in a `.c5m`; the file extension does not make them Vanilla features.

The locally verified official 2.13.0 release source under `validation/single-cast-543-2130-20261106-085530/official-release/extracted/CoE5SE/src` supplied the actual implementation evidence:

- `spell_table.h`, `newspellLine`, `pathLine`, `spellLevelLine` and `weaponLine`: the extender allocates a new spell and accepts path/level/weapon data. The engine accepts more forms than this first workbench slice. Named/custom paths and numeric or reversed-order weapon references are not automatically resolved by the adapter.
- `sidecar.h`, `modLineReadHook`: the `.c5m` prefix and sidecar interpretation are separate loading paths. The existing package generator already emits the correct guarded main file/sidecar arrangement.
- `lua_test_battle.h`, `lFireTestField`: `RVA_DOATTACK` is invoked as an item-style spell attack and selected ranges between 1 and 30 are temporarily extended. This is not a native-AI spellcasting test.
- Existing `WeaponEditFixture.lua` and `TestCandidate.cs`: the helper resolves unique runtime names, checks spell/link data and edits only the test-owned associated weapon. The native host accepts the exact canonical generated definitions and reviewed helper; it does not accept arbitrary source/Lua. These runtime/helper contracts were retained.

Local `offline/source-inspection.json` records SHA-256 for the three inspected release files and the native manual URL/check date.

The prior strict pair gate rejected a supported spell merely because unrelated definitions/comments surrounded its pair. A narrow extraction adapter is feasible without a new engine API: require explicit self-contained local data, create a canonical copy and pass it through the existing validator. Full-mod loading, faithful inherited records, cross-file resolution and normal AI spellcasting remain outside this slice. [Workflow and capability boundary](../../docs/SELECTED-SPELL-016.md).

## Implementation

`creation.fromSource` resolves a unique selected spell and exact quoted earlier local `newweapon`, checks all fields/prefixes and produces only their supported canonical definitions. Exact generated pairs keep their original text/identity and old route. Required fields are explicit; no defaults, links or payloads are guessed.

The app exposes **Test selected spell with CoE5SE…**, retains the existing source link and full draft, and shows names, lines/file, definition-only scope, damage/payload and shared use before preparation. A rendered review led to putting **Forced item-style cast** directly in the main setup text, as well as the existing detailed limits. No new dashboard or mandatory tutorial was added.

Includes, external mod requirements, numeric record overrides, duplicated/case-ambiguous names, unsupported prefixes/formats, custom/named paths, copies/flags/chains, malformed/extra commands, missing/repeated fields and metadata/end boundaries detaching a tail are refused. The existing type/payload policy is reused; unsupported types are not substituted. Optional effect/sound numbers remain numeric metadata, not appearance/asset guarantees.

The return engine already supported a full source with a unique tested spell/weapon. Its existing three-way comparison, safe optional insertion, explicit Replace, unrelated pending fields and separate export remain intact. It now blocks a pending weapon relink, rather than editing the old linked record while a new reference waits in the form. Review explains that returned weapon fields affect other local spell links. Package README text now describes direct review/Apply/export and the existing optional-insertion behavior accurately.

No game/extender implementation, Lua helper, native launch policy or result schema changed. The C# change adds two offline canonical-boundary checks only.

## Actual Windows desktop observations

Used the rebuilt `build/desktop-016-workspace/CoE5Workbench.exe` with the computer-use skill and authorized desktop. App surface: **1107 × 794 logical pixels** at current scaling. No other DPI/window width was newly verified.

1. Native Open loaded a BOM/mixed-EOL representative `.c5m` with two weapons, two spells sharing one weapon and unrelated monster text. Selecting **Harbor Ember Test** showed **Linked weapon → Harbor Ember** and the new test action. [Selected spell](01-selected-spell.png).
2. The test dialog displayed both source locations, explicitly excluded the rest of the mod, disclosed shared use and explained the forced-cast scope. The existing two-column participant/runtime layout stayed readable. The preparation button required scrolling at this height; the existing next-action banner/focus directed the workflow. [Final scope text](07-selected-pair-scope.png).
3. Opened a disposable `.c5se` wrapper around the retained **Codex VFX Trial** pair from session `3bc3ad7e1ef148fdb922af627be9760f`. It added another weapon, one sharing spell and a monster. The saved-result banner found that real historical result without modifying its session.
4. Left a spell-level edit **1 → 2** pending, then reviewed the retained impact **7 → 3**. The actual view showed **one completed cast call**, readback versus visual-observation separation and the shared-weapon warning. The personal observation checkbox stayed unchecked. [Retained result review](02-retained-spell-review.png).
5. **Apply selected to draft** changed the weapon impact while the spell-level input remained **2** and export stayed disabled. [Pending edit retained](03-pending-edit-retained.png). Resolving that disposable pending level restored it to 1 without undoing the returned impact.
6. Native **Export copy** wrote a new complete `.c5se`. Byte comparison verified exactly one impact-token change, with other definitions/comments/formatting intact. [Completed sidecar export](04-sidecar-exported.png).
7. A source with an unresolved `#!@include` visibly disabled preparation and identified its line and missing dependency/load-order review. Editing/export remained available. [Dependency refusal](05-dependency-blocker.png).
8. Vanilla view retained the CoE5SE spell and link, explained its dependency and hid the spell test; returning to CoE5SE restored the eligible action without source conversion. [Vanilla boundary](06-vanilla-boundary.png).
9. Prepared a fresh Harbor Ember experiment with the default Spearman #13 caster/target, count 1. The current production host accepted its canonical files and compatible runtime. **Start isolated test** is enabled; no launch occurred. [Prepared files/session](08-isolated-prepared.png), [final ready state](09-ready-for-manual-cast.png).

This is actual desktop preparation/review/export, not a new game observation. The retained Codex result establishes its previous helper readback/cast evidence; wrapping it for desktop review does not prove that the new wrapper was loaded in game.

## Offline verification and preservation

- **278/278 script tests pass.** Thirteen new cases cover both containers, exact generated identity, bounded extraction/exclusion/order, unresolved/numeric/duplicate links, unknown flags/malformed/prefix/default cases, include/mod/custom-path dependencies, detached tails, existing mask policy, UI scope, Vanilla/pending preservation, full-source round trips, newer conflicts, applied/pending relinks, optional insertion and review/explicit export.
- **37/37 compiled checks pass**, including new `.c5m`/`.c5se` candidates through the unchanged native `TestCandidate.Read` and rejection of altered source/helper content. These are offline file/policy checks, not engine tests. This run's optional `isolatedFixture` flag is false; no claim is made that all substitute-process session checks were rerun here.
- Windows x64 `dotnet publish` succeeded with existing locked dependencies. Final JavaScript assets match source. The added tail-boundary guard was checked offline; the rendered sample has ordinary record boundaries. No downloadable ZIP was rebuilt or replaced.
- The actual desktop export is **540 bytes**, SHA-256 `115b10d84d29357e6036b179f01d9f443eacf219b4be8ec0368476188e769da6`, versus original wrapper `fb304dd1a624f074d5ca936184f610d101944a4deadf28c3fbd6514cf3e60364`. It equals that original with only `look 7` → `look 3`; pending level 2 was not silently applied.
- Local before/after manifests cover retained Codex VFX Trial, Mixed Area Needle and Harbor Needle sessions. All **100 files** match their pre-check hashes: Codex 34, Mixed Area Needle 33 and Harbor Needle 33. Their candidates, profiles, runtime files, logs and prior exports remain untouched. New source examples and preparations stay local except for the self-authored public example and curated screenshots/report. No personal mod, runtime/game binary, save or profile is published.

Local `offline/` holds script/native outputs, source fingerprints, generated candidates, export comparison and preparation checks. Those private fixture/session artifacts are excluded from GitHub.

## Prepared manual acceptance plan — subsequently completed

The prepared session is **27a526744dad40d2b85c0397aa0d6582**, mod **WB_Test_mw9h6769**, revision `621a22a8cafdaad1487c66417f7b96d33125cdf6cb9f93b65eedba160a5e13f9`. Status is prepared, stale is false, PID is null. All **19 staged file hashes verify**. It contains only **Harbor Ember Test** and **Harbor Ember**, the approved helper, generated metadata/banner and the existing official extender setup; Hook, Echo and Guard are excluded.

Prepared values: built-in path #3 / level 1, spell payload 8, weapon base damage 0, fire #4, range 5, initiative 1, area 0, particle mode 2 / flight #65 and impact #68. This specifies metadata, not an observed new visual effect. CoE5 5.43 executable fingerprint is `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55`; official CoE5SE 2.13.0 plugin is `26861bb0b6dffaa7150ed239e9eba4e934a955688d101c81161cf395190dd254`. No mixed-roster overlay is required.

1. In the currently open dialog click **Start isolated test**. Confirm the isolated main menu, then open **WB test: WB_Test_mw9h6769**. Do not use a normal campaign or Steam launch as a substitute.
2. In the field choose **Effects… → Impact**, search/select **#3** (the loaded White Flare entry), return with **Back**, then **Apply**. Keep fire #4, area 0 and flight 2/#65 unchanged. Report any unavailable entry/error rather than substituting silently.
3. Click **Cast once exactly once**. Note the visible flight/impact and any combat-log damage separately. Click **Save test values → Close test**, return to the main menu and **Quit** normally. Record any cleanup or exit problem.
4. In Workbench refresh status and **Review saved test values**. Check the correct spell, impact **68 → 3**, readback and completed cast-call count. Select only impact, **Apply selected to draft**, then **Export copy** to a new complete `.c5m`. The shared Echo reference should remain in source. Report what you observed; saved values alone do not prove a hit or appearance.

If preparation was closed/reopened, reopen this validation folder's `Harbor-Spell-Workshop.c5m`, select Harbor Ember Test, enable the experiment and reprepare files/session. C30's resume limitation remains; do not launch stale runtime folders directly. A new controlled game run is needed to validate this selected-pair source-to-game route. The earlier weapon/retained spell runs are not substitutes.

## Remaining limitation and next step

The useful first slice is explicit plain local definitions, not full-mod spell support. Cross-file/sidecar companion resolution, built-in or numeric weapon cloning, custom paths, inherited/flagged records, normal AI casting, campaign behavior and complete dependency/load-order evaluation need further design and evidence. Visual IDs still need runtime identity/appearance checks; helper cast calls do not provide automatic hit attribution.

The most valuable next step is the short manual Harbor Ember test above, followed by analysis of its actual logs/readback and separate full-source export. Keep the forced-cast result distinct from a later ordinary-combat spell test.
