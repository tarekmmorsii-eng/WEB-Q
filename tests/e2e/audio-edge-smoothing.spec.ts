import { test, expect } from '@playwright/test';
import { build } from 'esbuild';

let script: string;
test.beforeAll(async () => {
    const result = await build({
        stdin: { contents: `import * as smoothing from './services/audioEdgeSmoothing'; window.smoothing = smoothing;`, resolveDir: process.cwd() },
        bundle: true, write: false, format: 'iife',
    });
    script = result.outputFiles[0].text;
});
for (const sampleRate of [44100, 48000]) {
    test(`15 ms onset / 3 ms edges preserve frames, stereo and interior at ${sampleRate} Hz`, async ({ page }) => {
        await page.addScriptTag({ content: script });
        const result = await page.evaluate(async sampleRate => {
            const length = sampleRate;
            const buffer = new AudioBuffer({ length, numberOfChannels: 2, sampleRate });
            buffer.getChannelData(0).fill(0.5);
            buffer.getChannelData(1).fill(-0.5);
            const blob = (window as any).smoothing.encodeWithSoftEdges(buffer);
            const view = new DataView(await blob.arrayBuffer());
            const ramp = Math.round(sampleRate * 0.003);
            const onsetRamp = Math.round(sampleRate * 0.015);
            let interiorUnchanged = true, stereoPreserved = true, maximumError = 0;
            for (let i = 0; i < length; i++) {
                const left = view.getInt16(44 + i * 4, true);
                const right = view.getInt16(46 + i * 4, true);
                let gain = 1;
                if (i < ramp) gain = (1 - Math.cos(Math.PI * i / (ramp - 1))) / 2;
                if (i >= length - ramp) gain = (1 - Math.cos(Math.PI * (length - 1 - i) / (ramp - 1))) / 2;
                if (i < onsetRamp) gain *= (1 - Math.cos(Math.PI * i / (onsetRamp - 1))) / 2;
                maximumError = Math.max(maximumError, Math.abs(left - Math.round(0.5 * gain * 32767)));
                if (Math.abs(left + right) > 1) stereoPreserved = false;
                if (i >= onsetRamp && i < length - ramp && left !== Math.round(0.5 * 32767)) interiorUnchanged = false;
            }
            return { byteLength: blob.size, length, sampleRate: view.getUint32(24, true), channels: view.getUint16(22, true),
                first: view.getInt16(44, true), last: view.getInt16(44 + (length - 1) * 4, true),
                interiorUnchanged, stereoPreserved, maximumError, sourceUnchanged: buffer.getChannelData(0).every(value => value === 0.5) };
        }, sampleRate);
        expect(result).toMatchObject({ sampleRate, channels: 2, first: 0, last: 0, interiorUnchanged: true, stereoPreserved: true, maximumError: 0, sourceUnchanged: true });
        expect(result.byteLength).toBe(44 + result.length * 4);
    });
}
test('real decoder produces playable full-length WAV and supports cancellation', async ({ page }) => {
    await page.addScriptTag({ content: script });
    const result = await page.evaluate(async () => {
        const api = (window as any).smoothing;
        const buffer = new AudioBuffer({ length: 4800, numberOfChannels: 1, sampleRate: 48000 });
        buffer.getChannelData(0).fill(0.25);
        const input = api.encodeWithSoftEdges(buffer);
        const output = await api.softenAudioEdges(input);
        const context = new OfflineAudioContext(1, 1, 48000);
        const decoded = await context.decodeAudioData(await output.arrayBuffer());
        const controller = new AbortController();
        const pending = api.softenAudioEdges(input, controller.signal);
        controller.abort();
        let cancelled = false;
        try { await pending; } catch (error) { cancelled = (error as DOMException).name === 'AbortError'; }
        return { length: decoded.length, duration: decoded.duration, cancelled, type: output.type, interior: decoded.getChannelData(0)[2400] };
    });
    expect(result).toMatchObject({ length: 4800, duration: 0.1, cancelled: true, type: 'audio/wav' });
    expect(result.interior).toBeCloseTo(0.25, 4);
});

test('onset fade follows leading silence and uses the same envelope for both channels', async ({ page }) => {
    await page.addScriptTag({ content: script });
    const result = await page.evaluate(async () => {
        const sampleRate = 48000, length = 48000, onset = 2400, ramp = 720;
        const buffer = new AudioBuffer({ length, numberOfChannels: 2, sampleRate });
        // Only right channel has signal first: detection must inspect all channels.
        buffer.getChannelData(1).fill(.5, onset);
        buffer.getChannelData(0).fill(-.5, onset + 240);
        const blob = (window as any).smoothing.encodeWithSoftEdges(buffer);
        const v = new DataView(await blob.arrayBuffer());
        const sample = (frame: number, channel: number) => v.getInt16(44 + (frame * 2 + channel) * 2, true);
        return { frames: (blob.size - 44) / 4, silence: sample(onset - 1, 1),
            first: sample(onset, 1), middle: sample(onset + 360, 1),
            leftMiddle: sample(onset + 360, 0), after: sample(onset + ramp, 1),
            original: buffer.getChannelData(1)[onset] };
    });
    expect(result.frames).toBe(48000);
    expect(result.silence).toBe(0); expect(result.first).toBe(0);
    expect(result.middle).toBeGreaterThan(8000); expect(result.middle).toBeLessThan(8400);
    expect(Math.abs(result.middle + result.leftMiddle)).toBeLessThanOrEqual(1);
    expect(result.after).toBe(16384); expect(result.original).toBe(.5);
});

test('long opening silence is not trimmed or searched past the onset window', async ({ page }) => {
    await page.addScriptTag({ content: script });
    const result = await page.evaluate(async () => {
        const b = new AudioBuffer({ length: 48000, numberOfChannels: 1, sampleRate: 48000 });
        b.getChannelData(0).fill(.5, 24000);
        const blob = (window as any).smoothing.encodeWithSoftEdges(b);
        const v = new DataView(await blob.arrayBuffer());
        return { frames: (blob.size - 44) / 2, before: v.getInt16(44 + 23999 * 2, true), onset: v.getInt16(44 + 24000 * 2, true) };
    });
    expect(result).toEqual({ frames: 48000, before: 0, onset: 16384 });
});
