// 10.4.173 — Écran TV (lot 1) : lien « …/?tv=1 » ouvert sur une TV, un PC branché sur la TV ou une tablette.
// Affichage du Live en grand, en LECTURE SEULE : aucun bouton, aucun clic transmis, pas de chat ni de fenêtres.
// Sans Live en cours : écran d'attente (heure + « En attente du prochain Live »), le Live s'affiche dès qu'il démarre.
// L'écran reste allumé (Wake Lock) et un clic/une touche passe en plein écran. Quitter : ouvrir le lien sans « ?tv=1 ».
(function(){
  'use strict';
  let on=false;try{on=new URLSearchParams(location.search).get('tv')==='1';}catch(_e){}
  // Lien unique et permanent (même lien pour toutes les parties) : adresse publique du site ; ailleurs (test local), adresse courante.
  const PUBLIC='https://fracalemou.github.io/bpt/?tv=1';
  let lock=null;
  window.BPTTv={active:on,awake:()=>!!(lock&&!lock.released),link:()=>{if(/github\.io$/i.test(location.hostname))return PUBLIC;const u=new URL(location.href);u.search='?tv=1';u.hash='';return u.href;}};
  if(!on)return;
  const root=document.documentElement;root.classList.add('bpt-tv');
  const $=id=>document.getElementById(id);
  const api=()=>window.BPTLive3||null;
  // Lecture seule : tout clic, saisie ou touche dans l'appli est arrêté avant d'atteindre ses gestionnaires
  // (seul effet conservé : passer en plein écran).
  const goFull=()=>{try{if(!document.fullscreenElement)root.requestFullscreen?.().catch(()=>{});}catch(_e){}};
  ['click','dblclick','pointerdown','mousedown','touchstart','submit','contextmenu'].forEach(t=>document.addEventListener(t,e=>{
    e.stopPropagation();if(e.cancelable&&t!=='touchstart'&&t!=='pointerdown'&&t!=='mousedown')e.preventDefault();if(t==='click')goFull();},true));
  document.addEventListener('keydown',e=>{if(e.key==='F11')return;e.stopPropagation();e.preventDefault();if(e.key==='Enter'||e.key===' ')goFull();},true);
  function waitBox(){
    let b=$('bptTvWait');if(b)return b;
    b=document.createElement('div');b.id='bptTvWait';b.className='bpt-tv-wait';
    b.innerHTML='<div class="bpt-tv-brand">BPT</div><div class="bpt-tv-clock" data-tv="clock">--:--</div><p>En attente du prochain Live…</p><small>Le Live s’affichera ici automatiquement dès son lancement.<br>Clique ou appuie sur OK pour passer en plein écran.</small>';
    document.body.appendChild(b);return b;
  }
  async function keepAwake(){
    if(!('wakeLock' in navigator)||document.visibilityState!=='visible'||(lock&&!lock.released))return;
    try{lock=await navigator.wakeLock.request('screen');lock.addEventListener?.('release',()=>{lock=null;});}catch(_e){lock=null;}
  }
  function tick(){
    if(!document.body)return;
    const x=api();let st=null;try{st=x?.getState?.()||null;}catch(_e){}
    const live=!!st?.active,w=waitBox();
    w.hidden=live;
    if(!live){const d=new Date();const c=w.querySelector('[data-tv="clock"]');if(c)c.textContent=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
    const fs=$('live3Fullscreen');
    if(live&&fs&&!fs.classList.contains('open'))x?.openFullscreen?.();
    // Fenêtres ouvertes par l'appli (chat, dialogues, saisies) : jamais affichées sur la TV
    document.querySelectorAll('#bpt484Modal.open,#live3ChatModal.open').forEach(m=>m.classList.remove('open'));
    keepAwake();
  }
  function boot(){tick();setInterval(tick,1000);document.addEventListener('visibilitychange',keepAwake);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
