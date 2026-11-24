// The public invitation carries a theme and one role. Answers stay on the device.
const duetPrompts = {
  love: ['如果下班后只剩半小时，你想怎样一起过？', '把喜欢说出口', '给对方留一盏灯', '先把小事照顾好', '约一次意外的出走'],
  encounter: ['把你们第一次说话的那一幕，分别讲给对方听？', '从偶遇里找话头', '和人并肩走一段', '从共同爱好聊起', '把新朋友拉进圆桌'],
  career: ['真要一起做一件事，第一步交给谁？', '先动手搭个样子', '理清事情的顺序', '让双方把话说透', '守住收尾的细节'],
  self: ['你最近哪件小事，最像卡上的自己？', '安静地留意细节', '先试一个新点子', '把站在边上的人拉进来', '留一段自己的节奏'],
  wallet: ['一起过一个开心的周末，你们会把钱花在哪？', '给开心留一份预算', '把旧物重新用起来', '请大家坐下来吃饭', '为期待的体验慢慢攒'],
  fortune: ['把今天最想做的一件小事，写下来交换看看？', '带头迈出第一步', '给忙乱留一点空', '把手边的小物修好', '约想念的人出来走走'],
  travel: ['下一站只有半天，你最想替对方安排什么？', '把车次和路线安排好', '顺着香味拐个弯', '照顾走慢的那个人', '把一路的声音留下来'],
  chat: ['现在给对方发条语音，你想用什么开场？', '用一句玩笑暖场', '听见晚安的后半句', '给这一天选首歌', '把下次见面定下来'],
  jianghu: ['要再送一次鱼灯，你们俩想在哪座桥会合？', '从倒影中认出路', '给鱼灯补一弯月', '让一条街都来帮忙', '带着鱼灯跃上船']
};

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionOn = !motionPreference.matches && !navigator.connection?.saveData;
let invitedBy = null;
let filmRun = 0;
let film = null;
let tick = 0;
let elapsed = 0;
let playing = false;
let gifUrl = '', hdUrl = '';
let activeShot=-1;
let exporting=false;
const sceneDuration = 3400;
const width = 360, height = 442;

function scenesFor(item, choices, type) {
  const q0 = item.questions[0], q4 = item.questions[4], role = item.roles[type];
  return [
    {title:q0[0], caption:q0[2+choices[0]], stem:item.key+'-opening',src:artUrl(item.key,'opening')},
    {title:q4[0], caption:q4[2+choices[4]], stem:item.key+'-'+choices[4],src:artUrl(item.key,choices[4])},
    {title:role.name, caption:role.tag, stem:item.key+'-portrait'+type,src:artUrl(item.key,'portrait'+type)}
  ];
}

function setupSample(sample, item, type) {
  const scenes = scenesFor(item, Array(10).fill(type), type);
  let position = 0, timer;
  function draw() {
    const shot = scenes[position];
    setClip(sample.querySelector('.sample-art'),shot.stem,true);
    sample.querySelector('strong').textContent = ['开场','选择','角色'][position]+' · '+shot.title;
    sample.querySelector('figcaption span').textContent = shot.caption;
  }
  function step() { position=(position+1)%3; draw(); }
  sample.querySelector('button').onclick=step;
  sample.ontoggle=()=>{
    clearInterval(timer);
    if(!sample.open)forgetClips(sample);
    if (sample.open) {
      position=0; draw();
      timer=setInterval(()=>{if(motionOn && !document.hidden && !get('home').hidden) step();},sceneDuration);
    }
  };
}

function drawEcho() {
  const hello=get('friendHello');
  hello.hidden=!(page===0 && invitedBy?.key===theme.key);
  if(!hello.hidden) hello.textContent='朋友抽到了「'+roles[invitedBy.type].name+'」。你选完这十题，就能看到你们的双人卡。';
  const echo=get('sceneEcho');
  echo.hidden=page!==1 && page!==5;
  if(echo.hidden) return;
  const scene=page===1?0:4;
  setClip(echo.querySelector('.echo-art'),theme.key+'-'+(scene===0?'opening':answers[4]),true);
  echo.querySelector('figcaption').textContent='已收入小片 · '+questions[scene][answers[scene]+2];
}

function setMotion(enabled) {
  motionOn=enabled;
  document.documentElement.classList.toggle('still',!enabled);
  get('motionSwitch').setAttribute('aria-pressed',String(enabled));
  get('motionSwitch').textContent='动态画面 '+(enabled?'开':'关');
  if (!enabled && playing) pauseFilm();
  if (!enabled){get('gifPanel').hidden=true;get('hdPanel').hidden=true;}refreshClips();
  document.dispatchEvent(new Event('motionchange'));
}

function loadArt(src) {
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>resolve(img);
    img.onerror=()=>reject(new Error('art unavailable'));
    img.src=src;
  });
}

function clearFilm() {
  filmRun++;
  cancelAnimationFrame(tick);
  playing=false; elapsed=0; activeShot=-1; exporting=false;
  for(const shot of film?.shots || []) if(shot.video){shot.video.pause();shot.video.removeAttribute('src');shot.video.load();}
  film=null;
  if(gifUrl) URL.revokeObjectURL(gifUrl);
  if(hdUrl)URL.revokeObjectURL(hdUrl);gifUrl='';hdUrl='';get('hdMake').disabled=true;get('hdMake').textContent='制作高清动图';
  for(const id of ['gifPanel','hdPanel','duet','duetCard','duetSave','filmCanvas','filmNext','filmPlay','retryFilm','duetRetry']) get(id).hidden=true;
  for(const id of ['duetCard','gifImage','hdImage']) get(id).removeAttribute('src');
  for(const id of ['duetSave','gifSave','hdSave']) get(id).removeAttribute('href');
  get('filmPosition').textContent='';
  get('filmStatus').textContent='';
  get('gifMake').disabled=true;
  get('gifMake').textContent='制作微信 GIF';
}

// Keep the onscreen artwork and the saved GIF on the same drawing path.
function drawFrame(c, story, index, phase, media) {
  const shot=story.shots[index];
  c.save();
  c.scale(c.canvas.width/width,c.canvas.height/height);
  c.fillStyle='#fbf2df'; c.fillRect(0,0,width,height);
  c.fillStyle=story.ink; c.fillRect(0,0,width,36);
  c.fillStyle='#fff6dc'; c.font='bold 13px sans-serif';
  c.fillText('有点像我   /   '+story.label,15,23);
  c.textAlign='right'; c.fillText(['序幕   1 / 3','我选的那一幕   2 / 3','我的角色   3 / 3'][index],345,23);
  c.textAlign='left';
  c.save(); c.beginPath(); c.rect(0,36,360,267); c.clip();
  drawCrop(c,media || shot.img,0,36,360,267);
  c.restore();
  c.fillStyle=story.ink; c.font='bold 28px "Microsoft YaHei",serif';
  c.fillText(shot.title,16,342,330);
  c.fillStyle='#263b34'; c.font='17px "Microsoft YaHei",sans-serif';
  wrapCardText(c,shot.caption,328).forEach((line,i)=>c.fillText(line,16,373+i*23));
  for(let i=0;i<3;i++){c.fillStyle=i===index?story.ink:'#d6cdba';c.fillRect(16+i*32,426,26,3);}
  c.fillStyle='#54584e'; c.textAlign='right'; c.font='11px sans-serif';
  c.fillText(story.key==='fortune'?'民俗趣签 · 仅供娱乐':'我的三幕小片',344,431);
  c.restore();
}

function drawCrop(c,media,x,y,w,h){
  const iw=media.videoWidth||media.naturalWidth||media.width,ih=media.videoHeight||media.naturalHeight||media.height;
  const scale=Math.max(w/iw,h/ih),sw=w/scale,sh=h/scale;
  c.drawImage(media,(iw-sw)/2,(ih-sh)/2,sw,sh,x,y,w,h);
}
function previewShot(shot){
  if(!shot.video){
    const video=motionVideo();video.preload='auto';video.src=motionPath(shot.stem);shot.video=video;
    video.addEventListener('loadeddata',()=>{if(film?.shots[activeShot]===shot && !playing)presentFilm();},{once:true});
  }
  return shot.video;
}
function presentFilm() {
  const span=3*sceneDuration;
  const index=Math.min(2,Math.floor(elapsed/sceneDuration));
  if(activeShot!==index){
    film.shots[activeShot]?.video?.pause();activeShot=index;
    if(playing){const v=previewShot(film.shots[index]);v.currentTime=0;v.play().catch(()=>{});}
  }
  const video=film.shots[index].video;
  drawFrame(get('filmCanvas').getContext('2d'),film,index,elapsed/sceneDuration,video?.readyState>=2?video:null);
  get('filmPosition').textContent=['第一幕 · 开场','第二幕 · 我的选择','第三幕 · 我的角色'][index];
  get('filmPlay').textContent=playing?'暂停':elapsed>=span?'重播小片':'播放小片';
}

function pauseFilm() {
  cancelAnimationFrame(tick); playing=false;
  film?.shots[activeShot]?.video?.pause();
  if(film) presentFilm();
}

function playFilm() {
  if(!film) return;
  if(elapsed>=sceneDuration*3) elapsed=0;
  playing=true;
  const idx=Math.min(2,Math.floor(elapsed/sceneDuration));
  const video=previewShot(film.shots[idx]);video.play().catch(()=>{});
  const startTime=performance.now()-elapsed;
  let lastDraw=-100;
  function frame(now) {
    elapsed=Math.min(sceneDuration*3,now-startTime);
    if(elapsed>=sceneDuration*3){pauseFilm();return;}
    if(now-lastDraw>=42){presentFilm();lastDraw=now;}
    tick=requestAnimationFrame(frame);
  }
  tick=requestAnimationFrame(frame);
}

async function openFilm(type) {
  clearFilm();
  const run=filmRun,item=theme;
  const shots=scenesFor(item,answers,type);
  get('filmStatus').textContent='正在装入你的三幕画面…';
  if(invitedBy?.key===item.key) showDuet(item,invitedBy.type,type,run);
  try {
    const images=await Promise.all(shots.map(s=>loadArt(s.src)));
    if(run!==filmRun) return;
    shots.forEach((s,i)=>s.img=images[i]);
    film={key:item.key,label:item.label,ink:item.roles[type].ink,shots};
    get('filmCanvas').setAttribute('aria-label',shots.map(s=>s.title+'。'+s.caption).join('　'));
    for(const id of ['filmCanvas','filmPlay','filmNext']) get(id).hidden=false;
    get('gifMake').disabled=false;get('hdMake').disabled=false;
    get('filmStatus').textContent='';
    presentFilm();
    if(motionOn && !document.hidden) playFilm();
  }catch{
    if(run!==filmRun)return;
    get('filmStatus').textContent='小片的场景还没载入，可以重试。';
    get('retryFilm').hidden=false;
  }
}

async function exportFilm(hd) {
  const panel=hd?'hdPanel':'gifPanel', cached=hd?hdUrl:gifUrl;
  if(cached){get(panel).hidden=false;get(panel).scrollIntoView({block:'center'});return;}
  if(!film || exporting)return;
  const run=filmRun,story=film,button=get(hd?'hdMake':'gifMake');
  const videos=[];
  exporting=true;get('hdMake').disabled=true;get('gifMake').disabled=true;pauseFilm();
  let degraded=false;
  try{
    const surface=document.createElement('canvas'),scale=hd?3:1;
    surface.width=width*scale;surface.height=height*scale;
    const ctx=surface.getContext('2d',{willReadFrequently:!hd});
    const encoder=hd?null:window.cardGif.GIFEncoder(), frames=[];
    const count=hd?16:9;
    for(let i=0;i<3;i++){
      const shot=story.shots[i],v=motionVideo();videos.push(v);v.preload='auto';v.src=motionPath(shot.stem);
      let ready=true;
      try{await waitClip(v);}catch{ready=false;degraded=true;}
      let palette;
      for(let f=0;f<count;f++){
        if(run!==filmRun)return;
        button.textContent='制作中 '+Math.round(100*(i*count+f)/(3*count))+'%';
        if(ready){
          try{await seekClip(v,Math.min(v.duration-.06,2.9*f/(count-1)));}catch{ready=false;degraded=true;}
        }
        if(run!==filmRun)return;
        drawFrame(ctx,story,i,f/(count-1),ready?v:null);
        const delay=f===count-1?700:Math.round(2700/(count-1));
        if(hd){
          const blob=await new Promise(done=>surface.toBlob(done,'image/webp',.87));
          if(!blob || blob.type!=='image/webp')throw Error('WebP unavailable');
          frames.push({bytes:new Uint8Array(await blob.arrayBuffer()),delay});
        }else{
          const data=ctx.getImageData(0,0,width,height).data;
          if(!palette)palette=window.cardGif.quantize(data,256);
          encoder.writeFrame(window.cardGif.applyPalette(data,palette),width,height,{palette,delay,repeat:0});
        }
        await new Promise(done=>setTimeout(done,0));
      }
    }
    if(run!==filmRun)return;
    let blob;
    if(hd)blob=animatedWebP(surface.width,surface.height,frames);
    else{encoder.finish();blob=new Blob([encoder.bytes()],{type:'image/gif'});}
    const url=URL.createObjectURL(blob), save=get(hd?'hdSave':'gifSave');
    if(hd)hdUrl=url;else gifUrl=url;
    get(hd?'hdImage':'gifImage').src=url;save.href=url;
    save.download=story.shots[2].title+(hd?'-高清三幕.webp':'-微信三幕.gif');
    get(panel).hidden=false;get(panel).scrollIntoView({block:'center'});
    get('filmStatus').textContent=(hd?'1080 × 1326 高清动图':'微信 GIF')+' · '+(blob.size/1048576).toFixed(1)+' MB'+(degraded?' · 部分镜头使用了静帧':'');
    button.textContent=hd?'查看高清动图':'查看微信 GIF';
  }catch{
    if(run!==filmRun)return;
    get('filmStatus').textContent='这个格式暂时未能保存，可以重试，或选择另一种动图格式。';
    button.textContent=hd?'重试高清动图':'重试微信 GIF';
  }finally{
    for(const v of videos){v.pause();v.removeAttribute('src');v.load();}
    if(run===filmRun){exporting=false;get('hdMake').disabled=false;get('gifMake').disabled=false;}
  }
}
function inviteURL(key,type) {
  return 'https://galen-lu.github.io/trip-postcard-free/?v=8&play='+encodeURIComponent(key)+'#friend='+type;
}

async function copyInvite() {
  const run=filmRun,type=winner(answers);
  const message='我在「'+theme.label+'」里是「'+roles[type].name+'」。你觉得像吗？测完看看咱俩的双人卡。 '+inviteURL(theme.key,type);
  const status=get('inviteMessage');
  let copied=false;
  try{await navigator.clipboard.writeText(message);copied=true;}catch{}
  if(run!==filmRun)return;
  status.textContent=copied?'邀请已复制，可以粘贴到微信。对方会看到你的角色名。':'长按复制这段邀请（含你的角色名）　'+message;
  status.hidden=false;
}

async function showDuet(item,from,to,run) {
  const friend=item.roles[from],me=item.roles[to],lines=duetPrompts[item.key];
  const note=from===to?'你们都习惯'+lines[to+1]+'。上一次这样做，你们各自想到了谁？':'朋友习惯'+lines[from+1]+'，你习惯'+lines[to+1]+'。';
  get('duet').hidden=false;
  get('duetText').textContent=note+' '+lines[0];
  get('duetRetry').hidden=true;
  try{
    const pictures=await Promise.all([loadArt(artUrl(item.key,'portrait'+from)),loadArt(artUrl(item.key,from===to?to:'portrait'+to))]);
    if(run!==filmRun)return;
    const canvas=document.createElement('canvas');canvas.width=720;canvas.height=746;
    const c=canvas.getContext('2d');
    c.fillStyle='#fff3dd';c.fillRect(0,0,720,746);
    c.fillStyle=me.ink;c.fillRect(0,0,720,116);
    c.fillStyle='#fff5de';c.font='bold 22px sans-serif';c.fillText('有点像我   /   '+item.label,28,39);
    c.font='bold 42px serif';c.fillText('我们俩碰在一起',26,92);
    pictures.forEach((im,i)=>{
      const x=i*360;drawCrop(c,im,x,116,360,360);
      c.fillStyle=i?me.ink:friend.ink;c.fillRect(x,476,360,77);
      c.fillStyle='#fff6df';c.font='18px sans-serif';c.fillText(i?'我':'邀请我的朋友',x+16,502);
      c.font='bold 27px sans-serif';c.fillText(i?me.name:friend.name,x+16,538,328);
    });
    c.fillStyle='#263e35';c.font='25px sans-serif';
    wrapCardText(c,note,657).forEach((s,i)=>c.fillText(s,30,598+i*34));
    c.fillStyle=me.ink;c.font='bold 24px sans-serif';
    wrapCardText(c,lines[0],657).forEach((s,i)=>c.fillText(s,30,690+i*31));
    const url=canvas.toDataURL('image/png');
    get('duetCard').src=url;get('duetCard').alt=friend.name+' 和 '+me.name+'。'+note;
    get('duetSave').href=url;get('duetSave').download=friend.name+'和'+me.name+'-双人卡.png';
    get('duetCard').hidden=false;get('duetSave').hidden=false;
  }catch{if(run===filmRun)get('duetRetry').hidden=false;}
}

function initStories() {
  setMotion(motionOn);
  get('motionSwitch').onclick=()=>setMotion(!motionOn);
  get('gifMake').onclick=()=>exportFilm(false);
  get('hdMake').onclick=()=>exportFilm(true);
  get('sceneView').onclick=()=>{
    const type=answers[4],video=get('bigScene');
    resetScenePhoto();
    video.poster=artUrl(theme.key,type);video.src=motionPath(theme.key+'-'+type);
    get('bigCaption').textContent=theme.questions[4][type+2];
    if(typeof get('sceneDialog').showModal==='function')get('sceneDialog').showModal();else get('sceneDialog').setAttribute('open','');
    video.play().catch(()=>{});
  };
  get('scenePhotoMode').onclick=showScenePhoto;
  function closeBig(){resetScenePhoto();const v=get('bigScene');v.pause();v.removeAttribute('src');v.load();}
  get('sceneDialog').addEventListener('close',closeBig);
  get('closeScene').onclick=()=>{const d=get('sceneDialog');if(typeof d.close==='function')d.close();else{d.removeAttribute('open');closeBig();}};

  get('filmPlay').onclick=()=>playing?pauseFilm():playFilm();
  get('filmNext').onclick=()=>{if(!film)return;pauseFilm();elapsed=((Math.floor(elapsed/sceneDuration)+1)%3)*sceneDuration;presentFilm();};
  get('inviteCopy').onclick=copyInvite;
  get('retryFilm').onclick=()=>openFilm(winner(answers));
  get('duetRetry').onclick=()=>showDuet(theme,invitedBy.type,winner(answers),filmRun);
  document.addEventListener('visibilitychange',()=>{if(document.hidden && playing) pauseFilm();refreshClips();});
  window.addEventListener('hashchange',openInvitation);openInvitation();
}
function openInvitation(){
  invitedBy=null;
  const item=themes.find(t=>t.key===new URLSearchParams(location.search).get('play'));
  if(!item)return;
  const friend=new URLSearchParams(location.hash.slice(1)).get('friend');
  if(friend!==null && /^[0-3]$/.test(friend)) invitedBy={key:item.key,type:Number(friend)};
  chooseSection(sections.find(s=>s.items.includes(item.key)));
  selectTheme(item);start();
}
