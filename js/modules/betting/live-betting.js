(function(){
  "use strict";
  function buildOdds(selected,history){
    const names=[...new Set((selected||[]).map(x=>String(x||'').trim()).filter(Boolean))];
    const games=new Map();(Array.isArray(history)?history:[]).forEach(r=>{const g=String(r.game||'');if(g)(games.get(g)||games.set(g,[]).get(g)).push(r);});
    const stats=new Map(names.map(name=>[name,{games:0,wins:0,firstOut:0}]));
    for(const group of games.values()){
      const last=Math.max(...group.map(r=>Number(r.place)||0));if(!last)continue;
      group.forEach(r=>{const s=stats.get(r.player);if(!s)return;s.games++;if(Number(r.place)===1)s.wins++;if(Number(r.place)===last)s.firstOut++;});
    }
    const make=(field,prior)=>{const raw=names.map(name=>{const s=stats.get(name),g=s.games;return {name,score:(s[field]+prior)/(g+prior*names.length)}}),total=raw.reduce((a,x)=>a+x.score,0)||1;return Object.fromEntries(raw.map(x=>[x.name,Math.max(1.05,Math.min(20,Math.round(total/x.score*10)/10))]));};
    return {winner:make('wins',.5),firstEliminated:make('firstOut',.5)};
  }
  window.BPTBetting={buildOdds,stakeCents:50};
})();
