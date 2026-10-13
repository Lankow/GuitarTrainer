export type CheckSample = { level: number; midi: number | null };
export function assessSetup(quiet: CheckSample[], playing: CheckSample[], gate: number) {
 const median=(values:number[])=>{const sorted=[...values].sort((a,b)=>a-b);return sorted.length?sorted[Math.floor(sorted.length/2)]:-100;};
 const noise=median(quiet.map(s=>s.level));
 const signal=Math.max(-100,...playing.map(s=>s.level));
 let streak=0,best=0,last:number|null=null;
 for(const sample of playing){streak=sample.midi!==null?(sample.midi===last?streak+1:1):0;last=sample.midi;best=Math.max(best,streak);}
 return {noise,signal,contrast:signal-noise,noiseAboveGate:noise>=gate,weak:signal<gate+6,stable:best>=5,enough:quiet.length>=10&&playing.length>=10};
}
