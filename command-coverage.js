/* Workbench inspection policy, not an engine command validator.
 * Context/version facts checked against official CoE5SE 2.13.0, 3.2.2 and 3.3.0.
 * See docs/COMMAND-DIAGNOSTICS-0181.md. No upstream core code is embedded here. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CoeCommandCoverage=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const all=['2.13.0','3.2.2','3.3.0'],modern=['3.2.2','3.3.0'],rules=new Map();
  const add=(words,context,versions,transparent=false)=>{for(const word of words.split(' '))rules.set(word,{word,context,versions,transparent});};
  add('path weapon slowcast notsea notunderground prioritylearn heallivingarmy healhumanarmy','spell',all,true);
  add('healarmy','spell',modern,true);
  add('onlyaffects doesntaffect doubledmgvs noexplode','weapon',all,true);
  add('beamwidth','weapon',modern,true);
  add('battlemap battleterrain battlefort battlereplace battleweight battlewhen battleplane battlenoscatter battlescatter battleobject battleground','battle map',all);
  add('corpsekind','monster',all);
  add('corpsetype','monster',modern);
  add('needcorpses excludecorpses maxraise','ritual',modern);
  add('newcorpsetype newcorpsekind','corpse declaration',modern);
  add('personalmod nomultiplayer','mod',modern,true);
  const sections={newmonster:'monster',selectmonster:'monster',newclass:'class',selectclass:'class',newrit:'ritual',newritpow:'ritual',newritual:'ritual',selectritual:'ritual',newitem:'item',selectitem:'item',selectterr:'terrain',selectterrgroup:'terrain',newspellpath:'spell path',selectspellpath:'spell path',newplane:'plane',newfaction:'faction',newnametype:'names',newsetting:'settings',newsettingpage:'settings',newsettingheader:'settings',playerevent:'event',squareevent:'event',battlemap:'battle map',terrainlooks:'terrain',newcorpsetype:'corpse declaration',newcorpsekind:'corpse declaration'};
  function info(word){
    if(rules.has(word))return rules.get(word);
    // The official spell hook recognizes this family, but trait/tag existence
    // remains a runtime question. Recognition does not certify the arguments.
    if(/^heal[a-z]+army$/.test(word))return {word,context:'spell',versions:modern,transparent:true,family:true};
    return null;
  }
  function inspect(line,context){
    const rule=info(line.word);if(!rule)return null;
    if(rule.context!==context&&rule.context!=='mod')return {...rule,barrier:true,category:'coverage',severity:'warning',message:`Known CoE5SE ${rule.context} command “${line.word}” is outside the inspected ${context} context. Later fields are not assigned to this form.`};
    if(!rule.transparent)return {...rule,barrier:true,category:'coverage',severity:'info',message:`CoE5SE ${rule.context} content is preserved outside this form. Later fields need manual inspection.`};
    if(line.word==='beamwidth'&&!(line.tokens.length>=1&&line.tokens.length<=2&&!line.tokens[0].quoted&&/^\+?\d+$/.test(line.tokens[0].raw)&&BigInt(line.tokens[0].raw)>=1n&&BigInt(line.tokens[0].raw)<=15n&&(line.tokens.length===1||!line.tokens[1].quoted&&line.tokens[1].raw==='lines')))
      return {...rule,barrier:true,category:'syntax',severity:'error',message:'beamwidth needs an integer from 1 to 15, optionally followed by lines (CoE5SE 3.2.2/3.3.0).'};
    return {...rule,barrier:false,category:'coverage',severity:'info',message:`CoE5SE ${line.word} is preserved outside the form (checked in ${rule.versions.join(', ')}).${line.word==='healarmy'||rule.family?' Trait/tag resolution is not checked.':''}`};
  }
  return {info,inspect,sections,words:[...rules.keys()]};
});
