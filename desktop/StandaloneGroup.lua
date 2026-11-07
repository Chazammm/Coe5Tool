local targetId,targetName,damageType={{TARGETID}},{{TARGETNAME}},{{TYPE}}
local targetCount={{COUNT}}
local targetLabel=targetName.." #"..targetId.." x "..targetCount
local function checkTarget()
  assert(coe5.get("monsterName",targetId)==targetName and (coe5.get("monsterHp",targetId) or 0)>0,"Unavailable target: "..targetLabel)
end
local function readDefender()
  local roster,seen={},{}
  local getter=({[4]=coe5.unitFireResistance,[5]=coe5.unitColdResistance,[6]=coe5.unitShockResistance})[damageType]
  for _,unit in ipairs(coe5.squareUnits(1,1)) do
    if coe5.get("unitOwner",unit)==24 then
      assert(type(unit)=="number" and unit>=0 and unit<99000 and unit%1==0 and not seen[unit],"Invalid or duplicate defender instance")
      assert(coe5.get("unitMonster",unit)==targetId,"Unexpected defender type in private field")
      seen[unit]=true
      local resistance="unavailable"
      if getter then
        local ok,value=pcall(getter,unit)
        if ok and type(value)=="number" then resistance=value end
      end
      roster[#roster+1]={unit=unit,resistance=resistance}
    end
  end
  assert(#roster==targetCount,"Expected "..targetCount.." defenders of type #"..targetId..", found "..#roster)
  return roster
end
local function saveGroup(row,roster)
  row.target,row.targetcount=targetId,#roster
  for i,member in ipairs(roster) do
    row["unit"..i]=member.unit..","..member.resistance
  end
end
local function describeDefender(roster)
  local text=targetLabel.." | verified "..#roster
  for i=1,#roster do
    if i>3 then return text.." | full roster in receipt" end
    local member=roster[i]
    text=text.." | unit #"..member.unit
    if damageType>=4 then
      text=text.." "..(type(member.resistance)=="number" and member.resistance.."%" or "unavailable")
    end
  end
  return text
end
