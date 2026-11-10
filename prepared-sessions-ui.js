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
    const found=rows.filter(r=>[r.name,r.id,r.source,r.mode,r.runtime,r.state].join(' ').toLowerCase().includes(query));
    for(const row of found){
      const button=document.createElement('button');button.type='button';button.className='prepared-row';button.disabled=busy;
      button.setAttribute('aria-current',String(row.id===selected?.id));
      const title=document.createElement('strong'),context=document.createElement('span'),state=document.createElement('small');
      title.textContent=row.name;context.textContent=row.source+' · '+row.mode+(row.runtime?' · '+row.runtime:'');
      state.textContent=(labels[row.state]||row.state)+' · '+row.id.slice(0,8)+(row.prepared?' · '+new Date(row.prepared).toLocaleString():'');
      button.append(title,context,state);button.addEventListener('click',()=>choose(row));$('preparedRows').append(button);
    }
    if(!found.length){const p=document.createElement('p');p.textContent=rows.length?'No matching tests. Try part of a name or ID.':'No preparations found on this Windows account. Prepare an isolated test from a supported draft first.';$('preparedRows').append(p);}
  }
  function choose(row){
    if(busy)return;epoch++;selected=row;checked=null;
    $('preparedDetail').hidden=false;$('preparedName').textContent=row.name;
    $('preparedContext').textContent=row.source+' · '+row.mode+(row.runtime?' · '+row.runtime:' · CoE5SE 2.13.0')+(row.mixed?' · local roster-v1':'')+' · '+row.id;
    $('preparedReason').textContent=row.reason;$('preparedInstruction').textContent='';$('preparedSnapshot').hidden=true;$('preparedSnapshot').open=false;$('preparedSource').textContent='';
    $('preparedObservation').hidden=!row.observation;$('preparedObservationFacts').replaceChildren();$('preparedObservationLimit').textContent='';$('preparedObservationStatus').textContent='';
    if(row.observation)void originalFacts(row,epoch);
    $('reviewPrepared').hidden=!row.review;$('checkPrepared').hidden=['used','stale','incomplete'].includes(row.state);notice('Selected '+row.name+'.');controls();render();
  }
  async function originalFacts(row,token){
    $('preparedObservationStatus').textContent='Reading bound helper facts…';
    try{
      if(!host?.getOriginalObservation)throw Error('Use the updated Windows build to read observation summaries. Session files & logs remain available.');
      const result=await host.getOriginalObservation(row.id);if(token!==epoch||selected?.id!==row.id)return;
      if(result.id!==row.id)throw Error('Observation identity differs.');
      if(!result.available){$('preparedObservationStatus').textContent=result.detail;return;}
      $('preparedObservationStatus').textContent='Helper stage: '+result.stage+' · battle calls returned: '+result.battles+' · stop requests: '+result.stops+' · process exit: '+(result.exitCode??'unknown')+'.';
      const facts=result.facts||{},rows=[];
      if(result.requestedTargets)rows.push(['Requested targets · not spawned identities',result.requestedTargets]);
      if(facts.caster!==undefined)rows.push(['Native actor',facts.castername+' #'+facts.caster]);
      if(facts.spell!==undefined&&Number(facts.spell)>=0)rows.push(['Spell', (facts.spellname||'Recorded ID')+' #'+facts.spell]);
      if(facts.weapon!==undefined)rows.push(['Weapon',facts.weaponname+' #'+facts.weapon]);
      for(const [key,label]of Object.entries({payload:'Attack payload',dmgtype:'Damage type ID',aoe:'Area / targeting code',flymode:'Flight mode',flylook:'Flight ID',look:'Impact ID'}))if(facts[key]!==undefined)rows.push([label,facts[key]]);
      if(facts.knownunchanged!==undefined)rows.push(['Checked numeric fields',facts.knownunchanged==='1'?'Unchanged at last helper check; not full-record equivalence':'Changed; inspect the error and logs']);
      rows.push(['User-reported visual outcome',result.reportedOutcome||'Not recorded']);
      for(const [label,value]of rows){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;$('preparedObservationFacts').append(dt,dd);}
      $('preparedObservationLimit').textContent=result.limitation+(result.message?' Helper message: '+result.message:'');
    }catch(e){if(token===epoch&&selected?.id===row.id)$('preparedObservationStatus').textContent='Summary unavailable: '+e.message+' No gameplay result inferred.';}
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
  window.CoeOpenPreparedTests=async(options={})=>{
    epoch++;selected=null;checked=null;$('preparedDetail').hidden=true;$('preparedSearch').value=options.query||'';
    $('preparedDialog').showModal();$('preparedSearch').focus();
    if(!host?.getPreparedSessions){notice('Prepared-session resume is available in the current Windows desktop app. Source editing and export remain available here.',true);return;}
    await refresh();
  };
  $('preparedTests').addEventListener('click',()=>window.CoeOpenPreparedTests());
  $('refreshPrepared').addEventListener('click',refresh);
  $('preparedSearch').addEventListener('input',()=>{
    const query=$('preparedSearch').value.trim().toLowerCase();
    if(selected&&![selected.name,selected.id,selected.source,selected.mode,selected.runtime,selected.state].join(' ').toLowerCase().includes(query)){
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
