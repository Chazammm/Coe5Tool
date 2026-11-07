-- Experimental CoE5SE 2.13.0 test fixture. No automatic test on load.
-- Source contract: https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/coe5.lua
local spell_name, weapon_name = {{SPELL}}, {{WEAPON}}
local caster_name, enemy_name = {{CASTER}}, {{ENEMY}}
local caster_preferred, enemy_preferred = {{CASTERID}}, {{ENEMYID}}
local active, request, held = false, nil, false
local corner=false
local painted_dock=nil
{{DOCK}}
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
local function participant(name, preferred)
  if preferred ~= nil then
    if coe5.get("monsterName",preferred) ~= name then error("Selected participant ID/name differs in this runtime. Choose another entry; historical IDs may differ.") end
    return preferred
  end
  local last = coe5.get("monsterLastIndex")
  if type(last) ~= "number" or last < 0 or last > 6998 or last % 1 ~= 0 then error("Monster enumeration is unavailable for safe name selection.") end
  local found, count = nil, 0
  for id=0,last do
    local n = coe5.get("monsterName",id)
    if n and string.lower(n) == string.lower(name) then found, count = id, count + 1 end
  end
  if count ~= 1 then error("Participant name is missing or ambiguous. Select its explicit ID using searchable choices.") end
  return found
end
local function run_test()
  if active then return end
  local opened = false
  local ok, reason = pcall(function()
    if not hooks_ok then error("Required test-field/UI hooks unavailable. Check CoE5SE and its game build.") end
    if coe5.get("activePlayer") ~= -1 then error("Run this test from the main menu, with no game loaded.") end
    local dock,why=workbenchDock("fixed",false,corner);if not dock then error(why) end
    local caster, enemy = participant(caster_name,caster_preferred), participant(enemy_name,enemy_preferred)
    if caster == nil or enemy == nil then error("Caster or target monster was not found. Check the chosen names.") end
    local spell = resolve_spell()
    if not coe5.openTestField(caster, spell, enemy, {{COUNT}}) then error("Test field refused. Check coe5mod.log; another field may be open.") end
    opened, active, held, request = true, true, false, nil
    painted_dock=nil
    while active do
      coe5.drawTestField()
      local dock,why=workbenchDock("fixed",false,corner);if not dock then error(why) end
      local action = request; request = nil
      if action == "close" then break end
      if action == "cast" then coe5.fireTestField() end
      if action == "move" then corner=not corner end
      if action == "details" then report("Forced item-style cast; some ranges are extended. Not ordinary combat. Move changes the dock between bottom center and upper right; narrow viewports use upper right. UI coordinates follow current screenW/screenH.") end
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
    if not active then return end
    local d=workbenchDock("fixed",false,corner);painted_dock=d;if not d then return end
    coe5.ui.drawRect(d.x,d.y,d.width,d.height,0.08,0.12,0.15,1)
    local labels={cast="Cast once",close="Close test",move="Move"}
    for _,b in ipairs(d.buttons)do coe5.ui.drawRect(b[2],b[3],b[4],b[5],0.16,0.23,0.28,1);coe5.ui.drawText(b[2]+4,b[3]+7,11,labels[b[1]],1,1,1,1) end
    coe5.ui.drawText(d.x+8,d.y+48,11,"Forced cast | tap for details",1,1,1,1)
  end)
  local wait = coe5.wrap("BATTLE_WAIT", function(next, block, mode)
    local id = next(block, mode)
    if not active then return id end
    local down = coe5.get("mouseButtons") == 1
    local d=painted_dock;if not workbenchSameView(d) then held=down;return id end
    local x, y = coe5.get("uiPointerX"), coe5.get("uiPointerY")
    local hit=nil
    for _,b in ipairs(d.buttons)do if workbenchHit(b,x,y) then hit=b[1];break end end
    if not hit and workbenchHit(d.status,x,y) then hit="details" end
    if down and hit then
      if not held then request=hit end
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
