# Review of the user's v0.9 weapon-editing test

Reviewed 2026-11-06. This is a read-only review of an existing user-operated run, not a new game test.

Source session: `%LOCALAPPDATA%/CoE5Workbench/Tests/b1f8167e6d68449681875879a38c46e2/`.

## Identity and integrity

- Workbench v0.9, `WB_Test_mw4wzzad`, `.c5se`, spell **Waterball Test**, associated new weapon **Waterball test**.
- Exact prepared revision: `0b8678ed69bbff06702bf73767f18094356ee54bd1b3bcd251632483504fc61b`.
- CoE5 5.43 / official CoE5SE 2.13.0. All **20 staged runtime/mod hashes** recorded in the session still match; the extender's game-code check reports a match. Executable SHA-256: `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55`.
- Session status exited, PID 29728, recorded exit code 0. `candidate.json`, `session.json`, `runtime/log.txt`, `runtime/coe5mod.log` were copied locally as evidence. `analysis.json` records 32 original file fingerprints; the final preservation audit confirms all 32 remain unchanged.

## Actual retained logs

The extender log records:

1. 12:53:06.166 CET: owned field opened, caster Spearman #13, spell #1029, enemy Spearman #13, count 3.
2. 12:54:28.887: field closed and reopened with the same participants/count.
3. 12:55:14.617: final field closure.

The game log records exactly **two** `Spearman casts Waterball Test` entries. Type-3 hits from weapon **Waterball test**, spell damage 8, produced 3 damage in the first sequence and 1/4/1 in the second. The log ends with normal SDL/GL shutdown. No duplicate-cast defect is inferred from these intentional user actions.

## User observation versus recorded data

The user's screenshots/report describe initial type 4 / area 0, accepted revision 1 at type 3 / area 1 followed by a cast, then revision 2 at type 3 / area 5 followed by a cast, closure and exit. These values are user-reported/screenshot evidence. They were not independently observed by this implementation agent.

There are **no `wb_weapon_edit` messages** in this retained `coe5mod.log`. CoE5SE's pinned API/source shows `coe5.log`/redirected print depend on **Enable copious logs**, which is off by default. Earlier assumptions that detailed parameter/readback/restoration messages were guaranteed are corrected in v0.10 documentation.

The logs independently establish two casts, piercing damage and field/process lifecycle. They do **not** independently establish area revisions, exact readback, baseline weapon restoration, visual/audio accuracy or general combat behavior. The first sequence hitting fewer targets than the second is not used to prove an area code.

## Consequence for version 0.10

The session supports the usefulness of the bounded editing loop. It has no structured result file because its old helper did not implement one. The new host can verify this exact old candidate **read-only** and offer a clearly labeled manual return, without accepting its helper for a new launch. Native checks exercise that actual association and confirm no original session record changes.

Version 0.10's **Save test values**, catalog export and return/review/stage UI were tested offline only. No new gameplay pass is claimed. See `docs/RETURN-AND-CHOICES-010.md` and `research/return-choices-010/REPORT.md` for the new workflow and remaining user-operated acceptance.

No game or input automation was used, no new game session was started, and no original game/profile/save/mod/Script Extender/research evidence was changed or published.
