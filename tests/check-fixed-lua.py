"""Fixed-value helper regression in the verified standalone Lua VM. Never runs CoE5."""
from pathlib import Path
import argparse,ctypes,hashlib,json
p=argparse.ArgumentParser()
for k in ['runtime','manifest','sdk','candidate','report']:p.add_argument('--'+k,type=Path,required=True)
a=p.parse_args();sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();m=json.loads(a.manifest.read_text('utf-8-sig'))
assert sha(a.runtime)==m['dlls']['lua_test_runtime.dll'];assert all(sha(a.sdk/'lua'/(n+'.c'))==h for n,h in m['sdkLuaSources'].items())
vm=ctypes.CDLL(str(a.runtime.resolve()));vm.luaTestRun.argtypes=[ctypes.c_char_p];vm.luaTestRun.restype=ctypes.c_int;vm.luaTestError.restype=ctypes.c_char_p
c=json.loads(a.candidate.read_text('utf-8-sig'));f={f['name']:f['text'] for f in c['files']};spec=json.loads(f['manifest.json']);s,o=spec['definitions'],spec['test'];assert not spec.get('experiment')
e=dict(spell=s['spellName'],weapon=s['weaponName'],caster=o['caster'],enemy=o['enemy'],path=int(s['path']),level=int(s['level']),damage=int(s['weaponDamage']),count=int(o['count']),menu='WB test: '+o['modId'],caster_id=int(o.get('casterId',100)),enemy_id=int(o.get('enemyId',100 if o['enemy']==o['caster'] else 101)))
mock='''
local wrapped,menu,messages,hit={},nil,{},{}
local opened,closed,fired,frame,consumed=0,0,0,0,0
coe5={ui={}}
function coe5.ui.drawRect(x,y,w,h,...)if w==248 then assert(x>=300 or y>=112,"log lane covered") end end
function coe5.ui.drawText(x,y,size,text,...)
 if text=="Cast once" then hit.cast={x+1,y+1} elseif text=="Close test" then hit.close={x+1,y+1} end
end
function coe5.wrap(name,fn)wrapped[name]=fn;return mode~="bad_hook" end
function coe5.addMainMenuButton(label,fn)assert(label==expected.menu);menu=fn;return true end
function coe5.showMessageBox(title,text)messages[#messages+1]=text end
function coe5.findMonster(name)return nil end
function coe5.spellInfo(id)
 if mode=="missing_spell" then return nil end
 if id==4094 or (mode=="duplicate_spell" and id==4095) then return {name=expected.spell,path=expected.path,level=expected.level,dmg=mode=="changed_spell" and expected.damage+1 or expected.damage,weapon=22} end
end
function coe5.get(key,id)
 if key=="screenW" then return 914 elseif key=="screenH" then return 600 end
 if key=="activePlayer" then return mode=="in_game" and 0 or -1 end
 if key=="monsterLastIndex" then return 200 end
 if key=="monsterName" then
  if mode=="missing_monster" then return "" end
  if id==expected.caster_id then return expected.caster elseif id==expected.enemy_id then return expected.enemy else return "" end
 end
 if key=="weaponName" then if id==22 or (mode=="duplicate_weapon" and id==23) then return mode=="wrong_weapon" and "Other" or expected.weapon end;return "" end
 if key=="mouseButtons" then return frame==3 and 0 or 1 end
 local b=frame<=2 and hit.cast or hit.close
 if key=="uiPointerX" then return b[1] elseif key=="uiPointerY" then return b[2] end
 error("unexpected read "..key)
end
function coe5.set(key,value)assert(key=="mouseButtons" and value==0);consumed=consumed+1 end
function coe5.openTestField(caster,spell,enemy,count,standIn)
 assert(caster==expected.caster_id and spell==4094 and enemy==expected.enemy_id and count==expected.count and standIn==nil)
 if mode=="refused_open" then return false end
 opened=opened+1;frame=0;return true
end
function coe5.drawTestField()
 frame=frame+1;assert(frame<=4,"did not close")
 if mode=="draw_error" then error("draw failed") end
 wrapped.BATTLE_DRAW(function()end);wrapped.BATTLE_WAIT(function(b,m)assert(b==0 and m==1);return 123 end,0,1)
end
function coe5.fireTestField()fired=fired+1;if mode=="fire_error" then error("fire failed") end end
function coe5.closeTestField()closed=closed+1;if mode=="close_error" then error("close failed") end end
if mode=="missing_api" then coe5.fireTestField=nil end
assert(load(source))();assert(menu)
if wrapped.BATTLE_WAIT then assert(wrapped.BATTLE_WAIT(function()return 123 end,0,1)==123) end
menu()
if mode=="normal" then assert(opened==1 and closed==1 and fired==1 and consumed==3 and #messages==0);menu();assert(opened==2 and closed==2 and fired==2)
else
 assert(#messages==1,"failure not reported");local should_open=mode=="draw_error" or mode=="fire_error" or mode=="close_error"
 assert(opened==(should_open and 1 or 0) and closed==opened,"ownership cleanup wrong")
end
if wrapped.BATTLE_WAIT then assert(wrapped.BATTLE_WAIT(function()return 123 end,0,1)==123) end
'''
checks=[]
for mode in ['normal','in_game','missing_api','bad_hook','missing_monster','missing_spell','duplicate_spell','changed_spell','wrong_weapon','duplicate_weapon','refused_open','draw_error','fire_error','close_error']:
    fields=','.join(k+'='+json.dumps(v) for k,v in e.items());script='local mode='+json.dumps(mode)+'\nlocal source='+json.dumps(f[c['modId']+'.lua'])+'\nlocal expected={'+fields+'}\n'+mock
    status=vm.luaTestRun(script.encode());error=vm.luaTestError().decode('utf-8','replace') if status else '';checks.append(dict(name=mode,passed=status==0,error=error))
report=dict(passed=all(c['passed'] for c in checks),tests=len(checks),checks=checks,runtimeSha256=sha(a.runtime),sdkLuaFilesMatch=len(m['sdkLuaSources']),scope='Actual fixed Lua fixture, synthetic game records/draw/pointer mocks. No game, native rendering or gameplay acceptance.')
a.report.write_text(json.dumps(report,indent=2)+'\n','utf-8');print(json.dumps(report,indent=2));raise SystemExit(0 if report['passed'] else 1)
