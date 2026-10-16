(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').trim();
  let step=1,lastSig='',timer=null,resizeObserver=null;

  function legacy(){return {
    location:$('live3Location'),date:$('live3Date'),stack:$('live3Stack'),buyIn:$('live3BuyIn'),hours:$('live3TargetHours'),structure:$('live3StructureMode'),
    picker:$('live3PlayerPicker'),create:$('live3CreateBtn')
  }}
  function api(){return window.BPTLive3||null}
  function state(){return api()?.getState?.()||null}
  function activeView(){return $('live3')?.classList.contains('active')}

  function ensure(){
    let root=$('bptLandscapeLive');
    if(root)return root;
    root=document.createElement('div');
    root.id='bptLandscapeLive';
    root.innerHTML='<div class="bptll-shell"><header class="bptll-head"><div class="bptll-head-left"><div class="bptll-kicker" id="bptllKicker">PRÉPARATION</div><h2 class="bptll-title" id="bptllTitle">Paramètres de la partie</h2></div><div class="bptll-step" id="bptllStep">Étape 1 / 4</div></header><main class="bptll-body" id="bptllBody"></main><footer class="bptll-foot" id="bptllFoot"></footer></div>';
    $('live3')?.append(root);
    const rotate=document.createElement('div');
    rotate.id='bptLandscapeRotate';
    rotate.innerHTML='<div class="inner"><div class="icon">↻</div><strong>Tournez le téléphone</strong><span>Le Live BPT s’utilise en mode paysage pour garder tous les boutons, textes et joueurs visibles.</span></div>';
    document.body.append(rotate);
    resizeObserver=new ResizeObserver(()=>{});
    resizeObserver.observe(root);
    return root;
  }

  function fitViewport(){
    const root=ensure(),nav=$('nav');if(!root)return;
    const vv=window.visualViewport;
    const vh=Math.round(vv?.height||window.innerHeight||document.documentElement.clientHeight||600);
    // En Pré-Live / Live, l'interface métier occupe tout le viewport visible.
    // Le bandeau BPT et la navigation hôte sont masqués : aucune hauteur n'est réservée.
    const topEdge=0;
    const available=Math.max(210,vh);
    root.style.top=topEdge+'px';
    root.style.height=available+'px';
    $('bptLandscapeRotate')?.classList.toggle('is-visible',activeView());
    // La liste des joueurs gère sa propre zone scrollable ; aucun recalcul de grille nécessaire.
  }

  function show(v){
    ensure().classList.toggle('is-visible',!!v);
    $('bptLandscapeRotate')?.classList.toggle('is-visible',!!v);
    document.documentElement.classList.toggle('bpt-live-landscape-open',!!v);
    document.body.classList.toggle('bpt-live-landscape-open',!!v);
    requestAnimationFrame(fitViewport);
  }
  function title(kicker,label,n){$('bptllKicker').textContent=kicker;$('bptllTitle').textContent=label;$('bptllStep').textContent='Étape '+n+' / 4'}
  function button(label,primary,handler,disabled=false){const b=document.createElement('button');b.type='button';b.className='bptll-btn'+(primary?' primary':'');b.textContent=label;b.disabled=disabled;b.addEventListener('click',handler);return b}
  function footer(buttons){const f=$('bptllFoot');f.className='bptll-foot'+(buttons.length===1?' one':'');f.replaceChildren(...buttons)}

  function renderStep1(){
    title('PRÉPARATION','Paramètres de la partie',1);
    const l=legacy(),body=$('bptllBody');
    const defs=[['Nom / lieu','text',l.location],['Date','date',l.date],['Tapis de départ','number',l.stack],['Buy-in (€)','number',l.buyIn],['Durée souhaitée','select',l.hours],['Structure','select',l.structure]];
    const form=document.createElement('div');form.className='bptll-form';
    defs.forEach(([label,type,src])=>{
      const wrap=document.createElement('div');wrap.className='bptll-field';
      const lab=document.createElement('label');lab.textContent=label;
      let el;
      if(type==='select'){
        el=document.createElement('select');
        [...(src?.options||[])].forEach(o=>{const x=document.createElement('option');x.value=o.value;x.textContent=o.textContent;x.selected=o.value===src.value;el.append(x)});
      }else{
        el=document.createElement('input');el.type=type;el.value=src?.value||'';
        if(src?.min)el.min=src.min;if(src?.step)el.step=src.step;
      }
      const sync=()=>{if(!src)return;src.value=el.value;src.dispatchEvent(new Event('input',{bubbles:true}));src.dispatchEvent(new Event('change',{bubbles:true}))};
      el.addEventListener('input',sync);el.addEventListener('change',sync);
      wrap.append(lab,el);form.append(wrap);
    });
    body.replaceChildren(form);
    footer([button('Continuer →',true,()=>{if(!String(l.location?.value||'').trim()){alert('Indiquez le nom / lieu de la partie.');return;}step=2;render(true)})]);
  }

  function playerData(){
    return [...(legacy().picker?.querySelectorAll('label.bpt-live3-player-check')||[])].map(label=>{
      const cb=label.querySelector('input[type="checkbox"]');
      return {name:cb?.value||label.querySelector('span')?.textContent||'',checked:!!cb?.checked,cb};
    }).filter(x=>x.name);
  }

  function participationCount(name){
    try{
      if(typeof bptPlayerParticipationCount==='function')return Number(bptPlayerParticipationCount(name)||0);
    }catch(_e){}
    try{
      const target=norm(name);
      const rows=Array.isArray(db?.history)?db.history:[];
      return rows.reduce((n,row)=>norm(row?.player)===target?n+1:n,0);
    }catch(_e){return 0}
  }

  function nicknameFor(name){
    try{
      if(typeof playerNicknameInfo==='function')return String(playerNicknameInfo(name)?.primary||'').trim();
    }catch(_e){}
    try{
      const p=(db?.players||[]).find(x=>norm(x?.name)===norm(name));
      return String(p?.nickname||'').trim();
    }catch(_e){return ''}
  }

  function allPlayerData(){
    const selected=new Map(playerData().map(p=>[norm(p.name),p]));
    let players=[];
    try{players=Array.isArray(db?.players)?db.players:[]}catch(_e){}
    const seen=new Set(),out=[];
    players.forEach(rec=>{
      const name=String(rec?.name||'').trim();
      const key=norm(name);if(!name||seen.has(key))return;seen.add(key);
      const legacyRec=selected.get(key);
      out.push({
        name,
        nickname:nicknameFor(name),
        participations:participationCount(name),
        checked:!!legacyRec?.checked,
        cb:legacyRec?.cb||null
      });
    });
    selected.forEach((legacyRec,key)=>{
      if(seen.has(key))return;
      out.push({name:legacyRec.name,nickname:nicknameFor(legacyRec.name),participations:participationCount(legacyRec.name),checked:legacyRec.checked,cb:legacyRec.cb});
    });
    return out.sort((a,b)=>b.participations-a.participations||a.name.localeCompare(b.name,'fr',{sensitivity:'base'}));
  }

  function addPlayerDirect(name){
    const clean=String(name||'').trim().replace(/\s+/g,' ');if(!clean)return null;
    let rec=null;
    try{
      rec=(db?.players||[]).find(p=>norm(p?.name)===norm(clean))||null;
      if(rec){
        rec.active=true;
      }else{
        rec={name:clean,nickname:'',active:true};
        if(!Array.isArray(db.players))db.players=[];
        db.players.push(rec);
      }
      if(typeof saveDB==='function')saveDB();
      try{window.renderAll?.()}catch(_e){}
      try{window.bptNotifySettingsPlayers?.()}catch(_e){}
    }catch(_e){return null}

    const canonical=String(rec?.name||clean).trim();
    const picker=$('live3PlayerPicker');
    if(picker){
      let cb=[...picker.querySelectorAll('input[type="checkbox"]')].find(x=>norm(x.value)===norm(canonical));
      if(!cb){
        const label=document.createElement('label');label.className='bpt-live3-player-check';
        cb=document.createElement('input');cb.type='checkbox';cb.value=canonical;
        const span=document.createElement('span');span.textContent=canonical;
        label.append(cb,span);picker.append(label);
      }
      cb.checked=true;
      cb.dispatchEvent(new Event('change',{bubbles:true}));
    }
    return canonical;
  }

  let playerQuery='';

  function renderStep2(){
    title('PRÉPARATION','Sélection des joueurs',2);
    const body=$('bptllBody');
    const all=allPlayerData();
    const shell=document.createElement('div');shell.className='bptll-playerselect';

    const tools=document.createElement('div');tools.className='bptll-player-tools';
    const search=document.createElement('input');
    search.type='search';search.className='bptll-player-search';search.placeholder='Rechercher un joueur (nom ou pseudo)…';search.autocomplete='off';search.value=playerQuery;
    const addBox=document.createElement('div');addBox.className='bptll-player-add';
    const addLabel=document.createElement('strong');addLabel.textContent='Ajouter un joueur';
    const addInput=document.createElement('input');addInput.type='text';addInput.placeholder='Nom du joueur…';addInput.autocomplete='off';
    const addBtn=button('Ajouter',true,()=>{const name=addInput.value.trim();if(!name){addInput.focus();return;}const added=addPlayerDirect(name);if(added){addInput.value='';playerQuery='';render(true)}});
    addInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addBtn.click()}});
    addBox.append(addLabel,addInput,addBtn);tools.append(search,addBox);

    const meta=document.createElement('div');meta.className='bptll-player-meta';
    const selectedCount=document.createElement('strong');
    const total=document.createElement('span');
    meta.append(selectedCount,total);

    const scroll=document.createElement('div');scroll.className='bptll-player-scroll';
    const grid=document.createElement('div');grid.className='bptll-player-list';
    scroll.append(grid);

    function updateSelected(){
      const n=all.filter(p=>p.checked).length;
      selectedCount.textContent=n+' sélectionné(s)';
    }

    function makeCard(p){
      const lab=document.createElement('label');lab.className='bptll-player-card'+(p.checked?' is-selected':'');
      const cb=document.createElement('input');cb.type='checkbox';cb.checked=p.checked;
      const avatar=document.createElement('span');avatar.className='bptll-player-avatar';
      avatar.textContent=p.name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();
      const copy=document.createElement('span');copy.className='bptll-player-copy';
      const name=document.createElement('strong');name.textContent=p.name;
      const stats=document.createElement('small');stats.textContent=p.participations+' participation'+(p.participations===1?'':'s');
      copy.append(name,stats);
      if(p.nickname){const nick=document.createElement('em');nick.textContent=p.nickname;copy.append(nick)}
      cb.addEventListener('change',()=>{
        if(p.cb){
          p.cb.checked=cb.checked;
          p.cb.dispatchEvent(new Event('change',{bubbles:true}));
          p.checked=cb.checked;
          lab.classList.toggle('is-selected',cb.checked);
          updateSelected();
        }else if(cb.checked){
          const added=addPlayerDirect(p.name);if(added){p.checked=true;render(true);}
        }
      });
      lab.append(cb,avatar,copy);return lab;
    }

    function draw(){
      playerQuery=search.value;
      const q=norm(playerQuery);
      const rows=all.filter(p=>!q||norm(p.name).includes(q)||norm(p.nickname).includes(q));
      grid.replaceChildren();
      rows.forEach(p=>grid.append(makeCard(p)));
      if(!rows.length){
        const empty=document.createElement('div');empty.className='bptll-player-empty';empty.textContent='Aucun joueur trouvé.';grid.append(empty);
      }
      total.textContent=rows.length+' joueur'+(rows.length===1?'':'s');
      updateSelected();
    }

    search.addEventListener('input',draw);
    shell.append(tools,meta,scroll);body.replaceChildren(shell);

    footer([
      button('← Retour',false,()=>{step=1;render(true)}),
      button('Continuer →',true,()=>{const n=playerData().filter(x=>x.checked).length;if(n<2){alert('Sélectionnez au moins 2 joueurs.');return;}legacy().create?.click()})
    ]);
    requestAnimationFrame(draw);
  }

  function oddsFor(st,type,name){const raw=st?.betting?.odds?.[type]?.[name];const n=Number(raw);return Number.isFinite(n)&&n>0?n:1}
  function renderStep3(st){
    title('AVANT LE LANCEMENT','Placez vos paris',3);
    const body=$('bptllBody'),players=(st.players||[]).map(p=>p.name),raw=String(api()?.getIdentityName?.()||'').trim();
    const identity=players.find(p=>norm(p)===norm(raw))||raw,me=st?.betting?.bets?.[identity]||{},can=!!identity&&players.some(p=>norm(p)===norm(identity));
    const wrap=document.createElement('div');wrap.className='bptll-bets';
    const note=document.createElement('p');note.className='bptll-bet-note';note.textContent='Un pari vainqueur et/ou un pari 1er éliminé. Vous pouvez aussi choisir « Pas de pari ».';wrap.append(note);
    ['winner','firstEliminated'].forEach(type=>{
      const card=document.createElement('div');card.className='bptll-bet-card';
      const head=document.createElement('div');head.className='bptll-bet-head';head.innerHTML='<strong>'+(type==='winner'?'Vainqueur':'1er éliminé')+'</strong><span>0,50 €</span>';
      const sel=document.createElement('select');sel.className='bptll-select';
      const none=document.createElement('option');none.value='';none.textContent='Pas de pari';sel.append(none);
      players.slice().sort((a,b)=>oddsFor(st,type,a)-oddsFor(st,type,b)).forEach(name=>{const o=document.createElement('option');o.value=name;o.textContent=name+' · Cote '+oddsFor(st,type,name).toFixed(2).replace('.',',');o.selected=me[type]===name;sel.append(o)});
      sel.addEventListener('change',async()=>{await api()?.setLivePrediction?.(type,sel.value);render(true)});card.append(head,sel);wrap.append(card);
    });
    const confirm=document.createElement('div');confirm.className='bptll-confirm';
    const copy=document.createElement('div');copy.className='bptll-confirm-copy';
    const strong=document.createElement('strong');strong.textContent=me.confirmed?'✓ Pari enregistré':'Sélectionnez puis validez';
    const small=document.createElement('small');small.textContent=me.confirmed?'Votre pari est validé.':can?'0,50 € par pari sélectionné':'Connexion joueur requise';copy.append(strong,small);
    const validate=button(me.confirmed?'Pari validé':can?'Valider le pari':'Connexion joueur requise',true,async()=>{if(!can||me.confirmed)return;await api()?.confirmLivePredictions?.();render(true)},!can||me.confirmed);
    confirm.append(copy,validate);wrap.append(confirm);body.replaceChildren(wrap);
    const owner=!!api()?.isOwner?.();
    const spectator=(typeof window.liveIsSpectator==='function'&&window.liveIsSpectator())||!owner;
    footer(spectator
      ? [button('← Retour aux paramètres',false,()=>api()?.returnToPreGameSettings?.())]
      : [button('← Retour aux paramètres',false,()=>api()?.returnToPreGameSettings?.()),button('▶ Révéler le type de bounty',true,()=>api()?.launchPreGame?.())]
    );
  }

  function renderStep4(st){
    title('AVANT LE LANCEMENT','Type de bounty révélé',4);
    const body=$('bptllBody'),individual=st.bountyMode==='individual',age=Date.now()-Number(st.bountyModeRevealAt||Date.now()),drawing=age<1600;
    const wrap=document.createElement('div');wrap.className='bptll-bounty';
    const icon=document.createElement('div');icon.className='bptll-bounty-icon';icon.textContent=drawing?'🎲':individual?'🃏':'🎯';
    const lab=document.createElement('div');lab.className='bptll-bounty-label';lab.textContent=drawing?'LE BOUNTY DE CE SOIR…':'LE SORT A CHOISI !';
    const name=document.createElement('div');name.className='bptll-bounty-name';name.textContent=drawing?'COMMUN OU INDIVIDUEL ?':individual?'BOUNTYS INDIVIDUELS SECRETS':'BOUNTY COMMUN SECRET';
    const p=document.createElement('p');p.textContent=drawing?'Tirage en cours…':individual?'Chaque joueur reçoit sa propre mission secrète.':'Une même cible secrète pour toute la table.';
    wrap.append(icon,lab,name,p);body.replaceChildren(wrap);
    const owner=!!api()?.isOwner?.();
    footer([button('← Retour aux paris',false,()=>api()?.returnToBetting?.(),!owner),button(drawing?'Tirage en cours…':'▶ Lancer la partie',true,()=>api()?.startAfterBountyReveal?.(),!owner||drawing)]);
    if(drawing)setTimeout(()=>render(true),1700);
  }

  function render(force=false){
    ensure();fitViewport();
    if(!activeView()){show(false);return}
    const st=state();let mode;
    if(st?.active&&!st.startedAt&&st.bountyModeRevealPending)mode='4';
    else if(st?.active&&!st.startedAt&&st.preGamePending)mode='3';
    else if(st?.active)mode='game';
    else mode=String(step);
    if(mode==='game'){show(false);return}
    show(true);
    const sig=mode+'|'+JSON.stringify(st?{sid:st.sessionId,pre:st.preGamePending,b:st.bountyModeRevealPending,at:st.bountyModeRevealAt,bets:st.betting?.bets,players:(st.players||[]).map(p=>p.name)}:{step});
    if(!force&&sig===lastSig)return;lastSig=sig;
    if(mode==='1')renderStep1();else if(mode==='2')renderStep2();else if(mode==='3')renderStep3(st);else if(mode==='4')renderStep4(st);
  }

  function boot(){
    ensure();fitViewport();render(true);
    const rerender=()=>{
      fitViewport();
      const ae=document.activeElement;
      const editing=!!(ae&&ae.closest?.('#bptLandscapeLive')&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName));
      if(editing)return;
      render(true);
    };
    window.addEventListener('resize',rerender,{passive:true});
    window.visualViewport?.addEventListener('resize',rerender,{passive:true});
    window.visualViewport?.addEventListener('scroll',fitViewport,{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(rerender,120),{passive:true});
    timer=setInterval(()=>render(false),500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
