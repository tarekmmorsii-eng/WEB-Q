import {test,expect} from '@playwright/test';
import {build} from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
let script:string,css:string;
test.beforeAll(async()=>{
 const bundle=await build({stdin:{contents:`
 import React,{useState}from'react';import{createRoot}from'react-dom/client';
 import Stats from './components/MemorizationStats';import SimilarIndex from './components/MutashabihatIndex';import Settings from './components/Settings';import Color from './components/ColorPickerModal';import Calculator from './components/VerseCalculatorModal';import Guide from './components/HowToUseGuide';import Index from './components/SurahIndex';import Translations from './components/TranslationManagerModal';import Audio from './components/AudioSettingsModal';
 import{FeedbackProvider}from'./contexts/FeedbackContext';import{DEFAULT_SETTINGS}from'./utils/settings';import{translations}from'./i18n/translations';
 function App(){const[view,setView]=useState('settings'),[covered,setCovered]=useState(false),[locale,setLocale]=useState('ar');window.setLocale=setLocale;window.calls=[];window.setView=setView;const t=translations[locale];
 return <FeedbackProvider language="ar">{view==='settings'?<Settings isOpen covered={covered} onOpenColorPicker={()=>setCovered(true)} onOpenIndex={()=>window.calls.push("index")} onOpenSearch={()=>window.calls.push("search")} onOpenMemorization={()=>window.calls.push("stats")} onOpenNotifications={()=>window.calls.push("notifications")} onOpenMutashabihat={()=>window.calls.push("similar")} settings={DEFAULT_SETTINGS} currentLanguage={locale} onSave={()=>{}} onClose={()=>setView('none')}/>:null}
 {covered?<Color isOpen currentThemeId="nature" onSelectTheme={()=>{}} onClose={()=>setCovered(false)} t={t}/>:null}
 {view==='stats'?<Stats isOpen ratings={[]} t={t} onClose={()=>setView('none')} onNavigateToSurah={s=>window.destination=s} onRateSurah={()=>{}} onClearAll={()=>{}}/>:null}
 {view==='similar'?<SimilarIndex isOpen language="ar" t={t} mutashabihatData={[]} onClose={()=>setView('none')}/>:null}
 {view==='color'?<Color isOpen currentThemeId="nature" onSelectTheme={()=>{}} onClose={()=>setView('none')} t={t}/>:null}
 {view==='calculator'?<Calculator isOpen onClose={()=>setView('none')} currentLanguage="ar" memorizationRatings={[]}/>:null}
 {view==='guide'?<Guide isOpen onClose={()=>setView('none')} language="ar"/>:null}
 {view==='index'?<Index isOpen onClose={()=>setView('none')} onSelectSurah={()=>{}} onSelectPage={()=>{}} language="ar" t={t} bookmarks={[]}/>:null}
 {view==='translations'?<Translations isOpen onClose={()=>setView('none')} t={t} currentLanguage="ar"/>:null}
 {view==='audio'?<Audio isOpen onClose={()=>setView('none')} settings={DEFAULT_SETTINGS} onSave={()=>{}} t={t}/>:null}
 </FeedbackProvider>};createRoot(document.getElementById('root')).render(<App/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,write:false,outdir:'out',format:'iife',define:{'import.meta.env':'{}'}});
 script=bundle.outputFiles.find(f=>f.path.endsWith('.js'))!.text;
 const index=fs.readFileSync('dist/index.html','utf8');css=fs.readFileSync(path.join('dist',index.match(/href="([^"]+\.css)"/)![1]),'utf8') + fs.readFileSync('components/libraryDesign.css','utf8') + fs.readFileSync('components/wordsLibrary.css','utf8');
});
for(const dark of [false,true])test(`dialogs retain margins and neutral palette ${dark?'dark':'light'}`,async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.route('https://dialogs.test/**',route=>{const url=new URL(route.request().url());if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:'<html dir="rtl"><meta charset="utf-8"><style>body{margin:0;--bg-primary:#e8f5e9;--bg-card:#f1f8f2;--bg-secondary:#c8e6c9;--text-primary:#1b5e20;--border-primary:#a5d6a7}</style><div id="root"></div></html>'});const file=path.join(process.cwd(),'public',decodeURIComponent(url.pathname));return fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404,body:''})});
 await page.goto('https://dialogs.test/');await page.addStyleTag({content:css});await page.evaluate(dark=>document.documentElement.classList.toggle('dark',dark),dark);await page.addScriptTag({content:script});

 const settings=page.locator('[data-settings-dialog]');
 await expect(settings.getByRole('button',{name:'المزيد من الإعدادات',exact:true})).toHaveCount(0);
 await expect(settings.getByText('القائمة الجانبية العائمة',{exact:true})).toHaveCount(0);
 await expect(settings.getByRole('combobox').first()).toBeAttached();
 await expect(settings.locator('[data-app-rating] a')).toHaveAttribute('href','https://play.google.com/store/apps/details?id=com.mushafalmurajaa.app');
 await expect(settings.locator('[data-app-rating]')).toContainText('قيّم التطبيق');
 await settings.getByRole('button',{name:'خيارات عرض الآيات',exact:true}).click();
 const display=settings.locator('[data-verse-display-options]');
 await expect(display.getByRole('checkbox')).toHaveCount(3);
 await expect(display).toContainText('متوفرة لبعض اللغات فقط');
 await page.setViewportSize({width:320,height:740});
 expect(await display.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 await page.screenshot({path:`artifacts/settings-display-options-${dark?'dark':'light'}-320.png`});
 await page.setViewportSize({width:390,height:844});
 await display.getByRole('checkbox').first().uncheck();
 await settings.getByRole('combobox').first().selectOption('en');
 // Open the external color window through Settings without discarding the draft.
 await settings.locator('button.border-dashed').click();
 await expect(settings).toHaveAttribute('data-covered','true');
 await expect(settings).not.toBeVisible();
 await page.locator('.app-modal').last().getByRole('button').first().click();
 await expect(settings).toBeVisible();
 await expect(settings.getByRole('combobox').first()).toHaveValue('en');
 await expect(display.getByRole('checkbox').first()).not.toBeChecked();
 const tile=settings.locator('.settings-tile').first();
 await expect(tile).toHaveCSS('border-top-width','1px');
 if(dark)await expect(tile).toHaveCSS('border-top-color','rgb(71, 85, 105)');
 for(const name of ['الفهرس','قوة الحفظ','التذكيرات','دليل المتشابهات','بحث']){
   await settings.getByRole('button',{name,exact:true}).click();await expect(settings).toBeVisible();
 }
 await settings.getByRole('button',{name:'حاسبة الآيات',exact:true}).click();
 const calculator=page.locator('.app-modal').last();await expect(calculator.locator('.modal-title-logo')).toBeVisible();
 const logoBox=await calculator.locator('.modal-title-logo').boundingBox(),iconBox=await calculator.locator('.lucide-calculator').boundingBox(),closeBox=await calculator.locator('.lucide-x').first().boundingBox();
 expect(logoBox!.x).toBeGreaterThan(iconBox!.x);expect(iconBox!.x).toBeGreaterThan(closeBox!.x);
 await calculator.getByRole('button').first().click();await expect(settings).toBeVisible();
 await expect(settings.getByRole('combobox').first()).toHaveValue('en');
 for(const view of ['settings','color','calculator','guide','index','translations','audio','similar']){
  await page.evaluate(view=>(window as any).setView(view),view);
  const overlay=page.locator('.app-modal').first();await expect(overlay).toBeVisible();
  const panel=overlay.locator(':scope > div:not(.absolute):not(.fixed), :scope > section').first();await expect(panel).toBeVisible();
  await expect(panel.locator('img[src*="logo"]').first()).toBeVisible();
  await expect(overlay).toHaveCSS('background-color','rgba(0, 0, 0, 0.5)');
  await expect(overlay).toHaveCSS('backdrop-filter','blur(4px)');
  const extra=overlay.locator(':scope > .modal-backdrop-hit-target');if(await extra.count())await expect(extra).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
  if(view==='similar'){const x=await panel.locator('.lucide-x').first().boundingBox(),logo=await panel.locator('.modal-title-logo').first().boundingBox(),bounds=await panel.boundingBox();expect(x!.x).toBeLessThan(100);expect(logo!.width).toBe(40);expect(bounds!.x+bounds!.width-logo!.x-logo!.width).toBeCloseTo(17,0);}
  await expect(panel).toHaveCSS('border-radius','16px');await expect(panel).toHaveCSS('background-color',dark?'rgb(15, 23, 42)':'rgb(255, 255, 255)');
  const box=await panel.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(15);expect(box!.y).toBeGreaterThanOrEqual(15);expect(box!.x+box!.width).toBeLessThanOrEqual(375);expect(box!.y+box!.height).toBeLessThanOrEqual(829);
  expect(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  if(view==='settings')await page.screenshot({path:`artifacts/dialog-settings-${dark?'dark':'light'}.png`});
 }
 await page.evaluate(()=>(window as any).setView('settings'));
 await page.getByRole('button',{name:'الكلمات',exact:true}).dispatchEvent('click');
 const words=page.locator('[data-words-library]');await expect(words).toBeVisible();
 const parent=page.locator('.app-modal').first();
 await expect(parent).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
 await expect(parent).toHaveCSS('backdrop-filter','none');
 await expect(parent.locator(':scope > div:not(.fixed)').first()).toHaveCSS('visibility','hidden');
 const glass=words.locator('..');await expect(glass).toHaveCSS('background-color','rgba(0, 0, 0, 0.5)');
 await expect(glass).toHaveCSS('backdrop-filter','blur(4px)');
 await words.locator('.library-close').click();await expect(words).toHaveCount(0);
 await expect(parent.locator(':scope > div:not(.fixed)').first()).toBeVisible();
 const order=await settings.evaluate(el=>{
   const rating=el.querySelector('[data-app-rating]'),share=el.querySelector('[data-app-share]'),push=el.querySelector('[data-push-notifications]');
   return !!(rating.compareDocumentPosition(share)&Node.DOCUMENT_POSITION_FOLLOWING)&&!!(share.compareDocumentPosition(push)&Node.DOCUMENT_POSITION_FOLLOWING);
 });expect(order).toBe(true);
 await settings.getByRole('button',{name:'المساعدة والتعليمات',exact:true}).click();
 await expect(settings.locator('#tour-tutorials-btn')).toBeVisible();
 for(const locale of ['en','tr']){await page.evaluate(locale=>(window as any).setLocale(locale),locale);await expect(settings.locator('#tour-tutorials-btn')).toHaveCount(0);}
 await page.evaluate(()=>(window as any).setLocale('ar'));await expect(settings.locator('#tour-tutorials-btn')).toBeVisible();
 await settings.getByRole('button',{name:'العمل بدون إنترنت (Offline)',exact:true}).click();
 await expect(settings).not.toContainText('ملحوظة: التثبيت يتم على خطوتين');
});


test('foreign surah names remain complete on one line; Arabic keeps its inline layout',async({page})=>{
 await page.route('https://stats.test/**',route=>{const url=new URL(route.request().url());if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:'<html><meta charset="utf-8"><div id="root"></div></html>'});const file=path.join(process.cwd(),'public',decodeURIComponent(url.pathname));return fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404,body:''})});
 await page.goto('https://stats.test/');await page.addStyleTag({content:css});await page.addScriptTag({content:script});
 await page.evaluate(()=>(window as any).setView('stats'));
 for(const locale of fs.readdirSync('src/assets/i18n').filter(f=>f.endsWith('.json')&&f!=='ar.json').map(f=>f.slice(0,-5)))for(const width of (['en','tr'].includes(locale)?[320,390,711]:[320])){
  await page.setViewportSize({width,height:844});await page.evaluate(locale=>(window as any).setLocale(locale),locale);await expect(page.locator('[data-stats-surah-name]')).toHaveCount(114);await page.evaluate(()=>document.fonts.ready);
  const bad=await page.locator('[data-stats-surah-name]').evaluateAll(elements=>elements.filter(el=>{return el.getBoundingClientRect().height>parseFloat(getComputedStyle(el).lineHeight)+1||el.scrollWidth>el.clientWidth+1}).map(el=>el.textContent));expect(bad).toEqual([]);
  const first=page.locator('[data-stats-navigate]').first(),number=await first.locator('[data-stats-surah-number]').boundingBox(),name=await first.locator('[data-stats-surah-name]').boundingBox(),count=await first.locator('[data-stats-ayah-count]').boundingBox();expect(number!.y+number!.height).toBeLessThanOrEqual(name!.y+1);expect(count!.y).toBeGreaterThanOrEqual(name!.y+name!.height-1);
  if(width===320&&['en','tr'].includes(locale))await page.screenshot({path:`artifacts/stats-names-${locale}-320.png`});
 }
 await page.evaluate(()=>(window as any).setLocale('ar'));await expect(page.locator('[data-stats-surah-name]')).toHaveCount(0);const arabic=page.locator('[data-stats-navigate]').first();await expect(arabic).toHaveClass(/text-right/);await expect(arabic.locator(':scope > span').first()).toHaveCSS('display','inline');await expect(arabic.locator(':scope > span').last()).toHaveCSS('display','inline');
 await page.locator('[data-stats-navigate="55"]').click();expect(await page.evaluate(()=>(window as any).destination)).toBe(55);await expect(page.locator('[data-stats-navigate]')).toHaveCount(0);
});
