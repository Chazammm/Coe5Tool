(function(){
  'use strict';
  const $=id=>document.getElementById(id),damage=window.CoeDamage;
  let current=null,selected=new Set();
  function summary(){$('payloadValue').textContent=[...selected].reduce((v,s)=>v|BigInt(s),0n).toString();$('usePayload').disabled=!selected.size;}
  function render(){
    const query=$('payloadSearch').value.trim().toLowerCase(),rows=damage.options(current.type);
    $('payloadRows').replaceChildren();let shown=0;
    for(const row of rows){
      if(query&&!((row.name+' '+row.value+' '+(row.bit===undefined?'':'bit '+row.bit)).toLowerCase().includes(query.replace(/^#/,''))))continue;
      shown++;const label=document.createElement('label'),box=document.createElement('input'),text=document.createElement('span');
      box.type=current.type===25?'radio':'checkbox';box.name='payloadAnimation';box.checked=selected.has(row.value);text.textContent=row.name+' · '+row.value+(row.bit===undefined?'':' (bit '+row.bit+')');
      box.addEventListener('change',()=>{if(current.type===25)selected.clear();if(box.checked)selected.add(row.value);else selected.delete(row.value);summary();});label.append(box,text);$('payloadRows').append(label);
    }
    $('payloadEmpty').hidden=shown>0;summary();
  }
  function close(){$('payloadDialog').close();current?.input.focus();}
  window.CoeOpenPayload=(type,input,changed)=>{
    if(!['mask','animate'].includes(damage.profile(type)?.kind))return;
    current={type:Number(type),input,changed};selected=new Set();
    if(/^\d+$/.test(input.value))for(const r of damage.options(type))if(Number(type)===25?input.value===r.value:(BigInt(input.value)&BigInt(r.value))!==0n)selected.add(r.value);
    $('payloadHeading').textContent=Number(type)===25?'Choose animation':Number(type)===12?'Choose afflictions':'Choose benefits';$('payloadSearch').value='';$('payloadHelp').textContent='Use only explicitly selected values. This replaces this one payload; the other damage field stays unchanged. No effect or targeting preview.';render();$('payloadDialog').showModal();$('payloadSearch').focus();
    try{damage.payload(type,input.value);}catch{$('payloadHelp').textContent+=' The current raw value is outside the guided set; using this selection replaces it.';}
  };
  $('payloadSearch').addEventListener('input',render);$('closePayload').addEventListener('click',close);$('payloadDialog').addEventListener('cancel',e=>{e.preventDefault();close();});
  $('usePayload').addEventListener('click',()=>{if(!current||!selected.size)return;if(document.getElementById(current.input.id)!==current.input||current.input.disabled){$('payloadHelp').textContent='The source control changed. Close and choose the payload again.';return;}const value=$('payloadValue').textContent;damage.payload(current.type,value);current.input.value=value;current.changed();close();});
  window.CoePopulateDamageTypes=(select,ids=damage.data.types.map(t=>t.id),blank=false)=>{
    const previous=select.value;select.replaceChildren();if(blank){const o=document.createElement('option');o.value='';o.textContent='Choose…';select.append(o);}
    for(const id of ids){const p=damage.profile(id);if(!p)continue;const o=document.createElement('option');o.value=String(id);o.textContent=id+' · '+p.name+(p.kind==='manual'?' (manual payload)':'');select.append(o);}
    select.value=ids.map(String).includes(previous)?previous:blank?'':String(ids[0]??'');
  };
})();
