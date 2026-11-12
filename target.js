/* Dependency and coverage summary. This does not validate an entire mod. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./core.js'),require('./known-words.js'));else root.CoeTarget=factory(root.CoeWorkbench,root.CoeKnownWords);})(typeof globalThis!=='undefined'?globalThis:this,function(core,known){
  'use strict';
  const words=new Set(known),scalars=new Set(['dmg','dmgtype','range','init','aoe','look','flymode','flylook','sound','flysound','trgrank','nextdmg','sndvol','reloadsnd']);
  const flags=new Set(['arrow','an','drain','sweep','fullsweep','lob','oneshot','nostr','yellow','blue','purple','mr','easymr','hardmr']);
  const extended=new Set(['newspell','newspellpath','selectspellpath','newplane','newfaction','onlyaffects','doesntaffect','doubledmgvs','noexplode','needs_script_extender','needs_coe5se','needs_glu32.dll_and_CoE5SE_enabled_at_launch']);
  const pathForms=new Set(['spellweapon','spellweaponbonus','spellweapon50','spellweapon50s','spellweaponsingle','pathboost','newspell1','newspell2','newspell3']);
  const offsetForms=new Set(['spawnoffs','growoffs','lookslike','firstshape','secondshape','secondtmpshape','gainrit']);
  function assess(text,format){
    if(!['c5m','c5se'].includes(format))throw new Error('Choose the actual source format.');
    const groups=new Map();let context='',event=false,newWeapons=0,weaponBlocks=0;
    function note(key,kind,line,message){
      const n=groups.get(key);if(n){if(line)n.lines.add(line);n.count=n.lines.size||1;n.endLine=Math.max(line,n.endLine);return;}
      groups.set(key,{kind,severity:['unknown','format'].includes(kind)?'warning':'info',line,endLine:line,count:1,message,lines:new Set(line?[line]:[])});
    }
    const se=(line,message='CoE5SE content is present. Vanilla does not load a .c5se sidecar or #!@ lines.')=>note('dependency','extender',line,message);
    const outside=(kind,line)=>note('scope:'+kind,'coverage',line,`${kind[0].toUpperCase()+kind.slice(1)} content is retained outside the spell/weapon editor’s checks. Its syntax and dependencies are not fully assessed.`);
    const unknown=(word,line,message)=>note('unknown:'+word,'unknown',line,message||`Unknown command “${word}”; validity and provider are not established. Source is preserved.`);
    if(format==='c5se')se(0,'A .c5se sidecar requires CoE5SE, including native commands inside it. This is a dependency, not a syntax error.');
    for(const line of core.commandLines(text,format)){
      if(line.empty)continue;
      const word=line.word,args=line.tokens.map(t=>t.raw).join(' '),rule=core.coverage.info(word);
      if(line.marked)se(line.number);
      if(format==='c5m'&&!line.marked&&(word==='newspell'||rule&&!['path','weapon','corpsekind'].includes(word)))note('unprefixed-se','format',line.number,'Known CoE5SE commands appear unprefixed in .c5m. This workflow needs #!@ lines or a .c5se sidecar; source is retained without conversion. Context and arguments still need their own checks.');
      if(word==='requires'){
        if(line.marked)note('requires-prefix','unknown',line.number,'#!@requires does not declare a dependency; CoE5SE needs a plain requires line in the .c5m.');
        if(line.tokens[0]?.value==='CoE5SE')se(line.number,'Dependency/load-order line: CoE5SE is required.');
        else note('requires-other','unknown',line.number,'Dependency/load-order line: enabled dependencies and their files are not assessed.');
        context='';continue;
      }
      if(['playerevent','squareevent'].includes(word)){event=true;context='event';outside(context,line.number);continue;}
      if(event){outside('event',line.number);if(word==='endevent'){event=false;context='';}continue;}
      if(['newweapon','selectweapon'].includes(word)){
        context='weapon';weaponBlocks++;if(word==='newweapon')newWeapons++;
        if(line.malformed||line.tokens.length!==1||!(line.tokens[0]?.quoted||word==='selectweapon'&&/^\d+$/.test(args)))unknown(word,line.number,'Weapon opener is outside the form’s supported grammar; validity is not established.');
        continue;
      }
      if(word==='newspell'){context='spell';se(line.number);continue;}
      if(core.coverage.sections[word]){context=core.coverage.sections[word];outside(context,line.number);if(extended.has(word)||rule)se(line.number);continue;}
      if(word==='include'){context='';unknown(word,line.number,'Includes are not resolved. Their commands and dependencies remain unknown.');continue;}
      if(['end','endevent'].includes(word)){context='';continue;}
      if(['icon','description','modprio','modversion','coeversion'].includes(word)){context='';outside('metadata',line.number);continue;}
      if(extended.has(word))se(line.number);
      if(rule){
        se(line.number);
        if(context==='weapon'||context==='spell'){
          const r=core.coverage.inspect(line,context);
          if(r.barrier){unknown(word,line.number,r.message);context='';}
          else if(!words.has(word))outside('additional '+context+' properties',line.number);
          continue;
        }
      }
      if(pathForms.has(word)&&line.tokens[0]?.quoted)se(line.number,'Quoted magic-path names in native commands require CoE5SE name translation.');
      if(offsetForms.has(word)&&line.tokens.some(t=>t.quoted))se(line.number,'Named arguments in offset-based commands require CoE5SE.');
      // mr is a numeric monster field but a weapon flag: context matters.
      if(context==='weapon'&&flags.has(word)&&args==='0')se(line.number,'Weapon flag removal with 0 uses a CoE5SE hook.');
      if(context==='weapon'){
        if(!line.malformed&&((scalars.has(word)&&/^-?\d+$/.test(args))||(flags.has(word)&&args==='')||(word==='clearwspec'&&args==='')||(['nextwep','nextalwayswep'].includes(word)&&/^("[^"\r\n]+"|\d+)$/.test(args))))continue;
        if(words.has(word))outside('other weapon commands or argument forms',line.number);
        else {unknown(word,line.number);context='';}
      }else if(context==='spell'){
        if(['level','burnforest'].includes(word))continue;
        if(words.has(word))outside('additional spell properties',line.number);
        else {unknown(word,line.number);context='';}
      }else if(context)outside(context,line.number);
      else if(rule||words.has(word))outside('other commands',line.number);
      else unknown(word,line.number);
    }
    if(newWeapons>3799)se(0,'This source alone exceeds the documented 3,799 native weapon additions.');
    if(!groups.size&&!weaponBlocks)outside('uninspected source',0);
    const notes=[...groups.values()].map(({lines,...note})=>note),requiresExtender=notes.some(n=>n.kind==='extender'),unresolved=notes.some(n=>n.kind!=='extender');
    return {requiresExtender,unresolved,notes,status:requiresExtender?'Requires CoE5SE':notes.some(n=>n.kind==='unknown')?'Validity not established':unresolved?'Partial source coverage':'Native weapon syntax subset',
      scope:'Dependency and editor-coverage summary, not a whole-mod validity check. See Source checks for inspected fields; other files, enabled-mod capacity, references and gameplay are not verified.'};
  }
  return {assess};
});
