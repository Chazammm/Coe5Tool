/* Bounded dependency diagnostics, not a whole-mod compatibility certificate. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./core.js'));else root.CoeTarget=factory(root.CoeWorkbench);})(typeof globalThis!=='undefined'?globalThis:this,function(core){
  'use strict';
  const scalars=new Set(['dmg','dmgtype','range','init','aoe','look','flymode','flylook','sound','flysound','trgrank','nextdmg','sndvol','reloadsnd']);
  const flags=new Set(['arrow','an','drain','sweep','fullsweep','lob','oneshot','nostr','yellow','blue','purple','mr','easymr','hardmr']);
  const flagForms=new Set([...flags,'invul','immortal']);
  const extended=new Set(['newspell','newspellpath','selectspellpath','newplane','newfaction','onlyaffects','doesntaffect','doubledmgvs','noexplode','needs_script_extender','needs_coe5se','needs_glu32.dll_and_CoE5SE_enabled_at_launch']);
  const pathForms=new Set(['spellweapon','spellweaponbonus','spellweapon50','spellweapon50s','spellweaponsingle','pathboost','newspell1','newspell2','newspell3']);
  const offsetForms=new Set(['spawnoffs','growoffs','lookslike','firstshape','secondshape','secondtmpshape','gainrit']);
  function assess(text,format){
    if(!['c5m','c5se'].includes(format))throw new Error('Choose the actual source format.');
    const notes=[];let context='',newWeapons=0,weaponBlocks=0;
    const note=(kind,line,message)=>notes.push({kind,line,message});
    if(format==='c5se')note('extender',0,'A .c5se sidecar is loaded only by CoE5SE, including native commands inside it.');
    for(const line of core.linesOf(text)){
      let source=line.body.replace(/^\uFEFF/,'').trimStart(),prefixed=false;
      if(format==='c5m'&&source.startsWith('#!@')){prefixed=true;source=source.slice(3).trimStart();}
      if(source.startsWith('#')||!source.trim())continue;
      source=source.split('#')[0].trim();if(!source)continue;
      const m=source.match(/^(\S+)(?:\s+(.*))?$/),word=m[1],args=m[2]||'';
      if(prefixed)note('extender',line.number,word==='requires'?'#!@requires does not declare a dependency; CoE5SE needs a plain requires line.':'Extender-prefixed content is skipped by Vanilla CoE5.');
      if(word==='newweapon'||word==='selectweapon'){
        context='weapon';weaponBlocks++;if(word==='newweapon')newWeapons++;
        if(!/^("[^"\r\n]+"|[0-9]+)$/.test(args)||word==='newweapon'&&!args.startsWith('"'))note('unknown',line.number,'Weapon opener has an unsupported argument form.');
        continue;
      }
      if(extended.has(word)){
        if(['newspell','newspellpath','selectspellpath','newplane','newfaction'].includes(word))context=word;
        note('extender',line.number,word+' requires CoE5SE.');continue;
      }
      if(['newmonster','selectmonster'].includes(word)){context='monster';note('unknown',line.number,'Monster definitions are outside this weapon-only assessment.');continue;}
      if(['newritual','selectritual','newritpow'].includes(word)){context='ritual';note('unknown',line.number,'Ritual definitions are outside this weapon-only assessment.');continue;}
      if(['path','weapon','slowcast','notsea','notunderground','prioritylearn'].includes(word)&&context==='newspell'){
        note('extender',line.number,'This field belongs to a CoE5SE spell definition.');continue;
      }
      if((['level','burnforest'].includes(word)&&context==='newspell')||(word==='name'&&context==='selectspellpath')||(word==='planeswap'&&context==='newplane')){
        note('extender',line.number,'Command meaning depends on the surrounding CoE5SE block.');continue;
      }
      if(word==='requires'){
        note(/^"?CoE5SE"?(?:\s|$)/.test(args)?'extender':'unknown',line.number,'Dependency/load-order line: '+(/^"?CoE5SE"?(?:\s|$)/.test(args)?'CoE5SE is required.':'enabled dependencies and their files are not assessed.'));continue;
      }
      if(word==='include'){context='';note('unknown',line.number,'Includes are not resolved; their commands and dependencies remain unknown.');continue;}
      if(pathForms.has(word)){
        if(args.startsWith('"'))note('extender',line.number,'A quoted path in this command uses CoE5SE name translation.');
        else if(!/^[0-9]+(?:\s+[0-9]+)?$/.test(args))note('unknown',line.number,'Unsupported path argument form.');
        else note('unknown',line.number,'Numeric native path form; availability and surrounding ability/ritual are not validated.');
        continue;
      }
      if(offsetForms.has(word)&&/"/.test(args)){note('extender',line.number,'Named arguments in this offset-based command require CoE5SE.');continue;}
      if(flagForms.has(word)&&args==='0'){note('extender',line.number,'Flag removal with 0 uses an extender hook; native behavior is not established.');continue;}
      if(['icon','description','modprio'].includes(word)){
        context='';note('unknown',line.number,'Mod metadata is retained; this partial check does not assess a complete mod package.');continue;
      }
      if(context==='weapon'&&((scalars.has(word)&&/^-?[0-9]+$/.test(args))||(flags.has(word)&&args==='')||(word==='clearwspec'&&args==='')||(['nextwep','nextalwayswep'].includes(word)&&/^("[^"\r\n]+"|[0-9]+)$/.test(args))))continue;
      if(word==='level'&&context==='ritual'){note('unknown',line.number,'Native ritual level context; the ritual itself is outside this assessment.');continue;}
      note('unknown',line.number,'Unassessed command or argument form: '+word+'. Text is preserved; its provider and behavior are unresolved.');
      // Unknown commands can change selection/context. Never approve subsequent familiar words by guessing.
      context='';
    }
    if(newWeapons>3799)note('extender',0,'This source alone exceeds the documented 3,799 native weapon additions.');
    if(!notes.length&&!weaponBlocks)note('unknown',0,'No active weapon definition was found to assess.');
    const requiresExtender=notes.some(n=>n.kind==='extender'),unresolved=notes.some(n=>n.kind==='unknown');
    return {requiresExtender,unresolved,notes,status:requiresExtender?'Requires CoE5SE':unresolved?'Compatibility unresolved':'Native weapon syntax subset',
      scope:'Partial source check only. Other files, enabled-mod capacity, references and gameplay are not verified.'};
  }
  return {assess};
});
