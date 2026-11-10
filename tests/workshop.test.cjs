'use strict';
// Application event integration in the existing DOM adapter; not a rendered UI test.
const {test}=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs');
const creation=require('../creation.js');
const spec={spellName:'Workshop Spark',weaponName:'Workshop Effect',path:'3',level:'1',weaponDamage:'8',dmg:'0',dmgtype:'4',range:'6',init:'1',aoe:'0',look:'7',flymode:'2',flylook:'7'};
const tick=()=>new Promise(r=>setImmediate(r));

test('start actions respect the selected target without changing it or writing source',async()=>{
 const h=harness({example:false});await h.ready;
 h.$('target').value='vanilla';await h.$('target').emit('change');
 await h.$('startWeapon').emit('click');assert.equal(h.window.CoeWorkbenchSession.target(),'vanilla');assert.equal(h.$('creationHeading').textContent,'New native weapon');assert.equal(h.$('create-spellName').disabled,true);assert.equal(h.$('creationDialog').open,true);
 await h.$('closeCreation').emit('click');await h.$('startSpell').emit('click');assert.equal(h.$('creationDialog').open,false);assert.equal(h.window.CoeWorkbenchSession.target(),'vanilla');
 h.$('target').value='coe5se';await h.$('target').emit('change');
 await h.$('startSpell').emit('click');assert.equal(h.window.CoeWorkbenchSession.target(),'coe5se');assert.equal(h.$('create-spellName').disabled,false);assert.equal(h.document.activeElement,h.$('create-spellName'));
 assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,'');assert.equal(h.downloads.length,0);
});
test('empty desk switches its heading, creation action and workflow with the target in both directions',async()=>{
 const h=harness({example:false});await h.ready;const mode=h.$('mode').value;
 for(const target of ['vanilla','coe5se','vanilla']){
  h.$('target').value=target;await h.$('target').emit('change');const native=target==='vanilla';
  assert.equal(h.$('startSpellOption').hidden,native);assert.equal(h.$('startSpell').disabled,native);assert.equal(h.$('startWeaponOption').hidden,!native);assert.equal(h.$('startWeapon').disabled,!native);assert.equal(h.$('librarySpellNote').hidden,native);
  assert.equal(h.$('startHeading').textContent,native?'Find it. Shape it. See it in game.':'Find it. Shape it. See it in game.');assert.equal(h.$('selectedDescription').textContent,native?'Native weapon source editor':'Spell & weapon source editor');
  assert.equal(h.$('typeBadge').textContent,native?'VANILLA / NATIVE WEAPONS':'COE5SE / SPELLS & WEAPONS');assert.equal(h.$('startSecondStep').textContent,native?'02 / Review':'02 / Test');assert.equal(h.$('startThirdStep').textContent,native?'03 / Export':'03 / Bring back');
  assert.match(h.$('startSecondDetail').textContent,native?/preserved source/:/CoE5SE session/);assert.match(h.$('startThirdDetail').textContent,native?/\.c5m fragment/:/saved values/);
  assert.equal(h.$('mode').value,native?'c5m':'c5se');assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,'');assert.equal(h.window.CoeDesktopState(),false);assert.equal(h.downloads.length,0);
 }
});
test('target-aware view discloses retained spells and keeps pending detail fields',async()=>{
 const h=harness(),source=h.window.CoeWorkbenchSession.returnDraft().text,input=h.$('field-range');input.value='9';await input.emit('input');
 for(const target of ['vanilla','coe5se']){
  h.$('target').value=target;await h.$('target').emit('change');assert.equal(h.$('field-range'),input);assert.equal(input.value,'9');assert.equal(h.$('librarySpellNote').hidden,target==='vanilla');assert.equal(h.$('definitions').children.length,target==='vanilla'?1:2);if(target==='vanilla'){assert.match(h.$('retainedContentNote').textContent,/retained/);await h.$('inspectAllSource').emit('click');assert.equal(h.$('definitions').children.length,2);}assert.equal(h.$('emptyDesk').hidden,true);assert.match(h.$('typeBadge').textContent,/SOURCE \/ Weapon/);assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,source);
 }
});
test('the starting Open action uses the same native source-preserving open path',async()=>{
 const text='\uFEFF# retained\r\nnewweapon "Opened"\nrange 5',calls=[];
 const h=harness({example:false,desktop:{openSource:async()=>{calls.push('open');return {name:'Start.c5m',mode:'c5m',text};}}});
 await h.$('startOpen').emit('click');assert.deepEqual(calls,['open']);assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,text);assert.equal(h.$('fileLabel').textContent,'Start.c5m');assert.equal(h.$('emptyDesk').hidden,true);
});
test('linked navigation works both directions and protects pending edits',async()=>{
 const h=harness();const link=()=>h.$('linkedRecords').children.find(n=>n.tagName==='button');
 assert.match(h.$('linkedRecords').textContent,/Used by spell/);await link().emit('click');assert.match(h.$('linkedRecords').textContent,/Linked weapon/);assert.equal(h.$('selectedHeading').textContent,'Workbench Javelin');
 h.$('field-level').value='2';await h.$('field-level').emit('input');await link().emit('click');assert.equal(h.$('selectedHeading').textContent,'Workbench Javelin');assert.equal(h.$('field-level').value,'2');assert.match(h.$('status').textContent,/Apply or discard/);
 await h.$('discard').emit('click');await link().emit('click');assert.equal(h.$('selectedHeading').textContent,'Workbench Magic Javelin');
});
test('duplicate source links stay distinct and carry line-specific unresolved identity',async()=>{
 const h=harness({example:false});h.$('pasteText').value='newweapon "W"\ndmg 1\nnewweapon "W"\ndmg 2\nnewspell "S"\npath 3\nlevel 1\nweapon 8 "W"';await h.$('pasteForm').emit('submit');await h.$('definitions').children[2].emit('click');
 const links=h.$('linkedRecords').children.filter(n=>n.tagName==='button');assert.equal(links.length,2);assert.notEqual(links[0].title,links[1].title);assert.match(links[0].textContent,/line 1/);assert.match(links[1].textContent,/line 3/);assert.match(h.$('linkedRecords').textContent,/Multiple source matches/);await links[1].emit('click');assert.equal(h.$('field-dmg').value,'2');
});
test('optional field help expands independently without staging source edits',async()=>{
 const h=harness(),before=h.window.CoeWorkbenchSession.returnDraft().text;
 const field=h.$('fields').children[0].children.find(n=>n.className==='field-grid').children[0];
 const controls=field.children.find(n=>n.className==='field-controls'),about=controls.children.find(n=>n.className==='field-help');
 const help=h.$(about.getAttribute('aria-controls'));assert.equal(help.hidden,true);await about.emit('click');assert.equal(help.hidden,false);assert.equal(about.getAttribute('aria-expanded'),'true');await about.emit('click');assert.equal(help.hidden,true);assert.equal(h.$('apply').disabled,true);assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,before);
});
test('choice rows expose a name, explicit ID and provenance while retaining keyboard selection',async()=>{
 const h=harness();await h.ready;let picked;h.window.CoeOpenChoices({type:'path',returnTo:'field-range'},e=>picked=e);
 h.$('choiceQuery').value='hydroman';await h.$('choiceQuery').emit('input');const row=h.$('choiceResults').children[0];assert.equal(row.children[0].textContent,'Hydromancy');assert.match(row.children[1].textContent,/^#\d+$/);assert.match(row.children[2].textContent,/documented/);
 await h.$('choiceQuery').emit('keydown',{key:'ArrowDown'});assert.equal(h.document.activeElement,row);await row.emit('keydown',{key:'Enter'});assert.equal(picked.name,'Hydromancy');assert.equal(h.$('choiceDialog').open,false);assert.equal(h.document.activeElement,h.$('field-range'));
});
test('test bench next actions follow compatible preparation and preserve explicit start',async()=>{
 const source=creation.definition(spec,'c5se').text,calls=[];let session=null;
 const h=harness({example:false,desktop:{openSource:async()=>({name:'Pair.c5se',mode:'c5se',text:source}),getTestRuntime:async()=>({compatible:true,label:'Verified fixture',detail:'mock only'}),getTestSession:async()=>session,prepareTestSession:async()=>{calls.push('prepare');return session={id:'owned',revision:'r',spell:spec.spellName,status:'prepared',needsProfileSetup:true,weaponEditing:true};},startTestSession:async()=>{calls.push('start');return session={...session,status:'running'};},getTestSessions:async()=>[]}});
 await h.$('desktopOpen').emit('click');await h.$('prepareTest').emit('click');await tick();assert.equal(h.document.activeElement,h.$('testCaster'));assert.match(h.$('testNextHeading').textContent,/Choose participants/);
 await h.$('testForm').emit('submit');assert.match(h.$('testNextHeading').textContent,/Prepare the game test/);assert.equal(h.document.activeElement,h.$('prepareGameTest'));assert.deepEqual(calls,[]);
 await h.$('prepareSession').emit('click');assert.match(h.$('testNextHeading').textContent,/Set up the disposable profile/);assert.deepEqual(calls,['prepare']);await h.$('startTestSession').emit('click');assert.match(h.$('testNextHeading').textContent,/Finish the isolated test/);
 session={...session,status:'exited',needsProfileSetup:false};await h.$('refreshTestSession').emit('click');assert.match(h.$('testNextHeading').textContent,/Review saved test values/);assert.match(h.$('testNextDetail').textContent,/observations separately/);assert.deepEqual(calls,['prepare','start']);
 session={...session,needsProfileSetup:true};await h.$('refreshTestSession').emit('click');assert.match(h.$('testNextHeading').textContent,/Set up the disposable profile/);
 session={...session,needsProfileSetup:false,weaponEditing:false};await h.$('refreshTestSession').emit('click');assert.match(h.$('testNextHeading').textContent,/Record what you observed/);h.window.CoeFocusTestNext();assert.equal(h.$('testObservationSection').open,true);assert.equal(h.document.activeElement,h.$('testObservation'));assert.match(h.$('testNextDetail').textContent,/exit alone/);
});
test('incompatible and browser preparation show the correct next step without launch capabilities',async()=>{
 for(const desktop of [null,{getTestRuntime:async()=>({compatible:false,label:'Mismatch',detail:'wrong fingerprint'}),getTestSession:async()=>null}]){
  const h=harness({example:false,desktop});h.window.CoeWorkbenchSession.openGenerated(creation.definition(spec,'c5se'));await h.$('prepareTest').emit('click');await tick();await h.$('testForm').emit('submit');
  if(desktop){assert.match(h.$('testNextHeading').textContent,/compatible game and extender/);assert.equal(h.document.activeElement,h.$('chooseTestRuntime'));assert.equal(h.$('prepareSession').disabled,true);}
  else{assert.match(h.$('testNextHeading').textContent,/Review the generated files/);assert.equal(h.$('testFileReview').open,true);assert.equal(h.$('isolatedTestControls').hidden,true);}
 }
});
