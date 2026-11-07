# Prepared single-cast validation · resumed preflight

**Outcome: BLOCKED before launch.** Checked on 5 November 2026 at approximately **22:39 CET (Europe/Berlin)**.

The existing report was read, and the existing package/profile were reused for verification. No earlier research, package generation, game update or installation was repeated.

## Gates

| Check | Finding |
|---|---|
| Prepared runtime | All **14 staged runtime/support files** still match runtime-preparation.json. |
| CoE5 executable | Still matches the prepared **5.42** profile: timestamp `0x6ada0282`, image size `0x13728000`, .text SHA-256 `d39ea78899effadc76a0214b2eb5c8bcbd4aac5991f7862aaccb48a99ff4bfa8`. |
| CoE5SE | Staged **2.12.0** loader/plugin/stub hashes remain unchanged from the previously verified compatible pair. |
| Existing test ZIP | SHA-256 still `3c4d56c849ebd1d2f3985504a31286d2ad86c8ff558f9f333db2afa0fc9cac05`. No replacement package was created. |
| Existing game processes | Get-Process found **zero CoE5 processes**. No user game/profile was accessed for play. |
| Desktop availability | The standard automation probe reported 0.1 seconds idle. A separate read-only Windows GetLastInputInfo/GetTickCount check succeeded and measured **17.234 seconds** since the most recent input. Desktop availability was therefore not established. |
| Disposable profile | Existing prepared profile retained; it still has no game-created coe5config. First-start setup would be needed when a safe interactive session is possible. |

The game-automation skill (local evidence) says: “If `idle` is under a minute, ask before driving.” The current user instruction is to **stop if the desktop is in use**. Recent input was detected, so the run stopped without starting or focusing a game and without requesting another desktop-control confirmation.

## Requested observations

| Observation | Result |
|---|---|
| Extender and test mod loaded | **Not attempted**. |
| Test field opened | **Not attempted**. |
| Field image before cast | **Not captured**; no field existed. |
| Cast once and visible result | **Not attempted or observed**; zero casts triggered. |
| Field closure / engine cleanup | **Not exercised**. |
| Test-process exit | No process was started, so none was stopped. |

No concrete workbench defect was established, and no workbench source, prepared mod, normal profile, save, approved release or Steam file was changed. Only this preflight evidence and the validation-folder resume pointer were written. No screenshots or simulated results are presented as gameplay evidence. Nothing was published or sent.

**Next action:** resume the existing prepared 5.42/2.12.0 test when the desktop is free. Recheck process/input availability, initialize only the disposable profile, and perform the already specified one-cast capture/close/exit sequence. A later successful field test would still not establish ordinary combat, AI, range, timing or save compatibility.

The measured file identities and desktop-probe values are recorded in preflight.json alongside this report. The previous full package audit remains in the parent validation folder.
