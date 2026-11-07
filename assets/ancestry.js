import { unlockArchive } from './ancestry-crypto.mjs';
const $ = (s, root=document) => root.querySelector(s);
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lockScreen=$('#ancestry-lock'), content=$('#ancestry-content'), form=$('#ancestry-unlock'), input=$('#ancestry-password'), status=$('#ancestry-status'), viewer=$('#ancestry-viewer');
let archive=null, people=new Map(), current=null, zoom=1, overview=true, tab='tree', previousFocus=null;
const sourceLink=s=>s.url && /^https:\/\//.test(s.url)?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} <span aria-hidden="true">↗</span></a>`:esc(s.title);
const mediaById=id=>archive.media.find(m=>m.id===id);
const badge=s=>`<span class="anc-badge ${s==='Research lead'?'anc-tentative':''}">${esc(s)}</span>`;
const personButton=id=>{const p=people.get(id);return p?`<button class="anc-person-link" data-person="${esc(id)}">${esc(p.name)}</button>`:'';};
$('#ancestry-show').addEventListener('click',e=>{const show=input.type==='password';input.type=show?'text':'password';e.currentTarget.textContent=show?'Hide':'Show';e.currentTarget.setAttribute('aria-pressed',String(show));e.currentTarget.setAttribute('aria-label',show?'Hide password':'Show password');});
form.addEventListener('submit',async e=>{
  e.preventDefault(); const submit=$('[type=submit]',form);submit.disabled=true;status.textContent='Opening the family archive…';
  try {
    if(!globalThis.crypto?.subtle) throw new Error('secure-context');
    const response=await fetch('/assets/ancestry.vault.json',{cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});
    if(!response.ok)throw new Error('network');
    const envelope=await response.json();
    try { archive=await unlockArchive(input.value,envelope); } catch { throw new Error('password'); }
    people=new Map(archive.people.map(p=>[p.id,p]));input.value='';input.type='password';$('#ancestry-show').textContent='Show';$('#ancestry-show').setAttribute('aria-pressed','false');$('#ancestry-show').setAttribute('aria-label','Show password');
    status.textContent='';lockScreen.hidden=true;content.hidden=false;renderArchive();$('#anc-title').focus();
  } catch(err) {status.textContent=err.message==='password'?'That password did not unlock the archive. Please try again.':err.message==='secure-context'?'Please open this page using HTTPS in an up-to-date browser.':'The archive could not load. Check your connection and try again.';input.focus();}
  finally {submit.disabled=false;}
});
function lockArchive(){if(viewer.open)viewer.close();viewer.innerHTML='';content.replaceChildren();content.hidden=true;lockScreen.hidden=false;archive=null;people.clear();current=null;input.value='';input.focus();}
window.addEventListener('pagehide',lockArchive);
function renderArchive(){
  content.innerHTML=`<header class="anc-heading"><div><p class="eyebrow">Our family archive</p><h1 id="anc-title" tabindex="-1">Our roots.<br><em>Still growing.</em></h1><p>The Leows, a branch of the Tohs, and the stories we are piecing together.</p></div><div class="anc-heading-side"><span>${archive.people.length} people · ${archive.media.length} photographs & records</span><button class="anc-button" data-action="lock">Lock archive</button></div></header>
  <nav class="anc-tabs" aria-label="Ancestry views">${[['tree','Family tree'],['stories','Stories & discoveries'],['archive','Photos & records']].map(([id,label])=>`<button data-tab="${id}" aria-pressed="${id==='tree'}">${label}</button>`).join('')}</nav>
  <section id="anc-tree-panel"><div class="anc-search-row"><div class="anc-search"><label for="anc-search">Find someone in the family</label><input id="anc-search" type="search" autocomplete="off" placeholder="Search a name…"><div id="anc-results" aria-live="polite"></div></div><div class="anc-shortcuts"><button class="anc-button" data-action="overview">Direct line</button><button class="anc-button" data-person="joseph">Leow family</button><button class="anc-button" data-person="maria-toh">Toh branch</button><button class="anc-button" data-person="vincent">My family</button></div></div>
  <div class="anc-tree-layout"><div class="anc-tree-card"><div class="anc-tree-toolbar"><div><strong>Explore the connections</strong><p>Tap a person to follow their branch.</p></div><div class="anc-zoom"><button data-action="zoom-out" aria-label="Zoom out">−</button><button data-action="reset" aria-label="Reset tree zoom">Reset</button><button data-action="zoom-in" aria-label="Zoom in">+</button></div></div><div id="anc-canvas" tabindex="0" aria-label="Family tree. Scroll to explore and tap a person for details."><div id="anc-tree-size"><div id="anc-tree"></div></div></div><p class="anc-tree-legend"><span>Solid: documented relationship</span><span class="account">Dashed: family account</span><span class="lead">Dotted: research lead</span></p></div><aside id="anc-detail" aria-label="Selected person details" aria-live="polite"></aside></div>
  <details class="anc-directory"><summary>Browse everyone <span>${archive.people.length} people</span></summary><div class="anc-directory-grid">${archive.people.map(p=>`<button data-person="${esc(p.id)}"><strong>${esc(p.name)}</strong><span>${esc(p.role)}</span></button>`).join('')}</div></details></section>
  <section id="anc-stories-panel" hidden><div class="anc-stories">${archive.stories.map(s=>`<article class="anc-story">${badge(s.status)}<h2>${esc(s.title)}</h2>${s.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}${s.people?.length?`<div class="anc-related">${s.people.map(personButton).join('')}</div>`:''}${s.media?.length?`<div class="anc-story-media">${s.media.map(id=>mediaCard(mediaById(id))).join('')}</div>`:''}${s.sources?.length?`<div class="anc-sources"><h3>Sources & notes</h3>${s.sources.map(s=>`<p>${sourceLink(s)}</p>`).join('')}</div>`:''}</article>`).join('')}</div><section class="anc-timeline"><p class="eyebrow">Through the generations</p><h2>A family timeline.</h2>${archive.timeline.map(t=>`<article><time>${esc(t.date)}</time><div><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p></div></article>`).join('')}</section></section>
  <section id="anc-archive-panel" hidden><div class="anc-archive-heading"><h2>The family album.</h2><p>Open a photograph or clipping to read its caption and look closer.</p></div><div class="anc-media-filters" aria-label="Record type">${['All','Photographs','Memorials','Newspapers','Clan records'].map((label,i)=>`<button data-filter="${label}" aria-pressed="${i===0}">${label}</button>`).join('')}</div><div id="anc-gallery" class="anc-gallery">${archive.media.map(mediaCard).join('')}</div></section>
  <p class="anc-footnote">This is a growing family record. Every person and story includes its evidence or uncertainty. Refreshed ${esc(archive.updated)}.</p>`;
  $('#anc-search').addEventListener('input',e=>{
    const q=e.target.value.trim().toLocaleLowerCase();const matches=q?archive.people.filter(p=>[p.name,p.role,...(p.aliases||[])].join(' ').toLocaleLowerCase().includes(q)):[];
    $('#anc-results').innerHTML=q?(matches.length?matches.map(p=>`<button data-person="${esc(p.id)}"><strong>${esc(p.name)}</strong><span>${esc(p.role)}</span></button>`).join(''):'<p>No names match that search.</p>'):'';
  });
  selectPerson('joseph',false);overview=true;renderTree();setupPan();tab='tree';
}
function mediaCard(m){return m?`<button class="anc-media-card" data-media="${esc(m.id)}"><span class="anc-media-image"><img src="${m.data}" alt="${esc(m.alt)}" loading="lazy"></span><span class="anc-media-caption"><small>${esc(m.kind)}${m.date?' · '+esc(m.date):''}</small><strong>${esc(m.title)}</strong><span>View record ↗</span></span></button>`:'';}
content.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button||!archive)return;
  if(button.dataset.person){setTab('tree');selectPerson(button.dataset.person,true);$('#anc-search').value='';$('#anc-results').replaceChildren();}
  else if(button.dataset.tab)setTab(button.dataset.tab);
  else if(button.dataset.media)openMedia(button.dataset.media);
  else if(button.dataset.filter){content.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('#anc-gallery').innerHTML=archive.media.filter(m=>button.dataset.filter==='All'||m.kind===button.dataset.filter).map(mediaCard).join('');}
  else if(button.dataset.action==='lock')lockArchive();
  else if(button.dataset.action==='overview'){overview=true;zoom=1;renderTree();}
  else if(button.dataset.action){zoom=button.dataset.action==='reset'?1:Math.max(.55,Math.min(1.6,zoom+(button.dataset.action==='zoom-in'?.15:-.15)));renderTree();}
});
function setTab(id){tab=id;for(const t of ['tree','stories','archive'])$(`#anc-${t}-panel`).hidden=t!==id;content.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===id)));}
function related(id,type){return archive.relations.filter(r=>r.kind===type&&(r.from===id||r.to===id));}
function parentsOf(id){return archive.relations.filter(r=>r.kind==='parent'&&r.to===id);}
function childrenOf(id){return archive.relations.filter(r=>r.kind==='parent'&&r.from===id);}
function selectPerson(id,move){if(!people.has(id))return;current=id;overview=false;zoom=1;renderTree();renderDetail();if(move){if(matchMedia('(max-width: 760px)').matches)$('#anc-detail').scrollIntoView({behavior:'auto',block:'start'});else $('#anc-tree-panel').scrollIntoView({behavior:'auto',block:'start'});}}
function renderTree(){
  if(overview){renderOverview();return;}
  const p=people.get(current),spouseR=related(current,'spouse'),spouseIds=spouseR.map(r=>r.from===current?r.to:r.from),family=[current,...spouseIds],parents=parentsOf(current),children=childrenOf(current),sibR=related(current,'sibling');
  const childIds=[...new Set(children.map(r=>r.to))],parentIds=parents.map(r=>r.from),extraSiblings=sibR.map(r=>r.from===current?r.to:r.from);
  const nodes=[],links=[];const cardW=178,cardH=108,gap=22,step=cardW+gap;
  const width=Math.max(640,Math.max(childIds.length,parentIds.length,family.length)*step+64),center=width/2;
  const row=(ids,y)=>ids.forEach((id,i)=>nodes.push({id,x:center-ids.length*step/2+i*step+gap/2,y}));
  row(parentIds,48);row(family,244);row(childIds,452);
  const byId=id=>nodes.find(n=>n.id===id);
  const focus=byId(current);
  parents.forEach(r=>{const a=byId(r.from),b=focus;links.push({d:`M${a.x+cardW/2} ${a.y+cardH}V198H${b.x+cardW/2}V${b.y}`,status:r.status});});
  spouseIds.forEach(id=>{const b=byId(id);links.push({d:`M${focus.x+cardW} ${focus.y+cardH/2}H${b.x}`,status:spouseR.find(r=>r.from===id||r.to===id).status});});
  children.forEach(r=>{const child=byId(r.to),coparent=spouseIds.find(id=>parentsOf(r.to).some(x=>x.from===id));const start=coparent?(focus.x+cardW+byId(coparent).x)/2:focus.x+cardW/2;
    links.push({d:`M${start} ${coparent?focus.y+cardH/2:focus.y+cardH}V402H${child.x+cardW/2}V${child.y}`,status:r.status});});
  const height=childIds.length?610:parents.length?408:408;
  $('#anc-tree-size').style.width=`${width*zoom}px`;$('#anc-tree-size').style.height=`${height*zoom}px`;
  $('#anc-tree').style.cssText=`width:${width}px;height:${height}px;transform:scale(${zoom})`;
  $('#anc-tree').innerHTML=`<svg class="anc-connections" width="${width}" height="${height}" aria-hidden="true">${links.map(l=>`<path d="${l.d}" class="${l.status==='Family account'?'account':l.status==='Research lead'?'lead':''}"/>`).join('')}</svg>${parentIds.length?'<span class="anc-row-label" style="top:12px">Parents</span>':''}<span class="anc-row-label" style="top:208px">${esc(spouseIds.length?'Family':'Selected person')}</span>${childIds.length?'<span class="anc-row-label" style="top:416px">Children</span>':''}${nodes.map(n=>{const person=people.get(n.id);return `<button class="anc-node ${n.id===current?'selected':''} ${person.branch==='Toh'?'toh':''}" style="left:${n.x}px;top:${n.y}px;width:${cardW}px;height:${cardH}px" data-person="${esc(n.id)}" aria-pressed="${n.id===current}"><span class="anc-node-branch">${esc(person.branch||'Family')}</span><strong>${esc(person.name)}</strong><small>${esc(person.dates||person.role)}</small></button>`;}).join('')}`;
  requestAnimationFrame(()=>{const canvas=$('#anc-canvas');canvas.scrollLeft=Math.max(0,center*zoom-canvas.clientWidth/2);canvas.scrollTop=0;});
}
function renderOverview(){
  const rows=[['francis','maria-ang','toh-seah','chia-bee'],['joseph','maria-toh'],['vincent','eileen'],['jeremiah','justin']];
  const width=880,height=780,cardW=178,cardH=108,step=200,nodes=[];
  rows.forEach((ids,row)=>ids.forEach((id,i)=>nodes.push({id,x:width/2-ids.length*step/2+i*step+11,y:44+row*190})));
  const byId=new Map(nodes.map(n=>[n.id,n])),links=[];
  archive.relations.filter(r=>byId.has(r.from)&&byId.has(r.to)&&r.kind!=='sibling').forEach(r=>{const a=byId.get(r.from),b=byId.get(r.to);let d;
    if(r.kind==='spouse')d=`M${Math.min(a.x,b.x)+cardW} ${a.y+cardH/2}H${Math.max(a.x,b.x)}`;
    else d=`M${a.x+cardW/2} ${a.y+cardH}V${a.y+cardH+38}H${b.x+cardW/2}V${b.y}`;
    links.push({d,status:r.status});
  });
  $('#anc-tree-size').style.width=`${width*zoom}px`;$('#anc-tree-size').style.height=`${height*zoom}px`;
  $('#anc-tree').style.cssText=`width:${width}px;height:${height}px;transform:scale(${zoom})`;
  $('#anc-tree').innerHTML=`<svg class="anc-connections" width="${width}" height="${height}" aria-hidden="true">${links.map(l=>`<path d="${l.d}" class="${l.status==='Family account'?'account':''}"/>`).join('')}</svg>${['Great-grandparents','Grandparents','Parents','Our generation'].map((label,i)=>`<span class="anc-row-label" style="top:${i*190+10}px">${label}</span>`).join('')}${nodes.map(n=>{const p=people.get(n.id);return `<button class="anc-node ${n.id===current?'selected':''} ${p.branch==='Toh'?'toh':''}" style="left:${n.x}px;top:${n.y}px;width:${cardW}px;height:${cardH}px" data-person="${esc(n.id)}" aria-pressed="${n.id===current}"><span class="anc-node-branch">${esc(p.branch)}</span><strong>${esc(p.name)}</strong><small>${esc(p.dates||p.role)}</small></button>`;}).join('')}`;
  requestAnimationFrame(()=>{const canvas=$('#anc-canvas');canvas.scrollLeft=Math.max(0,width*zoom/2-canvas.clientWidth/2);canvas.scrollTop=0;});
}
function renderDetail(){const p=people.get(current),spouses=related(current,'spouse').map(r=>r.from===current?r.to:r.from),parents=parentsOf(current).map(r=>r.from),children=childrenOf(current).map(r=>r.to);
  const siblingIds=new Set(related(current,'sibling').map(r=>r.from===current?r.to:r.from));parents.forEach(parent=>childrenOf(parent).forEach(r=>{if(r.to!==current)siblingIds.add(r.to);}));
  $('#anc-detail').innerHTML=`<div class="anc-detail-top">${badge(p.status)}<p class="eyebrow">${esc(p.role)}</p><h2>${esc(p.name)}</h2>${p.dates?`<p class="anc-person-dates">${esc(p.dates)}</p>`:''}${p.aliases?.length?`<p class="anc-alias">Also recorded as ${p.aliases.map(esc).join(' · ')}</p>`:''}</div>${p.notes.map(n=>`<p>${esc(n)}</p>`).join('')}${[['Parents',parents],['Spouse',spouses],['Children',children],['Siblings',[...siblingIds]],['Grandchildren recorded',p.grandchildren||[]]].filter(x=>x[1].length).map(([label,ids])=>`<div class="anc-relations"><h3>${label}</h3>${ids.map(personButton).join('')}</div>`).join('')}${p.media?.length?`<div class="anc-detail-media">${p.media.map(id=>mediaCard(mediaById(id))).join('')}</div>`:''}<div class="anc-sources"><h3>Sources & notes</h3>${p.sources.map(s=>`<p>${sourceLink(s)}</p>`).join('')}</div>`;
}
function setupPan(){const canvas=$('#anc-canvas');let drag=null;
  canvas.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.target.closest('button'))return;drag={x:e.clientX,y:e.clientY,left:canvas.scrollLeft,top:canvas.scrollTop};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;canvas.scrollLeft=drag.left+drag.x-e.clientX;canvas.scrollTop=drag.top+drag.y-e.clientY;});
  for(const type of ['pointerup','pointercancel'])canvas.addEventListener(type,()=>drag=null);
}
function openMedia(id){const m=mediaById(id);if(!m)return;previousFocus=document.activeElement;
  viewer.innerHTML=`<div class="anc-viewer-head"><div><small>${esc(m.kind)}${m.date?' · '+esc(m.date):''}</small><h2 id="ancestry-viewer-title">${esc(m.title)}</h2></div><button class="anc-button" data-close>Close</button></div><div class="anc-viewer-toolbar"><button class="anc-button" data-image-size>Zoom in</button><span>Scroll to explore an enlarged image.</span></div><div class="anc-viewer-image"><img src="${m.data}" alt="${esc(m.alt)}"></div><div class="anc-viewer-caption"><p>${esc(m.caption)}</p><p>${sourceLink(m.source)}</p></div>`;viewer.showModal();
}
viewer.addEventListener('click',e=>{if(e.target.closest('[data-close]')||e.target===viewer)viewer.close();if(e.target.closest('[data-image-size]')){const el=$('.anc-viewer-image',viewer),large=el.classList.toggle('enlarged');$('[data-image-size]',viewer).textContent=large?'Fit image':'Zoom in';}});
viewer.addEventListener('close',()=>{viewer.innerHTML='';if(previousFocus?.isConnected)previousFocus.focus();previousFocus=null;});
