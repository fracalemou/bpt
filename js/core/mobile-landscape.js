
(function(){
  const btn=document.getElementById("mobileLandscapeTryBtn");
  if(!btn)return;

  btn.addEventListener("click",async()=>{
    try{
      if(document.documentElement.requestFullscreen && !document.fullscreenElement){
        await document.documentElement.requestFullscreen();
      }
      if(screen.orientation && screen.orientation.lock){
        await screen.orientation.lock("landscape");
      }
    }catch(e){
      // Certains navigateurs refusent le verrouillage hors application installée/fullscreen.
      // L'overlay portrait reste alors affiché jusqu'à rotation manuelle.
      console.warn("Orientation paysage non verrouillable :",e);
    }
  });
})();
