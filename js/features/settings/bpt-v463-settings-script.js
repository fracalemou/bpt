
(function(){
  const modal=document.getElementById('live3SettingsPanel');
  const openBtn=document.getElementById('live3SettingsBtn');
  const closeBtn=document.getElementById('live3SettingsCloseBtn');
  if(!modal||!openBtn)return;
  const open=()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false');};
  const close=()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true');};
  openBtn.addEventListener('click',open);
  closeBtn?.addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal)close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))close();});
})();
