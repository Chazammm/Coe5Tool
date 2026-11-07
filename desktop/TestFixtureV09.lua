-- Experimental CoE5SE 2.13.0 test fixture. No automatic test on load.
-- Source contract: https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/coe5.lua
local spell_name, weapon_name = {{SPELL}}, {{WEAPON}}
local caster_name, enemy_name = {{CASTER}}, {{ENEMY}}
local active, request, held = false, nil, false
local hooks_ok = false
local function report(text)
  if coe5.showMessageBox then coe5.showMessageBox("Workbench test", text) else print(text) end
end
local function resolve_spell()
  local found, matches = nil, 0
  -- This pinned build asserts that every spell slot fits 12 bits. Nil slots are skipped.
  for id = 0, 4095 do
    local info = coe5.spellInfo(id)
    if info and string.lower(info.name) == string.lower(spell_name) then
      found, matches = id, matches + 1
      if info.path ~= {{PATH}} or info.level ~= {{LEVEL}} or info.dmg ~= {{DAMAGE}} then
        error("Loaded spell properties differ. Disable other mods and check the generated files.")
      end
      if coe5.get("weaponName", info.weapon) ~= weapon_name then error("Spell uses a different weapon.") end
    end
  end
  if matches ~= 1 then error("Expected one spell with this name; found " .. matches .. ". Use unique names.") end
  local weapons = 0
  for id = 0, 6998 do
    local n = coe5.get("weaponName", id)
    if n and string.lower(n) == string.lower(weapon_name) then weapons = weapons + 1 end
  end
  if weapons ~= 1 then error("Weapon name is missing or ambiguous. Use a unique name.") end
  return found
end
local function run_test()
  if active then return end
  local opened = false
  local ok, reason = pcall(function()
    if not hooks_ok then error("Required test-field/UI hooks unavailable. Check CoE5SE and its game build.") end
    if coe5.get("activePlayer") ~= -1 then error("Run this test from the main menu, with no game loaded.") end
    local caster, enemy = coe5.findMonster(caster_name), coe5.findMonster(enemy_name)
    if caster == nil or enemy == nil then error("Caster or target monster was not found. Check the chosen names.") end
    local spell = resolve_spell()
    if not coe5.openTestField(caster, spell, enemy, {{COUNT}}) then error("Test field refused. Check coe5mod.log; another field may be open.") end
    opened, active, held, request = true, true, false, nil
    while active do
      coe5.drawTestField()
      local action = request; request = nil
      if action == "close" then break end
      if action == "cast" then coe5.fireTestField() end
    end
  end)
  active, request = false, nil
  if opened then
    local closed, why = pcall(coe5.closeTestField)
    if not closed then ok, reason = false, "Cleanup failed: " .. tostring(why) end
  end
  if not ok then report(tostring(reason)) end
end
local required = {"wrap", "get", "set", "findMonster", "spellInfo", "openTestField", "drawTestField", "fireTestField", "closeTestField"}
local available = coe5.ui ~= nil
for _, key in ipairs(required) do if type(coe5[key]) ~= "function" then available = false end end
if available and type(coe5.ui.drawRect) == "function" and type(coe5.ui.drawText) == "function" then
  local draw = coe5.wrap("BATTLE_DRAW", function(next)
    next()
    if active then
      coe5.ui.drawRect(16, 45, 350, 38, 0.08, 0.12, 0.15, 1)
      coe5.ui.drawText(26, 55, 18, "Cast once", 0.85, 0.95, 0.9, 1)
      coe5.ui.drawText(205, 55, 18, "Close test", 0.95, 0.85, 0.7, 1)
      coe5.ui.drawText(20, 20, 13, "Forced item-style cast; range extended. Not a normal combat test.", 1, 1, 1, 1)
    end
  end)
  local wait = coe5.wrap("BATTLE_WAIT", function(next, block, mode)
    local id = next(block, mode)
    if not active then return id end
    local down = coe5.get("mouseButtons") == 1
    local x, y = coe5.get("uiPointerX"), coe5.get("uiPointerY")
    if down and x >= 16 and x <= 366 and y >= 45 and y <= 83 then
      if not held then request = x < 190 and "cast" or "close" end
      held = true; coe5.set("mouseButtons", 0); return 0
    end
    held = down
    return id
  end)
  hooks_ok = draw == true and wait == true
end
if type(coe5.addMainMenuButton) == "function" then
  coe5.addMainMenuButton({{MENU}}, run_test)
else
  print("Workbench test requires CoE5SE 2.13.0 and a supported game build.")
end
