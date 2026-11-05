import{test,expect,Page}from'@playwright/test';
import{build}from'esbuild';import fs from'node:fs';
let script:string,css:string;
const messages=JSON.parse(fs.readFileSync('i18n/notesMessages.json','utf8'));
const source=JSON.parse(fs.readFileSync('public/quran.json','utf8'));
const chapter=source.data.surahs.find((s:any)=>s.number===2);
const verse17=chapter.ayahs.find((a:any)=>a.numberInSurah===17).text;
const verse18=chapter.ayahs.find((a:any)=>a.numberInSurah===18).text;
test.beforeAll(async()=>{
 const r=await build({stdin:{contents:`
 import React,{useState}from'react';import{createRoot}from'react-dom/client';import Modal from './components/AyahOptionsModal';import Library from './components/NotesLibrary';import{ReadingUiScaleProvider,ReadingDialogScale}from'./components/ReadingUiScale';import*as notes from'./services/ayahNotes';
 import{saveWbwData}from'./services/translationStorageService';import{normalizeSharedVerseText}from'./services/ayahSharing';window.notes=notes;window.seedWbw=saveWbwData;window.normalizeVerse=normalizeSharedVerseText;
 const groups=[{id:'test-group',sourceAyah:{surahNumber:2,ayahNumber:17},similarAyahs:[{surahNumber:2,ayahNumber:18}]}];
 function App(){const[library,setLibrary]=useState(false);const[open,set]=useState(true),[explanation,explain]=useState(window.explanation);window.explain=explain;
 return <ReadingUiScaleProvider active={window.scaled} fontSize={52}><button onClick={()=>set(true)}>Open verse</button><button onClick={()=>setLibrary(true)}>Open notes library</button>{library&&<Library language={window.language} onClose={()=>setLibrary(false)} onNavigate={async(surah,ayah)=>{window.destination={surah,ayah};setLibrary(false)}}/>}<ReadingDialogScale><Modal isOpen={open} onClose={()=>set(false)} surahNumber={2} ayahNumber={17} language={window.language} currentRating={null} onRate={()=>{}} onBookmark={()=>{}} isBookmarked={false} tafsir={explanation} hasMutashabihat shareMutashabihat={groups} selectedReciterId="minshawy"/></ReadingDialogScale></ReadingUiScaleProvider>}
 createRoot(document.getElementById('root')).render(<App/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,write:false,format:'iife',outdir:'out',define:{'import.meta.env':'{}'},plugins:[{name:'native',setup(b){
 b.onResolve({filter:/^@capacitor\/core$/},()=>({path:'core',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:`export const Capacitor={getPlatform:()=>window.platform,isNativePlatform:()=>window.platform==='android'};export const registerPlugin=()=>({hideKeyboard:async()=>{if(window.keyboardPending)await new Promise((resolve,reject)=>{window.finishKeyboard=resolve;window.failKeyboard=reject})},prepareFile:async options=>{window.prepared=options;return{url:'file:///test.mp3'}},saveText:async({text})=>{window.notesTextFile=text},saveBackup:async({text})=>{window.backup=text}});`}));
 b.onResolve({filter:/^@capacitor\/share$/},()=>({path:'share',namespace:'share'}));b.onLoad({filter:/.*/,namespace:'share'},()=>({contents:'export const Share={share:async options=>{window.shareCalls.push(options);return{}}}'}));
 }}]});script=r.outputFiles.find(f=>f.path.endsWith('.js'))!.text;
 const index=fs.readFileSync('dist/index.html','utf8'),cssPath=index.match(/href="([^"]+\.css)"/)![1];css=fs.readFileSync('dist'+cssPath,'utf8')+fs.readFileSync('components/libraryDesign.css','utf8')+fs.readFileSync('components/modalDesign.css','utf8');
});
async function open(page:Page,language='ar',scaled=false){
 await page.route('**/ayah-tools-harness',r=>r.fulfill({contentType:'text/html',body:'<div id="root"></div>'}));
 await page.route('**/quran.json',r=>r.fulfill({json:{data:{surahs:[{...chapter,ayahs:chapter.ayahs.filter((a:any)=>[17,18].includes(a.numberInSurah))}]}}}));
 await page.goto('http://127.0.0.1:5180/ayah-tools-harness');
 await page.evaluate(({language,scaled})=>Object.assign(window,{platform:'android',language,scaled,explanation:'تفسير محفوظ للاختبار',shareCalls:[],__ma3anyData:{'2:17':{'1':{phrase:'مَثَلُهُمْ',meaning:'معنى عربي متاح'},'2':{phrase:'كَمَثَلِ',meaning:'معنى ثان'}}}}),{language,scaled});
 await page.addStyleTag({content:css});await page.addScriptTag({content:script});
 await expect(page.getByRole('button',{name:messages[language].notes,exact:true})).toBeVisible();
}
test('share preview uses local verse, similarities and meanings and excludes personal notes',async({page})=>{
 await open(page);await page.evaluate(()=>(window as any).notes.saveAyahNote(2,17,'ملاحظتي السرية'));
 await page.getByRole('button',{name:'مشاركة الآية',exact:true}).click();const preview=page.locator('[data-share-preview]');
 await expect(preview).toContainText(verse17);await expect(preview).toContainText(verse18);await expect(preview).toContainText('تفسير محفوظ للاختبار');await expect(preview).toContainText('معنى عربي متاح');await expect(preview).not.toContainText('ملاحظتي السرية');
 await page.getByRole('checkbox',{name:'معاني الكلمات',exact:true}).uncheck();await expect(preview).not.toContainText('معنى عربي متاح');
 await page.getByRole('button',{name:/^مشاركة النص/}).click();expect(await page.evaluate(()=>(window as any).shareCalls[0].text)).toContain(verse17);
});
test('missing foreign meanings or translation never silently substitute Arabic',async({page})=>{
 await open(page,'en');await page.getByRole('button',{name:'Share verse',exact:true}).click();const preview=page.locator('[data-share-preview]');await expect(preview).toContainText(verse17);
 await expect(page.getByRole('checkbox',{name:/Word meanings/})).toBeDisabled();await expect(page.getByRole('checkbox',{name:/Verse translation/})).toBeDisabled();await expect(preview).not.toContainText('معنى عربي متاح');
});
test('foreign saved meanings are used and MP3 shares use selected reciter after preparation only',async({page})=>{
 let url='';await page.route('https://everyayah.com/**',r=>{url=r.request().url();const bytes=Buffer.alloc(2048);bytes.write('ID3');return r.fulfill({body:bytes,contentType:'audio/mpeg'})});
 await open(page,'en');await page.evaluate(()=>(window as any).seedWbw({languageCode:'en',data:{'2:17':{'1':{translation:'Their example'}}},timestamp:Date.now()}));
 await page.getByRole('button',{name:'Share verse',exact:true}).click();await expect(page.locator('[data-share-preview]')).toContainText('Their example');
 await page.getByRole('checkbox',{name:/Verse audio/}).check();await expect(page.getByRole('button',{name:/^Share text/})).toBeEnabled();expect(url).toContain('/Minshawy_Murattal_128kbps/002017.mp3');expect(await page.evaluate(()=>(window as any).shareCalls.length)).toBe(0);
 await page.getByRole('button',{name:/^Share text/}).click();await expect.poll(()=>page.evaluate(()=>(window as any).shareCalls.length)).toBe(1);expect(await page.evaluate(()=>(window as any).shareCalls[0].text)).toContain(verse17);expect(await page.evaluate(()=>(window as any).shareCalls[0].files)).toBeUndefined();await expect(page.locator('[data-ayah-tools]')).toHaveCount(1);await page.getByRole('button',{name:/^Share audio/}).click();expect(await page.evaluate(()=>(window as any).prepared.name)).toContain('minshawy.mp3');expect(await page.evaluate(()=>(window as any).shareCalls[1].text)).toBeUndefined();await expect(page.locator('[data-ayah-tools]')).toHaveCount(0);

});
test('audio error pages cannot be shared as MP3 and text remains available',async({page})=>{
 await page.route('https://everyayah.com/**',r=>r.fulfill({body:'<html>error</html>',contentType:'text/html'}));await open(page);await page.getByRole('button',{name:'مشاركة الآية',exact:true}).click();
 await page.getByRole('checkbox',{name:/صوت الآية/}).check();await expect(page.getByRole('alert')).toContainText('تعذّر تجهيز الصوت');await expect(page.getByRole('button',{name:'مشاركة الصوت',exact:true})).toBeDisabled();await page.getByRole('checkbox',{name:/صوت الآية/}).uncheck();await expect(page.getByRole('button',{name:/^مشاركة النص/})).toBeEnabled();

});
test('scaled notes remain within a narrow viewport',async({page})=>{
 await page.setViewportSize({width:320,height:844});await open(page,'ar',true);await page.getByRole('button',{name:'ملاحظاتي',exact:true}).click();const text=page.getByRole('textbox',{name:'ملاحظاتي'});await expect(text).toBeEnabled();const box=await text.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(321);
 await page.evaluate(()=>document.body.insertAdjacentHTML('beforeend','<div style="position:fixed;left:0;right:0;bottom:60px;height:80px;z-index:1000">Audio player</div>'));
 expect(await page.evaluate(()=>!!document.elementFromPoint(160,740)?.closest('[data-ayah-tools]'))).toBe(true);
});
test('shared first verses distinguish unnumbered basmalah from Fatiha verse 1',async({page})=>{
 await open(page);
 const result=await page.evaluate(verses=>verses.map(v=>(window as any).normalizeVerse(v.text,v.surah,1)),[1,2,9].map(surah=>({surah,text:source.data.surahs[surah-1].ayahs[0].text})));
 expect(result[0]).toBe(source.data.surahs[0].ayahs[0].text);expect(result[1]).toBe('الم');expect(result[2]).toBe(source.data.surahs[8].ayahs[0].text);
});

 test('personal note is shared only after selecting its checkbox',async({page})=>{
 await open(page);await page.evaluate(()=>(window as any).notes.saveAyahNote(2,17,'رسالة شخصية'));
 await page.getByRole('button',{name:'مشاركة الآية',exact:true}).click();await expect(page.locator('[data-share-preview]')).not.toContainText('رسالة شخصية');await page.getByRole('checkbox',{name:'مشاركة ملاحظتي',exact:true}).check();await expect(page.locator('[data-share-preview]')).toContainText('رسالة شخصية');
 await page.getByRole('button',{name:/^مشاركة النص/}).click();expect(await page.evaluate(()=>(window as any).shareCalls[0].text)).toContain('رسالة شخصية');
});

async function reopenNotes(page:Page){await page.getByRole('button',{name:'Open verse',exact:true}).click();await page.getByRole('button',{name:'ملاحظاتي',exact:true}).click();}
test('single note field loads saved text, replaces it, saves before closing, and supports deletion',async({page})=>{
 await open(page);await page.evaluate(()=>(window as any).notes.saveAyahNote(2,17,'قديمة'));await page.getByRole('button',{name:'ملاحظاتي',exact:true}).click();
 const field=page.getByRole('textbox',{name:'ملاحظاتي'});await expect(field).toHaveValue('قديمة');await expect(page.locator('[data-saved-note],input[type=file]')).toHaveCount(0);await expect(page.getByRole('textbox')).toHaveCount(1);
 await field.fill('جديدة');await page.getByRole('button',{name:'حفظ الملاحظة',exact:true}).click();await expect(page.locator('[data-ayah-tools]')).toHaveCount(0);expect(await page.evaluate(()=>(window as any).notes.getAyahNote(2,17))).toBe('جديدة');
 await reopenNotes(page);await expect(field).toHaveValue('جديدة');await page.getByRole('button',{name:'حذف الملاحظة',exact:true}).click();await page.getByRole('button',{name:'تأكيد الحذف',exact:true}).click();await expect(field).toHaveValue('');expect(await page.evaluate(()=>(window as any).notes.getAyahNote(2,17))).toBe('');
});
test('text or audio alone stays open; both actions close in either order; cancellation stays open',async({page})=>{
 await page.route('https://everyayah.com/**',r=>{const bytes=Buffer.alloc(2048);bytes.write('ID3');return r.fulfill({body:bytes,contentType:'audio/mpeg'})});
 await open(page);await page.getByRole('button',{name:'مشاركة الآية',exact:true}).click();await page.getByRole('checkbox',{name:/صوت الآية/}).check();await page.getByRole('button',{name:/^مشاركة الصوت/}).click();await expect(page.locator('[data-ayah-tools]')).toHaveCount(1);await page.getByRole('button',{name:/^مشاركة النص/}).click();await expect(page.locator('[data-ayah-tools]')).toHaveCount(0);
 await page.getByRole('button',{name:'Open verse',exact:true}).click();await page.getByRole('button',{name:'مشاركة الآية',exact:true}).click();await page.evaluate(()=>{(window as any).shareCalls={push:()=>{throw Error('Cancelled')}}});await page.getByRole('button',{name:/^مشاركة النص/}).click();await expect(page.locator('[data-ayah-tools]')).toHaveCount(1);
});
test('saved note dialog stays over Quran until keyboard settles; failure does not expose reduced page',async({page})=>{
 await open(page);await page.getByRole('button',{name:'ملاحظاتي',exact:true}).click();await page.getByRole('textbox',{name:'ملاحظاتي'}).fill('ثبات الصفحة');await page.evaluate(()=>{(window as any).keyboardPending=true});
 await page.getByRole('button',{name:'حفظ الملاحظة',exact:true}).click();await expect.poll(()=>page.evaluate(()=>typeof(window as any).finishKeyboard)).toBe('function');
 await expect(page.locator('[data-ayah-tools]')).toHaveCount(1);expect(await page.evaluate(()=>(window as any).notes.getAyahNote(2,17))).toBe('ثبات الصفحة');
 await page.evaluate(()=>(window as any).failKeyboard(Error('Layout not settled')));await expect(page.getByRole('alert')).toBeVisible();await expect(page.locator('[data-ayah-tools]')).toHaveCount(1);
 await page.getByRole('button',{name:'حفظ الملاحظة',exact:true}).click();await expect(page.getByRole('button',{name:'حفظ الملاحظة',exact:true})).toBeDisabled();await page.evaluate(()=>(window as any).finishKeyboard());await expect(page.locator('[data-ayah-tools]')).toHaveCount(0);
});

test('note dialog top remains fixed when keyboard reduces viewport',async({page})=>{
 await open(page);await page.getByRole('button',{name:'ملاحظاتي',exact:true}).click();const panel=page.locator('[data-ayah-tools] section');const top=(await panel.boundingBox())!.y;
 await page.getByRole('textbox').focus();await page.setViewportSize({width:390,height:430});await expect.poll(async()=>Math.abs((await panel.boundingBox())!.y-top)).toBeLessThan(2);
});
test('note button check reflects saved and deleted notes',async({page})=>{
 await open(page);await expect(page.locator('[data-has-note]')).toHaveAttribute('data-has-note','false');await page.getByRole('button',{name:'ملاحظاتي',exact:true}).click();await page.getByRole('textbox').fill('علامة');await page.getByRole('button',{name:'حفظ الملاحظة',exact:true}).click();await page.getByRole('button',{name:'Open verse',exact:true}).click();await expect(page.locator('[data-has-note]')).toHaveAttribute('data-has-note','true');await expect(page.locator('[data-note-check]')).toHaveCount(1);
 await page.getByRole('button',{name:/ملاحظاتي/}).click();await page.getByRole('button',{name:'حذف الملاحظة',exact:true}).click();await page.getByRole('button',{name:'تأكيد الحذف',exact:true}).click();await page.getByRole('button',{name:'رجوع',exact:true}).click();await expect(page.locator('[data-has-note]')).toHaveAttribute('data-has-note','false');
});

test('Android ignores transient visual viewport double keyboard inset',async({page})=>{
 await open(page);await page.getByRole('button',{name:'ملاحظاتي',exact:true}).click();await page.setViewportSize({width:390,height:474});
 await page.evaluate(()=>{Object.defineProperty(window.visualViewport,'height',{configurable:true,get:()=>115});window.visualViewport?.dispatchEvent(new Event('resize'))});
 await expect.poll(async()=>{const box=await page.locator('[data-ayah-tools] section').boundingBox();return box!.height}).toBeGreaterThan(200);
});

async function library(page:Page){await open(page);await page.evaluate(async()=>{await (window as any).notes.saveAyahNote(2,17,'تذكّر هذا الموضع');await (window as any).notes.saveAyahNote(2,18,'ملاحظة ثانية');await (window as any).notes.saveAyahNote(3,1,'سورة أخرى')});await page.getByRole('button',{name:'Open notes library',exact:true}).dispatchEvent('click');await expect(page.locator('[data-note-key]')).toHaveCount(3);}
test('notes library searches, filters, sorts, pins and preserves pins after editing',async({page})=>{
 await library(page);const root=page.locator('[data-notes-library]');await root.getByRole('textbox').fill('تذكر');await expect(root.locator('[data-note-key]')).toHaveCount(1);await root.getByRole('textbox').fill('');await root.getByRole('combobox',{name:'جميع السور'}).selectOption('2');await expect(root.locator('[data-note-key]')).toHaveCount(2);await root.getByRole('combobox',{name:'آخر تعديل'}).selectOption('quran');await expect(root.locator('[data-note-key]').first()).toHaveAttribute('data-note-key','2:17');
 const second=root.locator('[data-note-key="2:18"]');await second.getByRole('button',{name:'تثبيت الملاحظة',exact:true}).click();await expect(root.locator('[data-note-key]').first()).toHaveAttribute('data-note-key','2:18');await second.getByRole('button',{name:'تعديل',exact:true}).click();await expect(page.getByRole('textbox',{name:'ملاحظاتي'})).toHaveValue('ملاحظة ثانية');await page.getByRole('textbox',{name:'ملاحظاتي'}).fill('تم تعديل الثانية');await page.getByRole('button',{name:'حفظ الملاحظة',exact:true}).click();await expect(second.locator('[data-note-text]')).toHaveText('تم تعديل الثانية');await expect(second.getByRole('button',{name:'إلغاء التثبيت',exact:true})).toHaveAttribute('aria-pressed','true');
 expect(await page.evaluate(async()=>((await(window as any).notes.listAyahNotes()).find((n:any)=>n.key==='2:18')).pinned)).toBe(true);
});
test('library delete confirmation and undo restore exact verse note',async({page})=>{
 await library(page);const card=page.locator('[data-note-key="2:17"]');await card.getByRole('button',{name:'حذف',exact:true}).click();await card.getByRole('button',{name:'إلغاء',exact:true}).click();await expect(card).toBeVisible();await card.getByRole('button',{name:'حذف',exact:true}).click();await card.getByRole('button',{name:'تأكيد الحذف',exact:true}).click();await expect(card).toHaveCount(0);await page.getByRole('button',{name:'تراجع عن الحذف',exact:true}).click();await expect(card.locator('[data-note-text]')).toHaveText('تذكّر هذا الموضع');
 await card.getByRole('button',{name:'الانتقال إلى الآية',exact:true}).click();expect(await page.evaluate(()=>(window as any).destination)).toEqual({surah:2,ayah:17});await expect(page.locator('[data-notes-library]')).toHaveCount(0);
});
test('library empty state, no results, long-note expansion and narrow viewport',async({page})=>{
 await page.setViewportSize({width:320,height:700});await open(page);await page.getByRole('button',{name:'Open notes library',exact:true}).dispatchEvent('click');await expect(page.locator('[data-notes-library]')).toContainText('لم تكتب ملاحظات');await page.locator('[data-notes-library]').getByRole('button',{name:'إغلاق',exact:true}).click();
 await page.evaluate(()=>(window as any).notes.saveAyahNote(2,17,'ملاحظة طويلة '.repeat(60)));await page.getByRole('button',{name:'Open notes library',exact:true}).dispatchEvent('click');await page.getByRole('button',{name:'عرض المزيد',exact:true}).click();await expect(page.getByRole('button',{name:'عرض أقل',exact:true})).toBeVisible();const card=await page.locator('[data-note-key]').boundingBox();expect(card!.x).toBeGreaterThanOrEqual(0);expect(card!.x+card!.width).toBeLessThanOrEqual(320);await page.locator('[data-notes-library]').getByRole('textbox').fill('لا يوجد');await expect(page.locator('[data-notes-library]')).toContainText('لا توجد ملاحظات مطابقة');
});

for(const language of Object.keys(messages))test(`notes and sharing complete locale ${language}`,async({page})=>{
 const m=messages[language];await open(page,language);await page.getByRole('button',{name:m.notes,exact:true}).click();await expect(page.getByRole('textbox',{name:m.notes,exact:true})).toHaveAttribute('placeholder',m.placeholder);await expect(page.locator('[data-ayah-tools]')).toHaveAttribute('dir',['ar','ur','fa','ku'].includes(language)?'rtl':'ltr');await expect(page.locator('[data-ayah-tools]')).toContainText(m.local);
 await page.getByRole('textbox',{name:m.notes,exact:true}).fill('USER-NOTE');await page.getByRole('button',{name:m.save,exact:true}).click();await page.getByRole('button',{name:'Open verse',exact:true}).click();await page.getByRole('button',{name:m.share,exact:true}).click();await expect(page.getByRole('button',{name:m.shareText,exact:true})).toBeVisible();await expect(page.getByRole('checkbox',{name:m.noteShare,exact:true})).toBeVisible();await expect(page.locator('[data-ayah-tools]')).toContainText(m.hint);await expect(page.locator('[data-ayah-tools]')).toContainText(m.audioOption);await page.getByRole('button',{name:m.shareText,exact:true}).click();expect(await page.evaluate(()=>(window as any).shareCalls[0].dialogTitle)).toBe(m.share);
 await page.getByRole('button',{name:m.close,exact:true}).click();await page.getByRole('button',{name:'Open notes library',exact:true}).dispatchEvent('click');const library=page.locator('[data-notes-library]');await expect(library).toHaveAttribute('dir',['ar','ur','fa','ku'].includes(language)?'rtl':'ltr');await expect(library.getByRole('textbox',{name:m.search,exact:true})).toBeVisible();await expect(library.getByRole('combobox',{name:m.all,exact:true})).toBeVisible();await expect(library.getByRole('button',{name:m.pin,exact:true})).toBeVisible();await library.getByRole('button',{name:m.edit,exact:true}).click();await expect(page.getByRole('textbox',{name:m.notes,exact:true})).toHaveValue('USER-NOTE');await page.getByRole('button',{name:m.delete,exact:true}).click();await expect(page.locator('[data-ayah-tools]')).toContainText(m.deleteQuestion);await expect(page.getByRole('button',{name:m.confirmDelete,exact:true})).toBeVisible();
});


test('notes library matches unified light and dark palette on a narrow phone',async({page})=>{
 await page.setViewportSize({width:320,height:740});await library(page);
 const root=page.locator('[data-notes-library]');await expect(root.locator('.library-logo')).toBeVisible();
 for(const dark of [false,true]){
  await page.evaluate(dark=>document.documentElement.classList.toggle('dark',dark),dark);
  await expect(root).toHaveCSS('background-color',dark?'rgb(15, 23, 42)':'rgb(255, 255, 255)');
  await expect(root.locator('.library-card h3').first()).toHaveCSS('color',dark?'rgb(251, 191, 36)':'rgb(146, 64, 14)');
  await expect(root.locator('[data-note-text]').first()).toHaveCSS('color',dark?'rgb(203, 213, 225)':'rgb(51, 65, 85)');
  await expect(root.locator('[data-note-key]').first()).toHaveCSS('background-color',dark?'rgb(15, 23, 42)':'rgb(255, 255, 255)');
  expect(await root.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.screenshot({path:`artifacts/library-notes-${dark?'dark':'light'}-320.png`});
 }
});

test('notes header exports all notes despite filtering and bulk delete requires confirmation',async({page})=>{
 await page.setViewportSize({width:320,height:740});await library(page);
 const root=page.locator('[data-notes-library]'),header=root.locator('header');
 await expect(header.getByRole('button',{name:'حذف كل الملاحظات',exact:true}).locator('svg[data-delete-icon]')).toHaveCount(1);
 await expect(header.getByRole('button',{name:'حذف كل الملاحظات',exact:true}).locator('svg[data-delete-icon]')).toHaveAttribute('fill','none');
 expect(await header.locator('h2 small').textContent()).not.toMatch(/[·•]/);
 const deletion=await header.getByRole('button',{name:'حذف كل الملاحظات',exact:true}).boundingBox(),closing=await header.getByRole('button',{name:'إغلاق',exact:true}).boundingBox();
 expect(Math.abs(deletion!.x+deletion!.width/2-closing!.x-closing!.width/2)).toBeGreaterThanOrEqual(64);

 await page.evaluate(()=>localStorage.setItem('mushaf-word-review-v1',JSON.stringify({sentinel:'words remain'})));
 await root.getByRole('textbox').fill('تذكّر');await expect(root.locator('[data-note-key]')).toHaveCount(1);
 await header.getByRole('button',{name:'حفظ أو مشاركة كل الملاحظات',exact:true}).click();
 await header.getByRole('button',{name:'حفظ ملف نصي',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>(window as any).notesTextFile)).toBeTruthy();
 const text=await page.evaluate(()=>(window as any).notesTextFile);
 expect(text).toContain('البقرة · آية 17');expect(text).toContain('تذكّر هذا الموضع');expect(text).toContain('البقرة · آية 18');expect(text).toContain('ملاحظة ثانية');expect(text).toContain('آل عمران · آية 1');expect(text).toContain('سورة أخرى');
 await header.getByRole('button',{name:'حفظ أو مشاركة كل الملاحظات',exact:true}).click();await header.getByRole('button',{name:'مشاركة النص',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>(window as any).shareCalls.at(-1)?.text)).toBe(text);
 expect(await page.evaluate(async()=>((window as any).notes.listAyahNotes()).then((v:any)=>v.length))).toBe(3);
 await header.getByRole('button',{name:'حذف كل الملاحظات',exact:true}).click();const dialog=page.getByRole('alertdialog');await expect(dialog).toContainText('حتى المخفية بالتصفية');
 await dialog.getByRole('button',{name:'إلغاء',exact:true}).click();expect(await page.evaluate(async()=>((window as any).notes.listAyahNotes()).then((v:any)=>v.length))).toBe(3);
 await header.getByRole('button',{name:'حذف كل الملاحظات',exact:true}).click();await dialog.getByRole('button',{name:'تأكيد الحذف',exact:true}).click();
 await expect(root.locator('[data-note-key]')).toHaveCount(0);await expect.poll(()=>page.evaluate(async()=>((window as any).notes.listAyahNotes()).then((v:any)=>v.length))).toBe(0);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('mushaf-word-review-v1')!))).toEqual({sentinel:'words remain'});
 await expect(header.getByRole('button',{name:'حذف كل الملاحظات',exact:true})).toBeDisabled();
 expect(await root.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
 await page.screenshot({path:'artifacts/library-bulk-notes-320.png'});
});
