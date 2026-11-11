const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {harness}=require('./harness.cjs');
const tick=()=>new Promise(r=>setImmediate(r));
test('runtime and session diagnostics retain identity without replacing the source or pending edits',async()=>{
 const h=harness({desktop:{getLibrary:async()=>null,getTestRuntime:async()=>({compatible:true,version:'3.2.2',label:'CoE5 5.43 / CoE5SE 3.2.2',detail:'Verified selected files'}),getTestSession:async()=>({id:'b'.repeat(32),spell:'Earlier trial',status:'exited',pid:123456,observation:'unclear'}),getTestSessions:async()=>[]}});await h.ready;
 await h.$('prepareTest').emit('click');await tick();
 h.$('field-range').value='17';await h.$('field-range').emit('input');
 const before=JSON.stringify(h.window.CoeWorkbenchSession.returnDraft());
 assert.match(h.$('testRuntime').textContent,/Ready:.*3\.2\.2/);
 assert.match(h.$('runtimeDiagnostics').textContent,/Verified selected files/);
 assert.doesNotMatch(h.$('sessionSummary').textContent,/PID|123456|rollback|helper|schema/);
 assert.match(h.$('sessionDiagnostics').textContent,/123456/);
 assert.equal(h.$('field-range').value,'17');assert.equal(JSON.stringify(h.window.CoeWorkbenchSession.returnDraft()),before);
 assert.equal(h.$('startTestSession').disabled,true);
});
test('release setup is self-contained, versioned and keeps dependencies explicit',async()=>{
 const h=harness({example:false,desktop:{getLibrary:async()=>null,getTestSessions:async()=>[]}});await h.ready;
 assert.equal(h.$('runtimeLabel').textContent,require('../package.json').version);
 const read=f=>fs.readFileSync(require('node:path').join(__dirname,'..',f),'utf8');
 assert.match(read('desktop/Workbench.csproj'),/<TargetFramework>net10\.0-windows<\/TargetFramework>/);
 assert.match(read('Build-Desktop.ps1'),/--self-contained true/);
 assert.doesNotMatch(read('Start-Workbench.cmd'),/desktop-018-preview|NET 8/);
 assert.match(read('docs/START-HERE.html'),/cases were observed on 3\.3\.0/);
 assert.match(read('docs/USER-GUIDE-018.md'),/not automatically restored/);
});
