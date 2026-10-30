import {test} from 'node:test';
import assert from 'node:assert/strict';
import {beginChords,tickChords,acceptChord,validChordSetup,DEFAULT_CHORD_SETUP} from '../src/practice/chordPracticeEngine.ts';
const config={count:2,responseMs:1000,breakMs:100};
test('timed chords require two fresh stable matches and score only once',()=>{
 let s=tickChords(beginChords(config,false,0),config,100);
 s=acceptChord(s,['C','G'],false,'G',120,130);assert.equal(s.score,0);
 s=acceptChord(s,['C','G'],false,'C',150,160);
 assert.equal(acceptChord(s,['C','G'],false,'C',150,170),s);
 s=acceptChord(s,['C','G'],false,'C',200,210);assert.equal(s.score,1);
 assert.equal(acceptChord(s,['C','G'],false,'C',250,260).score,1);
 s=tickChords(s,config,1100);assert.equal(s.phase,'break');
 assert.equal(acceptChord(s,['C','G'],false,'G',1150,1160),s);
 s=tickChords(s,config,1200);s=tickChords(s,config,2200);
 assert.equal(s.phase,'finished');assert.equal(s.score,1);
});
test('stale, late and interrupted chord detections cannot award points',()=>{
 let s=tickChords(beginChords(config,false,0),config,100);
 assert.equal(acceptChord(s,['C'],false,'C',90,120),s);
 s=acceptChord(s,['C'],false,'C',150,160);
 s=acceptChord(s,['C'],false,'C',450,460);assert.equal(s.score,0);
 s=acceptChord(s,['C'],false,null,500,510);
 s=acceptChord(s,['C'],false,'C',550,560);assert.equal(s.score,0);
 assert.equal(acceptChord(s,['C'],false,'C',600,1100),s);
});
test('free mode requires release for a repeated chord and finishes exactly once',()=>{
 let s=beginChords(config,true,0);
 for(const t of [10,70])s=acceptChord(s,['C','C'],true,'C',t,t+1);
 assert.equal(s.score,1);assert.equal(s.release,true);
 s=acceptChord(s,['C','C'],true,'C',130,131);assert.equal(s.score,1);
 s=acceptChord(s,['C','C'],true,null,190,191);
 for(const t of [250,310])s=acceptChord(s,['C','C'],true,'C',t,t+1);
 assert.equal(s.score,2);assert.equal(s.phase,'finished');
 assert.equal(acceptChord(s,['C','C'],true,'C',370,371),s);
});
test('chord settings reject invalid sets and unknown selections',()=>{
 assert.equal(validChordSetup(DEFAULT_CHORD_SETUP),true);
 for(const change of [{selected:'missing'},{sets:[]},{responseMs:500},{sets:[...DEFAULT_CHORD_SETUP.sets,...DEFAULT_CHORD_SETUP.sets]}])assert.equal(validChordSetup({...DEFAULT_CHORD_SETUP,...change}),false);
});
