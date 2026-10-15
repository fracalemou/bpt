(function(){
  'use strict';
  const MOBILE_MAX=1000;
  let raf=0;

  function viewport(){
    const vv=window.visualViewport;
    return {
      top: vv ? vv.offsetTop : 0,
      height: vv ? vv.height : window.innerHeight
    };
  }

  function usableHeight(el){
    if(!el) return 0;
    const v=viewport();
    const rect=el.getBoundingClientRect();
    const bottom=v.top+v.height;
    const top=Math.max(rect.top,v.top);
    return Math.max(150,Math.floor(bottom-top-3));
  }

  function setHeight(el){
    if(!el) return;
    const h=usableHeight(el);
    el.style.setProperty('--bpt-prelive-height',h+'px');
    el.style.height=h+'px';
    el.style.maxHeight=h+'px';
  }

  function fitPlayers(){
    const picker=document.getElementById('live3PlayerPicker');
    if(!picker || !picker.offsetParent) return;
    const items=[...picker.children].filter(el=>el.offsetParent!==null);
    const count=items.length;
    if(!count) return;
    const landscape=matchMedia('(orientation: landscape)').matches;
    const holder=document.getElementById('live3PrepStep2');
    const h=Math.max(80,holder?.clientHeight||200);
    const reserve=landscape?70:105;
    const gridH=Math.max(55,h-reserve);
    let cols=landscape?Math.ceil(count/3):Math.ceil(count/6);
    cols=Math.max(landscape?3:2,Math.min(landscape?7:4,cols));
    const rows=Math.ceil(count/cols);
    const row=Math.max(24,Math.min(landscape?31:34,Math.floor((gridH-(rows-1)*4)/rows)));
    picker.style.setProperty('--bpt-player-cols',String(cols));
    picker.style.setProperty('--bpt-player-row',row+'px');
  }

  function fit(){
    raf=0;
    document.documentElement.style.setProperty('--bpt-visual-height',Math.floor(viewport().height)+'px');
    if(innerWidth>MOBILE_MAX) return;

    const prep=document.getElementById('live3Prep');
    if(prep && prep.offsetParent){
      setHeight(prep);
      const wizard=prep.querySelector('.bpt-live3-prep-wizard');
      if(wizard){wizard.style.height='100%';wizard.style.maxHeight='100%';}
      fitPlayers();
    }

    document.querySelectorAll('.bpt484-live.is-pregame').forEach(root=>{
      if(!root.offsetParent) return;
      setHeight(root);
    });
  }

  function schedule(){
    if(raf) cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>requestAnimationFrame(fit));
  }

  addEventListener('resize',schedule,{passive:true});
  addEventListener('orientationchange',schedule,{passive:true});
  visualViewport?.addEventListener('resize',schedule,{passive:true});
  visualViewport?.addEventListener('scroll',schedule,{passive:true});
  document.addEventListener('DOMContentLoaded',schedule,{once:true});
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','style']});
  setTimeout(schedule,50);
  setTimeout(schedule,300);
})();
