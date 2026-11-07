-- Mock only: validates helper control flow, not engine behavior, rendering or AI.
-- The standalone SDK VM opens base/string/table only. CoE5SE's lua_loading.h also opens math.
math=math or {min=function(a,b)return a<b and a or b end,max=function(a,b)return a>b and a or b end}
local hooks,menu,hit,messages,saves={},{},{},{},{}
local opens,closes,battles,stops,frame,buttons=0,0,0,0,0,0
local x,y=0,0
local weapon={dmg=0,dmgtype=23,range=6,init=1,aoe=0,trgrank=1,look=7,flymode=2,flylook=7,sound=0,flysound=-1}
local function copy(t)local r={};for k,v in pairs(t)do r[k]=v end;return r end
coe5={ui={}}
function coe5.wrap(k,fn)hooks[k]=fn;return true end
function coe5.addMainMenuButton(label,fn)assert(label=='WB test: WB_Observe');menu=fn;return true end
function coe5.get(k,id,row)
 if k=='activePlayer'then return mode=='in_game'and 0 or -1
 elseif k=='screenW'then return mode=='small'and 300 or mode=='resize'and frame>0 and 300 or 914
 elseif k=='screenH'then return 600
 elseif k=='mouseButtons'then return buttons
 elseif k=='uiPointerX'then return x elseif k=='uiPointerY'then return y
 elseif k=='monsterLastIndex'then return 13
 elseif k=='monsterName'then return id==1 and'Wizard'or id==2 and'Spear carrier'or id==13 and(mode=='enemy_mismatch'and'Other'or'Spearman')or nil
 elseif k=='monsterAttackType'then if mode=='no_actor'or mode=='no_route'then return nil end;return row==0 and(id==1 and 3 or id==2 and 1 or nil)or nil
 elseif k=='monsterAttackWeapon'then return id==1 and 16 or id==2 and 4 or nil
 elseif k=='monsterAttackValue'then return id==1 and 1 or id==2 and 5 or nil
 elseif k=='weaponName'then return id==4 and'Spear'or id==139 and'Banishment'or nil
 elseif k=='weapon'then if mode=='missing_field'and row=='look'then return nil end;return weapon[row]
 end
 error('Unexpected getter '..k)
end
function coe5.set(k,value)assert(k=='mouseButtons','shared record write attempted');buttons=value;return true end
function coe5.spellInfo(id)
 if id==226 or id==366 then return {name=mode=='wrong_name'and'Changed'or'Banish',path=16,level=1,weapon=139,dmg=99}end
end
function coe5.showMessageBox(_,text)messages[#messages+1]=text end
function coe5.log(text)end
function coe5.readIni(name)return {session={schema='wb-session-1',id=string.rep('a',32),revision=string.rep('b',64),run=string.rep('c',32),mod='WB_Observe'}}end
function coe5.writeIni(name,t)assert(name=='wb-original-'..string.rep('c',32));saves[#saves+1]=copy(t.meta);return true end
function coe5.ui.screenBegin()end
function coe5.ui.sectionBegin()end
function coe5.ui.sectionEnd()end
function coe5.ui.text()end
function coe5.ui.buttonRow()end
function coe5.ui.bindEscape()end
function coe5.ui.wait()return mode=='cancel'and 9 or 1001 end
function coe5.ui.nameBox()return 'Wizard'end
function coe5.ui.drawRect()end
function coe5.ui.drawText(a,b,_,label)if label=='Battle (AI)'then hit.battle={a+1,b+1}elseif label=='Close'or label=='Stop / close'then hit.close={a+1,b+1}end end
function coe5.openTestField(...)
 assert(select('#',...)==4,'standIn was supplied');local actor,spell,enemy,count=...
 assert(enemy==13 and count==1)
 if kind=='spell'or mode=='weapon_spell'then assert(actor==1 and spell==226)else assert(actor==2 and spell==-1)end
 if mode=='refused_open'then return false end;if mode=='open_changed'then weapon.look=3 end;opens=opens+1;return true
end
local function waitAt(which,down)
 buttons=down and 1 or 0;x,y=table.unpack(hit[which]or{0,0});hooks.BATTLE_WAIT(function()return 0 end,0,0)
end
function coe5.drawTestField()
 frame=frame+1;assert(frame<7,'loop failed to exit');hooks.BATTLE_DRAW(function()end)
 waitAt(frame==1 and'battle'or'close',frame~=2)
end
function coe5.fightTestField()
 battles=battles+1
 if mode=='fight_error'then error('mock fight error')end
 if mode=='changed'then weapon.look=3 end
 if mode=='stop'then hooks.BATTLE_DRAW(function()end);waitAt('close',false);waitAt('close',true);assert(stops==1)end
end
function coe5.stopTestFight()stops=stops+1 end
function coe5.closeTestField()closes=closes+1;if mode=='cleanup_error'then error('mock cleanup failure')end end
if mode=='missing_api'then coe5.fightTestField=nil end
assert(load(helper))()
if mode=='missing_api'then assert(type(menu)~='function'and opens==0);return end
assert(type(menu)=='function');menu()
if mode=='small'or mode=='in_game'or mode=='wrong_name'or mode=='duplicate_name'or mode=='no_actor'or mode=='no_route'or mode=='enemy_mismatch'or mode=='missing_field'or mode=='refused_open'then
 assert(opens==0 and closes==0 and battles==0);assert(saves[#saves].stage=='error');assert(#messages>0)
elseif mode=='cancel'then assert(opens==0 and closes==0 and battles==0);assert(saves[#saves].stage=='cancelled',table.concat(messages,' | '))
else
 assert(opens==1 and closes==1,'opens='..opens..' closes='..closes..' messages='..table.concat(messages,' | '));if mode~='open_changed'then assert(saves[1].stage=='opened')end;assert(saves[#saves].selected==(kind=='spell'and'226'or mode=='weapon_spell'and'139'or'4'))
 if mode=='resize'or mode=='open_changed'then assert(battles==0 and saves[#saves].stage=='error')
 elseif mode=='fight_error'or mode=='cleanup_error'or mode=='changed'then assert(battles==1 and saves[#saves].stage=='error')
 else assert(battles==1 and saves[#saves].stage=='closed'and saves[#saves].battles==1);assert(saves[#saves].knownunchanged=='1')end
 if mode=='changed'then assert(weapon.look==3,'helper wrote a shared field back')end
 if mode=='stop'then assert(saves[#saves].stops==1)end
 assert(saves[#saves].forcedcasts==0)
end
