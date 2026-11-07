(function(){
  'use strict';
  const api=window.CoeReference,dataApi=window.CoeDataImport,$=id=>document.getElementById(id),pageSize=20;
  let catalog=api.seed(),page=0,selected=null,importing=false;
  function node(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;}
  function status(message,error=false){$('referenceStatus').textContent=message;$('referenceStatus').classList.toggle('error',error);}
  function current(){return catalog.entries.find(e=>e.key===selected);}
  function facts(target,rows){target.replaceChildren();for(const row of rows)target.append(node('dt',row.label),node('dd',row.value));}
  function originalReference(){const e=current();return e?{...e,sourceKind:catalog.kind==='data533'||catalog.gitBlob===api.knownBlob?'historical':'unknown'}:null;}
  $('observeReference').addEventListener('click',()=>{const e=originalReference();if(!window.CoeOriginal.reason(e))window.CoeOpenOriginalTest(e);});
  function renderDetail(){
    const original=originalReference(),why=window.CoeOriginal.reason(original);$('observeReference').hidden=!!why;$('observeReferenceHelp').textContent=original?(why||'Historical identity: rechecked against native 5.43 IDs/names in game. Load installed data in Game data for current metadata. AI battle only; no shared-record edits or faithful clone.'):'';
    const entry=current(),model=entry?api.details(entry):null,effect=entry?api.effectWeapon(catalog,entry):null;
    const target=window.CoeWorkbenchSession.assignmentContext();
    $('referenceName').textContent=entry?.name||'No reference selected';
    $('referenceKind').textContent=entry?(entry.type==='spell'?'Spell reference':'Weapon reference'):'';
    $('referenceOrigin').textContent=entry?(entry.origin==='vanilla'?'Vanilla · '+(entry.verifiedRecord?'5.33 export':catalog.gitBlob?'5.33 names':'documented reference'):'Unknown origin'):'';
    facts($('referenceFacts'),model?.primary||[]);facts($('referenceAdvancedFacts'),model?.advanced||[]);
    $('referenceAdvanced').hidden=!model?.advanced.length;
    $('referenceMissing').textContent=!entry?'':entry.id===null&&!Object.keys(entry.fields).length?'Name only: IDs and properties are unavailable in this index.':model?.summary||'';
    $('referenceEvidence').textContent=entry?.verifiedRecord?'Explicit historical ID · source line '+entry.sourceLine:entry?.idEvidence||'';
    $('followReference').hidden=!entry?.verifiedRecord||entry.type!=='spell';
    $('followReference').disabled=!effect;
    $('followReference').textContent=effect?'View this spell’s weapon: '+effect.name+' (#'+effect.id+')':'Import weapon data to view this spell’s weapon';
    $('referenceVersionWarning').hidden=!entry;
    $('referenceVersionWarning').textContent=entry?.verifiedRecord?'Historical CoE5 5.33 ID. It may differ in your installed game; verify it before testing.':catalog.gitBlob?'Historical 5.33 names. Availability may differ in your installed game.':entry?.origin==='unknown'?'Source and version are unknown. Check this reference against your game or enabled mods.':'Documented reference example; availability in your installed game is not verified.';
    $('assignmentSpell').replaceChildren();
    const placeholder=node('option',target.spells.length?'Choose a spell…':'No source spells available');placeholder.value='';placeholder.disabled=true;$('assignmentSpell').append(placeholder);
    for(const spell of target.spells){const option=node('option',spell.name);option.value=String(spell.id);$('assignmentSpell').append(option);}
    $('assignmentSpell').value=target.selectedId===null?'':String(target.selectedId);
    $('assignmentSpell').disabled=!target.spells.length||target.dirty;
    $('assignmentTarget').textContent=target.spellName?'Destination: '+target.spellName+' in '+target.filename+(target.dirty?' · Apply or discard edits before choosing another spell.':''):target.filename?'Source: '+target.filename+' · no spell selected.':'No source is open.';
    $('assignmentHeading').textContent=entry?.type==='weapon'?'Use '+entry.name+' in your spell':'Choose a weapon for your spell';
    const preview=[];
    let safe=false,token='',reason=!target.available?target.reason:'Choose a weapon reference above. A reference spell cannot be assigned directly.';
    if(entry?.type==='weapon'){
      try{
        token=api.referenceToken(entry);safe=true;
        if(target.available){
          preview.push({label:'Weapon reference',value:target.value===token?token+' (already in the form)':(target.value||'(empty field)')+' → '+token});
          reason='Changes only Weapon reference. Other typed values stay as they are. Choose Apply changes afterward.';
        }
      }catch(error){reason=error.message;}
    }
    const inForm=safe&&target.available&&target.value===token;
    $('useReference').textContent=inForm?(target.appliedValue===token?'Already assigned':'Selected — Apply changes'):'Use this weapon';
    $('useReference').disabled=!safe||!target.available||inForm;
    if(inForm)reason=target.appliedValue===token?'This weapon reference is already in the draft. You can edit other values or review your copy.':'This reference is in the form but not applied. Choose Apply changes to update the draft.';
    if(entry?.type==='spell'&&target.available)reason=effect?'This is a reference spell. Use View this spell’s weapon above, then choose Use this weapon.':entry.verifiedRecord?'This spell’s effect weapon properties are not loaded. Import the matching weapon export, or choose another weapon from the library.':'Only this spell’s name is known. Choose Weapons above to find a weapon; a spell name cannot be assigned as a weapon.';
    facts($('assignmentPreview'),preview);
    $('referenceUseHelp').textContent=reason;
  }
  function render(){
    window.CoeChoicesReference?.(catalog);
    const results=api.search(catalog,$('referenceSearch').value,$('referenceType').value);
    page=Math.min(page,Math.max(0,Math.ceil(results.length/pageSize)-1));
    const shown=results.slice(page*pageSize,(page+1)*pageSize);
    if(!shown.some(e=>e.key===selected))selected=shown[0]?.key||null;
    $('referenceSource').textContent=catalog.label;$('referenceVersion').textContent=catalog.version;
    $('referenceCount').textContent=results.length+' / '+catalog.entries.length+' '+(catalog.kind==='data533'?'records':'references');
    $('referenceProvenance').textContent=catalog.verification+' '+(catalog.coverage||'Completeness not established.')+(catalog.gitBlob?' Git blob: '+catalog.gitBlob:'');
    $('referenceDatasets').replaceChildren();
    for(const dataset of catalog.datasets||[])$('referenceDatasets').append(node('li',dataset.filename+' · '+dataset.count+' records · SHA-256 '+dataset.sha256));
    $('referenceUrl').textContent=catalog.url||'No authoritative source established for this imported index.';
    $('referenceEntries').replaceChildren();
    for(const entry of shown){
      const button=node('button',undefined,'reference-entry'),text=node('span');
      button.type='button';button.setAttribute('aria-current',String(entry.key===selected));
      let meta=entry.type+(entry.id===null?' · name only':' #'+entry.id);
      if(entry.type==='spell'&&entry.fields.path!==undefined)meta+=' · path '+entry.fields.path+' / L'+entry.fields.level;
      text.append(node('small',meta),node('span',entry.name));button.append(text);
      button.addEventListener('click',()=>{selected=entry.key;render();$('referenceName').focus();});$('referenceEntries').append(button);
    }
    if(!shown.length)$('referenceEntries').append(node('p','No matches. Change the name, ID or type filter.','library-empty'));
    $('referencePrevious').disabled=page===0;$('referenceNext').disabled=(page+1)*pageSize>=results.length;
    $('referencePage').textContent=results.length?(page+1)+' / '+Math.ceil(results.length/pageSize):'0 / 0';renderDetail();
  }
  async function accept(packet,announce=true){
    const next=packet.kind==='data533'?await dataApi.parseFiles(packet.files):api.parseIndex(packet.text,packet);
    catalog=next;page=0;selected=null;render();
    const spells=next.entries.filter(e=>e.type==='spell').length,weapons=next.entries.filter(e=>e.type==='weapon').length;
    if(announce)status('Imported '+spells+' spells / '+weapons+' weapons'+(next.kind==='data533'?' · 5.33 values.':' · names only.')+' Source draft unchanged.');
  }
  $('referenceType').value='all';
  $('referenceSearch').addEventListener('input',()=>{page=0;selected=null;render();});
  $('referenceType').addEventListener('change',()=>{page=0;selected=null;render();});
  $('referencePrevious').addEventListener('click',()=>{if(page>0)page--;selected=null;render();$('referenceName').focus();});
  $('referenceNext').addEventListener('click',()=>{page++;selected=null;render();$('referenceName').focus();});
  $('followReference').addEventListener('click',()=>{
    const target=api.effectWeapon(catalog,current());if(!target)return;
    $('referenceSearch').value=String(target.id);$('referenceType').value='weapon';page=0;selected=target.key;render();$('referenceName').focus();
  });
  $('assignmentSpell').addEventListener('change',()=>{
    const value=$('assignmentSpell').value;if(value==='')return;
    window.CoeWorkbenchSession.selectDefinition(Number(value));renderDetail();
  });
  $('useReference').addEventListener('click',()=>{
    if($('useReference').disabled)return;
    try{
      const entry=current(),token=api.referenceToken(entry);
      if(entry.verifiedRecord)window.CoeWorkbenchSession.stageWeaponToken(token);else window.CoeWorkbenchSession.stageWeaponName(entry.name);
      renderDetail();
    }catch(error){status(error.message,true);}
  });
  window.CoeRefreshReference=renderDetail;
  window.CoeFindReferenceWeapon=()=>{$('referenceType').value='weapon';$('referenceSearch').value='';page=0;selected=null;render();window.CoeOpenReferences('findWeapon');};
  $('importNames').hidden=!window.CoeDesktop;$('referenceFileLabel').hidden=!!window.CoeDesktop;
  $('importNames').addEventListener('click',async()=>{
    if(importing)return;importing=true;$('importNames').disabled=true;
    try{const packet=await window.CoeDesktop.importNames();if(packet)await accept(packet);else status('Import cancelled; current library retained.');}
    catch(error){status(error.message,true);}finally{importing=false;$('importNames').disabled=false;}
  });
  $('referenceFile').addEventListener('change',async event=>{
    const files=Array.from(event.target.files||[]);event.target.value='';if(!files.length||importing)return;importing=true;
    try{
      if(files.length>2)throw new Error('Select one spell export and/or one weapon export, or one names.json.');
      const sources=[];
      for(const file of files){
        if(file.size>2*1024*1024)throw new Error('Reference file exceeds 2 MiB.');
        const bytes=new Uint8Array(await file.arrayBuffer()),text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);
        sources.push({filename:file.name,text});
      }
      if(files.length===1&&/\.json$/i.test(files[0].name)){
        const bytes=new TextEncoder().encode(sources[0].text),proof={};
        if(window.crypto?.subtle){
          const prefix=new TextEncoder().encode('blob '+bytes.length+'\0'),input=new Uint8Array(prefix.length+bytes.length);
          input.set(prefix);input.set(bytes,prefix.length);
          proof.gitBlob=Array.from(new Uint8Array(await window.crypto.subtle.digest('SHA-1',input)),b=>b.toString(16).padStart(2,'0')).join('');
        }
        await accept({...sources[0],...proof});
      }else await accept({kind:'data533',files:sources});
    }catch(error){status(error.message,true);}finally{importing=false;}
  });
  render();
  window.CoeReferenceReady=(async()=>{
    if(window.CoeDesktop){importing=true;$('importNames').disabled=true;try{const cached=await window.CoeDesktop.getLibrary();if(cached)await accept(cached,false);else status('Import supported 5.33 exports for values, or a name index.');}catch(error){status('Cache unavailable. Documented example retained. '+error.message,true);}finally{importing=false;$('importNames').disabled=false;}}
    else status('Import local reference files; no automatic download.');
  })();
})();
