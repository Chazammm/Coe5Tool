(function(){
  'use strict';const $=id=>document.getElementById(id),api=window.CoeEffects,host=window.CoeDesktop;
  let runtime,targets=[],selected,prepared,preparedReady=false,busy=false,epoch=0;
  const status=text=>{$('effectsStatus').textContent=text;};
  function controls(){
    $('effectsPrepare').disabled=busy||!api.runtimes.includes(runtime?.version)||!runtime?.compatible||!selected;
    $('effectsStart').disabled=busy||!preparedReady||!prepared||prepared.status!=='prepared'||prepared.stale===true||!runtime?.compatible||runtime.version!==prepared.runtimeVersion;
    $('effectsRuntimeChoose').disabled=busy||!host;$('effectsTargetSearch').disabled=busy;$('effectsTargetList').disabled=busy;$('effectsCount').disabled=busy;
    $('effectsRefresh').disabled=busy||!prepared;
  }
  function options(){
    const list=$('effectsTargetList');list.replaceChildren();const rows=api.filter(targets,$('effectsTargetSearch').value);
    for(const row of rows){const o=document.createElement('option');o.value=String(row.id);o.textContent=row.name+' · #'+row.id+' · HP '+row.hp;list.append(o);}
    if(selected&&rows.some(r=>r.id===selected.id))list.value=String(selected.id);else list.value='';
    $('effectsTargetHint').textContent=(rows.length?rows.length+' native targets · verified local 5.43 catalog':'No matching targets. Clear search or choose your verified game files.')+(selected?' · Selected: '+selected.name+' #'+selected.id:' · Select a target.');
  }
  async function refreshRuntime(){
    runtime=await host.getTestRuntime();$('effectsRuntime').textContent=runtime.label;$('effectsRuntimeDetail').textContent=runtime.detail;
    targets=[];selected=null;
    if(runtime.compatible&&api.runtimes.includes(runtime.version)){const packet=await host.getStandaloneTargets();targets=packet.entries||[];selected=targets.find(r=>r.id===13&&r.name==='Spearman')||null;}
    options();controls();
    if(!api.runtimes.includes(runtime.version))status('Choose pinned official CoE5SE 3.4.4 or dev 3.5.0.0 (9d74ae4) for Test Effects. Other dev builds and stable 3.5.0 have separate fingerprints and are not accepted.');
  }
  async function open(){
    preparedReady=false;$('effectsResult').textContent='';$('effectsHistory').replaceChildren();
    $('effectsDialog').showModal();$('effectsSummary').textContent=api.intro;status('Choose your game files, then prepare. Starting the game is a separate action.');
    if(!host){status('Open the Windows desktop application to prepare an isolated Test Effects session. No game or assets are bundled.');controls();return;}
    busy=true;controls();try{await refreshRuntime();const current=await host.getTestSession();prepared=current?.effectsBrowser?current:null;preparedReady=false;
      if(prepared){
        const t=prepared.target,match=t&&targets.find(r=>r.id===t.id&&r.name===t.name);
        selected=match||null;if(t)$('effectsCount').value=String(t.count);options();
        const check=prepared.status==='prepared'?await host.checkPreparedSession(prepared.id):null;preparedReady=check?.ready===true;
        status((check&&!check.ready?check.detail+' ':prepared.instruction+' ')+' Saved target: '+(t?t.name+' #'+t.id+' ×'+t.count:'unavailable')+'. Recheck through Prepared tests before resuming an older preparation.');
      }}catch(e){status(e.message);}finally{busy=false;controls();}
  }
  async function invalidate(){const prior=prepared;prepared=null;preparedReady=false;$('effectsStart').disabled=true;if(prior)await host.invalidateTestSession(prior.id);}
  for(const id of ['testEffects','startEffects'])$(id).addEventListener('click',open);
  $('closeEffects').addEventListener('click',()=>{$('effectsDialog').close();});
  $('effectsRuntimeChoose').addEventListener('click',async()=>{busy=true;controls();try{const value=await host.chooseTestRuntime();if(value){await invalidate();await refreshRuntime();}}catch(e){status(e.message);}finally{busy=false;controls();}});
  $('effectsTargetSearch').addEventListener('input',async()=>{if(selected&&!api.filter(targets,$('effectsTargetSearch').value).some(r=>r.id===selected.id)){selected=null;await invalidate();}options();controls();});
  $('effectsTargetList').addEventListener('change',async()=>{selected=targets.find(r=>String(r.id)===$('effectsTargetList').value)||null;await invalidate();options();controls();});
  $('effectsCount').addEventListener('input',async()=>{await invalidate();controls();});
  $('effectsPrepare').addEventListener('click',async()=>{
    if(busy)return;busy=true;controls();const token=++epoch;
    try{
      prepared=null;$('effectsResult').textContent='';$('effectsHistory').replaceChildren();
      const choice=api.target({...selected,count:Number($('effectsCount').value)});
      const packet=api.testPackage({modId:'WB_Effects_'+window.crypto.randomUUID().replace(/-/g,'').slice(0,16),runtimeVersion:runtime.version,target:choice});
      const result=await host.prepareTestSession(packet);if(token!==epoch)return;prepared=result;preparedReady=true;
      status('Prepared '+choice.name+' #'+choice.id+' ×'+choice.count+'. Start isolated game when ready. Main menu: Test Effects: '+result.modId+'. No cast has occurred.');
    }catch(e){status(e.message);}finally{busy=false;controls();}
  });
  $('effectsStart').addEventListener('click',async()=>{
    if(busy||!prepared)return;busy=true;controls();try{prepared=await host.startTestSession(prepared.id,prepared.revision);status(prepared.instruction);}catch(e){status(e.message);}finally{busy=false;controls();}
  });
  $('effectsRefresh').addEventListener('click',async()=>{
    if(busy||!prepared)return;busy=true;controls();try{
      const current=await host.getTestSession();if(current?.id===prepared.id)prepared=current;
      if(prepared.status!=='exited'){status('Session '+prepared.status+'. Close the field and quit the isolated game normally before reading its receipt.');return;}
      const result=await host.getEffectBrowserResult(prepared.id);
      $('effectsResult').textContent=result.summary;
      const list=$('effectsHistory');list.replaceChildren();for(const row of result.entries){const li=document.createElement('li');li.textContent=row.event+' · '+row.kind+' #'+row.id+' '+row.name+' · look '+row.look+' / flight '+row.flymode+'/'+row.flylook;list.append(li);}
      status((result.stage==='error'?'Browser stopped: '+result.message+' ':'')+'Recorded calls/settings only. Named attacks, hits and appearance need your log/visual observations. No values were applied to your draft.');
    }catch(e){status(e.message);}finally{busy=false;controls();}
  });
})();
