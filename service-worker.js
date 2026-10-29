const CACHE = 'checklist-v33';
const SHELL = ['./index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c) { return c.addAll(SHELL); })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys()
      .then(function(keys) {
        return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
      })
      .then(function() { return clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;

  // Supabase, Google Fonts e R2: sempre busca da rede
  if (
    e.request.url.includes('supabase.co') ||
    e.request.url.includes('googleapis.com') ||
    e.request.url.includes('gstatic.com') ||
    e.request.url.includes('r2.dev')
  ) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Shell do app: cache first, sempre lendo do cache da versão atual
  e.respondWith(
    caches.open(CACHE).then(function(c) {
      return c.match(e.request).then(function(r) {
        return r || fetch(e.request);
      });
    })
  );
});
