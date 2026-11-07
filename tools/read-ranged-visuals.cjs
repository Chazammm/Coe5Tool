// Print a metadata-only snapshot from the pinned Windows executable. Never writes to the game.
const fs = require('node:fs');
const {createHash} = require('node:crypto');
const documented = require('../choices').documented();
const image = fs.readFileSync(process.argv[2]);
const sha256 = createHash('sha256').update(image).digest('hex');
if (sha256 !== '489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55') throw Error('Requires the verified Windows CoE5 5.43 executable.');
const pe = image.readUInt32LE(0x3c);
const imageBase = Number(image.readBigUInt64LE(pe+48));
const sections = pe + 24 + image.readUInt16LE(pe+20);
function offset(rva, length) {
  for(let i=0;i<image.readUInt16LE(pe+6);i++){
    const section=sections+i*40, delta=rva-image.readUInt32LE(section+12);
    if(delta>=0 && delta+length<=image.readUInt32LE(section+16)) return delta+image.readUInt32LE(section+20);
  }
  throw Error('Unbacked table entry');
}
const effects={}, sprites={}, uses={sprite:{},particle:{},impact:{}};
for(let id=0;id<300;id++){
  const ptr=Number(image.readBigUInt64LE(offset(0x1b1dfc0+id*0x30,8)));
  if(!ptr)continue;
  const start=offset(ptr-imageBase,1), end=image.indexOf(0,start);
  if(end<start || end-start>160)throw Error('Unexpected effect name');
  const name=image.toString('utf8',start,end);
  if(name)effects[id]=name;
}
for(const row of documented.filter(r=>r.type==='projectile')) sprites[row.id]=row.name;
for(let weapon=0;weapon<1200;weapon++){
  const at=offset(0x5700790+weapon*0xa0,0xa0);
  if(!image[at])continue;
  const mode=image.readInt32LE(at+0x68), flight=image.readInt32LE(at+0x6c), impact=image.readInt32LE(at+0x74);
  if(mode===1&&flight>=0)uses.sprite[flight]??=weapon;
  if(mode===2&&flight>=0)uses.particle[flight]??=weapon;
  if(impact>=0)uses.impact[impact]??=weapon;
}
const groups={sprite:{},particle:{},impact:{}};
function include(group,id,name) {
  groups[group][id]={name,witness:uses[group][id]??null};
}
for(const id of new Set([...Object.keys(sprites),...Object.keys(uses.sprite)])){
  include('sprite',id,sprites[id]??null);
}
for(const [id,name] of Object.entries(effects)){
  if(name==='...' || name.toLowerCase()==='none')continue;
  // Role suffixes come from the pinned look-name table. A native same-field use can
  // justify a cross-role choice (e.g. Flame (line) #66 on a mode-2 weapon).
  if(Object.hasOwn(uses.particle,id)||name.endsWith('(fly)'))include('particle',id,name);
  if(Object.hasOwn(uses.impact,id)||!name.endsWith(')'))include('impact',id,name);
}
process.stdout.write(JSON.stringify({sha256,slots:300,namedSlots:Object.keys(effects).length,groups},null,2)+'\n');
