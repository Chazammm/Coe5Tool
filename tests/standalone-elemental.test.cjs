const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {harness}=require('./harness.cjs');
const {weaponDefinition}=require('../creation');
const {testPackage,carrierDamageReason}=require('../melee');
const returns=require('../return-values');
const stats={weaponName:'Element Drill',range:'5',init:'5',dmg:'0',aoe:'0',flymode:'2',flylook:'197',look:'68'};

test('an elemental comparison saves only visual changes and keeps the attack type and row payload',async()=>{
  for(const dmgtype of ['4','5','6']){
    const source=weaponDefinition({...stats,dmgtype}).text;
    const candidate=testPackage(source,'c5m','WB_Element','8',true);
    assert.equal(candidate.source,source);
    assert.match(candidate.files[0].text,/rangedweapon 8 "Element Drill"/);
    assert.ok(candidate.files[1].text.includes('dmgtype='+dmgtype+',dmg=0'));
    const context={resultSchema:3,visualCatalog:2,legacy:false,sessionId:'a'.repeat(32),run:'b'.repeat(32),
      sourceRevision:createHash('sha256').update('c5m\0'+source).digest('hex'),mode:'c5m',source,
      weaponName:stats.weaponName,spellName:'weapon '+stats.weaponName,baseline:{flymode:'2',flylook:'197',look:'68'}};
    const samples=[68,49].map((look,i)=>({index:i+1,parameterRevision:i,battleCount:1,kind:i?'applied':'baseline',readBackConfirmed:true,values:{flymode:2,flylook:197,look}}));
    const result=await returns.validatePacket({context,samples});
    const draft={mode:'c5m',text:source,selected:0,inputs:{dmgtype:'3',init:'9'}};
    const plan=returns.plan(context,result.samples[1],draft);
    assert.deepEqual(plan.rows.filter(r=>r.defaultSelected).map(r=>r.key),['look']);
    assert.ok(plan.rows.every(r=>!['dmgtype','dmg'].includes(r.key)));
    assert.equal(draft.inputs.dmgtype,'3');
    await assert.rejects(returns.validatePacket({context:{...context,visualCatalog:1},samples}));
  }
});

test('native damage search explains standalone eligibility and keeps independent payload and visuals',async()=>{
  const h=harness({example:false}),$=h.$;await h.ready;
  $('target').value='vanilla';await $('target').emit('change');await $('newDefinition').emit('click');
  $('create-weaponName').value='Element Drill';$('create-dmg').value='12';
  await $('useProjectileSetup').emit('click');
  for (const [search,id,reason] of [['bani','23',/banish/i],['#6','6',/private CoE5SE/],['col','5',/private CoE5SE/]]){
    await $('findCreate-dmgtype').emit('click');$('choiceQuery').value=search;await $('choiceQuery').emit('input');
    assert.equal($('installedChoiceTools').hidden,true);assert.match($('choiceDetail').textContent,reason);
    await $('useChoice').emit('click');assert.equal($('create-dmgtype').value,id);
    for(const [k,v] of Object.entries({dmg:'12',look:'68',flymode:'1',flylook:'7'}))assert.equal($('create-'+k).value,v);
  }
  await $('creationForm').emit('submit');await $('prepareTest').emit('click');
  assert.match($('originalTestScope').textContent,/cold · #5/);
  $('meleePayload').value='14';await $('testForm').emit('submit');
  const p=h.window.CoePreparedTest();assert.match(p.files[0].text,/rangedweapon 14/);
  assert.match(p.source,/dmgtype 5\r\ndmg 12/);
  for(const [id,why] of [['8',/morale/],['12',/mask/],['13',/mask/],['23',/banish/i],['25',/tree/]])assert.match(carrierDamageReason(id),why);
});
