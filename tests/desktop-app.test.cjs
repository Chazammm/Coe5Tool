const {test}=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs');
const native=(extra={})=>({openSource:async()=>null,exportCopy:async()=>null,getLibrary:async()=>null,importNames:async()=>null,...extra});
test('desktop import and native export preserve held source bytes and unsaved transitions',async()=>{
  const source='\uFEFF# retain\r\nnewweapon "W"\nrange\t5 # keep\rdmg 8',exports=[];
  const h=harness({desktop:native({openSource:async()=>({text:source,name:'original.c5m',mode:'c5m'}),exportCopy:async(text,filename)=>{exports.push({text,filename});return {name:filename};}})});
  assert.equal(h.$('browserOpen').hidden,true);assert.equal(h.$('desktopOpen').hidden,false);assert.equal(h.window.CoeDesktopState(),false);
  await h.$('desktopOpen').emit('click');h.$('field-range').value='9';await h.$('field-range').emit('input');assert.equal(h.window.CoeDesktopState(),true);
  await h.$('editForm').emit('submit');assert.equal(h.window.CoeDesktopState(),true);await h.$('download').emit('click');
  assert.equal(exports[0].text,source.replace('range\t5','range\t9'));assert.equal(exports[0].filename,'original.edited.c5m');
  assert.equal(h.window.CoeDesktopState(),false);assert.ok(h.$('draftState').textContent.includes('Exported copy'));assert.equal(h.downloads.length,0);
  await h.$('reset').emit('click');assert.equal(h.window.CoeDesktopState(),false);
});
test('cancelled and failed native export leave edits unsaved; cancelled import retains source',async()=>{
  const desktop=native(),h=harness({desktop});h.$('field-range').value='9';await h.$('field-range').emit('input');await h.$('editForm').emit('submit');
  const before=h.$('output').value;await h.$('download').emit('click');assert.equal(h.window.CoeDesktopState(),true);
  desktop.exportCopy=async()=>{throw new Error('Existing copy refused');};await h.$('download').emit('click');assert.ok(h.$('status').textContent.includes('refused'));assert.equal(h.window.CoeDesktopState(),true);
  await h.$('desktopOpen').emit('click');assert.equal(h.$('output').value,before);
});
test('an asynchronous export cannot mark newer source edits as saved',async()=>{
  let finish;const h=harness({desktop:native({exportCopy:()=>new Promise(resolve=>{finish=resolve;})})});
  h.$('field-range').value='9';await h.$('field-range').emit('input');await h.$('editForm').emit('submit');const saving=h.$('download').emit('click');
  h.$('field-range').value='10';await h.$('field-range').emit('input');finish({name:'copy.edited.c5se'});await saving;
  assert.equal(h.window.CoeDesktopState(),true);assert.equal(h.$('download').disabled,true);assert.ok(h.$('status').textContent.includes('Newer edits remain unsaved'));
});
test('reference selection stages a safe name without dropping other pending fields or changing source',async()=>{
  const h=harness({references:true});await h.ready;await h.$('definitions').children[1].emit('click');const before=h.$('output').value;
  h.$('field-weaponDamage').value='12';await h.$('field-weaponDamage').emit('input');assert.equal(h.$('useReference').disabled,false);
  await h.$('useReference').emit('click');assert.equal(h.$('field-weaponRef').value,'"Fireball"');assert.equal(h.$('field-weaponDamage').value,'12');assert.equal(h.$('output').value,before);
  await h.$('editForm').emit('submit');assert.equal(h.$('output').value,before.replace('weapon 8 "Workbench Magic Javelin"','weapon 12 "Fireball"'));
});
test('library labels, missing values, paging, filter and failed imports preserve source',async()=>{
  const text=JSON.stringify({spell:Array.from({length:23},(_,i)=>'Spell '+i),weapon:['Weapon <img src=x>']});
  const desktop=native({getLibrary:async()=>({text,gitBlob:'unknown'})}),h=harness({desktop,references:true});await h.ready;const before=h.$('output').value;
  assert.ok(h.$('referenceVersion').textContent.includes('not established'));assert.ok(h.$('referenceOrigin').textContent.includes('Unknown'));
  assert.equal(h.$('referenceFacts').textContent.includes('Not provided'),false);assert.ok(h.$('referenceMissing').textContent.includes('unavailable'));assert.equal(h.$('referenceEntries').children.length,20);
  await h.$('referenceNext').emit('click');assert.equal(h.$('referenceEntries').children.length,4);
  h.$('referenceType').value='weapon';await h.$('referenceType').emit('change');assert.equal(h.$('referenceName').textContent,'Weapon <img src=x>');assert.equal(h.$('referenceName').children.length,0);
  h.$('referenceSearch').value='none';await h.$('referenceSearch').emit('input');assert.ok(h.$('referenceEntries').textContent.includes('No matches'));
  desktop.importNames=async()=>({text:'invalid'});await h.$('importNames').emit('click');assert.ok(h.$('referenceStatus').classes.has('error'));assert.equal(h.$('output').value,before);
});
test('cached library errors retain the documented fallback and unknown inputs cannot gain authority',async()=>{
  const h=harness({desktop:native({getLibrary:async()=>{throw new Error('bad cache');}}),references:true});await h.ready;
  assert.equal(h.$('referenceName').textContent,'Fireball');assert.ok(h.$('referenceStatus').textContent.includes('Documented example retained'));
});
test('reference staging cannot bypass a missing or ambiguous spell assignment',async()=>{
  const h=harness({references:true});await h.ready;
  for(const source of ['newspell "S"\npath 3\nlevel 1\n','newspell "S"\npath 3\nlevel 1\nweapon 8 54\nweapon 9 55\n']){
    h.$('pasteText').value=source;await h.$('pasteForm').emit('submit');assert.equal(h.$('useReference').disabled,true);
    assert.throws(()=>h.window.CoeWorkbenchSession.stageWeaponName('Fireball'),/editable, explicit/);assert.equal(h.$('output').value,source);
  }
});
