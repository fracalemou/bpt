/* BPT 10.4.121 — comptage de pile VUE DE CÔTÉ.
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
const AI_PROMPT="Tu comptes des jetons de poker de la marque « Chips Palace » sur cette photo. Types possibles (couleur du jeton, couleur des pastilles de bord, valeur imprimée) :\n"
+"- green : jeton VERT, pastilles marron, valeur 25\n- blue : jeton BLEU, pastilles blanches, valeur 50\n- black : jeton NOIR, pastilles mauves/roses, valeur 100\n- purple : jeton VIOLET foncé, pastilles blanches, valeur 500\n- brown : jeton MARRON, pastilles vertes, valeur 5000\n- red : jeton ROUGE, pastilles blanches, valeur 10000\n"
+"Compte CHAQUE jeton individuel, y compris ceux empilés ou qui se chevauchent : dans une pile vue de côté ou en biais, compte les tranches une par une (chaque jeton montre un bord avec ses pastilles). Ne compte pas deux fois le même jeton. Ignore tout ce qui n'est pas un jeton.\n"
+"Réponds UNIQUEMENT par un objet JSON, sans texte autour : {\"green\":n,\"blue\":n,\"black\":n,\"purple\":n,\"brown\":n,\"red\":n,\"certitude\":\"haute|moyenne|basse\",\"remarque\":\"une phrase courte sur les jetons difficiles à compter\"}";
function aiGet(k){try{return localStorage.getItem(k)||'';}catch(_){return '';}}
function aiSet(k,v){try{localStorage.setItem(k,v);}catch(_){}}
function toJpegBase64(canvas,maxSide){const sc=Math.min(1,maxSide/Math.max(canvas.width,canvas.height));const c=document.createElement('canvas');c.width=Math.round(canvas.width*sc);c.height=Math.round(canvas.height*sc);c.getContext('2d').drawImage(canvas,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.85).split(',')[1];}
function parseAI(text){const m=String(text).match(/\{[\s\S]*\}/);if(!m)throw Error('Réponse illisible');const o=JSON.parse(m[0]);const counts={};KEYS.forEach(k=>{const n=Math.round(Number(o[k]));counts[k]=Number.isFinite(n)&&n>=0&&n<=999?n:0;});return {counts,certitude:o.certitude||'',remarque:o.remarque||''};}
async function callAI(b64){
 const endpoint=aiGet('bptStackAIEndpoint').trim(),key=aiGet('bptStackAIKey').trim();
 const body={model:AI_MODEL,max_tokens:400,messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:'image/jpeg',data:b64}},{type:'text',text:AI_PROMPT}]}]};
 const headers={'content-type':'application/json'};let url='https://api.anthropic.com/v1/messages';
 if(endpoint){url=endpoint;}else{if(!key)throw Error('NOKEY');headers['x-api-key']=key;headers['anthropic-version']='2023-06-01';headers['anthropic-dangerous-direct-browser-access']='true';}
 const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),45000);
 try{const r=await fetch(url,{method:'POST',headers,body:JSON.stringify(body),signal:ctl.signal});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw Error((j.error&&j.error.message)||('Erreur '+r.status));
  const txt=(j.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('');return parseAI(txt);}
 finally{clearTimeout(to);}}
function applyCounts(counts){
 document.querySelectorAll('#bptStackLines .bpt-stack-line').forEach(line=>{const key=KEYS[ROW_VALUE_ORDER.indexOf(Number(line.dataset.value))];line.querySelector('input').value=key?counts[key]:0;});
 $('bptStackLines').dispatchEvent(new Event('input',{bubbles:true}));}
function buildAI(){
 const auto=$('bptStackAuto');if(!auto||$('bptStackAI'))return;
 const b=document.createElement('button');b.type='button';b.id='bptStackAI';b.className='bpt-stack-auto';b.textContent='Analyser par IA (jetons à plat, piles, éventail)';
 const det=document.createElement('details');det.className='bpt-stack-tip';det.innerHTML='<summary>Réglages IA</summary><p>La photo est envoyée à l’API Anthropic uniquement quand tu appuies sur le bouton. Clé API (stockée seulement sur cet appareil) :</p><input id="bptStackAIKey" type="password" autocomplete="off" placeholder="sk-ant-…" style="width:100%;box-sizing:border-box;padding:8px;border-radius:6px"/><p>Ou adresse de ton serveur/proxy (remplace la clé) :</p><input id="bptStackAIEndpoint" type="url" placeholder="https://…" style="width:100%;box-sizing:border-box;padding:8px;border-radius:6px"/>';
 auto.parentNode.insertBefore(b,auto);auto.parentNode.insertBefore(det,auto);
 const k=$('bptStackAIKey'),e=$('bptStackAIEndpoint');k.value=aiGet('bptStackAIKey');e.value=aiGet('bptStackAIEndpoint');
 k.addEventListener('change',()=>aiSet('bptStackAIKey',k.value.trim()));e.addEventListener('change',()=>aiSet('bptStackAIEndpoint',e.value.trim()));
 b.addEventListener('click',async()=>{
  if(!bmp){status('Choisis d’abord une photo.');return;}
  aiSet('bptStackAIKey',k.value.trim());aiSet('bptStackAIEndpoint',e.value.trim());
  b.disabled=true;status('Analyse par IA en cours (quelques secondes)…');
  try{const res=await callAI(toJpegBase64(bmp,1568));applyCounts(res.counts);
   const names={green:'vert',blue:'bleu',black:'noir',purple:'violet',brown:'marron',red:'rouge'};
   $('bptStackBands').textContent='IA : '+KEYS.filter(x=>res.counts[x]).map(x=>res.counts[x]+' '+names[x]).join(' · ')+(res.certitude?' — certitude '+res.certitude:'')+(res.remarque?'. '+res.remarque:'');
   const badge=$('bptStackAutoBadge');if(badge){badge.hidden=false;badge.textContent='ESTIMATION PAR IA : vérifie les quantités, surtout si la certitude n’est pas haute.';}
   status('Analyse terminée : le tableau est rempli. Corrige avec +/− si besoin.');}
  catch(err){if(err.message==='NOKEY'){det.open=true;status('Saisis ta clé API dans « Réglages IA » (ou l’adresse de ton serveur), puis relance.');}
   else status('Analyse IA impossible : '+(err.name==='AbortError'?'délai dépassé':err.message));}
  finally{b.disabled=false;}});
}
root.BPTStackAI={parseAI,AI_PROMPT};

/* ---------------- Interface ---------------- */
const $=id=>document.getElementById(id);
let sel=null,view=null,bmp=null,lastResult=null,lastBox=null;
function status(t){const el=$('bptStackAutoStatus');if(el)el.textContent=t;}
function fmt(n){return n.toLocaleString('fr-FR');}

function buildUI(){
 const wrap=$('bptStackPhotoWrap');if(!wrap||$('bptStackSel'))return;
 const box=document.createElement('div');box.id='bptStackSel';box.hidden=true;
 box.innerHTML='<p class="bpt-stack-tip" id="bptStackSelHelp">1) Fais glisser un cadre autour de la pile, de la première à la dernière tranche, <strong>sans le tapis ni la face du dessus</strong>. La largeur du cadre doit coller à la largeur de la pile.</p>'
  +'<canvas id="bptStackSelCv" style="display:block;width:100%;height:auto;touch-action:none;border:2px solid #27b0c4;border-radius:8px;background:#000"></canvas>'
  +'<label class="bpt-stack-tip" style="display:flex;align-items:center;gap:8px;margin-top:8px"><input type="checkbox" id="bptStackHoriz"/> Pile couchée (horizontale)</label>'
  +'<div class="bpt-stack-zoom" style="position:static;margin-top:4px"><label for="bptStackThick">Épaisseur d’un jeton</label><input id="bptStackThick" type="range" min="70" max="140" step="1" value="100"/><span id="bptStackThickVal">auto</span></div>'
  +'<p class="bpt-stack-tip" id="bptStackBands"></p>';
 wrap.parentNode.insertBefore(box,wrap);
 sel=$('bptStackSelCv');
 let drag=null;
 const pos=e=>{const r=sel.getBoundingClientRect();return {x:Math.max(0,Math.min(sel.width,(e.clientX-r.left)*sel.width/r.width)),y:Math.max(0,Math.min(sel.height,(e.clientY-r.top)*sel.height/r.height))};};
 sel.addEventListener('pointerdown',e=>{e.preventDefault();sel.setPointerCapture(e.pointerId);const p=pos(e);drag={x0:p.x,y0:p.y};lastBox={x0:p.x,y0:p.y,x1:p.x,y1:p.y};redraw();});
 sel.addEventListener('pointermove',e=>{if(!drag)return;const p=pos(e);lastBox={x0:drag.x0,y0:drag.y0,x1:p.x,y1:p.y};redraw();});
 const end=()=>{if(!drag)return;drag=null;run();};
 sel.addEventListener('pointerup',end);sel.addEventListener('pointercancel',()=>{drag=null;});
 $('bptStackHoriz').addEventListener('change',run);
 $('bptStackThick').addEventListener('input',()=>{$('bptStackThickVal').textContent=$('bptStackThick').value+' %';run();});
}

async function loadImage(file){
 let src;
 if(window.createImageBitmap){try{src=await createImageBitmap(file,{imageOrientation:'from-image'});}catch(_){}}
 if(!src){const url=URL.createObjectURL(file);try{src=await new Promise((ok,fail)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=fail;im.src=url;});}finally{URL.revokeObjectURL(url);}}
 const W=src.naturalWidth||src.width,H=src.naturalHeight||src.height,s=Math.min(1,3000/Math.max(W,H));
 const c=document.createElement('canvas');c.width=Math.round(W*s);c.height=Math.round(H*s);c.getContext('2d').drawImage(src,0,0,c.width,c.height);if(src.close)src.close();return c;}

function redraw(){
 if(!sel||!view)return;const ctx=sel.getContext('2d');ctx.drawImage(view,0,0,sel.width,sel.height);
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
 btn.addEventListener('click',()=>{if(!bmp){status('Choisis d’abord une photo.');return;}
  if(!lastBox){const W=sel.width,H=sel.height;lastBox={x0:W*.35,y0:H*.1,x1:W*.65,y1:H*.9};}run();});
 file.addEventListener('change',async()=>{const f=file.files&&file.files[0];if(!f||!f.type.startsWith('image/'))return;
  try{bmp=await loadImage(f);}catch(e){status('Photo illisible.');return;}
  const W=bmp.width,H=bmp.height;
  const scale=Math.min(1,1000/Math.max(W,H));sel.width=Math.round(W*scale);sel.height=Math.round(H*scale);
  view=document.createElement('canvas');view.width=sel.width;view.height=sel.height;view.getContext('2d').drawImage(bmp,0,0,sel.width,sel.height);
  lastBox=null;lastResult=null;$('bptStackThick').value=100;$('bptStackThickVal').textContent='auto';$('bptStackBands').textContent='';
  $('bptStackSel').hidden=false;$('bptStackPhotoWrap').hidden=true;redraw();
  status('Photo chargée. Dessine un cadre autour de la pile (de côté).');});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(typeof window!=='undefined'?window:globalThis);
