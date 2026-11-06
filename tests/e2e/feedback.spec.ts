import {test,expect} from '@playwright/test';
import {build} from 'esbuild';
import fs from 'node:fs';
import type {Language, Translations} from '../../i18n/translations';
const localeNames=[...fs.readFileSync('i18n/translations.ts','utf8').matchAll(/^import (\w+) from '\.\.\/src\/assets\/i18n\//gm)].map(match=>match[1]);
const translations=Object.fromEntries(localeNames.map(language=>[language,JSON.parse(fs.readFileSync(`src/assets/i18n/${language}.json`,'utf8'))])) as Record<Language,Translations>;
let script:string,css:string;
test.beforeEach(async({page})=>{page.on('dialog',dialog=>dialog.accept());});
test.beforeAll(async()=>{
 const result=await build({stdin:{contents:`
 import React from 'react';import{createRoot}from'react-dom/client';
 import MeasurementConsent from './components/MeasurementConsent';import FeedbackModal from './components/FeedbackModal';import{FeedbackProvider,useFeedback}from'./contexts/FeedbackContext';
 function App(){const {openFeedback}=useFeedback();return <><button onClick={()=>openFeedback('interface_notes')}>Open feedback</button><FeedbackModal/><MeasurementConsent language={window.testLanguage||'ar'} ready={!!window.testAgeDialog}/></>}
 createRoot(document.getElementById('root')).render(<FeedbackProvider language={window.testLanguage||'ar'}><App/></FeedbackProvider>);
 `,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',plugins:[{name:'native',setup(b){b.onResolve({filter:/measurementConsent$/},()=>({path:'consent',namespace:'consent'}));b.onLoad({filter:/.*/,namespace:'consent'},()=>({contents:'export const applyMeasurementChoice=async()=>{};'}));b.onResolve({filter:/^@capacitor\/core$/},()=>({path:'core',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export const Capacitor={isNativePlatform:()=>false,getPlatform:()=>window.nativeImageChoice?"android":"web",isPluginAvailable:()=>!!window.nativeImageChoice};export const registerPlugin=()=>({choose:()=>window.nativeImageChoice()});'}))}}]});
 script=result.outputFiles[0].text;
 const file=fs.readdirSync('dist/assets').find(n=>n.startsWith('index-')&&n.endsWith('.css'))!;css=fs.readFileSync('dist/assets/'+file,'utf8');
});
async function open(page:any,language='ar',ageDialog=false){
 await page.route('https://feedback.test/**',(route:any)=>route.fulfill({contentType:'text/html',body:'<div id="root"></div>'}));
 await page.goto('https://feedback.test');
 await page.setContent('<div id="root"></div>');
 await page.addStyleTag({content:css+' :root{--bg-card:#fff;--bg-secondary:#f5f0e8;--border-primary:#e4d8c7;--text-primary:#253044;} body{margin:0;background:#dad5ce;font-family:Arial,sans-serif;}'});
 await page.evaluate(({language,ageDialog})=>{const w=window as any;w.testLanguage=language;w.testAgeDialog=ageDialog;localStorage.setItem("mushaf_measurement_choice_v1",JSON.stringify({version:1,age:"adult",allowed:false}));w.sent=[];w.fetch=async(_url:any,options:any)=>{w.sent.push(JSON.parse(options.body));return {type:'opaque'}};},{language,ageDialog});
 await page.addScriptTag({content:script});await page.getByRole('button',{name:'Open feedback',exact:true}).click();
}
async function imageBuffer(page:any){return Buffer.from(await page.evaluate(()=>{const c=document.createElement('canvas');c.width=720;c.height=1280;const x=c.getContext('2d')!;x.fillStyle='#f5f0e8';x.fillRect(0,0,720,1280);x.fillStyle='#253044';x.font='35px sans-serif';x.fillText('Sample screenshot',30,90);return c.toDataURL('image/png').split(',')[1]}),'base64')}
test('mobile form sends Android, custom model and prepared screenshot',async({page})=>{
 await page.setViewportSize({width:360,height:740});await open(page);
 await page.getByLabel('إصدار أندرويد',{exact:true}).selectOption('10');
 await page.getByLabel('الشركة المصنّعة للهاتف').fill('Samsung');
 await page.getByLabel('موديل الهاتف أو رقم الطراز').fill('SM-A307FN');
 await expect(page.locator('datalist option[value="Samsung"]')).toHaveCount(1);
 await expect(page.locator('datalist option[value="Samsung Galaxy A30s"]')).toHaveCount(0);
 await page.getByLabel('تفاصيل الملاحظة').fill('السطر الأخير غير ظاهر بعد البحث');
 await page.locator('input[type=file]').setInputFiles({name:'screen.png',mimeType:'image/png',buffer:await imageBuffer(page)});
 await expect(page.getByAltText('لقطة شاشة',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'إرسال ملاحظة',exact:true}).scrollIntoViewIfNeeded();
 await expect(page.getByRole('button',{name:'إغلاق الملاحظات'})).toBeInViewport();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
 await page.screenshot({path:'artifacts/feedback-mobile.png'});
 await page.getByRole('button',{name:'إرسال ملاحظة',exact:true}).click();
 const payload=await page.evaluate(()=>(window as any).sent[0]);
 expect(payload.deviceInfo).toMatchObject({androidVersion:'10',phoneBrand:'Samsung',phoneModel:'SM-A307FN'});
 expect(payload.deviceInfo).not.toHaveProperty('url');
 expect(payload.screenshot.mimeType).toBe('image/jpeg');expect(payload.screenshot.base64.length).toBeGreaterThan(100);
 await expect(page.getByText('تم إرسال طلب الملاحظة')).toBeVisible();
});
test('image removal and closing discard attachment and draft',async({page})=>{
 await open(page);await page.locator('input[type=file]').setInputFiles({name:'screen.png',mimeType:'image/png',buffer:await imageBuffer(page)});
 await expect(page.getByAltText('لقطة شاشة',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'حذف لقطة الشاشة'}).click();await expect(page.getByAltText('لقطة شاشة',{exact:true})).toHaveCount(0);
 await page.getByLabel('موديل الهاتف أو رقم الطراز').fill('Custom model');
 await page.getByRole('button',{name:'إغلاق الملاحظات'}).click();await page.getByRole('button',{name:'Open feedback',exact:true}).click();
 await expect(page.getByLabel('موديل الهاتف أو رقم الطراز')).toHaveValue('');
});
test('rejects unsupported and oversized files, permits feedback without screenshot',async({page})=>{
 await open(page);await page.locator('input[type=file]').setInputFiles({name:'bad.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg/>')});
 await expect(page.getByRole('alert')).toContainText('PNG');
 await page.locator('input[type=file]').setInputFiles({name:'big.png',mimeType:'image/png',buffer:Buffer.alloc(8*1024*1024+1)});
 await expect(page.getByRole('alert')).toContainText('كبيرة');
 await page.getByLabel('تفاصيل الملاحظة').fill('اقتراح لا يحتاج إلى صورة');
 await page.getByRole('button',{name:'إرسال ملاحظة',exact:true}).click();
 expect(await page.evaluate(()=>(window as any).sent[0].screenshot)).toBeNull();
});
test('English form supports another Android version and a typed phone',async({page})=>{
 await page.setViewportSize({width:900,height:1100});await open(page,'en');
 await page.getByLabel('Android version',{exact:true}).selectOption('other');
 await page.getByLabel('Enter Android version',{exact:true}).fill('17');
 await page.getByLabel('Phone model or model number').fill('My custom phone');
 await page.locator('textarea').fill('Example issue');
 await page.screenshot({path:'artifacts/feedback-desktop.png'});
 await page.getByRole('button',{name:'Send Feedback',exact:true}).click();
 expect(await page.evaluate(()=>(window as any).sent[0].deviceInfo.androidVersion)).toBe('17');
});

test('missing, unknown, malformed and unsupported age choices block sending',async({page})=>{
 await open(page,'en');await page.locator('textarea').fill('Age gate test');
 page.removeAllListeners('dialog');let alerts=0;
 page.on('dialog',async dialog=>{expect(dialog.type()).toBe('alert');alerts++;await dialog.accept();});
 for(const saved of [null,'{',JSON.stringify({version:1,age:'unknown',allowed:false}),JSON.stringify({version:2,age:'adult',allowed:false}),JSON.stringify({version:1,age:'adult'})]){
  await page.evaluate(saved=>saved===null?localStorage.removeItem('mushaf_measurement_choice_v1'):localStorage.setItem('mushaf_measurement_choice_v1',saved),saved);
  await page.locator('button[type=submit]').click();
 }
 expect(alerts).toBe(5);expect(await page.evaluate(()=>(window as any).sent)).toEqual([]);
});

test('saved adult sends without confirmation with measurement either allowed or declined',async({page})=>{
 for(const allowed of [false,true]){
  await open(page,'en');await page.locator('textarea').fill('Adult feedback');
  await page.evaluate(allowed=>localStorage.setItem('mushaf_measurement_choice_v1',JSON.stringify({version:1,age:'adult',allowed})),allowed);
  let dialogs=0;page.removeAllListeners('dialog');page.on('dialog',async d=>{dialogs++;await d.dismiss()});
  await page.locator('button[type=submit]').click();
  await expect.poll(()=>page.evaluate(()=>(window as any).sent.length)).toBe(1);expect(dialogs).toBe(0);
 }
});

test('saved minor age blocks submission without offering adult confirmation',async({page})=>{
 await open(page);
 await page.getByLabel('تفاصيل الملاحظة').fill('ملاحظة طفل');
 page.removeAllListeners('dialog');
 page.on('dialog',async dialog=>{expect(dialog.type()).toBe('alert');expect(dialog.message()).toBe(translations.ar.feedbackForm.ageUnavailable);await dialog.accept();});
 for(const age of ['under13','13to17','under18']){
  await page.evaluate(age=>localStorage.setItem('mushaf_measurement_choice_v1',JSON.stringify({version:1,age,allowed:false})),age);
  await page.getByRole('button',{name:'إرسال ملاحظة',exact:true}).click();
 }
 expect(await page.evaluate(()=>(window as any).sent)).toEqual([]);
});

test('all 31 locales render feedback copy and send adult feedback without confirmation',async({page})=>{
 test.setTimeout(90000);
 const languages=Object.keys(translations) as Language[];
 expect(languages).toHaveLength(31);
 const keys=Object.keys(translations.en.feedbackForm).sort();
 for(const language of languages){
  const copy=translations[language].feedbackForm;
  expect(Object.keys(copy).sort(),language).toEqual(keys);
  for(const value of Object.values(copy)) expect(value.trim().length,language).toBeGreaterThan(0);
  if(language!=='en') expect(copy.adultConfirm,language).not.toBe(translations.en.feedbackForm.adultConfirm);
  await open(page,language);
  await expect(page.locator('label[for="feedback-android"]')).toHaveText(copy.android);
  await expect(page.locator('#feedback-phone-model')).toHaveAttribute('placeholder',copy.modelPlaceholder);
  await expect(page.locator('#feedback-screenshot-hint')).toHaveText(copy.screenshotHint);
  await page.locator('textarea').fill('Localization test');
  page.removeAllListeners('dialog');let dialogs=0;
  page.on('dialog',async dialog=>{dialogs++;await dialog.dismiss()});
  await page.locator('button[type="submit"]').click();
  expect(await page.evaluate(()=>(window as any).sent.length)).toBe(1);
  expect(dialogs,language).toBe(0);
 }

});


test('screenshot retry works without blob URLs or image.decode',async({page})=>{
 await open(page,'en');
 await page.evaluate(()=>{
  URL.createObjectURL=()=>{throw new Error('Blob URLs unavailable')};
  HTMLImageElement.prototype.decode=()=>Promise.reject(new Error('decode unavailable'));
 });
 const input=page.locator('input[type=file]');
 await input.setInputFiles({name:'broken.png',mimeType:'image/png',buffer:Buffer.from('invalid image')});
 await expect(page.getByRole('alert')).toBeVisible();
 const valid={name:'screen.png',mimeType:'image/png',buffer:await imageBuffer(page)};
 await input.setInputFiles(valid);
 await expect(page.getByAltText('Screenshot',{exact:true})).toBeVisible();
 await expect(page.getByRole('alert')).toHaveCount(0);
 await page.getByRole('button',{name:'Remove screenshot'}).click();
 await input.setInputFiles(valid);
 await expect(page.getByAltText('Screenshot',{exact:true})).toBeVisible();
});


test('native gallery prepares image, preserves attachment on cancel and recovers from read error',async({page})=>{
 await open(page,'en');
 const base64=(await imageBuffer(page)).toString('base64');
 await page.evaluate(base64=>{(window as any).nativeImageChoice=async()=>({mimeType:'image/png',base64});},base64);
 const choose=page.locator('button').filter({has:page.locator('svg.lucide-image-plus')});
 await choose.click();
 await expect(page.getByAltText('Screenshot',{exact:true})).toBeVisible();
 await page.evaluate(()=>{(window as any).nativeImageChoice=async()=>({cancelled:true});});
 await choose.click();
 await expect(page.getByAltText('Screenshot',{exact:true})).toBeVisible();
 await expect(choose).toBeEnabled();
 await page.evaluate(()=>{(window as any).nativeImageChoice=async()=>{throw new Error('decode')};});
 await choose.click();
 await expect(page.getByRole('alert')).toBeVisible();
 await page.evaluate(base64=>{(window as any).nativeImageChoice=async()=>({mimeType:'image/png',base64});},base64);
 await choose.click();
 await expect(page.getByRole('alert')).toHaveCount(0);
 await expect(page.getByAltText('Screenshot',{exact:true})).toBeVisible();
});


test('unknown age opens age selection after OK and preserves screenshot and draft for later sending',async({page})=>{
 await open(page,'en',true);
 await page.locator('textarea').fill('Draft retained during age selection');
 await page.locator('#feedback-phone-model').fill('Saved model');
 await page.locator('input[type=file]').setInputFiles({name:'screen.png',mimeType:'image/png',buffer:await imageBuffer(page)});
 await expect(page.getByAltText('Screenshot',{exact:true})).toBeVisible();
 await page.evaluate(()=>localStorage.setItem('mushaf_measurement_choice_v1',JSON.stringify({version:1,age:'unknown',allowed:false})));
 page.removeAllListeners('dialog');let alerts=0;
 page.on('dialog',async d=>{expect(d.type()).toBe('alert');expect(d.message()).toContain('select your age group');alerts++;await d.accept()});
 await page.locator('button[type=submit]').click();
 await expect(page.locator('#measurement-age')).toBeVisible();
 await expect(page.locator('#measurement-age')).toHaveValue('');
 expect(alerts).toBe(1);expect(await page.evaluate(()=>(window as any).sent)).toEqual([]);
 await page.locator('#measurement-age').selectOption('adult');
 await page.getByRole('button',{name:'Continue without agreeing',exact:true}).click();
 await expect(page.locator('#measurement-age')).toHaveCount(0);
 await expect(page.locator('textarea')).toHaveValue('Draft retained during age selection');
 await expect(page.locator('#feedback-phone-model')).toHaveValue('Saved model');
 await expect(page.getByAltText('Screenshot',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>(window as any).sent)).toEqual([]);
 await page.locator('button[type=submit]').click();
 expect(await page.evaluate(()=>(window as any).sent[0].screenshot.mimeType)).toBe('image/jpeg');
 expect(alerts).toBe(1);
});

test('selecting a minor age after the prompt still blocks sending',async({page})=>{
 await open(page,'en',true);await page.locator('textarea').fill('Minor age selection');
 await page.evaluate(()=>localStorage.removeItem('mushaf_measurement_choice_v1'));
 await page.locator('button[type=submit]').click();
 await expect(page.locator('#measurement-age')).toBeVisible();
 await page.locator('#measurement-age').selectOption('under18');
 await page.getByRole('button',{name:'Continue to the Mushaf',exact:true}).click();
 page.removeAllListeners('dialog');page.on('dialog',async d=>{expect(d.type()).toBe('alert');expect(d.message()).toContain('select your age group');await d.accept()});
 await page.locator('button[type=submit]').click();
 expect(await page.evaluate(()=>(window as any).sent)).toEqual([]);
 await expect(page.locator('#measurement-age')).toBeVisible();
});


test('all saved non-adult ages reopen the same age window and retain the draft',async({page})=>{
 for(const age of ['under13','13to17','under18','unknown']){
  await open(page,'en',true);await page.locator('textarea').fill('Keep my draft');
  await page.evaluate(age=>localStorage.setItem('mushaf_measurement_choice_v1',JSON.stringify({version:1,age,allowed:false})),age);
  await page.locator('button[type=submit]').click();
  await expect(page.locator('#measurement-age')).toBeVisible();
  await expect(page.locator('#measurement-age')).toHaveValue(age==='unknown'?'':'under18');
  expect(await page.locator('#measurement-age option').evaluateAll(es=>es.map(e=>(e as HTMLOptionElement).value))).toEqual(['','under18','adult']);
  await expect(page.locator('textarea')).toHaveValue('Keep my draft');
  expect(await page.evaluate(()=>(window as any).sent)).toEqual([]);
 }
});
