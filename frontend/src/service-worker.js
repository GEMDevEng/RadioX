/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.

// Workbox will be injected by the build process

// This is a placeholder file that will be replaced by the actual service worker
// during the build process. The build process will inject the necessary Workbox
// modules and precache manifest.

// The following line is required for the precache manifest to be injected:
// self.__WB_MANIFEST

// The rest of this file will be replaced during the build process.
// The following is just a placeholder to show what kind of caching strategies
// will be implemented.

// Example: Cache navigation requests with a network-first strategy
// and fall back to index.html

// Example: Cache static assets with a cache-first strategy

// Example: Cache API requests with a network-first strategy

// Example: Cache offline fallbacks

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Provide fallbacks for API requests when offline
self.addEventListener('fetch', (event) => {
  // Only handle API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Return a generic offline message for API requests
          return new Response(
            JSON.stringify({
              error: true,
              message: 'You are offline. Please check your connection and try again.'
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 503
            }
          );
        })
    );
  }
});
