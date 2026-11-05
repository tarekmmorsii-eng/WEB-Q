const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const engine=fs.readFileSync('scripts/feedback_retention_engine.cjs','utf8').replace(/module.exports = .*;/,'');
const adapterSource=fs.readFileSync('scripts/feedback_schema.js','utf8')+'\n'+fs.readFileSync('scripts/google_feedback_retention.js','utf8');
const id='12345678-1234-1234-1234-123456789abc',owner='tarek.m.morsii@gmail.com';
function setup(options={}){
 const calls=[],props={FEEDBACK_SCREENSHOTS_FOLDER_ID:'folder',FEEDBACK_RETENTION_ENABLED:'true'};
 const received=new Date(Date.now()-91*86400000);
 const values=[received,'','','','private message','','','','','','https://drive.google.com/file/d/image/view',id,'image'];
 const file={name:'feedback-'+id+'.jpg',parents:[options.wrongFolder?'other':'folder'],ownedByMe:true,mimeType:'image/jpeg'};
 let messages=options.noMail?[]:['mail'];
 const sheet={getMaxRows:()=>options.minimumRows?2:1000,getLastColumn:()=>13,getLastRow:()=>2,getRange:(row)=>({getValues:()=>row===1?[['Date','Type','SubType','SubTypeLabel','Message','Context','Device','Info','Android Version','Phone Model','Screenshot URL','Feedback ID','Screenshot File ID']]:[values],clearContent:()=>calls.push('clear')}),deleteRow:()=>calls.push('row')};
 const context={SHEET_NAME:'الورقة1',Date,console:{log(){}},
 PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k],setProperty:(k,v)=>{props[k]=v},deleteProperty:k=>{delete props[k]}})},
 Session:{getEffectiveUser:()=>({getEmail:()=>options.wrongOwner?'other@example.com':owner})},
 LockService:{getScriptLock:()=>({waitLock(){calls.push('lock')},releaseLock(){calls.push('unlock')}})},
 SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet})},
 Drive:{Files:{get:()=>file,remove:()=>{calls.push('file');if(options.fileFails)throw Error('failed')}}},
 Gmail:{Users:{Messages:{list:()=>({messages:messages.map(id=>({id}))}),get:()=>({internalDate:String(received.getTime()),payload:{headers:[
 {name:'Subject',value:options.wrongSubject?'Unrelated':'ملاحظة جديدة في تطبيق المصحف [feedback:'+id+']'},
 {name:'From',value:owner},{name:'To',value:owner}]}}),remove:(user,message)=>{calls.push(message);messages=[]}}}}};
 vm.createContext(context);vm.runInContext(engine+'\n'+adapterSource,context);
 return {context,calls,props};
}
test('Google preview verifies without deleting or saving checkpoints',async()=>{
 const {context,calls,props}=setup();const plan=await context.previewFeedbackRetention();
 assert.equal(plan[0].resources,'verified');assert.deepEqual(calls,['lock','unlock']);assert.equal(Object.keys(props).length,2);
});
test('Google adapter removes exact resources before row',async()=>{
 const {context,calls}=setup();await context.runFeedbackRetention();assert.deepEqual(calls,['lock','file','mail','row','unlock']);
});
test('last unfrozen row is cleared after resources, not deleted',async()=>{const {context,calls}=setup({minimumRows:true});await context.runFeedbackRetention();assert.deepEqual(calls,['lock','file','mail','clear','unlock']);});
for(const option of ['wrongFolder','wrongSubject','noMail','fileFails'])test(option+' preserves row',async()=>{
 const {context,calls}=setup({[option]:true});await assert.rejects(context.runFeedbackRetention());assert.ok(!calls.includes('row'));assert.ok(!calls.includes('mail'));
});
test('wrong account denied with lock released',async()=>{
 const {context,calls}=setup({wrongOwner:true});await assert.rejects(context.previewFeedbackRetention());assert.deepEqual(calls,['lock','unlock']);
});
test('execution disabled unless explicitly enabled',async()=>{
 const {context,calls,props}=setup();delete props.FEEDBACK_RETENTION_ENABLED;
 await assert.rejects(context.runFeedbackRetention());assert.deepEqual(calls,[]);
});
