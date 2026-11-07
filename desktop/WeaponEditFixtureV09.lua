-- Workbench weapon-edit-v1. Independently implemented; CoE5SE 2.13.0 only.
-- Contract: https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/coe5.lua
-- The canonical test mod's associated newweapon is its own scratch record. No standIn or shared weapon writes.
local spell_name, weapon_name = {{SPELL}}, {{WEAPON}}
local caster_name, enemy_name, mod_id = {{CASTER}}, {{ENEMY}}, {{MODID}}
local initial_type, initial_area = {{DMGTYPE}}, {{AOE}}
local active, request, held, hooks_ok = false, nil, false, false
local pending_type, pending_area, applied_type, applied_area, parameter_revision
local notice = ""
local function report(text)
  if type(coe5.showMessageBox) == "function" then coe5.showMessageBox("Workbench experiment", text) else print(text) end
end
local function log(action, detail)
  coe5.log("wb_weapon_edit mod=" .. mod_id .. " action=" .. action .. " source_snapshot=fixed parameter_revision=" .. parameter_revision .. " " .. (detail or ""))
end
local function valid_values(damage_type, area)
  return (damage_type == 3 or damage_type == 4) and type(area) == "number" and area % 1 == 0 and
    (area == 0 or area == 1 or area == 5 or area == initial_area)
end
local function resolve()
  local spell_id, weapon_id, matches, weapons = nil, nil, 0, 0
  for id = 0, 4095 do
    local info = coe5.spellInfo(id)
    if info and string.lower(info.name) == string.lower(spell_name) then
      matches = matches + 1
      if info.path ~= {{PATH}} or info.level ~= {{LEVEL}} or info.dmg ~= {{DAMAGE}} then error("Loaded spell differs from the prepared source.") end
      spell_id, weapon_id = id, info.weapon
    end
  end
  for id = 0, 6998 do
    local name = coe5.get("weaponName", id)
    if name and string.lower(name) == string.lower(weapon_name) then weapons = weapons + 1 end
  end
  if matches ~= 1 or weapons ~= 1 or coe5.get("weaponName", weapon_id) ~= weapon_name then
    error("Spell or scratch weapon is missing, ambiguous or relinked. Regenerate with unique names.")
  end
  return spell_id, weapon_id
end
local function run_test()
  if active then return end
  local opened, wrote, weapon_id, baseline_type, baseline_area = false, false, nil, nil, nil
  parameter_revision = 0
  local function read_values()
    return coe5.get("weapon", weapon_id, "dmgtype"), coe5.get("weapon", weapon_id, "aoe")
  end
  local function write_and_check(damage_type, area)
    if not valid_values(damage_type, area) then error("Unsupported experiment values. No cast performed.") end
    wrote = true -- A later call can fail after an earlier field was written.
    coe5.set("weapon", weapon_id, "dmgtype", damage_type)
    coe5.set("weapon", weapon_id, "aoe", area)
    local accepted_type, accepted_area = read_values()
    if accepted_type ~= damage_type or accepted_area ~= area then
      error("Write rejected or readback differs: requested type=" .. damage_type .. " area=" .. area .. "; read type=" .. tostring(accepted_type) .. " area=" .. tostring(accepted_area) .. ". No cast performed.")
    end
    return accepted_type, accepted_area
  end
  local function close_owned()
    if opened then
      opened = false -- One close attempt for this successful open, including failure paths.
      coe5.closeTestField()
      log("field_closed")
    end
  end
  local ok, reason = pcall(function()
    if not hooks_ok then error("Required experiment APIs or UI hooks are unavailable. Use supported CoE5SE 2.13.0.") end
    if coe5.get("activePlayer") ~= -1 then error("Open the experiment from the main menu, with no game loaded.") end
    local caster, enemy = coe5.findMonster(caster_name), coe5.findMonster(enemy_name)
    if caster == nil or enemy == nil then error("Caster or target monster was not found.") end
    local spell_id
    spell_id, weapon_id = resolve()
    baseline_type, baseline_area = read_values()
    if baseline_type ~= initial_type or baseline_area ~= initial_area then error("Scratch baseline differs from the prepared source. Stop and inspect other mods.") end
    pending_type, pending_area, applied_type, applied_area = baseline_type, baseline_area, baseline_type, baseline_area
    local function open_owned()
      if not coe5.openTestField(caster, spell_id, enemy, {{COUNT}}) then error("Field open refused. Check coe5mod.log; another field may be open.") end
      opened = true
      log("field_opened", "weapon=" .. weapon_id)
    end
    open_owned()
    active, held, request = true, false, nil
    notice = "Baseline loaded. Select settings, then Apply. Desktop source stays unchanged."
    while active do
      coe5.drawTestField()
      local action = request; request = nil
      if action == "close" then break
      elseif action == "type" then
        pending_type = pending_type == 3 and 4 or 3
        notice = "Pending settings only. Apply before casting."
      elseif action == "area" then
        if pending_area == 0 then pending_area = 1
        elseif pending_area == 1 then pending_area = 5
        elseif pending_area == 5 and initial_area ~= 0 and initial_area ~= 1 and initial_area ~= 5 then pending_area = initial_area
        else pending_area = 0 end
        notice = "Pending settings only. Apply before casting."
      elseif action == "apply" then
        applied_type, applied_area = write_and_check(pending_type, pending_area)
        parameter_revision = parameter_revision + 1
        log("applied", "dmgtype=" .. applied_type .. " aoe=" .. applied_area)
        notice = "Readback accepted: type " .. applied_type .. ", area " .. applied_area .. ". Session-only revision " .. parameter_revision .. "."
      elseif action == "cast" then
        if pending_type ~= applied_type or pending_area ~= applied_area then
          notice = "Unapplied settings: use Apply first. No cast performed."
          log("cast_blocked", "pending_settings")
        else
          local actual_type, actual_area = read_values()
          if actual_type ~= applied_type or actual_area ~= applied_area then error("Scratch values changed after Apply. No cast performed.") end
          log("cast_requested", "dmgtype=" .. applied_type .. " aoe=" .. applied_area)
          coe5.fireTestField()
          log("cast_returned")
          notice = "Cast returned. Observe the field/log; Reset targets before comparing another cast."
        end
      elseif action == "reset" then
        close_owned()
        open_owned()
        notice = "Fresh targets. Applied settings retained; pending settings still need Apply."
        log("targets_reset")
      end
    end
  end)
  active, request = false, nil
  local closed, close_reason = pcall(close_owned)
  if not closed then ok, reason = false, "Field cleanup failed: " .. tostring(close_reason) end
  if wrote then
    local restored, restore_reason = pcall(function()
      write_and_check(baseline_type, baseline_area)
      log("baseline_restored", "dmgtype=" .. baseline_type .. " aoe=" .. baseline_area)
    end)
    if not restored then ok, reason = false, tostring(reason or "") .. " Baseline restoration failed: " .. tostring(restore_reason) end
  end
  if not ok then
    if type(coe5.log) == "function" then pcall(log, "error", tostring(reason)) end
    report(tostring(reason))
  end
end
local buttons = {
  {"type", 16, 110, 225, 32}, {"area", 253, 110, 225, 32},
  {"apply", 16, 65, 115, 32}, {"cast", 143, 65, 130, 32},
  {"reset", 285, 65, 160, 32}, {"close", 457, 65, 135, 32}
}
local required = {"wrap", "get", "set", "log", "findMonster", "spellInfo", "openTestField", "drawTestField", "fireTestField", "closeTestField"}
local available = coe5.ui ~= nil
for _, key in ipairs(required) do if type(coe5[key]) ~= "function" then available = false end end
if available and type(coe5.ui.drawRect) == "function" and type(coe5.ui.drawText) == "function" then
  local draw = coe5.wrap("BATTLE_DRAW", function(next)
    next()
    if not active then return end
    coe5.ui.drawRect(12, 36, 800, 150, 0.08, 0.12, 0.15, 1)
    coe5.ui.drawText(22, 163, 16, "Weapon editing experiment | fixed source | parameter revision " .. parameter_revision, 1, 1, 1, 1)
    local labels = {type="Type: " .. pending_type .. (pending_type == 3 and " piercing" or " fire"), area="Area code: " .. pending_area,
      apply="Apply", cast="Cast once", reset="Reset targets", close="Close test"}
    for _, b in ipairs(buttons) do
      coe5.ui.drawRect(b[2], b[3], b[4], b[5], 0.16, 0.23, 0.28, 1)
      coe5.ui.drawText(b[2]+8, b[3]+8, 16, labels[b[1]], 1, 1, 1, 1)
    end
    coe5.ui.drawText(22, 43, 13, notice, 1, 1, 1, 1)
    coe5.ui.drawText(20, 18, 13, "Forced item-style cast; some ranges extended. Not normal combat, file reload or desktop synchronization.", 1, 1, 1, 1)
  end)
  local wait = coe5.wrap("BATTLE_WAIT", function(next, block, mode)
    local id = next(block, mode)
    if not active then return id end
    local down = coe5.get("mouseButtons") == 1
    local x, y = coe5.get("uiPointerX"), coe5.get("uiPointerY")
    for _, b in ipairs(buttons) do
      if down and x >= b[2] and x <= b[2]+b[4] and y >= b[3] and y <= b[3]+b[5] then
        if not held then request = b[1] end
        held = true; coe5.set("mouseButtons", 0); return 0
      end
    end
    held = down
    return id
  end)
  hooks_ok = draw == true and wait == true
end
if type(coe5.addMainMenuButton) == "function" then coe5.addMainMenuButton({{MENU}}, run_test)
else print("Workbench experiment requires CoE5SE 2.13.0 and a supported game build.") end
