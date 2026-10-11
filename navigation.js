
(function(){
  const desktopLabels = {
    live:'Live',
    dashboard:'⌂ Accueil',
    latestgame:'◷ Parties',
    ranking:'♛ Classements',
    records:'★ Records & accomplissements',
    profile:'♤ Profil joueur',
    settings:'⚙ Paramètres'
  };
  const mobileLabels = {
    live:'Live',
    dashboard:'⌂ Accueil',
    latestgame:'◷ Parties',
    ranking:'♛ Classements',
    records:'★ Records',
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
      let label=(isMobile ? mobileLabels[key] : desktopLabels[key]) || btn.textContent;
      if(key==='live' && typeof liveIsSpectator==='function' && liveIsSpectator()){
        label='Live';
      }
      btn.textContent = label;
    });
    if(typeof window.bptUpdateLiveNavIndicator==='function')window.bptUpdateLiveNavIndicator();

    const title = document.getElementById('liveHeroTitle');
    if(title){ title.textContent = isMobile ? 'Live BPT' : 'Gestion de la partie en direct'; }
    const subtitle = document.getElementById('liveHeroSubtitle');
    if(subtitle){ subtitle.style.display = isMobile ? 'none' : ''; }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applyBptMobileOrientation);
  } else {
    applyBptMobileOrientation();
  }
  window.addEventListener('resize', applyBptMobileOrientation, {passive:true});
  window.addEventListener('orientationchange', applyBptMobileOrientation, {passive:true});
})();
