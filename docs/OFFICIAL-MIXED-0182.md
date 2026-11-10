# Official mixed-target field · 0.18.0-rc.2

**Newer optional route:** rc.3 adds a separate [official ranged visual-comparison preview](OFFICIAL-COMPARISON-0183.md). This document describes the preserved fixed helper, not that new comparison contract.

**Preview: one fixed ranged two-type game case passed, including desktop readback and normal exit; wider acceptance remains pending.** Uses the user's official **CoE5SE 3.2.2 / CoE5 5.43**, without a core modification or roster DLL.

## Supported slice

A supported standalone or selected native melee/ranged weapon can face **2–8 distinct eligible native types, 2–200 defenders total**, using one private carrier and **at most one native AI battle per launch**. Search by partial name or ID; each row keeps its type and count. The private attack payload, damage type, area and fixed visuals remain unchanged. Existing damage 1–6 / area 0–5 and fixed sprite/particle visual bounds remain; groups do not enable new damage/area codes.

Mixed 3.2.2 is **fixed configuration, read-only results**. If Compare visuals is selected, turn it off explicitly or return to one type for the existing live comparison. A source needing catalog-only comparison visuals cannot use this first fixed mixed fixture. No settings are silently substituted. Edit/export remain available; prepare a fresh mixed test after changing the weapon. New mixed visual return/iteration is not implemented here; previous single-type and private 2.13.0 comparison/return routes are preserved.

## Operator steps

1. Create/open a supported native weapon and choose its test action. Use the verified official 3.2.2 runtime. Choose one native target, **Add another type…**, set counts and leave **Compare visuals in game** off.
2. **Prepare game test** creates a disposable setup without launching. Check the displayed roster, payload and area; Start explicitly, or reopen via **Prepared tests… → Check before resuming**. Do not bypass a stale/used/runtime/active-game refusal.
3. In the displayed **WB test: …** menu, inspect the field and press **Battle (AI)** once. AI use is not guaranteed. The button cannot launch a second battle. **Stop / close** requests stop during combat; it is not a normal completed battle claim. Close before battle records cancellation.
4. **Close → main menu → Quit** normally. Keep Workbench open, refresh and inspect **Recorded mixed targets** under Prepared tests (or **Read mixed values** in the test bench).
5. Check names/instance IDs, setup and after-return/before-close cells, HP and available resistance readings. Report named weapon hits from the game log separately from visible effects. Net HP changes do not identify hits/attacker/damage. Do not replay used preparations.

## Verified API contracts

Pinned official source: [tag commit 20431a2](https://github.com/musical-pianist/coe5se/tree/20431a298d3b9cd0def6b82fee2b3fbaead9f08b), [API annotations](https://github.com/musical-pianist/coe5se/blob/20431a298d3b9cd0def6b82fee2b3fbaead9f08b/coe5.lua), [field allocation/lifecycle](https://github.com/musical-pianist/coe5se/blob/20431a298d3b9cd0def6b82fee2b3fbaead9f08b/src/lua_test_battle.h), [position getters](https://github.com/musical-pianist/coe5se/blob/20431a298d3b9cd0def6b82fee2b3fbaead9f08b/src/lua_get_set.h).

- Table-form open takes a commander and enemy groups and returns a boolean plus commander/friend/enemy unit arrays in group order. This helper supplies spell=-1/standIn=-1, no added friends and no shared-record replacement. It verifies the whole returned roster, owners, types and duplicate IDs before accepting it.
- The source allocator marks partial allocations dead and restores the borrowed square on allocation refusal. It does **not** supply a full unit/commander-record rollback receipt. False, missing/partial arrays and Lua errors abort the battle path; the helper attempts close after any open attempt and requires Quit rather than retry.
- Unit battlefield getters give top-left battle cells or nil off field. We read **setup** and **after battle return / before close**, not attack-time positions. Dead/off-field or unavailable values stay unknown. No positioning writes, generic map spawning or log-derived hit API are used.
- Close has no boolean/status receipt. The helper separately records attempted/returned close calls, main-menu readback and tracked inactive HP readings when available. These are not the old extension's restored=1. Close errors, menu mismatch or known surviving tracked units are errors. Full record/allocation rollback remains unestablished.
- The existing official add/move APIs were inspected but are not used. No mixed friendly groups, reinforcements/waves, mod-added defenders, repeated battles or summons tracking are promised.

## Receipt and failure handling

New `wb-official-mixed-1` data has its own strict parser. It binds source revision, session, launch, mode, roster, damage/payload and area; canonical Lua/runtime hashes are independently checked. Legacy `wb-mixed-1` and comparison schemas keep their original readers and restoration semantics. No session is migrated.

Opened or battle-returned receipts without close evidence remain explicitly incomplete. Cancelled and error receipts do not become successful battles. Partial identity verification displays only verified entries against the requested total. If the native call returns no array, exact allocation identities are unknown. Save failures remain visible errors/log evidence. A process exit alone is not a successful battle or closure. Stale snapshots can be reviewed against their original binding but cannot bypass resume checks.

The helper permits only one field entry per launch, protects an existing receipt, and never writes shared vanilla records or live visual fields. It catches normal Lua errors and attempts close; a native crash/out-of-memory termination cannot be given a cleanup guarantee. Private process/profile isolation bounds that risk.

## Bounded game evidence and remaining acceptance

The unchanged rc.2 ZIP completed one native AI battle against two Deer and one Winter Wolf: all three identities/setup cells read back, the named weapon hit the Wolf for 11 piercing damage, flight/impact were captured, Close/Quit/exit 0 and actual desktop review passed. After-return cells were unavailable and remained unknown. This did not establish area hits on both types. [Observed mixed-game evidence](../validation/official-mixed-0182-20261110/game-20261110/REPORT.md). Melee, other combinations and failure/stop paths still need separate acceptance. In a separate disposable preparation, close before Battle to check cancellation. Do not induce allocator exhaustion in a real game merely to test it; the partial/refused paths have API-model/native parser coverage.

A visual burst or lower HP does not establish area damage to multiple types. The earlier 3.2.2 Harbor Ember/Fireball evidence validates different helpers. See the [current report](../validation/official-mixed-0182-20261110/REPORT.md).

The older derived extension's independent [distribution-permission question](LEGACY-ROSTER-PERMISSIONS.md) does not authorize a new core port. No core binaries/source are included.
