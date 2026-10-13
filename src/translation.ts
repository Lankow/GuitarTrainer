import { polish } from './polish.ts';
import { spanish } from './spanish.ts';
import type { Options } from './optionsSchema.ts';
export function translate(language:Options['language'],key:string,...values:unknown[]):string {
 const dictionary=language==='pl'?polish:language==='es'?spanish:undefined;
 if(dictionary && !dictionary[key]) {
   if(key.startsWith('Invalid settings section: ')) return translate(language,'Invalid settings section: {0}.',key.slice(26).replace(/\.$/,''));
 }
 const text=dictionary?(dictionary[key]??dictionary[key.trim()]??key):key;
 return text.replace(/\{(\d+)\}/g,(_,i)=>String(values[Number(i)]??''));
}
