
(function(){
  "use strict";

  const PATH="bpt/live_v3/current";
  const DEVICE_KEY="bpt_live3_device_id";
  const LIVE_IDENTITY_KEY="bpt_live3_identity_name";
  const VIEWER_STALE_MS=300000;
  const $3=(id)=>document.getElementById(id);

  let current=null;
  let prepWizardStep=1;

  function setPrepWizardStep(step){
    prepWizardStep=step===2?2:1;
    const s1=$3("live3PrepStep1"),s2=$3("live3PrepStep2");
    if(s1)s1.hidden=prepWizardStep!==1;
    if(s2)s2.hidden=prepWizardStep!==2;
    const chip=$3("live3PrepStepChip"),title=$3("live3PrepStepTitle"),sub=$3("live3PrepStepSubtitle");
    if(chip)chip.textContent=`Étape ${prepWizardStep} / 4`;
    if(title)title.textContent=prepWizardStep===1?"Paramètres de la partie":"Sélection des joueurs";
    if(sub)sub.textContent=prepWizardStep===1?"Renseignez les paramètres réels de la partie avant de choisir les joueurs.":"Choisissez les joueurs qui participeront à la partie.";
    const panel=$3("live3Prep");
    if(panel&&panel.getClientRects().length){try{panel.scrollIntoView({block:"start",behavior:"smooth"})}catch(_e){}}
  }

  function goToPlayerSelection(){
    const location=String($3("live3Location")?.value||"").trim();
    if(!location){alert("Indiquez le nom / lieu de la partie.");$3("live3Location")?.focus();return;}
    setPrepWizardStep(2);
    renderPrepPlayers();
  }
  let ref=null;
  let ticker=null;
  let listenerInstalled=false;
  let advancing=false;
  let spectatorHeartbeat=null;
  let viewerRenderSignature="";
  let liveIdentityConfirmed=false;
  const LIVE_IDENTITY_SESSION_KEY="bpt_live3_identity_confirmed_session";
  const LIVE_TRUSTED_DEVICE_KEY="bpt_live3_trusted_device_v1";
  const LIVE_TRUST_DURATION_MS=30*24*60*60*1000;

  function identityConfirmedThisSession(){
    return liveIdentityConfirmed===true;
  }

  function markIdentityConfirmedThisSession(){
    liveIdentityConfirmed=true;
    try{sessionStorage.setItem(LIVE_IDENTITY_SESSION_KEY,"1");}catch(_e){}
  }

  function rememberTrustedDevice(name){
    try{
      const clean=String(name||"").trim();
      if(!clean)return;
      const now=Date.now();
      localStorage.setItem(LIVE_TRUSTED_DEVICE_KEY,JSON.stringify({
        name:clean,
        trustedAt:now,
        expiresAt:now+LIVE_TRUST_DURATION_MS
      }));
      localStorage.setItem(LIVE_IDENTITY_KEY,clean);
    }catch(_e){}
  }

  function restoreTrustedDevice(){
    try{
      const saved=JSON.parse(localStorage.getItem(LIVE_TRUSTED_DEVICE_KEY)||"null");
      const name=String(saved?.name||"").trim();
      if(!name){
        localStorage.removeItem(LIVE_TRUSTED_DEVICE_KEY);
        return false;
      }

      const now=Date.now();
      let expiresAt=Number(saved?.expiresAt)||0;

      // Compatibilité avec les appareils déjà approuvés avant la V9.0.18 :
      // on leur accorde 30 jours à compter de cette première restauration.
      if(!expiresAt){
        expiresAt=now+LIVE_TRUST_DURATION_MS;
        localStorage.setItem(LIVE_TRUSTED_DEVICE_KEY,JSON.stringify({
          name,
          trustedAt:Number(saved?.trustedAt)||now,
          expiresAt
        }));
      }

      if(expiresAt<=now){
        localStorage.removeItem(LIVE_TRUSTED_DEVICE_KEY);
        localStorage.removeItem(LIVE_IDENTITY_KEY);
        return false;
      }

      // Le profil approuvé est la référence sur cet appareil pendant 30 jours.
      // Une ancienne valeur locale ne doit jamais forcer une nouvelle saisie du code.
      localStorage.setItem(LIVE_IDENTITY_KEY,name);
      liveIdentityConfirmed=true;
      verifiedProfileName=name;
      renderConnectedIdentityBadge();
      startAppPresence();
      return true;
    }catch(_e){return false;}
  }
  let spectatorSelectSignature="";
  let lastChatMessageId=null;
  let chatSoundPrimed=false;
  let unreadChatCount=0;
  let chatToastTimer=null;

  const LIVE3_CHAT_READ_KEY="bpt_live3_chat_last_read";

  function live3ChatReadStorageKey(){
    const session=String(current?.sessionId||"no-session");
    return `${LIVE3_CHAT_READ_KEY}:${session}:${uid()}`;
  }

  function live3GetLastReadAt(){
    try{
      return Math.max(0,Number(localStorage.getItem(live3ChatReadStorageKey()))||0);
    }catch(_e){
      return 0;
    }
  }

  function live3SetLastReadAt(value){
    const at=Math.max(0,Number(value)||0);
    try{localStorage.setItem(live3ChatReadStorageKey(),String(at));}catch(_e){}
    return at;
  }

  function live3LatestChatAt(){
    const list=Array.isArray(current?.chat)?current.chat:[];
    return list.reduce((max,m)=>Math.max(max,Number(m?.at)||0),0);
  }

  function live3ComputeUnreadCount(){
    const list=Array.isArray(current?.chat)?current.chat:[];
    if(!list.length)return 0;

    let lastRead=live3GetLastReadAt();

    /* First encounter with this Live on this device:
       existing history is considered already known, so only future messages
       become unread. */
    if(!lastRead){
      const latest=live3LatestChatAt();
      if(latest){
        live3SetLastReadAt(latest);
        return 0;
      }
    }

    return list.reduce((count,m)=>{
      const at=Number(m?.at)||0;
      const fromOther=String(m?.deviceId||"")!==uid();
      return count + (fromOther && at>lastRead ? 1 : 0);
    },0);
  }

  function live3RefreshUnreadCount(){
    unreadChatCount=live3ComputeUnreadCount();
    updateUnreadBadges();
    return unreadChatCount;
  }

  function live3MarkChatRead(){
    const latest=live3LatestChatAt() || Date.now();
    live3SetLastReadAt(latest);
    unreadChatCount=0;
    updateUnreadBadges();
  }


  // Alertes sonores de blind : mémorisation locale pour éviter les doublons
  let blindSoundSessionId=null;
  let blindSoundLevelIndex=null;
  let blindSoundLastSecond=null;
  let blindSoundPrimed=false;

  // Empêche plusieurs publications simultanées de la même fin de Live.
  let winnerFinalizationInProgress=false;

  // Joueurs ajoutés uniquement pour la préparation du Live courant.
  // Ils ne deviennent joueurs actifs permanents qu'après publication
  // de la partie dans l'historique.
  const live3TemporaryPlayers=new Set();

  function uid(){
    let id=localStorage.getItem(DEVICE_KEY);
    if(!id){
      id="d3_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,9);
      localStorage.setItem(DEVICE_KEY,id);
    }
    return id;
  }
  // Métadonnée d'affichage uniquement : elle ne doit jamais piloter une lecture/écriture métier.
  function deviceLabel(){
    const compact=window.matchMedia&&window.matchMedia("(max-width:700px)").matches;
    return compact?"Téléphone":"PC";
  }
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function fmt(n){return Math.round(Number(n)||0).toLocaleString("fr-FR");}
  function time(sec){
    sec=Math.max(0,Math.ceil(Number(sec)||0));
    const m=Math.floor(sec/60),s=sec%60;
    return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
  }
  function isActive(){return !!(current&&current.active);}
  function isOwner(){return !!(isActive()&&String(current.ownerId||"")===uid());}
  function alivePlayers(){
    return (current?.players||[]).filter(p=>p.status!=="out"&&p.status!=="winner");
  }
  function remainingCount(){
    const alive=alivePlayers();
    const winner=(current?.players||[]).find(p=>p.status==="winner");
    return alive.length||(winner?1:0);
  }
  function remainingSeconds(){
    if(!current)return 0;
    if(current.running&&current.deadline){
      return Math.max(0,Math.ceil((Number(current.deadline)-Date.now())/1000));
    }
    return Math.max(0,Number(current.remainingSec)||0);
  }
  function elapsedHoursMinutes(totalSec){
    const sec=Math.max(0,Number(totalSec)||0);
    const totalMin=Math.floor(sec/60);
    const h=Math.floor(totalMin/60);
    const m=totalMin%60;
    return h>0 ? `${h} h ${String(m).padStart(2,"0")} min` : `${m} min`;
  }

  function elapsedSeconds(){
    if(!current)return 0;
    const base=Number(current.elapsedSec)||0;
    if(current.running&&current.runStartedAt)return base+Math.max(0,Math.floor((Date.now()-Number(current.runStartedAt))/1000));
    return base;
  }
  function level(){
    return current?.levels?.[Number(current.levelIndex)||0]||null;
  }
  function nextLevel(){
    return bptGetNextLevel(current?.levels, Number(current?.levelIndex)||0);
  }

  function currentBlindDurationMinutes(){
    const lv=level();
    return Math.max(1,Math.round(Number(lv?.durationSec||0)/60)||0);
  }

  let live3PendingPaceAdvice=null;
  let live3PaceLastCheckAt=0;
  const LIVE3_PACE_MIN_INTERVAL_MS=15*60*1000;

  function live3PaceStorageKey(){
    return `bpt_pace_advice_${String(current?.sessionId||"none")}`;
  }

  function live3ReadPaceMemo(){
    try{return JSON.parse(localStorage.getItem(live3PaceStorageKey())||"null")||{};}catch(_e){return {};}
  }

  function live3WritePaceMemo(data){
    try{localStorage.setItem(live3PaceStorageKey(),JSON.stringify(data||{}));}catch(_e){}
  }

  function live3FinishProjection(){
    if(!current?.startedAt)return null;
    const totalPlayers=Math.max(2,(current.players||[]).length);
    const remaining=Math.max(1,remainingCount());
    const targetSec=Math.max(1800,Number(current.targetHours||4)*3600);
    const elapsed=Math.max(0,elapsedSeconds());
    const eliminationProgress=(totalPlayers-remaining)/(totalPlayers-1);
    const timeProgress=elapsed/targetSec;
    // Projection progressive : une seule élimination ne peut plus provoquer
    // une heure de retard annoncée ni une chute brutale des blinds.
    let projectedTotal=targetSec;
    if(elapsed>0 && eliminationProgress>0){
      const observedTotal=elapsed/Math.max(.01,eliminationProgress);
      const eliminations=totalPlayers-remaining;
      const weight=Math.min(.55,.08+.10*eliminations);
      projectedTotal=targetSec+(observedTotal-targetSec)*weight;
      const minFactor=eliminations===1?.92:.80;
      const maxFactor=eliminations===1?1.08:1.30;
      projectedTotal=Math.max(targetSec*minFactor,Math.min(targetSec*maxFactor,projectedTotal));
    }
    const projectedFinish=Number(current.startedAt)+projectedTotal*1000;
    const targetFinish=Number(current.startedAt)+targetSec*1000;
    const deltaSec=Math.round((projectedFinish-targetFinish)/1000);
    return {projectedFinish,targetFinish,deltaSec,projectedTotal,targetSec,timeProgress,eliminationProgress,totalPlayers,remaining};
  }

  function live3FormatClock(ts){
    const d=new Date(Number(ts)||Date.now());
    return d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  }

  function live3FormatProjectionDelta(sec){
    const m=Math.round(Math.abs(Number(sec)||0)/60);
    if(m<3)return {text:'À l’heure',cls:'bpt-pace-on-time'};
    return Number(sec)>0
      ? {text:`+${m} min de retard`,cls:'bpt-pace-late'}
      : {text:`-${m} min d’avance`,cls:'bpt-pace-early'};
  }

  function live3RenderProjection(){
    const p=live3FinishProjection();
    const normalFinish=$3('live3EstimatedFinish'), normalDelta=$3('live3FinishDelta');
    const fsFinish=$3('live3FsEstimatedFinish'), fsDelta=$3('live3FsFinishDelta');
    if(!p){
      if(normalFinish)normalFinish.textContent='—'; if(normalDelta)normalDelta.textContent='—';
      if(fsFinish)fsFinish.textContent='—'; if(fsDelta)fsDelta.textContent='—';
      return;
    }
    const d=live3FormatProjectionDelta(p.deltaSec);
    [normalFinish,fsFinish].forEach(el=>{if(el)el.textContent=live3FormatClock(p.projectedFinish);});
    [normalDelta,fsDelta].forEach(el=>{if(el){el.textContent=d.text;el.className=d.cls;}});
  }

  function live3PaceAnalysis(){
    if(!isOwner() || !isActive() || !current?.startedAt)return null;
    const projection=live3FinishProjection();
    if(!projection)return null;
    const totalPlayers=Math.max(2,(current.players||[]).length);
    const remaining=Math.max(1,remainingCount());
    const targetSec=Math.max(1800,Number(current.targetHours||4)*3600);
    const elapsed=Math.max(0,elapsedSeconds());
    const timeProgress=elapsed/targetSec;
    const eliminationProgress=(totalPlayers-remaining)/(totalPlayers-1);
    const upcoming=nextLevel();
    if(!upcoming)return null;
    const currentMin=Math.max(1,Math.round(Number(upcoming.durationSec||0)/60)||currentBlindDurationMinutes());

    // L’adaptation commence tôt, mais reste progressive et mesurée.
    const deltaMin=Math.round(Number(projection.deltaSec||0)/60); // + = retard, - = avance
    const absDeltaMin=Math.abs(deltaMin);
    if(absDeltaMin<8)return null;
    const type=deltaMin>0?"accelerate":"slow";
    const change=Math.max(1,Math.min(2,Math.round(absDeltaMin/20)))*(type==="accelerate"?-1:1);
    const proposedMin=Math.max(2,Math.min(40,currentMin+change));
    if(proposedMin===currentMin)return null;
    const targetRemaining=Math.max(0,targetSec-elapsed);
    return {type,deltaMin,deltaSec:projection.deltaSec,currentMin,proposedMin,totalPlayers,remaining,elapsed,targetRemaining,timeProgress,eliminationProgress,autoSuggest:absDeltaMin>=10};
  }

  function live3ClosePaceModal(){
    const modal=$3("live3PaceModal");
    modal?.classList.remove("open");
    modal?.setAttribute("aria-hidden","true");
    live3PendingPaceAdvice=null;
  }

  function live3ShowPaceAdvice(advice,{readapt=false}={}){
    if(!advice || $3("live3PaceModal")?.classList.contains("open"))return;
    live3PendingPaceAdvice=advice;
    const accel=advice.type==="accelerate";
    $3("live3PaceTitle").textContent=readapt?(accel?"Retard persistant · nouvelle adaptation":"Avance persistante · nouvelle adaptation"):(accel?"Retard significatif détecté":"Avance significative détectée");
    $3("live3PaceMessage").textContent=readapt
      ? (accel?`Malgré l’adaptation en cours, le retard reste important. Voulez-vous ajuster à nouveau les prochains niveaux ?`:`Malgré l’adaptation en cours, l’avance reste importante. Voulez-vous ajuster à nouveau les prochains niveaux ?`)
      : (accel?`La partie prend trop de retard. Voulez-vous passer en mode adaptatif pour essayer de respecter l’heure de fin prévue ?`:`La partie prend trop d’avance. Voulez-vous passer en mode adaptatif pour essayer de respecter l’heure de fin prévue ?`);
    $3("live3PaceElapsed").textContent=elapsedHoursMinutes(advice.elapsed);
    $3("live3PaceRemaining").textContent=elapsedHoursMinutes(advice.targetRemaining);
    $3("live3PacePlayers").textContent=`${advice.remaining} / ${advice.totalPlayers}`;
    $3("live3PaceDuration").textContent=`${advice.currentMin} → ${advice.proposedMin} min`;
    $3("live3PaceApplyBtn").textContent=readapt?"Appliquer la nouvelle adaptation":"Passer en adaptatif";
    const modal=$3("live3PaceModal");
    modal?.classList.add("open");
    modal?.setAttribute("aria-hidden","false");
  }

  function live3MaybeCheckPace({afterElimination=false}={}){
    if(!isOwner() || !isActive() || !current?.startedAt)return;
    const now=Date.now();
    if(!afterElimination && now-live3PaceLastCheckAt<60*1000)return;
    live3PaceLastCheckAt=now;
    const advice=live3PaceAnalysis();
    if(!advice || advice.autoSuggest!==true)return;

    const memo=live3ReadPaceMemo();
    const eliminationCount=advice.totalPlayers-advice.remaining;
    const bucket=Math.floor(advice.elapsed/(30*60));
    const signature=`${advice.type}:${eliminationCount}:${bucket}:${advice.proposedMin}`;
    if(memo.signature===signature)return;
    const sinceLast=Number(memo.at||0)>0 ? now-Number(memo.at) : Infinity;
    // Une élimination déclenche bien une nouvelle analyse, mais pas une nouvelle alerte
    // toutes les quelques minutes : 15 min mini après une alerte, 30 min sinon.
    if(afterElimination && sinceLast<5*60*1000)return;
    if(!afterElimination && sinceLast<LIVE3_PACE_MIN_INTERVAL_MS)return;

    if(current?.paceAdaptive===true){
      const last=current?.lastPaceAdjustment||{};
      const adjustedLevel=Number(last.levelIndex);
      const currentLevel=Math.max(0,Number(current?.levelIndex)||0);
      if(Number.isFinite(adjustedLevel) && currentLevel<=adjustedLevel)return;
      live3WritePaceMemo({signature,at:now});
      live3ShowPaceAdvice(advice,{readapt:true});
    }else{
      live3WritePaceMemo({signature,at:now});
      live3ShowPaceAdvice(advice);
    }
  }

  function live3CaptureClassicDurations(state){
    const levels=Array.isArray(state?.levels)?state.levels:[];
    if(!Array.isArray(state.paceClassicDurations) || state.paceClassicDurations.length!==levels.length){
      state.paceClassicDurations=levels.map(l=>Math.max(120,Number(l?.durationSec)||900));
    }
    return state.paceClassicDurations;
  }

  function live3RestoreClassicDurations(state){
    const levels=Array.isArray(state?.levels)?state.levels:[];
    const base=Array.isArray(state?.paceClassicDurations)?state.paceClassicDurations:[];
    const start=Math.max(0,(Number(state?.levelIndex)||0)+1);
    for(let i=start;i<levels.length;i++){
      const original=Math.max(120,Number(base[i])||Number(base[0])||900);
      levels[i].durationSec=original;
    }
    state.levels=levels;
    state.paceAdaptive=false;
    state.lastPaceAdjustment={at:Date.now(),type:'classic',levelIndex:Number(state.levelIndex)||0,automatic:false};
    return state;
  }

  async function live3AutoApplyPaceAdvice(advice){
    if(!advice || !isOwner())return;
    await ownerTransaction(s=>{
      live3CaptureClassicDurations(s);
      const levels=Array.isArray(s.levels)?s.levels:[];
      const start=Math.max(0,(Number(s.levelIndex)||0)+1);
      for(let i=start;i<levels.length;i++)levels[i].durationSec=advice.proposedMin*60;
      s.levels=levels;
      s.paceAdaptive=true;
      s.lastPaceAdjustment={at:Date.now(),type:advice.type,minutes:advice.proposedMin,remainingPlayers:advice.remaining,levelIndex:Number(s.levelIndex)||0,automatic:true};
      return s;
    });
    try{showBptToast(`BPT adaptatif : prochains niveaux à ${advice.proposedMin} min`,'ok');}catch(_e){}
  }

  async function live3ApplyPaceAdvice(){
    const advice=live3PendingPaceAdvice;
    if(!advice || !isOwner())return live3ClosePaceModal();
    await ownerTransaction(s=>{
      live3CaptureClassicDurations(s);
      const levels=Array.isArray(s.levels)?s.levels:[];
      const start=Math.max(0,(Number(s.levelIndex)||0)+1); // uniquement les niveaux suivants
      for(let i=start;i<levels.length;i++)levels[i].durationSec=advice.proposedMin*60;
      s.levels=levels;
      s.paceAdaptive=true;
      s.lastPaceAdjustment={at:Date.now(),type:advice.type,minutes:advice.proposedMin,remainingPlayers:advice.remaining,levelIndex:Number(s.levelIndex)||0,automatic:false};
      return s;
    });
    live3ClosePaceModal();
    try{showBptToast(`Mode adaptatif activé · prochains niveaux à ${advice.proposedMin} min`,'ok');}catch(_e){}
  }
  const BPT_SB_STRUCTURE=[25,50,75,100,150,200,300,400,500,600,800,1000,1200,1500,2000,2500,3000,4000,5000,6000,8000,10000,12000,15000,20000];
  function bptGetBlindLevels(){
    // V4.86 : le Live utilise une structure BPT standard et bornée.
    // Les anciens réglages de blinds éventuellement corrompus ne doivent plus contaminer un Live.
    return BPT_SB_STRUCTURE.map(sb=>({sb:Number(sb),bb:Number(sb)*2}));
  }

  function bptBlindRoundStep(value){
    const n=Math.max(1,Number(value)||1);
    if(n<200)return 25;
    if(n<1000)return 50;
    if(n<5000)return 100;
    if(n<10000)return 500;
    if(n<50000)return 1000;
    return 5000;
  }

  function bptRoundBlindValue(value){
    const step=bptBlindRoundStep(value);
    return Math.max(step, Math.round((Number(value)||0)/step)*step);
  }

  function bptComputedNextBlindLevel(level){
    const currentSb=Math.max(1,Number(level?.sb)||25);
    const currentBb=Math.max(currentSb*2,Number(level?.bb)||currentSb*2);
    const configuredLevels=bptGetBlindLevels();
    const exactIndex=configuredLevels.findIndex(v=>Number(v.sb)===currentSb && Number(v.bb)===currentBb);
    if(exactIndex>=0 && exactIndex<configuredLevels.length-1){
      const next=configuredLevels[exactIndex+1];
      return {sb:Number(next.sb),bb:Number(next.bb)};
    }
    const configuredNext=configuredLevels.find(v=>Number(v.sb)>currentSb && Number(v.bb)>currentBb);
    if(configuredNext){
      return {sb:Number(configuredNext.sb),bb:Number(configuredNext.bb)};
    }

    const grownSb=bptRoundBlindValue(currentSb*1.25);
    const nextSb=Math.max(currentSb+bptBlindRoundStep(currentSb), grownSb);
    return {sb:nextSb,bb:nextSb*2};
  }

  function bptSyntheticLevelAfter(level){
    const nextBlind=bptComputedNextBlindLevel(level||{});
    const durationSec=Math.max(60,
      Number(level?.durationSec)
      || Math.round((Number(level?.durationMin)||15)*60)
      || 15*60
    );
    return {
      level:Math.max(1,(Number(level?.level)||0)+1),
      sb:Number(nextBlind.sb),
      bb:Number(nextBlind.bb),
      ante:Number(level?.ante)||0,
      durationSec,
      durationMin:Math.max(1,Math.round(durationSec/60))
    };
  }

  function bptGetNextLevel(levels,index){
    const list=Array.isArray(levels)?levels:[];
    const idx=Math.max(0,Number(index)||0);
    if(list[idx+1])return list[idx+1];
    const base=list[idx] || list[list.length-1] || {level:idx+1,sb:25,bb:50,ante:0,durationSec:15*60,durationMin:15};
    return bptSyntheticLevelAfter(base);
  }

  function bptEnsureLevelExists(state,targetIndex){
    if(!state)return state;
    if(!Array.isArray(state.levels))state.levels=[];
    while(state.levels.length<=targetIndex){
      const prev=state.levels[state.levels.length-1] || {level:0,sb:25,bb:50,ante:0,durationSec:15*60,durationMin:15};
      state.levels.push(bptSyntheticLevelAfter(prev));
    }
    return state;
  }

  function selectedPlayerCount(){
    return document.querySelectorAll('#live3PlayerPicker input[type="checkbox"]:checked').length;
  }

  function computeStructure(targetHours,playerCount,startStack){
    const n=Math.max(2,Number(playerCount)||2);
    const stack=Math.max(100,Number(startStack)||20000);

    // Calibration empirique BPT :
    // 10 à 12 joueurs, stack 20 000, départ vers 21 h 15,
    // fin généralement vers 1 h 30, soit environ 4 h 15 de jeu ; la durée cible proposée par défaut reste 4 h 00.
    // Avec des niveaux proches de 18 min, cela correspond à une fin
    // autour du niveau 14 (BB 3 000) dans la structure actuelle.
    //
    // On fait donc évoluer le niveau de fin estimé avec la masse totale
    // de jetons, au lieu d'imposer un nombre de minutes fixe.
    const referencePlayers=11;
    const referenceStack=20000;
    const referenceEndBB=3000;

    const chipMassRatio=(n*stack)/(referencePlayers*referenceStack);
    const targetEndBB=referenceEndBB*chipMassRatio;

    let endIndex=0;
    let bestDistance=Infinity;
    const configuredLevels=bptGetBlindLevels();
    configuredLevels.forEach((blind,i)=>{
      const d=Math.abs(Number(blind.bb)-targetEndBB);
      if(d<bestDistance){
        bestDistance=d;
        endIndex=i;
      }
    });

    endIndex=Math.max(0,Math.min(configuredLevels.length-1,endIndex));
    const expectedLevelCount=endIndex+1;

    // La durée cible sert à calibrer le moment où le tournoi devrait arriver
    // dans sa zone de fin probable, mais la structure NE S'ARRÊTE PLUS à ce niveau.
    // Les niveaux suivants restent disponibles si la partie dépasse la cible.
    const totalSeconds=Math.max(1800,Number(targetHours||4)*3600);
    const levelSeconds=Math.max(2*60,Math.round((totalSeconds/expectedLevelCount)/60)*60);

    const levels=configuredLevels.map((blind,i)=>({
      level:i+1,
      sb:Number(blind.sb),
      bb:Number(blind.bb),
      ante:0,
      durationSec:levelSeconds
    }));

    return {
      levels,
      targetEndBB,
      levelSeconds,
      expectedEndBB:configuredLevels[endIndex]?.bb||0,
      expectedEndLevel:endIndex+1
    };
  }

  function buildLevels(targetHours,playerCount,startStack){
    return computeStructure(targetHours,playerCount,startStack).levels;
  }

  function bptNormalizeLive3Levels(state){
    if(!state || !state.active)return state;
    const currentLevels=Array.isArray(state.levels)?state.levels:[];
    const base=bptGetBlindLevels();
    const fallbackDuration=Math.max(120,Number(currentLevels[Math.max(0,Number(state.levelIndex)||0)]?.durationSec)||Number(currentLevels[0]?.durationSec)||900);
    const targetLen=Math.max(25,(Number(state.levelIndex)||0)+2);
    const normalized=[];
    for(let i=0;i<targetLen;i++){
      let blind=base[i];
      if(!blind){
        const prev=normalized[i-1]||{sb:20000,bb:40000};
        blind=bptComputedNextBlindLevel(prev);
      }
      normalized.push({
        level:i+1,
        sb:Number(blind.sb),
        bb:Number(blind.bb),
        ante:0,
        durationSec:Math.max(120,Number(currentLevels[i]?.durationSec)||fallbackDuration)
      });
    }
    const bad=currentLevels.length<25 || currentLevels.slice(0,Math.min(25,currentLevels.length)).some((lv,i)=>{
      const std=base[i]; return !std || Number(lv?.sb)!==Number(std.sb) || Number(lv?.bb)!==Number(std.bb);
    });
    if(!bad)return state;
    const out={...state,levels:normalized};
    const idx=Math.max(0,Math.min(normalized.length-1,Number(out.levelIndex)||0));
    out.levelIndex=idx;
    const maxDur=Math.max(120,Number(normalized[idx]?.durationSec)||fallbackDuration);
    out.remainingSec=Math.min(Math.max(0,Number(out.remainingSec)||maxDur),maxDur);
    if(out.running && out.deadline){
      const now=Date.now();
      if(out.runStartedAt)out.elapsedSec=Number(out.elapsedSec||0)+Math.max(0,Math.floor((now-Number(out.runStartedAt))/1000));
      out.deadline=now+out.remainingSec*1000;
      out.runStartedAt=now;
    }
    return out;
  }

  function renderStructurePreview(){ return; }
  function initials(name){
    return String(name||"?").trim().split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase()||"?";
  }

  function liveIdentityName(){
    return String(localStorage.getItem(LIVE_IDENTITY_KEY)||"").trim();
  }

  function renderConnectedIdentityBadge(){
    const el=document.getElementById("bptConnectedIdentity");
    const logoutBtn=document.getElementById("bptLogoutBtn");
    const name=String(liveIdentityName()||"").trim();
    if(el){
      el.textContent=name?`Connecté : ${name}`:"";
      el.title=name?`Profil connecté : ${name}`:"";
    }
    if(logoutBtn)logoutBtn.hidden=!(name&&liveIdentityConfirmed);
  }

  async function logoutIdentity(){
    const previousName=String(liveIdentityName()||"").trim();

    // Déconnexion volontaire : supprimer la session persistante de cet appareil.
    liveIdentityConfirmed=false;
    verifiedProfileName="";
    profileCodeState=null;
    profileCodeLoadingName="";
    try{sessionStorage.removeItem(LIVE_IDENTITY_SESSION_KEY);}catch(_e){}
    try{
      localStorage.removeItem(LIVE_IDENTITY_KEY);
      localStorage.removeItem(LIVE_TRUSTED_DEVICE_KEY);
    }catch(_e){}

    clearInterval(appPresenceTimer);
    appPresenceTimer=null;

    // Retirer tout de suite l'utilisateur des présences Firebase.
    try{
      const dbx=window.bptFirebaseDb?.();
      if(dbx)await dbx.ref(`${APP_PRESENCE_PATH}/${uid()}`).remove();
    }catch(e){console.warn("Déconnexion présence application :",e);}
    try{
      if(current?.active){
        const r=await ensureRef();
        await r.child(`viewers/${uid()}`).remove();
      }
    }catch(e){console.warn("Déconnexion présence Live :",e);}

    renderConnectedIdentityBadge();
    try{if(typeof render==="function")render();}catch(_e){}
    try{openSpectatorIdentity(true);}catch(e){console.warn("Réouverture identification BPT :",e);}
    try{showBptToast(previousName?`${previousName} est déconnecté.`:"Déconnecté.","ok");}catch(_e){}
  }

  function spectatorName(){
    return liveIdentityName();
  }

  const LIVE3_TAKEOVER_TIMEOUT_MS=30000;
const LIVE3_FORCE_CODE="bpt";
const APP_PRESENCE_PATH="bpt/app_presence";
  const BPT_BACKUP_PATH="bpt/backups";
const BPT_BACKUP_META_PATH="bpt/backup_meta";
const BPT_BACKUP_RETENTION_DAYS=14;
const BPT_BACKUP_DAILY_MS=24*60*60*1000;

const APP_CONNECTION_HISTORY_PATH="bpt/connection_history";
  const APP_CONNECTION_HISTORY_RETENTION_MS=7*24*60*60*1000;
  const APP_CONNECTION_HISTORY_DEDUP_MS=5*60*1000;
  const APP_CONNECTION_SESSION_LOGGED_KEY="bpt_connection_logged_session_v1";

  
function buildBptBackupPayload(){
  const payload={
    createdAt:Date.now(),
    appVersion:typeof BPT_APP_VERSION!=="undefined"?BPT_APP_VERSION:"",
    createdBy:(typeof liveIdentityName==="function"?liveIdentityName():"")||"",
    data:{
      db:JSON.parse(JSON.stringify(typeof db!=="undefined"?db:{}))
    }
  };

  try{
    if(typeof currentSeasonHistoryCache!=="undefined"){
      payload.data.currentSeasonHistoryCache=JSON.parse(JSON.stringify(currentSeasonHistoryCache||[]));
    }
  }catch(_e){}

  try{
    if(typeof pendingGamesLoad==="function"){
      payload.data.pendingGames=JSON.parse(JSON.stringify(pendingGamesLoad()||[]));
    }
  }catch(_e){}

  return payload;
}

function backupKeyFromTimestamp(ts){
  const d=new Date(Number(ts)||Date.now());
  const pad=n=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

async function pruneOldBackups(){
  try{
    if(!window.bptFirebaseEnsure)return;
    await window.bptFirebaseEnsure();
    const dbx=window.bptFirebaseDb?.();
    if(!dbx)return;

    const cutoff=Date.now()-BPT_BACKUP_RETENTION_DAYS*24*60*60*1000;
    const ref=dbx.ref(BPT_BACKUP_PATH);
    const snap=await ref.once("value");
    const data=snap.val()||{};
    const updates={};

    Object.entries(data).forEach(([key,val])=>{
      if(!val || Number(val.createdAt||0)<cutoff)updates[key]=null;
    });

    if(Object.keys(updates).length)await ref.update(updates);
  }catch(e){
    console.warn("Purge sauvegardes :",e);
  }
}

async function getLatestBackup(){
  try{
    if(!window.bptFirebaseEnsure)return null;
    await window.bptFirebaseEnsure();
    const dbx=window.bptFirebaseDb?.();
    if(!dbx)return null;

    const snap=await dbx.ref(BPT_BACKUP_PATH).once("value");
    const data=snap.val()||{};
    const rows=Object.entries(data)
      .map(([key,val])=>({key,...(val||{})}))
      .filter(v=>Number(v.createdAt||0)>0)
      .sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0));

    return rows[0]||null;
  }catch(e){
    console.warn("Lecture dernière sauvegarde :",e);
    return null;
  }
}

async function updateBackupInfo(){
  const el=document.getElementById("backupLastInfo");
  if(!el)return;

  const latest=await getLatestBackup();
  if(!latest){
    el.textContent="Aucune sauvegarde disponible.";
    return;
  }

  const d=new Date(Number(latest.createdAt));
  el.textContent=`Dernière sauvegarde : ${d.toLocaleDateString("fr-FR")} à ${d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}`;
}

async function createBptBackup({manual=false}={}){
  try{
    if(!window.bptFirebaseEnsure)return false;
    await window.bptFirebaseEnsure();
    const dbx=window.bptFirebaseDb?.();
    if(!dbx)return false;

    if(!manual){
      const latest=await getLatestBackup();
      if(latest && Date.now()-Number(latest.createdAt||0)<BPT_BACKUP_DAILY_MS){
        updateBackupInfo();
        return false;
      }
    }

    const payload=buildBptBackupPayload();
    const key=backupKeyFromTimestamp(payload.createdAt);

    await dbx.ref(`${BPT_BACKUP_PATH}/${key}`).set(payload);
    await dbx.ref(BPT_BACKUP_META_PATH).set({
      lastBackupAt:payload.createdAt,
      lastBackupKey:key,
      lastBackupVersion:payload.appVersion,
      lastBackupBy:payload.createdBy
    });

    await pruneOldBackups();
    await updateBackupInfo();

    if(manual){
      alert("Sauvegarde créée.");
    }
    return true;
  }catch(e){
    console.warn("Sauvegarde BPT :",e);
    if(manual)alert("Impossible de créer la sauvegarde.\\n\\n"+(e?.message||String(e)));
    return false;
  }
}

async function downloadLatestBptBackup(){
  const latest=await getLatestBackup();
  if(!latest){
    alert("Aucune sauvegarde disponible.");
    return;
  }

  const blob=new Blob([JSON.stringify(latest,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  const d=new Date(Number(latest.createdAt)||Date.now());
  const pad=n=>String(n).padStart(2,"0");
  a.href=url;
  a.download=`BPT_backup_${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

document.addEventListener("click",e=>{
  if(e.target?.closest?.("#backupNowBtn")){
    createBptBackup({manual:true});
  }
  if(e.target?.closest?.("#downloadLatestBackupBtn")){
    downloadLatestBptBackup();
  }
});

document.addEventListener("DOMContentLoaded",()=>{
  setTimeout(()=>{
    try{
      createBptBackup({manual:false});
      updateBackupInfo();
    }catch(_e){}
  },2000);
});


function connectionDeviceLabel(){
    const mobile=window.matchMedia&&window.matchMedia("(max-width:700px)").matches;
    return mobile?"Téléphone":"PC";
  }

  function formatConnectionDate(ts){
    const d=new Date(Number(ts)||0);
    if(!Number.isFinite(d.getTime()))return {day:"—",time:"—"};
    return {
      day:d.toLocaleDateString("fr-FR",{weekday:"short",day:"2-digit",month:"2-digit",year:"numeric"}),
      time:d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})
    };
  }

  async function pruneOldConnectionHistory(){
    try{
      if(!window.bptFirebaseEnsure)return;
      await window.bptFirebaseEnsure();
      const dbx=window.bptFirebaseDb?.();
      if(!dbx)return;

      const cutoff=Date.now()-APP_CONNECTION_HISTORY_RETENTION_MS;
      const ref=dbx.ref(APP_CONNECTION_HISTORY_PATH);
      const snap=await ref.once("value");
      const data=snap.val()||{};
      const updates={};

      Object.entries(data).forEach(([key,val])=>{
        if(!val || Number(val.at||0)<cutoff)updates[key]=null;
      });

      if(Object.keys(updates).length){
        await ref.update(updates);
      }
    }catch(e){
      console.warn("Purge historique connexions :",e);
    }
  }

  async function logConnectionSession(){
    const name=String(liveIdentityName()||"").trim();
    if(!name || !identityConfirmedThisSession())return;

    try{
      if(!window.bptFirebaseEnsure)return;
      await window.bptFirebaseEnsure();
      const dbx=window.bptFirebaseDb?.();
      if(!dbx)return;

      const now=Date.now();
      const deviceId=uid();
      const base=dbx.ref(APP_CONNECTION_HISTORY_PATH);

      // Evite les doublons lors de F5 successifs :
      // même personne + même appareil dans les 5 dernières minutes = même connexion.
      const snap=await base.once("value");
      const data=snap.val()||{};
      const duplicate=Object.values(data).some(v=>
        v &&
        String(v.name||"").trim()===name &&
        String(v.deviceId||"")===String(deviceId) &&
        now-Number(v.at||0)>=0 &&
        now-Number(v.at||0)<APP_CONNECTION_HISTORY_DEDUP_MS
      );

      if(!duplicate){
        await base.push().set({
          name,
          at:now,
          device:connectionDeviceLabel(),
          deviceId
        });
      }

      await pruneOldConnectionHistory();
      if(document.getElementById("connectionHistoryBody"))loadConnectionHistory();
    }catch(e){
      console.warn("Historique connexion :",e);
    }
  }

  async function loadConnectionHistory(){
    const body=document.getElementById("connectionHistoryBody");
    const summary=document.getElementById("connectionHistorySummary");
    if(!body||!summary)return;

    try{
      if(!window.bptFirebaseEnsure){
        body.innerHTML='<tr><td colspan="3" class="muted">Firebase indisponible.</td></tr>';
        summary.textContent="";
        return;
      }

      await window.bptFirebaseEnsure();
      const dbx=window.bptFirebaseDb?.();
      if(!dbx)return;

      const cutoff=Date.now()-APP_CONNECTION_HISTORY_RETENTION_MS;
      const snap=await dbx.ref(APP_CONNECTION_HISTORY_PATH).once("value");

      const rawRows=Object.values(snap.val()||{})
        .filter(v=>v && Number(v.at||0)>=cutoff && String(v.name||"").trim());

      const byPlayer=new Map();

      rawRows.forEach(v=>{
        const name=String(v.name||"").trim();
        const at=Number(v.at||0);
        if(!byPlayer.has(name)){
          byPlayer.set(name,{
            name,
            lastAt:at,
            count:1
          });
        }else{
          const row=byPlayer.get(name);
          row.count++;
          if(at>row.lastAt)row.lastAt=at;
        }
      });

      const rows=[...byPlayer.values()]
        .sort((a,b)=>Number(b.lastAt||0)-Number(a.lastAt||0));

      summary.textContent=`${rows.length} joueur${rows.length>1?"s":""} · ${rawRows.length} connexion${rawRows.length>1?"s":""} sur 7 jours`;

      body.innerHTML=rows.length
        ? rows.map(v=>{
            const f=formatConnectionDate(v.lastAt);
            return `<tr>
              <td>${escapeHtml(v.name)}</td>
              <td>${escapeHtml(`${f.day} · ${f.time}`)}</td>
              <td>${Number(v.count)||0}</td>
            </tr>`;
          }).join("")
        : '<tr><td colspan="3" class="muted">Aucune connexion enregistrée sur les 7 derniers jours.</td></tr>';
    }catch(e){
      console.warn("Lecture historique connexions :",e);
      body.innerHTML='<tr><td colspan="3" class="muted">Impossible de charger l’historique.</td></tr>';
      summary.textContent="";
    }
  }

  const APP_PRESENCE_HEARTBEAT_MS=15000;
  const APP_PRESENCE_STALE_MS=300000;
  let appPresenceTimer=null;
  let appPresenceListenerInstalled=false;

  function appPresenceNameParts(name){
    const clean=String(name||"").trim().replace(/\s+/g," ");
    if(!clean)return {first:"",last:""};
    const parts=clean.split(" ");
    return {
      first:parts[0]||"",
      last:parts.length>1?parts[parts.length-1]:""
    };
  }

  function appPresenceBaseInitials(name){
    const {first,last}=appPresenceNameParts(name);
    const f=first.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase();
    const l=last.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase();
    if(!f)return "?";
    if(!l)return f.slice(0,2);
    return `${f.slice(0,2)}.${l.slice(0,2)}`;
  }

  function appPresenceUniqueInitials(active){
    const used=new Set();

    return (active||[]).map(v=>{
      const {first,last}=appPresenceNameParts(v?.name);
      const f=first.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase();
      const l=last.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase();

      if(!f)return "?";
      if(!l){
        let code=f.slice(0,2);
        if(!used.has(code)){used.add(code);return code;}
        code=f.slice(0,3);
        used.add(code);
        return code;
      }

      for(let lastLen=2; lastLen<=Math.max(2,l.length); lastLen++){
        const code=`${f.slice(0,2)}.${l.slice(0,lastLen)}`;
        if(!used.has(code)){
          used.add(code);
          return code;
        }
      }

      let n=2;
      let code=`${f.slice(0,2)}.${l.slice(0,2)}${n}`;
      while(used.has(code)){
        n++;
        code=`${f.slice(0,2)}.${l.slice(0,2)}${n}`;
      }
      used.add(code);
      return code;
    });
  }

  function renderAppPresence(viewers){
    renderConnectedIdentityBadge();
    const countEl=document.getElementById("bptOnlineCount");
    const tipEl=document.getElementById("bptOnlineTooltip");
    if(!countEl||!tipEl)return;

    // V9.0.3 : "connecté" signifie authentifié dans l'application,
    // et non simplement présent dans un onglet actif. La session persiste
    // jusqu'à une déconnexion volontaire sur l'appareil.
    // Les entrées des anciennes versions (présence temporaire) sont ignorées.
    const byPlayer=new Map();
    Object.values(viewers||{}).forEach(v=>{
      const name=String(v?.name||"").trim();
      if(!name || v?.persistent!==true)return;
      const key=name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("fr").replace(/\s+/g," ").trim();
      const previous=byPlayer.get(key);
      if(!previous || Number(v.lastSeen||0)>Number(previous.lastSeen||0))byPlayer.set(key,v);
    });

    const active=[...byPlayer.values()]
      .sort((a,b)=>String(a.name||"").localeCompare(String(b.name||""),"fr",{sensitivity:"base"}));

    const initials=appPresenceUniqueInitials(active);

    countEl.textContent=String(active.length);
    tipEl.textContent=active.length
      ? initials.join(" · ")
      : "Personne";

    if(document.body.classList.contains("bpt-presence-detail-open")){
      requestAnimationFrame(updateMobilePresenceNavOffset);
    }
  }

  function mobilePresenceLayout(){
    return window.matchMedia("(max-width:700px)").matches;
  }

  function updateMobilePresenceNavOffset(){
    const presence=document.getElementById("bptOnlinePresence");
    const tip=document.getElementById("bptOnlineTooltip");
    if(!presence||!tip||!mobilePresenceLayout()){
      document.documentElement.style.removeProperty("--bpt-presence-detail-space");
      return;
    }
    const h=Math.ceil(tip.getBoundingClientRect().height||0);
    document.documentElement.style.setProperty("--bpt-presence-detail-space",`${Math.max(0,h+12)}px`);
  }

  function openMobilePresenceDetail(){
    if(!mobilePresenceLayout())return;
    document.body.classList.add("bpt-presence-detail-open");
    document.documentElement.classList.add("bpt-presence-detail-open");
    requestAnimationFrame(updateMobilePresenceNavOffset);
  }

  function closeMobilePresenceDetail(){
    document.body.classList.remove("bpt-presence-detail-open");
    document.documentElement.classList.remove("bpt-presence-detail-open");
    document.documentElement.style.removeProperty("--bpt-presence-detail-space");
  }

  document.addEventListener("click",e=>{
    const presence=document.getElementById("bptOnlinePresence");
    if(!presence)return;
    if(presence.contains(e.target)){
      if(mobilePresenceLayout()){
        if(document.body.classList.contains("bpt-presence-detail-open")) closeMobilePresenceDetail();
        else openMobilePresenceDetail();
      }
      return;
    }
    if(document.body.classList.contains("bpt-presence-detail-open"))closeMobilePresenceDetail();
  });

  window.addEventListener("resize",()=>{
    if(!mobilePresenceLayout())closeMobilePresenceDetail();
    else if(document.body.classList.contains("bpt-presence-detail-open"))requestAnimationFrame(updateMobilePresenceNavOffset);
  });

  async function updateAppPresence(){
    if(!liveIdentityName() || !identityConfirmedThisSession())return;

    try{
      if(!window.bptFirebaseEnsure)return;
      await window.bptFirebaseEnsure();

      const dbx=window.bptFirebaseDb?.();
      if(!dbx)return;

      const ref=dbx.ref(`${APP_PRESENCE_PATH}/${uid()}`);
      const snap=await ref.once("value");
      const previous=snap.val()||{};
      await ref.set({
        name:liveIdentityName(),
        initials:appPresenceBaseInitials(liveIdentityName()),
        persistent:true,
        connectedAt:Number(previous.connectedAt)||Date.now(),
        lastSeen:Date.now(),
        device:connectionDeviceLabel()
      });

      // Ne pas supprimer à la fermeture de l'onglet : l'appareil reste
      // connecté jusqu'au clic explicite sur « Déconnexion ».
      try{ref.onDisconnect().cancel();}catch(_e){}
    }catch(e){
      console.warn("Présence application :",e);
    }
  }

  async function installAppPresenceListener(){
    if(appPresenceListenerInstalled)return;

    try{
      if(!window.bptFirebaseEnsure)return;
      await window.bptFirebaseEnsure();

      const dbx=window.bptFirebaseDb?.();
      if(!dbx)return;

      const base=dbx.ref(APP_PRESENCE_PATH);
      base.on("value",snap=>renderAppPresence(snap.val()||{}));
      appPresenceListenerInstalled=true;
    }catch(e){
      console.warn("Lecture présence application :",e);
    }
  }

  function startAppPresence(){
    installAppPresenceListener();
    updateAppPresence();

    clearInterval(appPresenceTimer);
    appPresenceTimer=setInterval(updateAppPresence,APP_PRESENCE_HEARTBEAT_MS);
  }

  // V9.0.3 : aucune déconnexion automatique à la fermeture de la page.
  // La suppression de la session Firebase est faite uniquement par logoutIdentity().




  // CONTRAT D’ARCHITECTURE BPT : Paramètres > Joueurs est l’unique référentiel.
  // Le login consomme exactement db.players via l’API partagée de application.js.
  // Aucun lecteur Firebase parallèle n’est autorisé pour construire la liste du login.
  let authoritativeLoginPlayersCache=null;
  let authoritativeLoginPlayersListenerInstalled=false;

  function normalizeIdentityKey(v){
    return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim().toLocaleLowerCase("fr");
  }

  function normalizeLoginPlayers(playersRaw){
    const players=Array.isArray(playersRaw)?playersRaw:Object.values(playersRaw||{});
    const rows=players
      .filter(p=>p && String(p.name||"").trim())
      .map(p=>({name:String(p.name||"").trim()}))
      .sort((a,b)=>a.name.localeCompare(b.name,"fr",{sensitivity:"base"}));
    const seen=new Set();
    return rows.filter(row=>{
      const key=normalizeIdentityKey(row.name);
      if(!key || seen.has(key))return false;
      seen.add(key);
      return true;
    });
  }

  async function fetchAuthoritativeLoginPlayers(){
    if(typeof window.bptWaitForSettingsPlayers!=="function")throw new Error("Référentiel Joueurs indisponible");
    const records=normalizeLoginPlayers(await window.bptWaitForSettingsPlayers());
    authoritativeLoginPlayersCache=records;
    return records;
  }

  async function installAuthoritativeLoginPlayersListener(){
    if(authoritativeLoginPlayersListenerInstalled)return;
    authoritativeLoginPlayersListenerInstalled=true;
    window.addEventListener('bpt:settings-players-changed',event=>{
      const records=normalizeLoginPlayers(event?.detail?.players||[]);
      authoritativeLoginPlayersCache=records;
      renderSpectatorNameOptions(records);
      const modal=$3("live3SpectatorIdentityModal");
      if(modal?.classList.contains("open")){
        const select=$3("live3SpectatorNameInput");
        if(select)select.disabled=false;
        const btn=$3("live3SpectatorIdentityConfirmBtn");
        if(btn)btn.disabled=!String(select?.value||"").trim();
      }
    });
  }

  async function profileCodeDigest(value){
    const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
    return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
  }

  function renderSpectatorNameOptions(records){
    const select=$3("live3SpectatorNameInput");
    if(!select)return;
    const currentValue=String(select.value||liveIdentityName()||"").trim();
    const rows=Array.isArray(records)?records:[];
    const signature=rows.map(row=>row.name).join("|");
    if(signature!==spectatorSelectSignature){
      select.innerHTML='<option value="">— Choisir votre nom —</option>'+rows.map(row=>`<option value="${escapeAttr(row.name)}">${escapeHtml(row.name)}</option>`).join("");
      spectatorSelectSignature=signature;
    }
    if(currentValue && rows.some(row=>row.name===currentValue))select.value=currentValue;
    else if(!select.value || !rows.some(row=>row.name===select.value))select.value="";
  }

  function populateSpectatorNameList(){
    const select=$3("live3SpectatorNameInput");
    if(select){select.innerHTML='<option value="">Chargement de la liste joueurs…</option>';select.disabled=true;spectatorSelectSignature='';}
    const btn=$3("live3SpectatorIdentityConfirmBtn");
    if(btn)btn.disabled=true;
    Promise.all([fetchAuthoritativeLoginPlayers(),installAuthoritativeLoginPlayersListener()]).then(([records])=>{
      if(select)select.disabled=false;
      renderSpectatorNameOptions(records);
      if(btn)btn.disabled=!String(select?.value||"").trim();
      if($3("live3SpectatorIdentityModal")?.classList.contains("open"))loadProfileCodeState(true);
    }).catch(e=>{
      console.error("Liste joueurs Firebase indisponible",e);
      if(select){select.disabled=true;select.innerHTML='<option value="">Connexion indisponible — vérifiez Internet</option>';}
      const err=$3('bptProfileCodeError');
      if(err)err.textContent='Impossible de charger la liste joueurs Firebase.';
    });
  }

  function openSpectatorIdentity(force=false){
    // Les appels automatiques du Live peuvent arriver avant le contrôleur
    // d’entrée : restaurer l’appareil approuvé avant d’afficher la fenêtre.
    if(!liveIdentityConfirmed && restoreTrustedDevice())return;
    if(!force){
      if(isOwner())return;
      if(!isActive())return;
      if(liveIdentityConfirmed)return;
    }

    const existing=liveIdentityName();
    if(existing && !force && liveIdentityConfirmed)return;

    const modal=$3("live3SpectatorIdentityModal");
    if(!modal)return;

    // render() peut être appelé plusieurs fois par seconde.
    // Une fenêtre déjà ouverte conserve les champs et le focus, même
    // lorsque l’identification est obligatoire (force=true).
    if(modal.classList.contains("open"))return;

    populateSpectatorNameList();
    const input=$3("live3SpectatorNameInput");

    const btn=$3("live3SpectatorIdentityConfirmBtn");
    if(btn)btn.disabled=!String(input?.value||"").trim();

    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
    loadProfileCodeState();

    // Pas de focus forcé sur un select mobile : certains navigateurs
    // redessinent le contrôle natif et donnent une impression de flash.
    if(!window.matchMedia("(max-width:700px)").matches){
      setTimeout(()=>{
        try{input?.focus({preventScroll:true});}catch(_e){}
      },50);
    }
  }

  function closeSpectatorIdentity(){
    const modal=$3("live3SpectatorIdentityModal");
    if(!modal)return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
  }

  let profileCodeState=null,profileCodeLoadingName='',verifiedProfileName='';
  async function profileCodeRef(name){
    const env=await window.bptFirebaseEnsure?.();if(!env?.rtdb)throw new Error('Connexion indisponible.');
    const dbx=env.rtdb,clean=String(name||'').trim(),target=normalizeIdentityKey(clean),playersRef=dbx.ref("bpt/state/main/data/players");
    async function read(){
      const snap=await playersRef.once('value');
      const raw=snap.val(),players=Array.isArray(raw)?raw:Object.values(raw||{});
      const idx=players.findIndex(p=>normalizeIdentityKey(p?.name)===target);
      return {players,idx,auth:idx>=0?(players[idx].auth||null):null};
    }
    return {
      async once(){const r=await read();return {val:()=>r.auth};},
      async update(payload){
        return playersRef.transaction(current=>{
          const players=Array.isArray(current)?current:Object.values(current||{}),idx=players.findIndex(p=>normalizeIdentityKey(p?.name)===target);
          if(idx<0)return;
          players[idx]={...players[idx],auth:{...(players[idx].auth||{}),...(payload||{})}};
          return players;
        });
      },
      async transaction(updater){
        let outAuth=null;
        const result=await playersRef.transaction(current=>{
          const players=Array.isArray(current)?current:Object.values(current||{}),idx=players.findIndex(p=>normalizeIdentityKey(p?.name)===target);
          if(idx<0)return;
          const next=updater(players[idx].auth||null);
          if(next===undefined)return;
          outAuth=next;players[idx]={...players[idx],auth:next};return players;
        });
        return {committed:result.committed,snapshot:{val:()=>outAuth}};
      }
    };
  }
  async function loadProfileCodeState(force=false){
    const name=String($3('live3SpectatorNameInput')?.value||'').trim();
    if(!force&&profileCodeLoadingName===name)return;
    profileCodeLoadingName=name;profileCodeState=null;
    const button=$3('live3SpectatorIdentityConfirmBtn'),hint=$3('bptProfileCodeHint');
    if(button)button.disabled=true;
    $3('bptProfileCodeInput').value='';$3('bptProfileCodeConfirm').value='';$3('bptProfileCodeConfirmLabel').hidden=true;$3('bptProfileCodeError').textContent='';
    if(!name){hint.textContent='Choisissez votre profil.';return;}
    hint.textContent='Vérification du profil…';
    try{
      const ref=await profileCodeRef(name),snap=await ref.once('value');
      if(profileCodeLoadingName!==name)return;
      profileCodeState={name,ref,record:snap.val()};
      const exists=!!(profileCodeState.record?.salt&&profileCodeState.record?.digest);
      $3('bptProfileCodeInput').maxLength=4;
      $3('bptProfileCodeInput').minLength=4;
      $3('bptProfileCodeInput').placeholder='Votre code à 4 chiffres';
      $3('bptProfileCodeLabel').textContent='Code secret personnel · 4 chiffres';
      hint.textContent=exists?'Saisissez votre code personnel habituel.':'Créez votre code personnel. Vous conserverez ce même code pour les prochaines connexions.';
      $3('bptProfileCodeConfirmLabel').hidden=exists;
      $3('bptProfileCodeInput').autocomplete=exists?'current-password':'new-password';
      button.textContent=exists?'Se connecter':'Créer mon code et me connecter';button.disabled=false;
    }catch(e){if(profileCodeLoadingName!==name)return;hint.textContent='Impossible de vérifier le code. Vérifiez votre connexion et réessayez.';$3('bptProfileCodeError').textContent=e.message||'Connexion indisponible';profileCodeLoadingName='';}
  }
  async function resetPlayerProfileCode(name){
    if(!settingsUnlocked)throw new Error('Déverrouillez les paramètres administrateur.');
    const codeRef=await profileCodeRef(name);
    const snap=await codeRef.once('value');
    if(!snap.val())throw new Error('Aucun code à réinitialiser pour ce joueur.');
    if(!settingsUnlocked)throw new Error('Les paramètres ont été verrouillés.');
    await codeRef.update({salt:null,digest:null,codeLength:null,createdAt:null,updatedAt:Date.now()});
    if(profileCodeState?.name===name||profileCodeLoadingName===name){profileCodeState=null;profileCodeLoadingName='';}
    if($3('live3SpectatorIdentityModal')?.classList.contains('open')&&$3('live3SpectatorNameInput')?.value===name)await loadProfileCodeState(true);
    return true;
  }

  async function verifyProfileCode(name){
    const error=$3('bptProfileCodeError'),pin=String($3('bptProfileCodeInput')?.value||'');error.textContent='';
    if(!profileCodeState||profileCodeState.name!==name){error.textContent='Attendez la vérification du profil, puis réessayez.';await loadProfileCodeState(true);return false;}
    if(!/^[0-9]{4}$/.test(pin)){error.textContent='Saisissez un code de 4 chiffres.';return false;}
    const {ref}=profileCodeState;let record=(await ref.once('value')).val();
    if(!record?.salt||!record?.digest){
      if(pin!==String($3('bptProfileCodeConfirm').value||'')){error.textContent='Les deux codes ne correspondent pas.';return false;}
      const salt=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
      const digest=await profileCodeDigest(salt+':'+pin);
      const result=await ref.transaction(server=>{
        if(server?.salt&&server?.digest)return;
        return {...(server||{}),salt,digest,codeLength:4,createdAt:Date.now(),updatedAt:Date.now()};
      });
      record=result.snapshot.val()||(await ref.once('value')).val();
    }
    if(!record?.salt||!record?.digest||await profileCodeDigest(record.salt+':'+pin)!==record.digest){error.textContent='Code incorrect pour ce profil.';return false;}
    profileCodeState.record=record;verifiedProfileName=name;return true;
  }

  function openProfileCodeChange(){
    if(!liveIdentityConfirmed||!verifiedProfileName)return;
    const modal=$3('bptChangeProfileCodeModal');
    $3('bptChangeProfileCodeName').textContent='Profil : '+verifiedProfileName;
    for(const id of ['bptChangeProfileCodeOld','bptChangeProfileCodeNew','bptChangeProfileCodeConfirm'])$3(id).value='';
    $3('bptChangeProfileCodeStatus').textContent='';$3('bptChangeProfileCodeSave').disabled=false;
    modal.classList.add('open');modal.setAttribute('aria-hidden','false');
  }
  function closeProfileCodeChange(){const modal=$3('bptChangeProfileCodeModal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true');}
  async function changeProfileCode(){
    if(!liveIdentityConfirmed||!verifiedProfileName)return;
    const name=verifiedProfileName,oldPin=$3('bptChangeProfileCodeOld').value,newPin=$3('bptChangeProfileCodeNew').value,confirm=$3('bptChangeProfileCodeConfirm').value;
    const status=$3('bptChangeProfileCodeStatus'),button=$3('bptChangeProfileCodeSave');status.textContent='';
    if(!/^[0-9]{4}$/.test(oldPin)||!/^[0-9]{4}$/.test(newPin)){status.textContent='Chaque code doit contenir 4 chiffres.';return;}
    if(newPin!==confirm){status.textContent='Les deux nouveaux codes ne correspondent pas.';return;}
    button.disabled=true;
    try{
      const ref=await profileCodeRef(name),record=(await ref.once('value')).val();
      if(!record||await profileCodeDigest(record.salt+':'+oldPin)!==record.digest){status.textContent='Le code actuel est incorrect.';return;}
      const digest=await profileCodeDigest(record.salt+':'+newPin);
      const result=await ref.transaction(server=>{
        if(!server)return {...record,digest,codeLength:4,updatedAt:Date.now()};
        if(server.digest===digest&&server.codeLength===4)return server;
        return server.digest===record.digest?{...server,digest,codeLength:4,updatedAt:Date.now()}:undefined;
      });
      if(!result.committed){status.textContent='Le code a changé entre-temps. Réessayez.';return;}
      if(profileCodeState?.name===name)profileCodeState.record=result.snapshot.val();
      for(const id of ['bptChangeProfileCodeOld','bptChangeProfileCodeNew','bptChangeProfileCodeConfirm'])$3(id).value='';
      status.textContent='Votre code a été modifié. Utilisez le nouveau code lors de vos prochaines connexions.';
    }catch(e){status.textContent='Modification impossible : '+(e.message||'réessayez');}
    finally{button.disabled=false;}
  }

  async function setSpectatorIdentity(){
    const input=$3("live3SpectatorNameInput");
    const clean=String(input?.value||"").trim();

    if(!clean){
      alert("Choisissez votre nom dans la liste des joueurs actifs.");
      input?.focus();
      return;
    }

    // Contrôle sur la même liste officielle que celle affichée au login.
    const activeProfiles=await fetchAuthoritativeLoginPlayers();

    if(!activeProfiles.some(profile=>profile.name===clean)){
      alert("Ce joueur n’est plus présent dans Paramètres > Joueurs. La liste vient d’être actualisée.");
      renderSpectatorNameOptions(activeProfiles);
      input?.focus();
      return;
    }

    const confirmButton=$3('live3SpectatorIdentityConfirmBtn');confirmButton.disabled=true;
    try{if(!await verifyProfileCode(clean))return;}
    catch(e){$3('bptProfileCodeError').textContent='Connexion impossible : '+(e.message||'réessayez');return;}
    finally{confirmButton.disabled=false;}
    localStorage.setItem(LIVE_IDENTITY_KEY,clean);
    rememberTrustedDevice(clean);
    renderConnectedIdentityBadge();
    markIdentityConfirmedThisSession();
    startAppPresence();
    logConnectionSession();

    // Si aucun Live n'est actif, ce joueur est le futur organisateur :
    // préremplir le lieu avec son nom.
    if(!isActive()){
      const loc=$3("live3Location");
      if(loc)loc.value=clean;
    }

    closeSpectatorIdentity();
    if(typeof renderProfile==='function')renderProfile(clean);
    await updateViewerPresence();
    render();
  }

  async function updateViewerPresence(){
    if(!isActive() || isOwner() || !liveIdentityConfirmed)return;
    const name=liveIdentityName();
    if(!name)return;

    try{
      const r=await ensureRef();
      const sessionId=String(current?.sessionId||"");
      await r.transaction(server=>{
        if(!server?.active)return server;
        if(String(server.sessionId||"")!==sessionId)return server;

        const next=clone(server);
        if(!next.viewers || typeof next.viewers!=="object")next.viewers={};

        next.viewers[uid()]={
          name,
          deviceLabel:deviceLabel(),
          lastSeen:Date.now()
        };
        return next;
      });
    }catch(e){
      console.warn("Présence spectateur :",e);
    }
  }

  function activeViewers(){
    const now=Date.now();
    const viewers=current?.viewers && typeof current.viewers==="object"
      ? Object.entries(current.viewers)
      : [];

    return viewers
      .filter(([id,v])=>
        id!==String(current?.ownerId||"") &&
        v &&
        String(v.name||"").trim() &&
        now-Number(v.lastSeen||0) < VIEWER_STALE_MS
      )
      .map(([id,v])=>({id,...v}))
      .sort((a,b)=>String(a.name).localeCompare(String(b.name),"fr",{sensitivity:"base"}));
  }

  function renderViewerInfo(){
    const host=$3("live3ViewerInfo");
    if(!host)return;

    if(!isOwner()){
      host.style.display="none";
      if(viewerRenderSignature!=="hidden"){
        host.innerHTML="";
        viewerRenderSignature="hidden";
      }
      return;
    }

    const viewers=activeViewers();
    const signature=viewers.map(v=>`${v.id}:${v.name}`).join("|");

    host.style.display="flex";

    if(!viewers.length){
      const emptySig="owner:empty";
      if(viewerRenderSignature!==emptySig){
        host.innerHTML='<span class="muted">Aucun spectateur connecté</span>';
        viewerRenderSignature=emptySig;
      }
      return;
    }

    const fullSig=`owner:${signature}`;
    if(viewerRenderSignature===fullSig)return;

    host.innerHTML=
      `<span class="bpt-live3-viewer-count">${viewers.length} spectateur${viewers.length>1?"s":""}</span>`+
      viewers.map(v=>`<span class="bpt-live3-viewer-chip">${escapeHtml(v.name)}</span>`).join("");

    viewerRenderSignature=fullSig;
  }

  function startSpectatorHeartbeat(){
    if(spectatorHeartbeat)return;
    spectatorHeartbeat=setInterval(()=>{
      if(isActive() && !isOwner() && liveIdentityConfirmed && liveIdentityName()){
        updateViewerPresence();
      }
    },15000);
  }

  async function ensureRef(){
    const env=await window.bptFirebaseEnsure?.();
    if(!env?.rtdb)throw new Error("Firebase indisponible");
    if(!ref)ref=env.rtdb.ref(PATH);
    return ref;
  }

  async function installListener(){
    if(listenerInstalled)return true;
    try{
      const r=await ensureRef();
      r.on("value",snap=>{
        const raw=snap.val()||null;
        current=bptNormalizeLive3Levels(raw);
        if(raw?.active && current && JSON.stringify(raw.levels||[])!==JSON.stringify(current.levels||[]) && String(raw.ownerId||"")===uid()){
          r.child("levels").set(current.levels).catch(()=>{});
          r.child("remainingSec").set(current.remainingSec).catch(()=>{});
          r.child("levelIndex").set(current.levelIndex).catch(()=>{});
          if(current.running&&current.deadline){
            r.child("deadline").set(current.deadline).catch(()=>{});
            r.child("runStartedAt").set(current.runStartedAt).catch(()=>{});
          }
        }
        onState();
      },err=>{
        console.warn("Live V3 listener:",err);
        listenerInstalled=false;
      });
      listenerInstalled=true;
      return true;
    }catch(e){
      console.warn("Live V3 install:",e);
      setTimeout(installListener,1800);
      return false;
    }
  }

  function drawPersonalBounties(names){
    const selected=[...new Set(names)];if(selected.length<2)return [];
    const history=Array.isArray(db?.history)?db.history:[];
    const leaders=ranking();const leader=leaders[0]?.name;
    const latest=Math.max(0,...history.map(r=>Number(r.game)||0));
    const champion=history.find(r=>Number(r.game)===latest&&Number(r.place)===1)?.player;
    const used=new Map();
    const shuffled=selected.slice();
    for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
    return shuffled.map(hunter=>{
      const rivals=selected.filter(n=>n!==hunter),target=rivals[Math.floor(Math.random()*rivals.length)];
      const candidates=[
        {type:'target',target,title:'Cible secrète',icon:'🎯',text:'Éliminer '+target+' vous-même.'},
        {type:'duel',target,title:'Duel personnel',icon:'⚔️',text:'Terminer devant '+target+'.'},
        {type:'firstKill',title:'Premier sang',icon:'💥',text:'Réaliser la première élimination de la soirée.'}
      ];
      if(selected.length>=3)candidates.push({type:'kills',min:2,title:'Double impact',icon:'🔥',text:'Éliminer deux joueurs dans la partie.'});
      if(leader&&rivals.includes(leader))candidates.push({type:'target',target:leader,title:'Chasseur de tête',icon:'👑',text:'Éliminer '+leader+', leader de la saison.'});
      if(champion&&rivals.includes(champion))candidates.push({type:'target',target:champion,title:'Faire tomber le champion',icon:'🏆',text:'Éliminer '+champion+', vainqueur de la dernière partie.'});
      const places=history.filter(r=>r.player===hunter&&Number(r.place)>0).map(r=>Number(r.place));
      const best=places.length?Math.min(...places):0;
      if(best>1&&best-1<selected.length)candidates.push({type:'place',max:best-1,title:'Meilleur classement personnel',icon:'📈',text:'Finir au moins '+(best-1)+(best-1===1?'er':'e')+' pour battre votre meilleure place ('+best+'e).'});
      if(selected.length>3)candidates.push({type:'place',max:3,title:'Podium',icon:'🥉',text:'Terminer parmi les trois premiers.'});
      const least=Math.min(...candidates.map(c=>used.get(c.title)||0));
      const pool=candidates.filter(c=>(used.get(c.title)||0)===least);
      const mission=pool[Math.floor(Math.random()*pool.length)];used.set(mission.title,least+1);
      return {hunter,...mission,status:'pending',announced:false};
    });
  }
  function evaluatePersonalBounties(st){
    if(!st.startedAt||!Array.isArray(st.personalBounties))return;
    const players=st.players||[],eliminated=players.filter(p=>p.status==='out'&&p.killer);
    const remaining=players.filter(p=>p.status==='in'||p.status==='winner').length;
    const first=eliminated.slice().sort((a,b)=>Number(a.outAt)-Number(b.outAt))[0];
    for(const contract of st.personalBounties){
      const hunter=players.find(p=>p.name===contract.hunter),target=players.find(p=>p.name===contract.target);
      if(!hunter)continue;
      let success=false,failed=false;
      const type=contract.type||'target';
      if(type==='target'){
        success=!!target&&target.status==='out'&&target.killer===contract.hunter;
        failed=!target||target.status==='out'||hunter.status==='out'||!!st.finishedAt;
      }else if(type==='duel'){
        success=!!target&&target.status==='out'&&(Number(hunter.place)>0?Number(hunter.place)<Number(target.place):hunter.status==='in');
        failed=!target||hunter.status==='out'||!!st.finishedAt;
      }else if(type==='firstKill'){
        success=first?.killer===contract.hunter;failed=!!first||hunter.status==='out'||!!st.finishedAt;
      }else if(type==='kills'){
        const kills=eliminated.filter(p=>p.killer===contract.hunter).length;
        success=kills>=contract.min;failed=hunter.status==='out'||!!st.finishedAt||kills+Math.max(0,remaining-1)<contract.min;
      }else if(type==='place'){
        success=Number(hunter.place)>0?Number(hunter.place)<=contract.max:(hunter.status==='in'&&remaining<=contract.max);
        failed=hunter.status==='out'||!!st.finishedAt;
      }
      contract.status=success?'completed':failed?'failed':'pending';
      if(success&&!contract.announced){
        contract.announced=true;contract.completedAt=Date.now();
        bptLive3QueueAlert(st,contract.icon||'🔥','BOUNTY INDIVIDUEL RÉUSSI · '+contract.hunter,(contract.title||'Cible secrète')+' — '+(contract.text||'Éliminer '+contract.target+' vous-même.'),contract.completedAt,{category:'individual',player:contract.hunter});
      }
    }
  }

  function preGameObjective(entry,selected){
    if(entry.goal)return entry.goal;
    const title=entry.title,text=entry.text||'',mine=(db?.history||[]).filter(r=>r.player===entry.name).sort((a,b)=>Number(a.game)-Number(b.game));
    const numbers=[...text.matchAll(/\d+/g)].map(m=>Number(m[0]));
    const rival=entry.rival||selected.find(n=>n!==entry.name&&text.includes(n));
    if(/REVANCHE|FACE-À-FACE/.test(title))return rival?{type:'rivalKill',rival,...(entry.duelBaseline?{duelBaseline:entry.duelBaseline}:{})}:null;
    if(title==='DÉPASSER UN RIVAL')return rival?{type:'overtake',rival}:null;
    if(/TÊTE|LEADER/.test(title))return {type:'leader'};
    if(/SÉRIE|PREMIÈRE VICTOIRE/.test(title))return {type:'place',max:1};
    if(/PREMIER PODIUM|RÉGULARITÉ|NOUVEAU RENDEZ-VOUS|TENIR LA DISTANCE/.test(title))return {type:'place',max:Math.min(3,selected.length)};
    if(/DUEL FINAL|DÉFI DE LA TABLE/.test(title))return {type:'place',max:2};
    if(title==='FAIRE MIEUX QUE LA DERNIÈRE FOIS')return {type:'place',max:Number(mine[mine.length-1]?.place||0)-1};
    if(title==='SON MEILLEUR RÉSULTAT EN VUE')return {type:'place',max:Math.min(...mine.map(r=>Number(r.place)||999))-1};
    if(title==='UN ACCOMPLISSEMENT À DÉBLOQUER')return {type:'kills',min:numbers[0]||1};
    if(title==='LE RECORD DE LA SAISON')return {type:'kills',min:Math.max(0,...(db?.history||[]).map(r=>Number(r.kills)||0))+1};
    if(title==='SON RECORD DE KILLS')return {type:'kills',min:Math.max(0,...mine.map(r=>Number(r.kills)||0))+1};
    if(title==='UN CAP À FRANCHIR')return {type:'kills',min:1};
    if(title==='OUVRIR LE COMPTEUR')return {type:'firstKill'};
    return null;
  }
  function evaluateLiveObjectives(st){
    if(!st.startedAt||!Array.isArray(st.preGameBriefing))return;
    const names=(st.players||[]).map(p=>p.name);
    const invalid=entry=>entry.title==='UN ACCOMPLISSEMENT À DÉBLOQUER'||(entry.objective?.type==='place'&&entry.objective.max>=names.length)||(/REVANCHE|FACE-À-FACE|DÉPASSER/.test(entry.title||'')&&(!entry.objective?.rival||!names.includes(entry.objective.rival)||entry.objective.rival===entry.name));
    if(st.preGameBriefing.some(invalid)){
      const replacements=buildPreGameBriefing(names);
      st.preGameBriefing=st.preGameBriefing.map(entry=>{
        if(!invalid(entry))return entry;
        st.liveAlerts=(st.liveAlerts||[]).filter(a=>!(a.title==='ENJEU RÉALISÉ · '+entry.name&&String(a.text||'').startsWith(entry.title+' — ')));
        return replacements.find(e=>e.name===entry.name)||entry;
      });
    }
    const players=Array.isArray(st.players)?st.players:[],remaining=players.filter(p=>p.status==='in'||p.status==='winner').length;
    const finished=!!st.finishedAt&&players.every(p=>Number(p.place)>0);
    if(!Array.isArray(st.preGameRanking)&&!st.finishedAt)st.preGameRanking=ranking().map(p=>({name:p.name,points:Number(p.points)||0,gamesCount:Number(p.gamesCount)||0}));
    const base=Array.isArray(st.preGameRanking)?st.preGameRanking:[];
    const totals=new Map(base.map(p=>[p.name,Number(p.points)||0]));
    if(finished)for(const p of players)totals.set(p.name,(totals.get(p.name)||0)+pointsFor(Number(p.place),players.length));
    const eliminated=players.filter(p=>p.status==='out'&&p.killer);
    const first=eliminated.slice().sort((a,b)=>Number(a.outAt)-Number(b.outAt))[0];
    for(const entry of st.preGameBriefing){
      if(!Object.prototype.hasOwnProperty.call(entry,'objective'))entry.objective=preGameObjective(entry,players.map(p=>p.name));
      const objective=entry.objective,p=players.find(p=>p.name===entry.name);if(!objective||!p)continue;
      let achieved=false;
      if(objective.type==='place')achieved=Number(p.place)>0?Number(p.place)<=objective.max:(p.status==='in'&&remaining<=objective.max);
      else if(objective.type==='kills')achieved=eliminated.filter(v=>v.killer===p.name).length>=objective.min;
      else if(objective.type==='rivalKill')achieved=eliminated.some(v=>v.name===objective.rival&&v.killer===p.name);
      else if(objective.type==='firstKill')achieved=first?.killer===p.name;
      else if(objective.type==='overtake')achieved=finished&&(totals.get(p.name)||0)>(totals.get(objective.rival)||0);
      else if(objective.type==='leader')achieved=finished&&base.length>0&&[...totals].every(([name,total])=>name===p.name||(totals.get(p.name)||0)>total);
      else if(objective.type==='championshipPodium')achieved=finished&&[...totals].filter(([name,total])=>name!==p.name&&total>=(totals.get(p.name)||0)).length<3;
      entry.completed=!!achieved;
      if(achieved&&objective.type==='rivalKill'&&objective.duelBaseline){
        const {won,against}=objective.duelBaseline;
        entry.resultText=`${p.name} a éliminé ${objective.rival} : son bilan face à lui passe de ${won}–${against} à ${won+1}–${against} (éliminations réalisées–subies cette saison).`;
      }else delete entry.resultText;
      if(achieved&&!entry.announced){
        entry.announced=true;entry.completedAt=Date.now();
        const ownKills=eliminated.filter(v=>v.killer===p.name).sort((a,b)=>Number(a.outAt)-Number(b.outAt));
        const trigger=objective.type==='rivalKill'?ownKills.find(v=>v.name===objective.rival):objective.type==='kills'?ownKills[objective.min-1]:objective.type==='firstKill'?first:null;
        bptLive3QueueAlert(st,entry.icon||'🎯','ENJEU RÉALISÉ · '+p.name,entry.title+' — '+(entry.resultText||entry.text),entry.completedAt,{category:'objective',player:p.name,actionAt:Number(trigger?.outAt)||0});
      }
    }
  }

  function updateLiveTiming(st){
    if(!st.startedAt)return;
    const players=Array.isArray(st.players)?st.players:[],alive=players.filter(p=>p.status==='in');
    if(!st.finishedAt&&alive.length>2){st.headsUpStartedAt=null;st.headsUpPlayers=[];}
    if(alive.length===2&&!st.finishedAt){
      const pair=alive.map(p=>p.name).sort();
      if(!st.headsUpStartedAt||JSON.stringify(st.headsUpPlayers)!==JSON.stringify(pair)){
        const third=players.find(p=>Number(p.place)===3&&p.status==='out');
        st.headsUpStartedAt=players.length===2?Number(st.startedAt):Number(third?.outAt)||Date.now();
        st.headsUpPlayers=pair;
      }
    }
    if(st.finishedAt){
      st.gameDurationSec=Math.max(0,Math.floor((Number(st.finishedAt)-Number(st.startedAt))/1000));
      st.headsUpDurationSec=st.headsUpStartedAt?Math.max(0,Math.floor((Number(st.finishedAt)-Number(st.headsUpStartedAt))/1000)):null;
    }
  }

  function updateFinalDuel(st){
    const alive=(st.players||[]).filter(p=>p.status==='in');
    if(!st.startedAt||st.finishedAt||alive.length!==2){
      if(!st.finishedAt)delete st.finalDuelEvent;
      return;
    }
    const names=alive.map(p=>p.name),pairKey=JSON.stringify(names.slice().sort());
    if(st.finalDuelEvent?.pairKey===pairKey)return;
    const rows=(Array.isArray(db?.history)?db.history:[]).filter(r=>Number(r.place)>0&&!(Number(r.gameStartedAt)>0&&Number(r.gameStartedAt)===Number(st.startedAt)));
    const ranked=ranking(),gamesFor=name=>new Map(rows.filter(r=>r.player===name).map(r=>[String(r.game),r]));
    const left=gamesFor(names[0]),right=gamesFor(names[1]);
    let common=0,aheadLeft=0,aheadRight=0,headsUp=0,headsLeft=0,headsRight=0;
    for(const [game,a] of left){
      const b=right.get(game);if(!b)continue;
      common++;if(Number(a.place)<Number(b.place))aheadLeft++;else if(Number(b.place)<Number(a.place))aheadRight++;
      if([Number(a.place),Number(b.place)].sort((a,b)=>a-b).join(',')==='1,2'){
        headsUp++;if(Number(a.place)===1)headsLeft++;else headsRight++;
      }
    }
    st.finalDuelEvent={
      id:'DUEL_'+String(st.sessionId||st.startedAt)+'_'+pairKey,pairKey,at:Date.now(),common,headsUp,
      players:names.map((name,i)=>({name,rank:ranked.findIndex(p=>p.name===name)+1,games:gamesFor(name).size,ahead:i?aheadRight:aheadLeft,headsWins:i?headsRight:headsLeft}))
    };
  }

  async function ownerTransaction(mutator){
    const r=await ensureRef();
    let changed=false;
    const session=current?.sessionId||"";
    const res=await r.transaction(server=>{
      if(!server?.active)return server;
      if(String(server.sessionId||"")!==session)return server;
      if(String(server.ownerId||"")!==uid())return server;
      const next=mutator(bptNormalizeLive3Levels(clone(server)));
      if(!next)return server;
      evaluatePersonalBounties(next);
      evaluateLiveObjectives(next);
      updateLiveTiming(next);
      updateFinalDuel(next);
      next.updatedAt=Date.now();
      changed=true;
      return next;
    });
    return changed?res.snapshot.val():null;
  }

  function buildPreGameBriefing(selected){
    const rows=Array.isArray(db?.history)?db.history:[];
    const ranked=ranking(),byName=new Map(ranked.map(p=>[p.name,p]));
    const games=[...new Set(rows.map(r=>Number(r.game)).filter(g=>g>0))].sort((a,b)=>a-b);
    const winners=games.map(g=>rows.find(r=>Number(r.game)===g&&Number(r.place)===1)?.player||'');
    let bestStreak=0,run=0,last='';
    for(const winner of winners){run=winner&&winner===last?run+1:(winner?1:0);bestStreak=Math.max(bestStreak,run);last=winner;}
    const leader=ranked[0],n=selected.length;
    const waitingForFirst=selected.map(name=>({name,rows:rows.filter(r=>r.player===name)})).filter(p=>p.rows.length&&!p.rows.some(r=>Number(r.place)===1)).sort((a,b)=>b.rows.length-a.rows.length||Math.min(...a.rows.map(r=>Number(r.game)))-Math.min(...b.rows.map(r=>Number(r.game)))||a.name.localeCompare(b.name,'fr'))[0]?.name;
    // Teste une répartition possible des places, sans attribuer la dernière
    // place à tous les adversaires simultanément. Les égalités restent prudentes.
    function bestChampionshipRank(name,place){
      const total=Number(byName.get(name)?.points||0)+pointsFor(place,n);
      const absent=ranked.filter(p=>p.name!==name&&!selected.includes(p.name)&&Number(p.points)>=total).length;
      const others=selected.filter(other=>other!==name),slots=Array.from({length:n},(_,i)=>i+1).filter(i=>i!==place),assigned=new Map();
      function match(other,seen){
        for(const slot of slots){
          if(seen.has(slot)||Number(byName.get(other)?.points||0)+pointsFor(slot,n)>=total)continue;
          seen.add(slot);
          if(!assigned.has(slot)||match(assigned.get(slot),seen)){assigned.set(slot,other);return true;}
        }
        return false;
      }
      let below=0;for(const other of others)if(match(other,new Set()))below++;
      return 1+absent+others.length-below;
    }
    const pools=selected.map(name=>{
      const mine=rows.filter(r=>r.player===name).sort((a,b)=>Number(a.game)-Number(b.game));
      const stat=byName.get(name)||{points:0,kills:0,wins:0,podiums:0};
      const candidates=[];
      const offer=(icon,title,text,details={})=>{
        const theme=/REVANCHE|FACE-À-FACE/.test(title)?'rivalry':/RECORD|SÉRIE/.test(title)?'record':/TÊTE|LEADER|CHAMPIONNAT|DÉPASSER|DUEL AU CLASSEMENT/.test(title)?'ranking':/VICTOIRE|PODIUM|RÉGULARITÉ|RÉSULTAT|CAP/.test(title)?'milestone':'other';
        const priority=/REVANCHE/.test(title)?110:/SÉRIE/.test(title)?115:/DÉPASSER/.test(title)?100:/RECORD DE LA SAISON/.test(title)?85:/DÉBLOQUER/.test(title)?80:/TÊTE/.test(title)?70:/FACE-À-FACE/.test(title)?80:/RECORD|CAP|RÉGULARITÉ|LEADER/.test(title)?75:/PREMIÈRE VICTOIRE/.test(title)?65:/DÉFI DE LA TABLE|OUVRIR LE COMPTEUR|TENIR LA DISTANCE|VISER LE DUEL|NOUVEAU RENDEZ-VOUS/.test(title)?25:55;
        candidates.push({name,icon,title,text,theme,priority,...details});
      };
      let streak=0;for(let i=winners.length-1;i>=0&&winners[i]===name;i--)streak++;
      if(streak>0&&streak+1>bestStreak)offer('🔥','LA SÉRIE À PROLONGER',`Après ${streak} victoire${streak>1?'s':''} consécutive${streak>1?'s':''}, une victoire ce soir porterait sa série à ${streak+1}${streak+1>bestStreak?' : un nouveau record cette saison.':streak+1===bestStreak?' : le record de la saison serait égalé.':'.'}`);
      if(leader&&leader.name!==name&&n>=6){
        const possibilities=Array.from({length:Math.min(3,n)},(_,i)=>i+1).filter(place=>bestChampionshipRank(name,place)===1);
        if(possibilities.length){const place=Math.max(...possibilities);offer('👑','LA TÊTE EN VUE',`${name} peut prendre la tête du championnat ${place===3?'en finissant sur le podium':place===2?'en finissant dans les deux premiers':'en gagnant ce soir'}, selon les résultats des autres joueurs.`,{goal:{type:'leader'},priority:105});}
      }
      if(n>=6&&ranked.length>=3&&(!byName.has(name)||Number(stat.rank||ranked.findIndex(p=>p.name===name)+1)>3)){
        const possibilities=Array.from({length:Math.min(3,n)},(_,i)=>i+1).filter(place=>bestChampionshipRank(name,place)<=3);
        if(possibilities.length){const place=Math.max(...possibilities);offer('🥉','LE PODIUM DU CHAMPIONNAT',`${name} peut entrer dans les trois premiers du championnat ${place===3?'en finissant sur le podium ce soir':place===2?'en finissant dans les deux premiers ce soir':'en gagnant ce soir'}, selon les résultats de ses concurrents.`,{goal:{type:'championshipPodium'},priority:100});}
      }
      if(n>=6){
        const myPoints=Number(stat.points||0),winPoints=pointsFor(1,n);
        const target=ranked.filter(p=>p.name!==name&&selected.includes(p.name)&&Number(p.points)>myPoints).sort((a,b)=>Number(a.points)-Number(b.points)).find(p=>myPoints+winPoints>Number(p.points)+pointsFor(n,n));
        if(target){const gap=Number(target.points)-myPoints;const guaranteed=myPoints+winPoints>Number(target.points)+Math.max(...Array.from({length:n-1},(_,i)=>pointsFor(i+2,n)));offer('⚔️','DÉPASSER UN RIVAL',`À ${gap} point${gap>1?'s':''} de ${target.name}, une victoire ce soir ${guaranteed?'lui permettrait de le dépasser au classement.':`peut lui permettre de le dépasser au classement, selon la place de ${target.name}.`}`);}
      }
      const seasonKillRecord=Math.max(0,...rows.map(r=>Number(r.kills)||0));
      if(seasonKillRecord>0&&seasonKillRecord+1<=n-1)offer('💥','LE RECORD DE LA SAISON',`Le record de kills sur une partie cette saison est de ${seasonKillRecord}. Avec ${seasonKillRecord+1} éliminations ce soir, il établirait un nouveau record.`);
      const latest=mine[mine.length-1];
      if(latest?.killer&&latest.killer!==name&&selected.includes(latest.killer)){
        const rival=latest.killer,won=rows.filter(r=>r.player===rival&&r.killer===name).length,against=rows.filter(r=>r.player===name&&r.killer===rival).length;
        offer('⚔️','L’HEURE DE LA REVANCHE',`${name} peut éliminer ${rival}, son bourreau lors de sa dernière participation. Une revanche ferait passer leur bilan de ${won}–${against} à ${won+1}–${against} (éliminations réalisées–subies cette saison).`,{rival,duelBaseline:{won,against}});
      }
      const kills=Number(stat.kills||0);
      if(kills>0&&(kills+1)%10===0)offer('🎯','UN CAP À FRANCHIR',`Avec ${kills} éliminations cette saison, un kill lui permettrait d’atteindre le cap des ${kills+1}.`);
      let podiumRun=0;for(let i=mine.length-1;i>=0&&Number(mine[i].place)<=3&&Number(mine[i].place)>0;i--)podiumRun++;
      if(podiumRun>=2)offer('🏅','LA RÉGULARITÉ',`${podiumRun} podiums sur ses ${podiumRun} dernières participations. Un podium ce soir prolongerait sa série.`);
      const places=mine.map(r=>Number(r.place)).filter(p=>p>0);
      const podiums=places.filter(p=>p<=3).length;
      const best=places.length?Math.min(...places):0;
      if(mine.length&&podiums===0)offer('🏅','LE PREMIER PODIUM',`Après ${mine.length} participations sans podium cette saison, une place dans les trois premiers ouvrirait son palmarès.`);
      if(latest&&Number(latest.place)>1)offer('📈','FAIRE MIEUX QUE LA DERNIÈRE FOIS',`Lors de sa dernière participation, il a terminé ${Number(latest.place)}e. Une meilleure place marquerait une progression ce soir.`);
      if(best>1)offer('🚀','SON MEILLEUR RÉSULTAT EN VUE',`Son meilleur classement cette saison est une ${best}e place. Finir dans les ${best-1} premiers lui permettrait de battre sa meilleure performance.`,{theme:'record'});
      const bestKills=Math.max(0,...mine.map(r=>Number(r.kills)||0));
      if(mine.length&&bestKills>0&&bestKills<n-1)offer('🎯','SON RECORD DE KILLS',`Son record personnel cette saison est de ${bestKills} kill${bestKills>1?'s':''} dans une partie. Avec ${bestKills+1}, il établirait une nouvelle marque.`);
      const rivals=selected.filter(other=>other!==name).map(other=>({name:other,against:rows.filter(r=>r.player===name&&r.killer===other).length,won:rows.filter(r=>r.player===other&&r.killer===name).length})).filter(r=>r.against+r.won>0).sort((a,b)=>Number(b.won===0&&b.against>0)-Number(a.won===0&&a.against>0)||(b.against-b.won)-(a.against-a.won)||(b.against+b.won)-(a.against+a.won));
      if(rivals.length){const rival=rivals[0];offer('⚔️','LE FACE-À-FACE',`${rival.won===0&&rival.against>0?`${name} peut enfin éliminer ${rival.name}, qui l’a déjà éliminé ${rival.against} fois cette saison.`:`${name} peut améliorer son face-à-face avec ${rival.name} en l’éliminant lui-même ce soir.`} Leur bilan passerait de ${rival.won}–${rival.against} à ${rival.won+1}–${rival.against} (éliminations réalisées–subies).`,{rival:rival.name,duelBaseline:{won:rival.won,against:rival.against}});}
      const lastGame=games[games.length-1]||0;
      if(latest&&Number(latest.game)<lastGame)offer('↩️','LE RETOUR À LA TABLE',`Absent de la dernière partie enregistrée, il retrouve la table ce soir et peut relancer sa saison.`);
      if(mine.length&&(mine.length+1)%5===0)offer('🎉','UNE PARTICIPATION SYMBOLIQUE',`Ce soir sera sa ${mine.length+1}e participation cette saison : une occasion de marquer ce cap par un beau résultat.`);
      if(!mine.length)offer('✨','UNE NOUVELLE HISTOIRE', 'Première participation enregistrée cette saison : tout reste à écrire.');
      if(name===waitingForFirst)offer('🏆','LA PREMIÈRE VICTOIRE',`Après ${mine.length} participation${mine.length>1?'s':''} sans victoire cette saison, il est celui des joueurs présents qui attend son premier succès depuis le plus de parties jouées.`);
      if(leader?.name===name)offer('👑','LE LEADER À DÉFIER',`En tête du championnat avec ${Number(stat.points||0)} points, il défend sa place ce soir.`);
      offer('💪','UN NOUVEAU RENDEZ-VOUS',`${mine.filter(r=>Number(r.place)<=3&&Number(r.place)>0).length} podium${mine.filter(r=>Number(r.place)<=3&&Number(r.place)>0).length>1?'s':''} en ${mine.length} participations cette saison : un nouveau podium enrichirait son palmarès.`);
      offer('🎲','LE DÉFI DE LA TABLE',`Face à ${n-1} adversaires sélectionnés ce soir, l’objectif est de rester en jeu jusqu’au duel final.`);
      offer('💥','OUVRIR LE COMPTEUR', 'Réaliser la première élimination de la soirée : un objectif à saisir dès le début de la partie.');
      offer('🛡️','TENIR LA DISTANCE', 'Atteindre les trois derniers joueurs en jeu : le défi de ce soir.');
      offer('🏁','VISER LE DUEL FINAL', 'Se hisser parmi les deux derniers joueurs et jouer la victoire en tête-à-tête.');
      const allowed=candidates.filter(c=>{const objective=preGameObjective(c,selected);if(/REVANCHE|FACE-À-FACE|DÉPASSER/.test(c.title)&&(!objective?.rival||!selected.includes(objective.rival)||objective.rival===name))return false;return !objective||objective.type!=='place'||(objective.max>0&&objective.max<n);});
      return allowed;
    });
    // Réserve des joueurs différents aux trois familles lorsqu'elles existent.
    // Le choix global évite de consommer trop tôt le seul joueur ayant un enjeu
    // de classement ou une véritable rivalité.
    const themes=['rivalry','ranking','record'];
    let states=new Map([[0,{score:0,picks:new Map()}]]);
    pools.forEach((pool,index)=>{
      const next=new Map(states);
      for(const [mask,state] of states)for(let t=0;t<themes.length;t++){
        if(mask&(1<<t))continue;
        const choices=pool.filter(c=>c.theme===themes[t]&&c.title!=='LE LEADER À DÉFIER');if(!choices.length)continue;
        const candidate=choices.reduce((a,b)=>b.priority>a.priority?b:a),key=mask|(1<<t),score=state.score+candidate.priority;
        if(!next.has(key)||score>next.get(key).score){const picks=new Map(state.picks);picks.set(index,candidate);next.set(key,{score,picks});}
      }
      states=next;
    });
    const bits=mask=>themes.filter((_,i)=>mask&(1<<i)).length;
    const [,best]=[...states].reduce((a,b)=>bits(b[0])>bits(a[0])||(bits(b[0])===bits(a[0])&&b[1].score>a[1].score)?b:a);
    const picks=[...best.picks.values()];
    for(const theme of themes){
      if(picks.some(c=>c.theme===theme))continue;
      const eligible=pools.flat().filter(c=>c.theme===theme&&c.title!=='LE LEADER À DÉFIER');
      if(eligible.length)picks.push(eligible.reduce((a,b)=>b.priority>a.priority?b:a));
    }
    return picks.sort((a,b)=>themes.indexOf(a.theme)-themes.indexOf(b.theme)).map(chosen=>{
      const {priority,...entry}=chosen;return {...entry,objective:preGameObjective(entry,selected),completed:false};
    });
  }

  function buildPredictionOdds(selected){
    if(window.BPTBetting?.buildOdds)return window.BPTBetting.buildOdds(selected,Array.isArray(db?.history)?db.history:[]);
    const names=[...new Set((selected||[]).map(x=>String(x||'').trim()).filter(Boolean))];
    const rows=Array.isArray(db?.history)?db.history:[];
    const games=new Map();
    rows.forEach(r=>{const g=String(r.game||'');if(!g)return;(games.get(g)||games.set(g,[]).get(g)).push(r);});
    const stats=new Map(names.map(name=>[name,{games:0,wins:0,firstOut:0}]));
    for(const group of games.values()){
      const n=group.length;if(!n)continue;
      const first=Math.max(...group.map(r=>Number(r.place)||0));
      group.forEach(r=>{const s=stats.get(r.player);if(!s)return;s.games++;if(Number(r.place)===1)s.wins++;if(Number(r.place)===first)s.firstOut++;});
    }
    const make=(field,prior)=>{
      const raw=names.map(name=>{const s=stats.get(name),g=s.games;return {name,score:((s[field]+prior)/(g+prior*names.length))};});
      const total=raw.reduce((a,x)=>a+x.score,0)||1;
      return Object.fromEntries(raw.map(x=>[x.name,Math.max(1.05,Math.min(20,Math.round((total/x.score)*10)/10))]));
    };
    return {winner:make('wins',0.5),firstEliminated:make('firstOut',0.5)};
  }

  async function getWritablePredictionContext(){
    if(!isActive()||!current?.preGamePending||current?.startedAt)return null;
    const rawName=String(liveIdentityName()||'').trim();
    const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').trim();
    const r=await ensureRef();
    const snap=await r.once('value');
    const server=snap.val();
    if(!server?.active||server.sessionId!==current.sessionId||server.startedAt||!server.preGamePending)return null;
    const players=(server.players||[]).map(p=>String(p?.name||'').trim()).filter(Boolean);
    const name=players.find(p=>norm(p)===norm(rawName))||'';
    if(!name)return null;
    return {r,server,players,name,norm};
  }

  async function setLivePrediction(type,pick){
    const kind=type==='winner'?'winner':'firstEliminated',choice=String(pick||'').trim();
    const ctx=await getWritablePredictionContext();
    if(!ctx)return false;
    const {r,server,players,name,norm}=ctx;
    if(choice && !players.some(p=>norm(p)===norm(choice)))return false;
    const result=await r.child('betting/bets').transaction(bets=>{
      bets=(bets&&typeof bets==='object')?bets:{};
      const previous=bets[name]||{};
      bets[name]={...previous,[kind]:choice,confirmed:false,updatedAt:Date.now()};
      return bets;
    });
    if(!result.committed)return false;
    await r.child('updatedAt').set(Date.now());
    const latest=await r.once('value');
    current=bptNormalizeLive3Levels(latest.val());
    return !!current?.betting?.bets?.[name] && String(current.betting.bets[name][kind]||'')===choice && current.betting.bets[name].confirmed!==true;
  }

  async function confirmLivePredictions(){
    const ctx=await getWritablePredictionContext();
    if(!ctx)return false;
    const {r,name}=ctx;
    const result=await r.child('betting/bets').transaction(bets=>{
      bets=(bets&&typeof bets==='object')?bets:{};
      const previous=bets[name]||{};
      bets[name]={winner:String(previous.winner||''),firstEliminated:String(previous.firstEliminated||''),confirmed:true,updatedAt:Date.now()};
      return bets;
    });
    if(!result.committed)return false;
    await r.child('updatedAt').set(Date.now());
    const latest=await r.once('value');
    current=bptNormalizeLive3Levels(latest.val());
    return current?.betting?.bets?.[name]?.confirmed===true;
  }

  async function createLive(){
    if(!liveIdentityConfirmed || !liveIdentityName()){
      openSpectatorIdentity(true);
      return;
    }

    const location=String($3("live3Location")?.value||liveIdentityName()||"").trim();
    const selected=[...document.querySelectorAll('#live3PlayerPicker input[type="checkbox"]:checked')].map(x=>x.value);
    if(!location){alert("Indiquez le nom / lieu de la partie.");return;}
    if(selected.length<2){alert("Sélectionnez au moins 2 joueurs.");return;}

    // Tout participant au Live doit être présent et actif dans Paramètres > Joueurs.
    let directoryChanged=false;
    for(const name of selected){
      let p=(db?.players||[]).find(x=>String(x?.name||"").trim().localeCompare(String(name).trim(),"fr",{sensitivity:"base"})===0);
      if(!p){ db.players.push({name:String(name).trim(),nickname:"",active:true}); directoryChanged=true; }
      else if(p.active!==true){ p.active=true; directoryChanged=true; }
    }
    if(directoryChanged){
      saveDB();
      try{ window.renderAll?.(); }catch(_e){}
      try{ window.bptNotifySettingsPlayers?.(); }catch(_e){}
    }

    $3("live3CreateBtn").disabled=true;
    $3("live3CreateStatus").textContent="Création…";

    try{
      const r=await ensureRef();
      let created=false;
      const now=Date.now();
      const bountyMode=Math.random()<0.5?"individual":"common";
      const state={
        version:3,active:true,sessionId:"L3_"+now.toString(36)+"_"+Math.random().toString(36).slice(2,7),
        ownerId:uid(),ownerLabel:liveIdentityName()||deviceLabel(),createdAt:now,updatedAt:now,
        location,date:$3("live3Date").value||new Date().toISOString().slice(0,10),
        startStack:Math.max(100,Number($3("live3Stack").value)||20000),
        buyIn:Math.max(0,Number($3("live3BuyIn").value)||0),
        running:false,startedAt:null,runStartedAt:null,deadline:null,elapsedSec:0,
        levelIndex:0,
        targetHours:Math.max(0.5,Number($3("live3TargetHours").value)||4),
        levels:buildLevels(
          Math.max(0.5,Number($3("live3TargetHours").value)||4),
          selected.length,
          Math.max(100,Number($3("live3Stack").value)||20000)
        ),
        remainingSec:buildLevels(
          Math.max(0.5,Number($3("live3TargetHours").value)||4),
          selected.length,
          Math.max(100,Number($3("live3Stack").value)||20000)
        )[0].durationSec,
        players:selected.map(name=>({name,status:"in",place:null,killer:"",outAt:null,outLevel:null,outTime:"",outElapsedSec:null})),
        bountyMode,
        mysteryBountyName:bountyMode==="common"?selected[Math.floor(Math.random()*selected.length)]:"",
        mysteryBountyRevealed:false,mysteryBountyHunter:"",mysteryBountyEvent:null,liveAlerts:[],
        personalBounties:bountyMode==="individual"?drawPersonalBounties(selected):[],
        preGameBriefing:buildPreGameBriefing(selected),preGameRanking:ranking().map(p=>({name:p.name,points:Number(p.points)||0,gamesCount:Number(p.gamesCount)||0})),
        betting:{stakeCents:50,odds:buildPredictionOdds(selected),bets:{}},preGamePending:true,
        viewers:{},takeoverRequest:null,chat:[],paceAdaptive:$3("live3StructureMode")?.value==="adaptive"
      };
      await r.transaction(server=>{
        if(server?.active)return server;
        created=true;
        return state;
      });
      if(!created){
        alert("Un Live est déjà actif. Ouvrez l'onglet Live pour le suivre.");
      }else{
        live3TemporaryPlayers.clear();
        if($3("live3NewPlayerName"))$3("live3NewPlayerName").value="";
      }
    }catch(e){
      console.error(e);
      alert("Impossible de créer le Live : "+(e?.message||e));
    }finally{
      $3("live3CreateBtn").disabled=false;
      $3("live3CreateStatus").textContent="";
    }
  }

  async function returnToPreGameSettings(){
    if(!isOwner()||current?.startedAt||!(current?.preGamePending||current?.bountyModeRevealPending))return;
    const draft=clone(current),r=await ensureRef();
    const result=await r.transaction(server=>{
      if(!server?.active||server.sessionId!==draft.sessionId||String(server.ownerId)!==uid()||server.startedAt||!(server.preGamePending||server.bountyModeRevealPending))return;
      return {...server,active:false,preGamePending:false,bountyModeRevealPending:false,updatedAt:Date.now()};
    });
    if(!result.committed){alert('La partie a déjà été lancée ou sa gestion a changé.');return;}
    const selected=new Set((draft.players||[]).map(p=>p.name));
    for(const name of selected){if(!(db?.players||[]).some(p=>p.name===name&&p.active===true))live3TemporaryPlayers.add(name);}
    const values={live3Location:draft.location,live3Date:draft.date,live3Stack:draft.startStack,live3BuyIn:draft.buyIn,live3TargetHours:draft.targetHours,live3StructureMode:draft.paceAdaptive===true?"adaptive":"classic"};
    for(const [id,value] of Object.entries(values)){const field=$3(id);if(field)field.value=value??'';}
    current=result.snapshot.val();
    prepWizardStep=1;
    await closeFullscreen();render();setPrepWizardStep(1);renderPrepPlayers();
    document.querySelectorAll('#live3PlayerPicker input[type="checkbox"]').forEach(cb=>{cb.checked=selected.has(cb.value)});
    updateMobilePlayerSelectionCount();
  }

  async function returnToBetting(){
    if(!isOwner()||current?.startedAt||!current?.bountyModeRevealPending)return;
    await ownerTransaction(s=>{
      if(!s.bountyModeRevealPending||s.startedAt)return null;
      s.bountyModeRevealPending=false;s.bountyModeRevealAt=0;s.preGamePending=true;s.updatedAt=Date.now();
      return s;
    });
  }

  async function launchPreGame(){
    if(!isOwner())return;
    return ownerTransaction(s=>{
      if(!s.preGamePending||s.startedAt||s.bountyModeRevealPending)return null;
      s.preGamePending=false;s.bountyModeRevealPending=true;s.bountyModeRevealAt=Date.now();
      s.running=false;s.runStartedAt=null;s.deadline=null;
      return s;
    });
  }
  async function startAfterBountyReveal(){
    if(!isOwner())return;
    return ownerTransaction(s=>{
      const now=Date.now();
      if(!s.bountyModeRevealPending||s.startedAt||now-Number(s.bountyModeRevealAt||now)<1600)return null;
      s.bountyModeRevealPending=false;s.preGamePending=false;
      s.startedAt=now;s.running=true;s.runStartedAt=now;
      s.deadline=now+Math.max(0,Number(s.remainingSec)||0)*1000;
      return s;
    });
  }
  async function toggleStartPause(launchOnly=false){
    if(!isOwner())return;
    await ownerTransaction(s=>{
      if(s.bountyModeRevealPending)return null;
      if(launchOnly&&(!s.preGamePending||s.startedAt))return s;
      const now=Date.now();
      if(s.running){
        const rem=Math.max(0,Math.ceil((Number(s.deadline||now)-now)/1000));
        s.remainingSec=rem;
        s.elapsedSec=Number(s.elapsedSec||0)+Math.max(0,Math.floor((now-Number(s.runStartedAt||now))/1000));
        s.running=false;s.runStartedAt=null;s.deadline=null;
      }else{
        const rem=Math.max(0,Number(s.remainingSec)||0);
        s.running=true;
        if(!s.startedAt){
          s.startedAt=now;
          s.bountyModeRevealAt=now;
        }
        s.preGamePending=false;
        s.runStartedAt=now;
        s.deadline=now+rem*1000;
      }
      return s;
    });
  }

  async function applyBlindDuration(){
    if(!isOwner())return;

    const input=$3("live3BlindDurationInput");
    const minutes=Math.round(Number(input?.value)||0);

    if(minutes<5 || minutes>60){
      alert("Choisissez une durée comprise entre 5 et 60 minutes.");
      input?.focus();
      return;
    }

    await ownerTransaction(s=>{
      const idx=Math.max(0,Number(s.levelIndex)||0);
      const levels=Array.isArray(s.levels)?s.levels:[];
      if(!levels.length)return s;

      const now=Date.now();
      const oldDuration=Math.max(60,Number(levels[idx]?.durationSec)||60);
      const newDuration=minutes*60;

      let currentRemaining=Number(s.remainingSec||oldDuration);
      if(s.running){
        currentRemaining=Math.max(
          0,
          Math.ceil((Number(s.deadline||now)-now)/1000)
        );
      }

      const elapsedInCurrent=Math.max(0,oldDuration-currentRemaining);
      const progress=Math.max(0,Math.min(1,elapsedInCurrent/oldDuration));
      const newRemaining=Math.max(0,Math.round(newDuration*(1-progress)));

      for(let i=idx;i<levels.length;i++){
        levels[i].durationSec=newDuration;
      }

      s.levels=levels;
      s.remainingSec=newRemaining;

      if(s.running){
        if(s.runStartedAt)s.elapsedSec=Number(s.elapsedSec||0)+Math.max(0,Math.floor((now-Number(s.runStartedAt))/1000));
        s.runStartedAt=now;
        s.deadline=now+newRemaining*1000;
      }else{
        s.runStartedAt=null;
        s.deadline=null;
      }

      return s;
    });
  }

  async function adjustMinute(delta){
    if(!isOwner())return;
    await ownerTransaction(s=>{
      const now=Date.now();
      if(s.running){
        const rem=Math.max(0,Math.ceil((Number(s.deadline||now)-now)/1000)+delta);
        if(s.runStartedAt)s.elapsedSec=Number(s.elapsedSec||0)+Math.max(0,Math.floor((now-Number(s.runStartedAt))/1000));
        s.deadline=now+rem*1000;
        s.runStartedAt=now;
      }else{
        s.remainingSec=Math.max(0,Number(s.remainingSec||0)+delta);
      }
      return s;
    });
  }

  async function changeLevel(delta,auto=false){
    if(!isOwner())return;
    await ownerTransaction(s=>{
      const oldIdx=Math.max(0,Number(s.levelIndex)||0);
      const requestedIdx=Math.max(0,oldIdx+delta);
      bptEnsureLevelExists(s, requestedIdx);
      const idx=Math.max(0,requestedIdx);
      if(idx===oldIdx&&!auto)return s;
      const now=Date.now();
      if(s.running&&s.runStartedAt){
        s.elapsedSec=Number(s.elapsedSec||0)+Math.max(0,Math.floor((now-Number(s.runStartedAt))/1000));
      }
      s.levelIndex=idx;
      s.remainingSec=Math.max(1,Number(s.levels[idx]?.durationSec||900));
      if(s.running){
        s.runStartedAt=now;
        s.deadline=now+s.remainingSec*1000;
      }else{
        s.runStartedAt=null;s.deadline=null;
      }
      return s;
    });
  }

  async function autoAdvanceIfNeeded(){
    if(advancing||!isOwner()||!current?.running||remainingSeconds()>0)return;
    // Le passage de niveau est toujours calé sur le deadline absolu (et non sur l'heure du
    // ticker) : après une veille, tous les niveaux écoulés sont rattrapés, chacun avec sa
    // propre durée (durée des blinds modifiée, mode adaptatif, niveaux ajoutés).
    if(Number(current.deadline)>0)return catchUpTimerAfterWake();
    advancing=true;
    try{await changeLevel(1,true);}finally{advancing=false;}
  }

  // Les minuteurs JavaScript sont suspendus ou fortement ralentis par iOS/Android
  // lorsque le téléphone se met en veille. Le deadline Firebase reste absolu :
  // au réveil, on rattrape donc tous les niveaux réellement écoulés d'un coup.
  async function catchUpTimerAfterWake(){
    if(advancing||!isOwner()||!current?.running||!current?.deadline)return;
    if(Date.now()<Number(current.deadline))return;
    advancing=true;
    try{
      await ownerTransaction(s=>{
        const now=Date.now();let guard=0;
        while(s.running&&Number(s.deadline||0)>0&&now>=Number(s.deadline||0)&&guard<100){
          const transition=Number(s.deadline),started=Number(s.runStartedAt||transition);
          s.elapsedSec=Number(s.elapsedSec||0)+Math.max(0,Math.floor((transition-started)/1000));
          const nextIndex=Math.max(0,Number(s.levelIndex)||0)+1;
          bptEnsureLevelExists(s,nextIndex);
          s.levelIndex=nextIndex;
          s.remainingSec=Math.max(1,Number(s.levels?.[nextIndex]?.durationSec||900));
          s.runStartedAt=transition;
          s.deadline=transition+s.remainingSec*1000;
          guard++;
        }
        return guard?s:null; // déjà à jour côté serveur : aucune écriture
      });
    }finally{advancing=false;}
  }


  function refreshEliminationLists(){
    const victimSelect=$3("live3ElimPlayer");
    const killerSelect=$3("live3ElimKiller");
    if(!victimSelect||!killerSelect)return;

    const alive=alivePlayers();
    const selectedVictim=String(victimSelect.value||"");

    victimSelect.innerHTML=
      '<option value="">— Choisir le joueur éliminé —</option>'+
      alive.map(p=>`<option value="${escapeAttr(p.name)}">${escapeHtml(p.name)}</option>`).join("");

    // Aucun joueur n'est présélectionné à l'ouverture.
    if(selectedVictim && alive.some(p=>p.name===selectedVictim)){
      victimSelect.value=selectedVictim;
    }else{
      victimSelect.value="";
    }

    const victim=String(victimSelect.value||"");
    const killers=alive.filter(p=>!victim || p.name!==victim);

    killerSelect.innerHTML=
      '<option value="">— Choisir l’éliminateur —</option>'+
      killers.map(p=>`<option value="${escapeAttr(p.name)}">${escapeHtml(p.name)}</option>`).join("");

    // Toujours forcer un choix explicite de l'éliminateur.
    killerSelect.value="";
  }

  function openElim(){
    if(!isOwner())return;
    const victim=$3("live3ElimPlayer");
    const killer=$3("live3ElimKiller");
    if(victim)victim.value="";
    if(killer)killer.value="";
    refreshEliminationLists();
    $3("live3ElimModal").classList.add("open");
    $3("live3ElimModal").setAttribute("aria-hidden","false");
  }

  function bptLive3HistoricalMaxKills(){
    return Math.max(0,...(Array.isArray(db?.history)?db.history:[]).map(r=>Number(r.kills)||0));
  }
  function bptLive3HistoricalPlayerMaxKills(name){
    return Math.max(0,...(Array.isArray(db?.history)?db.history:[]).filter(r=>r.player===name).map(r=>Number(r.kills)||0));
  }
  function bptLive3QueueAlert(s,icon,title,text,baseAt,details={}){
    const now=Number(baseAt)||Date.now();
    const list=Array.isArray(s.liveAlerts)?s.liveAlerts.slice():[];
    const at=now;
    list.push({id:'A_'+at+'_'+Math.random().toString(36).slice(2,6),icon,title,text,at,until:at+1200000,...details});
    s.liveAlerts=list;
  }

  function bptLive3QueueSuccessfulBetAlerts(s,type,actual,at){
    const betting=s?.betting;if(!betting||!actual)return;
    const stake=Math.max(1,Number(betting.stakeCents)||50),bets=betting.bets||{},odds=betting.odds||{};
    const existing=new Set((s.liveAlerts||[]).filter(a=>a.category==='betting').map(a=>a.betKey));
    Object.entries(bets).forEach(([player,bet])=>{
      if(!bet?.confirmed||String(bet[type]||'')!==String(actual))return;
      const betKey=`${type}|${player}|${actual}`;if(existing.has(betKey))return;
      const odd=Number(odds?.[type]?.[actual])||1.05,gross=Math.round(stake*odd),gain=(gross/100).toFixed(2).replace('.',',');
      bptLive3QueueAlert(s,'🎲','PARI RÉUSSI · '+player,`${player} gagne ${gain} € sur son pari ${type==='winner'?'vainqueur':'1er éliminé'}.`,at,{category:'betting',player,betKey});
      existing.add(betKey);
    });
  }

  async function eliminate(){
    if(!isOwner())return;

    const victim=String($3("live3ElimPlayer").value||"");
    const killer=String($3("live3ElimKiller").value||"");

    if(!victim){
      alert("Choisissez le joueur éliminé.");
      return;
    }
    if(!killer){
      alert("Choisissez le joueur qui a réalisé l’élimination.");
      return;
    }

    const beforeAlive=alivePlayers();
    if(!beforeAlive.some(p=>p.name===killer && p.name!==victim)){
      alert("L’éliminateur doit être un joueur encore en jeu.");
      refreshEliminationLists();
      return;
    }

    const previousGameKillRecord=bptLive3HistoricalMaxKills();
    const previousPlayerMaxKills=bptLive3HistoricalPlayerMaxKills(killer);
    const killsBefore=(current?.players||[]).filter(p=>String(p.killer||'')===killer).length;
    const killsAfter=killsBefore+1;

    const updated=await ownerTransaction(s=>{
      const alive=(s.players||[]).filter(p=>p.status==="in");
      const victimPlayer=alive.find(p=>p.name===victim);
      if(!victimPlayer)return s;

      const killerPlayer=alive.find(p=>p.name===killer && p.name!==victim);
      if(!killerPlayer)return s;

      victimPlayer.status="out";
      victimPlayer.place=alive.length;
      victimPlayer.killer=killerPlayer.name;
      const elimNow=Date.now();
      victimPlayer.outAt=elimNow;
      victimPlayer.outLevel=(Number(s.levelIndex)||0)+1;
      victimPlayer.outTime=new Date(elimNow).toLocaleTimeString("fr-FR",{timeZone:"Europe/Paris"});
      victimPlayer.outActiveElapsedSec=Math.max(
        1,
        Math.round(
          Number(s.elapsedSec||0) +
          (s.running && s.runStartedAt
            ? Math.max(0,(elimNow-Number(s.runStartedAt||elimNow))/1000)
            : 0)
        )
      );
      victimPlayer.outElapsedSec=Math.max(0,Math.floor((elimNow-Number(s.startedAt||elimNow))/1000));

      // Le premier pari gagnant est annoncé immédiatement après la première élimination.
      if((s.players||[]).filter(p=>p.status==='out').length===1){
        bptLive3QueueSuccessfulBetAlerts(s,'firstEliminated',victim,elimNow);
      }

      // Bounty mystère : uniquement un participant de cette partie, jamais révélé avant sa sortie.
      if(!s.mysteryBountyRevealed && String(s.mysteryBountyName||'')===victim){
        s.mysteryBountyRevealed=true;
        s.mysteryBountyHunter=killer;
        victimPlayer.wasMysteryBounty=true;
        killerPlayer.bountyHunter=true;
        s.mysteryBountyEvent={id:'BOUNTY_'+elimNow+'_'+Math.random().toString(36).slice(2),at:elimNow,kind:'eliminated',player:victim,hunter:killer};

      }

      // Accomplissements de kills réellement débloqués pendant la partie.
      let unlocked=null;
      if(killsAfter>=5 && previousPlayerMaxKills<5) unlocked={icon:'☠️',name:'Massacre',text:`${killer} atteint 5 kills dans la partie`};
      else if(killsAfter>=3 && previousPlayerMaxKills<3) unlocked={icon:'🔫',name:'Serial Killer',text:`${killer} atteint 3 kills dans la partie`};
      else if(killsAfter>=1 && previousPlayerMaxKills<1) unlocked={icon:'💥',name:'Premier sang',text:`${killer} réalise son premier kill`};
      if(unlocked)bptLive3QueueAlert(s,unlocked.icon,'NOUVEL ACCOMPLISSEMENT · '+unlocked.name,unlocked.text,elimNow,{category:'achievement',player:killer,actionAt:elimNow});

      // Record live : meilleur nombre de kills jamais réalisé sur une partie.
      if(killsAfter>previousGameKillRecord){
        bptLive3QueueAlert(s,'🏆','NOUVEAU RECORD',`${killer} porte le record à ${killsAfter} kill${killsAfter>1?'s':''} sur une partie`,elimNow);
      }

      const survivors=(s.players||[]).filter(x=>x.status==="in");
      if(survivors.length===1){
        const now=Date.now();

        survivors[0].status="winner";
        survivors[0].place=1;
        survivors[0].killer="";
        survivors[0].outAt=null;
        survivors[0].outLevel=null;
        survivors[0].outTime="";

        // Figer la durée réelle complète avant d'arrêter le chrono.
        if(s.running && s.runStartedAt){
          s.elapsedSec=Math.max(
            0,
            Number(s.elapsedSec||0) +
            Math.floor((now-Number(s.runStartedAt||now))/1000)
          );
        }else{
          s.elapsedSec=Math.max(0,Number(s.elapsedSec)||0);
        }

        s.running=false;
        s.runStartedAt=null;
        s.deadline=null;
        s.remainingSec=Math.max(0,Number(s.remainingSec)||0);
        s.winnerName=survivors[0].name;
        s.finishedAt=now;
        s.finishReason="winner";
        bptLive3QueueSuccessfulBetAlerts(s,'winner',survivors[0].name,now);
        if(!s.mysteryBountyRevealed && String(s.mysteryBountyName||'')===survivors[0].name){
          s.mysteryBountyRevealed=true;
          survivors[0].wasMysteryBounty=true;
          s.mysteryBountyEvent={id:'BOUNTY_'+now+'_'+Math.random().toString(36).slice(2),at:now,kind:'winner',player:survivors[0].name,hunter:''};

        }
      }

      return s;
    });

    closeElim();

    if(updated && (updated.players||[]).filter(p=>p.status==="in").length>1){
      // Réévaluation immédiate après chaque élimination, une fois la mi-parcours atteinte.
      setTimeout(()=>live3MaybeCheckPace({afterElimination:true}),250);
    }

    // Dès qu'un vainqueur unique existe, le Live est terminé,
    // résumé puis publication dans l'historique du championnat.
    if(updated && (updated.players||[]).filter(p=>p.status==="winner" || Number(p.place)===1).length===1){
      await finalizeWinnerLive(updated);
    }
  }

  function lastEliminatedPlayer(state=current){
    const out=(state?.players||[])
      .filter(p=>p && p.status==="out" && Number(p.outAt)>0)
      .sort((a,b)=>Number(b.outAt||0)-Number(a.outAt||0));
    return out[0]||null;
  }

  function updateUndoEliminationButton(){
    const btn=$3("live3UndoElimBtn");
    const hint=$3("live3UndoElimHint");
    if(!btn)return;

    const last=lastEliminatedPlayer();
    const allowed=isOwner() && isActive() && !!last && !current?.publishedToHistory;

    btn.disabled=!allowed;

    if(last && allowed){
      btn.textContent=`↶ Annuler la sortie de ${last.name}`;
      if(hint)hint.textContent=`Dernière sortie enregistrée : ${last.name}.`;
    }else if(current?.publishedToHistory){
      btn.textContent="↶ Partie déjà publiée";
      if(hint)hint.textContent="La partie est déjà publiée dans l’historique.";
    }else{
      btn.textContent="↶ Annuler la dernière élimination";
      if(hint)hint.textContent="Aucune élimination à annuler.";
    }
  }

  async function undoLastElimination(){
    if(!isOwner() || !isActive())return;
    if(current?.publishedToHistory){
      alert("Cette partie est déjà publiée dans l’historique : l’élimination ne peut plus être annulée depuis le Live.");
      return;
    }

    const last=lastEliminatedPlayer();
    if(!last){
      alert("Aucune élimination à annuler.");
      return;
    }

    if(!confirm(`Annuler la sortie de ${last.name} ?`))return;

    await ownerTransaction(s=>{
      if(s.publishedToHistory)return s;

      const players=Array.isArray(s.players)?s.players:[];
      const candidates=players
        .filter(p=>p && p.status==="out" && Number(p.outAt)>0)
        .sort((a,b)=>Number(b.outAt||0)-Number(a.outAt||0));

      const target=candidates[0];
      if(!target)return s;

      // Si un vainqueur avait été temporairement déterminé mais non publié,
      // le remettre en jeu avant de restaurer le sortant.
      players.forEach(p=>{
        if(p.status==="winner"){
          p.status="in";
          p.place=null;
          p.killer="";
          p.outAt=null;
          p.outLevel=null;
          p.outTime="";
        }
      });

      target.status="in";
      target.place=null;
      target.killer="";
      target.outAt=null;
      target.outLevel=null;
      target.outTime="";
      target.outElapsedSec=null;target.outActiveElapsedSec=null;
      s.gameDurationSec=null;s.headsUpDurationSec=null;

      s.winnerName="";
      s.finishedAt=null;
      s.finishReason="";
      s.endedAt=null;

      return s;
    });

    updateUndoEliminationButton();
  }

  async function correctLastElimination(details={}){
    if(!isOwner() || !isActive())return false;
    if(current?.publishedToHistory){
      alert("Cette partie est déjà publiée dans l’historique : l’élimination ne peut plus être corrigée depuis le Live.");
      return false;
    }

    const last=lastEliminatedPlayer();
    if(!last){
      alert("Aucune élimination à corriger.");
      return false;
    }

    const killer=String(details.killer||"").trim();
    const outLevel=Math.max(1,Number(details.outLevel)||Number(last.outLevel)||((Number(current?.levelIndex)||0)+1));

    const updated=await ownerTransaction(s=>{
      if(s.publishedToHistory)return s;
      const players=Array.isArray(s.players)?s.players:[];
      const candidates=players
        .filter(p=>p && p.status==="out" && Number(p.outAt)>0)
        .sort((a,b)=>Number(b.outAt||0)-Number(a.outAt||0));
      const target=candidates[0];
      if(!target)return s;
      if(killer && killer!==target.name){
        const validKiller=players.some(p=>p.name===killer && (p.status==="in" || p.status==="winner" || Number(p.place)<Number(target.place||999)));
        if(validKiller)target.killer=killer;
      }
      target.outLevel=outLevel;
      target.outTime=target.outTime||new Date(Number(target.outAt)||Date.now()).toLocaleTimeString("fr-FR");
      return s;
    });
    return !!updated;
  }

  function closeElim(){
    $3("live3ElimModal").classList.remove("open");
    $3("live3ElimModal").setAttribute("aria-hidden","true");
  }


  function buildHistoryRowsFromLive3(state){
    if(!state || !Array.isArray(state.players))return [];

    const players=state.players.slice();
    const n=players.length;
    const finalGameNo=nextGameNo();
    const stake=Math.max(0,Number(state.buyIn)||0);

    const killCounts={};
    players.forEach(p=>{
      const killer=String(p.killer||"").trim();
      if(killer)killCounts[killer]=(killCounts[killer]||0)+1;
    });

    return players
      .slice()
      .sort((a,b)=>Number(a.place||999)-Number(b.place||999))
      .map(p=>{
        const place=Number(p.place)||0;
        const gross=plannedGain(place,n,stake);

        return {
          game:finalGameNo,
          date:state.date||new Date().toISOString().slice(0,10),
          location:state.location||"",
          player:p.name,
          place,
          killer:place===1?"":String(p.killer||""),
          outLevel:p.outLevel||null,
          outTime:p.outTime||"",
          outElapsedSec:Number(p.outElapsedSec)||null,
          outAt:Number(p.outAt)||null,
          outActiveElapsedSec:Number(p.outActiveElapsedSec)||null,
          gameStartedAt:Number(state.startedAt)||null,
          gameFinishedAt:Number(state.finishedAt)||null,
          gameDurationSec:Math.max(0,Math.floor((Number(state.finishedAt)-Number(state.startedAt))/1000)),
          gameActiveDurationSec:Math.max(0,Number(state.elapsedSec)||0),
          gameHeadsUpStartedAt:Number(state.headsUpStartedAt)||null,
          gameHeadsUpDurationSec:state.headsUpStartedAt?Math.max(0,Math.floor((Number(state.finishedAt)-Number(state.headsUpStartedAt))/1000)):null,
          gameTimingSource:'recorded',
          tablier:n>=Number(db?.settings?.tablierMinPlayers||10)&&place===1,
          n,
          points:pointsFor(place,n),
          stake,
          gross,
          net:gross-stake,
          kills:killCounts[p.name]||0,
          win:place===1,
          podium:place<=3,
          mysteryBounty:!!p.wasMysteryBounty,
          personalBountyTarget:(state.personalBounties||[]).find(c=>c.hunter===p.name)?.target||"",
          personalBountyCompleted:(state.personalBounties||[]).some(c=>c.hunter===p.name&&c.status==="completed"),
          endGameRecap:place===1?buildFinishedRecap(state):null,
          bountyHunter:!!p.bountyHunter
        };
      });
  }

  async function markLive3Published(state,rows,synced){
    try{
      const r=await ensureRef();
      const sessionId=String(state?.sessionId||"");
      const signature=historyGameSignature(rows);

      await r.transaction(server=>{
        if(!server || String(server.sessionId||"")!==sessionId)return server;
        if(String(server.ownerId||"")!==uid())return server;

        const next=clone(server);
        const now=Date.now();

        if(next.running && next.runStartedAt){
          next.elapsedSec=Number(next.elapsedSec||0)+Math.max(
            0,
            Math.floor((now-Number(next.runStartedAt||now))/1000)
          );
        }

        next.active=false;
        next.running=false;
        next.runStartedAt=null;
        next.deadline=null;
        next.endedAt=now;
        next.finishedAt=next.finishedAt||now;
        next.finishReason="winner";
        next.publishedToHistory=true;
        next.historyGameNo=Number(rows[0]?.game)||null;
        next.historySynced=!!synced;
        next.historySignature=signature;
        next.takeoverRequest=null;
        next.updatedAt=now;

        return next;
      });
    }catch(e){
      console.warn("Live V3 fin serveur :",e);
    }
  }

  async function finalizeWinnerLive(state){
    if(winnerFinalizationInProgress)return;

    const winners=(state?.players||[]).filter(
      p=>p.status==="winner" || Number(p.place)===1
    );

    if(winners.length!==1)return;

    const n=(state.players||[]).length;
    const places=(state.players||[]).map(p=>Number(p.place)||0);

    if(
      n<2 ||
      places.some(p=>p<1) ||
      new Set(places).size!==n
    ){
      alert("Impossible de terminer automatiquement le Live : le classement final est incomplet.");
      return;
    }

    winnerFinalizationInProgress=true;

    try{
      const rows=buildHistoryRowsFromLive3(state);
      const validation=validateCompletedGameRows(rows);

      if(validation){
        throw new Error(validation);
      }

      closeFullscreen();

      // Même circuit que les parties saisies manuellement :
      // ajout local, calculs, file d'attente, publication serveur,
      // rafraîchissement du classement et résumé de fin.
      const result=await persistCompletedGame(rows,{showSummary:false});

      await settleLivePredictions(state);
      await markLive3Published(state,rows,result?.synced===true);
      queueFinishedGameSummary(rows,state);

      // Le résumé standard BPT est déjà déclenché par persistCompletedGame().
      // On revient sur la dernière partie pour que le résultat publié soit visible derrière.
      try{
        if(typeof showView==="function")showView("latestgame");
      }catch(_e){}

      const notice=championshipPointsNotice(n);
      if(notice){
        setTimeout(()=>alert(notice),250);
      }

    }catch(e){
      console.error("Finalisation automatique Live V3 :",e);
      alert(
        "Le vainqueur est déterminé, mais la publication dans l’historique a échoué : "+
        (e?.message||e)
      );
    }finally{
      winnerFinalizationInProgress=false;
    }
  }

  async function settleLivePredictions(state){
    const betting=state?.betting;if(!betting||betting.settledAt)return;
    const dbx=window.bptFirebaseDb?.();if(!dbx?.ref)return;
    const winner=(state.players||[]).find(p=>Number(p.place)===1)?.name||state.winnerName||'';
    const first=(state.players||[]).filter(p=>Number(p.place)>0).sort((a,b)=>Number(b.place)-Number(a.place))[0]?.name||'';
    const session=String(state.sessionId||'');if(!session)return;
    const key=name=>encodeURIComponent(String(name||'')).replace(/%/g,'_');
    const bets=betting.bets||{},odds=betting.odds||{},stake=Math.max(1,Number(betting.stakeCents)||50);
    await dbx.ref('bpt/bettingLedger').transaction(root=>{
      root=root||{};root.sessions=root.sessions||{};root.players=root.players||{};
      if(root.sessions[session])return root;
      const sessionRows=[];
      Object.entries(bets).forEach(([player,bet])=>{
        if(!bet?.confirmed)return;
        for(const type of ['winner','firstEliminated']){
          const pick=String(bet[type]||'').trim();if(!pick)continue;
          const odd=Number(odds?.[type]?.[pick])||1.05,actual=type==='winner'?winner:first,hit=pick===actual;
          const gross=hit?Math.round(stake*odd):0,net=gross-stake,pk=key(player);
          const rec=root.players[pk]||{name:player,stakedCents:0,grossWonCents:0,netCents:0,bets:[]};
          rec.stakedCents=Number(rec.stakedCents||0)+stake;rec.grossWonCents=Number(rec.grossWonCents||0)+gross;rec.netCents=Number(rec.netCents||0)+net;
          rec.bets=Array.isArray(rec.bets)?rec.bets:[];rec.bets.push({session,type,pick,actual,odds:odd,stakeCents:stake,grossWonCents:gross,netCents:net,at:Date.now()});root.players[pk]=rec;
          sessionRows.push({player,type,pick,actual,odds:odd,stakeCents:stake,grossWonCents:gross,netCents:net});
        }
      });
      root.sessions[session]={session,season:String(db?.settings?.season||CURRENT_SEASON_KEY),gameNo:Number(state?.gameNo)||Number(db?.liveState?.gameNo)||null,settledAt:Date.now(),winner,firstEliminated:first,rows:sessionRows};return root;
    });
  }

  async function endLive(){
    if(!isOwner())return;
    if(!confirm("Terminer ce Live sans publier de résultat ?\n\nLa publication dans l’historique est automatique lorsqu’un vainqueur est déterminé."))return;
    await ownerTransaction(s=>{
      if(s.running&&s.runStartedAt){
        const now=Date.now();
        s.elapsedSec=Number(s.elapsedSec||0)+Math.max(0,Math.floor((now-Number(s.runStartedAt))/1000));
      }
      s.active=false;s.running=false;s.deadline=null;s.runStartedAt=null;s.endedAt=Date.now();s.finishedAt=s.endedAt;s.finishReason="manual";
      s.takeoverRequest=null;
      return s;
    });
    closeFullscreen();
    showView("dashboard");


}

  

function live3OwnerDisplayName(){
  const raw=String(current?.ownerLabel||current?.ownerName||"").trim();
  if(raw)return raw;
  return "l’organisateur actuel";
}


function live3MyTakeoverRequest(){
  const req=current?.takeoverRequest;
  return req && String(req.requesterId||"")===uid() ? req : null;
}

function live3TakeoverRemainingSec(){
  const req=live3MyTakeoverRequest();
  if(!req)return 0;
  const elapsed=Math.max(0,Date.now()-Number(req.requestedAt||0));
  return Math.max(0,Math.ceil((LIVE3_TAKEOVER_TIMEOUT_MS-elapsed)/1000));
}

function live3TakeoverExpired(){
  const req=live3MyTakeoverRequest();
  if(!req)return false;
  return Date.now()-Number(req.requestedAt||0)>=LIVE3_TAKEOVER_TIMEOUT_MS;
}

async function forceLive3Takeover(){
  if(!isActive()||isOwner())return;

  const req=live3MyTakeoverRequest();
  if(!req){
    alert("Aucune demande de reprise en attente.");
    return;
  }

  if(!live3TakeoverExpired()){
    alert(`L’organisateur dispose encore de ${live3TakeoverRemainingSec()} s pour répondre.`);
    return;
  }

  const code=prompt("Aucune réponse depuis 30 secondes.\\n\\nSaisissez le code BPT pour forcer la reprise :","");
  if(code===null)return;

  if(String(code).trim().toLowerCase()!==LIVE3_FORCE_CODE){
    alert("Code BPT incorrect.");
    return;
  }

  const r=await ensureRef();
  let taken=false;

  await r.transaction(s=>{
    if(!s?.active)return s;

    const pending=s.takeoverRequest;
    if(!pending || String(pending.requesterId||"")!==uid())return s;

    if(Date.now()-Number(pending.requestedAt||0)<LIVE3_TAKEOVER_TIMEOUT_MS)return s;

    s=clone(s);
    s.ownerId=uid();
    s.ownerLabel=liveIdentityName()||deviceLabel();
    s.takeoverRequest=null;
    s.updatedAt=Date.now();
    taken=true;
    return s;
  });

  if(!taken){
    alert("La reprise n'est plus disponible. L’organisateur a peut-être répondu.");
  }
}



async function requestTakeover(){
    if(!isActive()||isOwner())return;

    const mine=live3MyTakeoverRequest();
    if(mine){
      if(live3TakeoverExpired()){
        await forceLive3Takeover();
      }
      return;
    }

    const r=await ensureRef();
    let sent=false;
    let blockedByOther=false;
    const result=await r.transaction(state=>{
      if(!state?.active||String(state.ownerId||"")===uid())return state;

      const existing=state.takeoverRequest;
      if(existing?.requesterId && String(existing.requesterId)!==uid()){
        blockedByOther=true;
        return state;
      }

      state=clone(state);
      if(existing?.requesterId && String(existing.requesterId)===uid()){
        return state; // surtout ne pas remettre requestedAt à zéro
      }

      state.takeoverRequest={
        requesterId:uid(),
        requesterLabel:liveIdentityName()||deviceLabel(),
        requestedAt:Date.now()
      };
      state.updatedAt=Date.now();
      sent=true;
      return state;
    });

    try{
      if(result?.snapshot?.val) current=result.snapshot.val()||current;
    }catch(_e){}

    if(blockedByOther){
      alert("Une autre demande de reprise est déjà en attente.");
      return;
    }

    if(sent){
      render();
    }
  }

  async function approveTakeover(){
    if(!isOwner()||!current?.takeoverRequest?.requesterId)return;
    const target=current.takeoverRequest.requesterId;
    const label=current.takeoverRequest.requesterLabel||"Autre appareil";
    await ownerTransaction(s=>{
      if(String(s.takeoverRequest?.requesterId||"")!==target)return s;
      s.ownerId=target;s.ownerLabel=label;s.takeoverRequest=null;return s;
    });
  }

  async function rejectTakeover(){
    if(!isOwner())return;
    await ownerTransaction(s=>{s.takeoverRequest=null;return s;});
  }

  async function sendChat(){
    if(!isActive())return;
    const input=$3("live3ChatInput");
    const message=String(input.value||"").trim();
    if(!message)return;
    const r=await ensureRef();
    const session=current.sessionId;
    await r.transaction(s=>{
      if(!s?.active||String(s.sessionId||"")!==session)return s;
      s=clone(s);
      const list=Array.isArray(s.chat)?s.chat:[];
      list.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),from:(liveIdentityName()||spectatorName()||deviceLabel()),deviceId:uid(),text:message,at:Date.now()});
      s.chat=list;s.updatedAt=Date.now();return s;
    });
    input.value="";
  }


  function hideChatToast(){
    if(chatToastTimer){clearTimeout(chatToastTimer);chatToastTimer=null;}
    const toast=$3("live3ChatToast");
    if(!toast)return;
    toast.classList.remove("open");
    toast.setAttribute("aria-hidden","true");
  }


  function updateUnreadBadges(){
    const count=Math.max(0,Number(unreadChatCount)||0);
    document.querySelectorAll('.bpt484-head-tools .bpt484-chat').forEach(button=>{
      button.textContent=count>0?'Chat ('+count+')':'Chat';
      button.setAttribute('aria-label',count>0?'Chat · '+count+' message'+(count>1?'s':'')+' non lu'+(count>1?'s':''):'Chat');
    });
    [
      "live3ChatUnread",
      "live3FsChatUnread",
      "live3FsHeaderChatUnread",
      "live3FsSpectatorChatUnread"
    ].forEach(id=>{
      const el=$3(id);
      if(!el)return;
      el.textContent=String(count);
      el.hidden=count<=0;
      el.setAttribute("aria-hidden",count>0?"false":"true");
      if(count>0){
        el.style.setProperty("display","inline-grid","important");
      }else{
        el.style.setProperty("display","none","important");
      }
    });

    ["live3ChatBtn","live3FsChatActionBtn","live3FsSpectatorChatBtn"].forEach(id=>{
      const btn=$3(id);
      if(!btn)return;
      btn.classList.toggle("has-unread-chat",count>0);
      btn.setAttribute("aria-label",count>0?`Chat · ${count} message${count>1?"s":""} non lu${count>1?"s":""}`:"Chat");
    });
  }

  function openChat(){
    hideChatToast();
    live3MarkChatRead();
    renderChat();

    const modal=$3("live3ChatModal");
    const fullscreen=$3("live3Fullscreen");
    if(!modal)return;

    if(fullscreen){
      fullscreen.style.setProperty("z-index","1000000","important");
    }

    modal.style.setProperty("position","fixed","important");
    modal.style.setProperty("inset","0","important");
    modal.style.setProperty("z-index","2000000","important");
    modal.style.setProperty("visibility","visible","important");
    modal.style.setProperty("opacity","1","important");
    modal.style.setProperty("pointer-events","auto","important");

    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");

    setTimeout(()=>{
      const box=$3("live3ChatMessages");
      if(box)box.scrollTop=box.scrollHeight;
      try{$3("live3ChatInput")?.focus({preventScroll:true});}catch(_e){}
    },50);
  }
  function closeChat(){
    $3("live3ChatModal").classList.remove("open");
    $3("live3ChatModal").setAttribute("aria-hidden","true");
  }
  function renderChat(){
    const list=Array.isArray(current?.chat)?current.chat:[];
    const box=$3("live3ChatMessages");
    if(!box)return;

    box.innerHTML=list.length?list.map(m=>{
      const when=new Date(Number(m.at)||Date.now());
      const timeLabel=when.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
      const dateLabel=when.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"});
      const sender=String(m.from||"Utilisateur").trim()||"Utilisateur";

      return `<div class="bpt-live3-chat-msg">
        <small><strong>${escapeHtml(sender)}</strong> · ${dateLabel} · ${timeLabel}</small>
        <div>${escapeHtml(m.text||"")}</div>
      </div>`;
    }).join(""):'<div class="muted">Aucun message.</div>';

    /* Toujours montrer les messages les plus récents à l'ouverture/rendu,
       tout en laissant l'utilisateur remonter l'historique avec le scroll. */
    requestAnimationFrame(()=>{
      box.scrollTop=box.scrollHeight;
    });
  }

  function openFullscreen(){
    if(!isActive())return;
    const fs=$3("live3Fullscreen");
    if(!fs)return;
    fs.style.setProperty("display","block","important");
    fs.classList.add("open");
    fs.setAttribute("aria-hidden","false");
    document.documentElement.style.overflow="hidden";
    document.body.style.overflow="hidden";
    updateUnreadBadges();
    render();
  }

  async function closeFullscreen(){
    const fs=$3("live3Fullscreen");
    if(!fs)return;

    // Hide immediately on PC and phone, independently of CSS cascade.
    fs.classList.remove("open");
    fs.setAttribute("aria-hidden","true");
    fs.style.setProperty("display","none","important");

    document.body.style.overflow="";
    document.documentElement.style.overflow="";

    try{
      if(document.fullscreenElement && document.exitFullscreen){
        await document.exitFullscreen();
      }else if(document.webkitFullscreenElement && document.webkitExitFullscreen){
        const r=document.webkitExitFullscreen();
        if(r && typeof r.then==="function")await r;
      }
    }catch(_e){}

    // Restore the normal Live view explicitly.
    const live=$3("live3");
    if(live){
      document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
      live.classList.add("active");
    }
    if(typeof currentViewId!=="undefined")currentViewId="live3";
    updateUnreadBadges();
  }

  function updateMobilePlayerSelectionCount(){
    const count=selectedPlayerCount();
    const top=$3("live3MobileSelectedCount");
    const modal=$3("live3MobileModalCount");
    if(top)top.textContent=String(count);
    if(modal)modal.textContent=String(
      document.querySelectorAll('#live3MobilePlayerGrid input[type="checkbox"]:checked').length
    );
  }

  function renderMobilePlayerSelector(){
    const grid=$3("live3MobilePlayerGrid");
    if(!grid)return;

    const selected=new Set(
      [...document.querySelectorAll('#live3PlayerPicker input[type="checkbox"]:checked')]
        .map(cb=>cb.value)
    );

    const pickerOptions=[
      ...document.querySelectorAll('#live3PlayerPicker input[type="checkbox"]')
    ].map(cb=>({
      name:cb.value,
      isNew:!!cb.closest(".bpt-live3-player-check")?.classList.contains("is-new-player")
    }));

    const q=String($3("live3MobilePlayerSearch")?.value||"")
      .trim()
      .toLocaleLowerCase("fr");

    const filtered=pickerOptions.filter(p=>
      !q || p.name.toLocaleLowerCase("fr").includes(q)
    );

    grid.innerHTML=filtered.length
      ? filtered.map(p=>{
          const checked=selected.has(p.name);
          return `<label class="bpt-live3-mobile-player-option${checked?" is-selected":""}${p.isNew?" is-new-player":""}">
            <input type="checkbox" value="${escapeAttr(p.name)}" ${checked?"checked":""}>
            <span class="bpt-live3-mobile-player-name" title="${escapeAttr(p.name)}">${escapeHtml(p.name)}</span>
          </label>`;
        }).join("")
      : '<div class="muted" style="grid-column:1/-1;padding:16px 4px">Aucun joueur trouvé.</div>';

    updateMobilePlayerSelectionCount();
  }

  function openMobilePlayerSelector(){
    renderMobilePlayerSelector();
    const modal=$3("live3MobilePlayerModal");
    if(!modal)return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
    setTimeout(()=>{try{$3("live3MobilePlayerSearch")?.focus({preventScroll:true});}catch(_e){}},40);
  }

  function closeMobilePlayerSelector(){
    const modal=$3("live3MobilePlayerModal");
    if(!modal)return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
  }

  function validateMobilePlayerSelector(){
    const selected=new Set(
      [...document.querySelectorAll('#live3MobilePlayerGrid input[type="checkbox"]:checked')]
        .map(cb=>cb.value)
    );

    document.querySelectorAll('#live3PlayerPicker input[type="checkbox"]').forEach(cb=>{
      cb.checked=selected.has(cb.value);
    });

    updateMobilePlayerSelectionCount();
    renderStructurePreview();
    closeMobilePlayerSelector();
  }

  function prefillLiveLocationFromIdentity(){
    const loc=$3("live3Location");
    if(!loc || isActive())return;
    const name=liveIdentityName();
    if(name && !String(loc.value||"").trim())loc.value=name;
  }


  function renderPrepPlayers(){
    const host=$3("live3PlayerPicker");
    if(!host)return;

    const previouslySelected=new Set(
      [...host.querySelectorAll('input[type="checkbox"]:checked')].map(x=>x.value)
    );

    const activePlayers=(db?.players||[])
      .filter(p=>p && String(p.name||"").trim())
      .map(p=>String(p.name).trim());

    const knownMap=new Map(
      (db?.players||[])
        .filter(p=>p && String(p.name||"").trim())
        .map(p=>[String(p.name).trim().toLocaleLowerCase("fr"),String(p.name).trim()])
    );

    const tempPlayers=[...live3TemporaryPlayers]
      .map(name=>{
        const canonical=knownMap.get(String(name).trim().toLocaleLowerCase("fr"));
        return canonical||String(name).trim();
      })
      .filter(Boolean);

    const allNames=[...new Set([...activePlayers,...tempPlayers])]
      .sort(bptSortPlayersByParticipation);

    host.innerHTML=allNames.length
      ? allNames.map(name=>{
          const isTemp=tempPlayers.some(
            n=>n.localeCompare(name,"fr",{sensitivity:"base"})===0
          );
          const checked=previouslySelected.has(name)||isTemp;
          return `<label class="bpt-live3-player-check${isTemp?" is-new-player":""}">
            <input type="checkbox" value="${escapeAttr(name)}" ${checked?"checked":""}>
            <span>${escapeHtml(name)}</span>
            ${isTemp?'<em class="bpt-live3-new-badge">nouveau</em>':""}
          </label>`;
        }).join("")
      : '<div class="muted">Aucun joueur actif. Ajoutez un nouveau joueur ci-dessous.</div>';

    updateMobilePlayerSelectionCount();
    prefillLiveLocationFromIdentity();
    if($3("live3MobilePlayerModal")?.classList.contains("open")){
      renderMobilePlayerSelector();
    }
    setTimeout(renderStructurePreview,0);
  }

  function addTemporaryLivePlayer(){
    const input=$3("live3NewPlayerName");
    const hint=$3("live3NewPlayerHint");
    if(!input)return;

    const clean=String(input.value||"").trim().replace(/\s+/g," ");
    if(!clean){
      if(hint)hint.textContent="Saisissez le nom du joueur.";
      input.focus();
      return;
    }

    let known=(db?.players||[]).find(
      p=>String(p?.name||"").trim().localeCompare(clean,"fr",{sensitivity:"base"})===0
    );

    if(known){
      known.active=true;
    }else{
      known={name:clean,nickname:"",active:true};
      db.players.push(known);
    }
    const canonical=String(known.name).trim();

    // Règle BPT : un joueur qui rejoint une partie existe dans Paramètres et est actif.
    live3TemporaryPlayers.delete(canonical);
    saveDB();
    try{ window.renderAll?.(); }catch(_e){}
    try{ window.bptNotifySettingsPlayers?.(); }catch(_e){}
    renderPrepPlayers();

    const existing=[...document.querySelectorAll('#live3PlayerPicker input[type="checkbox"]')]
      .find(cb=>String(cb.value).localeCompare(canonical,"fr",{sensitivity:"base"})===0);
    if(existing)existing.checked=true;

    input.value="";
    updateMobilePlayerSelectionCount();
    renderStructurePreview();
    if(hint)hint.textContent=`${canonical} est maintenant actif et sélectionné pour cette partie.`;
  }

  function renderPlayers(target,fullscreen=false){
    if(!target)return;
    const players=current?.players||[];
    target.innerHTML=players.map(p=>{
      const cls=p.status==="out"?" out":"";
      const place=p.place?` · ${p.place}e`:"";
      if(fullscreen)return `<div class="bpt-live3-fs-player${cls}"><span>${escapeHtml(p.name)}${place}</span></div>`;
      return `<div class="bpt-live3-player${cls}"><div class="bpt-live3-player-dot">${initials(p.name)}</div><div><strong>${escapeHtml(p.name)}</strong><small>${place}${p.killer?` · par ${escapeHtml(p.killer)}`:""}</small></div></div>`;
    }).join("");
  }

  function live3RenderPlayersPopover(){
    const list=$3("live3PlayersPopoverList");
    const count=$3("live3PlayersPopoverCount");
    if(!list)return;
    const players=[...(current?.players||[])];
    const alive=players.filter(p=>p.status!=="out");
    const out=players.filter(p=>p.status==="out").sort((a,b)=>(Number(b.place)||0)-(Number(a.place)||0));
    const ordered=[...alive,...out];
    if(count)count.textContent=`${alive.length} en jeu · ${out.length} éliminé${out.length>1?"s":""}`;
    list.innerHTML=ordered.map(p=>{
      const isOut=p.status==="out";
      const level=Number(p.outLevel)||0;
      const status=isOut?(level?`Éliminé · niveau ${level}`:"Éliminé"):`En jeu`;
      const detail=isOut && p.killer?`par ${escapeHtml(p.killer)}${p.place?` · ${p.place}e`:""}`:(p.place?`${p.place}e`:"");
      return `<div class="bpt-live3-players-popover-row ${isOut?"is-out":"is-in"}"><div class="bpt-live3-players-popover-avatar">${initials(p.name)}</div><div class="bpt-live3-players-popover-name"><strong>${escapeHtml(p.name)}</strong><span>${detail||" "}</span></div><div class="bpt-live3-players-popover-status">${status}</div></div>`;
    }).join("") || `<div class="muted" style="padding:10px">Aucun joueur.</div>`;
  }

  function live3PositionPlayersPopover(){
    const pop=$3("live3PlayersPopover"),anchor=$3("live3PlayersSummaryBtn");
    if(!pop||!anchor||pop.hidden)return;
    const r=anchor.getBoundingClientRect();
    const width=Math.min(420,window.innerWidth-24);
    let left=Math.min(Math.max(12,r.left+r.width/2-width/2),window.innerWidth-width-12);
    pop.style.width=`${width}px`;
    pop.style.left=`${left}px`;
    pop.style.top=`${r.bottom+8}px`;
    requestAnimationFrame(()=>{const pr=pop.getBoundingClientRect();if(pr.bottom>window.innerHeight-10)pop.style.top=`${Math.max(10,r.top-pr.height-8)}px`;});
  }

  function live3OpenPlayersPopover(){
    const pop=$3("live3PlayersPopover"),btn=$3("live3PlayersSummaryBtn");
    if(!pop)return; live3RenderPlayersPopover(); pop.hidden=false; btn?.setAttribute("aria-expanded","true"); live3PositionPlayersPopover();
  }
  function live3ClosePlayersPopover(){const pop=$3("live3PlayersPopover"),btn=$3("live3PlayersSummaryBtn");if(pop)pop.hidden=true;btn?.setAttribute("aria-expanded","false");}
  function live3TogglePlayersPopover(){const pop=$3("live3PlayersPopover");if(!pop)return;if(pop.hidden)live3OpenPlayersPopover();else live3ClosePlayersPopover();}

  function render(){
    live3RefreshUnreadCount();
    const active=isActive();
    const owner=isOwner();
    const role=$3("live3RoleBadge");
    const prep=$3("live3Prep"),game=$3("live3Game");

    $3("live3NavBtn")?.classList.toggle("live3-active",active);

    if(!active){
      if(prep)prep.style.display="";
      if(game)game.style.display="none";
      if(role){
        role.textContent=liveIdentityConfirmed && liveIdentityName()
          ? `ORGANISATEUR · ${liveIdentityName()}`
          : "IDENTIFICATION";
        role.className="bpt-live3-role-badge"+(liveIdentityConfirmed&&liveIdentityName()?" master":"");
      }
      document.body.classList.remove("b466-live-active");
      renderPrepPlayers();
      updateUndoEliminationButton();
      if($3("live3ViewerInfo")){
        $3("live3ViewerInfo").style.display="none";
        if(viewerRenderSignature!=="inactive"){
          $3("live3ViewerInfo").innerHTML="";
          viewerRenderSignature="inactive";
        }
      }
      if(!identityConfirmedThisSession())openSpectatorIdentity(true);
      return;
    }

    if(prep)prep.style.display="none";
    if(game)game.style.display="";
    document.body.classList.add("b466-live-active");
    if(role){
      role.textContent=owner?`ORGANISATEUR · ${current?.ownerLabel||liveIdentityName()||deviceLabel()}`:`SPECTATEUR · ${liveIdentityName()||"—"}`;
      role.className="bpt-live3-role-badge "+(owner?"master":"spectator");
    }

    if(!identityConfirmedThisSession()){
      openSpectatorIdentity(true);
    }

    // La présence est maintenue par le heartbeat (15 s) et par
    // visibilitychange. Ne pas écrire dans Firebase à chaque render().
    renderViewerInfo();

    const liveRoot=$3("live3");
    const fsRoot=$3("live3Fullscreen");
    if(liveRoot){
      liveRoot.classList.toggle("bpt-live3-role-owner",owner);
      liveRoot.classList.toggle("bpt-live3-role-spectator",!owner);
    }
    if(fsRoot){
      fsRoot.classList.toggle("bpt-live3-role-owner",owner);
      fsRoot.classList.toggle("bpt-live3-role-spectator",!owner);
    }

    const lv=level(),nx=nextLevel(),rem=remainingSeconds(),count=remainingCount();
    const total=(current.players?.length||0)*Number(current.startStack||0);
    const avg=count?total/count:0;
    const blinds=lv?`${fmt(lv.sb)} / ${fmt(lv.bb)}`:"—";
    const ante=lv?.ante?`ANTE ${fmt(lv.ante)}`:"";
    const next=`${fmt(nx.sb)} / ${fmt(nx.bb)}${nx.ante?` · ante ${fmt(nx.ante)}`:""}`;

    $3("live3GameLocation").textContent=current.location||"Live BPT";
    $3("live3GameMeta").textContent=`${current.date||""} · ${current.players?.length||0} joueurs · organisateur : ${current.ownerLabel||"—"}`;
    const structureText=current?.paceAdaptive===true?"Structure · Adaptatif":"Structure · Classique";
    if($3("live3StructureBadge"))$3("live3StructureBadge").textContent=structureText;
    if($3("live3OwnerLabel"))$3("live3OwnerLabel").textContent=`Organisateur · ${current?.ownerLabel||live3OwnerDisplayName()}`;
    if($3("live3SettingsMode"))$3("live3SettingsMode").textContent=current?.paceAdaptive===true?"Adaptatif":"Classique";
    if($3("live3FsStructureBadge"))$3("live3FsStructureBadge").textContent=structureText;
    $3("live3Blinds").textContent=blinds;$3("live3Ante").textContent=ante;
    const blindDurationMin=currentBlindDurationMinutes();
    if($3("live3BlindDurationLabel"))$3("live3BlindDurationLabel").textContent=`Durée : ${blindDurationMin} min`;
    if($3("live3BlindDurationInput") && document.activeElement!==$3("live3BlindDurationInput")){
      $3("live3BlindDurationInput").value=String(blindDurationMin);
    }
    $3("live3Timer").textContent=time(rem);$3("live3Remaining").textContent=String(count);
    if($3("live3PlayersPopover") && !$3("live3PlayersPopover").hidden)live3RenderPlayersPopover();
    live3RenderProjection();
    if($3("live3SettingsFinish"))$3("live3SettingsFinish").textContent=$3("live3EstimatedFinish")?.textContent||"—";
    if($3("live3SettingsDelta"))$3("live3SettingsDelta").textContent=$3("live3FinishDelta")?.textContent||"—";
    $3("live3AvgStack").textContent=fmt(avg);$3("live3Elapsed").textContent=elapsedHoursMinutes(elapsedSeconds());$3("live3Next").textContent=next;
    $3("live3StartPauseBtn").textContent=current.running?"Pause":(current.startedAt?"Reprendre":"Démarrer");

    // Visibilité stricte selon le rôle :
    // organisateur = aucun bouton de demande de gestion
    // spectateur = bouton de demande de gestion visible
    if($3("live3MasterControls")){
      $3("live3MasterControls").style.setProperty("display",owner?"grid":"none","important");
    }
    if($3("live3UndoElimBox")){
      $3("live3UndoElimBox").style.setProperty("display",owner?"grid":"none","important");
    }
    if($3("live3BlindDurationEditor")){
      $3("live3BlindDurationEditor").style.setProperty("display",owner?"grid":"none","important");
    }
    if($3("live3SpectatorControls")){
      $3("live3SpectatorControls").style.setProperty("display",owner?"none":"grid","important");
    }
    const req=current.takeoverRequest;
    const myRequest=!!(req?.requesterId && String(req.requesterId)===uid());
    const ownerName=live3OwnerDisplayName();
    const takeoverExpired=myRequest && live3TakeoverExpired();
    const takeoverRemaining=myRequest ? live3TakeoverRemainingSec() : 0;

    const takeoverBtn=$3("live3TakeoverBtn");
    const takeoverStatus=$3("live3TakeoverStatus");
    const takeoverCountdown=$3("live3TakeoverCountdown");
    const forceTakeoverBtn=$3("live3ForceTakeoverBtn");

    if(takeoverBtn){
      takeoverBtn.style.display=owner?"none":"";
      takeoverBtn.textContent=`Demander la reprise de gestion à ${ownerName}`;
      takeoverBtn.disabled=owner || myRequest;
    }

    if(owner){
      if(takeoverStatus)takeoverStatus.textContent="";
      if(takeoverCountdown)takeoverCountdown.style.display="none";
      if(forceTakeoverBtn)forceTakeoverBtn.style.display="none";
    }else if(myRequest){
      if(takeoverStatus)takeoverStatus.textContent=`Demande envoyée à ${ownerName}`;
      if(takeoverCountdown){
        takeoverCountdown.style.display="block";
        takeoverCountdown.textContent=takeoverExpired
          ? "Délai de 30 s expiré · vous pouvez forcer la reprise"
          : `Réponse attendue : ${takeoverRemaining} s`;
      }
      if(forceTakeoverBtn){
        forceTakeoverBtn.style.display=takeoverExpired?"inline-flex":"none";
        forceTakeoverBtn.textContent=`Forcer la reprise de gestion de ${ownerName}`;
      }
    }else{
      if(takeoverStatus)takeoverStatus.textContent="";
      if(takeoverCountdown)takeoverCountdown.style.display="none";
      if(forceTakeoverBtn)forceTakeoverBtn.style.display="none";
    }

    const requestBox=$3("live3TakeoverRequest");
    if(owner&&req?.requesterId&&String(req.requesterId)!==uid()){
      requestBox.style.display="flex";
      $3("live3TakeoverText").textContent=`${req.requesterLabel||"Un appareil"} demande à reprendre la gestion.`;
    }else requestBox.style.display="none";

    renderPlayers($3("live3Players"),false);
    updateUndoEliminationButton();

    if($3("live3FsOwner"))$3("live3FsOwner").textContent=`Organisateur · ${current?.ownerLabel||live3OwnerDisplayName()}`;
    $3("live3FsBlinds").textContent=blinds;$3("live3FsAnte").textContent=ante;
    if($3("live3FsBlindDurationLabel"))$3("live3FsBlindDurationLabel").textContent=`Durée : ${blindDurationMin} min`;
    $3("live3FsTimer").textContent=time(rem);$3("live3FsRemaining").textContent=String(count);
    live3RenderProjection();
    $3("live3FsAvg").textContent=fmt(avg);$3("live3FsElapsed").textContent=elapsedHoursMinutes(elapsedSeconds());$3("live3FsNext").textContent=next;
    $3("live3FsStartPauseBtn").textContent=current.running?"Pause":(current.startedAt?"Reprendre":"Démarrer");

    const fsMaster=$3("live3FsMasterActions");
    const fsSpectator=$3("live3FsSpectatorActions");
    if(fsMaster) fsMaster.style.setProperty("display",owner?"grid":"none","important");
    if(fsSpectator){
      fsSpectator.style.setProperty("display",owner?"none":"grid","important");
      fsSpectator.style.setProperty("visibility",owner?"hidden":"visible","important");
      const btn=$3("live3FsTakeoverActionBtn");
      if(btn){
        btn.style.setProperty("display",owner?"none":"block","important");
        btn.style.setProperty("visibility",owner?"hidden":"visible","important");
        if(!myRequest){
          btn.textContent=`Demander la reprise à ${ownerName}`;
          btn.disabled=false;
        }else if(takeoverExpired){
          btn.textContent="Forcer la reprise";
          btn.disabled=false;
        }else{
          btn.textContent=`Réponse : ${takeoverRemaining} s`;
          btn.disabled=true;
        }
      }
    }

    renderPlayers($3("live3FsPlayers"),true);
    renderChat();
  }


  function playBlindTone(kind="tick"){
    try{
      const AudioCtx=window.AudioContext||window.webkitAudioContext;
      if(!AudioCtx)return;

      const ctx=new AudioCtx();
      const now=ctx.currentTime;

      const gain=ctx.createGain();
      gain.connect(ctx.destination);

      function tone(freq,start,duration,volume,type="square"){
        const osc=ctx.createOscillator();
        osc.type=type;
        osc.frequency.setValueAtTime(freq,start);
        const localGain=ctx.createGain();

        localGain.gain.setValueAtTime(0.0001,start);
        localGain.gain.exponentialRampToValueAtTime(volume,start+0.012);
        localGain.gain.exponentialRampToValueAtTime(0.0001,start+duration);

        osc.connect(localGain);
        localGain.connect(gain);
        osc.start(start);
        osc.stop(start+duration+0.02);
      }

      if(kind==="level"){
        // Changement de blind : double signal fort et distinct.
        tone(520,now,0.26,0.24,"square");
        tone(760,now+0.30,0.34,0.30,"square");
        gain.gain.setValueAtTime(1,now);
        setTimeout(()=>{try{ctx.close();}catch(_e){}},800);
        return;
      }

      if(kind==="thirty"){
        // 30 secondes : bip franc, plus long.
        tone(650,now,0.24,0.18,"square");
        gain.gain.setValueAtTime(1,now);
        setTimeout(()=>{try{ctx.close();}catch(_e){}},400);
        return;
      }

      // 5 -> 1 secondes : bip court mais bien audible.
      tone(900,now,0.16,0.22,"square");
      gain.gain.setValueAtTime(1,now);
      setTimeout(()=>{try{ctx.close();}catch(_e){}},300);

    }catch(_e){}
  }


  function handleBlindSoundAlerts(){
    if(!current?.active || !current?.running){
      blindSoundLastSecond=null;
      if(current?.active){
        blindSoundSessionId=String(current.sessionId||"");
        blindSoundLevelIndex=Number(current.levelIndex)||0;
      }
      return;
    }

    const sessionId=String(current.sessionId||"");
    const levelIndex=Number(current.levelIndex)||0;
    const rem=remainingSeconds();

    // Première observation du Live : on initialise sans annoncer un faux changement.
    if(!blindSoundPrimed){
      blindSoundPrimed=true;
      blindSoundSessionId=sessionId;
      blindSoundLevelIndex=levelIndex;
      blindSoundLastSecond=rem;
      return;
    }

    // Nouvelle session Live : réinitialisation silencieuse.
    if(blindSoundSessionId!==sessionId){
      blindSoundSessionId=sessionId;
      blindSoundLevelIndex=levelIndex;
      blindSoundLastSecond=rem;
      return;
    }

    // Changement réel de niveau : annonce forte, une seule fois.
    if(blindSoundLevelIndex!==levelIndex){
      blindSoundLevelIndex=levelIndex;
      blindSoundLastSecond=rem;
      playBlindTone("level");
      return;
    }

    // Ne jamais répéter une annonce pour la même seconde.
    if(blindSoundLastSecond===rem)return;
    blindSoundLastSecond=rem;

    if(rem===30){
      playBlindTone("thirty");
      return;
    }

    if(rem>=1 && rem<=5){
      playBlindTone("tick");
    }
  }

  function playChatReceiveSound(){
    try{
      const AudioCtx=window.AudioContext||window.webkitAudioContext;
      if(!AudioCtx)return;
      const ctx=new AudioCtx();
      const osc=ctx.createOscillator();
      const gain=ctx.createGain();
      osc.type="square";
      osc.frequency.setValueAtTime(740,ctx.currentTime);
      gain.gain.setValueAtTime(0.0001,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.09,ctx.currentTime+0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime+0.19);
      osc.onended=()=>{try{ctx.close();}catch(_e){}};
    }catch(_e){}
  }

  function maybeNotifyChat(){
    const list=Array.isArray(current?.chat)?current.chat:[];
    const latest=list[list.length-1]||null;

    if(!latest){
      lastChatMessageId=null;
      unreadChatCount=0;
      updateUnreadBadges();
      return;
    }

    const latestId=String(latest.id||"");
    const latestFromOther=String(latest.deviceId||"")!==uid();

    if(!chatSoundPrimed){
      lastChatMessageId=latestId;
      chatSoundPrimed=true;
      live3RefreshUnreadCount();
      return;
    }

    const isNewLatest=!!(latestId && latestId!==lastChatMessageId);
    if(isNewLatest){
      lastChatMessageId=latestId;
      const chatOpen=$3("live3ChatModal")?.classList.contains("open");

      if(chatOpen){
        live3MarkChatRead();
      }else{
        live3RefreshUnreadCount();
      }

      if(latestFromOther){
        playChatReceiveSound();
        if(!chatOpen){
          document.querySelectorAll('.bpt484-head-tools .bpt484-chat').forEach(button=>{
            button.classList.remove('bpt484-feedback-pulse');void button.offsetWidth;button.classList.add('bpt484-feedback-pulse');
            setTimeout(()=>button.classList.remove('bpt484-feedback-pulse'),1100);
          });
        }
      }
      return;
    }

    /* Recompute on every received state so multiple messages arriving between
       two renders produce the exact unread number, not just +1. */
    if(!$3("live3ChatModal")?.classList.contains("open")){
      live3RefreshUnreadCount();
    }
  }

  function onState(){
    maybeNotifyChat();
    render();
    handleBlindSoundAlerts();
    autoAdvanceIfNeeded();
  }

  function escapeHtml(v){
    return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function escapeAttr(v){return escapeHtml(v);}

  function primeBlindAudio(){
    blindSoundPrimed=blindSoundPrimed||false;
    // Les navigateurs mobiles autorisent les sons après une interaction utilisateur.
    // Aucun son n'est joué ici.
  }

  function bind(){
    ["pointerdown","touchstart","keydown"].forEach(evt=>{
      document.addEventListener(evt,primeBlindAudio,{once:true,passive:true});
    });
    setPrepWizardStep(1);
    const today=new Date().toISOString().slice(0,10);
    if($3("live3Date"))$3("live3Date").value=today;
    renderStructurePreview();
    $3("live3TargetHours")?.addEventListener("input",renderStructurePreview);
    $3("live3Stack")?.addEventListener("input",renderStructurePreview);
    $3("live3PlayerPicker")?.addEventListener("change",e=>{
      if(e.target?.matches('input[type="checkbox"]')){
        updateMobilePlayerSelectionCount();
        renderStructurePreview();
      }
    });

    $3("live3MobilePlayerSelectBtn")?.addEventListener("click",openMobilePlayerSelector);
    $3("live3MobilePlayerCloseBtn")?.addEventListener("click",closeMobilePlayerSelector);
    $3("live3MobilePlayerCancelBtn")?.addEventListener("click",closeMobilePlayerSelector);
    $3("live3MobilePlayerValidateBtn")?.addEventListener("click",validateMobilePlayerSelector);
    $3("live3MobilePlayerSearch")?.addEventListener("input",renderMobilePlayerSelector);
    $3("live3MobileClearPlayersBtn")?.addEventListener("click",()=>{
      document.querySelectorAll('#live3MobilePlayerGrid input[type="checkbox"]').forEach(cb=>cb.checked=false);
      document.querySelectorAll('#live3MobilePlayerGrid .bpt-live3-mobile-player-option').forEach(el=>el.classList.remove("is-selected"));
      updateMobilePlayerSelectionCount();
    });
    $3("live3MobilePlayerGrid")?.addEventListener("change",e=>{
      if(e.target?.matches('input[type="checkbox"]')){
        e.target.closest(".bpt-live3-mobile-player-option")?.classList.toggle("is-selected",e.target.checked);
        const modalCount=$3("live3MobileModalCount");
        if(modalCount){
          modalCount.textContent=String(
            document.querySelectorAll('#live3MobilePlayerGrid input[type="checkbox"]:checked').length
          );
        }
      }
    });
    $3("live3MobilePlayerModal")?.addEventListener("click",e=>{
      if(e.target===$3("live3MobilePlayerModal"))closeMobilePlayerSelector();
    });

    $3("live3AddNewPlayerBtn")?.addEventListener("click",addTemporaryLivePlayer);
    $3("live3NewPlayerName")?.addEventListener("keydown",e=>{
      if(e.key==="Enter"){
        e.preventDefault();
        addTemporaryLivePlayer();
      }
    });

    $3("live3PrepNextBtn")?.addEventListener("click",goToPlayerSelection);
    $3("live3PrepBackBtn")?.addEventListener("click",()=>setPrepWizardStep(1));
    $3("live3CreateBtn")?.addEventListener("click",createLive);
    $3("live3StartPauseBtn")?.addEventListener("click",toggleStartPause);
    $3("live3PrevLevelBtn")?.addEventListener("click",()=>changeLevel(-1));
    $3("live3NextLevelBtn")?.addEventListener("click",()=>changeLevel(1));
    $3("live3MinusBtn")?.addEventListener("click",()=>adjustMinute(-60));
    $3("live3PlusBtn")?.addEventListener("click",()=>adjustMinute(60));
    $3("live3ApplyBlindDurationBtn")?.addEventListener("click",applyBlindDuration);
    $3("live3BlindDurationInput")?.addEventListener("keydown",e=>{
      if(e.key==="Enter"){
        e.preventDefault();
        applyBlindDuration();
      }
    });

    $3("live3EliminateBtn")?.addEventListener("click",openElim);
    $3("live3UndoElimBtn")?.addEventListener("click",undoLastElimination);
    $3("live3EndBtn")?.addEventListener("click",endLive);
    $3("live3TakeoverBtn")?.addEventListener("click",requestTakeover);
    $3("live3ForceTakeoverBtn")?.addEventListener("click",forceLive3Takeover);
    $3('bptLogoutBtn')?.addEventListener('click',logoutIdentity);
    $3('bptChangeProfileCodeBtn')?.addEventListener('click',openProfileCodeChange);
    $3('bptChangeProfileCodeCancel')?.addEventListener('click',closeProfileCodeChange);
    $3('bptChangeProfileCodeSave')?.addEventListener('click',changeProfileCode);
    $3("live3SpectatorIdentityConfirmBtn")?.addEventListener("click",setSpectatorIdentity);
    $3("live3SpectatorNameInput")?.addEventListener("change",()=>{
      const btn=$3("live3SpectatorIdentityConfirmBtn");
      if(btn)btn.disabled=true;
      loadProfileCodeState(true);
    });
    $3("live3ApproveTakeoverBtn")?.addEventListener("click",approveTakeover);
    $3("live3RejectTakeoverBtn")?.addEventListener("click",rejectTakeover);

    $3("live3FullscreenBtn")?.addEventListener("click",openFullscreen);
    $3("live3FsExitBtn")?.addEventListener("click",closeFullscreen);
    $3("live3FsStartPauseBtn")?.addEventListener("click",toggleStartPause);
    $3("live3FsEliminateBtn")?.addEventListener("click",openElim);
    $3("live3FsChatActionBtn")?.addEventListener("click",openChat);
    $3("live3FsExitActionBtn")?.addEventListener("click",closeFullscreen);
    $3("live3FsTakeoverActionBtn")?.addEventListener("click",requestTakeover);
    $3("live3FsSpectatorChatBtn")?.addEventListener("click",openChat);
    $3("live3FsSpectatorExitBtn")?.addEventListener("click",closeFullscreen);

    $3("live3ElimConfirmBtn")?.addEventListener("click",eliminate);
    $3("live3ElimPlayer")?.addEventListener("change",refreshEliminationLists);
    $3("live3ElimCancelBtn")?.addEventListener("click",closeElim);
    $3("live3ElimModal")?.addEventListener("click",e=>{if(e.target===$3("live3ElimModal"))closeElim();});
    $3("live3PaceApplyBtn")?.addEventListener("click",live3ApplyPaceAdvice);
    $3("live3PaceKeepBtn")?.addEventListener("click",live3ClosePaceModal);
    $3("live3PaceModal")?.addEventListener("click",e=>{if(e.target===$3("live3PaceModal"))live3ClosePaceModal();});

    $3("live3ChatToast")?.addEventListener("click",e=>{
      if(e.target?.closest?.("#live3ChatToastClose"))return;
      const toast=$3("live3ChatToast");
      openChat();
      if(toast)delete toast.dataset.chatMode;
    });
    $3("live3ChatToastClose")?.addEventListener("click",e=>{
      e.stopPropagation();
      hideChatToast();
    });
    $3("live3PlayersSummaryBtn")?.addEventListener("click",e=>{e.stopPropagation();live3TogglePlayersPopover();});
    $3("live3PlayersSummaryBtn")?.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();live3TogglePlayersPopover();}});
    $3("live3PlayersPopoverClose")?.addEventListener("click",live3ClosePlayersPopover);
    document.addEventListener("click",e=>{const pop=$3("live3PlayersPopover"),btn=$3("live3PlayersSummaryBtn");if(!pop||pop.hidden)return;if(pop.contains(e.target)||btn?.contains(e.target))return;live3ClosePlayersPopover();});
    window.addEventListener("resize",live3PositionPlayersPopover);
    window.addEventListener("scroll",live3PositionPlayersPopover,true);
    $3("live3ChatBtn")?.addEventListener("click",openChat);
    $3("live3ChatCloseBtn")?.addEventListener("click",closeChat);
    $3("live3ChatSendBtn")?.addEventListener("click",sendChat);
    $3("live3ChatInput")?.addEventListener("keydown",e=>{if(e.key==="Enter")sendChat();});
    $3("live3ChatModal")?.addEventListener("click",e=>{if(e.target===$3("live3ChatModal"))closeChat();});

    $3("live3QuitViewBtn")?.addEventListener("click",()=>showView("dashboard"));

    document.addEventListener("visibilitychange",()=>{
      if(!document.hidden){
        if(!liveIdentityConfirmed){
          openSpectatorIdentity(true);
        }else if(isActive() && isOwner()){
          catchUpTimerAfterWake().finally(()=>{render();installListener();});
        }else if(isActive() && !isOwner()){
          updateViewerPresence();
        }
      }
    });

    document.addEventListener("keydown",e=>{
      if(e.key==="Escape"){
        if($3("live3ChatModal")?.classList.contains("open"))closeChat();
        else if($3("live3ElimModal")?.classList.contains("open"))closeElim();
        else if($3("live3PaceModal")?.classList.contains("open"))live3ClosePaceModal();
        else if($3("live3Fullscreen")?.classList.contains("open"))closeFullscreen();
      }
    });

    // When the user enters the tab, refresh local UI; never auto-open fullscreen.
    $3("live3NavBtn")?.addEventListener("click",()=>setTimeout(render,0));

    renderPrepPlayers();
    installListener();
    startSpectatorHeartbeat();

    ticker=setInterval(()=>{
      if(isActive()){
        render();
        handleBlindSoundAlerts();
        autoAdvanceIfNeeded();
        live3MaybeCheckPace();
      }
    },250);

    window.addEventListener("online",installListener);
    document.addEventListener("visibilitychange",()=>{if(!document.hidden)installListener();});
  }

  async function startReflectionTimer(playerName){
    if(!isOwner())return false;
    let started=false;
    await ownerTransaction(s=>{
      if(s.activeReflectionTimer && Number(s.activeReflectionTimer.endsAt||0)>Date.now())return s;
      const p=(s.players||[]).find(x=>x.name===playerName && (x.status==='in'||x.status==='winner'));if(!p)return s;
      s.reflectionTimers=s.reflectionTimers||{};
      const rec=s.reflectionTimers[playerName]||{used:0};
      if(Number(rec.used||0)>=2)return s;
      rec.used=Number(rec.used||0)+1;s.reflectionTimers[playerName]=rec;
      const now=Date.now();s.activeReflectionTimer={player:playerName,startedAt:now,endsAt:now+120000,timerNo:rec.used};s.updatedAt=now;started=true;return s;
    });
    return started;
  }
  async function stopReflectionTimer(){
    if(!isOwner())return false;
    await ownerTransaction(s=>{if(s.activeReflectionTimer){s.lastReflectionTimer={...s.activeReflectionTimer,stoppedAt:Date.now()};s.activeReflectionTimer=null;s.updatedAt=Date.now();}return s;});return true;
  }
  async function toggleAllIn(){
    if(!isOwner())return false;
    await ownerTransaction(s=>{s.allInActive=!s.allInActive;s.allInStartedAt=s.allInActive?Date.now():0;s.updatedAt=Date.now();return s;});return true;
  }
  window.BPTLive3={
    render,
    installListener,
    getState:()=>clone(current),
    deviceId:uid,
    isOwner,
    adjustMinute,
    changeLevel,
    toggleStartPause,
    launchPreGame,
    startAfterBountyReveal,
    returnToBetting,
    returnToPreGameSettings,
    refreshObjectives:()=>ownerTransaction(s=>s),
    resetPlayerProfileCode,
    openElim,
    openChat,
    getUnreadChatCount:()=>unreadChatCount,
    getIdentityName:()=>liveIdentityName(),
    logoutIdentity,
    getVerifiedIdentityName:()=>liveIdentityConfirmed?verifiedProfileName:"",
    openFullscreen,
    closeFullscreen,
    endLive,
    requestTakeover,
    approveTakeover,
    rejectTakeover,
    forceLive3Takeover,
    startReflectionTimer,
    stopReflectionTimer,
    toggleAllIn,
    setLivePrediction,
    confirmLivePredictions,
    undoLastElimination,
    correctLastElimination,
    getLastEliminated:()=>clone(lastEliminatedPlayer()),
    setPaceAdaptive:async(flag)=>{
      if(!isOwner())return false;
      await ownerTransaction(s=>{
        if(flag){
          live3CaptureClassicDurations(s);
          s.paceAdaptive=true;
        }else{
          live3RestoreClassicDurations(s);
        }
        s.updatedAt=Date.now();
        return s;
      });
      if(!flag){try{showBptToast('Mode classique restauré · durées d’origine rétablies','ok');}catch(_e){}}
      return true;
    },
    getPaceAdvice:()=>{
      try{return live3PaceAnalysis();}catch(_e){return null;}
    },
    applyPaceAdvice:async()=>{
      if(!isOwner())return false;
      const advice=live3PaceAnalysis();
      if(!advice)return false;
      await live3AutoApplyPaceAdvice(advice);
      return advice;
    },
    repairStandardBlinds:async()=>{
      if(!isOwner())return false;
      await ownerTransaction(s=>{
        const base=bptGetBlindLevels();
        const old=Array.isArray(s.levels)?s.levels:[];
        const fallback=Math.max(120,Number(old[Math.max(0,Number(s.levelIndex)||0)]?.durationSec)||Number(old[0]?.durationSec)||900);
        const len=Math.max(25,(Number(s.levelIndex)||0)+2);
        const levels=[];
        for(let i=0;i<len;i++){
          let blind=base[i];
          if(!blind){
            const prev=levels[i-1]||{sb:20000,bb:40000};
            blind=bptComputedNextBlindLevel(prev);
          }
          levels.push({level:i+1,sb:Number(blind.sb),bb:Number(blind.bb),ante:0,durationSec:Math.max(120,Number(old[i]?.durationSec)||fallback)});
        }
        s.levels=levels;
        s.levelIndex=Math.max(0,Math.min(levels.length-1,Number(s.levelIndex)||0));
        const dur=Math.max(120,Number(levels[s.levelIndex]?.durationSec)||fallback);
        if(!Number.isFinite(Number(s.remainingSec)) || Number(s.remainingSec)>dur*2)s.remainingSec=dur;
        if(s.running){const now=Date.now();if(s.runStartedAt)s.elapsedSec=Number(s.elapsedSec||0)+Math.max(0,Math.floor((now-Number(s.runStartedAt))/1000));s.runStartedAt=now;s.deadline=now+Math.max(0,Number(s.remainingSec)||dur)*1000;}
        s.updatedAt=Date.now();
        return s;
      });
      return true;
    }
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind);
  else bind();

})();
