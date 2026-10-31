/* BPT Live v10.4.126 — relevé manuel du stack du joueur connecté.
   Validation explicite et historique chiffré en ordre antéchronologique.
   Pause synchronisée à chaque transition de blind via BPTLive3.
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
  let previousFocus=null, lastSession='', lastPlayer='', editorDirty=false;
  let lastHistorySignature='';
  const sanitize=value=>{
    const number=Number.parseInt(value,10);
    return Number.isFinite(number)?Math.min(MAX_COUNT,Math.max(0,number)):0;
  };
  const currentPlayer=()=>String(api()?.getConfirmedIdentityName?.()||'').trim();
  const isParticipant=(state,name)=>!!name&&!!state?.active&&Array.isArray(state.players)&&
    state.players.some(p=>String(p?.name||'').trim()===name);
  const canSaveOwn=(state)=>isParticipant(state,currentPlayer())&&!!state?.startedAt&&!state?.finishedAt;
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
    const st=getState();
    $('bptStackSave').disabled=!canSaveOwn(st);
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
    const st=getState(),player=currentPlayer();
    const chart=$('bptStackChart'),list=$('bptStackHistoryList');
    if(!chart||!list)return;
    const rows=historyFor(st,player);
    $('bptStackHistoryPlayer').textContent=player?'— '+player:'';
    chart.replaceChildren();list.replaceChildren();
    if(!player){list.textContent='Connecte-toi avec ton profil BPT pour consulter ton historique.';return;}
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
    // La dernière validation figure systématiquement en premier.
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
    const st=getState(),player=currentPlayer();
    const session=String(st?.sessionId||'');
    const signature=session+'|'+player;
    const nameEl=$('bptStackCurrentPlayer');
    if(nameEl)nameEl.textContent=player||'Aucun profil connecté';
    if(signature!==lastSession){
      lastSession=signature;lastPlayer=player;
      editorDirty=false;lastHistorySignature='';
      const rows=historyFor(st,player);
      fillEditor(rows.at(-1)?.counts||{});
      renderHistory();
      status(player?'Prêt à enregistrer le stack de '+player+'.':'Connecte-toi avec ton profil BPT pour enregistrer ton stack.');
    }
    const canSave=canSaveOwn(st);
    $('bptStackSave').hidden=!canSave;
    $('bptStackContext').textContent=canSave?
      'Relevé associé automatiquement à ton profil, avec l’heure, le niveau de blind et le temps écoulé.':
      (!player?'Identifie-toi dans BPT pour enregistrer ton stack.':
      (st?.active?'Ton profil n’est pas inscrit à cette partie active, ou la partie est terminée.':'Aucune partie Live active : comptage local seulement.'));
    const rows=historyFor(st,player);
    const hSig=session+'|'+player+'|'+rows.map(r=>r.id+':'+r.stack).join(',');
    if(hSig!==lastHistorySignature){
      lastHistorySignature=hSig;
      if(!editorDirty&&rows.length)fillEditor(rows.at(-1)?.counts||{});
      renderHistory();
    }
    updateTotal();
  }
  function open(){
    const modal=$('bptStackModal');if(!modal)return;
    previousFocus=document.activeElement;
    refreshPlayers();
    modal.hidden=false;modal.setAttribute('aria-hidden','false');
    $('bptStackClose').focus();
  }
  function close(){
    const modal=$('bptStackModal');if(!modal)return;
    modal.hidden=true;modal.setAttribute('aria-hidden','true');
    if(previousFocus&&previousFocus.isConnected&&typeof previousFocus.focus==='function')previousFocus.focus();
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
      const player=currentPlayer(),button=$('bptStackSave');
      if(!canSaveOwn(getState())){status('Connecte-toi avec le profil d’un joueur de la partie pour enregistrer ton stack.');return;}
      const counts=countsFromEditor();
      button.disabled=true;status('Enregistrement dans la partie en cours…');
      try{
        const record=await api().saveMyStackSnapshot(counts);
        editorDirty=false;status('Stack validé : '+fmt(record.stack)+' points. Le relevé le plus récent apparaît en tête de l’historique.');
        refreshPlayers();
      }catch(e){status('Enregistrement refusé : '+(e?.message||'erreur réseau'));}
      finally{updateTotal();}
    });
    setInterval(()=>{
      if(!modal.hidden)refreshPlayers();
    },1200);
    updateTotal();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
