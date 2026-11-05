(function(){
  'use strict';
  const api=window.CoeReference,$=id=>document.getElementById(id),pageSize=20;
  let catalog=api.seed(),page=0,selected=null;
  function node(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;}
  function status(message,error=false){$('referenceStatus').textContent=message;$('referenceStatus').classList.toggle('error',error);}
  function current(){return catalog.entries.find(e=>e.key===selected);}
  function renderDetail(){
    const e=current();$('referenceName').textContent=e?.name||'No reference selected';$('referenceFacts').replaceChildren();
    $('referenceOrigin').textContent=e?(e.origin==='vanilla'?'Vanilla · '+(catalog.gitBlob?'historical names':'documented example'):'Unknown origin · user index'):'';
    const facts=e?{'Kind':e.type,'ID':api.display(e.id),'Magic path':api.display(e.fields.path),'Spell level':api.display(e.fields.level),'Damage':api.display(e.fields.dmg),'Weapon link':api.display(e.fields.weapon),'Visuals / sound':'Not provided'}:{};
    for(const [label,value] of Object.entries(facts))$('referenceFacts').append(node('dt',label),node('dd',value));
    $('referenceEvidence').textContent=e?.idEvidence||'';
    let reason='Select a weapon reference.';
    if(e?.type==='weapon'){
      try{api.quotedName(e);reason=window.CoeWorkbenchSession.canStageReference()?'Stages this quoted name only. Apply in the editor; game availability and load order remain unresolved.':'Select a spell in your source with an editable, explicit weapon assignment.';}
      catch(error){reason=error.message;}
    }
    let safe=false;try{safe=!!e && !!api.quotedName(e);}catch{}
    $('useReference').disabled=!safe||!window.CoeWorkbenchSession.canStageReference();$('referenceUseHelp').textContent=reason;
  }
  function render(){
    const results=api.search(catalog,$('referenceSearch').value,$('referenceType').value);
    page=Math.min(page,Math.max(0,Math.ceil(results.length/pageSize)-1));const shown=results.slice(page*pageSize,(page+1)*pageSize);
    if(!shown.some(e=>e.key===selected))selected=shown[0]?.key||null;
    $('referenceSource').textContent=catalog.label;$('referenceVersion').textContent=catalog.version;
    $('referenceCount').textContent=`${results.length} of ${catalog.entries.length} references · names / documented IDs only`;
    $('referenceProvenance').textContent=catalog.verification+'. Completeness not established. '+(catalog.gitBlob?'Git blob: '+catalog.gitBlob+'. ':'')+(catalog.sha256?'SHA-256: '+catalog.sha256:'');
    $('referenceUrl').textContent=catalog.url||'No authoritative source established for this imported file.';
    $('referenceEntries').replaceChildren();
    for(const entry of shown){
      const button=node('button',undefined,'reference-entry'),text=node('span');button.type='button';button.setAttribute('aria-current',String(entry.key===selected));
      text.append(node('small',`${entry.type} · ${entry.origin}${entry.id===null?' · ID not provided':' · documented ID '+entry.id}`),node('span',entry.name));button.append(text);
      button.addEventListener('click',()=>{selected=entry.key;render();$('referenceName').focus();});$('referenceEntries').append(button);
    }
    if(!shown.length)$('referenceEntries').append(node('p','No references match. Change the search or type filter.','library-empty'));
    $('referencePrevious').disabled=page===0;$('referenceNext').disabled=(page+1)*pageSize>=results.length;
    $('referencePage').textContent=results.length?`${page+1} / ${Math.ceil(results.length/pageSize)}`:'0 / 0';renderDetail();
  }
  function accept(packet){
    const next=api.parseIndex(packet.text,packet);catalog=next;page=0;selected=null;render();
    status(`Imported ${next.entries.filter(e=>e.type==='spell').length} spell names and ${next.entries.filter(e=>e.type==='weapon').length} weapon names. Source draft unchanged.`);
  }
  $('referenceType').value='all';
  $('referenceSearch').addEventListener('input',()=>{page=0;selected=null;render();});
  $('referenceType').addEventListener('change',()=>{page=0;selected=null;render();});
  $('referencePrevious').addEventListener('click',()=>{if(page>0)page--;selected=null;render();$('referenceName').focus();});
  $('referenceNext').addEventListener('click',()=>{page++;selected=null;render();$('referenceName').focus();});
  $('useReference').addEventListener('click',()=>{
    try{const entry=current();api.quotedName(entry);window.CoeWorkbenchSession.stageWeaponName(entry.name);status('Name staged in the source form. No source text changes until Apply.');}
    catch(error){status(error.message,true);}
  });
  window.CoeRefreshReference=renderDetail;
  $('importNames').hidden=!window.CoeDesktop;$('referenceFileLabel').hidden=!!window.CoeDesktop;
  $('importNames').addEventListener('click',async()=>{try{const packet=await window.CoeDesktop.importNames();if(packet)accept(packet);else status('Import cancelled. Current reference library retained.');}catch(error){status(error.message,true);}});
  $('referenceFile').addEventListener('change',async event=>{
    const file=event.target.files[0];event.target.value='';if(!file)return;
    try{
      if(file.size>1024*1024)throw new Error('Name index exceeds 1 MiB.');
      const bytes=new Uint8Array(await file.arrayBuffer()),text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes),proof={};
      if(window.crypto?.subtle){const prefix=new TextEncoder().encode('blob '+bytes.length+'\0'),input=new Uint8Array(prefix.length+bytes.length);input.set(prefix);input.set(bytes,prefix.length);proof.gitBlob=Array.from(new Uint8Array(await window.crypto.subtle.digest('SHA-1',input)),b=>b.toString(16).padStart(2,'0')).join('');}
      accept({text,...proof});
    }catch(error){status(error.message,true);}
  });
  render();
  window.CoeReferenceReady=(async()=>{if(window.CoeDesktop){try{const cached=await window.CoeDesktop.getLibrary();if(cached)accept(cached);else status('One documented weapon example is bundled. Import a local name index to expand this partial library.');}catch(error){status('Private cache unavailable. Documented example retained. '+error.message,true);}}else status('Browser fallback · import a local name index, or use the documented example.');})();
})();
