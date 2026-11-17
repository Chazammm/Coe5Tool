-- Workbench effects browser. Independently authored for official CoE5SE 3.4.4 / CoE5 5.43.
-- No shared-record setters, standIn substitution, AI battle or game-file writes.
local mod, target_id, target_name, target_count = {{MODID}}, {{TARGETID}}, {{TARGETNAME}}, {{COUNT}}
local private_weapon, private_spell = {{WEAPON}}, {{SPELL}}
local roles = {{ROLES}}
local B = {category="spells", query="", page=0, selected=nil, rows={}, history={}, opened=false, active=false, held=true, modal=false, casting=false, collapsed=false, castable=true, inspecting=false, inspectPage=0}
local categories={"spells","weapons","impact","particle","sprite","effects"}
local titles={spells="Spells",weapons="Weapons",impact="Impacts",particle="Flights",sprite="Sprites",effects="All VFX"}
local scalar_names={"slash","blunt","pierce","fire","cold","shock","magic","fear","poison","acid"}
local words={"dmg","dmgtype","range","init","aoe","trgrank","look","flymode","flylook","sound","flysound","nextalwayswep"}
local function integer(v,a,z)return type(v)=="number" and v%1==0 and v>=a and v<=z end
local function clean(v)return tostring(v):gsub("[%c]"," "):sub(1,1500)end
local function short(v,n)v=clean(v);return #v>n and v:sub(1,n-3).."..." or v end
local function report(text)coe5.showMessageBox("Test Effects",text)end
local function snapshot(id)
  local values={};for _,key in ipairs(words)do local ok,value=pcall(coe5.get,"weapon",id,key);if ok and type(value)=="number"then values[key]=value end end
  return values
end
local function same(a,b)for key,value in pairs(a)do if b[key]~=value then return false end end;for key,value in pairs(b)do if a[key]~=value then return false end end;return true end
local function spell_reason(row)
  if not integer(row.weapon,0,1199)then return "Missing native weapon link; inspect only." end
  if type(row.payload)~="number"or row.payload~=row.payload or row.payload%1~=0 then return "Original spell payload is unavailable; no reconstructed value is substituted."end
  -- Request the original native record. Its payload/masks, flags, chains and targeting remain engine-owned.
  -- This is not the scalar-payload validator used for a newly generated or copied definition.
end
local function available(role,id)
  local r=roles[role] and roles[role][id];if not r then return false end
  if role~="sprite" and coe5.lookName(id)~=r[1]then return false end
  if r[2] then
    if role=="impact" then return coe5.get("weapon",r[2],"look")==id end
    return coe5.get("weapon",r[2],"flymode")== (role=="sprite" and 1 or 2) and coe5.get("weapon",r[2],"flylook")==id
  end
  return true
end
local function sort(rows)
  table.sort(rows,function(a,b)local x,y=a.name:lower(),b.name:lower();if x~=y then return x<y end;return a.id<b.id end)
  return rows
end
local function matches(row,query)
  query=query:lower();local numeric=query:match("^#?(%d+)$")
  return query=="" or numeric and tostring(row.id):find(numeric,1,true)~=nil or not numeric and row.name:lower():find(query,1,true)~=nil
end
local function filtered()
  local result={};for _,row in ipairs(B.rows[B.category] or {})do if (not B.castable or B.category=="effects"or not row.reason)and matches(row,B.query)then result[#result+1]=row end end;return result
end
local function load_catalog()
  B.rows={spells={},weapons={},impact={},particle={},sprite={},effects={}}
  local weapons={}
  for id=0,1199 do
    local name=coe5.get("weaponName",id)
    if name and name~=""then local r={kind="weapons",id=id,name=name,values=snapshot(id)};weapons[id]=r;B.rows.weapons[#B.rows.weapons+1]=r end
  end
  for id=0,1028 do
    local s=coe5.spellInfo(id)
    if s and type(s.name)=="string" and s.name~=""then
      local w=weapons[s.weapon];local r={kind="spells",id=id,name=s.name,path=s.path,level=s.level,weapon=s.weapon,payload=s.dmg,weaponname=w and w.name,values=w and w.values or {}}
      r.reason=spell_reason(r);B.rows.spells[#B.rows.spells+1]=r
    end
  end
  for id=0,299 do local name=coe5.lookName(id);B.rows.effects[#B.rows.effects+1]={kind="effects",id=id,name=name or "Unnamed / unavailable slot",reason="Slot metadata only. Use a supported Impacts or Flights role; unnamed rows have no verified role."}end
  for _,kind in ipairs({"impact","particle","sprite"})do
    for id,r in pairs(roles[kind])do
      local ok,value=pcall(available,kind,id)
      B.rows[kind][#B.rows[kind]+1]={kind=kind,id=id,name=r[1]or"Unnamed sprite",reason=not(ok and value)and"Pinned identity or native witness is unavailable; inspect only."or nil,witness=r[2]}
    end
  end
  for _,row in ipairs(B.rows.weapons)do local v=row.values
    if not((v.flymode==1 and available("sprite",v.flylook))or(v.flymode==2 and available("particle",v.flylook)))or not available("impact",v.look)then row.reason="Visual-only copy needs supported mode-1/2 flight and impact candidates; inspect only. Original AI observation remains in Vanilla Library."end
  end
  for _,rows in pairs(B.rows)do sort(rows)end
end
local function layout(w,h,collapsed)
  if not integer(w,700,100000)or not integer(h,480,100000)then return nil,"Resize to at least 700 x 480 UI units before opening Test Effects."end
  if collapsed then return {x=w-192,y=h-88,w=180,h=32,screenW=w,screenH=h,buttons={{"expand",w-188,h-84,172,24}}}end
  -- Leave the entire lower 140 UI units clear, not merely a fixed-width left log lane.
  local d={x=w-340,y=140,w=328,h=h-188,screenW=w,screenH=h,buttons={}}
  local function button(action,x,y,width,height,label,row)d.buttons[#d.buttons+1]={action,x,y,width,height or 26,label,row}end
  button("collapse",d.x+256,h-78,60,24,"Hide")
  button("cast",d.x+8,h-112,94,30,"Cast");button("reset",d.x+106,h-112,116,30,"Reset targets");button("close",d.x+226,h-112,90,30,"Close")
  for i,kind in ipairs(categories)do button("category:"..kind,d.x+8+((i-1)%3)*104,h-144-((i-1)//3)*29,100,25,titles[kind])end
  button("search",d.x+8,h-207,200,26,"Search: "..short(B.query==""and"name / #ID"or B.query,20))
  button(B.inspecting and"copy"or(B.category=="effects"or B.category=="spells")and"scope"or"filter",d.x+212,h-207,104,26,B.inspecting and"Copy values"or B.category=="effects"and"Inspect index"or B.category=="spells"and"All spells"or(B.castable and"Castable"or"All entries"))
  local size=math.max(1,math.min(9,(h-468)//27+1));local rows=filtered();local pages=math.max(1,(#rows+size-1)//size)
  B.page=math.min(B.page,pages-1);d.rows=rows;d.size=size;d.pages=pages
  if not B.inspecting then for n=1,size do local row=rows[B.page*size+n];if row then button("select",d.x+8,h-261-n*27,308,25,"#"..row.id.." "..short(row.name,33),row)end end end
  button("previous",d.x+8,148,68,24,"Previous");button("next",d.x+80,148,60,24,"Next")
  button(B.inspecting and"inspectBack"or"inspect",d.x+144,148,108,24,B.inspecting and"Back to list"or"Inspect / copy")
  button("clear",d.x+256,148,60,24,"Clear")
  return d
end
local function hit(b,x,y)return b and x>=b[2]and x<b[2]+b[4]and y>=b[3]and y<b[3]+b[5]end
local function binding()
  local data=coe5.readIni("workbench-session");local c=data and data.session
  local function hex(v,n)return type(v)=="string"and #v==n and v:match("^[0-9a-f]+$")end
  if not c or c.schema~="wb-session-1"or c.mod~=mod or not hex(c.id,32)or not hex(c.revision,64)or not hex(c.run,32)then error("Missing isolated launch identity; quit and start a fresh Workbench test.")end
  return c
end
local function save(stage,message)
  local c=binding();local data={meta={schema="wb-effects-1",session=c.id,revision=c.revision,run=c.run,mod=mod,stage=stage,requests=B.requests or 0,calls=B.calls or 0,count=#B.history,discarded=B.discarded or 0,message=clean(message or""),runtime="3.4.4",visualobserved="unknown",hit="unknown"}}
  for i,row in ipairs(B.history)do data["entry"..i]=row end
  if coe5.writeIni("wb-effects-"..c.run,data)~=true then error("Browser receipt was refused. No desktop change was made; preserve the isolated logs.")end
end
local function remember(kind,row,values)
  if #B.history>=64 then table.remove(B.history,1);B.discarded=(B.discarded or 0)+1 end
  local weapon=row.weapon or(row.kind=="weapons"and kind=="inspected"and row.id)or(row.kind~="effects"and B.scratchWeapon)or -1
  local r={event=kind,kind=row.kind,id=row.id,name=clean(row.name),weapon=weapon,payload=row.payload or(row.kind=="weapons"and kind=="inspected"and"Carrier payload unavailable")or(row.kind=="effects"and"Not applicable")or 1,returned=kind=="cast-returned"and 1 or 0}
  for _,key in ipairs({"look","flymode","flylook"})do r[key]=values and values[key]or -1 end
  B.history[#B.history+1]=r
end
local function private_identity()
  if not integer(B.scratchWeapon,1200,6998)or coe5.get("weaponName",B.scratchWeapon)~=private_weapon then error("Private preview weapon identity changed. No write performed.")end
  local s=coe5.spellInfo(B.scratchSpell)
  if not s or s.name~=private_spell or s.weapon~=B.scratchWeapon or s.dmg~=1 then error("Private preview spell link changed. No write performed.")end
  local v=snapshot(B.scratchWeapon)
  if v.dmg~=1 or v.dmgtype~=3 or v.aoe~=0 or v.range~=30 or v.init~=3 or v.nextalwayswep~=-1 then error("Private preview damage or targeting changed. Stop this session.")end
  return v
end
local function resolve_private()
  local found,n=nil,0;for id=1200,6998 do if coe5.get("weaponName",id)==private_weapon then found,n=id,n+1 end end
  if n~=1 then error("Private preview weapon is missing or ambiguous; enable only CoE5SE and this test mod.")end;B.scratchWeapon=found
  found,n=nil,0;for id=1029,4095 do local s=coe5.spellInfo(id);if s and s.name==private_spell then found,n=id,n+1 end end
  if n~=1 then error("Private preview spell is missing or ambiguous.")end;B.scratchSpell=found;B.privateBaseline=private_identity()
end
local function close_field()
  if not B.opened then return end
  coe5.closeTestField();B.opened=false
  if B.originalWeapon and not same(B.originalBaseline,snapshot(B.originalWeapon))then error("Known original weapon fields differ after close. Quit; no shared restoration is attempted.")end
  B.originalWeapon,B.originalBaseline=nil,nil
end
local function preview_values(row)
  local v={look=B.visual.look,flymode=B.visual.flymode,flylook=B.visual.flylook}
  if row.kind=="impact"then if not available("impact",row.id)then error("Impact identity unavailable.")end;v.look=row.id
  elseif row.kind=="particle"then if not available("particle",row.id)then error("Flight identity unavailable.")end;v.flymode,v.flylook=2,row.id
  elseif row.kind=="sprite"then if not available("sprite",row.id)then error("Sprite identity unavailable.")end;v.flymode,v.flylook=1,row.id
  elseif row.kind=="weapons"then
    local w=snapshot(row.id)
    if not((w.flymode==1 and available("sprite",w.flylook))or(w.flymode==2 and available("particle",w.flylook)))or not available("impact",w.look)then error("Only mode-1/2 visual settings with supported role candidates can be previewed privately. This is not a weapon clone.")end
    v.look,v.flymode,v.flylook=w.look,w.flymode,w.flylook
  end
  return v
end
local function open_selected()
  local row=B.selected;if not row then error("Select an entry first.")end
  if row.reason then error(row.reason)end
  close_field()
  local spell,weapon,values
  if row.kind=="spells"then
    local info=coe5.spellInfo(row.id);if not info or info.name~=row.name or info.weapon~=row.weapon or info.dmg~=row.payload then error("Selected original spell identity changed.")end
    local current={weapon=info.weapon,payload=info.dmg,values=snapshot(info.weapon)};local reason=spell_reason(current);if reason then error(reason)end
    if not same(row.values,current.values)then error("Known original weapon fields changed since discovery.")end
    spell,weapon,values=row.id,row.weapon,current.values
    B.originalWeapon,B.originalBaseline=weapon,values
  else
    values=preview_values(row);private_identity()
    -- The field is closed before writes. Guard before every setter; partial failure cannot authorize Cast.
    for _,key in ipairs({"look","flymode","flylook"})do private_identity();coe5.set("weapon",B.scratchWeapon,key,values[key])end
    local read=private_identity();for key,value in pairs(values)do if read[key]~=value then error("Private visual write did not read back; no cast performed.")end end
    B.visual=values;spell,weapon=B.scratchSpell,B.scratchWeapon
  end
  if coe5.get("monsterName",13)~="Spearman"or coe5.get("monsterName",target_id)~=target_name then error("Caster/target native identity changed.")end
  local ok,units=coe5.openTestField(13,spell,target_id,target_count)
  if not ok then error("Field open refused. Quit if setup failed; preserve the isolated logs.")end
  B.opened=true;B.fieldRow=row;B.fieldValues=values
  if not units or not integer(units.commander,0,99999)or #units.enemies~=target_count then error("Field returned incomplete unit identities; no cast performed.")end
  for _,unit in ipairs(units.enemies)do if coe5.get("unitMonster",unit)~=target_id then error("Returned target identity differs; no cast performed.")end end
  if B.originalWeapon and not same(B.originalBaseline,snapshot(weapon))then error("Known original fields changed on open.")end
  B.notice="Fresh "..target_name.." x"..target_count..". Cast is deliberate; observe the log and visuals."
end
local function inspect_text(row)
  local out={"# Test Effects / CoE5 5.43 / official CoE5SE 3.4.4", "# "..titles[row.kind].." #"..row.id.." "..clean(row.name),"# Runtime metadata, not a complete definition or a confirmed visual observation."}
  local v=row.values
  if row.kind=="spells"then out[#out+1]="# Path "..row.path.."; level "..row.level.."; weapon #"..row.weapon.." "..clean(row.weaponname or"unavailable").."; spell payload "..tostring(row.payload)
  elseif row.kind=="weapons"then out[#out+1]="# Original remains read-only; record modifiers do not establish a carrier's attack payload."
  elseif row.kind=="impact"or row.kind=="particle"or row.kind=="sprite"then v=preview_values(row);out[#out+1]="# Selected private configuration, not applied until Cast/Reset. Fixed piercing #3 / payload 1 / area 0."
  else out[#out+1]="# Unnamed/unavailable slots and role-incomplete data cannot be previewed from this category."end
  if v then
    for _,key in ipairs({"dmgtype","dmg","aoe","trgrank","range","init","sound","flysound","nextalwayswep"})do out[#out+1]="# "..key.." = "..tostring(v[key] or"unavailable")end
    out[#out+1]="# Native visual fragment only; flags, chains, targets and dependencies are not recreated."
    if integer(v.look,0,299)then out[#out+1]="look "..v.look else out[#out+1]="# look unavailable or outside the inspected table"end
    if integer(v.flymode,1,9)and integer(v.flylook,0,299)then out[#out+1]="flymode "..v.flymode;out[#out+1]="flylook "..v.flylook else out[#out+1]="# No verified flight-command pair; stored mode "..tostring(v.flymode or"unavailable").." / look "..tostring(v.flylook or"unavailable")end
  end
  out[#out+1]="# "..(row.reason or(row.kind=="spells"and"Forced item-style cast; native range may be extended temporarily by the API. Not normal AI."or"Appearance unverified; use the actual field."))
  out[#out+1]="# No desktop renderer, lossless clone or hit attribution."
  return table.concat(out,"\n"),v
end
local function modal(action)
  B.modal=true;B.request=nil;local ok,value=pcall(action);B.modal=false;B.held=true;B.painted=nil
  if not ok then error(value)end;return value
end
local function inspect()
  if not B.selected then B.notice="Select an entry to inspect.";return end
  local text,values=inspect_text(B.selected);remember("inspected",B.selected,values);save("inspected","Inspection does not establish application, a cast or appearance.")
  local r=B.selected;local lines={titles[r.kind].." #"..r.id.." | runtime 5.43"}
  if r.kind=="spells"then lines[#lines+1]="Path #"..r.path.." | level "..r.level;lines[#lines+1]="Weapon #"..r.weapon.." "..(r.weaponname or"unavailable");lines[#lines+1]="Spell payload: "..tostring(r.payload)
  elseif r.kind=="weapons"then lines[#lines+1]="Carrier payload: unavailable";lines[#lines+1]="Preview copies visuals only"
  elseif r.kind=="effects"then lines[#lines+1]="Slot metadata; role not established"
  else lines[#lines+1]="Private preview: piercing #3 / payload 1";lines[#lines+1]="Visual choice does not select damage"end
  if values then
    for _,key in ipairs({"dmgtype","dmg","aoe","trgrank","range","init"})do if values[key]~=nil then lines[#lines+1]=(key=="aoe"and"Targeting code"or key=="trgrank"and"Target rank code"or key=="dmgtype"and"Damage type"or key=="dmg"and"Weapon modifier"or key=="init"and"Initiative"or"Range")..": "..(key=="dmgtype"and scalar_names[values[key]]and(scalar_names[values[key]].." #"..values[key])or values[key])end end
    lines[#lines+1]="Impact: #"..tostring(values.look or"?").." "..(values.look and coe5.lookName(values.look)or"name unavailable")
    lines[#lines+1]="Flight mode / ID: "..tostring(values.flymode or"?").." / "..tostring(values.flylook or"?")
    lines[#lines+1]="Sound / flight sound: "..tostring(values.sound or"?").." / "..tostring(values.flysound or"?")
  end
  lines[#lines+1]=r.reason or"Cast is a forced preview; observe the log"
  lines[#lines+1]="Incomplete definition; no hit/VFX claim"
  B.inspectRows,B.inspectText,B.inspectPage,B.inspecting=lines,text,0,true
end
local function act(action)
  if action=="close"then B.active=false
  elseif action=="collapse"then B.collapsed=true elseif action=="expand"then B.collapsed=false
  elseif action:sub(1,9)=="category:"then B.category=action:sub(10);B.query,B.page,B.selected,B.inspecting="",0,nil,false;B.notice="Select an entry. Changing selection does not cast."
  elseif action=="clear"then B.query,B.page,B.inspecting="",0,false
  elseif action=="scope"then B.notice=B.category=="spells"and"All native spell IDs can be requested. Targets, terrain and conditions can prevent an effect."or"All VFX is an inspect-only index. Choose Impacts, Flights or Sprites for a supported role."
  elseif action=="filter"then B.castable=not B.castable;B.page=0;B.notice=B.castable and"Castable candidates only. Use All entries for inspect-only records."or"All entries; some can only be inspected."
  elseif action=="search"then local q=modal(function()return coe5.ui.nameBox("Find "..titles[B.category],"Partial name or #ID; empty clears",0,42)end);if q~=nil then B.query,B.page,B.inspecting=q,0,false end
  elseif action=="previous"then if B.inspecting then B.inspectPage=math.max(0,B.inspectPage-1)else B.page=math.max(0,B.page-1)end
  elseif action=="next"then if B.inspecting then B.inspectPage=B.inspectPage+1 else B.page=B.page+1 end
  elseif action=="inspect"then inspect()
  elseif action=="inspectBack"then B.inspecting=false
  elseif action=="copy"then if B.inspectText then if coe5.copyText(B.inspectText)~=true then error("Clipboard copy was refused.")end;B.notice="Copied known values and visual fragment; not a complete definition."end
  elseif action=="reset"then if not B.selected or B.selected.reason then B.notice=B.selected and B.selected.reason or"Select an entry first.";return end;open_selected();save("ready","Fresh field; no cast.")
  elseif action=="cast"then
    if not B.selected or B.selected.reason then B.notice=B.selected and B.selected.reason or"Select an entry first.";return end
    if B.fieldRow~=B.selected or not B.opened then open_selected()end
    if B.originalWeapon and not same(B.originalBaseline,snapshot(B.originalWeapon))then error("Original fields changed; no cast performed.")end
    if B.selected.kind~="spells"then local v=private_identity();for key,value in pairs(B.fieldValues)do if v[key]~=value then error("Private visuals changed; no cast performed.")end end end
    B.requests=(B.requests or 0)+1;save("cast-requested","Requested "..B.selected.kind.." #"..B.selected.id.."; no returned call or visible result is assumed.")
    coe5.log("wb_effects mod="..mod.." action=cast_requested kind="..B.selected.kind.." id="..B.selected.id)
    B.casting=true;local ok,reason=pcall(coe5.fireTestField);B.casting=false;B.held=true;B.request=nil
    if not ok then error(reason)end
    if B.originalWeapon and not same(B.originalBaseline,snapshot(B.originalWeapon))then error("Known original fields differ after cast; stop this session.")end
    B.calls=(B.calls or 0)+1;remember("cast-returned",B.selected,B.fieldValues);save("cast-returned","Call returned; hits, named cast and visual observation remain unverified.")
    B.notice="Call "..B.calls.." returned. Observe log/VFX; reset dead targets."
  end
end
local function run()
  if B.active then return end
  if B.opened or B.poisoned then report("A previous operation failed. Quit this isolated session and prepare a new browser; do not reopen it.");return end
  B.scratchWeapon,B.scratchSpell,B.privateBaseline,B.selected=nil,nil,nil,nil
  local ok,why=pcall(function()
    if coe5.get("activePlayer")~=-1 then error("Open Test Effects from the main menu, without a campaign.")end
    local d,reason=layout(coe5.get("screenW"),coe5.get("screenH"),false);if not d then error(reason)end
    binding();resolve_private();load_catalog();B.requests,B.calls,B.history,B.discarded=B.requests or 0,B.calls or 0,B.history or {},B.discarded or 0;B.visual={look=68,flymode=2,flylook=65}
    B.category,B.query,B.page,B.collapsed,B.castable,B.inspecting="spells","",0,false,true,false
    for _,row in ipairs(B.rows.spells)do if row.id==445 and row.name=="Fireball"and not row.reason then B.selected=row end end
    if not B.selected then error("Default Fireball #445 is unavailable or ineligible. No substitute was cast.")end
    open_selected();save("ready","Browser ready; no cast requested.");B.active,B.held,B.request=true,true,nil
    while B.active do
      local current,reason=layout(coe5.get("screenW"),coe5.get("screenH"),B.collapsed);if not current then error(reason)end
      coe5.drawTestField();local request=B.request;B.request=nil
      if request then if request.action=="select"then B.selected=request.row;B.notice=request.row.reason or "Selected; Cast opens fresh targets when needed."
        else local success,message=pcall(act,request.action);if not success then B.poisoned=true;error(message)end end end
    end
  end)
  B.active,B.casting,B.request=false,false,nil
  if not ok then B.poisoned=true end
  local closed,reason=pcall(close_field);if not closed then ok,why=false,reason end
  -- Only private visual fields are restored, with the same pre-write/readback checks.
  if B.opened then ok,why=false,"Field close failed. Quit this isolated session; private restoration was not attempted while the field remained open."
  elseif B.scratchWeapon and B.privateBaseline then local restored,message=pcall(function()for _,key in ipairs({"look","flymode","flylook"})do private_identity();coe5.set("weapon",B.scratchWeapon,key,B.privateBaseline[key])end;local v=private_identity();for _,key in ipairs({"look","flymode","flylook"})do if v[key]~=B.privateBaseline[key]then error("Private visual restoration did not read back.")end end end);if not restored then ok,why=false,message end end
  local stored,message=pcall(save,ok and"closed"or"error",ok and"Field close returned; known fields only, not complete rollback."or tostring(why));if not stored then report(tostring(message))end
  if not ok then B.poisoned=true;report(tostring(why))end
end
local function install()
  for _,key in ipairs({"get","set","wrap","spellInfo","lookName","openTestField","drawTestField","fireTestField","closeTestField","readIni","writeIni","log","copyText","showMessageBox","addMainMenuButton"})do if type(coe5[key])~="function"then return false end end
  for _,key in ipairs({"drawRect","drawText","nameBox","screenBegin","sectionBegin","sectionEnd","buttonRow","text","bindEscape","wait"})do if not coe5.ui or type(coe5.ui[key])~="function"then return false end end
  local draw=coe5.wrap("BATTLE_DRAW",function(next)
    next();if not B.active or B.modal then return end
    -- The official field has no panel-aware viewport: leave the entire native frame clear during flight/impact.
    if B.casting then B.painted=nil;return end
    local d=layout(coe5.get("screenW"),coe5.get("screenH"),B.collapsed);B.painted=d;if not d then return end
    coe5.ui.drawRect(d.x,d.y,d.w,d.h,0.07,0.13,0.15,1)
    for _,button in ipairs(d.buttons)do local chosen=button[7]and button[7]==B.selected or button[1]=="cast"and B.selected and not B.selected.reason;local label=button[6]or"Show effects";coe5.ui.drawRect(button[2],button[3],button[4],button[5],chosen and 0.25 or 0.13,chosen and 0.39 or 0.23,0.28,1);coe5.ui.drawText(button[2]+5,button[3]+7,11,label,1,1,1,1)end
    if not B.collapsed then
      coe5.ui.drawText(d.x+8,d.y+d.h-20,14,"Test Effects | CoE5SE",1,0.9,0.65,1)
      if B.inspecting then
        local rows=B.inspectRows or{};local pages=math.max(1,(#rows+d.size-1)//d.size);B.inspectPage=math.min(B.inspectPage,pages-1)
        for n=1,d.size do local line=rows[B.inspectPage*d.size+n];if line then coe5.ui.drawText(d.x+10,d.screenH-253-n*27,11,short(line,47),0.93,0.93,0.88,1)end end
        coe5.ui.drawText(d.x+8,178,9,"Inspect "..(B.inspectPage+1).."/"..pages.." | incomplete metadata",0.8,0.9,0.9,1)
      else coe5.ui.drawText(d.x+8,178,9,#d.rows.." matches | "..(B.page+1).."/"..d.pages.." | forced preview",0.8,0.9,0.9,1)end
      coe5.ui.drawText(d.x+8,d.screenH-224,10,short(B.selected and(titles[B.selected.kind].." #"..B.selected.id.." "..B.selected.name)or"Select an entry before Cast",48),1,0.9,0.65,1)
      local detail="Pending selection; Cast opens fresh targets."
      if B.selected and B.fieldRow==B.selected and B.opened then
        if B.selected.kind=="spells"then detail="Original weapon #"..B.selected.weapon.." | type "..tostring(B.fieldValues.dmgtype).." / payload "..B.selected.payload
        else detail="Readback: flight "..B.fieldValues.flymode.."/"..B.fieldValues.flylook.." | impact "..B.fieldValues.look.." | pierce 1"end
      end
      coe5.ui.drawText(d.x+8,d.screenH-241,10,short(detail,50),0.8,0.9,0.9,1)
      local notice=B.selected and B.selected.reason and("Inspect only: "..B.selected.reason)or B.notice or""
      coe5.ui.drawText(d.x+8,d.screenH-256,10,short(notice,50),1,1,1,1)
    end
  end)
  local wait=coe5.wrap("BATTLE_WAIT",function(next,block,mode)
    local id=next(block,mode);if not B.active or B.modal then return id end
    local down=coe5.get("mouseButtons")==1;local d=B.painted
    if B.casting then B.held=down;if down then coe5.set("mouseButtons",0)end;return 0 end
    if not d or d.screenW~=coe5.get("screenW")or d.screenH~=coe5.get("screenH")then B.held=down;return id end
    local x,y=coe5.get("uiPointerX"),coe5.get("uiPointerY");local inside=x>=d.x and x<d.x+d.w and y>=d.y and y<d.y+d.h
    if down and inside then
      if not B.held and not B.casting then for _,button in ipairs(d.buttons)do if hit(button,x,y)then B.request={action=button[1],row=button[7]};break end end end
      B.held=true;coe5.set("mouseButtons",0);return 0
    end
    B.held=down;return id
  end)
  if draw~=true or wait~=true then return false end
  coe5.addMainMenuButton("Test Effects: "..mod,run);return true
end
if not install()then report("Test Effects requires the verified official 3.4.4 UI/field/data APIs.")end
