(function () {
  'use strict';
  const api=window.CoeWorkbench, $=id=>document.getElementById(id);
  const state={original:'',draft:'',exported:'',filename:'',kind:'empty',generatedType:'',target:'coe5se',mode:'c5se',selected:0,changes:[],dirty:false,model:null,visualOpen:false,view:'detail',fresh:false};
  const overview={type:'spell',spell:{query:'',page:0,scroll:0},weapon:{query:'',page:0,scroll:0}},pageSize=40;
  let opening=false,dragDepth=0;
  let damageBindings=[];
  function damageType(){
    const block=state.model?.blocks[state.selected];if(block?.type==='weapon')return $('field-dmgtype')?.value;
    const ref=$('field-weaponRef')?.value,match=/^"([^"\\]+)"$/.exec(ref||''),weapons=match?state.model.blocks.filter(b=>b.type==='weapon'&&b.name===match[1]):[];
    return weapons.length===1?weapons[0].fields.find(f=>f.key==='dmgtype')?.value:null;
  }
  function refreshDamageFields(){
    const type=damageType(),p=window.CoeDamage.profile(type);
    for(const b of damageBindings){b.caption.textContent=p?.kind==='mask'?(b.key==='dmg'?'Weapon':'Spell')+' '+(p.id===12?'affliction':'benefit')+' mask':p?.kind==='animate'?'Animation payload · 1 tree / 2 fungus':p?.kind==='manual'?'Effect payload · manual':b.original;b.info.textContent=!p?'Linked damage type unresolved; numeric editing is manual.':p.kind==='mask'?'Documented effect mask; Choose payload edits this field only. The test keeps type/payload fixed.':p.kind==='animate'?'1 = tree, 2 = fungus; the field cannot guarantee suitable terrain.':p.kind==='manual'?'Manual payload · creation/export only; isolated setup is unresolved.':p.id===8?'Fear strength against morale · #8.':'Numeric damage · '+window.CoeDamage.name(type)+'.';b.info.title=window.CoeDamage.hint(type);b.button.hidden=!['mask','animate'].includes(p?.kind)||b.input.disabled;}
  }
  const unsaved=()=>state.dirty || (['generated','paste'].includes(state.kind)&&state.draft!==state.exported) || (state.draft!==state.original && state.draft!==state.exported);
  window.CoeDesktopState=()=>unsaved()||!!window.CoeCreationState?.()||!!window.CoeReturnDirty?.();
  const groups={
    weapon:[
      {title:'Damage',keys:['dmg','dmgtype']},
      {title:'Targeting & timing',keys:['range','init','aoe']},
      {title:'Visuals & sound',keys:['look','flymode','flylook','sound','flysound'],advanced:true,help:'Numeric settings only; no renderer or audio. Flight mode controls the flylook catalog.'}
    ],
    spell:[
      {title:'Magic path & level',keys:['path','level']},
      {title:'Weapon assignment',keys:['weaponDamage','weaponRef'],help:'Spell damage belongs to this assignment. The weapon’s own dmg line is a separate setting.'}
    ]
  };
  function status(message,error=false){$('status').textContent=message;$('status').classList.toggle('error',error);}
  function node(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;}
  let referenceReturn='browseReferences';
  function closeReferences(){
    $('referencePanel').hidden=true;$('workspace').classList.toggle('reference-open',false);
    $('browseReferences').setAttribute('aria-expanded','false');
    ($(referenceReturn)||$('browseReferences')).focus();
  }
  function openReferences(returnTo='browseReferences'){
    referenceReturn=returnTo;$('referencePanel').hidden=false;$('workspace').classList.toggle('reference-open',true);
    $('browseReferences').setAttribute('aria-expanded','true');$('referenceSearch').focus();
  }
  window.CoeOpenReferences=openReferences;
  function help(open){
    $('helpPanel').hidden=!open;$('helpButton').setAttribute('aria-expanded',String(open));
    (open?$('helpHeading'):$('helpButton')).focus();
  }
  function isStandaloneWeapon(){
    return state.mode==='c5m' && state.model?.blocks.length===1 && state.model.blocks[0].opener==='newweapon';
  }
  function isTestWeaponSelection(){
    if(state.mode!=='c5m'||state.model?.blocks[state.selected]?.type!=='weapon')return false;
    // Exact generated pairs keep their existing spell/cast workflow.
    if(state.model.blocks.length===2&&state.model.blocks[0].opener==='newweapon'&&state.model.blocks[1].opener==='newspell'){
      try{window.CoeCreation.fromDraft(state.draft,state.mode);return false;}catch{}
    }
    return true;
  }
  function setDirty(value){
    state.dirty=value;$('download').disabled=value||state.kind==='empty';$('apply').disabled=!value;$('discard').disabled=!value;
    $('reset').disabled=!value && state.draft===state.original;
    $('draftState').textContent=state.kind==='empty'?'No source open':value?'Unapplied field edits':['generated','paste'].includes(state.kind)&&state.draft!==state.exported?(state.kind==='paste'?'Pasted':'Generated')+' draft · not exported':['generated','paste'].includes(state.kind)?'Exported copy · no pending changes':state.draft===state.original?'Original retained · no draft changes':state.draft===state.exported?'Exported copy · no pending changes':'Applied draft · not exported';
    $('draftState').classList.toggle('pending',value);
    $('editState').textContent=value?'Not in the draft yet.':'No field edits.';
    $('editState').classList.toggle('pending',value);
    const exportHelp=state.kind==='empty'?'Open or paste source before exporting.':value?'Apply or discard field edits before exporting.':state.generatedType==='native-weapon'?'Export this native weapon fragment to a new .c5m file. Gameplay and enabled-mod capacity are unverified.':'Export a preserved source copy to a new file. This does not convert it to Vanilla. Existing files are never overwritten.';
    $('exportHelp').textContent=exportHelp;$('download').title=exportHelp;
    $('download').textContent=state.generatedType==='native-weapon'?'Export native weapon…':state.target==='vanilla'?'Export source copy':window.CoeDesktop?'Export copy':'Download copy';
    $('reviewHelp').textContent=state.kind==='empty'?'Open or paste source to review it.':value?'Shows the applied draft; pending field edits are excluded.':'Review the prepared source and applied history.';
    $('reviewSource').title=$('reviewHelp').textContent;
    $('apply').title=value?'Put field edits into the prepared draft.':'No field edits to apply.';
    $('discard').title=value?'Restore fields to the prepared draft values.':'No field edits to discard.';
    let testReason=state.kind==='empty'?'Open a supported weapon definition or create a linked CoE5SE pair before preparing a test.':value?'Apply or discard field edits before preparing the test.':'';
    const standalone=isStandaloneWeapon(),weaponSelection=isTestWeaponSelection(),spellSelection=state.model?.blocks[state.selected]?.type==='spell';
    let route,spellTest;
    if(weaponSelection && !value){try{route=window.CoeMelee.fromSource(state.draft,state.mode,state.selected).route;}catch(error){testReason=error.message;}}
    else if(state.target==='vanilla' && !weaponSelection)testReason='The isolated test field requires CoE5SE. Export preserves this full source; inspecting original records is a separate SE observation.';
    if(!weaponSelection && !testReason)try{if(spellSelection)spellTest=window.CoeCreation.fromSource(state.draft,state.mode,state.selected);else window.CoeCreation.fromDraft(state.draft,state.mode);}catch(error){testReason=error.message;}
    $('prepareTest').hidden=state.target==='vanilla'&&!weaponSelection;
    $('prepareTest').textContent=weaponSelection?(route?'Test '+(standalone?'':'selected ')+route+' weapon with CoE5SE…':'Test selected weapon with CoE5SE…'):spellSelection&&spellTest?.adapted?'Test selected spell with CoE5SE…':'Test bench…';$('returnTestValues').textContent=state.target==='vanilla'?'SE test values':'Saved test values';
    $('overviewPending').hidden=!value;
    $('prepareTest').disabled=!!testReason;$('prepareTest').title=testReason||(weaponSelection?'Test only the selected weapon definition with a private '+route+' carrier using CoE5SE 2.13.0. Other mod content is not loaded.':spellTest?.adapted?'Test only '+spellTest.spec.spellName+' and its linked weapon '+spellTest.spec.weaponName+' using CoE5SE. Other mod content is not loaded.':'Prepare an isolated experimental test mod; no game is launched.');
    $('testHelp').textContent=$('prepareTest').title;
    $('findOriginalForTest').textContent=state.target==='vanilla'?'Observe an original via CoE5SE…':'Find an original to observe…';
    $('findOriginalForTest').hidden=state.kind==='empty'||!testReason;
    $('testEligibility').hidden=state.kind==='empty'||!testReason;$('testEligibility').textContent=testReason;
    $('sourceState').textContent=value?'Applied draft only. Unapplied field edits are not included below.':'Prepared copy · read only. Export saves a separate file.';
    window.CoeTestDraftChanged?.();
  }
  function replacementAllowed(){return !unsaved()||window.confirm('Replace this draft? Export a copy first if you need to keep it.');}
  function load(text,name,mode,kind='file',generatedType=''){
    if(!['c5m','c5se'].includes(mode))throw new Error('Unsupported source format. The current draft was retained.');
    if(text.includes('\0'))throw new Error('Binary or UTF-16 input is not supported. Use a UTF-8 text file.');
    if(new TextEncoder().encode(text).length>2*1024*1024)throw new Error('The prototype accepts files up to 2 MiB. Nothing was truncated.');
    state.original=text;state.draft=text;state.exported=['generated','paste'].includes(kind)?'':text;state.filename=name;state.kind=kind;state.generatedType=generatedType;state.mode=mode;state.selected=0;state.changes=[];state.fresh=true;state.view='detail';overview.type=state.target==='vanilla'?'weapon':'spell';for(const type of ['spell','weapon'])overview[type]={query:'',page:0,scroll:0};$('sourceScope').value='target';configureScope();
    $('mode').value=mode;$('search').value='';$('typeFilter').value='all';$('sourcePanel').open=false;render();
    status(kind==='example'?'Example fragment opened.':`Opened ${name}.`);
  }
  function choose(id){
    if(!Number.isInteger(id)||!state.model.blocks[id])return false;
    if(state.dirty){
      if(id===state.selected){overview[overview.type].scroll=$('overviewScroll').scrollTop||0;state.view='detail';renderWorkspace();$('selectedHeading').focus();status('Pending edits retained in this definition.');return true;}
      status('Apply or discard field edits before switching definitions.',true);return false;
    }
    overview[overview.type].scroll=$('overviewScroll').scrollTop||0;state.view='detail';state.selected=id;render();$('selectedHeading').focus();
    status('');
    return true;
  }
  function configureScope(){
    const native=state.target==='vanilla'&&$('sourceScope').value!=='all';
    for(const option of $('sourceScope').children)if(option.value==='target')option.textContent=state.target==='vanilla'?'Vanilla · weapons':'CoE5SE · spells & weapons';
    const previous=$('typeFilter').value;$('typeFilter').replaceChildren();
    for(const [value,text]of native?[['all','Weapons']]:[['all','All definitions'],['spell','Spells · CoE5SE'],['weapon','Weapons']]){const option=node('option',text);option.value=value;$('typeFilter').append(option);}
    $('typeFilter').value=native?'all':previous||'all';
    $('overviewSpells').hidden=native;if(native)overview.type='weapon';
  }
  function scopeNotes(){
    const spells=state.model.blocks.filter(b=>b.type==='spell').length,excluded=state.target==='vanilla'&&$('sourceScope').value!=='all'&&spells;
    $('retainedContentNote').textContent=excluded?spells+' CoE5SE spell definition'+(spells===1?' is':'s are')+' retained outside this weapon view. Nothing was removed.':$('sourceScope').value==='all'?'All recognized source content · includes CoE5SE spells.':'';
    $('inspectAllSource').hidden=!excluded;
  }
  function renderWorkspace(){
    const show=state.view==='overview'&&state.kind!=='empty';$('sourceOverview').hidden=!show;$('inspector').hidden=show;$('openOverview').disabled=state.kind==='empty';$('backToOverview').hidden=state.kind==='empty';
    if(show)renderOverview();
  }
  function renderOverview(){
    const ctx=overview[overview.type],rows=window.CoeSourceOverview.rows(state.model,overview.type,ctx.query,state.target,$('sourceScope').value||'target');ctx.page=Math.min(ctx.page,Math.max(0,Math.ceil(rows.length/pageSize)-1));
    $('overviewSearch').value=ctx.query;$('overviewSpells').setAttribute('aria-pressed',String(overview.type==='spell'));$('overviewWeapons').setAttribute('aria-pressed',String(overview.type==='weapon'));
    $('overviewHeading').textContent=(overview.type==='spell'?'Spells · CoE5SE':'Weapons')+' / '+(state.filename||'source');
    $('overviewSummary').textContent=rows.length+(rows.length===1?' match':' matches')+' · line numbers distinguish duplicate names · '+state.model.blocks.length+' recognized source sections';$('overviewPending').hidden=!state.dirty;
    const tr=node('tr');for(const label of overview.type==='spell'?['Definition / line','Path · level','Weapon · payload','Local relationship']:['Definition / line','Type · payload','Range · area','Local usage']){const th=node('th',label);th.setAttribute('scope','col');tr.append(th);}$('overviewColumns').replaceChildren(tr);$('overviewRows').replaceChildren();
    for(const r of rows.slice(ctx.page*pageSize,(ctx.page+1)*pageSize)){
      const row=node('tr'),name=node('td'),button=node('button',r.name,'overview-name');button.type='button';button.setAttribute('aria-current',String(r.id===state.selected));button.setAttribute('data-source-id',String(r.id));button.setAttribute('aria-label','Open '+r.name+', line '+r.line);button.addEventListener('click',()=>choose(r.id));
      name.append(button,node('small','Line '+r.line+' · '+r.opener+(r.extenderLines?' · SE-prefixed lines':'')+(r.partial?' · partial / read-only':'')));row.append(name,node('td',r.primary),node('td',r.secondary));const usage=node('td',r.relationship);if(r.links.length)usage.append(node('small',r.links.slice(0,3).map(l=>l.name+' · line '+l.line).join('; ')+(r.links.length>3?' …':'')));row.append(usage);$('overviewRows').append(row);
    }
    if(!rows.length){const row=node('tr'),cell=node('td','No matching source entries. Clear the search or choose All preserved source to inspect content outside the target.');cell.setAttribute('colspan','4');row.append(cell);$('overviewRows').append(row);}
    $('overviewPage').textContent='Page '+(ctx.page+1)+' / '+Math.max(1,Math.ceil(rows.length/pageSize));$('overviewPrevious').disabled=ctx.page===0;$('overviewNext').disabled=(ctx.page+1)*pageSize>=rows.length;$('overviewScroll').scrollTop=ctx.scroll;
  }
  function showOverview(){state.view='overview';renderWorkspace();const selected=Array.from($('overviewRows').children).map(r=>r.children[0]?.children[0]).find(b=>b?.getAttribute('data-source-id')===String(state.selected));(selected||$('overviewHeading')).focus({preventScroll:true});}
  function renderLibrary(){
    const query=$('search').value.trim().toLowerCase(),type=$('typeFilter').value;
    const visible=state.model.blocks.filter(b=>window.CoeSourceOverview.inScope(b,state.target,$('sourceScope').value||'target')&&(type==='all'||b.type===type)&&window.CoeSourceOverview.matches(b.name,b.header.number,query));
    $('blockCount').textContent=state.model.blocks.length;$('definitions').replaceChildren();
    $('filterCount').textContent=`${visible.length} of ${state.model.blocks.length} shown`+(state.model.blocks.length&&!visible.some(b=>b.id===state.selected)?' · selected definition is filtered out.':'');
    $('clearFilters').disabled=!query && type==='all';
    scopeNotes();if(visible.length>150)$('filterCount').textContent=visible.length+' of '+state.model.blocks.length+' match · first 150 listed here; overview and search cover all matches.';
    for(const b of visible.slice(0,150)){
      const button=node('button',undefined,'definition-button '+b.type);
      button.type='button';button.setAttribute('aria-current',String(b.id===state.selected));
      const text=node('span',undefined,'entry-text');text.append(node('small',`${b.type} · line ${b.header.number}${b.header.marked||b.entries.some(e=>e.marked)?' · SE-prefixed':''}`),node('strong',b.name));
      button.append(text);button.addEventListener('click',()=>choose(b.id));$('definitions').append(button);
    }
    if(!visible.length)$('definitions').append(node('p',state.kind==='empty'?'No source definitions.':state.model.blocks.length?'No matching definitions. Clear the filters to see the index.':'No supported sections found. Source text retained.','library-empty'));
  }
  function fieldIssue(field){
    const value=$('field-'+field.key).value;
    return field.addable && value===''?'':api.validateValue(field,value);
  }
  function showFieldIssue(field){
    const issue=fieldIssue(field);$('field-'+field.key).setAttribute('aria-invalid',String(!!issue));
    $('error-'+field.key).textContent=issue;$('error-'+field.key).hidden=!issue;return issue;
  }
  function updateEdits(){
    refreshDamageFields();
    const fields=state.model.blocks[state.selected]?.fields||[];
    for(const f of fields)if(f.editable||f.addable)$('field-'+f.key).classList.toggle('changed',$('field-'+f.key).value!==f.value);
    setDirty(fields.some(f=>(f.editable||f.addable)&&$('field-'+f.key).value!==f.value));
    status('');
    window.CoeRefreshReference?.();
    window.CoeReturnPendingChanged?.();
  }
  function renderField(field){
    const row=node('div',undefined,'field'),input=node('input'),label=node('label'),caption=node('span',field.label);label.append(caption);
    input.id='field-'+field.key;input.name=field.key;input.value=field.value;input.type='text';input.autocomplete='off';input.spellcheck=false;
    input.disabled=!(field.editable||field.addable);input.setAttribute('aria-describedby',`help-${field.key} error-${field.key}`);
    if(field.addable)input.placeholder=field.key==='level'?'1, 2 or 3':'Blank keeps source unchanged';
    label.htmlFor=input.id;label.append(node('code',field.command));
    let helpText=field.editable?field.help:field.reason;
    if(!field.editable&&!field.addable&&field.reason!=='Not explicitly declared here')helpText='The form cannot safely change this value. '+field.reason+'. Use your source editor for this command.';
    if(!field.editable&&!field.addable && field.reason==='Not explicitly declared here')helpText='Not declared here. This form does not add this field; use your source editor.';
    if(field.key==='level'&&!field.editable&&!field.addable && field.reason==='Not explicitly declared here')helpText='Adding level requires a plain spell with only safe path and weapon lines. Other commands or incomplete assignments need manual source editing.';
    const help=node('p',helpText),error=node('p',undefined,'field-error');help.id='help-'+field.key;error.id='error-'+field.key;error.hidden=true;
    if(field.addable)row.append(node('span','Optional · adds a line on Apply','field-tag'));
    else if(!field.editable){row.append(node('span',field.reason==='Not explicitly declared here'?'Not set here':'Read only','field-tag'));if(!field.value)input.placeholder='Not available in this section';}
    input.addEventListener('input',()=>{showFieldIssue(field);updateEdits();});
    const controls=node('div',undefined,'field-controls');controls.append(input);
    row.append(label,controls);
    if(field.editable){
      const about=node('button','?','field-help');about.type='button';about.setAttribute('aria-label','About '+field.label);about.setAttribute('aria-expanded','false');about.setAttribute('aria-controls',help.id);help.hidden=true;
      about.addEventListener('click',()=>{help.hidden=!help.hidden;about.setAttribute('aria-expanded',String(!help.hidden));});controls.append(about);
    }
    row.append(help,error);
    if(['dmg','weaponDamage'].includes(field.key)){
      const button=node('button','Choose payload…','quiet-button'),info=node('p','','caption');button.type='button';
      button.addEventListener('click',()=>window.CoeOpenPayload(damageType(),input,()=>{showFieldIssue(field);updateEdits();}));
      row.append(button,info);damageBindings.push({caption,button,info,input,key:field.key,original:field.label});
    }
    const choiceKinds={path:'path',weaponRef:'weapon',dmgtype:'dmgtype',look:'effect',flymode:'flymode',flylook:'effect',sound:'sound',flysound:'sound'};
    if(choiceKinds[field.key]&&(field.editable||field.addable)){
      const find=node('button','Find…','quiet-button'),info=node('p','','caption');find.type='button';find.setAttribute('aria-label','Find '+field.label);
      const visualRole=()=>state.mode==='c5m'&&state.model.blocks[state.selected]?.type==='weapon'?(field.key==='look'?'impact':field.key==='flylook'?({'1':'sprite','2':'particle'})[$('field-flymode')?.value]:undefined):undefined;
      const role=visualRole(),known=role&&window.CoeMelee.catalog[role][field.value];
      if(known)info.textContent=window.CoeMelee.visualName(role,field.value)+' #'+field.value+' · 5.43 reference · '+role;
      find.addEventListener('click',()=>window.CoeOpenChoices?.({type:field.key==='flylook'&&$('field-flymode')?.value==='1'?'projectile':choiceKinds[field.key],rangedRole:visualRole(),returnTo:input.id,standaloneDamage:field.key==='dmgtype'&&isTestWeaponSelection(),launch:field.key==='flysound'},e=>{
        if($('field-'+field.key)!==input)throw new Error('The source control changed; choose again.');
        const value=field.key==='weaponRef'?(e.id===null?'"'+e.name+'"':String(e.id)):String(e.id),issue=api.validateValue(field,value);
        if(issue)throw new Error(issue);input.value=value;info.textContent=e.name+' · '+e.sourceKind+' / '+e.version;showFieldIssue(field);updateEdits();
      }));input.addEventListener('input',()=>{info.textContent='Direct entry; runtime availability unverified.';});controls.append(find);row.append(info);
    }
    return row;
  }
  function renderChecks(model,block){
    $('diagnostics').replaceChildren();$('checkCount').textContent=model.diagnostics.length+' file note'+(model.diagnostics.length===1?'':'s');
    const here=d=>block && d.line>=block.header.number && model.lines[d.line-1]?.start<block.end;
    const selected=model.diagnostics.filter(here),others=model.diagnostics.filter(d=>!here(d));
    const item=d=>node('li',`${d.severity[0].toUpperCase()+d.severity.slice(1)} · line ${d.line} · ${d.message}`,d.severity);
    for(const d of selected)$('diagnostics').append(item(d));
    if(!selected.length)$('diagnostics').append(node('li',block?'No issues found here by the supported partial checks.':'Your source text is retained for review and export.'));
    if(others.length){
      const li=node('li'),details=node('details'),list=node('ul');details.append(node('summary',`${others.length} notes in other definitions`));
      for(const d of others)list.append(item(d));details.append(list);li.append(details);$('diagnostics').append(li);
    }
  }
  function renderTarget(){
    const native=state.target==='vanilla';
    $('target').value=state.target;
    $('newDefinition').textContent=native?'New weapon':'New spell + weapon';
    $('startSpellOption').hidden=native;$('startSpell').disabled=native;
    $('startWeaponOption').hidden=!native;$('startWeapon').disabled=!native;
    $('startHeading').textContent=native?'Shape a native weapon.':'Make a spell. Shape its weapon.';
    $('startDescription').textContent=native?'Create a native .c5m weapon or open your source. Your original stays intact; export writes a separate copy.':'Start a definition or open your source. Your original stays intact; export writes a separate copy.';
    $('startEditDetail').textContent=native?'Set supported weapon properties.':'Keep unknown commands and comments.';
    $('startSecondStep').textContent=native?'02 / Review':'02 / Test';
    $('startSecondDetail').textContent=native?'Check the preserved source.':'Prepare a separate CoE5SE session.';
    $('startThirdStep').textContent=native?'03 / Export':'03 / Bring back';
    $('startThirdDetail').textContent=native?'Save a separate .c5m fragment.':'Review saved values, apply, then export.';
    $('librarySpellNote').hidden=native&&$('sourceScope').value!=='all';
    const sourceFormat=state.filename.match(/\.(c5m|c5se)$/i)?.[1].toLowerCase();
    $('formatSummary').textContent=sourceFormat?'Source .'+sourceFormat+(sourceFormat==='c5se'?' · requires CoE5SE':'')+(sourceFormat!==state.mode?' · advanced interpretation override':''):'Paste format: .'+state.mode;
    $('formatOverrideNote').textContent=sourceFormat&&sourceFormat!==state.mode?'Advanced override: which sections are recognized may change. Held source and exported extension remain unchanged.':'Opening a file detects its format. Pasted text has an explicit format choice.';
    const current=state.model?.blocks[state.selected],prefixed=current&&(current.header.marked||current.entries.some(e=>e.marked));$('selectionTargetNote').hidden=!(native&&current&&(current.type==='spell'||sourceFormat==='c5se'||prefixed));
    $('selectionTargetNote').textContent=current?.type==='spell'?'Existing CoE5SE spell · outside the Vanilla target. Inspecting or editing it preserves its dependency; it is retained in the exported source.':sourceFormat==='c5se'?'This .c5se sidecar requires CoE5SE even when its weapon commands use native syntax.':'This weapon contains SE-prefixed lines. Vanilla skips those lines; inspecting/editing them does not convert the source.';
    if(state.kind==='empty'){
      $('typeBadge').textContent=native?'VANILLA / NATIVE WEAPONS':'COE5SE / SPELLS & WEAPONS';
      $('selectedDescription').textContent=native?'Native weapon source editor':'Spell & weapon source editor';
    }
    $('targetDiagnostics').replaceChildren();
    if(state.kind==='empty'){
      $('targetStatus').textContent=state.target==='vanilla'?'Vanilla target · native weapon fragments; no new spell definitions or test field.':'CoE5SE target · linked spells and experimental tests on 5.43 / 2.13.0.';
      $('targetDetails').hidden=true;return;
    }
    const format=state.filename.match(/\.(c5m|c5se)$/i)?.[1].toLowerCase()||state.mode;
    const result=window.CoeTarget.assess(state.draft,format);
    $('targetStatus').textContent=result.status+' · preserved .'+format+' source. Gameplay unverified.';
    $('targetDetails').hidden=false;
    for(const n of result.notes.slice(0,12))$('targetDiagnostics').append(node('li',(n.line?'Line '+n.line+': ':'')+n.message));
    if(result.notes.length>12)$('targetDiagnostics').append(node('li',(result.notes.length-12)+' more unassessed/dependency notes; review the full source.'));
    $('targetDiagnostics').append(node('li',result.scope));
  }
  function render(){
    const model=state.model=api.inspect(state.draft,state.mode);
    if(state.fresh){if(state.target==='vanilla')state.selected=model.blocks.find(b=>b.type==='weapon')?.id??0;if(model.blocks.length>20)state.view='overview';state.fresh=false;}
    const block=model.blocks[state.selected]||model.blocks[0];if(block)state.selected=block.id;
    setDirty(false);renderLibrary();renderTarget();
    $('fileLabel').textContent=state.filename||'No mod file open';$('fileLabel').title=state.filename||'Choose Open mod file or Try example';
    $('sourceKind').textContent=({empty:'',example:'Example fragment',file:'Original retained',paste:'Pasted text',test:'Test source snapshot',generated:'Generated fragment'})[state.kind];
    $('exampleNotice').hidden=state.kind!=='example';
    $('generatedNotice').hidden=state.kind!=='generated';$('originalHeading').textContent=state.kind==='generated'?'Compare generated baseline':'Compare original';
    $('generatedNotice').textContent=state.generatedType==='native-weapon'?'Generated native weapon fragment · no spell, Lua or extender dependency. Export for manual integration; gameplay, assets and mod-set capacity remain unverified.':'Generated CoE5SE fragment · export for integration, or prepare a separate experimental test ZIP. This draft has no in-game observation yet.';
    if(state.kind==='generated'&&model.blocks.some(b=>b.type==='weapon'&&window.CoeDamage.profile(b.fields.find(f=>f.key==='dmgtype')?.value)?.kind==='manual'))$('generatedNotice').textContent='Manual-payload fragment · export for manual integration. Payload meaning and required setup are not validated; isolated testing is unavailable.';
    if(state.kind==='generated'&&model.blocks.some(b=>b.type==='weapon'&&b.fields.find(f=>f.key==='dmgtype')?.value==='25'))$('generatedNotice').textContent='Animate fragment · export for manual integration. Isolated field preparation is unavailable because suitable tree/fungus targets cannot be configured.';
    $('sourcePanel').hidden=state.kind==='empty';$('reviewSource').disabled=state.kind==='empty';$('sourceChecks').hidden=state.kind==='empty';
    $('inspector').classList.toggle('spell',block?.type==='spell');
    $('emptyDesk').hidden=state.kind!=='empty';
    if(state.kind!=='empty')$('typeBadge').textContent=block?.type==='spell'?'SOURCE / Spell · CoE5SE':block?(block.header.marked||block.entries.some(e=>e.marked)?'SOURCE / Weapon · SE-prefixed lines':'SOURCE / Weapon · native syntax'):'SOURCE / .c5m · .c5se';
    $('lineLabel').textContent=block?`Line ${block.header.number} · ${block.opener}`:'';
    $('selectedHeading').textContent=block?.name||(state.kind==='empty'?'At the workbench':'No supported definition found');
    if(state.kind!=='empty')$('selectedDescription').textContent=block?(block.opener==='selectweapon'?'Selected weapon; runtime identity is unresolved.':block.fields.some(f=>f.editable||f.addable)?'':'Read-only definition · this form cannot safely change its values.'):'Text retained. Review or export it with the source controls.';
    $('selectedDescription').hidden=!$('selectedDescription').textContent;
    $('editForm').hidden=!block;
    $('linkedRecords').replaceChildren();
    const linked=block?.type==='spell'?block.matches||[]:block?model.blocks.filter(b=>b.type==='spell'&&b.matches.includes(block.id)).map(b=>b.id):[];
    $('linkedRecords').hidden=!block||!linked.length;
    if(linked.length){
      $('linkedRecords').append(node('span',block.type==='spell'?'Linked weapon':'Used by spell','section-label'));
      for(const id of linked){const other=model.blocks[id],link=node('button',other.name+(linked.length>1?' · line '+other.header.number:'')+' →','linked-record');link.type='button';link.title='Exact source-name match · line '+other.header.number+'; runtime identity unresolved';link.addEventListener('click',()=>choose(id));$('linkedRecords').append(link);}
      if(linked.length>1)$('linkedRecords').append(node('span','Multiple source matches · choose explicitly','caption'));
    }
    $('fields').replaceChildren();damageBindings=[];$('matches').replaceChildren();
    for(const group of block?groups[block.type]:[]){
      const section=node(group.advanced?'details':'fieldset',undefined,'field-group'+(group.advanced?' advanced':'')),grid=node('div',undefined,'field-grid');section.append(node(group.advanced?'summary':'legend',group.title));
      if(group.advanced){section.id='visualFields';section.open=state.visualOpen;section.addEventListener('toggle',()=>{state.visualOpen=section.open;});grid.setAttribute('role','group');grid.setAttribute('aria-label',group.title);}
      if(group.help)section.append(node('p',group.help,'group-description'));
      for(const key of group.keys)grid.append(renderField(block.fields.find(f=>f.key===key)));
      section.append(grid);
      if(block.type==='spell'&&group.keys.includes('weaponRef')){const find=node('button','Choose a weapon from the library','library-lookup');find.id='findWeapon';find.type='button';find.addEventListener('click',()=>{window.CoeFindReferenceWeapon?.();});section.append(find);}
      $('fields').append(section);
    }
    for(const field of block?.fields||[])if(field.editable||field.addable){if(showFieldIssue(field)&&['look','flymode','flylook','sound','flysound'].includes(field.key)){$('visualFields').open=true;state.visualOpen=true;}}
    $('apply').hidden=!block;$('discard').hidden=!block;$('spellVfxNote').hidden=block?.type!=='spell';
    if(block?.type==='spell'){
      if(!block.matches.length)$('matches').append(node('div','Weapon not resolved in this source; native or external references are possible.'));
    }
    refreshDamageFields();renderChecks(model,block);$('output').value=state.draft;$('original').value=state.original;
    $('changes').replaceChildren();$('changeCount').textContent=state.changes.length+' change'+(state.changes.length===1?'':'s');
    if(!state.changes.length)$('changes').append(node('li',state.kind==='generated'?'No applied edits since generation.':'No applied edits. The draft matches the original text.'));
    for(const c of state.changes){
      const li=node('li');li.append(node('span',`Line ${c.line} · ${c.label}: `));
      if(c.kind==='insert')li.append(node('span','insert '),node('code',c.after.replace(/[\r\n]+$/,'')));
      else li.append(node('code',c.before),node('span',' → '),node('code',c.after));
      $('changes').append(li);
    }
    window.CoeRefreshReference?.();
    window.CoeReturnDraftChanged?.();renderWorkspace();
  }
  function assignmentContext(){
    const block=state.model?.blocks[state.selected],spells=(state.model?.blocks||[]).filter(b=>b.type==='spell').map(b=>({id:b.id,name:b.name}));
    const context={spells,selectedId:block?.type==='spell'?block.id:null,spellName:block?.type==='spell'?block.name:null,filename:state.filename,dirty:state.dirty,available:false};
    if(state.kind==='empty')return {...context,reason:'Open a mod file or Try example, then select a spell in that source.'};
    if(!spells.length)return {...context,reason:'This source has no supported spell declarations. Open a source with a CoE5SE spell, or Try example.'};
    if(block?.type!=='spell')return {...context,reason:state.dirty?'Apply or discard your field edits, then choose a spell below.':'Choose a spell from your source below. Reference weapons can be assigned to spells.'};
    const field=block.fields.find(f=>f.key==='weaponRef');
    if(!field?.editable)return {...context,reason:'This spell has no safely editable weapon assignment. '+(field?.reason||'The assignment is unsupported.')+' Use your text editor and reopen the source, or Try example.'};
    return {...context,available:true,value:$('field-weaponRef').value,appliedValue:field.value};
  }
  function stageReferenceToken(value){
    const field=state.model?.blocks[state.selected]?.fields.find(f=>f.key==='weaponRef'&&f.editable);
    if(!field)throw new Error('Select a spell with an editable, explicit weapon assignment first.');
    const issue=api.validateValue(field,value);if(issue)throw new Error(issue);
    $('field-weaponRef').value=value;showFieldIssue(field);updateEdits();$('field-weaponRef').focus();
    status(value!==field.value?'Weapon reference placed in the form for '+state.model.blocks[state.selected].name+'. Choose Apply changes next.':'This weapon reference is already in the draft. Other pending edits are retained.');
  }
  window.CoeWorkbenchSession=Object.freeze({
    target:()=>state.target,
    selectedType:()=>state.model?.blocks[state.selected]?.type,
    returnDraft:()=>returnState(),
    sourceChoices:()=>state.model?.blocks.map(b=>({type:b.type,name:b.name,id:null,fields:{},origin:'draft'}))||[],
    openTestSnapshot(c){
      if(!replacementAllowed())return false;
      if([3,4].includes(c.resultSchema))window.CoeMelee.specification(c.source,c.mode,c.visualCatalog===2);else window.CoeCreation.fromDraft(c.source,c.mode);
      load(c.source,'tested-'+c.modId+'.'+c.mode,c.mode,'test');return true;
    },
    previewTestReturn(context,sample){
      if(state.kind==='empty')throw new Error('Open your draft, or explicitly open the tested source copy first.');
      const current=returnState();return {...window.CoeReturn.plan(context,sample,current),token:JSON.stringify(current)};
    },
    applyTestReturn(review,keys,replaceKeys=[]){
      const before=returnState();
      if(JSON.stringify(before)!==review.token)throw new Error('The draft or field edits changed. Review the updated comparison before applying.');
      const plan=window.CoeReturn.plan(review.context,review.sample,before);
      if(!Array.isArray(keys)||!keys.length||keys.some(k=>!plan.rows.some(r=>r.key===k&&r.available)))throw new Error('Choose at least one available value to apply.');
      if(keys.some(k=>['flymode','flylook'].includes(k))&&!['flymode','flylook'].every(k=>keys.includes(k)))throw new Error('Apply flight mode and flight effect together.');
      if(!Array.isArray(replaceKeys)||plan.rows.some(r=>keys.includes(r.key)&&r.conflict&&!replaceKeys.includes(r.key)))throw new Error('Explicitly choose Replace for each newer draft or field value.');
      const edits={};for(const row of plan.rows)if(keys.includes(row.key)&&!window.CoeReturn.same(row.current,row.proposed))edits[row.key]=row.proposed;
      const pending={};for(const [key,value]of Object.entries(before.inputs)){
        const field=state.model.blocks[before.selected]?.fields.find(f=>f.key===key);
        if(field&&value!==field.value&&!(before.selected===plan.weaponId&&keys.includes(key)))pending[key]=value;
      }
      const result=api.patch(state.draft,state.mode,plan.weaponId,edits);
      state.draft=result.text;state.changes.push(...result.changes);render();
      for(const [key,value]of Object.entries(pending)){
        const field=state.model.blocks[state.selected]?.fields.find(f=>f.key===key);
        if(field&&(field.editable||field.addable)){$('field-'+key).value=value;showFieldIssue(field);}
      }
      updateEdits();(state.dirty?$('apply'):$('download')).focus();
      status('Selected test values applied to '+review.context.weaponName+'. '+(state.dirty?'Your other field edits remain unapplied. Apply or discard those before exporting.':'Export a separate copy when ready.'));
      return {changed:result.changes.length,pendingRetained:Object.keys(pending).length};
    },
    stageTestReturn(review,keys,replaceConflicts=false){
      if(JSON.stringify(returnState())!==review.token)throw new Error('The draft or pending fields changed after review. Review again; nothing was overwritten.');
      const plan=window.CoeReturn.plan(review.context,review.sample,returnState());
      if(plan.blocked)throw new Error(plan.blocked);
      if(!Array.isArray(keys)||!keys.length||keys.some(k=>!plan.rows.some(r=>r.key===k&&r.available!==false)))throw new Error('Choose at least one supported, editable field to stage.');
      if(keys.some(k=>['flymode','flylook'].includes(k))&&!['flymode','flylook'].every(k=>keys.includes(k)))throw new Error('Return flight mode and flight look together to preserve their interpretation.');
      if(plan.rows.some(r=>keys.includes(r.key)&&r.conflict)&&!replaceConflicts)throw new Error('Resolve or explicitly acknowledge newer-value conflicts before staging.');
      if(state.selected!==plan.weaponId&&!choose(plan.weaponId))throw new Error('Select the tested weapon after resolving pending edits.');
      for(const row of plan.rows)if(keys.includes(row.key)){
        const input=$('field-'+row.key);if(!window.CoeReturn.same(input.value,row.proposed))input.value=row.proposed;
        showFieldIssue(state.model.blocks[state.selected].fields.find(f=>f.key===row.key));
      }
      updateEdits();$('apply').focus();status('Selected test values staged in the weapon form. Other pending fields are retained. Review and choose Apply changes, then export a separate copy.');
    },
    canStageReference:()=>!!state.model?.blocks[state.selected]?.fields.find(f=>f.key==='weaponRef'&&f.editable),
    assignmentContext,selectDefinition:choose,
    openGenerated(result){
      if(!replacementAllowed())return false;
      if(state.target==='vanilla'&&result.kind!=='native-weapon')throw new Error('Choose CoE5SE before creating linked spell definitions.');
      const checked=result.kind==='native-weapon'?window.CoeCreation.weaponDefinition(result.spec):window.CoeCreation.definition(result.spec,result.mode);
      load(checked.text,(checked.kind==='native-weapon'?'new-weapon.':'new-definitions.')+checked.mode,checked.mode,'generated',checked.kind||'');
      status(checked.kind==='native-weapon'?'Native weapon fragment prepared. Review and export it for manual integration; it is not an installable mod.':'New linked definitions prepared. Review before exporting; this is a fragment, not an installable mod.');return true;
    },
    isStandaloneWeapon,isTestWeaponSelection,
    meleeSource(){
      if(state.dirty)throw new Error('Apply or discard pending field edits before testing.');
      const selected=window.CoeMelee.fromSource(state.draft,state.mode,state.selected);
      return {...selected,filename:state.filename};
    },
    testSource(){
      if(state.target!=='coe5se')throw new Error('The experimental test field requires the CoE5SE target.');
      if(state.kind==='empty'||state.dirty)throw new Error('Select a supported spell/pair and Apply pending edits before preparing a test.');
      if(state.model.blocks[state.selected]?.type==='spell')return {...window.CoeCreation.fromSource(state.draft,state.mode,state.selected),filename:state.filename};
      const spec=window.CoeCreation.fromDraft(state.draft,state.mode);
      return {text:state.draft,mode:state.mode,spec,adapted:false,otherSpellUsers:[]};
    },
    stageWeaponName(name){
      stageReferenceToken('"'+name+'"');
    },
    stageWeaponToken:stageReferenceToken
  });
  function returnState(){
    const inputs={};for(const f of state.model?.blocks[state.selected]?.fields||[])if(f.editable||f.addable)inputs[f.key]=$('field-'+f.key).value;
    return {text:state.draft,mode:state.mode,filename:state.filename,target:state.target,selected:state.selected,inputs};
  }
  $('editForm').addEventListener('submit',event=>{
    event.preventDefault();
    try{
      const block=state.model.blocks[state.selected];if(!block)return;const edits={};let firstError=null;
      for(const field of block.fields)if(field.editable||field.addable){
        const value=$('field-'+field.key).value;
        if(value!==field.value){edits[field.key]=value;if(showFieldIssue(field)&&!firstError)firstError=field;}
      }
      if(firstError){if(['look','flymode','flylook','sound','flysound'].includes(firstError.key)){$('visualFields').open=true;state.visualOpen=true;}$('field-'+firstError.key).focus();throw new Error(firstError.label+': '+fieldIssue(firstError));}
      const result=api.patch(state.draft,state.mode,state.selected,edits);
      state.draft=result.text;state.changes.push(...result.changes);render();
      const focusKey=Object.keys(edits)[0];(focusKey?$('field-'+focusKey):$('selectedHeading')).focus();
      status(`Applied ${result.changes.length} source change${result.changes.length===1?'':'s'}. Prepared copy updated; existing unrelated text retained.`);
    }catch(error){status(error.message,true);}
  });
  $('discard').addEventListener('click',()=>{render();$('selectedHeading').focus();status('Unapplied field edits discarded. Prepared source is unchanged.');});
  $('reset').addEventListener('click',()=>{state.draft=state.original;state.changes=[];render();status(state.kind==='generated'?'Draft reset to the generated baseline.':'Draft reset to the retained original. No file was changed.');});
  $('mode').addEventListener('change',()=>{
    if(state.dirty){$('mode').value=state.mode;status('Apply or discard edits before changing interpretation.',true);return;}
    state.mode=$('mode').value;render();status(state.kind==='empty'?'Format selected for pasted source and examples. No file is open yet.':'Interpretation changed, without format conversion. Downloads keep this source file’s original extension.');
  });
  $('target').addEventListener('change',()=>{
    const value=$('target').value;if(!['vanilla','coe5se'].includes(value)){$('target').value=state.target;return;}
    state.target=value;if(state.kind==='empty'){state.mode=value==='vanilla'?'c5m':'c5se';$('mode').value=state.mode;}$('sourceScope').value='target';configureScope();renderTarget();renderLibrary();renderWorkspace();setDirty(state.dirty);
    status('Target changed. Source bytes, pending field edits and original format are retained. Exports do not convert existing source.');
  });
  $('search').addEventListener('input',renderLibrary);$('typeFilter').addEventListener('change',renderLibrary);
  $('clearFilters').addEventListener('click',()=>{$('search').value='';$('typeFilter').value='all';renderLibrary();$('search').focus();});
  $('reviewSource').addEventListener('click',()=>{$('sourcePanel').open=true;$('output').focus();});
  $('exampleButton').addEventListener('click',()=>{if(!replacementAllowed())return;if(state.target==='vanilla'){const example=window.CoeCreation.weaponDefinition({weaponName:'Workbench Javelin',dmg:'8',dmgtype:'3',range:'6',init:'7',aoe:'0'});load(example.text,'example.c5m','c5m','example');}else load(api.starter(state.mode),'example.'+state.mode,state.mode,'example');});
  $('browseReferences').addEventListener('click',()=>{if($('referencePanel').hidden)openReferences();else closeReferences();});
  $('closeReferences').addEventListener('click',closeReferences);
  $('referencePanel').addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closeReferences();}});
  $('helpButton').addEventListener('click',()=>help($('helpPanel').hidden));
  $('closeHelp').addEventListener('click',()=>help(false));
  $('helpPanel').addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();help(false);}});
  window.addEventListener('keydown',event=>{if(event.key==='F1'&&!$('pasteDialog').open&&!$('creationDialog').open&&!$('testDialog').open&&!$('returnDialog').open&&!$('choiceDialog').open&&!$('payloadDialog').open){event.preventDefault();help($('helpPanel').hidden);}});
  if(window.CoeDesktop){
    $('browserOpen').hidden=true;$('desktopOpen').hidden=false;$('download').textContent='Export copy';$('runtimeLabel').textContent='DESKTOP / 0.16';
    $('desktopOpen').addEventListener('click',()=>openRead(()=>window.CoeDesktop.openSource()));
  }
  $('openFile').addEventListener('change',async event=>{
    const files=Array.from(event.target.files||[]);event.target.value='';return openFiles(files,false);
  });
  function dialogOpen(){return ['pasteDialog','creationDialog','testDialog','returnDialog','choiceDialog','payloadDialog'].some(id=>$(id)?.open);}
  async function openRead(reader){
    if(opening){status('Another source is being read. Wait before opening another file.',true);return;}
    if(!replacementAllowed())return;const stamp=JSON.stringify(returnState());opening=true;
    try{const source=await reader();if(!source)return;if(dialogOpen())throw new Error('Close the dialog, then open or drop the file again. The draft was retained.');
      if(stamp!==JSON.stringify(returnState())){if(!unsaved())throw new Error('The source view changed while reading. Open or drop the file again.');if(!replacementAllowed())return;}
      load(source.text,source.name,source.mode);
    }catch(error){status(error instanceof TypeError?'Could not decode UTF-8. The current draft and original file were retained.':error.message,true);}finally{opening=false;}
  }
  async function openFiles(files,native){
    try{if(dialogOpen())throw new Error('Close the dialog before dropping a source. Current edits are retained.');if(files.length!==1)throw new Error('Drop exactly one .c5m or .c5se source. Multiple files are not merged or opened; drop them separately.');const file=files[0];
      if(!/\.(c5m|c5se)$/i.test(file.name))throw new Error('Choose a .c5m or .c5se text file. The current draft was retained.');if(file.size>2*1024*1024)throw new Error('Source files must be at most 2 MiB. Nothing was truncated.');
      return await openRead(async()=>{if(native){if(!window.CoeDesktop.openDroppedSource)throw new Error('File drop is unavailable in this host. Use Open mod file.');return window.CoeDesktop.openDroppedSource(files);}const text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(await file.arrayBuffer());return {text,name:file.name,mode:/\.c5m$/i.test(file.name)?'c5m':'c5se'};});
    }catch(error){status(error.message,true);}
  }
  const fileDrag=e=>Array.from(e.dataTransfer?.types||[]).includes('Files');
  function dragFeedback(){const text=dialogOpen()?'Close the open dialog before dropping a source. Current edits are retained.':opening?'Another source is being read. Wait before dropping a file.':'Drop one .c5m or .c5se file to open. Your current draft is protected.';if($('dropFeedback').textContent!==text)$('dropFeedback').textContent=text;$('dropFeedback').hidden=false;}
  window.addEventListener('dragenter',e=>{if(!fileDrag(e))return;e.preventDefault();dragDepth++;dragFeedback();});
  window.addEventListener('dragover',e=>{if(!fileDrag(e))return;e.preventDefault();if(e.dataTransfer)e.dataTransfer.dropEffect=dialogOpen()||opening?'none':'copy';dragFeedback();});
  window.addEventListener('dragleave',e=>{if(!fileDrag(e)&&!dragDepth)return;e.preventDefault();dragDepth=Math.max(0,dragDepth-1);if(!dragDepth)$('dropFeedback').hidden=true;});
  window.addEventListener('drop',async e=>{e.preventDefault();dragDepth=0;$('dropFeedback').hidden=true;await openFiles(Array.from(e.dataTransfer?.files||[]),!!window.CoeDesktop);});
  window.addEventListener('blur',()=>{dragDepth=0;$('dropFeedback').hidden=true;});
  $('pasteButton').addEventListener('click',()=>{$('pasteFormat').value=state.mode;$('pasteDialog').showModal();$('pasteText').focus();});
  $('closePaste').addEventListener('click',()=>{$('pasteDialog').close();$('pasteButton').focus();});
  $('pasteForm').addEventListener('submit',event=>{
    event.preventDefault();if(!replacementAllowed())return;
    try{const format=$('pasteFormat').value||state.mode;load($('pasteText').value,'pasted.'+format,format,'paste');$('pasteDialog').close();$('selectedHeading').focus();}catch(error){status(error.message,true);}
  });
  $('download').addEventListener('click',async()=>{
    if(state.dirty||state.kind==='empty')return;
    const base=state.filename.replace(/\.(c5m|c5se)$/i,'').replace(/[^a-zA-Z0-9_.-]/g,'_')||'definition';
    const extension=state.filename.match(/\.(c5m|c5se)$/i)?.[1].toLowerCase()||state.mode;
    if(window.CoeDesktop){
      const text=state.draft;
      try{
        const saved=await window.CoeDesktop.exportCopy(text,base+'.edited.'+extension);
        if(saved){state.exported=text;setDirty(state.dirty);status(state.draft===text&&!state.dirty?`Exported ${saved.name}. Original file retained; no pending edits.`:'Earlier prepared copy exported. Newer edits remain unsaved.');}
        else status('Export cancelled. Prepared source retained; no file was written.');
      }catch(error){status(error.message,true);}return;
    }
    // Encode held text directly: textarea display normalizes newlines.
    const bytes=new TextEncoder().encode(state.draft),url=URL.createObjectURL(new Blob([bytes],{type:'application/octet-stream'}));
    const link=document.createElement('a');link.href=url;link.download=base+'.edited.'+extension;
    document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    status('Draft copy prepared for download. This source has not been verified in game.');
  });
  $('openOverview').addEventListener('click',showOverview);$('backToOverview').addEventListener('click',showOverview);$('overviewDetail').addEventListener('click',()=>{overview[overview.type].scroll=$('overviewScroll').scrollTop||0;state.view='detail';renderWorkspace();$('selectedHeading').focus();});
  for(const [id,type]of [['overviewSpells','spell'],['overviewWeapons','weapon']])$(id).addEventListener('click',()=>{if($(id).hidden)return;overview[overview.type].scroll=$('overviewScroll').scrollTop||0;overview.type=type;renderOverview();});
  $('overviewSearch').addEventListener('input',()=>{Object.assign(overview[overview.type],{query:$('overviewSearch').value,page:0,scroll:0});renderOverview();});
  for(const [id,delta]of [['overviewPrevious',-1],['overviewNext',1]])$(id).addEventListener('click',()=>{if($(id).disabled)return;overview[overview.type].page+=delta;overview[overview.type].scroll=0;renderOverview();});
  $('sourceScope').addEventListener('change',()=>{configureScope();renderLibrary();renderTarget();renderWorkspace();});$('inspectAllSource').addEventListener('click',()=>{$('sourceScope').value='all';configureScope();renderLibrary();renderTarget();renderWorkspace();});
  $('mode').value=state.mode;$('typeFilter').value='all';$('sourceScope').value='target';configureScope();render();status('');
})();
