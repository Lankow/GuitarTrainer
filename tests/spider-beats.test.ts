import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spiderBeatSchedule,spiderBeatIndex } from '../src/practice/spiderBeats.ts';
test('beat routine uses full notes and changes tempo only at pattern boundaries',()=>{
 const s=spiderBeatSchedule([{patternRepetition:0},{patternRepetition:0},{patternRepetition:1},{patternRepetition:1}],60,60);
 assert.deepEqual(s.starts,[0,1,2,2.5]);assert.equal(s.end,3);
 assert.equal(spiderBeatIndex(s.starts,.999),0);assert.equal(spiderBeatIndex(s.starts,1),1);
 assert.equal(spiderBeatIndex(s.starts,2.9),3);
 assert.equal(spiderBeatSchedule([{patternRepetition:0}],60).end,1);
});
