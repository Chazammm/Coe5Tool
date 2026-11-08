(function(){
  'use strict';
  const $=id=>document.getElementById(id),host=window.CoeDesktop,api=window.CoeReturn,session=window.CoeWorkbenchSession;
  let packet=null,review=null,rows=[],busy=false,epoch=0,discovery=0,manualDirty=false,latest=null,dismissed='',refreshKey='';
  const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
  const message=(text,error=false)=>{$('returnStatus').textContent=text;$('returnStatus').classList.toggle('error',error);};
  const ordered=list=>[...list].sort((a,b)=>(b.saved||b.started||'').localeCompare(a.saved||a.started||''));
  const dated=r=>{const value=r.saved||r.started;if(!value)return '';const d=new Date(value);return Number.isNaN(d.getTime())?value:d.toLocaleString('en-GB');};
  const comparison=c=>[3,4].includes(c?.resultSchema);
  const opponent=r=>r.roster?' vs '+r.roster.map(window.CoeMelee.targetLabel).join(', '):r.target?' vs '+window.CoeMelee.targetLabel(r.target):'';
  const baseline=(c,key)=>c.baseline[key]!==''&&c.baseline[key]!==undefined?c.baseline[key]:c.runtimeBaseline?.[key]!==undefined?c.runtimeBaseline[key]+' (readback; no source line)':'not declared';
  const draft=()=>session.returnDraft();
  const identity=()=>{const d=draft();return d.mode+'\0'+d.text+'\0'+d.selected;};
  window.CoeReturnDirty=()=>manualDirty;
  function invalidate(){review=null;$('groupReadings').hidden=true;$('groupReadings').open=false;$('groupReadingsList').replaceChildren();$('groupReadingsList').hidden=false;$('groupBattleResults').replaceChildren();$('groupBattleResults').hidden=true;$('applyReturn').disabled=true;$('stageReturn').disabled=true;$('returnRows').replaceChildren();$('returnUnchangedRows').replaceChildren();$('returnConflictAck').checked=false;}
  function discardManual(){if(manualDirty&&!window.confirm('Discard the manual result form? Your draft and field edits stay unchanged.'))return false;manualDirty=false;return true;}
  function selected(){return review?.rows.filter(r=>r.available&&$('returnUse-'+r.key)?.checked).map(r=>r.key)||[];}
  function controls(){
    if(!packet)$('returnHistoryPicker').hidden=true;
    $('loadReturnSession').disabled=busy||!$('returnSession').value;$('reviewReturn').disabled=busy||!packet;$('openReturnSource').disabled=busy||!packet;
    $('returnSession').disabled=busy;$('refreshReturnSessions').disabled=busy;
    $('applyReturn').disabled=busy||!review||!selected().length;$('stageReturn').disabled=busy||!review||!!review.blocked||!selected().length;
  }
  function notice(){
    const key=latest?latest.id+':'+(latest.run||'')+':'+identity():'';
    let imported=false;
    if(latest&&packet?.context.sessionId===latest.id)try{
      const sample=[...packet.samples].reverse().find(s=>s.kind==='applied')||packet.samples.at(-1);
      if(sample){const changed=api.plan(packet.context,sample,draft()).rows.filter(r=>r.testChanged);imported=changed.length>0&&changed.every(r=>r.draftAlready);}
    }catch{}
    $('testReturnNotice').hidden=!latest||key===dismissed||imported;
    if(latest)$('testReturnSummary').textContent='Saved test values for '+latest.spell+opponent(latest)+'. Review before changing this draft.';
  }
  async function availability(force=false){
    if(!host?.getTestSessions||!draft().text){latest=null;notice();return;}
    const key=identity();if(!force&&key===refreshKey){notice();return;}refreshKey=key;const stamp=++discovery;
    try{const next=await host.getTestSessions();if(stamp!==discovery||identity()!==key)return;rows=next;latest=ordered(rows).find(r=>r.status==='exited'&&r.hasResult!==false&&api.related(r,draft()))||null;notice();}
    catch{
      if(stamp!==discovery||identity()!==key)return;
      // Native dialogs can temporarily reject discovery. Keep only previously
      // listed matching metadata; opening a result still performs full validation.
      latest=ordered(rows).find(r=>r.status==='exited'&&r.hasResult!==false&&api.related(r,draft()))||null;refreshKey='';notice();
    } // Explicit review/history reports read errors; discovery never interrupts editing.
  }
  window.CoeRefreshReturnAvailability=()=>availability(true);
  window.CoeReturnDraftChanged=()=>{if($('returnDialog').open)invalidate();Promise.resolve().then(()=>availability());};
  window.CoeReturnPendingChanged=()=>{if(review&&$('returnDialog').open){invalidate();message('Your field edits changed. Refresh the comparison before applying.');controls();}};
  window.CoeReturnSessionEnded=()=>availability(true);
  function currentSample(){
    if(!packet)throw new Error('Choose a saved result first.');
    if($('returnMode').value==='manual'){
      const values={dmgtype:Number($('manualReturnType').value),aoe:Number($('manualReturnArea').value)};
      if(packet.context.resultSchema===2)for(const [key,id]of [['look','manualReturnLook'],['flymode','manualReturnFlymode'],['flylook','manualReturnFlylook']])if($(id).value!==''){
        if(!/^-?\d+$/.test($(id).value))throw new Error('Enter an integer or leave the optional visual value blank.');values[key]=Number($(id).value);
      }
      return api.manual(packet.context,values,{applied:$('manualReturnApplied').checked,observed:$('returnObserved').checked});
    }
    const s=packet.samples.find(s=>String(s.index)===$('returnSample').value);if(!s&&comparison(packet.context))throw new Error('No completed ranged battle readback for this launch.');if(!s)throw new Error('No saved readback is available. Use the manual report under Session and history.');
    return {...s,userObserved:$('returnObserved').checked===true};
  }
  function reviewNow(){
    invalidate();if(!packet){controls();return;}
    try{
      review=session.previewTestReturn(packet.context,currentSample());
      const prominent=r=>r.testChanged||r.conflict||(r.group==='flight'&&review.rows.some(x=>x.group==='flight'&&(x.testChanged||x.conflict)));
      const changed=review.rows.filter(r=>r.testChanged),unchanged=review.rows.filter(r=>!prominent(r));
      $('returnChangeSummary').textContent=changed.length?changed.map(r=>r.label+': '+baseline(packet.context,r.key)+' → '+r.proposed).join(' · '):'No settings changed from the saved baseline.';
      for(const r of review.rows){
        const group=r.group==='flight'?review.rows.filter(x=>x.group==='flight'):[r],groupConflict=group.some(x=>x.conflict);
        const line=node('div');line.className='return-row';const label=node('label'),box=node('input');box.type='checkbox';box.id='returnUse-'+r.key;box.disabled=!r.available;
        box.checked=!!r.defaultSelected;
        const action=!r.available?r.label+' · unavailable':r.addition?'Add '+r.label+' to this weapon':groupConflict?'Replace newer '+r.label:r.draftAlready?r.label+' · already in draft':'Use '+r.label;
        label.append(box,node('span',action));line.append(label);
        line.append(node('p','Draft '+(r.current||'not declared')+(r.pending!==null?' · field edit '+r.pending:'')+' → saved '+r.proposed+(r.addition?' · adds '+r.key+' '+r.proposed:'')+(r.group==='flight'?' · paired flight values':'')));
        if(!r.available)line.append(node('p',r.reason));
        else if(groupConflict)line.append(node('p',r.addition?(r.conflict?(packet.context.baseline[r.key]!==''&&packet.context.baseline[r.key]!==undefined?'This line was removed after preparation. Selecting Add restores it with the saved value.':'Selecting Add replaces your newer field edit with the saved value.'):'This also selects the paired flight value. Review its Replace choice before applying.'):'Unchecked keeps your newer value. Selecting Replace explicitly uses the saved value.'));
        box.addEventListener('change',()=>{if(r.group==='flight')for(const other of group)$('returnUse-'+other.key).checked=box.checked;controls();});
        (prominent(r)?$('returnRows'):$('returnUnchangedRows')).append(line);
      }
      $('returnUnchangedSummary').textContent=unchanged.length+' unchanged setting'+(unchanged.length===1?'':'s')+' · kept by default';
      $('returnConflictHelp').hidden=!review.rows.some(r=>r.conflict);
      const s=review.sample;
      $('groupReadings').hidden=true;$('groupReadingsList').replaceChildren();
      if(comparison(packet.context)){
        const mixed=packet.context.resultSchema===4;
        $('groupReadingsLabel').textContent=mixed?'Defenders per battle · HP before → after':'Defenders before battle';
        if(mixed){
          $('groupReadings').hidden=false;$('groupReadings').open=true;
          $('groupReadingsLabel').textContent='Battle '+s.index+' · Recorded defenders';
          $('groupReadingsList').hidden=true;$('groupBattleResults').hidden=false;
          window.CoeBattleResults.render($('groupBattleResults'),{...s.mixedReading,element:packet.resistanceElement,battleReturns:s.battleCount},document,'returnBattle');
        }
        const target=packet.context.target;const reading=s.targetReading;
        const group=target?.count>1;
        if(group){
          $('groupReadings').hidden=false;
          const element=packet.resistanceElement;
          for(const member of reading.units){
            const value=!element?'physical attack':member.resistance===null?element+' resistance unavailable':member.resistance+'% '+element+' resistance';
            $('groupReadingsList').append(node('li','Unit #'+member.unit+' · '+value));
          }
        }
        const defender=mixed?'Isolated CoE5SE / local roster-v1. ':group?window.CoeMelee.targetLabel(target)+' · '+reading.units.length+' defenders verified before battle. ':target?'Target: '+target.name+' #'+target.id+' · unit #'+reading.unit+(typeof reading.resistance==='number'?' · pre-battle resistance '+reading.resistance+'%':' · no elemental resistance reading')+'. ':'';
        $('returnEvidence').textContent=defender+(packet.areaCode>0?window.CoeMelee.areaLabel(packet.areaCode)+'. ':'')+(mixed?'Private carrier · three visual settings read back. ':'Private carrier · one AI battle returned with these three settings read back. ')+(s.userObserved?'You report seeing this configuration in use.':'Visual appearance is not established by these readings.')+' Only the private weapon definition was tested; other mod content was not loaded.';
      }else $('returnEvidence').textContent=(s.origin==='manual'?'Manual user report; no helper readback or cast proof.':s.castCount?('Helper readback saved · '+s.castCount+' completed cast call'+(s.castCount===1?'':'s')+'.'):'Helper readback saved · no completed cast call for these values.')+' '+(s.userObserved?'You report seeing a cast with these values.':'Visual appearance is not established by this file.')+(review.sourceChanged?' This draft has changed since preparation; these are proposed edits, not a new gameplay result.':'')+(review.weaponOnly?' Values were tried using '+packet.context.spellName+' in the SE field; this weapon-only draft keeps its current target.':'');
      message(packet.error||'Apply only the values you choose. Your other field edits stay untouched; export is separate.',!!packet.error);
    }catch(error){invalidate();$('returnChangeSummary').textContent='Open the matching draft or choose another result.';message((packet?.error?packet.error+' · ':'')+error.message,true);}
    controls();
  }
  function mode(){
    const manual=$('returnMode').value==='manual';$('manualReturnFields').hidden=!manual;$('returnSample').disabled=manual;$('returnHistoryPicker').hidden=manual||!packet||packet.samples.length<2;$('manualReturnVisuals').hidden=!manual||packet?.context.resultSchema!==2;if(manual)$('returnDetails').open=true;reviewNow();
  }
  function battleLabel(sample){
    const v=sample.values, sprite=v.flymode===1;
    const name=window.CoeMelee.visualName(sprite?'sprite':'particle',v.flylook);
    const impact=v.look===-1?'undeclared':window.CoeMelee.visualName('impact',v.look)+' #'+v.look;
    return 'Battle '+sample.index+' · '+(sprite?'Sprite 1':'Particle 2')+' / '+name+' #'+v.flylook+' · Impact '+impact;
  }
  async function load(id){
    if(busy||!id||!discardManual())return;const stamp=++epoch;busy=true;packet=null;invalidate();controls();message('Checking the saved result…');
    try{
      const p=await api.validatePacket(await host.getTestValues(id));if(stamp!==epoch||$('returnSession').value!==id)return;
      if(p.context.sessionId!==id)throw new Error('The saved result belongs to another session.');packet=p;
      const c=p.context;
      $('returnSampleLabel').textContent=comparison(c)?'Compare saved battles':'Saved configuration';
      $('returnDetailsLabel').textContent=comparison(c)?'Session & source details':'Session & manual values';
      $('returnDetailsHelp').textContent=comparison(c)?'Inspect the prepared source or choose another session.':'Inspect the prepared source, choose another session or enter a manual report.';
      $('returnSubject').textContent=comparison(c)?c.spellName:c.spellName+(c.weaponName!==c.spellName?' · weapon '+c.weaponName:'');
      $('returnAssociation').textContent=c.runtime+' · session '+c.sessionId+' · source '+c.sourceRevision+(c.stale?' · retained preparation':'');
      $('returnSample').replaceChildren();for(const s of p.samples){const o=node('option',comparison(c)?battleLabel(s):(s.kind==='baseline'?'Baseline':'Applied revision '+s.parameterRevision)+' · '+s.castCount+' completed cast call(s) · type '+s.values.dmgtype+' · area '+s.values.aoe+(s.values.look!==undefined?' · impact '+s.values.look+' · flight '+s.values.flymode+'/'+s.values.flylook:''));o.value=String(s.index);$('returnSample').append(o);}
      const preferred=comparison(c)?p.samples.at(-1):[...p.samples].reverse().find(s=>s.kind==='applied')||p.samples.at(-1);$('returnSample').value=preferred?String(preferred.index):'';
      $('returnMode').disabled=comparison(c);
      if(!comparison(c))window.CoePopulateDamageTypes($('manualReturnType'),window.CoeDamage.allowedTypes(c.baseline.dmgtype,c.damagePolicy==='documented-v1'));$('returnMode').value=comparison(c)||p.samples.length?'file':'manual';$('manualReturnType').value=c.baseline.dmgtype;$('manualReturnArea').value=c.baseline.aoe;
      $('manualReturnApplied').checked=false;$('returnObserved').checked=false;for(const key of ['manualReturnLook','manualReturnFlymode','manualReturnFlylook'])$(key).value='';
      mode();
    }catch(error){$('returnSubject').textContent='Result unavailable';message(error.message+' No draft values were changed.',true);}
    finally{busy=false;controls();}
  }
  async function sessions(preferred,auto=false){
    if(busy||!discardManual())return;busy=true;packet=null;const stamp=++epoch;invalidate();controls();
    try{
      const found=await host.getTestSessions();if(stamp!==epoch||!$('returnDialog').open)return;
      rows=ordered(found);$('returnSession').replaceChildren();
      for(const r of rows){const o=node('option',r.spell+opponent(r)+' · '+dated(r)+' · '+r.status+' · '+r.id.slice(0,8)+(r.hasResult===false?' · no saved file':''));o.value=r.id;$('returnSession').append(o);}
      const related=rows.find(r=>r.status==='exited'&&r.hasResult!==false&&api.related(r,draft()));
      const next=rows.find(r=>r.id===preferred)||related||rows[0];$('returnSession').value=next?.id||'';
      $('returnSubject').textContent=next?.spell||'No retained experiments';$('returnAssociation').textContent='';
      message(rows.length?'Choose a session under Session and history, or review the latest matching saved values.':'No retained experiments. Prepare and run an isolated experiment, then Save test values.');
      busy=false;controls();
      if(next&&auto&&(preferred||related||!draft().text))await load(next.id);
    }catch(error){message(error.message,true);}finally{busy=false;controls();}
  }
  async function open(preferred){
    if(!host?.getTestValues)return;
    if($('testDialog').open)$('testDialog').close(); // Keep prepared files and unsaved observation inputs in memory.
    if(!$('returnDialog').open)$('returnDialog').showModal();await sessions(preferred,true);
  }
  window.CoeOpenReturnForSession=open;
  $('returnTestValues').disabled=!host?.getTestValues;
  $('returnTestValues').addEventListener('click',()=>open(latest?.id));$('reviewLatestTest').addEventListener('click',()=>open(latest?.id));
  $('dismissLatestTest').addEventListener('click',()=>{dismissed=latest?latest.id+':'+(latest.run||'')+':'+identity():'';notice();});
  function close(){if(!discardManual())return;epoch++;$('returnDialog').close();$('returnTestValues').focus();}
  $('closeReturn').addEventListener('click',close);$('returnDialog').addEventListener('cancel',e=>{e.preventDefault();close();});
  $('refreshReturnSessions').addEventListener('click',()=>sessions());
  $('returnSession').addEventListener('change',()=>{if(!discardManual()){if(packet)$('returnSession').value=packet.context.sessionId;return;}epoch++;packet=null;invalidate();controls();return load($('returnSession').value);});
  $('loadReturnSession').addEventListener('click',()=>load($('returnSession').value));
  $('returnSample').addEventListener('change',()=>{$('returnObserved').checked=false;mode();});
  for(const id of ['returnMode','returnObserved'])$(id).addEventListener('change',mode);
  for(const id of ['manualReturnType','manualReturnArea','manualReturnApplied','manualReturnLook','manualReturnFlymode','manualReturnFlylook'])$(id).addEventListener('input',()=>{manualDirty=true;invalidate();controls();});
  $('openReturnSource').addEventListener('click',()=>{if(!packet)return;try{if(session.openTestSnapshot(packet.context))reviewNow();}catch(error){message(error.message,true);}});
  $('reviewReturn').addEventListener('click',reviewNow);
  $('applyReturn').addEventListener('click',()=>{
    if(!review||busy)return;
    try{const keys=selected(),replace=review.rows.filter(r=>r.conflict&&keys.includes(r.key)).map(r=>r.key),result=session.applyTestReturn(review,keys,replace);manualDirty=false;$('returnDialog').close();$(result.pendingRetained?'apply':'download').focus();refreshKey='';void availability(true);}
    catch(error){message(error.message,true);}
  });
  $('stageReturn').addEventListener('click',()=>{
    if(!review||busy)return;
    try{session.stageTestReturn(review,selected(),$('returnConflictAck').checked);manualDirty=false;$('returnDialog').close();$('apply').focus();}
    catch(error){message(error.message,true);}
  });
  window.addEventListener('focus',()=>availability(true));
  window.CoeReturnReady=availability();controls();
})();
