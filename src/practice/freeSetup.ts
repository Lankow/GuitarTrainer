import { readSelection, NATURAL_NOTES } from './noteSelection.ts';
import { SCALES } from './scales.ts';
export type FreeSetup={returnToRoot?:boolean;tuning:string;sharps?:boolean;flats?:boolean;selected:number[];root:number;scale:string;count:number;order:'random'|'ascending';repetitions:number};
export const FREE_DEFAULTS:FreeSetup={tuning:'standard',selected:NATURAL_NOTES,sharps:false,root:0,scale:'major',count:20,order:'random',repetitions:3};
export function validFree(v:unknown):v is FreeSetup{if(!v||typeof v!=='object')return false;const s=v as FreeSetup;return (s.returnToRoot===undefined||typeof s.returnToRoot==='boolean')&&!!readSelection({tuning:s.tuning,notes:s.selected,sharps:s.sharps,flats:s.flats})&&Number.isInteger(s.root)&&s.root>=0&&s.root<12&&SCALES.some(v=>v.id===s.scale)&&Number.isInteger(s.count)&&s.count>=1&&s.count<=100&&['random','ascending'].includes(s.order)&&Number.isInteger(s.repetitions)&&s.repetitions>=1&&s.repetitions<=100;}
