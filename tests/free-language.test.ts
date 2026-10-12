import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startOrdered,acceptOrdered } from '../src/practice/scales.ts';
import { validOptions,DEFAULT_OPTIONS } from '../src/optionsSchema.ts';
import { validFree,FREE_DEFAULTS } from '../src/practice/freeSetup.ts';
import { translate } from '../src/translation.ts';
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
