# First standard particle projectile

**Passed on Windows, 7 November 2026.** The desktop workbench created **Rime Trial Needle**, then launched one disposable CoE5 5.43 / CoE5SE 2.13.0 session. One **Battle (AI)** action produced two native ranged attacks. Watch the six-second clip (local evidence) · Full 42-second capture (local evidence)

| Question | Evidence from this run |
| --- | --- |
| Did the intended weapon fire? | Yes. The sole ranged row on **WB Ranged Carrier #2000** resolved to **Rime Trial Needle #1200**, payload 8. Round 0 hit Spearman #13 at distance 4 for 4 piercing damage. Round 1 hit at distance 2 for 2 piercing damage, killing the target. Combat log, lines 455–485 (local evidence) |
| Was particle flight visible? | Yes. A pale white-blue stream extended across open ground from the carrier toward the target on each attack. The first flight spans the larger gap. The loaded weapon reported standard mode **2** and **Icy Breath (fly) #97**. First flight, frame 1020 (local evidence) · Second flight, frame 1154 (local evidence) |
| Was the selected impact visible? | Yes. A distinct yellow-orange flash appeared over the Spearman at the end of each flight, with damage numbers 4 and 2. The loaded impact was **Flame #68**, also recorded as `look 68` on both attacks. First impact, frame 1038 (local evidence) · Second impact, frame 1166 (local evidence) · Flight and impact sequence (local evidence) |
| Did the field and game close? | Yes. CoE5SE logged field closure, the main menu reappeared, the helper saved `stage=closed`, `battles=1`, `stopped=0`, and the owned process exited with code **0**. Menu after closure (local evidence) · Runtime record (local evidence) · Extender log (local evidence) · Process status (local evidence) |

## Selection and validation

In **Vanilla CoE5 → New weapon**, **Choose particle flight…** opens the existing searchable chooser with a mode-2 test filter. Search by partial name or ID, review the source and select **Use choice**. Cancelling leaves the form intact. Selection sets the flight effect and mode. It starts at range 5 from a blank or range-1 draft and preserves other ranges, damage type, damage and impact. Set **Impact look** separately under **Optional weapon effects & sound**. The full effect catalog and manual input remain available for editing/export. Open **Test ranged weapon with CoE5SE…** to review the private carrier, attack payload, range, flight and impact. Actual chooser (local evidence) · Selected values (local evidence) · Carrier setup (local evidence)

The native manual assigns standard traveling particles to mode 2, with `flylook` drawn from the visual effects table. Mode 1 uses a different sprite table. `look` defines the visual at the point of impact and `dmgtype` defines the weapon damage type. The bounded chooser requires a matching flight-labeled row in the bundled editor data, a named row in the pinned game's effect table and a native 5.43 weapon referencing this ID in mode 2. The two other checked names in the reference extract are the allowed impact effects. [Native manual](https://www.illwinter.com/coe5/coe5modding.html) · [Bundled tools source](https://github.com/musical-pianist/coe5se-modding-tools/blob/85643c49810b502767b37aa663fe34885ad90cdd/vscode-extension/data/tables.json) · 5.43 row names (local evidence) · Native mode-2 references by weapon ID (local evidence)

| Mode-2 flight ID | Documented label |
| --- | --- |
| 62 | Poison Cloud (fly) |
| 63 | Poison Breath (fly) |
| 65 | Fireball (fly) |
| 95 | Fiery Breath (fly) |
| 97 | Icy Breath (fly) |
| 118 | Cloud of Death (fly) |
| 126 | Wither (fly) |
| 130 | Black Cloud (fly) |
| 134 | Weakness (fly) |

The desktop host checks and reconstructs the private fixture from the native source. The helper reads the resolved attack row, payload and private record IDs, then checks the loaded weapon's mode, flight ID and impact ID. For particle flight, it compares the live effect names to the expected flight and optional impact names before opening and again before battle. Missing or mismatched rows stop the test with a reason. The SDK's `lookName` reads the name at an effect row and returns nil for an empty name or an out-of-range ID. Availability of a name alone supplies no visual evidence. [Pinned CoE5SE field and effect-name implementation](https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/src/lua_test_battle.h)

## What ran

The actual Windows app searched **icy**, selected #97, kept the previously selected Flame impact and piercing damage, prepared the package and launched it. Native settings were range 5, initiative 5, base damage 0, pierce #3 and area 0. The regular ranged attack on the new private carrier used payload 8. The target was one Spearman. Native deployment controlled distance. The four packaged text files were regenerated from identical source after validation. Exported native weapon (local evidence) · Test mod with private carrier (local evidence) · Field before battle (local evidence) · Aftermath (local evidence)

Recording started before the battle. The game window alone was recorded at 1100 × 800 with 2,520 encoded frames at 60 fps. The excerpt uses frames 905–1264 at normal speed. The frame references above are zero-based indices in the full capture. The capture backend could not guarantee a minimum update interval. The visible motion and flash are enough to identify both phases, but these timings do not measure the engine's frame rate. The post-exit Workbench note was entered after frame review. Side-by-side crops (local evidence) · Observation note (local evidence)

Session `e54a5ad4b85c48e7982730770ad4322b` used a new profile and runtime. Game build was `6aec6a32-13728000`. All 14 game/extender inputs and all 19 prepared files matched their hashes after exit. All 46 inventoried metadata files from earlier sessions matched preflight. The separate native export matched the tested draft byte for byte. Launch (local evidence) · Integrity checks (local evidence)

## Offline checks and limits

- **221/221 JavaScript tests passed.** New cases cover all nine flight choices with omitted and explicit impacts, source preservation, partial-name selection, cancel, pending creator values, conflicting runtime names, and unsupported combinations. Suite output (local evidence)
- **26/26 compiled checks passed** with this ranged candidate and the previous melee candidate. The retained sprite package and a different particle weapon with no impact each passed **21/21** host checks in separate overlapping runs. All four text files of each real melee, sprite and particle candidate regenerated byte for byte. Host (local evidence) · Sprite (local evidence) · No-impact particle (local evidence) · Replay (local evidence)
- The pinned Lua mock passed **18 particle**, **15 sprite** and **9 melee** error/cleanup cases. An alternate particle with no explicit impact passed 16. These checks cover wrong mode, ID, missing/renamed effects and field refusal or cleanup. Particle (local evidence) · Sprite (local evidence) · Melee (local evidence) · No-impact (local evidence)

Only **Icy Breath #97 + Flame #68 + piercing #3** was observed here. The other eight supported particle effects have documented and native-record evidence plus offline checks. Other modes, additional impacts, sound, special payloads and area or multi-row attacks remain outside this private test. An omitted impact means no explicit native impact setting. The native export can be integrated separately into a mod. The observation field requires CoE5SE. 

