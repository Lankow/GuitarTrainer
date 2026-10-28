import { spiderTempo } from './spiderLibrary.ts';
export function spiderBeatSchedule(notes:readonly {patternRepetition:number}[],bpm:number,step?:number){
 let end=0;const starts=notes.map(n=>{const start=end;end+=60/spiderTempo(bpm,step,n.patternRepetition);return start;});return {starts,end};
}
export function spiderBeatIndex(starts:readonly number[],elapsed:number){
 let low=0,high=starts.length;while(low<high){const mid=(low+high)>>>1;if(starts[mid]<=elapsed)low=mid+1;else high=mid;}return Math.max(0,low-1);
}
