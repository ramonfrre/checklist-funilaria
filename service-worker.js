const CACHE = 'checklist-v10';
const SHELL = ['./index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c) { return c.addAll(SHELL); })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;

  // Supabase e Google Fonts: sempre busca da rede
  if (
    e.request.url.includes('supabase.co') ||
    e.request.url.includes('googleapis.com') ||
    e.request.url.includes('gstatic.com')
  ) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Shell do app: cache first
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request);
    })
  );
});
