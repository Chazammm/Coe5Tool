/* New-definition generation, separate from the conservative existing-source parser. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./core.js'),require('./weapon-edit-fixture.js'),require('./damage-types.js'));else root.CoeCreation=factory(root.CoeWorkbench,root.CoeWeaponEdit,root.CoeDamage);})(typeof globalThis!=='undefined'?globalThis:this,function(core,weaponEdit,damage){
  'use strict';
  const version='0.17.0',eol='\r\n';
  const pin='https://github.com/musical-pianist/coe5se/blob/9e22d27c32ee15392fc370027d00dbc750b5d19b/';
  const optional=['look','sound','flymode','flylook','flysound'];
  function name(value,label,max){
    if(typeof value!=='string'||!value.length||value.trim()!==value||value.length>max||/[^\x20-\x7e]|["#\\]/.test(value))throw new Error(label+': use 1–'+max+' printable ASCII characters, without quotes, #, backslash or surrounding spaces.');
    return value;
  }
  function number(value,label,min,max){
    if(typeof value!=='string'||/[\r\n]/.test(value)||!/^[-]?\d+$/.test(value)||BigInt(value)<BigInt(min)||BigInt(value)>BigInt(max))throw new Error(label+': enter an integer from '+min+' to '+max+'.');
    return value; // Retain the entered token; never round through Number.
  }
  function validateWeapon(input){
    const s={weaponName:name(input.weaponName,'Weapon name',63)};
    s.dmg=damage.payload(input.dmgtype,input.dmg,input.manualDamage===true);
    for(const key of ['range','init'])s[key]=number(input[key],key==='range'?'Range':'Initiative',1,2147483647);
    s.aoe=number(input.aoe,'Area / targeting code',0,200);
    s.dmgtype=String(Number(input.dmgtype));if(input.manualDamage===true)s.manualDamage=true;
    for(const key of optional){s[key]=input[key]??'';if(s[key]!=='')number(s[key],key,key==='flymode'?1:key==='flysound'?-1:0,key==='flymode'?9:2147483647);}
    // -1 is documented for launch sound only. It is handled explicitly, not by a permissive numeric parser.
    if((s.flymode==='')!==(s.flylook===''))throw new Error('Supply both Flight mode and Flight look/sprite, or leave both blank.');
    return s;
  }
  function validate(input){
    const s=validateWeapon(input);
    return {spellName:name(input.spellName,'Spell name',47),...s,path:number(input.path,'Built-in path',1,69),level:number(input.level,'Spell level',1,3),weaponDamage:damage.payload(input.dmgtype,input.weaponDamage,input.manualDamage===true)};
  }
  function weaponDefinition(input){
    const s=validateWeapon(input);
    const lines=['# Native weapon definition fragment; not an installable mod.','# Supported syntax subset only. Gameplay, assets and enabled-mod capacity are unverified.',
      'newweapon "'+s.weaponName+'"',...['range','init','dmgtype','dmg','aoe'].map(k=>k+' '+s[k]),...optional.filter(k=>s[k]!=='').map(k=>k+' '+s[k])];
    return {text:lines.join(eol)+eol,mode:'c5m',spec:s,kind:'native-weapon'};
  }
  function format(mode){if(!['c5m','c5se'].includes(mode))throw new Error('Choose .c5m or .c5se output.');return mode==='c5m'?'#!@':'';}
  function definition(input,mode,fragment=true){
    const s=validate(input),prefix=format(mode);
    const lines=[fragment?'# Definition fragment; not an installable mod.':'# Generated definitions in an experimental test mod.', '# CoE5SE required. Not tested in game.',
      'newweapon "'+s.weaponName+'"',...['range','init','dmgtype','dmg','aoe'].map(k=>k+' '+s[k]),...optional.filter(k=>s[k]!=='').map(k=>k+' '+s[k]),'',
      prefix+'newspell "'+s.spellName+'"',prefix+'path '+s.path,prefix+'level '+s.level,prefix+'weapon '+s.weaponDamage+' "'+s.weaponName+'"'];
    return {text:lines.join(eol)+eol,mode,spec:s};
  }
  function fromDraft(text,mode){
    const m=core.inspect(text,mode),[w,s]=m.blocks;
    if(m.blocks.length!==2||w.opener!=='newweapon'||s.opener!=='newspell')throw new Error('This field needs a linked generated spell + weapon. For a standalone weapon, open a generated native .c5m and use its eligible melee or ranged carrier test. Other source can be edited and exported.');
    const spec={weaponName:w.name,spellName:s.name};
    for(const field of w.fields)spec[field.key]=field.value;
    for(const field of s.fields)if(field.key!=='weaponRef')spec[field.key]=field.value;
    const ref=s.fields.find(f=>f.key==='weaponRef');
    if(ref?.value!=='"'+w.name+'"')throw new Error('The test must use the new associated weapon by name. Restore that Weapon reference and Apply.');
    const why=damage.testReason(spec);if(why)throw new Error(why);
    const canonical=definition(spec,mode);
    if(canonical.text!==text)throw new Error('This draft is outside the generated-pair test subset. Export it as a fragment for manual integration.');
    return canonical.spec;
  }
  function fromSource(text,mode,id){
    const model=core.inspect(text,mode),spell=model.blocks[id];
    if(!spell||spell.type!=='spell'||spell.opener!=='newspell'||!spell.headerSafe)
      throw Error('Select a plain CoE5SE newspell: #!@ lines in .c5m, or unprefixed lines in .c5se. Native spellcasting commands are not new spell definitions.');
    const unique=(type,value)=>model.blocks.filter(b=>b.type===type&&b.name.toLowerCase()===value.toLowerCase());
    if(unique('spell',spell.name).length!==1)throw Error('This spell name appears more than once. Resolve its duplicate sections before testing.');
    // An included file or external mod can change either record or its name resolution.
    const dependency=model.lines.find(l=>!l.empty&&(l.word==='include'||l.word==='requires'&&(l.tokens.length!==1||l.tokens[0].value!=='CoE5SE')));
    if(dependency)throw Error('Line '+dependency.number+': '+dependency.word+' needs dependency/load-order review. This two-definition test does not load includes or other mods. Edit/export preserves them.');
    if(model.blocks.some(b=>b.opener==='selectweapon'&&!b.header.tokens[0]?.quoted))throw Error('A numeric selectweapon has unresolved record ownership. Resolve that override before preparing a definition-only spell test.');
    function fields(block,allowed,required,prefixed){
      const boundary=model.lines.find(l=>l.start===block.end);
      if(boundary&&!/^(new|select)/.test(boundary.word)&&!['playerevent','squareevent'].includes(boundary.word))
        throw Error('Line '+boundary.number+': '+boundary.word+' splits '+block.name+'. Move/review this boundary and its following commands before testing; no detached tail is copied.');
      if(block.opaque)throw Error(block.name+' contains an unsupported or malformed line. No active command can be omitted to make a test.');
      const extra=block.entries.find(e=>!allowed.includes(e.word)||e.formUnsafe||e.marked!==prefixed);
      if(extra)throw Error('Line '+extra.number+': '+extra.word+' or its prefix needs a dedicated fixture. No flags, chains or extra commands are dropped.');
      const values={};
      for(const f of block.fields){
        if(f.line===undefined){if(required.includes(f.key))throw Error('Declare '+f.key+' explicitly in '+block.name+' before testing; no default is guessed.');continue;}
        if(!f.editable||core.validateValue(f,f.value))throw Error(block.name+': '+f.label+' is repeated, ambiguous or outside the supported source syntax.');
        values[f.key]=f.value;
      }
      return values;
    }
    const sf=fields(spell,['path','level','weapon'],['path','level','weaponDamage','weaponRef'],mode==='c5m');
    const ref=spell.fields.find(f=>f.key==='weaponRef');
    if(!ref.token.quoted)throw Error('A numeric weapon reference cannot be copied safely. Select an explicit quoted local newweapon; native/external records need a different fixture.');
    const weapons=unique('weapon',ref.token.value);
    if(weapons.length!==1)throw Error(weapons.length?'The linked weapon name has duplicate/override sections. Resolve them before testing.':'The linked weapon is not defined in this source. Open its dependency for inspection; this test cannot guess a native or external record.');
    const weapon=weapons[0];
    if(weapon.name!==ref.token.value||weapon.opener!=='newweapon'||!weapon.headerSafe||weapon.header.marked||weapon.start>spell.start)
      throw Error('The spell needs one earlier, plain newweapon with the exact quoted name. Selected/inherited records and later declarations are not copied.');
    const wf=fields(weapon,['range','init','dmgtype','dmg','aoe',...optional],['range','init','dmgtype','dmg','aoe'],false);
    if(!/^\d+$/.test(sf.path)||BigInt(sf.path)<1n||BigInt(sf.path)>69n)throw Error('This test needs an explicit built-in path ID 1–69. Named/custom paths require dependency resolution; no ID is guessed.');
    const spec={spellName:spell.name,weaponName:weapon.name,...wf,...sf};delete spec.weaponRef;
    const why=damage.testReason(spec);if(why)throw Error(why);
    const canonical=definition(spec,mode);fromDraft(canonical.text,mode);
    const otherSpellUsers=model.blocks.filter(b=>b.type==='spell'&&b.id!==spell.id&&b.matches.includes(weapon.id)).map(b=>({name:b.name,line:b.header.number}));
    try{fromDraft(text,mode);return {text,mode,spec:canonical.spec,adapted:false,otherSpellUsers};}catch{}
    return {...canonical,adapted:true,sourceLine:spell.header.number,weaponLine:weapon.header.number,otherSpellUsers};
  }
  function testOptions(input){
    if(typeof input.modId!=='string'||/[\r\n]/.test(input.modId)||!/^[A-Za-z][A-Za-z0-9_]{0,31}$/.test(input.modId)||/^(coe5se|con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(input.modId))throw new Error('Test mod ID: use 1–32 letters, digits or underscores, starting with a letter; CoE5SE and Windows device names are reserved.');
    if(input.weaponEditing!==undefined&&typeof input.weaponEditing!=='boolean')throw new Error('Weapon editing must be an explicit checkbox choice.');
    const ids={};for(const key of ['casterId','enemyId'])if(input[key]!==undefined&&input[key]!==''){
      if(typeof input[key]!=='string'||!/^\d+$/.test(input[key]))throw new Error(key+': enter an unsigned numeric ID or leave blank.');
      ids[key]=number(input[key],key,0,6998);
    }
    return {modId:input.modId,caster:name(input.caster,'Caster monster name',63),enemy:name(input.enemy,'Target monster name',63),count:number(input.count,'Target count',1,200),...(input.weaponEditing?{weaponEditing:true}:{}),...ids};
  }
  function luaFixture(s,o){ return weaponEdit.renderFixed(s,o); }
  function testPackage(source,mode,options){
    const s=fromDraft(source,mode),o=testOptions(options),body=definition(s,mode,false).text;
    const header='icon "banner.tga"'+eol+'description "Experimental workbench test. Requires CoE5SE 2.13.0; not game-verified."'+eol+'needs_script_extender'+eol+'requires CoE5SE'+eol+eol;
    const files=[{name:o.modId+'.c5m',text:header+(mode==='c5m'?body:'')}];
    if(mode==='c5se')files.push({name:o.modId+'.c5se',text:body});
    files.push({name:o.modId+'.lua',text:o.weaponEditing?weaponEdit.render(s,o,mode):luaFixture(s,o)});
    const manifest={workbenchVersion:version,kind:'experimental-test-mod',gameTested:false,sourceMode:mode,dependencies:['Conquest of Elysium 5 build supported by CoE5SE 2.13.0','CoE5SE 2.13.0 with required test-field/UI hooks'],sourcePin:pin,definitions:s,test:o};
    if(o.weaponEditing)manifest.experiment='weapon-edit-v4';
    files.push({name:'manifest.json',text:JSON.stringify(manifest,null,2)+eol});
    files.push({name:'README.txt',text:[
      'EXPERIMENTAL WORKBENCH TEST MOD — NOT GAME-VERIFIED',o.modId+' / Workbench '+version,'',
      'FILES: '+files.map(f=>f.name).join(', ')+', README.txt, banner.tga (original flat 256x64 label, not a VFX asset).',
      'DEPENDENCIES: '+manifest.dependencies.join('; ')+'. Neither game nor extender is bundled.',
      'The needs_script_extender guard prevents this package being treated as a vanilla mod. requires CoE5SE orders enabled scripts; it does not enable or install the dependency.',
      '', 'MANUAL SETUP',
      'Use a dedicated disposable CoE5 test profile with CoE5SE installed by its official instructions. Do not use campaign saves.',
      'From that profile, open the mods directory using the game main menu. Extract this ZIP there: it creates '+o.modId+'/'+o.modId+'.c5m. Keep the folder and file names unchanged.',
      'Enable only CoE5SE and '+o.modId+'. Return to the main menu; restart manually if the new button is absent. Do not start or load a game.',
      'Click "WB test: '+o.modId+'". It resolves the spell and weapon by unique names, checks loaded spell fields, and finds caster "'+o.caster+'" and target "'+o.enemy+'" at runtime.',
      'Click Cast once in the field, then Close test when done. Reopen to create fresh targets; repeated casts can kill targets. Mouse controls are provided; no keyboard shortcut is registered.',
      'The compact dock uses the current screenW/screenH UI coordinates, y up from the bottom. It sits near bottom center beside a reserved 300-UI-unit left log lane. Narrow windows move it to upper right; fixed tests also offer Move. Status details open separately, not across the log.',
      'Field controls need at least 384x280 UI units; the experiment Effects menus need 640x480 UI units. These are UI units, not window pixels. A too-small field viewport closes the owned field and reports the problem. Exact text/log clearance still needs user-operated visual acceptance.',
      '', 'SCOPE AND BLOCKERS',
      'This is a complete source-based test-mod candidate, not a verified runnable release. The game was not launched to validate loading, hooks, rendering, restoration or these UI controls.',
      'On an unsupported game build, or missing/ambiguous names or hooks, stop and inspect coe5mod.log; do not force a mismatched extender build. Use the supported 5.43 / 2.13.0 pair; restart the isolated session after definition changes.',
      'Only the explicit spell and associated weapon definitions are loaded. Other source definitions, includes, dependency mods and later overrides are not tested. The full mod stays separate.',
      'The field forces the test spell as an item-style attack, extending some weapon ranges to 30. Observe impact/projectile/sound and immediate target damage in that environment only.',
      'It does not validate ordinary spellcasting, path/level eligibility, learning, AI choices, fatigue, true range, initiative, normal AoE targeting, saves or mod compatibility. Use separate fresh-game combat tests for those.',
      'Numeric effect/sound values are metadata until actually tested. No desktop VFX preview is provided. Custom path declarations, flags, chains, special damage masks and full current-game catalog validation are outside this generator.',
      ...(o.weaponEditing?['','WEAPON EDITING EXPERIMENT — NOT GAME-VERIFIED',
        'The canonical test mod owns the associated newweapon. It is the scratch record; no built-in weapon or standIn is used.',
        'Type cycles documented scalar types 1-10. Masks and animate keep their prepared type/payload fixed; reprepare to change meaning. Area cycles 0 / 1 / 5, plus the prepared baseline if different. Click a setting, then Apply; accepted values are read back.',
        'Cast once is blocked while settings are pending or loaded values differ. Reset targets closes/reopens only this helper\'s field and retains applied parameters.',
        'Effects opens pending impact look and flight mode/look pickers. Effect IDs 0-299 come from the loaded table; search partial names or #ID, or browse pages. Unnamed rows are labeled, not given invented names. No appearance is guaranteed.',
        'New flight settings use mode 2-9 plus an effect-table ID. Mode 1 uses sprites; its original pair can be kept/restored, not edited through the effect picker. Changing from sprite/default mode requires an explicit new flight effect selection before Apply.',
        'Apply writes/reads all five supported fields (dmgtype, aoe, look, flymode, flylook). Cast is blocked while any are pending or changed outside the helper. Sound settings are not changed.',
        'Close test attempts all five original weapon values with readback, including cleanup after partial writes. Failures are reported; quit the disposable session if restoration is uncertain.',
        'The dock has -/+ collapse/expand. Effects also offers Dock placement to upper right if a longer battle log needs more space. Tap status for full applied/pending values. Resize ignores stale held-click hitboxes until a fresh draw/release.',
        'The source snapshot/session revision stays fixed. Parameter revisions record session-only actions. wb_weapon_edit logs require Enable copious logs; they are not guaranteed by default.',
        'Save test values explicitly writes up to 32 read-back snapshots in this mod\'s isolated coe5se_data area when launched by the desktop host. Pending controls are excluded. Cast counts mean completed API calls, not visual observation.',
        'After Save, Close test and Quit, refresh status and Review saved test values, or use Saved test values beside the source draft. Choose a snapshot and selected fields, then Apply selected to draft and Export copy to a new file. Newer conflicts require explicit Replace. Flight mode/look return together. Missing optional visuals can be added only to an unambiguous plain newweapon with explicit selection; unsupported insertion stays manual. Other pending edits remain untouched and must be resolved before export. No live synchronization or automatic export occurs.',
        'Return changes the uniquely matched weapon, not the spell payload or path/level. Other spells sharing that weapon also reference its changed values. Association is by exact names and source interpretation, not a full-mod identity guarantee; inspect the session/source before applying.',
        'If the fixed launch context or data-file APIs are absent (for example a manually installed ZIP), Save reports the problem; use the labeled manual return. The field remains usable without importing anything.',
        'Optional WB choices: '+o.modId+' on the main menu explicitly exports loaded unit, weapon, spell and effect table metadata. Quit, then Browse choices and load that session. This is not a VFX preview. One enemy type plus count only; no mixed groups or waves.',
        'Spell damage/path/level, sound, timing, AI and saves are not edited or validated. Numeric visual choices still require observation; damage type does not choose a matching visual.',
        'No full Fight, arbitrary input, disk reload, clipboard export or mod-saving action is provided. Exit the disposable game if cleanup reports an error.',
        'This independently implemented experiment is inspired by musical_pianist\'s WeaponTester workflow; none of its supplied code, assets or UI text is included.'
      ]:[]),
      '', 'REMOVAL',
      'Close the field, disable '+o.modId+' in Mods, exit the test game process, and remove only the newly extracted '+o.modId+' folder from the disposable profile. Keep your exported fragment separately. Do not reuse saves with changed spell order.',
      '', 'SOURCES',pin+'coe5.lua',pin+'src/lua_test_battle.h',pin+'src/sidecar.h','https://www.illwinter.com/coe5/coe5modding.html'
    ].join(eol)+eol});
    return {modId:o.modId,files,manifest};
  }
  return {definition,weaponDefinition,validateWeapon,fromDraft,fromSource,testPackage,testOptions,validate,version};
});
