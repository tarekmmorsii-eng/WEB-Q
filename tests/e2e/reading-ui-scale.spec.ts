import { test, expect, Page } from '@playwright/test';
import { build } from 'esbuild';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

let script: string, css: string;
test.beforeAll(async()=>{
    const result=await build({stdin:{contents:`
        import React,{useState}from'react';import{createRoot}from'react-dom/client';
        import{ReadingUiScaleProvider,ReadingDialogScale}from'./components/ReadingUiScale';
        import{FeedbackProvider}from'./contexts/FeedbackContext';
        import Tooltip from './components/WordMeaningTooltip';
        import Ayah from './components/AyahOptionsModal';
        import Similar from './components/MutashabihatModal';
        import Selector from './components/MutashabihatSelectorModal';
        import Index from './components/MutashabihatIndex';
        import{translations}from'./i18n/translations';
        const data={id:'scale-test',sourceAyah:{surahNumber:2,ayahNumber:17,text:''},similarAyahs:[{surahNumber:2,ayahNumber:18,text:''}]};
        function App(){const[size,setSize]=useState(32),[active,setActive]=useState(true),[view,setView]=useState('ayah'),[similarData,setSimilarData]=useState(data);
        window.ui={setSize,setActive,setView,setSimilarData};
        return <ReadingUiScaleProvider active={active} fontSize={size}><FeedbackProvider language="ar">
        {view==='meaning'?<Tooltip word="كلمة تجريبية" meaning={'معنى تجريبي طويل لاختبار وضوح القراءة داخل الكرت. '.repeat(12)} position={{x:180,y:600}} onClose={()=>setView('none')}/>:null}
        {view==='ayah'?<ReadingDialogScale><Ayah isOpen surahNumber={2} ayahNumber={17} language="ar" currentRating={null} onClose={()=>setView('none')} onRate={()=>{}} onBookmark={()=>{}} isBookmarked={false} tafsir={'تفسير تجريبي للتحقق من تكبير النص والأزرار. '.repeat(30)} hasMutashabihat onOpenMutashabihat={()=>setView('similar')}/></ReadingDialogScale>:null}
        {view==='similar'?<ReadingDialogScale><Similar isOpen mutashabiha={similarData} mutashabihatData={[similarData]} language="ar" onClose={()=>setView('none')} onAddSimilarAyah={()=>setView('selector')} onOpenInIndex={()=>setView('index')}/></ReadingDialogScale>:null}
        {view==='selector'?<ReadingDialogScale><Selector isOpen language="ar" onClose={()=>setView('none')} onSelect={()=>{}}/></ReadingDialogScale>:null}
        {view==='index'?<ReadingDialogScale fullScreen><Index isOpen language="ar" initialSurahId={2} t={translations.ar} mutashabihatData={[data]} isDarkMode={false} onClose={()=>setView('none')}/></ReadingDialogScale>:null}
        </FeedbackProvider></ReadingUiScaleProvider>}
        createRoot(document.getElementById('root')).render(<App/>);
    `,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,outdir:'out',format:'iife',define:{'import.meta.env.DEV':'false','import.meta.env.MODE':'"production"'}});
    script=result.outputFiles.find(f=>f.path.endsWith('.js'))!.text;
    const index=readFileSync('dist/index.html','utf8');
    css=readFileSync(path.join('dist',index.match(/href="([^"]+\.css)"/)![1]),'utf8');
});

async function open(page:Page){
    await page.route('https://reading-ui.test/**',async route=>{
        const url=new URL(route.request().url());
        if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:'<html dir="rtl"><meta charset="utf-8"><style>body{margin:0;--bg-primary:#fcfaf6;--bg-card:#fff;--text-primary:#222;--border-primary:#ddd;--bg-secondary:#f5f0e8}</style><div id="root"></div></html>'});
        const file=path.join(process.cwd(),'public',decodeURIComponent(url.pathname));
        return existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404,body:''});
    });
    await page.goto('https://reading-ui.test');await page.addStyleTag({content:css});await page.addScriptTag({content:script});
}

test('meaning card grows, wraps and remains within the viewport',async({page})=>{
    await page.setViewportSize({width:390,height:744});await open(page);
    await page.evaluate(()=>{(window as any).ui.setView('meaning');});
    await expect(page.locator('.word-meaning-tooltip')).toBeVisible();
    const before=await page.locator('.word-meaning-tooltip p').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
    await page.evaluate(()=>(window as any).ui.setSize(52));
    await expect(page.locator('[data-reading-meaning-scale]')).toHaveCount(1);
    const after=await page.locator('.word-meaning-tooltip p').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
    expect(after).toBeGreaterThan(before*1.5);
    const bounds=await page.locator('.word-meaning-tooltip').boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(390);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(744);
    await page.locator('.word-meaning-tooltip').click();
    await expect(page.locator('.word-meaning-tooltip')).toBeVisible();
    await page.waitForTimeout(200);
    await page.mouse.click(5,5);await expect(page.locator('.word-meaning-tooltip')).toHaveCount(0);
});

for(const width of [320,711])test(`verse options, tafsir and related screens scale at width ${width}`,async({page})=>{
    await page.setViewportSize({width,height:844});await open(page);
    const action=page.getByRole('button',{name:/تلاوة الآية/});
    await expect(action).toBeVisible();
    const original=await action.boundingBox();
    await page.evaluate(()=>(window as any).ui.setSize(52));
    await expect(page.locator('.reading-dialog-scale')).toHaveCSS('zoom','1.625');
    const enlarged=await action.boundingBox();
    expect(enlarged!.height).toBeGreaterThan(original!.height*1.5);
    const panel=page.locator('.reading-dialog-scale > .fixed > div').first();
    let bounds=await panel.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(width);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(844);
    await page.getByRole('button',{name:/تفسير الآية/}).click();
    await expect(page.getByText(/تفسير تجريبي للتحقق/)).toBeVisible();
    await page.screenshot({path:`artifacts/reading-scaled-tafsir-${width}.png`});
    for(const view of ['similar','selector','index']){
        await page.evaluate(view=>(window as any).ui.setView(view),view);
        await expect(page.locator('.reading-dialog-scale')).toHaveCSS('zoom','1.625');
        await page.waitForTimeout(350);
        expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
        const overlay=await page.locator('.reading-dialog-scale > .fixed').boundingBox();
        expect(Math.abs(overlay!.width-width)).toBeLessThan(1);
        if(view!=='index'){
            bounds=await page.locator('.reading-dialog-scale > .fixed > div').first().boundingBox();
            expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(844);
        }
        const clipped=await page.locator('.reading-dialog-scale').evaluate(root=>{
            const overlay=root.querySelector('.fixed')!,bounds=overlay.getBoundingClientRect();
            return [...root.querySelectorAll('button')].filter(button=>{
                const r=button.getBoundingClientRect();
                return r.width>0&&(r.left<bounds.left-1||r.right>bounds.right+1);
            }).map(b=>b.textContent);
        });
        expect(clipped).toEqual([]);
        await page.screenshot({path:`artifacts/reading-scaled-${view}-${width}.png`});
    }
    await page.evaluate(()=>{(window as any).ui.setView('ayah');(window as any).ui.setActive(false);});
    await expect(page.locator('.reading-dialog-scale')).toHaveCount(0);
    await expect(page.getByRole('button',{name:/تلاوة الآية/})).toHaveCount(1);
    expect((await page.getByRole('button',{name:/تلاوة الآية/}).boundingBox())!.height).toBeCloseTo(original!.height,0);
});


test('verse similarities scroll to the end and have no report entry, normal and enlarged',async({page})=>{
    await page.setViewportSize({width:390,height:700});await open(page);
    for(const active of [false,true]){
        await page.evaluate(active=>{
            const ui=(window as any).ui;ui.setActive(active);ui.setSize(52);
            ui.setSimilarData({id:'scroll-regression',sourceAyah:{surahNumber:2,ayahNumber:17,text:''},similarAyahs:Array.from({length:18},(_,i)=>({surahNumber:2,ayahNumber:18+i,text:''}))});
            ui.setView('similar');
        },active);
        const panel=page.locator('[data-mutashabihat-panel]');await expect(panel).toBeVisible();
        await expect(panel).toHaveCSS('overflow-y','auto');
        await expect(panel.locator('.lucide-bug')).toHaveCount(0);
        await expect.poll(()=>panel.evaluate(el=>el.scrollHeight-el.clientHeight)).toBeGreaterThan(100);
        const bounds=await panel.boundingBox();await page.mouse.move(bounds!.x+bounds!.width/2,bounds!.y+bounds!.height/2);
        await page.mouse.wheel(0,100000);
        await expect.poll(()=>panel.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
        await expect.poll(()=>panel.evaluate(el=>el.scrollHeight-el.clientHeight-el.scrollTop)).toBeLessThan(3);
        await page.screenshot({path:`artifacts/similarities-scroll-${active?'enlarged':'normal'}.png`});
        await page.evaluate(()=>(window as any).ui.setView('ayah'));
    }
});
