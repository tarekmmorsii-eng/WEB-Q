/**
 * Native Service Worker - Quran App
 * Strategy: Manual Control
 * 1. Fonts -> Stale-While-Revalidate (Fast render + Background update)
 * 2. App Core -> Network First (Always fresh + Offline fallback)
 */

const CACHE_VERSION = 'v2026-03-01-V5'; // Cache First strategy for fonts & page JSONs
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
let currentDownloadPromise = null;

self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        console.log('[SW] Skipping waiting...');
        self.skipWaiting();
        return;
    }

    if (event.data === 'CACHE_ALL_FONTS') {
        console.log('[SW] 📥 Received manual download request');
        // Prevent multiple concurrent downloads
        if (currentDownloadPromise) {
            console.log('[SW] ⏳ Download already in progress, ignoring duplicate request.');
            return;
        }
        currentDownloadPromise = cacheAllDataSafely(true).finally(() => {
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
                        if (key !== FONTS_CACHE && key !== CORE_CACHE) {
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
// Helper: Cache All Data Safely (Pool-based with Timeouts)
// ---------------------------
async function cacheAllDataSafely(reportProgress = false) {
    console.log(`[SW] 📥 Starting data download process (Manual: ${reportProgress})...`);

    try {
        const fontCache = await caches.open(FONTS_CACHE);
        const coreCache = await caches.open(CORE_CACHE);
        const totalPages = 604;

        if (!reportProgress) {
            const fontKeys = await fontCache.keys();
            if (fontKeys.length > 600) {
                console.log('[SW] ✅ Data appears to be cached. Skipping background download.');
                return;
            }
        } else {
            sendMessageToClients({ type: 'DOWNLOAD_START', total: totalPages });
        }

        // Preparation: Create a queue of tasks
        const queue = [];
        for (let p = 1; p <= totalPages; p++) {
            // Task 1: Page JSON
            queue.push({
                url: `/data/v2/pages/${p}.json`,
                cache: coreCache,
                page: p
            });
            // Task 2: Page Font
            queue.push({
                url: `/fonts/p${p}.woff2`,
                cache: fontCache,
                page: p
            });
        }

        const totalTasks = queue.length;
        let completedTasks = 0;
        let lastReportedPage = 0;

        // Concurrent Worker Pool (Max 3 parallel requests to stay safe on shared hosting)
        const CONCURRENCY = 3;
        const workers = Array(CONCURRENCY).fill(0).map(async () => {
            while (queue.length > 0) {
                const task = queue.shift();
                if (!task) break;

                try {
                    const match = await task.cache.match(task.url);
                    if (!match) {
                        // Use a timeout for fetch to prevent infinite hanging
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

                        const res = await fetch(task.url, { signal: controller.signal });
                        clearTimeout(timeoutId);

                        if (res.status === 200) {
                            await task.cache.put(task.url, res);
                        }
                    }
                } catch (err) {
                    console.warn(`[SW] Failed to fetch ${task.url}:`, err);
                    // Silently continue to next task
                } finally {
                    completedTasks++;
                    // Report progress per page completion roughly
                    if (reportProgress) {
                        const currentPage = Math.floor((completedTasks / totalTasks) * totalPages);
                        if (currentPage > lastReportedPage) {
                            lastReportedPage = currentPage;
                            sendMessageToClients({
                                type: 'DOWNLOAD_PROGRESS',
                                count: currentPage,
                                total: totalPages
                            });
                        }
                    }
                }
            }
        });

        await Promise.all(workers);

        if (reportProgress) {
            sendMessageToClients({ type: 'DOWNLOAD_PROGRESS', count: totalPages, total: totalPages });
            sendMessageToClients({ type: 'DOWNLOAD_COMPLETE' });
        }
        console.log('[SW] 🎉 Full download finished successfully!');

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
