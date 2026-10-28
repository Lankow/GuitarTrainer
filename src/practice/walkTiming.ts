import type { WalkNote } from './spiderRoutine.ts';
export function walkTiming(sequence:WalkNote[],bpm:number,ladder?:{step:number;max:number}) {
 let repetition=0,time=4*60/bpm;
 const starts=Array.from({length:4},(_,i)=>i*60/bpm),tempos:number[]=[];
 sequence.forEach((note,i)=>{if(i>0&&(note.block!==sequence[i-1].block||note.repetition!==sequence[i-1].repetition))repetition++;
 const tempo=ladder?Math.min(ladder.max,bpm+repetition*ladder.step):bpm;tempos.push(tempo);starts.push(time);time+=60/tempo;});
 return {starts,tempos,end:time};
}
export function timedPosition(elapsed:number,starts:number[],end:number,total:number) {
 let low=0,high=starts.length;
 while(low<high){const mid=(low+high)>>>1;if(starts[mid]<=elapsed+1e-8)low=mid+1;else high=mid;}
 const beat=Math.max(0,low-1);
 return {countIn:Math.max(0,4-beat),index:elapsed>=end?total:Math.max(0,beat-4),done:elapsed>=end,beat};
}
