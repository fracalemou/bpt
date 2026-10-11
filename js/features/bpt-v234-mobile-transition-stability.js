
(function(){
  let t=null;
  function stable(){
    if(!isBptMobileDevice())return;
    if(t)clearTimeout(t);
    t=setTimeout(()=>{
      syncLiveFullscreenModeClasses();
      if(document.body.classList.contains("bpt-mobile-live-fullscreen") && !bptMobileFullscreenTransition){
        liveRenderTimerOnly();
      }
    },220);
  }
  window.addEventListener("resize",stable,{passive:true});
  window.addEventListener("orientationchange",stable,{passive:true});
  if(window.visualViewport)window.visualViewport.addEventListener("resize",stable,{passive:true});
})();
