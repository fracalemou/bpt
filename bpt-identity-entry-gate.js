
(function(){
  function launch(){
    setTimeout(()=>{
      try{
        if(typeof requireIdentityOnSiteEntry==="function"){
          requireIdentityOnSiteEntry();
        }else if(typeof openSpectatorIdentity==="function"){
          openSpectatorIdentity(true);
        }
      }catch(e){
        console.warn("Ouverture identification BPT :",e);
      }
    },250);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",launch,{once:true});
  }else{
    launch();
  }

  window.addEventListener("pageshow",()=>{
    setTimeout(()=>{
      try{
        if(typeof requireIdentityOnSiteEntry==="function")requireIdentityOnSiteEntry();
      }catch(_e){}
    },100);
  });
})();
