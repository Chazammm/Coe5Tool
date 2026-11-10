local hooks,rects={},{}
local player,field,mouse,pointerX,pointerY=-1,false,0,0,0
local opens,closes,fights,stops,writes,sets,frames=0,0,0,0,0,0,0
local hp,monster,owner={}, {}, {}
local currentIds,lastUnit,lastCommander={},0,0
local visuals={flymode=2,flylook=65,look=68}
local receipts,notice,enter,title
local actions=mode=="limit" and {5,5,5,5,5,5,5,5,9} or mode=="sprite" and {5,1,3,4,5,9} or mode=="finish" and {9} or {5,3,4,5,9}
local actionAt,searchUsed=0,false
local function clone(t)if type(t)~="table" then return t end;local c={};for k,v in pairs(t)do c[k]=clone(v)end;return c end
local context={schema="wb-session-1",id=string.rep("a",32),revision=expectedRevision,run=string.rep("b",32),mod=expectedMod}
if mode=="bad_context" then context.run="wrong" end
-- The minimal test VM omits math; the official game runtime opens its math library.
local math={min=function(a,b)return a<b and a or b end,max=function(a,b)return a>b and a or b end,ceil=function(a)return -((-a)//1)end}
coe5={ui={}}
function coe5.get(key,id,word)
 if key=="weaponName" then return id==(mode=="shared" and 1199 or 1200) and expectedName or nil end
 if key=="monsterName" then return id==2000 and "WB Ranged Carrier" or id==609 and "Deer" or id==487 and "Winter Wolf" or nil end
 if key=="monsterHp" then return mode=="target_unavailable" and id==609 and 0 or id==487 and 13 or 6 end
 if key=="monsterLastIndex" then return 2000 end
 if key=="unitLastIndex" then return mode=="capacity" and 98999 or lastUnit end
 if key=="commanderLastIndex" then return mode=="commander_capacity" and 9989 or lastCommander end
 if key=="monsterAttackType" then return word==0 and 2 or nil end
 if key=="monsterAttackWeapon" then return mode=="relinked" and 5 or 1200 end
 if key=="monsterAttackValue" then return mode=="payload_drift" and fights>=2 and 13 or 12 end
 if key=="weapon" then
  if id~=1200 then return nativeWitnesses[id] and nativeWitnesses[id][word] end
  return visuals[word]~=nil and visuals[word] or ({range=5,aoe=5,dmgtype=5,dmg=0,init=7})[word]
 end
 if key=="unitMonster" then return mode=="wrong_type" and opens==2 and id==currentIds[2] and 487 or monster[id] end
 if key=="unitOwner" then return mode=="wrong_owner" and opens==2 and id==currentIds[2] and 0 or owner[id] end
 if key=="unitHp" then if mode=="unknown_cleanup" and closes>=2 and id==currentIds[2] then return nil end;return hp[id] end
 if key=="unitBattleX" or key=="unitBattleY" then
  if not field or mode=="missing_positions" then return nil end
  if mode=="bad_positions" and opens==2 then return 9999 end
  return key=="unitBattleX" and 18 or 9
 end
 if key=="activePlayer" then return player end
 if key=="screenW" or key=="uiViewWidth" then return 1100 end
 if key=="screenH" or key=="uiViewHeight" then return 800 end
 if key=="uiViewLeft" or key=="uiViewTop" then return 0 end
 if key=="uiScale" then return 1 end
 if key=="mouseButtons" then return mouse end
 if key=="uiPointerX" then return pointerX end
 if key=="uiPointerY" then return pointerY end
 if key=="monsterSprite" then return 0 end
end
function coe5.set(key,id,word,value)
 if key=="mouseButtons" then mouse=id;return end
 assert(key=="weapon" and id==1200 and (word=="look" or word=="flymode" or word=="flylook"),"Shared/nonvisual write")
 visuals[word]=value;sets=sets+1
 if mode=="partial_write" and sets==1 then error("private setter interrupted") end
end
function coe5.lookName(id)return effectNames[id] end
function coe5.unitColdResistance(id)return monster[id]==487 and 100 or 0 end
function coe5.wrap(key,fn)hooks[key]=fn;return true end
function coe5.addMainMenuButton(_,fn)enter=fn end
function coe5.readIni(file)if file=="workbench-session" then return {session=context} end;return mode=="existing" and {meta={protected=1}} or nil end
function coe5.writeIni(_,data)writes=writes+1;if mode=="save_failure" and writes>=9 then return false end;receipts=clone(data);return true end
function coe5.log(_)end
function coe5.showMessageBox(_,text)notice=text end
function coe5.ui.drawRect(...)rects[#rects+1]={...} end
function coe5.ui.drawText(...)end
function coe5.ui.screenBegin(t)title=t end
function coe5.ui.sectionBegin(...)end
function coe5.ui.sectionEnd(...)end
function coe5.ui.buttonRow(...)end
function coe5.ui.bindEscape(...)end
function coe5.ui.text(...)end
function coe5.ui.nameBox(...)return "#34" end
function coe5.ui.wait()
 if title=="Impact effect" then if mode=="search" and not searchUsed then searchUsed=true;return 1 end;return 1034 end
 if title=="Sprite flight | mode 1" then return 1007 end
 actionAt=actionAt+1;assert(actions[actionAt],"Unexpected extra menu iteration");return actions[actionAt]
end
local function click(which)
 mouse=0;hooks.BATTLE_WAIT(function()return 0 end)
 local r=rects[which=="cast" and 2 or 3];assert(r,"Missing dock hitbox");pointerX,pointerY=r[1]+4,r[2]+4
 mouse=1;hooks.BATTLE_WAIT(function()return 0 end);mouse=0;hooks.BATTLE_WAIT(function()return 0 end)
end
function coe5.openTestField(spec)
 assert(not field,"Previous field not closed")
 for _,v in pairs(hp)do assert(v<=0,"Previous unit still active")end
 opens=opens+1
 assert(spec.commander==2000 and spec.spell==-1 and spec.standIn==-1 and #spec.enemies==2 and spec.enemies[1][1]==609 and spec.enemies[1][2]==2 and spec.enemies[2][1]==487 and spec.enemies[2][2]==1)
 if opens==2 and mode=="refused" then return false end
 local base=mode=="reuse" and 1 or lastUnit+1
 currentIds={base+1,base+2,base+3};monster[base],owner[base],hp[base]=2000,0,6
 for i,id in ipairs(currentIds)do monster[id],owner[id],hp[id]=i==3 and 487 or 609,24,i==3 and 13 or 6 end
 lastUnit=base+3;lastCommander=lastCommander+1;field,player,frames=true,0,0
 if opens==2 and mode=="open_error" then error("allocation callback failure") end
 if opens==2 and mode=="missing_array" then return true end
 return true,{commander=base,friends={},enemies=opens==2 and mode=="partial" and {base+1} or opens==2 and mode=="duplicate" and {base+1,base+1,base+3} or currentIds}
end
function coe5.drawTestField()
 if opens==2 and mode=="draw_error" then error("draw failed") end
 rects={};hooks.BATTLE_DRAW(function()end);frames=frames+1;assert(frames<5,"Field did not close")
 click(mode=="cancel" and opens==1 and "close" or frames<=2 and "cast" or "close")
end
function coe5.fightTestField()
 fights=fights+1
 if opens==2 and mode=="fight_error" then error("battle interrupted") end
 hp[currentIds[1]]=3
 if mode=="stop" and opens==1 then rects={};hooks.BATTLE_DRAW(function()end);click("close") end
 if mode=="visual_drift" and opens==2 then visuals.look=49 end
end
function coe5.stopTestFight()stops=stops+1 end
function coe5.closeTestField()
 closes=closes+1
 if opens==2 and mode=="close_error" then error("close failed") end
 field,player=false,mode=="menu_mismatch" and opens==2 and 0 or -1
 for id in pairs(hp)do hp[id]=0 end
 if mode=="surviving" and opens==2 then hp[currentIds[1]]=1 end
end
