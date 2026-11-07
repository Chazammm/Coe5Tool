-- Workbench weapon-edit-v4. Independently implemented; CoE5SE 2.13.0 only.
-- Contract: https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/coe5.lua
-- Only this canonical test mod's new weapon is written. No standIn/shared record writes.
local spell_name, weapon_name = {{SPELL}}, {{WEAPON}}
local caster_name, enemy_name, mod_id = {{CASTER}}, {{ENEMY}}, {{MODID}}
local caster_preferred, enemy_preferred, source_mode = {{CASTERID}}, {{ENEMYID}}, {{MODE}}
local initial_type, initial_area = {{DMGTYPE}}, {{AOE}}
local scalar_names={"slash","blunt","pierce","fire","cold","shock","magic","fear","poison","acid"}
local function allowed_type(value)return initial_type>=1 and initial_type<=10 and value>=1 and value<=10 or value==initial_type end
local initial_visual={look={{LOOK}},flymode={{FLYMODE}},flylook={{FLYLOOK}}}
local fields={"dmgtype","aoe","look","flymode","flylook"}
local active,request,held,hooks_ok=false,nil,false,false
local pending,applied,baseline,export_baseline,parameter_revision
local collapsed,corner,flight_choice_needed=false,false,false
local painted_dock=nil
local notice=""
local history,sequence,panel_sequence,current_sample,catalog_revision={},0,0,nil,0
{{DOCK}}
local function report(text)
  if type(coe5.showMessageBox)=="function" then coe5.showMessageBox("Workbench experiment",text) else print(text) end
end
local function log(action,detail)
  coe5.log("wb_weapon_edit mod="..mod_id.." action="..action.." source_snapshot=fixed parameter_revision="..tostring(parameter_revision).." "..(detail or ""))
end
local function copy(v)local n={};for _,key in ipairs(fields)do n[key]=v[key] end;return n end
local function same(a,b)for _,key in ipairs(fields)do if a[key]~=b[key] then return false end end;return true end
local function integer(v,min,max)return type(v)=="number" and v%1==0 and v>=min and v<=max end
local function valid_values(v)
  if not (integer(v.dmgtype,1,25) and allowed_type(v.dmgtype) and integer(v.aoe,0,200) and (v.aoe==0 or v.aoe==1 or v.aoe==5 or v.aoe==initial_area)) then return false end
  if not (integer(v.look,0,299) or v.look==baseline.look) then return false end
  return (v.flymode==baseline.flymode and v.flylook==baseline.flylook) or (integer(v.flymode,2,9) and integer(v.flylook,0,299))
end
local function describe(v)return "type "..v.dmgtype..", area "..v.aoe..", impact "..v.look..", flight "..v.flymode.."/"..v.flylook end
local function context()
  if type(coe5.readIni) ~= "function" or type(coe5.writeIni) ~= "function" then error("Data-file APIs unavailable. The field still works; use a labeled manual return.") end
  local data = coe5.readIni("workbench-session")
  local c = data and data.session
  local function hex(value, count) return type(value) == "string" and #value == count and value:match("^[0-9a-f]+$") end
  if not c or c.schema ~= "wb-session-1" or c.mod ~= mod_id or not hex(c.id,32) or not hex(c.revision,64) or not hex(c.run,32) then error("No valid isolated launch binding. Prepare a new desktop session, or return values manually.") end
  return c
end
local function meta(c, schema)
  return {schema=schema, session=c.id, revision=c.revision, run=c.run, mod=mod_id}
end
local function remember(kind,v)
  sequence=sequence+1
  current_sample=copy(v)
  current_sample.index,current_sample.panel,current_sample.parameter=sequence,panel_sequence,parameter_revision
  current_sample.casts,current_sample.readback,current_sample.kind=0,1,kind
  history[#history+1]=current_sample
  if #history>32 then table.remove(history,1) end
end
local function save_values()
  local ok,why=pcall(function()
    local c=context()
    if #history==0 then error("No read-back values are available yet.") end
    local data={meta=meta(c,"wb-results-2")}
    data.meta.spell,data.meta.weapon,data.meta.format,data.meta.count=spell_name,weapon_name,source_mode,#history
    for _,key in ipairs({"look","flymode","flylook"})do data.meta["baseline"..key]=export_baseline[key] end
    for i,sample in ipairs(history)do data["sample"..i]=sample end
    if coe5.writeIni("wb-result-"..c.run,data)~=true then error("Result file was refused. No desktop changes were made.") end
    notice="Saved "..#history.." read-back snapshots. Quit, then Return test values. Pending controls excluded."
  end)
  if not ok then report(tostring(why)) end
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
local function export_choices()
  local ok, why = pcall(function()
    local c = context(); catalog_revision = catalog_revision + 1
    local function capture(part, kind, upper, fetch)
      local rows, complete = {}, 1
      for id=0,upper do
        local read, row = pcall(fetch,id)
        if not read then complete=0;break end
        if row then rows[#rows+1]=row end
      end
      local data={meta=meta(c,"wb-catalog-part-1")}
      data.meta.export, data.meta.kind, data.meta.count, data.meta.complete, data.meta.upper = catalog_revision, kind, #rows, complete, upper
      for i,row in ipairs(rows) do data["entry"..i]=row end
      if coe5.writeIni("wb-cat-"..part.."-"..c.run,data) ~= true then error("Catalog part refused: "..part..". No complete new catalog was committed.") end
    end
    local last=coe5.get("monsterLastIndex")
    if type(last) ~= "number" or last<0 or last>6998 or last%1~=0 then error("Monster table bound unavailable.") end
    capture("monsters","monster",last,function(id)
      local n=coe5.get("monsterName",id);if n and n~="" then return {id=id,name=n} end
    end)
    capture("weapons","weapon",6998,function(id)
      local n=coe5.get("weaponName",id);if not n or n=="" then return nil end
      local row={id=id,name=n}
      for _,key in ipairs({"look","flymode","flylook","sound","flysound"}) do
        local read,value=pcall(coe5.get,"weapon",id,key)
        if read and type(value)=="number" and value%1==0 then row[key]=value end
      end
      return row
    end)
    capture("spells","spell",4095,function(id)
      local info=coe5.spellInfo(id);if info then return {id=id,name=info.name,path=info.path,level=info.level,weapon=info.weapon} end
    end)
    capture("effects","effect",299,function(id) return {id=id,name=coe5.lookName(id) or ""} end)
    local header={meta=meta(c,"wb-catalog-1")};header.meta.export=catalog_revision
    if coe5.writeIni("wb-cat-meta-"..c.run,header) ~= true then error("Catalog commit refused. Keep the previous snapshot or try again.") end
    report("Runtime choice tables saved for this launch. Quit, then load this session in Browse choices. Names/IDs only; no VFX preview or sound-name enumeration.")
  end)
  if not ok then report(tostring(why)) end
end
local function resolve()
  local spell_id, weapon_id, matches, weapons = nil, nil, 0, 0
  for id = 0, 4095 do
    local info = coe5.spellInfo(id)
    if info and string.lower(info.name) == string.lower(spell_name) then
      matches = matches + 1
      if info.path ~= {{PATH}} or info.level ~= {{LEVEL}} or info.dmg ~= {{DAMAGE}} then error("Loaded spell differs from the prepared source.") end
      spell_id, weapon_id = id, info.weapon
    end
  end
  for id = 0, 6998 do
    local name = coe5.get("weaponName", id)
    if name and string.lower(name) == string.lower(weapon_name) then weapons = weapons + 1 end
  end
  if matches ~= 1 or weapons ~= 1 or coe5.get("weaponName", weapon_id) ~= weapon_name then
    error("Spell or scratch weapon is missing, ambiguous or relinked. Regenerate with unique names.")
  end
  return spell_id, weapon_id
end
-- Native menu loops run between battle frames, never inside a drawing/input callback.
local function picker_ready()
  if coe5.get("screenW")<640 or coe5.get("screenH")<480 then error("The native Effects menu needs at least 640 x 480 UI units. Resize before opening Effects; the compact field controls remain available.") end
  for _,key in ipairs({"screenBegin","sectionBegin","sectionEnd","text","buttonRow","bindEscape","wait"})do
    if type(coe5.ui[key])~="function" then error("Native picker API unavailable. Existing Type/Area controls and the fixed field remain usable.") end
  end
end
local mode_names={[2]="standard",[3]="fast",[4]="faster",[5]="line",[6]="standard*",[7]="line*",[8]="slow line",[9]="meteor"}
local function effect_name(id)
  if type(coe5.lookName)~="function" then return "name unavailable" end
  return coe5.lookName(id) or "unnamed table row"
end
local function effect_label(id)
  local name=effect_name(id);return #name>36 and name:sub(1,33).."..." or name
end
local function pick_effect(title,caster)
  local query,page="",0
  while true do
    local rows={};local numeric=query:match("^#?(%d+)$")
    for id=0,299 do
      local name=effect_name(id)
      if query=="" or (numeric and id==tonumber(numeric)) or (not numeric and string.lower(name):find(string.lower(query),1,true)) then rows[#rows+1]={id,name} end
    end
    local count=(coe5.get("screenH")-190)//30;if count<1 then count=1 elseif count>8 then count=8 end
    local last=#rows==0 and 0 or (#rows-1)//count;if page>last then page=last end
    local allowed={}
    coe5.ui.screenBegin(title)
    coe5.ui.sectionBegin("Loaded effect table | not a preview")
    coe5.ui.text(0,#rows.." matches | page "..(page+1).."/"..(last+1))
    coe5.ui.text(0,query=="" and "All 300 table rows; names may be absent." or "Filter: "..query)
    if #rows==0 then coe5.ui.text(0,"No matches. Clear search or use a different partial name / #ID.") end
    for i=page*count+1,(page+1)*count do
      local row=rows[i];if row then allowed[1000+row[1]]=row[1];coe5.ui.text(1000+row[1],"#"..row[1].."  "..effect_label(row[1])) end
    end
    coe5.ui.sectionEnd();coe5.ui.buttonRow()
    coe5.ui.text(1,"Search...");coe5.ui.text(2,"Clear");if page>0 then coe5.ui.text(3,"Previous") end;if page<last then coe5.ui.text(4,"Next") end
    coe5.ui.text(9,"Back");coe5.ui.bindEscape(9)
    local id=coe5.ui.wait()
    if id==9 then return nil elseif allowed[id]~=nil then return allowed[id]
    elseif id==1 then
      if type(coe5.ui.nameBox)=="function" then
        local text=coe5.ui.nameBox("Find effect","Partial loaded name or #ID; empty shows all rows.",coe5.get("monsterSprite",caster),42)
        if text~=nil then query,page=text,0 end
      else report("Search input unavailable. Browse pages or choose effect IDs in the desktop before preparing.") end
    elseif id==2 then query,page="",0 elseif id==3 and page>0 then page=page-1 elseif id==4 and page<last then page=page+1 end
  end
end
local function pick_mode()
  while true do
    coe5.ui.screenBegin("Flight mode | effect-table subset")
    coe5.ui.sectionBegin("Documented labels; appearance must be tested")
    for id=2,9 do coe5.ui.text(id,"#"..id.."  "..mode_names[id]) end
    coe5.ui.text(0,"Mode 1 uses sprites: retain the baseline pair, or choose an effect mode.")
    coe5.ui.sectionEnd();coe5.ui.buttonRow();coe5.ui.text(99,"Back");coe5.ui.bindEscape(99)
    local id=coe5.ui.wait();if id==99 then return nil elseif mode_names[id] then return id end
  end
end
local function edit_effects(caster)
  picker_ready()
  while true do
    coe5.ui.screenBegin("Weapon effects | pending until Apply")
    coe5.ui.sectionBegin("Readback r"..parameter_revision.." | pending choices below")
    coe5.ui.text(0,"Applied type/area: "..applied.dmgtype.." / "..applied.aoe.."; impact #"..applied.look)
    coe5.ui.text(0,"Applied flight: "..applied.flymode.." / "..applied.flylook)
    coe5.ui.text(1,"Impact #"..pending.look.." | "..(integer(pending.look,0,299) and effect_label(pending.look) or "baseline only"))
    coe5.ui.text(2,"Flight mode #"..pending.flymode.." | "..(mode_names[pending.flymode] or (pending.flymode==1 and "sprites; baseline only" or "baseline mode; unverified")))
    coe5.ui.text(3,"Flight #"..pending.flylook.." | "..(integer(pending.flymode,2,9) and integer(pending.flylook,0,299) and effect_label(pending.flylook) or (pending.flymode==1 and "sprite ID; baseline only" or "baseline value; mode unverified")))
    if flight_choice_needed then coe5.ui.text(0,"Choose a flight effect for the new interpretation before Apply.") end
    coe5.ui.text(4,"Use original impact/flight values")
    coe5.ui.text(5,corner and "Dock: upper right | move to bottom" or "Dock: bottom center | move to upper right")
    coe5.ui.text(0,"Sound, spell damage and other weapon fields are not edited.")
    coe5.ui.sectionEnd();coe5.ui.buttonRow();coe5.ui.text(9,"Back to field");coe5.ui.bindEscape(9)
    local id=coe5.ui.wait()
    if id==9 then notice="Effect choices are pending. Apply before casting. Tap status for full values.";return
    elseif id==1 then local v=pick_effect("Impact look",caster);if v~=nil then pending.look=v end
    elseif id==2 then local v=pick_mode();if v then
      if not integer(pending.flymode,2,9) then pending.flylook=0;flight_choice_needed=true end
      pending.flymode=v
    end
    elseif id==3 then
      if integer(pending.flymode,2,9) then local v=pick_effect("Flight effect (not a sprite)",caster);if v~=nil then pending.flylook=v;flight_choice_needed=false end
      else report("Flight mode 1 uses sprites; no complete verified sprite picker is available. Keep its baseline pair, or choose mode 2-9 and an effect explicitly.") end
    elseif id==4 then for _,key in ipairs({"look","flymode","flylook"})do pending[key]=baseline[key] end;flight_choice_needed=false
    elseif id==5 then corner=not corner end
  end
end
local function run_test()
  if active then return end
  local opened,wrote,weapon_id=false,false,nil
  parameter_revision=0
  local function read_values()
    local v={};for _,key in ipairs(fields)do v[key]=coe5.get("weapon",weapon_id,key);if not integer(v[key],-2147483648,2147483647) then error("Invalid weapon read: "..key) end end;return v
  end
  local function write_and_check(v,restoring)
    if not restoring and not valid_values(v) then error("Unsupported experiment values. No cast performed.") end
    wrote=true
    local failures={}
    for _,key in ipairs(fields)do
      if restoring then local ok,why=pcall(coe5.set,"weapon",weapon_id,key,v[key]);if not ok then failures[#failures+1]=key..": "..tostring(why) end
      else coe5.set("weapon",weapon_id,key,v[key]) end
    end
    local accepted=read_values()
    if #failures>0 then error("Baseline writes failed: "..table.concat(failures,"; ")) end
    if not same(accepted,v) then error("Write rejected or readback differs: requested "..describe(v).."; read "..describe(accepted)..". No cast performed.") end
    return accepted
  end
  local function close_owned()
    if opened then opened=false;coe5.closeTestField();log("field_closed") end
  end
  local ok,reason=pcall(function()
    if not hooks_ok then error("Required experiment APIs or UI hooks are unavailable. Use supported CoE5SE 2.13.0.") end
    if coe5.get("activePlayer")~=-1 then error("Open the experiment from the main menu, with no game loaded.") end
    local dock,why=workbenchDock("edit",collapsed,corner);if not dock then error(why) end
    local caster,enemy=participant(caster_name,caster_preferred),participant(enemy_name,enemy_preferred)
    local spell_id;spell_id,weapon_id=resolve()
    if coe5.get("weapon",weapon_id,"dmg")~={{BASEDAMAGE}} then error("Loaded weapon payload differs from the prepared source.") end
    baseline=read_values()
    if baseline.dmgtype~=initial_type or baseline.aoe~=initial_area then error("Scratch baseline differs from the prepared source. Stop and inspect other mods.") end
    for key,value in pairs(initial_visual)do if baseline[key]~=value then error("Scratch visual baseline differs from prepared "..key..". Stop and inspect the fixture.") end end
    if export_baseline and not same(export_baseline,baseline) then error("Baseline changed between panel visits. Restart the isolated session before saving mixed snapshots.") end
    export_baseline=export_baseline or copy(baseline)
    pending,applied,flight_choice_needed=copy(baseline),copy(baseline),false
    local function open_owned()
      if not coe5.openTestField(caster,spell_id,enemy,{{COUNT}}) then error("Field open refused. Check coe5mod.log; another field may be open.") end
      opened=true;log("field_opened","weapon="..weapon_id)
    end
    open_owned();panel_sequence=panel_sequence+1;remember("baseline",baseline)
    active,held,request,painted_dock=true,false,nil,nil
    notice="Baseline loaded: "..describe(applied)..". Effects opens pending choices. Tap this status for full details."
    while active do
      coe5.drawTestField()
      local dock,why=workbenchDock("edit",collapsed,corner);if not dock then error(why) end
      local action=request;request=nil
      if action=="close" then break
      elseif action=="collapse" then collapsed=not collapsed
      elseif action=="details" then report("UI "..dock.screenW.." x "..dock.screenH..". Applied/read back r"..parameter_revision..": "..describe(applied)..". Pending: "..describe(pending)..". "..notice.." Forced item-style field; not ordinary combat or a VFX preview.")
      elseif action=="type" then
        if initial_type>=1 and initial_type<=10 then pending.dmgtype=pending.dmgtype%10+1;notice="Pending type #"..pending.dmgtype.." ("..scalar_names[pending.dmgtype].."). Apply before casting."
        else notice="This type uses a special payload. Type/payload are fixed; change them in the desktop draft and prepare a new test." end
      elseif action=="area" then
        if pending.aoe==0 then pending.aoe=1 elseif pending.aoe==1 then pending.aoe=5 elseif pending.aoe==5 and initial_area~=0 and initial_area~=1 and initial_area~=5 then pending.aoe=initial_area else pending.aoe=0 end
        notice="Pending area changed. Apply before casting."
      elseif action=="effects" then local edited,why=pcall(edit_effects,caster);if not edited then report(tostring(why)) end
      elseif action=="apply" then
        if flight_choice_needed then notice="Choose the flight effect for the new mode first. No write or cast performed."
        else applied=write_and_check(pending,false);parameter_revision=parameter_revision+1;remember("applied",applied);log("applied",describe(applied));notice="Readback accepted r"..parameter_revision..": "..describe(applied) end
      elseif action=="cast" then
        if flight_choice_needed or not same(pending,applied) then notice="Unapplied settings: use Apply first. No cast performed.";log("cast_blocked","pending_settings")
        else
          local current_spell,current_weapon=resolve();if current_spell~=spell_id or current_weapon~=weapon_id then error("Spell or weapon association changed. No cast performed.") end
          if coe5.get("weapon",weapon_id,"dmg")~={{BASEDAMAGE}} then error("Weapon payload changed outside the helper. No cast performed.") end
          if not same(read_values(),applied) then error("Scratch values changed after Apply. No cast performed.") end
          log("cast_requested",describe(applied));coe5.fireTestField();current_sample.casts=current_sample.casts+1;log("cast_returned");notice="Cast call returned. Observe the effect/log yourself. Reset targets before comparing."
        end
      elseif action=="reset" then close_owned();open_owned();notice="Fresh targets; applied settings retained. Pending changes still need Apply.";log("targets_reset")
      elseif action=="save" then save_values() end
    end
  end)
  active,request=false,nil
  local closed,why=pcall(close_owned);if not closed then ok,reason=false,"Field cleanup failed: "..tostring(why) end
  if wrote then
    local restored,why=pcall(function()write_and_check(baseline,true);log("baseline_restored",describe(baseline))end)
    if not restored then ok,reason=false,tostring(reason or "").." Baseline restoration failed: "..tostring(why) end
  end
  if not ok then if type(coe5.log)=="function" then pcall(log,"error",tostring(reason)) end;report(tostring(reason)) end
end
local required={"wrap","get","set","log","findMonster","spellInfo","openTestField","drawTestField","fireTestField","closeTestField"}
local available=coe5.ui~=nil
for _,key in ipairs(required)do if type(coe5[key])~="function" then available=false end end
if available and type(coe5.ui.drawRect)=="function" and type(coe5.ui.drawText)=="function" then
  local draw=coe5.wrap("BATTLE_DRAW",function(next)
    next();if not active then return end
    local d=workbenchDock("edit",collapsed,corner);painted_dock=d;if not d then return end
    coe5.ui.drawRect(d.x,d.y,d.width,d.height,0.08,0.12,0.15,1)
    local labels={apply="Apply",cast="Cast once",reset="Reset targets",close="Close test",collapse=collapsed and "+" or "-",type="Type: #"..pending.dmgtype..(scalar_names[pending.dmgtype] and " "..scalar_names[pending.dmgtype] or " fixed"),area="Area: "..pending.aoe,effects="Effects...",save="Save test values"}
    for _,b in ipairs(d.buttons)do coe5.ui.drawRect(b[2],b[3],b[4],b[5],0.16,0.23,0.28,1);coe5.ui.drawText(b[2]+4,b[3]+7,11,labels[b[1]],1,1,1,1) end
    if d.status then
      coe5.ui.drawText(d.x+8,d.y+94,11,"Readback r"..parameter_revision..(same(pending,applied) and " | tap status" or " | PENDING"),1,1,1,1)
      coe5.ui.drawText(d.x+8,d.y+78,11,workbenchShort(notice),1,1,1,1)
    end
  end)
  local wait=coe5.wrap("BATTLE_WAIT",function(next,block,mode)
    local id=next(block,mode);if not active then return id end
    local down=coe5.get("mouseButtons")==1;local x,y=coe5.get("uiPointerX"),coe5.get("uiPointerY")
    local d=painted_dock;if not workbenchSameView(d) then held=down;return id end
    local hit=nil
    for _,b in ipairs(d.buttons)do if workbenchHit(b,x,y) then hit=b[1];break end end
    if not hit and workbenchHit(d.status,x,y) then hit="details" end
    if down and hit then if not held then request=hit end;held=true;coe5.set("mouseButtons",0);return 0 end
    held=down;return id
  end)
  hooks_ok=draw==true and wait==true
end
if type(coe5.addMainMenuButton)=="function" then coe5.addMainMenuButton({{MENU}},run_test);coe5.addMainMenuButton("WB choices: "..mod_id,export_choices)
else print("Workbench experiment requires CoE5SE 2.13.0 and a supported game build.") end
