export interface FeedbackScreenshot {
    name: string;
    mimeType: 'image/jpeg';
    base64: string;
    width: number;
    height: number;
}

export const SCREENSHOT_MAX_INPUT_BYTES = 8 * 1024 * 1024;
export const SCREENSHOT_MAX_OUTPUT_BYTES = 1024 * 1024;

export async function prepareFeedbackScreenshot(file: File): Promise<FeedbackScreenshot> {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('type');
    if (file.size > SCREENSHOT_MAX_INPUT_BYTES) throw new Error('size');
    const url = URL.createObjectURL(file);
    try {
        const image = new Image();
        image.src = url;
        await image.decode();
        if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 40000000) throw new Error('size');
        const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('decode');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        for (const quality of [0.88, 0.75, 0.6]) {
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            const base64 = dataUrl.split(',')[1];
            if (base64 && base64.length * 0.75 <= SCREENSHOT_MAX_OUTPUT_BYTES) {
                return { name: 'screenshot.jpg', mimeType: 'image/jpeg', base64, width: canvas.width, height: canvas.height };
            }
        }
        throw new Error('size');
    } finally {
        URL.revokeObjectURL(url);
    }
}
