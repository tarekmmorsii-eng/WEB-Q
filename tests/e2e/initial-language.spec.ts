import { test, expect } from '@playwright/test';
import { build } from 'esbuild';
let script: string;
const fixture = { surahs: Array.from({length:114},(_,i)=>({number:i+1,ayahs:Array.from({length:i===113?134:54},(_,j)=>({numberInSurah:j+1,text:'TEST FIXTURE'}))})) };
test.beforeAll(async()=>{
 const result=await build({stdin:{contents:`import React from 'react';import{createRoot}from'react-dom/client';import Panel from './components/InitialLanguageDownload';import{prepareLanguage}from'./services/initialLanguageDownload';import{getTranslation,getWbwData}from'./services/translationStorageService';window.api={prepareLanguage,getTranslation,getWbwData};window.updates=[];window.addEventListener('language-data-updated',e=>window.updates.push(e.detail));const root=createRoot(document.getElementById('root'));window.render=(language,ready,confirm=false)=>root.render(<Panel key={language+confirm} language={language} ready={ready} requireConfirmation={confirm} onDismiss={()=>root.render(null)}/>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife'});script=result.outputFiles[0].text;
});
async function open(page:any){await page.route('https://initial.test/**',r=>r.fulfill({contentType:'text/html',body:'<div id="root"></div>'}));await page.goto('https://initial.test');await page.addScriptTag({content:script});}
test('concurrent startup requests share download and both receive progress',async({page})=>{
 let requests=0;await page.route('https://api.alquran.cloud/**',r=>{requests++;return r.fulfill({json:{code:200,data:fixture}})});await open(page);
 const progress=await page.evaluate(async()=>{const a:number[]=[],b:number[]=[];const api=(window as any).api;await Promise.all([api.prepareLanguage('fr',(p:number)=>a.push(p)),api.prepareLanguage('fr',(p:number)=>b.push(p))]);return [a,b]});
 expect(requests).toBe(1);expect(progress[0]).toContain(100);expect(progress[1]).toContain(100);
});

test('test refresh requests German again and preserves saved data if refresh fails',async({page})=>{
 let requests=0,broken=false;
 await page.route('https://api.alquran.cloud/**',r=>{requests++;return r.fulfill({json:{code:200,data:broken?{surahs:[]}:fixture}})});
 await open(page);
 await page.evaluate(()=>(window as any).api.prepareLanguage('de',()=>{}));
 broken=true;
 const failed=await page.evaluate(async()=>{try{await(window as any).api.prepareLanguage('de',()=>{},true);return false;}catch{return true;}});
 expect(failed).toBe(true);expect(requests).toBe(2);
 expect(await page.evaluate(async()=>(await(window as any).api.getTranslation('de')).data.surahs.length)).toBe(114);
});

test('changing language asks first, cancel downloads nothing, approval downloads',async({page})=>{
 let requests=0;await page.route('https://api.alquran.cloud/**',r=>{requests++;return r.fulfill({json:{code:200,data:fixture}})});await open(page);
 await page.evaluate(()=>(window as any).render('en',true,true));
 await expect(page.getByRole('heading')).toHaveText('Would you like to download the verse translation and word meanings for this language?');
 await page.getByRole('button',{name:'Continue to the Mushaf',exact:true}).click();expect(requests).toBe(0);
 await page.evaluate(()=>(window as any).render('fr',true,true));
 await expect(page.getByRole('heading')).toHaveText('Voulez-vous télécharger la traduction des versets dans cette langue ?');
 expect(requests).toBe(0);
 await page.getByRole('button',{name:'Télécharger',exact:true}).click();
 await expect(page.getByRole('heading')).toContainText('terminé');expect(requests).toBe(1);
});

test('already downloaded language does not ask or download again',async({page})=>{
 let requests=0;await page.route('https://api.alquran.cloud/**',r=>{requests++;return r.fulfill({json:{code:200,data:fixture}})});await open(page);
 await page.evaluate(()=>(window as any).api.prepareLanguage('fr',()=>{}));
 await page.evaluate(()=>(window as any).render('fr',true,true));
 await expect(page.getByRole('dialog')).toHaveCount(0);expect(requests).toBe(1);
});
test('background download waits for welcome screens, stores translation and avoids repeat downloads',async({page})=>{
 let requests=0;await page.route('https://api.alquran.cloud/**',r=>{requests++;return r.fulfill({json:{code:200,data:fixture}})});await open(page);
 await page.evaluate(()=>(window as any).render('fr',false));
 await expect.poll(()=>page.evaluate(async()=>!!await(window as any).api.getTranslation('fr'))).toBe(true);
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.evaluate(()=>(window as any).render('fr',true));
 await expect(page.getByRole('dialog')).toContainText('Le sens des mots');
 await expect(page.getByRole('heading')).toContainText('terminé');
 await page.evaluate(()=>(window as any).api.prepareLanguage('fr',()=>{}));expect(requests).toBe(1);
 expect(await page.evaluate(()=>(window as any).updates)).toContain('fr');
});
for (const ready of [true, false]) test(`Turkish completes without mixed-language words when welcome ready=${ready}`,async({page})=>{
 let wordRequests=0;
 await page.route('https://api.alquran.cloud/**',r=>r.fulfill({json:{code:200,data:fixture}}));
 await page.route('https://api.quran.com/**',r=>{wordRequests++;return r.abort();});
 await open(page);
 await page.evaluate(ready=>(window as any).render('tr',ready),ready);
 await expect.poll(()=>page.evaluate(async()=>!!await(window as any).api.getTranslation('tr'))).toBe(true);
 if(!ready) await page.evaluate(()=>(window as any).render('tr',true));
 await expect(page.getByRole('heading')).toContainText('İndirme tamamlandı');
 expect(wordRequests).toBe(0);
 expect(await page.evaluate(()=>(window as any).api.getWbwData('tr'))).toBeNull();
});

test('failed or incomplete response is not saved and retry succeeds',async({page})=>{
 let broken=true;await page.route('https://api.alquran.cloud/**',r=>r.fulfill({json:{code:200,data:broken?{surahs:[]}:fixture}}));await open(page);
 await page.evaluate(()=>(window as any).render('fr',true));await expect(page.getByRole('button',{name:'Réessayer'})).toBeVisible();
 expect(await page.evaluate(()=>(window as any).api.getTranslation('fr'))).toBeNull();broken=false;
 await page.getByRole('button',{name:'Réessayer'}).click();await expect(page.getByRole('heading')).toContainText('terminé');
});
test('complete meanings are stored, wrong-language or missing meanings are not accepted',async({page})=>{
 await page.route('https://api.alquran.cloud/**',r=>r.fulfill({json:{code:200,data:fixture}}));
 let wrong=true;
 await page.route('https://api.quran.com/**',r=>{
  const chapter=Number(new URL(r.request().url()).pathname.split('/').pop());
  return r.fulfill({json:{verses:fixture.surahs[chapter-1].ayahs.map(a=>({verse_key:`${chapter}:${a.numberInSurah}`,words:[{position:1,char_type_name:'word',translation:{text:'TEST WORD',language_name:wrong?'french':'english'}}]})),pagination:{next_page:null}}});
 });await open(page);
 expect(await page.evaluate(()=>(window as any).api.prepareLanguage('en',()=>{}).then(()=>false,()=>true))).toBe(true);
 expect(await page.evaluate(()=>(window as any).api.getWbwData('en'))).toBeNull();wrong=false;
 await page.evaluate(()=>(window as any).api.prepareLanguage('en',()=>{}));
 expect(await page.evaluate(async()=>Object.keys((await(window as any).api.getWbwData('en')).data).length)).toBe(6236);
});
test('Arabic uses bundled data and unsupported language has an exit without waiting',async({page})=>{
 await open(page);await page.evaluate(()=>(window as any).api.prepareLanguage('ar',()=>{}));
 await page.evaluate(()=>(window as any).render('unsupported',true));
 await expect(page.getByRole('heading')).toContainText('not currently available');
 await expect(page.getByRole('progressbar')).toHaveCount(0);
 await page.getByRole('button').click();await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('Filipino full-source format is normalized for the existing verse viewer',async({page})=>{
 await page.route('https://raw.githubusercontent.com/**',r=>r.fulfill({json:{quran:fixture.surahs.flatMap(s=>s.ayahs.map(a=>({chapter:s.number,verse:a.numberInSurah,text:a.text})))}}));
 await open(page);await page.evaluate(()=>(window as any).api.prepareLanguage('tl',()=>{}));
 const data=await page.evaluate(async()=>(await(window as any).api.getTranslation('tl')).data);
 expect(data.surahs[0].ayahs[0]).toEqual({numberInSurah:1,text:'TEST FIXTURE'});
 expect(data.surahs).toHaveLength(114);
});
