const {test}=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs'),data=require('../data-import.js');
const native=packet=>({openSource:async()=>null,exportCopy:async()=>null,getLibrary:async()=>packet,importNames:async()=>packet});
const w={key:'weapon:0',id:0,name:'Repeated',type:'weapon',origin:'vanilla',verifiedRecord:true,sourceLine:1,listedFlags:[],fields:{dmg:'0',range:'1',dmgtype:'2',aoe:'0',look:'0'}};
const s={key:'spell:0',id:0,name:'Test spell',type:'spell',origin:'vanilla',verifiedRecord:true,sourceLine:1,listedFlags:[],fields:{path:'3',level:'1',dmg:'8',weapon:'0',weaponName:'Repeated'}};
const catalog={kind:'data533',label:'Test export',version:'5.33 test fixture',verification:'Stubbed parser output; synthetic values',datasets:[],entries:[s,w,{...w,id:1,key:'weapon:1'}]};
test('typed reference details omit inapplicable rows and summarize absent data once',async()=>{
 const h=harness({references:true,desktop:native({kind:'data533',files:[]}),dataImporter:{parseFiles:async()=>catalog}});await h.ready;
 assert.ok(h.$('referenceFacts').textContent.includes('Magic path'));assert.ok(!h.$('referenceFacts').textContent.includes('Impact look'));
 await h.$('followReference').emit('click');assert.equal(h.$('referenceName').textContent,'Repeated');
 assert.ok(!h.$('referenceFacts').textContent.includes('Magic path'));assert.ok(!h.$('referenceFacts').textContent.includes('Level'));
 assert.ok(h.$('referenceFacts').textContent.includes('Base damage0'));assert.ok(h.$('referenceAdvancedFacts').textContent.includes('Impact look0'));
 assert.ok(h.$('referenceMissing').textContent.includes('unavailable'));assert.ok(!h.$('referenceFacts').textContent.includes('Not provided'));
});
test('explicit historical weapon ID staging keeps pending damage and unrelated source bytes',async()=>{
 const h=harness({references:true,desktop:native({kind:'data533',files:[]}),dataImporter:{parseFiles:async()=>catalog}});await h.ready;
 await h.$('definitions').children[1].emit('click');const before=h.$('output').value;
 h.$('field-weaponDamage').value='13';await h.$('field-weaponDamage').emit('input');await h.$('followReference').emit('click');await h.$('useReference').emit('click');
 assert.equal(h.$('field-weaponRef').value,'0');assert.equal(h.$('field-weaponDamage').value,'13');assert.equal(h.$('output').value,before);
 await h.$('editForm').emit('submit');assert.equal(h.$('output').value,before.replace('weapon 8 "Workbench Magic Javelin"','weapon 13 0'));assert.equal(h.window.CoeDesktopState(),true);
});
test('invalid advanced source fields are expanded and focused on submit',async()=>{
 const h=harness();assert.equal(h.$('visualFields').open,false);h.$('field-flylook').value='invalid';await h.$('field-flylook').emit('input');await h.$('editForm').emit('submit');
 assert.equal(h.$('visualFields').open,true);assert.equal(h.document.activeElement,h.$('field-flylook'));assert.equal(h.$('download').disabled,true);
});
test('rejected metadata import retains the previous library and dirty source',async()=>{
 const h=harness({references:true,desktop:native({kind:'data533',files:[{text:'unknown version'}]})});await h.ready;
 assert.equal(h.$('referenceName').textContent,'Fireball');h.$('field-range').value='9';await h.$('field-range').emit('input');
 const before=h.$('output').value;await h.$('importNames').emit('click');assert.equal(h.$('field-range').value,'9');assert.equal(h.$('output').value,before);assert.equal(h.window.CoeDesktopState(),true);
 assert.ok(h.$('referenceStatus').textContent.includes('fingerprint'));assert.equal(h.$('referenceName').textContent,'Fireball');
});
test('cache validation and a new import cannot race while source editing stays available',async()=>{
 let resolve,calls=0;const host=native(null);host.getLibrary=()=>new Promise(done=>{resolve=done;});host.importNames=async()=>{calls++;return null;};
 const h=harness({references:true,desktop:host});assert.equal(h.$('importNames').disabled,true);
 h.$('field-range').value='9';await h.$('field-range').emit('input');await h.$('importNames').emit('click');assert.equal(calls,0);
 resolve(null);await h.ready;assert.equal(h.$('importNames').disabled,false);assert.equal(h.$('field-range').value,'9');assert.equal(h.window.CoeDesktopState(),true);
});
