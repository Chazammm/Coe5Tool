-- API model only: it does not load the game, extender, hooks or battlefield.
local enter,notice,receipt
local hooks,rects={},{}
local field,player,mouse=false,-1,0
local pointerX,pointerY,frames=0,0,0
local opens,closes,fights,stops,writes=0,0,0,0,0
local hp={[1]=6,[2]=6,[3]=6,[4]=13}
local context={schema="wb-session-1",id=string.rep("a",32),revision=string.rep("b",64),run=string.rep("c",32),mod=expectedMod}
local weapon={range=5,aoe=5,dmgtype=5,dmg=0,init=7,flymode=2,flylook=65,look=68}
local function clone(t)local n={};for k,v in pairs(t) do n[k]=type(v)=="table" and clone(v) or v end;return n end
coe5={ui={}}
function coe5.get(key,id,attr)
 if key=="activePlayer" then return player end
 if key=="screenW" then return 1100 elseif key=="screenH" then return 800 end
 if key=="monsterLastIndex" then return 2000 end
 if key=="monsterName" then return ({[609]=mode=="wrong_target" and "Other" or "Deer",[487]="Winter Wolf",[2000]="WB Ranged Carrier"})[id] end
 if key=="weaponName" then if id==(mode=="shared" and 4 or 1200) then return expectedName end;return nil end
 if key=="monsterHp" then return id==487 and 13 or 6 end
 if key=="monsterAttackType" then return attr==0 and 2 or nil end
 if key=="monsterAttackWeapon" then return mode=="relinked" and 4 or 1200 end
 if key=="monsterAttackValue" then return 12 end
 if key=="weapon" then return weapon[attr] end
 if key=="unitMonster" then return id==1 and 2000 or id==4 and 487 or 609 end
 if key=="unitOwner" then return id==1 and 0 or mode=="wrong_owner" and 0 or 24 end
 if key=="unitHp" then return hp[id] end
 if key=="unitBattleX" or key=="unitBattleY" then
  if mode=="missing_position" or not field or hp[id]<=0 then return nil end
  if mode=="bad_position" then return -1 end
  return key=="unitBattleX" and (fights>0 and 16 or 18) or 6+id
 end
 if key=="mouseButtons" then return mouse end
 if key=="uiPointerX" then return pointerX end
 if key=="uiPointerY" then return pointerY end
 error("Unexpected getter "..key)
end
function coe5.set(key,value)assert(key=="mouseButtons","Forbidden shared/weapon write");mouse=value end
function coe5.lookName(id)return id==65 and "Fireball (fly)" or id==68 and "Flame" or nil end
function coe5.unitColdResistance(id)return id==4 and 100 or 0 end
function coe5.wrap(key,fn)hooks[key]=fn;return true end
function coe5.addMainMenuButton(_,fn)enter=fn end
function coe5.readIni(file)
 if file=="workbench-session" then return {session=context} end
 return mode=="existing" and {meta={protected=1}} or nil
end
function coe5.writeIni(_,data)writes=writes+1;if mode=="save_failure" then return false end;receipt=clone(data);return true end
function coe5.log(_)end
function coe5.showMessageBox(_,text)notice=text end
function coe5.ui.drawRect(...)rects[#rects+1]={...} end
function coe5.ui.drawText(...)end
local function click(which)
 mouse=0;hooks.BATTLE_WAIT(function()return 0 end)
 local r=rects[which=="cast" and 2 or 3];pointerX,pointerY=r[1]+4,r[2]+4
 mouse=1;hooks.BATTLE_WAIT(function()return 0 end)
 mouse=0;hooks.BATTLE_WAIT(function()return 0 end)
end
function coe5.openTestField(spec)
 opens=opens+1;assert(spec.commander==2000 and spec.spell==-1 and spec.standIn==-1 and #spec.enemies==2 and spec.enemies[1][1]==609 and spec.enemies[1][2]==2 and spec.enemies[2][1]==487)
 if mode=="refused" then return false end
 field,player=true,0
 if mode=="open_error" then error("allocation callback error") end
 if mode=="missing_array" then return true end
 return true,{commander=1,friends={},enemies=mode=="partial" and {2,3} or mode=="duplicate" and {2,2,4} or {2,3,4}}
end
function coe5.drawTestField()
 if mode=="draw_error" then error("draw error") end
 rects={};hooks.BATTLE_DRAW(function()end);frames=frames+1
 click(mode=="cancel" and "close" or frames<=2 and "cast" or "close")
 assert(frames<5,"One-shot control did not close")
end
function coe5.fightTestField()
 fights=fights+1
 if mode=="fight_error" then error("fight error") end
 hp[2]=3
 if mode=="stop" then rects={};hooks.BATTLE_DRAW(function()end);click("close") end
end
function coe5.stopTestFight()stops=stops+1 end
function coe5.closeTestField()
 closes=closes+1
 if mode=="close_error" then error("close failed") end
 field,player=false,mode=="menu_mismatch" and 0 or -1
 for id=1,4 do hp[id]=0 end
end
