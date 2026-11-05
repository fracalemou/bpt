/* BPT 10.4.137 — compteur de stack : choix MANUEL ou IA du club.
   La sélection photo n'est déclenchée que par "Analyse par IA".
   Aucun mode "comptage par pile", aucun réglage fournisseur côté joueur.
   Ne pas stocker de clé dans GitHub Pages ; le serveur du club authentifie via Firebase. */
(function (root) {
  'use strict';
  if (typeof document === 'undefined') return;

  const KEYS = ['green','blue','black','purple','yellow','pink','orange'];
  const VAL = {green:25,blue:50,black:100,purple:500,yellow:1000,pink:5000,orange:10000};
  const NAMES = {green:'vert',blue:'bleu',black:'noir',purple:'violet',yellow:'jaune',pink:'rose',orange:'orange'};
  const $ = id => document.getElementById(id);
  const fmt = n => Number(n).toLocaleString('fr-FR');
  let mode='manuel', busy=false, requestNo=0, imageCanvas=null, step='home', editingIndex=null;
  let activeAIAbort=null, lastPhotoFile=null, samePhotoRetryAvailable=false;
  const AI_REQUEST_TIMEOUT_MS=35000; // délai maximal unique : aucun double appel caché
  function elapsedMs(from){return Math.max(0,Math.round(performance.now()-from));}
  function sec(ms){return (ms/1000).toLocaleString('fr-FR',{maximumFractionDigits:1})+' s';}
  function stopAI(){if(activeAIAbort){activeAIAbort.abort();activeAIAbort=null;}}

  function status(s){ const el=$('bptStackAutoStatus');if(el)el.textContent=s; }
  // L'indice de fiabilité est indicatif : il provient de l'IA et n'est pas une mesure calibrée.
  function normalizeReliability(raw){
    if(typeof raw==='number' && Number.isFinite(raw)){
      const n=raw>1?raw/100:raw;
      return n>=.85?'high':n>=.60?'medium':'low';
    }
    const v=String(raw??'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    if(/^(high|haute?|eleve|elevee|forte?|sure?|certain|excellent|tres bonne?)$/.test(v))return 'high';
    if(/^(moyenne?|medium|moderate|moderee?|intermediaire|correcte?)$/.test(v))return 'medium';
    if(/^(low|basse?|faible|incertain|incertaine|poor|bad|tres faible)$/.test(v))return 'low';
    if(/^\d+(?:\.\d+)?%?$/.test(v))return normalizeReliability(Number(v.replace('%','')));
    return 'unknown';
  }
  const RELIABILITY_LABEL={high:'Haute',medium:'Moyenne',low:'Basse',unknown:'Non évaluée'};
  function showAnalysis(state,options={}){
    const badge=$('bptStackAutoBadge');if(!badge)return;
    badge.hidden=false;
    badge.className='bpt-stack-warning bpt-stack-analysis bpt-analysis-'+(state==='done'?(options.reliability||'unknown'):state);
    badge.replaceChildren();
    const heading=document.createElement('div');heading.className='bpt-analysis-heading';
    if(state==='pending'){
      const spinner=document.createElement('span');spinner.className='bpt-analysis-spinner';spinner.setAttribute('aria-hidden','true');heading.appendChild(spinner);
      const label=document.createElement('strong');label.textContent='Analyse en cours…';heading.appendChild(label);
      badge.appendChild(heading);
      const progress=document.createElement('div');progress.className='bpt-analysis-progress';progress.setAttribute('role','progressbar');progress.setAttribute('aria-valuetext','Analyse en cours');
      const fill=document.createElement('span');progress.appendChild(fill);badge.appendChild(progress);
      const note=document.createElement('small');note.textContent=options.message||'Reconnaissance des couleurs et des jetons';badge.appendChild(note);
    }else if(state==='done'){
      const title=document.createElement('strong');title.textContent='Stack estimé : '+fmt(options.total||0)+' points';heading.appendChild(title);badge.appendChild(heading);
      const meta=document.createElement('div');meta.className='bpt-analysis-meta';meta.textContent=fmt(options.chips||0)+' jetons · Fiabilité '+RELIABILITY_LABEL[options.reliability] ;badge.appendChild(meta);
      if(options.remark){const note=document.createElement('small');note.textContent=options.remark.slice(0,400);badge.appendChild(note);}
      if(options.timing){const note=document.createElement('small');note.className='bpt-analysis-timing';note.textContent=options.timing;badge.appendChild(note);}
    }else if(state==='error'){
      const title=document.createElement('strong');title.textContent='Analyse indisponible';heading.appendChild(title);badge.appendChild(heading);
      const meta=document.createElement('div');meta.className='bpt-analysis-meta';meta.textContent=options.message||'Aucun résultat enregistré';badge.appendChild(meta);
      if(options.timing){const note=document.createElement('small');note.className='bpt-analysis-timing';note.textContent=options.timing;badge.appendChild(note);}
    }
  }
  function hideAnalysis(){const badge=$('bptStackAutoBadge');if(badge){badge.hidden=true;badge.replaceChildren();}}

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
  function reset(){applyCounts({});hideAnalysis();}

  function historyGet(){return root.BPTStackSync?.getHistory?.()||[];}
  function compatibleCounts(old){
    if(!old||typeof old!=='object')return {};
    return {...old,pink:old.pink??old.brown??0,orange:old.orange??old.red??0};
  }
  function renderHistory(){const target=$('bptStackHist');if(!target)return;
    // 10.4.163 — historique retiré de l'écran de saisie (la modification d'un relevé ne fonctionnait pas) :
    // les relevés se consultent dans Suivi de partie › Suivi des stacks. « Comme mon dernier relevé » reste disponible.
    target.replaceChildren();target.hidden=true;return;
    const sync=root.BPTStackSync;
    sync?.trackSession?.();const st=sync?.getStatus?.();const hist=historyGet();
    const h=document.createElement('p');h.className='bpt-stack-tip';
    const strong=document.createElement('strong');strong.textContent='Historique de mes stacks — dernier relevé en haut';h.appendChild(strong);target.appendChild(h);
    if(!st?.connected){const p=document.createElement('p');p.className='bpt-stack-tip';p.textContent='Ouvre une partie Live pour synchroniser ton stack.';target.appendChild(p);return;}
    if(st.error){const p=document.createElement('p');p.className='bpt-stack-tip';p.textContent='Synchronisation : '+st.error;target.appendChild(p);return;}
    if(!st.loaded){const p=document.createElement('p');p.className='bpt-stack-tip';p.textContent='Chargement des relevés synchronisés…';target.appendChild(p);return;}
    if(!hist.length){const p=document.createElement('p');p.className='bpt-stack-tip';p.textContent='Aucun stack validé pour cette partie.';target.appendChild(p);return;}
    hist.forEach(item=>{
      const row=document.createElement('div');row.className='bpt-hist-row';
      const text=document.createElement('span');const date=new Date(item.at);
      const dateText=Number.isFinite(date.getTime())?date.toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'—';
      text.textContent=dateText+' · Niveau '+(item.level||'—')+' · '+fmt(item.total||0)+' · '+fmt(item.chips||0)+' jetons · '+(item.mode||'manuel');row.appendChild(text);
      const take=document.createElement('button');take.type='button';take.textContent='Modifier';take.dataset.hr=item.id;row.appendChild(take);
      const del=document.createElement('button');del.type='button';del.textContent='✕';del.dataset.hd=item.id;del.setAttribute('aria-label','Supprimer ce relevé');row.appendChild(del);
      target.appendChild(row);
    });
  }

  function setStep(next){step=next;const home=next==='home';
    show($('bptStackHome'),home);
    show($('bptStackWorkBar'),!home,'flex');
    show($('bptStackValidate'),!home);
    show($('bptStackLines'),!home);
    show($('bptStackStepBar'),!home,'flex');
    show($('bptStackAutoStatus'),!home);
    show($('bptStackMessage'),!home);
    for(const s of document.querySelectorAll('#bptStackModal .bpt-stack-summary'))show(s,!home,'flex');
    for(const a of document.querySelectorAll('#bptStackModal .bpt-stack-actions:not(#bptStackWorkBar)'))show(a,!home,'flex');
    show($('bptStackPhotoWrap'),!home&&mode==='ia'&&!!imageCanvas);
    show($('bptStackRetry'),!home&&mode==='ia');
    show($('bptStackRetrySame'),!home&&mode==='ia'&&samePhotoRetryAvailable);
    if(home)renderHistory();
    refreshLastButton();
  }
  // 10.4.154 — reprendre les quantités du dernier relevé validé, pour ne corriger que ce qui a changé.
  function refreshLastButton(){const b=$('bptStackLast');if(!b)return;
    const last=step!=='home'&&mode==='manuel'&&editingIndex==null?historyGet()[0]:null;
    show(b,!!last);if(last)b.title='Relevé de '+fmt(last.total||0)+' points';}
  function applyLast(){const last=historyGet()[0];if(!last)return;
    applyCounts(compatibleCounts(last.counts));
    status('Quantités de ton dernier relevé ('+fmt(last.total||0)+' points) : corrige ce qui a changé, puis valide.');}
  function goHome(message=''){
    requestNo++;stopAI();busy=false;lastPhotoFile=null;samePhotoRetryAvailable=false;const choose=$('bptStackGoAI');if(choose)choose.disabled=false;
    const msg=$('bptStackHomeMsg');if(msg)msg.textContent=message;
    setStep('home');
  }
  function startManual(){requestNo++;stopAI();lastPhotoFile=null;samePhotoRetryAvailable=false;mode='manuel';imageCanvas=null;busy=false;editingIndex=null;reset();setStep('work');status(historyGet()[0]?'Indique tes quantités par couleur, ou pars de ton dernier relevé, puis valide.':'Indique tes quantités par couleur, puis valide le comptage.');}
  function selectPhoto(){if(busy)return;const input=$('bptStackFile');if(!input)return;
    mode='ia';input.value='';input.click(); // déclenche le sélecteur/caméra à la demande du joueur
  }

  async function validate(){if(busy){status('L’analyse est encore en cours.');return;}
    const counts=readCounts(),chips=KEYS.reduce((sum,k)=>sum+counts[k],0);
    if(!chips){status('Le stack est vide. Aucun relevé enregistré.');return;}
    const total=totalOf(counts),id=editingIndex;
    busy=true;const button=$('bptStackValidate');if(button)button.disabled=true;
    status('Synchronisation du stack avec les autres joueurs…');
    try{
      const sync=root.BPTStackSync;if(!sync)throw new Error('Module de synchronisation indisponible.');
      const record={counts,total,chips,mode:id?'manuel':(mode==='ia'?'IA':'manuel')};
      if(id)await sync.update(id,record);else await sync.save(record);
      editingIndex=null;reset();imageCanvas=null;
      // Fermer le compteur uniquement après la confirmation de l'écriture Firebase.
      // Ne pas dépendre d'une croix HTML : elle a été supprimée en 10.4.138.
      goHome('Stack synchronisé : '+fmt(total)+' points ('+chips+' jetons).');
      if(typeof root.BPTStackScanner?.close==='function')root.BPTStackScanner.close();
      else{const modal=$('bptStackModal');if(modal){modal.hidden=true;modal.setAttribute('aria-hidden','true');}}
      // Même si le joueur est arrivé depuis un autre écran, revenir au Live.
      // Un éventuel problème d'affichage ne doit pas transformer un stack sauvegardé en erreur.
      try{document.querySelector('nav#nav button[data-view="live3"]')?.click();}
      catch(navErr){console.warn('[BPT stack] navigation Live',navErr);}
    }catch(err){status('Échec de la synchronisation : '+(err.message||'connexion indisponible')+'. Aucun relevé validé.');}
    finally{busy=false;if(button)button.disabled=false;}
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
    const ratio=Math.min(1,1600/Math.max(w,h)); // photo allégée pour accélérer le transfert
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
  // Le service du club peut renvoyer soit un objet compte, soit {text:"..."}.
  // Ne jamais deviner des quantités à partir d'un JSON incomplet : demander
  // une nouvelle réponse plutôt que conserver un stack potentiellement faux.
  function aiError(message, code){const error=new Error(message);error.code=code;return error;}
  function parseResponse(data){
    let obj=data;
    for(let depth=0;depth<4;depth++){
      if(obj&&typeof obj==='object'&&obj.error)
        throw aiError('Le service IA a refusé l’analyse. Réessaie ou contacte le responsable du club.','AI_SERVER');
      if(obj&&typeof obj==='object'&&obj.result!==undefined){obj=obj.result;continue;}
      if(obj&&typeof obj==='object'&&typeof obj.text==='string'){obj=obj.text;continue;}
      if(obj&&typeof obj==='object'&&typeof obj.output_text==='string'){obj=obj.output_text;continue;}
      // Compatibilité avec une réponse brute Gemini generateContent.
      if(obj&&Array.isArray(obj.candidates)){
        const parts=obj.candidates[0]&&obj.candidates[0].content&&obj.candidates[0].content.parts;
        obj=Array.isArray(parts)?parts.map(p=>p&&p.text||'').join(''):'';
        continue;
      }
      break;
    }
    if(typeof obj==='string'){
      let value=obj.trim();
      value=value.replace(/^```(?:json)?\s*/i,'').replace(/\s*```\s*$/,'').trim();
      // Quelques serveurs placent un paragraphe autour d'un objet JSON valide.
      const first=value.indexOf('{'),last=value.lastIndexOf('}');
      if(first<0||last<=first)throw aiError('Réponse IA incomplète. Relance l’analyse.','BAD_AI_JSON');
      value=value.slice(first,last+1);
      try{obj=JSON.parse(value);}catch(_err){
        // Ne pas tenter de réparer arbitrairement les listes de jetons :
        // elles pourraient contenir des quantités falsifiées ou incomplètes.
        throw aiError('Réponse IA mal formatée. Une nouvelle analyse est nécessaire.','BAD_AI_JSON');
      }
    }
    if(!obj||typeof obj!=='object'||Array.isArray(obj))
      throw aiError('Réponse IA non exploitable. Relance l’analyse.','BAD_AI_JSON');
    const counts={};KEYS.forEach(k=>counts[k]=0);
    const canonical=k=>({red:'orange',rouge:'orange',brown:'pink',marron:'pink',vert:'green',bleu:'blue',noir:'black',violet:'purple',jaune:'yellow',rose:'pink'}[k]||k);
    if(Array.isArray(obj.jetons)){
      if(obj.jetons.length>400)throw aiError('Nombre de jetons incohérent.','BAD_AI_DATA');
      for(const chip of obj.jetons){
        if(!chip||typeof chip!=='object')throw aiError('Jeton invalide dans la réponse IA.','BAD_AI_DATA');
        const key=canonical(String(chip.c||chip.couleur||'').toLowerCase().trim());
        if(!KEYS.includes(key))throw aiError('Couleur inconnue dans la réponse IA.','BAD_AI_DATA');
        const n=chip.quantite===undefined?1:Number(chip.quantite);
        if(!Number.isInteger(n)||n<0||n>400)throw aiError('Quantité non valide dans la réponse IA.','BAD_AI_DATA');
        counts[key]+=n;
      }
    }else{
      const source=obj.counts&&typeof obj.counts==='object'?obj.counts:obj;
      // Au moins un champ de couleur doit être présent, sinon ne pas afficher un faux zéro.
      if(!Object.keys(source).some(k=>KEYS.includes(canonical(k.toLowerCase()))))
        throw aiError('Aucune quantité reconnue dans la réponse IA.','BAD_AI_DATA');
      Object.entries(source).forEach(([original,nRaw])=>{
        const k=canonical(original.toLowerCase());if(!KEYS.includes(k))return;
        const n=Number(nRaw);
        if(!Number.isInteger(n)||n<0||n>400)throw aiError('Quantité IA non valide pour '+NAMES[k]+'.','BAD_AI_DATA');
        counts[k]+=n;
      });
    }
    return {counts,certitude:obj.certitude??obj.confiance??obj.confidence??obj.reliability??null,remarque:String(obj.remarque||obj.commentaire||''),jeu:(['moonriver','palace','indetermine'].includes(obj.jeuDetecte)?obj.jeuDetecte:'indetermine'),five:0,
      marks:Array.isArray(obj.jetons)?obj.jetons.filter(m=>m&&KEYS.includes(canonical(String(m.c||'').toLowerCase()))&&Number.isFinite(Number(m.x))&&Number.isFinite(Number(m.y))).map(m=>({c:canonical(String(m.c).toLowerCase()),x:Number(m.x),y:Number(m.y)})):[]};
  }
  function isMalformedServerResponse(message){
    return /JSON|array element|Unexpected token|Expected ','|Expected '}'|SyntaxError|parse/i.test(String(message||''));
  }
  // Diagnostic réseau : préserver le statut HTTP même si Cloudflare renvoie une page HTML
  // au lieu d'un objet JSON. Ne jamais consigner le jeton Firebase ni la photo.
  function safeServerCode(value){
    const code=String(value||'').trim();
    return /^[a-zA-Z0-9_.-]{1,60}$/.test(code)?code:'';
  }
  async function callClubAI(base64,token){
    // Planches de référence (petites images en cache, une par jeu) : jamais d'attente > 1,5 s.
    let referenceSheets=null;
    try{const get=k=>Promise.race([root.BPTChipReferences?.getSheet?.(k)||null,new Promise(r=>setTimeout(()=>r(null),1500))]);
      const [moonriver,palace]=await Promise.all([get('moonriver'),get('palace')]);
      if(moonriver||palace)referenceSheets=Object.assign({},moonriver?{moonriver}:{},palace?{palace}:{});}catch(_){}
    const url=String(root.BPT_AI_CONFIG&&root.BPT_AI_CONFIG.proxyUrl||'').trim();
    if(!url||!/^https:\/\//i.test(url))throw new Error('Service IA du club non configuré. Contacte l’organisateur.');
    // Une seule demande à Gemini. En cas de panne 502, seul le joueur peut relancer.
    const controller=new AbortController();activeAIAbort=controller;
    const timeout=setTimeout(()=>controller.abort(),AI_REQUEST_TIMEOUT_MS);
    const t0=performance.now();
    try{
      let response;
      try{
        response=await fetch(url,{
          method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
          // Choix enregistre dans le Live et partage avec tous les joueurs.
          body:JSON.stringify(Object.assign({image:base64,requestedFormat:'counts'},referenceSheets?{referenceSheets}:{})),signal:controller.signal
        });
      }catch(networkErr){
        if(networkErr?.name==='AbortError')throw networkErr;
        if(networkErr instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(String(networkErr?.message||''))){
          console.warn('[BPT scanner IA] échec réseau/CORS',{origin:location.origin,service:url.replace(/\?.*$/, ''),errorName:networkErr?.name||'TypeError'});
          throw aiError('Connexion au serveur IA impossible (réseau ou CORS). Vérifie le Worker Cloudflare via /health.','AI_NETWORK');
        }
        throw networkErr;
      }
      // Lire une seule fois la réponse comme texte, afin de différencier un HTTP 502
      // renvoyant du HTML d'un vrai JSON IA incorrect après un HTTP 200.
      const body=await response.text();
      let data=null;
      try{if(body.trim())data=JSON.parse(body);}catch(_){/* diagnostic selon le code HTTP */}
      const ray=String(response.headers.get('cf-ray')||'').slice(0,80);
      const serverCode=safeServerCode(data?.error?.code||data?.code||data?.error_code);
      const upstreamStatus=Number(data?.error?.upstreamStatus||data?.upstreamStatus||0)||null;
      if(!response.ok){
        // Pas de contenu sensible dans les logs : ni photo, ni clés, ni corps serveur.
        console.warn('[BPT scanner IA] réponse serveur',{
          httpStatus:response.status,serverCode,upstreamStatus,
          cfRay:ray||null,dureeMs:Math.round(performance.now()-t0),
          contenu:body.trim().startsWith('<')?'HTML':data?'JSON':'autre'
        });
        if(response.status===429)throw aiError('Quota IA atteint (HTTP 429). Réessaie plus tard.','AI_QUOTA');
        if(response.status===401||response.status===403)
          throw aiError('Accès au service IA refusé (HTTP '+response.status+'). Vérifie ta connexion BPT.','AI_AUTH');
        if([502,503,504].includes(response.status)){
          const detail=String(data?.error?.message||(typeof data?.error==='string'?data.error:'')||'').replace(/[<>]/g,'').slice(0,220);
          const e=aiError('Service IA du club indisponible (HTTP '+response.status+')'+(detail?' : '+detail:'. Aucun détail : le Worker n’a pas répondu en JSON, voir ses journaux Cloudflare.')+(ray?' [Réf. '+ray+']':''),'AI_UPSTREAM');
          e.httpStatus=response.status;e.cfRay=ray;e.serverCode=serverCode;throw e;
        }
        const serverMessage=String(data?.error?.message||data?.error||'');
        if(isMalformedServerResponse(serverMessage))
          throw aiError('Le serveur IA renvoie une réponse JSON incorrecte. Le Worker doit imposer un format structuré.','BAD_AI_JSON');
        const e=aiError('Erreur du service IA du club (HTTP '+response.status+'). Contacte l’organisateur.','AI_HTTP');
        e.httpStatus=response.status;e.cfRay=ray;e.serverCode=serverCode;throw e;
      }
      if(!data){
        throw aiError('Le service IA a répondu HTTP 200 sans JSON valide. Correction nécessaire sur le Worker.','BAD_AI_JSON');
      }
      try{return parseResponse(data);}catch(err){
        if(err.code==='BAD_AI_JSON')throw aiError('Le serveur IA renvoie un JSON incorrect. Le Worker doit imposer un format structuré.','BAD_AI_JSON');
        throw err;
      }
    }finally{clearTimeout(timeout);if(activeAIAbort===controller)activeAIAbort=null;}
  }
  async function encodePhoto(file){
    const canvas=await readImage(file);
    // toBlob asynchrone : évite le long blocage de l'interface mobile par toDataURL.
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Compression photo impossible')),'image/jpeg',0.73));
    const encoded=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Lecture photo impossible'));reader.readAsDataURL(blob);});
    return {canvas,encoded,bytes:blob.size};
  }
  // V10.4.153 : numérote sur la photo chaque jeton compté pour vérifier d'un coup d'oeil (jeton oublié ou compté en double).
  const MARK_COLOR={green:'#2ecc40',blue:'#0074d9',black:'#111',purple:'#b10dc9',yellow:'#ffdc00',pink:'#ff69b4',orange:'#ff851b'};
  function drawMarks(marks){
    try{const preview=$('bptStackPreview');if(!preview||!imageCanvas||!marks||!marks.length)return;
      const cv=document.createElement('canvas');cv.width=imageCanvas.width;cv.height=imageCanvas.height;
      const g=cv.getContext('2d');g.drawImage(imageCanvas,0,0);
      const r=Math.max(11,Math.round(Math.max(cv.width,cv.height)/60));
      g.font='bold '+Math.round(r*1.15)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';
      marks.forEach((m,i)=>{const x=m.x/1000*cv.width,y=m.y/1000*cv.height;
        g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fillStyle=MARK_COLOR[m.c]||'#fff';g.fill();g.lineWidth=3;g.strokeStyle='#fff';g.stroke();
        g.fillStyle=(m.c==='yellow'||m.c==='pink'||m.c==='green'||m.c==='orange')?'#000':'#fff';g.fillText(String(i+1),x,y+1);});
      preview.src=cv.toDataURL('image/jpeg',0.82);
    }catch(_){/* l'aperçu reste la photo d'origine */}
  }
  async function processPhoto(file){
    if(!file||!file.type.startsWith('image/'))return;
    lastPhotoFile=file;samePhotoRetryAvailable=false;
    stopAI();
    const started=performance.now();let prepMs=0,serverMs=0,imageBytes=0;
    const myRequest=++requestNo;mode='ia';busy=true;editingIndex=null;reset();
    const btn=$('bptStackGoAI');if(btn)btn.disabled=true;
    setStep('work');showAnalysis('pending',{message:'Préparation de la photo…'});
    status('Préparation de la photo pour le service IA du club…');
    try{
      // Préparation/compression photo et récupération du jeton d'accès simultanées.
      const [{canvas,encoded,bytes},token]=await Promise.all([encodePhoto(file),firebaseToken()]);
      if(myRequest!==requestNo)return;
      prepMs=elapsedMs(started);imageBytes=bytes;imageCanvas=canvas;
      const preview=$('bptStackPreview');if(preview){preview.src=encoded;preview.style.width='100%';}
      if($('bptStackZoom'))$('bptStackZoom').value=100;
      if($('bptStackZoomVal'))$('bptStackZoomVal').textContent='100 %';
      show($('bptStackPhotoWrap'),true);
      showAnalysis('pending',{message:'Reconnaissance IA en cours… Une seule demande est envoyée.'});
      status('Analyse en cours. Préparation : '+sec(prepMs)+'. Attente du serveur IA…');
      const serverStart=performance.now();
      let result;
      try{result=await callClubAI(encoded.split(',')[1],token);}
      finally{serverMs=elapsedMs(serverStart);}
      if(myRequest!==requestNo)return;
      applyCounts(result.counts);drawMarks(result.marks);
      const n=KEYS.reduce((sum,k)=>sum+result.counts[k],0);
      const total=totalOf(result.counts);
      let reliability=normalizeReliability(result.certitude);
      const timing='Durée : '+sec(elapsedMs(started))+' (préparation '+sec(prepMs)+' ; serveur '+sec(serverMs)+')';
      const notes=[];
      if(result.remarque)notes.push(result.remarque);
      showAnalysis('done',{total,chips:n,reliability,remark:notes.join(' '),timing});
      samePhotoRetryAvailable=false;show($('bptStackRetrySame'),false);
      status('Stack estimé : '+fmt(total)+' points. Vérifie les quantités puis valide. '+timing);
      console.info('[BPT scanner IA] analyse', {preparationMs:prepMs,serverMs,imageKB:Math.round(imageBytes/1024)});
    }catch(err){
      if(myRequest!==requestNo)return;
      if(step!=='work')setStep('work');
      reset();
      const reason=err.name==='AbortError'?'Le serveur IA dépasse '+Math.round(AI_REQUEST_TIMEOUT_MS/1000)+' secondes. Réessaie plus tard.':(err&&err.message||'Erreur inconnue');
      const timing='Durée : '+sec(elapsedMs(started))+' (préparation '+sec(prepMs)+' ; serveur '+sec(serverMs)+')';
      showAnalysis('error',{message:reason,timing});
      samePhotoRetryAvailable=!!lastPhotoFile;show($('bptStackRetrySame'),samePhotoRetryAvailable);
      status('Aucun résultat IA enregistré. '+timing+' Utilise le comptage manuel si nécessaire.');
      console.warn('[BPT scanner IA] échec', {preparationMs:prepMs,serverMs,message:reason});
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
    toolbar.innerHTML='<button type="button" id="bptStackBack">← Retour</button><button type="button" id="bptStackRetry">Nouvelle photo IA</button><button type="button" id="bptStackRetrySame" style="display:none">Réessayer cette photo</button>';
    body.insertBefore(toolbar,home.nextSibling);
    const validateButton=document.createElement('button');validateButton.type='button';validateButton.id='bptStackValidate';
    validateButton.className='bpt-stack-validate';validateButton.textContent='Valider le stack';
    const actions=body.querySelector('.bpt-stack-actions:not(#bptStackWorkBar)');if(!actions)return;
    actions.parentNode.insertBefore(validateButton,actions);
    const lastButton=document.createElement('button');lastButton.type='button';lastButton.id='bptStackLast';lastButton.textContent='↺ Comme mon dernier relevé';
    actions.insertBefore(lastButton,actions.firstChild);lastButton.addEventListener('click',applyLast);

    $('bptStackGoManual').addEventListener('click',startManual);
    $('bptStackGoAI').addEventListener('click',selectPhoto);
    $('bptStackRetry').addEventListener('click',selectPhoto);
    $('bptStackRetrySame').addEventListener('click',()=>{if(lastPhotoFile&&!busy)processPhoto(lastPhotoFile);});
    $('bptStackBack').addEventListener('click',()=>goHome());
    validateButton.addEventListener('click',validate);
    $('bptStackFile').addEventListener('change',event=>{
      const file=event.target.files&&event.target.files[0];if(file)processPhoto(file);
    });
    $('bptStackHist').addEventListener('click',async event=>{
      const take=event.target.closest('[data-hr]'),del=event.target.closest('[data-hd]');
      const hist=historyGet();
      if(del){const id=del.dataset.hd;if(!confirm('Supprimer ce relevé synchronisé ?'))return;del.disabled=true;
        try{await root.BPTStackSync.remove(id);}catch(e){alert('Suppression impossible : '+(e.message||'connexion indisponible'));del.disabled=false;}return;}
      if(take){const entry=hist.find(x=>x.id===take.dataset.hr);if(entry){startManual();editingIndex=entry.id;refreshLastButton();applyCounts(compatibleCounts(entry.counts));status('Modification de ce relevé : valide pour synchroniser la correction.');}}
    });
    document.addEventListener('bpt-stack-records-updated',()=>{if(step==='home')renderHistory();else refreshLastButton();});
    // Réveille le serveur IA (connexion TLS + démarrage du Worker) dès l'ouverture du scanner : la photo part ensuite plus vite.
    let warmAt=0;
    function warmUp(){const url=String(root.BPT_AI_CONFIG&&root.BPT_AI_CONFIG.proxyUrl||'').trim();
      if(!/^https:\/\//i.test(url)||Date.now()-warmAt<240000)return;warmAt=Date.now();
      try{fetch(url,{method:'GET',mode:'no-cors',cache:'no-store'}).catch(()=>{});}catch(_){/* sans importance */}}
    document.addEventListener('click',event=>{if(event.target.closest('.bpt-stack-open')){goHome();warmUp();}});
    setStep('home');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  root.BPTStackAI={parseAI:parseResponse};
})(typeof window!=='undefined'?window:globalThis);
