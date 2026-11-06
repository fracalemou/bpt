/* BPT v10.4.133 — stacks par joueur et par partie, synchronisés dans Firebase RTDB.
 * Une validation réussie est la seule opération qui crée un relevé.
 * IMPORTANT : règles Firebase de sécurité du projet à renforcer (l'auth anonyme seule ne
 * prouve pas l'identité métier du joueur). */
(function(root){
  'use strict';
  let context='', dbRef=null, data={}, loaded=false, error='', generation=0, subscription=null;
  let archive={key:'',data:null}; // 10.4.157 — relevés de la dernière session, conservés après la fin de la partie pour le bilan
  const emit=()=>document.dispatchEvent(new CustomEvent('bpt-stack-records-updated'));
  function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLocaleLowerCase('fr')}
  function hash(v){let h=2166136261;for(const c of v){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
  function keyOf(name){return 'p_'+hash(norm(name))}
  // 10.4.155 — temps de jeu À L'INSTANT du relevé : elapsedSec n'est cumulé qu'aux pauses et changements de niveau,
  // il faut y ajouter le temps couru depuis runStartedAt (même calcul que elapsedSeconds() du module Live).
  function liveElapsed(s){const base=Math.max(0,Number(s?.elapsedSec)||0);
    return s?.running&&s?.runStartedAt?base+Math.max(0,Math.floor((Date.now()-Number(s.runStartedAt))/1000)):base;}
  function getLive(){try{return root.BPTLive3?.getState?.()||null}catch(_){return null}}
  function liveKey(){const s=getLive();return s?.active&&s?.sessionId?'s_'+hash(String(s.sessionId)):''}
  function identity(){const name=String(root.BPTLive3?.getVerifiedIdentityName?.()||'').trim(),s=getLive();
    return (s?.players||[]).find(p=>norm(p.name)===norm(name))?.name||''}
  // 10.4.170 — qui peut compter son stack : uniquement la personne identifiée sur l'appareil, si elle est
  // un joueur EN LICE de la partie Live en cours (ni simple spectateur, ni joueur absent de la partie, ni éliminé).
  function eligibility(){
    const s=getLive();if(!s?.active||!s.sessionId)return{ok:false,reason:'no-live',message:'Aucune partie Live en cours.'};
    const who=String(root.BPTLive3?.getVerifiedIdentityName?.()||'').trim();
    if(!who)return{ok:false,reason:'no-identity',message:'Identifie-toi avec ton profil joueur pour compter ton stack.'};
    const p=(s.players||[]).find(x=>norm(x.name)===norm(who));
    if(!p)return{ok:false,reason:'not-player',message:who+', tu ne fais pas partie de cette partie : seuls les joueurs inscrits peuvent enregistrer leur stack.'};
    if(!['in','winner'].includes(p.status))return{ok:false,reason:'out',message:'Tu es éliminé : ton stack n’est plus suivi.'};
    return{ok:true,reason:'',message:'',name:p.name};
  }
  function onValue(snapshot){const values=snapshot.val();data=values&&typeof values==='object'?values:{};loaded=true;error='';emit()}
  function stop(){if(loaded&&context)archive={key:context,data};if(subscription){try{subscription.ref.off('value',subscription.cb)}catch(_){}subscription=null}dbRef=null;data={};loaded=false;error=''}
  function trackSession(){const next=liveKey();if(next===context)return;stop();context=next;const gen=++generation;emit();if(!next)return;
    (async()=>{try{const env=await root.bptFirebaseEnsure?.();if(gen!==generation||context!==next)return;
      if(!env?.rtdb)throw new Error('Firebase indisponible');
      const ref=env.rtdb.ref('bpt/live_v3/stack_history/'+next);dbRef=ref;
      const cb=snap=>{if(gen===generation)onValue(snap)};
      ref.on('value',cb,err=>{if(gen===generation){error='Synchronisation indisponible';loaded=false;emit()}});
      subscription={ref,cb};
    }catch(e){if(gen===generation){error=e.message||'Connexion indisponible';loaded=false;emit()}}})();
  }
  function getHistory(name){const node=data[keyOf(name||identity())];const arr=node?.records&&typeof node.records==='object'?Object.entries(node.records).map(([id,v])=>({...v,id})):[];
    return arr.filter(r=>norm(r.name)===norm(name||identity())&&Number.isFinite(Number(r.total))&&Number(r.at)>0).sort((a,b)=>Number(b.at)-Number(a.at));
  }
  function getLatest(name){return getHistory(name)[0]||null}
  function getStatus(){return{connected:!!context,loaded,error,sessionKey:context}}
  async function persist(record,id){trackSession();const key=context;if(!key)throw new Error('Aucune partie Live active.');
    const elig=eligibility();if(!elig.ok)throw new Error(elig.message); // 10.4.170 : message selon la vraie cause
    const name=elig.name;const state=getLive();
    const env=await root.bptFirebaseEnsure?.();if(!env?.rtdb)throw new Error('Connexion Firebase indisponible.');
    if(key!==context||key!==liveKey())throw new Error('La partie a changé : recommence la saisie.');
    const base=env.rtdb.ref('bpt/live_v3/stack_history/'+key+'/'+keyOf(name)+'/records');
    const target=id?base.child(id):base.push();const now=Date.now();
    const previous=id?getHistory(name).find(v=>v.id===id):null;
    if(id&&!previous)throw new Error('Ce relevé n’existe plus. Recharge l’historique.');
    const payload={name,total:record.total,chips:record.chips,counts:record.counts,mode:record.mode,
      level:previous?.level??Number(state.levelIndex||0)+1,
      elapsedSec:previous?.elapsedSec??liveElapsed(state),
      at:previous?.at??root.firebase.database.ServerValue.TIMESTAMP,
      updatedAt:root.firebase.database.ServerValue.TIMESTAMP,
      authorUid:env.auth?.currentUser?.uid||null};
    // Écriture atomique du relevé ; sa lecture temps réel met à jour le suivi de tous les joueurs.
    await target.set(payload);return target.key;
  }
  async function remove(id){trackSession();const name=identity(),record=getHistory(name).find(x=>x.id===id);if(!name||!record)throw new Error('Relevé introuvable pour le joueur connecté.');
    const env=await root.bptFirebaseEnsure?.();if(!env?.rtdb)throw new Error('Firebase indisponible.');
    await env.rtdb.ref('bpt/live_v3/stack_history/'+context+'/'+keyOf(name)+'/records/'+id).remove();
  }
  // 10.4.157 — faits de stack pour le bilan de fin de partie (figés dans endGameRecap.stacks).
  // Temps = temps de jeu (pauses exclues), même base que outActiveElapsedSec des éliminations.
  // Renvoie null si les relevés sont insuffisants (moins de 2 joueurs relevés ou moins de 3 relevés).
  function summarize(state){
    if(!state?.sessionId)return null;
    const key='s_'+hash(String(state.sessionId));
    const src=key===context&&loaded?data:archive.key===key?archive.data:null;if(!src)return null;
    const num=v=>v==null||v===''||!Number.isFinite(Number(v))?null:Number(v);
    const series=(state.players||[]).map(p=>{const node=src[keyOf(p.name)];
      const recs=node?.records&&typeof node.records==='object'?Object.values(node.records):[];
      const rs=recs.filter(r=>r&&norm(r.name)===norm(p.name)&&Number.isFinite(Number(r.total))&&Number(r.at)>0)
        .map(r=>({t:num(r.elapsedSec),at:Number(r.at),total:Math.max(0,Number(r.total)),level:Number(r.level)||0})).sort((a,b)=>a.at-b.at);
      return {name:p.name,rs,out:p.status==='out'?num(p.outActiveElapsedSec):null};}).filter(x=>x.rs.length);
    const records=series.reduce((n,x)=>n+x.rs.length,0);
    if(series.length<2||records<3)return null;
    // Plus haut stack atteint
    let top=null;for(const x of series)for(const r of x.rs)if(!top||r.total>top.total)top={name:x.name,total:r.total,level:r.level};
    // Plus belle remontée : plus forte hausse depuis un point bas atteint APRÈS une chute
    // (relevé inférieur à un relevé précédent ou au tapis de départ) — une simple progression continue n'en est pas une.
    const start=Math.max(0,Number(state.startStack)||0);let comeback=null;
    for(const x of series){let lo=null,peak=start;for(const r of x.rs){
      if(r.total<peak&&(!lo||r.total<lo.total))lo=r;
      if(lo){const gain=r.total-lo.total;if(gain>0&&(!comeback||gain>comeback.gain))comeback={name:x.name,from:lo.total,fromLevel:lo.level,to:r.total,toLevel:r.level,gain};}
      peak=Math.max(peak,r.total);}}
    // Le plus longtemps chip leader : à chaque instant, le plus gros dernier relevé parmi les joueurs encore en lice
    const end=Math.max(0,Number(state.elapsedSec)||0),ev=[];
    for(const x of series){for(const r of x.rs)if(r.t!==null)ev.push({t:r.t,name:x.name,total:r.total});if(x.out!==null)ev.push({t:x.out,name:x.name,out:true});}
    ev.sort((a,b)=>a.t-b.t||(a.out?-1:0)-(b.out?-1:0));
    const cur=new Map(),gone=new Set(),held=new Map();let prev=null,changes=0;
    const leaderNow=()=>{let best=null;for(const [n,v] of cur)if(!gone.has(n)&&(!best||v>best.v))best={n,v};return cur.size-gone.size>=2?best?.n||null:null;};
    for(let i=0;i<ev.length;i++){const e=ev[i];if(e.out)gone.add(e.name);else cur.set(e.name,e.total);
      const from=e.t,to=Math.min(end||Infinity,i+1<ev.length?ev[i+1].t:end);
      const lead=leaderNow();if(lead&&lead!==prev){if(prev)changes++;prev=lead;}
      if(lead&&to>from)held.set(lead,(held.get(lead)||0)+(to-from));}
    let leader=null;for(const [n,sec] of held)if(!leader||sec>leader.sec)leader={name:n,sec:Math.round(sec)};
    if(leader&&leader.sec<60)leader=null;
    if(leader){const total=[...held.values()].reduce((a,b)=>a+b,0);leader.share=total?Math.round(leader.sec/total*100):0;leader.changes=changes;}
    return {records,players:series.length,top,comeback,leader};
  }
  root.BPTStackSync={trackSession,getStatus,getHistory,getLatest,identity,eligibility,summarize,save:r=>persist(r),update:(id,r)=>persist(r,id),remove};
  // Les écrans Live sont initialisés de manière asynchrone ; cet intervalle n'émet
  // aucune requête quand la partie ne change pas.
  setInterval(trackSession,3000);
  document.addEventListener('DOMContentLoaded',trackSession);
})(window);
