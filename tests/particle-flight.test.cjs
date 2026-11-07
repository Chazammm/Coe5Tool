const test = require('node:test');
const assert = require('node:assert/strict');
const melee = require('../melee');
const choices = require('../choices');
const {weaponDefinition} = require('../creation');
const {harness} = require('./harness.cjs');
const base = {weaponName:'Rime Trial Needle',range:'5',init:'5',dmgtype:'3',dmg:'0',aoe:'0',flymode:'2',flylook:'97'};
const source = (changes={}) => weaponDefinition({...base,...changes}).text;
const prepare = text => melee.testPackage(text,'c5m','WB_Particle','8');

test('particle candidates retain exact source and separate flight, strike and damage settings',()=>{
  const available = choices.documented().filter(e=>e.type==='effect');
  for(const [id,name] of Object.entries(melee.particleFlights)){
    assert.ok(available.some(e=>String(e.id)===id && e.name===name));
    for(const look of ['','34','68']){
      const raw = '\uFEFF'+source({flylook:id,look}).replace(/\r\n/g,'\n');
      const candidate = prepare(raw);
      const [mod,lua] = candidate.files.map(f=>f.text);
      assert.equal(candidate.source,raw);
      assert.match(mod,/rangedweapon 8 "Rime Trial Needle"/);
      assert.match(mod,/dmgtype 3\r\ndmg 0/);
      assert.ok(lua.includes('mode~=2 or flight~='+id+' or impact~='+(look||'-1')));
      assert.ok(lua.includes('flightName~='+JSON.stringify(name)));
      assert.ok(mod.includes('flymode 2\r\nflylook '+id+'\r\n'));
      assert.equal(mod.includes('\r\nlook '),Boolean(look));
    }
  }
});

test('unsupported flight IDs, modes and impacts never become a different weapon',()=>{
  for(const fields of [{flylook:'7'}, {flylook:'66'}, {flylook:'88'}, {flylook:'0'},
    {flymode:'1'}, {flymode:'3'}, {look:'65'}, {dmgtype:'7'}, {range:'1'}]){
    const raw=source(fields);
    assert.match(raw,/newweapon "Rime Trial Needle"/);
    assert.throws(()=>prepare(raw));
  }
  const cfg={type:'effect',particleFlights:melee.particleFlights};
  const known={type:'effect',id:97,name:'Icy Breath (fly)',sourceKind:'runtime'};
  assert.equal(choices.allowed(known,cfg),'');
  for(const bad of [{name:'Other name'},{sourceKind:'unknown'},{type:'projectile'},{id:88}]){
    assert.ok(choices.allowed({...known,...bad},cfg));
  }
});

test('cancel, partial-name search and selection affect only the stated creator fields',async()=>{
  const h=harness({example:false}),$=h.$;
  await h.ready;
  await $('newDefinition').emit('click');assert.equal($('particleStarter').hidden,true);
  await $('closeCreation').emit('click');
  $('target').value='vanilla';await $('target').emit('change');
  await $('newDefinition').emit('click');assert.equal($('particleStarter').hidden,false);
  $('create-weaponName').value=base.weaponName;
  $('create-look').value='34';$('create-dmgtype').value='2';$('create-dmg').value='6';
  await $('chooseParticleFlight').emit('click');
  await $('closeChoices').emit('click');
  assert.equal($('create-range').value,'1');assert.equal($('create-flylook').value,'');
  $('create-range').value='7';
  await $('chooseParticleFlight').emit('click');
  $('choiceQuery').value='Boulder Impact';await $('choiceQuery').emit('input');
  assert.equal($('useChoice').disabled,true);assert.match($('choiceResults').textContent,/No supported particle/);
  $('choiceQuery').value='icy';await $('choiceQuery').emit('input');
  assert.match($('choiceCount').textContent,/1 match ·/);await $('useChoice').emit('click');
  assert.equal($('create-flymode').value,'2');assert.equal($('create-flylook').value,'97');
  assert.equal($('create-range').value,'7');assert.equal($('create-look').value,'34');
  await $('creationForm').emit('submit');await $('prepareTest').emit('click');
  assert.match($('originalTestScope').textContent,/Icy Breath \(fly\) #97.*Blood Burst #34/);
  await $('testForm').emit('submit');
  assert.equal(h.window.CoePreparedTest().source,source({range:'7',look:'34',dmgtype:'2',dmg:'6'}));
});

