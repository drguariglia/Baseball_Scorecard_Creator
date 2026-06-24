const CACHE = "guariglia-scorecard-v27-2-quick-code-k-font";
const CORE_ASSETS = [
  "/styles.css?v=27.2-quick-code-k-font",
  "/app.js?v=27.2-quick-code-k-font",
  "/baseball-data.js?v=27.2",
  "/template_data.js",
  "/pdf_background_data.js?v=27.2",
  "/vendor/jszip.min.js",
  "/assets/guariglia-crest.gif",
  "/assets/icon-192.png",
  "/assets/icon-512.png",
  "/assets/Scorecard_20260615_blank_template.xlsx",
  "/assets/Scorecard_20260615_App_Colors_Classic_Blank.xlsx",
  "/assets/classic-scorecard-background.jpg?v=27.2-quick-code-k-font",
  "/manifest.webmanifest"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/")) return;

  // Navigation is network-first so a newly deployed version is not hidden by an older cached index page.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put("/index.html", copy));
          return response;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }))
  );
});
