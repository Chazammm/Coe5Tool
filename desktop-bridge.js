/* Narrow native bridge: file copies and the fingerprint-checked isolated test workflow only. */
(function () {
  'use strict';
  if(!window.chrome?.webview)return;
  const pending=new Map();let sequence=0;
  window.chrome.webview.addEventListener('message',event=>{
    const message=event.data,entry=pending.get(message?.id);if(!entry)return;
    pending.delete(message.id);clearTimeout(entry.timer);
    message.error?entry.reject(new Error(message.error)):entry.resolve(message.result);
  });
  function request(action,payload,files){
    return new Promise((resolve,reject)=>{
      const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(new Error('Desktop operation timed out. Check the native dialog; edits remain unsaved.'));},300000);
      pending.set(id,{resolve,reject,timer});try{if(files){if(typeof window.chrome.webview.postMessageWithAdditionalObjects!=='function')throw new Error('This WebView2 runtime cannot pass dropped files. Use Open mod file instead.');window.chrome.webview.postMessageWithAdditionalObjects({id,action,payload},files);}else window.chrome.webview.postMessage({id,action,payload});}catch(error){pending.delete(id);clearTimeout(timer);reject(error);}
    });
  }
  window.CoeDesktop=Object.freeze({openSource:()=>request('openSource'),openDroppedSource:files=>request('openDroppedSource',undefined,files),exportCopy:(text,filename)=>request('exportCopy',{text,filename}),exportTestPackage:(modId,files)=>request('exportTestPackage',{modId,files}),getLibrary:()=>request('getLibrary'),importNames:()=>request('importNames'),
    getTestRuntime:()=>request('getTestRuntime'),chooseTestRuntime:()=>request('chooseTestRuntime'),prepareTestSession:payload=>request('prepareTestSession',payload),
    startTestSession:(id,revision)=>request('startTestSession',{id,revision}),getTestSession:()=>request('getTestSession'),invalidateTestSession:id=>request('invalidateTestSession',{id}),
    openTestLogs:id=>request('openTestLogs',{id}),saveTestObservation:(id,outcome,note)=>request('saveTestObservation',{id,outcome,note}),
    getMixedTestValues:id=>request('getMixedTestValues',{id}),getStandaloneTargets:()=>request('getStandaloneTargets'),getTestSessions:()=>request('getTestSessions'),getTestValues:id=>request('getTestValues',{id}),getRuntimeChoices:id=>request('getRuntimeChoices',{id}),loadInstalledChoices:()=>request('loadInstalledChoices'),getChoiceData:()=>request('getChoiceData'),importChoiceData:()=>request('importChoiceData')});
})();
