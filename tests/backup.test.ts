import {test} from 'node:test';
import assert from 'node:assert/strict';
import {collectBackup,parseBackup,restoreBackup,STORAGE_KEYS,COOKIE_KEYS,type BackupStore} from '../src/backup.ts';
import {DEFAULT_WALK} from '../src/practice/spiderRoutine.ts';
function fixture() {
 const values=new Map<string,string>();
 values.set(STORAGE_KEYS[0],JSON.stringify({device:'mic',gate:-55,reference:440,color:'#f5a45d',tuning:'standard'}));
 values.set('guitartrainer.spider.v2',JSON.stringify(DEFAULT_WALK));
 values.set(COOKIE_KEYS[0],'Player');values.set(COOKIE_KEYS[1],JSON.stringify([{key:'test',score:10}]));
 const write=(k:string,v:string|null)=>{if(v===null)values.delete(k);else values.set(k,v);};
 const store:BackupStore={get:k=>values.get(k)??null,set:write,getCookie:k=>values.get(k)??null,setCookie:write};
 return {values,store};
}
test('backup round trips all app sections and leaves unrelated storage alone',()=>{
 const {store,values}=fixture(); const backup=collectBackup(store);
 values.set('unrelated','keep');values.set(STORAGE_KEYS[1],'temporary');
 restoreBackup(parseBackup(JSON.stringify(backup)),store);
 assert.deepEqual(collectBackup(store).storage,backup.storage);
 assert.equal(values.get('unrelated'),'keep');assert.equal(values.has(STORAGE_KEYS[1]),false);
 assert.equal(store.getCookie(COOKIE_KEYS[0]),'Player');
});
test('invalid or future backup is rejected before any writes',()=>{
 const {store}=fixture();const base=collectBackup(store);
 for(const change of [{...base,version:2},{...base,storage:{...base.storage,extra:1}},{...base,storage:{...base.storage,[STORAGE_KEYS[0]]:{color:'bad'}}},{...base,cookies:{...base.cookies,guitartrainer_scores_v1:'not json'}}]) {
  let writes=0;
  assert.throws(()=>restoreBackup(change as typeof base,{...store,set:()=>{writes++;},setCookie:()=>{writes++;}}));assert.equal(writes,0);
 }
 assert.throws(()=>parseBackup('{'));assert.throws(()=>parseBackup(' '.repeat(262145)));
});
test('partial import rolls back local storage and cookies on write failure',()=>{
 const {store,values}=fixture(); const backup=collectBackup(store);backup.cookies.guitartrainer_nickname='Imported';backup.storage[STORAGE_KEYS[0]]=null;
 const old=new Map(values);let failed=false;
 assert.throws(()=>restoreBackup(backup,{...store,setCookie:(k,v)=>{if(!failed){failed=true;throw new Error('blocked');}store.setCookie(k,v);}}),/previous settings were restored/);
 assert.deepEqual(values,old);
});
test('silently blocked cookie writes are detected',()=>{
 const {store}=fixture();const backup=collectBackup(store);backup.cookies.guitartrainer_nickname='New';
 assert.throws(()=>restoreBackup(backup,{...store,setCookie:()=>{}}),/Import failed/);
});

test('older backups accept new optional settings; new backups preserve language and untimed choices',()=>{
 const {store,values}=fixture();const old=collectBackup(store);
 delete old.storage['guitartrainer.options.v1'];delete old.storage['guitartrainer.free.v1'];
 const restored=parseBackup(JSON.stringify(old));assert.equal(restored.storage['guitartrainer.options.v1'],null);
 values.set('guitartrainer.options.v1',JSON.stringify({language:'pl',noteMode:'free',scaleMode:'free',spiderMode:'manual',bpm:96,beats:3}));
 const current=collectBackup(store);assert.equal((current.storage['guitartrainer.options.v1'] as {language:string}).language,'pl');
 restoreBackup(current,store);assert.deepEqual(collectBackup(store).storage,current.storage);
});
