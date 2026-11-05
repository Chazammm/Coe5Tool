// Actual application logic in a DOM adapter; not a native browser test.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {harness}=require('./harness.cjs');

test('actual app starts with linked example and clean draft',()=>{
  const h=harness();assert.equal(h.$('blockCount').textContent,'2');assert.equal(h.$('selectedHeading').textContent,'Workbench Magic Javelin');
  assert.equal(h.$('apply').disabled,true);assert.ok(h.$('output').value.includes('newspell "Workbench Javelin"'));
});
test('form edit disables download, then applies one exact source token',async()=>{
  const h=harness(),before=h.$('output').value;h.$('field-range').value='9';await h.$('field-range').emit('input');assert.equal(h.$('download').disabled,true);
  await h.$('editForm').emit('submit');assert.equal(h.$('output').value,before.replace('range 6','range 9'));assert.equal(h.$('original').value,before);assert.equal(h.$('changeCount').textContent,'1 change');assert.equal(h.$('download').disabled,false);
});
test('selection and invalid level handling use the spell form',async()=>{
  const h=harness();await h.$('definitions').children[1].emit('click');assert.equal(h.$('selectedHeading').textContent,'Workbench Javelin');
  assert.ok(h.$('matches').textContent.includes('Exact name matches'));const before=h.$('output').value;
  h.$('field-level').value='4';await h.$('field-level').emit('input');await h.$('editForm').emit('submit');
  assert.equal(h.$('output').value,before);assert.ok(h.$('status').textContent.includes('1, 2 or 3'));assert.equal(h.$('download').disabled,true);
  await h.$('discard').emit('click');assert.equal(h.$('field-level').value,'1');
});
test('linked weapon section is navigable without resolving an effective game ID',async()=>{
  const h=harness();await h.$('definitions').children[1].emit('click');const link=h.$('matches').children.find(e=>e.tagName==='button');
  await link.emit('click');assert.equal(h.$('selectedHeading').textContent,'Workbench Magic Javelin');
});
test('import-edit-download uses held UTF-8 bytes rather than normalized textarea text',async()=>{
  const h=harness(),source='\uFEFF# original\r\nnewweapon "Preserve"\nrange\t5 # comment\rdmg 8';
  const bytes=Buffer.from(source,'utf8');h.$('openFile').files=[{name:'preserve.c5m',size:bytes.length,arrayBuffer:async()=>bytes}];await h.$('openFile').emit('change');
  h.$('field-range').value='7';await h.$('field-range').emit('input');await h.$('editForm').emit('submit');await h.$('download').emit('click');
  assert.equal(h.downloads[0].filename,'preserve.edited.c5m');assert.deepEqual(Buffer.from(await h.downloads[0].blob.arrayBuffer()),Buffer.from(source.replace('range\t5','range\t7'),'utf8'));
  assert.notEqual(h.$('output').value,source.replace('range\t5','range\t7'));
});
test('invalid UTF-8 and oversized files do not replace the current source',async()=>{
  const h=harness(),before=h.$('output').value;
  h.$('openFile').files=[{name:'bad.c5m',size:2,arrayBuffer:async()=>Uint8Array.from([255,255])}];await h.$('openFile').emit('change');assert.equal(h.$('output').value,before);
  h.$('openFile').files=[{name:'huge.c5m',size:3*1024*1024}];await h.$('openFile').emit('change');assert.equal(h.$('output').value,before);assert.ok(h.$('status').textContent.includes('Nothing was truncated'));
});
test('paste workflow, unknown directive barrier and reset are wired',async()=>{
  const h=harness();await h.$('pasteButton').emit('click');assert.equal(h.$('pasteDialog').open,true);
  const source='newweapon "Opaque"\nrange 5\nplugin_opaque 7\ndmg 8\n';h.$('pasteText').value=source;await h.$('pasteForm').emit('submit');assert.equal(h.$('pasteDialog').open,false);assert.equal(h.$('field-dmg').disabled,true);
  h.$('field-range').value='6';await h.$('field-range').emit('input');await h.$('editForm').emit('submit');await h.$('reset').emit('click');assert.equal(h.$('output').value,source);assert.equal(h.$('changeCount').textContent,'0 changes');
});
test('dirty fields prevent silent selection changes and user names stay text nodes',async()=>{
  const h=harness();h.$('field-range').value='7';await h.$('field-range').emit('input');await h.$('definitions').children[1].emit('click');assert.equal(h.$('selectedHeading').textContent,'Workbench Magic Javelin');
  await h.$('discard').emit('click');h.$('pasteText').value='newweapon "<img src=x>"\ndmg 8\n';await h.$('pasteForm').emit('submit');assert.equal(h.$('selectedHeading').textContent,'<img src=x>');assert.equal(h.$('selectedHeading').children.length,0);
});
test('interpretation changes do not silently rename the downloaded file format',async()=>{
  const h=harness();h.$('mode').value='c5m';await h.$('mode').emit('change');await h.$('download').emit('click');assert.equal(h.downloads[0].filename,'example.edited.c5se');
});

test('library search and type filter retain source order and show a clear empty state',async()=>{
  const h=harness();h.$('search').value='jAvElIn';await h.$('search').emit('input');assert.equal(h.$('definitions').children.length,2);
  h.$('typeFilter').value='spell';await h.$('typeFilter').emit('change');assert.equal(h.$('definitions').children.length,1);
  assert.ok(h.$('definitions').textContent.includes('Workbench Javelin'));assert.ok(h.$('filterCount').textContent.includes('selected definition is filtered out'));
  await h.$('definitions').children[0].emit('click');assert.equal(h.$('selectedHeading').textContent,'Workbench Javelin');
  assert.equal(h.$('definitions').children[0].getAttribute('aria-current'),'true');
  h.$('search').value='does not exist';await h.$('search').emit('input');assert.ok(h.$('definitions').textContent.includes('No matching definitions'));
  assert.equal(h.$('selectedHeading').textContent,'Workbench Javelin');
  await h.$('clearFilters').emit('click');assert.equal(h.$('definitions').children.length,2);assert.equal(h.document.activeElement,h.$('search'));
});
test('filtering does not rebuild dirty inputs or silently switch the editor',async()=>{
  const h=harness(),input=h.$('field-range');input.value='12';await input.emit('input');
  h.$('typeFilter').value='spell';await h.$('typeFilter').emit('change');assert.equal(h.$('field-range'),input);assert.equal(input.value,'12');
  await h.$('definitions').children[0].emit('click');assert.equal(h.$('selectedHeading').textContent,'Workbench Magic Javelin');
  assert.equal(h.$('download').disabled,true);assert.ok(h.$('status').classes.has('error'));
  await h.$('editForm').emit('submit');assert.equal(h.$('field-range').value,'12');assert.ok(h.$('filterCount').textContent.includes('filtered out'));
  await h.$('definitions').children[0].emit('click');assert.equal(h.$('selectedHeading').textContent,'Workbench Javelin');
});
test('reverting a field clears unapplied state without applying a no-op',async()=>{
  const h=harness();h.$('field-range').value='9';await h.$('field-range').emit('input');assert.ok(h.$('draftState').textContent.includes('Unapplied'));
  h.$('field-range').value='6';await h.$('field-range').emit('input');assert.equal(h.$('apply').disabled,true);assert.equal(h.$('download').disabled,false);
  assert.ok(h.$('draftState').textContent.includes('no draft changes'));
});
test('source disclosure opens on review without applying or discarding field edits',async()=>{
  const h=harness(),before=h.$('output').value;assert.equal(h.$('sourcePanel').open,false);
  h.$('field-range').value='11';await h.$('field-range').emit('input');await h.$('reviewSource').emit('click');
  assert.equal(h.$('sourcePanel').open,true);assert.equal(h.document.activeElement,h.$('output'));assert.equal(h.$('output').value,before);
  assert.ok(h.$('sourceState').textContent.includes('Unapplied field edits are not included'));assert.equal(h.$('download').disabled,true);
  await h.$('editForm').emit('submit');assert.equal(h.$('sourcePanel').open,true);assert.ok(h.$('output').value.includes('range 11'));
  h.$('sourcePanel').open=false;assert.equal(h.$('field-range').value,'11');assert.equal(h.$('download').disabled,false);
});
test('field feedback is associated, visible and focused on failed form submission',async()=>{
  const h=harness();await h.$('definitions').children[1].emit('click');assert.equal(h.document.activeElement,h.$('selectedHeading'));
  h.$('field-level').value='4';await h.$('field-level').emit('input');
  assert.equal(h.$('field-level').getAttribute('aria-invalid'),'true');assert.equal(h.$('error-level').hidden,false);
  assert.ok(h.$('field-level').getAttribute('aria-describedby').includes('error-level'));await h.$('editForm').emit('submit');
  assert.equal(h.document.activeElement,h.$('field-level'));assert.ok(h.$('status').classes.has('error'));assert.equal(h.$('status').getAttribute('role'),'status');
  h.$('field-level').value='2';await h.$('field-level').emit('input');assert.equal(h.$('error-level').hidden,true);
  await h.$('editForm').emit('submit');assert.equal(h.document.activeElement,h.$('field-level'));assert.ok(h.$('draftState').textContent.includes('Applied draft'));
});
test('optional missing level insertion is explicit, reviewed and exported byte exactly',async()=>{
  const h=harness(),source='\uFEFF  #!@ newspell "S"\r\n#!@path 3\r#!@weapon 8 54',bytes=Buffer.from(source);
  h.$('openFile').files=[{name:'level.c5m',size:bytes.length,arrayBuffer:async()=>bytes}];await h.$('openFile').emit('change');
  assert.equal(h.$('field-level').disabled,false);assert.equal(h.$('field-level').value,'');assert.ok(h.$('help-level').textContent.includes('insert a line'));
  assert.equal(h.$('apply').disabled,true);h.$('field-level').value='2';await h.$('field-level').emit('input');
  await h.$('editForm').emit('submit');assert.ok(h.$('changes').textContent.includes('Add spell level: insert'));
  await h.$('download').emit('click');const expected=source.replace('\r\n','\r\n  #!@ level 2\r\n');
  assert.deepEqual(Buffer.from(await h.downloads[0].blob.arrayBuffer()),Buffer.from(expected));
  await h.$('reset').emit('click');assert.equal(h.$('field-level').value,'');assert.ok(h.$('draftState').textContent.includes('no draft changes'));
});
test('unsafe missing level stays disabled with an explanation; weapon VFX are grouped',async()=>{
  const h=harness();assert.equal(h.$('fields').children.length,3);assert.ok(h.$('fields').children[2].textContent.includes('Visuals & sound'));
  assert.ok(h.$('help-flylook').textContent.includes('sprite ID'));assert.equal(h.$('spellVfxNote').hidden,true);
  h.$('pasteText').value='newspell "S"\npath 3\nweapon 8 54\nslowcast\n';await h.$('pasteForm').emit('submit');
  assert.equal(h.$('field-level').disabled,true);assert.ok(h.$('help-level').textContent.includes('Other commands'));assert.equal(h.$('spellVfxNote').hidden,false);
});
test('declining replacement retains dirty form and source; interpretation is also guarded',async()=>{
  const h=harness(),before=h.$('output').value;h.$('field-range').value='9';await h.$('field-range').emit('input');h.window.confirm=()=>false;
  await h.$('exampleButton').emit('click');assert.equal(h.$('field-range').value,'9');assert.equal(h.$('output').value,before);
  h.$('mode').value='c5m';await h.$('mode').emit('change');assert.equal(h.$('mode').value,'c5se');assert.equal(h.$('field-range').value,'9');
});
test('native keyboard controls, labels and skip target are declared without positive tab order',()=>{
  const h=harness();assert.match(h.html,/<a class="skip-link" href="#selectedHeading">/);assert.equal(h.$('selectedHeading').getAttribute('tabindex'),'-1');
  assert.equal(h.$('search').getAttribute('type'),'search');assert.equal(h.$('typeFilter').tagName,'select');assert.equal(h.$('sourcePanel').tagName,'details');
  assert.match(h.html,/<summary>/);assert.match(h.html,/<label for="search"/);assert.match(h.html,/<label for="typeFilter"/);
  assert.doesNotMatch(h.html,/tabindex="[1-9]/);assert.equal(h.$('field-range').getAttribute('aria-describedby'),'help-range error-range');
});
test('a file without supported sections retains its source and useful empty state',async()=>{
  const h=harness(),s='# manual source\nnewmonster "M"\n';h.$('pasteText').value=s;await h.$('pasteForm').emit('submit');
  assert.equal(h.$('blockCount').textContent,'0');assert.ok(h.$('definitions').textContent.includes('No supported sections'));
  assert.equal(h.$('fields').children.length,0);assert.equal(h.$('apply').hidden,true);assert.equal(h.$('output').value,s);
  await h.$('download').emit('click');assert.equal(await h.downloads[0].blob.text(),s);
});
