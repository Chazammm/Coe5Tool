'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const creation=require('../creation.js'),core=require('../core.js'),ret=require('../return-values.js'),{harness}=require('./harness.cjs');
const spec={spellName:'WB Visual Pair',weaponName:'WB Visual Pair',path:'3',level:'1',weaponDamage:'8',dmg:'0',dmgtype:'4',range:'6',init:'1',aoe:'0',look:'68',flymode:'6',flylook:'65',sound:'16',flysound:'104'};
function packet(changes={}){
 const s={...spec,...changes},mode='c5m',source=creation.definition(s,mode).text;
 return {context:{sessionId:'a'.repeat(32),sourceRevision:crypto.createHash('sha256').update(mode+'\0'+source).digest('hex'),run:'b'.repeat(32),modId:'WB_VisualPair',spellName:s.spellName,weaponName:s.weaponName,mode,source,baseline:{dmgtype:s.dmgtype,aoe:s.aoe,look:s.look,flymode:s.flymode,flylook:s.flylook},resultSchema:2,legacy:false,runtime:'CoE5 5.43 / SE 2.13.0'},runtimeBaseline:{look:Number(s.look||0),flymode:Number(s.flymode||0),flylook:Number(s.flylook||0)},samples:[{index:2,panel:1,parameterRevision:1,values:{dmgtype:4,aoe:0,look:2,flymode:5,flylook:2},castCount:1,readBackConfirmed:true,kind:'applied'}]};
}
const host=p=>({getTestSessions:async()=>[{id:p.context.sessionId,spell:spec.spellName,status:'exited'}],getTestValues:async()=>p,exportCopy:async()=>null});
async function form(h){await h.ready;await h.$('returnTestValues').emit('click');await new Promise(r=>setImmediate(r));await h.$('loadReturnSession').emit('click');await h.$('openReturnSource').emit('click');}
test('v2 result values retain source/launch binding and distinguish current visual readback from human observation',async()=>{
 const p=packet(),v=await ret.validatePacket(p);assert.deepEqual(v.samples[0].values,{dmgtype:4,aoe:0,look:2,flymode:5,flylook:2});assert.equal(v.samples[0].userObserved,false);assert.equal(v.samples[0].castCount,1);assert.equal(v.context.runtimeBaseline.look,68);
 for(let mode=2;mode<=9;mode++)for(const id of [0,299]){const option=packet();option.samples[0].values={dmgtype:4,aoe:0,look:id,flymode:mode,flylook:id};assert.equal((await ret.validatePacket(option)).samples[0].values.flymode,mode);}
 for(const change of [p=>p.context.resultSchema=3,p=>p.context.baseline.look='2',p=>p.runtimeBaseline.look=67,p=>p.runtimeBaseline.flymode=NaN,p=>delete p.runtimeBaseline,p=>delete p.samples[0].values.flylook,p=>p.samples[0].values.look=300,p=>p.samples[0].values.flymode=10,p=>p.samples[0].values.flymode=1,p=>p.samples[0].values.flylook=300,p=>p.samples[0].values.sound=16,p=>p.samples[0].kind='baseline']){const bad=packet();change(bad);await assert.rejects(ret.validatePacket(bad));}
 const old=packet();old.context.resultSchema=1;await assert.rejects(ret.validatePacket(old),/Unsupported result field/);
});
test('mode 1 accepts only its unchanged recorded pair; a new effect mode has a distinct bounded interpretation',async()=>{
 const p=packet({flymode:'1',flylook:'1000'});p.samples[0].values={dmgtype:4,aoe:0,look:299,flymode:1,flylook:1000};assert.equal((await ret.validatePacket(p)).samples[0].values.flylook,1000);
 p.samples[0].values.flylook=2;await assert.rejects(ret.validatePacket(p),/flight interpretation/);p.samples[0].values.flymode=6;assert.equal((await ret.validatePacket(p)).samples[0].values.flylook,2);
});
test('manual VFX reports remain optional, unverified and paired; accepted calls do not create an observation',async()=>{
 const {context:c}=await ret.validatePacket(packet());const manual=ret.manual(c,{dmgtype:3,aoe:1,look:299,flymode:6,flylook:2},{observed:true});assert.equal(manual.readBackConfirmed,false);assert.equal(manual.castCount,null);assert.equal(manual.userObserved,true);
 assert.deepEqual(ret.manual(c,{dmgtype:3,aoe:1}).values,{dmgtype:3,aoe:1});assert.throws(()=>ret.manual(c,{dmgtype:3,aoe:1,flymode:6}),/together/);
});
test('plain missing visuals require explicit additions; ambiguous visuals remain unavailable without blocking other fields',async()=>{
 const {context:c,samples:[s]}=await ret.validatePacket(packet({look:'',flymode:'',flylook:''}));
 let plan=ret.plan(c,s,{text:c.source,mode:c.mode,selected:0,inputs:{}});assert.equal(plan.rows.length,5);assert.equal(plan.rows.filter(r=>r.addition).length,3);assert.ok(plan.rows.filter(r=>r.addition).every(r=>r.available&&!r.defaultSelected));
 const full=await ret.validatePacket(packet()),text=full.context.source.replace('look 68','look 68\r\nlook 2');plan=ret.plan(full.context,full.samples[0],{text,mode:c.mode,selected:0,inputs:{}});assert.equal(plan.rows.find(r=>r.key==='look').available,false);assert.equal(plan.rows.find(r=>r.key==='dmgtype').available,true);
 const flightRepeat=full.context.source.replace('flylook 65','flylook 65\r\nflylook 2');plan=ret.plan(full.context,full.samples[0],{text:flightRepeat,mode:c.mode,selected:0,inputs:{}});assert.ok(plan.rows.filter(r=>r.group==='flight').every(r=>r.available===false));
});
test('all five returned fields require review/staging/Apply and preserve sound, pending damage and exact surrounding bytes',async()=>{
 const p=packet(),h=harness({example:false,desktop:host(p)});await form(h);assert.equal(h.$('manualReturnVisuals').hidden,true);h.$('field-dmg').value='7';await h.$('field-dmg').emit('input');const before=h.$('output').value;
 await h.$('reviewReturn').emit('click');assert.equal(h.$('returnUse-look').checked,true);assert.equal(h.$('returnUse-flymode').checked,true);assert.equal(h.$('returnUse-flylook').checked,true);await h.$('stageReturn').emit('click');assert.equal(h.$('output').value,before);assert.equal(h.$('field-look').value,'2');assert.equal(h.$('field-flymode').value,'5');assert.equal(h.$('field-dmg').value,'7');assert.equal(h.$('field-sound').value,'16');assert.equal(h.downloads.length,0);
 await h.$('editForm').emit('submit');assert.match(h.$('output').value,/flymode 5/);assert.match(h.$('output').value,/flylook 2/);assert.match(h.$('output').value,/flysound 104/);assert.match(h.$('output').value,/dmg 7/);
 const v=await ret.validatePacket(p),text='\uFEFF# retained\r\n'+p.context.source.replace('look 68','look\t68 # annotation\n')+'\r# tail\nunknown_tail 9';const plan=ret.plan(v.context,v.samples[0],{text,mode:'c5m',selected:0,inputs:{}});const patched=core.patch(text,'c5m',plan.weaponId,{look:'2',flymode:'5',flylook:'2'}).text;assert.equal(patched,text.replace('look\t68','look\t2').replace('flymode 6','flymode 5').replace('flylook 65','flylook 2'));
});
test('flight fields return together, conflicts stay unchecked and newer desktop edits require explicit acknowledgement',async()=>{
 const p=packet(),h=harness({example:false,desktop:host(p)});await form(h);h.$('field-flylook').value='7';await h.$('field-flylook').emit('input');await h.$('reviewReturn').emit('click');assert.equal(h.$('returnUse-flymode').checked,false);assert.equal(h.$('returnUse-flylook').checked,false);
 h.$('returnUse-flymode').checked=true;await h.$('returnUse-flymode').emit('change');assert.equal(h.$('returnUse-flylook').checked,true);await h.$('stageReturn').emit('click');assert.match(h.$('returnStatus').textContent,/acknowledge/);assert.equal(h.$('field-flylook').value,'7');h.$('returnConflictAck').checked=true;await h.$('stageReturn').emit('click');assert.equal(h.$('field-flylook').value,'2');
 const v=await ret.validatePacket(p),review=h.window.CoeWorkbenchSession.previewTestReturn(v.context,v.samples[0]);assert.throws(()=>h.window.CoeWorkbenchSession.stageTestReturn(review,['flymode'],true),/together/);
});
test('missing optional controls are available but unchecked and manual visual input stays labeled and paired',async()=>{
 const p=packet({look:'',flymode:'',flylook:''}),h=harness({example:false,desktop:host(p)});await form(h);await h.$('reviewReturn').emit('click');assert.equal(h.$('returnUse-look').disabled,false);assert.equal(h.$('returnUse-look').checked,false);assert.equal(h.$('returnUse-flymode').checked,false);
 h.$('returnMode').value='manual';await h.$('returnMode').emit('change');assert.equal(h.$('manualReturnVisuals').hidden,false);h.$('manualReturnLook').value='299';await h.$('manualReturnLook').emit('input');await h.$('reviewReturn').emit('click');assert.match(h.$('returnEvidence').textContent,/Manual user report/);assert.equal(h.$('returnUse-look').disabled,false);assert.equal(h.$('returnUse-look').checked,false);
 h.$('manualReturnFlymode').value='6';await h.$('manualReturnFlymode').emit('input');await h.$('reviewReturn').emit('click');assert.match(h.$('returnStatus').textContent,/together/);
});
