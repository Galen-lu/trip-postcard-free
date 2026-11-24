const wishPeople={family:'家人',love:'爱人',friend:'朋友',work:'同事',self:'自己'};
const wishScenes=[
 {key:'reunion',title:'团圆安康',words:[
  '新年想许个朴实的愿望：咱们一家人都好好的，能多坐下来吃几顿饭。',
  '愿我们忙完各自的日子，还有时间一起揉面、包饺子，把热乎的第一口留给彼此。',
  '今年也多聚几回吧。一盘热饺子，两双筷子，慢慢讲完这一年的故事。',
  '忙碌了一年，愿你安心回家吃顿团圆饭。新岁身康心安，家中常有笑声。',
  '愿我在新的一年，好好吃饭，好好休息，也把自己算进想照顾的人里。']},
 {key:'pair',title:'好事成双',words:[
  '一盏灯送平安，一盏灯送喜乐。愿咱们家今年好事成双，笑声常在。',
  '两尾鱼灯并肩游，像我们一起走过的路。新一年的每一桩小喜事，我都想先说给你听。',
  '愿你有好消息时有人一起欢呼，有好风景时有人一起停下。新岁好事成双！',
  '祝你新的一年，想做的事有机会做，做成的事也有人一起庆祝。',
  '愿我既有独自前行的勇气，也有与人分享的欢喜。新的一年，好事成双。']},
 {key:'summit',title:'前程似锦',words:[
  '新年的第一束光照上山顶。愿家里每个人都有自己的好去处，也有回家时的好心情。',
  '愿你走向心里的山顶。我想听你讲沿途的风景，也想陪你看下一场日出。',
  '愿你走上一直想走的那条路，步子可以慢，沿途总有让你眼睛发亮的风景。',
  '祝你手里的事顺利收尾，想试的新方向，也有人愿意和你一起做。',
  '愿我敢踏出第一步，也舍得在半山看风景。一阶一阶，走向自己喜欢的未来。']},
 {key:'plum',title:'心愿开花',words:[
  '红梅在院子里开了。愿咱家那些念叨过的小心愿，今年一件一件有着落。',
  '愿我们随口说过的「以后一起」，在新的一年慢慢开花，变成两个人真的去过的地方。',
  '你认真喜欢的那件事，我一直记得。愿它在新年里遇到春天，开出属于你的花。',
  '愿那些反复打磨过的想法都有开花的一天。新岁有灵感，也有把它做成的从容。',
  '愿我给心愿一点时间，像等一枝梅花。哪怕只开一朵，也值得为自己高兴。']},
 {key:'citrus',title:'大吉有喜',words:[
  '剥开一只甜橘，把这份好彩头送到家。愿你们新岁少些操心，多些能笑着说给我听的小喜事。',
  '新年的第一口甜，想分给你。愿往后的平常日子，也有我们一起剥橘子时的欢喜。',
  '留一瓣最甜的橘子给你。愿今年我们都有空碰面，一点小事也能笑上半天。',
  '把开年的好彩头分你一份。愿你做事顺手，下班准点，还有时间尝一尝生活的甜。',
  '送自己一只甜橘。愿我记得庆祝每件小事，新年有喜，也有好好生活的胃口。']},
 {key:'sail',title:'一路顺风',words:[
  '出门的时候一路顺风，回来的时候饭菜正热。愿家里人这一年都平平安安。',
  '愿你去想去的地方，一路有好风。无论哪天靠岸，我都想听你讲这一路的见闻。',
  '愿新风吹满你的船帆。出发时有期待，转弯时有惊喜，靠岸时有人等你吃饭。',
  '新的一程，愿协作顺畅，方向清楚。遇到风浪时有人搭手，抵达时一起举杯。',
  '愿我顺风时尽兴向前，起风时也稳得住舵。新的一年，按自己的节奏出发。']}
];
let wishPerson='family',wishChoice=wishScenes[0],occasion='spring',strokes=[],spots=[],customNote=false;
let wishView='author';
let wishState=null,wishRun=0,wishFrame=0,wishURL='',wishBusy=false,elapsedWish=0,awaitingOpen=false;
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const greets={
  newyear:['元旦快乐，今年的第一声问候想先送回家。','新年的第一天，还是最想和你一起过。','元旦快乐，第一束烟花给一直惦记的你。','元旦快乐，谢谢你一路并肩。','元旦快乐，给愿意重新出发的自己。'],
  eve:['除夕到了，最想念的还是咱们这一桌人。','今夜守岁，我想和你多坐一会儿。','除夕快乐，隔着屏幕也陪你守一会儿岁。','辛苦一年，愿你今晚安心陪家人吃顿饭。','这一年辛苦了，今夜也留一盏灯给自己。']
};
const endings={reunion:'愿想见的人常在身边，平安相聚。',pair:'愿每一份好消息，都有人与你分享。',summit:'愿新路上有好风景，每一步都走得踏实。',plum:'愿那件认真期待的小事，在春天开花。',citrus:'送你一瓣甜橘，愿日子里常有小小的欢喜。',sail:'愿你出发时有好风，靠岸时有热饭。'};
function defaultWish(person,choice,day){
  const i=Object.keys(wishPeople).indexOf(person);
  if(day==='spring')return choice.words[i];
  const selfEnd={reunion:'愿我留出时间，和想见的人好好吃顿饭。',pair:'愿我遇到高兴的事，记得找人分享。',summit:'愿我一步一步，走到想去的地方。',plum:'愿那件一直想做的小事，今年能开个好头。',citrus:'给自己留一瓣最甜的橘子，也记得庆祝小小的进步。',sail:'愿我按自己的节奏出发，顺风时也看看沿途的风景。'};
  return greets[day][i]+(person==='self'?selfEnd[choice.key]:endings[choice.key]);
}
function wishText(s){return s.note || defaultWish(s.person,s.choice,s.occasion);}
function address(s){return s.to || ({family:'亲爱的家人',love:'亲爱的你',friend:'我的朋友',work:'并肩的伙伴',self:'新一年的自己'})[s.person];}
function wishStateNow(){
  const s={person:wishPerson,choice:wishChoice,occasion,to:get('wishTo').value.trim(),from:get('wishFrom').value.trim(),note:customNote?get('wishNote').value.trim().replace(/\s+/g,' '):'',strokes:compactSketch(strokes)};
  s.spots=spots.map(p=>p.slice());s.model=springScene(s);return s;
}
function compactSketch(lines){
  const present=lines.slice(0,16).filter(a=>a.length),total=present.reduce((n,line)=>n+Math.min(38,line.length),0);
  return present.map(line=>{
    const n=Math.max(1,Math.min(38,line.length,Math.floor(Math.min(38,line.length)*240/total)));
    return Array.from({length:n},(_,i)=>line[n===1?0:Math.round(i*(line.length-1)/(n-1))].slice());
  });
}
function sketchCode(lines){
  const bytes=[];for(const line of compactSketch(lines)){bytes.push(255);for(const [x,y] of line)bytes.push(x,y);}
  return btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
function readSketch(code){
  if(!code||code.length>1100||!/^[\w-]+$/.test(code))return [];
  try{
    const data=Array.from(atob(code.replaceAll('-','+').replaceAll('_','/')),ch=>ch.charCodeAt(0)),lines=[];
    for(let i=0;i<data.length;){if(data[i]===255){if(lines.length>=16)return [];lines.push([]);i++;continue;}
      const x=data[i++],y=data[i++],line=lines.at(-1);
      if(!line||line.length>=38||x>240||!(y<=120))return [];line.push([x,y]);
    }return compactSketch(lines);
  }catch{return [];}
}
function drawPad(){
  const c=get('wishPad').getContext('2d');c.fillStyle='#111c2e';c.fillRect(0,0,640,320);
  if(!strokes.length){c.fillStyle='#b4ad9f';c.font='24px sans-serif';c.textAlign='center';c.fillText('在这里画下你们的记号',320,170);c.textAlign='left';}
  for(const line of strokes){
    c.strokeStyle='#ffd58e';c.lineWidth=4;c.lineJoin='round';c.lineCap='round';c.beginPath();
    line.forEach(([x,y],i)=>i?c.lineTo(x*640/240,y*320/120):c.moveTo(x*640/240,y*320/120));c.stroke();
    if(line.length===1){c.fillStyle='#ffd58e';c.beginPath();c.arc(line[0][0]*640/240,line[0][1]*320/120,2.5,0,2*Math.PI);c.fill();}
  }
  get('wishUndo').disabled=!strokes.length;get('wishClear').disabled=!strokes.length;
  get('inkStatus').hidden=strokes.length<16;
}
function setupPad(){
  const pad=get('wishPad');let pointer=null;
  function add(e){
    const r=pad.getBoundingClientRect(),x=Math.round(240*springClamp((e.clientX-r.left)/r.width)),y=Math.round(120*springClamp((e.clientY-r.top)/r.height));
    const line=strokes.at(-1),last=line?.at(-1);if(!line||line.length>=600)return;
    if(!last||Math.hypot(x-last[0],y-last[1])>=1.6){line.push([x,y]);drawPad();}
  }
  pad.onpointerdown=e=>{if(pointer!==null||strokes.length>=16)return;pointer=e.pointerId;pad.setPointerCapture(pointer);strokes.push([]);add(e);};
  pad.onpointermove=e=>{if(e.pointerId===pointer)add(e);};
  pad.onpointerup=e=>{if(e.pointerId===pointer){add(e);pointer=null;}};
  pad.onpointercancel=pad.onlostpointercapture=()=>{pointer=null;};
  get('wishUndo').onclick=()=>{strokes.pop();drawPad();};get('wishClear').onclick=()=>{strokes=[];drawPad();};
}
function updateWishEditor(){
  for(const [id,attr,key] of [['wishPeople','person',wishPerson],['wishOccasions','occasion',occasion],['wishScenes','wish',wishChoice.key]]){
    for(const b of get(id).children)b.setAttribute('aria-pressed',String(b.dataset[attr]===key));
  }
  if(!customNote)get('wishNote').value=defaultWish(wishPerson,wishChoice,occasion);
}
let demoRun=0,demoFrame=0;
async function syncDemo(){
  const run=++demoRun;cancelAnimationFrame(demoFrame);
  const canvas=get('springDemo');
  if(get('blessing').hidden||get('wishEditor').hidden||document.hidden)return;
  const s=wishStateNow();canvas.style.visibility='hidden';
  try{s.still=await loadArt(springPhoto(s.choice.key,true));}catch{return;}
  if(run!==demoRun)return;
  canvas.dataset.scene=s.choice.key;canvas.style.visibility='visible';
  const begin=performance.now();let last=-100;
  function frame(now){
    if(run!==demoRun)return;
    if(now-last>60){paintSpring(canvas,s,motionOn?(1.4+(now-begin)/1000)%springDuration:4.95);last=now;}
    if(motionOn)demoFrame=requestAnimationFrame(frame);
  }
  frame(begin);
}
function clearWishExport(){
  get('wishMovie').pause();get('wishMovie').removeAttribute('src');get('wishMovie').load();get('wishImage').removeAttribute('src');
  if(wishURL.startsWith('blob:'))URL.revokeObjectURL(wishURL);wishURL='';get('wishDownload').onclick=null;get('wishDownload').removeAttribute('href');get('wishExport').hidden=true;
}
function stopWish(){
  wishRun++;wishBusy=false;cancelAnimationFrame(wishFrame);wishState=null;awaitingOpen=false;elapsedWish=0;
  clearWishExport();get('wishRetry').hidden=true;get('wishStatus').textContent='';get('wishOpen').hidden=true;
}
function editWish(reset){
  stopWish();
  if(reset){wishPerson='family';occasion='spring';wishChoice=wishScenes[0];strokes=[];spots=[];customNote=false;get('wishTo').value='';get('wishFrom').value='';get('wishSketch').open=false;}
  show('blessing');get('wishEditor').hidden=false;get('wishResult').hidden=true;updateWishEditor();drawPad();syncDemo();
  get('wishEditor').querySelector('h1').focus({preventScroll:true});
}
function animateWish(replay=false){
  cancelAnimationFrame(wishFrame);
  const s=wishState;if(!s?.still)return;
  if(replay){awaitingOpen=false;elapsedWish=0;get('wishOpen').hidden=true;get('wishReplay').hidden=false;get('wishResult').classList.remove('sealed');}
  if(awaitingOpen){paintSpring(get('wishCanvas'),s,0);get('wishTimeline').textContent='等你点亮';return;}
  if(!motionOn&&!replay){paintSpring(get('wishCanvas'),s,4.95);get('wishTimeline').textContent='静态预览';return;}
  if(document.hidden)return;
  const start=performance.now()-1000*elapsedWish;let last=-100;
  function tick(now){
    if(wishState!==s||document.hidden)return;
    elapsedWish=Math.min(springDuration,(now-start)/1000);
    if(now-last>=1000/30||elapsedWish===springDuration){paintSpring(get('wishCanvas'),s,elapsedWish);last=now;}
    const text=elapsedWish<2.45?'烟花升空':elapsedWish<4.35?(s.strokes.length?'你的笔迹正在绽开':'花型正在绽开'):elapsedWish<springDuration?'祝词揭晓':'可重播或保存';
    if(get('wishTimeline').textContent!==text)get('wishTimeline').textContent=text;
    if(elapsedWish<springDuration)wishFrame=requestAnimationFrame(tick);
  }
  wishFrame=requestAnimationFrame(tick);
}
const movieConfig={codec:'avc1.42002a',width:1080,height:1350,bitrate:4500000,framerate:25,avc:{format:'avc'}};
let movieSupport;
function canEncodeMovie(){
  if(!movieSupport)movieSupport=(async()=>{try{return !!window.VideoEncoder && !!window.VideoFrame && !!window.Mp4Muxer && (await VideoEncoder.isConfigSupported(movieConfig)).supported;}catch{return false;}})();
  return movieSupport;
}
function wishButtons(ready){for(const id of ['wishHD','wishGIF','wishPNG','wishMP4'])get(id).disabled=!ready;}
async function previewWish(received=false){
  stopWish();const run=wishRun,s=wishStateNow();wishState=s;awaitingOpen=!!received;wishView=received===true?'friend':received==='preview'?'preview':'author';
  show('blessing');get('wishEditor').hidden=true;get('wishResult').hidden=false;syncDemo();
  get('wishHeading').textContent=wishView==='preview'?'好友收到的样子':received?'有一份祝福等你拆开':'给'+(s.to||wishPeople[s.person])+'的烟花';
  get('envelopeDay').textContent=springOccasions[s.occasion]+'来信';get('envelopeTo').textContent='给'+address(s);
  get('envelopeFrom').textContent=s.from?s.from+' 寄来':'一份新年心意';
  get('wishOpen').classList.remove('unseal');get('wishReplay').hidden=!!received;
  get('wishResult').classList.toggle('sealed',!!received);
  get('wishArrange').hidden=!!received;get('wishAsFriend').hidden=wishView==='friend';
  get('wishAsFriend').textContent=wishView==='preview'?'返回我的成片':'看看好友打开时的样子';
  get('wishAsFriend').onclick=()=>previewWish(wishView==='preview'?false:'preview');
  get('wishNew').textContent=wishView==='friend'?'回赠一场烟花':'另做一份';updateSpotControls();
  get('wishNew').onclick=()=>{
    editWish(true);
    if(received===true){
      occasion=s.occasion;wishPerson=s.person;get('wishTo').value=s.from;get('wishFrom').value=s.to;
      updateWishEditor();
    }
  };
  get('wishHeading').focus({preventScroll:true});get('wishWords').textContent='给'+address(s)+'。'+wishText(s);
  get('wishCanvas').setAttribute('aria-label',get('wishWords').textContent);get('wishCanvas').hidden=true;
  get('wishReplay').disabled=true;get('wishOtherFormats').open=false;get('wishTimeline').textContent='正在装入夜景';wishButtons(false);
  get('wishMP4').hidden=!(await canEncodeMovie());if(run!==wishRun)return;
  try{
    const still=await loadArt(springPhoto(s.choice.key));if(run!==wishRun)return;s.still=still;
    get('wishCanvas').hidden=false;get('wishOpen').hidden=!received;get('wishReplay').disabled=false;wishButtons(true);animateWish();
  }catch{if(run===wishRun){get('wishStatus').textContent='夜景暂时没载入，可以重试。';get('wishRetry').hidden=false;}}
}
function checkWishRun(run){if(run!==wishRun)throw new Error('changed');}
async function wishMovieBlob(s,run,canvas){
  const target=new Mp4Muxer.ArrayBufferTarget(),mux=new Mp4Muxer.Muxer({target,video:{codec:'avc',width:canvas.width,height:canvas.height},fastStart:'in-memory'});
  let error;const encoder=new VideoEncoder({output:(chunk,meta)=>mux.addVideoChunk(chunk,meta),error:e=>error=e});
  try{
    encoder.configure(movieConfig);
    const fps=movieConfig.framerate,n=Math.round(springDuration*fps);
    for(let i=0;i<n;i++){
      checkWishRun(run);if(error)throw error;paintSpring(canvas,s,i/fps);
      const frame=new VideoFrame(canvas,{timestamp:Math.round(i*1e6/fps),duration:Math.round(1e6/fps)});
      try{encoder.encode(frame,{keyFrame:i%50===0});}finally{frame.close();}
      if(i%5===4){get('wishStatus').textContent='正在制作视频 '+Math.round((i+1)*100/n)+'%';if(encoder.encodeQueueSize>6)await encoder.flush();await new Promise(done=>setTimeout(done,0));}
    }
    await encoder.flush();if(error)throw error;mux.finalize();return new Blob([target.buffer],{type:'video/mp4'});
  }finally{if(encoder.state!=='closed')encoder.close();}
}
async function saveWish(format){
  const s=wishState,run=wishRun;if(!s?.still||wishBusy)return;
  wishBusy=true;wishButtons(false);
  try{
    const canvas=document.createElement('canvas');canvas.width=format==='gif'?720:1080;canvas.height=canvas.width*1.25;
    let blob;
    if(format==='mp4')blob=await wishMovieBlob(s,run,canvas);
    else if(format==='png'){paintSpring(canvas,s,4.95);blob=await new Promise(done=>canvas.toBlob(done,'image/png'));}
    else{
      const hd=format==='webp',fps=hd?12:10,n=Math.round(fps*springDuration),frames=[];
      const gif=hd?null:window.cardGif.GIFEncoder(),ctx=canvas.getContext('2d',{willReadFrequently:!hd});let palette;
      for(let i=0;i<n;i++){
        checkWishRun(run);get('wishStatus').textContent='正在制作动图 '+Math.round(100*i/n)+'%';
        paintSpring(canvas,s,i/fps);
        if(hd){
          const f=await new Promise(done=>canvas.toBlob(done,'image/webp',.78));
          if(!f||f.type!=='image/webp')throw Error('unsupported');
          frames.push({bytes:new Uint8Array(await f.arrayBuffer()),delay:Math.round((i+1)*1000/fps)-Math.round(i*1000/fps)});
        }else{
          const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
          if(!palette||i%12===0)palette=window.cardGif.quantize(pixels,256);
          gif.writeFrame(window.cardGif.applyPalette(pixels,palette),canvas.width,canvas.height,{palette,delay:100,repeat:0});
        }
        if(i%3===0)await new Promise(done=>setTimeout(done,0));
      }
      if(hd)blob=animatedWebP(canvas.width,canvas.height,frames);else{gif.finish();blob=new Blob([gif.bytes()],{type:'image/gif'});}
    }
    if(!blob)throw Error('empty');checkWishRun(run);clearWishExport();
    const movie=format==='mp4',url=movie?URL.createObjectURL(blob):await inlineImageURL(blob);
    if(run!==wishRun){if(movie)URL.revokeObjectURL(url);return;}
    wishURL=url;get('wishMovie').hidden=!movie;get('wishImage').hidden=movie;
    const media=get(movie?'wishMovie':'wishImage');media.src=url;
    if(!movie){await media.decode();checkWishRun(run);}
    get('wishSaveHint').hidden=movie;
    bindMediaSave(get('wishDownload'),media,url,s.choice.title+'-'+springOccasions[s.occasion]+'烟花.'+format,blob);
    get('wishExport').hidden=false;get('wishStatus').textContent='已做好 · '+canvas.width+' × '+canvas.height+' · '+(blob.size/1048576).toFixed(1)+' MB';
    get('wishExport').scrollIntoView({block:'center'});
  }catch{if(run===wishRun)get('wishStatus').textContent='这个格式暂时没做好，可以重试或改选微信 GIF。';}
  finally{if(run===wishRun){wishBusy=false;wishButtons(true);}}
}
function wishShareUrl(s){
  const p=new URLSearchParams({wish:s.choice.key,person:s.person,day:s.occasion});
  if(s.to)p.set('to',s.to);if(s.from)p.set('from',s.from);if(s.note)p.set('msg',s.note);if(s.strokes.length)p.set('ink',sketchCode(s.strokes));
  if(s.spots?.length)p.set('sky',s.spots.map(pos=>pos.join('.')).join('-'));
  return 'https://galen-lu.github.io/trip-postcard-free/?v=10&play=newyear#'+p;
}
async function copyWish(){
  const run=wishRun,msg='我给你留了一场'+springOccasions[occasion]+'烟花。点一下，看看夜空里藏着什么。 '+wishShareUrl(wishState);
  let copied=false;try{await navigator.clipboard.writeText(msg);copied=true;}catch{}
  if(run===wishRun)get('wishStatus').textContent=copied?'祝福链接已复制。粘贴到微信，对方打开后就能亲手点亮。':'长按复制邀请　'+msg;
}
function loadWishRoute(){
  if(new URLSearchParams(location.search).get('play')!=='newyear')return;
  const h=new URLSearchParams(location.hash.slice(1)),choice=wishScenes.find(v=>v.key===h.get('wish'));
  editWish(true);if(!choice)return;
  wishChoice=choice;wishPerson=own(wishPeople,h.get('person'))?h.get('person'):'family';occasion=own(springOccasions,h.get('day'))?h.get('day'):'spring';
  get('wishTo').value=(h.get('to')||'').slice(0,16);get('wishFrom').value=(h.get('from')||'').slice(0,16);
  const msg=(h.get('msg')||'').slice(0,72);customNote=!!msg;if(customNote)get('wishNote').value=msg;
  strokes=readSketch(h.get('ink'));spots=(h.get('sky')||'').split('-').slice(0,3).filter(v=>/^\d{1,2}\.\d{1,2}$/.test(v)).map(v=>v.split('.').map(Number)).filter(([x,y])=>x>=6&&x<=94&&y>=7&&y<=49);
  updateWishEditor();previewWish(true);
}
function updateSpotControls(){
  get('spotCount').textContent=spots.length===3?'三束都已加入成片':'点夜空加烟花 · '+spots.length+' / 3';
  get('spotUndo').disabled=!spots.length||wishBusy;get('spotAdd').disabled=spots.length>=3||wishBusy;
}
function changeSpot(point){
  const s=wishState;if(!s?.still||wishView!=='author'||wishBusy)return;
  if(point){if(spots.length>=3)return;spots.push(point);}else if(spots.length){spots.pop();}else return;
  s.spots=spots.map(p=>p.slice());s.model=springScene(s);clearWishExport();get('wishStatus').textContent='';updateSpotControls();
  elapsedWish=point?4.71+(spots.length-1)*.7:4.95;
  if(motionOn)animateWish();else paintSpring(get('wishCanvas'),s,elapsedWish+.35);
}
function initWishes(){
  const entry=get('newyearEntry');setClip(entry.querySelector('.year-cover'),'spring-demo',true);
  entry.onclick=()=>editWish(true);
  for(const [data,group,prop] of [[wishPeople,'wishPeople','person'],[springOccasions,'wishOccasions','occasion']]){
    for(const [key,label] of Object.entries(data)){
      const b=document.createElement('button');b.dataset[prop]=key;b.textContent=label;
      b.onclick=()=>{if(prop==='person')wishPerson=key;else occasion=key;updateWishEditor();};get(group).append(b);
    }
  }
  for(const s of wishScenes){
    const b=document.createElement('button');b.dataset.wish=s.key;
    b.innerHTML='<span class="wish-thumb"><img alt="" loading="lazy"></span><strong></strong><small></small>';
    b.querySelector('img').src=springPhoto(s.key,true);b.querySelector('strong').textContent=s.title;
    b.querySelector('small').textContent=springDesigns[s.key].scene+' · '+springDesigns[s.key].name;
    b.onclick=()=>{wishChoice=s;updateWishEditor();syncDemo();};get('wishScenes').append(b);
  }
  setupPad();get('wishNote').oninput=()=>{customNote=true;};get('wishUseDefault').onclick=()=>{customNote=false;updateWishEditor();};
  get('wishHome').onclick=()=>{stopWish();show('home');syncDemo();entry.focus({preventScroll:true});};
  get('wishMake').onclick=get('wishDemo').onclick=()=>previewWish(false);get('wishRetry').onclick=()=>previewWish(wishView==='friend'?true:wishView==='preview'?'preview':false);
  get('wishReplay').onclick=()=>animateWish(true);
  get('wishOpen').onclick=()=>{
    const run=wishRun;get('wishOpen').classList.add('unseal');
    setTimeout(()=>{if(run===wishRun&&awaitingOpen)animateWish(true);},motionOn?430:0);
  };
  get('wishCanvas').onclick=e=>{
    const r=e.currentTarget.getBoundingClientRect(),x=Math.round(100*(e.clientX-r.left)/r.width),y=Math.round(100*(e.clientY-r.top)/r.height);
    if(y>=0&&y<=52)changeSpot([springClamp(x,6,94),springClamp(y,7,49)]);
  };
  get('spotAdd').onclick=()=>changeSpot([[25,18],[74,30],[38,41]][spots.length]);get('spotUndo').onclick=()=>changeSpot(null);
  get('wishEdit').onclick=()=>editWish(false);
  for(const [id,format] of [['wishHD','webp'],['wishMP4','mp4'],['wishGIF','gif'],['wishPNG','png']])get(id).onclick=()=>saveWish(format);
  get('wishLink').onclick=copyWish;
  const mediaChange=()=>{syncDemo();animateWish();};
  document.addEventListener('visibilitychange',mediaChange);document.addEventListener('motionchange',mediaChange);
  window.addEventListener('hashchange',loadWishRoute);loadWishRoute();
}
