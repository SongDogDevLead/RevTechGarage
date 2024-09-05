const CACHE_NAME = 'v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './assets/images/bg.exr',
    './assets/images/blackSupraComp.glb',
    './assets/images/tabletV2Comp.glb',
    './assets/images/manualComp.glb',
    './assets/images/phoneV2Comp.glb',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;  // Return the cached file
                }
                return fetch(event.request); // Fetch from the network if not in cache
            })
    );
});


