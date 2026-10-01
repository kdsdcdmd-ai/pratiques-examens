const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const bundle=JSON.parse(fs.readFileSync(path.join(root,'contenus/mirka-sciences-chapitre-1-2026.json'),'utf8'));
const passed=[];const check=(value,label)=>{assert(value,label);passed.push(label);};

function boot(){
 const app=fs.readFileSync(path.join(root,'MASTER/application.js'),'utf8');
 const nodes=new Map();let selected=null;
 class El{constructor(id=''){this.id=id;this.children=[];this.attrs={};this.handlers={};this.dataset={};this.classList={toggle(){}};this.hidden=false;this.textContent='';this._html='';this.value='';}set innerHTML(v){this._html=v;this.children=[];for(const m of v.matchAll(/\bid="([^"]+)"/g))nodes.set('#'+m[1],new El(m[1]));}get innerHTML(){return this._html;}append(...x){this.children.push(...x);}setAttribute(k,v){this.attrs[k]=v;}removeAttribute(k){delete this.attrs[k];}addEventListener(k,v){this.handlers[k]=v;}focus(){}querySelector(){return new El('heading');}click(){this.handlers.click?.({currentTarget:this});}}
 const get=k=>{if(k==='input[name=choice]:checked')return selected===null?null:{value:selected};if(!nodes.has(k))nodes.set(k,new El(k.slice(1)));return nodes.get(k);};
 const nav=['home','learn','quiz'].map(v=>{const e=new El(v);e.dataset.view=v;return e;}),sections=nav.map(x=>new El(x.id));
 const storage=new Map();const ctx={document:{querySelector:get,querySelectorAll:s=>s==='nav button'?nav:s==='main > section'?sections:[],createElement:()=>new El(),body:new El()},window:{scrollTo(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},structuredClone,console,setTimeout,Blob,URL,FileReader:class{}};
 vm.createContext(ctx);vm.runInContext('window.REVISION_DATA='+JSON.stringify(bundle).replace(/</g,'\\u003c')+';'+app,ctx);
 return {run:s=>vm.runInContext(s,ctx),node:get,select:v=>selected=v};
}

(async()=>{
 const {validateContent}=await import('../outils/valider-contenu.mjs');
 const validation=validateContent(bundle);check(validation.errors.length===0,'Structure valide');check(validation.warnings.length===0,'Aucun avertissement');
 check(bundle.questions.length===120,'120 questions');check(bundle.lessons.length===10,'10 leçons');
 check(bundle.questions.every(q=>q.responseType==='choice'&&q.type!=='multi-select'),'Choix de réponse seulement');
 check(bundle.questions.every(q=>q.o.length===4&&new Set(q.o).size===4),'Quatre choix distincts par question');
 check(bundle.questions.every(q=>q.a>=0&&q.a<4&&q.accepted.includes(q.o[q.a])),'Réponses valides');
 check(bundle.questions.every(q=>q.q===q.writtenPrompt),'Énoncés écrits complets');
 check(!bundle.questions.some(q=>/réponse à comparer|explique avec tes mots|écris (ta|ton|le|la|les|un|une)/i.test(q.q+' '+q.o.join(' '))),'Aucune réponse écrite demandée');
 check(!bundle.questions.some(q=>/dans le (cahier|problème)|selon la question|à la page/i.test(q.q)),'Aucune dépendance au cahier');
 check(new Set(bundle.questions.map(q=>q.q)).size===120,'Énoncés uniques');
 const paths=bundle.configuration.quizPaths,expected={simple:20,intermediaire:40,complet:60};
 for(const [id,count] of Object.entries(expected))check(paths[id].entries.length===count,`${count} questions ${id}`);
 const sets=Object.fromEntries(Object.entries(paths).map(([id,p])=>[id,new Set(p.entries.map(e=>e.questionId))]));
 for(const [a,b] of [['simple','intermediaire'],['simple','complet'],['intermediaire','complet']])check(![...sets[a]].some(id=>sets[b].has(id)),`Aucun doublon ${a}/${b}`);
 for(const [id,p] of Object.entries(paths))for(const objective of bundle.objectives)check(p.entries.some(e=>e.objectiveId===objective.id),`Objectif ${objective.id} dans ${id}`);
 const app=boot();app.run(`window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};window.speechSynthesis={queue:[],getVoices:()=>[{lang:'fr-CA'}],speak(u){this.queue.push(u);},cancel(){this.queue=[];}}`);
 for(const id of Object.keys(expected)){
  app.run(`state.session=null;state.pathId='${id}';startPath('practice')`);
  const q=app.run('questionAt(state.session,state.session.pos)');app.node('#read-question').onclick();
  check(app.run('activeReading.parts.length')===q.o.length+1,`Lecture question et choix ${id}`);app.node('#stop-reading').onclick();
  app.select(q.a);app.node('#question-form').onsubmit({preventDefault(){}});check(typeof app.node('#read-correction').onclick==='function',`Lecture correction ${id}`);
 }
 fs.writeFileSync(path.join(root,'tests/resultats-mirka.json'),JSON.stringify({passed:passed.length,checks:passed},null,2));
 console.log(passed.length+' contrôles Mirka réussis');
})().catch(e=>{console.error(e);process.exit(1);});
