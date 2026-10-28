import { fastFrameSize } from '../src/audio/captureConfig.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectPitch,describePitch,frequencyFor } from '../src/audio/pitch.ts';
import { advanceSpider,beginSpider } from '../src/practice/spiderRun.ts';
for(const rate of [44100,48000,96000]){
 test(`short-window guitar signals retain pitch and octave at ${rate} Hz`,()=>{
  for(const midi of [38,40,45,50,55,59,64,76]){
   const samples=Float32Array.from({length:fastFrameSize(rate)},(_,i)=>{const p=2*Math.PI*frequencyFor(midi)*i/rate;return .15*Math.sin(p)+.4*Math.sin(2*p)+.2*Math.sin(3*p);});
   const pitch=detectPitch(samples,rate);assert.ok(pitch);assert.equal(describePitch(pitch.frequency).midi,midi);
  }
  assert.equal(detectPitch(new Float32Array(fastFrameSize(rate)),rate),null);
 });
}
for(const duration of [100,125])test(`fast synthetic Spider Walk at ${duration} ms per note`,()=>{
 const rate=48000,notes=[45,46,48,47,50,51,53,52].map(midi=>({midi}));let run=beginSpider(0);
 for(let now=50;now<notes.length*duration;now+=1000/60){
  const samples=Float32Array.from({length:2048},(_,i)=>{const time=now-(2048-i)/rate*1000;const index=Math.floor(time/duration);if(index<0||index>=notes.length)return 0;const phase=2*Math.PI*frequencyFor(notes[index].midi)*time/1000;return .2*Math.sin(phase)+.3*Math.sin(2*phase)+.1*Math.sin(3*phase);});
  const pitch=detectPitch(samples,rate);run=advanceSpider(run,notes,pitch?describePitch(pitch.frequency).midi:null,now-2048/rate*1000,now+2);
 }
 assert.equal(run.index,notes.length);
});
