const CACHE='bpt-pwa-10.4.23';
const ASSETS=['./', './index.html', './app-pc.css?v=10.4.23', './app-tel.css?v=10.4.23', './app-version.js?v=10.4.23', './application.js?v=10.4.23', './bpt-app-presence-launcher.js?v=10.4.23', './bpt-identity-entry-gate.js?v=10.4.23', './bpt-live-mobilefirst.css?v=10.4.23', './bpt-live-mobilefirst.js?v=10.4.23', './bpt-live3-module.js?v=10.4.23', './bpt-photo-url-migration-launcher.js?v=10.4.23', './bpt-pwa-unified-action.js?v=10.4.23', './bpt-shared-photo-config-bootstrap.js?v=10.4.23', './bpt-v229-orientation-stability.js?v=10.4.23', './bpt-v260-avatar-modal-bindings.js?v=10.4.23', './bpt-v400-headup-summary.js?v=10.4.23', './bpt-v404-latestgame-layout.js?v=10.4.23', './bpt-v408-config-ui.js?v=10.4.23', './bpt-v417-native-mobile-nav.js?v=10.4.23', './bpt-v453-odds-script.js?v=10.4.23', './bpt-v463-settings-script.js?v=10.4.23', './firebase-bridge.js?v=10.4.23', './live-betting.js?v=10.4.23', './live-ui.js?v=10.4.23', './mobile-device.js?v=10.4.23', './navigation.js?v=10.4.23', './manifest.webmanifest', './icon-192.png', './icon-512.png', './partie-5.jpg'];
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
