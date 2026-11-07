'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),core=require('../core.js');
const source='newweapon "W"\r\n  range\t6 # retained\n  dmgtype 4\r  aoe 0\r\n';
const field=(text,key,mode='c5se')=>core.inspect(text,mode).blocks[0].fields.find(f=>f.key===key);
for(const mode of ['c5m','c5se'])test(mode+': optional insertions preserve BOM, mixed newlines, indentation, comments and untouched blocks',()=>{
 const text='\uFEFF# retained\r\n'+source+'\r\nnewweapon "Other"\nlook 42\n';
 assert.equal(field(text,'look',mode).addable,true);
 const edits={flylook:'3',look:'7',dmgtype:'3',flymode:'2'},p=core.patch(text,mode,0,edits);
 assert.equal(p.text,text.replace('newweapon "W"\r\n','newweapon "W"\r\n  look 7\r\n  flymode 2\r\n  flylook 3\r\n').replace('  dmgtype 4','  dmgtype 3'));
 assert.equal(core.patch(text,mode,0,{flymode:'2',flylook:'3',look:'7',dmgtype:'3'}).text,p.text);
 assert.equal(core.patch(text,mode,0,{look:'',flymode:'',flylook:''}).text,text);
 assert.equal(field(p.text,'look',mode).editable,true);assert.equal(field(p.text,'flymode',mode).editable,true);
});
test('missing single flight partners are placed beside their existing partner, including EOF without newline',()=>{
 for(const mode of ['c5m','c5se']){
  const a=source+'  flylook 200 # keep\r\n';
  assert.equal(core.patch(a,mode,0,{flymode:'6'}).text,source+'  flymode 6\r\n  flylook 200 # keep\r\n');
  const b=source+'  flymode 1 # keep';
  assert.equal(core.patch(b,mode,0,{flylook:'1000'}).text,b+'\r\n  flylook 1000');
  assert.equal(core.patch('newweapon "W"',mode,0,{look:'3',flymode:'2',flylook:'7'}).text,'newweapon "W"\nlook 3\nflymode 2\nflylook 7');
 }
});
test('insertions reject ambiguous, selected, inherited, opaque, malformed and mixed-prefix weapon blocks',()=>{
 for(const text of [source+'copyweapon "Other"\n',source+'arrow\n',source+'unknown_later 7\n',source+'aoe 1\n',source+'range "6"\n',source.replace('newweapon','selectweapon'),source.replace('newweapon "W"','newweapon "W" extra'),source+'dmg nope\n']){
  assert.equal(field(text,'look').addable,undefined,text);assert.throws(()=>core.patch(text,'c5se',0,{look:'3'}));
 }
 for(const text of [source+'#!@sound 4\n',source.replace('newweapon "W"','#!@newweapon "W"')]){assert.equal(field(text,'look','c5m').addable,undefined);assert.throws(()=>core.patch(text,'c5m',0,{look:'3'}));}
 // A marked line in a .c5se source is an inactive comment, preserved as such.
 const inactive=source+'#!@sound 4\n';assert.equal(core.patch(inactive,'c5se',0,{look:'3'}).text,inactive.replace('newweapon "W"\r\n','newweapon "W"\r\n  look 3\r\n'));
});
test('new optional fields accept only bounded, explicit interpretations; failures are atomic',()=>{
 for(const edits of [{look:'300'},{look:'-1'},{flymode:'0',flylook:'0'},{flymode:'10',flylook:'2'},{flymode:'2',flylook:'300'},{flymode:'1',flylook:'2147483648'},{flymode:'1',flylook:'-1'},{flymode:'2'},{flylook:'7'},{flymode:'2',flylook:''}])assert.throws(()=>core.patch(source,'c5se',0,{dmgtype:'3',...edits}));
 for(const edits of [{look:'0'},{look:'299'},{flymode:'2',flylook:'0'},{flymode:'9',flylook:'299'},{flymode:'01',flylook:'2147483647'}])assert.notEqual(core.patch(source,'c5se',0,edits).text,source);
 // Existing explicit values retain the editor's broader storage-only validation.
 assert.match(core.patch(source+'look 7\n','c5se',0,{look:'300'}).text,/look 300/);
});
