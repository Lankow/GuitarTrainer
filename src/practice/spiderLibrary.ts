import { TUNINGS } from '../audio/tunings.ts';
import { migrateWalk, validWalk, walkSequence } from './spiderRoutine.ts';
export type FretPosition = { string: number; fret: number };
export type SpiderRecord = { notes: FretPosition[]; repetitions: number };
export type SpiderPattern = { id: string; name: string; frets: number; records: SpiderRecord[] };
export type SpiderLibrary = { patternRepetitions?: number; bpmStep?: number; patterns: SpiderPattern[]; selected: string; tuning: string; bpm: number; audible: boolean };
export const SPIDER_LIBRARY_KEY = 'guitartrainer.spider.library.v1';
const integer = (n: unknown, min: number, max: number): n is number => typeof n === 'number' && Number.isInteger(n) && n >= min && n <= max;
export function validSpiderPattern(v: unknown): v is SpiderPattern {
 if (!v || typeof v !== 'object') return false;
 const p = v as SpiderPattern;
 return typeof p.id === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(p.id) && typeof p.name === 'string' && p.name.trim().length > 0 && p.name.length <= 60 && integer(p.frets,1,24)
  && Array.isArray(p.records) && p.records.length > 0 && p.records.length <= 32 && p.records.every(r => r && integer(r.repetitions,1,100) && Array.isArray(r.notes) && r.notes.length > 0 && r.notes.length <= 64 && r.notes.every(n => n && integer(n.string,1,6) && integer(n.fret,0,p.frets)))
  && p.records.reduce((sum,r) => sum + r.notes.length * r.repetitions,0) <= 10000;
}
export function validSpiderLibrary(v: unknown): v is SpiderLibrary {
 if (!v || typeof v !== 'object') return false;
 const s = v as SpiderLibrary;
 return (s.bpmStep===undefined||integer(s.bpmStep,0,30)) && (s.patternRepetitions===undefined||integer(s.patternRepetitions,1,100)) && Array.isArray(s.patterns) && s.patterns.length <= 24 && s.patterns.every(validSpiderPattern) && new Set(s.patterns.map(p=>p.id)).size === s.patterns.length && (s.patterns.length===0?s.selected==='':s.patterns.some(p=>p.id===s.selected))
  && TUNINGS.some(t=>t.id===s.tuning) && integer(s.bpm,30,240) && typeof s.audible === 'boolean';
}
export function expandSpider(pattern: SpiderPattern, tuningId: string) {
 if (!validSpiderPattern(pattern)) throw new Error('Invalid Spider Walk pattern.');
 const tuning = TUNINGS.find(t=>t.id===tuningId);
 if (!tuning) throw new Error('Invalid tuning.');
 return pattern.records.flatMap((record,recordIndex)=>Array.from({length:record.repetitions},(_,repetition)=>record.notes.map(n=>({...n,midi:tuning.notes[6-n.string]+n.fret,record:recordIndex,repetition}))).flat());
}
export function migrateSpiderLibrary(v: unknown, older?: unknown): SpiderLibrary {
 const setup = validWalk(v) ? v : migrateWalk(older);
 const notes = walkSequence(setup);
 const compact: SpiderRecord[] = setup.blocks.map((block,index)=>({
  repetitions:block.repetitions,
  notes:notes.filter(n=>n.block===index&&n.repetition===0).map(n=>({string:n.string,fret:n.fret}))
 }));
 const pattern: SpiderPattern = {id:'legacy-walk',name:'Imported legacy walk',frets:Math.max(12,...notes.map(n=>n.fret)),records:compact};
 // Large legacy routines stay in their original storage; the creator uses bounded records.
 const fallback: SpiderPattern = {id:'starter-walk',name:'5–6–7–8',frets:12,records:[{notes:[5,6,7,8].map(fret=>({string:6,fret})),repetitions:2}]};
 const saved=validSpiderPattern(pattern)?pattern:fallback;
 return {patterns:[saved],selected:saved.id,tuning:setup.tuning,bpm:setup.bpm,audible:false};
}
export function exportSpiderPatterns(patterns: SpiderPattern[]): string {
 if (!patterns.length || patterns.length>24 || !patterns.every(validSpiderPattern)) throw new Error('Invalid Spider Walk file.');
 const text=JSON.stringify({format:'GuitarTrainer Spider Walks',version:1,patterns});
 if(new TextEncoder().encode(text).length>256*1024)throw new Error('Spider Walk file is too large.');
 return text;
}
export function parseSpiderPatterns(text: string): SpiderPattern[] {
 if(new TextEncoder().encode(text).length>256*1024)throw new Error('Spider Walk file is too large.');
 let v; try {v=JSON.parse(text);} catch {throw new Error('Invalid Spider Walk file.');}
 if(!v || v.format!=='GuitarTrainer Spider Walks' || v.version!==1 || !Array.isArray(v.patterns) || !v.patterns.length || v.patterns.length>24 || !v.patterns.every(validSpiderPattern))throw new Error('Invalid Spider Walk file.');
 return v.patterns;
}

export function repeatSpider(pattern: SpiderPattern, tuningId: string, repetitions = 1) {
 if (!integer(repetitions,1,100)) throw new Error('Invalid pattern repetitions.');
 const notes=expandSpider(pattern,tuningId);
 return Array.from({length:repetitions},(_,patternRepetition)=>notes.map(n=>({...n,patternRepetition}))).flat();
}

export function spiderTempo(bpm:number, step:number|undefined, repetition:number) { return Math.min(240,bpm+(step??0)*repetition); }
