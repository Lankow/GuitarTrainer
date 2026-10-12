import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_WALK, newBlock, walkSequence, scoreWalk, emptyWalkScore, migrateWalk, validWalk } from '../src/practice/spiderRoutine.ts';
test('routine plays one first-pattern repetition then two shifted-pattern repetitions', () => {
 const setup={...DEFAULT_WALK,returning:false,blocks:[newBlock(),{...newBlock([2,3,4,1]),repetitions:2}]};
 const notes=walkSequence(setup);
 assert.equal(notes.length,72);
 assert.deepEqual(notes.slice(24,28).map(n=>n.finger),[2,3,4,1]);
 assert.equal(notes[23].block,0);assert.equal(notes[24].block,1);assert.equal(notes[48].repetition,1);
});
test('mixed patterns follow physical strings on both outward and return journeys', () => {
 const block=newBlock();block.mixed=true;block.strings[1]=[2,3,4,1];
 const notes=walkSequence({...DEFAULT_WALK,blocks:[block]});
 assert.deepEqual(notes.slice(4,8).map(n=>[n.string,n.finger,n.fret,n.midi]),[[5,2,6,51],[5,3,7,52],[5,4,8,53],[5,1,5,50]]);
 assert.deepEqual(notes.slice(40,44).map(n=>n.finger),[1,4,3,2]);
 assert.equal(notes[40].string,5);
 const drop=walkSequence({...DEFAULT_WALK,tuning:'drop-d',blocks:[newBlock()]});
 assert.equal(drop[0].midi,43);
});
test('score rejects count-in, wrong octave, stale and late frames; awards only one point per beat', () => {
 const notes=walkSequence({...DEFAULT_WALK,returning:false,blocks:[newBlock()]});
 let score=emptyWalkScore(); const target=notes[0].midi;
 score=scoreWalk(score,notes,60,0,target,3000,3100);assert.equal(score.hits.length,0);
 score=scoreWalk(score,notes,60,0,target+12,4010,4100);assert.equal(score.hits.length,0);
 score=scoreWalk(score,notes,60,0,target,4050,4200);assert.deepEqual(score.hits,[0]);
 score=scoreWalk(score,notes,60,0,target,4200,4300);assert.deepEqual(score.hits,[0]);
 score=scoreWalk(score,notes,60,0,notes[1].midi,4999,5100);assert.deepEqual(score.hits,[0]);
 score=scoreWalk(score,notes,60,0,target,5100,5200);assert.deepEqual(score.hits,[0]);
 score=scoreWalk(score,notes,60,0,notes[1].midi,5200,5300);assert.deepEqual(score.hits,[0,1]);
 assert.equal(scoreWalk(score,notes,60,0,target,5199,5400),score);
});
test('identical turnaround pitch requires release within its new beat', () => {
 const original=walkSequence({...DEFAULT_WALK,blocks:[newBlock()]});
 const notes=[original[0],original[0]];
 let score=scoreWalk(emptyWalkScore(),notes,60,0,notes[0].midi,4100,4200);
 score=scoreWalk(score,notes,60,0,notes[0].midi,5100,5200);assert.deepEqual(score.hits,[0]);
 score=scoreWalk(score,notes,60,0,null,5250,5300);
 score=scoreWalk(score,notes,60,0,notes[0].midi,5400,5500);assert.deepEqual(score.hits,[0,1]);
 score=scoreWalk(score,notes,60,0,notes[0].midi,6100,6200);assert.deepEqual(score.hits,[0,1]);
});
test('old settings migrate and malformed routines are rejected', () => {
 assert.equal(validWalk(migrateWalk({pattern:'crossing',fret:17,bpm:90,repetitions:2,returning:false,audible:false})),true);
 assert.deepEqual(migrateWalk({pattern:'crossing',fret:17,bpm:90,repetitions:2,returning:false,audible:false}).blocks[0].pattern,[1,4,2,3]);
 for(const patch of [{blocks:[]},{tuning:'bad'},{patterns:[[1,1,2,3]]},{blocks:[{...newBlock(),strings:[]}]}])assert.equal(validWalk({...DEFAULT_WALK,...patch}),false);
});
