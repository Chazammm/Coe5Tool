'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const creation=require('../creation'),core=require('../core'),ret=require('../return-values'),damage=require('../damage-types'),{harness}=require('./harness.cjs');
const example=fs.readFileSync(path.join(__dirname,'../examples/selected-spell-workshop.c5m'),'utf8');
const source=(mode='c5m')=>'\uFEFF'+(mode==='c5se'?example.replace(/#!@/g,''):example).replace(/\r?\n/g,'\r\n').replace('init 1\r\n','init\t1\r');
const index=(s,mode='c5m')=>core.inspect(s,mode).blocks.find(b=>b.name==='Harbor Ember Test').id;
const copy=(s,mode='c5m')=>creation.fromSource(s,mode,index(s,mode));
const flush=()=>new Promise(r=>setImmediate(r));
async function open(h,s=source(),mode='c5m'){
 h.$('openFile').files=[{name:'Existing-spells.'+mode,size:Buffer.byteLength(s),arrayBuffer:async()=>Buffer.from(s)}];await h.$('openFile').emit('change');await h.window.CoeWorkbenchSession.selectDefinition(index(s,mode));await flush();
}
function packet(s=source(),mode='c5m'){
 const def=copy(s,mode),p=def.spec;
 return {context:{sessionId:'a'.repeat(32),sourceRevision:createHash('sha256').update(mode+'\0'+def.text).digest('hex'),run:'b'.repeat(32),modId:'WB_SelectedSpell',spellName:p.spellName,weaponName:p.weaponName,mode,source:def.text,baseline:{dmgtype:p.dmgtype,aoe:p.aoe,look:p.look,flymode:p.flymode,flylook:p.flylook},resultSchema:2,damagePolicy:'documented-v1',legacy:false},
 runtimeBaseline:{look:68,flymode:2,flylook:65},samples:[{index:1,panel:1,parameterRevision:1,values:{dmgtype:4,aoe:0,look:3,flymode:2,flylook:65},castCount:1,readBackConfirmed:true,kind:'applied'}]};
}

test('selected CoE5SE spell and earlier local weapon form a canonical copy in both containers',()=>{
 for(const mode of ['c5m','c5se']){
  const s=source(mode),d=copy(s,mode);assert.equal(d.mode,mode);assert.equal(d.adapted,true);assert.equal(d.spec.spellName,'Harbor Ember Test');assert.equal(d.spec.weaponName,'Harbor Ember');
  assert.equal(d.otherSpellUsers.length,1);assert.equal(d.otherSpellUsers[0].name,'Harbor Ember Echo');assert.equal(d.sourceLine,20);assert.equal(d.weaponLine,10);
  assert.doesNotMatch(d.text,/Harbor Hook|Harbor Ember Echo|Harbor Practice Guard|source comments/);assert.equal(creation.fromDraft(d.text,mode).weaponDamage,'8');
  assert.equal(d.text.includes('#!@newspell'),mode==='c5m');const p=creation.testPackage(d.text,mode,{modId:'WB_SelectedSpell',caster:'Spearman',enemy:'Spearman',count:'1',casterId:'13',enemyId:'13',weaponEditing:true});
  assert.equal(p.manifest.experiment,'weapon-edit-v4');assert.equal(p.files.some(f=>f.name.endsWith('.c5se')),mode==='c5se');const definitions=p.files.find(f=>f.name.endsWith('.'+mode)).text;
  assert.ok(definitions.indexOf('newweapon')<definitions.indexOf('newspell'));assert.doesNotMatch(definitions,/Harbor Hook|Harbor Ember Echo|Practice Guard/);
 }
});

test('canonical generated pairs retain exact source identity and the existing cast route',async()=>{
 for(const mode of ['c5m','c5se']){const d=copy(source(mode),mode),p=creation.fromSource(d.text,mode,1);assert.equal(p.text,d.text);assert.equal(p.adapted,false);}
 const h=harness({example:false});await h.ready;const d=copy(source());h.window.CoeWorkbenchSession.openGenerated(creation.definition(d.spec,'c5m'));
 assert.equal(h.window.CoeWorkbenchSession.isTestWeaponSelection(),false);await h.$('prepareTest').emit('click');assert.equal(h.$('testHeading').textContent,'Prepare isolated test');assert.match(h.$('testModeExplanation').textContent,/Generated pair: Cast once/);
});

test('numeric, external, later, inherited and case-ambiguous weapon links are refused without guessing',()=>{
 const s=source();for(const changed of [s.replace('weapon 8 "Harbor Ember"','weapon 8 57'),s.replace('weapon 8 "Harbor Ember"','weapon 8 "Missing"'),s.replace('newweapon "Harbor Ember"','selectweapon "Harbor Ember"'),s.replace('newweapon "Harbor Ember"','newweapon "harbor ember"'),s+'\r\nnewweapon "HARBOR EMBER"\r\ndmg 1',s+'\r\nselectweapon "Harbor Ember"\r\nlook 3'])assert.throws(()=>copy(changed));
 const plain=copy(s).text,model=core.inspect(plain,'c5m');assert.throws(()=>copy(plain.slice(model.blocks[1].start)+'\r\n'+plain.slice(0,model.blocks[1].start)),/earlier/);
 assert.throws(()=>copy(s+'\r\n#!@newspell "harbor ember test"'),/spell name/);
});

test('unknown commands, flags, malformed lines, duplicates, missing fields and mixed active prefixes stay blocked',()=>{
 const s=source();for(const changed of [
  s.replace('#!@level 1','#!@slowcast\r\n#!@level 1'),s.replace('init\t1','copyweapon "Fireball"\r\ninit\t1'),
  s.replace('init\t1','magical\r\ninit\t1'),s.replace('#!@level 1','#!@level 1\r\n#!@level 2'),s.replace('dmg 0\r\naoe 0\r\nflymode','dmg 0\r\ndmg 8\r\naoe 0\r\nflymode'),
  s.replace('#!@path 3\r\n',''),s.replace('init\t1\r',''),s.replace('#!@level 1','level 1'),s.replace('#!@newspell "Harbor Ember Test"','newspell "Harbor Ember Test"'),
  s.replace('range 5 #','#!@range 5 #'),s.replace('newweapon "Harbor Ember"','#!@newweapon "Harbor Ember"'),s.replace('#!@level 1','#!@unrecognized 4\r\n#!@level 1'),s.replace('#!@level 1','#!@path "broken\r\n#!@level 1')
 ])assert.throws(()=>copy(changed));
});

test('includes, external requirements, numeric overrides and named/custom paths explain missing context',()=>{
 const s=source();assert.doesNotThrow(()=>copy('requires CoE5SE\r\n'+s));
 for(const line of ['#!@include "other.c5se"','requires OtherMod','selectweapon 1200'])assert.throws(()=>copy(s+'\r\n'+line),/dependency|load-order|ownership/);
 for(const p of ['"Pyromancy"','70','0'])assert.throws(()=>copy(s.replace('#!@path 3','#!@path '+p)),/built-in path ID/);
 assert.doesNotThrow(()=>copy(s.replace('#!@path 3','#!@path 69')));
});

test('metadata/end boundaries cannot detach a command tail and make it disappear from the selected record',()=>{
 const s=source();
 assert.throws(()=>copy(s.replace('#!@newspell "Harbor Ember Test"','description "split"\r\nlook 3\r\n#!@newspell "Harbor Ember Test"')),/splits Harbor Ember/);
 assert.throws(()=>copy(s.replace('#!@weapon 8 "Harbor Ember"','#!@weapon 8 "Harbor Ember"\r\nend\r\n#!@burnforest 1')),/splits Harbor Ember Test/);
});

test('the existing documented payload policy is retained rather than replacing a special type',()=>{
 const s=source();assert.throws(()=>copy(s.replace('dmgtype 4','dmgtype 23')),/Creation\/export only/);
 const bit=damage.options(12)[0].value,base=copy(s).spec;const def=creation.definition({...base,dmgtype:'12',dmg:bit,weaponDamage:bit},'c5m');
 const d=copy(def.text+'\r\nnewweapon "Unrelated"\r\ndmg 1');assert.equal(d.spec.dmgtype,'12');assert.equal(d.spec.weaponDamage,bit);
});

test('existing spell UI shows its pair, shared use and forced-cast scope; preparation preserves full source',async()=>{
 const h=harness({example:false});await h.ready;await open(h);const $=h.$,s=source();
 assert.match($('prepareTest').textContent,/selected spell with CoE5SE/);assert.equal($('prepareTest').disabled,false);assert.match($('linkedRecords').textContent,/Harbor Ember/);
 await $('prepareTest').emit('click');assert.match($('testIntro').textContent,/Harbor Ember Test.*Harbor Ember.*Other mod content is not loaded/);assert.match($('originalTestScope').textContent,/Shared by 1 other local spell/);assert.match($('testModeExplanation').textContent,/Selected pair: Cast once/);
 $('testWeaponEditing').checked=true;await $('testWeaponEditing').emit('change');await $('testForm').emit('submit');const p=h.window.CoePreparedTest();assert.equal(p.source,copy(s).text);assert.equal(p.manifest.experiment,'weapon-edit-v4');assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,s);
 await $('closeTest').emit('click');$('field-level').value='2';await $('field-level').emit('input');assert.equal($('prepareTest').disabled,true);assert.throws(()=>h.window.CoePreparedTest());assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,s);
 const h2=harness({example:false});await h2.ready;await open(h2,s.replace('weapon 6 "Harbor Ember"','weapon 6 1200'));await h2.$('prepareTest').emit('click');assert.match(h2.$('originalTestScope').textContent,/No other exact-name local spell link found/);assert.doesNotMatch(h2.$('originalTestScope').textContent,/Only this spell/);
});

test('Vanilla view keeps the retained spell/source but does not offer it as a Vanilla test',async()=>{
 const h=harness({example:false});await h.ready;await open(h,source('c5se'),'c5se');const $=h.$,s=h.window.CoeWorkbenchSession.returnDraft();
 $('field-level').value='2';await $('field-level').emit('input');$('target').value='vanilla';await $('target').emit('change');
 assert.equal($('prepareTest').hidden,true);assert.equal($('field-level').value,'2');assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,s.text);assert.equal(h.window.CoeWorkbenchSession.returnDraft().mode,'c5se');
 $('target').value='coe5se';await $('target').emit('change');assert.equal($('field-level').value,'2');await $('editForm').emit('submit');assert.equal($('prepareTest').disabled,false);
});

test('real-source return changes only the linked weapon and retains pending edits on the selected spell',async()=>{
 for(const mode of ['c5m','c5se']){
  const s=source(mode),p=await ret.validatePacket(packet(s,mode)),h=harness({example:false});await h.ready;await open(h,s,mode);const session=h.window.CoeWorkbenchSession;
  h.$('field-weaponDamage').value='11';await h.$('field-weaponDamage').emit('input');const plan=session.previewTestReturn(p.context,p.samples[0]);assert.equal(plan.otherSpellUsers,1);
  session.applyTestReturn(plan,['look']);const d=session.returnDraft();assert.equal(d.text,s.replace('look 68 #','look 3 #'));assert.equal(d.inputs.weaponDamage,'11');assert.equal(h.$('download').disabled,true);
 }
});

test('newer visual conflicts, relinked spells, pending links and duplicate destination names stay protected',async()=>{
 const s=source(),p=await ret.validatePacket(packet(s)),h=harness({example:false});await h.ready;await open(h,s.replace('look 68 #','look 49 #'));const session=h.window.CoeWorkbenchSession;
 let plan=session.previewTestReturn(p.context,p.samples[0]);assert.equal(plan.rows.find(r=>r.key==='look').conflict,true);assert.throws(()=>session.applyTestReturn(plan,['look']),/Explicitly/);session.applyTestReturn(plan,['look'],['look']);assert.equal(session.returnDraft().text,s.replace('look 68 #','look 3 #'));
 h.$('field-weaponRef').value='"Harbor Hook"';await h.$('field-weaponRef').emit('input');assert.throws(()=>session.previewTestReturn(p.context,p.samples[0]),/pending weapon reference/);assert.equal(session.returnDraft().inputs.weaponRef,'"Harbor Hook"');
 assert.throws(()=>ret.destination(p.context,{text:s.replace('weapon 8 "Harbor Ember"','weapon 8 "Harbor Hook"'),mode:'c5m'}),/relinked/);
 assert.throws(()=>ret.destination(p.context,{text:s+'\r\n#!@newspell "harbor ember test"',mode:'c5m'}),/unique/);
 assert.throws(()=>ret.destination(p.context,{text:s,mode:'c5se'}),/interpretation/);
});

test('an absent optional impact remains explicit opt-in and can be inserted without changing unrelated text',async()=>{
 const s=source().replace('look 68 # Flame reference; does not set damage type\r\n',''),p=packet(s);p.context.baseline.look='';p.runtimeBaseline.look=7;const v=await ret.validatePacket(p),h=harness({example:false});await h.ready;await open(h,s);
 const session=h.window.CoeWorkbenchSession,plan=session.previewTestReturn(v.context,v.samples[0]),row=plan.rows.find(r=>r.key==='look');assert.equal(row.addition,true);assert.equal(row.defaultSelected,false);session.applyTestReturn(plan,['look']);
 const current=session.returnDraft().text;assert.match(current,/newweapon "Harbor Ember"[^\r\n]*\r\n  look 3\r\n/);assert.equal(current.replace('  look 3\r\n',''),s);
});

test('saved-value UI explains shared scope, cast-call evidence and applies only chosen fields before separate export',async()=>{
 const s=source(),p=packet(s);let exported;const desktop={getTestSessions:async()=>[{id:p.context.sessionId,spell:p.context.spellName,weapon:p.context.weaponName,mode:'c5m',run:p.context.run,status:'exited',hasResult:true}],getTestValues:async()=>p,exportCopy:async text=>{exported=text;return {name:'separate.c5m'};}};
 const h=harness({example:false,desktop});await h.ready;await open(h);await h.$('reviewLatestTest').emit('click');await flush();assert.match(h.$('returnEvidence').textContent,/1 completed cast call/);assert.match(h.$('returnEvidence').textContent,/Visual appearance is not established/);assert.match(h.$('returnEvidence').textContent,/also referenced by 1 other local spell/);assert.equal(h.$('returnUse-look').checked,true);
 await h.$('applyReturn').emit('click');assert.equal(exported,undefined);await h.$('download').emit('click');assert.equal(exported,s.replace('look 68 #','look 3 #'));
});
