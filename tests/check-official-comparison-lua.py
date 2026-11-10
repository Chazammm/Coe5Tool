"""Generated helper / pinned standalone Lua VM; simulated API only, no game."""
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
assert m['kind']=='private-official-mixed-compare-v1'
revision=hashlib.sha256(('c5m\0'+c['source']).encode()).hexdigest()
catalog=json.loads((Path(__file__).parents[1]/'desktop/RangedVisuals543.json').read_text())['groups']
names,witnesses={},{}
for role,rows in catalog.items():
    for ident,row in rows.items():
        if row.get('name') and role!='sprite': names[int(ident)]=row['name']
        if row.get('witness') is not None:
            fields=witnesses.setdefault(row['witness'],{})
            if role=='impact':fields['look']=int(ident)
            else:fields.update(flymode=1 if role=='sprite' else 2,flylook=int(ident))
def lua(value):
    if isinstance(value,dict):return '{'+','.join('['+lua(k)+']='+lua(v) for k,v in value.items())+'}'
    return json.dumps(value)
mock=Path(__file__).with_name('official-comparison-mock.lua').read_text()
cases={}
for mode in ['success','sprite','search','cancel','stop','reuse','limit','finish','capacity','commander_capacity','refused','open_error','missing_array','partial','duplicate','wrong_type','wrong_owner','missing_positions','bad_positions','fight_error','draw_error','close_error','menu_mismatch','unknown_cleanup','surviving','visual_drift','payload_drift','partial_write','save_failure','existing','shared','relinked','target_unavailable','bad_context']:
    prelude='local mode,expectedMod,expectedName,expectedRevision='+','.join(json.dumps(v) for v in [mode,m['modId'],m['weapon'],revision])+'\nlocal effectNames,nativeWitnesses='+lua(names)+','+lua(witnesses)
    check='''
enter()
if mode=='existing' or mode=='shared' or mode=='relinked' or mode=='target_unavailable' or mode=='bad_context' then assert(opens==0 and writes==0 and sets==0 and notice)
else
 assert(receipts and receipts.meta.schema=='wb-official-ranged-mixed-results-1')
 if mode=='success' or mode=='sprite' or mode=='search' or mode=='reuse' or mode=='missing_positions' then
  assert(not notice and opens==2 and closes==2 and fights==2 and receipts.meta.status=='finished',tostring(notice))
  assert(receipts.meta.visualsrestored==1 and receipts.attempt1.status=='closed' and receipts.attempt2.status=='closed')
  assert(receipts.attempt2.look==34 and receipts.attempt2.parameter==1 and receipts.attempt2.readback==1)
  assert(receipts.a1unit1.beforehp==6 and receipts.a2unit1.beforehp==6 and receipts.a2unit3.resistance==100)
  assert(receipts.attempt1.restored==nil and receipts.attempt2.restored==nil)
  if mode=='reuse' then assert(receipts.a1unit1.instance==receipts.a2unit1.instance) else assert(receipts.a1unit1.instance~=receipts.a2unit1.instance) end
  if mode=='sprite' then assert(receipts.attempt2.flymode==1 and receipts.attempt2.flylook==7) end
 elseif mode=='cancel' or mode=='stop' then
  assert(not notice and receipts.attempt1.status=='cancelled' and receipts.attempt2.status=='closed' and opens==2 and closes==2)
  assert(receipts.attempt1.battles==(mode=='stop' and 1 or 0) and receipts.attempt1.stopped==(mode=='stop' and 1 or 0))
 elseif mode=='limit' then assert(not notice and opens==8 and closes==8 and fights==8 and receipts.meta.count==8)
 elseif mode=='finish' then assert(not notice and opens==0 and fights==0 and receipts.meta.count==0 and receipts.meta.visualsrestored==1)
 elseif mode=='save_failure' then assert(notice and receipts.meta.status=='active' and receipts.attempt1.status=='closed' and closes==2)
 else
  assert(notice and receipts.meta.status=='error',mode..': '..tostring(notice))
  if mode=='capacity' or mode=='commander_capacity' then assert(opens==0 and closes==0 and fights==0)
  elseif mode=='partial_write' then assert(opens==1 and closes==1 and fights==1)
  else assert(opens==2 and closes==2,'Second-attempt failure was not reached') end
 end
 if mode~='close_error' then assert(not field,'Field left open') end
 assert(opens<=8)
 if receipts.meta.visualsrestored==1 then assert(visuals.flymode==2 and visuals.flylook==65 and visuals.look==68,'Private visual restore') end
end
local n=opens;enter();assert(opens==n,'Consumed launch reentered')
'''
    if mode=='success':
        # This SDK's error transport is limited to 4 KiB. Export two independently
        # replayed, checked chunks; the game helper itself still writes one journal.
        check+='\nlocal exportPart=1;local lines={};local keys={};for k in pairs(receipts)do keys[#keys+1]=k end;table.sort(keys);for _,section in ipairs(keys)do if (exportPart==1 and (section=="meta" or section=="attempt1" or section:sub(1,2)=="a1")) or (exportPart==2 and (section=="attempt2" or section:sub(1,2)=="a2")) then lines[#lines+1]="["..section.."]";local row=receipts[section];local fields={};for k in pairs(row)do fields[#fields+1]=k end;table.sort(fields);for _,k in ipairs(fields)do lines[#lines+1]=k.."="..tostring(row[k])end;lines[#lines+1]="" end end;error("WB_JOURNAL\\n"..table.concat(lines,"\\n"))\n'
    rc=vm.luaTestRun(('\n'.join([prelude,mock,files[m['modId']+'.lua'],check])).encode())
    message='' if rc==0 else vm.luaTestError().decode()
    if mode=='success' and 'WB_JOURNAL\n' in message:
        first=message.split('WB_JOURNAL\n',1)[1]
        second_script='\n'.join([prelude,mock,files[m['modId']+'.lua'],check.replace('local exportPart=1','local exportPart=2')])
        second_rc=vm.luaTestRun(second_script.encode())
        second=vm.luaTestError().decode() if second_rc else ''
        if 'WB_JOURNAL\n' not in second: raise AssertionError('Second journal transport chunk failed: '+second)
        a.report.with_name('official-comparison-journal.ini').write_text(first+'\n'+second.split('WB_JOURNAL\n',1)[1])
        rc=0
    cases[mode]='passed' if rc==0 else message
a.report.write_text(json.dumps({'scope':'Generated Lua / simulated official API, not gameplay','cases':cases},indent=2)+'\n')
print(json.dumps(cases,indent=2))
assert all(v=='passed' for v in cases.values())
