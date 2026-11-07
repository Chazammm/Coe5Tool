const {test} = require('node:test');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const creation = require('../creation');
const melee = require('../melee');
const returns = require('../return-values');
const {harness} = require('./harness.cjs');
const spec = {weaponName:'Prism Example',range:'5',init:'5',dmgtype:'3',dmg:'0',aoe:'0',look:'68',flymode:'1',flylook:'7'};
function fixture(look='68') {
  const source=creation.weaponDefinition({...spec,look}).text;
  const c={resultSchema:3,legacy:false,sessionId:'a'.repeat(32),run:'b'.repeat(32),
    sourceRevision:createHash('sha256').update('c5m\0'+source).digest('hex'),
    mode:'c5m',modId:'WB_Prism',source,weaponName:spec.weaponName,spellName:'weapon '+spec.weaponName,
    baseline:{look,flymode:'1',flylook:'7'}};
  const sample=(index,parameterRevision,values)=>({index,parameterRevision,values,
    kind:index===1?'baseline':'applied',readBackConfirmed:true,battleCount:1});
  return {context:c,samples:[sample(1,0,{look:look===''?-1:Number(look),flymode:1,flylook:7}),
    sample(2,1,{look:34,flymode:2,flylook:97})]};
}
test('comparison is opt-in, uses the identical private carrier, and refuses melee or unsupported modes',()=>{
  const source=fixture().context.source;
  const pack=(src,compare)=>melee.testPackage(src,'c5m','WB_Prism','8',compare);
  const fixed=pack(source,false),compare=pack(source,true);
  assert.equal(fixed.manifest.kind,'private-ranged-v1');
  assert.equal(compare.manifest.kind,'private-ranged-compare-v2');
  assert.equal(compare.files[0].text,fixed.files[0].text);
  assert.equal(compare.source,source);
  assert.doesNotMatch(compare.files[1].text,/\{\{|fireTestField/);
  assert.throws(()=>pack(source.replace('flymode 1','flymode 9'),true),/projectile/);
  assert.throws(()=>pack(creation.weaponDefinition({...spec,range:'1',look:'',flymode:'',flylook:''}).text,true),/requires a supported standalone ranged/);
});
test('a bound battle history accepts only completed readbacks and mode-appropriate IDs',async()=>{
  const real=fixture();assert.equal((await returns.validatePacket(real)).samples.length,2);
  for(const change of [
    p=>p.samples[1].values.flymode=1, p=>p.samples[1].values.look=150, p=>p.samples[1].values.dmgtype=4,
    p=>p.samples[1].readBackConfirmed=false, p=>p.samples[1].battleCount=0, p=>p.samples[1].index=1,
    p=>p.context.run='', p=>p.context.weaponName='Other', p=>p.context.baseline.flylook='1',
    p=>p.samples[0].values.look=34, p=>p.samples.push({...p.samples[1],index:3,values:{look:68,flymode:2,flylook:97}})
  ]){const p=fixture();change(p);await assert.rejects(()=>returns.validatePacket(p));}
  assert.throws(()=>returns.manual(real.context,real.samples[1].values),/saved ranged/);
});
test('undeclared impact stays undeclared until an explicit insertion is selected',async()=>{
  const p=await returns.validatePacket(fixture(''));
  const draft={mode:'c5m',text:p.context.source,selected:0,inputs:{}};
  const baseline=returns.plan(p.context,p.samples[0],draft).rows.find(r=>r.key==='look');
  assert.equal(baseline.available,false);assert.equal(baseline.testChanged,false);
  const addition=returns.plan(p.context,p.samples[1],draft).rows.find(r=>r.key==='look');
  assert.equal(addition.available,true);assert.equal(addition.addition,true);assert.equal(addition.defaultSelected,false);
});
test('desktop review switches battles, binds visual observations to the selection, and protects unrelated pending edits',async()=>{
  const p=fixture(),c=p.context;
  const row={id:c.sessionId,run:c.run,spell:c.spellName,weapon:c.weaponName,mode:c.mode,status:'exited',hasResult:true,rangedComparison:true};
  const h=harness({example:false,desktop:{getTestSessions:async()=>[row],getTestValues:async()=>p}});
  await h.ready;h.window.CoeWorkbenchSession.openGenerated(creation.weaponDefinition(spec));
  const $=h.$;
  $('field-init').value='9';await $('field-init').emit('input');
  $('field-flylook').value='1';await $('field-flylook').emit('input');
  await h.window.CoeOpenReturnForSession(c.sessionId);
  assert.equal($('returnHistoryPicker').hidden,false);
  assert.match($('returnEvidence').textContent,/AI battle/);assert.doesNotMatch($('returnEvidence').textContent,/cast/);
  assert.equal($('returnUse-flymode').checked,false);assert.equal($('returnUse-flylook').checked,false);
  $('returnObserved').checked=true;
  $('returnSample').value='1';await $('returnSample').emit('change');
  assert.equal($('returnObserved').checked,false);
  $('returnSample').value='2';await $('returnSample').emit('change');
  assert.equal($('returnUse-look').checked,true);
  await $('applyReturn').emit('click');
  const d=h.window.CoeWorkbenchSession.returnDraft();
  assert.equal(d.text,c.source.replace('look 68','look 34'));
  assert.equal(d.inputs.init,'9');assert.equal(d.inputs.flylook,'1');
});
