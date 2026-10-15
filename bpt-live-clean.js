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
    let root=$('bptCleanLive');
    if(root)return root;
    root=document.createElement('div');
    root.id='bptCleanLive';
    root.innerHTML='<div class="bptcl-shell"><header class="bptcl-head"><div class="bptcl-head-left"><div class="bptcl-kicker" id="bptclKicker">PRÉPARATION</div><h2 class="bptcl-title" id="bptclTitle">Paramètres de la partie</h2></div><div class="bptcl-step" id="bptclStep">Étape 1 / 4</div></header><main class="bptcl-body" id="bptclBody"></main><footer class="bptcl-foot" id="bptclFoot"></footer></div>';
    $('live3')?.append(root);
    resizeObserver=new ResizeObserver(()=>{ if(step===2)requestAnimationFrame(fitPlayerGrid); });
    resizeObserver.observe(root);
    return root;
  }

  function fitViewport(){
    const root=ensure(),nav=$('nav'); if(!root)return;
    const vv=window.visualViewport;
    const vh=Math.round(vv?.height||window.innerHeight||document.documentElement.clientHeight||600);
    const navBottom=nav?Math.max(0,Math.round(nav.getBoundingClientRect().bottom)):0;
    const available=Math.max(220,vh-navBottom);
    root.style.top=navBottom+'px';
    root.style.height=available+'px';
    if(step===2)requestAnimationFrame(fitPlayerGrid);
  }

  function show(v){ensure().classList.toggle('is-visible',!!v)}
  function title(kicker,label,n){$('bptclKicker').textContent=kicker;$('bptclTitle').textContent=label;$('bptclStep').textContent='Étape '+n+' / 4'}
  function button(label,primary,handler,disabled=false){const b=document.createElement('button');b.type='button';b.className='bptcl-btn'+(primary?' primary':'');b.textContent=label;b.disabled=disabled;b.addEventListener('click',handler);return b}
  function footer(buttons){const f=$('bptclFoot');f.className='bptcl-foot'+(buttons.length===1?' one':'');f.replaceChildren(...buttons)}

  function renderStep1(){
    title('PRÉPARATION','Paramètres de la partie',1);
    const l=legacy(),body=$('bptclBody');
    const defs=[['Nom / lieu','text',l.location],['Date','date',l.date],['Tapis de départ','number',l.stack],['Buy-in (€)','number',l.buyIn],['Durée souhaitée','select',l.hours],['Structure','select',l.structure]];
    const form=document.createElement('div');form.className='bptcl-form';
    defs.forEach(([label,type,src])=>{
      const wrap=document.createElement('div');wrap.className='bptcl-field';
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
    try{return (window.db?.players||[]).filter(p=>p&&p.active!==true&&String(p.name||'').trim()).map(p=>String(p.name).trim()).sort((a,b)=>a.localeCompare(b,'fr',{sensitivity:'base'}))}catch(_e){return []}
  }

  function chooseGrid(count,w,h){
    if(!count||w<1||h<1)return {cols:1,rows:1,font:12};
    const gap=Math.max(3,Math.min(9,h*.015));
    let best=null;
    const maxCols=Math.min(count,12);
    for(let cols=1;cols<=maxCols;cols++){
      const rows=Math.ceil(count/cols);
      const cellW=(w-gap*(cols-1))/cols;
      const cellH=(h-gap*(rows-1))/rows;
      if(cellW<=0||cellH<=0)continue;
      const readable=Math.min(cellW/92,cellH/31);
      const balance=Math.min(cellW/Math.max(1,cellH*2.5),1.6);
      const score=readable*10+balance-Math.max(0,cols-7)*.2;
      const valid=cellW>=62&&cellH>=24;
      if(!best||(valid&&!best.valid)||(valid===best.valid&&score>best.score))best={cols,rows,cellW,cellH,score,valid};
    }
    const b=best||{cols:1,rows:count,cellW:w,cellH:h/count};
    const font=Math.max(9.5,Math.min(16,b.cellH*.34,b.cellW*.115));
    return {cols:b.cols,rows:b.rows,font};
  }

  function fitPlayerGrid(){
    const grid=$('bptclPlayerGrid');if(!grid)return;
    const count=grid.children.length,w=grid.clientWidth,h=grid.clientHeight;
    const g=chooseGrid(count,w,h);
    grid.style.setProperty('--bptcl-cols',String(g.cols));
    grid.style.setProperty('--bptcl-rows',String(g.rows));
    grid.style.setProperty('--bptcl-player-font',g.font.toFixed(1)+'px');
  }

  function useLegacyAdd(name){
    const clean=String(name||'').trim().replace(/\s+/g,' ');if(!clean)return;
    const input=$('live3NewPlayerName'),add=$('live3AddNewPlayerBtn');if(!input||!add)return;
    input.value=clean;add.click();
    setTimeout(()=>render(true),80);
  }

  function renderStep2(){
    title('PRÉPARATION','Sélection des joueurs',2);
    const body=$('bptclBody'),data=playerData();
    const wrap=document.createElement('div');wrap.className='bptcl-players-wrap';
    const main=document.createElement('div');main.className='bptcl-players-main';
    const summary=document.createElement('div');summary.className='bptcl-players-summary';
    const selectedCount=document.createElement('strong');selectedCount.textContent=data.filter(x=>x.checked).length+' sélectionné(s)';
    const total=document.createElement('span');total.textContent=data.length+' joueur(s) actif(s)';summary.append(selectedCount,total);
    const grid=document.createElement('div');grid.className='bptcl-players';grid.id='bptclPlayerGrid';
    data.forEach(p=>{
      const lab=document.createElement('label');lab.className='bptcl-player'+(p.checked?' is-selected':'');
      const cb=document.createElement('input');cb.type='checkbox';cb.checked=p.checked;
      const name=document.createElement('span');name.textContent=p.name;
      cb.addEventListener('change',()=>{
        p.cb.checked=cb.checked;p.cb.dispatchEvent(new Event('change',{bubbles:true}));
        lab.classList.toggle('is-selected',cb.checked);
        selectedCount.textContent=grid.querySelectorAll('input:checked').length+' sélectionné(s)';
      });
      lab.append(cb,name);grid.append(lab);
    });
    main.append(summary,grid);

    const add=document.createElement('div');add.className='bptcl-add-row';
    const inactive=inactivePlayers();
    const select=document.createElement('select');select.className='bptcl-add-select';
    const opt=document.createElement('option');opt.value='';opt.textContent=inactive.length?'Réactiver un joueur inactif…':'Aucun joueur inactif';select.append(opt);
    inactive.forEach(name=>{const o=document.createElement('option');o.value=name;o.textContent=name;select.append(o)});
    const reactivate=button('Ajouter',false,()=>{if(select.value)useLegacyAdd(select.value)},!inactive.length);reactivate.classList.add('bptcl-add-btn');
    const input=document.createElement('input');input.className='bptcl-add-input';input.type='text';input.placeholder='Nouveau joueur';input.autocomplete='off';
    const create=button('Créer + ajouter',true,()=>{const name=input.value.trim();if(!name){input.focus();return;}useLegacyAdd(name);input.value=''});create.classList.add('bptcl-add-btn');
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();create.click()}});
    add.append(select,reactivate,input,create);
    wrap.append(main,add);body.replaceChildren(wrap);
    requestAnimationFrame(fitPlayerGrid);
    footer([
      button('← Retour',false,()=>{step=1;render(true)}),
      button('Continuer →',true,()=>{const n=playerData().filter(x=>x.checked).length;if(n<2){alert('Sélectionnez au moins 2 joueurs.');return;}legacy().create?.click()})
    ]);
  }

  function oddsFor(st,type,name){const raw=st?.betting?.odds?.[type]?.[name];const n=Number(raw);return Number.isFinite(n)&&n>0?n:1}
  function renderStep3(st){
    title('AVANT LE LANCEMENT','Placez vos paris',3);
    const body=$('bptclBody'),players=(st.players||[]).map(p=>p.name),raw=String(api()?.getIdentityName?.()||'').trim();
    const identity=players.find(p=>norm(p)===norm(raw))||raw,me=st?.betting?.bets?.[identity]||{},can=!!identity&&players.some(p=>norm(p)===norm(identity));
    const wrap=document.createElement('div');wrap.className='bptcl-bets';
    const note=document.createElement('p');note.className='bptcl-bet-note';note.textContent='Un pari vainqueur et/ou un pari 1er éliminé. Vous pouvez aussi choisir « Pas de pari ».';wrap.append(note);
    ['winner','firstEliminated'].forEach(type=>{
      const card=document.createElement('div');card.className='bptcl-bet-card';
      const head=document.createElement('div');head.className='bptcl-bet-head';head.innerHTML='<strong>'+(type==='winner'?'Vainqueur':'1er éliminé')+'</strong><span>0,50 €</span>';
      const sel=document.createElement('select');sel.className='bptcl-select';
      const none=document.createElement('option');none.value='';none.textContent='Pas de pari';sel.append(none);
      players.slice().sort((a,b)=>oddsFor(st,type,a)-oddsFor(st,type,b)).forEach(name=>{const o=document.createElement('option');o.value=name;o.textContent=name+' · Cote '+oddsFor(st,type,name).toFixed(2).replace('.',',');o.selected=me[type]===name;sel.append(o)});
      sel.addEventListener('change',async()=>{await api()?.setLivePrediction?.(type,sel.value);render(true)});
      card.append(head,sel);wrap.append(card);
    });
    const confirm=document.createElement('div');confirm.className='bptcl-confirm';
    const copy=document.createElement('div');copy.className='bptcl-confirm-copy';
    const strong=document.createElement('strong');strong.textContent=me.confirmed?'✓ Pari enregistré':'Sélectionnez puis validez';
    const small=document.createElement('small');small.textContent=me.confirmed?'Votre pari est validé.':can?'0,50 € par pari sélectionné':'Connexion joueur requise';copy.append(strong,small);
    const validate=button(me.confirmed?'Pari validé':can?'Valider le pari':'Connexion joueur requise',true,async()=>{if(!can||me.confirmed)return;await api()?.confirmLivePredictions?.();render(true)},!can||me.confirmed);
    confirm.append(copy,validate);wrap.append(confirm);body.replaceChildren(wrap);
    const owner=!!api()?.isOwner?.();
    footer([button('← Retour aux paramètres',false,()=>api()?.returnToPreGameSettings?.()),button('▶ Révéler le type de bounty',true,()=>api()?.launchPreGame?.(),!owner)]);
  }

  function renderStep4(st){
    title('AVANT LE LANCEMENT','Type de bounty révélé',4);
    const body=$('bptclBody'),individual=st.bountyMode==='individual',age=Date.now()-Number(st.bountyModeRevealAt||Date.now()),drawing=age<1600;
    const wrap=document.createElement('div');wrap.className='bptcl-bounty';
    const icon=document.createElement('div');icon.className='bptcl-bounty-icon';icon.textContent=drawing?'🎲':individual?'🃏':'🎯';
    const lab=document.createElement('div');lab.className='bptcl-bounty-label';lab.textContent=drawing?'LE BOUNTY DE CE SOIR…':'LE SORT A CHOISI !';
    const name=document.createElement('div');name.className='bptcl-bounty-name';name.textContent=drawing?'COMMUN OU INDIVIDUEL ?':individual?'BOUNTYS INDIVIDUELS SECRETS':'BOUNTY COMMUN SECRET';
    const p=document.createElement('p');p.textContent=drawing?'Tirage en cours…':individual?'Chaque joueur reçoit sa propre mission secrète.':'Une même cible secrète pour toute la table.';
    wrap.append(icon,lab,name,p);body.replaceChildren(wrap);
    const owner=!!api()?.isOwner?.();
    footer([button('← Retour aux paris',false,()=>api()?.returnToBetting?.(),!owner),button(drawing?'Tirage en cours…':'▶ Lancer la partie',true,()=>api()?.startAfterBountyReveal?.(),!owner||drawing)]);
    if(drawing)setTimeout(()=>render(true),1700);
  }

  function render(force=false){
    ensure();fitViewport();
    if(!activeView()){show(false);return}
    const st=state();
    let mode;
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
    window.addEventListener('resize',()=>{fitViewport();render(true)},{passive:true});
    window.visualViewport?.addEventListener('resize',()=>{fitViewport();render(true)},{passive:true});
    window.visualViewport?.addEventListener('scroll',fitViewport,{passive:true});
    timer=setInterval(()=>render(false),400);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
