
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
