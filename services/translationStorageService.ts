/**
 * TranslationStorageService
 * خدمة إدارة تخزين ترجمات اللغات في IndexedDB
 * تدعم الحفظ، الجلب، الحذف، والتحقق من وجود الترجمة
 */

const DB_NAME = 'QuranTranslationsDB';
const DB_VERSION = 2;
const STORE_NAME = 'translations';
const WBW_STORE_NAME = 'wbw_translations';

export interface StoredTranslation {
    languageCode: string;
    languageName: string;
    data: any;
    timestamp: number;
    size?: number;
}

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'languageCode' });
                store.createIndex('languageName', 'languageName', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
            // إنشاء مخزن معاني الكلمات (Word by Word)
            if (!db.objectStoreNames.contains(WBW_STORE_NAME)) {
                const wbwStore = db.createObjectStore(WBW_STORE_NAME, { keyPath: 'languageCode' });
                wbwStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function saveTranslation(translation: StoredTranslation): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const sizeStr = JSON.stringify(translation.data);
        translation.size = new Blob([sizeStr]).size;
        store.put(translation);
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    });
}

export async function getTranslation(languageCode: string): Promise<StoredTranslation | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(languageCode);
        request.onsuccess = () => { db.close(); resolve(request.result || null); };
        request.onerror = () => { db.close(); reject(request.error); };
    });
}

export async function deleteTranslation(languageCode: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(languageCode);
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    });
}

export async function getAllTranslations(): Promise<StoredTranslation[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => { db.close(); resolve(request.result || []); };
        request.onerror = () => { db.close(); reject(request.error); };
    });
}

export async function isTranslationStored(languageCode: string): Promise<boolean> {
    const result = await getTranslation(languageCode);
    return result !== null;
}

export async function downloadAndSaveTranslation(
    languageCode: string,
    languageName: string,
    url: string
): Promise<StoredTranslation> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);
    const data = await response.json();
    const translation: StoredTranslation = { languageCode, languageName, data, timestamp: Date.now() };
    await saveTranslation(translation);
    return translation;
}

export function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ============================================================
// دوال معاني الكلمات (Word by Word) - تخزين منفصل
// ============================================================

export interface StoredWbwData {
    languageCode: string;
    data: any; // { "surah:ayah": { "position": { translation: "..." } } }
    timestamp: number;
}

/**
 * حفظ بيانات معاني الكلمات للغة معينة
 */
export async function saveWbwData(wbwData: StoredWbwData): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(WBW_STORE_NAME, 'readwrite');
        const store = tx.objectStore(WBW_STORE_NAME);
        store.put(wbwData);
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    });
}

/**
 * جلب بيانات معاني الكلمات للغة معينة
 */
export async function getWbwData(languageCode: string): Promise<StoredWbwData | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(WBW_STORE_NAME, 'readonly');
        const store = tx.objectStore(WBW_STORE_NAME);
        const request = store.get(languageCode);
        request.onsuccess = () => { db.close(); resolve(request.result || null); };
        request.onerror = () => { db.close(); reject(request.error); };
    });
}

/**
 * حذف بيانات معاني الكلمات للغة معينة
 */
export async function deleteWbwData(languageCode: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(WBW_STORE_NAME, 'readwrite');
        const store = tx.objectStore(WBW_STORE_NAME);
        store.delete(languageCode);
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    });
}

/**
 * التحقق من وجود بيانات معاني الكلمات للغة معينة
 */
export async function isWbwDataStored(languageCode: string): Promise<boolean> {
    const result = await getWbwData(languageCode);
    return result !== null;
}

/**
 * جلب معنى كلمة واحدة من بيانات WbW المحفوظة
 * يبحث بالسورة والآية وموقع الكلمة
 *
 * ملاحظة: المفتاح في البيانات هو "surah:ayah" (مثلاً "1:1")
 * والموقع (position) هو رقم الكلمة داخل الآية
 */
export function getWbwWordMeaning(
    wbwData: any,
    surah: number,
    ayah: number,
    position: number
): string | null {
    if (!wbwData) {
        console.log(`🔍 [getWbwWordMeaning] No wbwData provided (surah=${surah}, ayah=${ayah}, pos=${position})`);
        return null;
    }
    const ayahKey = `${surah}:${ayah}`;
    const ayahData = wbwData[ayahKey];
    if (!ayahData) {
        // نطبع أول 5 مفاتيح متاحة للتشخيص
        const availableKeys = Object.keys(wbwData).slice(0, 5);
        console.log(`🔍 [getWbwWordMeaning] No data for key "${ayahKey}". Available keys (first 5): [${availableKeys.join(', ')}]`);
        return null;
    }
    const wordData = ayahData[position.toString()];
    if (!wordData) {
        const availablePositions = Object.keys(ayahData);
        console.log(`🔍 [getWbwWordMeaning] No word at position ${position} in ${ayahKey}. Available positions: [${availablePositions.join(', ')}]`);
        return null;
    }
    const result = wordData.translation || wordData.text || null;
    console.log(`✅ [getWbwWordMeaning] Found: lang=?, surah=${surah}, ayah=${ayah}, pos=${position} => "${result?.substring(0, 40)}"`);
    return result;
}
