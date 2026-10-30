import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHORDS,randomChords,validChordSet } from '../src/practice/chords.ts';
test('chord sets reject empty, duplicate and unknown entries',()=>{
 const s={id:'open-chords',name:'Open chords',chords:['C','Am']};
 assert.equal(validChordSet(s),true);
 for(const chords of [[],['C','C'],['unknown']])assert.equal(validChordSet({...s,chords}),false);
 assert.equal(validChordSet({...s,name:' '}),false);
});
test('random chords stay in the set and avoid consecutive repeats',()=>{
 const sequence=randomChords(['C','Am','G'],100,()=>.5);
 assert.equal(sequence.length,100);
 assert.ok(sequence.every((c,i)=>['C','Am','G'].includes(c)&&(i===0||c!==sequence[i-1])));
 assert.deepEqual(randomChords(['Em'],3),['Em','Em','Em']);
 assert.throws(()=>randomChords([],10));assert.throws(()=>randomChords(['C'],101));
});
test('catalog voicings contain the named chord tones in standard tuning',()=>{
 const roots:Record<string,number>={C:0,D:2,E:4,G:7,A:9,F:5,B:11};const tuning=[40,45,50,55,59,64];
 for(const chord of CHORDS){
  const root=roots[chord.id[0]];const intervals=chord.id.endsWith('m')?[0,3,7]:chord.id.endsWith('7')?[0,4,7,10]:[0,4,7];
  const expected=intervals.map(n=>(n+root)%12).sort((a,b)=>a-b);
  const actual=[...new Set(chord.frets.flatMap((f,i)=>f<0?[]:[(tuning[i]+f)%12]))].sort((a,b)=>a-b);
  assert.deepEqual(actual,expected,chord.id);
 }
});
