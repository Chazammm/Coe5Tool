"""Exercise the generated private melee or ranged helper in an existing, fingerprint-pinned SDK test VM."""
import argparse
import ctypes
import hashlib
import json
import re
from pathlib import Path

parser = argparse.ArgumentParser()
for arg in ('candidate', 'vm_manifest', 'report'):
    parser.add_argument('--' + arg.replace('_', '-'), type=Path, required=True)
args = parser.parse_args()
read = lambda p: json.loads(p.read_text(encoding='utf-8-sig'))
candidate, vm_config = read(args.candidate), read(args.vm_manifest)
dll = Path(vm_config['dll'])
# Same reviewed standalone Lua VM previously used for original-record tests.
if hashlib.sha256(dll.read_bytes()).hexdigest() != '296c8f75c76f342352302eff517a3bae869ae4badf11691b68145c9086efc514':
    raise ValueError('Unrecognized Lua test VM')
vm = ctypes.CDLL(str(dll))
vm.luaTestRun.argtypes = [ctypes.c_char_p]
vm.luaTestRun.restype = ctypes.c_int
vm.luaTestError.restype = ctypes.c_char_p
files = {row['name']: row['text'] for row in candidate['files']}
m = json.loads(files['manifest.json'])
mock = Path(__file__).with_name('melee-mock.lua').read_text(encoding='utf-8')
cases = {}
ranged = m['kind'] == 'private-ranged-v1'
fields = dict(re.findall(r'^([a-z]+) (-?\d+)\s*$', candidate['source'], re.M))
values = '{'+','.join(f'{k}={v}' for k,v in fields.items())+'}'
scenarios = ['relinked', 'wrong_payload', 'wrong_target', 'wrong_row', 'extra_row', 'name_collision', 'wrong_weapon_stats', 'refused', 'draw_interruption']
elemental = fields.get('dmgtype') in ('4','5','6')
reading_cases = ['ambiguous_target','missing_target','getter_unavailable']
if elemental:
    scenarios += ['wrong_type', *reading_cases]
    if not ranged:
        scenarios += ['shared_carrier','shared_weapon']
if ranged:
    scenarios += ['shared_carrier', 'shared_weapon', 'wrong_mode', 'wrong_sprite', 'wrong_impact']
    if 'look' in fields:
        scenarios += ['unnamed_impact']
names = json.loads((Path(__file__).resolve().parents[1] / 'desktop/ParticleFlights.json').read_text())
flight_name = names.get(fields.get('flylook')) if fields.get('flymode') == '2' else None
impact_name = {'34':'Blood Burst', '68':'Flame'}.get(fields.get('look'))
if flight_name:
    scenarios += ['unnamed_flight','renamed_flight']
    if impact_name:
        scenarios += ['renamed_impact']
comparison = m['kind'] == 'private-ranged-compare-v1'
if comparison:
    mock = Path(__file__).with_name('ranged-comparison-mock.lua').read_text(encoding='utf-8')
    scenarios = ['success','shared','partial','relinked','renamed','refused','interrupted','savefail','existing']
expanded = m['kind'] == 'private-ranged-compare-v2'
if expanded:
    mock = Path(__file__).with_name('ranged-catalog-mock.lua').read_text(encoding='utf-8')
    scenarios = ['success','shared','renamed','bad_witness','missing_sprite','missing_impact','partial']
target=m.get('target',{'id':13,'name':'Spearman'})
targeted='target' in m
if targeted:
    scenarios += ['invalid_target_hp','wrong_defender']
group_count=target.get('count',1)
group_mock=''
if group_count>1:
    group_mock=Path(__file__).with_name('group-mock.lua').read_text(encoding='utf-8')
    scenarios=['success','short','extra','duplicate','foreign','wrong_owner']
for mode in scenarios:
    prelude = 'local mode,expectedMod,expectedName,expectedPayload,expectedRow,expectedCarrier,expectedFields,expectedFlightName,expectedImpactName=' + ','.join([
        json.dumps(mode), json.dumps(m['modId']), json.dumps(m['weapon']), m['payload'], '2' if ranged else '1',
        json.dumps('WB Ranged Carrier' if ranged else 'WB Melee Carrier'), values, json.dumps(flight_name or ''), json.dumps(impact_name or '')])
    prelude += '\nlocal expectedTargetId,expectedTargetName=' + str(target['id']) + ',' + json.dumps(target['name'])
    check = """run()
assert(stage=='error' and message)
assert((opened==true)==(mode=='refused' or mode=='draw_interruption'))
assert((closed==true)==(mode=='draw_interruption'))
"""
    if elemental and not (comparison or expanded):
        visited = mode in ['draw_interruption', *reading_cases]
        check = f"""run()
assert(stage=='error' and message)
assert((opened==true)=={str(visited or mode=='refused').lower()})
assert((closed==true)=={str(visited).lower()})
"""
        if visited:
            check += 'assert(observed.dmgtype==expectedFields.dmgtype and observed.weaponbase==expectedFields.dmg)\n'
            if mode in reading_cases:
                check += 'assert(observed.targetresistance=="unavailable" and observed.targetunit==nil)'
            else:
                check += 'assert(observed.targetunit==71 and observed.targetresistance==({[4]=0,[5]=50,[6]=-25})[expectedFields.dmgtype])'
    if targeted and not expanded:
        if mode in ['wrong_defender','ambiguous_target','missing_target']:
            check = """run()
assert(stage=="error" and opened and closed and observed.battles==0)
assert(message:find("defender") and observed.targetunit==nil and observed.targetresistance==nil)
"""
        elif mode=='getter_unavailable':
            check = """run()
assert(opened and closed and observed.targetunit==71 and observed.targetresistance=="unavailable")
"""
    if comparison:
        check = """
entry()
assert((mode=='success')==(message==nil),message or "missing error")
assert(not field and closes==opens)
if mode=='success' then
  assert(fights==2 and closes==2 and saved.meta.count==2)
  assert(saved.sample1.flymode==1 and saved.sample1.flylook==7 and saved.sample1.look==68 and saved.sample1.parameter==0)
  assert(saved.sample2.flymode==2 and saved.sample2.flylook==97 and saved.sample2.look==34 and saved.sample2.parameter==1)
elseif mode=='shared' or mode=='existing' then assert(opens==0 and writes==0)
elseif mode=='renamed' then assert(writes==0 and saved.meta.count==1)
elseif mode=='partial' or mode=='refused' or mode=='interrupted' then assert(saved.meta.count==1)
elseif mode=='savefail' then assert(not saved and writes==0)
elseif mode=='relinked' then assert(message:find("Restoration:",1,true) and writes==3,tostring(message).." / writes="..writes) end
if mode~='relinked' then assert(record.flymode==1 and record.flylook==7 and record.look==68) end
"""
    if expanded:
        if fields.get('flylook')!='197' or fields.get('look')!='68':
            raise ValueError('Catalog mock expects a mode-2 Torrent of Water / Flame candidate')
        check = """
enter()
assert(opens==closes)
if mode=='success' then
  assert(not errorText and opens==2 and result.meta.count==2)
  assert(result.sample1.flymode==2 and result.sample1.flylook==197 and result.sample1.look==68)
  assert(result.sample2.flymode==1 and result.sample2.flylook==14 and result.sample2.look==49)
elseif mode=='missing_sprite' or mode=='missing_impact' then assert(not errorText and writes==0 and opens==1)
elseif mode=='partial' then assert(errorText and result.meta.count==1 and writes>0)
else assert(errorText and writes==0 and opens==0) end
for k,v in pairs(original) do assert(live[k]==v) end
"""
        if targeted:
            check=check.replace("else assert(errorText and writes==0 and opens==0)",
                "elseif mode=='wrong_defender' then assert(errorText and writes==0 and opens==1 and not result) else assert(errorText and writes==0 and opens==0)")
            if elemental:
                check+='\nif mode=="success" then assert(result.sample1.target==expectedTargetId and result.sample2.targetunit==71 and result.sample1.targetresistance==({[4]=0,[5]=100,[6]=-25})[expectedFields.dmgtype]) end'
    if group_count>1:
        prelude += '\nlocal expectedCount='+str(group_count)
        if expanded:
            check = """enter()
assert(groupOpen==groupCloses)
if mode=="success" then
  assert(not errorText and groupFights==2 and result.meta.count==2)
  assert(result.sample1.targetcount==expectedCount and result.sample2.target==expectedTargetId)
  assert(result.sample1.unit1=="71,0" and result.sample1.unit2=="72,-25" and result.sample1.unit3=="73,unavailable")
  assert(result.sample2.unit1=="321,0" and result.sample2.unit3=="323,unavailable")
else assert(errorText and not result and groupFights==0 and groupCloses==1) end"""
        else:
            # The fixed mock interrupts drawing after a successful open. Verify its pre-battle receipt and cleanup.
            check = """run()
assert(stage=="error" and groupOpen==1 and groupCloses==1 and observed.battles==0)
if mode=="success" then
  assert(message:find("mock draw interrupted") and observed.targetcount==expectedCount and observed.target==expectedTargetId)
  assert(observed.unit1=="71,0" and observed.unit2=="72,-25" and observed.unit3=="73,unavailable")
  if expectedCount>3 then assert(observed["unit"..expectedCount]==(70+expectedCount)..",0") end
else assert(not message:find("mock draw interrupted") and not observed.targetcount and not observed.unit1) end"""
    if int(fields['aoe'])>0:
        if expanded:
            check+='\nif mode=="success" then assert(result.sample1.area==expectedFields.aoe and result.sample2.area==expectedFields.aoe) end'
        elif group_count>1:
            check+='\nif mode=="success" then assert(observed.area==expectedFields.aoe) end'
    code = '\n'.join([prelude, mock, group_mock, files[m['modId']+'.lua'], check])
    ok = vm.luaTestRun(code.encode('utf-8')) == 0
    cases[mode] = 'passed' if ok else vm.luaTestError().decode('utf-8')
args.report.write_text(json.dumps(cases, indent=2)+'\n', encoding='utf-8')
if any(value != 'passed' for value in cases.values()):
    raise SystemExit(str(cases))
print(f'{len(cases)} mocked helper cases passed')

