"""Replay the actual generated mixed helper; this is an API model, not gameplay."""
import argparse,ctypes,hashlib,json
from pathlib import Path
p=argparse.ArgumentParser()
p.add_argument('--candidate',type=Path,required=True)
p.add_argument('--vm',type=Path,required=True)
p.add_argument('--report',type=Path,required=True)
a=p.parse_args()
assert hashlib.sha256(a.vm.read_bytes()).hexdigest()=='296c8f75c76f342352302eff517a3bae869ae4badf11691b68145c9086efc514'
vm=ctypes.CDLL(str(a.vm));vm.luaTestRun.argtypes=[ctypes.c_char_p];vm.luaTestRun.restype=ctypes.c_int;vm.luaTestError.restype=ctypes.c_char_p
candidate=json.loads(a.candidate.read_text(encoding='utf-8-sig'))
files={r['name']:r['text'] for r in candidate['files']}
m=json.loads(files['manifest.json']);assert m['kind']=='private-mixed-compare-v1'
mock=Path(__file__).with_name('mixed-comparison-mock.lua').read_text()
cases={}
for mode in ['success','shared','wrong_target','wrong_owner','partial_roster','duplicate','partial_write','relinked','refused','interrupted','savefail','cleanup_failure','existing']:
 prelude='local mode,expectedMod,expectedName='+','.join(json.dumps(v) for v in [mode,m['modId'],m['weapon']])
 check="""
enter()
assert(not field and opens==closes)
if mode=="success" then
 assert(not message and fights==2 and result.meta.count==2 and cleanupSaved)
 assert(result.meta.schema=="wb-ranged-mixed-results-1")
 assert(result.sample1.flymode==1 and result.sample1.flylook==7 and result.sample1.look==68)
 assert(result.sample2.flymode==2 and result.sample2.flylook==197 and result.sample2.look==49 and result.sample2.restored==1)
 assert(result.sample1.unit3=="4,487,13,13,unavailable" and result.sample2.unit3==result.sample1.unit3)
else
 assert(message)
 if mode=="shared" or mode=="wrong_target" or mode=="existing" then assert(opens==0 and writes==0)
 elseif mode=="relinked" then assert(message:find("Restoration:",1,true) and result.meta.count==1)
 elseif mode=="partial_write" or mode=="refused" or mode=="interrupted" then assert(result.meta.count==1)
 else assert(not result) end
end
if mode~="relinked" then for k,v in pairs(original)do assert(live[k]==v)end end
"""
 rc=vm.luaTestRun(('\n'.join([prelude,mock,files[m['modId']+'.lua'],check])).encode())
 cases[mode]='passed' if rc==0 else vm.luaTestError().decode()
a.report.write_text(json.dumps(cases,indent=2)+'\n')
assert all(v=='passed' for v in cases.values()),cases
print(str(len(cases))+' mocked mixed comparison cases passed')
