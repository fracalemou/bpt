/* BPT 10.4.76 — Jouer en ligne · lot 1 : salon et places · lot 2 : donne · lot 3 : enchères, pots, abattage.
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
      t.status="running";t.startedAt=Date.now();t.levelIndex=0;t.hand=null;
      dealHand(t);
    });
  }
  async function removeTable(id){
    if(!confirm("Supprimer cette table ?"))return;
    await (await db()).ref(`${ROOT}/${id}`).remove();openId=null;render();
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
  const TURN_MS=45000, NEXT_HAND_MS=6000;
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

  function dealHand(t){
    const list=inPlay(t);
    if(list.length<2){t.status="finished";t.finishedAt=Date.now();t.winner=list.length?t.seats[list[0]].name:null;return;}
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
  function best7(cards){
    let best=null;const n=cards.length;
    for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){const five=cards.filter((_,k)=>k!==a&&k!==b);const v=eval5(five);if(!best||cmp(v,best)>0)best=v;}
    return best;
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
    const score={};if(showdown)list.filter(i=>!folded(h,i)).forEach(i=>{score[i]=best7([...split(h.hole[i]),...board]);});
    h.result=pots.map(p=>{
      let w=p.elig;
      if(showdown&&w.length>1){const top=w.reduce((b,i)=>b===null||cmp(score[i],score[b])>0?i:b,null);/* b===null : la place n°0 est un gagnant possible */w=w.filter(i=>cmp(score[i],score[top])===0);}
      const share=Math.floor(p.amount/w.length);let rest=p.amount-share*w.length;
      // Jeton indivisible : au premier gagnant à gauche du bouton.
      const ordered=[];let q=h.dealer;for(let k=0;k<list.length;k++){q=nextOf(list,q);if(w.includes(q))ordered.push(q);}
      ordered.forEach(i=>{t.seats[i].stack=stackOf(t,i)+share+(rest>0?1:0);if(rest>0)rest--;});
      return {amount:p.amount,winners:ordered,hand:showdown&&score[ordered[0]]?HAND_NAMES[score[ordered[0]][0]]:null};
    });
    h.showdown=!!showdown;h.street="done";h.toAct=null;h.at=Date.now();h.bets={};
    // Éliminations (détaillées au lot 4) : place = nombre de joueurs encore en jeu + 1.
    t.out=t.out||{};const still=inPlay(t).length;
    list.filter(i=>stackOf(t,i)===0&&!t.out[K(i)]).forEach(i=>{t.out[K(i)]={name:t.seats[i].name,place:still+1,hand:h.no,by:h.result[h.result.length-1]?.winners?.map(w=>t.seats[w].name)[0]||null};});
    const w0=h.result[0]?.winners||[];
    h.last={i:w0[0],txt:w0.length?`${w0.map(i=>firstName(t,i)).join(" et ")} remporte${w0.length>1?"nt":""} ${fmt(h.result.reduce((a,r)=>a+r.amount,0))}${h.result[0]?.hand?` · ${h.result[0].hand}`:""}`:""};
  }

  /* Actions d'un joueur (ou d'un joueur virtuel piloté par l'appareil de l'hôte en test local). */
  async function act(id,action,amount,asBot=false){return tx(id,t=>applyAction(t,action,amount,asBot));}
  // Règle d'une action, sans accès à la base (testable seule). Renvoie false si l'action est refusée.
  function applyAction(t,action,amount,asBot=false){
    {
      const h=t.hand;if(t.status!=="running"||!h||h.street==="done")return false;
      const i=h.toAct,seat=t.seats?.[i];if(seat===undefined||seat===null||i===null)return false;
      if(asBot?!(seat.bot&&t.host===me()):seat.name!==me()){
        if(!(action==="timeout"&&t.host===me()&&Date.now()-Number(h.actionAt||0)>=TURN_MS))return false;
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
  async function nextHand(id){await tx(id,t=>{if(t.status!=="running"||t.hand?.street!=="done")return false;dealHand(t);});}

  /* Automatismes, exécutés par l'appareil de l'hôte uniquement : joueurs virtuels (test local), délai de décision
     dépassé, main suivante. Un seul déclenchement par situation. */
  let autoKey="";
  function autopilot(){
    const t=openId&&tables[openId];if(!t||t.status!=="running"||t.host!==me())return;
    const h=t.hand;if(!h)return;
    const now=Date.now();
    if(h.street==="done"){
      const key=`next:${h.no}`;if(autoKey!==key&&now-Number(h.at||0)>=NEXT_HAND_MS){autoKey=key;nextHand(t.id);}return;
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
  let raiseTo=0, raiseKey="";
  function tableHtml(t){
    const seats=seatsOf(t),mine=mySeat(t),isHost=t.host===me(),running=t.status==="running";
    const L=running?levelAt(t):{index:0,left:0},lv=t.levels?.[L.index]||{};
    const h=(running||t.status==="finished")?t.hand:null,board=split(h?.board),done=h?.street==="done";
    const N=Math.max(1,seats.length);
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
      const tag=out?'<i class="is-out">éliminé</i>':allin?'<i class="is-allin">TAPIS</i>':fold?'<i>couché</i>':s.name===t.host?'<i class="is-host">★ hôte</i>':s.bot?'<i>virtuel</i>':"";
      const badge=!h||done?"":h.dealer===s.i?'<em class="bpt-ol-dealer">D</em>':"";
      const timer=turn?`<span class="bpt-ol-timer"><span data-ol-turn style="width:${Math.max(0,100-100*(Date.now()-Number(h.actionAt||0))/TURN_MS).toFixed(0)}%"></span></span>`:"";
      return `<div class="bpt-ol-seat${isMe?" is-me":""}${turn?" is-turn":""}${fold?" is-folded":""}${out?" is-out":""}" data-pos="${pos}" data-n="${N}" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%">
        <div class="bpt-ol-avatar">${avatar(s.name)}</div>
        <div class="bpt-ol-plate"><b>${esc(s.name.split(" ")[0])}</b><span>${out?"—":fmt(s.stack)}</span>${timer}</div>${tag}${cards}${badge}${chips}</div>`;
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
    if(isHost)actions.push(`<button type="button" class="bpt-ol-danger" data-ol-remove>Supprimer</button>`);
    // Barre d'actions du joueur dont c'est le tour.
    let myBar="";
    if(h&&!done&&mine&&h.toAct===mine.i){
      const i=mine.i,toCall=Math.max(0,h.currentBet-betOf(h,i)),stack=stackOf(t,i),maxTotal=betOf(h,i)+stack;
      const minTo=Math.min(maxTotal,h.currentBet+Math.max(h.minRaise,Number(lv.bb)||50)),pot=potTotal+toCall;
      const key=`${h.no}:${h.street}:${h.actionAt}`;if(raiseKey!==key){raiseKey=key;raiseTo=minTo;}
      raiseTo=Math.max(minTo,Math.min(maxTotal,raiseTo));
      const canRaise=maxTotal>h.currentBet;
      const presets=[["Min",minTo],["½ pot",h.currentBet+Math.round(pot/2)],["Pot",h.currentBet+pot],["Tapis",maxTotal]]
        .map(([l,v])=>`<button type="button" data-ol-preset="${Math.max(minTo,Math.min(maxTotal,v))}">${l}</button>`).join("");
      myBar=`<div class="bpt-ol-mybar">
        <button type="button" class="is-fold" data-ol-act="fold">Se coucher</button>
        ${toCall?`<button type="button" class="is-call" data-ol-act="call">${toCall>=stack?"Suivre à tapis":"Suivre "+fmt(toCall)}</button>`:`<button type="button" class="is-call" data-ol-act="check">Check</button>`}
        ${canRaise?`<button type="button" class="is-raise" data-ol-act="raise">${raiseTo>=maxTotal?"Tapis "+fmt(maxTotal):(h.currentBet?"Relancer à ":"Miser ")+fmt(raiseTo)}</button>
        <div class="bpt-ol-raise">${maxTotal>minTo?`<div class="bpt-ol-presets">${presets}</div><input type="range" data-ol-range min="${minTo}" max="${maxTotal}" step="${Math.max(1,Math.round((Number(lv.sb)||25)))}" value="${raiseTo}">`:""}</div>`:""}
      </div>`;
    }
    const center=h?`<div class="bpt-ol-board">${[0,1,2,3,4].map(k=>cardHtml(board[k])).join("")}</div><div class="bpt-ol-pot">${potLine}</div>`
      :`<strong>${fmt(lv.sb)} / ${fmt(lv.bb)}</strong>`;
    const centerSub=t.status==="finished"?`🏆 ${esc(t.winner||"")} remporte le tournoi`
      :t.status==="waiting"?`En attente des joueurs · ${seats.length} inscrit${seats.length>1?"s":""}`
      :`Main n°${h?.no||1} · ${STREET[h?.street]||""}`;
    const last=h?.last?.txt?`<div class="bpt-ol-note">${esc(h.last.txt)}${done&&running?` · main suivante dans quelques secondes`:""}</div>`:"";
    return `<div class="bpt-ol-table">
      <div class="bpt-ol-bar"><button type="button" data-ol-back aria-label="Retour aux tables">‹</button>
        <div class="bpt-ol-bar-title"><b>${esc(t.name)}</b><small>${t.countsForChampionship?"Compte au championnat":"Hors championnat"} · hôte ${esc(t.host.split(" ")[0])}</small></div>
        ${isHost&&t.status==="waiting"?`<label class="bpt-ol-check"><input type="checkbox" data-ol-counts${t.countsForChampionship?" checked":""}> Championnat</label>`:""}
        <div class="bpt-ol-bar-level"><small>Niveau ${L.index+1}${running?` · <span data-ol-clock>${clock(L.left)}</span>`:""}</small><b>${fmt(lv.sb)} / ${fmt(lv.bb)}</b></div></div>
      <div class="bpt-ol-stage"><div class="bpt-ol-rail"><div class="bpt-ol-felt">
        <div class="bpt-ol-center"><span class="bpt-ol-logo">♠ BPT</span>${center}<small>${centerSub}</small></div>
      </div></div>${ring}</div>
      ${last}${myBar}<div class="bpt-ol-actions">${actions.join("")}</div></div>`;
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
    const bar=document.querySelector("#bptOnlineBody [data-ol-turn]");if(bar&&t.hand)bar.style.width=Math.max(0,100-100*(Date.now()-Number(t.hand.actionAt||0))/TURN_MS).toFixed(0)+"%";
  },1000);
  setInterval(()=>{try{autopilot();}catch(e){console.warn("BPT en ligne :",e);}},400);
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
      if((el=g("[data-ol-act]"))){const a=el.dataset.olAct;act(openId,a,a==="raise"?raiseTo:0);return;}
      if((el=g("[data-ol-preset]"))){raiseTo=Number(el.dataset.olPreset)||raiseTo;render();return;}
      if(g("[data-ol-next]")){nextHand(openId);return;}
      if(g("[data-ol-remove]")){removeTable(openId);return;}
    });
    view.addEventListener("change",e=>{const c=e.target.closest("[data-ol-counts]");if(c)toggleCounts(openId,c.checked);});
    // Curseur de relance : met à jour le montant affiché sans redessiner toute la table.
    view.addEventListener("input",e=>{const r=e.target.closest("[data-ol-range]");if(!r)return;raiseTo=Number(r.value)||raiseTo;
      const b=view.querySelector("[data-ol-act=raise]");if(b){const max=Number(r.max);b.textContent=raiseTo>=max?"Tapis "+fmt(max):(b.textContent.startsWith("Miser")?"Miser ":"Relancer à ")+fmt(raiseTo);}});
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
