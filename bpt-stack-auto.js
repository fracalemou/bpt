/* BPT 10.4.127 — compteur de stack : choix MANUEL ou IA du club.
   La sélection photo n'est déclenchée que par "Analyse par IA".
   Aucun mode "comptage par pile", aucun réglage fournisseur côté joueur.
   Ne pas stocker de clé dans GitHub Pages ; le serveur du club authentifie via Firebase. */
(function (root) {
  'use strict';
  if (typeof document === 'undefined') return;

  const KEYS = ['green','blue','black','purple','brown','red'];
  const VAL = {green:25,blue:50,black:100,purple:500,brown:5000,red:10000};
  const NAMES = {green:'vert',blue:'bleu',black:'noir',purple:'violet',brown:'marron',red:'rouge'};
  const $ = id => document.getElementById(id);
  const fmt = n => Number(n).toLocaleString('fr-FR');
  let mode='manuel', busy=false, requestNo=0, imageCanvas=null, step='home';

  function status(s){ const el=$('bptStackAutoStatus');if(el)el.textContent=s; }
  function show(el,yes,display=''){if(el)el.style.display=yes?display:'none';}
  function lines(){return [...document.querySelectorAll('#bptStackLines .bpt-stack-line')];}
  function readCounts(){const counts={};for(const key of KEYS)counts[key]=0;
    for(const row of lines()){
      const val=Number(row.dataset.value);
      const key=KEYS.find(k=>VAL[k]===val);
      if(key)counts[key]=Math.max(0,Math.min(99999,Number.parseInt(row.querySelector('input').value,10)||0));
    }
    return counts;
  }
  function applyCounts(counts){for(const row of lines()){
    const key=KEYS.find(k=>VAL[k]===Number(row.dataset.value));
    if(key)row.querySelector('input').value=Math.max(0,Math.min(99999,Number(counts[key])||0));
  }$('bptStackLines').dispatchEvent(new Event('input',{bubbles:true}));}
  function totalOf(counts){return KEYS.reduce((n,k)=>n+VAL[k]*(Number(counts[k])||0),0);}
  function reset(){applyCounts({});const b=$('bptStackAutoBadge');if(b)b.hidden=true;}

  function historyGet(){try{const a=JSON.parse(localStorage.getItem('bptStackHistory')||'[]');return Array.isArray(a)?a:[];}catch(_){return [];}}
  function historySet(a){try{localStorage.setItem('bptStackHistory',JSON.stringify(a.slice(0,20)));}catch(_){}}
  function renderHistory(){const target=$('bptStackHist');if(!target)return;
    target.replaceChildren();const hist=historyGet();if(!hist.length)return;
    const h=document.createElement('p');h.className='bpt-stack-tip';
    const strong=document.createElement('strong');strong.textContent='Derniers comptages enregistrés (sur cet appareil)';h.appendChild(strong);target.appendChild(h);
    hist.slice(0,5).forEach((item,i)=>{
      const row=document.createElement('div');row.className='bpt-hist-row';
      const text=document.createElement('span');const date=new Date(item.t);
      const dateText=Number.isFinite(date.getTime())?date.toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'—';
      text.textContent=dateText+' · '+fmt(item.total||0)+' · '+fmt(item.chips||0)+' jetons · '+(item.mode||'manuel');row.appendChild(text);
      const take=document.createElement('button');take.type='button';take.textContent='Reprendre';take.dataset.hr=String(i);row.appendChild(take);
      const del=document.createElement('button');del.type='button';del.textContent='✕';del.dataset.hd=String(i);del.setAttribute('aria-label','Supprimer ce relevé');row.appendChild(del);
      target.appendChild(row);
    });
  }

  function setStep(next){step=next;const home=next==='home';
    show($('bptStackHome'),home);
    show($('bptStackWorkBar'),!home,'flex');
    show($('bptStackValidate'),!home);
    show($('bptStackLines'),!home);
    show($('bptStackAutoStatus'),!home);
    show($('bptStackMessage'),!home);
    for(const s of document.querySelectorAll('#bptStackModal .bpt-stack-summary'))show(s,!home,'flex');
    for(const a of document.querySelectorAll('#bptStackModal .bpt-stack-actions:not(#bptStackWorkBar)'))show(a,!home,'flex');
    show($('bptStackPhotoWrap'),!home&&mode==='ia'&&!!imageCanvas);
    show($('bptStackRetry'),!home&&mode==='ia');
    if(home)renderHistory();
  }
  function goHome(message=''){
    requestNo++;busy=false;const choose=$('bptStackGoAI');if(choose)choose.disabled=false;
    const msg=$('bptStackHomeMsg');if(msg)msg.textContent=message;
    setStep('home');
  }
  function startManual(){requestNo++;mode='manuel';imageCanvas=null;busy=false;reset();setStep('work');status('Indique tes quantités par couleur, puis valide le comptage.');}
  function selectPhoto(){if(busy)return;const input=$('bptStackFile');if(!input)return;
    mode='ia';input.value='';input.click(); // déclenche le sélecteur/caméra à la demande du joueur
  }

  function validate(){if(busy){status('L’analyse est encore en cours.');return;}
    const counts=readCounts(),chips=KEYS.reduce((s,k)=>s+counts[k],0);
    if(!chips){status('Le stack est vide. Aucun relevé enregistré.');return;}
    const total=totalOf(counts),hist=historyGet();
    hist.unshift({t:Date.now(),counts,total,chips,mode:mode==='ia'?'IA':'manuel'});historySet(hist);
    reset();imageCanvas=null;goHome('Comptage enregistré : '+fmt(total)+' points ('+chips+' jetons).');
  }

  async function readImage(file){
    let bitmap=null;
    if(typeof createImageBitmap==='function'){
      try{bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});}catch(_){/* repli */}
    }
    if(!bitmap){const url=URL.createObjectURL(file);
      try{bitmap=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=url;});}
      finally{URL.revokeObjectURL(url);}
    }
    const w=bitmap.naturalWidth||bitmap.width,h=bitmap.naturalHeight||bitmap.height;
    if(!w||!h)throw new Error('Image vide');
    const ratio=Math.min(1,1568/Math.max(w,h));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(w*ratio));canvas.height=Math.max(1,Math.round(h*ratio));
    canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
    if(bitmap.close)bitmap.close();return canvas;
  }
  async function firebaseToken(){
    for(let i=0;i<20;i++){
      try{const user=root.firebase&&root.firebase.auth&&root.firebase.auth().currentUser;
        if(user)return await user.getIdToken();}catch(_){/* authentification en cours */}
      await new Promise(resolve=>setTimeout(resolve,250));
    }
    throw new Error('Connexion BPT nécessaire pour analyser une photo.');
  }
  function parseResponse(data){
    // Le Worker du club renvoie habituellement {text:"{...}"}.
    let obj=data;
    if(obj&&obj.result&&typeof obj.result==='object')obj=obj.result;
    if(obj&&typeof obj.text==='string')obj=obj.text;
    if(typeof obj==='string'){
      let s=obj.trim();if(s.startsWith('```'))s=s.replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');
      const match=s.match(/\{[\s\S]*\}/);if(!match)throw new Error('Réponse IA illisible');
      obj=JSON.parse(match[0]);
    }
    if(!obj||typeof obj!=='object')throw new Error('Réponse IA invalide');
    const counts={};KEYS.forEach(k=>counts[k]=0);
    if(Array.isArray(obj.jetons)){
      for(const chip of obj.jetons.slice(0,400)){
        const key=String(chip.c||chip.couleur||'').toLowerCase();if(key in counts)counts[key]++;
      }
    }else{
      const source=(obj.counts&&typeof obj.counts==='object')?obj.counts:obj;
      KEYS.forEach(k=>counts[k]=Math.min(99999,Math.max(0,Math.round(Number(source[k])||0))));
    }
    return {counts,certitude:String(obj.certitude||''),remarque:String(obj.remarque||'')};
  }
  async function callClubAI(canvas){
    const url=String(root.BPT_AI_CONFIG&&root.BPT_AI_CONFIG.proxyUrl||'').trim();
    if(!url||!/^https:\/\//i.test(url))throw new Error('Service IA du club non configuré. Contacte l’organisateur.');
    const token=await firebaseToken();
    const base64=canvas.toDataURL('image/jpeg',0.85).split(',')[1];
    const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),60000);
    try{
      const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({image:base64}),signal:abort.signal});
      const data=await response.json().catch(()=>({}));
      if(!response.ok){
        if(response.status===429)throw new Error('Quota IA atteint : réessaie plus tard.');
        if(response.status===401||response.status===403)throw new Error('Accès au service IA refusé. Vérifie ta connexion BPT.');
        throw new Error(String(data.error&&data.error.message||data.error||('Erreur du service '+response.status)));
      }
      return parseResponse(data);
    }finally{clearTimeout(timeout);}
  }
  async function processPhoto(file){
    if(!file||!file.type.startsWith('image/'))return;
    const myRequest=++requestNo;mode='ia';busy=true;reset();
    const btn=$('bptStackGoAI');if(btn)btn.disabled=true;
    try{
      imageCanvas=await readImage(file);if(myRequest!==requestNo)return;
      // La photo n'est affichée qu'après choix explicite de l'analyse IA.
      const preview=$('bptStackPreview');if(preview){preview.src=imageCanvas.toDataURL('image/jpeg',0.85);preview.style.width='100%';}
      if($('bptStackZoom'))$('bptStackZoom').value=100;
      if($('bptStackZoomVal'))$('bptStackZoomVal').textContent='100 %';
      setStep('work');status('Analyse IA du club en cours…');
      const result=await callClubAI(imageCanvas);if(myRequest!==requestNo)return;
      applyCounts(result.counts);
      const n=KEYS.reduce((s,k)=>s+result.counts[k],0);
      const certainty=result.certitude?' · confiance '+result.certitude:'';
      status('Estimation IA : '+fmt(n)+' jetons, '+fmt(totalOf(result.counts))+' points'+certainty+'. Vérifie le total avant validation.');
      const badge=$('bptStackAutoBadge');
      if(badge){badge.hidden=false;badge.textContent=result.remarque?('Analyse IA : '+result.remarque):'Estimation automatique. La validation reste volontaire.';}
    }catch(err){if(myRequest!==requestNo)return;
      if(step!=='work')setStep('work');
      status('Analyse IA indisponible : '+(err.name==='AbortError'?'délai dépassé':err.message));
    }finally{if(myRequest===requestNo){busy=false;if(btn)btn.disabled=false;}}
  }

  function init(){const body=document.querySelector('#bptStackModal .bpt-stack-body');
    if(!body||!$('bptStackLines')||$('bptStackHome'))return;
    // Supprime entièrement les anciennes commandes de prise de photo/pile/IA personnalisée.
    const photoLabel=body.querySelector('label.bpt-stack-photo-btn');
    if(photoLabel){const input=$('bptStackFile');if(input){body.appendChild(input);}photoLabel.remove();}
    $('bptStackAuto')?.remove();
    body.querySelectorAll('#bptStackSel,#bptStackAI,#bptStackAIProv,#bptStackThick,#bptStackAIPrx,#bptStackAIGem,#bptStackAIAnt').forEach(el=>el.remove());
    const home=document.createElement('div');home.id='bptStackHome';
    home.innerHTML='<p id="bptStackHomeMsg" class="bpt-stack-tip" aria-live="polite"></p>'+
      '<button type="button" id="bptStackGoManual" class="bpt-home-btn"><strong>Comptage manuel</strong><small>Saisir les quantités par couleur</small></button>'+
      '<button type="button" id="bptStackGoAI" class="bpt-home-btn bpt-home-ai"><strong>Analyse par IA</strong><small>Ouvre l’appareil photo ou la galerie, puis analyse avec le service du club</small></button>'+
      '<div id="bptStackHist"></div>';
    body.insertBefore(home,body.firstChild);
    const toolbar=document.createElement('div');toolbar.id='bptStackWorkBar';toolbar.className='bpt-stack-actions';
    toolbar.innerHTML='<button type="button" id="bptStackBack">← Retour</button><button type="button" id="bptStackRetry">Nouvelle photo IA</button>';
    body.insertBefore(toolbar,home.nextSibling);
    const validateButton=document.createElement('button');validateButton.type='button';validateButton.id='bptStackValidate';
    validateButton.className='bpt-stack-validate';validateButton.textContent='Valider le stack';
    const actions=body.querySelector('.bpt-stack-actions:not(#bptStackWorkBar)');if(!actions)return;
    actions.parentNode.insertBefore(validateButton,actions);

    $('bptStackGoManual').addEventListener('click',startManual);
    $('bptStackGoAI').addEventListener('click',selectPhoto);
    $('bptStackRetry').addEventListener('click',selectPhoto);
    $('bptStackBack').addEventListener('click',()=>goHome());
    validateButton.addEventListener('click',validate);
    $('bptStackFile').addEventListener('change',event=>{
      const file=event.target.files&&event.target.files[0];if(file)processPhoto(file);
    });
    $('bptStackHist').addEventListener('click',event=>{
      const take=event.target.closest('[data-hr]'),del=event.target.closest('[data-hd]');
      const hist=historyGet();
      if(del){hist.splice(Number(del.dataset.hd),1);historySet(hist);renderHistory();}
      if(take){const entry=hist[Number(take.dataset.hr)];if(entry){startManual();applyCounts(entry.counts||{});status('Ancien comptage repris : modifie les quantités puis valide.');}}
    });
    document.addEventListener('click',event=>{if(event.target.closest('.bpt-stack-open'))goHome();});
    setStep('home');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  root.BPTStackAI={parseAI:parseResponse};
})(typeof window!=='undefined'?window:globalThis);
