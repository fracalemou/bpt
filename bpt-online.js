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

  function me(){try{return String(localStorage.getItem(IDENTITY_KEY)||"").trim();}catch(_e){return "";}}
  async function db(){
    if(typeof window.bptFirebaseEnsure!=="function")throw new Error("Firebase indisponible");
    const {rtdb}=await window.bptFirebaseEnsure();return rtdb;
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
    if(endIdx<=idx)return; // déjà dans la zone de fin
    const targetSec=Math.max(1800,(Number(t.targetHours)||2)*3600),elapsed=(Date.now()-Number(t.startedAt))/1000;
    const curDur=Math.max(60,Number(lv[idx].durationSec)||600);
    let scheduleLeft=L.left;for(let i=idx+1;i<=endIdx;i++)scheduleLeft+=Math.max(60,Number(lv[i]?.durationSec)||curDur);
    const levelProgress=Math.max(0,(idx+1-L.left/curDur)/(endIdx+1));
    const expectedRemaining=N-(N-1)*Math.pow(Math.min(1,levelProgress),4.5);
    const weight=Math.max(0,Math.min(1,(levelProgress-.55)/.30));
    const correction=Math.max(-2700,Math.min(2700,(remaining-expectedRemaining)*0.8*8*60*weight));
    const delta=elapsed+scheduleLeft+correction-targetSec;
    if(Math.abs(delta)<180)return;
    const nextMin=Math.max(1,Math.round((Number(lv[idx+1]?.durationSec)||curDur)/60));
    const ideal=(targetSec-elapsed-L.left-correction)/(endIdx-idx)/60;
    const min=Math.max(3,Math.min(40,Math.round(Math.max(nextMin*.7,Math.min(nextMin*1.3,ideal)))));
    if(min===nextMin)return;
    for(let i=idx+1;i<lv.length;i++)lv[i].durationSec=min*60;
    t.lastAdapt={level:idx+1,from:nextMin,to:min,at:Date.now()};
  }

  /* ---------- Écritures ---------- */
  // Une seule partie en ligne à la fois : partie en préparation ou en cours (index léger, entrées de moins de 12 h).
  async function activeTable(){
    try{const snap=await (await db()).ref(RUN_ROOT).once("value");const v=snap.val()||{};
      const e=Object.entries(v).find(([,x])=>x&&Date.now()-Number(x.at||0)<12*3600*1000);return e?{id:e[0],...e[1]}:null;}catch(_e){return null;}
  }
  async function createTable(form){
    const name=me();if(!name){alert("Identifiez-vous d'abord (Paramètres › Mon profil).");return;}
    const busy=await activeTable();
    if(busy){alert(busy.state==="waiting"?"Une partie en ligne est déjà en préparation : rejoignez-la.":"Une partie en ligne est déjà en cours.");openId=busy.id;render();return;}
    const maxSeats=MAX_PLAYERS;
    const startStack=Math.max(1000,Number(form.startStack)||20000);
    const targetHours=Math.max(0.5,Number(form.targetHours)||2);
    const st=structure(2,targetHours,startStack); // recalculée au lancement avec le nombre réel de joueurs
    const id="t"+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    const table={id,name:String(form.title||"").trim()||"Partie en ligne",host:name,createdAt:Date.now(),status:"waiting",
      countsForChampionship:!!form.counts,adaptive:form.adaptive!==false,maxSeats,startStack,targetHours,levelSeconds:st.levelSeconds,levels:st.levels,levelIndex:0,
      seats:{0:{name,stack:startStack,joinedAt:Date.now()}}};
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
      t.seats[i]={name,stack:Number(t.startStack)||20000,joinedAt:Date.now()};
    });
    if(!ok)alert("Table complète (10 joueurs) ou partie déjà commencée.");else setTimeout(()=>setWaiting(id),300);
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
    setTimeout(()=>setWaiting(id),300);
  }
  async function leave(id){
    const name=me();
    await tx(id,t=>{if(t.status!=="waiting")return false;Object.keys(t.seats||{}).forEach(k=>{if(t.seats[k]?.name===name)delete t.seats[k];});});
    setTimeout(()=>setWaiting(id),300);
  }
  async function setRunning(id,on){try{const r=(await db()).ref(`${RUN_ROOT}/${id}`);on?await r.set({state:"running",at:Date.now()}):await r.remove();}catch(_e){}}
  // Tables en préparation : nom, hôte et nombre d'inscrits dans l'index léger (encart « Rejoindre » de l'accueil).
  async function setWaiting(id){try{const t=tables[id];if(!t||t.status!=="waiting")return;
    await (await db()).ref(`${RUN_ROOT}/${id}`).set({state:"waiting",name:t.name,host:t.host,n:seatsOf(t).length,players:seatsOf(t).map(x=>x.name).join("|"),at:Date.now()});}catch(_e){}}
  async function start(id){
    // Lancement : tirage au sort des places et structure calculée sur le nombre réel de joueurs.
    const started=await tx(id,t=>{
      const players=seatsOf(t);
      if(t.status!=="waiting"||t.host!==me()||players.length<2)return false;
      for(let i=players.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[players[i],players[j]]=[players[j],players[i]];}
      t.seats={};players.forEach((p,i)=>{t.seats[i]={name:p.name,stack:Number(t.startStack)||20000,joinedAt:p.joinedAt||Date.now(),...(p.bot?{bot:true}:{})};});
      const st=structure(players.length,Number(t.targetHours)||2,Number(t.startStack)||20000);
      t.levels=st.levels;t.levelSeconds=st.levelSeconds;t.maxSeats=players.length;
      t.status="running";t.startedAt=Date.now();t.levelIndex=0;t.hand=null;
      dealHand(t);
    });
    if(started)setRunning(id,true);
  }
  async function removeTable(id){
    if(!confirm("Supprimer cette table ?"))return;
    await (await db()).ref(`${ROOT}/${id}`).remove();
    try{await (await db()).ref(`${RUN_ROOT}/${id}`).remove();}catch(_e){}openId=null;render();
  }
  async function toggleCounts(id,val){await tx(id,t=>{if(t.host!==me()||t.status!=="waiting")return false;t.countsForChampionship=!!val;});}

  /* ---------- Donne et enchères (lots 2 et 3) ----------
     t.hand = {no, level, sb:i, bb:i, dealer:i, deck, hole:{i:"Ah,Kd"}, board, street, at,
               bets:{p<i>:montant de ce tour}, contrib:{p<i>:total de la main}, folded:{p<i>:true}, allin:{p<i>:true},
               acted:{p<i>:true}, currentBet, minRaise, toAct:i, actionAt, last:{i,txt}, result:[{amount,winners,hand}], showdown}
     Clés « p<i> » (et non numériques) : Firebase transformerait sinon ces objets en tableaux.
     street : preflop → flop → turn → river → done. Mode confiance : le paquet est dans la base. */
  const RANKS="23456789TJQKA",SUITS="shdc";
  const K=i=>"p"+i;
  const TURN_MS=45000;
  // Délai avant la main suivante : plus long après un abattage pour laisser voir les cartes de chacun.
  const nextHandMs=h=>h?.showdown?12000:6000;
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
  function levelAt(t,now=Date.now()){
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
    t.status="finished";t.finishedAt=Date.now();t.winner=list.length?t.seats[list[0]].name:null;
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
    t.hand={no:(Number(t.hand?.no)||0)+1,level,dealer,sb,bb,deck:deck.join(","),hole,board:"",street:"preflop",at:Date.now(),
      bets:{},contrib:{},folded:{},allin:{},acted:{},currentBet:Number(lv.bb)||50,minRaise:Number(lv.bb)||50,result:null,showdown:false};
    t.levelIndex=level;
    try{adaptLevels(t);}catch(_e){}
    commit(t,sb,Number(lv.sb)||25);commit(t,bb,Number(lv.bb)||50);
    t.hand.last={i:bb,txt:`Blindes ${fmt(lv.sb)} / ${fmt(lv.bb)}`};
    t.hand.toAct=nextToAct(t,bb);t.hand.actionAt=Date.now();
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
    // Tour suivant (une carte brûlée avant chaque tirage) ; si plus personne ne peut miser, le tableau se déroule jusqu'à la river.
    const deck=split(h.deck),board=split(h.board);
    const draw=n=>{deck.shift();for(let k=0;k<n;k++)board.push(deck.shift());};
    do{
      if(h.street==="river"){h.deck=deck.join(",");h.board=board.join(",");finishHand(t,true);return;}
      if(h.street==="preflop"){draw(3);h.street="flop";}else if(h.street==="flop"){draw(1);h.street="turn";}else{draw(1);h.street="river";}
      h.bets={};h.currentBet=0;h.minRaise=Number(t.levels?.[h.level]?.bb)||50;h.acted={};
    }while(handPlayers(t).filter(i=>canAct(t,i)).length<2);
    h.deck=deck.join(",");h.board=board.join(",");
    h.toAct=nextToAct(t,h.dealer);h.actionAt=Date.now();
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
    h.showdown=!!showdown;h.street="done";h.toAct=null;h.at=Date.now();h.bets={};
    // Éliminations : si plusieurs joueurs sortent sur la même main, le plus gros tapis de départ prend la meilleure place.
    // Éliminateur : gagnant du pot le plus élevé auquel le joueur participait.
    t.out=t.out||{};const still=inPlay(t).length;
    const busted=list.filter(i=>stackOf(t,i)===0&&!t.out[K(i)]).sort((a,b)=>(Number(h.contrib?.[K(b)])||0)-(Number(h.contrib?.[K(a)])||0));
    busted.forEach((i,k)=>{
      const pot=[...h.result].reverse().find(r=>(r.elig||[]).includes(i)&&r.winners.length)||h.result[0];
      const by=pot?.winners?.find(w=>stackOf(t,w)>0);
      t.out[K(i)]={name:t.seats[i].name,place:still+1+k,hand:h.no,by:by!==undefined?t.seats[by].name:null,level:(Number(h.level)||0)+1,at:Date.now()};
    });
    if(still<2)finishTournament(t);
    const w0=h.result[0]?.winners||[];
    h.last={i:w0[0],txt:w0.length?`${w0.map(i=>firstName(t,i)).join(" et ")} remporte${w0.length>1?"nt":""} ${fmt(h.result.reduce((a,r)=>a+r.amount,0))}${h.result[0]?.hand?` · ${h.result[0].hand}`:""}`:""};
  }

  /* Actions d'un joueur (ou d'un joueur virtuel piloté par l'appareil de l'hôte en test local). */
  async function act(id,action,amount,asBot=false){return tx(id,t=>applyAction(t,action,amount,asBot));}
  // Règle d'une action, sans accès à la base (testable seule). Renvoie false si l'action est refusée.
  function applyAction(t,action,amount,asBot=false){
    {
      const h=t.hand;if(t.status!=="running"||!h||h.street==="done"||t.pausedAt)return false;
      const i=h.toAct,seat=t.seats?.[i];if(seat===undefined||seat===null||i===null)return false;
      if(asBot?!(seat.bot&&pilotName(t)===me()):seat.name!==me()){
        if(!(action==="timeout"&&pilotName(t)===me()&&Date.now()-Number(h.actionAt||0)>=TURN_MS))return false;
      }
      const toCall=Math.max(0,h.currentBet-betOf(h,i)),stack=stackOf(t,i),name=firstName(t,i);
      h.acted=h.acted||{};h.folded=h.folded||{};
      if(action==="timeout")action=toCall?"fold":"check";
      if(action==="fold"){h.folded[K(i)]=true;h.last={i,txt:`${name} se couche`};}
      else if(action==="check"){if(toCall)return false;h.last={i,txt:`${name} checke`};}
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
      h.acted[K(i)]=true;
      h.toAct=nextToAct(t,i);h.actionAt=Date.now();
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
      t.joinRequest={name,at:Date.now()};if(t.joinRefused?.name===name)t.joinRefused=null;
    });
    if(!ok)alert("Impossible pour l’instant : une autre demande est en attente ou la table est complète.");
  }
  async function answerJoin(id,accept){
    await tx(id,t=>{
      const r=t.joinRequest;if(!r||t.host!==me())return false;
      t.joinRequest=null;
      if(!accept){t.joinRefused={name:r.name,at:Date.now()};return;}
      if(seatsOf(t).some(s=>s.name===r.name)||seatsOf(t).length>=MAX_PLAYERS)return;
      let i=0;while(t.seats[i]&&t.seats[i].name)i++;
      t.seats[i]={name:r.name,stack:Number(t.startStack)||20000,joinedAt:Date.now(),late:true};
      t.lastJoin={name:r.name,at:Date.now()};
    });
  }
  async function requestTakeover(id){
    const name=me();if(!name)return;
    const t0=tables[id];
    if(t0?.takeoverRequest?.name===name){ // demande déjà envoyée : reprise forcée possible après 30 s
      const left=Math.ceil((TAKEOVER_MS-(Date.now()-Number(t0.takeoverRequest.at||0)))/1000);
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
      t.takeoverRequest={name,at:Date.now()};
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
    if(!isHost&&t.takeoverRequest?.name===me()){const left=Math.max(0,Math.ceil((TAKEOVER_MS-(Date.now()-Number(t.takeoverRequest.at||0)))/1000));
      out.push(`<div class="bpt-ol-req is-info"><span>Demande de reprise envoyée${left?` · réponse attendue (<b data-ol-take-left="${t.takeoverRequest.at}">${left}</b> s)`:" · pas de réponse"}</span>${left?"":`<button type="button" class="is-ok" data-ol-take>Forcer la reprise</button>`}</div>`);}
    if(t.lastJoin&&Date.now()-Number(t.lastJoin.at||0)<8000&&t.lastJoin.name!==me())out.push(`<div class="bpt-ol-req is-info"><span><b>${fn(t.lastJoin.name)}</b> rejoint la partie à la prochaine main</span></div>`);
    return out.join("");
  }
  /* Chrono (hôte) : ±1 min, pause/reprise, niveau précédent/suivant. On décale l'heure de départ, les durées restent intactes. */
  async function clockCmd(id,cmd){
    await tx(id,t=>{
      if(t.status!=="running"||t.host!==me())return false;
      const now=Date.now(),L=levelAt(t),lv=t.levels||[],dur=k=>Math.max(60,Number(lv[k]?.durationSec)||Number(t.levelSeconds)||600);
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
  async function nextHand(id){await tx(id,t=>{if(t.status!=="running"||t.hand?.street!=="done")return false;dealHand(t);});}

  /* Automatismes, exécutés par l'appareil de l'hôte uniquement : joueurs virtuels (test local), délai de décision
     dépassé, main suivante. Un seul déclenchement par situation. */
  let autoKey="";
  function autopilot(){
    const t=openId&&tables[openId];if(!t||t.status==="waiting")return;
    if(pilotName(t)!==me())return;
    if(t.status==="finished"&&!t.runningCleared){t.runningCleared=true;setRunning(t.id,false);}
    if(t.status==="finished"){if(!t.publishedToHistory&&!t.publishing&&!t.publishError)publishResult(t.id);return;}
    if(t.status!=="running"||t.pausedAt)return;
    const h=t.hand;if(!h)return;
    const now=Date.now();
    if(h.street==="done"){
      const key=`next:${h.no}`;if(autoKey!==key&&now-Number(h.at||0)>=nextHandMs(h)){autoKey=key;nextHand(t.id);}return;
    }
    const i=h.toAct;if(i===null||i===undefined)return;
    const seat=t.seats[i];const key=`${h.no}:${h.street}:${i}:${h.actionAt}`;if(autoKey===key)return;
    if(seat?.bot&&isLocalTest()&&now-Number(h.actionAt||0)>=900){autoKey=key;const d=botDecision(t,i);act(t.id,d.action,d.amount,true);return;}
    if(now-Number(h.actionAt||0)>=TURN_MS){autoKey=key;act(t.id,"timeout");}
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
  // Présence : chaque appareil qui regarde la table signale sa présence toutes les 10 s (bpt/online/tables/{id}/seen).
  const SEEN_MS=25000;
  const seenKey=name=>String(name||"").replace(/[.#$\[\]\/]/g,"_");
  const seenRecently=(t,name)=>Date.now()-Number(t.seen?.[seenKey(name)]||0)<SEEN_MS;
  // Pilote des automatismes : l'hôte s'il est présent, sinon le premier joueur présent (ordre des places).
  function pilotName(t){
    if(!t.seen||seenRecently(t,t.host))return t.host;
    const c=seatsOf(t).filter(s=>!s.bot).sort((a,b)=>a.i-b.i).find(s=>seenRecently(t,s.name));
    return c?c.name:t.host;
  }
  let lastBeat=0;
  async function heartbeat(){
    const t=openId&&tables[openId];if(!t||t.status==="waiting"||!me())return;
    if(Date.now()-lastBeat<10000)return;lastBeat=Date.now();
    try{await (await db()).ref(`${ROOT}/${t.id}/seen/${seenKey(me())}`).set(Date.now());}catch(_e){}
  }
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
    const start=Number(t.startedAt)||Date.now(),end=Number(t.finishedAt)||Date.now();
    return ranking.map(r=>({
      game:no,date:new Date(start).toISOString().slice(0,10),location:"En ligne",
      player:r.name,place:r.place,killer:r.place===1?"":String(r.by||""),
      outLevel:r.level||null,outTime:r.at?new Date(r.at).toLocaleTimeString("fr-FR"):"",outAt:Number(r.at)||null,
      gameStartedAt:start,gameFinishedAt:end,gameDurationSec:Math.max(0,Math.floor((end-start)/1000)),gameActiveDurationSec:Math.max(0,Math.floor((end-start)/1000)),
      gameTimingSource:"recorded",startStack:Number(t.startStack)||20000,liveTargetHours:Number(t.targetHours)||null,
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
        if(t.publishing&&Date.now()-Number(t.publishing.at||0)<60000)return false;
        t.publishing={by:me(),at:Date.now()};t.publishError=null;
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
          await (await db()).ref(`${HIST_ROOT}/${id}`).set({id,at:Number(t.finishedAt)||Date.now(),name:t.name,rows});
          await tx(id,x=>{x.publishedToHistory=true;x.unrankedSaved=true;x.publishing=null;});
        }
      }catch(e){
        await tx(id,x=>{x.publishing=null;x.publishError=String(e?.message||e).slice(0,200);});
      }
    }finally{publishing=false;}
  }
  // Bilan de fin de partie, comme pour le Live : affiché une fois à chaque joueur quand la partie est enregistrée.
  function maybeShowSummary(t){
    if(!t||t.status!=="finished"||!t.publishedToHistory||typeof window.showEndGameSummary!=="function")return;
    if(!mySeat(t))return;
    const key="bpt_ol_summary_"+t.id;
    try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,"1");}catch(_e){}
    const rows=t.unrankedSaved?championshipRows(t,{unranked:true}):championshipRows(t,{gameNo:t.historyGameNo});
    setTimeout(()=>window.showEndGameSummary(rows),1500);
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
          try{await (await db()).ref(`${HIST_ROOT}/${del.dataset.olHistDel}`).remove();}catch(err){alert("Suppression impossible : "+(err.message||err));}return;}
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
    fxSince=Date.now();fxSeen=new Set();
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
    if(Date.now()-fxLastSend<FX_GAP_MS)return;fxLastSend=Date.now();
    const entry={from:me(),to:kind==="say"?"all":fxTarget,kind,at:Date.now()};
    if(kind==="say")entry.text=String(text||"").trim().slice(0,60);
    if(kind==="say"&&!entry.text)return;
    try{
      const r=(await db()).ref(`${FX_ROOT}/${t.id}`);await r.push(entry);
      // Ménage : chacun efface les envois de plus de 2 minutes qu'il voit passer.
      r.once&&r.once("value").then(s=>{const v=s.val()||{};Object.entries(v).forEach(([k,e])=>{if(Date.now()-Number(e?.at||0)>FX_KEEP_MS)r.child(k).remove();});}).catch(()=>{});
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
      <form class="bpt-ol-fx-free" data-fx-form><input maxlength="60" placeholder="Votre message…" data-fx-text><button type="submit">Envoyer</button></form>`;
  }
  function fxPanel(){let p=$("bptOlFxPanel");if(!p){p=document.createElement("div");p.id="bptOlFxPanel";p.hidden=true;document.body.append(p);
      p.addEventListener("click",e=>{const g=s=>e.target.closest(s);let el;
        if(g("[data-fx-close]")){fxClose();return;}
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
    // Tapis en grosses blindes (arrondi à l'entier) : niveau de la main en cours, sinon niveau affiché.
    const bbNow=Number(t.levels?.[h&&!done?h.level:L.index]?.bb)||0;
    // La table « tourne » : le joueur connecté est toujours en bas, les autres dans l'ordre de jeu autour de lui.
    const meIdx=Math.max(0,seats.findIndex(x=>x.name===me()));
    const ring=seats.map((s,idx)=>{
      const pos=(idx-meIdx+N)%N, a=Math.PI/2+pos*2*Math.PI/N, x=50+47*Math.cos(a), y=50+46*Math.sin(a);
      const isMe=s.name===me(), out=!!t.out?.[K(s.i)]&&Number(s.stack)<=0;
      const hole=split(h?.hole?.[s.i]), fold=h&&folded(h,s.i), allin=h&&h.allin?.[K(s.i)]&&!done;
      const show=isMe||(done&&h.showdown&&!fold);
      const cards=hole.length&&!fold?`<div class="bpt-ol-cards${isMe?" is-mine":""}">${hole.map(c=>show?cardHtml(c):backHtml()).join("")}</div>`:"";
      const bet=h&&!done?betOf(h,s.i):0;
      const won=done?(h.result||[]).filter(r=>r.winners.includes(s.i)).reduce((a,r)=>a+Math.floor(r.amount/r.winners.length),0):0;
      const chips=bet?`<em class="bpt-ol-bet">${fmt(bet)}</em>`:won?`<em class="bpt-ol-bet is-won">+${fmt(won)}</em>`:"";
      const turn=h&&!done&&h.toAct===s.i;
      const tag=out?'<i class="is-out">éliminé</i>':allin?'<i class="is-allin">TAPIS</i>':fold?'<i>couché</i>':s.bot?'<i>virtuel</i>':"";
      const badge=!h||done?"":h.dealer===s.i?'<em class="bpt-ol-dealer">D</em>':"";
      const timer=turn?`<span class="bpt-ol-timer"><span data-ol-turn style="width:${Math.max(0,100-100*(Date.now()-Number(h.actionAt||0))/TURN_MS).toFixed(0)}%"></span></span>`:"";
      return `<div class="bpt-ol-seat${isMe?" is-me":""}${turn?" is-turn":""}${allin?" is-allin":""}${winners.has(s.i)?" is-winner":""}${fold?" is-folded":""}${out?" is-out":""}" data-name="${esc(s.name)}" data-pos="${pos}" data-n="${N}" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%">
        <div class="bpt-ol-plate">${isMe?"":`<b>${esc(s.name.split(" ")[0])}</b>`}<span>${out?"—":fmt(s.stack)}</span>${!out&&bbNow?`<small class="bpt-ol-bb">${fmt(Math.round(Number(s.stack||0)/bbNow))} BB</small>`:""}${timer}</div>${tag}${cards}${badge}${chips}</div>`;
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
      if(isHost&&isLocalTest()&&seats.length<MAX_PLAYERS)actions.push(`<button type="button" data-ol-bots>+ 3 virtuels (test)</button>`);
      if(isHost)actions.push(`<button type="button" class="bpt-ol-primary" data-ol-start${seats.length<2?" disabled":""}>Lancer · ${seats.length} joueur${seats.length>1?"s":""}</button>`);
    }
    if(isHost&&done&&running)actions.push(`<button type="button" class="bpt-ol-primary" data-ol-next>Main suivante →</button>`);
    if(t.status==="finished"&&!spectator)actions.push(`<button type="button" class="bpt-ol-primary" data-ol-live>Retour au Live</button>`);
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
      waitInfo=`<div class="bpt-ol-waitinfo"><b>Niveaux de ${Math.round(preview.levelSeconds/60)} min</b><span>${seats.length} joueur${seats.length>1?"s":""} · ${fmt(t.startStack)} jetons · durée visée ${dur}</span><span>Fin prévue vers le niveau ${endIdx+1} (blinds ${fmt(end.sb)} / ${fmt(end.bb)})${t.adaptive?" · ajustée en cours de partie":""}</span></div>`;}
    const center=h?`<div class="bpt-ol-board">${[0,1,2,3,4].map(k=>cardHtml(board[k])).join("")}</div><div class="bpt-ol-pot">${potLine}</div>`
      :`<strong>${fmt(lv.sb)} / ${fmt(lv.bb)}</strong>${waitInfo}`;
    const centerSub=t.status==="finished"?`🏆 ${esc(t.winner||"")} remporte le tournoi`
      :t.status==="waiting"?`En attente des joueurs · ${seats.length} inscrit${seats.length>1?"s":""}`
      :"";
    const specNote=(spectator?`<div class="bpt-ol-note is-spectator">👁 Mode spectateur · vous ne jouez pas cette partie${t.joinRefused?.name===me()?" · demande refusée":""}</div>`:"")+requestsHtml(t,isHost,mine);
    const last=h?.last?.txt?`<div class="bpt-ol-note">${esc(h.last.txt)}${done&&running?` · main suivante dans <span data-ol-next-in>${Math.max(1,Math.ceil((nextHandMs(h)-(Date.now()-Number(h.at||0)))/1000))}</span> s`:""}</div>`:"";
    return `<div class="bpt-ol-table${spectator?" is-spectator":""}">
      <div class="bpt-ol-bar"><button type="button" data-ol-back aria-label="Retour aux tables">‹</button>
        <div class="bpt-ol-bar-title"><b>${esc(t.name)}</b><small>${t.countsForChampionship?"Compte au championnat":"Hors championnat"} · ${t.adaptive?"Adaptatif":"Classique"}</small></div>
        ${isHost&&t.status==="waiting"?`<label class="bpt-ol-check"><input type="checkbox" data-ol-counts${t.countsForChampionship?" checked":""}> Championnat</label>`:""}
        ${isHost?`<button type="button" class="bpt-ol-bar-del" data-ol-remove title="Supprimer la table" aria-label="Supprimer la table">🗑</button>`:""}
        <div class="bpt-ol-bar-level${running&&(isHost||mine)?" is-clickable":""}${t.pausedAt?" is-paused":""}"${running&&(isHost||mine)?" data-ol-clock-menu role=\"button\" tabindex=\"0\" title=\"Réglages du chrono\"":""}>${t.pausedAt?"<em class=\"bpt-ol-pause\">EN PAUSE</em>":""}<small>Niveau ${L.index+1}${running?` · <span data-ol-clock>${clock(L.left)}</span>`:""} · ${Math.round((Number(lv.durationSec)||Number(preview?.levelSeconds)||Number(t.levelSeconds)||0)/60)} min</small><b>${fmt(lv.sb)} / ${fmt(lv.bb)}</b></div></div>
      <div class="bpt-ol-stage"><div class="bpt-ol-rail"><div class="bpt-ol-felt">
        <div class="bpt-ol-center"><span class="bpt-ol-logo">♠ BPT</span>${center}<small>${centerSub}</small></div>
      </div></div>${ring}${t.status==="finished"?resultsHtml(t):showcase}${t.status!=="waiting"&&!spectator?`<button type="button" class="bpt-ol-fx-btn" data-ol-fx aria-label="Chat et objets">💬</button>`:""}</div>
      ${clockMenuOpen&&running&&!isHost&&mine?`<div class="bpt-ol-clockmenu" role="menu"><button type="button" class="is-wide" data-ol-take>👑 Demander la reprise</button></div>`:""}${clockMenuOpen&&running&&isHost?`<div class="bpt-ol-clockmenu" role="menu"><button type="button" data-ol-clk="minus">−1 min</button><button type="button" data-ol-clk="plus">+1 min</button><button type="button" class="is-wide" data-ol-clk="${t.pausedAt?"resume":"pause"}">${t.pausedAt?"▶ Reprendre":"⏸ Pause"}</button><button type="button" data-ol-clk="prev">◀ Niveau préc.</button><button type="button" data-ol-clk="next">Niveau suiv. ▶</button></div>`:""}${specNote}${last}${myBar}<div class="bpt-ol-actions">${actions.join("")}</div></div>`;
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
    stage.querySelectorAll(".bpt-ol-seat[data-pos]").forEach(el=>{const n=Number(el.dataset.n)||1,p=Number(el.dataset.pos)||0;const [x,y]=at(P*p/n);el.style.left=x.toFixed(1)+"px";el.style.top=y.toFixed(1)+"px";
      const dx=W/2-x,dy=H/2-y,len=Math.hypot(dx,dy)||1;
      // Table verticale (téléphone en portrait) : cartes et mises des joueurs des côtés au-dessus / au-dessous d'eux, pas vers le tableau.
      el.classList.toggle("is-side",H>W&&Math.abs(dx)>Math.abs(dy)*1.2);el.style.setProperty("--tx",(dx/len).toFixed(3));el.style.setProperty("--ty",(dy/len).toFixed(3));});
  }
  window.addEventListener("resize",()=>requestAnimationFrame(layoutSeats));
  const clock=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");};
  let shownLevel=-1;
  setInterval(()=>{
    const t=openId&&tables[openId];if(!t||t.status!=="running"||!$("online")?.classList.contains("active"))return;
    const L=levelAt(t);if(L.index!==shownLevel){shownLevel=L.index;render();return;}
    const el=document.querySelector("#bptOnlineBody [data-ol-clock]");if(el)el.textContent=clock(L.left);
    const nx=document.querySelector("#bptOnlineBody [data-ol-next-in]");if(nx&&t.hand)nx.textContent=Math.max(1,Math.ceil((nextHandMs(t.hand)-(Date.now()-Number(t.hand.at||0)))/1000));
    // Compte à rebours de la demande de reprise : à zéro, on redessine pour proposer « Forcer la reprise ».
    const tl=document.querySelector("#bptOnlineBody [data-ol-take-left]");if(tl){const left=Math.ceil((TAKEOVER_MS-(Date.now()-Number(tl.dataset.olTakeLeft)))/1000);if(left<=0)render();else tl.textContent=left;}
    const bar=document.querySelector("#bptOnlineBody [data-ol-turn]");if(bar&&t.hand)bar.style.width=Math.max(0,100-100*(Date.now()-Number(t.hand.actionAt||0))/TURN_MS).toFixed(0)+"%";
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
    if(t)requestAnimationFrame(layoutSeats);
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
    const redirectLive=()=>{const on=!!live?.classList.contains("active");if(on&&!liveWas&&runningIds.length&&!$("live3NavBtn")?.classList.contains("live3-active"))setTimeout(()=>window.bptOnline.open(runningIds[0]),0);liveWas=on;};
    const watch=()=>{redirectLive();listen(view.classList.contains("active")||!!live?.classList.contains("active"));if(!view.classList.contains("active")){document.documentElement.classList.remove("bpt-online-open");fxListen();}else render();};
    [view,live].filter(Boolean).forEach(el=>new MutationObserver(watch).observe(el,{attributes:true,attributeFilter:["class"]}));
    view.addEventListener("click",e=>{
      const g=s=>e.target.closest(s);let el;
      if((el=g("[data-ol-open]"))){openId=el.dataset.olOpen;render();return;}
      if(g("[data-ol-back]")){const sp=tables[openId]&&!mySeat(tables[openId])&&tables[openId].status!=="waiting";openId=null;if(sp&&window.showView){window.showView("dashboard");return;}render();return;}
      if(g("[data-ol-live]")){window.showView&&window.showView("live3");return;}
      if(g("[data-ol-join]")){join(openId);return;}
      if(g("[data-ol-bots]")){addBots(openId,3);return;}
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
      if(g("[data-ol-quit]")){openId=null;window.showView&&window.showView("dashboard");return;}
      if((el=g(".bpt-ol-seat[data-name]"))&&el.dataset.name!==me()&&tables[openId]?.status!=="waiting"&&mySeat(tables[openId])){fxOpenPanel(el.dataset.name);return;}
      if(g("[data-ol-remove]")){removeTable(openId);return;}
    });
    view.addEventListener("change",e=>{const c=e.target.closest("[data-ol-counts]");if(c)toggleCounts(openId,c.checked);});
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
  (async()=>{try{const r=await db();r.ref(RUN_ROOT).on("value",snap=>{const v=snap.val()||{};
    const fresh=Object.entries(v).filter(([,x])=>x&&Date.now()-Number(x.at||0)<12*3600*1000);
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
  function openTables(){return Object.values(tables).filter(t=>t&&t.status!=="finished"&&Date.now()-Number(t.createdAt||0)<MAX_AGE_MS).sort((a,b)=>b.createdAt-a.createdAt);}
  window.bptOnline={
    openTables,
    me,
    active(){const w=waitingTables[0];if(w)return {id:w.id,state:"waiting"};return runningIds[0]?{id:runningIds[0],state:"running"}:null;},
    pilot(id){const t=tables[id];return t?pilotName(t):null;}, // diagnostic : qui pilote les automatismes
    open(id){openId=id||null;window.showView&&window.showView("online");render();},
    async create(form){await createTable(form);window.showView&&window.showView("online");render();}
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);else install();
})();
