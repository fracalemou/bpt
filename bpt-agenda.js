/* BPT 10.4.31 — Agenda des parties (encart sur l'Accueil + calendrier).
   - Onglet « Agenda » : calendrier mensuel avec les parties proposées (à venir) et jouées (passées).
   - Tout joueur connecté peut proposer une partie (date, heure, lieu, durée, tapis) ;
     seul son auteur (ou le Dealer) peut la modifier / supprimer.
   - Réponses : Présent / Peut-être / Absent, modifiables à tout moment.
   - Bandeau d'invitation à l'ouverture de l'appli tant que le joueur n'a pas répondu.
   - Le jour de la partie, la préparation du Live est préremplie (lieu, date, durée, tapis,
     joueurs « présents » cochés).
   - Clic sur une partie passée : ouverture de son détail dans l'onglet Parties.
   Données : bpt/agenda_v2/{id} = {id,date,time,location,targetHours,startStack,createdBy,createdAt,responses:{nom:choix}} */
(function(){
  'use strict';
  const PATH='bpt/agenda_v2',CACHE='bpt_agenda_v2_cache',INVITE_DAYS=21;
  const CHOICES=[['present','✓ Présent'],['maybe','? Peut-être'],['absent','✕ Absent']];
  const CHOICE_LABEL={present:'Présents',maybe:'Peut-être',absent:'Absents',pending:'Sans réponse'};
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad=n=>String(n).padStart(2,'0');
  const isoOf=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const todayIso=()=>isoOf(new Date());
  const longDate=iso=>new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
  const shortDay=iso=>new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'});
  const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLocaleLowerCase('fr').trim();

  let events=[],cursor=null,selectedIso='',editing=false,bound=false,live=false;

  // ---------- Contexte appli ----------
  function me(){
    try{const n=String(window.BPTLive3?.getIdentityName?.()||'').trim();if(n)return n;}catch(_e){}
    try{return String(localStorage.getItem('bpt_live3_identity_name')||'').trim();}catch(_e){return '';}
  }
  function appDb(){try{return typeof db!=='undefined'?db:null;}catch(_e){return null;}}
  function activePlayers(){
    const d=appDb();
    return [...new Set((d?.players||[]).filter(p=>p&&p.name&&p.active!==false).map(p=>String(p.name).trim()))]
      .sort((a,b)=>a.localeCompare(b,'fr'));
  }
  function isDealer(){try{return typeof isDealerIdentity==='function'&&!!isDealerIdentity();}catch(_e){return false;}}
  function canEdit(e){const n=me();return !!n&&(norm(e.createdBy)===norm(n)||isDealer());}
  function fbRef(){try{return window.bptFirebaseDb?.()?.ref?.(PATH)||null;}catch(_e){return null;}}

  // Parties jouées (saison chargée), regroupées par date.
  function playedGames(){
    const d=appDb();const map=new Map();
    for(const r of (d?.history||[])){
      if(!r||!r.date||!r.game)continue;
      const key=`${r.season||''}|${r.game}`;
      if(!map.has(key))map.set(key,{date:String(r.date).slice(0,10),game:Number(r.game),season:r.season||'',location:r.location||'',rows:[]});
      map.get(key).rows.push(r);
    }
    return [...map.values()].map(g=>({...g,winner:g.rows.find(x=>Number(x.place)===1)?.player||'',players:g.rows.length}));
  }

  // ---------- Données ----------
  const normalize=v=>Object.entries(v||{}).map(([id,e])=>({...e,id:e?.id||id})).filter(e=>e&&e.date)
    .sort((a,b)=>String(a.date+(a.time||'')).localeCompare(String(b.date+(b.time||''))));
  function saveCache(){try{localStorage.setItem(CACHE,JSON.stringify(events));}catch(_e){}}
  function readCache(){try{return JSON.parse(localStorage.getItem(CACHE)||'[]');}catch(_e){return [];}}
  async function connect(){
    events=readCache();render();
    for(let i=0;i<40&&!fbRef();i++){
      try{await window.bptFirebaseEnsure?.();}catch(_e){}
      if(!fbRef())await new Promise(r=>setTimeout(r,500));
    }
    const ref=fbRef();if(!ref||live)return;
    live=true;
    ref.on('value',snap=>{events=normalize(snap.val());saveCache();render();});
  }
  async function saveEvent(e){
    const ref=fbRef();
    events=events.filter(x=>x.id!==e.id).concat(e);events=normalize(Object.fromEntries(events.map(x=>[x.id,x])));
    saveCache();render();
    if(ref)await ref.child(e.id).set(e);
  }
  async function removeEvent(e){
    const ref=fbRef();events=events.filter(x=>x.id!==e.id);saveCache();render();
    if(ref)await ref.child(e.id).remove();
  }
  async function respond(e,choice){
    const n=me();if(!n){alert('Connectez-vous avec votre nom de joueur pour répondre.');return;}
    e.responses={...(e.responses||{}),[n]:choice};
    const hb=$('bptAgendaHome');if(hb)delete hb.dataset.sig;
    const ref=fbRef();saveCache();render();
    if(ref)await ref.child(e.id).child('responses').child(n).set(choice);
  }

  function grouped(e){
    const r=e.responses||{};const out={present:[],maybe:[],absent:[],pending:[]};
    const answered=new Set();
    for(const [name,v] of Object.entries(r)){if(out[v]){out[v].push(name);answered.add(norm(name));}}
    for(const p of activePlayers())if(!answered.has(norm(p)))out.pending.push(p);
    for(const k of Object.keys(out))out[k].sort((a,b)=>a.localeCompare(b,'fr'));
    return out;
  }
  function myChoice(e){const n=norm(me());const hit=Object.entries(e.responses||{}).find(([k])=>norm(k)===n);return hit?hit[1]:'';}
  function nextInvite(){
    const n=me();if(!n)return null;
    const t=todayIso(),max=new Date();max.setDate(max.getDate()+INVITE_DAYS);const m=isoOf(max);
    return events.find(e=>e.date>=t&&e.date<=m&&!myChoice(e))||null;
  }
  function eventFor(iso){return events.find(e=>e.date===iso)||null;}
  function nextEvent(){
    const t=todayIso(),max=new Date();max.setDate(max.getDate()+INVITE_DAYS);const m=isoOf(max);
    return events.find(e=>e.date>=t&&e.date<=m)||null;
  }
  function whenLabel(iso){
    const t=todayIso(),tm=new Date();tm.setDate(tm.getDate()+1);
    if(iso===t)return 'ce soir';if(iso===isoOf(tm))return 'demain';return longDate(iso);
  }

  // ---------- Rendu : calendrier ----------
  function renderCalendar(){
    const host=$('bptAgendaDays');if(!host)return;
    const y=cursor.getFullYear(),m=cursor.getMonth(),t=todayIso();
    $('bptAgendaMonth').textContent=new Date(y,m,1).toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
    const played=playedGames();
    host.replaceChildren();
    const first=(new Date(y,m,1).getDay()+6)%7,last=new Date(y,m+1,0).getDate();
    for(let i=0;i<first;i++){const s=document.createElement('span');s.className='bpt-ag-day is-empty';host.append(s);}
    for(let d=1;d<=last;d++){
      const iso=`${y}-${pad(m+1)}-${pad(d)}`,e=eventFor(iso),g=played.find(x=>x.date===iso);
      const b=document.createElement('button');b.type='button';b.className='bpt-ag-day';
      if(iso===t)b.classList.add('is-today');
      if(iso<t)b.classList.add('is-past');
      if(e&&!g)b.classList.add('is-planned');
      if(g)b.classList.add('is-played');
      if(iso===selectedIso)b.classList.add('is-selected');
      const mine=e?myChoice(e):'';
      b.innerHTML=`<span class="bpt-ag-num">${d}</span>${g?'<span class="bpt-ag-tag">♠</span>':e?`<span class="bpt-ag-tag">${grouped(e).present.length}✓</span>`:''}${e&&!g&&mine?`<span class="bpt-ag-mine is-${mine}"></span>`:''}`;
      b.title=g?`Partie n°${g.game} jouée`:e?`Partie proposée · ${grouped(e).present.length} présent(s)`:(iso>=t?'Proposer une partie':'');
      b.addEventListener('click',()=>{selectedIso=iso;editing=false;render();$('bptAgendaPanel')?.scrollIntoView({behavior:'smooth',block:'nearest'});});
      host.append(b);
    }
  }

  // ---------- Rendu : panneau de la date choisie ----------
  function responsesHtml(e){
    const g=grouped(e);
    return `<div class="bpt-ag-responses">${['present','maybe','absent','pending'].map(k=>`
      <div class="bpt-ag-col is-${k}"><h4>${CHOICE_LABEL[k]} <b>${g[k].length}</b></h4>
      <ul>${g[k].map(n=>`<li>${esc(n)}</li>`).join('')||'<li class="muted">—</li>'}</ul></div>`).join('')}</div>`;
  }
  function choiceButtons(e){
    const mine=myChoice(e);
    return `<div class="bpt-ag-choices">${CHOICES.map(([k,t])=>`<button type="button" class="bpt-ag-choice is-${k}${mine===k?' is-active':''}" data-ag-choice="${k}">${t}</button>`).join('')}</div>`;
  }
  function formHtml(iso,e){
    const n=me();const locs=activePlayers();
    const loc=e?.location||(n?`Chez ${n}`:'');
    // 10.4.47 — Proposition réduite à l'essentiel : date et lieu (heure, durée et tapis se règlent au lancement du Live).
    return `<h3>${e?'Modifier la partie':'Proposer une partie'} · ${esc(longDate(iso))}</h3>
      <div class="bpt-ag-form">
        <label>Date<input id="bptAgDate" type="date" value="${esc(iso)}" min="${todayIso()}"></label>
        <label class="is-wide">Lieu<input id="bptAgLoc" list="bptAgLocList" value="${esc(loc)}" placeholder="Chez …"></label>
        <datalist id="bptAgLocList">${locs.map(p=>`<option value="Chez ${esc(p)}">`).join('')}</datalist>
      </div>
      <div class="bpt-ag-actions"><button type="button" class="btn bpt-ag-primary" id="bptAgSave">${e?'Enregistrer':'📅 Proposer cette partie'}</button>
      <button type="button" class="btn ghost" id="bptAgCancel">Annuler</button></div>`;
  }
  // 10.4.46 — Invitation WhatsApp : message prêt à envoyer (le joueur choisit le groupe dans WhatsApp).
  let justCreatedId='';
  function inviteText(e){
    // 10.4.47 — Uniquement des symboles « simples » (♠ ♥ ♦ ♣ ★ ➜) : WhatsApp Web abîme les emojis récents
    // transmis par un lien wa.me (ils s'affichent « � »).
    const g=grouped(e);
    const where=e.location||'Lieu à définir';
    const host=String(where).toLocaleLowerCase('fr').includes(String(e.createdBy||'').toLocaleLowerCase('fr'))?'':`Proposée par ${e.createdBy}`;
    const lines=[
      '♠ ♥  *SOIRÉE POKER BPT*  ♦ ♣',
      '',
      `★ *${longDate(e.date).replace(/^./,c=>c.toUpperCase())}*`,
      `★ ${where}`,
      host&&e.createdBy?`★ ${host}`:null,
      '',
      '_Les cartes sont mélangées, les jetons empilés…_',
      '_il ne manque plus que toi !_',
      g.present.length?`\nDéjà à table (${g.present.length}) : ${g.present.join(', ')}`:null,
      '',
      '➜ *Réponds dans l’appli BPT* (pas ici) :',
      appUrl()
    ];
    return lines.filter(l=>l!==null).join('\n');
  }
  // Toujours l'adresse publique du site BPT (même depuis la version de test locale).
  const BPT_PUBLIC_URL='https://fracalemou.github.io/bpt/';
  function appUrl(){return BPT_PUBLIC_URL;}
  function shareWhatsApp(e){
    const url='https://wa.me/?text='+encodeURIComponent(inviteText(e));
    const w=window.open(url,'_blank','noopener');
    if(!w)location.href=url; // bloqueur de fenêtres : ouverture dans la page
  }
  const waButton=(cls='')=>`<button type="button" class="bpt-ag-wa${cls?' '+cls:''}" data-ag-wa><span class="bpt-ag-wa-ico" aria-hidden="true">💬</span>Inviter sur WhatsApp</button>`;

  function renderPanel(){
    const box=$('bptAgendaPanel');if(!box)return;
    const t=todayIso();
    if(!selectedIso){box.innerHTML='<h3>Prochaines parties</h3><div id="bptAgendaUpcoming"></div><p class="muted bpt-ag-hint">Touchez une date future pour proposer une partie, ou une partie jouée (♠) pour revoir son détail.</p>';renderUpcoming();return;}
    const iso=selectedIso,e=eventFor(iso),g=playedGames().find(x=>x.date===iso);
    if(g){
      box.innerHTML=`<h3>♠ Partie n°${g.game} · ${esc(longDate(iso))}</h3>
        <p class="muted">${esc(g.location||e?.location||'')}${g.location||e?.location?' · ':''}${g.players} joueurs${g.winner?` · vainqueur : <b>${esc(g.winner)}</b>`:''}</p>
        <div class="bpt-ag-actions"><button type="button" class="btn bpt-ag-primary" id="bptAgOpenGame">Voir le détail de la partie</button></div>`;
      $('bptAgOpenGame').onclick=()=>openPlayedGame(g);
      return;
    }
    if(e&&!editing){
      box.innerHTML=`<button type="button" class="bpt-ag-back" data-ag-back>‹ Prochaines parties</button><h3>📅 ${esc(longDate(iso))}</h3>
        <p class="bpt-ag-meta">📍 ${esc(e.location||'Lieu à définir')}</p>
        <p class="muted">Proposée par ${esc(e.createdBy||'—')}</p>
        ${iso>=t?`<div class="bpt-ag-myline">Votre réponse :</div>${choiceButtons(e)}`:''}
        ${responsesHtml(e)}
        ${iso>=t?`<div class="bpt-ag-actions">${waButton()}</div>`:''}
        ${canEdit(e)?`<div class="bpt-ag-actions"><button type="button" class="btn ghost" id="bptAgEdit">✏️ Modifier</button><button type="button" class="btn ghost" id="bptAgDelete">🗑 Supprimer</button></div>`:''}`;
      box.querySelector('[data-ag-wa]')?.addEventListener('click',()=>shareWhatsApp(e));
      box.querySelectorAll('[data-ag-choice]').forEach(b=>b.onclick=()=>respond(e,b.dataset.agChoice));
      box.querySelector('[data-ag-back]')?.addEventListener('click',()=>{selectedIso='';render();});
      $('bptAgEdit')?.addEventListener('click',()=>{editing=true;renderPanel();});
      $('bptAgDelete')?.addEventListener('click',()=>{if(confirm('Supprimer cette partie de l’agenda ? Les réponses seront perdues.'))removeEvent(e);});
      return;
    }
    if(iso<t&&!e){box.innerHTML=`<h3>${esc(longDate(iso))}</h3><p class="muted">Aucune partie ce jour-là.</p>`;return;}
    if(!me()){box.innerHTML=`<h3>${esc(longDate(iso))}</h3><p class="muted">Connectez-vous avec votre nom de joueur pour proposer une partie.</p>`;return;}
    box.innerHTML=formHtml(iso,editing?e:null);
    $('bptAgCancel').onclick=()=>{editing=false;if(!e)selectedIso='';render();};
    $('bptAgSave').onclick=()=>saveFromForm(editing?e:null,()=>{editing=false;});
  }

  async function saveFromForm(e,done){
    const t=todayIso(),date=$('bptAgDate').value;
    if(!date){alert('Choisissez une date.');return;}
    if(date<t){alert('Choisissez une date à venir.');return;}
    const other=eventFor(date);if(other&&other.id!==e?.id){alert('Une partie est déjà proposée à cette date.');return;}
    const n=me();
    // Heure, durée et tapis ne sont plus demandés : on conserve ceux d'une partie existante, sinon rien.
    const ev={...(e||{}),id:e?.id||`agenda_${Date.now()}`,date,
      location:$('bptAgLoc').value.trim()||`Chez ${n}`,createdBy:e?.createdBy||n,
      createdAt:e?.createdAt||Date.now(),responses:e?.responses||{[n]:'present'}};
    if(!e)justCreatedId=ev.id;
    selectedIso=date;done&&done();await saveEvent(ev);
  }

  // ---------- Rendu : liste des prochaines parties ----------
  function renderUpcoming(){
    const host=$('bptAgendaUpcoming');if(!host)return;
    const t=todayIso(),up=events.filter(e=>e.date>=t).slice(0,6);
    host.innerHTML=up.length?up.map(e=>{const g=grouped(e),mine=myChoice(e);return `<button type="button" class="bpt-ag-item" data-ag-date="${esc(e.date)}">
      <strong>${esc(shortDay(e.date))}</strong><small>📍 ${esc(e.location||'Lieu à définir')}</small>
      <span class="bpt-ag-counts"><b class="is-present">${g.present.length} ✓</b> <b class="is-maybe">${g.maybe.length} ?</b> <b class="is-absent">${g.absent.length} ✕</b>${mine?'':' <em>· à vous de répondre</em>'}</span></button>`;}).join('')
      :'<p class="muted">Aucune partie programmée. Touchez une date du calendrier pour en proposer une.</p>';
    host.querySelectorAll('[data-ag-date]').forEach(b=>b.onclick=()=>{selectedIso=b.dataset.agDate;const d=new Date(`${selectedIso}T12:00:00`);cursor=new Date(d.getFullYear(),d.getMonth(),1);editing=false;render();});
  }

  // ---------- Encart « Prochaine partie » de l'Accueil (10.4.31) ----------
  let homeMode='view',homeShowAll=false;
  function nextFriday(){
    const d=new Date();const add=(5-d.getDay()+7)%7;d.setDate(d.getDate()+add);return isoOf(d);
  }
  function renderHome(force){
    const box=$('bptAgendaHome');if(!box)return;
    const e=nextEvent(),n=me();
    const sig=[homeMode,homeShowAll,n,justCreatedId,e?JSON.stringify([e.id,e.date,e.time,e.location,e.responses]):'none'].join('|');
    if(!force&&box.dataset.sig===sig)return;
    if(homeMode==='form'&&box.contains(document.activeElement))return; // saisie en cours
    box.dataset.sig=sig;box.hidden=false;
    const calLink='<button type="button" class="bpt-ag-link" data-ag-cal>📅 Calendrier</button>';
    if(homeMode==='form'||homeMode==='new'){
      const edit=homeMode==='form'&&e&&canEdit(e)?e:null;
      let iso=edit?edit.date:nextFriday();
      if(!edit&&e&&iso<=e.date){const d=new Date(`${e.date}T12:00:00`);d.setDate(d.getDate()+7);iso=isoOf(d);} // la semaine suivante
      box.innerHTML=formHtml(iso,edit);
      $('bptAgCancel').onclick=()=>{homeMode='view';renderHome(true);};
      $('bptAgSave').onclick=()=>saveFromForm(edit,()=>{homeMode='view';renderHome(true);});
      return;
    }
    if(!e){
      box.innerHTML=`<div class="bpt-ag-home-head"><div><div class="bpt-ag-kicker">Prochaine partie</div><h3>Aucune partie prévue</h3></div>${calLink}</div>
        ${n?'<div class="bpt-ag-actions"><button type="button" class="btn bpt-ag-primary" data-ag-propose>📅 Proposer une partie</button></div>':'<p class="muted">Connectez-vous avec votre nom de joueur pour proposer une partie.</p>'}`;
    }else{
      const g=grouped(e),mine=myChoice(e);
      box.innerHTML=`<div class="bpt-ag-home-head"><div><div class="bpt-ag-kicker">${mine?'Prochaine partie':'Partie proposée · à vous de répondre'}</div>
          <h3>📅 ${esc(whenLabel(e.date))}</h3>
          <p class="bpt-ag-meta">📍 ${esc(e.location||'Lieu à définir')} · proposée par ${esc(e.createdBy||'—')}</p></div>${calLink}</div>
        ${n?choiceButtons(e):'<p class="muted">Connectez-vous pour répondre.</p>'}
        <p class="bpt-ag-present"><b>${g.present.length} présent${g.present.length>1?'s':''}</b>${g.present.length?' : '+g.present.map(esc).join(', '):''}${g.maybe.length?` · <span class="is-maybe">${g.maybe.length} peut-être</span>`:''}${g.absent.length?` · <span class="is-absent">${g.absent.length} absent${g.absent.length>1?'s':''}</span>`:''}</p>
        ${homeShowAll?responsesHtml(e):''}
        ${justCreatedId&&justCreatedId===e.id?`<div class="bpt-ag-wa-box"><div><b>Partie proposée ✓</b><small>Préviens le groupe : le message est prêt, il n'y a plus qu'à choisir la conversation.</small></div>${waButton('is-big')}<button type="button" class="bpt-ag-wa-close" data-ag-wa-close aria-label="Fermer">×</button></div>`:''}
        <div class="bpt-ag-home-links"><button type="button" class="bpt-ag-link" data-ag-all>${homeShowAll?'Masquer les réponses':'Voir toutes les réponses'}</button>
        ${canEdit(e)?'<button type="button" class="bpt-ag-link" data-ag-edit>✏️ Modifier</button><button type="button" class="bpt-ag-link" data-ag-del>🗑 Supprimer</button>':''}${n?'<button type="button" class="bpt-ag-link" data-ag-new>➕ Proposer une autre date</button>':''}${n&&!(justCreatedId&&justCreatedId===e.id)?'<button type="button" class="bpt-ag-link bpt-ag-link-wa" data-ag-wa>💬 Inviter sur WhatsApp</button>':''}</div>`;
      box.querySelectorAll('[data-ag-wa]').forEach(b=>b.onclick=()=>{shareWhatsApp(e);if(justCreatedId){justCreatedId='';renderHome(true);}});
      box.querySelector('[data-ag-wa-close]')?.addEventListener('click',()=>{justCreatedId='';renderHome(true);});
      box.querySelectorAll('[data-ag-choice]').forEach(b=>b.onclick=()=>respond(e,b.dataset.agChoice));
      box.querySelector('[data-ag-all]').onclick=()=>{homeShowAll=!homeShowAll;renderHome(true);};
      box.querySelector('[data-ag-edit]')?.addEventListener('click',()=>{homeMode='form';renderHome(true);});
      box.querySelector('[data-ag-new]')?.addEventListener('click',()=>{homeMode='new';renderHome(true);});
      box.querySelector('[data-ag-del]')?.addEventListener('click',()=>{if(confirm('Supprimer cette partie ? Les réponses seront perdues.'))removeEvent(e);});
    }
    box.querySelector('[data-ag-propose]')?.addEventListener('click',()=>{homeMode='new';renderHome(true);});
    box.querySelector('[data-ag-cal]').onclick=()=>{selectedIso=e?.date||'';if(e){const d=new Date(`${e.date}T12:00:00`);cursor=new Date(d.getFullYear(),d.getMonth(),1);}openAgenda();};
  }

  function render(){
    if(!cursor){const n=new Date();cursor=new Date(n.getFullYear(),n.getMonth(),1);}
    renderHome();
    if(!$('agenda')?.classList.contains('active'))return;
    fitHeight();renderCalendar();renderPanel();
  }
  function fitHeight(){
    const lay=document.querySelector('#agenda .bpt-ag-layout');if(!lay)return;
    const top=Math.max(0,Math.round(lay.getBoundingClientRect().top+window.scrollY));
    lay.style.setProperty('--bpt-ag-top',top+'px');
  }

  // ---------- Navigation ----------
  function autoSelect(){
    if(selectedIso)return;
    const t=todayIso(),next=events.find(e=>e.date>=t);
    if(next){selectedIso=next.date;const d=new Date(`${next.date}T12:00:00`);cursor=new Date(d.getFullYear(),d.getMonth(),1);}
  }
  async function openAgenda(){
    if(typeof window.showView==='function')await window.showView('agenda');
    render();
  }
  async function openPlayedGame(g){
    if(typeof window.showView!=='function')return;
    await window.showView('latestgame');
    try{latestGameSelectedKey=`${g.season||currentGamePhotoSeasonKey()}|${g.game}`;renderLatestGame();}catch(_e){}
  }
  function hookShowView(){
    const orig=window.showView;
    if(typeof orig!=='function'||orig.__bptAgenda)return false;
    const wrapped=async function(id){const r=await orig.apply(this,arguments);if(id==='agenda'){autoSelect();window.scrollTo(0,0);render();}else renderHome(true);return r;};
    wrapped.__bptAgenda=true;window.showView=wrapped;return true;
  }

  // ---------- Live : préremplissage le jour de la partie ----------
  function liveTodayEvent(){
    const t=todayIso(),y=new Date();y.setDate(y.getDate()-1);const yIso=isoOf(y); // partie qui déborde après minuit
    return events.find(e=>e.date===t)||events.find(e=>e.date===yIso)||null;
  }
  function setValue(id,v){const el=$(id);if(!el||v==null||v==='')return;if(el.tagName==='SELECT'&&![...el.options].some(o=>o.value===String(v)))return;el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}
  function prefillLive(){
    if(!$('live3')?.classList.contains('active'))return;
    const st=window.BPTLive3?.getState?.();if(st?.active)return;
    const e=liveTodayEvent();if(!e)return;
    const key='bpt_agenda_prefill_'+e.id;
    try{if(sessionStorage.getItem(key))return;}catch(_e){}
    const boxes=[...document.querySelectorAll('#live3PlayerPicker input[type="checkbox"]')];
    if(!boxes.length)return; // liste pas encore prête
    setValue('live3Location',e.location);setValue('live3Date',e.date);setValue('live3Stack',e.startStack);setValue('live3TargetHours',e.targetHours);
    const present=new Set(grouped(e).present.map(norm));
    boxes.forEach(cb=>{const on=present.has(norm(cb.value));if(cb.checked!==on){cb.checked=on;cb.dispatchEvent(new Event('change',{bubbles:true}));}});
    try{sessionStorage.setItem(key,'1');}catch(_e){}
    window.dispatchEvent(new Event('resize')); // redessine l'écran de préparation
  }

  function bind(){
    if(bound)return;bound=true;
    if(!hookShowView())document.addEventListener('DOMContentLoaded',hookShowView,{once:true});
    $('bptAgendaPrev')?.addEventListener('click',()=>{cursor.setMonth(cursor.getMonth()-1);render();});
    $('bptAgendaNext')?.addEventListener('click',()=>{cursor.setMonth(cursor.getMonth()+1);render();});
    $('bptAgendaToday')?.addEventListener('click',()=>{const n=new Date();cursor=new Date(n.getFullYear(),n.getMonth(),1);selectedIso=todayIso();editing=false;render();});
    $('bptAgendaHomeBack')?.addEventListener('click',()=>window.showView?.('dashboard'));
    setInterval(()=>{renderHome();prefillLive();},1500);
    window.addEventListener('resize',()=>{if($('agenda')?.classList.contains('active'))fitHeight();},{passive:true});
    connect();
  }

  window.BPTAgenda={render,openAgenda,events:()=>events.slice(),grouped,nextInvite,nextEvent,liveTodayEvent};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',bind,{once:true}):bind();
})();
