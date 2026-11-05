const test = require('node:test');
const assert = require('node:assert/strict');
const {RETENTION_MS, planRetention, executeRetention} = require('../scripts/feedback_retention_engine.cjs');
const now = Date.UTC(2026, 9, 24);
const id = '12345678-1234-1234-1234-123456789abc';
const secondId = '22345678-1234-1234-1234-123456789abc';
const old = {id, receivedAt: now - RETENTION_MS, fileId: 'image', hasScreenshot: true};

test('90-day boundary and newer record', () => {
 assert.equal(planRetention([old], now)[0].eligible, true);
 assert.equal(planRetention([{...old, receivedAt: old.receivedAt + 1}], now)[0].reason, 'not-expired');
});
test('invalid dates, legacy and duplicate references require review', () => {
 assert.equal(planRetention([{...old, receivedAt: NaN}], now)[0].reason, 'invalid-date');
 assert.equal(planRetention([{...old, id: ''}], now)[0].eligible, false);
 assert.ok(planRetention([old, {...old}], now).every(row => !row.eligible));
});
test('image referenced by a newer record is protected', () => {
 assert.equal(planRetention([old, {...old, id: secondId, receivedAt: now}], now)[0].reason, 'shared-file');
 assert.equal(planRetention([{...old, fileId: ''}], now)[0].reason, 'missing-file-reference');
});
function fake(failure) {
 const calls = [], progress = {verified:true, fileDeleted:false, messageIds:['exact-message']};
 const adapter = {
  withLock: async callback => {calls.push('lock');try{return await callback()}finally{calls.push('unlock')}},
  readRecords:async()=>[old],
  prepareVerifiedResources:async()=>progress,
  deleteVerifiedFile:async()=>{calls.push('file');if(failure === 'file')throw Error('failed')},
  markFileDeleted:async()=>{progress.fileDeleted=true},
  deleteVerifiedMessage:async(record, message)=>{calls.push(message);if(failure === 'mail'){failure=null;throw Error('failed')}},
  markMessageDeleted:async()=>{progress.messageIds=[]},
  deleteRecordById:async()=>calls.push('row')
 };
 return {adapter,calls,progress};
}
test('default preview performs no deletion',async()=>{
 const {adapter,calls}=fake();await executeRetention(adapter,now);
 assert.deepEqual(calls,['lock','unlock']);
});
test('verified resources deleted before record, under lock',async()=>{
 const {adapter,calls}=fake();const result=await executeRetention(adapter,now,{dryRun:false});
 assert.equal(result[0].status,'deleted');
 assert.deepEqual(calls,['lock','file','exact-message','row','unlock']);
});
test('file failure preserves record and mail',async()=>{
 const {adapter,calls}=fake('file');const result=await executeRetention(adapter,now,{dryRun:false});
 assert.equal(result[0].status,'retry-required');assert.deepEqual(calls,['lock','file','unlock']);
});
test('mail failure preserves references and retry skips deleted image',async()=>{
 const {adapter,calls}=fake('mail');await executeRetention(adapter,now,{dryRun:false});
 assert.ok(!calls.includes('row'));
 const result=await executeRetention(adapter,now,{dryRun:false});
 assert.equal(result[0].status,'deleted');assert.equal(calls.filter(x=>x==='file').length,1);
});
test('unverified mail or image ownership prevents all deletion',async()=>{
 const {adapter,calls,progress}=fake();progress.verified=false;
 await executeRetention(adapter,now,{dryRun:false});assert.deepEqual(calls,['lock','unlock']);
});
