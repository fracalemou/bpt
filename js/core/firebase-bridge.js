
/* BPT 4.34 — Firebase Realtime Database service adapter.
   Fill BPT_FIREBASE_CONFIG with the Firebase Web App config before publication. */
window.BPT_FIREBASE_CONFIG = window.BPT_FIREBASE_CONFIG || {
  apiKey: "AIzaSyCU0tFa8jYpnCxe7aC23G4GOnDMl8-LfCs",
  authDomain: "bpt-championship.firebaseapp.com",
  databaseURL: "https://bpt-championship-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bpt-championship",
  storageBucket: "bpt-championship.firebasestorage.app",
  messagingSenderId: "90927856023",
  appId: "1:90927856023:web:93f1fedc25b9ae71bb2cd2"
};

(function(){
  const ROOT="bpt";
  let app=null, rtdb=null, auth=null, readyPromise=null;

  function configured(){
    const c=window.BPT_FIREBASE_CONFIG||{};
    return !!(c.apiKey && c.databaseURL && c.projectId && !String(c.apiKey).startsWith("__FIREBASE_"));
  }
  function err(message){ return {message:String(message||"Erreur Firebase")}; }
  async function ensureFirebase(){
    if(!configured()) throw new Error("Firebase n’est pas encore configuré dans ce fichier BPT.");
    if(!window.firebase) throw new Error("Bibliothèque Firebase indisponible.");
    if(!app){
      app=(firebase.apps&&firebase.apps.length)?firebase.app():firebase.initializeApp(window.BPT_FIREBASE_CONFIG);
      rtdb=firebase.database(app);
      // L'authentification n'est pas requise pour la phase de migration.
      // La Realtime Database peut fonctionner avec les règles de test Firebase.
      try{ auth=firebase.auth(app); }catch(_e){ auth=null; }
      readyPromise=Promise.resolve(null);
    }
    await readyPromise;
    return {rtdb,auth};
  }
  window.bptFirebaseEnsure=ensureFirebase;
  window.bptFirebaseConfigured=configured;
  window.bptFirebaseDb=()=>rtdb;

  function cleanKey(v){ return String(v||"").replace(/[.#$\[\]\/]/g,"_"); }
  function hashString(str){
    str=String(str||""); let h=2166136261;
    for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619); }
    return (h>>>0).toString(36);
  }
  function mapSnapToRows(snap){
    const val=snap.val()||{};
    return Object.entries(val).map(([id,row])=>({id,...(row||{})}));
  }

  class FirebaseStoreQuery {
    constructor(table){ this.table=table; this.op="select"; this.payload=null; this.opts={}; this.filters=[]; this.orderBy=null; }
    select(){ return this; }
    eq(field,value){ this.filters.push([field,"eq",value]); return this; }
    not(field,op,value){ this.filters.push([field,"not",value]); return this; }
    order(field,opts={}){ this.orderBy={field,ascending:opts.ascending!==false}; return this; }
    upsert(payload,opts={}){ this.op="upsert"; this.payload=payload; this.opts=opts||{}; return this; }
    update(payload){ this.op="update"; this.payload=payload; return this; }
    delete(){ this.op="delete"; return this; }
    single(){ return this._exec(true); }
    maybeSingle(){ return this._exec(true); }
    then(resolve,reject){ return this._exec(false).then(resolve,reject); }
    async _exec(single){
      try{
        const {rtdb}=await ensureFirebase();
        if(this.table==="bpt_state") return await this._state(rtdb,single);
        if(this.table==="bpt_games_v2") return await this._games(rtdb,single);
        return {data:single?null:[],error:err("Table Firebase inconnue: "+this.table)};
      }catch(e){ return {data:single?null:[],error:err(e?.message||e)}; }
    }
    async _state(db,single){
      const ref=db.ref(`${ROOT}/state/main`);
      if(this.op==="select"){
        const snap=await ref.once("value");
        const row=snap.val();
        return {data:row||null,error:null};
      }
      if(this.op==="upsert" || this.op==="update"){
        const incoming=this.payload||{};
        const snap=await ref.once("value");
        const prev=snap.val()||{};
        const row={
          ...prev,
          ...incoming,
          id:incoming.id||prev.id||"main",
          revision:Number(prev.revision||0)+1,
          updated_at:new Date().toISOString()
        };
        await ref.set(row);
        return {data:row,error:null};
      }
      if(this.op==="delete"){
        await ref.remove(); return {data:null,error:null};
      }
      return {data:null,error:null};
    }
    async _games(db,single){
      const base=db.ref(`${ROOT}/games`);
      if(this.op==="select"){
        const snap=await base.once("value");
        let rows=mapSnapToRows(snap);
        for(const [field,op,value] of this.filters){ if(op==="eq") rows=rows.filter(r=>String(r?.[field])===String(value)); }
        if(this.orderBy){
          const {field,ascending}=this.orderBy;
          rows.sort((a,b)=>{ const av=a?.[field]??"", bv=b?.[field]??""; return (av<bv?-1:av>bv?1:0)*(ascending?1:-1); });
        }
        return {data:single?(rows[0]||null):rows,error:null};
      }
      if(this.op==="upsert"){
        const incoming=this.payload||{};
        let id;
        if(incoming.game_key) id="g_"+hashString(incoming.game_key);
        else id=cleanKey(incoming.id||base.push().key);
        const ref=base.child(id);
        const snap=await ref.once("value");
        if(this.opts?.ignoreDuplicates && snap.exists()){
          const row={id,...(snap.val()||{})};
          return {data:single?row:[row],error:null};
        }
        const prev=snap.val()||{};
        const row={...prev,...incoming,created_at:prev.created_at||incoming.created_at||new Date().toISOString()};
        delete row.id;
        await ref.set(row);
        const out={id,...row};
        return {data:single?out:[out],error:null};
      }
      if(this.op==="update"){
        const idFilter=this.filters.find(x=>x[0]==="id"&&x[1]==="eq");
        if(!idFilter) throw new Error("Identifiant de partie manquant.");
        const id=cleanKey(idFilter[2]);
        const ref=base.child(id);
        await ref.update(this.payload||{});
        const snap=await ref.once("value");
        return {data:{id,...(snap.val()||{})},error:null};
      }
      if(this.op==="delete"){
        const idFilter=this.filters.find(x=>x[0]==="id"&&x[1]==="eq");
        if(idFilter) await base.child(cleanKey(idFilter[2])).remove();
        else await base.remove();
        return {data:null,error:null};
      }
      return {data:single?null:[],error:null};
    }
  }

  class FirebaseStoreChannel {
    constructor(name){ this.name=name; this.handlers=[]; this.refs=[]; this.startedAt=Date.now(); }
    on(kind,filter,cb){ this.handlers.push({kind,filter:filter||{},cb}); return this; }
    subscribe(cb){
      ensureFirebase().then(({rtdb})=>{
        for(const h of this.handlers){
          if(h.kind==="postgres_changes" && h.filter?.table==="bpt_state"){
            const ref=rtdb.ref(`${ROOT}/state/main`);
            let first=true;
            const fn=s=>{ const val=s.val(); if(first)first=false; h.cb({new:val,old:null,eventType:"UPDATE"}); };
            ref.on("value",fn); this.refs.push([ref,"value",fn]);
          }else if(h.kind==="postgres_changes" && h.filter?.table==="bpt_games_v2"){
            const ref=rtdb.ref(`${ROOT}/games`);
            let first=true;
            const fn=s=>{ if(first)first=false; h.cb({new:s.val(),eventType:"UPDATE"}); };
            ref.on("value",fn); this.refs.push([ref,"value",fn]);
          }else if(h.kind==="broadcast"){
            const ref=rtdb.ref(`${ROOT}/chat`).limitToLast(30);
            const fn=s=>{ const msg=s.val(); if(!msg || Number(msg.sentAt||0)<this.startedAt-1500) return; h.cb({payload:msg}); };
            ref.on("child_added",fn); this.refs.push([ref,"child_added",fn]);
          }
        }
        cb&&cb("SUBSCRIBED");
      }).catch(e=>{ console.error("Firebase channel:",e); cb&&cb("CHANNEL_ERROR"); });
      return this;
    }
    async send(evt){
      try{
        const {rtdb}=await ensureFirebase();
        const msg=evt?.payload||{};
        const ref=rtdb.ref(`${ROOT}/chat/${cleanKey(msg.id||rtdb.ref().push().key)}`);
        await ref.set(msg);
        return "ok";
      }catch(e){ console.error("Firebase chat send:",e); return "error"; }
    }
    unsubscribe(){ for(const [ref,event,fn] of this.refs){ try{ref.off(event,fn);}catch(_e){} } this.refs=[]; }
  }

  window.BPTFirebaseStore={
    from:(table)=>new FirebaseStoreQuery(table),
    channel:(name)=>new FirebaseStoreChannel(name)
  };
})();
