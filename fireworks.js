// All previews and exports sample the same continuous, deterministic timeline.
const springDuration=8.4;
const springOccasions={spring:'春节',eve:'除夕',newyear:'元旦'};
const springDesigns={
  reunion:{name:'团圆灯',scene:'老院灯火',colors:['#ffaf43','#ff4567','#ffe39a']},
  pair:{name:'双鲤',scene:'水巷鱼灯',colors:['#ff836a','#ffd384','#ff9fb8']},
  summit:{name:'群峰',scene:'山巅迎岁',colors:['#ffc768','#ffe5a6','#90d1ff']},
  plum:{name:'五瓣梅',scene:'庭前红梅',colors:['#ff83b0','#ffb9bd','#ffd98c']},
  citrus:{name:'双橘',scene:'岭南花市',colors:['#ffb252','#ffe080','#a9e8a2']},
  sail:{name:'扬帆',scene:'春江夜航',colors:['#85dcff','#c1eeff','#ffcf81']}
};
const springClamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
function springEase(x){x=springClamp(x);return x*x*(3-2*x);}
function springPhoto(key,small=false){return 'spring/'+key+(small?'-sm':'')+'.webp';}
function springPreviewURL(){return 'spring/sample.mp4';}
function springGradient(c,x,y,r,color,alpha){
  if(alpha<=0)return;
  const g=c.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,color);g.addColorStop(1,'transparent');
  c.save();c.globalAlpha=alpha;c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();
}
function curvedPath(fn,n=60){return Array.from({length:n+1},(_,i)=>fn(i/n));}
function oval(x,y,a,b){return curvedPath(t=>[x+a*Math.cos(2*Math.PI*t),y+b*Math.sin(2*Math.PI*t)]);}
function motifLines(key){
  switch(key){
  case 'plum':return [curvedPath(t=>{const a=t*2*Math.PI-Math.PI/2,r=.66+.27*Math.cos(5*(a+Math.PI/2));return [r*Math.cos(a),r*Math.sin(a)];},140),oval(0,0,.11,.11)];
  case 'reunion':return [oval(0,0,.76,.58),oval(0,0,.34,.58),[[-.38,-.61],[.38,-.61]],[[-.33,.62],[.33,.62]],[[0,.62],[0,.96]],[[-.09,.79],[-.09,.98]],[[.09,.79],[.09,.98]]];
  case 'summit':return [[[-1,.65],[-.50,-.15],[-.28,.11],[.13,-.79],[.54,-.09],[.70,-.31],[1,.64]],[[-.08,-.37],[.04,-.25],[.15,-.47],[.28,-.40]],curvedPath(t=>[-.68+.25*Math.cos(Math.PI*(1+t)),-.28+.25*Math.sin(Math.PI*(1+t))])];
  case 'sail':return [[[0,-.9],[0,.36],[-.73,.36],[0,-.9]],[[.10,-.62],[.70,.35],[.10,.35],[.10,-.62]],[[-.96,.49],[.95,.49],[.66,.75],[-.65,.75],[-.96,.49]],curvedPath(t=>[-1+2*t,.90+.05*Math.sin(t*15)])];
  case 'citrus':return [oval(-.38,.18,.48,.53),oval(.42,.25,.44,.48),[[-.37,-.34],[-.24,-.65],[0,-.73]],[[-.29,-.53],[-.61,-.68],[-.75,-.60],[-.57,-.46],[-.29,-.53]],[[.42,-.22],[.50,-.54],[.76,-.65],[.65,-.40],[.42,-.22]]];
  case 'pair':{
    const one=(dx,dy,sign)=>[oval(0,0,.46,.23).map(([x,y])=>[dx+x*sign,dy+y]),[[dx-.43*sign,dy],[dx-.74*sign,dy-.21],[dx-.74*sign,dy+.21],[dx-.43*sign,dy]],oval(dx+.27*sign,dy-.04,.025,.025)];
    return [...one(.18,-.30,1),...one(-.18,.32,-1)];
  }}
}
function signatureLines(strokes,key){
  if(!strokes.length)return motifLines(key);
  const flat=strokes.flat(),xs=flat.map(p=>p[0]),ys=flat.map(p=>p[1]);
  const l=Math.min(...xs),r=Math.max(...xs),t=Math.min(...ys),b=Math.max(...ys);
  const scale=Math.max((r-l)/2,(b-t)/1.55,10);
  return strokes.map(line=>line.map(([x,y])=>[(x-(l+r)/2)/scale,(y-(t+b)/2)/scale]));
}
function springRandom(seed){return ()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};}
function springScene(state){
  const key=state.choice.key,design=springDesigns[key],rng=springRandom(7194+Object.keys(springDesigns).indexOf(key)*439);
  const paths=signatureLines(state.strokes,key);
  const dots=[];
  paths.forEach(line=>{
    if(line.length===1)dots.push(line[0]);
    for(let i=1;i<line.length;i++){
      const a=line[i-1],b=line[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.037));
      for(let j=0;j<n;j++)dots.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n]);
    }
  });
  const bursts=[
    [.20,.99,118,187,91,0],[.62,1.52,409,162,78,1],[1.55,2.46,273,189,99,2],
    [3.00,3.82,65,245,68,1],[3.35,4.22,471,217,78,0],[4.85,5.78,143,108,62,2],[5.22,6.11,401,105,64,1]
  ];
  (state.spots||[]).forEach(([x,y],i)=>bursts.push([3.95+i*.7,4.65+i*.7,x*5.4,y*6.75,57, i%3]));
  const shells=bursts.map(([launch,time,x,y,r,color],index)=>({launch,time,x,y,r,color,particles:Array.from({length:index===2?106:83},(_,j)=>{
    const angle=(j+rng()*.7)*Math.PI*2/83,speed=(index%3===1?.92+.18*rng():.38+.84*rng())*r*1.36;
    return {dx:Math.cos(angle)*speed,dy:Math.sin(angle)*speed*(index%3===0?.92:.84),gravity:index%3===0?33:18,life:1.38+1.05*rng(),tw:rng()*16,size:.85+rng()*1.05,pale:rng()>.78};
  })}));
  return {design,bursts:shells,dots,stars:Array.from({length:42},()=>[rng()*540,20+rng()*280,rng()])};
}
function sparkPos(b,p,t){const d=1.49*(1-Math.exp(-t*1.75));return [b.x+p.dx*d,b.y+p.dy*d+p.gravity*t*t];}
function drawShell(c,b,t,palette) {
  const a=t-b.time;
  if(t<b.launch||a>2.38)return;
  const color=palette[b.color];
  if(a<0){
    const pos=u=>[b.x+(1-u)*((b.x-270)*.37)+7*Math.sin(Math.PI*u),b.y+(425-b.y)*(1-u)*(1-u*.50)];
    const u=(t-b.launch)/(b.time-b.launch),[x,y]=pos(u);
    for(let j=1;j<=10;j++){const at=u-j*.014;if(at<0)break;const [px,py]=pos(at);c.fillStyle=color;c.globalAlpha=(1-j/11)*.85;c.fillRect(px,py,1.5,3);}
    c.globalAlpha=1;springGradient(c,x,y,13,color,.86);c.fillStyle='#fff5ce';c.fillRect(x-1.4,y-1,2.8,4);return;
  }
  springGradient(c,b.x,b.y,50+125*Math.min(a,1),color,.43*Math.exp(-a*2.2));
  for(const p of b.particles){
    if(a>=p.life)continue;
    const fade=Math.pow(1-a/p.life,.70),head=sparkPos(b,p,a),prev=sparkPos(b,p,Math.max(0,a-.11));
    const tail=sparkPos(b,p,Math.max(0,a-.40));
    c.strokeStyle=color;c.globalAlpha=.22*fade;c.lineWidth=p.size*3.1;
    c.beginPath();c.moveTo(tail[0],tail[1]);c.quadraticCurveTo(prev[0],prev[1],head[0],head[1]);c.stroke();
    c.globalAlpha=.67*fade;c.lineWidth=p.size;
    c.beginPath();c.moveTo(tail[0],tail[1]);c.lineTo(prev[0],prev[1]);c.stroke();
    c.globalAlpha=fade*(.8+.2*Math.sin(a*13+p.tw));c.strokeStyle=p.pale?'#fff0c8':color;
    c.beginPath();c.moveTo(prev[0],prev[1]);c.lineTo(head[0],head[1]);c.stroke();
    c.fillStyle=p.pale?'#fff6d8':color;c.fillRect(head[0],head[1],p.size*1.35,p.size*1.35);
    if(a>.45&&p.tw>10){c.globalAlpha=fade*Math.abs(Math.sin(a*21+p.tw));c.fillStyle='#ffe99e';c.fillRect(tail[0]+2,tail[1]+6*a,1.8,1.8);}
  }
  c.globalAlpha=1;
}
function drawSignature(c,model,t){
  const count=model.dots.length,progress=springEase((t-2.54)/1.75);
  if(!progress||!count)return;
  const end=Math.ceil(count*progress),gold=model.design.colors[0];
  c.save();c.fillStyle=gold;c.shadowColor=gold;c.shadowBlur=4;
  for(let i=0;i<end;i++){
    const p=model.dots[i],j=Math.max(0,t-2.54-1.75*i/count);
    const wobble=.7*Math.sin(t*3+i*.41);
    const x=270+p[0]*104+wobble,y=187+p[1]*104+.8*Math.sin(i*.37+t*2);
    c.globalAlpha=(.67+.32*Math.sin(i*.81+t*3.2))*(.83+.17*Math.cos(j));
    const rad=1.05+.60*Math.sin(i*1.9)**2;
    c.beginPath();c.arc(x,y,rad,0,Math.PI*2);c.fill();
  }
  c.restore();
  if(progress<1){const p=model.dots[end-1];springGradient(c,270+p[0]*104,187+p[1]*104,16,'#fff1af',.86);}
}
function paintSpring(canvas,s,time){
  const c=canvas.getContext('2d'),k=canvas.width/540,t=springClamp(time,0,springDuration);
  c.save();c.scale(k,k);c.fillStyle='#071222';c.fillRect(0,0,540,675);
  drawCrop(c,s.still,0,0,540,675);
  for(const [x,y,phase] of s.model.stars){c.fillStyle='rgba(228,221,200,'+(.22+.17*Math.sin(t*1.3+phase*6))+')';c.fillRect(x,y,1.2,1.2);}
  c.save();c.globalCompositeOperation='lighter';
  s.model.bursts.forEach(b=>{
    const age=t-b.time;
    if(age>=0&&age<1.5){
      const strength=.13*Math.exp(-age*2.6);
      springGradient(c,b.x,356,220,s.model.design.colors[b.color],strength);
      if(s.choice.key==='pair'||s.choice.key==='sail'){
        c.fillStyle=s.model.design.colors[b.color];
        for(let i=0;i<15;i++){c.globalAlpha=strength*(1-i/16);const w=4+i*1.5;c.fillRect(b.x-w/2+2*Math.sin(i+t*7),380+i*3.4,w,1);}
        c.globalAlpha=1;
      }
    }
    drawShell(c,b,t,s.model.design.colors);
  });
  drawSignature(c,s.model,t);c.restore();
  const shade=c.createLinearGradient(0,346,0,675);shade.addColorStop(0,'rgba(8,12,22,0)');shade.addColorStop(.48,'rgba(8,12,22,.75)');shade.addColorStop(1,'rgba(8,12,22,.96)');c.fillStyle=shade;c.fillRect(0,346,540,329);
  const greet=({spring:'新春',eve:'除夕',newyear:'元旦'})[s.occasion];
  c.fillStyle='#ffda94';c.font='600 16px "Microsoft YaHei",sans-serif';c.fillText(greet+'  ·  '+s.choice.title,26,454);
  c.fillStyle='#fff6dc';c.font='bold 35px "STKaiti","KaiTi",serif';c.fillText('给'+address(s),25,502,485);
  const reveal=springEase((t-1.8)/1.25);c.globalAlpha=reveal;c.font='22px "Microsoft YaHei",sans-serif';
  wrapCardText(c,wishText(s),486).slice(0,4).forEach((line,i)=>c.fillText(line,26,543+i*30));
  c.globalAlpha=.95;c.textAlign='right';c.fillStyle='#ffdda5';c.font='17px "Microsoft YaHei",sans-serif';
  c.fillText(s.from?s.from+' 敬上':({spring:'新春吉祥',eve:'除夕安康',newyear:'元旦快乐'})[s.occasion],514,650,300);
  c.restore();
}
