import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export function readShareFileBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

export async function shareIOSFile(file: Blob, name: string, title?: string, text?: string): Promise<void> {
    const folder = 'mushaf-share-' + crypto.getRandomValues(new Uint32Array(4)).join('-');
    const options = { directory: Directory.Temporary };
    const data = await readShareFileBase64(file);
    try {
        const { uri } = await Filesystem.writeFile({
            ...options,
            path: folder + '/' + name,
            data,
            recursive: true
        });
        await Share.share({ title, text, files: [uri] });
    } finally {
        // Share resolves or rejects when the iOS activity sheet finishes.
        await Filesystem.rmdir({ ...options, path: folder, recursive: true }).catch(() => {});
    }
}
