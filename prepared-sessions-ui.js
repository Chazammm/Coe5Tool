/* Read-only discovery; explicit native validation and launch. Never restores the editor. */
(function(){
  'use strict';
  const $=id=>document.getElementById(id),host=window.CoeDesktop;
  let rows=[],selected=null,checked=null,busy=false,epoch=0;
  const labels={unchecked:'Not checked',ready:'Ready',used:'Already used',stale:'Stale',incomplete:'Incomplete',incompatible:'Incompatible runtime',blocked:'Cannot resume'};
  function notice(text,error=false){$('preparedNotice').textContent=text;$('preparedNotice').classList.toggle('error',error);}
  function controls(){
    $('startPrepared').disabled=busy||!checked?.ready;
    for(const id of ['refreshPrepared','checkPrepared','logsPrepared','reviewPrepared','closePrepared'])$(id).disabled=busy;
    $('preparedSearch').disabled=busy;
  }
  function render(){
    const query=$('preparedSearch').value.trim().toLowerCase();
    $('preparedRows').replaceChildren();
    const found=rows.filter(r=>[r.name,r.id,r.source,r.mode,r.state].join(' ').toLowerCase().includes(query));
    for(const row of found){
      const button=document.createElement('button');button.type='button';button.className='prepared-row';button.disabled=busy;
      button.setAttribute('aria-current',String(row.id===selected?.id));
      const title=document.createElement('strong'),context=document.createElement('span'),state=document.createElement('small');
      title.textContent=row.name;context.textContent=row.source+' · '+row.mode;
      state.textContent=(labels[row.state]||row.state)+' · '+row.id.slice(0,8)+(row.prepared?' · '+new Date(row.prepared).toLocaleString():'');
      button.append(title,context,state);button.addEventListener('click',()=>choose(row));$('preparedRows').append(button);
    }
    if(!found.length){const p=document.createElement('p');p.textContent=rows.length?'No matching tests. Try part of a name or ID.':'No preparations found on this Windows account. Prepare an isolated test from a supported draft first.';$('preparedRows').append(p);}
  }
  function choose(row){
    if(busy)return;epoch++;selected=row;checked=null;
    $('preparedDetail').hidden=false;$('preparedName').textContent=row.name;
    $('preparedContext').textContent=row.source+' · '+row.mode+(row.mixed?' · local roster-v1':' · CoE5SE 2.13.0')+' · '+row.id;
    $('preparedReason').textContent=row.reason;$('preparedInstruction').textContent='';$('preparedSnapshot').hidden=true;$('preparedSnapshot').open=false;$('preparedSource').textContent='';
    $('reviewPrepared').hidden=!row.review;$('checkPrepared').hidden=['used','stale','incomplete'].includes(row.state);notice('Selected '+row.name+'.');controls();render();
  }
  async function refresh(){
    if(busy)return;busy=true;epoch++;checked=null;controls();render();notice('Reading preparations…');
    try{
      // Refresh process state only for the session owned by this host; listing itself is read-only.
      if(host.getTestSession)await host.getTestSession();
      rows=await host.getPreparedSessions();const previous=selected?.id;selected=null;$('preparedDetail').hidden=true;
      busy=false;const row=rows.find(r=>r.id===previous);if(row)choose(row);notice(rows.length+' retained preparation'+(rows.length===1?'':'s')+'. Select one to inspect.');
    }catch(e){notice(e.message,true);}finally{busy=false;controls();render();}
  }
  $('preparedTests').addEventListener('click',async()=>{
    $('preparedDialog').showModal();$('preparedSearch').focus();
    if(!host?.getPreparedSessions){notice('Prepared-session resume is available in the current Windows desktop app. Source editing and export remain available here.',true);return;}
    await refresh();
  });
  $('refreshPrepared').addEventListener('click',refresh);
  $('preparedSearch').addEventListener('input',()=>{
    const query=$('preparedSearch').value.trim().toLowerCase();
    if(selected&&![selected.name,selected.id,selected.source,selected.mode,selected.state].join(' ').toLowerCase().includes(query)){
      epoch++;selected=null;checked=null;$('preparedDetail').hidden=true;controls();notice('Select a matching test to inspect.');
    }
    render();
  });
  $('checkPrepared').addEventListener('click',async()=>{
    if(busy||!selected)return;busy=true;const token=++epoch,id=selected.id;checked=null;controls();render();notice('Checking the saved source, helper, runtime and process state…');
    try{const result=await host.checkPreparedSession(id);if(token!==epoch||id!==selected?.id)return;
      checked=result;selected.state=result.state;$('preparedReason').textContent=result.detail;
      $('preparedSnapshot').hidden=!result.source;$('preparedSource').textContent=result.source||'';
      notice(result.ready?'Ready. Start launches this saved snapshot, with all protections checked again.':'Cannot resume. Use the explanation beside this test.',!result.ready);
    }catch(e){notice(e.message,true);}finally{busy=false;controls();render();}
  });
  $('startPrepared').addEventListener('click',async()=>{
    if(busy||!checked?.ready||checked.id!==selected?.id)return;busy=true;controls();render();notice('Checking again and starting the saved isolated session…');
    try{const session=await host.startPreparedSession(checked.id,checked.revision);checked=null;selected.state='used';
      $('preparedReason').textContent='Isolated game started. This is process evidence, not evidence of a cast, hit or visual effect.';
      $('preparedInstruction').textContent=session.needsProfileSetup?'First-time profile setup: quit normally once, then Refresh and Check this session again. No test mod is loaded during setup.':session.instruction;
      notice('After quitting normally, Refresh to review any saved values. Your draft is unchanged.');
    }catch(e){checked=null;$('preparedReason').textContent=e.message;notice('No usable launch was confirmed. Check this preparation again; your draft is unchanged.',true);}finally{busy=false;controls();render();}
  });
  $('logsPrepared').addEventListener('click',async()=>{if(!busy&&selected)try{await host.openPreparedLogs(selected.id);}catch(e){notice(e.message,true);}});
  $('reviewPrepared').addEventListener('click',()=>{if(busy||!selected)return;$('preparedDialog').close();window.CoeOpenReturnForSession?.(selected.id);});
  function close(){if(busy)return;epoch++;checked=null;controls();$('preparedDialog').close();$('preparedTests').focus();}
  $('closePrepared').addEventListener('click',close);$('preparedDialog').addEventListener('cancel',event=>{event.preventDefault();close();});
})();
