const CACHE_VERSION = 'v1';
const APP_CACHE = `vision-shell-${CACHE_VERSION}`;

const ASSETS = [
  'index.html',
  'styles/main.css',
  'src/main.js',
  'src/components/remoteControls.js',
  'src/components/programGuidePanel.js',
  'src/components/suggestionsPanel.js',
  'src/services/irService.js',
  'src/services/programGuide.js',
  'src/services/recommendation.js',
  'src/state/store.js',
  'src/data/irProfiles.js',
  'src/data/programs.js',
  'config/app.config.json',
  'config/program-data.json',
];

const ASSET_URLS = ASSETS.map((path) => new URL(path, self.location.origin).toString());
const NETWORK_FIRST_PATHS = ['/config/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_CACHE)
      .then((cache) => cache.addAll(ASSET_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== APP_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const shouldUseNetworkFirst = NETWORK_FIRST_PATHS.some((path) => url.pathname.startsWith(path));

  if (shouldUseNetworkFirst) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isSameOrigin && ASSET_URLS.includes(url.toString())) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(cacheFallback(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  const cache = await caches.open(APP_CACHE);
  cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    const cache = await caches.open(APP_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFallback(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    if (request.destination === 'document') {
      return caches.match(new URL('index.html', self.location.origin).toString());
    }
    throw error;
  }
}
