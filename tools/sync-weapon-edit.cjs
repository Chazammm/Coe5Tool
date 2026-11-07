'use strict';
// Development only: synchronize the embedded Lua with its browser-safe string module.
const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
const file=path.join(root,'weapon-edit-fixture.js'),before=fs.readFileSync(file,'utf8');
let after=before;
for(const [key,name]of [['template','WeaponEditFixture.lua'],['fixedTemplate','TestFixture.lua'],['dockTemplate','TestDock.lua']]){
 const template=fs.readFileSync(path.join(root,'desktop',name),'utf8').replace(/\r\n/g,'\n'),pattern=new RegExp('^  const '+key+'=.+;$','m');
 if(!pattern.test(after))throw new Error('Template module shape changed; review it before synchronizing.');
 after=after.replace(pattern,()=> '  const '+key+'='+JSON.stringify(template)+';');
}
if(process.argv.includes('--check')){if(before!==after)throw new Error('Lua template is out of sync. Run node tools/sync-weapon-edit.cjs.');}
else fs.writeFileSync(file,after);
