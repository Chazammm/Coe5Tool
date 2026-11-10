const creation=require('../creation'),melee=require('../melee');
const roster=[{id:609,name:'Deer',count:2},{id:487,name:'Winter Wolf',count:1}];
const spec={weaponName:'Official Group Needle',range:'5',init:'7',dmgtype:'5',dmg:'0',aoe:'5',flymode:'2',flylook:'65',look:'68'};
function candidate(options={}){const source=creation.weaponDefinition({...spec,...options.spec}).text;return melee.testPackage(source,'c5m','WB_OfficialGroups','12',!!options.compare,roster[0],'1',options.roster||roster,options.runtime||'3.2.2');}
function reading(){return {sessionId:'a'.repeat(32),provenance:'official-group-1',areaCode:5,element:'cold',battleReturns:1,closed:true,restored:null,
  status:'closed',message:'',phase:'after-battle-return',requested:3,returned:3,stopped:false,closeAttempted:true,mainMenuAfterClose:true,
  units:roster.flatMap(g=>Array.from({length:g.count},()=>g)).map((g,i)=>({unit:i+2,monster:g.id,name:g.name,beforeHp:g.id===609?6:13,afterHp:i===0?3:0,resistance:i===2?100:0,setupPosition:{x:18,y:9+i},endPosition:i===0?{x:16,y:9}:null}))};}
module.exports={roster,spec,candidate,reading};
