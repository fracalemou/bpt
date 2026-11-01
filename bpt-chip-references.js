/* Références de jetons : variantes photographiques persistantes, par jeu et valeur. */
(function(){'use strict';
const VALUES=[25,50,100,500,1000,5000,10000], MAX_VARIANTS=4;
const path=game=>'bpt/chip_reference_photos/'+game;
const $=id=>document.getElementById(id);
let game='moonriver', refs={}, listener=null, db=null, busy=false;
function setStatus(s){if($('bptRefStatus'))$('bptRefStatus').textContent=s;}
function safeRecords(snapshot){const o=snapshot&&typeof snapshot==='object'?snapshot:{};const ret={};for(const value of VALUES){const variants=o[String(value)]||{};ret[value]=Object.entries(variants).filter(([id,obj])=>/^[a-z0-9_-]{1,40}$/i.test(id)&&obj&&typeof obj.data==='string'&&/^data:image\/jpeg;base64,/.test(obj.data)).map(([id,obj])=>({id,...obj}));}return ret;}
async function connect(){await window.bptFirebaseEnsure();db=window.bptFirebaseDb();if(!db)throw Error('Firebase indisponible');return db;}
async function follow(){game=$('bptRefGame')?.value==='palace'?'palace':'moonriver';if(listener&&db){db.ref(listener.path).off('value',listener.cb)}try{await connect();const p=path(game);const cb=s=>{refs=safeRecords(s.val());draw();setStatus('Photos synchronisées pour '+(game==='moonriver'?'Moon River':'Chips Palace')+'.');};listener={path:p,cb};db.ref(p).on('value',cb,err=>setStatus('Lecture Firebase refusée : '+err.message));}catch(e){setStatus('Référentiel indisponible : '+e.message);}}
function draw(){const grid=$('bptRefGrid');if(!grid)return;grid.replaceChildren();for(const v of VALUES){const card=document.createElement('section');card.className='bpt-ref-card';const h=document.createElement('h3');h.textContent=v.toLocaleString('fr-FR')+' points';card.append(h);const wrap=document.createElement('div');wrap.className='bpt-ref-items';for(const r of refs[v]||[]){const slot=document.createElement('div');slot.className='bpt-ref-item';const img=document.createElement('img');img.src=r.data;img.alt='Référence '+v+' points';const del=document.createElement('button');del.type='button';del.textContent='Supprimer';del.addEventListener('click',async()=>{if(!confirm('Supprimer cette variante du '+v+' ?'))return;try{await (await connect()).ref(path(game)+'/'+v+'/'+r.id).remove();clearSheet()}catch(e){setStatus('Suppression refusée : '+e.message)}});slot.append(img,del);wrap.append(slot)}card.append(wrap);const input=document.createElement('input');input.type='file';input.accept='image/*';input.setAttribute('capture','environment');input.hidden=true;const add=document.createElement('button');add.className='bpt-ref-add';add.type='button';add.textContent='Ajouter une variante ('+(refs[v]||[]).length+'/'+MAX_VARIANTS+')';add.disabled=(refs[v]||[]).length>=MAX_VARIANTS||busy;add.addEventListener('click',()=>input.click());input.addEventListener('change',()=>{const f=input.files?.[0];if(f)upload(v,f);input.value='';});card.append(add,input);grid.append(card)}}
async function jpeg(file){if(!file.type.startsWith('image/'))throw Error('Format image requis');if(file.size>12e6)throw Error('Photo trop volumineuse');const blobUrl=URL.createObjectURL(file);try{const img=new Image();img.src=blobUrl;await img.decode();const scale=Math.min(1,320/Math.max(img.naturalWidth,img.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);const data=canvas.toDataURL('image/jpeg',.72);if(data.length>90000)throw Error('Image compressée encore trop volumineuse');return data;}finally{URL.revokeObjectURL(blobUrl)}}
async function upload(v,file){if(busy)return;const selected=game;busy=true;draw();setStatus('Compression et enregistrement de la photo…');try{const data=await jpeg(file);const firebaseDb=await connect();const current=await firebaseDb.ref(path(selected)+'/'+v).once('value');if(current.numChildren()>=MAX_VARIANTS)throw Error('Maximum '+MAX_VARIANTS+' variantes par valeur');const id=firebaseDb.ref(path(selected)+'/'+v).push().key;await firebaseDb.ref(path(selected)+'/'+v+'/'+id).set({data,updatedAt:Date.now()});clearSheet();setStatus('Variante '+v+' points enregistrée.');}catch(e){setStatus('Enregistrement impossible : '+e.message)}finally{busy=false;draw()}}
async function getForScan(chipSet){try{const firebaseDb=await connect();const snap=await firebaseDb.ref(path(chipSet==='palace'?'palace':'moonriver')).once('value');const rows=safeRecords(snap.val());const data=[];for(const v of VALUES)for(const ref of rows[v].slice(0,MAX_VARIANTS))data.push({value:v,image:ref.data.slice('data:image/jpeg;base64,'.length)});return data;}catch(e){console.warn('[BPT refs] Photos non disponibles :',e.message);return []}}

// V10.4.150 — Planche de référence compacte : 1 vignette par valeur, étiquetée, en UNE seule image (~25 Ko)
// mise en cache 12 h sur l'appareil. Envoyée avec la photo pour lever les confusions 50 (bleu) / 10 000 (bleu clair).
const SHEET_TTL=12*3600e3;
function sheetKey(set){return 'bptRefSheet150:'+(set==='palace'?'palace':'moonriver');}
function clearSheet(){try{localStorage.removeItem(sheetKey('palace'));localStorage.removeItem(sheetKey('moonriver'));}catch(_){}}
function loadImg(src){return new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=ko;i.src=src;});}
async function getSheet(chipSet){
  const set=chipSet==='palace'?'palace':'moonriver';
  try{const c=JSON.parse(localStorage.getItem(sheetKey(set))||'null');if(c&&Date.now()-c.t<SHEET_TTL&&typeof c.img==='string')return c.img||null;}catch(_){}
  try{
    const firebaseDb=await connect();
    const snap=await firebaseDb.ref(path(set)).once('value');const rows=safeRecords(snap.val());
    const tiles=VALUES.filter(v=>rows[v].length).map(v=>({v,ref:rows[v].slice().sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0))[0]}));
    if(!tiles.length){try{localStorage.setItem(sheetKey(set),JSON.stringify({t:Date.now(),img:''}));}catch(_){}return null;}
    const T=150,cols=Math.min(4,tiles.length),rowsN=Math.ceil(tiles.length/cols),H=T+22;
    const cv=document.createElement('canvas');cv.width=cols*T;cv.height=rowsN*H;
    const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,cv.width,cv.height);
    for(let i=0;i<tiles.length;i++){
      const x=(i%cols)*T,y=Math.floor(i/cols)*H,im=await loadImg(tiles[i].ref.data);
      const k=Math.max(T/im.width,T/im.height),w=im.width*k,h=im.height*k;
      g.save();g.beginPath();g.rect(x,y+22,T,T);g.clip();g.drawImage(im,x+(T-w)/2,y+22+(T-h)/2,w,h);g.restore();
      g.fillStyle='#000';g.font='bold 17px sans-serif';g.textBaseline='top';g.fillText(String(tiles[i].v),x+6,y+2);
      g.strokeStyle='#000';g.lineWidth=2;g.strokeRect(x+1,y+1,T-2,H-2);
    }
    const img=cv.toDataURL('image/jpeg',0.7).split(',')[1];
    try{localStorage.setItem(sheetKey(set),JSON.stringify({t:Date.now(),img}));}catch(_){}
    return img;
  }catch(e){console.warn('[BPT refs] Planche indisponible :',e.message);return null;}
}
window.BPTChipReferences={getForScan,getSheet,clearSheet};
function init(){if(!$('bptRefGrid'))return;$('bptRefGame').addEventListener('change',follow);draw();const panel=$('bptChipReferencesSettings');panel?.addEventListener('toggle',()=>{if(panel.open)follow();});follow()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();