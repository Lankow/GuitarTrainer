import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SPIDER, spiderSequence, spiderPosition, validSpider } from '../src/practice/spider.ts';
test('walk covers strings and reverses exact positions on return', () => {
 const notes = spiderSequence(DEFAULT_SPIDER);
 assert.equal(notes.length,48);
 assert.deepEqual(notes[0],{string:6,finger:1,fret:5});
 assert.deepEqual(notes[23],{string:1,finger:4,fret:8});
 assert.deepEqual(notes.slice(24),notes.slice(0,24).toReversed());
 assert.equal(spiderSequence({...DEFAULT_SPIDER,returning:false}).length,24);
 assert.deepEqual(spiderSequence({...DEFAULT_SPIDER,pattern:'crossing'}).slice(0,4).map(n=>n.fret),[5,8,6,7]);
});
test('count-in and completion have full beat durations', () => {
 assert.deepEqual(spiderPosition(3.999,60,24),{countIn:1,index:0,done:false});
 assert.deepEqual(spiderPosition(4,60,24),{countIn:0,index:0,done:false});
 assert.deepEqual(spiderPosition(27.99,60,24),{countIn:0,index:23,done:false});
 assert.equal(spiderPosition(28,60,24).done,true);
 assert.equal(spiderPosition(14,120,24).done,true);
});
test('invalid persisted settings are rejected', () => {
 for(const patch of [{pattern:'toString'},{bpm:0},{fret:18},{repetitions:1.5},{audible:'yes'}])assert.equal(validSpider({...DEFAULT_SPIDER,...patch}),false);
 assert.equal(validSpider(null),false);
});
