'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{createHash}=require('node:crypto');
const m=require('../melee'),c=require('../creation'),r=require('../return-values'),core=require('../core'),{harness}=require('./harness.cjs');
const sample=()=> '\uFEFF'+fs.readFileSync(require('node:path').join(__dirname,'../examples/selected-weapon-workshop.c5m'),'utf8').replace(/\n/g,'\r\n');
const index=text=>core.inspect(text,'c5m').blocks.find(b=>b.name==='Harbor Needle').id;
async function open(h,text=sample()){h.$('openFile').files=[{name:'Existing-mod.c5m',arrayBuffer:async()=>Buffer.from(text)}];await h.$('openFile').emit('change');await h.window.CoeWorkbenchSession.selectDefinition(index(text));}
function packet(text){
 const selected=m.fromSource(text,'c5m',index(text));
 const context={resultSchema:3,visualCatalog:2,legacy:false,source:selected.text,mode:'c5m',weaponName:'Harbor Needle',spellName:'weapon Harbor Needle',
  baseline:{look:'34',flymode:'1',flylook:'7'},sourceRevision:createHash('sha256').update('c5m\0'+selected.text).digest('hex'),sessionId:'a'.repeat(32),run:'b'.repeat(32),modId:'WB_Selected',areaCode:0,target:{id:13,name:'Spearman'}};
 const s={index:1,parameterRevision:1,kind:'applied',battleCount:1,readBackConfirmed:true,areaCode:0,values:{look:68,flymode:1,flylook:7},targetReading:{id:13,unit:2,resistance:null}};
 return {context,samples:[s]};
}
test('existing weapon is isolated without surrounding spells, monsters, comments or source rewriting',()=>{
 const source=sample(),selected=m.fromSource(source,'c5m',index(source));
 assert.equal(selected.adapted,true);assert.equal(selected.route,'ranged');assert.equal(selected.spec.weaponName,'Harbor Needle');
 assert.match(selected.text,/^# Native weapon definition fragment/);assert.doesNotMatch(selected.text,/Hook|Charm|copystats|native attack range/);
 const p=m.testPackage(selected.text,selected.mode,'WB_Selected','8',true);
 assert.equal(p.manifest.kind,'private-ranged-compare-v2');assert.deepEqual(p.manifest.dependencies,['CoE5 5.43 Windows','CoE5SE 2.13.0']);
 assert.doesNotMatch(p.files[0].text,/Harbor Hook|Harbor Needle Charm|Harbor Practice Guard/);
 assert.equal(source,sample());assert.throws(()=>m.specification(source,'c5m',true));
});
test('old generated-source fingerprints and the paired cast path remain unchanged',async()=>{
 const def=c.weaponDefinition({weaponName:'Old',range:'5',init:'5',dmgtype:'3',dmg:'0',aoe:'0',look:'34',flymode:'1',flylook:'7'});
 assert.equal(m.fromSource(def.text,'c5m',0).text,def.text);assert.equal(m.fromSource(def.text,'c5m',0).adapted,false);
 const h=harness({example:false});await h.ready;h.window.CoeWorkbenchSession.openGenerated(c.definition({spellName:'Old spell',weaponName:'Old effect',path:'3',level:'1',weaponDamage:'8',dmg:'0',dmgtype:'3',range:'5',init:'5',aoe:'0',look:'34',flymode:'1',flylook:'7'},'c5m'));assert.equal(h.window.CoeWorkbenchSession.isTestWeaponSelection(),false);
 await h.$('prepareTest').emit('click');assert.equal(h.$('meleePayloadGroup').hidden,true);assert.match(h.$('testModeExplanation').textContent,/Cast once/);
});
test('copies, flags, unknowns, duplicates, missing fields and active prefixes cannot be silently dropped',()=>{
 const source=sample(),start='newweapon "Harbor Needle" # private test candidate';
 for(const change of [
  s=>s.replace(start,start+'\r\ncopyweapon "Spear"'),s=>s.replace(start,start+'\r\nmagical'),
  s=>s.replace(start,start+'\r\nunknown_thing 7'),
  s=>s.replace('init 5\r\ndmgtype 3\r\ndmg 0\r\naoe 0\r\nflymode','init 5\r\ninit 9\r\ndmgtype 3\r\ndmg 0\r\naoe 0\r\nflymode'),
  s=>s.replace(start,'#!@'+start),s=>s.replace('look 34 #','#!@look 34 #'),
  s=>s.replace(start,'selectweapon "Harbor Needle"'),s=>s+'\r\nnewweapon "harbor needle"\r\ndmg 2',
  s=>s.replace('aoe 0\r\nflymode','flymode')
 ]){
  const changed=change(source);assert.notEqual(changed,source);
  assert.throws(()=>m.fromSource(changed,'c5m',index(changed)));
 }
 assert.throws(()=>m.fromSource(source,'c5se',index(source)),/Sidecars/);
 assert.throws(()=>m.fromSource(source.replace('dmgtype 3\r\ndmg 0\r\naoe 0\r\nflymode','dmgtype 23\r\ndmg 0\r\naoe 0\r\nflymode'),'c5m',index(source)),/banish/i);
});
test('selected definition preparation leaves the full source and draft state intact; pending edits block it',async()=>{
 const h=harness({example:false});await h.ready;await open(h);const $=h.$,source=sample();
 assert.match($('prepareTest').textContent,/selected ranged/);assert.equal($('prepareTest').disabled,false);
 await $('prepareTest').emit('click');assert.match($('testIntro').textContent,/Definition-only.*Other mod content is not loaded/);
 $('rangedCompare').checked=true;await $('rangedCompare').emit('change');await $('testForm').emit('submit');
 const prepared=h.window.CoePreparedTest();assert.equal(prepared.source,m.fromSource(source,'c5m',index(source)).text);
 assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,source);assert.match(prepared.files[0].text,/WB Ranged Carrier/);
 await $('closeTest').emit('click');$('field-init').value='9';await $('field-init').emit('input');
 assert.equal($('prepareTest').disabled,true);assert.throws(()=>h.window.CoePreparedTest(),/Prepare files/);
 assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,source);
});
test('native editing uses searchable role-specific effects and never changes damage or range implicitly',async()=>{
 const h=harness({example:false});await h.ready;await open(h);const $=h.$;
 const visual=$('fields').children.find(e=>e.id==='visualFields'),row=visual.children.find(e=>e.className==='field-grid').children[0];
 const find=row.children.find(e=>e.className==='field-controls').children.find(e=>e.tagName==='button'&&e.textContent==='Find…');
 await find.emit('click');assert.equal($('choiceSource').value,'pinned');$('choiceQuery').value='Flame';await $('choiceQuery').emit('input');
 const flame=$('choiceResults').children.find(row=>row.children[1].textContent==='#68');assert.ok(flame);await flame.emit('click');assert.match($('choiceDetail').textContent,/#68/);await $('useChoice').emit('click');
 assert.equal($('field-look').value,'68');assert.equal($('field-dmgtype').value,'3');assert.equal($('field-range').value,'5');
 assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,sample());await $('editForm').emit('submit');
 assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,sample().replace('look 34 #','look 68 #'));
});
test('real-mod comparison return patches only the unique weapon while preserving all other source bytes',async()=>{
 const source=sample(),p=await r.validatePacket(packet(source));
 const h=harness({example:false});await h.ready;await open(h);const $=h.$;
 $('field-init').value='9';await $('field-init').emit('input');
 const review=h.window.CoeWorkbenchSession.previewTestReturn(p.context,p.samples[0]);
 assert.deepEqual(Array.from(review.rows,r=>r.key),['look','flymode','flylook']);
 h.window.CoeWorkbenchSession.applyTestReturn(review,['look']);
 const d=h.window.CoeWorkbenchSession.returnDraft();assert.equal(d.text,source.replace('look 34 #','look 68 #'));assert.equal(d.inputs.init,'9');
 assert.match(d.text,/newmonster "Harbor Practice Guard"/);assert.match(d.text,/#!@weapon 8 "Harbor Needle"/);
});
test('newer visual conflicts, pending edits in another definition and duplicate return names stay protected',async()=>{
 const source=sample(),p=await r.validatePacket(packet(source)),h=harness({example:false});await h.ready;await open(h,source.replace('look 34 #','look 49 #'));
 let review=h.window.CoeWorkbenchSession.previewTestReturn(p.context,p.samples[0]);
 assert.equal(review.rows.find(r=>r.key==='look').conflict,true);assert.throws(()=>h.window.CoeWorkbenchSession.applyTestReturn(review,['look']),/Explicitly/);
 h.window.CoeWorkbenchSession.applyTestReturn(review,['look'],['look']);assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,source.replace('look 34 #','look 68 #'));
 await h.window.CoeWorkbenchSession.selectDefinition(0);h.$('field-init').value='7';await h.$('field-init').emit('input');
 review=h.window.CoeWorkbenchSession.previewTestReturn(p.context,p.samples[0]);assert.equal(review.pendingElsewhere,true);
 h.window.CoeWorkbenchSession.applyTestReturn(review,['look']);assert.equal(h.window.CoeWorkbenchSession.returnDraft().inputs.init,'7');
 assert.throws(()=>r.destination(p.context,{text:source+'\r\nselectweapon "Harbor Needle"\r\nlook 7',mode:'c5m'}),/unique/);
 assert.throws(()=>r.destination(p.context,{text:source,mode:'c5se'}),/interpretation/);
});
test('mixed saved source copies open through the weapon route and respect an unsaved-draft refusal',async()=>{
 const h=harness({example:false});await h.ready;const p=packet(sample());p.context.resultSchema=4;
 assert.equal(h.window.CoeWorkbenchSession.openTestSnapshot(p.context),true);assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,p.context.source);
 h.$('field-init').value='9';await h.$('field-init').emit('input');h.window.confirm=()=>false;
 assert.equal(h.window.CoeWorkbenchSession.openTestSnapshot(p.context),false);assert.equal(h.window.CoeWorkbenchSession.returnDraft().inputs.init,'9');
});
