// Offline cache: serve from cache, refresh in the background so the next launch gets updates.
const V = 'pp-b899d43b87';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', (e) => e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const key = req.mode === 'navigate' ? './index.html' : req;
  e.respondWith(caches.open(V).then(async (c) => {
    const hit = await c.match(key, { ignoreSearch: true });
    const net = fetch(req).then((res) => { if (res && (res.ok || res.type === 'opaque')) c.put(key, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
