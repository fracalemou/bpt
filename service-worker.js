const CACHE='bpt-pwa-9.0.4';
const ASSETS=['./','./index.html','./css/app.css?v=9.0.2','./js/core/app-version.js?v=9.0.2','./js/core/application.js?v=9.0','./js/core/firebase-bridge.js?v=9.0','./js/core/mobile-device.js?v=9.0','./js/core/mobile-landscape.js?v=9.0','./js/core/navigation.js?v=9.0','./js/features/bpt-app-presence-launcher.js?v=9.0','./js/features/bpt-identity-entry-gate.js?v=9.0','./js/features/bpt-photo-url-migration-launcher.js?v=9.0','./js/features/bpt-pwa-unified-action.js?v=9.0','./js/features/bpt-shared-photo-config-bootstrap.js?v=9.0','./js/features/bpt-v229-orientation-stability.js?v=9.0','./js/features/bpt-v234-mobile-transition-stability.js?v=9.0','./js/features/bpt-v260-avatar-modal-bindings.js?v=9.0','./js/features/bpt-v400-headup-summary.js?v=9.0','./js/features/bpt-v404-latestgame-layout.js?v=9.0','./js/features/bpt-v417-native-mobile-nav.js?v=9.0','./js/features/settings/bpt-v408-config-ui.js?v=9.0','./js/features/settings/bpt-v463-settings-script.js?v=9.0','./js/modules/betting/bpt-v453-odds-script.js?v=9.0','./js/modules/betting/live-betting.js?v=9.0','./js/modules/live/bpt-live-role-lock-final.js?v=9.0','./js/modules/live/bpt-live3-module.js?v=9.0.2','./js/modules/live/bpt-no-live-runtime.js?v=9.0','./js/modules/live/live-ui.js?v=9.0.1','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
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
