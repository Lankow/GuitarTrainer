import { polish } from './polish.ts';
export function translate(language:'en'|'pl',key:string,...values:unknown[]):string {
 if(language==='pl' && !polish[key]) {
   if(key.startsWith('Invalid settings section: ')) return 'Niepoprawna sekcja ustawień: '+key.slice(26);
 }
 const text=language==='pl'?(polish[key]??polish[key.trim()]??key):key;
 return text.replace(/\{(\d+)\}/g,(_,i)=>String(values[Number(i)]??''));
}
