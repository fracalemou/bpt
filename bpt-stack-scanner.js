/* BPT Live v10.4.124 — saisie manuelle et historique des stacks par joueur.
   Les relevés sont enregistrés dans Firebase live_v3 via BPTLive3.savePlayerStackSnapshot.
   Rappel facultatif une minute de temps de jeu après changement des blinds.
   Aucun scanner photo / aucune API d'IA. */
(function(){
  'use strict';
  const CHIPS=[
    {value:25,name:'Vert',color:'#69BC48'},
    {value:50,name:'Bleu',color:'#159ED1'},
    {value:100,name:'Noir',color:'#292B35'},
    {value:500,name:'Violet',color:'#7850B2'},
    {value:1000,name:'Jaune',color:'#F3CC27'},
    {value:5000,name:'Rose',color:'#E65B9B'},
    {value:10000,name:'Orange',color:'#ED882A'}
  ];
  const $=id=>document.getElementById(id);
  const fmt=n=>Number(n).toLocaleString('fr-FR');
  const api=()=>window.BPTLive3||null;
  const getState=()=>{try{return api()?.getState?.()||null;}catch(_){return null;}};
  const MAX_COUNT=9999;
  const reminderSettingKey='bpt:stack:reminder:enabled';
  let previousFocus=null, lastSession='', lastPlayer='', editorDirty=false;
  let lastHistorySignature='', displayedReminderId='';
  const remindersSeenThisSession=new Set();
  let reminderPreferenceFallback=true;
  const sanitize=value=>{
    const number=Number.parseInt(value,10);
    return Number.isFinite(number)?Math.min(MAX_COUNT,Math.max(0,number)):0;
  };
  const statePlayers=state=>Array.isArray(state?.players)?state.players.map(x=>String(x?.name||'').trim()).filter(Boolean):[];
  const historyFor=(state,player)=>{
    const rows=Array.isArray(state?.stackHistory)?state.stackHistory:[];
    return rows.filter(r=>r.player===player).sort((a,b)=>Number(a.elapsedSec)-Number(b.elapsedSec)||Number(a.at)-Number(b.at));
  };
  const countsFromEditor=()=>{
    const counts={};
    document.querySelectorAll('#bptStackLines .bpt-stack-line').forEach(row=>{
      counts[row.dataset.value]=sanitize(row.querySelector('input').value);
    });
    return counts;
  };
  function updateTotal(){
    let total=0,quantity=0;
    document.querySelectorAll('#bptStackLines .bpt-stack-line').forEach(row=>{
      const n=sanitize(row.querySelector('input').value),value=Number(row.dataset.value);
      quantity+=n;total+=n*value;
      row.querySelector('.bpt-stack-subtotal').textContent=fmt(n*value);
    });
    $('bptStackTotal').textContent=fmt(total);
    $('bptStackCount').textContent=fmt(quantity)+' jeton'+(quantity===1?'':'s');
    const st=getState(),selected=$('bptStackPlayer')?.value||'';
    $('bptStackSave').disabled=!selected||!st?.active||!st.startedAt||!api()?.isOwner?.();
    return {total,quantity};
  }
  function status(text){const el=$('bptStackMessage');if(el)el.textContent=text;}
  function fillEditor(counts){
    document.querySelectorAll('#bptStackLines .bpt-stack-line').forEach(row=>{
      const input=row.querySelector('input');
      input.value=String(sanitize(counts?.[row.dataset.value]||0));
    });
    editorDirty=false;updateTotal();
  }
  function renderHistory(){
    const st=getState(),player=$('bptStackPlayer')?.value||'';
    const chart=$('bptStackChart'),list=$('bptStackHistoryList');
    if(!chart||!list)return;
    const rows=historyFor(st,player);
    $('bptStackHistoryPlayer').textContent=player?'— '+player:'';
    chart.replaceChildren();list.replaceChildren();
    if(!player){list.textContent='Sélectionne un joueur pour consulter ses relevés.';return;}
    if(!rows.length){list.textContent='Aucun stack enregistré pour ce joueur dans cette partie.';return;}
    const W=600,H=196,PX=47,PY=20,baseY=H-31;
    const minT=Math.min(...rows.map(r=>Number(r.elapsedSec)||0)),maxT=Math.max(...rows.map(r=>Number(r.elapsedSec)||0));
    const high=Math.max(1,...rows.map(r=>Number(r.stack)||0));
    const yMax=Math.ceil(high/Math.pow(10,Math.max(0,Math.floor(Math.log10(high))-1)))*Math.pow(10,Math.max(0,Math.floor(Math.log10(high))-1));
    const spanT=Math.max(1,maxT-minT),height=baseY-PY;
    const xAt=(r,i)=>PX+(maxT===minT?(rows.length===1?0:i/Math.max(1,rows.length-1)):(Number(r.elapsedSec)-minT)/spanT)*(W-PX-19);
    const yAt=r=>baseY-Math.max(0,Number(r.stack))/yMax*height;
    const SVG='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(SVG,'svg');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('aria-label','Évolution du stack, '+rows.length+' relevés');svg.setAttribute('role','img');
    const add=(tag,attrs,content)=>{const e=document.createElementNS(SVG,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,String(v)));if(content!==undefined)e.textContent=content;svg.appendChild(e);return e;};
    for(let i=0;i<=3;i++){
      const val=yMax*i/3,y=baseY-(height*i/3);
      add('line',{x1:PX,y1:y,x2:W-12,y2:y,stroke:'#537163','stroke-dasharray':'4 4','stroke-width':'1'});
      add('text',{x:PX-6,y:y+4,'text-anchor':'end',fill:'#c7d6ca','font-size':'12'},fmt(Math.round(val)));
    }
    const timeLabel=sec=>{const minutes=Math.floor((Number(sec)||0)/60);return String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');};
    add('text',{x:PX,y:H-8,fill:'#bdd2c4','font-size':'12'},timeLabel(minT));
    add('text',{x:W-13,y:H-8,'text-anchor':'end',fill:'#bdd2c4','font-size':'12'},timeLabel(maxT));
    if(rows.length>1)add('polyline',{points:rows.map((r,i)=>xAt(r,i)+','+yAt(r)).join(' '),fill:'none',stroke:'#f4cb50','stroke-width':'3','stroke-linejoin':'round','stroke-linecap':'round'});
    rows.forEach((r,i)=>{
      const point=add('circle',{cx:xAt(r,i),cy:yAt(r),r:rows.length<25?5:3,fill:'#f4cb50',stroke:'#17251e','stroke-width':'1.5'});
      const title=document.createElementNS(SVG,'title');title.textContent='Niveau '+(Number(r.levelIndex)+1)+' · '+timeLabel(r.elapsedSec)+' · '+fmt(r.stack)+' points';point.appendChild(title);
    });
    chart.appendChild(svg);
    rows.slice().reverse().forEach((r,index)=>{
      const prior=rows[rows.length-index-2];
      const delta=prior?Number(r.stack)-Number(prior.stack):null;
      const time=new Date(r.at);
      const row=document.createElement('div');row.className='bpt-stack-history-item';
      const desc=document.createElement('div');
      const label=document.createElement('strong');label.textContent='Niveau '+(Number(r.levelIndex)+1)+' · '+time.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
      const detail=document.createElement('small');detail.textContent='Temps de jeu : '+timeLabel(r.elapsedSec)+' · '+fmt(r.totalCount||0)+' jetons';
      desc.append(label,detail);
      const right=document.createElement('div');right.className='bpt-stack-history-sum';
      const val=document.createElement('strong');val.textContent=fmt(r.stack);
      const variation=document.createElement('small');variation.textContent=delta===null?'Premier relevé':(delta>=0?'+':'')+fmt(delta)+' points';
      variation.className=delta===null?'':delta>=0?'up':'down';right.append(val,variation);row.append(desc,right);
      list.appendChild(row);
    });
  }
  function refreshPlayers(){
    const st=getState(),players=statePlayers(st),sel=$('bptStackPlayer');if(!sel)return;
    const session=String(st?.sessionId||'');
    const former=sel.value;
    const signature=session+'|'+players.join('\u001f');
    if(signature!==lastSession){
      lastSession=signature;
      sel.replaceChildren();
      const empty=document.createElement('option');empty.value='';empty.textContent='Choisir un joueur';sel.appendChild(empty);
      players.forEach(name=>{const o=document.createElement('option');o.value=name;o.textContent=name;sel.appendChild(o);});
      if(players.includes(former))sel.value=former;
      else if(players.length===1)sel.value=players[0];
      else sel.value='';
      lastPlayer='';editorDirty=false;lastHistorySignature='';
    }
    if(sel.value!==lastPlayer){
      lastPlayer=sel.value;
      const rows=historyFor(st,lastPlayer);
      fillEditor(rows.at(-1)?.counts||{});renderHistory();
    }
    const canSave=!!st?.active&&!!st?.startedAt&&!!api()?.isOwner?.();
    $('bptStackSave').hidden=!canSave;
    $('bptStackContext').textContent=canSave?
      'Les relevés sont sauvegardés avec l’heure, le niveau de blind et le temps écoulé.':
      (st?.active?'Consultation possible. Seul l’organisateur peut enregistrer un relevé.':'Aucune partie Live active : comptage local seulement.');
    const rows=historyFor(st,sel.value);
    const hSig=String(st?.sessionId||'')+'|'+sel.value+'|'+rows.map(r=>r.id+':'+r.stack).join(',');
    if(hSig!==lastHistorySignature){lastHistorySignature=hSig;renderHistory();}
    updateTotal();
  }
  function open(){
    const modal=$('bptStackModal');if(!modal)return;
    previousFocus=document.activeElement;
    refreshPlayers();
    modal.hidden=false;modal.setAttribute('aria-hidden','false');
    $('bptStackClose').focus();
    dismissReminder();
  }
  function close(){
    const modal=$('bptStackModal');if(!modal)return;
    modal.hidden=true;modal.setAttribute('aria-hidden','true');
    if(previousFocus&&previousFocus.isConnected&&typeof previousFocus.focus==='function')previousFocus.focus();
  }
  function dismissReminder(){
    const banner=$('bptStackReminder');if(banner)banner.hidden=true;
    displayedReminderId='';
  }
  function readReminderPreference(){try{return localStorage.getItem(reminderSettingKey)!=='0';}catch(_){return reminderPreferenceFallback;}}
  function reminderTick(){
    const st=getState(),banner=$('bptStackReminder');if(!banner)return;
    if(!readReminderPreference()||!st?.active||!st?.startedAt||!api()?.isOwner?.()||
      !Number(st.levelChangeSeq)||!Number(st.levelChangedAt)||!Number.isFinite(Number(st.levelStartedElapsedSec))){dismissReminder();return;}
    const elapsed=Math.max(0,Number(st.elapsedSec)||0)+(st.running&&st.runStartedAt?
      Math.max(0,Math.floor((Date.now()-Number(st.runStartedAt))/1000)):0);
    if(elapsed-Number(st.levelStartedElapsedSec)<60){dismissReminder();return;}
    const id=String(st.sessionId)+':'+String(st.levelChangeSeq);
    const key='bpt:stack:prompt:'+id;
    if(displayedReminderId===id)return;
    if(remindersSeenThisSession.has(id)){dismissReminder();return;} // laisser le bandeau visible jusqu’au choix explicite
    try{if(localStorage.getItem(key)==='1'){dismissReminder();return;}}catch(_){}
    if(!$('bptStackModal')?.hidden)return;
    $('bptStackReminderInfo').textContent='Niveau '+(Number(st.levelIndex)+1)+' · 1 minute écoulée · relevé facultatif';
    banner.hidden=false;displayedReminderId=id;remindersSeenThisSession.add(id);
    try{localStorage.setItem(key,'1');}catch(_){/* session seule */}
  }
  function init(){
    const modal=$('bptStackModal'),lines=$('bptStackLines');if(!modal||!lines)return;
    const fragment=document.createDocumentFragment();
    CHIPS.forEach(chip=>{
      const row=document.createElement('div');row.className='bpt-stack-line';row.dataset.value=chip.value;
      const label=document.createElement('span');label.className='bpt-stack-label';
      const name=document.createElement('strong');name.textContent=chip.name;
      const value=document.createElement('small');value.textContent=fmt(chip.value)+' points';label.append(name,value);
      const dot=document.createElement('span');dot.className='bpt-stack-dot';dot.style.setProperty('--chip',chip.color);dot.setAttribute('aria-hidden','true');
      const minus=document.createElement('button');minus.type='button';minus.dataset.delta='-1';minus.textContent='−';minus.setAttribute('aria-label','Retirer 1 jeton '+chip.name);
      const input=document.createElement('input');input.type='number';input.inputMode='numeric';input.min='0';input.max=String(MAX_COUNT);input.step='1';input.value='0';input.setAttribute('aria-label','Nombre de jetons '+chip.name);
      const plus=document.createElement('button');plus.type='button';plus.dataset.delta='1';plus.textContent='+';plus.setAttribute('aria-label','Ajouter 1 jeton '+chip.name);
      const subtotal=document.createElement('output');subtotal.className='bpt-stack-subtotal';subtotal.setAttribute('aria-label','Sous-total '+chip.name);subtotal.textContent='0';
      row.append(dot,label,minus,input,plus,subtotal);fragment.appendChild(row);
    });
    lines.replaceChildren(fragment);
    document.addEventListener('click',e=>{
      if(e.target instanceof Element&&e.target.closest('.bpt-stack-open')){e.preventDefault();open();}
    });
    $('bptStackClose').addEventListener('click',close);
    modal.addEventListener('click',e=>{if(e.target===modal)close();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden){e.preventDefault();close();}});
    $('bptStackPlayer').addEventListener('change',()=>{lastPlayer='';editorDirty=false;refreshPlayers();});
    lines.addEventListener('click',e=>{
      const button=e.target.closest('[data-delta]');if(!button)return;
      const input=button.parentElement.querySelector('input');
      input.value=String(sanitize(sanitize(input.value)+Number(button.dataset.delta)));
      editorDirty=true;updateTotal();
    });
    lines.addEventListener('input',()=>{editorDirty=true;updateTotal();});
    lines.addEventListener('change',e=>{if(e.target.matches('input')){e.target.value=String(sanitize(e.target.value));updateTotal();}});
    $('bptStackReset').addEventListener('click',()=>{fillEditor({});editorDirty=true;status('Saisie remise à zéro (l’historique enregistré est conservé).');});
    $('bptStackCopy').addEventListener('click',async()=>{
      const text=$('bptStackTotal').textContent.replace(/[^0-9]/g,'');
      try{await navigator.clipboard.writeText(text);status('Total copié : '+fmt(Number(text))+' points.');}
      catch(_){status('Copie impossible sur cet appareil. Total : '+fmt(Number(text))+' points.');}
    });
    $('bptStackSave').addEventListener('click',async()=>{
      const player=$('bptStackPlayer').value,button=$('bptStackSave');
      if(!player||!api()?.isOwner?.()){status('Choisis un joueur et utilise le compte organisateur.');return;}
      const counts=countsFromEditor();
      button.disabled=true;status('Enregistrement dans la partie en cours…');
      try{
        const record=await api().savePlayerStackSnapshot(player,counts);
        editorDirty=false;status('Stack de '+player+' enregistré : '+fmt(record.stack)+' points.');
        refreshPlayers();
      }catch(e){status('Enregistrement refusé : '+(e?.message||'erreur réseau'));}
      finally{updateTotal();}
    });
    $('bptStackReminderOpen').addEventListener('click',open);
    $('bptStackReminderDismiss').addEventListener('click',dismissReminder);
    const setting=$('bptStackReminderEnabled');setting.checked=readReminderPreference();
    setting.addEventListener('change',()=>{reminderPreferenceFallback=setting.checked;try{localStorage.setItem(reminderSettingKey,setting.checked?'1':'0');}catch(_){};dismissReminder();});
    setInterval(()=>{
      reminderTick();
      if(!modal.hidden)refreshPlayers();
    },1200);
    updateTotal();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
