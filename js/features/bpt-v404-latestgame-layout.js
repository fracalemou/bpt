
(function(){
  function applyLatestGameLayout(){
    const root=document.getElementById("latestgame");
    if(!root)return;

    const cards=[...root.querySelectorAll(".card,.premium-panel")];
    cards.forEach(card=>{
      const txt=(card.querySelector("h1,h2,h3,h4")?.textContent||"").trim().toLowerCase();
      if(txt.includes("accomplissement")){
        card.classList.add("bpt-accomplishments-full","span12");
      }
      if(txt.includes("ce qui change au classement")){
        card.classList.add("bpt-ranking-changes-full","span12");
      }
    });
  }

  document.addEventListener("DOMContentLoaded",applyLatestGameLayout);

  const observer=new MutationObserver(()=>{
    try{applyLatestGameLayout();}catch(_e){}
  });

  document.addEventListener("DOMContentLoaded",()=>{
    const root=document.getElementById("latestgame");
    if(root)observer.observe(root,{childList:true,subtree:true});
  });
})();
