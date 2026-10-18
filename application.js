
const $ = id => document.getElementById(id);

let bptToastTimer=null;
function showBptToast(message,kind="ok"){
  const el=document.getElementById("bptToast");
  if(!el)return;
  clearTimeout(bptToastTimer);
  el.textContent=String(message||"");
  el.style.display="block";
  el.style.background=kind==="error" ? "#532727" : kind==="busy" ? "#493b1f" : "#193326";
  el.style.borderColor=kind==="error" ? "#a95555" : kind==="busy" ? "#9d7a32" : "#4f7e63";
  bptToastTimer=setTimeout(()=>{el.style.display="none";},4200);
}


document.addEventListener("click",e=>{
  if(e.target?.closest?.("#refreshConnectionHistoryBtn")){
    if(typeof loadConnectionHistory==="function")loadConnectionHistory();
  }
});


function renderPhotoHostSettings(){
  const cfg=typeof bptPhotoHostConfig==="function" ? bptPhotoHostConfig() : {cloudName:"",uploadPreset:""};
  const c=$("photoHostCloudName"),p=$("photoHostUploadPreset"),s=$("photoHostSaveStatus");
  if(c && document.activeElement!==c)c.value=cfg.cloudName||"";
  if(p && document.activeElement!==p)p.value=cfg.uploadPreset||"";
  if(s)s.textContent=(cfg.cloudName&&cfg.uploadPreset)?"Configuration partagée active":"À configurer";
}

document.addEventListener("click",e=>{
  const btn=e.target?.closest?.("#photoHostSaveBtn");
  if(!btn)return;
  const c=String($("photoHostCloudName")?.value||"").trim();
  const p=String($("photoHostUploadPreset")?.value||"").trim();
  const s=$("photoHostSaveStatus");
  if(!c||!p){
    if(s)s.textContent="Cloud name et Upload preset requis.";
    return;
  }
  saveBptPhotoHostConfig(c,p);
  if(s)s.textContent="Enregistré";
});

document.addEventListener("DOMContentLoaded",()=>{
  setTimeout(renderPhotoHostSettings,300);
});


function bptDialog({title="Information",message="",confirmText="OK",cancelText=null,danger=false}={}){
  return new Promise(resolve=>{
    const backdrop=$("bptModalBackdrop");
    const titleEl=$("bptModalTitle");
    const messageEl=$("bptModalMessage");
    const cancelBtn=$("bptModalCancelBtn");
    const confirmBtn=$("bptModalConfirmBtn");

    if(!backdrop || !titleEl || !messageEl || !cancelBtn || !confirmBtn){
      resolve(true);
      return;
    }

    titleEl.textContent=title;
    messageEl.textContent=message;
    confirmBtn.textContent=confirmText;
    cancelBtn.textContent=cancelText||"Annuler";
    cancelBtn.style.display=cancelText?"inline-block":"none";

    confirmBtn.className=danger?"btn danger":"btn";
    backdrop.style.display="flex";

    let settled=false;
    const finish=value=>{
      if(settled)return;
      settled=true;
      backdrop.style.display="none";
      confirmBtn.onclick=null;
      cancelBtn.onclick=null;
      backdrop.onclick=null;
      document.removeEventListener("keydown",onKey);
      resolve(value);
    };

    const onKey=e=>{
      if(e.key==="Escape")finish(false);
      if(e.key==="Enter")finish(true);
    };

    confirmBtn.onclick=()=>finish(true);
    cancelBtn.onclick=()=>finish(false);
    backdrop.onclick=e=>{if(e.target===backdrop && cancelText)finish(false);};
    document.addEventListener("keydown",onKey);
    setTimeout(()=>confirmBtn.focus(),0);
  });
}

function bptConfirm(message,title="Confirmation",confirmText="Confirmer"){
  return bptDialog({title,message,confirmText,cancelText:"Annuler",danger:true});
}

function bptMessage(message,title="Information"){
  return bptDialog({title,message,confirmText:"OK"});
}

function clone(o){return JSON.parse(JSON.stringify(o));}

const SEED={"players":[{"name":"Alexis Volant","active":true},{"name":"Adrien Thiriez","active":true},{"name":"Anne BERA","active":false},{"name":"Areski AIT GHERBI","active":true},{"name":"Armell ARRAS","active":false},{"name":"Armelle BRAHIMI","active":false},{"name":"Arnaud HEDIN","active":false},{"name":"Clément MARAVAL","active":true},{"name":"Clément Thery","active":false},{"name":"Cyprien RIFFE","active":false},{"name":"David SAGALOWICZ","active":true},{"name":"Hélène Fiona","active":true},{"name":"Florence SAGALOWICZ","active":false},{"name":"Franck NAESSENS","active":true},{"name":"François CATTEAU","active":true},{"name":"Frédéric Tavernier","active":false},{"name":"Gérard CANDELIER","active":false},{"name":"Grégoire DUFORET","active":true},{"name":"Guillaume Molmy","active":false},{"name":"Hélène MORIZUR","active":false},{"name":"Jean Arnaud HEDIN OPIGEZ","active":false},{"name":"Jérémie CARPENTIER","active":true},{"name":"Jérémy COQUEL","active":true},{"name":"Jérôme BERA","active":true},{"name":"Jérôme BINOT","active":true},{"name":"Jérôme RIFFE","active":true},{"name":"joueur 74","active":false},{"name":"joueur 75","active":false},{"name":"Jules NAESSENS","active":true},{"name":"Laurent SAGALOWICZ","active":false},{"name":"LUC quebec","active":false},{"name":"MATTHIEU (Rimbaud)","active":false},{"name":"Maxence BINOT","active":false},{"name":"Mehdi BRAHIMI","active":true},{"name":"Mélanie BINOT","active":false},{"name":"Mélanie NAESSENS","active":false},{"name":"Michel SCHERPEREEL","active":true},{"name":"Nuno Tinoco","active":false},{"name":"Olivier HENGUELLE","active":true},{"name":"Philippe DUBOIS","active":true},{"name":"Quentin","active":true},{"name":"Romain Schepereel","active":false},{"name":"Solène BALLOIS","active":false},{"name":"Stéphane LEFIN","active":false},{"name":"Stéphane ROBERT","active":false},{"name":"Théo Maraval","active":false},{"name":"Thierry MONNIAUX","active":true},{"name":"Thomas DELVAL","active":false},{"name":"Valentin Naessens","active":false},{"name":"hélène fiona","active":false}],"history":[{"game":1,"date":"2026-09-11","location":"alexis","player":"Alexis Volant","place":1,"killer":"","tablier":true,"n":10,"points":30.0,"stake":5.0,"gross":30.0,"net":25.0,"kills":3,"win":true,"podium":true,"performance":123.02585092994046},{"game":1,"date":"2026-09-11","location":"alexis","player":"Areski AIT GHERBI","place":2,"killer":"Alexis Volant","tablier":false,"n":10,"points":26.0,"stake":5.0,"gross":15.0,"net":10.0,"kills":5,"win":false,"podium":true,"performance":113.02585092994046},{"game":1,"date":"2026-09-11","location":"alexis","player":"Jérôme RIFFE","place":3,"killer":"Alexis Volant","tablier":false,"n":10,"points":22.0,"stake":5.0,"gross":5.0,"net":0.0,"kills":1,"win":false,"podium":true,"performance":103.02585092994046},{"game":1,"date":"2026-09-11","location":"alexis","player":"Hélène Fiona","place":4,"killer":"Alexis Volant","tablier":false,"n":10,"points":18.0,"stake":5.0,"gross":0.0,"net":-5.0,"kills":0,"win":false,"podium":false,"performance":93.02585092994046},{"game":1,"date":"2026-09-11","location":"alexis","player":"David SAGALOWICZ","place":5,"killer":"Areski AIT GHERBI","tablier":false,"n":10,"points":15.0,"stake":5.0,"gross":0.0,"net":-5.0,"kills":0,"win":false,"podium":false,"performance":83.02585092994046},{"game":1,"date":"2026-09-11","location":"alexis","player":"Franck NAESSENS","place":6,"killer":"Jérôme RIFFE","tablier":false,"n":10,"points":12.0,"stake":5.0,"gross":0.0,"net":-5.0,"kills":0,"win":false,"podium":false,"performance":73.02585092994046},{"game":1,"date":"2026-09-11","location":"alexis","player":"Olivier HENGUELLE","place":7,"killer":"Areski AIT GHERBI","tablier":false,"n":10,"points":8.0,"stake":5.0,"gross":0.0,"net":-5.0,"kills":0,"win":false,"podium":false,"performance":63.02585092994046},{"game":1,"date":"2026-09-11","location":"alexis","player":"Jérôme BINOT","place":8,"killer":"Areski AIT GHERBI","tablier":false,"n":10,"points":5.0,"stake":5.0,"gross":0.0,"net":-5.0,"kills":0,"win":false,"podium":false,"performance":53.02585092994046},{"game":1,"date":"2026-09-11","location":"alexis","player":"Jérémy COQUEL","place":9,"killer":"Areski AIT GHERBI","tablier":false,"n":10,"points":3.0,"stake":5.0,"gross":0.0,"net":-5.0,"kills":0,"win":false,"podium":false,"performance":43.02585092994046},{"game":1,"date":"2026-09-11","location":"alexis","player":"Jérôme BERA","place":10,"killer":"Areski AIT GHERBI","tablier":false,"n":10,"points":1.0,"stake":5.0,"gross":0.0,"net":-5.0,"kills":0,"win":false,"podium":false,"performance":33.02585092994046}],"points":{"6":{"1":18,"2":14,"3":10,"4":6,"5":3,"6":1,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},"7":{"1":21,"2":17,"3":13,"4":9,"5":6,"6":3,"7":1,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},"8":{"1":24,"2":20,"3":16,"4":12,"5":9,"6":6,"7":3,"8":1,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},"9":{"1":27,"2":23,"3":19,"4":15,"5":12,"6":9,"7":6,"8":3,"9":1,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},"10":{"1":30,"2":26,"3":22,"4":18,"5":15,"6":12,"7":8,"8":5,"9":3,"10":1,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},"11":{"1":33,"2":29,"3":25,"4":21,"5":18,"6":14,"7":11,"8":8,"9":5,"10":3,"11":1,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},"12":{"1":36,"2":32,"3":28,"4":25,"5":21,"6":17,"7":14,"8":11,"9":8,"10":5,"11":3,"12":1,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},"13":{"1":39,"2":35,"3":31,"4":28,"5":24,"6":20,"7":17,"8":14,"9":11,"10":8,"11":5,"12":3,"13":1,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},"14":{"1":42,"2":38,"3":34,"4":31,"5":27,"6":23,"7":20,"8":17,"9":13,"10":10,"11":8,"12":5,"13":3,"14":1,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},"15":{"1":45,"2":41,"3":37,"4":34,"5":30,"6":26,"7":23,"8":19,"9":16,"10":13,"11":10,"12":7,"13":5,"14":3,"15":1,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},"16":{"1":48,"2":44,"3":40,"4":37,"5":33,"6":29,"7":26,"8":22,"9":19,"10":16,"11":13,"12":10,"13":7,"14":5,"15":3,"16":1,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},"17":{"1":51,"2":47,"3":43,"4":40,"5":36,"6":32,"7":29,"8":25,"9":22,"10":19,"11":16,"12":13,"13":10,"14":7,"15":5,"16":3,"17":1,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},"18":{"1":54,"2":50,"3":46,"4":43,"5":39,"6":35,"7":32,"8":28,"9":25,"10":22,"11":18,"12":15,"13":12,"14":10,"15":7,"16":5,"17":3,"18":1,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},"19":{"1":57,"2":53,"3":49,"4":46,"5":42,"6":38,"7":35,"8":31,"9":28,"10":25,"11":21,"12":18,"13":15,"14":12,"15":10,"16":7,"17":5,"18":3,"19":1,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},"20":{"1":60,"2":56,"3":52,"4":49,"5":45,"6":41,"7":38,"8":34,"9":31,"10":27,"11":24,"12":21,"13":18,"14":15,"15":12,"16":9,"17":7,"18":5,"19":2,"20":1,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},"21":{"1":63,"2":59,"3":55,"4":52,"5":48,"6":44,"7":41,"8":37,"9":34,"10":30,"11":27,"12":24,"13":21,"14":18,"15":15,"16":12,"17":9,"18":7,"19":4,"20":2,"21":1,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},"22":{"1":66,"2":62,"3":58,"4":55,"5":51,"6":47,"7":44,"8":40,"9":37,"10":33,"11":30,"12":27,"13":24,"14":20,"15":17,"16":15,"17":12,"18":9,"19":7,"20":4,"21":2,"22":1,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},"23":{"1":69,"2":65,"3":61,"4":58,"5":54,"6":50,"7":47,"8":43,"9":40,"10":36,"11":33,"12":30,"13":26,"14":23,"15":20,"16":17,"17":14,"18":12,"19":9,"20":7,"21":4,"22":2,"23":1,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},"24":{"1":72,"2":68,"3":64,"4":61,"5":57,"6":53,"7":50,"8":46,"9":43,"10":39,"11":36,"12":32,"13":29,"14":26,"15":23,"16":20,"17":17,"18":14,"19":12,"20":9,"21":7,"22":4,"23":2,"24":1,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},"25":{"1":75,"2":71,"3":67,"4":64,"5":60,"6":56,"7":53,"8":49,"9":46,"10":42,"11":39,"12":35,"13":32,"14":29,"15":26,"16":23,"17":20,"18":17,"19":14,"20":11,"21":9,"22":7,"23":4,"24":2,"25":1,"26":0,"27":0,"28":0,"29":0,"30":0},"26":{"1":78,"2":74,"3":70,"4":67,"5":63,"6":59,"7":56,"8":52,"9":49,"10":45,"11":42,"12":38,"13":35,"14":32,"15":29,"16":25,"17":22,"18":20,"19":17,"20":14,"21":11,"22":9,"23":6,"24":4,"25":2,"26":1,"27":0,"28":0,"29":0,"30":0},"27":{"1":81,"2":77,"3":73,"4":70,"5":66,"6":62,"7":59,"8":55,"9":52,"10":48,"11":45,"12":41,"13":38,"14":35,"15":31,"16":28,"17":25,"18":22,"19":19,"20":17,"21":14,"22":11,"23":9,"24":6,"25":4,"26":2,"27":1,"28":0,"29":0,"30":0},"28":{"1":84,"2":80,"3":76,"4":73,"5":69,"6":65,"7":62,"8":58,"9":54,"10":51,"11":48,"12":44,"13":41,"14":38,"15":34,"16":31,"17":28,"18":25,"19":22,"20":19,"21":16,"22":14,"23":11,"24":9,"25":6,"26":4,"27":2,"28":1,"29":0,"30":0},"29":{"1":87,"2":83,"3":79,"4":76,"5":72,"6":68,"7":65,"8":61,"9":57,"10":54,"11":51,"12":47,"13":44,"14":40,"15":37,"16":34,"17":31,"18":28,"19":25,"20":22,"21":19,"22":16,"23":14,"24":11,"25":9,"26":6,"27":4,"28":2,"29":1,"30":0},"30":{"1":90,"2":86,"3":82,"4":79,"5":75,"6":71,"7":68,"8":64,"9":60,"10":57,"11":53,"12":50,"13":47,"14":43,"15":40,"16":37,"17":34,"18":31,"19":27,"20":25,"21":22,"22":19,"23":16,"24":13,"25":11,"26":8,"27":6,"28":4,"29":2,"30":1}},"settings":{"championshipName":"BPT","season":"2026-2027","stake":5,"payouts":[60,30,10],"roundTo5":false,"tablierMinPlayers":10}};
const STORE="BPT_Championship_Manager_v1";

const CLOUD_ROW_ID="main";
const BPT_PHOTO_MAX_BYTES=550000;
const PHOTO_HOST_CONFIG_KEY="bpt_photo_host_config_v1";
const BPT_SHARED_PHOTO_CLOUD_NAME="peesjsvk";
const BPT_SHARED_PHOTO_UPLOAD_PRESET="BPTchampionship";

function bptPhotoHostConfig(){
  try{
    const v=JSON.parse(localStorage.getItem(PHOTO_HOST_CONFIG_KEY)||"{}");
    return {
      cloudName:String(v.cloudName||BPT_SHARED_PHOTO_CLOUD_NAME||"").trim(),
      uploadPreset:String(v.uploadPreset||BPT_SHARED_PHOTO_UPLOAD_PRESET||"").trim()
    };
  }catch(_e){
    return {
      cloudName:BPT_SHARED_PHOTO_CLOUD_NAME,
      uploadPreset:BPT_SHARED_PHOTO_UPLOAD_PRESET
    };
  }
}

function saveBptPhotoHostConfig(cloudName,uploadPreset){
  const cfg={
    cloudName:String(cloudName||"").trim(),
    uploadPreset:String(uploadPreset||"").trim()
  };
  localStorage.setItem(PHOTO_HOST_CONFIG_KEY,JSON.stringify(cfg));
  return cfg;
}

function bptSafeFilePart(value){
  return String(value||"")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-zA-Z0-9_-]+/g,"-")
    .replace(/^-+|-+$/g,"")
    .slice(0,80)||"photo";
}

async function bptUploadPhotoBlobToUrl(path,blob){
  if(!blob)throw new Error("Image vide.");
  if(blob.size>BPT_PHOTO_MAX_BYTES)throw new Error("La photo compressée est encore trop volumineuse.");

  const cfg=bptPhotoHostConfig();
  if(!cfg.cloudName || !cfg.uploadPreset){
    throw new Error("Hébergement photo non configuré. Renseignez Cloud name et Upload preset dans Paramètres.");
  }

  const form=new FormData();
  form.append("file",blob,"bpt-photo.jpg");
  form.append("upload_preset",cfg.uploadPreset);
  form.append("folder","bpt");
  // Un identifiant unique évite que Cloudinary ou son CDN ne renvoie une ancienne
  // image conservée sous le même public_id (notamment pour la partie 5).
  form.append("public_id",`${bptSafeFilePart(path.replace(/\.[^.]+$/,""))}-${Date.now()}`);

  const endpoint=`https://api.cloudinary.com/v1_1/${encodeURIComponent(cfg.cloudName)}/image/upload`;
  const res=await fetch(endpoint,{method:"POST",body:form});

  let data={};
  try{data=await res.json();}catch(_e){}

  if(!res.ok || !data?.secure_url){
    const msg=String(data?.error?.message||`HTTP ${res.status}`);
    throw new Error("Hébergement photo impossible : "+msg);
  }

  return String(data.secure_url);
}

let firebaseStore=null;
let cloudReady=false;
let cloudApplying=false;
let cloudSaveTimer=null;
let cloudPollTimer=null;
let cloudLastRevision=0;
let cloudChannel=null;
let cloudRealtimeConnected=false;
let cloudHistoryRealtimeTimer=null;
let cloudLastHistoryRefreshAt=0;
const CLOUD_FALLBACK_POLL_MS=60000;
const CLOUD_HISTORY_FALLBACK_MS=10*60*1000;

/* ===== BPT 2.4.1 — Chat Live propre, commun à tous les participants ===== */





// Amorçage audio discret à la première interaction utilisateur.

let cloudLocalDirty=false;
let cloudLastError="";

function setCloudStatus(state,label,details=""){
  const el=document.getElementById("cloudStatus");
  const txt=document.getElementById("cloudStatusText");
  if(!el||!txt)return;

  el.classList.remove("ok","busy","offline");
  if(state)el.classList.add(state);
  txt.textContent=label;
  el.title=details||label;

  if(state==="ok"){
    window.BPT_LAST_SYNC_AT=Date.now();
  }

  if(typeof updateFirebaseDiagnostic==="function")updateFirebaseDiagnostic();
}

// Firebase réécrit les formes de données : un tableau vide disparaît (history:[] revient
// absent), un objet à clés numériques revient en tableau à trous (points {"6":{"1":18}}
// revient [null,…,[null,18,…]]) et un tableau à trous peut revenir en objet (players).
// Sans cette reconstitution, l'état distant était jugé invalide et chaque ouverture de
// l'appli réécrivait bpt/state/main avec la copie locale de l'appareil (joueurs, codes, réglages).
function bptRestoreFirebaseArrays(x){
  if(!x || typeof x!=="object")return x;
  const toObject=v=>Array.isArray(v)?Object.fromEntries(v.map((item,i)=>[String(i),item]).filter(([,item])=>item!=null)):v;
  if(x.history==null)x.history=[];
  if(x.players && typeof x.players==="object" && !Array.isArray(x.players))x.players=Object.values(x.players).filter(Boolean);
  if(Array.isArray(x.points)){
    x.points=toObject(x.points);
    for(const n of Object.keys(x.points))x.points[n]=toObject(x.points[n]);
  }
  if(x.playerAliases==null)x.playerAliases={};
  return x;
}

function isValidBptState(x){
  bptRestoreFirebaseArrays(x);
  return !!(
    x &&
    Array.isArray(x.players) &&
    Array.isArray(x.history) &&
    x.points &&
    typeof x.points==="object" &&
    !Array.isArray(x.points) &&
    x.settings &&
    typeof x.settings==="object"
  );
}

function cloudGameCount(state){
  if(!state || !Array.isArray(state.history))return 0;
  return new Set(state.history.map(r=>Number(r.game))).size;
}


let cloudHistoryReplaceOnce=false;

function historyGroups(history){
  const by=new Map();
  (history||[]).forEach(r=>{
    const g=Number(r.game)||0;
    if(!by.has(g))by.set(g,[]);
    by.get(g).push(r);
  });
  return [...by.entries()].sort((a,b)=>a[0]-b[0]);
}

function historyGameSignature(rows){
  const s=[...(rows||[])].sort((a,b)=>(Number(a.place)||999)-(Number(b.place)||999)||String(a.player||"").localeCompare(String(b.player||""),"fr"));
  const first=s[0]||{};
  return JSON.stringify({
    date:first.date||"",
    location:first.location||"",
    n:Number(first.n)||s.length,
    stake:Number(first.stake)||0,
    players:s.map(r=>[
      r.player||"",
      Number(r.place)||0,
      r.killer||""
    ])
  });
}



function saveLocalOnly(){
  try{localStorage.setItem(STORE,JSON.stringify(db));}catch(e){}
}

function cloudBuildLeanPayload(){
  return {
    players:clone(db?.players||[]),
    history:[],
    points:clone(db?.points||{}),
    settings:clone(db?.settings||{}),
    playerAliases:clone(db?.playerAliases||{}),
    liveState:null,
    liveWire:null,
    gamePhotos:{},
    playerPhotos:{}
  };
}

async function cloudPruneLegacyHeavyState(row){
  if(!firebaseStore || !row?.data || typeof row.data!=="object")return row;
  const gp=row.data.gamePhotos;
  const pp=row.data.playerPhotos;
  const hist=row.data.history;
  const hasLegacyPhotos=(gp && Object.keys(gp).length)||(pp && Object.keys(pp).length);
  const hasLegacyHistory=Array.isArray(hist) && hist.length>0;
  if(!hasLegacyPhotos && !hasLegacyHistory)return row;


  try{
    const cleaned=clone(row.data);
    cleaned.gamePhotos={};
    cleaned.playerPhotos={};
    cleaned.history=[];
    const {data,error}=await firebaseStore
      .from("bpt_state")
      .upsert({id:CLOUD_ROW_ID,data:cleaned},{onConflict:"id"})
      .select("data,revision,updated_at")
      .single();
    if(error)throw error;
    return data||{...row,data:cleaned};
  }catch(e){
    console.warn("BPT nettoyage état lourd différé :",e);
    return row;
  }
}

function cloudScheduleHistoryRefresh(){
  clearTimeout(cloudHistoryRealtimeTimer);
  cloudHistoryRealtimeTimer=setTimeout(async()=>{
    try{
      await refreshCanonicalHistoryUI(false);
      cloudLastHistoryRefreshAt=Date.now();
    }catch(e){ console.warn("BPT history realtime refresh:",e); }
  },600);
}

async function cloudFetchState(){
  if(!firebaseStore)return null;
  const {data,error}=await firebaseStore
    .from("bpt_state")
    .select("data,revision,updated_at")
    .eq("id",CLOUD_ROW_ID)
    .maybeSingle();
  if(error)throw error;
  return data;
}

// Corrections historiques approuvées, chacune appliquée une seule fois.
const BPT_APPROVED_TIME_CORRECTIONS={
  g_9gjfd8:{marker:'2026-09-25-franck-4h02',date:'2026-09-25',n:9,winner:'Michel SCHERPEREEL',second:'Franck NAESSENS',third:'Jérôme BINOT',thirdTime:'01:00:13',duration:14520,headsUp:1007,endTime:'01:17:00'},
  g_1dq0896:{marker:'2026-09-18-francois-headsup-20min',date:'2026-09-18',n:10,winner:'Franck NAESSENS',second:'François CATTEAU',third:'Alexis Volant',thirdTime:'01:35:00',thirdElapsed:15600,duration:16800,headsUp:1200,endTime:'01:55:00'}
};
function bptApprovedTimeCorrection(game,gameId=game?.id){
  const correction=BPT_APPROVED_TIME_CORRECTIONS[gameId];
  if(!game||!correction||game.bptApprovedTimeCorrection===correction.marker)return null;
  const rows=Array.isArray(game.game_data)?game.game_data:[];
  if(rows.length!==correction.n||rows.some(r=>r.date!==correction.date))return null;
  const second=rows.find(r=>r.player===correction.second&&Number(r.place)===2);
  const winner=rows.find(r=>r.player===correction.winner&&Number(r.place)===1);
  const third=rows.find(r=>r.player===correction.third&&Number(r.place)===3);
  if(!second||!winner||!third)return null;
  if(correction.thirdElapsed==null&&third.outTime!==correction.thirdTime)return null;
  if(correction.thirdElapsed!=null&&third.outTime&&third.outTime!==correction.thirdTime)return null;
  const corrected=rows.map(row=>{
    const next={...row,gameDurationSec:correction.duration,gameHeadsUpDurationSec:correction.headsUp,gameTimingSource:'historical'};
    if(row===second){next.outTime=correction.endTime;next.outElapsedSec=correction.duration;}
    if(row===third&&correction.thirdElapsed!=null){next.outTime=correction.thirdTime;next.outElapsedSec=correction.thirdElapsed;}
    return next;
  });
  return {...game,game_data:corrected,bptApprovedTimeCorrection:correction.marker};
}

async function cloudFetchGames(){
  if(!firebaseStore)return [];
  const {data,error}=await firebaseStore
    .from("bpt_games_v2")
    .select("id,game_key,game_data,created_at")
    .order("created_at",{ascending:true});
  if(error)throw error;

  // Transaction sur la partie concernée : conserve les modifications concurrentes
  // et n'écrase pas une éventuelle correction ultérieure de l'organisateur.
  const targets=(data||[]).filter(g=>bptApprovedTimeCorrection(g));
  if(window.bptFirebaseDb?.())for(const target of targets){
    try{
      const result=await window.bptFirebaseDb().ref('bpt/games/'+target.id).transaction(game=>bptApprovedTimeCorrection(game,target.id)||undefined);
      const saved=result.snapshot.val();
      if(saved){const index=data.indexOf(target);data[index]={...saved,id:target.id};}
    }catch(e){console.warn('Correction historique du temps différée :',e);}
  }

  const history=[];
  (data||[]).forEach((g,index)=>{
    const rows=Array.isArray(g.game_data)?g.game_data:[];
    rows.forEach(r=>history.push({...r,game:index+1,_cloudId:g.id,_gameKey:g.game_key}));
  });
  return history;
}

async function refreshCanonicalHistoryUI(showBusy=true){
  if(!firebaseStore || !cloudReady)return false;

  if(showBusy)setCloudStatus("busy","Actualisation…");

  try{
    const serverHistory=await cloudFetchGames();

    cloudApplying=true;
    if(typeof isArchiveSeason==="function" && isArchiveSeason()){
      currentSeasonHistoryCache=clone(serverHistory);
      if(typeof isAllSeasons==="function" && isAllSeasons()){
        db.history=buildAllSeasonsHistory();
        cloudApplying=false;
        renderAll();
      }else{
        cloudApplying=false;
      }
      const games=new Set(serverHistory.map(r=>Number(r.game))).size;
      setCloudStatus("ok",`Synchronisé • ${games} partie${games>1?"s":""}`,
        isAllSeasons()?`Saison courante synchronisée · cumul mis à jour`:`Saison courante synchronisée en arrière-plan · archives affichées`);
      return true;
    }
    db.history=applyPlayerAliasesToRows(recalcCurrentSeasonPoints(serverHistory));
    // Tant qu'une partie est encore en file d'attente locale, la conserver visible.
    pendingGamesMergeIntoLocalHistory();
    applyHistoricalPointScale();
    normalizeHistoryGameNumbers();
    saveLocalOnly();

    // IMPORTANT : les deux écrans sont recalculés dans le même passage,
    // à partir du même snapshot de l'historique serveur.
    renderDashboard();
    renderLatestGame();
    renderRanking();
    renderVersus();
    renderRecords();
    renderAchievements();
    renderProfile();
    renderHistory();

    if(correctionUnlocked)renderCorrectionGameList(null,false);
    cloudApplying=false;

    const games=cloudGameCount(db);
    const hh=new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    setCloudStatus(
      "ok",
      `Synchronisé • ${games} partie${games>1?"s":""}`,
      `Historique officiel : ${games} partie${games>1?"s":""} • ${hh}`
    );
    return true;
  }catch(e){
    cloudApplying=false;
    cloudLastError=e?.message||String(e);
    console.error("BPT canonical refresh:",e);
    setCloudStatus("offline","Erreur synchro",cloudLastError);
    return false;
  }
}


async function cloudInsertGame(rows){
  const clean=(rows||[]).map(r=>{
    const x={...r};
    delete x._cloudId;
    delete x._gameKey;
    delete x.game; // le numéro visible est attribué par ordre serveur
    return x;
  });

  const gameKey=historyGameSignature(clean);

  // UPSERT + contrainte UNIQUE côté Firebase :
  // même si deux navigateurs enregistrent la même partie simultanément,
  // une seule ligne officielle est conservée.
  const {data,error}=await firebaseStore
    .from("bpt_games_v2")
    .upsert({game_key:gameKey,game_data:clean},{onConflict:"game_key",ignoreDuplicates:true})
    .select("id,game_key,created_at");
  if(error)throw error;
  return data?.[0]||null;
}

const PENDING_GAMES_STORE=STORE+"_pending_games_v1";

function pendingGamesLoad(){
  try{
    const x=JSON.parse(localStorage.getItem(PENDING_GAMES_STORE)||"[]");
    return Array.isArray(x)?x:[];
  }catch(e){return [];}
}

function pendingGamesSave(list){
  try{localStorage.setItem(PENDING_GAMES_STORE,JSON.stringify(list||[]));}catch(e){}
}


function pendingGamesMergeIntoLocalHistory(){
  const pending=pendingGamesLoad();
  if(!pending.length)return 0;

  const groups=historyGroups(Array.isArray(db.history)?db.history:[]).map(([,rows])=>rows);
  const signatures=new Set(groups.map(rows=>historyGameSignature(rows)));
  let added=0;

  for(const rows of pending){
    if(!Array.isArray(rows)||!rows.length)continue;
    const sig=historyGameSignature(rows);
    if(signatures.has(sig))continue;
    signatures.add(sig);
    groups.push(rows);
    added++;
  }

  if(added){
    db.history=groups.flatMap((rows,i)=>rows.map(r=>({...r,game:i+1})));
    db.history=applyPlayerAliasesToRows(recalcCurrentSeasonPoints(db.history||[]));
    applyHistoricalPointScale();
    normalizeHistoryGameNumbers();
    saveLocalOnly();
  }
  return added;
}

let bptPendingRecoveryRunning=false;
async function recoverPendingGamesSafely(){
  if(bptPendingRecoveryRunning)return false;
  const pending=pendingGamesLoad();
  if(!pending.length)return true;

  bptPendingRecoveryRunning=true;
  try{
    const restored=pendingGamesMergeIntoLocalHistory();
    if(restored){
      try{renderAll();renderHistory();}catch(uiError){console.warn("BPT affichage récupération locale :",uiError);}
      setCloudStatus(
        "busy",
        `${pending.length} partie${pending.length>1?"s":""} à récupérer`,
        "Récupération des parties enregistrées localement…"
      );
    }

    if(!firebaseStore || !cloudReady)return false;
    const ok=await flushPendingGames();
    if(ok){
      try{await refreshCanonicalHistoryUI(false);}catch(_e){}
      return true;
    }
    return false;
  }catch(e){
    console.error("BPT récupération parties en attente :",e);
    return false;
  }finally{
    bptPendingRecoveryRunning=false;
  }
}

function queuePendingGame(rows){
  const clean=(rows||[]).map(r=>{
    const x={...r};
    delete x._cloudId;
    delete x._gameKey;
    return x;
  });
  const sig=historyGameSignature(clean);
  const q=pendingGamesLoad();
  if(!q.some(item=>historyGameSignature(item)===sig)){
    q.push(clean);
    pendingGamesSave(q);
  }
}

async function flushPendingGames(){
  if(!firebaseStore || !cloudReady)return false;
  const q=pendingGamesLoad();
  if(!q.length)return true;

  setCloudStatus("busy",`Envoi de ${q.length} partie${q.length>1?"s":""}…`);
  const remaining=[];

  for(const rows of q){
    try{
      await cloudInsertGame(rows);
    }catch(e){
      console.error("BPT pending game:",e);
      remaining.push(rows);
    }
  }

  pendingGamesSave(remaining);

  if(remaining.length){
    setCloudStatus("offline",`${remaining.length} partie${remaining.length>1?"s":""} en attente`,
      "Certaines parties n'ont pas encore pu être envoyées à Firebase.");
    return false;
  }

  await refreshCanonicalHistoryUI(false);
  return true;
}


async function cloudReplaceAllGames(localHistory){
  const {error:delErr}=await firebaseStore
    .from("bpt_games_v2")
    .delete()
    .not("id","is",null);
  if(delErr)throw delErr;

  const groups=historyGroups(localHistory);
  for(const [,rows] of groups){
    await cloudInsertGame(rows);
  }
}

async function cloudUpdateSingleGame(gameNo, rows){
  if(!firebaseStore)throw new Error("Firebase indisponible.");

  const current=(db.history||[]).filter(r=>Number(r.game)===Number(gameNo));
  const cloudId=current.find(r=>r._cloudId)?._cloudId;

  // Si l'identifiant serveur n'est pas disponible, relecture ciblée de l'historique.
  let id=cloudId;
  if(!id){
    const remote=await cloudFetchGames();
    id=remote.find(r=>Number(r.game)===Number(gameNo) && r._cloudId)?._cloudId;
  }
  if(!id)throw new Error("Impossible d’identifier la partie sur le serveur.");

  const clean=(rows||[]).map(r=>{
    const x={...r};
    delete x._cloudId;
    delete x._gameKey;
    delete x.game;
    return x;
  });

  const gameKey=historyGameSignature(rows);

  const {error}=await firebaseStore
    .from("bpt_games_v2")
    .update({game_key:gameKey,game_data:clean})
    .eq("id",id);

  if(error)throw error;
  return true;
}

async function cloudSyncGamesAdditive(){
  const remoteHistory=await cloudFetchGames();
  const remoteSigs=new Set(historyGroups(remoteHistory).map(([,rows])=>historyGameSignature(rows)));

  for(const [,rows] of historyGroups(db.history||[])){
    const sig=historyGameSignature(rows);
    if(!remoteSigs.has(sig)){
      await cloudInsertGame(rows);
      remoteSigs.add(sig);
    }
  }

  db.history=await cloudFetchGames();
  normalizeHistoryGameNumbers();
  saveLocalOnly();
}

async function cloudPushNow(){
  if(typeof isArchiveSeason==="function" && isArchiveSeason())return false;
  if(!firebaseStore || !cloudReady || cloudApplying)return false;
  setCloudStatus("busy","Synchronisation…");

  try{
    if(cloudHistoryReplaceOnce){
      await cloudReplaceAllGames(db.history||[]);
    }else{
      await cloudSyncGamesAdditive();
    }

    // BPT 2.5.1 : état partagé aminci, sans historique ni photos Base64.
    const payload=cloudBuildLeanPayload();

    const {data,error}=await firebaseStore
      .from("bpt_state")
      .upsert({id:CLOUD_ROW_ID,data:payload},{onConflict:"id"})
      .select("revision,updated_at")
      .single();
    if(error)throw error;

    // Recharge toujours l'historique officiel du serveur.
    db.history=applyPlayerAliasesToRows(recalcCurrentSeasonPoints(await cloudFetchGames()));
    applyHistoricalPointScale();
    normalizeHistoryGameNumbers();

    cloudLastRevision=Number(data?.revision||cloudLastRevision||0);
    cloudLocalDirty=false;
    cloudHistoryReplaceOnce=false;
    cloudLastError="";
    saveLocalOnly();

    renderAll();
    renderHistory();

    const hh=new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    const games=cloudGameCount(db);
    setCloudStatus("ok",`Synchronisé • ${games} partie${games>1?"s":""}`,
      `Historique officiel : ${games} partie${games>1?"s":""} • ${hh}`);
    return true;
  }catch(e){
    cloudLastError=e?.message||String(e);
    console.error("BPT cloud save:",e);
    setCloudStatus("offline","Erreur synchro",cloudLastError);
    return false;
  }
}

function scheduleCloudSave(){
  cloudLocalDirty=true;
  if(!cloudReady || cloudApplying)return;
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer=setTimeout(cloudPushNow,250);
}










async function applyCloudState(row){
  if(!row || !isValidBptState(row.data))return false;

  const rev=Number(row.revision||0);
  const remoteState=JSON.parse(JSON.stringify(row.data));
  remoteState.liveState=null;
  remoteState.liveWire=null;

  // La photothèque est additive : une photo déjà connue localement ne doit jamais
  // disparaître parce qu'un autre appareil possède un état plus ancien.
  const localGamePhotos=JSON.parse(JSON.stringify(ensureGamePhotos()));
  const localPlayerPhotos=JSON.parse(JSON.stringify(ensurePlayerPhotos()));
  remoteState.gamePhotos=mergePhotoMaps(remoteState.gamePhotos,localGamePhotos);
  remoteState.playerPhotos=mergePhotoMaps(remoteState.playerPhotos,localPlayerPhotos);

  cloudApplying=true;
  try{
    // L'état partagé continue d'être actualisé, mais la saison choisie
    // par l'utilisateur reste affichée pendant toute la visite.
    const liveSeasonKey=selectedSeasonKey;
    const serverHistory=await cloudFetchGames();
    currentSeasonHistoryCache=clone(serverHistory);

    db=remoteState;
    bptMigrateLegacyElenPlayerDirectory();
    saveLocalOnly();

    const displayedArchiveRows=archiveRowsForSeason(liveSeasonKey);
    if(Array.isArray(displayedArchiveRows)){
      db.history=applyPlayerAliasesToRows(displayedArchiveRows);
    }else if(liveSeasonKey==="all"){
      db.history=buildAllSeasonsHistory();
    }else{
      db.history=applyPlayerAliasesToRows(recalcCurrentSeasonPoints(serverHistory));
      applyHistoricalPointScale();
      normalizeHistoryGameNumbers();
      saveLocalOnly();
    }

    cloudLastRevision=rev;
    renderAll();
    try{ bptNotifySettingsPlayers(); }catch(_e){}

    const hh=new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    const games=new Set(serverHistory.map(r=>Number(r.game))).size;
    setCloudStatus("ok",`Synchronisé • ${games} partie${games>1?"s":""}`,
      liveSeasonKey===CURRENT_SEASON_KEY
        ? `Historique officiel : ${games} partie${games>1?"s":""} • révision ${rev} • ${hh}`
        : `Saison courante synchronisée en arrière-plan • saison affichée conservée`);
  }finally{
    cloudApplying=false;
  }
  return true;
}

async function cloudPoll(){
  if(!firebaseStore || !cloudReady || cloudApplying || document.hidden)return;

  try{
    if(cloudLocalDirty){
      await cloudPushNow();
      return;
    }

    // En secours seulement : l'historique est normalement actualisé par Realtime.
    if(!cloudRealtimeConnected && Date.now()-cloudLastHistoryRefreshAt>=CLOUD_HISTORY_FALLBACK_MS){
      await refreshCanonicalHistoryUI(false);
      cloudLastHistoryRefreshAt=Date.now();
    }

  }catch(e){
    cloudLastError=e?.message||String(e);
    console.error("BPT cloud poll:",e);
    setCloudStatus("offline","Erreur synchro",cloudLastError);
  }
}



async function forceCloudSync(){
  if(!firebaseStore){
    await initCloudSync();
    return;
  }

  if(cloudLocalDirty){
    await cloudPushNow();
    return;
  }

  const remote=await cloudFetchState();
  if(remote && isValidBptState(remote.data)){
    await applyCloudState(remote);
  }else{
    await refreshCanonicalHistoryUI(true);
  }
}

async function initCloudSync(){
  setCloudStatus("busy","Connexion…");

  if(!window.BPTFirebaseStore){
    setCloudStatus("offline","Firebase indisponible","L’adaptateur Firebase n'a pas été chargé.");
    return;
  }

  try{
    firebaseStore=window.BPTFirebaseStore;

    // 1) PRIORITÉ ABSOLUE : état partagé / Live.
    // Le Live spectateur ne dépend plus de bpt_games_v2.
    let row=await cloudFetchState();
    if(row && isValidBptState(row.data))row=await cloudPruneLegacyHeavyState(row);

    if(row && isValidBptState(row.data)){
      cloudLastRevision=Number(row.revision||0);
      cloudApplying=true;

      const localHistory=Array.isArray(db.history)?db.history:[];
      const localGamePhotos=JSON.parse(JSON.stringify(ensureGamePhotos()));
      const remoteState=JSON.parse(JSON.stringify(row.data));
      db=remoteState;
      db.history=localHistory; // historique temporaire conservé jusqu'au fetch dédié
      // Conserve d'éventuelles anciennes photos locales Base64 jusqu'à leur migration Storage.
      db.gamePhotos=mergePhotoMaps(db.gamePhotos,localGamePhotos);
      cloudLocalDirty=false;
      cloudApplying=false;

      cloudReady=true;
      cloudLastError="";
      saveLocalOnly();

      renderAll();
      setCloudStatus(
        "ok",
        "Connecté",
        `État partagé Firebase reçu • révision ${cloudLastRevision}`
      );

      // 2) HISTORIQUE : tentative séparée, jamais bloquante pour le Live.
      try{
        const serverHistory=await cloudFetchGames();
        currentSeasonHistoryCache=clone(serverHistory);

        const displayedArchiveRows=archiveRowsForSeason(selectedSeasonKey);
        if(Array.isArray(displayedArchiveRows)){
          db.history=applyPlayerAliasesToRows(displayedArchiveRows);
        }else if(selectedSeasonKey==="all"){
          db.history=buildAllSeasonsHistory();
        }else{
          db.history=applyPlayerAliasesToRows(recalcCurrentSeasonPoints(serverHistory));
          applyHistoricalPointScale();
          normalizeHistoryGameNumbers();
        }

        saveLocalOnly();
        renderAll();

        const games=new Set(serverHistory.map(r=>Number(r.game))).size;
        setCloudStatus(
          "ok",
          `Synchronisé • ${games} partie${games>1?"s":""}`,
          `État partagé + historique opérationnels • révision ${cloudLastRevision}`
        );
      }catch(historyError){
        console.warn("Historique indisponible, Live maintenu :",historyError);
        setCloudStatus(
          "ok",
          "Live connecté",
          `État partagé opérationnel. Historique temporairement indisponible.`
        );
      }

    }else if(!row){
      // Première initialisation globale.
      const initialHistory=Array.isArray(db.history)?clone(db.history):[];
      const payload=cloudBuildLeanPayload();

      const {data,error}=await firebaseStore
        .from("bpt_state")
        .upsert({id:CLOUD_ROW_ID,data:payload},{onConflict:"id"})
        .select("revision,updated_at")
        .single();
      if(error)throw error;

      cloudLastRevision=Number(data?.revision||0);
      cloudReady=true;
      cloudLocalDirty=false;
      cloudLastError="";
      setCloudStatus("ok","Connecté","État partagé Firebase initialisé.");

      // Migration historique non bloquante.
      try{
        if((await cloudFetchGames()).length===0 && initialHistory.length>0){
          for(const [,rows] of historyGroups(initialHistory)){
            await cloudInsertGame(rows);
          }
        }
        db.history=await cloudFetchGames();
        saveLocalOnly();
        renderAll();
      }catch(historyError){
        console.warn("Migration historique différée :",historyError);
      }
    }else{
      // Firebase répond, mais un premier essai de migration a pu laisser un état
      // partiel/incompatible. Comme ce backend vient d'être créé pour BPT, on
      // réinitialise alors l'état partagé à partir de l'état local du PC organisateur.
      console.warn("BPT Firebase : état distant incomplet, réinitialisation depuis les données locales.");
      const initialHistory=Array.isArray(db.history)?clone(db.history):[];
      const payload=cloudBuildLeanPayload();

      const {data,error}=await firebaseStore
        .from("bpt_state")
        .upsert({id:CLOUD_ROW_ID,data:payload},{onConflict:"id"})
        .select("revision,updated_at")
        .single();
      if(error)throw error;

      cloudLastRevision=Number(data?.revision||0);
      cloudReady=true;
      cloudLocalDirty=false;
      cloudLastError="";
      saveLocalOnly();
      renderAll();
      setCloudStatus("ok","Connecté","État Firebase réparé et initialisé depuis ce PC.");

      // Si l'historique distant est encore vide, recopier l'historique local.
      try{
        if((await cloudFetchGames()).length===0 && initialHistory.length>0){
          for(const [,rows] of historyGroups(initialHistory)){
            await cloudInsertGame(rows);
          }
        }
        db.history=await cloudFetchGames();
        saveLocalOnly();
        renderAll();
      }catch(historyError){
        console.warn("Migration historique après réparation différée :",historyError);
      }
    }

    // Realtime : le Live reste prioritaire.
    try{
      cloudChannel=firebaseStore
        .channel("bpt-shared-state")
        .on(
          "postgres_changes",
          {event:"*",schema:"public",table:"bpt_state",filter:"id=eq."+CLOUD_ROW_ID},
          async payload=>{
            try{
              // Le payload postgres contient déjà la ligne modifiée : pas de SELECT supplémentaire.
              let fresh=payload?.new;
              if(!fresh || !isValidBptState(fresh.data))fresh=await cloudFetchState();
              if(!fresh || !isValidBptState(fresh.data))return;
              await applyCloudState(fresh);
            }catch(e){
              console.error("BPT realtime:",e);
            }
          }
        )
        .on(
          "postgres_changes",
          {event:"*",schema:"public",table:"bpt_games_v2"},
          ()=>cloudScheduleHistoryRefresh()
        )
        .subscribe(status=>{
          cloudRealtimeConnected=(status==="SUBSCRIBED");
        });
    }catch(e){
      console.warn("Realtime indisponible, polling utilisé :",e);
    }

    clearInterval(cloudPollTimer);
    cloudPollTimer=setInterval(()=>{ if(!cloudRealtimeConnected)cloudPoll(); },CLOUD_FALLBACK_POLL_MS);

    // BPT 2.7.4 : si cet appareil possède encore d'anciennes photos Base64 locales,
    // tente de les migrer une fois vers Firebase sans bloquer le démarrage.
    setTimeout(()=>migrateLegacyLocalGamePhotosToStorage().catch(e=>console.warn("Migration photos :",e)),500);

    // V4.42 : republie automatiquement les parties restées locales après une erreur ou une coupure.
    setTimeout(()=>recoverPendingGamesSafely().catch(e=>console.warn("Récupération parties en attente :",e)),900);

  }catch(e){
    cloudApplying=false;
    cloudLastError=e?.message||String(e);
    console.error("BPT cloud init:",e);
    cloudReady=false;
    setCloudStatus("offline","Erreur synchro",cloudLastError);
  }
}

document.addEventListener("visibilitychange",()=>{
  if(!document.hidden && firebaseStore && cloudReady){
    // Un seul contrôle léger au retour au premier plan.
    cloudPoll();
    recoverPendingGamesSafely().catch(e=>console.warn("Récupération parties en attente :",e));
  }
});

window.addEventListener("online",async()=>{
  if(!firebaseStore){
    await initCloudSync();
  }else{
    cloudReady=true;
    await forceCloudSync();
    await recoverPendingGamesSafely();
  }
});
window.addEventListener("offline",()=>setCloudStatus("offline","Hors connexion"));

function dedupeHistory(history){
  const byGame=new Map();
  (history||[]).forEach(r=>{
    if(!byGame.has(r.game))byGame.set(r.game,[]);
    byGame.get(r.game).push(r);
  });

  const seen=new Set();
  const kept=[];
  const ordered=[...byGame.entries()].sort((a,b)=>Number(a[0])-Number(b[0]));

  for(const [gameNo,rows] of ordered){
    const sigRows=[...rows].sort((a,b)=>(a.place||999)-(b.place||999)||String(a.player||"").localeCompare(String(b.player||""),"fr"));
    const first=sigRows[0]||{};
    const sig=JSON.stringify({
      date:first.date||"",
      location:first.location||"",
      rows:sigRows.map(r=>[r.player||"",r.place||0,r.killer||"",Number(r.points||0),Number(r.stake||0),Number(r.gross||0)])
    });
    if(seen.has(sig))continue;
    seen.add(sig);
    kept.push([gameNo,rows]);
  }

  // Renumérotation continue des parties conservées.
  const renum=new Map(kept.map(([g],i)=>[g,i+1]));
  return kept.flatMap(([g,rows])=>rows.map(r=>({...r,game:renum.get(g)})));
}

function loadDB(){
  try{
    const x=JSON.parse(localStorage.getItem(STORE));
    if(x&&x.players&&x.history&&x.points){
      const before=x.history.length;
      x.history=dedupeHistory(x.history);
      if(x.history.length!==before)localStorage.setItem(STORE,JSON.stringify(x));
      return x;
    }
  }catch(e){}
  const fresh=clone(SEED);
  fresh.history=dedupeHistory(fresh.history);
  return fresh;
}
let db = loadDB();

// Migration de référentiel : ancienne entrée locale/cloud « Elen » -> « Elen Miron ».
// La correction est faite dans db.players lui-même afin que Paramètres et Connexion
// lisent strictement la même source, sans registre parallèle ni filtre spécifique au login.
function bptMigrateLegacyElenPlayerDirectory(){
  if(!Array.isArray(db?.players))return false;
  const key=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim().toLocaleLowerCase("fr");
  const legacyKey='elen', canonicalKey='elen miron', canonicalName='Elen Miron';
  const legacy=db.players.filter(p=>key(p?.name)===legacyKey);
  let canonicals=db.players.filter(p=>key(p?.name)===canonicalKey);
  if(!legacy.length && canonicals.length<=1)return false;

  let target=canonicals[0]||null;
  if(!target && legacy.length){
    target=legacy[0];
    target.name=canonicalName;
  }
  if(!target)return false;

  const all=[...canonicals,...legacy].filter((p,i,a)=>p&&a.indexOf(p)===i);
  for(const src of all){
    if(src===target)continue;
    if(src.active===true)target.active=true;
    for(const field of ['nickname','avatarId']){
      if(!target[field] && src[field])target[field]=src[field];
    }
  }
  target.name=canonicalName;
  db.players=db.players.filter(p=>p===target || (key(p?.name)!==legacyKey && key(p?.name)!==canonicalKey));
  return true;
}
if(bptMigrateLegacyElenPlayerDirectory())saveLocalOnly();

// Référentiel unique des joueurs : exactement le tableau affiché dans Paramètres > Joueurs.
// Le login ne doit jamais charger une autre liste de son côté.
function bptSettingsPlayersSnapshot(){
  if(bptMigrateLegacyElenPlayerDirectory())saveLocalOnly();
  return JSON.parse(JSON.stringify(Array.isArray(db?.players)?db.players:[]));
}
window.bptWaitForSettingsPlayers=async (timeoutMs=10000)=>{
  const started=Date.now();
  while((!cloudReady || cloudApplying) && Date.now()-started<timeoutMs){
    await new Promise(resolve=>setTimeout(resolve,80));
  }
  return bptSettingsPlayersSnapshot();
};
function bptNotifySettingsPlayers(){
  try{
    window.dispatchEvent(new CustomEvent('bpt:settings-players-changed',{detail:{players:bptSettingsPlayersSnapshot()}}));
  }catch(_e){}
}

// Un Live distant conservé dans localStorage ne doit jamais être utilisé comme source.
// Seul le navigateur créateur conserve son Live local ; les spectateurs relisent Firebase.

function saveDB(){
  saveLocalOnly();
  scheduleCloudSave();
}





function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
function euro(n){return Number(n||0).toLocaleString("fr-FR",{minimumFractionDigits:0,maximumFractionDigits:2})+" €";}
function shortDate(v){
  const s=String(v||"").trim();
  const m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1].slice(2)}` : s;
}
function num(n,d=1){return Number(n||0).toLocaleString("fr-FR",{maximumFractionDigits:d});}
const HISTORICAL_POINTS_2026={"6":{"1":16,"2":12,"3":8,"4":5,"5":3,"6":1},"7":{"1":19,"2":15,"3":11,"4":8,"5":5,"6":3,"7":1},"8":{"1":23,"2":18,"3":14,"4":11,"5":8,"6":5,"7":3,"8":1},"9":{"1":27,"2":22,"3":17,"4":13,"5":10,"6":8,"7":5,"8":3,"9":1},"10":{"1":32,"2":26,"3":21,"4":17,"5":14,"6":11,"7":8,"8":5,"9":3,"10":1},"11":{"1":34,"2":28,"3":23,"4":19,"5":16,"6":13,"7":10,"8":7,"9":5,"10":3,"11":1},"12":{"1":36,"2":30,"3":25,"4":21,"5":18,"6":15,"7":12,"8":9,"9":7,"10":5,"11":3,"12":1},"13":{"1":38,"2":32,"3":27,"4":23,"5":20,"6":17,"7":14,"8":11,"9":9,"10":7,"11":5,"12":3,"13":1},"14":{"1":39,"2":33,"3":28,"4":24,"5":21,"6":18,"7":15,"8":12,"9":10,"10":8,"11":6,"12":4,"13":2,"14":1},"15":{"1":40,"2":34,"3":29,"4":25,"5":22,"6":19,"7":16,"8":13,"9":11,"10":9,"11":7,"12":5,"13":3,"14":2,"15":1},"16":{"1":41,"2":35,"3":30,"4":26,"5":23,"6":20,"7":17,"8":14,"9":12,"10":10,"11":8,"12":6,"13":4,"14":3,"15":2,"16":1},"17":{"1":42,"2":36,"3":31,"4":27,"5":24,"6":21,"7":18,"8":15,"9":13,"10":11,"11":9,"12":7,"13":5,"14":4,"15":3,"16":2,"17":1},"18":{"1":43,"2":37,"3":32,"4":28,"5":25,"6":22,"7":19,"8":16,"9":14,"10":12,"11":10,"12":8,"13":6,"14":5,"15":4,"16":3,"17":2,"18":1},"19":{"1":44,"2":38,"3":33,"4":29,"5":26,"6":23,"7":20,"8":17,"9":15,"10":13,"11":11,"12":9,"13":7,"14":6,"15":5,"16":4,"17":3,"18":2,"19":1},"20":{"1":45,"2":39,"3":34,"4":30,"5":27,"6":24,"7":21,"8":18,"9":16,"10":14,"11":12,"12":10,"13":8,"14":7,"15":6,"16":5,"17":4,"18":3,"19":2,"20":1},"21":{"1":46,"2":40,"3":35,"4":31,"5":28,"6":25,"7":22,"8":19,"9":17,"10":15,"11":13,"12":11,"13":9,"14":8,"15":7,"16":6,"17":5,"18":4,"19":3,"20":2,"21":1},"22":{"1":47,"2":41,"3":36,"4":32,"5":29,"6":26,"7":23,"8":20,"9":18,"10":16,"11":14,"12":12,"13":10,"14":9,"15":8,"16":7,"17":6,"18":5,"19":4,"20":3,"21":2,"22":1}};

const BPT_POINTS_LOCAL_KEY="bpt_points_table_v2";
function bptDefaultPointsTable(){ return JSON.parse(JSON.stringify(HISTORICAL_POINTS_2026)); }
function bptNormalizePointsTable(table){
  const out=bptDefaultPointsTable();
  const src=(table&&typeof table==="object")?table:{};
  for(let n=6;n<=22;n++){
    const row=src[String(n)];
    if(!row||typeof row!=="object")continue;
    for(let place=1;place<=n;place++){
      const v=Number(row[String(place)]);
      if(Number.isFinite(v)&&v>=0)out[String(n)][String(place)]=v;
    }
  }
  return out;
}
function bptLoadPointsLocal(){
  try{ const raw=localStorage.getItem(BPT_POINTS_LOCAL_KEY); if(raw)return bptNormalizePointsTable(JSON.parse(raw)); }catch(_e){}
  return bptDefaultPointsTable();
}
let BPT_POINTS_TABLE=bptLoadPointsLocal();
function bptGetPointsTable(){ return BPT_POINTS_TABLE; }
function bptSetPointsTable(table){
  BPT_POINTS_TABLE=bptNormalizePointsTable(table);
  try{localStorage.setItem(BPT_POINTS_LOCAL_KEY,JSON.stringify(BPT_POINTS_TABLE));}catch(_e){}
  return BPT_POINTS_TABLE;
}

function applyHistoricalPointScale(){
  if(!db.points)db.points={};
  for(const [n,row] of Object.entries(bptGetPointsTable())){
    db.points[n]={...db.points[n],...row};
  }
}

function recalcCurrentSeasonPoints(rows){
  const pointsTable=bptGetPointsTable();
  return (rows||[]).map(r=>{
    const n=Number(r.n)||0;
    const place=Number(r.place)||0;
    const table=pointsTable[String(n)];
    if(!table)return {...r};
    return {...r,points:Number(table[String(place)]||0)};
  });
}

function pointsFor(place,n){
  n=Number(n)||0;
  if(n<6)return 0;
  const configured=bptGetPointsTable()[String(n)]?.[String(place)];
  if(configured!==undefined)return Number(configured||0);
  return Number(db.points[String(n)]?.[String(place)]||0);
}

function normalizeHistoryGameNumbers(){
  if(!Array.isArray(db.history))db.history=[];
  const groups=new Map();

  for(const r of db.history){
    const g=Number(r.game);
    if(!Number.isFinite(g) || g<=0)continue;
    if(!groups.has(g))groups.set(g,[]);
    groups.get(g).push(r);
  }

  // Renumérote 1..N sans trou pour que Dashboard, Historique,
  // Classement et "dernière partie" partagent exactement les mêmes numéros.
  const ordered=[...groups.entries()].sort((a,b)=>a[0]-b[0]);
  db.history=ordered.flatMap(([,rows],i)=>rows.map(r=>({...r,game:i+1})));
}

function groupedGames(){
  const m=new Map();
  for(const r of db.history){if(!m.has(r.game))m.set(r.game,[]);m.get(r.game).push(r);}
  return [...m.entries()].sort((a,b)=>a[0]-b[0]);
}
function nextGameNo(){const gs=groupedGames();return gs.length?Math.max(...gs.map(x=>x[0]))+1:1;}

function stats(excludeLatest=false){
  let rows=db.history;
  if(excludeLatest){
    const games=groupedGames(); if(games.length){const last=games[games.length-1][0];rows=rows.filter(r=>r.game!==last);}
  }
  const by={};
  for(const p of db.players){
    const name=canonicalPlayerName(p.name);
    if(!by[name])by[name]={name,points:0,games:new Set(),wins:0,podiums:0,tabliers:0,kills:0,stake:0,gross:0,net:0};
  }
  for(const r of rows){
    const name=canonicalPlayerName(r.player);
    if(!by[name])by[name]={name,points:0,games:new Set(),wins:0,podiums:0,tabliers:0,kills:0,stake:0,gross:0,net:0};
    const s=by[name];s.points+=Number(r.points||0);s.games.add(r.game);
    s.wins+=r.win?1:0;s.podiums+=r.podium?1:0;s.tabliers+=isTablierRow(r)?1:0;s.kills+=Number(r.kills||0);
    s.stake+=Number(r.stake||0);s.gross+=Number(r.gross||0);s.net+=Number(r.net||0);
  }
  const out=Object.values(by).map(s=>({
    ...s,
    gamesCount:s.games.size,
    avgPoints:s.games.size?s.points/s.games.size:0,
    winRate:s.games.size?(s.wins/s.games.size)*100:0,
    podiumRate:s.games.size?(s.podiums/s.games.size)*100:0,
    kpg:s.games.size?s.kills/s.games.size:0
  }));
  if(!excludeLatest && typeof isAllSeasons==="function" && isAllSeasons())return mergeAllSeasonsOfficialStats(out);
  return (!excludeLatest && typeof mergeArchiveOfficialStats==="function") ? mergeArchiveOfficialStats(out) : out;
}
function ranking(){
  const cur=stats(false).filter(s=>s.gamesCount>0).sort((a,b)=>b.points-a.points||b.avgPoints-a.avgPoints||a.name.localeCompare(b.name,"fr"));
  if(typeof isAllSeasons==="function" && isAllSeasons()){
    return cur.map((s,i)=>({...s,rank:i+1,progress:null}));
  }
  if(typeof isArchiveSeason==="function" && isArchiveSeason()){
    const official=archiveOfficialRanking();
    if(Array.isArray(official)){
      const byName=new Map(cur.map(s=>[s.name,s]));
      return official.map(o=>({...byName.get(o.name),...o,progress:null}));
    }
  }
  const prev=stats(true).filter(s=>s.gamesCount>0).sort((a,b)=>b.points-a.points||b.avgPoints-a.avgPoints||a.name.localeCompare(b.name,"fr"));
  const prevRank=new Map(prev.map((s,i)=>[s.name,i+1]));
  return cur.map((s,i)=>({...s,rank:i+1,progress:prevRank.has(s.name)?prevRank.get(s.name)-(i+1):null}));
}
function killerStats(){
  const pair={}, asK={}, asV={};
  for(const r of db.history){
    if(!r.killer)continue;
    const killer=canonicalPlayerName(r.killer);
    const victim=canonicalPlayerName(r.player);
    if(!killer || !victim)continue;
    const key=killer+"|||"+victim;pair[key]=(pair[key]||0)+1;
    asK[killer]=asK[killer]||{};asK[killer][victim]=(asK[killer][victim]||0)+1;
    asV[victim]=asV[victim]||{};asV[victim][killer]=(asV[victim][killer]||0)+1;
  }
  const topEntry=o=>{
    if(!o)return null;
    const hit=Object.entries(o).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],"fr"))[0];
    return hit?{name:hit[0],count:Number(hit[1]||0)}:null;
  };
  return {
    pair,
    mainVictim:n=>topEntry(asK[canonicalPlayerName(n)])?.name||"",
    mainKiller:n=>topEntry(asV[canonicalPlayerName(n)])?.name||"",
    mainVictimEntry:n=>topEntry(asK[canonicalPlayerName(n)]),
    mainKillerEntry:n=>topEntry(asV[canonicalPlayerName(n)])
  };
}


function medalForRank(rank){
  return rank===1?"🥇":rank===2?"🥈":rank===3?"🥉":"";
}


function longestPlayerStreak(name,predicate){
  const rows=(db.history||[]).filter(r=>r.player===name).sort((a,b)=>Number(a.game)-Number(b.game));
  let best=0,cur=0;
  for(const r of rows){cur=predicate(r)?cur+1:0;if(cur>best)best=cur;}
  return best;
}

function longestParticipationRun(name){
  const gs=[...new Set((db.history||[]).filter(r=>r.player===name).map(r=>Number(r.game)))].sort((a,b)=>a-b);
  let best=0,cur=0,prev=null;
  for(const g of gs){cur=(prev!==null&&g===prev+1)?cur+1:1;best=Math.max(best,cur);prev=g;}
  return best;
}


function allAvailableSeasonSets(){
  return [
    {key:"2020-2021",label:"2020–2021",rows:applyPlayerAliasesToRows(ARCHIVE_2020_2021),ranking:null},
    {key:"2022-2023",label:"2022–2023",rows:applyPlayerAliasesToRows(ARCHIVE_2022_2023),ranking:null},
    {key:"2023-2024",label:"2023–2024",rows:applyPlayerAliasesToRows(ARCHIVE_2023_2024),ranking:mergeRankingAliases(ARCHIVE_2023_2024_RANKING)},
    {key:"2025-2026",label:"2025–2026",rows:applyPlayerAliasesToRows(ARCHIVE_2025_2026),ranking:mergeRankingAliases(ARCHIVE_2025_2026_RANKING)},
    {key:"2026-2027",label:"2026–2027",rows:currentRowsForCumulative(),ranking:null}
  ];
}


function seasonSummaryData(season){
  const rows=Array.isArray(season?.rows)?season.rows:[];
  const statsList=statsFromRows(rows).filter(s=>s.gamesCount>0);
  const games=new Set(rows.map(r=>{
    const gameNo=Number(r.sourceGame||r.game||0);
    if(!(gameNo>0))return null;
    const seasonKey=String(r.seasonKey||season?.key||'');
    return `${seasonKey}|${gameNo}`;
  }).filter(Boolean));
  const players=new Set(rows.map(r=>canonicalPlayerName(r.player)).filter(Boolean));
  const ranked=(season?.ranking&&season.ranking.length?season.ranking:rankingFromRows(rows)).filter(r=>Number(r.gamesCount||0)>0 || Number(r.points||0)>0);
  const champion=[...ranked].sort((a,b)=>Number(b.points||0)-Number(a.points||0)||String(a.name).localeCompare(String(b.name),'fr'))[0]||null;
  const wins=statsList.reduce((n,s)=>n+Number(s.wins||0),0);
  return {games:games.size,players:players.size,champion,wins};
}

function renderSeasonHistoryScreen(){
  const holder=document.getElementById('seasonHistoryGrid');
  if(!holder)return;
  const allSeasons=[...allAvailableSeasonSets()];
  const seasons=allSeasons.filter(season=>season.key!==CURRENT_SEASON_KEY).sort((a,b)=>String(b.key).localeCompare(String(a.key)));
  const cumulativeRows=allSeasons.flatMap(season=>(season.rows||[]).map(r=>({...r,seasonKey:season.key,seasonLabel:season.label})));
  const cumulativeStats=seasonSummaryData({rows:cumulativeRows,ranking:rankingFromRows(cumulativeRows)});
  const cumulativeCard=`<article class="season-history-card cumulative">
      <div class="season-status">Toutes saisons</div>
      <h3>Cumul toutes saisons</h3>
      <div class="season-history-metrics">
        <div class="season-history-metric"><span>Parties</span><strong>${cumulativeStats.games}</strong></div>
        <div class="season-history-metric"><span>Joueurs</span><strong>${cumulativeStats.players}</strong></div>
        <div class="season-history-metric"><span>Victoires enregistrées</span><strong>${cumulativeStats.wins}</strong></div>
        <div class="season-history-metric"><span>Statut</span><strong>Cumul</strong></div>
      </div>
      <div class="season-history-champion"><span class="muted">Leader carrière aux points</span><br><strong>${cumulativeStats.champion?playerDisplayWithRealName(cumulativeStats.champion.name):'—'}</strong>${cumulativeStats.champion?` · ${num(cumulativeStats.champion.points,0)} pts`:''}</div>
      <button class="btn secondary" type="button" onclick="openSeasonFromHistory('all')">Ouvrir le cumul</button>
    </article>`;
  const seasonCards=seasons.map(season=>{
    const x=seasonSummaryData(season);
    return `<article class="season-history-card">
      <div class="season-status">Archive BPT</div>
      <h3>${esc(season.label)}</h3>
      <div class="season-history-metrics">
        <div class="season-history-metric"><span>Parties</span><strong>${x.games}</strong></div>
        <div class="season-history-metric"><span>Joueurs</span><strong>${x.players}</strong></div>
        <div class="season-history-metric"><span>Victoires enregistrées</span><strong>${x.wins}</strong></div>
        <div class="season-history-metric"><span>Statut</span><strong>Clôturée</strong></div>
      </div>
      <div class="season-history-champion"><span class="muted">Leader aux points</span><br><strong>${x.champion?playerDisplayWithRealName(x.champion.name):'—'}</strong>${x.champion?` · ${num(x.champion.points,0)} pts`:''}</div>
      <button class="btn secondary" type="button" onclick="openSeasonFromHistory('${season.key}')">Ouvrir le classement</button>
    </article>`;
  }).join('');
  holder.innerHTML=seasonCards+cumulativeCard;
}

async function openSeasonFromHistory(key){
  await selectSeason(key);
  await showView('ranking');
}

function bestSeasonRankForPlayer(name){
  let best=null;
  for(const season of allAvailableSeasonSets()){
    const ranked=(season.ranking&&season.ranking.length?season.ranking:rankingFromRows(season.rows)).filter(r=>Number(r.gamesCount||0)>0||Number(r.points||0)>0);
    ranked.sort((a,b)=>Number(b.points||0)-Number(a.points||0)||String(a.name).localeCompare(String(b.name),'fr'));
    const idx=ranked.findIndex(r=>canonicalPlayerName(r.name)===canonicalPlayerName(name));
    if(idx>=0 && (!best || idx+1<best.rank))best={rank:idx+1,season:season.label};
  }
  return best;
}

function renderCareerRatioSummary(){
  const holder=document.getElementById('careerRatioSummary');
  if(!holder)return;
  if(!isAllSeasons()){holder.hidden=true;holder.innerHTML='';return;}
  holder.hidden=false;
  const rows=[...ranking()].sort((a,b)=>Number(b.points||0)-Number(a.points||0));
  const leader=rows[0];
  const bestWin=[...rows].filter(r=>r.gamesCount>=5).sort((a,b)=>Number(b.winRate||0)-Number(a.winRate||0)||Number(b.wins||0)-Number(a.wins||0))[0];
  const bestPod=[...rows].filter(r=>r.gamesCount>=5).sort((a,b)=>Number(b.podiumRate||0)-Number(a.podiumRate||0)||Number(b.podiums||0)-Number(a.podiums||0))[0];
  const bestKpg=[...rows].filter(r=>r.gamesCount>=5).sort((a,b)=>Number(b.kpg||0)-Number(a.kpg||0)||Number(b.kills||0)-Number(a.kills||0))[0];
  const mostActive=[...rows].sort((a,b)=>Number(b.gamesCount||0)-Number(a.gamesCount||0))[0];
  const bestSeason=leader?bestSeasonRankForPlayer(leader.name):null;
  const card=(label,who,value,small='')=>`<div class="career-ratio-card"><span>${label}</span><strong>${esc(value||'—')}</strong><small>${esc(who||'')}${small?` · ${esc(small)}`:''}</small></div>`;
  holder.innerHTML=[
    card('Leader carrière',leader?.name,leader?`${num(leader.points,0)} pts`:'—',bestSeason?`meilleur rang #${bestSeason.rank} (${bestSeason.season})`:''),
    card('Meilleur taux de victoire',bestWin?.name,bestWin?`${num(bestWin.winRate,1)} %`:'—',bestWin?`${bestWin.wins}/${bestWin.gamesCount}`:''),
    card('Meilleur taux de podium',bestPod?.name,bestPod?`${num(bestPod.podiumRate,1)} %`:'—',bestPod?`${bestPod.podiums}/${bestPod.gamesCount}`:''),
    card('Meilleur ratio kills',bestKpg?.name,bestKpg?`${num(bestKpg.kpg,2)} / partie`:'—',bestKpg?`${bestKpg.kills} kills`:''),
    card('Plus assidu',mostActive?.name,mostActive?`${mostActive.gamesCount} parties`:'—')
  ].join('');
}

function consistencyDiagnosticData(){
  const issues=[];
  let checkedGames=0,checkedRows=0;
  const all=allAvailableSeasonSets();
  for(const season of all){
    const rows=season.rows||[]; checkedRows+=rows.length;
    const groups=groupedGamesFromRows(rows); checkedGames+=groups.length;
    for(const [game,grows] of groups){
      const names=new Set(),places=new Set();
      for(const r of grows){
        const name=canonicalPlayerName(r.player);
        if(names.has(name))issues.push({level:'error',title:`${season.label} · partie ${game}`,detail:`Joueur en double : ${name}`});
        names.add(name);
        const place=Number(r.place||0);
        if(place>0){if(places.has(place))issues.push({level:'error',title:`${season.label} · partie ${game}`,detail:`Place ${place} attribuée plusieurs fois.`});places.add(place);}
        const n=Number(r.n||0); if(n>0 && n!==grows.length)issues.push({level:'warn',title:`${season.label} · partie ${game}`,detail:`Nombre de joueurs annoncé ${n}, lignes présentes ${grows.length}.`});
        if(r.tablier!==undefined && Boolean(r.tablier)!==Boolean(isTablierRow({...r,seasonKey:season.key})))issues.push({level:'warn',title:`${season.label} · partie ${game}`,detail:`Ancien indicateur de tablier différent de la règle de saison ; le recalcul automatique fait foi.`});
      }
    }
  }
  const canonicalSeen=new Map();
  for(const p of (db.players||[])){
    const c=canonicalPlayerName(p.name);
    if(canonicalSeen.has(c) && canonicalSeen.get(c)!==p.name)issues.push({level:'error',title:'Référentiel joueurs',detail:`Doublon d'identité : ${canonicalSeen.get(c)} / ${p.name}`});
    else canonicalSeen.set(c,p.name);
  }
  return {issues,checkedGames,checkedRows,seasons:all.length};
}

async function renderConsistencyDiagnostic(force=false){
  const summary=document.getElementById('consistencyDiagnosticSummary');
  const list=document.getElementById('consistencyDiagnosticList');
  if(!summary||!list)return;
  const d=consistencyDiagnosticData();
  let bettingIssue=null;
  try{
    const dbx=window.bptFirebaseDb?.();
    if(dbx?.ref){
      const snap=await dbx.ref('bpt/bettingLedger/sessions').once('value');
      const sessions=Object.values(snap.val()||{});
      const currentGames=new Set((currentRowsForCumulative()||[]).map(r=>Number(r.sourceGame||r.game||0)).filter(Boolean));
      const orphan=sessions.filter(s=>String(s.season||CURRENT_SEASON_KEY)===CURRENT_SEASON_KEY && Number(s.gameNo)>0 && !currentGames.has(Number(s.gameNo)));
      if(orphan.length)bettingIssue={level:'error',title:'Paris',detail:`${orphan.length} session(s) de paris référence(nt) une partie absente.`};
    }
  }catch(_e){}
  const issues=[...d.issues,...(bettingIssue?[bettingIssue]:[])];
  const errors=issues.filter(i=>i.level==='error').length,warns=issues.filter(i=>i.level==='warn').length;
  summary.className=`diagnostic-summary ${issues.length?'warn':'ok'}`;
  summary.textContent=issues.length?`${errors} anomalie(s) bloquante(s), ${warns} avertissement(s) · ${d.seasons} saisons, ${d.checkedGames} parties et ${d.checkedRows} lignes contrôlées.`:`Cohérence OK · ${d.seasons} saisons, ${d.checkedGames} parties et ${d.checkedRows} lignes contrôlées.`;
  list.innerHTML=issues.length?issues.slice(0,60).map(i=>`<div class="diagnostic-item"><span>${i.level==='error'?'⛔':'⚠'}</span><div><b>${esc(i.title)}</b><small>${esc(i.detail)}</small></div></div>`).join(''):'<div class="diagnostic-item"><span>✓</span><div><b>Aucune anomalie détectée</b><small>Les contrôles structurels et le rattachement des paris sont cohérents.</small></div></div>';
}

function renderRecordScopeSummary(){
  const holder=$("recordsScopeSummary");
  if(!holder)return;
  const seasons=allAvailableSeasonSets();

  const careerRows=buildAllSeasonsHistory();
  const careerStats=statsFromRows(careerRows).filter(s=>s.gamesCount>0);
  const max=(arr,key)=>[...arr].sort((a,b)=>Number(b[key]||0)-Number(a[key]||0)||a.name.localeCompare(b.name,"fr"))[0]||null;
  const cw=max(careerStats,"wins"), ck=max(careerStats,"kills"), cp=max(careerStats,"gamesCount"), ct=max(careerStats,"tabliers");

  let seasonPoints=null,seasonWins=null,seasonKills=null,seasonParts=null;
  for(const season of seasons){
    let list=statsFromRows(season.rows).filter(s=>s.gamesCount>0);
    if(season.ranking){
      const raw=new Map(list.map(x=>[x.name,x]));
      list=season.ranking.map(o=>({...raw.get(o.name),...o}));
    }
    for(const s of list){
      const candidate={...s,season:season.label};
      if(!seasonPoints||Number(candidate.points)>Number(seasonPoints.points))seasonPoints=candidate;
      if(!seasonWins||Number(candidate.wins)>Number(seasonWins.wins))seasonWins=candidate;
      if(!seasonKills||Number(candidate.kills)>Number(seasonKills.kills))seasonKills=candidate;
      if(!seasonParts||Number(candidate.gamesCount)>Number(seasonParts.gamesCount))seasonParts=candidate;
    }
  }

  let gameKills=null,attendance=null,gamePoints=null,gameNet=null;
  for(const season of seasons){
    const groups=groupedGamesFromRows(season.rows);
    for(const [g,rows] of groups){
      if(!attendance||rows.length>attendance.value)attendance={value:rows.length,season:season.label,game:g};
      for(const r of rows){
        if(!gameKills||Number(r.kills||0)>gameKills.value)gameKills={name:r.player,value:Number(r.kills||0),season:season.label,game:g};
        if(!gamePoints||Number(r.points||0)>gamePoints.value)gamePoints={name:r.player,value:Number(r.points||0),season:season.label,game:g};
        if(!gameNet||Number(r.net||0)>gameNet.value)gameNet={name:r.player,value:Number(r.net||0),season:season.label,game:g};
      }
    }
  }

  const group=(title,subtitle,cards)=>`<div class="records-scope-card">
    <div class="records-scope-title">${title}</div><div class="records-scope-subtitle">${subtitle}</div>
    ${cards.map(([label,name,value])=>`<div class="records-scope-row"><span>${label}</span><strong>${esc(name||"—")}</strong><b>${esc(value||"—")}</b></div>`).join("")}
  </div>`;

  holder.innerHTML=
    group("Carrière BPT","Cumul de toutes les saisons disponibles",[
      ["Victoires",cw?.name,cw?`${cw.wins}`:"—"],
      ["Kills",ck?.name,ck?`${ck.kills}`:"—"],
      ["Participations",cp?.name,cp?`${cp.gamesCount}`:"—"],
      ["Tabliers",ct?.name,ct?`${ct.tabliers}`:"—"]
    ])+
    group("Record sur une saison","Meilleure performance réalisée sur une saison",[
      ["Points",seasonPoints?.name,seasonPoints?`${seasonPoints.points} · ${seasonPoints.season}`:"—"],
      ["Victoires",seasonWins?.name,seasonWins?`${seasonWins.wins} · ${seasonWins.season}`:"—"],
      ["Kills",seasonKills?.name,seasonKills?`${seasonKills.kills} · ${seasonKills.season}`:"—"],
      ["Participations",seasonParts?.name,seasonParts?`${seasonParts.gamesCount} · ${seasonParts.season}`:"—"]
    ])+
    group("Record sur une partie","Performance maximale sur une seule partie",[
      ["Kills",gameKills?.name,gameKills?`${gameKills.value} · ${gameKills.season} P#${gameKills.game}`:"—"],
      ["Participants","BPT",attendance?`${attendance.value} · ${attendance.season} P#${attendance.game}`:"—"],
      ["Points",gamePoints?.name,gamePoints?`${gamePoints.value} · ${gamePoints.season} P#${gamePoints.game}`:"—"],
      ["Gain net",gameNet?.name,gameNet?`${euro(gameNet.value)} · ${gameNet.season} P#${gameNet.game}`:"—"]
    ]);
}

function bptDurationRecords(){
  const hist=Array.isArray(db.history)?db.history:[];
  const games=new Map();
  for(const row of hist){
    const game=Number(row.game);
    if(!Number.isFinite(game)||game<=0)continue;
    if(!games.has(game))games.set(game,[]);
    games.get(game).push(row);
  }
  const rows=[];
  for(const [game,gameRows] of games){
    if(!gameRows.length)continue;
    const n=Math.max(...gameRows.map(r=>Number(r.n)||0));
    const timing=bptGameTiming(gameRows),duration=timing.durationSec;
    if(!(duration>0))continue;
    const finalists=gameRows
      .filter(r=>Number(r.place)===1||Number(r.place)===2)
      .sort((a,b)=>Number(a.place)-Number(b.place))
      .map(r=>String(r.player||'').trim())
      .filter(Boolean);
    const huDuration=timing.headsUpDurationSec;
    const sample=gameRows[0]||{};
    rows.push({
      game,n,duration,huDuration,
      finalists,
      seasonKey:sample.seasonKey||'',
      seasonLabel:sample.seasonLabel||''
    });
  }
  const validHu=rows.filter(x=>Number.isFinite(x.huDuration)&&x.huDuration>0&&x.finalists.length>=2);
  const byLong=(a,b)=>b-a;
  const byShort=(a,b)=>a-b;
  const longestHu=validHu.slice().sort((a,b)=>byLong(a.huDuration,b.huDuration))[0]||null;
  const shortestHu=validHu.slice().sort((a,b)=>byShort(a.huDuration,b.huDuration))[0]||null;
  const longestGame=rows.slice().sort((a,b)=>byLong(a.duration,b.duration))[0]||null;
  const shortestGame=rows.slice().sort((a,b)=>byShort(a.duration,b.duration))[0]||null;
  return {longestHu,shortestHu,longestGame,shortestGame};
}
function bptDurationRecordRef(rec){
  if(!rec)return '—';
  const season=String(rec.seasonLabel||'').trim();
  return `${season?season+' · ':''}P#${rec.game}`;
}
function bptHeadsUpPlayers(rec){
  return rec?.finalists?.length>=2?`${rec.finalists[0]} / ${rec.finalists[1]}`:'—';
}


function updateRecordsScopeSelector(){
  const key=recordsScopeKey||CURRENT_SEASON_KEY;
  const current=document.getElementById("recordsScopeCurrentBtn");
  const all=document.getElementById("recordsScopeAllBtn");
  const past=document.getElementById("recordsScopePastWrap");
  const select=document.getElementById("recordsPastSeasonSelect");
  const label=document.getElementById("recordsPastSeasonLabel");
  const isPast=key!==CURRENT_SEASON_KEY && key!=="all";
  current?.classList.toggle("active",key===CURRENT_SEASON_KEY);
  all?.classList.toggle("active",key==="all");
  past?.classList.toggle("active",isPast);
  if(select){
    select.value=isPast?key:"";
  }
  if(label)label.textContent=isPast?seasonDisplayName(key):"Choisir une saison";
  const recordTitle=document.getElementById("recordsContextTitle");
  if(recordTitle)recordTitle.textContent=key==="all"?"Records toutes saisons":`Records de la saison ${seasonDisplayName(key)}`;
  const achievementTitle=document.getElementById("achievementsContextTitle");
  if(achievementTitle)achievementTitle.textContent=key==="all"?"Accomplissements carrière":`Accomplissements de la saison ${seasonDisplayName(key)}`;
}

async function selectRecordsScope(key){
  key=String(key||CURRENT_SEASON_KEY);
  if(![CURRENT_SEASON_KEY,"2025-2026","2023-2024","2022-2023","2020-2021","all"].includes(key))key=CURRENT_SEASON_KEY;
  recordsScopeKey=key;
  if(selectedSeasonKey!==key)await selectSeason(key);
  updateRecordsScopeSelector();
  renderRecords();
  renderAchievements();
}

async function selectRecordsPastSeason(key){
  if(!key)return;
  await selectRecordsScope(key);
}

async function openRecordsView(){
  const key=recordsScopeKey||CURRENT_SEASON_KEY;
  if(selectedSeasonKey!==key)await selectSeason(key);
  await showView("records");
  updateRecordsScopeSelector();
}

function renderRecords(){
  updateRecordsScopeSelector();
  renderRecordScopeSummary();
  const holder=$("recordsGrid"); if(!holder)return;
  const ranked=ranking();
  if(!ranked.length){holder.innerHTML='<div class="card muted">Aucun record disponible pour le moment.</div>';return;}

  const maxBy=(key)=>[...ranked].sort((a,b)=>Number(b[key]||0)-Number(a[key]||0)||a.name.localeCompare(b.name,"fr"))[0];
  const wins=maxBy("wins"),podiums=maxBy("podiums"),kills=maxBy("kills"),avg=maxBy("avgPoints"),net=maxBy("net");
  const worstNet=[...ranked].sort((a,b)=>Number(a.net||0)-Number(b.net||0)||a.name.localeCompare(b.name,"fr"))[0];

  let bestGameKill={name:"—",value:0,game:null};
  for(const r of db.history||[])if(Number(r.kills||0)>bestGameKill.value)bestGameKill={name:r.player,value:Number(r.kills||0),game:r.game,sourceGame:r.sourceGame,seasonKey:r.seasonKey,seasonLabel:r.seasonLabel};

  let streakPod={name:"—",value:0}, streakPart={name:"—",value:0};
  for(const p of ranked){
    const a=longestPlayerStreak(p.name,r=>Number(r.place)<=3);
    if(a>streakPod.value)streakPod={name:p.name,value:a};
    const b=longestParticipationRun(p.name);
    if(b>streakPart.value)streakPart={name:p.name,value:b};
  }

  const gameNos=[...new Set((db.history||[]).map(r=>Number(r.game)))].sort((a,b)=>a-b);
  const last3Games=gameNos.slice(-3);
  let onFire={name:"—",value:0,details:""};
  if(last3Games.length){
    const totals={};
    for(const r of db.history||[]){
      if(!last3Games.includes(Number(r.game)))continue;
      totals[r.player]=(totals[r.player]||0)+Number(r.points||0);
    }
    const best=Object.entries(totals).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],"fr"))[0];
    if(best){
      onFire={
        name:best[0],
        value:best[1],
        details:`${best[1]} pts sur ${last3Games.length} dernière${last3Games.length>1?"s":""} partie${last3Games.length>1?"s":""}`
      };
    }
  }

  const pairs={};
  for(const r of db.history||[])if(r.killer){
    const k=`${r.killer}|||${r.player}`; pairs[k]=(pairs[k]||0)+1;
  }
  const topPair=Object.entries(pairs).sort((a,b)=>b[1]-a[1])[0];
  const pairData=topPair?{names:topPair[0].split("|||"),value:topPair[1]}:null;
  const durationRecords=bptDurationRecords();

  // Poulidor : joueur avec le plus grand nombre de 2e places.
  const secondPlaceCounts={};
  for(const r of db.history||[]){
    const player=String(r.player||"");
    if(player && Number(r.place)===2) secondPlaceCounts[player]=(secondPlaceCounts[player]||0)+1;
  }
  const bestSecond=Object.entries(secondPlaceCounts)
    .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],"fr"))[0];
  const poulidor=bestSecond?{name:bestSecond[0],value:bestSecond[1]}:{name:"—",value:0};


  // Bad Beat : joueur avec le plus de 4e places.
  let badBeat={name:"—",value:0};
  // Loser : joueur avec le plus de dernières places.
  let loser={name:"—",value:0};

  const fourthCounts={};
  const lastPlaceCounts={};

  for(const r of db.history||[]){
    const player=String(r.player||"");
    const place=Number(r.place)||0;
    const n=Number(r.n)||0;
    if(!player || !place)continue;

    if(place===4){
      fourthCounts[player]=(fourthCounts[player]||0)+1;
    }
    if(n>0 && place===n){
      lastPlaceCounts[player]=(lastPlaceCounts[player]||0)+1;
    }
  }

  const bestFourth=Object.entries(fourthCounts)
    .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],"fr"))[0];
  if(bestFourth)badBeat={name:bestFourth[0],value:bestFourth[1]};

  const bestLast=Object.entries(lastPlaceCounts)
    .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],"fr"))[0];
  if(bestLast)loser={name:bestLast[0],value:bestLast[1]};


  // Séries de victoires et de tabliers, calculées sur les participations successives du joueur.
  let winStreak={name:"—",value:0};
  let tablierCount={name:"—",value:0};
  let tablierStreak={name:"—",value:0};

  for(const p of ranked){
    const playerRows=(db.history||[])
      .filter(r=>r.player===p.name)
      .sort((a,b)=>Number(a.game)-Number(b.game));

    let curWin=0,bestWin=0;
    let curTab=0,bestTab=0;
    let totalTab=0;

    for(const r of playerRows){
      const isWin=Number(r.place)===1;
      const isTablier=isTablierRow(r);

      curWin=isWin?curWin+1:0;
      if(curWin>bestWin)bestWin=curWin;

      if(isTablier)totalTab++;

      curTab=isTablier?curTab+1:0;
      if(curTab>bestTab)bestTab=curTab;
    }

    if(bestWin>winStreak.value)winStreak={name:p.name,value:bestWin};
    if(totalTab>tablierCount.value)tablierCount={name:p.name,value:totalTab};
    if(bestTab>tablierStreak.value)tablierStreak={name:p.name,value:bestTab};
  }

  const cards=[
    ["🏆","Plus de victoires",wins.name,`${wins.wins} victoire${wins.wins>1?"s":""}`],
    ["⚡","Série de victoires",winStreak.name,winStreak.value?`${winStreak.value} victoire${winStreak.value>1?"s":""} de suite`:"Aucune série"],
    ["🧥","Plus de tabliers",tablierCount.name,tablierCount.value?`${tablierCount.value} tablier${tablierCount.value>1?"s":""} · victoire avec au moins 10 joueurs`:"Aucun tablier"],
    ["👑","Série de tabliers",tablierStreak.name,tablierStreak.value?`${tablierStreak.value} tablier${tablierStreak.value>1?"s":""} de suite`:"Aucune série"],
    ["🥉","Plus de podiums",podiums.name,`${podiums.podiums} podium${podiums.podiums>1?"s":""}`],
    ["🏅","Série de podiums",streakPod.name,`${streakPod.value} de suite`],
    ["💥","Plus de kills",kills.name,`${kills.kills} kill${kills.kills>1?"s":""}`],
    ["🎯","Kills sur une partie",bestGameKill.name,`${bestGameKill.value} · ${formatGameReference(bestGameKill)}`],
    ["📈","Meilleure moyenne",avg.name,`${num(avg.avgPoints,1)} pts / partie`],
    ["💶","Plus gros gains",net.name,euro(net.net)],
    ["📉","Plus grosse perte d’argent",worstNet?.name||"—",worstNet?euro(worstNet.net):"—"],
    ["🎟","Série de participations",streakPart.name,`${streakPart.value} partie${streakPart.value>1?"s":""} de suite`],
    ["🔥","On Fire",onFire.name,onFire.details?`${onFire.details} · joueur le plus performant sur les 3 dernières parties`:"—"],
    ["💔","Bad Beat",badBeat.name,badBeat.value?`${badBeat.value} quatrième${badBeat.value>1?"s":""} place${badBeat.value>1?"s":""}`:"Aucune 4e place enregistrée"],
    ["🐢","Loser",loser.name,loser.value?`${loser.value} dernière${loser.value>1?"s":""} place${loser.value>1?"s":""}`:"Aucune dernière place enregistrée"],
    ["⏳","Heads-up le plus long","BPT",durationRecords.longestHu?`${bptHeadsUpPlayers(durationRecords.longestHu)} · ${formatGameDuration(durationRecords.longestHu.huDuration)} · ${bptDurationRecordRef(durationRecords.longestHu)}`:"Pas encore assez de données"],
    ["⚡","Heads-up le plus court","BPT",durationRecords.shortestHu?`${bptHeadsUpPlayers(durationRecords.shortestHu)} · ${formatGameDuration(durationRecords.shortestHu.huDuration)} · ${bptDurationRecordRef(durationRecords.shortestHu)}`:"Pas encore assez de données"],
    ["🥈","Le Poulidor",poulidor.name,poulidor.value?`${poulidor.value} deuxième${poulidor.value>1?"s":""} place${poulidor.value>1?"s":""}`:"Aucune 2e place enregistrée"],
    ["🎯","Kill le plus fréquent",pairData?`${pairData.names[0]} a éliminé ${pairData.names[1]}`:"—",pairData?`${pairData.value} fois`:"—"]
  ];
  // 10.4.45 — Records en tuiles compactes, regroupées par thème ; « NEW » = battu lors de la dernière partie.
  const RECORD_META={
    "Plus de victoires":["wins","win"],"Série de victoires":["winStreak","win"],"Plus de tabliers":["tablierCount","win"],"Série de tabliers":["tablierStreak","win"],
    "Plus de podiums":["podiums","win"],"Série de podiums":["podiumStreak","win"],"Le Poulidor":[null,"win"],
    "Plus de kills":["kills","kill"],"Kills sur une partie":["bestGameKill","kill"],"Kill le plus fréquent":["killPair","kill"],
    "Plus gros gains":["net","money"],"Plus grosse perte d’argent":["worstNet","money"],
    "Meilleure moyenne":["avg","form"],"Série de participations":["participationStreak","form"],"On Fire":["onFire","form"],
    "Bad Beat":["badBeat","odd"],"Loser":["lastPlaces","odd"],"Heads-up le plus long":[null,"odd"],"Heads-up le plus court":[null,"odd"]
  };
  const GROUPS=[["win","🏆 Victoires, podiums & tabliers"],["kill","⚔️ Kills"],["money","💰 Argent"],["form","📈 Forme & régularité"],["odd","🎲 Insolites"]];
  let newIds=new Set();
  try{if(recordsScopeKey===CURRENT_SEASON_KEY)newIds=new Set(latestBrokenDashboardRecords().map(r=>r.id));}catch(_e){}
  const tile=c=>{
    const [icon,label,name,value]=c;const meta=RECORD_META[label]||[null,"odd"];
    const isNew=!!(meta[0]&&newIds.has(meta[0]));
    let who;
    if(label==="Kill le plus fréquent"&&pairData){
      who=`<button type="button" class="rec-name" data-player="${encodeURIComponent(pairData.names[0])}">${esc(pairData.names[0])}</button><span class="rec-sep">a éliminé</span><button type="button" class="rec-name" data-player="${encodeURIComponent(pairData.names[1])}">${esc(pairData.names[1])}</button>`;
    }else if(name&&name!=="—"&&name!=="BPT"){
      const nick=playerNicknameInfo(name).primary;
      who=`<button type="button" class="rec-name" data-player="${encodeURIComponent(name)}">${esc(name)}</button>${nick?`<small class="rec-nick">${esc(nick)}</small>`:""}`;
    }else who=`<span class="rec-name is-plain">${name==="BPT"?"":"—"}</span>`;
    return {group:meta[1],isNew,html:`<div class="rec-tile${isNew?" is-new":""}">
      ${isNew?'<span class="rec-new">NEW</span>':""}
      <div class="rec-top"><span class="rec-ico">${icon}</span><span class="rec-label">${esc(label)}</span></div>
      <div class="rec-who">${who}</div>
      <div class="rec-value">${esc(simplifyRecordTextForMobile(value))}</div>
    </div>`};
  };
  const tiles=cards.map(tile);
  const fresh=tiles.filter(t=>t.isNew);
  holder.innerHTML=(fresh.length?`<section class="rec-group rec-group-new"><h3>✨ Battus lors de la dernière partie</h3><div class="rec-grid">${fresh.map(t=>t.html).join("")}</div></section>`:"")
    +GROUPS.map(([g,title])=>{const list=tiles.filter(t=>t.group===g&&!t.isNew);return list.length?`<section class="rec-group"><h3>${title}</h3><div class="rec-grid">${list.map(t=>t.html).join("")}</div></section>`:"";}).join("");
  holder.onclick=e=>{const b=e.target.closest(".rec-name[data-player]");if(b)openPlayerProfile(decodeURIComponent(b.dataset.player));};
}



function playerRankHistory(name){
  const history=Array.isArray(db.history)?db.history:[];
  const gameNos=[...new Set(
    history.map(r=>Number(r.game)).filter(g=>Number.isFinite(g)&&g>0)
  )].sort((a,b)=>a-b);

  const firstGame=Math.min(
    ...history
      .filter(r=>String(r.player||"")===name)
      .map(r=>Number(r.game))
      .filter(g=>Number.isFinite(g)&&g>0)
  );

  if(!Number.isFinite(firstGame))return [];

  const result=[];

  for(const gameNo of gameNos){
    if(gameNo<firstGame)continue;

    const rows=history.filter(r=>Number(r.game)<=gameNo);
    const by={};

    for(const r of rows){
      const player=String(r.player||"");
      if(!player)continue;
      if(!by[player]){
        by[player]={
          name:player,
          points:0,
          games:new Set()
        };
      }
      by[player].points+=Number(r.points||0);
      by[player].games.add(Number(r.game));
    }

    const ranked=Object.values(by)
      .filter(s=>s.games.size>0)
      .map(s=>({
        ...s,
        gamesCount:s.games.size,
        avgPoints:s.games.size?s.points/s.games.size:0
      }))
      .sort((a,b)=>
        b.points-a.points ||
        b.avgPoints-a.avgPoints ||
        a.name.localeCompare(b.name,"fr")
      );

    const rank=ranked.findIndex(s=>s.name===name)+1;
    const playerState=ranked.find(s=>s.name===name);
    const played=history.some(r=>Number(r.game)===gameNo && String(r.player||"")===name);

    if(rank>0){
      result.push({
        game:gameNo,
        rank,
        points:Number(playerState?.points||0),
        played
      });
    }
  }

  return result;
}

function renderPlayerRankHistory(name){
  const holder=$("playerProfileRankHistory");
  if(!holder)return;

  const data=playerRankHistory(name);
  if(!data.length){
    holder.innerHTML='<span class="muted">Aucun historique de classement disponible.</span>';
    return;
  }

  const width=Math.max(760,data.length*78);
  const height=300;
  const padL=50,padR=24,padT=26,padB=44;
  const innerW=width-padL-padR;
  const innerH=height-padT-padB;
  const maxRank=Math.max(1,...data.map(d=>d.rank));

  const xOf=i=>data.length===1
    ? padL+innerW/2
    : padL+(i/(data.length-1))*innerW;

  // Rang 1 en haut du graphique.
  const yOf=rank=>maxRank===1
    ? padT+innerH/2
    : padT+((rank-1)/(maxRank-1))*innerH;

  const grid=[...Array(maxRank)].map((_,i)=>{
    const rank=i+1;
    const y=yOf(rank);
    return `<line x1="${padL}" y1="${y}" x2="${width-padR}" y2="${y}" stroke="rgba(255,255,255,.08)"/>
            <text x="${padL-9}" y="${y+4}" fill="#9fb3c8" font-size="11" text-anchor="end">#${rank}</text>`;
  }).join("");

  const points=data.map((d,i)=>`${xOf(i)},${yOf(d.rank)}`).join(" ");
  const dots=data.map((d,i)=>{
    const x=xOf(i),y=yOf(d.rank);
    return `<circle cx="${x}" cy="${y}" r="${d.played?5:4}" fill="${d.played?"#c8952e":"#79c594"}">
      <title>Partie #${d.game} — classement #${d.rank} — ${d.points} pts${d.played?" — a joué":" — n’a pas joué"}</title>
    </circle>`;
  }).join("");

  const labels=data.map((d,i)=>{
    const x=xOf(i);
    return `<text x="${x}" y="${height-18}" fill="#9fb3c8" font-size="11" text-anchor="middle">P${d.game}</text>`;
  }).join("");

  holder.innerHTML=`
    <div class="profile-rank-history-chart">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Évolution du classement général de ${esc(name)}">
        ${grid}
        <polyline fill="none" stroke="#c8952e" stroke-width="3" points="${points}" stroke-linecap="round" stroke-linejoin="round"/>
        ${dots}
        ${labels}
      </svg>
    </div>
    <div class="profile-rank-history-list">
      ${data.map(d=>`<span class="profile-rank-history-chip ${d.played?"played":""}">
        P${d.game} <strong>#${d.rank}</strong>${d.played?" · joué":""}
      </span>`).join("")}
    </div>`;
}

function playerProfileData(name){
  const allStats=stats(false);
  const ranked=ranking();
  const s=ranked.find(x=>x.name===name) || allStats.find(x=>x.name===name);
  if(!s)return null;

  const rows=(db.history||[])
    .filter(r=>String(r.player||"")===name)
    .sort((a,b)=>Number(a.game)-Number(b.game));

  const ks=killerStats();
  const bestPlace=rows.length?Math.min(...rows.map(r=>Number(r.place)||999)):null;
  const avgPlace=rows.length?rows.reduce((a,r)=>a+Number(r.place||0),0)/rows.length:0;
  const lastPlaces=rows.filter(r=>Number(r.n)>0 && Number(r.place)===Number(r.n)).length;
  const fourthPlaces=rows.filter(r=>Number(r.place)===4).length;
  const bestKillsGame=rows.reduce((best,r)=>Number(r.kills||0)>Number(best?.kills||0)?r:best,null);
  const bestNetGame=rows.reduce((best,r)=>Number(r.net||0)>Number(best?.net??-Infinity)?r:best,null);

  let winStreak=0,curWin=0,podiumStreak=0,curPod=0;
  for(const r of rows){
    if(Number(r.place)===1){curWin++;winStreak=Math.max(winStreak,curWin);}else curWin=0;
    if(Number(r.place)<=3){curPod++;podiumStreak=Math.max(podiumStreak,curPod);}else curPod=0;
  }

  const victimCounts={},killerCounts={};
  for(const r of db.history||[]){
    if(r.killer===name && r.player)victimCounts[r.player]=(victimCounts[r.player]||0)+1;
    if(r.player===name && r.killer)killerCounts[r.killer]=(killerCounts[r.killer]||0)+1;
  }
  const topEntry=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],"fr"))[0]||null;
  const favoriteVictim=topEntry(victimCounts);
  const nemesis=topEntry(killerCounts);

  const achievements=achievementPlayers()
    .filter(a=>a.players.includes(name));

  return {
    s,rows,bestPlace,avgPlace,lastPlaces,fourthPlaces,bestKillsGame,bestNetGame,
    winStreak,podiumStreak,favoriteVictim,nemesis,achievements,ks
  };
}


// ===== BPT 2.6.3 — avatars joueurs =====
const BPT_AVATARS=[
  {id:"avatar_01",name:'Poker Shark',src:"data:image/webp;base64,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"},
  {id:"avatar_02",name:'Lucky Lady',src:"data:image/webp;base64,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"},
  {id:"avatar_03",name:'The Bluff',src:"data:image/webp;base64,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"},
  {id:"avatar_04",name:'The Grinder',src:"data:image/webp;base64,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"},
  {id:"avatar_05",name:'The Boss',src:"data:image/webp;base64,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"},
  {id:"avatar_06",name:'The Strategist',src:"data:image/webp;base64,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"},
  {id:"avatar_07",name:'The Stealer',src:"data:image/webp;base64,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"},
  {id:"avatar_08",name:'The Colossus',src:"data:image/webp;base64,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"},
  {id:"avatar_09",name:'The Shadow',src:"data:image/webp;base64,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"},
  {id:"avatar_10",name:'The Techno',src:"data:image/webp;base64,UklGRigyAABXRUJQVlA4IBwyAACQjACdASrAAMAAPjkWiEMiISEZ+48sIAOEtgBk/BDlH+O/Jv2O6r/WP7H+nP77+4XyL6+egPLM5m/5f9//L/5kf6r/s+xP9L/+H3BP1d/6P+M9y3/S/ar3Sf3f/g+oP9iv2k93//Nf9//Oe6D+3/6D/ue4F/S/9j/6uwU/bz2Cv6L/kvV//6H7n/CH/X/+B+4H/a+Rr9pf/77AH/q9rn+Af//VneEv5zwd/HfoP8T/f/21/wHty/4nhs6g/03oN/Ivu1+o/xP7nf4D9zPmD/b/kz6D/G3/T9Qv8j/nP+R/u37f/4H9yPq7+k/3PfEWk/7/+Z9gv2/+tf6X/I/ul/h/Ti/wfST7Gf7v7kvsD/nn9V/1v3I+2T4kvnXsCf0H+3f87/H/l99MP9j/4P9N+Xnut/PP8p/3P81/qfkN/l39e/3f98/ej/Of//60vPC9oj9yV/Mlm6M4QwOyuMMx+4oeXNnuFywGLq+ynQJtO0hs9NelFO29GcUIZQf2Lvhkaen44O/z2f/6t/ATPUFgDm+gtD24pyXJvJzvB/IOO1LyxvP8sIgeyGhfN7nbijhQRwlvqMhgP/AuiB+SbVmh2z0Uy1pLP36h6eNQGszqi/KIvbOLOaatVsWcyDOLLI6YWltkXa2aKlYFkZmcnC3U4Iw1O9lTP0qXK9AbuxJ6EoXKx0c7I9QMxPIYVpb+tz7k+OX2DhHWNHGl4Xwvl/ehVBV7hKo/T9/l1hE1zofvTWSHx0GehI+zSdU9VO6yeSe7xHKezvpbGX1SZbgJmfXgxjgFkNQKjlNdfi/kCKqL/ifRmzmdjkGnZhMcleERIbNI4lJetGun2AuwIW1d0VsYi0MGrHG8LFrsqE9eKjyi5YbtuIgxs33EVXQGp+HQd6uOWDP77oh7fuTKv2p3/c2rYHQakYfWuk42t9i++aO7HnCr+8WuCGW5YFLrXKEDTDdaJ/nqYEzOEa8FAXiK7QD/0ZP+dwpCVw/gGg4LkerLK+RjQT8Np1QlF9No0ZR95XJnQhGHBixhDt191DGTnMVTxtx7ee+1IFEP9ufHHXEmvsEBb6Who03qHtgXl4fC2nz/3MMdT4pqkNdgf4ga+K5htNxSCmf/ouiHs7hwjWoFUTCcDvNbarLMc4Sifo8NrNgs74t3y2TKUnEBExS4aPJSn2SyrxdYnRYgkhv0wUenzinAwPWLV8fR5O3cP6vos5KXPobNdOolh8/nwsLCuwis1tVNr/GhnvOfQtaBBTG1GrscE8BSdF5RkwPVAF7e9Yitb12oItrwg9S9QPtT3jUS71sb8BHPt54+gIHxSXw2rFFFIbaKZtOf+5OPLbkNQdnHLSUfW/9zxwyjaQoP5bzQSsCmNggV4p+0wDihXqVw9jpEDaexc0QOUVca0/QoY2mZ4cFNLiNN0oV3kIHaG8O8LVXVM9GEAKuhaqzXv8rLK8AbESrCxbFwpIKJE5U9XobMXkY244/KCdu/wkEJk4gyog67GBbE7WUYC3Qyy9RFQAD+//40L4iGnAl/58g20jsJCWjhCt105hSsD3xqfy517Kltj4/xQYU9eS8v7wzrGphegZc43SBHRTddvKAFzMZKO5+ujMqzfe0AePvcC7eUgjkxWmaL0hemjEQf32M2MHv4pMsMdB/g6zTv5w8UOn3+b2Dq2bzrc05w5roGHv9OzoLkUu6yiaS/D+1VKB/zjFppo7yxAmQsPdSRTRvX5tuTnpHgV6ch2nc7tnedpthdo5QUcpcvxkK6vdE/2wabao/+Ut1jyaXsskOZ6KwSMpbhPOzAeo8XvD7P7QEuf2yoScOLP3WzzqnbioaYb4/EOOjLH/mxzI78u0Uh5ZrJweEmYOPIE6vpOkn87ymr9YLT4ToNtU9xk+2Ec6SKA1CxZQGk7d4T6Pqsdm9rOs8BMR/Iq7VtJqsGntTIiTczlrPxwcomY18IGkVtcl42oDa0lkDNecflHuznSpexXt5wCJESE2T6VySeog5AX1SDNlHQLlINIDjD7liTB9l4aeoOU3Rdri84pXS1+OTMTbVPD5SJNpRlC+7PreCwZYyAmOme9Y245Ak0MnNB2eibuXyKKLFZOXC+NCLhbKA+8bldrzmbMZAEt0d1O4r/INwIcrbPYKweBQklm3uz1oAwj9oH2jk+qL/jEebtPFZ76aTfi11ha91wP3F8oGp1kjZW3GTep76xs9uoAp3i6TZxplhi5swmQMG58haK0JuQw/LVn7p1zVVX7atjT3Edj4HBa6EVlvFmVOqpFXY/LFE+RJiwV+QqwLrBQOj9BCT2iMtiuSFTk6BC0MqpU7yHAYpTgdaKW9IfwxaZatBkjvW4dVPxmkSdNzuxqyuRh8kDyLMj+VaIrZy9JRH5L4yYqrSPQBQshMbRJEkyTrq6TcjYAxw/VRHzWBCj7Kchm4+uAPfU6FiwOGJpOYu9B9Ot1MRSq30Rba0Cp3ghFSh1IopgmMQ3mBBP/cSali6RDhrGWNGp9mNRB619J1XVCGShBIaTcczFcXoJKQ9EKBGgQNRHHhcZdCTaFpADJayUhu753p5c9dDowD3W5nIH8HE4vfSDZPTNlkGkk+zqYTe12hci0b75hHFBfG5O2fXDzTZOGfzngZei25OMyQz9Y+peOvb5653gqpUJF3KFvhW0TAqX//A5AouasF2C06nAcVzwYA11XlUzXKtvYIPz7hEbBGw3OlvWxdzAE6CeQjxk0R/3W89RVQcNFD9/lnHL1cAdQWo24U80Gzw4wV++EdOYGFVE6/LwtCLn6ox9KNyGIQyiIYxrzaeESivz1pe7t4qVfUM5WidMOUQ/eCP1RBf8JSbEqBER+I/aZ8XywmXPLET2HNyCtvD8nmRocxDQd9C0+4aDrtlRgvgq8m7UmSXD+IYqkJw1Xbuv6ZCN/m1GC0y5UpQ5oqiJThykKGIWi9GBHFQOPP9ayDoXPyFW7LpCfPQJyWykPJsDqx0+S9BsSfXfzyMYa6kvW7Vous7XRH+bay1r4fQlwMqqZxIdWe/3A0M2wvqos8SQ1kFnQybwPBJNSayu4DAZm82o1KO+5ULmXBRIKk7Cqhgu1/X1kHqSF3a735Z02dhk6xVdkEf1QQLMP6XiS0POq3q33N8ua90VitOdkj5a4kQdpH3tTpj2NDlVL20nhFXtkIz0pOKjLIrBD87uIsyJ9WfjFWBoKsD2yq+C9jV08BI5YSMvauje0als/xMwPwpHqSKXx9a62XNARwkQJOh6ztUfmH7+m1SUN1C5SbbtXUFSpOleBZFxtIHl95h8+jcunbvsY8zrU5bumPSeHvrZZjLoNGDRaHoLWygjgm3wP/RABVBq/WxVNBVw+2rVCE0LwoKJNtwDi895AqEAjthcTN7QxDtzX0ou7+TxA5Cr9k0Xzy0y5sMwWu9h11aLH0+KPQpXnxGAV+MbNAnQd89KfTxNH4R4KvaqizVHmHMWdGqV/XbdbQL4JcWF+6VyfCHXT3hELzqoQooGhbeKlOGgawwJO2u64JhiU2ks9U0VsDoFuX4kRUzZbQ+uNIm17LD1HZYJj1XU7qPsAQfdNr7MPhZwv+SxToGFuMam+iCt5jHAOso8KP/ViVbqsrfni3ye8mNww1K5EZE+Xk2cYbBosZYM5tQ49wcx3Kg4C4JevpbsvnBpjkyqS3H2c/qCNlqMXWUrqvQv7/GSJ9t6KoAdm8o2KbmmKsywyYkGp4+EsLqeBIuxsyU2RsnrpteRhnAK3ZMtPP0lz4DSiuzRb20F3b8o1UAInqBMcv8LIv3Xw771CGZApr7G8xwwKxtC964hp9e9CiskGH8PFe0rLTuVkDs/oFzcnCQbx/YrooF4aaH4BCdQwpM+XgKOA9yi18Qbz+WduTADsjJZPFNWJXErEiQ36ZlZ9IeiSQ9nO6SE7YGnpkeJi24IbNC5gxjN/YJ1YfTzJfF/JYaBSE69CFTCVvov3dPZRYjXbybcSulX960g/Xzxri++yPQe77mbNyXEaM/6ZvfnnGSJ7Tl5Ex8B7MHjeXLnHL5Z8FuArpLTIGZQFhr7r3AAM5/nsQO6N+DYsC+Ap9pbuiTu4VSJW92PyEQlo/cQVNRGEU4e1QJrNs/B2B30/gvHR8J5F33R1axF4PhkB7106xZgfB68dxDxYnEL1Lsw9gpK709tuY8OIsPVCrIHmUopuRktEhf3MzLapAQHp7Ko9dsTK90UGtVxj0pkGdhhQ5FL0vTWG9RlQ1rXnMuBCMjwV2vwD/l/iRhasQE6jgdyjgDXMtTpWqOLDTb3/8xxnMHvhhtFDsrn1xP6Y/Af2hQQBcxBjO47KAYtFjnlUzpw0QeHk+3imsUulibO63UqknHByT9sivDDi8jIfkmy7rVRWl5NNR32i0WObTPd87ndychgzFlUVk3/L9pVZHYEFDNbtMte3j7Fg3t5yidDgA/H0dJz/Sr7GmlMBAgsHa/asLjykMdqnHP5Su/pdS/qPUWN6XUyMuEXoGpOkKTsxXnBXab+k18aX6R5FF2rGopJ9mFO7zOkGpap5wOdheiFLnowi1hDHQJvtZRiv8jN5s9RpHsXIYgjwrIBNA5cMVdQ+zZplAJEF+bzIZ3uL0+J6Pw3Mxq5JOWuiZhmmB/bpiMLvqAotN38JLbF7yXdN7swM5wfsR9ZVBUdwBg3lFg5s7U767m8haC/SUPMDltlghzU96ZW15cclEQ2W98bqcVD7FNxIH0Ho/LeRypesHMqWgta5eX9i8eEBBRnxofVSZpyV/6dBb6MmR8q0V1+NnpuIJIvV/zWskSAn40JzcWIvZtL86fvKt+RxyFcwg8B/bvLVpTcc5/hM/PNOKa5Nwkmau0iX6sP7XVX0IvoOpNphLVCAAyLw1pNTRH8qW/Q5LPzLMTjU1g3DaIOOC0+fw4/X3sea7nDmsz+X08LfRW42OKZ1wKirv++GnXX9eFjECKwgXunaswSNCs0z2WfKAXBsEEE81ftiBdgdgGD4LZFEP9MSRagO7sTZ6zsggx68i0Hm+qeCIM6kinw4N6bE3PY2hMzQIJKcyVCh4t3eRn6JU69BBFMmONcX0Lq6EL6/3DZgLcQIwWz9AuGO9oLkFV57P3IKqDfJ9tKJFyDaNzYQNOzRUL3RMj8X4adPlNaltq14vpJfMNwy7+IVm+VmN7GYdQqzVZ/cEVVW4JglpIKJnIka0RNc5B6os6ISYFnJnK5DEYG8CPe2yj7YrkJ5SeqdTr9CDCGbmHbkXP6g99yfq8PpGhycq5HX1NIfuOU38czHXLKl4Yn+MbibLmdj/CHfdjc72J9r5+PyOgORhtF86rh+AY5bxCG4jPzYb+F3Jsc2MOog4HlnKh5XXPy00vN7TJv4jdiErD5RTY2tWjZytKgbQCJvRKIGpKk7yULlQ+12Wc6tEaspdOct601pAZp6Xo7sAUaNjnh68V1Me75xVoDtz7cXPQ2fiPplxNIUtiLcDLS4nbSmFUCLiHzuz3qs/0UCLmoT5CxnPdAt4VGjAb1YAp87L/uBpgEbKeOuTgFJcI62BSTNCcXQyY3yzf9dCzxQxr7AHCl5+PUoAOO0pSsug+rqnesCmg+Kj0rrZbmv8rEnOSYAT/oK6gQ3whqsYCrVk0ZNew+3cL9aDT5ETFB1Lo/c+2xcLKJqqTmhrkqWflDLMyRK+AtUQZJxPQ0luhNWaLLi5ANfP33I5gIYuGZ2epSEItP65TM8mhE4iHFYh5DQDluOYcM9GiF5Df7/U38ynmJzU7byzCiWTbmGIW2clkQVTFBGDUs/FCrz6ftUuBYgCQoP6WEcv7dhWXZ7zLr3lzJaNWGKPEweABvAbkJtWrnhyeRsK3SAGMPwIqcP3zxrVHIsqHmo3KTKDfTyPu3RUxYBE2bFJfoKEsrGn5ia37fL1pbJfxo9pyRTUsIX5ZhUEKTCw1L2eWSLf1BzuUE6ESbvlEHHQLHOqoH0c2/Iuh77gkxEAVPt5+VuieH+m10V2bf01fxS3aEPRTSHBszDA9WC1mLnhS4LXgE2DRh/ARINCGxWY0QbqF3RP0BozNI/qg34GCcoU0SaCBhL932cRjJIqgAGxWMrN+r2CNbfAaiAC9es1pojthzs8FHvBv3FaPc1HXj33It/cvGp65C7GbadFCgtaG5LUX1YKBih2hnTzTEU+PgRQ9YFJW6c5Fi/WKUSDBz1iywecGO6aikg6oJGsKT3QMm4ytnsnPzKr/pTeVlFrilCr1IwSTTcS7VyrHOQrNlUShknc12ELWeZNnc7AVEgufCRSts5rQlRAk+zIhgM6eGh0MII14rwDhppgI6SSLAPR+dttEKBdhS0gnPSjLTId44XeZWv2dbINDK4camZ3lNAmamJXanOMFM4t49n+DkY/Cr79ZpelOlCb6wxmoAlMRcV/Hew3bfMj33X9/GcR4WjzmA4or9jFswO0zHA/BoOSUbAqjMuv5xOTzxlpRgMR56SEyrv6Br7YWU9kWa4sC3rQflV3+yy9oPJomugrZoT24vm97HCTZ9Uv0D8Epg2sEMQ1P6osmXMc9jJz3+2TxPy1HhFfi9FkIckwhNthdlrqGf5+H/+zUmIj0deb+M2U++XuCboWtgUY/9Ezvv1p51VtSPMhXw1r/LTYYujV5GUElyfrDeTpDUagtOsqt7sJvISNvktCx0YpcC8xj0bspDGOMmjmGp6VEdt6AviZOZ+hy1a+we/oK7D7VhP+qw0tnoEeRNkr/mGUoTJQRftxaha3evlzaZCxeo4sD2h8KJOvuH50FM/Zx2dwHijX4YC/+aBMrtrPIZy3yYrboZrE5vx5jIypLClr+gPYEtF3GpCe+OZEgyokJc2KQKuJ8ypVm5Q77oPIuPRL061bt/YfBIzFtlSZr8CqnuvzM73sGyIPvv/yvEGEmAS2xoIMpSf8ijRCwc2BtU1bLZM7iWCcThlkKaDljlf2R+Hal6BCqeCMhr/dZTB7IharMcGJ+njwQWR0p74E4qyi92+g/U3a6xr7iromnc4b+/XHG8oPuAoWCqjyidHkwQG3nwqc8EBHHDyWCCDbYvMDU/4Tbs050qo3RezJXEGUKCkfOyydhx9j1RZWcvX6Ed+dFapLfCvLKeh0eTUWuqTCL5iOuIHa8jYlaYCV7vBVFzbH6d9DAsIEhN71Rxh3Q9gS4WrDnBomKBn0RUWcRxnA/u1ZEX6qYdjnYnC6uItztvIBaPT7GhzfPcJFWdipZzXlfMosbCTka4tDJxwGOsaRVuZQRok13+1TEAnuf3Xdx30vmZqVkgDY9leVoThWZdtfaQbEiOspDW9XxF7Ag81dA12Ke4CVhILqtvyqnCkUOEuqigacmMV3wDd+VtwpTEM9y8GkdLt9IzaRJ/L6YeSlpfDql1kLDNIEgI8t2KP5c6k9ZeaDG8iCW+HQYg65I2XRgBl5miE3VbOY4L2xn05gWeAlivBzv+Sf5SqRrkCzDWgSvl+h1tlulIKQvhUKAtfjwN3NEZLsIbSPL2H7ECnKZWTBHF+8TQTb76YvEeXVKixDjIoxRb5S9CyvomfNGE689aazi6sks0PXd1SygVvuNbVwuS6uG3cNEuyp03tHdk6YM4hDQjOMllNXrDx7wSUwWTL9/pnkFWwlJPym3zIzGOY+FhHUFdKDAJiOPdTJGvR79ghTdLr/5VkoO25Y2DhNkj2tJlfLyNBmWg5nZvDb8EXXt0FsLf2iBrQ/bpl+qzjZGEgHXGYv09KiE7WFsl4sfu9YEQct5mPBqiWZCyNSb0adj3u8M0WS889VOjIUh1STQugdOa6uybQJ7N4T7kwDRFeZDHimvC3NZkh2woZViYDTtsQkKglrV2EeUxjZ+ItGplOqGpDdOu+MNRTPeD2vJ9JWGxT80NzcQXRh3eleioDdnJYA/V6u/lGfKq+3Y0elJOYYKXxy1Vfg4yo7KrOyerABh0yWuznRk6nk+HrKNqxSPqG2jdegZDf+BIq0WTywgX+zy2mrKge2vY5vX81OVeFaWPeoFQCpnsYwrNuDw+b/E82VjFRjJ6Ex3ttiBfJUJ8gNjwo8gaXaYs+KAjOusP6NSdp+877ed/E5t7FvxjPXMEM3Ap1UhUJrqE/dHg5ofJ2Ny1n1W+I0XrsXfV8ICUhlBcETnyFLG5q6d3QcvhLePNC99AcqhG7vIxPTLrsaMxZrv5tHoBx7GCsSao2pTZP0ZULSMXbLgaAPGd8KX6RmCq7ekeQni7hhcy6TScHBK1YrkI/dz9mjT45iU8Bgb6a/tdV7q5WET8Q3YaXUph6c/Ru3VL7WnVRYS3Dcq93KRvNKRkORaExyoF98JCelE8bk6cjXOUjhRCl9NComGnAwCmq41bFjRtnFZq6qbNjeQcFTxOWkZ8NRnUSKUn/dJ1j55Ri4X0nQp7UjjJWb0RsU29eMH2qRsA6OzzUo2dFLX+TTOArDvApzmyk6ltmJayTpzxSsoNPSX/XTGiNHx9mrsGagsPl4bTX2YPm0hBw062ZAsgvOq22ENkiv2vGo4Cwo7yYHBYYqdltGChSZwrfYedp0wDSHURFDBKzTg4kywMP3M6sNSKnmTCFJf0NB+qEHE4x2a+kHqnyqcSyIDLtnxzhcq/xlZ4D8jF0sWl86iFHz5KZIcKR/gg0eQIL/+MntZ6vsN/9FGJ5ppyLmVKc76UE7hA4BITtEN3oW8506mDqtuYWjMNHdc/JyZOtoqh5gWHv7VwQtAqZcP/lsYIeYx+r0FZz4bpgWk1Kph8wuvx9D/KRm/Kqy3nRVp4fKwLrqWWrCh1Q5Qwfqsf0VAm6D/wXzeS5TZrvlsW/9PH5/PKzZ7qE+c/caoFryCwkzOHJsy58RlAa15YUXc7ONnUIpZn99ReaPV4PTKEM0aetEmubqfUYosKfgpPy9JkLZeZU3FHXp2Ujt0cWhYF7t7UcMZf/+C5/0IAOKJCFhihwPNQmIgEv4Y0AIyhEQUe+5VJVyqaTrKfoM9VrdCllcE/kMGS1JWH/dqOJJqEWyC8nqlQnYY20wlPe3k0YZxyDUdg3elGv/HXct6CZz0Zgnom78Z/yhnbslEWhbzke8L6hScT1LSx51NLiaYhidV1MEVU2Y5Wx2a+Cdhmpd18SpVGNw5DEn6Y+F/KXqLlbOPk8UurIfJCu9BGLhqscmpWWUbqwjE2ppfoWR4GlU2b/Z/Nk3I7F/7wjwls+QyTxnFW+HTyo/slw5fbkTrN1/ND4+apufZRUDS5kUKKXURbLB4Qwf16RXVPZzfkuboqQJSFCuJC7asudLa2clftpWd+BS7UrQppwApDk1klN7duj3FdmLsehwBM1/+2cW5UDkO63MVnaKC3EEm9s9W6DTHsa2sXUfc3dGYo2XHwbb5X1T2PNPJVurERPZ5LGEDPnOqyf5n4t1Sh4tHOL7XVd3wd3sZ6KmSnQzW1Pun7yVGCz7IbHFRrHdEvipe7TQbu3YC2UVy+yiV1w6sU9B5LTVqs7XaFWMMhCfNNQJ+0SCj27NUfK8OyHSqwWLe5lTlockPWhUdbe/qDuwWZpRy5j1Q8TS8KgRNMNq0fRYW82L0r2xSPFyLAGsHIgboo5FstVcVREKFgkra6WuE2XgWGk0jZkAJwHmbap2yNUsnjZ8YMmg0FysWqbZLCxGtXMu8ER+gh7LgUoVG1FsCT6xXIlOJMyMbd48iwVFw7jC+WfV1FQx5oJkjk+I4FXFHWV+lGXaDkkNlUstjqZJMuMPSv1SyR9TppbUjOGTAajO9mexwfObP9a36fCHNYDslrfCcc53jWCsh7sGE1l2U2zhWp2PFqlMw+mAkOtQC/vYlQ/1OijdARbsuyqrrN775sKFuuwk0tYRBbti3Hx0Bs8+X/k1K2fkUJ0SINGrBakcemQa7X9gyQr85mqw1uWHeiZTT46/yzuWXegPtdg4YMfWCiXWJguMWp7Lia9FocMgXeo1fBfKO7wNXnknVUq2OX9uje/h7LVjAOrbqQvUNfE+0mP53/Z9eRP/ZUvQS17yMCaeZQFxeH32LCoc3esJbXh/syI9aNCj0uUS/d/yYSufWWAzi5bxx8Z1NMRurUwBexJ+1yRNCQY+9dgoCqXeaQrw/SoZlSbPvzYqftu03q3l+mLtKg+A+vMC++2xYvHLwbOiO/SgdIfQeP3vSXMAVzzIUYE0KrN7Jhph9AAaejGVpICcI4TRVAjSb29Qi7JyyblbrSLCK5QGOjJ++PmpMJ3KIzGK/ZWQWWVjABYmHJsI27pxp6bIAn+UY4Pm8/SCG7qP+6v9JPMlNggidPKLOPSFQ95CBu6JLNN5rboCqdBrz9VxWlS5Fnc7RnS5jflKMPu7TU1wOPE8kJlB/2hfHjTL1A8FHoXdCa8nmDWDfQkt0bZrHK/hnanX/BUxvH3WTnwe0ZzcXLsIOwZE8X4x67RzOgnXYeG+UHnWrCQoa2YKdOhZa5WJlqYtoa4RZcJtel9z3WSGC5+bFIAmKXQR/WY26h683pXtMo1is+hZ7dNaHDZ+HHYubthJMbNx/KybD4L2eAHGtJH+7bKKx7um6x/lWi3p/ildsgMq8p4MYCXgVoDbBE278wkxmVTHmfJwSJ9/Pd+IoB27YoEgcAm7X87wTuv/XutbHYW143GtKn57CK31yfOhZgMdUKOb2LZnZEufgOatLM0i9QPLCdvcKd+g/l70qOhe7HhXY2miTdl4t3UKQUnHa6yQD+eHerJLjvv4ZrK9s02SuRVShYGnbsbHPYIcMz6sij49Mnj0F1msuP+tOKmPx0qiVSUu0pLvw42cmfTIuEviBi/+UbnwnukxC7cRrtVsJi475WjU31dN3y8IBmouXMpzSV2zQZiSWfq02/35BjYHG/4JxVFs/jB1+mu7uAUTrzW5tGzrS50iFOsAWHO4Gs6hGW2GnFQv4VVLWtK9mMauuvr1svwhbE/9bQ7fiboj/6N2sZO7Q0qeNu9u6MiTGYCqISiXEauSfAU4LPu1vCsMjO1EWR4L/a8WQ67LScdvV7ohKKky5lFr3udrNPhKEG81mGNroB0bIDmpPmNqepGcwX25Kv+3yKRHI1gwc7NbBvpsCQLqWwt6aVFCHTCcYViO3rOiJn8hOTm5PQly61Od3DPG7lX4i2l72yJKgkNMlpuCgH1fs4BDlWgGbjNbcuaCsKH3t0LSzJ1zWcNg/4vkLxZkacGKNjPYhRYwJeI9AdF4F39hpbSK2wDymh+hHi2ky7Nn/rzYaIJsBulbPNNI66jvGO485aRCHb+nAljn6R8Ui/WXV7AVd1/b2BXV2c8g2eXuspCZreDdNJtEHvtyzzJDOFN+d+9VDqGEcM6AADK5YYFRtRQeKn5CSKWLJKyJY5WZFsaxaUr/OX3Z2NsoMK8P+BbUdLpgKWkt4iK5h7OAwYxlawOIUj+Vql2TpaPV01ZV3yI55VMeLy2Ok1hkv7dSpb6RpKqure4W6PNHKV/T934lRWaIGxkPdcB884umF7M1shYMIfByZ7ybRb+Q3e3oq6AiQyV54SmkoOQrREppedwttKTS4Ua9Ox/f07yGjREXnI1ShIwDJba8Ptj6yt85WHUxL3KCIm9vDdr6hynCSamw7c1tDYWBYnclhSdn/ckleE0X0o70hHyb8N/Dz+ZtWCIGUNEQ34O5NeRTE21v4RqH477V5Jasq1cT8AtDIF46wD4VNffFfWF9ucJ7XMMUU1TfOZFQGhul0W2jqvlKxaC7+1ZplWmoSGv82bN7rdrKjZMXxwAb0gtmcDxfirQf7OlKfUqpKPzH0GYnbBWpMaDgAFbk0cQKuizm2385smBXz7GXtsFpecyts2N7MUOfCNCC04h1UBSCmPIqhYzUkNvDhrxnUntbXenJn4Wh25WaQgIQd9JipIMfTu8wE3MJK3BowR8CH0pWHp33AE6FH6gM+d48GvLp7rjcgEsb0ZCAIhXC1vaA9sgjBN6qLm3OQJ8vwDtv2w6J8/zJK6YF592HFKIo7X9Ha1vCBI4B3b/R5SIjQva13il+G16yCLHOiNyInG4hloVwQaEFv6SsdGrgsvnEwKiujAwY/+VRlLeDxsM+lMx2Id4FLz2Lp6627grTuv9iKNvxzxiI3kndPvyyhLV3ec24Cc4CFwdR0ADPYZ5ddFHUI+B/tWNuWIh6wcXnhplGu4RKvpJ7FdRBhe1PW8ukSPZQLNdZOanHOqnp4py3kdGCuvIG+HH0P1iBQpkriU4iSIwOAVjVwM42g/CLHZ+ndVc0QTXCIcuI74xBgU3z3pRhvhrVszkaEEGgKnDRX7tAw6QSodgFn2VvNYxVH4p+O4oJ/eqOJ+VY/sICxDlNmv9217VvpuxiJTX0ZtqSth6Tp7vTxLDj9YZhwCJLwKwic6ufxhagRRxzjcn493FYtdgiI+k8IyHonAWu8S12XiNHKfR9+ZRsqnNh2qudojfoIdRcl+XM+e3iBKS/AXxUgD/yctsv6CfoNycdFfBctv4bZ49jRd5b+6YUpbwRYVw1tkc5fKIsr03gB/XnNeWvQs+GatdIzI35ti9zCJ5EiljmIZ4Z1bA2qz4xfH5QQG0tRaJp6JswkYrK1aA37OlqwB48dY66YNVEYHcFQuW6aShqKbw1p7ADebn5SmdI0H3iRvVJIR3rLHFXRO7HbwF9tiXn/Dx3gnxDeCThfqGU0SB7OUwKAKyzmGM1VqSpGfG/NORMCWdZ9B7EfDP7UYpebC+FtC0XJDFkYHFq3GXqy7vdhXnzFbsyV8XNx9FRHX2JIbhFf+9DVh6L+gmiouycIKBZbuDri6N7mzd3Om8trhSRivkBYmAmMym21MmptOOHfd1VuGiPTCG/MEoag/Wvyxd9N9O4AJgZsGtFFzW2PmqpTju/thrcG+fnEidP1+q2YYbusGe/+SUviwm2BE0qTBYE3Va1SJlx5LYi2dQFVkws5GHw3MhLPtRSU29mCVWZ8AoySUZGYqT77Un7OWD/VKtuX8z7Wkw4cLb4SOLSpeer3/dDVRzpO6I27rbH+Em/RgmSpMwYEYkhrgySKd3HXBP/JTmk2oRWYjoxcAEQRyFqGXtklosBE5rVP7rJl9jGr58xO0mt2VxQDDm1oOHdmYAIJB5aoAXURNch2Lji9vZ2YoH4b/esMPnsf+d6g6imCjd/+MSzyg5T1AMmdAwU7PVIYCWzpIas8I1dxhIWHnLXoxhuGkoK2YXK1CMdwUKVYwEojSHL94WAsd/BrzRA9fGP1HDE5calR3CsTiHPTqSOrSK5/w9A9n8jzaK27vSXja+43jKFTFI+Ju+gwK7002ZR8JYMr6woNzznfVqEpjtxApurpxd2wMQIMYMh30swFkDfwPCRiDrR4yFz3huJl+l9BAB3J7kk1IrghMEzJVxzyrK6pZAG+5bSzctqXX8r8krCF0XsiA79WLy+AZhJYEiwP1bXXdDj6Dhabf/3xSkaZINajFw648mbIphnUZM2n1v7eoBVvfIj5of3uWimx34zzHAx7IhATBOlNa4NvwALk1K/v5O1a+y5vDhsj3tJI94dyWt5MSzm9+iWkx/ZNeqA4kxwT+bjS+A5UpxDTBEZyyr+9c6ob4dSEJmG1qWdhV9UjPg5IYLg0jYcn99O1WStc8QA6CXj03GAIgaVkYkFO84FlcxaN3ObAji65kgrbZ/WjwcrYegEY4i52AqBw/45or+jBSXqHzDrsAcgezGJUj5W/+vBquMqEvNQhbGIT//jYmVewBaTz/IobmWVpwi1kSQf/+J0Dd6cNkhNj1FMGNTnKwtbKnP7W8WMi/gcyKD3sQIp045bdZvE04HvE2bhq8F7HCxEJw2zcY5InlmrlgRYTXgRf5uQ4lieUr/nEYBdER9NiqNH1aYUl8JyIM8R6P/gbpIs1+i20hh4KE8OCtg/sEKp9qQvOJn9R+18bJ2/qIFi3pEhb436kbE0+08XORKCTzmAHYVHIP8+HEyXJJWJHFWSdydVmJX4uC7TE7FHEhGKDSPfkT406876wJpCIBWDoPm5NdV7jxwtupiJGbWrIG+wWkvr+4NYfVIolE86Zex+xiY3akLxU5ouF3MlSAc++aBdAfpHZH+zgS7Wj2HX4RvqZgPAT+UczvacR/aehgulU8mvcx3B1k0WWLENOWNDbk8/KwWFKwakxyP5j/XVUbJwzmOv6tohn4GiEBv62fo/tSDVQzPNigrE2SjQrfFC12M5ogYXLsafWD5mtYu/sKvT7Vyp7sR1mNcZ+Lyujfu4ZgOa5viyF+3B4QbCmVKM0Y0y8wAH2A0Zd6UvGmSl2aNZT8gS0q9rvfPZyY2HoSHpxXDs5xbrmdptrodax6vMJLmy7PoZy8TURuc0H5Bsbm92rA+N3XoAZ3PFmx5ysT5wpVSSUuc2vKJfmG8K3IVz7+cWNjDha8QxCf0wv7c0TwNd49wcl3wSBOTF3DHc0YESui2iXZl0RplqJ2loa3lb1WgBxghtb+ZuyH2MSuRXj7QbSQl7Fov0JT67AMLGRPQGmgS9M2Y5V72Ez+4qDp1F7KIzdFI+oNv/6w2Ro5BcRWzHjASMOH5yYSgFXbHyEOUJrhTGKaEIV5zRwtMj9tVZoca5FtAP4thA+kiTeTeCtqOwZC3m81bZq7U7yiy4q6d2KayeRn3AUaR2uk7DRm/BuJtmCiQ+0CNQbgIPrlSnO2zpdIG4bel/Z0txXoTI4kBSp9cLECcCo/sOC7ULcsWG88f5ufelMX1cXWH2GJ1m63roLBCvdIBIHh2lu9TTr74wfkgtyz+m4OpPhDJxCTaAx7fOcJLmMduSGCzRc01DTEkc7mNu4LPiqN0L8ybZmPagQ3gKE6QkUTaMAhNu2hgZQwXAmmoD6L8+Fo/duu555NJvxq4m/eNXlBpAs3d+ET64LkFTKGFUf/uejS5TxOAtfw8nRuyOptz0VVl0/WaPxW0BzM46m+ADnCCUTpnkf+tfuyJU4ng3TH8Bwic99o8s/3cFAagYHkGVxWIcVP/Sjxrmm9fpOo7YffexB7RcBPupVrYxg5VKr5QPjS6DubQchvbplpcLkkSp4X+08VUisStMb07DPZZZ580ptC2AfyWdBXZhUg79Iar0FQHFXvIa5m3B8/YGdKErKx9qK7JlIbXGYUY4Tl006XB1JmXxBYTWAYf/IOXiYxHCnKOpUeXhOq4SboqP3cKBu17cNnlPdS4H/nYuFIg5su+N0ru6G95uVNaFkU3WtebdQZfw4G45bBc3u2bjsCDgr4ubSpq7914olyimKai/C/4VZI9dxP3EnzL94T5kfp/TfXXdGdXbD384nrP7jvHhNqP/p1lVBtsCeYf9PjpSQUjMvvYVjWfCEO+KRiGlqNft47C1icr14QYVBJFoQxorip/+8DOlhVWzX/TmnMjee06LjHx/uYSwQhhy8YvxCBcJxNcBxCDrq5tWJ6THeedqY9gn6sOvt1T6YoFTUJjb0vGM5qQcqBI5L/bU+OsnXfnEHBUyRk1bSs6FEQ5j8hKq3p1iNYCfWqNPjhPLO1bB/nYX4/t7alEtTqtSwX4usZAA4Z5rxaZDpGIdjBaSOOs32YRLwzEgnd8oU/v2oaqBVTk52vM5ltcpHXFbKMtzyLpQtMKew43fLKM+xuVKe96Gbgfmct76wJtNFS66zTbxpKt8qaodG9Gpt9WcnYvEQONCkK86XBFztBfYpjlhsozCQQXqSMcLwZdyLhWwJgtPyJRPSMpboauy0jU7O4NuewfnuncowWxd739YgN5SBBaxUcMqEONu6Lak2XfhZOldSDIlHOLCEmZ4/a2b+ugE1oF4DDbtqYWhDpzPGBTEvlcBNHL9vFEQUk5qL6tsPWzAVz93eMCbN6B8y9+zm+Z+wwfW5vluZ5zw4gFcrJDEx4T6ccoOEKF07WWWTpK14OeaqwFQEBefDJMhUsiNKDnAUx01h4lIpyWKo2PNzi4uFm9TIhbZ3l0vqHo5nSirX+aMLFftwPICIE9a7VAEOJnv0GZKcZKDjEO/hR+wNeE4zuIWAXeqaZCA88c5W1C7GJUXsWBX9WHzXUCJHEI1NTuIdoPM+HFcbAoWBv0ypuxF0AwL9M/+gZNoOa/l5Web7dlQk4xxs5Na/IEZoT7zcEmD4DXQHPnJEKhexmtsuX82PGzX9/cnB99XmQcCV/AjM74Eb4j8Ej4CFxwPv0fvbWNtX/TRvFwJ4RXVnwk7ogwatnDxhpYW0XXDSzw5pMrw8LsJNpojZ8okWwkqNNJ8KCnXxcfsBTw3Q38VdjyqtxvVeX/cK4WSrzpv63Od9Z/2srgrIwg7gOJ6o/HM+SjZVZu+GbArgzbH5xbkdUITptrU+fOb9jSb7BAlEJIvv9Rs4Im9631UGlDgz8G8qX9kjdWlsvGr2cMwNPBvkb6MZiP4lA/qqY1VHA2L13vtAcV/pX9e6eDNfRXlkcE2qNZOoUAjXsZQevXB4+19baHJkIVZCeuoHB9GTZ8OpHiDU1f34SZ6pTwn1+ZqHBahy2asbO2IBLnAxShjVaUqAKKJnainscP0GgPOHeeznU/P5RHHxdYJvWc3zUsHjpStpsh6YNHQR1qe2eLNYebI4Q8QH+t6+BN9GXgxr8ow46Deb9VJnpk+7hvLcBVOoAYExbEqYrAWUGDYb/D0aKjy6Q2EWOz7LQabdPtRoItNVIdwVj9R0YzDw9Xu3Qwyitx4z2DBk8eFaY9cVRj1wSHIoDYXK0Ol97PP6ll5kerhvXRLvXQ1e65vecbWImo5Pq6Rpas3X47Ma3e1wZ/1tQokx8t+Z6lTfsfBpwT5HxNagOaSnfk0N3bwh/df0Rf3hXkUnMFB4s4hk9Mcq/CH2deiZf+2ylYfLGusrN0nnbNI/I6zf/B3R3HC+rzaOj+RK4SPOU38Ap+rgnu9OkWxCLFEPc8NPtAEzPpOvvoMLqYMRpKek2wRuK8GsbjLeamvBgqiMxJ26R4l5UN9hBWcCYi7M1S415PIPO1m0jqEcoxW0Is9DijOmYrHcmpDeZ9tq9cJkWCL/9C/jatDbA4WvLiAWfOPNQwrPjE3RmhlMmvQILiE/grD03GiWqFeDE/cx0QKx/6cJhdj7GU/pOH2us71NXVizr1dekR5krliUfJflGzW8YfEndFICal2DdpXGEkxTjOiUlyJtXj+qi14rWpnKa3V44qveWsH5+I5CoBmgAAAA="},
  {id:"avatar_11",name:'The Bear',src:"data:image/webp;base64,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"},
  {id:"avatar_12",name:'The Wolf',src:"data:image/webp;base64,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"},
  {id:"avatar_13",name:'The Fox',src:"data:image/webp;base64,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"},
  {id:"avatar_14",name:'The Owl',src:"data:image/webp;base64,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"},
  {id:"avatar_15",name:'The Panther',src:"data:image/webp;base64,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"},
  {id:"avatar_16",name:'The High Roller',src:"data:image/webp;base64,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"},
  {id:"avatar_17",name:'The Gambler',src:"data:image/webp;base64,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"},
  {id:"avatar_18",name:'The Professor',src:"data:image/webp;base64,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"},
  {id:"avatar_19",name:'The Queen',src:"data:image/webp;base64,UklGRhYzAABXRUJQVlA4IAozAACQjQCdASrAAMAAPjkWiEMiISEaaz9sIAOEtgBiawgrjyQ/Of0n0Nq0/c/7J/h/9F/af2/+T3UD1z5ZnQf/C+6D5m/7f9lPdN+lP/D7gX6uf9D/Bdbv9zfUZ+xf7S+8V/wfV5/fvUD/sf+R/9HYW+gH+53pvfuT8J39h/5P7n/Az+0P/89gD//+2V/ANR54jfmPyj83fxr6F/B/3T9sf8T7gH+j4hfTf63/vegn8n/Bv5j+//ub/gv3g+Y/+v4e/mf7z/xPUL/Hf5t/lPy4/wX7gfVj9J3cFn/+d6gvup9V/0n+R/yX/c/yHwkfV/7X0g+yH/O9wP+e/07/c/mp+//SIem+wH/Rv75/3P89/jP2n+mj+v/8n+p/ML3K/nn+P/7v+X/0fyF/zL+vf73+9/5//2f6D///+f76/ap6SP7kMaPsorpruDHBnjYhTuySEvSoZAF5QER2V86ny8ZSqA6iQ3HPc9AJiPgXvMxRpaAypG34dr27hPXZ/bT3+58tQvTTZ/v9e+GvMvPEi9K3OMgJ/EIR1z3kVdC+lzXk73Oo0jeckvOUsMnpuaa+8n1LECItdnHdL8wqG15yZkTEfgqPyjrMoJ91aK0CqOPSvHrQz/e6rj1zPBkELbkyox3X9hCdgM4NyuCFX5kpTGKabRWgJMMoPP3Bu2PzqscJtWeu7uecVCLgIi6XBPz7M/RKKt0cI4slvoV2WSYR9b/PNT+9Uo7K0F/D5Jd5jEiPXFMgCZ1tXS8VIyxHGf17MegtZHTOjHqhuqaPYq6EAeNvcJS/DdlCTRjISfP9sFNjKJBCubG7FE2bJmW/rwz1Tb8OToAm0v+MV9+mDsUJv208dMir/ZCoMQzJq0A0Z/4UG9L4s5q5TYhaGU3zBBIR/XZn1eIfR4WQ2QQCbZTs8N0GxQ+n+z1ytaspEq+sS0x3CG3VjHDUNXZUEsQP4scIeG8eCShojAipZxKrPXNK+XBK92fBXn3ziHPnxbCSGkk+RDfDzPzVqeTf/GZczHSCBiD4vPxnev+DQN8r6BrgyXzp9ezsn23H0Xg22rHxlpmT4PKc+Sov9oZpMIFMLaSzxFt5UsIXxX82GVq9rjgMWXsBhrLNMCc4AOj8XPPxXfji+nbG0r/u4niO4PafHaxBAMrDY5rCge/sPo2hN5EjUZH3mCRiaQDg4QlfEQNDfeKX+zKxQvnMaJRo8qadQXoSRuyX/IM3sTgSCUPpmd9MwJOtKmZK73QMj5IkpX+T7ZloblhVeVfpvKfFjrnVhmdwoKRfuzao1c48W+MqYZ1kLVhK+FMtJjmx6sZETdYtJBrl9s0qpuYlneCRutNvdCQy7xCAl1PyK6LVl2UwIwGE+ciJx/ODGZijDXpgqut6koL7b38XzYTYGPLv0Z4UkxMXBsojn2FPJY4vhJiy9vw484QIl14+SL50JyJQJGA8affw6S4QuQEpQmHq0TJKYOHOLAHixVqK44LbivFa8KTZ5pUjjdzBQMLS5H29Q2KDAKaKdUDQFgo3kAgAAP7//jQwUeIAqZOSMS7CDI+P/x4/w8zOmsc27euFyyX2lamehKuGSFjeizlFuzrUWy/DuTmGC9FyEia3mERdLLbt1D/swfkTcD36YdAApQ1crK0UuWAvsVasTEdZCgBWDLQMYrcqsvLSjjI/NraBUmZFM0yWMcLtLHMpXcRIwWlfweWDtVCQybSt05pdMadcHDCvAaIxCHBCLUN0VRglYjhZIlHlCrEezoOYGeL8UsBfSBOgUWTM9chnI2WG0nO+5n2bfXfUzYs/CtKo1XXbC8Fc6YS4rjlS8K6M3zORm3suLGnsd9rRIz0nTT91ly3Lx/PJXAyDl+9y9WnJkXb+G8Ynij22A/o/GKKScd5vVjH58TGI5DOz31n0wdP6bj7SmWfLJoyh6EP/d6ioXsHM5uIPyMeU3bzUOz6L+jZxlcYGjoaMxQrj5ABYnlozny42nTgANqWpdxBc//JPOxF+a2Ik2u68Wk/LbpvJXZKbQWfOlihiEf5ysqBN31cl0DF0lLLaCF5pcEdJxDvs54ZmW/6tJN0MFX5FtcH8QxY/cWCfOteDhc1zeBE7H7DPQ4dTBqmJXcif0kwhC/RzILHAPPOXZ7fpGuPtjpbuwqJy9L2OajjPs1IYeWOOCQPsRkueqtuWDuq9x0bh4PG9r3mfFHDINjLC+Wm/fo7A36u2GsfCz3Pkeetegssrr4EITkzQraqqRQwsPQhwYBOagTbtT84gkJdmW7lH2u6j6Ojga6T+hg8B1WUhuVfnmtF7JJVjIv8JuxLLoezMsZUgQytZ1nT603DnbX5o+OPSAC9Hxat/TkJha6xjtNryL4pa+yhiGYXmj8XXItnN2r/7BSHPWoJ2NXPXnYJUGYmxsatkABN3Y0tVO3dABDQW0UYDnrVYz9pV9K/Cg1y/wn4Cup80e5wC2G6YnnXXCNuqFPXe9lMytxbDLAMuGyDkFPbhV6/1aXEE+LIWAADaghB/eGvmn7HPXO98CH9STXiUavCJQOrIw1J0GunGLpgJsahNhffXDV6Ku99wDqVwErgy48BPrmfnb7YVry5/8RqcVDSMB/qHaPhW+t3qQmc9nJwvSLM2+If8BJrC5Ypl4D+ft+2VmlG78b2RAzemV44/9vn5wka4gK04ZCodfJe34B6g5Rsxa1ufrohEkz+EZrkb62hPLyUHIbM/CgQ/2vHIOYsw7srHgssge/y0OXA5uEwxVkY5edZXI8rVCWyuScU4Z/NGH+CooweUnW5vuB1CupbDgwJZiG0JzL6Evq61bRhtK4C+uE1UukDQkIiJZcWQJLI8uyVnCWJLSpMtaxYN16/SO669iRyKubVa0+vjv0+xROABY6gC/oC1j2H3TEy7JuV2XwgGv0PH/ysGxPb3kxwxzBSpwdwnqWO1kkyTtrfFaZ26ceLIl+9jdsy9/5HVfvhybT/JS3GxQy528Y/ld+o3H7yYX/NFlSVWoJeEjFEu69UhsS5G4aKjYuNfowp5R/+qj+MYPHcuHcvxJF4Ypu1a/jiQ6dJE8y/7gkcZza+ycok+vcouUtttJAcPJ2VLBseIraz3STf4etdEGUJ0Rz1T8j0Kn+bDMHmX2XqdBP6Aevjm4fPdUoZ3LC8y/uxtvS5qs0lWRn4FA3LedSgDvJ/0izjMsx9x/hAwXdenv9vaShTAYW3FEZ1sgfb7GMiaqcQd37HAWwh25WMgdo57TSVygP/fdDgI3xrjz6ehJov8Jp563VDnNR7pX3npXxfyuzRt9pdO6ooOpWeD5wFip5CYaRF3evmT2lcWu+swvSK1NV7OFyWwlc/O6TIG9kpk25XuKQVzE2rH0FUcTpgyeAMnxK7+cdmFxT3/Eqkj0Yt105t0mJa8VR/a/3hXAdwt84kbdlDSmRtS6kjWU3vX3x2RbwTnUup37Xd+zaD2ueLfMv5zKlOUdE+X/A+UDRfR3nUuT5aeVcqcNh19pgIVWlBMWe/4232N2/2baUhsoPFGsF1/rEmja7cPfovVJ3vutRqDhYMs+trEe5KcqM9w6HL8PGOKj55UoI0zNSHyGD8NfA76pOW4FmkXHvjt6ek3pQUaRO6gGG/3YzpJkUtUyEVq75qWJjWCRfhAJuLiL/4LnF9DKN5OGO4vy+aUvSwUGiImcA7os5M0eb7tlyxvYNHO0AtgBdoCWQwhD23HCEXQTrLidGpBtu+bqkwx2b/jftGAVgAXjau5tTLwxAC+YYhAR5FVUw4vLbwjgAYyDxf19TiRdx075fN7cI4JuAPzkpMSXmCSOwPlWahmWAILRXAPdBdWdC9SjW8s76ympEy+nlDGjQ+YwninWS/RuhShEHiDgngI6R/dB3BXck3AXRW/zGiFqz5HRvJFIaZiOMmS+6R3WBJetKwrQVAMeCTwvt6BBEdHGafCtkECie/031MhzmM8F2mWxsI96oY67Suqf1K97ZxzWCxCq899pA10DI73Erew+nzpAjhcILZJpXPuj0B0nxYqLv15L1zbz9jNJ5dFJroYIxkri7LQJZuE7JOX2YZ9FYqVNH99IITdEwKFm+YMKfjgjX3uAsOtUZwaIXjF4tuegzjTKyfdNaCT6z0ogHO/r/3uebiaiqGPKfJvfeXHKegyFxKFNExifD8mrX+9tRbTxZykasNDqk2OUYoyhjeMQEQ6fQCIP2sT97GZOhfceIHXoZnqhvqyIwVgEjn6FwHl5pssyBBV1DAxyW8kkpnj9umxIOkV7AkNT+zM+JUoSH9MUVLHVFaLSackfh0qUmjZKaWoPTqYUYUjihaUhgbClqH7Ov/qkpDZHee/G9o4au2y0mxeOgBTSommXo3JfKRDDKQZmQRgTxL0m1u/oMzHqSW4LjIZsFJFfhfvkN5N2QrHSzocLxhJoO3yevFLjlm2LLadA66U8AR/cknVwt8dd5TENo5jFTSm7iDd2KGT50r59x/b53cmDFNRrVdqzhEU8o7B8TDWxj1QzAWA5t+MKfASjdHcJWdez05hl6HAs7Zio9R1Inm0442KMlsyywpeRe6FHdubZJGY2L6TW71PY9Wh5EwRFbAT2T03Uo9b79ggUjx6scRTcBv01MW+rniW6eBpuNDSfuTV5Yl4Ol7t/Z9lQMx0+hbIExq8L48hNouGrFQkoCFBSdFh2cTv00nBoFxByr6iLBcZ8fDjVmhEJTkwK+PpeDOshj5BhjFsb+MBtFmHO7oexTrz9QeNXWxlpNyRitGsE9yZHd5g47Iq2UGgfZl8b3wl4HjmYU8VGSO3UQcHL9qN3FK67SmJ/Wkh4hBiajqLl40npC8jJNl+iWLE0lejZ0lv0AcYF2OM3zbN9GorNsUX37CRf96FFMbRDgMNcDs5m+StvAkH2+ZvropO7KHYBf36//pZmeq6OKuR19pgkjlbh5MXQEM3wJ0tEw6CwDQHWPfX5t+WEjmGhk+HtfxeG+j9fAzdKRrxsbm3lNayeH8tFB4PTuEvBy/UL92r3C4Tm//ILV4RX11vSoxNXSVlLNHOFU2pcAV+3p+MTaoJhBBQwLlmtysWrGsHbRg/IrlSIdlRomw1gr7Ji2W64g7k8oRiWQxlw6ATJKID5Ofczkh3sa+aZJQ2itezvJ7Bt3z0OVV9E9JpgFyXXJQae/oo1CrQnbgRXMJYhB8SxPWHPYqzH08iwl+XT3JIr5t3eGP7AZc/KfhKn9ujn0MKoEfwugwBDHHvc3gVw5qG0nclJQ1cYGGPoTfbkURFlp+PGKYfpxbeYuOqo2pYUMiQxis8uIZODFyTC4ehm6y+HslFICYIgKMLs2e1LJ0PVO2sQSg3Bc+P4dDRw4REVDf2wqhStuohw4Z5FEr8McWww8hC48zBSmh8w1a12WUBlQG4grMEVNrN4/F5FWbjlypxu0y2PHbKxCuwJxF0tmqDgYf2Y6/p7p+SAxupQ3hJ+tmqfDNfNPWZ0Hefv/5SUfUJZchpMqpg/KS0yfvXPmxqLtdzmsE2l5lIuDX9I4CqC2od1E8L4RXtFqql0RpxPHoL831U3QiS+B6ncoV3PpU/PyikIylAoM/uXMpUaLhTc405Py7/GDT3i6fYFdkie2XnVyEFwLY7E8MCVbI44ETXJ+DE/P7oZPtiaHlRhfrQCuov48pQjf4edN5e/k3zgAN7ua6WHof2+mLrVVlY2wZcflHkUAjDTuu4X1Wn7q0hyfXWPsIx5AARBH3NhQw9HrlEPBJyHGAUJD9/GxJzWsGMHmZQRMg+aqYhiYn8LpQKXHnLljw6q27IcbqeaMH4o0hhMBvfCJugSiTghE+Ltrs/RqAQhJNLYW/FY8k7ZrhdKtUpEMfFrjuLWw2gTyHynjFf0Sb6R51xKknGjAeDySG5sYOCZO/29KdarV29UqvF9O070GfuyKXwZQGs1pXR0PA3Pp6BlyTvtx8oxLxkTCxbylPUPc9FyPZ57XgJyQgjy1hMJ/q7ko1Dn7mzGtyVFYF/a4Ty0MR/0mBJLwOYbA6Bg41+ImImklijaI7xNSJEuKj9F3WCHqK0NMz5I4Sl4B3YCc9IL1RKjxQA5Wo0RoEf14oDvIo29H9ubxa2P86VI1zeTlil7pJjMzmDpCB0Gzr4Ct8UnGTM2tG2LdBmZYv0FsdwfHHy7ssYtK4EvxrFZ6b7YAqn0b4Qd6tRmyda6uAfklvuy+jzFOrsJO1pyeHxdIVDCXnnSOZDXYwfuF1dN0U0Wf2qGakGb97AP5kYcKj5YT3OWlZlDNZZeAo5qiuAltEuWq+6u+4ow6c5vQMDcuPHpMcbvOi5aYPeVVlEkYdEgWfSW1luIor1pe0P1TN1/t2tofSVC1O5UlSUYYH2pZEBRiiVFymZdkYeh58a1x61Lai17gwt72g5QDRWU5QeZtAizfaNoF8PslWmKMBGxMFb25wYFlmIXdEeEV1iuOJ8A7o8BhoqIiOXecVFBtA8YzjzSgx+DkimHVK7nbTntowOchNBo5Wvxq9BBvtQ8DzSaWBzfzYo/dNdC+cJWMkoKF+i90X2J3YGJ87ZFrE70dWsra8PwtMEeAFDhokWEbx0btefGp6V1AE6xtFviAOLAH1PRncxnJ8lnrUpiR7asVZ8FHejAXUVDRMg5+9IKlkWUG+OmJB6p6L6DTnlxNtVhL73j+FQGz4A/HyMlsRpGWnAsGGcfEfR4cGMSpwSB++527JCTIxFVPM11CbVf5eYcwWgSnRYqhaw5balVgSjoEL8hDmdFpjXTP2BHf7hoGNeg/OjGmcxs5QhfjV/g8fp5+7rdvQi16vFn76fCYt6i8gUQy7ufYG/UNhaaQ3MnOEi1PeaosVDaLJdrfdp1434v6odqtcHuYvB+RSVqpRH8XLLygD+rnR4P7bgCt1wPt13izhZzCQkVWjyPAE5zawEs3q5mw8WXYKXBhwUcKbE6fkJbSSiYR0o/kMe/2MhvtiO9eEq+ev/sf9wyX/KhLdlLzk78uWS29+m9RJpsPnDjn43WwNZZ4DyF0ZDgkUy53cLZ4rpE6465Lsau3/Q+uIAi3Xy6hwGn/nzKpmRtL/Lj4wVGHga1WIChdEoIL//fDHen6nxJLERBeXP3Rj11G/jpNLEVFGYP9vC0fJnk5D4GsE6sUgVFaH477MlhEnNniMvB+l4e3GsHaUHx1RaoNcQEIhpEdA9l87XXdMfe9a4Prpp5W0PK5afuiW6BVk6ANPwtowct/uQ1UIYamWSgIME+s4k8K9N8cKE3ALEpJhhWNWsV+gxP0kDanlafu7LC4ql+J9tbhumqKbUVbr5Z2xEWeTun9f0VHPJiEnpEJoevIlB8QmXcuh+JuolhdU1q22hv2xa5SyzyQUq7/o6qw2fwVIwMlvD5O9nepLNBfC8v2oVXoFvUY9Drvj4s7hXnHAFo2dS4GUSzwyXBdXmX4Z7bUQvK5nx63/ySg2mXABlH0aKXHtNBJMEPIqW1StVOy6r9agfSFvwYzQnmAKlZHRPlv+v6IIFHxEHj89l71vF3fehXoiXZWA4QKfV8lPgBiqR1Zv/I6X3RZQy485FfQkgoCuOJZSK4eDg5SGty9qKPOhBifO4Twy3B8/WYzSC3j8ldRTSFR8LmzTlI1WElkXVADlP+Gj6mRuA7JVBZoE2UdTGrx0JcZIgbxZXklxmEczI+2d3WpogQBxrc8iG6tH9dH/D5736/DBydtZ/nd/b+g3dkDH64zhsucyQYYfdzUgPwO1qK7GGFZ2tohbV72qCQDLkUB12OYARk1xxP0noOQAM0WnZMgtF5KkjhntSSTU56ZtOY2ftcC7KgESVCUyKiVYwiZX53j3Ssbsb2TYhYY+Iis3FcpR5VBbg+UMMDlPHVZropEEsD7JLeM3lFi4gD8z95CFtuVqoiiXlWmJ2ACDTkB8+ScVMwmRWKvJJjyRjGFiyzzVQ/ASXvt3U3eEvz58A2fd9fB2DK4ftUX+zy9ARp1AoTLCoclFM/EZk92xKBU+TA5wUmYYySLFMiTMGfb+1NLpz6XEZCqC9GX05Twxr4U7xmPvZc4HHuCLj1ztW0nf29XJRkQPQxGlPCXfydSRqn44Fza5eDnZqSICqpH1NJz6bFtCWpVoMkm0MA3Mfc9N8NR62mS9OSL523XT6ENCQAXMYwFBAv1s+4pepi7xG1Q14/xYeQ+iyzJ+u3Q8SgFb1HK+f2CvKVteF+4WZPIU7q4H7qYLMSmD/2ufnddG1/Phc23DTkZA9FPTu6QiYCLz/4PRa3HHg9vKCB/genSNVL8mvphj/V/vpCHtB0haboaFuNlGalKlUDOlWsm1/GdkKcf8dDBM8T0gtVLWWJeusvyL0L6HfYWbjyhIckifJc4b271jqAAfxhZikCsW79cM+hyiOkNt8QzL2Nyn4ttwkGVYvTcpVxN5UN1T1BZGbFJyhxbXMK+8vl3D6hqQhOvpz5+UpPe4KrUOijWnJW3mLLdm9fNKULNhULLFsVDt8kn2iwhwSjh4c3vumUeqzR7jKgnxks0ycAAxwdE9jteAKGvkGf/g6AqNaU67dUMBmXQD0ERKk95dqD7mu9N7sN6HWbwRFnPseoY27FPxoTGrzTA+4rbg60J+XVs6S9mVUP2OF5UlycKeORi9xaRUQZNEN7+nL9VKJ0PFnH0L0pO6dgFMYcH4oe1FiO3zFOmvSmgjf4wn9CpJruR3L/9E5pi4uyfxPUmT6PG2YPW6do29j3TmKbXmLQVNjSTilPDL/pkavAFW35mXuOdLqqGH44iVfz5dBnF9CmAcHLHKGVK/fUBaB5rlMGv11/smMC42f4P2zJCr1+Nj7OcMIv/rLn3SsvwQFbXcfYYqLi0f8yy7YgFW/xAR+FwgnfY8gMu6gQBQJGb/hQqtoRyRjHlJKzwqPoLN/8mkA4od/qSf3XiEJcERPm1YbKgaVMslRvauJTwBlI51BEH1BMCM2SU9JYLFGM2r47ELCLySIJ+gAw5DSWBBgYGo+s8XulGFSuTcK7Gl+TfG10Zq/BGgVKjejiWrZpkkGFfQWOQ2hJun8VAWRhr52FvLFwlhg3ytjgdeT3yaAJ8V1AmV4HjPCd+BXLLZ+kAjCiGkF7TqlXVbbMRMFmmY9UVMWYVH/GpDP7sf9LveNkeCmvhSlfLIaI50zh9sS1f5o0mVX2ysLtBeB7SLx9GZoI+qGBr2hScRu379VTUYBTGi1SuEqlY5VSI1VEBAmWeMqw3GxSnihCgjMZvuWNKZMQGPq7I4IadoIGBVNeTQ70PhHe/Jfs+NujeYBXE4WP4SlvkVPRcWwaBKJm2ln4FUltu1NYIORLjooguhKiymfVsuR1zmCQYNY3EvttHC0NRJDSZR0ziiE5kTog2QuFuojttXCvm0l1l9FjPTFlkTH4mgSZ2YS8Ss0ppiqjuZVTqBy5UyWQuvG5ZbB9U40zx/c5D+5RP5/njUfA3BUDktU46xFFcxLpjdY0/otL3em5UG9U0GmlN1blHhToBC/rzNIG3CpNN/go3F1xkxVWL7s8ayQ3OJ6A/SQDrMoeqGO1XRWQyCUjM/uS/Mf7cElTi2kX4bIBq3SlS58BLetEhT39Agp4zUAcItdcmr3SkoGJW+zj53EJhDr1pD8zEJI6htoaY317iNzDqN4l61c3aKZlFJCpzleUCoVmU88VJwMHkboJwmL4KTlpgNOPDBFRwS9BB81Gc3rtkQ83CsZMpTItNY25uFF8JPPGrR7Jn65C5tVAWE2R/6j8sFS11TTyWurhOLjqK6Fsd6ExrqiegYVayVaUr7Cew63MvRhwErM2cISkGrjlrkbVtmCghBH+nnWm18P5J5kB4k+2z/rNFjx9jElSTphEBE5RN0GjCSXty//5d3vrVY+M6+6J3Rg5YsYc+Ly5C8xTtRf5bSpZ9LBwzAEZ2yX7DauUgooFojHSS/xWe1CfDUJHfSicZMpxP+dbxFMwNXfLtKa4cgTJzlUcmHBpYQJROwO/WfrxLiUla5tYBsqryCgEVu9DeUa53V3Y3Rw9OqN4KPsCfk2X9sqG/Oe8GlM5pKn2bG/bd6dD+1SLv0pGitH1KHJcRZm+rWe+oN6DpnPH18HUBYdX2kyLzLgey3FAOGvse2JqVHgdO9sexOZDHIll179JUjXCxN7BtGRZS3eWXa0C2aqmPHLigxqPf+e5ag345vzSmJivdt5Pq/sY/8cOaNq53kXAafJp9odjsT+5EvdIdIawcZWkZGh+rO8ZuM0zVYfIxrsiB63x6k1cDsUZSPRTTkI6RQNZ/RFnw3EN+uGkEHBAmgMBev5hjI+592nHYWX5LCiIe87O//qJNC27KoXfgEtdaJ/ubSSK2uH28UkH0T2QD9XWiMxQstICX99eQL+YQ+KoZ8NREBlPLJrzQsGdWfgx1IQLq7deG+JK6Ta1MzhfAqB6v8p+5L0UXC6T47P20t8Webafe+ai8DXEbceSXmIcmjF7e5mGE2B/SrRL227eJCRORDWn3wOtUD3/+0sqnTAuL6TfJROY/T4YIOLeGTDhpF1jnAA+et1lKakLSXIg30S/YNe3TM44HUUXdVlx76zLL0tz23spsRCKQ4sLFZsBLcpef68Zby3oRC85eCJOAAtpzafWs51NBXmkfg4r/411xwdfAKLky20F7IIEqy0n95DjsvSdivPr9pFhmvVJc0dKtSm7KP+e3v/JfRnWxGHzsBIFgiwjQMUuehX9VeOfE/8fEHtzTzaRxSJgnYkwI1angQQmv40QKdEypBISJIhjUg4lLrB6FXA21GGjq051cZHRlHBunyXRBgWAUfApObYOOP9KgpH8XDDv21wJWIE7mog8UAhjTNGv94eVn4XlmDrykjsTBnvoZsnkw2U3GUT8MtNM02DG1Ffcn3u0r5rFj7GUN1XAYic9MYbI+P6Sf7HKmP25Ngj8pPYCQDonHc3VyKv5Gg6MZI50RBTd7BQKEkke+5tUFmohXuBCJT28EiVW+E4v79QJmT3sp2TiIqrbUFvAYnOnn4yfbgIOGwFolr6wUAnicwYgQ1m0AfuY7hwFgbL1S9CbL+PSW9wjKbwpqLXE56nUsg7g3mw61t/mKMhX5/mo0dyUfGQ9bQe/xyyhlItoH8TTiayRJGkOkuk9xhGIDrfLwGhvazSV8Jse1yNPCyPNCzw8unv3/XTfUJ6Z1NEWdHRo5VLkZIKHVTjSbhygdFqUTFMWD/TKra7X2sCHDx28pRth3UVJrLh0P0jU/r3bWcOO8Nt/EZAncc3L41ZV79AmH/0rIqpvF1YIP5dq2uiyJvuzx6JKNYpiwlXzZaX6bs8Yr4R+IqXEY8LAHvv0qAqpkZa7dEnhMju1VjzUPuuvpyNnSZLdMvza8iy/WCu1zcG0Xu6E8K+SxcfFGLtXPgVESP57qwAhmwLTMR9VfuTvcc/660vl9meYqPXyVVDy1Rlp9V8IdrKMMJ7YCbhNDASxyaZT4m+GI3glduoh3EuShcs0DOO/L2ohUGuAVnNhpVHOcEJEgrhIe/HuZewuEhZglh/g6QisAshVsZhkqs5lzpi/xWHHUXn9Yxbyzsn0o5x1dKo1g6MfonW+KWqDvb7KxmZ7W81Pk+grCQAGFN66ZV/xOosFZKDL93vayFqRU6MV77Mf5DL53TXhfn6HW1ZpjfublnZdiYdbxuN8P7Pss5IzMY4M8ytL08e4rGOZC6e7x3bA7SI72v0DqBwJ0MJtvyHe0jxwCgkuZMu9bLpT8yWsX1kwuBazQ5ucgwaq9Zvhe8fDb8OX2A8Gmfj3OZokQ1QYiif/gcNK09/I2PXblaC6kMK3CjMSli4M323Nnxh+lxzZ9aOkQaIMHlQRAUWUrumkN39omm1LGfH6b3Dep7oRxsHRwFUxO/JEwKiHlXwRoL0J/SBqSCTV/5+mJtr2tlG/qy8gWXBmnEg/CYgpWHagjm//moAzWdCGy40RrFNFpHFiFma/b6nASux25SNEjCle2FtPtxTvlNWL8jdD3rfzCSWctkh0GW5bdHhd7A0RgeYtm4fJYqMycOsOS880qJLMgEj/UVE4iBQojU4ufaworcURe3zlvgw9IhBjcDRY07hoY2XBirxv7rjOGCKTWsP5pi5FudCRGzaC5qpb4OtF77+u6Vyo5yQqDUCfPMW2aIVSI45JW3mWqz46DpmaCSbJNnmqd4LZxldd4XKbh/O9Pd2ejXZpvhNbgeZfMEWvwzBfvgvymt868AuwE9RAW4L6UJDD9g1FHRQus13oD/tWxN9nhGlYOkm7FtVp5D+q+/Sc4u0ZAic46vSxSO8hPD8vKllFQziV3mFRxsCQroApmNguRCZlYsdi1EGoQNoxEz0BUSuC+pp5aB0JluTgGw+713xJwwQ0nKVEvce/BlnZdl27gon6GNO2SSsSR6EWjhrrZvgPkm84StXRWjFIdKhoHwzjLJvm8nAA/QH0nY9rEZMzHNcwkCQl+U07/uU6kGa588lkepbTPqVkheew1zK+dG6cBc9YGoYjG7D44qlhYCEV5tRk9hRwevzwBhSTdl+7TK/gMrTBWjrZ21f42zjllyWcovmZ1FpFJuGcuj594WDqfG+eWBU5DPjm6cDcFRzPwEMpgWhNhMeLEYYRS0hTGbj3FZblZAIResL4SPd2nMvuhsNmQxTpo4cOFRjkpaZP2gn28snCD5dk/LLhktzFH69eHcY1sjf7DiX9ndDGWRpX+BRFebWxxD4+thAf9FQvSM62VH6c2BHZjpmKK6Ut+J7+4yBb3HNiwI3Lj3R422zn+YYrQjyucsN+KLacmi44YsPc+m55Ga806ciA7yAs35iw0mB8rl7u/bzeRYvwgc/F0DWS9CwuxdDRf5KC1r/mK/0sy2V0T6c6hwMUiTmXsxIwYZqLIB1t14uqc39iQNZ33JmnaUVpl8rHmdRsxYWyb1NG3C2V+Ji673vIXRjTkZIrnUjR6suCkb2d7waf4iz70kKTkd/60FqVqw0ZEuaXH7iKzndnTOGJ6kKy/jnA0hxOfiU+vixgLvz332Aq8c5P1rnHvS7365KYsmusS+MTrEVvhEdO9lFwXLB6OOAzHJdN7jeOBgkvUEItN8HJ2HYrC6rFFBmSooKK8v5ZRDtzD7XYy71HrU87/z+BX/K+r1droSlV94cAWRbT1f2Zp9OzkYEeSjzwJK1I7GlACUa1JvZFYDTNHZ3G2b8TPF/ldYBCSPgRlQffTZ9bL9Hy9aY6ty/A7V3ecZArlP+lNB265p6PeLJZwhQx45369icONusfQ8inyllxGi1pWYjdSWqBpt40jsWo0zK7fP4r3CLMG1r8i+qccV211m1RwchCrdo6NhikyDWJE8pUD9hZJYIl8MwmkUkeC4QlV4oz+nKTzcMgm9TDuO0a8r+nuQG+DYmJBv9fC+MZzFFyzI8cyCYic4uZcP/kKxxZ9Q17R73USPhqzIuqyv2CyScM/Cs3ENPOUJejExkId16h0ubXhQSG/Ets5+rOUU4xEajYqPDYE0mP6rJHwozgS2X8CizYd0fOJejcVQgY632qtXSe4aptNF+bWccjXCSHqH21U3Cv83aExlOU2pWbLDCE3WPgQw/GyPy7s03cybu325e4iHevfOXBvaLDkJPY11fss3EdG4Mj0m/dpeOEP40eKJ+iVePjKp1twQSZQcLOhMPa/BL9FmvO0Pg57V6Dm6xMhB+bd2taXs29pxc+8i2frcm6xdIlTJlcLxdEb2YM5mk7o5BStAuCdx9L5B8rv24m++rk/BcJjAZ0o0PKzw9Fg69AtGt7iJZIFgP+jPZejUtrdL9IjNCOg/kpm4dULzZazv9ydJkGnXjcquiAD9TUv6JGIXjJZhwypWS1WnbXt57C7kmpzZp1ar3+CHum5gUFJNqeH1vbOePjZetSjcuvoiTnbqhxX+kmKSQmwCgRZka+rn0B5i2RluYgsZRPUSICILt3QRbd0NAPKdr9/hyBwxu03d41hMQibaHUS9vu+6VXNBXQOpF8AydIXQXA077oI4MNsvlP4XxwvXLnYM47gXHPgRO6p1hZmyi2zMYfKwXf3mAlRrjOEMWMe7smWiiZXbee7ZKPoLbdv7NJKsJCcdxQp/qmDtWEj1f7Q6TwMdoVVDHWeOxkR5H3OmEfIymJkWklltDxQ4uqvkrhYpE2BFctpGlIf0oWXwGFjEDT1z60ejvIyXpeXDAsCy3vOG9X1xeEeqjJNQakvkr4IvJzLVtAyyyrQB0xe/E/lWdTmx20cvGhFnITS0klgBI0Qk4xyjsPc3AkVbs4/s3j4Dh6HJ28ebXgfnINxlxatn4cp93DyJBGQ0hBmSj01Kwi0fjQtKyOUHU1Kt+bDRDG54lJTTIchvOk1HjCWIrswDvl4NgPIZs70tpYQ1S4IayY0cPA8i1VHyUL/TnhQIaYSzUlN+0f2TWCFwQuvF1B5Bb6ejX4T0p8/MdyVV0Tgh2ZwU/LAq+rFhTCl8xfgizpkc/7CV8SI/TsW0aeyMDMo8BL9FJ0XSwZV7+MumROUCLHUT9JNG6VAGYIWpbCFoaCzSRUKjS3kWPCDvgKmXclk7cn087XrF2WHn6xeyBcnj8LEd7Kl8odzG62MKIXZHzmmAnc+43hamuhzwaajO4uJ217g/JS4L6QUzIh9UJ84u+usTpk8/11VviXhxWBTvylHzWB2VAsHjr5y1e5xNHSdzzoN8zXgctCCOr1uTfEvgt0fd/K1phel7L5ETxjhcq3fuqm6sDZ4RhWvzq39cJJ+5NuqFbMAc4djYHQ8wXu73w1FpTNWF/b71fayD09Seplabm8TFWaQ8L1e9tMFa/VkyNnNtMLHOW0LYxyrj96fhSqz7usGZfwwgQm2luXKsz7TfqyT+VE63L9+3DZ9YM4pZ0HPVQo05nlx14FBh/nVTCijsCmQ0qyGBhloxsAOeWGgPlfk1o8Y7DFQf0+ufA2v1emqjNqVoD8uOnCp8B2VQfgq6YPD8z4f/D4/LOXMxBG0qfrTZI0t4d3x+td1mpPx+xfkTrYnra7BBEW7VSxuY5wrCqbkp3JyzPsQrnEmclczGDJxL1G2QfCZmaclRfXdhfKPFBZp9j14k/lV+GNDntWYJKI/Wt+ssyP8w64rI9Xzx+DECuSKMmZhz7ASLPVAE/1UJgiX3hXs35y2cg9wqCFAqS3EvkA5W6vRmUuHEvElquuHhds9UAKNfyFRpWX0Mkj2qqDZ21x5U+92Tl89Y8iDZLDx7ssOFVHU8jiqdfnJVprb5P0KORtpNyjjxcKZoS4Tkza5x3+3b2AK3Hhw0jkLwUkxTGQkf6jN0dHidblebKyeE9XrKxTlo+bizI/WJHFK5eiujfGJoDRCPCl3ZU8Us4Iz4nyuPPI6JsgH+OHYH2Bn8WEoOHE88i5oWThLWf6YXwwJTBys6RI1SiYgZ/dZ1LBBC8gfuA6qtLVYzpUMyX++6AIG1qbDx3Vj3yvpPxoJqB2m/6iRjWjMewiIFw0HTzKS6W7jqG4/G4pevKb/8/bN38EdVVxoqGwCyXJhgRmh5ZgxdhtBFBTOmBnMdo5CqK8it3/YExwydnBCQLYpBa7k6eJ9M6dWx4DnB9qJDFmnJ7MHLJrz9jBVfT067yBXstzwsCD6oqnEeX7WVZWrOqlldIrbhePVMMi62CEwOsr2cBS1Erq9nWc4FdgYMHzPPZV5JCDCXQ5QrmZgYLLVY2yCY49qBOFBkNCipKfquBBWMjeHo3R+F/Yl0j2a9EmlEnLqH3s6Zu2rXub6j0VMBIqh0AbSlDGO9pYVzWvI6xGT3+RfcU7tU+bXSs8b2z+QM7GnN3l74sAlC0lPixWUtJ/ffDIRpJdCu5RbeP3MnjTdh1QYe6uLxghF/mkwRu0ARmwr2yfTwN1QW0QQQqszv73/la03GpU5mqW+/0ULr6jeaLS0Vz9l8R70rcPBQM7Wa25YvRshMCTGi0Kbf45UvLOeluqsPj1MkWbAEvHKnEUYaEPLiP5422c2eZ1H6PrCvEODIENkA2JEewnrTL+nLDN3gRy+Bt/Czsc/cXUMo6ShOlFDbdTpyoFAQ/IQl2Az5xT1fjnrFWHTAN3+HGNGQMDHpa+q1lJi9JGKlPWs2I0Dbs/PShyZOxlRKPHf2qsnKBeC8UcbkXXl4GgRBMGpW7mp2J/7yk2AgxNy/uTDvVgT94f7vGpmtxpmZRay5hUgG9sreKSs6AfOJF9dKNx+i3vcaVEREu0qYt2xvlq2m/yW8wuaiCKK+1+qcWzf9fae94Wsh7CszYQQXouodKaiLeT9SmsUYpXkPDAw/MiLhy6vaCbMUJ9pJQf1mBzX7p1mK8ey/3/MNOIDCr6fdx/Vcw+TdGRJ0Z9Xikfy/7ih40G3M21O2g7agcEDBSAraVp5rSSiI0pNfw77jU6GH0Anr22EGi+7gi6jLiPuANTFkQ8ckhFt6Ot3X3+yw1DI9RFn81e9niSE2SmcsBDaN5EWXR1aqqYxcP7mjL4hug8mudokiiJoRttfU4uM2u4QbWr+xCcTyKw5ZbjZBguGei8Fqdb/qL/hac9W8IHjwwuSc5A25UfIUzwXEc4N5MVFDcP9RRn8Vxx1firjESCUoNlyUUWUZ/cSBN1jg6EaXxBhiheM1GiPa0TYHr5ORbwHQEvN9uRE8LHXeQs5Am8ymorCsDzA/xzX5UklE36tIVSMPJOFGR9EPm421HJ0Cvo1eLsHZK1FXlMm0m0Ug0zJkdOispqnCIUZXrCZu2DE/2InvTgnTPocq8ftcsbWiJ1TudY0CogWZhpUyiGCUHxCbKDuDQpIPM/gwCK9FTiUynoElKvOxpcHxyY+o1VKcfC2JJpdOtqfJunp8FTyXTcyF9Fz9ZBt7n0y3TEFkbQAKTZuC7b5Z6x2axy90ewGH5vST0MtIDMy7LWRPlOLokoWN6Th7M4YJocmZ4Yj/W/C1fsehbinnv4o/wvJGZk+k8XgveRjPNQt4499yLetlWuT3bmKOFb3l82dXbsrNTpjqhOUDrNw1NK++7l0iMh3EsJelyed4vO3xxcsXd8F0Fy4kzV/i7XO//x+aEx0wj5RVJNL+GnAof1Bl4Ql7hjoQAgXUcXo4pAhjtAi0u9Tcu1gkHkR8AFf0GcoNZ1dpY5Tky/Xaww8n1vcylssDrD1+zOhGj1PKN4eNHGegBwlWBSKtLC19e9Y9/P14mdy01XyiQGyIZlNm9ImUkYao5d3xKJv22cFIi9a7/uAwuof8kPpb56OfrboxTy5Hp4L+G2vIbMGHDUT/pFGXDbweo9qlbmufRq0xFEA+Th56+9Ec31Tj/bSy5GBjO7sA9t9BGeJN7MbQDOKMr8lGDki/9DbrY8ykEzQWZISx3V4xvglAsbK3LimSh8yc+ZKaPjmyK17QCWNi+SLp3xYpWlHYipiVu3i4dHSUu2zuNRBtvL2bdNAmxFak6/SuJA4Z1+MXQ+DfIsYdUqcp/qAPBm5PGhFyG2j9NGWxDqhnZropyDweBfPX5DFi4E2MligAA"},
  {id:"avatar_20",name:'The Monk',src:"data:image/webp;base64,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"}
];

function playerRecordByName(name){
  const key=String(name||"").trim();
  return (db.players||[]).find(p=>String(p.name||"").trim()===key)||null;
}
function playerAvatarId(name){
  const p=playerRecordByName(name);
  const id=String(p?.avatarId||"");
  return BPT_AVATARS.some(a=>a.id===id)?id:"";
}
function playerAvatarDataUrl(id){
  const a=BPT_AVATARS.find(x=>x.id===id)||BPT_AVATARS[0];
  return a?.src||"";
}
function playerAvatarName(id){
  return BPT_AVATARS.find(x=>x.id===id)?.name||"Avatar";
}
let pendingPlayerAvatarId="";
function renderPlayerAvatarGrid(){
  const grid=$("playerAvatarGrid");
  if(!grid)return;
  const current=pendingPlayerAvatarId;
  grid.innerHTML=BPT_AVATARS.map((a,i)=>`<button type="button" class="avatar-option ${a.id===current?"selected":""}" data-avatar-id="${a.id}" title="${a.name}"><img src="${a.src}" alt="${a.name}"><span>${a.name}</span></button>`).join("");
}
function openPlayerAvatarPicker(){
  const player=String($("profilePlayerSelect")?.value||"").trim();
  if(!player)return;
  pendingPlayerAvatarId=playerAvatarId(player)||"";
  if($("playerAvatarPickerPlayer"))$("playerAvatarPickerPlayer").textContent=player;
  renderPlayerAvatarGrid();
  const modal=$("playerAvatarPickerBackdrop");
  if(modal)modal.style.display="flex";
}
function closePlayerAvatarPicker(){
  const modal=$("playerAvatarPickerBackdrop");
  if(modal)modal.style.display="none";
  pendingPlayerAvatarId="";
}
function selectPlayerAvatar(id){
  if(!BPT_AVATARS.some(a=>a.id===id))return;
  pendingPlayerAvatarId=id;
  renderPlayerAvatarGrid();
}
async function saveSelectedPlayerAvatar(){
  const player=String($("profilePlayerSelect")?.value||"").trim();
  if(!player || !pendingPlayerAvatarId)return;
  const rec=playerRecordByName(player);
  if(!rec)return;
  rec.avatarId=pendingPlayerAvatarId;
  saveLocalOnly();
  closePlayerAvatarPicker();
  renderProfile(player);
  renderPlayers();
  scheduleCloudSave();
}

async function deleteSelectedPlayerAvatar(){
  const player=String($("profilePlayerSelect")?.value||"").trim();
  if(!player)return;
  const rec=playerRecordByName(player);
  if(!rec || !String(rec.avatarId||""))return;
  const confirmed=await bptConfirm(`Supprimer l’avatar de ${player} ?`,`Supprimer l’avatar`,`Supprimer`);
  if(!confirmed)return;
  rec.avatarId="";
  pendingPlayerAvatarId="";
  saveLocalOnly();
  renderProfile(player);
  renderPlayers();
  scheduleCloudSave();
}


function playerSeasonBreakdown(name){
  const seasons=[
    {key:"2020-2021",label:"2020–2021",rows:applyPlayerAliasesToRows(ARCHIVE_2020_2021),official:null},
    {key:"2022-2023",label:"2022–2023",rows:applyPlayerAliasesToRows(ARCHIVE_2022_2023),official:null},
    {key:"2023-2024",label:"2023–2024",rows:applyPlayerAliasesToRows(ARCHIVE_2023_2024),official:mergeRankingAliases(ARCHIVE_2023_2024_RANKING)},
    {key:"2025-2026",label:"2025–2026",rows:applyPlayerAliasesToRows(ARCHIVE_2025_2026),official:mergeRankingAliases(ARCHIVE_2025_2026_RANKING)},
    {key:"2026-2027",label:"2026–2027",rows:currentRowsForCumulative(),official:null}
  ];
  return seasons.map(season=>{
    const playerRows=season.rows.filter(r=>r.player===name);
    if(!playerRows.length)return null;
    let s=statsFromRows(season.rows).find(x=>x.name===name);
    let rank=rankingFromRows(season.rows).find(x=>x.name===name)?.rank||null;
    if(season.official){
      const o=season.official.find(x=>x.name===name);
      if(o){
        s={...s,...o,
          avgPoints:Number(o.gamesCount)?Number(o.points)/Number(o.gamesCount):0,
          kpg:Number(o.gamesCount)?Number(o.kills||0)/Number(o.gamesCount):0
        };
        rank=o.rank;
      }
    }
    return {
      ...season,s,rank,
      podiums:playerRows.filter(r=>Number(r.place)<=3).length,
      net:playerRows.reduce((a,r)=>a+Number(r.net||0),0)
    };
  }).filter(Boolean);
}

function renderPlayerSeasonBreakdown(name){
  const holder=$("playerProfileSeasons");
  if(!holder)return;
  const rows=playerSeasonBreakdown(name);
  if(!rows.length){
    holder.innerHTML='<span class="muted">Aucune donnée saisonnière disponible.</span>';
    return;
  }
  holder.innerHTML=`<table><thead><tr>
    <th>Saison</th><th>Rang</th><th>Points</th><th>Parties</th><th>Victoires</th><th>Podiums</th><th>Tabliers</th><th>Kills</th><th>Moy. pts</th><th>Solde</th>
  </tr></thead><tbody>${rows.map(x=>`<tr>
    <td><strong>${x.label}</strong></td><td>${x.rank?`#${x.rank}`:"—"}</td>
    <td>${num(x.s?.points||0,0)}</td><td>${x.s?.gamesCount||0}</td><td>${x.s?.wins||0}</td>
    <td>${x.podiums||0}</td><td>${x.s?.tabliers||0}</td><td>${x.s?.kills||0}</td>
    <td>${num(x.s?.avgPoints||0,1)}</td><td>${euro(x.net)}</td>
  </tr>`).join("")}</tbody></table>`;
}

function renderProfile(preferredName=null){
  const sel=$("profilePlayerSelect");
  if(!sel)return;

  const ranked=ranking();
  const historical=[...new Set((db.history||[]).map(r=>String(r.player||"")).filter(Boolean))];
  const allNames=[...new Set([...ranked.map(r=>r.name),...historical])]
    .sort((a,b)=>a.localeCompare(b,"fr",{sensitivity:"base"}));

  const previous=preferredName || sel.value;
  sel.innerHTML=allNames.map(n=>`<option value="${esc(n)}">${esc(playerDisplayWithRealName(n))}</option>`).join("");

  if(previous && allNames.includes(previous))sel.value=previous;
  else if(ranked[0])sel.value=ranked[0].name;
  else if(allNames[0])sel.value=allNames[0];

  const name=sel.value;
  const codeButton=$('bptChangeProfileCodeBtn');if(codeButton)codeButton.hidden=!(name&&window.BPTLive3?.getVerifiedIdentityName?.()===name);
  const d=playerProfileData(name);

  if(!d){
    $("playerProfileName").textContent="—";
    if($("playerProfileAvatar")){$("playerProfileAvatar").style.display="none";$("playerProfileAvatar").src="";}
    if($("playerProfileAvatarPlaceholder"))$("playerProfileAvatarPlaceholder").style.display="flex";
    if($("playerProfileAvatarName"))$("playerProfileAvatarName").textContent="";
    if($("playerProfileAvatarBtn")){
      $("playerProfileAvatarBtn").textContent="Choisir un avatar";
      $("playerProfileAvatarBtn").disabled=!name;
    }
    if($("playerProfileAvatarDeleteBtn"))$("playerProfileAvatarDeleteBtn").style.display="none";
    if($("playerProfileNickname"))$("playerProfileNickname").textContent="";
    if($("playerProfileOtherNicknames"))$("playerProfileOtherNicknames").textContent="";
    $("playerProfileRank").textContent="#—";
    $("playerProfileMeta").textContent="Aucune donnée disponible.";
    $("playerProfileKpis").innerHTML="";
    $("playerProfileFeats").innerHTML="";
    $("playerProfileAchievements").innerHTML='<span class="profile-no-achievement">Aucun accomplissement.</span>';
    $("playerProfilePlaces").innerHTML="";
    if($("playerProfileRecentForm"))$("playerProfileRecentForm").innerHTML="";
    if($("playerProfileRankChart"))$("playerProfileRankChart").innerHTML="";
    if($("playerProfileMainRivalry"))$("playerProfileMainRivalry").innerHTML='<span class="muted">Aucune rivalité disponible.</span>';
    if($("playerProfileRankHistory"))$("playerProfileRankHistory").innerHTML="";
    $("playerProfileRivals").innerHTML="";
    $("playerProfileHistory").innerHTML="";
    if($("playerProfileSeasons"))$("playerProfileSeasons").innerHTML="";
    if($("playerProfileAvatarWrap"))$("playerProfileAvatarWrap").classList.remove("has-avatar");
    return;
  }

  const {s,rows}=d;
  $("playerProfileName").textContent=name;

  const profileAvatarId=playerAvatarId(name);
  if($("playerProfileAvatarWrap")){
    $("playerProfileAvatarWrap").classList.toggle("has-avatar",!!profileAvatarId);
  }
  if($("playerProfileAvatar")){
    $("playerProfileAvatar").style.display=profileAvatarId?"block":"none";
    $("playerProfileAvatar").src=profileAvatarId?playerAvatarDataUrl(profileAvatarId):"";
  }
  if($("playerProfileAvatarPlaceholder")){
    $("playerProfileAvatarPlaceholder").style.display=profileAvatarId?"none":"flex";
  }
  if($("playerProfileAvatarName")){
    $("playerProfileAvatarName").textContent=profileAvatarId?playerAvatarName(profileAvatarId):"Aucun avatar";
  }
  if($("playerProfileAvatarBtn")){
    $("playerProfileAvatarBtn").textContent=profileAvatarId?"Modifier l’avatar":"Choisir un avatar";
    $("playerProfileAvatarBtn").disabled=!name;
  }
  if($("playerProfileAvatarDeleteBtn")){
    $("playerProfileAvatarDeleteBtn").style.display=profileAvatarId?"inline-flex":"none";
    $("playerProfileAvatarDeleteBtn").disabled=!profileAvatarId;
  }

  const nicknameInfo=playerNicknameInfo(name);
  if($("playerProfileNickname")){
    $("playerProfileNickname").innerHTML=nicknameInfo.primary
      ? `<strong>(${esc(nicknameInfo.primary)})</strong>`
      : "";
  }
  if($("playerProfileOtherNicknames")){
    $("playerProfileOtherNicknames").textContent=nicknameInfo.others.length
      ? `Autres surnoms historiques : ${nicknameInfo.others.join(" · ")}`
      : "";
  }

  $("playerProfileRank").textContent=s.rank?`#${s.rank}`:"#—";
  $("playerProfileMeta").textContent=
    `${s.gamesCount||rows.length} participation${(s.gamesCount||rows.length)>1?"s":""} · `+
    `${s.wins} victoire${s.wins>1?"s":""} · ${s.podiums} podium${s.podiums>1?"s":""} · `+
    `${s.kills} kill${s.kills>1?"s":""}`;

  const kpis=[
    ["Points",num(s.points,0)],
    ["Moy. pts",num(s.avgPoints,1)],
    ["Classement",s.rank?`#${s.rank}`:"—"],
    ["Victoires",s.wins],
    ["Podiums",s.podiums],
    ["Tabliers",s.tabliers],
    ["Kills",s.kills],
    ["Kills / partie",num(s.kpg,2)],
    ["Place moyenne",d.avgPlace?num(d.avgPlace,2):"—"],
    ["Solde",euro(s.net)],
    ["Taux victoire",num(s.winRate,1)+" %"],
    ["Taux podium",num(s.podiumRate,1)+" %"]
  ];
  $("playerProfileKpis").innerHTML=kpis
    .map(([l,v])=>`<div class="profile-kpi"><b>${esc(v)}</b><span>${esc(l)}</span></div>`)
    .join("");

  const feats=[
    ["Meilleure place",d.bestPlace?`${d.bestPlace}e`:"—"],
    ["Meilleure partie en kills",d.bestKillsGame?`${d.bestKillsGame.kills||0} kill${Number(d.bestKillsGame.kills||0)>1?"s":""} · ${formatGameReference(d.bestKillsGame)}`:"—"],
    ["Meilleur résultat financier",d.bestNetGame?`${euro(d.bestNetGame.net)} · ${formatGameReference(d.bestNetGame)}`:"—"],
    ["Série de victoires",`${d.winStreak} de suite`],
    ["Série de podiums",`${d.podiumStreak} de suite`],
    ["4e places",String(d.fourthPlaces)],
    ["Dernières places",String(d.lastPlaces)],
    ["Victime favorite",d.favoriteVictim?`${d.favoriteVictim[0]}${playerNicknameSecondary(d.favoriteVictim[0])?" "+playerNicknameSecondary(d.favoriteVictim[0]):""} · ${d.favoriteVictim[1]} fois`:"—"],
    ["Bourreau principal",d.nemesis?`${d.nemesis[0]}${playerNicknameSecondary(d.nemesis[0])?" "+playerNicknameSecondary(d.nemesis[0]):""} · ${d.nemesis[1]} fois`:"—"]
  ];
  $("playerProfileFeats").innerHTML=feats
    .map(([l,v])=>`<div class="profile-feat"><span>${esc(l)}</span><strong>${esc(v)}</strong></div>`)
    .join("");

  $("playerProfileAchievements").innerHTML=d.achievements.length
    ? d.achievements.map(a=>`<div class="profile-achievement ${a.dynamic?"dynamic":""}" title="${esc(a.desc)}"><span class="ico">${a.icon}</span><span>${esc(a.name)}</span></div>`).join("")
    : '<span class="profile-no-achievement">Aucun accomplissement débloqué pour le moment.</span>';

  $("playerProfilePlaces").innerHTML=rows
    .map(r=>`<span class="place-chip ${Number(r.place)===1?"win":Number(r.place)<=3?"podium":""}" title="Partie #${r.game}">${r.place}</span>`)
    .join("") || '<span class="muted">Aucune partie.</span>';

  if($("playerProfileRecentForm")){
    const recentRows=rows.slice().sort((a,b)=>Number(b.game)-Number(a.game)).slice(0,5);
    $("playerProfileRecentForm").innerHTML=recentRows.length
      ? recentRows.map(r=>`<div class="profile-form-card">
          <strong>${Number(r.place)===1?"🏆 "+r.place:r.place+"e"}</strong>
          <small>Partie #${r.game}</small>
          <small>${num(r.points||0,0)} pts</small>
        </div>`).join("")
      : '<span class="muted">Aucune partie.</span>';
  }


  if($("playerProfileRankChart")){
    const snaps=rankingSnapshotByGame();
    const vals=snaps.map(s=>({x:s.game,y:s.ranks[name]})).filter(v=>Number.isFinite(v.y));
    renderLineChart("playerProfileRankChart",[{name,values:vals}],{reverseY:true,label:`Évolution du classement de ${name}`});
  }

  if($("playerProfileMainRivalry")){
    const rival=d.nemesis?.[0] || d.favoriteVictim?.[0] || "";
    if(rival){
      const h=versusHeadToHead(name,rival);
      $("playerProfileMainRivalry").innerHTML=`
        <div class="muted">Adversaire le plus marquant</div>
        <div class="profile-rivalry-score">
          <div class="profile-rivalry-player">${playerNameHtml(name)}<strong>${h.elim2By1}</strong><small>éliminations</small></div>
          <div class="profile-rivalry-center">VS<br><small>${h.commonGames} partie${h.commonGames>1?"s":""} commune${h.commonGames>1?"s":""}</small></div>
          <div class="profile-rivalry-player">${playerNameHtml(rival)}<strong>${h.elim1By2}</strong><small>éliminations</small></div>
        </div>`;
    }else{
      $("playerProfileMainRivalry").innerHTML='<span class="muted">Pas encore assez de confrontations.</span>';
    }
  }

  renderPlayerRankHistory(name);
  renderPlayerSeasonBreakdown(name);

  const rivals={};
  for(const r of db.history||[]){
    if(r.player===name && r.killer)rivals[r.killer]=(rivals[r.killer]||0)-1;
    if(r.killer===name)rivals[r.player]=(rivals[r.player]||0)+1;
  }
  const rv=Object.entries(rivals).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,6);
  $("playerProfileRivals").innerHTML=rv.length
    ? rv.map(([n,v])=>`<div class="row" style="justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span>${playerNameHtml(n)}</span><b>${v>0?"+":""}${v}</b></div>`).join("")
    : '<span class="muted">Pas encore de confrontation directe.</span>';

  $("playerProfileHistory").innerHTML=
    `<table><thead><tr><th>Partie</th><th>Date</th><th>Lieu</th><th>Place</th><th>Pts</th><th>Kills</th><th>Éliminé par</th><th>Net</th></tr></thead><tbody>`+
    rows.slice().reverse().map(r=>`<tr><td>#${r.game}</td><td>${esc(shortDate(r.date))}</td><td>${esc(r.location||"")}</td><td>${r.place}</td><td>${num(r.points,0)}</td><td>${r.kills||0}</td><td>${r.killer?playerNameHtml(r.killer):"—"}</td><td>${euro(r.net)}</td></tr>`).join("")+
    `</tbody></table>`;

  renderVersus();
}

function openPlayerProfile(name){
  showView("profile");
  setTimeout(()=>renderProfile(name),0);
}

let lastGameSummaryRows=[];


function buildLiveBettingRecap(state){
  const betting=state?.betting;if(!betting)return {rows:[],stakeCents:50,totalStakedCents:0,totalGrossWonCents:0,totalNetCents:0};
  const stake=Math.max(1,Number(betting.stakeCents)||50),bets=betting.bets||{},odds=betting.odds||{};
  const winner=(state.players||[]).find(p=>Number(p.place)===1)?.name||state.winnerName||'';
  const first=(state.players||[]).filter(p=>Number(p.place)>0).sort((a,b)=>Number(b.place)-Number(a.place))[0]?.name||'';
  const rows=[];
  Object.entries(bets).forEach(([player,bet])=>{
    if(!bet?.confirmed)return;
    for(const type of ['winner','firstEliminated']){
      const pick=String(bet[type]||'').trim();if(!pick)continue;
      const odd=Number(odds?.[type]?.[pick])||1.05,actual=type==='winner'?winner:first,hit=pick===actual;
      const gross=hit?Math.round(stake*odd):0;
      rows.push({player,type,pick,actual,odds:odd,stakeCents:stake,grossWonCents:gross,netCents:gross-stake,hit});
    }
  });
  return {rows,stakeCents:stake,totalStakedCents:rows.length*stake,totalGrossWonCents:rows.reduce((s,r)=>s+r.grossWonCents,0),totalNetCents:rows.reduce((s,r)=>s+r.netCents,0)};
}

function buildFinishedRecap(state){
  return {
    bountyMode:state.bountyMode||'common',bountyName:state.mysteryBountyRevealed?state.mysteryBountyName||'':'',bountyHunter:state.mysteryBountyHunter||'',
    bountySurvived:state.mysteryBountyEvent?.kind==='winner',
    missions:(state.personalBounties||[]).filter(c=>c.status==='completed').map(c=>({name:c.hunter,title:c.title||'Cible secrète',text:c.text||'Éliminer '+c.target+' vous-même.',icon:c.icon||'🎯'})),
    objectives:(state.preGameBriefing||[]).filter(e=>e.completed).map(e=>({name:e.name,title:e.title,text:e.resultText||e.text,icon:e.icon||'⭐'})),
    highlights:(state.liveAlerts||[]).filter(e=>/RECORD|ACCOMPLISSEMENT/.test(e.title||'')).map(e=>({title:e.title,text:e.text,icon:e.icon||'🏆'})),
    betting:buildLiveBettingRecap(state)
  };
}
const finishedSummaryShown=new Set();
let finishedSummaryQueue=null,finishedSummaryTimer=null;
function queueFinishedGameSummary(rows,state){
  if(!rows?.length||!state?.finishedAt)return;
  const key=String(state.sessionId||state.finishedAt);
  if(finishedSummaryShown.has(key))return;
  try{if(sessionStorage.getItem('bpt:recap:'+key)==='1')return;}catch(_){}
  if(finishedSummaryQueue?.key===key)return;
  const events=window.bptGetLiveCelebrations?.(state)||[];
  finishedSummaryQueue={key,rows:clone(rows),events,seenAt:new Map()};
  if(!finishedSummaryTimer)finishedSummaryTimer=setInterval(pumpFinishedSummary,250);
  pumpFinishedSummary();
}
function pumpFinishedSummary(){
  const q=finishedSummaryQueue;if(!q)return;
  let box=$('bptFinishedQueue');
  if(!box){box=document.createElement('div');box.id='bptFinishedQueue';box.className='bpt-bounty-overlay';box.innerHTML='<section class="bpt-bounty-card" role="dialog" aria-modal="true" tabindex="-1"><div class="bpt-bounty-icon"></div><h2></h2><div class="bpt-bounty-name"></div><p></p><strong></strong><button type="button">Continuer</button></section>';}
  const mount=document.fullscreenElement||document.body;if(box.parentElement!==mount)mount.appendChild(box);
  const event=q.events.find(e=>{if(e.dismissed)return false;try{return sessionStorage.getItem('bpt:bounty:'+e.id)!=='1'}catch(_){return !e.dismissed}});
  if(!event){
    box.hidden=true;finishedSummaryQueue=null;clearInterval(finishedSummaryTimer);finishedSummaryTimer=null;
    finishedSummaryShown.add(q.key);
    try{sessionStorage.setItem('bpt:recap:'+q.key,'1')}catch(_){}
    showEndGameSummary(q.rows);return;
  }
  if(!q.seenAt.has(event.id))q.seenAt.set(event.id,Date.now());
  const first=box.hidden||box.dataset.event!==event.id;box.hidden=false;box.dataset.event=event.id;box.dataset.kind=event.kind;
  const card=box.querySelector('section');card.setAttribute('aria-label',event.label||event.title||'Réussite');
  box.querySelector('.bpt-bounty-icon').textContent=event.icon||'🏆';box.querySelector('h2').textContent=event.label||event.title||'';
  box.querySelector('.bpt-bounty-name').textContent=event.name||'';box.querySelector('p').textContent=event.text||'';box.querySelector('strong').textContent=event.extra||'';
  const button=box.querySelector('button'),remain=Math.max(0,Math.ceil((8000-(Date.now()-q.seenAt.get(event.id)))/1000));
  button.disabled=remain>0;button.textContent=remain?'Continuer ('+remain+' s)':'Continuer';
  button.onclick=()=>{if(button.disabled)return;event.dismissed=true;for(const id of [event.id,...(event.relatedIds||[])]){try{sessionStorage.setItem('bpt:bounty:'+id,'1')}catch(_){}}pumpFinishedSummary()};
  if(first)card.focus({preventScroll:true});
}
function queuePublishedLiveSummary(state){
  // Les accomplissements et bountys sont affichés uniquement pendant le Live.
  // Ils ne doivent pas être rejoués à l’ouverture de l’application.
  return;
  const rows=(db.history||[]).filter(r=>Number(r.gameStartedAt)>0&&Number(r.gameStartedAt)===Number(state.startedAt));
  if(rows.length)queueFinishedGameSummary(rows,state);
}
function finishedRecapSections(rows){
  const rawRecap=rows.find(r=>r.endGameRecap)?.endGameRecap;
  // 10.4.26 : les bilans enregistrés par d'anciennes versions n'ont pas toutes les listes.
  const recap=rawRecap?{...rawRecap,missions:rawRecap.missions||[],objectives:rawRecap.objectives||[],highlights:rawRecap.highlights||[]}:null;
  const kills=Math.max(0,...rows.map(r=>Number(r.kills)||0)),hunters=rows.filter(r=>Number(r.kills)===kills).map(r=>r.player);
  const count=rows.filter(r=>r.killer).length,duration=bptGameTiming(rows).durationSec;
  const items=(list)=>list.map(e=>'<article><strong>'+esc((e.icon||'⭐')+' '+(e.name?e.name+' · ':'')+e.title)+'</strong><p>'+esc(e.text||'')+'</p></article>').join('');
  let h='<section class="bpt-recap-stats"><div><span>Participants</span><strong>'+rows.length+'</strong></div><div><span>Durée réelle</span><strong>'+esc(duration?formatGameDuration(duration):'Non renseignée')+'</strong></div><div><span>Éliminations</span><strong>'+count+'</strong></div></section>';
  h+='<section class="bpt-recap-section"><h3>🔥 '+(hunters.length>1?'Meilleurs chasseurs':'Meilleur chasseur')+'</h3><p>'+esc(kills?hunters.join(' · ')+' — '+kills+' élimination'+(kills>1?'s':''):'Aucune élimination enregistrée.')+'</p></section>';
  if(!recap)return h+'<p class="muted">Le détail des missions et enjeux est conservé pour les parties terminées avec cette version.</p>';
  h+='<section class="bpt-recap-section"><h3>🎯 '+(recap.bountyMode==='individual'?'Bountys individuels':'Bounty commun')+'</h3>';
  if(recap.bountyMode==='individual')h+=recap.missions.length?items(recap.missions):'<p>Aucun bounty individuel réussi.</p>';
  else h+='<p>'+esc(recap.bountyName?(recap.bountySurvived?recap.bountyName+' était la cible secrète et a remporté la partie.':recap.bountyHunter+' remporte le bounty en éliminant '+recap.bountyName+'.'):'Aucun bounty révélé.')+'</p>';
  h+='</section><section class="bpt-recap-section"><h3>⭐ Enjeux réalisés</h3>'+(recap.objectives.length?items(recap.objectives):'<p>Aucun enjeu réalisé.</p>')+'</section>';
  if(recap.betting?.rows?.length){
    const betLabel=t=>t==='winner'?'Vainqueur':'1er éliminé';
    h+='<section class="bpt-recap-section"><h3>🎲 Résultats des paris</h3><div class="bpt-recap-bets-table"><div class="bpt-recap-bets-row head"><b>Joueur</b><b>Pari</b><b>Choix</b><b>Résultat</b><b>Solde</b></div>'+recap.betting.rows.map(b=>`<div class="bpt-recap-bets-row"><strong>${esc(b.player)}</strong><span>${betLabel(b.type)}</span><span>${esc(b.pick)}</span><span class="${b.hit?'is-hit':'is-miss'}">${b.hit?'✓ Réussi':'✕ Perdu'}</span><b class="${b.netCents>=0?'is-hit':'is-miss'}">${b.netCents>=0?'+':''}${euro(b.netCents/100)}</b></div>`).join('')+'</div><p class="bpt-recap-bets-total">Mises : '+euro(recap.betting.totalStakedCents/100)+' · Gains : '+euro(recap.betting.totalGrossWonCents/100)+' · Solde de la partie : '+(recap.betting.totalNetCents>=0?'+':'')+euro(recap.betting.totalNetCents/100)+'</p></section>';
  }
  if(recap.highlights.length)h+='<section class="bpt-recap-section"><h3>🏅 Records et accomplissements</h3>'+items(recap.highlights)+'</section>';
  return h;
}

function showEndGameSummary(rows){
  const backdrop=$("gameSummaryBackdrop"),content=$("gameSummaryContent");
  if(!backdrop||!content||!Array.isArray(rows)||!rows.length)return;
  lastGameSummaryRows=clone(rows);
  const sorted=rows.slice().sort((a,b)=>Number(a.place)-Number(b.place));
  const first=sorted[0];

  content.innerHTML=`
    <div class="muted" style="margin-top:6px">Partie #${first.game} · ${esc(shortDate(first.date))}${first.location?" · "+esc(first.location):""} · ${sorted.length} joueurs${bptGameTiming(sorted).durationSec?" · "+esc(formatGameDuration(bptGameTiming(sorted).durationSec)):""}</div>

    <div class="summary-podium">
      ${sorted.slice(0,3).map((r,i)=>`<div class="summary-place">
        <b>${esc(r.player)}</b>
        <div class="podium-nickname">${playerNicknameInfo(r.player).primary?`(${esc(playerNicknameInfo(r.player).primary)})`:""}</div>
        <div class="big">${medalForRank(i+1)}</div>
        <div>${num(r.points,0)} pts · ${euro(r.gross)}</div>
        <div class="muted">${r.kills||0} kill${Number(r.kills||0)>1?"s":""}</div>
      </div>`).join("")}
    </div>

    ${finishedRecapSections(sorted)}
    <h3 style="margin-top:18px">Classement complet</h3>
    <div class="tablewrap">
      <table class="summary-table">
        <thead>
          <tr>
            <th>Place</th>
            <th>Joueur</th>
            <th>Points</th>
            <th>Kills</th>
            <th>Éliminé par</th>
            <th>Niveau</th>
            <th>Temps de jeu</th>
            <th>Gain</th>
            <th>Net</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map(r=>`<tr>
            <td>${r.place}</td>
            <td>${playerNameHtml(r.player)}</td>
            <td>${num(r.points,0)}</td>
            <td>${r.kills||0}</td>
            <td>${Number(r.place)===1?"🏆 Vainqueur":(r.killer?playerNameHtml(r.killer):"—")}</td>
            <td>${r.outLevel?`N${Number(r.outLevel)}`:"—"}</td>
            <td>${esc(playTimeDisplay(r, rows))}</td>
            <td>${euro(r.gross)}</td>
            <td>${euro(r.net)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
  const mount=document.fullscreenElement||document.body;if(backdrop.parentElement!==mount)mount.appendChild(backdrop);
  backdrop.style.display="flex";
}

function openLastGameFromSummary(){
  const backdrop=$("gameSummaryBackdrop");
  if(backdrop)backdrop.style.display="none";
  showView("latestgame");
}

function renderHistoryCards(){
  const holder=$("historyCards");if(!holder)return;
  const games=groupedGames().slice().reverse();
  holder.innerHTML=games.map(([g,rows])=>{
    const sorted=rows.slice().sort((a,b)=>Number(a.place)-Number(b.place));
    const f=sorted[0]||{},win=sorted.find(r=>Number(r.place)===1);
    return `<details class="history-game" data-game="${esc(g)}">
      <summary>
        <div class="history-game-title">${esc(gameDisplayTitle(f,g))}</div>
        <div><div>${esc(shortDate(f.date||""))}${f.location?" · "+esc(f.location):""} · ${rows.length} joueurs</div><div class="history-game-meta">Cagnotte ${euro(rows.length*Number(f.stake||0))}${bptGameTiming(rows).durationSec?" · "+esc(formatGameDuration(bptGameTiming(rows).durationSec)):""}</div></div>
        <div class="history-winner">🏆 ${win?playerNameHtml(win.player):"—"} <span>· ${num(win?.points||0,0)} pts</span></div>
      </summary>
      <div class="history-game-body"><div class="tablewrap"><table><thead><tr><th>Place</th><th>Joueur</th><th>Pts</th><th>Kills</th><th>Éliminé par</th><th>Temps de jeu</th><th>Gain</th><th>Net</th></tr></thead><tbody>
        ${sorted.map(r=>`<tr><td>${r.place}</td><td>${playerNameHtml(r.player,{button:true,onclick:`openPlayerProfile(decodeURIComponent('${encodeURIComponent(r.player)}'))`})}</td><td>${num(r.points,0)}</td><td>${r.kills||0}</td><td>${Number(r.place)===1?"🏆":(r.killer?playerNameHtml(r.killer):"—")}</td><td>${esc(playTimeDisplay(r, rows))}</td><td>${euro(r.gross)}</td><td>${euro(r.net)}</td></tr>`).join("")}
      </tbody></table></div></div>
    </details>`;
  }).join("");
}


















// Sortir un joueur reste disponible indépendamment de la pause/reprise du chrono.



function achievementPlayers(rowsOverride=null){
  const rows=Array.isArray(rowsOverride)?rowsOverride:(Array.isArray(db.history)?db.history:[]);
  const ranked=ranking();
  const names=[...new Set(rows.map(r=>String(r.player||"")).filter(Boolean))];

  const byPlayer={};
  for(const name of names){
    const pr=rows.filter(r=>r.player===name).sort((a,b)=>Number(a.game)-Number(b.game));
    const wins=pr.filter(r=>Number(r.place)===1).length;
    const podiums=pr.filter(r=>Number(r.place)<=3).length;
    const lastPlaces=pr.filter(r=>Number(r.n)>0 && Number(r.place)===Number(r.n)).length;
    const net=pr.reduce((s,r)=>s+Number(r.net||0),0);
    const maxKills=pr.reduce((m,r)=>Math.max(m,Number(r.kills||0)),0);
    const tabliers=pr.filter(r=>r.tablier || (Number(r.place)===1 && Number(r.n)>=10)).length;
    const participationCount=new Set(pr.map(r=>Number(r.game))).size;
    const bountyHunts=pr.filter(r=>r.bountyHunter===true).length;

    let winStreak=0,curWin=0;
    for(const r of pr){
      if(Number(r.place)===1){curWin++;winStreak=Math.max(winStreak,curWin);}
      else curWin=0;
    }

    let strike=false;
    for(const r of pr){
      const n=Number(r.n)||0;
      if(n>=2 && Number(r.kills||0)===n-1){
        strike=true;
        break;
      }
    }

    const sameVictim={};
    for(const r of rows){
      if(r.killer===name && r.player){
        sameVictim[r.player]=(sameVictim[r.player]||0)+1;
      }
    }
    const maxSameVictim=Math.max(0,...Object.values(sameVictim));

    byPlayer[name]={
      wins,podiums,lastPlaces,net,maxKills,tabliers,participationCount,bountyHunts,
      winStreak,strike,maxSameVictim
    };
  }

  const achievementDefs=[
    {icon:"🏆",name:"Première victoire",desc:"Remporter au moins 1 partie.",test:s=>s.wins>=1},
    {icon:"👑",name:"Patron de la table",desc:"Atteindre 5 victoires.",test:s=>s.wins>=5},
    {icon:"💰",name:"Dans le vert",desc:"Atteindre un solde net cumulé d’au moins +30 €.",test:s=>s.net>=30},
    {icon:"💎",name:"High Roller BPT",desc:"Atteindre un solde net cumulé d’au moins +100 €.",test:s=>s.net>=100},
    {icon:"🐢",name:"Dernier de la classe",desc:"Terminer dernier au moins une fois.",test:s=>s.lastPlaces>=1},
    {icon:"🥄",name:"Cuillère de bois",desc:"Terminer dernier au moins 3 fois.",test:s=>s.lastPlaces>=3},
    {icon:"💥",name:"Premier sang",desc:"Réaliser au moins 1 kill dans une même partie.",test:s=>s.maxKills>=1},
    {icon:"🔫",name:"Serial Killer",desc:"Réaliser au moins 3 kills dans une même partie.",test:s=>s.maxKills>=3},
    {icon:"☠️",name:"Massacre",desc:"Réaliser au moins 5 kills dans une même partie.",test:s=>s.maxKills>=5},
    {icon:"🎳",name:"Strike",desc:"Éliminer personnellement tous les autres joueurs d’une même partie.",test:s=>s.strike},
    {icon:"🧥",name:"Tablier",desc:"Gagner une partie avec au moins 10 joueurs.",test:s=>s.tabliers>=1},
    {icon:"🧥",name:"Collectionneur de tabliers",desc:"Obtenir au moins 3 tabliers.",test:s=>s.tabliers>=3},
    {icon:"🥉",name:"Premier podium",desc:"Terminer dans le Top 3 au moins une fois.",test:s=>s.podiums>=1},
    {icon:"🏅",name:"Habitué du podium",desc:"Atteindre 5 podiums.",test:s=>s.podiums>=5},
    {icon:"🚂",name:"Invincible",desc:"Gagner 2 participations consécutives.",test:s=>s.winStreak>=2},
    {icon:"⚡",name:"Hat-trick",desc:"Gagner 3 participations consécutives.",test:s=>s.winStreak>=3},
    {icon:"🎯",name:"Bourreau",desc:"Éliminer le même adversaire au moins 3 fois.",test:s=>s.maxSameVictim>=3},
    {icon:"🎯",name:"Chasseur de prime",desc:"Éliminer le bounty mystère d’une partie.",test:s=>s.bountyHunts>=1},
    {icon:"🎟",name:"Fidèle",desc:"Participer à au moins 10 parties.",test:s=>s.participationCount>=10},
    {icon:"🏁",name:"Marathonien",desc:"Participer à au moins 20 parties.",test:s=>s.participationCount>=20}
  ];

  // Badge dynamique On Fire : meilleur total de points sur les 3 dernières parties.
  const gameNos=[...new Set(rows.map(r=>Number(r.game)).filter(Number.isFinite))].sort((a,b)=>a-b);
  const last3=gameNos.slice(-3);
  let onFireNames=[];
  if(last3.length){
    const totals={};
    for(const r of rows){
      if(last3.includes(Number(r.game))){
        totals[r.player]=(totals[r.player]||0)+Number(r.points||0);
      }
    }
    const maxPts=Math.max(...Object.values(totals),-Infinity);
    if(Number.isFinite(maxPts))onFireNames=Object.entries(totals).filter(([,v])=>v===maxPts).map(([n])=>n);
  }

  const result=achievementDefs.map(a=>({
    ...a,
    players:names.filter(n=>a.test(byPlayer[n]))
  }));

  result.push({
    icon:"🔥",
    name:"On Fire",
    desc:"Meilleur total de points cumulés sur les 3 dernières parties.",
    players:onFireNames,
    dynamic:true
  });

  // Badges temps : uniquement sur les parties qui ont un temps relatif fiable.
  const byGameForTiming={};
  rows.forEach(r=>{
    const g=Number(r.game||0);
    if(!byGameForTiming[g])byGameForTiming[g]=[];
    byGameForTiming[g].push(r);
  });

  const timedElims=rows
    .filter(r=>Number(r.place)>1)
    .map(r=>({
      ...r,
      _elapsedForStats:bestElapsedForRow(r, byGameForTiming[Number(r.game||0)]||[])
    }))
    .filter(r=>Number(r._elapsedForStats)>0);

  const timedByPlayer={};
  for(const r of timedElims){
    if(!timedByPlayer[r.player])timedByPlayer[r.player]=[];
    timedByPlayer[r.player].push(Number(r._elapsedForStats));
  }

  let sprinterNames=[];
  const averages=Object.entries(timedByPlayer).map(([name,times])=>({
    name,
    avg:times.reduce((s,v)=>s+v,0)/times.length,
    count:times.length
  }));
  if(averages.length){
    const bestAvg=Math.min(...averages.map(x=>x.avg));
    sprinterNames=averages.filter(x=>Math.abs(x.avg-bestAvg)<1).map(x=>x.name);
  }

  let prematureNames=[];
  let prematureRecordSec=0;
  if(timedElims.length){
    prematureRecordSec=Math.min(...timedElims.map(r=>Number(r._elapsedForStats)));
    prematureNames=[...new Set(
      timedElims
        .filter(r=>Number(r._elapsedForStats)===prematureRecordSec)
        .map(r=>r.player)
    )];
  }

  result.push({
    icon:"🏃",
    name:"Sprinter",
    desc:sprinterNames.length
      ? `Élimination la plus précoce en moyenne (${formatElapsedElimination(Math.min(...averages.map(x=>x.avg)))}).`
      : "Élimination la plus précoce en moyenne.",
    players:sprinterNames,
    dynamic:true
  });

  result.push({
    icon:"💨",
    name:"Éjaculateur précoce",
    desc:prematureRecordSec
      ? `Record de la saison : élimination après seulement ${formatElapsedElimination(prematureRecordSec)} de jeu.`
      : "Record de la saison pour l’élimination la plus rapide.",
    players:prematureNames,
    dynamic:true
  });

  return result;
}


function latestGameUnlockedAchievements(){
  const history=Array.isArray(db.history)?db.history:[];
  if(!history.length)return [];

  const latestGame=Math.max(
    ...history.map(r=>Number(r.game)).filter(g=>Number.isFinite(g)&&g>0)
  );
  if(!Number.isFinite(latestGame))return [];

  const latestRows=history.filter(r=>Number(r.game)===latestGame);
  const previousRows=history.filter(r=>Number(r.game)!==latestGame);

  const before=achievementPlayers(previousRows);
  const after=achievementPlayers(history);
  const beforeMap=new Map(before.map(a=>[a.name,new Set(a.players)]));
  const latestPlayers=new Set(latestRows.map(r=>String(r.player||"")).filter(Boolean));

  const unlocked=[];

  for(const a of after){
    if(a.dynamic)continue;
    const prev=beforeMap.get(a.name)||new Set();
    const players=a.players.filter(player=>latestPlayers.has(player) && !prev.has(player));

    if(players.length){
      unlocked.push({
        icon:a.icon,
        name:a.name,
        desc:a.desc,
        players,
        game:latestGame
      });
    }
  }

  return unlocked;
}

let achievementsMineOnly=false;
function renderAchievements(){
  updateRecordsScopeSelector();
  const holder=$("achievementsGrid");
  if(!holder)return;

  const items=achievementPlayers();
  const unlocked=items.filter(a=>a.players.length>0).length;
  if($("achievementUnlockedCount"))$("achievementUnlockedCount").textContent=String(unlocked);

  // 10.4.45 — Débloqués en tuiles (le joueur connecté mis en évidence), verrouillés regroupés et repliés.
  const norm=v=>String(v||"").trim().toLocaleLowerCase("fr");
  let me="";try{me=String(window.BPTLive3?.getVerifiedIdentityName?.()||"").trim();}catch(_e){}
  const mine=a=>!!me&&a.players.some(n=>norm(n)===norm(me));
  const open=items.filter(a=>a.players.length>0);
  const shown=achievementsMineOnly&&me?open.filter(mine):open;
  const locked=items.filter(a=>!a.players.length);
  const chip=n=>`<button type="button" class="ach-chip${norm(n)===norm(me)?" is-me":""}" data-player="${encodeURIComponent(n)}">${esc(n)}</button>`;
  holder.innerHTML=`
    ${me?`<div class="ach-filter"><button type="button" class="ach-filter-btn${achievementsMineOnly?"":" is-on"}" data-ach-filter="all">Tous (${open.length})</button><button type="button" class="ach-filter-btn${achievementsMineOnly?" is-on":""}" data-ach-filter="mine">⭐ Les miens (${open.filter(mine).length})</button></div>`:""}
    <div class="ach-grid">${shown.map(a=>`<div class="ach-tile${mine(a)?" is-mine":""}">
      <div class="ach-head"><span class="ach-ico">${a.icon}</span><div><strong>${esc(a.name)}</strong><small>${esc(a.desc)}</small></div><span class="ach-count">${a.players.length}</span></div>
      <div class="ach-chips">${a.players.map(chip).join("")}</div>
    </div>`).join("")||'<div class="muted">Aucun accomplissement pour le moment.</div>'}</div>
    ${locked.length?`<details class="ach-locked"><summary>🔒 ${locked.length} à débloquer</summary><div class="ach-locked-list">${locked.map(a=>`<div class="ach-locked-row"><span class="ach-ico">${a.icon}</span><div><strong>${esc(a.name)}</strong><small>${esc(a.desc)}</small></div></div>`).join("")}</div></details>`:""}`;
  holder.onclick=e=>{
    const f=e.target.closest("[data-ach-filter]");
    if(f){achievementsMineOnly=f.dataset.achFilter==="mine";renderAchievements();return;}
    const c=e.target.closest(".ach-chip[data-player]");
    if(c)openPlayerProfile(decodeURIComponent(c.dataset.player));
  };
}


const CURRENT_SEASON_KEY="2026-2027";
const ARCHIVE_2020_2021=[{"game":1,"date":"2020-09-04","location":"Historique BPT","player":"Thierry MONNIAUX","place":1,"killer":"","tablier":false,"n":16,"points":41.0,"stake":5,"gross":50,"net":45,"kills":0,"win":true,"podium":true},{"game":1,"date":"2020-09-04","location":"Historique BPT","player":"Olivier HENGUELLE","place":2,"killer":"","tablier":false,"n":16,"points":35.0,"stake":5,"gross":25,"net":20,"kills":0,"win":false,"podium":true},{"game":1,"date":"2020-09-04","location":"Historique BPT","player":"Jérôme BERA","place":3,"killer":"","tablier":false,"n":16,"points":30.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":1,"date":"2020-09-04","location":"Historique BPT","player":"Anne BERA","place":4,"killer":"","tablier":false,"n":16,"points":26.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2020-09-04","location":"Historique BPT","player":"Jérôme RIFFE","place":5,"killer":"","tablier":false,"n":16,"points":23.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2020-09-04","location":"Historique BPT","player":"Jérémie CARPENTIER","place":6,"killer":"","tablier":false,"n":16,"points":20.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2020-09-04","location":"Historique BPT","player":"Mehdi BRAHIMI","place":7,"killer":"","tablier":false,"n":16,"points":17.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2020-09-04","location":"Historique BPT","player":"Alexis Volant","place":8,"killer":"","tablier":false,"n":16,"points":14.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2020-09-04","location":"Historique BPT","player":"FRANCK CHATARD","place":9,"killer":"","tablier":false,"n":16,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2020-09-04","location":"Historique BPT","player":"Philippe DUBOIS","place":10,"killer":"","tablier":false,"n":16,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2020-09-04","location":"Historique BPT","player":"Solène BALLOIS","place":11,"killer":"","tablier":false,"n":16,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2020-09-04","location":"Historique BPT","player":"Jérôme BINOT","place":12,"killer":"","tablier":false,"n":16,"points":6.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2020-09-04","location":"Historique BPT","player":"Stéphane LEFIN","place":13,"killer":"","tablier":false,"n":16,"points":4.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2020-09-04","location":"Historique BPT","player":"Jérémy COQUEL","place":14,"killer":"","tablier":false,"n":16,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2020-09-04","location":"Historique BPT","player":"Areski AIT GHERBI","place":15,"killer":"","tablier":false,"n":16,"points":2.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2020-09-04","location":"Historique BPT","player":"François CATTEAU","place":16,"killer":"","tablier":false,"n":16,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2020-09-15","location":"Historique BPT","player":"Grégoire DUFORET","place":1,"killer":"","tablier":false,"n":11,"points":34.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":2,"date":"2020-09-15","location":"Historique BPT","player":"Olivier HENGUELLE","place":2,"killer":"","tablier":false,"n":11,"points":28.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":2,"date":"2020-09-15","location":"Historique BPT","player":"Jérôme BERA","place":3,"killer":"","tablier":false,"n":11,"points":23.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":2,"date":"2020-09-15","location":"Historique BPT","player":"Thierry MONNIAUX","place":4,"killer":"","tablier":false,"n":11,"points":19.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2020-09-15","location":"Historique BPT","player":"François CATTEAU","place":5,"killer":"","tablier":false,"n":11,"points":16.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2020-09-15","location":"Historique BPT","player":"FRANCK CHATARD","place":6,"killer":"","tablier":false,"n":11,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2020-09-15","location":"Historique BPT","player":"Stéphane LEFIN","place":7,"killer":"","tablier":false,"n":11,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2020-09-15","location":"Historique BPT","player":"Solène BALLOIS","place":8,"killer":"","tablier":false,"n":11,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2020-09-15","location":"Historique BPT","player":"Areski AIT GHERBI","place":9,"killer":"","tablier":false,"n":11,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2020-09-15","location":"Historique BPT","player":"Jérémy COQUEL","place":10,"killer":"","tablier":false,"n":11,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2020-09-15","location":"Historique BPT","player":"Alexis Volant","place":11,"killer":"","tablier":false,"n":11,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2020-09-25","location":"Historique BPT","player":"Olivier HENGUELLE","place":1,"killer":"","tablier":false,"n":10,"points":32.0,"stake":5,"gross":30,"net":25,"kills":0,"win":true,"podium":true},{"game":3,"date":"2020-09-25","location":"Historique BPT","player":"FRANCK CHATARD","place":2,"killer":"","tablier":false,"n":10,"points":26.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":3,"date":"2020-09-25","location":"Historique BPT","player":"Mehdi BRAHIMI","place":3,"killer":"","tablier":false,"n":10,"points":21.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":3,"date":"2020-09-25","location":"Historique BPT","player":"Jérôme BERA","place":4,"killer":"","tablier":false,"n":10,"points":17.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2020-09-25","location":"Historique BPT","player":"Alexis Volant","place":5,"killer":"","tablier":false,"n":10,"points":14.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2020-09-25","location":"Historique BPT","player":"Grégoire DUFORET","place":6,"killer":"","tablier":false,"n":10,"points":11.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2020-09-25","location":"Historique BPT","player":"Philippe DUBOIS","place":7,"killer":"","tablier":false,"n":10,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2020-09-25","location":"Historique BPT","player":"Jérémy COQUEL","place":8,"killer":"","tablier":false,"n":10,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2020-09-25","location":"Historique BPT","player":"François CATTEAU","place":9,"killer":"","tablier":false,"n":10,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2020-09-25","location":"Historique BPT","player":"Solène BALLOIS","place":10,"killer":"","tablier":false,"n":10,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2020-09-27","location":"Historique BPT","player":"FRANCK CHATARD","place":1,"killer":"","tablier":false,"n":9,"points":27.0,"stake":5,"gross":25,"net":20,"kills":0,"win":true,"podium":true},{"game":4,"date":"2020-09-27","location":"Historique BPT","player":"Jérôme BERA","place":2,"killer":"","tablier":false,"n":9,"points":22.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":4,"date":"2020-09-27","location":"Historique BPT","player":"Jérémy COQUEL","place":3,"killer":"","tablier":false,"n":9,"points":17.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":4,"date":"2020-09-27","location":"Historique BPT","player":"Stéphane LEFIN","place":4,"killer":"","tablier":false,"n":9,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2020-09-27","location":"Historique BPT","player":"Alexis Volant","place":5,"killer":"","tablier":false,"n":9,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2020-09-27","location":"Historique BPT","player":"Areski AIT GHERBI","place":6,"killer":"","tablier":false,"n":9,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2020-09-27","location":"Historique BPT","player":"Olivier HENGUELLE","place":7,"killer":"","tablier":false,"n":9,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2020-09-27","location":"Historique BPT","player":"François CATTEAU","place":8,"killer":"","tablier":false,"n":9,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2020-09-27","location":"Historique BPT","player":"Grégoire DUFORET","place":9,"killer":"","tablier":false,"n":9,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":5,"date":"2020-10-02","location":"Historique BPT","player":"Olivier HENGUELLE","place":1,"killer":"","tablier":false,"n":12,"points":36.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":5,"date":"2020-10-02","location":"Historique BPT","player":"Mehdi BRAHIMI","place":2,"killer":"","tablier":false,"n":12,"points":30.0,"stake":5,"gross":20,"net":15,"kills":0,"win":false,"podium":true},{"game":5,"date":"2020-10-02","location":"Historique BPT","player":"Jérôme BINOT","place":3,"killer":"","tablier":false,"n":12,"points":25.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":5,"date":"2020-10-02","location":"Historique BPT","player":"François CATTEAU","place":4,"killer":"","tablier":false,"n":12,"points":21.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":5,"date":"2020-10-02","location":"Historique BPT","player":"Stéphane LEFIN","place":5,"killer":"","tablier":false,"n":12,"points":18.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":5,"date":"2020-10-02","location":"Historique BPT","player":"Jérôme RIFFE","place":6,"killer":"","tablier":false,"n":12,"points":15.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":5,"date":"2020-10-02","location":"Historique BPT","player":"Grégoire DUFORET","place":7,"killer":"","tablier":false,"n":12,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":5,"date":"2020-10-02","location":"Historique BPT","player":"Philippe DUBOIS","place":8,"killer":"","tablier":false,"n":12,"points":9.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":5,"date":"2020-10-02","location":"Historique BPT","player":"Alexis Volant","place":9,"killer":"","tablier":false,"n":12,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":5,"date":"2020-10-02","location":"Historique BPT","player":"FRANCK CHATARD","place":10,"killer":"","tablier":false,"n":12,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":5,"date":"2020-10-02","location":"Historique BPT","player":"Jérémy COQUEL","place":11,"killer":"","tablier":false,"n":12,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":5,"date":"2020-10-02","location":"Historique BPT","player":"Areski AIT GHERBI","place":12,"killer":"","tablier":false,"n":12,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":6,"date":"2020-10-04","location":"Historique BPT","player":"Jérôme BERA","place":1,"killer":"","tablier":false,"n":8,"points":23.0,"stake":5,"gross":25,"net":20,"kills":0,"win":true,"podium":true},{"game":6,"date":"2020-10-04","location":"Historique BPT","player":"Stéphane LEFIN","place":2,"killer":"","tablier":false,"n":8,"points":18.0,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":6,"date":"2020-10-04","location":"Historique BPT","player":"Grégoire DUFORET","place":3,"killer":"","tablier":false,"n":8,"points":14.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":6,"date":"2020-10-04","location":"Historique BPT","player":"Jérôme RIFFE","place":4,"killer":"","tablier":false,"n":8,"points":11.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":6,"date":"2020-10-04","location":"Historique BPT","player":"FRANCK CHATARD","place":5,"killer":"","tablier":false,"n":8,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":6,"date":"2020-10-04","location":"Historique BPT","player":"Alexis Volant","place":6,"killer":"","tablier":false,"n":8,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":6,"date":"2020-10-04","location":"Historique BPT","player":"Olivier HENGUELLE","place":7,"killer":"","tablier":false,"n":8,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":6,"date":"2020-10-04","location":"Historique BPT","player":"Areski AIT GHERBI","place":8,"killer":"","tablier":false,"n":8,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":7,"date":"2020-10-09","location":"Historique BPT","player":"Jérôme BERA","place":1,"killer":"","tablier":false,"n":9,"points":27.0,"stake":5,"gross":25,"net":20,"kills":0,"win":true,"podium":true},{"game":7,"date":"2020-10-09","location":"Historique BPT","player":"Clément MARAVAL","place":2,"killer":"","tablier":false,"n":9,"points":22.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":7,"date":"2020-10-09","location":"Historique BPT","player":"FRANCK CHATARD","place":3,"killer":"","tablier":false,"n":9,"points":17.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":7,"date":"2020-10-09","location":"Historique BPT","player":"Philippe DUBOIS","place":4,"killer":"","tablier":false,"n":9,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":7,"date":"2020-10-09","location":"Historique BPT","player":"Olivier HENGUELLE","place":5,"killer":"","tablier":false,"n":9,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":7,"date":"2020-10-09","location":"Historique BPT","player":"Alexis Volant","place":6,"killer":"","tablier":false,"n":9,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":7,"date":"2020-10-09","location":"Historique BPT","player":"Stéphane LEFIN","place":7,"killer":"","tablier":false,"n":9,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":7,"date":"2020-10-09","location":"Historique BPT","player":"Jérôme RIFFE","place":8,"killer":"","tablier":false,"n":9,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":7,"date":"2020-10-09","location":"Historique BPT","player":"Grégoire DUFORET","place":9,"killer":"","tablier":false,"n":9,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":8,"date":"2020-10-11","location":"Historique BPT","player":"FRANCK CHATARD","place":1,"killer":"","tablier":false,"n":11,"points":34.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":8,"date":"2020-10-11","location":"Historique BPT","player":"Alexis Volant","place":2,"killer":"","tablier":false,"n":11,"points":28.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":8,"date":"2020-10-11","location":"Historique BPT","player":"Stéphane LEFIN","place":3,"killer":"","tablier":false,"n":11,"points":23.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":8,"date":"2020-10-11","location":"Historique BPT","player":"Areski AIT GHERBI","place":4,"killer":"","tablier":false,"n":11,"points":19.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":8,"date":"2020-10-11","location":"Historique BPT","player":"Thierry MONNIAUX","place":5,"killer":"","tablier":false,"n":11,"points":16.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":8,"date":"2020-10-11","location":"Historique BPT","player":"Grégoire DUFORET","place":6,"killer":"","tablier":false,"n":11,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":8,"date":"2020-10-11","location":"Historique BPT","player":"François CATTEAU","place":7,"killer":"","tablier":false,"n":11,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":8,"date":"2020-10-11","location":"Historique BPT","player":"Michel SCHERPEREEL","place":8,"killer":"","tablier":false,"n":11,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":8,"date":"2020-10-11","location":"Historique BPT","player":"Jérémy COQUEL","place":9,"killer":"","tablier":false,"n":11,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":8,"date":"2020-10-11","location":"Historique BPT","player":"Solène BALLOIS","place":10,"killer":"","tablier":false,"n":11,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":8,"date":"2020-10-11","location":"Historique BPT","player":"Jérôme BERA","place":11,"killer":"","tablier":false,"n":11,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2020-10-16","location":"Historique BPT","player":"François CATTEAU","place":1,"killer":"","tablier":false,"n":11,"points":34.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":9,"date":"2020-10-16","location":"Historique BPT","player":"Jérôme BERA","place":2,"killer":"","tablier":false,"n":11,"points":28.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":9,"date":"2020-10-16","location":"Historique BPT","player":"FRANCK CHATARD","place":3,"killer":"","tablier":false,"n":11,"points":23.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":9,"date":"2020-10-16","location":"Historique BPT","player":"Grégoire DUFORET","place":4,"killer":"","tablier":false,"n":11,"points":19.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2020-10-16","location":"Historique BPT","player":"Stéphane LEFIN","place":5,"killer":"","tablier":false,"n":11,"points":16.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2020-10-16","location":"Historique BPT","player":"Mehdi BRAHIMI","place":6,"killer":"","tablier":false,"n":11,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2020-10-16","location":"Historique BPT","player":"Olivier HENGUELLE","place":7,"killer":"","tablier":false,"n":11,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2020-10-16","location":"Historique BPT","player":"Alexis Volant","place":8,"killer":"","tablier":false,"n":11,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2020-10-16","location":"Historique BPT","player":"Jérémy COQUEL","place":9,"killer":"","tablier":false,"n":11,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2020-10-16","location":"Historique BPT","player":"Jérôme RIFFE","place":10,"killer":"","tablier":false,"n":11,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2020-10-16","location":"Historique BPT","player":"Areski AIT GHERBI","place":11,"killer":"","tablier":false,"n":11,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2020-10-19","location":"Historique BPT","player":"Olivier HENGUELLE","place":1,"killer":"","tablier":false,"n":12,"points":36.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":10,"date":"2020-10-19","location":"Historique BPT","player":"Philippe DUBOIS","place":2,"killer":"","tablier":false,"n":12,"points":30.0,"stake":5,"gross":20,"net":15,"kills":0,"win":false,"podium":true},{"game":10,"date":"2020-10-19","location":"Historique BPT","player":"FRANCK CHATARD","place":3,"killer":"","tablier":false,"n":12,"points":25.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":10,"date":"2020-10-19","location":"Historique BPT","player":"Alexis Volant","place":4,"killer":"","tablier":false,"n":12,"points":21.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2020-10-19","location":"Historique BPT","player":"Michel SCHERPEREEL","place":5,"killer":"","tablier":false,"n":12,"points":18.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2020-10-19","location":"Historique BPT","player":"Grégoire DUFORET","place":6,"killer":"","tablier":false,"n":12,"points":15.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2020-10-19","location":"Historique BPT","player":"Jérôme BERA","place":7,"killer":"","tablier":false,"n":12,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2020-10-19","location":"Historique BPT","player":"Mehdi BRAHIMI","place":8,"killer":"","tablier":false,"n":12,"points":9.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2020-10-19","location":"Historique BPT","player":"Stéphane LEFIN","place":9,"killer":"","tablier":false,"n":12,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2020-10-19","location":"Historique BPT","player":"Areski AIT GHERBI","place":10,"killer":"","tablier":false,"n":12,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2020-10-19","location":"Historique BPT","player":"François CATTEAU","place":11,"killer":"","tablier":false,"n":12,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2020-10-19","location":"Historique BPT","player":"Jérémy COQUEL","place":12,"killer":"","tablier":false,"n":12,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2020-10-23","location":"Historique BPT","player":"FRANCK CHATARD","place":1,"killer":"","tablier":false,"n":16,"points":41.0,"stake":5,"gross":50,"net":45,"kills":0,"win":true,"podium":true},{"game":11,"date":"2020-10-23","location":"Historique BPT","player":"Areski AIT GHERBI","place":2,"killer":"","tablier":false,"n":16,"points":35.0,"stake":5,"gross":25,"net":20,"kills":0,"win":false,"podium":true},{"game":11,"date":"2020-10-23","location":"Historique BPT","player":"Alexis Volant","place":3,"killer":"","tablier":false,"n":16,"points":30.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":11,"date":"2020-10-23","location":"Historique BPT","player":"Michel SCHERPEREEL","place":4,"killer":"","tablier":false,"n":16,"points":26.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2020-10-23","location":"Historique BPT","player":"Stéphane LEFIN","place":5,"killer":"","tablier":false,"n":16,"points":23.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2020-10-23","location":"Historique BPT","player":"Olivier HENGUELLE","place":6,"killer":"","tablier":false,"n":16,"points":20.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2020-10-23","location":"Historique BPT","player":"Grégoire DUFORET","place":7,"killer":"","tablier":false,"n":16,"points":17.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2020-10-23","location":"Historique BPT","player":"Jérémy COQUEL","place":8,"killer":"","tablier":false,"n":16,"points":14.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2020-10-23","location":"Historique BPT","player":"Thierry MONNIAUX","place":9,"killer":"","tablier":false,"n":16,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2020-10-23","location":"Historique BPT","player":"Philippe DUBOIS","place":10,"killer":"","tablier":false,"n":16,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2020-10-23","location":"Historique BPT","player":"Jérôme RIFFE","place":11,"killer":"","tablier":false,"n":16,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2020-10-23","location":"Historique BPT","player":"François CATTEAU","place":12,"killer":"","tablier":false,"n":16,"points":6.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2020-10-23","location":"Historique BPT","player":"Mehdi BRAHIMI","place":13,"killer":"","tablier":false,"n":16,"points":4.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2020-10-23","location":"Historique BPT","player":"Jérémie CARPENTIER","place":14,"killer":"","tablier":false,"n":16,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2020-10-23","location":"Historique BPT","player":"Solène BALLOIS","place":15,"killer":"","tablier":false,"n":16,"points":2.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2020-10-23","location":"Historique BPT","player":"Jérôme BERA","place":16,"killer":"","tablier":false,"n":16,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2020-10-25","location":"Historique BPT","player":"Michel SCHERPEREEL","place":1,"killer":"","tablier":false,"n":18,"points":43.0,"stake":5,"gross":55,"net":50,"kills":0,"win":true,"podium":true},{"game":12,"date":"2020-10-25","location":"Historique BPT","player":"Jérôme BERA","place":2,"killer":"","tablier":false,"n":18,"points":37.0,"stake":5,"gross":25,"net":20,"kills":0,"win":false,"podium":true},{"game":12,"date":"2020-10-25","location":"Historique BPT","player":"Clément MARAVAL","place":3,"killer":"","tablier":false,"n":18,"points":32.0,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":12,"date":"2020-10-25","location":"Historique BPT","player":"Thierry MONNIAUX","place":4,"killer":"","tablier":false,"n":18,"points":28.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2020-10-25","location":"Historique BPT","player":"Grégoire DUFORET","place":5,"killer":"","tablier":false,"n":18,"points":25.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2020-10-25","location":"Historique BPT","player":"Olivier HENGUELLE","place":6,"killer":"","tablier":false,"n":18,"points":22.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2020-10-25","location":"Historique BPT","player":"Alexis Volant","place":7,"killer":"","tablier":false,"n":18,"points":19.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2020-10-25","location":"Historique BPT","player":"KITEMALAMAN","place":8,"killer":"","tablier":false,"n":18,"points":16.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2020-10-25","location":"Historique BPT","player":"FRANCK CHATARD","place":9,"killer":"","tablier":false,"n":18,"points":14.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2020-10-25","location":"Historique BPT","player":"LILICRAPOTE","place":10,"killer":"","tablier":false,"n":18,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2020-10-25","location":"Historique BPT","player":"Stéphane LEFIN","place":11,"killer":"","tablier":false,"n":18,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2020-10-25","location":"Historique BPT","player":"Jérémy COQUEL","place":12,"killer":"","tablier":false,"n":18,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2020-10-25","location":"Historique BPT","player":"Jérôme RIFFE","place":13,"killer":"","tablier":false,"n":18,"points":6.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2020-10-25","location":"Historique BPT","player":"Jérémie CARPENTIER","place":14,"killer":"","tablier":false,"n":18,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2020-10-25","location":"Historique BPT","player":"Mehdi BRAHIMI","place":15,"killer":"","tablier":false,"n":18,"points":4.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2020-10-25","location":"Historique BPT","player":"Areski AIT GHERBI","place":16,"killer":"","tablier":false,"n":18,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2020-10-25","location":"Historique BPT","player":"François CATTEAU","place":17,"killer":"","tablier":false,"n":18,"points":2.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2020-10-25","location":"Historique BPT","player":"Philippe DUBOIS","place":18,"killer":"","tablier":false,"n":18,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2020-10-30","location":"Historique BPT","player":"Thierry MONNIAUX","place":1,"killer":"","tablier":false,"n":16,"points":41.0,"stake":5,"gross":50,"net":45,"kills":0,"win":true,"podium":true},{"game":13,"date":"2020-10-30","location":"Historique BPT","player":"Alexis Volant","place":2,"killer":"","tablier":false,"n":16,"points":35.0,"stake":5,"gross":25,"net":20,"kills":0,"win":false,"podium":true},{"game":13,"date":"2020-10-30","location":"Historique BPT","player":"Jérôme RIFFE","place":3,"killer":"","tablier":false,"n":16,"points":30.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":13,"date":"2020-10-30","location":"Historique BPT","player":"Olivier HENGUELLE","place":4,"killer":"","tablier":false,"n":16,"points":26.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2020-10-30","location":"Historique BPT","player":"Mehdi BRAHIMI","place":5,"killer":"","tablier":false,"n":16,"points":23.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2020-10-30","location":"Historique BPT","player":"Philippe DUBOIS","place":6,"killer":"","tablier":false,"n":16,"points":20.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2020-10-30","location":"Historique BPT","player":"Michel SCHERPEREEL","place":7,"killer":"","tablier":false,"n":16,"points":17.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2020-10-30","location":"Historique BPT","player":"Jérémie CARPENTIER","place":8,"killer":"","tablier":false,"n":16,"points":14.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2020-10-30","location":"Historique BPT","player":"Jérémy COQUEL","place":9,"killer":"","tablier":false,"n":16,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2020-10-30","location":"Historique BPT","player":"Stéphane LEFIN","place":10,"killer":"","tablier":false,"n":16,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2020-10-30","location":"Historique BPT","player":"Jérôme BERA","place":11,"killer":"","tablier":false,"n":16,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2020-10-30","location":"Historique BPT","player":"Areski AIT GHERBI","place":12,"killer":"","tablier":false,"n":16,"points":6.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2020-10-30","location":"Historique BPT","player":"Gérard CANDELIER","place":13,"killer":"","tablier":false,"n":16,"points":4.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2020-10-30","location":"Historique BPT","player":"Grégoire DUFORET","place":14,"killer":"","tablier":false,"n":16,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2020-10-30","location":"Historique BPT","player":"Jérôme BINOT","place":15,"killer":"","tablier":false,"n":16,"points":2.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2020-10-30","location":"Historique BPT","player":"FRANCK CHATARD","place":16,"killer":"","tablier":false,"n":16,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2020-11-01","location":"Historique BPT","player":"Grégoire DUFORET","place":1,"killer":"","tablier":false,"n":17,"points":42.0,"stake":5,"gross":50,"net":45,"kills":0,"win":true,"podium":true},{"game":14,"date":"2020-11-01","location":"Historique BPT","player":"Jérémy COQUEL","place":2,"killer":"","tablier":false,"n":17,"points":36.0,"stake":5,"gross":25,"net":20,"kills":0,"win":false,"podium":true},{"game":14,"date":"2020-11-01","location":"Historique BPT","player":"Stéphane LEFIN","place":3,"killer":"","tablier":false,"n":17,"points":31.0,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":14,"date":"2020-11-01","location":"Historique BPT","player":"Olivier HENGUELLE","place":4,"killer":"","tablier":false,"n":17,"points":27.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2020-11-01","location":"Historique BPT","player":"Areski AIT GHERBI","place":5,"killer":"","tablier":false,"n":17,"points":24.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2020-11-01","location":"Historique BPT","player":"François CATTEAU","place":6,"killer":"","tablier":false,"n":17,"points":21.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2020-11-01","location":"Historique BPT","player":"Michel SCHERPEREEL","place":7,"killer":"","tablier":false,"n":17,"points":18.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2020-11-01","location":"Historique BPT","player":"Alexis Volant","place":8,"killer":"","tablier":false,"n":17,"points":15.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2020-11-01","location":"Historique BPT","player":"Gérard CANDELIER","place":9,"killer":"","tablier":false,"n":17,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2020-11-01","location":"Historique BPT","player":"Jérôme BERA","place":10,"killer":"","tablier":false,"n":17,"points":11.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2020-11-01","location":"Historique BPT","player":"FRANCK CHATARD","place":11,"killer":"","tablier":false,"n":17,"points":9.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2020-11-01","location":"Historique BPT","player":"LILICRAPOTE","place":12,"killer":"","tablier":false,"n":17,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2020-11-01","location":"Historique BPT","player":"KITEMALAMAN","place":13,"killer":"","tablier":false,"n":17,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2020-11-01","location":"Historique BPT","player":"Solène BALLOIS","place":14,"killer":"","tablier":false,"n":17,"points":4.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2020-11-01","location":"Historique BPT","player":"Jérémie CARPENTIER","place":15,"killer":"","tablier":false,"n":17,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2020-11-01","location":"Historique BPT","player":"Thierry MONNIAUX","place":16,"killer":"","tablier":false,"n":17,"points":2.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2020-11-01","location":"Historique BPT","player":"Philippe DUBOIS","place":17,"killer":"","tablier":false,"n":17,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2020-11-06","location":"Historique BPT","player":"Olivier HENGUELLE","place":1,"killer":"","tablier":false,"n":16,"points":41.0,"stake":5,"gross":50,"net":45,"kills":0,"win":true,"podium":true},{"game":15,"date":"2020-11-06","location":"Historique BPT","player":"KITEMALAMAN","place":2,"killer":"","tablier":false,"n":16,"points":35.0,"stake":5,"gross":25,"net":20,"kills":0,"win":false,"podium":true},{"game":15,"date":"2020-11-06","location":"Historique BPT","player":"FRANCK CHATARD","place":3,"killer":"","tablier":false,"n":16,"points":30.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":15,"date":"2020-11-06","location":"Historique BPT","player":"Jérôme BERA","place":4,"killer":"","tablier":false,"n":16,"points":26.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2020-11-06","location":"Historique BPT","player":"François CATTEAU","place":5,"killer":"","tablier":false,"n":16,"points":23.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2020-11-06","location":"Historique BPT","player":"Jérôme RIFFE","place":6,"killer":"","tablier":false,"n":16,"points":20.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2020-11-06","location":"Historique BPT","player":"Stéphane LEFIN","place":7,"killer":"","tablier":false,"n":16,"points":17.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2020-11-06","location":"Historique BPT","player":"Anne BERA","place":8,"killer":"","tablier":false,"n":16,"points":14.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2020-11-06","location":"Historique BPT","player":"Jérémy COQUEL","place":9,"killer":"","tablier":false,"n":16,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2020-11-06","location":"Historique BPT","player":"Alexis Volant","place":10,"killer":"","tablier":false,"n":16,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2020-11-06","location":"Historique BPT","player":"Philippe DUBOIS","place":11,"killer":"","tablier":false,"n":16,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2020-11-06","location":"Historique BPT","player":"Grégoire DUFORET","place":12,"killer":"","tablier":false,"n":16,"points":6.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2020-11-06","location":"Historique BPT","player":"Areski AIT GHERBI","place":13,"killer":"","tablier":false,"n":16,"points":4.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2020-11-06","location":"Historique BPT","player":"Mehdi BRAHIMI","place":14,"killer":"","tablier":false,"n":16,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2020-11-06","location":"Historique BPT","player":"Thierry MONNIAUX","place":15,"killer":"","tablier":false,"n":16,"points":2.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2020-11-06","location":"Historique BPT","player":"Jérôme BINOT","place":16,"killer":"","tablier":false,"n":16,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2020-11-08","location":"Historique BPT","player":"FRANCK CHATARD","place":1,"killer":"","tablier":false,"n":12,"points":36.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":16,"date":"2020-11-08","location":"Historique BPT","player":"Alexis Volant","place":2,"killer":"","tablier":false,"n":12,"points":30.0,"stake":5,"gross":20,"net":15,"kills":0,"win":false,"podium":true},{"game":16,"date":"2020-11-08","location":"Historique BPT","player":"Jérôme BERA","place":3,"killer":"","tablier":false,"n":12,"points":25.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":16,"date":"2020-11-08","location":"Historique BPT","player":"KITEMALAMAN","place":4,"killer":"","tablier":false,"n":12,"points":21.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2020-11-08","location":"Historique BPT","player":"Stéphane LEFIN","place":5,"killer":"","tablier":false,"n":12,"points":18.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2020-11-08","location":"Historique BPT","player":"Thierry MONNIAUX","place":6,"killer":"","tablier":false,"n":12,"points":15.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2020-11-08","location":"Historique BPT","player":"Grégoire DUFORET","place":7,"killer":"","tablier":false,"n":12,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2020-11-08","location":"Historique BPT","player":"Philippe DUBOIS","place":8,"killer":"","tablier":false,"n":12,"points":9.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2020-11-08","location":"Historique BPT","player":"François CATTEAU","place":9,"killer":"","tablier":false,"n":12,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2020-11-08","location":"Historique BPT","player":"Areski AIT GHERBI","place":10,"killer":"","tablier":false,"n":12,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2020-11-08","location":"Historique BPT","player":"Olivier HENGUELLE","place":11,"killer":"","tablier":false,"n":12,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2020-11-08","location":"Historique BPT","player":"Michel SCHERPEREEL","place":12,"killer":"","tablier":false,"n":12,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"Jérémy COQUEL","place":1,"killer":"","tablier":false,"n":22,"points":47.0,"stake":5,"gross":65,"net":60,"kills":0,"win":true,"podium":true},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"FRANCK CHATARD","place":2,"killer":"","tablier":false,"n":22,"points":41.0,"stake":5,"gross":35,"net":30,"kills":0,"win":false,"podium":true},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"Stéphane LEFIN","place":3,"killer":"","tablier":false,"n":22,"points":36.0,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"joueur occasionnel 3","place":4,"killer":"","tablier":false,"n":22,"points":32.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"KITEMALAMAN","place":5,"killer":"","tablier":false,"n":22,"points":29.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"Jérôme BINOT","place":6,"killer":"","tablier":false,"n":22,"points":26.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"joueur occasionnel 4","place":7,"killer":"","tablier":false,"n":22,"points":23.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"joueur occasionnel 6","place":8,"killer":"","tablier":false,"n":22,"points":20.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"Michel SCHERPEREEL","place":9,"killer":"","tablier":false,"n":22,"points":18.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"LILICRAPOTE","place":10,"killer":"","tablier":false,"n":22,"points":16.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"Anne BERA","place":11,"killer":"","tablier":false,"n":22,"points":14.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"Thierry MONNIAUX","place":12,"killer":"","tablier":false,"n":22,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"Olivier HENGUELLE","place":13,"killer":"","tablier":false,"n":22,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"Jérôme BERA","place":14,"killer":"","tablier":false,"n":22,"points":9.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"Clément MARAVAL","place":15,"killer":"","tablier":false,"n":22,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"Gérard CANDELIER","place":16,"killer":"","tablier":false,"n":22,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"Grégoire DUFORET","place":17,"killer":"","tablier":false,"n":22,"points":6.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"François CATTEAU","place":18,"killer":"","tablier":false,"n":22,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"Jérôme RIFFE","place":19,"killer":"","tablier":false,"n":22,"points":4.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"Alexis Volant","place":20,"killer":"","tablier":false,"n":22,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"joueur occasionnel 7","place":21,"killer":"","tablier":false,"n":22,"points":2.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2020-11-10","location":"Historique BPT","player":"Areski AIT GHERBI","place":22,"killer":"","tablier":false,"n":22,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2020-11-13","location":"Historique BPT","player":"Philippe DUBOIS","place":1,"killer":"","tablier":false,"n":16,"points":41.0,"stake":5,"gross":50,"net":45,"kills":0,"win":true,"podium":true},{"game":18,"date":"2020-11-13","location":"Historique BPT","player":"Olivier HENGUELLE","place":2,"killer":"","tablier":false,"n":16,"points":35.0,"stake":5,"gross":25,"net":20,"kills":0,"win":false,"podium":true},{"game":18,"date":"2020-11-13","location":"Historique BPT","player":"KITEMALAMAN","place":3,"killer":"","tablier":false,"n":16,"points":30.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":18,"date":"2020-11-13","location":"Historique BPT","player":"LILICRAPOTE","place":4,"killer":"","tablier":false,"n":16,"points":26.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2020-11-13","location":"Historique BPT","player":"Stéphane LEFIN","place":5,"killer":"","tablier":false,"n":16,"points":23.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2020-11-13","location":"Historique BPT","player":"Jérémy COQUEL","place":6,"killer":"","tablier":false,"n":16,"points":20.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2020-11-13","location":"Historique BPT","player":"Grégoire DUFORET","place":7,"killer":"","tablier":false,"n":16,"points":17.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2020-11-13","location":"Historique BPT","player":"FRANCK CHATARD","place":8,"killer":"","tablier":false,"n":16,"points":14.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2020-11-13","location":"Historique BPT","player":"Jérôme BINOT","place":9,"killer":"","tablier":false,"n":16,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2020-11-13","location":"Historique BPT","player":"Thierry MONNIAUX","place":10,"killer":"","tablier":false,"n":16,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2020-11-13","location":"Historique BPT","player":"Alexis Volant","place":11,"killer":"","tablier":false,"n":16,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2020-11-13","location":"Historique BPT","player":"François CATTEAU","place":12,"killer":"","tablier":false,"n":16,"points":6.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2020-11-13","location":"Historique BPT","player":"Jérôme RIFFE","place":13,"killer":"","tablier":false,"n":16,"points":4.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2020-11-13","location":"Historique BPT","player":"Jérôme BERA","place":14,"killer":"","tablier":false,"n":16,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2020-11-13","location":"Historique BPT","player":"Areski AIT GHERBI","place":15,"killer":"","tablier":false,"n":16,"points":2.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2020-11-13","location":"Historique BPT","player":"Michel SCHERPEREEL","place":16,"killer":"","tablier":false,"n":16,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2020-11-15","location":"Historique BPT","player":"Jérôme BERA","place":1,"killer":"","tablier":false,"n":12,"points":36.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":19,"date":"2020-11-15","location":"Historique BPT","player":"Olivier HENGUELLE","place":2,"killer":"","tablier":false,"n":12,"points":30.0,"stake":5,"gross":20,"net":15,"kills":0,"win":false,"podium":true},{"game":19,"date":"2020-11-15","location":"Historique BPT","player":"KITEMALAMAN","place":3,"killer":"","tablier":false,"n":12,"points":25.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":19,"date":"2020-11-15","location":"Historique BPT","player":"FRANCK CHATARD","place":4,"killer":"","tablier":false,"n":12,"points":21.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2020-11-15","location":"Historique BPT","player":"Thierry MONNIAUX","place":5,"killer":"","tablier":false,"n":12,"points":18.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2020-11-15","location":"Historique BPT","player":"Michel SCHERPEREEL","place":6,"killer":"","tablier":false,"n":12,"points":15.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2020-11-15","location":"Historique BPT","player":"Jérémie CARPENTIER","place":7,"killer":"","tablier":false,"n":12,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2020-11-15","location":"Historique BPT","player":"Grégoire DUFORET","place":8,"killer":"","tablier":false,"n":12,"points":9.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2020-11-15","location":"Historique BPT","player":"Alexis Volant","place":9,"killer":"","tablier":false,"n":12,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2020-11-15","location":"Historique BPT","player":"Stéphane LEFIN","place":10,"killer":"","tablier":false,"n":12,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2020-11-15","location":"Historique BPT","player":"Jérémy COQUEL","place":11,"killer":"","tablier":false,"n":12,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2020-11-15","location":"Historique BPT","player":"Philippe DUBOIS","place":12,"killer":"","tablier":false,"n":12,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2020-11-20","location":"Historique BPT","player":"KITEMALAMAN","place":1,"killer":"","tablier":false,"n":14,"points":39.0,"stake":5,"gross":40,"net":35,"kills":0,"win":true,"podium":true},{"game":20,"date":"2020-11-20","location":"Historique BPT","player":"FRANCK CHATARD","place":2,"killer":"","tablier":false,"n":14,"points":33.0,"stake":5,"gross":20,"net":15,"kills":0,"win":false,"podium":true},{"game":20,"date":"2020-11-20","location":"Historique BPT","player":"Grégoire DUFORET","place":3,"killer":"","tablier":false,"n":14,"points":28.0,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":20,"date":"2020-11-20","location":"Historique BPT","player":"Philippe DUBOIS","place":4,"killer":"","tablier":false,"n":14,"points":24.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2020-11-20","location":"Historique BPT","player":"Olivier HENGUELLE","place":5,"killer":"","tablier":false,"n":14,"points":21.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2020-11-20","location":"Historique BPT","player":"Stéphane LEFIN","place":6,"killer":"","tablier":false,"n":14,"points":18.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2020-11-20","location":"Historique BPT","player":"Thierry MONNIAUX","place":7,"killer":"","tablier":false,"n":14,"points":15.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2020-11-20","location":"Historique BPT","player":"Jérôme BERA","place":8,"killer":"","tablier":false,"n":14,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2020-11-20","location":"Historique BPT","player":"Alexis Volant","place":9,"killer":"","tablier":false,"n":14,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2020-11-20","location":"Historique BPT","player":"Areski AIT GHERBI","place":10,"killer":"","tablier":false,"n":14,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2020-11-20","location":"Historique BPT","player":"François CATTEAU","place":11,"killer":"","tablier":false,"n":14,"points":6.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2020-11-20","location":"Historique BPT","player":"Jérôme RIFFE","place":12,"killer":"","tablier":false,"n":14,"points":4.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2020-11-20","location":"Historique BPT","player":"Jérôme BINOT","place":13,"killer":"","tablier":false,"n":14,"points":2.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2020-11-20","location":"Historique BPT","player":"Jérémy COQUEL","place":14,"killer":"","tablier":false,"n":14,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2021-01-01","location":"winamax","player":"Alexis Volant","place":1,"killer":"","tablier":false,"n":12,"points":36.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":21,"date":"2021-01-01","location":"winamax","player":"François CATTEAU","place":2,"killer":"","tablier":false,"n":12,"points":30.0,"stake":5,"gross":20,"net":15,"kills":0,"win":false,"podium":true},{"game":21,"date":"2021-01-01","location":"winamax","player":"Stéphane LEFIN","place":3,"killer":"","tablier":false,"n":12,"points":25.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":21,"date":"2021-01-01","location":"winamax","player":"Thierry MONNIAUX","place":4,"killer":"","tablier":false,"n":12,"points":21.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2021-01-01","location":"winamax","player":"Jérôme BERA","place":5,"killer":"","tablier":false,"n":12,"points":18.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2021-01-01","location":"winamax","player":"Jérémy COQUEL","place":6,"killer":"","tablier":false,"n":12,"points":15.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2021-01-01","location":"winamax","player":"Anne BERA","place":7,"killer":"","tablier":false,"n":12,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2021-01-01","location":"winamax","player":"Olivier HENGUELLE","place":8,"killer":"","tablier":false,"n":12,"points":9.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2021-01-01","location":"winamax","player":"Philippe DUBOIS","place":9,"killer":"","tablier":false,"n":12,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2021-01-01","location":"winamax","player":"Franck NAESSENS","place":10,"killer":"","tablier":false,"n":12,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2021-01-01","location":"winamax","player":"Grégoire DUFORET","place":11,"killer":"","tablier":false,"n":12,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2021-01-01","location":"winamax","player":"Areski AIT GHERBI","place":12,"killer":"","tablier":false,"n":12,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2021-01-03","location":"winamax","player":"Franck NAESSENS","place":1,"killer":"","tablier":false,"n":13,"points":38.0,"stake":5,"gross":40,"net":35,"kills":0,"win":true,"podium":true},{"game":22,"date":"2021-01-03","location":"winamax","player":"François CATTEAU","place":2,"killer":"","tablier":false,"n":13,"points":32.0,"stake":5,"gross":20,"net":15,"kills":0,"win":false,"podium":true},{"game":22,"date":"2021-01-03","location":"winamax","player":"Jérémie CARPENTIER","place":3,"killer":"","tablier":false,"n":13,"points":27.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":22,"date":"2021-01-03","location":"winamax","player":"Olivier HENGUELLE","place":4,"killer":"","tablier":false,"n":13,"points":23.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2021-01-03","location":"winamax","player":"Thierry MONNIAUX","place":5,"killer":"","tablier":false,"n":13,"points":20.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2021-01-03","location":"winamax","player":"Grégoire DUFORET","place":6,"killer":"","tablier":false,"n":13,"points":17.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2021-01-03","location":"winamax","player":"Stéphane LEFIN","place":7,"killer":"","tablier":false,"n":13,"points":14.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2021-01-03","location":"winamax","player":"Philippe DUBOIS","place":8,"killer":"","tablier":false,"n":13,"points":11.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2021-01-03","location":"winamax","player":"Michel SCHERPEREEL","place":9,"killer":"","tablier":false,"n":13,"points":9.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2021-01-03","location":"winamax","player":"Jérôme BERA","place":10,"killer":"","tablier":false,"n":13,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2021-01-03","location":"winamax","player":"Jérémy COQUEL","place":11,"killer":"","tablier":false,"n":13,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2021-01-03","location":"winamax","player":"Alexis Volant","place":12,"killer":"","tablier":false,"n":13,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2021-01-03","location":"winamax","player":"Areski AIT GHERBI","place":13,"killer":"","tablier":false,"n":13,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2021-01-08","location":"winamax","player":"Clément MARAVAL","place":1,"killer":"","tablier":false,"n":14,"points":39.0,"stake":5,"gross":40,"net":35,"kills":0,"win":true,"podium":true},{"game":23,"date":"2021-01-08","location":"winamax","player":"Jérémy COQUEL","place":2,"killer":"","tablier":false,"n":14,"points":33.0,"stake":5,"gross":20,"net":15,"kills":0,"win":false,"podium":true},{"game":23,"date":"2021-01-08","location":"winamax","player":"Jérôme BINOT","place":3,"killer":"","tablier":false,"n":14,"points":28.0,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":23,"date":"2021-01-08","location":"winamax","player":"François CATTEAU","place":4,"killer":"","tablier":false,"n":14,"points":24.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2021-01-08","location":"winamax","player":"Franck NAESSENS","place":5,"killer":"","tablier":false,"n":14,"points":21.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2021-01-08","location":"winamax","player":"Stéphane LEFIN","place":6,"killer":"","tablier":false,"n":14,"points":18.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2021-01-08","location":"winamax","player":"Gérard CANDELIER","place":7,"killer":"","tablier":false,"n":14,"points":15.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2021-01-08","location":"winamax","player":"Alexis Volant","place":8,"killer":"","tablier":false,"n":14,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2021-01-08","location":"winamax","player":"Olivier HENGUELLE","place":9,"killer":"","tablier":false,"n":14,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2021-01-08","location":"winamax","player":"Philippe DUBOIS","place":10,"killer":"","tablier":false,"n":14,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2021-01-08","location":"winamax","player":"Thierry MONNIAUX","place":11,"killer":"","tablier":false,"n":14,"points":6.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2021-01-08","location":"winamax","player":"Areski AIT GHERBI","place":12,"killer":"","tablier":false,"n":14,"points":4.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2021-01-08","location":"winamax","player":"Jérôme BERA","place":13,"killer":"","tablier":false,"n":14,"points":2.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2021-01-08","location":"winamax","player":"Grégoire DUFORET","place":14,"killer":"","tablier":false,"n":14,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":24,"date":"2021-01-10","location":"winamax","player":"Jérémy COQUEL","place":1,"killer":"","tablier":false,"n":12,"points":36.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":24,"date":"2021-01-10","location":"winamax","player":"François CATTEAU","place":2,"killer":"","tablier":false,"n":12,"points":30.0,"stake":5,"gross":20,"net":15,"kills":0,"win":false,"podium":true},{"game":24,"date":"2021-01-10","location":"winamax","player":"Michel SCHERPEREEL","place":3,"killer":"","tablier":false,"n":12,"points":25.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":24,"date":"2021-01-10","location":"winamax","player":"Jérémie CARPENTIER","place":4,"killer":"","tablier":false,"n":12,"points":21.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":24,"date":"2021-01-10","location":"winamax","player":"Stéphane LEFIN","place":5,"killer":"","tablier":false,"n":12,"points":18.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":24,"date":"2021-01-10","location":"winamax","player":"Areski AIT GHERBI","place":6,"killer":"","tablier":false,"n":12,"points":15.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":24,"date":"2021-01-10","location":"winamax","player":"Franck NAESSENS","place":7,"killer":"","tablier":false,"n":12,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":24,"date":"2021-01-10","location":"winamax","player":"Jérôme BERA","place":8,"killer":"","tablier":false,"n":12,"points":9.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":24,"date":"2021-01-10","location":"winamax","player":"Alexis Volant","place":9,"killer":"","tablier":false,"n":12,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":24,"date":"2021-01-10","location":"winamax","player":"thomas","place":10,"killer":"","tablier":false,"n":12,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":24,"date":"2021-01-10","location":"winamax","player":"Olivier HENGUELLE","place":11,"killer":"","tablier":false,"n":12,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":24,"date":"2021-01-10","location":"winamax","player":"Grégoire DUFORET","place":12,"killer":"","tablier":false,"n":12,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2021-01-15","location":"winamax","player":"Franck NAESSENS","place":1,"killer":"","tablier":false,"n":13,"points":38.0,"stake":5,"gross":40,"net":35,"kills":0,"win":true,"podium":true},{"game":25,"date":"2021-01-15","location":"winamax","player":"Olivier HENGUELLE","place":2,"killer":"","tablier":false,"n":13,"points":32.0,"stake":5,"gross":20,"net":15,"kills":0,"win":false,"podium":true},{"game":25,"date":"2021-01-15","location":"winamax","player":"Michel SCHERPEREEL","place":3,"killer":"","tablier":false,"n":13,"points":27.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":25,"date":"2021-01-15","location":"winamax","player":"Stéphane LEFIN","place":4,"killer":"","tablier":false,"n":13,"points":23.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2021-01-15","location":"winamax","player":"Jérôme BERA","place":5,"killer":"","tablier":false,"n":13,"points":20.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2021-01-15","location":"winamax","player":"Jérémy COQUEL","place":6,"killer":"","tablier":false,"n":13,"points":17.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2021-01-15","location":"winamax","player":"Jérôme RIFFE","place":7,"killer":"","tablier":false,"n":13,"points":14.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2021-01-15","location":"winamax","player":"Grégoire DUFORET","place":8,"killer":"","tablier":false,"n":13,"points":11.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2021-01-15","location":"winamax","player":"Clément MARAVAL","place":9,"killer":"","tablier":false,"n":13,"points":9.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2021-01-15","location":"winamax","player":"Alexis Volant","place":10,"killer":"","tablier":false,"n":13,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2021-01-15","location":"winamax","player":"Thierry MONNIAUX","place":11,"killer":"","tablier":false,"n":13,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2021-01-15","location":"winamax","player":"François CATTEAU","place":12,"killer":"","tablier":false,"n":13,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2021-01-15","location":"winamax","player":"Philippe DUBOIS","place":13,"killer":"","tablier":false,"n":13,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2021-01-17","location":"winamax","player":"François CATTEAU","place":1,"killer":"","tablier":false,"n":12,"points":36.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":26,"date":"2021-01-17","location":"winamax","player":"Clément MARAVAL","place":2,"killer":"","tablier":false,"n":12,"points":30.0,"stake":5,"gross":20,"net":15,"kills":0,"win":false,"podium":true},{"game":26,"date":"2021-01-17","location":"winamax","player":"Alexis Volant","place":3,"killer":"","tablier":false,"n":12,"points":25.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":26,"date":"2021-01-17","location":"winamax","player":"Areski AIT GHERBI","place":4,"killer":"","tablier":false,"n":12,"points":21.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2021-01-17","location":"winamax","player":"Thierry MONNIAUX","place":5,"killer":"","tablier":false,"n":12,"points":18.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2021-01-17","location":"winamax","player":"Franck NAESSENS","place":6,"killer":"","tablier":false,"n":12,"points":15.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2021-01-17","location":"winamax","player":"Jérôme BERA","place":7,"killer":"","tablier":false,"n":12,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2021-01-17","location":"winamax","player":"Stéphane LEFIN","place":8,"killer":"","tablier":false,"n":12,"points":9.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2021-01-17","location":"winamax","player":"Olivier HENGUELLE","place":9,"killer":"","tablier":false,"n":12,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2021-01-17","location":"winamax","player":"thomas","place":10,"killer":"","tablier":false,"n":12,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2021-01-17","location":"winamax","player":"Grégoire DUFORET","place":11,"killer":"","tablier":false,"n":12,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2021-01-17","location":"winamax","player":"Philippe DUBOIS","place":12,"killer":"","tablier":false,"n":12,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2021-01-22","location":"winamax","player":"Thierry MONNIAUX","place":1,"killer":"","tablier":false,"n":12,"points":36.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":27,"date":"2021-01-22","location":"winamax","player":"Franck NAESSENS","place":2,"killer":"","tablier":false,"n":12,"points":30.0,"stake":5,"gross":20,"net":15,"kills":0,"win":false,"podium":true},{"game":27,"date":"2021-01-22","location":"winamax","player":"Stéphane LEFIN","place":3,"killer":"","tablier":false,"n":12,"points":25.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":27,"date":"2021-01-22","location":"winamax","player":"Areski AIT GHERBI","place":4,"killer":"","tablier":false,"n":12,"points":21.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2021-01-22","location":"winamax","player":"Jérôme BINOT","place":5,"killer":"","tablier":false,"n":12,"points":18.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2021-01-22","location":"winamax","player":"Michel SCHERPEREEL","place":6,"killer":"","tablier":false,"n":12,"points":15.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2021-01-22","location":"winamax","player":"Clément MARAVAL","place":7,"killer":"","tablier":false,"n":12,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2021-01-22","location":"winamax","player":"Philippe DUBOIS","place":8,"killer":"","tablier":false,"n":12,"points":9.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2021-01-22","location":"winamax","player":"Olivier HENGUELLE","place":9,"killer":"","tablier":false,"n":12,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2021-01-22","location":"winamax","player":"Grégoire DUFORET","place":10,"killer":"","tablier":false,"n":12,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2021-01-22","location":"winamax","player":"François CATTEAU","place":11,"killer":"","tablier":false,"n":12,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2021-01-22","location":"winamax","player":"Alexis Volant","place":12,"killer":"","tablier":false,"n":12,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2021-01-24","location":"winamax","player":"Alexis Volant","place":1,"killer":"","tablier":false,"n":9,"points":27.0,"stake":5,"gross":25,"net":20,"kills":0,"win":true,"podium":true},{"game":28,"date":"2021-01-24","location":"winamax","player":"Grégoire DUFORET","place":2,"killer":"","tablier":false,"n":9,"points":22.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":28,"date":"2021-01-24","location":"winamax","player":"Areski AIT GHERBI","place":3,"killer":"","tablier":false,"n":9,"points":17.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":28,"date":"2021-01-24","location":"winamax","player":"Philippe DUBOIS","place":4,"killer":"","tablier":false,"n":9,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2021-01-24","location":"winamax","player":"Stéphane LEFIN","place":5,"killer":"","tablier":false,"n":9,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2021-01-24","location":"winamax","player":"Clément MARAVAL","place":6,"killer":"","tablier":false,"n":9,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2021-01-24","location":"winamax","player":"François CATTEAU","place":7,"killer":"","tablier":false,"n":9,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2021-01-24","location":"winamax","player":"Jérôme BERA","place":8,"killer":"","tablier":false,"n":9,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2021-01-24","location":"winamax","player":"Franck NAESSENS","place":9,"killer":"","tablier":false,"n":9,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":29,"date":"2021-01-29","location":"winamax","player":"Alexis Volant","place":1,"killer":"","tablier":false,"n":11,"points":34.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":29,"date":"2021-01-29","location":"winamax","player":"Jérôme BERA","place":2,"killer":"","tablier":false,"n":11,"points":28.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":29,"date":"2021-01-29","location":"winamax","player":"Clément MARAVAL","place":3,"killer":"","tablier":false,"n":11,"points":23.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":29,"date":"2021-01-29","location":"winamax","player":"Jérôme RIFFE","place":4,"killer":"","tablier":false,"n":11,"points":19.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":29,"date":"2021-01-29","location":"winamax","player":"Michel SCHERPEREEL","place":5,"killer":"","tablier":false,"n":11,"points":16.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":29,"date":"2021-01-29","location":"winamax","player":"Stéphane LEFIN","place":6,"killer":"","tablier":false,"n":11,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":29,"date":"2021-01-29","location":"winamax","player":"Thierry MONNIAUX","place":7,"killer":"","tablier":false,"n":11,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":29,"date":"2021-01-29","location":"winamax","player":"Olivier HENGUELLE","place":8,"killer":"","tablier":false,"n":11,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":29,"date":"2021-01-29","location":"winamax","player":"François CATTEAU","place":9,"killer":"","tablier":false,"n":11,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":29,"date":"2021-01-29","location":"winamax","player":"Franck NAESSENS","place":10,"killer":"","tablier":false,"n":11,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":29,"date":"2021-01-29","location":"winamax","player":"Areski AIT GHERBI","place":11,"killer":"","tablier":false,"n":11,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":30,"date":"2021-01-31","location":"winamax","player":"Alexis Volant","place":1,"killer":"","tablier":false,"n":9,"points":27.0,"stake":5,"gross":25,"net":20,"kills":0,"win":true,"podium":true},{"game":30,"date":"2021-01-31","location":"winamax","player":"Jérôme BERA","place":2,"killer":"","tablier":false,"n":9,"points":22.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":30,"date":"2021-01-31","location":"winamax","player":"Stéphane LEFIN","place":3,"killer":"","tablier":false,"n":9,"points":17.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":30,"date":"2021-01-31","location":"winamax","player":"Grégoire DUFORET","place":4,"killer":"","tablier":false,"n":9,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":30,"date":"2021-01-31","location":"winamax","player":"Olivier HENGUELLE","place":5,"killer":"","tablier":false,"n":9,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":30,"date":"2021-01-31","location":"winamax","player":"Clément MARAVAL","place":6,"killer":"","tablier":false,"n":9,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":30,"date":"2021-01-31","location":"winamax","player":"Franck NAESSENS","place":7,"killer":"","tablier":false,"n":9,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":30,"date":"2021-01-31","location":"winamax","player":"François CATTEAU","place":8,"killer":"","tablier":false,"n":9,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":30,"date":"2021-01-31","location":"winamax","player":"Areski AIT GHERBI","place":9,"killer":"","tablier":false,"n":9,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":31,"date":"2021-02-05","location":"winamax","player":"Jérôme BINOT","place":1,"killer":"","tablier":false,"n":12,"points":36.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":31,"date":"2021-02-05","location":"winamax","player":"Grégoire DUFORET","place":2,"killer":"","tablier":false,"n":12,"points":30.0,"stake":5,"gross":20,"net":15,"kills":0,"win":false,"podium":true},{"game":31,"date":"2021-02-05","location":"winamax","player":"Jérôme BERA","place":3,"killer":"","tablier":false,"n":12,"points":25.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":31,"date":"2021-02-05","location":"winamax","player":"Stéphane LEFIN","place":4,"killer":"","tablier":false,"n":12,"points":21.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":31,"date":"2021-02-05","location":"winamax","player":"Alexis Volant","place":5,"killer":"","tablier":false,"n":12,"points":18.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":31,"date":"2021-02-05","location":"winamax","player":"Jérémie CARPENTIER","place":6,"killer":"","tablier":false,"n":12,"points":15.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":31,"date":"2021-02-05","location":"winamax","player":"Franck NAESSENS","place":7,"killer":"","tablier":false,"n":12,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":31,"date":"2021-02-05","location":"winamax","player":"Philippe DUBOIS","place":8,"killer":"","tablier":false,"n":12,"points":9.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":31,"date":"2021-02-05","location":"winamax","player":"Clément MARAVAL","place":9,"killer":"","tablier":false,"n":12,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":31,"date":"2021-02-05","location":"winamax","player":"Olivier HENGUELLE","place":10,"killer":"","tablier":false,"n":12,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":31,"date":"2021-02-05","location":"winamax","player":"Jérôme RIFFE","place":11,"killer":"","tablier":false,"n":12,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":31,"date":"2021-02-05","location":"winamax","player":"François CATTEAU","place":12,"killer":"","tablier":false,"n":12,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":32,"date":"2021-02-08","location":"winamax","player":"Alexis Volant","place":1,"killer":"","tablier":false,"n":11,"points":34.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":32,"date":"2021-02-08","location":"winamax","player":"Franck NAESSENS","place":2,"killer":"","tablier":false,"n":11,"points":28.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":32,"date":"2021-02-08","location":"winamax","player":"François CATTEAU","place":3,"killer":"","tablier":false,"n":11,"points":23.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":32,"date":"2021-02-08","location":"winamax","player":"Thierry MONNIAUX","place":4,"killer":"","tablier":false,"n":11,"points":19.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":32,"date":"2021-02-08","location":"winamax","player":"Grégoire DUFORET","place":5,"killer":"","tablier":false,"n":11,"points":16.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":32,"date":"2021-02-08","location":"winamax","player":"Clément MARAVAL","place":6,"killer":"","tablier":false,"n":11,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":32,"date":"2021-02-08","location":"winamax","player":"Jérôme BERA","place":7,"killer":"","tablier":false,"n":11,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":32,"date":"2021-02-08","location":"winamax","player":"Stéphane LEFIN","place":8,"killer":"","tablier":false,"n":11,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":32,"date":"2021-02-08","location":"winamax","player":"Michel SCHERPEREEL","place":9,"killer":"","tablier":false,"n":11,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":32,"date":"2021-02-08","location":"winamax","player":"Areski AIT GHERBI","place":10,"killer":"","tablier":false,"n":11,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":32,"date":"2021-02-08","location":"winamax","player":"Olivier HENGUELLE","place":11,"killer":"","tablier":false,"n":11,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":33,"date":"2021-02-12","location":"winamax","player":"Alexis Volant","place":1,"killer":"","tablier":false,"n":11,"points":34.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":33,"date":"2021-02-12","location":"winamax","player":"Clément MARAVAL","place":2,"killer":"","tablier":false,"n":11,"points":28.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":33,"date":"2021-02-12","location":"winamax","player":"François CATTEAU","place":3,"killer":"","tablier":false,"n":11,"points":23.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":33,"date":"2021-02-12","location":"winamax","player":"Stéphane LEFIN","place":4,"killer":"","tablier":false,"n":11,"points":19.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":33,"date":"2021-02-12","location":"winamax","player":"Jérôme RIFFE","place":5,"killer":"","tablier":false,"n":11,"points":16.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":33,"date":"2021-02-12","location":"winamax","player":"Michel SCHERPEREEL","place":6,"killer":"","tablier":false,"n":11,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":33,"date":"2021-02-12","location":"winamax","player":"Jérôme BERA","place":7,"killer":"","tablier":false,"n":11,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":33,"date":"2021-02-12","location":"winamax","player":"Grégoire DUFORET","place":8,"killer":"","tablier":false,"n":11,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":33,"date":"2021-02-12","location":"winamax","player":"Jérôme BINOT","place":9,"killer":"","tablier":false,"n":11,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":33,"date":"2021-02-12","location":"winamax","player":"Philippe DUBOIS","place":10,"killer":"","tablier":false,"n":11,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":33,"date":"2021-02-12","location":"winamax","player":"Franck NAESSENS","place":11,"killer":"","tablier":false,"n":11,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":34,"date":"2021-02-14","location":"winamax","player":"Franck NAESSENS","place":1,"killer":"","tablier":false,"n":9,"points":27.0,"stake":5,"gross":25,"net":20,"kills":0,"win":true,"podium":true},{"game":34,"date":"2021-02-14","location":"winamax","player":"Jérôme BERA","place":2,"killer":"","tablier":false,"n":9,"points":22.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":34,"date":"2021-02-14","location":"winamax","player":"Stéphane LEFIN","place":3,"killer":"","tablier":false,"n":9,"points":17.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":34,"date":"2021-02-14","location":"winamax","player":"Alexis Volant","place":4,"killer":"","tablier":false,"n":9,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":34,"date":"2021-02-14","location":"winamax","player":"François CATTEAU","place":5,"killer":"","tablier":false,"n":9,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":34,"date":"2021-02-14","location":"winamax","player":"Michel SCHERPEREEL","place":6,"killer":"","tablier":false,"n":9,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":34,"date":"2021-02-14","location":"winamax","player":"Grégoire DUFORET","place":7,"killer":"","tablier":false,"n":9,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":34,"date":"2021-02-14","location":"winamax","player":"Clément MARAVAL","place":8,"killer":"","tablier":false,"n":9,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":34,"date":"2021-02-14","location":"winamax","player":"Thierry MONNIAUX","place":9,"killer":"","tablier":false,"n":9,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":35,"date":"2021-02-19","location":"winamax","player":"Areski AIT GHERBI","place":1,"killer":"","tablier":false,"n":11,"points":34.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":35,"date":"2021-02-19","location":"winamax","player":"François CATTEAU","place":2,"killer":"","tablier":false,"n":11,"points":28.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":35,"date":"2021-02-19","location":"winamax","player":"Gérard CANDELIER","place":3,"killer":"","tablier":false,"n":11,"points":23.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":35,"date":"2021-02-19","location":"winamax","player":"Franck NAESSENS","place":4,"killer":"","tablier":false,"n":11,"points":19.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":35,"date":"2021-02-19","location":"winamax","player":"Alexis Volant","place":5,"killer":"","tablier":false,"n":11,"points":16.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":35,"date":"2021-02-19","location":"winamax","player":"Clément MARAVAL","place":6,"killer":"","tablier":false,"n":11,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":35,"date":"2021-02-19","location":"winamax","player":"Jérôme RIFFE","place":7,"killer":"","tablier":false,"n":11,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":35,"date":"2021-02-19","location":"winamax","player":"Philippe DUBOIS","place":8,"killer":"","tablier":false,"n":11,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":35,"date":"2021-02-19","location":"winamax","player":"Thierry MONNIAUX","place":9,"killer":"","tablier":false,"n":11,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":35,"date":"2021-02-19","location":"winamax","player":"Jérôme BERA","place":10,"killer":"","tablier":false,"n":11,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":35,"date":"2021-02-19","location":"winamax","player":"Grégoire DUFORET","place":11,"killer":"","tablier":false,"n":11,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":36,"date":"2021-02-21","location":"winamax","player":"Grégoire DUFORET","place":1,"killer":"","tablier":false,"n":10,"points":32.0,"stake":5,"gross":30,"net":25,"kills":0,"win":true,"podium":true},{"game":36,"date":"2021-02-21","location":"winamax","player":"Areski AIT GHERBI","place":2,"killer":"","tablier":false,"n":10,"points":26.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":36,"date":"2021-02-21","location":"winamax","player":"Jérôme RIFFE","place":3,"killer":"","tablier":false,"n":10,"points":21.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":36,"date":"2021-02-21","location":"winamax","player":"Alexis Volant","place":4,"killer":"","tablier":false,"n":10,"points":17.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":36,"date":"2021-02-21","location":"winamax","player":"Jérôme BERA","place":5,"killer":"","tablier":false,"n":10,"points":14.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":36,"date":"2021-02-21","location":"winamax","player":"Stéphane LEFIN","place":6,"killer":"","tablier":false,"n":10,"points":11.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":36,"date":"2021-02-21","location":"winamax","player":"Clément MARAVAL","place":7,"killer":"","tablier":false,"n":10,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":36,"date":"2021-02-21","location":"winamax","player":"Thierry MONNIAUX","place":8,"killer":"","tablier":false,"n":10,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":36,"date":"2021-02-21","location":"winamax","player":"François CATTEAU","place":9,"killer":"","tablier":false,"n":10,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":36,"date":"2021-02-21","location":"winamax","player":"Franck NAESSENS","place":10,"killer":"","tablier":false,"n":10,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":37,"date":"2021-02-26","location":"winamax","player":"Alexis Volant","place":1,"killer":"","tablier":false,"n":11,"points":34.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":37,"date":"2021-02-26","location":"winamax","player":"Jérôme RIFFE","place":2,"killer":"","tablier":false,"n":11,"points":28.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":37,"date":"2021-02-26","location":"winamax","player":"Stéphane LEFIN","place":3,"killer":"","tablier":false,"n":11,"points":23.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":37,"date":"2021-02-26","location":"winamax","player":"Olivier HENGUELLE","place":4,"killer":"","tablier":false,"n":11,"points":19.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":37,"date":"2021-02-26","location":"winamax","player":"Franck NAESSENS","place":5,"killer":"","tablier":false,"n":11,"points":16.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":37,"date":"2021-02-26","location":"winamax","player":"Michel SCHERPEREEL","place":6,"killer":"","tablier":false,"n":11,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":37,"date":"2021-02-26","location":"winamax","player":"Jérôme BERA","place":7,"killer":"","tablier":false,"n":11,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":37,"date":"2021-02-26","location":"winamax","player":"Clément MARAVAL","place":8,"killer":"","tablier":false,"n":11,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":37,"date":"2021-02-26","location":"winamax","player":"Areski AIT GHERBI","place":9,"killer":"","tablier":false,"n":11,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":37,"date":"2021-02-26","location":"winamax","player":"François CATTEAU","place":10,"killer":"","tablier":false,"n":11,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":37,"date":"2021-02-26","location":"winamax","player":"Grégoire DUFORET","place":11,"killer":"","tablier":false,"n":11,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":38,"date":"2021-02-28","location":"winamax","player":"Stéphane LEFIN","place":1,"killer":"","tablier":false,"n":6,"points":16.0,"stake":5,"gross":20,"net":15,"kills":0,"win":true,"podium":true},{"game":38,"date":"2021-02-28","location":"winamax","player":"Olivier HENGUELLE","place":2,"killer":"","tablier":false,"n":6,"points":12.0,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":38,"date":"2021-02-28","location":"winamax","player":"François CATTEAU","place":3,"killer":"","tablier":false,"n":6,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":true},{"game":38,"date":"2021-02-28","location":"winamax","player":"Jérôme BERA","place":4,"killer":"","tablier":false,"n":6,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":38,"date":"2021-02-28","location":"winamax","player":"Franck NAESSENS","place":5,"killer":"","tablier":false,"n":6,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":38,"date":"2021-02-28","location":"winamax","player":"Alexis Volant","place":6,"killer":"","tablier":false,"n":6,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":39,"date":"2021-03-05","location":"winamax","player":"Olivier HENGUELLE","place":1,"killer":"","tablier":false,"n":10,"points":32.0,"stake":5,"gross":30,"net":25,"kills":0,"win":true,"podium":true},{"game":39,"date":"2021-03-05","location":"winamax","player":"Clément MARAVAL","place":2,"killer":"","tablier":false,"n":10,"points":26.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":39,"date":"2021-03-05","location":"winamax","player":"Areski AIT GHERBI","place":3,"killer":"","tablier":false,"n":10,"points":21.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":39,"date":"2021-03-05","location":"winamax","player":"Alexis Volant","place":4,"killer":"","tablier":false,"n":10,"points":17.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":39,"date":"2021-03-05","location":"winamax","player":"Stéphane LEFIN","place":5,"killer":"","tablier":false,"n":10,"points":14.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":39,"date":"2021-03-05","location":"winamax","player":"Grégoire DUFORET","place":6,"killer":"","tablier":false,"n":10,"points":11.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":39,"date":"2021-03-05","location":"winamax","player":"Franck NAESSENS","place":7,"killer":"","tablier":false,"n":10,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":39,"date":"2021-03-05","location":"winamax","player":"François CATTEAU","place":8,"killer":"","tablier":false,"n":10,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":39,"date":"2021-03-05","location":"winamax","player":"Jérôme RIFFE","place":9,"killer":"","tablier":false,"n":10,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":39,"date":"2021-03-05","location":"winamax","player":"Jérôme BERA","place":10,"killer":"","tablier":false,"n":10,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":40,"date":"2021-03-07","location":"winamax","player":"Franck NAESSENS","place":1,"killer":"","tablier":false,"n":8,"points":23.0,"stake":5,"gross":25,"net":20,"kills":0,"win":true,"podium":true},{"game":40,"date":"2021-03-07","location":"winamax","player":"Stéphane LEFIN","place":2,"killer":"","tablier":false,"n":8,"points":18.0,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":40,"date":"2021-03-07","location":"winamax","player":"Grégoire DUFORET","place":3,"killer":"","tablier":false,"n":8,"points":14.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":40,"date":"2021-03-07","location":"winamax","player":"François CATTEAU","place":4,"killer":"","tablier":false,"n":8,"points":11.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":40,"date":"2021-03-07","location":"winamax","player":"Michel SCHERPEREEL","place":5,"killer":"","tablier":false,"n":8,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":40,"date":"2021-03-07","location":"winamax","player":"Thierry MONNIAUX","place":6,"killer":"","tablier":false,"n":8,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":40,"date":"2021-03-07","location":"winamax","player":"Olivier HENGUELLE","place":7,"killer":"","tablier":false,"n":8,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":40,"date":"2021-03-07","location":"winamax","player":"Alexis Volant","place":8,"killer":"","tablier":false,"n":8,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":41,"date":"2021-03-12","location":"winamax","player":"Jérôme RIFFE","place":1,"killer":"","tablier":false,"n":12,"points":36.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":41,"date":"2021-03-12","location":"winamax","player":"Grégoire DUFORET","place":2,"killer":"","tablier":false,"n":12,"points":30.0,"stake":5,"gross":20,"net":15,"kills":0,"win":false,"podium":true},{"game":41,"date":"2021-03-12","location":"winamax","player":"Alexis Volant","place":3,"killer":"","tablier":false,"n":12,"points":25.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":41,"date":"2021-03-12","location":"winamax","player":"Stéphane LEFIN","place":4,"killer":"","tablier":false,"n":12,"points":21.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":41,"date":"2021-03-12","location":"winamax","player":"Clément MARAVAL","place":5,"killer":"","tablier":false,"n":12,"points":18.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":41,"date":"2021-03-12","location":"winamax","player":"Franck NAESSENS","place":6,"killer":"","tablier":false,"n":12,"points":15.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":41,"date":"2021-03-12","location":"winamax","player":"François CATTEAU","place":7,"killer":"","tablier":false,"n":12,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":41,"date":"2021-03-12","location":"winamax","player":"Jérôme BINOT","place":8,"killer":"","tablier":false,"n":12,"points":9.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":41,"date":"2021-03-12","location":"winamax","player":"Olivier HENGUELLE","place":9,"killer":"","tablier":false,"n":12,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":41,"date":"2021-03-12","location":"winamax","player":"Philippe DUBOIS","place":10,"killer":"","tablier":false,"n":12,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":41,"date":"2021-03-12","location":"winamax","player":"Jérôme BERA","place":11,"killer":"","tablier":false,"n":12,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":41,"date":"2021-03-12","location":"winamax","player":"Thierry MONNIAUX","place":12,"killer":"","tablier":false,"n":12,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":42,"date":"2021-03-14","location":"winamax","player":"Alexis Volant","place":1,"killer":"","tablier":false,"n":8,"points":23.0,"stake":5,"gross":25,"net":20,"kills":0,"win":true,"podium":true},{"game":42,"date":"2021-03-14","location":"winamax","player":"Jérôme BERA","place":2,"killer":"","tablier":false,"n":8,"points":18.0,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":42,"date":"2021-03-14","location":"winamax","player":"Anne BERA","place":3,"killer":"","tablier":false,"n":8,"points":14.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":42,"date":"2021-03-14","location":"winamax","player":"Grégoire DUFORET","place":4,"killer":"","tablier":false,"n":8,"points":11.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":42,"date":"2021-03-14","location":"winamax","player":"Stéphane LEFIN","place":5,"killer":"","tablier":false,"n":8,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":42,"date":"2021-03-14","location":"winamax","player":"Michel SCHERPEREEL","place":6,"killer":"","tablier":false,"n":8,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":42,"date":"2021-03-14","location":"winamax","player":"François CATTEAU","place":7,"killer":"","tablier":false,"n":8,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":42,"date":"2021-03-14","location":"winamax","player":"Franck NAESSENS","place":8,"killer":"","tablier":false,"n":8,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":43,"date":"2021-03-19","location":"winamax","player":"Jérôme BINOT","place":1,"killer":"","tablier":false,"n":15,"points":40.0,"stake":5,"gross":45,"net":40,"kills":0,"win":true,"podium":true},{"game":43,"date":"2021-03-19","location":"winamax","player":"Alexis Volant","place":2,"killer":"","tablier":false,"n":15,"points":34.0,"stake":5,"gross":20,"net":15,"kills":0,"win":false,"podium":true},{"game":43,"date":"2021-03-19","location":"winamax","player":"Jérémie CARPENTIER","place":3,"killer":"","tablier":false,"n":15,"points":29.0,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":43,"date":"2021-03-19","location":"winamax","player":"Jérôme BERA","place":4,"killer":"","tablier":false,"n":15,"points":25.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":43,"date":"2021-03-19","location":"winamax","player":"Clément MARAVAL","place":5,"killer":"","tablier":false,"n":15,"points":22.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":43,"date":"2021-03-19","location":"winamax","player":"Stéphane LEFIN","place":6,"killer":"","tablier":false,"n":15,"points":19.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":43,"date":"2021-03-19","location":"winamax","player":"Philippe DUBOIS","place":7,"killer":"","tablier":false,"n":15,"points":16.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":43,"date":"2021-03-19","location":"winamax","player":"Michel SCHERPEREEL","place":8,"killer":"","tablier":false,"n":15,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":43,"date":"2021-03-19","location":"winamax","player":"Grégoire DUFORET","place":9,"killer":"","tablier":false,"n":15,"points":11.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":43,"date":"2021-03-19","location":"winamax","player":"François CATTEAU","place":10,"killer":"","tablier":false,"n":15,"points":9.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":43,"date":"2021-03-19","location":"winamax","player":"Franck NAESSENS","place":11,"killer":"","tablier":false,"n":15,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":43,"date":"2021-03-19","location":"winamax","player":"Jérôme RIFFE","place":12,"killer":"","tablier":false,"n":15,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":43,"date":"2021-03-19","location":"winamax","player":"Areski AIT GHERBI","place":13,"killer":"","tablier":false,"n":15,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":43,"date":"2021-03-19","location":"winamax","player":"Anne BERA","place":14,"killer":"","tablier":false,"n":15,"points":2.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":43,"date":"2021-03-19","location":"winamax","player":"Olivier HENGUELLE","place":15,"killer":"","tablier":false,"n":15,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":44,"date":"2021-03-22","location":"winanax","player":"Areski AIT GHERBI","place":1,"killer":"","tablier":false,"n":9,"points":27.0,"stake":5,"gross":25,"net":20,"kills":0,"win":true,"podium":true},{"game":44,"date":"2021-03-22","location":"winanax","player":"Franck NAESSENS","place":2,"killer":"","tablier":false,"n":9,"points":22.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":44,"date":"2021-03-22","location":"winanax","player":"Grégoire DUFORET","place":3,"killer":"","tablier":false,"n":9,"points":17.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":44,"date":"2021-03-22","location":"winanax","player":"Anne BERA","place":4,"killer":"","tablier":false,"n":9,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":44,"date":"2021-03-22","location":"winanax","player":"Jérôme BERA","place":5,"killer":"","tablier":false,"n":9,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":44,"date":"2021-03-22","location":"winanax","player":"Stéphane LEFIN","place":6,"killer":"","tablier":false,"n":9,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":44,"date":"2021-03-22","location":"winanax","player":"Alexis Volant","place":7,"killer":"","tablier":false,"n":9,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":44,"date":"2021-03-22","location":"winanax","player":"Solène BALLOIS","place":8,"killer":"","tablier":false,"n":9,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":44,"date":"2021-03-22","location":"winanax","player":"François CATTEAU","place":9,"killer":"","tablier":false,"n":9,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":45,"date":"2021-03-26","location":"winanax","player":"Olivier HENGUELLE","place":1,"killer":"","tablier":false,"n":11,"points":34.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":45,"date":"2021-03-26","location":"winanax","player":"Thierry MONNIAUX","place":2,"killer":"","tablier":false,"n":11,"points":28.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":45,"date":"2021-03-26","location":"winanax","player":"Jérémie CARPENTIER","place":3,"killer":"","tablier":false,"n":11,"points":23.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":45,"date":"2021-03-26","location":"winanax","player":"Alexis Volant","place":4,"killer":"","tablier":false,"n":11,"points":19.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":45,"date":"2021-03-26","location":"winanax","player":"Jérôme BERA","place":5,"killer":"","tablier":false,"n":11,"points":16.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":45,"date":"2021-03-26","location":"winanax","player":"Clément MARAVAL","place":6,"killer":"","tablier":false,"n":11,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":45,"date":"2021-03-26","location":"winanax","player":"Grégoire DUFORET","place":7,"killer":"","tablier":false,"n":11,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":45,"date":"2021-03-26","location":"winanax","player":"Jérôme RIFFE","place":8,"killer":"","tablier":false,"n":11,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":45,"date":"2021-03-26","location":"winanax","player":"Stéphane LEFIN","place":9,"killer":"","tablier":false,"n":11,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":45,"date":"2021-03-26","location":"winanax","player":"Franck NAESSENS","place":10,"killer":"","tablier":false,"n":11,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":45,"date":"2021-03-26","location":"winanax","player":"Areski AIT GHERBI","place":11,"killer":"","tablier":false,"n":11,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":46,"date":"2021-03-28","location":"winanax","player":"Olivier HENGUELLE","place":1,"killer":"","tablier":false,"n":11,"points":34.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":46,"date":"2021-03-28","location":"winanax","player":"Anne BERA","place":2,"killer":"","tablier":false,"n":11,"points":28.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":46,"date":"2021-03-28","location":"winanax","player":"Clément MARAVAL","place":3,"killer":"","tablier":false,"n":11,"points":23.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":46,"date":"2021-03-28","location":"winanax","player":"Jérémie CARPENTIER","place":4,"killer":"","tablier":false,"n":11,"points":19.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":46,"date":"2021-03-28","location":"winanax","player":"Stéphane LEFIN","place":5,"killer":"","tablier":false,"n":11,"points":16.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":46,"date":"2021-03-28","location":"winanax","player":"Jérôme BERA","place":6,"killer":"","tablier":false,"n":11,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":46,"date":"2021-03-28","location":"winanax","player":"François CATTEAU","place":7,"killer":"","tablier":false,"n":11,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":46,"date":"2021-03-28","location":"winanax","player":"Thierry MONNIAUX","place":8,"killer":"","tablier":false,"n":11,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":46,"date":"2021-03-28","location":"winanax","player":"Areski AIT GHERBI","place":9,"killer":"","tablier":false,"n":11,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":46,"date":"2021-03-28","location":"winanax","player":"Franck NAESSENS","place":10,"killer":"","tablier":false,"n":11,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":46,"date":"2021-03-28","location":"winanax","player":"Grégoire DUFORET","place":11,"killer":"","tablier":false,"n":11,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false}];
const ARCHIVE_2022_2023=[{"game":1,"date":"2022-09-02","location":"Alexis","player":"Solène BALLOIS","place":1,"killer":"","tablier":false,"n":10,"points":32.0,"stake":5,"gross":30,"net":25,"kills":0,"win":true,"podium":true},{"game":1,"date":"2022-09-02","location":"Alexis","player":"Jérôme BERA","place":2,"killer":"","tablier":false,"n":10,"points":26.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":1,"date":"2022-09-02","location":"Alexis","player":"François CATTEAU","place":3,"killer":"","tablier":false,"n":10,"points":21.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":1,"date":"2022-09-02","location":"Alexis","player":"Michel SCHERPEREEL","place":4,"killer":"","tablier":false,"n":10,"points":17.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2022-09-02","location":"Alexis","player":"Jérôme BINOT","place":5,"killer":"","tablier":false,"n":10,"points":14.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2022-09-02","location":"Alexis","player":"Jérémie CARPENTIER","place":6,"killer":"","tablier":false,"n":10,"points":11.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2022-09-02","location":"Alexis","player":"Jérémy COQUEL","place":7,"killer":"","tablier":false,"n":10,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2022-09-02","location":"Alexis","player":"Franck NAESSENS","place":8,"killer":"","tablier":false,"n":10,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2022-09-02","location":"Alexis","player":"Recave","place":9,"killer":"","tablier":false,"n":10,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2022-09-02","location":"Alexis","player":"Alexis Volant","place":10,"killer":"","tablier":false,"n":10,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2022-09-09","location":"areski","player":"Franck NAESSENS","place":1,"killer":"","tablier":false,"n":10,"points":32.0,"stake":5,"gross":30,"net":25,"kills":0,"win":true,"podium":true},{"game":2,"date":"2022-09-09","location":"areski","player":"Michel SCHERPEREEL","place":2,"killer":"","tablier":false,"n":10,"points":26.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":2,"date":"2022-09-09","location":"areski","player":"Jérôme BERA","place":3,"killer":"","tablier":false,"n":10,"points":21.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":2,"date":"2022-09-09","location":"areski","player":"Jérémy COQUEL","place":4,"killer":"","tablier":false,"n":10,"points":17.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2022-09-09","location":"areski","player":"Clément MARAVAL","place":5,"killer":"","tablier":false,"n":10,"points":14.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2022-09-09","location":"areski","player":"Stéphane LEFIN","place":6,"killer":"","tablier":false,"n":10,"points":11.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2022-09-09","location":"areski","player":"Jérôme RIFFE","place":7,"killer":"","tablier":false,"n":10,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2022-09-09","location":"areski","player":"Areski AIT GHERBI","place":8,"killer":"","tablier":false,"n":10,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2022-09-09","location":"areski","player":"François CATTEAU","place":9,"killer":"","tablier":false,"n":10,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2022-09-09","location":"areski","player":"Mehdi BRAHIMI","place":10,"killer":"","tablier":false,"n":10,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2022-09-16","location":"superman","player":"Franck NAESSENS","place":1,"killer":"","tablier":false,"n":10,"points":32.0,"stake":5,"gross":30,"net":25,"kills":0,"win":true,"podium":true},{"game":3,"date":"2022-09-16","location":"superman","player":"Jérémy COQUEL","place":2,"killer":"","tablier":false,"n":10,"points":26.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":3,"date":"2022-09-16","location":"superman","player":"Alexis Volant","place":3,"killer":"","tablier":false,"n":10,"points":21.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":3,"date":"2022-09-16","location":"superman","player":"Jérémie CARPENTIER","place":4,"killer":"","tablier":false,"n":10,"points":17.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2022-09-16","location":"superman","player":"Olivier HENGUELLE","place":5,"killer":"","tablier":false,"n":10,"points":14.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2022-09-16","location":"superman","player":"Jérôme BERA","place":6,"killer":"","tablier":false,"n":10,"points":11.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2022-09-16","location":"superman","player":"Thierry MONNIAUX","place":7,"killer":"","tablier":false,"n":10,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2022-09-16","location":"superman","player":"Solène BALLOIS","place":8,"killer":"","tablier":false,"n":10,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2022-09-16","location":"superman","player":"Areski AIT GHERBI","place":9,"killer":"","tablier":false,"n":10,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2022-09-16","location":"superman","player":"Michel SCHERPEREEL","place":10,"killer":"","tablier":false,"n":10,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2022-11-04","location":"François","player":"Alexis Volant","place":1,"killer":"","tablier":false,"n":10,"points":32.0,"stake":5,"gross":30,"net":25,"kills":0,"win":true,"podium":true},{"game":9,"date":"2022-11-04","location":"François","player":"Jérôme BERA","place":2,"killer":"","tablier":false,"n":10,"points":26.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":9,"date":"2022-11-04","location":"François","player":"joueur occasionnel 3","place":3,"killer":"","tablier":false,"n":10,"points":21.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":9,"date":"2022-11-04","location":"François","player":"Jérôme BINOT","place":4,"killer":"","tablier":false,"n":10,"points":17.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2022-11-04","location":"François","player":"Ophelie","place":5,"killer":"","tablier":false,"n":10,"points":14.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2022-11-04","location":"François","player":"Jérémy COQUEL","place":6,"killer":"","tablier":false,"n":10,"points":11.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2022-11-04","location":"François","player":"Franck NAESSENS","place":7,"killer":"","tablier":false,"n":10,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2022-11-04","location":"François","player":"David SAGALOWICZ","place":8,"killer":"","tablier":false,"n":10,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2022-11-04","location":"François","player":"joueur occasionnel 6","place":9,"killer":"","tablier":false,"n":10,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2022-11-04","location":"François","player":"François CATTEAU","place":10,"killer":"","tablier":false,"n":10,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2022-11-11","location":"Tchobin","player":"Solène BALLOIS","place":1,"killer":"","tablier":false,"n":16,"points":41.0,"stake":5,"gross":50,"net":45,"kills":0,"win":true,"podium":true},{"game":10,"date":"2022-11-11","location":"Tchobin","player":"Juliette HENGUELLE","place":2,"killer":"","tablier":false,"n":16,"points":35.0,"stake":5,"gross":25,"net":20,"kills":0,"win":false,"podium":true},{"game":10,"date":"2022-11-11","location":"Tchobin","player":"Ophelie","place":3,"killer":"","tablier":false,"n":16,"points":30.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":10,"date":"2022-11-11","location":"Tchobin","player":"Philippe DUBOIS","place":4,"killer":"","tablier":false,"n":16,"points":26.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2022-11-11","location":"Tchobin","player":"Jérémy COQUEL","place":5,"killer":"","tablier":false,"n":16,"points":23.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2022-11-11","location":"Tchobin","player":"Jérôme BINOT","place":6,"killer":"","tablier":false,"n":16,"points":20.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2022-11-11","location":"Tchobin","player":"Jérémie CARPENTIER","place":7,"killer":"","tablier":false,"n":16,"points":17.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2022-11-11","location":"Tchobin","player":"Hélène MORIZUR","place":8,"killer":"","tablier":false,"n":16,"points":14.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2022-11-11","location":"Tchobin","player":"Olivier HENGUELLE","place":9,"killer":"","tablier":false,"n":16,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2022-11-11","location":"Tchobin","player":"Mélanie BINOT","place":10,"killer":"","tablier":false,"n":16,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2022-11-11","location":"Tchobin","player":"Thierry MONNIAUX","place":11,"killer":"","tablier":false,"n":16,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2022-11-11","location":"Tchobin","player":"Jérôme BERA","place":12,"killer":"","tablier":false,"n":16,"points":6.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2022-11-11","location":"Tchobin","player":"François CATTEAU","place":13,"killer":"","tablier":false,"n":16,"points":4.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2022-11-11","location":"Tchobin","player":"Mehdi BRAHIMI","place":14,"killer":"","tablier":false,"n":16,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2022-11-11","location":"Tchobin","player":"Gérard CANDELIER","place":15,"killer":"","tablier":false,"n":16,"points":2.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2022-11-11","location":"Tchobin","player":"Alexis Volant","place":16,"killer":"","tablier":false,"n":16,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2022-11-11","location":"Malmo","player":"Stéphane LEFIN","place":1,"killer":"","tablier":false,"n":7,"points":19.0,"stake":5,"gross":20,"net":15,"kills":0,"win":true,"podium":true},{"game":11,"date":"2022-11-11","location":"Malmo","player":"Franck NAESSENS","place":2,"killer":"","tablier":false,"n":7,"points":15.0,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":11,"date":"2022-11-11","location":"Malmo","player":"Jérôme RIFFE","place":3,"killer":"","tablier":false,"n":7,"points":11.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":11,"date":"2022-11-11","location":"Malmo","player":"David SAGALOWICZ","place":4,"killer":"","tablier":false,"n":7,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2022-11-11","location":"Malmo","player":"Clément MARAVAL","place":5,"killer":"","tablier":false,"n":7,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2022-11-11","location":"Malmo","player":"Michel SCHERPEREEL","place":6,"killer":"","tablier":false,"n":7,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2022-11-11","location":"Malmo","player":"Grégoire DUFORET","place":7,"killer":"","tablier":false,"n":7,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2022-11-18","location":"Alexis","player":"François CATTEAU","place":1,"killer":"","tablier":false,"n":7,"points":19.0,"stake":5,"gross":20,"net":15,"kills":0,"win":true,"podium":true},{"game":12,"date":"2022-11-18","location":"Alexis","player":"Solène BALLOIS","place":2,"killer":"","tablier":false,"n":7,"points":15.0,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":12,"date":"2022-11-18","location":"Alexis","player":"Jérôme BERA","place":3,"killer":"","tablier":false,"n":7,"points":11.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":12,"date":"2022-11-18","location":"Alexis","player":"Michel SCHERPEREEL","place":4,"killer":"","tablier":false,"n":7,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2022-11-18","location":"Alexis","player":"Alexis Volant","place":5,"killer":"","tablier":false,"n":7,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2022-11-18","location":"Alexis","player":"Franck NAESSENS","place":6,"killer":"","tablier":false,"n":7,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2022-11-18","location":"Alexis","player":"Areski AIT GHERBI","place":7,"killer":"","tablier":false,"n":7,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2022-11-25","location":"mig","player":"Michel SCHERPEREEL","place":1,"killer":"","tablier":false,"n":7,"points":19.0,"stake":5,"gross":20,"net":15,"kills":0,"win":true,"podium":true},{"game":13,"date":"2022-11-25","location":"mig","player":"Areski AIT GHERBI","place":2,"killer":"","tablier":false,"n":7,"points":15.0,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":13,"date":"2022-11-25","location":"mig","player":"Solène BALLOIS","place":3,"killer":"","tablier":false,"n":7,"points":11.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":13,"date":"2022-11-25","location":"mig","player":"Jérôme BINOT","place":4,"killer":"","tablier":false,"n":7,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2022-11-25","location":"mig","player":"Alexis Volant","place":5,"killer":"","tablier":false,"n":7,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2022-11-25","location":"mig","player":"Jérôme RIFFE","place":6,"killer":"","tablier":false,"n":7,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2022-11-25","location":"mig","player":"Olivier HENGUELLE","place":7,"killer":"","tablier":false,"n":7,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2022-12-03","location":"Areski ","player":"Thierry MONNIAUX","place":1,"killer":"","tablier":false,"n":8,"points":23.0,"stake":5,"gross":25,"net":20,"kills":0,"win":true,"podium":true},{"game":14,"date":"2022-12-03","location":"Areski ","player":"Jérôme RIFFE","place":2,"killer":"","tablier":false,"n":8,"points":18.0,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":14,"date":"2022-12-03","location":"Areski ","player":"Areski AIT GHERBI","place":3,"killer":"","tablier":false,"n":8,"points":14.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":14,"date":"2022-12-03","location":"Areski ","player":"Franck NAESSENS","place":4,"killer":"","tablier":false,"n":8,"points":11.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2022-12-03","location":"Areski ","player":"François CATTEAU","place":5,"killer":"","tablier":false,"n":8,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2022-12-03","location":"Areski ","player":"Jérôme BERA","place":6,"killer":"","tablier":false,"n":8,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2022-12-03","location":"Areski ","player":"Michel SCHERPEREEL","place":7,"killer":"","tablier":false,"n":8,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2022-12-03","location":"Areski ","player":"Alexis Volant","place":8,"killer":"","tablier":false,"n":8,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2022-12-09","location":"MEHDI EL ESPANOL","player":"Olivier HENGUELLE","place":1,"killer":"","tablier":false,"n":7,"points":19.0,"stake":5,"gross":20,"net":15,"kills":0,"win":true,"podium":true},{"game":15,"date":"2022-12-09","location":"MEHDI EL ESPANOL","player":"Mehdi BRAHIMI","place":2,"killer":"","tablier":false,"n":7,"points":15.0,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":15,"date":"2022-12-09","location":"MEHDI EL ESPANOL","player":"Stéphane ROBERT","place":3,"killer":"","tablier":false,"n":7,"points":11.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":15,"date":"2022-12-09","location":"MEHDI EL ESPANOL","player":"David SAGALOWICZ","place":4,"killer":"","tablier":false,"n":7,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2022-12-09","location":"MEHDI EL ESPANOL","player":"Franck NAESSENS","place":5,"killer":"","tablier":false,"n":7,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2022-12-09","location":"MEHDI EL ESPANOL","player":"Jérôme BINOT","place":6,"killer":"","tablier":false,"n":7,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2022-12-09","location":"MEHDI EL ESPANOL","player":"Areski AIT GHERBI","place":7,"killer":"","tablier":false,"n":7,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2022-12-16","location":"alexis","player":"Mehdi BRAHIMI","place":1,"killer":"","tablier":false,"n":11,"points":34.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":16,"date":"2022-12-16","location":"alexis","player":"Areski AIT GHERBI","place":2,"killer":"","tablier":false,"n":11,"points":28.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":16,"date":"2022-12-16","location":"alexis","player":"Alexis Volant","place":3,"killer":"","tablier":false,"n":11,"points":23.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":16,"date":"2022-12-16","location":"alexis","player":"Clément MARAVAL","place":4,"killer":"","tablier":false,"n":11,"points":19.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2022-12-16","location":"alexis","player":"Thierry MONNIAUX","place":5,"killer":"","tablier":false,"n":11,"points":16.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2022-12-16","location":"alexis","player":"Stéphane LEFIN","place":6,"killer":"","tablier":false,"n":11,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2022-12-16","location":"alexis","player":"Jérôme RIFFE","place":7,"killer":"","tablier":false,"n":11,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2022-12-16","location":"alexis","player":"Jérémie CARPENTIER","place":8,"killer":"","tablier":false,"n":11,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2022-12-16","location":"alexis","player":"Jérôme BERA","place":9,"killer":"","tablier":false,"n":11,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2022-12-16","location":"alexis","player":"Franck NAESSENS","place":10,"killer":"","tablier":false,"n":11,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2022-12-16","location":"alexis","player":"Solène BALLOIS","place":11,"killer":"","tablier":false,"n":11,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2023-01-06","location":"alexis","player":"Jérôme RIFFE","place":1,"killer":"","tablier":false,"n":11,"points":34.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":17,"date":"2023-01-06","location":"alexis","player":"Franck NAESSENS","place":2,"killer":"","tablier":false,"n":11,"points":28.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":17,"date":"2023-01-06","location":"alexis","player":"Solène BALLOIS","place":3,"killer":"","tablier":false,"n":11,"points":23.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":17,"date":"2023-01-06","location":"alexis","player":"Jérôme BERA","place":4,"killer":"","tablier":false,"n":11,"points":19.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2023-01-06","location":"alexis","player":"Michel SCHERPEREEL","place":5,"killer":"","tablier":false,"n":11,"points":16.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2023-01-06","location":"alexis","player":"Jérémy COQUEL","place":6,"killer":"","tablier":false,"n":11,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2023-01-06","location":"alexis","player":"Stéphane LEFIN","place":7,"killer":"","tablier":false,"n":11,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2023-01-06","location":"alexis","player":"Areski AIT GHERBI","place":8,"killer":"","tablier":false,"n":11,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2023-01-06","location":"alexis","player":"Alexis Volant","place":9,"killer":"","tablier":false,"n":11,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2023-01-06","location":"alexis","player":"Jérôme BINOT","place":10,"killer":"","tablier":false,"n":11,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2023-01-06","location":"alexis","player":"François CATTEAU","place":11,"killer":"","tablier":false,"n":11,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2023-01-13","location":"gg riffe","player":"Jérôme BERA","place":1,"killer":"","tablier":false,"n":9,"points":27.0,"stake":5,"gross":25,"net":20,"kills":0,"win":true,"podium":true},{"game":18,"date":"2023-01-13","location":"gg riffe","player":"Jérôme RIFFE","place":2,"killer":"","tablier":false,"n":9,"points":22.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":18,"date":"2023-01-13","location":"gg riffe","player":"Jérôme BINOT","place":3,"killer":"","tablier":false,"n":9,"points":17.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":18,"date":"2023-01-13","location":"gg riffe","player":"François CATTEAU","place":4,"killer":"","tablier":false,"n":9,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2023-01-13","location":"gg riffe","player":"Alexis Volant","place":5,"killer":"","tablier":false,"n":9,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2023-01-13","location":"gg riffe","player":"Mehdi BRAHIMI","place":6,"killer":"","tablier":false,"n":9,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2023-01-13","location":"gg riffe","player":"Michel SCHERPEREEL","place":7,"killer":"","tablier":false,"n":9,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2023-01-13","location":"gg riffe","player":"Thierry MONNIAUX","place":8,"killer":"","tablier":false,"n":9,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2023-01-13","location":"gg riffe","player":"Franck NAESSENS","place":9,"killer":"","tablier":false,"n":9,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2023-01-20","location":"françois","player":"joueur occasionnel 7","place":1,"killer":"","tablier":false,"n":14,"points":39.0,"stake":5,"gross":40,"net":35,"kills":0,"win":true,"podium":true},{"game":19,"date":"2023-01-20","location":"françois","player":"Michel SCHERPEREEL","place":2,"killer":"","tablier":false,"n":14,"points":33.0,"stake":5,"gross":20,"net":15,"kills":0,"win":false,"podium":true},{"game":19,"date":"2023-01-20","location":"françois","player":"Stéphane LEFIN","place":3,"killer":"","tablier":false,"n":14,"points":28.0,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":19,"date":"2023-01-20","location":"françois","player":"Jérémie CARPENTIER","place":4,"killer":"","tablier":false,"n":14,"points":24.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2023-01-20","location":"françois","player":"Mehdi BRAHIMI","place":5,"killer":"","tablier":false,"n":14,"points":21.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2023-01-20","location":"françois","player":"François CATTEAU","place":6,"killer":"","tablier":false,"n":14,"points":18.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2023-01-20","location":"françois","player":"Jérémy COQUEL","place":7,"killer":"","tablier":false,"n":14,"points":15.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2023-01-20","location":"françois","player":"Alexis Volant","place":8,"killer":"","tablier":false,"n":14,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2023-01-20","location":"françois","player":"David SAGALOWICZ","place":9,"killer":"","tablier":false,"n":14,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2023-01-20","location":"françois","player":"Jérôme RIFFE","place":10,"killer":"","tablier":false,"n":14,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2023-01-20","location":"françois","player":"Franck NAESSENS","place":11,"killer":"","tablier":false,"n":14,"points":6.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2023-01-20","location":"françois","player":"Jérôme BINOT","place":12,"killer":"","tablier":false,"n":14,"points":4.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2023-01-20","location":"françois","player":"Areski AIT GHERBI","place":13,"killer":"","tablier":false,"n":14,"points":2.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2023-01-20","location":"françois","player":"Jérôme BERA","place":14,"killer":"","tablier":false,"n":14,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2023-01-27","location":"alexis","player":"Mehdi BRAHIMI","place":1,"killer":"","tablier":false,"n":11,"points":34.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":20,"date":"2023-01-27","location":"alexis","player":"Franck NAESSENS","place":2,"killer":"","tablier":false,"n":11,"points":28.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":20,"date":"2023-01-27","location":"alexis","player":"Michel SCHERPEREEL","place":3,"killer":"","tablier":false,"n":11,"points":23.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":20,"date":"2023-01-27","location":"alexis","player":"Olivier HENGUELLE","place":4,"killer":"","tablier":false,"n":11,"points":19.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2023-01-27","location":"alexis","player":"Stéphane LEFIN","place":5,"killer":"","tablier":false,"n":11,"points":16.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2023-01-27","location":"alexis","player":"Jérôme BERA","place":6,"killer":"","tablier":false,"n":11,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2023-01-27","location":"alexis","player":"Solène BALLOIS","place":7,"killer":"","tablier":false,"n":11,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2023-01-27","location":"alexis","player":"François CATTEAU","place":8,"killer":"","tablier":false,"n":11,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2023-01-27","location":"alexis","player":"David SAGALOWICZ","place":9,"killer":"","tablier":false,"n":11,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2023-01-27","location":"alexis","player":"Alexis Volant","place":10,"killer":"","tablier":false,"n":11,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2023-01-27","location":"alexis","player":"Jérôme BINOT","place":11,"killer":"","tablier":false,"n":11,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2023-02-03","location":"ARESKI","player":"Thierry MONNIAUX","place":1,"killer":"","tablier":false,"n":11,"points":34.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":21,"date":"2023-02-03","location":"ARESKI","player":"Franck NAESSENS","place":2,"killer":"","tablier":false,"n":11,"points":28.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":21,"date":"2023-02-03","location":"ARESKI","player":"Alexis Volant","place":3,"killer":"","tablier":false,"n":11,"points":23.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":21,"date":"2023-02-03","location":"ARESKI","player":"Solène BALLOIS","place":4,"killer":"","tablier":false,"n":11,"points":19.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2023-02-03","location":"ARESKI","player":"Jérémy COQUEL","place":5,"killer":"","tablier":false,"n":11,"points":16.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2023-02-03","location":"ARESKI","player":"Mehdi BRAHIMI","place":6,"killer":"","tablier":false,"n":11,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2023-02-03","location":"ARESKI","player":"Jérôme RIFFE","place":7,"killer":"","tablier":false,"n":11,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2023-02-03","location":"ARESKI","player":"Stéphane ROBERT","place":8,"killer":"","tablier":false,"n":11,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2023-02-03","location":"ARESKI","player":"François CATTEAU","place":9,"killer":"","tablier":false,"n":11,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2023-02-03","location":"ARESKI","player":"Grégoire DUFORET","place":10,"killer":"","tablier":false,"n":11,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2023-02-03","location":"ARESKI","player":"Areski AIT GHERBI","place":11,"killer":"","tablier":false,"n":11,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2023-02-10","location":"mehdi","player":"Franck NAESSENS","place":1,"killer":"","tablier":false,"n":8,"points":23.0,"stake":5,"gross":25,"net":20,"kills":0,"win":true,"podium":true},{"game":22,"date":"2023-02-10","location":"mehdi","player":"Jérôme RIFFE","place":2,"killer":"","tablier":false,"n":8,"points":18.0,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":22,"date":"2023-02-10","location":"mehdi","player":"Stéphane LEFIN","place":3,"killer":"","tablier":false,"n":8,"points":14.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":22,"date":"2023-02-10","location":"mehdi","player":"Jérôme BERA","place":4,"killer":"","tablier":false,"n":8,"points":11.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2023-02-10","location":"mehdi","player":"Mehdi BRAHIMI","place":5,"killer":"","tablier":false,"n":8,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2023-02-10","location":"mehdi","player":"Jérôme BINOT","place":6,"killer":"","tablier":false,"n":8,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2023-02-10","location":"mehdi","player":"Alexis Volant","place":7,"killer":"","tablier":false,"n":8,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2023-02-10","location":"mehdi","player":"Grégoire DUFORET","place":8,"killer":"","tablier":false,"n":8,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2023-02-17","location":"franck","player":"Jérôme RIFFE","place":1,"killer":"","tablier":false,"n":11,"points":34.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":23,"date":"2023-02-17","location":"franck","player":"Mehdi BRAHIMI","place":2,"killer":"","tablier":false,"n":11,"points":28.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":23,"date":"2023-02-17","location":"franck","player":"Olivier HENGUELLE","place":3,"killer":"","tablier":false,"n":11,"points":23.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":23,"date":"2023-02-17","location":"franck","player":"joueur occasionnel 3","place":4,"killer":"","tablier":false,"n":11,"points":19.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2023-02-17","location":"franck","player":"Franck NAESSENS","place":5,"killer":"","tablier":false,"n":11,"points":16.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2023-02-17","location":"franck","player":"Jérémy COQUEL","place":6,"killer":"","tablier":false,"n":11,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2023-02-17","location":"franck","player":"Stéphane LEFIN","place":7,"killer":"","tablier":false,"n":11,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2023-02-17","location":"franck","player":"Michel SCHERPEREEL","place":8,"killer":"","tablier":false,"n":11,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2023-02-17","location":"franck","player":"Alexis Volant","place":9,"killer":"","tablier":false,"n":11,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2023-02-17","location":"franck","player":"Thierry MONNIAUX","place":10,"killer":"","tablier":false,"n":11,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2023-02-17","location":"franck","player":"Jérôme BERA","place":11,"killer":"","tablier":false,"n":11,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":24,"date":"2023-02-24","location":"Mig","player":"Mehdi BRAHIMI","place":1,"killer":"","tablier":false,"n":8,"points":23.0,"stake":5,"gross":25,"net":20,"kills":0,"win":true,"podium":true},{"game":24,"date":"2023-02-24","location":"Mig","player":"Michel SCHERPEREEL","place":2,"killer":"","tablier":false,"n":8,"points":18.0,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":24,"date":"2023-02-24","location":"Mig","player":"Jérôme BERA","place":3,"killer":"","tablier":false,"n":8,"points":14.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":24,"date":"2023-02-24","location":"Mig","player":"Olivier HENGUELLE","place":4,"killer":"","tablier":false,"n":8,"points":11.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":24,"date":"2023-02-24","location":"Mig","player":"Jérémy COQUEL","place":5,"killer":"","tablier":false,"n":8,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":24,"date":"2023-02-24","location":"Mig","player":"Areski AIT GHERBI","place":6,"killer":"","tablier":false,"n":8,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":24,"date":"2023-02-24","location":"Mig","player":"Jérôme BINOT","place":7,"killer":"","tablier":false,"n":8,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":24,"date":"2023-02-24","location":"Mig","player":"Franck NAESSENS","place":8,"killer":"","tablier":false,"n":8,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2023-03-03","location":"gg riffe","player":"Jérôme BERA","place":1,"killer":"","tablier":false,"n":11,"points":34.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":25,"date":"2023-03-03","location":"gg riffe","player":"David SAGALOWICZ","place":2,"killer":"","tablier":false,"n":11,"points":28.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":25,"date":"2023-03-03","location":"gg riffe","player":"Stéphane LEFIN","place":3,"killer":"","tablier":false,"n":11,"points":23.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":25,"date":"2023-03-03","location":"gg riffe","player":"Alexis Volant","place":4,"killer":"","tablier":false,"n":11,"points":19.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2023-03-03","location":"gg riffe","player":"Jérôme RIFFE","place":5,"killer":"","tablier":false,"n":11,"points":16.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2023-03-03","location":"gg riffe","player":"Franck NAESSENS","place":6,"killer":"","tablier":false,"n":11,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2023-03-03","location":"gg riffe","player":"Thierry MONNIAUX","place":7,"killer":"","tablier":false,"n":11,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2023-03-03","location":"gg riffe","player":"Clément MARAVAL","place":8,"killer":"","tablier":false,"n":11,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2023-03-03","location":"gg riffe","player":"Jérémy COQUEL","place":9,"killer":"","tablier":false,"n":11,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2023-03-03","location":"gg riffe","player":"François CATTEAU","place":10,"killer":"","tablier":false,"n":11,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2023-03-03","location":"gg riffe","player":"Michel SCHERPEREEL","place":11,"killer":"","tablier":false,"n":11,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2023-03-10","location":"FRANCOIS","player":"Jérôme BERA","place":1,"killer":"","tablier":false,"n":12,"points":36.0,"stake":5,"gross":35,"net":30,"kills":0,"win":true,"podium":true},{"game":26,"date":"2023-03-10","location":"FRANCOIS","player":"Jérôme BINOT","place":2,"killer":"","tablier":false,"n":12,"points":30.0,"stake":5,"gross":20,"net":15,"kills":0,"win":false,"podium":true},{"game":26,"date":"2023-03-10","location":"FRANCOIS","player":"Franck NAESSENS","place":3,"killer":"","tablier":false,"n":12,"points":25.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":26,"date":"2023-03-10","location":"FRANCOIS","player":"Jérôme RIFFE","place":4,"killer":"","tablier":false,"n":12,"points":21.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2023-03-10","location":"FRANCOIS","player":"David SAGALOWICZ","place":5,"killer":"","tablier":false,"n":12,"points":18.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2023-03-10","location":"FRANCOIS","player":"Stéphane LEFIN","place":6,"killer":"","tablier":false,"n":12,"points":15.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2023-03-10","location":"FRANCOIS","player":"Jérémy COQUEL","place":7,"killer":"","tablier":false,"n":12,"points":12.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2023-03-10","location":"FRANCOIS","player":"joueur occasionnel 3","place":8,"killer":"","tablier":false,"n":12,"points":9.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2023-03-10","location":"FRANCOIS","player":"Jérémie CARPENTIER","place":9,"killer":"","tablier":false,"n":12,"points":7.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2023-03-10","location":"FRANCOIS","player":"Areski AIT GHERBI","place":10,"killer":"","tablier":false,"n":12,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2023-03-10","location":"FRANCOIS","player":"François CATTEAU","place":11,"killer":"","tablier":false,"n":12,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2023-03-10","location":"FRANCOIS","player":"joueur occasionnel 6","place":12,"killer":"","tablier":false,"n":12,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2023-03-17","location":"Alexis","player":"François CATTEAU","place":1,"killer":"","tablier":false,"n":9,"points":27.0,"stake":5,"gross":25,"net":20,"kills":0,"win":true,"podium":true},{"game":27,"date":"2023-03-17","location":"Alexis","player":"Alexis Volant","place":2,"killer":"","tablier":false,"n":9,"points":22.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":27,"date":"2023-03-17","location":"Alexis","player":"David SAGALOWICZ","place":3,"killer":"","tablier":false,"n":9,"points":17.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":27,"date":"2023-03-17","location":"Alexis","player":"Areski AIT GHERBI","place":4,"killer":"","tablier":false,"n":9,"points":13.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2023-03-17","location":"Alexis","player":"Franck NAESSENS","place":5,"killer":"","tablier":false,"n":9,"points":10.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2023-03-17","location":"Alexis","player":"Jérôme BERA","place":6,"killer":"","tablier":false,"n":9,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2023-03-17","location":"Alexis","player":"Jérôme BINOT","place":7,"killer":"","tablier":false,"n":9,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2023-03-17","location":"Alexis","player":"Solène BALLOIS","place":8,"killer":"","tablier":false,"n":9,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2023-03-17","location":"Alexis","player":"Mehdi BRAHIMI","place":9,"killer":"","tablier":false,"n":9,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2023-03-28","location":"mehdi","player":"Thierry MONNIAUX","place":1,"killer":"","tablier":false,"n":10,"points":32.0,"stake":5,"gross":30,"net":25,"kills":0,"win":true,"podium":true},{"game":28,"date":"2023-03-28","location":"mehdi","player":"Franck NAESSENS","place":2,"killer":"","tablier":false,"n":10,"points":26.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":28,"date":"2023-03-28","location":"mehdi","player":"Stéphane ROBERT","place":3,"killer":"","tablier":false,"n":10,"points":21.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":28,"date":"2023-03-28","location":"mehdi","player":"Alexis Volant","place":4,"killer":"","tablier":false,"n":10,"points":17.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2023-03-28","location":"mehdi","player":"Jérémy COQUEL","place":5,"killer":"","tablier":false,"n":10,"points":14.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2023-03-28","location":"mehdi","player":"Jérôme RIFFE","place":6,"killer":"","tablier":false,"n":10,"points":11.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2023-03-28","location":"mehdi","player":"Mehdi BRAHIMI","place":7,"killer":"","tablier":false,"n":10,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2023-03-28","location":"mehdi","player":"Michel SCHERPEREEL","place":8,"killer":"","tablier":false,"n":10,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2023-03-28","location":"mehdi","player":"Philippe DUBOIS","place":9,"killer":"","tablier":false,"n":10,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2023-03-28","location":"mehdi","player":"Areski AIT GHERBI","place":10,"killer":"","tablier":false,"n":10,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":29,"date":"2023-04-07","location":"shrek","player":"Franck NAESSENS","place":1,"killer":"","tablier":false,"n":7,"points":19.0,"stake":5,"gross":20,"net":15,"kills":0,"win":true,"podium":true},{"game":29,"date":"2023-04-07","location":"shrek","player":"joueur occasionnel 6","place":2,"killer":"","tablier":false,"n":7,"points":15.0,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":29,"date":"2023-04-07","location":"shrek","player":"François CATTEAU","place":3,"killer":"","tablier":false,"n":7,"points":11.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":29,"date":"2023-04-07","location":"shrek","player":"Alexis Volant","place":4,"killer":"","tablier":false,"n":7,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":29,"date":"2023-04-07","location":"shrek","player":"Mehdi BRAHIMI","place":5,"killer":"","tablier":false,"n":7,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":29,"date":"2023-04-07","location":"shrek","player":"Jérôme BERA","place":6,"killer":"","tablier":false,"n":7,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":29,"date":"2023-04-07","location":"shrek","player":"Jérémy COQUEL","place":7,"killer":"","tablier":false,"n":7,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":30,"date":"2023-04-09","location":"franck","player":"Mehdi BRAHIMI","place":1,"killer":"","tablier":false,"n":10,"points":32.0,"stake":5,"gross":30,"net":25,"kills":0,"win":true,"podium":true},{"game":30,"date":"2023-04-09","location":"franck","player":"Jérémie CARPENTIER","place":2,"killer":"","tablier":false,"n":10,"points":26.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":30,"date":"2023-04-09","location":"franck","player":"Franck NAESSENS","place":3,"killer":"","tablier":false,"n":10,"points":21.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":30,"date":"2023-04-09","location":"franck","player":"Jérôme BERA","place":4,"killer":"","tablier":false,"n":10,"points":17.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":30,"date":"2023-04-09","location":"franck","player":"Jérôme BINOT","place":5,"killer":"","tablier":false,"n":10,"points":14.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":30,"date":"2023-04-09","location":"franck","player":"Stéphane LEFIN","place":6,"killer":"","tablier":false,"n":10,"points":11.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":30,"date":"2023-04-09","location":"franck","player":"joueur occasionnel 7","place":7,"killer":"","tablier":false,"n":10,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":30,"date":"2023-04-09","location":"franck","player":"Clément MARAVAL","place":8,"killer":"","tablier":false,"n":10,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":30,"date":"2023-04-09","location":"franck","player":"Areski AIT GHERBI","place":9,"killer":"","tablier":false,"n":10,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":30,"date":"2023-04-09","location":"franck","player":"Grégoire DUFORET","place":10,"killer":"","tablier":false,"n":10,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":31,"date":"2023-04-14","location":"michel","player":"Franck NAESSENS","place":1,"killer":"","tablier":false,"n":10,"points":32.0,"stake":5,"gross":30,"net":25,"kills":0,"win":true,"podium":true},{"game":31,"date":"2023-04-14","location":"michel","player":"Jérôme BINOT","place":2,"killer":"","tablier":false,"n":10,"points":26.0,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":31,"date":"2023-04-14","location":"michel","player":"Jérémie CARPENTIER","place":3,"killer":"","tablier":false,"n":10,"points":21.0,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":31,"date":"2023-04-14","location":"michel","player":"Jérôme RIFFE","place":4,"killer":"","tablier":false,"n":10,"points":17.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":31,"date":"2023-04-14","location":"michel","player":"David SAGALOWICZ","place":5,"killer":"","tablier":false,"n":10,"points":14.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":31,"date":"2023-04-14","location":"michel","player":"Mehdi BRAHIMI","place":6,"killer":"","tablier":false,"n":10,"points":11.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":31,"date":"2023-04-14","location":"michel","player":"Michel SCHERPEREEL","place":7,"killer":"","tablier":false,"n":10,"points":8.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":31,"date":"2023-04-14","location":"michel","player":"François CATTEAU","place":8,"killer":"","tablier":false,"n":10,"points":5.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":31,"date":"2023-04-14","location":"michel","player":"Thierry MONNIAUX","place":9,"killer":"","tablier":false,"n":10,"points":3.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":31,"date":"2023-04-14","location":"michel","player":"Areski AIT GHERBI","place":10,"killer":"","tablier":false,"n":10,"points":1.0,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false}];
const ARCHIVE_2023_2024=[{"game":1,"date":"2023-09-01","location":"Michel","player":"Michel SCHERPEREEL","place":1,"killer":"","tablier":false,"n":10,"points":32,"stake":5,"gross":30,"net":25,"kills":4,"win":true,"podium":true},{"game":1,"date":"2023-09-01","location":"Michel","player":"François CATTEAU","place":2,"killer":"Michel SCHERPEREEL","tablier":false,"n":10,"points":26,"stake":5,"gross":15,"net":10,"kills":2,"win":false,"podium":true},{"game":1,"date":"2023-09-01","location":"Michel","player":"Jérôme RIFFE","place":3,"killer":"Michel SCHERPEREEL","tablier":false,"n":10,"points":21,"stake":5,"gross":5,"net":0,"kills":1,"win":false,"podium":true},{"game":1,"date":"2023-09-01","location":"Michel","player":"Romain Schepereel","place":4,"killer":"François CATTEAU","tablier":false,"n":10,"points":17,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":1,"date":"2023-09-01","location":"Michel","player":"Thierry MONNIAUX","place":5,"killer":"Romain Schepereel","tablier":false,"n":10,"points":14,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2023-09-01","location":"Michel","player":"Jérôme BERA","place":6,"killer":"Michel SCHERPEREEL","tablier":false,"n":10,"points":11,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2023-09-01","location":"Michel","player":"Jérôme BINOT","place":7,"killer":"Michel SCHERPEREEL","tablier":false,"n":10,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2023-09-01","location":"Michel","player":"David SAGALOWICZ","place":8,"killer":"Jérôme RIFFE","tablier":false,"n":10,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2023-09-01","location":"Michel","player":"Jérémy COQUEL","place":9,"killer":"Romain Schepereel","tablier":false,"n":10,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2023-09-01","location":"Michel","player":"Franck NAESSENS","place":10,"killer":"François CATTEAU","tablier":false,"n":10,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2023-09-09","location":"François","player":"Franck NAESSENS","place":1,"killer":"","tablier":false,"n":8,"points":23,"stake":5,"gross":25,"net":20,"kills":5,"win":true,"podium":true},{"game":2,"date":"2023-09-09","location":"François","player":"Jérémy COQUEL","place":2,"killer":"Franck NAESSENS","tablier":false,"n":8,"points":18,"stake":5,"gross":10,"net":5,"kills":1,"win":false,"podium":true},{"game":2,"date":"2023-09-09","location":"François","player":"Jérôme BERA","place":3,"killer":"Franck NAESSENS","tablier":false,"n":8,"points":14,"stake":5,"gross":5,"net":0,"kills":1,"win":false,"podium":true},{"game":2,"date":"2023-09-09","location":"François","player":"Alexis Volant","place":4,"killer":"Franck NAESSENS","tablier":false,"n":8,"points":11,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2023-09-09","location":"François","player":"Stéphane LEFIN","place":5,"killer":"Franck NAESSENS","tablier":false,"n":8,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2023-09-09","location":"François","player":"Hélène Fiona","place":6,"killer":"Franck NAESSENS","tablier":false,"n":8,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2023-09-09","location":"François","player":"François CATTEAU","place":7,"killer":"Jérémy COQUEL","tablier":false,"n":8,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2023-09-09","location":"François","player":"Michel SCHERPEREEL","place":8,"killer":"Jérôme BERA","tablier":false,"n":8,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2023-09-15","location":"Franck NAESSENS","player":"Grégoire DUFORET","place":1,"killer":"","tablier":true,"n":14,"points":39,"stake":5,"gross":40,"net":35,"kills":5,"win":true,"podium":true},{"game":3,"date":"2023-09-15","location":"Franck NAESSENS","player":"François CATTEAU","place":2,"killer":"Grégoire DUFORET","tablier":false,"n":14,"points":33,"stake":5,"gross":20,"net":15,"kills":4,"win":false,"podium":true},{"game":3,"date":"2023-09-15","location":"Franck NAESSENS","player":"Jérôme BINOT","place":3,"killer":"Grégoire DUFORET","tablier":false,"n":14,"points":28,"stake":5,"gross":10,"net":5,"kills":1,"win":false,"podium":true},{"game":3,"date":"2023-09-15","location":"Franck NAESSENS","player":"Jérémie CARPENTIER","place":4,"killer":"François CATTEAU","tablier":false,"n":14,"points":24,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2023-09-15","location":"Franck NAESSENS","player":"Thierry MONNIAUX","place":5,"killer":"Grégoire DUFORET","tablier":false,"n":14,"points":21,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2023-09-15","location":"Franck NAESSENS","player":"Mehdi BRAHIMI","place":6,"killer":"François CATTEAU","tablier":false,"n":14,"points":18,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2023-09-15","location":"Franck NAESSENS","player":"Stéphane LEFIN","place":7,"killer":"François CATTEAU","tablier":false,"n":14,"points":15,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2023-09-15","location":"Franck NAESSENS","player":"Romain Schepereel","place":8,"killer":"Grégoire DUFORET","tablier":false,"n":14,"points":12,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2023-09-15","location":"Franck NAESSENS","player":"Clément MARAVAL","place":9,"killer":"François CATTEAU","tablier":false,"n":14,"points":10,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2023-09-15","location":"Franck NAESSENS","player":"Franck NAESSENS","place":10,"killer":"THIERRY","tablier":false,"n":14,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2023-09-15","location":"Franck NAESSENS","player":"David SAGALOWICZ","place":11,"killer":"Romain Schepereel","tablier":false,"n":14,"points":6,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2023-09-15","location":"Franck NAESSENS","player":"Solène BALLOIS","place":12,"killer":"Grégoire DUFORET","tablier":false,"n":14,"points":4,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2023-09-15","location":"Franck NAESSENS","player":"Alexis Volant","place":13,"killer":"JEREMIE TRADER","tablier":false,"n":14,"points":2,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2023-09-15","location":"Franck NAESSENS","player":"Michel SCHERPEREEL","place":14,"killer":"Jérôme BINOT","tablier":false,"n":14,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2023-09-29","location":"Michel SCHERPEREEL","player":"Olivier HENGUELLE","place":1,"killer":"","tablier":true,"n":12,"points":36,"stake":5,"gross":35,"net":30,"kills":6,"win":true,"podium":true},{"game":4,"date":"2023-09-29","location":"Michel SCHERPEREEL","player":"Jérémy COQUEL","place":2,"killer":"Olivier HENGUELLE","tablier":false,"n":12,"points":30,"stake":5,"gross":20,"net":15,"kills":0,"win":false,"podium":true},{"game":4,"date":"2023-09-29","location":"Michel SCHERPEREEL","player":"Mehdi BRAHIMI","place":3,"killer":"Olivier HENGUELLE","tablier":false,"n":12,"points":25,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":4,"date":"2023-09-29","location":"Michel SCHERPEREEL","player":"David SAGALOWICZ","place":4,"killer":"Olivier HENGUELLE","tablier":false,"n":12,"points":21,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":4,"date":"2023-09-29","location":"Michel SCHERPEREEL","player":"Michel SCHERPEREEL","place":5,"killer":"Olivier HENGUELLE","tablier":false,"n":12,"points":18,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2023-09-29","location":"Michel SCHERPEREEL","player":"Alexis Volant","place":6,"killer":"David SAGALOWICZ","tablier":false,"n":12,"points":15,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2023-09-29","location":"Michel SCHERPEREEL","player":"Franck NAESSENS","place":7,"killer":"Olivier HENGUELLE","tablier":false,"n":12,"points":12,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2023-09-29","location":"Michel SCHERPEREEL","player":"Solène BALLOIS","place":8,"killer":"Mehdi BRAHIMI EL ESPANOL","tablier":false,"n":12,"points":9,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":4,"date":"2023-09-29","location":"Michel SCHERPEREEL","player":"Jérémie CARPENTIER","place":9,"killer":"David SAGALOWICZ","tablier":false,"n":12,"points":7,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2023-09-29","location":"Michel SCHERPEREEL","player":"Jérôme RIFFE","place":10,"killer":"Mehdi BRAHIMI EL ESPANOL","tablier":false,"n":12,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2023-09-29","location":"Michel SCHERPEREEL","player":"François CATTEAU","place":11,"killer":"Olivier HENGUELLE","tablier":false,"n":12,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2023-09-29","location":"Michel SCHERPEREEL","player":"Romain Schepereel","place":12,"killer":"Solène BALLOIS","tablier":false,"n":12,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":5,"date":"2023-10-06","location":"Areski AIT GHERBI","player":"Mehdi BRAHIMI","place":1,"killer":"","tablier":false,"n":7,"points":19,"stake":5,"gross":20,"net":15,"kills":0,"win":true,"podium":true},{"game":5,"date":"2023-10-06","location":"Areski AIT GHERBI","player":"Stéphane ROBERT","place":2,"killer":"Mehdi BRAHIMI EL ESPANOL","tablier":false,"n":7,"points":15,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":5,"date":"2023-10-06","location":"Areski AIT GHERBI","player":"Jérémy COQUEL","place":3,"killer":"Mehdi BRAHIMI EL ESPANOL","tablier":false,"n":7,"points":11,"stake":5,"gross":5,"net":0,"kills":2,"win":false,"podium":true},{"game":5,"date":"2023-10-06","location":"Areski AIT GHERBI","player":"Areski AIT GHERBI","place":4,"killer":"Jérémy COQUEL","tablier":false,"n":7,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":5,"date":"2023-10-06","location":"Areski AIT GHERBI","player":"Frédéric Tavernier","place":5,"killer":"Jérémy COQUEL","tablier":false,"n":7,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":5,"date":"2023-10-06","location":"Areski AIT GHERBI","player":"Michel SCHERPEREEL","place":6,"killer":"STEPH RIMBAUD","tablier":false,"n":7,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":5,"date":"2023-10-06","location":"Areski AIT GHERBI","player":"François CATTEAU","place":7,"killer":"STEPH RIMBAUD","tablier":false,"n":7,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":6,"date":"2023-10-13","location":"Areski AIT GHERBI","player":"Romain Schepereel","place":1,"killer":"","tablier":false,"n":8,"points":23,"stake":5,"gross":25,"net":20,"kills":0,"win":true,"podium":true},{"game":6,"date":"2023-10-13","location":"Areski AIT GHERBI","player":"Solène BALLOIS","place":2,"killer":"Romain Schepereel","tablier":false,"n":8,"points":18,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":6,"date":"2023-10-13","location":"Areski AIT GHERBI","player":"Michel SCHERPEREEL","place":3,"killer":"Romain Schepereel","tablier":false,"n":8,"points":14,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":6,"date":"2023-10-13","location":"Areski AIT GHERBI","player":"Alexis Volant","place":4,"killer":"Romain Schepereel","tablier":false,"n":8,"points":11,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":6,"date":"2023-10-13","location":"Areski AIT GHERBI","player":"Jérémy COQUEL","place":5,"killer":"Romain Schepereel","tablier":false,"n":8,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":6,"date":"2023-10-13","location":"Areski AIT GHERBI","player":"Areski AIT GHERBI","place":6,"killer":"Romain Schepereel","tablier":false,"n":8,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":6,"date":"2023-10-13","location":"Areski AIT GHERBI","player":"François CATTEAU","place":7,"killer":"Romain Schepereel","tablier":false,"n":8,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":6,"date":"2023-10-13","location":"Areski AIT GHERBI","player":"Franck NAESSENS","place":8,"killer":"Alexis Volant","tablier":false,"n":8,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":7,"date":"2023-10-20","location":"Mehdi BRAHIMI","player":"Jérôme BERA","place":1,"killer":"","tablier":true,"n":12,"points":36,"stake":5,"gross":35,"net":30,"kills":6,"win":true,"podium":true},{"game":7,"date":"2023-10-20","location":"Mehdi BRAHIMI","player":"Michel SCHERPEREEL","place":2,"killer":"Jérôme BERA","tablier":false,"n":12,"points":30,"stake":5,"gross":20,"net":15,"kills":2,"win":false,"podium":true},{"game":7,"date":"2023-10-20","location":"Mehdi BRAHIMI","player":"Jérémy COQUEL","place":3,"killer":"Jérôme BERA","tablier":false,"n":12,"points":25,"stake":5,"gross":5,"net":0,"kills":1,"win":false,"podium":true},{"game":7,"date":"2023-10-20","location":"Mehdi BRAHIMI","player":"David SAGALOWICZ","place":4,"killer":"Jérôme BERA","tablier":false,"n":12,"points":21,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":7,"date":"2023-10-20","location":"Mehdi BRAHIMI","player":"Jérémie CARPENTIER","place":5,"killer":"Michel SCHERPEREEL","tablier":false,"n":12,"points":18,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":7,"date":"2023-10-20","location":"Mehdi BRAHIMI","player":"Olivier HENGUELLE","place":6,"killer":"Jérôme BERA","tablier":false,"n":12,"points":15,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":7,"date":"2023-10-20","location":"Mehdi BRAHIMI","player":"Philippe DUBOIS","place":7,"killer":"Jérémy COQUEL","tablier":false,"n":12,"points":12,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":7,"date":"2023-10-20","location":"Mehdi BRAHIMI","player":"Mehdi BRAHIMI","place":8,"killer":"Olivier HENGUELLE","tablier":false,"n":12,"points":9,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":7,"date":"2023-10-20","location":"Mehdi BRAHIMI","player":"Franck NAESSENS","place":9,"killer":"","tablier":false,"n":12,"points":7,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":7,"date":"2023-10-20","location":"Mehdi BRAHIMI","player":"Stéphane ROBERT","place":10,"killer":"Jérôme BERA","tablier":false,"n":12,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":7,"date":"2023-10-20","location":"Mehdi BRAHIMI","player":"Areski AIT GHERBI","place":11,"killer":"Jérôme BERA","tablier":false,"n":12,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":7,"date":"2023-10-20","location":"Mehdi BRAHIMI","player":"Thierry MONNIAUX","place":12,"killer":"Michel SCHERPEREEL","tablier":false,"n":12,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":8,"date":"2023-10-27","location":"Alexis Volant","player":"Franck NAESSENS","place":1,"killer":"","tablier":false,"n":7,"points":19,"stake":5,"gross":20,"net":15,"kills":4,"win":true,"podium":true},{"game":8,"date":"2023-10-27","location":"Alexis Volant","player":"Jérôme RIFFE","place":2,"killer":"Franck NAESSENS","tablier":false,"n":7,"points":15,"stake":5,"gross":10,"net":5,"kills":1,"win":false,"podium":true},{"game":8,"date":"2023-10-27","location":"Alexis Volant","player":"Alexis Volant","place":3,"killer":"Franck NAESSENS","tablier":false,"n":7,"points":11,"stake":5,"gross":5,"net":0,"kills":1,"win":false,"podium":true},{"game":8,"date":"2023-10-27","location":"Alexis Volant","player":"Thomas DELVAL","place":4,"killer":"Franck NAESSENS","tablier":false,"n":7,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":8,"date":"2023-10-27","location":"Alexis Volant","player":"Solène BALLOIS","place":5,"killer":"Alexis Volant","tablier":false,"n":7,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":8,"date":"2023-10-27","location":"Alexis Volant","player":"Jérôme BERA","place":6,"killer":"Jérôme RIFFE","tablier":false,"n":7,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":8,"date":"2023-10-27","location":"Alexis Volant","player":"Jérémy COQUEL","place":7,"killer":"Franck NAESSENS","tablier":false,"n":7,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2023-11-03","location":"françois","player":"Mehdi BRAHIMI","place":1,"killer":"","tablier":true,"n":12,"points":36,"stake":5,"gross":35,"net":30,"kills":3,"win":true,"podium":true},{"game":9,"date":"2023-11-03","location":"françois","player":"Jérôme BINOT","place":2,"killer":"Mehdi BRAHIMI","tablier":false,"n":12,"points":30,"stake":5,"gross":20,"net":15,"kills":1,"win":false,"podium":true},{"game":9,"date":"2023-11-03","location":"françois","player":"Stéphane LEFIN","place":3,"killer":"Mehdi BRAHIMI","tablier":false,"n":12,"points":25,"stake":5,"gross":5,"net":0,"kills":5,"win":false,"podium":true},{"game":9,"date":"2023-11-03","location":"françois","player":"Alexis Volant","place":4,"killer":"Stéphane LEFIN","tablier":false,"n":12,"points":21,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":9,"date":"2023-11-03","location":"françois","player":"Franck NAESSENS","place":5,"killer":"Stéphane LEFIN","tablier":false,"n":12,"points":18,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2023-11-03","location":"françois","player":"Areski AIT GHERBI","place":6,"killer":"Jérôme BINOT","tablier":false,"n":12,"points":15,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2023-11-03","location":"françois","player":"Michel SCHERPEREEL","place":7,"killer":"Stéphane LEFIN","tablier":false,"n":12,"points":12,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2023-11-03","location":"françois","player":"Jérémy COQUEL","place":8,"killer":"Alexis Volant","tablier":false,"n":12,"points":9,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2023-11-03","location":"françois","player":"Jérôme RIFFE","place":9,"killer":"Mehdi BRAHIMI","tablier":false,"n":12,"points":7,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2023-11-03","location":"françois","player":"Jérôme BERA","place":10,"killer":"Stéphane LEFIN","tablier":false,"n":12,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2023-11-03","location":"françois","player":"François CATTEAU","place":11,"killer":"Alexis Volant","tablier":false,"n":12,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2023-11-03","location":"françois","player":"Jérémie CARPENTIER","place":12,"killer":"Stéphane LEFIN","tablier":false,"n":12,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2023-11-11","location":"Areski AIT GHERBI","player":"David SAGALOWICZ","place":1,"killer":"","tablier":true,"n":12,"points":36,"stake":5,"gross":35,"net":30,"kills":2,"win":true,"podium":true},{"game":10,"date":"2023-11-11","location":"Areski AIT GHERBI","player":"Olivier HENGUELLE","place":2,"killer":"David SAGALOWICZ","tablier":false,"n":12,"points":30,"stake":5,"gross":20,"net":15,"kills":4,"win":false,"podium":true},{"game":10,"date":"2023-11-11","location":"Areski AIT GHERBI","player":"Romain Schepereel","place":3,"killer":"Olivier HENGUELLE","tablier":false,"n":12,"points":25,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":10,"date":"2023-11-11","location":"Areski AIT GHERBI","player":"Franck NAESSENS","place":4,"killer":"Olivier HENGUELLE","tablier":false,"n":12,"points":21,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":10,"date":"2023-11-11","location":"Areski AIT GHERBI","player":"Mehdi BRAHIMI","place":5,"killer":"Olivier HENGUELLE","tablier":false,"n":12,"points":18,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":10,"date":"2023-11-11","location":"Areski AIT GHERBI","player":"Solène BALLOIS","place":6,"killer":"Olivier HENGUELLE","tablier":false,"n":12,"points":15,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":10,"date":"2023-11-11","location":"Areski AIT GHERBI","player":"Areski AIT GHERBI","place":7,"killer":"Romain Schepereel","tablier":false,"n":12,"points":12,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2023-11-11","location":"Areski AIT GHERBI","player":"Jérôme BERA","place":8,"killer":"David SAGALOWICZ","tablier":false,"n":12,"points":9,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2023-11-11","location":"Areski AIT GHERBI","player":"Alexis Volant","place":9,"killer":"Solène BALLOIS","tablier":false,"n":12,"points":7,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2023-11-11","location":"Areski AIT GHERBI","player":"François CATTEAU","place":10,"killer":"Mehdi BRAHIMI","tablier":false,"n":12,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2023-11-11","location":"Areski AIT GHERBI","player":"Michel SCHERPEREEL","place":11,"killer":"Franck NAESSENS","tablier":false,"n":12,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2023-11-11","location":"Areski AIT GHERBI","player":"Thierry MONNIAUX","place":12,"killer":"Romain Schepereel","tablier":false,"n":12,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2023-11-17","location":"Alexis Volant","player":"Mehdi BRAHIMI","place":1,"killer":"","tablier":true,"n":14,"points":39,"stake":5,"gross":40,"net":35,"kills":4,"win":true,"podium":true},{"game":11,"date":"2023-11-17","location":"Alexis Volant","player":"Jérémy COQUEL","place":2,"killer":"Mehdi BRAHIMI","tablier":false,"n":14,"points":33,"stake":5,"gross":20,"net":15,"kills":3,"win":false,"podium":true},{"game":11,"date":"2023-11-17","location":"Alexis Volant","player":"Jérôme BINOT","place":3,"killer":"Mehdi BRAHIMI","tablier":false,"n":14,"points":28,"stake":5,"gross":10,"net":5,"kills":2,"win":false,"podium":true},{"game":11,"date":"2023-11-17","location":"Alexis Volant","player":"Solène BALLOIS","place":4,"killer":"Jérôme BINOT","tablier":false,"n":14,"points":24,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":11,"date":"2023-11-17","location":"Alexis Volant","player":"Areski AIT GHERBI","place":5,"killer":"Jérémy COQUEL","tablier":false,"n":14,"points":21,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":11,"date":"2023-11-17","location":"Alexis Volant","player":"Michel SCHERPEREEL","place":6,"killer":"Jérôme BINOT","tablier":false,"n":14,"points":18,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2023-11-17","location":"Alexis Volant","player":"Olivier HENGUELLE","place":7,"killer":"Mehdi BRAHIMI","tablier":false,"n":14,"points":15,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":11,"date":"2023-11-17","location":"Alexis Volant","player":"Thierry MONNIAUX","place":8,"killer":"Mehdi BRAHIMI","tablier":false,"n":14,"points":12,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2023-11-17","location":"Alexis Volant","player":"Jérôme BERA","place":9,"killer":"Solène BALLOIS","tablier":false,"n":14,"points":10,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2023-11-17","location":"Alexis Volant","player":"Franck NAESSENS","place":10,"killer":"Areski AIT GHERBI","tablier":false,"n":14,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2023-11-17","location":"Alexis Volant","player":"Romain Schepereel","place":11,"killer":"Jérémy COQUEL","tablier":false,"n":14,"points":6,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2023-11-17","location":"Alexis Volant","player":"Jérôme RIFFE","place":12,"killer":"Jérémy COQUEL","tablier":false,"n":14,"points":4,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2023-11-17","location":"Alexis Volant","player":"Alexis Volant","place":13,"killer":"Areski AIT GHERBI","tablier":false,"n":14,"points":2,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2023-11-17","location":"Alexis Volant","player":"François CATTEAU","place":14,"killer":"Olivier HENGUELLE","tablier":false,"n":14,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2023-11-24","location":"Olivier HENGUELLE","player":"Jérôme BINOT","place":1,"killer":"","tablier":false,"n":10,"points":32,"stake":5,"gross":30,"net":25,"kills":4,"win":true,"podium":true},{"game":12,"date":"2023-11-24","location":"Olivier HENGUELLE","player":"Alexis Volant","place":2,"killer":"Jérôme BINOT","tablier":false,"n":10,"points":26,"stake":5,"gross":15,"net":10,"kills":3,"win":false,"podium":true},{"game":12,"date":"2023-11-24","location":"Olivier HENGUELLE","player":"Romain Schepereel","place":3,"killer":"Alexis Volant","tablier":false,"n":10,"points":21,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":12,"date":"2023-11-24","location":"Olivier HENGUELLE","player":"Michel SCHERPEREEL","place":4,"killer":"Alexis Volant","tablier":false,"n":10,"points":17,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2023-11-24","location":"Olivier HENGUELLE","player":"Solène BALLOIS","place":5,"killer":"Jérôme BINOT","tablier":false,"n":10,"points":14,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":12,"date":"2023-11-24","location":"Olivier HENGUELLE","player":"Mehdi BRAHIMI","place":6,"killer":"Solène BALLOIS","tablier":false,"n":10,"points":11,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2023-11-24","location":"Olivier HENGUELLE","player":"Philippe DUBOIS","place":7,"killer":"Alexis Volant","tablier":false,"n":10,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2023-11-24","location":"Olivier HENGUELLE","player":"Olivier HENGUELLE","place":8,"killer":"Solène BALLOIS","tablier":false,"n":10,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2023-11-24","location":"Olivier HENGUELLE","player":"Jérémy COQUEL","place":9,"killer":"Jérôme BINOT","tablier":false,"n":10,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2023-11-24","location":"Olivier HENGUELLE","player":"Franck NAESSENS","place":10,"killer":"Jérôme BINOT","tablier":false,"n":10,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2023-12-01","location":"Jérôme BERA","player":"Frédéric Tavernier","place":1,"killer":"","tablier":true,"n":15,"points":40,"stake":5,"gross":45,"net":40,"kills":7,"win":true,"podium":true},{"game":13,"date":"2023-12-01","location":"Jérôme BERA","player":"Jérôme BINOT","place":2,"killer":"Frédéric Tavernier","tablier":false,"n":15,"points":34,"stake":5,"gross":25,"net":20,"kills":4,"win":false,"podium":true},{"game":13,"date":"2023-12-01","location":"Jérôme BERA","player":"Jérôme BERA","place":3,"killer":"Frédéric Tavernier","tablier":false,"n":15,"points":29,"stake":5,"gross":5,"net":0,"kills":1,"win":false,"podium":true},{"game":13,"date":"2023-12-01","location":"Jérôme BERA","player":"Franck NAESSENS","place":4,"killer":"Frédéric Tavernier","tablier":false,"n":15,"points":25,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2023-12-01","location":"Jérôme BERA","player":"Mehdi BRAHIMI","place":5,"killer":"Frédéric Tavernier","tablier":false,"n":15,"points":22,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2023-12-01","location":"Jérôme BERA","player":"Clément MARAVAL","place":6,"killer":"Frédéric Tavernier","tablier":false,"n":15,"points":19,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2023-12-01","location":"Jérôme BERA","player":"Romain Schepereel","place":7,"killer":"Jérôme BINOT","tablier":false,"n":15,"points":16,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2023-12-01","location":"Jérôme BERA","player":"Jérémy COQUEL","place":8,"killer":"Frédéric Tavernier","tablier":false,"n":15,"points":13,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2023-12-01","location":"Jérôme BERA","player":"Michel SCHERPEREEL","place":9,"killer":"Frédéric Tavernier","tablier":false,"n":15,"points":11,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2023-12-01","location":"Jérôme BERA","player":"Areski AIT GHERBI","place":10,"killer":"","tablier":false,"n":15,"points":9,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2023-12-01","location":"Jérôme BERA","player":"Jérémie CARPENTIER","place":11,"killer":"Romain Schepereel","tablier":false,"n":15,"points":7,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2023-12-01","location":"Jérôme BERA","player":"Thierry MONNIAUX","place":12,"killer":"Jérôme BINOT","tablier":false,"n":15,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2023-12-01","location":"Jérôme BERA","player":"François CATTEAU","place":13,"killer":"Jérôme BINOT","tablier":false,"n":15,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2023-12-01","location":"Jérôme BERA","player":"Jérôme RIFFE","place":14,"killer":"Jérôme BINOT","tablier":false,"n":15,"points":2,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2023-12-01","location":"Jérôme BERA","player":"Alexis Volant","place":15,"killer":"Jérôme BERA","tablier":false,"n":15,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2023-12-08","location":"Jerome Riffe","player":"Jérôme RIFFE","place":1,"killer":"","tablier":true,"n":14,"points":39,"stake":5,"gross":40,"net":35,"kills":4,"win":true,"podium":true},{"game":14,"date":"2023-12-08","location":"Jerome Riffe","player":"Franck NAESSENS","place":2,"killer":"Jérôme RIFFE","tablier":false,"n":14,"points":33,"stake":5,"gross":20,"net":15,"kills":4,"win":false,"podium":true},{"game":14,"date":"2023-12-08","location":"Jerome Riffe","player":"Clément MARAVAL","place":3,"killer":"Jérôme RIFFE","tablier":false,"n":14,"points":28,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":14,"date":"2023-12-08","location":"Jerome Riffe","player":"Jérôme BERA","place":4,"killer":"Franck NAESSENS","tablier":false,"n":14,"points":24,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":14,"date":"2023-12-08","location":"Jerome Riffe","player":"Romain Schepereel","place":5,"killer":"Franck NAESSENS","tablier":false,"n":14,"points":21,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2023-12-08","location":"Jerome Riffe","player":"Olivier HENGUELLE","place":6,"killer":"Franck NAESSENS","tablier":false,"n":14,"points":18,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2023-12-08","location":"Jerome Riffe","player":"Jérémie CARPENTIER","place":7,"killer":"Jérôme RIFFE","tablier":false,"n":14,"points":15,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2023-12-08","location":"Jerome Riffe","player":"Mehdi BRAHIMI","place":8,"killer":"Jérôme RIFFE","tablier":false,"n":14,"points":12,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2023-12-08","location":"Jerome Riffe","player":"Arnaud HEDIN","place":9,"killer":"Jérôme BERA","tablier":false,"n":14,"points":10,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2023-12-08","location":"Jerome Riffe","player":"David SAGALOWICZ","place":10,"killer":"Franck NAESSENS","tablier":false,"n":14,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2023-12-08","location":"Jerome Riffe","player":"Thierry MONNIAUX","place":11,"killer":"Romain Schepereel","tablier":false,"n":14,"points":6,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2023-12-08","location":"Jerome Riffe","player":"Jérôme BINOT","place":12,"killer":"Jérôme BERA","tablier":false,"n":14,"points":4,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2023-12-08","location":"Jerome Riffe","player":"Solène BALLOIS","place":13,"killer":"Alexis Volant","tablier":false,"n":14,"points":2,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2023-12-08","location":"Jerome Riffe","player":"Alexis Volant","place":14,"killer":"Alexis Volant","tablier":false,"n":14,"points":1,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":15,"date":"2023-12-15","location":"Alexis Volant","player":"Mehdi BRAHIMI","place":1,"killer":"","tablier":false,"n":11,"points":34,"stake":5,"gross":35,"net":30,"kills":6,"win":true,"podium":true},{"game":15,"date":"2023-12-15","location":"Alexis Volant","player":"Stéphane LEFIN","place":2,"killer":"Mehdi BRAHIMI","tablier":false,"n":11,"points":28,"stake":5,"gross":15,"net":10,"kills":1,"win":false,"podium":true},{"game":15,"date":"2023-12-15","location":"Alexis Volant","player":"Jérôme BINOT","place":3,"killer":"Mehdi BRAHIMI","tablier":false,"n":11,"points":23,"stake":5,"gross":5,"net":0,"kills":1,"win":false,"podium":true},{"game":15,"date":"2023-12-15","location":"Alexis Volant","player":"Michel SCHERPEREEL","place":4,"killer":"Mehdi BRAHIMI","tablier":false,"n":11,"points":19,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":15,"date":"2023-12-15","location":"Alexis Volant","player":"Thierry MONNIAUX","place":5,"killer":"Mehdi BRAHIMI","tablier":false,"n":11,"points":16,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2023-12-15","location":"Alexis Volant","player":"Romain Schepereel","place":6,"killer":"Mehdi BRAHIMI","tablier":false,"n":11,"points":13,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2023-12-15","location":"Alexis Volant","player":"Jérôme BERA","place":7,"killer":"Mehdi BRAHIMI","tablier":false,"n":11,"points":10,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2023-12-15","location":"Alexis Volant","player":"Jules NAESSENS","place":8,"killer":"Stéphane LEFIN","tablier":false,"n":11,"points":7,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2023-12-15","location":"Alexis Volant","player":"Alexis Volant","place":9,"killer":"Jérôme BINOT","tablier":false,"n":11,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2023-12-15","location":"Alexis Volant","player":"Franck NAESSENS","place":10,"killer":"Michel SCHERPEREEL","tablier":false,"n":11,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2023-12-15","location":"Alexis Volant","player":"Solène BALLOIS","place":11,"killer":"Jules","tablier":false,"n":11,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2023-12-22","location":"Franck NAESSENS","player":"Michel SCHERPEREEL","place":1,"killer":"","tablier":true,"n":16,"points":41,"stake":5,"gross":50,"net":45,"kills":4,"win":true,"podium":true},{"game":16,"date":"2023-12-22","location":"Franck NAESSENS","player":"Jérôme RIFFE","place":2,"killer":"Michel SCHERPEREEL","tablier":false,"n":16,"points":35,"stake":5,"gross":25,"net":20,"kills":3,"win":false,"podium":true},{"game":16,"date":"2023-12-22","location":"Franck NAESSENS","player":"Franck NAESSENS","place":3,"killer":"Michel SCHERPEREEL","tablier":false,"n":16,"points":30,"stake":5,"gross":5,"net":0,"kills":4,"win":false,"podium":true},{"game":16,"date":"2023-12-22","location":"Franck NAESSENS","player":"Mélanie BINOT","place":4,"killer":"Franck NAESSENS","tablier":false,"n":16,"points":26,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2023-12-22","location":"Franck NAESSENS","player":"David SAGALOWICZ","place":5,"killer":"Franck NAESSENS","tablier":false,"n":16,"points":23,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2023-12-22","location":"Franck NAESSENS","player":"Alexis Volant","place":6,"killer":"Jérôme RIFFE","tablier":false,"n":16,"points":20,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":16,"date":"2023-12-22","location":"Franck NAESSENS","player":"Stéphane LEFIN","place":7,"killer":"Michel SCHERPEREEL","tablier":false,"n":16,"points":17,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2023-12-22","location":"Franck NAESSENS","player":"Jules NAESSENS","place":8,"killer":"Jérôme RIFFE","tablier":false,"n":16,"points":14,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2023-12-22","location":"Franck NAESSENS","player":"Clément MARAVAL","place":9,"killer":"Alexis Volant","tablier":false,"n":16,"points":12,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":16,"date":"2023-12-22","location":"Franck NAESSENS","player":"Jérémy COQUEL","place":10,"killer":"Jérôme RIFFE","tablier":false,"n":16,"points":10,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2023-12-22","location":"Franck NAESSENS","player":"Jérémie CARPENTIER","place":11,"killer":"Jérôme BINOT","tablier":false,"n":16,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2023-12-22","location":"Franck NAESSENS","player":"Solène BALLOIS","place":12,"killer":"Franck NAESSENS","tablier":false,"n":16,"points":6,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2023-12-22","location":"Franck NAESSENS","player":"Jérôme BINOT","place":13,"killer":"Clément MARAVAL","tablier":false,"n":16,"points":4,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":16,"date":"2023-12-22","location":"Franck NAESSENS","player":"Olivier HENGUELLE","place":14,"killer":"Franck NAESSENS","tablier":false,"n":16,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2023-12-22","location":"Franck NAESSENS","player":"Romain Schepereel","place":15,"killer":"Michel SCHERPEREEL","tablier":false,"n":16,"points":2,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2023-12-22","location":"Franck NAESSENS","player":"Mehdi BRAHIMI","place":16,"killer":"Jérôme BINOT","tablier":false,"n":16,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2023-12-29","location":"Jérôme RIFFE","player":"Romain Schepereel","place":1,"killer":"","tablier":false,"n":9,"points":27,"stake":5,"gross":25,"net":20,"kills":1,"win":true,"podium":true},{"game":17,"date":"2023-12-29","location":"Jérôme RIFFE","player":"Mehdi BRAHIMI","place":2,"killer":"Romain Schepereel","tablier":false,"n":9,"points":22,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":17,"date":"2023-12-29","location":"Jérôme RIFFE","player":"Jérôme RIFFE","place":3,"killer":"Romain Schepereel","tablier":false,"n":9,"points":17,"stake":5,"gross":5,"net":0,"kills":3,"win":false,"podium":true},{"game":17,"date":"2023-12-29","location":"Jérôme RIFFE","player":"Alexis Volant","place":4,"killer":"Romain Schepereel","tablier":false,"n":9,"points":13,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":17,"date":"2023-12-29","location":"Jérôme RIFFE","player":"Franck NAESSENS","place":5,"killer":"Jérôme RIFFE","tablier":false,"n":9,"points":10,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2023-12-29","location":"Jérôme RIFFE","player":"Solène BALLOIS","place":6,"killer":"Jérôme RIFFE","tablier":false,"n":9,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2023-12-29","location":"Jérôme RIFFE","player":"Areski AIT GHERBI","place":7,"killer":"Romain Schepereel","tablier":false,"n":9,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2023-12-29","location":"Jérôme RIFFE","player":"Cyprien RIFFE","place":8,"killer":"Alexis Volant","tablier":false,"n":9,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2023-12-29","location":"Jérôme RIFFE","player":"Jules NAESSENS","place":9,"killer":"Jérôme RIFFE","tablier":false,"n":9,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2024-01-05","location":"Mehdi BRAHIMI","player":"Jérémy COQUEL","place":1,"killer":"","tablier":true,"n":18,"points":43,"stake":5,"gross":55,"net":50,"kills":3,"win":true,"podium":true},{"game":18,"date":"2024-01-05","location":"Mehdi BRAHIMI","player":"Nuno Tinoco","place":2,"killer":"Jérémy COQUEL","tablier":false,"n":18,"points":37,"stake":5,"gross":25,"net":20,"kills":2,"win":false,"podium":true},{"game":18,"date":"2024-01-05","location":"Mehdi BRAHIMI","player":"Mehdi BRAHIMI","place":3,"killer":"Nuno","tablier":false,"n":18,"points":32,"stake":5,"gross":10,"net":5,"kills":1,"win":false,"podium":true},{"game":18,"date":"2024-01-05","location":"Mehdi BRAHIMI","player":"Romain Schepereel","place":4,"killer":"Jérémy COQUEL","tablier":false,"n":18,"points":28,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":18,"date":"2024-01-05","location":"Mehdi BRAHIMI","player":"Stéphane LEFIN","place":5,"killer":"Jérémy COQUEL","tablier":false,"n":18,"points":25,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":18,"date":"2024-01-05","location":"Mehdi BRAHIMI","player":"Hélène MORIZUR","place":6,"killer":"Stéphane LEFIN","tablier":false,"n":18,"points":22,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":18,"date":"2024-01-05","location":"Mehdi BRAHIMI","player":"Philippe DUBOIS","place":7,"killer":"Nuno Tinoco","tablier":false,"n":18,"points":19,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2024-01-05","location":"Mehdi BRAHIMI","player":"Franck NAESSENS","place":8,"killer":"Romain Schepereel","tablier":false,"n":18,"points":16,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":18,"date":"2024-01-05","location":"Mehdi BRAHIMI","player":"Olivier HENGUELLE","place":9,"killer":"Philippe DUBOI","tablier":false,"n":18,"points":14,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":18,"date":"2024-01-05","location":"Mehdi BRAHIMI","player":"Michel SCHERPEREEL","place":10,"killer":"Romain Schepereel","tablier":false,"n":18,"points":12,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2024-01-05","location":"Mehdi BRAHIMI","player":"Areski AIT GHERBI","place":11,"killer":"Romain Schepereel","tablier":false,"n":18,"points":10,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2024-01-05","location":"Mehdi BRAHIMI","player":"Jérôme BERA","place":12,"killer":"Nuno Tinoco","tablier":false,"n":18,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2024-01-05","location":"Mehdi BRAHIMI","player":"Alexis Volant","place":13,"killer":"Olivier HENGUELLE","tablier":false,"n":18,"points":6,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2024-01-05","location":"Mehdi BRAHIMI","player":"Solène BALLOIS","place":14,"killer":"Hélène MORIZUR","tablier":false,"n":18,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2024-01-05","location":"Mehdi BRAHIMI","player":"Grégoire DUFORET","place":15,"killer":"Mehdi BRAHIMI","tablier":false,"n":18,"points":4,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2024-01-05","location":"Mehdi BRAHIMI","player":"Armelle BRAHIMI","place":16,"killer":"Franck NAESSENS","tablier":false,"n":18,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2024-01-05","location":"Mehdi BRAHIMI","player":"Thierry MONNIAUX","place":17,"killer":"Franck NAESSENS","tablier":false,"n":18,"points":2,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2024-01-05","location":"Mehdi BRAHIMI","player":"Jérôme BINOT","place":18,"killer":"Romain Schepereel","tablier":false,"n":18,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2024-01-24","location":"Jérémy COQUEL","player":"Jérôme BINOT","place":1,"killer":"","tablier":false,"n":11,"points":34,"stake":5,"gross":35,"net":30,"kills":5,"win":true,"podium":true},{"game":19,"date":"2024-01-24","location":"Jérémy COQUEL","player":"Thierry MONNIAUX","place":2,"killer":"Jérôme BINOT","tablier":false,"n":11,"points":28,"stake":5,"gross":15,"net":10,"kills":1,"win":false,"podium":true},{"game":19,"date":"2024-01-24","location":"Jérémy COQUEL","player":"Franck NAESSENS","place":3,"killer":"Jérôme BINOT","tablier":false,"n":11,"points":23,"stake":5,"gross":5,"net":0,"kills":2,"win":false,"podium":true},{"game":19,"date":"2024-01-24","location":"Jérémy COQUEL","player":"Hélène Fiona","place":4,"killer":"Jérôme BINOT","tablier":false,"n":11,"points":19,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2024-01-24","location":"Jérémy COQUEL","player":"Jérôme RIFFE","place":5,"killer":"Jérôme BINOT","tablier":false,"n":11,"points":16,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":19,"date":"2024-01-24","location":"Jérémy COQUEL","player":"Jérémy COQUEL","place":6,"killer":"Jérôme RIFFE","tablier":false,"n":11,"points":13,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2024-01-24","location":"Jérémy COQUEL","player":"Frédéric Tavernier","place":7,"killer":"Thierry MONNIAUX","tablier":false,"n":11,"points":10,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2024-01-24","location":"Jérémy COQUEL","player":"Romain Schepereel","place":8,"killer":"Jérôme BINOT","tablier":false,"n":11,"points":7,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2024-01-24","location":"Jérémy COQUEL","player":"Jérôme BERA","place":9,"killer":"Jérôme RIFFE","tablier":false,"n":11,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2024-01-24","location":"Jérémy COQUEL","player":"Jules NAESSENS","place":10,"killer":"Franck NAESSENS","tablier":false,"n":11,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2024-01-24","location":"Jérémy COQUEL","player":"Areski AIT GHERBI","place":11,"killer":"Franck NAESSENS","tablier":false,"n":11,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2024-02-02","location":"françois","player":"Jules NAESSENS","place":1,"killer":"","tablier":false,"n":11,"points":34,"stake":5,"gross":35,"net":30,"kills":5,"win":true,"podium":true},{"game":20,"date":"2024-02-02","location":"françois","player":"Jérémie CARPENTIER","place":2,"killer":"Jules NAESSENS","tablier":false,"n":11,"points":28,"stake":5,"gross":15,"net":10,"kills":1,"win":false,"podium":true},{"game":20,"date":"2024-02-02","location":"françois","player":"Solène BALLOIS","place":3,"killer":"Jules NAESSENS","tablier":false,"n":11,"points":23,"stake":5,"gross":5,"net":0,"kills":1,"win":false,"podium":true},{"game":20,"date":"2024-02-02","location":"françois","player":"Thierry MONNIAUX","place":4,"killer":"Solène BALLOIS","tablier":false,"n":11,"points":19,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2024-02-02","location":"françois","player":"Alexis Volant","place":5,"killer":"Jules NAESSENS","tablier":false,"n":11,"points":16,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":20,"date":"2024-02-02","location":"françois","player":"Franck NAESSENS","place":6,"killer":"Jérémie CARPENTIER","tablier":false,"n":11,"points":13,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2024-02-02","location":"françois","player":"Stéphane LEFIN","place":7,"killer":"Alexis Volant","tablier":false,"n":11,"points":10,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2024-02-02","location":"françois","player":"François CATTEAU","place":8,"killer":"Jules NAESSENS","tablier":false,"n":11,"points":7,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2024-02-02","location":"françois","player":"Romain Schepereel","place":9,"killer":"Alexis Volant","tablier":false,"n":11,"points":5,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":20,"date":"2024-02-02","location":"françois","player":"Guillaume Molmy","place":10,"killer":"Jules NAESSENS","tablier":false,"n":11,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2024-02-02","location":"françois","player":"Jérémy COQUEL","place":11,"killer":"Romain Schepereel","tablier":false,"n":11,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2024-02-09","location":"jeremie","player":"Jules NAESSENS","place":1,"killer":"","tablier":false,"n":9,"points":27,"stake":5,"gross":25,"net":20,"kills":8,"win":true,"podium":true},{"game":21,"date":"2024-02-09","location":"jeremie","player":"Mehdi BRAHIMI","place":2,"killer":"Jules NAESSENS","tablier":false,"n":9,"points":22,"stake":5,"gross":15,"net":10,"kills":1,"win":false,"podium":true},{"game":21,"date":"2024-02-09","location":"jeremie","player":"Jérémie CARPENTIER","place":3,"killer":"Jules NAESSENS","tablier":false,"n":9,"points":17,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":21,"date":"2024-02-09","location":"jeremie","player":"Stéphane LEFIN","place":4,"killer":"Mehdi BRAHIMI","tablier":false,"n":9,"points":13,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2024-02-09","location":"jeremie","player":"Romain Schepereel","place":5,"killer":"Jules NAESSENS","tablier":false,"n":9,"points":10,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2024-02-09","location":"jeremie","player":"François CATTEAU","place":6,"killer":"Jules NAESSENS","tablier":false,"n":9,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2024-02-09","location":"jeremie","player":"Jérôme BERA","place":7,"killer":"Jules NAESSENS","tablier":false,"n":9,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2024-02-09","location":"jeremie","player":"Michel SCHERPEREEL","place":8,"killer":"Jules NAESSENS","tablier":false,"n":9,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2024-02-09","location":"jeremie","player":"Franck NAESSENS","place":9,"killer":"Jules NAESSENS","tablier":false,"n":9,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2024-02-16","location":"franck","player":"Jérémy COQUEL","place":1,"killer":"","tablier":true,"n":13,"points":38,"stake":5,"gross":40,"net":35,"kills":5,"win":true,"podium":true},{"game":22,"date":"2024-02-16","location":"franck","player":"Stéphane LEFIN","place":2,"killer":"Jérémy COQUEL","tablier":false,"n":13,"points":32,"stake":5,"gross":20,"net":15,"kills":3,"win":false,"podium":true},{"game":22,"date":"2024-02-16","location":"franck","player":"Franck NAESSENS","place":3,"killer":"Jérémy COQUEL","tablier":false,"n":13,"points":27,"stake":5,"gross":5,"net":0,"kills":3,"win":false,"podium":true},{"game":22,"date":"2024-02-16","location":"franck","player":"Alexis Volant","place":4,"killer":"Jérémy COQUEL","tablier":false,"n":13,"points":23,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2024-02-16","location":"franck","player":"David SAGALOWICZ","place":5,"killer":"Jérémy COQUEL","tablier":false,"n":13,"points":20,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2024-02-16","location":"franck","player":"Clément MARAVAL","place":6,"killer":"Stéphane LEFIN","tablier":false,"n":13,"points":17,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":22,"date":"2024-02-16","location":"franck","player":"Michel SCHERPEREEL","place":7,"killer":"Franck NAESSENS","tablier":false,"n":13,"points":14,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2024-02-16","location":"franck","player":"Jérôme BINOT","place":8,"killer":"Clément MARAVAL","tablier":false,"n":13,"points":11,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2024-02-16","location":"franck","player":"Solène BALLOIS","place":9,"killer":"Jérémy COQUEL","tablier":false,"n":13,"points":9,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2024-02-16","location":"franck","player":"Jules NAESSENS","place":10,"killer":"Franck NAESSENS","tablier":false,"n":13,"points":7,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2024-02-16","location":"franck","player":"Jérôme BERA","place":11,"killer":"Stéphane LEFIN","tablier":false,"n":13,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2024-02-16","location":"franck","player":"Areski AIT GHERBI","place":12,"killer":"Stéphane LEFIN","tablier":false,"n":13,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2024-02-16","location":"franck","player":"Thierry MONNIAUX","place":13,"killer":"Franck NAESSENS","tablier":false,"n":13,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2024-02-23","location":"jerome béra","player":"Mehdi BRAHIMI","place":1,"killer":"","tablier":true,"n":13,"points":38,"stake":5,"gross":40,"net":35,"kills":0,"win":true,"podium":true},{"game":23,"date":"2024-02-23","location":"jerome béra","player":"Jérôme RIFFE","place":2,"killer":"","tablier":false,"n":13,"points":32,"stake":5,"gross":20,"net":15,"kills":0,"win":false,"podium":true},{"game":23,"date":"2024-02-23","location":"jerome béra","player":"Michel SCHERPEREEL","place":3,"killer":"","tablier":false,"n":13,"points":27,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":23,"date":"2024-02-23","location":"jerome béra","player":"Jérémy COQUEL","place":4,"killer":"","tablier":false,"n":13,"points":23,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2024-02-23","location":"jerome béra","player":"Areski AIT GHERBI","place":5,"killer":"","tablier":false,"n":13,"points":20,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2024-02-23","location":"jerome béra","player":"Alexis Volant","place":6,"killer":"","tablier":false,"n":13,"points":17,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2024-02-23","location":"jerome béra","player":"Thierry MONNIAUX","place":7,"killer":"","tablier":false,"n":13,"points":14,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2024-02-23","location":"jerome béra","player":"François CATTEAU","place":8,"killer":"","tablier":false,"n":13,"points":11,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2024-02-23","location":"jerome béra","player":"Jules NAESSENS","place":9,"killer":"","tablier":false,"n":13,"points":9,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2024-02-23","location":"jerome béra","player":"Grégoire DUFORET","place":10,"killer":"","tablier":false,"n":13,"points":7,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2024-02-23","location":"jerome béra","player":"Romain Schepereel","place":11,"killer":"","tablier":false,"n":13,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2024-02-23","location":"jerome béra","player":"Franck NAESSENS","place":12,"killer":"","tablier":false,"n":13,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2024-02-23","location":"jerome béra","player":"Jérôme BERA","place":13,"killer":"","tablier":false,"n":13,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":24,"date":"2024-03-07","location":"françois","player":"David SAGALOWICZ","place":1,"killer":"","tablier":false,"n":6,"points":16,"stake":5,"gross":20,"net":15,"kills":2,"win":true,"podium":true},{"game":24,"date":"2024-03-07","location":"françois","player":"Michel SCHERPEREEL","place":2,"killer":"David SAGALOWICZ","tablier":false,"n":6,"points":12,"stake":5,"gross":10,"net":5,"kills":1,"win":false,"podium":true},{"game":24,"date":"2024-03-07","location":"françois","player":"Franck NAESSENS","place":3,"killer":"David SAGALOWICZ","tablier":false,"n":6,"points":8,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":true},{"game":24,"date":"2024-03-07","location":"françois","player":"Areski AIT GHERBI","place":4,"killer":"Michel SCHERPEREEL","tablier":false,"n":6,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":24,"date":"2024-03-07","location":"françois","player":"François CATTEAU","place":5,"killer":"Franck NAESSENS","tablier":false,"n":6,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":24,"date":"2024-03-07","location":"françois","player":"Jules NAESSENS","place":6,"killer":"Franck NAESSENS","tablier":false,"n":6,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2024-03-23","location":"tchobin","player":"David SAGALOWICZ","place":1,"killer":"","tablier":true,"n":12,"points":36,"stake":5,"gross":35,"net":30,"kills":4,"win":true,"podium":true},{"game":25,"date":"2024-03-23","location":"tchobin","player":"Areski AIT GHERBI","place":2,"killer":"David SAGALOWICZ","tablier":false,"n":12,"points":30,"stake":5,"gross":20,"net":15,"kills":4,"win":false,"podium":true},{"game":25,"date":"2024-03-23","location":"tchobin","player":"Jérémy COQUEL","place":3,"killer":"Areski AIT GHERBI","tablier":false,"n":12,"points":25,"stake":5,"gross":5,"net":0,"kills":1,"win":false,"podium":true},{"game":25,"date":"2024-03-23","location":"tchobin","player":"Stéphane LEFIN","place":4,"killer":"David SAGALOWICZ","tablier":false,"n":12,"points":21,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2024-03-23","location":"tchobin","player":"Grégoire DUFORET","place":5,"killer":"David SAGALOWICZ","tablier":false,"n":12,"points":18,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":25,"date":"2024-03-23","location":"tchobin","player":"Mehdi BRAHIMI","place":6,"killer":"David SAGALOWICZ","tablier":false,"n":12,"points":15,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2024-03-23","location":"tchobin","player":"Jérôme BERA","place":7,"killer":"Areski AIT GHERBI","tablier":false,"n":12,"points":12,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2024-03-23","location":"tchobin","player":"Franck NAESSENS","place":8,"killer":"Jérémy COQUEL","tablier":false,"n":12,"points":9,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2024-03-23","location":"tchobin","player":"Jérôme RIFFE","place":9,"killer":"Areski AIT GHERBI","tablier":false,"n":12,"points":7,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2024-03-23","location":"tchobin","player":"Olivier HENGUELLE","place":10,"killer":"Areski AIT GHERBI","tablier":false,"n":12,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2024-03-23","location":"tchobin","player":"Alexis Volant","place":11,"killer":"Grégoire DUFORET","tablier":false,"n":12,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":25,"date":"2024-03-23","location":"tchobin","player":"Jérôme BINOT","place":12,"killer":"Grégoire DUFORET","tablier":false,"n":12,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2024-03-29","location":"gg riffe","player":"Franck NAESSENS","place":1,"killer":"","tablier":false,"n":6,"points":16,"stake":5,"gross":20,"net":15,"kills":4,"win":true,"podium":true},{"game":26,"date":"2024-03-29","location":"gg riffe","player":"Jérôme BINOT","place":2,"killer":"Franck NAESSENS","tablier":false,"n":6,"points":12,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":26,"date":"2024-03-29","location":"gg riffe","player":"Jérôme RIFFE","place":3,"killer":"Franck NAESSENS","tablier":false,"n":6,"points":8,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":true},{"game":26,"date":"2024-03-29","location":"gg riffe","player":"David SAGALOWICZ","place":4,"killer":"Jérôme RIFFE","tablier":false,"n":6,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2024-03-29","location":"gg riffe","player":"Jérôme BERA","place":5,"killer":"Franck NAESSENS","tablier":false,"n":6,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":26,"date":"2024-03-29","location":"gg riffe","player":"Mehdi BRAHIMI","place":6,"killer":"Franck NAESSENS","tablier":false,"n":6,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2024-04-05","location":"areski","player":"Michel SCHERPEREEL","place":1,"killer":"","tablier":false,"n":11,"points":34,"stake":5,"gross":35,"net":30,"kills":7,"win":true,"podium":true},{"game":27,"date":"2024-04-05","location":"areski","player":"David SAGALOWICZ","place":2,"killer":"Michel SCHERPEREEL","tablier":false,"n":11,"points":28,"stake":5,"gross":15,"net":10,"kills":1,"win":false,"podium":true},{"game":27,"date":"2024-04-05","location":"areski","player":"Stéphane ROBERT","place":3,"killer":"Michel SCHERPEREEL","tablier":false,"n":11,"points":23,"stake":5,"gross":5,"net":0,"kills":1,"win":false,"podium":true},{"game":27,"date":"2024-04-05","location":"areski","player":"Jérémie CARPENTIER","place":4,"killer":"David SAGALOWICZ","tablier":false,"n":11,"points":19,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2024-04-05","location":"areski","player":"Thierry MONNIAUX","place":5,"killer":"Michel SCHERPEREEL","tablier":false,"n":11,"points":16,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2024-04-05","location":"areski","player":"Jérôme BERA","place":6,"killer":"Michel SCHERPEREEL","tablier":false,"n":11,"points":13,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2024-04-05","location":"areski","player":"Areski AIT GHERBI","place":7,"killer":"Michel SCHERPEREEL","tablier":false,"n":11,"points":10,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2024-04-05","location":"areski","player":"Jérôme BINOT","place":8,"killer":"Stéphane ROBERT","tablier":false,"n":11,"points":7,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":27,"date":"2024-04-05","location":"areski","player":"Stéphane LEFIN","place":9,"killer":"Michel SCHERPEREEL","tablier":false,"n":11,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2024-04-05","location":"areski","player":"Mehdi BRAHIMI","place":10,"killer":"Michel SCHERPEREEL","tablier":false,"n":11,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":27,"date":"2024-04-05","location":"areski","player":"Jérémy COQUEL","place":11,"killer":"Jérôme BINOT","tablier":false,"n":11,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2024-04-12","location":"Michel","player":"Jérôme RIFFE","place":1,"killer":"","tablier":true,"n":14,"points":39,"stake":5,"gross":40,"net":35,"kills":4,"win":true,"podium":true},{"game":28,"date":"2024-04-12","location":"Michel","player":"Franck NAESSENS","place":2,"killer":"Jérôme RIFFE","tablier":false,"n":14,"points":33,"stake":5,"gross":20,"net":15,"kills":0,"win":false,"podium":true},{"game":28,"date":"2024-04-12","location":"Michel","player":"Thierry MONNIAUX","place":3,"killer":"Grégoire DUFORET","tablier":false,"n":14,"points":28,"stake":5,"gross":10,"net":5,"kills":2,"win":false,"podium":true},{"game":28,"date":"2024-04-12","location":"Michel","player":"Grégoire DUFORET","place":4,"killer":"Jérôme RIFFE","tablier":false,"n":14,"points":24,"stake":5,"gross":0,"net":-5,"kills":4,"win":false,"podium":false},{"game":28,"date":"2024-04-12","location":"Michel","player":"David SAGALOWICZ","place":5,"killer":"Jérôme RIFFE","tablier":false,"n":14,"points":21,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2024-04-12","location":"Michel","player":"Jérôme BINOT","place":6,"killer":"Thierry MONNIAUX","tablier":false,"n":14,"points":18,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":28,"date":"2024-04-12","location":"Michel","player":"Romain Schepereel","place":7,"killer":"Grégoire DUFORET","tablier":false,"n":14,"points":15,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":28,"date":"2024-04-12","location":"Michel","player":"Stéphane LEFIN","place":8,"killer":"Jérôme BINOT","tablier":false,"n":14,"points":12,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2024-04-12","location":"Michel","player":"Mehdi BRAHIMI","place":9,"killer":"Romain Schepereel","tablier":false,"n":14,"points":10,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2024-04-12","location":"Michel","player":"Michel SCHERPEREEL","place":10,"killer":"Thierry MONNIAUX","tablier":false,"n":14,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2024-04-12","location":"Michel","player":"Jérémy COQUEL","place":11,"killer":"Grégoire DUFORET","tablier":false,"n":14,"points":6,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2024-04-12","location":"Michel","player":"Jules NAESSENS","place":12,"killer":"Romain Schepereel","tablier":false,"n":14,"points":4,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2024-04-12","location":"Michel","player":"Clément MARAVAL","place":13,"killer":"Grégoire DUFORET","tablier":false,"n":14,"points":2,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":28,"date":"2024-04-12","location":"Michel","player":"Areski AIT GHERBI","place":14,"killer":"Jérôme RIFFE","tablier":false,"n":14,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":29,"date":"2024-04-19","location":"michel","player":"David SAGALOWICZ","place":1,"killer":"","tablier":false,"n":10,"points":32,"stake":5,"gross":30,"net":25,"kills":4,"win":true,"podium":true},{"game":29,"date":"2024-04-19","location":"michel","player":"Gérard CANDELIER","place":2,"killer":"David SAGALOWICZ","tablier":false,"n":10,"points":26,"stake":5,"gross":15,"net":10,"kills":1,"win":false,"podium":true},{"game":29,"date":"2024-04-19","location":"michel","player":"Jérôme BINOT","place":3,"killer":"David SAGALOWICZ","tablier":false,"n":10,"points":21,"stake":5,"gross":5,"net":0,"kills":2,"win":false,"podium":true},{"game":29,"date":"2024-04-19","location":"michel","player":"Franck NAESSENS","place":4,"killer":"Jérôme BINOT","tablier":false,"n":10,"points":17,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":29,"date":"2024-04-19","location":"michel","player":"Jérôme RIFFE","place":5,"killer":"David SAGALOWICZ","tablier":false,"n":10,"points":14,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":29,"date":"2024-04-19","location":"michel","player":"Mehdi BRAHIMI","place":6,"killer":"David SAGALOWICZ","tablier":false,"n":10,"points":11,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":29,"date":"2024-04-19","location":"michel","player":"Olivier HENGUELLE","place":7,"killer":"Franck NAESSENS","tablier":false,"n":10,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":29,"date":"2024-04-19","location":"michel","player":"Jules NAESSENS","place":8,"killer":"Gérard CANDELIER","tablier":false,"n":10,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":29,"date":"2024-04-19","location":"michel","player":"Michel SCHERPEREEL","place":9,"killer":"Jérôme BINOT","tablier":false,"n":10,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":29,"date":"2024-04-19","location":"michel","player":"Jérémie CARPENTIER","place":10,"killer":"Franck NAESSENS","tablier":false,"n":10,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":30,"date":"2024-05-04","location":"Franck NAESSENS","player":"David SAGALOWICZ","place":1,"killer":"","tablier":false,"n":10,"points":32,"stake":5,"gross":30,"net":25,"kills":1,"win":true,"podium":true},{"game":30,"date":"2024-05-04","location":"Franck NAESSENS","player":"Thierry MONNIAUX","place":2,"killer":"","tablier":false,"n":10,"points":26,"stake":5,"gross":15,"net":10,"kills":3,"win":false,"podium":true},{"game":30,"date":"2024-05-04","location":"Franck NAESSENS","player":"Franck NAESSENS","place":3,"killer":"","tablier":false,"n":10,"points":21,"stake":5,"gross":5,"net":0,"kills":1,"win":false,"podium":true},{"game":30,"date":"2024-05-04","location":"Franck NAESSENS","player":"Jérôme RIFFE","place":4,"killer":"Thierry MONNIAUX","tablier":false,"n":10,"points":17,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":30,"date":"2024-05-04","location":"Franck NAESSENS","player":"Olivier HENGUELLE","place":5,"killer":"","tablier":false,"n":10,"points":14,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":30,"date":"2024-05-04","location":"Franck NAESSENS","player":"Jérôme BERA","place":6,"killer":"Jérôme RIFFE","tablier":false,"n":10,"points":11,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":30,"date":"2024-05-04","location":"Franck NAESSENS","player":"Jules NAESSENS","place":7,"killer":"David SAGALOWICZ","tablier":false,"n":10,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":30,"date":"2024-05-04","location":"Franck NAESSENS","player":"François CATTEAU","place":8,"killer":"","tablier":false,"n":10,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":30,"date":"2024-05-04","location":"Franck NAESSENS","player":"Mehdi BRAHIMI","place":9,"killer":"Thierry MONNIAUX","tablier":false,"n":10,"points":3,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":30,"date":"2024-05-04","location":"Franck NAESSENS","player":"Jérôme BINOT","place":10,"killer":"","tablier":false,"n":10,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":31,"date":"2024-05-07","location":"mehdi","player":"Thierry MONNIAUX","place":1,"killer":"","tablier":false,"n":10,"points":32,"stake":5,"gross":30,"net":25,"kills":3,"win":true,"podium":true},{"game":31,"date":"2024-05-07","location":"mehdi","player":"Jérôme RIFFE","place":2,"killer":"Thierry MONNIAUX","tablier":false,"n":10,"points":26,"stake":5,"gross":15,"net":10,"kills":2,"win":false,"podium":true},{"game":31,"date":"2024-05-07","location":"mehdi","player":"Jérôme BERA","place":3,"killer":"Jérôme RIFFE","tablier":false,"n":10,"points":21,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":31,"date":"2024-05-07","location":"mehdi","player":"David SAGALOWICZ","place":4,"killer":"Jérôme RIFFE","tablier":false,"n":10,"points":17,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":31,"date":"2024-05-07","location":"mehdi","player":"Mehdi BRAHIMI","place":5,"killer":"Thierry MONNIAUX","tablier":false,"n":10,"points":14,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":31,"date":"2024-05-07","location":"mehdi","player":"Franck NAESSENS","place":6,"killer":"David SAGALOWICZ","tablier":false,"n":10,"points":11,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":31,"date":"2024-05-07","location":"mehdi","player":"Stéphane ROBERT","place":7,"killer":"Thierry MONNIAUX","tablier":false,"n":10,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":31,"date":"2024-05-07","location":"mehdi","player":"Jules NAESSENS","place":8,"killer":"David SAGALOWICZ","tablier":false,"n":10,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":31,"date":"2024-05-07","location":"mehdi","player":"Michel SCHERPEREEL","place":9,"killer":"Mehdi BRAHIMI","tablier":false,"n":10,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":31,"date":"2024-05-07","location":"mehdi","player":"Jérémy COQUEL","place":10,"killer":"Franck NAESSENS","tablier":false,"n":10,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":32,"date":"2024-05-24","location":"alexis","player":"Jérôme RIFFE","place":1,"killer":"","tablier":true,"n":13,"points":38,"stake":5,"gross":40,"net":35,"kills":2,"win":true,"podium":true},{"game":32,"date":"2024-05-24","location":"alexis","player":"Alexis Volant","place":2,"killer":"Jérôme RIFFE","tablier":false,"n":13,"points":32,"stake":5,"gross":20,"net":15,"kills":3,"win":false,"podium":true},{"game":32,"date":"2024-05-24","location":"alexis","player":"Hélène Fiona","place":3,"killer":"Alexis Volant","tablier":false,"n":13,"points":27,"stake":5,"gross":5,"net":0,"kills":3,"win":false,"podium":true},{"game":32,"date":"2024-05-24","location":"alexis","player":"Franck NAESSENS","place":4,"killer":"Jérôme RIFFE","tablier":false,"n":13,"points":23,"stake":5,"gross":0,"net":-5,"kills":4,"win":false,"podium":false},{"game":32,"date":"2024-05-24","location":"alexis","player":"Mehdi BRAHIMI","place":5,"killer":"Franck NAESSENS","tablier":false,"n":13,"points":20,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":32,"date":"2024-05-24","location":"alexis","player":"David SAGALOWICZ","place":6,"killer":"Franck NAESSENS","tablier":false,"n":13,"points":17,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":32,"date":"2024-05-24","location":"alexis","player":"Areski AIT GHERBI","place":7,"killer":"Hélène Fiona","tablier":false,"n":13,"points":14,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":32,"date":"2024-05-24","location":"alexis","player":"Jérémy COQUEL","place":8,"killer":"Hélène Fiona","tablier":false,"n":13,"points":11,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":32,"date":"2024-05-24","location":"alexis","player":"Jules NAESSENS","place":9,"killer":"Alexis Volant","tablier":false,"n":13,"points":9,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":32,"date":"2024-05-24","location":"alexis","player":"Romain Schepereel","place":10,"killer":"Franck NAESSENS","tablier":false,"n":13,"points":7,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":32,"date":"2024-05-24","location":"alexis","player":"Jérémie CARPENTIER","place":11,"killer":"Franck NAESSENS","tablier":false,"n":13,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":32,"date":"2024-05-24","location":"alexis","player":"François CATTEAU","place":12,"killer":"Hélène Fiona","tablier":false,"n":13,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":32,"date":"2024-05-24","location":"alexis","player":"Clément MARAVAL","place":13,"killer":"Alexis Volant","tablier":false,"n":13,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":33,"date":"2024-06-07","location":"areski","player":"Mehdi BRAHIMI","place":1,"killer":"","tablier":false,"n":11,"points":34,"stake":5,"gross":35,"net":30,"kills":4,"win":true,"podium":true},{"game":33,"date":"2024-06-07","location":"areski","player":"Alexis Volant","place":2,"killer":"Mehdi BRAHIMI","tablier":false,"n":11,"points":28,"stake":5,"gross":15,"net":10,"kills":1,"win":false,"podium":true},{"game":33,"date":"2024-06-07","location":"areski","player":"Franck NAESSENS","place":3,"killer":"Mehdi BRAHIMI","tablier":false,"n":11,"points":23,"stake":5,"gross":5,"net":0,"kills":3,"win":false,"podium":true},{"game":33,"date":"2024-06-07","location":"areski","player":"Jérémie CARPENTIER","place":4,"killer":"Mehdi BRAHIMI","tablier":false,"n":11,"points":19,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":33,"date":"2024-06-07","location":"areski","player":"Areski AIT GHERBI","place":5,"killer":"Franck NAESSENS","tablier":false,"n":11,"points":16,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":33,"date":"2024-06-07","location":"areski","player":"Michel SCHERPEREEL","place":6,"killer":"Mehdi BRAHIMI","tablier":false,"n":11,"points":13,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":33,"date":"2024-06-07","location":"areski","player":"Jules NAESSENS","place":7,"killer":"Alexis Volant","tablier":false,"n":11,"points":10,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":33,"date":"2024-06-07","location":"areski","player":"Jérôme RIFFE","place":8,"killer":"Areski AIT GHERBI","tablier":false,"n":11,"points":7,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":33,"date":"2024-06-07","location":"areski","player":"Jérôme BINOT","place":9,"killer":"Franck NAESSENS","tablier":false,"n":11,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":33,"date":"2024-06-07","location":"areski","player":"Thierry MONNIAUX","place":10,"killer":"Franck NAESSENS","tablier":false,"n":11,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":33,"date":"2024-06-07","location":"areski","player":"Stéphane ROBERT","place":11,"killer":"Areski AIT GHERBI","tablier":false,"n":11,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":34,"date":"2024-06-21","location":"jeremy","player":"Thierry MONNIAUX","place":1,"killer":"","tablier":false,"n":10,"points":32,"stake":5,"gross":30,"net":25,"kills":4,"win":true,"podium":true},{"game":34,"date":"2024-06-21","location":"jeremy","player":"Jérôme RIFFE","place":2,"killer":"Thierry MONNIAUX","tablier":false,"n":10,"points":26,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":34,"date":"2024-06-21","location":"jeremy","player":"Jérémy COQUEL","place":3,"killer":"Thierry MONNIAUX","tablier":false,"n":10,"points":21,"stake":5,"gross":5,"net":0,"kills":2,"win":false,"podium":true},{"game":34,"date":"2024-06-21","location":"jeremy","player":"Franck NAESSENS","place":4,"killer":"Thierry MONNIAUX","tablier":false,"n":10,"points":17,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":34,"date":"2024-06-21","location":"jeremy","player":"joueur new 1","place":5,"killer":"","tablier":false,"n":10,"points":14,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":34,"date":"2024-06-21","location":"jeremy","player":"Alexis Volant","place":6,"killer":"Jérémy COQUEL","tablier":false,"n":10,"points":11,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":34,"date":"2024-06-21","location":"jeremy","player":"Jules NAESSENS","place":7,"killer":"Jérémy COQUEL","tablier":false,"n":10,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":34,"date":"2024-06-21","location":"jeremy","player":"joueur new 2","place":8,"killer":"","tablier":false,"n":10,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":34,"date":"2024-06-21","location":"jeremy","player":"Mehdi BRAHIMI","place":9,"killer":"Thierry MONNIAUX","tablier":false,"n":10,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":34,"date":"2024-06-21","location":"jeremy","player":"Hélène Fiona","place":10,"killer":"","tablier":false,"n":10,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":35,"date":"2024-06-28","location":"mehdi","player":"Mehdi BRAHIMI","place":1,"killer":"","tablier":false,"n":7,"points":19,"stake":5,"gross":20,"net":15,"kills":2,"win":true,"podium":true},{"game":35,"date":"2024-06-28","location":"mehdi","player":"Jérôme BERA","place":2,"killer":"Mehdi BRAHIMI","tablier":false,"n":7,"points":15,"stake":5,"gross":10,"net":5,"kills":3,"win":false,"podium":true},{"game":35,"date":"2024-06-28","location":"mehdi","player":"Stéphane ROBERT","place":3,"killer":"Mehdi BRAHIMI","tablier":false,"n":7,"points":11,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":35,"date":"2024-06-28","location":"mehdi","player":"Armelle BRAHIMI","place":4,"killer":"Jérôme BERA","tablier":false,"n":7,"points":8,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":35,"date":"2024-06-28","location":"mehdi","player":"Michel SCHERPEREEL","place":5,"killer":"Jérôme BERA","tablier":false,"n":7,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":35,"date":"2024-06-28","location":"mehdi","player":"David SAGALOWICZ","place":6,"killer":"Jérôme BERA","tablier":false,"n":7,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":35,"date":"2024-06-28","location":"mehdi","player":"Areski AIT GHERBI","place":7,"killer":"Armelle BRAHIMI","tablier":false,"n":7,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false}];
const ARCHIVE_2023_2024_RANKING=[{"rank":1,"name":"Mehdi BRAHIMI","points":491,"gamesCount":27,"wins":7,"tabliers":3,"kills":25},{"rank":2,"name":"Franck NAESSENS","points":481,"gamesCount":32,"wins":3,"tabliers":0,"kills":43},{"rank":3,"name":"Jérôme RIFFE","points":375,"gamesCount":20,"wins":3,"tabliers":2,"kills":25},{"rank":4,"name":"Michel SCHERPEREEL","points":354,"gamesCount":25,"wins":3,"tabliers":1,"kills":20},{"rank":5,"name":"Jérémy COQUEL","points":347,"gamesCount":23,"wins":2,"tabliers":2,"kills":19},{"rank":6,"name":"David SAGALOWICZ","points":347,"gamesCount":18,"wins":5,"tabliers":2,"kills":19},{"rank":7,"name":"Jérôme BINOT","points":302,"gamesCount":19,"wins":2,"tabliers":0,"kills":25},{"rank":8,"name":"Alexis Volant","points":282,"gamesCount":22,"wins":0,"tabliers":0,"kills":18},{"rank":9,"name":"Thierry MONNIAUX","points":277,"gamesCount":19,"wins":2,"tabliers":0,"kills":14},{"rank":10,"name":"Romain Schepereel","points":261,"gamesCount":19,"wins":2,"tabliers":0,"kills":8},{"rank":11,"name":"Jérôme BERA","points":250,"gamesCount":21,"wins":1,"tabliers":1,"kills":14},{"rank":12,"name":"Stéphane LEFIN","points":211,"gamesCount":12,"wins":0,"tabliers":0,"kills":11},{"rank":13,"name":"Areski AIT GHERBI","points":189,"gamesCount":19,"wins":0,"tabliers":0,"kills":9},{"rank":14,"name":"Jérémie CARPENTIER","points":169,"gamesCount":13,"wins":0,"tabliers":0,"kills":2},{"rank":15,"name":"Olivier HENGUELLE","points":163,"gamesCount":11,"wins":1,"tabliers":1,"kills":14},{"rank":16,"name":"Jules NAESSENS","points":152,"gamesCount":16,"wins":2,"tabliers":0,"kills":14},{"rank":17,"name":"Solène BALLOIS","points":143,"gamesCount":14,"wins":0,"tabliers":0,"kills":7},{"rank":18,"name":"François CATTEAU","points":118,"gamesCount":16,"wins":0,"tabliers":0,"kills":7},{"rank":19,"name":"Grégoire DUFORET","points":92,"gamesCount":5,"wins":1,"tabliers":1,"kills":12},{"rank":20,"name":"Clément MARAVAL","points":89,"gamesCount":7,"wins":0,"tabliers":0,"kills":3},{"rank":21,"name":"Stéphane ROBERT","points":63,"gamesCount":6,"wins":0,"tabliers":0,"kills":2},{"rank":22,"name":"Frédéric Tavernier","points":55,"gamesCount":3,"wins":1,"tabliers":1,"kills":8},{"rank":23,"name":"Hélène Fiona","points":52,"gamesCount":4,"wins":0,"tabliers":0,"kills":4},{"rank":24,"name":"Philippe DUBOIS","points":39,"gamesCount":3,"wins":0,"tabliers":0,"kills":1},{"rank":25,"name":"Nuno Tinoco","points":37,"gamesCount":1,"wins":0,"tabliers":0,"kills":3},{"rank":26,"name":"Mélanie BINOT","points":26,"gamesCount":1,"wins":0,"tabliers":0,"kills":1},{"rank":27,"name":"Gérard CANDELIER","points":26,"gamesCount":1,"wins":0,"tabliers":0,"kills":2},{"rank":28,"name":"Hélène MORIZUR","points":22,"gamesCount":1,"wins":0,"tabliers":0,"kills":2},{"rank":29,"name":"Armelle BRAHIMI","points":11,"gamesCount":2,"wins":0,"tabliers":0,"kills":2},{"rank":30,"name":"Arnaud HEDIN","points":10,"gamesCount":1,"wins":0,"tabliers":0,"kills":1},{"rank":31,"name":"Thomas DELVAL","points":8,"gamesCount":1,"wins":0,"tabliers":0,"kills":1},{"rank":32,"name":"Guillaume Molmy","points":3,"gamesCount":1,"wins":0,"tabliers":0,"kills":1},{"rank":33,"name":"Cyprien RIFFE","points":3,"gamesCount":1,"wins":0,"tabliers":0,"kills":1},{"rank":999,"name":"max","points":0,"gamesCount":32,"wins":7,"tabliers":14,"kills":43}];
const ARCHIVE_2025_2026=[{"game":1,"date":"2025-09-05","location":"alexis","player":"Jérôme RIFFE","place":1,"killer":"","tablier":true,"n":12,"points":36,"stake":5,"gross":35,"net":30,"kills":3,"win":true,"podium":true},{"game":1,"date":"2025-09-05","location":"alexis","player":"Thierry MONNIAUX","place":2,"killer":"","tablier":false,"n":12,"points":30,"stake":5,"gross":20,"net":15,"kills":3,"win":false,"podium":true},{"game":1,"date":"2025-09-05","location":"alexis","player":"Alexis Volant","place":3,"killer":"Jérôme RIFFE","tablier":false,"n":12,"points":25,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":1,"date":"2025-09-05","location":"alexis","player":"Jérémy COQUEL","place":4,"killer":"","tablier":false,"n":12,"points":21,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2025-09-05","location":"alexis","player":"Mehdi BRAHIMI","place":5,"killer":"","tablier":false,"n":12,"points":18,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":1,"date":"2025-09-05","location":"alexis","player":"Areski AIT GHERBI","place":6,"killer":"","tablier":false,"n":12,"points":15,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":1,"date":"2025-09-05","location":"alexis","player":"Grégoire DUFORET","place":7,"killer":"","tablier":false,"n":12,"points":12,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":1,"date":"2025-09-05","location":"alexis","player":"Jules NAESSENS","place":8,"killer":"","tablier":false,"n":12,"points":9,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":1,"date":"2025-09-05","location":"alexis","player":"Jérôme BERA","place":9,"killer":"","tablier":false,"n":12,"points":7,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2025-09-05","location":"alexis","player":"Franck NAESSENS","place":10,"killer":"","tablier":false,"n":12,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2025-09-05","location":"alexis","player":"David SAGALOWICZ","place":11,"killer":"","tablier":false,"n":12,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":1,"date":"2025-09-05","location":"alexis","player":"Jérôme BINOT","place":12,"killer":"Thierry MONNIAUX","tablier":false,"n":12,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2025-09-12","location":"jérome Riffe","player":"François CATTEAU","place":1,"killer":"","tablier":false,"n":8,"points":23,"stake":5,"gross":25,"net":20,"kills":4,"win":true,"podium":true},{"game":2,"date":"2025-09-12","location":"jérome Riffe","player":"Clément MARAVAL","place":2,"killer":"François CATTEAU","tablier":false,"n":8,"points":18,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":2,"date":"2025-09-12","location":"jérome Riffe","player":"Jérôme RIFFE","place":3,"killer":"","tablier":false,"n":8,"points":14,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":2,"date":"2025-09-12","location":"jérome Riffe","player":"David SAGALOWICZ","place":4,"killer":"","tablier":false,"n":8,"points":11,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2025-09-12","location":"jérome Riffe","player":"Franck NAESSENS","place":5,"killer":"","tablier":false,"n":8,"points":8,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":2,"date":"2025-09-12","location":"jérome Riffe","player":"Michel SCHERPEREEL","place":6,"killer":"","tablier":false,"n":8,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":2,"date":"2025-09-12","location":"jérome Riffe","player":"Mehdi BRAHIMI","place":7,"killer":"","tablier":false,"n":8,"points":3,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":2,"date":"2025-09-12","location":"jérome Riffe","player":"Jérémy COQUEL","place":8,"killer":"","tablier":false,"n":8,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2025-09-19","location":"franck","player":"Quentin","place":1,"killer":"","tablier":true,"n":15,"points":40,"stake":5,"gross":45,"net":40,"kills":5,"win":true,"podium":true},{"game":3,"date":"2025-09-19","location":"franck","player":"Mehdi BRAHIMI","place":2,"killer":"","tablier":false,"n":15,"points":34,"stake":5,"gross":25,"net":20,"kills":2,"win":false,"podium":true},{"game":3,"date":"2025-09-19","location":"franck","player":"Jérémie CARPENTIER","place":3,"killer":"Grégoire DUFORET","tablier":false,"n":15,"points":29,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":3,"date":"2025-09-19","location":"franck","player":"Clément MARAVAL","place":4,"killer":"Quentin","tablier":false,"n":15,"points":25,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2025-09-19","location":"franck","player":"Grégoire DUFORET","place":5,"killer":"Franck NAESSENS","tablier":false,"n":15,"points":22,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":3,"date":"2025-09-19","location":"franck","player":"Franck NAESSENS","place":6,"killer":"","tablier":false,"n":15,"points":19,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":3,"date":"2025-09-19","location":"franck","player":"François CATTEAU","place":7,"killer":"Quentin","tablier":false,"n":15,"points":16,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":3,"date":"2025-09-19","location":"franck","player":"Thierry MONNIAUX","place":8,"killer":"","tablier":false,"n":15,"points":13,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":3,"date":"2025-09-19","location":"franck","player":"Jérôme RIFFE","place":9,"killer":"","tablier":false,"n":15,"points":11,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":3,"date":"2025-09-19","location":"franck","player":"Jérôme BERA","place":10,"killer":"","tablier":false,"n":15,"points":9,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":3,"date":"2025-09-19","location":"franck","player":"Jules NAESSENS","place":11,"killer":"Thierry MONNIAUX","tablier":false,"n":15,"points":7,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2025-09-19","location":"franck","player":"Olivier HENGUELLE","place":12,"killer":"","tablier":false,"n":15,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2025-09-19","location":"franck","player":"Philippe DUBOIS","place":13,"killer":"","tablier":false,"n":15,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2025-09-19","location":"franck","player":"Michel SCHERPEREEL","place":14,"killer":"","tablier":false,"n":15,"points":2,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":3,"date":"2025-09-19","location":"franck","player":"David SAGALOWICZ","place":15,"killer":"","tablier":false,"n":15,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2025-09-26","location":"françois","player":"Jérôme BERA","place":1,"killer":"","tablier":true,"n":12,"points":36,"stake":5,"gross":35,"net":30,"kills":3,"win":true,"podium":true},{"game":4,"date":"2025-09-26","location":"françois","player":"Jérémy COQUEL","place":2,"killer":"Jérôme BERA","tablier":false,"n":12,"points":30,"stake":5,"gross":20,"net":15,"kills":3,"win":false,"podium":true},{"game":4,"date":"2025-09-26","location":"françois","player":"Thierry MONNIAUX","place":3,"killer":"","tablier":false,"n":12,"points":25,"stake":5,"gross":5,"net":0,"kills":2,"win":false,"podium":true},{"game":4,"date":"2025-09-26","location":"françois","player":"Franck NAESSENS","place":4,"killer":"Thierry MONNIAUX","tablier":false,"n":12,"points":21,"stake":5,"gross":0,"net":-5,"kills":3,"win":false,"podium":false},{"game":4,"date":"2025-09-26","location":"françois","player":"François CATTEAU","place":5,"killer":"Jérémy COQUEL","tablier":false,"n":12,"points":18,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2025-09-26","location":"françois","player":"Jérôme RIFFE","place":6,"killer":"Thierry MONNIAUX","tablier":false,"n":12,"points":15,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2025-09-26","location":"françois","player":"David SAGALOWICZ","place":7,"killer":"Jérémy COQUEL","tablier":false,"n":12,"points":12,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2025-09-26","location":"françois","player":"Jérôme BINOT","place":8,"killer":"Jérémy COQUEL","tablier":false,"n":12,"points":9,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2025-09-26","location":"françois","player":"Grégoire DUFORET","place":9,"killer":"Franck NAESSENS","tablier":false,"n":12,"points":7,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2025-09-26","location":"françois","player":"Mehdi BRAHIMI","place":10,"killer":"Jérôme BERA","tablier":false,"n":12,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2025-09-26","location":"françois","player":"Olivier HENGUELLE","place":11,"killer":"Quentin","tablier":false,"n":12,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":4,"date":"2025-09-26","location":"françois","player":"Alexis Volant","place":12,"killer":"Franck NAESSENS","tablier":false,"n":12,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":5,"date":"2025-10-11","location":"David","player":"David SAGALOWICZ","place":1,"killer":"","tablier":false,"n":8,"points":23,"stake":5,"gross":25,"net":20,"kills":1,"win":true,"podium":true},{"game":5,"date":"2025-10-11","location":"David","player":"Mehdi BRAHIMI","place":2,"killer":"David SAGALOWICZ","tablier":false,"n":8,"points":18,"stake":5,"gross":10,"net":5,"kills":2,"win":false,"podium":true},{"game":5,"date":"2025-10-11","location":"David","player":"Grégoire DUFORET","place":3,"killer":"Mehdi BRAHIMI","tablier":false,"n":8,"points":14,"stake":5,"gross":5,"net":0,"kills":2,"win":false,"podium":true},{"game":5,"date":"2025-10-11","location":"David","player":"Jérôme BERA","place":4,"killer":"Grégoire DUFORET","tablier":false,"n":8,"points":11,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":5,"date":"2025-10-11","location":"David","player":"François CATTEAU","place":5,"killer":"Jérôme BERA","tablier":false,"n":8,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":5,"date":"2025-10-11","location":"David","player":"Jérôme RIFFE","place":6,"killer":"Mehdi BRAHIMI","tablier":false,"n":8,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":5,"date":"2025-10-11","location":"David","player":"Jérémy COQUEL","place":7,"killer":"Jérôme BERA","tablier":false,"n":8,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":5,"date":"2025-10-11","location":"David","player":"Alexis Volant","place":8,"killer":"Grégoire DUFORET","tablier":false,"n":8,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":6,"date":"2025-10-25","location":"jérome Bera","player":"Alexis Volant","place":1,"killer":"","tablier":false,"n":10,"points":32,"stake":5,"gross":30,"net":25,"kills":0,"win":true,"podium":true},{"game":6,"date":"2025-10-25","location":"jérome Bera","player":"Mehdi BRAHIMI","place":2,"killer":"","tablier":false,"n":10,"points":26,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":6,"date":"2025-10-25","location":"jérome Bera","player":"Michel SCHERPEREEL","place":3,"killer":"","tablier":false,"n":10,"points":21,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":6,"date":"2025-10-25","location":"jérome Bera","player":"Franck NAESSENS","place":4,"killer":"","tablier":false,"n":10,"points":17,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":6,"date":"2025-10-25","location":"jérome Bera","player":"David SAGALOWICZ","place":5,"killer":"","tablier":false,"n":10,"points":14,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":6,"date":"2025-10-25","location":"jérome Bera","player":"Thierry MONNIAUX","place":6,"killer":"","tablier":false,"n":10,"points":11,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":6,"date":"2025-10-25","location":"jérome Bera","player":"Romain Schepereel","place":7,"killer":"","tablier":false,"n":10,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":6,"date":"2025-10-25","location":"jérome Bera","player":"Jérôme BERA","place":8,"killer":"","tablier":false,"n":10,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":6,"date":"2025-10-25","location":"jérome Bera","player":"Jérôme RIFFE","place":9,"killer":"","tablier":false,"n":10,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":6,"date":"2025-10-25","location":"jérome Bera","player":"Jérémy COQUEL","place":10,"killer":"","tablier":false,"n":10,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":7,"date":"2025-11-07","location":"jérome Riffe","player":"Grégoire DUFORET","place":1,"killer":"","tablier":false,"n":11,"points":34,"stake":5,"gross":35,"net":30,"kills":3,"win":true,"podium":true},{"game":7,"date":"2025-11-07","location":"jérome Riffe","player":"Alexis Volant","place":2,"killer":"Grégoire DUFORET","tablier":false,"n":11,"points":28,"stake":5,"gross":15,"net":10,"kills":1,"win":false,"podium":true},{"game":7,"date":"2025-11-07","location":"jérome Riffe","player":"Jérôme RIFFE","place":3,"killer":"Grégoire DUFORET","tablier":false,"n":11,"points":23,"stake":5,"gross":5,"net":0,"kills":2,"win":false,"podium":true},{"game":7,"date":"2025-11-07","location":"jérome Riffe","player":"Mehdi BRAHIMI","place":4,"killer":"Jérôme RIFFE","tablier":false,"n":11,"points":19,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":7,"date":"2025-11-07","location":"jérome Riffe","player":"Olivier HENGUELLE","place":5,"killer":"","tablier":false,"n":11,"points":16,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":7,"date":"2025-11-07","location":"jérome Riffe","player":"Franck NAESSENS","place":6,"killer":"Mehdi BRAHIMI","tablier":false,"n":11,"points":13,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":7,"date":"2025-11-07","location":"jérome Riffe","player":"Jérémy COQUEL","place":7,"killer":"Franck NAESSENS","tablier":false,"n":11,"points":10,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":7,"date":"2025-11-07","location":"jérome Riffe","player":"Jérôme BERA","place":8,"killer":"Jérôme RIFFE","tablier":false,"n":11,"points":7,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":7,"date":"2025-11-07","location":"jérome Riffe","player":"François CATTEAU","place":9,"killer":"Franck NAESSENS","tablier":false,"n":11,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":7,"date":"2025-11-07","location":"jérome Riffe","player":"Michel SCHERPEREEL","place":10,"killer":"","tablier":false,"n":11,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":7,"date":"2025-11-07","location":"jérome Riffe","player":"Areski AIT GHERBI","place":11,"killer":"Alexis Volant","tablier":false,"n":11,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":8,"date":"2025-11-14","location":"michel","player":"David SAGALOWICZ","place":1,"killer":"","tablier":false,"n":11,"points":34,"stake":5,"gross":35,"net":30,"kills":3,"win":true,"podium":true},{"game":8,"date":"2025-11-14","location":"michel","player":"Michel SCHERPEREEL","place":2,"killer":"Jérôme BERA","tablier":false,"n":11,"points":28,"stake":5,"gross":15,"net":10,"kills":2,"win":false,"podium":true},{"game":8,"date":"2025-11-14","location":"michel","player":"Jérémie CARPENTIER","place":3,"killer":"David SAGALOWICZ","tablier":false,"n":11,"points":23,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":8,"date":"2025-11-14","location":"michel","player":"Thierry MONNIAUX","place":4,"killer":"","tablier":false,"n":11,"points":19,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":8,"date":"2025-11-14","location":"michel","player":"Jérémy COQUEL","place":5,"killer":"Michel SCHERPEREEL","tablier":false,"n":11,"points":16,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":8,"date":"2025-11-14","location":"michel","player":"Franck NAESSENS","place":6,"killer":"David SAGALOWICZ","tablier":false,"n":11,"points":13,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":8,"date":"2025-11-14","location":"michel","player":"Grégoire DUFORET","place":7,"killer":"Thierry MONNIAUX","tablier":false,"n":11,"points":10,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":8,"date":"2025-11-14","location":"michel","player":"Jérôme BINOT","place":8,"killer":"Grégoire DUFORET","tablier":false,"n":11,"points":7,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":8,"date":"2025-11-14","location":"michel","player":"Jules NAESSENS","place":9,"killer":"Franck NAESSENS","tablier":false,"n":11,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":8,"date":"2025-11-14","location":"michel","player":"Areski AIT GHERBI","place":10,"killer":"Grégoire DUFORET","tablier":false,"n":11,"points":3,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":8,"date":"2025-11-14","location":"michel","player":"Alexis Volant","place":11,"killer":"Areski AIT GHERBI","tablier":false,"n":11,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2025-11-29","location":"mehdi","player":"Franck NAESSENS","place":1,"killer":"","tablier":false,"n":11,"points":34,"stake":5,"gross":35,"net":30,"kills":2,"win":true,"podium":true},{"game":9,"date":"2025-11-29","location":"mehdi","player":"Jérôme RIFFE","place":2,"killer":"Franck NAESSENS","tablier":false,"n":11,"points":28,"stake":5,"gross":15,"net":10,"kills":5,"win":false,"podium":true},{"game":9,"date":"2025-11-29","location":"mehdi","player":"Olivier HENGUELLE","place":3,"killer":"","tablier":false,"n":11,"points":23,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":9,"date":"2025-11-29","location":"mehdi","player":"Areski AIT GHERBI","place":4,"killer":"Jérôme RIFFE","tablier":false,"n":11,"points":19,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":9,"date":"2025-11-29","location":"mehdi","player":"Gérard CANDELIER","place":5,"killer":"Franck NAESSENS","tablier":false,"n":11,"points":16,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":9,"date":"2025-11-29","location":"mehdi","player":"Grégoire DUFORET","place":6,"killer":"Gérard CANDELIER","tablier":false,"n":11,"points":13,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2025-11-29","location":"mehdi","player":"Michel SCHERPEREEL","place":7,"killer":"David SAGALOWICZ","tablier":false,"n":11,"points":10,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2025-11-29","location":"mehdi","player":"Mehdi BRAHIMI","place":8,"killer":"Jérôme RIFFE","tablier":false,"n":11,"points":7,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2025-11-29","location":"mehdi","player":"Alexis Volant","place":9,"killer":"Jérôme RIFFE","tablier":false,"n":11,"points":5,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":9,"date":"2025-11-29","location":"mehdi","player":"Jérôme BERA","place":10,"killer":"Alexis Volant","tablier":false,"n":11,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":9,"date":"2025-11-29","location":"mehdi","player":"Jérémy COQUEL","place":11,"killer":"Jérôme RIFFE","tablier":false,"n":11,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2026-01-10","location":"areski","player":"Thierry MONNIAUX","place":1,"killer":"","tablier":true,"n":13,"points":38,"stake":5,"gross":40,"net":35,"kills":4,"win":true,"podium":true},{"game":10,"date":"2026-01-10","location":"areski","player":"Areski AIT GHERBI","place":2,"killer":"Thierry MONNIAUX","tablier":false,"n":13,"points":32,"stake":5,"gross":20,"net":15,"kills":5,"win":false,"podium":true},{"game":10,"date":"2026-01-10","location":"areski","player":"Jérémy COQUEL","place":3,"killer":"Thierry MONNIAUX","tablier":false,"n":13,"points":27,"stake":5,"gross":5,"net":0,"kills":2,"win":false,"podium":true},{"game":10,"date":"2026-01-10","location":"areski","player":"Grégoire DUFORET","place":4,"killer":"Areski AIT GHERBI","tablier":false,"n":13,"points":23,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2026-01-10","location":"areski","player":"Jérémie CARPENTIER","place":5,"killer":"Jérémy COQUEL","tablier":false,"n":13,"points":20,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2026-01-10","location":"areski","player":"Jérôme RIFFE","place":6,"killer":"Jérémy COQUEL","tablier":false,"n":13,"points":17,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2026-01-10","location":"areski","player":"David SAGALOWICZ","place":7,"killer":"Areski AIT GHERBI","tablier":false,"n":13,"points":14,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":10,"date":"2026-01-10","location":"areski","player":"Alexis Volant","place":8,"killer":"Areski AIT GHERBI","tablier":false,"n":13,"points":11,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2026-01-10","location":"areski","player":"Jérôme BERA","place":9,"killer":"Thierry MONNIAUX","tablier":false,"n":13,"points":9,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2026-01-10","location":"areski","player":"Franck NAESSENS","place":10,"killer":"Areski AIT GHERBI","tablier":false,"n":13,"points":7,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2026-01-10","location":"areski","player":"Michel SCHERPEREEL","place":11,"killer":"Areski AIT GHERBI","tablier":false,"n":13,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2026-01-10","location":"areski","player":"François CATTEAU","place":12,"killer":"David SAGALOWICZ","tablier":false,"n":13,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":10,"date":"2026-01-10","location":"areski","player":"Mehdi BRAHIMI","place":13,"killer":"Thierry MONNIAUX","tablier":false,"n":13,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2026-01-17","location":"jerome Riffe","player":"Jules NAESSENS","place":1,"killer":"","tablier":false,"n":8,"points":23,"stake":5,"gross":25,"net":20,"kills":3,"win":true,"podium":true},{"game":11,"date":"2026-01-17","location":"jerome Riffe","player":"Thierry MONNIAUX","place":2,"killer":"","tablier":false,"n":8,"points":18,"stake":5,"gross":10,"net":5,"kills":3,"win":false,"podium":true},{"game":11,"date":"2026-01-17","location":"jerome Riffe","player":"Mehdi BRAHIMI","place":3,"killer":"Jules NAESSENS","tablier":false,"n":8,"points":14,"stake":5,"gross":5,"net":0,"kills":1,"win":false,"podium":true},{"game":11,"date":"2026-01-17","location":"jerome Riffe","player":"Michel SCHERPEREEL","place":4,"killer":"Areski AIT GHERBI","tablier":false,"n":8,"points":11,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2026-01-17","location":"jerome Riffe","player":"Jérôme RIFFE","place":5,"killer":"Mehdi BRAHIMI","tablier":false,"n":8,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2026-01-17","location":"jerome Riffe","player":"Franck NAESSENS","place":6,"killer":"Thierry MONNIAUX","tablier":false,"n":8,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2026-01-17","location":"jerome Riffe","player":"Jérémy COQUEL","place":7,"killer":"Thierry MONNIAUX","tablier":false,"n":8,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":11,"date":"2026-01-17","location":"jerome Riffe","player":"Alexis Volant","place":8,"killer":"Jules NAESSENS","tablier":false,"n":8,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2026-01-24","location":"michel","player":"Jérôme BINOT","place":1,"killer":"","tablier":false,"n":8,"points":23,"stake":5,"gross":25,"net":20,"kills":2,"win":true,"podium":true},{"game":12,"date":"2026-01-24","location":"michel","player":"Jérémy COQUEL","place":2,"killer":"Jérôme BINOT","tablier":false,"n":8,"points":18,"stake":5,"gross":10,"net":5,"kills":1,"win":false,"podium":true},{"game":12,"date":"2026-01-24","location":"michel","player":"Thierry MONNIAUX","place":3,"killer":"Jules NAESSENS","tablier":false,"n":8,"points":14,"stake":5,"gross":5,"net":0,"kills":1,"win":false,"podium":true},{"game":12,"date":"2026-01-24","location":"michel","player":"David SAGALOWICZ","place":4,"killer":"Jérémy COQUEL","tablier":false,"n":8,"points":11,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":12,"date":"2026-01-24","location":"michel","player":"Michel SCHERPEREEL","place":5,"killer":"Thierry MONNIAUX","tablier":false,"n":8,"points":8,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":12,"date":"2026-01-24","location":"michel","player":"Mehdi BRAHIMI","place":6,"killer":"David SAGALOWICZ","tablier":false,"n":8,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2026-01-24","location":"michel","player":"Franck NAESSENS","place":7,"killer":"David SAGALOWICZ","tablier":false,"n":8,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":12,"date":"2026-01-24","location":"michel","player":"François CATTEAU","place":8,"killer":"Michel SCHERPEREEL","tablier":false,"n":8,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2026-01-30","location":"franck","player":"Jérôme BERA","place":1,"killer":"","tablier":true,"n":15,"points":40,"stake":5,"gross":45,"net":40,"kills":5,"win":true,"podium":true},{"game":13,"date":"2026-01-30","location":"franck","player":"Jérôme RIFFE","place":2,"killer":"Jérôme BERA","tablier":false,"n":15,"points":34,"stake":5,"gross":25,"net":20,"kills":0,"win":false,"podium":true},{"game":13,"date":"2026-01-30","location":"franck","player":"Quentin","place":3,"killer":"","tablier":false,"n":15,"points":29,"stake":5,"gross":5,"net":0,"kills":4,"win":false,"podium":true},{"game":13,"date":"2026-01-30","location":"franck","player":"Jules NAESSENS","place":4,"killer":"Jérôme BERA","tablier":false,"n":15,"points":25,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":13,"date":"2026-01-30","location":"franck","player":"Stéphane LEFIN","place":5,"killer":"","tablier":false,"n":15,"points":22,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2026-01-30","location":"franck","player":"Clément Thery","place":6,"killer":"Quentin","tablier":false,"n":15,"points":19,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":13,"date":"2026-01-30","location":"franck","player":"Areski AIT GHERBI","place":7,"killer":"Quentin","tablier":false,"n":15,"points":16,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":13,"date":"2026-01-30","location":"franck","player":"Adrien Thiriez","place":8,"killer":"Quentin","tablier":false,"n":15,"points":13,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2026-01-30","location":"franck","player":"Franck NAESSENS","place":9,"killer":"Quentin","tablier":false,"n":15,"points":11,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2026-01-30","location":"franck","player":"David SAGALOWICZ","place":10,"killer":"Jérôme BERA","tablier":false,"n":15,"points":9,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2026-01-30","location":"franck","player":"Jérôme BINOT","place":11,"killer":"Areski AIT GHERBI","tablier":false,"n":15,"points":7,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":13,"date":"2026-01-30","location":"franck","player":"Mehdi BRAHIMI","place":12,"killer":"Areski AIT GHERBI","tablier":false,"n":15,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2026-01-30","location":"franck","player":"Alexis Volant","place":13,"killer":"Jules NAESSENS","tablier":false,"n":15,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2026-01-30","location":"franck","player":"Thierry MONNIAUX","place":14,"killer":"Jérôme BINOT","tablier":false,"n":15,"points":2,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":13,"date":"2026-01-30","location":"franck","player":"Grégoire DUFORET","place":15,"killer":"Jérôme BINOT","tablier":false,"n":15,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2026-02-14","location":"jéremy","player":"David SAGALOWICZ","place":1,"killer":"","tablier":false,"n":10,"points":32,"stake":5,"gross":30,"net":25,"kills":2,"win":true,"podium":true},{"game":14,"date":"2026-02-14","location":"jéremy","player":"Thierry MONNIAUX","place":2,"killer":"Clément Thery","tablier":false,"n":10,"points":26,"stake":5,"gross":15,"net":10,"kills":1,"win":false,"podium":true},{"game":14,"date":"2026-02-14","location":"jéremy","player":"hélène fiona","place":3,"killer":"","tablier":false,"n":10,"points":21,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":14,"date":"2026-02-14","location":"jéremy","player":"François CATTEAU","place":4,"killer":"David SAGALOWICZ","tablier":false,"n":10,"points":17,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2026-02-14","location":"jéremy","player":"Jérôme RIFFE","place":5,"killer":"hélène fiona","tablier":false,"n":10,"points":14,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":14,"date":"2026-02-14","location":"jéremy","player":"Alexis Volant","place":6,"killer":"Thierry MONNIAUX","tablier":false,"n":10,"points":11,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2026-02-14","location":"jéremy","player":"Frédéric Tavernier","place":7,"killer":"Jérôme RIFFE","tablier":false,"n":10,"points":8,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":14,"date":"2026-02-14","location":"jéremy","player":"Mehdi BRAHIMI","place":8,"killer":"Frédéric Tavernier","tablier":false,"n":10,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":14,"date":"2026-02-14","location":"jéremy","player":"Franck NAESSENS","place":9,"killer":"hélène fiona","tablier":false,"n":10,"points":3,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":14,"date":"2026-02-14","location":"jéremy","player":"Jérémy COQUEL","place":10,"killer":"Franck NAESSENS","tablier":false,"n":10,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2026-02-21","location":"David SAGALOWICZ","player":"David SAGALOWICZ","place":1,"killer":"","tablier":false,"n":9,"points":27,"stake":5,"gross":25,"net":20,"kills":3,"win":true,"podium":true},{"game":15,"date":"2026-02-21","location":"David SAGALOWICZ","player":"Jérôme RIFFE","place":2,"killer":"David SAGALOWICZ","tablier":false,"n":9,"points":22,"stake":5,"gross":15,"net":10,"kills":3,"win":false,"podium":true},{"game":15,"date":"2026-02-21","location":"David SAGALOWICZ","player":"Mehdi BRAHIMI","place":3,"killer":"Jérôme RIFFE","tablier":false,"n":9,"points":17,"stake":5,"gross":5,"net":0,"kills":1,"win":false,"podium":true},{"game":15,"date":"2026-02-21","location":"David SAGALOWICZ","player":"Jérémy COQUEL","place":4,"killer":"Jérôme RIFFE","tablier":false,"n":9,"points":13,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":15,"date":"2026-02-21","location":"David SAGALOWICZ","player":"Jérôme BERA","place":5,"killer":"Jérémy COQUEL","tablier":false,"n":9,"points":10,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2026-02-21","location":"David SAGALOWICZ","player":"Jérôme BINOT","place":6,"killer":"Jérôme RIFFE","tablier":false,"n":9,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2026-02-21","location":"David SAGALOWICZ","player":"Jules NAESSENS","place":7,"killer":"David SAGALOWICZ","tablier":false,"n":9,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2026-02-21","location":"David SAGALOWICZ","player":"Franck NAESSENS","place":8,"killer":"Mehdi BRAHIMI","tablier":false,"n":9,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":15,"date":"2026-02-21","location":"David SAGALOWICZ","player":"Areski AIT GHERBI","place":9,"killer":"David SAGALOWICZ","tablier":false,"n":9,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2026-03-13","location":"François CATTEAU","player":"Grégoire DUFORET","place":1,"killer":"","tablier":false,"n":9,"points":27,"stake":5,"gross":25,"net":20,"kills":2,"win":true,"podium":true},{"game":16,"date":"2026-03-13","location":"François CATTEAU","player":"Jérémy COQUEL","place":2,"killer":"Grégoire DUFORET","tablier":false,"n":9,"points":22,"stake":5,"gross":15,"net":10,"kills":2,"win":false,"podium":true},{"game":16,"date":"2026-03-13","location":"François CATTEAU","player":"François CATTEAU","place":3,"killer":"Jérémy COQUEL","tablier":false,"n":9,"points":17,"stake":5,"gross":5,"net":0,"kills":2,"win":false,"podium":true},{"game":16,"date":"2026-03-13","location":"François CATTEAU","player":"David SAGALOWICZ","place":4,"killer":"François CATTEAU","tablier":false,"n":9,"points":13,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":16,"date":"2026-03-13","location":"François CATTEAU","player":"Frédéric Tavernier","place":5,"killer":"David SAGALOWICZ","tablier":false,"n":9,"points":10,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2026-03-13","location":"François CATTEAU","player":"Franck NAESSENS","place":6,"killer":"Grégoire DUFORET","tablier":false,"n":9,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2026-03-13","location":"François CATTEAU","player":"Jérôme RIFFE","place":7,"killer":"David SAGALOWICZ","tablier":false,"n":9,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2026-03-13","location":"François CATTEAU","player":"Thierry MONNIAUX","place":8,"killer":"","tablier":false,"n":9,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":16,"date":"2026-03-13","location":"François CATTEAU","player":"Alexis Volant","place":9,"killer":"François CATTEAU","tablier":false,"n":9,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2026-03-27","location":"superman","player":"Philippe DUBOIS","place":1,"killer":"","tablier":false,"n":9,"points":27,"stake":5,"gross":25,"net":20,"kills":0,"win":true,"podium":true},{"game":17,"date":"2026-03-27","location":"superman","player":"Alexis Volant","place":2,"killer":"","tablier":false,"n":9,"points":22,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":17,"date":"2026-03-27","location":"superman","player":"Mehdi BRAHIMI","place":3,"killer":"","tablier":false,"n":9,"points":17,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":17,"date":"2026-03-27","location":"superman","player":"David SAGALOWICZ","place":4,"killer":"","tablier":false,"n":9,"points":13,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2026-03-27","location":"superman","player":"Franck NAESSENS","place":5,"killer":"","tablier":false,"n":9,"points":10,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2026-03-27","location":"superman","player":"Thierry MONNIAUX","place":6,"killer":"Jérémy COQUEL","tablier":false,"n":9,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2026-03-27","location":"superman","player":"Areski AIT GHERBI","place":7,"killer":"","tablier":false,"n":9,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2026-03-27","location":"superman","player":"Jérôme RIFFE","place":8,"killer":"","tablier":false,"n":9,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":17,"date":"2026-03-27","location":"superman","player":"Jérôme BERA","place":9,"killer":"","tablier":false,"n":9,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2026-04-10","location":"franck","player":"Jérémy COQUEL","place":1,"killer":"","tablier":false,"n":14,"points":39,"stake":5,"gross":40,"net":35,"kills":3,"win":true,"podium":true},{"game":18,"date":"2026-04-10","location":"franck","player":"Jérémy COQUEL","place":2,"killer":"","tablier":false,"n":14,"points":39,"stake":5,"gross":20,"net":15,"kills":3,"win":false,"podium":true},{"game":18,"date":"2026-04-10","location":"franck","player":"Mehdi BRAHIMI","place":3,"killer":"Jérémy COQUEL","tablier":false,"n":14,"points":33,"stake":5,"gross":10,"net":5,"kills":2,"win":false,"podium":true},{"game":18,"date":"2026-04-10","location":"franck","player":"Jules NAESSENS","place":4,"killer":"Jérémy COQUEL","tablier":false,"n":14,"points":28,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":18,"date":"2026-04-10","location":"franck","player":"Théo Maraval","place":5,"killer":"","tablier":false,"n":14,"points":24,"stake":5,"gross":0,"net":-5,"kills":2,"win":false,"podium":false},{"game":18,"date":"2026-04-10","location":"franck","player":"David SAGALOWICZ","place":6,"killer":"Jérémy COQUEL","tablier":false,"n":14,"points":21,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":18,"date":"2026-04-10","location":"franck","player":"Areski AIT GHERBI","place":7,"killer":"Mehdi BRAHIMI","tablier":false,"n":14,"points":18,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2026-04-10","location":"franck","player":"Clément Thery","place":8,"killer":"Théo Maraval","tablier":false,"n":14,"points":15,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":18,"date":"2026-04-10","location":"franck","player":"Jérôme RIFFE","place":9,"killer":"Jules NAESSENS","tablier":false,"n":14,"points":12,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2026-04-10","location":"franck","player":"Franck NAESSENS","place":10,"killer":"David SAGALOWICZ","tablier":false,"n":14,"points":10,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":18,"date":"2026-04-10","location":"franck","player":"Grégoire DUFORET","place":11,"killer":"Franck NAESSENS","tablier":false,"n":14,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2026-04-10","location":"franck","player":"François CATTEAU","place":12,"killer":"Jules NAESSENS","tablier":false,"n":14,"points":6,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":18,"date":"2026-04-10","location":"franck","player":"Quentin","place":13,"killer":"","tablier":false,"n":14,"points":4,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":18,"date":"2026-04-10","location":"franck","player":"Alexis Volant","place":14,"killer":"François CATTEAU","tablier":false,"n":14,"points":2,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2026-04-18","location":"tchobin","player":"Alexis Volant","place":1,"killer":"","tablier":false,"n":7,"points":19,"stake":5,"gross":20,"net":15,"kills":1,"win":true,"podium":true},{"game":19,"date":"2026-04-18","location":"tchobin","player":"Franck NAESSENS","place":2,"killer":"Alexis Volant","tablier":false,"n":7,"points":15,"stake":5,"gross":10,"net":5,"kills":3,"win":false,"podium":true},{"game":19,"date":"2026-04-18","location":"tchobin","player":"Jérôme BERA","place":3,"killer":"Franck NAESSENS","tablier":false,"n":7,"points":11,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":19,"date":"2026-04-18","location":"tchobin","player":"François CATTEAU","place":4,"killer":"Franck NAESSENS","tablier":false,"n":7,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2026-04-18","location":"tchobin","player":"Areski AIT GHERBI","place":5,"killer":"Franck NAESSENS","tablier":false,"n":7,"points":5,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":19,"date":"2026-04-18","location":"tchobin","player":"Jérôme BINOT","place":6,"killer":"Areski AIT GHERBI","tablier":false,"n":7,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":19,"date":"2026-04-18","location":"tchobin","player":"Jérôme BERA","place":7,"killer":"Franck NAESSENS","tablier":false,"n":7,"points":11,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2026-05-08","location":"jérome Riffe","player":"François CATTEAU","place":1,"killer":"","tablier":false,"n":8,"points":23,"stake":5,"gross":25,"net":20,"kills":4,"win":true,"podium":true},{"game":20,"date":"2026-05-08","location":"jérome Riffe","player":"David SAGALOWICZ","place":2,"killer":"François CATTEAU","tablier":false,"n":8,"points":18,"stake":5,"gross":10,"net":5,"kills":2,"win":false,"podium":true},{"game":20,"date":"2026-05-08","location":"jérome Riffe","player":"Jérôme RIFFE","place":3,"killer":"David SAGALOWICZ","tablier":false,"n":8,"points":14,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":20,"date":"2026-05-08","location":"jérome Riffe","player":"Alexis Volant","place":4,"killer":"François CATTEAU","tablier":false,"n":8,"points":11,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2026-05-08","location":"jérome Riffe","player":"Grégoire DUFORET","place":5,"killer":"David SAGALOWICZ","tablier":false,"n":8,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2026-05-08","location":"jérome Riffe","player":"Mehdi BRAHIMI","place":6,"killer":"François CATTEAU","tablier":false,"n":8,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":20,"date":"2026-05-08","location":"jérome Riffe","player":"Jérémy COQUEL","place":7,"killer":"François CATTEAU","tablier":false,"n":8,"points":3,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":20,"date":"2026-05-08","location":"jérome Riffe","player":"Franck NAESSENS","place":8,"killer":"Jérémy COQUEL","tablier":false,"n":8,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2026-05-13","location":"alexis","player":"Jérôme BINOT","place":1,"killer":"","tablier":false,"n":8,"points":23,"stake":5,"gross":25,"net":20,"kills":1,"win":true,"podium":true},{"game":21,"date":"2026-05-13","location":"alexis","player":"Jérémy COQUEL","place":2,"killer":"François CATTEAU","tablier":false,"n":8,"points":18,"stake":5,"gross":10,"net":5,"kills":7,"win":false,"podium":true},{"game":21,"date":"2026-05-13","location":"alexis","player":"David SAGALOWICZ","place":3,"killer":"François CATTEAU","tablier":false,"n":8,"points":14,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":21,"date":"2026-05-13","location":"alexis","player":"Michel SCHERPEREEL","place":4,"killer":"","tablier":false,"n":8,"points":11,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2026-05-13","location":"alexis","player":"Mehdi BRAHIMI","place":5,"killer":"François CATTEAU","tablier":false,"n":8,"points":8,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2026-05-13","location":"alexis","player":"Jérôme RIFFE","place":6,"killer":"David SAGALOWICZ","tablier":false,"n":8,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2026-05-13","location":"alexis","player":"Jérôme BERA","place":7,"killer":"","tablier":false,"n":8,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":21,"date":"2026-05-13","location":"alexis","player":"Alexis Volant","place":8,"killer":"","tablier":false,"n":8,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2026-06-05","location":"jerôme Riffe","player":"Hélène Fiona","place":1,"killer":"","tablier":false,"n":11,"points":34,"stake":5,"gross":35,"net":30,"kills":5,"win":true,"podium":true},{"game":22,"date":"2026-06-05","location":"jerôme Riffe","player":"Franck NAESSENS","place":2,"killer":"","tablier":false,"n":11,"points":28,"stake":5,"gross":15,"net":10,"kills":0,"win":false,"podium":true},{"game":22,"date":"2026-06-05","location":"jerôme Riffe","player":"Jérémy COQUEL","place":3,"killer":"Jérôme BINOT","tablier":false,"n":11,"points":23,"stake":5,"gross":5,"net":0,"kills":2,"win":false,"podium":true},{"game":22,"date":"2026-06-05","location":"jerôme Riffe","player":"David SAGALOWICZ","place":4,"killer":"Jérémy COQUEL","tablier":false,"n":11,"points":19,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2026-06-05","location":"jerôme Riffe","player":"Areski AIT GHERBI","place":5,"killer":"","tablier":false,"n":11,"points":16,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":22,"date":"2026-06-05","location":"jerôme Riffe","player":"Mehdi BRAHIMI","place":6,"killer":"Jérémy COQUEL","tablier":false,"n":11,"points":13,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":22,"date":"2026-06-05","location":"jerôme Riffe","player":"François CATTEAU","place":7,"killer":"","tablier":false,"n":11,"points":10,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":22,"date":"2026-06-05","location":"jerôme Riffe","player":"Jérôme RIFFE","place":8,"killer":"Jérémy COQUEL","tablier":false,"n":11,"points":7,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2026-06-05","location":"jerôme Riffe","player":"Thierry MONNIAUX","place":9,"killer":"","tablier":false,"n":11,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2026-06-05","location":"jerôme Riffe","player":"Jérôme BERA","place":10,"killer":"Jérémy COQUEL","tablier":false,"n":11,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":22,"date":"2026-06-05","location":"jerôme Riffe","player":"Alexis Volant","place":11,"killer":"Jérémy COQUEL","tablier":false,"n":11,"points":1,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2026-06-13","location":"jéremy shrek","player":"Thierry MONNIAUX","place":1,"killer":"","tablier":false,"n":7,"points":19,"stake":5,"gross":20,"net":15,"kills":3,"win":true,"podium":true},{"game":23,"date":"2026-06-13","location":"jéremy shrek","player":"David SAGALOWICZ","place":2,"killer":"Hélène Fiona","tablier":false,"n":7,"points":15,"stake":5,"gross":10,"net":5,"kills":0,"win":false,"podium":true},{"game":23,"date":"2026-06-13","location":"jéremy shrek","player":"eliot","place":3,"killer":"","tablier":false,"n":7,"points":11,"stake":5,"gross":5,"net":0,"kills":0,"win":false,"podium":true},{"game":23,"date":"2026-06-13","location":"jéremy shrek","player":"Franck NAESSENS","place":4,"killer":"Hélène Fiona","tablier":false,"n":7,"points":8,"stake":5,"gross":0,"net":-5,"kills":1,"win":false,"podium":false},{"game":23,"date":"2026-06-13","location":"jéremy shrek","player":"Jérôme RIFFE","place":5,"killer":"","tablier":false,"n":7,"points":5,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2026-06-13","location":"jéremy shrek","player":"Jérémy COQUEL","place":6,"killer":"","tablier":false,"n":7,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false},{"game":23,"date":"2026-06-13","location":"jéremy shrek","player":"Frédéric Tavernier","place":7,"killer":"Hélène Fiona","tablier":false,"n":7,"points":3,"stake":5,"gross":0,"net":-5,"kills":0,"win":false,"podium":false}];
const ARCHIVE_2025_2026_RANKING=[{"rank":1,"name":"David SAGALOWICZ","points":304,"gamesCount":19,"wins":4,"tabliers":0,"kills":17},{"rank":2,"name":"Jérôme RIFFE","points":281,"gamesCount":20,"wins":1,"tabliers":1,"kills":15},{"rank":3,"name":"Jérémy COQUEL","points":253,"gamesCount":19,"wins":1,"tabliers":0,"kills":22},{"rank":3,"name":"Mehdi BRAHIMI","points":253,"gamesCount":19,"wins":0,"tabliers":0,"kills":13},{"rank":5,"name":"Franck NAESSENS","points":242,"gamesCount":21,"wins":1,"tabliers":0,"kills":16},{"rank":6,"name":"Thierry MONNIAUX","points":231,"gamesCount":14,"wins":2,"tabliers":1,"kills":19},{"rank":7,"name":"Grégoire DUFORET","points":179,"gamesCount":12,"wins":2,"tabliers":0,"kills":11},{"rank":8,"name":"Alexis Volant","points":176,"gamesCount":18,"wins":2,"tabliers":0,"kills":3},{"rank":9,"name":"François CATTEAU","points":155,"gamesCount":13,"wins":2,"tabliers":0,"kills":14},{"rank":9,"name":"Jérôme BERA","points":155,"gamesCount":14,"wins":2,"tabliers":2,"kills":12},{"rank":11,"name":"Areski AIT GHERBI","points":131,"gamesCount":11,"wins":0,"tabliers":0,"kills":12},{"rank":12,"name":"Michel SCHERPEREEL","points":104,"gamesCount":10,"wins":0,"tabliers":0,"kills":3},{"rank":13,"name":"Jules NAESSENS","points":102,"gamesCount":7,"wins":1,"tabliers":0,"kills":8},{"rank":14,"name":"Jérôme BINOT","points":81,"gamesCount":8,"wins":2,"tabliers":0,"kills":4},{"rank":15,"name":"Quentin","points":73,"gamesCount":3,"wins":1,"tabliers":1,"kills":9},{"rank":16,"name":"Jérémie CARPENTIER","points":72,"gamesCount":3,"wins":0,"tabliers":0,"kills":0},{"rank":17,"name":"Olivier HENGUELLE","points":47,"gamesCount":4,"wins":0,"tabliers":0,"kills":0},{"rank":18,"name":"Clément MARAVAL","points":44,"gamesCount":3,"wins":0,"tabliers":0,"kills":0},{"rank":19,"name":"Clément Thery","points":34,"gamesCount":2,"wins":0,"tabliers":0,"kills":2},{"rank":19,"name":"Hélène Fiona","points":34,"gamesCount":1,"wins":1,"tabliers":0,"kills":5},{"rank":21,"name":"Philippe DUBOIS","points":30,"gamesCount":2,"wins":1,"tabliers":0,"kills":0},{"rank":22,"name":"Théo Maraval","points":24,"gamesCount":1,"wins":0,"tabliers":0,"kills":2},{"rank":23,"name":"Stéphane LEFIN","points":22,"gamesCount":1,"wins":0,"tabliers":0,"kills":0},{"rank":24,"name":"Frédéric Tavernier","points":19,"gamesCount":3,"wins":0,"tabliers":0,"kills":1},{"rank":25,"name":"Gérard CANDELIER","points":16,"gamesCount":1,"wins":0,"tabliers":0,"kills":1},{"rank":26,"name":"Adrien Thiriez","points":13,"gamesCount":1,"wins":0,"tabliers":0,"kills":0},{"rank":27,"name":"Romain Schepereel","points":8,"gamesCount":1,"wins":0,"tabliers":0,"kills":0}];
let selectedSeasonKey=CURRENT_SEASON_KEY; // défaut à chaque chargement : saison en cours ; conservation uniquement durant la visite
let recordsScopeKey=CURRENT_SEASON_KEY; // périmètre autonome de Records & accomplissements
let currentSeasonHistoryCache=null;

function isAllSeasons(){return selectedSeasonKey==="all";}
function isArchiveSeason(){return selectedSeasonKey!=="2026-2027";}

function seasonDisplayName(key){
  if(key==="2020-2021")return "2020–2021";
  if(key==="2022-2023")return "2022–2023";
  if(key==="2023-2024")return "2023–2024";
  if(key==="2025-2026")return "2025–2026";
  if(key==="2026-2027")return "2026–2027";
  if(key==="all")return "Toutes les saisons";
  return String(key||"").replace("-","–");
}

function currentRowsForCumulative(){
  let rows=[];
  if(Array.isArray(currentSeasonHistoryCache))rows=clone(currentSeasonHistoryCache);
  else if(selectedSeasonKey===CURRENT_SEASON_KEY)rows=clone(db.history||[]);
  return applyPlayerAliasesToRows(recalcCurrentSeasonPoints(rows));
}

function buildAllSeasonsHistory(){
  const seasons=[
    ["2020-2021",applyPlayerAliasesToRows(ARCHIVE_2020_2021)],
    ["2022-2023",applyPlayerAliasesToRows(ARCHIVE_2022_2023)],
    ["2023-2024",applyPlayerAliasesToRows(ARCHIVE_2023_2024)],
    ["2025-2026",applyPlayerAliasesToRows(ARCHIVE_2025_2026)],
    ["2026-2027",currentRowsForCumulative()]
  ];
  let globalGame=0;
  const out=[];

  for(const [seasonKey,seasonRows] of seasons){
    const groups=new Map();
    for(const raw of seasonRows||[]){
      const sourceGame=Number(raw.sourceGame||raw.game||0);
      if(!Number.isFinite(sourceGame)||sourceGame<=0)continue;
      if(!groups.has(sourceGame))groups.set(sourceGame,[]);
      groups.get(sourceGame).push(raw);
    }
    for(const sourceGame of [...groups.keys()].sort((a,b)=>a-b)){
      globalGame++;
      for(const raw of groups.get(sourceGame)){
        out.push({
          ...clone(raw),
          game:globalGame,
          sourceGame,
          seasonKey,
          seasonLabel:seasonDisplayName(seasonKey)
        });
      }
    }
  }
  return out;
}

function formatGameReference(row,fallbackGame=null){
  const g=Number(row?.sourceGame||fallbackGame||row?.game||0);
  return isAllSeasons() && row?.seasonLabel
    ? `${row.seasonLabel} · P#${g||"—"}`
    : `P#${g||"—"}`;
}

function gameDisplayTitle(row,fallbackGame=null){
  const g=Number(row?.sourceGame||fallbackGame||row?.game||0);
  return isAllSeasons() && row?.seasonLabel
    ? `${row.seasonLabel} · Partie #${g||"—"}`
    : `Partie #${g||"—"}`;
}

function mergeAllSeasonsOfficialStats(rawItems){
  if(!isAllSeasons())return rawItems;

  const official=new Map();
  const ensure=name=>{
    if(!official.has(name))official.set(name,{name,points:0,gamesCount:0,wins:0,tabliers:0,kills:0});
    return official.get(name);
  };

  // Archives sans classement officiel dédié : calculer directement depuis les lignes.
  for(const archiveRows of [ARCHIVE_2020_2021,ARCHIVE_2022_2023]){
    const archiveStats=statsFromRows(applyPlayerAliasesToRows(archiveRows).map(r=>({...r,seasonKey:archiveRows===ARCHIVE_2020_2021?"2020-2021":"2022-2023"}))).filter(s=>s.gamesCount>0);
    for(const r of archiveStats){
      const s=ensure(canonicalPlayerName(r.name));
      s.points+=Number(r.points||0);
      s.gamesCount+=Number(r.gamesCount||0);
      s.wins+=Number(r.wins||0);
      s.tabliers+=Number(r.tabliers||0);
      s.kills+=Number(r.kills||0);
    }
  }

  // Archives disposant d'un classement officiel : conserver points/participations/victoires/kills,
  // mais recalculer les tabliers avec la règle historique de la saison.
  for(const [seasonKey,seasonRanking,seasonRows] of [
    ["2023-2024",ARCHIVE_2023_2024_RANKING,ARCHIVE_2023_2024],
    ["2025-2026",ARCHIVE_2025_2026_RANKING,ARCHIVE_2025_2026]
  ]){
    const tabs=tablierCountsFromRows(applyPlayerAliasesToRows(seasonRows).map(r=>({...r,seasonKey})));
    for(const r of seasonRanking||[]){
      if(String(r.name||"").toLowerCase()==="max")continue;
      const name=canonicalPlayerName(r.name);
      const s=ensure(name);
      s.points+=Number(r.points||0);
      s.gamesCount+=Number(r.gamesCount||0);
      s.wins+=Number(r.wins||0);
      s.tabliers+=Number(tabs.get(name)||0);
      s.kills+=Number(r.kills||0);
    }
  }

  const currentStats=statsFromRows(currentRowsForCumulative()).filter(s=>s.gamesCount>0);
  for(const r of currentStats){
    const s=ensure(canonicalPlayerName(r.name));
    s.points+=Number(r.points||0);
    s.gamesCount+=Number(r.gamesCount||0);
    s.wins+=Number(r.wins||0);
    s.tabliers+=Number(r.tabliers||0);
    s.kills+=Number(r.kills||0);
  }

  const rawMap=new Map();
  for(const r of rawItems||[]){
    const name=canonicalPlayerName(r.name);
    const prev=rawMap.get(name);
    rawMap.set(name,prev?{...prev,points:Number(prev.points||0)+Number(r.points||0),gamesCount:Number(prev.gamesCount||0)+Number(r.gamesCount||0)}:{...r,name});
  }
  const names=new Set([...rawMap.keys(),...official.keys()]);

  return [...names].map(name=>{
    const raw=rawMap.get(name)||{
      name,points:0,gamesCount:0,wins:0,podiums:0,tabliers:0,kills:0,
      stake:0,gross:0,net:0,avgPoints:0,winRate:0,podiumRate:0,kpg:0
    };
    const o=official.get(name);
    if(!o)return raw;

    const gamesCount=Number(o.gamesCount||0);
    const points=Number(o.points||0);
    const wins=Number(o.wins||0);
    const kills=Number(o.kills||0);

    return {
      ...raw,
      points,
      gamesCount,
      wins,
      tabliers:Number(o.tabliers||0),
      kills,
      avgPoints:gamesCount?points/gamesCount:0,
      winRate:gamesCount?wins/gamesCount*100:0,
      kpg:gamesCount?kills/gamesCount:0
    };
  });
}

const BPT_ANNALES_NICKNAMES={"Franck NAESSENS":["Francis Chatard","Chatard en Chef","Boucher en Chef","Boule à Facettes","Dogarty04","Dégolas","Raoul"],"Jérôme BINOT":["Tchobin","Panama","El Toucan","String Borat","Le Myticulteur","Livre La Moulasse","Chatard en Second"],"Jérôme BERA":["Superman","Slip Rouge","Cerf-Volant","Chip Leader","Ouvrier Plumeur"],"Olivier HENGUELLE":["Miguel","Migolivier","MigGeger","Désosseur","Jean-Michel j’aurais dû jouer !"],"Mehdi BRAHIMI":["El Español","M Le Maudit","Kabiloute","Dégraisseur","Bachybouzouk","Cobra"],"Michel SCHERPEREEL":["Scotty Nguyen","Michmuch59","Micheline59","Boyaudier","Club55"],"Alexis VOLANT":["Biogold","Petit Cœur","L’architecte","Le Neveu de Tonton","Le Jeune Loup de Wall Street"],"Jérôme RIFFE":["Le Chat","Pitch And Putt","Coupeur de Quartier","Djayrem"],"François CATTEAU":["Le Dealer","Chargé de Pesée","Jean Guile","Bpt59"],"Jérémy COQUEL":["Shrek","Kersh"],"Thierry MONNIAUX":["L’antidote","Désosseur Pareur","TYMOON69"],"Stéphane LEFIN":["Phœnix","Boucher Gérant","George Luke Ass","Pevelef"],"David SAGALOWICZ":["The Shaker"],"Areski AIT GHERBI":["Kikipoker","Areskilimero","Kiki Le Magnifique"],"Anne BERA":["Maya","Nanou","PrinceLeia59"],"Gérard CANDELIER":["Le Lion d’Arras","Le Professeur","Le Templier","Eviscérateur","GG ARRAS"],"Jérémie CARPENTIER":["Le Trader","Sacrificateur","Lanseria44"],"Mélanie NAESSENS":["Francine Chatard"],"Grégoire DUFORET":["Robin Hood","Grofud"],"Florence SAGALOWICZ":["La Dame de Cœur"],"Dylan DECOTTE":["Rocky Balboa"],"Philippe DUBOIS":["Taz","Japlpel","Accrocheur en Abattoir","J’Adore Pulvériser Les Pokermen En Ligne"],"Solène BALLOIS":["SoBa","Poupée","La Chatte à la Voisine"],"Juliette PENIN":["Wild Horses"],"Jules NAESSENS":["Serial Senior Killer"],"Arnaud HEDIN":["Nono la Saumure"],"Clément MARAVAL":["Scotland Beret","Pointbreak8"],"Thomas DELVAL":["Kitemalaman"],"Hélène MORIZUR":["Psycho Girl","Tazette"],"Mélanie BINOT":["Micromachine","Bazouka"]};

function normalizePlayerLookupName(name){
  return String(name||"")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .trim().replace(/\s+/g," ").toLocaleUpperCase("fr");
}

function annalesNicknamesFor(name){
  const key=normalizePlayerLookupName(name);
  for(const [fullName,nicks] of Object.entries(BPT_ANNALES_NICKNAMES)){
    if(normalizePlayerLookupName(fullName)===key)return [...nicks];
  }
  return [];
}

function playerNicknameInfo(name){
  const real=String(name||"").trim();
  const player=(db.players||[]).find(p=>normalizePlayerLookupName(p?.name)===normalizePlayerLookupName(real));
  const configured=String(player?.nickname||"").trim();
  const annales=annalesNicknamesFor(real);
  const primary=configured || annales[0] || "";
  const others=annales.filter(n=>n!==primary);
  return {primary,others,source:configured?"joueur":(annales.length?"annales":"")};
}

function displayPlayerName(name){
  return String(name||"").trim();
}

function playerNicknameSecondary(name){
  const nick=playerNicknameInfo(name).primary;
  return nick?`(${nick})`:"";
}

function funPlayerLabel(name){
  const real=String(name||"").trim();
  const nick=playerNicknameInfo(real).primary;
  return nick || real;
}

function bptHistoricalStartAt(date){
  const match=String(date||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!match)return null;
  const target=Date.UTC(Number(match[1]),Number(match[2])-1,Number(match[3]),21,15);
  const formatter=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  let at=target;
  for(let i=0;i<2;i++){
    const parts=Object.fromEntries(formatter.formatToParts(new Date(at)).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
    const local=Date.UTC(parts.year,parts.month-1,parts.day,parts.hour,parts.minute,parts.second);
    at+=target-local;
  }
  return at;
}

function bptGameTiming(rows){
  const list=Array.isArray(rows)?rows:[],first=list[0]||{};
  const positive=key=>list.map(r=>Number(r[key])).find(n=>Number.isFinite(n)&&n>0)||null;
  const recordedStart=positive('gameStartedAt'),recordedEnd=positive('gameFinishedAt');
  const startedAt=recordedStart||bptHistoricalStartAt(first.date);
  const second=list.find(r=>Number(r.place)===2),third=list.find(r=>Number(r.place)===3);
  const historical=!recordedStart;
  let finishedAt=recordedEnd||Number(second?.outAt)||null;
  let durationSec=recordedStart&&finishedAt?Math.max(0,Math.floor((finishedAt-recordedStart)/1000)):positive('gameDurationSec')||0;
  if(!durationSec&&historical&&second)durationSec=bestElapsedForRow(second,list);
  if(!finishedAt&&startedAt&&durationSec)finishedAt=startedAt+durationSec*1000;
  let headsUpStartedAt=positive('gameHeadsUpStartedAt');
  let huElapsed=null;
  const n=Math.max(list.length,...list.map(r=>Number(r.n)||0));
  if(!headsUpStartedAt&&n===2)headsUpStartedAt=startedAt;
  if(!headsUpStartedAt&&third){
    headsUpStartedAt=Number(third.outAt)||null;
    if(!headsUpStartedAt){
      const direct=Number(third.outElapsedSec);
      huElapsed=Number.isFinite(direct)&&third.outElapsedSec!=null&&direct>=0?direct:historical?(legacyElapsedFromOutTime(third.outTime)||Math.floor(bestElapsedForRow(third,list)/60)*60):null;
      if(huElapsed!=null&&startedAt)headsUpStartedAt=startedAt+huElapsed*1000;
    }
  }
  let headsUpDurationSec=headsUpStartedAt&&finishedAt?Math.floor((finishedAt-headsUpStartedAt)/1000):huElapsed!=null?Math.floor(durationSec-huElapsed):null;
  if(headsUpDurationSec==null)headsUpDurationSec=positive('gameHeadsUpDurationSec');
  if(headsUpDurationSec!=null&&(headsUpDurationSec<0||headsUpDurationSec>durationSec))headsUpDurationSec=null;
  return {startedAt,finishedAt,durationSec,headsUpStartedAt,headsUpDurationSec,source:historical?'historical':'recorded'};
}

function formatGameDuration(totalSec){
  const sec=Math.max(0,Number(totalSec)||0);
  if(!sec)return "—";
  const totalMin=Math.round(sec/60);
  const h=Math.floor(totalMin/60);
  const m=totalMin%60;
  return h>0 ? `${h} h ${String(m).padStart(2,"0")}` : `${m} min`;
}

function formatElapsedElimination(totalSec){
  const sec=Math.max(0,Number(totalSec)||0);
  if(!sec)return "";
  const totalMin=Math.floor(sec/60);
  const h=Math.floor(totalMin/60);
  const m=totalMin%60;
  return h>0 ? `${h} h ${String(m).padStart(2,"0")}` : `${m} min`;
}

function legacyElapsedFromOutTime(outTime){
  const raw=String(outTime||"").trim();
  if(!raw)return 0;

  const m=raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if(!m)return 0;

  const h=Number(m[1]);
  const min=Number(m[2]);
  const sec=Number(m[3]||0);
  if(h<0||h>23||min<0||min>59||sec<0||sec>59)return 0;

  // Anciennes parties BPT : heure de départ conventionnelle 21 h 15.
  const startSec=21*3600+15*60;
  let outSec=h*3600+min*60+sec;

  // Si l'élimination est après minuit, on bascule au jour suivant.
  if(outSec<startSec)outSec+=24*3600;

  const elapsed=outSec-startSec;

  // Garde-fou : on n'affiche que des durées plausibles de tournoi.
  if(elapsed<=0 || elapsed>12*3600)return 0;
  return elapsed;
}

function estimatedLegacyElapsedWithoutClock(row, gameRows){
  const place=Number(row?.place||0);
  const participants=Math.max(0, Array.isArray(gameRows)?gameRows.length:0);
  const elimCount=Math.max(0, participants-1);

  if(place<=1 || !participants || place>participants || elimCount<1)return 0;

  const gameNo=Number(row?.game||0);

  // Hypothèses historiques BPT.
  // Partie 1 :
  // - début 21 h 15
  // - 1re élimination 23 h 15 => 2 h de jeu
  // - fin 2 h 15 => 5 h de jeu
  //
  // Autres anciennes parties sans heure enregistrée :
  // - début 21 h 15
  // - 1re élimination 23 h 00 => 1 h 45
  // - fin 1 h 45 => 4 h 30
  const firstBustSec = gameNo===1
    ? 2*3600
    : (1*3600)+(45*60);

  const finalBustSec = gameNo===1
    ? 5*3600
    : (4*3600)+(30*60);

  if(elimCount===1)return finalBustSec;

  // Ordre d'élimination : dernier = 1er sorti, 2e = dernier sorti
  const order = participants - place + 1; // 1..elimCount

  if(order<=1)return firstBustSec;
  if(order>=elimCount)return finalBustSec;

  // Écarts géométriquement décroissants : les éliminations s'accélèrent.
  const ratio=0.82;
  const gapCount=elimCount-1;
  const weights=Array.from({length:gapCount},(_,i)=>Math.pow(ratio,i));
  const totalWeight=weights.reduce((s,v)=>s+v,0);
  const totalWindow=finalBustSec-firstBustSec;

  let elapsed=firstBustSec;
  for(let i=0;i<order-1;i++){
    elapsed += totalWindow * (weights[i]/totalWeight);
  }

  return Math.max(firstBustSec, Math.min(finalBustSec, Math.round(elapsed)));
}

function bestElapsedForRow(row, gameRows){
  const direct=Number(row?.outElapsedSec)||0;
  if(direct>0)return direct;

  const legacy=legacyElapsedFromOutTime(row?.outTime);
  if(legacy>0)return legacy;

  return estimatedLegacyElapsedWithoutClock(row, gameRows);
}

function playTimeDisplay(row, gameRows){
  if(Number(row?.place)===1)return "—";

  const elapsed=bestElapsedForRow(row, gameRows);
  return elapsed>0 ? formatElapsedElimination(elapsed) : "Non disponible";
}

function gameUnlockedAchievements(gameNo){
  const history=Array.isArray(db.history)?db.history:[];
  const g=Number(gameNo);
  if(!Number.isFinite(g) || g<=0)return [];

  const gameRows=history.filter(r=>Number(r.game)===g);
  if(!gameRows.length)return [];

  const beforeRows=history.filter(r=>Number(r.game)<g);
  const throughRows=history.filter(r=>Number(r.game)<=g);
  const before=achievementPlayers(beforeRows);
  const after=achievementPlayers(throughRows);
  const beforeMap=new Map(before.map(a=>[a.name,new Set(a.players||[])]));
  const gamePlayers=new Set(gameRows.map(r=>String(r.player||"")).filter(Boolean));
  const unlocked=[];

  for(const a of after){
    if(a.dynamic)continue;
    const previous=beforeMap.get(a.name)||new Set();
    const players=(a.players||[]).filter(p=>gamePlayers.has(p) && !previous.has(p));
    if(players.length)unlocked.push({...a,players});
  }
  return unlocked;
}

// 10.4.33 — Avatar d'un joueur : avatar choisi, sinon initiales sur une couleur propre au joueur.
const BPT_AVATAR_COLORS=["#e4572e","#f3a712","#29bf12","#00a5cf","#7b4fd6","#d81e5b","#1b998b","#ff6f59","#3d5a80","#c17c74","#6a994e","#bc4b51","#5e60ce","#2a9d8f","#e76f51","#8338ec"];
function bptAvatarColor(name){
  let h=0;for(const ch of String(name||""))h=(h*31+ch.charCodeAt(0))>>>0;
  return BPT_AVATAR_COLORS[h%BPT_AVATAR_COLORS.length];
}
function bptAvatarHtml(name,size="sm"){
  const real=String(name||"").trim();if(!real)return "";
  const id=playerAvatarId(real);
  if(id)return `<span class="bpt-av bpt-av-${size}"><img src="${playerAvatarDataUrl(id)}" alt="" loading="lazy"></span>`;
  const init=real.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase();
  return `<span class="bpt-av bpt-av-${size}" style="--av:${bptAvatarColor(real)}" aria-hidden="true">${esc(init)}</span>`;
}
function playerNameHtml(name,{button=false,buttonClass="",onclick="",breakName=false,avatar=true,avatarSize="sm"}={}){
  const real=String(name||"").trim();
  const nick=playerNicknameInfo(real).primary;
  const nameParts=real.split(/\s+/);
  const official=breakName&&nameParts.length>1?`${esc(nameParts[0])}<br>${esc(nameParts.slice(1).join(" "))}`:esc(real);
  const inner=`<span class="player-primary-name">${official}</span>${nick?`<span class="player-secondary-nickname">(${esc(nick)})</span>`:""}`;
  const av=avatar&&real?bptAvatarHtml(real,avatarSize):"";
  const body=av?`${av}<span class="bpt-av-text">${inner}</span>`:inner;
  const cls=av?" has-avatar":"";
  if(button){
    return `<button class="player-link player-name-stack${cls} ${buttonClass}" ${onclick?`onclick="${onclick}"`:""}>${body}</button>`;
  }
  return `<span class="player-name-stack${cls}">${body}</span>`;
}

function ensurePlayerPhotos(){
  if(!db.playerPhotos || typeof db.playerPhotos!=="object" || Array.isArray(db.playerPhotos)){
    db.playerPhotos={};
  }
  return db.playerPhotos;
}


let latestGameSelectedKey=null;

function ensureGamePhotos(){
  if(!db.gamePhotos || typeof db.gamePhotos!=="object" || Array.isArray(db.gamePhotos)){
    db.gamePhotos={};
  }
  return db.gamePhotos;
}

function currentGamePhotoSeasonKey(){
  if(typeof selectedSeasonKey!=="undefined" && selectedSeasonKey && selectedSeasonKey!=="all")return selectedSeasonKey;
  return CURRENT_SEASON_KEY;
}
function gamePhotoKey(gameNo,seasonKey=null){ return `${seasonKey||currentGamePhotoSeasonKey()}|${Number(gameNo)||0}`; }
function gamePhotoStorageSegment(value){
  return String(value||"season").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-zA-Z0-9._-]+/g,"-").replace(/^-+|-+$/g,"") || "season";
}
function gamePhotoFirebasePath(gameNo,seasonKey=null){
  const season=gamePhotoStorageSegment(seasonKey||currentGamePhotoSeasonKey());
  return `bpt/photos/${season}/game-${Number(gameNo)||0}`;
}
const firebasePhotoCache={};
const firebasePhotoRequested=new Set();
function mergePhotoMaps(a,b){
  const out={}; const left=(a&&typeof a==="object"&&!Array.isArray(a))?a:{}; const right=(b&&typeof b==="object"&&!Array.isArray(b))?b:{};
  Object.entries(left).forEach(([k,v])=>{if(typeof v==="string"&&v)out[k]=v;});
  Object.entries(right).forEach(([k,v])=>{if(typeof v==="string"&&v)out[k]=v;}); return out;
}
async function ensureGamePhotoStorageClient(){
  if(!window.bptFirebaseEnsure)return false;
  try{ await window.bptFirebaseEnsure(); return true; }catch(e){ console.warn("BPT photo Firebase:",e); return false; }
}
function firebasePhotoErrorMessage(error){ return String(error?.message||error||"Erreur Photo."); }
async function fileToCompressedBlob(file){
  return new Promise((resolve,reject)=>{
    if(!file){resolve(null);return;} if(!String(file.type||"").startsWith("image/")){reject(new Error("Le fichier sélectionné n’est pas une image."));return;}
    const reader=new FileReader(); reader.onerror=()=>reject(new Error("Impossible de lire l’image."));
    reader.onload=()=>{ const img=new Image(); img.onerror=()=>reject(new Error("Format d’image non reconnu."));
      img.onload=()=>{ const max=800; const ratio=Math.min(1,max/Math.max(img.width,img.height)); const w=Math.max(1,Math.round(img.width*ratio)),h=Math.max(1,Math.round(img.height*ratio));
        const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;const ctx=canvas.getContext("2d");ctx.drawImage(img,0,0,w,h);
        canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Impossible de compresser l’image.")),"image/jpeg",0.68);
      }; img.src=reader.result; }; reader.readAsDataURL(file);
  });
}
function dataUrlToBlob(dataUrl){
  try{const [head,body]=String(dataUrl||"").split(",",2);const mime=(head.match(/^data:([^;]+)/)||[])[1]||"image/jpeg";const bytes=atob(body||"");const arr=new Uint8Array(bytes.length);for(let i=0;i<bytes.length;i++)arr[i]=bytes.charCodeAt(i);return new Blob([arr],{type:mime});}catch(_e){return null;}
}

async function migrateLegacyGamePhotoToUrl(gameNo,seasonKey,legacyValue){
  const raw=String(legacyValue||"");
  if(!raw.startsWith("data:image/"))return raw;

  const blob=dataUrlToBlob(raw);
  if(!blob)return raw;

  try{
    return await uploadGamePhotoBlob(gameNo,seasonKey,blob,{silent:true});
  }catch(e){
    console.warn("Migration photo partie vers URL :",e);
    return raw;
  }
}

async function migrateLegacyPhotoMapsToUrls(){
  const gameMap=ensureGamePhotos();

  for(const [key,value] of Object.entries(gameMap)){
    const raw=String(value||"");
    if(!raw.startsWith("data:image/"))continue;

    const parts=String(key).split("|");
    const gameNo=Number(parts[parts.length-1])||0;
    const seasonKey=parts.length>1?parts.slice(0,-1).join("|"):null;
    if(!gameNo)continue;

    const url=await migrateLegacyGamePhotoToUrl(gameNo,seasonKey,raw);
    if(/^https?:\/\//i.test(url)){
      gameMap[key]=url;
      firebasePhotoCache[key]=url;
    }
  }

  saveLocalOnly();
}

async function fetchFirebaseGamePhoto(gameNo,seasonKey=null){
  const key=gamePhotoKey(gameNo,seasonKey); if(firebasePhotoRequested.has(key))return firebasePhotoCache[key]||""; firebasePhotoRequested.add(key);
  try{
    if(!await ensureGamePhotoStorageClient())return "";
    const dbx=window.bptFirebaseDb?.(); if(!dbx)return "";
    const snap=await dbx.ref(gamePhotoFirebasePath(gameNo,seasonKey)).once("value");
    const val=snap.val();
    const data=typeof val==="string"?val:String(val?.url||val?.data||"");
    if(data.startsWith("data:image/")){
      firebasePhotoCache[key]=data;

      setTimeout(async()=>{
        const migrated=await migrateLegacyGamePhotoToUrl(gameNo,seasonKey,data);
        if(/^https?:\/\//i.test(migrated)){
          firebasePhotoCache[key]=migrated;
          ensureGamePhotos()[key]=migrated;
          saveLocalOnly();
          if(typeof renderLatestGame==="function")renderLatestGame();
        }
      },0);

      if(typeof renderLatestGame==="function")setTimeout(renderLatestGame,0);
      return data;
    }

    if(/^https?:\/\//i.test(data)){
      firebasePhotoCache[key]=data;
      if(typeof renderLatestGame==="function")setTimeout(renderLatestGame,0);
      return data;
    }
  }catch(e){ console.warn("Lecture photo Firebase:",e); }
  return "";
}
function getGamePhoto(gameNo,seasonKey=null){
  const key=gamePhotoKey(gameNo,seasonKey);
  const local=String(ensureGamePhotos()[key]||"");
  if(local.startsWith("data:image/") || /^https?:\/\//i.test(local)){ firebasePhotoCache[key]=local; return local; }
  if(firebasePhotoCache[key])return firebasePhotoCache[key];
  // V9.0.24 : la photo historique embarquée de la partie 5 de la saison courante
  // sert de secours si l'ancien nettoyage l'a déjà supprimée de Firebase.
  if(Number(gameNo)===5 && String(seasonKey||currentGamePhotoSeasonKey())===String(CURRENT_SEASON_KEY)) return "./partie-5.jpg";
  fetchFirebaseGamePhoto(gameNo,seasonKey); return "";
}
async function uploadGamePhotoBlob(gameNo,seasonKey,blob,{silent=false}={}){
  if(!blob)throw new Error("Image vide.");

  const key=gamePhotoKey(gameNo,seasonKey);
  const safeSeason=bptSafeFilePart(seasonKey||"season");
  const path=`games/${safeSeason}/game-${Number(gameNo)||0}.jpg`;
  const url=await bptUploadPhotoBlobToUrl(path,blob);

  // Firebase ne conserve plus que l'URL publique.
  if(await ensureGamePhotoStorageClient()){
    const dbx=window.bptFirebaseDb?.();
    if(dbx){
      await dbx.ref(gamePhotoFirebasePath(gameNo,seasonKey)).set({
        url,
        updatedAt:Date.now()
      });
    }
  }

  ensureGamePhotos()[key]=url;
  firebasePhotoCache[key]=url;
  saveLocalOnly();

  if(typeof renderLatestGame==="function")renderLatestGame();
  if(!silent)alert("Photo enregistrée.");
  return url;
}
async function migrateLegacyLocalGamePhotosToStorage(){
  if(!await ensureGamePhotoStorageClient())return false;
  const entries=Object.entries(ensureGamePhotos()).filter(([,v])=>String(v||"").startsWith("data:image/")); if(!entries.length)return true;
  let migrated=0;
  for(const [key,dataUrl] of entries){ const split=String(key).lastIndexOf("|"); if(split<0)continue; const season=key.slice(0,split), gameNo=Number(key.slice(split+1)); if(!gameNo)continue; const blob=dataUrlToBlob(dataUrl); if(!blob)continue;
    try{await uploadGamePhotoBlob(gameNo,season,blob,{silent:true});migrated++;}catch(e){console.warn("Migration photo locale différée :",e);return false;}
  }
  if(migrated){saveLocalOnly();renderLatestGame();setCloudStatus("ok",`${migrated} photo${migrated>1?"s":""} migrée${migrated>1?"s":""}`,"Photos transférées dans Firebase Realtime Database.");} return true;
}
async function syncSharedPhotosWithRetry(attempt=0){if(await ensureGamePhotoStorageClient()){await migrateLegacyLocalGamePhotosToStorage();return;}if(attempt<8)setTimeout(()=>syncSharedPhotosWithRetry(attempt+1),1000);}
async function saveGamePhoto(gameNo,file,seasonKey=null){
  if(!file)return; try{setCloudStatus("busy","Envoi de la photo…","Compression puis sauvegarde dans Firebase.");const blob=await fileToCompressedBlob(file);await uploadGamePhotoBlob(gameNo,seasonKey,blob,{silent:false});renderLatestGame();if(typeof renderHistory==="function")renderHistory();}
  catch(e){setCloudStatus("offline","Photo non sauvegardée",firebasePhotoErrorMessage(e));alert(firebasePhotoErrorMessage(e));}
}
async function deleteGamePhoto(gameNo,seasonKey=null){
  const key=gamePhotoKey(gameNo,seasonKey); if(!confirm("Retirer la photo de cette partie ?"))return;
  try{if(!await ensureGamePhotoStorageClient())throw new Error("Firebase indisponible.");const dbx=window.bptFirebaseDb?.();await dbx.ref(gamePhotoFirebasePath(gameNo,seasonKey)).remove();delete firebasePhotoCache[key];firebasePhotoRequested.delete(key);delete ensureGamePhotos()[key];saveLocalOnly();setCloudStatus("ok","Photo retirée","La photo n’est plus affichée dans BPT.");renderLatestGame();}
  catch(e){setCloudStatus("offline","Suppression impossible",firebasePhotoErrorMessage(e));alert(firebasePhotoErrorMessage(e));}
}

// V9.0.24 — les photos de parties sont conservées sans limite de numéro.
// Ancienne fonction gardée en no-op pour compatibilité avec d'éventuels appels historiques.

function latestGameEntries(){
  return groupedGames().map(([gameNo,rows])=>({
    gameNo:Number(gameNo),
    rows,
    seasonKey:(rows?.[0]?.seasonKey)||currentGamePhotoSeasonKey()
  }));
}

function latestGameEntryKey(entry){
  return `${entry.seasonKey||currentGamePhotoSeasonKey()}|${entry.gameNo}`;
}

function selectLatestGameOffset(delta){
  const games=latestGameEntries();
  if(!games.length)return;
  let idx=games.findIndex(g=>latestGameEntryKey(g)===latestGameSelectedKey);
  if(idx<0)idx=games.length-1;
  idx=Math.max(0,Math.min(games.length-1,idx+delta));
  latestGameSelectedKey=latestGameEntryKey(games[idx]);
  renderLatestGame();
}


function openGamePhotoModal(src,caption=""){
  if(!src)return;
  const modal=$("gamePhotoModal");
  if(!modal)return;
  $("gamePhotoModalImage").src=src;
  $("gamePhotoModalCaption").textContent=caption;
  modal.style.display="flex";
}

function closeGamePhotoModal(){
  const modal=$("gamePhotoModal");
  if(modal)modal.style.display="none";
}






function playerDisplayWithRealName(name){
  const real=String(name||"").trim();
  const nick=playerNicknameInfo(real).primary;
  return nick && normalizePlayerLookupName(nick)!==normalizePlayerLookupName(real)
    ? `${real} · (${nick})`
    : real;
}


async function savePlayerNickname(name,value){
  const player=String(name||"").trim();
  if(!player)return;
  const nick=String(value||"").trim().replace(/\s+/g," ");
  const rec=(db.players||[]).find(p=>normalizePlayerLookupName(p?.name)===normalizePlayerLookupName(player));
  if(!rec)return;
  rec.nickname=nick;
  saveDB();
  renderPlayers();
  if($("profilePlayerSelect")?.value===player)renderProfile(player);
}

function ensurePlayerAliases(){
  if(!db.playerAliases || typeof db.playerAliases!=="object" || Array.isArray(db.playerAliases))db.playerAliases={};
  return db.playerAliases;
}
const BPT_BUILTIN_PLAYER_ALIASES={
  // Correspondances historiques validées par l'organisateur BPT.
  "ALEXIS BIOGOLD":"Alexis Volant",
  "ANNE MAYA":"Anne BERA",
  "ARESKI":"Areski AIT GHERBI",
  "ARMELLE":"Armelle BRAHIMI",
  "ARMELLE ARRAS":"Armell ARRAS",
  "ARNAUD":"Arnaud HEDIN",
  "CLEMENT":"Clément MARAVAL",
  "DAVID SHAKER":"David SAGALOWICZ",
  "DYLAN":"Dylan DECOTTE",
  "FLORENCE":"Florence SAGALOWICZ",
  "FRANCK CHATARD":"Franck NAESSENS",
  "FRANCOIS":"François CATTEAU",
  "GERARD":"Gérard CANDELIER",
  "GREG":"Grégoire DUFORET",
  "HELENE":"Hélène MORIZUR",
  "JEREMIE TRADER":"Jérémie CARPENTIER",
  "JEROME ICAMER":"Jérôme RIFFE",
  "JEROME SUPERMAN":"Jérôme BERA",
  "JULIETTE H":"Juliette HENGUELLE",
  "MEHDI EL ESPANOL":"Mehdi BRAHIMI",
  "MEL":"Mélanie NAESSENS",
  "MEL N":"Mélanie NAESSENS",
  "MEL B":"Mélanie BINOT",
  "MICHEL SCOTTY":"Michel SCHERPEREEL",
  "MIG":"Olivier HENGUELLE",
  "PHOENIX":"Stéphane LEFIN",
  "SHREK":"Jérémy COQUEL",
  "SOLENE":"Solène BALLOIS",
  "STEPHANE PHOENIX":"Stéphane LEFIN",
  "STEPHANE RIMBAUD":"Stéphane ROBERT",
  "SUPERMAN":"Jérôme BERA",
  "TAZ":"Philippe DUBOIS",
  "TCHOBIN PANAMA":"Jérôme BINOT",
  "THIERRY":"Thierry MONNIAUX"
};
function playerAliasLookupKey(name){
  return String(name||"").trim().replace(/\s+/g," ")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase();
}
function canonicalPlayerName(name){
  let cur=String(name||"").trim().replace(/\s+/g," ");
  const aliases=ensurePlayerAliases();
  const seen=new Set();
  while(cur){
    const key=playerAliasLookupKey(cur);
    if(!key || seen.has(key))break;
    seen.add(key);
    const builtinKey=Object.keys(BPT_BUILTIN_PLAYER_ALIASES).find(k=>playerAliasLookupKey(k)===key);
    const customKey=Object.keys(aliases).find(k=>playerAliasLookupKey(k)===key);
    const next=(builtinKey?BPT_BUILTIN_PLAYER_ALIASES[builtinKey]:null)||(customKey?aliases[customKey]:null);
    if(!next)break;
    cur=String(next||"").trim().replace(/\s+/g," ");
  }
  return cur;
}

function applyPlayerAliasesToRows(rows){
  return (rows||[]).map(r=>({
    ...clone(r),
    player:canonicalPlayerName(r.player),
    killer:r.killer?canonicalPlayerName(r.killer):""
  }));
}
function mergeRankingAliases(rows){
  const map=new Map();
  for(const r of rows||[]){
    const name=canonicalPlayerName(r.name);
    if(!map.has(name))map.set(name,{...r,name,points:0,gamesCount:0,wins:0,tabliers:0,kills:0});
    const x=map.get(name);
    x.points+=Number(r.points||0);
    x.gamesCount+=Number(r.gamesCount||0);
    x.wins+=Number(r.wins||0);
    x.tabliers+=Number(r.tabliers||0);
    x.kills+=Number(r.kills||0);
  }
  return [...map.values()]
    .sort((a,b)=>Number(b.points||0)-Number(a.points||0)||a.name.localeCompare(b.name,"fr"))
    .map((r,i)=>({...r,rank:i+1}));
}
function archiveRowsForSeason(key){
  if(key==="2020-2021")return ARCHIVE_2020_2021;
  if(key==="2022-2023")return ARCHIVE_2022_2023;
  if(key==="2023-2024")return ARCHIVE_2023_2024;
  if(key==="2025-2026")return ARCHIVE_2025_2026;
  return null;
}
function rankingFromArchiveRows(rows){
  const by=new Map();
  for(const r of rows||[]){
    const name=canonicalPlayerName(r.player);
    if(!by.has(name))by.set(name,{name,points:0,games:new Set(),wins:0,tabliers:0,kills:0});
    const x=by.get(name); x.points+=Number(r.points||0); x.games.add(Number(r.game||0));
    if(r.win||Number(r.place)===1)x.wins++; if(isTablierRow(r))x.tabliers++; x.kills+=Number(r.kills||0);
  }
  return [...by.values()].map(x=>({name:x.name,points:x.points,gamesCount:x.games.size,wins:x.wins,tabliers:x.tabliers,kills:x.kills}));
}
function archiveOfficialRanking(){
  if(selectedSeasonKey==="2025-2026" || selectedSeasonKey==="2023-2024"){
    const ranking=mergeRankingAliases(selectedSeasonKey==="2025-2026"?ARCHIVE_2025_2026_RANKING:ARCHIVE_2023_2024_RANKING);
    const rows=applyPlayerAliasesToRows(selectedSeasonKey==="2025-2026"?ARCHIVE_2025_2026:ARCHIVE_2023_2024).map(r=>({...r,seasonKey:selectedSeasonKey}));
    const tabs=tablierCountsFromRows(rows);
    return ranking.map(r=>({...r,tabliers:Number(tabs.get(canonicalPlayerName(r.name))||0)}));
  }
  const rows=archiveRowsForSeason(selectedSeasonKey);
  return rows?mergeRankingAliases(rankingFromArchiveRows((rows||[]).map(r=>({...r,seasonKey:selectedSeasonKey})))):null;
}

function mergeArchiveOfficialStats(items){
  const archiveRanking=archiveOfficialRanking();
  if(!Array.isArray(archiveRanking))return items;
  const official=new Map(archiveRanking.map(r=>[r.name,r]));
  return items.map(s=>{
    const o=official.get(s.name);
    if(!o)return s;
    const gamesCount=Number(o.gamesCount||0);
    const points=Number(o.points||0);
    return {
      ...s,
      points,
      gamesCount,
      wins:Number(o.wins||0),
      tabliers:Number(o.tabliers||0),
      kills:Number(o.kills||0),
      avgPoints:gamesCount?points/gamesCount:0,
      winRate:gamesCount?(Number(o.wins||0)/gamesCount)*100:0,
      podiumRate:s.podiumRate,
      kpg:gamesCount?(Number(o.kills||0)/gamesCount):0
    };
  });
}


const RANKING_ARCHIVE_KEYS=["2025-2026","2023-2024","2022-2023","2020-2021"];

function closeRankingArchiveMenu(){
  const menu=document.getElementById("rankingArchiveMenu");
  if(menu)menu.hidden=true;
}

function toggleRankingArchiveMenu(event){
  if(event)event.stopPropagation();
  const menu=document.getElementById("rankingArchiveMenu");
  if(!menu)return;
  menu.hidden=!menu.hidden;
}

async function selectRankingSeasonScope(key){
  closeRankingArchiveMenu();
  if(key!==selectedSeasonKey)await selectSeason(key);
  if(document.querySelector('.view.active')?.id!=="ranking")await showView("ranking");
  syncRankingSeasonScopeUI();
}

function syncRankingSeasonScopeUI(){
  const current=document.getElementById("rankingCurrentSeasonBtn");
  const archives=document.getElementById("rankingArchivesBtn");
  const cumul=document.getElementById("rankingCumulativeBtn");
  current?.classList.toggle("active",selectedSeasonKey===CURRENT_SEASON_KEY);
  archives?.classList.toggle("active",RANKING_ARCHIVE_KEYS.includes(selectedSeasonKey));
  cumul?.classList.toggle("active",selectedSeasonKey==="all");
  const ctx=document.getElementById("rankingScopeContext");
  if(ctx){
    if(selectedSeasonKey==="all")ctx.innerHTML='<strong>Cumul toutes saisons</strong><span>Classement carrière BPT</span>';
    else if(RANKING_ARCHIVE_KEYS.includes(selectedSeasonKey))ctx.innerHTML=`<strong>Archive sélectionnée</strong><span>${seasonDisplayName(selectedSeasonKey)}</span>`;
    else ctx.innerHTML=`<strong>Saison en cours</strong><span>${seasonDisplayName(CURRENT_SEASON_KEY)}</span>`;
  }
}

document.addEventListener("click",e=>{
  const picker=document.getElementById("rankingArchivePicker");
  if(picker && !picker.contains(e.target))closeRankingArchiveMenu();
});

function setArchiveUiState(){
  const archive=isArchiveSeason();
  document.body.classList.toggle("archive-season",archive);
  const label=document.getElementById("headerSeasonLabel");
  if(label)label.textContent=isAllSeasons()
    ? "Cumul de toutes les saisons disponibles"
    : archive
      ? `Saison ${seasonDisplayName(selectedSeasonKey)} · archives`
      : "Gestion du championnat 2026–2027";
  document.querySelectorAll('[data-season-action="all"]').forEach(btn=>btn.classList.toggle("active",isAllSeasons()));
  updateSeasonNavigationState();
  updateSeasonContextTitles();
  syncRankingSeasonScopeUI();
}

async function selectSeason(key){
  if(key===selectedSeasonKey)return;
  const leavingCurrent=selectedSeasonKey===CURRENT_SEASON_KEY;
  if(leavingCurrent)currentSeasonHistoryCache=clone(db.history||[]);

  selectedSeasonKey=key;
  dashboardRecordSelection=null;

  if(key==="all"){
    db.history=buildAllSeasonsHistory();
    setArchiveUiState();
    const active=document.querySelector(".view.active")?.id;
    if(active==="live" || active==="settings"){
      await showView("dashboard");
    }else{
      renderAll();
      if(active)await showView(active);
    }
    return;
  }

  const archiveRows=archiveRowsForSeason(key);
  if(Array.isArray(archiveRows)){
    db.history=applyPlayerAliasesToRows(archiveRows);
    setArchiveUiState();
    const active=document.querySelector(".view.active")?.id;
    if(active==="live" || active==="settings"){
      await showView("dashboard");
    }else{
      renderAll();
      if(active)await showView(active);
    }
    return;
  }

  setArchiveUiState();
  if(Array.isArray(currentSeasonHistoryCache))db.history=clone(currentSeasonHistoryCache);
  const active=document.querySelector(".view.active")?.id;
  if(cloudReady && firebaseStore)await refreshCanonicalHistoryUI(true);
  else renderAll();
  if(active && active!=="live" && active!=="settings")await showView(active);
}


function seasonNavigationOrder(){
  return ["2020-2021","2022-2023","2023-2024","2025-2026","2026-2027"];
}

function seasonNeighbor(delta){
  const order=seasonNavigationOrder();
  // Le cumul reste un point de navigation, pas un état terminal.
  // Depuis « toutes saisons » : précédent revient à la saison courante,
  // suivant repart de la plus ancienne saison disponible.
  if(isAllSeasons())return delta<0 ? order[order.length-1] : order[0];
  const i=order.indexOf(selectedSeasonKey);
  if(i<0)return null;
  const ni=i+delta;
  return ni>=0 && ni<order.length ? order[ni] : null;
}


function updateSeasonNavigationState(){
  const prev=seasonNeighbor(-1);
  const next=seasonNeighbor(1);

  document.querySelectorAll('[data-season-action="prev"]').forEach(btn=>{
    btn.disabled=!prev;
    btn.classList.toggle("disabled",!prev);
    btn.title=prev?`Afficher la saison ${seasonDisplayName(prev)}`:"Aucune saison précédente disponible";
  });
  document.querySelectorAll('[data-season-action="next"]').forEach(btn=>{
    btn.disabled=!next;
    btn.classList.toggle("disabled",!next);
    btn.title=next?`Afficher la saison ${seasonDisplayName(next)}`:"Aucune saison suivante disponible";
  });
}

function updateSeasonContextTitles(){
  const suffix=isAllSeasons() ? "— cumul toutes saisons" : `saison ${seasonDisplayName(selectedSeasonKey)}`;
  const set=(id,label)=>{
    const el=document.getElementById(id);
    if(el)el.textContent=`${label} ${suffix}`;
  };
  set("rankingSeasonTitle","Classements BPT");
  const recordsSeasonTitle=document.getElementById("recordsSeasonTitle");
  if(recordsSeasonTitle)recordsSeasonTitle.textContent="Records & accomplissements";
  set("profileSeasonTitle","Profil joueur BPT");
  const recordsContextTitle=document.getElementById("recordsContextTitle");
  if(recordsContextTitle){
    recordsContextTitle.textContent=isAllSeasons()
      ? "Records toutes saisons"
      : `Records de la saison ${seasonDisplayName(selectedSeasonKey)}`;
  }
  updateRecordsScopeSelector();
}

let rankingMode='points';
function setRankingMode(mode){
  rankingMode=mode==='bets'?'bets':'points';
  const points=document.getElementById('rankingPointsContent'),bets=document.getElementById('bptBettingRankingPanel');
  if(points)points.hidden=rankingMode==='bets';
  if(bets)bets.hidden=rankingMode!=='bets';
  document.getElementById('rankingPointsModeBtn')?.classList.toggle('active',rankingMode==='points');
  document.getElementById('rankingBetsModeBtn')?.classList.toggle('active',rankingMode==='bets');
  if(rankingMode==='bets')renderBettingRanking();
}

function bettingLedgerRebuildPlayers(root){
  root=root||{};root.sessions=root.sessions||{};
  const players={};
  const key=name=>encodeURIComponent(String(name||'')).replace(/%/g,'_');
  Object.values(root.sessions).forEach(session=>{
    (session?.rows||[]).forEach(row=>{
      const player=String(row?.player||'').trim();if(!player)return;
      const pk=key(player),rec=players[pk]||{name:player,stakedCents:0,grossWonCents:0,netCents:0,bets:[]};
      const stake=Number(row.stakeCents)||0,gross=Number(row.grossWonCents)||0,net=Number(row.netCents)||0;
      rec.stakedCents+=stake;rec.grossWonCents+=gross;rec.netCents+=net;
      rec.bets.push({session:String(session?.session||''),type:row.type,pick:row.pick,actual:row.actual,odds:row.odds,stakeCents:stake,grossWonCents:gross,netCents:net,at:Number(session?.settledAt)||Date.now()});
      players[pk]=rec;
    });
  });
  root.players=players;return root;
}

function bettingValidGameNumbersForSeason(seasonKey=CURRENT_SEASON_KEY){
  const season=String(seasonKey||CURRENT_SEASON_KEY);
  if(season===String(CURRENT_SEASON_KEY)){
    return new Set((db.history||[]).map(r=>Number(r.game)).filter(g=>Number.isFinite(g)&&g>0));
  }
  const set=allAvailableSeasonSets().find(s=>String(s.key)===season);
  return new Set((set?.rows||[]).map(r=>Number(r.sourceGame||r.game)).filter(g=>Number.isFinite(g)&&g>0));
}

async function pruneOrphanBettingSessionsForSeason(seasonKey=CURRENT_SEASON_KEY){
  const dbx=window.bptFirebaseDb?.();if(!dbx?.ref)return {removed:0};
  const season=String(seasonKey||CURRENT_SEASON_KEY);
  const validGameNos=bettingValidGameNumbersForSeason(season);
  let removed=0;
  await dbx.ref('bpt/bettingLedger').transaction(root=>{
    root=root||{};root.sessions=root.sessions||{};
    const seenByGame=new Map();
    const entries=Object.entries(root.sessions)
      .filter(([,s])=>String(s?.season||CURRENT_SEASON_KEY)===season)
      .sort((a,b)=>(Number(b[1]?.settledAt)||0)-(Number(a[1]?.settledAt)||0));

    // Règle unique : pas de partie = pas de pari.
    // Une session doit avoir un gameNo explicite correspondant à une partie existante.
    // Une seule session réglée est conservée par partie (la plus récente).
    for(const [id,s] of entries){
      const gameNo=Number(s?.gameNo);
      if(!Number.isFinite(gameNo) || gameNo<=0 || !validGameNos.has(gameNo)){
        delete root.sessions[id];removed++;continue;
      }
      if(seenByGame.has(gameNo)){
        delete root.sessions[id];removed++;continue;
      }
      seenByGame.set(gameNo,id);
    }
    return removed?bettingLedgerRebuildPlayers(root):root;
  });
  return {removed};
}

async function purgeBettingForGame(seasonKey=CURRENT_SEASON_KEY,gameNo){
  const dbx=window.bptFirebaseDb?.();if(!dbx?.ref)return false;
  const season=String(seasonKey||CURRENT_SEASON_KEY),target=Number(gameNo);let removed=false;
  if(!Number.isFinite(target)||target<=0)return false;
  await dbx.ref('bpt/bettingLedger').transaction(root=>{
    root=root||{};root.sessions=root.sessions||{};
    for(const [id,s] of Object.entries(root.sessions)){
      if(String(s?.season||CURRENT_SEASON_KEY)===season && Number(s?.gameNo)===target){
        delete root.sessions[id];removed=true;
      }
    }
    return removed?bettingLedgerRebuildPlayers(root):root;
  });
  return removed;
}

async function purgeBettingForSeason(seasonKey=CURRENT_SEASON_KEY){
  const dbx=window.bptFirebaseDb?.();if(!dbx?.ref)return false;
  const season=String(seasonKey||CURRENT_SEASON_KEY);let removed=false;
  await dbx.ref('bpt/bettingLedger').transaction(root=>{
    root=root||{};root.sessions=root.sessions||{};
    for(const [id,s] of Object.entries(root.sessions)){
      if(String(s?.season||CURRENT_SEASON_KEY)===season){delete root.sessions[id];removed=true;}
    }
    return removed?bettingLedgerRebuildPlayers(root):root;
  });
  return removed;
}

async function renderBettingRanking(){
  const panel=document.getElementById('bptBettingRankingPanel');if(!panel)return;
  try{
    const dbx=window.bptFirebaseDb?.();
    if(!dbx?.ref){panel.innerHTML='<p class="bpt-betting-ranking-note">Classement des paris indisponible hors connexion.</p>';return;}
    const all=isAllSeasons(),season=String(selectedSeasonKey||CURRENT_SEASON_KEY);
    if(all){
      for(const s of allAvailableSeasonSets())await pruneOrphanBettingSessionsForSeason(s.key);
    }else{
      await pruneOrphanBettingSessionsForSeason(season);
    }
    const snap=await dbx.ref('bpt/bettingLedger').once('value'),root=snap.val()||{},sessions=Object.values(root.sessions||{});
    const relevant=sessions.filter(s=>all||!s.season||String(s.season)===season);
    const by=new Map();
    relevant.forEach(s=>(s.rows||[]).forEach(row=>{
      const name=String(row.player||'').trim();if(!name)return;
      const item=by.get(name)||{name,staked:0,gross:0,net:0,bets:0,wins:0};
      item.staked+=Number(row.stakeCents)||0;item.gross+=Number(row.grossWonCents)||0;item.net+=Number(row.netCents)||0;item.bets++;if(Number(row.grossWonCents)>0)item.wins++;
      by.set(name,item);
    }));
    const rows=[...by.values()].sort((a,b)=>b.net-a.net||b.gross-a.gross||a.name.localeCompare(b.name,'fr'));
    const money=c=>`${(Number(c||0)/100).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})} €`,total=rows.reduce((a,r)=>({staked:a.staked+r.staked,gross:a.gross+r.gross,net:a.net+r.net}),{staked:0,gross:0,net:0});
    panel.innerHTML=`<div class="combined-block-content"><h2>🎲 Classement des paris</h2><p class="bpt-betting-ranking-note">${all?'Cumul de toutes les saisons':'Saison '+seasonDisplayName(selectedSeasonKey)} · un pari vaut 0,50 €.</p><div class="bpt-betting-ranking-total"><div><span>Mises cumulées</span><strong>${money(total.staked)}</strong></div><div><span>Gains cumulés</span><strong>${money(total.gross)}</strong></div><div><span>Solde global</span><strong class="${total.net>=0?'positive':'negative'}">${total.net>=0?'+':''}${money(total.net)}</strong></div></div>${rows.length?`<div class="tablewrap"><table class="bpt-betting-table"><thead><tr><th>Rang</th><th>Joueur</th><th>Mises</th><th>Gains</th><th>Solde</th><th>Réussis</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td><strong>${esc(r.name)}</strong></td><td>${money(r.staked)}</td><td>${money(r.gross)}</td><td class="${r.net>=0?'positive':'negative'}">${r.net>=0?'+':''}${money(r.net)}</td><td>${r.wins} / ${r.bets}</td></tr>`).join('')}</tbody></table></div>`:'<p class="bpt-betting-ranking-note">Aucun pari enregistré pour cette période.</p>'}</div>`;
  }catch(e){console.warn('Classement paris',e);panel.innerHTML='<p class="bpt-betting-ranking-note">Impossible de charger le classement des paris.</p>';}
}


applyHistoricalPointScale();
if(selectedSeasonKey===CURRENT_SEASON_KEY){
  db.history=applyPlayerAliasesToRows(recalcCurrentSeasonPoints(db.history||[]));
  currentSeasonHistoryCache=clone(db.history||[]);
}

function renderAll(){
  normalizeHistoryGameNumbers();

  // V4.35 : un composant d'interface absent ou défectueux ne doit jamais
  // interrompre les autres rendus ni, surtout, empêcher une sauvegarde.
  const safeRender=(name,fn)=>{
    try{
      if(typeof fn==="function")fn();
    }catch(e){
      console.error(`BPT rendu ${name} :`,e);
    }
  };

  safeRender("titres saison",updateSeasonContextTitles);
  safeRender("tableau de bord",renderDashboard);
  safeRender("dernière partie",renderLatestGame);
  safeRender("classement",renderRanking);
  safeRender("historique saisons",renderSeasonHistoryScreen);
  safeRender("ratios carrière",renderCareerRatioSummary);
  safeRender("mode classement",()=>setRankingMode(rankingMode));
  safeRender("versus",renderVersus);
  safeRender("records",renderRecords);
  safeRender("succès",renderAchievements);
  safeRender("profil",renderProfile);
  safeRender("historique",renderHistory);
  safeRender("joueurs",renderPlayers);
  safeRender("joueurs partie",renderGamePlayers);
  safeRender("paramètres",renderSettings);
  safeRender("barème points",renderPoints);

  if(correctionUnlocked){
    safeRender("correction",()=>renderCorrectionGameList(null,false));
  }
}


let dashboardRecordSelection=null;

function shuffleCopy(list){
  const a=[...list];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function groupedGamesFromRows(rows){
  const m=new Map();
  for(const r of (rows||[])){
    const g=Number(r.game);
    if(!Number.isFinite(g) || g<=0)continue;
    if(!m.has(g))m.set(g,[]);
    m.get(g).push(r);
  }
  return [...m.entries()].sort((a,b)=>a[0]-b[0]);
}


function tablierMinPlayersForRow(r){
  const season=String(r?.seasonKey||r?.season||'').trim();
  if(season){
    const m=season.match(/^(\d{4})-(\d{4})$/);
    if(m)return Number(m[1])<=2023?12:10;
  }
  const d=String(r?.date||'');
  const m=d.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(m){
    const y=Number(m[1]), mo=Number(m[2]);
    const startYear=mo>=7?y:y-1;
    return startYear<=2023?12:10;
  }
  // Par défaut, règle actuelle depuis 2024-2025.
  return 10;
}
function isTablierRow(r){
  const isWin=!!r?.win || Number(r?.place)===1;
  return isWin && Number(r?.n||0)>=tablierMinPlayersForRow(r);
}
function tablierCountsFromRows(rows){
  const out=new Map();
  for(const r of rows||[]){
    if(!isTablierRow(r))continue;
    const name=canonicalPlayerName(r.player);
    out.set(name,(out.get(name)||0)+1);
  }
  return out;
}

function statsFromRows(rows){
  const by={};
  for(const p of (db.players||[]))by[p.name]={name:p.name,points:0,games:new Set(),wins:0,podiums:0,tabliers:0,kills:0,stake:0,gross:0,net:0};
  for(const r of (rows||[])){
    if(!by[r.player])by[r.player]={name:r.player,points:0,games:new Set(),wins:0,podiums:0,tabliers:0,kills:0,stake:0,gross:0,net:0};
    const s=by[r.player];
    s.points+=Number(r.points||0);
    s.games.add(r.game);
    s.wins+=r.win?1:0;
    s.podiums+=r.podium?1:0;
    s.tabliers+=isTablierRow(r)?1:0;
    s.kills+=Number(r.kills||0);
    s.stake+=Number(r.stake||0);
    s.gross+=Number(r.gross||0);
    s.net+=Number(r.net||0);
  }
  return Object.values(by).map(s=>({
    ...s,
    gamesCount:s.games.size,
    avgPoints:s.games.size?s.points/s.games.size:0,
    winRate:s.games.size?(s.wins/s.games.size)*100:0,
    podiumRate:s.games.size?(s.podiums/s.games.size)*100:0,
    kpg:s.games.size?s.kills/s.games.size:0
  }));
}

function rankingFromRows(rows){
  return statsFromRows(rows)
    .filter(s=>s.gamesCount>0)
    .sort((a,b)=>Number(b.points||0)-Number(a.points||0)||Number(b.avgPoints||0)-Number(a.avgPoints||0)||a.name.localeCompare(b.name,'fr'));
}

function longestPlayerStreakFromRows(name,predicate,rows){
  const filtered=(rows||[]).filter(r=>r.player===name).sort((a,b)=>Number(a.game)-Number(b.game));
  let best=0,cur=0;
  for(const r of filtered){
    cur=predicate(r)?cur+1:0;
    if(cur>best)best=cur;
  }
  return best;
}

function longestParticipationRunFromRows(name,rows){
  const gs=[...new Set((rows||[]).filter(r=>r.player===name).map(r=>Number(r.game)).filter(g=>Number.isFinite(g)&&g>0))].sort((a,b)=>a-b);
  let best=0,cur=0,prev=null;
  for(const g of gs){
    cur=(prev!==null && g===prev+1)?cur+1:1;
    best=Math.max(best,cur);
    prev=g;
  }
  return best;
}

function buildDashboardRecordPool(games,ranked,sourceRows){
  const rows=Array.isArray(sourceRows)?sourceRows:(Array.isArray(db.history)?db.history:[]);
  const computedGames=Array.isArray(games)?games:groupedGamesFromRows(rows);
  const computedRank=Array.isArray(ranked)?ranked:rankingFromRows(rows);
  if(!computedRank.length)return [];

  const maxBy=(key)=>[...computedRank].sort((a,b)=>Number(b[key]||0)-Number(a[key]||0)||a.name.localeCompare(b.name,'fr'))[0];
  const wins=maxBy('wins');
  const podiums=maxBy('podiums');
  const kills=maxBy('kills');
  const avg=maxBy('avgPoints');
  const net=maxBy('net');
  const worstNet=[...computedRank].sort((a,b)=>Number(a.net||0)-Number(b.net||0)||a.name.localeCompare(b.name,'fr'))[0];

  let bestGameKill={name:'—',value:0,game:null};
  for(const r of rows){
    if(Number(r.kills||0)>bestGameKill.value){
      bestGameKill={name:r.player,value:Number(r.kills||0),game:Number(r.game||0),sourceGame:r.sourceGame,seasonKey:r.seasonKey,seasonLabel:r.seasonLabel};
    }
  }

  let streakPod={name:'—',value:0};
  let streakPart={name:'—',value:0};
  let winStreak={name:'—',value:0};
  let tablierCount={name:'—',value:0};
  let tablierStreak={name:'—',value:0};

  for(const p of computedRank){
    const pod=longestPlayerStreakFromRows(p.name,r=>Number(r.place)<=3,rows);
    if(pod>streakPod.value)streakPod={name:p.name,value:pod};

    const part=longestParticipationRunFromRows(p.name,rows);
    if(part>streakPart.value)streakPart={name:p.name,value:part};

    const playerRows=rows.filter(r=>r.player===p.name).sort((a,b)=>Number(a.game)-Number(b.game));
    let curWin=0,bestWin=0,curTab=0,bestTab=0,totalTab=0;
    for(const r of playerRows){
      const isWin=Number(r.place)===1;
      const isTablier=isTablierRow(r);
      curWin=isWin?curWin+1:0;
      if(curWin>bestWin)bestWin=curWin;
      if(isTablier)totalTab++;
      curTab=isTablier?curTab+1:0;
      if(curTab>bestTab)bestTab=curTab;
    }
    if(bestWin>winStreak.value)winStreak={name:p.name,value:bestWin};
    if(totalTab>tablierCount.value)tablierCount={name:p.name,value:totalTab};
    if(bestTab>tablierStreak.value)tablierStreak={name:p.name,value:bestTab};
  }

  const gameNos=[...new Set(rows.map(r=>Number(r.game)).filter(g=>Number.isFinite(g)&&g>0))].sort((a,b)=>a-b);
  const last3Games=gameNos.slice(-3);
  let onFire={name:'—',value:0,details:''};
  if(last3Games.length){
    const totals={};
    for(const r of rows){
      if(!last3Games.includes(Number(r.game)))continue;
      totals[r.player]=(totals[r.player]||0)+Number(r.points||0);
    }
    const best=Object.entries(totals).sort((a,b)=>Number(b[1]||0)-Number(a[1]||0)||a[0].localeCompare(b[0],'fr'))[0];
    if(best)onFire={name:best[0],value:Number(best[1]||0),details:`${best[1]} pts sur ${last3Games.length} partie${last3Games.length>1?'s':''}`};
  }

  const pairs={};
  for(const r of rows){
    if(!r.killer)continue;
    const k=`${r.killer}|||${r.player}`;
    pairs[k]=(pairs[k]||0)+1;
  }
  const topPair=Object.entries(pairs).sort((a,b)=>Number(b[1]||0)-Number(a[1]||0)||String(a[0]).localeCompare(String(b[0]),'fr'))[0];
  const pairData=topPair?{names:topPair[0].split('|||'),value:Number(topPair[1]||0)}:null;

  const fourthCounts={},lastPlaceCounts={};
  for(const r of rows){
    const player=String(r.player||'');
    const place=Number(r.place)||0;
    const n=Number(r.n)||0;
    if(!player||!place)continue;
    if(place===4)fourthCounts[player]=(fourthCounts[player]||0)+1;
    if(n>0 && place===n)lastPlaceCounts[player]=(lastPlaceCounts[player]||0)+1;
  }
  const fourth=Object.entries(fourthCounts).sort((a,b)=>Number(b[1]||0)-Number(a[1]||0)||a[0].localeCompare(b[0],'fr'))[0];
  const last=Object.entries(lastPlaceCounts).sort((a,b)=>Number(b[1]||0)-Number(a[1]||0)||a[0].localeCompare(b[0],'fr'))[0];
  const badBeat=fourth?{name:fourth[0],value:Number(fourth[1]||0)}:{name:'—',value:0};
  const loser=last?{name:last[0],value:Number(last[1]||0)}:{name:'—',value:0};

  const biggestGross=rows.reduce((best,row)=>{
    const gross=Number(row.gross||0);
    if(!best || gross>best.gross || (gross===best.gross && String(row.player||'').localeCompare(String(best.player||''),'fr')<0)){
      return {player:row.player||'—',gross,game:Number(row.game||0)};
    }
    return best;
  },null);

  const participantRecord=computedGames.length?Math.max(...computedGames.map(g=>g[1].length)):0;

  return [
    {id:'wins',icon:'🏆',label:'Plus de victoires',player:wins?.name||'—',value:wins?`${wins.wins}`:'—',metric:Number(wins?.wins||0),better:'max'},
    {id:'winStreak',icon:'⚡',label:'Série de victoires',player:winStreak.name,value:winStreak.value?`${winStreak.value} de suite`:'—',metric:Number(winStreak.value||0),better:'max'},
    {id:'tablierCount',icon:'🧥',label:'Plus de tabliers',player:tablierCount.name,value:tablierCount.value?`${tablierCount.value}`:'—',metric:Number(tablierCount.value||0),better:'max'},
    {id:'tablierStreak',icon:'👑',label:'Série de tabliers',player:tablierStreak.name,value:tablierStreak.value?`${tablierStreak.value} de suite`:'—',metric:Number(tablierStreak.value||0),better:'max'},
    {id:'podiums',icon:'🥉',label:'Plus de podiums',player:podiums?.name||'—',value:podiums?`${podiums.podiums}`:'—',metric:Number(podiums?.podiums||0),better:'max'},
    {id:'podiumStreak',icon:'🏅',label:'Série de podiums',player:streakPod.name,value:streakPod.value?`${streakPod.value} de suite`:'—',metric:Number(streakPod.value||0),better:'max'},
    {id:'kills',icon:'💥',label:'Plus de kills',player:kills?.name||'—',value:kills?`${kills.kills}`:'—',metric:Number(kills?.kills||0),better:'max'},
    {id:'bestGameKill',icon:'🎯',label:'Kills sur une partie',player:bestGameKill.name,value:bestGameKill.value?`${bestGameKill.value} · ${formatGameReference(bestGameKill)}`:'—',metric:Number(bestGameKill.value||0),better:'max'},
    {id:'avg',icon:'📈',label:'Meilleure moyenne',player:avg?.name||'—',value:avg?`${num(avg.avgPoints,1)} pts`:'—',metric:Number(avg?.avgPoints||0),better:'max'},
    {id:'net',icon:'💰',label:'Meilleur solde',player:net?.name||'—',value:net?euro(net.net):'—',metric:Number(net?.net||0),better:'max'},
    {id:'worstNet',icon:'📉',label:'Plus grosse perte',player:worstNet?.name||'—',value:worstNet?euro(worstNet.net):'—',metric:Number(worstNet?.net||0),better:'min'},
    {id:'participationStreak',icon:'🎟',label:'Série de participations',player:streakPart.name,value:streakPart.value?`${streakPart.value} de suite`:'—',metric:Number(streakPart.value||0),better:'max'},
    {id:'onFire',icon:'🔥',label:'On Fire',player:onFire.name,value:onFire.details||'—',metric:Number(onFire.value||0),better:'max'},
    {id:'badBeat',icon:'💔',label:'Bad Beat',player:badBeat.name,value:badBeat.value?`${badBeat.value} fois 4e`:'—',metric:Number(badBeat.value||0),better:'max'},
    {id:'lastPlaces',icon:'🐢',label:'Dernières places',player:loser.name,value:loser.value?`${loser.value}`:'—',metric:Number(loser.value||0),better:'max'},
    {id:'killPair',icon:'🎯',label:'Kill le plus fréquent',player:pairData?`${pairData.names[0]} → ${pairData.names[1]}`:'—',value:pairData?`${pairData.value} fois`:'—',metric:Number(pairData?.value||0),better:'max'},
    {id:'biggestGross',icon:'🪙',label:'Plus gros gain',player:biggestGross?.player||'—',value:biggestGross?euro(biggestGross.gross):'—',metric:Number(biggestGross?.gross||0),better:'max'},
    {id:'participants',icon:'👥',label:'Record de participants',player:computedGames.length?'Championnat':'—',value:participantRecord?`${participantRecord} joueurs`:'—',metric:Number(participantRecord||0),better:'max'}
  ];
}

function latestBrokenDashboardRecords(){
  if(typeof isArchiveSeason==="function" && isArchiveSeason())return [];
  const rows=Array.isArray(db.history)?db.history:[];
  const games=groupedGamesFromRows(rows);
  if(games.length<2)return [];
  const latestGameNo=games[games.length-1][0];
  const previousRows=rows.filter(r=>Number(r.game)!==Number(latestGameNo));
  const currentPool=buildDashboardRecordPool(games, rankingFromRows(rows), rows);
  const previousPool=buildDashboardRecordPool(groupedGamesFromRows(previousRows), rankingFromRows(previousRows), previousRows);
  const previousMap=new Map(previousPool.map(r=>[r.id,r]));

  return currentPool.filter(cur=>{
    const prev=previousMap.get(cur.id);
    if(!prev)return false;
    const curMetric=Number(cur.metric);
    const prevMetric=Number(prev.metric);
    if(!Number.isFinite(curMetric) || !Number.isFinite(prevMetric))return false;
    if(cur.better==='min')return curMetric<prevMetric;
    return curMetric>prevMetric;
  }).map(r=>({...r,isNew:true}));
}

function randomDashboardRecords(pool,count=9,forcedRecords=[]){
  const available=pool.filter(r=>r && r.label);
  const byId=new Map(available.map(r=>[(r.id||r.label),r]));
  const wanted=Math.min(count,available.length);

  const forcedIds=[];
  for(const r of (forcedRecords||[])){
    const id=r && (r.id||r.label);
    if(id && byId.has(id) && !forcedIds.includes(id))forcedIds.push(id);
  }

  const remaining=available.filter(r=>!forcedIds.includes(r.id||r.label));
  const remainingIds=new Set(remaining.map(r=>r.id||r.label));
  const targetExtra=Math.max(0,wanted-forcedIds.length);
  const currentExtra=Array.isArray(dashboardRecordSelection)
    ? dashboardRecordSelection.filter(id=>!forcedIds.includes(id) && remainingIds.has(id))
    : [];

  if(currentExtra.length!==targetExtra){
    dashboardRecordSelection=forcedIds.concat(
      shuffleCopy(remaining).slice(0,targetExtra).map(r=>r.id||r.label)
    );
  }else{
    dashboardRecordSelection=forcedIds.concat(currentExtra.slice(0,targetExtra));
  }

  return dashboardRecordSelection.map(id=>byId.get(id)).filter(Boolean);
}

function bptDashboardFunnyVariant(category,gameKey,variants){
  if(!Array.isArray(variants)||!variants.length)return "";
  const storageKey="bpt_dashboard_humor_v2";
  let state={};
  try{state=JSON.parse(localStorage.getItem(storageKey)||"{}")||{};}catch(_e){state={};}
  state.current=state.current||{};
  state.last=state.last||{};
  const mapKey=`${gameKey}:${category}`;
  if(Number.isInteger(state.current[mapKey]) && variants[state.current[mapKey]])return variants[state.current[mapKey]];
  let hash=0;
  const seed=String(mapKey);
  for(let i=0;i<seed.length;i++)hash=((hash<<5)-hash+seed.charCodeAt(i))|0;
  let idx=Math.abs(hash)%variants.length;
  if(variants.length>1 && state.last[category]===idx)idx=(idx+1+Math.abs(hash)%Math.max(1,variants.length-1))%variants.length;
  state.current[mapKey]=idx;
  state.last[category]=idx;
  // garder le stockage compact
  const keys=Object.keys(state.current);
  if(keys.length>80)keys.slice(0,keys.length-80).forEach(k=>delete state.current[k]);
  try{localStorage.setItem(storageKey,JSON.stringify(state));}catch(_e){}
  return variants[idx];
}

// 10.4.38 — Réécrit un bloc de l'Accueil seulement si son contenu a changé.
function bptSetHomeHtml(el,html){
  if(!el||el.dataset.bptSig===html)return false;
  el.dataset.bptSig=html;el.innerHTML=html;return true;
}
function renderDashboard(){
  const games=groupedGames();
  const rank=ranking();
  const playerStats=stats(false).filter(s=>s.gamesCount>0);
  const playedPlayers=new Set(
    (Array.isArray(db.history)?db.history:[])
      .map(r=>String(r.player||"").trim())
      .filter(Boolean)
  );

  const totalGames=new Set(
    (Array.isArray(db.history)?db.history:[])
      .map(r=>Number(r.game))
      .filter(n=>Number.isFinite(n) && n>0)
  ).size;

  const totalParticipations=(Array.isArray(db.history)?db.history:[])
    .filter(r=>String(r.player||"").trim() && Number.isFinite(Number(r.game)) && Number(r.game)>0)
    .length;

  $("dashboardSeasonTitle").textContent=isAllSeasons()
    ? "Championnat BPT — cumul toutes saisons"
    : `Championnat BPT saison ${seasonDisplayName(selectedSeasonKey)}`;

  $("heroText").textContent=isAllSeasons()
    ? `Cumul des 3 saisons disponibles · ${playedPlayers.size} joueurs différents`
    : isArchiveSeason()
      ? `${seasonDisplayName(selectedSeasonKey)} · saison archivée · consultation historique`
      : `${totalGames} partie${totalGames>1?"s":""} jouée${totalGames>1?"s":""} · ${playedPlayers.size} joueurs en lice`;
  const lastGroupedGame=games.length?games[games.length-1][1].slice().sort((a,b)=>Number(a.place)-Number(b.place)):[];
  const lastWinner=lastGroupedGame.find(r=>Number(r.place)===1);
  const allAchievements=achievementPlayers();
  const onFire=allAchievements.find(a=>a.name==="On Fire");
  if($("dashDynamicsText")){
    if(!rank.length){
      $("dashDynamicsText").textContent="Le championnat chauffe à peine. Encore quelques parties et les premières tendances commenceront à se dessiner.";
    }else{
      const leader=rank[0];
      const second=rank[1];
      const gap=second?Number(leader.points||0)-Number(second.points||0):null;
      const L=n=>funPlayerLabel(n);
      const lastGameNo=Math.max(0,...(lastGroupedGame.map(r=>Number(r.game)||0)));
      const gameKey=`${selectedSeasonKey||"season"}-${lastGameNo}-${lastWinner?.player||"none"}`;
      const V=(cat,arr)=>bptDashboardFunnyVariant(cat,gameKey,arr);
      const history=Array.isArray(db.history)?db.history:[];
      const gameNos=[...new Set(history.map(r=>Number(r.game)).filter(g=>Number.isFinite(g)&&g>0))].sort((a,b)=>a-b);
      const rankingSnapshots=rankingSnapshotByGame();
      const currentRankingSnapshot=rankingSnapshots.find(s=>s.game===lastGameNo);
      const currentLeaderName=currentRankingSnapshot?Object.entries(currentRankingSnapshot.ranks||{}).sort((a,b)=>a[1]-b[1])[0]?.[0]:null;
      const previousRankingSnapshot=rankingSnapshots.filter(s=>s.game<lastGameNo).slice(-1)[0];
      const previousLeaderName=previousRankingSnapshot?Object.entries(previousRankingSnapshot.ranks||{}).sort((a,b)=>a[1]-b[1])[0]?.[0]:null;
      const leaderTakesLead=Boolean(currentLeaderName===leader.name && currentLeaderName!==previousLeaderName);

      const currentPodiumStreak=(name)=>{
        let streak=0;
        for(let i=gameNos.length-1;i>=0;i--){
          const row=history.find(r=>Number(r.game)===gameNos[i] && String(r.player||'')===String(name||''));
          if(!row)break;
          if(Number(row.place)>=1 && Number(row.place)<=3)streak++;
          else break;
        }
        return streak;
      };
      const latestKills=(name)=>lastGroupedGame.filter(r=>String(r.killer||'')===String(name||'')).length;
      const latestPlace=(name)=>Number(lastGroupedGame.find(r=>String(r.player||'')===String(name||''))?.place||0);
      const movers=rank.filter(r=>r.progress!==null && Number.isFinite(Number(r.progress)));
      const bestMover=movers.slice().sort((a,b)=>Number(b.progress)-Number(a.progress))[0];
      const leaderPodiums=currentPodiumStreak(leader.name);
      const leaderKills=latestKills(leader.name);
      const secondKills=second?latestKills(second.name):0;
      const secondPlace=second?latestPlace(second.name):0;
      const leaderPlace=latestPlace(leader.name);
      const newRecords=latestBrokenDashboardRecords();
      const newAchievements=latestGameUnlockedAchievements();

      const parts=[];

      // 1) Championnat + dynamique du leader dans une seule phrase fluide.
      if(second){
        const gapTxt=`${Math.abs(gap)} point${Math.abs(gap)>1?'s':''}`;
        if(leaderPodiums>=2){
          parts.push(V('narrativeLeaderPodium',[
            `${L(leader.name)} signe un ${leaderPodiums}e podium de suite et ${leaderTakesLead?'prend':'conserve'} la tête du championnat devant ${L(second.name)}, à ${gapTxt}.`,
            `${L(leader.name)} enchaîne un ${leaderPodiums}e podium consécutif et ${leaderTakesLead?'prend la tête':'reste leader'}, avec ${gapTxt} d’avance sur ${L(second.name)}.`,
            `Toujours régulier, ${L(leader.name)} monte sur un ${leaderPodiums}e podium de suite et ${leaderTakesLead?'prend les commandes':'garde les commandes'} devant ${L(second.name)} (${gapTxt} d’écart).`
          ]));
        }else if(Math.abs(gap)<=5){
          parts.push(V('narrativeLeaderClose',[
            `${L(leader.name)} ${leaderTakesLead?'prend':'conserve'} la tête du championnat, mais ${L(second.name)} reste au contact à seulement ${gapTxt}.`,
            `${L(leader.name)} ${leaderTakesLead?'prend la tête':'reste leader'} devant ${L(second.name)}, avec seulement ${gapTxt} entre les deux : rien n’est joué.`,
            `Le duel reste serré : ${L(leader.name)} ${leaderTakesLead?'prend les commandes':'mène encore'}, ${L(second.name)} n’est qu’à ${gapTxt}.`
          ]));
        }else{
          parts.push(V('narrativeLeaderWide',[
            `${L(leader.name)} ${leaderTakesLead?'prend':'conserve'} la tête du championnat avec ${gapTxt} d’avance sur ${L(second.name)}.`,
            `${L(leader.name)} ${leaderTakesLead?'prend la tête':'reste solidement installé en tête'}, ${gapTxt} devant ${L(second.name)}.`,
            `${L(leader.name)} ${leaderTakesLead?'prend les commandes':'garde les commandes'} du championnat, avec ${L(second.name)} à ${gapTxt}.`
          ]));
        }
      }else{
        parts.push(`${L(leader.name)} occupe seul la tête du championnat pour le moment.`);
      }

      // 2) Dernière soirée : privilégier le rival direct, les kills, le vainqueur ou une vraie remontée.
      if(second && secondKills>=2){
        const placement=secondPlace===1?'en remportant la partie':secondPlace>0?`en terminant ${secondPlace}e`:'dans la soirée';
        parts.push(V('narrativeSecondKills',[
          `${L(second.name)} s’est pourtant bien battu lors de la dernière soirée, avec ${secondKills} kills ${placement}.`,
          `${L(second.name)} a répondu présent hier : ${secondKills} kills ${placement}, de quoi maintenir la pression.`,
          `Derrière, ${L(second.name)} n’a pas lâché l’affaire et signe ${secondKills} kills ${placement}.`
        ]));
      }else if(lastWinner && String(lastWinner.player)!==String(leader.name)){
        const wk=latestKills(lastWinner.player);
        parts.push(V('narrativeWinner',[
          `${L(lastWinner.player)} a marqué la dernière soirée en s’imposant${wk>=2?` avec ${wk} kills`:''}.`,
          `La dernière partie est revenue à ${L(lastWinner.player)}${wk>=2?`, auteur de ${wk} kills`:''}, ce qui remet un peu de mouvement dans la course.`,
          `${L(lastWinner.player)} a pris la lumière sur la dernière partie${wk>=2?` avec ${wk} éliminations à son actif`:''}.`
        ]));
      }else if(leaderKills>=2){
        parts.push(`${L(leader.name)} a aussi pesé sur la dernière soirée avec ${leaderKills} kills${leaderPlace===1?' et la victoire au bout':''}.`);
      }else if(bestMover && Number(bestMover.progress)>0){
        const up=Number(bestMover.progress);
        parts.push(`${L(bestMover.name)} réalise la meilleure remontée du moment avec ${up} place${up>1?'s':''} gagnée${up>1?'s':''} au classement.`);
      }else if(lastWinner){
        parts.push(`${L(lastWinner.player)} a remporté la dernière partie et garde donc un peu de matière pour chambrer jusqu’à la prochaine.`);
      }

      // 3) Record/accomplissement seulement s'il enrichit le récit, jamais comme entrée obligatoire.
      if(newRecords.length){
        const rec=newRecords[0];
        const who=rec.player && rec.player!=='—'?L(rec.player):'Le championnat';
        parts.push(V(`narrativeRecord-${rec.id||rec.label}`,[
          `Au passage, ${who} en profite pour établir un nouveau record sur « ${rec.label} » (${rec.value}).`,
          `La soirée laisse aussi une trace dans les archives : ${who} signe un nouveau record « ${rec.label} » avec ${rec.value}.`,
          `Et comme si cela ne suffisait pas, ${who} améliore aussi le record « ${rec.label} » (${rec.value}).`
        ]));
      }else if(newAchievements.length){
        const ach=newAchievements[0];
        const names=(ach.players||[]).map(L).join(', ');
        if(names)parts.push(`${names} débloque aussi l’accomplissement « ${ach.name} », histoire de repartir avec autre chose que des souvenirs.`);
      }

      $("dashDynamicsText").textContent=parts.slice(0,2).join(' ');
    }
  }


  // 10.4.36 — Accueil épuré : podium à marches, « Ma saison », dernière partie, gazette.
  const nickOf=name=>playerNicknameInfo(name).primary||"";
  const openProfileAttr=name=>`openPlayerProfile(decodeURIComponent('${encodeURIComponent(name)}'))`;
  const podium=rank.slice(0,3);
  const step=(p,place)=>p?`
    <button type="button" class="bpt-home-step place-${place}" onclick="${openProfileAttr(p.name)}">
      <span class="bpt-home-step-medal">${medalForRank(place)}</span>
      <span class="bpt-home-step-name">${esc(p.name)}</span>
      <span class="bpt-home-step-nick">${nickOf(p.name)?esc(nickOf(p.name)):"&nbsp;"}</span>
      <span class="bpt-home-step-block"><b>${num(p.points,0)}</b><small>pts</small><i>${place}</i></span>
    </button>`:`<div class="bpt-home-step place-${place} is-empty"><span class="bpt-home-step-block"><i>${place}</i></span></div>`;
  const podiumEl=$("dashPodium");
  const podiumChanged=bptSetHomeHtml(podiumEl,podium.length
    ? step(podium[1],2)+step(podium[0],1)+step(podium[2],3)
    : '<div class="muted bpt-home-empty">Le podium apparaîtra après la première partie classée.</div>');
  // L'animation de montée des marches ne joue qu'au premier affichage de la page.
  // Les réaffichages suivants (arrivée des données Firebase…) sont instantanés.
  if(podiumChanged&&podiumEl){
    if(podiumEl.dataset.bptAnimDone)podiumEl.classList.add("is-settled");
    else podiumEl.dataset.bptAnimDone="1";
  }

  // Ma saison : seulement pour le joueur connecté et classé.
  const meBox=$("dashMySeason");
  if(meBox){
    let me="";
    try{me=String(window.BPTLive3?.getVerifiedIdentityName?.()||"").trim();}catch(_e){}
    const norm=v=>String(v||"").trim().toLocaleLowerCase("fr");
    const idx=me?rank.findIndex(r=>norm(r.name)===norm(me)):-1;
    if(idx<0){
      meBox.hidden=true;bptSetHomeHtml(meBox,"");
    }else{
      const mine=rank[idx],above=rank[idx-1],below=rank[idx+1];
      const pts=v=>`${num(v,0)} pt${Math.abs(Number(v))>1?"s":""}`;
      const chase=above
        ? `À <b>${pts(Number(above.points||0)-Number(mine.points||0))}</b> de ${esc(above.name)} (${idx}<sup>e</sup>)`
        : "Vous menez le championnat 👑";
      const lead=below?`<b>${pts(Number(mine.points||0)-Number(below.points||0))}</b> d’avance sur ${esc(below.name)}`:"";
      const trend=Number(mine.progress)>0?`<span class="bpt-home-trend up">▲ ${mine.progress}</span>`
        :Number(mine.progress)<0?`<span class="bpt-home-trend down">▼ ${Math.abs(mine.progress)}</span>`:"";
      meBox.hidden=false;
      meBox.classList.add("actionable");
      meBox.onclick=()=>openMySeasonSheet(mine.name);
      bptSetHomeHtml(meBox,`
        <div class="bpt-home-me-rank"><b>${idx+1}<sup>${idx===0?"er":"e"}</sup></b><small>sur ${rank.length}</small></div>
        <div class="bpt-home-me-copy">
          <div class="bpt-home-me-title">👤 Ma saison <span>· ${esc(String(mine.name).trim().split(" ")[0])}</span> ${trend}</div>
          <strong>${num(mine.points,0)} pts · ${Number(mine.gamesCount||0)} partie${Number(mine.gamesCount||0)>1?"s":""}</strong>
          <small>${chase}${lead?` · ${lead}`:""}</small>
        </div>
        <span class="bpt-home-me-go"><small>Mes stats</small>›</span>`);
    }
  }

  const lastBox=$("dashLatestGame");
  if(lastBox){
    if(games.length){
      const [gameNo,rows]=games[games.length-1];
      const sorted=rows.slice().sort((a,b)=>Number(a.place)-Number(b.place));
      const winner=sorted.find(r=>Number(r.place)===1);
      bptSetHomeHtml(lastBox,`
        <div class="bpt-home-kicker">Dernière partie · #${esc(gameNo)}</div>
        <div class="bpt-home-last-winner">${winner?bptAvatarHtml(winner.player,"md"):""}<div><strong>${esc(winner?.player||"—")}</strong><small>remporte la partie</small></div></div>
        <small class="bpt-home-last-meta">${esc(shortDate(sorted[0]?.date||""))}${sorted[0]?.location?` · ${esc(sorted[0].location)}`:""} · ${sorted.length} joueurs</small>
        <span class="bpt-home-link">Voir la partie →</span>`);
    }else{
      bptSetHomeHtml(lastBox,'<div class="bpt-home-kicker">Dernière partie</div><small class="muted">Le résumé apparaîtra ici.</small>');
    }
  }
}

// 10.4.37 — Fenêtre « Ma saison » (clic sur l'encart perso de l'Accueil) :
// chiffres clés, courbe du rang au classement, parties de la saison, accès à la fiche complète.
function bptCloseMySeasonSheet(){
  const el=document.getElementById("bptMySeasonSheet");
  if(el){el.classList.remove("open");setTimeout(()=>el.remove(),200);}
  document.removeEventListener("keydown",bptMySeasonEsc);
}
function bptMySeasonEsc(e){if(e.key==="Escape")bptCloseMySeasonSheet();}
function bptMySeasonRankChart(points,total){
  if(points.length<2)return '<div class="muted" style="padding:12px">La courbe apparaîtra après ta 2<sup>e</sup> partie.</div>';
  const W=360,H=190,pl=30,pr=22,pt=22,pb=30;
  const maxR=Math.max(3,total||0,...points.map(p=>p.y));
  const x=i=>pl+i*(W-pl-pr)/(points.length-1);
  const y=r=>pt+(r-1)*(H-pt-pb)/Math.max(1,maxR-1);
  const line=points.map((p,i)=>`${i?"L":"M"}${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join(" ");
  const area=`${line} L${x(points.length-1).toFixed(1)},${H-pb} L${x(0).toFixed(1)},${H-pb} Z`;
  const guides=[1,Math.ceil(maxR/2),maxR].filter((v,i,a)=>a.indexOf(v)===i)
    .map(r=>`<line x1="${pl}" x2="${W-pr}" y1="${y(r)}" y2="${y(r)}" class="g"/><text x="${pl-6}" y="${y(r)+4}" text-anchor="end" class="ax">${r}</text>`).join("");
  const dots=points.map((p,i)=>`<circle cx="${x(i)}" cy="${y(p.y)}" r="${i===points.length-1?5.5:4}" class="d${i===points.length-1?" last":""}"/>
    <text x="${x(i)}" y="${y(p.y)-10}" text-anchor="middle" class="v">${p.y}<tspan dy="-5" font-size="8">${p.y===1?"er":"e"}</tspan></text>
    <text x="${x(i)}" y="${H-10}" text-anchor="middle" class="ax">#${p.x}</text>`).join("");
  return `<svg viewBox="0 0 ${W} ${H}" class="bpt-ms-svg" role="img" aria-label="Évolution de mon rang au classement">
    <defs><linearGradient id="bptMsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--bpt-teal,#2ac9c2)" stop-opacity=".35"/><stop offset="1" stop-color="var(--bpt-teal,#2ac9c2)" stop-opacity="0"/></linearGradient></defs>
    ${guides}<path d="${area}" fill="url(#bptMsFill)"/><path d="${line}" class="l"/>${dots}</svg>`;
}
function openMySeasonSheet(name){
  const real=String(name||"").trim();if(!real)return;
  const norm=v=>String(v||"").trim().toLocaleLowerCase("fr");
  const rank=ranking();
  const idx=rank.findIndex(r=>norm(r.name)===norm(real));
  if(idx<0)return;
  const me=rank[idx];
  const myRows=(Array.isArray(db.history)?db.history:[])
    .filter(r=>norm(canonicalPlayerName(r.player))===norm(me.name)&&Number(r.game)>0)
    .sort((a,b)=>Number(a.game)-Number(b.game));
  const snaps=rankingSnapshotByGame();
  const rankSeries=snaps.map(s=>({x:s.game,y:s.ranks[me.name]})).filter(v=>Number.isFinite(v.y));
  const bestRank=rankSeries.length?Math.min(...rankSeries.map(v=>v.y)):idx+1;
  const places=myRows.map(r=>Number(r.place)).filter(n=>n>0);
  const bestPlace=places.length?Math.min(...places):null;
  const avgPlace=places.length?places.reduce((a,b)=>a+b,0)/places.length:null;
  const kpi=(label,value,sub="")=>`<div class="bpt-ms-kpi"><span>${esc(label)}</span><b>${value}</b>${sub?`<small>${sub}</small>`:""}</div>`;
  const placeCls=p=>p===1?"gold":p===2?"silver":p===3?"bronze":"";
  const gamesHtml=myRows.length?myRows.slice().reverse().map(r=>`
      <div class="bpt-ms-game">
        <span class="bpt-ms-place ${placeCls(Number(r.place))}">${Number(r.place)||"—"}<sup>${Number(r.place)===1?"er":"e"}</sup></span>
        <span class="bpt-ms-game-copy"><b>Partie #${esc(r.game)}</b><small>${esc(shortDate(r.date||""))}${r.location?` · ${esc(r.location)}`:""}</small></span>
        <span class="bpt-ms-game-pts">${num(Number(r.points||0),0)} pt${Math.abs(Number(r.points||0))>1?"s":""}${Number(r.kills)>0?`<small>${Number(r.kills)} kill${Number(r.kills)>1?"s":""}</small>`:""}</span>
      </div>`).join(""):'<div class="muted">Aucune partie cette saison.</div>';
  document.getElementById("bptMySeasonSheet")?.remove();
  const sheet=document.createElement("div");
  sheet.id="bptMySeasonSheet";sheet.className="bpt-ms-overlay";
  sheet.innerHTML=`
    <div class="bpt-ms-sheet" role="dialog" aria-modal="true" aria-label="Ma saison">
      <button type="button" class="bpt-ms-close" aria-label="Fermer">×</button>
      <div class="bpt-home-kicker">Ma saison · ${esc(isAllSeasons()?"toutes saisons":seasonDisplayName(selectedSeasonKey))}</div>
      <h2>${esc(me.name)}</h2>
      <div class="bpt-ms-kpis">
        ${kpi("Rang",`${idx+1}<sup>${idx===0?"er":"e"}</sup>`,`meilleur : ${bestRank}<sup>${bestRank===1?"er":"e"}</sup>`)}
        ${kpi("Points",num(me.points,0),`${num(me.avgPoints||0,1)} / partie`)}
        ${kpi("Parties",Number(me.gamesCount||0))}
        ${kpi("Victoires",Number(me.wins||0),`${Number(me.podiums||0)} podium${Number(me.podiums||0)>1?"s":""}`)}
        ${kpi("Place moyenne",avgPlace?num(avgPlace,1):"—",bestPlace?`meilleure : ${bestPlace}<sup>${bestPlace===1?"re":"e"}</sup>`:"")}
        ${kpi("Kills",Number(me.kills||0),`${num(me.kpg||0,1)} / partie`)}
      </div>
      <h3>📈 Ma progression au classement</h3>
      <div class="bpt-ms-chart" id="bptMySeasonChart">${bptMySeasonRankChart(rankSeries,rank.length)}</div>
      <h3>🃏 Mes parties</h3>
      <div class="bpt-ms-games">${gamesHtml}</div>
      <button type="button" class="btn bpt-ms-full">Voir ma fiche complète →</button>
    </div>`;
  document.body.appendChild(sheet);
  sheet.addEventListener("click",e=>{if(e.target===sheet||e.target.closest(".bpt-ms-close"))bptCloseMySeasonSheet();});
  sheet.querySelector(".bpt-ms-full").onclick=()=>{bptCloseMySeasonSheet();openPlayerProfile(me.name);};
  document.addEventListener("keydown",bptMySeasonEsc);
  requestAnimationFrame(()=>sheet.classList.add("open"));
}

// 10.4.37 — Comparatif du top 3 (lien sous « Classement complet » du podium de l'Accueil) :
// tableau stat par stat avec la meilleure valeur mise en évidence, points forts de chacun,
// courbe du rang des 3 joueurs depuis le début de la saison.
const BPT_TOP3_COLORS=["#f2c853","#cfd6e2","#d58a52","#2ac9c2"]; // 4e couleur : « moi »
function bptTop3RankChart(series,total){
  const games=[...new Set(series.flatMap(s=>s.values.map(v=>v.x)))].sort((a,b)=>a-b);
  if(games.length<2)return '<div class="muted" style="padding:12px">La courbe apparaîtra après la 2<sup>e</sup> partie.</div>';
  const W=360,H=200,pl=30,pr=16,pt=16,pb=30;
  const maxR=Math.max(3,total||0,...series.flatMap(s=>s.values.map(v=>v.y)));
  const x=g=>pl+games.indexOf(g)*(W-pl-pr)/(games.length-1);
  const y=r=>pt+(r-1)*(H-pt-pb)/Math.max(1,maxR-1);
  const guides=[1,Math.ceil(maxR/2),maxR].filter((v,i,a)=>a.indexOf(v)===i)
    .map(r=>`<line x1="${pl}" x2="${W-pr}" y1="${y(r)}" y2="${y(r)}" class="g"/><text x="${pl-6}" y="${y(r)+4}" text-anchor="end" class="ax">${r}</text>`).join("");
  const xl=games.map(g=>`<text x="${x(g)}" y="${H-10}" text-anchor="middle" class="ax">#${g}</text>`).join("");
  const lines=series.slice().reverse().map(s=>{
    const c=BPT_TOP3_COLORS[s.idx];
    const d=s.values.map((v,i)=>`${i?"L":"M"}${x(v.x).toFixed(1)},${y(v.y).toFixed(1)}`).join(" ");
    const last=s.values[s.values.length-1];
    return `<path d="${d}" fill="none" stroke="${c}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`+
      s.values.map(v=>`<circle cx="${x(v.x)}" cy="${y(v.y)}" r="${v===last?5:3.5}" fill="${v===last?c:"var(--bpt-card,#18223a)"}" stroke="${c}" stroke-width="2"/>`).join("");
  }).join("");
  return `<svg viewBox="0 0 ${W} ${H}" class="bpt-ms-svg" role="img" aria-label="Évolution du classement du top 3">${guides}${xl}${lines}</svg>
    <div class="bpt-t3-legend">${series.map(s=>`<span><i style="background:${BPT_TOP3_COLORS[s.idx]}"></i>${esc(s.name)}</span>`).join("")}</div>`;
}
// withMe : ajoute la colonne du joueur connecté quand il n'est pas dans le top 3.
function openTop3Compare(withMe=false){
  const rank=ranking();const top=rank.slice(0,3);
  if(top.length<2)return;
  const norm=v=>String(v||"").trim().toLocaleLowerCase("fr");
  let meName="";try{meName=String(window.BPTLive3?.getVerifiedIdentityName?.()||"").trim();}catch(_e){}
  const meIdx=meName?rank.findIndex(r=>norm(r.name)===norm(meName)):-1;
  const meOutside=meIdx>=3;
  const showMe=withMe&&meOutside;
  const list=showMe?top.concat(rank[meIdx]):top;
  const hist=Array.isArray(db.history)?db.history:[];
  const placesOf=name=>hist.filter(r=>norm(canonicalPlayerName(r.player))===norm(name)&&Number(r.game)>0)
    .sort((a,b)=>Number(a.game)-Number(b.game)).map(r=>Number(r.place)).filter(n=>n>0);
  const data=list.map((p,i)=>{
    const pl=placesOf(p.name);
    return {...p,idx:i,rankPos:rank.indexOf(p)+1,isMe:showMe&&i===3,avgPlace:pl.length?pl.reduce((a,b)=>a+b,0)/pl.length:null,bestPlace:pl.length?Math.min(...pl):null,last3:pl.slice(-3)};
  });
  // better : "high" = la plus grande valeur gagne, "low" = la plus petite.
  const STATS=[
    {label:"Points",get:p=>Number(p.points||0),fmt:v=>num(v,0),better:"high",strong:"le plus de points"},
    {label:"Moyenne / partie",get:p=>Number(p.avgPoints||0),fmt:v=>num(v,1),better:"high",strong:"la meilleure moyenne"},
    {label:"Parties jouées",get:p=>Number(p.gamesCount||0),fmt:v=>v,better:"high",strong:"le plus assidu"},
    {label:"Victoires",get:p=>Number(p.wins||0),fmt:v=>v,better:"high",strong:"le plus de victoires"},
    {label:"Podiums",get:p=>Number(p.podiums||0),fmt:v=>v,better:"high",strong:"le plus de podiums"},
    {label:"Place moyenne",get:p=>p.avgPlace,fmt:v=>v==null?"—":num(v,1),better:"low",strong:"la meilleure place moyenne"},
    {label:"Meilleure place",get:p=>p.bestPlace,fmt:v=>v==null?"—":`${v}<sup>${v===1?"re":"e"}</sup>`,better:"low",strong:"la meilleure place"},
    {label:"Kills",get:p=>Number(p.kills||0),fmt:v=>v,better:"high",strong:"le plus de kills"},
    {label:"Kills / partie",get:p=>Number(p.kpg||0),fmt:v=>num(v,1),better:"high",strong:"le plus agressif"},
    {label:"Tabliers",get:p=>Number(p.tabliers||0),fmt:v=>v,better:"high",strong:"le plus de tabliers"},
  ];
  const strengths=data.map(()=>[]);
  const rows=STATS.map(st=>{
    const vals=data.map(st.get);
    const valid=vals.filter(v=>v!=null&&Number.isFinite(v));
    const best=valid.length?(st.better==="high"?Math.max(...valid):Math.min(...valid)):null;
    const winners=vals.map(v=>v!=null&&v===best);
    // Pas de mise en évidence si tout le monde est à égalité.
    const distinct=winners.filter(Boolean).length<data.length;
    if(distinct)winners.forEach((w,i)=>{if(w)strengths[i].push(st.strong);});
    return `<tr><th>${esc(st.label)}</th>${vals.map((v,i)=>`<td class="${distinct&&winners[i]?"is-best":""}">${st.fmt(v)}</td>`).join("")}</tr>`;
  }).join("");
  const formRow=`<tr><th>3 dernières places</th>${data.map(p=>`<td>${p.last3.length?p.last3.map(n=>`<span class="bpt-t3-dot${n<=3?" p"+n:""}">${n}</span>`).join(""):"—"}</td>`).join("")}</tr>`;
  const snaps=rankingSnapshotByGame();
  const series=data.map(p=>({name:p.name,idx:p.idx,values:snaps.map(s=>({x:s.game,y:s.ranks[p.name]})).filter(v=>Number.isFinite(v.y))})).filter(s=>s.values.length);
  document.getElementById("bptMySeasonSheet")?.remove();
  const sheet=document.createElement("div");
  sheet.id="bptMySeasonSheet";sheet.className="bpt-ms-overlay";
  sheet.innerHTML=`
    <div class="bpt-ms-sheet bpt-t3-sheet" role="dialog" aria-modal="true" aria-label="Comparatif du top 3">
      <button type="button" class="bpt-ms-close" aria-label="Fermer">×</button>
      <div class="bpt-home-kicker">Comparatif · ${esc(isAllSeasons()?"toutes saisons":seasonDisplayName(selectedSeasonKey))}</div>
      <h2>${showMe?"⚔️ Moi face au podium":"⚔️ Le duel du podium"}</h2>
      ${meOutside?`<button type="button" class="bpt-t3-toggle${showMe?" is-on":""}">${showMe?"✕ Retirer ma colonne":"➕ Me comparer au top 3"}</button>`
        :meIdx>=0?'<div class="bpt-t3-note">👑 Tu fais partie du top 3.</div>':""}
      <div class="bpt-t3-tablewrap"><table class="bpt-t3-table">
        <thead><tr><th></th>${data.map(p=>`<th class="bpt-t3-player" style="--c:${BPT_TOP3_COLORS[p.idx]}"><span class="bpt-t3-medal">${p.isMe?`<span class="bpt-t3-me-rank">${p.rankPos}<sup>e</sup></span>`:medalForRank(p.idx+1)}</span><button type="button" class="bpt-t3-name" data-player="${encodeURIComponent(p.name)}">${p.isMe?"Moi":esc(p.name)}</button></th>`).join("")}</tr></thead>
        <tbody>${rows}${formRow}</tbody>
      </table></div>
      <h3>💪 Points forts</h3>
      <div class="bpt-t3-strengths">${data.map((p,i)=>`<div class="bpt-t3-strength${p.isMe?" is-me":""}" style="--c:${BPT_TOP3_COLORS[p.idx]}"><b>${p.isMe?"Moi · ":""}${esc(p.name)}</b><span>${strengths[i].length?esc(strengths[i].join(" · ")):(p.isMe?"Aucune stat en tête face au podium… pour l’instant 😉":"Aucune stat en tête : la régularité avant tout")}</span></div>`).join("")}</div>
      <h3>📈 Classement depuis le début de la saison</h3>
      <div class="bpt-ms-chart">${bptTop3RankChart(series,rank.length)}</div>
      <button type="button" class="btn bpt-ms-full bpt-t3-full">Voir le classement complet →</button>
    </div>`;
  document.body.appendChild(sheet);
  sheet.addEventListener("click",e=>{
    if(e.target.closest(".bpt-t3-toggle")){document.removeEventListener("keydown",bptMySeasonEsc);openTop3Compare(!showMe);return;}
    const n=e.target.closest(".bpt-t3-name");
    if(n){bptCloseMySeasonSheet();openPlayerProfile(decodeURIComponent(n.dataset.player));return;}
    if(e.target.closest(".bpt-t3-full")){bptCloseMySeasonSheet();showView("ranking");return;}
    if(e.target===sheet||e.target.closest(".bpt-ms-close"))bptCloseMySeasonSheet();
  });
  document.addEventListener("keydown",bptMySeasonEsc);
  requestAnimationFrame(()=>sheet.classList.add("open"));
}



document.addEventListener("DOMContentLoaded",()=>{
  const input=document.getElementById("latestGameHeadUpCameraInput");
  if(!input)return;

  input.addEventListener("change",async e=>{
    const file=e.target.files?.[0];
    if(!file)return;

    const main=document.getElementById("latestGamePhotoInput");
    const gameNo=Number(main?.dataset?.game||0);
    const seasonKey=String(main?.dataset?.season||"").trim()||null;

    if(!gameNo){
      alert("Aucune partie sélectionnée.");
      e.target.value="";
      return;
    }

    await saveGamePhoto(gameNo,file,seasonKey);
    e.target.value="";
  });
});







function hideHeadUpPhotoPrompt(){
  const promptEl=document.getElementById("headUpPhotoPrompt");
  if(promptEl)promptEl.style.display="none";
}

document.addEventListener("click",e=>{
  if(e.target?.closest?.("#headUpPhotoPromptCameraBtn")){
    hideHeadUpPhotoPrompt();
    const input=document.getElementById("latestGameHeadUpCameraInput");
    if(input)input.click();
    return;
  }

  if(e.target?.closest?.("#headUpPhotoPromptLaterBtn")){
    hideHeadUpPhotoPrompt();
  }
});



const headUpCameraInput=document.getElementById("latestGameHeadUpCameraInput");
if(headUpCameraInput){
  headUpCameraInput.addEventListener("change",async e=>{
    const file=e.target.files?.[0];
    if(!file)return;

    const main=document.getElementById("latestGamePhotoInput");
    const gameNo=Number(main?.dataset?.game||0);
    const seasonKey=String(main?.dataset?.season||"").trim()||null;

    if(!gameNo){
      alert("Aucune partie sélectionnée.");
      e.target.value="";
      return;
    }

    await saveGamePhoto(gameNo,file,seasonKey);
    e.target.value="";
  });
}

function renderLatestGame(){
  const games=latestGameEntries();
  const empty=$("latestGameEmpty");
  const content=$("latestGameContent");
  if(!empty || !content)return;

  if(!games.length){
    empty.style.display="block";
    content.style.display="none";
    if($("latestGameRecapBtn"))$("latestGameRecapBtn").hidden=true;
    $("latestGameTitle").textContent="Parties";
    $("latestGameMeta").textContent="Aucune partie enregistrée.";
    $("latestGameWinner").textContent="—";
    if($("latestGameWinnerNickname"))$("latestGameWinnerNickname").textContent="";
    $("latestGameWinnerMeta").textContent="—";
    if($("latestGamePosition"))$("latestGamePosition").textContent="—";
    if($("latestPrevGameBtn"))$("latestPrevGameBtn").disabled=true;
    if($("latestNextGameBtn"))$("latestNextGameBtn").disabled=true;
    return;
  }

  let idx=games.findIndex(g=>latestGameEntryKey(g)===latestGameSelectedKey);
  if(idx<0)idx=games.length-1;
  const entry=games[idx];
  latestGameSelectedKey=latestGameEntryKey(entry);

  empty.style.display="none";
  content.style.display="block";

  const gameNo=entry.gameNo;
  const rows=entry.rows.slice().sort((a,b)=>Number(a.place)-Number(b.place));
  const first=rows[0]||{};
  const recapButton=$("latestGameRecapBtn");if(recapButton){recapButton.hidden=false;recapButton.onclick=()=>showEndGameSummary(rows);}
  const winner=rows.find(r=>Number(r.place)===1);
  const pot=rows.length*Number(first.stake||0);
  const seasonKey=entry.seasonKey||currentGamePhotoSeasonKey();

  $("latestGameTitle").textContent=gameDisplayTitle(first,gameNo);
  $("latestGameMeta").textContent=`${shortDate(first.date||"")}${first.location?" · "+first.location:""} · ${rows.length} joueurs`;
  $("latestGameWinner").textContent=winner?.player||"—";
  if($("latestGameWinnerNickname")){
    const wn=winner?playerNicknameInfo(winner.player).primary:"";
    $("latestGameWinnerNickname").textContent=wn?`(${wn})`:"";
  }
  $("latestGameWinnerMeta").textContent=winner?`${num(winner.points||0,0)} pts · ${euro(winner.gross||0)} de gain`:"—";

  if($("latestGamePosition"))$("latestGamePosition").textContent=`Partie ${idx+1} / ${games.length}`;
  if($("latestGameHistorySummary")){
    $("latestGameHistorySummary").textContent=idx===games.length-1?"Dernière partie":"Historique";
  }
  if($("latestPrevGameBtn"))$("latestPrevGameBtn").disabled=idx<=0;
  if($("latestNextGameBtn"))$("latestNextGameBtn").disabled=idx>=games.length-1;

  const photo=getGamePhoto(gameNo,seasonKey);
  const photoRenderKey=gamePhotoKey(gameNo,seasonKey);
  const thumb=$("latestGamePhotoThumb");
  const thumbBtn=$("latestGamePhotoThumbBtn");
  const placeholder=$("latestGamePhotoPlaceholder");
  const deleteBtn=$("latestGamePhotoDeleteBtn");
  const uploadLabel=$("latestGamePhotoUploadLabel");

  // On affiche d'abord le placeholder. L'image Storage n'est déclarée présente
  // qu'après son chargement réussi ; une URL déterministe inexistante renvoie simplement 404.
  if(thumbBtn)thumbBtn.style.display="none";
  if(placeholder)placeholder.style.display="flex";
  if(deleteBtn)deleteBtn.style.display="none";
  if(uploadLabel)uploadLabel.textContent="Ajouter";
  if(thumb){
    thumb.dataset.photoKey=photoRenderKey;
    thumb.onload=()=>{
      if(thumb.dataset.photoKey!==photoRenderKey)return;
      if(thumbBtn)thumbBtn.style.display="block";
      if(placeholder)placeholder.style.display="none";
      if(deleteBtn)deleteBtn.style.display="inline-flex";
      if(uploadLabel)uploadLabel.textContent="Changer";
    };
    thumb.onerror=()=>{
      if(thumb.dataset.photoKey!==photoRenderKey)return;
      if(thumbBtn)thumbBtn.style.display="none";
      if(placeholder)placeholder.style.display="flex";
      if(deleteBtn)deleteBtn.style.display="none";
      if(uploadLabel)uploadLabel.textContent="Ajouter";
    };
    thumb.src=photo||"";
  }
  if(thumbBtn){
    thumbBtn.onclick=()=>openGamePhotoModal(
      thumb?.src||photo,
      `${gameDisplayTitle(first,gameNo)} · ${shortDate(first.date||"")}`
    );
  }
  if($("latestGamePhotoInput")){
    $("latestGamePhotoInput").dataset.game=String(gameNo);
    $("latestGamePhotoInput").dataset.season=seasonKey;
  }
  if($("latestGamePhotoDeleteBtn")){
    $("latestGamePhotoDeleteBtn").onclick=()=>deleteGamePhoto(gameNo,seasonKey);
  }

  const gameTiming=bptGameTiming(rows),gameDurationSec=gameTiming.durationSec;

  // 10.4.44 — Chiffres clés en pastilles (date et lieu figurent déjà dans l'en-tête).
  const finalLevelChip=Math.max(0,...rows.map(r=>Number(r.outLevel)||0));
  $("latestGameSummary").innerHTML=[
    ["👥",`${rows.length}`,"joueurs"],
    ["🕘",gameTiming.startedAt?new Date(gameTiming.startedAt).toLocaleTimeString("fr-FR",{timeZone:"Europe/Paris",hour:"2-digit",minute:"2-digit"}):"—","début"],
    ["⏱",formatGameDuration(gameDurationSec),"durée"],
    ["⚔️",formatGameDuration(gameTiming.headsUpDurationSec),"heads-up"],
    ["🎯",finalLevelChip>0?`niv. ${finalLevelChip}`:"—","niveau final"],
    ["💰",euro(pot),"cagnotte"]
  ].map(([ico,value,label])=>`<div class="lg-chip"><span class="lg-chip-ico">${ico}</span><b>${esc(value)}</b><small>${esc(label)}</small></div>`).join("");

  const killerRanking=rows.slice().sort((a,b)=>Number(b.kills||0)-Number(a.kills||0));
  const killerTop=killerRanking[0]||null;

  // Informations plus utiles que "total des éliminations" ou "meilleur net",
  // qui sont mécaniquement liés au nombre de participants et au vainqueur.
  const bubble=rows.find(r=>Number(r.place)===4)||null;
  const finalLevel=Math.max(
    0,
    ...rows.map(r=>Number(r.outLevel)||0)
  );

  // 10.4.44 — Faits marquants en cartes homogènes (le niveau final est passé dans les pastilles).
  if($("latestGameHighlights")){
    const card=(ico,label,main,sub)=>`<div class="lg-hl"><span class="lg-hl-ico">${ico}</span><div class="lg-hl-copy"><small>${esc(label)}</small><strong>${main}</strong>${sub?`<em>${sub}</em>`:""}</div></div>`;
    const unlocked=gameUnlockedAchievements(gameNo);
    $("latestGameHighlights").innerHTML=[
      card("🔥","Killer de la partie",
        killerTop&&Number(killerTop.kills||0)>0?esc(killerTop.player):"—",
        killerTop&&Number(killerTop.kills||0)>0?`${killerTop.kills} kill${Number(killerTop.kills)>1?"s":""}`:""),
      card("🫧","La bulle",bubble?esc(bubble.player):"—",bubble?"sorti 4e, aux portes du podium":"pas de bulle sur cette partie"),
      `<div class="lg-hl lg-hl-wide"><span class="lg-hl-ico">🏅</span><div class="lg-hl-copy"><small>Accomplissements débloqués</small>${unlocked.length
        ? `<div class="lg-badges">${unlocked.map(a=>`<span class="lg-badge" title="${esc(a.desc||"")}">${a.icon} ${esc(a.name)}<i>${esc((a.players||[]).map(funPlayerLabel).join(", "))}</i></span>`).join("")}</div>`
        : "<strong>Aucun nouveau</strong>"}</div></div>`
    ].join("");
  }
  if($("latestGameCorrectionBtn")){
    $("latestGameCorrectionBtn").onclick=()=>openCorrectionForGame(gameNo);
  }

  if($("latestGameImpact")){
    const impacts=latestGameImpactItems(gameNo);
    $("latestGameImpact").innerHTML=impacts.length
      ? impacts.map(t=>`<div class="impact-item">${esc(t)}</div>`).join("")
      : '<div class="impact-item muted">Cette partie ne modifie pas significativement le classement général.</div>';
  }

  // 10.4.44 — Podium de la partie en marches (même rendu que le podium de l'Accueil).
  const lgStep=(r,place)=>r?`
    <button type="button" class="bpt-home-step place-${place}" onclick="openPlayerProfile(decodeURIComponent('${encodeURIComponent(r.player)}'))">
      <span class="bpt-home-step-medal">${medalForRank(place)}</span>
      <span class="bpt-home-step-name">${esc(r.player)}</span>
      <span class="bpt-home-step-nick">${esc(Number(r.gross||0)>0?euro(r.gross):(playerNicknameInfo(r.player).primary||""))||"&nbsp;"}</span>
      <span class="bpt-home-step-block"><b>${num(r.points||0,0)}</b><small>pts</small><i>${place}</i></span>
    </button>`:`<div class="bpt-home-step place-${place} is-empty"><span class="bpt-home-step-block"><i>${place}</i></span></div>`;
  $("latestGamePodium").innerHTML=lgStep(rows[1],2)+lgStep(rows[0],1)+lgStep(rows[2],3);

  // 10.4.44 — Liste compacte pour le téléphone en portrait ; le tableau reste pour le PC et le paysage.
  const lgList=`<div class="lg-results">${rows.map(r=>{
    const place=Number(r.place);
    const by=place===1?"vainqueur 🏆":(r.killer?`éliminé par <b>${esc(r.killer)}</b>${r.outLevel?` · niv. ${Number(r.outLevel)}`:""}`:"");
    const money=Number(r.gross||0)>0?` · <b class="lg-gain">+${euro(r.gross)}</b>`:"";
    return `<div class="lg-res${place<=3?" p"+place:""}">
      <span class="lg-res-place">${place<=3?medalForRank(place):place}</span>
      <div class="lg-res-main">
        <button type="button" class="lg-res-name" onclick="openPlayerProfile(decodeURIComponent('${encodeURIComponent(r.player)}'))">${esc(r.player)}</button>
        <small>${Number(r.kills)>0?`${num(r.kills,0)} kill${Number(r.kills)>1?"s":""} · `:""}${by}${money}</small>
      </div>
      <span class="lg-res-pts">${num(r.points||0,0)}<small>pts</small></span>
    </div>`;}).join("")}</div>`;
  $("latestGameResults").innerHTML=lgList+`<div class="tablewrap lg-table"><table>
    <thead><tr><th>Place</th><th>Joueur</th><th>Points</th><th>Kills</th><th>Éliminé par</th><th>Niveau</th><th>Temps de jeu</th><th>Gain</th><th>Net</th></tr></thead>
    <tbody>${rows.map(r=>`<tr>
      <td>${r.place}</td>
      <td>${playerNameHtml(r.player,{button:true,onclick:`openPlayerProfile(decodeURIComponent('${encodeURIComponent(r.player)}'))`})}</td>
      <td>${num(r.points||0,0)}</td>
      <td>${num(r.kills||0,0)}</td>
      <td>${Number(r.place)===1?"🏆":(r.killer?playerNameHtml(r.killer):"—")}</td>
      <td>${r.outLevel?`N${Number(r.outLevel)}`:"—"}</td>
      <td>${esc(playTimeDisplay(r, rows))}</td>
      <td>${euro(r.gross||0)}</td>
      <td>${euro(r.net||0)}</td>
    </tr>`).join("")}</tbody>
  </table></div>`;

  // Accomplissements réellement débloqués lors de la partie affichée.
  const unlockedThisGame=gameUnlockedAchievements(gameNo);
  const byPlayer=new Map();
  for(const a of unlockedThisGame){
    for(const player of (a.players||[])){
      if(!byPlayer.has(player))byPlayer.set(player,[]);
      byPlayer.get(player).push(a);
    }
  }

  $("latestGameAchievementsByPlayer").innerHTML=byPlayer.size
    ? [...byPlayer.entries()]
        .sort((a,b)=>a[0].localeCompare(b[0],"fr"))
        .map(([player,items])=>`<div class="lg-ach">
          <button class="lg-ach-name" type="button" onclick="openPlayerProfile(decodeURIComponent('${encodeURIComponent(player)}'))">${esc(player)}<small>${esc(playerNicknameInfo(player).primary||"")}</small></button>
          <div class="lg-badges">${items.map(a=>`<span class="lg-badge" title="${esc(a.desc)}">${a.icon} ${esc(a.name)}</span>`).join("")}</div>
        </div>`).join("")
    : '<span class="muted">Aucun nouvel accomplissement débloqué sur cette partie.</span>';
}

let rankingSortKey="points";
let rankingFilterKey="all";

function setRankingSort(key){
  const allowed=new Set(["points","progress","avgPoints","gamesCount","wins","podiums","tabliers","kills","kpg","net"]);
  rankingSortKey=allowed.has(String(key||""))?String(key):"points";
  renderRanking();
}

function setRankingFilter(key){
  const allowed=new Set(["all","top5","top10","active"]);
  rankingFilterKey=allowed.has(String(key||""))?String(key):"all";
  renderRanking();
}


function chartEscape(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

function renderLineChart(containerId,series,options={}){
  const el=$(containerId);
  if(!el)return;
  if(!Array.isArray(series)||!series.length){
    el.innerHTML='<div class="muted" style="padding:14px 0">Pas encore assez de données.</div>';
    return;
  }
  const width=760,height=250,padL=42,padR=20,padT=18,padB=34;
  const allPts=series.flatMap(s=>s.values||[]).filter(v=>v&&Number.isFinite(v.y));
  if(!allPts.length){
    el.innerHTML='<div class="muted" style="padding:14px 0">Pas encore assez de données.</div>';
    return;
  }
  const xs=allPts.map(v=>v.x), ys=allPts.map(v=>v.y);
  const minX=Math.min(...xs),maxX=Math.max(...xs);
  let minY=Math.min(...ys),maxY=Math.max(...ys);
  if(options.reverseY){ minY=Math.min(1,minY); }
  if(minY===maxY){maxY=minY+1}
  const sx=x=>padL+((x-minX)/Math.max(1,maxX-minX))*(width-padL-padR);
  const sy=y=>{
    const t=(y-minY)/(maxY-minY);
    return options.reverseY
      ? padT+t*(height-padT-padB)
      : height-padB-t*(height-padT-padB);
  };
  const grid=[];
  const ticks=5;
  for(let i=0;i<=ticks;i++){
    const yv=minY+(maxY-minY)*(i/ticks);
    const yy=sy(yv);
    grid.push(`<line x1="${padL}" y1="${yy}" x2="${width-padR}" y2="${yy}" stroke="rgba(255,255,255,.08)" stroke-width="1"/>`);
    grid.push(`<text x="${padL-8}" y="${yy+4}" fill="rgba(255,255,255,.45)" font-size="11" text-anchor="end">${Math.round(yv)}</text>`);
  }
  const palette=["#f1c86a","#62d889","#6fb7ff","#ff8b7b","#c89cff"];
  const paths=series.map((s,idx)=>{
    const vals=(s.values||[]).filter(v=>v&&Number.isFinite(v.y));
    const pts=vals.map(v=>`${sx(v.x)},${sy(v.y)}`).join(" ");
    const color=palette[idx%palette.length];
    const circles=vals.map(v=>`<circle cx="${sx(v.x)}" cy="${sy(v.y)}" r="3.2" fill="${color}"><title>${chartEscape(s.name)} — partie #${v.x} : ${v.y}</title></circle>`).join("");
    return `<polyline fill="none" stroke="${color}" stroke-width="2.5" points="${pts}" stroke-linecap="round" stroke-linejoin="round"/>${circles}`;
  }).join("");
  const minGame=Math.round(minX),maxGame=Math.round(maxX);
  const labels=`<text x="${padL}" y="${height-8}" fill="rgba(255,255,255,.45)" font-size="11">#${minGame}</text>
  <text x="${width-padR}" y="${height-8}" fill="rgba(255,255,255,.45)" font-size="11" text-anchor="end">#${maxGame}</text>`;
  el.innerHTML=`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${chartEscape(options.label||"Graphique")}">${grid.join("")}${paths}${labels}</svg>`;
}

function rankingSnapshotByGame(){
  const groups=groupedGames().slice().sort((a,b)=>Number(a[0])-Number(b[0]));
  const players=[...new Set((db.players||[]).map(p=>p.name).concat((db.history||[]).map(r=>r.player)))];
  const snapshots=[];
  for(const [gameNo] of groups){
    const hist=(db.history||[]).filter(r=>Number(r.game)<=Number(gameNo));
    const stats=players.map(name=>{
      const rows=hist.filter(r=>r.player===name);
      const points=rows.reduce((s,r)=>s+Number(r.points||0),0);
      return {name,points};
    }).filter(x=>x.points>0);
    stats.sort((a,b)=>b.points-a.points || a.name.localeCompare(b.name));
    snapshots.push({
      game:Number(gameNo),
      ranks:Object.fromEntries(stats.map((r,i)=>[r.name,i+1])),
      points:Object.fromEntries(stats.map(r=>[r.name,r.points]))
    });
  }
  return snapshots;
}

function championshipRecords(){
  const rank=ranking();
  const hist=db.history||[];
  if(!rank.length)return [];
  const bestBy=(key)=>rank.slice().sort((a,b)=>Number(b[key]||0)-Number(a[key]||0))[0];
  const wins=bestBy("wins"), podiums=bestBy("podiums"), kills=bestBy("kills"), avg=bestBy("avgPoints"), net=bestBy("net");

  let bestProgress=null;
  rank.forEach(r=>{
    if(r.progress!==null && Number(r.progress)>0 && (!bestProgress || Number(r.progress)>Number(bestProgress.progress))) bestProgress=r;
  });

  let bestStreak={name:"",value:0};
  for(const p of (db.players||[])){
    const rows=hist.filter(r=>r.player===p.name).slice().sort((a,b)=>Number(a.game)-Number(b.game));
    let cur=0,max=0;
    rows.forEach(r=>{cur=Number(r.place)<=3?cur+1:0;max=Math.max(max,cur)});
    if(max>bestStreak.value)bestStreak={name:p.name,value:max};
  }

  const durationRecords=bptDurationRecords();
  const secondPlaceCounts={};
  for(const r of hist){
    const player=String(r.player||"");
    if(player && Number(r.place)===2) secondPlaceCounts[player]=(secondPlaceCounts[player]||0)+1;
  }
  const bestSecond=Object.entries(secondPlaceCounts)
    .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],"fr"))[0];
  const poulidor=bestSecond?{name:bestSecond[0],value:bestSecond[1]}:null;
  return [
    ["Plus de victoires",wins?`${wins.name} · ${wins.wins}`:"—"],
    ["Plus de podiums",podiums?`${podiums.name} · ${podiums.podiums}`:"—"],
    ["Plus de kills",kills?`${kills.name} · ${kills.kills}`:"—"],
    ["Meilleure moyenne",avg?`${avg.name} · ${num(avg.avgPoints,1)} pts`:"—"],
    ["Plus forte progression",bestProgress?`${bestProgress.name} · +${bestProgress.progress}`:"—"],
    ["Plus gros solde net",net?`${net.name} · ${euro(net.net||0)}`:"—"],
    ["Série de podiums",bestStreak.value?`${bestStreak.name} · ${bestStreak.value}`:"—"],
    ["Heads-up le plus long",durationRecords.longestHu?`${bptHeadsUpPlayers(durationRecords.longestHu)} · ${formatGameDuration(durationRecords.longestHu.huDuration)}`:"—"],
    ["Heads-up le plus court",durationRecords.shortestHu?`${bptHeadsUpPlayers(durationRecords.shortestHu)} · ${formatGameDuration(durationRecords.shortestHu.huDuration)}`:"—"],
    ["Le Poulidor",poulidor?`${poulidor.name} · ${poulidor.value} deuxième${poulidor.value>1?"s":""} place${poulidor.value>1?"s":""}`:"—"]
  ];
}

function latestGameImpactItems(gameNo){
  const snapshots=rankingSnapshotByGame();
  const cur=snapshots.find(s=>s.game===Number(gameNo));
  const idx=snapshots.findIndex(s=>s.game===Number(gameNo));
  const prev=idx>0?snapshots[idx-1]:null;
  if(!cur)return [];
  const items=[];
  const curLeader=Object.entries(cur.ranks).sort((a,b)=>a[1]-b[1])[0]?.[0];
  const prevLeader=prev?Object.entries(prev.ranks).sort((a,b)=>a[1]-b[1])[0]?.[0]:null;
  if(curLeader && prevLeader && curLeader!==prevLeader)items.push(`Nouveau leader : ${curLeader} prend la tête du championnat.`);
  if(curLeader && !prevLeader)items.push(`${curLeader} prend la tête du championnat.`);

  if(prev){
    const movers=Object.keys(cur.ranks).map(name=>({
      name,
      before:prev.ranks[name]??null,
      after:cur.ranks[name]??null
    })).filter(x=>x.before&&x.after).map(x=>({...x,delta:x.before-x.after}));
    const up=movers.slice().sort((a,b)=>b.delta-a.delta)[0];
    const down=movers.slice().sort((a,b)=>a.delta-b.delta)[0];
    if(up&&up.delta>0)items.push(`${up.name} gagne ${up.delta} place${up.delta>1?"s":""} au classement général.`);
    if(down&&down.delta<0)items.push(`${down.name} perd ${Math.abs(down.delta)} place${Math.abs(down.delta)>1?"s":""}.`);

    for(const name of Object.keys(cur.ranks)){
      if(cur.ranks[name]<=3 && (!prev.ranks[name] || prev.ranks[name]>3)){
        items.push(`${name} entre dans le Top 3.`);
      }
    }
  }
  return [...new Set(items)].slice(0,5);
}

function recentGameNumbers(limit=3){
  return groupedGames().map(([g])=>Number(g)).filter(Number.isFinite).sort((a,b)=>a-b).slice(-limit);
}

function playerRecentForm(name,limit=3){
  const games=recentGameNumbers(limit);
  const rows=(db.history||[]).filter(r=>r.player===name && games.includes(Number(r.game)));
  return games.map(g=>{
    const r=rows.find(x=>Number(x.game)===g);
    return r?Number(r.place)||null:null;
  });
}

function recentFormHtml(name,limit=3){
  const values=playerRecentForm(name,limit);
  if(!values.length || values.every(v=>v===null))return '<span class="muted">—</span>';
  return `<span class="recent-form">${values.map(v=>{
    if(v===null)return '<span class="form-chip bad">–</span>';
    const cls=v===1?"win":v<=3?"podium":"";
    return `<span class="form-chip ${cls}" title="${v}e place">${v}</span>`;
  }).join("")}</span>`;
}

function rankingRowsForDisplay(){
  let rows=[...ranking()];
  if(rankingFilterKey==="top5")rows=rows.filter(r=>Number(r.rank)<=5);
  else if(rankingFilterKey==="top10")rows=rows.filter(r=>Number(r.rank)<=10);
  else if(rankingFilterKey==="active"){
    const recent=new Set(recentGameNumbers(3));
    const activeNames=new Set((db.history||[]).filter(r=>recent.has(Number(r.game))).map(r=>r.player));
    rows=rows.filter(r=>activeNames.has(r.name));
  }
  return rows.sort((a,b)=>{
    const av=rankingSortKey==="progress"?(a.progress===null?-Infinity:Number(a.progress||0)):Number(a?.[rankingSortKey]||0);
    const bv=rankingSortKey==="progress"?(b.progress===null?-Infinity:Number(b.progress||0)):Number(b?.[rankingSortKey]||0);
    return bv-av || Number(a.rank||9999)-Number(b.rank||9999) || String(a.name||"").localeCompare(String(b.name||""),"fr");
  });
}

// 10.4.42 — Valeur affichée à droite de la ligne (téléphone portrait) quand le tri n'est pas « points » :
// trié par kills → on montre les kills, etc. (en paysage et sur PC, chaque stat a déjà sa colonne).
const BPT_RANKING_SORT_VALUE={
  avgPoints:s=>[num(s.avgPoints,1),"moy."],
  gamesCount:s=>[s.gamesCount,Number(s.gamesCount)>1?"parties":"partie"],
  wins:s=>[s.wins,Number(s.wins)>1?"victoires":"victoire"],
  podiums:s=>[s.podiums,Number(s.podiums)>1?"podiums":"podium"],
  tabliers:s=>[s.tabliers,Number(s.tabliers)>1?"tabliers":"tablier"],
  kills:s=>[s.kills,Number(s.kills)>1?"kills":"kill"],
  kpg:s=>[num(s.kpg,2),"kills/p"],
  net:s=>[euro(s.net),"solde"]
};
function bptRankingSortValueHtml(s){
  const f=BPT_RANKING_SORT_VALUE[rankingSortKey];if(!f)return "";
  const [v,unit]=f(s);
  return `<span class="bpt-rk-sortval">${esc(String(v))}<small>${esc(unit)}</small></span>`;
}
function renderRanking(){
  renderCareerRatioSummary();
  const ks=killerStats();
  const select=$("rankingSortSelect");
  if(select && select.value!==rankingSortKey)select.value=rankingSortKey;
  const labels={points:"Tri par points",progress:"Tri par progression",avgPoints:"Tri par moyenne de points",gamesCount:"Tri par participations",wins:"Tri par victoires",podiums:"Tri par podiums",tabliers:"Tri par tabliers",kills:"Tri par kills",kpg:"Tri par kills / partie",net:"Tri par solde net"};
  if($("rankingSortHint"))$("rankingSortHint").textContent=labels[rankingSortKey]||labels.points;
  document.querySelectorAll("[data-ranking-filter]").forEach(btn=>btn.classList.toggle("active",btn.dataset.rankingFilter===rankingFilterKey));
  const sortVal=!!BPT_RANKING_SORT_VALUE[rankingSortKey];
  const displayRows=rankingRowsForDisplay();
  // Position dans le tri choisi (ex æquo = même position), affichée en portrait à la place du rang aux points.
  const sortPos=new Map();
  if(sortVal){
    let prev=null,pos=0;
    displayRows.forEach((r,i)=>{const v=Number(r?.[rankingSortKey]||0);if(prev===null||v!==prev){pos=i+1;prev=v;}sortPos.set(r.name,pos);});
  }
  $("rankingBody").innerHTML=displayRows.map(s=>`<tr class="${s.rank===1?"rank1":s.rank===2?"rank2":s.rank===3?"rank3":""}${sortVal?" has-sortval":""}">
    <td data-label="Clt"><span class="bpt-rk-clt">${medalForRank(s.rank)} ${s.rank}</span>${sortVal?`<span class="bpt-rk-sortpos">${sortPos.get(s.name)}</span>`:""}</td>
    <td data-label="Joueur">${playerNameHtml(s.name,{button:true,buttonClass:"ranking-player-link",breakName:!document.documentElement.classList.contains("bpt-mobile-device"),avatar:false,onclick:`openPlayerProfile(decodeURIComponent('${encodeURIComponent(s.name)}'))`})}</td>
    <td data-label="Points"><b>${num(s.points,0)}</b>${sortVal?bptRankingSortValueHtml(s):""}</td>
    <td data-label="Évolution">${s.progress===null
      ? (isArchiveSeason()?"—":'<span class="progress-new">Nouveau</span>')
      : s.progress>0
        ? `<span class="progress-indicator progress-up" title="Progression de ${s.progress} place${s.progress>1?"s":""}"><span class="progress-arrow">▲</span><strong>+${s.progress}</strong></span>`
        : s.progress<0
          ? `<span class="progress-indicator progress-down" title="Recul de ${Math.abs(s.progress)} place${Math.abs(s.progress)>1?"s":""}"><span class="progress-arrow">▼</span><strong>${s.progress}</strong></span>`
          : '<span class="progress-indicator progress-flat" title="Position inchangée"><span class="progress-arrow">●</span><strong>0</strong></span>'
    }</td>
    <td data-label="3 dernières">${recentFormHtml(s.name,3)}</td>
    <td data-label="Moy. pts">${num(s.avgPoints,1)}</td>
    <td data-label="Participations">${s.gamesCount}</td>
    <td data-label="Victoires">${s.wins}</td>
    <td data-label="Victoires %">${num(s.winRate,1)} %</td>
    <td data-label="Podiums">${s.podiums}</td>
    <td data-label="Podiums %">${num(s.podiumRate,1)} %</td>
    <td data-label="Tabliers">${s.tabliers}</td>
    <td data-label="Kills">${s.kills}</td>
    <td data-label="Kills/partie">${num(s.kpg,2)}</td>
    <td data-label="Solde net">${euro(s.net)}</td>
    <td data-label="Bourreau">${(()=>{const e=ks.mainKillerEntry(s.name);return e?`${playerNameHtml(e.name,{avatar:false})} <span class="muted">· ${e.count} élimination${e.count>1?"s":""}</span>`:"—";})()}</td>
    <td data-label="Victime">${(()=>{const e=ks.mainVictimEntry(s.name);return e?`${playerNameHtml(e.name,{avatar:false})} <span class="muted">· ${e.count} kill${e.count>1?"s":""}</span>`:"—";})()}</td>
    <td class="bpt-rk-stats">${(()=>{
      const st=(lab,val,wide)=>`<span class="bpt-rk-stat${wide?" is-wide":""}"><span>${lab}</span><b>${val}</b></span>`;
      const k=ks.mainKillerEntry(s.name),v=ks.mainVictimEntry(s.name);
      return [st("Moy.",num(s.avgPoints,1)),st("Parties",s.gamesCount),st("Victoires",`${s.wins} · ${num(s.winRate,0)} %`),st("Podiums",`${s.podiums} · ${num(s.podiumRate,0)} %`),
        st("Tabliers",s.tabliers),st("Kills",`${s.kills} · ${num(s.kpg,1)}/p`),st("Solde",euro(s.net)),st("",""),
        st("Bourreau",k?`${playerNameHtml(k.name,{avatar:false})} · ${k.count}`:"—",true),st("Victime",v?`${playerNameHtml(v.name,{avatar:false})} · ${v.count}`:"—",true)].join("");
    })()}</td>
  </tr>`).join("");
}

// 10.4.37 — Classement téléphone en liste compacte : un appui sur une ligne déplie / replie ses stats.
// 10.4.38 — Ligne repliée : l'appui sur le nom déplie aussi le détail (pas d'ouverture du profil).
// Le profil ne s'ouvre qu'en touchant le nom une fois le détail affiché.
// Écoute en phase de capture pour passer avant le onclick du nom.
document.addEventListener("click",e=>{
  if(!document.documentElement.classList.contains("bpt-mobile-device"))return;
  if(!window.matchMedia("(orientation: portrait)").matches)return; // paysage : tableau classique
  const tr=e.target.closest?.("#rankingBody tr");
  if(!tr)return;
  const onButton=e.target.closest("button,a");
  if(onButton){
    if(tr.classList.contains("is-open"))return; // détail affiché : le nom ouvre le profil
    e.preventDefault();e.stopPropagation();
    tr.classList.add("is-open");
    return;
  }
  tr.classList.toggle("is-open");
},true);


function versusPlayerMetrics(name){
  const base=stats(false).find(s=>s.name===name);
  const rows=(db.history||[])
    .filter(r=>String(r.player||"")===name)
    .sort((a,b)=>Number(a.game)-Number(b.game));

  if(!base || !rows.length)return null;

  const places=rows.map(r=>Number(r.place)||0).filter(n=>n>0);
  const bestPlace=places.length?Math.min(...places):null;
  const avgPlace=places.length?places.reduce((a,b)=>a+b,0)/places.length:null;
  const rankRow=ranking().find(r=>r.name===name);

  return {
    ...base,
    rank:rankRow?.rank||null,
    bestPlace,
    avgPlace
  };
}

function versusHeadToHead(name1,name2){
  const history=Array.isArray(db.history)?db.history:[];
  const byGame=new Map();

  for(const r of history){
    const g=Number(r.game);
    if(!Number.isFinite(g))continue;
    if(!byGame.has(g))byGame.set(g,[]);
    byGame.get(g).push(r);
  }

  let commonGames=0;
  let better1=0;
  let better2=0;
  let ties=0;

  for(const rows of byGame.values()){
    const r1=rows.find(r=>String(r.player||"")===name1);
    const r2=rows.find(r=>String(r.player||"")===name2);
    if(!r1 || !r2)continue;

    commonGames++;
    const p1=Number(r1.place)||0;
    const p2=Number(r2.place)||0;

    if(p1 && p2){
      if(p1<p2)better1++;
      else if(p2<p1)better2++;
      else ties++;
    }
  }

  // Nombre de fois où l'un a directement éliminé l'autre.
  const elim1By2=history.filter(
    r=>String(r.player||"")===name1 && String(r.killer||"")===name2
  ).length;

  const elim2By1=history.filter(
    r=>String(r.player||"")===name2 && String(r.killer||"")===name1
  ).length;

  return {
    commonGames,
    better1,
    better2,
    ties,
    elim1By2,
    elim2By1
  };
}

function renderVersus(){
  const s1=$("versusPlayer1");
  const s2=$("versusPlayer2");
  if(!s1 || !s2)return;

  const profileName=$("profilePlayerSelect")?.value || "";
  const previous2=s2.value;

  const ranked=ranking();
  const names=[...new Set([
    ...ranked.map(r=>r.name),
    ...(db.history||[]).map(r=>String(r.player||"")).filter(Boolean)
  ])].sort((a,b)=>a.localeCompare(b,"fr",{sensitivity:"base"}));

  s1.innerHTML=names.map(n=>`<option value="${esc(n)}">${esc(playerDisplayWithRealName(n))}</option>`).join("");
  s1.value=names.includes(profileName)?profileName:(ranked[0]?.name||names[0]||"");

  const player2Names=names.filter(n=>n!==s1.value);
  s2.innerHTML='<option value="">— Choisir un adversaire —</option>'+
    player2Names.map(n=>`<option value="${esc(n)}">${esc(playerDisplayWithRealName(n))}</option>`).join("");

  if(previous2 && player2Names.includes(previous2))s2.value=previous2;
  else if(player2Names.length)s2.value=player2Names[0];

  if($("versusPlayer1Display"))$("versusPlayer1Display").value=playerDisplayWithRealName(s1.value);
  const name1=s1.value;
  const name2=s2.value;
  const m1=versusPlayerMetrics(name1);
  const m2=versusPlayerMetrics(name2);

  const valid=!!(name1 && name2 && name1!==name2 && m1 && m2);
  $("versusEmpty").style.display=valid?"none":"block";
  $("versusContent").style.display=valid?"block":"none";
  if(!valid)return;

  $("versusName1").innerHTML=playerNameHtml(name1);
  $("versusName2").innerHTML=playerNameHtml(name2);
  $("versusHeader1").textContent=name1;
  $("versusHeader2").textContent=name2;
  $("versusRank1").textContent=m1.rank?`Classement général : #${m1.rank}`:"Non classé";
  $("versusRank2").textContent=m2.rank?`Classement général : #${m2.rank}`:"Non classé";

  const h2h=versusHeadToHead(name1,name2);

  if($("versusScoreboard")){
    $("versusScoreboard").innerHTML=`
      <div class="versus-score">${playerNameHtml(name1)}<b>${h2h.better1}</b><small>duels gagnés</small></div>
      <div class="versus-center">${h2h.commonGames} partie${h2h.commonGames>1?"s":""} commune${h2h.commonGames>1?"s":""}<br><span class="muted">${h2h.elim2By1}–${h2h.elim1By2} éliminations directes</span></div>
      <div class="versus-score">${playerNameHtml(name2)}<b>${h2h.better2}</b><small>duels gagnés</small></div>`;
  }

  const criteria=[
    {label:"Points",a:m1.points,b:m2.points,fmt:v=>num(v,0)},
    {label:"Moyenne de points",a:m1.avgPoints,b:m2.avgPoints,fmt:v=>num(v,1)},
    {label:"Participations",a:m1.gamesCount,b:m2.gamesCount,fmt:v=>num(v,0)},
    {label:"Parties communes",a:h2h.commonGames,b:h2h.commonGames,fmt:v=>num(v,0),neutral:true},
    {label:"Mieux classé sur les parties communes",a:h2h.better1,b:h2h.better2,fmt:v=>num(v,0)},
    {label:"Éliminations directes de l’adversaire",a:h2h.elim2By1,b:h2h.elim1By2,fmt:v=>num(v,0)},
    {label:"Victoires",a:m1.wins,b:m2.wins,fmt:v=>num(v,0)},
    {label:"Taux de victoire",a:m1.winRate,b:m2.winRate,fmt:v=>num(v,1)+" %"},
    {label:"Podiums",a:m1.podiums,b:m2.podiums,fmt:v=>num(v,0)},
    {label:"Taux de podium",a:m1.podiumRate,b:m2.podiumRate,fmt:v=>num(v,1)+" %"},
    {label:"Kills",a:m1.kills,b:m2.kills,fmt:v=>num(v,0)},
    {label:"Kills / partie",a:m1.kpg,b:m2.kpg,fmt:v=>num(v,2)},
    {label:"Meilleure place",a:m1.bestPlace,b:m2.bestPlace,fmt:v=>v?`${num(v,0)}e`:"—",lowerBetter:true},
    {label:"Place moyenne",a:m1.avgPlace,b:m2.avgPlace,fmt:v=>v?num(v,2):"—",lowerBetter:true},
    {label:"Tabliers",a:m1.tabliers,b:m2.tabliers,fmt:v=>num(v,0)},
    {label:"Solde net",a:m1.net,b:m2.net,fmt:v=>euro(v)}
  ];

  $("versusBody").innerHTML=criteria.map(c=>{
    const a=Number(c.a);
    const b=Number(c.b);
    let aClass="versus-equal",bClass="versus-equal";

    if(!c.neutral && Number.isFinite(a) && Number.isFinite(b) && a!==b){
      const aWins=c.lowerBetter?a<b:a>b;
      aClass=aWins?"versus-best":"";
      bClass=aWins?"":"versus-best";
    }

    return `<tr>
      <td><span class="versus-value ${aClass}">${c.fmt(c.a)}</span></td>
      <td><span class="versus-criterion">${esc(c.label)}</span></td>
      <td><span class="versus-value ${bClass}">${c.fmt(c.b)}</span></td>
    </tr>`;
  }).join("");
}

function renderHistory(){
  const rows=Array.isArray(db?.history)?[...db.history]:[];
  const games=new Set(
    rows.map(r=>Number(r.game)).filter(n=>Number.isFinite(n) && n>0)
  ).size;

  if($("historySummary")){
    $("historySummary").textContent=
      `${games} partie${games>1?"s":""} • ${rows.length} résultat${rows.length>1?"s":""}`;
  }

  if($("historyEmpty"))$("historyEmpty").style.display=rows.length?"none":"block";
  if($("historyTableWrap"))$("historyTableWrap").style.display=rows.length?"block":"none";
  renderHistoryCards();

  if(!$("historyBody"))return;

  $("historyBody").innerHTML=rows
    .sort((a,b)=>Number(b.game)-Number(a.game)||Number(a.place)-Number(b.place))
    .map(r=>`<tr>
      <td><b>${Number(r.game)||""}</b></td>
      <td>${esc(shortDate(r.date||""))}</td>
      <td>${esc(r.location||"")}</td>
      <td>${r.player?playerNameHtml(r.player):""}</td>
      <td>${Number(r.place)||""}</td>
      <td>${r.killer?playerNameHtml(r.killer):""}</td>
      <td>${r.tablier?"Oui":""}</td>
      <td>${Number(r.n)||""}</td>
      <td>${num(r.points,0)}</td>
      <td>${euro(r.stake)}</td>
      <td>${euro(r.gross)}</td>
      <td>${euro(r.net)}</td>
      <td>${Number(r.kills)||0}</td>
    </tr>`).join("");
}
function renderPlayers(){
  const wrap=$("playersAdmin");
  if(!wrap)return;
  if(bptMigrateLegacyElenPlayerDirectory())saveLocalOnly();

  const players=[...db.players].sort((a,b)=>a.name.localeCompare(b.name,"fr",{sensitivity:"base"}));
  bptNotifySettingsPlayers();
  if(!players.length){
    wrap.innerHTML='<div class="muted">Aucun joueur.</div>';
    return;
  }

  const groups=new Map();
  for(const p of players){
    const letter=(String(p.name||"").trim().charAt(0)||"#").toUpperCase();
    if(!groups.has(letter))groups.set(letter,[]);
    groups.get(letter).push(p);
  }

  wrap.innerHTML=[...groups.entries()].map(([letter,list])=>`
    <div class="player-alpha-group">
      <div class="player-alpha-letter">${esc(letter)}</div>
      <div class="player-admin-list">
        ${list.map(p=>`
          <div class="player-admin-row ${p.active?"":"inactive"}" data-player="${encodeURIComponent(p.name)}">
            <div class="player-avatar-admin" title="Avatar modifiable depuis l’onglet Profil">
              ${playerAvatarId(p.name)
                ? `<img src="${playerAvatarDataUrl(playerAvatarId(p.name))}" alt="Avatar de ${esc(p.name)}">`
                : `<div class="player-avatar-admin-placeholder">♠</div>`}
              <span class="muted">Avatar via Profil</span>
            </div>
            <div class="player-admin-fields">
              <input class="player-rename-input" value="${esc(p.name)}"
                     aria-label="Nom du joueur ${esc(p.name)}"
                     title="Modifiez le nom puis validez avec Entrée ou en quittant le champ">
              <input class="player-nickname-input" value="${esc(playerNicknameInfo(p.name).primary)}"
                     placeholder="Surnom"
                     aria-label="Surnom de ${esc(p.name)}"
                     title="Surnom affiché dans le profil. Les surnoms des Annales sont proposés par défaut.">
            </div>
            <div class="player-admin-actions">
              <button class="btn ghost player-active-btn" type="button">${p.active?"Actif":"Inactif"}</button>
              <button class="btn ghost player-code-reset-btn" type="button">Réinitialiser le code</button>
              <button class="btn danger player-delete-btn" type="button">Supprimer</button>
              <span class="muted player-code-reset-status" role="status" aria-live="polite"></span>
            </div>
          </div>`).join("")}
      </div>
    </div>`).join("");

  const mergeSource=$("mergePlayerSource"),mergeTarget=$("mergePlayerTarget");
  if(mergeSource&&mergeTarget){
    const opts=players.map(p=>`<option value="${esc(p.name)}">${esc(playerDisplayWithRealName(p.name))}</option>`).join("");
    const oldS=mergeSource.value,oldT=mergeTarget.value;
    mergeSource.innerHTML=opts;mergeTarget.innerHTML=opts;
    if(players.some(p=>p.name===oldS))mergeSource.value=oldS;
    if(players.some(p=>p.name===oldT))mergeTarget.value=oldT;
    if(mergeSource.value===mergeTarget.value && players.length>1)mergeTarget.selectedIndex=1;
  }

  wrap.querySelectorAll(".player-admin-row").forEach(row=>{
    const oldName=decodeURIComponent(row.dataset.player||"");
    const input=row.querySelector(".player-rename-input");
    const nicknameInput=row.querySelector(".player-nickname-input");
    const activeBtn=row.querySelector(".player-active-btn");
    const deleteBtn=row.querySelector(".player-delete-btn");

    let renameInProgress=false;
    const commitRename=async ()=>{
      if(renameInProgress)return;
      const candidate=String(input.value||"").trim().replace(/\s+/g," ");
      if(candidate===oldName)return;
      renameInProgress=true;
      try{
        await renamePlayerInline(oldName,input,null);
      }finally{
        renameInProgress=false;
      }
    };

    input.addEventListener("change",commitRename);
    input.addEventListener("keydown",e=>{
      if(e.key==="Enter"){
        e.preventDefault();
        input.blur();
      }
      if(e.key==="Escape"){
        input.value=oldName;
        input.blur();
      }
    });

    if(nicknameInput){
      nicknameInput.addEventListener("change",()=>savePlayerNickname(oldName,nicknameInput.value));
      nicknameInput.addEventListener("keydown",e=>{
        if(e.key==="Enter"){e.preventDefault();nicknameInput.blur();}
      });
    }
    activeBtn.onclick=()=>togglePlayerByName(oldName);
    deleteBtn.onclick=()=>deletePlayerByName(oldName);
    const resetBtn=row.querySelector('.player-code-reset-btn'),resetStatus=row.querySelector('.player-code-reset-status');
    resetBtn.onclick=async()=>{
      if(!settingsUnlocked)return;
      if(!confirm(`Réinitialiser le code personnel de « ${oldName} » ?\n\nÀ sa prochaine connexion, ce joueur devra créer un nouveau code à 4 chiffres.`))return;
      resetBtn.disabled=true;resetStatus.textContent='Réinitialisation…';
      try{
        if(!window.BPTLive3?.resetPlayerProfileCode)throw new Error('Connexion indisponible. Réessayez.');
        await window.BPTLive3.resetPlayerProfileCode(oldName);
        resetStatus.textContent='Code réinitialisé. Nouveau code à créer à la prochaine connexion.';
      }catch(e){resetStatus.textContent='Échec : '+(e.message||'réessayez.');}
      finally{resetBtn.disabled=false;}
    };
  });
}

function findPlayerInsensitive(name){
  const target=String(name||"").trim();
  return db.players.find(p=>p.name.localeCompare(target,"fr",{sensitivity:"base"})===0);
}

function addActivePlayer(name){
  const clean=String(name||"").trim().replace(/\s+/g," ");
  if(!clean)return {ok:false,message:"Saisissez le nom du joueur."};

  const existing=findPlayerInsensitive(clean);
  if(existing){
    existing.active=true;
    saveDB();
    renderAll();
    return {ok:true,name:existing.name,existing:true};
  }

  db.players.push({name:clean,nickname:"",active:true});
  saveDB();
  renderAll();
  return {ok:true,name:clean,existing:false};
}

function addPlayerFromGame(){
  const input=$("gameNewPlayer");
  const result=addActivePlayer(input.value);
  if(!result.ok){alert(result.message);return;}

  input.value="";
  renderGamePlayers();

  const cb=[...document.querySelectorAll(".gp")].find(x=>x.value===result.name);
  if(cb)cb.checked=true;
}


async function renamePlayerInline(oldName,input,button){
  if(!settingsUnlocked)return;

  const newName=String(input?.value||"").trim().replace(/\s+/g," ");
  if(!newName){
    alert("Le nom du joueur ne peut pas être vide.");
    input.value=oldName;
    return;
  }
  if(newName===oldName)return;

  const duplicate=db.players.find(
    p=>p.name!==oldName &&
    p.name.localeCompare(newName,"fr",{sensitivity:"base"})===0
  );
  if(duplicate){
    alert("Un joueur portant déjà ce nom existe.");
    input.value=oldName;
    return;
  }

  if(!confirm(
    `Renommer « ${oldName} » en « ${newName} » ?\n\n`+
    `Le nouveau nom remplacera l’ancien dans tout l’historique et dans les champs « Éliminé par ».`
  )){
    input.value=oldName;
    return;
  }

  const player=db.players.find(p=>p.name===oldName);
  if(!player){
    alert("Joueur introuvable.");
    renderPlayers();
    return;
  }

  const backup=JSON.parse(JSON.stringify(db));
  const backupPending=pendingGamesLoad();
  if(button)button.disabled=true;

  try{
    setCloudStatus("busy","Renommage en cours…");

    player.name=newName;

    db.history=(db.history||[]).map(r=>({
      ...r,
      player:r.player===oldName?newName:r.player,
      killer:r.killer===oldName?newName:r.killer
    }));

    const pending=backupPending.map(rows=>(rows||[]).map(r=>({
      ...r,
      player:r.player===oldName?newName:r.player,
      killer:r.killer===oldName?newName:r.killer
    })));
    pendingGamesSave(pending);

    saveLocalOnly();
    renderAll();

    if(cloudReady && firebaseStore){
      // Replace the canonical history immediately, then write the shared player state.
      await cloudReplaceAllGames(db.history||[]);

      const payload=JSON.parse(JSON.stringify(db));
      payload.history=[];

      const {error}=await firebaseStore
        .from("bpt_state")
        .upsert({id:CLOUD_ROW_ID,data:payload},{onConflict:"id"});
      if(error)throw error;

      db.history=await cloudFetchGames();
      normalizeHistoryGameNumbers();
      saveLocalOnly();

      const oldStillPresent=(db.history||[]).some(
        r=>r.player===oldName || r.killer===oldName
      );
      if(oldStillPresent)throw new Error("L'ancien nom est encore présent dans l'historique partagé.");

      cloudLocalDirty=false;
      cloudHistoryReplaceOnce=false;
      renderAll();
      setCloudStatus("ok","Renommage synchronisé");
      alert(`Joueur renommé : « ${oldName} » → « ${newName} ».`);
    }else{
      cloudHistoryReplaceOnce=true;
      cloudLocalDirty=true;
      saveLocalOnly();
      renderAll();
      setCloudStatus("offline","Renommage en attente","La modification sera synchronisée dès le retour de la connexion.");
      alert(`Joueur renommé localement : « ${oldName} » → « ${newName} ».`);
    }
  }catch(e){
    db=backup;
    pendingGamesSave(backupPending);
    cloudLocalDirty=false;
    cloudHistoryReplaceOnce=false;
    saveLocalOnly();
    renderAll();
    console.error("BPT rename player:",e);
    setCloudStatus("offline","Erreur renommage",e?.message||String(e));
    alert("Le renommage a échoué.\n\n"+(e?.message||String(e)));
  }finally{
    if(button)button.disabled=false;
  }
}


async function mergePlayersByName(){
  if(!settingsUnlocked)return;
  const source=String($("mergePlayerSource")?.value||"").trim();
  const target=String($("mergePlayerTarget")?.value||"").trim();
  if(!source||!target){alert("Sélectionnez les deux joueurs.");return;}
  if(source===target){alert("Le joueur source et le joueur conservé doivent être différents.");return;}
  if(!confirm(`Fusionner « ${source} » dans « ${target} » ?\n\nCette opération rattache l'historique, les kills et les statistiques au joueur conservé.`))return;

  const backup=clone(db);
  const pendingBackup=pendingGamesLoad();
  try{
    setCloudStatus("busy","Fusion des joueurs…");
    ensurePlayerAliases()[source]=target;

    const photoMap=ensurePlayerPhotos();
    if(photoMap[source] && !photoMap[target])photoMap[target]=photoMap[source];
    delete photoMap[source];

    // Current season / current cache
    const replaceRows=rows=>(rows||[]).map(r=>({
      ...r,
      player:r.player===source?target:r.player,
      killer:r.killer===source?target:r.killer
    }));
    currentSeasonHistoryCache=replaceRows(currentSeasonHistoryCache||[]);
    if(selectedSeasonKey===CURRENT_SEASON_KEY)db.history=replaceRows(db.history||[]);

    // Pending games
    pendingGamesSave(pendingBackup.map(rows=>replaceRows(rows)));

    // Player directory
    const src=db.players.find(p=>p.name===source);
    const dst=db.players.find(p=>p.name===target);
    if(dst && src){
      dst.active=dst.active||src.active;
      if(!String(dst.nickname||"").trim() && String(src.nickname||"").trim())dst.nickname=src.nickname;
      if(!(dst.auth?.salt&&dst.auth?.digest) && src.auth?.salt&&src.auth?.digest)dst.auth=clone(src.auth);
    }
    db.players=(db.players||[]).filter(p=>p.name!==source);

    // Refresh displayed archive/cumulative context
    const restoredArchiveRows=archiveRowsForSeason(selectedSeasonKey);
    if(Array.isArray(restoredArchiveRows))db.history=applyPlayerAliasesToRows(restoredArchiveRows);
    else if(selectedSeasonKey==="all")db.history=buildAllSeasonsHistory();

    saveLocalOnly();
    renderAll();

    if(cloudReady&&firebaseStore){
      // Rewrite current official history so the merge is durable there too.
      const currentForServer=replaceRows(currentSeasonHistoryCache||[]);
      if(currentForServer.length)await cloudReplaceAllGames(currentForServer);

      const payload=clone(db);payload.history=[];
      const {error}=await firebaseStore.from("bpt_state").upsert({id:CLOUD_ROW_ID,data:payload},{onConflict:"id"});
      if(error)throw error;

      currentSeasonHistoryCache=applyPlayerAliasesToRows(recalcCurrentSeasonPoints(await cloudFetchGames()));
      cloudLocalDirty=false;cloudHistoryReplaceOnce=false;
      setCloudStatus("ok","Fusion synchronisée");
    }else{
      cloudLocalDirty=true;cloudHistoryReplaceOnce=true;
      setCloudStatus("offline","Fusion en attente","La fusion sera synchronisée au retour de la connexion.");
    }
    renderAll();
    alert(`Fusion terminée : « ${source} » → « ${target} ».`);
  }catch(e){
    db=backup;
    pendingGamesSave(pendingBackup);
    saveLocalOnly();renderAll();
    setCloudStatus("offline","Erreur fusion",e?.message||String(e));
    alert("La fusion a échoué.\n\n"+(e?.message||String(e)));
  }
}

function togglePlayerByName(name){
  const p=db.players.find(x=>x.name===name);
  if(!p)return;
  p.active=!p.active;
  saveDB();
  renderAll();
}

async function deletePlayerByName(name){
  const p=db.players.find(x=>x.name===name);
  if(!p){
    await bptMessage("Joueur introuvable dans la liste.","Suppression impossible");
    return;
  }

  const norm=s=>String(s||"").trim().toLocaleLowerCase("fr-FR");
  const key=norm(name);

  // Un historique de joueur signifie qu'il a réellement participé à une partie.
  // Une simple mention comme éliminateur ne bloque pas la suppression du référentiel.
  const historyRows=(db.history||[]).filter(r=>norm(r.player)===key);
  const inHistory=historyRows.length>0;

  const live3=window.BPTLive3?.getState?.()||null;
  const inLive=!!(live3?.active && !live3?.finishedAt && Array.isArray(live3.players) &&
    live3.players.some(x=>norm(x.name)===key && (x.status==="in" || x.status==="winner")));

  if(inHistory){
    await bptMessage(
      `Impossible de supprimer « ${name} » : ce joueur possède un historique de ${historyRows.length} participation${historyRows.length>1?"s":""}.\n\n`+
      `Vous pouvez uniquement le passer en Inactif avec le bouton Actif/Inactif.`,
      "Suppression impossible"
    );
    return;
  }

  if(inLive){
    await bptMessage(
      `Impossible de supprimer « ${name} » : ce joueur participe actuellement à une partie Live.`,
      "Suppression impossible"
    );
    return;
  }

  const confirmed=await bptConfirm(
    `Supprimer définitivement « ${name} » de la liste des joueurs ?`,
    "Supprimer le joueur",
    "Supprimer"
  );
  if(!confirmed)return;

  const backup=JSON.parse(JSON.stringify(db));

  try{
    db.players=db.players.filter(x=>norm(x.name)!==key);

    // Ne touche jamais à l'historique officiel.
    saveLocalOnly();
    renderAll();

    if(cloudReady && firebaseStore){
      setCloudStatus("busy","Suppression du joueur…");

      // Écrit explicitement l'état partagé sans attendre le debounce.
      const payload=JSON.parse(JSON.stringify(db));
      payload.history=[];

      const {error}=await firebaseStore
        .from("bpt_state")
        .upsert({id:CLOUD_ROW_ID,data:payload},{onConflict:"id"});
      if(error)throw error;

      cloudLocalDirty=false;
      saveLocalOnly();
      renderAll();
      setCloudStatus("ok","Joueur supprimé");
      await bptMessage(`« ${name} » a été supprimé de la liste des joueurs.`,"Joueur supprimé");
    }else{
      // Hors ligne : conserve la suppression localement et programme la synchro.
      scheduleCloudSave();
      await bptMessage(
        `« ${name} » a été supprimé localement. La synchronisation sera faite dès que possible.`,
        "Joueur supprimé"
      );
    }
  }catch(e){
    db=backup;
    saveLocalOnly();
    renderAll();
    console.error("BPT delete player:",e);
    setCloudStatus("offline","Erreur suppression",e?.message||String(e));
    await bptMessage(
      "La suppression a échoué.\n\n"+(e?.message||String(e)),
      "Erreur de suppression"
    );
  }
}


function bptPlayerParticipationCount(name){
  const target=String(name||"").trim();
  if(!target)return 0;

  const rows=Array.isArray(currentSeasonHistoryCache) && currentSeasonHistoryCache.length
    ? currentSeasonHistoryCache
    : (Array.isArray(db?.history)?db.history:[]);

  return rows.reduce((count,row)=>
    String(row?.player||"").trim().localeCompare(target,"fr",{sensitivity:"base"})===0
      ? count+1
      : count
  ,0);
}

function bptSortPlayersByParticipation(a,b){
  const nameA=String(typeof a==="string"?a:a?.name||"").trim();
  const nameB=String(typeof b==="string"?b:b?.name||"").trim();

  const diff=bptPlayerParticipationCount(nameB)-bptPlayerParticipationCount(nameA);
  if(diff!==0)return diff;

  return nameA.localeCompare(nameB,"fr",{sensitivity:"base"});
}

function renderGamePlayers(){
  const selected=new Set(
    [...document.querySelectorAll(".gp:checked")].map(x=>x.value)
  );

  const gStake=$("gStake");
  const gDate=$("gDate");
  const gamePlayerChecks=$("gamePlayerChecks");
  if(gStake)gStake.value=db.settings.stake;
  if(gDate && !gDate.value)gDate.value=new Date().toISOString().slice(0,10);
  if(!gamePlayerChecks)return;

  gamePlayerChecks.innerHTML=db.players
    .filter(p=>p.active)
    .sort(bptSortPlayersByParticipation)
    .map(p=>`<label style="display:block;padding:5px 0">
      <input class="gp" type="checkbox" value="${esc(p.name)}" style="width:auto" ${selected.has(p.name)?"checked":""}> ${esc(p.name)}
    </label>`).join("");
}

function validateCompletedGameRows(rows){
  if(!Array.isArray(rows) || rows.length<2){
    return "La partie doit comporter au moins 2 joueurs.";
  }

  const sorted=[...rows].sort((a,b)=>Number(a.place)-Number(b.place));
  const n=sorted.length;
  const names=sorted.map(r=>String(r.player||"").trim());

  if(names.some(n=>!n))return "Tous les joueurs doivent être renseignés.";
  if(new Set(names).size!==names.length)return "Un joueur apparaît plusieurs fois dans la partie.";

  for(let i=0;i<n;i++){
    const r=sorted[i];
    const place=i+1;
    const actualPlace=Number(r.place)||0;
    const killer=String(r.killer||"").trim();

    if(actualPlace!==place){
      return `Le classement est incomplet ou incohérent : la place ${place} est manquante.`;
    }

    if(place===1){
      if(killer)return "Le vainqueur ne doit pas avoir d’éliminateur.";
      continue;
    }

    if(!killer){
      return `Place ${place} — ${r.player} : le champ « Éliminé par » est obligatoire.`;
    }
    if(killer===r.player){
      return `Place ${place} — ${r.player} : un joueur ne peut pas s’éliminer lui-même.`;
    }

    const killerIndex=names.indexOf(killer);
    if(killerIndex<0){
      return `Place ${place} — ${r.player} : l’éliminateur ${killer} ne participe pas à la partie.`;
    }
    if(killerIndex>=i){
      return `Place ${place} — ${r.player} : ${killer} était déjà éliminé au moment de cette sortie.`;
    }
  }

  return "";
}

function championshipPointsNotice(n){
  return Number(n)<6
    ? "Partie enregistrée, mais aucun point championnat n’est attribué : le barème BPT commence à 6 joueurs."
    : "";
}

async function persistCompletedGame(rows,options={}){
  const validation=validateCompletedGameRows(rows);
  if(validation)throw new Error(validation);

  // Règle BPT : tout joueur présent dans une partie enregistrée
  // doit exister dans le référentiel et être automatiquement ACTIF.
  for(const r of rows){
    const name=String(r.player||"").trim();
    if(!name)continue;
    const existing=findPlayerInsensitive(name);
    if(existing){
      existing.active=true;
    }else{
      db.players.push({name,active:true});
    }
  }

  // Ajout local immédiat et file d'attente persistante.
  db.history=db.history.concat(rows);
  queuePendingGame(rows);
  saveLocalOnly();

  // Le rendu de l'interface ne doit JAMAIS empêcher la sauvegarde/synchronisation.
  try{
    renderAll();
    renderHistory();
  }catch(uiError){
    console.error("BPT rafraîchissement après enregistrement :",uiError);
  }

  // Même circuit de synchronisation pour Nouvelle partie ET Live.
  if(cloudReady && firebaseStore){
    const ok=await flushPendingGames();
    if(!ok)return {synced:false};

    await refreshCanonicalHistoryUI(false);

    const sig=historyGameSignature(rows);
    const canonicalGroups=historyGroups(db.history||[]);
    const present=canonicalGroups.some(([,gameRows])=>historyGameSignature(gameRows)===sig);
    const gameNo=Number(rows?.[0]?.game)||"—";

    if(present){
      setCloudStatus("ok",`Partie #${gameNo} synchronisée ✓`,"Écriture Firebase relue et vérifiée.");
      showBptToast(`Partie #${gameNo} enregistrée et synchronisée ✓`,"ok");
    }else{
      setCloudStatus("offline",`Partie #${gameNo} à vérifier`,"L'écriture a été envoyée mais la relecture Firebase ne confirme pas encore la partie.");
      showBptToast(`Partie #${gameNo} enregistrée localement · vérification Firebase en attente`,"busy");
    }

    if(options.showSummary!==false)setTimeout(()=>showEndGameSummary(rows),80);
    return {synced:present};
  }

  const gameNo=Number(rows?.[0]?.game)||"—";
  setCloudStatus("offline",`Partie #${gameNo} en attente`,"Enregistrée localement. Elle sera envoyée automatiquement dès que Firebase sera disponible.");
  showBptToast(`Partie #${gameNo} enregistrée localement · synchronisation en attente`,"busy");
  if(options.showSummary!==false)setTimeout(()=>showEndGameSummary(rows),80);
  return {synced:false};
}

function buildGameEntry(){
  const names=[...document.querySelectorAll(".gp:checked")].map(x=>x.value);
  if(names.length<2){alert("Sélectionnez au moins 2 joueurs.");return;}
  const n=names.length;
  $("gameEntryEmpty").style.display="none";

  $("gameEntry").innerHTML=`<div class="muted" style="margin-bottom:8px">
      Partie #${nextGameNo()} • ${n} joueurs • Répartition gains ${db.settings.payouts.join(" / ")} %${n<6?" • Aucun point championnat (< 6 joueurs)":""}
    </div>
    <div class="tablewrap">
      <table>
        <thead><tr><th>Place</th><th>Joueur</th><th>Éliminé par</th><th>Points</th><th>Gain prévu</th></tr></thead>
        <tbody>
        ${Array.from({length:n},(_,i)=>`
          <tr>
            <td>${i+1}</td>
            <td><select class="placePlayer" data-place="${i+1}"></select></td>
            <td><select class="placeKiller" data-place="${i+1}"></select></td>
            <td>${pointsFor(i+1,n)}</td>
            <td>${euro(plannedGain(i+1,n,Number($("gStake").value)||0))}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
    <button class="btn" id="saveGameBtn" style="margin-top:10px">Enregistrer la partie</button>`;

  $("gameEntry").dataset.players=JSON.stringify(names);

  document.querySelectorAll(".placePlayer").forEach(sel=>{
    sel.addEventListener("change",refreshGameEntryOptions);
  });

  refreshGameEntryOptions();
  $("saveGameBtn").onclick=saveGameFromEntry;
}

function refreshGameEntryOptions(){
  const names=JSON.parse($("gameEntry").dataset.players||"[]");
  const playerSelects=[...document.querySelectorAll(".placePlayer")];
  const killerSelects=[...document.querySelectorAll(".placeKiller")];

  // Sauvegarde des choix avant reconstruction.
  const chosenPlayers=playerSelects.map(s=>s.value);
  const chosenKillers=killerSelects.map(s=>s.value);

  // 1) Joueurs : un joueur déjà positionné disparaît des autres lignes.
  playerSelects.forEach((sel,idx)=>{
    const current=chosenPlayers[idx];
    const usedElsewhere=new Set(
      chosenPlayers.filter((name,j)=>j!==idx && name)
    );

    const available=names.filter(name =>
      name===current || !usedElsewhere.has(name)
    );

    sel.innerHTML=
      '<option value="">— Joueur —</option>'+
      available.map(name=>`<option value="${esc(name)}">${esc(name)}</option>`).join("");

    if(current && available.includes(current))sel.value=current;
  });

  // Classement courant après mise à jour des joueurs.
  const rankingPlayers=playerSelects.map(s=>s.value);

  // 2) Éliminé par :
  // - le vainqueur n'a jamais d'éliminateur ;
  // - si les places précédentes sont déjà renseignées, on propose uniquement
  //   les joueurs encore en jeu à ce moment-là ;
  // - si le classement n'est pas encore entièrement saisi au-dessus,
  //   on laisse choisir parmi les autres participants afin de permettre
  //   une saisie dans n'importe quel ordre. La validation finale vérifiera
  //   que l'éliminateur termine bien devant le joueur éliminé.
  killerSelects.forEach((sel,idx)=>{
    const place=idx+1;
    const eliminated=rankingPlayers[idx];
    const previous=chosenKillers[idx];

    if(place===1){
      sel.disabled=true;
      sel.innerHTML='<option value="">— Vainqueur —</option>';
      sel.value="";
      return;
    }

    sel.disabled=false;

    if(!eliminated){
      sel.innerHTML='<option value="">— Choisir d’abord le joueur —</option>';
      sel.value="";
      return;
    }

    const ahead=rankingPlayers.slice(0,idx).filter(Boolean);
    const previousSlotsComplete=rankingPlayers.slice(0,idx).every(Boolean);

    let eligible;
    if(previousSlotsComplete){
      // Classement au-dessus connu : seulement les joueurs mieux classés.
      eligible=ahead.filter(name=>name!==eliminated);
    }else{
      // Classement encore incomplet : autoriser tous les autres participants.
      eligible=names.filter(name=>name!==eliminated);
    }

    sel.innerHTML=
      '<option value="">— Éliminé par… —</option>'+
      eligible.map(name=>`<option value="${esc(name)}">${esc(name)}</option>`).join("");

    if(previous && eligible.includes(previous)){
      sel.value=previous;
    }else{
      sel.value="";
    }
  });
}

function payoutAmounts(n,stake){
  const pot=Math.max(0,Number(n)||0)*Math.max(0,Number(stake)||0);
  const payouts=db.settings.payouts||[60,30,10];

  // BPT : les deux premiers gains sont arrondis aux 5 € les plus proches.
  // Le 3e reçoit le reliquat afin que 100 % de la cagnotte soit distribué.
  const round5=v=>Math.round(v/5)*5;
  const first=round5(pot*(Number(payouts[0])||60)/100);
  const second=round5(pot*(Number(payouts[1])||30)/100);
  const third=Math.max(0,pot-first-second);

  return [first,second,third];
}

function plannedGain(place,n,stake){
  const gains=payoutAmounts(n,stake);
  return place>=1&&place<=3 ? gains[place-1] : 0;
}
async function saveGameFromEntry(){
  const playerSelects=[...document.querySelectorAll(".placePlayer")];
  const names=playerSelects.map(x=>x.value);
  const killers=[...document.querySelectorAll(".placeKiller")].map(x=>x.value);

  if(names.some(x=>!x)){
    alert("Tous les joueurs du classement doivent être renseignés.");
    return;
  }
  if(new Set(names).size!==names.length){
    alert("Un joueur apparaît plusieurs fois.");
    return;
  }

  const n=names.length;
  const game=nextGameNo();
  const date=$("gDate").value;
  const location=$("gLocation").value.trim();
  if(!location){
    alert("Le nom / lieu de la partie est obligatoire.");
    $("gLocation").focus();
    return;
  }
  const stake=Number($("gStake").value)||0;

  // Tous les joueurs classés 2e et suivants doivent avoir un éliminateur.
  for(let i=1;i<n;i++){
    if(!killers[i]){
      alert(`Place ${i+1} — ${names[i]} : renseignez obligatoirement « Éliminé par ».`);
      return;
    }
  }

  const killCounts={};
  for(const k of killers)if(k)killCounts[k]=(killCounts[k]||0)+1;

  const newRows=names.map((player,i)=>{
    const place=i+1;
    const gross=plannedGain(place,n,stake);
    return {
      game,date,location,player,place,killer:killers[i]||"",
      tablier:n>=db.settings.tablierMinPlayers&&place===1,n,
      points:pointsFor(place,n),stake,gross,net:gross-stake,
      kills:killCounts[player]||0,win:place===1,podium:place<=3
    };
  });

  const validation=validateCompletedGameRows(newRows);
  if(validation){
    alert(validation);
    return;
  }

  $("saveGameBtn").disabled=true;
  try{
    const result=await persistCompletedGame(newRows);

    $("gameEntry").innerHTML="";
    $("gameEntryEmpty").style.display="block";
    $("gLocation").value="";
    await showView("dashboard");

    const ptsNotice=championshipPointsNotice(n);
    if(result.synced){
      alert(`Partie enregistrée et synchronisée.${ptsNotice?"\\n\\n"+ptsNotice:""}`);
    }else{
      alert(`Partie enregistrée localement et placée en attente de synchronisation.${ptsNotice?"\\n\\n"+ptsNotice:""}`);
    }
  }catch(e){
    alert(e?.message||"Impossible d’enregistrer la partie.");
  }finally{
    if($("saveGameBtn"))$("saveGameBtn").disabled=false;
  }
}
function renderSettings(){
  $("sName").value=db.settings.championshipName;$("sSeason").value=db.settings.season;$("sStake").value=db.settings.stake;
  $("sP1").value=db.settings.payouts[0]||0;$("sP2").value=db.settings.payouts[1]||0;$("sP3").value=db.settings.payouts[2]||0;$("sTablier").value=db.settings.tablierMinPlayers;
}
function renderPoints(){
  const target=$("pointsPreview");

  // V4.35 : pointsPreview a été retiré de certaines vues.
  // Ne jamais écrire innerHTML sur un élément inexistant.
  if(!target){
    return;
  }

  const nums=Object.keys(db.points||{}).map(Number).sort((a,b)=>a-b);
  let h='<table><thead><tr><th>Place</th>'+nums.map(n=>`<th>${n} j.</th>`).join("")+'</tr></thead><tbody>';
  for(let p=1;p<=30;p++)h+=`<tr><th>${p}</th>`+nums.map(n=>`<td>${db.points?.[n]?.[p]||""}</td>`).join("")+'</tr>';
  target.innerHTML=h+"</tbody></table>";
}


/* ==================== LIVE BPT INTÉGRÉ ==================== */
const LIVE_CLOUD_HEARTBEAT_MS=120000;
let spectatorSyncDeadline=Date.now()+LIVE_CLOUD_HEARTBEAT_MS;
























/* BPT 2.4.3 — seul le bip discret du chat est conservé. */














const BPT_LIVE_MAX_AGE_MS=6*60*60*1000;




































let correctionUnlocked=true;
let correctionFormDirty=false;

function setCorrectionDirty(dirty=true){
  correctionFormDirty=!!dirty;
  const el=$("correctionUnsaved");
  if(el)el.style.display=correctionFormDirty?"inline-block":"none";
}

function openCorrectionForGame(gameNo){
  showView("settings");
  setTimeout(()=>{
    if(correctionUnlocked){
      renderCorrectionGameList(Number(gameNo),true);
      const target=$("correctionGameSelect");
      target?.scrollIntoView({behavior:"smooth",block:"center"});
    }
  },0);
}

function correctionGames(){
  return groupedGames().sort((a,b)=>a[0]-b[0]);
}

function renderCorrectionGameList(preferredGame=null,forceLoad=false){
  if(!correctionUnlocked)return;
  const games=correctionGames();
  const sel=$("correctionGameSelect");

  if(!games.length){
    sel.innerHTML="";
    $("correctionEditor").style.display="none";
    $("correctionEmpty").style.display="block";
    $("correctionGameSummary").textContent="Aucune partie enregistrée.";
    setCorrectionDirty(false);
    return;
  }

  const currentBefore=Number(sel.value)||null;
  const previous=(preferredGame ?? currentBefore) || games[games.length-1][0];

  sel.innerHTML=games.map(([g,rows])=>{
    const d=rows[0]?.date||"";
    const l=rows[0]?.location||"";
    return `<option value="${g}">Partie #${g} — ${esc(d)}${l?" — "+esc(l):""}</option>`;
  }).join("");

  const exists=games.some(([g])=>g===Number(previous));
  const target=exists?Number(previous):games[games.length-1][0];
  sel.value=String(target);

  // La synchronisation Firebase tourne toutes les 2 secondes.
  // Ne jamais recharger l'éditeur pendant une saisie en cours :
  // sinon le lieu et les participants sont remis à leur ancienne valeur.
  const sameGame=currentBefore===target;
  if(correctionFormDirty && sameGame && !forceLoad)return;

  loadCorrectionGame();
}


function renderCorrectionParticipantChecks(selectedNames){
  const holder=$("correctionParticipantChecks");
  if(!holder)return;

  const selected=new Set(selectedNames||[]);
  const allNames=[...new Set([
    ...(db.players||[]).filter(p=>p.active).map(p=>p.name),
    ...selectedNames
  ])].sort((a,b)=>a.localeCompare(b,"fr",{sensitivity:"base"}));

  holder.innerHTML=allNames.map(name=>`
    <label>
      <input type="checkbox" class="cParticipantCheck" value="${esc(name)}" ${selected.has(name)?"checked":""}>
      <span>${esc(name)}</span>
    </label>`).join("");
}

function buildCorrectionRanking(selectedNames, currentRows=[]){
  const names=[...(selectedNames||[])];
  const n=names.length;

  $("cParticipants").value=n;
  $("correctionRows").innerHTML=names.map((name,i)=>`
    <tr>
      <td>${i+1}</td>
      <td><select class="cPlacePlayer" data-place="${i+1}"></select></td>
      <td><select class="cPlaceKiller" data-place="${i+1}"></select></td>
      <td class="cPoints">${pointsFor(i+1,n)}</td>
      <td class="cGain">${euro(plannedGain(i+1,n,Number($("cStake").value)||0))}</td>
    </tr>`).join("");

  $("correctionEditor").dataset.players=JSON.stringify(names);

  const killerByPlayer=new Map(currentRows.map(r=>[r.player,r.killer||""]));
  $("correctionEditor").dataset.killers=JSON.stringify(names.map(n=>killerByPlayer.get(n)||""));

  const playerSelects=[...document.querySelectorAll(".cPlacePlayer")];
  playerSelects.forEach((sel,i)=>{
    sel.addEventListener("change",()=>{setCorrectionDirty(true);refreshCorrectionOptions();});
  });

  // Populate options, then restore the requested ranking order.
  refreshCorrectionOptions();
  playerSelects.forEach((sel,i)=>{sel.value=names[i]||"";});
  refreshCorrectionOptions();

  const killerSelects=[...document.querySelectorAll(".cPlaceKiller")];
  killerSelects.forEach(sel=>sel.addEventListener("change",()=>setCorrectionDirty(true)));
  names.forEach((name,i)=>{
    const killer=killerByPlayer.get(name)||"";
    if(killer && killerSelects[i] && [...killerSelects[i].options].some(o=>o.value===killer)){
      killerSelects[i].value=killer;
    }
  });

  refreshCorrectionCalculatedValues();
}

function loadCorrectionGame(){
  if(!correctionUnlocked)return;
  setCorrectionDirty(false);
  const gameNo=Number($("correctionGameSelect").value);
  const rows=db.history.filter(r=>Number(r.game)===gameNo).sort((a,b)=>Number(a.place)-Number(b.place));

  if(!rows.length){
    $("correctionEditor").style.display="none";
    $("correctionEmpty").style.display="block";
    return;
  }

  $("correctionEditor").style.display="block";
  $("correctionEmpty").style.display="none";
  $("cDate").value=rows[0].date||"";
  $("cLocation").disabled=false;
  $("cLocation").readOnly=false;
  $("cLocation").value=rows[0].location||"";
  $("cStake").value=rows[0].stake ?? db.settings.stake;
  $("cParticipants").value=rows.length;
  $("correctionGameSummary").innerHTML=
    `<strong>Partie #${gameNo}</strong><br>${esc(rows[0].date||"")} • ${esc(rows[0].location||"")}<br>${rows.length} joueurs`;

  const allGames=correctionGames();
  const lastGameNo=allGames.length?allGames[allGames.length-1][0]:null;
  const canDelete=gameNo===lastGameNo;
  $("deleteCorrectionGameBtn").disabled=!canDelete;
  $("deleteCorrectionGameBtn").style.opacity=canDelete?"1":".45";
  $("deleteCorrectionGameBtn").style.cursor=canDelete?"pointer":"not-allowed";
  $("deleteCorrectionHint").textContent=canDelete
    ? "Cette partie est la dernière enregistrée : elle peut être supprimée."
    : `Seule la dernière partie (#${lastGameNo}) peut être supprimée. Supprimez-la d’abord pour pouvoir supprimer celle-ci.`;

  $("correctionEditor").dataset.game=String(gameNo);
  renderCorrectionParticipantChecks(rows.map(r=>r.player));
  buildCorrectionRanking(rows.map(r=>r.player),rows);

  ["cDate","cLocation","cStake"].forEach(id=>{
    const el=$(id);
    if(el){
      el.oninput=()=>setCorrectionDirty(true);
      el.onchange=()=>setCorrectionDirty(true);
    }
  });
  document.querySelectorAll(".cParticipantCheck").forEach(cb=>{
    cb.onchange=()=>setCorrectionDirty(true);
  });
}

function applyCorrectionParticipants(){
  setCorrectionDirty(true);
  const checked=[...document.querySelectorAll(".cParticipantCheck:checked")].map(x=>x.value);
  if(checked.length<2){
    alert("Une partie doit comporter au moins 2 participants.");
    return;
  }

  const currentPlayers=[...document.querySelectorAll(".cPlacePlayer")].map(s=>s.value).filter(Boolean);
  const currentRows=currentPlayers.map((player,i)=>({
    player,
    killer:document.querySelectorAll(".cPlaceKiller")[i]?.value||""
  }));

  // Conserve l'ordre actuel, retire les joueurs décochés, ajoute les nouveaux à la fin.
  const ordered=currentPlayers.filter(n=>checked.includes(n));
  for(const n of checked)if(!ordered.includes(n))ordered.push(n);

  buildCorrectionRanking(ordered,currentRows);
}

function refreshCorrectionOptions(){
  const selectedPlayers=JSON.parse($("correctionEditor").dataset.players||"[]");
  const playerSelects=[...document.querySelectorAll(".cPlacePlayer")];
  const killerSelects=[...document.querySelectorAll(".cPlaceKiller")];
  const currentPlayers=playerSelects.map(s=>s.value);
  const currentKillers=killerSelects.map(s=>s.value);

  playerSelects.forEach((sel,idx)=>{
    const current=currentPlayers[idx];
    const usedElsewhere=new Set(currentPlayers.filter((name,j)=>j!==idx && name));
    const available=selectedPlayers.filter(name=>name===current || !usedElsewhere.has(name));

    sel.innerHTML='<option value="">— Joueur —</option>'+
      available.map(name=>`<option value="${esc(name)}">${esc(name)}</option>`).join("");

    if(current && available.includes(current))sel.value=current;
  });

  const rankingPlayers=playerSelects.map(s=>s.value);

  killerSelects.forEach((sel,idx)=>{
    const place=idx+1;
    const eliminated=rankingPlayers[idx];
    const current=currentKillers[idx];

    if(place===1){
      sel.disabled=true;
      sel.innerHTML='<option value="">— Vainqueur —</option>';
      sel.value="";
      return;
    }

    sel.disabled=false;
    if(!eliminated){
      sel.innerHTML='<option value="">— Choisir d’abord le joueur —</option>';
      sel.value="";
      return;
    }

    const eligible=rankingPlayers.slice(0,idx).filter(Boolean).filter(name=>name!==eliminated);
    sel.innerHTML='<option value="">— Éliminé par… —</option>'+
      eligible.map(name=>`<option value="${esc(name)}">${esc(name)}</option>`).join("");

    if(current && eligible.includes(current))sel.value=current;
    else if(!eligible.includes(current))sel.value="";
  });

  refreshCorrectionCalculatedValues();
}

function refreshCorrectionCalculatedValues(){
  const n=document.querySelectorAll(".cPlacePlayer").length;
  const stake=Number($("cStake").value)||0;
  [...document.querySelectorAll(".cPoints")].forEach((td,i)=>td.textContent=pointsFor(i+1,n));
  [...document.querySelectorAll(".cGain")].forEach((td,i)=>td.textContent=euro(plannedGain(i+1,n,stake)));
}

async function saveCorrection(){
  if(!correctionUnlocked)return;

  const gameNo=Number($("correctionEditor").dataset.game);
  const playerSelects=[...document.querySelectorAll(".cPlacePlayer")];
  const killerSelects=[...document.querySelectorAll(".cPlaceKiller")];
  const names=playerSelects.map(s=>s.value);
  const killers=killerSelects.map(s=>s.value);
  const n=names.length;

  if(n<2){
    alert("Une partie doit comporter au moins 2 joueurs.");
    return;
  }
  if(names.some(x=>!x)){
    alert("Chaque place doit avoir un joueur.");
    return;
  }
  if(new Set(names).size!==n){
    alert("Un joueur apparaît plusieurs fois dans le classement.");
    return;
  }

  for(let i=0;i<n;i++){
    const place=i+1,player=names[i],killer=killers[i]||"";
    if(place===1 && killer){
      alert("Le vainqueur ne peut pas avoir d’éliminateur.");
      return;
    }
    if(place>1 && !killer){
      alert(`Place ${place} — ${player} : renseignez obligatoirement « Éliminé par ».`);
      return;
    }
    if(killer===player){
      alert(`Place ${place} : ${player} ne peut pas s’éliminer lui-même.`);
      return;
    }
    if(killer){
      const killerPlace=names.indexOf(killer)+1;
      if(killerPlace<1 || killerPlace>=place){
        alert(`Place ${place} : l’éliminateur doit être classé devant le joueur éliminé.`);
        return;
      }
    }
  }

  const date=$("cDate").value;
  const location=String($("cLocation").value||"").trim();
  if(!location){
    alert("Le nom / lieu de la partie est obligatoire.");
    $("cLocation").focus();
    return;
  }
  const stake=Number($("cStake").value)||0;
  const killCounts={};
  for(const k of killers)if(k)killCounts[k]=(killCounts[k]||0)+1;

  for(const name of names){
    const existing=findPlayerInsensitive(name);
    if(existing)existing.active=true;
    else db.players.push({name:String(name).trim(),active:true});
  }

  const oldRows=db.history.filter(r=>Number(r.game)===gameNo);
  const cloudId=oldRows.find(r=>r._cloudId)?._cloudId;
  const gameKey=oldRows.find(r=>r._gameKey)?._gameKey;

  const corrected=names.map((player,i)=>{
    const place=i+1;
    const gross=plannedGain(place,n,stake);
    return {
      game:gameNo,date,location,player,place,killer:killers[i]||"",
      tablier:n>=db.settings.tablierMinPlayers&&place===1,n,
      points:pointsFor(place,n),stake,gross,net:gross-stake,
      kills:killCounts[player]||0,win:place===1,podium:place<=3,
      _cloudId:cloudId,_gameKey:gameKey
    };
  });

  const backup=JSON.parse(JSON.stringify(db));
  const btn=$("saveCorrectionBtn");
  if(btn)btn.disabled=true;

  try{
    // Mise à jour locale.
    db.history=db.history.filter(r=>Number(r.game)!==gameNo).concat(corrected);
    normalizeHistoryGameNumbers();
    saveLocalOnly();

    if(cloudReady && firebaseStore){
      setCloudStatus("busy","Correction de la partie…");

      // Mise à jour UNIQUEMENT de la partie concernée, sans supprimer/recréer tout l'historique.
      await cloudUpdateSingleGame(gameNo,corrected);

      // Sauvegarde du référentiel joueurs/paramètres.
      const payload=JSON.parse(JSON.stringify(db));
      payload.history=[];
      const {error:stateErr}=await firebaseStore
        .from("bpt_state")
        .upsert({id:CLOUD_ROW_ID,data:payload},{onConflict:"id"});
      if(stateErr)throw stateErr;

      // Relecture serveur et contrôle précis.
      db.history=await cloudFetchGames();
      normalizeHistoryGameNumbers();

      const serverRows=db.history.filter(r=>Number(r.game)===gameNo);
      const serverNames=serverRows
        .sort((a,b)=>Number(a.place)-Number(b.place))
        .map(r=>String(r.player||""));

      if((serverRows[0]?.location||"")!==location){
        throw new Error("Le nouveau lieu n’a pas été conservé par le serveur.");
      }
      if(JSON.stringify(serverNames)!==JSON.stringify(names)){
        throw new Error("La nouvelle liste des participants n’a pas été conservée par le serveur.");
      }

      cloudLocalDirty=false;
      cloudHistoryReplaceOnce=false;
      saveLocalOnly();
      setCloudStatus("ok","Correction synchronisée");
    }else{
      // Hors connexion : conserver la correction locale et forcer un remplacement à la prochaine synchro.
      cloudHistoryReplaceOnce=true;
      scheduleCloudSave();
    }

    setCorrectionDirty(false);
    renderAll();
    renderCorrectionGameList(gameNo,true);

    alert(
      `Partie #${gameNo} corrigée et enregistrée.\n\n`+
      `Lieu : ${location||"—"}\nParticipants : ${names.length}`
    );
  }catch(e){
    db=backup;
    saveLocalOnly();
    setCorrectionDirty(true);
    // Conserve les champs saisis afin de permettre une nouvelle tentative.
    renderDashboard();renderRanking();renderVersus();renderHistory();renderPlayers();renderGamePlayers();renderSettings();renderPoints();
    console.error("BPT save correction:",e);
    setCloudStatus("offline","Erreur correction",e?.message||String(e));
    alert("La correction n’a pas pu être enregistrée.\n\n"+(e?.message||String(e)));
  }finally{
    if(btn)btn.disabled=false;
  }
}


async function resetFullHistory(){
  if(!settingsUnlocked||!correctionUnlocked)return;

  const games=correctionGames();
  if(!games.length){
    alert("L'historique est déjà vide.");
    return;
  }

  const confirm1=confirm(
    `Réinitialiser complètement l'historique BPT ?\n\n`+
    `${games.length} partie${games.length>1?"s":""} seront supprimée${games.length>1?"s":""}.\n`+
    `Le classement, les statistiques et les kills seront remis à zéro.`
  );
  if(!confirm1)return;

  const typed=prompt(
    "CONFIRMATION DÉFINITIVE\n\n"+
    "Cette action supprimera l'historique partagé pour tous les utilisateurs.\n\n"+
    "Pour confirmer, tapez exactement : SUPPRIMER"
  );
  if(typed===null)return;
  if(String(typed).trim()!=="SUPPRIMER"){
    alert("RAZ annulée : le mot SUPPRIMER n'a pas été saisi exactement.");
    return;
  }

  if(!await authorizeFullReset('Supprimer tout l’historique, le classement et les statistiques ?'))return;
  if(!settingsUnlocked||!correctionUnlocked)return;

  db.history=[];
  pendingGamesSave([]);
  cloudHistoryReplaceOnce=true;

  // Pas de partie = pas de pari : la RAZ historique supprime aussi les paris de la saison.
  try{await purgeBettingForSeason(CURRENT_SEASON_KEY);}catch(e){console.warn('RAZ paris saison',e);}

  saveLocalOnly();
  renderAll();
  renderHistory();
  renderCorrectionGameList();

  if(cloudReady && firebaseStore){
    setCloudStatus("busy","RAZ historique…");
    const ok=await cloudPushNow();
    if(ok){
      alert("Historique complet supprimé. Le classement a été remis à zéro et la suppression a été synchronisée.");
    }else{
      alert("Historique supprimé localement, mais la synchronisation Firebase a échoué. Cliquez sur l'indicateur de synchronisation pour réessayer.");
    }
  }else{
    scheduleCloudSave();
    alert("Historique supprimé localement. La suppression sera synchronisée dès que la connexion sera disponible.");
  }
}

async function deleteCorrectionGame(){
  if(!correctionUnlocked)return;

  const games=correctionGames();
  if(!games.length)return;

  const current=Number($("correctionGameSelect").value);
  const lastGameNo=games[games.length-1][0];

  if(current!==lastGameNo){
    alert(`Seule la dernière partie (#${lastGameNo}) peut être supprimée.`);
    return;
  }

  const rows=db.history.filter(r=>r.game===current);
  const label=rows.length
    ? `Partie #${current} du ${rows[0].date||""}${rows[0].location?" — "+rows[0].location:""}`
    : `Partie #${current}`;

  if(!confirm(`Supprimer définitivement ${label} ?\n\nLe classement, le dashboard, les kills et les statistiques seront recalculés.`)){
    return;
  }

  db.history=db.history.filter(r=>r.game!==current);
  cloudHistoryReplaceOnce=true;

  // La suppression de la dernière partie doit également supprimer son règlement de paris.
  // Les parties ne pouvant être supprimées que par la fin, la dernière session réglée
  // de la saison courante est nécessairement celle de la partie supprimée.
  if(String(selectedSeasonKey||CURRENT_SEASON_KEY)===String(CURRENT_SEASON_KEY)){
    try{await purgeBettingForGame(CURRENT_SEASON_KEY,current);}catch(e){console.warn('Purge paris partie supprimée',e);}
  }

  saveDB();
  renderAll();

  const remaining=correctionGames();
  if(remaining.length){
    const newLast=remaining[remaining.length-1][0];
    renderCorrectionGameList(newLast);
  }else{
    renderCorrectionGameList();
  }

  alert(`Partie #${current} supprimée. Le classement a été recalculé.`);
}

function moveCorrectionGame(delta){
  const games=correctionGames();
  if(!games.length)return;
  const current=Number($("correctionGameSelect").value);
  const idx=games.findIndex(([g])=>g===current);
  const next=Math.max(0,Math.min(games.length-1,idx+delta));
  $("correctionGameSelect").value=String(games[next][0]);
  loadCorrectionGame();
}


const BPT_ADMIN_PASSWORD="7074";
let settingsUnlocked=false;
let fullResetAuthorizationPending=false;
function isDealerIdentity(){
  const raw=String(
    typeof liveIdentityName==='function'
      ? liveIdentityName()
      : localStorage.getItem('bpt_live3_identity_name')||localStorage.getItem('bpt_live_identity')||localStorage.getItem('bpt_live3_spectator_name')||''
  ).trim();
  const key=raw.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').toLocaleLowerCase('fr');
  return key==='dealer'||key==='francois catteau';
}
function authorizeFullReset(description){
  if(!settingsUnlocked||fullResetAuthorizationPending)return Promise.resolve(false);
  fullResetAuthorizationPending=true;
  return new Promise(resolve=>{
    const modal=$('bptResetPasswordModal'),form=$('bptResetPasswordForm'),input=$('bptResetPasswordInput'),error=$('bptResetPasswordError'),cancel=$('bptResetPasswordCancel');
    const previousFocus=document.activeElement;
    input.value='';error.textContent='';$('bptResetPasswordDescription').textContent=description;
    modal.classList.add('open');modal.setAttribute('aria-hidden','false');input.focus();
    function finish(authorized){
      form.onsubmit=null;cancel.onclick=null;modal.onclick=null;document.removeEventListener('keydown',onKey);
      input.value='';error.textContent='';modal.classList.remove('open');modal.setAttribute('aria-hidden','true');
      fullResetAuthorizationPending=false;previousFocus?.focus?.();resolve(authorized);
    }
    function onKey(e){
      if(e.key==='Escape'){e.preventDefault();finish(false);return;}
      if(e.key==='Tab'){
        const controls=[input,cancel,form.querySelector('button[type="submit"]')],index=controls.indexOf(document.activeElement);
        if(e.shiftKey&&index<=0){e.preventDefault();controls[2].focus();}
        else if(!e.shiftKey&&(index===2||index===-1)){e.preventDefault();input.focus();}
      }
    }
    form.onsubmit=e=>{
      e.preventDefault();
      if(!settingsUnlocked){finish(false);return;}
      if(input.value!==BPT_ADMIN_PASSWORD){input.value='';error.textContent='Mot de passe incorrect. Aucune donnée n’a été supprimée.';input.focus();return;}
      finish(true);
    };
    cancel.onclick=()=>finish(false);modal.onclick=e=>{if(e.target===modal)finish(false)};
    document.addEventListener('keydown',onKey);
  });
}
async function resetOriginalData(){
  if(!settingsUnlocked)return;
  if(!confirm("Réinitialiser toutes les données avec celles du classeur Excel d'origine ?"))return;
  if(!await authorizeFullReset('Remplacer toutes les données par celles du classeur Excel d’origine ?'))return;
  if(!settingsUnlocked)return;
  db=clone(SEED);cloudHistoryReplaceOnce=true;saveDB();renderAll();showView('dashboard');
}

function unlockSettings(){
  if(isDealerIdentity() || $("settingsPassword").value===BPT_ADMIN_PASSWORD){
    settingsUnlocked=true;
    $("settingsLock").style.display="none";
    $("settingsProtectedContent").style.display="block";
    $("settingsPasswordError").textContent="";
    $("settingsPassword").value="";
    renderCorrectionGameList();
  }else{
    $("settingsPasswordError").textContent="Mot de passe incorrect.";
  }
}

function lockSettings(){
  settingsUnlocked=false;
  $("settingsProtectedContent").style.display="none";
  $("settingsLock").style.display="block";
  $("settingsPassword").value="";
  $("settingsPasswordError").textContent="";
}

let currentViewId="dashboard";




async function showView(id){
  if(id==="live")id="dashboard";
  if(id==="versus")id="profile";
  if(id==="achievements")id="records";
  if(id==="history")id="ranking";
  if(typeof isArchiveSeason==="function" && isArchiveSeason()){
    // Les paramètres restent réservés à la saison courante.
    if(id==="settings")id="dashboard";
    // Le Live est toujours accessible : showView("live") décide ensuite
    // s'il faut ouvrir le mode spectateur ou l'écran de création.

  }
  if(id==="newgame")id="settings";
  const enteringSettings=(id==="settings" && currentViewId!=="settings");
  const enteringRanking=(id==="ranking" && currentViewId!=="ranking");
  if(enteringRanking){rankingSortKey="points";rankingFilterKey="all";}
  if(id==="dashboard")dashboardRecordSelection=null;
  // BPT 4.34 : l'onglet Parties s'ouvre toujours sur la dernière partie.
  // La navigation précédent/suivant reste disponible tant que l'utilisateur reste dans l'onglet.
  if(id==="latestgame" && currentViewId!=="latestgame")latestGameSelectedKey="";
  currentViewId=id;

  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));
  document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.view===id));

  if((id==="dashboard" || id==="latestgame" || id==="ranking" || id==="versus" || id==="records" || id==="achievements" || id==="profile" || id==="history" || id==="seasons") && cloudReady && firebaseStore && !(typeof isArchiveSeason==="function" && isArchiveSeason())){
    await refreshCanonicalHistoryUI(true);
  }else{
    if(id==="dashboard")renderDashboard();
    if(id==="latestgame"){renderLatestGame();renderHistory();}
    if(id==="ranking")renderRanking();
    if(id==="records"){renderRecords();renderAchievements();}
    if(id==="profile"){renderProfile();renderVersus();}
  }

  if(id==="settings"){
    if(!settingsUnlocked && isDealerIdentity())settingsUnlocked=true;
    // V9.0.24 : aucun nettoyage automatique destructif des photos de parties.
    if(settingsUnlocked){
      $("settingsLock").style.display="none";
      $("settingsProtectedContent").style.display="block";
      if(enteringSettings){
        const correctionList=correctionGames();
        const lastCorrectionGame=correctionList.length?correctionList[correctionList.length-1][0]:null;
        renderCorrectionGameList(lastCorrectionGame,true);
      }else{
        renderCorrectionGameList();
      }
    }else{
      $("settingsLock").style.display="block";
      $("settingsProtectedContent").style.display="none";
    }
  }else if(settingsUnlocked){
    lockSettings();
  }
};

setArchiveUiState();
function backup(){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)],{type:"application/json"}));a.download=`BPT_sauvegarde_${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
if($("backupBtn"))$("backupBtn").onclick=backup;if($("backupBtn2"))$("backupBtn2").onclick=backup;
function restoreInput(input){const f=input.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{const x=JSON.parse(rd.result);if(!x.players||!x.history||!x.points)throw 0;db=x;cloudHistoryReplaceOnce=true;saveDB();renderAll();alert("Sauvegarde restaurée.");}catch(e){alert("Fichier de sauvegarde invalide.");}};rd.readAsText(f);}
if($("restoreInput"))$("restoreInput").onchange=e=>restoreInput(e.target);if($("restoreInput2"))$("restoreInput2").onchange=e=>restoreInput(e.target);
$("resetDataBtn").onclick=resetOriginalData;

$("correctionGameSelect").onchange=()=>{
  if(correctionFormDirty && !confirm("Abandonner les modifications non enregistrées de cette partie ?")){
    return;
  }
  setCorrectionDirty(false);
  loadCorrectionGame();
};
if($("applyCorrectionParticipantsBtn"))$("applyCorrectionParticipantsBtn").onclick=applyCorrectionParticipants;
$("prevCorrectionGameBtn").onclick=()=>moveCorrectionGame(-1);
$("nextCorrectionGameBtn").onclick=()=>moveCorrectionGame(1);
$("reloadCorrectionBtn").onclick=()=>{setCorrectionDirty(false);loadCorrectionGame();};
$("saveCorrectionBtn").onclick=saveCorrection;
$("deleteCorrectionGameBtn").onclick=deleteCorrectionGame;
$("resetHistoryBtn").onclick=resetFullHistory;
$("cStake").addEventListener("input",refreshCorrectionCalculatedValues);

if($("versusPlayer2"))$("versusPlayer2").onchange=renderVersus;

if($("latestPrevGameBtn"))$("latestPrevGameBtn").onclick=()=>selectLatestGameOffset(-1);
if($("latestNextGameBtn"))$("latestNextGameBtn").onclick=()=>selectLatestGameOffset(1);
if($("latestGamePhotoInput"))$("latestGamePhotoInput").addEventListener("change",async()=>{
  const input=$("latestGamePhotoInput");
  const file=input.files?.[0];
  const gameNo=Number(input.dataset.game||0);
  const seasonKey=input.dataset.season||currentGamePhotoSeasonKey();
  if(file && gameNo)await saveGamePhoto(gameNo,file,seasonKey);
  input.value="";
});
if($("gamePhotoModalClose"))$("gamePhotoModalClose").onclick=closeGamePhotoModal;
if($("gamePhotoModal"))$("gamePhotoModal").onclick=e=>{
  if(e.target===$("gamePhotoModal"))closeGamePhotoModal();
};


document.addEventListener("keydown",e=>{
  if(e.key==="Escape" && $("gamePhotoModal")?.style.display==="flex")closeGamePhotoModal();
});


$("exportCsvBtn").onclick=()=>{const rows=[["Partie","Date","Lieu","Joueur","Place","Éliminé par","Tablier","Nb joueurs","Points","Mise","Gain","Solde","Kills"]];db.history.forEach(r=>rows.push([r.game,r.date,r.location,r.player,r.place,r.killer,r.tablier?"Oui":"",r.n,r.points,r.stake,r.gross,r.net,r.kills]));const csv="\ufeff"+rows.map(r=>r.map(x=>`"${String(x??"").replaceAll('"','""')}"`).join(";")).join("\r\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download="BPT_historique.csv";a.click();};







// Fiche joueur
if($("profilePlayerSelect"))$("profilePlayerSelect").onchange=()=>renderProfile($("profilePlayerSelect").value);

if($("playerProfileAvatarBtn"))$("playerProfileAvatarBtn").onclick=()=>openPlayerAvatarPicker();
if($("playerProfileAvatarDeleteBtn"))$("playerProfileAvatarDeleteBtn").onclick=()=>deleteSelectedPlayerAvatar();
if($("playerProfileAvatarWrap"))$("playerProfileAvatarWrap").onclick=()=>openPlayerAvatarPicker();
if($("playerAvatarPickerClose"))$("playerAvatarPickerClose").onclick=closePlayerAvatarPicker;
if($("playerAvatarPickerCancel"))$("playerAvatarPickerCancel").onclick=closePlayerAvatarPicker;
if($("playerAvatarPickerSave"))$("playerAvatarPickerSave").onclick=saveSelectedPlayerAvatar;
if($("playerAvatarGrid"))$("playerAvatarGrid").onclick=e=>{
  const btn=e.target?.closest?.(".avatar-option");
  if(btn)selectPlayerAvatar(btn.dataset.avatarId||"");
};
if($("playerAvatarPickerBackdrop"))$("playerAvatarPickerBackdrop").onclick=e=>{if(e.target===e.currentTarget)closePlayerAvatarPicker();};



// Résumé de fin de partie
if($("gameSummaryCloseBtn"))$("gameSummaryCloseBtn").onclick=()=>$("gameSummaryBackdrop").style.display="none";
if($("gameSummaryViewGameBtn"))$("gameSummaryViewGameBtn").onclick=openLastGameFromSummary;
if($("gameSummaryBackdrop"))$("gameSummaryBackdrop").onclick=e=>{if(e.target===$("gameSummaryBackdrop"))e.currentTarget.style.display="none";};

// Live : affichage et plein écran








// Navigation principale
document.querySelectorAll("nav button[data-view]").forEach(b=>{
  b.addEventListener("click",async()=>{
    const target=b.dataset.view;
    if(target==="ranking"){
      if(selectedSeasonKey!==CURRENT_SEASON_KEY)await selectSeason(CURRENT_SEASON_KEY);
      await showView("ranking");
      return;
    }
    if(target==="records"){
      await openRecordsView();
      return;
    }
    showView(target);
  });
});


/* V183 — navigation mobile par balayage horizontal */
(function initMobileSwipeTabs(){
  const order=["dashboard","latestgame","ranking","records","seasons","profile","settings"];
  let startX=0,startY=0,startTime=0,tracking=false;

  function isMobile(){
    return document.documentElement.classList.contains("bpt-mobile-device")
      || document.body.classList.contains("bpt-mobile-device")
      || window.matchMedia("(max-width:700px)").matches;
  }

  function ignoreSwipeTarget(target){
    return !!target.closest(
      "input,select,textarea,button,a,label,.tablewrap,table,"+
      ".history-cards,.player-admin-row,.modal,.bpt-modal,.bpt-summary-modal"
    );
  }

  document.addEventListener("touchstart",e=>{
    if(!isMobile() || e.touches.length!==1)return;
    const t=e.target;
    if(ignoreSwipeTarget(t))return;

    const touch=e.touches[0];
    startX=touch.clientX;
    startY=touch.clientY;
    startTime=Date.now();
    tracking=true;
  },{passive:true});

  document.addEventListener("touchend",async e=>{
    if(!tracking || !isMobile())return;
    tracking=false;

    const touch=e.changedTouches?.[0];
    if(!touch)return;

    const dx=touch.clientX-startX;
    const dy=touch.clientY-startY;
    const dt=Date.now()-startTime;

    // Swipe horizontal volontaire : au moins 70 px, rapide et plus horizontal que vertical.
    if(Math.abs(dx)<70 || Math.abs(dx)<Math.abs(dy)*1.35 || dt>800)return;

    const current=document.querySelector(".view.active")?.id || currentViewId || "dashboard";
    const index=order.indexOf(current);
    if(index<0)return;

    const nextIndex=dx<0 ? index+1 : index-1;
    if(nextIndex<0 || nextIndex>=order.length)return;

    const target=order[nextIndex];

    if(target==="ranking"){
      if(selectedSeasonKey!==CURRENT_SEASON_KEY)await selectSeason(CURRENT_SEASON_KEY);
      await showView("ranking");
    }else if(target==="records"){
      await openRecordsView();
    }else{
      showView(target);
    }

    // Ramène le nouvel onglet en haut et centre son bouton de navigation.
    window.scrollTo({top:0,behavior:"smooth"});
    const navBtn=document.querySelector(`nav button[data-view="${target}"]`);
    navBtn?.scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"});
  },{passive:true});
})();


// Gestion des joueurs
if($("addPlayerBtn")){
  $("addPlayerBtn").onclick=()=>{
    const n=$("newPlayer").value;
if($("mergePlayersBtn"))$("mergePlayersBtn").onclick=mergePlayersByName;
    const result=addActivePlayer(n);
    if(!result.ok){alert(result.message);return;}
    if(result.existing)alert("Ce joueur existait déjà : il a été réactivé.");
    $("newPlayer").value="";
  };
  $("newPlayer").addEventListener("keydown",e=>{
    if(e.key==="Enter")$("addPlayerBtn").click();
  });
}


// Ajout rapide de joueurs depuis Nouvelle partie / Live
if($("gameAddPlayerBtn"))$("gameAddPlayerBtn").onclick=addPlayerFromGame;
if($("gameNewPlayer"))$("gameNewPlayer").addEventListener("keydown",e=>{
  if(e.key==="Enter")addPlayerFromGame();
});

// Nouvelle partie manuelle
if($("buildGameBtn"))$("buildGameBtn").onclick=buildGameEntry;

// Paramètres protégés
$("unlockSettingsBtn").onclick=unlockSettings;
$("settingsPassword").addEventListener("keydown",e=>{
  if(e.key==="Enter")unlockSettings();
});



// ===== BPT 2.1.9 — commandes Live mobile directes =====









// BPT 2.1.8 : un seul système de clic pour le Live mobile (délégation ci-dessous).
renderAll();
if(document.getElementById("cloudStatus")) document.getElementById("cloudStatus").onclick=forceCloudSync;
(async()=>{
  await initCloudSync();
  // BPT 4.34 : l'ouverture par défaut est toujours Accueil.
  await showView("dashboard");
})();
// Garde-fou global : vérifie aussi les Live en pause toutes les 60 s.

// ===== BPT 2.7.4 — Récepteur Live Firebase direct et indépendant =====






setTimeout(()=>syncSharedPhotosWithRetry(),1400);

// Fermeture robuste du détail de structure : fonctionne même si le panneau
// a été inséré dans le DOM après l'initialisation des autres événements.



window.addEventListener("online",()=>{
  syncSharedPhotosWithRetry();
});
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="visible"){
    syncSharedPhotosWithRetry();
  }
});

