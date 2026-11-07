const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const melee=require('../melee');
const {weaponDefinition}=require('../creation');
const choices=require('../choices');
const {validatePacket,plan}=require('../return-values');
const {harness}=require('./harness.cjs');
const spec={weaponName:'Trial Dart',range:'5',init:'5',dmgtype:'3',dmg:'0',aoe:'0',flymode:'2',flylook:'197',look:'49'};
const draft=(patch={})=>weaponDefinition({...spec,...patch}).text;
test('each pinned role can start a comparison and round-trip as its exact ID, including sprite zero',async()=>{
  for(const [role,rows] of Object.entries(melee.catalog))for(const id of Object.keys(rows)){
    const fields=role==='impact'?{look:id}:{flymode:role==='sprite'?'1':'2',flylook:id};
    const src=draft(fields),s=melee.specification(src,'c5m',true).spec;
    const p=melee.testPackage(src,'c5m','WB_Catalog','8',true);
    assert.equal(p.source,src);assert.equal(p.manifest.kind,'private-ranged-compare-v2');
    assert.ok(p.files[0].text.includes('flylook '+s.flylook+'\r\n'));assert.ok(p.files[0].text.includes('look '+s.look+'\r\n'));
    const baseline=Object.fromEntries(['look','flymode','flylook'].map(k=>[k,s[k]]));
    const context={resultSchema:3,visualCatalog:2,legacy:false,source:src,mode:'c5m',weaponName:s.weaponName,spellName:'weapon '+s.weaponName,sessionId:'a'.repeat(32),run:'b'.repeat(32),sourceRevision:createHash('sha256').update('c5m\0'+src).digest('hex'),baseline};
    const sample={index:1,parameterRevision:0,kind:'baseline',battleCount:1,readBackConfirmed:true,values:Object.fromEntries(Object.entries(baseline).map(([k,v])=>[k,Number(v)]))};
    const result=await validatePacket({context,samples:[sample]});
    assert.ok(plan(context,result.samples[0],{mode:'c5m',text:src,selected:0,inputs:{}}).rows.every(r=>!r.testChanged));
  }
});
test('IDs keep role and duplicate identity, and unresolved visual slots cannot enter an expanded package',()=>{
  const g=melee.catalog;
  assert.deepEqual(Object.values(g).map(x=>Object.keys(x).length),[30,55,126]);
  assert.equal(g.sprite[14].name,null);assert.equal(g.sprite[14].witness,9);
  const impacts=choices.rangedChoices('impact',g.impact);
  assert.deepEqual(choices.search(impacts,'white flare').map(e=>e.id),[3,83]);
  assert.equal(choices.search(impacts,'#49')[0].name,'Acid Splash');
  for(const id of ['0','6','53','240','299'])assert.throws(()=>melee.testPackage(draft({look:id}),'c5m','WB_C','8',true));
  assert.throws(()=>melee.testPackage(draft({flylook:'49'}),'c5m','WB_C','8',true));
  assert.throws(()=>melee.testPackage(draft({flymode:'1',flylook:'197'}),'c5m','WB_C','8',true));
  assert.throws(()=>melee.testPackage(draft(),'c5m','WB_C','8',false));
});
test('creator role pickers preserve explicit duplicate IDs, the separate impact and attack settings',async()=>{
  const h=harness({example:false}),$=h.$;await h.ready;
  $('target').value='vanilla';await $('target').emit('change');await $('newDefinition').emit('click');
  $('create-weaponName').value=spec.weaponName;$('create-dmg').value='12';
  for(const [button,query,id] of [['chooseRangedImpact','#83',83],['chooseSpriteFlight','#14',14]]){
    await $(button).emit('click');assert.equal($('installedChoiceTools').hidden,true);
    $('choiceQuery').value=query;await $('choiceQuery').emit('input');
    assert.equal($('useChoice').disabled,false);await $('useChoice').emit('click');
    assert.equal($(button==='chooseRangedImpact'?'create-look':'create-flylook').value,String(id));
  }
  assert.equal($('create-look').value,'83');assert.equal($('create-dmg').value,'12');
  await $('creationForm').emit('submit');await $('prepareTest').emit('click');
  assert.equal($('rangedCompare').checked,true);assert.equal($('rangedCompare').disabled,true);
  await $('testForm').emit('submit');assert.equal(h.window.CoePreparedTest().manifest.kind,'private-ranged-compare-v2');
});
