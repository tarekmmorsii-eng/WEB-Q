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
 import FeedbackModal from './components/FeedbackModal';import{FeedbackProvider,useFeedback}from'./contexts/FeedbackContext';
 function App(){const {openFeedback}=useFeedback();return <><button onClick={()=>openFeedback('interface_notes')}>Open feedback</button><FeedbackModal/></>}
 createRoot(document.getElementById('root')).render(<FeedbackProvider language={window.testLanguage||'ar'}><App/></FeedbackProvider>);
 `,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',plugins:[{name:'native',setup(b){b.onResolve({filter:/^@capacitor\/core$/},()=>({path:'core',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export const Capacitor={isNativePlatform:()=>false};'}))}}]});
 script=result.outputFiles[0].text;
 const file=fs.readdirSync('dist/assets').find(n=>n.startsWith('index-')&&n.endsWith('.css'))!;css=fs.readFileSync('dist/assets/'+file,'utf8');
});
async function open(page:any,language='ar'){
 await page.route('https://feedback.test/**',(route:any)=>route.fulfill({contentType:'text/html',body:'<div id="root"></div>'}));
 await page.goto('https://feedback.test');
 await page.setContent('<div id="root"></div>');
 await page.addStyleTag({content:css+' :root{--bg-card:#fff;--bg-secondary:#f5f0e8;--border-primary:#e4d8c7;--text-primary:#253044;} body{margin:0;background:#dad5ce;font-family:Arial,sans-serif;}'});
 await page.evaluate((language:string)=>{const w=window as any;w.testLanguage=language;w.sent=[];w.fetch=async(_url:any,options:any)=>{w.sent.push(JSON.parse(options.body));return {type:'opaque'}};},language);
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

test('canceling adult confirmation sends neither message nor screenshot',async({page})=>{
 await open(page);
 await page.getByLabel('تفاصيل الملاحظة').fill('ملاحظة لا تُرسل دون التأكيد');
 await page.locator('input[type=file]').setInputFiles({name:'screen.png',mimeType:'image/png',buffer:await imageBuffer(page)});
 await expect(page.getByAltText('لقطة شاشة',{exact:true})).toBeVisible();
 page.removeAllListeners('dialog');
 let confirmations=0;
 page.on('dialog',async dialog=>{expect(dialog.type()).toBe('confirm');confirmations++;await dialog.dismiss();});
 await page.getByRole('button',{name:'إرسال ملاحظة',exact:true}).click();
 expect(confirmations).toBe(1);
 expect(await page.evaluate(()=>(window as any).sent)).toEqual([]);
 await expect(page.getByLabel('تفاصيل الملاحظة')).not.toHaveValue('');
});

test('saved minor age blocks submission without offering adult confirmation',async({page})=>{
 await open(page);
 await page.getByLabel('تفاصيل الملاحظة').fill('ملاحظة طفل');
 page.removeAllListeners('dialog');
 page.on('dialog',async dialog=>{expect(dialog.type()).toBe('alert');expect(dialog.message()).toContain('ولي أمرك');await dialog.accept();});
 for(const age of ['under13','13to17']){
  await page.evaluate(age=>localStorage.setItem('mushaf_measurement_choice_v1',JSON.stringify({version:1,age,allowed:false})),age);
  await page.getByRole('button',{name:'إرسال ملاحظة',exact:true}).click();
 }
 expect(await page.evaluate(()=>(window as any).sent)).toEqual([]);
});

test('all 31 locales render their own feedback copy and consent without sending on cancel',async({page})=>{
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
  page.removeAllListeners('dialog');
  const dialogReady=page.waitForEvent('dialog');
  const click=page.locator('button[type="submit"]').click();
  const dialog=await dialogReady;
  expect(dialog.message(),language).toBe(copy.adultConfirm);
  await dialog.dismiss(); await click;
  expect(await page.evaluate(()=>(window as any).sent)).toEqual([]);
 }
 expect(translations.ar.feedbackForm.adultConfirm).toBe('أنا سني 18 عامًا فأكثر، وأوافق على إرسال الملاحظة والصورة المرفقة.');
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
