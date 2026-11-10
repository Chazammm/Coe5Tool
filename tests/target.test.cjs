'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const target=require('../target.js'),creation=require('../creation.js'),{harness}=require('./harness.cjs');
const weapon={weaponName:'Native Needle',dmg:'6',dmgtype:'3',range:'6',init:'7',aoe:'0'};
const choose=async(h,value)=>{h.$('target').value=value;await h.$('target').emit('change');};
test('native creation contains only the supported weapon and no spell, script or extender lines',()=>{
 const out=creation.weaponDefinition({...weapon,spellName:'Must not appear',path:'3'});
 assert.equal(out.mode,'c5m');assert.equal(out.kind,'native-weapon');
 assert.match(out.text,/newweapon "Native Needle"\r\nrange 6/);assert.doesNotMatch(out.text,/newspell|#!@|requires|\.lua|Must not appear/);
 assert.equal(target.assess(out.text,out.mode).status,'Native weapon syntax subset');
 assert.throws(()=>creation.weaponDefinition({...weapon,weaponName:'Bad"name'}));
 assert.throws(()=>creation.weaponDefinition({...weapon,aoe:'9999'}));
 assert.doesNotThrow(()=>creation.weaponDefinition({...weapon,dmgtype:'12'}));
 assert.throws(()=>creation.weaponDefinition({...weapon,dmgtype:'12',dmg:'131072'}),/documented/);
});
test('container and prefixes retain their different meanings and dependency diagnostics',()=>{
 assert.equal(target.assess('newweapon "W"\ndmg 5','c5se').requiresExtender,true);
 assert.equal(target.assess('#!@newweapon "W"\n#!@dmg 5','c5m').requiresExtender,true);
 assert.equal(target.assess('#!@newspell "S"','c5se').notes.length,1);
 const req=target.assess('#!@requires CoE5SE','c5m');assert.match(req.notes[0].message,/plain requires/);
 assert.equal(target.assess('requires CoE5SE','c5m').requiresExtender,true);
 assert.equal(target.assess('requires OtherMod','c5m').unresolved,true);
});
test('spell, path and plane contexts cannot be approved from native-looking words',()=>{
 for(const [op,word]of [['newspell "S"','level 1'],['newspell "S"','burnforest'],['selectspellpath 4','name "Water"'],['newplane "P"','planeswap 1']]){
  const result=target.assess(op+'\n'+word,'c5m');assert.equal(result.requiresExtender,true);assert.match(result.notes.at(-1).message,/surrounding/);
 }
 const ritual=target.assess('newritual\nlevel 1','c5m');assert.equal(ritual.requiresExtender,false);assert.equal(ritual.unresolved,true);
});
test('argument forms and unknown providers stay conservative without rewriting source',()=>{
 for(const source of ['spellweaponbonus "Hydromancy" 1','newspell1 "Hydromancy"','spawnoffs "Wolf"','arrow 0'])assert.equal(target.assess(source,'c5m').requiresExtender,true,source);
 for(const source of ['spellweaponbonus 4 1','include "more.c5se"','+minunitshere 3','third_party_command 1','newweapon "W"\nlook named','newweapon "W"\nimmortal']){
  const r=target.assess(source,'c5m');assert.equal(r.unresolved,true);assert.equal(r.requiresExtender,false);
 }
 const r=target.assess('newweapon "W"\ndmg 5\nrange 6\narrow\nnextwep 54\nclearwspec','c5m');assert.equal(r.unresolved,false);assert.match(r.scope,/capacity/);
});
test('native weapon count is a combined-mod limit, not a whole-mod certificate',()=>{
 const r=target.assess('newweapon "W"\n'.repeat(3800),'c5m');assert.equal(r.requiresExtender,true);
 assert.match(r.notes.at(-1).message,/3,799/);assert.match(target.assess('newweapon "W"','c5m').scope,/Other files/);
});
test('switching target retains exact held bytes, original extension, pending input and unsaved state',async()=>{
 const source='\uFEFF# retain\r\nnewweapon "W"\nrange\t5 # keep\rdmg 8\n#!@noexplode\nopaque 2',written=[];
 const h=harness({example:false,desktop:{openSource:async()=>({text:source,name:'mixed.c5m',mode:'c5m'}),exportCopy:async(text,filename)=>{written.push({text,filename});return {name:filename};}}});
 await h.$('desktopOpen').emit('click');const input=h.$('field-range');input.value='9';await input.emit('input');
 await choose(h,'vanilla');assert.equal(h.$('field-range'),input);assert.equal(input.value,'9');assert.equal(h.$('mode').value,'c5m');assert.equal(h.window.CoeDesktopState(),true);
 assert.equal(h.$('prepareTest').disabled,true);assert.match(h.$('targetStatus').textContent,/Requires CoE5SE/);assert.match(h.$('exportHelp').textContent,/Apply or discard/);
 await h.$('discard').emit('click');await choose(h,'coe5se');await choose(h,'vanilla');assert.equal(h.window.CoeDesktopState(),false);
 await h.$('download').emit('click');assert.equal(written[0].text,source);assert.equal(written[0].filename,'mixed.edited.c5m');assert.match(h.$('exportHelp').textContent,/does not convert/);
});
test('actual source container stays SE-dependent when Read as is changed',async()=>{
 const h=harness({example:false});h.$('pasteText').value='newweapon "W"\ndmg 4';await h.$('pasteForm').emit('submit');
 h.$('mode').value='c5m';await h.$('mode').emit('change');await choose(h,'vanilla');assert.match(h.$('targetStatus').textContent,/Requires CoE5SE/);assert.match(h.$('targetStatus').textContent,/preserved .c5se/);
});
test('Vanilla creation is a separate unsaved native fragment and exports no hidden extender content',async()=>{
 let saved;const h=harness({example:false,desktop:{exportCopy:async(text,filename)=>{saved={text,filename};return {name:filename};}}});
 await choose(h,'vanilla');await h.$('newDefinition').emit('click');assert.equal(h.$('create-spellName-label').hidden,true);assert.equal(h.$('create-mode').disabled,true);assert.equal(h.$('create-mode').value,'c5m');
 for(const [key,value]of Object.entries(weapon)){h.$('create-'+key).value=value;await h.$('create-'+key).emit('input');}
 await h.$('creationForm').emit('submit');assert.equal(h.$('creationDialog').open,false);assert.equal(h.$('prepareTest').disabled,true);assert.equal(h.window.CoeDesktopState(),true);
 assert.match(h.$('generatedNotice').textContent,/Native weapon draft/);await h.$('download').emit('click');
 assert.equal(saved.text,creation.weaponDefinition(weapon).text);assert.match(saved.filename,/\.c5m$/);assert.equal(h.window.CoeDesktopState(),false);
 await choose(h,'coe5se');assert.equal(h.$('prepareTest').disabled,true);await h.$('newDefinition').emit('click');assert.equal(h.$('create-spellName-label').hidden,false);
});
