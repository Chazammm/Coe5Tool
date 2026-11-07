-- CoE5 5.43 / local CoE5SE 2.13.0 + Workbench roster-v1.
local mod,name,roster={{MODID}},{{WEAPON}},{{ROSTER}}
local rowType,payload,area={{ROWTYPE}},{{PAYLOAD}},{{AREA}}
local function unique(key,name,last)
  local found
  for id=0,last do
    if coe5.get(key,id)==name then assert(not found,"Ambiguous private record");found=id end
  end
  return assert(found,"Private record missing")
end
local function run()
  assert(coe5.withTestFieldRoster and coe5.testFieldRosterStatus,"Requires local Workbench roster-v1 extender")
  local ini=coe5.readIni("workbench-session");local context=ini and ini.session
  assert(context and context.schema=="wb-session-1" and context.mod==mod,"Start the prepared disposable session")
  local carrier=unique("monsterName","{{CARRIER}}",coe5.get("monsterLastIndex"))
  local weapon=unique("weaponName",name,6998)
  local function verify()
    assert(carrier>=2000 and weapon>=1200,"Expected private records")
    assert(coe5.get("monsterAttackType",carrier,0)==rowType and coe5.get("monsterAttackWeapon",carrier,0)==weapon and
      coe5.get("monsterAttackValue",carrier,0)==payload and coe5.get("monsterAttackType",carrier,1)==nil,"Private attack changed")
    for key,value in pairs({range={{RANGE}},dmgtype={{TYPE}},dmg={{DMG}},init={{INIT}},aoe=area{{VISUALCHECK}}}) do
      assert(coe5.get("weapon",weapon,key)==value,"Prepared weapon changed: "..key)
    end
    for _,group in ipairs(roster) do assert(coe5.get("monsterName",group.monster)==group.name and coe5.get("monsterHp",group.monster)>0,"Target identity changed") end
  end
  verify()
  local total=0;local label=""
  for _,g in ipairs(roster) do total=total+g.count;label=label..g.name.." #"..g.monster.." x "..g.count.." | " end
  local status="No battle yet."
  local file="wb-mixed-"..context.run
  while true do
    coe5.ui.screenBegin("Private mixed group | "..name)
    coe5.ui.sectionBegin("Local roster-v1 | Area code "..area.." | Damage #{{TYPE}}")
    coe5.ui.text(0,label);coe5.ui.text(0,status)
    coe5.ui.sectionEnd();coe5.ui.buttonRow()
    coe5.ui.text(1,"Battle (AI)");coe5.ui.text(2,"Check cleanup");coe5.ui.text(9,"Finish");coe5.ui.bindEscape(9)
    local action=coe5.ui.wait()
    if action==9 then return end
    if action==2 then
      verify()
      local ok,why=coe5.withTestFieldRoster(carrier,roster,function() error("WB cancellation probe") end)
      local clean=coe5.testFieldRosterStatus()
      assert(not ok and tostring(why):find("WB cancellation probe",1,true) and not clean.open and clean.restored,"Callback cancellation did not restore field")
      status="Callback cancellation restored field and allocation records. No battle."
      assert(coe5.writeIni("wb-cleanup-"..context.run,{meta={schema="wb-cleanup-1",restored=1,open=0,run=context.run}}))
    elseif action==1 then
      verify()
      local result={meta={schema="wb-mixed-1",session=context.id,revision=context.revision,run=context.run,mod=mod,area=area,total=total,battles=0}}
      local ok,why=coe5.withTestFieldRoster(carrier,roster,function(units)
        assert(#units==total,"Partial roster returned")
        local at=0;local seen={}
        local getter=({[4]=coe5.unitFireResistance,[5]=coe5.unitColdResistance,[6]=coe5.unitShockResistance})[{{TYPE}}]
        for _,g in ipairs(roster) do for n=1,g.count do
          at=at+1;local u=units[at]
          assert(u.monster==g.monster and not seen[u.unit] and coe5.get("unitMonster",u.unit)==g.monster and coe5.get("unitOwner",u.unit)==24,"Spawn identity mismatch")
          seen[u.unit]=true
          local resistance="unavailable"
          if getter then local read,value=pcall(getter,u.unit);if read and type(value)=="number" then resistance=value end end
          result["unit"..at]={instance=u.unit,monster=g.monster,name=g.name,beforehp=coe5.get("unitHp",u.unit),resistance=resistance}
        end end
        coe5.fightTestField()
        result.meta.battles=1
        for i,u in ipairs(units) do result["unit"..i].afterhp=coe5.get("unitHp",u.unit) end
      end)
      local clean=coe5.testFieldRosterStatus()
      result.meta.closed=clean.open and 0 or 1;result.meta.restored=clean.restored and 1 or 0
      result.meta.status=ok and "closed" or tostring(why)
      assert(coe5.writeIni(file,result),"Could not save mixed observation")
      assert(ok and not clean.open and clean.restored,tostring(why or "Cleanup failed"))
      status="Battle returned. "..total.." identities saved in "..file..". Check named hits in game log."
    end
  end
end
coe5.addMainMenuButton("WB test: "..mod,function()
  local ok,why=pcall(run)
  if not ok then coe5.showMessageBox("Private mixed group",tostring(why)) end
end)
