import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bestScore, saveScore, scoreKey } from '../src/practice/scores.ts';
test('score cookie retains personal best, separates setups and handles blocked cookies', () => {
  let jar = '';
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { get cookie() { return jar; }, set cookie(value: string) { jar = value.split(';')[0]; } } });
  Object.defineProperty(globalThis, 'location', { configurable: true, value: { protocol: 'https:' } });
  assert.deepEqual(saveScore('standard:440:10:2000:1000', 7), {best:7,saved:true});
  assert.equal(saveScore('standard:440:10:2000:1000', 4).best,7);
  assert.equal(bestScore('drop-d:440:10:2000:1000'),0);
  jar = 'guitartrainer_scores_v1=invalid'; assert.equal(bestScore('anything'),0);
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { get cookie() { return ''; }, set cookie(_: string) {} } });
  assert.deepEqual(saveScore('standard:440:10:2000:1000', 5),{best:5,saved:false});
});

test('selected-note best scores are order independent and separate from full tuning', () => {
 const c = {count:10,responseMs:2000,breakMs:1000};
 assert.equal(scoreKey(c,'standard',440,[40,45]),scoreKey(c,'standard',440,[45,40]));
 assert.notEqual(scoreKey(c,'standard',440,[40]),scoreKey(c,'standard',440));
});
