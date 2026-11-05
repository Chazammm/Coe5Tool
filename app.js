(function () {
  'use strict';
  const api=window.CoeWorkbench, $=id=>document.getElementById(id);
  const state={original:'',draft:'',exported:'',filename:'',kind:'empty',mode:'c5se',selected:0,changes:[],dirty:false,model:null,visualOpen:false};
  const unsaved=()=>state.dirty || (state.draft!==state.original && state.draft!==state.exported);
  window.CoeDesktopState=unsaved;
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
  function updateWorkflow(){
    const block=state.model?.blocks[state.selected];let step='source',hint='Open a mod file or Try example. You can browse references before opening a source.';
    if(state.kind!=='empty'){
      if(state.dirty){step='edit';hint='Your field changes are not applied yet. Choose Apply changes, then review the updated draft.';}
      else if(state.draft!==state.original&&state.draft!==state.exported){step='review';hint='Changes are applied to the draft. Choose Review changes, then Export copy. Your original file is unchanged.';}
      else if(state.draft!==state.original&&state.draft===state.exported){step='export';hint='Your copy was exported. You can continue editing or open another file.';}
      else if(!block){step='edit';hint='No supported spell or weapon was found. Review the retained text, or open another source.';}
      else if(!block.fields.some(f=>f.editable||f.addable)){step='review';hint='This definition is read-only in the form. Review the retained source, or edit this definition in your text editor.';}
      else{step='edit';hint='Editing '+block.name+'. '+(block.type==='spell'&&block.fields.some(f=>f.key==='weaponRef'&&f.editable)?'Change a supported value, or choose a weapon from the library.':state.model.blocks.some(b=>b.type==='spell')?'Change a supported value, or select a source spell to assign a reference weapon.':'Change a supported value, then choose Apply changes.');}
    }
    $('nextStep').textContent=hint;
    for(const key of ['source','edit','review','export'])$('step-'+key).setAttribute('aria-current',step===key?'step':'false');
  }
  function setDirty(value){
    state.dirty=value;$('download').disabled=value||state.kind==='empty';$('apply').disabled=!value;$('discard').disabled=!value;
    $('reset').disabled=!value && state.draft===state.original;
    $('draftState').textContent=state.kind==='empty'?'No source open':value?'Unapplied field edits':state.draft===state.original?'Original retained · no draft changes':state.draft===state.exported?'Exported copy · no pending changes':'Applied draft · review next';
    $('draftState').classList.toggle('pending',value);
    $('editState').textContent=value?'Apply or discard before switching or exporting.':'Fields match the prepared source.';
    $('sourceState').textContent=value?'Applied draft only. Unapplied field edits are not included below.':'Prepared copy · read only. Export saves a separate file.';
    updateWorkflow();
  }
  function replacementAllowed(){return !unsaved()||window.confirm('Replace this draft? Export a copy first if you need to keep it.');}
  function load(text,name,mode,kind='file'){
    if(text.includes('\0'))throw new Error('Binary or UTF-16 input is not supported. Use a UTF-8 text file.');
    if(new TextEncoder().encode(text).length>2*1024*1024)throw new Error('The prototype accepts files up to 2 MiB. Nothing was truncated.');
    state.original=text;state.draft=text;state.exported=text;state.filename=name;state.kind=kind;state.mode=mode;state.selected=0;state.changes=[];
    $('mode').value=mode;$('search').value='';$('typeFilter').value='all';$('sourcePanel').open=false;render();
    status(kind==='example'?'Example fragment opened. Select either definition to try editing.':`Opened ${name}. Select a spell or weapon to edit; the original stays separate.`);
  }
  function choose(id){
    if(state.dirty){status('Apply or discard field edits before switching definitions.',true);return false;}
    if(!Number.isInteger(id)||!state.model.blocks[id])return false;
    state.selected=id;render();$('selectedHeading').focus();
    status('Definition selected. Fields show explicit source values only.');
    return true;
  }
  function renderLibrary(){
    const query=$('search').value.trim().toLowerCase(),type=$('typeFilter').value;
    const visible=state.model.blocks.filter(b=>(type==='all'||b.type===type)&&b.name.toLowerCase().includes(query));
    $('blockCount').textContent=state.model.blocks.length;$('definitions').replaceChildren();
    $('filterCount').textContent=`${visible.length} of ${state.model.blocks.length} shown`+(state.model.blocks.length&&!visible.some(b=>b.id===state.selected)?' · selected definition is filtered out.':'');
    $('clearFilters').disabled=!query && type==='all';
    for(const b of visible){
      const button=node('button',undefined,'definition-button '+b.type),symbol=node('span',b.type==='spell'?'✦':'◇','entry-mark');
      symbol.setAttribute('aria-hidden','true');button.type='button';button.setAttribute('aria-current',String(b.id===state.selected));
      const text=node('span',undefined,'entry-text');text.append(node('small',`${b.type} · line ${b.header.number}`),node('strong',b.name));
      button.append(symbol,text);button.addEventListener('click',()=>choose(b.id));$('definitions').append(button);
    }
    if(!visible.length)$('definitions').append(node('p',state.kind==='empty'?'Open a mod file or Try example to see its definitions.':state.model.blocks.length?'No matching definitions. Clear the filters to see the library.':'No supported sections found. Your source text is retained for review and export.','library-empty'));
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
    const fields=state.model.blocks[state.selected]?.fields||[];
    setDirty(fields.some(f=>(f.editable||f.addable)&&$('field-'+f.key).value!==f.value));
    status(state.dirty?'Unapplied field edits. Apply them to update the prepared source.':'Fields restored to the prepared source values.');
    window.CoeRefreshReference?.();
  }
  function renderField(field){
    const row=node('div',undefined,'field'),input=node('input'),label=node('label',field.label);
    input.id='field-'+field.key;input.name=field.key;input.value=field.value;input.type='text';input.autocomplete='off';input.spellcheck=false;
    input.disabled=!(field.editable||field.addable);input.setAttribute('aria-describedby',`help-${field.key} error-${field.key}`);
    if(field.addable)input.placeholder='1, 2 or 3';
    label.htmlFor=input.id;label.append(node('code',field.command));
    let helpText=field.editable?field.help:field.reason;
    if(!field.editable&&!field.addable&&field.reason!=='Not explicitly declared here')helpText='The form cannot safely change this value. '+field.reason+'. Use your source editor for this command.';
    if(!field.editable&&!field.addable && field.reason==='Not explicitly declared here')helpText='Not declared here. This form does not add this field; use your source editor.';
    if(field.key==='level'&&!field.editable&&!field.addable && field.reason==='Not explicitly declared here')helpText='Adding level requires a plain spell with only safe path and weapon lines. Other commands or incomplete assignments need manual source editing.';
    const help=node('p',helpText),error=node('p',undefined,'field-error');help.id='help-'+field.key;error.id='error-'+field.key;error.hidden=true;
    if(field.addable)row.append(node('span','Optional · adds a line on Apply','field-tag'));
    else if(!field.editable){row.append(node('span',field.reason==='Not explicitly declared here'?'Not set here':'Read only','field-tag'));if(!field.value)input.placeholder='Not available in this section';}
    input.addEventListener('input',()=>{showFieldIssue(field);updateEdits();});
    row.append(label,input,help,error);return row;
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
  function render(){
    const model=state.model=api.inspect(state.draft,state.mode);
    const block=model.blocks[state.selected]||model.blocks[0];if(block)state.selected=block.id;
    setDirty(false);renderLibrary();
    $('fileLabel').textContent=state.filename||'No mod file open';$('fileLabel').title=state.filename||'Choose Open mod file or Try example';
    $('sourceKind').textContent=({empty:'',example:'Example fragment',file:'Original retained',paste:'Pasted text'})[state.kind];
    $('exampleNotice').hidden=state.kind!=='example';
    $('sourcePanel').hidden=state.kind==='empty';$('reviewSource').disabled=state.kind==='empty';$('sourceChecks').hidden=state.kind==='empty';
    $('inspector').classList.toggle('spell',block?.type==='spell');
    $('definitionSymbol').textContent=block?.type==='spell'?'✦':'◇';
    $('typeBadge').textContent=block?.type==='spell'?'Spell · CoE5SE':block?'Weapon · native syntax':'Start here';
    $('lineLabel').textContent=block?`Line ${block.header.number} · ${block.opener}`:'';
    $('selectedHeading').textContent=block?.name||(state.kind==='empty'?'Edit spells and weapons. Export a new copy.':'No supported definition found');
    $('selectedDescription').textContent=block?(block.opener==='selectweapon'?'Selected weapon; runtime identity is unresolved.':'Declared in this source.')+' Edit the supported values below.':state.kind==='empty'?'Open a .c5m / .c5se file, or choose Try example. Browse the reference library at any time.':'The text is retained. Open Prepared source to review it, or choose another file.';
    $('fieldGuide').hidden=!block;
    $('editForm').hidden=!block;
    $('fields').replaceChildren();$('matches').replaceChildren();
    for(const group of block?groups[block.type]:[]){
      const section=node(group.advanced?'details':'fieldset',undefined,'field-group'),grid=node('div',undefined,'field-grid');section.append(node(group.advanced?'summary':'legend',group.title));
      if(group.advanced){section.id='visualFields';section.open=state.visualOpen;section.addEventListener('toggle',()=>{state.visualOpen=section.open;});grid.setAttribute('role','group');grid.setAttribute('aria-label',group.title);}
      if(group.help)section.append(node('p',group.help,'group-description'));
      for(const key of group.keys)grid.append(renderField(block.fields.find(f=>f.key===key)));
      section.append(grid);
      if(block.type==='spell'&&group.keys.includes('weaponRef')){const find=node('button','Choose a weapon from the library →','library-lookup');find.id='findWeapon';find.type='button';find.addEventListener('click',()=>{window.CoeFindReferenceWeapon?.();});section.append(find);}
      $('fields').append(section);
    }
    for(const field of block?.fields||[])if(field.editable||field.addable){if(showFieldIssue(field)&&['look','flymode','flylook','sound','flysound'].includes(field.key)){$('visualFields').open=true;state.visualOpen=true;}}
    $('apply').hidden=!block;$('discard').hidden=!block;$('spellVfxNote').hidden=block?.type!=='spell';
    if(block?.type==='spell'){
      $('matches').append(node('div',block.matches.length?'Exact name matches in source · runtime unresolved:':'Weapon not resolved here; native or external references are possible.'));
      for(const id of block.matches){
        const target=model.blocks[id],button=node('button',`Inspect weapon: ${target.name} · line ${target.header.number}`);
        button.type='button';button.addEventListener('click',()=>choose(id));$('matches').append(button);
      }
    }
    renderChecks(model,block);$('output').value=state.draft;$('original').value=state.original;
    $('changes').replaceChildren();$('changeCount').textContent=state.changes.length+' change'+(state.changes.length===1?'':'s');
    if(!state.changes.length)$('changes').append(node('li','No applied edits. The draft matches the original text.'));
    for(const c of state.changes){
      const li=node('li');li.append(node('span',`Line ${c.line} · ${c.label}: `));
      if(c.kind==='insert')li.append(node('span','insert '),node('code',c.after.replace(/[\r\n]+$/,'')));
      else li.append(node('code',c.before),node('span',' → '),node('code',c.after));
      $('changes').append(li);
    }
    window.CoeRefreshReference?.();
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
    canStageReference:()=>!!state.model?.blocks[state.selected]?.fields.find(f=>f.key==='weaponRef'&&f.editable),
    assignmentContext,selectDefinition:choose,
    stageWeaponName(name){
      stageReferenceToken('"'+name+'"');
    },
    stageWeaponToken:stageReferenceToken
  });
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
  $('reset').addEventListener('click',()=>{state.draft=state.original;state.changes=[];render();status('Draft reset to the retained original. No file was changed.');});
  $('mode').addEventListener('change',()=>{
    if(state.dirty){$('mode').value=state.mode;status('Apply or discard edits before changing interpretation.',true);return;}
    state.mode=$('mode').value;render();status(state.kind==='empty'?'Format selected for pasted source and examples. No file is open yet.':'Interpretation changed, without format conversion. Downloads keep this source file’s original extension.');
  });
  $('search').addEventListener('input',renderLibrary);$('typeFilter').addEventListener('change',renderLibrary);
  $('clearFilters').addEventListener('click',()=>{$('search').value='';$('typeFilter').value='all';renderLibrary();$('search').focus();});
  $('reviewSource').addEventListener('click',()=>{$('sourcePanel').open=true;$('output').focus();});
  $('exampleButton').addEventListener('click',()=>{if(replacementAllowed())load(api.starter(state.mode),'example.'+state.mode,state.mode,'example');});
  $('browseReferences').addEventListener('click',()=>{$('referenceSearch').focus();status('Browse reference spells and weapons. To assign a weapon, open a source and select a spell.');});
  if(window.CoeDesktop){
    $('browserOpen').hidden=true;$('desktopOpen').hidden=false;$('download').textContent='Export copy ↓';$('runtimeLabel').textContent='WINDOWS DESKTOP';
    $('desktopOpen').addEventListener('click',async()=>{
      if(!replacementAllowed())return;
      try{const source=await window.CoeDesktop.openSource();if(source)load(source.text,source.name,source.mode);}catch(error){status(error.message,true);}
    });
  }
  $('openFile').addEventListener('change',async event=>{
    const file=event.target.files[0];event.target.value='';if(!file||!replacementAllowed())return;
    try{
      if(!/\.(c5m|c5se)$/i.test(file.name))throw new Error('Choose a .c5m or .c5se text file.');
      if(file.size>2*1024*1024)throw new Error('The prototype accepts files up to 2 MiB. Nothing was truncated.');
      const text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(await file.arrayBuffer());
      load(text,file.name,/\.c5m$/i.test(file.name)?'c5m':'c5se');
    }catch(error){status(error instanceof TypeError?'Could not decode UTF-8. Original file was not changed.':error.message,true);}
  });
  $('pasteButton').addEventListener('click',()=>{$('pasteDialog').showModal();$('pasteText').focus();});
  $('closePaste').addEventListener('click',()=>{$('pasteDialog').close();$('pasteButton').focus();});
  $('pasteForm').addEventListener('submit',event=>{
    event.preventDefault();if(!replacementAllowed())return;
    try{load($('pasteText').value,'pasted.'+state.mode,state.mode,'paste');$('pasteDialog').close();$('selectedHeading').focus();}catch(error){status(error.message,true);}
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
  $('mode').value=state.mode;$('typeFilter').value='all';render();status('Open a mod file, Try example, or browse the reference library.');
})();
