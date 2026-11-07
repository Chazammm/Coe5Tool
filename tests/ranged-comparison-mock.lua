-- The harness supplies mode, expectedMod and expectedName, and a sprite 7 / impact 68 fixture.
local entry, title, message, saved
local opens, fights, closes, writes = 0,0,0,0
local field = false
-- The small pinned test VM omits the math library available in the real game.
local math = {min=function(a,b) if a<b then return a end;return b end}
local record = {flymode=1,flylook=7,look=68,range=5,aoe=0,init=5,dmgtype=3,dmg=0}
local actions = {5,2,1097,3,1034,4,5,9}
local c = {id=string.rep("a",32),run=string.rep("b",32),revision=string.rep("c",64),schema="wb-session-1",mod=expectedMod}
coe5={ui={}}
function coe5.get(key,id,attr)
  if key=="activePlayer" then return -1 end
  if key=="screenW" or key=="screenH" then return 640 end
  if key=="monsterLastIndex" then return 2000 end
  if key=="weaponName" and id==(mode=="shared" and 100 or 1200) then return expectedName end
  if key=="monsterName" then return id==13 and "Spearman" or id==2000 and "WB Ranged Carrier" or nil end
  if key=="monsterAttackType" then return attr==0 and 2 or nil end
  if key=="monsterAttackWeapon" then return mode=="relinked" and writes>0 and 99 or 1200 end
  if key=="monsterAttackValue" then return 8 end
  if key=="weapon" then return record[attr] end
end
function coe5.set(kind,id,key,v)
  assert(kind=="weapon" and id==1200 and not field and (key=="flymode" or key=="flylook" or key=="look"))
  writes=writes+1
  if mode=="partial" and key=="flylook" and v==97 then return end
  record[key]=v
end
function coe5.lookName(id)
  return ({[68]="Flame",[34]="Blood Burst",[97]=mode=="renamed" and "Other" or "Icy Breath (fly)"})[id]
end
function coe5.readIni(k) if k=="workbench-session" then return {session=c} end;return mode=="existing" and {meta={}} or nil end
function coe5.writeIni(k,v)
  assert(k=="wb-result-"..c.run and not field)
  if mode=="savefail" then return false end
  saved=v;return true
end
function coe5.openTestField(actor,spell,target,count)
  assert(not field and actor==2000 and spell==-1 and target==13 and count==1)
  if mode=="refused" and opens==1 then return false end
  field=true;opens=opens+1;return true
end
function coe5.fightTestField()
  assert(field);fights=fights+1
  if mode=="interrupted" and fights==2 then error("battle interrupted") end
end
function coe5.closeTestField() assert(field);field=false;closes=closes+1 end
function coe5.addMainMenuButton(_,f) entry=f end
function coe5.showMessageBox(_,why) message=why end
function coe5.log() end
function coe5.ui.screenBegin(s) title=s end
function coe5.ui.wait() return assert(table.remove(actions,1),"unexpected menu: "..title) end
for _,key in ipairs({"sectionBegin","sectionEnd","buttonRow","text","bindEscape"}) do coe5.ui[key]=function()end end
