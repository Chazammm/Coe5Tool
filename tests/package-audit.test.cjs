const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {verify}=require('../tools/verify-package.cjs');
function fixture(t){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'wb-package-audit-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const exe=Buffer.alloc(132);exe.writeUInt32LE(64,0x3c);exe.writeUInt16LE(0x8664,68);
 const entries={'START-HERE.html':'Portable setup','licenses/DotNet10-LICENSE.txt':'Runtime terms','licenses/DotNet10-THIRD-PARTY-NOTICES.txt':'Notices','licenses/WindowsDesktop10-LICENSE.txt':'Desktop terms','CoE5Workbench.exe':exe,'examples/selected-spell-workshop.c5m':'# disposable test example','examples/mixed-comparison-workshop.c5m':'# disposable native comparison example','ui/vanilla-library.js':'/* test fixture */','ui/docs/USER-GUIDE-018.md':'Test guide','ui/prepared-sessions-ui.js':'/* test fixture */'};
 function put(name,value){const p=path.join(dir,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,value);}
 function inventory(){const files=Object.keys(entries).map(name=>({path:name,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,name))).digest('hex')}));put('PACKAGE-CONTENTS.json',JSON.stringify({version:require('../package.json').version,architecture:'win-x64',frameworkDependent:false,singleFile:true,dotnetRuntime:'10.0.15',files}));}
 for(const [name,value] of Object.entries(entries))put(name,value);inventory();
 return {dir,entries,put,inventory,check:()=>verify(dir,path.join(dir,'CoE5Workbench.exe'))};
}
test('package audit accepts a complete synthetic inventory and rejects changed content',t=>{const f=fixture(t);assert.equal(f.check().passed,true);f.put('ui/vanilla-library.js','changed');assert.throws(f.check,/Missing\/changed inventory/);});
test('package audit rejects unlisted cache and session files',t=>{const f=fixture(t);f.put('.workbench-profile/cache','private');assert.throws(f.check,/Unlisted file/);});
test('package audit rejects inventoried personal paths and session data',t=>{const f=fixture(t);f.entries['session.json']='{}';f.put('session.json','{}');f.inventory();assert.throws(f.check,/Private\/session path/);});
test('package audit rejects per-machine paths even when inventoried',t=>{const f=fixture(t);f.put('ui/docs/USER-GUIDE-018.md','C:\\Users\\Someone\\private');f.inventory();assert.throws(f.check,/Per-machine path/);});
test('package audit rejects game executables even when inventoried',t=>{const f=fixture(t);f.entries['CoE5.exe']='not a real executable';f.put('CoE5.exe',f.entries['CoE5.exe']);f.inventory();assert.throws(f.check,/Unexpected executable|Game\/official extender/);});
test('package audit rejects a derived extender plugin or native core source in the distribution',t=>{const f=fixture(t);f.entries['roster-runtime/coe5se.c5plugin.dll']='inert fixture';f.put('roster-runtime/coe5se.c5plugin.dll',f.entries['roster-runtime/coe5se.c5plugin.dll']);f.inventory();assert.throws(f.check,/Unexpected executable/);});

test('package audit rejects vendored native source even when inventoried',t=>{const f=fixture(t);f.entries['src/engine.h']='inert fixture';f.put('src/engine.h','inert fixture');f.inventory();assert.throws(f.check,/Native source/);});
test('package audit rejects inventory traversal and wrong architecture',t=>{const f=fixture(t),file=path.join(f.dir,'PACKAGE-CONTENTS.json'),m=JSON.parse(fs.readFileSync(file));m.files[0].path='../escape';fs.writeFileSync(file,JSON.stringify(m));assert.throws(f.check,/Invalid inventory path/);f.inventory();const exe=fs.readFileSync(path.join(f.dir,'CoE5Workbench.exe'));exe.writeUInt16LE(0x14c,68);f.put('CoE5Workbench.exe',exe);f.inventory();assert.throws(f.check,/Expected x64/);});
