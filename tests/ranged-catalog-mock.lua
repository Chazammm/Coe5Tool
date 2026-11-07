-- Replay the new private particle #197 fixture against a small live API model.
local enter,title,screen,errorText,result
local opens,closes,writes=0,0,0
local original={flymode=2,flylook=197,look=68,range=5,aoe=expectedFields.aoe,init=5,dmgtype=expectedFields.dmgtype,dmg=0}
local live={};for k,v in pairs(original) do live[k]=v end
local native={[319]={flymode=2,flylook=197},[53]={look=68},[460]={look=49},[9]={flymode=1,flylook=14}}
local moves={5,1,1,1014,3,1,1049,4,5,9}
local math={min=function(a,b) return a<b and a or b end,max=function(a,b) return a>b and a or b end,ceil=function(a) return -((-a)//1) end}
local c={id=string.rep("a",32),run=string.rep("b",32),revision=string.rep("c",64),schema="wb-session-1",mod=expectedMod}
coe5={ui={}}
function coe5.get(k,id,attr)
  if k=="activePlayer" then return -1 end
  if k=="screenW" or k=="screenH" then return 640 end
  if k=="monsterLastIndex" then return 2000 end
  if k=="weaponName" and id==(mode=="shared" and 4 or 1200) then return expectedName end
  if k=="monsterHp" then return mode=="invalid_target_hp" and 0 or 13 end
  if k=="unitOwner" then return id==71 and 24 or 0 end
  if k=="unitMonster" then return id==71 and (mode=="wrong_defender" and -1 or expectedTargetId) or 2000 end
  if k=="monsterName" then return id==expectedTargetId and expectedTargetName or id==2000 and "WB Ranged Carrier" or nil end
  if k=="monsterAttackType" then return attr==0 and 2 or nil end
  if k=="monsterAttackWeapon" then return 1200 end
  if k=="monsterAttackValue" then return 8 end
  if k=="weapon" then
    if id==1200 then return live[attr] end
    if mode=="bad_witness" and id==319 then return -1 end
    if mode=="missing_sprite" and id==9 then return nil end
    return (native[id] or {})[attr]
  end
end
function coe5.lookName(id)
  if id==197 then return mode=="renamed" and "Changed name" or "Torrent of Water (fly)" end
  if id==68 then return "Flame" end
  if id==49 and mode~="missing_impact" then return "Acid Splash" end
end
function coe5.set(k,id,attr,v)
  assert(k=="weapon" and id==1200 and opens==closes and (attr=="flymode" or attr=="flylook" or attr=="look"))
  writes=writes+1;if mode~="partial" or attr~="look" or v~=49 then live[attr]=v end
end
function coe5.readIni(key) if key=="workbench-session" then return {session=c} end end
function coe5.writeIni(key,data) assert(key=="wb-result-"..c.run and opens==closes);result=data;return true end
function coe5.openTestField(carrier,spell,target,n) assert(carrier==2000 and spell==-1 and target==expectedTargetId and n==1 and opens==closes);opens=opens+1;return true end
function coe5.squareUnits(x,y) assert(x==1 and y==1);return {42,71} end
function coe5.unitFireResistance(id) assert(id==71);return 0 end
function coe5.unitColdResistance(id) assert(id==71);return 100 end
function coe5.unitShockResistance(id) assert(id==71);return -25 end
function coe5.fightTestField() assert(opens==closes+1 and mode~="wrong_defender") end
function coe5.closeTestField() closes=closes+1 end
function coe5.log() end
function coe5.addMainMenuButton(_,fn) enter=fn end
function coe5.showMessageBox(_,why) errorText=why end
function coe5.ui.screenBegin(name) title=name;screen={} end
function coe5.ui.text(id,text) screen[id]=text end
function coe5.ui.nameBox() return title:find("Sprite") and "#14" or "acid" end
for _,k in ipairs({"sectionBegin","sectionEnd","buttonRow","bindEscape"}) do coe5.ui[k]=function()end end
function coe5.ui.wait()
  local id=assert(table.remove(moves,1))
  if id==1014 and mode=="missing_sprite" or id==1049 and mode=="missing_impact" then
    assert(not screen[id] and screen[0]=="No matches");moves={9};return 9
  end
  assert(screen[id],"No displayed option "..id.." in "..title)
  return id
end
