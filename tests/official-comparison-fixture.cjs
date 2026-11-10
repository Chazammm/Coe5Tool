const crypto=require('node:crypto'),creation=require('../creation'),melee=require('../melee');
const roster=[{id:609,name:'Deer',count:2},{id:487,name:'Winter Wolf',count:1}];
const spec={weaponName:'Official Comparison Needle',range:'5',init:'7',dmgtype:'5',dmg:'0',aoe:'5',flymode:'2',flylook:'65',look:'68'};
function candidate(){const source=creation.weaponDefinition(spec).text;return melee.testPackage(source,'c5m','WB_OfficialCompare','12',true,roster[0],'2',roster,'3.2.2');}
function fixture(){
 const p=candidate(),revision=crypto.createHash('sha256').update('c5m\0'+p.source).digest('hex');
 const context={resultSchema:5,visualCatalog:2,legacy:false,source:p.source,sourceRevision:revision,mode:'c5m',weaponName:spec.weaponName,spellName:'weapon '+spec.weaponName,baseline:{look:'68',flymode:'2',flylook:'65'},sessionId:'a'.repeat(32),run:'b'.repeat(32),modId:p.modId,areaCode:5,roster:structuredClone(roster),runtime:'CoE5 5.43 / CoE5SE 3.2.2 (preview)',runtimeVersion:'3.2.2',groupApi:'official-group-1'};
 const attempts=[0,1].map(n=>({attemptIndex:n+1,parameterRevision:n,readBackConfirmed:true,values:{flymode:2,flylook:65,look:n?34:68},mixedReading:{
  sessionId:context.sessionId,provenance:'official-group-1',areaCode:5,element:'cold',battleReturns:1,closed:true,restored:null,status:'closed',message:'',phase:'after-battle-return',requested:3,returned:3,stopped:false,closeAttempted:true,mainMenuAfterClose:true,trackedInactive:4,carrierUnit:n*4+1,unitsBefore:n*4,commandersBefore:n,
  units:roster.flatMap(g=>Array.from({length:g.count},()=>g)).map((g,i)=>({unit:n*4+i+2,monster:g.id,name:g.name,beforeHp:g.id===609?6:13,afterHp:i===2?13:3,resistance:i===2?100:0,setupPosition:{x:18,y:9+i},endPosition:null}))
 }}));
 const samples=attempts.map((a,i)=>({index:i+1,attemptIndex:a.attemptIndex,parameterRevision:a.parameterRevision,kind:i?'applied':'baseline',battleCount:1,readBackConfirmed:true,areaCode:5,values:{...a.values},mixedReading:structuredClone(a.mixedReading)}));
 return {context,samples,attempts,comparisonStatus:'finished',privateVisualsRestored:true,comparisonMessage:'',areaCode:5,resistanceElement:'cold',error:null};
}
module.exports={candidate,fixture,spec,roster};
