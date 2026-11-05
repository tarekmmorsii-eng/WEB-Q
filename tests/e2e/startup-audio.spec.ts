import { test, expect } from '@playwright/test';
import { build } from 'esbuild';
let script:string;
test.beforeAll(async()=>{
 const r=await build({stdin:{contents:`
 import React,{useState,useEffect}from'react';import{createRoot}from'react-dom/client';
 import Splash from './components/SplashScreen';import{useWordByWordAudio}from'./hooks/useWordByWordAudio';
 function AudioHarness(){window.actions=useWordByWordAudio();return null}
 function App(){const[n,set]=useState(0);const[done,finish]=useState(false);const[mounted,mount]=useState(true);
 window.unmountAudio=()=>mount(false);useEffect(()=>{const t=setInterval(()=>set(v=>v+1),40);return()=>clearInterval(t)},[]);
 return <>{window.splash&&!done&&<Splash onFinish={()=>{window.finished=performance.now();finish(true)}}/>}{mounted&&<AudioHarness/>}</>}
 createRoot(document.getElementById('root')).render(<App/>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',plugins:[{name:'cache',setup(b){b.onResolve({filter:/audioCacheService$/},()=>({path:'cache',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export const getAudioBlob=()=>window.lookup();export const cacheAudioBlob=async()=>{};'}))}}]});script=r.outputFiles[0].text;
});
async function setup(page:any,splash=false){
 await page.setContent('<div id="root"></div>');
 await page.evaluate(flag=>{
  Object.assign(window,{splash:flag,finished:0,toasts:[],audios:[],lookup:()=>Promise.resolve(null)});
  window.addEventListener('showToast',(e:any)=>(window as any).toasts.push(e.detail));
  (window as any).Audio=class{onerror:any;onended:any;src='';play(){return new Promise((resolve,reject)=>{(this as any).reject=reject})}pause(){}load(){}removeAttribute(){}constructor(){(window as any).audios.push(this)}};
 },splash);await page.addScriptTag({content:script});
 await expect.poll(()=>page.evaluate(()=>!!(window as any).actions)).toBe(true);
}
test('splash finishes despite parent redraws and calls latest callback once',async({page})=>{
 await setup(page,true);await expect.poll(()=>page.evaluate(()=>(window as any).finished),{timeout:3000}).toBeGreaterThan(0);
});
test('cancelled cache lookup cannot create audio or a late error toast',async({page})=>{
 await setup(page);await page.evaluate(()=>{(window as any).lookup=()=>new Promise(r=>(window as any).resolveLookup=r);(window as any).actions.playWordAudio(2,17,1)});
 await page.evaluate(()=>{(window as any).actions.stopAudio();(window as any).resolveLookup(null)});
 await page.waitForTimeout(100);expect(await page.evaluate(()=>(window as any).audios.length)).toBe(0);
 expect(await page.evaluate(()=>(window as any).toasts.length)).toBe(0);
});
for(const cancel of ['stop','unmount'])test(`late playback rejection after ${cancel} stays silent`,async({page})=>{
 await setup(page);await page.evaluate(()=>{(window as any).actions.playWordAudio(2,17,1)});
 await expect.poll(()=>page.evaluate(()=>(window as any).audios.length)).toBe(1);
 await page.evaluate(action=>{if(action==='stop')(window as any).actions.stopAudio();else(window as any).unmountAudio()},cancel);
 await page.waitForTimeout(30);await page.evaluate(()=>(window as any).audios[0].reject(new Error('late network error')));
 await page.waitForTimeout(100);expect(await page.evaluate(()=>(window as any).toasts.length)).toBe(0);
});
test('a real current playback failure reports once, even with both error callbacks',async({page})=>{
 await setup(page);await page.evaluate(()=>{(window as any).actions.playWordAudio(2,17,1)});
 await expect.poll(()=>page.evaluate(()=>(window as any).audios.length)).toBe(1);
 await page.evaluate(()=>{const a=(window as any).audios[0];a.onerror();a.reject(new Error('network error'))});
 await expect.poll(()=>page.evaluate(()=>(window as any).toasts.length)).toBe(1);
});
