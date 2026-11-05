/* Source-span inspection, deliberately narrower than the game parser. No engine execution. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./known-words.js'));
  else root.CoeWorkbench = factory(root.CoeKnownWords);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (known) {
  'use strict';
  const knownWords = new Set(known);
  const boundaries = new Set(['newweapon','selectweapon','newspell','newmonster','selectmonster','newclass','selectclass',
    'newritpow','newritual','selectritual','newitem','selectitem','selectterr','selectterrgroup','newspellpath',
    'selectspellpath','newplane','newfaction','newnametype','newsetting','newsettingpage','newsettingheader',
    'playerevent','squareevent','endevent','end','include','icon','description','modprio','requires','needs_script_extender']);
  const weaponFields = [
    ['dmg','Weapon damage','0 uses monster damage; some damage types use a mask rather than ordinary damage.'],
    ['dmgtype','Damage type','Numeric type. This prototype does not interpret special payloads.'],
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
    {key:'weaponDamage',label:'Spell weapon damage',help:'The damage in weapon <damage> <reference>, separate from the weapon’s dmg line.',kind:'int64',command:'weapon',token:0},
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
    const lines=linesOf(text).map(line=>lex(line,mode)),blocks=[],diagnostics=[];let current=null;
    const note=(severity,line,message)=>diagnostics.push({severity,line,message});
    function finish(end){if(current){current.end=end;current=null;}}
    for(const line of lines) {
      if(line.empty)continue;
      if(boundaries.has(line.word)) {
        finish(line.start);
        if(['newweapon','selectweapon','newspell'].includes(line.word)) {
          const type=line.word==='newspell'?'spell':'weapon',t=line.tokens[0];
          const headerSafe=!line.malformed && line.tokens.length===1 && (line.word==='selectweapon'?isReference(t):!!t?.quoted && t.value.length>0) && (type!=='spell'||new TextEncoder().encode(t?.value||'').length<=47);
          current={id:blocks.length,type,opener:line.word,name:t?.value||'(unreadable name)',header:line,start:line.start,end:text.length,entries:[],opaque:false,opaqueWords:new Set(),headerSafe};
          blocks.push(current);
          if(!headerSafe)note('error',line.number,type==='spell' && t?.quoted && new TextEncoder().encode(t.value).length>47?'Spell name exceeds the core’s 47-byte limit; form editing disabled.':'Definition header is outside the supported grammar; form editing disabled.');
          if(type==='spell' && mode==='c5m' && !line.marked) {current.headerSafe=false;note('error',line.number,'CoE5SE spell command is unprefixed in .c5m. Preserved without conversion.');}
        }
        continue;
      }
      if(!current)continue;
      if(line.malformed) {note('error',line.number,line.malformed+'; inspection stops here until the next definition.');current.opaqueWords.add(line.word);current.opaque=true;continue;}
      if(!knownWords.has(line.word)) {
        note('warning',line.number,`Unsupported directive “${line.word}” preserved; later fields are not assigned to this form.`);
        current.opaque=true;continue;
      }
      if(current.opaque){current.opaqueWords.add(line.word);continue;}
      if(current.type==='spell' && ['path','level','weapon'].includes(line.word) && mode==='c5m' && !line.marked) {
        note('error',line.number,'Unprefixed CoE5SE spell field in .c5m; this line is read-only in the form.');
        line.formUnsafe=true;
      }
      current.entries.push(line);
    }
    finish(text.length);
    for(const block of blocks) {
      block.fields=fieldsFor(block.type).map(spec=>{
        const entries=block.entries.filter(e=>e.word===spec.command);
        let reason='',entry=entries[0],token=entry?.tokens[spec.token];
        if(!block.headerSafe)reason='Unsupported header';
        else if(entries.length===0)reason=block.opaque?'Not inspected beyond the unsupported line':'Not explicitly declared here';
        else if(entries.length>1 || block.opaqueWords.has(spec.command))reason='Repeated or ambiguous command; edit the original source manually';
        else if(entry.formUnsafe)reason='Prefix/context needs manual review';
        else if(entry.tokens.length!==(spec.command==='weapon'?2:1))reason='Unsupported argument shape';
        else if(spec.kind==='reference'?!isReference(token):!token || token.quoted || !integer.test(token.raw))reason='Unsupported value syntax';
        if(!reason && spec.command==='weapon' && (!integer.test(entry.tokens[0].raw)||!isReference(entry.tokens[1])))reason='Unsupported weapon assignment';
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
      if(block.type==='spell' && !block.opaque) {
        for(const command of ['path','level','weapon'])if(!block.entries.some(e=>e.word===command))note('error',block.header.number,`No explicit ${command} field found in this inspected spell fragment.`);
      }
      for(const field of block.fields)if(field.editable) {
        const issue=validateValue(field,field.value);
        if(issue)note('error',field.line,`${field.label}: ${issue}`);
      }
      if(block.type==='spell') {
        const ref=block.fields.find(f=>f.key==='weaponRef');
        block.matches=[];
        if(ref?.editable) {
          const token=ref.token;
          if(token.quoted) {
            block.matches=blocks.filter(b=>b.type==='weapon' && b.headerSafe && b.header.tokens[0].quoted && b.name===token.value).map(b=>b.id);
            const earlier=block.matches.filter(id=>blocks[id].start<ref.token.start);
            if(!earlier.length)note('warning',ref.line,block.matches.length?'Local matching weapon appears only after this reference; review load order and possible native names.':'Weapon reference unresolved here; it may be native, in another file or another mod.');
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
    if(field.kind==='level' && (n<1n||n>3n))return 'CoE5SE spell level must be 1, 2 or 3.';
    if(field.kind==='int64' && (n<-(1n<<63n)||n>(1n<<63n)-1n))return 'Spell damage is stored as a signed 64-bit integer.';
    if(field.kind==='integer' && (n<-(1n<<31n)||n>(1n<<32n)-1n))return 'Value exceeds this 4-byte field’s storage envelope; legal game values are not otherwise validated.';
    if(field.kind==='wideInteger' && (n<-(1n<<63n)||n>(1n<<64n)-1n))return 'Value exceeds this 8-byte field’s storage envelope; legal game values are not otherwise validated.';
    return '';
  }
  function patch(text,mode,blockId,edits) {
    const model=inspect(text,mode),block=model.blocks[blockId];
    if(!block)throw new Error('Definition no longer exists');
    const changes=[];
    for(const [key,value] of Object.entries(edits)) {
      const field=block.fields.find(f=>f.key===key);
      if(!field?.editable && !field?.addable)throw new Error(`${key}: ${field?.reason||'Unsupported field'}`);
      if(field.addable && value==='')continue;
      const issue=validateValue(field,value);if(issue)throw new Error(`${field.label}: ${issue}`);
      if(field.addable) {
        const header=block.header;
        const style=header.body.match(/^(?:\uFEFF)?([ \t]*)(#!@[ \t]*)?/);
        const prefix=style[1]+(mode==='c5m'?style[2]:'');
        // Required path/weapon lines imply a header newline. Keep that exact EOL.
        if(!header.eol)throw new Error('No safe line separator for insertion');
        changes.push({start:header.end,end:header.end,before:'',after:`${prefix}level ${value}${header.eol}`,line:header.number+1,label:'Add spell level',kind:'insert'});
      } else if(value!==field.value)changes.push({start:field.token.start,end:field.token.end,before:field.value,after:value,line:field.line,label:field.label,kind:'replace'});
    }
    let output=text;
    for(const change of [...changes].sort((a,b)=>b.start-a.start))output=output.slice(0,change.start)+change.after+output.slice(change.end);
    return {text:output,changes};
  }
  const example = '# Definition fragment, not an installable mod. No game test performed.\n# Weapon values adapted from Illwinter’s Magic Javelin example.\nnewweapon "Workbench Magic Javelin"\nrange 6\ninit 7\ndmgtype 3\ndmg 8\naoe 0\narrow\nflymode 1\nflylook 1\nflysound 19\n\n# CoE5SE spell. Keep custom weapons before their spell references.\nnewspell "Workbench Javelin"\npath "Pyromancy"\nlevel 1\nweapon 8 "Workbench Magic Javelin"\n';
  function starter(mode='c5se') { return mode==='c5m'?example.replace(/^(newspell|path|level|weapon) /gm,'#!@$1 '):example; }
  return {inspect,patch,validateValue,linesOf,starter,fieldsFor};
});
