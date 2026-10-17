
(function(){
  // 10.4.33 : icônes SVG au même trait (au lieu de symboles ⌂ ◷ ♛ qui varient selon l'appareil)
  const ICONS = {
    dashboard:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>',
    live3:'<circle cx="12" cy="12" r="3.2" fill="currentColor"/><path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4"/>',
    latestgame:'<rect x="4" y="3.5" width="12" height="16" rx="2"/><path d="M8 3.5V2.5M8 8h4M8 11.5h4"/><path d="M16 7.5h2.5a1.5 1.5 0 0 1 1.5 1.5v10.5a1.5 1.5 0 0 1-1.5 1.5H9.5"/>',
    ranking:'<path d="M7 20.5h10"/><path d="M12 16.5v4"/><path d="M7 4.5h10v5a5 5 0 0 1-10 0z"/><path d="M7 6.5H4.5a2.5 2.5 0 0 0 2.6 4M17 6.5h2.5a2.5 2.5 0 0 1-2.6 4"/>',
    records:'<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    profile:'<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    agenda:'<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
    seasons:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    more:'<path d="M4 6.5h16M4 12h16M4 17.5h16"/>'
  };
  const svg = key => ICONS[key] ? `<svg class="bpt-ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[key]}</svg>` : '';
  window.bptNavIcon = svg;

  const desktopLabels = {
    dashboard:'Accueil',
    live3:'Live',
    latestgame:'Parties',
    ranking:'Classements',
    agenda:'Agenda',
    records:'Records & accomplissements',
    seasons:'Saisons',
    profile:'Profil joueur',
    settings:'Paramètres'
  };
  const mobileLabels = {
    dashboard:'Accueil',
    live3:'Live',
    latestgame:'Parties',
    ranking:'Classement',
    records:'Records',
    seasons:'Saisons',
    profile:'Profil',
    settings:'Réglages'
  };

  function applyBptMobileOrientation(){
    const isMobile = document.documentElement.classList.contains('bpt-mobile-device') || document.body.classList.contains('bpt-mobile-device');
    const portrait = window.matchMedia && window.matchMedia('(orientation: portrait)').matches;
    document.documentElement.classList.toggle('bpt-mobile-portrait', !!(isMobile && portrait));
    document.documentElement.classList.toggle('bpt-mobile-landscape', !!(isMobile && !portrait));
    document.body.classList.toggle('bpt-mobile-portrait', !!(isMobile && portrait));
    document.body.classList.toggle('bpt-mobile-landscape', !!(isMobile && !portrait));

    document.querySelectorAll('nav#nav button[data-view]').forEach(btn=>{
      const key = btn.getAttribute('data-view') || '';
      const label = (isMobile ? mobileLabels[key] : desktopLabels[key]);
      if(!label)return;
      const html = isMobile
        ? '<span class="bpt-nav-ico">'+svg(key)+'</span><span class="bpt-nav-txt">'+label+'</span>'   // barre du bas : icône au-dessus du libellé
        : svg(key)+'<span>'+label+'</span>';
      if(btn.dataset.bptNav!==html){btn.innerHTML=html;btn.dataset.bptNav=html;}
    });
    const more=document.getElementById('bptMobileMoreTopBtn');
    if(more){
      const html=isMobile?'<span class="bpt-nav-ico">'+svg('more')+'</span><span class="bpt-nav-txt">Plus</span>':svg('more')+'<span>Plus</span>';
      if(more.dataset.bptNav!==html){more.innerHTML=html;more.dataset.bptNav=html;}
    }
    document.querySelectorAll('#bptMobileMoreTopMenu [data-mobile-nav-view]').forEach(b=>{
      const key=b.dataset.mobileNavView,label=desktopLabels[key]&&key!=='records'?(mobileLabels[key]||desktopLabels[key]):(mobileLabels[key]||b.textContent);
      const html=svg(key)+'<span>'+label+'</span>';
      if(b.dataset.bptNav!==html){b.innerHTML=html;b.dataset.bptNav=html;}
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applyBptMobileOrientation);
  } else {
    applyBptMobileOrientation();
  }
  window.addEventListener('resize', applyBptMobileOrientation, {passive:true});
  window.addEventListener('orientationchange', applyBptMobileOrientation, {passive:true});

  // 10.4.33 : chiffres clés de l'Accueil qui « défilent » jusqu'à leur valeur
  function countUp(){
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    document.querySelectorAll('#dashboard.active .premium-hero-metric strong, #dashboard.active .premium-hero-metric b').forEach(el=>{
      const target=Number(String(el.textContent).replace(/\s/g,''));
      if(!Number.isFinite(target)||target<=0||el.dataset.bptCounted===String(target))return;
      el.dataset.bptCounted=String(target);
      const t0=performance.now(),d=700;
      const step=t=>{const p=Math.min(1,(t-t0)/d);el.textContent=String(Math.round(target*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(step);};
      requestAnimationFrame(step);
    });
  }
  setTimeout(countUp,600);
  document.addEventListener('click',e=>{if(e.target?.closest?.('[data-view="dashboard"]'))setTimeout(countUp,350);});
})();
