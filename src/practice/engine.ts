export const pitchClass = (midi: number) => ((midi % 12) + 12) % 12;
export type PracticeConfig = { count: number; responseMs: number; breakMs: number };
export type Round = { phase: 'break' | 'note' | 'finished'; lastOutcome?: 'success' | 'miss'; index: number; score: number; hit: boolean; startsAt: number; deadline: number };
export function validConfig(c: PracticeConfig) {
  return Number.isInteger(c.count) && c.count >= 1 && c.count <= 100 && Number.isInteger(c.responseMs) && c.responseMs >= 250 && c.responseMs <= 30000 && Number.isInteger(c.breakMs) && c.breakMs >= 100 && c.breakMs <= 10000;
}
export function begin(c: PracticeConfig, now: number): Round {
  if (!validConfig(c)) throw new Error('Invalid practice configuration');
  return { phase: 'break', index: 0, score: 0, hit: false, startsAt: now, deadline: now + c.breakMs };
}
export function advance(s: Round, c: PracticeConfig, now: number): Round {
  if (s.phase === 'finished' || now < s.deadline) return s;
  if (s.phase === 'break') return { ...s, phase: 'note', lastOutcome: undefined, startsAt: now, deadline: now + c.responseMs, hit: false };
  if (s.index + 1 === c.count) return { ...s, phase: 'finished', lastOutcome: s.hit ? 'success' : 'miss' };
  return { ...s, phase: 'break', lastOutcome: s.hit ? 'success' : 'miss', index: s.index + 1, startsAt: now, deadline: now + c.breakMs, hit: false };
}
export function scoreNote(s: Round, target: number, detected: number | null, capturedAt: number, now: number): Round {
  if (s.phase !== 'note' || s.hit || capturedAt <= s.startsAt || capturedAt >= s.deadline || now >= s.deadline || (detected === null || pitchClass(detected) !== pitchClass(target))) return s;
  return { ...s, hit: true, score: s.score + 1 };
}
export function makeSequence(notes: number[], count: number, random = Math.random) {
  notes = [...new Map(notes.map(n => [pitchClass(n), n])).values()];
  if (!notes.length) throw new Error('At least one target pitch required');
  if (notes.length === 1) return Array.from({ length: count }, () => notes[0]);
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    const choices = notes.filter(n => result.length === 0 || pitchClass(n) !== pitchClass(result[i - 1]));
    result.push(choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))]);
  }
  return result;
}
