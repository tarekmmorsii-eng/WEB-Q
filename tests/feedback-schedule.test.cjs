const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const code=fs.readFileSync('scripts/google_feedback_schedule.js','utf8');
function fixture({enabled=false,fail=false,existing=false}={}){
 const data={FEEDBACK_RETENTION_ENABLED:String(enabled)},calls=[];
 const chain={timeBased(){return this},everyDays(n){assert.equal(n,1);return this},atHour(n){assert.equal(n,3);return this},inTimezone(z){assert.equal(z,'Europe/Istanbul');return this},create(){calls.push('create');return{getUniqueId:()=> 'trigger'}}};
 const c={RETENTION_OWNER:'owner',Session:{getEffectiveUser:()=>({getEmail:()=> 'owner'})},console:{log(){}},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){calls.push('unlock')}})},PropertiesService:{getScriptProperties:()=>({getProperty:k=>data[k],setProperty:(k,v)=>data[k]=v})},ScriptApp:{getProjectTriggers:()=>existing?[{getHandlerFunction:()=> 'dailyFeedbackRetention'}]:[],newTrigger:name=>{assert.equal(name,'dailyFeedbackRetention');return chain}},runFeedbackRetention:async()=>{calls.push('run');if(fail)throw Error('failure');return[{status:'deleted'}]}};
 vm.createContext(c);vm.runInContext(code,c);return{c,data,calls};
}
test('disabled daily job does nothing',async()=>{const{c,calls}=fixture();await c.dailyFeedbackRetention();assert.deepEqual(calls,[])});
test('daily success and failure leave accurate status',async()=>{for(const fail of [false,true]){const{c,data}=fixture({enabled:true,fail});if(fail)await assert.rejects(c.dailyFeedbackRetention());else await c.dailyFeedbackRetention();assert.equal(JSON.parse(data.FEEDBACK_RETENTION_LAST_RUN).status,fail?'failed':'success')}});
test('installer creates daily trigger before enabling; refuses duplicate',()=>{const{c,data,calls}=fixture();c.installApprovedFeedbackSchedule();assert.equal(data.FEEDBACK_RETENTION_ENABLED,'true');assert.deepEqual(calls,['create','unlock']);const f=fixture({existing:true});assert.throws(()=>f.c.installApprovedFeedbackSchedule());assert.ok(!f.calls.includes('create'))});
