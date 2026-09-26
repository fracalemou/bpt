const BPT_CACHE="bpt-pwa-3.85";
const APP_SHELL=[
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(BPT_CACHE).then(cache=>cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k.startsWith("bpt-pwa-") && k!==BPT_CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("message",event=>{
  if(event.data && event.data.type==="SKIP_WAITING"){
    self.skipWaiting();
  }
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;

  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;

  // HTML / navigation : priorité réseau pour éviter de rester bloqué sur une vieille version.
  if(event.request.mode==="navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/")){
    event.respondWith(
      fetch(event.request,{cache:"no-store"})
        .then(response=>{
          const copy=response.clone();
          caches.open(BPT_CACHE).then(cache=>cache.put(event.request,copy));
          return response;
        })
        .catch(()=>caches.match(event.request).then(r=>r||caches.match("./index.html")))
    );
    return;
  }

  // Fichiers PWA : cache-first, mise à jour lors du changement de version du SW.
  event.respondWith(
    caches.match(event.request).then(cached=>cached || fetch(event.request))
  );
});
