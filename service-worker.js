const CACHE='bpt-pwa-10.4.53';
// Avatars (10.4.53) : fichiers fixes, cache à part conservé d'une version à l'autre.
// Un avatar modifié doit changer de nom de fichier (ou AVATAR_CACHE de numéro).
const AVATAR_CACHE='bpt-avatars-v1';
const ASSETS=['./', './index.html', './app-pc.css?v=10.4.53', './app-tel.css?v=10.4.53', './app-version.js?v=10.4.53', './application.js?v=10.4.53', './bpt-app-presence-launcher.js?v=10.4.53', './bpt-identity-entry-gate.js?v=10.4.53', './bpt-live-mobilefirst.css?v=10.4.53', './bpt-live-mobilefirst.js?v=10.4.53', './bpt-live3-module.js?v=10.4.53', './bpt-photo-url-migration-launcher.js?v=10.4.53', './bpt-pwa-unified-action.js?v=10.4.53', './bpt-shared-photo-config-bootstrap.js?v=10.4.53', './bpt-v229-orientation-stability.js?v=10.4.53', './bpt-v260-avatar-modal-bindings.js?v=10.4.53', './bpt-v400-headup-summary.js?v=10.4.53', './bpt-v404-latestgame-layout.js?v=10.4.53', './bpt-v408-config-ui.js?v=10.4.53', './bpt-v417-native-mobile-nav.js?v=10.4.53', './bpt-v453-odds-script.js?v=10.4.53', './bpt-v463-settings-script.js?v=10.4.53', './firebase-bridge.js?v=10.4.53', './live-betting.js?v=10.4.53', './live-ui.js?v=10.4.53', './mobile-device.js?v=10.4.53', './navigation.js?v=10.4.53', './bpt-share-recap.js?v=10.4.53', './bpt-agenda.js?v=10.4.53', './bpt-my-profile.js?v=10.4.53', './manifest.webmanifest', './icon-192.png', './icon-512.png', './partie-5.jpg'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&k!==AVATAR_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(res=>{
      const copy=res.clone(); caches.open(CACHE).then(c=>c.put('./index.html',copy)); return res;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  if(new URL(req.url).pathname.includes('/avatars/')){
    event.respondWith(caches.open(AVATAR_CACHE).then(c=>c.match(req).then(hit=>hit||fetch(req).then(res=>{
      if(res.ok) c.put(req,res.clone()); return res;
    }))));
    return;
  }
  event.respondWith(fetch(req).then(res=>{
    const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); return res;
  }).catch(()=>caches.match(req)));
});
