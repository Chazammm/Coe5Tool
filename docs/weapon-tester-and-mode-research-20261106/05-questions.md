# Questions for musical_pianist

These are discussion questions, not messages sent or blockers to completing the research. The supplied archive has no license/version metadata. Exact source references are in the investigation (local evidence).

1. **Version and terms:** what revision/game/SE pair was this WeaponTester intended for, and is there a newer canonical copy? May its Lua, `.c5m`, UI text or banner be reused or redistributed? Under what license, attribution and modification terms? Permission to inspect the supplied archive is not permission to ship it.
2. **Damage semantics:** which value should a weapon tester expose when the caster's attack assignment or a spell's `dmg` overrides weapon base damage? The Wizard assigns ranged damage 10, and spell mode leaves the spell record's damage unchanged.
3. **Stand-in semantics:** should Fight refresh a changed scratch record like Fire does? Is the copy-after-range-adjustment order intentional? Which external SE trait rules/`noexplode` state should stand-ins inherit, if any?
4. **Restoration and ownership:** what cleanup is guaranteed after a Lua error or refused open? Would a field ownership token/protected scope help prevent a helper from closing another helper's field?
5. **Export round trips:** what is the intended way to remove a chain or the last trait rule, and to preserve unchanged SE rules after `clearwspec`? Should selected weapons/chains use IDs where names duplicate? How should user-entered quotes/control characters be handled?
6. **Enumeration and labels:** is there a supported capacity/iterator contract for current weapon/spell tables, and a recommended caster for path 30 or custom paths? Which look/sound/flight annotations in this copy are still valid for 5.43?
7. **Guide and target validation:** may the guide header be corrected from 2.13.0 / 5.42 to the supported 5.43 pair? Which edge-case Vanilla outcomes have reproducible test fixtures, particularly false flags and the keyword-list exception? Is a native weapon-only target the preferred first desktop increment?
8. **Integration direction:** would an independently implemented, allowlisted in-game scratch editor be useful before considering any desktop connection? Is there an existing supported tool/transport we should investigate before designing one? No live synchronization is established by the supplied archive.
