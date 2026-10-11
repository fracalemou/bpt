
(function(){
  function clean(){
    try{
      if(window.db && typeof db==="object"){
        db.liveState=null;
        if(typeof saveLocalOnly==="function")saveLocalOnly();
      }
    }catch(_e){}
    try{
      if(typeof stopLiveCloudHeartbeat==="function")stopLiveCloudHeartbeat();
      if(typeof stopSpectatorLivePolling==="function")stopSpectatorLivePolling();
    }catch(_e){}
    try{
      if(typeof bptDirectLiveRef!=="undefined" && bptDirectLiveRef){
        bptDirectLiveRef.off("value");
        bptDirectLiveRef=null;
      }
      if(typeof bptDirectLivePollTimer!=="undefined" && bptDirectLivePollTimer){
        clearInterval(bptDirectLivePollTimer);
        bptDirectLivePollTimer=null;
      }
    }catch(_e){}
    document.querySelector('nav button[data-view="live"]')?.remove();
    const live=document.getElementById("live");
    if(live)live.style.display="none";
    const hand=document.getElementById("globalHandoverRequest");
    if(hand)hand.style.display="none";
    document.body.classList.remove("spectator-live-open","bpt-mobile-live-fullscreen","live-fullscreen-open");
  }
  window.addEventListener("DOMContentLoaded",()=>{clean();setTimeout(clean,500);setTimeout(clean,1800);});
  window.addEventListener("pageshow",clean);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)clean();});
})();
