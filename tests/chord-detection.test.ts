import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectChord } from '../src/audio/chordDetection.ts';
import { CHORDS } from '../src/practice/chords.ts';
import { frequencyFor } from '../src/audio/pitch.ts';
const tuning=[40,45,50,55,59,64];
function signal(notes:number[],rate:number,reference=440,harmonic=true){return Float32Array.from({length:8192},(_,i)=>notes.reduce((sum,midi,j)=>{const p=2*Math.PI*frequencyFor(midi,reference)*i/rate+j*.7;return sum+(.7+((j*3)%5)/10)*(Math.sin(p)+(harmonic?.4*Math.sin(2*p)+.23*Math.sin(3*p):0))/notes.length*.4;},0));}
for(const rate of [44100,48000])test(`recognizes all supported chord voicings at ${rate} Hz`,()=>{for(const c of CHORDS){const notes=c.frets.flatMap((f,i)=>f<0?[]:[tuning[i]+f]);assert.equal(detectChord(signal(notes,rate),rate)?.id,c.id,c.id);}});
test('chords reject silence, DC, invalid data, singles and unsupported chords',()=>{
 for(const value of [0,.2,NaN])assert.equal(detectChord(new Float32Array(8192).fill(value),48000),null);
 for(const midi of [40,48,52,55,64])assert.equal(detectChord(signal([midi],48000),48000),null);
 assert.equal(detectChord(signal([49,53,56],48000),48000),null);
 let seed=42;const noise=Float32Array.from({length:8192},()=>{seed=(1664525*seed+1013904223)>>>0;return (seed/4294967296-.5)*.3;});assert.equal(detectChord(noise,48000),null);
});
test('chord reference tuning and alternate octaves remain identifiable',()=>{
 for(const reference of [432,442])assert.equal(detectChord(signal([48,52,55,60],48000,reference),48000,-55,reference)?.id,'C');
 assert.equal(detectChord(signal([60,64,67],48000),48000)?.id,'C');
});
