(function(){
  'use strict';const $=id=>document.getElementById(id),api=window.CoeEffects,host=window.CoeDesktop;
  let runtime,targets=[],selected,prepared,busy=false,epoch=0;
  const status=text=>{$('effectsStatus').textContent=text;};
  function controls(){
    $('effectsPrepare').disabled=busy||runtime?.version!==api.runtime||!runtime?.compatible||!selected;
    $('effectsStart').disabled=busy||!prepared||prepared.status!=='prepared'||prepared.stale===true;
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
    if(runtime.compatible&&runtime.version===api.runtime){const packet=await host.getStandaloneTargets();targets=packet.entries||[];selected=targets.find(r=>r.id===13&&r.name==='Spearman')||null;}
    options();controls();
    if(runtime.version!==api.runtime)status('Test Effects requires verified official CoE5SE 3.4.4. Existing test routes keep their supported versions. Official 3.5.0 is not yet verified by Workbench.');
  }
  async function open(){
    $('effectsDialog').showModal();$('effectsSummary').textContent=api.intro;status('Choose your game files, then prepare. Starting the game is a separate action.');
    if(!host){status('Open the Windows desktop application to prepare an isolated Test Effects session. No game or assets are bundled.');controls();return;}
    busy=true;controls();try{await refreshRuntime();const current=await host.getTestSession();if(current?.effectsBrowser){prepared=current;status(current.instruction);}}catch(e){status(e.message);}finally{busy=false;controls();}
  }
  async function invalidate(){if(prepared){await host.invalidateTestSession(prepared.id);prepared=null;}$('effectsStart').disabled=true;}
  for(const id of ['testEffects','startEffects'])$(id).addEventListener('click',open);
  $('closeEffects').addEventListener('click',()=>{$('effectsDialog').close();});
  $('effectsRuntimeChoose').addEventListener('click',async()=>{busy=true;controls();try{const value=await host.chooseTestRuntime();if(value){await invalidate();await refreshRuntime();}}catch(e){status(e.message);}finally{busy=false;controls();}});
  $('effectsTargetSearch').addEventListener('input',async()=>{if(selected&&!api.filter(targets,$('effectsTargetSearch').value).some(r=>r.id===selected.id)){selected=null;await invalidate();}options();controls();});
  $('effectsTargetList').addEventListener('change',async()=>{selected=targets.find(r=>String(r.id)===$('effectsTargetList').value)||null;await invalidate();controls();});
  $('effectsCount').addEventListener('input',async()=>{await invalidate();controls();});
  $('effectsPrepare').addEventListener('click',async()=>{
    if(busy)return;busy=true;controls();const token=++epoch;
    try{
      const choice=api.target({...selected,count:Number($('effectsCount').value)});
      const packet=api.testPackage({modId:'WB_Effects_'+window.crypto.randomUUID().replace(/-/g,'').slice(0,16),runtimeVersion:runtime.version,target:choice});
      const result=await host.prepareTestSession(packet);if(token!==epoch)return;prepared=result;
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
      status('Recorded calls/settings only. Named attacks, hits and appearance need your log/visual observations. No values were applied to your draft.');
    }catch(e){status(e.message);}finally{busy=false;controls();}
  });
})();
