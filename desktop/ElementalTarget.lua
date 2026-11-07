    -- After openTestField, its single defender is on (1,1), owned by slot 24 on 2.13.0.
    meta.dmgtype=coe5.get("weapon",weapon,"dmgtype")
    meta.weaponbase=coe5.get("weapon",weapon,"dmg")
    meta.targetresistance="unavailable"
    local okResistance,unit,value=pcall(function()
      local target
      for _,u in ipairs(coe5.squareUnits(1,1)) do
        if coe5.get("unitOwner",u)==24 and coe5.get("unitMonster",u)==13 then
          if target then return end
          target=u
        end
      end
      if target then
        local getter=({[4]=coe5.unitFireResistance,[5]=coe5.unitColdResistance,[6]=coe5.unitShockResistance})[meta.dmgtype]
        return target,getter(target)
      end
    end)
    if okResistance and type(value)=="number" then
      meta.targetunit=unit
      meta.targetresistance=value
    end
    local reading=type(meta.targetresistance)=="number" and (meta.targetresistance.."%") or "unavailable"
    local elementalDetails=" Damage type #"..meta.dmgtype..". Target resistance before battle: "..reading.."."
