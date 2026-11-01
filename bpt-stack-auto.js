/* BPT 10.4.125 — comptage de pile VUE DE CÔTÉ.
   Principe : l'utilisateur entoure la pile ; la largeur de la pile = diamètre du jeton (≈39 mm), l'épaisseur
   d'un jeton (≈3,3 mm) s'en déduit (ratio ≈11,8) et peut être affinée par la périodicité des jointures.
   Chaque ligne de pixels reçoit une couleur (vote majoritaire), on découpe en bandes de même couleur,
   et nombre de jetons d'une bande = hauteur de la bande / épaisseur. Tout est modifiable ensuite à la main. */
(function(root){'use strict';
const KEYS=['green','blue','black','purple','brown','red'];
const VAL={green:25,blue:50,black:100,purple:500,brown:5000,red:10000};
const HEX={green:'#70c943',blue:'#12a4de',black:'#383342',purple:'#5b4275',brown:'#926038',red:'#d94a4d'};
const ROW_VALUE_ORDER=[25,50,100,500,5000,10000]; // ordre des lignes du tableau (bpt-stack-scanner.js)
const RATIO=11.8; // diamètre / épaisseur d'un jeton de casino 39 x 3,3 mm

function hsv(r,g,b){r/=255;g/=255;b/=255;const M=Math.max(r,g,b),m=Math.min(r,g,b),d=M-m;let h=0;if(d){if(M===r)h=((g-b)/d+6)%6;else if(M===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;}return [h,M?d/M:0,M];}
/* retourne une clé de couleur, 'white' (tache de bord / reflet), ou null (indéterminé) */
function classify(r,g,b){const [h,s,v]=hsv(r,g,b);
 if(v<.34&&s<.3)return 'black';
 if(s<.17)return v>.62?'white':null;
 if(v<.2)return 'black';
 if((h>=340||h<14)&&v>.3&&s>.35)return 'red';
 if(h>=180&&h<=252&&s>.3)return 'blue';
 if(h>=255&&h<=330&&s>.14&&v<.85)return v<.3&&s<.3?'black':'purple';
 if(h>=70&&h<=172&&s>.22&&v>.4)return 'green';
 if(h>=14&&h<=60&&s>.22&&v<.88)return 'brown';
 return null;}

/* Étiquette de couleur par ligne. get(row,col) -> [r,g,b]. along = nb de lignes, across = nb de colonnes */
function rowLabels(get,along,across){
 const c0=Math.floor(across*.2),c1=Math.ceil(across*.8),n=c1-c0;const labels=new Array(along).fill(null);const lum=new Float32Array(along);
 for(let y=0;y<along;y++){const cnt={};let used=0,l=0;
  for(let x=c0;x<c1;x++){const p=get(y,x);l+=(p[0]+p[1]+p[2])/3;const k=classify(p[0],p[1],p[2]);if(k&&k!=='white'){cnt[k]=(cnt[k]||0)+1;used++;}}
  lum[y]=l/n;let best=null,bc=0;for(const k in cnt)if(cnt[k]>bc){bc=cnt[k];best=k;}
  if(best&&bc>=n*.22&&bc>=used*.5)labels[y]=best;}
 return {labels,lum};}

/* Épaisseur affinée par autocorrélation du profil de luminance (jointures entre jetons). */
function refineThickness(lum,nominal){
 const n=lum.length;if(n<nominal*4)return {t:nominal,source:'ratio'};
 // passe-haut : soustrait une moyenne glissante sur ~1,5 épaisseur
 const win=Math.max(3,Math.round(nominal*1.5));const hp=new Float32Array(n);let acc=0;const pre=new Float32Array(n+1);for(let i=0;i<n;i++)pre[i+1]=pre[i]+lum[i];
 for(let i=0;i<n;i++){const a=Math.max(0,i-win),b=Math.min(n,i+win+1);hp[i]=lum[i]-(pre[b]-pre[a])/(b-a);}
 let e0=0;for(let i=0;i<n;i++)e0+=hp[i]*hp[i];if(e0<1e-6)return {t:nominal,source:'ratio'};
 const lo=Math.max(3,Math.floor(nominal*.82)),hi=Math.ceil(nominal*1.2);let best=-1,bl=nominal;const ac=[];
 for(let lag=lo;lag<=hi;lag++){let s=0;for(let i=0;i+lag<n;i++)s+=hp[i]*hp[i+lag];s/=e0*(n-lag)/n;ac[lag]=s;}
 // maximum local, pas simplement le bord de la plage
 for(let lag=lo+1;lag<hi;lag++)if(ac[lag]>ac[lag-1]&&ac[lag]>=ac[lag+1]&&ac[lag]>best){best=ac[lag];bl=lag;}
 if(best>.25){ // interpolation parabolique
  const a=ac[bl-1],b=ac[bl],c=ac[bl+1],den=a-2*b+c;const off=den?0.5*(a-c)/den:0;return {t:bl+Math.max(-.5,Math.min(.5,off)),source:'périodicité',score:best};}
 return {t:nominal,source:'ratio'};}

function segment(labels,t){
 const n=labels.length;let L=labels.slice();
 // filtre de mode (fenêtre ~ t/2) pour retirer les pixels isolés
 const half=Math.max(1,Math.round(t*.25));const sm=new Array(n).fill(null);
 for(let i=0;i<n;i++){const c={};let b=null,bc=0;for(let j=Math.max(0,i-half);j<=Math.min(n-1,i+half);j++){const k=L[j];if(!k)continue;c[k]=(c[k]||0)+1;if(c[k]>bc){bc=c[k];b=k;}}sm[i]=b;}
 L=sm;
 // comble les trous (jointures, taches) plus petits que ~1,3 t avec la couleur voisine si identique des 2 côtés, sinon coupe au milieu
 let i=0;while(i<n){if(L[i]){i++;continue;}let j=i;while(j<n&&!L[j])j++;const gap=j-i,A=i>0?L[i-1]:null,B=j<n?L[j]:null;
  if(A&&B&&gap<=t*1.3){if(A===B){for(let k=i;k<j;k++)L[k]=A;}else{const mid=i+Math.floor(gap/2);for(let k=i;k<j;k++)L[k]=(k<mid?A:B)||A||B;}}
  i=j;}
 const runs=[];i=0;while(i<n){const k=L[i];if(!k){i++;continue;}let j=i;while(j<n&&L[j]===k)j++;runs.push({key:k,start:i,end:j,len:j-i});i=j;}
 // fusionne les petites bandes parasites (< .45 t) avec le voisin dominant ; fusionne bandes adjacentes de même couleur
 let changed=true;while(changed){changed=false;
  for(let r=0;r<runs.length;r++){if(runs[r].len<t*.45){runs.splice(r,1);changed=true;break;}}
  for(let r=0;r+1<runs.length;r++){if(runs[r].key===runs[r+1].key&&runs[r+1].start-runs[r].end<=t*.6){runs[r].end=runs[r+1].end;runs[r].len=runs[r].end-runs[r].start;runs.splice(r+1,1);changed=true;break;}}}
 return runs;}

/* API principale. get(row,col)->[r,g,b], along=hauteur de la pile en pixels, across=sa largeur. */
function countStack(get,along,across,opts){opts=opts||{};
 const nominal=opts.thickness||across/RATIO;
 const {labels,lum}=rowLabels(get,along,across);
 const ref=opts.thickness?{t:opts.thickness,source:'manuel'}:refineThickness(lum,nominal);const t=ref.t;
 const runs=segment(labels,t);
 runs.forEach(r=>{r.count=Math.max(1,Math.round(r.len/t));r.value=VAL[r.key];});
 const counts={};KEYS.forEach(k=>counts[k]=0);runs.forEach(r=>counts[r.key]+=r.count);
 return {runs,counts,thickness:t,nominal,source:ref.source,total:runs.reduce((s,r)=>s+r.count*r.value,0),chips:runs.reduce((s,r)=>s+r.count,0)};}

if(typeof module!=='undefined'&&module.exports){module.exports={countStack,classify,rowLabels,segment,refineThickness,KEYS,VAL,RATIO};}
root.BPTStackCount={countStack,classify,KEYS,VAL,RATIO};
if(typeof document==='undefined')return;


/* ---------------- Analyse par IA vision (photos à plat, en éventail, piles en biais) ---------------- */
const AI_MODEL='claude-sonnet-5-5';
const AI_PROMPT="Tu es un compteur de jetons de poker. Les jetons sont de la marque « Chips Palace » ; il n'existe que 6 types (couleur du corps du jeton / couleur des pastilles de bord / valeur imprimée au centre) :\n"
+"- green  : VERT / pastilles marron / 25\n- blue   : BLEU / pastilles blanches / 50\n- black  : NOIR / pastilles mauves ou roses / 100\n- purple : VIOLET foncé / pastilles blanches / 500\n- brown  : MARRON / pastilles vertes / 5000\n- red    : ROUGE / pastilles blanches / 10000\n"
+"Méthode : 1) repère chaque groupe (jetons isolés, éventails, piles) ; 2) dans chaque groupe compte les jetons UN PAR UN : un jeton posé à plat se reconnaît à son disque central imprimé, un jeton dans une pile vue de côté ou en biais se reconnaît à sa tranche (bande de couleur avec ses pastilles) ; deux tranches de même couleur superposées = 2 jetons ; 3) vérifie qu'aucun jeton n'est compté deux fois (un jeton à demi caché derrière un autre compte pour 1) et qu'aucun jeton partiellement visible n'est oublié. Ne compte pas la face imprimée ET la tranche du même jeton. Ignore tout ce qui n'est pas un jeton (cartes, objets, motifs du tapis ou du parquet).\n"
+"Pour chaque jeton donne un point (x,y) sur ce jeton, en fraction de la largeur et de la hauteur de l'image (0 à 1, origine en haut à gauche) ; pour une pile, un point par tranche, posé sur la tranche.\n"
+"Réponds UNIQUEMENT par un objet JSON compact, sans texte autour : {\"jetons\":[{\"c\":\"red\",\"x\":0.52,\"y\":0.31},...],\"certitude\":\"haute|moyenne|basse\",\"remarque\":\"une phrase sur les jetons difficiles à compter (cachés, flous, ambigus)\"}";
function aiGet(k){let v='';try{v=localStorage.getItem(k)||'';}catch(_){}if(v)return v;const c=root.BPT_AI_CONFIG||{};return ({bptStackAIProvider:c.proxyUrl?'proxy':c.provider,bptStackProxyUrl:c.proxyUrl,bptStackGeminiKey:c.geminiKey,bptStackGeminiModel:c.geminiModel}[k])||'';}
function aiSet(k,v){try{localStorage.setItem(k,v);}catch(_){}}
function toJpegBase64(canvas,maxSide){const sc=Math.min(1,maxSide/Math.max(canvas.width,canvas.height));const c=document.createElement('canvas');c.width=Math.round(canvas.width*sc);c.height=Math.round(canvas.height*sc);c.getContext('2d').drawImage(canvas,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.85).split(',')[1];}
function chipCounts(chips){const c={};KEYS.forEach(k=>c[k]=0);chips.forEach(j=>{if(c[j.c]!==undefined)c[j.c]++;});return c;}
function parseAI(text){const m=String(text).match(/\{[\s\S]*\}/);if(!m)throw Error('Réponse illisible');const o=JSON.parse(m[0]);let chips=[];
 if(Array.isArray(o.jetons)){chips=o.jetons.map(j=>({c:String(j.c||j.couleur||'').toLowerCase(),x:Math.max(0,Math.min(1,Number(j.x))),y:Math.max(0,Math.min(1,Number(j.y)))})).filter(j=>KEYS.indexOf(j.c)>=0&&Number.isFinite(j.x)&&Number.isFinite(j.y)).slice(0,400);}
 else{ // ancien format : seulement des totaux
  KEYS.forEach(k=>{const n=Math.max(0,Math.min(99,Math.round(Number(o[k]))||0));for(let i=0;i<n;i++)chips.push({c:k,x:.5,y:.5,noPos:true});});}
 return {chips,counts:chipCounts(chips),certitude:o.certitude||'',remarque:o.remarque||''};}
async function aiToken(){try{for(let i=0;i<20;i++){if(window.firebase&&firebase.auth){const u=firebase.auth().currentUser;if(u)return await u.getIdToken();}await new Promise(ok=>setTimeout(ok,250));}}catch(_){}return '';}
function aiProvider(){return aiGet('bptStackAIProvider')||'gemini';}
async function callAI(b64){
 const prov=aiProvider();let url,headers={'content-type':'application/json'},body,extract;
 if(prov==='proxy'){
  const pu=aiGet('bptStackProxyUrl').trim();if(!pu)throw Error('NOKEY');const t=await aiToken();if(!t)throw Error('Connexion Firebase requise : ouvre l’appli en ligne, connecte-toi puis réessaie.');
  url=pu;headers.authorization='Bearer '+t;body={image:b64};extract=j=>j.text||'';
 }else if(prov==='gemini'){
  const key=aiGet('bptStackGeminiKey').trim();if(!key)throw Error('NOKEY');const model=(aiGet('bptStackGeminiModel').trim()||'gemini-flash-latest');
  url='https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent';headers['x-goog-api-key']=key;
  body={contents:[{role:'user',parts:[{inline_data:{mime_type:'image/jpeg',data:b64}},{text:AI_PROMPT}]}],generationConfig:{temperature:0,maxOutputTokens:4000,responseMimeType:'application/json'}};
  extract=j=>{const c=(j.candidates||[])[0];if(!c){throw Error((j.promptFeedback&&j.promptFeedback.blockReason)?('Photo refusée ('+j.promptFeedback.blockReason+')'):'Réponse vide');}return ((c.content&&c.content.parts)||[]).map(x=>x.text||'').join('');};
 }else{
  const endpoint=aiGet('bptStackAIEndpoint').trim(),key=aiGet('bptStackAIKey').trim();
  body={model:AI_MODEL,max_tokens:3000,messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:'image/jpeg',data:b64}},{type:'text',text:AI_PROMPT}]}]};
  url='https://api.anthropic.com/v1/messages';
  if(endpoint){url=endpoint;const t=await aiToken();if(t)headers.authorization='Bearer '+t;}else{if(!key)throw Error('NOKEY');headers['x-api-key']=key;headers['anthropic-version']='2023-06-01';headers['anthropic-dangerous-direct-browser-access']='true';}
  extract=j=>(j.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('');
 }
 let lastErr;
 for(let attempt=0;attempt<2;attempt++){
  const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),60000);
  try{const r=await fetch(url,{method:'POST',headers,body:JSON.stringify(body),signal:ctl.signal});
   const j=await r.json().catch(()=>({}));
   if(!r.ok){const msg=(j.error&&(j.error.message||j.error))||('Erreur '+r.status);if([429,500,502,503,529].indexOf(r.status)>=0&&attempt===0){lastErr=Error(r.status===429?'Quota gratuit atteint, nouvelle tentative…':String(msg));await new Promise(ok=>setTimeout(ok,r.status===429?4000:1500));continue;}
    if(r.status===429)throw Error('Quota atteint (limite gratuite par minute ou par jour) : réessaie dans un moment.');
    if(prov==='proxy'&&r.status===429)throw Error(String(msg));if(r.status===401||r.status===403||(r.status===400&&/api key/i.test(String(msg))))throw Error('Clé refusée : vérifie la clé API'+(prov==='gemini'?' Gemini.':' ou l’adresse du serveur.'));throw Error(String(msg));}
   return parseAI(extract(j));}
  catch(err){if(err.name==='AbortError')throw err;if(attempt===0&&err instanceof TypeError){lastErr=err;await new Promise(ok=>setTimeout(ok,1500));continue;}throw err;}
  finally{clearTimeout(to);}}
 throw lastErr||Error('Échec');}
function applyCounts(counts){
 document.querySelectorAll('#bptStackLines .bpt-stack-line').forEach(line=>{const key=KEYS[ROW_VALUE_ORDER.indexOf(Number(line.dataset.value))];line.querySelector('input').value=key?counts[key]:0;});
 $('bptStackLines').dispatchEvent(new Event('input',{bubbles:true}));}
const NAMES_FR={green:'vert',blue:'bleu',black:'noir',purple:'violet',brown:'marron',red:'rouge'};
function aiSummary(){const c=chipCounts(aiChips);return KEYS.filter(x=>c[x]).map(x=>c[x]+' '+NAMES_FR[x]).join(' · ')||'aucun jeton';}
function aiSync(){applyCounts(chipCounts(aiChips));$('bptStackBands').textContent='Marqueurs : '+aiSummary()+(aiInfo?' — IA : certitude '+aiInfo.certitude+(aiInfo.remarque?'. '+aiInfo.remarque:''):'');redraw();}
function buildAI(){
 const auto=$('bptStackAuto');if(!auto||$('bptStackAI'))return;
 const b=document.createElement('button');b.type='button';b.id='bptStackAI';b.className='bpt-stack-auto';b.textContent='Analyser par IA (jetons à plat, piles, éventail)';
 const det=document.createElement('details');det.className='bpt-stack-tip';
 const inp='style="width:100%;box-sizing:border-box;padding:8px;border-radius:6px"';
 det.innerHTML='<summary>Réglages IA</summary>'
  +'<p><label>Fournisseur <select id="bptStackAIProv" '+inp+'><option value="proxy">Serveur du club (aucune clé à saisir)</option><option value="gemini">Google Gemini — ma propre clé</option><option value="anthropic">Anthropic Claude — payant</option></select></label></p>'
  +'<div id="bptStackAIPrx" style="display:none"><p>Adresse du serveur du club (fournie par l’organisateur) :</p><input id="bptStackProxyUrl" type="url" placeholder="https://bpt-scanner-ia.xxx.workers.dev" '+inp+'/></div>'
  +'<div id="bptStackAIGem"><p>Clé gratuite : aistudio.google.com → « Get API key ». Elle reste sur cet appareil. Attention : sur le palier gratuit, Google peut utiliser les photos envoyées pour améliorer ses produits ; dans l’UE/EEE ses conditions prévoient les services payants pour une appli mise à disposition d’utilisateurs.</p><input id="bptStackGeminiKey" type="password" autocomplete="off" placeholder="AIza…" '+inp+'/><p>Modèle (laisser vide = gemini-flash-latest) :</p><input id="bptStackGeminiModel" type="text" placeholder="gemini-flash-latest" '+inp+'/></div>'
  +'<div id="bptStackAIAnt" style="display:none"><p>Clé API Anthropic (payante, stockée seulement sur cet appareil) :</p><input id="bptStackAIKey" type="password" autocomplete="off" placeholder="sk-ant-…" '+inp+'/><p>Ou adresse de ton serveur/proxy (remplace la clé) :</p><input id="bptStackAIEndpoint" type="url" placeholder="https://…" '+inp+'/></div>'
  +'<p>La photo n’est envoyée que lorsque tu appuies sur « Analyser par IA ».</p>';
 auto.parentNode.insertBefore(b,auto);auto.parentNode.insertBefore(det,auto);
 const fields={bptStackAIKey:$('bptStackAIKey'),bptStackAIEndpoint:$('bptStackAIEndpoint'),bptStackProxyUrl:$('bptStackProxyUrl'),bptStackGeminiKey:$('bptStackGeminiKey'),bptStackGeminiModel:$('bptStackGeminiModel')};
 const prov=$('bptStackAIProv');prov.value=aiProvider();
 const showProv=()=>{$('bptStackAIPrx').style.display=prov.value==='proxy'?'':'none';$('bptStackAIGem').style.display=prov.value==='gemini'?'':'none';$('bptStackAIAnt').style.display=prov.value==='anthropic'?'':'none';};showProv();
 const saveAll=()=>{aiSet('bptStackAIProvider',prov.value);Object.keys(fields).forEach(n=>aiSet(n,fields[n].value.trim()));};
 Object.keys(fields).forEach(n=>{fields[n].value=aiGet(n);fields[n].addEventListener('change',saveAll);});prov.addEventListener('change',()=>{saveAll();showProv();});
 b.addEventListener('click',async()=>{
  if(!bmp){status('Choisis d’abord une photo.');return;}
  saveAll();
  b.disabled=true;status('Analyse par IA en cours (10 à 30 secondes)…');
  try{const res=await callAI(toJpegBase64(bmp,1568));
   aiChips=res.chips;aiInfo={certitude:res.certitude,remarque:res.remarque};setMode('ai');
   const badge=$('bptStackAutoBadge');if(badge){badge.hidden=false;badge.textContent='ESTIMATION PAR IA : chaque jeton est marqué sur la photo. Touche un marqueur pour le supprimer ; choisis une couleur puis touche la photo pour en ajouter.';}
   aiSync();status('Analyse terminée : '+aiChips.length+' jeton(s) marqué(s). Vérifie les marqueurs, corrige si besoin.');}
  catch(err){if(err.message==='NOKEY'){det.open=true;status('Configure l’IA dans « Réglages IA » (adresse du serveur du club, ou ta clé Gemini), puis relance.');}
   else status('Analyse IA impossible : '+(err.name==='AbortError'?'délai dépassé':err.message));}
  finally{b.disabled=false;}});
}
root.BPTStackAI={parseAI,AI_PROMPT,chipCounts};

/* ---------------- Interface ---------------- */
const $=id=>document.getElementById(id);
let sel=null,view=null,bmp=null,lastResult=null,lastBox=null,mode='box',aiChips=[],aiInfo=null,aiTool=null;
function setMode(m){mode=m;const hb=['bptStackHoriz','bptStackThick'].map(i=>$(i)&&$(i).closest('label,div')).filter(Boolean);hb.forEach(n=>n.style.display=(m==='ai'?'none':''));const pal=$('bptStackPal');if(pal)pal.style.display=(m==='ai'?'flex':'none');const h=$('bptStackSelHelp');if(h)h.innerHTML=m==='ai'?'Marqueurs IA : touche un marqueur pour le <strong>supprimer</strong> ; choisis une couleur ci-dessous puis touche la photo pour <strong>ajouter</strong> un jeton oublié.':'1) Fais glisser un cadre autour de la pile, de la première à la dernière tranche, <strong>sans le tapis ni la face du dessus</strong>. La largeur du cadre doit coller à la largeur de la pile.';redraw();}
function status(t){const el=$('bptStackAutoStatus');if(el)el.textContent=t;}
function fmt(n){return n.toLocaleString('fr-FR');}

function buildUI(){
 const wrap=$('bptStackPhotoWrap');if(!wrap||$('bptStackSel'))return;
 const box=document.createElement('div');box.id='bptStackSel';box.hidden=true;
 box.innerHTML='<p class="bpt-stack-tip" id="bptStackSelHelp">1) Fais glisser un cadre autour de la pile, de la première à la dernière tranche, <strong>sans le tapis ni la face du dessus</strong>. La largeur du cadre doit coller à la largeur de la pile.</p>'
  +'<canvas id="bptStackSelCv" style="display:block;width:100%;height:auto;touch-action:none;border:2px solid #27b0c4;border-radius:8px;background:#000"></canvas>'
  +'<label class="bpt-stack-tip" style="display:flex;align-items:center;gap:8px;margin-top:8px"><input type="checkbox" id="bptStackHoriz"/> Pile couchée (horizontale)</label>'
  +'<div class="bpt-stack-zoom" style="position:static;margin-top:4px"><label for="bptStackThick">Épaisseur d’un jeton</label><input id="bptStackThick" type="range" min="70" max="140" step="1" value="100"/><span id="bptStackThickVal">auto</span></div>'
  +'<div id="bptStackPal" style="display:none;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap"><span class="bpt-stack-tip">Ajouter :</span>'+KEYS.map(k=>'<button type="button" data-pal="'+k+'" aria-label="Ajouter un jeton '+NAMES_FR[k]+'" style="width:38px;height:38px;border-radius:50%;border:3px solid #fff3;background:'+HEX[k]+';cursor:pointer"></button>').join('')+'</div>'
  +'<p class="bpt-stack-tip" id="bptStackBands"></p>';
 wrap.parentNode.insertBefore(box,wrap);
 sel=$('bptStackSelCv');
 let drag=null;
 const pos=e=>{const r=sel.getBoundingClientRect();return {x:Math.max(0,Math.min(sel.width,(e.clientX-r.left)*sel.width/r.width)),y:Math.max(0,Math.min(sel.height,(e.clientY-r.top)*sel.height/r.height))};};
 sel.addEventListener('pointerdown',e=>{e.preventDefault();if(mode==='ai'){aiTap(pos(e));return;}sel.setPointerCapture(e.pointerId);const p=pos(e);drag={x0:p.x,y0:p.y};lastBox={x0:p.x,y0:p.y,x1:p.x,y1:p.y};redraw();});
 sel.addEventListener('pointermove',e=>{if(!drag)return;const p=pos(e);lastBox={x0:drag.x0,y0:drag.y0,x1:p.x,y1:p.y};redraw();});
 const end=()=>{if(!drag)return;drag=null;run();};
 sel.addEventListener('pointerup',end);sel.addEventListener('pointercancel',()=>{drag=null;});
 $('bptStackPal').addEventListener('click',e=>{const b=e.target.closest('[data-pal]');if(!b)return;aiTool=aiTool===b.dataset.pal?null:b.dataset.pal;$('bptStackPal').querySelectorAll('[data-pal]').forEach(x=>x.style.borderColor=x.dataset.pal===aiTool?'#fff':'#fff3');status(aiTool?'Touche la photo pour ajouter un jeton '+NAMES_FR[aiTool]+'.':'Ajout désactivé.');});
 $('bptStackHoriz').addEventListener('change',run);
 $('bptStackThick').addEventListener('input',()=>{$('bptStackThickVal').textContent=$('bptStackThick').value+' %';run();});
}

async function loadImage(file){
 let src;
 if(window.createImageBitmap){try{src=await createImageBitmap(file,{imageOrientation:'from-image'});}catch(_){}}
 if(!src){const url=URL.createObjectURL(file);try{src=await new Promise((ok,fail)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=fail;im.src=url;});}finally{URL.revokeObjectURL(url);}}
 const W=src.naturalWidth||src.width,H=src.naturalHeight||src.height,s=Math.min(1,3000/Math.max(W,H));
 const c=document.createElement('canvas');c.width=Math.round(W*s);c.height=Math.round(H*s);c.getContext('2d').drawImage(src,0,0,c.width,c.height);if(src.close)src.close();return c;}

function aiTap(p){const R=Math.max(10,sel.width/32);let bi=-1,bd=1e9;aiChips.forEach((j,i)=>{const d=Math.hypot(j.x*sel.width-p.x,j.y*sel.height-p.y);if(d<bd){bd=d;bi=i;}});
 if(bi>=0&&bd<=R*1.4){aiChips.splice(bi,1);aiSync();status(aiChips.length+' jeton(s) marqué(s).');return;}
 if(aiTool){aiChips.push({c:aiTool,x:p.x/sel.width,y:p.y/sel.height});aiSync();status(aiChips.length+' jeton(s) marqué(s).');}
 else status('Choisis d’abord une couleur pour ajouter un jeton, ou touche un marqueur pour le supprimer.');}
function drawMarkers(ctx){const R=Math.max(10,sel.width/32);ctx.font='bold '+Math.round(R*.95)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
 aiChips.forEach((j,i)=>{const x=j.x*sel.width,y=j.y*sel.height;ctx.beginPath();ctx.arc(x,y,R,0,Math.PI*2);ctx.fillStyle=HEX[j.c];ctx.fill();ctx.lineWidth=Math.max(2,R/5);ctx.strokeStyle='#fff';ctx.stroke();ctx.lineWidth=Math.max(2,R/6);ctx.strokeStyle='#000b';ctx.strokeText(String(i+1),x,y);ctx.fillStyle='#fff';ctx.fillText(String(i+1),x,y);});}
function redraw(){
 if(!sel||!view)return;const ctx=sel.getContext('2d');ctx.drawImage(view,0,0,sel.width,sel.height);
 if(mode==='ai'){drawMarkers(ctx);return;}
 if(lastBox){const x=Math.min(lastBox.x0,lastBox.x1),y=Math.min(lastBox.y0,lastBox.y1),w=Math.abs(lastBox.x1-lastBox.x0),h=Math.abs(lastBox.y1-lastBox.y0);
  ctx.lineWidth=Math.max(2,sel.width/260);ctx.strokeStyle='#27b0c4';ctx.setLineDash([8,5]);ctx.strokeRect(x,y,w,h);ctx.setLineDash([]);
  if(lastResult&&lastResult.drawn){const horiz=$('bptStackHoriz').checked;
   lastResult.runs.forEach(r=>{const a=r.start*lastResult.k,b=r.end*lastResult.k;ctx.fillStyle=HEX[r.key]+'99';ctx.strokeStyle='#fff';ctx.lineWidth=1.5;
    if(!horiz){ctx.fillRect(x,y+a,w,b-a);ctx.strokeRect(x,y+a,w,b-a);ctx.fillStyle='#071a2b';ctx.font='bold '+Math.max(12,sel.width/38)+'px sans-serif';ctx.textBaseline='middle';const lab='×'+r.count;const tw=ctx.measureText(lab).width+8;ctx.fillRect(x+w/2-tw/2,y+(a+b)/2-10,tw,20);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(lab,x+w/2,y+(a+b)/2);}
    else{ctx.fillRect(x+a,y,b-a,h);ctx.strokeRect(x+a,y,b-a,h);ctx.fillStyle='#071a2b';ctx.font='bold '+Math.max(12,sel.width/38)+'px sans-serif';ctx.textBaseline='middle';const lab='×'+r.count;const tw=ctx.measureText(lab).width+8;ctx.fillRect(x+(a+b)/2-tw/2,y+h/2-10,tw,20);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(lab,x+(a+b)/2,y+h/2);}});}}
}

function run(){
 lastResult=null;if(!bmp||!lastBox){return;}
 const horiz=$('bptStackHoriz').checked;
 const sx=sel.width/bmp.width;// canvas -> bitmap
 let x=Math.min(lastBox.x0,lastBox.x1)/sel.width*bmp.width,y=Math.min(lastBox.y0,lastBox.y1)/sel.height*bmp.height,w=Math.abs(lastBox.x1-lastBox.x0)/sel.width*bmp.width,h=Math.abs(lastBox.y1-lastBox.y0)/sel.height*bmp.height;
 const across=horiz?h:w,along=horiz?w:h;
 if(across<12||along<12){status('Cadre trop petit : entoure toute la pile.');redraw();return;}
 // rééchantillonnage : largeur de pile ≈ 240 px
 const k=Math.min(1,240/across);const cw=Math.max(1,Math.round(w*k)),ch=Math.max(1,Math.round(h*k));
 const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const cx=cv.getContext('2d',{willReadFrequently:true});cx.imageSmoothingQuality='high';cx.drawImage(bmp,x,y,w,h,0,0,cw,ch);
 const d=cx.getImageData(0,0,cw,ch).data;
 const get=horiz?((r,c)=>{const i=(c*cw+r)*4;return [d[i],d[i+1],d[i+2]];}):((r,c)=>{const i=(r*cw+c)*4;return [d[i],d[i+1],d[i+2]];});
 const accAlong=horiz?cw:ch,accAcross=horiz?ch:cw;
 const pct=Number($('bptStackThick').value)/100;
 const manual=pct!==1?(accAcross/RATIO)*pct:null;
 const res=countStack(get,accAlong,accAcross,manual?{thickness:manual}:{});
 res.k=(horiz?w:h)/accAlong;res.drawn=true;lastResult=res;
 // remplissage du tableau
 const lines=document.querySelectorAll('#bptStackLines .bpt-stack-line');
 lines.forEach(line=>{const v=Number(line.dataset.value);const key=KEYS[ROW_VALUE_ORDER.indexOf(v)];line.querySelector('input').value=key?res.counts[key]:0;});
 $('bptStackLines').dispatchEvent(new Event('input',{bubbles:true}));
 const badge=$('bptStackAutoBadge');if(badge){badge.hidden=false;badge.textContent='ESTIMATION : vérifie la ligne ×N de chaque bande sur la photo. Corrige avec les +/− ou le curseur d’épaisseur si besoin.';}
 const names={green:'vert',blue:'bleu',black:'noir',purple:'violet',brown:'marron',red:'rouge'};
 $('bptStackBands').textContent=res.runs.length?('Bandes (haut → bas) : '+res.runs.map(r=>r.count+' '+names[r.key]).join(' · ')+' — épaisseur '+res.thickness.toFixed(1)+' px ('+res.source+').'):'Aucune bande de couleur reconnue : recadre sur la tranche de la pile, avec un bon éclairage.';
 status(res.chips?res.chips+' jeton(s) estimé(s), total '+fmt(res.total)+'. Si ça ne colle pas : ajuste le cadre (largeur = pile) ou l’épaisseur.':'Aucun jeton reconnu.');
 redraw();
}

function init(){
 const btn=$('bptStackAuto'),file=$('bptStackFile');if(!btn||!file)return;buildUI();buildAI();
 btn.textContent='Compter une pile de profil (local)';
 btn.addEventListener('click',()=>{if(!bmp){status('Choisis d’abord une photo.');return;}setMode('box');
  if(!lastBox){const W=sel.width,H=sel.height;lastBox={x0:W*.35,y0:H*.1,x1:W*.65,y1:H*.9};}run();});
 file.addEventListener('change',async()=>{const f=file.files&&file.files[0];if(!f||!f.type.startsWith('image/'))return;
  try{bmp=await loadImage(f);}catch(e){status('Photo illisible.');return;}
  const W=bmp.width,H=bmp.height;
  const scale=Math.min(1,1000/Math.max(W,H));sel.width=Math.round(W*scale);sel.height=Math.round(H*scale);
  view=document.createElement('canvas');view.width=sel.width;view.height=sel.height;view.getContext('2d').drawImage(bmp,0,0,sel.width,sel.height);
  aiChips=[];aiInfo=null;mode='box';setMode('box');lastBox=null;lastResult=null;$('bptStackThick').value=100;$('bptStackThickVal').textContent='auto';$('bptStackBands').textContent='';
  $('bptStackSel').hidden=false;$('bptStackPhotoWrap').hidden=true;redraw();
  status('Photo chargée. Dessine un cadre autour de la pile (de côté).');});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(typeof window!=='undefined'?window:globalThis);
