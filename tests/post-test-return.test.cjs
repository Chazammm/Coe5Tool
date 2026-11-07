'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const creation=require('../creation.js'),ret=require('../return-values.js'),core=require('../core.js'),{harness}=require('./harness.cjs');
const spec={spellName:'Return Trial',weaponName:'Return Trial',path:'3',level:'1',weaponDamage:'8',dmg:'0',dmgtype:'4',range:'6',init:'1',aoe:'0',look:'7',flymode:'2',flylook:'7',sound:'16',flysound:'104'};
function packet(overrides={},mode='c5se'){
 const s={...spec,...overrides},source=creation.definition(s,mode).text;
 return {context:{sessionId:'a'.repeat(32),sourceRevision:crypto.createHash('sha256').update(mode+'\0'+source).digest('hex'),run:'b'.repeat(32),modId:'WB_ReturnTrial',spellName:s.spellName,weaponName:s.weaponName,mode,source,baseline:{dmgtype:s.dmgtype,aoe:s.aoe,look:s.look,flymode:s.flymode,flylook:s.flylook},resultSchema:2,legacy:false,runtime:'CoE5 5.43 / CoE5SE 2.13.0'},runtimeBaseline:{look:Number(s.look||0),flymode:Number(s.flymode||0),flylook:Number(s.flylook||0)},samples:[{index:1,panel:1,parameterRevision:0,values:{dmgtype:4,aoe:0,look:Number(s.look||0),flymode:Number(s.flymode||0),flylook:Number(s.flylook||0)},castCount:0,readBackConfirmed:true,kind:'baseline'},{index:2,panel:1,parameterRevision:1,values:{dmgtype:4,aoe:0,look:3,flymode:2,flylook:7},castCount:1,readBackConfirmed:true,kind:'applied'}]};
}
const row=(p,overrides={})=>({id:p.context.sessionId,spell:p.context.spellName,weapon:p.context.weaponName,mode:p.context.mode,run:p.context.run,status:'exited',hasResult:true,started:'2026-11-06T15:06:17Z',...overrides});
const flush=()=>new Promise(r=>setImmediate(r));
function host(p,rows=[row(p)]){const calls={loads:[],exports:[],invalidates:[]};return {calls,getTestSessions:async()=>rows,getTestValues:async id=>{calls.loads.push(id);return p;},exportCopy:async(...args)=>{calls.exports.push(args);return null;},invalidateTestSession:async id=>{calls.invalidates.push(id);}};}
async function open(p,options={}){const desktop=host(p,options.rows),h=harness({example:false,desktop});await h.ready;h.window.CoeWorkbenchSession.openGenerated(creation.definition({...spec,...options.spec},p.context.mode));await flush();return {h,desktop};}
async function review(h){await h.$('reviewLatestTest').emit('click');await flush();}
test('matching latest saved result opens directly with the changed impact selected, other settings tucked away',async()=>{
 const p=packet(),{h,desktop}=await open(p);assert.equal(h.$('testReturnNotice').hidden,false);assert.equal(desktop.calls.loads.length,0);
 await review(h);assert.equal(h.$('returnDialog').open,true);assert.equal(desktop.calls.loads.length,1);assert.equal(h.$('returnSubject').textContent,'Return Trial');assert.match(h.$('returnChangeSummary').textContent,/Impact effect: 7 → 3/);
 assert.equal(h.$('returnRows').children.length,1);assert.equal(h.$('returnUnchangedRows').children.length,4);assert.equal(h.$('returnUse-look').checked,true);assert.equal(h.$('returnUse-flymode').checked,false);assert.equal(h.$('applyReturn').disabled,false);assert.match(h.$('returnEvidence').textContent,/1 completed cast call/);assert.match(h.$('returnEvidence').textContent,/Visual appearance is not established/);
 const before=h.window.CoeWorkbenchSession.returnDraft().text;await h.$('applyReturn').emit('click');await flush();assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,before.replace('look 7','look 3'));assert.equal(h.$('returnDialog').open,false);assert.equal(h.$('testReturnNotice').hidden,true);assert.equal(desktop.calls.exports.length,0);assert.equal(desktop.calls.invalidates.length,0);assert.equal(h.document.activeElement,h.$('download'));
 await h.$('returnTestValues').emit('click');assert.equal(h.$('applyReturn').disabled,true);assert.equal(h.$('returnUse-look').checked,false);
});
test('discovery prefers a matching saved exited session over newer unrelated, running or unsaved sessions',async()=>{
 const p=packet(),rows=[row(p,{id:'1'.repeat(32),spell:'Other',started:'2026-12-01'}),row(p,{id:'2'.repeat(32),status:'running',started:'2026-12-01'}),row(p,{id:'3'.repeat(32),hasResult:false,started:'2026-12-01'}),row(p,{id:'4'.repeat(32),mode:'c5m',started:'2026-12-01'}),row(p)];
 const {h,desktop}=await open(p,{rows});await review(h);assert.deepEqual(desktop.calls.loads,[p.context.sessionId]);
 const other=await open(p,{rows:rows.slice(0,4)});assert.equal(other.h.$('testReturnNotice').hidden,true);await other.h.$('returnTestValues').emit('click');assert.equal(other.desktop.calls.loads.length,0);assert.equal(other.h.$('applyReturn').disabled,true);
});
test('latest applied snapshot wins even without a cast; baseline/history choices remain explicit',async()=>{
 const p=packet();p.samples.push({...p.samples[1],index:3,parameterRevision:2,values:{...p.samples[1].values,look:4},castCount:0});const {h}=await open(p);await review(h);
 assert.equal(h.$('returnSample').value,'3');assert.match(h.$('returnChangeSummary').textContent,/7 → 4/);assert.match(h.$('returnEvidence').textContent,/no completed cast call/);
 h.$('returnSample').value='2';await h.$('returnSample').emit('change');assert.match(h.$('returnEvidence').textContent,/1 completed cast call/);
 h.$('returnSample').value='1';await h.$('returnSample').emit('change');assert.equal(h.$('applyReturn').disabled,true);assert.match(h.$('returnChangeSummary').textContent,/No settings changed/);
});
test('latest saved timestamp takes precedence over preparation/start time and history distinguishes equal names',async()=>{
 const p=packet(),newerStart=row(p,{id:'c'.repeat(32),started:'2026-11-06T17:00:00Z',saved:'2026-11-06T17:01:00Z'}),latestSave=row(p,{started:'2026-11-05T12:00:00Z',saved:'2026-11-06T18:00:00Z'});
 const {h,desktop}=await open(p,{rows:[newerStart,latestSave]});await review(h);assert.deepEqual(desktop.calls.loads,[p.context.sessionId]);assert.match(h.$('returnSession').textContent,/aaaaaaaa/);assert.match(h.$('returnSession').textContent,/cccccccc/);
});
test('a changed flight mode displays its unchanged partner together and requires paired selection',async()=>{
 const p=packet();p.samples[1].values={dmgtype:4,aoe:0,look:7,flymode:6,flylook:7};const {h}=await open(p);await review(h);assert.equal(h.$('returnRows').children.length,2);assert.equal(h.$('returnUnchangedRows').children.length,3);assert.equal(h.$('returnUse-flymode').checked,true);assert.equal(h.$('returnUse-flylook').checked,true);
 h.$('returnUse-flymode').checked=false;await h.$('returnUse-flymode').emit('change');assert.equal(h.$('returnUse-flylook').checked,false);assert.equal(h.$('applyReturn').disabled,true);
 const v=await ret.validatePacket(p),s=h.window.CoeWorkbenchSession;assert.throws(()=>s.applyTestReturn(s.previewTestReturn(v.context,v.samples[1]),['flymode']),/together/);
});
test('direct Apply preserves unrelated pending edits, including invalid values, without applying or exporting them',async()=>{
 const p=packet(),{h,desktop}=await open(p);for(const [key,value]of [['dmg','not valid'],['range','12']]){h.$('field-'+key).value=value;await h.$('field-'+key).emit('input');}
 const before=h.window.CoeWorkbenchSession.returnDraft().text;await review(h);await h.$('applyReturn').emit('click');assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,before.replace('look 7','look 3'));assert.equal(h.$('field-dmg').value,'not valid');assert.equal(h.$('field-range').value,'12');assert.equal(h.$('download').disabled,true);assert.equal(h.$('apply').disabled,false);assert.equal(h.$('field-dmg').getAttribute('aria-invalid'),'true');assert.equal(desktop.calls.exports.length,0);assert.equal(h.document.activeElement,h.$('apply'));
});
test('pending spell edits remain in the selected spell while the associated weapon receives only selected values',async()=>{
 const p=packet(),{h}=await open(p);h.window.CoeWorkbenchSession.selectDefinition(1);h.$('field-weaponDamage').value='99';await h.$('field-weaponDamage').emit('input');const before=h.window.CoeWorkbenchSession.returnDraft().text;
 await review(h);assert.equal(h.$('applyReturn').disabled,false);assert.equal(h.$('stageReturn').disabled,true);await h.$('applyReturn').emit('click');assert.equal(h.window.CoeWorkbenchSession.returnDraft().selected,1);assert.equal(h.$('field-weaponDamage').value,'99');assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,before.replace('look 7','look 3'));assert.equal(h.$('download').disabled,true);
});
test('newer applied and pending values default to keep; explicit Replace authorizes only that field',async()=>{
 const p=packet(),{h}=await open(p);h.$('field-look').value='9';await h.$('field-look').emit('input');await h.$('editForm').emit('submit');h.$('field-look').value='11';await h.$('field-look').emit('input');h.$('field-range').value='12';await h.$('field-range').emit('input');await review(h);
 assert.equal(h.$('returnUse-look').checked,false);assert.match(h.$('returnRows').textContent,/Replace newer Impact effect/);assert.match(h.$('returnRows').textContent,/Draft 9 · field edit 11 → saved 3/);assert.equal(h.$('applyReturn').disabled,true);
 const v=await ret.validatePacket(p),s=h.window.CoeWorkbenchSession,plan=s.previewTestReturn(v.context,v.samples[1]);assert.throws(()=>s.applyTestReturn(plan,['look']),/Explicitly choose Replace/);
 h.$('returnUse-look').checked=true;await h.$('returnUse-look').emit('change');await h.$('applyReturn').emit('click');assert.equal(h.$('field-look').value,'3');assert.equal(h.$('field-range').value,'12');assert.match(s.returnDraft().text,/look 3/);assert.match(s.returnDraft().text,/range 6/);
});
test('draft/form/target changes invalidate a review instead of overwriting newer data',async()=>{
 const p=packet(),{h}=await open(p),v=await ret.validatePacket(p);await review(h);const s=h.window.CoeWorkbenchSession,old=s.previewTestReturn(v.context,v.samples[1]);
 h.$('field-look').value='9';await h.$('field-look').emit('input');assert.equal(h.$('applyReturn').disabled,true);assert.throws(()=>s.applyTestReturn(old,['look'],['look']),/changed/);assert.match(s.returnDraft().text,/look 7/);
 await h.$('reviewReturn').emit('click');assert.equal(h.$('returnUse-look').checked,false);h.$('target').value='vanilla';await h.$('target').emit('change');assert.throws(()=>s.applyTestReturn(old,['look'],['look']),/changed/);
});
test('weapon-only return keeps Vanilla target and source format; wrong interpretation, duplicates and relinked spells refuse',async()=>{
 const p=packet({},'c5m'),v=await ret.validatePacket(p),desktop=host(p),h=harness({example:false,desktop});await h.ready;h.$('target').value='vanilla';await h.$('target').emit('change');h.window.CoeWorkbenchSession.openGenerated(creation.weaponDefinition(spec));await flush();await review(h);
 assert.match(h.$('returnEvidence').textContent,/weapon-only draft/);await h.$('applyReturn').emit('click');assert.equal(h.window.CoeWorkbenchSession.target(),'vanilla');assert.equal(h.window.CoeWorkbenchSession.returnDraft().mode,'c5m');assert.equal(core.inspect(h.window.CoeWorkbenchSession.returnDraft().text,'c5m').blocks.length,1);assert.match(h.$('output').value,/look 3/);
 for(const text of [v.context.source.replace('8 "Return Trial"','8 "Other"'),v.context.source+'\nnewweapon "Return Trial"\n',v.context.source+'\n#!@newspell "Return Trial"\n'])assert.throws(()=>ret.plan(v.context,v.samples[1],{text,mode:'c5m',selected:0,inputs:{}}));
 assert.throws(()=>ret.plan(v.context,v.samples[1],{text:v.context.source,mode:'c5se',selected:0,inputs:{}}),/interpretation/);
});
test('missing plain optional fields are explicit unchecked additions, and paired flight values apply atomically',async()=>{
 const p=packet({look:'',flymode:'',flylook:''}),{h}=await open(p,{spec:{look:'',flymode:'',flylook:''}});await review(h);const before=h.window.CoeWorkbenchSession.returnDraft().text;
 assert.match(h.$('returnChangeSummary').textContent,/0 \(readback; no source line\) → 3/);
 for(const key of ['look','flymode','flylook']){assert.equal(h.$('returnUse-'+key).checked,false);assert.equal(h.$('returnUse-'+key).disabled,false);}assert.match(h.$('returnRows').textContent,/Add Impact effect/);assert.equal(h.$('applyReturn').disabled,true);
 h.$('returnUse-look').checked=true;await h.$('returnUse-look').emit('change');await h.$('applyReturn').emit('click');assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,before.replace('newweapon "Return Trial"\r\n','newweapon "Return Trial"\r\nlook 3\r\n'));assert.equal(h.$('field-flymode').value,'');
 await h.$('returnTestValues').emit('click');h.$('returnUse-flylook').checked=true;await h.$('returnUse-flylook').emit('change');assert.equal(h.$('returnUse-flymode').checked,true);await h.$('applyReturn').emit('click');const text=h.window.CoeWorkbenchSession.returnDraft().text;assert.match(text,/flymode 2\r\nflylook 7/);assert.equal((text.match(/look 3/g)||[]).length,1);assert.match(text,/sound 16/);
});
test('unsupported inherited source and a zero-mode runtime baseline cannot become implicit source additions',async()=>{
 const p=packet({look:'',flymode:'',flylook:''}),v=await ret.validatePacket(p);const plan=ret.plan(v.context,v.samples[1],{text:v.context.source.replace('sound 16','copyweapon "Other"\r\nsound 16'),mode:'c5se',selected:0,inputs:{}});assert.ok(plan.rows.filter(r=>['look','flymode','flylook'].includes(r.key)).every(r=>!r.available));
 const baseline=ret.plan(v.context,v.samples[0],{text:v.context.source,mode:'c5se',selected:0,inputs:{}});assert.ok(baseline.rows.filter(r=>r.group==='flight').every(r=>!r.available));assert.equal(baseline.rows.find(r=>r.key==='look').defaultSelected,false);
});
test('malformed matching results cannot auto-apply; manual reports are visibly separate and preserve unknown source text',async()=>{
 const p=packet();p.samples=[];p.error='Malformed result file';const {h}=await open(p);await review(h);assert.equal(h.$('returnDetails').open,true);assert.equal(h.$('returnMode').value,'manual');assert.match(h.$('returnStatus').textContent,/Malformed/);assert.equal(h.$('applyReturn').disabled,true);
 h.$('manualReturnLook').value='3';await h.$('manualReturnLook').emit('input');await h.$('reviewReturn').emit('click');assert.match(h.$('returnEvidence').textContent,/Manual user report; no helper readback or cast proof/);assert.equal(h.$('returnObserved').checked,false);assert.equal(h.$('returnUse-look').checked,true);
 const v=await ret.validatePacket(p),text='\uFEFF# start\r\n'+p.context.source.replace('look 7','look\t7 # retained\n')+'\r# end\nunknown 9';const plan=ret.plan(v.context,ret.manual(v.context,{dmgtype:4,aoe:0,look:3}),{text,mode:'c5se',selected:0,inputs:{}});assert.equal(core.patch(text,'c5se',plan.weaponId,{look:'3'}).text,text.replace('look\t7','look\t3'));
});
test('a stale asynchronous result or wrong launch session cannot replace the current review',async()=>{
 const p=packet(),desktop=host(p);let finish;desktop.getTestValues=()=>new Promise(resolve=>{finish=resolve;});const h=harness({example:false,desktop});await h.ready;h.window.CoeWorkbenchSession.openGenerated(creation.definition(spec,'c5se'));await flush();const opening=h.$('reviewLatestTest').emit('click');await flush();await h.$('closeReturn').emit('click');finish(p);await opening;assert.equal(h.$('returnDialog').open,false);assert.equal(h.$('applyReturn').disabled,true);
 desktop.getTestValues=async()=>({...p,context:{...p.context,sessionId:'c'.repeat(32)}});await h.$('returnTestValues').emit('click');assert.match(h.$('returnStatus').textContent,/another session/);assert.equal(h.$('applyReturn').disabled,true);
});
test('closing during session discovery ignores its late response and does not load a result',async()=>{
 const p=packet(),{h,desktop}=await open(p);let finish;desktop.getTestSessions=()=>new Promise(resolve=>{finish=resolve;});const opening=h.$('returnTestValues').emit('click');await flush();await h.$('closeReturn').emit('click');finish([row(p)]);await opening;assert.equal(h.$('returnDialog').open,false);assert.equal(desktop.calls.loads.length,0);assert.equal(h.$('applyReturn').disabled,true);
});
test('a late failed discovery cannot erase a newer successful matching result',async()=>{
 const p=packet(),{h,desktop}=await open(p);let rejectOld;
 desktop.getTestSessions=()=>new Promise((resolve,reject)=>{rejectOld=reject;});const old=h.window.CoeRefreshReturnAvailability();await flush();
 desktop.getTestSessions=async()=>[row(p)];await h.window.CoeRefreshReturnAvailability();assert.equal(h.$('testReturnNotice').hidden,false);
 rejectOld(new Error('Finish the current file dialog first.'));await old;assert.equal(h.$('testReturnNotice').hidden,false);
});
test('temporary native-dialog contention retains matching cached discovery without offering an unrelated result',async()=>{
 const p=packet(),{h,desktop}=await open(p);desktop.getTestSessions=async()=>{throw new Error('Finish the current file dialog first.');};await h.window.CoeRefreshReturnAvailability();assert.equal(h.$('testReturnNotice').hidden,false);
 h.window.CoeWorkbenchSession.openGenerated(creation.definition({...spec,spellName:'Unrelated',weaponName:'Unrelated'},'c5se'));await flush();assert.equal(h.$('testReturnNotice').hidden,true);assert.equal(desktop.calls.loads.length,0);
});
test('removed optional lines say Add and explain the conflict while requiring explicit selection',async()=>{
 const p=packet(),{h}=await open(p,{spec:{look:'',flymode:'',flylook:''}});await review(h);
 assert.match(h.$('returnRows').textContent,/Add Impact effect to this weapon/);assert.match(h.$('returnRows').textContent,/removed after preparation/);assert.equal(h.$('returnUse-look').checked,false);assert.equal(h.$('returnUse-flymode').checked,false);assert.equal(h.$('applyReturn').disabled,true);
 h.$('returnUse-look').checked=true;await h.$('returnUse-look').emit('change');await h.$('applyReturn').emit('click');assert.match(h.window.CoeWorkbenchSession.returnDraft().text,/look 3/);assert.equal(h.$('field-flymode').value,'');
});
test('returning from an owned exited session exposes review without erasing observation text or invalidating its retained files',async()=>{
 const p=packet(),desktop=host(p);let state=null;
 Object.assign(desktop,{getTestRuntime:async()=>({compatible:true,label:'Pinned fixture',detail:'No game'}),getTestSession:async()=>state,
  prepareTestSession:async()=>state={id:p.context.sessionId,revision:p.context.sourceRevision,spell:spec.spellName,weaponEditing:true,status:'prepared',stale:false},
  startTestSession:async()=>state={...state,status:'running'},
 });
 const h=harness({example:false,desktop});await h.ready;h.window.CoeWorkbenchSession.openGenerated(creation.definition(spec,'c5se'));await h.$('prepareTest').emit('click');await flush();h.$('testWeaponEditing').checked=true;await h.$('testWeaponEditing').emit('input');await h.$('testForm').emit('submit');await h.$('prepareSession').emit('click');await h.$('startTestSession').emit('click');assert.equal(state.status,'running');
 state={...state,status:'exited'};await h.emitWindow('focus');await flush();assert.equal(h.$('reviewSessionValues').hidden,false);h.$('testObservationNote').value='Keep this unsaved observation';await h.$('testObservationNote').emit('input');
 const invalidations=desktop.calls.invalidates.length;await h.$('reviewSessionValues').emit('click');assert.equal(h.$('testDialog').open,false);assert.equal(h.$('returnDialog').open,true);assert.equal(h.$('testObservationNote').value,'Keep this unsaved observation');assert.equal(h.window.CoeTestObservationDirty(),true);
 await h.$('applyReturn').emit('click');assert.equal(desktop.calls.invalidates.length,invalidations);assert.equal(h.window.CoeTestObservationDirty(),true);assert.equal(h.$('testObservationNote').value,'Keep this unsaved observation');
});
