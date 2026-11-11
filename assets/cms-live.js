// Published content from Jae's editing desk. Travel waits for its current albums.
window.psrContentReady = (async () => {
  const service = 'https://psrmalam-guestbook.jaetxylor.chatgpt.site';
  const path = location.pathname.replace(/index\.html$/, '').replace(/\/?$/, '/');
  const query = new URLSearchParams(location.search);
  const views = {'/':'home','/hobby/':'hobby','/hobby/ex-collection/':'pokemon','/hobby/comics/':'comics','/hobby/books/':'books','/hobby/travelling/':'travel','/blog/':'blog','/hobby/games/mousehunt/':'mousehunt','/hobby/games/mobile-legends/':'mobile-legends','/hobby/games/pokemon-go/':'pokemon-go'};
  let view = views[path], slug;
  if (!view && path.startsWith('/blog/')) {view='post';slug=path==='/blog/read/'?query.get('post'):path.split('/')[2];}
  if (!view && path.startsWith('/hobby/travelling/')) {view='album';slug=path==='/hobby/travelling/album/'?query.get('country'):path.split('/')[3];}
  if (!view) return;
  const travelPage = view==='travel'||view==='album';
  const target = document.querySelector(view==='home'?'.home-latest':view==='hobby'?'.ex-teaser':'#main');
  if(travelPage&&target){
    target.setAttribute('aria-busy','true');
    // Also cover cached pages generated before the loading shell was added.
    if(!target.querySelector('[data-cms-loading]'))target.innerHTML='<section class="wrap travel-page travel-loading-shell"><div class="travel-loading-state" data-cms-loading role="status" aria-live="polite">Loading the latest travels…</div></section>';
  }
  const controller = new AbortController(), timer = setTimeout(()=>controller.abort(), 7000);
  try {
    const url = new URL(service+'/api/site/page');url.searchParams.set('view',view);if(slug)url.searchParams.set('slug',slug);
    const response = await fetch(url,{signal:controller.signal,credentials:'omit',cache:'no-store'});
    if(!response.ok)throw Error('Published content is unavailable.');
    const data = await response.json();
    if(!data||typeof data.html!=='string'||!data.html.trim())throw Error('Invalid content response.');
    if(view==='travel'){
      const text=value=>typeof value==='string'&&value.trim().length>0;
      if(!Array.isArray(data.albums)||!data.albums.length||!data.albums.every(album=>album&&text(album.id)&&text(album.name)&&text(album.url)&&Array.isArray(album.center)&&album.center.length===2&&album.center.every(Number.isFinite)&&Array.isArray(album.photos)&&album.photos.every(photo=>photo&&text(photo.src)&&text(photo.alt))))throw Error('Invalid travel response.');
    }
    // Retire the old photo action in posts served by the editing desk too.
    if(view==='post') data.html=data.html.replace(/<figure\b([^>]*class="[^"]*\bpost-photo\b[^"]*"[^>]*)>([\s\S]*?)<\/figure>/g, (_,attrs,body)=>
      `<figure${attrs}>${body.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/g,(_,content)=>content.includes('<img')?content:'')}</figure>`);
    if(data.albums)window.psrTravelAlbums=data.albums;
    if(!target)return;
    if(view==='home'||view==='hobby')target.outerHTML=data.html;else target.innerHTML=data.html;
    if(data.title)document.title=data.title+' · psrmalam';
    if(data.notFound)document.querySelector('meta[name=robots]')?.setAttribute('content','noindex');
  } catch {
    const status=document.querySelector('[data-cms-loading]');
    if(status){
      status.textContent=travelPage?'The latest '+(view==='album'?'album':'travels')+' could not load. Please try again.':'This page could not load. Please refresh to try again.';
      status.setAttribute('role','alert');
      if(travelPage){
        status.setAttribute('data-cms-error','');
        const retry=document.createElement('button');retry.type='button';retry.className='travel-retry';retry.textContent='Try again';
        // A fresh document preserves the globe and photo viewer's one-time setup.
        retry.addEventListener('click',()=>location.reload());status.append(retry);
      }
    }
  } finally { clearTimeout(timer);if(travelPage&&target)target.removeAttribute('aria-busy'); }
})();
