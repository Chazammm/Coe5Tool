const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const choices=require('../choices'), melee=require('../melee'), creation=require('../creation'), returns=require('../return-values');
const {harness}=require('./harness.cjs');
const fingerprint='489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55';
const entries=[
  {id:0,name:'Baron',hp:17},{id:12,name:'Captain',hp:10},{id:291,name:'Captain',hp:10},
  {id:487,name:'Winter Wolf',hp:13},{id:609,name:'Deer',hp:6}
];
const wolf={id:487,name:'Winter Wolf'};
const stats={weaponName:'Target Trial',range:'5',init:'5',dmgtype:'5',dmg:'0',aoe:'0',flymode:'1',flylook:'7',look:'68'};

test('native target search keeps slot zero and duplicate name identities distinct',()=>{
  const rows=choices.standaloneTargets({fingerprint,entries});
  assert.deepEqual(choices.search(rows,'ptain').map(e=>e.id),[12,291]);
  assert.equal(choices.search(rows,'#0')[0].name,'Baron');
  assert.equal(choices.search(rows,'wint')[0].fields.hp,13);
  assert.equal(choices.search(rows,'#487','monster','historical').length,0);
  assert.deepEqual(choices.search(rows,'made up unit'),[]);
  for(const row of [{...wolf,hp:0},{...entries[0],id:2000},{...entries[0],name:'...'},{...entries[0],name:'Debug Spearman'}])
    assert.throws(()=>choices.standaloneTargets({fingerprint,entries:[row]}));
  assert.throws(()=>choices.standaloneTargets({fingerprint:'5.33',entries}));
  assert.throws(()=>choices.standaloneTargets({fingerprint,entries:[]}));
  assert.throws(()=>choices.standaloneTargets({fingerprint,entries:[entries[0],entries[0]]}));
});

test('one selected defender follows each private route without changing the carrier, source or visuals',()=>{
  for(const [range,compare] of [['1',false],['5',false],['5',true]]){
    const source='\uFEFF'+creation.weaponDefinition({...stats,range,...(range==='1'?{flymode:'',flylook:'',look:''}:{})}).text;
    const baseline=melee.testPackage(source,'c5m','WB_Target','8',compare);
    const p=melee.testPackage(source,'c5m','WB_Target','8',compare,wolf);
    assert.equal(p.source,source);assert.equal(p.files[0].text,baseline.files[0].text);
    assert.deepEqual(p.manifest.target,wolf);
    assert.match(p.files[1].text,/openTestField\(carrier,-1,487,1\)/);
    assert.match(p.files[1].text,/local targetId,targetName,damageType=487,"Winter Wolf",5/);
    assert.match(p.files[3].text,/one Winter Wolf #487/);
    assert.throws(()=>melee.testPackage(source,'c5m','WB_Target','8',compare,{id:-1,name:'Unknown'}));
  }
});

test('changing only the defender invalidates preparation and keeps draft bytes and row payload',async()=>{
  const h=harness({example:false,desktop:{getStandaloneTargets:async()=>({fingerprint,entries})}}),$=h.$;
  await h.ready;$('target').value='vanilla';await $('target').emit('change');
  await $('newDefinition').emit('click');$('create-weaponName').value='Target Trial';await $('creationForm').emit('submit');
  await $('prepareTest').emit('click');$('meleePayload').value='17';await $('testForm').emit('submit');
  const baseline=h.window.CoePreparedTest();assert.equal(baseline.manifest.target.id,13);
  await $('findStandaloneTarget').emit('click');$('choiceQuery').value='#291';await $('choiceQuery').emit('input');
  assert.equal($('choiceSource').value,'installed');assert.match($('choiceDetail').textContent,/#291/);await $('useChoice').emit('click');
  assert.throws(()=>h.window.CoePreparedTest());assert.equal($('meleePayload').value,'17');
  await $('testForm').emit('submit');const next=h.window.CoePreparedTest();
  assert.equal(next.source,baseline.source);assert.equal(next.files[0].text,baseline.files[0].text);assert.equal(next.manifest.target.id,291);
  await $('findStandaloneTarget').emit('click');$('choiceQuery').value='#291';await $('choiceQuery').emit('input');await $('useChoice').emit('click');
  assert.equal(h.window.CoePreparedTest().manifest.target.id,291);
});

test('unavailable catalog offers only the previously identified default',async()=>{
  const h=harness({example:false,desktop:{getStandaloneTargets:async()=>{throw Error('Fingerprint mismatch');}}}),$=h.$;
  await h.window.CoeFindStandaloneTarget(()=>{});assert.match($('rangedChoiceHelp').textContent,/Only default Spearman #13.*Fingerprint mismatch/);
  $('choiceQuery').value='Wolf';await $('choiceQuery').emit('input');assert.equal($('useChoice').disabled,true);
  $('choiceQuery').value='#13';await $('choiceQuery').emit('input');assert.equal($('choiceName').textContent,'Spearman');
  assert.match($('choiceDetail').textContent,/Base HP unavailable/);
});

test('a comparison binds its defender to each reading while returning visual fields only',async()=>{
  const source=creation.weaponDefinition(stats).text;
  const context={resultSchema:3,visualCatalog:2,legacy:false,sessionId:'a'.repeat(32),run:'b'.repeat(32),
    sourceRevision:createHash('sha256').update('c5m\0'+source).digest('hex'),mode:'c5m',source,
    weaponName:stats.weaponName,spellName:'weapon '+stats.weaponName,baseline:{flymode:'1',flylook:'7',look:'68'},target:wolf};
  const targetReading={id:487,unit:2,resistance:100};
  const base={index:1,parameterRevision:0,battleCount:1,kind:'baseline',readBackConfirmed:true,values:{flymode:1,flylook:7,look:68},targetReading};
  const check=(c,s)=>returns.validatePacket({context:c,samples:[s]});
  for(const resistance of [null,0,100,-25]){
    const packet=await check(context,{...base,targetReading:{...targetReading,resistance}});
    const rows=returns.plan(context,packet.samples[0],{mode:'c5m',text:source,selected:0,inputs:{init:'9'}}).rows;
    assert.deepEqual(rows.map(r=>r.key).sort(),['flylook','flymode','look']);
  }
  for(const reading of [null,{...targetReading,id:609},{...targetReading,unit:-1},{...targetReading,resistance:'100'}])
    await assert.rejects(check(context,{...base,targetReading:reading}),/defender/);
  await assert.rejects(check({...context,target:null},base),/defender/);
  await check({...context,target:null},{...base,targetReading:null});
});
