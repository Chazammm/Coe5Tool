const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const creation=require('../creation'),melee=require('../melee'),original=require('../original-records'),core=require('../core');
const {harness}=require('./harness.cjs');
const roster=[{id:609,name:'Deer',count:2},{id:487,name:'Winter Wolf',count:1}],spec={weaponName:'API Eleven Trial',dmg:'0',dmgtype:'3',range:'5',init:'7',aoe:'5',flymode:'2',flylook:'65',look:'68'};
const options={modId:'WB_330',runtimeVersion:'3.3.0',caster:'Spearman',casterId:'13',enemy:'Spearman',enemyId:'13',count:'1',weaponEditing:true};
test('3.3.0 official saved comparison returns through the desktop review with its own version label',async()=>{
 const r=require('../return-values'),p=require('./official-comparison-fixture.cjs').fixture();
 p.context.runtimeVersion='3.3.0';p.context.runtime='CoE5 5.43 / CoE5SE 3.3.0';
 const valid=await r.validatePacket(p);assert.equal(valid.samples.length,2);
 const unknown=structuredClone(p);unknown.context.runtimeVersion='3.3.1';await assert.rejects(r.validatePacket(unknown),/context/);
 let unavailable=false;
 const h=harness({example:false,desktop:{getTestSessions:async()=>[{id:p.context.sessionId,run:p.context.run,spell:p.context.spellName,weapon:p.context.weaponName,mode:'c5m',status:'exited',hasResult:true}],getTestValues:async()=>unavailable?unknown:structuredClone(p)}});await h.ready;
 h.$('openFile').files=[{name:'current.c5m',arrayBuffer:async()=>Buffer.from(p.context.source)}];await h.$('openFile').emit('change');
 await h.window.CoeOpenReturnForSession(p.context.sessionId);
 assert.match(h.$('returnEvidence').textContent,/Official CoE5SE 3.3.0 groups/);
 await h.$('applyReturn').click();assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,p.context.source.replace('look 68','look 34'));
 unavailable=true;await h.window.CoeOpenReturnForSession(p.context.sessionId);
 assert.equal(h.$('returnSubject').textContent,'Result unavailable');assert.equal(h.$('returnChangeSummary').textContent,'');assert.equal(h.$('returnEvidence').textContent,'');assert.equal(h.$('applyReturn').disabled,true);
});
test('3.3.0 uses the verified same API-11 helpers and keeps its own canonical version binding',()=>{
 const source=creation.weaponDefinition(spec).text;
 for(const compare of [false,true]){
  const a=melee.testPackage(source,'c5m','WB_330','12',compare,roster[0],'1',roster,'3.2.2'),b=melee.testPackage(source,'c5m','WB_330','12',compare,roster[0],'1',roster,'3.3.0');
  assert.equal(b.manifest.runtimeVersion,'3.3.0');assert.match(b.manifest.kind,/private-official-mixed/);assert.equal(b.manifest.groupApi,'official-group-1');assert.equal(b.manifest.dependencies[1],'CoE5SE 3.3.0');
  assert.equal(a.files.find(f=>f.name.endsWith('.lua')).text,b.files.find(f=>f.name.endsWith('.lua')).text);
  assert.equal(b.source,source);assert.match(b.files[0].text,/CoE5SE 3\.3\.0/);
 }
 for(const mode of ['c5m','c5se']){const source=creation.fromSource(core.starter(mode),mode,1).text,a=creation.testPackage(source,mode,{...options,runtimeVersion:'3.2.2'}),b=creation.testPackage(source,mode,options);assert.equal(b.manifest.runtimeVersion,'3.3.0');assert.equal(a.files.find(f=>f.name.endsWith('.lua')).text,b.files.find(f=>f.name.endsWith('.lua')).text);}
 const p=original.testPackage({type:'spell',id:445,name:'Fireball',sourceKind:'installed'},options);assert.equal(p.manifest.runtimeVersion,'3.3.0');assert.equal(p.manifest.editable,false);assert.match(p.files[0].text,/CoE5SE 3\.3\.0/);
 assert.throws(()=>creation.runtimeVersion({runtimeVersion:'3.3.1'}),/official/);assert.equal(creation.officialGroups('3.3.1'),false);assert.equal(creation.officialGroups('2.13.0'),false);
});
test('3.3.0 desktop preparation follows the official mixed route without replacing a target or starting a game',async()=>{
 let prepared,starts=0;const h=harness({example:false,desktop:{getLibrary:async()=>null,getTestSessions:async()=>[],getTestRuntime:async()=>({compatible:true,version:'3.3.0',api:11,mixedSupported:true,label:'CoE5SE 3.3.0 (preview)',detail:'Game acceptance pending'}),getTestSession:async()=>null,prepareTestSession:async p=>{prepared=p;return {id:'a'.repeat(32),revision:'b'.repeat(64),status:'prepared',spell:'Trial',runtimeVersion:'3.3.0',roster};},startTestSession:async()=>starts++}});await h.ready;
 const source=creation.weaponDefinition(spec).text;h.window.CoeWorkbenchSession.openGenerated(creation.weaponDefinition(spec));
 await h.$('prepareTest').click();await new Promise(r=>setImmediate(r));
 h.window.CoeFindStandaloneTarget=cb=>cb(roster[0]);await h.$('findStandaloneTarget').click();h.$('standaloneCount').value='2';await h.$('standaloneCount').emit('input');
 h.window.CoeFindStandaloneTarget=cb=>cb(roster[1]);await h.$('addMixedTarget').click();h.$('rangedCompare').checked=true;await h.$('rangedCompare').emit('change');
 assert.match(h.$('testRuntime').textContent,/3\.3\.0/);assert.match(h.$('mixedRosterHelp').textContent,/Official 3\.3\.0/);
 await h.$('prepareGameTest').click();assert.equal(prepared.manifest.kind,'private-official-mixed-compare-v1');assert.equal(prepared.manifest.runtimeVersion,'3.3.0');assert.deepEqual(JSON.parse(JSON.stringify(prepared.manifest.roster)),roster);assert.equal(starts,0);assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,source);assert.equal(h.$('startTestSession').disabled,false);
});
