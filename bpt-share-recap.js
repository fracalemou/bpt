/* BPT 10.4.26 — Partage du bilan de partie (WhatsApp ou toute autre appli).
   En tête de la fenêtre « Bilan de la soirée » :
   1. « Photo des vainqueurs » : prise de vue (téléphone) ou choix d'un fichier (PC) ;
   2. « Partager » : visuel du bilan (photo + classement complet avec éliminations)
      - téléphone : menu de partage natif (visuel + texte) ;
      - PC : visuel copié dans le presse-papiers (ou téléchargé) + WhatsApp ouvert → Ctrl + V dans le groupe.
   L'appli n'envoie rien elle-même : l'utilisateur choisit le groupe. */
(function(){
  'use strict';
  const SITE_URL='https://fracalemou.github.io/bpt/';
  const g=name=>typeof window[name]==='function'?window[name]:null;
  const FONT='"Segoe UI",system-ui,-apple-system,Roboto,sans-serif';
  let chosenPhoto=null; // {img, blob} choisie pour ce partage

  const nick=name=>{try{return g('playerNicknameInfo')?.(name)?.primary||'';}catch(_e){return '';}};
  const euroTxt=v=>{try{return g('euro')?g('euro')(v):`${Number(v||0)} €`;}catch(_e){return `${Number(v||0)} €`;}};
  const dateTxt=v=>{try{return g('shortDate')?g('shortDate')(v):String(v||'');}catch(_e){return String(v||'');}};
  const durationTxt=rows=>{try{const s=g('bptGameTiming')?.(rows)?.durationSec;return s&&g('formatGameDuration')?g('formatGameDuration')(s):'';}catch(_e){return '';}};
  const isPhone=()=>document.documentElement.classList.contains('bpt-mobile-device');

  // ---------- Données ----------
  function recapData(rows){
    const sorted=rows.slice().sort((a,b)=>Number(a.place)-Number(b.place));
    const first=sorted[0]||{};
    const recap=rows.find(r=>r.endGameRecap)?.endGameRecap||null;
    const kills=Math.max(0,...rows.map(r=>Number(r.kills)||0));
    const hunters=rows.filter(r=>kills>0&&Number(r.kills)===kills).map(r=>r.player);
    let bounty='';
    if(recap){
      if(recap.bountyMode==='individual'){
        const done=[...new Set((recap.missions||[]).map(m=>m.name).filter(Boolean))];
        bounty=done.length?`Bountys individuels réussis : ${done.join(', ')}`:'';
      }else if(recap.bountyName){
        bounty=recap.bountySurvived?`${recap.bountyName} était la cible secrète… et a gagné !`
          :`${recap.bountyHunter} remporte le bounty en éliminant ${recap.bountyName}`;
      }
    }
    const highlights=[...new Set((recap?.highlights||[]).map(h=>String(h.text||h.title||'').trim()).filter(Boolean))];
    return {sorted,game:first.game,date:dateTxt(first.date),location:first.location||'',
      players:sorted.length,duration:durationTxt(sorted),hunters,kills,bounty,highlights};
  }
  function fate(r){
    if(Number(r.place)===1)return 'Vainqueur';
    const lv=r.outLevel?` (niv. ${Number(r.outLevel)})`:'';
    return r.killer?`éliminé par ${r.killer}${lv}`:`éliminé${lv}`;
  }

  // Texte : caractères « simples » uniquement (les émojis sont abîmés par certains liens WhatsApp).
  function recapText(d){
    const L=[];
    L.push(`♠ BPT — Partie n°${d.game} · ${d.date}${d.location?` · ${d.location}`:''}`);
    L.push(`${d.players} joueurs${d.duration?` · ${d.duration}`:''}`);
    L.push('');
    L.push('CLASSEMENT');
    d.sorted.forEach(r=>{
      L.push(`${r.place}. ${r.player} — ${Number(r.points)||0} pt${Math.abs(Number(r.points)||0)>1?'s':''}${Number(r.kills)?` · ${r.kills} kill${r.kills>1?'s':''}`:''}${Number(r.gross)?` · ${euroTxt(r.gross)}`:''} — ${fate(r)}`);
    });
    L.push('');
    L.push(`Détails : ${SITE_URL}`);
    return L.join('\n');
  }

  // ---------- Photo ----------
  function imageFromBlob(blob){
    return new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=ko;i.src=URL.createObjectURL(blob);});
  }
  async function loadGamePhoto(rows){
    if(chosenPhoto)return chosenPhoto;
    try{
      const r=rows[0]||{};const get=g('getGamePhoto');if(!get)return null;
      let url='';
      for(let i=0;i<12&&!url;i++){url=String(get(r.game,r.season||null)||'');if(!url)await new Promise(res=>setTimeout(res,250));}
      if(!url)return null;
      const res=await fetch(url,{mode:'cors',cache:'force-cache'});if(!res.ok)return null;
      const blob=await res.blob();if(!String(blob.type||'image/jpeg').startsWith('image'))return null;
      return {img:await imageFromBlob(blob),blob};
    }catch(_e){return null;}
  }
  // Réduit une photo de téléphone (souvent 4000 px) pour un partage léger.
  async function shrinkPhoto(file){
    const img=await imageFromBlob(file);
    const max=1600,sc=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
    const c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*sc);c.height=Math.round(img.naturalHeight*sc);
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    const blob=await new Promise(res=>c.toBlob(b=>res(b),'image/jpeg',.88));
    return {img:await imageFromBlob(blob),blob};
  }

  // ---------- Visuel ----------
  function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  function setFont(ctx,w,s){ctx.font=`${w} ${s}px ${FONT}`;}
  function fitText(ctx,text,maxW,size,weight,min){let s=size;do{setFont(ctx,weight,s);if(ctx.measureText(text).width<=maxW)break;s-=1;}while(s>min);return s;}
  function ellipsis(ctx,text,maxW){if(ctx.measureText(text).width<=maxW)return text;let t=text;while(t.length>1&&ctx.measureText(t+'…').width>maxW)t=t.slice(0,-1);return t+'…';}
  function wrap(ctx,text,maxW){const out=[];let cur='';for(const w of String(text).split(/\s+/)){const t=cur?cur+' '+w:w;if(ctx.measureText(t).width>maxW&&cur){out.push(cur);cur=w;}else cur=t;}if(cur)out.push(cur);return out;}

  function drawRecap(d,photo){
    const W=1080,M=56;
    const c=document.createElement('canvas');c.width=W;c.height=3600;
    const ctx=c.getContext('2d');ctx.textBaseline='alphabetic';
    // fond
    const bg=ctx.createLinearGradient(0,0,0,c.height);bg.addColorStop(0,'#0c1d18');bg.addColorStop(.5,'#0b2620');bg.addColorStop(1,'#0e1728');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,c.height);
    let y=0;
    // photo
    if(photo){
      const PH=660,img=photo.img;
      const sc=Math.max(W/img.naturalWidth,PH/img.naturalHeight),sw=W/sc,sh=PH/sc;
      const sx=(img.naturalWidth-sw)/2,sy=Math.max(0,(img.naturalHeight-sh)*.4);
      ctx.drawImage(img,sx,sy,sw,sh,0,0,W,PH);
      const fade=ctx.createLinearGradient(0,PH*.55,0,PH);fade.addColorStop(0,'rgba(12,29,24,0)');fade.addColorStop(1,'rgba(12,29,24,1)');
      ctx.fillStyle=fade;ctx.fillRect(0,0,W,PH);
      y=PH-150;
    }else y=70;
    // titre
    ctx.shadowColor='rgba(0,0,0,.7)';ctx.shadowBlur=photo?14:0;
    ctx.fillStyle='#f2c853';setFont(ctx,900,40);ctx.fillText('♠ BPT · BILAN DE LA SOIRÉE',M,y);
    y+=74;ctx.fillStyle='#ffffff';setFont(ctx,900,72);ctx.fillText(`Partie n°${d.game}`,M,y);
    y+=48;ctx.fillStyle='#b9d3cb';setFont(ctx,600,30);
    ctx.fillText([d.date,d.location,`${d.players} joueurs`,d.duration].filter(Boolean).join('  ·  '),M,y);
    ctx.shadowBlur=0;
    y+=44;
    // classement complet de la partie (comme le tableau du bilan)
    y+=26;
    ctx.fillStyle='#f2c853';setFont(ctx,900,30);ctx.fillText('CLASSEMENT DE LA PARTIE',M,y);
    y+=20;
    const cols=[ // [titre, x, alignement]
      ['Pl.',M+12,'left'],['Joueur',M+70,'left'],['Pts',M+408,'right'],['Kills',M+490,'right'],
      ['Éliminé par',M+520,'left'],['Niv.',M+858,'right'],['Gain',W-M-12,'right']];
    const rowH=60,headH=44;
    ctx.fillStyle='rgba(242,200,83,.14)';roundRect(ctx,M,y,W-2*M,headH,10);ctx.fill();
    setFont(ctx,800,21);ctx.fillStyle='#f2c853';
    cols.forEach(([t,x,al])=>{ctx.textAlign=al;ctx.fillText(t.toUpperCase(),x,y+29);});
    ctx.textAlign='left';
    y+=headH+4;
    d.sorted.forEach((r,i)=>{
      const top=y+i*rowH,mid=top+rowH/2+10;
      if(i%2===1){ctx.fillStyle='rgba(255,255,255,.045)';roundRect(ctx,M,top,W-2*M,rowH,10);ctx.fill();}
      const col=i===0?'#f2c853':i===1?'#d4dbe8':i===2?'#e09a62':'#e7efec';
      const cell=(txt,k,font,color)=>{const [,x,al]=cols[k];ctx.textAlign=al;setFont(ctx,font[0],font[1]);ctx.fillStyle=color;ctx.fillText(txt,x,mid);};
      cell(String(r.place),0,[900,28],col);
      setFont(ctx,800,26);cell(ellipsis(ctx,r.player,cols[2][1]-cols[1][1]-70),1,[800,26],i<3?col:'#ffffff');
      cell(String(Number(r.points)||0),2,[800,26],'#ffffff');
      cell(Number(r.kills)?String(r.kills):'–',3,[700,24],'#ffd9a8');
      const killer=Number(r.place)===1?'Vainqueur':(r.killer||'–');
      setFont(ctx,600,23);cell(ellipsis(ctx,killer,cols[5][1]-cols[4][1]-60),4,[600,23],Number(r.place)===1?'#f2c853':'#b9d3cb');
      cell(r.outLevel?String(Number(r.outLevel)):'–',5,[600,23],'#9fb8b0');
      cell(Number(r.gross)?euroTxt(r.gross):'–',6,[700,23],Number(r.gross)?'#bff0d6':'#6f8f86');
      ctx.textAlign='left';
    });
    y+=d.sorted.length*rowH+30;
    y+=30;
    ctx.textAlign='center';ctx.fillStyle='#6f8f86';setFont(ctx,600,24);ctx.fillText(SITE_URL.replace('https://',''),W/2,y);
    y+=40;
    // recadrage à la hauteur utile
    const out=document.createElement('canvas');out.width=W;out.height=Math.min(c.height,Math.ceil(y));
    out.getContext('2d').drawImage(c,0,0);
    return out;
  }

  // ---------- Envoi ----------
  const canvasBlob=c=>new Promise(res=>c.toBlob(b=>res(b),'image/png'));
  function toast(msg){
    const t=document.createElement('div');t.textContent=msg;
    t.style.cssText='position:fixed;left:50%;bottom:96px;transform:translateX(-50%);z-index:2147483000;max-width:min(92vw,560px);text-align:center;background:#163d33;color:#fff;padding:12px 18px;border-radius:14px;font:700 15px system-ui;box-shadow:0 8px 24px rgba(0,0,0,.45)';
    document.body.appendChild(t);setTimeout(()=>t.remove(),5200);
  }
  async function copyText(text){
    try{await navigator.clipboard.writeText(text);return true;}catch(_e){}
    try{const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok;}catch(_e){return false;}
  }
  async function copyImage(blob){
    try{if(window.ClipboardItem&&navigator.clipboard?.write){await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);return true;}}catch(_e){}
    return false;
  }
  function downloadBlob(blob,name){
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);
  }
  async function buildImage(rows){
    const d=recapData(rows);const photo=await loadGamePhoto(rows);
    return {d,blob:await canvasBlob(drawRecap(d,photo)),name:`BPT-partie-${d.game||'bilan'}.png`};
  }

  // Menu de partage natif (téléphone, et PC Windows avec l'application WhatsApp installée) :
  // il ne reste qu'à choisir WhatsApp puis le groupe. Sinon : visuel copié + WhatsApp Web.
  async function shareNative(rows){
    const {d,blob,name}=await buildImage(rows);const text=recapText(d);
    const file=new File([blob],name,{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      try{
        // Sur PC, WhatsApp n'accepte qu'un seul contenu : on envoie l'image seule.
        await navigator.share(isPhone()?{files:[file],text}:{files:[file]});
        return;
      }catch(e){if(e&&e.name==='AbortError')return;}
    }
    if(isPhone()&&navigator.share){try{await navigator.share({text});return;}catch(e){if(e&&e.name==='AbortError')return;}}
    if(isPhone()){
      // Secours téléphone (adresse non sécurisée, vieux navigateur) : l'application WhatsApp
      // s'ouvre avec le classement en texte, il ne reste qu'à choisir le groupe.
      location.href='https://wa.me/?text='+encodeURIComponent(text);
      return;
    }
    await sharePC(rows,{blob,d});
  }
  async function sharePC(rows,pre){
    const {d,blob,name}=pre?{...pre,name:`BPT-partie-${pre.d.game||'bilan'}.png`}:await buildImage(rows);
    const copied=await copyImage(blob);
    if(!copied)downloadBlob(blob,name);
    window.open('https://web.whatsapp.com/','_blank','noopener');
    toast(copied
      ?'Visuel du bilan copié. Dans WhatsApp, ouvrez le groupe BPT puis faites Ctrl + V et Envoyer.'
      :'Visuel téléchargé. Dans WhatsApp, ouvrez le groupe BPT et joignez l’image téléchargée.');
  }

  // ---------- Barre de partage ----------
  function addShareBar(rows){
    const content=document.getElementById('gameSummaryContent');
    if(!content||!Array.isArray(rows)||!rows.length)return;
    chosenPhoto=null;
    content.querySelector('.bpt-share-bar')?.remove();
    const bar=document.createElement('div');bar.className='bpt-share-bar';
    bar.innerHTML='<div class="bpt-share-title">Partager le bilan avec le groupe</div>';
    const steps=document.createElement('div');steps.className='bpt-share-steps';

    const input=document.createElement('input');input.type='file';input.accept='image/*';input.hidden=true;
    if(isPhone())input.setAttribute('capture','environment');
    const photoBtn=document.createElement('button');photoBtn.type='button';photoBtn.className='btn ghost bpt-share-photo';
    photoBtn.textContent='📷 Photo des vainqueurs';
    const thumb=document.createElement('img');thumb.className='bpt-share-thumb';thumb.hidden=true;thumb.alt='Photo des vainqueurs';
    photoBtn.addEventListener('click',()=>input.click());
    input.addEventListener('change',async()=>{
      const f=input.files&&input.files[0];if(!f)return;
      photoBtn.disabled=true;photoBtn.textContent='Préparation de la photo…';
      try{chosenPhoto=await shrinkPhoto(f);thumb.src=URL.createObjectURL(chosenPhoto.blob);thumb.hidden=false;photoBtn.textContent='📷 Changer la photo';}
      catch(_e){toast('Photo illisible, essayez-en une autre.');photoBtn.textContent='📷 Photo des vainqueurs';}
      finally{photoBtn.disabled=false;input.value='';}
    });

    const main=document.createElement('button');main.type='button';main.className='btn bpt-share-main';
    main.textContent='📤 Envoyer sur WhatsApp';
    main.addEventListener('click',async()=>{main.disabled=true;try{await shareNative(rows);}finally{main.disabled=false;}});

    steps.append(input,photoBtn,thumb,main);
    bar.append(steps);
    content.prepend(bar);
  }

  function install(){
    const original=window.showEndGameSummary;
    if(typeof original!=='function'||original.__bptShare)return false;
    const wrapped=function(rows){const r=original.apply(this,arguments);try{addShareBar(rows);}catch(e){console.warn('BPT partage',e);}return r;};
    wrapped.__bptShare=true;window.showEndGameSummary=wrapped;return true;
  }
  if(!install())document.addEventListener('DOMContentLoaded',install);

  window.BPTShareRecap={recapData,recapText,drawRecap,loadGamePhoto,buildImage,shareNative};
})();
