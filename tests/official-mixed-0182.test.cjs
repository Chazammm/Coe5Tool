const {test}=require('node:test'),assert=require('node:assert/strict');
const {candidate,reading,roster,spec}=require('./official-mixed-fixture.cjs'),melee=require('../melee'),creation=require('../creation'),results=require('../battle-results'),{harness}=require('./harness.cjs');
const tick=()=>new Promise(r=>setImmediate(r));

test('native target picker distinguishes the official mixed route from the older private component',async()=>{
 const h=harness({example:false,desktop:{getStandaloneTargets:async()=>({fingerprint:'489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55',entries:[{id:609,name:'Deer',hp:6}]})}});await h.ready;
 await h.window.CoeFindStandaloneTarget(()=>{});
 assert.match(h.$('rangedChoiceHelp').textContent,/official 3\.2\.2 group field.*private 2\.13\.0 roster/);
 assert.doesNotMatch(h.$('rangedChoiceHelp').textContent,/Mixed types require/);
});
test('official fixed mixed melee/ranged packets preserve source, declare the official runtime and never use a private overlay',()=>{
 for(const extra of [{},{range:'1',flymode:'',flylook:'',look:''}]){
  const p=candidate({spec:extra});assert.equal(p.manifest.kind,'private-official-mixed-v1');assert.equal(p.manifest.groupApi,'official-group-1');assert.deepEqual(p.manifest.roster,roster);
  assert.deepEqual(p.manifest.dependencies,['CoE5 5.43 Windows','CoE5SE 3.2.2']);assert.equal(p.source,creation.weaponDefinition({...spec,...extra}).text);
  assert.match(p.files[1].text,/openTestField\{commander=carrier/);assert.doesNotMatch(p.files[1].text,/withTestFieldRoster|testFieldRosterStatus|restored=1|coe5\.set\("weapon"|newUnit|spawnUnit/);
  assert.match(p.files[1].text,/wb-official-mixed-1/);assert.match(p.files[1].text,/unitBattleX/);assert.match(p.files[3].text,/one fixed AI battle/);
 }
});
test('limits, distinct official comparison and legacy runtime dependencies remain explicit',()=>{
 assert.equal(candidate({compare:true}).manifest.kind,'private-official-mixed-compare-v1');
 for(const rows of [roster.map(r=>({...r,count:101})),[roster[0],roster[0]],[{...roster[0],count:0},roster[1]]])assert.throws(()=>candidate({roster:rows}));
 const max=candidate({roster:[{...roster[0],count:100},{...roster[1],count:100}]});assert.equal(max.manifest.roster.reduce((n,r)=>n+r.count,0),200);
 assert.equal(candidate({runtime:'2.13.0'}).manifest.kind,'private-mixed-v1');assert.match(candidate({runtime:'2.13.0'}).manifest.dependencies[1],/roster-v1/);
 assert.equal(melee.testPackage(creation.weaponDefinition(spec).text,'c5m','WB_One','12',true,roster[0],'2',null,'3.2.2').manifest.kind,'private-ranged-compare-v2');
});
test('official readings expose setup/end positions and net HP without hits, attack positions or rollback',()=>{
 const raw=reading(),m=results.model(raw);assert.equal(m.restored,null);assert.equal(m.official,true);assert.deepEqual(m.units[0].setupPosition,{x:18,y:9});
 assert.deepEqual(m.units[0].endPosition,{x:16,y:9});assert.equal(m.units[1].endPosition,null);assert.equal(m.units[0].delta,-3);
 for(const u of m.units){assert.equal(u.hit,null);assert.equal(u.attackPosition,null);assert.equal(u.weaponDamage,null);}
 for(const mutate of [r=>r.restored=true,r=>r.closed=false,r=>r.units[0].endPosition={x:1,y:20},r=>r.units[1].unit=2,r=>r.units.pop()]){const r=reading();mutate(r);assert.throws(()=>results.model(r));}
});
test('failure, partial verification and cancellation do not acquire a successful battle or closure claim',()=>{
 const r=reading();Object.assign(r,{units:[],battleReturns:0,status:'error',returned:-1,closed:false,mainMenuAfterClose:false,message:'Open refused',phase:'setup'});
 const m=results.model(r);assert.equal(m.units.length,0);assert.equal(m.closed,false);
 Object.assign(r,{units:reading().units.slice(0,1),returned:3});assert.equal(results.model(r).units.length,1);
 const cancelled=reading();Object.assign(cancelled,{status:'cancelled',battleReturns:0,phase:'before-close'});assert.equal(results.model(cancelled).battleReturns,0);
});
test('rendered data view says close-returned and shows separately labelled setup/end cells',async()=>{
 const h=harness({example:false});await h.ready;results.render(h.$('groupBattleResults'),reading(),h.document,'official');
 assert.match(h.$('officialState').textContent,/Close call returned.*Record rollback not established/);assert.match(h.$('officialRows').textContent,/\(18, 9\).*\(16, 9\)/);
 assert.match(h.$('officialUnknown').textContent,/Attack-time positions.*not recorded/);assert.equal(h.$('officialRows').children.length,3);
});
test('adding types preserves comparison selection; fixed mode remains an explicit choice and count typing retains focus',async()=>{
 const runtime={compatible:true,version:'3.2.2',mixedSupported:true,label:'Official 3.2.2',detail:'Mixed acceptance is pending'};
 let packet;const h=harness({example:false,desktop:{getTestRuntime:async()=>runtime,getTestSession:async()=>null,prepareTestSession:async p=>(packet=p,{id:'b'.repeat(32),status:'prepared',runtimeVersion:'3.2.2'})}});await h.ready;
 h.window.CoeWorkbenchSession.openGenerated(creation.weaponDefinition(spec));await h.$('prepareTest').click();await tick();
 h.$('rangedCompare').checked=true;await h.$('rangedCompare').emit('change');
 h.window.CoeFindStandaloneTarget=cb=>cb(roster[0]);await h.$('addMixedTarget').click();
 assert.equal(h.$('rangedCompare').checked,true);assert.equal(h.$('prepareGameTest').disabled,false);assert.match(h.$('mixedRosterHelp').textContent,/Fresh groups/);
 h.$('rangedCompare').checked=false;await h.$('rangedCompare').emit('change');assert.equal(h.$('prepareGameTest').disabled,false);
 const field=h.$('mixedRosterRows').children[1].children[1];field.focus();field.value='12';await field.emit('input');await tick();
 assert.equal(h.document.activeElement,field);assert.equal(h.$('mixedRosterRows').children[1].children[1],field);
 await h.$('prepareGameTest').click();assert.equal(packet.manifest.kind,'private-official-mixed-v1');assert.equal(packet.manifest.roster[1].count,12);
});
test('prepared-session mixed readback is read-only, bound to selection and cleared after a read failure',async()=>{
 let bad=false;const row={id:'a'.repeat(32),name:'Official Group Needle',source:'example.c5m',mode:'Ranged · official groups · fixed',runtime:'CoE5SE 3.2.2',state:'used',reason:'Already used',mixed:true,mixedObservation:true};
 const h=harness({example:false,desktop:{getTestSession:async()=>null,getPreparedSessions:async()=>[row],getMixedTestValues:async()=>{if(bad)throw Error('Binding differs');return reading();}}});await h.ready;
 await h.$('preparedTests').click();await h.$('preparedRows').children[0].click();await tick();assert.equal(h.$('preparedBattleRows').children.length,3);assert.equal(h.$('preparedMixedResults').hidden,false);
 assert.match(h.$('preparedContext').textContent,/official groups · fixed.*3\.2\.2/);assert.doesNotMatch(h.$('preparedContext').textContent,/roster-v1/);
 assert.equal(h.$('reviewPrepared').hidden,true);assert.match(h.$('preparedObservationStatus').textContent,/no draft values/);
 bad=true;await h.$('refreshPrepared').click();await tick();assert.equal(h.$('preparedMixedResults').children.length,0);assert.match(h.$('preparedObservationStatus').textContent,/Binding differs/);
});
