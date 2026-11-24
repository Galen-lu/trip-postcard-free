function inlineImageURL(blob){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();reader.onload=()=>resolve(reader.result);
    reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);
  });
}

function bindMediaSave(link,media,url,filename,blob){
  const inWeChat=/MicroMessenger/i.test(navigator.userAgent);
  const mobile=inWeChat||/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
  const image=media.tagName==='IMG';
  link.href=url;link.download=filename;link.hidden=false;link.onclick=null;
  let file;
  if(mobile && blob && navigator.share && navigator.canShare){
    try{
      const candidate=new File([blob],filename,{type:blob.type});
      if(navigator.canShare({files:[candidate]}))file=candidate;
    }catch{}
  }
  if(file){
    link.removeAttribute('download');link.href='#';link.textContent='系统保存或分享';
    link.onclick=async event=>{
      event.preventDefault();
      try{await navigator.share({files:[file]});}
      catch(error){if(error.name!=='AbortError'&&image)media.scrollIntoView({block:'center'});}
    };
  }else if(mobile && image){
    // A download link in WeChat invokes its external-browser prompt. Leave the
    // native long-press menu of the actual <img> untouched.
    link.removeAttribute('href');link.removeAttribute('download');link.hidden=true;
  }else{
    link.textContent=image?'下载动图文件':'保存视频文件';
    if(blob?.type==='image/png')link.textContent='下载图片文件';
  }
}
