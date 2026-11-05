/* Metadata reader for exact, independently fingerprinted historical exports.
   The spell export's pseudo commands are NEVER emitted as mod definitions. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('node:crypto').webcrypto);
  else root.CoeDataImport=factory(root.crypto);
})(typeof globalThis!=='undefined'?globalThis:this,function(crypto){
  'use strict';
  const sourceUrl='https://steamcommunity.com/app/1606340/discussions/1/3198114142283463845/';
  const profiles=Object.freeze({
    '4e2b600507274432a386de00340805261a0d465384f98f622a7b2f180cb903b8':{type:'spell',count:1029,file:'Spell Data v5.33.txt'},
    '536e717c3395cd0c5618634c62a2d649e417dc99a08f8e4cbbe2180d734777bb':{type:'weapon',count:935,file:'Weapon Data v5.33.c5m'}
  });
  const weaponFields=['trgrank','range','init','dmgtype','dmg','aoe','look','flymode','flylook','sound','flysound'];
  const spellFlags=new Set(['slowcast','burnforest','notsea','notunderground','heallivingarmy','prioritylearn','healhumanarmy']);
  async function digest(text){
    if(!crypto?.subtle)throw new Error('Secure hashing is unavailable. Import reference data in the desktop application.');
    const bytes=new TextEncoder().encode(text);
    if(bytes.length>2*1024*1024)throw new Error('Reference export exceeds 2 MiB.');
    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
  }
  // Low-level reader returns unverified records. Only parseFiles attaches provenance after hashing.
  function readRecords(text,type,expectedCount){
    if(!['spell','weapon'].includes(type)||text.includes('\0'))throw new Error('Unsupported reference record input.');
    const entries=[];let current=null;
    function put(key,value,line){
      if(Object.hasOwn(current.fields,key))throw new Error(`Repeated ${key} in reference record ${current.id}.`);
      current.fields[key]=value;current.fieldLines[key]=line;
    }
    for(const [i,line] of text.split(/\r\n|\n|\r/).entries()){
      const head=line.match(/^new(spell|weapon)[ \t]+"([^"\r\n]*)"[ \t]*#[ \t]*(\d+)[ \t]*$/);
      if(head){
        if(head[1]!==type||!head[2])throw new Error('Unexpected declaration in reference export.');
        const id=Number(head[3]);if(!Number.isSafeInteger(id)||id<0||id>10000)throw new Error('Invalid explicit record ID.');
        current={key:`${type}:${id}`,type,name:head[2],id,fields:{},fieldLines:{},listedFlags:[],sourceLine:i+1};entries.push(current);continue;
      }
      if(!current||/^[ \t]*(?:#|$)/.test(line))continue;
      if(type==='spell'){
        const link=line.match(/^weapon[ \t]+"([^"\r\n]+)"[ \t]*#[ \t]*nbr[ \t]+(\d+)\.[ \t]*$/);
        if(link){put('weapon',link[2],i+1);put('weaponName',link[1],i+1);continue;}
      }
      const scalar=line.match(/^([a-z]+)[ \t]+([+-]?\d+)(?:[ \t]*(?:#.*)?)$/);
      if(scalar && (type==='spell'?['path','level','dmg']:weaponFields).includes(scalar[1])){
        put(scalar[1],scalar[2],i+1);
        if(type==='spell'&&scalar[1]==='path'){
          const label=line.match(/#[ \t]*(.*?)[.]?[ \t]*$/)?.[1];if(label)put('pathName',label.replace(/\.$/,''),i+1);
        }
        continue;
      }
      const flag=line.match(/^([a-z]+)[ \t]*(?:#.*)?$/)?.[1];
      if(type==='spell'&&spellFlags.has(flag))current.listedFlags.push(flag);
      // Other source commands remain unavailable; no defaults, evaluated expressions or flag masks.
    }
    const seen=new Set();
    for(const entry of entries){
      if(seen.has(entry.id))throw new Error('Duplicate explicit record ID.');seen.add(entry.id);
      const required=type==='spell'?['path','level','dmg','weapon','weaponName']:['trgrank','range','init','dmgtype','dmg','aoe'];
      for(const key of required)if(!Object.hasOwn(entry.fields,key))throw new Error(`Reference ${type} #${entry.id} lacks ${key}.`);
      if(type==='spell'&&!['1','2','3'].includes(entry.fields.level))throw new Error('Unexpected historical spell level.');
    }
    if(expectedCount!==undefined && (entries.length!==expectedCount || [...seen].some(id=>id>=expectedCount)))throw new Error('Reference count or explicit ID range differs from the supported snapshot.');
    return entries;
  }
  async function parseFiles(files){
    if(!Array.isArray(files)||!files.length||files.length>2)throw new Error('Import one spell export and/or one weapon export.');
    const entries=[],datasets=[],types=new Set();
    for(const file of files){
      if(typeof file.text!=='string')throw new Error('Missing reference source text.');
      const sha256=await digest(file.text),profile=profiles[sha256];
      if(!profile)throw new Error('Unsupported reference fingerprint/version. Only the exact CoE5 Data 5.33 spell and weapon exports are supported; nothing was inferred.');
      if(types.has(profile.type))throw new Error('Import only one export of each type.');types.add(profile.type);
      const records=readRecords(file.text,profile.type,profile.count),datasetId='coe5-data-5.33-'+profile.type;
      datasets.push({id:datasetId,type:profile.type,filename:profile.file,sha256,count:records.length,version:'5.33',source:sourceUrl});
      for(const entry of records)entries.push({...entry,origin:'vanilla',datasetId,verifiedRecord:true,idEvidence:'Explicit ID in the fingerprint-matched historical export; current-game availability is unverified.'});
    }
    if(types.has('spell')&&types.has('weapon')){
      const weapons=new Map(entries.filter(e=>e.type==='weapon').map(e=>[e.id,e]));
      for(const spell of entries.filter(e=>e.type==='spell')){
        const weapon=weapons.get(Number(spell.fields.weapon));
        if(!weapon||weapon.name!==spell.fields.weaponName)throw new Error('Spell-to-weapon ID/name cross-check failed.');
      }
    }
    return {kind:'data533',label:'CoE5 Data · historical values',version:'CoE5 5.33 · author-exported snapshot',complete:false,coverage:datasets.map(d=>`${d.count} ${d.type} records`).join(' · '),verification:'Exact SHA-256 matched to official editor provenance; explicit IDs preserved. Selected fields only; not current-game verification.',url:sourceUrl,datasets,entries};
  }
  return {parseFiles,readRecords,digest,profiles,weaponFields};
});
