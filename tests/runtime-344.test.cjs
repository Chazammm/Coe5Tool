const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const creation=require('../creation'),core=require('../core'),melee=require('../melee'),original=require('../original-records'),returns=require('../return-values'),{harness}=require('./harness.cjs');
const roster=[{id:609,name:'Deer',count:2},{id:487,name:'Winter Wolf',count:1}],spec={weaponName:'API Fourteen Trial',dmg:'0',dmgtype:'5',range:'5',init:'7',aoe:'5',flymode:'2',flylook:'65',look:'68'};
const options={modId:'WB_344',runtimeVersion:'3.4.4',caster:'Spearman',casterId:'13',enemy:'Spearman',enemyId:'13',count:'1',weaponEditing:true};
const lua=p=>p.files.find(f=>f.name.endsWith('.lua')).text;
test('3.4.4 pair helpers bind the selected runtime and refuse built-in weapon IDs before edits or forced attacks',()=>{
 for(const mode of ['c5m','c5se'])for(const weaponEditing of [false,true]){
  const source=creation.fromSource(core.starter(mode),mode,1).text,p=creation.testPackage(source,mode,{...options,weaponEditing});
  assert.equal(p.manifest.runtimeVersion,'3.4.4');assert.equal(p.manifest.workbenchVersion,creation.version);assert.equal(p.manifest.gameTested,false);
  assert.match(lua(p),weaponEditing?/weapon_id < 1200/:/info.weapon < 1200/);
  if(weaponEditing){assert.match(lua(p),/Private weapon identity changed; no shared record writes/);assert.match(lua(p),/Write rejected or readback differs/);}
  assert.doesNotMatch(lua(p),/coe5\.set\("(?:monster|item|class|terrain|ritual|weaponName)"/);
  assert.match(p.files[0].text,/CoE5SE 3\.4\.4/);assert.equal(core.inspect(source,mode).text,source);
 }
});
test('older runtimes keep the original canonical helper bytes and defaults',()=>{
 const source=creation.fromSource(core.starter('c5m'),'c5m',1).text;
 const old=['2.13.0','3.2.2','3.3.0'].map(runtimeVersion=>creation.testPackage(source,'c5m',{...options,runtimeVersion}));
 assert.ok(old.every(p=>lua(p)===lua(old[0])));assert.doesNotMatch(lua(old[0]),/3\.4\.4 private-record guard/);
 assert.equal(creation.runtimeVersion({}),'2.13.0');
 for(const bad of ['3.4.3','3.4.5','3.4','latest','']){if(!bad)continue;assert.throws(()=>creation.runtimeVersion({runtimeVersion:bad}),/official/);assert.equal(creation.officialGroups(bad),false);}
});
test('3.4.4 fixed and mixed comparisons preserve roster/source and retain private-carrier write identity checks',()=>{
 const source=creation.weaponDefinition(spec).text;
 for(const mixed of [false,true])for(const compare of [false,true]){
  const p=melee.testPackage(source,'c5m','WB_344_Ranged','12',compare,roster[0],'2',mixed?roster:null,'3.4.4');assert.equal(p.manifest.runtimeVersion,'3.4.4');assert.equal(p.source,source);assert.equal(p.manifest.dependencies[1],'CoE5SE 3.4.4');
  if(mixed)assert.deepEqual(p.manifest.roster,roster);
  if(compare){assert.match(lua(p),/weapon>=1200 and carrier>=2000/);assert.match(lua(p),/Private (?:visuals|visual write) did not read back/);}
 }
 const p=original.testPackage({type:'spell',id:445,name:'Fireball',sourceKind:'installed'},options);assert.equal(p.manifest.editable,false);assert.equal(p.manifest.runtimeVersion,'3.4.4');assert.doesNotMatch(lua(p),/coe5\.set\("weapon"|fireTestSpell/);
});
test('3.4.4 comparison result returns only selected visuals, keeps pending edits and protects conflicts',async()=>{
 const p=require('./official-comparison-fixture.cjs').fixture();p.context.runtimeVersion='3.4.4';p.context.runtime='CoE5 5.43 / CoE5SE 3.4.4 (preview; game acceptance pending)';
 const valid=await returns.validatePacket(p);assert.equal(valid.samples.length,2);
 // Reuse the existing source-aware return planner and its real conflict rules.
 const plan=returns.plan(valid.context,valid.samples[0],{text:valid.context.source,mode:valid.context.mode,inputs:{look:'3',range:'17'},selected:0});
 assert.ok(plan.rows.some(r=>r.key==='look'&&r.conflict));assert.equal(plan.rows.find(r=>r.key==='flymode').conflict,false);
 const forged=structuredClone(p);forged.context.runtimeVersion='3.4.5';await assert.rejects(()=>returns.validatePacket(forged),/context/);
});
test('preview is visible in actual preparation controls and never launches implicitly',async()=>{
 let prepared,starts=0;const h=harness({example:false,desktop:{getLibrary:async()=>null,getTestSessions:async()=>[],getTestRuntime:async()=>({compatible:true,version:'3.4.4',api:14,mixedSupported:true,label:'CoE5SE 3.4.4 (preview; game acceptance pending)',detail:'Checksum, attestation and API checked; gameplay pending'}),getTestSession:async()=>null,prepareTestSession:async p=>{prepared=p;return {id:'a'.repeat(32),revision:'b'.repeat(64),status:'prepared',runtimeVersion:'3.4.4',spell:'Trial'};},startTestSession:async()=>starts++}});await h.ready;
 h.window.CoeWorkbenchSession.openGenerated(creation.weaponDefinition(spec));const before=h.window.CoeWorkbenchSession.returnDraft().text;
 await h.$('prepareTest').click();await new Promise(r=>setImmediate(r));assert.match(h.$('testRuntime').textContent,/3\.4\.4.*preview.*pending/);await h.$('prepareGameTest').click();assert.equal(prepared.manifest.runtimeVersion,'3.4.4');assert.equal(starts,0);assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,before);
});
test('new registered commands are context coverage, not spell/weapon fields or globally approved syntax',()=>{
 const coverage=require('../command-coverage');assert.equal(coverage.info('castermaxcast').context,'ritual');assert.equal(coverage.info('itemslots').context,'monster');assert.deepEqual(coverage.info('keepweapons').versions,['3.4.4']);
 for(const word of ['castermaxcast 1','itemslots weapon 2','keepweapons']){const m=core.inspect('newweapon "W"\n'+word+'\nrange 5','c5se');assert.equal(m.blocks[0].fields.find(f=>f.key==='range').editable,false);assert.ok(m.diagnostics.some(d=>d.category==='coverage'));assert.equal(m.diagnostics.some(d=>d.severity==='error'),false);}
 assert.ok(coverage.info('beamwidth').versions.includes('3.4.4'));
});

test('Vanilla Library detail includes the new preview as well as its browse entry point',()=>{
 const policy=require('../vanilla-library');const entry={type:'spell',id:445,name:'Fireball',sourceKind:'installed'};const model=policy.model(entry,[]);
 assert.match(model.test,/3\.4\.4 preview/);assert.match(model.copy,/read-only/);assert.match(model.test,/AI may not use/);
});
