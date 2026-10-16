
(function(){
  const desktopLabels = {
    dashboard:'⌂ Accueil',
    latestgame:'◷ Parties',
    ranking:'♛ Classements',
    records:'★ Records & accomplissements',
    seasons:'▦ Saisons',
    profile:'♤ Profil joueur',
    settings:'⚙ Paramètres'
  };
  const mobileLabels = {
    dashboard:'⌂ Accueil',
    latestgame:'◷ Parties',
    ranking:'♛ Classements',
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
      const label=(isMobile ? mobileLabels[key] : desktopLabels[key]) || btn.textContent;
      btn.textContent = label;
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applyBptMobileOrientation);
  } else {
    applyBptMobileOrientation();
  }
  window.addEventListener('resize', applyBptMobileOrientation, {passive:true});
  window.addEventListener('orientationchange', applyBptMobileOrientation, {passive:true});
})();
