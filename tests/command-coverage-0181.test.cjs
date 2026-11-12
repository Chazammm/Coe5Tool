const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=require('../core.js'),coverage=require('../command-coverage.js'),target=require('../target.js'),melee=require('../melee.js'),{harness}=require('./harness.cjs');
const f=(m,key,id=0)=>m.blocks[id].fields.find(f=>f.key===key);
async function open(h,text,name){const bytes=Buffer.from(text);h.$('openFile').files=[{name,size:bytes.length,arrayBuffer:async()=>bytes}];await h.$('openFile').emit('change');}
const errors=m=>m.diagnostics.filter(d=>d.severity==='error');
for(const mode of ['c5m','c5se'])test(`verified beamwidth preserves later editable spans in ${mode}`,()=>{
 const se=mode==='c5m'?'#!@':'';
 const source='\uFEFF# retained\r\nnewweapon "Beam"\n'+se+'beamwidth 3 lines # retained\rrange\t5\r\ndmg 8\n';
 const m=core.inspect(source,mode);assert.equal(errors(m).length,0);assert.ok(f(m,'range').editable);
 assert.equal(core.patch(source,mode,0,{range:'6'}).text,source.replace('range\t5','range\t6'));
 assert.match(m.diagnostics.find(d=>d.category==='coverage').message,/3\.2\.2, 3\.3\.0/);
 // Editor recognition does not expand the private game fixture's command subset.
 if(mode==='c5m')assert.throws(()=>melee.fromSource(source,mode,0),/beamwidth|command|supported/i);
});
test('beamwidth grammar is checked in the weapon context; malformed values retain a barrier',()=>{
 for(const args of ['0','16','2.5','"3"','3 pixels','3 lines extra']){
  const m=core.inspect('newweapon "Beam"\nbeamwidth '+args+'\nrange 5','c5se');
  assert.ok(m.diagnostics.some(d=>d.severity==='error'&&d.category==='syntax'));assert.equal(f(m,'range').editable,false);
 }
 const m=core.inspect('newspell "S"\nbeamwidth 3\npath 3\nlevel 1\nweapon 5 54','c5se');
 assert.equal(errors(m).length,0);assert.ok(m.diagnostics.some(d=>/outside the inspected spell context/.test(d.message)));assert.equal(f(m,'level').editable,false);
});
test('unknown words and recognized wrong-context commands still protect later or ambiguous assignments',()=>{
 for(const word of ['future_hook 1','healarmy undead']){
  const s='newweapon "A"\nrange 4\n'+word+'\nrange 8\ndmg 9\nnewweapon "B"\ndmg 2';
  const m=core.inspect(s,'c5se');assert.equal(f(m,'range').editable,false);assert.equal(f(m,'dmg').editable,false);assert.ok(f(m,'dmg',1).editable);assert.throws(()=>core.patch(s,'c5se',0,{range:'7'}));
 }
});
test('dynamic heal-family recognition does not certify trait names or make the test fixture accept them',()=>{
 for(const word of ['healarmy','healhumanarmy','healunverifiedtraitarmy']){
  const s=`newspell "Heal"\n${word} undead\npath 3\nlevel 1\nweapon 5 "Heal"`;
  const m=core.inspect(s,'c5se');assert.equal(errors(m).length,0);assert.ok(f(m,'level').editable);
  if(word!=='healhumanarmy')assert.ok(m.diagnostics.some(d=>/Trait\/tag resolution is not checked/.test(d.message)));
 }
 assert.deepEqual(coverage.info('beamwidth').versions,['3.2.2','3.3.0']);assert.deepEqual(coverage.info('healhumanarmy').versions,['2.13.0','3.2.2','3.3.0']);
});
test('battle maps, corpse declarations and conditional events cannot leak fields into an old definition',()=>{
 const m=core.inspect('newweapon "A"\nrange 5\nbattlemap "M"\nbattleweight 3\nrange 99\nnewcorpsetype "C"\ndmg 99\nplayerevent\nnewweapon "Conditional"\ndmg 77\nendevent\nnewweapon "B"\ndmg 2','c5se');
 assert.deepEqual(m.blocks.map(b=>b.name),['A','B']);assert.equal(f(m,'range').value,'5');assert.equal(f(m,'dmg').editable,false);assert.equal(f(m,'dmg',1).value,'2');
});
test('documented reference-first spell assignments retain order, prefixes, comments and signed 64-bit payloads',()=>{
 for(const mode of ['c5m','c5se']){
  const p=mode==='c5m'?'#!@':'';
  const s=`\uFEFFnewweapon "W"\r\ndmg 8\n${p}newspell "S"\r${p}path 3\r\n${p}level 1\n${p}weapon "W" -9223372036854775808 # keep`;
  const m=core.inspect(s,mode);assert.equal(errors(m).length,0);assert.deepEqual(m.blocks[1].matches,[0]);assert.equal(f(m,'weaponRef',1).value,'"W"');
  assert.equal(core.patch(s,mode,1,{weaponDamage:'9223372036854775807'}).text,s.replace('-9223372036854775808','9223372036854775807'));
 }
});
test('syntax errors, unsupported form grammar, dependency and external references have distinct categories',()=>{
 const external=core.inspect('newspell "S"\npath 3\nlevel 1\nweapon 5 "Native external"','c5se');assert.equal(errors(external).length,0);assert.equal(external.diagnostics.find(d=>d.category==='reference').severity,'info');
 const malformed=core.inspect('newspell "S"\npath 3\nlevel 4\nweapon 5 54','c5se');assert.ok(errors(malformed).some(d=>d.category==='syntax'));
 const quote=core.inspect('newweapon "broken\nrange 5','c5se');assert.ok(errors(quote).some(d=>d.category==='syntax'));
 const unsupported=core.inspect('newweapon "A\\B"\nrange 5','c5se');assert.equal(errors(unsupported).length,0);assert.equal(f(unsupported,'range').editable,false);assert.equal(unsupported.diagnostics[0].category,'coverage');
 const plain=core.inspect('newspell "S"\npath 3\nlevel 1\nweapon 5 54','c5m');assert.equal(errors(plain).length,0);assert.ok(plain.diagnostics.some(d=>d.category==='dependency'));assert.equal(f(plain,'level').editable,false);
 const se=core.inspect('newweapon "A"\nbeamwidth 3\nrange 5','c5m');assert.ok(se.diagnostics.some(d=>d.category==='dependency'));assert.ok(f(se,'range').editable);
});
test('dependency assessment groups whole sections without declaring their syntax valid',()=>{
 const s=Array.from({length:300},(_,i)=>`newmonster "M${i}"\nmr 0\nhp 5\ncustom_tail ${i}`).join('\n');
 const a=target.assess(s,'c5m');assert.equal(a.requiresExtender,false);assert.equal(a.notes.length,1);assert.equal(a.notes[0].kind,'coverage');assert.equal(a.notes[0].count,1200);assert.match(a.notes[0].message,/not fully assessed/);
 assert.match(target.assess('future_hook 3','c5m').status,/Validity not established/);
 assert.equal(target.assess('#!@newspell "S"\n#!@path 3','c5m').requiresExtender,true);
 const b=target.assess('personalmod\nnewmonster "M"\nmr 0','c5se');assert.equal(b.requiresExtender,true);assert.ok(b.notes.some(n=>/dependency, not a syntax error/.test(n.message)));assert.equal(b.notes.filter(n=>n.kind==='unknown').length,0);
});
test('browser bundles load the context policy before parser and preserve current exports',()=>{
 const html=fs.readFileSync('index.html','utf8');assert.ok(html.indexOf('command-coverage.js')<html.indexOf('core.js'));
 const box={TextEncoder};for(const file of ['known-words.js','command-coverage.js','core.js','target.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),box,{filename:file});
 assert.ok(box.CoeWorkbench.inspect('newweapon "W"\nbeamwidth 3\nrange 5','c5se').blocks[0].fields.find(f=>f.key==='range').editable);
 assert.ok(fs.readFileSync('desktop/Workbench.csproj','utf8').includes('command-coverage.js'));
});
test('UI labels coverage accurately, protects pending edits and exports only the applied token',async()=>{
 const h=harness(),source='\uFEFF# retained\r\nnewweapon "Beam"\nbeamwidth 3 lines\rrange 5\r\ndmg 8';
 await open(h,source,'beam.c5se');
 assert.equal(h.$('field-range').disabled,false);assert.match(h.$('testHelp').textContent,/Standalone weapon tests currently require/);assert.doesNotMatch(h.$('testHelp').textContent,/Restore that Weapon reference/);
 assert.match(h.$('checkCount').textContent,/notes.*partial checks/);assert.match(h.$('diagnostics').textContent,/Editor coverage/);
 h.$('field-range').value='6';await h.$('field-range').emit('input');assert.equal(h.$('download').disabled,true);
 h.$('target').value='vanilla';await h.$('target').emit('change');assert.equal(h.$('field-range').value,'6');assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,source);
 await h.$('editForm').emit('submit');await h.$('download').emit('click');assert.equal(h.downloads.length,1);assert.deepEqual(Buffer.from(await h.downloads[0].blob.arrayBuffer()),Buffer.from(source.replace('range 5','range 6')));
 await open(h,'newspell "S"\npath 3\nlevel 4\nweapon 5 54','bad.c5se');assert.match(h.$('diagnostics').textContent,/Syntax error/);
});
