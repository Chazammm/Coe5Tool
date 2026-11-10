const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {candidate,fixture,spec,roster}=require('./official-comparison-fixture.cjs'),r=require('../return-values'),creation=require('../creation'),{harness}=require('./harness.cjs');
test('official comparison uses bounded group APIs, private visual setters and a separate result contract',()=>{
 const p=candidate(),lua=p.files[1].text;assert.equal(p.manifest.kind,'private-official-mixed-compare-v1');assert.equal(p.manifest.comparisonApi,'official-compare-1');
 assert.deepEqual(p.manifest.dependencies,['CoE5 5.43 Windows','CoE5SE 3.2.2']);assert.deepEqual(p.manifest.roster,roster);
 assert.match(lua,/local limit=8/);assert.match(lua,/openTestField\{commander=carrier/);assert.match(lua,/commanderLastIndex/);assert.match(lua,/unitLastIndex/);
 assert.match(lua,/wb-official-ranged-mixed-results-1/);assert.match(lua,/assert\(equal\(read\(\),expected\)/);
 assert.doesNotMatch(lua,/\{\{[A-Z]+\}\}|withTestFieldRoster|restored=1|spawnUnit|fireTestField|coe5\.set\("unit/);
 const html=fs.readFileSync(require.resolve('../index.html'),'utf8');assert.ok(html.indexOf('src="battle-results.js"')<html.indexOf('src="return-values.js"'),'Browser dependency must be loaded first');
});
test('each official battle retains its own identities, values and unknown attribution',async()=>{
 const p=await r.validatePacket(fixture());assert.equal(p.samples.length,2);assert.equal(p.context.resultSchema,5);
 assert.equal(p.samples[0].mixedReading.units[0].unit,2);assert.equal(p.samples[1].mixedReading.units[0].unit,6);
 assert.equal(p.samples[1].mixedReading.restored,null);assert.equal(p.samples[1].values.look,34);
 assert.throws(()=>r.manual(p.context,p.samples[1].values),/saved ranged/);
 for(const change of [p=>p.context.runtimeVersion='2.13.0',p=>p.context.groupApi='roster-v1',p=>p.context.roster.reverse(),p=>p.attempts[1].mixedReading.units[1].unit=6,
  p=>p.attempts[1].mixedReading.units[0].monster=487,p=>p.attempts[1].mixedReading.restored=true,p=>p.attempts[1].mixedReading.trackedInactive=3,
  p=>p.samples[1].values.look=68,p=>p.samples[1].attemptIndex=1,p=>p.attempts[1].values.dmgtype=4,p=>p.samples.pop(),p=>p.attempts[0].parameterRevision=2,
  p=>p.privateVisualsRestored=false,p=>p.attempts[1].mixedReading.areaCode=0,p=>p.attempts[1].mixedReading.units[0].setupPosition.y=20]){
   const bad=fixture();change(bad);await assert.rejects(r.validatePacket(bad));
 }
});
test('cancelled or uncertain attempts cannot return values or authorize later uncertain fields',async()=>{
 const p=fixture();p.comparisonStatus='error';p.privateVisualsRestored=false;p.comparisonMessage='Second field failed';
 Object.assign(p.attempts[1].mixedReading,{status:'error',closed:false,mainMenuAfterClose:false,trackedInactive:null});p.samples.pop();
 assert.equal((await r.validatePacket(p)).samples.length,1);
 const invalid=structuredClone(p);invalid.attempts.reverse();await assert.rejects(r.validatePacket(invalid));
 const cancelled=fixture();Object.assign(cancelled.attempts[0].mixedReading,{status:'cancelled',battleReturns:0,phase:'before-close'});cancelled.attempts[0].readBackConfirmed=false;
 cancelled.samples.shift();cancelled.samples[0].index=1;assert.equal((await r.validatePacket(cancelled)).samples.length,1);
 const stopped=fixture();Object.assign(stopped.attempts[1].mixedReading,{status:'cancelled',stopped:true});stopped.samples.pop();assert.equal((await r.validatePacket(stopped)).samples.length,1);
 const interrupted=fixture();interrupted.comparisonStatus='active';interrupted.privateVisualsRestored=false;interrupted.samples.pop();
 Object.assign(interrupted.attempts[1].mixedReading,{status:'battle-returned',closed:false,closeAttempted:false,mainMenuAfterClose:false,trackedInactive:null});
 assert.equal((await r.validatePacket(interrupted)).samples.length,1);
 const bad=fixture();Object.assign(bad.attempts[0].mixedReading,{status:'error',closed:false});bad.samples.shift();bad.samples[0].index=1;await assert.rejects(r.validatePacket(bad));
});
test('unchanged and missing optional impact values require explicit return choices',async()=>{
 const p=fixture(),valid=await r.validatePacket(p),baseline=r.plan(valid.context,valid.samples[0],{text:p.context.source,mode:'c5m',selected:0,inputs:{}});
 assert.ok(baseline.rows.every(row=>!row.defaultSelected));
 const missing=fixture();missing.context.source=creation.weaponDefinition({...spec,look:''}).text;missing.context.baseline.look='';
 missing.context.sourceRevision=require('node:crypto').createHash('sha256').update('c5m\0'+missing.context.source).digest('hex');
 missing.attempts[0].values.look=-1;missing.samples[0].values.look=-1;
 const out=await r.validatePacket(missing),plan=r.plan(out.context,out.samples[1],{text:out.context.source,mode:'c5m',selected:0,inputs:{}}),impact=plan.rows.find(row=>row.key==='look');
 assert.equal(impact.available,true);assert.equal(impact.addition,true);assert.equal(impact.defaultSelected,false);assert.equal(impact.proposed,'34');
});
test('official return preserves unrelated full-source content, pending edits and explicit conflict choices',async()=>{
 const packet=fixture(),source='# retained\r\nnewweapon "Unrelated"\r\nrange 1\r\ninit 4\r\ndmgtype 3\r\ndmg 0\r\naoe 0\r\n\r\n'+creation.weaponDefinition(spec).text.split('\r\n').slice(2).join('\r\n')+'# trailing comment\r\n';
 const h=harness({example:false,desktop:{getTestSessions:async()=>[{id:packet.context.sessionId,run:packet.context.run,spell:packet.context.spellName,weapon:spec.weaponName,mode:'c5m',status:'exited',hasResult:true,rangedComparison:true,roster}],getTestValues:async()=>fixture()}});await h.ready;
 const $=h.$;$('openFile').files=[{name:'larger.c5m',arrayBuffer:async()=>Buffer.from(source)}];await $('openFile').emit('change');await h.window.CoeWorkbenchSession.selectDefinition(1);
 $('field-init').value='9';await $('field-init').emit('input');$('field-look').value='49';await $('field-look').emit('input');
 await h.window.CoeOpenReturnForSession(packet.context.sessionId);
 assert.match($('returnEvidence').textContent,/Official CoE5SE 3.2.2/);assert.doesNotMatch($('returnEvidence').textContent,/local roster-v1/);
 assert.match($('returnAttemptHistory').textContent,/Attempt 1.*closed.*Attempt 2.*closed/);assert.equal($('returnBattleRows').children.length,3);
 assert.match($('returnBattleUnknown').textContent,/Hits by the tested weapon: unknown/);
 assert.equal($('returnUse-look').checked,false);assert.match($('returnRows').textContent,/Replace newer/);
 $('returnUse-look').checked=true;await $('returnUse-look').emit('change');await $('applyReturn').click();
 const out=h.window.CoeWorkbenchSession.returnDraft();assert.equal(out.text,source.replace('look 68','look 34'));assert.equal(out.inputs.init,'9');
});
