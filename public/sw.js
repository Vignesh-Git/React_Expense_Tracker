const CACHE_VERSION = 'spendwise-pwa-v1'
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/pwa-icon.svg',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png',
  '/maskable-icon-512.png',
]

self.addEventListener('install', (event) => {
  // Cache the app shell during installation so the PWA can open while offline.
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  // Remove old caches after an update so users do not keep stale app bundles.
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_VERSION)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  event.respondWith(handleAssetRequest(request))
})

async function handleNavigationRequest(request) {
  const cache = await caches.open(CACHE_VERSION)

  try {
    const response = await fetch(request)
    cache.put('/index.html', response.clone())
    return response
  } catch {
    return (await cache.match('/index.html')) || Response.error()
  }
}

async function handleAssetRequest(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) return cachedResponse

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return Response.error()
  }
}
