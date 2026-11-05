const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const source=fs.readFileSync('scripts/feedback_schema.js','utf8')+'\n'+fs.readFileSync('scripts/google_apps_script_code.js','utf8');
function setup(failWrite=false,failMail=false,modern=false){
 const state={rows:[],headers:[],created:0,trashed:false,released:false,mails:[]};
 const file={getId:()=> 'image-file-id',getUrl:()=> 'https://drive.google.com/file/d/test/view',setTrashed:v=>state.trashed=v};
 const folder={getId:()=> 'folder',createFile:b=>{state.created++;state.blob=b;return file}};
 const columns=modern?['وقت الاستلام','الملاحظة','إصدار أندرويد','الشركة','موديل الهاتف','الصورة','سياق الملاحظة','مصدر الإرسال','بيانات تقنية','رقم الملاحظة','معرّف الصورة']:['Date','Type','SubType','SubTypeLabel','Message','Context','Device','Info','Android Version','Phone Model','Screenshot URL','Feedback ID','Screenshot File ID'];
 const sheet={getLastColumn:()=>columns.length,getMaxRows:()=>1,insertRowsAfter:()=>{state.expanded=true},getLastRow:()=>1,getRange:(row,col,n,cols)=>({getValues:()=>[columns],setValue:v=>state.headers.push(v),setValues:v=>{if(failWrite)throw Error('write failed');state.rows.push(v[0])}})};
 const context={LockService:{getScriptLock:()=>({waitLock(){},hasLock:()=>true,releaseLock:()=>state.released=true})},SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:()=>sheet})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null,setProperty(){}})},DriveApp:{createFolder:()=>folder,getFolderById:()=>folder},Utilities:{base64Decode:v=>Array.from(Buffer.from(v,'base64')),newBlob:(bytes,type,name)=>({bytes,type,name}),getUuid:()=> 'test-id'},ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({setMimeType:()=>JSON.parse(text)})}};
 context.SpreadsheetApp.getActiveSpreadsheet=()=>({getSheetByName:()=>sheet,getUrl:()=> 'https://docs.google.com/spreadsheets/d/test/edit'});
 context.MailApp={sendEmail:(...args)=>{if(failMail)throw Error('mail unavailable');state.mails.push(args)}};
 vm.createContext(context);vm.runInContext(source,context);return{state,send:data=>context.doPost({postData:{contents:JSON.stringify(data)}})};
}
const jpeg={mimeType:'image/jpeg',base64:Buffer.from([255,216,255,224,0,0,255,217]).toString('base64')};

test('server reference links row, screenshot and mail, ignoring supplied identity',()=>{
 const {state,send}=setup();
 assert.equal(send({message:'Linked',feedbackId:'untrusted',screenshot:jpeg}).result,'success');
 assert.equal(state.rows[0][11],'test-id');
 assert.equal(state.rows[0][12],'image-file-id');
 assert.equal(state.blob.name,'feedback-test-id.jpg');
 assert.match(state.mails[0][1],/\[feedback:test-id\]/);
 assert.match(state.mails[0][2],/test-id/);
 assert.equal(state.rows[0][7],'');
});

test('reference exists without screenshot, with no fabricated file ID',()=>{
 const {state,send}=setup();send({message:'No screenshot'});
 assert.equal(state.rows[0][11],'test-id');
 assert.equal(state.rows[0][12],'');
 assert.equal(state.rows[0][10],'');
 assert.match(state.mails[0][1],/\[feedback:test-id\]/);
});
test('stores device fields and private screenshot link in appended columns',()=>{const {state,send}=setup();assert.equal(send({message:'Problem',deviceInfo:{androidVersion:'10',phoneModel:'Samsung A30s'},screenshot:jpeg}).result,'success');assert.equal(state.created,1);assert.equal(state.rows[0][8],'10');assert.equal(state.rows[0][9],'Samsung A30s');assert.match(state.rows[0][10],/drive.google.com/);assert.equal(state.released,true)});
test('accepts old payload without image and prevents spreadsheet formulas',()=>{const {state,send}=setup();assert.equal(send({message:'=IMPORTXML("x")'}).result,'success');assert.equal(state.created,0);assert.equal(state.rows[0][4][0],"'")});
test('rejects fake image before creating Drive file',()=>{const {state,send}=setup();assert.equal(send({message:'Problem',screenshot:{mimeType:'image/jpeg',base64:Buffer.from('not an image').toString('base64')}}).result,'error');assert.equal(state.created,0);assert.equal(state.rows.length,0)});
test('cleans uploaded screenshot if row write fails',()=>{const {state,send}=setup(true);assert.equal(send({message:'Problem',screenshot:jpeg}).result,'error');assert.equal(state.trashed,true);assert.equal(state.released,true)});
test('rejects empty feedback',()=>{const {state,send}=setup();assert.equal(send({message:'  '}).result,'error');assert.equal(state.created,0)});
test('email includes feedback, sheet and screenshot links after saving',()=>{const {state,send}=setup();assert.equal(send({message:'Delivery check',screenshot:jpeg}).result,'success');assert.equal(state.mails.length,1);assert.equal(state.mails[0][0],'tarek.m.morsii@gmail.com');assert.match(state.mails[0][2],/Delivery check/);assert.match(state.mails[0][2],/docs.google.com/);assert.match(state.mails[0][2],/drive.google.com/)});
test('mail failure preserves saved row and screenshot',()=>{const {state,send}=setup(false,true);assert.equal(send({message:'Delivery check',screenshot:jpeg}).result,'success');assert.equal(state.rows.length,1);assert.equal(state.trashed,false);assert.equal(state.released,true)});



test('v1.9 separates phone brand/model, grows a header-only sheet and keeps reference mapping',()=>{const {state,send}=setup(false,false,true);assert.equal(send({message:'New form',deviceInfo:{phoneBrand:'Samsung',phoneModel:'A30',androidVersion:'16'},screenshot:jpeg}).result,'success');assert.equal(state.rows[0].length,11);assert.equal(state.rows[0][1],'New form');assert.equal(state.rows[0][3],'Samsung');assert.equal(state.rows[0][4],'A30');assert.equal(state.rows[0][9],'test-id');assert.equal(state.rows[0][10],'image-file-id');assert.equal(state.expanded,true)});
