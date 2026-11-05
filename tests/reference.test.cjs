const {test}=require('node:test'),assert=require('node:assert/strict'),api=require('../reference.js');
test('bundled documented example supplies an ID but no invented definition',()=>{
  const seed=api.seed();assert.equal(seed.complete,false);assert.equal(seed.entries.length,1);assert.equal(seed.entries[0].id,54);
  assert.deepEqual(seed.entries[0].fields,{});assert.ok(seed.verification.includes('not installed-game'));
});
test('exact upstream proof labels a partial historical name index with absent IDs',()=>{
  const c=api.parseIndex('{"spell":["Spell","Spell"],"weapon":["Weapon"]}',{gitBlob:api.knownBlob});
  assert.equal(c.entries.length,2);assert.equal(c.entries[0].origin,'vanilla');assert.equal(c.entries[0].id,null);assert.ok(c.version.includes('5.33'));assert.equal(c.complete,false);
});
test('arbitrary user indexes never acquire vanilla or extender provenance by self-labeling',()=>{
  const c=api.parseIndex('{"origin":"vanilla","version":"5.42","spell":["S"],"weapon":["W"]}');
  assert.equal(c.entries[0].origin,'unknown');assert.equal(c.version,'Version not established');assert.equal(c.url,null);
});
test('reference search filters by kind, case-insensitive names and known IDs',()=>{
  assert.equal(api.search(api.seed(),'54','weapon').length,1);assert.equal(api.search(api.seed(),'fireBALL','spell').length,0);
  const c=api.parseIndex('{"spell":["Frost"],"weapon":["Frost blade","Fire"]}');
  assert.deepEqual(api.search(c,'FROST','weapon').map(e=>e.name),['Frost blade']);
});
test('zero, missing data and unsupported quote syntax stay distinct',()=>{
  assert.equal(api.display(0),'0');assert.equal(api.display(null),'Not provided');assert.equal(api.display(undefined),'Not provided');
  assert.equal(api.quotedName({type:'weapon',name:'Fireball'}),'"Fireball"');
  for(const name of ['bad#name','bad"name','bad\\name','bad\nname','é'.repeat(32)])assert.throws(()=>api.quotedName({type:'weapon',name}));
  assert.throws(()=>api.quotedName({type:'spell',name:'S'}));
});
test('malformed, oversized and non-string name indexes are rejected',()=>{
  for(const text of ['{}','{"spell":[1],"weapon":[]}','{"spell":["a\\u0000b"],"weapon":[]}', 'x'.repeat(1024*1024+1)])assert.throws(()=>api.parseIndex(text));
});
