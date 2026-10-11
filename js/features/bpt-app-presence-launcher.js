
(function(){
  function launchPresence(){
    setTimeout(()=>{
      try{
        if(typeof installAppPresenceListener==="function")installAppPresenceListener();
        if(typeof loadConnectionHistory==="function")loadConnectionHistory();
        if(typeof identityConfirmedThisSession==="function" &&
           identityConfirmedThisSession() &&
           typeof logConnectionSession==="function"){
          logConnectionSession();
        }
        if(typeof identityConfirmedThisSession==="function" &&
           identityConfirmedThisSession() &&
           typeof startAppPresence==="function"){
          startAppPresence();
        }
      }catch(e){
        console.warn("Démarrage présence BPT :",e);
      }
    },700);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",launchPresence,{once:true});
  }else{
    launchPresence();
  }

  document.addEventListener("visibilitychange",()=>{
    if(!document.hidden){
      try{
        if(typeof identityConfirmedThisSession==="function" &&
           identityConfirmedThisSession() &&
           typeof startAppPresence==="function"){
          startAppPresence();
        }
      }catch(_e){}
    }
  });
})();
