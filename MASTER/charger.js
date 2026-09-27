'use strict';
(async()=>{
 try{
  const id=new URLSearchParams(location.search).get('examen');
  if(!id||!/^[a-z0-9][a-z0-9._-]*$/.test(id))throw Error('Choisis une pratique dans la bibliothèque.');
  const catalogue=await fetch('../bibliotheque.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Bibliothèque indisponible.');return r.json();});
  const item=catalogue.examens.find(e=>e.id===id);
  if(!item)throw Error('Cette pratique ne figure pas dans la bibliothèque.');
  const response=await fetch('../contenus/'+encodeURIComponent(id)+'.json',{cache:'no-cache'});
  if(!response.ok)throw Error('Cette pratique ne peut pas être chargée pour le moment.');
  const data=await response.json();
  if(data.configuration?.examId!==id||!data.lessons?.length||!data.questions?.length)throw Error('Le contenu de cette pratique est invalide.');
  window.REVISION_DATA=data;
  document.title='Ma révision — '+data.configuration.title;
  document.querySelector('.brand small').textContent=data.configuration.title;
  const script=document.createElement('script');script.src='application.js?v=lecture-6';script.onerror=()=>failure('Le moteur ne peut pas être chargé. Réessaie depuis la bibliothèque.');document.body.append(script);
 }catch(error){failure(error.message);}
 function failure(message){const section=document.querySelector('#home');section.replaceChildren();const box=document.createElement('div');box.className='panel';const p=document.createElement('p');p.textContent=message;const a=document.createElement('a');a.href='../index.html';a.textContent='Retour à la bibliothèque';box.append(p,a);section.append(box);}
})();
