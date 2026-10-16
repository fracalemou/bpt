
(function(){
  function mobileMode(){
    return document.documentElement.classList.contains("bpt-mobile-device") ||
           document.body?.classList.contains("bpt-mobile-device") ||
           window.matchMedia("(max-width:900px)").matches;
  }

  function menu(){
    return document.getElementById("bptMobileMoreTopMenu");
  }

  function closeMenu(){
    const m=menu();
    if(m)m.hidden=true;
  }

  function toggleMenu(){
    if(!mobileMode())return;
    const m=menu();
    if(m)m.hidden=!m.hidden;
  }

  document.addEventListener("click",e=>{
    const plus=e.target?.closest?.("#bptMobileMoreTopBtn");
    if(plus){
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
      return;
    }

    const item=e.target?.closest?.("[data-mobile-nav-view]");
    if(item && mobileMode()){
      e.preventDefault();
      const view=item.dataset.mobileNavView;
      closeMenu();
      const native=document.querySelector(`#nav button[data-view="${view}"]`);
      if(native)native.click();
      return;
    }

    if(!e.target?.closest?.("#bptMobileMoreTopMenu")){
      closeMenu();
    }
  });

  window.addEventListener("orientationchange",closeMenu);
  window.addEventListener("resize",()=>{
    if(!mobileMode())closeMenu();
  });
})();
