// The public invitation carries a theme and one role. Answers stay on the device.
const duetPrompts = {
  love: ['如果下班后只剩半小时，你想怎样一起过？', '把喜欢说出口', '给对方留一盏灯', '先把小事照顾好', '约一次说走就走的散步'],
  encounter: ['你还记得第一次见面时，对方说了什么吗？', '从偶遇里找话头', '和人并肩走一段', '从共同爱好聊起', '给新朋友在桌边留个座'],
  career: ['真要一起做一件事，第一步交给谁？', '先动手搭个样子', '理清事情的顺序', '让双方把话说透', '守住收尾的细节'],
  self: ['你最近哪件小事，最像卡上的自己？', '安静地留意细节', '先试一个新点子', '把站在边上的人拉进来', '按自己的步子走一会儿'],
  wallet: ['一起过一个开心的周末，你们会把钱花在哪？', '给开心留一份预算', '把旧物重新用起来', '请大家坐下来吃饭', '为期待的体验慢慢攒'],
  fortune: ['今天各自最想做哪件小事？写下来交换看看吧。', '带头迈出第一步', '给忙乱留一点空', '把手边的小物修好', '约想念的人出来走走'],
  travel: ['下一站只有半天，你最想替对方安排什么？', '把车次和路线安排好', '顺着香味拐个弯', '照顾走慢的那个人', '把一路的声音留下来'],
  chat: ['现在给对方发条语音，你想用什么开场？', '用一句玩笑暖场', '听见晚安的后半句', '给这一天选首歌', '把下次见面定下来'],
  jianghu: ['要再送一次鱼灯，你们俩想在哪座桥会合？', '从倒影中认出路', '给鱼灯补一弯月', '让一条街都来帮忙', '带着鱼灯跃上船']
};

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionOn = !motionPreference.matches && !navigator.connection?.saveData;
let invitedBy = null;
let filmRun = 0;
let film = null, tick = 0, playing = false, exporting = false;
let gifUrl='', hdUrl='';
const width=360, height=442;

// Every entry point uses the same photographed action as the fifth answer.
const tileChoice={love:0,encounter:0,career:2,self:1,wallet:2,fortune:0,travel:2,chat:2,jianghu:3};
const departmentChoice={love:'love-3',career:'career-0',self:'self-3',wallet:'wallet-1',fortune:'fortune-1',play:'jianghu-2'};
function chosenShot(item,choice,type){
  return {stem:item.key+'-'+choice,choice,type,key:item.key,label:item.label,role:item.roles[type],caption:item.questions[4][2+choice]};
}
function setupSample(sample,item,type){
  const shot=chosenShot(item,type,type);
  sample.querySelector('strong').textContent=shot.role.name;
  sample.querySelector('figcaption span').textContent=shot.caption;
  sample.ontoggle=()=>{
    if(sample.open)setClip(sample.querySelector('.sample-art'),shot.stem,true);
    else forgetClips(sample);
  };
}
function drawEcho(){
  const hello=get('friendHello');
  hello.hidden=!(page===0 && invitedBy?.key===theme.key);
  if(!hello.hidden)hello.textContent='朋友测到的是「'+roles[invitedBy.type].name+'」。你选完这十题，就能看到你们的双人卡。';
  const echo=get('sceneEcho');echo.hidden=page!==5;
  if(echo.hidden){forgetClips(echo);return;}
  setClip(echo.querySelector('.echo-art'),theme.key+'-'+answers[4],true);
  echo.querySelector('figcaption').textContent='你选的那一幕 · '+questions[4][answers[4]+2];
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

function clearFilm(){
  ++filmRun;cancelAnimationFrame(tick);playing=false;exporting=false;
  if(film?.video){film.video.pause();film.video.removeAttribute('src');film.video.load();}
  film=null;
  for(const url of [gifUrl,hdUrl])if(url.startsWith('blob:'))URL.revokeObjectURL(url);
  hdUrl='';gifUrl='';
  for(const id of ['gifPanel','hdPanel','duet','duetCard','duetSave','filmCanvas','filmPlay','retryFilm','duetRetry'])get(id).hidden=true;
  for(const id of ['duetCard','hdImage','gifImage'])get(id).removeAttribute('src');
  for(const id of ['duetSave','hdSave','gifSave']){const a=get(id);a.removeAttribute('href');a.onclick=null;}
  get('filmStatus').textContent='';get('filmPosition').textContent='';
  for(const [id,label] of [['hdMake','保存高清动图'],['gifMake','制作小尺寸 GIF']]){get(id).disabled=true;get(id).textContent=label;}
}
function drawFrame(c,shot,media){
  c.save();c.scale(c.canvas.width/width,c.canvas.height/height);
  c.fillStyle='#fbf2df';c.fillRect(0,0,width,height);
  c.fillStyle=shot.role.ink;c.fillRect(0,0,width,35);
  c.fillStyle='#fff6dc';c.font='bold 13px "Microsoft YaHei",sans-serif';c.fillText('有点像我　/　'+shot.label,16,23);
  c.fillStyle='#61594c';c.font='14px "Microsoft YaHei",sans-serif';c.fillText('我选的那一幕',16,64);
  c.drawImage(media,0,80,360,608/3);
  c.fillStyle=shot.role.ink;c.font='bold 26px "Microsoft YaHei",serif';c.fillText(shot.role.name,16,321,328);
  c.fillStyle='#283b34';c.font='17px "Microsoft YaHei",sans-serif';
  wrapCardText(c,shot.caption,328).forEach((line,i)=>c.fillText(line,16,353+i*23));
  c.fillStyle=shot.role.ink;c.fillRect(16,401,30,2);
  c.font='12px "Microsoft YaHei",sans-serif';c.fillStyle='#59594e';
  c.fillText(shot.key==='fortune'?'民俗趣签 · 仅供娱乐':'生活趣测 · 我的选择',16,427);
  c.restore();
}
function drawCrop(c,media,x,y,w,h){
  const iw=media.videoWidth||media.naturalWidth||media.width,ih=media.videoHeight||media.naturalHeight||media.height;
  const scale=Math.max(w/iw,h/ih),sw=w/scale,sh=h/scale;
  c.drawImage(media,(iw-sw)/2,(ih-sh)/2,sw,sh,x,y,w,h);
}
function presentFilm(){
  if(film?.video.readyState>=2)drawFrame(get('filmCanvas').getContext('2d'),film,film.video);
  get('filmPlay').textContent=playing?'暂停画面':'播放画面';
}
function pauseFilm(){
  cancelAnimationFrame(tick);playing=false;film?.video.pause();if(film)presentFilm();
}
async function playFilm(){
  const current=film;if(!current || current.video.readyState<2)return;
  try{
    await current.video.play();if(current!==film || current.video.paused)return;
    playing=true;let last=-100;
    function frame(now){
      if(current!==film||!playing)return;
      if(now-last>=34){presentFilm();last=now;}
      tick=requestAnimationFrame(frame);
    }
    cancelAnimationFrame(tick);tick=requestAnimationFrame(frame);
  }catch{if(current===film){pauseFilm();get('filmStatus').textContent='点「播放画面」可再试一次。';}}
}
async function openFilm(type){
  clearFilm();const run=filmRun,item=theme,shot=chosenShot(item,answers[4],type);
  if(invitedBy?.key===item.key)showDuet(item,invitedBy.type,type,run);
  const v=motionVideo();film=shot;shot.video=v;v.preload='auto';v.src=motionPath(shot.stem);
  get('filmStatus').textContent='正在载入你选的那一幕…';
  // The published HD image can also be opened if a device cannot decode H.264.
  get('hdMake').disabled=!publishedCard(shot);
  try{
    await waitClip(v);if(run!==filmRun)return;
    get('filmCanvas').hidden=false;get('filmPlay').hidden=false;
    get('filmCanvas').setAttribute('aria-label',shot.role.name+'。'+shot.caption);
    get('filmPosition').textContent='我选的那一幕';get('filmStatus').textContent='';
    get('hdMake').disabled=false;get('gifMake').disabled=false;presentFilm();
    if(motionOn && !document.hidden)playFilm();
  }catch{if(run===filmRun){get('filmStatus').textContent='画面没载入，可以重试。';get('retryFilm').hidden=false;}}
}
function publishedCard(shot){
  return 'cards/'+shot.stem+'-'+shot.type+'.gif?v=10';
}
async function exportFilm(hd){
  if(!film||exporting)return;
  const shot=film,run=filmRun,id=hd?'hd':'gif',panel=get(id+'Panel'),img=get(id+'Image'),save=get(id+'Save'),status=get('filmStatus');
  if(hd?hdUrl:gifUrl){panel.hidden=false;panel.scrollIntoView({block:'center'});return;}
  const button=get(id+'Make'),remote=hd?publishedCard(shot):'';
  const filename=shot.role.name+'-'+shot.caption+'.gif';
  exporting=true;get('hdMake').disabled=true;get('gifMake').disabled=true;pauseFilm();
  let v,url='',blob;
  try{
    if(remote){button.textContent='正在打开高清原图…';url=remote;}
    else{
      v=motionVideo();v.preload='auto';v.src=motionPath(shot.stem);await waitClip(v);
      const canvas=document.createElement('canvas'),scale=hd?3:1;canvas.width=width*scale;canvas.height=height*scale;
      const c=canvas.getContext('2d',{willReadFrequently:true}),gif=window.cardGif.GIFEncoder();
      const n=Math.round(v.duration*(hd?12:10));
      let palette;
      for(let i=0;i<n;i++){
        if(run!==filmRun)return;
        button.textContent='正在制作 '+Math.round(100*i/n)+'%';await seekClip(v,i*v.duration/n);
        if(run!==filmRun)return;
        drawFrame(c,shot,v);const rgba=c.getImageData(0,0,canvas.width,canvas.height).data;
        if(!palette)palette=window.cardGif.quantize(rgba,256);
        const delay=10*(Math.round(100*(i+1)*v.duration/n)-Math.round(100*i*v.duration/n));
        gif.writeFrame(window.cardGif.applyPalette(rgba,palette),canvas.width,canvas.height,{palette,delay,repeat:0});
        await new Promise(done=>setTimeout(done,0));
      }
      gif.finish();blob=new Blob([gif.bytes()],{type:'image/gif'});url=await inlineImageURL(blob);
    }
    if(run!==filmRun)return;
    img.src=url;await img.decode();if(run!==filmRun)return;
    if(hd)hdUrl=url;else gifUrl=url;
    panel.hidden=false;bindMediaSave(save,img,url,filename,blob);
    panel.scrollIntoView({block:'center'});
    status.textContent=hd?'高清动图已打开 · 1080 × 1326':'小尺寸动图已打开 · 360 × 442';
    button.textContent=hd?'查看高清动图':'查看小尺寸 GIF';
  }catch{
    if(run!==filmRun)return;
    img.removeAttribute('src');status.textContent='动图没有载入，请重试。';button.textContent=hd?'重试高清动图':'重试小尺寸 GIF';
  }finally{
    if(v){v.pause();v.removeAttribute('src');v.load();}
    if(run===filmRun){exporting=false;get('hdMake').disabled=!publishedCard(shot)&&shot.video.readyState<2;get('gifMake').disabled=shot.video.readyState<2;}
  }
}

function inviteURL(key,type) {
  return 'https://galen-lu.github.io/trip-postcard-free/?v=10&play='+encodeURIComponent(key)+'#friend='+type;
}

async function copyInvite() {
  const run=filmRun,type=winner(answers);
  const message='我在「'+theme.label+'」里测到的是「'+roles[type].name+'」。你觉得像吗？测完看看咱俩的双人卡。 '+inviteURL(theme.key,type);
  const status=get('inviteMessage');
  let copied=false;
  try{await navigator.clipboard.writeText(message);copied=true;}catch{}
  if(run!==filmRun)return;
  status.textContent=copied?'邀请已复制，可以粘贴到微信。对方会看到你的角色名。':'长按复制这段邀请（含你的角色名）　'+message;
  status.hidden=false;
}

async function showDuet(item,from,to,run) {
  const friend=item.roles[from],me=item.roles[to],lines=duetPrompts[item.key];
  const note=from===to?'这次，你们都更愿意'+lines[to+1]+'。上一次这样做，你们各自想到了谁？':'这次，朋友更愿意'+lines[from+1]+'，你更愿意'+lines[to+1]+'。';
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
    c.font='bold 42px serif';c.fillText('我们俩的双人卡',26,92);
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
