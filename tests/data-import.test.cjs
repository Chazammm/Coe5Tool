const {test}=require('node:test'),assert=require('node:assert/strict'),data=require('../data-import.js'),refs=require('../reference.js');
const weapon=(id=0,name='Test blade')=>'newweapon "'+name+'" # '+id+'\r\ntrgrank 1\nrange 1\ninit 2\ndmgtype 3\ndmg 0\naoe 0\nlook 0\n';
const spell=(id=0,name='Test spell')=>'newspell "'+name+'" # '+id+'\npath 3 # Test path.\nlevel 1\nweapon "Test blade" # nbr 0.\ndmg 9007199254740993\nslowcast\n';
test('historical metadata reader preserves explicit zero IDs/values and distinguishes spell fields',()=>{
 const w=data.readRecords(weapon(),'weapon',1)[0],s=data.readRecords(spell(),'spell',1)[0];
 assert.equal(w.id,0);assert.equal(w.fields.dmg,'0');assert.equal(w.fields.look,'0');assert.equal(s.fields.dmg,'9007199254740993');
 assert.equal(s.fields.weapon,'0');assert.equal(s.fields.weaponName,'Test blade');assert.deepEqual(s.listedFlags,['slowcast']);
 assert.equal(refs.property(w,'path').state,'notApplicable');assert.equal(refs.property(w,'flylook').state,'unavailable');assert.deepEqual(refs.property(w,'look'),{state:'known',value:'0'});
 assert.ok(!refs.details(w).primary.some(x=>x.key==='path'||x.key==='level'));assert.ok(refs.details(w).primary.some(x=>x.key==='dmg'&&x.value==='0'));
 assert.ok(refs.details(s).primary.some(x=>x.key==='weapon'&&x.value==='0 · Test blade'));assert.ok(!refs.details(s).advanced.some(x=>x.key==='look'));
});
test('duplicate names remain distinct records and numeric references use actual IDs',()=>{
 const records=data.readRecords(weapon(0)+weapon(1),'weapon',2).map(e=>({...e,verifiedRecord:true}));
 assert.equal(records.length,2);assert.equal(records[0].name,records[1].name);assert.notEqual(records[0].key,records[1].key);
 assert.equal(refs.referenceToken(records[1]),'1');assert.equal(refs.search({entries:records},'1','weapon')[0].id,1);
});
test('malformed counts, duplicate IDs and incomplete metadata are refused',()=>{
 for(const text of [weapon(0)+weapon(0),weapon(2),weapon().replace('dmg 0','dmg dice'),weapon().replace('range 1','range 1\nrange 2')])assert.throws(()=>data.readRecords(text,'weapon',1));
 assert.throws(()=>data.readRecords(spell().replace('level 1','level 4'),'spell',1));
});
test('only exact supported exports can acquire verified provenance; supplied hash claims are ignored',async()=>{
 await assert.rejects(data.parseFiles([{text:weapon(),sha256:Object.keys(data.profiles)[1]}]),/Unsupported reference fingerprint/);
 await assert.rejects(data.parseFiles([{text:spell().replace('5.33','5.42')}]),/Unsupported reference fingerprint/);
 await assert.rejects(data.parseFiles([]),/one spell export/);await assert.rejects(data.parseFiles([{}, {}, {}]),/one spell export/);
 await assert.rejects(data.digest('x'.repeat(2*1024*1024+1)),/2 MiB/);
});
test('effect links use explicit IDs, with no lookup inferred from matching names',()=>{
 const s={...data.readRecords(spell(),'spell')[0],verifiedRecord:true},w={...data.readRecords(weapon(),'weapon')[0],verifiedRecord:true};
 assert.equal(refs.effectWeapon({entries:[s,w]},s),w);assert.equal(refs.effectWeapon({entries:[s,{...w,id:7}]},s),undefined);
 assert.equal(refs.property(s,'look').state,'notApplicable');assert.ok(!refs.details(s).missing.includes('look'));
});
