import { pitchClass } from './engine.ts';
import type { PracticeConfig } from './engine';
const cookie = 'guitartrainer_scores_v1';
type RecordScore = { key: string; score: number };
export const scoreKey = (c: PracticeConfig, tuning: string, reference: number, notes?: number[]) => `any-octave:${tuning}:${reference}:${c.count}:${c.responseMs}:${c.breakMs}${notes ? ':' + [...new Set(notes.map(pitchClass))].sort((a,b) => a-b).join(',') : ''}`;
function records(): RecordScore[] {
  try {
    const raw = document.cookie.split('; ').find(c => c.startsWith(cookie + '='));
    const parsed: unknown = JSON.parse(decodeURIComponent(raw?.slice(cookie.length + 1) || '[]'));
    return Array.isArray(parsed) ? parsed.filter(r => r && typeof r.key === 'string' && r.key.length < 100 && Number.isInteger(r.score) && r.score >= 0 && r.score <= 100).slice(-12) : [];
  } catch { return []; }
}
export function bestScore(key: string) { return records().find(r => r.key === key)?.score ?? 0; }
export function saveScore(key: string, score: number) {
  const best = Math.max(bestScore(key), score);
  try {
    const next = [...records().filter(r => r.key !== key), { key, score: best }].slice(-12);
    document.cookie = `${cookie}=${encodeURIComponent(JSON.stringify(next))}; Max-Age=31536000; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    return { best, saved: records().some(r => r.key === key && r.score === best) };
  } catch { return { best, saved: false }; }
}
