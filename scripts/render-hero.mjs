// Offline 45-second hero film. Requires @napi-rs/canvas and ffmpeg, not used by the site build.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const canvasModule = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '@napi-rs/canvas') : '@napi-rs/canvas';
const { createCanvas, loadImage, GlobalFonts } = require(canvasModule);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/urw-base35/NimbusSans-Regular.otf', 'Nook');
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/urw-base35/NimbusSans-Bold.otf', 'NookBold');
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/urw-base35/P052-Italic.otf', 'NookSerif');
const mobile = process.argv.includes('--mobile');
const preview = process.argv.includes('--preview');
const W = mobile ? 960 : 1920, H = mobile ? 1200 : 1080, FPS = 30, DURATION = 45;
const out = path.join(root, 'assets/hero');
const canvas = createCanvas(W,H), ctx = canvas.getContext('2d');
const sprites = await loadImage(path.join(out,'jae-sprites.png'));
const C = { bg:'#292a2c', ink:'#f5f2e9', muted:'#b9b9b6', line:'#454648', blue:'#acd4ff', red:'#ff4b47', green:'#b3cd94', yellow:'#efcf71' };
const scenes = [
 { start:0, end:5, key:'WELCOME', title:['hey, i am Jae.'], italic:'welcome to my little corner.', lines:['Part builder. Part marketer. Part collector.'], pose:0, color:C.blue },
 { start:5, end:13, key:'01 / PROJECTS', title:['Ideas taking shape.'], lines:['InsourceAI','GoldenWax','Cream'], roles:['AI procurement assistant','Website & brand development','Campus community app'], pose:1, color:C.green },
 { start:13, end:20, key:'02 / WORKS', title:['Making things','happen.'], lines:['Marketing & campaigns','Branding & websites','Content & creative work'], pose:2, color:C.yellow },
 { start:20, end:29, key:'03 / HOBBIES', title:['One more card.','One more story.'], lines:['Childhood Pokémon ex cards','Transformers & Star Wars comics','Pack openings on TikTok'], pose:3, color:C.blue },
 { start:29, end:34, key:'03 / HOBBIES', title:['Out for a run.'], italic:'a little time off the clock.', lines:['One step, then another.'], pose:4, color:C.green },
 { start:34, end:40, key:'04 / BLOG', title:['A few notes.'], italic:'and a work in progress.', lines:['Thoughts on work, building','and the things i learn along the way.'], pose:5, color:C.yellow },
 { start:40, end:45, key:'MAKE YOURSELF AT HOME', title:['Have a look around.'], italic:'stay a little.', lines:['Works · Projects · Hobbies · Blog'], pose:0, color:C.blue }
];
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>1-Math.pow(1-clamp(x),3);
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
function text(s,x,y,size=40,color=C.ink,font='Nook',align='left'){
 ctx.font=`${size}px ${font}`; ctx.fillStyle=color; ctx.textAlign=align;ctx.fillText(s,x,y);
}
function line(x1,y1,x2,y2,color=C.line,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
function rr(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function star(x,y,r,color,rotation=0){ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(r,0);ctx.moveTo(0,-r);ctx.lineTo(0,r);ctx.stroke();ctx.restore()}
function chip(s,x,y,color,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.font='28px Nook';const w=ctx.measureText(s).width+38;rr(x,y,w,49,24,null,C.line);text(s,x+19,y+33,28,color);ctx.restore();return w;}
function pose(index,x,y,size,t,alpha=1){
 const run=index===4;const bounce=run?-Math.abs(Math.sin(t*8))*19:Math.sin(t*2.1)*5;
 ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y+bounce);ctx.rotate(run?Math.sin(t*8)*.035:Math.sin(t*1.6)*.009);
 const sy=run?1+Math.sin(t*8)*.016:1+Math.sin(t*2.1)*.007;
 ctx.scale(1,sy);ctx.drawImage(sprites,(index%3)*512,Math.floor(index/3)*512,512,512,-size/2,-size/2,size,size);ctx.restore();
 // Tiny moving accents give the illustrated poses a consistent animation rhythm.
 if(run){for(let j=0;j<4;j++){const q=(t*1.7+j*.24)%1;ctx.globalAlpha=(1-q)*alpha*.65;line(x-size*.42-q*70,y+70+j*25,x-size*.48-q*70,y+70+j*25,C.blue,4)}ctx.globalAlpha=1;}
 else {star(x+size*.34,y-size*.24+Math.sin(t*2)*8,11,C.yellow,t*.6);}
}
function background(t){
 ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);
 const glow=ctx.createRadialGradient(W*.75,H*.52,20,W*.75,H*.52,mobile?540:720);
 glow.addColorStop(0,'#34373b');glow.addColorStop(1,C.bg);ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
 const pad=mobile?60:98;
 text('psrmalam',pad,mobile?68:91,mobile?32:34,C.ink,'NookBold');
 text('JAE’S LITTLE CORNER',W-pad,mobile?68:91,mobile?20:24,C.muted,'Nook','right');
 line(pad,mobile?96:125,W-pad,mobile?96:125);
 // Subtle moving dots retain the hand-made mood without competing with copy.
 for(let i=0;i<7;i++){ctx.fillStyle=i%2?C.blue:C.green;ctx.globalAlpha=.18;ctx.beginPath();ctx.arc(W*(.55+i*.058),H*(.22+.10*Math.sin(i*2+t*.3)),2.4,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
}
function drawScene(s,t,alpha){
 const local=t-s.start, entry=ease(local/.8), pad=mobile?60:98;
 ctx.save();ctx.globalAlpha=alpha;ctx.translate((1-entry)*28,0);
 const top=mobile?155:244;
 text(s.key,pad,top,mobile?23:26,s.color,'NookBold');
 let y=top+(mobile?86:104);
 const titleSize=mobile?70:(s.title[0].length>20?78:90);
 for(const str of s.title){text(str,pad,y,titleSize,C.ink,'NookBold');y+=mobile?78:98;}
 if(s.italic){text(s.italic,pad,y+2,mobile?45:56,s.color,'NookSerif');y+=mobile?70:92;}
 else y+=mobile?14:26;
 const n=s.lines.length;
 for(let i=0;i<n;i++){
  const a=ease((local-.35-i*.22)/.65);
  ctx.save();ctx.globalAlpha=alpha*a;const yy=y+(1-a)*12;
  if(s.roles){
   text(s.lines[i],pad,yy,mobile?42:46,C.ink,'NookBold');
   text(s.roles[i],pad,yy+(mobile?35:37),mobile?28:29,C.muted);
   y+=mobile?94:102;
  }else {text(s.lines[i],pad,yy,mobile?32:35,C.muted);y+=mobile?44:52;}
  ctx.restore();
 }
 let px=mobile?W*.53:W*.735,py=mobile?835:570,size=mobile?660:780;
 if(s.roles&&mobile){py=870;size=600;}
 if(s.pose===4)px+=Math.sin(local*.8)*12;
 pose(s.pose,px,py,size,local,alpha);
 if(!mobile){
  const caption=s.pose===0?'a little bit of me':s.pose===1?'building / experimenting':s.pose===2?'from idea to execution':s.pose===3?'the collection keeps growing':s.pose===4?'off the clock':'hello, world.';
  text(caption,px,967,27,C.muted,'NookSerif','center');
 }
 ctx.restore();
}
function footer(t){
 const pad=mobile?60:98, y=H-(mobile?55:54);
 const labels=['Projects','Works','Hobbies','Blog'];const xs=mobile?[60,250,410,630]:[98,355,595,860];
 const active=t<5?-1:t<13?0:t<20?1:t<34?2:t<40?3:-1;
 labels.forEach((label,i)=>{text(label,xs[i],y,mobile?25:28,active===i?C.ink:C.muted,active===i?'NookBold':'Nook');if(active===i)line(xs[i],y+12,xs[i]+(mobile?90:120),y+12,C.blue,3)});
 text(`${String(Math.floor(t)).padStart(2,'0')} / 45`,W-pad,y,mobile?21:26,C.muted,'Nook','right');
 line(pad,H-12,W-pad,H-12,'#414245',3);line(pad,H-12,pad+(W-2*pad)*clamp(t/45),H-12,C.blue,3);
}
function frame(t){
 background(t);
 let i=scenes.findIndex(s=>t>=s.start&&t<s.end);if(i<0)i=6;
 const s=scenes[i];
 if(i>0&&t-s.start<.45){const f=smooth((t-s.start)/.45);drawScene(scenes[i-1],t,1-f);drawScene(s,t,f);}
 else drawScene(s,t,1);
 footer(t);
}
if(preview){
 for(const t of [2,8,16,24,31,37,42]){frame(t);fs.writeFileSync(path.join(out,`preview-${mobile?'mobile':'wide'}-${t}.jpg`),canvas.toBuffer('image/jpeg',85));}
} else {
 const target=path.join(out,`psrmalam-intro${mobile?'-mobile':''}.mp4`);
 const ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgba','-video_size',`${W}x${H}`,'-framerate',String(FPS),'-i','pipe:0','-an','-c:v','libx264','-preset','medium','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart','-t','45',target],{stdio:['pipe','inherit','inherit']});
 const closed=once(ff,'close');ff.stdin.on('error',e=>{throw e});
 for(let f=0;f<DURATION*FPS;f++){
  frame(f/FPS);
  if(!ff.stdin.write(canvas.data()))await once(ff.stdin,'drain');
  if(f%300===0)console.log(`${mobile?'Mobile':'Wide'}: ${Math.round(f/FPS)} / 45 seconds`);
 }
 ff.stdin.end();const [code]=await closed;if(code!==0)throw new Error(`ffmpeg exited ${code}`);
 frame(2);fs.writeFileSync(path.join(out,`psrmalam-poster${mobile?'-mobile':''}.jpg`),canvas.toBuffer('image/jpeg',90));
 console.log(`Rendered ${target} (${fs.statSync(target).size} bytes)`);
}
