# Test an existing spell and its local weapon

With the **CoE5SE** target, open a `.c5m` or `.c5se`, select an eligible spell and choose **Test selected spell with CoE5SE…**. The source link identifies its weapon. The full source stays open; only a canonical copy of the two explicit definitions enters a disposable test.

This is a **forced item-style cast**, using CoE5 5.43 / CoE5SE 2.13.0. Some weapon ranges are temporarily extended to 30. It does not test memorization, path eligibility, natural casting/AI, normal range/timing, saves or the complete mod. Appearance needs an actual in-game observation. The desktop does not render VFX.

## Which source qualifies?

| Source | This workflow |
| --- | --- |
| `.c5m` with `#!@newspell`, `#!@path`, `#!@level`, `#!@weapon` | Supported bounded extraction with CoE5SE. These lines are comments to Vanilla. The earlier `newweapon` and its fields must be unprefixed native syntax. |
| `.c5se` with the same commands unprefixed | Supported when both definitions are in that file. The package adds its own guarded `.c5m` and matching sidecar. No source conversion occurs. |
| Vanilla caster commands such as `spellweapon <path> <level>` | These configure a monster's casting ability, not this CoE5SE spell definition. They remain in preserved source, outside this extraction route. Existing native spell observation remains separate. |
| Exact workbench-generated pair | Keeps the existing source identity, test helper and return workflow. |

Names use the existing generator subset: printable ASCII, up to 47 characters for the spell and 63 for the weapon; unsupported names stay inspectable/exportable. The selected spell needs a unique name, explicit built-in numeric path **1–69**, level **1–3**, and `weapon <payload> "exact local name"`. Its weapon must be a single earlier plain `newweapon`, with explicit `range`, `init`, `dmgtype`, `dmg` and `aoe`. Recognized numeric impact/flight/sound fields are optional. Missing values are not replaced by guessed game defaults.

The existing generated-pair payload policy applies: scalar types 1–10 and the documented masks for 12/13; masks keep their type/payload fixed during the experiment. Manual-payload types and Animate retain their existing test blockers. A syntactically accepted visual/sound ID is not proof of availability or appearance. No custom assets or sound files are copied.

Copies/inheritance, flags/chains, extra or malformed commands, repeated fields, mixed active prefixes, case-ambiguous/duplicate names, later declarations, numeric/external weapon links and named/custom paths are refused with a reason. Includes, external `requires` dependencies and numeric `selectweapon` overrides require context this extractor cannot establish. Metadata or `end` boundaries splitting either selected definition also require review. Nothing is removed from the original file to make preparation succeed.

Other definitions/globals are not loaded. This is not an effective-record reconstruction or a complete include/load-order resolver. A native/other-file weapon cannot be guessed from a historical name index or numeric reference. These cases need a separately designed dependency/ownership workflow.

## Edit → test → return

1. Search/select the spell and inspect **Linked weapon**. Open that link to edit weapon properties or use its existing role-specific visual **Find…** controls. Return to the spell when ready to test the pair. Apply pending field edits first.
2. Open **Test selected spell with CoE5SE…**. Check spell/weapon names and source lines, damage/payload, runtime dependency and shared use. If other local spells reference this weapon, returned weapon edits affect those links too; those other spells are not tested.
3. Choose participants/count. Enable **Let me adjust weapon settings in the test** for saved-value return. **Prepare test files → Prepare isolated session**. Review the files if needed. No game starts until **Start isolated test**.
4. In the isolated game open its **WB test:** entry. Use **Effects…** and the existing Type/Area controls where supported; choose **Apply** before **Cast once**. Note helper readback, completed cast calls, log evidence and visible appearance separately. **Save test values → Close test → Quit** normally. Do not open a campaign.
5. In Workbench refresh/review saved test values, or use the matching banner/**Saved test values**. Select the snapshot and fields. **Apply selected to draft**, resolve remaining pending edits, then **Export copy** to a new file. The complete source, container, comments and line endings stay preserved.

Only supported weapon values return: damage type/area and available impact/flight fields under the existing policy. Spell path/level/payload, sound, participants and observations do not become source edits. Flight mode/effect return together. Missing optional visuals require safe insertion plus explicit selection. Newer values require explicit **Replace**. Pending unrelated edits stay in the form; export stays blocked until they are resolved. A pending change to the tested spell's weapon reference must be resolved before returning values, so the tool does not guess which link you intend.

Session/source matching still uses exact unique names, source interpretation and the recorded canonical snapshot. It is not a fingerprint of the full originating mod; inspect the saved source/session before applying suggestions. A renamed, relinked or duplicated definition is not assigned to another record automatically.

## Status observations after a hit

The four controlled Harbor Ember casts did not reproduce Feebleminded: A dealt 4 damage without visible affliction, B dealt 2 and caused a Chest Wound, C killed the target, and D dealt 0 without visible affliction. All saved/closed/exited normally. Ordinary wound injury is a plausible explanation for the original event, not a confirmed causal diagnosis. Different rolls, a lethal target and absent random-affliction instrumentation limit the comparison. [Recorded results, actual VFX and limits](../validation/status-investigation-20261109-4a72c1/observed-20261109/REPORT.md).

Check the target before and after a cast. HP changes, named statuses, saved values and visible effects are different observations; a red heart alone does not identify an affliction. Do not assume an impact is harmless decoration or blame it from one injury message. A zero payload is not generally guaranteed to deal zero damage. Existing A–D launchers are completed reference cases.

## Evidence and next acceptance

**278 script tests / 37 compiled checks pass.** The actual Windows app exercised selection, both container interpretations, a missing-include refusal, Vanilla retention, shared-use review, preserved pending spell edits and a byte-exact impact-only full-source export using a retained real result. New candidates passed the unchanged native canonical/helper validator in both modes. The desktop app is rebuilt; the downloadable ZIP is unchanged.

The **Harbor Ember Test** session subsequently completed one controlled cast with a named fire hit, saved values, actual desktop return/export and normal exit code 0. VFX recording failed, and the log also records unexplained Feebleminded status; neither projectile footage nor purely visual semantics are claimed. [Game evidence and limits](../validation/selected-spell-workflow-20261109-25c9d1/game-20261109/REPORT.md) · [Earlier desktop/source investigation](../validation/selected-spell-workflow-20261109-25c9d1/REPORT.md). Reopening preparation still resets its transient options; if necessary, reprepare rather than bypassing stale checks.

Sources: [Illwinter's native modding manual](https://www.illwinter.com/coe5/coe5modding.html), official CoE5SE 2.13.0 release source (`spell_table.h`, `sidecar.h`, `lua_test_battle.h`) and the workbench's existing generated-pair validator/helper. The report records the local source hashes and precise limits. The native manual describes weapon construction and monster spellcasting; the `newspell`/sidecar contracts are extender capabilities.
