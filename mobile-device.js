
(function(){
  function applyBptMobileClass(){
    const coarse = window.matchMedia && window.matchMedia("(pointer:coarse)").matches;
    const touch = navigator.maxTouchPoints > 0 || "ontouchstart" in window;
    const shortSide = Math.min(window.innerWidth, window.innerHeight);
    const longSide = Math.max(window.innerWidth, window.innerHeight);
    const ua = navigator.userAgent || "";
    // Tablette (iPad, iPad « bureau », Android sans « Mobile ») : affichage PC
    const tablet = /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    const phoneUA = /iPhone|iPod|Android|Mobile/i.test(ua);
    const compactTouchDevice = touch && coarse && shortSide <= 600 && longSide <= 1000;
    // Fenêtre PC très étroite : on bascule (réversiblement) sur l'affichage téléphone
    const narrowWindow = window.innerWidth <= 700;
    const isMobile = !tablet && (phoneUA || compactTouchDevice || narrowWindow);
    document.documentElement.classList.toggle("bpt-mobile-device", !!isMobile);
    document.body?.classList.toggle("bpt-mobile-device", !!isMobile);
  }
  applyBptMobileClass();
  window.addEventListener("resize", applyBptMobileClass, {passive:true});
  window.addEventListener("orientationchange", applyBptMobileClass, {passive:true});
})();
