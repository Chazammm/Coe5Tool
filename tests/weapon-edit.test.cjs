'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const creation=require('../creation.js'),{harness}=require('./harness.cjs');
const spec={spellName:'WB Edit Spark',weaponName:'WB Edit Effect',path:'3',level:'1',weaponDamage:'8',dmg:'0',dmgtype:'4',range:'6',init:'1',aoe:'0',look:'68',sound:'16',flymode:'6',flylook:'65',flysound:'104'};
const options={modId:'WB_EditCheck',caster:'Pyromancer',enemy:'Spearman',count:'20',weaponEditing:true};
test('the opt-in helper matches the exact native template in both containers and never changes source',()=>{
 for(const mode of ['c5m','c5se']){
  const source=creation.definition(spec,mode).text,p=creation.testPackage(source,mode,options);
  const t=JSON.stringify,s=creation.validate(spec),o=creation.testOptions(options);
  const tokens={DOCK:fs.readFileSync(path.join(__dirname,'../desktop/TestDock.lua'),'utf8').replace(/\r\n/g,'\n'),LOOK:s.look||'nil',FLYMODE:s.flymode||'nil',FLYLOOK:s.flylook||'nil',SPELL:t(s.spellName),WEAPON:t(s.weaponName),CASTER:t(o.caster),ENEMY:t(o.enemy),CASTERID:'nil',ENEMYID:'nil',MODE:t(mode),MODID:t(o.modId),PATH:s.path,LEVEL:s.level,DAMAGE:s.weaponDamage,BASEDAMAGE:s.dmg,COUNT:o.count,DMGTYPE:s.dmgtype,AOE:s.aoe,MENU:t('WB test: '+o.modId)};
  const expected=fs.readFileSync(path.join(__dirname,'../desktop/WeaponEditFixture.lua'),'utf8').replace(/\r\n/g,'\n').replace(/\{\{([A-Z]+)\}\}/g,(_,key)=>tokens[key]);
  const helper=p.files.find(f=>f.name.endsWith('.lua')).text;
  assert.equal(helper,expected);assert.equal(p.manifest.experiment,'weapon-edit-v4');assert.equal(p.manifest.test.weaponEditing,true);
  assert.equal(p.manifest.gameTested,false);assert.equal(creation.definition(spec,mode).text,source);
  assert.doesNotMatch(helper,/coe5\.(copyText|saveNewMod|fightTestField)\(/);
  assert.match(helper,/coe5\.readIni\("workbench-session"\)/);assert.match(helper,/coe5\.writeIni\("wb-result-"/);
  assert.match(p.files.find(f=>f.name==='README.txt').text,/No live synchronization or automatic export/);
 }
});
test('standard preparation stays the default; only explicit boolean input enables the reviewed experiment',()=>{
 const source=creation.definition(spec,'c5m').text;
 for(const value of [undefined,false]){
  const p=creation.testPackage(source,'c5m',{...options,weaponEditing:value});assert.equal(p.manifest.experiment,undefined);assert.doesNotMatch(p.files.find(f=>f.name.endsWith('.lua')).text,/wb_weapon_edit/);
 }
 for(const value of ['true',1,{},null])assert.throws(()=>creation.testPackage(source,'c5m',{...options,weaponEditing:value}),/checkbox/);
 for(const changes of [{dmgtype:'26'},{aoe:'201'},{aoe:'-1'}])assert.throws(()=>creation.definition({...spec,...changes},'c5m'));
});
test('experiment option is explicit, invalidates old preparation and keeps the prepared desktop source fixed',async()=>{
 const h=harness({example:false});await h.$('newDefinition').emit('click');
 for(const [key,value]of Object.entries(spec)){h.$('create-'+key).value=value;await h.$('create-'+key).emit('input');}
 h.$('create-mode').value='c5m';await h.$('creationForm').emit('submit');const source=h.window.CoeWorkbenchSession.testSource().text;
 await h.$('prepareTest').emit('click');assert.equal(h.$('testWeaponEditing').checked,false);h.$('testModId').value=options.modId;
 await h.$('testForm').emit('submit');assert.equal(h.window.CoePreparedTest().manifest.experiment,undefined);
 h.$('testWeaponEditing').checked=true;await h.$('testWeaponEditing').emit('change');assert.throws(()=>h.window.CoePreparedTest(),/Prepare files/);assert.equal(h.$('exportTest').disabled,true);
 await h.$('testForm').emit('submit');assert.equal(h.window.CoePreparedTest().manifest.experiment,'weapon-edit-v4');assert.match(h.$('testStatus').textContent,/parameters stay inside/);
 assert.equal(h.window.CoeWorkbenchSession.testSource().text,source);assert.equal(h.$('sourceKind').textContent,'Generated fragment');
 h.$('testWeaponEditing').checked=false;await h.$('testWeaponEditing').emit('change');assert.throws(()=>h.window.CoePreparedTest());
});
