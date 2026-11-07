-- Readback/error paths only. There is no game simulation or combat verdict here.
local run, stage, opened, closed, message, observed
coe5={ui={}}
function coe5.wrap() return true end
function coe5.addMainMenuButton(_,fn) run=fn; return true end
function coe5.showMessageBox(_,why) message=why end
function coe5.log() end
function coe5.lookName(id)
  if expectedFields.flymode==2 and id==expectedFields.flylook then
    if mode=="unnamed_flight" then return nil end
    return mode=="renamed_flight" and "Different flight" or expectedFlightName
  end
  if id==expectedFields.look and mode~="unnamed_impact" then
    return mode=="renamed_impact" and "Different impact" or expectedImpactName
  end
end
function coe5.readIni()
  return {session={mod=expectedMod,schema="wb-session-1",id=string.rep("a",32),revision=string.rep("b",64),run=string.rep("c",32)}}
end
function coe5.writeIni(_,data) stage=data.meta.stage; observed=data.meta; return true end
function coe5.get(key,id,row)
  if key=="screenW" or key=="screenH" then return 800 end
  if key=="unitMonster" then return id==42 and 2000 or (mode=="wrong_defender" and -1 or expectedTargetId) end
  if key=="monsterHp" then return mode=="invalid_target_hp" and 0 or 6 end
  if key=="unitOwner" then return id==42 and 0 or 24 end
  if key=="activePlayer" then return -1 end
  if key=="monsterLastIndex" then return 2000 end
  if key=="monsterName" then
    if id==(mode=="shared_carrier" and 1999 or 2000) then return expectedCarrier elseif id==expectedTargetId then return mode=="wrong_target" and "Other" or expectedTargetName end
  elseif key=="weaponName" then
    if id==(mode=="shared_weapon" and 1199 or 1200) or (mode=="name_collision" and id==4) then return expectedName end
  elseif key=="monsterAttackType" then
    if row==0 then return mode=="wrong_row" and (3-expectedRow) or expectedRow end
    if row==1 and mode=="extra_row" then return 1 end
  elseif key=="monsterAttackWeapon" then return mode=="relinked" and 4 or (mode=="shared_weapon" and 1199 or 1200)
  elseif key=="monsterAttackValue" then return mode=="wrong_payload" and expectedPayload+1 or expectedPayload
  elseif key=="weapon" then
    local value=expectedFields[row]
    if row=="look" and value==nil then value=-1 end
    local corrupt={wrong_type="dmgtype",wrong_weapon_stats="range",wrong_mode="flymode",wrong_sprite="flylook",wrong_impact="look"}
    if row==corrupt[mode] then return value+1 end
    return value
  end
end
function coe5.squareUnits(x,y)
  assert(x==1 and y==1)
  if mode=="ambiguous_target" then return {42,71,72} end
  if mode=="missing_target" then return {42} end
  return {42,71}
end
local function resistance(target,id)
  assert(target==71 and id==expectedFields.dmgtype)
  if mode=="getter_unavailable" then error("missing getter") end
  return id==4 and 0 or id==5 and 50 or -25
end
function coe5.unitFireResistance(u) return resistance(u,4) end
function coe5.unitColdResistance(u) return resistance(u,5) end
function coe5.unitShockResistance(u) return resistance(u,6) end
function coe5.openTestField(...)
  assert(select("#",...)==4)
  local carrier,spell,enemy,count=...
  assert(carrier==2000 and spell==-1 and enemy==expectedTargetId and count==1)
  opened=true
  return mode~="refused"
end
function coe5.drawTestField() error("mock draw interrupted") end
function coe5.closeTestField() closed=true end

