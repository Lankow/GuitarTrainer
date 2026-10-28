import { test } from 'node:test';
import assert from 'node:assert/strict';
import { expandSpider, migrateSpiderLibrary, validSpiderLibrary, validSpiderPattern, exportSpiderPatterns, parseSpiderPatterns, type SpiderPattern } from '../src/practice/spiderLibrary.ts';
import { DEFAULT_WALK, walkSequence } from '../src/practice/spiderRoutine.ts';
const pattern:SpiderPattern={id:'test',name:'Test',frets:12,records:[{notes:[5,6,8,7].map(fret=>({string:6,fret})),repetitions:2},{notes:[{string:1,fret:0}],repetitions:1}]};
test('creator preserves clicked order, repetitions, record order and tuning',()=>{
 const notes=expandSpider(pattern,'standard');assert.deepEqual(notes.map(n=>n.fret),[5,6,8,7,5,6,8,7,0]);assert.equal(notes[0].midi,45);assert.equal(notes[8].midi,64);
 assert.deepEqual(notes.map(n=>n.record),[0,0,0,0,0,0,0,0,1]);
});
test('legacy walk migration preserves all positions, order and repeats',()=>{
 const library=migrateSpiderLibrary(DEFAULT_WALK);assert.equal(validSpiderLibrary(library),true);
 assert.deepEqual(expandSpider(library.patterns[0],library.tuning).map(n=>[n.string,n.fret,n.midi]),walkSequence(DEFAULT_WALK).map(n=>[n.string,n.fret,n.midi]));
});
test('walk files roundtrip and reject malformed or oversized content',()=>{
 assert.deepEqual(parseSpiderPatterns(exportSpiderPatterns([pattern])),[pattern]);
 for(const p of [{...pattern,frets:4},{...pattern,records:[]},{...pattern,records:[{notes:[{string:7,fret:2}],repetitions:1}]},{...pattern,records:[{notes:[{string:1,fret:2}],repetitions:0}]}])assert.equal(validSpiderPattern(p),false);
 assert.throws(()=>parseSpiderPatterns('{'));
 assert.throws(()=>parseSpiderPatterns(JSON.stringify({format:'GuitarTrainer Spider Walks',version:2,patterns:[pattern]})));
 assert.throws(()=>parseSpiderPatterns(' '.repeat(256*1024+1)));
});
test('empty libraries remain valid and require an empty selection',()=>{
 const library={patterns:[],selected:'',tuning:'standard',bpm:60,audible:false};
 assert.equal(validSpiderLibrary(library),true);
 assert.equal(validSpiderLibrary({...library,selected:'legacy-walk'}),false);
 assert.equal(validSpiderLibrary({...library,patterns:[pattern]}),false);
});
import { repeatSpider } from '../src/practice/spiderLibrary.ts';
test('pattern repetitions repeat the whole walk after its record repetitions',()=>{
 const sequence=repeatSpider(pattern,'standard',2);
 const single=expandSpider(pattern,'standard');
 assert.deepEqual(sequence.map(n=>n.midi),[...single,...single].map(n=>n.midi));
 assert.equal(sequence[8].record,1);assert.equal(sequence[9].record,0);
 assert.equal(sequence[9].patternRepetition,1);
 assert.throws(()=>repeatSpider(pattern,'standard',0));
 assert.throws(()=>repeatSpider(pattern,'standard',101));
 assert.equal(validSpiderLibrary({patterns:[pattern],selected:pattern.id,tuning:'standard',bpm:60,audible:false,patternRepetitions:2}),true);
});
import { spiderTempo } from '../src/practice/spiderLibrary.ts';
test('pattern tempo increments by full repetition and caps at 240',()=>{
 assert.equal(spiderTempo(60,5,0),60);assert.equal(spiderTempo(60,5,2),70);
 assert.equal(spiderTempo(230,20,2),240);assert.equal(spiderTempo(60,undefined,5),60);
});
