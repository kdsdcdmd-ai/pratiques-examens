const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
let passed=[];const check=(condition,label)=>{assert(condition,label);passed.push(label);};
const root=path.resolve(__dirname,'..');
function boot(html,storage=new Map(),blocked=false){const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];let nodes=new Map(),selected=null,active=null;
class El{constructor(id=''){this.id=id;this.children=[];this.attrs={};this.handlers={};this.dataset={};this.classList={toggle(){}};this.hidden=false;this.textContent='';this._html='';this.value='';}set innerHTML(v){this._html=v;this.children=[];for(const m of v.matchAll(/\bid="([^"]+)"/g))nodes.set('#'+m[1],new El(m[1]));}get innerHTML(){return this._html;}append(...children){this.children.push(...children);}setAttribute(k,v){this.attrs[k]=v;}removeAttribute(k){delete this.attrs[k];}addEventListener(k,v){this.handlers[k]=v;}focus(){active=this.id;}querySelector(){return new El('heading');}click(){this.handlers.click?.({currentTarget:this});}}
function get(k){if(k==='input[name=choice]:checked')return selected===null?null:{value:selected};if(!nodes.has(k))nodes.set(k,new El(k.slice(1)));return nodes.get(k);}
const nav=['home','learn','quiz'].map(v=>{const e=new El(v);e.dataset.view=v;return e;}),sections=nav.map(x=>new El(x.id));
const ctx={document:{querySelector:get,querySelectorAll:s=>s==='nav button'?nav:s==='main > section'?sections:[],createElement:()=>new El(),body:new El()},window:{scrollTo(){}},localStorage:{getItem(k){if(blocked)throw Error('blocked');return storage.get(k)||null;},setItem(k,v){if(blocked)throw Error('blocked');storage.set(k,v);}},structuredClone,console,setTimeout,Blob,URL,FileReader:class{readAsText(f){this.result=f.text;this.onload();}}};vm.createContext(ctx);vm.runInContext(script,ctx);
return {run:s=>vm.runInContext(s,ctx),node:get,nav,sections,storage,ctx,select:v=>selected=v,focus:()=>active};}

module.exports={boot};
