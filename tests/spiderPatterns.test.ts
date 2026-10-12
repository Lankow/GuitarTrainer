import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addPattern, validPattern, SPIDER_PRESETS } from '../src/practice/spiderPatterns.ts';
test('custom patterns use all four fingers once and duplicates are not added', () => {
  assert.equal(validPattern([2,3,4,1]),true);
  for(const invalid of [[1,1,3,4],[0,2,3,4],[1,2,3],[1,2,3,5],null]) assert.equal(validPattern(invalid),false);
  const added=addPattern(SPIDER_PRESETS,[3,1,4,2]);
  assert.equal(added.length,SPIDER_PRESETS.length+1);
  assert.equal(addPattern(added,[3,1,4,2]),added);
  assert.throws(()=>addPattern(added,[1,1,1,1]));
});
