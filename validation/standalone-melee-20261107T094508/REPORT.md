# Standalone melee weapon validation

**Passed.** On 7 November 2026 the actual Windows Workbench created **Alder Trial Spike**, prepared a new CoE5 5.43 / CoE5SE 2.13.0 session, and ran one AI battle. The private carrier used the named weapon twice against a Spearman. On-screen attacks (local evidence) · Combat log (local evidence)

## Try it

1. Open the current desktop build with `Start-Workbench.cmd`. Choose **Vanilla CoE5 → New weapon**, enter a unique weapon name and create the draft. The native form defaults to pierce, range 1, initiative 5, base damage 0 and area 0.
2. Choose **Test melee weapon with CoE5SE…**. The same action works when reopening the exported Workbench fragment. Apply pending field edits first. The carrier and target are fixed. Set the **carrier attack payload** (default 8). The weapon's `dmg` stays in the draft. With base damage 0, the monster's attack row supplies its base damage. The payload is not a prediction of damage dealt.
3. Choose **Prepare test files → Prepare isolated session → Start isolated test**. In the game choose the **WB test** entry with your mod ID, then **Battle (AI)**. Check the named attacker and weapon in the event log. **Close** returns to the main menu. **Quit** exits the session. Record what you saw back in the Workbench.
4. **Export native weapon…** writes just the weapon fragment. The private monster, attack row and CoE5SE dependency belong to the separate test. Native export (local evidence) · Test mod (local evidence) · Final setup screen (local evidence)

## Actual game observations

| Check | Evidence |
| --- | --- |
| Loaded identity | The native loader recorded `newweapon used 1200 = 'Alder Trial Spike'` at line 355 of the log. The helper resolved WB Melee Carrier #2000, one regular melee row at index 0, weapon #1200, payload 12, and target Spearman #13. Before opening and before fighting it checked the named records, lack of a second row, and all five supported weapon fields. Bound helper result (local evidence) |
| First exchange | The units approached. In round 2 the Spearman dealt 2 damage to the carrier. The carrier attacked with Alder Trial Spike at distance 1 and dealt 2 piercing damage. Log lines 477–486 identify both participants, the weapon, its payload and the damage. Approach (local evidence) |
| Second exchange | In round 3 the Spearman dealt 1 damage to the carrier. The carrier hit back for 22 with Alder Trial Spike, killing the Spearman. Log lines 507–517 and the on-screen event log agree. No distinctive impact animation was identified. The session's visual label is **unclear** and its notes confirm weapon use. Observation (local evidence) |
| Close and exit | The helper recorded one returned AI battle, no stop request and `stage=closed`. Close visibly returned to the main menu. The new session's copied game process, PID 5744, exited with code 0. Menu (local evidence) · Session (local evidence) |

The new session ID was `ab9210d172c148ccab8b20e76a137740`. The launch record (local evidence) identifies its private runtime and profile. All 19 prepared runtime/mod hashes matched after exit, as did the 14 pinned installation/extender inputs. The separate native export matched the candidate's original source byte for byte. Integrity checks (local evidence)

## Implementation and scope

The native mod declares the weapon, creates a new monster, copies Spearman stats into that monster, removes its inherited attacks and assigns `meleeweapon 12 "Alder Trial Spike"`. This supplies an attack row that a weapon fragment on its own lacks. Only the generated private carrier receives these commands. The desktop host independently validates the complete executable mod text and Lua against its bundled templates. The helper requires a per-launch binding and unambiguous loaded names. It opens the field with four arguments (carrier, spell −1, target 13, count 1) and uses the existing native AI fight. It performs no weapon or monster table writes.

| Category | Current support |
| --- | --- |
| Slash #1, blunt #2, pierce #3 | Generated standalone native .c5m, range 1, area 0, base damage 0–99, initiative 1–99, carrier payload 1–99. All three passed offline generation. One piercing case was exercised in game. These bounds describe this fixture. |
| Range above 1, ranged/projectile weapons | Need their own explicit attack row, placement and range/flight checks. |
| Elemental or special damage, status masks, special payloads, optional sounds and VFX, area attacks | Need appropriate target, damage semantics or asset/effect checks. Support for editing and exporting existing drafts continues. |
| Bonus, conditional, chained and multiple attacks, imported arbitrary mods | Outside the canonical single-weapon test. Extra commands are preserved for export. There is no attempt to isolate one definition from a larger mod or to launch arbitrary source. |
| Vanilla-only combat | The exported weapon uses native syntax. This observation field requires CoE5SE. A native-only test needs a separate map or combat encounter. |

The native manual documents `copystats`, `clearweapons`, `meleeweapon` and the distinction between weapon damage and monster weapon payload. The 2.13.0 API maps attack type 1 to regular melee and exposes row weapon/value and list termination. The supplied WeaponTester demonstrates private monster definitions and separate spell stand-in and forced-fire paths. This field uses its own private monster definition and ordinary AI combat. [Native modding manual](https://www.illwinter.com/coe5/coe5modding.html) · [Pinned API](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/coe5.lua) · [Field implementation](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_test_battle.h) · [WeaponTester inspection](../../docs/weapon-tester-and-mode-research-20261106/01-weapon-tester.md)

## Offline and desktop checks

- **215 script tests** passed, including physical types, separate damage values, unsupported categories, exact source bytes, pending edits, changed test options and return to a draft after preparation. Script results (local evidence)
- **18 compiled desktop checks** passed, including acceptance of the real session candidate and rejection of changed native source, staged mod, helper or manifest payload. **Nine mocked Lua cases** exercised wrong target, ambiguous names, wrong row/type/weapon/payload, altered weapon properties, refused open and cleanup on a drawing error. Native results (local evidence) · Mock results (local evidence)
- Rebuilt the Windows application. Following the game run, the setup heading, control order and reporting label were corrected. Reopened the exact exported fragment in the rebuilt app and verified the corrected screen. The game helper and native attack were unchanged. One game battle was sufficient for this case. Initial screen (local evidence) · Corrected screen (local evidence)

These observations cover one ordinary attack in a fixed grass field, with a carrier built from Spearman stats. Campaign AI, different carriers and targets, damage distributions, audio, general VFX and save compatibility remain untested.

