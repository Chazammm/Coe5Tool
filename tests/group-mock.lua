-- Extends either standalone API mock with distinct living defenders.
local nativeGet, nativeOpen=coe5.get,coe5.openTestField
local groupOpen,groupFights,groupCloses=0,0,0
local nativeClose=coe5.closeTestField
function coe5.openTestField(carrier,spell,target,count)
  assert(count==expectedCount and count>1 and target==expectedTargetId)
  groupOpen=groupOpen+1
  return nativeOpen(carrier,spell,target,1)
end
function coe5.closeTestField() groupCloses=groupCloses+1;return nativeClose() end
local function firstUnit() return 71+(groupOpen-1)*250 end
function coe5.squareUnits(x,y)
  assert(x==1 and y==1)
  local list={42}
  local n=expectedCount+(mode=="short" and -1 or mode=="extra" and 1 or 0)
  for i=1,n do list[#list+1]=firstUnit()+i-1 end
  if mode=="duplicate" then list[#list]=list[2] end
  return list
end
function coe5.get(key,id,attr)
  if key=="unitOwner" then
    if id==42 then return 0 end
    return mode=="wrong_owner" and id==firstUnit() and 9 or 24
  end
  if key=="unitMonster" and id>=firstUnit() then return mode=="foreign" and id==firstUnit() and 487 or expectedTargetId end
  return nativeGet(key,id,attr)
end
function coe5.unitColdResistance(id)
  assert(id>=firstUnit() and id<firstUnit()+expectedCount+1)
  if id==firstUnit()+2 then error("Getter unavailable for this member") end
  return id==firstUnit()+1 and -25 or 0
end
function coe5.fightTestField()
  assert(mode=="success" and groupOpen==groupCloses+1)
  groupFights=groupFights+1
end
