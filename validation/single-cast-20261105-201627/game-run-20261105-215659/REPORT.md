# Prepared single-cast validation: interrupted run

**Follow-up, 6 November 2026:** The user clarified that their own interaction caused the duplicate casts. They are **not evidence of a workbench defect**. The controlled exactly-once test remained incomplete; loading and logged damage were established. The unresolved-cause wording below records what was known when the run stopped and is superseded by this clarification. A user-operated follow-up is prepared in `../MANUAL-TEST.md`; no new game has been launched during that preparation.

Re-reading the final saved logs on 6 November found **three** custom-spell cast lines (damage 10, 2 and 5), three field-open events and two field-close events. The two-cast account below reflects the earlier point-in-time inspection, not the complete final log. These additional user interactions do not establish a workbench defect or a controlled exactly-once pass.

Work stopped at the user's request on 5 November 2026. No further game testing is authorized by this checkpoint.

**Outcome: FAILED to satisfy the controlled exactly-once validation.** Content loading succeeded, but two casts were logged across two field openings. The cause of the unexpected input/casts remains unresolved. Do not repeat the cast or label this a passing single-cast test without reviewing this evidence.

## Compatibility and isolation

- The existing isolated CoE5 5.42 / CoE5SE 2.12.0 pair was reused. All 14 prepared runtime file hashes matched; the package and extracted mod were unchanged. See `preflight.json`.
- Game SHA-256: `aef4fe703637bedf098b2b97b3c4bb43bba09c9691788724b6e66e679dc6af77`.
- The current Steam executable remained the separate 5.43 installation. It was not launched or replaced.
- Process-local COE5_SAVE selected only the prepared disposable profile; COE5_DATA read the installed data directory.
- No CoE5 process existed at initial preflight. Owned session PIDs: 24544 (sandbox bootstrap), 27304 (interactive bootstrap), 39684 (extender/test session). Only owned processes were stopped.

## What was observed

1. The first sandbox-desktop launch could not be captured or controlled reliably. It was stopped. An approved interactive-desktop launch used the same runtime and isolated profile.
2. CoE5SE was enabled in the disposable profile through the game menu; that bootstrap session exited and wrote its own config. Restarting loaded the extender. The main menu showed version 5.42 and Mod Settings.
3. Enabling the prepared WB mod registered spell 1029, weapon 1200, its Lua hooks and its main-menu entry. The log records `spell_added ... name=WB Val 201627 Spark ... dmg=15` and the exact test-mod Lua script. See `01-test-menu.png` and `final-coe5mod.log`.
4. The prepared test field opened with one Spearman on each side. `02-field-before.png` is the actual initial field image.
5. Before any deliberate Cast once action was sent, a later field image showed damage/healing messages. The game log records the custom spell attacking with the custom weapon, 10 fire damage, and target death. The displayed target was subsequently present again; do not equate the transient death log with a persistent dead target. `04-result-observed.png`, `05-result-later.png` and `field-before-close-game.log` preserve this evidence.
6. No deliberate Cast once action was sent afterward, to avoid adding another cast. The 25-second no-audio recording `03-single-cast.mkv` exists, but its name does not establish a controlled cast or prove that the initial projectile was captured. Its frames were not reviewed before work stopped.
7. A click on Close test returned to the main menu (`06-field-closed-main-menu.png`). The extender logged `test_field_closed x=1 y=1` at 23:11:34 local time. This verifies visible closure and execution of the cleanup routine, not every internal restoration.
8. During the subsequent quit attempt, Computer Use reported new user input. Logs show the WB menu entry activated again at 23:11:44 and another field opened. The game log records a second custom spell attack, for 2 damage. No deliberate second cast was requested. The cause is unresolved; do not attribute it to the user, the workbench or the recorder without further evidence.
9. A fresh observation showed another desktop panel over the game. UI input stopped. `07-unexpected-reopened-field.png` contains that interruption rather than a clean field result and should not be used as a showcase image.
10. Only owned PID 39684 was terminated after checking its exact isolated executable path. The first stop attempt lacked access; approved termination succeeded. `process-cleanup-final.json` confirms PID 39684 gone and zero remaining CoE5 processes. A graceful final Quit and a second normal Close test were not verified.

## Preservation and remaining work

- `preservation-check.json`: all 337 tracked protected external files unchanged; all 110 normal-profile file size/mtime records unchanged; package SHA-256 still `3c4d56c849ebd1d2f3985504a31286d2ad86c8ff558f9f333db2afa0fc9cac05`.
- No workbench implementation, existing mod, game binary, normal profile or campaign save was intentionally changed. Only the disposable profile's settings/mod state and local evidence were written. Nothing was pushed or published.
- A targeted read of the pinned test-field implementation and recorder source began, but no concrete workbench defect or root cause was established. No fix was made and no new regression suite was run.
- Before another authorized run, review the two cast log sequences and the capture/input chronology. Establish why a cast occurred without a deliberate Cast once action and why the quit attempt reopened the field. Resolve input ownership and targeting before any further gameplay test.
- This run does not establish ordinary combat behavior, caster eligibility, AI, actual range, timing, learning, saves, sound or visual accuracy. It establishes that this compatible isolated runtime loaded the custom definition and produced logged damage through the experimental field, with unreliable exactly-once control.

The earlier reports remain historical offline/preflight records. This report records the subsequent actual game run.
