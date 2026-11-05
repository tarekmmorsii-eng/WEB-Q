import { test, expect, Page } from '@playwright/test';
import { build } from 'esbuild';
import fs from 'node:fs';import path from 'node:path';
let modalScript:string,css:string;
test.beforeAll(async()=>{
 const output=await build({define:{'import.meta.env':'{}'},stdin:{contents:`
 import React,{useState}from'react';import{createRoot}from'react-dom/client';import Modal from './components/AyahOptionsModal';
 window.events=[];function App(){const[open,set]=useState(true),[bookmarked,mark]=useState(false);return <><button onClick={()=>set(true)}>Reopen</button><Modal isOpen={open} onClose={()=>{window.events.push('close');set(false)}} surahNumber={2} ayahNumber={17} currentRating={null} onRate={()=>{}} onBookmark={()=>{window.events.push('bookmark');mark(v=>!v)}} isBookmarked={bookmarked} language="ar" tafsir={'شرح الآية للاختبار '.repeat(100)}/></>};createRoot(document.getElementById('root')).render(<App/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,write:false,format:'iife',outdir:'out'});
 modalScript=output.outputFiles.find(f=>f.path.endsWith('.js'))!.text;
 const dir='artifacts/ui-fixes-dist',index=fs.readFileSync(path.join(dir,'index.html'),'utf8'),href=index.match(/href="([^"]+\.css)"/)![1];css=fs.readFileSync(path.join(dir,href),'utf8');
});
async function modal(page:Page,dark:boolean){
 await page.route('https://ui.test/**',route=>{const url=new URL(route.request().url());if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:'<html dir="rtl"><meta charset="utf-8"><div id="root"></div></html>'});const file=path.join(process.cwd(),'public',decodeURIComponent(url.pathname));return fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404,body:''})});
 await page.goto('https://ui.test');await page.addStyleTag({content:css});await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark);await page.addScriptTag({content:modalScript});
}
for(const dark of [false,true])test(`tafsir logo and colored close buttons ${dark?'dark':'light'}`,async({page})=>{
 await modal(page,dark);await page.getByRole('button',{name:/تفسير الآية/}).click();const panel=page.locator('[data-tafsir-panel]');
 await expect(panel.locator('.modal-title-logo')).toBeVisible();const buttons=panel.getByRole('button',{name:'إغلاق',exact:true});await expect(buttons).toHaveCount(2);
 for(const button of await buttons.all()){await expect(button).toHaveCSS('background-color','rgb(245, 158, 11)');await expect(button).toHaveCSS('color','rgb(255, 255, 255)')}
 await page.screenshot({path:`artifacts/tafsir-fixed-${dark?'dark':'light'}.png`});await buttons.first().click();await expect(panel).toHaveCount(0);
 await page.getByRole('button',{name:'Reopen'}).click();await page.getByRole('button',{name:/تفسير الآية/}).click();await panel.getByRole('button',{name:'إغلاق',exact:true}).last().click();await expect(panel).toHaveCount(0);
});
test('bookmark executes before closing and removing also persists in parent state',async({page})=>{
 await modal(page,false);await page.getByRole('button',{name:'إضافة مرجعية',exact:true}).click();await expect(page.getByRole('button',{name:'إضافة مرجعية',exact:true})).toHaveCount(0);
 expect(await page.evaluate(()=>(window as any).events)).toEqual(['bookmark','close']);await page.getByRole('button',{name:'Reopen'}).click();await page.getByRole('button',{name:'إزالة المرجعية',exact:true}).click();
 expect(await page.evaluate(()=>(window as any).events)).toEqual(['bookmark','close','bookmark','close']);
});
async function application(page:Page){
 await page.addInitScript(()=>{if(sessionStorage.getItem('ui-fixes-seeded'))return;sessionStorage.setItem('ui-fixes-seeded','1');localStorage.setItem('hasSeenTour','true');localStorage.setItem('quran_language_selected','true');localStorage.setItem('quran_last_page','4');localStorage.setItem('quran_app_settings',JSON.stringify({language:'ar',prayerMode:false,theme:'classic-mushaf'}));localStorage.setItem('mushaf_measurement_choice_v1',JSON.stringify({version:1,age:'unknown',allowed:false}))});
 await page.route(/^https?:\/\//,r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await page.goto('http://127.0.0.1:5190');await expect(page.locator('.swiper-slide-active [data-word-surah]').first()).toBeVisible();await page.waitForTimeout(3500);
}
async function pinch(page:Page){const s=await page.context().newCDPSession(page);for(const [type,points]of [['touchStart',[{x:130,y:400,id:1},{x:230,y:400,id:2}]],['touchMove',[{x:100,y:400,id:1},{x:260,y:400,id:2}]],['touchEnd',[]]] as const)await s.send('Input.dispatchTouchEvent',{type,touchPoints:points});await s.detach();await page.waitForTimeout(850)}
test('gesture checkbox saves, disables original/enlarged pinch, keeps manual sizing and re-enables live',async({page})=>{
 const unintendedAudio:string[]=[];page.on('request',r=>{if(/\.mp3(?:\?|$)/.test(r.url()))unintendedAudio.push(r.url())});
 await application(page);await pinch(page);await expect(page.locator('[data-enlarged-reading]')).toBeVisible();await page.locator('.enlarged-reading-exit').click();
 expect(unintendedAudio).toEqual([]);
 const setGesture=async(enabled:boolean)=>{
  await page.locator('#tour-settings-btn').evaluate((e:HTMLElement)=>e.click());const settings=page.locator('[data-settings-dialog]');await settings.getByRole('button',{name:/إيماءات اللمس/}).click();
  const box=settings.getByRole('checkbox',{name:'سحب بإصبعين لتكبير الخط',exact:true});await expect(box).toBeVisible();await box.setChecked(enabled);await settings.getByRole('button',{name:'حفظ',exact:true}).click();await expect(settings).toHaveCount(0);
 };
 await setGesture(false);await page.reload();await expect(page.locator('.swiper-slide-active [data-word-surah]').first()).toBeVisible();await page.waitForTimeout(900);expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('quran_app_settings')!).gesturePinchZoom)).toBe(false);
 await pinch(page);await expect(page.locator('[data-enlarged-reading]')).toHaveCount(0);
 const toggle=page.locator('#enlarged-reading-toggle');if(await toggle.isDisabled())await page.locator('main').dispatchEvent('click');await toggle.click();
 const output=page.locator('.enlarged-reading-toolbar output');const before=await output.textContent();await pinch(page);await expect(output).toHaveText(before!);
 expect(unintendedAudio).toEqual([]);
 await page.locator('.enlarged-reading-toolbar').getByRole('button',{name:'تكبير الخط',exact:true}).click();await expect(output).not.toHaveText(before!);await page.locator('.enlarged-reading-exit').click();
 await setGesture(true);await pinch(page);await expect(page.locator('[data-enlarged-reading]')).toBeVisible();
});
test('theme switch retains visible glyphs frame by frame and preserves hidden words',async({page})=>{
 await application(page);
 for(let i=0;i<4;i++){
  const frames=await page.evaluate(async()=>{
   const root=document.querySelector('.swiper-slide-active .mushaf-page-qpc')!,word=root.querySelector('[data-word-surah]')!,start=performance.now(),frames:any[]=[];
   const numbers=(v:string)=>v.match(/[\d.]+/g)!.slice(0,3).map(Number);const lum=(a:number[])=>a.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
   (Array.from(document.querySelectorAll('button')).find(e=>e.querySelector('.lucide-moon,.lucide-sun')) as HTMLElement).click();
   await new Promise<void>(resolve=>{const frame=()=>{const a=lum(numbers(getComputedStyle(word).color)),b=lum(numbers(getComputedStyle(root).backgroundColor));frames.push({connected:word.isConnected,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)});if(performance.now()-start<650)requestAnimationFrame(frame);else resolve()};requestAnimationFrame(frame)});return frames;
  });expect(frames.every(f=>f.connected&&f.ratio>7)).toBe(true);
 }
 await expect(page.locator('html')).not.toHaveClass(/mushaf-theme-switching/);
 await page.locator('#tour-btn-HIDE_ALL_AYAHS').evaluate((e:HTMLElement)=>e.click());await page.locator('#tour-dropdown-HIDE_ALL_AYAHS button').first().evaluate((e:HTMLElement)=>e.click());await page.waitForTimeout(500);
 const hidden=await page.locator('.swiper-slide-active [data-reveal-key]').count();expect(hidden).toBeGreaterThan(0);
 await page.locator('button').filter({has:page.locator('.lucide-moon,.lucide-sun')}).first().evaluate((e:HTMLElement)=>e.click());await page.waitForTimeout(150);
 await expect(page.locator('.swiper-slide-active [data-reveal-key]')).toHaveCount(hidden);await expect(page.locator('.swiper-slide-active [data-reveal-key]').first()).toHaveCSS('color','rgba(0, 0, 0, 0)');
});
test('all supported locales include a nonempty pinch setting label',async()=>{
 const catalogue=JSON.parse(fs.readFileSync('i18n/readingViewMessages.json','utf8'));expect(Object.keys(catalogue)).toHaveLength(31);for(const value of Object.values(catalogue) as any[])expect(value.pinchGesture?.trim().length).toBeGreaterThan(0);
});
