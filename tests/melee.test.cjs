const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {weaponDefinition}=require('../creation');
const melee=require('../melee'),templates=require('../melee-templates');
const {harness}=require('./harness.cjs');
const basic={weaponName:'Oak Trial Spike',range:'1',init:'5',dmgtype:'3',dmg:'0',aoe:'0'};
const source=weaponDefinition(basic).text;
const prepare=(s=source,p='12')=>melee.testPackage(s,'c5m','WB_TestMelee',p);
test('all six physical and elemental types generate a separate private first attack and keep exact draft bytes',()=>{
  for(const dmgtype of ['1','2','3','4','5','6']){
    const raw='\uFEFF'+weaponDefinition({...basic,dmgtype}).text.replace(/\r\n/g,'\n');
    const p=prepare(raw),mod=p.files[0].text,lua=p.files[1].text;
    assert.equal(p.source,raw);assert.match(mod,/newweapon "Oak Trial Spike"[\s\S]+newmonster "WB Melee Carrier"\r\ncopystats "Spearman"\r\nclearweapons\r\nmeleeweapon 12 "Oak Trial Spike"/);
    assert.ok(mod.includes('dmgtype '+dmgtype+'\r\ndmg 0'));
    assert.doesNotMatch(mod,/selectmonster|selectweapon|newspell/);
    assert.match(lua,/openTestField\(carrier,-1,13,1\)/);assert.doesNotMatch(lua,/fireTestField|standIn/);
  }
  for(const [key,file] of [['lua','MeleeObservation.lua'],['dock','TestDock.lua'],['mod','MeleeCarrier.c5m']])
    assert.equal(templates[key],fs.readFileSync(path.join(__dirname,'../desktop',file),'utf8').replace(/\r\n/g,'\n'));
});
test('ranged, unsupported damage, area, flight, manual and augmented sources remain outside the melee fixture',()=>{
  for(const change of [{range:'2'},{aoe:'6'},{dmgtype:'8'},{look:'3'},{sound:'0'},{flymode:'2',flylook:'65'},{dmgtype:'23',manualDamage:true},{init:'100'},{dmg:'100'}])
    assert.throws(()=>prepare(weaponDefinition({...basic,...change}).text));
  for(const extra of ['# retained comment\r\n','selectmonster 13\r\n','clearweapons\r\n'])assert.throws(()=>prepare(source+extra));
  for(const v of ['','0','100','2.5','-1','8\n9'])assert.throws(()=>prepare(source,v));
  assert.throws(()=>melee.testPackage(source,'c5se','WB_TestMelee','12'));
  assert.throws(()=>melee.testPackage(source,'c5m','../bad','12'));
});
test('native creation, pending edits, private setup and export keep the weapon and carrier separate',async()=>{
  const exports=[];
  const h=harness({example:false,desktop:{exportCopy:async(text,filename)=>{exports.push(text);return {name:filename};}}});
  h.$('target').value='vanilla';await h.$('target').emit('change');
  await h.$('newDefinition').emit('click');h.$('create-weaponName').value=basic.weaponName;
  await h.$('creationForm').emit('submit');
  assert.equal(h.$('prepareTest').hidden,false);assert.equal(h.$('prepareTest').disabled,false);
  await h.$('prepareTest').emit('click');
  assert.match(h.$('testNextHeading').textContent,/payload/i);
  assert.equal(h.$('testEnemyGroup').hidden,true);assert.equal(h.$('testEditingGroup').hidden,true);
  assert.match(h.$('standaloneTargetName').textContent,/Spearman #13/);
  h.$('meleePayload').value='12';await h.$('meleePayload').emit('input');await h.$('testForm').emit('submit');
  assert.equal(h.window.CoePreparedTest().manifest.payload,'12');
  h.$('meleePayload').value='9';await h.$('meleePayload').emit('input');assert.throws(()=>h.window.CoePreparedTest());
  await h.$('closeTest').emit('click');h.$('field-dmg').value='6';await h.$('field-dmg').emit('input');
  assert.equal(h.$('prepareTest').disabled,true);assert.throws(()=>h.window.CoeWorkbenchSession.meleeSource());
  await h.$('editForm').emit('submit');await h.$('download').emit('click');
  assert.deepEqual(exports,[source.replace('dmg 0','dmg 6')]);
  h.$('target').value='coe5se';await h.$('target').emit('change');
  assert.equal(h.$('prepareTest').disabled,false);assert.equal(h.window.CoeWorkbenchSession.meleeSource().text,exports[0]);
});
