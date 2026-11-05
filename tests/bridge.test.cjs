const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
test('native bridge correlates requests, preserves strings, rejects errors and exposes only narrow operations',async()=>{
  let receive;const sent=[],timers=new Map();let clock=0;
  const window={chrome:{webview:{addEventListener:(name,fn)=>{receive=fn;},postMessage:message=>sent.push(message)}}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../desktop-bridge.js'),'utf8'),{window,setTimeout:fn=>{const id=++clock;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id)});
  assert.deepEqual(Object.keys(window.CoeDesktop).sort(),['exportCopy','getLibrary','importNames','openSource']);
  const source='\uFEFFnewweapon "W"\r\nrange 5',request=window.CoeDesktop.exportCopy(source,'w.edited.c5m');
  assert.equal(sent[0].payload.text,source);receive({data:{id:999,result:'ignore'}});receive({data:{id:sent[0].id,result:{name:'copy'}}});assert.equal((await request).name,'copy');assert.equal(timers.size,0);
  const failure=window.CoeDesktop.openSource();receive({data:{id:sent[1].id,error:'Access refused'}});await assert.rejects(failure,/Access refused/);
  const timeout=window.CoeDesktop.getLibrary();timers.values().next().value();await assert.rejects(timeout,/timed out/);
});
test('ordinary browser context receives no native capabilities',()=>{
  const window={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../desktop-bridge.js'),'utf8'),{window});assert.equal(window.CoeDesktop,undefined);
});
