import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startOrdered,acceptOrdered } from '../src/practice/scales.ts';
import { validOptions,DEFAULT_OPTIONS } from '../src/optionsSchema.ts';
import { validFree,FREE_DEFAULTS } from '../src/practice/freeSetup.ts';
import { translate } from '../src/translation.ts';
import { polish } from '../src/polish.ts';
import { spanish } from '../src/spanish.ts';
test('untimed notes wait indefinitely, reject wrong notes and accept any octave',()=>{
 let s=startOrdered(100); s=acceptOrdered(s,[40,40,45],1,41,100000,100001); assert.equal(s.index,0);
 s=acceptOrdered(s,[40,40,45],1,52,100002,100003);assert.equal(s.index,1);
 s=acceptOrdered(s,[40,40,45],1,52,100004,100005);assert.equal(s.index,1);
 s=acceptOrdered(s,[40,40,45],1,null,100006,100007);
 s=acceptOrdered(s,[40,40,45],1,64,100008,100009);assert.equal(s.index,2);
 s=acceptOrdered(s,[40,40,45],1,57,100010,100011);assert.equal(s.completedAt,100011);
});
test('new settings validate language, modes and tempo bounds',()=>{
 assert.equal(validOptions(DEFAULT_OPTIONS),true);assert.equal(validOptions({...DEFAULT_OPTIONS,language:'de'}),false);
 assert.equal(validOptions({...DEFAULT_OPTIONS,bpm:0}),false);assert.equal(validOptions({...DEFAULT_OPTIONS,beats:13}),false);
 assert.equal(validFree(FREE_DEFAULTS),true);assert.equal(validFree({...FREE_DEFAULTS,count:0}),false);
});
test('translations preserve note spelling and interpolate without changing data',()=>{
 assert.equal(translate('pl','Settings'),'Ustawienia');assert.equal(translate('en','Settings'),'Settings');
 assert.equal(translate('pl','Hearing {0}','C♯'),'Słychać C♯');assert.equal(translate('pl','GuitarTrainer'),'GuitarTrainer');
});
test('Polish translations preserve every interpolation placeholder',()=>{
 for(const [key,value] of Object.entries(polish)) {
  const placeholders=(text:string)=>[...text.matchAll(/\{\d+\}/g)].map(m=>m[0]).sort();
  assert.deepEqual(placeholders(value),placeholders(key),key);
 }
});
test('Polish count labels work for singular, plural and teen values',()=>{
 for(const count of [0,1,2,5,12,22,100]) {
  assert.equal(translate('pl','Repetitions: {0}',count),`Liczba powtórzeń: ${count}`);
  assert.equal(translate('pl','Pattern blocks: {0}',count),`Bloki ćwiczenia: ${count}`);
 }
 assert.equal(translate('pl','Root note'),'Tonika');
 assert.equal(translate('pl','Manual guide · no audio'),'We własnym tempie · bez mikrofonu');
});
test('Spanish covers the translation catalog and preserves placeholders',()=>{
 assert.deepEqual(Object.keys(spanish).sort(),Object.keys(polish).sort());
 for(const [key,value] of Object.entries(spanish)) {
  const placeholders=(text:string)=>[...text.matchAll(/\{\d+\}/g)].map(m=>m[0]).sort();
  assert.ok(value.trim(),key);
  assert.deepEqual(placeholders(value),placeholders(key),key);
 }
 assert.equal(validOptions({...DEFAULT_OPTIONS,language:'es'}),true);
 assert.equal(translate('es','Hearing {0}','C♯'),'Se detecta C♯');
 assert.equal(translate('es','Invalid settings section: audio.'),'Sección de ajustes no válida: audio.');
 assert.equal(translate('es','Unknown external error'),'Unknown external error');
});
