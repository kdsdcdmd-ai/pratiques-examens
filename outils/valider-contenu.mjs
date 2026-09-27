import {mkdtempSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validate} from './validation.mjs';
export function validateContent(bundle,{legacy=false}={}){
 const folder=mkdtempSync(join(tmpdir(),'revision-validation-'));
 try{
  const data=structuredClone(bundle);data.resources={};
  for(const [id,markup] of Object.entries(data.assets||{})){
   if(!/^[a-z0-9][a-z0-9._-]*$/.test(id)||typeof markup!=='string')throw Error('Ressource invalide : '+id);
   if(/(?:src|href)\s*=\s*["'](?!data:|#)/i.test(markup))throw Error('Les illustrations doivent être autonomes : '+id);
   const filename=id+'.html';writeFileSync(join(folder,filename),markup);data.resources[id]={path:filename,kind:'html'};
  }
  const r=validate(bundle.configuration,data,folder);
  if(!bundle.configuration.enfant||!bundle.configuration.chapitre)r.errors.push('Enfant ou chapitre absent.');
  if(!legacy){
   if(!bundle.validationSource?.verified||!bundle.validationSource?.date||!bundle.validationSource?.note)r.errors.push('Validation humaine des sources requise avant publication.');
   if(!r.coverage.summary.complete)r.errors.push('Couverture incomplète ou source non confirmée : ne pas publier avant résolution.');
  }
  return r;
 }finally{rmSync(folder,{recursive:true,force:true});}
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const file=resolve(process.argv[2]||'');const r=validateContent(JSON.parse(readFileSync(file,'utf8')),{legacy:process.argv.includes('--historique')});
 console.log(JSON.stringify({errors:r.errors,warnings:r.warnings,coverage:r.coverage.summary},null,2));if(r.errors.length)process.exitCode=1;
}
