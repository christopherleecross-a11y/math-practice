/* Keeps the practice site working when the school Wi-Fi drops, and makes it open faster.
   Pages (practice.html, crossword.html): the network first, so teachers and students always get the newest version;
   the saved copy only when there's no connection. Other files (lesson plans, videos' data, the math keyboard): the saved copy
   right away, refreshed in the background. Scores and other requests to the Google Sheet are never touched here. */
const CACHE = 'practice-v1';
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['practice.html', 'sylogist.js'])).catch(() => {})); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url), same = url.origin === self.location.origin;
  if (!same && !/(^|\.)(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.hostname)) return; // Google sign-in, the Sheet, Desmos, videos: the network only
  if (same && (req.mode === 'navigate' || /\.html$/.test(url.pathname))) { // a page: newest first, the saved copy when offline
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      try {
        const res = await Promise.race([fetch(req), new Promise((_, no) => setTimeout(() => no(new Error('slow')), 8000))]);
        if (res && res.ok) c.put(url.origin + url.pathname, res.clone());
        return res;
      } catch (err) { return (await c.match(url.origin + url.pathname)) || Response.error(); }
    })());
    return;
  }
  e.respondWith((async () => { // anything else: the saved copy now, a fresh one for next time
    const c = await caches.open(CACHE), hit = await c.match(req);
    const net = fetch(req).then((res) => { if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()); return res; }).catch(() => null);
    return hit || (await net) || Response.error();
  })());
});
