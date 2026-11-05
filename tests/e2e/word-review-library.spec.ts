import { test, expect, Page } from '@playwright/test';
import { build } from 'esbuild';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const quran = JSON.parse(readFileSync('public/quran.json', 'utf8'));
const verse = (s: number, a: number) => quran.data.surahs[s - 1].ayahs[a - 1].text as string;
function word(s: number, a: number, position: number, page: number) {
    const data = JSON.parse(readFileSync(`public/data/v2/pages/${page}.json`, 'utf8'));
    return (Object.values(data.lines).flat() as any[]).find(w => w.verse_key === `${s}:${a}` && Number(w.position) === position).code_v2;
}
const records = [
    { key: '2:17:1', surah: 2, ayah: 17, position: 1, page: 4, word: word(2,17,1,4), forgotten: true, pronunciation: false, note: 'ملاحظة أولى', updatedAt: 10 },
    { key: '2:282:1', surah: 2, ayah: 282, position: 1, page: 48, word: word(2,282,1,48), forgotten: false, pronunciation: true, note: 'ملاحظة آية طويلة', updatedAt: 20 },
    { key: '41:21:1', surah: 41, ayah: 21, position: 1, page: 479, word: word(41,21,1,479), forgotten: true, pronunciation: true, note: 'ملاحظة الحالتين', updatedAt: 30 },
    { key: '2:17:2', surah: 2, ayah: 17, position: 2, page: 4, word: word(2,17,2,4), forgotten: false, pronunciation: false, note: 'ملاحظة فقط', updatedAt: 5 },
].map(r => ({ ...r, context: 'سياق خاطئ يجب عدم عرضه' }));
let script: string, css: string;
test.beforeAll(async () => {
    const result = await build({ stdin: { contents: `import React from 'react';import{createRoot}from'react-dom/client';import Words from './components/WordsLibrary';window.calls=[];const root=createRoot(document.getElementById('root'));window.unmountWords=()=>root.unmount();root.render(<Words onBeforeWordAudio={()=>window.audioBefore=(window.audioBefore||0)+1} onClose={()=>window.calls.push('close')} onNavigate={async(s,a)=>window.calls.push([s,a])}/>);`, loader: 'tsx', resolveDir: process.cwd() }, bundle: true, write: false, format: 'iife', outdir: 'out' });
    script = result.outputFiles.find(f => f.path.endsWith('.js'))!.text;
    const index = readFileSync('dist/index.html', 'utf8');
    css = readFileSync(path.join('dist', index.match(/href="([^"]+\.css)"/)![1]), 'utf8') + readFileSync('components/wordsLibrary.css', 'utf8') + readFileSync('components/libraryDesign.css', 'utf8') + readFileSync('components/modalDesign.css', 'utf8');
});
async function open(page: Page, seed = true) {
    await page.route('https://words.test/**', route => {
        const url = new URL(route.request().url());
        if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: '<html dir="rtl"><meta charset="utf-8"><style>body{margin:0;color:white;--text-primary:#1e293b;--bg-primary:#fcfaf6;--bg-card:white;--border-primary:#ddd}</style><div id="root"></div></html>' });
        const file = path.join(process.cwd(), 'public', decodeURIComponent(url.pathname));
        return existsSync(file) ? route.fulfill({ path: file }) : route.fulfill({ status: 404, body: '' });
    });
    await page.goto('https://words.test/');
    if (seed) await page.evaluate(rows => localStorage.setItem('mushaf-word-review-v1', JSON.stringify(Object.fromEntries(rows.map(r => [r.key, r])))), records);
    await page.addStyleTag({ content: css }); await page.addScriptTag({ content: script });
    await expect(page.locator('[data-words-library]')).toBeVisible();
    await expect(page.locator('[data-words-library]')).toHaveCSS('position','relative');
    await expect(page.locator('[data-words-library]')).toHaveCSS('background-color','rgb(255, 255, 255)');
}
const card = (page: Page, key: string) => page.locator(`[data-word-review-key="${key}"]`);

test('uses complete canonical verses and correct page fonts, for records on different pages', async ({page}) => {
    await open(page);
    for (const r of records) {
        const current = card(page,r.key);
        await expect(current.locator('[data-review-verse]')).toHaveText(verse(r.surah,r.ayah));
        await expect(current.locator('[data-review-word]')).toHaveText(r.word);
        await expect(current.locator('[data-review-word]')).toHaveCSS('font-family', `review-p${r.page}-v2`);
    }
    await expect(page.getByText('سياق خاطئ يجب عدم عرضه')).toHaveCount(0);
    const long = card(page,'2:282:1');
    await long.getByRole('button',{name:'عرض الآية كاملة',exact:true}).click();
    await expect(long.locator('[data-review-verse]')).not.toHaveClass(/words-library-preview/);
    expect((await long.locator('[data-review-verse]').textContent())!.endsWith(verse(2,282).slice(-40))).toBe(true);
    await page.setViewportSize({width:320,height:740});
    expect(await page.evaluate(()=>document.querySelector('[data-words-library]')!.scrollWidth<=innerWidth)).toBe(true);
    await page.locator('.words-library-list').evaluate(e=>e.scrollTop=0);
    await page.screenshot({path:'artifacts/words-library-mobile.png'});
    await page.evaluate(()=>document.documentElement.classList.add('dark'));
    await expect(page.locator('[data-words-library]')).toHaveCSS('color','rgb(241, 245, 249)');
    await page.screenshot({path:'artifacts/words-library-mobile-dark.png'});
});

test('searches, filters, sorts and pins without changing other occurrences', async ({page}) => {
    await open(page);
    await page.getByLabel('نوع الصعوبة',{exact:true}).selectOption('both');
    await expect(page.locator('[data-word-review-key]')).toHaveCount(1);
    await expect(card(page,'41:21:1')).toBeVisible();
    await page.getByLabel('نوع الصعوبة',{exact:true}).selectOption('notes');
    await expect(card(page,'2:17:2')).toBeVisible();
    await page.getByLabel('نوع الصعوبة',{exact:true}).selectOption('all');
    await page.getByLabel('السورة',{exact:true}).selectOption('41');
    await expect(page.locator('[data-word-review-key]')).toHaveCount(1);
    await page.getByRole('button',{name:'مسح البحث والتصفية'}).click();
    await page.getByLabel('البحث في الكلمات',{exact:true}).fill('ملاحظة أولى');
    await expect(page.locator('[data-word-review-key]')).toHaveCount(1);
    await page.getByLabel('البحث في الكلمات',{exact:true}).fill('لا توجد هذه العبارة');
    await expect(page.getByText('لا توجد كلمات تطابق البحث أو التصفية.')).toBeVisible();
    await page.getByRole('button',{name:'مسح البحث والتصفية'}).click();
    await page.getByLabel('ترتيب الكلمات',{exact:true}).selectOption('quran');
    await expect(page.locator('[data-word-review-key]').first()).toHaveAttribute('data-word-review-key','2:17:1');
    await card(page,'41:21:1').getByRole('button',{name:'تثبيت الكلمة',exact:true}).click();
    await expect(page.locator('[data-word-review-key]').first()).toHaveAttribute('data-word-review-key','41:21:1');
    await expect(card(page,'2:17:1').getByRole('button',{name:'تثبيت الكلمة',exact:true})).toHaveAttribute('aria-pressed','false');
    await open(page,false);
    await expect(card(page,'41:21:1').getByRole('button',{name:'إلغاء تثبيت الكلمة',exact:true})).toHaveAttribute('aria-pressed','true');
});

test('edits independently, preserves notes on clearing marks, confirms deletion and supports undo', async ({page}) => {
    await open(page);
    const first = card(page,'2:17:1');
    await first.getByRole('button',{name:'إزالة العلامات',exact:true}).click();
    await expect(first.locator('[data-review-note]')).toHaveText('ملاحظة أولى');
    await expect(first.getByText('ملاحظة فقط',{exact:true})).toBeVisible();
    await first.getByRole('button',{name:'تعديل',exact:true}).click();
    await first.getByLabel('صعوبة النطق',{exact:true}).check();
    await first.getByLabel('ملاحظة الكلمة').fill('ملاحظة معدلة');
    await first.getByRole('button',{name:'تم',exact:true}).click();
    await expect(first.locator('[data-review-note]')).toHaveText('ملاحظة معدلة');
    await expect(card(page,'2:17:2').locator('[data-review-note]')).toHaveText('ملاحظة فقط');
    await first.getByRole('button',{name:'حذف',exact:true}).click();
    await first.getByRole('button',{name:'إلغاء',exact:true}).click();
    await expect(first).toBeVisible();
    await first.getByRole('button',{name:'حذف',exact:true}).click();
    await first.getByRole('button',{name:'تأكيد الحذف',exact:true}).click();
    await expect(first).toHaveCount(0);
    await page.getByRole('button',{name:'تراجع عن الحذف',exact:true}).click();
    await expect(first.locator('[data-review-note]')).toHaveText('ملاحظة معدلة');
    await first.getByRole('button',{name:'الانتقال إلى الموضع',exact:true}).click();
    expect(await page.evaluate(()=>(window as any).calls)).toEqual([[2,17],'close']);
});

test('never falls back to corrupted saved context when Quran loading fails', async ({page}) => {
    await page.route('https://words.test/quran.json',route=>route.fulfill({status:500,body:''}));
    // The more specific route is registered last so it takes precedence.
    await open(page);
    await page.route('https://words.test/quran.json',route=>route.fulfill({status:500,body:''}));
    await page.reload();await page.addStyleTag({content:css});await page.addScriptTag({content:script});
    await expect(page.getByText('تعذّر تحميل نص الآيات.',{exact:false})).toBeVisible();
    await expect(page.locator('[data-review-verse]')).toHaveCount(0);
    await expect(page.getByText('سياق خاطئ يجب عدم عرضه')).toHaveCount(0);
    await page.unroute('https://words.test/quran.json');
    await page.getByRole('button',{name:'إعادة المحاولة',exact:true}).click();
    await expect(card(page,'2:17:1').locator('[data-review-verse]')).toHaveText(verse(2,17));
});

async function mockWordAudio(page: Page) {
    await page.addInitScript(() => {
        const state = window as any;
        state.wordAudioEvents = []; state.wordAudioInstances = []; state.audioToasts = [];
        window.addEventListener('showToast', (event: any) => state.audioToasts.push(event.detail));
        state.Audio = class {
            src: string; onended: any; onerror: any; oncanplaythrough: any;
            constructor(src: string) { this.src = src; state.wordAudioInstances.push(this); }
            addEventListener() {}
            play() { state.wordAudioEvents.push(['play', this.src]); return Promise.resolve(); }
            pause() { state.wordAudioEvents.push(['pause', this.src]); }
            load() {}
            removeAttribute(name: string) { if (name === 'src') this.src = ''; }
        };
    });
    await page.route('https://audio.qurancdn.com/**', route => route.abort());
}

test('word audio uses the exact position, toggles stop, switches words and stops when filtered out', async ({page}) => {
    await mockWordAudio(page); await open(page);
    const before = await page.evaluate(() => localStorage.getItem('mushaf-word-review-v1'));
    const first = card(page,'2:17:1');
    const second = card(page,'41:21:1');
    await first.getByRole('button',{name:'تشغيل صوت الكلمة',exact:true}).click();
    await expect(first.getByRole('button',{name:'إيقاف صوت الكلمة',exact:true})).toBeVisible();
    expect(await page.evaluate(()=>(window as any).wordAudioEvents)).toContainEqual(['play','https://audio.qurancdn.com/wbw/002_017_001.mp3']);
    await second.getByRole('button',{name:'تشغيل صوت الكلمة',exact:true}).click();
    await expect(second.getByRole('button',{name:'إيقاف صوت الكلمة',exact:true})).toBeVisible();
    const events = await page.evaluate(()=>(window as any).wordAudioEvents);
    expect(events.indexOf(events.find((e:any)=>e[0]==='pause'&&e[1].endsWith('002_017_001.mp3')))).toBeLessThan(events.indexOf(events.find((e:any)=>e[0]==='play'&&e[1].endsWith('041_021_001.mp3'))));
    await second.getByRole('button',{name:'إيقاف صوت الكلمة',exact:true}).click();
    await expect(second.getByRole('button',{name:'تشغيل صوت الكلمة',exact:true})).toBeVisible();
    await first.getByRole('button',{name:'تشغيل صوت الكلمة',exact:true}).click();
    await expect(first.getByRole('button',{name:'إيقاف صوت الكلمة',exact:true})).toBeVisible();
    await page.evaluate(()=>(window as any).wordAudioInstances.at(-1).onended());
    await expect(first.getByRole('button',{name:'تشغيل صوت الكلمة',exact:true})).toBeVisible();
    await first.getByRole('button',{name:'تشغيل صوت الكلمة',exact:true}).click();
    await expect(first.getByRole('button',{name:'إيقاف صوت الكلمة',exact:true})).toBeVisible();
    await page.evaluate(()=>(window as any).wordAudioInstances.at(-1).onerror());
    await expect(first.getByRole('button',{name:'تشغيل صوت الكلمة',exact:true})).toBeVisible();
    expect(await page.evaluate(()=>(window as any).audioToasts.length)).toBe(1);
    await first.getByRole('button',{name:'تشغيل صوت الكلمة',exact:true}).click();
    await expect(first.getByRole('button',{name:'إيقاف صوت الكلمة',exact:true})).toBeVisible();
    await page.getByLabel('السورة',{exact:true}).selectOption('41');
    await expect(page.getByRole('button',{name:'إيقاف صوت الكلمة',exact:true})).toHaveCount(0);
    expect(await page.evaluate(()=>(window as any).wordAudioEvents.at(-1)[0])).toBe('pause');
    expect(await page.evaluate(()=>localStorage.getItem('mushaf-word-review-v1'))).toBe(before);
    expect(await page.evaluate(()=>(window as any).audioBefore)).toBe(5);
});

test('word audio plays the local cache and stops on close or unmount', async ({page}) => {
    await mockWordAudio(page); await open(page);
    await page.evaluate(() => new Promise<void>((resolve,reject) => {
        const req = indexedDB.open('quran-audio-blobs',1);
        req.onupgradeneeded=()=>req.result.createObjectStore('audio-files');
        req.onerror=()=>reject(req.error);
        req.onsuccess=()=>{const db=req.result;const tx=db.transaction('audio-files','readwrite');tx.objectStore('audio-files').put(new Blob([new Uint8Array(2048)],{type:'audio/mpeg'}),'https://audio.qurancdn.com/wbw/002_017_001.mp3');tx.oncomplete=()=>{db.close();resolve()};};
    }));
    const first=card(page,'2:17:1');
    await first.getByRole('button',{name:'تشغيل صوت الكلمة',exact:true}).click();
    await expect(first.getByRole('button',{name:'إيقاف صوت الكلمة',exact:true})).toBeVisible();
    expect(await page.evaluate(()=>(window as any).wordAudioEvents.at(-1)[1])).toMatch(/^blob:/);
    await page.getByRole('button',{name:'إغلاق الكلمات',exact:true}).click();
    expect(await page.evaluate(()=>(window as any).wordAudioEvents.at(-1)[0])).toBe('pause');
    await first.getByRole('button',{name:'تشغيل صوت الكلمة',exact:true}).click();
    await expect(first.getByRole('button',{name:'إيقاف صوت الكلمة',exact:true})).toBeVisible();
    await page.evaluate(()=>(window as any).unmountWords());
    expect(await page.evaluate(()=>(window as any).wordAudioEvents.at(-1)[0])).toBe('pause');
});


test('unified library palette, logo and narrow phone layout in both modes', async ({page}) => {
    await page.setViewportSize({width:320,height:740});
    await open(page);
    const library=page.locator('[data-words-library]');
    await expect(library.locator('header h2')).toHaveText('الكلمات');
    await expect(library.locator('header small')).toHaveCount(0);
    await expect(library.locator('.words-library-results')).toContainText(/[4٤]/);
    await expect(library.locator('.library-logo')).toBeVisible();
    for (const dark of [false,true]) {
        await page.evaluate(dark=>document.documentElement.classList.toggle('dark',dark),dark);
        await expect(library).toHaveCSS('background-color',dark?'rgb(15, 23, 42)':'rgb(255, 255, 255)');
        await expect(library.locator('.forgotten').first()).toHaveCSS('background-color','rgb(250, 204, 21)');
        await expect(library.locator('.pronunciation').first()).toHaveCSS('background-color','rgb(251, 146, 60)');
        await expect(library.locator('.forgotten').first()).toHaveCSS('color','rgb(66, 32, 6)');
        await expect(library.locator('.words-library-card h3').first()).toHaveCSS('color',dark?'rgb(251, 191, 36)':'rgb(146, 64, 14)');
        await expect(library.locator('.words-library-verse').first()).toHaveCSS('color',dark?'rgb(94, 234, 212)':'rgb(15, 118, 110)');
        await expect(library.locator('.words-library-note').first()).toHaveCSS('color',dark?'rgb(203, 213, 225)':'rgb(51, 65, 85)');
        await expect(card(page,'2:17:1')).toHaveCSS('background-color',dark?'rgb(15, 23, 42)':'rgb(255, 255, 255)');
        expect(await library.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
        await page.screenshot({path:`artifacts/library-words-${dark?'dark':'light'}-320.png`});
    }
});

test('word header clears every occurrence only after confirmation and keeps other storage',async({page})=>{
 await page.setViewportSize({width:320,height:740});await open(page);
 const header=page.locator('[data-words-library] header');
 await expect(header.getByRole('button',{name:'حذف كل الكلمات',exact:true}).locator('svg[data-delete-icon]')).toHaveCount(1);
 await expect(header.getByRole('button',{name:'حذف كل الكلمات',exact:true}).locator('svg[data-delete-icon]')).toHaveAttribute('fill','none');
 const deletion=await header.getByRole('button',{name:'حذف كل الكلمات',exact:true}).boundingBox(),closing=await header.getByRole('button',{name:'إغلاق الكلمات',exact:true}).boundingBox();
 expect(Math.abs(deletion!.x+deletion!.width/2-closing!.x-closing!.width/2)).toBeGreaterThanOrEqual(64);

 await page.evaluate(()=>localStorage.setItem('library-test-note','personal notes remain'));
 await page.getByLabel('السورة',{exact:true}).selectOption('41');await expect(page.locator('[data-word-review-key]')).toHaveCount(1);
 await header.getByRole('button',{name:'حذف كل الكلمات',exact:true}).click();
 const dialog=page.getByRole('alertdialog');await expect(dialog).toContainText('حتى المخفية بالتصفية');
 await dialog.getByRole('button',{name:'إلغاء',exact:true}).click();await expect(page.locator('[data-word-review-key]')).toHaveCount(1);
 expect(await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('mushaf-word-review-v1')!)).length)).toBe(4);
 await header.getByRole('button',{name:'حذف كل الكلمات',exact:true}).click();await dialog.getByRole('button',{name:'تأكيد الحذف',exact:true}).click();
 await expect(page.locator('[data-word-review-key]')).toHaveCount(0);expect(await page.evaluate(()=>localStorage.getItem('mushaf-word-review-v1'))).toBe('{}');
 expect(await page.evaluate(()=>localStorage.getItem('library-test-note'))).toBe('personal notes remain');
 await expect(header.getByRole('button',{name:'حذف كل الكلمات',exact:true})).toBeDisabled();
 await open(page,false);await expect(page.locator('[data-word-review-key]')).toHaveCount(0);
});

test('bulk word deletion leaves records intact when storage fails',async({page})=>{
 await open(page);await page.getByRole('button',{name:'حذف كل الكلمات',exact:true}).click();
 await page.evaluate(()=>{const original=Storage.prototype.setItem;(window as any).restoreStorage=()=>Storage.prototype.setItem=original;Storage.prototype.setItem=function(key,value){if(key==='mushaf-word-review-v1')throw Error('Storage unavailable');return original.call(this,key,value)}});
 const dialog=page.getByRole('alertdialog');await dialog.getByRole('button',{name:'تأكيد الحذف',exact:true}).click();
 await expect(dialog.getByRole('alert')).toBeVisible();await expect(page.locator('[data-word-review-key]')).toHaveCount(4);
 expect(await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('mushaf-word-review-v1')!)).length)).toBe(4);
 await page.evaluate(()=>(window as any).restoreStorage());await dialog.getByRole('button',{name:'إلغاء',exact:true}).click();
});
