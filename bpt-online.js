/* BPT 10.4.78 — Jouer en ligne · lot 1 : salon et places · lot 2 : donne · lot 3 : enchères, pots, abattage · lot 4 : fin du tournoi, championnat, relais de l'hôte.
   Mode confiance (pas de serveur) : tout passe par Firebase, les écritures concurrentes par transaction.
   Données : bpt/online/tables/{id} = {id,name,host,createdAt,status,countsForChampionship,maxSeats,
   startStack,targetHours,levelSeconds,levels[],levelIndex,seats{index:{name,stack,joinedAt}}}. */
(function(){
  const ROOT="bpt/online/tables";
  // Indicateur léger des parties en ligne en cours (pastille de l'onglet Live), sans cartes ni détail des mains.
  const RUN_ROOT="bpt/online/running";
  const IDENTITY_KEY="bpt_live3_identity_name";
  const MAX_AGE_MS=24*3600*1000;
  const MAX_PLAYERS=10;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const fmt=n=>Number(n||0).toLocaleString("fr-FR");
  let tables={}, openId=null, listening=false, ref=null, seen=new Set(), lastSig="", shownShowcase="";

  // Heure du serveur Firebase : tous les appareils comparent la même horloge (délais de jeu, présence), même si un
  // téléphone est en avance ou en retard.
  let clockSkew=0,skewOn=false;const srvNow=()=>Date.now()+clockSkew;
  function me(){try{return String(localStorage.getItem(IDENTITY_KEY)||"").trim();}catch(_e){return "";}}
  async function db(){
    if(typeof window.bptFirebaseEnsure!=="function")throw new Error("Firebase indisponible");
    const {rtdb}=await window.bptFirebaseEnsure();
    if(!skewOn){skewOn=true;try{rtdb.ref(".info/serverTimeOffset").on("value",s=>{clockSkew=Number(s.val())||0;});}catch(_e){}}
    return rtdb;
  }
  function seatsOf(t){return Object.entries(t?.seats||{}).filter(([,s])=>s&&s.name).map(([i,s])=>({i:Number(i),...s}));}
  function mySeat(t){const n=me();return seatsOf(t).find(s=>s.name===n)||null;}

  // En ligne, les mains vont ~20 % plus vite qu'en Live : plus de mains par niveau, la partie se termine plus tôt
  // dans la structure (≈ 50 BB de jetons en jeu au lieu de 40). Les niveaux sont calés sur cette fin pour tenir la durée.
  const ONLINE_END_BB=50;
  function endIndexFor(levels,totalChips){const target=totalChips/ONLINE_END_BB;let best=0,gap=Infinity;levels.forEach((l,i)=>{const d=Math.abs(Number(l.bb)-target);if(d<gap){gap=d;best=i;}});return best;}
  function structure(players,targetHours,startStack){
    const fn=window.bptComputeLiveStructure;
    const sbs=typeof fn==="function"?(fn(targetHours,players,startStack).levels||[]).map(l=>Number(l.sb))
      :[25,50,75,100,150,200,300,400,500,600,800,1000,1200,1500,2000,2500,3000,4000,5000,6000,8000,10000,12000,15000,20000];
    const levels=sbs.map(v=>({sb:v,bb:v*2}));
    const endIdx=endIndexFor(levels,Math.max(2,players)*startStack);
    const sec=Math.max(120,Math.round(Math.max(0.5,targetHours)*3600/(endIdx+1)/60)*60);
    levels.forEach(l=>l.durationSec=sec);
    return {levels,levelSeconds:sec};
  }
  /* Structure adaptative (comme le Live) : à chaque nouveau niveau, si la fin projetée s'écarte de 3 min ou plus de la durée
     visée, la durée des niveaux suivants est réajustée (±30 % maxi, entre 3 et 40 min). Projection : temps restant selon la
     structure jusqu'au niveau de fin, corrigé par les joueurs restants dans la zone de fin. */
  function adaptLevels(t){
    if(!t.adaptive||!t.startedAt)return;
    const L=levelAt(t),idx=L.index;if(Number(t.adaptAt)>=idx||idx<1)return;
    t.adaptAt=idx;
    const lv=t.levels,N=Math.max(2,Object.keys(t.seats||{}).length),remaining=Math.max(1,inPlay(t).length);
    const endIdx=endIndexFor(lv,N*(Number(t.startStack)||20000));
    const targetSec=Math.max(1800,(Number(t.targetHours)||2)*3600),elapsed=(srvNow()-Number(t.startedAt))/1000;
    // Au-delà du niveau de fin prévu (arrivée de joueurs, sorties tardives…) : si l'heure visée est proche ou dépassée,
    // chaque nouveau niveau est raccourci de 40 % (3 min minimum). Avant, plus rien n'était ajusté dans cette zone.
    if(endIdx<=idx){
      if(elapsed<targetSec*0.85||remaining<2)return;
      const nextMin=Math.max(1,Math.round((Number(lv[idx+1]?.durationSec)||Number(lv[idx].durationSec)||600)/60)),min=Math.max(3,Math.round(nextMin*0.6));
      if(min<nextMin){for(let i=idx+1;i<lv.length;i++)lv[i].durationSec=min*60;t.lastAdapt={level:idx+1,from:nextMin,to:min,at:srvNow()};}
      return;
    }
    const curDur=Math.max(60,Number(lv[idx].durationSec)||600);
    let scheduleLeft=L.left;for(let i=idx+1;i<=endIdx;i++)scheduleLeft+=Math.max(60,Number(lv[i]?.durationSec)||curDur);
    const levelProgress=Math.max(0,(idx+1-L.left/curDur)/(endIdx+1));
    const expectedRemaining=N-(N-1)*Math.pow(Math.min(1,levelProgress),4.5);
    const weight=Math.max(0,Math.min(1,(levelProgress-.35)/.30));
    const correction=Math.max(-2700,Math.min(2700,(remaining-expectedRemaining)*0.8*8*60*weight));
    const delta=elapsed+scheduleLeft+correction-targetSec;
    if(Math.abs(delta)<120)return;
    const nextMin=Math.max(1,Math.round((Number(lv[idx+1]?.durationSec)||curDur)/60));
    const ideal=(targetSec-elapsed-L.left-correction)/(endIdx-idx)/60;
    const min=Math.max(3,Math.min(40,Math.round(Math.max(nextMin*.5,Math.min(nextMin*1.3,ideal)))));
    if(min===nextMin)return;
    for(let i=idx+1;i<lv.length;i++)lv[i].durationSec=min*60;
    t.lastAdapt={level:idx+1,from:nextMin,to:min,at:srvNow()};
  }

  /* ---------- Écritures ---------- */
  // Une seule partie en ligne à la fois : partie en préparation ou en cours (index léger, entrées de moins de 12 h).
  async function activeTable(){
    try{const snap=await (await db()).ref(RUN_ROOT).once("value");const v=snap.val()||{};
      const e=Object.entries(v).find(([,x])=>x&&srvNow()-Number(x.at||0)<12*3600*1000);return e?{id:e[0],...e[1]}:null;}catch(_e){return null;}
  }
  async function createTable(form){
    const name=me();if(!name){alert("Identifiez-vous d'abord (Paramètres › Mon profil).");return;}
    const busy=await activeTable();
    if(busy){alert(busy.state==="waiting"?"Une partie en ligne est déjà en préparation : rejoignez-la.":"Une partie en ligne est déjà en cours.");openId=busy.id;render();return;}
    const maxSeats=MAX_PLAYERS;
    const startStack=Math.max(1000,Number(form.startStack)||20000);
    const targetHours=Math.max(0.5,Number(form.targetHours)||2);
    const st=structure(2,targetHours,startStack); // recalculée au lancement avec le nombre réel de joueurs
    const id="t"+srvNow().toString(36)+Math.random().toString(36).slice(2,5);
    const table={id,name:String(form.title||"").trim()||"Partie en ligne",host:name,createdAt:srvNow(),status:"waiting",
      countsForChampionship:!!form.counts,adaptive:form.adaptive!==false,maxSeats,startStack,targetHours,levelSeconds:st.levelSeconds,levels:st.levels,levelIndex:0,
      seats:{0:{name,stack:startStack,joinedAt:srvNow()}}};
    await (await db()).ref(`${ROOT}/${id}`).set(table);
    tables[id]=tables[id]||table;setWaiting(id);
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
      t.seats[i]={name,stack:Number(t.startStack)||20000,joinedAt:srvNow()};
    });
    if(!ok)alert("Table complète (10 joueurs) ou partie déjà commencée.");else setTimeout(()=>setWaiting(id),300);
  }
  // Joueurs virtuels : l organisateur peut en ajouter avant le lancement. Ils jouent prudemment, pilotés par l appareil
  // pilote ; une partie avec des virtuels est toujours hors championnat. En test local, ils prennent des noms du club.
  const ROBOTS=["Robby","Wall-E","R2D2","Bender","Marvin","Baymax","Optimus","Sonny","Hal","Data"];
  const hasBots=t=>seatsOf(t).some(s=>s.bot);
  function isLocalTest(){return !!document.getElementById("bptLocalTestStyle")||/^(localhost|127.0.0.1)$/.test(location.hostname);}
  async function addBots(id,count){
    // « db » désigne ici la fonction Firebase du module : la liste des joueurs de l'appli est lue dans la portée globale.
    const roster=(()=>{try{const g=new Function("return typeof db!==\"undefined\"?db:null")();return (Array.isArray(g?.players)?g.players:[]).map(p=>p&&p.name).filter(Boolean)}catch(_e){return []}})();
    const pool=!isLocalTest()?ROBOTS:(roster.length?roster:["Alexis Volant","Jérémy COQUEL","Franck NAESSENS","Jérôme RIFFE","Mehdi BRAHIMI"]).filter(Boolean);
    await tx(id,t=>{
      if(t.status!=="waiting")return false;t.seats=t.seats||{};
      const taken=new Set(seatsOf(t).map(x=>x.name));let added=0;
      for(const name of pool){if(added>=count)break;if(taken.has(name))continue;
        let i=0;while(i<MAX_PLAYERS&&t.seats[i]&&t.seats[i].name)i++;if(i>=MAX_PLAYERS)break;
        t.seats[i]={name,stack:Number(t.startStack)||20000,joinedAt:srvNow(),bot:true};taken.add(name);added++;}
      if(!added)return false;
      t.countsForChampionship=false;
    });
    setTimeout(()=>setWaiting(id),300);
  }
  async function removeBot(id){
    await tx(id,t=>{if(t.status!=="waiting"||t.host!==me())return false;const b=seatsOf(t).filter(s=>s.bot).pop();if(!b)return false;delete t.seats[b.i];});
    setTimeout(()=>setWaiting(id),300);
  }
  async function leave(id){
    const name=me();
    await tx(id,t=>{if(t.status!=="waiting")return false;Object.keys(t.seats||{}).forEach(k=>{if(t.seats[k]?.name===name)delete t.seats[k];});});
    setTimeout(()=>setWaiting(id),300);
  }
  async function setRunning(id,on){try{const r=(await db()).ref(`${RUN_ROOT}/${id}`);on?await r.set({state:"running",at:srvNow()}):await r.remove();}catch(_e){}}
  // Tables en préparation : nom, hôte et nombre d'inscrits dans l'index léger (encart « Rejoindre » de l'accueil).
  async function setWaiting(id){try{const t=tables[id];if(!t||t.status!=="waiting")return;
    await (await db()).ref(`${RUN_ROOT}/${id}`).set({state:"waiting",name:t.name,host:t.host,n:seatsOf(t).length,players:seatsOf(t).map(x=>x.name).join("|"),at:srvNow()});}catch(_e){}}
  async function start(id){
    // Lancement : tirage au sort des places et structure calculée sur le nombre réel de joueurs.
    const started=await tx(id,t=>{
      const players=seatsOf(t);
      if(t.status!=="waiting"||t.host!==me()||players.length<2)return false;
      if(hasBots(t))t.countsForChampionship=false;
      for(let i=players.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[players[i],players[j]]=[players[j],players[i]];}
      t.seats={};players.forEach((p,i)=>{t.seats[i]={name:p.name,stack:Number(t.startStack)||20000,joinedAt:p.joinedAt||srvNow(),...(p.bot?{bot:true}:{})};});
      const st=structure(players.length,Number(t.targetHours)||2,Number(t.startStack)||20000);
      t.levels=st.levels;t.levelSeconds=st.levelSeconds;t.maxSeats=players.length;
      t.status="running";t.startedAt=srvNow();t.levelIndex=0;t.hand=null;
      dealHand(t);
    });
    if(started)setRunning(id,true);
  }
  async function removeTable(id){
    if(!confirm("Supprimer cette table ?"))return;
    await (await db()).ref(`${ROOT}/${id}`).remove();(await db()).ref(`${HANDS_ROOT}/${id}`).remove().catch(()=>{});(await db()).ref(`${CHATLOG_ROOT}/${id}`).remove().catch(()=>{});
    try{await (await db()).ref(`${RUN_ROOT}/${id}`).remove();}catch(_e){}openId=null;render();
  }
  // Réglages de la partie avant lancement (organisateur) : durée visée, tapis de départ, structure.
  async function setupTable(id,key,val){
    await tx(id,t=>{
      if(t.status!=="waiting"||t.host!==me())return false;
      if(key==="targetHours")t.targetHours=Math.max(0.5,Number(val)||2);
      else if(key==="startStack"){const v=Math.max(1000,Math.round((Number(val)||20000)/100)*100);t.startStack=v;Object.values(t.seats||{}).forEach(x=>{if(x&&x.name)x.stack=v;});}
      else if(key==="adaptive")t.adaptive=String(val)==="1";
      else return false;
    });
  }
  async function toggleCounts(id,val){await tx(id,t=>{if(t.host!==me()||t.status!=="waiting")return false;if(val&&hasBots(t))return false;t.countsForChampionship=!!val;});}

  /* ---------- Donne et enchères (lots 2 et 3) ----------
     t.hand = {no, level, sb:i, bb:i, dealer:i, deck, hole:{i:"Ah,Kd"}, board, street, at,
               bets:{p<i>:montant de ce tour}, contrib:{p<i>:total de la main}, folded:{p<i>:true}, allin:{p<i>:true},
               acted:{p<i>:true}, currentBet, minRaise, toAct:i, actionAt, last:{i,txt}, result:[{amount,winners,hand}], showdown}
     Clés « p<i> » (et non numériques) : Firebase transformerait sinon ces objets en tableaux.
     street : preflop → flop → turn → river → done. Mode confiance : le paquet est dans la base. */
  const RANKS="23456789TJQKA",SUITS="shdc";
  const K=i=>"p"+i;
  const TURN_MS=45000, AWAY_AFTER=2;
  // Délai avant la main suivante : plus long après un abattage pour laisser voir les cartes de chacun.
  // Cartes montrées volontairement par le gagnant : la main suivante attend encore 3 s pour qu on les voie.
  const nextHandMs=h=>h?.showdown?7000:h?.shownAt?Math.max(4000,Number(h.shownAt)-Number(h.at||0)+3000):4000;
  function freshDeck(){
    const d=[];for(const s of SUITS)for(const r of RANKS)d.push(r+s);
    const rnd=n=>{try{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%n;}catch(_e){return Math.floor(Math.random()*n);}};
    for(let i=d.length-1;i>0;i--){const j=rnd(i+1);[d[i],d[j]]=[d[j],d[i]];}
    return d;
  }
  const split=s=>String(s||"").split(",").filter(Boolean);
  function inPlay(t){return seatsOf(t).filter(s=>Number(s.stack)>0).map(s=>s.i).sort((a,b)=>a-b);}
  function nextOf(list,i){return list.find(x=>x>i)??list[0];}
  // Niveau courant d'après le temps écoulé depuis le lancement (pas de pause en ligne).
  function levelAt(t,now=srvNow()){
    if(t.pausedAt)now=Number(t.pausedAt); // en pause : le chrono est figé
    const lv=Array.isArray(t.levels)?t.levels:[];if(!t.startedAt||!lv.length)return {index:0,left:0};
    let el=Math.max(0,(now-Number(t.startedAt))/1000);
    for(let i=0;i<lv.length;i++){const d=Math.max(60,Number(lv[i].durationSec)||Number(t.levelSeconds)||600);if(el<d)return {index:i,left:Math.ceil(d-el)};el-=d;}
    return {index:lv.length-1,left:0};
  }
  const stackOf=(t,i)=>Number(t.seats?.[i]?.stack)||0;
  const betOf=(h,i)=>Number(h.bets?.[K(i)])||0;
  const handPlayers=t=>Object.keys(t.hand?.hole||{}).map(Number).filter(i=>!Number.isNaN(i)&&split(t.hand.hole[i]).length).sort((a,b)=>a-b);
  const folded=(h,i)=>!!h.folded?.[K(i)];
  const canAct=(t,i)=>!folded(t.hand,i)&&!t.hand.allin?.[K(i)]&&stackOf(t,i)>0;
  const firstName=(t,i)=>String(t.seats?.[i]?.name||"?").split(" ")[0];
  function commit(t,i,amt){
    const h=t.hand;amt=Math.max(0,Math.min(Math.round(amt),stackOf(t,i)));
    t.seats[i].stack=stackOf(t,i)-amt;
    h.bets=h.bets||{};h.contrib=h.contrib||{};h.allin=h.allin||{};
    h.bets[K(i)]=betOf(h,i)+amt;h.contrib[K(i)]=(Number(h.contrib[K(i)])||0)+amt;
    if(stackOf(t,i)===0)h.allin[K(i)]=true;
    return amt;
  }
  function nextToAct(t,from){const list=handPlayers(t);let p=from;for(let k=0;k<list.length;k++){p=nextOf(list,p);if(canAct(t,p))return p;}return null;}

  function finishTournament(t){
    const list=inPlay(t);if(t.status==="finished")return;
    t.status="finished";t.finishedAt=srvNow();t.winner=list.length?t.seats[list[0]].name:null;
  }
  function dealHand(t){
    const list=inPlay(t);
    if(list.length<2){finishTournament(t);return;}
    const prev=t.hand?t.hand.dealer:null;
    // Première main : bouton tiré au sort ; ensuite il passe au joueur suivant encore en jeu.
    const dealer=prev===null||prev===undefined?list[Math.floor(Math.random()*list.length)]:nextOf(list,prev);
    const headsUp=list.length===2;
    const sb=headsUp?dealer:nextOf(list,dealer), bb=nextOf(list,sb);
    const deck=freshDeck(), hole={};
    const order=[];let p=sb;for(let k=0;k<list.length;k++){order.push(p);p=nextOf(list,p);}
    for(let round=0;round<2;round++)order.forEach(i=>{hole[i]=(hole[i]?hole[i]+",":"")+deck.shift();});
    const level=levelAt(t).index, lv=t.levels?.[level]||{sb:25,bb:50};
    t.hand={no:(Number(t.hand?.no)||0)+1,level,dealer,sb,bb,deck:deck.join(","),hole,board:"",street:"preflop",at:srvNow(),
      bets:{},contrib:{},folded:{},allin:{},acted:{},currentBet:Number(lv.bb)||50,minRaise:Number(lv.bb)||50,result:null,showdown:false};
    t.levelIndex=level;
    try{adaptLevels(t);}catch(_e){}
    commit(t,sb,Number(lv.sb)||25);commit(t,bb,Number(lv.bb)||50);
    t.hand.last={i:bb,txt:`Blindes ${fmt(lv.sb)} / ${fmt(lv.bb)}`};logAct(t.hand);
    t.hand.toAct=nextToAct(t,bb);t.hand.actionAt=srvNow();
    settle(t);
  }
  // Fin du tour d'enchères : tous ceux qui peuvent encore parler ont parlé depuis la dernière relance et sont alignés.
  function streetDone(t){
    const h=t.hand,actors=handPlayers(t).filter(i=>canAct(t,i));
    if(!actors.length)return true;
    // Un seul joueur peut encore miser (les autres sont à tapis) : rien à jouer s'il a déjà égalé la mise.
    if(actors.length===1&&betOf(h,actors[0])>=h.currentBet)return true;
    return actors.every(i=>h.acted?.[K(i)]&&betOf(h,i)===h.currentBet);
  }
  function settle(t){
    const h=t.hand;
    const alive=handPlayers(t).filter(i=>!folded(h,i));
    if(alive.length===1){finishHand(t,false);return;}
    if(!streetDone(t)){if(h.toAct===null||h.toAct===undefined||!canAct(t,h.toAct))h.toAct=nextToAct(t,h.toAct??h.dealer);return;}
    // Tapis avant la river : on retourne d'abord les cartes, puis les rues arrivent une à une (voir runoutStep).
    if(h.street!=="river"&&handPlayers(t).filter(i=>canAct(t,i)).length<2){h.runout=true;h.toAct=null;h.runoutAt=srvNow();return;}
    nextStreet(t);
  }
  // Tour suivant (une carte brûlée avant chaque tirage). Si plus personne ne peut miser (tapis), le tableau se déroule
  // carte par carte pour le suspense : h.runout, et l'appareil pilote révèle la rue suivante toutes les RUNOUT_MS.
  const RUNOUT_MS=3000;
  function nextStreet(t){
    const h=t.hand;
    if(h.street==="river"){finishHand(t,true);return;}
    const deck=split(h.deck),board=split(h.board);
    const draw=n=>{deck.shift();for(let k=0;k<n;k++)board.push(deck.shift());};
    if(h.street==="preflop"){draw(3);h.street="flop";}else if(h.street==="flop"){draw(1);h.street="turn";}else{draw(1);h.street="river";}
    h.bets={};h.currentBet=0;h.minRaise=Number(t.levels?.[h.level]?.bb)||50;h.acted={};
    h.deck=deck.join(",");h.board=board.join(",");
    if(handPlayers(t).filter(i=>canAct(t,i)).length<2){h.runout=true;h.toAct=null;h.runoutAt=srvNow();return;}
    h.runout=false;h.toAct=nextToAct(t,h.dealer);h.actionAt=srvNow();
  }
  // Tapis : avant le flop, la carte suivante n'est pas encore tirée ; on attend RUNOUT_MS puis on révèle la rue suivante.
  function runoutStep(t){
    const h=t.hand;if(!h||!h.runout||h.street==="done")return false;
    nextStreet(t);
    if(h.street!=="done")h.runoutAt=srvNow();
  }


  /* Chances de gain pendant un tapis : calcul exact sur toutes les cartes restantes possibles (après le flop / la turn),
     estimation sur 4 000 tirages avant le flop. Les égalités sont partagées. Calcul fait une fois par rue sur chaque appareil. */
  const equityCache=new Map();
  function equities(h,players){
    const key=`${h.no}:${h.street}:${h.board}:${players.join(",")}`;if(equityCache.has(key))return equityCache.get(key);
    const board=split(h.board),holes=players.map(i=>split(h.hole[i])),used=new Set([...board,...holes.flat()]);
    const rest=[];for(const su of SUITS)for(const r of RANKS){const c=r+su;if(!used.has(c))rest.push(c);}
    const need=5-board.length,win=players.map(()=>0);let n=0;
    const score=extra=>{const full=[...board,...extra];const sc=holes.map(hc=>best7([...hc,...full]));let best=sc[0];sc.forEach(x=>{if(cmp(x,best)>0)best=x;});
      const w=sc.map((x,k)=>cmp(x,best)===0?k:-1).filter(k=>k>=0);w.forEach(k=>win[k]+=1/w.length);n++;};
    if(need===0)score([]);
    else if(need<=2){for(let a=0;a<rest.length;a++){if(need===1){score([rest[a]]);continue;}for(let b=a+1;b<rest.length;b++)score([rest[a],rest[b]]);}}
    else{const pool=rest.slice();const pick=()=>{for(let k=0;k<need;k++){const j=k+Math.floor(Math.random()*(pool.length-k));[pool[k],pool[j]]=[pool[j],pool[k]];}return pool.slice(0,need);};/* mélange partiel : se termine toujours */for(let k=0;k<4000;k++)score(pick());}
    const res={};players.forEach((i,k)=>res[i]=n?win[k]/n:0);equityCache.set(key,res);if(equityCache.size>40)equityCache.delete(equityCache.keys().next().value);return res;
  }
  /* Évaluation : meilleure main de 5 cartes parmi 7 → [catégorie, départages…] comparable. */
  // Nom de la main avec son article, pour la phrase « X gagne avec … ».
  const HAND_PHRASE={"Hauteur":"la carte haute","Paire":"une paire","Double paire":"une double paire","Brelan":"un brelan","Quinte":"une quinte","Couleur":"une couleur","Full":"un full","Carré":"un carré","Quinte flush":"une quinte flush"};
  const HAND_NAMES=["Hauteur","Paire","Double paire","Brelan","Quinte","Couleur","Full","Carré","Quinte flush"];
  const RV=c=>RANKS.indexOf(c[0])+2;
  function eval5(cs){
    const r=cs.map(RV).sort((a,b)=>b-a),fl=cs.every(c=>c[1]===cs[0][1]);
    const u=[...new Set(r)];let st=0;
    if(u.length===5){if(u[0]-u[4]===4)st=u[0];else if(u.join()==="14,5,4,3,2")st=5;}
    const cnt={};r.forEach(x=>cnt[x]=(cnt[x]||0)+1);
    const g=Object.entries(cnt).map(([v,n])=>[n,+v]).sort((a,b)=>b[0]-a[0]||b[1]-a[1]);
    if(st&&fl)return [8,st];
    if(g[0][0]===4)return [7,g[0][1],g[1][1]];
    if(g[0][0]===3&&g[1][0]===2)return [6,g[0][1],g[1][1]];
    if(fl)return [5,...r];
    if(st)return [4,st];
    if(g[0][0]===3)return [3,g[0][1],...g.slice(1).map(x=>x[1])];
    if(g[0][0]===2&&g[1][0]===2)return [2,g[0][1],g[1][1],g[2][1]];
    if(g[0][0]===2)return [1,g[0][1],...g.slice(1).map(x=>x[1])];
    return [0,...r];
  }
  const cmp=(a,b)=>{for(let k=0;k<Math.max(a.length,b.length);k++){const d=(a[k]||0)-(b[k]||0);if(d)return d;}return 0;};
  function best7(cards){return bestCombo(cards).score;}
  // Meilleure combinaison et ses 5 cartes (pour les mettre en évidence à l'abattage).
  function bestCombo(cards){
    let best=null,five=null;const n=cards.length;
    for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){const f=cards.filter((_,k)=>k!==a&&k!==b);const v=eval5(f);if(!best||cmp(v,best)>0){best=v;five=f;}}
    return {score:best,five:five||[]};
  }
  // Pots : un pot principal puis des side pots selon les mises des joueurs à tapis.
  function buildPots(t){
    const h=t.hand,players=handPlayers(t),c=i=>Number(h.contrib?.[K(i)])||0;
    const caps=[...new Set(players.filter(i=>!folded(h,i)).map(c))].sort((a,b)=>a-b);
    const pots=[];let prev=0;
    for(const cap of caps){if(cap<=prev)continue;let amt=0;players.forEach(i=>{amt+=Math.max(0,Math.min(c(i),cap)-prev);});
      pots.push({amount:amt,elig:players.filter(i=>!folded(h,i)&&c(i)>=cap)});prev=cap;}
    const total=players.reduce((a,i)=>a+c(i),0),used=pots.reduce((a,p)=>a+p.amount,0);
    if(pots.length&&total>used)pots[pots.length-1].amount+=total-used;
    return pots.filter(p=>p.amount>0);
  }
  function finishHand(t,showdown){
    const h=t.hand,board=split(h.board),pots=buildPots(t),list=handPlayers(t);
    const score={},combo={};if(showdown)list.filter(i=>!folded(h,i)).forEach(i=>{const c=bestCombo([...split(h.hole[i]),...board]);score[i]=c.score;combo[i]=c.five.join(",");});
    h.result=pots.map(p=>{
      let w=p.elig;
      if(showdown&&w.length>1){const top=w.reduce((b,i)=>b===null||cmp(score[i],score[b])>0?i:b,null);/* b===null : la place n°0 est un gagnant possible */w=w.filter(i=>cmp(score[i],score[top])===0);}
      const share=Math.floor(p.amount/w.length);let rest=p.amount-share*w.length;
      // Jeton indivisible : au premier gagnant à gauche du bouton.
      const ordered=[];let q=h.dealer;for(let k=0;k<list.length;k++){q=nextOf(list,q);if(w.includes(q))ordered.push(q);}
      ordered.forEach(i=>{t.seats[i].stack=stackOf(t,i)+share+(rest>0?1:0);if(rest>0)rest--;});
      return {amount:p.amount,winners:ordered,elig:p.elig,hand:showdown&&score[ordered[0]]?HAND_NAMES[score[ordered[0]][0]]:null,cards:showdown?(combo[ordered[0]]||""):""};
    });
    h.showdown=!!showdown;h.street="done";h.toAct=null;h.at=srvNow();h.bets={};
    // Éliminations : si plusieurs joueurs sortent sur la même main, le plus gros tapis de départ prend la meilleure place.
    // Éliminateur : gagnant du pot le plus élevé auquel le joueur participait.
    t.out=t.out||{};const still=inPlay(t).length;
    const busted=list.filter(i=>stackOf(t,i)===0&&!t.out[K(i)]).sort((a,b)=>(Number(h.contrib?.[K(b)])||0)-(Number(h.contrib?.[K(a)])||0));
    busted.forEach((i,k)=>{
      const pot=[...h.result].reverse().find(r=>(r.elig||[]).includes(i)&&r.winners.length)||h.result[0];
      const by=pot?.winners?.find(w=>stackOf(t,w)>0);
      t.out[K(i)]={name:t.seats[i].name,place:still+1+k,hand:h.no,by:by!==undefined?t.seats[by].name:null,level:(Number(h.level)||0)+1,at:srvNow()};
    });
    if(still<2)finishTournament(t);
    const w0=h.result[0]?.winners||[];
    h.last={i:w0[0],txt:w0.length?`${w0.map(i=>firstName(t,i)).join(" et ")} remporte${w0.length>1?"nt":""} ${fmt(h.result.reduce((a,r)=>a+r.amount,0))}${h.result[0]?.hand?` · ${h.result[0].hand}`:""}`:""};
  }

  // Journal de la main : « rue:texte » séparés par « | » (p = pré-flop, f = flop, t = turn, r = river).
  function logAct(h){if(h?.last?.txt)h.log=(h.log?h.log+"|":"")+String(h.street||"preflop")[0]+":"+h.last.txt;}

  /* Actions d'un joueur (ou d'un joueur virtuel piloté par l'appareil de l'hôte en test local). */
  async function act(id,action,amount,asBot=false){return tx(id,t=>applyAction(t,action,amount,asBot));}
  // Règle d'une action, sans accès à la base (testable seule). Renvoie false si l'action est refusée.
  function applyAction(t,action,amount,asBot=false){
    {
      const h=t.hand;if(t.status!=="running"||!h||h.street==="done"||t.pausedAt)return false;
      const i=h.toAct,seat=t.seats?.[i];if(seat===undefined||seat===null||i===null)return false;
      if(asBot?!(seat.bot&&pilotName(t)===me()):seat.name!==me()){
        const pilotOk=pilotName(t)===me();
        if(!(pilotOk&&((action==="timeout"&&srvNow()-Number(h.actionAt||0)>=TURN_MS)||(action==="away"&&seat.away))))return false;
      }
      const toCall=Math.max(0,h.currentBet-betOf(h,i)),stack=stackOf(t,i),name=firstName(t,i);
      h.acted=h.acted||{};h.folded=h.folded||{};
      // Délai dépassé : compteur ; au 2e d'affilée le joueur passe absent (sit out). Absent : check ou couché sans attendre.
      // Une action jouée par le joueur lui-même remet le compteur à zéro.
      if(action==="timeout"){seat.timeouts=(Number(seat.timeouts)||0)+1;if(seat.timeouts>=AWAY_AFTER)seat.away=true;}
      else if(action!=="away"&&!asBot){seat.timeouts=0;seat.away=false;}
      if(action==="timeout"||action==="away")action=toCall?"fold":"check";
      if(action==="fold"){h.folded[K(i)]=true;h.last={i,txt:`${name} se couche`};}
      else if(action==="check"){if(toCall)return false;h.last={i,txt:`${name} checke`};}
      else if(action==="call"&&!toCall){h.last={i,txt:`${name} checke`};}
      else if(action==="call"){const paid=commit(t,i,toCall);h.last={i,txt:paid<toCall?`${name} suit à tapis (${fmt(paid)})`:`${name} suit ${fmt(paid)}`};}
      else if(action==="raise"||action==="allin"){
        const maxTotal=betOf(h,i)+stack;
        let target=action==="allin"?maxTotal:Math.min(Math.round(Number(amount)||0),maxTotal);
        if(target<=h.currentBet){if(action!=="allin")return false;commit(t,i,toCall);h.last={i,txt:`${name} suit à tapis`};}
        else{
          const size=target-h.currentBet;
          if(size<h.minRaise&&target<maxTotal)return false;
          const wasBet=h.currentBet;commit(t,i,target-betOf(h,i));
          if(size>=h.minRaise){h.minRaise=size;h.acted={};}
          h.currentBet=target;
          h.last={i,txt:target===maxTotal?`${name} fait tapis (${fmt(target)})`:wasBet?`${name} relance à ${fmt(target)}`:`${name} mise ${fmt(target)}`};
        }
      } else return false;
      logAct(h);
      h.acted[K(i)]=true;
      h.toAct=nextToAct(t,i);h.actionAt=srvNow();
      settle(t);
    }
  }

  /* ---------- Demandes pendant la partie (comme le Live classique) ----------
     t.joinRequest = {name, at} : un spectateur demande à rejoindre ; l'organisateur accepte (place + tapis de départ,
     joue dès la main suivante) ou refuse (t.joinRefused = {name, at}).
     t.takeoverRequest = {name, at} : un joueur assis demande à devenir organisateur ; acceptation, refus, ou reprise
     forcée avec le code BPT après 30 s sans réponse. */
  const TAKEOVER_MS=30000, FORCE_CODE="bpt";
  async function requestJoin(id){
    const name=me();if(!name)return;
    const ok=await tx(id,t=>{
      if(t.status!=="running"||mySeat(t))return false;
      if(t.joinRequest&&t.joinRequest.name!==name)return false; // une demande à la fois
      if(seatsOf(t).length>=MAX_PLAYERS)return false;
      t.joinRequest={name,at:srvNow()};if(t.joinRefused?.name===name)t.joinRefused=null;
    });
    if(!ok)alert("Impossible pour l’instant : une autre demande est en attente ou la table est complète.");
  }
  async function answerJoin(id,accept){
    await tx(id,t=>{
      const r=t.joinRequest;if(!r||t.host!==me())return false;
      t.joinRequest=null;
      if(!accept){t.joinRefused={name:r.name,at:srvNow()};return;}
      if(seatsOf(t).some(s=>s.name===r.name)||seatsOf(t).length>=MAX_PLAYERS)return;
      let i=0;while(t.seats[i]&&t.seats[i].name)i++;
      t.seats[i]={name:r.name,stack:Number(t.startStack)||20000,joinedAt:srvNow(),late:true};
      t.lastJoin={name:r.name,at:srvNow()};
    });
  }
  async function requestTakeover(id){
    const name=me();if(!name)return;
    const t0=tables[id];
    if(t0?.takeoverRequest?.name===name){ // demande déjà envoyée : reprise forcée possible après 30 s
      const left=Math.ceil((TAKEOVER_MS-(srvNow()-Number(t0.takeoverRequest.at||0)))/1000);
      if(left>0){alert(`L’organisateur a encore ${left} s pour répondre.`);return;}
      const code=prompt("Aucune réponse depuis 30 secondes.\n\nSaisissez le code BPT pour forcer la reprise :","");
      if(code===null)return;
      if(String(code).trim().toLowerCase()!==FORCE_CODE){alert("Code BPT incorrect.");return;}
      await tx(id,t=>{if(t.takeoverRequest?.name!==name)return false;t.host=name;t.takeoverRequest=null;});
      return;
    }
    const ok=await tx(id,t=>{
      if(t.status!=="running"||t.host===name||!mySeat(t))return false;
      if(t.takeoverRequest&&t.takeoverRequest.name!==name)return false;
      t.takeoverRequest={name,at:srvNow()};
    });
    if(!ok)alert("Une autre demande de reprise est déjà en attente.");
  }
  async function answerTakeover(id,accept){
    await tx(id,t=>{const r=t.takeoverRequest;if(!r||t.host!==me())return false;if(accept)t.host=r.name;t.takeoverRequest=null;});
  }
  function requestsHtml(t,isHost,mine){
    const out=[],fn=n=>esc(String(n||"").split(" ")[0]);
    if(isHost&&t.joinRequest)out.push(`<div class="bpt-ol-req"><span><b>${fn(t.joinRequest.name)}</b> demande à rejoindre la partie</span><button type="button" class="is-ok" data-ol-join-ans="1">Accepter</button><button type="button" data-ol-join-ans="0">Refuser</button></div>`);
    if(isHost&&t.takeoverRequest)out.push(`<div class="bpt-ol-req"><span><b>${fn(t.takeoverRequest.name)}</b> demande à reprendre l’organisation</span><button type="button" class="is-ok" data-ol-take-ans="1">Accepter</button><button type="button" data-ol-take-ans="0">Refuser</button></div>`);
    if(!isHost&&t.takeoverRequest?.name===me()){const left=Math.max(0,Math.ceil((TAKEOVER_MS-(srvNow()-Number(t.takeoverRequest.at||0)))/1000));
      out.push(`<div class="bpt-ol-req is-info"><span>Demande de reprise envoyée${left?` · réponse attendue (<b data-ol-take-left="${t.takeoverRequest.at}">${left}</b> s)`:" · pas de réponse"}</span>${left?"":`<button type="button" class="is-ok" data-ol-take>Forcer la reprise</button>`}</div>`);}
    if(t.lastJoin&&srvNow()-Number(t.lastJoin.at||0)<8000&&t.lastJoin.name!==me())out.push(`<div class="bpt-ol-req is-info"><span><b>${fn(t.lastJoin.name)}</b> rejoint la partie à la prochaine main</span></div>`);
    return out.join("");
  }
  /* Chrono (hôte) : ±1 min, pause/reprise, niveau précédent/suivant. On décale l'heure de départ, les durées restent intactes. */
  async function clockCmd(id,cmd){
    await tx(id,t=>{
      if(t.status!=="running"||t.host!==me())return false;
      const now=srvNow(),L=levelAt(t),lv=t.levels||[],dur=k=>Math.max(60,Number(lv[k]?.durationSec)||Number(t.levelSeconds)||600);
      const shift=ms=>{t.startedAt=Number(t.startedAt)+ms;};
      if(cmd==="pause"){if(t.pausedAt)return false;t.pausedAt=now;}
      else if(cmd==="resume"){if(!t.pausedAt)return false;shift(now-Number(t.pausedAt));t.pausedAt=null;if(t.hand)t.hand.actionAt=now;}
      else if(cmd==="plus")shift(60000);
      else if(cmd==="minus")shift(-Math.min(60000,L.left*1000));
      else if(cmd==="next"){if(L.index>=lv.length-1)return false;shift(-L.left*1000);}
      else if(cmd==="prev"){if(L.index<1)return false;shift((dur(L.index)-L.left+dur(L.index-1))*1000);}
      else return false;
      t.levelIndex=levelAt(t).index;
    });
  }
  async function comeBack(id){await tx(id,t=>{const s=mySeat(t);if(!s)return false;t.seats[s.i].away=false;t.seats[s.i].timeouts=0;});}
  async function showMyCards(id,no){
    await tx(id,t=>{const h=t.hand,i=mySeat(t)?.i;if(!h||h.no!==no||h.street!=="done"||h.showdown||i===undefined||h.shown?.[K(i)])return false;
      if(!(h.result||[]).some(r=>(r.winners||[]).includes(i)))return false;
      h.shown={...(h.shown||{}),[K(i)]:true};h.shownAt=srvNow();h.last={i,txt:`${firstName(t,i)} montre ses cartes`};logAct(h);});
  }
  async function nextHand(id){await tx(id,t=>{if(t.status!=="running"||t.hand?.street!=="done")return false;dealHand(t);});}

  /* Automatismes, exécutés par l'appareil de l'hôte uniquement : joueurs virtuels (test local), délai de décision
     dépassé, main suivante. Un seul déclenchement par situation. */
  let autoKey="";
  function autopilot(){
    const t=openId&&tables[openId];if(!t||t.status==="waiting")return;
    if(!following()||pilotName(t)!==me())return; // table non suivie : données figées, on laisse piloter un autre joueur
    if(t.status==="finished"&&!t.runningCleared){t.runningCleared=true;setRunning(t.id,false);}
    if(t.hand?.street==="done")logHand(t);
    if(t.status==="finished"){if(!t.publishedToHistory&&!t.publishing&&!t.publishError)publishResult(t.id);return;}
    if(t.status!=="running"||t.pausedAt)return;
    const h=t.hand;if(!h)return;
    const now=srvNow();
    if(h.street==="done"){
      const key=`next:${h.no}`;if(autoKey!==key&&now-Number(h.at||0)>=nextHandMs(h)){autoKey=key;nextHand(t.id);}return;
    }
    if(h.runout){const key=`run:${h.no}:${h.street}`;if(autoKey!==key&&now-Number(h.runoutAt||0)>=RUNOUT_MS){autoKey=key;tx(t.id,x=>runoutStep(x)).then(ok=>{if(!ok)autoKey="";});}return;}
    const i=h.toAct;if(i===null||i===undefined)return;
    const seat=t.seats[i];const key=`${h.no}:${h.street}:${i}:${h.actionAt}`;if(autoKey===key)return;
    // Joueur virtuel (test local) : si sa décision est refusée par les règles, il suit, sinon checke, sinon se couche
    // (avant, une relance refusée bloquait la main : le tour était marqué comme traité sans action).
    if(seat?.bot&&now-Number(h.actionAt||0)>=900){autoKey=key;const d=botDecision(t,i);
      (async()=>{for(const [a,v] of [[d.action,d.amount],["call"],["check"],["fold"]]){if(await act(t.id,a,v,true))return;}autoKey="";})();return;}
    if(seat?.away&&now-Number(h.actionAt||0)>=600){autoKey=key;act(t.id,"away").then(ok=>{if(!ok)autoKey="";});return;}
    if(now-Number(h.actionAt||0)>=TURN_MS){autoKey=key;act(t.id,"timeout").then(ok=>{if(!ok)autoKey="";});}
  }
  // Joueur virtuel prudent : parole ou mise légère, suit les petites mises, se couche face aux grosses.
  function botDecision(t,i){
    const h=t.hand,toCall=Math.max(0,h.currentBet-betOf(h,i)),stack=stackOf(t,i),bb=Number(t.levels?.[h.level]?.bb)||50;
    const pot=Object.values(h.contrib||{}).reduce((a,x)=>a+(Number(x)||0),0),r=Math.random();
    if(!toCall)return r<0.18?{action:"raise",amount:Math.max(bb,Math.round(pot/2))}:{action:"check"};
    if(toCall<=Math.max(bb*3,stack*0.08))return r<0.1?{action:"raise",amount:h.currentBet+Math.max(h.minRaise,bb)}:{action:"call"};
    return r<0.25?{action:"call"}:{action:"fold"};
  }

  /* ---------- Lot 4 : relais de l'hôte, classement final, enregistrement au championnat ---------- */
  // Présence : chaque appareil qui regarde la table signale sa présence toutes les 10 s (bpt/online/tables/{id}/seen),
  // seulement s il la suit vraiment (appli au premier plan et écran de la table ouvert). Dès qu il la quitte (WhatsApp,
  // autre onglet, écran verrouillé), sa présence est retirée : un autre joueur pilote aussitôt les automatismes.
  const SEEN_MS=25000;
  const seenKey=name=>String(name||"").replace(/[.#$\[\]\/]/g,"_");
  const seenRecently=(t,name)=>srvNow()-Number(t.seen?.[seenKey(name)]||0)<SEEN_MS;
  // Pilote des automatismes : l'hôte s'il est présent, sinon le premier joueur présent (ordre des places).
  function pilotName(t){
    if(!t.seen||seenRecently(t,t.host))return t.host;
    const c=seatsOf(t).filter(s=>!s.bot).sort((a,b)=>a.i-b.i).find(s=>seenRecently(t,s.name));
    return c?c.name:t.host;
  }
  let lastBeat=0,beatId=null;
  const following=()=>listening&&!document.hidden;
  async function heartbeat(){
    const t=openId&&tables[openId];
    if(!t||t.status==="waiting"||!me()||!following()){if(beatId)releasePresence();return;}
    if(beatId===t.id&&srvNow()-lastBeat<10000)return;lastBeat=srvNow();beatId=t.id;
    try{const r=(await db()).ref(`${ROOT}/${t.id}/seen/${seenKey(me())}`);await r.set(srvNow());r.onDisconnect().remove();}catch(_e){}
  }
  async function releasePresence(){
    const id=beatId;beatId=null;lastBeat=0;if(!id||!me())return;
    try{const r=(await db()).ref(`${ROOT}/${id}/seen/${seenKey(me())}`);await r.remove();r.onDisconnect().cancel();}catch(_e){}
  }
  document.addEventListener("visibilitychange",()=>{try{heartbeat();}catch(_e){}});
  window.addEventListener("pagehide",()=>{if(beatId)releasePresence();});
  function finalRanking(t){
    const out=Object.values(t.out||{}).filter(Boolean);
    return [...(t.winner?[{name:t.winner,place:1,by:"",hand:null}]:[]),...out].sort((a,b)=>a.place-b.place);
  }
  // Lignes d'historique : même format et même circuit que le Live (validation, points, publication).
  function championshipRows(t,{unranked=false,gameNo=null}={}){
    const g=new Function("return typeof db!==\"undefined\"?db:null")();
    const ranking=finalRanking(t),n=ranking.length,kills={};
    const no=gameNo??(unranked?null:window.nextGameNo());
    ranking.forEach(r=>{if(r.by)kills[r.by]=(kills[r.by]||0)+1;});
    const start=Number(t.startedAt)||srvNow(),end=Number(t.finishedAt)||srvNow();
    return ranking.map(r=>({
      game:no,date:new Date(start).toISOString().slice(0,10),location:"En ligne",
      player:r.name,place:r.place,killer:r.place===1?"":String(r.by||""),
      outLevel:r.level||null,outTime:r.at?new Date(r.at).toLocaleTimeString("fr-FR"):"",outAt:Number(r.at)||null,
      gameStartedAt:start,gameFinishedAt:end,gameDurationSec:Math.max(0,Math.floor((end-start)/1000)),gameActiveDurationSec:Math.max(0,Math.floor((end-start)/1000)),
      gameTimingSource:"recorded",onlineId:t.id,startStack:Number(t.startStack)||20000,liveTargetHours:Number(t.targetHours)||null,
      // Hors classement : aucun point ni tablier (la partie n'entre jamais dans l'historique du championnat).
      tablier:!unranked&&n>=Number(g?.settings?.tablierMinPlayers||10)&&r.place===1,n,points:unranked?0:window.pointsFor(r.place,n),
      stake:0,gross:0,net:0,kills:kills[r.name]||0,win:r.place===1,podium:r.place<=3,online:true,...(unranked?{unranked:true}:{})
    }));
  }
  /* Fin de partie : partie comptée → historique du championnat (même circuit que le Live) ;
     partie non comptée → liste séparée bpt/online/history/{id}, qui n'entre dans aucun calcul (classement, records…). */
  const HIST_ROOT="bpt/online/history";
  let publishing=false;
  async function publishResult(id){
    if(publishing)return;publishing=true;
    try{
      const claimed=await tx(id,t=>{
        if(t.status!=="finished"||t.publishedToHistory)return false;
        if(t.publishing&&srvNow()-Number(t.publishing.at||0)<60000)return false;
        t.publishing={by:me(),at:srvNow()};t.publishError=null;
      });
      if(!claimed)return;
      const t=tables[id];
      try{
        if(t.countsForChampionship){
          if(typeof window.persistCompletedGame!=="function")throw new Error("enregistrement indisponible sur cet appareil");
          const rows=championshipRows(t),err=window.validateCompletedGameRows(rows);
          if(err)throw new Error(err);
          await window.persistCompletedGame(rows,{showSummary:false});
          await tx(id,x=>{x.publishedToHistory=true;x.historyGameNo=Number(rows[0]?.game)||null;x.publishing=null;});
        }else{
          const rows=championshipRows(t,{unranked:true});
          await (await db()).ref(`${HIST_ROOT}/${id}`).set({id,at:Number(t.finishedAt)||srvNow(),name:t.name,rows});
          await tx(id,x=>{x.publishedToHistory=true;x.unrankedSaved=true;x.publishing=null;});
        }
      }catch(e){
        await tx(id,x=>{x.publishing=null;x.publishError=String(e?.message||e).slice(0,200);});
      }
    }finally{publishing=false;}
  }
  // Bilan de fin de partie, comme pour le Live : affiché une fois à chaque joueur quand la partie est enregistrée.
  // Fin de partie : la dernière main (combinaison gagnante) reste affichée jusqu'à ce que le joueur touche « Voir le bilan ».
  const finalSeen=new Set();
  const lastHandShowing=t=>t?.status==="finished"&&!!t.hand?.showdown&&!finalSeen.has(t.id);
  function maybeShowSummary(t){
    if(lastHandShowing(t))return;
    if(!t||t.status!=="finished"||!t.publishedToHistory||typeof window.showEndGameSummary!=="function")return;
    if(!mySeat(t))return;
    const key="bpt_ol_summary_"+t.id;
    try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,"1");}catch(_e){}
    const rows=t.unrankedSaved?championshipRows(t,{unranked:true}):championshipRows(t,{gameNo:t.historyGameNo});
    setTimeout(()=>window.showEndGameSummary(rows),600);
  }
  /* Parties en ligne hors classement : liste sur l'écran Parties, bilan au toucher, suppression sans effet sur le classement. */
  let unranked={};
  function paintUnranked(){
    const view=$("latestgame");if(!view)return;
    let box=$("bptOnlineUnranked");
    if(!box){box=document.createElement("details");box.id="bptOnlineUnranked";box.className="bpt-ol-unranked";
      const nav=view.querySelector(".lg-nav");nav?nav.after(box):view.prepend(box);
      box.addEventListener("click",async e=>{
        const del=e.target.closest("[data-ol-hist-del]");
        if(del){e.preventDefault();if(!confirm("Supprimer cette partie en ligne hors classement ?\n\nCela ne change rien au classement."))return;
          try{await (await db()).ref(`${HIST_ROOT}/${del.dataset.olHistDel}`).remove();(await db()).ref(`${HANDS_ROOT}/${del.dataset.olHistDel}`).remove().catch(()=>{});(await db()).ref(`${CHATLOG_ROOT}/${del.dataset.olHistDel}`).remove().catch(()=>{});}catch(err){alert("Suppression impossible : "+(err.message||err));}return;}
        const open=e.target.closest("[data-ol-hist]");
        if(open){const g=unranked[open.dataset.olHist];if(g&&Array.isArray(g.rows))window.showEndGameSummary(g.rows);}
      });}
    const list=Object.values(unranked).filter(g=>g&&Array.isArray(g.rows)&&g.rows.length).sort((a,b)=>b.at-a.at);
    box.hidden=!list.length;
    const open=box.open;
    box.innerHTML=`<summary>💻 Parties en ligne hors classement <span>${list.length}</span></summary>
      <div class="bpt-ol-unranked-list">${list.map(g=>{const w=g.rows.find(r=>Number(r.place)===1);
        return `<div class="bpt-ol-unranked-row"><button type="button" data-ol-hist="${esc(g.id)}"><b>${esc(new Date(g.at).toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"}))}</b>
          <span>${g.rows.length} joueurs · 🏆 ${esc(w?.player||"—")}</span></button><button type="button" class="is-del" data-ol-hist-del="${esc(g.id)}" aria-label="Supprimer">🗑</button></div>`;}).join("")}</div>
      <p class="bpt-ol-unranked-note">Ces parties n'entrent ni dans le classement, ni dans les records et statistiques.</p>`;
    box.open=open;
  }
  (async()=>{try{(await db()).ref(HIST_ROOT).on("value",s=>{unranked=s.val()||{};paintUnranked();});}catch(_e){}})();
  function resultsHtml(t){
    const rk=finalRanking(t),kills={};rk.forEach(r=>{if(r.by)kills[r.by]=(kills[r.by]||0)+1;});
    const status=!t.countsForChampionship?(t.unrankedSaved?"Enregistrée dans les parties en ligne · hors classement":t.publishError?`Enregistrement impossible : ${esc(t.publishError)}`:"Enregistrement en cours…")
      :t.publishedToHistory?`Enregistrée au championnat · partie n°${t.historyGameNo||"?"}${rk.length<6?" · pas de points sous 6 joueurs":""}`
      :t.publishError?`Enregistrement au championnat impossible : ${esc(t.publishError)}`
      :"Enregistrement au championnat en cours…";
    return `<div class="bpt-ol-results"><div class="bpt-ol-res-head"><span>🏆</span><div><small>Vainqueur du tournoi</small><b>${esc(t.winner||"—")}</b></div></div>
      <ol class="bpt-ol-res-list">${rk.map(r=>`<li class="${r.place===1?"is-win":""}${r.name===me()?" is-me":""}"><em>${r.place}${r.place===1?"er":"e"}</em><span><b>${esc(r.name)}</b><small>${r.place===1?`${kills[r.name]||0} élimination${(kills[r.name]||0)>1?"s":""}`:`éliminé par ${esc(String(r.by||"?").split(" ")[0])} · main n°${r.hand||"?"}${kills[r.name]?` · ${kills[r.name]} élim.`:""}`}</small></span></li>`).join("")}</ol>
      <p class="bpt-ol-res-status${t.publishError?" is-error":t.publishedToHistory?" is-ok":""}">${status}</p></div>`;
  }

  /* ---------- Historique des mains ----------
     bpt/online/hands/{idTable}/m0001 = {no, at, level, sb, bb, dealer, board, log, players{p<i>:{name, hole, net}}, result[]}.
     Écrit par l appareil pilote à la fin de chaque main (écriture idempotente). Cartes privées : seules celles montrées
     à l abattage sont gardées. Supprimé avec la table ou avec la partie hors classement. */
  const HANDS_ROOT="bpt/online/hands";
  // Historique du chat (messages et objets envoyés), gardé avec la partie ; bpt/online/fx ne sert qu à l animation (2 min).
  const CHATLOG_ROOT="bpt/online/chatlog";
  // Jetons récupérés par un joueur sur la main, jeton indivisible compris (au premier gagnant, comme dans finishHand).
  const wonBack=(h,i)=>(h.result||[]).reduce((a,r)=>{const w=r.winners||[],k=w.indexOf(i);if(k<0)return a;const sh=Math.floor(r.amount/w.length);return a+sh+(k<r.amount-sh*w.length?1:0);},0);
  let loggedHand="";
  function handRecord(t){
    const h=t.hand,lv=t.levels?.[h.level]||{},players={};
    Object.keys(h.hole||{}).map(Number).filter(i=>h.hole[i]&&t.seats?.[i]).forEach(i=>{
      const back=wonBack(h,i);
      players[K(i)]={name:t.seats[i].name,hole:(h.showdown&&!folded(h,i))||h.shown?.[K(i)]?h.hole[i]:"",net:back-(Number(h.contrib?.[K(i)])||0)};});
    return {no:h.no,at:Number(h.at)||srvNow(),level:(Number(h.level)||0)+1,sb:Number(lv.sb)||0,bb:Number(lv.bb)||0,
      dealer:t.seats?.[h.dealer]?.name||"",board:h.board||"",log:h.log||"",showdown:!!h.showdown,players,
      result:(h.result||[]).map(r=>({amount:r.amount,winners:(r.winners||[]).map(i=>t.seats?.[i]?.name||"").join(", "),hand:r.hand||"",cards:r.cards||""}))};
  }
  function logHand(t){
    const key=t.id+":"+t.hand.no+":"+Object.keys(t.hand.shown||{}).join();if(loggedHand===key)return; // réécrite si le gagnant montre ensuite ses cartesloggedHand=key;
    (async()=>{try{await (await db()).ref(`${HANDS_ROOT}/${t.id}/m${String(t.hand.no).padStart(4,"0")}`).set(handRecord(t));}catch(_e){loggedHand="";}})();
  }
  const LOG_STREET={p:"Pré-flop",f:"Flop",t:"Turn",r:"River",d:"Fin"};
  async function showHands(id){
    let box=$("bptOlHands");
    if(!box){box=document.createElement("div");box.id="bptOlHands";document.body.append(box);
      box.addEventListener("click",e=>{if(e.target===box||e.target.closest("[data-hands-close]")){box.hidden=true;return;}
        const tb=e.target.closest("[data-hands-tab]");if(tb){box.dataset.tab=tb.dataset.handsTab;box.querySelectorAll("[data-hands-tab]").forEach(b=>b.classList.toggle("is-on",b===tb));box.querySelectorAll("[data-pane]").forEach(p=>p.hidden=p.dataset.pane!==tb.dataset.handsTab);}});}
    box.hidden=false;box.dataset.tab="hands";box.innerHTML=`<div class="bpt-ol-hands"><div class="bpt-ol-hands-head"><b>📜 Historique</b><button type="button" data-hands-close aria-label="Fermer">×</button></div><p>Chargement…</p></div>`;
    let list=[],chat=[];
    try{const v=(await (await db()).ref(`${HANDS_ROOT}/${id}`).once("value")).val()||{};list=Object.values(v).filter(Boolean).sort((a,b)=>b.no-a.no);}catch(_e){}
    try{const v=(await (await db()).ref(`${CHATLOG_ROOT}/${id}`).once("value")).val()||{};chat=Object.values(v).filter(Boolean).sort((a,b)=>b.at-a.at);}catch(_e){}
    const cards=c=>split(c).map(x=>cardHtml(x)).join("");
    const signed=n=>n>0?`<em class="is-won">+${fmt(n)}</em>`:n<0?`<em class="is-lost">−${fmt(-n)}</em>`:"<em>0</em>";
    const body=list.length?list.map(m=>{
      const r0=m.result?.[0]||{},pot=(m.result||[]).reduce((a,r)=>a+(Number(r.amount)||0),0);
      const steps={};String(m.log||"").split("|").filter(Boolean).forEach(x=>{const k=x[0];(steps[k]=steps[k]||[]).push(x.slice(2));});
      const ps=Object.values(m.players||{}).sort((a,b)=>b.net-a.net);
      return `<details class="bpt-ol-hand"><summary><b>Main ${m.no}</b><span>${esc(String(r0.winners||"—").split(", ").map(n=>n.split(" ")[0]).join(" et "))} · ${fmt(pot)}${r0.hand?" · "+esc(r0.hand):""}</span><small>Niv. ${m.level} · ${fmt(m.sb)}/${fmt(m.bb)} · ${new Date(m.at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</small></summary>
        ${m.board?`<div class="bpt-ol-hand-board">${cards(m.board)}</div>`:""}
        <div class="bpt-ol-hand-players">${ps.map(p=>`<div><span>${esc(p.name)}${p.name===m.dealer?" <i>D</i>":""}</span><span class="bpt-ol-hand-hole">${p.hole?cards(p.hole):""}</span>${signed(Number(p.net)||0)}</div>`).join("")}</div>
        <div class="bpt-ol-hand-log">${Object.keys(LOG_STREET).filter(k=>steps[k]).map(k=>`<div><b>${LOG_STREET[k]}</b><span>${steps[k].map(esc).join(" · ")}</span></div>`).join("")}</div>
      </details>`;}).join(""):"<p>Aucune main enregistrée pour cette partie.</p>";
    const fn=n=>esc(String(n||"").split(" ")[0]);
    const chatBody=chat.length?chat.map(c=>{const it=FX_ITEMS.find(x=>x[0]===c.kind);
      return `<div class="bpt-ol-chat-row"><small>${new Date(c.at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</small><b>${fn(c.from)}${c.to&&c.to!=="all"?` → ${fn(c.to)}`:""}</b><span>${c.kind==="say"?esc(c.text):it?`${it[1]} ${esc(it[2])}`:""}</span></div>`;}).join(""):"<p>Aucun message pour cette partie.</p>";
    const tab=box.dataset.tab==="chat"?"chat":"hands";
    box.querySelector(".bpt-ol-hands").innerHTML=`<div class="bpt-ol-hands-head"><b>📜 Historique</b><button type="button" data-hands-close aria-label="Fermer">×</button></div>
      <div class="bpt-ol-hands-tabs"><button type="button" data-hands-tab="hands" class="${tab==="hands"?"is-on":""}">Mains · ${list.length}</button><button type="button" data-hands-tab="chat" class="${tab==="chat"?"is-on":""}">Chat · ${chat.length}</button></div>
      <div class="bpt-ol-hands-list" data-pane="hands"${tab==="hands"?"":" hidden"}>${body}</div><div class="bpt-ol-hands-list" data-pane="chat"${tab==="chat"?"":" hidden"}>${chatBody}</div>`;
  }

  /* ---------- Chat rapide et objets rigolos ----------
     Stockés à part du jeu (bpt/online/fx/{idTable}/{envoi}) pour ne pas redessiner la table à chaque envoi :
     {from, to:"all"|nom, kind:"say"|objet, text, at}. Effacés après 2 minutes. */
  const FX_ROOT="bpt/online/fx";
  const FX_ITEMS=[["beer","🍺","Bière"],["kiss","😘","Bisous"],["poop","💩","Caca"],["rose","🌹","Rose"],["tomato","🍅","Tomate"],
    ["clap","👏","Bravo"],["fish","🐟","Poisson"],["fire","🔥","En feu"],["clown","🤡","Clown"],["money","💰","Jackpot"]];
  const FX_QUICK=["Bien joué !","Joli coup 👌","Allez !","Pas de chance…","Tu bluffes ? 🤔","Je te suis 😎","On accélère ? ⏱","GG 🤝"];
  const FX_KEEP_MS=120000, FX_GAP_MS=1500;
  let fxRef=null,fxTable=null,fxSince=0,fxSeen=new Set(),fxTarget="all",fxLastSend=0,fxOpen=false;
  function fxLayer(){let l=$("bptOlFxLayer");if(!l){l=document.createElement("div");l.id="bptOlFxLayer";document.body.append(l);}return l;}
  async function fxListen(){
    const want=($("online")?.classList.contains("active")&&openId&&tables[openId]&&tables[openId].status!=="waiting")?openId:null;
    if(want===fxTable)return;
    if(fxRef){fxRef.off();fxRef=null;}
    fxTable=want;if(!want){fxClose();return;}
    fxSince=srvNow();fxSeen=new Set();
    try{
      fxRef=(await db()).ref(`${FX_ROOT}/${want}`).limitToLast(30);
      fxRef.on("value",snap=>{
        const all=snap.val()||{};
        Object.entries(all).sort((a,b)=>Number(a[1]?.at||0)-Number(b[1]?.at||0)).forEach(([k,e])=>{
          if(!e||fxSeen.has(k))return;fxSeen.add(k);
          if(Number(e.at||0)<fxSince-1500)return; // envois antérieurs à l'ouverture : ignorés
          playFx(e);
        });
      });
    }catch(_e){}
  }
  async function sendFx(kind,text){
    const t=openId&&tables[openId];if(!t||!me())return;
    if(srvNow()-fxLastSend<FX_GAP_MS)return;fxLastSend=srvNow();
    const entry={from:me(),to:kind==="say"?"all":fxTarget,kind,at:srvNow()};
    if(kind==="say")entry.text=String(text||"").trim().slice(0,60);
    if(kind==="say"&&!entry.text)return;
    try{
      const r=(await db()).ref(`${FX_ROOT}/${t.id}`);await r.push(entry);
      (await db()).ref(`${CHATLOG_ROOT}/${t.id}`).push(entry).catch?.(()=>{});
      // Ménage : chacun efface les envois de plus de 2 minutes qu'il voit passer.
      r.once&&r.once("value").then(s=>{const v=s.val()||{};Object.entries(v).forEach(([k,e])=>{if(srvNow()-Number(e?.at||0)>FX_KEEP_MS)r.child(k).remove();});}).catch(()=>{});
    }catch(e){alert("Envoi impossible : "+(e.message||e));}
    fxClose();
  }
  function plateOf(name){
    const seat=[...document.querySelectorAll("#bptOnlineBody .bpt-ol-seat[data-name]")].find(el=>el.dataset.name===name);
    return seat?.querySelector(".bpt-ol-plate")||seat||null;
  }
  function centerOf(el,fallback){
    if(!el){const st=document.querySelector("#bptOnlineBody .bpt-ol-stage")?.getBoundingClientRect();
      return fallback==="bottom"&&st?{x:st.left+st.width/2,y:st.bottom}:st?{x:st.left+st.width/2,y:st.top+st.height/2}:{x:innerWidth/2,y:innerHeight/2};}
    const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};
  }
  function playFx(e){
    const t=openId&&tables[openId];if(!t)return;
    const layer=fxLayer(),reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(e.kind==="say"){
      const from=centerOf(plateOf(e.from),"bottom");
      const b=document.createElement("div");b.className="bpt-ol-bubble";b.textContent=e.text||"";
      b.style.left=from.x+"px";b.style.top=from.y+"px";layer.append(b);
      const who=document.createElement("small");who.textContent=String(e.from||"").split(" ")[0];b.prepend(who);
      setTimeout(()=>b.classList.add("is-out"),3800);setTimeout(()=>b.remove(),4400);return;
    }
    const item=FX_ITEMS.find(x=>x[0]===e.kind);if(!item)return;
    const targets=e.to==="all"?seatsOf(t).map(s=>s.name).filter(n=>n!==e.from):[e.to];
    const from=centerOf(plateOf(e.from),"bottom");
    targets.forEach((name,k)=>{
      const to=centerOf(plateOf(name));
      const el=document.createElement("span");el.className="bpt-ol-throw";el.textContent=item[1];layer.append(el);
      const dx=to.x-from.x,dy=to.y-from.y,lift=Math.min(160,Math.hypot(dx,dy)*0.35);
      const done=()=>{el.remove();impact(to,item[1]);};
      if(reduce||!el.animate){el.style.left=to.x+"px";el.style.top=to.y+"px";setTimeout(done,300);return;}
      el.style.left=from.x+"px";el.style.top=from.y+"px";
      const anim=el.animate([
        {transform:"translate(-50%,-50%) scale(.6) rotate(0deg)",opacity:0},
        {transform:`translate(calc(-50% + ${dx*0.5}px),calc(-50% + ${dy*0.5-lift}px)) scale(1.25) rotate(200deg)`,opacity:1,offset:.5},
        {transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(1) rotate(360deg)`,opacity:1}
      ],{duration:900,delay:k*90,easing:"cubic-bezier(.3,.1,.3,1)",fill:"forwards"});
      anim.onfinish=done;
    });
  }
  function impact(p,emoji){
    const layer=fxLayer();
    const big=document.createElement("span");big.className="bpt-ol-impact";big.textContent=emoji;big.style.left=p.x+"px";big.style.top=p.y+"px";layer.append(big);
    for(let k=0;k<5;k++){const s=document.createElement("span");s.className="bpt-ol-spark";s.textContent=emoji;s.style.left=p.x+"px";s.style.top=p.y+"px";
      const a=(Math.PI*2*k)/5+Math.random()*.6,d=34+Math.random()*26;s.style.setProperty("--sx",Math.cos(a)*d+"px");s.style.setProperty("--sy",Math.sin(a)*d+"px");layer.append(s);setTimeout(()=>s.remove(),900);}
    setTimeout(()=>big.remove(),1700);
  }
  function fxPanelHtml(){
    const t=openId&&tables[openId];if(!t)return "";
    const others=seatsOf(t).filter(s=>s.name!==me());
    if(fxTarget!=="all"&&!others.some(s=>s.name===fxTarget))fxTarget="all";
    return `<div class="bpt-ol-fx-head"><b>Ambiance</b><button type="button" data-fx-close aria-label="Fermer">×</button></div>
      <div class="bpt-ol-fx-sec">Envoyer à</div>
      <div class="bpt-ol-fx-targets"><button type="button" data-fx-target="all" class="${fxTarget==="all"?"is-on":""}">Tout le monde</button>${others.map(s=>`<button type="button" data-fx-target="${esc(s.name)}" class="${fxTarget===s.name?"is-on":""}">${esc(s.name.split(" ")[0])}</button>`).join("")}</div>
      <div class="bpt-ol-fx-items">${FX_ITEMS.map(([k,e,l])=>`<button type="button" data-fx-item="${k}" title="${l}"><span>${e}</span><small>${l}</small></button>`).join("")}</div>
      <div class="bpt-ol-fx-sec">Message rapide (à toute la table)</div>
      <div class="bpt-ol-fx-quick">${FX_QUICK.map(q=>`<button type="button" data-fx-say="${esc(q)}">${esc(q)}</button>`).join("")}</div>
      <form class="bpt-ol-fx-free" data-fx-form><input maxlength="60" placeholder="Votre message…" data-fx-text><button type="submit">Envoyer</button></form>
      <button type="button" class="bpt-ol-fx-hands" data-fx-hands>📜 Historique des mains et du chat</button>`;
  }
  function fxPanel(){let p=$("bptOlFxPanel");if(!p){p=document.createElement("div");p.id="bptOlFxPanel";p.hidden=true;document.body.append(p);
      p.addEventListener("click",e=>{const g=s=>e.target.closest(s);let el;
        if(g("[data-fx-close]")){fxClose();return;}
        if(g("[data-fx-hands]")){const id=openId;fxClose();if(id)showHands(id);return;}
        if((el=g("[data-fx-target]"))){fxTarget=el.dataset.fxTarget;p.innerHTML=fxPanelHtml();return;}
        if((el=g("[data-fx-item]"))){sendFx(el.dataset.fxItem);return;}
        if((el=g("[data-fx-say]"))){sendFx("say",el.dataset.fxSay);return;}});
      p.addEventListener("submit",e=>{e.preventDefault();const i=p.querySelector("[data-fx-text]");sendFx("say",i?.value);});}
    return p;}
  function fxOpenPanel(target){const p=fxPanel();if(target)fxTarget=target;p.innerHTML=fxPanelHtml();p.hidden=false;fxOpen=true;}
  function fxClose(){const p=$("bptOlFxPanel");if(p)p.hidden=true;fxOpen=false;}
  const SUIT={s:"♠",h:"♥",d:"♦",c:"♣"};
  function cardHtml(c,cls=""){
    if(!c)return `<span class="bpt-card is-empty${cls}"></span>`;
    const r=c[0]==="T"?"10":c[0];
    return `<span class="bpt-card${"hd".includes(c[1])?" is-red":""}${cls}"><b>${r}</b><i>${SUIT[c[1]]||""}</i></span>`;
  }
  const backHtml=(cls="")=>`<span class="bpt-card is-back${cls}"></span>`;
  const STREET={preflop:"Pré-flop",flop:"Flop",turn:"Turn",river:"River",done:"Fin de la main"};


  /* ---------- Affichage ---------- */
  function lobbyHtml(){
    const list=Object.values(tables).filter(t=>t&&t.status!=="finished"&&srvNow()-Number(t.createdAt||0)<MAX_AGE_MS).sort((a,b)=>b.createdAt-a.createdAt);
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
  let raiseTo=0, raiseKey="", raiseMode=false, clockMenuOpen=false;
  function tableHtml(t){
    const seats=seatsOf(t),mine=mySeat(t),isHost=t.host===me(),running=t.status==="running";
    // Spectateur : partie lancée (ou terminée) sans y être assis → aucune action, seulement quitter.
    const spectator=!mine&&t.status!=="waiting";
    // En attente : durée des niveaux recalculée à chaque arrivée/départ (même calcul qu'au lancement).
    const preview=t.status==="waiting"?structure(Math.max(2,seats.length),Number(t.targetHours)||2,Number(t.startStack)||20000):null;
    const levelsShown=preview?preview.levels:t.levels;
    const L=running?levelAt(t):{index:0,left:0},lv=levelsShown?.[L.index]||{};
    const h=(running||t.status==="finished")?t.hand:null,board=split(h?.board),done=h?.street==="done";
    const N=Math.max(1,seats.length);
    const winners=new Set(done?(h.result?.[0]?.winners||[]):[]);
    const compact=seats.length>=8&&window.matchMedia?.("(orientation:portrait) and (max-width:600px)").matches;
    const runoutPlayers=h?.runout&&!done?handPlayers(t).filter(i=>!folded(h,i)):[];
    const eq=runoutPlayers.length>1?equities(h,runoutPlayers):{};
    // Tapis en grosses blindes (arrondi à l'entier) : niveau de la main en cours, sinon niveau affiché.
    const bbNow=Number(t.levels?.[h&&!done?h.level:L.index]?.bb)||0;
    // La table « tourne » : le joueur connecté est toujours en bas, les autres dans l'ordre de jeu autour de lui.
    const meIdx=Math.max(0,seats.findIndex(x=>x.name===me()));
    const ring=seats.map((s,idx)=>{
      const pos=(idx-meIdx+N)%N, a=Math.PI/2+pos*2*Math.PI/N, x=50+47*Math.cos(a), y=50+46*Math.sin(a);
      const isMe=s.name===me(), out=!!t.out?.[K(s.i)]&&Number(s.stack)<=0;
      const hole=split(h?.hole?.[s.i]), fold=h&&folded(h,s.i), allin=h&&h.allin?.[K(s.i)]&&!done;
      const show=isMe||(done&&h.showdown&&!fold)||(done&&!!h.shown?.[K(s.i)])||(h?.runout&&!done&&!fold);
      // Couché : on continue de voir ses propres cartes (grisées) ; celles des autres disparaissent.
      const cards=hole.length&&(!fold||isMe)?`<div class="bpt-ol-cards${isMe?" is-mine":""}${fold?" is-folded":""}">${hole.map(c=>show?cardHtml(c):backHtml()).join("")}</div>`:"";
      const bet=h&&!done?betOf(h,s.i):0;
      // Gain net : récupéré − misé. Un pot où l'on est seul (excédent de tapis non suivi) n'est qu'un remboursement.
      const back=done?wonBack(h,s.i):0;
      const net=done?back-(Number(h?.contrib?.[K(s.i)])||0):0,won=Math.max(0,net),lost=Math.max(0,-net);
      // Fin de main : résultat net de chaque joueur qui a misé (+ en vert, − en rouge).
      // Table chargée en portrait : le résultat de la main va dans la plaque (pas la place pour un jeton à côté).
      const inPlate=done&&compact&&(won||lost);
      const chips=inPlate?"":bet?`<em class="bpt-ol-bet">${fmt(bet)}</em>`:won?`<em class="bpt-ol-bet is-won">+${fmt(won)}</em>`:lost?`<em class="bpt-ol-bet is-lost">−${fmt(lost)}</em>`:"";
      const turn=h&&!done&&h.toAct===s.i;
      const tag=out?'<i class="is-out">éliminé</i>':s.away?'<i class="is-away">absent</i>':allin?'<i class="is-allin">TAPIS</i>':fold?'<i>couché</i>':"";
      const badge=!h||done?"":h.dealer===s.i?'<em class="bpt-ol-dealer">D</em>':"";
      const timer=turn?`<span class="bpt-ol-timer"><span data-ol-turn style="width:${Math.max(0,100-100*(srvNow()-Number(h.actionAt||0))/TURN_MS).toFixed(0)}%"></span></span>`:"";
      return `<div class="bpt-ol-seat${isMe?" is-me":""}${turn?" is-turn":""}${allin?" is-allin":""}${winners.has(s.i)?" is-winner":""}${fold?" is-folded":""}${out?" is-out":""}" data-name="${esc(s.name)}" data-pos="${pos}" data-n="${N}" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%">
        <div class="bpt-ol-plate">${isMe?"":`<b>${esc(s.name.split(" ")[0])}</b>`}<span>${out?"—":fmt(s.stack)}</span>${inPlate?`<em class="bpt-ol-plate-res ${won?"is-won":"is-lost"}">${won?"+"+fmt(won):"−"+fmt(lost)}</em>`:eq[s.i]!==undefined?`<em class="bpt-ol-equity${eq[s.i]>=0.5?" is-fav":""}">${Math.round(eq[s.i]*100)} %</em>`:!out&&bbNow?`<small class="bpt-ol-bb">${fmt(Math.round(Number(s.stack||0)/bbNow))} BB</small>`:""}${timer}</div>${tag}${cards}${badge}${chips}</div>`;
    }).join("");
    // Pot : tout ce qui a été misé pendant la main, moins les mises encore devant les joueurs.
    const potTotal=h?Object.values(h.contrib||{}).reduce((a,x)=>a+(Number(x)||0),0):0;
    const onTable=h&&!done?Object.values(h.bets||{}).reduce((a,x)=>a+(Number(x)||0),0):0;
    // Pots annexes : seulement quand un joueur est à tapis (sinon les mises en cours ne créent pas de pot séparé).
    const pots=h&&!done&&Object.keys(h.allin||{}).length?buildPots(t):[];
    const potLine=h?(done?(h.result||[]).map((r,k)=>`${k?"Pot annexe":"Pot"} ${fmt(r.amount)} → ${r.winners.map(i=>esc(firstName(t,i))).join(" / ")}`).join(" · ")
      :`Pot ${fmt(potTotal)}${pots.length>1?` <small>(${pots.length-1} pot${pots.length>2?"s":""} annexe${pots.length>2?"s":""})</small>`:""}`):"";
    const actions=[];
    if(t.status==="waiting"){
      if(mine)actions.push(`<button type="button" data-ol-leave>Me retirer</button>`);
      else if(seats.length<MAX_PLAYERS)actions.push(`<button type="button" class="bpt-ol-primary" data-ol-join>Rejoindre la table</button>`);
      actions.push(`<button type="button" data-ol-hide>Quitter</button>`);
      if(isHost&&seats.length<MAX_PLAYERS)actions.push(`<button type="button" data-ol-bots>${isLocalTest()?"+ 3 virtuels (test)":"🤖 + Virtuel"}</button>`);
      if(isHost&&seats.some(s=>s.bot))actions.push(`<button type="button" data-ol-bot-del>🤖 − Virtuel</button>`);
      if(isHost)actions.push(`<button type="button" class="bpt-ol-primary" data-ol-start${seats.length<2?" disabled":""}>Lancer · ${seats.length} joueur${seats.length>1?"s":""}</button>`);
    }
    if(isHost&&done&&running)actions.push(`<button type="button" class="bpt-ol-primary" data-ol-next>Main suivante →</button>`);
    // Gagnant sans abattage (tous les autres couchés) : il peut montrer ses cartes s il le souhaite.
    const myI=mySeat(t)?.i;
    if(done&&!h.showdown&&myI!==undefined&&(h.result||[]).some(r=>(r.winners||[]).includes(myI))&&!h.shown?.[K(myI)]&&h.hole?.[myI])actions.push(`<button type="button" data-ol-show>👁 Montrer mes cartes</button>`);
    if(lastHandShowing(t))actions.push(`<button type="button" class="bpt-ol-primary" data-ol-final>Voir le bilan →</button>`);
    else if(t.status==="finished"&&!spectator)actions.push(`<button type="button" class="bpt-ol-primary" data-ol-live>Retour au Live</button>`);
    if(spectator&&running){
      if(t.joinRequest?.name===me())actions.push(`<button type="button" disabled>Demande envoyée…</button>`);
      else if(seats.length<MAX_PLAYERS)actions.push(`<button type="button" class="bpt-ol-primary" data-ol-join-req>Demander à rejoindre</button>`);
    }
    if(spectator)actions.push(`<button type="button" data-ol-quit>Quitter</button>`);
    // Barre d'actions du joueur dont c'est le tour, en deux temps :
    // 1) Se coucher · Check/Suivre · Relancer   2) après « Relancer » : ✕ · Double · Triple · Pot · Tapis, curseur exponentiel et validation.
    let myBar="";
    if(h&&!done&&mine&&h.toAct===mine.i){
      const i=mine.i,toCall=Math.max(0,h.currentBet-betOf(h,i)),stack=stackOf(t,i),maxTotal=betOf(h,i)+stack;
      const minTo=Math.min(maxTotal,h.currentBet+Math.max(h.minRaise,Number(lv.bb)||50)),pot=potTotal+toCall;
      const key=`${h.no}:${h.street}:${h.actionAt}`;if(raiseKey!==key){raiseKey=key;raiseTo=minTo;raiseMode=false;}
      raiseTo=Math.max(minTo,Math.min(maxTotal,raiseTo));
      const canRaise=maxTotal>h.currentBet, verb=h.currentBet?"Relancer":"Miser";
      if(!raiseMode||!canRaise){
        myBar=`<div class="bpt-ol-mybar is-step1">
          <button type="button" class="is-fold" data-ol-act="fold">Se coucher</button>
          ${toCall?`<button type="button" class="is-call" data-ol-act="call">${toCall>=stack?"Suivre à tapis":"Suivre "+fmt(toCall)}</button>`:`<button type="button" class="is-call" data-ol-act="check">Check</button>`}
          ${canRaise?(maxTotal<=minTo?`<button type="button" class="is-raise" data-ol-act="allin">Tapis ${fmt(maxTotal)}</button>`:`<button type="button" class="is-raise" data-ol-raise-open>${verb}</button>`):""}
        </div>`;
      }else{
        // Raccourcis, arrondis à la petite blinde :
        // Mêmes raccourcis pour miser et relancer : x2 · x3 (mise précédente, ou grosse blinde si personne n'a misé),
        // ⅓ pot · ½ pot (mise à suivre + part du pot après avoir suivi), Tapis.
        const sbStep=Math.max(1,Number(lv.sb)||25),bbv=Number(lv.bb)||50,ref=h.currentBet||bbv;
        // Raccourcis sous le curseur : x2 · x3 (mise précédente, ou grosse blinde) · ½ pot · Pot · All in.
        const clamp=v=>Math.max(minTo,Math.min(maxTotal,Math.round(v/sbStep)*sbStep));
        const presets=[["x2",clamp(ref*2)],["x3",clamp(ref*3)],["½ pot",clamp(h.currentBet+pot/2)],["Pot",clamp(h.currentBet+pot)],["All in",maxTotal]]
          .map(([l,v])=>`<button type="button" class="${v===raiseTo?"is-on":""}" data-ol-preset="${v}">${l}</button>`).join("");
        // Curseur exponentiel : précis sur les petites mises, rapide vers le tapis.
        const span=Math.max(1,maxTotal/minTo);
        const toPos=a=>maxTotal<=minTo?1000:Math.round(1000*Math.log(Math.max(minTo,a)/minTo)/Math.log(span));
        // Uniquement un curseur exponentiel vertical sur la droite de l'écran (minimum en bas, tapis en haut),
        // avec ✕ pour annuler et le bouton de validation : la table garde toute sa taille.
        myBar=`<div class="bpt-ol-mybar is-step2"><div class="bpt-ol-side">
          <button type="button" class="is-cancel" data-ol-raise-close aria-label="Ne pas ${verb.toLowerCase()}">✕</button>
          <small>Tapis</small>
          <input type="range" class="is-vertical" data-ol-range min="0" max="1000" step="1" value="${toPos(raiseTo)}" data-min="${minTo}" data-max="${maxTotal}" data-step="${sbStep}" aria-label="Montant">
          <small>Min</small>
          <div class="bpt-ol-side-presets">${presets}</div>
          <button type="button" class="is-raise" data-ol-act="raise">${raiseTo>=maxTotal?"Tapis "+fmt(maxTotal):verb+(h.currentBet?" à ":" ")+fmt(raiseTo)}</button>
        </div></div>`;
      }
    }
    // Abattage : la combinaison gagnante (cartes du joueur + tableau) sort au centre, carte par carte, avec le nom de la main.
    let showcase="";
    if(done&&h.showdown&&h.result?.[0]?.cards){
      const r0=h.result[0],w=r0.winners[0],mineCards=new Set(split(h.hole?.[w]));
      // Rangement lisible : d'abord les cartes groupées (carré, brelan, paires), puis par hauteur.
      const raw=split(r0.cards),n=c=>raw.filter(x=>x[0]===c[0]).length;
      const five=raw.sort((a,b)=>n(b)-n(a)||RV(b)-RV(a));
      // Animation jouée une seule fois par main : si la table est redessinée, les cartes restent en place.
      const skey=`${t.id}:${h.no}`,still=shownShowcase===skey;shownShowcase=skey;
      showcase=`<div class="bpt-ol-showcase${still?" is-static":""}" aria-live="polite"><div class="bpt-ol-show-title"><b>${r0.winners.map(i=>esc(firstName(t,i))).join(" et ")}</b> ${r0.winners.length>1?"partagent":"gagne"} avec ${esc(HAND_PHRASE[r0.hand]||String(r0.hand||"").toLowerCase())}</div>
        <div class="bpt-ol-show-cards">${five.map((c,k)=>`<span class="bpt-ol-show-slot${mineCards.has(c)?" is-hole":""}" style="--k:${k}">${cardHtml(c," is-show")}</span>`).join("")}</div></div>`;
    }
    let waitInfo="";
    if(preview){const endIdx=endIndexFor(preview.levels,Math.max(2,seats.length)*(Number(t.startStack)||20000)),end=preview.levels[endIdx]||{};
      const hh=Number(t.targetHours)||2,dur=hh>=1?`${Math.floor(hh)} h${hh%1?" "+String(Math.round(hh%1*60)).padStart(2,"0"):""}`:`${Math.round(hh*60)} min`;
      // Réglages modifiables par l'organisateur tant que la partie n'est pas lancée.
      const hoursOpts=[...(document.getElementById("live3TargetHours")?.options||[])].map(o=>[Number(o.value),o.textContent]);
      const opts=(hoursOpts.length?hoursOpts:[[1,"1 h 00"],[2,"2 h 00"],[3,"3 h 00"],[4,"4 h 00"]]);
      if(!opts.some(([v])=>v===hh))opts.push([hh,dur]);
      const edit=isHost?`<div class="bpt-ol-setup">
          <label>Durée<select data-ol-setup="targetHours">${opts.sort((a,b)=>a[0]-b[0]).map(([v,l])=>`<option value="${v}"${v===hh?" selected":""}>${esc(l)}</option>`).join("")}</select></label>
          <label>Tapis<input type="number" min="1000" step="1000" inputmode="numeric" data-ol-setup="startStack" value="${Number(t.startStack)||20000}"></label>
          <label>Structure<select data-ol-setup="adaptive"><option value="1"${t.adaptive?" selected":""}>Adaptatif</option><option value="0"${t.adaptive?"":" selected"}>Classique</option></select></label>
        </div>`:"";
      waitInfo=`<div class="bpt-ol-waitinfo">${edit}<b>Niveaux de ${Math.round(preview.levelSeconds/60)} min</b><span>${seats.length} joueur${seats.length>1?"s":""} · ${fmt(t.startStack)} jetons · durée visée ${dur}</span><span>Fin prévue vers le niveau ${endIdx+1} (blinds ${fmt(end.sb)} / ${fmt(end.bb)})${t.adaptive?" · ajustée en cours de partie":""}</span></div>`;}
    const center=h?`<div class="bpt-ol-board">${[0,1,2,3,4].map(k=>cardHtml(board[k])).join("")}</div><div class="bpt-ol-pot">${potLine}</div>`
      :waitInfo; // blindes affichées seulement dans le bandeau en haut à droite
    const centerSub=t.status==="finished"?`🏆 ${esc(t.winner||"")} remporte le tournoi`
      :t.status==="waiting"?`En attente des joueurs · ${seats.length} inscrit${seats.length>1?"s":""}`
      :"";
    const awayNote=mine&&running&&t.seats?.[mine.i]?.away?`<div class="bpt-ol-req is-away"><span><b>Vous êtes absent</b> · vos mains sont jouées automatiquement (check ou couché), les blindes continuent</span><button type="button" class="is-ok" data-ol-back-in>Revenir</button></div>`:"";
    const specNote=awayNote+(spectator?`<div class="bpt-ol-note is-spectator">👁 Mode spectateur · vous ne jouez pas cette partie${t.joinRefused?.name===me()?" · demande refusée":""}</div>`:"")+requestsHtml(t,isHost,mine);
    const last=h?.last?.txt?`<div class="bpt-ol-note">${esc(h.last.txt)}${done&&running?` · main suivante dans <span data-ol-next-in>${Math.max(1,Math.ceil((nextHandMs(h)-(srvNow()-Number(h.at||0)))/1000))}</span> s`:""}</div>`:"";
    return `<div class="bpt-ol-table${spectator?" is-spectator":""}">
      <div class="bpt-ol-bar">
        <div class="bpt-ol-bar-title"><b>${esc(t.name)}</b><small>${t.countsForChampionship?"Compte au championnat":"Hors championnat"} · ${t.adaptive?"Adaptatif":"Classique"}</small></div>
        ${isHost&&t.status==="waiting"?`<label class="bpt-ol-check"><input type="checkbox" data-ol-counts${t.countsForChampionship?" checked":""}${hasBots(t)?" disabled title=\"Partie avec joueurs virtuels : hors championnat\"":""}> Championnat</label>`:""}
        ${isHost&&t.status==="waiting"?`<button type="button" class="bpt-ol-bar-del" data-ol-remove title="Supprimer la table" aria-label="Supprimer la table">🗑</button>`:""}
        <div class="bpt-ol-bar-level${running&&(isHost||mine)?" is-clickable":""}${t.pausedAt?" is-paused":""}"${running&&(isHost||mine)?" data-ol-clock-menu role=\"button\" tabindex=\"0\" title=\"Réglages du chrono\"":""}>${t.pausedAt?"<em class=\"bpt-ol-pause\">EN PAUSE</em>":""}<small>Niveau ${L.index+1}${running?` · <span data-ol-clock>${clock(L.left)}</span>`:""} · ${Math.round((Number(lv.durationSec)||Number(preview?.levelSeconds)||Number(t.levelSeconds)||0)/60)} min</small><b>${fmt(lv.sb)} / ${fmt(lv.bb)}</b></div>${t.status!=="waiting"&&!spectator?`<button type="button" class="bpt-ol-fx-btn" data-ol-fx aria-label="Chat et objets">💬</button>`:""}${t.status!=="waiting"?`<button type="button" class="bpt-ol-hist-btn${spectator?" is-alone":""}" data-ol-hist-open aria-label="Historique des mains et du chat" title="Historique des mains et du chat">📜</button>`:""}</div>
      <div class="bpt-ol-stage"><div class="bpt-ol-rail"><div class="bpt-ol-felt">
        <div class="bpt-ol-center"><span class="bpt-ol-logo">♠ BPT</span>${center}<small>${centerSub}</small></div>
      </div></div>${ring}${t.status==="finished"&&!lastHandShowing(t)?resultsHtml(t):showcase}</div>
      ${clockMenuOpen&&running&&!isHost&&mine?`<div class="bpt-ol-clockmenu" role="menu"><button type="button" class="is-wide" data-ol-take>👑 Demander la reprise</button><button type="button" class="is-wide is-plain" data-ol-hide>Masquer la partie</button></div>`:""}${clockMenuOpen&&running&&isHost?`<div class="bpt-ol-clockmenu" role="menu"><button type="button" data-ol-clk="minus">−1 min</button><button type="button" data-ol-clk="plus">+1 min</button><button type="button" class="is-wide" data-ol-clk="${t.pausedAt?"resume":"pause"}">${t.pausedAt?"▶ Reprendre":"⏸ Pause"}</button><button type="button" data-ol-clk="prev">◀ Niveau préc.</button><button type="button" data-ol-clk="next">Niveau suiv. ▶</button><button type="button" class="is-plain" data-ol-hide>Masquer la partie</button><button type="button" class="is-plain is-danger" data-ol-remove>Supprimer la partie</button></div>`:""}${specNote}${last}${myBar}<div class="bpt-ol-actions">${actions.join("")}</div></div>`;
  }
  // Table « stade » (rectangle aux bouts arrondis) : chaque joueur est posé sur le bord, à intervalles réguliers
  // le long du contour, en partant du bas (soi) puis vers la gauche. Recalculé à chaque affichage et redimensionnement.
  function layoutSeats(){
    const stage=document.querySelector("#bptOnlineBody .bpt-ol-stage");if(!stage)return;
    const W=stage.clientWidth,H=stage.clientHeight;if(!W||!H)return;
    // Les plaques sont posées sur le rebord de la table : contour à mi-chemin entre le bord extérieur et le tapis.
    const sr=stage.getBoundingClientRect(),rr=stage.querySelector(".bpt-ol-rail")?.getBoundingClientRect(),fr=stage.querySelector(".bpt-ol-felt")?.getBoundingClientRect();
    const ring=rr&&fr&&rr.width?{l:(rr.left+fr.left)/2-sr.left,t:(rr.top+fr.top)/2-sr.top,r:(rr.right+fr.right)/2-sr.left,b:(rr.bottom+fr.bottom)/2-sr.top}:{l:W*0.03,t:H*0.03,r:W*0.97,b:H*0.97};
    const ox=ring.l,oy=ring.t,w=ring.r-ring.l,h=ring.b-ring.t,r=Math.min(w,h)/2,lx=w-2*r,ly=h-2*r;
    const segs=[["l",lx/2,[ox+w/2,oy+h],[-1,0]],["a",Math.PI*r/2,[ox+r,oy+h-r],[Math.PI/2,Math.PI]],["l",ly,[ox,oy+h-r],[0,-1]],
      ["a",Math.PI*r/2,[ox+r,oy+r],[Math.PI,1.5*Math.PI]],["l",lx,[ox+r,oy],[1,0]],["a",Math.PI*r/2,[ox+w-r,oy+r],[1.5*Math.PI,2*Math.PI]],
      ["l",ly,[ox+w,oy+r],[0,1]],["a",Math.PI*r/2,[ox+w-r,oy+h-r],[0,Math.PI/2]],["l",lx/2,[ox+w-r,oy+h],[-1,0]]];
    const P=segs.reduce((a,x)=>a+x[1],0);
    const at=d=>{for(let i=0;i<segs.length;i++){const [k,len,o,v]=segs[i];if(d<=len||i===segs.length-1){
      if(k==="l")return [o[0]+v[0]*d,o[1]+v[1]*d];const a=v[0]+(v[1]-v[0])*(len?Math.min(1,d/len):0);return [o[0]+r*Math.cos(a),o[1]+r*Math.sin(a)];}d-=len;}return [W/2,H];};
    stage.classList.toggle("is-crowded",H>W&&stage.querySelectorAll(".bpt-ol-seat[data-pos]").length>=8);
    // Obstacles : tableau + pot, plaques de tous les joueurs (complétés au fur et à mesure par les cartes et mises placées).
    const obstacles=[],placing=[];
    stage.querySelectorAll(".bpt-ol-seat[data-pos]").forEach(el=>{const [x,y]=at(P*(Number(el.dataset.pos)||0)/(Number(el.dataset.n)||1));el.style.left=x.toFixed(1)+"px";el.style.top=y.toFixed(1)+"px";});
    stage.querySelectorAll(".bpt-ol-board,.bpt-ol-pot,.bpt-ol-seat .bpt-ol-plate,.bpt-ol-seat.is-me .bpt-ol-cards,.bpt-ol-seat.is-me .bpt-ol-bet").forEach(e=>{const r=e.getBoundingClientRect();if(r.width)obstacles.push(r);});
    stage.querySelectorAll(".bpt-ol-seat[data-pos]").forEach(el=>{const n=Number(el.dataset.n)||1,p=Number(el.dataset.pos)||0;const [x,y]=at(P*p/n);el.style.left=x.toFixed(1)+"px";el.style.top=y.toFixed(1)+"px";
      const dx=W/2-x,dy=H/2-y,len=Math.hypot(dx,dy)||1;
      el.style.setProperty("--dside",dx>=0?"-1":"1"); // côté opposé au centre : le jeton D n'y croise pas les cartes
      // Table verticale (téléphone en portrait) : cartes et mises des joueurs des côtés au-dessus / au-dessous d'eux, pas vers le tableau.
      el.classList.toggle("is-side",H>W&&Math.abs(dx)>Math.abs(dy)*1.2);el.style.setProperty("--tx",(dx/len).toFixed(3));el.style.setProperty("--ty",(dy/len).toFixed(3));
      if(!el.classList.contains("is-me")){
        // Directions essayées pour ce siège : vers le centre, verticale, diagonales (les mises en ont d'autres en plus).
        const sy=dy>=0?1:-1,sx=dx>=0?1:-1,d=Math.SQRT1_2;
        // Direction principale : perpendiculaire au rebord, vers l intérieur (cartes puis mise alignées derrière la plaque).
        const at0=P*p/n,[x1,y1]=at(Math.max(0,at0-2)),[x2,y2]=at(Math.min(P,at0+2)),tl=Math.hypot(x2-x1,y2-y1)||1;let nx=-(y2-y1)/tl,ny=(x2-x1)/tl;if(nx*dx+ny*dy<0){nx=-nx;ny=-ny;}
        const u0=[nx,ny];
        placing.push({el,cands:[u0,[0,sy],[sx*d,sy*d],[sx*d,-sy*d],[0,-sy]],betCands:[u0,[0,sy],[sx*d,sy*d],[sx*d,-sy*d],[0,-sy],[-u0[1],u0[0]],[u0[1],-u0[0]],[-u0[0],-u0[1]],[1,0],[-1,0],[-sx*d,sy*d],[-sx*d,-sy*d]]});
      }});
    // Placement en deux passes : d'abord les cartes de tous les joueurs, puis les mises / résultats. Chaque élément prend
    // la direction qui touche le moins d'obstacles (tableau, pot, plaques, éléments déjà placés, bords de l'écran).
    const view=document.documentElement,vw=view.clientWidth,vh=view.clientHeight;
    // La plaque du joueur lui-même n est pas un obstacle pour ses cartes (elles glissent derrière).
    const cost=(e,own)=>{const r=e.getBoundingClientRect(),skip=own?.getBoundingClientRect();let n=obstacles.filter(o=>!(skip&&o.left===skip.left&&o.top===skip.top)).filter(o=>!(r.right<=o.left||o.right<=r.left||r.bottom<=o.top||o.bottom<=r.top)).length;
      if(r.left<0||r.top<0||r.right>vw||r.bottom>vh)n+=5;return n;};
    const halfOf=(e,[ux,uy])=>e?(Math.abs(ux)*e.offsetWidth+Math.abs(uy)*e.offsetHeight)/2:0;
    const best=(e,cands,set,own)=>{let pick=cands[0],low=Infinity;for(const c of cands){set(c);const n=cost(e,own);if(n<low){low=n;pick=c;}if(!n)break;}set(pick);obstacles.push(e.getBoundingClientRect());return pick;};
    const dirOf=new Map();
    placing.forEach(({el,cands})=>{const plate=el.querySelector(".bpt-ol-plate"),cards=el.querySelector(".bpt-ol-cards");if(!cards)return;
      // Cartes collées à la plaque, côté centre, glissées un peu derrière elle (plaque + cartes = un seul bloc).
      const tuck=cards.querySelector(".bpt-card:not(.is-back)")?0:6;
      dirOf.set(el,best(cards,cands,u=>{const dc=halfOf(plate,u)-tuck+halfOf(cards,u);el.style.setProperty("--cx",(u[0]*dc).toFixed(1)+"px");el.style.setProperty("--cy",(u[1]*dc).toFixed(1)+"px");},plate));});
    placing.forEach(({el,betCands})=>{const plate=el.querySelector(".bpt-ol-plate"),cards=el.querySelector(".bpt-ol-cards"),bet=el.querySelector(".bpt-ol-bet");if(!bet)return;
      const cu=dirOf.get(el);
      // Première idée : derrière les cartes (même direction) ; sinon à côté de la plaque dans une autre direction.
      // Ordre essayé : derrière les cartes (vers le centre), puis à côté des cartes, puis autour de la plaque.
      const opts=[...(cu?[{u:cu,behind:true},{u:cu,side:1},{u:cu,side:-1}]:[]),...betCands.map(u=>({u,behind:false}))];
      let pick=opts[0],low=Infinity;
      const set=({u,behind,side})=>{let bx,by;
        if(side&&cards){const dc=halfOf(plate,u)-10+halfOf(cards,u),tg=[-u[1]*side,u[0]*side],ds=halfOf(cards,tg)+6+halfOf(bet,tg);bx=u[0]*dc+tg[0]*ds;by=u[1]*dc+tg[1]*ds;}
        else{const db=(behind&&cards?halfOf(plate,u)-10+2*halfOf(cards,u):halfOf(plate,u))+6+halfOf(bet,u);bx=u[0]*db;by=u[1]*db;}
        el.style.setProperty("--bx",bx.toFixed(1)+"px");el.style.setProperty("--by",by.toFixed(1)+"px");};
      for(const o of opts){set(o);const n=cost(bet);if(n<low){low=n;pick=o;}if(!n)break;}
      set(pick);obstacles.push(bet.getBoundingClientRect());});
    // Jeton D des autres joueurs : quatre coins autour de la plaque, le premier libre et visible.
    placing.forEach(({el})=>{const dl=el.querySelector(".bpt-ol-dealer");if(!dl)return;
      best(dl,[[-1,-20],[1,-20],[-1,20],[1,20],[0,-44],[0,44],[-1.45,0],[1.45,0]],([sd,dy])=>{el.style.setProperty("--dside",String(sd));el.style.setProperty("--ddy",dy+"px");});});
  }
  window.addEventListener("resize",()=>requestAnimationFrame(layoutSeats));
  const clock=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");};
  let shownLevel=-1;
  setInterval(()=>{
    const t=openId&&tables[openId];if(!t||t.status!=="running"||!$("online")?.classList.contains("active"))return;
    const L=levelAt(t);if(L.index!==shownLevel){shownLevel=L.index;render();return;}
    const el=document.querySelector("#bptOnlineBody [data-ol-clock]");if(el)el.textContent=clock(L.left);
    const nx=document.querySelector("#bptOnlineBody [data-ol-next-in]");if(nx&&t.hand)nx.textContent=Math.max(1,Math.ceil((nextHandMs(t.hand)-(srvNow()-Number(t.hand.at||0)))/1000));
    // Compte à rebours de la demande de reprise : à zéro, on redessine pour proposer « Forcer la reprise ».
    const tl=document.querySelector("#bptOnlineBody [data-ol-take-left]");if(tl){const left=Math.ceil((TAKEOVER_MS-(srvNow()-Number(tl.dataset.olTakeLeft)))/1000);if(left<=0)render();else tl.textContent=left;}
    const bar=document.querySelector("#bptOnlineBody [data-ol-turn]");if(bar&&t.hand)bar.style.width=Math.max(0,100-100*(srvNow()-Number(t.hand.actionAt||0))/TURN_MS).toFixed(0)+"%";
  },1000);
  setInterval(()=>{try{heartbeat();autopilot();}catch(e){console.warn("BPT en ligne :",e);}},400);
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
    if(t)maybeShowSummary(t);
    if(t)layoutSeats(); // placement immédiat : aucune image affichée avant que cartes et mises soient placées
    fxListen();
    if(fxOpen&&!t)fxClose();
  }

  /* ---------- Écoute ---------- */
  async function listen(on){
    if(on===listening)return;listening=on;
    try{
      const r=await db();
      if(on){ref=r.ref(ROOT);ref.on("value",snap=>{tables=snap.val()||{};Object.keys(tables).forEach(k=>seen.add(k));
        // Les signaux de présence (seen) changent toutes les 10 s : ils ne doivent pas redessiner la table (ni relancer les animations).
        const sig=JSON.stringify(Object.values(tables).map(t=>t&&{...t,seen:null}));
        if(sig!==lastSig){lastSig=sig;render();}
        document.dispatchEvent(new CustomEvent("bpt-online-tables"));});}
      else if(ref){ref.off();ref=null;document.documentElement.classList.remove("bpt-online-open");}
    }catch(e){const box=$("bptOnlineBody");if(box)box.innerHTML=`<div class="bpt-ol-card"><p>Connexion impossible : ${esc(e.message||e)}</p></div>`;}
  }
  function install(){
    const view=$("online");if(!view)return;
    const live=$("live3");let liveWas=false;
    // Partie en ligne en cours (et pas de Live classique actif) : l'onglet Live ouvre directement la table,
    // en joueur si l'on y est assis, sinon en spectateur.
    const redirectLive=()=>{const on=!!live?.classList.contains("active");if(on&&!liveWas&&runningIds.length&&verified.get(runningIds[0])==="running"&&!$("live3NavBtn")?.classList.contains("live3-active"))setTimeout(()=>window.bptOnline.open(runningIds[0]),0);liveWas=on;};
    const watch=()=>{redirectLive();listen(view.classList.contains("active")||!!live?.classList.contains("active"));if(!view.classList.contains("active")){document.documentElement.classList.remove("bpt-online-open");fxListen();}else render();};
    [view,live].filter(Boolean).forEach(el=>new MutationObserver(watch).observe(el,{attributes:true,attributeFilter:["class"]}));
    view.addEventListener("click",e=>{
      const g=s=>e.target.closest(s);let el;
      if((el=g("[data-ol-open]"))){openId=el.dataset.olOpen;render();return;}
      if(g("[data-ol-back]")){const sp=tables[openId]&&!mySeat(tables[openId])&&tables[openId].status!=="waiting";openId=null;if(sp&&window.showView){window.showView("dashboard");return;}render();return;}
      if(g("[data-ol-live]")){window.showView&&window.showView("live3");return;}
      if(g("[data-ol-join]")){join(openId);return;}
      if(g("[data-ol-bots]")){addBots(openId,isLocalTest()?3:1);return;}
      if(g("[data-ol-bot-del]")){removeBot(openId);return;}
      if(g("[data-ol-leave]")){leave(openId);return;}
      if(g("[data-ol-start]")){start(openId);return;}
      if((el=g("[data-ol-act]"))){const a=el.dataset.olAct;act(openId,a,a==="raise"?raiseTo:0);return;}
      if((el=g("[data-ol-preset]"))){raiseTo=Number(el.dataset.olPreset)||raiseTo;render();return;}
      if(g("[data-ol-join-req]")){requestJoin(openId);return;}
      if((el=g("[data-ol-join-ans]"))){answerJoin(openId,el.dataset.olJoinAns==="1");return;}
      if((el=g("[data-ol-take-ans]"))){answerTakeover(openId,el.dataset.olTakeAns==="1");return;}
      if(g("[data-ol-take]")){clockMenuOpen=false;requestTakeover(openId);return;}
      if(g("[data-ol-clock-menu]")){clockMenuOpen=!clockMenuOpen;render();return;}
      if((el=g("[data-ol-clk]"))){clockCmd(openId,el.dataset.olClk);return;}
      if(clockMenuOpen&&!g(".bpt-ol-clockmenu")){clockMenuOpen=false;render();}
      if(g("[data-ol-raise-open]")){raiseMode=true;render();return;}
      if(g("[data-ol-raise-close]")){raiseMode=false;render();return;}
      if(g("[data-ol-next]")){nextHand(openId);return;}
      if(g("[data-ol-fx]")){fxOpen?fxClose():fxOpenPanel();return;}
      if(g("[data-ol-hist-open]")){fxClose();showHands(openId);return;}
      if(g("[data-ol-show]")){showMyCards(openId,tables[openId]?.hand?.no);return;}
      if(g("[data-ol-final]")){finalSeen.add(openId);render();return;}
      if(g("[data-ol-back-in]")){comeBack(openId);return;}
      if(g("[data-ol-hide]")){clockMenuOpen=false;openId=null;window.showView&&window.showView("dashboard");return;}
      if(g("[data-ol-quit]")){openId=null;window.showView&&window.showView("dashboard");return;}
      if((el=g(".bpt-ol-seat[data-name]"))&&el.dataset.name!==me()&&tables[openId]?.status!=="waiting"&&mySeat(tables[openId])){fxOpenPanel(el.dataset.name);return;}
      if(g("[data-ol-remove]")){removeTable(openId);return;}
    });
    view.addEventListener("change",e=>{const c=e.target.closest("[data-ol-counts]");if(c)toggleCounts(openId,c.checked);
      const st=e.target.closest("[data-ol-setup]");if(st)setupTable(openId,st.dataset.olSetup,st.value);});
    // Curseur de relance : met à jour le montant affiché sans redessiner toute la table.
    view.addEventListener("input",e=>{const r=e.target.closest("[data-ol-range]");if(!r)return;
      const min=Number(r.dataset.min),max=Number(r.dataset.max),step=Number(r.dataset.step)||1,p=Number(r.value)/1000;
      raiseTo=p>=1?max:Math.max(min,Math.min(max,Math.round(min*Math.pow(max/min,p)/step)*step));
      const b=view.querySelector("[data-ol-act=raise]");if(b){b.textContent=raiseTo>=max?"Tapis "+fmt(max):(b.textContent.startsWith("Miser")?"Miser ":"Relancer à ")+fmt(raiseTo);}
      view.querySelectorAll("[data-ol-preset]").forEach(x=>x.classList.toggle("is-on",Number(x.dataset.olPreset)===raiseTo));});
    watch();
    render();
  }
  // Pastille rouge de l'onglet Live : partie Live (classe posée par le module Live) ou partie en ligne en cours.
  let onlineRunning=0,runningIds=[];
  function paintNavDot(){const b=$("live3NavBtn");if(b)b.classList.toggle("bpt-game-on",b.classList.contains("live3-active")||onlineRunning>0);}
  // Indicateurs vérifiés auprès de la table : une entrée dont la table n'existe plus ou n'est plus dans cet état
  // (partie terminée sans personne pour nettoyer, table supprimée…) est ignorée et retirée par n'importe quel appareil.
  const verified=new Map(); // id → état réel de la table (null = absente)
  let lastIndex={};
  // Revérification toutes les minutes (une partie peut se terminer sans que personne ne retire son indicateur).
  setInterval(async()=>{if(!Object.keys(lastIndex).length)return;verified.clear();try{await checkIndex(await db(),lastIndex);}catch(_e){}},60000);
  async function checkIndex(r,v){
    for(const [id,x] of Object.entries(v)){
      const want=x?.state==="waiting"?"waiting":"running";
      if(verified.has(id))continue;
      try{const st=(await r.ref(`${ROOT}/${id}/status`).once("value")).val();verified.set(id,st||null);
        if(st!==want){await r.ref(`${RUN_ROOT}/${id}`).remove();}}catch(_e){}
    }
  }
  (async()=>{try{const r=await db();r.ref(RUN_ROOT).on("value",snap=>{const v=snap.val()||{};
    // Une entrée change d'état (attente → en cours) : la revérifier.
    Object.entries(v).forEach(([id,x])=>{const want=x?.state==="waiting"?"waiting":"running";if(verified.has(id)&&verified.get(id)!==want&&verified.get(id)!==null)verified.delete(id);});
    lastIndex=v;checkIndex(r,v);
    const ok=(id,x)=>{const want=x?.state==="waiting"?"waiting":"running";return !verified.has(id)||verified.get(id)===want;};
    const fresh=Object.entries(v).filter(([id,x])=>x&&srvNow()-Number(x.at||0)<12*3600*1000&&ok(id,x));
    runningIds=fresh.filter(([,x])=>x.state!=="waiting").map(([id])=>id);onlineRunning=runningIds.length;paintNavDot();document.dispatchEvent(new CustomEvent("bpt-online-tables"));
    waitingTables=fresh.filter(([,x])=>x.state==="waiting").map(([id,x])=>({id,...x}));paintHome();});}catch(_e){}})();
  // Alerte « partie en ligne en préparation » : proposée à ceux qui ne sont pas encore inscrits, une fois par table
  // (fermée = plus proposée), retirée au lancement. Pas affichée sur l'écran de la table elle-même.
  let waitingTables=[];
  const dismissed=()=>{try{return JSON.parse(localStorage.getItem("bpt_ol_dismissed")||"[]");}catch(_e){return [];}};
  function paintHome(){
    let box=$("bptOnlineInvite");
    if(!box){box=document.createElement("div");box.id="bptOnlineInvite";box.className="bpt-ol-invite";box.hidden=true;document.body.append(box);
      box.addEventListener("click",async e=>{
        const x=e.target.closest("[data-ol-invite-close]");
        if(x){try{localStorage.setItem("bpt_ol_dismissed",JSON.stringify([...dismissed(),x.dataset.olInviteClose].slice(-20)));}catch(_e){}box.hidden=true;return;}
        const b=e.target.closest("[data-ol-invite-join]");if(!b)return;const id=b.dataset.olInviteJoin;box.hidden=true;
        window.bptOnline.open(id);
        for(let k=0;k<30&&!tables[id];k++)await new Promise(r=>setTimeout(r,150));
        if(tables[id]&&!mySeat(tables[id]))join(id);});}
    const who=me(),skip=dismissed();
    const w=who&&!$("online")?.classList.contains("active")?waitingTables.find(x=>!skip.includes(x.id)&&!String(x.players||"").split("|").includes(who)):null;
    if(!w){box.hidden=true;return;}
    const n=Number(w.n)||0,key=w.id+":"+n;
    if(box.dataset.key!==key){box.dataset.key=key;
      box.innerHTML=`<span class="bpt-ol-invite-ico">💻</span><div><b>Partie en ligne</b><small>${esc(w.name||"Table")} · ${n} inscrit${n>1?"s":""}</small></div>
        <button type="button" data-ol-invite-join="${esc(w.id)}">Rejoindre</button><button type="button" class="is-close" data-ol-invite-close="${esc(w.id)}" aria-label="Ignorer">✕</button>`;}
    box.hidden=false;
  }
  setInterval(paintHome,2000);
  setInterval(paintNavDot,2000);
  // API utilisée par l'étape 1 du Live (bpt-live-mobilefirst.js).
  function openTables(){return Object.values(tables).filter(t=>t&&t.status!=="finished"&&srvNow()-Number(t.createdAt||0)<MAX_AGE_MS).sort((a,b)=>b.createdAt-a.createdAt);}
  window.bptOnline={
    openTables,
    me,
    active(){const w=waitingTables[0];if(w)return {id:w.id,state:"waiting"};return runningIds[0]?{id:runningIds[0],state:"running"}:null;},
    pilot(id){const t=tables[id];return t?pilotName(t):null;},
    showHands, // diagnostic : qui pilote les automatismes
    open(id){openId=id||null;window.showView&&window.showView("online");render();},
    async create(form){await createTable(form);window.showView&&window.showView("online");render();}
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);else install();
})();
