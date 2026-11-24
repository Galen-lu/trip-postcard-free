function posterPath(stem, small=false) {
  if(stem==='spring-demo')return springPhoto('reunion',true);
  return 'art/'+stem+(small?'-sm':'')+'.webp?v=8';
}
function motionPath(stem) {
  if(stem==='spring-demo')return springPreviewURL();
  return 'film/'+stem+'.mp4?v=10';
}
function nativeSceneURL(stem){return 'film/'+stem+'.webp?v=10';}
function motionVideo() {
  const v=document.createElement('video');
  v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;v.preload='none';
  v.setAttribute('muted','');v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');
  v.setAttribute('aria-hidden','true');
  return v;
}
function releaseClip(host) {
  const v=host.querySelector('video');
  if(!v)return;
  v.pause();v.removeAttribute('src');v.load();v.remove();host.classList.remove('clip-ready');
}
function syncClip(host) {
  const active=motionOn && !document.hidden && host.dataset.active==='yes' && host.dataset.visible==='yes' && host.isConnected;
  if(!active){releaseClip(host);return;}
  if(host.querySelector('video'))return;
  const v=motionVideo();
  v.onplaying=()=>{if(v.isConnected)host.classList.add('clip-ready');};
  v.onerror=()=>{host.classList.remove('clip-ready');};
  host.append(v);v.src=motionPath(host.dataset.clip);
  v.play().catch(()=>host.classList.remove('clip-ready'));
}
const clipObserver=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{
  for(const entry of entries){
    entry.target.dataset.visible=entry.isIntersecting?'yes':'no';
    syncClip(entry.target);
  }
},{threshold:.1}):null;
function setClip(host,stem,active) {
  if(host.dataset.clip!==stem){
    releaseClip(host);host.dataset.clip=stem;
    const img=host.querySelector('img');img.loading='lazy';img.src=posterPath(stem,true);
  }
  host.classList.add('motion-art');
  host.dataset.active=active?'yes':'no';
  if(clipObserver)clipObserver.observe(host);else host.dataset.visible='yes';
  syncClip(host);
}
function forgetClips(container) {
  for(const h of container.querySelectorAll('.motion-art')){clipObserver?.unobserve(h);releaseClip(h);}
}
function refreshClips(){document.querySelectorAll('.motion-art').forEach(syncClip);}

// Animated WebP holds true-color full-resolution frames from the selected film.
function le(n,bytes){const v=new Uint8Array(bytes);for(let i=0;i<bytes;i++)v[i]=(n>>>(8*i))&255;return v;}
const ascii=s=>Uint8Array.from(s,c=>c.charCodeAt(0));
function riffChunk(name,parts) {
  const size=parts.reduce((n,p)=>n+p.length,0),out=new Uint8Array(8+size+(size%2));
  out.set(ascii(name));out.set(le(size,4),4);
  let at=8;for(const p of parts){out.set(p,at);at+=p.length;}
  return out;
}
function imagePayload(bytes) {
  const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),chunks=[];
  for(let i=12;i+8<=bytes.length;){
    const name=String.fromCharCode(...bytes.subarray(i,i+4)),n=dv.getUint32(i+4,true),end=i+8+n+(n%2);
    if(name==='VP8 '||name==='VP8L'||name==='ALPH')chunks.push(bytes.subarray(i,end));
    i=end;
  }
  if(!chunks.length)throw Error('WebP unavailable');
  return chunks;
}
function animatedWebP(w,h,frames){
  const header=riffChunk('VP8X',[Uint8Array.of(2,0,0,0),le(w-1,3),le(h-1,3)]);
  const anim=riffChunk('ANIM',[new Uint8Array(6)]);
  const chunks=frames.map(({bytes,delay})=>riffChunk('ANMF',[new Uint8Array(6),le(w-1,3),le(h-1,3),le(delay,3),Uint8Array.of(2),...imagePayload(bytes)]));
  const size=4+header.length+anim.length+chunks.reduce((n,c)=>n+c.length,0);
  return new Blob([ascii('RIFF'),le(size,4),ascii('WEBP'),header,anim,...chunks],{type:'image/webp'});
}
function seekClip(video, seconds) {
  if(video.readyState>=2 && Math.abs(video.currentTime-seconds)<.01)return Promise.resolve();
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>done(new Error('seek timeout')),4500);
    function done(error){clearTimeout(timer);video.removeEventListener('seeked',ok);video.removeEventListener('error',bad);error?reject(error):resolve();}
    function ok(){done();}function bad(){done(new Error('decode failed'));}
    video.addEventListener('seeked',ok);video.addEventListener('error',bad);
    try{video.currentTime=seconds;}catch(error){done(error);}
  });
}
function waitClip(video) {
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>done(new Error('clip timeout')),10000);
    function done(error){clearTimeout(timer);video.removeEventListener('loadeddata',ok);video.removeEventListener('error',bad);error?reject(error):resolve();}
    function ok(){done();}function bad(){done(new Error('clip unavailable'));}
    video.addEventListener('loadeddata',ok);video.addEventListener('error',bad);
    if(video.readyState>=2)ok();else video.load();
  });
}
let dialogRun=0,dialogBlob='';
function resetScenePhoto(){
  ++dialogRun;
  if(dialogBlob)URL.revokeObjectURL(dialogBlob);
  dialogBlob='';get('scenePhoto').hidden=true;get('scenePhoto').removeAttribute('src');
  get('sceneDownload').hidden=true;get('sceneDownload').removeAttribute('href');
  get('scenePhotoMode').hidden=false;get('scenePhotoMode').disabled=false;
  get('sceneSaveHint').hidden=true;get('scenePhotoMode').textContent='打开高清动图';get('bigScene').hidden=false;
}
async function showScenePhoto(){
  const run=dialogRun, stem=theme.key+'-'+answers[4],button=get('scenePhotoMode'),big=get('bigScene');
  let url=nativeSceneURL(stem);
  button.disabled=true;big.pause();
  try{
    if(!url){
      // A self-contained offline page builds the same format from its embedded HD clip.
      const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;
      const context=canvas.getContext('2d'),frames=[];
      if(big.readyState<2)await waitClip(big);
      const count=Math.round(big.duration*12);
      for(let i=0;i<count;i++){
        if(run!==dialogRun)return;
        button.textContent='制作中 '+Math.round(i/count*100)+'%';
        await seekClip(big,i/12);context.drawImage(big,0,0,1280,720);
        const b=await new Promise(done=>canvas.toBlob(done,'image/webp',.78));
        if(!b || b.type!=='image/webp')throw Error('WebP unavailable');
        frames.push({bytes:new Uint8Array(await b.arrayBuffer()),delay:Math.round((i+1)*1000/12)-Math.round(i*1000/12)});
      }
      if(run!==dialogRun)return;
      url=await inlineImageURL(animatedWebP(1280,720,frames));
    }
    const img=get('scenePhoto');img.src=url;await img.decode();
    if(run!==dialogRun)return;
    big.hidden=true;img.hidden=false;button.hidden=true;
    get('sceneSaveHint').hidden=false;bindMediaSave(get('sceneDownload'),img,url,theme.label+'-'+theme.questions[4][answers[4]+2]+'.webp');
  }catch{if(run===dialogRun){button.textContent='重试高清动图';button.disabled=false;}}
}
