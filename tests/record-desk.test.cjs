// Actual script behavior in the DOM adapter; no rendered desktop claim.
const {test}=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs');

test('optional help opens and closes by keyboard without touching a pending form',async()=>{
 const h=harness(),before=h.$('output').value,input=h.$('field-range');input.value='11';await input.emit('input');
 assert.equal(h.$('helpPanel').hidden,true);await h.emitWindow('keydown',{key:'F1'});
 assert.equal(h.$('helpPanel').hidden,false);assert.equal(h.$('helpButton').getAttribute('aria-expanded'),'true');assert.equal(h.document.activeElement,h.$('helpHeading'));
 let prevented=false;await h.$('helpPanel').emit('keydown',{key:'Escape',preventDefault(){prevented=true;}});
 assert.equal(prevented,true);assert.equal(h.$('helpPanel').hidden,true);assert.equal(h.$('helpButton').getAttribute('aria-expanded'),'false');assert.equal(h.document.activeElement,h.$('helpButton'));
 assert.equal(h.$('field-range'),input);assert.equal(input.value,'11');assert.equal(input.classes.has('changed'),true);assert.equal(h.$('output').value,before);assert.equal(h.window.CoeDesktopState(),true);
 await h.$('helpButton').emit('click');await h.$('closeHelp').emit('click');assert.equal(h.$('helpPanel').hidden,true);
});

test('help shortcut leaves a modal paste session alone',async()=>{
 const h=harness({example:false});await h.$('pasteButton').emit('click');await h.emitWindow('keydown',{key:'F1'});
 assert.equal(h.$('helpPanel').hidden,true);assert.equal(h.$('pasteDialog').open,true);assert.equal(h.document.activeElement,h.$('pasteText'));
});

test('reference drawer is available without onboarding and restores focus when closed',async()=>{
 const h=harness({example:false,references:true});await h.ready;
 assert.equal(h.$('referencePanel').hidden,true);assert.equal(h.$('browseReferences').getAttribute('aria-expanded'),'false');
 await h.$('browseReferences').emit('click');assert.equal(h.$('referencePanel').hidden,false);assert.equal(h.$('workspace').classes.has('reference-open'),true);assert.equal(h.document.activeElement,h.$('referenceSearch'));
 await h.$('referencePanel').emit('keydown',{key:'Escape'});assert.equal(h.$('referencePanel').hidden,true);assert.equal(h.document.activeElement,h.$('browseReferences'));
 assert.equal(h.$('workspace').classes.has('reference-open'),false);assert.equal(h.window.CoeDesktopState(),false);assert.equal(h.$('download').disabled,true);
 await h.$('browseReferences').emit('click');await h.$('browseReferences').emit('click');assert.equal(h.$('referencePanel').hidden,true);
});

test('spell lookup opens the drawer, preserves all pending fields and returns to the lookup',async()=>{
 const h=harness({references:true});await h.ready;await h.$('definitions').children[1].emit('click');
 const damage=h.$('field-weaponDamage'),before=h.$('output').value;damage.value='21';await damage.emit('input');
 await h.$('findWeapon').emit('click');assert.equal(h.$('referencePanel').hidden,false);assert.equal(h.$('referenceType').value,'weapon');
 await h.$('useReference').emit('click');assert.equal(h.$('field-weaponDamage'),damage);assert.equal(damage.value,'21');assert.equal(h.$('field-weaponRef').value,'"Fireball"');assert.equal(h.$('field-weaponRef').classes.has('changed'),true);assert.equal(h.$('output').value,before);
 await h.$('closeReferences').emit('click');assert.equal(h.document.activeElement,h.$('findWeapon'));assert.equal(h.$('download').disabled,true);
 await h.$('reviewSource').emit('click');assert.equal(h.$('output').value,before);assert.ok(h.$('sourceState').textContent.includes('Unapplied'));
 await h.$('editForm').emit('submit');assert.equal(h.$('output').value,before.replace('weapon 8 "Workbench Magic Javelin"','weapon 21 "Fireball"'));assert.equal(h.$('field-weaponRef').classes.has('changed'),false);
});

test('closing and reopening references keeps the selected record, filter and draft',async()=>{
 const h=harness({references:true});await h.ready;await h.$('browseReferences').emit('click');
 h.$('referenceSearch').value='Fire';await h.$('referenceSearch').emit('input');const name=h.$('referenceName').textContent;
 h.$('field-range').value='9';await h.$('field-range').emit('input');await h.$('closeReferences').emit('click');await h.$('browseReferences').emit('click');
 assert.equal(h.$('referenceSearch').value,'Fire');assert.equal(h.$('referenceName').textContent,name);assert.equal(h.$('field-range').value,'9');assert.ok(h.$('referenceVersionWarning').textContent.includes('not verified'));
});

test('disabled copy and form actions explain empty, clean and unapplied states',async()=>{
 const h=harness({example:false});assert.ok(h.$('reviewHelp').textContent.includes('Open or paste'));assert.equal(h.$('reviewSource').disabled,true);
 await h.$('exampleButton').emit('click');assert.equal(h.$('apply').disabled,true);assert.ok(h.$('apply').title.includes('No field edits'));assert.ok(h.$('exportHelp').textContent.includes('new file'));
 h.$('field-range').value='12';await h.$('field-range').emit('input');assert.equal(h.$('download').disabled,true);assert.ok(h.$('exportHelp').textContent.includes('Apply or discard'));assert.ok(h.$('reviewHelp').textContent.includes('pending field edits are excluded'));
 assert.equal(h.$('download').getAttribute('aria-describedby'),'exportHelp');assert.equal(h.$('useReference').getAttribute('aria-describedby'),'referenceUseHelp');
});
