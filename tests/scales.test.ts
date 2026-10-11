import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scaleNotes,startOrdered,acceptOrdered} from '../src/practice/scales.ts';
test('scale intervals transpose accurately',()=>{
 assert.deepEqual(scaleNotes(0,'major'),[48,50,52,53,55,57,59]);
 assert.deepEqual(scaleNotes(9,'minor'),[57,59,60,62,64,65,67]);
 assert.deepEqual(scaleNotes(0,'minor-pentatonic'),[48,51,53,55,58]);
});
test('ordered scale waits indefinitely, rejects wrong and stale notes, accepts any octave',()=>{
 let s=startOrdered(100);
 s=acceptOrdered(s,[48,50,48],1,49,200,201);assert.equal(s.index,0);
 s=acceptOrdered(s,[48,50,48],1,60,99,201);assert.equal(s.index,0);
 s=acceptOrdered(s,[48,50,48],1,60,100000,100001);assert.equal(s.index,1);
 s=acceptOrdered(s,[48,50,48],1,62,100002,100003);assert.equal(s.index,2);
 s=acceptOrdered(s,[48,50,48],1,72,100004,100005);assert.equal(s.completedAt,100005);
 assert.equal(s.completedAt!-s.startedAt,99905);
});
test('repeated scales require release at root boundary and finish exactly nth repetition',()=>{
 const notes=[48,50,60];let s=startOrdered(0);
 for(const [m,t] of [[48,10],[50,20],[60,30]])s=acceptOrdered(s,notes,2,m,t,t+1);
 assert.equal(s.index,3);assert.equal(s.releaseRequired,true);
 s=acceptOrdered(s,notes,2,60,40,41);assert.equal(s.index,3);
 s=acceptOrdered(s,notes,2,null,50,51);assert.equal(s.releaseRequired,false);
 for(const [m,t] of [[48,60],[50,70],[60,80]])s=acceptOrdered(s,notes,2,m,t,t+1);
 assert.equal(s.index,6);assert.equal(s.completedAt,81);
 assert.equal(acceptOrdered(s,notes,2,60,90,91),s);
});
