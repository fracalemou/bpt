
setTimeout(()=>{
  if(typeof migrateLegacyPhotoMapsToUrls==="function"){
    migrateLegacyPhotoMapsToUrls().catch(e=>console.warn("Migration photos existantes :",e));
  }
},3000);
