import { test, expect } from '@playwright/test';
import { build } from 'esbuild';
let script: string;
test.beforeAll(async()=>{
    script=(await build({stdin:{contents:`import * as playback from './services/bufferedVerseAudio';import {encodeWithSoftEdges} from './services/audioEdgeSmoothing';window.api={...playback,encodeWithSoftEdges};`,resolveDir:process.cwd()},bundle:true,write:false,format:'iife'})).outputFiles[0].text;
});
for(const rate of [.5,.75,1.25,1.5,1.75])test(`speed ${rate} preserves a 440 Hz tone and changes duration`,async({page})=>{
    await page.addScriptTag({content:script});
    const result=await page.evaluate(async rate=>{
        const api=(window as any).api,ctx=api.primeVerseOutput();
        await ctx.resume();
        const analyser=ctx.createAnalyser();analyser.fftSize=16384;
        const create=ctx.createMediaElementSource.bind(ctx);
        ctx.createMediaElementSource=(a:HTMLAudioElement)=>{const source=create(a);source.connect(analyser);return source};
        const buffer=new AudioBuffer({length:48000,numberOfChannels:1,sampleRate:48000});
        const d=buffer.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=.2*Math.sin(2*Math.PI*440*i/48000);
        const media=api.preparePitchPreservedVerse(api.encodeWithSoftEdges(buffer));
        const audio=media.audio;audio.playbackRate=rate;
        const done=new Promise<void>((resolve,reject)=>{audio.onended=()=>resolve();audio.onerror=()=>reject(Error('playback failed'))});
        const started=performance.now();await audio.play();
        await new Promise(r=>setTimeout(r,400));
        const bins=new Float32Array(analyser.frequencyBinCount);analyser.getFloatFrequencyData(bins);
        let peak=1;for(let i=2;i<bins.length;i++)if(bins[i]>bins[peak])peak=i;
        const frequency=peak*ctx.sampleRate/analyser.fftSize;
        await done;const seconds=(performance.now()-started)/1000;
        audio.pause();audio.removeAttribute('src');audio.load();media.disconnect();URL.revokeObjectURL(media.objectUrl);
        await ctx.close();return {frequency,seconds,preservesPitch:audio.preservesPitch};
    },rate);
    expect(result.preservesPitch).toBe(true);
    expect(Math.abs(result.frequency-440)).toBeLessThan(8);
    expect(Math.abs(result.seconds-1/rate)).toBeLessThan(.35);
});
