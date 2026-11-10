# Mixed native target tests

**Distribution update (0.18 preview):** This is historical 2.13.0 workflow documentation. The current package/public tree excludes the derived roster DLL and extender core source; the tools MIT notice does not license the core. Existing private setups are preserved. New mixed preparations require a separately available, authorized private component. The new 3.2.2 [official fixed-field route](OFFICIAL-MIXED-0182.md) has separate closure semantics and pending game acceptance; it does not restore the legacy live-comparison feature. See [current compatibility and license correction](COE5SE-COMPATIBILITY-018.md).

The standalone melee/ranged test accepts 2–8 distinct native types, with positive counts totalling at most 200. Choose the first type and count, then **Add another type…**. Each row has its own count, **Change…** search and **Remove** action. Removing back to one type restores the released-extender workflow.

Mixed groups use **CoE5SE 2.13.0 + Workbench roster-v1 (local)**. The standard desktop build includes the pinned development plugin. It overlays that plugin only in a new mixed session. The configured game and release folder must still pass the existing 5.43 / 2.13.0 checks. Single-type tests continue to stage the released plugin.

Choose **Prepare test files**, **Prepare isolated session**, then **Start isolated test**. In the disposable game menu, open **WB test: your ID**.

- **Check cleanup** opens the requested roster and deliberately raises a Lua callback error. The native owner closes the field, restores its snapshots, and reports the outcome. It runs no battle.
- **Battle (AI)** verifies the carrier's private row, exact weapon fields and each spawned defender, then runs native AI combat. The receipt records each instance, native monster ID/name, pre-battle resistance and before/after HP.
- **Finish** returns to the main menu. Exit the isolated game. In Workbench, choose **Read mixed observation** to inspect the bound result, or **Open session & logs** for named attack evidence.

HP readings describe state. They do not identify the attacker or prove a hit. The damage type, area and visuals keep their own settings. Fixed mixed tests retain their existing helper. Export continues to write a separate native weapon fragment.

## Compare visuals against mixed defenders

For a supported ranged weapon, select **Compare visuals in game** before preparing the files. Catalog values outside the fixed subset require this comparison. Adding native types keeps that choice. The local roster-v1 dependency is unchanged; a single type continues to use the released extender.

1. Open **WB test: your ID** in the new isolated session. **Battle (fresh mixed group)** runs the prepared visual configuration.
2. Select **Sprite flight…**, **Particle flight…** or **Impact…**. Search by partial name or ID. Pending choices do not change the applied weapon; **Apply visuals** performs and checks the three private visual setters between battles.
3. Run another **Battle (fresh mixed group)**. It requests the same selected types/counts, checks every actual instance before fighting, and records individual HP/resistance readings. Each callback owns and restores its own field. IDs may be reused after rollback and belong only to that battle.
4. **Finish** checks restoration of the original weapon visuals and returns to the main menu. Quit the isolated game and refresh Workbench status.
5. **Review saved test values** opens the battle selector. Expand **Defenders per battle** to inspect the selected sample. Explicitly choose visual values, resolve any newer-edit conflicts, apply to the draft and export a separate copy.

Supported comparison flight modes remain sprite 1 and standard particle 2, with the existing pinned 5.43 role catalog and runtime identity/native-reference checks. An entry's presence does not guarantee a particular appearance. Impact, flight, damage type and area stay separate. The helper saves up to 32 completed battles per launch. It writes only the private weapon and does not mutate during combat. A changed definition, payload, roster or damage/area setting requires a new session.

A battle saves only after the roster owner reports field closed and records restored. Callback/identity/battle/save errors abort the comparison and attempt private visual restoration. **Check cleanup** exercises a deliberate callback cancellation without saving a battle. The result uses a separate mixed schema; the host and browser both validate the original roster, each per-battle ID set, scalar readings, revisions, visual values and cleanup. Review verifies the pinned local overlay. Old fixed receipts and released-extender comparison results retain their own contracts.

The desktop now shows a compact per-battle defender table with net HP change, available resistance readings, cleanup state and explicit unknown hit/position information. Fixed mixed observations use the same view. [Recorded results and API investigation](BATTLE-RESULTS-016.md).

The desktop result establishes helper readback and a completed battle call. It does not establish a hit, attacker, effect appearance or resistance formula. Use the combat log and recorded frames independently. Mixed melee visual editing, waves, mod-added targets and arbitrary special payloads are not supported.

[The first two-configuration run](../validation/mixed-visual-comparison-20261108-3153f3/REPORT.md) used area 0 and did not establish normal Quit. A later [area-5 mixed comparison](../validation/mixed-area-manual-20261108-724df2/REPORT.md) logged one named attack damaging both Spearman and Levy instances in each of two battles. Both fields restored their records, Finish returned to the main menu, and clicking the visible Quit text ended the owned process with code 0. Desktop return/export changed only impact 34 → 68. This is one bounded observation, not general area/VFX compatibility. Click the Quit label itself; automated clicks in the right side of its displayed row did not exit in that run.

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
