const CACHE_NAME = 'legacy-wrestling-cards-0.2.0';
const CORE = [
  './','./index.html','./styles.css','./data.js','./game.js','./manifest.webmanifest','./version.json',
  './assets/branding/lpw-logo-compact-400.webp','./assets/branding/lpw-logo-main-menu-1200.webp',
  './assets/wrestlers/stone-cold-steve-austin-1999/portrait.webp',
  './assets/wrestlers/stone-cold-steve-austin-1999/cards/stone-cold-stunner.webp',
  './assets/wrestlers/the-rock-1999/portrait.webp',
  './assets/wrestlers/the-rock-1999/cards/rock-bottom.webp'
];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => { if (event.request.method === 'GET') event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request))); });
