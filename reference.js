(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CoeReference=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const knownBlob='581a1cfee0c071b090714324f76da148aa2641d2';
  const namesUrl='https://github.com/musical-pianist/coe5se-modding-tools/blob/85643c49810b502767b37aa663fe34885ad90cdd/vscode-extension/data/names.json';
  const spellUrl='https://github.com/musical-pianist/coe5se-docs/blob/093e5e44536b3a76323aad80eaa1737830579607/docs/commands/spells.md';
  function seed(){return {label:'Documented example · 1 weapon',version:'Official spell documentation; game build unspecified',complete:false,verification:'Documented reference only; not installed-game verification',url:spellUrl,entries:[{key:'weapon:example',type:'weapon',name:'Fireball',origin:'vanilla',id:54,idEvidence:'Documented weapon reference in the official CoE5SE spell example. Build-specific ID stability is not verified.',fields:{}}]};}
  function parseIndex(text,proof={}){
    if(typeof text!=='string'||new TextEncoder().encode(text).length>1024*1024)throw new Error('Name index must be UTF-8 JSON up to 1 MiB.');
    const data=JSON.parse(text),known=proof.gitBlob===knownBlob,entries=[];
    for(const type of ['spell','weapon']){
      if(!Array.isArray(data[type])||data[type].length>10000)throw new Error('Expected spell and weapon arrays, up to 10,000 names each.');
      const seen=new Set();
      for(const name of data[type]){
        if(typeof name!=='string'||!name.trim()||name.length>200||name.includes('\0'))throw new Error('Names must be nonempty strings, at most 200 characters, without NUL.');
        if(seen.has(name))continue;seen.add(name);
        entries.push({key:type+':'+entries.length,type,name,origin:known?'vanilla':'unknown',id:null,idEvidence:'Not supplied by this name index.',fields:{}});
      }
    }
    return {label:known?'Official editor name index · partial':'User-imported name index · origin unknown',version:known?'CoE5 5.33 source snapshot; official tools 0.1.8':'Version not established',complete:false,verification:known?'Exact upstream Git blob matched; names only, not full definitions':'Content parsed; authorship, IDs and game version not verified',url:known?namesUrl:null,gitBlob:proof.gitBlob||null,sha256:proof.sha256||null,entries};
  }
  function search(catalog,query='',type='all'){
    const q=query.trim().toLowerCase();return catalog.entries.filter(e=>(type==='all'||e.type===type)&&(e.name.toLowerCase().includes(q)||(e.id!==null&&String(e.id)===q)));
  }
  function display(value){return value===null||value===undefined?'Not provided':String(value);}
  function quotedName(entry){
    if(entry.type!=='weapon')throw new Error('Only weapon names can be staged in a spell assignment.');
    if(!entry.name||/["#\\\r\n\0]/.test(entry.name)||new TextEncoder().encode(entry.name).length>63)throw new Error('Name is outside the safe quoted weapon-reference subset.');
    return '"'+entry.name+'"';
  }
  return {seed,parseIndex,search,display,quotedName,knownBlob};
});
