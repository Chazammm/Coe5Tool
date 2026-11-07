'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const creation=require('../creation.js'),core=require('../core.js'),returns=require('../return-values.js'),choices=require('../choices.js'),docs=require('../documented-choices.js'),{harness}=require('./harness.cjs');
const spec={spellName:'WB Return Spark',weaponName:'WB Return Spark',path:'3',level:'1',weaponDamage:'8',dmg:'0',dmgtype:'4',range:'6',init:'1',aoe:'0',look:'',sound:'',flymode:'',flylook:'',flysound:''};
function packet(mode='c5m'){
 const source=creation.definition(spec,mode).text;
 return {context:{sessionId:'a'.repeat(32),sourceRevision:crypto.createHash('sha256').update(mode+'\0'+source).digest('hex'),run:'b'.repeat(32),modId:'WB_ReturnSpark',spellName:spec.spellName,weaponName:spec.weaponName,mode,source,baseline:{dmgtype:'4',aoe:'0'},legacy:false,runtime:'CoE5 5.43 / CoE5SE 2.13.0'},samples:[{index:1,panel:1,parameterRevision:1,values:{dmgtype:3,aoe:5},castCount:1,readBackConfirmed:true,kind:'applied'}],error:null};
}
const host=p=>({getTestSessions:async()=>[{id:p.context.sessionId,spell:spec.spellName,status:'exited',started:'2026-11-06'}],getTestValues:async()=>p,exportCopy:async()=>null});
async function returnForm(h){await h.ready;await h.$('returnTestValues').emit('click');await new Promise(r=>setImmediate(r));await h.$('loadReturnSession').emit('click');}
test('result association checks source hash, spell, weapon, launch, schema values and ordered samples',async()=>{
 const p=packet(),v=await returns.validatePacket(p);assert.equal(v.samples[0].origin,'helper');assert.equal(v.samples[0].userObserved,false);assert.equal(v.samples[0].castCount,1);
 for(const change of [p=>p.context.sourceRevision='f'.repeat(64),p=>p.context.spellName='Other',p=>p.context.weaponName='Other',p=>p.context.run='../arbitrary',p=>p.samples[0].readBackConfirmed=false,p=>p.samples[0].values.dmgtype=7,p=>p.samples[0].values.aoe=3,p=>p.samples.push(p.samples[0]),p=>p.samples[0].kind='baseline']){
  const bad=packet();change(bad);await assert.rejects(returns.validatePacket(bad));
 }
});
test('missing and legacy data allow labeled manual reports without fabricating readback or casts',async()=>{
 const p=packet();p.context.legacy=true;p.context.run='';p.samples=[];p.error='No result saved';const v=await returns.validatePacket(p),s=returns.manual(v.context,{dmgtype:3,aoe:1},{applied:true,observed:true});
 assert.equal(v.samples.length,0);assert.equal(s.origin,'manual');assert.equal(s.castCount,null);assert.equal(s.readBackConfirmed,false);assert.equal(s.userObserved,true);
 const p2=packet();p2.samples[0].castCount=0;assert.equal((await returns.validatePacket(p2)).samples[0].castCount,0);
 assert.throws(()=>returns.plan({...v.context,sessionId:'d'.repeat(32)},s,{mode:'c5m',text:v.context.source}),/another session/);
});
test('return comparison protects newer values and pending edits and rejects ambiguous or relinked source',async()=>{
 const {context:c,samples:[s]}=await returns.validatePacket(packet());
 const text=core.patch(c.source,c.mode,0,{aoe:'1'}).text,review=returns.plan(c,s,{text,mode:c.mode,selected:0,inputs:{aoe:'1',dmg:'7'}});
 assert.equal(review.rows.find(r=>r.key==='aoe').conflict,true);assert.equal(review.rows.find(r=>r.key==='dmgtype').conflict,false);assert.equal(review.sourceChanged,true);
 const pending=returns.plan(c,s,{text:c.source,mode:c.mode,selected:0,inputs:{dmgtype:'4',aoe:'1'}});assert.equal(pending.rows[1].pending,'1');assert.equal(pending.rows[1].conflict,true);
 assert.match(returns.plan(c,s,{text:c.source,mode:c.mode,selected:1,inputs:{level:'2'}}).blocked,/another definition/);
 for(const text of [c.source+'\r\nnewweapon "'+spec.weaponName+'"\r\n',c.source.replace('8 "'+spec.weaponName+'"','8 "Other"'),c.source.replace('aoe 0','aoe 0\r\naoe 1')])assert.throws(()=>returns.plan(c,s,{text,mode:c.mode,selected:0,inputs:{}}));
 assert.throws(()=>returns.plan(c,s,{text:c.source,mode:'c5se',selected:0,inputs:{}}),/interpretation/);
});
test('review/stage/apply/export are explicit, preserving comments, mixed EOL, unknown source and unrelated pending fields',async()=>{
 const p=packet(),h=harness({example:false,desktop:host(p)});await returnForm(h);await h.$('openReturnSource').emit('click');
 h.$('field-dmg').value='7';await h.$('field-dmg').emit('input');const original=h.$('output').value;
 await h.$('reviewReturn').emit('click');assert.equal(h.$('returnUse-dmgtype').checked,true);assert.equal(h.$('returnObserved').checked,false);assert.match(h.$('returnEvidence').textContent,/Visual appearance is not established/);
 await h.$('stageReturn').emit('click');assert.equal(h.$('output').value,original);assert.equal(h.$('field-dmg').value,'7');assert.equal(h.$('field-dmgtype').value,'3');assert.equal(h.$('field-aoe').value,'5');assert.equal(h.$('download').disabled,true);
 await h.$('editForm').emit('submit');assert.match(h.$('output').value,/dmg 7/);assert.match(h.$('output').value,/aoe 5/);assert.equal(h.$('sourceKind').textContent,'Test source snapshot');assert.equal(h.downloads.length,0);
 const c=p.context,s=returns.manual(c,{dmgtype:3,aoe:1});const text='\uFEFF# unrelated\r\n'+c.source.replace('range 6','range\t6 # keep\n')+'\n# opaque tail\runknown_later 9';
 const plan=returns.plan(c,s,{text,mode:c.mode,selected:0,inputs:{}});const patched=core.patch(text,c.mode,plan.weaponId,{dmgtype:'3',aoe:'1'}).text;
 assert.equal(patched,text.replace('dmgtype 4','dmgtype 3').replace('aoe 0','aoe 1'));
});
test('conflicts default to keep and require explicit replacement; changed forms invalidate a review',async()=>{
 const p=packet(),h=harness({example:false,desktop:host(p)});await returnForm(h);await h.$('openReturnSource').emit('click');h.$('field-aoe').value='1';await h.$('field-aoe').emit('input');await h.$('reviewReturn').emit('click');
 assert.equal(h.$('returnUse-aoe').checked,false);h.$('returnUse-aoe').checked=true;await h.$('stageReturn').emit('click');assert.match(h.$('returnStatus').textContent,/acknowledge/);assert.equal(h.$('field-aoe').value,'1');
 h.$('returnConflictAck').checked=true;h.$('field-range').value='9';await h.$('field-range').emit('input');await h.$('stageReturn').emit('click');assert.match(h.$('returnStatus').textContent,/field edits changed/);
 await h.$('reviewReturn').emit('click');h.$('returnUse-aoe').checked=true;h.$('returnConflictAck').checked=true;await h.$('stageReturn').emit('click');assert.equal(h.$('field-aoe').value,'5');assert.equal(h.$('field-range').value,'9');
});
test('missing/corrupt results have a usable manual path; another selected session cannot reuse previous values',async()=>{
 const p=packet();p.samples=[];p.error='Malformed result file';const h=harness({example:false,desktop:host(p)});await returnForm(h);assert.equal(h.$('returnMode').value,'manual');assert.match(h.$('returnStatus').textContent,/Malformed/);
 await h.$('openReturnSource').emit('click');h.$('manualReturnType').value='3';await h.$('manualReturnType').emit('input');h.$('manualReturnArea').value='1';await h.$('manualReturnArea').emit('input');await h.$('reviewReturn').emit('click');assert.match(h.$('returnEvidence').textContent,/Manual user report/);assert.equal(h.window.CoeReturnDirty(),true);
 await h.$('refreshReturnSessions').emit('click');assert.equal(h.$('reviewReturn').disabled,true);assert.equal(h.$('stageReturn').disabled,true);
});
test('new spell auto-names its weapon until any manual override; reset restores following and Vanilla remains independent',async()=>{
 const h=harness({example:false});await h.$('newDefinition').emit('click');
 for(const name of ['Sea','Sea Bolt']){h.$('create-spellName').value=name;await h.$('create-spellName').emit('input');assert.equal(h.$('create-weaponName').value,name);}
 h.$('create-weaponName').value='Other';await h.$('create-weaponName').emit('input');h.$('create-spellName').value='Ocean';await h.$('create-spellName').emit('input');assert.equal(h.$('create-weaponName').value,'Other');
 h.$('create-weaponName').value='';await h.$('create-weaponName').emit('input');h.$('create-spellName').value='Wave';await h.$('create-spellName').emit('input');assert.equal(h.$('create-weaponName').value,'');await h.$('useSpellName').emit('click');assert.equal(h.$('create-weaponName').value,'Wave');
 await h.$('closeCreation').emit('click');h.$('target').value='vanilla';await h.$('target').emit('change');await h.$('newDefinition').emit('click');assert.equal(h.$('useSpellName').hidden,true);assert.equal(h.$('create-weaponName').value,'');
});
test('all supplied documented table rows/ranges remain searchable, with honest bounds and creator restrictions',()=>{
 const entries=choices.documented();for(const [kind,rows]of Object.entries(docs.tables))for(const [token]of rows){const m=token.match(/^(-?\d+)(?:-(\d+))?$/);for(let id=+m[1];id<=+(m[2]??m[1]);id++)assert.ok(entries.some(e=>e.type===kind&&e.id===id),kind+':'+id);}
 assert.equal(entries.filter(e=>e.type==='path').length,68);assert.equal(entries.filter(e=>e.type==='dmgtype').length,25);assert.ok(choices.search(entries,'hydro','path').some(e=>e.id===4));
 assert.ok(choices.search(entries,'fire','dmgtype').length);assert.equal(choices.search(entries,'definitely absent').length,0);assert.equal(choices.search(entries,'hydro','path','runtime').length,0);
 for(const e of entries.filter(e=>e.type==='dmgtype'))assert.equal(choices.allowed(e,{type:'dmgtype',creator:true}),'');
 assert.match(choices.allowed(entries.find(e=>e.type==='sound'&&e.id===-1),{type:'sound'}),/launch/);
 assert.equal(choices.search(entries,'#-1','sound').length,1);
});
test('manual return close and session refresh honor unsaved-form protection',async()=>{
 const p=packet();p.samples=[];const h=harness({example:false,desktop:host(p)});await returnForm(h);h.$('manualReturnArea').value='1';await h.$('manualReturnArea').emit('input');h.window.confirm=()=>false;
 await h.$('closeReturn').emit('click');assert.equal(h.$('returnDialog').open,true);await h.$('refreshReturnSessions').emit('click');assert.equal(h.$('reviewReturn').disabled,false);assert.equal(h.$('manualReturnArea').value,'1');assert.equal(h.window.CoeDesktopState(),true);
 h.window.confirm=()=>true;await h.$('closeReturn').emit('click');assert.equal(h.$('returnDialog').open,false);assert.equal(h.window.CoeReturnDirty(),false);
});
function runtime(){return {sessionId:'a'.repeat(32),sourceRevision:'b'.repeat(64),run:'c'.repeat(32),runtime:'CoE5 5.43 / SE 2.13.0',entries:[{type:'monster',id:13,name:'Spearman'},{type:'monster',id:2000,name:'Spearman'},{type:'effect',id:299,name:''},{type:'spell',id:4000,name:'Custom Water',fields:{path:'4'}},{type:'weapon',id:5000,name:'Custom Water',fields:{flymode:'1',flylook:'6',sound:'999',flysound:'-1'}}],coverage:[{type:'monster',count:2,complete:false,inspectedBound:6998}]};}
test('runtime duplicate names preserve each ID, unnamed rows and numeric-only metadata without inventing origin or completeness',()=>{
 const c=choices.runtime(runtime()),found=choices.search(c.entries,'spear','monster');assert.deepEqual(found.map(e=>e.id),[13,2000]);assert.ok(found.every(e=>e.sourceKind==='runtime'&&e.detail.includes('origin is not exposed')));assert.ok(c.notes[0].includes('partial'));
 assert.equal(choices.search(c.entries,'#2000','monster').length,1);assert.ok(c.entries.some(e=>e.name==='Sound #999'));assert.ok(c.entries.some(e=>e.type==='effect'&&e.id===299&&e.name.includes('unnamed')));
 const bad=runtime();bad.entries.push(bad.entries[0]);assert.throws(()=>choices.runtime(bad),/ID/);bad.entries=[];bad.entries.push({type:'monster',id:6999,name:'Bad'});assert.throws(()=>choices.runtime(bad));
});
test('offline missing data is explicit and unknown indexes cannot become current or historical by self-labeling',async()=>{
 const empty=await choices.offline({notes:['No monsters loaded']});assert.equal(empty.entries.length,0);assert.ok(empty.notes[0].includes('No monsters'));
 const unknown=await choices.offline({reference:{kind:'names',text:JSON.stringify({monster:['Spear Variant'],spell:[],weapon:[]}),source:'Custom user index',version:'5.43'}});assert.equal(unknown.entries[0].sourceKind,'unknown');assert.equal(unknown.entries[0].id,null);
 await assert.rejects(choices.offline({monsters:{sha256:'bad',entries:[]}}),/provenance/);
});
test('search modal supports partial names, empty state, filters, keyboard selection and direct-entry fallback',async()=>{
 const h=harness({example:false});await h.ready;await h.$('newDefinition').emit('click');await h.$('findCreate-path').emit('click');h.$('choiceQuery').value='hydro';await h.$('choiceQuery').emit('input');assert.match(h.$('choiceCount').textContent,/1 match · page/);assert.match(h.$('choiceResults').textContent,/Hydromancy/);
 await h.$('choiceQuery').emit('keydown',{key:'ArrowDown'});assert.equal(h.document.activeElement,h.$('choiceResults').children[0]);await h.$('choiceResults').children[0].emit('keydown',{key:'Enter'});assert.equal(h.$('create-path').value,'4');assert.equal(h.$('choiceDialog').open,false);assert.match(h.$('create-pathInfo').textContent,/documented/);
 await h.$('findCreate-dmgtype').emit('click');h.$('choiceQuery').value='no such damage';await h.$('choiceQuery').emit('input');assert.match(h.$('choiceResults').textContent,/No matches/);assert.equal(h.$('useChoice').disabled,true);
 await h.$('closeChoices').emit('click');h.$('create-dmgtype').value='3';await h.$('create-dmgtype').emit('input');assert.equal(h.$('create-dmgtype').value,'3');
});
test('a runtime participant variant sets its explicit ID and manual name edits clear stale identity',async()=>{
 const h=harness({example:false,desktop:{getTestSessions:async()=>[{id:'a'.repeat(32),spell:'Custom',status:'exited'}],getRuntimeChoices:async()=>runtime()}});await h.ready;
 h.window.CoeWorkbenchSession.openGenerated(creation.definition(spec,'c5m'));await h.$('prepareTest').emit('click');await h.$('findEnemy').emit('click');await h.$('loadRuntimeChoices').emit('click');h.$('choiceQuery').value='#2000';await h.$('choiceQuery').emit('input');await h.$('useChoice').emit('click');assert.equal(h.$('testEnemy').value,'Spearman');assert.equal(h.$('testEnemyId').value,'2000');
 await h.$('testForm').emit('submit');assert.equal(h.window.CoePreparedTest().manifest.test.enemyId,'2000');assert.match(h.window.CoePreparedTest().files.find(f=>f.name.endsWith('.lua')).text,/participant\(enemy_name,enemy_preferred\)/);
 h.$('testEnemy').value='Other';await h.$('testEnemy').emit('input');assert.equal(h.$('testEnemyId').value,'');assert.match(h.$('testEnemyIdInfo').textContent,/Name only/);
 for(const id of ['-1','6999','1.2','13\n','nan'])assert.throws(()=>creation.testOptions({modId:'WB_Safe',caster:'Spearman',enemy:'Spearman',count:'1',enemyId:id}));
});
