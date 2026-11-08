import fs from 'node:fs';
import { renderBooks } from './books.mjs';
import { renderGuestbook } from './guestbook.mjs';
import { addSectionMascot } from './section-mascots.mjs';
import { renderGames } from './games.mjs';
import { renderArcade } from './arcade.mjs';
import { renderProject } from './projects.mjs';
import { renderAncestry } from './ancestry.mjs';
import { loadTravel, renderTravel, renderTravelAlbum } from './travel.mjs';
import { mascotMark, mascotStage, mascotPeek } from './mascot.mjs';
import { validateBlock, renderBlock, blockText } from './post-blocks.mjs';
import { renderCollection, renderCollectionTeaser, renderHuntList } from './collection.mjs';
import { renderComics, renderComicInventory } from './comics.mjs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const site = read('content/site.json'), projects = read('content/projects.json');
const collection = read('content/ex-collection.json');
const games = read('content/games.json');
const comics = read('content/comic-collection.json');
const books = read('content/books.json');
const travel = loadTravel(root);
const blogTopics = read('content/blog-topics.json');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'portfolio-data.js'),'utf8'),context);
const experience = context.window.PORTFOLIO_DATA;
const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const base = site.url.replace(/\/$/, '');
if (!/^https:\/\//.test(base)) throw new Error('Site URL must use HTTPS');
const today = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Singapore',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const dateLabel = date => new Date(`${date}T00:00:00+08:00`).toLocaleDateString('en-SG',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Singapore'});
const posts = fs.readdirSync(path.join(root,'content/posts')).filter(f=>f.endsWith('.json')).map(file => {
  const p = read(`content/posts/${file}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)) throw new Error(`Invalid slug: ${file}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date) || Number.isNaN(Date.parse(p.date)) || new Date(p.date).toISOString().slice(0,10)!==p.date) throw new Error(`Invalid date: ${file}`);
  if (!p.title || !p.excerpt || !Array.isArray(p.body) || typeof p.draft!=='boolean') throw new Error(`Missing post fields: ${file}`);
  for (const b of p.body) {
    try { validateBlock(b, root); } catch (error) { throw new Error(`${file}: ${error.message}`); }
  }
  if (p.tags !== undefined && (!Array.isArray(p.tags) || p.tags.some(t => typeof t !== 'string' || !t.trim() || t.length > 40))) throw new Error(`Invalid tags: ${file}`);
  p.tags = [...new Set((p.tags || [p.category]).filter(Boolean).map(t => t.trim()))];
  return p;
}).filter(p=>!p.draft && p.date<=today).sort((a,b)=>b.date.localeCompare(a.date)||a.slug.localeCompare(b.slug));
if(new Set(posts.map(p=>p.slug)).size!==posts.length) throw new Error('Duplicate post slug');
for(const p of projects) if(!/^[a-z0-9-]+$/.test(p.slug)) throw new Error('Invalid project slug');
if(new Set(projects.map(p=>p.slug)).size!==projects.length) throw new Error('Duplicate project slug');
const urls=[];
fs.mkdirSync(out,{recursive:true});
for(const file of fs.readdirSync(out)) fs.rmSync(path.join(out,file),{recursive:true,force:true});
fs.cpSync(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
for(const f of ['styles.css','overrides.css','portfolio-data.js']) fs.copyFileSync(path.join(root,f),path.join(out,f));
fs.writeFileSync(path.join(out,'portfolio-data.js'),fs.readFileSync(path.join(root,'portfolio-data.js'),'utf8').replaceAll('"assets/','"/assets/'));
fs.writeFileSync(path.join(out,'script.js'),fs.readFileSync(path.join(root,'script.js'),'utf8').replace(/[↗↘↓←→]/g,''));
fs.writeFileSync(path.join(out,'.nojekyll'),'');
const routes={'/index.html':'/','/about.html':'/about/','/projects.html':'/projects/','/experience.html':'/works/','/portfolio.html':'/portfolio/'};
function routePath(p){return routes[p]||p.replace(/\/index\.html$/,'/');}
function normalizeHTML(html,file){return html.replace(/\b(href|src)="([^"]*)"/g,(all,attr,value)=>{
 if(!value||value.startsWith('#')||/^(?:mailto:|tel:|data:)/.test(value))return all;
 const u=new URL(value,base+'/'+file);
 if(u.origin!==new URL(base).origin)return all;
 const target=routePath(u.pathname)+u.search+u.hash;
 return `${attr}="${value.startsWith('https://')?base:''}${target}"`;
});}
function write(file,body,index=true){
 const destination=routePath('/'+file).slice(1);
 const output=file.endsWith('.html')?(destination.endsWith('/')||!destination?destination+'index.html':destination):file;
 fs.mkdirSync(path.dirname(path.join(out,output)),{recursive:true});
 fs.writeFileSync(path.join(out,output),file.endsWith('.html')?normalizeHTML(body,file):body);
 if(index)urls.push(destination);
}
const arrow = '';
const clean = html => html.replace(/[✳↗↘↓←→]/g, '');
function header(prefix='',active=''){return `<header class="site-header psr-header"><a class="brand" href="/" aria-label="Jae home">${mascotMark}</a><a class="site-wordmark" href="/" aria-label="PSRMALAM home"><img src="/assets/psrmalam-cloud-wordmark.webp" width="1200" height="400" alt="PSRMALAM" decoding="async"></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">Menu</button><nav id="primary-nav" class="nav-links" aria-label="Primary navigation">${[['About me','/about/','about'],['Projects','/projects/','projects'],['Works','/works/','experience'],['Hobby','/hobby/','hobby'],['Blog','/blog/','blog'],['Guest book','/guestbook/','guestbook']].map(([label,url,key])=>`<a href="${url}"${active===key?' aria-current="page"':''}>${label}</a>`).join('')}</nav></header>`;}
const tags = list => `<div class="tags">${list.map(t=>`<span>${e(t)}</span>`).join('')}</div>`;
function page({title,description=site.description,file,active='',prefix='',body,schema,collectionAssets=false,collectionScript=false,blogMedia=false,comicsAssets=false,comicsScript=false,travelAssets=false,ancestryAssets=false,gamesAssets=false,guestbookAssets=false,booksAssets=false}){
  body = addSectionMascot(body, booksAssets ? 'books' : active);
  const sectionMascotAssets = booksAssets || ['projects','experience','blog'].includes(active);
  const href=route=>prefix+route;
  const canonical=base+routePath('/'+file);
  const json=JSON.stringify(schema||{'@context':'https://schema.org','@type':'WebSite',name:site.name,url:base+'/',author:{'@type':'Person',name:site.author}}).replace(/</g,'\\u003c');
  return clean(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#242424"><title>${e(title)} · psrmalam</title><meta name="description" content="${e(description)}"><link rel="canonical" href="${e(canonical)}"><meta property="og:title" content="${e(title)} · psrmalam"><meta property="og:description" content="${e(description)}"><meta property="og:type" content="${schema?.['@type']==='BlogPosting'?'article':'website'}"><meta property="og:url" content="${e(canonical)}"><meta property="og:image" content="${e(base)}/assets/IMG_1170_VSCO.jpeg"><meta name="twitter:card" content="summary_large_image">${active==='home'?'<link rel="stylesheet" href="/assets/hero/hero.css?v=3"><script defer src="/assets/hero/hero.js?v=3"></script>':''}<link rel="icon" href="${href('assets/favicon.svg')}" type="image/svg+xml"><link rel="stylesheet" href="${href('assets/personal.css')}?v=8"><link rel="stylesheet" href="${href('assets/dark-theme.css')}?v=15">${body.includes('id="collaborations"')?'<link rel="stylesheet" href="/assets/collaborations.css?v=1">':''}${active==='projects'?'<link rel="stylesheet" href="/assets/projects.css?v=1">':''}${sectionMascotAssets?'<link rel="stylesheet" href="/assets/section-mascots.css?v=5">':''}${booksAssets?'<link rel="stylesheet" href="/assets/books.css?v=1">':''}${guestbookAssets?'<link rel="stylesheet" href="/assets/guestbook.css?v=4"><script defer src="/assets/guestbook.js?v=3"></script>':''}${gamesAssets?'<link rel="stylesheet" href="/assets/games.css?v=3"><script defer src="/assets/games.js?v=3"></script>':''}${collectionAssets?`<link rel="stylesheet" href="${href('assets/ex-collection.css')}?v=1">`:''}${collectionScript?`<script defer src="${href('assets/ex-collection.js')}?v=1"></script>`:''}${blogMedia?`<link rel="stylesheet" href="${href('assets/blog-media.css')}"><script defer src="${href('assets/blog-media.js')}"></script>`:''}${comicsAssets?`<link rel="stylesheet" href="${href('assets/comics.css')}?v=3">`:''}${comicsScript?`<script defer src="${href('assets/comics.js')}?v=3"></script>`:''}${ancestryAssets?'<meta name="robots" content="noindex,nofollow,noarchive"><meta name="referrer" content="no-referrer"><link rel="stylesheet" href="/assets/ancestry.css?v=2"><script type="module" src="/assets/ancestry.js?v=1"></script>':''}${travelAssets?'<link rel="stylesheet" href="/assets/travel.css?v=4"><script type="module" src="/assets/travel.js?v=1"></script>':''}<link rel="alternate" type="application/rss+xml" title="psrmalam blog" href="${href('feed.xml')}"><script type="application/ld+json">${json}</script><script defer src="${href('assets/personal.js')}?v=14"></script>${body.includes('data-run-meter') ? '<script type="module" src="/assets/run-meter.mjs?v=1"></script>' : ''}</head><body data-page="${active}"><a class="skip" href="#main">Skip to content</a>${header(prefix,active)}<main id="main">${body}</main>${active !== 'home' ? `<section class="contact-section"><div class="shell"><p class="eyebrow">Stay a little. Say hello.</p><h2>Thanks for<br><em>stopping by.</em></h2><div class="contact-row"><a href="mailto:${e(site.email)}">${e(site.email)}</a><a href="${e(site.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a><a href="${href('about.html')}">About & CV</a><span>Singapore</span></div></div></section>` : ''}<footer><span>© ${new Date().getUTCFullYear()} Jeremiah Leow</span><span>A little corner of the internet</span><a class="footer-admin" href="https://psrmalam-guestbook.jaetxylor.chatgpt.site/admin">admin</a></footer></body></html>`);
}
const brandAssets = {
 insourceai: 'insourceai-official-logo.svg',
 'golden-wax': 'goldenwax-polishing-logo.webp',
 cream: 'cream-wordmark.webp'
};

function brandArt(brand) {
 const asset = brandAssets[brand];
 if (!asset) return '';
 return `<div class="brand-art brand-art-${brand}"><img src="/assets/${asset}" alt="" loading="lazy" decoding="async"></div>`;
}
function projectCard(p,i,prefix=''){
 const category=p.slug==='insourceai'||p.slug==='cream'?'venture':p.slug==='campaigns'?'campaign':'web';
 const website=p.links.find(link=>/^https:\/\//.test(link.url))?.url;
 if(!website) throw new Error(`Missing project website: ${p.slug}`);
 const visit=`href="${e(website)}" target="_blank" rel="noopener noreferrer" aria-label="Visit ${e(p.name)} website (opens in a new tab)"`;
 return `<article class="project-card" data-category="${category}" data-reveal><a class="project-cover" ${visit}>${brandArt(p.slug)}<span class="cover-action">Visit website ${arrow}</span></a><div class="project-info"><div><p class="eyebrow">${e(p.category)} <span>/ ${e(p.status)}</span></p><h3><a href="${prefix}projects/${p.slug}/">${e(p.name)}</a></h3><p class="project-card-intro">${e(p.intro)}</p><div class="project-card-actions"><a class="text-link" href="${prefix}projects/${p.slug}/">Read the project story</a><a class="text-link" ${visit}>Visit website</a></div></div><a class="circle-link" href="${prefix}projects/${p.slug}/" aria-label="Explore ${e(p.name)}">${arrow}</a></div></article>`;
}
const postTags = p => `<nav class="post-tags" aria-label="Post topics">${p.tags.map(t=>`<a href="/blog/?tag=${encodeURIComponent(t)}">${e(t)}</a>`).join('')}</nav>`;
function postRow(p,prefix='',i=0){return `<article class="post-row" data-tags="${e(JSON.stringify(p.tags))}" data-search="${e([p.title,p.category,...p.tags,p.excerpt,...p.body.map(blockText)].join(' '))}" data-reveal><span class="post-number">${String(i+1).padStart(2,'0')}</span><div><p class="post-meta"><time datetime="${p.date}">${dateLabel(p.date)}</time></p><h3><a href="${prefix}blog/${e(p.slug)}/">${e(p.title)}</a></h3><p class="post-excerpt">${e(p.excerpt)}</p>${postTags(p)}</div><a class="circle-link" href="${prefix}blog/${e(p.slug)}/" aria-label="Read ${e(p.title)}">Read</a></article>`;}

// Reuse the original section markup while rendering its data at build time.
const portfolioSource=fs.readFileSync(path.join(root,'portfolio.html'),'utf8');
const originalSections=[...portfolioSource.matchAll(/<section\b[\s\S]*?<\/section>/g)].map(m=>m[0]);
function originalSection(marker){
 const section=originalSections.find(s=>s.slice(0,s.indexOf('>')).includes(marker));
 if(!section)throw new Error(`Missing portfolio section: ${marker}`);
 return section.replace(/\d{2} — /g,'').replaceAll("I've worked with",'i have worked with');
}
function logo(x,className){const name=e(x.logoText||x.shortName||x.name||x.organization);return x.logo?`<div class="${className}${x.logoTheme === 'dark' ? ' logo-dark' : ''}"><img src="${e(x.logo)}" alt="${name} logo" loading="lazy" referrerpolicy="no-referrer" data-logo><span class="logo-text-fallback" hidden>${name}</span></div>`:`<div class="${className} text-logo"><span>${name}</span></div>`;}
const managed=experience.websitesManaged.map(x=>`<article class="managed-card">${logo(x,'managed-logo')}<span class="platform">${e(x.platform)}</span><h3>${e(x.name)}</h3><p>${e(x.description)}</p>${x.url?`<a href="${e(x.url)}" target="_blank" rel="noopener noreferrer">Open site</a>`:`<span class="managed-status">${e(x.status||'Link unavailable')}</span>`}</article>`).join('');
const campaignCards=experience.publicCampaigns.map(x=>`<article class="campaign-card campaign-group-card"><div class="campaign-org">${logo(x,'campaign-logo')}<div><span class="campaign-platform">${e(x.platform)}</span><h3>${e(x.organization)}</h3></div></div><div class="campaign-list">${x.campaigns.map(c=>`<span>${e(c)}</span>`).join('')}</div><p>${e(x.scope)}</p></article>`).join('');
const creativeCards=experience.creativeExecution.map(x=>`<article class="creative-card"><div class="creative-card-top"><span class="creative-index">${e(x.index)}</span><span class="creative-type">Selected discipline</span></div><h3>${e(x.title)}</h3><p>${e(x.description)}</p><div class="creative-list">${x.items.map(item=>`<span>${e(item)}</span>`).join('')}</div></article>`).join('');
const campaigns=originalSection('id="campaigns"').replace('<div id="campaign-grid" class="campaign-grid"></div>',`<div id="campaign-grid" class="campaign-grid">${campaignCards}</div>`);
const social=originalSection('id="social"');
const creative=originalSection('id="creative"').replace('<div id="creative-grid" class="creative-work-grid"></div>',`<div id="creative-grid" class="creative-work-grid">${creativeCards}</div>`);
const collaborationCards = experience.collaborations.map(x=>`<article class="collaboration-card${x.events ? ' collaboration-events' : ''}"><div class="collaboration-logo${x.logoTheme === 'dark' ? ' collaboration-logo-dark' : ''}"><img src="${e(x.logo)}" alt="${e(x.name)} logo" loading="lazy" decoding="async"></div><h3>${e(x.name)}</h3>${x.events ? `<ul>${x.events.map(event=>`<li>${e(event)}</li>`).join('')}</ul>` : ''}</article>`).join('');
const collaborations=originalSection('collab-section').replace('<section ', '<section id="collaborations" ').replace('<div id="collab-cloud" class="collab-cloud reveal"></div>',`<div id="collab-cloud" class="collaboration-grid">${collaborationCards}</div>`);
const hero=`<section class="wrap intro-hero" aria-labelledby="intro-title"><div class="intro-accessible"><h1 id="intro-title">hey, i am Jae. Welcome to my little corner.</h1><p>A 45-second cartoon introduction to PSRMalam: InsourceAI, GoldenWax and Cream; marketing, campaigns, branding and websites; Pokémon ex cards, Transformers and Star Wars comics, TikTok pack openings and running; and a blog about work, building and learning.</p></div><div class="intro-player" data-intro-player><picture class="intro-cover" aria-hidden="true"><source media="(max-width:640px)" srcset="/assets/hero/psrmalam-poster-mobile.jpg"><img src="/assets/hero/psrmalam-poster.jpg" alt="" width="1920" height="1080" fetchpriority="high"></picture><video data-intro-video tabindex="0" role="button" data-wide-src="/assets/hero/psrmalam-intro.mp4" data-mobile-src="/assets/hero/psrmalam-intro-mobile.mp4" data-wide-poster="/assets/hero/psrmalam-poster.jpg" data-mobile-poster="/assets/hero/psrmalam-poster-mobile.jpg" poster="/assets/hero/psrmalam-poster.jpg" width="1920" height="1080" muted playsinline webkit-playsinline loop preload="metadata" aria-label="Jae introduces PSRMalam in a silent, captioned cartoon animation" aria-describedby="intro-title"></video><span class="intro-prompt" data-intro-prompt aria-hidden="true" hidden>Tap to play</span><noscript><style>[data-intro-video]{display:none!important}</style></noscript></div><p data-intro-note class="intro-note" role="status" hidden></p></section>`;
const latestPost = `<section class="wrap home-writing home-latest" aria-labelledby="latest-post-title">
 <div class="section-head"><h2 id="latest-post-title">Latest from the blog</h2><a class="text-link" href="/blog/">Read the blog</a></div>
 ${posts.length ? postRow(posts[0]) : ''}
</section>`;
write('index.html',page({file:'index.html',title:'Jae’s little corner',active:'home',body:hero + latestPost}));
const websites = `<section id="web" class="wrap section-space"><div class="section-head"><div><p class="eyebrow">Companies & client work</p><h2>Websites and <em>brands.</em></h2></div></div><div class="commercial-grid">${experience.websitesBuilt.map(x=>`<article class="commercial-card">${brandArt(x.brand)}<span class="channel">${e(x.type)}</span><h3>${e(x.name)}</h3><p>${e(x.description)}</p>${tags(x.tools)}</article>`).join('')}</div><div class="subheading-row managed-title"><h3>Websites managed</h3><span>CMS · content · maintenance</span></div><div class="managed-grid">${managed}</div></section>`;
const capabilities = `<div class="wrap"><section id="capabilities" class="section"><div class="section-head"><div><p class="eyebrow">What i bring</p><h2>Strategy through <em>execution.</em></h2></div></div>${originalSection('id="about"').match(/<div class="capabilities[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/)[0].replace(/<\/div>\s*<\/section>$/,'').replace(/ data-delay="80"/,'')}</section></div>`;
const socialResults = `<div class="wrap"><section class="works-results" aria-labelledby="works-results-title">
   <h2 id="works-results-title">Selected results</h2>
   <ul><li><strong>2,750%</strong> LinkedIn follower growth in four months</li><li><strong>100+</strong> social posts and campaign assets produced</li><li><strong>+20%</strong> social engagement for Singapore International Cyber Week</li></ul>
  </section></div>`;
const worksSections = [
 { slug: 'websites', label: 'Websites', body: websites },
 { slug: 'campaigns', label: 'Campaigns', body: campaigns },
 { slug: 'social', label: 'Social & growth', body: social + socialResults },
 { slug: 'creative', label: 'Creative work', body: creative + capabilities },
 { slug: 'collaborations', label: 'Collaborations', body: collaborations }
];
const worksNav = current => `<nav class="wrap section-menu hobby-tabs" aria-label="Works sections">
 ${worksSections.map(({slug, label}) => `<a href="${slug === 'websites' ? '/works/' : `/works/${slug}/`}"${current === slug ? ' aria-current="page"' : ''}>${e(label)}</a>`).join('')}
</nav>`;
for (const {slug, label, body} of worksSections) {
 const file = slug === 'websites' ? 'works/index.html' : `works/${slug}/index.html`;
 write(file,page({file,title:`${label} · Works`,active:'experience',prefix:slug === 'websites' ? '../' : '../../',body:`${worksNav(slug)}<div class="works-subpage"><div class="wrap works-subpage-title"><h1>${e(label)}</h1></div>${body}</div>`}));
}

write('projects.html',page({file:'projects.html',title:'Projects',active:'projects',body:`<div class="wrap"><header class="page-top"><p class="eyebrow">Projects</p><h1>Things i am<br><em>bringing to life.</em></h1><p class="intro">From procurement to car care to campus connections. Three projects, each with its own story.</p></header><div class="project-grid all-projects">${projects.map((p,i)=>projectCard(p,i)).join('')}</div></div>`}));
const featuredTikToks = [
 ['7705253024205212935', 'Pokémon pack opening', 'pack-opening'],
 ['7695353346290388225', 'Pokémon card finds', 'card-finds'],
 ['7626551795711593736', 'A night out in Singapore', 'night-out']
];
const tiktokCards = `<section class="tiktok-picks" aria-labelledby="tiktok-picks-title">
 <h3 id="tiktok-picks-title">Featured TikToks</h3>
 <ul class="hobby-stats-grid">${featuredTikToks.map(([id, title, image]) => `<li><a href="${e(new URL(site.tiktok).origin + new URL(site.tiktok).pathname + '/video/' + id)}" target="_blank" rel="noopener noreferrer">${fs.existsSync(path.join(root, 'assets', image + '.webp')) ? `<img src="/assets/${image}.webp" alt="" width="320" height="400" loading="lazy">` : ''}<strong>${e(title)}</strong><span>Play clip ↗</span></a></li>`).join('')}</ul>
</section>`;

const runningGroups = [
 ['2026 year to date', [['Distance','318 km'],['Runs','70'],['Time','35h 33m'],['Elevation gain','1,220 m']]],
 ['All time', [['Distance','447 km'],['Runs','114']]],
 ['Weekly averages', [['Distance','5 km'],['Runs','1'],['Time','35m 2s']]],
 ['Best efforts', [['400 m','0:59'],['½ mile','3:14'],['1 km','4:13'],['1 mile','7:55'],['2 miles','17:36'],['5 km','27:59'],['10 km','1:12:31'],['15 km','1:53:53'],['10 miles','2:04:17'],['20 km','2:46:12'],['Half marathon','2:54:48']]]
];
const [yearToDate, allTime, weekly, bestEfforts] = runningGroups;
const statRows = stats => stats.map(([label, value]) =>
 `<div><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`
).join('');
const tripPanel = ([title, stats]) => `<section class="run-trip"><h3>${e(title)}</h3><dl>${statRows(stats)}</dl></section>`;
const runningDashboard = `<section id="running" class="hobby-card run-dashboard" aria-labelledby="run-title">
 <header class="run-header">
  <p class="eyebrow run-eyebrow">Running / Instrument cluster</p>
  <div class="run-heading-copy"><h1 id="run-title">Out for a run.</h1><p class="run-source">Strava snapshot<br><time datetime="2026-11-07">7 November 2026</time></p></div>
  <div class="running-character" aria-hidden="true"><span class="runner-sprite"></span><span class="runner-trail"></span></div>
 </header>
 <div class="run-cluster">
  <div class="run-dial" data-run-meter>
   <div class="run-gauge">
    <svg viewBox="0 0 240 190" aria-hidden="true" focusable="false">
     <path d="M36.86 168A96 96 0 1 1 203.14 168" pathLength="100" class="run-dial-track"/>
     <path d="M36.86 168A96 96 0 1 1 203.14 168" pathLength="100" class="run-dial-ticks"/>
     <path d="M36.86 168A96 96 0 1 1 203.14 168" pathLength="100" class="run-dial-redline"/>
     <path d="M36.86 168A96 96 0 1 1 203.14 168" pathLength="100" class="run-dial-energy" stroke-dasharray="8 100" data-run-energy/>
     <g transform="rotate(-100.8 120 120)" data-run-needle><polygon points="120,14 114,44 126,44" fill="#ffae70"/></g>
     <g class="run-dial-labels"><text x="34" y="188">0</text><text x="206" y="188" text-anchor="end">MAX</text></g>
    </svg>
    <div class="run-odometer"><span>All-time distance</span><strong>${e(allTime[1][0][1])}</strong><span>${e(allTime[1][1][1])} runs logged</span></div>
   </div>
   <button type="button" class="run-pedal" data-run-pedal aria-label="Hold to rev the running dial" aria-pressed="false" hidden><span class="pedal-grip" aria-hidden="true"></span><span>Hold to rev</span></button>
  </div>
  ${tripPanel(yearToDate)}
  ${tripPanel(weekly)}
 </div>
 <section class="run-timing">
  <div class="run-timing-head"><p class="eyebrow">Timing board</p><h3>Best efforts</h3></div>
  <dl>${statRows(bestEfforts[1])}</dl>
 </section>
</section>`;

const hobbyTabs = current => `<nav class="wrap section-menu hobby-tabs" aria-label="Hobby sections">
 ${[['pokemon','/hobby/','Pokémon TCG'],['comics','/hobby/comics/','Comics'],['books','/hobby/books/','Books'],['games','/hobby/games/','Games'],['running','/hobby/running/','Running'],['travelling','/hobby/travelling/','Travelling'],['ancestry','/hobby/ancestry/','Ancestry']].map(([key, href, label]) =>
  `<a href="${href}"${key === current ? ' aria-current="page"' : ''}>${label}</a>`
 ).join('')}
</nav>`;

write('hobby/index.html',page({file:'hobby/index.html',prefix:'../',title:'Pokémon TCG',active:'hobby',collectionAssets:true,body:`${hobbyTabs('pokemon')}<div class="wrap"><header class="page-top"><p class="eyebrow">Hobby / Off the clock</p><h1>Pokémon <em>TCG.</em></h1></header><section id="pokemon" class="hobby-feature pokemon-stream"><aside class="tiktok-profile tiktok-profile-peek">${mascotPeek}<span class="eyebrow">From my TikTok</span><h3>${e(new URL(site.tiktok).pathname.slice(1))}</h3><p>Pack openings, card show finds and the occasional detour.</p><a class="button primary" href="${e(site.tiktok)}" target="_blank" rel="noopener noreferrer">Visit my TikTok ↗</a></aside>${tiktokCards}</section>${renderCollectionTeaser(collection)}<a class="archive-link" href="/blog/"><span class="eyebrow">More from my corner</span><strong>Read the blog.</strong></a></div>`}));
write('hobby/games/index.html',page({file:'hobby/games/index.html',prefix:'../../',title:'Games',description:'Step into Jae’s arcade. Choose MouseHunt, Mobile Legends or Pokémon GO to explore my stats and collections.',active:'hobby',gamesAssets:true,body:hobbyTabs('games')+renderArcade()}));
for (const [slug,title] of [['mousehunt','MouseHunt'],['mobile-legends','Mobile Legends'],['pokemon-go','Pokémon GO']]) {
 const file=`hobby/games/${slug}/index.html`;
 write(file,page({file,prefix:'../../../',title,description:`My ${title} stats, highlights and collection.`,active:'hobby',gamesAssets:true,body:hobbyTabs('games')+renderGames(games,slug)}));
}
write('hobby/running/index.html',page({file:'hobby/running/index.html',prefix:'../../',title:'Running',active:'hobby',body:`${hobbyTabs('running')}<div class="wrap hobby-grid">${runningDashboard}</div>`}));
write('hobby/books/index.html',page({file:'hobby/books/index.html',prefix:'../../',title:'Books',description:`The books i read in ${books.year}, and the thoughts they leave behind.`,active:'hobby',booksAssets:true,body:hobbyTabs('books')+renderBooks(books)}));
write('hobby/comics/inventory.csv',renderComicInventory(comics),false);
write('hobby/comics/index.html',page({file:'hobby/comics/index.html',prefix:'../../',title:'My comic collection',description:comics.description,active:'hobby',comicsAssets:true,comicsScript:true,body:`${hobbyTabs('comics')}${renderComics(comics)}`}));
write('hobby/ex-collection/hunt-list.csv',renderHuntList(collection),false);
write('hobby/ex-collection/index.html',page({file:'hobby/ex-collection/index.html',prefix:'../../',title:collection.title,description:collection.description,active:'hobby',collectionAssets:true,collectionScript:true,body:`${hobbyTabs('pokemon')}${renderCollection(collection)}`}));
write('hobby/ancestry/index.html',page({file:'hobby/ancestry/index.html',prefix:'../../',title:'Ancestry',description:'A private family archive of photographs, memories and generations.',active:'hobby',ancestryAssets:true,body:hobbyTabs('ancestry')+renderAncestry()}),false);
write('assets/travel/albums.json',JSON.stringify(travel),false);
write('hobby/travelling/index.html',page({file:'hobby/travelling/index.html',prefix:'../../',title:'Travelling',description:'Spin the globe and explore the places Jae has visited, with a photo album for every destination.',active:'hobby',travelAssets:true,body:hobbyTabs('travelling')+renderTravel(travel)}));
for(const destination of travel){
 const file=`hobby/travelling/${destination.slug}/index.html`;
 write(file,page({file,prefix:'../../../',title:`${destination.name} · Travelling`,description:`Jae’s travel photo album from ${destination.name}.`,active:'hobby',travelAssets:true,body:hobbyTabs('travelling')+renderTravelAlbum(destination)}));
}
for(const p of projects){
 const file=`projects/${p.slug}/index.html`;
 const next=projects[(projects.indexOf(p)+1)%projects.length];
 write(file,page({file,prefix:'../../',title:p.name,description:p.description,active:'projects',body:renderProject(p,next,{e,tags,brandArt})}));
}
const featured=posts[0];
write('guestbook/index.html',page({file:'guestbook/index.html',prefix:'../',title:'Guest book',active:'guestbook',guestbookAssets:true,description:'Leave your name and a little hello in Jae’s guest book.',body:renderGuestbook()}));

write('blog/index.html',page({file:'blog/index.html',prefix:'../',title:'Blog',active:'blog',body:`<div class="wrap"><header class="page-top blog-intro"><div><p class="eyebrow">Blog</p><h1>Notes on work,<br><em>building and learning.</em></h1><p class="intro">Thoughts on AI, religion, hobbies, work and the things i learn along the way.</p></div><a class="text-link" href="../feed.xml">Follow via RSS</a></header><div class="blog-search" hidden><label for="post-search">Find a post</label><div class="search-input-row"><input id="post-search" type="search" placeholder="Search posts and topics" autocomplete="off"><button id="clear-search" type="button" hidden>Clear</button></div><nav class="topic-filters" aria-label="Filter posts by topic"><button type="button" data-topic="" aria-pressed="true">All posts</button>${[...new Set([...blogTopics,...posts.flatMap(p=>p.tags)])].map(t=>`<button type="button" data-topic="${e(t)}" aria-pressed="false">${e(t)}</button>`).join('')}</nav><p class="search-status" role="status" aria-live="polite"></p></div><div class="blog-list">${posts.map((p,i)=>postRow(p,'../',i)).join('')||'<p class="empty-state">New posts will appear here.</p>'}</div></div>`}));
for(const p of posts){
 const file=`blog/${p.slug}/index.html`;
 const content=p.body.map(renderBlock).join('');
 const count=p.body.map(blockText).join(' ').trim().split(/\s+/).filter(Boolean).length;
 write(file,page({file,prefix:'../../',title:p.title,description:p.excerpt,active:'blog',blogMedia:true,schema:{'@context':'https://schema.org','@type':'BlogPosting',headline:p.title,datePublished:p.date,description:p.excerpt,author:{'@type':'Person',name:site.author,url:base+'/about/'},mainEntityOfPage:base+'/blog/'+p.slug+'/'},body:`<article class="article wrap"><a class="back-link" href="../">← Back to the notebook</a><header class="article-header"><p class="eyebrow">${e(p.category)}</p><h1>${e(p.title)}</h1><div class="article-meta"><img src="../../assets/IMG_1170_VSCO.jpeg" width="40" height="40" alt=""><span>By ${e(site.author)}</span><time datetime="${p.date}">${dateLabel(p.date)}</time><span>${Math.max(1,Math.ceil(count/200))} min read</span></div>${postTags(p)}</header><div class="prose">${content}</div><div class="article-end"><span aria-hidden="true">✳</span><a class="text-link" href="mailto:${e(site.email)}?subject=${encodeURIComponent(p.title)}">Keep the conversation going ${arrow}</a></div></article>`}));
}
const educationCards = entries => entries.map(({school, credential, dates, focus}) =>
 `<article><p class="eyebrow">${e(school)}</p><h3>${e(credential)}</h3><p class="education-dates">${e(dates)}</p>${focus ? `<p>${e(focus)}</p>` : ''}</article>`
).join('');
write('about.html',page({file:'about.html',title:'About me',active:'about',body:`<div class="wrap"><header class="page-top"><p class="eyebrow">About me</p><h1>Jeremiah Leow.<br>Or just <em>Jae.</em></h1></header><div class="about-layout"><figure class="about-portrait about-cartoon">${mascotStage}<figcaption><strong>Jeremiah Leow</strong><span>SINGAPORE / MARKETER & FOUNDER</span></figcaption></figure><div class="about-copy"><p class="about-lead">A builder, a marketer<br>and a <em>curious person.</em></p><div class="prose"><p>i am Jae, based in Singapore. i spend my time building projects, collecting Pokémon cards and comic books, and getting out for a run.</p><p>My experience spans public-sector campaigns, B2B technology, social media, websites and brand development. i work across the planning and the execution: shaping the story, building the experience and getting it out into the world.</p><p>These days, i am building InsourceAI, an AI procurement assistant for electronics buyers and suppliers. This site brings together that work, earlier projects and the ideas i am figuring out along the way.</p></div><div class="link-group"><a class="button button-dark" href="assets/Jeremiah%20Leow%20Resume.pdf" download="Jeremiah Leow Resume.pdf">Download my CV ↓</a><a class="text-link" href="${e(site.linkedin)}" target="_blank" rel="noopener noreferrer">Find me on LinkedIn ${arrow}</a></div></div></div><section class="education-section about-subsections" aria-label="Education and training"><details id="education"><summary>Education</summary><div class="education-grid">${educationCards(experience.education)}</div></details><details id="professional-development"><summary>Professional development</summary><div class="education-grid">${educationCards(experience.professionalDevelopment)}</div></details><details id="certifications"><summary>Certifications &amp; training</summary>${originalSection('cert-section').match(/<div class="tool-marquee[\s\S]*?<\/div>/)[0]}</details></section></div>${originalSection('id="resume"')}`}));
let legacy=fs.readFileSync(path.join(root,'portfolio.html'),'utf8').replace('content="#f3f0e8"','content="#242424"');
legacy=legacy.replace('</head>',`<link rel="stylesheet" href="assets/dark-theme.css?v=14"><link rel="canonical" href="${e(base)}/portfolio.html"><style>.legacy-return{padding:18px;background:#f3f0e8;border-bottom:1px solid #cfc9bd;text-align:center;font-size:13px}.legacy-return a{text-decoration:underline;text-underline-offset:4px}.reveal{opacity:1!important;transform:none!important}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{animation:none!important;transition:none!important}}</style></head>`).replace('<body>','<body><div class="legacy-return"><a href="index.html">← Back to psrmalam</a> · Jeremiah Leow’s marketing portfolio</div><noscript><p class="legacy-return">For the complete project listings, visit <a href="projects.html">Projects</a> or <a href="assets/Jeremiah%20Leow%20Resume.pdf">download the CV</a>.</p></noscript>');
write('portfolio.html',clean(legacy));
write('404.html',page({file:'404.html',title:'Page not found',prefix:base+'/',body:`<div class="wrap page-top"><p class="eyebrow">404 / A wrong turn</p><h1>A little<br><em>off track.</em></h1><p class="intro">This page may have moved. There is plenty to explore back home.</p><a class="button button-dark" href="${e(base)}/">Back to psrmalam ${arrow}</a></div>`}),false);
function redirect(file,target){
 const dest=JSON.stringify(target);
 fs.mkdirSync(path.dirname(path.join(out,file)),{recursive:true});
 fs.writeFileSync(path.join(out,file),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><link rel="canonical" href="${base}${target}"><meta http-equiv="refresh" content="0;url=${target}"><title>Page moved</title><script>location.replace(${dest}+location.search+(${dest}.includes('#')?'':location.hash));</script></head><body><p>This page has moved. <a href="${target}">Continue</a>.</p></body></html>`);
}
for(const [old,target] of Object.entries(routes))if(old!=='/index.html')redirect(old.slice(1),target);
redirect('works/websites/index.html','/works/');
redirect('projects/campaigns/index.html','/works/campaigns/');
write('feed.xml',`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>psrmalam — Jeremiah Leow</title><link>${e(base)}/blog/</link><description>${e(site.description)}</description><language>en-sg</language><atom:link href="${e(base)}/feed.xml" rel="self" type="application/rss+xml"/>${posts.map(p=>`<item><title>${e(p.title)}</title><link>${e(base)}/blog/${p.slug}/</link><guid isPermaLink="true">${e(base)}/blog/${p.slug}/</guid><pubDate>${new Date(p.date+'T00:00:00+08:00').toUTCString()}</pubDate><description>${e(p.excerpt)}</description>${p.tags.map(t=>`<category>${e(t)}</category>`).join('')}</item>`).join('')}</channel></rss>`,false);
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${e(base)}/${e(u)}</loc></url>`).join('')}</urlset>`,false);
write('robots.txt',`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`,false);
console.log(`Built ${urls.length} pages, ${posts.length} published posts and ${projects.length} projects in dist/`);

