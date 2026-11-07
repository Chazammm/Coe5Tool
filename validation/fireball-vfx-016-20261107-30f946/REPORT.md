# Vanilla Fireball visual validation

**Passed on 7 November 2026.** One native AI battle in the Windows v0.16 Workbench observation field produced two Fireball casts. The game-window recording shows travel and impact for both. Play the eight-second clip (local evidence).

## What the game showed

The Pyromancer stood on the left. A narrow yellow-white streak moved horizontally toward the Spearman on the right, trailing orange sparks that faded behind it. On arrival, bright patches of flame covered the target square and neighboring squares. The first burst had a cross shape around a red 3. The second had a different arrangement around a red 5, followed by the Spearman's death. The fire pattern describes the pixels captured here. It does not identify which neighboring squares would have taken damage.

| AI event | Representative time in the short clip | Full capture frame (zero-based) | Independent evidence |
| --- | --- | --- | --- |
| Round 0, first cast | Flight at 1.883 s (local evidence), impact at 2.133 s (local evidence) | 1553, 1568 | Game log lines 187, 193-203 identify spell 445, Pyromancer, Fireball against Spearman, and 3 damage. The impact frame also shows the matching battle text. |
| Round 1, second cast | Flight at 5.367 s (local evidence), impact at 5.700 s (local evidence) | 1762, 1782 | Game log lines 215, 223-232 identify the same spell and participants, 5 damage, then death. |

These timestamps identify representative frames. The game debug log supplies event order rather than video timestamps. The on-screen cast messages, damage numbers and round transitions tie the two records together. Game log (local evidence) / Frame sequence with full-capture timestamps (local evidence).

## Session and capture

- Used the actual Workbench to load the installed 5.43 catalog, select spell **Fireball #445**, and prepare a new disposable CoE5SE 2.13.0 original-record observation against one Spearman. The running game offered 33 eligible native casters. Selected **Pyromancer #55**. Picker (local evidence) / Field before battle (local evidence).
- Session `04b6faaeda6f4d6fb08c39b3e174fb2a`, mod `WB_Observe_mw66l8ki`, helper run `98ad012312de4136a6fd48489e4c2b0f`. Used **Battle (AI)** once. The bound helper records `battles=1`, `forcedcasts=0`, `spell=445`, `weapon=54`, `caster=55`. The two casts are established by the game log. Bound helper result (local evidence).
- Captured only the isolated game's client area, with recording active before the battle. The continuous recording (local evidence) decodes to 2,520 frames at 1100 x 800, 60 fps, over 42 seconds. The short clip contains full frames 1440 through 1919 at original playback speed, without audio. The four stills are full-frame PNGs taken from the continuous recording. The capture backend warned that the minimum update interval was unavailable. The actual flight and impact are visible over multiple frames, but the recording does not measure the engine's animation timing.
- **Close** returned to the main menu (local evidence). **Quit** exited the session's copied game process (PID 16036, exit code 0). The helper reported `stage=closed` and `knownunchanged=1` for the numeric fields it checks. Saved the reviewed visual outcome in this new session. Session (local evidence) / Saved observation (local evidence).
- The game and extender matched all 14 reference runtime input hashes before and after the run. All 19 prepared runtime and mod files in the new session matched its manifest after exit. The session used its own profile and copied runtime, with the installed game data read from its normal location. Launch record (local evidence) / Hash and media checks (local evidence).
- The bottom-center controls left the lower-left cast and damage text visible in this run. No new user-facing consistency issue was identified. No Workbench implementation or checklist change was needed.

## Next step for standalone weapons

Prototype one disposable carrier with a custom standalone melee weapon in its first attack slot and an explicit attack damage payload. Verify the slot resolves to the private weapon, then check whether native AI uses it against one target in the combat log. The Fireball run establishes the appearance of this native spell in the CoE5SE observation field. Standalone weapons, ordinary campaign behavior, other targets, audio and Vanilla-only testing remain outside this run.
