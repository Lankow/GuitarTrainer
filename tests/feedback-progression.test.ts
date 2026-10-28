import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sessionFeedback} from '../src/practice/feedback.ts';
import {begin,advance,scoreNote} from '../src/practice/engine.ts';
import {DEFAULT_WALK,walkSequence,validWalk,scoreWalk,emptyWalkScore,newBlock} from '../src/practice/spiderRoutine.ts';
import {walkTiming,timedPosition} from '../src/practice/walkTiming.ts';
test('feedback groups octaves, counts misses and longest streak without counting duplicate hits',()=>{
 const result=sessionFeedback([40,52,45,40,45],[0,0,1,3]);
 assert.equal(result.longest,2);assert.deepEqual(result.rows[0],{note:9,attempts:2,hits:0});
 assert.equal(sessionFeedback([40,52],[0],true).rows.length,2);
});
test('response statistics count each accepted target once and exclude missed targets',()=>{
 const config={count:2,responseMs:2000,breakMs:1000};
 let run=advance(begin(config,0),config,1000);
 run=scoreNote(run,40,52,1200,1250);run=scoreNote(run,40,52,1300,1350);
 assert.deepEqual(run.hits,[0]);assert.deepEqual(run.responses,[250]);
});
test('ladder changes after a complete return, continues across blocks and caps tempo',()=>{
 const setup={...DEFAULT_WALK,blocks:[{...newBlock(),repetitions:2},newBlock()],ladder:{step:10,max:75}};
 const sequence=walkSequence(setup),timing=walkTiming(sequence,60,setup.ladder);
 assert.equal(timing.tempos[47],60);assert.equal(timing.tempos[48],70);assert.equal(timing.tempos[96],75);
 assert.equal(timing.starts[4],4);assert.equal(timing.starts[52],52);
 assert.equal(timedPosition(52,timing.starts,timing.end,sequence.length).index,48);
 assert.equal(timedPosition(timing.end,timing.starts,timing.end,sequence.length).done,true);
 assert.equal(validWalk({...setup,ladder:{step:0,max:75}}),false);
 assert.equal(validWalk({...setup,ladder:{step:5,max:50}}),false);
});
test('disabled progression retains the original fixed beat schedule',()=>{
 const seq=walkSequence(DEFAULT_WALK),timing=walkTiming(seq,60);
 assert.ok(timing.starts.every((time,i)=>time===i));
 assert.equal(timing.end,seq.length+4);
 assert.equal(validWalk(DEFAULT_WALK),true);
});
test('progressive scoring rejects pre-target frames and accepts the new tempo window',()=>{
 const setup={...DEFAULT_WALK,returning:false,ladder:{step:10,max:100}};
 const seq=walkSequence(setup),timing=walkTiming(seq,60,setup.ladder),i=24,start=timing.starts[i+4]*1000;
 let score=scoreWalk(emptyWalkScore(),seq,60,0,seq[i].midi,start-1,start+50,timing);
 assert.equal(score.hits.length,0);
 score=scoreWalk(score,seq,60,0,seq[i].midi,start+60,start+70,timing);
 assert.deepEqual(score.hits,[i]);
 assert.equal(scoreWalk(emptyWalkScore(),seq,60,0,seq[0].midi,100,200,timing).hits.length,0);
});
