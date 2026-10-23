
(function(){
  let deferredPrompt=null;
  let waitingWorker=null;
  let registration=null;
  let refreshing=false;

  const isIos=()=>/iphone|ipad|ipod/i.test(navigator.userAgent||"");
  const isStandalone=()=>(
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone===true
  );

  function actionBox(){
    return document.getElementById("bptAppAction");
  }

  function actionBtn(){
    return document.getElementById("bptAppActionBtn");
  }

  // 10.4.25 : sur téléphone, « Installer » passe dans le menu Plus (plus de bouton en haut d'écran).
  function menuInstallBtn(){
    const menu=document.getElementById("bptMobileMoreTopMenu");
    if(!menu)return null;
    let b=document.getElementById("bptMenuInstallBtn");
    if(!b){
      b=document.createElement("button");
      b.type="button";b.id="bptMenuInstallBtn";b.hidden=true;
      b.textContent="📲 Installer l’application";
      b.addEventListener("click",()=>{menu.hidden=true;actionBtn()?.click();});
      menu.appendChild(b);
    }
    return b;
  }

  function showAction(label,mode){
    const box=actionBox();
    const btn=actionBtn();
    if(!box||!btn)return;
    btn.textContent=label;
    btn.dataset.mode=mode;
    box.dataset.mode=mode;
    box.style.display="block";
    const m=menuInstallBtn();if(m)m.hidden=mode!=="install";
  }

  function hideAction(){
    const box=actionBox();
    const btn=actionBtn();
    if(box){box.style.display="none";delete box.dataset.mode;}
    if(btn)delete btn.dataset.mode;
    const m=menuInstallBtn();if(m)m.hidden=true;
  }

  // 10.4.37 — Plus de bouton « Mettre à jour » : le service worker est en « réseau d'abord »
  // et s'active aussitôt, la nouvelle version est donc prise à chaque ouverture.
  // Reste la proposition d'installation, tant que l'appli n'est pas installée sur l'appareil.
  const INSTALL_DISMISS_KEY="bpt-install-dismissed";
  function installDismissed(){try{return localStorage.getItem(INSTALL_DISMISS_KEY)==="1";}catch(_e){return false;}}
  function installAvailable(){return !isStandalone() && (!!deferredPrompt || isIos());}
  function notifyInstallChange(){try{document.dispatchEvent(new CustomEvent("bpt-install-change"));}catch(_e){}}

  function syncActionState(){
    if(waitingWorker){
      // Nouvelle version prête : on l'active tout de suite (rechargement automatique).
      try{waitingWorker.postMessage({type:"SKIP_WAITING"});}catch(_e){}
      waitingWorker=null;
    }

    if(isStandalone()){
      hideAction();
      notifyInstallChange();
      return;
    }

    if(deferredPrompt || isIos()){
      showAction(installDismissed()?"":"📲 Installer BPT sur cet appareil","install");
      if(installDismissed()){const box=actionBox();if(box)box.style.display="none";}
      notifyInstallChange();
      return;
    }

    // Sur Chromium, si l'installation est déjà faite dans ce navigateur,
    // beforeinstallprompt ne se déclenche normalement pas.
    // On ne montre donc pas un faux bouton Installer tant que le navigateur
    // n'a pas confirmé que l'installation est possible.
    hideAction();
    notifyInstallChange();
  }

  async function promptInstall(){
    if(isIos()){
      const help=document.getElementById("bptIosInstallHelp");
      if(help)help.style.display="flex";
      return;
    }
    if(!deferredPrompt){syncActionState();return;}
    try{
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    }catch(_e){}
    deferredPrompt=null;
    syncActionState();
  }
  window.BPTInstall={available:installAvailable,prompt:promptInstall};

  async function registerServiceWorker(){
    if(!("serviceWorker" in navigator)){
      syncActionState();
      return;
    }

    try{
      registration=await navigator.serviceWorker.register("./service-worker.js",{scope:"./"});

      if(registration.waiting){
        waitingWorker=registration.waiting;
        syncActionState();
      }

      registration.addEventListener("updatefound",()=>{
        const worker=registration.installing;
        if(!worker)return;

        worker.addEventListener("statechange",()=>{
          if(worker.state==="installed" && navigator.serviceWorker.controller){
            waitingWorker=worker;
            syncActionState();
          }
        });
      });

      try{
        await registration.update();
      }catch(_e){}
    }catch(e){
      console.warn("PWA BPT :",e);
    }
  }

  window.addEventListener("beforeinstallprompt",e=>{
    e.preventDefault();
    deferredPrompt=e;
    syncActionState();
  });

  window.addEventListener("appinstalled",()=>{
    deferredPrompt=null;
    syncActionState();
  });

  if("serviceWorker" in navigator){
    // 10.4.84 — Pas de rechargement au démarrage : la page vient d'être chargée depuis le réseau (HTML « réseau d'abord »,
    // fichiers ?v= de la nouvelle version), elle est déjà à jour. Avant, la prise de contrôle par le service worker
    // (première visite, et chaque ouverture après une mise à jour) rechargeait l'accueil une seconde fois.
    // On ne recharge que si l'appli était déjà ouverte depuis un moment avec une version précédente.
    const hadController=!!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener("controllerchange",()=>{
      if(refreshing)return;
      if(!hadController||performance.now()<20000)return;
      refreshing=true;
      location.reload();
    });
  }

  document.addEventListener("click",async e=>{
    if(e.target?.closest?.("#bptIosInstallClose")){
      const help=document.getElementById("bptIosInstallHelp");
      if(help)help.style.display="none";
      return;
    }

    if(e.target?.closest?.("#bptAppActionClose")){
      try{localStorage.setItem(INSTALL_DISMISS_KEY,"1");}catch(_e){}
      const box=actionBox();if(box)box.style.display="none";
      return;
    }

    const btn=e.target?.closest?.("#bptAppActionBtn");
    if(!btn)return;

    const mode=btn.dataset.mode;

    if(mode==="update"){
      if(waitingWorker){
        waitingWorker.postMessage({type:"SKIP_WAITING"});
      }else if(registration){
        try{
          await registration.update();
        }catch(_e){}
        location.reload();
      }else{
        location.reload();
      }
      return;
    }

    if(mode==="install")await promptInstall();
  });

  document.addEventListener("DOMContentLoaded",()=>{
    syncActionState();
  });

  window.addEventListener("load",registerServiceWorker,{once:true});
})();
