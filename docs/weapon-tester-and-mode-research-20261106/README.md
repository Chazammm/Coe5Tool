# WeaponTester and Vanilla mode research

Research completed 6 November 2026 for Workbench **0.8.0**, with CoE5SE **2.13.0** source pinned to `9e22d27c32ee15392fc370027d00dbc750b5d19b`. This is an implementation plan; the application has not changed.

The most useful finding is a smaller iteration loop: WeaponTester writes supported values into a weapon owned by its own mod, reads them back, and fires in an already running test field. The current extender exposes the necessary weapon-write and field APIs. This supports investigating **in-game weapon parameter editing**, not promising desktop synchronization, arbitrary file reload, or new-spell hot reload. WeaponTester's spell mode selects an existing spell and edits its associated weapon through a temporary substitution. It does not author a new spell's path, level or damage assignment. See the investigation (local evidence).

The next desktop improvement should be an explicit **Vanilla / CoE5SE target**, independent of the existing `.c5m / .c5se` source interpretation. Begin with a small Vanilla weapon creator. New linked spells and the existing experimental field remain CoE5SE features. Inspecting a mixed file must preserve it without certifying its whole behavior as Vanilla. See the capability matrix (local evidence) and proposed workflow (local evidence).

The supplied guide is valuable because it checks file, command context and arguments, rather than keywords alone. One correction is necessary: its opening says 2.13.0 / 5.42, but the release source identifies **5.43** as the supported build. This review uses the latter pair. The exact version evidence and qualifications are in the source register (local evidence).

## Evidence and its limits

- **Observed previously:** the Waterball acceptance report (local evidence) records the integrated isolated `.c5se` flow, one cast, 4 piercing damage, field closure and exit code 0 on 5.43 / 2.13.0. It contains no effect screenshot or audio assessment. An earlier combined `.c5m` test (local evidence) separately records a projectile, impact and 4 fire damage.
- **Source established:** WeaponTester reads loaded weapon/spell data, edits a scratch weapon, offers Fire/Fight/Reset, and exports weapon definitions or changes. Its legacy dependency guard is still recognized in 2.13.0.
- **Untested:** the supplied, unversioned WeaponTester on the current runtime, its export round trips, stand-in Fight refresh, error-path restoration, effect/sound annotations and any speed improvement. Source analysis is not a gameplay pass.
- **Proposed:** the target selector, Vanilla weapon creation, compatibility diagnostics and a later bounded in-game editing helper. None is implemented here.

## Documents

1. WeaponTester investigation and comparison (local evidence)
2. Vanilla and CoE5SE capability matrix (local evidence)
3. Target selector and example workflows (local evidence)
4. Prioritized implementation and validation (local evidence)
5. Questions for musical_pianist (local evidence)
6. Exact sources and evidence (local evidence)

The ZIP was inspected in memory, without extraction, installation or execution. No supplied code or archive is reproduced here. No game was launched or controlled, and no application, runtime, mod, save or normal-profile file was edited. Preservation checks (local evidence) compare the original 54-file Workbench baseline and both supplied inputs. This was a separate self-review, not an independent agent review. Existing test results are cited; application tests were not rerun for documentation-only work.
