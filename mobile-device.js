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
