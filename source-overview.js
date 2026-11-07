/* Source summaries only: no inherited defaults, runtime IDs or effective-record reconstruction. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./damage-types.js'));else root.CoeSourceOverview=factory(root.CoeDamage);})(typeof globalThis!=='undefined'?globalThis:this,function(damage){
  'use strict';
  function inScope(block,target,scope){return scope==='all'||target!=='vanilla'||block.type==='weapon';}
  function matches(name,line,query){return query.trim().toLowerCase().split(/\s+/).filter(Boolean).every(t=>t.startsWith('line:')?/^line:\d+$/.test(t)&&line===Number(t.slice(5)):name.toLowerCase().includes(t));}
  function rows(model,type,query='',target='coe5se',scope='target'){
    const values=b=>Object.fromEntries(b.fields.filter(f=>f.editable&&f.value!=='').map(f=>[f.key,f.value]));
    const usage=new Map();for(const b of model.blocks)if(b.type==='spell')for(const id of b.matches){if(!usage.has(id))usage.set(id,[]);usage.get(id).push(b);}
    return model.blocks.filter(b=>b.type===type&&inScope(b,target,scope)).map(b=>{
      const f=values(b),line=b.header.number,partial=b.opaque||!b.headerSafe||b.fields.some(f=>f.reason&&f.reason!=='Not explicitly declared here'&&!f.addable&&!f.editable);
      const users=b.type==='weapon'?usage.get(b.id)||[]:[];
      const links=b.type==='spell'?b.matches.map(id=>model.blocks[id]):users;
      const relationship=b.type==='spell'?(links.length===1?'Source match · line '+links[0].header.number:links.length>1?links.length+' source matches · ambiguous':'External / numeric / unresolved'):(users.length?users.length+' spell reference'+(users.length===1?'':'s'):'No local spell reference');
      return {id:b.id,name:b.name,type:b.type,line,opener:b.opener,partial,extenderLines:b.header.marked||b.entries.some(e=>e.marked),links:links.map(x=>({id:x.id,name:x.name,line:x.header.number})),
        primary:b.type==='spell'?'Path '+(f.path??'—')+' · level '+(f.level??'—'):(f.dmgtype!==undefined?damage.name(f.dmgtype):'Type —')+' · payload '+(f.dmg??'—'),
        secondary:b.type==='spell'?(f.weaponRef??'Weapon unresolved')+' · payload '+(f.weaponDamage??'—'):'Range '+(f.range??'—')+' · area '+(f.aoe??'—'),relationship};
    }).filter(r=>matches(r.name,r.line,query));
  }
  return {rows,inScope,matches};
});
