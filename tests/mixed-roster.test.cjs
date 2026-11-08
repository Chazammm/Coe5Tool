const {test}=require('node:test'),assert=require('node:assert/strict');
const m=require('../melee'),c=require('../creation'),{harness}=require('./harness.cjs');
const rows=[{id:609,name:'Deer',count:2},{id:487,name:'Winter Wolf',count:1}];
const stats={weaponName:'Mixed Trial',range:'5',init:'5',dmgtype:'5',dmg:'0',aoe:'5',flymode:'1',flylook:'7',look:'68'};
test('mixed fixed fixtures preserve the source and private row while declaring their local dependency',()=>{
 for(const range of ['1','5']){
  const s=c.weaponDefinition({...stats,range,...(range==='1'?{flymode:'',flylook:'',look:''}:{})}).text;
  const single=m.testPackage(s,'c5m','WB_Mixed','8',false,rows[0],'2');
  const p=m.testPackage(s,'c5m','WB_Mixed','8',false,rows[0],'2',rows);
  assert.equal(p.source,s);assert.equal(p.files[0].text,single.files[0].text);assert.deepEqual(p.manifest.roster,rows);
  assert.equal(p.manifest.kind,'private-mixed-v1');assert.match(p.manifest.dependencies[1],/local/);
  assert.match(p.files[1].text,/withTestFieldRoster/);assert.doesNotMatch(p.files[1].text,/spawnUnit|fireTestField|coe5\.set\(/);
  assert.match(p.files[1].text,/monster=609,name="Deer",count=2/);assert.match(p.files[1].text,/monster=487,name="Winter Wolf",count=1/);
 }
 assert.equal(m.testPackage(c.weaponDefinition(stats).text,'c5m','WB_Mixed','8',true,rows[0],'2',rows).manifest.kind,'private-mixed-compare-v1');
 for(const bad of [[rows[0]],rows.map(r=>({...r,count:200})),[rows[0],rows[0]],rows.map(r=>({...r,count:0})),rows.map(r=>({...r,count:1.5}))])
  assert.throws(()=>m.validRoster(bad));
});
test('search, counts, removal and preparation preserve the single-type fallback and source',async()=>{
 const fingerprint='489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55';
 const h=harness({example:false,desktop:{getStandaloneTargets:async()=>({fingerprint,entries:rows.map(r=>({...r,hp:6}))})}}),$=h.$;await h.ready;
 $('target').value='vanilla';await $('target').emit('change');await $('newDefinition').emit('click');
 $('create-weaponName').value='Mixed Trial';await $('creationForm').emit('submit');await $('prepareTest').emit('click');
 await $('findStandaloneTarget').emit('click');$('choiceQuery').value='dee';await $('choiceQuery').emit('input');await $('useChoice').emit('click');
 $('standaloneCount').value='2';await $('testForm').emit('submit');const baseline=h.window.CoePreparedTest();
 await $('addMixedTarget').emit('click');$('choiceQuery').value='#487';await $('choiceQuery').emit('input');await $('useChoice').emit('click');
 assert.equal($('singleTargetChoice').hidden,true);assert.equal($('rangedCompare').disabled,false);assert.throws(()=>h.window.CoePreparedTest());
 await $('testForm').emit('submit');assert.equal(h.window.CoePreparedTest().source,baseline.source);assert.deepEqual(JSON.parse(JSON.stringify(h.window.CoePreparedTest().manifest.roster)),rows);
 const second=$('mixedRosterRows').children[1];second.children[1].value='3';await second.children[1].emit('input');assert.throws(()=>h.window.CoePreparedTest());
 await $('testForm').emit('submit');assert.equal(h.window.CoePreparedTest().manifest.roster[1].count,3);
 await second.children[3].emit('click');assert.equal($('singleTargetChoice').hidden,false);assert.equal($('standaloneCount').value,'2');
 await $('testForm').emit('submit');assert.equal(h.window.CoePreparedTest().manifest.kind,'private-melee-v1');assert.equal(h.window.CoePreparedTest().manifest.target.count,2);
});
