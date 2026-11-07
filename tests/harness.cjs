const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const api=require('../core.js'),references=require('../reference.js'),root=path.join(__dirname,'..');
function harness(options={}){
  const ids=new Map(),blobs=new Map(),downloads=[],windowListeners={};
  class Element{
    constructor(tag){this.tagName=tag;this.children=[];this.listeners={};this.attributes={};this._value='';this._text='';this.disabled=false;this.hidden=false;this.open=false;this.classes=new Set();this.classList={toggle:(name,on)=>on?this.classes.add(name):this.classes.delete(name)};}
    set id(value){this._id=value;ids.set(value,this);}get id(){return this._id;}
    set textContent(value){this._text=String(value);this.children=[];}get textContent(){return this._text+this.children.map(x=>x.textContent||'').join('');}
    set value(value){this._value=this.tagName==='textarea'?String(value).replace(/\r\n?/g,'\n'):String(value);}get value(){return this._value;}
    append(...children){this.children.push(...children);}replaceChildren(...children){this.children=children;this._text='';}
    setAttribute(k,v){this.attributes[k]=String(v);}getAttribute(k){return this.attributes[k];}addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}
    async emit(k,extra={}){const event={target:this,preventDefault(){},...extra};for(const fn of this.listeners[k]||[])await fn(event);}
    focus(){document.activeElement=this;}showModal(){this.open=true;}close(){this.open=false;}remove(){}
    click(){if(this.disabled)return;if(this.tagName==='a')downloads.push({filename:this.download,blob:blobs.get(this.href)});return this.emit('click');}
  }
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  for(const match of html.matchAll(/<([a-z][a-z0-9]*)\b[^>]*\bid="([^"]+)"[^>]*>/g)){
    const e=new Element(match[1]);e.id=match[2];for(const attr of match[0].matchAll(/([a-z-]+)="([^"]*)"/g))e.setAttribute(attr[1],attr[2]);
    e.hidden=/\shidden(?=\s|>)/.test(match[0]);e.open=/\sopen(?=\s|>)/.test(match[0]);
  }
  const document={getElementById:id=>ids.get(id),createElement:tag=>new Element(tag),body:new Element('body')};
  const window={CoeDamage:require('../damage-types.js'),CoeWorkbench:api,CoeTarget:require('../target.js'),CoeCreation:require('../creation.js'),CoeReturn:require('../return-values.js'),CoeChoices:require('../choices.js'),CoeReference:references,CoeDataImport:options.dataImporter||require('../data-import.js'),CoeDesktop:options.desktop,confirm:()=>true,crypto:require('node:crypto').webcrypto,addEventListener:(k,fn)=>{(windowListeners[k]??=[]).push(fn);}};
  window.CoeMelee=require('../melee.js');window.CoeOriginal=require('../original-records.js');window.CoeSourceOverview=require('../source-overview.js');
  const context={window,document,TextEncoder,TextDecoder,Blob,URL:{createObjectURL(blob){const id='blob:'+blobs.size;blobs.set(id,blob);return id;},revokeObjectURL(){}},setTimeout:fn=>fn()};
  vm.runInNewContext(fs.readFileSync(path.join(root,'damage-ui.js'),'utf8'),context,{filename:'damage-ui.js'});
  vm.runInNewContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context,{filename:'app.js'});
  vm.runInNewContext(fs.readFileSync(path.join(root,'creation-ui.js'),'utf8'),context,{filename:'creation-ui.js'});
  vm.runInNewContext(fs.readFileSync(path.join(root,'isolated-test-ui.js'),'utf8'),context,{filename:'isolated-test-ui.js'});
  vm.runInNewContext(fs.readFileSync(path.join(root,'return-values-ui.js'),'utf8'),context,{filename:'return-values-ui.js'});
  vm.runInNewContext(fs.readFileSync(path.join(root,'choices-ui.js'),'utf8'),context,{filename:'choices-ui.js'});
  // Existing edit tests begin with the user choosing the real example action.
  // New first-use tests set example:false to exercise the untouched startup state.
  if(options.example!==false)void ids.get('exampleButton').emit('click');
  if(options.references)vm.runInNewContext(fs.readFileSync(path.join(root,'reference-ui.js'),'utf8'),context,{filename:'reference-ui.js'});
  return {$:id=>ids.get(id),downloads,document,window,html,ready:Promise.all([window.CoeReferenceReady,window.CoeChoiceReady]),
    async emitWindow(type,event){for(const fn of windowListeners[type]||[])await fn({preventDefault(){},...event});}};
}
module.exports={harness};
