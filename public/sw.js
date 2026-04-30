/**
 * Native Service Worker - Quran App
 * Strategy: Manual Control
 * 1. Fonts -> Stale-While-Revalidate (Fast render + Background update)
 * 2. App Core -> Network First (Always fresh + Offline fallback)
 */

const CACHE_VERSION = 'v2026-04-30-V3'; // Force update for new reciters list
const FONTS_CACHE = `quran-fonts-${CACHE_VERSION}`;
const CORE_CACHE = `quran-core-${CACHE_VERSION}`;

// ---------------------------
// 1. Install Event
// ---------------------------
self.addEventListener('install', (event) => {
    // Auto-activate: new version takes effect immediately
    console.log('[SW] Installing new version... Auto-activating.');
    self.skipWaiting();
});

// ---------------------------
// 4. Message Event
// ---------------------------
let currentDownloadPromise = null;

self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        console.log('[SW] Skipping waiting...');
        self.skipWaiting();
        return;
    }

    if (event.data === 'CACHE_ALL_FONTS' || event.data === 'CHECK_OFFLINE_DATA') {
        const isManual = event.data === 'CACHE_ALL_FONTS';
        console.log(`[SW] 📥 Received ${isManual ? 'manual' : 'background'} download check request`);
        // Prevent multiple concurrent downloads
        if (currentDownloadPromise) {
            console.log('[SW] ⏳ Download already in progress, ignoring duplicate request.');
            return;
        }
        currentDownloadPromise = cacheAllDataSafely(isManual).finally(() => {
            currentDownloadPromise = null;
        });
        // Wrap with event.waitUntil to prevent the browser from terminating the SW midway
        event.waitUntil(currentDownloadPromise);
    }
});

// ---------------------------
// 2. Activate Event
// ---------------------------
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then((keys) => {
                return Promise.all(
                    keys.map((key) => {
                        // Protect audio cache from deletion in addition to fonts and core
                        if (key !== FONTS_CACHE && key !== CORE_CACHE && key !== 'quran-audio-v2') {
                            console.log('[SW] Deleting old cache:', key);
                            return caches.delete(key);
                        }
                    })
                );
            })
        ]).then(() => {
            // Background silent download check on activation
            // Delayed by 15 seconds to prevent network clogging on initial load
            if (!currentDownloadPromise) {
                setTimeout(() => {
                    if (!currentDownloadPromise) {
                        currentDownloadPromise = cacheAllDataSafely(false).finally(() => {
                            currentDownloadPromise = null;
                        });
                    }
                }, 15000);
            }
        })
    );
});

// ---------------------------
// Helper: Fetch with Retry
// ---------------------------
async function fetchWithRetry(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) return res;
            throw new Error(`Status ${res.status}`);
        } catch (err) {
            if (i === retries - 1) throw err;
            console.warn(`[SW] Retry ${i + 1} for ${url}`);
            await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential-ish backoff
        }
    }
}

// ---------------------------
// Helper: Cache All Data Safely (Batched + Retries + Verification)
// ---------------------------
async function cacheAllDataSafely(reportProgress = false) {
    console.log(`[SW] 📥 Starting robust download process (Manual: ${reportProgress})...`);

    try {
        const fontCache = await caches.open(FONTS_CACHE);
        const coreCache = await caches.open(CORE_CACHE);
        const totalPages = 604;
        
        // Baseline Fonts
        const baselineFonts = [
            '/fonts/ArbFONTS-DTHULUTH-II.ttf',
            '/fonts/arfonts-almarai-bold/almarai-bold.ttf',
            '/fonts/KFGQPC_UthmaniHafs_08.ttf'
        ];

        if (!reportProgress) {
            const fontKeys = await fontCache.keys();
            if (fontKeys.length >= 607) {
                console.log('[SW] ✅ Data appears to be fully cached. Skipping background download.');
                return;
            }
        } else {
            sendMessageToClients({ type: 'DOWNLOAD_START', total: totalPages });
        }

        // BATCH PROCESSING
        const BATCH_SIZE = 50;
        let successfulTasks = 0;
        const totalItemsToCache = (totalPages * 2) + baselineFonts.length;

        for (let i = 1; i <= totalPages; i += BATCH_SIZE) {
            const end = Math.min(i + BATCH_SIZE - 1, totalPages);
            const batchQueue = [];

            for (let p = i; p <= end; p++) {
                batchQueue.push({ url: `/data/v2/pages/${p}.json`, cache: coreCache });
                batchQueue.push({ url: `/fonts/v2/p${p}.woff2`, cache: fontCache });
            }
            
            // Add baseline fonts to the first batch only
            if (i === 1) {
                baselineFonts.forEach(f => batchQueue.push({ url: f, cache: fontCache }));
            }

            // Run batch with concurrency
            const CONCURRENCY = 3;
            const workers = Array(CONCURRENCY).fill(0).map(async () => {
                while (batchQueue.length > 0) {
                    const task = batchQueue.shift();
                    if (!task) break;

                    try {
                        const cached = await task.cache.match(task.url);
                        if (!cached) {
                            const res = await fetchWithRetry(task.url);
                            // Security Fix: Prevent caching 404 HTML error pages as valid data
                            const contentType = res.headers.get('Content-Type') || '';
                            if (!res.ok || contentType.includes('text/html')) {
                                console.warn(`[SW] Skipping invalid response for ${task.url}: Status ${res.status}, Type: ${contentType}`);
                                continue;
                            }
                            await task.cache.put(task.url, res);
                        }
                        successfulTasks++;
                    } catch (err) {
                        console.error(`[SW] Failed task ${task.url} after retries:`, err);
                    }
                }
            });

            await Promise.all(workers);

            if (reportProgress) {
                const progressPage = Math.floor((i / totalPages) * totalPages);
                sendMessageToClients({
                    type: 'DOWNLOAD_PROGRESS',
                    count: progressPage,
                    total: totalPages
                });
            }
        }

        // FINAL VERIFICATION STEP (The "Self-Healing" part)
        console.log('[SW] 🔍 Starting manifest verification...');
        let missingCount = 0;
        for (let p = 1; p <= totalPages; p++) {
            const jsonExists = await coreCache.match(`/data/v2/pages/${p}.json`);
            const fontExists = await fontCache.match(`/fonts/v2/p${p}.woff2`);
            
            if (!jsonExists || !fontExists) {
                missingCount++;
                if (!jsonExists) {
                    try {
                        const res = await fetchWithRetry(`/data/v2/pages/${p}.json`);
                        await coreCache.put(`/data/v2/pages/${p}.json`, res);
                    } catch (e) {}
                }
                if (!fontExists) {
                    try {
                        const res = await fetchWithRetry(`/fonts/v2/p${p}.woff2`);
                        await fontCache.put(`/fonts/v2/p${p}.woff2`, res);
                    } catch (e) {}
                }
            }
        }
        console.log(`[SW] Verification complete. Repaired ${missingCount} records.`);

        if (reportProgress) {
            sendMessageToClients({ type: 'DOWNLOAD_PROGRESS', count: totalPages, total: totalPages });
            sendMessageToClients({ type: 'DOWNLOAD_COMPLETE' });
        }
        console.log('[SW] 🎉 Full robust download finished successfully!');

    } catch (e) {
        console.error('[SW] Fatal error in caching:', e);
        if (reportProgress) sendMessageToClients({ type: 'DOWNLOAD_ERROR', error: e.message });
    }
}

async function sendMessageToClients(msg) {
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    clients.forEach(client => client.postMessage(msg));
}

// ---------------------------
// 3. Fetch Event
// ---------------------------
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 🚀 BYPASS: Ignore Vite/Dev-server requests to prevent white screen issues in localhost
    if (
        url.hostname === 'localhost' &&
        (url.pathname.startsWith('/@') ||
            url.pathname.includes('node_modules') ||
            url.pathname.includes('vite') ||
            url.pathname.includes('react-refresh'))
    ) {
        return;
    }

    // Ignore non-http (e.g., chrome-extension)
    if (!url.protocol.startsWith('http')) return;

    // A. Fonts Strategy: Cache First (instant after first visit)
    if (url.pathname.match(/\.(woff2|ttf|otf)$/)) {
        event.respondWith(
            caches.open(FONTS_CACHE).then(async (cache) => {
                const cachedResponse = await cache.match(event.request);
                if (cachedResponse) return cachedResponse;
                return fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            })
        );
        return;
    }

    // B. App Core
    if (
        url.pathname.match(/\.(html|js|css|json|png|jpg|svg|ico|mp3|wav)$/) ||
        event.request.mode === 'navigate'
    ) {
        // Page JSONs: Cache First for instant page flipping
        if (url.pathname.includes('/data/v2/pages/')) {
            event.respondWith(
                caches.open(CORE_CACHE).then(async (cache) => {
                    const cachedResponse = await cache.match(event.request);
                    if (cachedResponse) return cachedResponse;
                    return fetch(event.request).then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    });
                })
            );
            return;
        }

        // HTML/JS/CSS: Network First (to always get updates)
        if (event.request.mode === 'navigate' || url.pathname.match(/\.(html|js|css)$/)) {
            event.respondWith(
                fetch(event.request)
                    .then(async (networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            const cache = await caches.open(CORE_CACHE);
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    })
                    .catch(async () => {
                        const cache = await caches.open(CORE_CACHE);
                        const cachedResponse = await cache.match(event.request);
                        if (cachedResponse) return cachedResponse;
                        throw new Error('Offline and no cache available');
                    })
            );
            return;
        }

        // Static assets (images, audio, quran.json): Cache First
        event.respondWith(
            caches.open(CORE_CACHE).then(async (cache) => {
                const cachedResponse = await cache.match(event.request);
                if (cachedResponse) return cachedResponse;
                return fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            })
        );
        return;
    }

    // C. Quran Audio CDNs — Cache First (CORS-enabled)
    // verses.quran.com and mirrors.quranicaudio.com support CORS → responses are readable
    // Audio elements may send Range requests → use URL-only match (ignores headers)
    const isAudioCDN =
        url.hostname === 'everyayah.com' ||
        url.hostname === 'audio.qurancdn.com';         // word-by-word CDN

    if (isAudioCDN) {
        event.respondWith(
            caches.open('quran-audio-v2').then(async (cache) => {
                // URL-only + ignoreSearch — finds response despite Range headers
                const cachedResponse = await cache.match(event.request.url, { ignoreSearch: true });
                if (cachedResponse) return cachedResponse;

                // Not cached — fetch from network and return (plays online)
                return fetch(event.request).catch(() => {
                    return new Response('Audio not available offline', { status: 503 });
                });
            })
        );
        return;
    }

    // Default: Just fetch
    event.respondWith(fetch(event.request));
});

// ---------------------------
// 5. Notification Click Event
// ---------------------------
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Logic to open the app or focus it
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});
