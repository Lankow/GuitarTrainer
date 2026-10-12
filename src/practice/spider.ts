export const PATTERNS = {
  straight: [1, 2, 3, 4],
  alternating: [1, 3, 2, 4],
  crossing: [1, 4, 2, 3],
} as const;
export type SpiderSetup = { pattern: keyof typeof PATTERNS; fret: number; bpm: number; repetitions: number; returning: boolean; audible: boolean };
export const DEFAULT_SPIDER: SpiderSetup = { pattern: 'straight', fret: 5, bpm: 60, repetitions: 3, returning: true, audible: true };
export function validSpider(value: unknown): value is SpiderSetup {
  if (!value || typeof value !== 'object') return false;
  const s = value as SpiderSetup;
  return Object.hasOwn(PATTERNS, s.pattern) && Number.isInteger(s.fret) && s.fret >= 1 && s.fret <= 17 && Number.isInteger(s.bpm) && s.bpm >= 30 && s.bpm <= 180 && Number.isInteger(s.repetitions) && s.repetitions >= 1 && s.repetitions <= 20 && typeof s.returning === 'boolean' && typeof s.audible === 'boolean';
}
export function spiderSequence(s: SpiderSetup) {
  if (!validSpider(s)) throw new Error('Invalid Spider Walk setup');
  const outward = [6, 5, 4, 3, 2, 1].flatMap(string => PATTERNS[s.pattern].map(finger => ({ string, finger, fret: s.fret + finger - 1 })));
  return s.returning ? [...outward, ...[...outward].reverse()] : outward;
}
export function spiderPosition(elapsedSeconds: number, bpm: number, total: number) {
  const beat = Math.floor(Math.max(0, elapsedSeconds) * bpm / 60 + 1e-8);
  return { countIn: Math.max(0, 4 - beat), index: Math.min(total, Math.max(0, beat - 4)), done: beat >= total + 4 };
}

