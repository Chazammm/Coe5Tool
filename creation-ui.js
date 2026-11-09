(function(){
  'use strict';
  const $=id=>document.getElementById(id),api=window.CoeCreation;
  const keys=['spellName','weaponName','path','level','weaponDamage','dmg','dmgtype','range','init','aoe','look','sound','flymode','flylook','flysound'];
  const damage=window.CoeDamage;
  const defaultIdHelp=$('testIdHelp').textContent;
  window.CoePopulateDamageTypes($('create-dmgtype'),undefined,true);
  function damageContext(resetAck=false){
    const type=$('create-dmgtype').value,p=damage.profile(type),special=p?.kind==='mask'||p?.kind==='animate';
    const carrierReason=creationTarget==='vanilla'&&type?window.CoeMelee.carrierDamageReason(type):'';
    $('damageTypeHelp').textContent=carrierReason||damage.hint(type);
    $('createWeaponPayloadLabel').textContent=p?.kind==='mask'?'Weapon '+(p.id===12?'affliction':'benefit')+' mask':p?.kind==='animate'?'Weapon animation · 1 tree / 2 fungus':p?.kind==='manual'?'Weapon payload · manual':'Weapon base damage · dmg';
    $('createSpellPayloadLabel').textContent=p?.kind==='mask'?'Spell '+(p.id===12?'affliction':'benefit')+' mask':p?.kind==='animate'?'Spell animation · 1 tree / 2 fungus':p?.kind==='manual'?'Spell payload · manual':'Spell weapon damage';
    $('chooseWeaponPayload').hidden=!special;$('chooseSpellPayload').hidden=!special||creationTarget==='vanilla';
    $('manualDamageOption').hidden=p?.kind!=='manual';if(resetAck)$('manualDamageAck').checked=false;
  }
  let originalRequest=null, meleeRequest=false, defender;
  let mixedRows=[];
  function renderMixed(){
    const mixed=mixedRows.length>1,comparing=meleeRequest&&!$('rangedCompareGroup').hidden&&$('rangedCompare').checked;

    $('singleTargetChoice').hidden=mixed;$('standaloneCount').disabled=!meleeRequest||mixed;
    $('mixedRosterRows').hidden=!mixed;$('mixedRosterRows').replaceChildren();
    $('standaloneTargetInfo').hidden=mixed;
    $('mixedRosterHelp').textContent=mixed?'Local roster-v1 · '+mixedRows.reduce((n,r)=>n+Number(r.count),0)+' defenders. '+(comparing?'Each comparison restores this roster. Review individual HP/readings with its saved visuals.':'Fixed AI battle. Read individual HP and named attacks after exit.'):'One type uses released CoE5SE 2.13.0. Mixed groups require the local roster-v1 build.';
    $('rangedCompare').disabled=$('rangedCompare').getAttribute('data-required')==='yes';
    for(const [i,row] of mixedRows.entries()){
      const line=document.createElement('div');line.className='mixed-row';
      const name=document.createElement('span');name.textContent=row.name+' #'+row.id;
      const count=document.createElement('input');count.type='number';count.min='1';count.max='200';count.step='1';count.value=row.count;count.setAttribute('aria-label','Count for '+row.name+' #'+row.id);
      count.addEventListener('input',()=>{row.count=count.value;$('mixedRosterHelp').textContent='Local roster-v1 · prepare again after count changes.';invalidateTest();});
      const pick=document.createElement('button');pick.type='button';pick.id='mixedPick'+i;pick.textContent='Change…';pick.addEventListener('click',()=>window.CoeFindStandaloneTarget(e=>{if(mixedRows.some((r,n)=>n!==i&&r.id===e.id))throw Error('This type is already in the roster. Edit its count.');mixedRows[i]={id:e.id,name:e.name,count:row.count};renderMixed();invalidateTest();},pick.id));
      const remove=document.createElement('button');remove.type='button';remove.textContent='Remove';remove.addEventListener('click',()=>{mixedRows.splice(i,1);if(mixedRows.length===1){showDefender(mixedRows[0]);$('standaloneCount').value=mixedRows[0].count;mixedRows=[];}renderMixed();invalidateTest();});
      line.append(name,count,pick,remove);$('mixedRosterRows').append(line);
    }
  }
  $('addMixedTarget').addEventListener('click',()=>{
    window.CoeFindStandaloneTarget(e=>{
      const rows=mixedRows.length?mixedRows:[{...defender,count:$('standaloneCount').value}];
      if(rows.some(r=>r.id===e.id))throw Error('This type is already selected. Edit its count.');
      if(rows.length>=8)throw Error('Use at most eight types.');
      mixedRows=[...rows,{id:e.id,name:e.name,count:'1'}];renderMixed();invalidateTest();
    },'addMixedTarget');
  });
  function showDefender(entry){
    defender={id:entry.id,name:entry.name};
    $('standaloneTargetName').textContent='Target · '+entry.name+' #'+entry.id;
    $('standaloneTargetInfo').textContent=(Number.isInteger(entry.fields?.hp)?'Base HP '+entry.fields.hp+' · installed 5.43. ':'')+'1–200 of this unit. The field checks each defender and reads its elemental resistance. Area uses the source code. Check individual hits in the combat log.';
  }
  $('findStandaloneTarget').addEventListener('click',()=>window.CoeFindStandaloneTarget(entry=>{
    const changed=entry.id!==defender?.id || entry.name!==defender?.name;
    showDefender(entry);
    if(changed)invalidateTest();
  }));
  function testSource(){
    if(originalRequest)return {text:JSON.stringify(originalRequest),mode:'c5m'};
    return meleeRequest?window.CoeWorkbenchSession.meleeSource():window.CoeWorkbenchSession.testSource();
  }
  let creationDirty=false,testDirty=false,prepared=null,snapshot=null,saving=false,creationTarget='coe5se',weaponNameOverride=false;
  const message=(id,text,error=false)=>{$(id).textContent=text;$(id).classList.toggle('error',error);};
  window.CoeCreationState=()=>creationDirty||testDirty||!!window.CoeTestObservationDirty?.();
  window.CoeMarkTestPrepared=()=>{testDirty=false;};
  window.CoePreparedTest=()=>{
    if(!prepared||!snapshot)throw new Error('Prepare files from the current draft first.');
    const source=testSource();
    if(source.text!==snapshot.text||source.mode!==snapshot.mode)throw new Error('The draft changed. Regenerate the test.');
    return {...prepared,source:source.text,mode:source.mode,sourceName:originalRequest?'Original record reference':window.CoeWorkbenchSession.returnDraft().filename};
  };
  window.CoeTestDraftChanged=()=>{if(prepared)try{window.CoePreparedTest();}catch{invalidateTest();}};
  function closeCreate(){
    if(creationDirty&&!window.confirm('Discard the new-definition form? The current source draft stays unchanged.'))return;
    creationDirty=false;$('creationDialog').close();$('newDefinition').focus();
  }
  function startDefinition(){
    creationTarget=window.CoeWorkbenchSession.target();const native=creationTarget==='vanilla';
    for(const key of keys)$('create-'+key).value=key==='aoe'?'0':'';
    if(native){for(const [key,v] of Object.entries({range:'1',init:'5',dmgtype:'3',dmg:'0'}))$('create-'+key).value=v;}
    $('rangedStarter').hidden=$('particleStarter').hidden=!native;
    weaponNameOverride=false;$('useSpellName').hidden=native;$('weaponNameHelp').hidden=native;
    for(const key of ['path','dmgtype','look','flymode','flylook','sound','flysound'])$('create-'+key+'Info').textContent='';
    for(const key of ['spellName','path','level','weaponDamage']){$('create-'+key+'-label').hidden=native;$('create-'+key).disabled=native;}
    $('creationHeading').textContent=native?'New native weapon':'New spell + weapon';
    $('creationIntro').textContent=native?'Create a standalone native weapon fragment. No spell, Lua helper or extender dependency is added. Choose a unique name; the optional CoE5SE test equips a private carrier for simple melee or projectile weapons.':'Create a linked CoE5SE pair in a new draft. The weapon is declared first and referenced by its exact quoted name. Choose unique names.';
    $('creationDamage').textContent=native?'Damage type and weapon base damage belong to the source. Set the carrier attack payload when preparing a CoE5SE test. Choose flight and impact separately.':'Damage type determines each payload’s meaning. Weapon base damage and the spell’s attack payload are separate; mask builders change only the field you choose.';
    damageContext(true);
    $('create-mode').value=native?'c5m':$('mode').value;$('create-mode').disabled=native;$('creationFormatControls').hidden=native;$('nativeCreationFormat').hidden=!native;creationDirty=false;message('creationStatus','');$('creationDialog').showModal();$('create-'+(native?'weaponName':'spellName')).focus();
  }
  $('useProjectileSetup').addEventListener('click',()=>{
    if(creationTarget!=='vanilla')return;
    for(const [key,value] of Object.entries({range:'5',flymode:'1',flylook:'7',look:'68'}))$('create-'+key).value=value;
    $('create-flymodeInfo').textContent='Sprite mode · #1';$('create-flylookInfo').textContent='Ballista bolt · sprite #7';$('create-lookInfo').textContent='Flame · impact #68';
    creationDirty=true;message('creationStatus','Range 5, sprite mode 1, ballista bolt #7 and flame impact #68 selected.');
  });
  for(const [button,role] of [['chooseSpriteFlight','sprite'],['chooseParticleFlight','particle'],['chooseRangedImpact','impact']]){
    $(button).addEventListener('click',()=>{
      if(creationTarget!=='vanilla')return;
      window.CoeOpenChoices({type:role==='sprite'?'projectile':'effect',rangedRole:role,returnTo:button},entry=>{
        if(role==='impact'){
          $('create-look').value=String(entry.id);
          $('create-lookInfo').textContent=entry.name+' · #'+entry.id;
        }else{
          if(['','1'].includes($('create-range').value))$('create-range').value='5';
          $('create-flymode').value=role==='sprite'?'1':'2';
          $('create-flylook').value=String(entry.id);
          $('create-flymodeInfo').textContent=role==='sprite'?'Sprite mode · #1':'Standard particle flight · #2';
          $('create-flylookInfo').textContent=entry.name+' · #'+entry.id;
        }
        $('creatorVisuals').open=true;creationDirty=true;
        message('creationStatus','Selected '+entry.name+' #'+entry.id+' for '+role+'.');
      });
    });
  }
  $('findOriginalForTest').addEventListener('click',()=>window.CoeOpenChoices?.({type:window.CoeWorkbenchSession.selectedType()==='weapon'?'weapon':'spell',returnTo:'findOriginalForTest'}));
  $('newDefinition').addEventListener('click',()=>startDefinition());
  $('startSpell').addEventListener('click',()=>{if(!$('startSpell').disabled)startDefinition();});
  $('startWeapon').addEventListener('click',()=>{if(!$('startWeapon').disabled)startDefinition();});
  $('startOpen').addEventListener('click',()=>$(window.CoeDesktop?'desktopOpen':'openFile').click());
  for(const [button,key]of [['chooseWeaponPayload','dmg'],['chooseSpellPayload','weaponDamage']])$(button).addEventListener('click',()=>window.CoeOpenPayload($('create-dmgtype').value,$('create-'+key),()=>{creationDirty=true;}));
  $('create-dmgtype').addEventListener('change',()=>{damageContext(true);creationDirty=true;});
  $('create-dmgtype').addEventListener('input',()=>damageContext(true));
  $('manualDamageAck').addEventListener('change',()=>{creationDirty=true;});
  for(const key of [...keys,'mode'])$('create-'+key).addEventListener('input',()=>{creationDirty=true;});
  $('create-spellName').addEventListener('input',()=>{if(creationTarget==='coe5se'&&!weaponNameOverride)$('create-weaponName').value=$('create-spellName').value;});
  $('create-weaponName').addEventListener('input',()=>{weaponNameOverride=true;});
  $('useSpellName').addEventListener('click',()=>{weaponNameOverride=false;$('create-weaponName').value=$('create-spellName').value;creationDirty=true;});
  $('closeCreation').addEventListener('click',closeCreate);
  $('creationDialog').addEventListener('cancel',event=>{event.preventDefault();closeCreate();});
  $('creationForm').addEventListener('submit',event=>{
    event.preventDefault();
    try{
      const input=Object.fromEntries(keys.map(key=>[key,$('create-'+key).value]));
      input.manualDamage=$('manualDamageAck').checked===true;
      const result=creationTarget==='vanilla'?api.weaponDefinition(input):api.definition(input,$('create-mode').value);
      if(!window.CoeWorkbenchSession.openGenerated(result))return;
      creationDirty=false;$('creationDialog').close();$('selectedHeading').focus();
    }catch(error){message('creationStatus',error.message,true);$('creationStatus').focus();}
  });
  function closeTest(){
    if(saving||window.CoeIsolatedTestBusy?.()){message('testStatus','Finish the current test operation first.',true);return;}
    if(testDirty&&!window.confirm('Close test preparation without exporting this package?'))return;
    testDirty=false;$('testDialog').close();$(originalRequest?'browseChoices':'prepareTest').focus();
  }
  function invalidateTest(){prepared=null;snapshot=null;testDirty=true;$('exportTest').disabled=true;$('testFiles').replaceChildren();$('testPreview').value='';message('testStatus','Source or test options changed. Prepare files again; restart the isolated game to test changed definitions.');window.CoeTestPreparationChanged?.(true);}
  $('rangedCompare').addEventListener('change',()=>{renderMixed();invalidateTest();});
  for(const key of ['testModId','testCaster','testEnemy','testCount','standaloneCount','meleePayload'])$(''+key).addEventListener('input',invalidateTest);
  for(const key of ['testCasterId','testEnemyId'])$(key).addEventListener('input',()=>{$(key+'Info').textContent='Direct ID entry; the loaded name must match. Runtime availability unverified.';invalidateTest();});
  for(const [name,id]of [['testCaster','testCasterId'],['testEnemy','testEnemyId']])$(name).addEventListener('input',()=>{$(id).value='';$(id+'Info').textContent='Name only; runtime lookup must find exactly one match.';});
  for(const key of ['path','dmgtype','look','flymode','flylook','sound','flysound'])$('create-'+key).addEventListener('input',()=>{$('create-'+key+'Info').textContent='Direct entry; runtime availability unverified.';});
  for(const [button,name,id]of [['findCaster','testCaster','testCasterId'],['findEnemy','testEnemy','testEnemyId']])$(button).addEventListener('click',()=>window.CoeOpenChoices?.({type:'monster',participant:true,returnTo:name},e=>{
    $(name).value=e.name;$(id).value=e.id===null?'':String(e.id);$(id+'Info').textContent=e.sourceKind+' / '+e.version+' · '+(e.id===null?'name only':'explicit #'+e.id);invalidateTest();
  }));
  for(const key of ['path','dmgtype','look','flymode','flylook','sound','flysound'])$('findCreate-'+key).addEventListener('click',()=>window.CoeOpenChoices?.({type:key==='path'?'path':key==='dmgtype'?'dmgtype':key==='sound'||key==='flysound'?'sound':key==='flymode'?'flymode':key==='flylook'&&$('create-flymode').value==='1'?'projectile':'effect',creator:true,standaloneDamage:key==='dmgtype'&&creationTarget==='vanilla',launch:key==='flysound',returnTo:'create-'+key},e=>{
    $('create-'+key).value=String(e.id);$('create-'+key+'Info').textContent=e.name+' · '+e.sourceKind+' / '+e.version;if(key==='dmgtype')damageContext(true);creationDirty=true;
  }));
  $('testWeaponEditing').addEventListener('change',invalidateTest);
  function openTest(entry=null){
    if(!entry&&$('prepareTest').disabled)return;
    originalRequest=entry?window.CoeOriginal.request(entry):null;
    const original=!!originalRequest;
    meleeRequest=!original && window.CoeWorkbenchSession.isTestWeaponSelection();
    const melee=meleeRequest?window.CoeWorkbenchSession.meleeSource():null;
    const pair=!melee&&!original?window.CoeWorkbenchSession.testSource():null,selectedPair=pair?.adapted;
    $('standaloneTargetGroup').hidden=!melee;
    $('standaloneCount').disabled=!melee;$('standaloneCount').value='1';
    if(melee)showDefender(window.CoeMelee.defaultTarget);
    mixedRows=[];
    const ranged=melee?.route==='ranged';
    $('testHeading').textContent=melee?'Test '+(melee.adapted?'selected ':'standalone ')+melee.route+' weapon':original?'Observe original '+originalRequest.type:selectedPair?'Test selected spell & weapon':'Prepare isolated test';
    $('testIntro').textContent='CoE5 5.43 / CoE5SE 2.13.0 · a disposable field, separate from campaigns. '+(melee?melee.adapted?'Definition-only test: '+melee.spec.weaponName+' from line '+melee.sourceLine+' of '+melee.filename+'. Other mod content is not loaded. Your full draft stays open.':'Use a private carrier for this native .c5m. Your draft stays separate.':original?'Observe a native record; your source draft stays separate.':selectedPair?'Definition-only test: '+pair.spec.spellName+' (line '+pair.sourceLine+') → '+pair.spec.weaponName+' (line '+pair.weaponLine+') from '+pair.filename+'. Other mod content is not loaded. Your full draft stays open.':'Test this generated pair; saved values and visual observations are separate evidence.');
    $('testModeExplanation').textContent=ranged?'Battle (AI) uses native deployment and movement. Check the named ranged attack and distance in the log. Watch for the projectile in flight and the impact at the target separately.':melee?'Battle (AI) runs a regular melee attack with the private carrier. Check the named attacker, weapon and target in the combat log. No spell, range override or saved-value return.':original?
      'Original record: Battle (AI) runs the native battle with the original record. No attack is forced, no range is extended and no weapon is substituted. AI may use the selected spell or weapon zero or several times; battle startup alone does not prove use or a visible effect. Results do not establish general combat, timing, save or VFX compatibility.':
      (selectedPair?'Selected pair':'Generated pair')+': Cast once forces an item-style attack and temporarily extends some weapon ranges. This does not establish ordinary spellcasting, AI, true range, timing, saves or visual accuracy in every situation. Close test, then reopen for fresh targets.';
    $('originalTestScope').hidden=!original&&!melee&&!selectedPair;
    $('originalTestScope').textContent=ranged?melee.spec.weaponName+' · WB Ranged Carrier has one ranged attack (row 0). Weapon base damage '+melee.spec.dmg+', range '+melee.spec.range+'. '+window.CoeMelee.rangedVisuals(melee.spec):melee?melee.spec.weaponName+' · weapon base damage '+melee.spec.dmg+'. WB Melee Carrier copies Spearman stats and replaces all inherited attacks with one melee row. The attack payload belongs to that row.':original?originalRequest.name+' · '+(originalRequest.id===null?'name only':'#'+originalRequest.id)+' · '+originalRequest.sourceKind+' reference. Clean native 5.43 records in a CoE5SE AI battle. Choose a native caster/carrier in game. No private clone, forced cast or edits. Reference-session mods are not loaded.':'';
    if(melee)$('originalTestScope').textContent+=' Damage: '+damage.name(melee.spec.dmgtype)+'. '+window.CoeMelee.areaLabel(melee.spec.aoe)+'. Check each named victim in the combat log.';
    if(selectedPair)$('originalTestScope').textContent='Linked weapon: '+pair.spec.weaponName+' · '+damage.name(pair.spec.dmgtype)+' · spell payload '+pair.spec.weaponDamage+' / weapon base '+pair.spec.dmg+'. Built-in path #'+pair.spec.path+', level '+pair.spec.level+'. '+(pair.otherSpellUsers.length?'Shared by '+pair.otherSpellUsers.length+' other local spell'+(pair.otherSpellUsers.length===1?'':'s')+'. Returned weapon changes also affect those source references.':'No other exact-name local spell link found.')+' Enable the weapon experiment below to save and return supported values. Forced item-style cast; appearance and normal spellcasting are unverified.';
    $('testCasterGroup').hidden=$('testEditingGroup').hidden=$('weaponEditHelp').hidden=original||!!melee;
    $('testEnemyGroup').hidden=$('testCountGroup').hidden=!!melee;
    $('testAdvancedSummary').textContent=melee?'Test identity':'Test identity & participant limits';
    $('testIdHelp').textContent=melee?'Use a unique ID of 1–32 letters, digits or underscores, starting with a letter. Choose native types and counts. Mixed groups use local roster-v1; the carrier keeps its single attack row.':defaultIdHelp;
    $('rangedCompareGroup').hidden=!ranged;const required=ranged&&!window.CoeMelee.fixedVisuals(melee.spec);
    $('rangedCompare').checked=required;$('rangedCompare').setAttribute('data-required',required?'yes':'no');
    $('rangedCompare').disabled=required;$('requiredComparison').textContent=required?' · required for these catalog values':'';
    renderMixed();
    $('meleePayloadGroup').hidden=!melee;$('meleePayload').value='8';
    prepared=null;snapshot=null;testDirty=false;$('testModId').value=(ranged?'WB_Ranged_':melee?'WB_Melee_':original?'WB_Observe_':'WB_Test_')+Date.now().toString(36);$('testCaster').value='Spearman';$('testEnemy').value='Spearman';$('testCount').value='1';
    $('testWeaponEditing').checked=false;
    $('testCasterId').value='13';$('testEnemyId').value='13';for(const id of ['testCasterIdInfo','testEnemyIdInfo'])$(id).textContent='Default Spearman #13 was observed in the isolated 5.43 test. Search to choose another variant.';
    $('exportTest').disabled=true;$('exportTest').hidden=!window.CoeDesktop;$('testFiles').replaceChildren();$('testPreview').value='';
    message('testStatus',melee?'Prepare the private carrier and review its attack before starting.':original?'Prepare an original observation, then an isolated CoE5SE session. No game starts until Start. Actor selection and actual effect observation happen in game.':window.CoeDesktop?'Prepare this draft, then choose compatible runtime files and prepare an isolated session. This draft has no in-game observation yet.':'Package export and isolated launch require the Windows desktop host. You can review the prepared text here.');
    window.CoeTestPreparationChanged?.(true);
    window.CoeRefreshTestSession?.();
    $('testDialog').showModal();$(melee?'meleePayload':original?'testEnemy':'testCaster').focus();
  }
  $('prepareTest').addEventListener('click',()=>openTest());
  window.CoeOpenOriginalTest=entry=>openTest(entry);
  $('closeTest').addEventListener('click',closeTest);$('testDialog').addEventListener('cancel',event=>{event.preventDefault();closeTest();});
  $('testForm').addEventListener('submit',event=>{
    event.preventDefault();
    try{
      const source=testSource();
      const options={modId:$('testModId').value,caster:$('testCaster').value,enemy:$('testEnemy').value,count:$('testCount').value,casterId:$('testCasterId').value,enemyId:$('testEnemyId').value,weaponEditing:$('testWeaponEditing').checked};
      const next=meleeRequest?window.CoeMelee.testPackage(source.text,source.mode,options.modId,$('meleePayload').value,$('rangedCompare').checked,defender,mixedRows.length?'1':$('standaloneCount').value,mixedRows.length?mixedRows.map(r=>({...r,count:Number(r.count)})):null):originalRequest?window.CoeOriginal.testPackage(originalRequest,options):api.testPackage(source.text,source.mode,options);
      prepared=next;snapshot=source;testDirty=true;$('testFiles').replaceChildren();
      for(const f of prepared.files){const option=document.createElement('option');option.value=f.name;option.textContent=f.name;$('testFiles').append(option);}
      $('testFiles').value=prepared.files[0].name;$('testPreview').value=prepared.files[0].text;$('exportTest').disabled=false;
      message('testStatus','Prepared '+prepared.files.length+' text files + original banner.tga.'+(prepared.manifest.experiment?' Weapon editing experiment enabled; parameters stay inside the game session until you explicitly return selected values.':'')+(originalRequest?' Original observation only. Battle (AI) does not guarantee record use or a visible effect.':' Review each file. Preparation alone is not an in-game test.'));window.CoeTestPreparationChanged?.(true);window.CoeFocusTestNext?.();
    }catch(error){prepared=null;snapshot=null;$('exportTest').disabled=true;window.CoeTestPreparationChanged?.(true);message('testStatus',error.message,true);$('testStatus').focus();}
  });
  $('testFiles').addEventListener('change',()=>{if(prepared)$('testPreview').value=prepared.files.find(f=>f.name===$('testFiles').value)?.text||'';});
  $('exportTest').addEventListener('click',async()=>{
    if(!prepared||saving||!window.CoeDesktop)return;
    const packageToSave=prepared;saving=true;$('exportTest').disabled=true;
    try{
      const result=await window.CoeDesktop.exportTestPackage(packageToSave.modId,packageToSave.files);
      if(result){testDirty=prepared!==packageToSave;message('testStatus','Exported '+result.name+'. Install manually in a disposable test profile. The source fragment remains a separate draft.');}
      else message('testStatus','Package export cancelled. Prepared files retained.');
    }catch(error){message('testStatus',error.message,true);}
    finally{saving=false;$('exportTest').disabled=!prepared;}
  });
})();
