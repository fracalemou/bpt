
(function(){
  const POINTS_PATH="bpt/config/points_table";
  const BLINDS_PATH="bpt/config/blind_structure";
  const BLINDS_KEY="bpt_blind_structure_v2";
  const DEFAULT_SB=[25,50,75,100,150,200,300,400,500,600,800,1000,1200,1500,2000,2500,3000,4000,5000,6000,8000,10000,12000,15000,20000];

  function defaultBlinds(){
    return DEFAULT_SB.map(sb=>({sb,bb:sb*2}));
  }

  function normalizeBlinds(rows){
    const src=Array.isArray(rows)?rows:[];
    const out=src
      .map(v=>Number(v?.sb))
      .filter(sb=>Number.isFinite(sb)&&sb>0)
      .map(sb=>({sb:Math.round(sb),bb:Math.round(sb)*2}));
    const merged=out.length?out:defaultBlinds();
    for(const sb of DEFAULT_SB){
      if(merged.length>=25)break;
      if(!merged.some(v=>v.sb===sb))merged.push({sb,bb:sb*2});
    }
    merged.sort((a,b)=>a.sb-b.sb);
    return merged.slice(0,25);
  }

  function setBlinds(rows){
    window.BPT_BLIND_LEVELS=normalizeBlinds(rows);
    try{
      localStorage.setItem(BLINDS_KEY,JSON.stringify(window.BPT_BLIND_LEVELS));
    }catch(_e){}
    return window.BPT_BLIND_LEVELS;
  }

  function loadBlinds(){
    try{
      const raw=localStorage.getItem(BLINDS_KEY);
      if(raw)return normalizeBlinds(JSON.parse(raw));
    }catch(_e){}
    return defaultBlinds();
  }

  window.BPT_BLIND_LEVELS=loadBlinds();

  function pointStepper(value,n,place){
    return `<div class="bpt-point-stepper" data-n="${n}" data-place="${place}">
      <span class="bpt-point-value-display">${Number(value)||0}</span>
      <button type="button" class="bpt-point-up" aria-label="Augmenter les points">▲</button>
      <button type="button" class="bpt-point-down" aria-label="Diminuer les points">▼</button>
    </div>`;
  }

  function renderPoints(){
    const head=document.getElementById("bptPointsMatrixHead");
    const body=document.getElementById("bptPointsMatrixBody");
    const info=document.getElementById("bptPointsTableInfo");
    if(!head||!body)return;

    const table=bptGetPointsTable();

    let header='<tr><th class="bpt-points-sticky">Joueurs</th>';
    for(let place=1;place<=22;place++)header+=`<th>${place}e</th>`;
    header+='</tr>';
    head.innerHTML=header;

    let rows='';
    for(let n=6;n<=22;n++){
      rows+=`<tr><th class="bpt-points-sticky">${n}</th>`;
      const row=table[String(n)]||{};

      for(let place=1;place<=22;place++){
        if(place>n){
          rows+='<td class="na">—</td>';
        }else{
          rows+=`<td>${pointStepper(row[String(place)]||0,n,place)}</td>`;
        }
      }

      rows+='</tr>';
    }

    body.innerHTML=rows;
    if(info)info.textContent="Barème complet de 6 à 22 joueurs · chaque case est modifiable.";
  }

  function collectPoints(){
    const table=bptNormalizePointsTable(bptGetPointsTable());

    document.querySelectorAll(".bpt-point-stepper").forEach(stepper=>{
      const n=String(Number(stepper.dataset.n)||0);
      const place=String(Number(stepper.dataset.place)||0);
      const value=Math.max(0,Number(stepper.querySelector(".bpt-point-value-display")?.textContent)||0);

      if(table[n]&&place!=="0")table[n][place]=value;
    });

    return table;
  }

  function blindStepper(value,index){
    return `<div class="bpt-blind-stepper" data-index="${index}">
      <span class="bpt-blind-sb-value">${value}</span>
      <button type="button" class="bpt-blind-up" aria-label="Augmenter la SB">▲</button>
      <button type="button" class="bpt-blind-down" aria-label="Diminuer la SB">▼</button>
    </div>`;
  }

  function renderBlinds(){
    const body=document.getElementById("bptBlindStructureBody");
    const info=document.getElementById("bptBlindStructureInfo");
    if(!body)return;

    const levels=normalizeBlinds(window.BPT_BLIND_LEVELS);

    body.innerHTML=levels.map((v,i)=>`
      <tr>
        <td>Niveau ${i+1}</td>
        <td>${blindStepper(v.sb,i)}</td>
        <td class="bpt-blind-bb-value">${v.bb}</td>
      </tr>
    `).join("");

    if(info)info.textContent=`${levels.length} niveaux configurés.`;
  }

  function collectBlinds(){
    const levels=normalizeBlinds(window.BPT_BLIND_LEVELS);
    document.querySelectorAll(".bpt-blind-stepper").forEach(stepper=>{
      const i=Number(stepper.dataset.index);
      const sb=Math.max(25,Number(stepper.querySelector(".bpt-blind-sb-value")?.textContent)||25);
      if(levels[i])levels[i]={sb,bb:sb*2};
    });
    return levels;
  }

  async function saveRemote(path,value){
    if(!window.bptFirebaseEnsure)return;
    await window.bptFirebaseEnsure();
    const dbx=window.bptFirebaseDb?.();
    if(dbx)await dbx.ref(path).set(value);
  }

  async function loadRemote(){
    try{
      if(!window.bptFirebaseEnsure)return;
      await window.bptFirebaseEnsure();
      const dbx=window.bptFirebaseDb?.();
      if(!dbx)return;

      const [p,b]=await Promise.all([
        dbx.ref(POINTS_PATH).once("value"),
        dbx.ref(BLINDS_PATH).once("value")
      ]);

      if(p.exists())bptSetPointsTable(p.val());
      if(b.exists())setBlinds(b.val());

      renderPoints();
      renderBlinds();

      try{
        db.history=recalcCurrentSeasonPoints(db.history);
        renderAll();
      }catch(_e){}
    }catch(e){
      console.warn("Configuration BPT partagée :",e);
    }
  }

  document.addEventListener("click",async e=>{
    const pointStepperEl=e.target?.closest?.(".bpt-point-stepper");
    if(pointStepperEl && (e.target.closest(".bpt-point-up")||e.target.closest(".bpt-point-down"))){
      const valueEl=pointStepperEl.querySelector(".bpt-point-value-display");
      const current=Math.max(0,Number(valueEl?.textContent)||0);
      const next=e.target.closest(".bpt-point-up") ? current+1 : Math.max(0,current-1);
      if(valueEl)valueEl.textContent=String(next);
      return;
    }

    const stepper=e.target?.closest?.(".bpt-blind-stepper");
    if(stepper && (e.target.closest(".bpt-blind-up")||e.target.closest(".bpt-blind-down"))){
      const valueEl=stepper.querySelector(".bpt-blind-sb-value");
      const row=stepper.closest("tr");
      const bbEl=row?.querySelector(".bpt-blind-bb-value");

      const current=Math.max(25,Number(valueEl?.textContent)||25);
      const delta=e.target.closest(".bpt-blind-up")?25:-25;
      const next=Math.max(25,current+delta);

      if(valueEl)valueEl.textContent=String(next);
      if(bbEl)bbEl.textContent=String(next*2);
      return;
    }

    if(e.target?.closest?.("#saveBptPointsTableBtn")){
      try{
        const t=bptSetPointsTable(collectPoints());
        await saveRemote(POINTS_PATH,t);
        try{
          db.history=recalcCurrentSeasonPoints(db.history);
          renderAll();
        }catch(_e){}
        alert("Barème de points enregistré.");
      }catch(err){
        alert(err?.message||String(err));
      }
      return;
    }

    if(e.target?.closest?.("#resetBptPointsTableBtn")){
      try{
        const t=bptSetPointsTable(bptDefaultPointsTable());
        await saveRemote(POINTS_PATH,t);
        renderPoints();
        alert("Barème BPT par défaut restauré.");
      }catch(err){
        alert(err?.message||String(err));
      }
      return;
    }

    if(e.target?.closest?.("#saveBptBlindStructureBtn")){
      try{
        const v=setBlinds(collectBlinds());
        await saveRemote(BLINDS_PATH,v);
        renderBlinds();
        alert("Structure des blinds enregistrée.");
      }catch(err){
        alert(err?.message||String(err));
      }
      return;
    }

    if(e.target?.closest?.("#resetBptBlindStructureBtn")){
      try{
        const v=setBlinds(defaultBlinds());
        await saveRemote(BLINDS_PATH,v);
        renderBlinds();
        alert("Structure BPT restaurée.");
      }catch(err){
        alert(err?.message||String(err));
      }
    }
  });

  document.addEventListener("DOMContentLoaded",()=>{
    try{
      renderPoints();
      renderBlinds();
      setTimeout(loadRemote,1200);
    }catch(e){
      console.warn("UI configuration BPT :",e);
    }
  });
})();
