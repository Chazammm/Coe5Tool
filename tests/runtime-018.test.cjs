const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const creation=require('../creation.js'),core=require('../core.js'),melee=require('../melee.js'),original=require('../original-records.js'),{harness}=require('./harness.cjs');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const options={modId:'WB_Runtime',caster:'Spearman',casterId:'13',enemy:'Spearman',enemyId:'13',count:'1',weaponEditing:true};
const native={weaponName:'Runtime Needle',dmg:'0',dmgtype:'5',range:'5',init:'7',aoe:'0',flymode:'1',flylook:'7',look:'68'};
test('both runtime choices produce explicit canonical spell, original and standalone dependencies without changing helpers or source',()=>{
 for(const mode of ['c5m','c5se']){
  const source=creation.fromSource(core.starter(mode),mode,1).text;
  const legacy=creation.testPackage(source,mode,{...options,runtimeVersion:'2.13.0'}),latest=creation.testPackage(source,mode,{...options,runtimeVersion:'3.2.2'});
  for(const [v,p] of [['2.13.0',legacy],['3.2.2',latest]]){assert.equal(p.manifest.runtimeVersion,v);assert.match(p.files[0].text,new RegExp('Requires CoE5SE '+v.replaceAll('.','\\.')));assert.ok(p.manifest.dependencies.every(x=>x.includes(v)));assert.ok(p.files.find(f=>f.name==='README.txt').text.includes('5.43 / '+v+' pair'));assert.equal(p.manifest.gameTested,false);}
  assert.equal(legacy.files.find(f=>f.name.endsWith('.lua')).text,latest.files.find(f=>f.name.endsWith('.lua')).text);
 }
 for(const v of ['2.13.0','3.2.2']){
  const p=original.testPackage({type:'spell',id:445,name:'Fireball',sourceKind:'installed'},{...options,runtimeVersion:v});assert.equal(p.manifest.runtimeVersion,v);assert.match(p.files[0].text,new RegExp('CoE5SE '+v.replaceAll('.','\\.')));assert.equal(p.manifest.editable,false);
  for(const compare of [false,true]){const source=creation.weaponDefinition(native).text,p=melee.testPackage(source,'c5m','WB_Range','12',compare,melee.defaultTarget,'3',null,v);assert.equal(p.source,source);assert.equal(p.manifest.runtimeVersion,v);assert.equal(p.manifest.dependencies[1],'CoE5SE '+v);assert.match(p.files[0].text,new RegExp('CoE5SE '+v.replaceAll('.','\\.')));}
 }
});
test('unknown runtimes and latest-runtime mixed rosters refuse without substituting a type',()=>{
 assert.throws(()=>creation.runtimeVersion({runtimeVersion:'3.2.1'}),/official/);
 const source=creation.weaponDefinition(native).text,roster=[{id:13,name:'Spearman',count:2},{id:14,name:'Levy',count:2}];
 assert.throws(()=>melee.testPackage(source,'c5m','WB_Mixed','12',true,melee.defaultTarget,'1',roster,'3.2.2'),/separately validated helper/);
 const old=melee.testPackage(source,'c5m','WB_Mixed','12',true,melee.defaultTarget,'1',roster,'2.13.0');assert.deepEqual(old.manifest.roster,roster);assert.match(old.manifest.dependencies[1],/roster-v1/);
});
function host(version,prepare){return {getLibrary:async()=>null,getTestRuntime:async()=>({compatible:true,version,mixedSupported:version==='2.13.0',label:'CoE5SE '+version,detail:'Offline fixture; gameplay pending'}),getTestSession:async()=>null,prepareTestSession:prepare,exportCopy:async()=>null};}

test('a clean download keeps official 2.13 single-type tests available without promising a bundled private roster',async()=>{
 const runtime={compatible:true,version:'2.13.0',mixedSupported:false,mixedReason:'Private roster component is not distributed.',label:'CoE5SE 2.13.0',detail:'Official runtime verified'};
 const h=harness({example:false,desktop:{...host('2.13.0',async()=>{}),getTestRuntime:async()=>runtime}});await h.ready;
 h.$('target').value='vanilla';await h.$('target').emit('change');await h.$('exampleButton').click();await h.$('prepareTest').click();await tick();
 assert.equal(h.$('addMixedTarget').disabled,true);assert.match(h.$('mixedRosterHelp').textContent,/not distributed/);assert.equal(h.$('prepareGameTest').disabled,false);
});
test('desktop preparation uses configured 3.2.2 and prominently retains the pending-game evidence label',async()=>{
 let packet;const h=harness({example:false,desktop:host('3.2.2',async p=>(packet=p,{id:'a'.repeat(32),revision:'b'.repeat(64),status:'prepared',spell:'test'}))});await h.ready;await h.$('exampleButton').click();await tick();await h.$('prepareTest').click();await tick();
 assert.equal(h.$('addMixedTarget').disabled,true);assert.match(h.$('mixedRosterHelp').textContent,/incompatible/);assert.match(h.$('testNextDetail').textContent,/acceptance is pending/);
 await h.$('prepareGameTest').click();assert.equal(packet.manifest.runtimeVersion,'3.2.2');assert.equal(h.$('startTestSession').disabled,false);assert.match(h.$('testNextDetail').textContent,/pending/);
});
test('existing 2.13 mixed selection remains intact but cannot be prepared after choosing 3.2.2',async()=>{
 let runtime={compatible:true,version:'2.13.0',mixedSupported:true,label:'2.13.0',detail:'fixture'},calls=0;
 const h=harness({example:false,desktop:{...host('2.13.0',async()=>{calls++;}),getTestRuntime:async()=>runtime,chooseTestRuntime:async()=>runtime}});await h.ready;
 h.$('target').value='vanilla';await h.$('target').emit('change');await h.$('exampleButton').click();await h.$('prepareTest').click();await tick();
 h.window.CoeFindStandaloneTarget=callback=>callback({id:609,name:'Deer',fields:{}});await h.$('addMixedTarget').click();assert.equal(h.window.CoeMixedTargetCount(),2);
 runtime={...runtime,version:'3.2.2',mixedSupported:false};await h.$('chooseTestRuntime').click();assert.equal(h.window.CoeMixedTargetCount(),2);assert.equal(h.$('prepareGameTest').disabled,true);assert.match(h.$('testNextHeading').textContent,/2.13.0/);assert.match(h.$('mixedRosterHelp').textContent,/not compatible|incompatible/);assert.equal(calls,0);
});
test('Vanilla Library entry and empty-state captions identify both compatible choices and the preview boundary',async()=>{
 const model=require('../vanilla-library.js').model({type:'spell',id:445,name:'Fireball',sourceKind:'installed',fields:{}},[]);
 assert.match(model.test,/3\.2\.2 preview \/ 2\.13\.0/);assert.match(model.test,/AI may not use/);
 const h=harness({example:false,desktop:host('3.2.2',async()=>{})});await h.ready;await h.$('browseVanilla').click();assert.match(h.$('vanillaScope').textContent,/compatible CoE5SE \(3\.2\.2 preview \/ 2\.13\.0\)/);
});
