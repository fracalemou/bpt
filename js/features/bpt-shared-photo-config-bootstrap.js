
(function(){
  try{
    const key="bpt_photo_host_config_v1";
    const existing=JSON.parse(localStorage.getItem(key)||"{}");
    if(!existing.cloudName || !existing.uploadPreset){
      localStorage.setItem(key,JSON.stringify({
        cloudName:"peesjsvk",
        uploadPreset:"BPTchampionship"
      }));
    }
  }catch(_e){}
})();
