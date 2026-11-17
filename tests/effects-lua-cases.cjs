/* Actual generated Lua with synthetic APIs. No engine or game process is loaded. */
const fs=require('node:fs'),effects=require('../effect-browser'),p=effects.testPackage({modId:'WB_Effects_luamodel',runtimeVersion:process.env.WB_EFFECTS_RUNTIME||'3.4.4',target:{id:13,name:'Spearman',count:4}}),q=JSON.stringify;
const source=p.files.find(f=>f.name.endsWith('.lua')).text;
const roles=require('../desktop/RangedVisuals543.json').groups;
const names={};for(const group of Object.values(roles))for(const [id,row]of Object.entries(group))if(row.name)names[id]=row.name;
const named='{'+Object.entries(names).map(([id,name])=>'['+id+']='+q(name)).join(',')+'}';
const witnesses={};for(const [kind,group]of Object.entries(roles))for(const [id,r]of Object.entries(group))if(r.witness!==null){const v=witnesses[r.witness]??={};if(kind==='impact')v.look=Number(id);else{v.flymode=kind==='sprite'?1:2;v.flylook=Number(id);}}
const witnessLiteral='{'+Object.entries(witnesses).map(([id,v])=>'['+id+']={'+Object.entries(v).map(([key,value])=>key+'='+value).join(',')+'}').join(',')+'}';
const expose='\nreturn {B=B,layout=layout,hit=hit,matches=matches,sort=sort,load_catalog=load_catalog,spell_reason=spell_reason,inspect_text=inspect_text,resolve_private=resolve_private,open_selected=open_selected,close_field=close_field,act=act,run=run,available=available}';
function prelude(scenario){return `
local scenario,width,height,mouse,px,py=${q(scenario)},914,600,0,0,0
math=math or {min=function(a,b)if a<b then return a else return b end end,max=function(a,b)if a>b then return a else return b end end}
local writes,casts,opens,closes,frames,nativeMenus=0,0,0,0,0,0
local hooks,packets,messages={}, {}, {}
local original={dmg=0,dmgtype=4,range=20,init=3,aoe=5,look=68,flymode=6,flylook=65,sound=0,flysound=-1,nextalwayswep=-1}
local scratch={dmg=1,dmgtype=3,range=30,init=3,aoe=0,look=68,flymode=2,flylook=65,sound=0,flysound=-1,nextalwayswep=-1}
local spear={dmg=0,dmgtype=3,range=1,init=3,aoe=0,look=68,flymode=0,flylook=0,sound=0,flysound=-1,nextalwayswep=-1}
local witnesses=${witnessLiteral}
for id,v in pairs(witnesses)do local r=id==54 and original or id==4 and spear;if r then for k,value in pairs(v)do r[k]=value end end end
local effectnames=${named}
coe5={ui={}}
function coe5.get(key,id,word)
 if key=="activePlayer"then return -1 elseif key=="screenW"then return width elseif key=="screenH"then return height end
 if key=="mouseButtons"then return mouse elseif key=="uiPointerX"then return px elseif key=="uiPointerY"then return py end
 if key=="weaponName"then if id==54 then return "Fireball"elseif id==4 then return "Spear"elseif id==1200 then return scenario=="renamed"and"Foreign"or"WBEW_WB_Effects_luamodel"end;return ""end
 if key=="monsterName"then return id==13 and"Spearman"or""end
 if key=="unitMonster"then return (scenario=="wrong_unit"or scenario=="wrong_caster"and id==10)and 609 or 13 end
 if key=="weapon"then local r=id==1200 and scratch or id==54 and original or id==4 and spear or witnesses[id];return r and r[word]end
 error("Unexpected get "..key)
end
function coe5.set(key,id,word,value)
 if key=="mouseButtons"then mouse=id;return end
 assert(key=="weapon"and id==1200,"shared record write")
 writes=writes+1;if scenario=="refused"then return end;if scenario=="partial"and word=="flymode"then return end;scratch[word]=value
end
function coe5.spellInfo(id)
 if id==445 then return {name="Fireball",path=3,level=2,weapon=54,dmg=15}end
 if id==303 then return {name="Fireball",path=6,level=3,weapon=54,dmg=15}end
 if id==999 then return {name="Special",path=3,level=1,weapon=4,dmg=-1}end
 if id==4094 then return {name="WBES_WB_Effects_luamodel",path=3,level=1,weapon=scenario=="native_private"and 54 or 1200,dmg=1}end
end
function coe5.lookName(id)if scenario=="missing_effect"and id==3 then return nil end;return effectnames[id]end
function coe5.wrap(key,callback)hooks[key]=callback;return true end
function coe5.addMainMenuButton(label,callback)assert(label=="Test Effects: WB_Effects_luamodel");menu=callback end
function coe5.showMessageBox(_,message)messages[#messages+1]=message end
function coe5.log()end
function coe5.copyText(text)copied=text;return true end
function coe5.readIni()return {session={schema="wb-session-1",mod="WB_Effects_luamodel",id=string.rep("a",32),revision=string.rep("b",64),run=string.rep("c",32)}}end
function coe5.writeIni(name,data)assert(name=="wb-effects-"..string.rep("c",32));packets[#packets+1]=data;return scenario~="write_fail"end
function coe5.openTestField(caster,spell,target,count,...)
 assert(select("#",...)==0,"standIn used");assert(caster==13 and target==13 and count==4);opens=opens+1
 if scenario=="open_fail"then return false end
 return true,{commander=10,enemies=scenario=="partial_units"and{1,2}or scenario=="duplicate_units"and{1,1,3,4}or scenario=="caster_target"and{10,2,3,4}or{1,2,3,4}}
end
function coe5.closeTestField()closes=closes+1;if scenario=="close_refused"then return false,"not_owner"end;if scenario=="close_fail"then error("model close failed")end end
function coe5.fireTestField()if scenario=="cast_refused"then return false,"not_owner"end;casts=casts+1;if scenario=="mutate_original"then original.look=3 end end
function coe5.drawTestField()frames=frames+1;if frames>3 then error("model loop guard")end;if state then state.B.request={action="close"}end end
for _,key in ipairs({"drawRect","drawText","screenBegin","sectionBegin","sectionEnd","buttonRow","text","bindEscape"})do coe5.ui[key]=function()end end
function coe5.ui.screenBegin()nativeMenus=nativeMenus+1 end
function coe5.ui.nameBox()return "fire"end
function coe5.ui.wait()return 1 end
local ex=assert(load(${q(source+expose)}))();state=ex
local function row(kind,id)for _,r in ipairs(ex.B.rows[kind])do if r.id==id then return r end end;error("missing row "..kind.." "..id)end
local function prepare()ex.resolve_private();ex.load_catalog();ex.B.visual={look=68,flymode=2,flylook=65};ex.B.calls=0;ex.B.selected=row("spells",445)end
`;}
const cases=[];function add(name,scenario,code){cases.push({name,script:prelude(scenario)+code});}
add('catalog partial search, duplicate IDs, order, unsupported slots and eligible Fireball','normal',`
prepare();assert(ex.matches(row("spells",445),"ire"));assert(ex.matches(row("spells",445),"#44"));assert(not ex.matches(row("spells",445),"nothing"));assert(#ex.B.rows.spells==3);assert(ex.B.rows.spells[1].id==303 and ex.B.rows.spells[2].id==445);assert(not row("spells",999).reason);assert(row("weapons",4).reason);assert(row("effects",299).reason);assert(not row("spells",445).reason);assert(writes==0 and casts==0)
`);
add('original spell deliberate call, reset and close never set shared records','normal',`
prepare();ex.open_selected();assert(casts==0 and writes==0);ex.act("cast");assert(casts==1 and writes==0 and ex.B.calls==1);assert(packets[#packets].meta.visualobserved=="unknown" and packets[#packets].meta.hit=="unknown");ex.act("reset");assert(opens==2 and closes==1 and casts==1);ex.close_field();assert(closes==2 and original.look==68)
`);
add('private impact and sprite changes read back and keep damage independent','normal',`
prepare();ex.B.selected=row("impact",3);ex.act("cast");assert(casts==1 and scratch.look==3 and scratch.dmgtype==3 and scratch.dmg==1 and scratch.aoe==0 and scratch.flymode==2);ex.B.selected=row("sprite",7);ex.act("cast");assert(casts==2 and scratch.flymode==1 and scratch.flylook==7 and scratch.look==3);assert(original.look==68)
`);
for(const scenario of ['refused','partial'])add('private '+scenario+' setter cannot authorize Cast',scenario,`
prepare();ex.B.selected=row("sprite",7);local ok=pcall(ex.act,"cast");assert(not ok);assert(casts==0 and opens==0 and writes>0);assert(original.look==68)
`);
for(const scenario of ['renamed','native_private'])add('private identity refuses '+scenario+' before any setter',scenario,`
local ok=pcall(prepare);assert(not ok and writes==0 and casts==0)
`);
for(const scenario of ['partial_units','wrong_unit'])add('spawned identities refuse '+scenario+' before Cast',scenario,`
prepare();local ok=pcall(ex.act,"cast");assert(not ok and casts==0);ex.close_field();assert(closes==1)
`);
add('original numeric changes after a call are errors, not inferred success','mutate_original',`
prepare();ex.open_selected();local ok=pcall(ex.act,"cast");assert(not ok and casts==1 and writes==0 and ex.B.calls==0)
`);
add('inspect copies actual visual values with explicit incomplete-definition limits','normal',`
prepare();local text=ex.inspect_text(row("spells",445));assert(text:find("weapon #54",1,true)and text:find("flymode 6",1,true)and text:find("not a complete definition",1,true));ex.B.selected=row("spells",445);ex.act("inspect");assert(ex.B.inspecting and nativeMenus==0 and copied==nil);ex.act("copy");assert(copied==text and casts==0 and writes==0);assert(packets[#packets].entry1.event=="inspected")
`);
add('inline inspector retains visible Cast and can request the original without closing inspection','normal',`
prepare();ex.B.selected=row("spells",999);ex.act("inspect");assert(ex.B.inspecting and nativeMenus==0);local d=ex.layout(914,600,false);local found={};for _,b in ipairs(d.buttons)do found[b[1]]=b end;assert(found.cast[6]=="Cast"and found.cast[3]==488 and found.copy and found.inspectBack and not found.select);ex.act("cast");assert(casts==1 and ex.B.inspecting and ex.B.calls==1 and writes==0);ex.act("inspectBack");assert(not ex.B.inspecting)
`);
add('the panel steps aside during Cast and input cannot queue another cast before fresh paint','normal',`
prepare();ex.B.active=true;local rects=0;coe5.ui.drawRect=function()rects=rects+1 end;hooks.BATTLE_DRAW(function()end);assert(rects>0);rects=0;ex.B.casting=true;hooks.BATTLE_DRAW(function()end);assert(rects==0 and ex.B.painted==nil);mouse=1;hooks.BATTLE_WAIT(function()return 12 end,0,0);assert(ex.B.request==nil);ex.B.casting=false;hooks.BATTLE_DRAW(function()end);assert(rects>0 and ex.B.painted)
`);
add('responsive right-panel geometry, no log-lane or button overlap and stale hitboxes discarded','normal',`
for _,size in ipairs({{700,480},{914,600},{1100,800},{1600,900}})do local d=assert(ex.layout(size[1],size[2],false));assert(d.x>=300 and d.x+d.w<=size[1] and d.y>=140 and d.y+d.h<=size[2]);for i,b in ipairs(d.buttons)do if b[1]=="cast"then assert(b[6]=="Cast"and b[3]==size[2]-112)end;assert(b[2]>=d.x and b[2]+b[4]<=d.x+d.w and b[3]>=d.y and b[3]+b[5]<=d.y+d.h);for j=1,i-1 do local a=d.buttons[j];assert(b[2]+b[4]<=a[2]or a[2]+a[4]<=b[2]or b[3]+b[5]<=a[3]or a[3]+a[5]<=b[3],"overlapping buttons")end end end
assert(not ex.layout(699,600,false));assert(not ex.layout(914,479,false));prepare();ex.B.active=true;hooks.BATTLE_DRAW(function()end);local d=ex.B.painted;local b;for _,r in ipairs(d.buttons)do if r[1]=="cast"then b=r end end;px,py=b[2]+3,b[3]+3;mouse=1;ex.B.held=false;hooks.BATTLE_WAIT(function()return 0 end,0,0);assert(ex.B.request.action=="cast");ex.B.request=nil;mouse=1;hooks.BATTLE_WAIT(function()return 0 end,0,0);assert(ex.B.request==nil);width=1000;mouse=1;ex.B.held=false;hooks.BATTLE_WAIT(function()return 0 end,0,0);assert(ex.B.request==nil and casts==0)
`);
add('normal browser opening and closing does not cast automatically','normal',`
ex.run();assert(opens==1 and closes==1 and casts==0);assert(packets[#packets].meta.stage=="closed");assert(original.look==68)
`);
add('failed field open has no cast and produces an error receipt','open_fail',`
ex.run();assert(opens==1 and casts==0 and closes==0);assert(packets[#packets].meta.stage=="error")
`);
add('failed close refuses further opening and does not restore while open','close_fail',`
ex.run();assert(casts==0 and writes==0 and ex.B.opened);local n=opens;ex.run();assert(opens==n and writes==0);assert(packets[#packets].meta.stage=="error")
`);
add('bound receipt refusal is reported without claiming visual success','write_fail',`
ex.run();assert(casts==0 and #messages>0);assert(not ex.B.opened)
`);
for(const scenario of ['duplicate_units','caster_target','wrong_caster'])add('reject '+scenario+' before any cast',scenario,`
prepare();local ok=pcall(ex.open_selected);assert(not ok and casts==0);ex.close_field();assert(closes==1)
`);
add('missing role candidate remains inspectable without commands, a cast or a poisoned session','missing_effect',`
prepare();ex.B.selected=row("impact",3);assert(ex.B.selected.reason);ex.act("inspect");assert(ex.B.inspecting and not ex.B.poisoned and writes==0);ex.act("copy");assert(not copied:find("\\nlook 3",1,true));ex.act("cast");assert(casts==0)
`);
add('explicit cast refusal records request but not a returned call','cast_refused',`
prepare();ex.open_selected();local ok=pcall(ex.act,"cast");assert(not ok and ex.B.requests==1 and ex.B.calls==0 and casts==0);assert(packets[#packets].meta.stage=="cast-requested");ex.close_field()
`);
add('explicit close refusal never permits private writes or another field','close_refused',`
ex.run();assert(ex.B.opened and ex.B.poisoned and casts==0 and writes==0);local n=opens;ex.run();assert(opens==n and writes==0);assert(packets[#packets].meta.stage=="error")
`);
if(require.main===module&&process.argv[3]){
 const packet=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));if(packet.gameSha256!=='489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55'||packet.schema!=='wb-installed-543')throw Error('Only the pinned locally decoded catalog is accepted');
 const integer=s=>'0x'+BigInt.asUintN(64,BigInt(s)).toString(16),wordKeys=['dmg','dmgtype','range','init','aoe','trgrank','look','flymode','flylook','sound','flysound','nextalwayswep'];
 const weaponRows=packet.entries.filter(r=>r.type==='weapon'),spellRows=packet.entries.filter(r=>r.type==='spell');
 const weapons='{'+weaponRows.map(r=>'['+r.id+']={name='+q(r.name)+','+wordKeys.filter(k=>r.fields[k]!==undefined).map(k=>k+'='+integer(r.fields[k])).join(',')+'}').join(',')+'}';
 const spells='{'+spellRows.map(r=>'['+r.id+']={name='+q(r.name)+',path='+r.fields.path+',level='+r.fields.level+',weapon='+r.fields.weapon+',dmg='+integer(r.fields.weaponDamage)+'}').join(',')+'}';
 add('all '+spellRows.length+' pinned native spell IDs request their original records in the Lua model; no payload reconstruction or shared setters','full_catalog',`
local nativeWeapons,nativeSpells=${weapons},${spells}
local oldGet,oldSpell=coe5.get,coe5.spellInfo
function coe5.get(key,id,word)if key=="weaponName"and id<1200 then return nativeWeapons[id]and nativeWeapons[id].name or""elseif key=="weapon"and id<1200 then return nativeWeapons[id]and nativeWeapons[id][word]end;return oldGet(key,id,word)end
function coe5.spellInfo(id)if id<=1028 then return nativeSpells[id]end;return oldSpell(id)end
local requested={}
function coe5.openTestField(caster,spell,target,count,...)assert(select("#",...)==0 and caster==13 and target==13 and count==4);assert(nativeSpells[spell]);requested[#requested+1]=spell;opens=opens+1;return true,{commander=10,enemies={1,2,3,4}}end
prepare();assert(#ex.B.rows.spells==${spellRows.length});for _,r in ipairs(ex.B.rows.spells)do assert(not r.reason,"unexpected blocked original "..r.id);ex.B.selected=r;ex.act("cast");assert(requested[#requested]==r.id and r.payload==nativeSpells[r.id].dmg)end;ex.close_field();assert(casts==${spellRows.length} and ex.B.calls==casts and writes==0 and closes==casts);assert(#ex.B.history==64 and ex.B.discarded==casts-64)
`);
}
if(require.main===module)fs.writeFileSync(process.argv[2],JSON.stringify(cases));module.exports={cases};
