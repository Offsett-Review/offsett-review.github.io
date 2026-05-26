/* Offsett Review — Service Worker v3 */
const CACHE = 'offsett-review-v3';

const PRECACHE = [
  '/Offsett_review/',
  '/Offsett_review/index.html',
  '/Offsett_review/manifest.json',
];

// These should always come from the network when online so the running app
// reflects the latest deploy. The cached copy is only used as an offline
// fallback. Everything else stays cache-first.
function isAlwaysFresh(url) {
  const p = url.pathname;
  return (
    p === '/' ||
    p.endsWith('/') ||
    p.endsWith('/index.html') ||
    p.endsWith('/CHANGELOG.md') ||
    p.endsWith('/manifest.json')
  );
}

function isCacheable(request) {
  try {
    const url = new URL(request.url);
    if (url.protocol === 'chrome-extension:') return false;
    if (url.protocol === 'data:') return false;
    if (request.method !== 'GET') return false;
    if (url.hostname.includes('allorigins.win')) return false;
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    return true;
  } catch {
    return false;
  }
}

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.allSettled(
        PRECACHE.map(url => cache.add(url).catch(() => {}))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (!isCacheable(e.request)) return;

  const url = new URL(e.request.url);

  // Network-first for the app shell and the changelog so the running page
  // and its dynamic version label always reflect the latest deploy.
  if (isAlwaysFresh(url)) {
    e.respondWith(
      fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE).then(cache => {
            try { cache.put(e.request, clone); } catch (err) {}
          });
        }
        return res;
      }).catch(() => caches.match(e.request).then(c => c || caches.match('/Offsett_review/index.html')))
    );
    return;
  }

  // Cache-first for everything else (fonts, libraries, images).
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE).then(cache => {
          try { cache.put(e.request, clone); } catch (err) {}
        });
        return res;
      }).catch(() => caches.match('/Offsett_review/index.html'));
    })
  );
});
