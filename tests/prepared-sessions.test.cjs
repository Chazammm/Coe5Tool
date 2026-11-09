const {test}=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs');
const row={id:'a'.repeat(32),revision:'b'.repeat(64),name:'Harbor Ember',source:'Harbor.c5m',mode:'Spell & weapon · forced-cast experiment',state:'unchecked',reason:'Check files first',review:false};
function setup(extra={}){const calls=[];return {calls,h:harness({desktop:{getPreparedSessions:async()=>[row,{...row,id:'c'.repeat(32),name:'Harbor Needle',state:'used',review:true,reason:'Already used'}],checkPreparedSession:async id=>({id,revision:row.revision,ready:true,state:'ready',detail:'Saved snapshot; draft unchanged',source:'newweapon "Harbor Ember"',mode:'c5se'}),startPreparedSession:async(id,revision)=>{calls.push({id,revision});return {instruction:'Cast once → Close → Quit.'};},...extra}})};}
test('prepared chooser searches name/ID/source, has honest empty states and shows exact snapshot',async()=>{
 const {h}=setup();await h.$('preparedTests').emit('click');assert.equal(h.$('preparedRows').children.length,2);
 for(const q of ['emb','aaaaaa','Harbor.c5m']){h.$('preparedSearch').value=q;await h.$('preparedSearch').emit('input');assert.ok(h.$('preparedRows').children.length>=1);}
 h.$('preparedSearch').value='no-such-test';await h.$('preparedSearch').emit('input');assert.match(h.$('preparedRows').textContent,/No matching/);
 h.$('preparedSearch').value='emb';await h.$('preparedSearch').emit('input');await h.$('preparedRows').children[0].emit('click');assert.equal(h.$('startPrepared').disabled,true);await h.$('checkPrepared').emit('click');assert.equal(h.$('startPrepared').disabled,false);assert.equal(h.$('preparedSource').textContent,'newweapon "Harbor Ember"');assert.match(h.$('preparedContext').textContent,/Harbor.c5m/);
});
test('resume leaves source, target and pending edits intact; Start is explicit and uses guarded resume route',async()=>{
 const {h,calls}=setup();h.$('field-range').value='11';await h.$('field-range').emit('input');const before=h.window.CoeWorkbenchSession.returnDraft();
 await h.$('preparedTests').emit('click');await h.$('preparedRows').children[0].emit('click');await h.$('checkPrepared').emit('click');assert.equal(calls.length,0);await h.$('startPrepared').emit('click');assert.deepEqual(calls,[{id:row.id,revision:row.revision}]);assert.equal(h.$('startPrepared').disabled,true);assert.deepEqual(h.window.CoeWorkbenchSession.returnDraft(),before);assert.equal(h.$('field-range').value,'11');assert.match(h.$('preparedReason').textContent,/not evidence of a cast/);await h.$('startPrepared').emit('click');assert.equal(calls.length,1);
});
test('unsafe sessions cannot start and review hands off without replacing the draft',async()=>{
 for(const state of ['stale','incompatible','incomplete','blocked']){const {h,calls}=setup({checkPreparedSession:async id=>({id,ready:false,state,detail:'Prepare a fresh test; files differ.'})});await h.$('preparedTests').emit('click');await h.$('preparedRows').children[0].emit('click');await h.$('checkPrepared').emit('click');await h.$('startPrepared').emit('click');assert.equal(calls.length,0);assert.equal(h.$('startPrepared').disabled,true);assert.match(h.$('preparedReason').textContent,/files differ/);}
 const {h}=setup();let reviewed;h.window.CoeOpenReturnForSession=id=>reviewed=id;const before=h.window.CoeWorkbenchSession.returnDraft().text;await h.$('preparedTests').emit('click');await h.$('preparedRows').children[1].emit('click');assert.equal(h.$('checkPrepared').hidden,true);await h.$('reviewPrepared').emit('click');assert.equal(reviewed,'c'.repeat(32));assert.equal(h.$('preparedDialog').open,false);assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,before);
});
test('refresh, selection change, closing or a launch refusal revokes the old ready state',async()=>{
 const {h,calls}=setup({startPreparedSession:async()=>{throw Error('A CoE5 session is already running.');}});await h.$('preparedTests').emit('click');await h.$('preparedRows').children[0].emit('click');await h.$('checkPrepared').emit('click');await h.$('startPrepared').emit('click');assert.equal(h.$('startPrepared').disabled,true);assert.match(h.$('preparedReason').textContent,/already running/);await h.$('checkPrepared').emit('click');await h.$('closePrepared').emit('click');assert.equal(h.$('startPrepared').disabled,true);assert.equal(calls.length,0);
 await h.$('preparedTests').emit('click');assert.equal(h.$('startPrepared').disabled,true);
});
test('unavailable desktop data is explained and the modal protects the editor from drops',async()=>{
 const h=harness();await h.$('preparedTests').emit('click');assert.match(h.$('preparedNotice').textContent,/Windows desktop app/);const before=h.window.CoeWorkbenchSession.returnDraft().text;await h.emitWindow('drop',{dataTransfer:{files:[{name:'x.c5m'}]}});assert.match(h.$('status').textContent,/Close the dialog/);assert.equal(h.window.CoeWorkbenchSession.returnDraft().text,before);
});
test('filtering away a ready selection clears its launch action and changing selection clears old feedback',async()=>{
 const {h,calls}=setup();await h.$('preparedTests').emit('click');await h.$('preparedRows').children[0].emit('click');await h.$('checkPrepared').emit('click');assert.equal(h.$('startPrepared').disabled,false);
 h.$('preparedSearch').value='Needle';await h.$('preparedSearch').emit('input');assert.equal(h.$('preparedDetail').hidden,true);assert.equal(h.$('startPrepared').disabled,true);await h.$('startPrepared').emit('click');assert.equal(calls.length,0);
 await h.$('preparedRows').children[0].emit('click');assert.doesNotMatch(h.$('preparedNotice').textContent,/Ready/);assert.match(h.$('preparedReason').textContent,/Already used/);
});
