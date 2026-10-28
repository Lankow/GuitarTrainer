import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readSelection, toggleSharps, ALL_NOTES, NATURAL_NOTES } from '../src/practice/noteSelection.ts';
import { validFree, FREE_DEFAULTS } from '../src/practice/freeSetup.ts';
test('note selection migrates legacy strings and preserves empty selections', () => {
 assert.deepEqual(readSelection({tuning:'standard',notes:[40,64,45]}),{notes:[64,69],sharps:false});
 assert.deepEqual(readSelection({notes:[],sharps:true}),{notes:[],sharps:true});
 assert.equal(readSelection({notes:[61],sharps:false}),null);
 assert.equal(readSelection({notes:[60,60],sharps:true}),null);
});
test('chromatic pool supports all notes and disabling sharps excludes hidden targets',()=>{
 assert.deepEqual(readSelection({notes:ALL_NOTES,sharps:true})?.notes,ALL_NOTES);
 assert.deepEqual(toggleSharps({notes:ALL_NOTES,sharps:true},false).notes,NATURAL_NOTES);
 assert.equal(validFree({...FREE_DEFAULTS,selected:ALL_NOTES,sharps:true}),true);
 assert.equal(validFree({...FREE_DEFAULTS,selected:[61],sharps:false}),false);
});
import { selectedNoteName, toggleAccidentals } from '../src/practice/noteSelection.ts';
test('flat options preserve pitch selections and validate persisted data',()=>{
 const flat={notes:[61,63],sharps:false,flats:true};
 assert.deepEqual(readSelection(flat),flat);
 assert.equal(selectedNoteName(61,flat),'D♭');
 assert.equal(selectedNoteName(73,{sharps:true,flats:true}),'C♯ / D♭');
 assert.equal(selectedNoteName(60,flat),'C');
 assert.deepEqual(toggleAccidentals(flat,'flats',false).notes,[]);
 assert.deepEqual(toggleAccidentals({...flat,sharps:true},'flats',false).notes,[61,63]);
 assert.equal(readSelection({...flat,flats:'yes'}),null);
 assert.equal(validFree({...FREE_DEFAULTS,selected:[61],flats:true}),true);
});
