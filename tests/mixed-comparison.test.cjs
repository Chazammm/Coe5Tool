const {test}=require('node:test'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const m=require('../melee'),c=require('../creation'),r=require('../return-values'),{harness}=require('./harness.cjs');
const roster=[{id:609,name:'Deer',count:2},{id:487,name:'Winter Wolf',count:1}];
const spec={weaponName:'Prismatic Mixed Trial',range:'5',init:'5',dmgtype:'3',dmg:'0',aoe:'0',look:'68',flymode:'1',flylook:'7'};
function fixture(){
 const source=c.weaponDefinition(spec).text;
 const context={resultSchema:4,visualCatalog:2,legacy:false,source,mode:'c5m',weaponName:spec.weaponName,spellName:'weapon '+spec.weaponName,baseline:{look:'68',flymode:'1',flylook:'7'},
 sourceRevision:createHash('sha256').update('c5m\0'+source).digest('hex'),sessionId:'a'.repeat(32),run:'b'.repeat(32),modId:'WB_MixedCompare',areaCode:0,roster};
 const units=roster.flatMap(g=>Array.from({length:g.count},()=>g)).map((g,i)=>({unit:i+2,monster:g.id,name:g.name,beforeHp:g.id===609?6:13,afterHp:i===2?8:6,resistance:null}));
 const sample=(index,v)=>({index,parameterRevision:index-1,kind:index===1?'baseline':'applied',battleCount:1,readBackConfirmed:true,areaCode:0,values:v,mixedReading:{closed:true,restored:true,units:structuredClone(units)}});
 return {context,samples:[sample(1,{flymode:1,flylook:7,look:68}),sample(2,{flymode:2,flylook:197,look:49})]};
}
test('mixed comparison preserves canonical private weapon and uses field-owned callbacks',()=>{
 const source=c.weaponDefinition(spec).text;
 const p=m.testPackage(source,'c5m','WB_MixedCompare','8',true,roster[0],'2',roster);
 assert.equal(p.manifest.kind,'private-mixed-compare-v1');assert.equal(p.source,source);
 assert.equal(p.files[0].text,m.testPackage(source,'c5m','WB_MixedCompare','8',false,roster[0],'2',roster).files[0].text);
 assert.match(p.files[1].text,/wb-ranged-mixed-results-1/);assert.match(p.files[1].text,/withTestFieldRoster/);
 assert.doesNotMatch(p.files[1].text,/\{\{[A-Z]+\}\}|openTestField\(|spawnUnit|fireTestField/);
 assert.match(p.files[3].text,/Review saved battles/);
});
test('mixed return validates every battle independently, including reused IDs and cleanup',async()=>{
 const p=fixture();const out=await r.validatePacket(p);assert.equal(out.samples.length,2);
 const mutations=[
 p=>p.context.roster=[...roster,roster[0]],p=>p.context.visualCatalog=1,p=>p.context.target={id:13,name:'Spearman'},
 p=>p.samples[1].mixedReading.units.pop(),p=>p.samples[1].mixedReading.restored=false,p=>p.samples[1].mixedReading.closed=false,
 p=>p.samples[1].mixedReading.units[0].monster=487,p=>p.samples[1].mixedReading.units[0].name='Other',
 p=>p.samples[1].mixedReading.units[0].beforeHp='6',p=>p.samples[1].mixedReading.units[0].resistance=100,
 p=>p.samples[1].mixedReading.units[1].unit=2,p=>p.samples[1].values.dmgtype=4,p=>p.samples[1].battleCount=0,
 p=>p.samples[1].readBackConfirmed=false,p=>p.samples[1].areaCode=5,p=>p.samples[1].values.flylook=299
 ];
 for(const change of mutations){const bad=structuredClone(fixture());change(bad);await assert.rejects(r.validatePacket(bad));}
 assert.throws(()=>r.manual(p.context,p.samples[1].values),/saved ranged/);
 const cold=fixture();cold.context.source=cold.context.source.replace('dmgtype 3','dmgtype 5');cold.context.sourceRevision=createHash('sha256').update('c5m\0'+cold.context.source).digest('hex');
 cold.samples[0].mixedReading.units[2].resistance=100;assert.equal((await r.validatePacket(cold)).resistanceElement,'cold');
});
test('mixed review protects changed fields and unrelated pending edits; returning values never returns roster/HP',async()=>{
 const p=await r.validatePacket(fixture()),draft={mode:'c5m',text:p.context.source.replace('look 68','look 34'),selected:0,inputs:{init:'9',flylook:'1'}};
 const plan=r.plan(p.context,p.samples[1],draft);
 assert.deepEqual(plan.rows.map(x=>x.key),['look','flymode','flylook']);
 assert.equal(plan.rows.find(x=>x.key==='look').conflict,true);
 assert.equal(plan.rows.find(x=>x.key==='flymode').defaultSelected,false);
 const h=harness({example:false,desktop:{getTestSessions:async()=>[{id:p.context.sessionId,run:p.context.run,spell:p.context.spellName,weapon:p.context.weaponName,mode:'c5m',status:'exited',hasResult:true,rangedComparison:true,roster}],
 getTestValues:async()=>fixture()}});
 await h.ready;h.window.CoeWorkbenchSession.openGenerated(c.weaponDefinition(spec));const $=h.$;
 $('field-init').value='9';await $('field-init').emit('input');$('field-flylook').value='1';await $('field-flylook').emit('input');
 await h.window.CoeOpenReturnForSession(p.context.sessionId);
 assert.equal($('returnBattleRows').children.length,3);assert.match($('returnBattleUnknown').textContent,/Hits by the tested weapon: unknown/);
 assert.match($('returnBattleRows').children[2].textContent,/Winter Wolf #487/);
 await $('applyReturn').emit('click');
 const result=h.window.CoeWorkbenchSession.returnDraft();
 assert.equal(result.text,p.context.source.replace('look 68','look 49'));assert.equal(result.inputs.init,'9');assert.equal(result.inputs.flylook,'1');
 $('returnSample').value='1';await $('returnSample').emit('change');assert.equal($('returnObserved').checked,false);
});
module.exports={fixture,roster,spec};

test('catalog-required comparison stays selected while adding mixed types and preparing through the UI',async()=>{
 const fingerprint='489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55';
 const h=harness({example:false,desktop:{getStandaloneTargets:async()=>({fingerprint,entries:roster.map(g=>({...g,hp:6}))})}});
 await h.ready;h.window.CoeWorkbenchSession.openGenerated(c.weaponDefinition({...spec,flymode:'2',flylook:'197'}));const $=h.$;
 await $('prepareTest').emit('click');
 assert.equal($('rangedCompare').checked,true);assert.equal($('rangedCompare').disabled,true);
 await $('addMixedTarget').emit('click');$('choiceQuery').value='#487';await $('choiceQuery').emit('input');await $('useChoice').emit('click');
 assert.equal($('rangedCompare').checked,true);assert.match($('mixedRosterHelp').textContent,/Each comparison/);
 await $('testForm').emit('submit');assert.equal(h.window.CoePreparedTest().manifest.kind,'private-mixed-compare-v1');
});


test('mixed area-5 review binds all six native defenders and returns only visuals while retaining pending area edits',async()=>{
 const source=c.weaponDefinition({...spec,weaponName:'Mixed Area Needle',aoe:'5',look:'34'}).text;
 const preparedRoster=[{id:13,name:'Spearman',count:3},{id:27,name:'Levy',count:3}];
 const base=fixture().context;
 const context={...base,source,weaponName:'Mixed Area Needle',spellName:'weapon Mixed Area Needle',areaCode:5,roster:preparedRoster,
   sourceRevision:createHash('sha256').update('c5m\0'+source).digest('hex'),baseline:{look:'34',flymode:'1',flylook:'7'}};
 const units=preparedRoster.flatMap(g=>Array.from({length:g.count},()=>g)).map((g,i)=>({
   unit:i+2,monster:g.id,name:g.name,beforeHp:g.id===13?6:5,afterHp:g.id===13?6:5,resistance:null
 }));
 const sample={index:1,parameterRevision:1,kind:'applied',battleCount:1,readBackConfirmed:true,areaCode:5,
   values:{look:68,flymode:1,flylook:7},mixedReading:{closed:true,restored:true,units}};
 const packet={context,samples:[sample]};
 const validated=await r.validatePacket(packet);assert.equal(validated.samples[0].mixedReading.units.length,6);
 for(const bad of [
   {...packet,samples:[{...sample,areaCode:0}]},
   {...packet,context:{...context,areaCode:0}},
   {...packet,samples:[{...sample,mixedReading:{...sample.mixedReading,units:units.slice(0,5)}}]}
 ])await assert.rejects(r.validatePacket(bad));
 const h=harness({example:false,desktop:{getTestSessions:async()=>[{
   id:context.sessionId,run:context.run,spell:context.spellName,weapon:context.weaponName,mode:'c5m',status:'exited',hasResult:true,rangedComparison:true,roster:preparedRoster
 }],getTestValues:async()=>packet}});
 await h.ready;h.window.CoeWorkbenchSession.openGenerated(c.weaponDefinition({...spec,weaponName:'Mixed Area Needle',aoe:'5',look:'34'}));const $=h.$;
 $('field-aoe').value='1';await $('field-aoe').emit('input');$('field-init').value='9';await $('field-init').emit('input');
 await h.window.CoeOpenReturnForSession(context.sessionId);
 assert.equal($('returnBattleRows').children.length,6);
 assert.equal($('returnUse-look').checked,true);assert.equal($('returnUse-flymode').checked,false);
 await $('applyReturn').emit('click');
 const draft=h.window.CoeWorkbenchSession.returnDraft();
 assert.equal(draft.text,source.replace('look 34','look 68'));
 assert.equal(draft.inputs.aoe,'1');assert.equal(draft.inputs.init,'9');
 // Synthetic readback only: no combat engine or source overwrite is used by this test.
});
