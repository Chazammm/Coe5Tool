/* Release gate for a freshly extracted Windows folder. Read only; no game launch. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function verify(folder,archive){
 const root=fs.realpathSync(folder),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),fail=m=>{throw Error(m);};
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'PACKAGE-CONTENTS.json'),'utf8'));
 if(manifest.version!==require('../package.json').version||manifest.architecture!=='win-x64'||manifest.frameworkDependent!==true||!Array.isArray(manifest.files))fail('Package identity differs.');
 const files=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isSymbolicLink())fail('Linked package path');if(e.isDirectory())walk(p);else if(e.isFile())files.push(path.relative(root,p).replaceAll('\\','/'));else fail('Unexpected file type');}}walk(root);
 const listed=new Set();for(const f of manifest.files){if(typeof f.path!=='string'||!f.path||f.path.includes('\\')||f.path.split('/').some(p=>!p||p==='.'||p==='..')||path.isAbsolute(f.path)||listed.has(f.path.toLowerCase()))fail('Invalid inventory path');listed.add(f.path.toLowerCase());if(!files.includes(f.path)||sha(path.join(root,f.path))!==f.sha256)fail('Missing/changed inventory file: '+f.path);}
 if(files.length!==manifest.files.length+1||files.some(f=>f!=='PACKAGE-CONTENTS.json'&&!listed.has(f.toLowerCase())))fail('Unlisted file in extraction');
 const knownText=['GameRuntimeHashes.cs','RuntimeReleases.cs'].map(n=>fs.readFileSync(path.join(__dirname,'../desktop/'+n),'utf8')).join('\n'),forbidden=[...knownText.matchAll(/\["([^"]+)"\]\s*=\s*"([a-f0-9]{64})"/g)],official=new Set(forbidden.filter(m=>m[2]!==crypto.createHash('sha256').update('').digest('hex')).map(m=>m[2]));
 const allowedDlls=new Set(['CoE5Workbench.dll','Microsoft.Web.WebView2.Core.dll','Microsoft.Web.WebView2.Wpf.dll','Microsoft.Web.WebView2.WinForms.dll','WebView2Loader.dll']);
 let totalBytes=0;for(const f of files){
  if(/(^|\/)(?:\.workbench-profile|profiles?|saves?|private-data|coe5se_data|tests|\.git)(\/|$)|(?:runtime-paths|candidate|session)\.json$|(^|\/)\.env(?:\.|$)/i.test(f))fail('Private/session path: '+f);
  if(/\.exe$/i.test(f)&&f!=='CoE5Workbench.exe'||/\.dll$/i.test(f)&&!allowedDlls.has(f))fail('Unexpected executable: '+f);
  if(/\.(?:c|h|cpp|cs|o|patch)$/i.test(f))fail('Native source/build file is not part of the Windows distribution: '+f);
  if(/(?:^|\/)(?:CoE5\.exe|glu32\.dll|coe5se_loader\.dll|CoE5SE\.c5m|CoE5SE\.c5se|banner\.tga)$/i.test(f))fail('Game/official extender file: '+f);
  const p=path.join(root,f),bytes=fs.readFileSync(p);totalBytes+=bytes.length;if(official.has(sha(p)))fail('Byte-identical official game/extender file: '+f);
  for(const text of [bytes.toString('utf8'),bytes.toString('utf16le')]){
   if(/[A-Za-z]:[\\/]+Users[\\/]+|\/Users\/bende|\/home\/bende|A:[\\/]+Programme[\\/]/i.test(text))fail('Per-machine path embedded: '+f);
   if(/(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-[A-Za-z0-9]{32,})/.test(text))fail('Potential credential: '+f);
  }
 }
 if((!files.includes('examples/selected-spell-workshop.c5m')||!files.includes('examples/mixed-comparison-workshop.c5m'))||!files.includes('ui/vanilla-library.js')||!files.includes('ui/docs/USER-GUIDE-018.md')||!files.includes('ui/prepared-sessions-ui.js'))fail('Required workflow/example missing');
 const exe=fs.readFileSync(path.join(root,'CoE5Workbench.exe')),pe=exe.readUInt32LE(0x3c);if(exe.readUInt16LE(pe+4)!==0x8664)fail('Expected x64 Windows apphost');
 return {passed:true,version:manifest.version,files:files.length,inventoried:manifest.files.length,totalBytes,archiveSha256:sha(archive),frameworkDependent:true,optionalRoster:files.includes('roster-runtime/coe5se.c5plugin.dll'),officialGameOrExtenderFiles:0,privateFilesOrPaths:0,scope:'Inventory, hashes, executable allowlist, pinned optional extension, machine-path and credential scan; not a gameplay or clean-machine check.'};
}
module.exports={verify};
if(require.main===module){try{const result=verify(process.argv[2],process.argv[3]);if(process.argv[4])fs.writeFileSync(process.argv[4],JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
