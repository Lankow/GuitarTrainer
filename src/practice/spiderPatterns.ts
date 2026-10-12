/** A pattern is a permutation: each fretting finger appears exactly once. */
export type FingerPattern = number[];
export const SPIDER_PRESETS: FingerPattern[] = [
  [1, 2, 3, 4], [2, 3, 4, 1], [1, 3, 2, 4], [1, 4, 2, 3], [4, 3, 2, 1],
];
export function validPattern(value: unknown): value is FingerPattern {
  return Array.isArray(value) && value.length === 4 && new Set(value).size === 4 && value.every(n => Number.isInteger(n) && n >= 1 && n <= 4);
}
export const patternLabel = (pattern: FingerPattern) => pattern.join('–');
export function addPattern(patterns: FingerPattern[], pattern: FingerPattern): FingerPattern[] {
  if (!validPattern(pattern)) throw new Error('Use each finger from 1 to 4 once.');
  return patterns.some(p => p.join('') === pattern.join('')) ? patterns : [...patterns, [...pattern]];
}
