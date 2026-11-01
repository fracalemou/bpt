/* BPT v10.4.131 — stacks par joueur et par partie, synchronisés dans Firebase RTDB.
 * Une validation réussie est la seule opération qui crée un relevé.
 * IMPORTANT : règles Firebase de sécurité du projet à renforcer (l'auth anonyme seule ne
 * prouve pas l'identité métier du joueur). */
(function(root){
  'use strict';
  let context='', dbRef=null, data={}, loaded=false, error='', generation=0, subscription=null;
  const emit=()=>document.dispatchEvent(new CustomEvent('bpt-stack-records-updated'));
  function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLocaleLowerCase('fr')}
  function hash(v){let h=2166136261;for(const c of v){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
  function keyOf(name){return 'p_'+hash(norm(name))}
  function getLive(){try{return root.BPTLive3?.getState?.()||null}catch(_){return null}}
  function liveKey(){const s=getLive();return s?.active&&s?.sessionId?'s_'+hash(String(s.sessionId)):''}
  function identity(){const name=String(root.BPTLive3?.getVerifiedIdentityName?.()||'').trim(),s=getLive();
    return (s?.players||[]).find(p=>norm(p.name)===norm(name))?.name||''}
  function onValue(snapshot){const values=snapshot.val();data=values&&typeof values==='object'?values:{};loaded=true;error='';emit()}
  function stop(){if(subscription){try{subscription.ref.off('value',subscription.cb)}catch(_){}subscription=null}dbRef=null;data={};loaded=false;error=''}
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
    const name=identity();if(!name)throw new Error('Identifie-toi avec ton profil joueur avant de valider ton stack.');
    const state=getLive();if(!state?.players?.some(p=>norm(p.name)===norm(name)&&['in','winner'].includes(p.status)))throw new Error('Le joueur n’est plus en lice.');
    const env=await root.bptFirebaseEnsure?.();if(!env?.rtdb)throw new Error('Connexion Firebase indisponible.');
    if(key!==context||key!==liveKey())throw new Error('La partie a changé : recommence la saisie.');
    const base=env.rtdb.ref('bpt/live_v3/stack_history/'+key+'/'+keyOf(name)+'/records');
    const target=id?base.child(id):base.push();const now=Date.now();
    const previous=id?getHistory(name).find(v=>v.id===id):null;
    if(id&&!previous)throw new Error('Ce relevé n’existe plus. Recharge l’historique.');
    const payload={name,total:record.total,chips:record.chips,counts:record.counts,mode:record.mode,
      level:previous?.level??Number(state.levelIndex||0)+1,
      elapsedSec:previous?.elapsedSec??Math.max(0,Number(state.elapsedSec||0)),
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
  root.BPTStackSync={trackSession,getStatus,getHistory,getLatest,identity,save:r=>persist(r),update:(id,r)=>persist(r,id),remove};
  // Les écrans Live sont initialisés de manière asynchrone ; cet intervalle n'émet
  // aucune requête quand la partie ne change pas.
  setInterval(trackSession,3000);
  document.addEventListener('DOMContentLoaded',trackSession);
})(window);
