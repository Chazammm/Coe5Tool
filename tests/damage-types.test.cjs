'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const damage=require('../damage-types.js'),creation=require('../creation.js'),ret=require('../return-values.js'),core=require('../core.js'),choices=require('../choices.js'),{harness}=require('./harness.cjs');
const spec={spellName:'Damage Trial',weaponName:'Damage Trial',path:'3',level:'1',weaponDamage:'8',dmg:'8',dmgtype:'4',range:'6',init:'1',aoe:'0',look:'7',flymode:'2',flylook:'7'};
const opts={modId:'WB_Damage',caster:'Spearman',enemy:'Spearman',count:'1',weaponEditing:true};
function packet(s,selected=Number(s.dmgtype),modern=true){
 const source=creation.definition(s,'c5se').text;
 return {context:{sessionId:'a'.repeat(32),run:'b'.repeat(32),sourceRevision:crypto.createHash('sha256').update('c5se\0'+source).digest('hex'),source,mode:'c5se',spellName:s.spellName,weaponName:s.weaponName,legacy:false,resultSchema:2,damagePolicy:modern?'documented-v1':'legacy-3-4',baseline:{dmgtype:s.dmgtype,aoe:s.aoe,look:s.look,flymode:s.flymode,flylook:s.flylook}},runtimeBaseline:{look:7,flymode:2,flylook:7},samples:[{index:1,panel:1,parameterRevision:1,castCount:0,readBackConfirmed:true,kind:'applied',values:{dmgtype:selected,aoe:1,look:7,flymode:2,flylook:7}}]};
}
test('all documented types are searchable/selectable and manual requirements stay explicit',()=>{
 assert.equal(damage.data.types.length,25);
 for(const p of damage.data.types){const e=choices.documented().find(e=>e.type==='dmgtype'&&e.id===p.id);assert.ok(e);assert.equal(choices.allowed(e,{type:'dmgtype',creator:true}),'');assert.equal(choices.search([e],'#'+p.id).length,1);if(p.kind==='manual')assert.match(damage.hint(p.id),/creation\/export only/);}
 assert.match(damage.hint(11),/phantasm/);assert.match(damage.hint(8),/morale/);
});
test('all scalar types generate both spell formats and native weapons and prepare without substitution',()=>{
 for(let id=1;id<=10;id++)for(const mode of ['c5m','c5se']){
  const s={...spec,dmgtype:String(id)},pair=creation.definition(s,mode),pkg=creation.testPackage(pair.text,mode,opts),weapon=creation.weaponDefinition(s);
  assert.match(pair.text,new RegExp('dmgtype '+id+'\r\n'));assert.equal(pkg.manifest.definitions.dmgtype,String(id));assert.equal(pkg.manifest.experiment,'weapon-edit-v4');assert.equal(creation.fromDraft(pair.text,mode).dmgtype,String(id));assert.doesNotMatch(weapon.text,/newspell|#!@|requires/);
 }
});
test('documented mask combinations preserve high bits and animate requires its documented selectors',()=>{
 for(const type of [12,13]){
  const rows=damage.options(type),mask=(BigInt(rows.at(-1).value)|BigInt(rows[0].value)).toString();assert.ok(BigInt(mask)>2147483647n);
  const s={...spec,dmgtype:String(type),dmg:mask,weaponDamage:mask};
  for(const mode of ['c5m','c5se']){const text=creation.definition(s,mode).text;assert.ok(text.includes('dmg '+mask+'\r\n'));assert.ok(text.includes('weapon '+mask+' "'));assert.equal(creation.testPackage(text,mode,opts).manifest.definitions.weaponDamage,mask);}
  assert.throws(()=>creation.definition({...s,dmg:'0'},'c5se'),/nonzero/);
 }
 assert.throws(()=>damage.payload(12,'131072'),/documented/);assert.throws(()=>damage.payload(13,'16384'),/documented/);
 for(const value of ['1','2']){const text=creation.definition({...spec,dmgtype:'25',dmg:value,weaponDamage:value},'c5se').text;assert.equal(core.inspect(text,'c5se').blocks[0].fields.find(f=>f.key==='dmg').value,value);assert.throws(()=>creation.testPackage(text,'c5se',opts),/terrain targets/);}
 for(const value of ['0','3','-1','1.5','1\n','9007199254740993'])assert.throws(()=>damage.payload(25,value));
});
test('manual special payloads require acknowledgement, export literally, and cannot be prepared for testing',()=>{
 for(const p of damage.data.types.filter(p=>p.kind==='manual')){
  const s={...spec,dmgtype:String(p.id),dmg:'999',weaponDamage:'999'};assert.throws(()=>creation.definition(s,'c5m'),/acknowledgement/);
  const pair=creation.definition({...s,manualDamage:true},'c5m');assert.ok(pair.text.includes('dmgtype '+p.id+'\r\n'));assert.throws(()=>creation.testPackage(pair.text,'c5m',opts),/Creation\/export only/);assert.match(creation.weaponDefinition({...s,manualDamage:true}).text,/dmg 999/);
 }
 assert.throws(()=>creation.definition({...spec,dmgtype:'26',manualDamage:true},'c5m'),/documented/);assert.throws(()=>damage.payload(11,'9223372036854775808',true),/64-bit/);
});
test('new scalar results round trip while legacy results retain their restricted contract',async()=>{
 for(let id=1;id<=10;id++){
  const s={...spec,dmgtype:String(id)},p=await ret.validatePacket(packet(s,id===10?1:id+1)),sample=p.samples[0],h=harness({example:false});h.window.CoeWorkbenchSession.openGenerated(creation.definition(s,'c5se'));
  const review=h.window.CoeWorkbenchSession.previewTestReturn(p.context,sample);h.window.CoeWorkbenchSession.applyTestReturn(review,['dmgtype'],[]);const expected=creation.definition({...s,dmgtype:String(sample.values.dmgtype)},'c5se').text;assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,expected);assert.equal(h.$('download').disabled,false);
 }
 await assert.rejects(ret.validatePacket(packet(spec,5,false)),/Unsupported test values/);await ret.validatePacket(packet(spec,3,false));
});
test('special test types stay baseline-only and return cannot reinterpret a newer payload type',async()=>{
 for(const [type,value]of [[12,'4294967297'],[13,'4294967297']]){
  const s={...spec,dmgtype:String(type),dmg:value,weaponDamage:value},p=await ret.validatePacket(packet(s)),h=harness({example:false});h.window.CoeWorkbenchSession.openGenerated(creation.definition(s,'c5se'));
  const review=h.window.CoeWorkbenchSession.previewTestReturn(p.context,p.samples[0]);h.window.CoeWorkbenchSession.applyTestReturn(review,['aoe'],[]);assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,creation.definition({...s,aoe:'1'},'c5se').text);
  await assert.rejects(ret.validatePacket(packet(s,3)),/Unsupported test values/);
  h.$('field-dmgtype').value='3';await h.$('field-dmgtype').emit('input');const conflict=h.window.CoeWorkbenchSession.previewTestReturn(p.context,p.samples[0]);assert.equal(conflict.rows.find(r=>r.key==='dmgtype').available,false);
 }
});
test('creator mask builder searches names, keeps high bits, changes only its chosen input and retains selection focus',async()=>{
 const h=harness({example:false});await h.$('newDefinition').emit('click');assert.equal(h.$('create-dmgtype').children.length,26);
 h.$('create-dmgtype').value='12';await h.$('create-dmgtype').emit('change');h.$('create-dmg').value='0';h.$('create-weaponDamage').value='8';await h.$('chooseWeaponPayload').emit('click');h.$('payloadSearch').value='ghost';await h.$('payloadSearch').emit('input');
 const box=h.$('payloadRows').children[0].children[0];box.focus();box.checked=true;await box.emit('change');assert.equal(h.document.activeElement,box);assert.equal(h.$('payloadValue').textContent,'1099511627776');await h.$('usePayload').emit('click');assert.equal(h.$('create-dmg').value,'1099511627776');assert.equal(h.$('create-weaponDamage').value,'8');assert.equal(h.document.activeElement,h.$('create-dmg'));
 h.$('create-dmgtype').value='18';await h.$('create-dmgtype').emit('change');assert.equal(h.$('manualDamageOption').hidden,false);assert.match(h.$('damageTypeHelp').textContent,/creation\/export only/);
});
test('documented mask policy data is identical in its browser module and native JSON input',()=>{
 assert.deepEqual(require('../damage-data.js'),require('../damage-data.json'));
 for(const type of [12,13])for(const row of damage.options(type))assert.equal(BigInt(row.value),1n<<BigInt(row.bit));
});
