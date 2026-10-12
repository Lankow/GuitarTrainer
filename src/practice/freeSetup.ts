import { TUNINGS } from '../audio/tunings.ts';
import { SCALES } from './scales.ts';
export type FreeSetup={tuning:string;selected:number[];root:number;scale:string;count:number;order:'random'|'ascending';repetitions:number};
export const FREE_DEFAULTS:FreeSetup={tuning:'standard',selected:[40,45,50,55,59,64],root:0,scale:'major',count:20,order:'random',repetitions:3};
export function validFree(v:unknown):v is FreeSetup{if(!v||typeof v!=='object')return false;const s=v as FreeSetup;const t=TUNINGS.find(t=>t.id===s.tuning);return !!t&&Array.isArray(s.selected)&&s.selected.length<=6&&s.selected.every(n=>t.notes.includes(n))&&Number.isInteger(s.root)&&s.root>=0&&s.root<12&&SCALES.some(v=>v.id===s.scale)&&Number.isInteger(s.count)&&s.count>=1&&s.count<=100&&['random','ascending'].includes(s.order)&&Number.isInteger(s.repetitions)&&s.repetitions>=1&&s.repetitions<=100;}
