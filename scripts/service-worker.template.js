const CACHE_PREFIX = "wfrp-ledger-offline-";
const CACHE = CACHE_PREFIX + __VERSION__;
const ASSETS = __ASSETS__;
const ROUTES = __ROUTES__;
const ROOT = self.registration.scope;
const paths = new Map(
  ASSETS.map((path) => [
    new URL(path, ROOT).pathname,
    new URL(path, ROOT).href,
  ]),
);
const routes = new Map(
  Object.entries(ROUTES).map(([path, value]) => [
    new URL(path || "./", ROOT).pathname,
    value,
  ]),
);

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE);
        await cache.addAll(
          ASSETS.map(
            (path) => new Request(new URL(path, ROOT), { cache: "reload" }),
          ),
        );
      } catch (error) {
        await caches.delete(CACHE);
        throw error;
      }
    })(),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Keep one previous complete build for still-open tabs' immutable chunks.
      const previous = (await caches.keys()).filter(
        (key) => key.startsWith(CACHE_PREFIX) && key !== CACHE,
      );
      for (const key of previous.slice(0, -1)) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("message", (event) => {
  if (event.data?.type === "APPLY_UPDATE") event.waitUntil(self.skipWaiting());
});
self.addEventListener("fetch", (event) => {
  const request = event.request,
    url = new URL(request.url),
    root = new URL(ROOT);
  if (request.method !== "GET" || url.origin !== root.origin) return;
  const route = routes.get(url.pathname);
  const isPayload =
    request.headers?.get("RSC") === "1" || url.searchParams.has("_rsc");
  let key;
  if (route && isPayload) {
    if (!route.payload) return;
    key = new URL(route.payload, ROOT).href;
  } else if (route && request.mode === "navigate")
    key = new URL(route.document, ROOT).href;
  else key = paths.get(url.pathname);
  // Unknown requests never receive an HTML fallback. Previous builds may only
  // satisfy fingerprinted Next assets, never route documents or router payloads.
  const previousChunk =
    !key && url.pathname.startsWith(new URL("_next/static/", ROOT).pathname);
  if (!key && !previousChunk) return;
  event.respondWith(
    (async () => {
      const current = await caches.open(CACHE);
      if (key) {
        const cached = await current.match(key);
        if (cached) return cached;
        return fetch(request);
      }
      const versions = (await caches.keys())
        .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE)
        .reverse();
      for (const name of versions) {
        const cached = await (
          await caches.open(name)
        ).match(url.origin + url.pathname);
        if (cached) return cached;
      }
      return fetch(request);
    })(),
  );
});
