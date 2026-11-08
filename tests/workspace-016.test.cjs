const {test}=require('node:test'),assert=require('node:assert/strict'),core=require('../core.js'),overview=require('../source-overview.js'),{harness}=require('./harness.cjs');
const mixed='\uFEFF# retained\r\nnewweapon "Same"\nrange\t5 # first\rdmg 8\r\nnewweapon "Same"\ndmg 9\n#!@newspell "Spark"\r\n#!@path 3\n#!@level 1\n#!@weapon 8 "Same"\nnewmonster "Uninspected"\nunknown_mod_command 77';
const file=(name,text=mixed)=>({name,size:Buffer.byteLength(text),arrayBuffer:async()=>Buffer.from(text)});
async function open(h,name='mixed.c5m',text=mixed){h.$('openFile').files=[file(name,text)];await h.$('openFile').emit('change');}
async function target(h,value){h.$('target').value=value;await h.$('target').emit('change');}
test('Vanilla scopes the index/overview, discloses retained spells, and preserves edits, bytes and format',async()=>{
 const h=harness({example:false});await open(h);const input=h.$('field-range');input.value='9';await input.emit('input');await target(h,'vanilla');
 assert.equal(h.$('definitions').children.length,2);assert.equal(h.$('typeFilter').children.some(e=>e.value==='spell'),false);assert.match(h.$('retainedContentNote').textContent,/1 CoE5SE spell definition is retained/);assert.equal(h.$('field-range'),input);assert.equal(input.value,'9');assert.equal(h.$('mode').value,'c5m');assert.equal(h.$('prepareTest').hidden,false);assert.equal(h.$('prepareTest').disabled,true);assert.match(h.$('prepareTest').textContent,/with CoE5SE/);assert.equal(h.$('returnTestValues').textContent,'SE test values');
 await h.$('inspectAllSource').emit('click');assert.equal(h.$('definitions').children.length,3);assert.equal(h.$('typeFilter').children.some(e=>e.value==='spell'),true);assert.equal(h.$('field-range'),input);assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,mixed);
 await h.$('discard').emit('click');await h.$('definitions').children[2].emit('click');assert.match(h.$('selectionTargetNote').textContent,/Existing CoE5SE spell/);await target(h,'coe5se');assert.equal(h.$('selectionTargetNote').hidden,true);assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,mixed);
});
test('file format is detected and advanced; empty Vanilla paste/example and creator use native format',async()=>{
 const h=harness({example:false});await target(h,'vanilla');assert.equal(h.$('mode').value,'c5m');assert.match(h.$('formatSummary').textContent,/Paste format: .c5m/);assert.equal(h.$('sourceFormatDetails').open,false);await h.$('exampleButton').emit('click');assert.ok(!h.window.CoeWorkbenchSession.returnDraft().text.includes('newspell'));
 await open(h,'sidecar.c5se','newweapon "W"\ndmg 5');assert.equal(h.$('mode').value,'c5se');assert.match(h.$('formatSummary').textContent,/requires CoE5SE/);assert.match(h.$('selectionTargetNote').textContent,/sidecar requires CoE5SE/);
 h.$('mode').value='c5m';await h.$('mode').emit('change');assert.match(h.$('formatOverrideNote').textContent,/exported extension remain unchanged/);assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,'newweapon "W"\ndmg 5');
 await h.$('newDefinition').emit('click');assert.equal(h.$('creationFormatControls').hidden,true);assert.equal(h.$('nativeCreationFormat').hidden,false);
});
test('SE-prefixed weapon commands are preserved but not labeled as ordinary native source',async()=>{
 const text='#!@newweapon "SE Weapon"\n#!@dmg 8\n#!@range 6',h=harness({example:false});await target(h,'vanilla');await open(h,'prefixed.c5m',text);assert.match(h.$('typeBadge').textContent,/SE-prefixed/);assert.match(h.$('selectionTargetNote').textContent,/Vanilla skips/);assert.match(h.$('definitions').textContent,/SE-prefixed/);assert.equal(overview.rows(core.inspect(text,'c5m'),'weapon')[0].extenderLines,true);assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,text);
});
test('overview shows duplicate locations, ambiguous/external relationships and explicit fields without assuming defaults',()=>{
 const model=core.inspect(mixed,'c5m'),weapons=overview.rows(model,'weapon','same'),spells=overview.rows(model,'spell','spark');assert.equal(weapons.length,2);assert.notEqual(weapons[0].line,weapons[1].line);assert.match(weapons[1].secondary,/Range —/);assert.equal(spells[0].links.length,2);assert.match(spells[0].relationship,/ambiguous/);assert.equal(overview.rows(model,'spell','','vanilla','target').length,0);assert.equal(overview.rows(model,'spell','','vanilla','all').length,1);
 const external=core.inspect('#!@newspell "External"\n#!@path 3\n#!@level 1\n#!@weapon 8 54','c5m');assert.match(overview.rows(external,'spell')[0].relationship,/unresolved/);
 assert.equal(overview.rows(model,'weapon','line:'+weapons[1].line).length,1);assert.equal(overview.rows(model,'weapon','line:99999').length,0);
});
test('overview identifies a documented type once and labels zero, one and multiple search results clearly',async()=>{
 const text='newweapon "Desktop alpha"\ndmgtype 3\ndmg 8\nnewweapon "Desktop beta"\ndmgtype 4\ndmg 9';
 const rows=overview.rows(core.inspect(text,'c5m'),'weapon');assert.equal(rows[0].primary,'pierce · #3 · payload 8');assert.equal(rows[1].primary,'fire · #4 · payload 9');
 const h=harness({example:false});await open(h,'desktop.c5m',text);await h.$('openOverview').emit('click');await h.$('overviewWeapons').emit('click');
 for(const [query,label] of [['desktop','2 matches'],['alpha','1 match ·'],['missing','0 matches']]){h.$('overviewSearch').value=query;await h.$('overviewSearch').emit('input');assert.ok(h.$('overviewSummary').textContent.startsWith(label));assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,text);}
});

test('normal launcher, standard package and desktop/source version identify the same current application',()=>{
 const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..'),version=require('../package.json').version;
 assert.equal(require('../creation.js').version,version);assert.ok(fs.readFileSync(path.join(root,'desktop/Workbench.csproj'),'utf8').includes('<Version>'+version+'</Version>'));
 const launcher=fs.readFileSync(path.join(root,'Start-Workbench.cmd'),'utf8'),build=fs.readFileSync(path.join(root,'Build-Desktop.ps1'),'utf8'),target=launcher.match(/%~dp0(build\\[^"\r\n]+)\\CoE5Workbench\.exe/)[1];assert.ok(build.includes('-o '+target));assert.ok(build.includes('CoE5Workbench-'+version+'-win-x64.zip'));
});
test('large mixed source opens into paged searchable overviews and returns to the same query/page/scroll',async()=>{
 let text='# big mixed mod\r\ninclude "unresolved.c5m"\r\n';for(let i=0;i<120;i++)text+='newweapon "Weapon '+i+'"\r\ndmg '+(i+1)+'\r\nrange 6\r\n#!@newspell "Spell '+i+'"\r\n#!@path 3\r\n#!@level 1\r\n#!@weapon 8 "Weapon '+i+'"\r\n';text+='newmonster "Unknown"\r\nopaque 91';
 const h=harness({example:false});await open(h,'large.c5m',text);assert.equal(h.$('sourceOverview').hidden,false);assert.equal(h.$('overviewRows').children.length,40);await h.$('overviewWeapons').emit('click');await h.$('overviewNext').emit('click');h.$('overviewScroll').scrollTop=180;const button=h.$('overviewRows').children[3].children[0].children[0];await button.emit('click');assert.equal(h.$('sourceOverview').hidden,true);assert.match(h.$('selectedHeading').textContent,/Weapon 43/);await h.$('backToOverview').emit('click');assert.match(h.$('overviewPage').textContent,/Page 2/);assert.equal(h.$('overviewScroll').scrollTop,180);
 h.$('overviewSearch').value='Weapon 117';await h.$('overviewSearch').emit('input');assert.equal(h.$('overviewRows').children.length,1);await h.$('overviewRows').children[0].children[0].children[0].emit('click');h.$('field-range').value='9';await h.$('field-range').emit('input');const input=h.$('field-range');await h.$('backToOverview').emit('click');assert.equal(h.$('overviewSearch').value,'Weapon 117');assert.equal(h.$('overviewPending').hidden,false);await h.$('overviewRows').children[0].children[0].children[0].emit('click');assert.equal(h.$('field-range'),input);assert.equal(input.value,'9');await h.$('overviewDetail').emit('click');assert.equal(h.$('field-range'),input);assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,text);
 await h.$('editForm').emit('submit');assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,text.replace('"Weapon 117"\r\ndmg 118\r\nrange 6','"Weapon 117"\r\ndmg 118\r\nrange 9'));
});
test('browser drop gives feedback, preserves BOM/EOLs and rejects multiple/unsupported/invalid files',async()=>{
 const h=harness({example:false});await h.emitWindow('dragenter',{dataTransfer:{types:['Files']}});assert.equal(h.$('dropFeedback').hidden,false);await h.emitWindow('dragleave',{dataTransfer:{types:[]}});assert.equal(h.$('dropFeedback').hidden,true);await h.emitWindow('dragenter',{dataTransfer:{types:['Files']}});await h.emitWindow('drop',{dataTransfer:{files:[file('dragged.c5m')]}});assert.equal(h.$('dropFeedback').hidden,true);assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,mixed);
 for(const files of [[file('a.c5m'),file('b.c5m')],[file('x.zip')],[{name:'bad.c5m',size:2,arrayBuffer:async()=>Buffer.from([255,255])}],[file('binary.c5m','\0')],[{name:'huge.c5m',size:2*1024*1024+1}]]){await h.emitWindow('drop',{dataTransfer:{files}});assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,mixed);assert.equal(h.$('status').classes.has('error'),true);}
});
test('native drops use attached files and preserve unsaved drafts when replacement is declined',async()=>{
 let reads=0;const h=harness({desktop:{openDroppedSource:async files=>{reads++;assert.equal(files[0].name,'new.c5se');return {name:'new.c5se',mode:'c5se',text:'newweapon "New"\ndmg 6'};}}});h.$('field-range').value='9';await h.$('field-range').emit('input');const before=h.window.CoeWorkbenchSession.returnDraft().text;h.window.confirm=()=>false;
 await h.emitWindow('drop',{dataTransfer:{files:[file('new.c5se')]}});assert.equal(reads,0);assert.equal(h.$('field-range').value,'9');assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,before);
 h.window.confirm=()=>true;await h.emitWindow('drop',{dataTransfer:{files:[file('new.c5se')]}});assert.equal(reads,1);assert.equal(h.$('fileLabel').textContent,'new.c5se');assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,'newweapon "New"\ndmg 6');
});
test('untouched pasted text stays unsaved until confirmed export and cannot be replaced silently',async()=>{
 let reads=0,save=false;const h=harness({example:false,desktop:{openDroppedSource:async()=>{reads++;return {text:'newweapon "Other"',name:'other.c5m',mode:'c5m'};},exportCopy:async()=>save?{name:'pasted-copy.c5se'}:null}});
 const text='newweapon "Pasted"\r\nrange 5';h.$('pasteText').value=text;await h.$('pasteForm').emit('submit');const held=h.window.CoeWorkbenchSession.returnDraft().text;assert.equal(h.window.CoeDesktopState(),true);assert.match(h.$('draftState').textContent,/Pasted draft · not exported/);h.window.confirm=()=>false;
 await h.emitWindow('drop',{dataTransfer:{files:[file('other.c5m')]}});assert.equal(reads,0);assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,held);await h.$('download').emit('click');assert.equal(h.window.CoeDesktopState(),true);
 save=true;await h.$('download').emit('click');assert.equal(h.window.CoeDesktopState(),false);assert.match(h.$('draftState').textContent,/Exported copy/);
});
test('edits made during asynchronous reading require a new explicit replacement decision; dialogs block drops',async()=>{
 let resolve;const h=harness(),before=h.window.CoeWorkbenchSession.returnDraft().text;const pending=h.emitWindow('drop',{dataTransfer:{files:[{name:'slow.c5m',size:10,arrayBuffer:()=>new Promise(r=>resolve=r)}]}});h.$('field-range').value='11';await h.$('field-range').emit('input');h.window.confirm=()=>false;resolve(Buffer.from('newweapon "Other"'));await pending;assert.equal(h.$('field-range').value,'11');assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,before);
 h.$('pasteDialog').open=true;await h.emitWindow('drop',{dataTransfer:{files:[file('blocked.c5m')]}});assert.match(h.$('status').textContent,/Close the dialog/);assert.equal(h.$('field-range').value,'11');
});
