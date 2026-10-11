
(function(){
  function applyBptMobileClass(){
    const coarse = window.matchMedia && window.matchMedia("(pointer:coarse)").matches;
    const touch = navigator.maxTouchPoints > 0 || "ontouchstart" in window;
    const shortSide = Math.min(window.innerWidth, window.innerHeight);
    const longSide = Math.max(window.innerWidth, window.innerHeight);
    const mobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
    const compactTouchDevice = touch && coarse && shortSide <= 700 && longSide <= 1400;
    const isMobile = mobileUA || compactTouchDevice;
    document.documentElement.classList.toggle("bpt-mobile-device", !!isMobile);
    document.body?.classList.toggle("bpt-mobile-device", !!isMobile);
  }
  applyBptMobileClass();
  window.addEventListener("resize", applyBptMobileClass, {passive:true});
  window.addEventListener("orientationchange", applyBptMobileClass, {passive:true});
})();
