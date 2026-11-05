/* Narrow native bridge. No arbitrary paths, process execution or generic filesystem API. */
(function () {
  'use strict';
  if(!window.chrome?.webview)return;
  const pending=new Map();let sequence=0;
  window.chrome.webview.addEventListener('message',event=>{
    const message=event.data,entry=pending.get(message?.id);if(!entry)return;
    pending.delete(message.id);clearTimeout(entry.timer);
    message.error?entry.reject(new Error(message.error)):entry.resolve(message.result);
  });
  function request(action,payload){
    return new Promise((resolve,reject)=>{
      const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(new Error('Desktop operation timed out. Check the native dialog; edits remain unsaved.'));},300000);
      pending.set(id,{resolve,reject,timer});window.chrome.webview.postMessage({id,action,payload});
    });
  }
  window.CoeDesktop=Object.freeze({openSource:()=>request('openSource'),exportCopy:(text,filename)=>request('exportCopy',{text,filename}),getLibrary:()=>request('getLibrary'),importNames:()=>request('importNames')});
})();
