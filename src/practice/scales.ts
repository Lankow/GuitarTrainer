import { pitchClass } from './engine.ts';
export const ROOTS = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
export const SCALES = [
 {id:'major',name:'Major',steps:[0,2,4,5,7,9,11]},
 {id:'minor',name:'Natural minor',steps:[0,2,3,5,7,8,10]},
 {id:'major-pentatonic',name:'Major pentatonic',steps:[0,2,4,7,9]},
 {id:'minor-pentatonic',name:'Minor pentatonic',steps:[0,3,5,7,10]},
];
export function scaleNotes(root: number, id: string) {
 const scale = SCALES.find(s=>s.id===id) ?? SCALES[0];
 return scale.steps.map(step=>48+root+step);
}
export type OrderedRun = { index:number; startedAt:number; targetAt:number; completedAt:number|null; releaseRequired:boolean };
export function startOrdered(now:number):OrderedRun { return {index:0,startedAt:now,targetAt:now,completedAt:null,releaseRequired:false}; }
export function acceptOrdered(s:OrderedRun, notes:number[], repetitions:number, midi:number|null, capturedAt:number, now:number):OrderedRun {
 if(s.completedAt!==null || capturedAt<=s.targetAt) return s;
 const target=notes[s.index%notes.length];
 if(s.releaseRequired) return midi===null || pitchClass(midi)!==pitchClass(target) ? {...s,releaseRequired:false} : s;
 if(midi===null || pitchClass(midi)!==pitchClass(target)) return s;
 const next=s.index+1;
 return {...s,index:next,targetAt:now,completedAt:next===notes.length*repetitions?now:null,releaseRequired:next<notes.length*repetitions && pitchClass(notes[next%notes.length])===pitchClass(target)};
}
