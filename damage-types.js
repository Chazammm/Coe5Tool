/* Damage/payload policy. Storage checks are not gameplay verification. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./damage-data.json'));else root.CoeDamage=factory(root.CoeDamageData);})(typeof globalThis!=='undefined'?globalThis:this,function(data){
  'use strict';
  const profile=id=>data.types.find(t=>t.id===Number(id));
  const options=id=>Number(id)===25?[{value:'1',name:'Tree'},{value:'2',name:'Fungus'}]:data.masks[Number(id)]||[];
  const name=id=>{const p=profile(id);return p?p.name+' · #'+p.id:'Unknown type · '+id;};
  function payload(id,value,manual=false){
    const p=profile(id);if(!p)throw new Error('Choose a documented damage type (1–25).');
    if(typeof value!=='string'||!/^\d+$/.test(value))throw new Error('Enter a nonnegative decimal payload; expressions and flags are not inferred.');
    const n=BigInt(value);
    if(p.kind==='manual'){if(!manual)throw new Error('Manual payload acknowledgement required. '+p.reason);if(n>(1n<<63n)-1n)throw new Error('Manual payload exceeds the supported signed 64-bit source subset.');}
    else if(p.kind==='mask'){
      const known=options(id).reduce((s,r)=>s|BigInt(r.value),0n);
      if(n===0n||(n&~known)!==0n)throw new Error('Choose a nonzero combination of documented '+(p.id===12?'affliction':'benefit')+' bits. Unknown/zero masks need manual source work.');
    }else if(p.kind==='animate'){if(n!==1n&&n!==2n)throw new Error('Animate payload must be 1 (tree) or 2 (fungus).');}
    else if(n>2147483647n)throw new Error('Scalar payload exceeds this generator’s nonnegative 32-bit subset.');
    return value;
  }
  function testReason(spec){
    const p=profile(spec.dmgtype);if(!p)return 'Unknown damage type; manual integration required.';
    if(p.kind==='manual')return 'Creation/export only. '+p.reason+' The isolated helper cannot verify this custom payload/flags/target setup. To inspect a configured original instead, use Find an original to observe; this does not validate your custom payload.';
    try{payload(p.id,spec.dmg);if(spec.weaponDamage!==undefined)payload(p.id,spec.weaponDamage);}catch(e){return e.message;}
    if(p.kind==='animate')return 'Creation/export only: animate needs suitable tree/fungus targets. This field cannot configure terrain targets, so a valid animation fixture is not established.';
    return '';
  }
  const allowedTypes=(baseline,modern=true)=>!modern?[3,4]:profile(baseline)?.kind==='scalar'?data.types.filter(t=>t.kind==='scalar').map(t=>t.id):[Number(baseline)];
  const compatibleChange=(a,b)=>Number(a)===Number(b)||(profile(a)?.kind==='scalar'&&profile(b)?.kind==='scalar');
  function hint(id){const p=profile(id);if(!p)return 'Choose a documented type. No effect preview.';
    if(p.kind==='mask')return 'Choose documented '+(p.id===12?'afflictions':'benefits')+'. Each damage field is a separate mask. '+(p.id===13?'Default targeting is enemy; friendly/self targeting needs manual trgrank. ':'')+'The test keeps type/payload fixed; ritual/world-map effects are not established by this field.';
    if(p.kind==='animate')return 'Payload 1 = tree, 2 = fungus, in each damage field. Creation/export only: the isolated field cannot configure suitable terrain targets.';
    if(p.kind==='manual')return 'Manual source payload · creation/export only. '+p.reason;
    return p.id===8?'Fear is a roll against morale, not hit-point damage. Resistances and results need in-game observation.':'Numeric damage; 0 on the weapon uses the monster’s base damage. No resistance/targeting flags are inferred. The isolated field does not establish ordinary combat.';
  }
  return {data,profile,options,name,payload,testReason,allowedTypes,compatibleChange,hint};
});
