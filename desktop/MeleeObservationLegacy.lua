-- Only a session-bound Workbench fixture may open this field.
local mod, name, payload = {{MODID}}, {{WEAPON}}, {{PAYLOAD}}
local active, fighting, held, corner = false, false, false, false
local request, painted, stopping
{{DOCK}}

local function unique(key, name, last)
  local found
  for id = 0, last do
    local value = coe5.get(key, id)
    if value and value:lower() == name:lower() then
      if found or value ~= name then error("Duplicate or ambiguous name: "..name) end
      found = id
    end
  end
  if not found then error("Missing loaded record: "..name) end
  return found
end

local function run()
  if active then return end
  local opened, context = false, nil
  local meta = {schema="wb-{{ROUTE}}-1", mod=mod, name=name, carriername="{{CARRIER}}", target=13, battles=0}
  local function record(stage)
    meta.stage = stage
    coe5.log("wb_{{ROUTE}} stage="..stage.." weapon="..tostring(meta.weapon).." carrier="..tostring(meta.carrier).." row=0 payload="..payload.." battle_returns="..meta.battles)
    if context and coe5.writeIni("wb-{{ROUTE}}-"..context.run,{meta=meta}) ~= true then error("Could not save the {{ROUTE}} observation record.") end
  end
  local ok, why = pcall(function()
    local ini = coe5.readIni("workbench-session")
    local c = ini and ini.session
    local function hex(v,n) return type(v)=="string" and #v==n and v:match("^[0-9a-f]+$") end
    if not c or c.schema~="wb-session-1" or c.mod~=mod or not hex(c.id,32) or not hex(c.revision,64) or not hex(c.run,32) then error("Start this test from its prepared Workbench session.") end
    context=c
    meta.session,meta.run,meta.revision=c.id,c.run,c.revision
    if coe5.get("activePlayer")~=-1 or not workbenchDock("fixed",false,false) then error("Open from the main menu with a usable field viewport.") end
    local last=coe5.get("monsterLastIndex")
    if type(last)~="number" or last<13 or last>6998 then error("Monster table unavailable.") end
    local carrier=unique("monsterName",meta.carriername,last)
    local weapon=unique("weaponName",name,6998)
    local function verify()
{{PRIVATEGUARD}}      if unique("monsterName","Spearman",last)~=13 then error("Expected native Spearman #13.") end
      if coe5.get("monsterAttackType",carrier,0)~={{ROWTYPE}} or coe5.get("monsterAttackWeapon",carrier,0)~=weapon
        or coe5.get("monsterAttackValue",carrier,0)~=payload or coe5.get("monsterAttackType",carrier,1)~=nil then
        error("Private carrier must have exactly one {{ROUTE}} row with the selected weapon and payload.")
      end
      for key,value in pairs({range={{RANGE}},aoe=0,dmgtype={{TYPE}},dmg={{DMG}},init={{INIT}}}) do
        if coe5.get("weapon",weapon,key)~=value then error("Loaded weapon differs from draft: "..key) end
      end
{{RANGEDCHECK}}    end
    verify()
    meta.weapon,meta.carrier,meta.attacktype,meta.row,meta.payload=weapon,carrier,{{ROWTYPE}},0,payload
    if not coe5.openTestField(carrier,-1,13,1) then error("Isolated {{ROUTE}} field refused.") end
    opened,active,held,corner,stopping,request,painted=true,true,false,false,false,nil,nil
{{ELEMENTAL}}    record("opened")
    while request~="close" do
      coe5.drawTestField()
      if not workbenchDock("fixed",false,corner) then error("Viewport too small for controls.") end
      if request=="battle" then
        request=nil
        verify()
        fighting=true
        coe5.fightTestField()
        fighting=false
        meta.battles=meta.battles+1
        meta.stopped=stopping and 1 or 0
        record("battle")
      elseif request=="move" then corner=not corner; request=nil
      elseif request=="details" then
        request=nil
        coe5.showMessageBox("Private {{ROUTE}} test",name.." #"..weapon.." on "..meta.carriername.." #"..carrier..", row 0, payload "..payload..". One Spearman #13. Look for the carrier and weapon in the combat log."{{DETAILS}})
      end
    end
  end)
  active,fighting=false,false
  if opened then
    local closed,err=pcall(coe5.closeTestField)
    if not closed then ok,why=false,err end
  end
  if not ok then meta.message=tostring(why) end
  local saved,err=pcall(record,ok and "closed" or "error")
  if not ok or not saved then coe5.showMessageBox("Private {{ROUTE}} test",tostring(why or err)) end
end

local draw=coe5.wrap("BATTLE_DRAW",function(next)
  next()
  if not active then return end
  painted=workbenchDock("fixed",false,corner)
  if not painted then return end
  local d=painted
  coe5.ui.drawRect(d.x,d.y,d.width,d.height,0.08,0.12,0.15,1)
  local labels={cast="Battle (AI)",close=fighting and "Stop / close" or "Close",move="Move"}
  for _,b in ipairs(d.buttons) do
    coe5.ui.drawRect(b[2],b[3],b[4],b[5],0.16,0.23,0.28,1)
    coe5.ui.drawText(b[2]+4,b[3]+7,11,labels[b[1]],1,1,1,1)
  end
  coe5.ui.drawText(d.x+8,d.y+48,11,"Private {{ROUTE}}   |   Attack details",1,1,1,1)
end)
local wait=coe5.wrap("BATTLE_WAIT",function(next,block,mode)
  local id=next(block,mode)
  if not active then return id end
  local down=coe5.get("mouseButtons")==1
  if not workbenchSameView(painted) then held=down; return id end
  local x,y=coe5.get("uiPointerX"),coe5.get("uiPointerY")
  local hit
  for _,b in ipairs(painted.buttons) do if workbenchHit(b,x,y) then hit=b[1] end end
  if workbenchHit(painted.status,x,y) then hit="details" end
  if down and hit then
    if not held then
      if fighting then
        if hit=="close" then stopping=true; request="close"; coe5.stopTestFight() end
      else request=hit=="cast" and "battle" or hit end
    end
    held=true; coe5.set("mouseButtons",0); return 0
  end
  held=down
  return id
end)
if draw and wait then coe5.addMainMenuButton("WB test: "..mod,run) end

