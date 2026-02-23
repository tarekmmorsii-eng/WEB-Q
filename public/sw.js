/**
 * Native Service Worker - Quran App
 * Strategy: Manual Control
 * 1. Fonts -> Stale-While-Revalidate (Fast render + Background update)
 * 2. App Core -> Network First (Always fresh + Offline fallback)
 */

const CACHE_VERSION = 'v2026-02-23-V1'; // Latest optimized version (V2 fonts only)
const FONTS_CACHE = `quran-fonts-${CACHE_VERSION}`;
const CORE_CACHE = `quran-core-${CACHE_VERSION}`;

// ---------------------------
// 1. Install Event
// ---------------------------
self.addEventListener('install', (event) => {
    // ⚠️ Don't skipWaiting automatically anymore!
    // We want manual update control.
    console.log('[SW] Installing new version...');
});

// ---------------------------
// 4. Message Event
// ---------------------------
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        console.log('[SW] Skipping waiting...');
        self.skipWaiting();
    }

    // Silent background check (existing logic)
    cacheAllDataSafely(false);

    // Explicit user request with Progress Reporting
    console.log('[SW] 📥 Starting MANUAL full data download...');
    cacheAllDataSafely(true);
});

// ---------------------------
// 2. Activate Event
// ---------------------------
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        Promise.all([
            // Take control of all clients immediately
            self.clients.claim(),

            // Clean up old caches
            caches.keys().then((keys) => {
                return Promise.all(
                    keys.map((key) => {
                        // Delete any cache that doesn't match current version
                        if (key !== FONTS_CACHE && key !== CORE_CACHE) {
                            console.log('[SW] Deleting old cache:', key);
                            return caches.delete(key);
                        }
                    })
                );
            })
        ]).then(() => {
            // 🚀 Start Logic: Download ALL data (fonts + pages) in background
            // This ensures full offline availability eventually
            cacheAllDataSafely(false);
        })
    );
});

// ---------------------------
// Helper: Cache All Data Safely (Sequential with Batches)
// ---------------------------
async function cacheAllDataSafely(reportProgress = false) {
    console.log(`[SW] 📥 Starting full data download (Progress: ${reportProgress})...`);
    try {
        const fontCache = await caches.open(FONTS_CACHE);
        const coreCache = await caches.open(CORE_CACHE);
        const totalPages = 604;

        // Items to download: 604 pages (Fonts V1 & V2) + 604 Page JSONs

        if (!reportProgress) {
            const fontKeys = await fontCache.keys();
            if (fontKeys.length > 610) {
                console.log('[SW] ✅ V2 Fonts appear to be cached. Skipping background download.');
                return;
            }
        } else {
            sendMessageToClients({ type: 'DOWNLOAD_START', total: totalPages });
        }

        const batchSize = 5;

        for (let i = 1; i <= totalPages; i += batchSize) {
            const end = Math.min(i + batchSize - 1, totalPages);
            const batchPromises = [];

            for (let p = i; p <= end; p++) {
                // 1. Fonts (V2 Only - Reduced size for faster offline availability)
                const fonts = [`/fonts/v2/p${p}.woff2`];
                fonts.forEach(url => {
                    batchPromises.push(
                        fontCache.match(url).then(match => {
                            if (!match) {
                                return fetch(url)
                                    .then(res => {
                                        if (res.status === 200) return fontCache.put(url, res);
                                    })
                                    .catch(() => { });
                            }
                        })
                    );
                });

                // 2. Page JSON Data
                const jsonUrl = `/data/v2/pages/${p}.json`;
                batchPromises.push(
                    coreCache.match(jsonUrl).then(match => {
                        if (!match) {
                            return fetch(jsonUrl)
                                .then(res => {
                                    if (res.status === 200) return coreCache.put(jsonUrl, res);
                                })
                                .catch(() => { });
                        }
                    })
                );
            }

            await Promise.all(batchPromises);

            if (reportProgress) {
                sendMessageToClients({ type: 'DOWNLOAD_PROGRESS', count: end, total: totalPages });
            }

            await new Promise(r => setTimeout(r, 20));
        }



        if (reportProgress) sendMessageToClients({ type: 'DOWNLOAD_COMPLETE' });
        console.log('[SW] 🎉 Full background download finished!');
    } catch (e) {
        console.error('[SW] Error in caching:', e);
    }
}

async function sendMessageToClients(msg) {
    const allClients = await self.clients.matchAll();
    allClients.forEach(client => client.postMessage(msg));
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

    // A. Fonts Strategy: Stale-While-Revalidate
    // (Search Cache -> Return Immediate -> Fetch Network -> Update Cache)
    if (url.pathname.match(/\.(woff2|ttf|otf)$/)) {
        event.respondWith(
            caches.open(FONTS_CACHE).then(async (cache) => {
                // 1. Check Cache
                const cachedResponse = await cache.match(event.request);

                // 2. Network Fetch (always runs to update cache)
                const networkFetch = fetch(event.request).then((networkResponse) => {
                    // Only cache valid responses
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {
                    // Network failed - acceptable if we have cache
                    return null;
                });

                // 3. Logic: Return Cached if available, else wait for Network
                if (cachedResponse) {
                    // Update in background (keep SW alive)
                    event.waitUntil(networkFetch);
                    return cachedResponse;
                }

                // No cache? We must wait for network
                return networkFetch;
            })
        );
        return;
    }

    // B. App Core - Logic based on file size/type
    if (
        url.pathname.match(/\.(html|js|css|json|png|jpg|svg|ico|mp3|wav)$/) ||
        event.request.mode === 'navigate'
    ) {
        // SPECIAL CASE: Individual Page JSONs (Fast chunks)
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



        // Standard App Core Strategy: Network First
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
