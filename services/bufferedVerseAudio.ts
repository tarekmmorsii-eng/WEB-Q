// Keep one output context alive across verses on Android. Each verse remains a
// separate decoded buffer, but replacing it does not reopen the media output.
let context: AudioContext | undefined;
export function primeVerseOutput(): AudioContext {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume().catch(() => {});
    return context;
}
export class BufferedVerseAudio {
    onended: (() => void) | null = null;
    onplaying: (() => void) | null = null;
    onerror: (() => void) | null = null;
    error: Error | null = null;
    paused = true;
    preload = 'auto';
    src = 'decoded-buffer';
    private source?: AudioBufferSourceNode;
    private offset = 0;
    private startedAt = 0;
    private rate = 1;
    constructor(private output: AudioContext, private buffer: AudioBuffer) {}
    get duration() { return this.buffer.duration; }
    get currentTime() {
        return this.paused ? this.offset : Math.min(this.duration, this.offset + (this.output.currentTime - this.startedAt) * this.rate);
    }
    get playbackRate() { return this.rate; }
    set playbackRate(value: number) {
        this.offset = this.currentTime;
        this.startedAt = this.output.currentTime;
        this.rate = value;
        if (this.source) this.source.playbackRate.value = value;
    }
    load() {}
    removeAttribute(_name: string) { this.pause(); this.src = ''; }
    pause() {
        this.offset = this.currentTime;
        this.paused = true;
        if (this.source) {
            this.source.onended = null;
            this.source.stop();
            this.source.disconnect();
            this.source = undefined;
        }
    }
    async play() {
        if (!this.paused || !this.src) return;
        // Set paused before awaiting resume so stop/pause can cancel this start.
        this.paused = false;
        this.startedAt = this.output.currentTime;
        try {
            if (this.output.state !== 'running') await this.output.resume();
            if (this.paused || !this.src) return;
            const source = this.output.createBufferSource();
            this.source = source;
            source.buffer = this.buffer;
            source.playbackRate.value = this.rate;
            source.connect(this.output.destination);
            this.startedAt = this.output.currentTime;
            source.onended = () => {
                if (this.source !== source) return;
                source.disconnect();
                this.source = undefined;
                this.offset = this.duration;
                this.paused = true;
                this.onended?.();
            };
            source.start(0, this.offset);
            this.onplaying?.();
        } catch (error) {
            this.paused = true;
            throw error;
        }
    }
}
export async function prepareBufferedVerse(blob: Blob): Promise<BufferedVerseAudio> {
    const output = primeVerseOutput();
    const buffer = await output.decodeAudioData(await blob.arrayBuffer());
    return new BufferedVerseAudio(output, buffer);
}

// HTML media supplies pitch-preserving time stretching. Route it through the
// same output as normal-speed buffers to avoid reopening the device per verse.
export function preparePitchPreservedVerse(blob: Blob) {
    const output = primeVerseOutput();
    const objectUrl = URL.createObjectURL(blob);
    const audio = new Audio(objectUrl);
    audio.preservesPitch = true;
    audio.preload = 'auto';
    let source: MediaElementAudioSourceNode | undefined;
    try {
        source = output.createMediaElementSource(audio);
        source.connect(output.destination);
        audio.load();
        return { audio, objectUrl, disconnect: () => source?.disconnect() };
    } catch (error) {
        source?.disconnect();
        audio.removeAttribute('src');
        audio.load();
        URL.revokeObjectURL(objectUrl);
        throw error;
    }
}
