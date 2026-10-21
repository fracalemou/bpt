
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
  holder.hidden=rankingMode==='bets';
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
  {id:"avatar_01",name:'Poker Shark',src:"./avatars/avatar_01.webp"},
  {id:"avatar_02",name:'Lucky Lady',src:"./avatars/avatar_02.webp"},
  {id:"avatar_03",name:'The Bluff',src:"./avatars/avatar_03.webp"},
  {id:"avatar_04",name:'The Grinder',src:"./avatars/avatar_04.webp"},
  {id:"avatar_05",name:'The Boss',src:"./avatars/avatar_05.webp"},
  {id:"avatar_06",name:'The Strategist',src:"./avatars/avatar_06.webp"},
  {id:"avatar_07",name:'The Stealer',src:"./avatars/avatar_07.webp"},
  {id:"avatar_08",name:'The Colossus',src:"./avatars/avatar_08.webp"},
  {id:"avatar_09",name:'The Shadow',src:"./avatars/avatar_09.webp"},
  {id:"avatar_10",name:'The Techno',src:"./avatars/avatar_10.webp"},
  {id:"avatar_11",name:'The Bear',src:"./avatars/avatar_11.webp"},
  {id:"avatar_12",name:'The Wolf',src:"./avatars/avatar_12.webp"},
  {id:"avatar_13",name:'The Fox',src:"./avatars/avatar_13.webp"},
  {id:"avatar_14",name:'The Owl',src:"./avatars/avatar_14.webp"},
  {id:"avatar_15",name:'The Panther',src:"./avatars/avatar_15.webp"},
  {id:"avatar_16",name:'The High Roller',src:"./avatars/avatar_16.webp"},
  {id:"avatar_17",name:'The Gambler',src:"./avatars/avatar_17.webp"},
  {id:"avatar_18",name:'The Professor',src:"./avatars/avatar_18.webp"},
  {id:"avatar_19",name:'The Queen',src:"./avatars/avatar_19.webp"},
  {id:"avatar_20",name:'The Monk',src:"./avatars/avatar_20.webp"}
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

  // 10.4.50 — Chiffres clés : les 4 essentiels en tête, puis le détail en plus petit.
  const kpis=[
    ["Points",num(s.points,0),true],
    ["Moyenne / partie",num(s.avgPoints,1),true],
    ["Victoires",`${s.wins} · ${num(s.winRate,0)} %`,true],
    ["Podiums",`${s.podiums} · ${num(s.podiumRate,0)} %`,true],
    ["Place moyenne",d.avgPlace?num(d.avgPlace,1):"—"],
    ["Kills",`${s.kills} · ${num(s.kpg,1)}/p`],
    ["Tabliers",s.tabliers],
    ["Solde",euro(s.net)]
  ];
  $("playerProfileKpis").innerHTML=kpis
    .map(([l,v,main])=>`<div class="pf-kpi${main?" is-main":""}"><b>${esc(v)}</b><span>${esc(l)}</span></div>`)
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
  const FEAT_ICON={"Meilleure place":"🏅","Meilleure partie en kills":"🎯","Meilleur résultat financier":"💶","Série de victoires":"⚡","Série de podiums":"🥉","4e places":"💔","Dernières places":"🐢","Victime favorite":"😈","Bourreau principal":"☠️"};
  $("playerProfileFeats").innerHTML=feats
    .map(([l,v])=>`<div class="pf-feat"><span class="pf-feat-ico">${FEAT_ICON[l]||"★"}</span><div><small>${esc(l)}</small><strong>${esc(v)}</strong></div></div>`)
    .join("");

  $("playerProfileAchievements").innerHTML=d.achievements.length
    ? d.achievements.map(a=>`<span class="pf-badge" title="${esc(a.desc)}">${a.icon} ${esc(a.name)}</span>`).join("")
    : '<span class="profile-no-achievement">Aucun accomplissement débloqué pour le moment.</span>';

  $("playerProfilePlaces").innerHTML=rows
    .map(r=>`<span class="place-chip ${Number(r.place)===1?"win":Number(r.place)<=3?"podium":""}" title="Partie #${r.game}">${r.place}</span>`)
    .join("") || '<span class="muted">Aucune partie.</span>';

  if($("playerProfileRecentForm")){
    const recentRows=rows.slice().sort((a,b)=>Number(b.game)-Number(a.game)).slice(0,6);
    $("playerProfileRecentForm").innerHTML=recentRows.length
      ? recentRows.map(r=>{const p=Number(r.place);return `<div class="pf-form-item${p<=3?" p"+p:""}" title="Partie #${r.game}">
          <b>${p}<sup>${p===1?"er":"e"}</sup></b><small>#${r.game} · ${num(r.points||0,0)} pts</small>
        </div>`;}).join("")
      : '<span class="muted">Aucune partie.</span>';
  }


  if($("playerProfileRankChart")){
    const snaps=rankingSnapshotByGame();
    const vals=snaps.map(s=>({x:s.game,y:s.ranks[name]})).filter(v=>Number.isFinite(v.y));
    $("playerProfileRankChart").innerHTML=bptMySeasonRankChart(vals,ranking().length);
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
  set("profileSeasonTitle","Fiche joueur ·");
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
  const career=document.getElementById('careerRatioSummary');
  if(career)career.hidden=rankingMode==='bets'||!isAllSeasons();
  const race=document.getElementById('rankingRaceBlock');
  if(race)race.hidden=rankingMode==='bets';
  if(rankingMode==='points')renderRankingRace();
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
      // 10.4.51 — Fond flou tiré de la photo, pour l'afficher entière (sans recadrage) sans bandes noires.
      $("latestGamePhotoArea")?.style.setProperty("--lg-photo-bg",`url("${String(thumb.currentSrc||thumb.src).replace(/"/g,'%22')}")`);
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
  renderLatestGameMomentum(rows,gameTiming);
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
// ===== 10.4.62 — Momentum de la partie : frise des éliminations successives =====
function bptMomentumData(rows,timing){
  const n=rows.length;
  const realElapsed=r=>{const d=Number(r.outElapsedSec);if(Number.isFinite(d)&&d>0)return d;const l=legacyElapsedFromOutTime(r.outTime);return l>0?l:null;};
  const outs=rows.filter(r=>Number(r.place)>1);
  const timed=outs.length>0&&outs.every(r=>realElapsed(r)!=null);
  outs.sort((a,b)=>timed?(realElapsed(a)-realElapsed(b))||(Number(b.place)-Number(a.place)):Number(b.place)-Number(a.place));
  const winner=rows.find(r=>Number(r.place)===1)||null;
  const lastOut=timed&&outs.length?realElapsed(outs[outs.length-1]):0;
  const end=timed?Math.max(Number(timing?.durationSec)||0,lastOut):0;
  const kills={};
  const events=outs.map((r,i)=>{
    const killer=String(r.killer||"").trim();
    if(killer)kills[killer]=(kills[killer]||0)+1;
    const t=timed?realElapsed(r):null,prev=i>0&&timed?realElapsed(outs[i-1]):null;
    const tags=[];
    if(i===0)tags.push("🩸 Premier sang");
    if(timed&&prev!=null&&t-prev<=120)tags.push("⚡ Coup double");
    if(Number(r.place)===4)tags.push("🫧 La bulle");
    if(Number(r.place)===3&&n>2)tags.push("⚔️ Début du heads-up");
    return {row:r,player:r.player,place:Number(r.place),killer,killNo:killer?kills[killer]:0,level:Number(r.outLevel)||0,t,remaining:n-(i+1),tags};
  });
  let gap=null;
  if(timed&&events.length){
    let from=0,fromLabel="";
    for(const e of events){if(!gap||e.t-from>gap.sec)gap={sec:e.t-from,from:fromLabel,to:e.player};from=e.t;fromLabel=e.player;}
  }
  let burst=null;
  if(timed){
    for(let i=0;i<events.length;i++){let j=i;while(j+1<events.length&&events[j+1].t-events[i].t<=900)j++;const c=j-i+1;if(c>=3&&(!burst||c>burst.count))burst={count:c,sec:events[j].t-events[i].t};}
  }
  return {n,timed,end,events,winner,gap,burst,firstOut:timed&&events.length?events[0].t:null,headsUpSec:Number(timing?.headsUpDurationSec)||null};
}

function renderLatestGameMomentum(rows,timing){
  const host=$("latestGameMomentum");if(!host)return;
  const d=bptMomentumData(rows,timing);
  if(d.n<3||!d.events.length){host.innerHTML='<p class="lg-mom-note">Pas assez de joueurs pour tracer la partie.</p>';return;}
  const n=d.n,count=d.events.length;
  const xOf=(e,i)=>d.timed?(d.end?e.t/d.end*100:0):((i+1)/(count+1))*100;
  const yOf=k=>n>1?(n-k)/(n-1)*100:0;
  // Courbe en escalier du nombre de joueurs restants (repère 1000 × 100, traits non déformés).
  let path=`M0 ${yOf(n)}`;
  d.events.forEach((e,i)=>{path+=` H${(xOf(e,i)*10).toFixed(1)} V${yOf(e.remaining).toFixed(2)}`;});
  path+=" H1000";
  const area=path+" V100 H0 Z";
  const huEvent=d.events.find(e=>e.place===3);
  const huStart=huEvent?xOf(huEvent,d.events.indexOf(huEvent)):null;
  const ticks=[];
  if(d.timed&&d.end){const step=d.end<=2.5*3600?1800:3600;for(let s=step;s<d.end-step*.4;s+=step)ticks.push(s);}
  const dur=s=>formatElapsedElimination(s)||"0 min";
  const eventText=e=>`${e.player} sort ${e.place}e${e.killer?` · éliminé par ${e.killer}`:""}${d.timed?` · ${dur(e.t)}`:""}${e.level?` · niv. ${e.level}`:""}`;
  const chips=[];
  if(d.firstOut!=null)chips.push(["🩸",dur(d.firstOut),"avant la 1re sortie"]);
  if(d.gap&&d.gap.from)chips.push(["⏸",dur(d.gap.sec),`plus long temps mort (${esc(d.gap.from)} → ${esc(d.gap.to)})`]);
  if(d.burst)chips.push(["⚡",`${d.burst.count} sorties`,`en ${dur(Math.max(60,d.burst.sec))}`]);
  if(d.headsUpSec)chips.push(["⚔️",dur(d.headsUpSec),"de heads-up"]);
  host.innerHTML=`
    <div class="lg-mom-chart" role="img" aria-label="Joueurs restants au fil de la partie : ${n} au départ, ${count} éliminations">
      <div class="lg-mom-ylab lg-mom-ylab-top">${n} joueurs</div><div class="lg-mom-ylab lg-mom-ylab-bot">1</div>
      <div class="lg-mom-plot">
        ${huStart!=null?`<div class="lg-mom-hu" style="left:${huStart}%"><span>heads-up</span></div>`:""}
        ${ticks.map(s=>`<div class="lg-mom-tick" style="left:${s/d.end*100}%"><span>${dur(s)}</span></div>`).join("")}
        <svg viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true"><path class="lg-mom-area" d="${area}"/><path class="lg-mom-line" d="${path}" vector-effect="non-scaling-stroke"/></svg>
        ${d.events.map((e,i)=>`<button type="button" class="lg-mom-dot${e.tags.length?" is-key":""}" data-mom="${i}" style="left:${xOf(e,i)}%;top:${yOf(e.remaining)}%" aria-label="${esc(eventText(e))}"></button>`).join("")}
        <span class="lg-mom-win" style="left:100%;top:100%" title="${esc(d.winner?.player||"")}">🏆</span>
      </div>
      <div class="lg-mom-xlab">${d.timed?`<span>début</span><span>${dur(d.end)}</span>`:"<span>1re sortie</span><span>victoire</span>"}</div>
    </div>
    <div class="lg-mom-tip" aria-live="polite">${d.timed?"Touchez un point pour voir l’élimination.":"Heures non enregistrées pour cette partie : les sorties sont présentées dans l’ordre, à intervalles réguliers."}</div>
    ${chips.length?`<div class="lg-mom-chips">${chips.map(([i,v,l])=>`<div class="lg-mom-chip"><span>${i}</span><b>${esc(v)}</b><small>${l}</small></div>`).join("")}</div>`:""}
    <ol class="lg-mom-list">
      ${d.events.map((e,i)=>`<li data-mom-row="${i}"><span class="lg-mom-when">${d.timed?esc(dur(e.t)):`#${i+1}`}${e.level?`<small>niv. ${e.level}</small>`:""}</span><span class="lg-mom-node"></span><div class="lg-mom-what"><strong>${esc(e.player)}</strong> sort <b>${e.place}e</b>${e.killer?`<em>éliminé par ${esc(e.killer)}${e.killNo>1?` · ${e.killNo}e kill`:""}</em>`:""}${e.tags.length?`<span class="lg-mom-tags">${e.tags.map(t=>`<i>${esc(t)}</i>`).join("")}</span>`:""}</div></li>`).join("")}
      ${d.winner?`<li class="is-win"><span class="lg-mom-when">${d.timed?esc(dur(d.end)):"fin"}</span><span class="lg-mom-node"></span><div class="lg-mom-what"><strong>🏆 ${esc(d.winner.player)}</strong> remporte la partie${Number(d.winner.kills)>0?`<em>${d.winner.kills} kill${Number(d.winner.kills)>1?"s":""}</em>`:""}</div></li>`:""}
    </ol>`;
  const tip=host.querySelector(".lg-mom-tip");
  const show=i=>{
    const e=d.events[i];if(!e)return;
    host.querySelectorAll(".is-active").forEach(x=>x.classList.remove("is-active"));
    host.querySelector(`[data-mom="${i}"]`)?.classList.add("is-active");host.querySelector(`[data-mom-row="${i}"]`)?.classList.add("is-active");
    tip.textContent=eventText(e)+(e.tags.length?" · "+e.tags.join(" · "):"");
  };
  host.querySelectorAll(".lg-mom-dot").forEach(b=>{const i=Number(b.dataset.mom);b.addEventListener("click",()=>show(i));b.addEventListener("mouseenter",()=>show(i));b.addEventListener("focus",()=>show(i));});
  host.querySelectorAll("[data-mom-row]").forEach(li=>li.addEventListener("click",()=>show(Number(li.dataset.momRow))));
}

// ===== 10.4.62 — Écarts au classement : chaque joueur placé sur l'axe des points, groupes détectés par les écarts =====
function bptRankingLadderData(){
  const games=groupedGames(),totals=new Map();
  const lastGame=games.length?games[games.length-1][0]:null,lastGain=new Map();
  for(const [gameNo,rows] of games)for(const r of rows){
    const name=canonicalPlayerName(r.player),t=totals.get(name)||{points:0,games:0};
    t.points+=Number(r.points||0);t.games++;totals.set(name,t);
    if(gameNo===lastGame)lastGain.set(name,(lastGain.get(name)||0)+Number(r.points||0));
  }
  // Même départage que le classement : points, puis moyenne, puis nom.
  const players=[...totals.entries()].map(([name,t])=>({name,points:t.points,avg:t.games?t.points/t.games:0,gain:lastGain.get(name)||0}))
    .sort((a,b)=>b.points-a.points||b.avg-a.avg||a.name.localeCompare(b.name,"fr"));
  players.forEach((p,i)=>p.rank=i+1);
  // Un écart de plus de 10 % des points du leader (5 au minimum) sépare deux groupes.
  const cut=Math.max(5,(players[0]?.points||0)*.1),groups=[];
  players.forEach((p,i)=>{if(!i||players[i-1].points-p.points>cut)groups.push([]);groups[groups.length-1].push(p);});
  const names=groups.length===1?["Peloton groupé"]:groups.map((g,i)=>i===0?"Groupe de tête":i===groups.length-1&&groups.length>2?"Queue de peloton":groups.length>3?`Peloton ${i}`:"Peloton");
  groups.forEach((g,i)=>g.forEach(p=>p.group=names[i]));
  return {players,groups:groups.map((g,i)=>({name:names[i],players:g})),lastGame};
}
function renderRankingRace(){
  const host=$("rankingRace");if(!host)return;
  const {players,groups,lastGame}=bptRankingLadderData();
  if(players.length<2){host.innerHTML='<p class="rk-race-note">Les écarts apparaîtront dès que deux joueurs auront marqué des points.</p>';return;}
  const phone=document.documentElement.classList.contains("bpt-mobile-device");
  const full=Math.floor(host.clientWidth||(phone?340:900)),W=phone?Math.max(300,full):Math.max(360,Math.min(560,Math.floor(full*.5)));
  const P=players.length,max=Math.max(1,players[0].points);
  const rawStep=max/5,mag=Math.pow(10,Math.floor(Math.log10(rawStep))),step=[1,2,2.5,5,10].map(k=>k*mag).find(v=>v>=rawStep)||10*mag;
  const top=Math.ceil(max/step)*step;
  const lineH=phone?19:21,padT=14,padB=14,plotH=Math.max(phone?300:340,P*lineH);
  let H=padT+padB+plotH;const axisX=phone?44:56,labelX=axisX+(phone?44:70);
  const y=p=>padT+plotH-(p/top)*plotH;
  // Étiquettes rapprochées de leur point puis écartées pour ne jamais se chevaucher.
  const labels=players.map(p=>({p,y:y(p.points)}));
  for(let i=1;i<labels.length;i++)if(labels[i].y-labels[i-1].y<lineH)labels[i].y=labels[i-1].y+lineH;
  H=Math.max(H,Math.ceil(labels[labels.length-1].y+lineH/2+padB));
  const yTicks=[];for(let v=0;v<=top+1e-9;v+=step)yTicks.push(v);
  const bands=groups.map((g,i)=>{const hi=y(g.players[0].points),lo=y(g.players[g.players.length-1].points);return {g,i,y1:hi-7,y2:lo+7};});
  const svg=`<svg class="rk-race-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Points actuels de chaque joueur et groupes au classement">
    ${yTicks.map(v=>`<line class="rk-race-grid" x1="${axisX-6}" x2="${axisX}" y1="${y(v)}" y2="${y(v)}"/><text class="rk-race-rank" x="${axisX-10}" y="${y(v)+4}" text-anchor="end">${num(v,0)}</text>`).join("")}
    ${bands.map(b=>`<rect class="rk-lad-band rk-lad-band-${b.i%2}" x="${axisX-14}" y="${b.y1}" width="28" height="${Math.max(14,b.y2-b.y1)}" rx="10"/>`).join("")}
    <line class="rk-lad-axis" x1="${axisX}" x2="${axisX}" y1="${padT}" y2="${padT+plotH}"/>
    ${labels.map(({p,y:ly})=>`<path class="rk-lad-link" d="M${axisX+6} ${y(p.points)} L${labelX-24} ${ly} L${labelX-6} ${ly}"/>`).join("")}
    ${players.map(p=>`<circle class="rk-lad-dot${p.rank<=3?" is-top":""}" cx="${axisX}" cy="${y(p.points)}" r="5"/>`).join("")}
    ${labels.map(({p,y:ly})=>`<g class="rk-lad-row" data-lad="${p.rank-1}" tabindex="0"><rect class="rk-lad-hit" x="${labelX-8}" y="${ly-lineH/2}" width="${W-labelX}" height="${lineH}"/><text class="rk-lad-label" x="${labelX}" y="${ly+4}"><tspan class="rk-lad-rk">${p.rank}.</tspan> ${esc(p.name)} <tspan class="rk-lad-pts">${num(p.points,0)}</tspan>${p.gain?`<tspan class="rk-lad-gain"> +${num(p.gain,0)}</tspan>`:""}</text></g>`).join("")}
  </svg>`;
  host.innerHTML=`<div class="rk-lad-wrap"><div class="rk-lad-side">
    <div class="rk-lad-groups">${groups.map((g,i)=>`<div class="rk-lad-group rk-lad-group-${i%2}"><b>${esc(g.name)}</b><span>${g.players.length} joueur${g.players.length>1?"s":""} · ${num(g.players[g.players.length-1].points,0)} à ${num(g.players[0].points,0)} pts</span></div>`).join("")}</div>
    <div class="rk-race-tip" aria-live="polite">Touchez un joueur pour voir ses écarts${lastGame!=null?` · « +N » = points marqués à la dernière partie (#${lastGame})`:""}.</div>
    </div><div class="rk-race-scroll">${svg}</div></div>`;
  const tip=host.querySelector(".rk-race-tip"),leader=players[0];
  host.querySelectorAll("[data-lad]").forEach(row=>{
    const show=()=>{
      const i=Number(row.dataset.lad),p=players[i],above=players[i-1],below=players[i+1];
      host.querySelectorAll(".rk-lad-row.is-active").forEach(r=>r.classList.remove("is-active"));row.classList.add("is-active");
      const parts=[`${p.rank}. ${p.name} · ${num(p.points,0)} pts · ${p.group}`];
      parts.push(i?`à ${num(leader.points-p.points,0)} pts du leader`:above===undefined&&below?`${num(p.points-below.points,0)} pts d’avance sur ${below.name}`:"leader");
      if(i&&above)parts.push(`${num(above.points-p.points,0)} pts derrière ${above.name}`);
      if(i&&below)parts.push(`${num(p.points-below.points,0)} pts devant ${below.name}`);
      tip.textContent=parts.join(" · ");
    };
    row.addEventListener("mouseenter",show);row.addEventListener("click",show);row.addEventListener("focus",show);
  });
}
let bptRaceResizeTimer=null;
window.addEventListener("resize",()=>{clearTimeout(bptRaceResizeTimer);bptRaceResizeTimer=setTimeout(()=>{if($("rankingRace")?.offsetParent)renderRankingRace();},200);},{passive:true});

function renderRanking(){
  renderCareerRatioSummary();
  renderRankingRace();
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
      const hasCode=a=>!!(a?.salt&&(a?.secured||a?.digest));
      if(!hasCode(dst.auth) && hasCode(src.auth))dst.auth=clone(src.auth);
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

// ===== Bilan de partie : photo du face-à-face (téléphone) (ex-bpt-v400-headup-summary.js) =====
(function(){
  function phone(){return matchMedia("(max-width:700px)").matches||/android|iphone|ipad|ipod/i.test(navigator.userAgent);}
  function add(){try{const valid=Array.isArray(lastGameSummaryRows)&&lastGameSummaryRows.filter(r=>Number(r.place)===1).length===1;if(!valid){document.getElementById('summaryHeadUpPhotoCta')?.remove();return;}if(!phone())return;const modal=document.querySelector(".bpt-summary-modal"),podium=modal?.querySelector(".summary-podium");if(modal?.querySelector(".bpt-share-bar")){modal.querySelector("#summaryHeadUpPhotoCta")?.remove();return;}/* 10.4.28 : la photo se prend via « Photo des vainqueurs » */if(!modal||!podium||modal.querySelector("#summaryHeadUpPhotoCta"))return;const d=document.createElement("div");d.id="summaryHeadUpPhotoCta";d.style.cssText="margin:16px 0 18px;padding:16px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(255,255,255,.045);text-align:center";d.innerHTML='<div style="font-size:19px;font-weight:900;margin-bottom:7px">📸 Photo du Head-Up</div><div class="muted" style="font-size:12px;margin-bottom:12px">Le vainqueur est désigné. Prenez maintenant la photo des deux finalistes.</div><button id="summaryHeadUpPhotoBtn" class="btn secondary" type="button" style="width:100%;min-height:50px;font-size:16px">Prendre la photo du Head-Up</button>';podium.insertAdjacentElement("afterend",d);}catch(e){console.warn("Photo Head-Up résumé :",e);}}
  document.addEventListener("click",e=>{if(e.target?.closest?.("#summaryHeadUpPhotoBtn")){const i=document.getElementById("latestGameHeadUpCameraInput");if(i)i.click();}});
  new MutationObserver(add).observe(document.documentElement,{childList:true,subtree:true});
})();

// ===== Migration des anciennes photos vers des URL (ex-bpt-photo-url-migration-launcher.js) =====
setTimeout(()=>{
  if(typeof migrateLegacyPhotoMapsToUrls==="function"){
    migrateLegacyPhotoMapsToUrls().catch(e=>console.warn("Migration photos existantes :",e));
  }
},3000);
