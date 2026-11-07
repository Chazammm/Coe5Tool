-- Private ranged comparison for a single Workbench launch.
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
{{TARGETHELPER}}
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
local busy=false
local function run()
  if busy then return end
  busy=true
  local opened,changed=false,false
  local restore
  local ok,why=pcall(function()
    local ctx=(coe5.readIni("workbench-session") or {}).session
    local function hex(v,n) return type(v)=="string" and #v==n and v:match("^[0-9a-f]+$") end
    assert(ctx and ctx.schema=="wb-session-1" and ctx.mod==mod and hex(ctx.id,32) and hex(ctx.revision,64) and hex(ctx.run,32),"Missing prepared session binding")
    assert(coe5.get("activePlayer")==-1 and coe5.get("screenW")>=640 and coe5.get("screenH")>=480,"Use the main menu at 640 x 480 UI units or larger")
    local file="wb-result-"..ctx.run
    local old=coe5.readIni(file)
    assert(not old or not next(old),"This launch already saved comparisons. Quit and review them, or relaunch for another comparison.")
    local last=coe5.get("monsterLastIndex")
    assert(type(last)=="number" and last>=2000 and last<=6998,"Monster table unavailable")
    local weapon=unique("weaponName",name,6998)
    local carrier=unique("monsterName","WB Ranged Carrier",last)
    checkTarget()
    local function identity()
      assert(weapon>=1200 and carrier>=2000 and coe5.get("weaponName",weapon)==name and coe5.get("monsterName",carrier)=="WB Ranged Carrier","Expected private records")
      assert(coe5.get("monsterAttackType",carrier,0)==2 and coe5.get("monsterAttackWeapon",carrier,0)==weapon and coe5.get("monsterAttackValue",carrier,0)==payload and coe5.get("monsterAttackType",carrier,1)==nil,"Private ranged row changed")
      for k,v in pairs({range={{RANGE}},aoe={{AREA}},dmgtype={{TYPE}},dmg={{DMG}},init={{INIT}}}) do assert(coe5.get("weapon",weapon,k)==v,"Different prepared "..k) end
    end
    local function read()
      identity()
      local v={};for _,k in ipairs(fields) do v[k]=coe5.get("weapon",weapon,k) end
      return v
    end
    local function supported(v)
      assert((v.flymode==1 or v.flymode==2) and available(v.flymode==1 and "sprite" or "particle",v.flylook),"Unavailable flight identity or native reference")
      assert((original.look==-1 and v.look==-1) or available("impact",v.look),"Unavailable impact identity or native reference")
    end
    local function write(v)
      local before=read()
      for _,k in ipairs(fields) do if before[k]~=v[k] then coe5.set("weapon",weapon,k,v[k]) end end
      assert(equal(read(),v),"Private visual write did not read back")
    end
    assert(equal(read(),original),"Loaded visuals differ from prepared draft");supported(original)
    restore=function()
      if changed then write(original) end
      assert(equal(read(),original),"Original visuals did not read back")
      coe5.log("wb_compare restored weapon="..weapon.." "..describe(original))
    end
    local pending,applied,revision=copy(original),copy(original),0
    local meta={schema="wb-ranged-results-1",session=ctx.id,revision=ctx.revision,run=ctx.run,mod=mod,count=0}
    local results={meta=meta}
    local status="Target: "..targetLabel..". Choose a visual or run the prepared configuration."
    while true do
      ui.screenBegin("Compare ranged visuals | "..name{{DAMAGELABEL}}{{AREALABEL}})
      ui.sectionBegin("Applied r"..revision.." | "..describe(applied))
      ui.text(0,"Pending: "..describe(pending))
      ui.text(1,"Sprite flight...");ui.text(2,"Particle flight...");ui.text(3,"Impact...")
{{AREATEXT}}      ui.text(0,status)
      ui.sectionEnd();ui.buttonRow()
      local ready=equal(applied,pending)
      if not ready then ui.text(4,"Apply visuals") elseif meta.count<32 then ui.text(5,"Battle (fresh {{OPPONENT}})") end
      ui.text(9,"Finish");ui.bindEscape(9)
      local action=ui.wait()
      if action==9 then break end
      if action==1 or action==2 then
        local id=pick(action==1 and "Sprite flight | mode 1" or "Particle flight | mode 2",action==1 and "sprite" or "particle",carrier)
        if id then pending.flymode,pending.flylook=action,id end
      elseif action==3 then local id=pick("Impact effect","impact",carrier);if id then pending.look=id end
      elseif action==4 and not ready then
        assert(equal(read(),applied),"Applied values changed unexpectedly");supported(pending)
        changed=true;write(pending);applied=copy(pending);revision=revision+1
        status="Applied and read back. Fresh target: "..targetLabel
        coe5.log("wb_compare applied r"..revision.." weapon="..weapon.." "..describe(applied))
      elseif action==5 and ready and meta.count<32 then
        assert(equal(read(),applied),"Visuals changed before battle");supported(applied)
        checkTarget()
        assert(coe5.openTestField(carrier,-1,{{TARGETID}},{{COUNT}}),"Fresh field refused")
        opened=true
        local defender=readDefender()
        coe5.log("wb_compare start battle="..(meta.count+1).." carrier="..carrier.." weapon="..weapon.." "..describe(applied))
        coe5.fightTestField()
        coe5.closeTestField();opened=false
        assert(equal(read(),applied),"Visuals changed during battle")
        local n=meta.count+1
        local row=copy(applied);row.parameter=revision;row.battles=1;row.readback=1
        {{READING}}
        results["sample"..n]=row;meta.count=n
        assert(coe5.writeIni(file,results)==true,"Could not save battle readback")
        status=n==32 and "32 battles saved. Finish and review in Workbench." or "Battle "..n.." saved. "..describeDefender(defender)
        coe5.log("wb_compare field closed; saved battle="..n.." revision="..revision.." "..describe(applied))
      end
    end
  end)
  if opened then local closed,err=pcall(coe5.closeTestField);if not closed then ok,why=false,err end end
  if restore then local restored,err=pcall(restore);if not restored then ok,why=false,tostring(why or "").." Restoration: "..tostring(err) end end
  busy=false
  if not ok then coe5.log("wb_compare error "..tostring(why));coe5.showMessageBox("Ranged comparison",tostring(why)) end
end
coe5.addMainMenuButton("WB test: "..mod,run)
