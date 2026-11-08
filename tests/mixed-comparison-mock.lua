local enter,message,result,screen,title,cleanupSaved
local opens,closes,fights,writes=0,0,0,0
local field,restored=false,true
local original={flymode=1,flylook=7,look=68,range=5,aoe=0,init=5,dmgtype=3,dmg=0}
local live={};for k,v in pairs(original) do live[k]=v end
local native={[239]={flymode=1,flylook=7},[319]={flymode=2,flylook=197},[53]={look=68},[460]={look=49}}
local moves={6,5,2,1,1197,3,1,1049,4,5,9}
local c={id=string.rep("a",32),run=string.rep("b",32),revision=string.rep("c",64),schema="wb-session-1",mod=expectedMod}
local math={min=function(a,b) return a<b and a or b end,max=function(a,b) return a>b and a or b end,ceil=function(a) return -((-a)//1) end}
coe5={ui={}}
function coe5.get(k,id,attr)
 if k=="activePlayer" then return -1 end
 if k=="screenW" or k=="screenH" then return 640 end
 if k=="monsterLastIndex" then return 2000 end
 if k=="weaponName" and id==(mode=="shared" and 4 or 1200) then return expectedName end
 if k=="monsterName" then return ({[609]="Deer",[487]=mode=="wrong_target" and "Other" or "Winter Wolf",[2000]="WB Ranged Carrier"})[id] end
 if k=="monsterHp" then return 13 end
 if k=="unitOwner" then return mode=="wrong_owner" and 0 or 24 end
 if k=="unitMonster" then return id==4 and 487 or 609 end
 if k=="unitHp" then return id==4 and 13 or 6 end
 if k=="monsterAttackType" then return attr==0 and 2 or nil end
 if k=="monsterAttackWeapon" then return mode=="relinked" and writes>0 and 4 or 1200 end
 if k=="monsterAttackValue" then return 8 end
 if k=="weapon" then return id==1200 and live[attr] or (native[id] or {})[attr] end
end
function coe5.lookName(id) return ({[68]="Flame",[197]="Torrent of Water (fly)",[49]="Acid Splash"})[id] end
function coe5.set(k,id,attr,v)
 assert(k=="weapon" and id==1200 and not field and (attr=="look" or attr=="flymode" or attr=="flylook"))
 writes=writes+1;if mode=="partial_write" and attr=="look" and v==49 then return end
 live[attr]=v
end
function coe5.readIni(key) if key=="workbench-session" then return {session=c} end;return mode=="existing" and {meta={}} or nil end
function coe5.writeIni(key,data)
 assert(not field and opens==closes)
 if key=="wb-cleanup-"..c.run then cleanupSaved=true;return true end
 if mode=="savefail" then return false end
 -- INI is a snapshot, not a reference to the helper's mutable table.
 result={meta={count=data.meta.count,schema=data.meta.schema}}
 for i=1,data.meta.count do result["sample"..i]={};for k,v in pairs(data["sample"..i])do result["sample"..i][k]=v end end
 return true
end
function coe5.withTestFieldRoster(carrier,roster,callback)
 assert(not field and carrier==2000 and #roster==2 and roster[1].monster==609 and roster[1].count==2 and roster[2].monster==487 and roster[2].count==1)
 if mode=="refused" and fights==1 then return false,"allocation refused" end
 field=true;restored=false;opens=opens+1
 local units={{unit=2,monster=609},{unit=3,monster=609},{unit=4,monster=487}}
 if mode=="partial_roster" and opens>1 then table.remove(units) end
 if mode=="duplicate" and opens>1 then units[2].unit=2 end
 local ok,why=pcall(callback,units)
 field=false;restored=not(mode=="cleanup_failure" and opens>1);closes=closes+1
 return ok and restored,why
end
function coe5.testFieldRosterStatus() return {version=1,open=field,restored=restored} end
function coe5.fightTestField() assert(field);fights=fights+1;if mode=="interrupted" and fights==2 then error("battle interrupted") end end
function coe5.addMainMenuButton(_,fn) enter=fn end
function coe5.log() end
function coe5.showMessageBox(_,why) message=why end
function coe5.ui.screenBegin(text) title=text;screen={} end
function coe5.ui.text(id,text) screen[id]=text end
function coe5.ui.wait() local action=assert(table.remove(moves,1),"missing action");assert(screen[action],"missing displayed action");return action end
function coe5.ui.nameBox() return title:find("Particle") and "#197" or "#49" end
for _,k in ipairs({"sectionBegin","sectionEnd","buttonRow","bindEscape"})do coe5.ui[k]=function()end end
