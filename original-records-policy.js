/* Original native records: identity and observation only, never a partial clone. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CoeOriginalPolicy=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function request(e){
    if(!e||!['spell','weapon'].includes(e.type))throw new Error('Choose a native spell or weapon.');
    if(!['installed','historical','runtime'].includes(e.sourceKind))throw new Error('Load the installed 5.43 catalog, or a recognized historical/runtime reference first. Draft definitions are not originals.');
    if(typeof e.name!=='string'||!e.name.trim()||e.name!==e.name.trim()||e.name.length>63||/[^\x20-\x7e]|["#\\]/.test(e.name))throw new Error('This name is outside the verified fixture text subset.');
    if(e.id!==null&&(!Number.isInteger(e.id)||e.id<0||e.id>(e.type==='spell'?1028:1199)))throw new Error('This ID is outside the pinned native table. Mod-added records need a different fixture.');
    return {type:e.type,id:e.id,name:e.name,sourceKind:e.sourceKind};
  }
  function reason(e){try{request(e);return '';}catch(error){return error.message;}}
  return {request,reason};
});
