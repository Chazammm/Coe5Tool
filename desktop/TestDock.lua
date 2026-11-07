-- UI coordinates, not pixels: x from left, y up from bottom. No window/settings writes.
local function workbenchDock(kind, collapsed, corner)
  local w,h=coe5.get("screenW"),coe5.get("screenH")
  if type(w)~="number" or type(h)~="number" or w~=w or h~=h or w<384 or h<280 or w>100000 or h>100000 then
    return nil,"Test controls need a UI viewport of at least 384 x 280 units. Resize the window before reopening."
  end
  local width=kind=="edit" and 360 or 248
  local height=kind=="edit" and (collapsed and 42 or 112) or 74
  local top=corner or w<300+width+12
  local x=top and w-width-12 or (w-width)/2
  if not top and x<300 then x=300 end -- Keep the observed lower-left log lane clear.
  local y=top and h-height-48 or 6 -- Leave the observed native playback strip above the dock.
  local d={x=x,y=y,width=width,height=height,top=top,screenW=w,screenH=h,buttons={}}
  local function row(items,dy)
    local at=x+8
    for _,item in ipairs(items)do d.buttons[#d.buttons+1]={item[1],at,y+dy,item[2],26};at=at+item[2]+4 end
  end
  if kind=="edit" then
    row({{"apply",50},{"cast",82},{"reset",88},{"close",78},{"collapse",30}},8)
    if not collapsed then
      row({{"type",86},{"area",70},{"effects",80},{"save",96}},40)
      d.status={"details",x+8,y+74,width-16,32}
    end
  else
    row({{"cast",90},{"close",80},{"move",54}},8)
    d.status={"details",x+8,y+42,width-16,26}
  end
  return d
end
local function workbenchSameView(d)
  return d and d.screenW==coe5.get("screenW") and d.screenH==coe5.get("screenH")
end
local function workbenchHit(box,x,y)
  return box and type(x)=="number" and type(y)=="number" and x>=box[2] and x<box[2]+box[4] and y>=box[3] and y<box[3]+box[5]
end
local function workbenchShort(text)
  text=tostring(text):gsub("[\r\n]"," ")
  return #text>30 and text:sub(1,27).."..." or text
end
