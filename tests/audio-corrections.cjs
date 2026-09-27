const fs=require('fs'),path=require('path'),assert=require('assert');
const {boot}=require('./boot.cjs'),root=path.resolve(__dirname,'..');
let checks=0;
for(const file of fs.readdirSync(path.join(root,'contenus'))){
 const data=JSON.parse(fs.readFileSync(path.join(root,'contenus',file)));
 const html='<script>window.REVISION_DATA='+JSON.stringify(data).replace(/</g,'\\u003c')+';'+fs.readFileSync(path.join(root,'MASTER/application.js'),'utf8')+'</script>';
 const a=boot(html);
 a.run(`window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};window.speechSynthesis={speak(){},cancel(){},getVoices:()=>[]}`);
 for(const q of data.questions){
  a.run(`state.session=null;beginSession([${JSON.stringify(q.id)}],'Test','practice')`);
  assert(!a.node('#quiz').innerHTML.includes('read-correction'));checks++;
  if(q.responseType==='development')a.node('#paper-development').onclick();else a.run('finishChoice(questionAt(state.session,0).a)');
  assert(a.node('#feedback').innerHTML.includes('read-correction'));checks++;
  const before=a.run('JSON.stringify(state)');a.node('#read-correction').onclick();
  assert(a.run('activeReading.parts.length')>=2);assert(a.run('JSON.stringify(state)')===before);checks+=2;
  assert(a.run('activeReading.parts.join(" ")').includes(a.run('spokenText(plainSpeech(questionAt(state.session,0).e))')));checks++;
  a.node('#read-question').onclick();assert(a.run('activeReading.start')===a.node('#read-question'));checks++;
  a.node('#stop-reading').onclick();assert(a.run('activeReading')===null);checks++;
  if(q.responseType!=='development'){
   a.run(`state.session=null;beginSession([${JSON.stringify(q.id)}],'Test','practice');skipToExplanation()`);
   a.node('#read-correction').onclick();assert(a.run('activeReading.parts[0]').startsWith('Réponse attendue'));checks++;
  }
 }
}
console.log(checks+' contrôles audio des corrections réussis');
