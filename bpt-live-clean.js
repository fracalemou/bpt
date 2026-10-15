(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').trim();
  let step=1,lastMode='',lastSig='',timer=null;

  function legacy(){return {
    location:$('live3Location'),date:$('live3Date'),stack:$('live3Stack'),buyIn:$('live3BuyIn'),hours:$('live3TargetHours'),structure:$('live3StructureMode'),
    picker:$('live3PlayerPicker'),next:$('live3PrepNextBtn'),back:$('live3PrepBackBtn'),create:$('live3CreateBtn')
  }}
  function api(){return window.BPTLive3||null}
  function state(){return api()?.getState?.()||null}
  function activeView(){return $('live3')?.classList.contains('active')}

  function ensure(){
    if($('bptCleanLive'))return $('bptCleanLive');
    const root=document.createElement('div');root.id='bptCleanLive';root.innerHTML='<div class="bptcl-shell"><header class="bptcl-head"><div class="bptcl-head-left"><div class="bptcl-kicker" id="bptclKicker">AVANT LE LANCEMENT</div><h2 class="bptcl-title" id="bptclTitle">Paramètres de la partie</h2></div><div class="bptcl-step" id="bptclStep">Étape 1 / 4</div></header><main class="bptcl-body" id="bptclBody"></main><footer class="bptcl-foot" id="bptclFoot"></footer></div>';
    $('live3')?.append(root);return root;
  }
  function fit(){
    const root=ensure(),nav=$('nav');if(!root||!nav)return;
    const vv=window.visualViewport,viewportH=Math.round(vv?.height||window.innerHeight),offsetTop=Math.round(vv?.offsetTop||0),top=Math.max(0,Math.round(nav.getBoundingClientRect().bottom));
    root.style.top=top+'px';root.style.height=Math.max(220,viewportH-top+offsetTop)+'px';
  }
  function show(v){const r=ensure();r.classList.toggle('is-visible',!!v)}
  function text(kicker,title,n){$('bptclKicker').textContent=kicker;$('bptclTitle').textContent=title;$('bptclStep').textContent='Étape '+n+' / 4'}
  function foot(buttons){const f=$('bptclFoot');f.className='bptcl-foot'+(buttons.length===1?' one':'');f.replaceChildren(...buttons)}
  function btn(label,primary,fn,disabled=false){const b=document.createElement('button');b.type='button';b.className='bptcl-btn'+(primary?' primary':'');b.textContent=label;b.disabled=disabled;b.onclick=fn;return b}

  function renderStep1(){
    text('PRÉPARATION','Paramètres de la partie',1);const l=legacy(),body=$('bptclBody');
    const defs=[['Nom / lieu','text',l.location],['Date','date',l.date],['Tapis de départ','number',l.stack],['Buy-in (€)','number',l.buyIn],['Durée souhaitée','select',l.hours],['Structure','select',l.structure]];
    const form=document.createElement('div');form.className='bptcl-form';
    defs.forEach(([label,type,src])=>{const w=document.createElement('div');w.className='bptcl-field';const lab=document.createElement('label');lab.textContent=label;let el;
      if(type==='select'){el=document.createElement('select');[...src.options].forEach(o=>{const x=document.createElement('option');x.value=o.value;x.textContent=o.textContent;x.selected=o.value===src.value;el.append(x)})}
      else{el=document.createElement('input');el.type=type;el.value=src?.value||'';if(src?.min)el.min=src.min;if(src?.step)el.step=src.step}
      el.addEventListener('input',()=>{src.value=el.value;src.dispatchEvent(new Event('input',{bubbles:true}));src.dispatchEvent(new Event('change',{bubbles:true}))});w.append(lab,el);form.append(w)
    });body.replaceChildren(form);
    foot([btn('Continuer →',true,()=>{if(!String(l.location?.value||'').trim()){alert('Indiquez le nom / lieu de la partie.');return;}step=2;render(true)})]);
  }

  function playerData(){return [...(legacy().picker?.querySelectorAll('label.bpt-live3-player-check')||[])].map(label=>{const cb=label.querySelector('input[type=checkbox]');return {name:cb?.value||label.querySelector('span')?.textContent||'',checked:!!cb?.checked,cb}}).filter(x=>x.name)}
  function setPlayerFit(count){const root=ensure(),body=$('bptclBody');const landscape=matchMedia('(orientation: landscape)').matches;const w=root.clientWidth,h=body.clientHeight;let cols;
    if(landscape)cols=count<=12?3:count<=20?4:5; else cols=count<=10?2:count<=18?3:4;
    const rows=Math.max(1,Math.ceil(count/cols));root.style.setProperty('--bptcl-cols',cols);root.style.setProperty('--bptcl-rows',rows);root.style.setProperty('--bptcl-player-font',(landscape?10:Math.max(10.5,Math.min(13,w/(cols*12))))+'px');
  }
  function renderStep2(){
    text('PRÉPARATION','Sélection des joueurs',2);const body=$('bptclBody'),data=playerData();
    const wrap=document.createElement('div');wrap.className='bptcl-players-wrap';const sum=document.createElement('div');sum.className='bptcl-players-summary';const count=document.createElement('strong');count.textContent=data.filter(x=>x.checked).length+' sélectionné(s)';const info=document.createElement('span');info.textContent=data.length+' joueur(s) actif(s)';sum.append(count,info);
    const grid=document.createElement('div');grid.className='bptcl-players';data.forEach(p=>{const lab=document.createElement('label');lab.className='bptcl-player'+(p.checked?' is-selected':'');const cb=document.createElement('input');cb.type='checkbox';cb.checked=p.checked;const sp=document.createElement('span');sp.textContent=p.name;cb.onchange=()=>{p.cb.checked=cb.checked;p.cb.dispatchEvent(new Event('change',{bubbles:true}));lab.classList.toggle('is-selected',cb.checked);count.textContent=grid.querySelectorAll('input:checked').length+' sélectionné(s)'};lab.append(cb,sp);grid.append(lab)});wrap.append(sum,grid);body.replaceChildren(wrap);requestAnimationFrame(()=>setPlayerFit(data.length));
    foot([btn('← Retour',false,()=>{step=1;render(true)}),btn('Continuer →',true,()=>{const n=playerData().filter(x=>x.checked).length;if(n<2){alert('Sélectionnez au moins 2 joueurs.');return;}legacy().create?.click()})]);
  }

  function oddsFor(st,type,name){const raw=st?.betting?.odds?.[type]?.[name];const n=Number(raw);return Number.isFinite(n)&&n>0?n:1}
  function renderStep3(st){
    text('AVANT LE LANCEMENT','Placez vos paris',3);const body=$('bptclBody'),players=(st.players||[]).map(p=>p.name),raw=String(api()?.getIdentityName?.()||'').trim(),identity=players.find(p=>norm(p)===norm(raw))||raw,me=st?.betting?.bets?.[identity]||{},can=!!identity&&players.some(p=>norm(p)===norm(identity));
    const wrap=document.createElement('div');wrap.className='bptcl-bets';const note=document.createElement('p');note.className='bptcl-bet-note';note.textContent='Un pari vainqueur et/ou un pari 1er éliminé. Vous pouvez aussi choisir « Pas de pari ».';wrap.append(note);
    ['winner','firstEliminated'].forEach(type=>{const card=document.createElement('div');card.className='bptcl-bet-card';const head=document.createElement('div');head.className='bptcl-bet-head';head.innerHTML='<strong>'+(type==='winner'?'Vainqueur':'1er éliminé')+'</strong><span>0,50 €</span>';const sel=document.createElement('select');sel.className='bptcl-select';const none=document.createElement('option');none.value='';none.textContent='Pas de pari';sel.append(none);players.slice().sort((a,b)=>oddsFor(st,type,a)-oddsFor(st,type,b)).forEach(name=>{const o=document.createElement('option');o.value=name;o.textContent=name+' · Cote '+oddsFor(st,type,name).toFixed(2).replace('.',',');o.selected=me[type]===name;sel.append(o)});sel.onchange=async()=>{await api()?.setLivePrediction?.(type,sel.value);render(true)};card.append(head,sel);wrap.append(card)});
    const confirm=document.createElement('div');confirm.className='bptcl-confirm';const copy=document.createElement('div');copy.className='bptcl-confirm-copy';const s=document.createElement('strong');s.textContent=me.confirmed?'✓ Pari enregistré':'Sélectionnez puis validez';const sm=document.createElement('small');sm.textContent=me.confirmed?'Votre pari est validé.':can?'0,50 € par pari sélectionné':'Connexion joueur requise';copy.append(s,sm);const cb=btn(me.confirmed?'Pari validé':can?'Valider le pari':'Connexion joueur requise',true,async()=>{if(!can||me.confirmed)return;await api()?.confirmLivePredictions?.();render(true)},!can||me.confirmed);confirm.append(copy,cb);wrap.append(confirm);body.replaceChildren(wrap);
    const owner=!!api()?.isOwner?.();foot([btn('← Retour aux paramètres',false,()=>api()?.returnToPreGameSettings?.()),btn('▶ Révéler le type de bounty',true,()=>api()?.launchPreGame?.(),!owner)]);
  }

  function renderStep4(st){
    text('AVANT LE LANCEMENT','Type de bounty révélé',4);const body=$('bptclBody'),individual=st.bountyMode==='individual',age=Date.now()-Number(st.bountyModeRevealAt||Date.now()),drawing=age<1600;const wrap=document.createElement('div');wrap.className='bptcl-bounty';const icon=document.createElement('div');icon.className='bptcl-bounty-icon';icon.textContent=drawing?'🎲':individual?'🃏':'🎯';const lab=document.createElement('div');lab.className='bptcl-bounty-label';lab.textContent=drawing?'LE BOUNTY DE CE SOIR…':'LE SORT A CHOISI !';const name=document.createElement('div');name.className='bptcl-bounty-name';name.textContent=drawing?'COMMUN OU INDIVIDUEL ?':individual?'BOUNTYS INDIVIDUELS SECRETS':'BOUNTY COMMUN SECRET';const p=document.createElement('p');p.textContent=drawing?'Tirage en cours…':individual?'Chaque joueur reçoit sa propre mission secrète.':'Une même cible secrète pour toute la table.';wrap.append(icon,lab,name,p);body.replaceChildren(wrap);const owner=!!api()?.isOwner?.();foot([btn('← Retour aux paris',false,()=>api()?.returnToBetting?.(),!owner),btn(drawing?'Tirage en cours…':'▶ Lancer la partie',true,()=>api()?.startAfterBountyReveal?.(),!owner||drawing)]);if(drawing)setTimeout(()=>render(true),1700)
  }

  function render(force=false){
    const root=ensure();fit();if(!activeView()){show(false);return}
    const st=state();let mode='';if(st?.active&&!st.startedAt&&st.bountyModeRevealPending)mode='4';else if(st?.active&&!st.startedAt&&st.preGamePending)mode='3';else if(st?.active)mode='game';else mode=String(step);
    if(mode==='game'){show(false);return}show(true);
    const sig=mode+'|'+JSON.stringify(st?{sid:st.sessionId,pre:st.preGamePending,b:st.bountyModeRevealPending,at:st.bountyModeRevealAt,bets:st.betting?.bets,players:(st.players||[]).map(p=>p.name)}:{step});if(!force&&sig===lastSig)return;lastSig=sig;lastMode=mode;
    if(mode==='1')renderStep1();else if(mode==='2')renderStep2();else if(mode==='3')renderStep3(st);else if(mode==='4')renderStep4(st);
  }
  function boot(){ensure();fit();render(true);window.addEventListener('resize',()=>{fit();render(true)});window.addEventListener('orientationchange',()=>setTimeout(()=>{fit();render(true)},120));window.visualViewport?.addEventListener('resize',()=>{fit();render(true)});timer=setInterval(()=>render(false),350)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
