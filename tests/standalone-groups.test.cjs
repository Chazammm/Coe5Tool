const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const creation=require('../creation'),melee=require('../melee'),returns=require('../return-values');
const {harness}=require('./harness.cjs');
const deer={id:609,name:'Deer'};
const stats={weaponName:'Group Trial',range:'5',init:'5',dmgtype:'5',dmg:'0',aoe:'0',flymode:'1',flylook:'7',look:'68'};
const src=creation.weaponDefinition(stats).text;

test('standalone counts use the same native target ID on every route and never change the source or private attack',()=>{
  for(const [range,compare] of [['1',false],['5',false],['5',true]]){
    const source='\uFEFF'+creation.weaponDefinition({...stats,range,...(range==='1'?{flymode:'',flylook:'',look:''}:{})}).text;
    const prepare=count=>melee.testPackage(source,'c5m','WB_Group','8',compare,deer,count);
    assert.deepEqual(prepare('1'),prepare(undefined));
    const single=prepare('1');
    for(const n of ['2','3','200']){
      const p=prepare(n);
      assert.equal(p.source,source);assert.equal(p.files[0].text,single.files[0].text);
      assert.deepEqual(p.manifest.target,{...deer,count:Number(n)});
      assert.ok(p.files[1].text.includes('openTestField(carrier,-1,609,'+n+')'));
      assert.ok(p.files[3].text.includes(n+' × Deer #609'));
    }
    for(const value of ['0','-1','201','','2.5','3\n','2e2',{},null])assert.throws(()=>prepare(value),/count/);
  }
  assert.throws(()=>melee.testPackage(creation.weaponDefinition({...stats,aoe:'6'}).text,'c5m','WB_Group','8',true,deer,'3'),/area codes 0–5/i);
});

test('editing group size invalidates prepared files, preserves pending inputs and keeps quantity out of the native weapon',async()=>{
  const h=harness({example:false}),$=h.$;await h.ready;
  $('target').value='vanilla';await $('target').emit('change');await $('newDefinition').emit('click');
  $('create-weaponName').value='Group Trial';await $('creationForm').emit('submit');await $('prepareTest').emit('click');
  assert.equal($('standaloneCount').value,'1');assert.equal($('standaloneCount').disabled,false);
  $('meleePayload').value='11';await $('testForm').emit('submit');const start=h.window.CoePreparedTest();
  $('standaloneCount').value='3';await $('standaloneCount').emit('input');
  assert.throws(()=>h.window.CoePreparedTest());await $('testForm').emit('submit');const next=h.window.CoePreparedTest();
  assert.deepEqual(next.manifest.target,{id:13,name:'Spearman',count:3});assert.equal(next.manifest.payload,'11');
  assert.equal(next.files[0].text,start.files[0].text);assert.equal(next.source,start.source);
});

test('comparison review preserves independent and unavailable readings and rejects a partial or mislabeled roster',async()=>{
  const context={resultSchema:3,visualCatalog:2,legacy:false,sessionId:'a'.repeat(32),run:'b'.repeat(32),
    sourceRevision:createHash('sha256').update('c5m\0'+src).digest('hex'),mode:'c5m',source:src,
    weaponName:stats.weaponName,spellName:'weapon '+stats.weaponName,baseline:{flymode:'1',flylook:'7',look:'68'},target:{...deer,count:3}};
  const units=[{unit:2,resistance:0},{unit:3,resistance:-25},{unit:4,resistance:null}];
  const base={index:1,parameterRevision:0,battleCount:1,kind:'baseline',readBackConfirmed:true,values:{flymode:1,flylook:7,look:68}};
  const check=(reading,c=context)=>returns.validatePacket({context:c,samples:[{...base,targetReading:reading}]});
  const data=await check({id:609,units});assert.equal(data.resistanceElement,'cold');
  assert.deepEqual(data.samples[0].targetReading.units,units);
  const plan=returns.plan(context,data.samples[0],{mode:'c5m',text:src,selected:0,inputs:{init:'7'}});
  assert.deepEqual(plan.rows.map(r=>r.key).sort(),['flylook','flymode','look']);
  for(const bad of [{id:609,unit:2,resistance:0},{id:487,units},{id:609,units:[...units,units[0]]},
    {id:609,units:units.slice(0,2)},{id:609,units:[units[0],units[0],units[2]]},{id:609,units:[units[0],units[1],{unit:4,resistance:'0'}]}])
    await assert.rejects(check(bad),/defender/);
  for(const count of [0,201,'3']) await assert.rejects(check({id:609,units},{...context,target:{...deer,count}}),/defender/);
});
