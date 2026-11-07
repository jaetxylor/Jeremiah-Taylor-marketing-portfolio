import {geoOrthographic, geoPath, geoContains, geoDistance, geoCentroid, geoGraticule10} from './vendor/d3-geo.mjs';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const canvas = document.querySelector('[data-travel-globe]');
if (canvas) initGlobe().catch(error => {
  console.error('Travel globe unavailable:', error);
  canvas.hidden = true;
  document.querySelector('.globe-poster').hidden = false;
  document.querySelector('[data-globe-error]').hidden = false;
});

async function initGlobe() {
  const [world, albums] = await Promise.all(['/assets/travel/world.json','/assets/travel/albums.json'].map(async url => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Could not load ${url}`);
    return response.json();
  }));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable');
  const features = world.features, visited = new Map(albums.map(d=>[d.id,d]));
  const points = world.dots.map(([lon,lat,i])=>({coord:[lon,lat],sin:Math.sin(lat*Math.PI/180),cos:Math.cos(lat*Math.PI/180),lon:lon*Math.PI/180,visited:visited.has(features[i].id)}));
  const projection = geoOrthographic().clipAngle(90).precision(.6);
  const path = geoPath(projection,ctx), graticule = geoGraticule10();
  const stage = document.querySelector('[data-globe-stage]'), tooltip = document.querySelector('[data-globe-tooltip]');
  const select = document.querySelector('#travel-country'), spinButton = document.querySelector('[data-globe-spin]');
  let width=0, height=0, radius=0, zoom=1, lon=105, lat=14, selected=null;
  let spinning=!reducedMotion.matches, dirty=true, inView=true, lastTime=0, lastDraw=0, frame=0, velocity=0, hover=null;
  let dragStart=null, lastPointer=null, pinchDistance=0;
  const pointers = new Map();
  const home = albums.find(d=>d.home) || albums[0];
  const featureIndex = new Map(features.map((f,i)=>[f,i]));
  const countryName = f => visited.get(f.id)?.name || f.properties.name;
  const group = (label, countries) => {
    const el = document.createElement('optgroup'); el.label=label;
    for(const f of countries) {const option=document.createElement('option');option.value=String(featureIndex.get(f));option.textContent=countryName(f)+(visited.get(f.id)?.home?' · Home':'');el.append(option);}
    return el;
  };
  select.append(group('Visited',albums.map(d=>features.find(f=>f.id===d.id)).filter(Boolean)),group('Not yet visited',features.filter(f=>!visited.has(f.id)).sort((a,b)=>countryName(a).localeCompare(countryName(b)))));

  function setSpin(value) {
    spinning=value;spinButton.textContent=value?'Pause spin':'Resume spin';spinButton.setAttribute('aria-pressed',String(value));
    if(value)velocity=0;
    wake();
  }
  function wake(){dirty=true;if(!frame)frame=requestAnimationFrame(tick);}
  function limitLat(value){return Math.max(-80,Math.min(80,value));}
  function updateZoom(value){zoom=Math.max(.8,Math.min(2.2,value));document.querySelector('[data-globe-zoom="out"]').disabled=zoom<=.8;document.querySelector('[data-globe-zoom="in"]').disabled=zoom>=2.2;wake();}
  function choose(f,focus=true) {
    if(!f)return;
    selected=f;select.value=String(featureIndex.get(f));
    const album=visited.get(f.id), name=countryName(f);
    const status=document.querySelector('[data-country-status]');
    status.textContent=album?(album.home?'HOME / VISITED':'VISITED'):'NOT YET VISITED';
    status.toggleAttribute('data-unvisited',!album);
    document.querySelector('[data-country-name]').textContent=name;
    document.querySelector('[data-country-copy]').textContent=album?(album.home?'Where every adventure begins.':'Another little piece of the world i have seen.'):'Somewhere for another adventure.';
    document.querySelector('[data-country-count]').textContent=album?`${album.photos.length} photo${album.photos.length===1?'':'s'}`:'Still on the map';
    const preview=document.querySelector('[data-album-preview]');preview.replaceChildren();
    if(album?.photos.length){const img=document.createElement('img');img.src=album.photos[0].src;img.alt=album.photos[0].alt;preview.append(img);}
    else {const icon=document.createElement('span');icon.className='album-outline';icon.setAttribute('aria-hidden','true');icon.textContent='＋';const text=document.createElement('p');text.textContent=album?'Memories made. Photos to come.':'A story still to be written.';preview.append(icon,text);}
    const link=document.querySelector('[data-country-album]');link.hidden=!album;if(album)link.href=album.url;
    const url=new URL(location.href);if(f.id)url.searchParams.set('country',f.id);else url.searchParams.delete('country');history.replaceState(null,'',url.pathname+url.search);
    if(focus){const center=album?.center || geoCentroid(f);lon=center[0];lat=limitLat(center[1]);velocity=0;setSpin(false);}
    wake();
  }
  function size(){const bounds=stage.getBoundingClientRect();width=bounds.width;height=bounds.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);radius=Math.min(width,height)*.425;wake();}
  function visible(coord){return geoDistance([lon,lat],coord)<Math.PI/2-.025;}
  function paint(){
    ctx.clearRect(0,0,width,height);projection.translate([width/2,height/2]).scale(radius*zoom).rotate([-lon,-lat]);
    const r=radius*zoom;
    ctx.save();ctx.beginPath();path({type:'Sphere'});ctx.shadowColor='#5bc4ea88';ctx.shadowBlur=22;ctx.fillStyle='#091b27';ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#78d5ed88';ctx.lineWidth=.8;ctx.stroke();ctx.restore();
    for(const f of features){ctx.beginPath();path(f);const blue=visited.has(f.id),active=f===selected;ctx.fillStyle=blue?(active?'#1e4f6b':'#123147'):(active?'#623341':'#2e1d2b');ctx.fill();ctx.strokeStyle=active?'#d9f2ffcc':blue?'#5dbde685':'#c65b7166';ctx.lineWidth=active?1:.45;ctx.stroke();}
    ctx.beginPath();path(graticule);ctx.strokeStyle='#76c3df17';ctx.lineWidth=.55;ctx.stroke();
    const clat=Math.cos(lat*Math.PI/180),slat=Math.sin(lat*Math.PI/180),rlon=lon*Math.PI/180;
    const dotSize=Math.max(.7,Math.min(1.55,r/220));
    for(const p of points){const depth=p.cos*Math.cos(p.lon-rlon)*clat+p.sin*slat;if(depth<.015)continue;const [x,y]=projection(p.coord);ctx.globalAlpha=.65+.35*depth;ctx.fillStyle=p.visited?'#7ad9ff':'#f47a8c';ctx.fillRect(x,y,dotSize,dotSize);}
    ctx.globalAlpha=1;
    ctx.save();ctx.beginPath();path({type:'Sphere'});ctx.clip();const shade=ctx.createRadialGradient(width/2-r*.3,height/2-r*.35,r*.1,width/2,height/2,r);shade.addColorStop(0,'#a4dfff0a');shade.addColorStop(.65,'#00000000');shade.addColorStop(1,'#0108125c');ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);ctx.restore();
    for(const id of ['702','344']){const album=visited.get(id);if(!album||!visible(album.center))continue;const [x,y]=projection(album.center);ctx.beginPath();ctx.arc(x,y,album.home?4:3.5,0,2*Math.PI);ctx.fillStyle=album.home?'#edfaff':'#8edcff';ctx.shadowColor='#87dfff';ctx.shadowBlur=8;ctx.fill();ctx.shadowBlur=0;ctx.beginPath();ctx.arc(x,y,album.home?8:6,0,2*Math.PI);ctx.strokeStyle='#b8e7ff99';ctx.lineWidth=.8;ctx.stroke();if(album.home){ctx.font='9px ui-monospace,monospace';ctx.fillStyle='#e0f6ff';ctx.fillText('HOME',x+12,y+3);}}
    if(hover){ctx.beginPath();path(hover);ctx.strokeStyle='#fff9';ctx.lineWidth=1;ctx.stroke();}
  }
  function tick(time){
    frame=0;
    if(!inView||document.hidden){lastTime=0;return;}
    const dt=lastTime?Math.min(time-lastTime,70):16;lastTime=time;
    if(spinning&&!pointers.size){lon=(lon+dt*.0035)%360;dirty=true;}
    if(!pointers.size&&Math.abs(velocity)>.003){lon+=velocity*dt;velocity*=Math.pow(.93,dt/16);dirty=true;}
    if(dirty&&time-lastDraw>=32){paint();dirty=false;lastDraw=time;}
    if(spinning||Math.abs(velocity)>.003||dirty)frame=requestAnimationFrame(tick);else lastTime=0;
  }
  function local(event){const rect=canvas.getBoundingClientRect();return [event.clientX-rect.left,event.clientY-rect.top];}
  function hit(point){
    const dx=point[0]-width/2,dy=point[1]-height/2;if(Math.hypot(dx,dy)>radius*zoom)return null;
    for(const id of ['702','344']){const album=visited.get(id);if(album&&visible(album.center)){const p=projection(album.center);if(Math.hypot(p[0]-point[0],p[1]-point[1])<12)return features.find(f=>f.id===id);}}
    const coord=projection.invert(point);return coord?features.find(f=>geoContains(f,coord)):null;
  }
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;canvas.setPointerCapture(event.pointerId);pointers.set(event.pointerId,local(event));
    if(pointers.size===1){dragStart={point:local(event),moved:false};lastPointer={point:local(event),time:event.timeStamp};}
    else {dragStart.moved=true;pinchDistance=Math.hypot(...difference([...pointers.values()]));}
    tooltip.hidden=true;hover=null;velocity=0;setSpin(false);
  });
  function difference([a,b]){return [a[0]-b[0],a[1]-b[1]];}
  canvas.addEventListener('pointermove',event=>{
    const point=local(event);
    if(pointers.has(event.pointerId)){
      pointers.set(event.pointerId,point);
      if(pointers.size>1){const distance=Math.hypot(...difference([...pointers.values()]));if(pinchDistance)updateZoom(zoom*distance/pinchDistance);pinchDistance=distance;lastPointer=null;return;}
      if(lastPointer){const dx=point[0]-lastPointer.point[0],dy=point[1]-lastPointer.point[1],speed=90/(radius*zoom);lon-=dx*speed;lat=limitLat(lat+dy*speed);velocity=reducedMotion.matches?0:Math.max(-.3,Math.min(.3,-dx*speed/Math.max(16,event.timeStamp-lastPointer.time)));}
      if(dragStart&&Math.hypot(point[0]-dragStart.point[0],point[1]-dragStart.point[1])>5)dragStart.moved=true;
      lastPointer={point,time:event.timeStamp};wake();
    }else if(event.pointerType==='mouse'){
      const f=hit(point);if(f!==hover){hover=f;wake();}tooltip.hidden=!f;
      if(f){tooltip.textContent=countryName(f)+(visited.has(f.id)?' · Visited':' · Not yet visited');tooltip.style.left=`${Math.max(5,Math.min(point[0]+12,width-tooltip.offsetWidth-5))}px`;tooltip.style.top=`${Math.max(5,point[1]-38)}px`;}
    }
  });
  function release(event,cancel=false){
    if(!pointers.has(event.pointerId))return;
    if(!cancel&&pointers.size===1&&dragStart&&!dragStart.moved){paint();choose(hit(local(event)));}
    pointers.delete(event.pointerId);pinchDistance=0;lastPointer=null;
    if(!pointers.size){dragStart=null;wake();}
  }
  canvas.addEventListener('pointerup',event=>release(event));canvas.addEventListener('pointercancel',event=>release(event,true));canvas.addEventListener('lostpointercapture',event=>release(event,true));
  canvas.addEventListener('pointerleave',()=>{tooltip.hidden=true;hover=null;wake();});
  canvas.addEventListener('wheel',event=>{if(document.activeElement!==canvas&&!event.ctrlKey)return;event.preventDefault();setSpin(false);updateZoom(zoom*(event.deltaY<0?1.08:.92));},{passive:false});
  canvas.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Enter',' '].includes(event.key))return;
    event.preventDefault();if(event.key===' '){setSpin(!spinning);return;}setSpin(false);velocity=0;
    if(event.key==='ArrowLeft')lon-=8;if(event.key==='ArrowRight')lon+=8;if(event.key==='ArrowUp')lat=limitLat(lat+8);if(event.key==='ArrowDown')lat=limitLat(lat-8);
    if(event.key==='+'||event.key==='=')updateZoom(zoom+.15);if(event.key==='-')updateZoom(zoom-.15);if(event.key==='Enter'){paint();choose(hit([width/2,height/2]));}wake();
  });
  select.addEventListener('change',()=>choose(features[Number(select.value)]));
  spinButton.addEventListener('click',()=>{tooltip.hidden=true;hover=null;setSpin(!spinning);});
  document.querySelectorAll('[data-globe-zoom]').forEach(button=>button.addEventListener('click',()=>updateZoom(zoom+(button.dataset.globeZoom==='in'?.2:-.2))));
  document.querySelector('[data-globe-home]').addEventListener('click',()=>{updateZoom(1);choose(features.find(f=>f.id===home.id));});
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches){velocity=0;setSpin(false);}});
  new ResizeObserver(size).observe(stage);
  new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(inView)wake();},{rootMargin:'100px'}).observe(stage);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake();});
  canvas.hidden=false;document.querySelector('.globe-poster').hidden=true;document.querySelector('[data-globe-controls]').hidden=false;document.querySelector('[data-country-picker]').hidden=false;
  const requested=new URLSearchParams(location.search).get('country');
  choose(features.find(f=>f.id===(requested||home.id)),!!requested);setSpin(spinning);size();
}

const photoLinks=[...document.querySelectorAll('[data-travel-photo]')];
const dialog=document.querySelector('.travel-lightbox');
if(dialog&&photoLinks.length){
  let current=0,opener=null,startX=null;
  const image=dialog.querySelector('img'),caption=dialog.querySelector('figcaption'),position=dialog.querySelector('[data-photo-position]');
  function show(index){current=(index+photoLinks.length)%photoLinks.length;const link=photoLinks[current],img=link.querySelector('img');image.src=link.href;image.alt=img.alt;caption.textContent=link.closest('figure').querySelector('figcaption')?.textContent||'';position.textContent=`${current+1} / ${photoLinks.length}`;}
  photoLinks.forEach((link,i)=>link.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||typeof dialog.showModal!=='function')return;event.preventDefault();opener=link;show(i);dialog.showModal();document.body.style.overflow='hidden';}));
  dialog.querySelector('[data-photo-close]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.body.style.overflow='';opener?.focus();});
  const previous=dialog.querySelector('[data-photo-prev]'),next=dialog.querySelector('[data-photo-next]');previous.disabled=next.disabled=photoLinks.length<2;
  previous.addEventListener('click',()=>show(current-1));next.addEventListener('click',()=>show(current+1));
  dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();show(current-1);}if(event.key==='ArrowRight'){event.preventDefault();show(current+1);}});
  image.addEventListener('touchstart',event=>{startX=event.touches[0].clientX;},{passive:true});
  image.addEventListener('touchend',event=>{if(startX!==null){const dx=event.changedTouches[0].clientX-startX;if(Math.abs(dx)>45)show(current+(dx<0?1:-1));startX=null;}},{passive:true});
}
