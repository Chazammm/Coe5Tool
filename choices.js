/* Searchable metadata, keeping IDs, versions and data-source boundaries explicit. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./documented-choices.js'),require('./reference.js'),require('./data-import.js'),require('./melee.js'));else root.CoeChoices=factory(root.CoeDocumentedChoices,root.CoeReference,root.CoeDataImport,root.CoeMelee);})(typeof globalThis!=='undefined'?globalThis:this,function(docs,refs,data,melee){
  'use strict';
  const monsterHash='a0752def8cf175b73b282ff4b02521607b39dd54b65728aecc775e6eec1adc0f';
  function documented(){
    const out=[];
    for(const [type,rows]of Object.entries(docs.tables))for(const [token,name]of rows){
      const m=token.match(/^(-?\d+)(?:-(\d+))?$/);if(!m)continue;
      const from=Number(m[1]),to=m[2]===undefined?from:Number(m[2]);
      if(to<from||to-from>1000)continue;
      for(let id=from;id<=to;id++)out.push({key:'documented:'+type+':'+id,type,id,name,sourceKind:'documented',version:docs.version,source:docs.source,detail:to===from?'Documented table entry; runtime behavior unverified.':'Documented sprite range '+token+'; each ID is retained.',fields:{}});
    }
    out.push({key:'documented:sound:-1',type:'sound',id:-1,name:'No launch sound',sourceKind:'documented',version:docs.version,source:docs.source,detail:'flysound -1 only; not an impact-sound choice.',fields:{launchOnly:true}});
    return out;
  }
  function records(catalog,sourceKind='historical'){
    return catalog.entries.map(e=>({...e,key:sourceKind+':'+e.key,sourceKind:e.origin==='unknown'?'unknown':sourceKind,source:catalog.label||catalog.source||'Reference metadata',version:catalog.version||'Version unknown',detail:e.id===null?'Name only; no ID or variant identity supplied.':'Explicit reference ID; installed-game availability is unverified.',fields:e.fields||{}}));
  }
  async function offline(packet){
    const entries=[],notes=[...(packet?.notes||[])];
    if(packet?.monsters){
      const m=packet.monsters;
      if(m.sha256!==monsterHash||!Array.isArray(m.entries)||m.entries.length!==1851)throw new Error('Unrecognized monster reference provenance.');
      const ids=new Set();for(const e of m.entries){
        if(e.type!=='monster'||!Number.isInteger(e.id)||e.id<0||e.id>1850||ids.has(e.id)||typeof e.name!=='string'||e.name.length>200)throw new Error('Malformed historical monster record.');ids.add(e.id);
        entries.push({...e,key:'historical:monster:'+e.id,sourceKind:'historical',version:'CoE5 5.33',source:m.source,detail:'Explicit historical ID/variant. Name is rechecked at runtime; this is not a 5.43 stat/variant guarantee.',fields:{}});
      }
    }
    if(packet?.reference){
      const p=packet.reference,c=p.kind==='data533'?await data.parseFiles(p.files):refs.parseIndex(p.text,p);
      entries.push(...records(c,c.gitBlob===refs.knownBlob||c.kind==='data533'?'historical':'unknown'));
      if(p.kind!=='data533'){
        const names=JSON.parse(p.text).monster;
        if(names!==undefined){
          if(!Array.isArray(names)||names.length>10000||names.some(n=>typeof n!=='string'||!n.trim()||n.length>200||/[\x00-\x1f]/.test(n)))throw new Error('Malformed unit name index.');
          const kind=c.gitBlob===refs.knownBlob?'historical':'unknown';
          for(const [i,name]of [...new Set(names)].entries())entries.push({key:kind+':monster-name:'+i,type:'monster',id:null,name,sourceKind:kind,version:c.version,source:c.label,detail:'Name only; IDs, duplicate variants and installed-game availability are not supplied.',fields:{}});
        }
      }
    }
    return {entries,notes};
  }
  function runtime(packet){
    if(!packet||!/^([a-f0-9]{32})$/.test(packet.sessionId)||!/^([a-f0-9]{64})$/.test(packet.sourceRevision)||!/^([a-f0-9]{32})$/.test(packet.run)||typeof packet.runtime!=='string'||!Array.isArray(packet.entries)||packet.entries.length>25000||!Array.isArray(packet.coverage)||packet.coverage.length>4)throw new Error('Malformed runtime catalog.');
    const seen=new Set(),entries=[],source='Isolated session '+packet.sessionId;
    for(const e of packet.entries){
      if(!['monster','weapon','spell','effect'].includes(e.type)||!Number.isInteger(e.id)||e.id<0||e.id>(e.type==='effect'?299:e.type==='spell'?4095:6998)||typeof e.name!=='string'||e.name.length>200||seen.has(e.type+':'+e.id))throw new Error('Invalid runtime ID/name record.');seen.add(e.type+':'+e.id);
      entries.push({...e,name:e.name||'Effect #'+e.id+' (unnamed table row)',key:'runtime:'+e.type+':'+e.id,sourceKind:'runtime',version:packet.runtime,source,detail:'Loaded-table ID in this profile; origin is not exposed. Other profiles/load orders require rechecking.',fields:e.fields||{}});
    }
    const derived=new Map();
    const add=(type,id,detail)=>{if(!Number.isInteger(id)||id< -1)return;const key=type+':'+id;if(!derived.has(key))derived.set(key,{key:'runtime:derived:'+key,type,id,name:(type==='path'?'Path':type==='projectile'?'Flight sprite':'Sound')+' #'+id,sourceKind:'runtime',version:packet.runtime,source,detail,fields:{}});};
    for(const e of entries){
      if(e.type==='spell')add('path',Number(e.fields.path),'Numeric path referenced by loaded spells; a current path-name API is not exposed.');
      if(e.type==='weapon'){
        if(Number(e.fields.flymode)===1&&e.fields.flylook!==undefined)add('projectile',Number(e.fields.flylook),'Sprite ID referenced by loaded weapon '+e.name+'; current sprite names are not exposed.');
        for(const key of ['sound','flysound'])if(e.fields[key]!==undefined)add('sound',Number(e.fields[key]),'ID referenced by loaded weapon '+e.name+' ('+key+'); no runtime sound-name catalog is exposed.');
      }
    }
    const coverageTypes=new Set();
    for(const c of packet.coverage){
      if(!['monster','weapon','spell','effect'].includes(c.type)||coverageTypes.has(c.type)||typeof c.complete!=='boolean'||!Number.isInteger(c.count)||c.count!==entries.filter(e=>e.type===c.type).length||!Number.isInteger(c.inspectedBound)||c.inspectedBound<0||c.inspectedBound>({effect:299,spell:4095}[c.type]??6998)||entries.some(e=>e.type===c.type&&e.id>c.inspectedBound))throw new Error('Invalid runtime enumeration coverage.');
      coverageTypes.add(c.type);
    }
    return {entries:[...entries,...derived.values()],notes:packet.coverage.map(c=>c.type+': '+c.count+' rows, '+(c.complete?'range inspected through #'+c.inspectedBound:'partial enumeration')+'.')};
  }
  function search(entries,query='',type='all',source='all'){
    const q=query.trim().toLowerCase(),terms=q.split(/\s+/).filter(Boolean),numeric=/^#?-?\d+$/.test(q)?Number(q.replace('#','')):null;
    return entries.filter(e=>(type==='all'||e.type===type)&&(source==='all'||e.sourceKind===source)&&(numeric!==null?e.id===numeric||e.name.toLowerCase().includes(q):terms.every(t=>(e.name+' '+e.id+' '+e.type+' '+e.version+' '+e.source+' '+e.detail).toLowerCase().includes(t))))
      .sort((a,b)=>({runtime:0,installed:1,draft:2,documented:3,historical:4,unknown:5}[a.sourceKind]-{runtime:0,installed:1,draft:2,documented:3,historical:4,unknown:5}[b.sourceKind])||a.name.localeCompare(b.name)||(a.id??-1)-(b.id??-1));
  }
  function rangedChoices(role,rows){
    const type=role==='sprite'?'projectile':'effect';
    return Object.entries(rows).map(([id,row])=>{
      const basis=row.witness!==null?'Referenced on native weapon #'+row.witness+' in this role.':role==='sprite'?'Listed in the native fly-sprite table.':role==='particle'?'The game labels this row for flight.':'Named visual without a specialized role suffix. Impact appearance is unverified.';
      return {id:Number(id),name:row.name||'Unnamed sprite',type,key:'pinned:'+role+':'+id,sourceKind:'pinned',
        source:'Verified Windows 5.43 reference',version:'CoE5 5.43',role,fields:{},
        detail:basis+(role==='sprite'?' The extender has no sprite-name lookup.':' The test checks the loaded ID and exact name.')};
    });
  }
  function allowed(e,scope){
    if(!scope)return 'Browse reference only; choose a field’s Search action to use a value.';
    if(e.type!==scope.type)return 'This category does not match the selected field.';
    if(scope.rangedRole && (e.sourceKind!=='pinned'||e.role!==scope.rangedRole))return 'Choose a matching ranged comparison entry.';
    if(scope.particleFlights && (!['documented','runtime'].includes(e.sourceKind) || scope.particleFlights[e.id]!==e.name))return 'This effect has no matching flight entry for this mode-2 test.';
    if(scope.participant&&(!e.name||e.name.length>63||/[^\x20-\x7e]|["#\\]/.test(e.name)))return 'Name is outside the current test-fixture subset.';
    if(e.type==='dmgtype'&&(!Number.isInteger(e.id)||e.id<1||e.id>25))return 'No verified documented damage-type definition for this ID. Use manual source editing.';
    if(scope.creator&&e.type==='path'&&(e.id===null||e.id<1||e.id>69))return 'The creator supports numeric built-in paths 1–69; custom/unknown paths need manual source work.';
    if(e.type==='sound'&&e.id===-1&&!scope.launch)return '-1 is documented for launch sound only.';
    if(e.id===null&&!['monster','weapon'].includes(e.type))return 'No explicit ID is supplied for this field.';
    return '';
  }
  function standaloneTargets(p){
    if(p?.fingerprint!=='489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55'||!Array.isArray(p.entries)||!p.entries.length||p.entries.length>2000)throw Error('Unsupported native target catalog.');
    const ids=new Set();
    return p.entries.map(({id,name,hp})=>{
      if(!melee.validTarget({id,name})||ids.has(id)||!Number.isInteger(hp)||hp<=0)throw Error('Invalid native target row.');
      ids.add(id);
      return {id,name,type:'monster',key:'target:'+id,version:'CoE5 5.43',sourceKind:'installed',source:'Verified local game executable',detail:'Elemental resistance is read from the spawned unit.',fields:{hp}};
    });
  }
  function installed(p){
    if(p?.schema!=='wb-installed-543'||p.gameSha256!=='489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55'||p.completeNames!==true||p.completeDefinitions!==false||p.spellSlots!==1029||p.weaponSlots!==1200||!Array.isArray(p.entries)||p.entries.length>2229)throw new Error('Unrecognized installed-game catalog.');
    const seen=new Set();const rows=p.entries.map(e=>{
      if(!['spell','weapon'].includes(e.type)||!Number.isInteger(e.id)||e.id<0||e.id>(e.type==='spell'?1028:1199)||typeof e.name!=='string'||!e.name||e.name.length>200||seen.has(e.type+':'+e.id)||!e.fields||Object.entries(e.fields).some(([k,v])=>!['path','level','weapon','weaponDamage','flagsRaw','trgrank','range','init','dmgtype','aoe','flymode','flylook','flysound','look','sound','nextalwayswep','dmg','nextdmg'].includes(k)||typeof v!=='string'||!/^[-]?[0-9]+$/.test(v)))throw new Error('Malformed installed-game record.');
      seen.add(e.type+':'+e.id);return {...e,key:'installed:'+e.type+':'+e.id,sourceKind:'installed',version:'CoE5 5.43 Windows',source:'Your fingerprint-verified pristine CoE5.exe',detail:'Native slot metadata, not complete source or a loaded-mod snapshot. Raw flags/chain fields are not a cloning recipe.'};
    });
    if(rows.filter(e=>e.type==='spell').length!==1029||rows.filter(e=>e.type==='weapon').length!==936)throw new Error('Incomplete native name catalog for this fingerprint.');
    return rows;
  }
  return {standaloneTargets,rangedChoices,documented,offline,runtime,installed,records,search,allowed,monsterHash};
});
