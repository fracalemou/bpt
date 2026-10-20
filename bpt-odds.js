
(function(){
  "use strict";
  const modal=document.getElementById("bptOddsModal"); if(!modal)return;
  const slots=[...modal.querySelectorAll(".bpt-card-slot")];
  const deck=document.getElementById("bptOddsDeck");
  const ranks=["A","K","Q","J","10","9","8","7","6","5","4","3","2"];
  const suits=[{k:"s",s:"♠",red:false},{k:"h",s:"♥",red:true},{k:"d",s:"♦",red:true},{k:"c",s:"♣",red:false}];
  const values={"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":11,"Q":12,"K":13,"A":14};
  const chosen={}; let active="p1a";
  const labelMap={p1a:"Carte 1",p1b:"Carte 2",p2a:"Carte 1",p2b:"Carte 2",p3a:"Carte 1",p3b:"Carte 2",p4a:"Carte 1",p4b:"Carte 2",b1:"Flop 1",b2:"Flop 2",b3:"Flop 3",b4:"Turn",b5:"River"};
  function cardLabel(c){if(!c)return ""; const su=suits.find(x=>x.k===c.s);return c.r+(su?.s||"");}
  function update(){
    slots.forEach(btn=>{const c=chosen[btn.dataset.slot];btn.classList.toggle("active",btn.dataset.slot===active);btn.classList.toggle("filled",!!c);btn.classList.toggle("red",!!c&&(c.s==="h"||c.s==="d"));btn.textContent=c?cardLabel(c):(labelMap[btn.dataset.slot]||"Carte");});
    const used=new Set(Object.values(chosen).filter(Boolean).map(c=>c.r+c.s));
    deck.querySelectorAll("button[data-card]").forEach(b=>b.disabled=used.has(b.dataset.card));
  }
  function nextSlot(){const order=slots.map(x=>x.dataset.slot),i=order.indexOf(active);for(let n=1;n<=order.length;n++){const k=order[(i+n)%order.length];if(!chosen[k]){active=k;return;}}}
  suits.forEach(su=>ranks.forEach(r=>{const b=document.createElement("button");b.type="button";b.className="bpt-deck-card"+(su.red?" red":"");b.dataset.card=r+su.k;b.textContent=r+su.s;b.addEventListener("click",()=>{chosen[active]={r,s:su.k,v:values[r]};nextSlot();update();});deck.appendChild(b);}));
  slots.forEach(btn=>btn.addEventListener("click",()=>{active=btn.dataset.slot;if(chosen[active])delete chosen[active];update();}));
  function open(){modal.classList.add("open");modal.setAttribute("aria-hidden","false");update();}
  function close(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");}
  ["live3OddsBtn","live3FsOddsActionBtn","live3FsSpectatorOddsBtn"].forEach(id=>document.getElementById(id)?.addEventListener("click",open));
  document.getElementById("bptOddsClose")?.addEventListener("click",close);modal.addEventListener("click",e=>{if(e.target===modal)close();});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&modal.classList.contains("open"))close();});
  document.getElementById("bptOddsReset")?.addEventListener("click",()=>{Object.keys(chosen).forEach(k=>delete chosen[k]);active="p1a";document.getElementById("bptOddsResults").hidden=true;update();});
  function cmp(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]||0)-(b[i]||0);if(d)return d>0?1:-1;}return 0;}
  function five(cs){
    const vs=cs.map(c=>c.v).sort((a,b)=>b-a), counts={};vs.forEach(v=>counts[v]=(counts[v]||0)+1);
    const unique=[...new Set(vs)];if(unique[0]===14)unique.push(1);
    let straight=0;for(let i=0;i<=unique.length-5;i++)if(unique[i]-unique[i+4]===4){straight=unique[i];break;}
    const flush=cs.every(c=>c.s===cs[0].s);if(flush&&straight)return [8,straight];
    const groups=Object.entries(counts).map(([v,n])=>({v:+v,n})).sort((a,b)=>b.n-a.n||b.v-a.v);
    if(groups[0].n===4)return [7,groups[0].v,groups[1].v];
    if(groups[0].n===3&&groups[1].n===2)return [6,groups[0].v,groups[1].v];
    if(flush)return [5,...vs];if(straight)return [4,straight];
    if(groups[0].n===3)return [3,groups[0].v,...groups.filter(g=>g.n===1).map(g=>g.v).sort((a,b)=>b-a)];
    const pairs=groups.filter(g=>g.n===2).sort((a,b)=>b.v-a.v);if(pairs.length>=2){const kick=groups.filter(g=>g.n===1).map(g=>g.v).sort((a,b)=>b-a)[0];return [2,pairs[0].v,pairs[1].v,kick];}
    if(pairs.length===1)return [1,pairs[0].v,...groups.filter(g=>g.n===1).map(g=>g.v).sort((a,b)=>b-a)];
    return [0,...vs];
  }
  function seven(cs){let best=null;for(let a=0;a<3;a++)for(let b=a+1;b<4;b++)for(let c=b+1;c<5;c++)for(let d=c+1;d<6;d++)for(let e=d+1;e<7;e++){const sc=five([cs[a],cs[b],cs[c],cs[d],cs[e]]);if(!best||cmp(sc,best)>0)best=sc;}return best;}
  function fullDeck(){const out=[];suits.forEach(su=>ranks.forEach(r=>out.push({r,s:su.k,v:values[r]})));return out;}
  function playerHand(i){return [chosen[`p${i}a`],chosen[`p${i}b`]];}
  function run(){
    const hands=[];
    for(let i=1;i<=4;i++){
      const h=playerHand(i),filled=h.filter(Boolean).length;
      if(i<=2 && filled<2){alert("Renseignez les deux cartes des joueurs 1 et 2.");return;}
      if(i>2 && filled===1){alert(`Le joueur ${i} a une main incomplète : renseignez ses deux cartes ou aucune.`);return;}
      if(filled===2)hands.push({i,cards:h});
    }
    if(hands.length<2){alert("Il faut au moins deux joueurs avec deux cartes chacun.");return;}
    const board=[chosen.b1,chosen.b2,chosen.b3,chosen.b4,chosen.b5].filter(Boolean);
    if(board.length===1||board.length===2){alert("Pour le board, renseignez au minimum les 3 cartes du flop.");return;}
    const allKnown=[...hands.flatMap(h=>h.cards),...board];
    const used=new Set(allKnown.map(c=>c.r+c.s));
    const remain=fullDeck().filter(c=>!used.has(c.r+c.s));
    const missing=5-board.length;
    const stats={};hands.forEach(h=>stats[h.i]={equity:0,wins:0,ties:0});
    let total=0;
    const maxSamples=missing===0?1:25000;
    function scoreOne(finalBoard){
      const scored=hands.map(h=>({i:h.i,score:seven([...h.cards,...finalBoard])}));
      let best=scored[0].score;
      for(let k=1;k<scored.length;k++)if(cmp(scored[k].score,best)>0)best=scored[k].score;
      const winners=scored.filter(x=>cmp(x.score,best)===0);
      const share=1/winners.length;
      winners.forEach(w=>{stats[w.i].equity+=share;if(winners.length===1)stats[w.i].wins++;else stats[w.i].ties++;});
      total++;
    }
    if(missing===0)scoreOne(board);
    else{
      for(let n=0;n<maxSamples;n++){
        const pool=remain.slice(),drawn=[];
        for(let k=0;k<missing;k++){const j=Math.floor(Math.random()*pool.length);drawn.push(pool[j]);pool[j]=pool[pool.length-1];pool.pop();}
        scoreOne([...board,...drawn]);
      }
    }
    for(let i=1;i<=4;i++){
      const box=modal.querySelector(`[data-result-player="${i}"]`),st=stats[i];
      if(!box)continue;
      box.hidden=!st;
      if(st){
        document.getElementById(`bptOddsP${i}`).textContent=(st.equity/total*100).toFixed(1)+" %";
        const winPct=st.wins/total*100, tiePct=st.ties/total*100;
        document.getElementById(`bptOddsP${i}Detail`).textContent=`Gain ${winPct.toFixed(1)} % · partage ${tiePct.toFixed(1)} %`;
      }
    }
    document.getElementById("bptOddsNote").textContent=(missing?`Simulation ${total.toLocaleString("fr-FR")} tirages`:`Calcul exact`)+` · ${hands.length} joueurs`;
    document.getElementById("bptOddsResults").hidden=false;
  }
  document.getElementById("bptOddsCalc")?.addEventListener("click",run);update();
})();
