const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
test('native bridge correlates requests, preserves strings, rejects errors and exposes only narrow operations',async()=>{
  let receive;const sent=[],timers=new Map();let clock=0;
  const window={chrome:{webview:{addEventListener:(name,fn)=>{receive=fn;},postMessage:message=>sent.push(message)}}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../desktop-bridge.js'),'utf8'),{window,setTimeout:fn=>{const id=++clock;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id)});
  assert.deepEqual(Object.keys(window.CoeDesktop).sort(),['checkPreparedSession','chooseTestRuntime','exportCopy','exportTestPackage','getChoiceData','getLibrary','getMixedTestValues','getPreparedSessions','getRuntimeChoices','getStandaloneTargets','getTestRuntime','getTestSession','getTestSessions','getTestValues','importChoiceData','importNames','invalidateTestSession','loadInstalledChoices','openDroppedSource','openPreparedLogs','openSource','openTestLogs','prepareTestSession','saveTestObservation','startPreparedSession','startTestSession']);
  const source='\uFEFFnewweapon "W"\r\nrange 5',request=window.CoeDesktop.exportCopy(source,'w.edited.c5m');
  assert.equal(sent[0].payload.text,source);receive({data:{id:999,result:'ignore'}});receive({data:{id:sent[0].id,result:{name:'copy'}}});assert.equal((await request).name,'copy');assert.equal(timers.size,0);
  const failure=window.CoeDesktop.openSource();receive({data:{id:sent[1].id,error:'Access refused'}});await assert.rejects(failure,/Access refused/);
  const timeout=window.CoeDesktop.getLibrary();timers.values().next().value();await assert.rejects(timeout,/timed out/);
});
test('ordinary browser context receives no native capabilities',()=>{
  const window={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../desktop-bridge.js'),'utf8'),{window});assert.equal(window.CoeDesktop,undefined);
});
test('drop bridge passes DOM File attachments separately from JSON and reports unavailable runtime support',async()=>{
 let receive,message,attachments;const window={chrome:{webview:{addEventListener:(_,fn)=>receive=fn,postMessageWithAdditionalObjects:(m,f)=>{message=m;attachments=f;}}}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../desktop-bridge.js'),'utf8'),{window,setTimeout:()=>1,clearTimeout(){}});
 const files=[{name:'one.c5m'}],request=window.CoeDesktop.openDroppedSource(files);assert.equal(message.action,'openDroppedSource');assert.equal(message.payload,undefined);assert.equal(attachments,files);receive({data:{id:message.id,result:{name:'one.c5m'}}});assert.equal((await request).name,'one.c5m');
 delete window.chrome.webview.postMessageWithAdditionalObjects;await assert.rejects(window.CoeDesktop.openDroppedSource(files),/Use Open mod file/);
});
