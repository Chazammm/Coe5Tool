/* Session-bound suggestions and a conservative three-way field comparison. No automatic patch or export. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./core.js'),require('./creation.js'),require('./data-import.js'),require('./damage-types.js'),require('./melee.js'),require('./battle-results.js'));else root.CoeReturn=factory(root.CoeWorkbench,root.CoeCreation,root.CoeDataImport,root.CoeDamage,root.CoeMelee,root.CoeBattleResults);})(typeof globalThis!=='undefined'?globalThis:this,function(core,creation,data,damage,melee,battle){
  'use strict';
  const basic=['dmgtype','aoe'],visual=['look','flymode','flylook'],labels={dmgtype:'Damage type',aoe:'Area code',look:'Impact effect',flymode:'Flight mode',flylook:'Flight effect'};
  const same=(a,b)=>/^[+-]?\d+$/.test(String(a))&&/^[+-]?\d+$/.test(String(b))&&BigInt(a)===BigInt(b);
  const equal=(a,b)=>a===b||same(a,b);
  const binding=c=>c.sessionId+':'+c.sourceRevision+':'+c.run;
  const schema=c=>c.resultSchema??1;
  const ranged=c=>[3,4,5].includes(schema(c));
  const int=v=>Number.isInteger(v)&&v>=-2147483648&&v<=2147483647;
  function values(c,v,required=false){
    if(ranged(c)){
      const groups=c.visualCatalog===2?melee.catalog:{sprite:melee.sprites,particle:melee.particleFlights,impact:melee.impacts};
      if(!v||Object.keys(v).length!==3||!visual.every(k=>int(v[k]))||
        !(v.flymode===1&&Object.hasOwn(groups.sprite,v.flylook)||v.flymode===2&&Object.hasOwn(groups.particle,v.flylook))||
        !(Object.hasOwn(groups.impact,v.look)||v.look===-1&&c.baseline.look===''))throw new Error('Unsupported ranged visual readback.');
      return {look:v.look,flymode:v.flymode,flylook:v.flylook};
    }
    if(!v||!damage.allowedTypes(c.baseline.dmgtype,c.damagePolicy==='documented-v1').includes(v.dmgtype)||!Number.isInteger(v.aoe)||![0,1,5,Number(c.baseline.aoe)].includes(v.aoe))throw new Error('Unsupported test values; only the experiment presets and prepared area baseline can return.');
    if(Object.keys(v).some(k=>![...basic,...(schema(c)===2?visual:[])].includes(k)))throw new Error('Unsupported result field.');
    const out={dmgtype:v.dmgtype,aoe:v.aoe},base=c.runtimeBaseline||Object.fromEntries(visual.filter(k=>c.baseline[k]!==''&&c.baseline[k]!==undefined).map(k=>[k,Number(c.baseline[k])]));
    if(required&&schema(c)===2&&!visual.every(k=>Object.hasOwn(v,k)))throw new Error('Visual readback is incomplete.');
    if(Object.hasOwn(v,'look')){if(!int(v.look)||!(v.look>=0&&v.look<=299||v.look===base.look))throw new Error('Impact look is outside the effect table or recorded baseline.');out.look=v.look;}
    if(Object.hasOwn(v,'flymode')!==Object.hasOwn(v,'flylook'))throw new Error('Flight mode and flight look must be returned together.');
    if(Object.hasOwn(v,'flymode')){
      if(!int(v.flymode)||!int(v.flylook)||!((v.flymode===base.flymode&&v.flylook===base.flylook)||(v.flymode>=2&&v.flymode<=9&&v.flylook>=0&&v.flylook<=299)))throw new Error('Unsupported flight interpretation: new choices require mode 2–9 and effect ID 0–299; sprite mode is baseline only.');
      out.flymode=v.flymode;out.flylook=v.flylook;
    }
    return out;
  }
  async function validatePacket(packet){
    let c=packet?.context;
    if(!c||!/^([a-f0-9]{32})$/.test(c.sessionId)||!/^([a-f0-9]{64})$/.test(c.sourceRevision)||!(c.run===''||/^[a-f0-9]{32}$/.test(c.run))||!['c5m','c5se'].includes(c.mode)||typeof c.source!=='string'||typeof c.legacy!=='boolean')throw new Error('Invalid session or source association.');
    if(c.damagePolicy!==undefined&&!['legacy-3-4','documented-v1'].includes(c.damagePolicy))throw new Error('Unknown damage policy.');
    if(schema(c)===5)return validateOfficial(packet);
    if(ranged(c)){
      if(![1,2].includes(c.visualCatalog??1))throw new Error('Unknown comparison catalog.');
      const {route,spec}=melee.specification(c.source,c.mode,c.visualCatalog===2);
      if((c.areaCode??0)!==Number(spec.aoe))throw new Error('Prepared area code differs from source.');
      if(c.visualCatalog!==2&&Number(spec.dmgtype)>3)throw new Error('Historical ranged comparisons require a physical weapon.');
      if(route!=='ranged'||c.legacy||spec.weaponName!==c.weaponName||c.spellName!=='weapon '+c.weaponName||await data.digest(c.mode+'\0'+c.source)!==c.sourceRevision||!visual.every(k=>c.baseline?.[k]===spec[k]))throw new Error('Ranged source fingerprint or prepared visuals differ.');
      if(!Array.isArray(packet.samples)||packet.samples.length>32||packet.samples.length&&!c.run)throw new Error('Invalid ranged battle history.');
      if(c.target!=null && (c.visualCatalog!==2||!melee.validTarget(c.target)||
        (c.target.count!==undefined && (!Number.isInteger(c.target.count)||c.target.count<1||c.target.count>200))))throw new Error('Invalid prepared defender identity.');
      const mixed=schema(c)===4;
      if(mixed){
        if(c.visualCatalog!==2||c.target!=null)throw Error('Invalid mixed comparison context.');
        melee.validRoster(c.roster);
      }else if(c.roster!=null)throw Error('Unexpected mixed roster for a historical comparison.');
      const element=({4:'fire',5:'cold',6:'shock'})[spec.dmgtype];
      let previous=0,last;
      const samples=packet.samples.map((s,i)=>{
        if((s.areaCode??0)!==Number(spec.aoe))throw new Error('Saved area code differs from preparation.');
        if(c.target){
          const t=s.targetReading;
          const group=c.target.count>1;
          const units=group?t?.units:[t];
          if(!t || t.id!==c.target.id || !Array.isArray(units) || units.length!==(c.target.count??1) ||
              units.some(u=>!u||!Number.isInteger(u.unit)||u.unit<0||u.unit>=99000||!(u.resistance===null||int(u.resistance))||(group&&!element&&u.resistance!==null)) ||
              new Set(units.map(u=>u.unit)).size!==units.length)
            throw new Error("Invalid saved defender identity or reading.");
        }else if(s.targetReading!=null)throw new Error('Unexpected defender reading for this session.');
        if(mixed){
          const r=s.mixedReading,expected=c.roster.flatMap(g=>Array.from({length:g.count},()=>g));
          if(!r||r.closed!==true||r.restored!==true||!Array.isArray(r.units)||r.units.length!==expected.length||
              r.units.some((u,i)=>!u||!Number.isInteger(u.unit)||u.unit<0||u.unit>=99000||u.monster!==expected[i].id||u.name!==expected[i].name||
                !int(u.beforeHp)||!int(u.afterHp)||!(u.resistance===null||int(u.resistance))||!element&&u.resistance!==null)||
              new Set(r.units.map(u=>u.unit)).size!==r.units.length)throw Error('Invalid mixed defender identity, reading or cleanup.');
        }else if(s.mixedReading!=null)throw Error('Unexpected mixed reading.');
        const v=values(c,s.values);
        if(s.index!==i+1||s.battleCount!==1||s.readBackConfirmed!==true||!Number.isInteger(s.parameterRevision)||s.parameterRevision<previous||s.parameterRevision>1000000||s.kind!==(s.parameterRevision===0?'baseline':'applied')||
          s.kind==='baseline'&&visual.some(k=>v[k]!==Number(c.baseline[k]===''?-1:c.baseline[k]))||
          last&&previous===s.parameterRevision&&visual.some(k=>v[k]!==last[k]))throw new Error('Invalid ranged battle revision or evidence.');
        previous=s.parameterRevision;last=v;return {...s,values:v,binding:binding(c),origin:'helper',userObserved:false};
      });
      return {context:c,samples,areaCode:Number(spec.aoe),resistanceElement:element,error:typeof packet.error==='string'?packet.error:''};
    }
    const spec=creation.fromDraft(c.source,c.mode);
    if(await data.digest(c.mode+'\0'+c.source)!==c.sourceRevision||spec.spellName!==c.spellName||spec.weaponName!==c.weaponName||spec.dmgtype!==c.baseline?.dmgtype||spec.aoe!==c.baseline?.aoe)throw new Error('Prepared source, spell or weapon fingerprint differs.');
    if(![1,2].includes(schema(c))||schema(c)===2&&visual.some(k=>c.baseline[k]!==spec[k]))throw new Error('Unsupported result version or visual source association.');
    if(!Array.isArray(packet.samples)||packet.samples.length>32||packet.samples.length&&(!c.run||c.legacy))throw new Error('Unsupported result collection or launch binding.');
    if(schema(c)===2&&packet.samples.length){
      const base=packet.runtimeBaseline;
      if(!base||Object.keys(base).length!==3||visual.some(k=>!int(base[k])||(c.baseline[k]!==''&&Number(c.baseline[k])!==base[k])))throw new Error('Invalid runtime visual baseline.');
      c={...c,runtimeBaseline:{...base}};
    }
    let previous=0;
    const samples=packet.samples.map(s=>{
      if(!Number.isInteger(s.index)||s.index<=previous||s.index>1000000||!Number.isInteger(s.panel)||s.panel<1||s.panel>1000000||!Number.isInteger(s.parameterRevision)||s.parameterRevision<0||s.parameterRevision>1000000||!Number.isInteger(s.castCount)||s.castCount<0||s.castCount>1000000||s.readBackConfirmed!==true||!['baseline','applied'].includes(s.kind)||(s.kind==='baseline')!==(s.parameterRevision===0))throw new Error('Malformed result sample.');
      if(s.kind==='baseline'&&(!same(s.values?.dmgtype,c.baseline.dmgtype)||!same(s.values?.aoe,c.baseline.aoe)))throw new Error('Baseline result differs from the prepared values.');
      if(s.kind==='baseline'&&schema(c)===2&&visual.some(k=>s.values?.[k]!==c.runtimeBaseline[k]))throw new Error('Visual baseline differs from the initial readback.');
      previous=s.index;
      return {...s,values:values(c,s.values,true),binding:binding(c),origin:'helper',userObserved:false};
    });
    return {context:c,samples,error:typeof packet.error==='string'?packet.error:''};
  }
  async function validateOfficial(packet){
    const c=packet.context;
    if(!creation.officialGroups(c.runtimeVersion)||c.groupApi!=='official-group-1'||c.visualCatalog!==2||c.legacy||c.mode!=='c5m'||c.target!=null)throw Error('Invalid official comparison context.');
    const roster=melee.validRoster(c.roster),expected=roster.flatMap(g=>Array.from({length:g.count},()=>g));
    const {route,spec}=melee.specification(c.source,c.mode,true),element=({4:'fire',5:'cold',6:'shock'})[spec.dmgtype]||null;
    if(route!=='ranged'||spec.weaponName!==c.weaponName||c.spellName!=='weapon '+c.weaponName||c.areaCode!==Number(spec.aoe)||
      await data.digest(c.mode+'\0'+c.source)!==c.sourceRevision||!visual.every(k=>c.baseline?.[k]===spec[k]))throw Error('Official comparison source or baseline differs.');
    if(!Array.isArray(packet.attempts)||packet.attempts.length>8||!Array.isArray(packet.samples)||packet.samples.length>8||
      !['active','finished','error'].includes(packet.comparisonStatus)||typeof packet.privateVisualsRestored!=='boolean'||
      typeof packet.comparisonMessage!=='string'||packet.comparisonMessage.length>300||
      packet.comparisonStatus==='finished'&&!packet.privateVisualsRestored||packet.comparisonStatus==='active'&&packet.privateVisualsRestored||packet.comparisonStatus!=='error'&&packet.comparisonMessage!==''||packet.attempts.length&&!c.run)
      throw Error('Official comparison history is incomplete.');
    let previous=0,last;
    const attempts=packet.attempts.map((a,i)=>{
      const v=values(c,a.values),r=a.mixedReading,m=battle.model(r);
      if(a.attemptIndex!==i+1||!Number.isInteger(a.parameterRevision)||a.parameterRevision<previous||a.parameterRevision>1000000||typeof a.readBackConfirmed!=='boolean'||
        !m.official||r.sessionId!==c.sessionId||r.areaCode!==c.areaCode||r.element!==element||m.requested!==expected.length||
        m.units.some((u,n)=>u.monster!==expected[n].id||u.name!==expected[n].name)||
        !Number.isInteger(r.carrierUnit)||r.carrierUnit< -1||r.carrierUnit>=99000||m.units.some(u=>u.unit===r.carrierUnit)||
        a.parameterRevision===0&&visual.some(k=>v[k]!==Number(c.baseline[k]===''?-1:c.baseline[k]))||
        last&&a.parameterRevision===previous&&visual.some(k=>v[k]!==last[k]))throw Error('Official attempt identity, revision or values differ.');
      if(m.status==='closed'&&(!a.readBackConfirmed||m.phase!=='after-battle-return'||!m.closeAttempted||r.trackedInactive!==expected.length+1)||
        m.status==='cancelled'&&(!m.closed||!m.mainMenuAfterClose||r.trackedInactive!==expected.length+1||
          (m.battleReturns===0?m.stopped||m.phase!=='before-close':!m.stopped||m.phase!=='after-battle-return'))||
        i<packet.attempts.length-1&&!['closed','cancelled'].includes(m.status)||
        packet.comparisonStatus==='finished'&&!['closed','cancelled'].includes(m.status))throw Error('An uncertain field cannot authorize a later comparison.');
      previous=a.parameterRevision;last=v;return {...a,values:v};
    });
    const eligible=attempts.filter(a=>a.mixedReading.status==='closed');
    if(packet.samples.length!==eligible.length)throw Error('Returned battles do not match the saved attempts.');
    const samples=packet.samples.map((s,i)=>{
      const a=eligible[i],v=values(c,s.values);
      if(s.index!==i+1||s.attemptIndex!==a.attemptIndex||s.parameterRevision!==a.parameterRevision||s.kind!==(a.parameterRevision===0?'baseline':'applied')||
        s.battleCount!==1||s.readBackConfirmed!==true||s.areaCode!==c.areaCode||visual.some(k=>v[k]!==a.values[k])||
        JSON.stringify(battle.model(s.mixedReading))!==JSON.stringify(battle.model(a.mixedReading)))throw Error('Selected battle and field receipt differ.');
      return {...s,values:v,mixedReading:a.mixedReading,binding:binding(c),origin:'helper',userObserved:false};
    });
    return {context:c,samples,attempts,comparisonStatus:packet.comparisonStatus,privateVisualsRestored:packet.privateVisualsRestored,comparisonMessage:packet.comparisonMessage,
      areaCode:c.areaCode,resistanceElement:element,error:typeof packet.error==='string'?packet.error:''};
  }
  function manual(c,input,claims={}){
    if(ranged(c))throw new Error('Choose a saved ranged battle readback.');
    return {values:values(c,input),binding:binding(c),origin:'manual',readBackConfirmed:false,castCount:null,reportedApplied:claims.applied===true,userObserved:claims.observed===true};
  }
  function destination(c,current){
    if(current.mode!==c.mode)throw new Error('Use the tested source interpretation before reviewing a return. Nothing was converted.');
    const model=core.inspect(current.text,current.mode),named=(type,name)=>model.blocks.filter(b=>b.type===type&&b.name.toLowerCase()===name.toLowerCase());
    const weapons=named('weapon',c.weaponName),spells=named('spell',c.spellName);
    const weaponOnly=ranged(c)||!model.blocks.some(b=>b.type==='spell');
    if(ranged(c)&&current.mode!=='c5m')throw new Error('Open the matching native .c5m weapon source to review this comparison.');
    if(weapons.length!==1||!weapons[0].headerSafe||weapons[0].opener!=='newweapon'||weapons[0].name!==c.weaponName||!weaponOnly&&(spells.length!==1||spells[0].name!==c.spellName))throw new Error('This draft does not contain the unique tested weapon and linked spell. Choose another result or explicitly open its source copy.');
    const weapon=weapons[0],spell=spells[0],ref=spell?.fields.find(f=>f.key==='weaponRef');
    if(!weaponOnly&&(!ref?.editable||ref.value!=='"'+c.weaponName+'"'||weapon.start>spell.start))throw new Error('The spell is relinked, ambiguous or out of declaration order. No values were assigned to another weapon.');
    if(!weaponOnly&&current.selected===spell.id&&current.inputs?.weaponRef!==undefined&&current.inputs.weaponRef!==ref.value)throw new Error('Resolve the pending weapon reference before returning values. Your pending link and source are retained.');
    const otherSpellUsers=model.blocks.filter(b=>b.type==='spell'&&b.name!==c.spellName&&b.matches.includes(weapon.id)).length;
    return {model,weapon,weaponOnly,otherSpellUsers};
  }
  function related(row,current){
    if(!row.weapon||!row.mode)return false;
    try{destination({resultSchema:row.rangedComparison?3:undefined,spellName:row.spell,weaponName:row.weapon,mode:row.mode},current);return true;}catch{return false;}
  }
  function plan(c,sample,current){
    if(sample?.binding!==binding(c))throw new Error('Selected values belong to another session or source revision.');
    values(c,sample.values);
    const {model,weapon,weaponOnly,otherSpellUsers}=destination(c,current);
    const rows=[...(ranged(c)?[]:basic),...visual.filter(k=>Object.hasOwn(sample.values,k))].map(key=>{
      const f=weapon.fields.find(f=>f.key===key);
      if(!f?.editable&&basic.includes(key))throw new Error('The '+key+' field is missing, repeated or unsupported; no safe insertion is available.');
      const issue=ranged(c)&&key==='look'&&sample.values.look===-1?'The battle used the undeclared impact. No source change is available for this value.':!(f?.editable||f?.addable)?'Add this field manually: automatic insertion requires a plain new weapon with supported, unambiguous fields only.':core.validateValue(f,String(sample.values[key]));
      const testedBaseline=c.baseline[key]!==''&&c.baseline[key]!==undefined?c.baseline[key]:ranged(c)&&key==='look'?-1:c.runtimeBaseline?.[key];
      const testChanged=testedBaseline!==undefined&&!equal(testedBaseline,sample.values[key]);
      if(issue)return {key,label:labels[key],baseline:c.baseline[key]||'Not declared',current:f?.value||'Not declared',pending:null,proposed:String(sample.values[key]),available:false,reason:issue,conflict:false,already:false,draftAlready:false,testChanged,group:key==='flymode'||key==='flylook'?'flight':null};
      const proposed=String(sample.values[key]),pending=current.selected===weapon.id?current.inputs?.[key]:undefined;
      const pendingChanged=pending!==undefined&&pending!==f.value;
      const conflict=(!equal(f.value,c.baseline[key])&&!equal(f.value,proposed))||(pendingChanged&&!equal(pending,proposed));
      return {key,label:labels[key],baseline:c.baseline[key]||'Not declared',current:f.value,pending:pendingChanged?pending:null,proposed,conflict,already:equal(pendingChanged?pending:f.value,proposed),draftAlready:equal(f.value,proposed)&&(!pendingChanged||equal(pending,proposed)),available:true,addition:!!f.addable,testChanged,group:key==='flymode'||key==='flylook'?'flight':null};
    });
    const typeRow=rows.find(r=>r.key==='dmgtype');if(typeRow?.available&&!damage.compatibleChange(typeRow.pending??typeRow.current,typeRow.proposed)){typeRow.available=false;typeRow.reason='Changing a special payload’s type requires explicit source review and a new test; the numeric payload is not returned.';}
    const flight=rows.filter(r=>r.group==='flight');
    if(flight.some(r=>r.addition)&&!(sample.values.flymode>=1&&sample.values.flymode<=9&&sample.values.flylook>=0&&sample.values.flylook<=(sample.values.flymode===1?2147483647:299)))for(const r of flight){r.available=false;r.reason='The saved flight baseline has no supported explicit source interpretation. Select an effect mode and effect ID in a later isolated test, or edit the source manually.';}
    if(flight.some(r=>r.available===false))for(const r of flight){r.available=false;r.reason=r.reason||'Flight mode and effect must be safely editable or addable together. Mixed, inherited or ambiguous blocks need manual editing.';}
    for(const row of rows){const group=row.group==='flight'?flight:[row];row.defaultSelected=group.every(r=>r.available&&!r.conflict&&!r.addition)&&group.some(r=>r.testChanged&&!r.draftAlready);}
    const otherPending=current.selected!==weapon.id&&Object.entries(current.inputs||{}).some(([key,value])=>model.blocks[current.selected]?.fields.find(f=>f.key===key)?.value!==value);
    return {context:c,sample,weaponId:weapon.id,weaponOnly,otherSpellUsers,rows,sourceChanged:current.text!==c.source,pendingElsewhere:otherPending,blocked:otherPending?'Pending edits in another definition are retained. Apply selected test values directly, or resolve your field edits before staging.':''};
  }
  return {validatePacket,manual,plan,same,related,destination};
});
