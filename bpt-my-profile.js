/* BPT 10.4.34 — Bloc « Mon profil » en tête de Paramètres.
   Réservé au joueur connecté avec son code : il change son surnom et son code.
   (Le nom n'est pas modifiable ici : il sert de clé à tout l'historique.)
   Le thème de couleurs, lui, est proposé à tous : il est propre à l'appareil (localStorage). */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let lastSig='',lastStatus='';

  function api(){return window.BPTLive3||null;}
  function me(){try{return String(api()?.getVerifiedIdentityName?.()||'').trim();}catch(_e){return '';}}
  function myNickname(name){
    try{
      const p=(typeof db!=='undefined'?db?.players:[]||[]).find(x=>String(x?.name||'').trim().toLocaleLowerCase('fr')===name.toLocaleLowerCase('fr'));
      return String(p?.nickname||'').trim();
    }catch(_e){return '';}
  }
  const THEMES=[
    {id:'nuit',label:'Bleu nuit',bg:'#0f1426',accent:'#2ac9c2'},
    {id:'tapis',label:'Tapis vert',bg:'#0b1a13',accent:'#3ccf8e'},
    {id:'cognac',label:'Cognac',bg:'#16110c',accent:'#f0a04b'},
    {id:'graphite',label:'Graphite',bg:'#111214',accent:'#4fb3e8'},
    {id:'royal',label:'Violet royal',bg:'#150f26',accent:'#b38cf5'}
  ];
  function currentTheme(){try{const t=localStorage.getItem('bpt-theme');return THEMES.some(x=>x.id===t)?t:'nuit';}catch(_e){return 'nuit';}}
  function applyTheme(id){
    const t=THEMES.find(x=>x.id===id)||THEMES[0];
    if(t.id==='nuit')document.documentElement.removeAttribute('data-bpt-theme');
    else document.documentElement.setAttribute('data-bpt-theme',t.id);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',t.bg);
    try{localStorage.setItem('bpt-theme',t.id);}catch(_e){}
  }
  function themeRow(){
    const cur=currentTheme();
    return `<div class="bpt-mp-row">
        <label>Thème de couleurs</label>
        <div class="bpt-mp-themes" role="radiogroup" aria-label="Thème de couleurs">${THEMES.map(t=>`<button type="button" class="bpt-mp-theme${t.id===cur?' is-active':''}" data-bpt-theme-pick="${t.id}" role="radio" aria-checked="${t.id===cur}"><span class="bpt-mp-swatch" style="background:linear-gradient(135deg,${t.bg} 50%,${t.accent} 50%)"></span>${esc(t.label)}</button>`).join('')}</div>
        <small class="bpt-mp-help">S’applique à cet appareil uniquement.</small>
      </div>`;
  }
  function bindThemes(box){
    box.querySelectorAll('[data-bpt-theme-pick]').forEach(btn=>btn.onclick=()=>{
      applyTheme(btn.dataset.bptThemePick);
      box.querySelectorAll('[data-bpt-theme-pick]').forEach(b=>{const on=b===btn;b.classList.toggle('is-active',on);b.setAttribute('aria-checked',String(on));});
    });
  }
  // 10.4.37 — Proposition d'installation (si l'appli n'est pas encore installée sur l'appareil).
  function installRow(){
    if(!window.BPTInstall?.available?.())return '';
    return `<div class="bpt-mp-row">
        <label>Application</label>
        <div class="bpt-mp-field"><button type="button" class="btn ghost" id="bptMyInstallBtn">📲 Installer BPT sur cet appareil</button></div>
        <small class="bpt-mp-help">Icône sur l’écran d’accueil ou le Bureau, ouverture en plein écran. Les mises à jour se font toutes seules à l’ouverture.</small>
      </div>`;
  }
  function bindInstall(){const b=$('bptMyInstallBtn');if(b)b.onclick=()=>window.BPTInstall?.prompt?.();}
  function avatar(name){try{return typeof bptAvatarHtml==='function'?bptAvatarHtml(name,'lg'):'';}catch(_e){return '';}}

  function render(force){
    const box=$('bptMyProfile');if(!box)return;
    const name=me();
    const sig=name+'|'+(name?myNickname(name):'')+'|'+(window.BPTInstall?.available?.()?1:0);
    if(!force&&sig===lastSig)return;
    if(box.contains(document.activeElement)&&document.activeElement.tagName==='INPUT')return; // saisie en cours
    lastSig=sig;
    if(!name){
      box.innerHTML=`<h3>👤 Mon profil</h3><p class="bpt-mp-help">Connectez-vous avec votre nom et votre code pour modifier votre surnom ou votre code.</p>
        <div class="bpt-mp-row"><button type="button" class="btn" id="bptMyLoginBtn">👤 Se connecter</button></div>${themeRow()}${installRow()}`;
      bindThemes(box);bindInstall();
      $('bptMyLoginBtn').onclick=()=>api()?.openIdentity?.();
      return;
    }
    const nick=myNickname(name);
    box.innerHTML=`<div class="bpt-mp-head">${avatar(name)}<div><div class="bpt-mp-kicker">Mon profil</div><h3>${esc(name)}</h3>
        <div class="bpt-mp-help">${nick?`Surnom actuel : <b>${esc(nick)}</b>`:'Pas encore de surnom'}</div></div></div>
      <div class="bpt-mp-row">
        <label for="bptMyNick">Surnom</label>
        <div class="bpt-mp-field"><input id="bptMyNick" type="text" maxlength="30" value="${esc(nick)}" placeholder="Ex. Le Dealer" autocomplete="off">
        <button type="button" class="btn bpt-mp-save" id="bptMyNickSave">Enregistrer</button></div>
        <small class="bpt-mp-help" id="bptMyNickStatus">${lastStatus||'Le surnom s’affiche à côté de votre nom partout dans l’appli.'}</small>
      </div>
      <div class="bpt-mp-row">
        <label>Code personnel</label>
        <div class="bpt-mp-field"><button type="button" class="btn ghost" id="bptMyCodeBtn">🔒 Changer mon code</button></div>
        <small class="bpt-mp-help">Votre ancien code vous sera demandé.</small>
      </div>
      ${themeRow()}
      ${installRow()}
      <div class="bpt-mp-row bpt-mp-logout"><button type="button" class="btn ghost" id="bptMyLogoutBtn">⏻ Se déconnecter</button>
        <small class="bpt-mp-help">Votre code sera redemandé à la prochaine connexion sur cet appareil.</small></div>`;
    bindThemes(box);bindInstall();
    $('bptMyLogoutBtn').onclick=async()=>{if(!confirm('Se déconnecter de BPT sur cet appareil ?'))return;await api()?.logoutIdentity?.();lastSig='';render(true);};
    $('bptMyNickSave').onclick=async()=>{
      const btn=$('bptMyNickSave'),st=$('bptMyNickStatus'),val=$('bptMyNick').value;
      btn.disabled=true;st.textContent='Enregistrement…';
      try{const saved=await api().setMyNickname(val);lastStatus=saved?`✓ Surnom enregistré : ${esc(saved)}`:'✓ Surnom retiré';st.innerHTML=lastStatus;lastSig='';setTimeout(()=>render(true),1200);}
      catch(e){st.textContent='✖ '+(e?.message||'Enregistrement impossible.');}
      finally{btn.disabled=false;}
    };
    $('bptMyNick').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('bptMyNickSave').click();}});
    $('bptMyCodeBtn').onclick=()=>api()?.openProfileCodeChange?.();
  }

  // 10.4.36 — Clic sur le nom connecté (en-tête) : ouvre Paramètres > Mon profil.
  function openMyProfile(){
    if(typeof showView==='function')showView('settings');
    setTimeout(()=>{render(true);$('bptMyProfile')?.scrollIntoView({behavior:'smooth',block:'start'});},120);
  }
  document.addEventListener('bpt-install-change',()=>render(true));
  function boot(){
    applyTheme(currentTheme());
    render(true);
    const idEl=$('bptConnectedIdentity');
    idEl?.addEventListener('click',()=>{if(idEl.textContent.trim())openMyProfile();});
    idEl?.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&idEl.textContent.trim()){e.preventDefault();openMyProfile();}});
    setInterval(()=>{if(document.querySelector('#settings.active'))render(false);},1500);
    document.addEventListener('click',e=>{if(e.target?.closest?.('[data-view="settings"],[data-mobile-nav-view="settings"]'))setTimeout(()=>render(true),200);});
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
  window.BPTMyProfile={render};
})();
