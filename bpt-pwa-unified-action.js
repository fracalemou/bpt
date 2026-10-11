
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

  function showAction(label,mode){
    const box=actionBox();
    const btn=actionBtn();
    if(!box||!btn)return;
    btn.textContent=label;
    btn.dataset.mode=mode;
    box.style.display="block";
  }

  function hideAction(){
    const box=actionBox();
    const btn=actionBtn();
    if(box)box.style.display="none";
    if(btn)delete btn.dataset.mode;
  }

  function syncActionState(){
    if(waitingWorker){
      showAction("Mettre à jour","update");
      return;
    }

    if(isStandalone()){
      hideAction();
      return;
    }

    if(deferredPrompt || isIos()){
      showAction("Installer l’application","install");
      return;
    }

    // Sur Chromium, si l'installation est déjà faite dans ce navigateur,
    // beforeinstallprompt ne se déclenche normalement pas.
    // On ne montre donc pas un faux bouton Installer tant que le navigateur
    // n'a pas confirmé que l'installation est possible.
    hideAction();
  }

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
    navigator.serviceWorker.addEventListener("controllerchange",()=>{
      if(refreshing)return;
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

    if(mode==="install"){
      if(isIos()){
        const help=document.getElementById("bptIosInstallHelp");
        if(help)help.style.display="flex";
        return;
      }

      if(!deferredPrompt){
        syncActionState();
        return;
      }

      try{
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      }catch(_e){}

      deferredPrompt=null;
      syncActionState();
    }
  });

  document.addEventListener("DOMContentLoaded",()=>{
    syncActionState();
  });

  window.addEventListener("load",registerServiceWorker,{once:true});
})();
