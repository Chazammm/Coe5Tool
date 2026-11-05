(function () {
  'use strict';
  const api=window.CoeWorkbench, $=id=>document.getElementById(id);
  const state={original:'',draft:'',exported:'',filename:'example.c5se',mode:'c5se',selected:0,changes:[],dirty:false,model:null};
  const unsaved=()=>state.dirty || (state.draft!==state.original && state.draft!==state.exported);
  window.CoeDesktopState=unsaved;
  const groups={
    weapon:[
      {title:'Damage',keys:['dmg','dmgtype']},
      {title:'Targeting & timing',keys:['range','init','aoe']},
      {title:'Visuals & sound',keys:['look','flymode','flylook','sound','flysound'],help:'Source settings only — no in-game effect renderer or audio playback. Flight mode determines which catalog flylook uses.'}
    ],
    spell:[
      {title:'Magic path & level',keys:['path','level']},
      {title:'Weapon assignment',keys:['weaponDamage','weaponRef'],help:'Spell damage belongs to this assignment. The weapon’s own dmg line is a separate setting.'}
    ]
  };
  function status(message,error=false){$('status').textContent=message;$('status').classList.toggle('error',error);}
  function node(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;}
  function setDirty(value){
    state.dirty=value;$('download').disabled=value;$('apply').disabled=!value;$('discard').disabled=!value;
    $('reset').disabled=!value && state.draft===state.original;
    $('draftState').textContent=value?'Unapplied field edits':state.draft===state.original?'Original retained · no draft changes':state.draft===state.exported?'Exported copy · no pending changes':'Applied draft · copy ready';
    $('draftState').classList.toggle('pending',value);
    $('editState').textContent=value?'Apply or discard before switching or exporting.':'Fields match the prepared source.';
    $('sourceState').textContent=value?'Applied draft only. Unapplied field edits are not included below.':'Full prepared file · read only. Download creates a separate copy.';
  }
  function replacementAllowed(){return !unsaved()||window.confirm('Replace this draft? Export a copy first if you need to keep it.');}
  function load(text,name,mode){
    if(text.includes('\0'))throw new Error('Binary or UTF-16 input is not supported. Use a UTF-8 text file.');
    if(new TextEncoder().encode(text).length>2*1024*1024)throw new Error('The prototype accepts files up to 2 MiB. Nothing was truncated.');
    state.original=text;state.draft=text;state.exported=text;state.filename=name;state.mode=mode;state.selected=0;state.changes=[];
    $('mode').value=mode;$('search').value='';$('typeFilter').value='all';$('sourcePanel').open=false;render();
    status(`Opened ${name}. Original text retained; supported fields are ready to inspect.`);
  }
  function choose(id){
    if(state.dirty){status('Apply or discard field edits before switching definitions.',true);return;}
    state.selected=id;render();$('selectedHeading').focus();
    status('Definition selected. Fields show explicit source values only.');
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
      const text=node('span',undefined,'entry-text');text.append(node('small',`${b.type==='spell'?'Spell · CoE5SE syntax':'Weapon · native syntax'} · line ${b.header.number}`),node('strong',b.name));
      button.append(symbol,text);button.addEventListener('click',()=>choose(b.id));$('definitions').append(button);
    }
    if(!visible.length)$('definitions').append(node('p',state.model.blocks.length?'No matching definitions. Clear the filters to see the library.':'No supported sections found. Open or paste newweapon, selectweapon or CoE5SE newspell source.','library-empty'));
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
  }
  function renderField(field){
    const row=node('div',undefined,'field'),input=node('input'),label=node('label',field.label);
    input.id='field-'+field.key;input.name=field.key;input.value=field.value;input.type='text';input.autocomplete='off';input.spellcheck=false;
    input.disabled=!(field.editable||field.addable);input.setAttribute('aria-describedby',`help-${field.key} error-${field.key}`);
    if(field.addable)input.placeholder='1, 2 or 3';
    label.htmlFor=input.id;label.append(node('code',field.command));
    let helpText=field.editable?field.help:field.reason;
    if(!field.editable&&!field.addable && field.reason==='Not explicitly declared here')helpText='Not declared here. This form does not add this field; use your source editor.';
    if(field.key==='level'&&!field.editable&&!field.addable && field.reason==='Not explicitly declared here')helpText='Adding level requires a plain spell with only safe path and weapon lines. Other commands or incomplete assignments need manual source editing.';
    const help=node('p',helpText),error=node('p',undefined,'field-error');help.id='help-'+field.key;error.id='error-'+field.key;error.hidden=true;
    if(field.addable)row.append(node('span','Optional insertion · adds one line','field-tag'));
    else if(!field.editable)row.append(node('span','Read only','field-tag'));
    input.addEventListener('input',()=>{showFieldIssue(field);updateEdits();});
    row.append(label,input,help,error);return row;
  }
  function renderChecks(model,block){
    $('diagnostics').replaceChildren();$('checkCount').textContent=model.diagnostics.length+' file note'+(model.diagnostics.length===1?'':'s');
    const here=d=>block && d.line>=block.header.number && model.lines[d.line-1]?.start<block.end;
    const selected=model.diagnostics.filter(here),others=model.diagnostics.filter(d=>!here(d));
    const item=d=>node('li',`${d.severity[0].toUpperCase()+d.severity.slice(1)} · line ${d.line} · ${d.message}`,d.severity);
    for(const d of selected)$('diagnostics').append(item(d));
    if(!selected.length)$('diagnostics').append(node('li',block?'No issues found here by the supported partial checks.':'No definition selected. Source can still be reviewed and downloaded.'));
    if(others.length){
      const li=node('li'),details=node('details'),list=node('ul');details.append(node('summary',`${others.length} notes in other definitions`));
      for(const d of others)list.append(item(d));details.append(list);li.append(details);$('diagnostics').append(li);
    }
  }
  function render(){
    const model=state.model=api.inspect(state.draft,state.mode);
    const block=model.blocks[state.selected]||model.blocks[0];if(block)state.selected=block.id;
    setDirty(false);renderLibrary();
    $('fileLabel').textContent=state.filename;$('fileLabel').title=state.filename;
    $('inspector').classList.toggle('spell',block?.type==='spell');
    $('definitionSymbol').textContent=block?.type==='spell'?'✦':'◇';
    $('typeBadge').textContent=block?.type==='spell'?'CoE5SE spell declaration':block?'Native weapon section':'No definition';
    $('lineLabel').textContent=block?`Line ${block.header.number} · ${block.opener}`:'';
    $('selectedHeading').textContent=block?.name||'Bring a definition to the workbench';
    $('selectedDescription').textContent=block?(block.opener==='selectweapon'?'Selected target origin is unresolved. ':'Custom declaration in this source. ')+'Explicit fields only; inherited values and effective stats are not calculated.':'Open a UTF-8 .c5m / .c5se file, paste a fragment, or load the linked example.';
    $('fields').replaceChildren();$('matches').replaceChildren();
    for(const group of block?groups[block.type]:[]){
      const section=node('fieldset',undefined,'field-group'),grid=node('div',undefined,'field-grid');section.append(node('legend',group.title));
      if(group.help)section.append(node('p',group.help,'group-description'));
      for(const key of group.keys)grid.append(renderField(block.fields.find(f=>f.key===key)));
      section.append(grid);$('fields').append(section);
    }
    for(const field of block?.fields||[])if(field.editable||field.addable)showFieldIssue(field);
    $('apply').hidden=!block;$('discard').hidden=!block;$('spellVfxNote').hidden=block?.type!=='spell';
    if(block?.type==='spell'){
      $('matches').append(node('div',block.matches.length?'Exact name matches in this source (not resolved runtime weapons):':'No exact weapon section resolved in this source. Native and external references remain possible.'));
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
  window.CoeWorkbenchSession=Object.freeze({
    canStageReference:()=>!!state.model?.blocks[state.selected]?.fields.find(f=>f.key==='weaponRef'&&f.editable),
    stageWeaponName(name){
      const field=state.model?.blocks[state.selected]?.fields.find(f=>f.key==='weaponRef'&&f.editable);
      if(!field)throw new Error('Select a spell with an editable, explicit weapon assignment first.');
      const value='"'+name+'"',issue=api.validateValue(field,value);if(issue)throw new Error(issue);
      $('field-weaponRef').value=value;showFieldIssue(field);updateEdits();$('field-weaponRef').focus();
      status('Weapon name staged in the form. Apply to update the draft; game availability and load order are unresolved.');
    }
  });
  $('editForm').addEventListener('submit',event=>{
    event.preventDefault();
    try{
      const block=state.model.blocks[state.selected];if(!block)return;const edits={};let firstError=null;
      for(const field of block.fields)if(field.editable||field.addable){
        const value=$('field-'+field.key).value;
        if(value!==field.value){edits[field.key]=value;if(showFieldIssue(field)&&!firstError)firstError=field;}
      }
      if(firstError){$('field-'+firstError.key).focus();throw new Error(firstError.label+': '+fieldIssue(firstError));}
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
    state.mode=$('mode').value;render();status('Interpretation changed, without format conversion. Downloads keep this source file’s original extension.');
  });
  $('search').addEventListener('input',renderLibrary);$('typeFilter').addEventListener('change',renderLibrary);
  $('clearFilters').addEventListener('click',()=>{$('search').value='';$('typeFilter').value='all';renderLibrary();$('search').focus();});
  $('reviewSource').addEventListener('click',()=>{$('sourcePanel').open=true;$('output').focus();});
  $('exampleButton').addEventListener('click',()=>{if(replacementAllowed())load(api.starter(state.mode),'example.'+state.mode,state.mode);});
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
    try{load($('pasteText').value,'pasted.'+state.mode,state.mode);$('pasteDialog').close();$('selectedHeading').focus();}catch(error){status(error.message,true);}
  });
  $('download').addEventListener('click',async()=>{
    if(state.dirty)return;
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
  load(api.starter('c5se'),'example.c5se','c5se');
})();
