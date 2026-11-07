"""Exercise the actual generated Lua with synthetic UI/game APIs, never the real game."""
from pathlib import Path
import argparse,ast,ctypes,hashlib,json
p=argparse.ArgumentParser()
for key in ['runtime','manifest','sdk','candidate','report']:p.add_argument('--'+key,type=Path,required=True)
a=p.parse_args();sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads(a.manifest.read_text('utf-8-sig'));assert sha(a.runtime)==m['dlls']['lua_test_runtime.dll']
assert all(sha(a.sdk/'lua'/(n+'.c'))==h for n,h in m['sdkLuaSources'].items())
vm=ctypes.CDLL(str(a.runtime.resolve()));vm.luaTestRun.argtypes=[ctypes.c_char_p];vm.luaTestRun.restype=ctypes.c_int;vm.luaTestError.restype=ctypes.c_char_p
c=json.loads(a.candidate.read_text('utf-8-sig'));files={f['name']:f['text'] for f in c['files']};manifest=json.loads(files['manifest.json']);s,o=manifest['definitions'],manifest['test'];assert manifest['experiment']=='weapon-edit-v3'
e=dict(spell=s['spellName'],weapon=s['weaponName'],caster=o['caster'],enemy=o['enemy'],path=int(s['path']),level=int(s['level']),damage=int(s['weaponDamage']),dtype=int(s['dmgtype']),area=int(s['aoe']),count=int(o['count']),menu='WB test: '+o['modId'],look=int(s['look'] or 0),flymode=int(s['flymode'] or 0),flylook=int(s['flylook'] or 0),caster_id=int(o.get('casterId',100)),enemy_id=int(o.get('enemyId',100 if o['caster']==o['enemy'] else 101)),mod=o['modId'],format=c['mode'],session='a'*32,run='b'*32,revision=hashlib.sha256((c['mode']+'\0'+c['source']).encode()).hexdigest())
tree=ast.parse((Path(__file__).parent/'check-weapon-edit-lua.py').read_text('utf-8-sig'))
mock=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='mock' for t in n.targets))
start=mock.index('local actions = ');end=mock.index('for _,action in ipairs(actions) do',start)
mock=mock[:start]+'''local actions={"effects","apply","cast","reset","effects","apply","cast","save","close"}
if scenario=="pending" then actions={"effects","cast","close"}
elseif scenario=="resize_held" or scenario=="tiny_resize" then actions={"cast","close"}
elseif scenario=="log_click" then actions={"log","cast","close"}
elseif scenario=="hidden_controls" then actions={"collapse","hidden_effects","cast","collapse","close"}
elseif scenario=="save_pending" then actions={"effects","save","close"}
elseif scenario=="uncast" then actions={"effects","apply","save","close"}
elseif scenario=="missing_picker" or scenario=="mode1_guard" or scenario=="empty_search" or scenario=="hidden_choice" or scenario=="bad_id" or scenario=="move" then actions={"effects","close"}
elseif scenario=="need_flight" then actions={"effects","apply","cast","close"}
elseif scenario=="collapse" then actions={"collapse","cast","collapse","close"}
elseif scenario~="two_configs" then actions={"effects","apply","cast","close"} end
coords.effects={474,48};coords.collapse={624,16}
local cast_values,hit,boxes,ui_seen,ui_titles,ui_lines,queries={},{},{},{},{},{},{}
local mock_width=914
local ui_queue={1,1,1002,2,5,3,1,1002,9, 1,1,1299,2,9,3,1,1299,9}
local query_queue={"named","named","#299","#299"}
if scenario=="mode1_guard" then ui_queue={3,9}
elseif scenario=="need_flight" then ui_queue={2,6,9}
elseif scenario=="empty_search" then ui_queue={1,1,2,9,9};query_queue={"no matching effect"}
elseif scenario=="bad_id" then ui_queue={1,1,1300,9,9};query_queue={"#300"}
elseif scenario=="hidden_choice" then ui_queue={1,1299,9,9}
elseif scenario=="move" then ui_queue={5,9}
elseif scenario=="pagination" then ui_queue={1,4,1008,9}
elseif scenario=="baseline" then ui_queue={1,1,1002,4,9};query_queue={"named"} end
''' + mock[end:]
mock=mock[:mock.index('local early=')]+'''
local failures={refused=true,partial=true,mismatch=true,external=true,restore=true}
if failures[scenario] then
 assert(opened==1 and closed==1 and not field_open and #messages==1,"failure cleanup/report wrong: "..table.concat(messages," | "))
 if scenario=="restore" then assert(fired==1 and messages[1]:find("restoration failed",1,true))
 else assert(fired==0,"cast after failed VFX write/readback");assert(messages[1]:find(scenario=="external" and "changed after Apply" or "readback differs",1,true)) end
elseif scenario=="two_configs" then
 assert(opened==2 and closed==2 and fired==2 and #messages==0,"iteration counts wrong")
 assert(cast_values[1].look==2 and cast_values[1].flymode==5 and cast_values[1].flylook==2)
 assert(cast_values[2].look==299 and cast_values[2].flymode==9 and cast_values[2].flylook==299)
 local d=saved["wb-result-"..expected.run];assert(d.meta.schema=="wb-results-2" and d.meta.count==3 and d.meta.baselinelook==expected.look)
 assert(d.sample2.look==2 and d.sample2.flymode==5 and d.sample2.casts==1 and d.sample3.look==299 and d.sample3.casts==1)
elseif scenario=="pending" or scenario=="need_flight" then
 assert(opened==1 and closed==1 and fired==0 and #writes==0 and #messages==0,"pending values reached write/cast")
 assert(count_log("action=cast_blocked")==1)
elseif scenario=="save_pending" then
 local d=saved["wb-result-"..expected.run];assert(d.meta.count==1 and d.sample1.look==expected.look and d.sample1.flylook==expected.flylook and d.sample1.casts==0 and #writes==0)
elseif scenario=="uncast" then
 local d=saved["wb-result-"..expected.run];assert(d.meta.count==2 and d.sample2.look==2 and d.sample2.casts==0 and fired==0)
elseif scenario=="mode1_guard" or scenario=="missing_picker" then
 assert(opened==1 and closed==1 and fired==0 and #writes==0 and #messages==1)
elseif scenario=="empty_search" or scenario=="bad_id" then
 assert(opened==1 and closed==1 and fired==0 and #writes==0 and #messages==0)
 local found=false;for _,text in ipairs(ui_lines)do if text:find("No matches",1,true) then found=true end end;assert(found,"empty state missing")
elseif scenario=="hidden_choice" or scenario=="move" then assert(opened==1 and closed==1 and fired==0 and #writes==0 and #messages==0)
elseif scenario=="collapse" then assert(opened==1 and closed==1 and fired==1 and #writes==0 and #messages==0,"collapsed primary controls unavailable")
elseif scenario=="hidden_controls" then assert(fired==1 and #writes==0 and ui_index==0,"a hidden settings hitbox was active")
elseif scenario=="log_click" then assert(fired==1 and #writes==0 and #messages==0,"log click reached controls")
elseif scenario=="resize_held" then assert(fired==0 and #writes==0 and #messages==0,"resizing with held pointer used a stale/moved hitbox")
elseif scenario=="tiny_resize" then assert(fired==0 and #writes==0 and #messages==1 and messages[1]:find("384 x 280",1,true),"unsupported resize did not close/report owned field")
elseif scenario=="baseline" then assert(fired==1 and cast_values[1].look==expected.look and cast_values[1].flylook==expected.flylook)
elseif scenario=="pagination" then assert(fired==1 and cast_values[1].look==8)
end
if scenario~="restore" then assert(record.dmgtype==expected.dtype and record.aoe==expected.area and record.look==expected.look and record.flymode==expected.flymode and record.flylook==expected.flylook,"original five values not restored") end
assert(opened==closed and not field_open and ui_index<=#ui_queue and query_index<=#query_queue)
'''
ui='''
local ui_index,query_index=0,0
local seen_menu_error=false
function coe5.ui.screenBegin(title) ui_titles[#ui_titles+1]=title;ui_seen={} end
function coe5.ui.sectionBegin(text)end
function coe5.ui.sectionEnd()end
function coe5.ui.text(id,text)ui_seen[id]=true;ui_lines[#ui_lines+1]=text end
function coe5.ui.buttonRow()end
function coe5.ui.bindEscape(id)assert(ui_seen[id])end
function coe5.ui.nameBox(title,prompt,sprite,max)assert(sprite==777 and max==42);query_index=query_index+1;assert(query_index<=#query_queue);return query_queue[query_index] end
function coe5.ui.wait()
 ui_index=ui_index+1;assert(ui_index<=#ui_queue,"unexpected picker wait")
 local id=ui_queue[ui_index]
 assert(ui_seen[id] or ((scenario=="hidden_choice" or scenario=="bad_id") and id>=1000),"clicked an undrawn native row: "..id)
 return id
end
if scenario=="missing_picker" then coe5.ui.wait=nil end
'''
# Inject after initial mock function definitions, so our native widget and draw observers stay active.
point=mock.index('if mode=="missing_api" then')
mock=mock[:point]+ui+mock[point:]
mock=mock.replace('function coe5.ui.drawRect(...) end','''function coe5.ui.drawRect(x,y,w,h,...)
 boxes[#boxes+1]={x,y,w,h};if w==360 then assert(x>=300 or y>=112,"panel intersects reserved lower-left log region") end
end''')
mock=mock.replace('drawn[#drawn+1]=text end','''drawn[#drawn+1]=text
 local action=({Apply="apply",["Cast once"]="cast",["Reset targets"]="reset",["Close test"]="close",["Effects..."]="effects",["Save test values"]="save",["-"]="collapse",["+"]="collapse"})[text]
 if text:sub(1,5)=="Type:" then action="type" elseif text:sub(1,5)=="Area:" then action="area" end
 if action then hit[action]={x+1,y+1} end
end''')
mock=mock.replace('if key=="screenW"','if key=="monsterSprite" then return 777 end\n if key=="screenW"')
mock=mock.replace('if key=="screenW" then return 914 end','if key=="screenW" then return mock_width end')
mock=mock.replace('return coords[e.action][1]','assert(hit[e.action],"action not drawn: "..e.action);return hit[e.action][1]').replace('return coords[e.action][2]','return hit[e.action][2]')
mock=mock.replace('wrapped.BATTLE_DRAW(function() end)','hit={};wrapped.BATTLE_DRAW(function() end)')
mock=mock.replace('wrapped.BATTLE_WAIT(function(block,arg)', '''if e.action=="log" then hit.log={20,20} elseif e.action=="hidden_effects" then hit.hidden_effects={474,48} end
 if (scenario=="resize_held" or scenario=="tiny_resize") and frame==1 then mock_width=scenario=="tiny_resize" and 383 or 1100 end
 wrapped.BATTLE_WAIT(function(block,arg)''')
mock=mock.replace('return record[word]','''if scenario=="mismatch" and word=="look" and #writes>0 and not fault then fault=true;return record.look+1 end
  return record[word]''')
mock=mock.replace('writes[#writes+1]={word=word,value=value}','''writes[#writes+1]={word=word,value=value}
 if scenario=="refused" and word=="look" and value~=expected.look then return end
 if scenario=="partial" and word=="flylook" and value~=expected.flylook and not fault then fault=true;return end
 if scenario=="restore" and closed>0 and word=="look" then error("mock visual restore refused") end''')
mock=mock.replace('local e=events[frame]\n if mode=="external_change"','local e=events[frame]\n if scenario=="external" and e.action=="cast" and e.down==1 and not fault then record.look=301;fault=true end\n if mode=="external_change"')
mock=mock.replace('assert(field_open);fired=fired+1','''assert(field_open);fired=fired+1
 cast_values[fired]={look=record.look,flymode=record.flymode,flylook=record.flylook}''')
scenarios=['two_configs','pending','save_pending','uncast','refused','partial','mismatch','external','restore','missing_picker','empty_search','hidden_choice','bad_id','pagination','baseline','collapse','move','resize_held','tiny_resize','log_click','hidden_controls']
if e['flymode'] in [0,1]:scenarios+=['need_flight']
if e['flymode']==1:scenarios+=['mode1_guard']
results=[]
for name in scenarios:
    fields=','.join(k+'='+json.dumps(v) for k,v in e.items())
    script='local scenario='+json.dumps(name)+'\nlocal mode="normal"\nlocal source='+json.dumps(files[c['modId']+'.lua'])+'\nlocal expected={'+fields+'}\n'+mock
    status=vm.luaTestRun(script.encode());error=vm.luaTestError().decode('utf-8','replace') if status else ''
    results.append(dict(name=name,passed=status==0,error=error))
report=dict(passed=all(r['passed'] for r in results),tests=len(results),checks=results,candidateMode=c['mode'],runtimeSha256=sha(a.runtime),sdkLuaFilesMatch=len(m['sdkLuaSources']),scope='Actual generated Lua, synthetic records and native-widget/draw/hitbox mocks. No game, native GUI rendering or VFX acceptance.')
a.report.write_text(json.dumps(report,indent=2)+'\n','utf-8');print(json.dumps(report,indent=2));raise SystemExit(0 if report['passed'] else 1)
