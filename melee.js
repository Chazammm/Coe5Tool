(function(root,factory){
  if(typeof module==='object' && module.exports) module.exports=factory(require('./core.js'),require('./creation.js'),require('./melee-templates.js'),require('./damage-types.js'));
  else root.CoeMelee=factory(root.CoeWorkbench,root.CoeCreation,root.CoeMeleeTemplates,root.CoeDamage);
})(globalThis,function(core,creation,templates,damage){
  'use strict';
  const header='# Native weapon definition fragment; not an installable mod.';
  const sprites={0:'Arrow',1:'Javelin',2:'Sling stone',7:'Ballista bolt'};
  const impacts={34:'Blood Burst',68:'Flame'};
  const particleFlights=templates.particleFlights;
  const catalog=templates.catalog;
  function visualName(role,id){return catalog[role][id]?.name || (role==='sprite'?'Unnamed sprite':'Unknown effect');}
  function luaRows(role){
    return Object.entries(catalog[role]).map(([id,row])=>'['+id+']={'+JSON.stringify(row.name??false)+','+(row.witness??'false')+'}').join(',\n');
  }
  function fixedVisuals(s){
    return Object.hasOwn(s.flymode==='2'?particleFlights:sprites,s.flylook)&&(!s.look||Object.hasOwn(impacts,s.look));
  }
  function rangedVisuals(s){
    if(s.flymode==='2')return 'Flight: '+visualName('particle',s.flylook)+' #'+s.flylook+' (standard particle mode 2). Impact: '+(s.look?visualName('impact',s.look)+' #'+s.look:'none specified')+'. Visual choices do not set damage type.';
    return 'Flight: '+visualName('sprite',s.flylook)+' #'+s.flylook+' (sprite mode 1). Impact: '+(s.look?visualName('impact',s.look)+' #'+s.look:'none specified')+'.';
  }
  function carrierDamageReason(id){
    id=String(id);
    if(/^[1-6]$/.test(id))return '';
    const p=damage.profile(id);
    let reason=p?.reason || 'This damage type has no standalone carrier fixture.';
    if(p?.kind==='mask')reason='The carrier attack row needs a documented effect mask and a suitable target for its bits.';
    if(p?.kind==='animate')reason='Animate needs a tree or fungus target.';
    if(p?.kind==='scalar')reason=id==='8'?'Fear needs a morale observation.':id==='9'?'Poison needs an observation across combat rounds.':id==='10'?'Acid needs its own target resistance readout and hit check in this fixture.':'Magic damage has no validated standalone test policy.';
    return damage.name(id)+'. '+reason+' Keep this type for export, or prepare a separate weapon using slash, blunt, pierce, fire, cold or shock.';
  }
  function specification(text,mode,expanded=false){
    const normalized=text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
    if(mode!=='c5m' || !normalized.startsWith(header+'\n')) throw Error('Use a standalone .c5m from New weapon for this test. Other source can still be edited and exported.');
    const blocks=core.inspect(normalized,mode).blocks;
    if(blocks.length!==1 || blocks[0].opener!=='newweapon') throw Error('The private carrier test needs one generated newweapon.');
    const block=blocks[0], fields=Object.fromEntries(block.fields.map(f=>[f.key,f.value]));
    const reason=carrierDamageReason(fields.dmgtype);
    if(reason)throw Error(reason);
    const ranged=fields.range!=='1';
    if(!/^[0-5]$/.test(fields.aoe))throw Error('Standalone tests support area codes 0–5. Beams, cones, random squares and global targets need a dedicated fixture. Keep this code for export, or explicitly edit it to a supported code.');
    if(fields.sound || fields.flysound)throw Error('Carrier tests do not accept explicit sound commands. Export preserves these settings.');
    if(ranged){
      if(!/^[2-9]$/.test(fields.range))throw Error('The private ranged test needs range 2–9. Other ranges remain available for export.');
      if(fields.flymode==='2'){
        if(!Object.hasOwn(expanded?catalog.particle:particleFlights,fields.flylook))throw Error(expanded?'Choose a mode-2 flight with a 5.43 flight label or native mode-2 reference. Other values remain exportable.':'This mode-2 test uses documented flight effects found on native 5.43 weapons in standard particle mode. Choose a supported particle flight in New weapon, or keep this effect for export.');
      }else if(fields.flymode!=='1' || !Object.hasOwn(expanded?catalog.sprite:sprites,fields.flylook)){
        throw Error(expanded?'Choose a documented or native-referenced mode-1 sprite, or a supported mode-2 particle projectile. Other modes remain exportable.':'A ranged test needs an explicit projectile: mode 1 with sprite 0, 1, 2 or 7, or mode 2 with a supported particle flight effect. Other modes remain available for export.');
      }
      if(fields.look && !Object.hasOwn(expanded?catalog.impact:impacts,fields.look)) throw Error(expanded?'Choose a named 5.43 strike candidate or omit impact. Other values remain exportable.':'For this projectile test, omit impact or choose Blood Burst #34 or Flame #68. Other effects remain available for export.');
    }else if(fields.look || fields.flymode || fields.flylook){
      throw Error('The range-1 melee test has no flight or impact settings. A projectile test needs range 2–9 and a supported flight mode and flight choice.');
    }
    if(!/^(?:0|[1-9][0-9]?)$/.test(fields.dmg)||!/^[1-9][0-9]?$/.test(fields.init)) throw Error('Test limits: weapon damage 0–99 and initiative 1–99. Export supports the wider creation range.');
    const spec={weaponName:block.name,...fields};
    const canonical=creation.weaponDefinition(spec);
    if(canonical.text.replace(/\r\n/g,'\n')!==normalized)throw Error('This test requires the intact generated fragment. Extra commands and comments are retained for export.');
    return {...canonical,route:ranged?'ranged':'melee'};
  }
  const defaultTarget=Object.freeze({id:13,name:'Spearman'});
  function validTarget(target){
    return target && Number.isInteger(target.id) && target.id>=0 && target.id<2000 &&
      typeof target.name==='string' && /^[ -~]{1,49}$/.test(target.name) && target.name===target.name.trim() &&
      !/["#\\]/.test(target.name) && !['...','end'].includes(target.name) && !target.name.startsWith('Debug ');
  }
  function areaLabel(value){return 'Area code '+value+' · '+(String(value)==='0'?'single target':'up to '+value+' nearby targets/squares');}
  function targetLabel(t){return t.name+' #'+t.id+(t.count>1?' × '+t.count:'');}
  function validRoster(rows){
    if(!Array.isArray(rows)||rows.length<2||rows.length>8||rows.some(r=>!validTarget(r)||!Number.isInteger(r.count)||r.count<1)||new Set(rows.map(r=>r.id)).size!==rows.length||rows.reduce((n,r)=>n+r.count,0)>200)throw Error('Choose 2–8 distinct native types, with positive whole counts totalling at most 200.');
    return rows.map(r=>({id:r.id,name:r.name,count:r.count}));
  }
  function testPackage(source,mode,id,payload,compare=false,target=defaultTarget,count='1',mixed=null){
    if(!validTarget(target))throw Error('Choose one native target by its 5.43 name and ID.');
    if(typeof count!=='string'||!/^[1-9][0-9]{0,2}$/.test(count)||String(Number(count))!==count||Number(count)>200)throw Error('Enter a whole target count from 1 to 200.');
    const group=Number(count)>1;
    target={id:target.id,name:target.name,...(group?{count:Number(count)}:{})};
    const def=specification(source,mode,compare), s=def.spec;
    const route=def.route,ranged=route==='ranged',carrier=ranged?'WB Ranged Carrier':'WB Melee Carrier';
    if(compare&&!ranged)throw Error('Visual comparison requires a supported standalone ranged weapon.');
    creation.testOptions({modId:id,caster:carrier,enemy:target.name,count});
    if(typeof payload!=='string'||!/^[1-9][0-9]?$/.test(payload))throw Error('Enter a carrier attack payload from 1 to 99.');
    const tokens={ROUTE:route,CARRIER:carrier,SOURCE:def.text.trimEnd().replace(/\r\n/g,'\n'),WEAPON:s.weaponName,PAYLOAD:payload};
    const fill=(template,values)=>template.replace(/\{\{([A-Z]+)\}\}/g,(_,k)=>values[k]);
    const mod=fill(templates.mod,tokens).replace(/\n/g,'\r\n');
    const particle=s.flymode==='2';
    const particleCheck=!compare&&particle?fill(templates.particleCheck,{FLIGHTNAME:JSON.stringify(particleFlights[s.flylook]),IMPACTNAME:JSON.stringify(impacts[s.look]||'')}):'';
    const visualTokens={RANGE:s.range,MODE:s.flymode,FLIGHTVAR:particle?'flight':'sprite',FLIGHT:s.flylook,IMPACT:s.look||'-1',PARTICLECHECK:particleCheck};
    const elemental=Number(s.dmgtype)>=4;
    const targetTokens={TARGETID:String(target.id),COUNT:count,OPPONENT:group?'group':'target',AREA:s.aoe,AREALABEL:'',AREATEXT:s.aoe==='0'?'':'      ui.text(0,"Area code '+s.aoe+' | nearby count")\n',AREAINFO:s.aoe==='0'?'':'.."; area code '+s.aoe+' (nearby count)"',
      TARGETHELPER:fill(group?templates.group:templates.target,{TARGETID:String(target.id),TARGETNAME:JSON.stringify(target.name),TYPE:s.dmgtype,COUNT:count}),
      READING:group?'saveGroup('+(compare?'row':'meta')+',defender)':compare?'row.target,row.targetunit,row.targetresistance=defender.target,defender.targetunit,defender.targetresistance':'meta.targetunit,meta.targetresistance=defender.targetunit,defender.targetresistance'};
    if(s.aoe!=='0')targetTokens.READING+=';'+(compare?'row':'meta')+'.area='+s.aoe;
    const lua=compare?fill(templates.compare,{...targetTokens,...visualTokens,DAMAGELABEL:elemental?'.." | Damage #'+s.dmgtype+'"':'',MODID:JSON.stringify(id),WEAPON:JSON.stringify(s.weaponName),TYPE:s.dmgtype,DMG:s.dmg,INIT:s.init,PAYLOAD:payload,PARTICLES:luaRows('particle'),SPRITES:luaRows('sprite'),IMPACTS:luaRows('impact')}):fill(templates.lua,{...targetTokens,ROUTE:route,CARRIER:carrier,ROWTYPE:ranged?'2':'1',RANGE:s.range,RANGEDCHECK:ranged?fill(templates.rangedCheck,visualTokens):'',MODID:JSON.stringify(id),WEAPON:JSON.stringify(s.weaponName),TYPE:s.dmgtype,DMG:s.dmg,INIT:s.init,PAYLOAD:payload,DOCK:templates.dock});
    if(mixed){
      const rows=validRoster(mixed);
      if(compare)throw Error('Mixed groups use a fixed AI battle. Use a single type for visual comparison.');
      const roster='{'+rows.map(r=>'{monster='+r.id+',name='+JSON.stringify(r.name)+',count='+r.count+'}').join(',')+'}';
      const lua=fill(templates.mixed,{MODID:JSON.stringify(id),WEAPON:JSON.stringify(s.weaponName),ROSTER:roster,ROWTYPE:ranged?'2':'1',CARRIER:carrier,PAYLOAD:payload,AREA:s.aoe,RANGE:s.range,TYPE:s.dmgtype,DMG:s.dmg,INIT:s.init,VISUALCHECK:ranged?',flymode='+s.flymode+',flylook='+s.flylook+',look='+(s.look||'-1'):''});
      const manifest={kind:'private-mixed-v1',route,sourceMode:mode,modId:id,weapon:s.weaponName,payload,roster:rows,dependencies:['CoE5 5.43 Windows','CoE5SE 2.13.0 + Workbench roster-v1 (local)']};
      return {source,mode,modId:id,manifest,files:[{name:id+'.c5m',text:mod},{name:id+'.lua',text:lua},{name:'manifest.json',text:JSON.stringify(manifest,null,2)},{name:'README.txt',text:'Mixed native group: '+rows.map(targetLabel).join(', ')+'. Requires the local Workbench roster-v1 extender. Main menu: WB test: '+id+' → Check cleanup or Battle (AI) → Finish → Quit. Open session & logs for wb-mixed-<run>.ini. HP readings are observations; inspect the combat log for named hits. Export retains only the native weapon.'}]};
    }
    const manifest={kind:compare?'private-ranged-compare-v2':'private-'+route+'-v1',sourceMode:mode,modId:id,weapon:s.weaponName,payload,target,...(compare&&s.aoe!=='0'?{areaLayout:1}:{}),dependencies:['CoE5 5.43 Windows','CoE5SE 2.13.0']};
    const readme=['Standalone '+route+' weapon: '+s.weaponName,'CoE5 5.43 Windows / CoE5SE 2.13.0. Start from the prepared Workbench profile.',
      carrier+' copies Spearman stats and replaces its attacks with one regular '+route+' row. Row 0 payload '+payload+', weapon base damage '+s.dmg+'. Enemy: '+(group?count+' × ':'one ')+target.name+' #'+target.id+'.',
      'Damage: '+damage.name(s.dmgtype)+'. '+areaLabel(s.aoe)+'. Check individual hit events in the combat log. Flight and impact keep separate settings.',
      ...(group?['The helper verifies the full roster before combat. Each unitN entry records a unit instance ID and its own pre-battle resistance (or unavailable). Area stays at the source code '+s.aoe+'.']:[]),
      ...(elemental&&!compare?['Attack details and the observation INI show the target resistance sampled before battle, if available. Use the game log for the named hit and its actual damage.']:[]),
      ...(ranged?[rangedVisuals(s)+' Configured range '+s.range+'. The game deploys both units and controls the actual attack distance. Check the log and watch the flight and impact separately.']:[]),
      compare?'Main menu: WB test: '+id+' > Battle (fresh '+targetTokens.OPPONENT+'). Choose a flight or impact, Apply visuals, then Battle again. Each returned battle saves its readback. Finish restores the private weapon. Quit and review the selected battle in Workbench.': 'Main menu: WB test: '+id+' > Battle (AI) > Close > Quit. Check the named attack in the combat log. A battle return alone does not establish use. No spell, forced attack or editable return.'].join('\r\n');
    return {source,mode,modId:id,manifest,files:[{name:id+'.c5m',text:mod},{name:id+'.lua',text:lua},{name:'manifest.json',text:JSON.stringify(manifest,null,2)},{name:'README.txt',text:readme}]};
  }
  return {validRoster,defaultTarget,targetLabel,areaLabel,validTarget,carrierDamageReason,specification,testPackage,rangedVisuals,particleFlights,sprites,impacts,catalog,visualName,fixedVisuals};
});

