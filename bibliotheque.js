'use strict';
(async()=>{
 const list=document.querySelector('#liste'),status=document.querySelector('#statut'),crumb=document.querySelector('#chemin');
 const link=(label,url)=>{const a=document.createElement('a');a.href=url;a.textContent=label;a.className='radio';return a;};
 try{
  const response=await fetch('bibliotheque.json',{cache:'no-cache'});if(!response.ok)throw Error('La bibliothèque est indisponible. Réessaie dans un instant.');
  const {examens}=await response.json(),params=new URLSearchParams(location.search),child=params.get('enfant'),subject=params.get('matiere');
  crumb.append(link('Accueil','index.html'));
  if(!child){for(const name of [...new Set(examens.map(e=>e.enfant))])list.append(link(name,'?enfant='+encodeURIComponent(name)));}
  else{
   crumb.append(link(child,'?enfant='+encodeURIComponent(child)));
   if(!subject){document.querySelector('#titre').textContent=child+' — Choisir une matière';for(const name of [...new Set(examens.filter(e=>e.enfant===child).map(e=>e.matiere))])list.append(link(name,'?enfant='+encodeURIComponent(child)+'&matiere='+encodeURIComponent(name)));}
   else{document.querySelector('#titre').textContent=child+' — '+subject;for(const exam of examens.filter(e=>e.enfant===child&&e.matiere===subject))list.append(link(exam.titre,'MASTER/index.html?examen='+encodeURIComponent(exam.id)));}
  }
  status.textContent=list.children.length?'':'Aucune pratique dans cette catégorie.';
 }catch(e){status.textContent=e.message;}
})();
