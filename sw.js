// 급식 알리미 서비스워커
const CACHE = 'meal-app-v53';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './fonts/hanam-daum.woff2',
  './fonts/hs-santokki.woff2',
  './fonts/mapo-backpacking.woff2',
  './fonts/pretendard-el.woff2',
  './fonts/goyang-ilsan.woff2',
  './fonts/gwangyang-haetsal.woff2',
  './fonts/donggrami.woff2',
  './fonts/midyakda.woff2',
  './fonts/jeonnam-yuna.woff2',
  './fonts/chungbuk70.woff2',
  './fonts/taebaek-eunhasu.woff2'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // 나이스 API/Firebase 등 외부 요청은 항상 네트워크로 (캐시하지 않음)
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }
  // 폰트: 캐시 우선 (거의 안 바뀌므로 빠르게, 데이터 절약)
  if (new URL(req.url).pathname.includes('/fonts/')) {
    e.respondWith(
      caches.match(req).then((r) => r || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }))
    );
    return;
  }
  // 앱 셸: 네트워크 우선, 실패 시 캐시
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
  );
});
