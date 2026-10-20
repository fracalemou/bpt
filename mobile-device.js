(function(){
  // La détection est définie dans <head> (script bpt-device-css) ; ici on la réapplique
  // au redimensionnement et on change de feuille de style si l'appareil « bascule »
  // (fenêtre PC réduite sous 700 px ou réélargie).
  function applyBptMobileClass(){
    const isMobile = typeof window.bptDetectPhone === "function" ? window.bptDetectPhone() : window.innerWidth <= 700;
    document.documentElement.classList.toggle("bpt-mobile-device", !!isMobile);
    document.body?.classList.toggle("bpt-mobile-device", !!isMobile);
    const link = document.getElementById("bptDeviceCss");
    if (link && typeof window.bptDeviceCssHref === "function") {
      const href = window.bptDeviceCssHref(!!isMobile);
      if (link.getAttribute("href") !== href) link.setAttribute("href", href);
    }
  }
  applyBptMobileClass();
  window.addEventListener("resize", applyBptMobileClass, {passive:true});
  window.addEventListener("orientationchange", applyBptMobileClass, {passive:true});
})();

// ===== Classes portrait / paysage stables sur téléphone (ex-bpt-v229-orientation-stability.js) =====
(function(){
  function syncBptMobileOrientationStable(){
    const root=document.documentElement;
    const body=document.body;
    if(!body)return;
    const isMobile=root.classList.contains('bpt-mobile-device');
    if(!isMobile)return;
    const vv=window.visualViewport;
    const w=(vv && vv.width) || window.innerWidth || root.clientWidth;
    const h=(vv && vv.height) || window.innerHeight || root.clientHeight;
    const portrait=h>=w;
    for(const el of [root,body]){
      el.classList.toggle('bpt-mobile-portrait',portrait);
      el.classList.toggle('bpt-mobile-landscape',!portrait);
    }
  }
  function settle(){
    syncBptMobileOrientationStable();
    [60,180,360].forEach(ms=>setTimeout(syncBptMobileOrientationStable,ms));
  }
  window.bptSyncMobileOrientation=settle;
  window.addEventListener('resize',settle,{passive:true});
  window.addEventListener('orientationchange',settle,{passive:true});
  window.addEventListener('pageshow',settle,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)settle();});
  if(window.visualViewport) window.visualViewport.addEventListener('resize',settle,{passive:true});
  const start=()=>{
    settle();
    const obs=new MutationObserver(muts=>{
      if(muts.some(m=>m.type==='attributes' && m.attributeName==='class')){
        if(document.body.classList.contains('bpt-mobile-live-fullscreen')) settle();
      }
    });
    obs.observe(document.body,{attributes:true,attributeFilter:['class']});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
