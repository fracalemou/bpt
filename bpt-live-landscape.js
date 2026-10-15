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
    resizeObserver=new ResizeObserver(()=>{if(step===2)requestAnimationFrame(fitPlayerGrid)});
    resizeObserver.observe(root);
    return root;
  }

  function fitViewport(){
    const root=ensure(),nav=$('nav');if(!root)return;
    const vv=window.visualViewport;
    const vh=Math.round(vv?.height||window.innerHeight||document.documentElement.clientHeight||600);
    const navBottom=nav?Math.max(0,Math.round(nav.getBoundingClientRect().bottom)):0;
    const available=Math.max(210,vh-navBottom);
    root.style.top=navBottom+'px';
    root.style.height=available+'px';
    $('bptLandscapeRotate')?.classList.toggle('is-visible',activeView());
    if(step===2)requestAnimationFrame(fitPlayerGrid);
  }

  function show(v){ensure().classList.toggle('is-visible',!!v);$('bptLandscapeRotate')?.classList.toggle('is-visible',!!v)}
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
  function inactivePlayers(){
    try{
      const players=(typeof db!=='undefined'&&Array.isArray(db?.players))?db.players:[];
      return players.filter(p=>p&&p.active!==true&&String(p.name||'').trim()).map(p=>String(p.name).trim()).sort((a,b)=>a.localeCompare(b,'fr',{sensitivity:'base'}));
    }catch(_e){return []}
  }

  function chooseGrid(count,w,h){
    if(!count||w<1||h<1)return {cols:1,rows:1,font:12};
    const gap=Math.max(3,Math.min(9,h*.018));
    let best=null;
    for(let cols=2;cols<=Math.min(count,12);cols++){
      const rows=Math.ceil(count/cols);
      const cw=(w-gap*(cols-1))/cols, ch=(h-gap*(rows-1))/rows;
      if(cw<=0||ch<=0)continue;
      const font=Math.max(9,Math.min(16,ch*.34,cw*.115));
      const valid=cw>=66&&ch>=24&&font>=9.5;
      const score=(valid?1000:0)+font*8+Math.min(cw/95,2)*5-Math.abs(cw/ch-3.0);
      if(!best||score>best.score)best={cols,rows,font,score};
    }
    return best||{cols:2,rows:Math.ceil(count/2),font:9};
  }
  function fitPlayerGrid(){
    const grid=$('bptllPlayerGrid');if(!grid)return;
    const g=chooseGrid(grid.children.length,grid.clientWidth,grid.clientHeight);
    grid.style.setProperty('--bptll-cols',String(g.cols));
    grid.style.setProperty('--bptll-rows',String(g.rows));
    grid.style.setProperty('--bptll-player-font',g.font.toFixed(1)+'px');
  }

  function useLegacyAdd(name){
    const clean=String(name||'').trim().replace(/\s+/g,' ');if(!clean)return;
    const input=$('live3NewPlayerName'),add=$('live3AddNewPlayerBtn');if(!input||!add)return;
    input.value=clean;add.click();setTimeout(()=>render(true),100);
  }

  function renderStep2(){
    title('PRÉPARATION','Sélection des joueurs',2);
    const body=$('bptllBody'),data=playerData();
    const wrap=document.createElement('div');wrap.className='bptll-players-wrap';
    const main=document.createElement('div');main.className='bptll-players-main';
    const summary=document.createElement('div');summary.className='bptll-players-summary';
    const selectedCount=document.createElement('strong');selectedCount.textContent=data.filter(x=>x.checked).length+' sélectionné(s)';
    const total=document.createElement('span');total.textContent=data.length+' joueur(s) actif(s)';summary.append(selectedCount,total);
    const grid=document.createElement('div');grid.className='bptll-players';grid.id='bptllPlayerGrid';
    data.forEach(p=>{
      const lab=document.createElement('label');lab.className='bptll-player'+(p.checked?' is-selected':'');
      const cb=document.createElement('input');cb.type='checkbox';cb.checked=p.checked;
      const name=document.createElement('span');name.textContent=p.name;
      cb.addEventListener('change',()=>{p.cb.checked=cb.checked;p.cb.dispatchEvent(new Event('change',{bubbles:true}));lab.classList.toggle('is-selected',cb.checked);selectedCount.textContent=grid.querySelectorAll('input:checked').length+' sélectionné(s)'});
      lab.append(cb,name);grid.append(lab);
    });
    main.append(summary,grid);

    const panel=document.createElement('div');panel.className='bptll-add-panel';
    const inactiveLabel=document.createElement('div');inactiveLabel.className='bptll-add-label';inactiveLabel.textContent='Joueur inactif';
    const inactiveActions=document.createElement('div');inactiveActions.className='bptll-add-actions';
    const inactive=inactivePlayers();
    const select=document.createElement('select');select.className='bptll-add-select';
    const opt=document.createElement('option');opt.value='';opt.textContent=inactive.length?'Choisir…':'Aucun joueur inactif';select.append(opt);
    inactive.forEach(name=>{const o=document.createElement('option');o.value=name;o.textContent=name;select.append(o)});
    const reactivate=button('Ajouter',false,()=>{if(select.value)useLegacyAdd(select.value)},!inactive.length);
    inactiveActions.append(select,reactivate);
    const newLabel=document.createElement('div');newLabel.className='bptll-add-label';newLabel.textContent='Nouveau joueur';
    const newActions=document.createElement('div');newActions.className='bptll-add-actions';
    const input=document.createElement('input');input.className='bptll-add-input';input.type='text';input.placeholder='Nom du joueur';input.autocomplete='off';
    const create=button('Créer + ajouter',true,()=>{const name=input.value.trim();if(!name){input.focus();return;}useLegacyAdd(name);input.value=''});
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();create.click()}});
    newActions.append(input,create);panel.append(inactiveLabel,inactiveActions,newLabel,newActions);
    wrap.append(main,panel);body.replaceChildren(wrap);
    requestAnimationFrame(fitPlayerGrid);
    footer([button('← Retour',false,()=>{step=1;render(true)}),button('Continuer →',true,()=>{const n=playerData().filter(x=>x.checked).length;if(n<2){alert('Sélectionnez au moins 2 joueurs.');return;}legacy().create?.click()})]);
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
    footer([button('← Retour aux paramètres',false,()=>api()?.returnToPreGameSettings?.()),button('▶ Révéler le type de bounty',true,()=>api()?.launchPreGame?.(),!owner)]);
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
    const rerender=()=>{fitViewport();render(true)};
    window.addEventListener('resize',rerender,{passive:true});
    window.visualViewport?.addEventListener('resize',rerender,{passive:true});
    window.visualViewport?.addEventListener('scroll',fitViewport,{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(rerender,120),{passive:true});
    timer=setInterval(()=>render(false),500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
