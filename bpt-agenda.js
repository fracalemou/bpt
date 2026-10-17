/* BPT 10.4.28 — Agenda des parties.
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
    const hours=[3,3.5,4,4.5,5].map(h=>`<option value="${h}" ${Number(e?.targetHours||4)===h?'selected':''}>${String(h).replace('.5',' h 30').replace(/^(\d)$/,'$1 h 00')}</option>`).join('');
    return `<h3>${e?'Modifier la partie':'Proposer une partie'} · ${esc(longDate(iso))}</h3>
      <div class="bpt-ag-form">
        <label>Date<input id="bptAgDate" type="date" value="${esc(iso)}" min="${todayIso()}"></label>
        <label>Heure<input id="bptAgTime" type="time" value="${esc(e?.time||'21:15')}"></label>
        <label class="is-wide">Lieu<input id="bptAgLoc" list="bptAgLocList" value="${esc(loc)}" placeholder="Chez …"></label>
        <datalist id="bptAgLocList">${locs.map(p=>`<option value="Chez ${esc(p)}">`).join('')}</datalist>
        <label>Durée visée<select id="bptAgHours">${hours}</select></label>
        <label>Tapis de départ<input id="bptAgStack" type="number" min="1000" step="1000" value="${esc(e?.startStack||20000)}"></label>
      </div>
      <div class="bpt-ag-actions"><button type="button" class="btn bpt-ag-primary" id="bptAgSave">${e?'Enregistrer':'📅 Proposer cette partie'}</button>
      <button type="button" class="btn ghost" id="bptAgCancel">Annuler</button></div>`;
  }
  function renderPanel(){
    const box=$('bptAgendaPanel');if(!box)return;
    const t=todayIso();
    if(!selectedIso){box.innerHTML='<p class="muted">Touchez une date : une date future pour proposer une partie, une partie jouée (♠) pour revoir son détail.</p>';return;}
    const iso=selectedIso,e=eventFor(iso),g=playedGames().find(x=>x.date===iso);
    if(g){
      box.innerHTML=`<h3>♠ Partie n°${g.game} · ${esc(longDate(iso))}</h3>
        <p class="muted">${esc(g.location||e?.location||'')}${g.location||e?.location?' · ':''}${g.players} joueurs${g.winner?` · vainqueur : <b>${esc(g.winner)}</b>`:''}</p>
        <div class="bpt-ag-actions"><button type="button" class="btn bpt-ag-primary" id="bptAgOpenGame">Voir le détail de la partie</button></div>`;
      $('bptAgOpenGame').onclick=()=>openPlayedGame(g);
      return;
    }
    if(e&&!editing){
      box.innerHTML=`<h3>📅 ${esc(longDate(iso))}</h3>
        <p class="bpt-ag-meta">🕘 ${esc(e.time||'21:15')} · 📍 ${esc(e.location||'Lieu à définir')} · ⏱ ${esc(String(e.targetHours||4).replace('.5',' h 30'))} h · 🪙 ${Number(e.startStack||20000).toLocaleString('fr-FR')}</p>
        <p class="muted">Proposée par ${esc(e.createdBy||'—')}</p>
        ${iso>=t?`<div class="bpt-ag-myline">Votre réponse :</div>${choiceButtons(e)}`:''}
        ${responsesHtml(e)}
        ${canEdit(e)?`<div class="bpt-ag-actions"><button type="button" class="btn ghost" id="bptAgEdit">✏️ Modifier</button><button type="button" class="btn ghost" id="bptAgDelete">🗑 Supprimer</button></div>`:''}`;
      box.querySelectorAll('[data-ag-choice]').forEach(b=>b.onclick=()=>respond(e,b.dataset.agChoice));
      $('bptAgEdit')?.addEventListener('click',()=>{editing=true;renderPanel();});
      $('bptAgDelete')?.addEventListener('click',()=>{if(confirm('Supprimer cette partie de l’agenda ? Les réponses seront perdues.'))removeEvent(e);});
      return;
    }
    if(iso<t&&!e){box.innerHTML=`<h3>${esc(longDate(iso))}</h3><p class="muted">Aucune partie ce jour-là.</p>`;return;}
    if(!me()){box.innerHTML=`<h3>${esc(longDate(iso))}</h3><p class="muted">Connectez-vous avec votre nom de joueur pour proposer une partie.</p>`;return;}
    box.innerHTML=formHtml(iso,editing?e:null);
    $('bptAgCancel').onclick=()=>{editing=false;if(!e)selectedIso='';render();};
    $('bptAgSave').onclick=async()=>{
      const date=$('bptAgDate').value;if(!date){alert('Choisissez une date.');return;}
      if(date<t){alert('Choisissez une date à venir.');return;}
      const other=eventFor(date);if(other&&other.id!==e?.id){alert('Une partie est déjà proposée à cette date.');return;}
      const n=me();
      const ev={...(editing&&e?e:{}),id:(editing&&e?.id)||`agenda_${Date.now()}`,date,time:$('bptAgTime').value||'21:15',
        location:$('bptAgLoc').value.trim()||`Chez ${n}`,targetHours:Number($('bptAgHours').value)||4,
        startStack:Math.max(1000,Number($('bptAgStack').value)||20000),createdBy:(editing&&e?.createdBy)||n,
        createdAt:(editing&&e?.createdAt)||Date.now(),responses:(editing&&e?.responses)||{[n]:'present'}};
      editing=false;selectedIso=date;await saveEvent(ev);
    };
  }

  // ---------- Rendu : liste des prochaines parties ----------
  function renderUpcoming(){
    const host=$('bptAgendaUpcoming');if(!host)return;
    const t=todayIso(),up=events.filter(e=>e.date>=t).slice(0,6);
    host.innerHTML=up.length?up.map(e=>{const g=grouped(e),mine=myChoice(e);return `<button type="button" class="bpt-ag-item" data-ag-date="${esc(e.date)}">
      <strong>${esc(shortDay(e.date))} · ${esc(e.time||'21:15')}</strong><small>📍 ${esc(e.location||'Lieu à définir')}</small>
      <span class="bpt-ag-counts"><b class="is-present">${g.present.length} ✓</b> <b class="is-maybe">${g.maybe.length} ?</b> <b class="is-absent">${g.absent.length} ✕</b>${mine?'':' <em>· à vous de répondre</em>'}</span></button>`;}).join('')
      :'<p class="muted">Aucune partie programmée. Touchez une date du calendrier pour en proposer une.</p>';
    host.querySelectorAll('[data-ag-date]').forEach(b=>b.onclick=()=>{selectedIso=b.dataset.agDate;const d=new Date(`${selectedIso}T12:00:00`);cursor=new Date(d.getFullYear(),d.getMonth(),1);editing=false;render();});
  }

  // ---------- Bandeau d'invitation ----------
  function renderInvite(){
    const box=$('bptAgendaInvite');if(!box)return;
    const e=nextInvite();
    if(!e||document.querySelector('#live3.active')){box.hidden=true;return;}
    box.hidden=false;
    box.innerHTML=`<div class="bpt-ag-invite-text"><b>📅 Partie proposée ${esc(longDate(e.date))} à ${esc(e.time||'21:15')}</b><span>📍 ${esc(e.location||'Lieu à définir')} · ${grouped(e).present.length} présent(s) pour l’instant</span></div>
      <div class="bpt-ag-invite-btns">${CHOICES.map(([k,t])=>`<button type="button" class="bpt-ag-choice is-${k}" data-ag-invite="${k}">${t}</button>`).join('')}
      <button type="button" class="bpt-ag-invite-more" id="bptAgInviteMore">Voir</button></div>`;
    box.querySelectorAll('[data-ag-invite]').forEach(b=>b.onclick=()=>respond(e,b.dataset.agInvite));
    $('bptAgInviteMore').onclick=()=>{selectedIso=e.date;const d=new Date(`${e.date}T12:00:00`);cursor=new Date(d.getFullYear(),d.getMonth(),1);openAgenda();};
  }

  function render(){
    if(!cursor){const n=new Date();cursor=new Date(n.getFullYear(),n.getMonth(),1);}
    renderInvite();
    if(!$('agenda')?.classList.contains('active'))return;
    renderCalendar();renderPanel();renderUpcoming();
  }

  // ---------- Navigation ----------
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
    const wrapped=async function(id){const r=await orig.apply(this,arguments);if(id==='agenda')render();else renderInvite();return r;};
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
    setInterval(()=>{renderInvite();prefillLive();},1500);
    connect();
  }

  window.BPTAgenda={render,openAgenda,events:()=>events.slice(),grouped,nextInvite,liveTodayEvent};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',bind,{once:true}):bind();
})();
