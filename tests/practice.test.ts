import { test } from 'node:test';
import assert from 'node:assert/strict';
import { begin, advance, scoreNote, makeSequence, validConfig } from '../src/practice/engine.ts';
const config = { count: 2, responseMs: 2000, breakMs: 1000 };
test('countdown precedes each complete response window and ends with exact score', () => {
  let s = begin(config, 0);
  assert.equal(advance(s, config, 999).phase, 'break');
  s = advance(s, config, 1000);
  assert.equal(s.phase, 'note'); assert.equal(s.deadline, 3000);
  s = scoreNote(s, 40, 40, 1100, 1101);
  assert.equal(s.score, 1);
  assert.equal(scoreNote(s, 40, 40, 1200, 1201).score, 1);
  s = advance(s, config, 3000); assert.equal(s.phase, 'break'); assert.equal(s.index, 1);
  s = advance(s, config, 4000); assert.equal(s.deadline, 6000);
  s = advance(s, config, 6000); assert.equal(s.phase, 'finished'); assert.equal(s.score, 1);
});
test('break, stale frames, silence and late results earn no point', () => {
  const b = begin(config, 0); assert.equal(scoreNote(b, 40, 40, 500, 501).score, 0);
  const s = advance(b, config, 1000);
  for (const [midi, capture, now] of [[40, 900, 1100], [41, 1100, 1101], [null, 1100, 1101], [40, 3000, 3000], [40, 2900, 3001]] as const) assert.equal(scoreNote(s, 40, midi, capture, now).score, 0);
});
test('delayed timer gives each newly displayed target its full response window', () => {
  const s = advance(begin(config, 0), config, 1800);
  assert.equal(s.deadline, 3800);
});
test('sequence avoids consecutive duplicate targets and stays within tuning', () => {
  const notes = [38,45,50,55,59,64];
  const sequence = makeSequence(notes, 100, () => .5);
  assert.equal(sequence.length, 100);
  sequence.forEach((n,i) => { assert.ok(notes.includes(n)); if(i) assert.notEqual(n,sequence[i-1]); });
});
test('configuration rejects invalid timing and count', () => {
  assert.ok(validConfig(config));
  for (const patch of [{count:0},{count:101},{count:1.5},{responseMs:0},{breakMs:NaN},{breakMs:10001}]) assert.equal(validConfig({...config,...patch}),false);
});
test('selected subset stays isolated and single-note practice repeats safely', () => {
  assert.deepEqual(makeSequence([38], 3), [38,38,38]);
  assert.deepEqual(makeSequence([38,45], 4, () => 0), [38,45,38,45]);
  assert.throws(() => makeSequence([], 3));
});

test('practice accepts the same note in any octave but rejects other note names', () => {
 const s = advance(begin(config, 0), config, 1000);
 for (const midi of [28,40,52,64,76]) assert.equal(scoreNote(s,40,midi,1100,1101).score,1);
 assert.equal(scoreNote(s,40,41,1100,1101).score,0);
});
test('sequence deduplicates octaves and avoids repeated note names', () => {
 const seq = makeSequence([40,52,45,57],10,()=>0);
 seq.forEach((n,i) => { if(i) assert.notEqual(n%12,seq[i-1]%12); });
 assert.equal(new Set(makeSequence([40,52],4).map(n=>n%12)).size,1);
});
