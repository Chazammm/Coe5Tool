"""Geometry/hitbox checks of the shared actual Lua; no renderer/game is involved."""
from pathlib import Path
import argparse,ctypes,hashlib,json
p=argparse.ArgumentParser()
for key in ['runtime','manifest','sdk','report']:p.add_argument('--'+key,type=Path,required=True)
a=p.parse_args();sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads(a.manifest.read_text('utf-8-sig'));assert sha(a.runtime)==m['dlls']['lua_test_runtime.dll'];assert all(sha(a.sdk/'lua'/(n+'.c'))==h for n,h in m['sdkLuaSources'].items())
vm=ctypes.CDLL(str(a.runtime.resolve()));vm.luaTestRun.argtypes=[ctypes.c_char_p];vm.luaTestRun.restype=ctypes.c_int;vm.luaTestError.restype=ctypes.c_char_p
source=(Path(__file__).resolve().parents[1]/'desktop/TestDock.lua').read_text('utf-8-sig')
test='''
local function intersects(a,b)return a[1]<b[1]+b[3] and b[1]<a[1]+a[3] and a[2]<b[2]+b[4] and b[2]<a[2]+a[4] end
local d,why=workbenchDock(kind,collapsed,corner)
if w<384 or h<280 then assert(not d and why);return end
assert(d and d.x>=0 and d.y>=0 and d.x+d.width<=w and d.y+d.height<=h,"dock clipped")
assert(not intersects({d.x,d.y,d.width,d.height},{0,0,300,112}),"reserved observed log lane covered")
assert(d.top or d.y==6,"bottom offset not anchored")
if d.top then assert(d.y+d.height<=h-48,"native playback strip covered") end
if not d.top then assert(d.x>=300 and d.x+d.width/2>=w/2 and d.x+d.width/2-w/2<=160,"centering/clamp unexpected") end
local boxes={};for _,b in ipairs(d.buttons)do boxes[#boxes+1]=b end;if d.status then boxes[#boxes+1]=d.status end
for i,b in ipairs(boxes)do
 assert(b[2]>=d.x and b[3]>=d.y and b[2]+b[4]<=d.x+d.width and b[3]+b[5]<=d.y+d.height,"button clipped")
 assert(workbenchHit(b,b[2],b[3]) and workbenchHit(b,b[2]+b[4]/2,b[3]+b[5]/2),"visible interior not clickable")
 assert(not workbenchHit(b,b[2]+b[4],b[3]+1) and not workbenchHit(b,b[2]+1,b[3]+b[5]),"exclusive edge hit outside drawn rectangle")
 assert(not workbenchHit(b,b[2]-0.01,b[3]) and not workbenchHit(b,b[2],b[3]-0.01),"outside edge captured")
 for j=i+1,#boxes do local c=boxes[j];assert(not intersects({b[2],b[3],b[4],b[5]},{c[2],c[3],c[4],c[5]}),"clickable rectangles overlap") end
end
assert(#d.buttons==(kind=="fixed" and 3 or collapsed and 5 or 9),"hidden settings have active hitboxes")
assert(workbenchSameView(d));w=w+1;assert(not workbenchSameView(d),"resize retained stale click surface");w=w-1
assert(not workbenchHit(nil,0,0) and not workbenchHit(d.buttons[1],0/0,1))
'''
results=[]
for w,h in [(383,600),(800,239)]+[(w,h) for w in [384,420,640,659,671,672,800,825,914,1066,1280,1600,2560] for h in [240,280,480,600,900]]:
    for kind,collapsed in [('fixed',False),('edit',False),('edit',True)]:
        for corner in [False,True]:
            init=f'local w,h={w},{h}\nlocal kind={json.dumps(kind)}\nlocal collapsed,corner={str(collapsed).lower()},{str(corner).lower()}\ncoe5={{get=function(k)if k=="screenW" then return w elseif k=="screenH" then return h end end}}\n'
            status=vm.luaTestRun((init+source+test).encode());error=vm.luaTestError().decode('utf-8','replace') if status else ''
            results.append(dict(viewport=[w,h],kind=kind,collapsed=collapsed,upperRight=corner,passed=status==0,error=error))
report=dict(passed=all(r['passed'] for r in results),tests=len(results),checks=results,runtimeSha256=sha(a.runtime),sdkLuaFilesMatch=len(m['sdkLuaSources']),scope='Actual shared Lua geometry, reserved region and half-open hitboxes, synthetic UI sizes. No pixels, text measurement, real native GUI or game observation.')
a.report.write_text(json.dumps(report,indent=2)+'\n','utf-8');print(json.dumps({k:v for k,v in report.items() if k!='checks'},indent=2));raise SystemExit(0 if report['passed'] else 1)
