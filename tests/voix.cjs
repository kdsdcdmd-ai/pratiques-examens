const fs=require('fs'),path=require('path'),assert=require('assert'),{boot}=require('./boot.cjs');
const root=path.resolve(__dirname,'..'),data=JSON.parse(fs.readFileSync(path.join(root,'contenus/mirka-sciences-chapitre-1-2026.json'))),engine=fs.readFileSync(path.join(root,'MASTER/application.js'),'utf8');
const a=boot('<script>window.REVISION_DATA='+JSON.stringify(data).replace(/</g,'\\u003c')+';'+engine+'</script>');
a.run(`window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};window.speechSynthesis={voices:[{voiceURI:'qc',name:'Voix Québec',lang:'fr-CA'},{voiceURI:'fr',name:'Voix France',lang:'fr-FR'}],getVoices(){return this.voices},speak(u){this.last=u},cancel(){}};setupVoiceChoice()`);
a.node('#reading-voice').value='fr';a.node('#reading-voice').onchange();
a.run("openLesson('modele')");a.node('#read-lesson').onclick();
assert.equal(a.run('window.speechSynthesis.last.voice.voiceURI'),'fr');assert.equal(a.run('window.speechSynthesis.last.rate'),0.70);
a.run("window.speechSynthesis.voices=window.speechSynthesis.voices.slice(0,1);stopReading()");a.node('#read-lesson').onclick();assert.equal(a.run('window.speechSynthesis.last.voice.voiceURI'),'qc');
assert.equal(a.storage.get('ma-revision:reading-voice-v2'),'fr');console.log('Choix de voix, mémorisation, débit lent et repli automatique vérifiés.');
