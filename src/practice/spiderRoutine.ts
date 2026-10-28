import { timedPosition } from './walkTiming.ts';
import { TUNINGS } from '../audio/tunings.ts';
import { DEFAULT_SPIDER, PATTERNS, validSpider } from './spider.ts';
import { SPIDER_PRESETS, validPattern, type FingerPattern } from './spiderPatterns.ts';
export type WalkBlock = { pattern: FingerPattern; repetitions: number; mixed: boolean; strings: FingerPattern[] };
export type WalkSetup = { fret: number; bpm: number; returning: boolean; audible: boolean; tuning: string; patterns: FingerPattern[]; blocks: WalkBlock[]; ladder?: {step:number;max:number} };
export type WalkNote = { string: number; finger: number; fret: number; midi: number; block: number; repetition: number; returning: boolean; pattern: FingerPattern };
export const newBlock = (pattern = [1, 2, 3, 4]): WalkBlock => ({ pattern: [...pattern], repetitions: 1, mixed: false, strings: Array.from({ length: 6 }, () => [...pattern]) });
export const DEFAULT_WALK: WalkSetup = { fret: 5, bpm: 60, returning: true, audible: true, tuning: 'standard', patterns: SPIDER_PRESETS, blocks: [{ ...newBlock(), repetitions: 3 }] };
export function validWalk(value: unknown): value is WalkSetup {
  if (!value || typeof value !== 'object') return false;
  const s = value as WalkSetup;
  return (s.ladder===undefined||(s.ladder!==null&&Number.isInteger(s.ladder.step)&&s.ladder.step>=1&&s.ladder.step<=20&&Number.isInteger(s.ladder.max)&&s.ladder.max>=s.bpm&&s.ladder.max<=180)) && Number.isInteger(s.fret) && s.fret >= 1 && s.fret <= 17 && Number.isInteger(s.bpm) && s.bpm >= 30 && s.bpm <= 180 && typeof s.returning === 'boolean' && typeof s.audible === 'boolean' && TUNINGS.some(t => t.id === s.tuning)
    && Array.isArray(s.patterns) && s.patterns.length >= 1 && s.patterns.length <= 24 && s.patterns.every(validPattern)
    && Array.isArray(s.blocks) && s.blocks.length >= 1 && s.blocks.length <= 8 && s.blocks.every(b => b && validPattern(b.pattern) && Number.isInteger(b.repetitions) && b.repetitions >= 1 && b.repetitions <= 20 && typeof b.mixed === 'boolean' && Array.isArray(b.strings) && b.strings.length === 6 && b.strings.every(validPattern));
}
export function migrateWalk(value: unknown): WalkSetup {
  const old = validSpider(value) ? value : DEFAULT_SPIDER;
  return { ...DEFAULT_WALK, fret: old.fret, bpm: old.bpm, returning: old.returning, audible: old.audible, blocks: [{ ...newBlock([...PATTERNS[old.pattern]]), repetitions: old.repetitions }] };
}
export function walkSequence(setup: WalkSetup): WalkNote[] {
  if (!validWalk(setup)) throw new Error('Invalid routine');
  const tuning = TUNINGS.find(t => t.id === setup.tuning)!;
  return setup.blocks.flatMap((block, blockIndex) => Array.from({ length: block.repetitions }, (_, repetition) => {
    const outward = [6, 5, 4, 3, 2, 1].flatMap((string, index) => {
      const pattern = block.mixed ? block.strings[index] : block.pattern;
      return pattern.map(finger => ({ string, finger, fret: setup.fret + finger - 1, midi: tuning.notes[index] + setup.fret + finger - 1, block: blockIndex, repetition, returning: false, pattern }));
    });
    return setup.returning ? [...outward, ...outward.slice().reverse().map(n => ({ ...n, returning: true }))] : outward;
  }).flat());
}
export type WalkScore = { hits: number[]; lastMidi: number | null; lastCapturedAt: number; lastDifferentAt: number };
export const emptyWalkScore = (): WalkScore => ({ hits: [], lastMidi: null, lastCapturedAt: -Infinity, lastDifferentAt: -Infinity });
/** Exact pitch, one point per beat. Reject stale/late frames and sustained identical targets. */
export function scoreWalk(state: WalkScore, sequence: WalkNote[], bpm: number, origin: number, midi: number | null, capturedAt: number, now: number, timing?: {starts:number[];end:number}): WalkScore {
  if (!Number.isFinite(capturedAt) || !Number.isFinite(now) || capturedAt <= state.lastCapturedAt || capturedAt > now) return state;
  const beatMs = 60000 / bpm;
  const index = timing ? timedPosition((now-origin)/1000,timing.starts,timing.end,sequence.length).index : Math.floor((now - origin) / beatMs) - 4;
  const lastDifferentAt = midi !== state.lastMidi ? capturedAt : state.lastDifferentAt;
  const next = { ...state, lastMidi: midi, lastCapturedAt: capturedAt, lastDifferentAt };
  if ((timing && now < origin+timing.starts[4]*1000) || index < 0 || index >= sequence.length || state.hits.includes(index)) return next;
  const start = origin + (timing ? timing.starts[index+4]*1000 : (index + 4) * beatMs);
  if (capturedAt < start || midi !== sequence[index].midi) return next;
  // Adjacent equal pitches must be released/re-articulated through a detected non-target frame.
  if (index > 0 && sequence[index - 1].midi === midi && lastDifferentAt < start) return next;
  return { ...next, hits: [...state.hits, index] };
}

