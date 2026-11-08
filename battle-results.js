/* Recorded state only. No log parsing, hit inference, engine calls or draft changes. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.CoeBattleResults=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const integer=n=>Number.isInteger(n)&&n>=-2147483648&&n<=2147483647;
  function model(input){
    if(!input||!Array.isArray(input.units)||!input.units.length||input.units.length>200||
        ![0,1].includes(input.battleReturns)||typeof input.closed!=='boolean'||typeof input.restored!=='boolean'||
        !(input.element==null||['fire','cold','shock'].includes(input.element)))throw Error('Recorded battle state is incomplete.');
    const seen=new Set(),counts={lower:0,higher:0,unchanged:0,unknown:0};
    const units=input.units.map(u=>{
      if(!u||!Number.isInteger(u.unit)||u.unit<0||u.unit>=99000||seen.has(u.unit)||
          !Number.isInteger(u.monster)||u.monster<0||u.monster>=2000||typeof u.name!=='string'||!u.name.trim()||
          !integer(u.beforeHp)||!(u.afterHp===null||integer(u.afterHp))||
          !(u.resistance===null||integer(u.resistance))||!input.element&&u.resistance!==null)
        throw Error('Recorded defender identity or state is incomplete.');
      seen.add(u.unit);
      const delta=u.afterHp===null?null:u.afterHp-u.beforeHp;
      const change=delta===null?'unknown':delta<0?'lower':delta>0?'higher':'unchanged';counts[change]++;
      // Deliberately select only fields supported by the bound receipt. Extra
      // position/hit/damage properties are not an observation contract.
      return {unit:u.unit,monster:u.monster,name:u.name,beforeHp:u.beforeHp,afterHp:u.afterHp,
        resistance:u.resistance,delta,change,hit:null,attackPosition:null,weaponDamage:null};
    });
    return {units,counts,types:new Set(units.map(u=>u.monster)).size,element:input.element||null,
      battleReturns:input.battleReturns,closed:input.closed,restored:input.restored};
  }
  function render(container,input,doc,prefix){
    container.replaceChildren();const m=model(input),node=(tag,text)=>{const e=doc.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
    const summary=node('p');summary.className='battle-state-summary';summary.id=prefix+'Summary';
    const changes=Object.entries(m.counts).filter(([,n])=>n).map(([key,n])=>n+' '+({lower:'lower HP',higher:'higher HP',unchanged:'unchanged HP',unknown:'after-HP unknown'})[key]);
    summary.textContent=m.units.length+' defender'+(m.units.length===1?'':'s')+' · '+m.types+' type'+(m.types===1?'':'s')+' · '+changes.join(' · ');
    const state=node('p',m.battleReturns+' battle call'+(m.battleReturns===1?'':'s')+' returned · Field '+(m.closed?'closed':'closure unverified')+' · Records '+(m.restored?'restored':'restoration unverified'));
    state.className='caption';state.id=prefix+'State';
    const scroll=node('div');scroll.className='battle-state-scroll';scroll.setAttribute('tabindex','0');scroll.setAttribute('role','region');scroll.setAttribute('aria-label','Recorded defenders; scroll for more units');
    const table=node('table');table.className='battle-state-table';
    const caption=node('caption','Saved helper readings · isolated CoE5SE / local roster-v1');
    caption.className='sr-only';
    table.append(caption);const head=node('thead'),labels=node('tr');
    for(const label of ['Defender','HP before → after','Net HP change',...(m.element?[m.element[0].toUpperCase()+m.element.slice(1)+' resistance before']:[])]){
      const cell=node('th',label);cell.setAttribute('scope','col');labels.append(cell);
    }
    head.append(labels);const body=node('tbody');body.id=prefix+'Rows';
    for(const u of m.units){
      const row=node('tr'),name=node('th',u.name+' #'+u.monster+' · unit #'+u.unit);name.setAttribute('scope','row');
      row.append(name,node('td',u.beforeHp+' → '+(u.afterHp===null?'Not recorded':u.afterHp)),node('td',u.delta===null?'Unknown':(u.delta>0?'+':'')+u.delta));
      if(m.element)row.append(node('td',u.resistance===null?'Unknown':u.resistance+'%'));
      body.append(row);
    }
    table.append(head,body);scroll.append(table);
    const unknown=node('p','Hits by the tested weapon: unknown. Attack-time positions and damage attributed to that weapon were not recorded.');unknown.className='caption battle-state-unknown';unknown.id=prefix+'Unknown';
    const limits=node('p','Net HP change includes all causes; unchanged HP does not rule out a hit. Instance IDs belong only to this battle and may be reused.');limits.className='caption';
    container.append(summary,state,unknown,scroll,limits);return m;
  }
  return {model,render};
});
