// Offline Start: alle App Dateien beim Installieren cachen, danach aus dem Cache liefern.
// Bei jeder Änderung an den App Dateien die Versionsnummer erhöhen.
const CACHE = 'schachschritt-v2';
const FILES = [
  './',
  './app.css',
  './app.js',
  './cards.js',
  './pick.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  // Seitenaufrufe immer mit der gecachten Startseite beantworten.
  if (request.mode === 'navigate') {
    event.respondWith(caches.match('./').then((cached) => cached || fetch(request)));
    return;
  }

  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});
