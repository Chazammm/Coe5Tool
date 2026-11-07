const {test} = require('node:test');
const assert = require('node:assert/strict');
const {weaponDefinition} = require('../creation');
const {specification, testPackage} = require('../melee');
const {harness} = require('./harness.cjs');

const base = {weaponName:'Ash Trial Bolt',range:'5',init:'5',dmgtype:'3',dmg:'0',aoe:'0',flymode:'1',flylook:'7'};
const source = (overrides = {}) => weaponDefinition({...base,...overrides}).text;

test('each supported sprite, physical or elemental type and optional target effect keeps its own source values', () => {
  for (const flylook of ['0','1','2','7']) for (const dmgtype of ['1','2','3','4','5','6']) for (const look of ['','34','68']) {
    const raw = '\uFEFF'+source({flylook,dmgtype,look}).replace(/\r\n/g,'\n');
    const candidate = testPackage(raw,'c5m','WB_Sprite','9');
    assert.equal(candidate.source,raw);
    assert.equal(candidate.manifest.kind,'private-ranged-v1');
    const [mod,lua] = candidate.files.map(file => file.text);
    assert.match(mod,/clearweapons\r\nrangedweapon 9 "Ash Trial Bolt"/);
    assert.ok(mod.includes('flymode 1\r\nflylook '+flylook+'\r\n'));
    assert.ok(mod.includes('dmgtype '+dmgtype+'\r\n'));
    assert.ok(lua.includes('sprite~='+flylook+' or impact~='+(look||'-1')));
    assert.match(lua,/monsterAttackType",carrier,0\)~=2/);
    assert.doesNotMatch(mod,/selectweapon|selectmonster|newspell|meleeweapon/);
    assert.doesNotMatch(lua,/fireTestField|setWeapon|standIn/);
  }
});

test('range or sprite alone cannot switch routes and unsupported settings remain exportable', () => {
  for (const fields of [{range:'1'},{range:'10'},{flymode:'',flylook:''},{flymode:'2'},
    {flylook:'3'},{look:'70'},{dmgtype:'9'},{aoe:'6'},{sound:'0'},{flysound:'-1'}]) {
    const raw = source(fields);
    assert.match(raw,/newweapon "Ash Trial Bolt"/);
    assert.throws(() => specification(raw,'c5m'));
  }
  for (const range of ['2','9']) assert.equal(specification(source({range}),'c5m').route,'ranged');
  assert.throws(() => specification(source()+'# custom command\r\n','c5m'));
  assert.throws(() => specification(source(),'c5se'));
  assert.equal(specification(source({range:'1',flymode:'',flylook:''}),'c5m').route,'melee');
});

test('native creator, setup, pending edits and fragment export use the explicitly selected projectile', async () => {
  const exports = [];
  const h = harness({example:false,desktop:{exportCopy:async (text,name) => { exports.push(text); return {name}; }}});
  const $ = h.$;
  await $('newDefinition').emit('click');
  assert.equal($('rangedStarter').hidden,true);
  await $('closeCreation').emit('click');
  $('target').value='vanilla'; await $('target').emit('change');
  await $('newDefinition').emit('click');
  assert.equal($('rangedStarter').hidden,false);
  $('create-weaponName').value=base.weaponName;
  $('create-dmg').value='6';
  assert.equal($('create-range').value,'1');
  await $('useProjectileSetup').emit('click');
  assert.equal($('create-dmg').value,'6');
  await $('creationForm').emit('submit');
  assert.match($('prepareTest').textContent,/Test ranged weapon with CoE5SE/);
  await $('prepareTest').emit('click');
  assert.match($('originalTestScope').textContent,/Ballista bolt #7.*Flame #68/);
  await $('testForm').emit('submit');
  assert.equal(h.window.CoePreparedTest().source,source({dmg:'6',look:'68'}));
  await $('closeTest').emit('click');
  $('field-flylook').value='1'; await $('field-flylook').emit('input');
  assert.equal($('prepareTest').disabled,true);
  await $('editForm').emit('submit');
  await $('download').emit('click');
  assert.deepEqual(exports,[source({dmg:'6',flylook:'1',look:'68'})]);
  assert.equal($('prepareTest').disabled,false);
});

