import { test } from 'node:test';
import assert from 'node:assert/strict';
import { beginSpider,advanceSpider } from '../src/practice/spiderRun.ts';
test('Spider Walk waits for exact pitch with no deadline and finishes on final match',()=>{
 const notes=[{midi:45},{midi:46}];let s=beginSpider(100);
 for(const [midi,captured,now] of [[57,200,201],[45,99,202],[45,300,299],[44,50000,50001]])assert.equal(advanceSpider(s,notes,midi,captured,now).index,0);
 s=advanceSpider(s,notes,45,60000,60001);assert.equal(s.index,1);assert.equal(s.completedAt,null);
 s=advanceSpider(s,notes,46,60002,60003);assert.equal(s.completedAt,60003);assert.equal(s.completedAt!-s.startedAt,59903);
 assert.equal(advanceSpider(s,notes,46,70000,70001),s);
});
test('identical Spider Walk notes require release and cannot reuse capture frames',()=>{
 const notes=[{midi:45},{midi:45}];let s=advanceSpider(beginSpider(0),notes,45,1,2);
 s=advanceSpider(s,notes,45,3,4);assert.equal(s.index,1);assert.equal(s.releaseRequired,true);
 s=advanceSpider(s,notes,null,5,6);assert.equal(s.releaseRequired,false);
 assert.equal(advanceSpider(s,notes,45,5,7),s);
 s=advanceSpider(s,notes,45,8,9);assert.equal(s.index,2);assert.equal(s.completedAt,9);
});
