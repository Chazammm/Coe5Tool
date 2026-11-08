# Test a supported weapon from an existing mod

Open a `.c5m` and select the weapon in the source index or overview. **Test selected melee/ranged weapon with CoE5SE…** now works for an eligible plain `newweapon` inside a larger source. Comments, other weapons, spells and monster definitions stay in the editor and are not loaded into the test.

This is a **definition-only private-carrier test**, not a test of the complete mod or of a spell that references this weapon. It uses CoE5 5.43 / CoE5SE 2.13.0. Mixed groups additionally require the existing local roster-v1 runtime. Exporting the original `.c5m` does not remove or convert its CoE5SE content.

## Edit → test → use the values

1. **Open mod file**, then search for part of a weapon name in the index or overview. Duplicate names retain source locations; testing requires a unique weapon name across recognized weapon sections.
2. Edit the supported fields. Expand **Visuals & sound**. Native weapon **Find…** uses the pinned 5.43 impact catalog or the mode-appropriate sprite/particle catalog for mode 1/2. Names and IDs are reference metadata, not a desktop VFX preview. Other flight modes retain general/manual editing. Picking a visual never changes damage, range or flight mode implicitly.
3. **Apply changes** to the draft. Pending edits block test preparation. Choose **Test selected weapon with CoE5SE…**. The dialog identifies the source line/file and says that the rest of the mod will not be loaded.
4. Set the private carrier's attack payload and native target/count. To compare supported ranged visuals and return them later, select **Compare visuals in game**. **Prepare test files**, inspect the generated files, then **Prepare isolated session**. Runtime fingerprints and the existing canonical native validator still apply. No game starts until **Start isolated test**.
5. In the disposable game open **WB test: your test ID**. Use **Battle (fresh target/group)** for a comparison or **Battle (AI)** for a fixed fixture. Observe named weapon use in the combat log separately from the visible projectile and impact. Native AI can act zero/several times; a battle return is not proof of a hit or effect.
6. For comparison, choose and **Apply visuals**, then run another battle with fresh targets. **Finish** returns to the menu; click **Quit** normally. Do not load a campaign. Fixed tests provide observations, while ranged comparisons provide selected visual-value return.
7. Back in Workbench choose **Review saved test values** / **Saved test values**. It can now find the unique tested weapon inside the full mod, even when unrelated spells are present. Review the exact battle and source values; hit attribution and attack positions remain unknown unless independently observed. Explicitly select visual changes and resolve any newer-value conflict. **Apply selected to draft**, then **Export copy** to a new filename. Other source content, comments, line endings and unrelated pending edits remain protected.

`examples/selected-weapon-workshop.c5m` is a small representative source, not an installable mod release. Select **Harbor Needle**. It contains another weapon, a prefixed spell reference and a monster definition, illustrating what remains outside the isolated test.

## Supported boundary

The adapter accepts only an unprefixed native `.c5m` `newweapon` with a safe unique name, explicit `range`, `init`, `dmgtype`, `dmg`, `aoe`, and at most the recognized optional visual/sound commands. Duplicate fields, unknown/malformed lines, active SE prefixes, copies/inheritance, flags and extra commands are refused. Required defaults are never guessed. Current carrier limits still apply: types 1–6, weapon damage 0–99, initiative 1–99, area 0–5; melee range 1 without visuals, or range 2–9 with supported sprite/particle settings. Explicit sound commands and special payloads remain editing/export only.

`.c5se` files are preserved without conversion and do not gain selected-weapon testing in this slice. Exact generated CoE5SE pairs keep their existing Cast once workflow. Existing-mod spells with extra context remain unsupported by that pair fixture; their linked weapon can be inspected/tested separately when eligible. Original vanilla record observation remains its separate clean-native workflow; it does not load the user's mod.

The test copy is regenerated from the selected, explicit supported properties and passed through the unchanged strict fragment validator. Only that canonical definition plus the private carrier/helper is staged. The original source is never replaced with the normalized copy. This is not a full loaded-record clone: includes, other files, later numeric overrides, global commands, mod load order, copied flags and interactions with other units/mods are not exercised. A successful private attack cannot certify the full mod, normal spellcasting/AI/range/timing, VFX accuracy, saves or Vanilla-only testing.

Results are associated by source format and a unique exact weapon name, then reviewed against the current field values. They are suggestions, not proof that two same-named files are the same mod. Check the prepared source and session before applying. Ambiguous repeated weapon sections are rejected; newer visual values require explicit replacement. Only chosen visual fields return, never attack payload, roster, HP or inferred hits.

## Verification

The new adapter leaves the canonical helper/runtime contracts and old saved-source identities unchanged. Regression coverage checks excluded source content, refusal cases, pair compatibility, mode-specific visual search, pending edits, source switching, full-mod return, conflicts and byte-preserving edits. Mixed saved-source snapshots now use the existing weapon route instead of being incorrectly treated as spell pairs.

[Implementation, desktop evidence, manual test and remaining acceptance](../validation/selected-weapon-workflow-20261108-7f91d2/REPORT.md). No fresh in-game pass is implied by offline validation or desktop preparation. The retained game result may be reviewed separately, without replaying it or changing its session.

The prepared Harbor Needle session was subsequently tested by the agent: native AI used the weapon, both impact configurations and bolt flight were captured, and the selected impact returned/exported into the complete representative source. Normal Quit was observed; the numeric exit code was not retained after a local launcher journal failure. This is one bounded definition-only test. [Game evidence and remaining limitations](../validation/selected-weapon-workflow-20261108-7f91d2/game-20261108/REPORT.md).
