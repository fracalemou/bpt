
(function(){
  let lockedLiveKey='';
  let lockedLiveRole='';

  function activeLiveForRole(){
    const direct=(window.spectatorServerLiveState && spectatorServerLiveState.prepared && !spectatorServerLiveState.synced)
      ? spectatorServerLiveState : null;
    const local=(window.db && db.liveState && db.liveState.prepared && !db.liveState.synced)
      ? db.liveState : null;
    return direct || local || null;
  }

  function liveKeyOf(state){
    if(!state || !state.prepared || state.synced)return '';
    return [String(state.creatorDeviceId||''),String(state.gameNo||''),String(state.startedAt||state.date||'')].join('|');
  }

  function resolveLockedRole(){
    const state=activeLiveForRole();
    const key=liveKeyOf(state);
    if(!key){
      lockedLiveKey='';
      lockedLiveRole='';
      return '';
    }
    if(key!==lockedLiveKey){
      lockedLiveKey=key;
      const creator=String(state.creatorDeviceId||'');
      lockedLiveRole=(creator && creator!==liveDeviceId()) ? 'spectator' : 'creator';
    }
    return lockedLiveRole;
  }

  window.liveIsSpectator=function(){ return resolveLockedRole()==='spectator'; };
  window.liveIsCreator=function(){
    const role=resolveLockedRole();
    return role ? role==='creator' : true;
  };

  window.bptHasActiveLive=function(){
    const remote=(typeof spectatorServerLiveState!=="undefined" &&
      spectatorServerLiveState?.prepared && !spectatorServerLiveState?.synced)
      ? spectatorServerLiveState : null;
    const local=(typeof db!=="undefined" &&
      db?.liveState?.prepared && !db?.liveState?.synced)
      ? db.liveState : null;
    return !!(remote || local);
  };

  window.bptUpdateLiveNavIndicator=function(){
    const nav=document.querySelector('nav button[data-view="live"]');
    if(!nav)return;
    const spectator=window.liveIsSpectator();
    const active=window.bptHasActiveLive();
    nav.textContent='Live';
    nav.classList.toggle('spectator-nav',spectator);
    nav.classList.toggle('live-running',active);
    nav.setAttribute('aria-label', active ? 'Live en cours' : 'Live');
    nav.title = active ? 'Un live est en cours' : 'Live';
  };

  window.bptRefreshLiveNavRole=function(){
    window.bptUpdateLiveNavIndicator();
  };

  // Toute synchro, resize ou changement d'orientation réapplique le rôle verrouillé.
  ['resize','orientationchange'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(window.bptRefreshLiveNavRole,0),{passive:true}));
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden)setTimeout(window.bptRefreshLiveNavRole,0); });
  setInterval(window.bptRefreshLiveNavRole,1000);
  setTimeout(window.bptRefreshLiveNavRole,0);
})();
