'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs');
const spec={spellName:'Workbench Spark',weaponName:'Workbench Spark Effect',path:'3',level:'1',weaponDamage:'15',dmg:'0',dmgtype:'4',range:'6',init:'1',aoe:'0',look:'68',sound:'16',flymode:'6',flylook:'65',flysound:'104'};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(extra={}){
 const calls={prepare:[],start:[],invalidate:[],observations:[]};let state=null;
 const desktop={getLibrary:async()=>null,exportCopy:async()=>null,exportTestPackage:async()=>null,
  getTestRuntime:async()=>({compatible:true,label:'CoE5 5.43 / CoE5SE 2.13.0',detail:'verified fixture'}),chooseTestRuntime:async()=>null,
  getTestSession:async()=>state,
  prepareTestSession:async p=>{calls.prepare.push(p);return state={id:'abc',revision:'revision',spell:spec.spellName,modId:p.modId,status:'prepared',stale:false,needsProfileSetup:false,folder:'private-session'};},
  startTestSession:async(id,revision)=>{calls.start.push({id,revision});return state={...state,status:'running',pid:123};},
  invalidateTestSession:async id=>{calls.invalidate.push(id);},openTestLogs:async()=>true,
  saveTestObservation:async(id,outcome,note)=>{calls.observations.push({id,outcome,note});return state={...state,observation:outcome};},...extra};
 const h=harness({desktop,example:false});return {...h,calls,desktop,setState(value){state=value;}};
}
async function ready(h){
 await h.$('newDefinition').emit('click');for(const [key,value]of Object.entries(spec)){h.$('create-'+key).value=value;await h.$('create-'+key).emit('input');}
 h.$('create-mode').value='c5m';await h.$('creationForm').emit('submit');await h.$('prepareTest').emit('click');await tick();
 h.$('testModId').value='WB_Spark';await h.$('testModId').emit('input');await h.$('testForm').emit('submit');
}
test('new options cannot invalidate or restart a preparation inherited from an earlier application session',async()=>{
 const h=setup();h.setState({id:'retained',status:'prepared',modId:'WB_Prior',spell:'Older test',stale:false});
 await ready(h);await h.$('refreshTestSession').emit('click');
 h.$('testCount').value='4';await h.$('testCount').emit('input');
 assert.equal(h.$('startTestSession').disabled,true);
 assert.deepEqual(h.calls.invalidate,[]);assert.match(h.$('sessionSummary').textContent,/Previous session/);
});
test('mixed readback is hidden when a different session becomes current',async()=>{
 const h=setup({getMixedTestValues:async id=>({sessionId:id,areaCode:5,element:'cold',battleReturns:1,closed:true,restored:true,units:[{name:'Deer',monster:609,unit:2,beforeHp:6,afterHp:6,resistance:0}]})});
 await ready(h);
 h.setState({id:'mixed-old',spell:'weapon Trial',status:'exited',privateRanged:true,roster:[{id:609,name:'Deer',count:2},{id:487,name:'Winter Wolf',count:1}]});
 await h.$('refreshTestSession').emit('click');await h.$('readMixedValues').emit('click');
 assert.equal(h.$('mixedValues').hidden,false);assert.match(h.$('mixedValuesRows').textContent,/cold resistance 0%/);
 h.setState({id:'mixed-new',spell:'weapon Trial',status:'prepared',roster:[{id:609,name:'Deer',count:1},{id:487,name:'Winter Wolf',count:2}]});
 await h.$('refreshTestSession').emit('click');assert.equal(h.$('mixedValues').hidden,true);
});
test('preparation uses current applied source and never launches; start requires its own click',async()=>{
 const h=setup();await ready(h);assert.equal(h.calls.start.length,0);assert.equal(h.$('startTestSession').disabled,true);
 await h.$('prepareSession').emit('click');assert.equal(h.calls.prepare.length,1);assert.equal(h.calls.start.length,0);
 assert.equal(h.calls.prepare[0].source,h.window.CoeWorkbenchSession.testSource().text);assert.ok(h.calls.prepare[0].files.find(x=>x.name.endsWith('.c5m')).text.includes('weapon 15'));
 assert.equal(h.$('startTestSession').disabled,false);await h.$('startTestSession').emit('click');assert.equal(h.calls.start.length,1);assert.equal(h.$('startTestSession').disabled,true);assert.ok(h.$('sessionSummary').textContent.includes('running'));assert.ok(h.$('sessionSummary').textContent.includes('no in-game observation'));
});
test('pending source edits invalidate preparation immediately and applied edits regenerate with current values',async()=>{
 const h=setup();await ready(h);await h.$('prepareSession').emit('click');await h.$('closeTest').emit('click');
 h.$('field-range').value='9';await h.$('field-range').emit('input');assert.equal(h.$('startTestSession').disabled,true);assert.ok(h.calls.invalidate.length>0);
 await h.$('startTestSession').emit('click');assert.equal(h.calls.start.length,0);
 await h.$('editForm').emit('submit');await h.$('testForm').emit('submit');await h.$('prepareSession').emit('click');assert.ok(h.calls.prepare.at(-1).source.includes('range 9'));
});
test('changed test options and replacing source cannot launch the previous definition',async()=>{
 const h=setup();await ready(h);await h.$('prepareSession').emit('click');h.$('testCount').value='2';await h.$('testCount').emit('input');assert.equal(h.$('startTestSession').disabled,true);
 await h.$('testForm').emit('submit');await h.$('prepareSession').emit('click');await h.$('exampleButton').emit('click');await h.$('startTestSession').emit('click');assert.equal(h.calls.start.length,0);
});
test('incompatible runtime blocks preparation/start while cancellation retains valid selection',async()=>{
 const h=setup({getTestRuntime:async()=>({compatible:false,label:'Unsupported',detail:'hash mismatch'})});await ready(h);assert.equal(h.$('prepareSession').disabled,true);assert.equal(h.$('startTestSession').disabled,true);
 const good=setup();await ready(good);await good.$('prepareSession').emit('click');await good.$('chooseTestRuntime').emit('click');assert.ok(good.$('sessionStatus').textContent.includes('cancelled'));assert.equal(good.$('startTestSession').disabled,false);
});
test('a failed launch reports the native error and does not claim running/observed success',async()=>{
 const h=setup({startTestSession:async()=>{throw new Error('Another CoE5 session is running');}});await ready(h);await h.$('prepareSession').emit('click');await h.$('startTestSession').emit('click');assert.ok(h.$('sessionStatus').textContent.includes('Another CoE5'));assert.ok(h.$('sessionSummary').textContent.includes('prepared'));assert.equal(h.$('saveTestObservation').disabled,true);
});
test('stale asynchronous preparation is never enabled for launch',async()=>{
 let finish;const h=setup({prepareTestSession:()=>new Promise(resolve=>{finish=resolve;})});await ready(h);const pending=h.$('prepareSession').emit('click');
 h.$('testCount').value='2';await h.$('testCount').emit('input');finish({id:'old',revision:'old',spell:'Old spell',status:'prepared'});await pending;
 assert.equal(h.$('startTestSession').disabled,true);assert.ok(h.calls.invalidate.includes('old'));assert.ok(h.$('sessionStatus').textContent.includes('changed during preparation'));
});
test('first profile setup is explicit; an exited process remains separate from user observation',async()=>{
 const h=setup();await ready(h);await h.$('prepareSession').emit('click');h.setState({id:'abc',revision:'revision',spell:spec.spellName,modId:'WB_Spark',status:'exited',needsProfileSetup:true});await h.$('refreshTestSession').emit('click');
 assert.equal(h.$('startTestSession').textContent,'Start profile setup');assert.ok(h.$('testInstructions').textContent.includes('Quit'));assert.ok(h.$('sessionSummary').textContent.includes('no in-game observation'));
 h.$('testObservation').value='expected';await h.$('testObservation').emit('input');h.$('testObservationNote').value='One visible projectile';await h.$('testObservationNote').emit('input');await h.$('saveTestObservation').emit('click');assert.equal(h.calls.observations.length,1);assert.ok(h.$('sessionStatus').textContent.includes('not an automated gameplay verdict'));
});
test('browser fallback has no native isolated launch controls',()=>{const h=harness({example:false});assert.equal(h.$('isolatedTestControls').hidden,true);});
test('a reopened canonical fragment is testable without changing its source or unsaved state',async()=>{
 const creation=require('../creation.js'),source=creation.definition(spec,'c5m').text;
 const h=setup({openSource:async()=>({text:source,name:'saved-pair.c5m',mode:'c5m'})});await h.$('desktopOpen').emit('click');
 assert.equal(h.$('prepareTest').disabled,false);assert.equal(h.window.CoeDesktopState(),false);assert.equal(h.window.CoeWorkbenchSession.testSource().text,source);
});
test('declining replacement preserves an unsaved observation without another preparation',async()=>{
 const h=setup();await ready(h);await h.$('prepareSession').emit('click');h.setState({id:'abc',revision:'revision',spell:spec.spellName,modId:'WB_Spark',status:'exited'});await h.$('refreshTestSession').emit('click');
 h.$('testObservationNote').value='Keep this note';await h.$('testObservationNote').emit('input');h.window.confirm=()=>false;
 await h.$('prepareSession').emit('click');assert.equal(h.calls.prepare.length,1);assert.equal(h.$('testObservationNote').value,'Keep this note');assert.equal(h.window.CoeTestObservationDirty(),true);
});

test('original selection identifies a retained unrelated session and scopes its notes explicitly',async()=>{
 const h=setup();h.setState({id:'retained',spell:'Codex VFX Trial',status:'exited',weaponEditing:true,instruction:'Cast once retained-instruction',folder:'retained-session'});
 h.window.CoeOpenOriginalTest({type:'weapon',id:4,name:'Spear',sourceKind:'installed'});await tick();
 assert.match(h.$('testIntro').textContent,/Observe a native record/);
 assert.match(h.$('sessionSummary').textContent,/^Previous session · Codex VFX Trial/);
 assert.doesNotMatch(h.$('testInstructions').textContent,/Cast once/);
 assert.match(h.$('sessionStatus').textContent,/not a test of the current selection/);
 assert.equal(h.$('reviewSessionValues').textContent,'Review previous saved values');
 assert.equal(h.$('testObservationHeading').textContent,'Record observation for Codex VFX Trial');
 assert.match(h.$('testObservationHelp').textContent,/previous session, not the selection above/);
 assert.equal(h.$('startTestSession').disabled,true);assert.equal(h.calls.prepare.length,0);assert.equal(h.calls.observations.length,0);
 // Retained observations remain accessible, without reassigning them to Spear.
 h.$('testObservation').value='unclear';h.$('testObservationNote').value='Previous session only';await h.$('saveTestObservation').emit('click');
 assert.deepEqual(h.calls.observations[0],{id:'retained',outcome:'unclear',note:'Previous session only'});
});

test('original AI journey separates record use from visual outcome and clears previous-session wording',async()=>{
 const h=setup();h.window.CoeOpenOriginalTest({type:'weapon',id:4,name:'Spear',sourceKind:'installed'});await tick();
 assert.doesNotMatch(h.$('testInstructions').textContent,/Cast once/);
 await h.$('testForm').emit('submit');assert.doesNotMatch(h.$('testStatus').textContent,/No game has started/);
 await h.$('prepareSession').emit('click');
 h.setState({id:'abc',revision:'revision',spell:'weapon #4 Spear',status:'exited',originalRecord:true,instruction:'Battle (AI) → Close → Quit',observation:'unclear'});
 await h.$('refreshTestSession').emit('click');
 assert.doesNotMatch(h.$('sessionSummary').textContent,/Previous session/);
 assert.match(h.$('sessionSummary').textContent,/reported visual outcome: unclear/);
 assert.equal(h.$('testObservationLabel').textContent,'Visual outcome');
 assert.match(h.$('testNextDetail').textContent,/spell\/weapon use and visible effects separately/);
 assert.match(h.$('sessionStatus').textContent,/selected spell or weapon was used/);
 assert.match(h.$('testInstructions').textContent,/Battle \(AI\)/);
 h.$('testObservationNote').value='One native attack; VFX not observed';await h.$('testObservationNote').emit('input');
 h.$('testCount').value='2';await h.$('testCount').emit('input');
 assert.match(h.$('sessionSummary').textContent,/^Previous session/);
 assert.equal(h.$('testObservationNote').value,'One native attack; VFX not observed');
 assert.equal(h.window.CoeTestObservationDirty(),true);
});
