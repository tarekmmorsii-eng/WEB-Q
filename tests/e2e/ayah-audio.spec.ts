import { test, expect, Page } from '@playwright/test';
import { build } from 'esbuild';
let script: string;
test.beforeAll(async () => {
 const result = await build({ stdin: { contents: `
  import React from 'react'; import {createRoot} from 'react-dom/client';
  import {useAyahAudio} from './hooks/useAyahAudio';
  function Harness(){window.player=useAyahAudio({onAudioError: e=>window.errors.push(e)});return null;}
  createRoot(document.getElementById('root')).render(<Harness/>);
 `, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, write: false, format: 'iife', plugins: [{name:'cache',setup(b){
  b.onResolve({filter:/audioEdgeSmoothing$/},()=>({path:'smoothing',namespace:'smoothing'}));
  b.onLoad({filter:/.*/,namespace:'smoothing'},()=>({contents:`
   export async function softenAudioEdges(blob,signal){window.smoothCalls.push(await blob.text());if(window.failSmoothing)throw Error('Decoder unavailable');if(signal.aborted)throw Error('Aborted');return blob;}
  `}));
  b.onResolve({filter:/audioCacheService$/},()=>({path:'cache',namespace:'mock'}));
  b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:`
   export async function getAudioBlob(url){window.reads.push(url);if(window.holdReads || window.holdNextReads && url.endsWith('001003.mp3'))await new Promise(r=>window.readResolvers.push(r));return window.networkOnly||window.missingNext&&url.endsWith('001003.mp3')?null:new Blob([url]);}
   export async function cacheAudioBlob(url){window.cached.push(url);return true;}
  `}));
 }}] }); script=result.outputFiles[0].text;
});
test.beforeEach(async ({page})=>{
 await page.setContent('<div id="root"></div>');
 await page.evaluate(()=>{
  const w=window as any;Object.assign(w,{reads:[],cached:[],plays:[],audios:[],errors:[],readResolvers:[],revoked:[],smoothCalls:[],objectUrls:new Map()});
  w.fetch=async(url:string)=>({ok:true,blob:async()=>new Blob([url])});
  URL.createObjectURL=(blob)=>{const id='blob:'+w.objectUrls.size;w.objectUrls.set(id,blob);return id};
  URL.revokeObjectURL=url=>w.revoked.push(url);
  w.Audio=class {
   src:string;id:number;paused=true;duration=1;currentTime=0;playbackRate=1;error=null;onplaying:any;onended:any;onerror:any;
   constructor(src:string){this.src=src;this.id=w.audios.length;w.audios.push(this)}
   load(){} removeAttribute(){this.src=''} pause(){this.paused=true}
   async play(){this.paused=false;const url=this.src.startsWith('blob:')?await w.objectUrls.get(this.src).text():this.src;w.plays.push({id:this.id,url,rate:this.playbackRate,time:this.currentTime});this.onplaying?.();}
   finish(){this.paused=true;this.onended?.();}
  };
 });
 await page.addScriptTag({content:script});await page.waitForFunction(()=>!!(window as any).player);
});
async function start(page:Page, extra:object={}){
 await page.evaluate(extra=>{const w=window as any;w.done=false;w.player.playSequence({startGlobalAyah:2,endGlobalAyah:3,reciterId:'qatami',groupRepetitions:1,ayahRepetitions:1,playbackRate:1,...extra}).then(()=>w.done=true)},extra);
}
async function finish(page:Page){await page.evaluate(()=>{const w=window as any;w.audios[w.plays.at(-1).id].finish()})}
async function count(page:Page,n:number){await expect.poll(()=>page.evaluate(()=>(window as any).plays.length)).toBe(n)}
for(const reciterId of ['husary','qatami'])test(`${reciterId}: uses prepared audio once, preserves complete files and order`,async({page})=>{
 await start(page,{reciterId,endGlobalAyah:5});
 for(let i=1;i<=4;i++){
  await count(page,i);
  if(i<4)await expect.poll(()=>page.evaluate(()=>(window as any).audios.length)).toBe(i+1);
  await finish(page);
 }
 await expect.poll(()=>page.evaluate(()=>(window as any).done)).toBe(true);
 const state=await page.evaluate(()=>{const w=window as any;return{plays:w.plays,reads:w.reads,created:w.audios.length,revoked:w.revoked.length}});
 expect(state.created).toBe(4);expect(state.reads).toHaveLength(4);expect(state.revoked).toBe(4);
 expect(await page.evaluate(()=>(window as any).smoothCalls.length)).toBe(4);
 expect(state.plays.map((p:any)=>p.url.slice(-10))).toEqual(['001002.mp3','001003.mp3','001004.mp3','001005.mp3']);
 expect(state.plays.every((p:any)=>p.time===0&&p.rate===1)).toBe(true);
});
test('decoder failure retains original playback',async({page})=>{
 await page.evaluate(()=>(window as any).failSmoothing=true);await start(page);
 await count(page,1);await finish(page);await count(page,2);await finish(page);
 await expect.poll(()=>page.evaluate(()=>(window as any).done)).toBe(true);
 expect(await page.evaluate(()=>(window as any).errors)).toEqual([]);
});
test('ayah and group repeats preserve order',async({page})=>{
 await start(page,{ayahRepetitions:2,groupRepetitions:2});
 for(let i=1;i<=8;i++){await count(page,i);await finish(page)}
 await expect.poll(()=>page.evaluate(()=>(window as any).done)).toBe(true);
 expect(await page.evaluate(()=>(window as any).plays.map((p:any)=>p.url.slice(-10)))).toEqual(['001002.mp3','001002.mp3','001003.mp3','001003.mp3','001002.mp3','001002.mp3','001003.mp3','001003.mp3']);
});
test('reader and rate changes do not consume stale preloads',async({page})=>{
 await start(page);await count(page,1);await expect.poll(()=>page.evaluate(()=>(window as any).audios.length)).toBe(2);
 await page.evaluate(()=>(window as any).player.updateRuntimeSettings({reciterId:'husary',playbackRate:1.5}));await finish(page);await count(page,2);
 const play=await page.evaluate(()=>(window as any).plays[1]);expect(play.url).toContain('/Husary_128kbps/001003.mp3');expect(play.rate).toBe(1.5);
 await finish(page);
});
test('cached current ayah preloads missing next ayah from network',async({page})=>{
 await page.evaluate(()=>(window as any).missingNext=true);await start(page);await count(page,1);
 await expect.poll(()=>page.evaluate(()=>(window as any).audios.length)).toBe(2);await finish(page);await count(page,2);
 expect(await page.evaluate(()=>(window as any).plays[1].id)).toBe(1);
 expect(await page.evaluate(()=>(window as any).cached)).toEqual(['https://everyayah.com/data/Nasser_Alqatami_128kbps/001003.mp3']);await finish(page);
});
test('stop cancels pending cache read without delayed playback',async({page})=>{
 await page.evaluate(()=>(window as any).holdReads=true);await start(page);
 await expect.poll(()=>page.evaluate(()=>(window as any).readResolvers.length)).toBe(1);
 await page.evaluate(()=>{const w=window as any;w.player.stopAudio();w.readResolvers.forEach((r:any)=>r())});
 await expect.poll(()=>page.evaluate(()=>(window as any).done)).toBe(true);
 expect(await page.evaluate(()=>(window as any).plays)).toEqual([]);
});
test('pause while loading waits for resume',async({page})=>{
 await page.evaluate(()=>(window as any).holdReads=true);await start(page);
 await expect.poll(()=>page.evaluate(()=>(window as any).readResolvers.length)).toBe(1);
 await page.evaluate(()=>{const w=window as any;w.player.pauseAudio();w.holdReads=false;w.readResolvers.forEach((r:any)=>r())});
 await expect.poll(()=>page.evaluate(()=>(window as any).audios.length)).toBe(1);
 expect(await page.evaluate(()=>(window as any).plays)).toEqual([]);
 await page.evaluate(()=>(window as any).player.resumeAudio());await count(page,1);await finish(page);await count(page,2);await finish(page);
});
test('stop and immediate restart cannot resurrect old sequence',async({page})=>{
 await start(page);await count(page,1);
 await page.evaluate(()=>{const w=window as any;w.player.stopAudio();void w.player.playSequence({startGlobalAyah:4,endGlobalAyah:5,reciterId:'husary',groupRepetitions:1,ayahRepetitions:1,playbackRate:1})});
 await count(page,2);await finish(page);await count(page,3);await finish(page);
 expect(await page.evaluate(()=>(window as any).plays.map((p:any)=>p.url.slice(-10)))).toEqual(['001002.mp3','001004.mp3','001005.mp3']);
});
test('infinite ayah repeat stays on the same recording until stopped',async({page})=>{
 await start(page,{ayahRepetitions:-1});
 for(let i=1;i<=3;i++){await count(page,i);await finish(page)}
 await count(page,4);await page.evaluate(()=>(window as any).player.stopAudio());
 expect(await page.evaluate(()=>(window as any).plays.every((p:any)=>p.url.endsWith('001002.mp3')))).toBe(true);
});
test('pause during playback resumes the same audio element and position',async({page})=>{
 await start(page);await count(page,1);
 await page.evaluate(()=>{const w=window as any;w.audios[w.plays[0].id].currentTime=.5;w.player.pauseAudio()});
 expect(await page.evaluate(()=>{const w=window as any;return w.audios[w.plays[0].id].paused})).toBe(true);
 await page.evaluate(()=>(window as any).player.resumeAudio());await count(page,2);
 const plays=await page.evaluate(()=>(window as any).plays);expect(plays[1].id).toBe(plays[0].id);expect(plays[1].time).toBe(.5);
 await finish(page);await count(page,3);await finish(page);
});
test('stop cancels late next-ayah preload and releases audio resources',async({page})=>{
 await page.evaluate(()=>(window as any).holdNextReads=true);
 await start(page);await count(page,1);
 await expect.poll(()=>page.evaluate(()=>(window as any).readResolvers.length)).toBe(1);
 await page.evaluate(()=>{const w=window as any;w.player.stopAudio();w.readResolvers.forEach((r:any)=>r())});
 await expect.poll(()=>page.evaluate(()=>(window as any).done)).toBe(true);
 expect(await page.evaluate(()=>(window as any).audios.every((a:any)=>a.src===''))).toBe(true);
 expect(await page.evaluate(()=>(window as any).audios.length)).toBe(1);
});
test('playback error ends sequence instead of skipping silently',async({page})=>{
 await start(page);await count(page,1);
 await page.evaluate(()=>{const w=window as any;const a=w.audios[w.plays[0].id];a.error={code:3};a.onerror()});
 await expect.poll(()=>page.evaluate(()=>(window as any).done)).toBe(true);
 expect(await page.evaluate(()=>(window as any).errors.length)).toBe(1);
 expect(await page.evaluate(()=>(window as any).plays.length)).toBe(1);
});
test('stop aborts a smoothing download without late playback',async({page})=>{
 await page.evaluate(()=>{
  const w=window as any;w.networkOnly=true;w.downloadStarted=false;w.downloadAborted=false;
  w.fetch=(_url:string, options:RequestInit)=>new Promise((_resolve,reject)=>{
   w.downloadStarted=true;
   options.signal!.addEventListener('abort',()=>{w.downloadAborted=true;reject(new DOMException('Cancelled','AbortError'))},{once:true});
  });
 });
 await start(page);
 await expect.poll(()=>page.evaluate(()=>(window as any).downloadStarted)).toBe(true);
 await page.evaluate(()=>(window as any).player.stopAudio());
 await expect.poll(()=>page.evaluate(()=>(window as any).downloadAborted)).toBe(true);
 await expect.poll(()=>page.evaluate(()=>(window as any).done)).toBe(true);
 expect(await page.evaluate(()=>(window as any).audios)).toEqual([]);
});
test('download failure falls back to ordinary network playback',async({page})=>{
 await page.evaluate(()=>{const w=window as any;w.networkOnly=true;w.fetch=async()=>{throw Error('CORS unavailable')};});
 await start(page);await count(page,1);await finish(page);await count(page,2);await finish(page);
 await expect.poll(()=>page.evaluate(()=>(window as any).done)).toBe(true);
 expect(await page.evaluate(()=>(window as any).errors)).toEqual([]);
});
