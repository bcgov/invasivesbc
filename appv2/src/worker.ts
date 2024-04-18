import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute, Route } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

cleanupOutdatedCaches();

// this value is injected by vite
precacheAndRoute(self.__WB_MANIFEST);

const apiDocs = new Route(({ request, sameOrigin }) => {
  return request.url.includes(`/api/api-docs`);
}, new NetworkFirst({
  cacheName: 'api-docs',
  networkTimeoutSeconds: 10,
  matchOptions: {
    ignoreSearch: false,
    ignoreVary: false,
  },
  plugins: [
    new ExpirationPlugin({
      maxAgeSeconds: 3600 * 24 * 3 // 3 days
    }),
    new CacheableResponsePlugin({
      statuses: [200]
    })
  ]
}));

// Register the new route
registerRoute(apiDocs);


