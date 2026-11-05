const {test}=require('node:test');
const assert=require('node:assert/strict');
const api=require('../core.js');
const field=(model,id,key)=>model.blocks[id].fields.find(f=>f.key===key);

test('official-derived starter links weapon before spell in both formats',()=>{
  for(const mode of ['c5m','c5se']){
    const m=api.inspect(api.starter(mode),mode);
    assert.equal(m.blocks.length,2);assert.deepEqual(m.blocks[1].matches,[0]);
    assert.equal(m.diagnostics.filter(d=>d.severity==='error').length,0);
    assert.equal(field(m,1,'level').value,'1');
  }
});
test('one token edit preserves BOM, mixed EOLs, comments, indentation and final-newline absence',()=>{
  const text='\uFEFF# header\r\nnewweapon "Preserve"\n\t range   5  # keep\rinit 7\r\nmagic\n';
  const result=api.patch(text,'c5m',0,{range:'8'});
  assert.equal(result.text,text.replace('range   5','range   8'));
  assert.equal(result.changes.length,1);
  assert.equal(new TextDecoder('utf-8',{ignoreBOM:true}).decode(new TextEncoder().encode(text)),text);
});
test('does not add a trailing newline',()=>{
  const source='newweapon "A"\r\ndmg 8';assert.equal(api.patch(source,'c5m',0,{dmg:'9'}).text,'newweapon "A"\r\ndmg 9');
});
test('preserves every unknown line and refuses later inferred fields',()=>{
  const source='newweapon "A"\nrange 5\nplugin_opaque "x"\ndmg 9\nnewweapon "B"\ndmg 3\n';
  const m=api.inspect(source,'c5m');assert.equal(field(m,0,'dmg').editable,false);
  assert.equal(api.patch(source,'c5m',0,{range:'7'}).text,source.replace('range 5','range 7'));
  assert.throws(()=>api.patch(source,'c5m',0,{dmg:'7'}),/Not inspected/);
  assert.equal(field(m,1,'dmg').editable,true);
});
test('repeated fields remain untouched and cannot be changed by a guessed last-value rule',()=>{
  const s='newweapon "A"\nrange 4\nrange 8\n';
  assert.equal(field(api.inspect(s,'c5m'),0,'range').editable,false);
  assert.throws(()=>api.patch(s,'c5m',0,{range:'6'}),/Repeated/);
});
test('numeric selectweapon and chained fields stay in source order',()=>{
  const s='selectweapon 76\nrange 5\nnext 2\nnextalways "Echo"\nnewweapon "Echo"\ndmg 2\n';
  const m=api.inspect(s,'c5m');assert.equal(m.blocks[0].name,'76');
  assert.equal(api.patch(s,'c5m',0,{range:'6'}).text,s.replace('range 5','range 6'));
});
test('spell level never crosses into an ordinary ritual or monster block',()=>{
  const s='#!@newspell "A"\n#!@path 3\n#!@level 1\n#!@weapon 8 54\nnewritual "R"\nlevel 9\nnewmonster "M"\nrange 7\n';
  const m=api.inspect(s,'c5m');assert.equal(m.blocks.length,1);
  assert.equal(api.patch(s,'c5m',0,{level:'2'}).text,s.replace('#!@level 1','#!@level 2'));
});
test('hash inside a quoted header is unsafe, including a later closing quote',()=>{
  const m=api.inspect('newweapon "A # nope"\nrange 5\n','c5m');
  assert.equal(m.blocks[0].headerSafe,false);assert.equal(field(m,0,'range').editable,false);
  assert.ok(m.diagnostics.some(d=>d.severity==='error'));
});
test('quote syntax outside the supported subset is preserved read-only',()=>{
  const s='newweapon "A\\"\nrange 5\n';const m=api.inspect(s,'c5m');
  assert.equal(m.blocks[0].headerSafe,false);assert.throws(()=>api.patch(s,'c5m',0,{range:'6'}),/Unsupported header/);
});
test('multi-field edits are atomic and affect only selected spans',()=>{
  const s='newspell "S"\npath "Pyromancy" # path\nlevel 1\nweapon 8 "W" # hit\n';
  assert.equal(api.patch(s,'c5se',0,{path:'3',level:'2',weaponDamage:'12',weaponRef:'54'}).text,'newspell "S"\npath 3 # path\nlevel 2\nweapon 12 54 # hit\n');
  assert.throws(()=>api.patch(s,'c5se',0,{level:'4',weaponDamage:'12'}),/1, 2 or 3/);assert.equal(api.inspect(s).text,s);
});
test('large signed 64-bit damage is never rounded through Number',()=>{
  const s='newspell "S"\npath 3\nlevel 1\nweapon 9007199254740993 54\n';
  assert.equal(field(api.inspect(s),0,'weaponDamage').value,'9007199254740993');
  assert.equal(api.patch(s,'c5se',0,{weaponDamage:'9223372036854775807'}).text,s.replace('9007199254740993','9223372036854775807'));
  assert.throws(()=>api.patch(s,'c5se',0,{weaponDamage:'9223372036854775808'}),/64-bit/);
});
test('invalid field injections and expressions cannot introduce a new source line',()=>{
  const s=api.starter();
  for(const value of ['2\nnewmonster "X"','1.5','1d6','0x20'])assert.throws(()=>api.patch(s,'c5se',0,{dmg:value}),/decimal integer/);
  for(const value of ['"A#B"','"A\\B"','"A" extra','-1'])assert.throws(()=>api.patch(s,'c5se',1,{weaponRef:value}));
});
test('numeric paths outside documented built-ins are not declared invalid without a loaded table',()=>{
  const s='newspell "S"\npath 400\nlevel 1\nweapon 8 54\n';
  assert.equal(field(api.inspect(s),0,'path').editable,true);
  assert.ok(!api.inspect(s).diagnostics.some(d=>d.severity==='error'));
});
test('duplicate named sections are inspectable matches, not a resolved effective weapon',()=>{
  const s='newweapon "W"\ndmg 3\nselectweapon "W"\nrange 5\nnewspell "S"\npath 3\nlevel 1\nweapon 8 "W"\n';
  const m=api.inspect(s);assert.deepEqual(m.blocks[2].matches,[0,1]);assert.ok(m.diagnostics.some(d=>/Several matching/.test(d.message)));
});
test('late and external references are cautions, not falsely proven missing native weapons',()=>{
  const late='newspell "S"\npath 3\nlevel 1\nweapon 8 "W"\nnewweapon "W"\ndmg 3\n';
  assert.ok(api.inspect(late).diagnostics.some(d=>/only after/.test(d.message)));
  assert.ok(api.inspect('newspell "S"\npath 3\nlevel 1\nweapon 8 "Fireball"\n').diagnostics.some(d=>/may be native/.test(d.message)));
});
test('missing and extra field arguments do not get silently repaired',()=>{
  const s='newspell "S"\npath 3\nlevel 1 extra\nweapon 8\n';const m=api.inspect(s);
  assert.equal(field(m,0,'level').editable,false);assert.equal(field(m,0,'weaponRef').editable,false);
  assert.throws(()=>api.patch(s,'c5se',0,{weaponRef:'54'}),/Unsupported argument/);
});
test('unprefixed spell in c5m is not silently converted',()=>{
  const s='newspell "S"\npath 3\nlevel 1\nweapon 8 54\n';
  const m=api.inspect(s,'c5m');assert.equal(m.blocks[0].headerSafe,false);assert.equal(m.text,s);assert.ok(m.diagnostics.some(d=>/unprefixed/.test(d.message)));
});
test('unknown contexts and includes stop inspection before later fields',()=>{
  const s='newweapon "W"\ndmg 3\ninclude "./other.c5se"\nrange 6\n';const m=api.inspect(s);
  assert.equal(field(m,0,'range').editable,false);assert.equal(m.text,s);
});
test('empty input is usable and no-op export remains exact',()=>{
  assert.equal(api.inspect('').blocks.length,0);const s=api.starter();assert.equal(api.patch(s,'c5se',0,{}).text,s);
});
test('HTML-looking names are data, not parser markup',()=>{
  assert.equal(api.inspect('newweapon "<img src=x>"\ndmg 8\n','c5m').blocks[0].name,'<img src=x>');
});
test('sidecar prefixed lines are comments, not phantom definitions',()=>{
  const s='newweapon "Real"\nrange 5\n#!@newweapon "Ghost"\ndmg 8\n';
  const sidecar=api.inspect(s,'c5se');assert.equal(sidecar.blocks.length,1);assert.equal(field(sidecar,0,'dmg').editable,true);
  assert.equal(api.inspect(s,'c5m').blocks.length,2);
});
test('an opaque tail cannot conceal a repeated editable field',()=>{
  const s='newweapon "W"\nrange 5\ndmg 8\nplugin_opaque 1\nrange 12\n';
  assert.equal(field(api.inspect(s,'c5m'),0,'range').editable,false);
  assert.equal(field(api.inspect(s,'c5m'),0,'dmg').editable,true);
});
test('malformed duplicate commands also disable earlier ambiguous fields',()=>{
  for(const middle of ['', 'plugin_opaque 1\n']){
    const s='newweapon "W"\nrange 5\n'+middle+'range "unterminated\n';
    assert.equal(field(api.inspect(s,'c5m'),0,'range').editable,false);
  }
});
test('non-ASCII argument separators and noninitial BOM are not normalized',()=>{
  const s='newspell "S"\npath 3\nlevel 1\nweapon 8\u00a0"X"\n';
  assert.equal(field(api.inspect(s),0,'weaponDamage').editable,false);
  const b=api.inspect('newweapon "W"\n\uFEFFrange 5\n','c5m');assert.equal(field(b,0,'range').editable,false);
});
test('UTF-8 byte limits, NUL and gross reference overflow are checked',()=>{
  const s=api.starter();
  assert.throws(()=>api.patch(s,'c5se',1,{weaponRef:'"'+('é'.repeat(32))+'"'}),/63-byte/);
  assert.throws(()=>api.patch(s,'c5se',1,{weaponRef:'"A\0B"'}),/NUL/);
  assert.throws(()=>api.patch(s,'c5se',1,{weaponRef:'2147483648'}),/32-bit/);
  assert.equal(api.inspect('newspell "'+('é'.repeat(24))+'"\npath 3\nlevel 1\nweapon 8 54\n').blocks[0].headerSafe,false);
});
test('weapon numeric checks bound storage, not legal game meaning',()=>{
  const s=api.starter();assert.throws(()=>api.patch(s,'c5se',0,{range:'4294967296'}),/4-byte/);
  assert.throws(()=>api.patch(s,'c5se',0,{dmg:'18446744073709551616'}),/8-byte/);
});
test('verified local metadata excerpts retain unrelated native flags',()=>{
  const fs=require('node:fs'),path=require('node:path');
  const crab=fs.readFileSync(path.join(__dirname,'../examples/crab-brine-surge.c5m'),'utf8');
  const m=api.inspect(crab,'c5m');assert.equal(field(m,0,'dmgtype').value,'2');assert.equal(field(m,0,'flylook').value,'197');
  assert.equal(api.patch(crab,'c5m',0,{flylook:'17'}).text,crab.replace('flylook 197','flylook 17'));
  const abyss=api.inspect(fs.readFileSync(path.join(__dirname,'../examples/abyss-crown-judgment.c5m'),'utf8'),'c5m');assert.equal(field(abyss,0,'dmg').value,'0');assert.equal(field(abyss,0,'look').value,'51');
});

test('missing spell level is opt-in and inserts after the header in either format',()=>{
  for(const mode of ['c5m','c5se']){
    const prefix=mode==='c5m'?'#!@':'';
    const s=`${prefix}newspell "S"\n# keep this comment\n${prefix}path 3\n${prefix}weapon 8 54\n`;
    const m=api.inspect(s,mode);assert.equal(field(m,0,'level').editable,false);assert.equal(field(m,0,'level').addable,true);
    assert.equal(api.patch(s,mode,0,{}).text,s);assert.equal(api.patch(s,mode,0,{level:''}).text,s);
    const result=api.patch(s,mode,0,{level:'2'}),at=m.blocks[0].header.end;
    assert.equal(result.text,s.slice(0,at)+prefix+'level 2\n'+s.slice(at));
    assert.equal(result.changes[0].kind,'insert');assert.equal(result.changes[0].start,result.changes[0].end);
    assert.equal(field(api.inspect(result.text,mode),0,'level').editable,true);
    assert.ok(!api.inspect(result.text,mode).diagnostics.some(d=>/No explicit level/.test(d.message)));
  }
});
test('level insertion retains BOM, indentation, prefix spacing, mixed EOLs and no final newline',()=>{
  const s='\uFEFF\t #!@  newspell "S" # untouched header\r\n# comment\r#!@path\t3\n#!@weapon 8 54';
  const result=api.patch(s,'c5m',0,{level:'3'}),at=s.indexOf('\r\n')+2;
  assert.equal(result.text,s.slice(0,at)+'\t #!@  level 3\r\n'+s.slice(at));
  assert.equal(result.text.slice(0,at)+result.text.slice(at+result.changes[0].after.length),s);
  assert.equal(result.text.endsWith('\n'),false);
});
test('level insertion and existing token edits share an atomic original-span patch',()=>{
  const s='newspell "S"\rpath\t3 # path\nweapon 8 54';
  assert.equal(api.patch(s,'c5se',0,{path:'4',level:'2',weaponDamage:'9'}).text,'newspell "S"\rlevel 2\rpath\t4 # path\nweapon 9 54');
  assert.throws(()=>api.patch(s,'c5se',0,{path:'4',level:'4'}),/1, 2 or 3/);
  assert.equal(api.inspect(s).text,s);
});
test('unsafe, opaque, incomplete or more complex spell blocks cannot add a level',()=>{
  const blocks=[
    'newspell "S"\npath 3\nweapon 8 54\nplugin_opaque 1\n',
    'newspell "S"\npath 3\nweapon 8 54\nslowcast\n',
    'newspell "S"\npath 3\npath 4\nweapon 8 54\n',
    'newspell "S"\npath 3 extra\nweapon 8 54\n',
    'newspell "S"\npath 3\nweapon 8\n',
    'newspell "S"\npath 3\n',
    'newspell "S"\npath 3\nweapon 8 54\nlevel "unterminated\n',
    'newspell "S # unsafe"\npath 3\nweapon 8 54\n',
    'newspell "S"\npath 3\nweapon -9223372036854775809 54\n'
  ];
  for(const s of blocks){assert.ok(!field(api.inspect(s),0,'level').addable);assert.throws(()=>api.patch(s,'c5se',0,{level:'2'}));}
  const c5m='#!@newspell "S"\npath 3\n#!@weapon 8 54\n';assert.ok(!field(api.inspect(c5m,'c5m'),0,'level').addable);
  assert.throws(()=>api.patch(c5m,'c5m',0,{level:'2'}));
});
test('missing native fields and other spell fields remain read only',()=>{
  assert.throws(()=>api.patch('newweapon "W"\ndmg 8\n','c5m',0,{range:'5'}),/Not explicitly/);
  assert.throws(()=>api.patch('newspell "S"\nlevel 1\nweapon 8 54\n','c5se',0,{path:'3'}),/Not explicitly/);
});
test('commented levels are retained and insertion is never inferred across a definition boundary',()=>{
  const s='newspell "S"\n#!@level 3\npath 3\nweapon 8 54';
  assert.equal(api.patch(s,'c5se',0,{level:'2'}).text,'newspell "S"\nlevel 2\n#!@level 3\npath 3\nweapon 8 54');
  const boundary='newspell "S"\npath 3\nnewmonster "M"\nweapon 8 54';
  assert.ok(!field(api.inspect(boundary),0,'level').addable);
});
test('shipped incomplete example becomes source-complete after an explicit level insertion',()=>{
  const fs=require('node:fs'),path=require('node:path'),s=fs.readFileSync(path.join(__dirname,'../examples/missing-level.c5se'),'utf8');
  const m=api.inspect(s);assert.equal(field(m,0,'level').addable,true);assert.ok(m.diagnostics.some(d=>/No explicit level/.test(d.message)));
  const result=api.patch(s,'c5se',0,{level:'2'});assert.ok(!api.inspect(result.text).diagnostics.some(d=>d.severity==='error'));
  assert.equal(result.text.replace('level 2\n',''),s);
});
