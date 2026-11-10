-- Workbench-owned helper using only official CoE5SE 3.2.2 APIs. No core patches.
-- One field / at most one AI battle per launch. Close is not a record rollback receipt.
local mod,name,roster={{MODID}},{{WEAPON}},{{ROSTER}}
local active,fighting,held,corner,used,done=false,false,false,false,false,false
local request,painted,stopping
{{DOCK}}
local function integer(v,lo,hi) return type(v)=="number" and v%1==0 and v>=lo and v<=hi end
local function unique(key,wanted,last)
  local found
  for id=0,last do
    local n=coe5.get(key,id)
    if n and n:lower()==wanted:lower() then assert(n==wanted and not found,"Ambiguous private record");found=id end
  end
  return assert(found,"Private record missing: "..wanted)
end
local function position(unit)
  local x,y=coe5.get("unitBattleX",unit),coe5.get("unitBattleY",unit)
  if x==nil and y==nil then return "unavailable","unavailable" end
  assert(integer(x,0,1535) and integer(y,0,19),"Invalid battlefield position reading")
  return x,y
end
local function run()
  if used then coe5.showMessageBox("Mixed test","This launch was already used. Quit and prepare a fresh test.");return end
  used=true
  local context,attempted,opened=nil,false,false
  local meta={schema="wb-official-mixed-1",mod=mod,area={{AREA}},dmgtype={{TYPE}},payload={{PAYLOAD}},
    total=0,verified=0,returned=-1,battles=0,stopped=0,opened=0,closeattempted=0,closereturned=0,menuafterclose=0,
    status="error",message="",phase="setup",inactive="unavailable",carrier=-1,weapon=-1}
  for _,g in ipairs(roster) do meta.total=meta.total+g.count end
  local result={meta=meta}
  local tracked={}
  local function record()
    assert(coe5.writeIni("wb-mixed-"..context.run,result)==true,"Could not save mixed receipt; inspect logs")
  end
  local function afterReadings()
    for i=1,meta.verified do
      local row=result["unit"..i]
      assert(coe5.get("unitMonster",row.instance)==row.monster,"Defender identity changed during field")
      local hp=coe5.get("unitHp",row.instance)
      row.afterhp=integer(hp,-2147483648,2147483647) and hp or "unavailable"
      row.endx,row.endy=position(row.instance)
    end
  end
  local ok,why=pcall(function()
    local c=(coe5.readIni("workbench-session") or {}).session
    local function hex(v,n) return type(v)=="string" and #v==n and v:match("^[0-9a-f]+$") end
    assert(c and c.schema=="wb-session-1" and c.mod==mod and hex(c.id,32) and hex(c.revision,64) and hex(c.run,32),"Missing prepared session binding")
    context=c;meta.session,meta.revision,meta.run=c.id,c.revision,c.run
    local previous=coe5.readIni("wb-mixed-"..c.run)
    if previous and next(previous) then context=nil;error("A receipt already exists for this launch; quit and review it") end
    assert(coe5.get("activePlayer")==-1 and workbenchDock("fixed",false,false),"Use only the isolated main menu with a usable viewport")
    local last=coe5.get("monsterLastIndex")
    assert(integer(last,2000,6998),"Loaded monster table unavailable")
    local carrier=unique("monsterName","{{CARRIER}}",last)
    local weapon=unique("weaponName",name,6998)
    local function verify()
      assert(carrier>=2000 and weapon>=1200,"Expected private carrier and weapon")
      assert(coe5.get("monsterAttackType",carrier,0)=={{ROWTYPE}} and coe5.get("monsterAttackWeapon",carrier,0)==weapon and
        coe5.get("monsterAttackValue",carrier,0)=={{PAYLOAD}} and coe5.get("monsterAttackType",carrier,1)==nil,"Private attack changed")
      for k,v in pairs({range={{RANGE}},aoe={{AREA}},dmgtype={{TYPE}},dmg={{DMG}},init={{INIT}}{{VISUALCHECK}}}) do
        assert(coe5.get("weapon",weapon,k)==v,"Prepared weapon changed: "..k)
      end
      for _,g in ipairs(roster) do assert(coe5.get("monsterName",g.monster)==g.name and coe5.get("monsterHp",g.monster)>0,"Native target identity changed") end
{{RANGEDCHECK}}    end
    verify();meta.carrier,meta.weapon=carrier,weapon
    local groups={}
    for i,g in ipairs(roster) do groups[i]={g.monster,g.count} end
    -- Mark the attempt first: even a false/error/partial return must take the close path.
    attempted=true
    local accepted,units=coe5.openTestField{commander=carrier,spell=-1,standIn=-1,enemies=groups}
    assert(accepted==true,"Official group field refused; no battle run. Quit rather than retry")
    opened=true;meta.opened=1
    assert(type(units)=="table" and integer(units.commander,0,98999) and type(units.friends)=="table" and #units.friends==0 and type(units.enemies)=="table","Missing official group identities")
    meta.returned=#units.enemies
    assert(meta.returned==meta.total,"Partial returned roster; no battle run")
    assert(coe5.get("unitMonster",units.commander)==carrier and coe5.get("unitOwner",units.commander)==0,"Private commander identity differs")
    tracked[1]=units.commander
    local seen,at={[units.commander]=true},0
    local getter=({[4]=coe5.unitFireResistance,[5]=coe5.unitColdResistance,[6]=coe5.unitShockResistance})[{{TYPE}}]
    -- Verify the whole array before recording it as the requested roster.
    for _,g in ipairs(roster) do for j=1,g.count do
      at=at+1;local unit=units.enemies[at]
      assert(integer(unit,0,98999) and not seen[unit] and coe5.get("unitMonster",unit)==g.monster and coe5.get("unitOwner",unit)==24,"Returned defender identity differs")
      seen[unit]=true
    end end
    at=0
    for _,g in ipairs(roster) do for j=1,g.count do
      at=at+1;local unit=units.enemies[at]
      local hp=coe5.get("unitHp",unit);assert(integer(hp,1,2147483647),"Initial HP unavailable")
      local x,y=position(unit);local resistance="unavailable"
      if getter then local read,value=pcall(getter,unit);if read and integer(value,-2147483648,2147483647) then resistance=value end end
      result["unit"..at]={instance=unit,monster=g.monster,name=g.name,beforehp=hp,afterhp="unavailable",resistance=resistance,
        setupx=x,setupy=y,endx="unavailable",endy="unavailable"}
      meta.verified=at;tracked[#tracked+1]=unit
      coe5.log("wb_official_mixed setup unit="..unit.." monster="..g.monster.." hp="..hp.." position="..x..","..y)
    end end
    verify()
    active,fighting,held,corner,stopping,request,painted=true,false,false,false,false,nil,nil
    meta.status="opened";record()
    while request~="close" do
      coe5.drawTestField()
      assert(workbenchDock("fixed",false,corner),"Viewport too small")
      if request=="battle" then
        request=nil
        if meta.battles==0 then
          verify();fighting=true
          coe5.fightTestField()
          fighting=false;done=true;meta.battles=1;meta.stopped=stopping and 1 or 0
          meta.phase="after-battle-return";afterReadings()
          meta.status=stopping and "cancelled" or "battle-returned";record()
        end
      elseif request=="move" then corner=not corner;request=nil
      elseif request=="details" then
        request=nil
        coe5.showMessageBox("Official mixed field",name.." on private {{CARRIER}}, payload {{PAYLOAD}}, damage #{{TYPE}}, area code {{AREA}}. "..meta.total.." verified defenders / "..#roster.." native types. One AI battle per launch. Setup/end positions and net HP are readings, not attack-time positions or confirmed hits. Close does not establish record rollback.")
      end
    end
    if meta.battles==0 then meta.status="cancelled";meta.phase="before-close";afterReadings() end
  end)
  active,fighting=false,false;meta.stopped=stopping and 1 or meta.stopped
  if not ok then meta.status="error";meta.message=tostring(why):gsub("[\r\n]"," "):sub(1,300) end
  if attempted then
    meta.closeattempted=1
    local closed,err=pcall(coe5.closeTestField)
    meta.closereturned=closed and 1 or 0
    if not closed then meta.status="error";meta.message="Close call failed: "..tostring(err):gsub("[\r\n]"," "):sub(1,260) end
    local read,value=pcall(coe5.get,"activePlayer");meta.menuafterclose=read and value==-1 and 1 or 0
    local inactive,unknown,alive=0,false,false
    for _,unit in ipairs(tracked) do
      local read,hp=pcall(coe5.get,"unitHp",unit)
      if not read or type(hp)~="number" then unknown=true elseif hp<=0 then inactive=inactive+1 else alive=true end
    end
    if #tracked>0 and not unknown then meta.inactive=inactive end
    if meta.closereturned~=1 or meta.menuafterclose~=1 or alive then meta.status="error";meta.message="Field closure readings incomplete; quit this process. No rollback guarantee" end
    if meta.status=="battle-returned" then meta.status="closed" end
  end
  coe5.log("wb_official_mixed finish status="..meta.status.." battles="..meta.battles.." verified="..meta.verified.." close_returned="..meta.closereturned.." menu="..meta.menuafterclose)
  if context then local saved,err=pcall(record);if not saved then why=tostring(err);ok=false end end
  if not ok or meta.status=="error" then coe5.showMessageBox("Official mixed field",tostring(why or meta.message).." Quit normally and inspect this session; do not retry it.") end
end
local draw=coe5.wrap("BATTLE_DRAW",function(next)
  next();if not active then return end
  painted=workbenchDock("fixed",false,corner);if not painted then return end
  local d=painted;coe5.ui.drawRect(d.x,d.y,d.width,d.height,0.08,0.12,0.15,1)
  local labels={cast=done and "Battle returned" or "Battle (AI)",close=fighting and "Stop / close" or "Close",move="Move"}
  for _,b in ipairs(d.buttons) do coe5.ui.drawRect(b[2],b[3],b[4],b[5],0.16,0.23,0.28,1);coe5.ui.drawText(b[2]+4,b[3]+7,11,labels[b[1]],1,1,1,1) end
  coe5.ui.drawText(d.x+8,d.y+48,11,"Official mixed | one battle | details",1,1,1,1)
end)
local wait=coe5.wrap("BATTLE_WAIT",function(next,block,mode)
  local id=next(block,mode);if not active then return id end
  local down=coe5.get("mouseButtons")==1;if not workbenchSameView(painted) then held=down;return id end
  local x,y=coe5.get("uiPointerX"),coe5.get("uiPointerY");local hit
  for _,b in ipairs(painted.buttons) do if workbenchHit(b,x,y) then hit=b[1] end end
  if workbenchHit(painted.status,x,y) then hit="details" end
  if down and hit then
    if not held then
      if fighting then if hit=="close" then stopping=true;request="close";coe5.stopTestFight() end
      else request=hit=="cast" and "battle" or hit end
    end
    held=true;coe5.set("mouseButtons",0);return 0
  end
  held=down;return id
end)
if draw and wait then coe5.addMainMenuButton("WB test: "..mod,run) end
