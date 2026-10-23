const CACHE='bpt-pwa-10.4.73';
// Avatars (10.4.53) : fichiers fixes, cache à part conservé d'une version à l'autre.
// Un avatar modifié doit changer de nom de fichier (ou AVATAR_CACHE de numéro).
const AVATAR_CACHE='bpt-avatars-v1';
const ASSETS=['./', './index.html', './app-pc.css?v=10.4.73', './app-tel.css?v=10.4.73', './app-version.js?v=10.4.73', './application.js?v=10.4.73', './bpt-live-mobilefirst.css?v=10.4.73', './bpt-live-mobilefirst.js?v=10.4.73', './bpt-online.js?v=10.4.73', './bpt-live3-module.js?v=10.4.73', './bpt-pwa-unified-action.js?v=10.4.73', './bpt-config-ui.js?v=10.4.73', './bpt-odds.js?v=10.4.73', './firebase-bridge.js?v=10.4.73', './live-betting.js?v=10.4.73', './live-ui.js?v=10.4.73', './mobile-device.js?v=10.4.73', './navigation.js?v=10.4.73', './bpt-share-recap.js?v=10.4.73', './bpt-agenda.js?v=10.4.73', './bpt-my-profile.js?v=10.4.73', './manifest.webmanifest', './icon-192.png', './icon-512.png', './partie-5.jpg'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&k!==AVATAR_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
// 10.4.73 — Stratégies :
// - page (index.html) : réseau d'abord, c'est elle qui porte les numéros ?v= et déclenche les mises à jour ;
// - fichiers de l'appli avec ?v= : cache d'abord (contenu figé pour un numéro donné) → ouverture immédiate ;
// - bibliothèques Firebase (version dans l'adresse) : cache d'abord ;
// - avatars : cache d'abord, cache conservé d'une version à l'autre ;
// - autres fichiers de l'appli (icônes, manifeste, photo locale) : réseau d'abord ;
// - tout le reste (base Firebase, Cloudinary, API) n'est pas intercepté.
// Tout fichier modifié doit donc changer de ?v= (d'où la montée de version de tous les ?v=).
const cacheFirst=(cacheName,req)=>caches.open(cacheName).then(c=>c.match(req).then(hit=>hit||fetch(req).then(res=>{
  if(res.ok||res.type==='opaque') c.put(req,res.clone()); return res;
})));
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(res=>{
      const copy=res.clone(); caches.open(CACHE).then(c=>c.put('./index.html',copy)); return res;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  if(url.origin===self.location.origin){
    if(url.pathname.includes('/avatars/')){ event.respondWith(cacheFirst(AVATAR_CACHE,req)); return; }
    if(url.searchParams.has('v')){ event.respondWith(cacheFirst(CACHE,req)); return; }
    event.respondWith(fetch(req).then(res=>{
      if(res.ok){ const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); }
      return res;
    }).catch(()=>caches.match(req)));
    return;
  }
  if(url.hostname==='www.gstatic.com' && url.pathname.startsWith('/firebasejs/')){ event.respondWith(cacheFirst(CACHE,req)); return; }
});
