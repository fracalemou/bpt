(function(){
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c));
  const fmt=n=>Math.round(Number(n)||0).toLocaleString('fr-FR');
  const STANDARD_SB=[25,50,75,100,150,200,300,400,500,600,800,1000,1200,1500,2000,2500,3000,4000,5000,6000,8000,10000,12000,15000,20000];
  let repairTried=false;
  function setText(element,value){
    if(!element)return;
    const text=String(value??'');
    if(element.textContent!==text)element.textContent=text;
  }
  function api(){return window.BPTLive3||null}
  function state(){try{return api()?.getState?.()||null}catch(_e){return null}}
  function blindAt(index){
    let i=Math.max(0,Number(index)||0);
    if(i<STANDARD_SB.length){const sb=STANDARD_SB[i];return{sb,bb:sb*2}}
    let sb=STANDARD_SB[STANDARD_SB.length-1],bb=sb*2;
    for(let k=STANDARD_SB.length;k<=i;k++){
      const step=sb<50000?Math.max(1000,Math.round(sb*.25/1000)*1000):5000;
      sb=Math.ceil((sb+step)/5000)*5000;bb=sb*2;
    }
    return{sb,bb};
  }
  function gameNo(st){
    const n=Number(st?.gameNo||st?.partNo||0);if(n>0)return n;
    try{if(typeof db!=='undefined'&&Array.isArray(db.history)){return Math.max(0,...db.history.map(r=>Number(r.game)||0))+1}}catch(_e){}
    return '—';
  }
  function makeMarkup(fs=false){return `<div class="bpt484-live" data-fs="${fs?'1':'0'}">

    <div class="bpt-bounty-overlay" data-role="bounty" hidden><section class="bpt-bounty-card" role="dialog" aria-modal="true" aria-label="Révélation du bounty mystère" tabindex="-1"><div class="bpt-bounty-icon">🎯</div><h2 data-role="bountytitle"></h2><div class="bpt-bounty-name" data-role="bountyname"></div><p data-role="bountytext"></p><strong data-role="bountyhunter"></strong><button type="button" data-bounty-close disabled>Continuer</button><button type="button" data-bounty-back hidden>← Retour aux paramètres</button></section></div>
    <div class="bpt484-head"><div class="bpt484-brand">BPT</div><div class="bpt484-owner" data-role="owner">Organisateur · —</div><div class="bpt484-head-tools"><button class="bpt484-chat" data-do="chat">Chat</button><button class="bpt484-full" data-do="full" aria-label="${fs?'Quitter le plein écran':'Plein écran'}" title="${fs?'Quitter le plein écran':'Plein écran'}">⛶</button><div class="bpt484-part" data-role="part">Partie n°—</div></div></div>
    <section class="bpt-pregame" data-role="pregame" hidden aria-label="Les enjeux de la partie"><div class="bpt-pregame-inner"><header><b>BPT</b><span data-role="pregamecount"></span></header><div class="bpt-pregame-heading"><small>CE SOIR, TOUT PEUT CHANGER</small><h2>Les enjeux de la partie</h2><p>Trois enjeux pour la table : une rivalité, un changement de classement et un record à battre, lorsqu’ils sont réalisables.</p></div><div class="bpt-pregame-stories" data-role="pregamestories"></div><section class="bpt-predictions" data-role="predictions" aria-label="Pronostics"></section><footer><span data-role="pregamestatus"></span><div class="bpt-pregame-buttons"><button type="button" data-do="back-pregame">← Retour aux paramètres</button><button type="button" data-do="launch-pregame">▶ Révéler le type de bounty</button></div></footer></div></section>
    <section class="bpt484-takeover-request" data-role="takeoverrequest" role="alert" hidden><strong>DEMANDE DE REPRISE</strong><p data-role="takeoverrequesttext"></p><div><button type="button" data-do="approve-takeover">Accepter</button><button type="button" data-do="reject-takeover">Refuser</button></div></section>
    <div class="bpt484-special-hud" data-role="specialhud"><div class="bpt484-timebank-player" data-role="timebankplayer"></div><div class="bpt484-timebank-count" data-role="timebankcount"></div><div class="bpt484-timebank-meta" data-role="timebankmeta"></div><button data-timebank-stop>Décision prise</button></div>
    <div class="bpt484-main">
      <section class="bpt484-stage">
        <div class="bpt484-clock" data-action="chrono" role="button" tabindex="0" aria-label="Réglages du chrono"><span class="bpt484-clock-settings" aria-hidden="true">☷</span><div class="bpt484-value" data-role="timer">00:00</div></div>
        <div class="bpt484-blinds" data-action="blinds"><div class="bpt484-value" data-role="blinds">—</div></div>
        <div class="bpt484-next">Prochain · <strong data-role="next">—</strong></div>
      </section>
      <div class="bpt484-right">
        <div class="bpt484-kpis">
          <section class="bpt484-card bpt484-players" data-action="players"><div class="bpt484-card-icon" aria-hidden="true"><svg viewBox="0 0 48 48"><circle cx="24" cy="15" r="7"/><circle cx="11" cy="19" r="5"/><circle cx="37" cy="19" r="5"/><path d="M13 38v-5c0-7 5-11 11-11s11 4 11 11v5"/><path d="M3 37v-5c0-5 3-8 8-8 2 0 4 .6 5.5 1.8"/><path d="M45 37v-5c0-5-3-8-8-8-2 0-4 .6-5.5 1.8"/></svg></div><div class="bpt484-label">Joueurs</div><div class="bpt484-value" data-role="players">0</div><div class="bpt484-sub">restants</div></section>
          <section class="bpt484-card bpt484-stack" data-action="stack"><div class="bpt484-card-icon" aria-hidden="true"><svg viewBox="0 0 48 48"><ellipse cx="24" cy="12" rx="14" ry="6"/><path d="M10 12v7c0 3 6 6 14 6s14-3 14-6v-7"/><path d="M10 20v7c0 3 6 6 14 6s14-3 14-6v-7"/><path d="M10 28v7c0 3 6 6 14 6s14-3 14-6v-7"/></svg></div><div class="bpt484-label">Tapis moyen</div><div class="bpt484-value bpt484-stack-values"><span data-role="avgchips">0</span><small data-role="avgbb">0 BB</small></div></section>
        </div>
        <section class="bpt484-info" data-action="timing">
          <div class="bpt484-info-line"><div class="bpt484-info-icon">⚙</div><div class="bpt484-info-copy">Structure · <strong class="bpt484-teal" data-role="mode">Classique</strong></div><div></div></div>
          <div class="bpt484-info-line"><div class="bpt484-info-icon">◷</div><div class="bpt484-info-copy">BLINDS <strong data-role="blinddur">· — min</strong></div><div class="bpt484-level-inline">Niveau <span data-role="level">— / 25</span></div></div>
          <div class="bpt484-sep"></div>
          <div class="bpt484-timing"><div class="bpt484-info-icon">◴</div><div class="bpt484-timing-copy"><div class="bpt484-label">Temps écoulé</div><div class="bpt484-value" data-role="elapsed">0 min</div><div class="bpt484-pace-line">Fin estimée · <strong class="bpt484-teal" data-role="finish">—</strong> · <strong class="bpt484-delta" data-role="delta">—</strong></div></div></div>
        </section>
      </div>
    </div>
    <div class="bpt484-actions">
      <button class="bpt484-pause" data-do="pause">Pause</button><button class="bpt484-out" data-do="out">Sortir un joueur</button><button class="bpt484-follow" data-menu-toggle="follow" aria-expanded="false">Suivi de partie</button><button class="bpt484-tools" data-menu-toggle="tools" aria-expanded="false">Outils</button><button class="bpt484-takeover" data-do="takeover">Demander la reprise</button>
      <div class="bpt484-action-menu" data-menu-panel="follow" hidden><button class="bpt484-enjeux" data-do="enjeux">🏆 Enjeux de la partie</button><button class="bpt484-personal" data-do="personal-bounty">🎯 Bounty</button><button class="bpt484-live-ranking" data-do="live-ranking">📊 Classement en direct</button></div>
      <div class="bpt484-action-menu" data-menu-panel="tools" hidden><button data-do="timer">⏱ Timer de réflexion</button><button data-do="odds">Calcul de cotes</button><button class="bpt484-end" data-do="end">Terminer le live</button></div>
    </div>
  </div>`}
  function install(){
    if(!$('bpt-predictions-style')){const style=document.createElement('style');style.id='bpt-predictions-style';style.textContent=`
      .bpt-predictions{margin:18px auto 0;max-width:760px;padding:16px;border:1px solid rgba(42,201,194,.35);border-radius:16px;background:rgba(8,30,25,.72);color:#f6faf7}.bpt-predictions h3{margin:0 0 5px;font-size:18px}.bpt-prediction-note,.bpt-prediction-wait{margin:0 0 12px;color:#b9cec5;font-size:12px}.bpt-prediction-card{padding:11px 0;border-top:1px solid rgba(255,255,255,.12)}.bpt-prediction-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.bpt-prediction-head span{color:#f0cf79;font-weight:900}.bpt-prediction-choices{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:7px}.bpt-prediction-choice{display:flex;align-items:center;justify-content:space-between;gap:7px;min-height:38px;padding:7px 9px;border:1px solid #3a5b4f;border-radius:10px;background:#142c24;color:#edf8f2;font-weight:700;cursor:pointer}.bpt-prediction-choice b{color:#f0cf79}.bpt-prediction-choice.is-selected{border-color:#2ac9c2;background:#1d5b52;box-shadow:0 0 0 2px rgba(42,201,194,.15)}.bpt-prediction-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:13px}.bpt-prediction-status{font-size:12px;color:#c5d8cf}.bpt-prediction-confirm{border:0;border-radius:10px;padding:10px 14px;background:#e1b957;color:#1a251e;font-weight:900;cursor:pointer}.bpt-prediction-confirm:disabled{opacity:.6;cursor:default}.bpt-prediction-progress{display:block;margin-top:9px;color:#91aca0}@media(max-width:700px){.bpt-predictions{padding:12px}.bpt-prediction-choices{grid-template-columns:repeat(2,minmax(0,1fr))}.bpt-prediction-footer{align-items:stretch;flex-direction:column}.bpt-prediction-confirm{width:100%}}
    `;document.head.append(style)}
    const shell=document.querySelector('#live3Game .b466-shell');if(shell&&!shell.querySelector('.bpt484-live'))shell.insertAdjacentHTML('afterbegin',makeMarkup(false));
    const fsShell=document.querySelector('#live3Fullscreen .b466-fs-shell');if(fsShell&&!fsShell.querySelector('.bpt484-live'))fsShell.insertAdjacentHTML('afterbegin',makeMarkup(true));
    document.querySelectorAll('.bpt484-live').forEach(root=>{
      if(root.dataset.bound)return;root.dataset.bound='1';
      root.addEventListener('click',e=>{
        const spectator=!api()?.isOwner?.();
        const toggle=e.target.closest('[data-menu-toggle]');
        if(toggle){if(!spectator||toggle.dataset.menuToggle==='follow'||toggle.dataset.menuToggle==='tools')toggleActionMenu(root,toggle);return;}
        if(e.target.closest('[data-timebank-stop]')){if(!spectator)api()?.stopReflectionTimer?.();return;}
        const a=e.target.closest('[data-action]');if(a){closeActionMenus();info(a.dataset.action);return;}
        const bet=e.target.closest('[data-bet-action]');if(bet){handleBetAction(bet);return;}
        const b=e.target.closest('[data-do]');if(b){
          if(spectator&&!['takeover','full','chat','enjeux','personal-bounty','live-ranking','odds'].includes(b.dataset.do))return;
          closeActionMenus();doit(b.dataset.do,root.dataset.fs==='1');
        }
      });
      root.addEventListener('keydown',e=>{const a=e.target.closest('[data-action="chrono"]');if(a&&(e.key==='Enter'||e.key===' ')){e.preventDefault();closeActionMenus();info('chrono');}});
    });
    if(!window.__bptLiveMenusBound){
      window.__bptLiveMenusBound=true;
      document.addEventListener('click',e=>{if(!e.target.closest('.bpt484-actions'))closeActionMenus();});
      document.addEventListener('keydown',e=>{if(e.key==='Escape')closeActionMenus(true);});
    }
    ensureModal();enforceNav();sync();
  }
  function closeActionMenus(restoreFocus=false){
    document.querySelectorAll('.bpt484-action-menu').forEach(panel=>panel.hidden=true);
    document.querySelectorAll('[data-menu-toggle][aria-expanded="true"]').forEach(button=>{button.setAttribute('aria-expanded','false');if(restoreFocus)button.focus();});
  }
  function toggleActionMenu(root,button){
    const expanded=button.getAttribute('aria-expanded')==='true';closeActionMenus();if(expanded)return;
    const panel=root.querySelector('[data-menu-panel="'+button.dataset.menuToggle+'"]');if(!panel)return;
    panel.hidden=false;button.setAttribute('aria-expanded','true');
    const bar=root.querySelector('.bpt484-actions');
    panel.style.right=Math.max(0,Math.min(bar.clientWidth-panel.offsetWidth,bar.clientWidth-button.offsetLeft-button.offsetWidth))+'px';
    panel.querySelector('button:not([hidden])')?.focus();
  }
  function openPersonalBounty(){
    open('🎯 Bounty · défi secret de la partie','<div id="bpt484PersonalBounty"></div>');refreshPersonalBounty();
  }
  function refreshPersonalBounty(){
    const host=$('bpt484PersonalBounty');if(!host||!$('bpt484Modal')?.classList.contains('open'))return;
    const st=state(),identity=api()?.getIdentityName?.()||'',contracts=Array.isArray(st?.personalBounties)?st.personalBounties:[];
    const finished=!!st?.finishedAt;
    const visible=finished?contracts:contracts.filter(c=>c.hunter===identity);
    const common=st?.bountyMode==='common'||(!contracts.length&&!!st?.mysteryBountyName);
    const mine=contracts.find(c=>c.hunter===identity),unlocked=finished||!!(identity&&api()?.getVerifiedIdentityName?.()===identity);
    const key=JSON.stringify({visible:visible.map(c=>({hunter:c.hunter,status:c.status,title:unlocked?c.title:'',text:unlocked?c.text:'',target:unlocked?c.target:''})),unlocked,owner:!!api()?.isOwner?.(),finished,identity,common,revealed:st?.mysteryBountyRevealed,name:st?.mysteryBountyRevealed?st?.mysteryBountyName:''});if(host.dataset.content===key)return;host.dataset.content=key;host.replaceChildren();
    const add=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;host.append(e);return e};
    if(common){add('strong',st.mysteryBountyRevealed?'🎯 Bounty commun : '+st.mysteryBountyName:'🎯 Bounty commun secret');add('p',st.mysteryBountyRevealed?(st.mysteryBountyHunter?'Éliminé par '+st.mysteryBountyHunter+'.':'Le bounty a survécu à la partie.'):'Une cible mystère est partagée par toute la table. Son identité sera révélée à son élimination ou à la fin de la partie.');return;}
    if(!contracts.length){add('p','Les bountys personnels sont disponibles pour les parties créées avec cette version.');return;}
    if(!visible.length){add('p','Aucun contrat pour votre identité : '+(identity||'non identifiée')+'. Les contrats sont réservés aux joueurs inscrits.');return;}
    if(!unlocked){
      add('p','Connectez-vous avec le code secret de votre profil pour consulter votre bounty individuel.');return;
    }
    if(!finished){add('p','Votre bounty individuel est une mission secrète, révélée à sa réussite.');}
    for(const contract of visible){
      const row=document.createElement('article');row.className='bpt-objective-row';
      const name=document.createElement('strong'),status=document.createElement('span'),text=document.createElement('p');
      name.textContent=(finished?contract.hunter+' · ':'')+(contract.icon||'🎯')+' '+(contract.title||'Cible secrète');
      status.className='bpt-objective-status';status.textContent=contract.status==='completed'?'✓ Bounty individuel réussi':contract.status==='failed'?'Bounty individuel manqué':'Bounty individuel en cours';
      text.textContent=contract.text||'Éliminer '+contract.target+' vous-même.';
      row.append(name,status,text);host.append(row);
    }
    if(!finished)add('p','Un bounty individuel tiré au sort par joueur. Sa réussite est révélée à la table. Les points du championnat restent inchangés.');
  }
  function calculateLiveRanking(st,history,award){
    const players=Array.isArray(st?.players)?st.players:[],n=players.length;
    if(!n)return null;
    const rows=(history||[]).filter(r=>!(Number(r.gameStartedAt)>0&&Number(r.gameStartedAt)===Number(st.startedAt)));
    const historical=new Map();
    for(const row of rows){
      if(!historical.has(row.player))historical.set(row.player,{name:row.player,points:0,games:new Set()});
      const p=historical.get(row.player);p.points+=Number(row.points)||0;p.games.add(row.game);
    }
    const source=Array.isArray(st.preGameRanking)?st.preGameRanking:[...historical.values()].map(p=>({name:p.name,points:p.points,gamesCount:p.games.size}));
    const base=new Map(source.map(p=>[p.name,{name:p.name,points:Number(p.points)||0,games:Number.isFinite(Number(p.gamesCount))?Number(p.gamesCount):historical.get(p.name)?.games.size||0}]));
    for(const p of players)if(!base.has(p.name))base.set(p.name,{name:p.name,points:0,games:0});
    const compare=(a,b)=>b.points-a.points||(b.games?b.points/b.games:0)-(a.games?a.points/a.games:0)||a.name.localeCompare(b.name,'fr');
    const before=new Map([...base.values()].filter(p=>p.games>0).sort(compare).map((p,i)=>[p.name,i+1]));
    const live=new Map(players.map(p=>[p.name,p])),active=players.filter(p=>p.status==='in'&&!Number(p.place)),m=active.length;
    const fixed=players.filter(p=>Number(p.place)>0),fixedPlaces=fixed.map(p=>Number(p.place));
    if(fixed.length+active.length!==n||new Set(fixedPlaces).size!==fixedPlaces.length||fixedPlaces.some(p=>!Number.isInteger(p)||p<=m||p>n))return null;
    const awards=Array.from({length:n},(_,i)=>Number(award(i+1,n))||0);
    const outcome=(name,place)=>{const p=base.get(name);return {name,points:p.points+(place?awards[place-1]:0),games:p.games+(live.has(name)?1:0)}};
    // Classement actualisé : les joueurs éliminés ont déjà sécurisé leurs
    // points, les joueurs encore en jeu conservent provisoirement leur score.
    const currentRanking=new Map([...base.values()].map(p=>{
      const livePlayer=live.get(p.name),place=Number(livePlayer?.place)||0;
      return {name:p.name,points:p.points+(place?awards[place-1]:0),games:p.games+(livePlayer?1:0)};
    }).sort(compare).map((p,i)=>[p.name,i+1]));
    const slots=Array.from({length:m},(_,i)=>i+1);
    // Une place finale ne peut appartenir qu'à un joueur : les appariements
    // calculent les bornes exactes sans énumérer toutes les permutations.
    function maxMatching(others,remaining,target,wantAbove){
      const assigned=new Map();
      function visit(name,seen){
        for(const slot of remaining){
          if(seen.has(slot)||(compare(outcome(name,slot),target)<0)!==wantAbove)continue;
          seen.add(slot);
          if(!assigned.has(slot)||visit(assigned.get(slot),seen)){assigned.set(slot,name);return true;}
        }
        return false;
      }
      let count=0;for(const name of others)if(visit(name,new Set()))count++;
      return count;
    }
    const projections=[...base.keys()].map(name=>{
      const player=live.get(name),inPlay=active.some(p=>p.name===name),possible=inPlay?slots:[Number(player?.place)||0];
      let best=Infinity,worst=0,minPoints=Infinity,maxPoints=-Infinity;
      for(const place of possible){
        const target=outcome(name,place),others=active.filter(p=>p.name!==name).map(p=>p.name),remaining=inPlay?slots.filter(p=>p!==place):slots;
        const fixedAbove=[...base.keys()].filter(other=>other!==name&&!others.includes(other)&&compare(outcome(other,Number(live.get(other)?.place)||0),target)<0).length;
        best=Math.min(best,1+fixedAbove+others.length-maxMatching(others,remaining,target,false));
        worst=Math.max(worst,1+fixedAbove+maxMatching(others,remaining,target,true));
        minPoints=Math.min(minPoints,target.points);maxPoints=Math.max(maxPoints,target.points);
      }
      return {name,before:before.get(name)||null,current:currentRanking.get(name)||null,best,worst,minPoints,maxPoints,status:!player?'Absent':inPlay?'En jeu':player.status==='winner'?'Vainqueur':'Éliminé',fixedPoints:!inPlay};
    });
    projections.sort((a,b)=>(a.before||Infinity)-(b.before||Infinity)||a.name.localeCompare(b.name,'fr'));
    return {rows:projections,scoreless:awards.every(p=>p===0),finished:!!st.finishedAt};
  }
  function openLiveRanking(){
    open('Classement en direct','<div id="bpt484LiveRanking"></div><div class="bpt484-btnrow"><button id="bpt484RankingBack">Retour au live</button></div>');
    $('bpt484RankingBack').onclick=closeModal;refreshLiveRanking();
  }
  function refreshLiveRanking(){
    const host=$('bpt484LiveRanking');if(!host||!$('bpt484Modal')?.classList.contains('open'))return;
    const st=state();if(!st?.startedAt){host.textContent='Le classement en direct sera disponible au lancement de la partie.';return;}
    const key=JSON.stringify([st.startedAt,st.finishedAt,st.preGameRanking,(st.players||[]).map(p=>[p.name,p.status,p.place]),db.history.map(r=>[r.player,r.game,r.points,r.gameStartedAt]),bptGetPointsTable()]);
    if(host.dataset.content===key)return;host.dataset.content=key;host.replaceChildren();
    const data=calculateLiveRanking(st,db.history,pointsFor);
    if(!data){host.textContent='Les positions seront affichées dès que les places des joueurs auront été synchronisées.';return;}
    const add=(parent,tag,text,className)=>{const e=document.createElement(tag);if(className)e.className=className;e.textContent=text;parent.append(e);return e};
    const ordinal=n=>n===1?'1er':n+'e';
    add(host,'p',data.finished?'CHAMPIONNAT · CLASSEMENT FINAL':'CHAMPIONNAT · POSITIONS POSSIBLES','bpt-ranking-subtitle');
    const table=document.createElement('table');table.className='bpt-ranking-table';host.append(table);
    const thead=document.createElement('thead'),head=document.createElement('tr');table.append(thead);thead.append(head);
    for(const label of ['Joueur','Avant','Actuelle',data.finished?'Après':'Possible']){const th=add(head,'th',label);th.scope='col';}
    const tbody=document.createElement('tbody');table.append(tbody);
    for(const p of data.rows){
      const row=document.createElement('tr');tbody.append(row);
      const name=add(row,'td','');add(name,'b',p.name);
      const status=p.status+(p.status==='Éliminé'?' · points fixés':'');add(name,'small',status,p.status==='En jeu'?'is-ahead':'');
      add(name,'small',(p.minPoints===p.maxPoints?fmt(p.minPoints):fmt(p.minPoints)+'–'+fmt(p.maxPoints))+' pts');
      add(row,'td',p.before?ordinal(p.before):'—');
      add(row,'td',p.current?ordinal(p.current):'—');
      const projected=add(row,'td','');add(projected,'b',p.best===p.worst?ordinal(p.best):ordinal(p.best)+'–'+ordinal(p.worst));
      if(p.before){
        const up=Math.max(0,p.before-p.best),down=Math.max(0,p.worst-p.before);
        if(up)add(projected,'small','↑ '+(p.best===p.worst?'':'jusqu’à ')+up+' place'+(up>1?'s':''),'is-ahead');
        if(down)add(projected,'small','↓ '+(p.best===p.worst?'':'jusqu’à ')+down+' place'+(down>1?'s':''),'is-behind');
      }
    }
    if(data.scoreless)add(host,'p','Cette partie n’attribue aucun point au championnat.','bpt-ranking-note');
    add(host,'p',data.finished?'Les résultats de la partie sont inclus une seule fois.':'Les points des joueurs éliminés sont fixés. Leur position dépend encore des résultats des joueurs en jeu.','bpt-ranking-note');
  }
  function openLiveObjectives(){
    open('🎯 Les enjeux de la partie','<p>Des objectifs liés à cette table et à votre histoire : classement, rivalités et records. Les badges du palmarès se débloquent séparément.</p><div id="bpt484ObjectivesList"></div>');refreshLiveObjectives();
  }
  function refreshLiveObjectives(){
    const host=$('bpt484ObjectivesList');if(!host||!$('bpt484Modal')?.classList.contains('open'))return;
    const st=state(),entries=Array.isArray(st?.preGameBriefing)?st.preGameBriefing:[];
    const key=JSON.stringify(entries);if(host.dataset.content===key)return;host.dataset.content=key;host.replaceChildren();
    if(!entries.length){host.textContent='Aucun enjeu enregistré pour cette partie.';return;}
    for(const entry of entries){
      const row=document.createElement('article');row.className='bpt-objective-row'+(entry.completed?' is-completed':'');
      const name=document.createElement('strong'),status=document.createElement('span'),text=document.createElement('p');
      name.textContent=(entry.icon||'🎯')+' '+entry.name+' · '+entry.title;
      status.textContent=entry.completed?'✓ Réalisé':entry.objective?'En cours':'À suivre';
      status.className='bpt-objective-status';text.textContent=entry.completed&&entry.resultText?entry.resultText:entry.text;row.append(name,status,text);host.append(row);
    }
  }
  function ensureModal(){if($('bpt484Modal'))return;document.body.insertAdjacentHTML('beforeend','<div id="bpt484Modal" class="bpt484-modal"><div id="bpt484Dialog" class="bpt484-dialog"></div></div>');$('bpt484Modal').onclick=e=>{if(e.target===$('bpt484Modal'))closeModal()}}
  function closeModal(){$('bpt484Modal')?.classList.remove('open')}
  function open(title,body){closeActionMenus();ensureModal();$('bpt484Dialog').onclick=null;$('bpt484Dialog').innerHTML=`<button class="bpt484-close" data-modal-close>×</button><h2>${title}</h2>${body}`;$('bpt484Modal').classList.add('open');$('bpt484Dialog').querySelector('[data-modal-close]')?.addEventListener('click',closeModal)}
  async function doit(a,fs){
    const x=api();
    try{
      if(a==='pause')await x?.toggleStartPause?.();
      else if(a==='launch-pregame')await x?.launchPreGame?.();
      else if(a==='back-pregame')await x?.returnToPreGameSettings?.();
      else if(a==='out')x?.openElim?.();
      else if(a==='timer')openReflectionTimerPicker();
      else if(a==='enjeux')openLiveObjectives();
      else if(a==='live-ranking')openLiveRanking();
      else if(a==='personal-bounty')openPersonalBounty();
      else if(a==='chat')$('live3ChatBtn')?.click();
      else if(a==='odds')$('live3OddsBtn')?.click();
      else if(a==='full'){if(fs)x?.closeFullscreen?.();else x?.openFullscreen?.()}
      else if(a==='takeover')await x?.requestTakeover?.();
      else if(a==='approve-takeover')await x?.approveTakeover?.();
      else if(a==='reject-takeover')await x?.rejectTakeover?.();
      else if(a==='end')await x?.endLive?.();
    }catch(e){console.error('BPT action',a,e)}
    setTimeout(sync,80);
  }
  function openReflectionTimerPicker(){
    const st=state();if(!st)return;
    const ps=(Array.isArray(st.players)?st.players:[]).filter(p=>p.status==='in'||p.status==='winner');
    const usage=st.reflectionTimers||{};
    const options=ps.map(p=>{const used=Math.max(0,Number(usage[p.name]?.used||0));const left=Math.max(0,2-used);return `<option value="${esc(p.name)}" ${left<=0?'disabled':''}>${esc(p.name)} — ${left} timer${left>1?'s':''} disponible${left>1?'s':''}</option>`}).join('');
    open('Timer de réflexion',`<p style="color:#9fb4af">Chaque joueur dispose de 2 timers de 2 minutes par partie.</p><div class="bpt484-field"><label>Joueur</label><select id="bpt484TimerPlayer">${options}</select></div><div class="bpt484-btnrow"><button data-start-reflection>Prendre un timer de 2 min</button></div>`);
    $('bpt484Dialog').querySelector('[data-start-reflection]')?.addEventListener('click',async()=>{const name=$('bpt484TimerPlayer')?.value||'';if(!name)return;const ok=await api()?.startReflectionTimer?.(name);if(ok===false)alert('Ce joueur ne dispose plus de timer ou un timer est déjà actif.');closeModal();setTimeout(sync,80);});
  }
  function actionFeedback(kind,text){
    const selector=(kind==='level')?'.bpt484-blinds':'.bpt484-clock';
    document.querySelectorAll('.bpt484-live').forEach(root=>{
      const card=root.querySelector(selector);if(!card)return;
      card.classList.remove('bpt484-feedback-pulse');
      card.querySelector('.bpt484-action-feedback')?.remove();
      void card.offsetWidth;
      card.classList.add('bpt484-feedback-pulse');
      const badge=document.createElement('div');
      badge.className='bpt484-action-feedback';badge.textContent=text;card.appendChild(badge);
      if(kind==='level'){
        const levelMini=root.querySelector('.bpt484-level-inline');
        if(levelMini){levelMini.classList.remove('bpt484-level-pulse');void levelMini.offsetWidth;levelMini.classList.add('bpt484-level-pulse');setTimeout(()=>levelMini.classList.remove('bpt484-level-pulse'),1100)}
      }
      setTimeout(()=>{badge.remove();card.classList.remove('bpt484-feedback-pulse')},1100);
    });
  }
  async function actionDirect(kind){
    const x=api();if(!x||!x.isOwner?.())return;
    const beforeLevel=Math.max(1,(Number(state()?.levelIndex)||0)+1);
    if(['minus','plus','prev','next'].includes(kind))closeModal();
    if(kind==='minus'){await x.adjustMinute?.(-60);sync();actionFeedback('timer','−1 min');return;}
    if(kind==='plus'){await x.adjustMinute?.(60);sync();actionFeedback('timer','+1 min');return;}
    if(kind==='prev'){await x.changeLevel?.(-1);sync();const after=Math.max(1,(Number(state()?.levelIndex)||0)+1);actionFeedback('level',`Niveau ${beforeLevel} → ${after}`);return;}
    if(kind==='next'){await x.changeLevel?.(1);sync();const after=Math.max(1,(Number(state()?.levelIndex)||0)+1);actionFeedback('level',`Niveau ${beforeLevel} → ${after}`);return;}
    if(kind==='pause')await x.toggleStartPause?.();
    setTimeout(sync,60);
  }
  function info(type){
    const st=state();
    if(type==='players'){
      const ps=Array.isArray(st?.players)?st.players:[];
      const alive=ps.filter(p=>p.status==='in');
      const winner=ps.filter(p=>p.status==='winner');
      const outs=ps.filter(p=>p.status==='out').sort((a,b)=>Number(b.outAt||0)-Number(a.outAt||0));
      const other=ps.filter(p=>!['in','out','winner'].includes(String(p.status||'')));
      const lastOut=outs[0]||null;
      const ordered=[...winner,...alive,...other,...outs];
      const rows=ordered.map(p=>{
        const out=p.status==='out',win=p.status==='winner',lv=Number(p.outLevel)||0;
        const isLast=!!(lastOut&&p.name===lastOut.name&&Number(p.outAt||0)===Number(lastOut.outAt||0));
        const status=win?'Vainqueur':out?(lv?`Éliminé · niveau ${lv}`:'Éliminé'):'En jeu';
        const detail=out&&p.killer?` · par ${esc(p.killer)}`:'';
        return `<div class="bpt484-row${isLast?' bpt484-last-out':''}" ${isLast?'data-last-out="1" tabindex="0" role="button" title="Corriger ou annuler cette élimination"':''}><span>${esc(p.name||'—')}${isLast?' <small>· dernière élimination</small>':''}</span><b>${status}${detail}</b></div>`;
      }).join('');
      open('Joueurs',rows||'<p>Aucun joueur disponible.</p>');
      const dlg=$('bpt484Dialog');
      const lastRow=dlg?.querySelector('[data-last-out="1"]');
      const openCorrection=()=>{
        if(!lastOut)return;
        const killers=ps.filter(p=>p.name!==lastOut.name).map(p=>`<option value="${esc(p.name)}" ${p.name===lastOut.killer?'selected':''}>${esc(p.name)}</option>`).join('');
        dlg.innerHTML=`<button class="bpt484-close" data-modal-close>×</button><h2>${esc(lastOut.name)} · dernière élimination</h2><p style="color:#9fb4af;margin-top:-4px">Choisissez l’action à effectuer sur cette élimination.</p><div class="bpt484-row"><span>Éliminé par</span><b>${esc(lastOut.killer||'—')}</b></div><div class="bpt484-row"><span>Niveau</span><b>${Number(lastOut.outLevel)||'—'}</b></div><div class="bpt484-btnrow"><button data-correct-elim>Corriger l’élimination</button><button class="bpt484-danger-action" data-undo-elim>Annuler l’élimination</button></div>`;
        dlg.querySelector('[data-modal-close]')?.addEventListener('click',closeModal);
        dlg.querySelector('[data-undo-elim]')?.addEventListener('click',async()=>{
          if(!confirm(`Annuler l’élimination de ${lastOut.name} et le remettre en jeu ?`))return;
          await api()?.undoLastElimination?.();closeModal();setTimeout(sync,180);
        });
        dlg.querySelector('[data-correct-elim]')?.addEventListener('click',()=>{
          dlg.innerHTML=`<button class="bpt484-close" data-modal-close>×</button><h2>Corriger l’élimination</h2><div class="bpt484-field"><label>Joueur éliminé</label><strong>${esc(lastOut.name)}</strong></div><div class="bpt484-field"><label>Éliminé par</label><select id="bpt484CorrectKiller">${killers}</select></div><div class="bpt484-field"><label>Niveau d’élimination</label><input id="bpt484CorrectLevel" type="number" min="1" max="99" value="${Number(lastOut.outLevel)||Math.max(1,(Number(st?.levelIndex)||0)+1)}"></div><div class="bpt484-btnrow"><button data-save-correction>Enregistrer la correction</button><button data-back-correction>Retour</button></div>`;
          dlg.querySelector('[data-modal-close]')?.addEventListener('click',closeModal);
          dlg.querySelector('[data-back-correction]')?.addEventListener('click',()=>info('players'));
          dlg.querySelector('[data-save-correction]')?.addEventListener('click',async()=>{
            const killer=$('bpt484CorrectKiller')?.value||'';
            const outLevel=Number($('bpt484CorrectLevel')?.value)||1;
            await api()?.correctLastElimination?.({killer,outLevel});closeModal();setTimeout(sync,180);
          });
        });
      };
      lastRow?.addEventListener('click',openCorrection);
      lastRow?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openCorrection();}});
      return;
    }
    if(type==='chrono'){
      if(!api()?.isOwner?.())return;
      open('Chrono',`<div class="bpt484-btnrow"><button data-cmd="minus">−1 min</button><button data-cmd="pause">Pause / Reprendre</button><button data-cmd="plus">+1 min</button><button data-cmd="prev">◀ Niveau précédent</button><button data-cmd="next">Niveau suivant ▶</button></div>`);
      $('bpt484Dialog').onclick=e=>{const c=e.target.closest('[data-cmd]')?.dataset.cmd;if(c)actionDirect(c)};return;
    }
    if(type==='blinds'){
      const idx=Math.max(0,Number(st?.levelIndex)||0),cur=blindAt(idx),nx=blindAt(idx+1);
      open('Blinds',`<div class="bpt484-row"><span>Actuelles</span><b>${fmt(cur.sb)} / ${fmt(cur.bb)}</b></div><div class="bpt484-row"><span>Prochain niveau</span><b>${fmt(nx.sb)} / ${fmt(nx.bb)}</b></div><div class="bpt484-btnrow"><button data-cmd="prev">◀ Niveau précédent</button><button data-cmd="next">Niveau suivant ▶</button></div>`);
      $('bpt484Dialog').onclick=e=>{const c=e.target.closest('[data-cmd]')?.dataset.cmd;if(c)actionDirect(c)};return;
    }
    if(type==='timing'){
      const adaptive=st?.paceAdaptive===true;
      const elapsed=$('live3Elapsed')?.textContent||'—',finish=$('live3EstimatedFinish')?.textContent||'—',delta=$('live3FinishDelta')?.textContent||'—';
      const advice=api()?.getPaceAdvice?.()||null;
      if(adaptive){
        const last=st?.lastPaceAdjustment||{};
        const canReadapt=!!advice && (!Number.isFinite(Number(last.levelIndex)) || (Number(st?.levelIndex)||0)>Number(last.levelIndex));
        const readapt=canReadapt?`<button data-readapt>Nouvelle adaptation</button>`:'';
        const explain=canReadapt?`<p style="margin:14px 0 4px;color:#f4f7f6;line-height:1.45">L’écart reste significatif malgré l’adaptation. BPT propose de passer les prochains niveaux de <b>${advice.currentMin} à ${advice.proposedMin} min</b>.</p>`:'';
        open('Rythme de la partie',`<div class="bpt484-row"><span>Temps écoulé</span><b>${esc(elapsed)}</b></div><div class="bpt484-row"><span>Fin estimée</span><b>${esc(finish)}</b></div><div class="bpt484-row"><span>Écart</span><b>${esc(delta)}</b></div>${explain}<div class="bpt484-btnrow">${readapt}<button data-mode-toggle>Revenir en classique</button></div>`);
        $('bpt484Dialog').querySelector('[data-readapt]')?.addEventListener('click',()=>{closeModal();live3ShowPaceAdvice(advice,{readapt:true});});
      }else if(advice){
        const direction=advice.type==='accelerate'?'retard':'avance';
        const verb=advice.type==='accelerate'?'raccourcir':'allonger';
        open('Rythme de la partie',`<div class="bpt484-row"><span>Temps écoulé</span><b>${esc(elapsed)}</b></div><div class="bpt484-row"><span>Fin estimée</span><b>${esc(finish)}</b></div><div class="bpt484-row"><span>Écart</span><b>${esc(delta)}</b></div><p style="margin:14px 0 4px;color:#f4f7f6;line-height:1.45">La partie prend trop d’${direction}. Pour essayer de respecter l’heure de fin prévue, BPT propose de <b>${verb} les prochains niveaux de ${advice.currentMin} à ${advice.proposedMin} min</b>.</p><div class="bpt484-btnrow"><button data-mode-toggle>Passer en adaptatif</button></div>`);
      }else{
        open('Rythme de la partie',`<div class="bpt484-row"><span>Temps écoulé</span><b>${esc(elapsed)}</b></div><div class="bpt484-row"><span>Fin estimée</span><b>${esc(finish)}</b></div><div class="bpt484-row"><span>Écart</span><b>${esc(delta)}</b></div><p style="margin:14px 0 0;color:#9fb4af">Le rythme actuel ne nécessite pas d’ajustement particulier.</p>`);
      }
      $('bpt484Dialog').querySelector('[data-mode-toggle]')?.addEventListener('click',async()=>{
        if(adaptive){
          const ok=await api()?.setPaceAdaptive?.(false);
          if(ok===false){alert('Seul l’organisateur peut modifier le mode de structure.');return;}
        }else if(advice){
          const ok=await api()?.applyPaceAdvice?.();
          if(ok===false){alert('Seul l’organisateur peut modifier le mode de structure.');return;}
        }else{
          const ok=await api()?.setPaceAdaptive?.(true);
          if(ok===false){alert('Seul l’organisateur peut modifier le mode de structure.');return;}
        }
        closeModal();setTimeout(sync,250);
      });return;
    }
    if(type==='stack'){
      const ps=Array.isArray(st?.players)?st.players:[];
      const alive=ps.filter(p=>p.status==='in').length+(ps.some(p=>p.status==='winner')?1:0);
      const total=ps.length*Number(st?.startStack||0);
      const avg=alive?total/alive:0;
      const idx=Math.max(0,Number(st?.levelIndex)||0);
      const bb=blindAt(idx).bb;
      const bbVal=n=>bb?Math.round((Number(n)||0)/bb*10)/10:0;
      const chip=n=>fmt(Math.max(0,Math.round(n)));
      const display=n=>`${chip(n)} <small>(${bbVal(n)} BB)</small>`;
      const zoneRange=(minBB,maxBB)=>{
        if(!bb||total<=0)return '—';
        const rawLo=Math.max(0,minBB*bb), rawHi=maxBB==null?total:maxBB*bb;
        if(total<=rawLo)return 'Non atteignable';
        const lo=Math.min(rawLo,total), hi=Math.min(rawHi,total);
        const loBB=bbVal(lo), hiBB=bbVal(hi);
        if(maxBB==null){
          if(total<=rawLo)return 'Non atteignable';
          return `${chip(lo)} – ${chip(total)} <small>(${loBB}–${bbVal(total)} BB)</small>`;
        }
        return `${chip(lo)} – ${chip(hi)} <small>(${loBB}–${hiBB} BB)</small>`;
      };
      const critical=zoneRange(0,10);
      const short=zoneRange(10,20);
      const medium=zoneRange(20,40);
      const deep=zoneRange(40,null);
      open('Tapis moyen',`<div class="bpt484-row"><span>Jetons en circulation</span><b>${fmt(total)}</b></div><div class="bpt484-row"><span>Joueurs restants</span><b>${alive}</b></div><div class="bpt484-row"><span>Tapis moyen</span><b>${display(avg)}</b></div><div class="bpt484-row"><span>Zone critique</span><b>${critical}</b></div><div class="bpt484-row"><span>Zone short</span><b>${short}</b></div><div class="bpt484-row"><span>Zone moyenne</span><b>${medium}</b></div><div class="bpt484-row"><span>Zone deep</span><b>${deep}</b></div><div style="margin-top:12px;color:#9fb4af;font-size:.9rem">Maximum théorique pour un joueur : ${display(total)}</div>`);return;
    }

  }
  function fitText(el,opts={}){
    if(!el || !el.isConnected)return;
    const parent=opts.parent||el.parentElement;
    if(!parent || parent.offsetParent===null)return;
    const ps=getComputedStyle(parent);
    let availableW=Math.max(0,parent.clientWidth-(parseFloat(ps.paddingLeft)||0)-(parseFloat(ps.paddingRight)||0));
    let availableH=Math.max(0,parent.clientHeight-(parseFloat(ps.paddingTop)||0)-(parseFloat(ps.paddingBottom)||0));
    const card=parent.classList?.contains('bpt484-card')?parent:null;
    if(card && el.closest('.bpt484-card')===card){
      const icon=card.querySelector('.bpt484-card-icon');
      if(icon) availableW-=icon.getBoundingClientRect().width+(parseFloat(getComputedStyle(card).columnGap)||0);
      const label=card.querySelector('.bpt484-label');
      const sub=card.querySelector('.bpt484-sub');
      if(label && label!==el) availableH-=label.getBoundingClientRect().height+6;
      if(sub && sub!==el) availableH-=sub.getBoundingClientRect().height+6;
    }
    if(!availableW || !availableH)return;
    const min=Math.max(1,Number(opts.min||10));
    const max=Math.max(min,Number(opts.max||parseFloat(getComputedStyle(el).fontSize)||16));
    const widthRatio=Math.min(1,Math.max(.45,Number(opts.widthRatio||.96)));
    const heightRatio=Math.min(1,Math.max(.35,Number(opts.heightRatio||.82)));
    const targetW=availableW*widthRatio;
    const targetH=availableH*heightRatio;
    el.style.whiteSpace=opts.wrap?'normal':'nowrap';
    el.style.maxWidth='100%';
    let lo=min,hi=max,best=min;
    for(let i=0;i<10;i++){
      const mid=(lo+hi)/2;
      el.style.fontSize=mid+'px';
      const fits=el.scrollWidth<=targetW+1 && el.scrollHeight<=targetH+1;
      if(fits){best=mid;lo=mid}else hi=mid;
    }
    el.style.fontSize=Math.floor(best*10)/10+'px';
  }
  function layoutLiveActions(root){
    const bar=root.querySelector('.bpt484-actions');if(!bar||!bar.clientWidth||root.classList.contains('is-pregame'))return;
    const buttons=Array.from(bar.children).filter(b=>b.tagName==='BUTTON'&&getComputedStyle(b).display!=='none');
    const width=bar.clientWidth,gap=parseFloat(getComputedStyle(bar).columnGap)||8;
    const compact=matchMedia('(max-height:560px) and (orientation:landscape)').matches;
    const fullscreen=root.dataset.fs==='1',portrait=matchMedia('(max-width:760px) and (orientation:portrait)').matches;
    const columns=Math.max(1,Math.min(buttons.length,width<520?2:4));
    const rows=Math.max(1,Math.ceil(buttons.length/columns));
    const rowHeight=compact?44:(width<760?48:64);
    bar.style.gridTemplateColumns='repeat('+columns+',minmax(0,1fr))';
    bar.style.gridTemplateRows='repeat('+rows+','+rowHeight+'px)';
    bar.style.height=(rows*rowHeight+(rows-1)*gap)+'px';
    for(const button of buttons){button.style.height='100%';button.style.minHeight='44px';button.style.padding='6px 8px';button.style.whiteSpace='normal';button.style.lineHeight='1.15';}
    const head=root.querySelector('.bpt484-head');
    root.style.gridTemplateRows=(head?.offsetHeight||54)+'px '+(!fullscreen&&portrait?'auto':'minmax(0,1fr)')+' '+bar.style.height;
  }
  function fitLiveTexts(){
    document.querySelectorAll('.bpt484-live').forEach(root=>{
      if(!root.clientWidth||root.classList.contains('is-pregame'))return;
      const signature=JSON.stringify([root.clientWidth,root.clientHeight,root.classList.contains('is-spectator'),Array.from(root.querySelectorAll('[data-role],.bpt484-actions>button')).filter(el=>!el.closest('.bpt-bounty-overlay,.bpt-pregame')).map(el=>el.textContent)]);
      if(root.dataset.fitSignature===signature)return;
      root.dataset.fitSignature=signature;
      layoutLiveActions(root);
      const portrait=matchMedia('(max-width:760px) and (orientation:portrait)').matches;
      const landscapePhone=matchMedia('(max-width:1000px) and (max-height:560px) and (orientation:landscape)').matches;
      /* Hiérarchie validée : Timer > Blinds > Joueurs = Tapis moyen = Prochaines blinds = Temps écoulé. */
      fitText(root.querySelector('.bpt484-clock .bpt484-value'),{max:portrait?148:(landscapePhone?100:210),min:portrait?72:(landscapePhone?46:74),widthRatio:.92,heightRatio:.78});
      fitText(root.querySelector('.bpt484-blinds .bpt484-value'),{max:portrait?78:(landscapePhone?66:104),min:portrait?34:(landscapePhone?30:42),widthRatio:.96,heightRatio:.86});
      fitText(root.querySelector('.bpt484-players .bpt484-value'),{max:portrait?78:(landscapePhone?56:98),min:portrait?44:(landscapePhone?30:52),widthRatio:.88,heightRatio:.76});
      fitText(root.querySelector('.bpt484-stack [data-role="avgchips"]'),{max:portrait?42:(landscapePhone?30:48),min:portrait?22:(landscapePhone?17:26),widthRatio:.88,heightRatio:.48});
      fitText(root.querySelector('.bpt484-timing .bpt484-value'),{max:portrait?42:(landscapePhone?26:50),min:portrait?24:(landscapePhone?16:24),widthRatio:.92,heightRatio:.56});
      fitText(root.querySelector('.bpt484-next strong'),{max:portrait?32:(landscapePhone?23:42),min:portrait?18:(landscapePhone?13:20),widthRatio:.90,heightRatio:.48});
      root.querySelectorAll('.bpt484-actions>button').forEach(btn=>fitText(btn,{max:portrait?16:(landscapePhone?14:20),min:12,wrap:true,widthRatio:.98,heightRatio:.98}));
    });
  }
  function scheduleFitLiveTexts(){
    clearTimeout(window.__bpt484FitTimer);
    window.__bpt484FitTimer=setTimeout(fitLiveTexts,20);
  }
  const bountySeenAt=new Map(),bountyDismissed=new Set();
  let bountyLaunchBusy=false;
  function predictionOdds(st,type,name){return Number(st?.betting?.odds?.[type]?.[name])||3;}
  function predictionLabel(type){return type==='winner'?'Vainqueur':'Premier éliminé';}
  function predictionNames(st){return (st?.players||[]).map(p=>String(p.name||'').trim()).filter(Boolean);}
  function renderPredictions(root,st,owner){
    const host=root.querySelector('[data-role="predictions"]');if(!host)return;
    const players=predictionNames(st),identity=String(api()?.getIdentityName?.()||'').trim(),me=st?.betting?.bets?.[identity]||{},odds=st?.betting?.odds||{};
    const allBets=st?.betting?.bets||{},confirmed=Object.values(allBets).filter(b=>b?.confirmed).length;
    const key=JSON.stringify([players,identity,me,odds,confirmed,owner]);if(host.dataset.content===key)return;host.dataset.content=key;host.replaceChildren();
    const title=document.createElement('h3');title.textContent='Pronostics · 0,50 € par pari';host.append(title);
    const note=document.createElement('p');note.className='bpt-prediction-note';note.textContent='Deux paris maximum : un vainqueur et un premier éliminé. Vous pouvez aussi confirmer « Pas de pari ».';host.append(note);
    if(!identity||!players.includes(identity)){const p=document.createElement('p');p.className='bpt-prediction-wait';p.textContent='Connectez-vous avec votre identité de joueur pour valider vos pronostics.';host.append(p);return;}
    for(const type of ['winner','firstEliminated']){
      const card=document.createElement('div');card.className='bpt-prediction-card';
      const head=document.createElement('div');head.className='bpt-prediction-head';const strong=document.createElement('strong');strong.textContent=predictionLabel(type);const stake=document.createElement('span');stake.textContent='0,50 €';head.append(strong,stake);card.append(head);
      const choices=document.createElement('div');choices.className='bpt-prediction-choices';
      const none=document.createElement('button');none.type='button';none.dataset.betAction='pick';none.dataset.betType=type;none.dataset.betPick='';none.className='bpt-prediction-choice'+(!me[type]?' is-selected':'');none.textContent='Pas de pari';choices.append(none);
      players.forEach(name=>{const b=document.createElement('button');b.type='button';b.dataset.betAction='pick';b.dataset.betType=type;b.dataset.betPick=name;b.className='bpt-prediction-choice'+(me[type]===name?' is-selected':'');b.innerHTML=`<span>${esc(name)}</span><b>${predictionOdds(st,type,name).toFixed(2).replace('.',',')}</b>`;choices.append(b)});
      card.append(choices);host.append(card);
    }
    const footer=document.createElement('div');footer.className='bpt-prediction-footer';const status=document.createElement('span');status.className='bpt-prediction-status';status.textContent=me.confirmed?'✓ Choix validé':'Choisissez éventuellement vos paris puis validez';const btn=document.createElement('button');btn.type='button';btn.dataset.betAction='confirm';btn.className='bpt-prediction-confirm';btn.disabled=!!me.confirmed;btn.textContent=me.confirmed?'Choix validé':'Valider mes choix';footer.append(status,btn);host.append(footer);
    const progress=document.createElement('small');progress.className='bpt-prediction-progress';progress.textContent=`${confirmed} / ${players.length} joueur${players.length>1?'s':''} a${confirmed>1?'nt':''} validé`;host.append(progress);
  }
  async function handleBetAction(button){
    const x=api();if(!x)return;
    try{
      if(button.dataset.betAction==='pick'){await x.setLivePrediction?.(button.dataset.betType,button.dataset.betPick||'');}
      if(button.dataset.betAction==='confirm'){await x.confirmLivePredictions?.();}
      sync();
    }catch(e){console.warn('BPT pronostic',e);alert('Impossible d’enregistrer ce choix.');}
  }
  function renderPreGame(root,st,owner){
    const box=root.querySelector('[data-role="pregame"]');if(!box)return;
    box.hidden=!(st.preGamePending&&!st.startedAt);
    if(box.hidden)return;
    const entries=Array.isArray(st.preGameBriefing)?st.preGameBriefing:[];
    box.querySelector('[data-role="pregamecount"]').textContent='AVANT-PARTIE · '+(st.players||[]).length+' JOUEURS · '+entries.length+' ENJEU'+(entries.length>1?'X':'');
    box.querySelector('[data-role="pregamestatus"]').textContent=owner?'Le chrono attend le lancement.':'En attente du lancement par l’organisateur.';
    renderPredictions(root,st,owner);
    const names=predictionNames(st),bets=st?.betting?.bets||{},allConfirmed=names.length>0&&names.every(name=>bets[name]?.confirmed);
    const launchButton=box.querySelector('[data-do="launch-pregame"]');if(launchButton){launchButton.disabled=!owner||!allConfirmed;launchButton.title=allConfirmed?'Tous les choix sont validés.':'Chaque joueur doit confirmer son choix ou « Pas de pari ».';}
    box.querySelector('[data-do="launch-pregame"]').hidden=!owner;
    box.querySelector('[data-do="back-pregame"]').hidden=!owner;
    const key=JSON.stringify(entries);
    if(box.dataset.entries!==key){
      box.dataset.entries=key;const host=box.querySelector('[data-role="pregamestories"]');host.replaceChildren();
      if(!entries.length)host.textContent='Pas encore assez d’historique ou d’enjeux réalisables pour cette table. La partie peut être lancée.';
      for(const entry of entries){
        const card=document.createElement('article'),icon=document.createElement('span'),copy=document.createElement('div'),name=document.createElement('h3'),title=document.createElement('small'),text=document.createElement('p');
        icon.className='bpt-pregame-icon';icon.textContent=entry.icon||'🎯';name.textContent=entry.name;title.textContent=({rivalry:'RIVALITÉ',ranking:'CLASSEMENT',record:'RECORD À BATTRE'}[entry.theme]||entry.title)+(entry.theme?' · '+entry.title:'');text.textContent=entry.text;
        copy.append(name,title,text);card.append(icon,copy);host.append(card);
      }
    }
  }
  function bountyModeReveal(st,now=Date.now()){
    const at=Number(st.bountyModeRevealAt)||0,age=now-at;
    if(!at||!st.active||!st.bountyModeRevealPending||st.startedAt||st.finishedAt)return null;
    if(!['common','individual'].includes(st.bountyMode))return null;
    const drawing=age<1600,individual=st.bountyMode==='individual';
    return {
      id:'MODE_'+String(st.sessionId||at),at,kind:'mode',mode:drawing?'drawing':st.bountyMode,drawing,
      icon:drawing?'🎲':individual?'🃏':'🎯',label:drawing?'LE BOUNTY DE CE SOIR…':'LE SORT A CHOISI !',
      name:drawing?'COMMUN OU INDIVIDUEL ?':individual?'BOUNTYS INDIVIDUELS SECRETS':'BOUNTY COMMUN SECRET',
      text:drawing?'Une cible pour toute la table ou une mission personnelle pour chacun ?':individual?'Chaque joueur reçoit sa propre mission secrète.':'Une même cible secrète pour toute la table.',
      extra:drawing?'':individual?'Consultez votre mission avec le bouton Bounty.':'La cible sera révélée à son élimination ou à la fin de la partie.'
    };
  }
  function liveCelebrations(st){
    const list=(Array.isArray(st.liveAlerts)?st.liveAlerts:[]).filter(a=>a.category==='individual'||/^BOUNTY INDIVIDUEL/.test(a.title||'')||!/^BOUNTY\b/i.test(a.title||'')).map(a=>{
      const title=String(a.title||'');
      const kind=a.category||(title.startsWith('ENJEU RÉALISÉ')?'objective':/BOUNTY INDIVIDUEL|MISSION INDIVIDUELLE|CONTRAT REMPLI/.test(title)?'individual':title.includes('RECORD')?'record':'achievement');
      return {...a,kind,name:a.player||(title.includes(' · ')?title.split(' · ').slice(1).join(' · '):''),label:kind==='objective'?'ENJEU DE PARTIE RÉALISÉ':kind==='individual'?'BOUNTY INDIVIDUEL RÉUSSI':kind==='achievement'?'ACCOMPLISSEMENT DÉBLOQUÉ':title};
    });
    // Une action peut avoir deux effets distincts : regrouper leur présentation,
    // tout en gardant les deux événements et leurs catégories dans le bilan.
    const merged=new Set();
    for(const objective of list.filter(e=>e.kind==='objective'&&e.actionAt&&e.player)){
      const achievements=list.filter(e=>e.kind==='achievement'&&e.player===objective.player&&e.actionAt===objective.actionAt&&!merged.has(e.id));
      if(!achievements.length)continue;
      objective.relatedIds=achievements.map(e=>e.id);
      objective.extra=achievements.map(e=>'🏅 ACCOMPLISSEMENT DÉBLOQUÉ · '+e.title.split(' · ').slice(1).join(' · ')+' — '+e.text).join('\n');
      achievements.forEach(e=>merged.add(e.id));
    }
    const modeReveal=bountyModeReveal(st);if(modeReveal)list.push(modeReveal);
    const duel=st.finalDuelEvent,alive=(st.players||[]).filter(p=>p.status==='in');
    if(st.startedAt&&!st.finishedAt&&alive.length===2&&duel?.players?.length===2&&duel.pairKey===JSON.stringify(alive.map(p=>p.name).sort())){
      list.push({id:duel.id,at:duel.at,kind:'duel',icon:'⚔️',label:'LE DUEL FINAL',duel});
    }
    const ev=st.mysteryBountyRevealed?st.mysteryBountyEvent:null;
    if(ev)list.push({id:ev.id,at:ev.at,kind:'common',icon:'🎯',label:ev.kind==='winner'?'BOUNTY COMMUN · LA CIBLE A SURVÉCU !':'BOUNTY COMMUN REMPORTÉ !',name:ev.player||'',text:ev.kind==='winner'?'était la cible secrète et remporte la partie.':'était la cible secrète de la table.',extra:ev.kind==='winner'?'':(ev.hunter||'')+' remporte le bounty'});
    return list.filter(e=>!merged.has(e.id)).sort((a,b)=>Number(a.at)-Number(b.at)||String(a.id).localeCompare(String(b.id)));
  }
  window.bptGetLiveCelebrations=liveCelebrations;
  function renderFinalDuel(box,event){
    let host=box.querySelector('.bpt-final-duel');
    if(!host){host=document.createElement('div');host.className='bpt-final-duel';box.querySelector('[data-bounty-close]').before(host);}
    host.hidden=event.kind!=='duel';if(host.hidden)return;
    const duel=event.duel,key=JSON.stringify(duel);if(host.dataset.content===key)return;
    host.dataset.content=key;host.replaceChildren();
    const add=(parent,tag,text,className)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;parent.append(node);return node};
    const head=add(host,'div',undefined,'bpt-duel-names');
    duel.players.forEach((player,i)=>{
      if(i)add(head,'div','VS','bpt-duel-vs');
      const person=add(head,'div',undefined,'bpt-duel-person');add(person,'h3',player.name);
      add(person,'div',(player.rank?(player.rank===1?'1er':player.rank+'e')+' au championnat':'Non classé')+' · '+player.games+' partie'+(player.games>1?'s':'')+' jouée'+(player.games>1?'s':''),'bpt-duel-meta');
    });
    const row=(metric,label,subtitle)=>{
      const line=add(host,'div',undefined,'bpt-duel-row'),left=Number(duel.players[0][metric])||0,right=Number(duel.players[1][metric])||0;
      add(line,'div',String(left),'bpt-duel-score'+(left>right?' is-ahead':left<right?' is-behind':''));
      const copy=add(line,'div',undefined,'bpt-duel-caption');add(copy,'b',label);add(copy,'small',subtitle);
      add(line,'div',String(right),'bpt-duel-score'+(right>left?' is-ahead':right<left?' is-behind':''));
    };
    row('ahead','Fois devant l’autre',duel.common?'sur '+duel.common+' partie'+(duel.common>1?'s':'')+' commune'+(duel.common>1?'s':''):'Aucune partie commune enregistrée');
    row('headsWins','Heads-up remportés',duel.headsUp?duel.headsUp+' confrontation'+(duel.headsUp>1?'s':''):'Premier heads-up entre eux');
  }
  function renderBounty(root,st){
    const box=root.querySelector('[data-role="bounty"]');if(!box)return;
    if(st.finishedAt||!root.getClientRects().length||st.preGamePending){box.hidden=true;return;}
    const pending=liveCelebrations(st).filter(ev=>{
      if(ev.kind==='mode')return true;
      if(bountyDismissed.has(ev.id))return false;
      try{return sessionStorage.getItem('bpt:bounty:'+ev.id)!=='1'}catch(_){return true}
    });
    const ev=pending[0];if(!ev){box.hidden=true;box.dataset.event='';return;}
    if(!bountySeenAt.has(ev.id))bountySeenAt.set(ev.id,Date.now());
    const first=box.hidden||box.dataset.event!==ev.id;box.hidden=false;box.dataset.event=ev.id;box.dataset.kind=ev.kind;box.dataset.mode=ev.mode||'';
    const card=box.querySelector('.bpt-bounty-card');card.setAttribute('aria-label',ev.label||ev.title||'Événement de la partie');
    box.querySelector('.bpt-bounty-icon').textContent=ev.icon||'🏆';
    const set=(role,value)=>{box.querySelector('[data-role="'+role+'"]').textContent=value};
    renderFinalDuel(box,ev);
    set('bountytitle',ev.label||ev.title||'');set('bountyname',ev.name||'');set('bountytext',ev.text||'');set('bountyhunter',ev.extra||'');
    const button=box.querySelector('[data-bounty-close]');
    const remain=0;
    const owner=!!api()?.isOwner?.();
    button.disabled=ev.kind==='mode'?(ev.drawing||!owner||bountyLaunchBusy):false;
    button.textContent=ev.kind==='duel'?'Place au duel !':ev.kind==='mode'?(ev.drawing?'Tirage en cours…':!owner?'En attente de l’organisateur':bountyLaunchBusy?'Lancement…':'▶ Lancer la partie'):pending.length>1?'Continuer · '+(pending.length-1)+' à suivre':'Continuer';
    button.onclick=async()=>{
      if(button.disabled)return;
      if(ev.kind==='mode'){
        bountyLaunchBusy=true;button.disabled=true;
        try{await api()?.startAfterBountyReveal?.();}catch(e){alert('Impossible de lancer la partie : '+(e?.message||e));}
        finally{bountyLaunchBusy=false;sync();}
        return;
      }
      for(const id of [ev.id,...(ev.relatedIds||[])]){bountyDismissed.add(id);try{sessionStorage.setItem('bpt:bounty:'+id,'1')}catch(_){}}sync();
    };
    const back=box.querySelector('[data-bounty-back]');
    if(back){back.hidden=ev.kind!=='mode'||!owner;back.disabled=bountyLaunchBusy;back.onclick=()=>doit('back-pregame',root.dataset.fs==='1');}

    if(first)card.focus({preventScroll:true});
  }
  function sync(){
    const st=state();queuePublishedLiveSummary(st);if(!st?.active)return;
    const idx=Math.max(0,Math.min(200,Number(st.levelIndex)||0)),cur=blindAt(idx),nx=blindAt(idx+1);
    const players=Array.isArray(st.players)?st.players:[],alive=players.filter(p=>p.status==='in').length+(players.some(p=>p.status==='winner')?1:0);
    const total=players.length*Number(st.startStack||0),avg=alive?total/alive:0,avgBB=cur.bb?Math.round(avg/cur.bb*10)/10:0;
    const x=api();
    const ownerRole=!!x?.isOwner?.();
    const duelPair=players.filter(p=>p.status==='in').map(p=>p.name).sort();
    if(ownerRole&&st.startedAt&&!st.finishedAt&&duelPair.length===2&&st.finalDuelEvent?.pairKey!==JSON.stringify(duelPair)&&!window.__bptRefreshingDuel){
      window.__bptRefreshingDuel=true;x.refreshObjectives?.().finally(()=>{window.__bptRefreshingDuel=false});
    }

    if(ownerRole&&st.startedAt&&Array.isArray(st.preGameBriefing)&&st.preGameBriefing.some(e=>e.title==='UN ACCOMPLISSEMENT À DÉBLOQUER'||!Object.prototype.hasOwnProperty.call(e,'objective')||(e.objective?.type==='place'&&e.objective.max>=(st.players||[]).length)||(/REVANCHE|FACE-À-FACE|DÉPASSER/.test(e.title||'')&&(!e.objective?.rival||!(st.players||[]).some(p=>p.name===e.objective.rival))))&&!window.__bptRefreshingObjectives){window.__bptRefreshingObjectives=true;x.refreshObjectives?.().finally(()=>{window.__bptRefreshingObjectives=false})}
    const myId=String(x?.deviceId?.()||'');
    const takeoverReq=st?.takeoverRequest||null;
    const myTakeover=!!(takeoverReq?.requesterId && String(takeoverReq.requesterId)===myId);
    const takeoverRemaining=myTakeover?Math.max(0,Math.ceil((30000-Math.max(0,Date.now()-Number(takeoverReq.requestedAt||0)))/1000)):0;
    const owner=`Organisateur · ${st.ownerLabel||'—'}`,structure=st.paceAdaptive===true?'Structure · Adaptatif':'Structure · Classique';
    document.querySelectorAll('.bpt484-live').forEach(r=>{
      if(r.classList.contains('is-spectator')===ownerRole)closeActionMenus();
      r.classList.toggle('is-spectator',!ownerRole);
      const rankingButton=r.querySelector('[data-do="live-ranking"]');if(rankingButton)rankingButton.hidden=!st.startedAt;
      r.classList.toggle('is-pregame',!!((st.preGamePending||st.bountyModeRevealPending)&&!st.startedAt));
      const requestPanel=r.querySelector('[data-role="takeoverrequest"]');
      if(requestPanel){
        requestPanel.hidden=!(ownerRole&&takeoverReq?.requesterId&&String(takeoverReq.requesterId)!==myId);
        const requestText=requestPanel.querySelector('[data-role="takeoverrequesttext"]');
        setText(requestText,(takeoverReq?.requesterLabel||'Un appareil')+' demande à reprendre la gestion du Live.');
      }
      const takeoverBtn=r.querySelector('.bpt484-takeover');
      if(takeoverBtn){
        takeoverBtn.classList.toggle('is-force',!!(myTakeover && takeoverRemaining<=0));
        if(ownerRole){takeoverBtn.disabled=true;setText(takeoverBtn,'Demander la reprise');}
        else if(!myTakeover){takeoverBtn.disabled=false;setText(takeoverBtn,'Demander la reprise');}
        else if(takeoverRemaining>0){takeoverBtn.disabled=true;setText(takeoverBtn,`Reprise possible dans ${takeoverRemaining} s`);}
        else{takeoverBtn.disabled=false;setText(takeoverBtn,'Forcer la reprise');}
      }
      const personalButton=r.querySelector('.bpt484-personal');if(personalButton){personalButton.hidden=false;setText(personalButton,'🎯 Bounty');}
      const toolsMenu=r.querySelector('[data-menu-panel="tools"]');
      if(toolsMenu){
        const reflection=toolsMenu.querySelector('[data-do="timer"]'),end=toolsMenu.querySelector('[data-do="end"]'),odds=toolsMenu.querySelector('[data-do="odds"]');
        if(reflection)reflection.hidden=!ownerRole;
        if(end)end.hidden=!ownerRole;
        if(odds)odds.hidden=false;
      }
      const chatButton=r.querySelector('.bpt484-head-tools .bpt484-chat');if(chatButton){const unread=Math.max(0,Number(api()?.getUnreadChatCount?.())||0);setText(chatButton,unread?'Chat ('+unread+')':'Chat');chatButton.setAttribute('aria-label',unread?'Chat · '+unread+' messages non lus':'Chat');}
      renderPreGame(r,st,ownerRole);
      renderBounty(r,st);
      const set=(role,val)=>{const e=r.querySelector(`[data-role="${role}"]`);setText(e,val)};
      set('owner',owner);
      set('structure',structure);
      set('part',`Partie n°${gameNo(st)}`);
      set('blinds',`${fmt(cur.sb)} / ${fmt(cur.bb)}`);
      const curDur=Math.max(1,Math.round(Number(st.levels?.[idx]?.durationSec||0)/60)||Math.round(Number(st.levels?.[idx]?.durationMin||0))||15);
      set('blinddur',`· ${curDur} min`);
      set('timer',$('live3Timer')?.textContent||'00:00');
      set('players',String(alive));
      set('avgchips',fmt(avg));
      set('avgbb',`${avgBB} BB`);
      set('next',`${fmt(nx.sb)} / ${fmt(nx.bb)}`);
      set('elapsed',$('live3Elapsed')?.textContent||'0 min');
      set('finish',$('live3EstimatedFinish')?.textContent||'—');
      set('delta',$('live3FinishDelta')?.textContent||'—');
      const activeTimer=st.activeReflectionTimer||null;
      const timerRemain=activeTimer?Math.max(0,Math.ceil((Number(activeTimer.endsAt||0)-Date.now())/1000)):0;
      const hud=r.querySelector('[data-role="specialhud"]');if(hud){hud.classList.toggle('show',!!activeTimer);
      set('timebankplayer',activeTimer?activeTimer.player:'');
      set('timebankcount',activeTimer?`${String(Math.floor(timerRemain/60)).padStart(2,'0')}:${String(timerRemain%60).padStart(2,'0')}`:'');
      const used=activeTimer?Number(st.reflectionTimers?.[activeTimer.player]?.used||activeTimer.timerNo||1):0;
      set('timebankmeta',activeTimer?`Timer ${used}/2 · 2 minutes`:'');
      const stopBtn=hud.querySelector('[data-timebank-stop]');if(stopBtn)stopBtn.style.display=activeTimer&&ownerRole?'inline-block':'none';}const de=r.querySelector('[data-role="delta"]');
      const dt=de?.textContent||'';
      const dm=Math.abs(Number((dt.match(/[-+]?\d+/)||['0'])[0])||0);
      de?.classList.toggle('is-alert',dm>=15);
      de?.classList.toggle('is-delay',/retard/i.test(dt));
      de?.classList.toggle('is-ahead',/avance/i.test(dt));
      set('mode',st.paceAdaptive===true?'Adaptatif':'Classique');
      set('level',idx<25?`${idx+1} / 25`:String(idx+1));
      const pb=r.querySelector('[data-do="pause"]');setText(pb,st.running?'Pause':(st.startedAt?'Reprendre':'Démarrer'))});
    if(ownerRole && st.activeReflectionTimer && Number(st.activeReflectionTimer.endsAt||0)<=Date.now() && !window.__bptStoppingExpiredTimer){window.__bptStoppingExpiredTimer=true;api()?.stopReflectionTimer?.().finally(()=>{window.__bptStoppingExpiredTimer=false})}
    refreshPersonalBounty();refreshLiveObjectives();refreshLiveRanking();scheduleFitLiveTexts();
    if(!repairTried){const bad=(st.levels||[]).slice(0,Math.min(25,(st.levels||[]).length)).some((lv,i)=>{const b=blindAt(i);return Number(lv?.sb)!==b.sb||Number(lv?.bb)!==b.bb});if(bad&&api()?.isOwner?.()){repairTried=true;api()?.repairStandardBlinds?.().catch(console.warn)}}
  }
  function enforceNav(){
    const apply=()=>{const desktop=window.innerWidth>900;const plus=$('bptMobileMoreTopBtn'),menu=$('bptMobileMoreTopMenu');if(desktop){plus?.style.setProperty('display','none','important');menu?.style.setProperty('display','none','important');if(menu)menu.hidden=true}else{plus?.style.removeProperty('display')}document.querySelector('[data-mobile-nav-view="profile"]')?.remove()};
    apply();window.addEventListener('resize',apply);setInterval(apply,1500);
  }
  let syncPending=false;
  function scheduleSync(){
    if(syncPending)return;
    syncPending=true;
    setTimeout(()=>{syncPending=false;sync();},0);
  }
  const obs=new MutationObserver(scheduleSync);
  function observe(){['live3Timer','live3Elapsed','live3EstimatedFinish','live3FinishDelta'].forEach(id=>{const n=$(id);if(n)obs.observe(n,{childList:true,subtree:true,characterData:true})})}
  window.addEventListener('resize',()=>{closeActionMenus();document.querySelectorAll('.bpt484-live').forEach(root=>delete root.dataset.fitSignature);scheduleFitLiveTexts();});
  function boot(){
    install();observe();setInterval(scheduleSync,500);setTimeout(scheduleFitLiveTexts,120);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
