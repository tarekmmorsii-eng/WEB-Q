/**
 * Native Service Worker - Quran App
 * Strategy: Manual Control
 * 1. Fonts -> Stale-While-Revalidate (Fast render + Background update)
 * 2. App Core -> Network First (Always fresh + Offline fallback)
 */

const CACHE_VERSION = 'v2026-02-12-V12-REV'; // User requested forced update for latest edits
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

    if (event.data === 'CHECK_AND_DOWNLOAD_FONTS') {
        // Silent background check (existing logic)
        cacheAllFontsSafely(false);
    }

    if (event.data === 'CACHE_ALL_FONTS') {
        // Explicit user request with Progress Reporting
        console.log('[SW] 📥 Starting MANUAL font download...');
        cacheAllFontsSafely(true);
    }
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
            // 🚀 Start Logic: Download ALL fonts in background
            // This ensures full offline availability eventually
            cacheAllFontsSafely(false);
        })
    );
});

// ---------------------------
// Helper: Cache All Fonts Safely (Sequential)
// ---------------------------
async function cacheAllFontsSafely(reportProgress = false) {
    console.log(`[SW] 📥 Starting font download (Progress: ${reportProgress})...`);
    try {
        const cache = await caches.open(FONTS_CACHE);
        const total = 604;

        // Check if we already have most fonts to avoid redundant work (ONLY if silent)
        if (!reportProgress) {
            const keys = await cache.keys();
            if (keys.length > 600) {
                console.log('[SW] ✅ Most fonts already cached. Skipping full download.');
                return;
            }
        } else {
            // Notify start for UI
            sendMessageToClients({ type: 'DOWNLOAD_START', total });
        }

        // Loop 1 to 604
        for (let i = 1; i <= total; i++) {
            // V1 and V2 fonts
            const fonts = [`/fonts/p${i}.woff2`, `/fonts/v2/p${i}.woff2`];

            for (const fontUrl of fonts) {
                const match = await cache.match(fontUrl);
                if (!match) {
                    try {
                        const response = await fetch(fontUrl);
                        if (response && response.status === 200) {
                            await cache.put(fontUrl, response.clone());
                        }
                    } catch (err) { }
                    await new Promise(r => setTimeout(r, 50)); // Faster loop
                }
            }

            // Report Progress
            if (reportProgress && i % 5 === 0) {
                sendMessageToClients({ type: 'DOWNLOAD_PROGRESS', count: i, total });
            }
        }

        if (reportProgress) sendMessageToClients({ type: 'DOWNLOAD_COMPLETE' });
        console.log('[SW] 🎉 All fonts background download finished!');
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

        // SPECIAL CASE: Large Mushaf JSON -> Always Cache First to prevent 28MB download lag
        if (url.pathname.includes('qpc_v2_mushaf.json')) {
            event.respondWith(
                caches.open(CORE_CACHE).then(async (cache) => {
                    const cachedResponse = await cache.match(event.request);
                    if (cachedResponse) return cachedResponse;

                    // Not in cache, fetch and store
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
