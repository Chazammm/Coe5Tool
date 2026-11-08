'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const results=require('../battle-results'),creation=require('../creation'),returns=require('../return-values'),{harness}=require('./harness.cjs');
const roster=[{id:13,name:'Spearman',count:3},{id:27,name:'Levy',count:3}];
const spec={weaponName:'Recorded Area Trial',range:'5',init:'5',dmgtype:'3',dmg:'0',aoe:'5',look:'34',flymode:'1',flylook:'7'};
function fixture(){
 const source=creation.weaponDefinition(spec).text;
 const context={resultSchema:4,visualCatalog:2,legacy:false,source,mode:'c5m',weaponName:spec.weaponName,spellName:'weapon '+spec.weaponName,
  baseline:{look:'34',flymode:'1',flylook:'7'},sourceRevision:createHash('sha256').update('c5m\0'+source).digest('hex'),sessionId:'c'.repeat(32),run:'d'.repeat(32),modId:'WB_Recorded',areaCode:5,roster};
 const after=[-1,-4,6,5,1,2],units=roster.flatMap(g=>Array.from({length:g.count},()=>g)).map((g,i)=>({unit:i+2,monster:g.id,name:g.name,beforeHp:g.id===13?6:5,afterHp:after[i],resistance:null}));
 const sample=(index,look)=>({index,parameterRevision:index-1,kind:index===1?'baseline':'applied',battleCount:1,readBackConfirmed:true,areaCode:5,
  values:{look,flymode:1,flylook:7},mixedReading:{units:structuredClone(units),closed:true,restored:true}});
 return {context,samples:[sample(1,34),sample(2,68)]};
}
const input=()=>({...fixture().samples[0].mixedReading,element:null,battleReturns:1});
function desktop(packet){return {getTestSessions:async()=>[{id:packet.context.sessionId,run:packet.context.run,spell:packet.context.spellName,weapon:packet.context.weaponName,mode:'c5m',status:'exited',hasResult:true,rangedComparison:true,roster}],getTestValues:async()=>packet};}

test('mixed state summary retains negative HP and never attributes a hit, damage or position',()=>{
 const raw=input();Object.assign(raw.units[1],{hit:true,damage:10,position:{x:16,y:9}});
 const before=structuredClone(raw),m=results.model(raw);
 assert.deepEqual(m.counts,{lower:4,higher:0,unchanged:2,unknown:0});assert.equal(m.types,2);assert.equal(m.units[1].delta,-10);
 for(const u of m.units){assert.equal(u.hit,null);assert.equal(u.attackPosition,null);assert.equal(u.weaponDamage,null);}
 assert.deepEqual(raw,before);
});
test('unknown after-HP, healing and duplicate names remain distinct from hits and identity',()=>{
 const raw=input();raw.units[0].afterHp=null;raw.units[1].afterHp=9;raw.units[3].name='Spearman';
 const m=results.model(raw);assert.equal(m.counts.unknown,1);assert.equal(m.counts.higher,1);assert.equal(m.units[0].delta,null);
 assert.equal(m.units[1].delta,3);assert.equal(m.types,2);assert.notEqual(m.units[0].monster,m.units[3].monster);
});
test('incomplete, duplicate or malformed state is rejected instead of becoming an unchanged result',()=>{
 const mutations=[r=>r.units=[],r=>r.units[0].afterHp=undefined,r=>r.units[0].afterHp='0',r=>r.units[0].beforeHp=NaN,
  r=>r.units[1].unit=r.units[0].unit,r=>r.units[0].resistance=100,r=>r.closed='true',r=>r.battleReturns=2];
 for(const mutate of mutations){const raw=input();mutate(raw);assert.throws(()=>results.model(raw));}
});
test('elemental readings preserve zero, nonzero and unknown resistance without a formula',()=>{
 const raw=input();raw.element='cold';raw.units[0].resistance=0;raw.units[1].resistance=100;
 const m=results.model(raw);assert.equal(m.units[0].resistance,0);assert.equal(m.units[1].resistance,100);assert.equal(m.units[2].resistance,null);
 assert.equal(m.units[0].weaponDamage,null);
});
test('rendering keeps every defender discoverable, uses plain text, and reports incomplete closure honestly',async()=>{
 const h=harness({example:false});await h.ready;const raw=input();raw.units=Array.from({length:200},(_,i)=>({...raw.units[0],unit:i+2,name:'<b>same name</b>',monster:i%2?13:27}));
 raw.battleReturns=0;raw.closed=false;raw.restored=false;raw.units[0].afterHp=null;
 results.render(h.$('groupBattleResults'),raw,h.document,'check');
 assert.equal(h.$('checkRows').children.length,200);assert.match(h.$('checkRows').children[0].textContent,/<b>same name<\/b>/);
 assert.match(h.$('checkRows').children[0].textContent,/Not recordedUnknown/);
 assert.match(h.$('checkState').textContent,/0 battle calls returned.*closure unverified.*restoration unverified/);
 assert.match(h.$('checkUnknown').textContent,/Hits by the tested weapon: unknown/);
});
test('comparison review switches battle state without conflating user observations, HP and hits',async()=>{
 const packet=fixture();packet.samples[0].mixedReading.units[0].afterHp=6;
 const h=harness({example:false,desktop:desktop(packet)});await h.ready;h.window.CoeWorkbenchSession.openGenerated(creation.weaponDefinition(spec));const $=h.$;
 await h.window.CoeOpenReturnForSession(packet.context.sessionId);
 assert.equal($('groupReadings').open,true);assert.match($('groupReadingsLabel').textContent,/Battle 2/);
 assert.equal($('returnBattleRows').children.length,6);assert.match($('returnBattleSummary').textContent,/4 lower HP/);
 $('returnObserved').checked=true;await $('returnObserved').emit('change');assert.match($('returnEvidence').textContent,/You report/);
 assert.match($('returnBattleUnknown').textContent,/unknown/);
 $('returnSample').value='1';await $('returnSample').emit('change');assert.equal($('returnObserved').checked,false);
 assert.match($('groupReadingsLabel').textContent,/Battle 1/);assert.match($('returnBattleSummary').textContent,/3 lower HP.*3 unchanged HP/);
 assert.match($('returnBattleRows').children[0].textContent,/6 → 60/);
 assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,packet.context.source);
});
test('results preserve pending edits, explicit visual-only Apply and old return compatibility',async()=>{
 const packet=fixture(),h=harness({example:false,desktop:desktop(packet)});await h.ready;h.window.CoeWorkbenchSession.openGenerated(creation.weaponDefinition(spec));const $=h.$;
 $('field-init').value='9';await $('field-init').emit('input');await h.window.CoeOpenReturnForSession(packet.context.sessionId);
 assert.equal($('returnUse-look').checked,true);assert.equal($('returnUse-flymode').checked,false);
 await $('applyReturn').emit('click');const d=h.window.CoeWorkbenchSession.returnDraft();
 assert.equal(d.text,packet.context.source.replace('look 34','look 68'));assert.equal(d.inputs.init,'9');
 const old=await returns.validatePacket(packet);assert.equal(old.context.resultSchema,4);assert.equal(old.samples[0].mixedReading.units.length,6);
});
test('fixed mixed readback uses the same view and clears old results on read failure',async()=>{
 let failed=false;const record={sessionId:'fixed',...input(),areaCode:5};
 const h=harness({example:false,desktop:{getTestSession:async()=>({id:'fixed',spell:'weapon Fixed Trial',status:'exited',roster}),
  getMixedTestValues:async()=>{if(failed)throw Error('Result identity differs');return record;}}});await h.ready;
 await h.$('refreshTestSession').emit('click');await h.$('readMixedValues').emit('click');
 assert.equal(h.$('fixedBattleRows').children.length,6);assert.equal(h.$('mixedValues').hidden,false);
 assert.match(h.$('fixedBattleUnknown').textContent,/unknown/);failed=true;await h.$('readMixedValues').emit('click');
 assert.equal(h.$('mixedValues').hidden,true);assert.equal(h.$('mixedValuesRows').children.length,0);
 assert.match(h.$('sessionStatus').textContent,/Result identity differs/);
});
