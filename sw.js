/**
 * LOGIN Order Form - Progressive Web App Service Worker
 * Cache-first / Stale-While-Revalidate offline-first strategy
 */

const CACHE_NAME = 'login-order-form-v7';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/variables.css',
  './css/style.css',
  './data/categories.json',
  './data/products.json',
  './data/defaultCatalog.js',
  './data/loginCatalog.js',
  './data/loginCatalog.json',
  './js/icons.js',
  './js/catalogRepository.js',
  './js/catalog-data.js',
  './js/state.js',
  './js/storage.js',
  './js/app.js',
  './js/components/header.js',
  './js/components/searchBar.js',
  './js/components/categoryNav.js',
  './js/components/productCard.js',
  './js/components/productList.js',
  './js/components/orderSummary.js',
  './js/components/savedOrders.js',
  './js/components/catalogManager.js',
  './icons/icon.svg'
];

// Install Event - Pre-cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate Event - Clean up old caches & take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing legacy cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event - Stale-while-revalidate for local assets
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // External requests (e.g. wa.me) bypass cache
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // Fetch from network to update cache in background
        const networkFetch = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Network failed (offline). If cachedResponse exists, it will be returned.
          return cachedResponse;
        });

        // Return cached response immediately if available, otherwise wait for network
        return cachedResponse || networkFetch;
      });
    })
  );
});
