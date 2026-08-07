/**
 * Native Service Worker - Quran App
 * Strategy: Manual Control
 * 1. Fonts -> Stale-While-Revalidate (Fast render + Background update)
 * 2. App Core -> Network First (Always fresh + Offline fallback)
 */

const CACHE_VERSION = 'v2026-07-27-perf-no-precache'; // إزالة التخزين المسبق الضخم فور الإقلاع (أكبر سبب لبطء الفتح)
const FONTS_CACHE = `quran-fonts-${CACHE_VERSION}`;
const CORE_CACHE = `quran-core-${CACHE_VERSION}`;

// ============================================================
// 🔥 Firebase Cloud Messaging - مدمج داخل Service Worker الرئيسي
// ============================================================
console.log('[SW-FCM] 🚀 جاري تحميل Firebase SDK داخل sw.js...');
console.log('[SW-FCM] 📍 الموقع:', self.location.href);
console.log('[SW-FCM] 🕐 الوقت:', new Date().toISOString());

try {
  importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
  console.log('[SW-FCM] ✅ تم تحميل firebase-app-compat.js - typeof firebase:', typeof firebase);

  importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');
  console.log('[SW-FCM] ✅ تم تحميل firebase-messaging-compat.js');

  // تهيئة Firebase بالمفاتيح الحقيقية
  const firebaseConfig = {
    apiKey: 'AIzaSyALus6trZEvqIwl-RZh9T8nSWkmKfsO5g0',
    authDomain: 'quran-app-69891.firebaseapp.com',
    projectId: 'quran-app-69891',
    storageBucket: 'quran-app-69891.firebasestorage.app',
    messagingSenderId: '495250099560',
    appId: '1:495250099560:web:78d1eb07e0e6b47093dadd',
    measurementId: 'G-4FYJ6QRCQL'
  };

  firebase.initializeApp(firebaseConfig);
  console.log('[SW-FCM] ✅ تم تهيئة Firebase - projectId:', firebaseConfig.projectId);

  const messaging = firebase.messaging();
  console.log('[SW-FCM] ✅ تم إنشاء كائن Messaging بنجاح');

  // ---- مستمع Push خام للتشخيص فقط (لا يعرض إشعار) ----
  self.addEventListener('push', (event) => {
    console.log('[SW-FCM] 🔥🔥🔥 ========== PUSH EVENT RAW FIRED ==========');
    console.log('[SW-FCM] 🔥🔥🔥 event:', event);
    console.log('[SW-FCM] 🔥🔥🔥 event.data exists:', !!event.data);
    if (event.data) {
      try {
        const jsonData = event.data.json();
        console.log('[SW-FCM] 🔥🔥🔥 JSON payload:', JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log('[SW-FCM] 🔥🔥🔥 Raw text:', event.data.text());
      }
    } else {
      console.log('[SW-FCM] 🔥🔥⚠️ PUSH EVENT بدون بيانات!');
    }
    console.log('[SW-FCM] 🔥🔥🔥 ========== END PUSH RAW ==========');
  });

  // ---- Firebase onBackgroundMessage ----
  messaging.onBackgroundMessage((payload) => {
    console.log('[SW-FCM] 🔔🔔🔔 ========== onBackgroundMessage FIRED ==========');
    console.log('[SW-FCM] 🔔 Full payload:', JSON.stringify(payload, null, 2));

    const notificationTitle = payload.notification?.title || payload.data?.title || 'إشعار جديد';
    const notificationBody = payload.notification?.body || payload.data?.body || '';

    console.log('[SW-FCM] 🔔 Title:', notificationTitle);
    console.log('[SW-FCM] 🔔 Body:', notificationBody);
    console.log('[SW-FCM] 🔔 Data:', JSON.stringify(payload.data));

    const notificationOptions = {
      body: notificationBody,
      icon: payload.notification?.icon || '/final_logo.png',
      badge: '/final_logo.png',
      tag: payload.data?.tag || 'quran-push-' + Date.now(),
      data: payload.data || {},
      vibrate: [200, 100, 200],
      requireInteraction: true,
      dir: 'rtl',
      lang: 'ar',
      silent: false,
      renotify: true,
    };

    console.log('[SW-FCM] 🔔 جاري استدعاء showNotification...');
    self.registration.showNotification(notificationTitle, notificationOptions)
      .then(() => {
        console.log('[SW-FCM] ✅✅✅ showNotification SUCCESS - الإشعار ظهر!');
      })
      .catch(err => {
        console.error('[SW-FCM] ❌❌❌ showNotification FAILED:', err);
      });

    // حفظ الإشعار في السجل
    saveNotificationToStore({
      title: notificationTitle,
      body: notificationBody,
      icon: notificationOptions.icon,
      tag: notificationOptions.tag,
      data: payload.data
    });

    console.log('[SW-FCM] 🔔🔔🔔 ========== END onBackgroundMessage ==========');
  });

  // ---- دوال مساعدة لحفظ الإشعارات ----
  function saveNotificationToStore(notificationData) {
    const storePayload = {
      type: 'SAVE_PUSH_NOTIFICATION',
      notification: {
        title: notificationData.title || 'إشعار جديد',
        body: notificationData.body || '',
        icon: notificationData.icon || '/final_logo.png',
        tag: notificationData.tag,
        data: notificationData.data || {},
      }
    };

    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        clientList.forEach(client => client.postMessage(storePayload));
        console.log('[SW-FCM] 📨 تم إرسال الإشعار للحفظ إلى', clientList.length, 'نافذة');
      } else {
        console.log('[SW-FCM] ⚠️ لا توجد نوافذ مفتوحة، حفظ في IndexedDB');
        saveToIndexedDB(storePayload.notification);
      }
    });
  }

  function saveToIndexedDB(notification) {
    try {
      const request = indexedDB.open('quran_push_store', 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('notifications')) {
          db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
        }
      };
      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction('notifications', 'readwrite');
        const store = tx.objectStore('notifications');
        store.add({
          ...notification,
          timestamp: Date.now(),
          isRead: false,
          savedAt: new Date().toISOString()
        });
        console.log('[SW-FCM] ✅ تم حفظ الإشعار في IndexedDB');
      };
      request.onerror = () => console.warn('[SW-FCM] ⚠️ فشل حفظ في IndexedDB');
    } catch (e) {
      console.warn('[SW-FCM] ⚠️ خطأ في IndexedDB:', e);
    }
  }

  console.log('[SW-FCM] 🎉🎉🎉 Firebase Messaging جاهز تماماً لاستقبال الإشعارات!');
} catch (e) {
  console.error('[SW-FCM] ❌❌❌ خطأ في تحميل Firebase:', e);
  console.error('[SW-FCM] ❌ الإشعارات لن تعمل - تحقق من اتصال الإنترنت');
}

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

    // استقبال طلب سحب الإشعارات المحفوظة من IndexedDB
    if (event.data && event.data.type === 'GET_STORED_NOTIFICATIONS') {
        console.log('[SW-FCM] 📬 طلب سحب الإشعارات المحفوظة من IndexedDB');
        try {
            const request = indexedDB.open('quran_push_store', 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('notifications')) {
                    db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
                }
            };
            request.onsuccess = (e) => {
                const db = e.target.result;
                if (db.objectStoreNames.contains('notifications')) {
                    const tx = db.transaction('notifications', 'readonly');
                    const store = tx.objectStore('notifications');
                    const getAll = store.getAll();
                    getAll.onsuccess = () => {
                        if (event.ports && event.ports[0]) {
                            event.ports[0].postMessage({ type: 'STORED_NOTIFICATIONS', notifications: getAll.result });
                        }
                        // مسح بعد الإرسال
                        const clearTx = db.transaction('notifications', 'readwrite');
                        clearTx.objectStore('notifications').clear();
                        console.log('[SW-FCM] 📬 تم إرسال', getAll.result.length, 'إشعار محفوظ ومسحها');
                    };
                }
            };
            request.onerror = () => console.warn('[SW-FCM] ⚠️ فشل فتح IndexedDB');
        } catch (e) {
            console.warn('[SW-FCM] ⚠️ خطأ في سحب IndexedDB:', e);
        }
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
        ])
        // NOTE: this previously auto-triggered a background precache of all 604
        // pages (~130MB: 95MB fonts + 37MB JSON) 15s after activation. On the
        // Android app that copies the whole bundle from APK assets into Cache
        // Storage on every launch, hammering disk I/O for minutes and freezing
        // the UI (the worst startup slowdown). Removed: on native the assets are
        // already local and served directly via Capacitor, so the precache was
        // pure waste. Pages are still cached on-demand as the user visits them
        // (fetch handler below), and a full offline download remains available
        // via the manual CACHE_ALL_FONTS message.
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

    // C. Quran Audio CDNs — Pass through (network only)
    // Audio caching is now handled by IndexedDB Blob Storage (audioCacheService.ts)
    // which uses URL.createObjectURL() for guaranteed mobile browser compatibility.
    // The old Cache API approach failed on mobile due to Range Request issues.
    const isAudioCDN =
        url.hostname === 'everyayah.com' ||
        url.hostname === 'audio.qurancdn.com';

    if (isAudioCDN) {
        // Just fetch from network — IndexedDB handles caching separately
        event.respondWith(
            fetch(event.request).catch(() => {
                return new Response('Audio not available offline', { status: 503 });
            })
        );
        return;
    }

    // Default: Just fetch
    event.respondWith(fetch(event.request));
});

// ---------------------------
// 5. Notification Click Event (موحد - يدعم التنقل لصفحة محددة)
// ---------------------------
self.addEventListener('notificationclick', (event) => {
    console.log('[SW-FCM] 👆 تم النقر على الإشعار:', event.notification.tag);
    event.notification.close();

    // تحديد الصفحة المستهدفة من بيانات الإشعار
    const targetUrl = event.notification.data?.targetPage
        ? `/?page=${event.notification.data.targetPage}`
        : '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // إذا كان التطبيق مفتوحاً، ركز عليه وانتقل للصفحة المطلوبة
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            // إذا لم يكن مفتوحاً، افتح نافذة جديدة
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
