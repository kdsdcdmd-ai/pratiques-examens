const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),os=require('os'),cp=require('child_process'),crypto=require('crypto');
const {boot}=require('./boot.cjs');
const root=path.resolve(__dirname,'..'),catalog=JSON.parse(fs.readFileSync(path.join(root,'bibliotheque.json'))),engine=fs.readFileSync(path.join(root,'MASTER/application.js'),'utf8');
let count=0;function check(v,label){assert(v,label);count++;}
(async()=>{
 const {validateContent}=await import('../outils/valider-contenu.mjs');
 const storage=new Map(),keys=[];
 for(const item of catalog.examens){
  const bundle=JSON.parse(fs.readFileSync(path.join(root,'contenus',item.id+'.json')));
  check(validateContent(bundle,{legacy:true}).errors.length===0,'Structure '+item.id);
  const html='<script>window.REVISION_DATA='+JSON.stringify(bundle).replace(/</g,'\\u003c')+';'+engine+'</script>';
  const a=boot(html,storage);keys.push(a.run('KEY'));
  a.run(`window.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};window.speechSynthesis={queue:[],getVoices:()=>[{lang:'fr-CA'}],speak(u){this.queue.push(u);},cancel(){this.queue=[];}}`);
  for(const lesson of bundle.lessons){
   a.run(`openLesson(${JSON.stringify(lesson.id)})`);a.node('#read-lesson').onclick();check(a.run('activeReading.parts.length')>0,'Audio leçon');
   a.run(`startLessonQuiz(${JSON.stringify(lesson.id)})`);check(a.nav.find(n=>n.id==='learn').attrs['aria-current']==='page','Questions sous Apprendre');
   a.node('#read-question').onclick();check(a.run('activeReading.parts.length')>0,'Audio question Apprendre');
   if(a.run('usesChoices(state.session,questionAt(state.session,state.session.pos))'))check(a.run('activeReading.parts.length')>1,'Audio choix Apprendre');
  }
  for(const q of bundle.questions){
   a.run(`state.session=null;beginSession([${JSON.stringify(q.id)}],'Test','practice')`);
   a.node('#read-question').onclick();check(a.run('activeReading.parts[0].length')>0,'Audio Quiz '+q.id);
   check(a.run('state.session.meta[0].hints')===0,'Lire sans pénalité '+q.id);
  }
  const b=boot(html,storage);check(b.run('state.session.ids[0]')===bundle.questions.at(-1).id,'Session conservée');
 }
 check(new Set(keys).size===catalog.examens.length,'Progressions séparées par examen');
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'test-ajout-'));
 try{
  fs.cpSync(path.join(root,'outils'),path.join(temp,'outils'),{recursive:true});fs.mkdirSync(path.join(temp,'contenus'));
  const empty='{"examens":[]}\n';fs.writeFileSync(path.join(temp,'bibliotheque.json'),empty);
  const sample=JSON.parse(fs.readFileSync(path.join(root,'contenus/mirka-sciences-chapitre-1-2026.json')));sample.configuration.examId='test-nouvel-examen';
  const input=path.join(temp,'nouveau.json');fs.writeFileSync(input,JSON.stringify(sample));
  const run=()=>cp.spawnSync(process.execPath,[path.join(temp,'outils/ajouter-examen.mjs'),input],{encoding:'utf8'});
  check(run().status===0,'Ajout sans accès au MASTER');
  const old=fs.readFileSync(path.join(temp,'contenus/test-nouvel-examen.json'),'utf8');
  check(run().status!==0,'Écrasement refusé');check(fs.readFileSync(path.join(temp,'contenus/test-nouvel-examen.json'),'utf8')===old,'Ancien contenu préservé');
  sample.configuration.examId='test-source-non-validee';sample.validationSource.verified=false;fs.writeFileSync(input,JSON.stringify(sample));check(run().status!==0,'Source non validée refusée');
  check(JSON.parse(fs.readFileSync(path.join(temp,'bibliotheque.json'))).examens.length===1,'Refus ne modifie pas index');
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
 // Test du chargement et des trois niveaux de bibliothèque, sans navigateur.
 const lib=fs.readFileSync(path.join(root,'bibliotheque.js'),'utf8');
 for(const query of ['', '?enfant=Mirka', '?enfant=Mirka&matiere=Sciences%20et%20technologie']){
  const nodes=new Map();function el(){return {children:[],append(...c){this.children.push(...c)},replaceChildren(...c){this.children=c},textContent:'',innerHTML:'',setAttribute(){}}}const get=id=>{if(!nodes.has(id))nodes.set(id,el());return nodes.get(id)};
  const context={document:{querySelector:get,getElementById:get,createElement:el},location:{search:query},URLSearchParams,fetch:async()=>({ok:true,json:async()=>catalog}),console};
  await vm.runInNewContext(lib,context);await new Promise(r=>setImmediate(r));check(get('#liste').children.length>0,'Navigation bibliothèque '+query);
 }
 const hashes={};for(const name of ['MASTER/application.js','MASTER/styles.css','MASTER/index.html','MASTER/charger.js','index.html','bibliotheque.js'])hashes[name]=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex');
 fs.writeFileSync(path.join(root,'MASTER.lock.json'),JSON.stringify({instruction:'Ne modifier que sur demande explicite « Modifier le MASTER ».',sha256:hashes},null,2)+'\n');
 console.log(count+' contrôles du système réussis');fs.writeFileSync(path.join(root,'tests/resultats-systeme.json'),JSON.stringify({checks:count,examens:catalog.examens.length,questions:229,browserTest:false,noAIRuntime:true},null,2)+'\n');
})().catch(e=>{console.error(e);process.exitCode=1});
