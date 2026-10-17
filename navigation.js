
(function(){
  const desktopLabels = {
    dashboard:'⌂ Accueil',
    latestgame:'◷ Parties',
    ranking:'♛ Classements',
    agenda:'📅 Agenda',
    records:'★ Records & accomplissements',
    seasons:'▦ Saisons',
    profile:'♤ Profil joueur',
    settings:'⚙ Paramètres'
  };
  const mobileLabels = {
    dashboard:'⌂ Accueil',
    live3:'● Live',
    latestgame:'◷ Parties',
    ranking:'♛ Classement',
    records:'★ Records',
    seasons:'▦ Saisons',
    profile:'♤ Profil',
    settings:'⚙ Réglages'
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
      if(isMobile){
        // 10.4.25 : barre du bas sur téléphone — icône au-dessus du libellé
        const label=mobileLabels[key];
        if(!label)return;
        const i=label.indexOf(' ');
        btn.innerHTML='<span class="bpt-nav-ico">'+label.slice(0,i)+'</span><span class="bpt-nav-txt">'+label.slice(i+1)+'</span>';
        return;
      }
      if(key==='live3'){ if(btn.querySelector('.bpt-nav-ico'))btn.textContent='● Live'; return; }
      const label=desktopLabels[key] || btn.textContent;
      btn.textContent = label;
    });
    const more=document.getElementById('bptMobileMoreTopBtn');
    if(more)more.innerHTML=isMobile?'<span class="bpt-nav-ico">☰</span><span class="bpt-nav-txt">Plus</span>':'☰ Plus';
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applyBptMobileOrientation);
  } else {
    applyBptMobileOrientation();
  }
  window.addEventListener('resize', applyBptMobileOrientation, {passive:true});
  window.addEventListener('orientationchange', applyBptMobileOrientation, {passive:true});
})();
