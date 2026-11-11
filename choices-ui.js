(function(){
  'use strict';
  const $=id=>document.getElementById(id),api=window.CoeChoices,host=window.CoeDesktop,pageSize=30;
  let historical=[],installed=[],references=[],loaded=[],notes=[],page=0,selected=null,scope=null,callback=null,focusReturn='browseChoices',busy=false,visible=[],vanilla=false,linked=[];
  const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
  const status=(text,error=false)=>{$('choiceStatus').textContent=text;$('choiceStatus').classList.toggle('error',error);};
  function entries(){return [...new Map([...api.documented(),...historical,...installed,...references,...loaded,...(window.CoeWorkbenchSession.sourceChoices?.()||[]).map((e,i)=>({...e,key:'draft:'+e.type+':'+i,sourceKind:'draft',source:'Current source draft',version:'Runtime unresolved',detail:'Source definition; no runtime ID is assigned here.'}))].map(e=>[e.key,e])).values()];}
  function mark(key){selected=key;for(const b of $('choiceResults').children)if(b.getAttribute)b.setAttribute('aria-current',String(b.getAttribute('data-key')===key));detail();}
  function use(entry){if(!entry||api.allowed(entry,scope)||!callback)return;try{callback(entry);close();}catch(error){status(error.message,true);}}
  function detail(){
    const e=visible.find(e=>e.key===selected);
    $('choiceName').textContent=e?e.name:'No choice selected';$('choiceDetail').textContent=e?e.type+' · '+(e.id===null?'ID unavailable':'#'+e.id)+' · '+e.sourceKind+' · '+e.version+' · '+e.source+' · '+e.detail:'Type part of a name, or browse the matching entries.';
    $('choiceFields').replaceChildren();if(e)for(const [key,value]of Object.entries(e.fields||{})){if(typeof value==='string'||typeof value==='number')$('choiceFields').append(node('dt',scope?.targetRows && key==='hp'?'Base HP':key),node('dd',String(value)));}
    const effect=e?.type==='spell'&&e.fields?.weapon!==undefined?entries().find(w=>w.type==='weapon'&&w.id===Number(e.fields.weapon)&&w.sourceKind===e.sourceKind):null;
    if(effect){$('choiceFields').append(node('dt','Effect weapon'),node('dd','#'+effect.id+' '+effect.name));for(const [key,value]of Object.entries(effect.fields||{}))if(typeof value==='string'||typeof value==='number')$('choiceFields').append(node('dt','weapon '+key),node('dd',String(value)));}
    if(e?.fields?.dmgtype!==undefined||effect?.fields?.dmgtype!==undefined)$('choiceDetail').textContent+=' '+window.CoeDamage.hint(e.fields.dmgtype??effect.fields.dmgtype);
    const model=vanilla?window.CoeVanillaLibrary.model(e,installed):null;
    $('choiceRaw').hidden=!model;$('choiceRawFields').replaceChildren();$('choiceLinks').hidden=!model?.related.length;$('choiceLinked').replaceChildren();linked=model?.related||[];
    $('choiceCopyHelp').hidden=!model;$('choiceCopyHelp').textContent=model?.copy||'';$('choiceObservations').hidden=!model;
    if(model){
      $('choiceDetail').textContent=e.type+' #'+e.id+' · '+e.version;
      $('choiceRawFields').append(...$('choiceFields').children);$('choiceFields').replaceChildren();
      for(const f of model.facts)$('choiceFields').append(node('dt',f.name),node('dd',f.value));
      for(const r of linked){const o=node('option',r.type+' #'+r.id+' · '+r.name);o.value=r.key;$('choiceLinked').append(o);}
      $('choiceLinked').value=linked[0]?.key||'';
    }
    const originalReason=window.CoeOriginal.reason(e);$('observeOriginal').hidden=!!originalReason;$('observeOriginalHelp').textContent=originalReason||model?.test||'Observe the loaded original in a disposable CoE5SE AI battle. No edits, forced cast, reconstruction or desktop preview. Native caster/carrier availability is checked in game.';
    if(e?.type==='dmgtype'&&scope?.standaloneDamage){
      const limit=window.CoeMelee.carrierDamageReason(e.id);
      $('choiceDetail').textContent+=' '+(limit||'Available for the private CoE5SE melee or ranged carrier. Flight and impact keep their own settings.');
    }
    const reason=e?api.allowed(e,scope):'Choose an entry.';$('useChoice').hidden=$('useChoiceHelp').hidden=vanilla;$('useChoice').disabled=!!reason;$('useChoiceHelp').textContent=reason||'Use this explicit value in the selected control. Apply/export remain separate.';
  }
  function render(){
    $('choiceDialog').classList.toggle('vanilla-library',vanilla);
    const role=scope?.rangedRole,targets=scope?.targetRows;
    const damagePicker=scope?.type==='dmgtype';
    $('installedChoiceTools').hidden=$('observeOriginalHelp').hidden=!!role||damagePicker||!!targets;$('generalChoiceTools').hidden=vanilla||!!role||damagePicker||!!targets;
    $('vanillaScope').hidden=!vanilla;$('vanillaScope').textContent='Built-in spells & weapons · your verified CoE5 5.43 executable. Read-only originals; testing requires compatible CoE5SE (3.3.0 / 3.2.2 / 2.13.0). Historical and mod-added entries remain in Game data.';
    $('rangedChoiceHelp').hidden=!role&&!targets;
    if(targets){
      $('rangedChoiceHelp').textContent=scope.coverage;
      $('choiceSource').value=targets[0]?.sourceKind==='installed'?'installed':'all';
    }
    if(role)$('rangedChoiceHelp').textContent={sprite:'Flight mode 1 · manual sprite IDs and native references. #14 has a native reference but no documented name.',particle:'Flight mode 2 · flight-labelled rows and native mode-2 references. The game rechecks the selected ID and name.',impact:'Impact · native strike references and named effects without a specialized role. The game rechecks the selected ID and name.'}[role]+' Empty and placeholder effect rows are excluded. Damage is set separately.';
    const candidates=vanilla?installed:targets|| (role?api.rangedChoices(role,window.CoeMelee.catalog[role]):scope?.particleFlights?entries().filter(e=>!api.allowed(e,scope)):entries());
    const all=api.search(candidates,$('choiceQuery').value,$('choiceType').value,role||targets?'all':$('choiceSource').value);page=Math.max(0,Math.min(page,Math.max(0,Math.ceil(all.length/pageSize)-1)));visible=all.slice(page*pageSize,(page+1)*pageSize);
    if(!visible.some(e=>e.key===selected))selected=visible[0]?.key||null;
    $('choiceResults').replaceChildren();
    for(const [i,e]of visible.entries()){
      const b=node('button'),title=node('strong',e.name),identity=node('span',e.id===null?'name only':'#'+e.id),origin=node('small',e.type+' · '+e.sourceKind+' / '+e.version);identity.className='choice-id';b.append(title,identity,origin);b.type='button';b.setAttribute('aria-current',String(e.key===selected));b.setAttribute('data-key',e.key);b.addEventListener('click',()=>mark(e.key));
      b.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();use(e);}else if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();const n=Math.max(0,Math.min(visible.length-1,i+(event.key==='ArrowDown'?1:-1)));mark(visible[n].key);$('choiceResults').children[n].focus();}});$('choiceResults').append(b);
    }
    if(!all.length)$('choiceResults').append(node('p',vanilla?!host?.loadInstalledChoices?'Installed-game discovery and isolated observation require the Windows desktop app. Source editing and export remain available here.':installed.length?'No matching Vanilla record. Try a partial name, #ID or another category.':'No verified local catalog loaded. Choose Load installed 5.43 spells & weapons… and select your own CoE5.exe. No game is launched.':targets?'No matching native target. Try a partial name or #ID.':role?'No supported '+role+' choice matches. Try a partial name or #ID.':scope?.particleFlights?'No supported particle flight matches. Try a partial name or effect ID, or clear filters.':'No matches in the available data. Clear filters, import historical monsters, or explicitly export/load a runtime catalog. Direct entry is still available.'));
    $('choiceCount').textContent=all.length+(all.length===1?' match':' matches')+' · page '+(page+1)+' of '+Math.max(1,Math.ceil(all.length/pageSize));$('choicePrevious').disabled=page===0;$('choiceNext').disabled=(page+1)*pageSize>=all.length;
    $('choiceCoverage').textContent=targets?scope.coverage:role?'CoE5 5.43 Windows · '+({sprite:'documented or native-referenced flight sprites, mode 1',particle:'standard mode 2 · flight labels or native mode-2 use',impact:'strike candidates · native impacts or unqualified named effects'}[role])+'. IDs distinguish duplicate names. Appearance requires observation.':scope?.particleFlights?'Standard particle flight · effects documented for flight and referenced in mode 2 on CoE5 5.43. The test checks the loaded ID and name. Appearance requires an in-game observation.':(installed.length?'Installed 5.43: '+installed.length+' native spell/weapon names with partial fields, no loaded mods. ':'No installed-game catalog loaded. ')+'Documented tables are partial game catalogs. Historical data is 5.33; runtime availability is not implied. '+(loaded.length?'Loaded runtime choices are bound to their source session. ':'Current runtime choices are not loaded. ')+notes.join(' ');detail();
  }
  function close(){$('choiceDialog').close();($(focusReturn)||$('browseChoices')).focus();}
  window.CoeOpenChoices=(options={},onSelect=null)=>{status('Search by partial name or #ID.');vanilla=!!options.vanilla;scope=options.type?options:null;callback=onSelect;focusReturn=options.returnTo||'browseChoices';$('choiceHeading').textContent=vanilla?'Vanilla spells & weapons':'Search available choices';$('pinnedSource').hidden=!scope?.rangedRole;$('choiceSource').disabled=vanilla||!!scope?.rangedRole||!!scope?.targetRows;$('choiceType').disabled=!!scope?.rangedRole||!!scope?.targetRows||scope?.type==='dmgtype';for(const o of $('choiceType').children)o.hidden=vanilla&&!['all','spell','weapon'].includes(o.value);$('choiceType').value=options.type||'all';$('choiceSource').value=vanilla?'installed':scope?.rangedRole?'pinned':'all';$('choiceQuery').value=options.query||'';page=0;selected=null;$('choiceDialog').showModal();render();$('choiceQuery').focus();};
  $('browseVanilla').addEventListener('click',async()=>{
    window.CoeOpenChoices({vanilla:true,returnTo:'browseVanilla'});status('Search a spell or weapon, then Observe original with CoE5SE. Your draft stays open.');
    if(installed.length||busy||!host?.getInstalledChoices)return;busy=true;
    try{installed=api.installed(await host.getInstalledChoices());if(vanilla&&$('choiceDialog').open){render();status('Read the configured local 5.43 executable. No game started; no draft changed.');}}
    catch(error){if(vanilla&&$('choiceDialog').open)status('Select your own executable to load this library. '+error.message,true);}finally{busy=false;}
  });
  $('followChoice').addEventListener('click',()=>{const e=linked.find(r=>r.key===$('choiceLinked').value);if(!e)return;$('choiceType').value=e.type;$('choiceQuery').value='#'+e.id;page=0;selected=e.key;render();$('choiceName').focus();});
  $('choiceObservations').addEventListener('click',()=>{const e=visible.find(r=>r.key===selected);if(!e)return;close();window.CoeOpenPreparedTests?.({query:e.type+' #'+e.id+' '+e.name});});
  let nativeTargets=null;
  window.CoeFindStandaloneTarget=async (onSelect,returnTo='findStandaloneTarget')=>{
    const fallback={...window.CoeMelee.defaultTarget,key:'default:13',type:'monster',sourceKind:'default',version:'5.43 default',source:'Previously verified field',detail:'Base HP unavailable without the installed catalog.',fields:{}};
    const scopeForTarget={type:'monster',targetRows:nativeTargets||[fallback],returnTo,coverage:'Choose a native CoE5 5.43 type; set counts in Field setup. Mixed groups use official CoE5SE 3.2.2/3.3.0, or the separately available private 2.13.0 roster component. Mod-added units and waves are unavailable.'};
    window.CoeOpenChoices(scopeForTarget,onSelect);
    if(nativeTargets)return;
    try{
      if(!host?.getStandaloneTargets)throw Error('Use the Windows app with a configured game executable.');
      nativeTargets=api.standaloneTargets(await host.getStandaloneTargets());
      scopeForTarget.targetRows=nativeTargets;
    }catch(error){scopeForTarget.coverage='Only default Spearman #13 is available. '+error.message;}
    if(scope===scopeForTarget&&$('choiceDialog').open)render();
  };
  window.CoeChoicesReference=c=>{references=api.records(c,c.kind==='data533'||c.gitBlob===window.CoeReference.knownBlob?'historical':'unknown');if($('choiceDialog').open)render();};
  $('browseChoices').addEventListener('click',()=>window.CoeOpenChoices());$('closeChoices').addEventListener('click',close);$('choiceDialog').addEventListener('cancel',e=>{e.preventDefault();close();});
  for(const id of ['choiceQuery','choiceType','choiceSource'])$(id).addEventListener(id==='choiceQuery'?'input':'change',()=>{page=0;selected=null;render();});
  $('choicePrevious').addEventListener('click',()=>{page--;render();});$('choiceNext').addEventListener('click',()=>{page++;render();});
  $('clearChoices').addEventListener('click',()=>{$('choiceQuery').value='';$('choiceSource').value=vanilla?'installed':scope?.rangedRole?'pinned':'all';$('choiceType').value=scope?.type||'all';page=0;render();$('choiceQuery').focus();});
  $('choiceQuery').addEventListener('keydown',e=>{if(e.key==='ArrowDown'&&$('choiceResults').children[0]?.tagName.toLowerCase()==='button'){e.preventDefault();mark(visible[0].key);$('choiceResults').children[0].focus();}});
  $('useChoice').addEventListener('click',()=>use(visible.find(e=>e.key===selected)));
  $('observeOriginal').addEventListener('click',()=>{const e=visible.find(e=>e.key===selected);if(!e||window.CoeOriginal.reason(e))return;close();window.CoeOpenOriginalTest(e,vanilla?'browseVanilla':'browseChoices');});
  $('loadInstalledChoices').hidden=!host?.loadInstalledChoices;
  $('loadInstalledChoices').addEventListener('click',async()=>{if(busy||!host?.loadInstalledChoices)return;busy=true;try{const packet=await host.loadInstalledChoices();if(packet){installed=api.installed(packet);page=0;selected=null;render();status('Loaded native 5.43 metadata from your verified executable. No game started; no draft changed.');}else status('Selection cancelled; previous catalog retained.');}catch(error){status(error.message,true);}finally{busy=false;}});
  async function accept(p){const parsed=await api.offline(p);historical=parsed.entries;notes=parsed.notes;render();}
  $('importChoiceData').hidden=!host?.importChoiceData;
  $('importChoiceData').addEventListener('click',async()=>{if(busy)return;busy=true;try{const p=await host.importChoiceData();if(p)await accept(p);else status('Import cancelled; choices retained.');}catch(error){status(error.message,true);}finally{busy=false;}});
  async function sessions(){
    if(!host?.getTestSessions)return;
    try{const rows=(await host.getTestSessions()).filter(s=>!s.rangedComparison);$('choiceSession').replaceChildren();for(const s of rows){const o=node('option',s.spell+' · '+s.status+' · '+s.id);o.value=s.id;$('choiceSession').append(o);}$('choiceSession').value=rows.at(-1)?.id||'';}
    catch(error){status(error.message,true);}
  }
  $('refreshChoiceSessions').disabled=!host?.getTestSessions;$('loadRuntimeChoices').disabled=!host?.getRuntimeChoices;
  $('refreshChoiceSessions').addEventListener('click',sessions);
  $('loadRuntimeChoices').addEventListener('click',async()=>{
    if(busy||!$('choiceSession').value)return;const id=$('choiceSession').value;busy=true;
    try{const p=await host.getRuntimeChoices(id);if(p.sessionId!==id||$('choiceSession').value!==id)throw new Error('Catalog selection changed; load the selected session again.');const c=api.runtime(p);loaded=c.entries;notes=c.notes;page=0;render();status('Loaded the explicit runtime snapshot. No source or setup field was changed.');}
    catch(error){status(error.message,true);}finally{busy=false;}
  });
  window.CoeChoiceReady=(async()=>{if(host?.getChoiceData)try{await accept(await host.getChoiceData());}catch(error){status(error.message,true);}await sessions();})();
})();
