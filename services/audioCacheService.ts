/**
 * audioCacheService.ts
 * ─────────────────────────────────────────────────────────────────
 * IndexedDB-based Blob Storage for Quran Audio Files.
 * 
 * Why IndexedDB instead of Cache API?
 * - Mobile browsers fail to serve cached audio via Service Worker
 *   because of Range Request handling issues.
 * - IndexedDB stores the actual Blob, which we convert to Object URL
 *   for guaranteed local playback: URL.createObjectURL(blob)
 * - Works offline on ALL platforms (Desktop + Mobile Web)
 * ─────────────────────────────────────────────────────────────────
 */

const DB_NAME = 'quran-audio-blobs';
const DB_VERSION = 1;
const STORE_NAME = 'audio-files';

// ─── Open Database ────────────────────────────────────────────────
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// ─── Cache Audio Blob ─────────────────────────────────────────────
/**
 * Fetch an audio URL as a Blob and store it in IndexedDB.
 * Returns true on success, false on failure.
 */
export async function cacheAudioBlob(url: string): Promise<boolean> {
    if (!url) return false;
    
    try {
        // Check if already cached
        const existing = await getAudioBlob(url);
        if (existing) return true;
        
        const response = await fetch(url, { mode: 'cors' });
        
        // Security: reject HTML error pages
        const contentType = response.headers.get('Content-Type') || '';
        if (!response.ok || contentType.includes('text/html')) {
            console.warn(`[audioCache] Invalid response for ${url}: ${response.status} (${contentType})`);
            return false;
        }
        
        const blob = await response.blob();
        
        // Validate blob is actual audio (not empty or tiny error)
        if (blob.size < 1024) {
            console.warn(`[audioCache] Blob too small (${blob.size} bytes), likely invalid: ${url}`);
            return false;
        }
        
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const putRequest = store.put(blob, url);
            
            putRequest.onsuccess = () => {
                resolve(true);
            };
            putRequest.onerror = () => {
                console.warn(`[audioCache] Failed to store blob for ${url}:`, putRequest.error);
                resolve(false);
            };
            tx.oncomplete = () => db.close();
        });
    } catch (err) {
        console.warn(`[audioCache] Error caching ${url}:`, err);
        return false;
    }
}

// ─── Get Audio Blob ───────────────────────────────────────────────
/**
 * Retrieve a cached Blob from IndexedDB by its original URL.
 * Returns null if not found.
 */
export async function getAudioBlob(url: string): Promise<Blob | null> {
    if (!url) return null;
    
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const getRequest = store.get(url);
            
            getRequest.onsuccess = () => {
                const result = getRequest.result;
                if (result instanceof Blob) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            };
            getRequest.onerror = () => {
                resolve(null);
            };
            tx.oncomplete = () => db.close();
        });
    } catch {
        return null;
    }
}

// ─── Create Object URL from Cached Blob ───────────────────────────
/**
 * Get a cached audio file as an Object URL for playback.
 * Returns null if the file is not cached.
 * IMPORTANT: Caller MUST call URL.revokeObjectURL(url) when done!
 */
export async function getAudioObjectURL(url: string): Promise<string | null> {
    const blob = await getAudioBlob(url);
    if (!blob) return null;
    return URL.createObjectURL(blob);
}

// ─── Check if Audio is Cached ─────────────────────────────────────
export async function isAudioCached(url: string): Promise<boolean> {
    const blob = await getAudioBlob(url);
    return blob !== null;
}

// ─── Get All Cached Keys ──────────────────────────────────────────
export async function getAllCachedKeys(): Promise<string[]> {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const getAllKeys = store.getAllKeys();
            
            getAllKeys.onsuccess = () => {
                resolve(getAllKeys.result as string[]);
            };
            getAllKeys.onerror = () => {
                resolve([]);
            };
            tx.oncomplete = () => db.close();
        });
    } catch {
        return [];
    }
}

// ─── Get Cache Size in Bytes ──────────────────────────────────────
export async function getAudioCacheSize(): Promise<number> {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const getAll = store.getAll();
            
            getAll.onsuccess = () => {
                let totalSize = 0;
                for (const item of getAll.result) {
                    if (item instanceof Blob) {
                        totalSize += item.size;
                    }
                }
                resolve(totalSize);
            };
            getAll.onerror = () => {
                resolve(0);
            };
            tx.oncomplete = () => db.close();
        });
    } catch {
        return 0;
    }
}

// ─── Delete Specific Audio ────────────────────────────────────────
export async function deleteAudioBlob(url: string): Promise<boolean> {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const deleteRequest = store.delete(url);
            
            deleteRequest.onsuccess = () => resolve(true);
            deleteRequest.onerror = () => resolve(false);
            tx.oncomplete = () => db.close();
        });
    } catch {
        return false;
    }
}

// ─── Clear All Audio Cache ────────────────────────────────────────
export async function clearAllAudioCache(): Promise<boolean> {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const clearRequest = store.clear();
            
            clearRequest.onsuccess = () => resolve(true);
            clearRequest.onerror = () => resolve(false);
            tx.oncomplete = () => db.close();
        });
    } catch {
        return false;
    }
}

// ─── Cache Multiple Audio Files ───────────────────────────────────
/**
 * Batch cache multiple audio URLs as Blobs.
 * Returns the count of successfully cached files.
 */
export async function cacheMultipleAudioBlobs(urls: string[]): Promise<number> {
    let successCount = 0;
    const CONCURRENCY = 3;
    
    for (let i = 0; i < urls.length; i += CONCURRENCY) {
        const batch = urls.slice(i, i + CONCURRENCY);
        const results = await Promise.allSettled(
            batch.map(url => cacheAudioBlob(url))
        );
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
                successCount++;
            }
        }
    }
    
    return successCount;
}