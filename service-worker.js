// Quality Quest — service worker (precache app shell + content for offline use).

const VERSION = "qq-v1-2026-05-20";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./styles/tokens.css",
  "./styles/app.css",
  "./src/main.js",
  "./src/state.js",
  "./src/engine.js",
  "./src/content.js",
  "./src/charts.js",
  "./src/ui/dom.js",
  "./src/ui/splash.js",
  "./src/ui/onboarding.js",
  "./src/ui/scenario.js",
  "./src/ui/debrief.js",
  "./src/ui/path.js",
  "./src/ui/caseFile.js",
  "./src/ui/install.js",
  "./assets/icons/icon.svg",
  "./content/modules.json",
  "./content/glossary.json",
  "./content/citations.json",
  "./content/scenarios/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // Cache app shell, plus all scenarios listed in the manifest if reachable.
    await cache.addAll(APP_SHELL);
    try {
      const manifestRes = await fetch("./content/scenarios/manifest.json", { cache: "no-cache" });
      if (manifestRes.ok) {
        const data = await manifestRes.json();
        const urls = (data.files || []).map(f => `./content/scenarios/${f}`);
        await cache.addAll(urls);
      }
    } catch { /* offline first-install — files will be cached on later fetch */ }
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(req, { ignoreSearch: true });
    if (cached) {
      // Stale-while-revalidate: return cache, refresh in background.
      event.waitUntil(refresh(cache, req));
      return cached;
    }
    try {
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    } catch {
      // Offline + nothing cached — try index for nav requests.
      if (req.mode === "navigate") return cache.match("./index.html");
      throw new Error("offline and not in cache");
    }
  })());
});

async function refresh(cache, req) {
  try {
    const fresh = await fetch(req);
    if (fresh.ok) await cache.put(req, fresh);
  } catch { /* still offline; cache stays */ }
}
