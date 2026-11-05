import { test, expect, Page } from '@playwright/test';
import { build } from 'esbuild';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

let baseline: string, current: string, css: string;
const entry = `
import React,{useState}from'react';import{createRoot}from'react-dom/client';
import Renderer from './components/QPCV2PageRenderer';
const ratings=[{surah:2,ayah:17,ayahId:'2-17',rating:'weak'},{ayahId:'2-17',rating:'good'},{ayahId:'2-18',rating:'medium'}];
const surahs=[{surahNumber:2,rating:'good'}],bookmarks=[{id:'4-2-17'}];
const groups=[{id:'inside',sourceAyah:{surahNumber:2,ayahNumber:17},similarAyahs:[{surahNumber:2,ayahNumber:18}]},
{id:'outside',sourceAyah:{surahNumber:3,ayahNumber:1},similarAyahs:[{surahNumber:2,ayahNumber:17},{surahNumber:2,ayahNumber:19}]}];
function App(){const[state,set]=useState({pageNumber:4,mode:'SHOW_ALL',toggleState:0,resetCounter:0,memorizationRatings:ratings,surahRatings:surahs,verseBookmarks:bookmarks,mutashabihatData:groups,showMutashabihatIndicators:true});
window.update=patch=>set(s=>({...s,...patch}));return <Renderer {...state} language="ar" readingFontSize={window.enlarged?32:undefined}/>}
createRoot(document.getElementById('root')).render(<App/>);`;

test.beforeAll(async () => {
    const baselineFile = process.env.INTERACTION_BASELINE || 'artifacts/interaction-baseline-renderer.tsx';
    for (const old of [true, false]) {
        const output = await build({ stdin: { contents: entry, loader: 'tsx', resolveDir: process.cwd() }, bundle: true, write: false,
            format: 'iife', outdir:'out', define: { 'process.env.NODE_ENV': '"production"' },
            plugins: [{ name: 'baseline', setup(builder) {
                if (old) builder.onLoad({ filter: /QPCV2PageRenderer\.tsx$/ }, args => ({ contents: readFileSync(baselineFile,'utf8'), loader:'tsx', resolveDir:path.dirname(args.path) }));
            } }],
        });
        const script=output.outputFiles.find(f=>f.path.endsWith('.js'))!.text;
        if (old) baseline=script; else current=script;
    }
    const dir='artifacts/performance-dist';
    const href=readFileSync(path.join(dir,'index.html'),'utf8').match(/href="([^"]+\.css)"/)![1];
    css=readFileSync(path.join(dir,href),'utf8');
});

async function open(page: Page, script: string, enlarged: boolean) {
    await page.route('https://interaction.test/**', route => {
        const url=new URL(route.request().url());
        if (url.pathname==='/') return route.fulfill({contentType:'text/html',body:'<html dir="rtl"><meta charset="utf-8"><div id="root"></div></html>'});
        const file=path.join(process.cwd(),'public',decodeURIComponent(url.pathname));
        return existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404,body:''});
    });
    await page.goto('https://interaction.test');
    await page.evaluate(enlarged=>{
        (window as any).enlarged=enlarged;
        localStorage.setItem('mushaf-word-review-v1',JSON.stringify({'2:17:1':{key:'2:17:1',surah:2,ayah:17,position:1,page:4,word:'test',forgotten:true,pronunciation:false,note:''}}));
    },enlarged);
    await page.addStyleTag({content:css});await page.addScriptTag({content:script});
    await expect(page.locator('[data-word-surah]').first()).toBeVisible();
    await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(600);
}
async function update(page: Page, patch: object) {
    await page.evaluate(patch=>{
        let seed=8123;Math.random=()=>((seed=(seed*16807)%2147483647)-1)/2147483646;
        (window as any).update(patch);
    },patch);
    await page.waitForTimeout(400);
    await page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));
}
async function snapshot(page: Page) {
    return page.locator('[data-line-type]').evaluateAll(lines=>lines.map(line=>({
        html:line.innerHTML,
        rect:[line.getBoundingClientRect().width,line.getBoundingClientRect().height],
        words:Array.from(line.querySelectorAll<HTMLElement>('[data-word-surah]')).map(word=>({
            text:word.textContent, hidden:word.dataset.revealKey,
            color:getComputedStyle(word).color,background:getComputedStyle(word).backgroundColor,
        })),
    })));
}
for (const enlarged of [false,true]) test(`baseline parity: all hide options, reveal/reset, metadata updates and page return (${enlarged?'enlarged':'original'})`,async({page,context})=>{
    const old=await context.newPage();const errors:string[]=[];
    for(const p of [old,page])p.on('pageerror',e=>errors.push(e.message));
    await open(old,baseline,enlarged);await open(page,current,enlarged);
    const assertSame=async()=>expect(await snapshot(page)).toEqual(await snapshot(old));
    await assertSame();
    // Exact raster comparison at rest catches an unintended visual change.
    expect((await page.locator(enlarged?'.reading-page-qpc':'.mushaf-page-qpc').screenshot()).equals(await old.locator(enlarged?'.reading-page-qpc':'.mushaf-page-qpc').screenshot())).toBe(true);
    const options:[string,number[]][]=[['HIDE_ALL_AYAHS',[0,1]],['HIDE_RANDOM_AYAHS',[0,1,2,3,4]],['HIDE_RANDOM_WORDS',[0,1,2]],['TOGGLE_FIRST_WORD',[0,1]],['TOGGLE_LAST_WORD',[0,1]],['SHOW_ALL',[0]]];
    for(const [mode,states]of options)for(const toggleState of states){
        for(const p of [old,page])await update(p,{mode,toggleState});
        await assertSame();
        for(const p of [old,page]){
            const hidden=p.locator('[data-reveal-key]').first();
            if(await hidden.count())await hidden.evaluate((el:HTMLElement)=>el.click());
            await p.waitForTimeout(400);
        }
        await assertSame();
    }
    for(const patch of [
        {mode:'HIDE_ALL_AYAHS',toggleState:0}, {resetCounter:1},
        {showMutashabihatIndicators:false}, {showMutashabihatIndicators:true},
        {memorizationRatings:[{ayahId:'2-17',rating:'medium'}],surahRatings:[{surahNumber:2,rating:'weak'}],verseBookmarks:[{id:'4-2-18'}],mutashabihatData:[]},
        {pageNumber:5}, {pageNumber:4}, {resetCounter:2}, {mode:'SHOW_ALL'},
    ]){
        for(const p of [old,page])await update(p,patch);
        for(const p of [old,page]){await expect(p.locator('[data-word-surah]').first()).toBeVisible();await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300)}
        await assertSame();
    }
    expect(errors).toEqual([]);await old.close();
});

test('reveal, re-hide, page cache and repeated reset retain their meaning',async({page})=>{
    await open(page,current,false);
    const wordCount=await page.locator('[data-word-surah]').evaluateAll(es=>es.filter(e=>!e.querySelector('.ayah-number-wrapper')).length);
    await update(page,{mode:'HIDE_ALL_AYAHS',toggleState:0});
    await expect(page.locator('[data-reveal-key]')).toHaveCount(wordCount);
    const word=await page.locator('[data-reveal-key]').first().elementHandle();
    await word!.evaluate((el:HTMLElement)=>el.click());await page.waitForTimeout(400);
    const remaining=await page.locator('[data-reveal-key]').count();expect(remaining).toBeLessThan(wordCount);
    await word!.evaluate((el:HTMLElement)=>el.click());await page.waitForTimeout(400);
    await expect(page.locator('[data-reveal-key]')).toHaveCount(wordCount);
    await word!.evaluate((el:HTMLElement)=>el.click());await page.waitForTimeout(400);
    for(const number of [5,4]){
        await update(page,{pageNumber:number});await expect(page.locator('[data-word-surah]').first()).toBeVisible();
    }
    await expect(page.locator('[data-reveal-key]')).toHaveCount(remaining);
    for(const resetCounter of [1,2]){
        await update(page,{resetCounter});await expect(page.locator('[data-reveal-key]')).toHaveCount(wordCount);
    }
    await update(page,{mode:'SHOW_ALL'});
    await expect(page.locator('[data-reveal-key]')).toHaveCount(0);await expect(page.locator('.ayah-shadow-overlay')).toHaveCount(0);
});

for(const number of [1,2,604])test(`edge page ${number}: hiding shadows match baseline through rotation and dark mode`,async({page,context})=>{
    const old=await context.newPage();await open(old,baseline,false);await open(page,current,false);
    for(const p of [old,page]){
        await update(p,{pageNumber:number,mode:'HIDE_ALL_AYAHS',toggleState:0});
        await expect(p.locator('[data-word-surah]').first()).toBeVisible();await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(700);
    }
    const before=await snapshot(old),after=await snapshot(page);
    if(JSON.stringify(before)!==JSON.stringify(after)){
        const geometry=async(p:Page)=>p.locator('.qpc-v2-line').evaluateAll(lines=>lines.map(line=>({
            index:line.getAttribute('data-line-index'),width:(line as HTMLElement).clientWidth,
            words:Array.from(line.querySelectorAll<HTMLElement>(':scope > [data-word-surah]')).map(w=>[w.offsetLeft,w.offsetWidth]),
            shadows:Array.from(line.querySelectorAll<HTMLElement>('.ayah-shadow-overlay')).map(s=>[s.style.left,s.style.width]),
        })));
        const evidence={before:await geometry(old),after:await geometry(page)};
        writeFileSync(`artifacts/interaction-edge-${number}-geometry.json`,JSON.stringify(evidence,null,2));
        console.log('Differing shadow lines',evidence.before.map((line,i)=>({before:line,after:evidence.after[i]})).filter(pair=>JSON.stringify(pair.before)!==JSON.stringify(pair.after)));
    }
    expect(after).toEqual(before);
    for(const p of [old,page]){await p.setViewportSize({width:844,height:390});await p.waitForTimeout(800)}
    expect(await snapshot(page)).toEqual(await snapshot(old));
    for(const p of [old,page])await update(p,{isDarkMode:true});
    expect(await snapshot(page)).toEqual(await snapshot(old));
    await old.close();
});

test('production pager keeps page identity and hiding across forward/back navigation',async({page})=>{
    const url=process.env.INTERACTION_APP_URL || 'http://127.0.0.1:5188';
    await page.addInitScript(()=>{
        if(sessionStorage.getItem('interaction-seeded'))return;
        sessionStorage.setItem('interaction-seeded','true');
        localStorage.setItem('hasSeenTour','true');localStorage.setItem('quran_language_selected','true');localStorage.setItem('quran_last_page','100');
        localStorage.setItem('quran_app_settings',JSON.stringify({language:'ar',prayerMode:false}));
        localStorage.setItem('mushaf_measurement_choice_v1',JSON.stringify({version:1,age:'unknown',allowed:false}));
    });
    await page.route(/^https?:\/\//,r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
    await page.goto(url);await expect(page.locator('.swiper-slide-active [data-word-surah]').first()).toBeVisible();await page.waitForTimeout(6000);
    for(const mode of ['HIDE_ALL_AYAHS','HIDE_RANDOM_AYAHS','HIDE_RANDOM_WORDS','TOGGLE_FIRST_WORD','TOGGLE_LAST_WORD','SHOW_ALL']){
        await page.locator('#tour-btn-'+mode).evaluate((el:HTMLElement)=>el.click());
        if(mode!=='SHOW_ALL')await page.locator('#tour-dropdown-'+mode+' button').first().evaluate((el:HTMLElement)=>el.click());
        await page.waitForTimeout(400);
        const before=await page.locator('.swiper-slide-active [data-word-surah]').evaluateAll(es=>es.map(e=>({text:e.textContent,hidden:e.getAttribute('data-reveal-key')})));
        for(const expected of [101,102,101,100]){
            await page.evaluate(n=>(document.querySelector('.swiper') as any).swiper.slideTo(n-1,260),expected);
            await page.waitForFunction(n=>{
                const s=(document.querySelector('.swiper') as any)?.swiper;
                return s&&!s.animating&&s.activeIndex===n-1&&localStorage.getItem('quran_last_page')===String(n);
            },expected,{timeout:15000});
            await expect(page.locator('.swiper-slide-active [data-word-surah]').first()).toBeVisible();
            if(mode==='HIDE_ALL_AYAHS')await expect(page.locator('.swiper-slide-active .ayah-shadow-overlay').first()).toBeVisible();
        }
        expect(await page.locator('.swiper-slide-active [data-word-surah]').evaluateAll(es=>es.map(e=>({text:e.textContent,hidden:e.getAttribute('data-reveal-key')})))).toEqual(before);
    }
    // Exercise the actual touch path as well as slideTo (including a cancelled drag).
    const session=await page.context().newCDPSession(page);
    // Start inside the page: x=60 can hit the visible floating sidebar.
    for(const [to,expected,cancel]of [[350,101,false],[160,101,true],[350,102,false]] as const){
        expect(await page.evaluate(()=>!!document.elementFromPoint(100,400)?.closest('.swiper'))).toBe(true);
        await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:100,y:400,id:1}]});
        await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:(100+to)/2,y:400,id:1}]});
        await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:to,y:400,id:1}]});
        if(cancel)await page.waitForTimeout(400);
        await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        await page.waitForTimeout(650);
        await expect.poll(()=>page.evaluate(()=>localStorage.getItem('quran_last_page'))).toBe(String(expected));
    }
    await session.detach();
    await page.reload();await expect(page.locator('.swiper-slide-active [data-word-surah]').first()).toBeVisible();
    expect(await page.evaluate(()=>(document.querySelector('.swiper') as any).swiper.activeIndex)).toBe(101);
});
