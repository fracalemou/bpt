/* BPT 10.4.73 — Jouer en ligne · lot 1 : salon des tables et places autour de la table.
   Mode confiance (pas de serveur) : tout passe par Firebase, les écritures concurrentes par transaction.
   Données : bpt/online/tables/{id} = {id,name,host,createdAt,status,countsForChampionship,maxSeats,
   startStack,targetHours,levelSeconds,levels[],levelIndex,seats{index:{name,stack,joinedAt}}}. */
(function(){
  const ROOT="bpt/online/tables";
  const IDENTITY_KEY="bpt_live3_identity_name";
  const MAX_AGE_MS=24*3600*1000;
  const MAX_PLAYERS=10;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const fmt=n=>Number(n||0).toLocaleString("fr-FR");
  let tables={}, openId=null, listening=false, ref=null, seen=new Set();

  function me(){try{return String(localStorage.getItem(IDENTITY_KEY)||"").trim();}catch(_e){return "";}}
  async function db(){
    if(typeof window.bptFirebaseEnsure!=="function")throw new Error("Firebase indisponible");
    const {rtdb}=await window.bptFirebaseEnsure();return rtdb;
  }
  function seatsOf(t){return Object.entries(t?.seats||{}).filter(([,s])=>s&&s.name).map(([i,s])=>({i:Number(i),...s}));}
  function mySeat(t){const n=me();return seatsOf(t).find(s=>s.name===n)||null;}

  function structure(players,targetHours,startStack){
    const fn=window.bptComputeLiveStructure;
    if(typeof fn==="function"){
      const s=fn(targetHours,players,startStack);
      return {levels:(s.levels||[]).map(l=>({sb:l.sb,bb:l.bb,durationSec:l.durationSec})),levelSeconds:s.levelSeconds};
    }
    const sb=[25,50,75,100,150,200,300,400,500,600,800,1000,1200,1500,2000,2500,3000,4000,5000,6000,8000,10000,12000,15000,20000];
    const sec=Math.max(120,Math.round(targetHours*3600/16/60)*60);
    return {levels:sb.map(v=>({sb:v,bb:v*2,durationSec:sec})),levelSeconds:sec};
  }

  /* ---------- Écritures ---------- */
  async function createTable(form){
    const name=me();if(!name){alert("Identifiez-vous d'abord (Paramètres › Mon profil).");return;}
    const maxSeats=MAX_PLAYERS;
    const startStack=Math.max(1000,Number(form.startStack)||20000);
    const targetHours=Math.max(0.5,Number(form.targetHours)||2);
    const st=structure(2,targetHours,startStack); // recalculée au lancement avec le nombre réel de joueurs
    const id="t"+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    const table={id,name:String(form.title||"").trim()||`Table de ${name.split(" ")[0]}`,host:name,createdAt:Date.now(),status:"waiting",
      countsForChampionship:!!form.counts,maxSeats,startStack,targetHours,levelSeconds:st.levelSeconds,levels:st.levels,levelIndex:0,
      seats:{0:{name,stack:startStack,joinedAt:Date.now()}}};
    await (await db()).ref(`${ROOT}/${id}`).set(table);
    openId=id;render();
  }
  async function tx(id,mut){
    const r=await (await db()).ref(`${ROOT}/${id}`).transaction(t=>{if(!t)return t;return mut(t)===false?undefined:t;});
    return r&&r.committed;
  }
  // Inscription : le nombre de joueurs n'est pas imposé, chaque connecté qui rejoint prend la place libre suivante (10 max).
  async function join(id){
    const name=me();if(!name){alert("Identifiez-vous d'abord (Paramètres › Mon profil).");return;}
    const ok=await tx(id,t=>{
      if(t.status!=="waiting")return false;
      t.seats=t.seats||{};
      if(seatsOf(t).some(x=>x.name===name))return false;
      let i=0;while(i<MAX_PLAYERS&&t.seats[i]&&t.seats[i].name)i++;
      if(i>=MAX_PLAYERS)return false;
      t.seats[i]={name,stack:Number(t.startStack)||20000,joinedAt:Date.now()};
    });
    if(!ok)alert("Table complète (10 joueurs) ou partie déjà commencée.");
  }
  // Mode test local uniquement (serveur du banc / raccourci Bureau) : ajoute des joueurs virtuels pour tester seul.
  function isLocalTest(){return !!document.getElementById("bptLocalTestStyle")||/^(localhost|127.0.0.1)$/.test(location.hostname);}
  async function addBots(id,count){
    // « db » désigne ici la fonction Firebase du module : la liste des joueurs de l'appli est lue dans la portée globale.
    const roster=(()=>{try{const g=new Function("return typeof db!==\"undefined\"?db:null")();return (Array.isArray(g?.players)?g.players:[]).map(p=>p&&p.name).filter(Boolean)}catch(_e){return []}})();
    const pool=(roster.length?roster:["Alexis Volant","Jérémy COQUEL","Franck NAESSENS","Jérôme RIFFE","Mehdi BRAHIMI"]).filter(Boolean);
    await tx(id,t=>{
      if(t.status!=="waiting")return false;t.seats=t.seats||{};
      const taken=new Set(seatsOf(t).map(x=>x.name));let added=0;
      for(const name of pool){if(added>=count)break;if(taken.has(name))continue;
        let i=0;while(i<MAX_PLAYERS&&t.seats[i]&&t.seats[i].name)i++;if(i>=MAX_PLAYERS)break;
        t.seats[i]={name,stack:Number(t.startStack)||20000,joinedAt:Date.now(),bot:true};taken.add(name);added++;}
      if(!added)return false;
    });
  }
  async function leave(id){
    const name=me();
    await tx(id,t=>{if(t.status!=="waiting")return false;Object.keys(t.seats||{}).forEach(k=>{if(t.seats[k]?.name===name)delete t.seats[k];});});
  }
  async function start(id){
    // Lancement : tirage au sort des places et structure calculée sur le nombre réel de joueurs.
    await tx(id,t=>{
      const players=seatsOf(t);
      if(t.status!=="waiting"||t.host!==me()||players.length<2)return false;
      for(let i=players.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[players[i],players[j]]=[players[j],players[i]];}
      t.seats={};players.forEach((p,i)=>{t.seats[i]={name:p.name,stack:Number(t.startStack)||20000,joinedAt:p.joinedAt||Date.now(),...(p.bot?{bot:true}:{})};});
      const st=structure(players.length,Number(t.targetHours)||2,Number(t.startStack)||20000);
      t.levels=st.levels;t.levelSeconds=st.levelSeconds;t.maxSeats=players.length;
      t.status="running";t.startedAt=Date.now();t.levelIndex=0;
    });
  }
  async function removeTable(id){
    if(!confirm("Supprimer cette table ?"))return;
    await (await db()).ref(`${ROOT}/${id}`).remove();openId=null;render();
  }
  async function toggleCounts(id,val){await tx(id,t=>{if(t.host!==me()||t.status!=="waiting")return false;t.countsForChampionship=!!val;});}

  /* ---------- Affichage ---------- */
  function lobbyHtml(){
    const list=Object.values(tables).filter(t=>t&&t.status!=="finished"&&Date.now()-Number(t.createdAt||0)<MAX_AGE_MS).sort((a,b)=>b.createdAt-a.createdAt);
    const rows=list.length?list.map(t=>{const n=seatsOf(t).length;const mine=mySeat(t)?" · <b>vous y êtes</b>":"";
      return `<button type="button" class="bpt-ol-row" data-ol-open="${esc(t.id)}"><span><strong>${esc(t.name)}</strong><small>${n} joueur${n>1?"s":""} · ${t.status==="running"?"en cours":"en attente"}${mine}${t.countsForChampionship?" · compte au championnat":""}</small></span><em>›</em></button>`;}).join("")
      :`<p class="bpt-ol-empty">Aucune table ouverte pour l'instant.</p>`;
    return `<div class="bpt-ol-card"><h2>Tables en ligne</h2>${rows}</div>
    <div class="bpt-ol-card"><p class="bpt-ol-hint">Pour créer une partie en ligne : Live › étape 1 › « En ligne ».</p><button type="button" class="bpt-ol-primary" data-ol-live>Aller au Live</button></div>`;
  }
  function avatar(name){
    try{if(typeof window.bptAvatarHtml==="function")return window.bptAvatarHtml(name,"lg");}catch(_e){}
    const init=String(name||"?").trim().split(/\s+/).slice(0,2).map(w=>w[0]||"").join("").toUpperCase();
    return `<span class="bpt-av bpt-av-lg">${esc(init)}</span>`;
  }
  function tableHtml(t){
    const seats=seatsOf(t),mine=mySeat(t),isHost=t.host===me(),lv=t.levels?.[t.levelIndex||0]||{},nx=t.levels?.[(t.levelIndex||0)+1];
    // Autant de places que de joueurs inscrits (ordre d'arrivée avant le lancement, tirage au sort ensuite).
    const N=Math.max(1,seats.length);
    // La table « tourne » : le joueur connecté est toujours en bas, les autres dans l'ordre de jeu autour de lui.
    const meIdx=Math.max(0,seats.findIndex(x=>x.name===me()));
    const ring=seats.map((s,i)=>{
      const pos=(i-meIdx+N)%N, a=Math.PI/2+pos*2*Math.PI/N, x=50+47*Math.cos(a), y=50+46*Math.sin(a);
      const tag=s.name===t.host?'<i class="is-host">★ hôte</i>':s.bot?'<i>virtuel</i>':"";
      return `<div class="bpt-ol-seat${s.name===me()?" is-me":""}" data-pos="${pos}" data-n="${N}" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%">
        <div class="bpt-ol-avatar">${avatar(s.name)}</div>
        <div class="bpt-ol-plate"><b>${esc(s.name.split(" ")[0])}</b><span>${fmt(s.stack)}</span></div>${tag}</div>`;
    }).join("");
    const actions=[];
    if(t.status==="waiting"){
      if(mine)actions.push(`<button type="button" data-ol-leave>Me retirer</button>`);
      else if(seats.length<MAX_PLAYERS)actions.push(`<button type="button" class="bpt-ol-primary" data-ol-join>Rejoindre la table</button>`);
      if(isHost&&isLocalTest()&&seats.length<MAX_PLAYERS)actions.push(`<button type="button" data-ol-bots>+ 3 virtuels (test)</button>`);
      if(isHost)actions.push(`<button type="button" class="bpt-ol-primary" data-ol-start${seats.length<2?" disabled":""}>Lancer · ${seats.length} joueur${seats.length>1?"s":""}</button>`);
    }
    if(isHost)actions.push(`<button type="button" class="bpt-ol-danger" data-ol-remove>Supprimer</button>`);
    const centerSub=t.status==="waiting"
      ?`En attente des joueurs · ${seats.length} inscrit${seats.length>1?"s":""}`
      :`Prochain ${fmt(nx?.sb)} / ${fmt(nx?.bb)} · ${Math.round((lv.durationSec||t.levelSeconds||0)/60)} min`;
    const note=t.status==="running"?`<div class="bpt-ol-note">Partie lancée · la distribution des cartes arrive au lot 2</div>`:"";
    return `<div class="bpt-ol-table">
      <div class="bpt-ol-bar"><button type="button" data-ol-back aria-label="Retour aux tables">‹</button>
        <div class="bpt-ol-bar-title"><b>${esc(t.name)}</b><small>${t.countsForChampionship?"Compte au championnat":"Hors championnat"} · hôte ${esc(t.host.split(" ")[0])}</small></div>
        ${isHost&&t.status==="waiting"?`<label class="bpt-ol-check"><input type="checkbox" data-ol-counts${t.countsForChampionship?" checked":""}> Championnat</label>`:""}
        <div class="bpt-ol-bar-level"><small>Niveau ${(t.levelIndex||0)+1}</small><b>${fmt(lv.sb)} / ${fmt(lv.bb)}</b></div></div>
      <div class="bpt-ol-stage"><div class="bpt-ol-rail"><div class="bpt-ol-felt">
        <div class="bpt-ol-center"><span class="bpt-ol-logo">♠ BPT</span><strong>${fmt(lv.sb)} / ${fmt(lv.bb)}</strong><small>${centerSub}</small></div>
      </div></div>${ring}</div>
      ${note}<div class="bpt-ol-actions">${actions.join("")}</div></div>`;
  }
  // Table « stade » (rectangle aux bouts arrondis) : chaque joueur est posé sur le bord, à intervalles réguliers
  // le long du contour, en partant du bas (soi) puis vers la gauche. Recalculé à chaque affichage et redimensionnement.
  function layoutSeats(){
    const stage=document.querySelector("#bptOnlineBody .bpt-ol-stage");if(!stage)return;
    const W=stage.clientWidth,H=stage.clientHeight;if(!W||!H)return;
    const inset=Math.min(W,H)*0.03,w=W-2*inset,h=H-2*inset,r=Math.min(w,h)/2,lx=w-2*r,ly=h-2*r;
    const segs=[["l",lx/2,[inset+w/2,inset+h],[-1,0]],["a",Math.PI*r/2,[inset+r,inset+h-r],[Math.PI/2,Math.PI]],["l",ly,[inset,inset+h-r],[0,-1]],
      ["a",Math.PI*r/2,[inset+r,inset+r],[Math.PI,1.5*Math.PI]],["l",lx,[inset+r,inset],[1,0]],["a",Math.PI*r/2,[inset+w-r,inset+r],[1.5*Math.PI,2*Math.PI]],
      ["l",ly,[inset+w,inset+r],[0,1]],["a",Math.PI*r/2,[inset+w-r,inset+h-r],[0,Math.PI/2]],["l",lx/2,[inset+w-r,inset+h],[-1,0]]];
    const P=segs.reduce((a,x)=>a+x[1],0);
    const at=d=>{for(let i=0;i<segs.length;i++){const [k,len,o,v]=segs[i];if(d<=len||i===segs.length-1){
      if(k==="l")return [o[0]+v[0]*d,o[1]+v[1]*d];const a=v[0]+(v[1]-v[0])*(len?Math.min(1,d/len):0);return [o[0]+r*Math.cos(a),o[1]+r*Math.sin(a)];}d-=len;}return [W/2,H];};
    stage.querySelectorAll(".bpt-ol-seat[data-pos]").forEach(el=>{const n=Number(el.dataset.n)||1,p=Number(el.dataset.pos)||0;const [x,y]=at(P*p/n);el.style.left=x.toFixed(1)+"px";el.style.top=y.toFixed(1)+"px";});
  }
  window.addEventListener("resize",()=>requestAnimationFrame(layoutSeats));
  function render(){
    const box=$("bptOnlineBody");if(!box)return;
    if(!me()){box.innerHTML=`<div class="bpt-ol-card"><p>Identifiez-vous d'abord (Paramètres › Mon profil) pour rejoindre une table.</p></div>`;return;}
    const t=openId&&tables[openId];
    // Table supprimée par l hôte : retour au salon. Table tout juste créée : on attend la base.
    if(openId&&!t&&seen.has(openId)){openId=null;}
    if(openId&&!t){box.innerHTML=`<div class="bpt-ol-card"><p>Ouverture de la table…</p></div>`;return;}
    // Table ouverte : plein écran, comme le Live (en-tête et navigation de l'appli masqués).
    document.documentElement.classList.toggle("bpt-online-open",!!t&&!!$("online")?.classList.contains("active"));
    box.innerHTML=t?tableHtml(t):lobbyHtml();
    if(t)requestAnimationFrame(layoutSeats);
  }

  /* ---------- Écoute ---------- */
  async function listen(on){
    if(on===listening)return;listening=on;
    try{
      const r=await db();
      if(on){ref=r.ref(ROOT);ref.on("value",snap=>{tables=snap.val()||{};Object.keys(tables).forEach(k=>seen.add(k));render();document.dispatchEvent(new CustomEvent("bpt-online-tables"));});}
      else if(ref){ref.off();ref=null;document.documentElement.classList.remove("bpt-online-open");}
    }catch(e){const box=$("bptOnlineBody");if(box)box.innerHTML=`<div class="bpt-ol-card"><p>Connexion impossible : ${esc(e.message||e)}</p></div>`;}
  }
  function install(){
    const view=$("online");if(!view)return;
    const live=$("live3");const watch=()=>{listen(view.classList.contains("active")||!!live?.classList.contains("active"));if(!view.classList.contains("active"))document.documentElement.classList.remove("bpt-online-open");else render();};
    [view,live].filter(Boolean).forEach(el=>new MutationObserver(watch).observe(el,{attributes:true,attributeFilter:["class"]}));
    view.addEventListener("click",e=>{
      const g=s=>e.target.closest(s);let el;
      if((el=g("[data-ol-open]"))){openId=el.dataset.olOpen;render();return;}
      if(g("[data-ol-back]")){openId=null;render();return;}
      if(g("[data-ol-live]")){window.showView&&window.showView("live3");return;}
      if(g("[data-ol-join]")){join(openId);return;}
      if(g("[data-ol-bots]")){addBots(openId,3);return;}
      if(g("[data-ol-leave]")){leave(openId);return;}
      if(g("[data-ol-start]")){start(openId);return;}
      if(g("[data-ol-remove]")){removeTable(openId);return;}
    });
    view.addEventListener("change",e=>{const c=e.target.closest("[data-ol-counts]");if(c)toggleCounts(openId,c.checked);});
    watch();
    render();
  }
  // API utilisée par l'étape 1 du Live (bpt-live-mobilefirst.js).
  function openTables(){return Object.values(tables).filter(t=>t&&t.status!=="finished"&&Date.now()-Number(t.createdAt||0)<MAX_AGE_MS).sort((a,b)=>b.createdAt-a.createdAt);}
  window.bptOnline={
    openTables,
    me,
    open(id){openId=id||null;window.showView&&window.showView("online");render();},
    async create(form){await createTable(form);window.showView&&window.showView("online");render();}
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);else install();
})();
