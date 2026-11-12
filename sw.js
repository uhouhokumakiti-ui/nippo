/* 試錐日報 サービスワーカー
   アプリを更新したときは VERSION の数字を上げてください。
   次に電波のある場所でアプリを開いたとき、新しい版に切り替わります。 */
const VERSION = '0.3.0';
const CACHE = 'shisui-nippo-' + VERSION;
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './lib/html2canvas.min.js',
  './lib/jspdf.umd.min.js',
  './lib/encoding.min.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('shisui-nippo-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data === 'skip') self.skipWaiting();
});

/* 保存してあるファイルを先に使う（電波がなくても起動できる） */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return fetch(req).catch(() => (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()));
    })
  );
});
