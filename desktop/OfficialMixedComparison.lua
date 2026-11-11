-- Workbench API client for official 3.2.2 mixed visual comparisons; no core changes.
local mod, name, payload = {{MODID}}, {{WEAPON}}, {{PAYLOAD}}
-- Row 1 is the pinned name (false for an unnamed sprite), row 2 is a native weapon witness.
local catalog = {sprite={ {{SPRITES}} },particle={ {{PARTICLES}} },impact={ {{IMPACTS}} }}
local function label(row) return row[1] or "Unnamed sprite" end
local function available(role,id)
  local row=catalog[role][id]
  if not row then return false end
  if role~="sprite" and coe5.lookName(id)~=row[1] then return false end
  local witness=row[2]
  if not witness then return true end
  if role=="impact" then return coe5.get("weapon",witness,"look")==id end
  return coe5.get("weapon",witness,"flymode")==(role=="sprite" and 1 or 2) and coe5.get("weapon",witness,"flylook")==id
end
local original = {flymode={{MODE}},flylook={{FLIGHT}},look={{IMPACT}}}
local roster={{ROSTER}}
local total=0
for _,g in ipairs(roster) do total=total+g.count end
local fields = {"flymode","flylook","look"}
local ui = coe5.ui
local function equal(a,b)
  return a.flymode==b.flymode and a.flylook==b.flylook and a.look==b.look
end
local function copy(v) return {flymode=v.flymode,flylook=v.flylook,look=v.look} end
local function describe(v)
  local rows=v.flymode==1 and catalog.sprite or catalog.particle
  local impact=v.look==-1 and "undeclared" or label(catalog.impact[v.look]).." #"..v.look
  return (v.flymode==1 and "Sprite 1" or "Particle 2").." / "..label(rows[v.flylook]).." #"..v.flylook.." | Impact "..impact
end
local function unique(key,wanted,last)
  local found
  for id=0,last do
    local n=coe5.get(key,id)
    if n and n:lower()==wanted:lower() then
      assert(n==wanted and not found,"Ambiguous record: "..wanted)
      found=id
    end
  end
  return assert(found,"Missing record: "..wanted)
end
local function pick(title,role,carrier)
  local choices,missing={},0
  for id,row in pairs(catalog[role]) do
    if available(role,id) then choices[id]=row else missing=missing+1 end
  end
  local query,page="",0
  while true do
    local ids={}
    for id,row in pairs(choices) do
      if query=="" or label(row):lower():find(query:lower(),1,true) or tonumber((query:gsub("^#","",1)))==id then ids[#ids+1]=id end
    end
    table.sort(ids)
    ui.screenBegin(title);ui.sectionBegin("CoE5 5.43 | "..#ids.." matches | page "..(page+1).."/"..math.max(1,math.ceil(#ids/5)))
    ui.text(0,query=="" and "Search by name or #ID" or "Filter: "..query)
    if missing>0 then ui.text(0,missing.." unavailable in this runtime") end
    if #ids==0 then ui.text(0,"No matches") end
    for i=page*5+1,math.min(#ids,page*5+5) do local id=ids[i];local row=choices[id];ui.text(1000+id,label(row).." #"..id.." | "..(row[2] and "native" or role=="sprite" and "manual" or "table")) end
    ui.sectionEnd();ui.buttonRow();ui.text(1,"Search");ui.text(2,"Clear")
    if page>0 then ui.text(3,"Previous") end
    if (page+1)*5<#ids then ui.text(4,"Next") end
    ui.text(9,"Back");ui.bindEscape(9)
    local action=ui.wait()
    if action==9 then return end
    if action>=1000 and choices[action-1000] then return action-1000 end
    if action==1 then query=ui.nameBox("Find choice","Partial name or #ID",coe5.get("monsterSprite",carrier),42) or query;page=0
    elseif action==2 then query="";page=0 elseif action==3 then page=page-1 elseif action==4 then page=page+1 end
  end
end
-- Eight attempts bound record growth and receipt size; official close is not allocation rollback.
local limit=8
local active,fighting,held,corner,done,stopping=false,false,false,false,false,false
local request,painted
{{DOCK}}
local function integer(v,lo,hi) return type(v)=="number" and v%1==0 and v>=lo and v<=hi end
local function position(unit)
  local x,y=coe5.get("unitBattleX",unit),coe5.get("unitBattleY",unit)
  if x==nil and y==nil then return "unavailable","unavailable" end
  assert(integer(x,0,1535) and integer(y,0,19),"Invalid battlefield position reading")
  return x,y
end
local used=false
local function run()
  if used then coe5.showMessageBox("Mixed comparison","This launch is already used. Quit and review its results.");return end
  used=true
  local ctx,journal,file,restore
  local restoreAllowed=true
  local ok,why=pcall(function()
    ctx=(coe5.readIni("workbench-session") or {}).session
    local function hex(v,n) return type(v)=="string" and #v==n and v:match("^[0-9a-f]+$") end
    assert(ctx and ctx.schema=="wb-session-1" and ctx.mod==mod and hex(ctx.id,32) and hex(ctx.revision,64) and hex(ctx.run,32),"Missing prepared session binding")
    assert(coe5.get("activePlayer")==-1 and workbenchDock("fixed",false,false),"Use the isolated main menu with a usable viewport")
    file="wb-result-"..ctx.run
    local old=coe5.readIni(file)
    assert(not old or not next(old),"A comparison receipt already exists; quit and review it")
    local last=coe5.get("monsterLastIndex")
    assert(integer(last,2000,6998),"Monster table unavailable")
    local weapon=unique("weaponName",name,6998)
    local carrier=unique("monsterName","WB Ranged Carrier",last)
    local function identity()
      assert(weapon>=1200 and carrier>=2000 and coe5.get("weaponName",weapon)==name and coe5.get("monsterName",carrier)=="WB Ranged Carrier","Expected private records")
      assert(coe5.get("monsterAttackType",carrier,0)==2 and coe5.get("monsterAttackWeapon",carrier,0)==weapon and coe5.get("monsterAttackValue",carrier,0)==payload and coe5.get("monsterAttackType",carrier,1)==nil,"Private ranged attack changed")
      for k,v in pairs({range={{RANGE}},aoe={{AREA}},dmgtype={{TYPE}},dmg={{DMG}},init={{INIT}}}) do assert(coe5.get("weapon",weapon,k)==v,"Prepared "..k.." changed") end
      for _,g in ipairs(roster) do assert(coe5.get("monsterName",g.monster)==g.name and coe5.get("monsterHp",g.monster)>0,"Native target identity changed") end
    end
    local function read()
      identity();local v={};for _,k in ipairs(fields) do v[k]=coe5.get("weapon",weapon,k) end;return v
    end
    local function supported(v)
      assert((v.flymode==1 or v.flymode==2) and available(v.flymode==1 and "sprite" or "particle",v.flylook),"Unavailable flight identity/reference")
      assert((original.look==-1 and v.look==-1) or available("impact",v.look),"Unavailable impact identity/reference")
    end
    local function write(v)
      local before=read()
      for _,k in ipairs(fields) do if before[k]~=v[k] then coe5.set("weapon",weapon,k,v[k]) end end
      assert(equal(read(),v),"Private visuals did not read back")
    end
    assert(equal(read(),original),"Loaded visuals differ from the draft");supported(original)
    restore=function() assert(restoreAllowed,"Field closure unverified; leave private visuals for process exit");write(original);assert(equal(read(),original),"Private visual restoration unverified") end
    journal={meta={schema="wb-official-ranged-mixed-results-1",session=ctx.id,revision=ctx.revision,run=ctx.run,mod=mod,count=0,status="active",message="",visualsrestored=0}}
    local function save() assert(coe5.writeIni(file,journal)==true,"Could not save comparison receipt; quit and inspect logs") end
    save()
    local function field(index,parameter,expected)
      active,fighting,held,corner,done,stopping,request,painted=false,false,false,false,false,false,nil,nil
      local m={schema="wb-official-compare-field-1",mod=mod,session=ctx.id,revision=ctx.revision,run=ctx.run,
        attempt=index,parameter=parameter,readback=0,flymode=expected.flymode,flylook=expected.flylook,look=expected.look,range={{RANGE}},
        area={{AREA}},dmgtype={{TYPE}},payload=payload,total=total,verified=0,returned=-1,battles=0,stopped=0,opened=0,
        closeattempted=0,closereturned=0,menuafterclose=0,inactive="unavailable",carrier=carrier,weapon=weapon,carrierunit=-1,
        unitsbefore="unavailable",commandersbefore="unavailable",status="error",message="Setup not completed",phase="setup"}
      local units,tracked={},{}
      local attempted=false
      journal.meta.count=index;journal["attempt"..index]=m
      local function record()
        for i,row in ipairs(units) do journal["a"..index.."unit"..i]=row end
        save()
      end
      local function after()
        for _,row in ipairs(units) do
          assert(coe5.get("unitMonster",row.instance)==row.monster,"Defender identity changed")
          local hp=coe5.get("unitHp",row.instance);row.afterhp=integer(hp,-2147483648,2147483647) and hp or "unavailable"
          row.endx,row.endy=position(row.instance)
        end
      end
      local passed,err=pcall(function()
        record();assert(equal(read(),expected),"Visuals changed before field");supported(expected)
        local u,c=coe5.get("unitLastIndex"),coe5.get("commanderLastIndex")
        assert(integer(u,-1,98998-total) and integer(c,-1,9988),"Insufficient or unknown runtime record capacity; quit")
        m.unitsbefore,m.commandersbefore=u,c
        assert(coe5.get("activePlayer")==-1,"Previous field did not return to the menu")
        local groups={};for i,g in ipairs(roster) do groups[i]={g.monster,g.count} end
        attempted=true;restoreAllowed=false
        local accepted,ids=coe5.openTestField{commander=carrier,spell=-1,standIn=-1,enemies=groups}
        assert(accepted==true,"Official group field refused; no retry")
        m.opened=1
        assert(type(ids)=="table" and integer(ids.commander,0,98999) and type(ids.friends)=="table" and #ids.friends==0 and type(ids.enemies)=="table","Missing group identities")
        m.returned=#ids.enemies
        assert(m.returned==total,"Partial returned roster; no battle")
        assert(coe5.get("unitMonster",ids.commander)==carrier and coe5.get("unitOwner",ids.commander)==0,"Private commander identity differs")
        m.carrierunit=ids.commander;tracked[1]=ids.commander
        local seen,at={[ids.commander]=true},0
        for _,g in ipairs(roster) do for j=1,g.count do
          at=at+1;local id=ids.enemies[at]
          assert(integer(id,0,98999) and not seen[id] and coe5.get("unitMonster",id)==g.monster and coe5.get("unitOwner",id)==24,"Returned defender identity differs")
          seen[id]=true
        end end
        local getter=({[4]=coe5.unitFireResistance,[5]=coe5.unitColdResistance,[6]=coe5.unitShockResistance})[{{TYPE}}]
        at=0
        for _,g in ipairs(roster) do for j=1,g.count do
          at=at+1;local id=ids.enemies[at];local hp=coe5.get("unitHp",id)
          assert(integer(hp,1,2147483647),"Initial HP unavailable")
          local x,y=position(id);local resistance="unavailable"
          if getter then local got,v=pcall(getter,id);if got and integer(v,-2147483648,2147483647) then resistance=v end end
          units[at]={instance=id,monster=g.monster,name=g.name,beforehp=hp,afterhp="unavailable",resistance=resistance,setupx=x,setupy=y,endx="unavailable",endy="unavailable"}
          tracked[#tracked+1]=id;m.verified=at
        end end
        assert(equal(read(),expected),"Visuals changed at setup")
        active,fighting,held,corner,done,stopping,request,painted=true,false,false,false,false,false,nil,nil
        m.status,m.message="opened","";record()
        while request~="close" do
          coe5.drawTestField();assert(workbenchDock("fixed",false,corner),"Viewport too small")
          if request=="battle" then
            request=nil
            if not done then
              assert(equal(read(),expected),"Visuals changed before battle");supported(expected)
              fighting=true;coe5.fightTestField();fighting=false;done=true
              m.battles=1;m.stopped=stopping and 1 or 0;m.phase="after-battle-return";after()
              assert(equal(read(),expected),"Visuals changed during battle");m.readback=1
              m.status=stopping and "cancelled" or "battle-returned";record()
            end
          elseif request=="move" then corner=not corner;request=nil
          elseif request=="details" then
            request=nil;coe5.showMessageBox("Mixed comparison","Attempt "..index.." / "..limit..". "..total.." defenders / "..#roster.." types. "..describe(expected)..". Damage #{{TYPE}}, payload {{PAYLOAD}}, area code {{AREA}} stay fixed. Setup/end cells and HP are not confirmed hits. Close does not establish record rollback.")
          end
        end
        if m.battles==0 then m.status="cancelled";m.phase="before-close";after() end
      end)
      if fighting then stopping=true;pcall(coe5.stopTestFight) end
      active,fighting=false,false;m.stopped=stopping and 1 or m.stopped
      if not passed then m.status="error";m.message=tostring(err):gsub("[\r\n]"," "):sub(1,300) end
      if attempted then
        m.closeattempted=1
        local closed=pcall(coe5.closeTestField);m.closereturned=closed and 1 or 0
        local got,v=pcall(coe5.get,"activePlayer");m.menuafterclose=got and v==-1 and 1 or 0
        local inactive,known=0,#tracked==total+1
        for _,id in ipairs(tracked) do local read,hp=pcall(coe5.get,"unitHp",id);if not read or not integer(hp,-2147483648,2147483647) then known=false elseif hp<=0 then inactive=inactive+1 end end
        if known then m.inactive=inactive end
        if m.closereturned~=1 or m.menuafterclose~=1 or not known or inactive~=total+1 then
          passed=false;m.status="error";m.message=((m.message~="" and m.message.."; " or "").."Closure not fully observed for tracked units; quit without another field"):sub(1,300)
        else restoreAllowed=true;if m.status=="battle-returned" then m.status="closed" end end
      end
      record()
      coe5.log("wb_official_compare attempt="..index.." status="..m.status.." battle_returns="..m.battles.." close_returned="..m.closereturned.." tracked_inactive="..m.inactive)
      assert(passed,m.message)
      return m
    end
    local pending,applied,parameter=copy(original),copy(original),0
    local status="Open a fresh group, then Battle (AI). Each attempt is saved separately."
    while true do
      ui.screenBegin("Compare mixed visuals | official groups")
      ui.sectionBegin(name)
      ui.text(0,"Applied r"..parameter..": "..describe(applied));ui.text(0,"Pending: "..describe(pending))
      ui.text(0,total.." defenders / "..#roster.." types | damage #{{TYPE}} | area code {{AREA}}")
      if journal.meta.count<limit then ui.text(1,"Sprite flight...");ui.text(2,"Particle flight...");ui.text(3,"Impact...") end
      ui.text(0,status);ui.text(0,"Up to 8 field attempts; no record rollback guarantee.")
      ui.sectionEnd();ui.buttonRow()
      local ready=equal(applied,pending)
      if journal.meta.count<limit then if not ready then ui.text(4,"Apply visuals") else ui.text(5,"Open fresh mixed group") end end
      ui.text(9,"Finish");ui.bindEscape(9)
      local action=ui.wait()
      if action==9 then break end
      if journal.meta.count<limit then
        if action==1 or action==2 then
          local id=pick(action==1 and "Sprite flight | mode 1" or "Particle flight | mode 2",action==1 and "sprite" or "particle",carrier)
          if id then pending.flymode,pending.flylook=action,id end
        elseif action==3 then local id=pick("Impact effect","impact",carrier);if id then pending.look=id end
        elseif action==4 and not ready then
          assert(equal(read(),applied),"Applied values changed");supported(pending);write(pending)
          applied=copy(pending);parameter=parameter+1;status="Applied and read back. Open fresh targets to try these values."
        elseif action==5 and ready then
          local m=field(journal.meta.count+1,parameter,applied)
          status="Attempt "..m.attempt.." saved: "..m.status..". "..m.battles.." AI battle call(s) returned."
        end
      end
    end
  end)
  if restore then local restored,err=pcall(restore);if journal then journal.meta.visualsrestored=restored and 1 or 0 end;if not restored then ok=false;why=tostring(why or "").." Private visual restore: "..tostring(err) end end
  if journal then
    journal.meta.status=ok and "finished" or "error";journal.meta.message=ok and "" or tostring(why):gsub("[\r\n]"," "):sub(1,300)
    local saved=pcall(function()assert(coe5.writeIni(file,journal)==true)end)
    if not saved then ok=false;why="Could not save final comparison receipt; inspect retained logs" end
  end
  if not ok then coe5.log("wb_official_compare error "..tostring(why));coe5.showMessageBox("Mixed comparison",tostring(why).." Quit normally; do not retry this launch.") end
end
local draw=coe5.wrap("BATTLE_DRAW",function(next)
  next();if not active then return end
  painted=workbenchDock("fixed",false,corner);if not painted then return end
  local d=painted;ui.drawRect(d.x,d.y,d.width,d.height,0.08,0.12,0.15,1)
  local labels={cast=done and "Battle returned" or "Battle (AI)",close=fighting and "Stop / close" or done and "Back" or "Cancel",move="Move"}
  for _,b in ipairs(d.buttons) do ui.drawRect(b[2],b[3],b[4],b[5],0.16,0.23,0.28,1);ui.drawText(b[2]+4,b[3]+7,11,labels[b[1]],1,1,1,1) end
  ui.drawText(d.x+8,d.y+48,11,"Official mixed | back to compare | details",1,1,1,1)
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
