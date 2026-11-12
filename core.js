/* Source-span inspection, deliberately narrower than the game parser. No engine execution. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./known-words.js'),require('./command-coverage.js'));
  else root.CoeWorkbench = factory(root.CoeKnownWords,root.CoeCommandCoverage);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (known,coverage) {
  'use strict';
  const knownWords = new Set(known);
  const boundaries = new Set(['newweapon','selectweapon','newspell','newmonster','selectmonster','newclass','selectclass',
    'newritpow','newritual','selectritual','newitem','selectitem','selectterr','selectterrgroup','newspellpath',
    'selectspellpath','newplane','newfaction','newnametype','newsetting','newsettingpage','newsettingheader',
    'playerevent','squareevent','endevent','end','include','icon','description','modprio','requires','needs_script_extender',
    'battlemap','terrainlooks','newcorpsetype','newcorpsekind','newrit']);
  const weaponFields = [
    ['dmg','Weapon damage','Payload meaning depends on damage type: a number, effect mask or selector. A zero scalar weapon uses monster damage.'],
    ['dmgtype','Damage type','Documented types have contextual payload help. Unknown types remain manual numeric source.'],
    ['range','Range','Explicit weapon range; melee commonly uses 1.'],
    ['init','Initiative','Explicit initiative, separate from a spell’s level.'],
    ['aoe','Area / targeting code','A targeting code, not a radius. Legal codes are not checked here.'],
    ['look','Impact effect · look','Numeric game look setting. No asset lookup or effect renderer.'],
    ['flymode','Flight mode','Mode 1 uses sprite IDs in flylook; other modes use look IDs.'],
    ['flylook','Flight effect / sprite','With flymode 1: sprite ID. Other modes: look ID. IDs are not resolved.'],
    ['sound','Impact sound','Numeric sound setting; no audio playback.'],
    ['flysound','Launch sound','Numeric launch sound setting; no audio playback.']
  ].map(([key,label,help]) => ({key,label,help,kind:key==='dmg'?'wideInteger':'integer',command:key,token:0}));
  const spellFields = [
    {key:'path',label:'Magic path',help:'Quoted name or numeric ID. Loaded paths are not resolved here.',kind:'reference',command:'path',token:0},
    {key:'level',label:'Spell level',help:'CoE5SE spell levels are 1, 2 or 3.',kind:'level',command:'level',token:0},
    {key:'weaponDamage',label:'Spell weapon damage',help:'The separate spell attack payload in weapon <payload> <reference>. Special types can use a mask or selector instead of ordinary damage.',kind:'int64',command:'weapon',token:0},
    {key:'weaponRef',label:'Weapon reference',help:'Quoted name or numeric ID. Names must exist when this line loads.',kind:'reference',command:'weapon',token:1}
  ];
  const integer = /^[+-]?\d+$/;
  function linesOf(text) {
    const result=[]; let start=0;
    while(start<text.length) {
      let end=start; while(end<text.length && text[end]!=='\r' && text[end]!=='\n') end++;
      const bodyEnd=end;
      if(text[end]==='\r' && text[end+1]==='\n') end+=2; else if(end<text.length) end++;
      result.push({number:result.length+1,start,bodyEnd,end,body:text.slice(start,bodyEnd),eol:text.slice(bodyEnd,end)}); start=end;
    }
    return result;
  }
  function lex(line,mode) {
    const s=line.body; let p=line.start===0 && s[0]==='\uFEFF'?1:0; let marked=false;
    while(s[p]===' '||s[p]==='\t')p++;
    if(mode==='c5m' && s.startsWith('#!@',p)) {marked=true;p+=3;while(/[ \t]/.test(s[p]||'!'))p++;}
    else if(s[p]==='#' || p===s.length) return {...line,empty:true};
    // The upstream editor documents # terminating even quoted values.
    const hash=s.indexOf('#',p),limit=hash<0?s.length:hash;
    const match=s.slice(p,limit).match(/^([^ \t]+)/);
    if(!match) return {...line,empty:true};
    const word=match[1];p+=word.length;const tokens=[];let malformed=s.includes('\0')?'NUL is outside the supported text format':'';
    while(p<limit) {
      while(p<limit && (s[p]===' '||s[p]==='\t'))p++;
      if(p>=limit)break;
      const from=p;
      if(s[p]==='"') {
        p++;const close=s.indexOf('"',p);
        if(close<0 || close>=limit) {malformed='Unclosed quote or # inside a quoted value';break;}
        const value=s.slice(p,close);p=close+1;
        if(value.includes('\\') || (p<limit && s[p]!==' ' && s[p]!=='\t')) {malformed='Unsupported quote/backslash or adjacent-token syntax';break;}
        tokens.push({raw:s.slice(from,p),value,quoted:true,start:line.start+from,end:line.start+p});
      } else {
        while(p<limit && s[p]!==' ' && s[p]!=='\t')p++;
        const raw=s.slice(from,p);
        if(raw.includes('"')) {malformed='Unsupported quote syntax';break;}
        tokens.push({raw,value:raw,quoted:false,start:line.start+from,end:line.start+p});
      }
    }
    return {...line,word,marked,tokens,malformed};
  }
  function isReference(token) { return !!token && ((token.quoted && token.value.length>0) || (!token.quoted && integer.test(token.raw))); }
  function fieldsFor(type) { return type==='spell'?spellFields:weaponFields; }
  function inspect(text, mode='c5se') {
    if(typeof text!=='string')throw new TypeError('Source must be text');
    if(!['c5m','c5se'].includes(mode))throw new Error('Choose c5m or c5se');
    const lines=linesOf(text).map(line=>lex(line,mode)),blocks=[],diagnostics=[];let current=null,event=false;
    const note=(severity,line,message,category=severity==='error'?'field':severity==='warning'?'unknown':'coverage')=>diagnostics.push({severity,line,message,category});
    function finish(end){if(current){current.end=end;current=null;}}
    for(const line of lines) {
      if(line.empty)continue;
      if(['playerevent','squareevent'].includes(line.word)){finish(line.start);event=true;continue;}
      if(event){if(line.word==='endevent')event=false;continue;}
      if(boundaries.has(line.word)) {
        finish(line.start);
        if(['newweapon','selectweapon','newspell'].includes(line.word)) {
          const type=line.word==='newspell'?'spell':'weapon',t=line.tokens[0];
          const headerSafe=!line.malformed && line.tokens.length===1 && (line.word==='selectweapon'?isReference(t):!!t?.quoted && t.value.length>0) && (type!=='spell'||new TextEncoder().encode(t?.value||'').length<=47);
          current={id:blocks.length,type,opener:line.word,name:t?.value||'(unreadable name)',header:line,start:line.start,end:text.length,entries:[],opaque:false,opaqueWords:new Set(),headerSafe};
          blocks.push(current);
          if(!headerSafe){const tooLong=type==='spell'&&t?.quoted&&new TextEncoder().encode(t.value).length>47,syntax=line.malformed?.startsWith('Unclosed')||line.malformed?.startsWith('NUL');note(tooLong||syntax?'error':'warning',line.number,tooLong?'Spell name exceeds CoE5SE’s 47-byte limit; form editing disabled.':syntax?line.malformed+'; form editing disabled.':'Header is outside the form’s supported grammar; validity is not established. Source is retained.',tooLong||syntax?'syntax':'coverage');}
          if(type==='spell' && mode==='c5m' && !line.marked) {current.headerSafe=false;note('warning',line.number,'CoE5SE spell command is unprefixed in .c5m. Use a .c5se sidecar or #!@ lines for this workflow; source is preserved without conversion.','dependency');}
        }
        continue;
      }
      if(!current)continue;
      if(line.malformed) {const syntax=line.malformed.startsWith('Unclosed')||line.malformed.startsWith('NUL');note(syntax?'error':'warning',line.number,line.malformed+'; inspection stops here until the next definition.',syntax?'syntax':'coverage');current.opaqueWords.add(line.word);current.opaque=true;continue;}
      const extra=coverage.inspect(line,current.type);
      if(extra?.barrier){note(extra.severity,line.number,extra.message,extra.category);current.opaqueWords.add(line.word);current.opaque=true;continue;}
      if(extra&&mode==='c5m'&&!line.marked&&['beamwidth','healarmy','onlyaffects','doesntaffect','doubledmgvs','noexplode'].includes(line.word))note('warning',line.number,'CoE5SE command is unprefixed in .c5m. Use #!@ or a .c5se sidecar; the line is preserved, not converted.','dependency');
      if(!knownWords.has(line.word)&&!extra) {
        note('warning',line.number,`Unknown directive “${line.word}” preserved; validity is not established. Later fields are not assigned to this form.`,'unknown');
        current.opaque=true;continue;
      }
      if(current.opaque){current.opaqueWords.add(line.word);continue;}
      if(current.type==='spell' && ['path','level','weapon'].includes(line.word) && mode==='c5m' && !line.marked) {
        note('warning',line.number,'Unprefixed CoE5SE spell field in .c5m; use #!@ or a .c5se sidecar. This line is read-only in the form.','dependency');
        line.formUnsafe=true;
      }
      if(extra&&!knownWords.has(line.word))note(extra.severity,line.number,extra.message,extra.category);
      current.entries.push(line);
    }
    finish(text.length);
    for(const block of blocks) {
      block.fields=fieldsFor(block.type).map(spec=>{
        const entries=block.entries.filter(e=>e.word===spec.command);
        let reason='',entry=entries[0];
        const namedFirst=spec.command==='weapon'&&entry?.tokens[0]?.quoted;
        const token=entry?.tokens[namedFirst?(spec.key==='weaponRef'?0:1):spec.token];
        if(!block.headerSafe)reason='Unsupported header';
        else if(entries.length===0)reason=block.opaque?'Not inspected beyond the unsupported line':'Not explicitly declared here';
        else if(entries.length>1 || block.opaqueWords.has(spec.command))reason='Repeated or ambiguous command; edit the original source manually';
        else if(entry.formUnsafe)reason='Prefix/context needs manual review';
        else if(entry.tokens.length!==(spec.command==='weapon'?2:1))reason='Unsupported argument shape';
        else if(spec.kind==='reference'?!isReference(token):!token || token.quoted || !integer.test(token.raw))reason='Unsupported value syntax';
        if(!reason && spec.command==='weapon' && !(namedFirst?isReference(entry.tokens[0])&&!entry.tokens[1].quoted&&integer.test(entry.tokens[1].raw):!entry.tokens[0].quoted&&integer.test(entry.tokens[0].raw)&&isReference(entry.tokens[1])))reason='Unsupported weapon assignment; use a damage number and a weapon reference';
        return {...spec,value:token?.raw??'',line:entry?.number,token,editable:!reason,reason};
      });
      // A deliberately tiny insertion subset: a complete, plain path/weapon spell
      // missing only level. No opaque tail, other commands, duplicates or unsafe prefix.
      const level=block.fields.find(f=>f.key==='level');
      if(block.type==='spell' && block.headerSafe && !block.opaque && level &&
         !block.entries.some(e=>e.word==='level') &&
         block.entries.every(e=>['path','weapon'].includes(e.word) && !e.formUnsafe) &&
         block.fields.filter(f=>f.key!=='level').every(f=>f.editable && !validateValue(f,f.value))) {
        level.addable=true;
        level.reason='Missing level. Enter 1, 2 or 3 to insert a line after newspell; leave blank to retain the source.';
      }
      // Optional native visual fields can be added only to a plain new weapon.
      // Copies, flags, opaque text, repeated fields and mixed active prefixes stay manual.
      const plainWeapon=block.type==='weapon'&&block.opener==='newweapon'&&block.headerSafe&&!block.opaque&&!block.header.marked&&
        new TextEncoder().encode(block.name).length<=63&&block.entries.every(e=>weaponFields.some(f=>f.command===e.word)&&!e.marked&&!e.formUnsafe)&&
        block.fields.filter(f=>f.line!==undefined).every(f=>f.editable&&!validateValue(f,f.value));
      if(plainWeapon)for(const key of ['look','flymode','flylook']){
        const field=block.fields.find(f=>f.key===key);
        if(!block.entries.some(e=>e.word===key)){field.addable=true;field.reason='Optional visual field. Enter a value to add an explicit line on Apply; leave blank to retain the source. Flight fields need a complete pair.';}
      }
      if(block.type==='spell' && block.headerSafe && !block.opaque) {
        for(const command of ['path','level','weapon'])if(!block.entries.some(e=>e.word===command))note('error',block.header.number,`No explicit ${command} field found in this inspected spell fragment.`);
      }
      for(const field of block.fields)if(field.editable) {
        const issue=validateValue(field,field.value);
        if(issue)note('error',field.line,`${field.label}: ${issue}`,field.kind==='level'?'syntax':'field');
      }
      if(block.type==='spell') {
        const ref=block.fields.find(f=>f.key==='weaponRef');
        block.matches=[];
        if(ref?.editable) {
          const token=ref.token;
          if(token.quoted) {
            block.matches=blocks.filter(b=>b.type==='weapon' && b.headerSafe && b.header.tokens[0].quoted && b.name===token.value).map(b=>b.id);
            const earlier=block.matches.filter(id=>blocks[id].start<ref.token.start);
            if(!earlier.length)note(block.matches.length?'warning':'info',ref.line,block.matches.length?'Local matching weapon appears only after this reference; review load order and possible native names.':'No local weapon definition found; the reference may be native, in another file or another mod. This is not a syntax error.','reference');
            if(block.matches.length>1)note('warning',ref.line,'Several matching source sections. No effective weapon or runtime ID has been resolved.');
          } else note('info',ref.line,'Numeric weapon ID is preserved; game tables are not loaded.');
        }
      }
    }
    return {text,mode,lines,blocks,diagnostics};
  }
  function validateValue(field,value) {
    if(value.includes('\0'))return 'NUL is not supported in source values.';
    if(field.kind==='reference') {
      if(integer.test(value))return BigInt(value)<0n||BigInt(value)>2147483647n?'Reference ID must fit a nonnegative 32-bit signed integer. Loaded IDs are not resolved.':'';
      if(!/^"[^"#\\\r\n]+"$/.test(value))return 'Use a nonempty quoted name (no #, backslash or embedded quote), or an integer ID.';
      if(field.key==='weaponRef' && new TextEncoder().encode(value.slice(1,-1)).length>63)return 'Quoted weapon reference exceeds the core’s 63-byte limit.';
      return '';
    }
    if(!integer.test(value))return 'Use a decimal integer; dice, fractions and expressions are not edited by this form.';
    const n=BigInt(value);
    if(field.addable&&field.key==='look'&&(n<0n||n>299n))return 'Adding an impact field requires an effect ID from 0 to 299.';
    if(field.addable&&field.key==='flymode'&&(n<1n||n>9n))return 'Adding flight mode requires a supported mode from 1 to 9.';
    if(field.addable&&field.key==='flylook'&&(n<0n||n>2147483647n))return 'Adding flight look requires a nonnegative signed 32-bit ID; its catalog depends on the paired mode.';
    if(field.kind==='level' && (n<1n||n>3n))return 'CoE5SE spell level must be 1, 2 or 3.';
    if(field.kind==='int64' && (n<-(1n<<63n)||n>(1n<<63n)-1n))return 'Spell damage is stored as a signed 64-bit integer.';
    if(field.kind==='integer' && (n<-(1n<<31n)||n>(1n<<32n)-1n))return 'Value exceeds this 4-byte field’s storage envelope; legal game values are not otherwise validated.';
    if(field.kind==='wideInteger' && (n<-(1n<<63n)||n>(1n<<64n)-1n))return 'Value exceeds this 8-byte field’s storage envelope; legal game values are not otherwise validated.';
    return '';
  }
  function patch(text,mode,blockId,edits) {
    const model=inspect(text,mode),block=model.blocks[blockId];
    if(!block)throw new Error('Definition no longer exists');
    const changes=[],insertions=new Map();
    for(const key of ['flymode','flylook'])if(block.fields.find(f=>f.key===key)?.addable&&edits[key]!==undefined&&edits[key]!==''){
      const other=key==='flymode'?'flylook':'flymode',field=block.fields.find(f=>f.key===other);
      if(!field?.editable&&(edits[other]===undefined||edits[other]===''))throw new Error('Add flight mode and flight look together, or retain an explicit existing partner.');
      const pair=Object.fromEntries(['flymode','flylook'].map(k=>[k,edits[k]??block.fields.find(f=>f.key===k)?.value]));
      if(!integer.test(pair.flymode)||!integer.test(pair.flylook)||BigInt(pair.flymode)<1n||BigInt(pair.flymode)>9n||BigInt(pair.flylook)<0n||BigInt(pair.flylook)>(BigInt(pair.flymode)===1n?2147483647n:299n))throw new Error('Added flight fields require mode 1 with a sprite ID, or mode 2–9 with an effect ID from 0 to 299.');
    }
    for(const [key,value] of Object.entries(edits)) {
      const field=block.fields.find(f=>f.key===key);
      if(!field?.editable && !field?.addable)throw new Error(`${key}: ${field?.reason||'Unsupported field'}`);
      if(field.addable && value==='')continue;
      const issue=validateValue(field,value);if(issue)throw new Error(`${field.label}: ${issue}`);
      if(field.addable) {
        const header=block.header;
        const style=header.body.match(/^(?:\uFEFF)?([ \t]*)(#!@[ \t]*)?/);
        const prefix=style[1]+(mode==='c5m'?style[2]:'');
        if(field.key==='level'){
          // Required path/weapon lines imply a header newline. Keep that exact EOL.
          if(!header.eol)throw new Error('No safe line separator for insertion');
          changes.push({start:header.end,end:header.end,before:'',after:`${prefix}level ${value}${header.eol}`,line:header.number+1,label:'Add spell level',kind:'insert'});
        }else{
          let anchor=header,at=header.end,before=false;
          if(key==='flymode'&&block.fields.find(f=>f.key==='flylook')?.editable){anchor=block.entries.find(e=>e.word==='flylook');at=anchor.start;before=true;}
          if(key==='flylook'&&block.fields.find(f=>f.key==='flymode')?.editable){anchor=block.entries.find(e=>e.word==='flymode');at=anchor.end;}
          const eol=anchor.eol||header.eol||model.lines.find(l=>l.eol)?.eol||'\n';
          const indent=(block.entries[0]?.body||header.body).match(/^(?:\uFEFF)?([ \t]*)/)[1];
          const item=insertions.get(at)||{anchor,before,eol,rows:[]};
          item.rows.push({key,text:indent+field.command+' '+value,label:'Add '+field.label});insertions.set(at,item);
        }
      } else if(value!==field.value)changes.push({start:field.token.start,end:field.token.end,before:field.value,after:value,line:field.line,label:field.label,kind:'replace'});
    }
    for(const [at,item]of insertions){
      item.rows.sort((a,b)=>['look','flymode','flylook'].indexOf(a.key)-['look','flymode','flylook'].indexOf(b.key));
      const needsSeparator=!item.before&&!item.anchor.eol;
      const body=item.rows.map(r=>r.text).join(item.eol);
      changes.push({start:at,end:at,before:'',after:(needsSeparator?item.eol:'')+body+(needsSeparator?'':item.eol),line:item.anchor.number+(item.before?0:1),label:item.rows.map(r=>r.label).join(', '),kind:'insert'});
    }
    let output=text;
    for(const change of [...changes].sort((a,b)=>b.start-a.start))output=output.slice(0,change.start)+change.after+output.slice(change.end);
    return {text:output,changes};
  }
  const example = '# Definition fragment, not an installable mod. No game test performed.\n# Weapon values adapted from Illwinter’s Magic Javelin example.\nnewweapon "Workbench Magic Javelin"\nrange 6\ninit 7\ndmgtype 3\ndmg 8\naoe 0\nflymode 1\nflylook 1\nflysound 19\n\n# CoE5SE spell. Keep custom weapons before their spell references.\nnewspell "Workbench Javelin"\npath 3\nlevel 1\nweapon 8 "Workbench Magic Javelin"\n';
  function starter(mode='c5se') { return mode==='c5m'?example.replace(/^(newspell|path|level|weapon) /gm,'#!@$1 '):example; }
  return {inspect,patch,validateValue,linesOf,starter,fieldsFor,commandLines:(text,mode)=>linesOf(text).map(line=>lex(line,mode)),coverage};
});
