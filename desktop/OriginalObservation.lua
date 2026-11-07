-- Original-record observation, pinned CoE5 5.43 / CoE5SE 2.13.0.
-- No weapon/spell writes, standIn substitution, forced fire or partial clone.
local record_kind,record_id,record_name,mod_id={{KIND}},{{RID}},{{NAME}},{{MODID}}
local enemy_name,enemy_id,count={{ENEMY}},{{ENEMYID}},{{COUNT}}
local active,held,fighting,stop_requested=false,false,false,false
local request,painted_dock=nil,nil
local corner=false
local battle_returns,stop_requests=0,0
local observed={}
{{DOCK}}
local function report(text)coe5.showMessageBox("Original record observation",text)end
local function log(text)coe5.log("wb_original mod="..mod_id.." "..text)end
local function binding()
  local data=coe5.readIni("workbench-session");local c=data and data.session
  local function hex(v,n)return type(v)=="string" and #v==n and v:match("^[0-9a-f]+$")end
  if not c or c.schema~="wb-session-1" or c.mod~=mod_id or not hex(c.id,32) or not hex(c.revision,64) or not hex(c.run,32) then return nil end
  return c
end
local function save(stage,message)
  log("stage="..stage.." battle_returns="..battle_returns.." "..(message or ""))
  local c=binding();if not c then return end
  local meta={schema="wb-original-1",session=c.id,revision=c.revision,run=c.run,mod=mod_id,kind=record_kind,requested=record_name,requestedid=record_id or -1,stage=stage,battles=battle_returns,stops=stop_requests,forcedcasts=0}
  for k,v in pairs(observed)do meta[k]=tostring(v)end
  if message then meta.message=tostring(message):gsub("[\r\n]"," "):sub(1,1500)end
  if coe5.writeIni("wb-original-"..c.run,{meta=meta})~=true then report("Observation file was refused. Use the log and your own notes; no result is inferred.")end
end
local function pick(title,rows,routes)
  if #rows==0 then return nil end
  local query,page="",0
  while true do
    local shown={};local numeric=query:match("^#?(%d+)$")
    for _,r in ipairs(rows)do if query=="" or numeric and r.id==tonumber(numeric) or not numeric and r.name:lower():find(query:lower(),1,true)then shown[#shown+1]=r end end
    local size=math.max(1,math.min(8,(coe5.get("screenH")-190)//30));local last=math.max(0,(#shown-1)//size);page=math.min(page,last)
    coe5.ui.screenBegin(title);coe5.ui.sectionBegin(routes and "Observation route | choose explicitly"or"Loaded native IDs | choose explicitly")
    coe5.ui.text(0,#shown.." matches | page "..(page+1).."/"..(last+1));local allowed={}
    for i=page*size+1,(page+1)*size do local r=shown[i];if r then allowed[1000+i]=r;coe5.ui.text(1000+i,routes and r.name or"#"..r.id.." "..r.name)end end
    if #shown==0 then coe5.ui.text(0,"No matches; clear search.")end
    coe5.ui.sectionEnd();coe5.ui.buttonRow();coe5.ui.text(1,"Search...");coe5.ui.text(2,"Clear");if page>0 then coe5.ui.text(3,"Previous")end;if page<last then coe5.ui.text(4,"Next")end;coe5.ui.text(9,"Cancel");coe5.ui.bindEscape(9)
    local chosen=coe5.ui.wait();if chosen==9 then return nil elseif allowed[chosen]then return allowed[chosen]
    elseif chosen==1 then local q=coe5.ui.nameBox("Find loaded record","Partial name or #ID",0,42);if q~=nil then query,page=q,0 end
    elseif chosen==2 then query,page="",0 elseif chosen==3 then page=math.max(0,page-1) elseif chosen==4 then page=math.min(last,page+1)end
  end
end
local function native_record()
  local upper=record_kind=="spell" and 1028 or 1199
  local function name(id)if record_kind=="spell" then local v=coe5.spellInfo(id);return v and v.name end;return coe5.get("weaponName",id)end
  if record_id~=nil then if record_id<0 or record_id>upper or name(record_id)~=record_name then error("Selected native ID/name does not match this runtime. Load the verified installed-game catalog; no name fallback was used.")end;return record_id end
  local found,n=nil,0;for id=0,upper do if name(id)==record_name then found,n=id,n+1 end end
  if n~=1 then error("The native name is missing or duplicated. Load the installed catalog and select an explicit ID.")end
  return found
end
local function users(weapon,info)
  local rows={};local last=coe5.get("monsterLastIndex");if type(last)~="number" or last<0 or last>6998 then error("Monster enumeration unavailable.")end
  local magic={[3]=true,[6]=true,[14]=true,[15]=true,[19]=true}
  for id=0,math.min(last,1999)do
    local n=coe5.get("monsterName",id);local eligible=false
    if n and n~="" then
      if info then
        for row=0,15 do local t=coe5.get("monsterAttackType",id,row);if not t then break end;if magic[t] and coe5.get("monsterAttackWeapon",id,row)==info.path and coe5.get("monsterAttackValue",id,row)>=info.level then eligible=true;break end end
      else local t=coe5.get("monsterAttackType",id,0);eligible=(t==1 or t==2) and coe5.get("monsterAttackWeapon",id,0)==weapon end
    end
    if eligible then rows[#rows+1]={id=id,name=n}end
  end
  return rows
end
local words={"dmg","dmgtype","range","init","aoe","trgrank","look","flymode","flylook","sound","flysound"}
local function snapshot(w)local t={};for _,key in ipairs(words)do t[key]=coe5.get("weapon",w,key);if type(t[key])~="number"then error("Required numeric original field unavailable: "..key)end end;return t end
local function unchanged(a,b)for _,key in ipairs(words)do if a[key]~=b[key]then return false end end;return true end
local function run()
  if active then return end
  observed={};battle_returns,stop_requests=0,0
  local opened,weapon,baseline=false,nil,nil
  local ok,why=pcall(function()
    if coe5.get("activePlayer")~=-1 then error("Observe from the main menu with no campaign loaded.")end
    if coe5.get("screenW")<640 or coe5.get("screenH")<480 then error("Loaded-record pickers need 640 x 480 UI units.")end
    local selected=native_record();local spell=-1;local actor_rows
    if record_kind=="spell" then spell=selected;local info=coe5.spellInfo(spell);weapon=info.weapon;actor_rows=users(weapon,info)
    else
      weapon=selected;local carriers=users(weapon,nil);local spells={}
      for id=0,1028 do local info=coe5.spellInfo(id);if info and info.weapon==weapon then spells[#spells+1]={id=id,name=info.name}end end
      local routes={};if #carriers>0 then routes[#routes+1]={id=1,name="First melee/ranged attack"}end;if #spells>0 then routes[#routes+1]={id=2,name="Through a native spell using this weapon"}end
      if #routes==0 then error("No supported native first-attack carrier or associated spell exists. Later/special attack rows need a separate fixture; no substitute or partial copy was made.")end
      local route=pick("How to observe this original weapon",routes,true);if not route then return end
      if route.id==1 then actor_rows=carriers else local chosen=pick("Native spells using this weapon",spells);if not chosen then return end;spell=chosen.id;actor_rows=users(weapon,coe5.spellInfo(spell))end
    end
    if weapon<0 or weapon>1199 or not coe5.get("weaponName",weapon)or coe5.get("weaponName",weapon)==""then error("Effect weapon is not a named native record.")end
    if #actor_rows==0 then error("No native caster/carrier with a matching attack path/level was found. No field was opened. A verified private caster fixture is needed for this record.")end
    local actor=pick("Choose a loaded native caster/carrier",actor_rows);if not actor then return end
    local enemy=enemy_id
    if enemy~=nil then if coe5.get("monsterName",enemy)~=enemy_name then error("Enemy ID/name differs; select a current variant.")end
    else local n=0;for id=0,1999 do if coe5.get("monsterName",id)==enemy_name then enemy,n=id,n+1 end end;if n~=1 then error("Enemy is missing/duplicated; select its ID.")end end
    baseline=snapshot(weapon);observed.selected=selected;observed.weapon=weapon;observed.weaponname=coe5.get("weaponName",weapon);observed.spell=spell;observed.caster=actor.id;observed.castername=actor.name;observed.knownunchanged=1
    if spell>=0 then local info=coe5.spellInfo(spell);observed.spellname=info.name;observed.path=info.path;observed.level=info.level;observed.payload=tostring(info.dmg)else observed.payload=tostring(coe5.get("monsterAttackValue",actor.id,0))end
    for k,v in pairs(baseline)do observed[k]=tostring(v)end
    -- Deliberately only four arguments: no standIn and no shared weapon substitution.
    if not coe5.openTestField(actor.id,spell,enemy,count)then error("Original observation field open refused; inspect the isolated log.")end
    opened=true;observed.knownunchanged=unchanged(baseline,snapshot(weapon))and 1 or 0
    if observed.knownunchanged~=1 then error("Known fields changed during field open. No shared writes/restoration attempted; quit the disposable session.")end
    active,held,request,painted_dock=true,false,nil,nil;save("opened","Original loaded; no reconstruction. AI may make zero or several casts.")
    while active do
      if request=="close"then break end
      coe5.drawTestField();if not workbenchDock("fixed",false,corner)then error("Viewport too small; close and resize the disposable session.")end;local action=request;request=nil
      if action=="close"then break
      elseif action=="move"then corner=not corner
      elseif action=="details"then report("Original "..record_kind.." #"..selected.." "..record_name..". Weapon #"..weapon.."; actor #"..actor.id.."; spell #"..spell..". Battle returns: "..battle_returns..". AI controls casting; actual casts are not counted. No forced fire/range changes, edits or clone. Fixed grass field; targets/flags may make the effect inapplicable.")
      elseif action=="battle"then
        if not unchanged(baseline,snapshot(weapon))then error("Known source fields changed before the battle. Stop; no writes or restoration to shared records were attempted.")end
        fighting,stop_requested=true,false;local fought,reason=pcall(coe5.fightTestField);fighting=false;if not fought then error(reason)end
        battle_returns=battle_returns+1;if stop_requested then stop_requests=stop_requests+1 end
        observed.knownunchanged=unchanged(baseline,snapshot(weapon))and 1 or 0;save("battle","Battle call returned; spell casts/visible success are not inferred.")
        if observed.knownunchanged~=1 then error("Known original weapon fields changed. Quit the disposable session; the helper will not overwrite shared data.")end
      end
    end
  end)
  active,fighting=false,false
  if opened then local closed,reason=pcall(coe5.closeTestField);if not closed then ok,why=false,"Field cleanup failed: "..tostring(reason)end end
  if baseline and weapon then local checked,values=pcall(snapshot,weapon);if checked then observed.knownunchanged=unchanged(baseline,values)and 1 or 0 else ok,why=false,"Could not compare known fields after cleanup: "..tostring(values)end end
  local stored,reason=pcall(save,ok and (opened and "closed" or "cancelled")or "error",ok and (opened and "Field close call returned; known numeric fields checked only. No full-record equivalence claim."or"Cancelled before field open.")or tostring(why))
  if not stored then report("Could not save the observation: "..tostring(reason))end
  if not ok then report(tostring(why))end
end
local needed={"get","set","wrap","spellInfo","openTestField","drawTestField","fightTestField","stopTestFight","closeTestField","readIni","writeIni","log","showMessageBox","addMainMenuButton"}
local ready=coe5.ui~=nil;for _,name in ipairs(needed)do if type(coe5[name])~="function"then ready=false end end
for _,name in ipairs({"screenBegin","sectionBegin","sectionEnd","text","buttonRow","bindEscape","wait","nameBox","drawRect","drawText"})do if not coe5.ui or type(coe5.ui[name])~="function"then ready=false end end
if ready then
  local draw=coe5.wrap("BATTLE_DRAW",function(next)
    next();if not active then return end
    local d=workbenchDock("fixed",false,corner);painted_dock=d;if not d then return end
    coe5.ui.drawRect(d.x,d.y,d.width,d.height,0.08,0.12,0.15,1)
    local labels={cast="Battle (AI)",close=fighting and "Stop / close"or"Close",move="Move"}
    for _,b in ipairs(d.buttons)do coe5.ui.drawRect(b[2],b[3],b[4],b[5],0.16,0.23,0.28,1);coe5.ui.drawText(b[2]+4,b[3]+7,11,labels[b[1]],1,1,1,1)end
    coe5.ui.drawText(d.x+8,d.y+48,11,"Original | AI casts uncounted | details",1,1,1,1)
  end)
  local wait=coe5.wrap("BATTLE_WAIT",function(next,block,mode)
    local id=next(block,mode);if not active then return id end
    local down=coe5.get("mouseButtons")==1;local d=painted_dock;if not workbenchSameView(d)then held=down;return id end
    local x,y=coe5.get("uiPointerX"),coe5.get("uiPointerY");local hit
    for _,b in ipairs(d.buttons)do if workbenchHit(b,x,y)then hit=b[1]end end
    if not hit and workbenchHit(d.status,x,y)then hit="details"end
    if down and hit then
      if not held then
        if fighting then if hit=="close"then stop_requested=true;request="close";coe5.stopTestFight()end
        else request=hit=="cast"and"battle"or hit end
      end
      held=true;coe5.set("mouseButtons",0);return 0
    end
    held=down;return id
  end)
  if draw==true and wait==true then coe5.addMainMenuButton("WB test: "..mod_id,run)end
else print("Original observation needs the pinned CoE5SE field, picker and data APIs.")end
