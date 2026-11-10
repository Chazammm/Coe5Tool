"""Actual generated Lua in a pinned standalone Lua VM, with a simulated official API. No game."""
import argparse, ctypes, hashlib, json
from pathlib import Path
p=argparse.ArgumentParser()
p.add_argument('--candidate',type=Path,required=True)
p.add_argument('--vm',type=Path,required=True)
p.add_argument('--report',type=Path,required=True)
a=p.parse_args()
assert hashlib.sha256(a.vm.read_bytes()).hexdigest()=='296c8f75c76f342352302eff517a3bae869ae4badf11691b68145c9086efc514'
vm=ctypes.CDLL(str(a.vm));vm.luaTestRun.argtypes=[ctypes.c_char_p];vm.luaTestRun.restype=ctypes.c_int;vm.luaTestError.restype=ctypes.c_char_p
c=json.loads(a.candidate.read_text(encoding='utf-8-sig'));files={f['name']:f['text'] for f in c['files']};m=json.loads(files['manifest.json'])
assert m['kind']=='private-official-mixed-v1'
mock=Path(__file__).with_name('official-mixed-mock.lua').read_text()
cases={}
for mode in ['success','cancel','stop','refused','open_error','missing_array','partial','duplicate','wrong_owner','wrong_target','shared','relinked','missing_position','bad_position','fight_error','draw_error','close_error','menu_mismatch','save_failure','existing']:
    prelude='local mode,expectedMod,expectedName='+','.join(json.dumps(v) for v in [mode,m['modId'],m['weapon']])
    check='''
enter()
if mode=='existing' then assert(opens==0 and writes==0 and notice)
elseif mode=='save_failure' then assert(closes==1 and fights==0 and notice and not field)
else
 assert(receipt and receipt.meta.schema=='wb-official-mixed-1')
 assert(receipt.meta.restored==nil and receipt.meta.total==3)
 if mode=='success' or mode=='missing_position' then
  assert(not notice and opens==1 and closes==1 and fights==1 and receipt.meta.status=='closed')
  assert(receipt.meta.battles==1 and receipt.meta.verified==3 and receipt.unit1.afterhp==3 and receipt.unit3.resistance==100)
  assert(receipt.unit1.setupx==(mode=='missing_position' and 'unavailable' or 18))
  assert(receipt.unit1.endx==(mode=='missing_position' and 'unavailable' or 16))
 elseif mode=='cancel' or mode=='stop' then
  assert(not notice and receipt.meta.status=='cancelled' and receipt.meta.closereturned==1)
  assert(fights==(mode=='stop' and 1 or 0) and stops==(mode=='stop' and 1 or 0))
 else assert(notice and receipt.meta.status=='error') end
 if opens>0 then assert(closes==1) else assert(closes==0) end
 if mode~='close_error' then assert(not field) end
end
local before=opens;enter();assert(opens==before,'Consumed launch repeated')
'''
    rc=vm.luaTestRun(('\n'.join([prelude,mock,files[m['modId']+'.lua'],check])).encode())
    cases[mode]='passed' if rc==0 else vm.luaTestError().decode()
a.report.write_text(json.dumps({'scope':'Standalone Lua / simulated CoE5 API; not gameplay','cases':cases},indent=2)+'\n')
print(json.dumps(cases,indent=2))
assert all(v=='passed' for v in cases.values())
