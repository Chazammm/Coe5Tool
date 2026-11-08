(function(){
  'use strict';
  const $=id=>document.getElementById(id),host=window.CoeDesktop;
  let runtime=null,session=null,binding=null,busy=false,epoch=0,observationDirty=false,mixedReadbackId=null;
  const status=(text,error=false)=>{$('sessionStatus').textContent=text;$('sessionStatus').classList.toggle('error',error);};
  function payload(){try{return window.CoePreparedTest();}catch{return null;}}
  function matches(p){return !!(p&&binding&&session?.id===binding.id&&p.source===binding.source&&p.mode===binding.mode&&p.modId===binding.modId&&JSON.stringify(p.files)===binding.files);}
  function previousSession(){return !!session&&session.status!=='running'&&(!matches(payload())||session.stale);}
  function render(){
    const p=payload(),running=session?.status==='running',current=matches(p)&&!session?.stale;
    if(mixedReadbackId!==session?.id){$('mixedValues').hidden=true;$('mixedValues').open=false;}
    $('isolatedTestControls').hidden=!host;
    $('testRuntime').textContent=runtime?(p?.manifest?.roster?'Local roster-v1 overlay · base '+runtime.label:runtime.label)+' · '+runtime.detail:'Choose the local game and official extracted extender. Nothing is downloaded or installed.';
    $('prepareSession').disabled=busy||!p||!runtime?.compatible||running;
    $('startTestSession').disabled=busy||!runtime?.compatible||!session||!current||running||session.status==='preparation-failed';
    $('readMixedValues').hidden=!session?.roster||session.rangedComparison||session.status!=='exited';$('readMixedValues').disabled=busy;
    $('startTestSession').textContent=session?.needsProfileSetup?'Start profile setup':'Start isolated test';
    $('chooseTestRuntime').disabled=busy||running;$('refreshTestSession').disabled=busy;$('openTestLogs').disabled=busy||!session;
    $('saveTestObservation').disabled=busy||session?.status!=='exited'||!$('testObservation').value;
    $('testObservation').disabled=busy||session?.status!=='exited';$('testObservationNote').disabled=busy||session?.status!=='exited';
    const previous=previousSession();
    $('sessionSummary').textContent=session?(previous?'Previous session · ':running&&!current?'Running session · ':'')+session.spell+(session.privateRanged?' · private ranged carrier':session.privateMelee?' · private melee carrier':session.originalRecord?' · original observation':'')+(session.rangedComparison?' · visual comparison':session.weaponEditing?' · weapon editing experiment':'')+(session.roster?' · local roster-v1 · '+session.roster.map(window.CoeMelee.targetLabel).join(', '):'')+(session.target?' · vs '+window.CoeMelee.targetLabel(session.target):'')+' · '+session.status+(session.pid?' · PID '+session.pid:'')+(session.stale?' · older draft/options':'')+(session.observation?((session.originalRecord||session.privateMelee||session.privateRanged)?' · reported visual outcome: ':' · user observation: ')+session.observation:' · no in-game observation recorded'):'No isolated session prepared.';
    $('testInstructions').textContent=previous?'This previous session does not match the current preparation. Its logs and observations remain available below. Prepare a new isolated session for the selection above.':session?.needsProfileSetup?
      'One-time setup: Start profile setup → Mods → enable CoE5SE only → Exit → Quit. This saves the native disposable config. Do not start a campaign. Click Refresh status, then Start isolated test; the workbench enables both test mods only in that private config.':
      (session?.instruction||'Prepare the session to see its exact main-menu entry and mode-specific instructions.');
    $('sessionFolder').textContent=session?.folder||'';
    $('reviewSessionValues').hidden=session?.status!=='exited'||!session?.weaponEditing;$('reviewSessionValues').disabled=busy;
    $('reviewSessionValues').textContent=previous?'Review previous saved values':'Review saved test values';
    $('testObservationHeading').textContent=session?'Record observation for '+session.spell:'Record your in-game observation';
    $('testObservationLabel').textContent=(session?.privateMelee||session?.privateRanged||session?.originalRecord)?'Visual outcome':'Your result';
    $('testObservationHelp').textContent=(previous?'These notes belong to the previous session, not the selection above. ':'')+(session?.privateRanged?'Record the named ranged attack, damage type and distance. Describe the projectile in flight and the impact at the target separately.':session?.privateMelee?'Record the carrier, weapon, damage type and damage dealt to the selected target. Describe any visible effect separately.':session?.originalRecord?'Use Notes to record selected spell/weapon use and visible effects separately. A battle return or process exit confirms neither.':'After quitting the game, record what you saw. Process exit alone does not establish a cast or visible effect.');
    let next='prepareTestFiles',heading=$('meleePayloadGroup').hidden?'Choose participants, then prepare files':'Set the attack payload, then prepare files',detail='Preparation creates text for review. It does not start the game.';
    if(running){next='refreshTestSession';heading='Finish the isolated test, then Quit';detail='The game is running. After you close the field and Quit, refresh here. Actual attacks and effects are recorded separately.';}
    else if(p){
      if(!host){next='testFileReview';heading='Review the generated files';detail='ZIP export and isolated sessions require the Windows desktop app.';}
      else if(!runtime?.compatible){next='chooseTestRuntime';heading='Choose a compatible game and extender';detail='The host checks exact runtime fingerprints before preparing a private session.';}
      else if(!current||!session||session.status==='preparation-failed'){next='prepareSession';heading='Prepare the disposable session';detail='Files are ready. This copies the verified runtime into a private test folder; the game stays closed.';}
      else if(session.needsProfileSetup){next='startTestSession';heading='Set up the disposable profile';detail='Follow the one-time profile instructions below. Normal profiles and campaign saves are not used.';}
      else if(session.status==='exited'&&session.weaponEditing){next='reviewSessionValues';heading='Review saved test values';detail='A process exit is recorded. Inspect saved helper values and your own observations separately.';}
      else if(session.status==='exited'){next='testObservation';heading='Record what you observed';detail=session.privateRanged?'Check the named attack and damage type in the combat log. Record any resistance reading separately from the visible flight and impact.':session.privateMelee?'Check the combat log for the private carrier and weapon, then record your observation.':session.originalRecord?'The process exited. Record selected spell/weapon use and visible effects separately; an exit alone confirms neither.':'The process exited. Record your result below; an exit alone does not establish a successful cast.';}
      else{next='startTestSession';heading='Start the isolated test';detail='Follow the session instructions below. Normal profiles and campaign saves are not used.';}
    }
    $('testNextHeading').textContent=busy?'Checking the isolated session…':heading;$('testNextDetail').textContent=busy?'Please wait for this operation to finish.':detail;
    window.CoeFocusTestNext=()=>{if(next==='testFileReview')$('testFileReview').open=true;if(next==='testObservation')$('testObservationSection').open=true;$(next).focus();};
    for(const id of ['prepareTestFiles','chooseTestRuntime','prepareSession','startTestSession','refreshTestSession','reviewSessionValues','testObservation'])$(id).classList.toggle('next-action',id===next);
    for(const id of ['testModId','testCaster','testEnemy','testCasterId','testEnemyId','testCount','testWeaponEditing','findCaster','findEnemy','findStandaloneTarget','meleePayload'])$(id).disabled=busy;
    $('rangedCompare').disabled=busy||$('rangedCompare').getAttribute('data-required')==='yes';
  }
  window.CoeIsolatedTestBusy=()=>busy;
  window.CoeTestObservationDirty=()=>observationDirty;
  async function invalidateBoundSession(){
    const owned=binding && session?.id===binding.id;
    binding=null;
    if(owned && session.status!=='exited'){
      session.stale=true;
      await host?.invalidateTestSession?.(session.id);
    }
  }
  window.CoeTestPreparationChanged=()=>{
    epoch++;invalidateBoundSession().catch(()=>{});render();
  };
  async function operation(action){
    if(busy||!host)return;busy=true;render();
    try{await action();}catch(error){try{if(host.getTestSession)session=await host.getTestSession();}catch{}status(error.message,true);}finally{busy=false;render();}
  }
  window.CoeRefreshTestSession=()=>operation(async()=>{
    runtime=await host.getTestRuntime();session=await host.getTestSession();
    status(session?.error||(!runtime.compatible?runtime.detail:session?.status==='running'?'Game running. Finish the test and Quit inside that game; this application does not send input or close it.':previousSession()?'Previous session retained for review. It is not a test of the current selection.':session?.status==='exited'?'Game process exited. This does not establish that the selected spell or weapon was used or that an effect was visible. Record your observation below.':'Runtime files checked. Preparing files or a session does not start the game.'),!!session?.error);
    if(session?.status==='exited'&&session.weaponEditing)window.CoeReturnSessionEnded?.(session.id);
  });
  $('chooseTestRuntime').addEventListener('click',()=>operation(async()=>{
    const result=await host.chooseTestRuntime();if(!result){status('Runtime selection cancelled. Existing settings and preparation retained.');return;}
    runtime=result;await invalidateBoundSession();status('Compatible files selected. Prepare a new isolated session to use this selection.');
  }));
  $('refreshTestSession').addEventListener('click',()=>window.CoeRefreshTestSession());
  $('reviewSessionValues').addEventListener('click',()=>{if(session?.status==='exited')return window.CoeOpenReturnForSession?.(session.id);});
  window.addEventListener('focus',()=>{if(session?.status==='running')window.CoeRefreshTestSession();});
  $('prepareSession').addEventListener('click',()=>operation(async()=>{
    const p=payload();if(!p)throw new Error('Prepare files from the current applied draft first.');
    if(observationDirty&&!window.confirm('Discard the unsaved observation when preparing another session?')){status('Preparation cancelled. Your unsaved observation is retained.');return;}
    const startedAt=epoch;binding=null;
    const next=await host.prepareTestSession(p);session=next;
    if(epoch!==startedAt||!payload()||payload().source!==p.source||payload().mode!==p.mode||payload().modId!==p.modId){session.stale=true;await host.invalidateTestSession(session.id);throw new Error('The draft/options changed during preparation. Regenerate before starting.');}
    binding={id:next.id,source:p.source,mode:p.mode,modId:p.modId,files:JSON.stringify(p.files)};observationDirty=false;window.CoeMarkTestPrepared?.();
    $('testObservation').value='';$('testObservationNote').value='';
    status('Isolated files prepared for '+session.spell+(session.roster?' · local roster-v1 mixed field':'')+'. No game has started.'+(session.needsProfileSetup?' A one-time profile setup launch is needed.':' Start explicitly when ready.'));
  }));
  $('startTestSession').addEventListener('click',()=>operation(async()=>{
    if(!session||session.stale||!matches(payload()))throw new Error('The preparation no longer matches this draft. Regenerate it.');
    const next=await host.startTestSession(session.id,session.revision);session=next;
    status(session.rangedComparison?'Open the comparison from the isolated main menu. Use the fresh battle action, then choose and apply another configuration.':session.privateRanged?'Started the private ranged session. Choose Battle (AI) and observe the named attack, flight and impact.':session.privateMelee?'Started the private melee field session. Use Battle (AI), then check the named attack and damage in the game log.':session.originalRecord?'Started only the isolated game. Follow Battle (AI) instructions below. Record actual spell/weapon use and visible effects separately after quitting.':'Started only the isolated game. Follow the instructions below. Desktop source changes require Quit, regeneration and a new start. Session-only experiment parameters do not update the draft. No observation is recorded automatically.');
  }));
  $('readMixedValues').addEventListener('click',()=>operation(async()=>{
    mixedReadbackId=null;$('mixedValues').hidden=true;$('mixedValuesRows').replaceChildren();
    const selectedId=session.id;const r=await host.getMixedTestValues(selectedId);
    if(r.sessionId!==selectedId||session.id!==selectedId)throw Error('The selected session changed during result reading.');
    mixedReadbackId=selectedId;
    window.CoeBattleResults.render($('mixedValuesRows'),r,document,'fixedBattle');
    $('mixedValuesStatus').textContent=session.spell+' · Area code '+r.areaCode+' · saved helper readings, separate from your observations.';
    $('mixedValues').hidden=false;$('mixedValues').open=true;
  }));
  $('openTestLogs').addEventListener('click',()=>operation(async()=>{if(session)await host.openTestLogs(session.id);}));
  for(const id of ['testObservation','testObservationNote'])$(id).addEventListener('input',()=>{observationDirty=true;render();});
  $('saveTestObservation').addEventListener('click',()=>operation(async()=>{
    if(!session)return;
    session=await host.saveTestObservation(session.id,$('testObservation').value,$('testObservationNote').value);observationDirty=false;
    status('Saved your reported observation separately from preparation and process exit. This is not an automated gameplay verdict.');
  }));
  render();
})();
