# Mixed native target tests

The standalone fixed melee/ranged test accepts 2–8 distinct native types, with positive counts totalling at most 200. Choose the first type and count, then **Add another type…**. Each row has its own count, **Change…** search and **Remove** action. Removing back to one type restores the released-extender workflow.

Mixed groups use **CoE5SE 2.13.0 + Workbench roster-v1 (local)**. The standard desktop build includes the pinned development plugin. It overlays that plugin only in a new mixed session. The configured game and release folder must still pass the existing 5.43 / 2.13.0 checks. Single-type tests continue to stage the released plugin.

Choose **Prepare test files**, **Prepare isolated session**, then **Start isolated test**. In the disposable game menu, open **WB test: your ID**.

- **Check cleanup** opens the requested roster and deliberately raises a Lua callback error. The native owner closes the field, restores its snapshots, and reports the outcome. It runs no battle.
- **Battle (AI)** verifies the carrier's private row, exact weapon fields and each spawned defender, then runs native AI combat. The receipt records each instance, native monster ID/name, pre-battle resistance and before/after HP.
- **Finish** returns to the main menu. Exit the isolated game. In Workbench, choose **Read mixed observation** to inspect the bound result, or **Open session & logs** for named attack evidence.

HP readings describe state. They do not identify the attacker or prove a hit. The damage type, area and visuals keep their own settings. This slice supports the existing fixed melee/projectile subset and area codes 0–5. Mixed live visual editing and automatic return of mixed test values are unavailable. Use a single type for the existing visual-comparison return workflow. Export continues to write a separate native weapon fragment.

## Local native API

The complete source and build tools live in [the development folder](../local-extender/roster-v1/README.md). The release extraction is preserved.

`coe5.withTestFieldRoster(carrierId, groups, callback)` accepts 1–8 groups and up to 200 defenders in total. Each group has integer `monster` and `count` fields. It requires the main menu and no open field. It returns true on successful callback completion and cleanup, or false plus the Lua error/refusal. Invalid arguments can raise a Lua argument error before any allocation.

The callback receives an array of `{unit, monster}` entries in request order. These instance IDs are live only within the callback. Store copies as observation evidence, rather than retaining them as live references after cleanup.

```lua
local ok, why = coe5.withTestFieldRoster(carrierId, {
  {monster=609, count=2},
  {monster=487, count=1}
}, function(units)
  -- Inspect the allocated IDs here. The native owner will close the field.
  coe5.fightTestField()
end)
```

The callback is intended for field operations and read-only inspection. Generic world/map writes inside it fall outside this cleanup contract.

The native owner uses the field's existing direct allocation primitives. It rejects partial allocations, runs the callback under a protected Lua call and closes/restores on callback errors. It snapshots the unit/commander records and counts, square/army/team state, map dimensions, active player and the field's battle location/control globals. Nested field openings are refused while the roster owner is active. Generic map spawning is not used.

`coe5.testFieldRosterStatus()` returns `version=1`, `open` and `restored`. Restoration covers the explicitly snapshotted records and globals. It is not a whole-engine snapshot. The receipt and log expose its measured result.

The local extension is Windows-only. It has no verified battlefield position getter. The SDK supplies a `RVA_BATTLE_UNIT_POSITION` function address without a confirmed read-only calling contract. This implementation does not call it or substitute world-map coordinates. Setup and impact locations can still be inspected in game logs where those logs identify them.

See the [mixed validation report](../validation/standalone-mixed-20261107-193525/REPORT.md) for actual builds, process outcomes, partial-failure coverage and remaining limits.
