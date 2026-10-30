import { CHORDS,validChordSet,type ChordSet } from './chords.ts';
import { advance,begin,type Round,type PracticeConfig,validConfig } from './engine.ts';
export type ChordSetup=PracticeConfig&{sets:ChordSet[];selected:string;free:boolean};
export const CHORD_KEY='guitartrainer.chords.v1';
export const DEFAULT_CHORD_SETUP:ChordSetup={sets:[{id:'open',name:'C · G · Am · Em',chords:['C','G','Am','Em']}],selected:'open',free:false,count:20,responseMs:4000,breakMs:1000};
export function validChordSetup(v:unknown):v is ChordSetup {
 if(!v||typeof v!=='object')return false;const s=v as ChordSetup;
 return validConfig(s)&&s.responseMs>=1000&&typeof s.free==='boolean'&&Array.isArray(s.sets)&&s.sets.length>=1&&s.sets.length<=24&&s.sets.every(validChordSet)&&new Set(s.sets.map(x=>x.id)).size===s.sets.length&&s.sets.some(x=>x.id===s.selected);
}
export type ChordRun=Round&{candidate:string|null;streak:number;lastFrame:number;release:boolean};
export function beginChords(config:PracticeConfig,free:boolean,now:number):ChordRun {
 return {...begin(config,now),...(free?{phase:'note' as const,deadline:Infinity}:{}),candidate:null,streak:0,lastFrame:now,release:false};
}
export function tickChords(s:ChordRun,c:PracticeConfig,now:number):ChordRun {
 const next=advance(s,c,now);return next.phase!==s.phase?{...s,...next,candidate:null,streak:0}:s;
}
export function acceptChord(s:ChordRun,sequence:string[],free:boolean,detected:string|null,capturedAt:number,now:number):ChordRun {
 if(s.phase!=='note'||s.hit||!Number.isFinite(capturedAt)||!Number.isFinite(now)||capturedAt<=s.lastFrame||capturedAt<=s.startsAt||capturedAt>now||now>=s.deadline||capturedAt>=s.deadline)return s;
 let next={...s,lastFrame:capturedAt};
 if(s.release)return {...next,release:detected!==null,candidate:null,streak:0};
 if(!detected||!CHORDS.some(c=>c.id===detected))return {...next,candidate:null,streak:0};
 const streak=s.candidate===detected&&capturedAt-s.lastFrame<250?s.streak+1:1;
 next={...next,candidate:detected,streak};
 if(detected!==sequence[s.index]||streak<2)return next;
 const score=s.score+1,hits=[...(s.hits??[]),s.index];
 if(!free)return {...next,hit:true,score,hits};
 if(s.index+1===sequence.length)return {...next,phase:'finished',score,hits,deadline:now};
 return {...next,index:s.index+1,score,hits,startsAt:now,candidate:null,streak:0,release:sequence[s.index+1]===detected};
}
