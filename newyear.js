const wishPeople={family:'家人',love:'爱人',friend:'朋友',work:'同事',self:'自己'};
const wishScenes=[
 {key:'reunion',title:'团圆安康',scene:'围桌包饺子',ink:'#8f302a',words:[
  '愿家里的灯总为团圆亮着。新的一年，你们身体安康，我们常回家吃饭。',
  '愿我们忙完各自的日子，还有时间一起揉面、包饺子，把热乎的第一口留给彼此。',
  '今年也多聚几回吧。一盘热饺子，两双筷子，慢慢讲完这一年的故事。',
  '忙碌了一年，愿你安心回家吃顿团圆饭。新岁身康心安，家中常有笑声。',
  '愿我在新的一年，好好吃饭，好好休息，也把自己算进想照顾的人里。']},
 {key:'pair',title:'好事成双',scene:'双鲤灯映河',ink:'#863337',words:[
  '一盏灯照平安，一盏灯照喜乐。愿咱们家新一年的好消息，总能成双地来。',
  '两尾鱼灯并肩游，像我们一起走过的路。新一年的每一桩小喜事，我都想先说给你听。',
  '愿你有好消息时有人一起欢呼，有好风景时有人一起停下。新岁好事成双！',
  '愿你的付出遇见好机会，好成绩遇见懂得欣赏的人。新年双喜临门。',
  '愿我既有独自前行的勇气，也有与人分享的欢喜。新的一年，好事成双。']},
 {key:'summit',title:'前程似锦',scene:'登高迎初日',ink:'#774220',words:[
  '新年的第一束光照上山顶。愿家里每个人都有自己的好去处，也有回家时的好心情。',
  '愿你走向心里的山顶。我想听你讲沿途的风景，也想陪你看下一场日出。',
  '愿你走上一直想走的那条路，步子可以慢，沿途总有让你眼睛发亮的风景。',
  '愿新一年的努力都有回响。手里的项目稳稳收尾，想尝试的新机会也慢慢打开。',
  '愿我敢踏出第一步，也舍得在半山看风景。一阶一阶，走向自己喜欢的未来。']},
 {key:'plum',title:'心愿开花',scene:'融雪映红梅',ink:'#872b4a',words:[
  '红梅在院子里开了。愿咱家那些念叨过的小心愿，今年一件一件有着落。',
  '愿我们随口说过的「以后一起」，在新的一年慢慢开花，变成两个人真的去过的地方。',
  '你认真喜欢的那件事，我一直记得。愿它在新年里遇到春天，开出属于你的花。',
  '愿那些反复打磨过的想法都有开花的一天。新岁有灵感，也有把它做成的从容。',
  '愿我给心愿一点时间，像等一枝梅花。哪怕只开一朵，也值得为自己高兴。']},
 {key:'citrus',title:'大吉有喜',scene:'分一瓣新春橘',ink:'#844021',words:[
  '分一只甜橘，把大吉送到家。愿你们新岁少些操心，多些能笑着说给我听的小喜事。',
  '新年的第一口甜，想分给你。愿往后的平常日子，也有我们一起剥橘子时的欢喜。',
  '送你一瓣甜，也送你一声大吉。愿你今年笑点多多，连普通周末都能过出滋味。',
  '把开年的好彩头分你一份。愿你做事顺手，下班准点，还有时间尝一尝生活的甜。',
  '送自己一只甜橘。愿我记得庆祝每件小事，新年有喜，也有好好生活的胃口。']},
 {key:'sail',title:'一路顺风',scene:'春江扬白帆',ink:'#275563',words:[
  '春江起帆，惦记随行。愿家里人每一趟出门都顺利，每一次归来都有热饭相迎。',
  '愿你去想去的地方，一路有好风。无论哪天靠岸，我都想听你讲这一路的见闻。',
  '愿新风吹满你的船帆。出发时有期待，转弯时有惊喜，靠岸时有人等你吃饭。',
  '新的一程，愿协作顺畅，方向清楚。遇到风浪时有人搭手，抵达时一起举杯。',
  '愿我顺风时尽兴向前，起风时也稳得住舵。新的一年，按自己的节奏出发。']}
];
let wishPerson='family',wishChoice=wishScenes[0],wishState=null,wishRun=0,wishFrame=0,wishURL='',wishBusy=false;

function wishStateNow(){
  return {person:wishPerson,choice:wishChoice,to:get('wishTo').value.trim(),from:get('wishFrom').value.trim()};
}
function wishText(state){return state.choice.words[Object.keys(wishPeople).indexOf(state.person)];}
function address(state){return state.to || ({family:'亲爱的家人',love:'亲爱的你',friend:'我的朋友',work:'并肩的伙伴',self:'新一年的自己'})[state.person];}
function updateWishEditor(){
  for(const b of get('wishPeople').children)b.setAttribute('aria-pressed',String(b.dataset.person===wishPerson));
  for(const b of get('wishScenes').children){
    const selected=b.dataset.wish===wishChoice.key;
    b.setAttribute('aria-pressed',String(selected));
    setClip(b.querySelector('.wish-thumb'),'newyear-'+b.dataset.wish,selected);
  }
  get('wishDraft').textContent=wishText(wishStateNow());
}
function stopWish(){
  wishRun++;wishBusy=false;cancelAnimationFrame(wishFrame);
  if(wishState?.video){wishState.video.pause();wishState.video.removeAttribute('src');wishState.video.load();}
  wishState=null;
  if(wishURL)URL.revokeObjectURL(wishURL);wishURL='';
  get('wishImage').removeAttribute('src');get('wishDownload').removeAttribute('href');
  get('wishExport').hidden=true;get('wishRetry').hidden=true;get('wishStatus').textContent='';
}
function editWish(reset){
  stopWish();
  if(reset){wishPerson='family';wishChoice=wishScenes[0];get('wishTo').value='';get('wishFrom').value='';}
  show('blessing');get('wishEditor').hidden=false;get('wishResult').hidden=true;updateWishEditor();
  get('wishEditor').querySelector('h1').focus({preventScroll:true});
}
function paintWish(canvas,media,s){
  const c=canvas.getContext('2d'),w=540,h=675,scale=canvas.width/w;
  c.save();c.scale(scale,scale);
  c.fillStyle='#fff5dd';c.fillRect(0,0,w,h);
  c.fillStyle=s.choice.ink;c.fillRect(0,0,w,48);
  c.fillStyle='#fff2d5';c.font='bold 16px "Microsoft YaHei",sans-serif';
  c.fillText('有点像我   /   新年祝福',22,30);c.textAlign='right';c.fillText('新春寄语',518,30);
  c.textAlign='left';drawCrop(c,media,0,48,540,305);
  c.fillStyle=s.choice.ink;c.font='bold 46px "STKaiti","KaiTi",serif';c.fillText(s.choice.title,22,418);
  c.font='bold 22px "Microsoft YaHei",sans-serif';c.fillText('给'+address(s),24,463,492);
  c.fillStyle='#383d32';c.font='22px "Microsoft YaHei",sans-serif';
  wrapCardText(c,wishText(s),489).forEach((line,i)=>c.fillText(line,24,504+31*i));
  c.fillStyle='#c7ad85';c.fillRect(24,622,492,1);
  c.fillStyle=s.choice.ink;c.font='17px "Microsoft YaHei",sans-serif';c.fillText(s.choice.scene,24,654);
  c.textAlign='right';c.fillText(s.from?s.from+' 敬上':'新岁吉祥',516,654,300);c.restore();
}
function animateWish(){
  cancelAnimationFrame(wishFrame);
  const state=wishState;
  if(!state?.still)return;
  const canvas=get('wishCanvas'),v=state.video;
  if(!motionOn || document.hidden || !v){v?.pause();paintWish(canvas,state.still,state);return;}
  v.play().catch(()=>{});
  let last=0;
  const tick=now=>{
    if(state!==wishState || !motionOn || document.hidden)return;
    if(now-last>=42){paintWish(canvas,v.readyState>=2?v:state.still,state);last=now;}
    wishFrame=requestAnimationFrame(tick);
  };
  wishFrame=requestAnimationFrame(tick);
}
function wishButtons(ready){for(const id of ['wishHD','wishGIF','wishPNG'])get(id).disabled=!ready;}
async function previewWish(){
  stopWish();const run=wishRun,s=wishStateNow();wishState=s;
  show('blessing');get('wishEditor').hidden=true;get('wishResult').hidden=false;
  get('wishHeading').textContent='送给'+address(s)+'的贺卡';get('wishHeading').focus({preventScroll:true});
  get('wishWords').textContent='给'+address(s)+' · '+wishText(s);
  get('wishCanvas').setAttribute('aria-label',get('wishWords').textContent);get('wishCanvas').hidden=true;wishButtons(false);
  const stem='newyear-'+s.choice.key;
  try{
    const still=await loadArt(posterPath(stem));if(run!==wishRun)return;s.still=still;
    const v=motionVideo();v.src=motionPath(stem);s.video=v;
    paintWish(get('wishCanvas'),still,s);get('wishCanvas').hidden=false;wishButtons(true);animateWish();
  }catch{if(run===wishRun){get('wishStatus').textContent='贺卡照片还没载入，可以重试。';get('wishRetry').hidden=false;}}
}
async function saveWish(format){
  const s=wishState,run=wishRun;if(!s?.still||wishBusy)return;
  wishBusy=true;wishButtons(false);const v=motionVideo();
  try{
    const canvas=document.createElement('canvas');canvas.width=format==='gif'?432:1080;canvas.height=canvas.width*1.25;
    let blob;
    if(format==='png'){
      paintWish(canvas,s.still,s);blob=await new Promise(done=>canvas.toBlob(done,'image/png'));
    }else{
      v.preload='auto';v.src=motionPath('newyear-'+s.choice.key);await waitClip(v);
      const hd=format==='webp',n=hd?24:14,delay=Math.round(3000/n),frames=[];
      const gif=hd?null:window.cardGif.GIFEncoder();let palette;
      for(let i=0;i<n;i++){
        if(run!==wishRun)return;
        get('wishStatus').textContent='正在制作贺卡 '+Math.round(100*i/n)+'%';
        await seekClip(v,Math.min(v.duration-.05,i*3/n));
        if(run!==wishRun)return;paintWish(canvas,v,s);
        if(hd){
          const frame=await new Promise(done=>canvas.toBlob(done,'image/webp',.87));
          if(!frame||frame.type!=='image/webp')throw Error('unsupported');
          frames.push({bytes:new Uint8Array(await frame.arrayBuffer()),delay});
        }else{
          const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
          if(!palette)palette=window.cardGif.quantize(pixels,256);
          gif.writeFrame(window.cardGif.applyPalette(pixels,palette),canvas.width,canvas.height,{palette,delay,repeat:0});
        }
      }
      if(hd)blob=animatedWebP(canvas.width,canvas.height,frames);
      else{gif.finish();blob=new Blob([gif.bytes()],{type:'image/gif'});}
    }
    if(!blob)throw Error('empty file');if(run!==wishRun)return;
    if(wishURL)URL.revokeObjectURL(wishURL);wishURL=URL.createObjectURL(blob);
    get('wishImage').src=wishURL;const link=get('wishDownload');link.href=wishURL;link.download=s.choice.title+'-新年贺卡.'+format;
    link.textContent='保存'+({webp:'高清动态贺卡',gif:'微信 GIF 贺卡',png:'高清静态贺卡'})[format];
    get('wishExport').hidden=false;get('wishStatus').textContent='贺卡已做好 · '+canvas.width+' × '+canvas.height+' · 可以长按下图保存';
    get('wishExport').scrollIntoView({block:'center'});
  }catch{if(run===wishRun)get('wishStatus').textContent='这次制作未完成，可以重试，或换一种保存格式。';}
  finally{v.pause();v.removeAttribute('src');v.load();if(run===wishRun){wishBusy=false;wishButtons(true);}}
}
function wishShareUrl(s){
  const hash=new URLSearchParams({wish:s.choice.key,person:s.person});
  if(s.to)hash.set('to',s.to);if(s.from)hash.set('from',s.from);
  return 'https://galen-lu.github.io/trip-postcard-free/?v=8&play=newyear#'+hash;
}
async function copyWish(){
  const run=wishRun,message='送你一张「'+wishChoice.title+'」的新年贺卡。 '+wishShareUrl(wishStateNow());
  let copied=false;try{await navigator.clipboard.writeText(message);copied=true;}catch{}
  if(run!==wishRun)return;
  get('wishStatus').textContent=copied?'已复制。把链接发到微信，对方打开就能看到这张贺卡。':'长按复制这段祝福　'+message;
}
function loadWishRoute(){
  if(new URLSearchParams(location.search).get('play')!=='newyear')return;
  const h=new URLSearchParams(location.hash.slice(1)),choice=wishScenes.find(v=>v.key===h.get('wish'));
  editWish(true);
  if(!choice)return;
  wishChoice=choice;wishPerson=Object.hasOwn(wishPeople,h.get('person'))?h.get('person'):'family';
  get('wishTo').value=(h.get('to')||'').slice(0,16);get('wishFrom').value=(h.get('from')||'').slice(0,16);previewWish();
}
function initWishes(){
  const entry=get('newyearEntry');setClip(entry.querySelector('.year-cover'),'cover-newyear',true);
  entry.onclick=()=>editWish(true);
  for(const [key,label] of Object.entries(wishPeople)){
    const button=document.createElement('button');button.dataset.person=key;button.textContent=label;
    button.onclick=()=>{wishPerson=key;updateWishEditor();};get('wishPeople').append(button);
  }
  for(const s of wishScenes){
    const b=document.createElement('button');b.dataset.wish=s.key;
    b.innerHTML='<span class="wish-thumb"><img alt=""></span><strong></strong><small></small>';
    b.querySelector('strong').textContent=s.title;b.querySelector('small').textContent=s.scene;
    b.onclick=()=>{wishChoice=s;updateWishEditor();};get('wishScenes').append(b);
  }
  get('wishHome').onclick=()=>{stopWish();show('home');entry.focus({preventScroll:true});};
  get('wishMake').onclick=previewWish;get('wishRetry').onclick=previewWish;
  get('wishEdit').onclick=()=>editWish(false);get('wishNew').onclick=()=>editWish(true);
  get('wishHD').onclick=()=>saveWish('webp');get('wishGIF').onclick=()=>saveWish('gif');get('wishPNG').onclick=()=>saveWish('png');
  get('wishLink').onclick=copyWish;
  document.addEventListener('visibilitychange',animateWish);document.addEventListener('motionchange',animateWish);
  window.addEventListener('hashchange',loadWishRoute);loadWishRoute();
}
