const {test}=require('node:test'),assert=require('node:assert/strict'),choices=require('../choices.js'),original=require('../original-records.js'),{harness}=require('./harness.cjs');
function packet(){return {schema:'wb-installed-543',gameSha256:'489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55',completeNames:true,completeDefinitions:false,spellSlots:1029,weaponSlots:1200,entries:[...Array.from({length:1029},(_,id)=>({type:'spell',id,name:id===226||id===366?'Banish':'Synthetic spell '+id,fields:{path:'3',weapon:'139',weaponDamage:'0'}})),...Array.from({length:936},(_,id)=>({type:'weapon',id,name:'Synthetic weapon '+id,fields:{dmgtype:'3',look:'7'}}))]};}
const options={modId:'WB_Observe',enemy:'Spearman',enemyId:'13',count:'1'},entry={type:'spell',id:226,name:'Banish',sourceKind:'installed'};
test('installed metadata keeps all native names, duplicate IDs, partial fields and distinct provenance',()=>{
 const rows=choices.installed(packet());assert.equal(rows.length,1965);const found=choices.search(rows,'banis','spell','installed');assert.deepEqual(found.map(e=>e.id),[226,366]);assert.equal(choices.search(rows,'#366','spell')[0].id,366);assert.equal(choices.search(rows,'banis','spell','historical').length,0);assert.equal(choices.search(rows,'no such record').length,0);assert.match(rows[0].detail,/not complete/);
 for(const change of [p=>p.entries.pop(),p=>p.gameSha256='old',p=>p.completeDefinitions=true,p=>p.entries[0].fields.look='NaN',p=>p.entries[0].id=1030,p=>p.entries[0]=p.entries[1]]){const p=packet();change(p);assert.throws(()=>choices.installed(p));}
});
test('original packages contain no definitions, shared setters, stand-in or forced fire; manual type originals need no invented payload',()=>{
 const p=original.testPackage(entry,options),lua=p.files.find(f=>f.name.endsWith('.lua')).text;
 assert.equal(p.manifest.editable,false);assert.equal(p.manifest.execution,'native-ai-battle');assert.equal(p.manifest.gameTested,false);assert.equal(p.manifest.test.caster,'Selected in game');
 assert.equal(p.files.length,4);assert.ok(!p.files.some(f=>f.name.endsWith('.c5se')));assert.ok(!p.files[0].text.includes('newweapon'));assert.ok(!p.files[0].text.includes('newspell'));
 assert.ok(!/coe5\.(fireTestField|testBattle)\s*\(/.test(lua));assert.ok(!/coe5\.set\("(weapon|spell)"/.test(lua));assert.match(lua,/openTestField\(actor.id,spell,enemy,count\)/);assert.match(lua,/fightTestField/);assert.match(lua,/selected native ID\/name/i);
 assert.match(p.files.at(-1).text,/NOT Cast once/);assert.match(p.files.at(-1).text,/not validate custom manual payloads/);
});
test('unknown, draft and mod-added identities are refused; historical name-only resolves in game without fallback for an explicit ID',()=>{
 for(const e of [{...entry,sourceKind:'unknown'},{...entry,sourceKind:'draft'},{...entry,id:1029},{...entry,id:undefined},{...entry,name:'bad\nname'},{...entry,type:'effect'}])assert.throws(()=>original.testPackage(e,options));
 const p=original.testPackage({...entry,id:null,sourceKind:'historical'},options);assert.equal(p.manifest.record.id,null);assert.match(p.files[1].text,/missing or duplicated/);
 const weapon=original.testPackage({type:'weapon',id:4,name:'Spear',sourceKind:'runtime'},options);assert.equal(weapon.manifest.record.type,'weapon');assert.match(weapon.files[1].text,/Later\/special attack rows need a separate fixture/);
});
test('finding installed originals prepares independently of a dirty draft and never launches or changes target/source',async()=>{
 let starts=0,prepared=null;const h=harness({desktop:{loadInstalledChoices:async()=>packet(),getTestSessions:async()=>[],getTestRuntime:async()=>({compatible:true,label:'Verified',detail:'fixture'}),getTestSession:async()=>null,prepareTestSession:async p=>{prepared=p;return {id:'a'.repeat(32),revision:'b'.repeat(64),status:'prepared',spell:'Banish',originalRecord:true};},startTestSession:async()=>{starts++;}}});await h.ready;
 h.$('field-range').value='9';await h.$('field-range').emit('input');const before=h.window.CoeWorkbenchSession.returnDraft();const target=h.window.CoeWorkbenchSession.target();
 h.window.CoeOpenChoices({type:'spell',query:'banis'});await h.$('loadInstalledChoices').emit('click');assert.equal(h.$('observeOriginal').hidden,false);assert.match(h.$('choiceDetail').textContent,/installed/);assert.ok(h.$('choiceFields').children.length>0);
 await h.$('observeOriginal').emit('click');assert.equal(h.$('choiceDialog').open,false);assert.equal(h.$('testDialog').open,true);assert.equal(h.$('testCasterGroup').hidden,true);assert.equal(h.$('testEditingGroup').hidden,true);assert.match(h.$('originalTestScope').textContent,/No private clone/);
 await h.$('testForm').emit('submit');assert.equal(h.$('exportTest').disabled,false);const p=h.window.CoePreparedTest();assert.equal(p.manifest.kind,'original-record-observation');assert.equal(starts,0);
 await new Promise(resolve=>setImmediate(resolve));await h.$('prepareSession').emit('click');assert.ok(prepared,h.$('sessionStatus').textContent);assert.equal(starts,0);assert.equal(h.window.CoeWorkbenchSession.target(),target);assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,before.text);assert.equal(h.$('field-range').value,'9');
 await h.$('closeTest').emit('click');assert.equal(h.$('field-range').value,'9');
});
test('cancelled/unavailable installed catalog preserves choices and gives a useful empty state',async()=>{
 const h=harness({example:false,desktop:{loadInstalledChoices:async()=>null,getTestSessions:async()=>[]}});await h.ready;h.window.CoeOpenChoices({type:'spell',query:'missing spell'});await h.$('loadInstalledChoices').emit('click');assert.match(h.$('choiceStatus').textContent,/cancelled/);assert.match(h.$('choiceResults').textContent,/No matches/);assert.equal(h.$('observeOriginal').hidden,true);
});
test('returning from original observation restores the generated-pair preparation controls and canonical source',async()=>{
 const creation=require('../creation.js'),spec={spellName:'Test Spark',weaponName:'Test Effect',path:'3',level:'1',weaponDamage:'8',dmg:'0',dmgtype:'4',range:'6',init:'1',aoe:'0',look:'7',sound:'',flymode:'2',flylook:'7',flysound:''};
 const h=harness({example:false});await h.ready;h.window.CoeWorkbenchSession.openGenerated(creation.definition(spec,'c5se'));
 const before=h.window.CoeWorkbenchSession.returnDraft().text;h.window.CoeOpenOriginalTest(entry);await h.$('testForm').emit('submit');assert.equal(h.window.CoePreparedTest().manifest.kind,'original-record-observation');await h.$('closeTest').emit('click');
 await h.$('prepareTest').emit('click');assert.equal(h.$('testCasterGroup').hidden,false);assert.equal(h.$('testEditingGroup').hidden,false);assert.equal(h.$('originalTestScope').hidden,true);
 await h.$('testForm').emit('submit');assert.equal(h.window.CoePreparedTest().manifest.kind,'experimental-test-mod');assert.equal(h.window.CoePreparedTest().source,before);assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,before);
});
test('test explanation follows spell/weapon observation and switches back to the generated-pair attack contract',async()=>{
 const creation=require('../creation.js'),spec={spellName:'Explanation Spark',weaponName:'Explanation Effect',path:'3',level:'1',weaponDamage:'8',dmg:'0',dmgtype:'4',range:'6',init:'1',aoe:'0',look:'7',sound:'',flymode:'2',flylook:'7',flysound:''};
 const h=harness({example:false});await h.ready;h.window.CoeWorkbenchSession.openGenerated(creation.definition(spec,'c5se'));
 for(const e of [entry,{type:'weapon',id:4,name:'Spear',sourceKind:'installed'}]){
  h.window.CoeOpenOriginalTest(e);const explanation=h.$('testModeExplanation').textContent;
  assert.match(explanation,/Original record: Battle \(AI\)/);assert.match(explanation,/No attack is forced, no range is extended and no weapon is substituted/);assert.match(explanation,/zero or several times/);assert.match(explanation,/startup alone does not prove use or a visible effect/);assert.ok(!explanation.includes('Cast once forces'));
  await h.$('testForm').emit('submit');assert.match(h.window.CoePreparedTest().files[1].text,/pcall\(coe5.fightTestField\)/);await h.$('closeTest').emit('click');
 }
 await h.$('prepareTest').emit('click');assert.match(h.$('testModeExplanation').textContent,/Generated pair: Cast once forces an item-style attack/);assert.match(h.$('testModeExplanation').textContent,/temporarily extends some weapon ranges/);
 await h.$('testForm').emit('submit');assert.equal(h.window.CoePreparedTest().manifest.kind,'experimental-test-mod');
});
