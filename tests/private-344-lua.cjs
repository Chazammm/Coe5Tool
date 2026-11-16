// Offline Lua-model inputs; no game. Execute with Check-Private344Lua.ps1.
const fs=require('node:fs'),creation=require('../creation'),core=require('../core');
const base=creation.fromSource(core.starter('c5m'),'c5m',1).spec;
const options={modId:'WB_344_Guard',runtimeVersion:'3.4.4',caster:'Spearman',casterId:'13',enemy:'Spearman',enemyId:'13',count:'1',weaponEditing:true};
const q=JSON.stringify,tests=[];
function prelude(spec,scenario,id=1200){return `local scenario=${q(scenario)}
local owner=${id}
local name=${q(spec.weaponName)}
local writes,opened,messages={},0,{}
local record={dmg=${spec.dmg},dmgtype=${spec.dmgtype},aoe=${spec.aoe},look=${spec.look||0},flymode=${spec.flymode||0},flylook=${spec.flylook||0}}
coe5={ui={drawRect=function()end,drawText=function()end}}
function coe5.get(key,index,word)
 if key=="activePlayer" then return -1 elseif key=="screenW" then return 914 elseif key=="screenH" then return 600 end
 if key=="monsterLastIndex" then return 2000 end
 if key=="monsterName" then return index==13 and "Spearman" or "" end
 if key=="weaponName" then return index==owner and (scenario=="renamed" and "Other record" or name) or "" end
 if key=="weapon" then assert(index==owner,"foreign read");return record[word] end
 error("Unexpected getter "..key)
end
function coe5.set(key,index,word,value)
 assert(key=="weapon" and index==1200,"shared record write");writes[#writes+1]=word
 if scenario=="refused" or scenario=="restore_refused" then return end
 if scenario=="partial" and word=="look" then return end
 record[word]=value
end
function coe5.log()end
function coe5.showMessageBox(title,message)messages[#messages+1]=message end
function coe5.findMonster(n)return 13 end
function coe5.spellInfo(id)if id==4094 then return {name=${q(spec.spellName)},path=${spec.path},level=${spec.level},dmg=${spec.weaponDamage},weapon=owner} end end
function coe5.openTestField()opened=opened+1;return false end
function coe5.drawTestField()error("unexpected draw")end
function coe5.fireTestField()error("unexpected cast")end
function coe5.closeTestField()end
function coe5.wrap()return true end
local menu
function coe5.addMainMenuButton(label,fn)if label:find("WB test:",1,true) then menu=fn end end
`;}
for(const weaponEditing of [false,true]){
 const result=creation.definition({...base,look:'68',flymode:'2',flylook:'65'},'c5m'),spec=result.spec,source=creation.testPackage(result.text,'c5m',{...options,weaponEditing}).files.find(f=>f.name.endsWith('.lua')).text;
 for(const [scenario,id]of [['private',1200],['native',22]])tests.push({name:(weaponEditing?'experiment':'fixed')+' / '+scenario,script:prelude(spec,scenario,id)+`assert(load(${q(source)}))()
assert(type(menu)=="function");menu()
assert(#writes==0,"preflight wrote content")
assert(opened==${id<1200?0:1},"private-ID preflight result")
assert(#messages==1,"missing refusal report")
`});
 if(weaponEditing){
  const from=source.indexOf('  local function read_values()'),to=source.indexOf('  local function close_owned()',from);if(from<0||to<0)throw Error('Reviewed helper function boundaries changed');
  const excerpt=source.slice(from,to);
  for(const scenario of ['write','refused','partial','renamed','native','restore_refused']){
   tests.push({name:'actual write/readback / '+scenario,script:prelude(spec,scenario,scenario==='native'?22:1200)+`local weapon_id,weapon_name=owner,name
local fields={"dmgtype","aoe","look","flymode","flylook"}
local function integer(n,min,max)return type(n)=="number" and n%1==0 and n>=min and n<=max end
local function valid_values()return true end
local function describe()return "test values" end
local function same(a,b)for _,k in ipairs(fields)do if a[k]~=b[k]then return false end end;return true end
`+excerpt+`
local ok,why=pcall(write_and_check,{dmgtype=${spec.dmgtype},aoe=${spec.aoe},look=3,flymode=2,flylook=65},${scenario==='restore_refused'})
assert(ok==${scenario==='write'},"unexpected write/readback outcome "..tostring(why))
if ${scenario==='native'||scenario==='renamed'} then assert(#writes==0,"identity failure reached a setter") end
`});
  }
 }
}
fs.writeFileSync(process.argv[2],JSON.stringify(tests,null,2)+'\n');console.log('Generated '+tests.length+' Lua model cases from the actual 3.4.4 helper.');
