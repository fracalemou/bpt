/* BPT 10.4.137 — rappel de stack FACULTATIF, sans pause de chronomètre.
 * Uniquement pour un joueur encore en lice et identifié; une seule fois par niveau et par appareil.
 * La session Firebase contrôle le niveau; un réveil après veille retrouve le niveau en cours.
 */
(function(root){
  'use strict';
  const ID='bpt-blind-stack-reminder';
  const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  function dismissed(key){try{return sessionStorage.getItem(key)==='1'}catch(_){return false}}
  function dismiss(key){try{sessionStorage.setItem(key,'1')}catch(_){}}
  function hide(){const n=document.getElementById(ID);if(n)n.hidden=true;}
  function ensureBanner(){
    let el=document.getElementById(ID);if(el)return el;
    el=document.createElement('aside');el.id=ID;el.hidden=true;el.setAttribute('role','status');el.setAttribute('aria-live','polite');
    el.innerHTML='<div class="bpt-reminder-title">Nouveau niveau de blind</div><p>Tu peux actualiser ton stack maintenant, sans interrompre le chronomètre.</p><div class="bpt-reminder-actions"><button type="button" data-stack-reminder="open">Compter mon stack</button><button type="button" data-stack-reminder="ignore">Ignorer</button></div>';
    el.addEventListener('click',event=>{
      const btn=event.target.closest('button[data-stack-reminder]');if(!btn)return;
      const key=el.dataset.key||'';if(key)dismiss(key);hide();
      if(btn.dataset.stackReminder==='open'){
        const open=document.querySelector('.bpt-stack-open');if(open)open.click();
        else console.warn('BPT : compteur indisponible');
      }
    });
    document.body.appendChild(el);return el;
  }
  function tick(){
    const api=root.BPTLive3,state=api?.getState?.();
    const name=api?.getVerifiedIdentityName?.();
    if(!state?.active||!state.startedAt||!state.sessionId||!name||Number(state.levelIndex)<1){hide();return;}
    const livePlayer=(state.players||[]).find(p=>normalize(p.name)===normalize(name)&&p.status==='in');
    if(!livePlayer){hide();return;}
    const level=Number(state.levelIndex)+1;
    const key='bpt_stack_blind_prompt:'+state.sessionId+':'+normalize(name)+':'+level;
    const latest=root.BPTStackSync?.getLatest?.(livePlayer.name);
    if(dismissed(key) || (latest && Number(latest.level)>=level)){hide();return;}
    const el=ensureBanner();if(el.dataset.key!==key){el.dataset.key=key;el.querySelector('.bpt-reminder-title').textContent='Blind '+level+' — relevé facultatif';}
    // Ne pas ouvrir de modale; ne jamais modifier le chrono ou Firebase.
    el.hidden=false;
  }
  function install(){ensureBanner();tick();setInterval(tick,1300);document.addEventListener('bpt-stack-records-updated',tick);document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick()});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})(window);
