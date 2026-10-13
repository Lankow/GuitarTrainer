import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assessSetup } from '../src/audio/setupCheck.ts';
const samples=(level:number,midi:number|null)=>Array.from({length:30},()=>({level,midi}));
test('setup check distinguishes clean guitar, silence and noisy input',()=>{
 const quiet=samples(-65,null);
 const clean=assessSetup(quiet,samples(-25,40),-55);
 assert.equal(clean.stable,true);assert.equal(clean.weak,false);assert.equal(clean.noiseAboveGate,false);assert.equal(clean.contrast,40);assert.equal(clean.enough,true);
 const silence=assessSetup(quiet,samples(-100,null),-55);assert.equal(silence.stable,false);assert.equal(silence.weak,true);
 assert.equal(assessSetup(samples(-40,null),samples(-35,40),-55).noiseAboveGate,true);
});
test('setup check rejects sparse samples and inconsistent pitch',()=>{
 assert.equal(assessSetup([],[],-55).enough,false);
 const alternating=Array.from({length:30},(_,i)=>({level:-25,midi:i%2?40:52}));
 assert.equal(assessSetup(samples(-65,null),alternating,-55).stable,false);
});
