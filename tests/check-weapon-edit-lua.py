"""Run the generated experiment in a verified standalone Lua VM with mocked CoE5 APIs.

Requires the existing local SDK-only test DLL, its build manifest and matching Lua sources.
Never loads a game DLL or starts CoE5. All synthetic clicks stay inside the Lua mock.
"""
from pathlib import Path
import argparse, ctypes, hashlib, json

parser = argparse.ArgumentParser()
parser.add_argument('--runtime', type=Path, required=True)
parser.add_argument('--manifest', type=Path, required=True)
parser.add_argument('--sdk', type=Path, required=True)
parser.add_argument('--candidate', type=Path, required=True)
parser.add_argument('--report', type=Path, required=True)
args = parser.parse_args()
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
manifest = json.loads(args.manifest.read_text(encoding='utf-8-sig'))
assert sha(args.runtime) == manifest['dlls']['lua_test_runtime.dll']
assert all(sha(args.sdk / 'lua' / (name + '.c')) == value for name, value in manifest['sdkLuaSources'].items())
vm = ctypes.CDLL(str(args.runtime.resolve()))
vm.luaTestRun.argtypes = [ctypes.c_char_p]
vm.luaTestRun.restype = ctypes.c_int
vm.luaTestError.restype = ctypes.c_char_p
candidate = json.loads(args.candidate.read_text(encoding='utf-8-sig'))
files = {f['name']: f['text'] for f in candidate['files']}
definition = json.loads(files['manifest.json'])
assert definition['experiment'] == 'weapon-edit-v3'
s, o = definition['definitions'], definition['test']
helper = files[candidate['modId'] + '.lua']
expected = dict(spell=s['spellName'], weapon=s['weaponName'], caster=o['caster'], enemy=o['enemy'],
                path=int(s['path']), level=int(s['level']), damage=int(s['weaponDamage']),
                dtype=int(s['dmgtype']), area=int(s['aoe']), count=int(o['count']), menu='WB test: '+o['modId'],
                look=int(s['look'] or 0),flymode=int(s['flymode'] or 0),flylook=int(s['flylook'] or 0),
                caster_id=int(o.get('casterId',100)), enemy_id=int(o.get('enemyId',100 if o['enemy']==o['caster'] else 101)),
                mod=o['modId'], format=candidate['mode'], session='a'*32, run='b'*32,
                revision=hashlib.sha256((candidate['mode']+'\0'+candidate['source']).encode('utf-8')).hexdigest())
mock = r'''
local wrapped, menu, catalog_menu, messages, logs, drawn, writes = {}, nil, nil, {}, {}, {}, {}
local saved, file_writes = {}, 0
local file_mode,catalog_mode=mode:sub(1,5)=="save_",mode:sub(1,8)=="catalog_"
local opened, open_attempts, closed, fired, frame, consumed = 0, 0, 0, 0, 0, 0
local field_open, fault = mode == "foreign_field", false
local record = {dmgtype=expected.dtype, aoe=expected.area,look=expected.look,flymode=expected.flymode,flylook=expected.flylook}
local events = {}
local coords={type={310,48},area={400,48},apply={310,16},cast={364,16},reset={450,16},close={542,16},save={576,48}}
local actions = {"type","area","apply","cast","reset","area","apply","cast","close"}
if mode == "pending_cast" then actions={"type","cast","close"}
elseif mode ~= "normal" then actions={"type","area","apply","cast","reset","close"} end
if mode == "close_error" or mode == "restore_error" then actions={"type","area","apply","close"} end
if file_mode then actions={"type","area","apply","cast","save","close"} end
if mode=="save_pending" then actions={"type","area","save","close"} end
if mode=="save_uncast" then actions={"type","area","apply","save","close"} end
if mode=="save_revisions" then actions={"type","area","apply","cast","reset","area","apply","cast","save","close"} end
if mode=="save_ring" then actions={};for i=1,34 do actions[#actions+1]="apply" end;actions[#actions+1]="save";actions[#actions+1]="close" end
for _,action in ipairs(actions) do
 -- A held press lasts two frames. Exactly one action must be queued.
 for _,down in ipairs({1,1,0}) do events[#events+1]={action=action,down=down} end
end
local function count_log(part)
 local n=0;for _,v in ipairs(logs) do if v:find(part,1,true) then n=n+1 end end;return n
end
coe5={ui={}}
function coe5.log(text) logs[#logs+1]=text end
function coe5.ui.drawRect(...) end
function coe5.ui.drawText(x,y,size,text,...) drawn[#drawn+1]=text end
function coe5.showMessageBox(title,text) messages[#messages+1]=text end
function coe5.wrap(name,fn) wrapped[name]=fn;return mode~="bad_hook" end
function coe5.addMainMenuButton(label,fn) if label==expected.menu then menu=fn else assert(label=="WB choices: "..expected.mod);catalog_menu=fn end;return true end
function coe5.readIni(stem)
 assert(stem=="workbench-session","unscoped read")
 if mode=="save_no_context" then return nil end
 return {session={schema="wb-session-1",id=expected.session,revision=expected.revision,run=expected.run,mod=expected.mod}}
end
function coe5.writeIni(stem,data)
 assert(stem=="wb-result-"..expected.run or stem:find("wb%-cat%-%w+%-"..expected.run)==1,"unscoped write")
 file_writes=file_writes+1
 if mode=="save_refused" or (mode=="catalog_refused" and stem=="wb-cat-weapons-"..expected.run) then return false end
 local copy={};for section,rows in pairs(data)do copy[section]={};for key,value in pairs(rows)do copy[section][key]=value end end
 saved[stem]=copy;return true
end
function coe5.lookName(id) if mode=="catalog_partial" and id==4 then error("mock enumeration failure") end;return id==2 and "Named effect" or nil end
function coe5.findMonster(name)
 if mode=="missing_monster" then return nil end
 if name==expected.caster then return 100 end
 if name==expected.enemy then return 101 end
end
function coe5.spellInfo(id)
 if mode=="missing_spell" then return nil end
 if id==4094 or (mode=="duplicate_spell" and id==4095) then
  return {name=expected.spell,path=expected.path,level=expected.level,dmg=mode=="changed_spell" and expected.damage+1 or expected.damage,weapon=22}
 end
end
function coe5.get(key,index,word)
 if key=="activePlayer" then return mode=="in_game" and 0 or -1 end
 if key=="screenW" then return 914 end
 if key=="screenH" then return 600 end
 if key=="monsterLastIndex" then return mode=="bad_monster_bound" and 6999 or 2000 end
 if key=="monsterName" then
  if mode=="missing_monster" then return "" end
  if mode=="bad_selected_id" and index==expected.caster_id then return "Other" end
  if index==expected.caster_id or (mode=="duplicate_monster" and index==1999) then return expected.caster end
  if index==expected.enemy_id then return expected.enemy end
  return ""
 end
 if key=="weaponName" then
  if index==22 or (mode=="duplicate_weapon" and index==23) then return mode=="wrong_weapon" and "Other" or expected.weapon end
  return ""
 end
 if key=="weapon" then
  assert(index==22 and record[word]~=nil,"read outside own scratch schema")
  if mode=="changed_baseline" and #writes==0 and word=="aoe" then return 201 end
  if mode=="read_error" and #writes>0 and not fault then fault=true;error("mock read failed") end
  return record[word]
 end
 local e=events[frame];assert(e,"unexpected pointer read")
 if key=="mouseButtons" then return e.down end
 if key=="uiPointerX" then return coords[e.action][1] end
 if key=="uiPointerY" then return coords[e.action][2] end
 error("unexpected read "..key)
end
function coe5.set(key,index,word,value)
 if key=="mouseButtons" then assert(index==0);consumed=consumed+1;return end
 assert(key=="weapon" and index==22,"write outside own scratch weapon")
 assert((word=="dmgtype" and (value==3 or value==4)) or (word=="aoe" and (value==0 or value==1 or value==5 or value==expected.area)) or (word=="look" and (value==expected.look or (value>=0 and value<=299))) or (word=="flymode" and (value==expected.flymode or (value>=2 and value<=9))) or (word=="flylook" and (value==expected.flylook or (value>=0 and value<=299))),"unsupported field/value")
 writes[#writes+1]={word=word,value=value}
 if mode=="rejected_write" or mode=="ownership_refusal" then
  if mode=="ownership_refusal" then coe5.log("lua_refused reason=not_own_weapon") end
  return
 end
 if mode=="restore_error" and closed>0 then error("mock restore refused") end
 if word=="aoe" and not fault then
  if mode=="partial_write" then fault=true;return end
  if mode=="write_error" then fault=true;error("mock write failed") end
  if mode=="readback_mismatch" then fault=true;record[word]=17;return end
 end
 record[word]=value
end
function coe5.openTestField(caster,spell,enemy,count,standIn)
 assert(caster==expected.caster_id and spell==4094 and enemy==expected.enemy_id and count==expected.count and standIn==nil,"unexpected field or substitution")
 open_attempts=open_attempts+1
 if mode=="refused_open" or mode=="foreign_field" or (mode=="reset_refused" and open_attempts==2) then return false end
 assert(not field_open,"double open");field_open=true;opened=opened+1;return true
end
function coe5.drawTestField()
 assert(field_open);frame=frame+1;assert(frame<=#events,"loop failed to close")
 if mode=="draw_error" then error("mock draw failed") end
 local e=events[frame]
 if mode=="external_change" and e.action=="cast" and e.down==1 and not fault then record.aoe=17;fault=true end
 wrapped.BATTLE_DRAW(function() end)
 wrapped.BATTLE_WAIT(function(block,arg) assert(block==0 and arg==1);return 123 end,0,1)
end
function coe5.fireTestField()
 assert(field_open);fired=fired+1
 if mode=="cast_error" then error("mock cast failed") end
end
function coe5.closeTestField()
 assert(field_open,"closed a field not owned/opened by helper");closed=closed+1
 if mode=="close_error" then error("mock close failed") end
 field_open=false
end
if mode=="missing_api" then coe5.set=nil end
if mode=="save_missing_api" then coe5.writeIni=nil end
assert(load(source))()
assert(menu,"no menu registered")
if catalog_mode then
 assert(catalog_menu);catalog_menu();assert(opened==0 and fired==0 and closed==0 and #writes==0,"catalog export touched field")
 if mode=="catalog_refused" then assert(not saved["wb-cat-meta-"..expected.run] and #messages==1)
 else
  local header=saved["wb-cat-meta-"..expected.run];assert(header and header.meta.schema=="wb-catalog-1")
  local monsters=saved["wb-cat-monsters-"..expected.run];assert(monsters.meta.count==(expected.caster==expected.enemy and 1 or 2) and monsters.meta.upper==2000)
  local effects=saved["wb-cat-effects-"..expected.run];assert(effects.meta.count==(mode=="catalog_partial" and 4 or 300));assert(effects.meta.complete==(mode=="catalog_partial" and 0 or 1));assert(effects.entry1.id==0 and effects.entry1.name=="")
 end
 return
end
if wrapped.BATTLE_WAIT then assert(wrapped.BATTLE_WAIT(function()return 123 end,0,1)==123,"intercepted ordinary battle") end
menu()
if wrapped.BATTLE_WAIT then assert(wrapped.BATTLE_WAIT(function()return 123 end,0,1)==123,"still intercepting after cleanup") end
local early={missing_api=true,bad_hook=true,in_game=true,missing_monster=true,missing_spell=true,duplicate_spell=true,duplicate_weapon=true,wrong_weapon=true,changed_spell=true,changed_baseline=true,refused_open=true,foreign_field=true,duplicate_monster=true,bad_monster_bound=true,bad_selected_id=true}
if early[mode] then
 assert(opened==0 and closed==0 and fired==0 and #writes==0 and #messages==1,"preflight/refusal touched field or weapon")
 assert(field_open==(mode=="foreign_field"),"changed foreign field")
elseif file_mode then
 assert(closed==opened and not field_open,"file failure prevented cleanup")
 local data=saved["wb-result-"..expected.run]
 if mode=="save_no_context" or mode=="save_refused" or mode=="save_missing_api" then assert(not data and #messages==1 and fired==1,"export error broke field loop")
 else
  assert(data and data.meta.schema=="wb-results-2" and data.meta.session==expected.session and data.meta.revision==expected.revision and data.meta.run==expected.run and data.meta.spell==expected.spell and data.meta.weapon==expected.weapon and data.meta.format==expected.format)
  assert(data.meta.baselinelook==expected.look and data.meta.baselineflymode==expected.flymode and data.meta.baselineflylook==expected.flylook)
  if mode=="save_pending" then assert(data.meta.count==1 and data.sample1.dmgtype==expected.dtype and data.sample1.aoe==expected.area and data.sample1.casts==0 and fired==0,"pending controls leaked")
  elseif mode=="save_ring" then assert(data.meta.count==32 and data.sample1.index==4 and data.sample32.index==35 and data.sample32.casts==0)
  elseif mode=="save_revisions" then assert(data.meta.count==3 and data.sample2.parameter==1 and data.sample3.parameter==2 and data.sample2.casts==1 and data.sample3.casts==1 and fired==2)
  else assert(data.meta.count==2 and data.sample1.kind=="baseline" and data.sample2.kind=="applied" and data.sample2.casts==(mode=="save_uncast" and 0 or 1)) end
  assert(#messages==0)
 end
elseif mode=="normal" then
 assert(opened==2 and closed==2 and fired==2 and #messages==0 and not field_open,"normal loop counts: opened="..opened.." closed="..closed.." fired="..fired.." messages="..table.concat(messages," | "))
 assert(count_log("action=applied")==2 and count_log("action=cast_requested")==2 and count_log("action=cast_returned")==2,"duplicate/missing actions")
 assert(count_log("action=baseline_restored")==1)
 assert(count_log("source_snapshot=fixed parameter_revision=2")>=1,"parameter revision not tracked")
elseif mode=="pending_cast" then
 assert(opened==1 and closed==1 and fired==0 and #writes==0 and #messages==0)
 assert(count_log("action=cast_blocked")==1,"pending cast not blocked")
elseif mode=="close_error" then
 assert(opened==1 and closed==1 and field_open and #messages==1,"cleanup failure hidden or retried")
 assert(messages[1]:find("cleanup failed",1,true))
elseif mode=="restore_error" then
 assert(opened==1 and closed==1 and not field_open and #messages==1)
 assert(messages[1]:find("restoration failed",1,true) and count_log("action=baseline_restored")==0,"restore failure hidden: "..table.concat(messages," | "))
elseif mode=="reset_refused" then
 assert(open_attempts==2 and opened==1 and closed==1 and fired==1 and #messages==1 and not field_open,"closed a refused reopen: attempts="..open_attempts.." opened="..opened.." closed="..closed.." fired="..fired.." messages="..table.concat(messages," | "))
else
 assert(opened==1 and closed==1 and #messages==1 and not field_open,"failure did not clean/report owned field")
 assert(fired==(mode=="cast_error" and 1 or 0),"cast after failed Apply/readback: fired="..fired.." messages="..table.concat(messages," | "))
 if mode=="cast_error" then assert(count_log("action=cast_returned")==0) end
 local expected_error={rejected_write="Write rejected or readback differs",ownership_refusal="Write rejected or readback differs",partial_write="Write rejected or readback differs",readback_mismatch="Write rejected or readback differs",write_error="mock write failed",read_error="mock read failed",external_change="Scratch values changed after Apply",draw_error="mock draw failed",cast_error="mock cast failed"}
 assert(messages[1]:find(expected_error[mode],1,true),"wrong failure: "..messages[1])
end
if mode~="restore_error" then assert(record.dmgtype==expected.dtype and record.aoe==expected.area and record.look==expected.look and record.flymode==expected.flymode and record.flylook==expected.flylook,"baseline not restored") end
'''
modes = ['normal', 'pending_cast', 'rejected_write', 'ownership_refusal', 'partial_write',
         'readback_mismatch', 'write_error', 'read_error', 'external_change', 'draw_error',
         'cast_error', 'refused_open', 'foreign_field', 'reset_refused', 'close_error',
         'restore_error', 'missing_api', 'bad_hook', 'in_game', 'missing_monster', 'missing_spell',
         'duplicate_spell', 'duplicate_weapon', 'wrong_weapon', 'changed_spell', 'changed_baseline']
modes += ['save_pending','save_uncast','save_revisions','save_no_context','save_refused','save_missing_api','save_ring','catalog_normal','catalog_partial','catalog_refused']
if 'casterId' in o: modes += ['bad_selected_id']
else: modes += ['duplicate_monster','bad_monster_bound']
checks = []
for mode in modes:
    fields = ','.join(key+'='+json.dumps(value) for key, value in expected.items())
    script = 'local mode='+json.dumps(mode)+'\nlocal source='+json.dumps(helper)+'\nlocal expected={'+fields+'}\n'+mock
    status = vm.luaTestRun(script.encode('utf-8'))
    error = vm.luaTestError().decode('utf-8', 'replace') if status else ''
    checks.append(dict(name=mode, passed=status == 0, error=error))
report = dict(passed=all(c['passed'] for c in checks), tests=len(checks), checks=checks,
              candidateMode=candidate['mode'], runtimeSha256=sha(args.runtime), sdkLuaFilesMatch=len(manifest['sdkLuaSources']),
              scope='Standalone SDK Lua interpreter, synthetic records/clicks and mocked CoE5 APIs. No game DLL, hooks, rendered game/UI or gameplay acceptance.')
args.report.write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8')
print(json.dumps(report, indent=2))
raise SystemExit(0 if report['passed'] else 1)
