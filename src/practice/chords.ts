/** Standard-tuning voicings, strings ordered low E to high E; -1 means mute. */
export const CHORDS = [
 {id:'C',frets:[-1,3,2,0,1,0]}, {id:'D',frets:[-1,-1,0,2,3,2]},
 {id:'E',frets:[0,2,2,1,0,0]}, {id:'G',frets:[3,2,0,0,0,3]},
 {id:'A',frets:[-1,0,2,2,2,0]}, {id:'F',frets:[1,3,3,2,1,1]},
 {id:'Am',frets:[-1,0,2,2,1,0]}, {id:'Dm',frets:[-1,-1,0,2,3,1]},
 {id:'Em',frets:[0,2,2,0,0,0]}, {id:'Bm',frets:[-1,2,4,4,3,2]},
 {id:'A7',frets:[-1,0,2,0,2,0]}, {id:'B7',frets:[-1,2,1,2,0,2]},
 {id:'C7',frets:[-1,3,2,3,1,3]}, {id:'D7',frets:[-1,-1,0,2,1,2]},
 {id:'E7',frets:[0,2,0,1,0,0]}, {id:'G7',frets:[3,2,0,0,0,1]},
] as const;
export type ChordSet = {id:string;name:string;chords:string[]};
export function validChordSet(value:unknown):value is ChordSet {
 if(!value||typeof value!=='object')return false;const s=value as ChordSet;
 return typeof s.id==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(s.id)&&typeof s.name==='string'&&s.name.trim().length>0&&s.name.length<=60&&Array.isArray(s.chords)&&s.chords.length>0&&s.chords.length<=CHORDS.length&&new Set(s.chords).size===s.chords.length&&s.chords.every(id=>CHORDS.some(c=>c.id===id));
}
export function randomChords(chords:readonly string[],count:number,random= Math.random):string[]{
 const pool=[...new Set(chords)];
 if(!pool.length||!pool.every(id=>CHORDS.some(c=>c.id===id))||!Number.isInteger(count)||count<1||count>100)throw new Error('Invalid chord sequence.');
 const result:string[]=[];
 for(let i=0;i<count;i++){const choices=pool.length>1?pool.filter(id=>id!==result[i-1]):pool;result.push(choices[Math.min(choices.length-1,Math.floor(random()*choices.length))]);}
 return result;
}

