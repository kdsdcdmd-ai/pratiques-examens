const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
let passed=[];const check=(condition,label)=>{assert(condition,label);passed.push(label);};
const root=path.resolve(__dirname,'..');
function boot(html,storage=new Map(),blocked=false){const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];let nodes=new Map(),selected=null,active=null;
class El{constructor(id=''){this.id=id;this.children=[];this.attrs={};this.handlers={};this.dataset={};this.classList={toggle(){}};this.hidden=false;this.textContent='';this._html='';this.value='';}set innerHTML(v){this._html=v;this.children=[];for(const m of v.matchAll(/\bid="([^"]+)"/g))nodes.set('#'+m[1],new El(m[1]));}get innerHTML(){return this._html;}append(...children){this.children.push(...children);}setAttribute(k,v){this.attrs[k]=v;}removeAttribute(k){delete this.attrs[k];}addEventListener(k,v){this.handlers[k]=v;}focus(){active=this.id;}querySelector(){return new El('heading');}click(){this.handlers.click?.({currentTarget:this});}}
function get(k){if(k==='input[name=choice]:checked')return selected===null?null:{value:selected};if(!nodes.has(k))nodes.set(k,new El(k.slice(1)));return nodes.get(k);}
const nav=['home','learn','quiz'].map(v=>{const e=new El(v);e.dataset.view=v;return e;}),sections=nav.map(x=>new El(x.id));
const ctx={document:{querySelector:get,querySelectorAll:s=>s==='nav button'?nav:s==='main > section'?sections:[],createElement:()=>new El(),body:new El()},window:{scrollTo(){}},localStorage:{getItem(k){if(blocked)throw Error('blocked');return storage.get(k)||null;},setItem(k,v){if(blocked)throw Error('blocked');storage.set(k,v);}},structuredClone,console,setTimeout,Blob,URL,FileReader:class{readAsText(f){this.result=f.text;this.onload();}}};vm.createContext(ctx);vm.runInContext(script,ctx);
return {run:s=>vm.runInContext(s,ctx),node:get,nav,sections,storage,ctx,select:v=>selected=v,focus:()=>active};}
(async()=>{
 const {validateContent}=await import('../outils/valider-contenu.mjs');
 const compile=()=>{const bundle=JSON.parse(fs.readFileSync(path.join(root,'contenus/mirka-sciences-chapitre-1-2026.json'),'utf8'));return {bundle,result:validateContent(bundle),html:'<script>window.REVISION_DATA='+JSON.stringify(bundle).replace(/</g,'\\u003c')+';'+fs.readFileSync(path.join(root,'MASTER/application.js'),'utf8')+'</script>'};};
 const c=compile(path.join(root,'revisions/mirka-sciences-chapitre-1-2026'));
 check(c.result.errors.length===0,'Structure valide');
 check(c.bundle.questions.length===60&&c.bundle.lessons.length===10,'60 questions et 10 leçons');
 for(const [key,n] of [['simple',20],['intermediaire',40],['complet',60]])check(c.bundle.configuration.quizPaths[key].entries.length===n,'Taille '+key);
 let a=boot(c.html);
 a.run(`window.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};window.speechSynthesis={queue:[],getVoices:()=>[{lang:'fr-CA'}],speak(u){this.queue.push(u);},cancel(){this.queue=[];}}`);
 for(const l of c.bundle.lessons){
  a.run(`openLesson('${l.id}')`);check(a.node('#learn').innerHTML.includes('read-lesson'),'Bouton audio leçon '+l.id);a.node('#read-lesson').onclick();
  check(a.run('window.speechSynthesis.queue[0].lang')==='fr-CA','Voix française '+l.id);a.node('#stop-lesson').onclick();check(a.run('activeReading===null'),'Arrêt leçon '+l.id);
  a.run(`startLessonQuiz('${l.id}')`);check(a.run('state.session.mode')==='practice','Mini-quiz structuré '+l.id);check(a.nav.find(n=>n.id==='learn').attrs['aria-current']==='page','Mini-quiz sous Apprendre '+l.id);
 }
 a.run("state.session=null;state.pathId='complet';startPath('practice')");
 for(let i=0;i<60;i++){
  const q=a.run('questionAt(state.session,state.session.pos)');
  a.node('#read-question').onclick();const parts=a.run('activeReading.parts');
  check(parts.length>=1&&parts[0].length>0,'Audio énoncé '+q.id);
  check(a.run('state.session.meta[state.session.pos].hints')===0,'Audio sans pénalité '+q.id);
  if(q.responseType==='choice'&&q.type!=='multi-select')check(parts.length===q.o.length+1,'Audio choix '+q.id);
  a.node('#stop-reading').onclick();
  if(q.responseType==='development'){
   a.node('#development-answer').value='Mon raisonnement personnel';a.node('#development-answer').oninput({target:{value:'Mon raisonnement personnel'}});
   a.node('#compare-development').onclick();check(a.node('#quiz').innerHTML.includes(q.rubric[0]),'Grille révélée '+q.id);
   q.rubric.forEach((_,n)=>{a.node('#rubric-'+n).checked=true;a.node('#rubric-'+n).onchange();});
   a.node('#development-actions').children[0].click();check(a.run('state.session.meta[state.session.pos].selfReview')==='complete','Autoévaluation '+q.id);
  }else if(q.responseType==='number'){
   const value=String(q.numericAnswer.value).replace('.',',')+' '+(q.numericAnswer.units[0]||'');
   a.node('#written-answer').value=value;a.node('#written-answer').oninput({target:{value}});a.node('#question-form').onsubmit({preventDefault(){}});
  }else if(q.type==='multi-select'){
   for(const o of q.multiSelect.options)a.node('#multi-'+o.id).checked=q.multiSelect.correctIds.includes(o.id);
   a.node('#question-form').onsubmit({preventDefault(){}});
  }else{a.select(q.a);a.node('#question-form').onsubmit({preventDefault(){}});}
  check(a.run('state.session.choices.length===state.session.pos+1'),'Réponse enregistrée '+q.id);
  a.run('state.session.pos++;save();renderQuiz()');
 }
 check(a.run('counts(state.history[0]).alone')===48,'48 réponses automatiques justes');
 check(a.run('counts(state.history[0]).development')===12,'12 développements hors score');
 check(a.run('counts(state.history[0]).review')===0,'Développements non classés comme erreurs au score');
 check(a.run('state.history[0].rows.filter(r=>r.meta.development).every(r=>r.meta.developmentText===\'Mon raisonnement personnel\')'),'Réponses développées conservées dans historique');
 let b=boot(c.html,a.storage);check(b.run('state.history[0].rows.filter(r=>r.meta.development).every(r=>r.meta.selfReview===\'complete\')'),'Autoévaluations conservées après rechargement');
 b.run("state.session=null;beginSession(['calcul-eau'],'Test','practice')");
 b.node('#written-answer').value='18,0';b.node('#written-answer').oninput({target:{value:'18,0'}});b=boot(c.html,b.storage);b.run("show('quiz')");check(b.node('#written-answer').value==='18,0','Brouillon calcul conservé');
 check(b.run("assessNumber(QUESTIONS['calcul-eau'],'18,02 u')")==='correct','Virgule + unité acceptées');
 check(b.run("assessNumber(QUESTIONS['calcul-eau'],'18,02 g')")==='unknown','Mauvaise unité non acceptée');
 check(b.run("assessNumber(QUESTIONS['calcul-eau'],'19 u')")==='wrong','Erreur calcul reconnue');
 b.run("state.session=null;beginSession(['raisonnement-30'],'Test','practice')");b.node('#development-answer').oninput({target:{value:'12 + 2 + 16'}});b=boot(c.html,b.storage);b.run("show('quiz')");check(b.run('state.session.meta[0].developmentText')==='12 + 2 + 16','Brouillon développement conservé');
 check(b.run("spokenText('H₂O et H₂O₂')")==='H indice deux, O et H indice deux, O indice deux','Formules prononcées sans chevauchement');
 check(b.run("spokenText('Un modèle est une représentation.')")==='Un modèle est une représentation.','Prononciation ne déforme pas les mots');
 check(b.run("spokenText('18,02 u')").includes('unités de masse atomique'),'Unité lue');
 check(b.run("restore({examId:'sciences-organisation-matiere',version:3})")===false,'Progression Cédric isolée');
 fs.mkdirSync(path.join(root,'tests'),{recursive:true});fs.writeFileSync(path.join(root,'tests/resultats-mirka.json'),JSON.stringify({passed:passed.length,checks:passed,browser:'Ouverture du fichier local refusée par la politique du navigateur. Aucun contrôle navigateur ni écoute réelle revendiqué.'},null,2));console.log(passed.length+' contrôles Mirka réussis');
})().catch(e=>{console.error(e);process.exit(1);});
