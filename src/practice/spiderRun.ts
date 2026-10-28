export type SpiderRun = {index:number;startedAt:number;targetAt:number;lastCapturedAt:number;releaseRequired:boolean;completedAt:number|null};
export function beginSpider(now:number):SpiderRun {return {index:0,startedAt:now,targetAt:now,lastCapturedAt:now,releaseRequired:false,completedAt:null};}
/** Match exact pitch; never consume the same frame twice or carry a held note into an identical target. */
export function advanceSpider(run:SpiderRun,notes:readonly {midi:number}[],midi:number|null,capturedAt:number,now:number):SpiderRun {
 if(run.completedAt!==null||!Number.isFinite(capturedAt)||!Number.isFinite(now)||capturedAt<=run.lastCapturedAt||capturedAt<=run.targetAt||capturedAt>now||!notes[run.index])return run;
 const next={...run,lastCapturedAt:capturedAt};
 if(run.releaseRequired)return {...next,releaseRequired:midi===notes[run.index].midi};
 if(midi!==notes[run.index].midi)return next;
 const index=run.index+1;
 return {...next,index,targetAt:now,completedAt:index===notes.length?now:null,releaseRequired:index<notes.length&&notes[index].midi===midi};
}
