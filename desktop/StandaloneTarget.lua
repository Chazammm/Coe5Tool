local targetId,targetName,damageType={{TARGETID}},{{TARGETNAME}},{{TYPE}}
local targetLabel=targetName.." #"..targetId
local function checkTarget()
  assert(coe5.get("monsterName",targetId)==targetName and (coe5.get("monsterHp",targetId) or 0)>0,"Unavailable target: "..targetLabel)
end
local function readDefender()
  local unit
  -- The pinned field creates one defender for slot 24 on square (1,1).
  for _,id in ipairs(coe5.squareUnits(1,1)) do
    if coe5.get("unitOwner",id)==24 then
      assert(unit==nil and coe5.get("unitMonster",id)==targetId,"Unexpected defender in private field")
      unit=id
    end
  end
  assert(unit~=nil,"Selected defender was not found: "..targetLabel)
  local resistance="unavailable"
  local getter=({[4]=coe5.unitFireResistance,[5]=coe5.unitColdResistance,[6]=coe5.unitShockResistance})[damageType]
  if getter then
    local ok,value=pcall(getter,unit)
    if ok and type(value)=="number" then resistance=value end
  end
  return {target=targetId,targetunit=unit,targetresistance=resistance}
end
local function describeDefender(reading)
  if damageType<4 then return targetLabel end
  local value=reading.targetresistance
  return targetLabel.." | resistance before battle: "..(type(value)=="number" and value.."%" or "unavailable")
end
