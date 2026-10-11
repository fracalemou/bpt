
(function(){
  const bind=()=>{
    const close=document.getElementById("playerAvatarPickerClose");
    const cancel=document.getElementById("playerAvatarPickerCancel");
    const save=document.getElementById("playerAvatarPickerSave");
    const grid=document.getElementById("playerAvatarGrid");
    const bd=document.getElementById("playerAvatarPickerBackdrop");
    if(close)close.onclick=closePlayerAvatarPicker;
    if(cancel)cancel.onclick=closePlayerAvatarPicker;
    if(save)save.onclick=saveSelectedPlayerAvatar;
    if(grid)grid.onclick=e=>{const btn=e.target?.closest?.(".avatar-option");if(btn)selectPlayerAvatar(btn.dataset.avatarId||"");};
    if(bd)bd.onclick=e=>{if(e.target===e.currentTarget)closePlayerAvatarPicker();};
  };
  bind();
})();
