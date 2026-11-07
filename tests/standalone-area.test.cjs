const {test}=require('node:test');
const assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const c=require('../creation'),m=require('../melee'),r=require('../return-values');
const spec={weaponName:'Area Trial',range:'5',init:'5',dmgtype:'5',dmg:'0',aoe:'5',flymode:'1',flylook:'7',look:'68'};
test('nearby codes 0–5 keep the explicit source area on fixed melee, ranged and comparison without changing damage or visuals',()=>{
 for(const area of ['0','1','2','3','4','5'])for(const [range,compare]of [['1',false],['5',false],['5',true]]){
   const source=c.weaponDefinition({...spec,aoe:area,range,...(range==='1'?{flymode:'',flylook:'',look:''}:{})}).text;
   const p=m.testPackage(source,'c5m','WB_Area','8',compare,{id:609,name:'Deer'},'5');
   assert.equal(p.source,source);assert.ok(p.files[0].text.includes(source.trimEnd()));
   assert.ok(p.files[1].text.includes('aoe='+area+',dmgtype=5,dmg=0'));
   if(area!=='0')assert.ok(p.files[1].text.includes((compare?'row':'meta')+'.area='+area));
   assert.equal(p.manifest.areaLayout,compare&&area!=='0'?1:undefined);
   assert.match(p.files[3].text,new RegExp('Area code '+area));assert.match(p.files[0].text,/weapon 8 "Area Trial"/);
 }
 for(const aoe of ['6','997','999','3005']) {
   const source=specToSource(aoe);assert.throws(()=>m.specification(source,'c5m',true),/area codes 0–5/);
 }
 function specToSource(aoe){return c.weaponDefinition(spec).text.replace('aoe 5','aoe '+aoe);}
});
test('area evidence is bound to the source and cannot be returned as a visual change',async()=>{
 const source=c.weaponDefinition(spec).text,context={sessionId:'a'.repeat(32),run:'b'.repeat(32),sourceRevision:createHash('sha256').update('c5m\0'+source).digest('hex'),source,mode:'c5m',legacy:false,
 resultSchema:3,visualCatalog:2,areaCode:5,spellName:'weapon '+spec.weaponName,weaponName:spec.weaponName,baseline:{look:'68',flymode:'1',flylook:'7'},target:{id:609,name:'Deer',count:3}};
 const sample={index:1,parameterRevision:0,kind:'baseline',battleCount:1,readBackConfirmed:true,areaCode:5,values:{look:68,flymode:1,flylook:7},targetReading:{id:609,units:[2,3,4].map(unit=>({unit,resistance:0}))}};
 const packet=await r.validatePacket({context,samples:[sample]});
 assert.equal(packet.areaCode,5);
 assert.deepEqual(r.plan(context,packet.samples[0],{text:source,mode:'c5m',selected:0,inputs:{init:'9',aoe:'2'}}).rows.map(x=>x.key).sort(),['flylook','flymode','look']);
 await assert.rejects(r.validatePacket({context:{...context,areaCode:0},samples:[sample]}),/area code/);
 await assert.rejects(r.validatePacket({context,samples:[{...sample,areaCode:1}]}),/area code/);
 await assert.rejects(r.validatePacket({context,samples:[{...sample,areaCode:undefined}]}),/area code/);
});
