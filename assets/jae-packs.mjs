import {CARDS,LABELS,KEY,emptySave,parseSave,rollPack,addPack} from './jae-packs-core.mjs?v=2';
let dialog,save,tab='packs',opener,storageOK=true,busy=false,filter='all',fresh=new Set();
const total=CARDS.length;
const number=id=>String(id).padStart(2,'0');
const art=id=>`/assets/jae-cards/${number(id)}.svg?v=3`;
function read(){try{return parseSave(localStorage.getItem(KEY));}catch{storageOK=false;return emptySave();}}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(save));storageOK=true;}catch{storageOK=false;}}
function cardHTML(id,{back=false,locked=false,index=null}={}){
 const c=CARDS[id-1],secret=c.rarity==='secret',hidden=locked&&secret;
 if(back)return `<button class="jp-card jp-back" data-reveal="${index}" aria-label="Reveal card ${index+1} of 5"><span class="jp-back-ring">✦</span><strong>PSRMALAM</strong><span>little moments</span><small>Tap to reveal · ${index+1}/5</small></button>`;
 if(locked)return `<article class="jp-card jp-locked" aria-label="${hidden?'Secret card':c.name}, not collected"><span class="jp-card-top"><b>${number(id)} / ${total}</b><span>${LABELS[c.rarity]}</span></span><div class="jp-lock-art">${hidden?'✧':'?'}<small>${hidden?'A secret waiting to be found':'Not collected yet'}</small></div><h3>${hidden?'Unknown secret':c.name}</h3></article>`;
 return `<${index===null?'button':'article'} ${index===null?`type="button" data-inspect="${id}"`:''} class="jp-card jp-front jp-${c.rarity}${fresh.has(id)&&index!==null?' jp-new':''}"><span class="jp-card-top"><b>${number(id)} / ${total}</b><span>${LABELS[c.rarity]}</span></span><div class="jp-card-art"><img src="${art(id)}" alt="${c.name}, Jae character illustration" ${index===null?'loading="lazy"':''}>${id===18?'<span class="jp-run-pose" aria-hidden="true"></span>':''}${['rare','super','secret','full'].includes(c.rarity)?'<span class="jp-foil" aria-hidden="true"></span>':''}</div><div class="jp-card-copy"><h3>${c.name}</h3><p>${c.quote}</p></div><span class="jp-card-bottom"><span>${c.rarity==='secret'?'✦ ✦ ✦':c.rarity==='super'?'✦ ✦':['rare','full'].includes(c.rarity)?'✦':'●'} ${LABELS[c.rarity]}</span><b>${index===null?'×'+save.counts[id]:fresh.has(id)?'NEW':'DUPLICATE'}</b></span></${index===null?'button':'article'}>`;
}
function packStage(hasPack){return `<div class="jp-pack-stage ${hasPack?'jp-next-pack':''}"><button class="jp-pack" data-open-pack aria-label="Rip a five-card pack"><span class="jp-pack-seal">PSRMALAM · SERIES 01</span><span class="jp-pack-label">Little<br><em>moments.</em></span><img src="${art(4)}" alt="Jae holding a booster pack"><span class="jp-pack-bottom">5 COLLECTIBLE CARDS<br><b>${hasPack?'Rip another pack':'Swipe or tap to rip'}</b></span></button>${hasPack?'':`<div class="jp-pack-note"><span>✦</span><h3>A tiny world.<br>A very rare find.</h3><p>From everyday adventures to two elusive secrets. Which Jae is waiting inside?</p><p>Free packs. Just for fun.</p></div>`}</div>`;}
function stats(){const unique=Object.keys(save.counts).length;return `<div class="jp-progress"><span><b>${unique}</b> / ${total} collected</span><progress value="${unique}" max="${total}" aria-label="Cards collected">${unique}/${total}</progress><span>${save.packs.toLocaleString()} ${save.packs===1?'pack':'packs'} opened</span></div>`;}
function render(){
 fresh=new Set(save.last.filter(id=>save.counts[id]===1));
 const allRevealed=save.revealed.length===5,hasPack=save.last.length===5;
 dialog.innerHTML=`<div class="jp-shell"><header class="jp-header"><div><p class="jp-kicker">A secret corner of PSRMALAM</p><h2 id="jp-title">Little <em>moments.</em></h2><p>${total} versions of Jae. Five little surprises in every pack.</p></div><button class="jp-close" data-close aria-label="Close pack game">×</button></header>${stats()}<div class="jp-tabs" role="group" aria-label="Game view"><button data-tab="packs" aria-pressed="${tab==='packs'}">The pack room</button><button data-tab="binder" aria-pressed="${tab==='binder'}">My binder <span>${Object.keys(save.counts).length}/${total}</span></button></div><div class="jp-content">${tab==='packs'?`
 ${hasPack?`<div class="jp-reveal-heading"><p>${allRevealed?'Your five little moments.':`Tap any card to reveal it. ${save.revealed.length} of 5 revealed.`}</p>${allRevealed?'':'<button class="jp-text-button" data-reveal-all>Reveal all</button>'}</div><div class="jp-pulls">${save.last.map((id,i)=>cardHTML(id,{index:i,back:!save.revealed.includes(i)})).join('')}</div>`:`<div class="jp-welcome"><p class="jp-kicker">SERIES 01 · LITTLE MOMENTS</p><p>You found it.<br>There is a whole little world in here.</p></div>`}
 ${!hasPack||allRevealed?packStage(hasPack):''}
 `:`<div class="jp-binder-tools"><label for="jp-filter">Show cards</label><select id="jp-filter"><option value="all">All ${total} cards</option><option value="owned">Collected</option><option value="missing">Still to find</option>${Object.entries(LABELS).map(([r,label])=>`<option value="${r}">${label}</option>`).join('')}</select><p>Duplicates stay in your collection.</p></div><div class="jp-binder">${CARDS.filter(c=>filter==='all'||filter==='owned'&&save.counts[c.id]||filter==='missing'&&!save.counts[c.id]||filter===c.rarity).map(c=>cardHTML(c.id,{locked:!save.counts[c.id]})).join('')||'<p class="jp-empty">No cards here yet. Your next pack is waiting.</p>'}</div>`}</div><footer class="jp-game-footer"><p data-save-note>${storageOK?'Saved on this browser and device. Clearing browser data clears your binder.':'Your browser could not save progress. This collection will last for this visit only.'}</p><details><summary>What is in a pack?</summary><p>Three distinct commons + one uncommon + one chase slot. The chase slot has an 80% rare chance, 17.45% uncommon chance, 2% full art chance (1 in 50 packs), 0.5% super rare chance (1 in 200 packs), and 0.05% secret rare chance (1 in 2,000 packs). Each of the two secrets is equally likely: 1 in 4,000 packs for a specific secret.</p><p>24 commons · 14 uncommons · 8 rares · 2 super rares · 2 secrets · 6 full arts. Every pack is independent; no guaranteed rare pull after a set number of packs.</p></details></footer><p class="jp-sr" role="status" aria-live="polite" data-announcement></p></div>`;
 if(tab==='binder')dialog.querySelector('#jp-filter').value=filter;
}
function requestRip(button) {
 if (button.disabled || busy || !button.isConnected) return;
 const open = () => {
  if (button.isConnected && !button.disabled) return rip(button);
 };
 if (navigator.locks) navigator.locks.request(KEY, open);
 else open();
}

function enablePackSwipe(container) {
 let gesture;
 container.addEventListener('pointerdown', event => {
  const pack = event.target.closest('[data-open-pack]');
  if (!pack || pack.disabled || !event.isPrimary || event.button !== 0) return;
  gesture = {pack, id: event.pointerId, x: event.clientX, y: event.clientY};
  pack.setPointerCapture(event.pointerId);
 });
 container.addEventListener('pointermove', event => {
  if (gesture?.id !== event.pointerId) return;
  const dx = event.clientX - gesture.x;
  const dy = event.clientY - gesture.y;
  const distance = gesture.pack.clientWidth * 0.4;
  const horizontal = Math.abs(dx) > Math.abs(dy) * 1.4;
  const progress = horizontal ? Math.min(1, Math.abs(dx) / distance) : 0;
  gesture.pack.style.setProperty('--jp-tear', `${progress * 100}%`);
  gesture.pack.classList.toggle('jp-tearing-left', dx < 0);
  if (progress === 1) {
   const {pack} = gesture;
   gesture = undefined;
   requestRip(pack);
  }
 });
 const clear = event => {
  if (gesture?.id !== event.pointerId) return;
  gesture.pack.style.removeProperty('--jp-tear');
  gesture = undefined;
 };
 for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  container.addEventListener(type, clear);
 }
}

async function rip(button){
 if(busy||save.last.length&&save.revealed.length<5)return;
 busy=true;button.disabled=true;button.classList.add('jp-ripping');
 // Commit the entire pack before the animation/reveals, so reloads cannot lose it.
 const latest=storageOK?read():save;if(latest.last.length&&latest.revealed.length<5){save=latest;busy=false;render();return;}save=latest;const ids=rollPack();fresh=new Set(ids.filter(id=>!save.counts[id]));save=addPack(save,ids);persist();
 await new Promise(resolve=>setTimeout(resolve,matchMedia('(prefers-reduced-motion: reduce)').matches?0:650));
 busy=false;render();dialog.querySelector('[data-reveal]')?.focus();
}
function reveal(slots){
 if(busy)return;
 const targets=slots.map(slot=>dialog.querySelector(`[data-reveal="${slot}"]`)).filter(Boolean);
 if(!targets.length)return;
 for(const target of targets){
  const slot=Number(target.dataset.reveal);
  save.revealed.push(slot);
  target.insertAdjacentHTML('afterend',cardHTML(save.last[slot],{index:slot}));
  target.nextElementSibling.classList.add('jp-flipping');
  target.remove();
 }
 persist();
 const complete=save.revealed.length===5;
 dialog.querySelector('.jp-reveal-heading p').textContent=complete
  ? 'Your five little moments.'
  : `Tap any card to reveal it. ${save.revealed.length} of 5 revealed.`;
 if(complete){
  dialog.querySelector('[data-reveal-all]').remove();
  dialog.querySelector('.jp-content').insertAdjacentHTML('beforeend',packStage(true));
 }
 const card=CARDS[save.last[Number(targets[0].dataset.reveal)]-1];
 dialog.querySelector('[data-announcement]').textContent=targets.length>1
  ? 'All five cards revealed.' : `${card.name}. ${LABELS[card.rarity]}.`;
 (dialog.querySelector('[data-reveal]')||dialog.querySelector('[data-open-pack]'))?.focus({preventScroll:true});
}
function inspect(id){
 const view=document.createElement('dialog');view.className='jp-inspect';view.setAttribute('aria-label',CARDS[id-1].name);
 view.innerHTML=`<form method="dialog"><button aria-label="Close enlarged card">×</button></form>${cardHTML(id)}`;
 document.body.append(view);view.showModal();view.addEventListener('close',()=>view.remove(),{once:true});
 view.addEventListener('click',e=>{if(e.target===view)view.close();});
}
export function openGame(trigger){
 opener=trigger;
 if(!dialog){
 dialog=document.createElement('dialog');dialog.className='jp-dialog';dialog.setAttribute('aria-labelledby','jp-title');document.body.append(dialog);
 enablePackSwipe(dialog);
 dialog.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-close'))dialog.close();
 else if(b.dataset.tab&&!busy){tab=b.dataset.tab;render();dialog.querySelector(`[data-tab="${tab}"]`).focus();}
 else if(b.hasAttribute('data-open-pack'))requestRip(b);
 else if(b.hasAttribute('data-reveal'))reveal([Number(b.dataset.reveal)]);
 else if(b.hasAttribute('data-reveal-all'))reveal([0,1,2,3,4]);
 else if(b.dataset.inspect)inspect(Number(b.dataset.inspect));
 });
 dialog.addEventListener('change',e=>{if(e.target.id==='jp-filter'){filter=e.target.value;render();dialog.querySelector('#jp-filter').focus();}});
 dialog.addEventListener('close',()=>{document.documentElement.classList.remove('jp-playing');opener?.focus();});
 window.addEventListener('storage',e=>{if(e.key===KEY&&!busy){save=read();fresh.clear();if(dialog.open)render();}});
 }
 if(busy)return;save=storageOK||!save?read():save;render();dialog.showModal();document.documentElement.classList.add('jp-playing');dialog.querySelector('[data-close]').focus();
}
