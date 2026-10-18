const CACHE='bpt-pwa-10.4.45';
const ASSETS=['./', './index.html', './app-pc.css?v=10.4.45', './app-tel.css?v=10.4.45', './app-version.js?v=10.4.45', './application.js?v=10.4.45', './bpt-app-presence-launcher.js?v=10.4.45', './bpt-identity-entry-gate.js?v=10.4.45', './bpt-live-mobilefirst.css?v=10.4.45', './bpt-live-mobilefirst.js?v=10.4.45', './bpt-live3-module.js?v=10.4.45', './bpt-photo-url-migration-launcher.js?v=10.4.45', './bpt-pwa-unified-action.js?v=10.4.45', './bpt-shared-photo-config-bootstrap.js?v=10.4.45', './bpt-v229-orientation-stability.js?v=10.4.45', './bpt-v260-avatar-modal-bindings.js?v=10.4.45', './bpt-v400-headup-summary.js?v=10.4.45', './bpt-v404-latestgame-layout.js?v=10.4.45', './bpt-v408-config-ui.js?v=10.4.45', './bpt-v417-native-mobile-nav.js?v=10.4.45', './bpt-v453-odds-script.js?v=10.4.45', './bpt-v463-settings-script.js?v=10.4.45', './firebase-bridge.js?v=10.4.45', './live-betting.js?v=10.4.45', './live-ui.js?v=10.4.45', './mobile-device.js?v=10.4.45', './navigation.js?v=10.4.45', './bpt-share-recap.js?v=10.4.45', './bpt-agenda.js?v=10.4.45', './bpt-my-profile.js?v=10.4.45', './manifest.webmanifest', './icon-192.png', './icon-512.png', './partie-5.jpg'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
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
  event.respondWith(fetch(req).then(res=>{
    const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); return res;
  }).catch(()=>caches.match(req)));
});
