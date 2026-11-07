# Prioritized implementation and validation plan

This plan proposes future work only. No implementation, game execution or supplied-code reuse occurred during the investigation. Start with **P0: an explicit target and native weapon-only creation**. Then run a separately scoped **P1: in-game scratch-weapon editing experiment**. Do not combine either with an interface redesign or a general parser rewrite.

## P0 Make target and dependency behavior explicit

**User benefit:** a modder can intentionally make a native weapon without receiving an extender spell, and can see why an existing source needs CoE5SE.

**Builds on:** the source-span editor, separate-copy export, current canonical generator and the guide's file/context/argument method. Parser (local evidence), creator (local evidence), target design (local evidence).

**Required work:** add a target independent of format; split weapon validation/generation from linked-pair generation; classify the bounded supported blocks; show line-specific SE/unknown diagnoses; retain the existing generator and test preparation gates in SE mode. Add a native-weapon export action and a clearly distinct preserved-source-copy action. Keep existing imports unresolved whenever dependencies, custom commands, includes, ambiguous contexts or capacity cannot be settled. Do not promise certification of arbitrary whole mods.

**Vanilla/SE implications:** native fragments contain no SE requirements or linked spell. The SE pair keeps its guard, main-file dependency lines and correct prefix/sidecar handling. Field testing remains unavailable in Vanilla. Numeric native settings may be tested diagnostically under SE, but that is labeled an SE test of a native definition, not a Vanilla runtime pass.

**Major unknowns:** installed mod-set capacity, inheritance, external command providers, unverified current IDs and native edge cases. The first release should block validation in these cases while retaining source export. Historical references remain labeled 5.33.

**Validation gate:** focused parser/generator/UI tests must establish:

1. Switching target changes no source bytes or original extension, including BOM, mixed endings, comments, unknown lines and `#!@` text.
2. A new native weapon exports only its supported native subset. SE-only spell blocks, quoted-path extensions, `flag 0`, SE traits, sidecar-only definitions and unresolved content cannot receive native-generation approval.
3. Context tests distinguish ritual `level` from a new spell's level, normal hash comments from `.c5m` prefixes, and plain `requires` from ineffective prefixed dependency lines. Missing keyword entries remain unknown.
4. Existing canonical `.c5m`/`.c5se` pair preparation and stale-revision protection still work; mode switches cannot bypass native package validation.
5. A later authorized, separate **SE-free** fresh-game test equips the generated native weapon and records loading/attack/effect plus exit. Until then report syntax checks, not native gameplay compatibility.

## P1 Try a bounded in-game weapon editing loop

**User benefit:** try several supported weapon-effect values in one disposable session instead of preparing and restarting for each scalar change. No measured time saving is claimed yet.

**Builds on:** the existing isolated session, reviewed helper, current exact runtime fingerprints, `coe5.get/set("weapon", ...)`, and field APIs. WeaponTester establishes the intended source pattern, while Workbench retains its own source editor and ownership safeguards. [Write API](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_get_set.h#L818-L881), [field API](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/coe5.lua#L3913-L3942).

**Required work:** independently design a small panel within a new reviewed helper version. Give it one uniquely named **own** scratch weapon, a verified baseline, explicit **Apply**, accepted-value readback, **Cast once**, **Reset targets**, and **Close test**. Start with a few fields already understood by the Workbench; choose an observable effect change and validate exact storage/semantics before expanding. Stop on rejected or mismatched readback. Block editing during a full fight; do not add Fight in the first slice. Close only a field successfully opened by this helper and protect cleanup on error.

The native `TestCandidate` currently accepts only canonical files and an exact embedded Lua template. Update that template contract and its validator together; never accept arbitrary imported Lua as a shortcut. Bind the session to its prepared source revision, and track later applied parameter revisions separately. Reconcile a result into the desktop draft only after an explicit user review. A bounded copy/import of generated values is a possible first return path; it is not implemented or a live connection. Validator (local evidence), helper (local evidence).

**Vanilla/SE implications:** this is always an SE diagnostic tool. A native weapon draft can remain native if its artifact export excludes the helper/guard and all SE features; the test still does not establish the SE-free baseline. Initial integration can stay limited to the existing SE linked-pair route. New standalone weapon testing needs its own canonical candidate schema, caster assignment and validator, rather than manufacturing a hidden spell.

**Major unknowns:** attack-assignment damage versus weapon base damage; shared-weapon stand-in restoration; which non-record SE traits are copied; narrow numeric storage; Fire/Fight refresh differences; fixed enumeration bounds; callbacks on error. Changing a new spell's path, level, damage assignment or declarations still uses the prepare/restart workflow. No supplied API here proves general Lua/mod parser reload or desktop-to-game synchronization.

**Validation gate:** first test the independent helper and host contract offline with mocks for refusal, partial write/readback mismatch, duplicate names, wrong ownership, open refusal, repeated input and every exit/error path. Then, in a separately authorized isolated runtime:

1. Capture fingerprints, enabled mods and source revision; open the field without a cast and read the baseline.
2. Apply one allowed edit and record requested/accepted values. Cast once on fresh targets and preserve logs plus actual effect evidence. Do not count individual area-hit log entries as extra casts.
3. Reset targets and restore baseline; confirm readback. Test an intentionally invalid edit without firing and ensure no success is reported.
4. Close, verify the borrowed weapon's baseline, reopen where safe, then exit the owned process. No campaign/save testing is implied.
5. Compare time and user actions for two reviewed parameter variations with the existing prepare/restart workflow. Report measured results and failures, not an assumed speedup.

Do not run the old archive as part of implementing this plan without separate scope and an isolated setup. Permission for code reuse/redistribution must be settled before incorporating any of its code or assets. Independent implementation of an idea should still credit its inspiration appropriately.

## P2 Make references and effects easier to choose

**User benefit:** understandable look, flight and sound choices with fewer guessed numbers.

**Builds on:** existing provenance-aware references and WeaponTester's semantic labels plus `lookName` technique. Current reference limits (local evidence), [runtime label API](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/coe5.lua#L3944-L3947).

**Required work and unknowns:** verify a current-build metadata export with explicit IDs and field provenance; retain duplicates and mark missing values. Verify impact effects separately from mode-1 flight sprites. Audit hardcoded sound labels against the actual runtime before offering named controls. No new API is necessarily needed for an in-game label; a stable full enumeration API may be useful, but should first be discussed.

**Vanilla/SE implications:** offline historical references serve both targets. Runtime extraction/testing uses SE and must record the loader and enabled mods. A real Vanilla preview requires its own evidence. A desktop visual renderer remains separate research; labels or illustrations must not be called accurate VFX previews.

**Validation gate:** cross-check explicit IDs, table version and duplicate names, then manually compare a small allowed set of labeled impact/flight/audio settings with captured game evidence. Preserve mismatches. Do not expand controls based solely on a list appearing in old code.

## Deferred work

Full fights/AI, general spell modifiers, arbitrary source packaging, live desktop transport, automated game driving, current-game catalog extraction, and a plane editor are outside these increments. If a desktop connection is later justified, specify its transport, explicit user start, ownership, schema, revision/acknowledgment and failure recovery first. Ordinary combat, AI choices, real range/timing and save compatibility require their own tests. The current successful Waterball field cast does not establish them.
