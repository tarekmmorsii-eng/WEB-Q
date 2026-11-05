// Same half-cosine envelope as the listening experiment. No samples are removed
// or overlapped; only the first/last 3 ms of each decoded channel are attenuated.
export const AUDIO_EDGE_FADE_SECONDS = 0.003;
export const AUDIO_ONSET_FADE_SECONDS = 0.015;

export function encodeWithSoftEdges(buffer: AudioBuffer): Blob {
    const channels = buffer.numberOfChannels;
    const bytesPerFrame = channels * 2;
    const dataSize = buffer.length * bytesPerFrame;
    const bytes = new ArrayBuffer(44 + dataSize);
    const view = new DataView(bytes);
    const writeString = (offset: number, value: string) => {
        for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * bytesPerFrame, true);
    view.setUint16(32, bytesPerFrame, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    const ramp = Math.min(Math.round(buffer.sampleRate * AUDIO_EDGE_FADE_SECONDS), Math.floor(buffer.length / 2));
    const data = Array.from({ length: channels }, (_, channel) => buffer.getChannelData(channel));
    // Detect low-level signal, not phonemes. Bound the search so a long natural
    // opening pause is preserved rather than searching deep into the verse.
    const scanFrames = Math.min(buffer.length, Math.round(buffer.sampleRate * 0.25));
    let onset = -1;
    for (let i = 0; i < scanFrames; i++) {
        if (data.some(channel => Math.abs(channel[i]) >= 33 / 32767)) {
            onset = i;
            break;
        }
    }
    const onsetRamp = Math.min(Math.round(buffer.sampleRate * AUDIO_ONSET_FADE_SECONDS), buffer.length - Math.max(0, onset));
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
        let gain = 1;
        if (ramp > 1) {
            if (i < ramp) gain *= 0.5 - 0.5 * Math.cos(Math.PI * i / (ramp - 1));
            if (i >= buffer.length - ramp) gain *= 0.5 - 0.5 * Math.cos(Math.PI * (buffer.length - 1 - i) / (ramp - 1));
        }
        if (onset >= 0 && onsetRamp > 1) {
            if (i < onset) gain = 0;
            else if (i < onset + onsetRamp) gain *= 0.5 - 0.5 * Math.cos(Math.PI * (i - onset) / (onsetRamp - 1));
        }
        for (let channel = 0; channel < channels; channel++) {
            const sample = Math.max(-1, Math.min(1, data[channel][i] * gain));
            view.setInt16(offset, Math.round(sample * 32767), true);
            offset += 2;
        }
    }
    return new Blob([bytes], { type: 'audio/wav' });
}

export async function softenAudioEdges(blob: Blob, signal?: AbortSignal): Promise<Blob> {
    if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
    // Offline decoding needs neither a live output device nor an autoplay grant.
    const context = new OfflineAudioContext(1, 1, 48000);
    const buffer = await context.decodeAudioData(await blob.arrayBuffer());
    if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
    return encodeWithSoftEdges(buffer);
}
