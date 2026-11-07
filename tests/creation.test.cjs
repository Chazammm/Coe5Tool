'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const api=require('../creation.js'),core=require('../core.js'),{harness}=require('./harness.cjs');
const spec=()=>({spellName:"WB Scholar's Spark",weaponName:'WB Scholar Spark Effect',path:'3',level:'1',weaponDamage:'8',dmg:'0',dmgtype:'4',range:'6',init:'1',aoe:'0',look:'',sound:'',flymode:'',flylook:'',flysound:''});
const options=()=>({modId:'WB_ScholarSpark',caster:'Pyromancer',enemy:'Spearman',count:'20'});
const host=(extra={})=>({openSource:async()=>null,getLibrary:async()=>null,importNames:async()=>null,exportCopy:async()=>null,exportTestPackage:async()=>null,...extra});
async function fill(h,s=spec(),mode='c5m'){
 await h.$('newDefinition').emit('click');
 for(const [key,value] of Object.entries(s)){h.$('create-'+key).value=value;await h.$('create-'+key).emit('input');}
 h.$('create-mode').value=mode;await h.$('creationForm').emit('submit');
}
async function prepare(h,o=options()){
 await h.$('prepareTest').emit('click');
 for(const [id,value] of Object.entries({testModId:o.modId,testCaster:o.caster,testEnemy:o.enemy,testCount:o.count})){h.$(id).value=value;await h.$(id).emit('input');}
 await h.$('testForm').emit('submit');
}

test('new pair preserves names, uses a quoted associated weapon, and declares it first in both formats',()=>{
 for(const mode of ['c5m','c5se']){
  const s=spec(),r=api.definition(s,mode),m=core.inspect(r.text,mode);assert.equal(m.blocks.length,2);assert.equal(m.blocks[0].type,'weapon');assert.equal(m.blocks[1].name,s.spellName);
  assert.equal(m.blocks[0].name,s.weaponName);assert.equal(m.blocks[1].matches[0],0);assert.equal(m.blocks[1].fields.find(f=>f.key==='weaponRef').value,'"'+s.weaponName+'"');
  assert.ok(r.text.includes((mode==='c5m'?'#!@':'')+'newspell "'+s.spellName+'"\r\n'));assert.ok(!r.text.includes('#!@newweapon'));assert.ok(r.text.includes('not an installable mod'));
  assert.deepEqual(api.fromDraft(r.text,mode),s);assert.ok(!r.text.includes('\nlook '));
 }
});
test('required choices and the deliberately narrow numeric/type subset are enforced',()=>{
 for(const key of ['spellName','weaponName','path','level','weaponDamage','dmg','dmgtype','range','init','aoe'])assert.throws(()=>api.definition({...spec(),[key]:''},'c5m'));
 for(const [key,value] of [['level','4'],['path','0'],['path','70'],['range','0'],['aoe','3005'],['dmgtype','12'],['weaponDamage','2147483648'],['dmg','-1'],['init','1\n'],['level','1.5'],['range','2+3']])assert.throws(()=>api.definition({...spec(),[key]:value},'c5se'));
 assert.throws(()=>api.definition(spec(),'c5lua'));
});
test('names cannot inject source/Lua, silently lose spaces or exceed the safe byte subset',()=>{
 for(const value of ['', ' leading','trailing ','bad#name','bad"name','bad\\name','bad\nname','bad\0name','é','x'.repeat(48)])assert.throws(()=>api.definition({...spec(),spellName:value},'c5m'));
 assert.doesNotThrow(()=>api.definition({...spec(),spellName:'x'.repeat(47),weaponName:'w'.repeat(63)},'c5m'));
 assert.throws(()=>api.definition({...spec(),weaponName:'x'.repeat(64)},'c5m'));
});
test('optional effects are emitted only explicitly; paired flight metadata and launch mute are handled',()=>{
 const r=api.definition({...spec(),look:'17',sound:'88',flymode:'6',flylook:'197',flysound:'-1'},'c5m');
 assert.ok(r.text.includes('flysound -1\r\n'));assert.ok(r.text.includes('look 17\r\n'));assert.throws(()=>api.definition({...spec(),flymode:'1'},'c5se'));
 assert.throws(()=>api.definition({...spec(),sound:'-1'},'c5se'));assert.throws(()=>api.definition({...spec(),flylook:'1'},'c5m'));
 for(const flymode of ['0','10'])assert.throws(()=>api.definition({...spec(),flymode,flylook:'1'},'c5m'));
});
test('test generation uses applied live fields and rejects relinked or altered source shapes',()=>{
 const r=api.definition(spec(),'c5m'),m=core.inspect(r.text,'c5m'),patched=core.patch(r.text,'c5m',m.blocks[1].id,{weaponDamage:'19'}).text;
 const p=api.testPackage(patched,'c5m',options());assert.equal(p.manifest.definitions.weaponDamage,'19');assert.ok(p.files.find(f=>f.name.endsWith('.lua')).text.includes('info.dmg ~= 19'));
 assert.throws(()=>api.testPackage(patched.replace('19 "WB Scholar Spark Effect"','19 54'),'c5m',options()),/associated weapon/);
 assert.throws(()=>api.testPackage(patched+'plugin_opaque 1\r\n','c5m',options()),/subset/);
});
test('test files include mod metadata, dependency guard, matching sidecar/Lua, provenance and candid instructions',()=>{
 for(const mode of ['c5m','c5se']){
  const p=api.testPackage(api.definition(spec(),mode).text,mode,options()),files=new Map(p.files.map(f=>[f.name,f.text]));
  assert.ok(files.get(options().modId+'.c5m').startsWith('icon "banner.tga"\r\ndescription '));assert.ok(files.get(options().modId+'.c5m').includes('\r\nneeds_script_extender\r\nrequires CoE5SE\r\n'));
  assert.equal(files.has(options().modId+'.c5se'),mode==='c5se');const defs=files.get(options().modId+'.'+mode);assert.ok(defs.indexOf('newweapon')<defs.indexOf('newspell'));
  const readme=files.get('README.txt');for(const word of ['MANUAL SETUP','REMOVAL','not a verified runnable','range','2.13.0','disposable','main menu'])assert.ok(readme.includes(word),word);
  assert.equal(JSON.parse(files.get('manifest.json')).gameTested,false);assert.equal(p.files.some(f=>f.name.includes('/')||f.name.includes('..')),false);
 }
});
test('test identity and monster/count input are validated before package output',()=>{
 const source=api.definition(spec(),'c5m').text;
 for(const modId of ['../Mod','Bad/Mod','Bad\\Mod','Mod\n','CoE5SE','Mod name','1Mod','CON','NUL','LPT1','COM9','x'.repeat(33)])assert.throws(()=>api.testPackage(source,'c5m',{...options(),modId}));
 for(const o of [{count:'0'},{count:'201'},{caster:''},{enemy:'a"b'}])assert.throws(()=>api.testPackage(source,'c5m',{...options(),...o}));
});
test('creation is optional; a new draft is reviewable, labeled a fragment and unsaved until source export',async()=>{
 let written;const h=harness({example:false,desktop:host({exportCopy:async(text,filename)=>{written={text,filename};return {name:filename};}})});
 assert.equal(h.$('creationDialog').open,false);assert.equal(h.$('prepareTest').disabled,true);await fill(h);
 assert.equal(h.$('creationDialog').open,false);assert.equal(h.$('sourceKind').textContent,'Generated fragment');assert.equal(h.$('generatedNotice').hidden,false);assert.equal(h.$('sourcePanel').open,false);assert.equal(h.document.activeElement,h.$('selectedHeading'));
 assert.equal(h.window.CoeDesktopState(),true);assert.equal(h.$('prepareTest').disabled,false);assert.equal(h.$('output').value,api.definition(spec(),'c5m').text.replace(/\r\n/g,'\n'));
 await h.$('download').emit('click');assert.equal(written.text,api.definition(spec(),'c5m').text);assert.equal(h.window.CoeDesktopState(),false);assert.ok(h.$('draftState').textContent.includes('Exported copy'));
});
test('cancelled/invalid creation and declined replacement preserve current source and pending controls',async()=>{
 const h=harness(),before=h.$('output').value,input=h.$('field-range');input.value='9';await input.emit('input');
 await h.$('newDefinition').emit('click');h.$('create-spellName').value='Bad#Name';await h.$('creationForm').emit('submit');assert.equal(h.$('output').value,before);assert.equal(h.$('field-range'),input);
 h.window.confirm=()=>false;await fill(h);assert.equal(h.$('creationDialog').open,true);assert.equal(h.$('output').value,before);assert.equal(input.value,'9');
 await h.$('creationDialog').emit('cancel');assert.equal(h.$('creationDialog').open,true);h.window.confirm=()=>true;await h.$('closeCreation').emit('click');assert.equal(h.$('creationDialog').open,false);assert.equal(h.$('output').value,before);
});
test('typed creation options participate in native unsaved checks even with no source',async()=>{
 const h=harness({example:false});await h.$('newDefinition').emit('click');h.$('create-spellName').value='Typed';await h.$('create-spellName').emit('input');assert.equal(h.window.CoeDesktopState(),true);
 await h.emitWindow('keydown',{key:'F1'});assert.equal(h.$('helpPanel').hidden,true);await h.$('closeCreation').emit('click');assert.equal(h.window.CoeDesktopState(),false);
});
test('test preview requires applied generated fields and ZIP export does not mark the source fragment saved',async()=>{
 let exported;const h=harness({example:false,desktop:host({exportTestPackage:async(modId,files)=>{exported={modId,files};return {name:'test.zip'};}})});await fill(h);
 h.$('field-range').value='9';await h.$('field-range').emit('input');assert.equal(h.$('prepareTest').disabled,true);await h.$('editForm').emit('submit');await prepare(h);
 assert.ok(h.$('testPreview').value.includes('range 9'));h.$('testFiles').value='README.txt';await h.$('testFiles').emit('change');assert.ok(h.$('testPreview').value.includes('MANUAL SETUP'));
 await h.$('exportTest').emit('click');assert.equal(exported.modId,options().modId);assert.ok(exported.files.find(f=>f.name.endsWith('.c5m')).text.includes('range 9'));
 assert.ok(h.$('testStatus').textContent.includes('Exported'));assert.equal(h.window.CoeDesktopState(),true);await h.$('closeTest').emit('click');assert.equal(h.window.CoeDesktopState(),true);
});
test('cancelled/failed ZIP exports retain test options, and changing them invalidates the previous package',async()=>{
 const desktop=host(),h=harness({example:false,desktop});await fill(h);await prepare(h);const before=h.$('testPreview').value;
 await h.$('exportTest').emit('click');assert.ok(h.$('testStatus').textContent.includes('cancelled'));assert.equal(h.$('testPreview').value,before);
 desktop.exportTestPackage=async()=>{throw new Error('Existing ZIP refused');};await h.$('exportTest').emit('click');assert.ok(h.$('testStatus').textContent.includes('refused'));
 h.$('testCount').value='30';await h.$('testCount').emit('input');assert.equal(h.$('exportTest').disabled,true);assert.equal(h.$('testPreview').value,'');
});
test('stale asynchronous package export cannot clear changed preparation options',async()=>{
 let finish;const h=harness({example:false,desktop:host({exportCopy:async()=>({name:'fragment'}),exportTestPackage:()=>new Promise(r=>{finish=r;})})});await fill(h);await h.$('download').emit('click');await prepare(h);
 const writing=h.$('exportTest').emit('click');h.$('testCount').value='31';await h.$('testCount').emit('input');finish({name:'older.zip'});await writing;
 assert.equal(h.$('exportTest').disabled,true);assert.equal(h.window.CoeDesktopState(),true);
});
