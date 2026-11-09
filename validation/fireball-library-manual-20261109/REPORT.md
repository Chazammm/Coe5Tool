# Fresh Vanilla Library Fireball observation · manual handoff

Date: 9 November 2026, Europe/Berlin.

**Complete: the user delegated the run to the agent and the fresh Fireball observation passed.** One native AI battle produced two named casts (3 and 5 damage), recorded flight/impact, normal field closure and game exit code 0. The fresh summary was reviewed in the real app. See the [actual game report](agent-game-20261109/REPORT.md). This session is now used and must not be replayed. This continues the [rendered Vanilla Library verification](../vanilla-library-20261109/REPORT.md) through actual native isolated-session preparation, rather than only a file preview.

## Original preparation · historical preflight

- Opened the current source-built `build/desktop-0161-vanilla-library/CoE5Workbench.exe`, whose executable, assembly and tested UI hashes match the desktop-verified source build. The current GitHub source baseline is `e855d4710af95b7f9d1cefe52ea56d0ce40959c1`. The old 0.16.1 ZIP was not used.
- Started with **No source open**. Used **Vanilla library**, searched `#445`, and selected **Fireball spell #445**, not the unrelated weapon sharing that ID. The installed catalog shows its linked effect weapon #54. Opened **Observe original with CoE5SE…** and explicitly checked the default target **Spearman #13 × 1**.
- Clicked **Prepare test files**, then **Prepare isolated session** once. The native host accepted the canonical original-record package, compatible runtime and fresh owned destination. It enabled **Start isolated test**, displayed **prepared · no in-game observation recorded**, and stated that no game had started. No Start control was clicked.
- Fresh session: `162197df1ba9477bafc0d0551b4d6c6d`; mod: **WB_Observe_mw9sz4ad**. Exact main-menu entry: **WB test: WB_Observe_mw9sz4ad**. The caster is deliberately **Selected in game**; Pyromancer #55 must be offered and chosen there, not presumed to have spawned during preparation.
- The disposable profile has a supported copied settings file from the previous disposable setup, rewritten to enable only **CoE5SE** and **WB_Observe_mw9sz4ad**. The profile also contains exactly those two mod folders. First-time profile setup is not currently required; Start is labelled **Start isolated test**.
- Left Workbench open at this prepared test for the user. Ended computer-use interaction; the game was not launched. Keep this Workbench open during the run so it can collect the owned process's exit status.

## Offline checks after preparation

Verified all **14 source runtime hashes** against the pinned production allowlist, and the corresponding staged copies. CoE5 5.43 executable SHA-256 remains `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55`; the official 2.13.0 plugin/loader and supporting files match the same verified allowlist used by the app. All **19 staged input hashes** match the new session manifest. Prepared canonical text matches the staged files.

The manifest requests spell 445 / Fireball / installed provenance, native AI battle execution, one Spearman with explicit ID 13, and editable=false. It contains no reconstructed spell, weapon or monster. Inspected the exact helper: four-argument openTestField, native fightTestField, no shared spell/weapon setter, no forced fire, range extension or stand-in. This establishes the intended read-only route, not a gameplay observation or full-memory-equivalence claim.

Session state is **prepared**, stale=false, with no PID, start timestamp or result run. Of **1,081 pre-existing retained files**, only the expected `last-session.txt` pointer changed to the new preparation. All previous session files are byte-identical and none disappeared. **25 new files** are confined to the fresh session plus its unique claim. The installed executable and the old ZIP are unchanged. No normal profile, saves, user mod or source draft was opened for writes.

No implementation defect was identified and no source code changed in this preparation. Existing 289 script / 70 compiled checks remain prior evidence; they were not rerun merely for this documentation/handoff. This preflight performed the real native preparation and fresh-file checks above. Start will independently repeat the canonical source, ownership, runtime, staged-file and active-game checks; no check was bypassed.

Local-only evidence: `01-empty-draft.png` through `04-prepared-ready.png`, `prepared-accessibility.txt`, `before.json`, `preflight.json`, `session-prepared.json` and `candidate-prepared.json`. These contain local paths/metadata and are excluded from GitHub. Runtime copies and profile/session files stay in the owned local test storage, not this repository or a public package.

## Original manual instructions · historical, session now used

1. In the already-open Workbench, click **Start isolated test**. Leave Workbench open. If a safety check refuses, stop and report its text; do not use Steam or another profile as a substitute. Do not start/load a campaign.
2. In the isolated game's main menu, choose **WB test: WB_Observe_mw9sz4ad**. In **Choose a loaded native caster/carrier**, use **Search…**, enter `#55`, and select **Pyromancer #55** if offered. If it is missing or there is a load error, cancel and report that instead of choosing a substitute.
3. In the field, click **Battle (AI)** **once**. Watch for a named **Fireball** cast in the combat text; note projectile and impact separately. The AI may cast zero or several times, so one returned battle is not one cast. Do not use a forced attack or repeat the battle merely to obtain a visual.
4. After the battle, choose **Close**. If it is still fighting and must be stopped, use **Stop / close** and report that interruption. Once back at the main menu, click **Quit** normally. Do not merely close the window or stop the process.
5. Return to Workbench and click **Refresh status**. The helper saves its bound observation automatically; there is no Cast once or Save test values in original mode. Optionally expand **Record observation for spell #445 Fireball**, choose the outcome that matches what you actually saw, add notes and use **Save observation**. Those are your observations, separate from helper facts.
6. For the structured summary, close the test dialog, open **Prepared tests…**, search `162197df`, and select this exact Fireball session. Inspect **Recorded original observation**; a used test must not be replayed. If you close the app before starting, reopen the same source build, find this preparation under **Prepared tests…**, use **Check before resuming**, and start only if Ready.
7. Report: chosen caster/ID; whether Fireball was named in the log; whether flight and impact were visible; whether Close returned to the menu; whether normal Quit and Workbench Refresh completed; and any error. A screenshot is useful but not required. If Fireball was not used or the effect was missed, say so; that result is inconclusive for the missing observation.

## Planned analysis · now completed in the actual game report

Inspect the new session's launch identity, process status/exit code, bound context and `wb-original-<run>.ini`, plus its native log and any user screenshots/description. Keep battle-call returns, attempted/actual named casts, attack/damage evidence, visuals and user-reported outcome separate. Check original field readings before/after where available; the helper compares eleven numeric fields, not every record word or engine allocation. Compare retained-file/source/runtime hashes with this preflight. Confirm observed field closure and normal exit from their respective evidence; do not infer either solely from a saved value. No editable clone, shared-definition export or gameplay verdict is produced by preparation.

**Distribution:** documentation/handoff only. No new downloadable package was built or published. The local 0.16.1 ZIP remains unchanged (`ac07b8c11a9f26553aa99fd12647a074529f0d50d0b6245c1aa720ebacb4a8a8`) and does not contain the newer Vanilla Library source workflow.
