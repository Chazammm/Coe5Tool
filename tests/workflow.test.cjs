const {test}=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs');
const host=(extra={})=>({openSource:async()=>null,exportCopy:async()=>null,getLibrary:async()=>null,importNames:async()=>null,...extra});
test('untouched first use offers clear starts without a source, dirty draft or empty export',async()=>{
 const h=harness({example:false,references:true});await h.ready;
 assert.equal(h.$('fields').children.length,0);assert.equal(h.$('download').disabled,true);assert.equal(h.$('sourcePanel').hidden,true);assert.equal(h.$('sourceChecks').hidden,true);
 assert.equal(h.window.CoeDesktopState(),false);assert.equal(h.$('fileLabel').textContent,'No mod file open');
 assert.ok(h.$('selectedHeading').textContent.includes('Edit spells and weapons'));assert.ok(h.$('nextStep').textContent.includes('Open a mod file or Try example'));
 assert.equal(h.$('step-source').getAttribute('aria-current'),'step');await h.$('download').emit('click');assert.equal(h.downloads.length,0);
 await h.$('browseReferences').emit('click');assert.equal(h.document.activeElement,h.$('referenceSearch'));assert.equal(h.$('useReference').disabled,true);
 assert.ok(h.$('referenceUseHelp').textContent.includes('Open a mod file or Try example'));
});
test('Try example is explicit, labeled a fragment, and selectable without a tutorial',async()=>{
 const h=harness({example:false,references:true});await h.ready;await h.$('exampleButton').emit('click');
 assert.equal(h.$('fileLabel').textContent,'example.c5se');assert.equal(h.$('sourceKind').textContent,'Example fragment');assert.equal(h.$('exampleNotice').hidden,false);
 assert.equal(h.$('blockCount').textContent,'2');assert.equal(h.$('sourcePanel').hidden,false);assert.equal(h.window.CoeDesktopState(),false);
 h.$('assignmentSpell').value='1';await h.$('assignmentSpell').emit('change');assert.equal(h.$('selectedHeading').textContent,'Workbench Javelin');
 assert.ok(h.$('typeBadge').textContent.includes('Spell'));assert.equal(h.$('useReference').disabled,false);
});
test('native open from empty state shows file identity and preserves held mixed-EOL source',async()=>{
 const text='\uFEFF# keep\r\nnewweapon "Mine"\nrange\t5 # keep\rdmg 8';let saved;
 const h=harness({example:false,desktop:host({openSource:async()=>({text,name:'mine.c5m',mode:'c5m'}),exportCopy:async(text,filename)=>{saved={text,filename};return {name:filename};}})});
 await h.$('desktopOpen').emit('click');assert.equal(h.$('sourceKind').textContent,'Original retained');assert.equal(h.$('exampleNotice').hidden,true);
 assert.equal(h.$('fileLabel').textContent,'mine.c5m');h.$('field-range').value='9';await h.$('field-range').emit('input');
 assert.ok(h.$('nextStep').textContent.includes('not applied'));assert.equal(h.$('step-edit').getAttribute('aria-current'),'step');assert.equal(h.$('download').disabled,true);
 await h.$('editForm').emit('submit');assert.ok(h.$('nextStep').textContent.includes('Review changes'));assert.equal(h.$('step-review').getAttribute('aria-current'),'step');
 await h.$('reviewSource').emit('click');assert.equal(h.$('sourcePanel').open,true);await h.$('download').emit('click');
 assert.deepEqual(saved,{text:text.replace('range\t5','range\t9'),filename:'mine.edited.c5m'});assert.ok(h.$('nextStep').textContent.includes('copy was exported'));
 assert.equal(h.$('step-export').getAttribute('aria-current'),'step');assert.equal(h.window.CoeDesktopState(),false);
});
test('cancelled native open leaves first-use state intact',async()=>{
 const h=harness({example:false,desktop:host()});await h.$('desktopOpen').emit('click');assert.equal(h.$('fileLabel').textContent,'No mod file open');assert.equal(h.$('download').disabled,true);
});
test('assignment names both participants and previews only the field that will change',async()=>{
 const h=harness({references:true});await h.ready;
 assert.equal(h.$('useReference').disabled,true);assert.ok(h.$('referenceUseHelp').textContent.includes('Choose a spell'));
 h.$('assignmentSpell').value='1';await h.$('assignmentSpell').emit('change');const before=h.$('output').value,damage=h.$('field-weaponDamage');
 damage.value='17';await damage.emit('input');assert.equal(h.$('assignmentSpell').disabled,true);assert.equal(h.$('useReference').disabled,false);
 assert.ok(h.$('assignmentTarget').textContent.includes('Workbench Javelin'));assert.ok(h.$('assignmentHeading').textContent.includes('Fireball'));
 assert.ok(h.$('assignmentPreview').textContent.includes('"Workbench Magic Javelin" → "Fireball"'));assert.ok(h.$('referenceUseHelp').textContent.includes('only Weapon reference'));
 await h.$('useReference').emit('click');assert.equal(h.$('field-weaponDamage'),damage);assert.equal(damage.value,'17');assert.equal(h.$('output').value,before);
 assert.equal(h.$('useReference').disabled,true);assert.ok(h.$('useReference').textContent.includes('Apply changes'));assert.ok(h.$('referenceUseHelp').textContent.includes('not applied'));
 await h.$('editForm').emit('submit');assert.equal(h.$('output').value,before.replace('weapon 8 "Workbench Magic Javelin"','weapon 17 "Fireball"'));
 assert.equal(h.$('useReference').textContent,'Already assigned');assert.ok(h.$('referenceUseHelp').textContent.includes('already in the draft'));
});
test('pending edits cannot be discarded through the destination spell picker',async()=>{
 const h=harness({references:true});await h.ready;h.$('field-range').value='10';await h.$('field-range').emit('input');
 h.$('assignmentSpell').value='1';await h.$('assignmentSpell').emit('change');assert.equal(h.$('selectedHeading').textContent,'Workbench Magic Javelin');
 assert.equal(h.$('field-range').value,'10');assert.equal(h.$('assignmentSpell').value,'');assert.ok(h.$('referenceUseHelp').textContent.includes('Apply or discard'));
});
test('missing and ambiguous assignments explain how to proceed without enabling unsafe edits',async()=>{
 const h=harness({references:true});await h.ready;
 for(const source of ['newspell "S"\npath 3\nlevel 1\n','newspell "S"\npath 3\nlevel 1\nweapon 8 54\nweapon 9 55\n']){
  h.$('pasteText').value=source;await h.$('pasteForm').emit('submit');assert.equal(h.$('useReference').disabled,true);
  assert.ok(h.$('referenceUseHelp').textContent.includes('no safely editable weapon assignment'));assert.ok(h.$('referenceUseHelp').textContent.includes('text editor'));
  assert.equal(h.$('assignmentSpell').value,'0');assert.equal(h.$('output').value,source);
 }
});
test('an opened file with no supported sections stays reviewable and distinguishes an empty source from no file',async()=>{
 const h=harness({example:false});h.$('pasteText').value='';await h.$('pasteForm').emit('submit');
 assert.equal(h.$('sourceKind').textContent,'Pasted text');assert.equal(h.$('download').disabled,false);assert.equal(h.$('sourcePanel').hidden,false);
 assert.ok(h.$('selectedHeading').textContent.includes('No supported'));assert.ok(h.$('nextStep').textContent.includes('Review the retained text'));
});
test('choose from library guides a selected spell to weapons while keeping pending input',async()=>{
 const h=harness({references:true});await h.ready;await h.$('definitions').children[1].emit('click');
 h.$('field-weaponDamage').value='12';await h.$('field-weaponDamage').emit('input');const before=h.$('output').value;
 await h.$('findWeapon').emit('click');assert.equal(h.$('referenceType').value,'weapon');assert.equal(h.document.activeElement,h.$('referenceSearch'));
 assert.equal(h.$('field-weaponDamage').value,'12');assert.equal(h.$('output').value,before);
});
test('name-only spell references explain why they cannot be assigned and retain provenance limits',async()=>{
 const h=harness({references:true,desktop:host({getLibrary:async()=>({text:'{"spell":["Cloud"],"weapon":["Echo"]}'})})});await h.ready;
 h.$('assignmentSpell').value='1';await h.$('assignmentSpell').emit('change');
 assert.equal(h.$('referenceKind').textContent,'Spell reference');assert.equal(h.$('useReference').disabled,true);
 assert.ok(h.$('referenceUseHelp').textContent.includes('Only this spell’s name is known'));assert.ok(h.$('referenceMissing').textContent.includes('Name only'));
 assert.ok(h.$('referenceVersionWarning').textContent.includes('unknown'));assert.ok(!h.$('referenceFacts').textContent.includes('Not provided'));
 h.$('referenceType').value='weapon';await h.$('referenceType').emit('change');assert.equal(h.$('referenceKind').textContent,'Weapon reference');assert.equal(h.$('useReference').disabled,false);
});
test('next-step guidance does not suggest absent spells or editing an entirely read-only definition',async()=>{
 const h=harness({example:false});h.$('pasteText').value='newweapon "Only weapon"\nrange 5\n';await h.$('pasteForm').emit('submit');
 assert.ok(h.$('nextStep').textContent.includes('Apply changes'));assert.ok(!h.$('nextStep').textContent.includes('select a source spell'));
 h.$('pasteText').value='newweapon "Unsafe # header"\nrange 5\n';await h.$('pasteForm').emit('submit');
 assert.ok(h.$('nextStep').textContent.includes('read-only'));assert.equal(h.$('step-review').getAttribute('aria-current'),'step');assert.equal(h.$('field-range').disabled,true);
});
