import { test, expect } from '@playwright/test';
import { build } from 'esbuild';
let script: string;
test.beforeAll(async () => {
    script = (await build({stdin:{contents:`
        import React from 'react'; import {createRoot} from 'react-dom/client';
        import {useAyahAudio} from './hooks/useAyahAudio';
        function H(){window.player=useAyahAudio({onAudioError:e=>window.errors.push(e)});return null}
        createRoot(document.getElementById('root')).render(<H/>);
    `,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',plugins:[{name:'native-fixture',setup(b){
        b.onResolve({filter:/^@capacitor\/core$/},()=>({path:'native',namespace:'fixture'}));
        b.onResolve({filter:/audioCacheService$/},()=>({path:'cache',namespace:'fixture'}));
        b.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:args.path==='native' ? 'export const Capacitor={isNativePlatform:()=>true}' : `
            import {encodeWithSoftEdges} from '${process.cwd().replace(/\\/g,'/')}/services/audioEdgeSmoothing';
            export async function getAudioBlob(url){window.reads.push(url);const b=new AudioBuffer({length:9600,numberOfChannels:1,sampleRate:48000});b.getChannelData(0).fill(.02);return encodeWithSoftEdges(b)}
            export async function cacheAudioBlob(){}
        `,resolveDir:process.cwd()}));
    }}]})).outputFiles[0].text;
});
test('native sequence shares output and supports repeats, pause, rate, stop and restart',async({page})=>{
    await page.setContent('<div id="root"></div>');
    await page.evaluate(()=>{
        const w=window as any;w.errors=[];w.reads=[];w.contexts=0;w.starts=[];
        const Native=w.AudioContext;
        w.AudioContext=class extends Native {constructor(){super();w.contexts++;const create=this.createBufferSource.bind(this);this.createBufferSource=()=>{const s=create(),start=s.start.bind(s);s.start=(...args:any[])=>{w.starts.push({time:this.currentTime,offset:args[1]||0,rate:s.playbackRate.value});start(...args)};return s}}};
        const NativeAudio=w.Audio;
        w.Audio=function(src:string){const a=new NativeAudio(src),play=a.play.bind(a);a.play=()=>{w.starts.push({time:performance.now()/1000,offset:a.currentTime,rate:a.playbackRate,preservesPitch:a.preservesPitch});return play()};return a};
    });
    await page.addScriptTag({content:script});await page.waitForFunction(()=>!!(window as any).player);
    await page.evaluate(()=>{const w=window as any;w.done=false;w.player.playSequence({startGlobalAyah:2,endGlobalAyah:3,reciterId:'qatami',groupRepetitions:1,ayahRepetitions:2,playbackRate:1}).then(()=>w.done=true)});
    await expect.poll(()=>page.evaluate(()=>(window as any).done)).toBe(true);
    const state=await page.evaluate(()=>{const w=window as any;return {contexts:w.contexts,starts:w.starts,errors:w.errors}});
    expect(state.contexts).toBe(1);expect(state.starts).toHaveLength(4);expect(state.errors).toEqual([]);
    // A generous browser bound still catches the observed 730–760 ms gap.
    for(let i=1;i<4;i++)expect(state.starts[i].time-state.starts[i-1].time).toBeLessThan(.55);
    await page.evaluate(()=>{const w=window as any;w.done=false;w.player.playSequence({startGlobalAyah:2,endGlobalAyah:3,reciterId:'husary',groupRepetitions:-1,ayahRepetitions:1,playbackRate:.5}).then(()=>w.done=true)});
    await expect.poll(()=>page.evaluate(()=>(window as any).starts.length)).toBeGreaterThan(4);
    await page.evaluate(()=>(window as any).player.pauseAudio());
    const count=await page.evaluate(()=>(window as any).starts.length);
    await page.waitForTimeout(450);
    expect(await page.evaluate(()=>(window as any).starts.length)).toBe(count);
    await page.evaluate(()=>(window as any).player.resumeAudio());
    await expect.poll(()=>page.evaluate(()=>(window as any).starts.length)).toBeGreaterThan(count);
    await page.evaluate(()=>(window as any).player.stopAudio());
    await expect.poll(()=>page.evaluate(()=>(window as any).done)).toBe(true);
    const stopped=await page.evaluate(()=>(window as any).starts.length);
    await page.waitForTimeout(450);
    expect(await page.evaluate(()=>(window as any).starts.length)).toBe(stopped);
    expect(await page.evaluate(()=>(window as any).contexts)).toBe(1);
    expect(await page.evaluate(()=>(window as any).starts.filter((s:any)=>s.rate===.5).every((s:any)=>s.preservesPitch===true))).toBe(true);
});

test('speed change discards a normal-speed preload before the next verse',async({page})=>{
    await page.setContent('<div id="root"></div>');
    await page.evaluate(()=>{
        const w=window as any;w.errors=[];w.reads=[];w.mediaRates=[];
        const NativeAudio=w.Audio;
        w.Audio=function(src:string){const a=new NativeAudio(src),play=a.play.bind(a);a.play=()=>{w.mediaRates.push(a.playbackRate);return play()};return a};
    });
    await page.addScriptTag({content:script});await page.waitForFunction(()=>!!(window as any).player);
    await page.evaluate(()=>{const w=window as any;w.done=false;w.player.playSequence({startGlobalAyah:2,endGlobalAyah:3,reciterId:'qatami',groupRepetitions:1,ayahRepetitions:1,playbackRate:1}).then(()=>w.done=true)});
    await page.waitForFunction(()=>(window as any).reads.length>=2);
    await page.evaluate(()=>(window as any).player.updateRuntimeSettings({playbackRate:.75}));
    await expect.poll(()=>page.evaluate(()=>(window as any).done)).toBe(true);
    expect(await page.evaluate(()=>(window as any).mediaRates)).toEqual([.75]);
    expect(await page.evaluate(()=>(window as any).errors)).toEqual([]);
});
