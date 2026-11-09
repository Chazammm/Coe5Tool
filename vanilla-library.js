/* Read-only presentation of verified local tables. No source reconstruction. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./original-records-policy.js'),require('./documented-choices.js'));else root.CoeVanillaLibrary=factory(root.CoeOriginalPolicy,root.CoeDocumentedChoices);})(typeof globalThis!=='undefined'?globalThis:this,function(original,docs){
  'use strict';
  function model(entry,entries){
    if(!entry||entry.sourceKind!=='installed'||!['spell','weapon'].includes(entry.type))return null;
    const f=entry.fields||{},weapon=entry.type==='weapon'?entry:entries.find(e=>e.sourceKind==='installed'&&e.type==='weapon'&&e.id===Number(f.weapon));
    const wf=weapon?.fields||{},related=entry.type==='spell'?(weapon?[weapon]:[]):entries.filter(e=>e.sourceKind==='installed'&&e.type==='spell'&&Number(e.fields?.weapon)===entry.id);
    const label=(type,value)=>{const found=docs.tables[type]?.find(row=>String(row[0])===String(value));return found?found[1]+' #'+value:'#'+value+' · name unavailable';};
    const facts=[];const add=(name,value)=>{if(value!==undefined)facts.push({name,value:String(value)});};
    if(entry.type==='spell'){add('Magic path',f.path===undefined?undefined:label('path',f.path));add('Spell level',f.level);add('Attack payload',f.weaponDamage);add('Linked weapon',weapon?'#'+weapon.id+' '+weapon.name:'Unavailable');}
    add('Damage type',wf.dmgtype===undefined?undefined:label('dmgtype',wf.dmgtype));add('Weapon damage field',wf.dmg);add('Range code',wf.range);add('Area / targeting code',wf.aoe);
    add('Flight mode',wf.flymode===undefined?undefined:label('flymode',wf.flymode));
    add('Flight',wf.flylook===undefined?undefined:label(Number(wf.flymode)===1?'projectile':'effect',wf.flylook));add('Impact',wf.look===undefined?undefined:label('effect',wf.look));
    return {facts,related,reason:original.reason(entry),test:'Native AI observation · CoE5 5.43 + CoE5SE 2.13.0. Caster/carrier eligibility is checked in game; AI may not use this record.',copy:'Original stays read-only. A complete editable copy is not supported. Start a new definition to experiment; these fields omit flags, chains and other behavior.',coverage:'Verified pristine 5.43 table data, not a live loaded-mod snapshot. Stored values and codes are not interpreted as radii or creator defaults. Effect names are documented labels, not a visual preview.'};
  }
  return {model};
});
