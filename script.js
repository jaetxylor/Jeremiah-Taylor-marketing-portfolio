const D = window.PORTFOLIO_DATA;

const esc = (s='') => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function logoMarkup(x, className='brand-logo'){
  const fallback = esc(x.logoText || x.shortName || x.name || x.organization || 'Brand');
  if(!x.logo) return `<div class="${className} text-logo"><span>${fallback}</span></div>`;
  return `<div class="${className}"><img src="${esc(x.logo)}" alt="${fallback} logo" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='block'" /><span class="logo-fallback">${fallback}</span></div>`;
}

function renderBuilt(){
  const el=document.getElementById('web-built-grid');
  el.innerHTML=D.websitesBuilt.map((x,i)=>`<article class="web-card reveal" data-delay="${i*50}">
    <div class="web-art ${esc(x.accent)}"><span class="web-label">${esc(x.label)}</span><div class="web-browser"><div class="web-browser-bar"><i></i><i></i><i></i></div><div class="web-browser-body"><div class="web-browser-logo">${esc(x.name)}</div><div class="web-browser-lines"><i></i><i></i><i></i></div></div></div></div>
    <div class="web-card-copy"><div class="web-meta"><span>${esc(x.type)}</span><span>0${i+1}</span></div><h3>${esc(x.name)}</h3><p>${esc(x.description)}</p><div class="tags">${x.tools.map(t=>`<span>${esc(t)}</span>`).join('')}</div>${x.url?`<a class="card-link" href="${esc(x.url)}" target="_blank" rel="noopener">Visit live site ↗</a>`:`<span class="card-status">${esc(x.status || 'Link unavailable')}</span>`}</div>
  </article>`).join('');
}

function renderManaged(){
  document.getElementById('web-managed-grid').innerHTML=D.websitesManaged.map(x=>`<article class="managed-card reveal">${logoMarkup(x,'managed-logo')}<span class="platform">${esc(x.platform)}</span><h4>${esc(x.name)}</h4><p>${esc(x.description)}</p>${x.url?`<a href="${esc(x.url)}" target="_blank" rel="noopener">Open site ↗</a>`:`<span class="managed-status">${esc(x.status || 'Link unavailable')}</span>`}</article>`).join('');
}

function renderCampaigns(){
  document.getElementById('campaign-grid').innerHTML=D.publicCampaigns.map(x=>`<article class="campaign-card campaign-group-card reveal"><div class="campaign-org">${logoMarkup({logo:x.logo,logoText:x.shortName},'campaign-logo')}<div><span class="campaign-platform">${esc(x.platform)}</span><h4>${esc(x.organization)}</h4></div></div><div class="campaign-list">${x.campaigns.map(c=>`<span>${esc(c)}</span>`).join('')}</div><p>${esc(x.scope)}</p></article>`).join('');
}

function renderCommercial(){
  document.getElementById('commercial-grid').innerHTML=D.commercialSocial.map(x=>`<article class="commercial-card reveal"><span class="channel">${esc(x.platform)}</span><h3>${esc(x.name)}</h3><p>${esc(x.description)}</p></article>`).join('');
}

function renderCreative(){
  document.getElementById('creative-grid').innerHTML=D.creativeExecution.map((x,i)=>`<article class="creative-card reveal" data-delay="${i*60}"><div class="creative-card-top"><span class="creative-index">${esc(x.index)}</span><span class="creative-type">Selected discipline</span></div><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p><div class="creative-list">${x.items.map(item=>`<span>${esc(item)}</span>`).join('')}</div></article>`).join('');
}

function renderEducation(){
  document.getElementById('education-grid').innerHTML=D.education.map(x=>`<article class="education-card"><span>${esc(x.school)}</span><h3>${esc(x.credential)}</h3><p>${esc(x.focus)}</p></article>`).join('');
}

function renderCollabs(){
  document.getElementById('collab-cloud').innerHTML=D.collaborations.map(x=>`<span class="collab-pill">${esc(x)}</span>`).join('');
}

function renderCerts(){
  document.getElementById('cert-grid').innerHTML=D.certifications.map((x,i)=>`<article class="cert-card"><span>0${i+1}</span><h3>${esc(x)}</h3></article>`).join('');
}

renderBuilt();renderManaged();renderCampaigns();renderCreative();renderCommercial();renderCollabs();renderCerts();renderEducation();

document.getElementById('year').textContent=new Date().getFullYear();
const reveals=document.querySelectorAll('.reveal');
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){const delay=Number(entry.target.dataset.delay||0);setTimeout(()=>entry.target.classList.add('visible'),delay);observer.unobserve(entry.target)}}),{threshold:.08});
reveals.forEach(el=>observer.observe(el));
