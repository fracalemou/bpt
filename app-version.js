
function isBptMobileDevice(){
  return document.documentElement.classList.contains("bpt-mobile-device")
    || document.body.classList.contains("bpt-mobile-device")
    || (window.matchMedia && window.matchMedia("(max-width:700px)").matches);
}

const BPT_APP_VERSION="10.4.14";
function updateBptSettingsVersion(){
  const el=document.getElementById("settingsVersionInfo");
  if(el)el.textContent=`Version BPT ${BPT_APP_VERSION}`;
  const headerEl=document.getElementById("headerAppVersion");
  if(headerEl)headerEl.textContent=`BPT v${BPT_APP_VERSION}`;
  if(typeof renderConnectedIdentityBadge==='function')renderConnectedIdentityBadge();
}
window.addEventListener("resize",updateBptSettingsVersion,{passive:true});
window.addEventListener("orientationchange",updateBptSettingsVersion,{passive:true});
document.addEventListener("DOMContentLoaded",updateBptSettingsVersion);
setTimeout(updateBptSettingsVersion,0);

function updateFirebaseDiagnostic(){
  const stateEl=document.getElementById("firebaseDiagnosticState");
  const projectEl=document.getElementById("firebaseDiagnosticProject");
  if(!stateEl||!projectEl)return;

  const cfg=window.BPT_FIREBASE_CONFIG||{};
  projectEl.textContent=cfg.projectId||"—";

  if(!navigator.onLine){
    stateEl.textContent="Hors connexion";
  }else if(typeof cloudReady!=="undefined" && cloudReady){
    stateEl.textContent="Connecté";
  }else if(typeof cloudLastError!=="undefined" && cloudLastError){
    stateEl.textContent="Erreur";
    stateEl.title=String(cloudLastError);
  }else{
    stateEl.textContent="Connexion…";
  }

  const modeEl=document.getElementById("firebaseDiagnosticMode");
  const liveEl=document.getElementById("firebaseDiagnosticLive");
  const syncEl=document.getElementById("firebaseDiagnosticLastSync");
  const gameEl=document.getElementById("firebaseDiagnosticLastGame");
  const versionEl=document.getElementById("firebaseDiagnosticVersion");

  if(modeEl){
    let mode="Organisateur";
    try{
      if(typeof liveIsSpectator==="function" && liveIsSpectator())mode="Spectateur";
    }catch(_e){}
    modeEl.textContent=mode;
  }

  if(liveEl){
    const live=db?.liveState;
    liveEl.textContent=live && live.active!==false
      ? `Partie #${live.gameNo||"—"} · actif`
      : "Aucun Live actif";
  }

  if(syncEl){
    const ts=window.BPT_LAST_SYNC_AT;
    syncEl.textContent=ts
      ? new Date(ts).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})
      : "Pas encore confirmée";
  }

  if(gameEl){
    const nums=(Array.isArray(db?.history)?db.history:[])
      .map(r=>Number(r?.game))
      .filter(Number.isFinite);
    gameEl.textContent=nums.length ? `#${Math.max(...nums)}` : "Aucune";
  }

  if(versionEl)versionEl.textContent=`BPT ${BPT_APP_VERSION}`;
}
document.addEventListener("DOMContentLoaded",()=>{updateFirebaseDiagnostic();setInterval(updateFirebaseDiagnostic,1500);});
window.addEventListener("online",updateFirebaseDiagnostic);
window.addEventListener("offline",updateFirebaseDiagnostic);

function simplifyRecordTextForMobile(text){
  if(!isBptMobileDevice())return String(text||"");
  let s=String(text||"").trim();
  s=s.replace(/\s*[·•]\s*saison\s*\d{4}\s*[–-]\s*\d{4}/gi, "");
  s=s.replace(/\s*[·•]\s*partie\s*#?\d+/gi, "");
  s=s.replace(/\s*[·•]\s*joueur le plus performant sur les 3 dernières parties/gi, "");
  s=s.replace(/\s{2,}/g, " ").trim();
  return s;
}
