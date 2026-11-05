import { test, expect, Page } from '@playwright/test';
import { build } from 'esbuild';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { PNG } = createRequire(path.join(process.cwd(),'package.json'))('./node_modules/playwright-core/lib/utilsBundle.js');

function sameRaster(a: Buffer, b: Buffer) {
    if(a.equals(b))return true;
    const x=PNG.sync.read(a),y=PNG.sync.read(b);
    if(x.width!==y.width||x.height!==y.height)return false;
    let edgePixels=0;
    for(let i=0;i<x.data.length;i+=4){
        let difference=0;
        for(let c=0;c<4;c++)difference=Math.max(difference,Math.abs(x.data[i+c]-y.data[i+c]));
        // Chromium occasionally rounds a few SVG antialias edge colors by 1–4
        // levels. Geometry/text/style are also compared exactly below.
        if(difference>4)return false;
        if(difference>0&&++edgePixels>20)return false;
    }
    return true;
}

let script: string, baselineScript: string | undefined, css: string;
const entry = `
import React,{useState} from 'react';import{createRoot}from'react-dom/client';
import Renderer from './components/QPCV2PageRenderer';
import Reading from './components/EnlargedReadingView';
import WordsLibrary from './components/WordsLibrary';
import {ReadingUiScaleProvider} from './components/ReadingUiScale';
import {ViewMode} from './types';
window.calls=[];window.__ma3anyData={'2:17':{'1':{phrase:'مَثَلُهُمْ',meaning:'معنى تجريبي للتحقق من ربط الكلمة'}}};
function App(){
 const [library,setLibrary]=useState(false);
 const [reading,setReading]=useState(false),[size,setSize]=useState(32),[page,setPage]=useState(4),[toggleState,setToggleState]=useState(0),[mode,setMode]=useState(ViewMode.SHOW_ALL),[playing,setPlaying]=useState(null),[audio,setAudio]=useState(false);
 const [language,setLanguage]=useState('ar');
 const [controls,setControls]=useState(true);
 window.control={setToggleState,setPage,setMode,setPlaying,setAudio,setSize,setControls,setLanguage};
 window.readingPage=page;
 const content=(gesture)=> <Renderer pageNumber={page} language="ar" mode={mode} toggleState={toggleState} playingAyahId={playing} audioModeActive={audio}
 onAyahClickForAudio={(s,a)=>window.calls.push(['ayah-audio',s,a])}
 onRateAyah={(s,a)=>window.calls.push(['rate',s,a])} onRateSurah={s=>window.calls.push(['surah',s])}
 verseBookmarks={[{id:'4-2-17'}]} memorizationRatings={[{surah:2,ayah:17,rating:'good'}]}
 {...(reading?{readingFontSize:size,readingGestureRef:gesture}:{})}/>;
 return <ReadingUiScaleProvider active={reading} fontSize={size}>{library&&<WordsLibrary onClose={()=>setLibrary(false)} onNavigate={async(s,a)=>window.calls.push(['navigate-word',s,a])}/>}<button id="words-library" onClick={()=>setLibrary(true)}>Words</button><button id="toggle" onClick={()=>setReading(v=>!v)}>Toggle</button><div id="viewport" style={{height:760,position:'relative',overflow:'auto'}} onClick={()=>window.calls.push(['tap'])}>
 {reading?<Reading pageNumber={page} totalPages={604} fontSize={size} onFontSizeChange={setSize} onExit={()=>setReading(false)} onNavigate={setPage} language={language} controlsVisible={controls}>{content}</Reading>:content(undefined)}
 </div></ReadingUiScaleProvider>;
}createRoot(document.getElementById('root')).render(<App/>);`;

test.beforeAll(async () => {
    const buildScript = async (baseline = false) => {
        const result = await build({ stdin: { contents: entry, loader: 'tsx', resolveDir: process.cwd() },
            bundle: true, write: false, format: 'iife', outdir: 'out',
            plugins: [{ name: 'test-audio', setup(builder) {
                builder.onResolve({ filter: /useWordByWordAudio$/ }, () => ({ path: 'audio', namespace: 'mock' }));
                builder.onLoad({ filter: /.*/, namespace: 'mock' }, () => ({ contents: `import{useState}from'react';export function useWordByWordAudio(){const[activeWord,set]=useState(null);return{activeWord,stopAudio:()=>set(null),playWordAudio:(s,a,w)=>{window.calls.push(['word-audio',s,a,w]);set({surah:s,ayah:a,word:w})}}}`, resolveDir: process.cwd() }));
                const reference = baseline ? 'artifacts/reading-original-renderer.txt' : process.env.READING_RENDERER_REFERENCE;
                if (reference) builder.onLoad({ filter: /QPCV2PageRenderer\.tsx$/ }, args => ({ contents: readFileSync(reference,'utf8'), loader: 'tsx', resolveDir: path.dirname(args.path) }));
            } }],
        });
        return result.outputFiles.find(f => f.path.endsWith('.js'))!.text;
    };
    script = await buildScript();
    if (existsSync('artifacts/reading-original-renderer.txt')) baselineScript = await buildScript(true);
    // Use the production stylesheet so the test includes the original global layout rules.
    const buildDir = process.env.READING_TEST_DIST || 'dist';
    const index = readFileSync(path.join(buildDir, 'index.html'), 'utf8');
    const cssPath = index.match(/href="([^"]+\.css)"/)![1];
    css = readFileSync(path.join(buildDir, cssPath), 'utf8') + readFileSync('components/wordsLibrary.css', 'utf8');
});

async function open(page: Page, bundle = script) {
    await page.route('https://reading.test/**', async route => {
        const url = new URL(route.request().url());
        if (url.pathname === '/') return route.fulfill({ contentType:'text/html', body:'<html dir="rtl"><meta charset="utf-8"><style>body{margin:0;--bg-primary:#fcfaf6;--bg-card:#fff;--text-primary:#222;--border-primary:#ddd;--accent-color:#b45309}</style><div id="root"></div></html>' });
        const file = path.join(process.cwd(), 'public', decodeURIComponent(url.pathname));
        if (existsSync(file)) return route.fulfill({ path:file });
        return route.fulfill({ status:404,body:'' });
    });
    await page.goto('https://reading.test');
    await page.addStyleTag({ content:css });
    await page.addScriptTag({ content:bundle });
    await expect(page.locator('.mushaf-page-qpc [data-word-surah]').first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
}
async function enter(page: Page) {
    await page.locator('#toggle').click();
    await expect(page.locator('.reading-page-qpc [data-word-surah]').first()).toBeVisible();
}
async function openApplication(page: Page) {
    await page.addInitScript(()=>{
        localStorage.setItem('hasSeenTour','true');localStorage.setItem('quran_language_selected','true');
        localStorage.setItem('quran_last_page','4');
        localStorage.setItem('quran_app_settings',JSON.stringify({language:'ar',prayerMode:false}));
        localStorage.setItem('mushaf_measurement_choice_v1',JSON.stringify({version:1,age:'unknown',allowed:false}));
    });
    await page.route(/^https?:\/\//, route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    await page.goto('http://127.0.0.1:5180',{waitUntil:'domcontentloaded'});
    await expect(page.locator('main .mushaf-page-qpc').first()).toBeVisible({timeout:30000});
    await page.waitForTimeout(4200);
    await expect(page.locator('[data-mushaf-viewport]')).toBeVisible();
}
const wordSelector = '[data-word-surah="2"][data-word-ayah="17"][data-word-position="1"]';
async function enlargeByPinch(page: Page) {
    await page.locator('.enlarged-reading-scroll').evaluate(el => {
        for (const [type, positions] of [['touchstart', [100, 200]], ['touchmove', [100, 206.25]], ['touchend', []]] as const) {
            const touches = positions.map((x,i) => new Touch({identifier:i,target:el,clientX:x,clientY:250}));
            el.dispatchEvent(new TouchEvent(type,{bubbles:true,cancelable:true,touches,targetTouches:touches,changedTouches:touches}));
        }
    });
    await page.waitForTimeout(750);
}

test('reflows without losing any words, changes size, and restores original page exactly', async ({page}) => {
    await open(page);
    const words = await page.locator('.mushaf-page-qpc [data-word-surah]').evaluateAll(es => es.map(e=>[e.getAttribute('data-word-surah'),e.getAttribute('data-word-ayah'),e.textContent]));
    await page.waitForTimeout(750); // Original fitting settles after the existing resize timer.
    const original = await page.locator('.mushaf-page-qpc').screenshot();
    await enter(page);
    expect(await page.locator('.reading-page-qpc [data-word-surah]').evaluateAll(es => es.map(e=>[e.getAttribute('data-word-surah'),e.getAttribute('data-word-ayah'),e.textContent]))).toEqual(words);
    const first = page.locator(wordSelector);
    const before = await first.evaluate(e=>getComputedStyle(e).fontSize);
    await enlargeByPinch(page);
    expect(await first.evaluate(e=>getComputedStyle(e).fontSize)).not.toBe(before);
    expect(await page.locator('.enlarged-reading-scroll').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
    await page.getByRole('button',{name:'عرض المصحف',exact:true}).click();
    await expect(page.locator('.mushaf-page-qpc')).toBeVisible();
    await page.waitForTimeout(750);
    expect((await page.locator('.mushaf-page-qpc').screenshot()).equals(original)).toBe(true);
    await enter(page);
    await expect(page.locator('output')).toHaveText('106%');
});

test('word meaning/audio, verse actions, bookmarks, highlighting and hide/reveal share original services', async ({page}) => {
    await open(page); await enter(page);
    const first = page.locator(wordSelector);
    await first.dispatchEvent('pointerdown',{clientX:180,clientY:200});
    await expect(page.getByText('معنى تجريبي للتحقق من ربط الكلمة')).toBeVisible();
    await first.dispatchEvent('pointerup');
    expect(await page.evaluate(()=>(window as any).calls)).toContainEqual(['word-audio',2,17,1]);
    await page.mouse.click(370,740);
    const end = page.locator('[data-word-ayah="17"]').filter({has:page.locator('.ayah-number-wrapper')});
    await end.click();
    expect(await page.evaluate(()=>(window as any).calls)).toContainEqual(['rate',2,17]);
    await expect(end.locator('svg.lucide-bookmark')).toHaveCount(1);
    await page.evaluate(()=>(window as any).control.setPlaying('2-17'));
    await expect(first).toHaveClass(/reading-word-highlight/);
    await page.evaluate(()=>(window as any).control.setAudio(true));
    await page.evaluate(()=>(window as any).control.setControls(false));
    await first.click();
    expect(await page.evaluate(()=>(window as any).calls)).toContainEqual(['ayah-audio',2,17]);
    await page.evaluate(()=>(window as any).control.setAudio(false));
    await page.evaluate(()=>(window as any).control.setMode('HIDE_ALL_AYAHS'));
    await expect(first).toHaveCSS('color','rgba(0, 0, 0, 0)');
    await expect(first).toHaveCSS('background-color','rgb(51, 65, 85)');
    await first.click();
    await expect(first).not.toHaveCSS('color','rgba(0, 0, 0, 0)');
    await first.click();
    await expect(first).toHaveCSS('color','rgba(0, 0, 0, 0)');
});

test('reading word taps toggle controls during recitation without a trip to the page footer', async ({page}) => {
    await open(page); await enter(page);
    await page.evaluate(() => {
        (window as any).control.setAudio(true);
        (window as any).control.setControls(false);
        document.getElementById('viewport')!.addEventListener('click', () => {
            const visible = document.querySelector('.enlarged-reading-toolbar')!.getAttribute('data-reading-controls') === 'true';
            (window as any).control.setControls(!visible);
        });
    });
    const toolbar=page.locator('.enlarged-reading-toolbar');
    await expect(toolbar).not.toBeVisible();
    await page.locator(wordSelector).click();
    await expect(toolbar).toBeVisible();
    await page.locator(wordSelector).click();
    await expect(toolbar).not.toBeVisible();
    expect(await page.evaluate(()=>(window as any).calls.filter(c=>c[0]==='tap').length)).toBe(2);
    expect(await page.evaluate(()=>(window as any).calls)).toContainEqual(['ayah-audio',2,17]);
});

test('pinch resizes text and suppresses pending word presses and clicks', async ({page}) => {
    await open(page); await enter(page);
    const first = page.locator(wordSelector);
    await first.dispatchEvent('pointerdown',{clientX:160,clientY:200});
    const pinch = async (type:string, points:number[][]) => page.locator('.enlarged-reading-scroll').evaluate((el,{type,points})=>{
        const touches=points.map((p,i)=>new Touch({identifier:i,target:el,clientX:p[0],clientY:p[1]}));
        el.dispatchEvent(new TouchEvent(type,{bubbles:true,cancelable:true,touches,targetTouches:touches,changedTouches:touches}));
    },{type,points});
    await pinch('touchstart',[[100,250],[200,250]]);
    await pinch('touchmove',[[70,250],[230,250]]);
    await expect(page.locator('output')).toHaveText('159%');
    await pinch('touchend',[]);
    await first.dispatchEvent('click');
    await page.waitForTimeout(650);
    expect(await page.evaluate(()=>(window as any).calls)).toEqual([]);
    await expect(page.getByText('معنى تجريبي للتحقق من ربط الكلمة')).toHaveCount(0);
    expect(await page.locator('.enlarged-reading-scroll').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
});

test('native touch pinch changes font size without browser zoom or accidental word actions', async ({page})=>{
    await open(page);await enter(page);
    const session=await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:120,y:240,id:1},{x:220,y:240,id:2}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:80,y:240,id:1},{x:260,y:240,id:2}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await expect(page.locator('output')).toHaveText('163%');
    await page.waitForTimeout(750);
    expect(await page.evaluate(()=>(window as any).calls)).toEqual([]);
    expect(await page.evaluate(()=>window.visualViewport!.scale)).toBe(1);
});

for(const number of [1,4,604]) test(`page ${number}: original layout matches pre-change renderer`, async ({page})=>{
    test.skip(!baselineScript,'Pre-change source is an optional local regression reference.');
    await open(page,baselineScript);
    await page.evaluate(n=>(window as any).control.setPage(n),number);
    await expect(page.locator('.mushaf-page-qpc')).toBeVisible();
    await page.waitForTimeout(1000);
    const before=await page.locator('.mushaf-page-qpc').screenshot();
    await open(page);
    await page.evaluate(n=>(window as any).control.setPage(n),number);
    await expect(page.locator('.mushaf-page-qpc')).toBeVisible();
    await page.waitForTimeout(1000);
    expect((await page.locator('.mushaf-page-qpc').screenshot()).equals(before)).toBe(true);
    await enter(page);
    expect(await page.locator('.enlarged-reading-scroll').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
    await page.screenshot({path:`artifacts/reading-view-page-${number}.png`});
});

test('outward pinch in original view opens enlarged reading and suppresses word presses',async({page})=>{
    test.setTimeout(90000);await openApplication(page);
    const s=await page.context().newCDPSession(page);
    const points=(a:number,b:number)=>[{x:a,y:400,id:1},{x:b,y:400,id:2}];
    await s.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(130,230)});
    await s.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(132,228)});
    await s.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await expect(page.locator('[data-enlarged-reading]')).toHaveCount(0);
    await page.waitForTimeout(800);
    await s.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(130,230)});
    await s.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(95,265)});
    await s.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await expect(page.locator('[data-enlarged-reading]')).toBeVisible();
    await expect(page.locator('output[aria-label="حجم الخط"]')).toHaveText('163%');
    await expect(page.locator('.reading-page-qpc [data-word-surah]').first()).toBeVisible();
    await page.waitForTimeout(800);
    await page.locator('.enlarged-reading-exit').click();
    await expect(page.locator('.swiper-slide-active .mushaf-page-qpc')).toBeVisible();
    await s.detach();
});

test('original pager advances by touch and remains usable after a cancelled drag', async ({page})=>{
    test.setTimeout(90000); await openApplication(page);
    const session=await page.context().newCDPSession(page);
    async function drag(to: number, cancel = false) {
        await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:60,y:400,id:1}]});
        await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:(60+to)/2,y:400,id:1}]});
        await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:to,y:400,id:1}]});
        // A short, slow drag released below the page-change threshold rebounds.
        // A rapid reversal is a valid swipe in the opposite direction in Swiper.
        if(cancel)await page.waitForTimeout(400);
        await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        await page.waitForTimeout(600);
    }
    await drag(340);
    await expect.poll(()=>page.evaluate(()=>localStorage.getItem('quran_last_page'))).toBe('5');
    await drag(180,true);
    await expect.poll(()=>page.evaluate(()=>localStorage.getItem('quran_last_page'))).toBe('5');
    await drag(340);
    await expect.poll(()=>page.evaluate(()=>localStorage.getItem('quran_last_page'))).toBe('6');
    await expect(page.locator('.swiper-slide-active [data-word-surah]').first()).toBeVisible();
    await session.detach();
});

test('full application: sidebar switch, header, menus, page navigation and saved text size', async ({page})=>{
    test.setTimeout(120000);
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await openApplication(page);
    await page.locator('main').click({position:{x:200,y:120}});
    const toggle=page.locator('#enlarged-reading-toggle');
    if(await toggle.isDisabled())await page.locator('main').click({position:{x:200,y:120}});
    await toggle.click();
    await expect(page.locator('[data-enlarged-reading]')).toBeVisible();
    const toolbar=page.locator('.enlarged-reading-toolbar');
    await expect(toolbar.locator('button')).toHaveCount(3);
    const bounds=await toolbar.boundingBox();
    const header=await page.locator('#mushaf-controls-header').boundingBox();
    expect(bounds!.y).toBeGreaterThanOrEqual(header!.y+header!.height-1);
    await enlargeByPinch(page);
    await expect(page.locator('output[aria-label="حجم الخط"]')).toHaveText('106%');
    expect(await page.evaluate(()=>localStorage.getItem('quran_reading_font_size'))).toBe('34');
    // Global search opens over the new view, not a separate set of menus.
    if(await toggle.isDisabled())await page.locator('.reading-page-qpc [data-word-surah]').first().click();
    await page.locator('[title="بحث"]').tap({timeout:10000});
    await expect(page.locator('input').first()).toBeVisible();
    await page.keyboard.press('Escape');
    // Close through the real search close control when Escape is not implemented.
    const searchClose=page.locator('button[title="إغلاق"]');
    if(await searchClose.count())await searchClose.first().click();
    if(await page.locator('input').count()) {
        const close=page.locator('button').filter({has:page.locator('svg.lucide-x')});
        await close.first().click();
    }
    if(await toggle.isDisabled())await page.locator('main').click({position:{x:200,y:220}});
    await page.getByRole('button',{name:'عرض المصحف',exact:true}).first().click();
    await expect(page.locator('main .mushaf-page-qpc').first()).toBeVisible();
    // Use a touch tap, matching the phone: mouse hover expands the floating
    // sidebar while click waits for stability, and the idle timer can hide it.
    if(await toggle.isDisabled())await page.locator('main').dispatchEvent('click');
    await toggle.tap();
    await expect(page.locator('output[aria-label="حجم الخط"]')).toHaveText('106%');
    await page.locator('.enlarged-reading-scroll').evaluate(e=>e.scrollTo(0,e.scrollHeight));
    await page.locator('.enlarged-reading-pages').getByRole('button',{name:'الصفحة التالية',exact:true}).click();
    await expect(page.locator('.reading-page-qpc [data-word-ayah="25"]').first()).toBeVisible();
    await page.screenshot({path:'artifacts/reading-view-full-app.png'});
    expect(errors).toEqual([]);
});

test('Android and application bars overlay both views without moving or squeezing any word',async({page})=>{
    test.setTimeout(60000);await openApplication(page);
    await page.evaluate(()=>{
        const root=document.documentElement;root.dataset.androidSystemBars='false';
        root.style.setProperty('--android-status-bar-height','32px');root.style.setProperty('--android-navigation-bar-height','48px');
        // Simulate changing WebView env() padding without requiring Android in CI.
        const viewport=document.querySelector<HTMLElement>('[data-mushaf-viewport]')!;
        viewport.style.paddingTop='32px';viewport.style.paddingBottom='48px';
    });
    const geometry=()=>page.evaluate(()=>{
        const root=document.querySelector('.reading-page-qpc')||document.querySelector('.swiper-slide-active .mushaf-page-qpc')!;
        const rect=(el:Element)=>{const r=el.getBoundingClientRect();return[r.x,r.y,r.width,r.height].map(n=>Math.round(n*1000)/1000)};
        return {page:rect(root),words:[...root.querySelectorAll('[data-word-surah]')].map(el=>[el.textContent,...rect(el),getComputedStyle(el).fontSize])};
    });
    const toggle=page.locator('#enlarged-reading-toggle');
    for(const mode of ['original','reading']){
        if(mode==='reading'){
            if(await toggle.isDisabled())await page.locator('main').tap({position:{x:200,y:400}});
            await toggle.tap();
        }
        if(!await toggle.isDisabled())await page.locator('main').tap({position:{x:200,y:400}});
        await expect(toggle).toBeDisabled();await page.waitForTimeout(650);
        const hidden=await geometry();
        await page.locator('main').tap({position:{x:200,y:400}});
        await page.evaluate(()=>{document.documentElement.dataset.androidSystemBars='true'});
        await expect(toggle).toBeEnabled();await page.waitForTimeout(650);
        expect(await geometry()).toEqual(hidden);
        if(mode==='reading'){
            await expect(page.locator('.enlarged-reading-toolbar')).toHaveCSS('position','absolute');
            await expect(page.locator('.enlarged-reading-toolbar')).toBeVisible();
        }
        await page.locator('main').tap({position:{x:200,y:400}});
        await page.evaluate(()=>{document.documentElement.dataset.androidSystemBars='false'});
        await expect(toggle).toBeDisabled();await page.waitForTimeout(650);
        expect(await geometry()).toEqual(hidden);
        if(mode==='reading')await expect(page.locator('.enlarged-reading-toolbar')).not.toBeVisible();
    }
});

test('audio player clears Android and app bars, with a visible red close button',async({page})=>{
    test.setTimeout(90000);
    const bundle=await build({stdin:{contents:`import React,{useState}from'react';import{createRoot}from'react-dom/client';import Player from './components/FloatingAudioPlayer';function App(){const[playing,set]=useState(false);window.setPlaying=set;return <Player isOpen currentLanguage="ar" selectedReciterId="test" isPlaying={playing} isPaused={false} isUiVisible playbackRate={1} groupRepetitions={1} ayahRepetitions={1} onClose={()=>window.playerCloseCount=(window.playerCloseCount||0)+1} onTogglePlay={()=>{}}/>}createRoot(document.getElementById('root')).render(<App/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,write:false,format:'iife',plugins:[{name:'reciters',setup(b){b.onResolve({filter:/useReciters$/},()=>({path:'reciters',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export const useReciters=()=>({reciters:[{id:"test",name:"Test"}],loading:false});'}))}}]});
    await page.goto('http://127.0.0.1:5180');
    await page.setContent('<div id="root"></div><div id="navigation-bar" style="position:fixed;bottom:48px;height:90px;width:100%"></div>');
    await page.addStyleTag({content:css});
    await page.evaluate(()=>document.documentElement.style.setProperty('--android-navigation-bar-height','48px'));
    await page.addScriptTag({content:bundle.outputFiles[0].text});
    for(const width of [390,768,1024]){
        await page.setViewportSize({width,height:900});
        const player=page.locator('#tour-audio-player');await expect(player).toBeVisible();
        await page.waitForTimeout(800);
        const rect=await player.boundingBox();const nav=await page.locator('#navigation-bar').boundingBox();
        if(width<1024)expect(rect!.y+rect!.height).toBeLessThanOrEqual(nav!.y-15);
        const close=player.getByRole('button',{name:'إغلاق',exact:true});
        await expect(close).toHaveCSS('color','rgb(220, 38, 38)');
        await close.click();
        await page.mouse.move(0,0);
        await page.evaluate(()=>(window as any).setPlaying(true));
        await expect(player.getByRole('button',{name:'إغلاق',exact:true})).toHaveCSS('color','rgb(220, 38, 38)');
    }
    expect(await page.evaluate(()=>(window as any).playerCloseCount)).toBe(3);
});

test('red close controls at the top and page bottom both restore original Mushaf',async({page})=>{
    await open(page);await enter(page);
    await expect(page.locator('.enlarged-reading-exit svg')).toHaveCSS('color','rgb(220, 38, 38)');
    const close=page.getByRole('button',{name:'إغلاق القراءة المكبّرة',exact:true});
    await expect(close.locator('svg')).toHaveCSS('color','rgb(220, 38, 38)');
    await close.click();
    await expect(page.locator('.mushaf-page-qpc')).toBeVisible();
    await expect(page.locator('[data-enlarged-reading]')).toHaveCount(0);
    await enter(page);
    await page.locator('.enlarged-reading-exit').click();
    await expect(page.locator('.mushaf-page-qpc')).toBeVisible();
});

test('compact header keeps size buttons, percentage and exit on one row', async ({page})=>{
    await open(page);await enter(page);
    for(const width of [320,390,711]) {
        await page.setViewportSize({width,height:844});
        const output=await page.locator('output').boundingBox();
        const exit=await page.locator('.enlarged-reading-exit').boundingBox();
        const group=await page.locator('.enlarged-reading-center').boundingBox();
        expect(Math.min(exit!.x,group!.x)).toBeGreaterThanOrEqual(0);
        expect(Math.max(exit!.x+exit!.width,group!.x+group!.width)).toBeLessThanOrEqual(width);
        expect(Math.abs(output!.y+output!.height/2-exit!.y-exit!.height/2)).toBeLessThan(1);
        expect((await page.locator('.enlarged-reading-toolbar').boundingBox())!.height).toBeLessThanOrEqual(54);
        await expect(page.locator('.enlarged-reading-toolbar button')).toHaveCount(3);
    }
    await page.getByRole('button',{name:'تكبير الخط',exact:true}).click();
    await expect(page.locator('output')).toHaveText('106%');
    await page.getByRole('button',{name:'تصغير الخط',exact:true}).click();
    await expect(page.locator('output')).toHaveText('100%');
    for (const direction of ['ltr','rtl']) {
        await page.evaluate(dir => { document.documentElement.dir = dir; }, direction);
        const pager = page.locator('.enlarged-reading-pages');
        const next = await pager.getByRole('button',{name:'الصفحة التالية',exact:true}).boundingBox();
        const previous = await pager.getByRole('button',{name:'الصفحة السابقة',exact:true}).boundingBox();
        expect(next!.x).toBeLessThan(previous!.x);
    }
});

test('horizontal touch swipes page in both directions; vertical scroll and pinch do not page', async ({page})=>{
    await open(page);await enter(page);
    const session=await page.context().newCDPSession(page);
    const swipe=async(from:{x:number;y:number},to:{x:number;y:number})=>{
        await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...from,id:1}]});
        await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...to,id:1}]});
        await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        await page.waitForTimeout(750);
    };
    await swipe({x:100,y:350},{x:280,y:355});
    await expect.poll(()=>page.evaluate(()=>(window as any).readingPage)).toBe(5);
    await swipe({x:280,y:350},{x:100,y:355});
    await expect.poll(()=>page.evaluate(()=>(window as any).readingPage)).toBe(4);
    await swipe({x:180,y:450},{x:185,y:220});
    expect(await page.evaluate(()=>(window as any).readingPage)).toBe(4);
    expect(await page.evaluate(()=>(window as any).calls)).toEqual([]);
    await page.evaluate(()=>(window as any).control.setPage(1));
    await swipe({x:280,y:350},{x:100,y:355});
    expect(await page.evaluate(()=>(window as any).readingPage)).toBe(1);
});

test('cold navigation preserves split surah frames and basmallahs in both views',async({page})=>{
    await open(page);
    await page.evaluate(()=>(window as any).control.setPage(77));
    await expect(page.locator('.mushaf-page-qpc [data-word-surah="4"][data-word-ayah="1"]').first()).toBeVisible();
    await expect(page.locator('.mushaf-page-qpc [data-line-type="surah_name"]')).toHaveCount(0);
    await expect(page.locator('.mushaf-page-qpc .qpc-basmalah')).toHaveCount(1);
    await expect(page.locator('.mushaf-page-qpc .qpc-v2-line')).toHaveCount(15);
    await enter(page);
    await expect(page.locator('.reading-page-qpc [data-line-type="surah_name"]')).toHaveCount(0);
    await expect(page.locator('.reading-page-qpc .qpc-basmalah')).toHaveCount(1);
    await page.screenshot({path:'artifacts/qpc-heading-fixed-77-reading.png'});
    await page.evaluate(()=>(window as any).control.setPage(76));
    await expect(page.locator('.reading-page-qpc [data-line-type="surah_name"]')).toHaveCount(1);
    await expect(page.locator('.reading-page-qpc .qpc-basmalah')).toHaveCount(0);
    await page.evaluate(()=>(window as any).control.setPage(585));
    await expect(page.locator('.reading-page-qpc [data-word-surah="80"]').first()).toBeVisible();
    await expect(page.locator('.reading-page-qpc [data-line-type="surah_name"]')).toHaveCount(0);
    await expect(page.locator('.reading-page-qpc .qpc-basmalah')).toHaveCount(1);
});

for (const viewport of [{width:844,height:390},{width:1440,height:900}]) test(`original page 4 remains identical at ${viewport.width}×${viewport.height}`, async ({browser})=>{
    test.skip(!baselineScript,'Pre-change source is an optional local regression reference.');
    const context=await browser.newContext({viewport,hasTouch:viewport.width<1000});
    const page=await context.newPage();
    await open(page,baselineScript);await page.waitForTimeout(1200);
    const layout=()=>page.locator('.mushaf-page-qpc .qpc-v2-text').evaluateAll(es=>es.map(e=>{
        const r=e.getBoundingClientRect(),s=getComputedStyle(e);
        return [e.textContent,r.x,r.y,r.width,r.height,s.fontFamily,s.fontSize,s.color];
    }));
    const beforeLayout=await layout();
    // An element screenshot of this tall page expands Chromium's viewport,
    // changing orientation and vh-based layout during capture. Keep the real viewport.
    const before=await page.screenshot({path:`artifacts/reading-original-before-${viewport.width}.png`});
    await open(page);await page.waitForTimeout(1200);
    const after=await page.screenshot({path:`artifacts/reading-original-after-${viewport.width}.png`});
    expect(await layout()).toEqual(beforeLayout);
    expect(sameRaster(after,before)).toBe(true);
    await enter(page);
    await page.evaluate(()=>(window as any).control.setSize(52));
    expect(await page.locator('.enlarged-reading-scroll').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
    await context.close();
});

test('Mushaf exit label is localized in every supported language',async({page})=>{
 const messages=JSON.parse(readFileSync('i18n/readingViewMessages.json','utf8'));await open(page);await enter(page);
 for(const[language,labels]of Object.entries(messages) as [string,any][]){await page.evaluate(language=>(window as any).control.setLanguage(language),language);await expect(page.locator('.enlarged-reading-exit')).toHaveText(labels.original);await expect(page.getByRole('button',{name:labels.increase,exact:true})).toBeVisible();}
});

test('original virtual pager preserves page and full width through repeated rotation', async ({page}) => {
    test.setTimeout(90000);
    const bundle=await build({stdin:{contents:`
      import React,{useEffect,useRef}from'react';import{createRoot}from'react-dom/client';
      import{Swiper,SwiperSlide}from'swiper/react';import{Virtual}from'swiper/modules';
      import{resizeMushafPager}from'./utils/resizeMushafPager';
      function App(){const pager=useRef(null),current=useRef(4),resizing=useRef(false);
        useEffect(()=>{const resize=()=>{resizing.current=true;try{resizeMushafPager(pager.current,current.current)}finally{resizing.current=false}};
          addEventListener('resize',resize);return()=>removeEventListener('resize',resize)},[]);
        window.go=p=>{current.current=p;pager.current.slideTo(p-1,0,false)};
        window.current=()=>current.current;
        return <Swiper modules={[Virtual]} dir="rtl" onSwiper={s=>pager.current=s} initialSlide={3}
          virtual={{enabled:true,addSlidesBefore:2,addSlidesAfter:2}} resizeObserver={false} updateOnWindowResize={false}
          onTransitionEnd={s=>{if(!resizing.current)current.current=s.activeIndex+1}}>
          {Array.from({length:604},(_,i)=><SwiperSlide key={i} virtualIndex={i}>{i+1}</SwiperSlide>)}
        </Swiper>
      }createRoot(document.getElementById('root')).render(<App/>);
    `,loader:'tsx',resolveDir:process.cwd()},bundle:true,write:false,format:'iife'});
    await page.goto('about:blank');
    await page.setContent('<html dir="rtl"><style>html,body,#root{margin:0;width:100%;height:100%}.swiper{overflow:hidden;position:relative;width:100%;height:100%}.swiper-wrapper{display:flex;width:100%;height:100%;position:relative}.swiper-slide{flex-shrink:0;position:relative;width:100%;height:100%}</style><div id="root"></div></html>');
    await page.addScriptTag({content:bundle.outputFiles[0].text});
    await expect(page.locator('.swiper-slide-active')).toHaveText('4');
    for(const number of [4,36,70,476]){
      await page.evaluate(n=>(window as any).go(n),number);
      for(const viewport of [{width:833,height:384},{width:384,height:833}]){
        await page.setViewportSize(viewport);
        const samples=await page.evaluate(async()=>{
          const values=[];
          for(let i=0;i<12;i++){
            await new Promise(requestAnimationFrame);
            const slide=document.querySelector('.swiper-slide-active') as HTMLElement;
            const s=(document.querySelector('.swiper') as any).swiper;
            values.push({index:s.activeIndex,page:(window as any).current(),width:slide.getBoundingClientRect().width,x:slide.getBoundingClientRect().x,text:slide.textContent,viewport:innerWidth});
          }return values;
        });
        for(const sample of samples){
          expect(sample.index).toBe(number-1);expect(sample.page).toBe(number);expect(sample.text).toBe(String(number));
          expect(Math.abs(sample.width-sample.viewport)).toBeLessThan(1);expect(Math.abs(sample.x)).toBeLessThan(1);
        }
      }
    }
});


test('original text follows viewport before a delayed orientation commit', async ({page}) => {
    await page.setContent('<div class="quran-swiper-container"><div class="swiper"><div class="swiper-wrapper"><div class="swiper-slide" style="width:384px"><div class="mushaf-page-qpc" data-device-type="mobile" data-orientation="portrait" style="height:100%;min-height:100%;display:flex"><div class="qpc-v2-line" style="flex:1 1 0px;min-height:0"><span class="qpc-v2-text">نص</span></div></div></div></div></div></div>');
    await page.addStyleTag({content:css});
    for(const viewport of [{width:833,height:384},{width:384,height:833}]){
        // Deliberately leave React's attribute and inline styles in the OLD
        // orientation, reproducing the surface/DOM commit ordering on Android.
        await page.locator('.mushaf-page-qpc').evaluate((el,landscape)=>{
            (el as HTMLElement).dataset.orientation=landscape?'portrait':'landscape';
            (el as HTMLElement).style.height=landscape?'100%':'auto';
            const line=el.querySelector('.qpc-v2-line') as HTMLElement;
            line.style.flex=landscape?'1 1 0px':'0 0 auto';
        },viewport.width>viewport.height);
        await page.setViewportSize(viewport);
        const values=await page.evaluate(()=>({
            font:parseFloat(getComputedStyle(document.querySelector('.qpc-v2-text')!).fontSize),
            flex:getComputedStyle(document.querySelector('.qpc-v2-line')!).flex,
            slide:document.querySelector('.swiper-slide')!.getBoundingClientRect().width,
            width:innerWidth,
        }));
        expect(Math.abs(values.slide-values.width)).toBeLessThan(1);
        expect(values.font).toBeCloseTo(viewport.width*(viewport.width>viewport.height?.048:.05),1);
        expect(values.flex).toBe(viewport.width>viewport.height?'0 0 auto':'1 1 0px');
    }
});

for (const reading of [false,true]) test(`word review persists per occurrence and reuses hide/reveal (${reading?'reading':'mushaf'})`,async({page})=>{
 await open(page); if(reading) await enter(page);
 const first=page.locator('[data-word-surah="2"][data-word-ayah="17"]').first();
 await first.dispatchEvent('pointerdown',{clientX:180,clientY:250});
 await expect(page.locator('.word-meaning-tooltip')).toBeVisible();
 await first.dispatchEvent('pointerup');
 await page.getByRole('button',{name:/سجّل صعوبة/}).click();
 // Dialogs own their palette; the editor must inherit the current dialog text
 // color rather than the old test page's #222 body color.
 const editorColor=await page.locator('.word-meaning-tooltip').evaluate(el=>getComputedStyle(el).color);
 await expect(page.locator('.word-meaning-tooltip label').first()).toHaveCSS('color',editorColor);
 const back=page.getByRole('button',{name:/العودة إلى المعنى/});
 await expect(back).toBeVisible(); await expect(back).toHaveCSS('color',editorColor);
 await back.click();await expect(page.getByText('معنى تجريبي للتحقق من ربط الكلمة')).toBeVisible();
 await page.getByRole('button',{name:/سجّل صعوبة/}).click();
 await page.getByLabel('نسيان الكلمة',{exact:true}).check();
 await page.getByLabel('صعوبة النطق',{exact:true}).check();
 await page.getByLabel('ملاحظة الكلمة').fill('ملاحظة تبقى بعد إزالة العلامات');
 await expect(first).toHaveCSS('background-color','rgba(250, 204, 21, 0.16)');
 await page.getByRole('button',{name:'إزالة العلامات',exact:true}).click();
 await expect(page.getByLabel('ملاحظة الكلمة')).toHaveValue('ملاحظة تبقى بعد إزالة العلامات');
 await expect(first).not.toHaveCSS('background-color','rgba(250, 204, 21, 0.16)');
 await page.getByLabel('نسيان الكلمة',{exact:true}).check();
 await page.mouse.click(370,740);
 await page.evaluate(()=>{(window as any).control.setToggleState(2);(window as any).control.setMode('HIDE_RANDOM_WORDS')});
 await expect(first).toHaveCSS('color','rgba(0, 0, 0, 0)');
 await expect(first).toHaveCSS('background-color','rgb(51, 65, 85)');
 await expect(page.locator('[data-reveal-key]')).toHaveCount(1);
 await first.click(); await expect(first).not.toHaveCSS('color','rgba(0, 0, 0, 0)');
 await first.click(); await expect(first).toHaveCSS('color','rgba(0, 0, 0, 0)');
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('mushaf-word-review-v1')!));
 expect(Object.keys(stored)).toEqual(['2:17:1']);expect(stored['2:17:1'].note).toBe('ملاحظة تبقى بعد إزالة العلامات');
 await open(page); if(reading) await enter(page);
 await page.locator('#words-library').click();
 await page.getByRole('button',{name:'تعديل',exact:true}).click();
 await expect(page.getByLabel('نسيان الكلمة',{exact:true})).toBeChecked();
 await expect(page.getByLabel('ملاحظة الكلمة')).toHaveValue('ملاحظة تبقى بعد إزالة العلامات');
 await page.getByRole('button',{name:'إزالة العلامات',exact:true}).click();
 await expect(page.getByLabel('ملاحظة الكلمة')).toHaveValue('ملاحظة تبقى بعد إزالة العلامات');
 await page.getByRole('button',{name:'الانتقال إلى الموضع',exact:true}).click();
 expect(await page.evaluate(()=>(window as any).calls)).toContainEqual(['navigate-word',2,17]);

});

test('difficult-word explanation toggles only on click without selecting the hide mode',async({page})=>{
 const result=await build({stdin:{contents:`
 import React from 'react';import{createRoot}from'react-dom/client';import Header from './components/Header';import{FeedbackProvider}from'./contexts/FeedbackContext';import{translations}from'./i18n/translations';import{ViewMode}from'./types';
 window.calls=[];createRoot(document.getElementById('root')).render(<FeedbackProvider language="ar"><Header currentMode={ViewMode.SHOW_ALL} setMode={(...args)=>window.calls.push(args)} toggleState={0} isVisible={true} onInteraction={()=>{}} t={translations.ar} isRTL/></FeedbackProvider>);
 `,loader:'tsx',resolveDir:process.cwd()},bundle:true,write:false,format:'iife'});
 await page.route('https://header.test/',route=>route.fulfill({contentType:'text/html',body:'<html dir="rtl"><meta charset="utf-8"><div id="root"></div></html>'}));
 await page.goto('https://header.test/');await page.addStyleTag({content:css});await page.addScriptTag({content:result.outputFiles[0].text});
 await page.locator('#tour-btn-HIDE_RANDOM_WORDS').click();
 const info=page.getByRole('button',{name:'توضيح الكلمات الصعبة',exact:true});
 await expect(info).toHaveAttribute('aria-expanded','false');
 await info.hover();await expect(info).toHaveAttribute('aria-expanded','false');
 await info.click();await expect(info).toHaveAttribute('aria-expanded','true');
 expect(await page.evaluate(()=>(window as any).calls)).toEqual([]);
 await info.click();await expect(info).toHaveAttribute('aria-expanded','false');
 await page.getByRole('button',{name:'الكلمات الصعبة',exact:true}).click();
 expect(await page.evaluate(()=>(window as any).calls)).toEqual([['HIDE_RANDOM_WORDS',2]]);
});
