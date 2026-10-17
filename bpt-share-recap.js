/* BPT 10.4.26 — Partage du bilan de partie (WhatsApp ou toute autre appli).
   Ajoute en tête de la fenêtre « Bilan de la soirée » :
   - téléphone : « Partager sur WhatsApp » → menu de partage natif (image + texte) ;
   - PC : copier le texte, télécharger l'image, ouvrir WhatsApp avec le texte prérempli.
   Aucune donnée n'est envoyée par l'appli elle-même : c'est l'utilisateur qui choisit
   le groupe dans son menu de partage. */
(function(){
  'use strict';
  const SITE_URL='https://fracalemou.github.io/bpt/';
  const g=name=>typeof window[name]==='function'?window[name]:null;

  function nick(name){
    try{return g('playerNicknameInfo')?.(name)?.primary||'';}catch(_e){return '';}
  }
  function euroTxt(v){
    try{return g('euro')?g('euro')(v):`${Number(v||0)} €`;}catch(_e){return `${Number(v||0)} €`;}
  }
  function dateTxt(v){
    try{return g('shortDate')?g('shortDate')(v):String(v||'');}catch(_e){return String(v||'');}
  }
  function durationTxt(rows){
    try{
      const sec=g('bptGameTiming')?.(rows)?.durationSec;
      return sec&&g('formatGameDuration')?g('formatGameDuration')(sec):'';
    }catch(_e){return '';}
  }

  // Données du bilan, à partir des lignes d'historique de la partie.
  function recapData(rows){
    const sorted=rows.slice().sort((a,b)=>Number(a.place)-Number(b.place));
    const first=sorted[0]||{};
    const recap=rows.find(r=>r.endGameRecap)?.endGameRecap||null;
    const kills=Math.max(0,...rows.map(r=>Number(r.kills)||0));
    const hunters=rows.filter(r=>kills>0&&Number(r.kills)===kills).map(r=>r.player);
    let bounty='';
    if(recap){
      if(recap.bountyMode==='individual'){
        const done=(recap.missions||[]).map(m=>m.name).filter(Boolean);
        bounty=done.length?`Bountys individuels réussis : ${done.join(', ')}`:'Aucun bounty individuel réussi';
      }else if(recap.bountyName){
        bounty=recap.bountySurvived
          ?`${recap.bountyName} était la cible secrète… et a gagné !`
          :`${recap.bountyHunter} remporte le bounty en éliminant ${recap.bountyName}`;
      }
    }
    const highlights=[...new Set((recap?.highlights||[]).map(h=>`${h.icon||'🏅'} ${h.text||h.title||''}`.trim()).filter(Boolean))];
    return {
      sorted,
      game:first.game,date:dateTxt(first.date),location:first.location||'',
      players:sorted.length,duration:durationTxt(sorted),
      hunters,kills,bounty,highlights
    };
  }

  // Photo de la partie (Cloudinary autorise la réutilisation, ou fichier local).
  async function loadGamePhoto(rows){
    try{
      const r=rows[0]||{};const get=g('getGamePhoto');if(!get)return null;
      let url='';
      for(let i=0;i<12&&!url;i++){ // la photo peut être en cours de chargement depuis Firebase
        url=String(get(r.game,r.season||null)||'');
        if(!url)await new Promise(res=>setTimeout(res,250));
      }
      if(!url)return null;
      const res=await fetch(url,{mode:'cors',cache:'force-cache'});
      if(!res.ok)return null;
      const blob=await res.blob();
      if(!String(blob.type||'image/jpeg').startsWith('image'))return null;
      const img=await new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=ko;i.src=URL.createObjectURL(blob);});
      return {img,blob};
    }catch(_e){return null;}
  }

  function recapText(d){
    const medals=['🥇','🥈','🥉'];
    const lines=[];
    lines.push(`🏆 BPT — Partie #${d.game} · ${d.date}${d.location?` · ${d.location}`:''}`);
    lines.push(`${d.players} joueurs${d.duration?` · ${d.duration}`:''}`);
    lines.push('');
    d.sorted.slice(0,3).forEach((r,i)=>{
      const n=nick(r.player);
      lines.push(`${medals[i]} ${r.player}${n?` (${n})`:''} — ${Number(r.points)||0} pts · ${euroTxt(r.gross)}`);
    });
    if(d.kills)lines.push(`🔥 Meilleur chasseur : ${d.hunters.join(', ')} — ${d.kills} élimination${d.kills>1?'s':''}`);
    if(d.bounty)lines.push(`🎯 ${d.bounty}`);
    if(d.highlights.length){
      lines.push('');
      lines.push('⭐ Faits marquants');
      d.highlights.slice(0,4).forEach(h=>lines.push(h));
    }
    lines.push('');
    lines.push(`Classement et détails : ${SITE_URL}`);
    return lines.join('\n');
  }

  // ---- Image du bilan (1080 × 1350, format portrait des réseaux) ----
  function wrapText(ctx,text,maxWidth){
    const words=String(text).split(/\s+/);const lines=[];let cur='';
    for(const w of words){
      const t=cur?cur+' '+w:w;
      if(ctx.measureText(t).width>maxWidth&&cur){lines.push(cur);cur=w;}else cur=t;
    }
    if(cur)lines.push(cur);
    return lines;
  }
  function fit(ctx,text,maxWidth,size,weight,minSize){
    let s=size;
    do{ctx.font=`${weight} ${s}px "Segoe UI",system-ui,-apple-system,Roboto,sans-serif`;if(ctx.measureText(text).width<=maxWidth)break;s-=2;}while(s>minSize);
    return s;
  }
  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
  }

  function drawRecap(d,photo){
    const PH=photo?470:0;
    const W=1080,H=1350+PH;
    const c=document.createElement('canvas');c.width=W;c.height=H;
    const ctx=c.getContext('2d');
    const font=(w,s)=>`${w} ${s}px "Segoe UI",system-ui,-apple-system,Roboto,sans-serif`;
    // fond
    const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0d1f1a');bg.addColorStop(.55,'#0b2a23');bg.addColorStop(1,'#101a2e');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(242,200,83,.06)';ctx.font=font(900,620);ctx.textAlign='center';ctx.fillText('♠',W/2,900+PH);
    if(photo){ // bandeau photo, recadré pour remplir (cover)
      const img=photo.img,bw=W,bh=PH+250;
      const sc=Math.max(bw/img.naturalWidth,bh/img.naturalHeight);
      const sw=bw/sc,sh=bh/sc,sx=(img.naturalWidth-sw)/2,sy=Math.max(0,(img.naturalHeight-sh)*0.35);
      ctx.drawImage(img,sx,sy,sw,sh,0,0,bw,bh);
      const fade=ctx.createLinearGradient(0,bh*0.45,0,bh);fade.addColorStop(0,'rgba(13,31,26,0)');fade.addColorStop(1,'rgba(13,31,26,1)');
      ctx.fillStyle=fade;ctx.fillRect(0,0,bw,bh);
      const top=ctx.createLinearGradient(0,0,0,240);top.addColorStop(0,'rgba(0,0,0,.55)');top.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=top;ctx.fillRect(0,0,bw,240);
    }
    const OFF=photo?PH-60:0;const LIMIT=H-OFF-90;
    ctx.save();ctx.translate(0,OFF);
    ctx.shadowColor='rgba(0,0,0,.65)';ctx.shadowBlur=photo?10:0;
    // en-tête
    ctx.textAlign='left';
    ctx.fillStyle='#f2c853';ctx.font=font(900,64);ctx.fillText('♠ BPT',64,112);
    ctx.fillStyle='#9fc0b5';ctx.font=font(700,30);ctx.fillText('BILAN DE LA SOIRÉE',64,160);
    ctx.textAlign='right';ctx.fillStyle='#f4f8f6';ctx.font=font(900,56);ctx.fillText(`Partie #${d.game}`,W-64,112);
    ctx.fillStyle='#9fc0b5';ctx.font=font(600,28);
    const meta=[d.date,d.location].filter(Boolean).join(' · ');
    ctx.fillText(meta,W-64,158);
    ctx.fillText(`${d.players} joueurs${d.duration?' · '+d.duration:''}`,W-64,196);
    ctx.textAlign='left';
    ctx.fillStyle='rgba(242,200,83,.5)';ctx.fillRect(64,226,W-128,3);

    // podium
    const podium=d.sorted.slice(0,3);
    const order=[1,0,2]; // 2e, 1er, 3e
    const colW=300,gap=24,x0=(W-(3*colW+2*gap))/2,baseY=700;
    const heights=[340,300,280];
    const colors=[['#f2c853','#5c4a12'],['#cfd6e4','#3a4252'],['#d58a52','#4a2c18']];
    const medals=['🥇','🥈','🥉'];
    order.forEach((idx,pos)=>{
      const r=podium[idx];if(!r)return;
      const x=x0+pos*(colW+gap),h=heights[idx],y=baseY-h;
      const gr=ctx.createLinearGradient(0,y,0,baseY);gr.addColorStop(0,colors[idx][1]);gr.addColorStop(1,'rgba(0,0,0,.25)');
      ctx.fillStyle=gr;roundRect(ctx,x,y,colW,h,22);ctx.fill();
      ctx.strokeStyle=colors[idx][0];ctx.lineWidth=3;roundRect(ctx,x,y,colW,h,22);ctx.stroke();
      ctx.textAlign='center';
      ctx.font=font(400,idx===0?96:80);ctx.fillText(medals[idx],x+colW/2,y-24);
      const parts=String(r.player).split(' ');
      const first=parts.shift(),last=parts.join(' ');
      ctx.fillStyle='#ffffff';
      fit(ctx,first,colW-30,idx===0?44:38,900,22);ctx.fillText(first,x+colW/2,y+64);
      if(last){fit(ctx,last,colW-30,idx===0?40:34,900,20);ctx.fillText(last,x+colW/2,y+108);}
      const n=nick(r.player);
      if(n){ctx.fillStyle='#bcd3cc';fit(ctx,`(${n})`,colW-30,26,600,16);ctx.fillText(`(${n})`,x+colW/2,y+(last?146:106));}
      ctx.fillStyle=colors[idx][0];ctx.font=font(900,idx===0?46:38);
      ctx.fillText(`${Number(r.points)||0} pts`,x+colW/2,baseY-(idx===0?66:52));
      ctx.fillStyle='#f4f8f6';ctx.font=font(700,28);ctx.fillText(euroTxt(r.gross),x+colW/2,baseY-22);
      ctx.textAlign='left';
    });

    // faits de la soirée
    let y=770;
    const line=(icon,text,color)=>{
      ctx.font=font(700,32);const lines=wrapText(ctx,text,W-200).slice(0,2);
      ctx.fillStyle=color||'#f4f8f6';ctx.font=font(400,36);ctx.fillText(icon,64,y);
      ctx.font=font(700,32);ctx.fillStyle=color||'#f4f8f6';
      lines.forEach((l,i)=>ctx.fillText(l,120,y+i*42));
      y+=lines.length*42+22;
    };
    if(d.kills)line('🔥',`Meilleur chasseur : ${d.hunters.join(', ')} — ${d.kills} élimination${d.kills>1?'s':''}`,'#ffd9a8');
    if(d.bounty)line('🎯',d.bounty,'#bff0d6');
    d.highlights.slice(0,3).forEach(h=>{
      const m=h.match(/^(\S+)\s+(.*)$/);line(m?m[1]:'⭐',m?m[2]:h,'#e8e2ff');
    });

    // reste du classement
    const rest=d.sorted.slice(3);
    if(rest.length&&y<LIMIT-60){
      ctx.fillStyle='rgba(159,192,181,.35)';ctx.fillRect(64,y-6,W-128,2);y+=36;
      ctx.font=font(600,27);
      const colWidth=(W-128)/2;const perCol=Math.ceil(rest.length/2);
      rest.forEach((r,i)=>{
        const col=i<perCol?0:1,row=col?i-perCol:i;
        const yy=y+row*38;if(yy>LIMIT)return;
        ctx.fillStyle='#9fc0b5';ctx.fillText(`${r.place}.`,64+col*colWidth,yy);
        ctx.fillStyle='#e7efec';
        const label=`${r.player} · ${Number(r.points)||0} pts`;
        fit(ctx,label,colWidth-70,27,600,18);ctx.fillText(label,110+col*colWidth,yy);
      });
    }
    ctx.restore();
    // pied
    ctx.textAlign='center';ctx.fillStyle='#6f8f86';ctx.font=font(600,24);
    ctx.fillText(SITE_URL.replace('https://',''),W/2,H-40);
    return c;
  }

  function canvasBlob(c){return new Promise(res=>c.toBlob(b=>res(b),'image/png'));}

  function toast(msg){
    try{if(typeof window.showBptToast==='function'){window.showBptToast(msg,'ok');return;}}catch(_e){}
    const t=document.createElement('div');t.textContent=msg;
    t.style.cssText='position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:2147483000;background:#163d33;color:#fff;padding:10px 16px;border-radius:12px;font:700 14px system-ui;box-shadow:0 8px 24px rgba(0,0,0,.4)';
    document.body.appendChild(t);setTimeout(()=>t.remove(),2600);
  }

  async function copyText(text){
    try{await navigator.clipboard.writeText(text);return true;}catch(_e){}
    try{const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok;}catch(_e){return false;}
  }
  function downloadBlob(blob,name){
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);
  }

  async function share(rows){
    const d=recapData(rows);const text=recapText(d);
    const photo=await loadGamePhoto(rows);
    const blob=await canvasBlob(drawRecap(d,photo));
    const name=`BPT-partie-${d.game||'bilan'}.png`;
    const file=blob?new File([blob],name,{type:'image/png'}):null;
    const files=[file].filter(Boolean);
    if(photo?.blob)files.push(new File([photo.blob],`BPT-partie-${d.game||'photo'}-photo.jpg`,{type:photo.blob.type||'image/jpeg'}));
    try{
      if(files.length>1&&navigator.canShare&&navigator.canShare({files})){
        await navigator.share({files,text,title:`BPT — Partie #${d.game}`});return;
      }
      if(file&&navigator.canShare&&navigator.canShare({files:[file]})){
        await navigator.share({files:[file],text,title:`BPT — Partie #${d.game}`});return;
      }
      if(navigator.share){await navigator.share({text,title:`BPT — Partie #${d.game}`});return;}
    }catch(e){if(e&&e.name==='AbortError')return;}
    // Repli (PC) : texte copié + WhatsApp ouvert avec le texte prérempli.
    await copyText(text);
    window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank','noopener');
    toast('Texte du bilan copié · WhatsApp ouvert');
  }

  function addShareBar(rows){
    const content=document.getElementById('gameSummaryContent');
    if(!content||!Array.isArray(rows)||!rows.length)return;
    content.querySelector('.bpt-share-bar')?.remove();
    const bar=document.createElement('div');bar.className='bpt-share-bar';
    const main=document.createElement('button');main.type='button';main.className='btn bpt-share-main';
    main.textContent='📤 Partager le bilan sur WhatsApp';
    main.addEventListener('click',async()=>{main.disabled=true;try{await share(rows);}finally{main.disabled=false;}});
    bar.append(main);
    const isPhone=document.documentElement.classList.contains('bpt-mobile-device');
    if(!isPhone){
      const copy=document.createElement('button');copy.type='button';copy.className='btn ghost';copy.textContent='📋 Copier le texte';
      copy.addEventListener('click',async()=>{const ok=await copyText(recapText(recapData(rows)));toast(ok?'Texte du bilan copié':'Copie impossible');});
      const dl=document.createElement('button');dl.type='button';dl.className='btn ghost';dl.textContent='🖼 Télécharger l’image';
      dl.addEventListener('click',async()=>{const d=recapData(rows);const p=await loadGamePhoto(rows);const b=await canvasBlob(drawRecap(d,p));if(b)downloadBlob(b,`BPT-partie-${d.game||'bilan'}.png`);});
      bar.append(copy,dl);
    }
    content.prepend(bar);
  }

  function install(){
    const original=window.showEndGameSummary;
    if(typeof original!=='function'||original.__bptShare)return false;
    const wrapped=function(rows){const r=original.apply(this,arguments);try{addShareBar(rows);}catch(e){console.warn('BPT partage',e);}return r;};
    wrapped.__bptShare=true;
    window.showEndGameSummary=wrapped;
    return true;
  }
  if(!install())document.addEventListener('DOMContentLoaded',install);

  // Accès pour les tests.
  window.BPTShareRecap={recapData,recapText,drawRecap,loadGamePhoto,share};
})();
