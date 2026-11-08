// Published content from Jae's editing desk. The generated site remains a fallback.
window.psrContentReady = (async () => {
  const service = 'https://psrmalam-guestbook.jaetxylor.chatgpt.site';
  const path = location.pathname.replace(/index\.html$/, '').replace(/\/?$/, '/');
  const query = new URLSearchParams(location.search);
  const views = {'/':'home','/hobby/':'hobby','/hobby/ex-collection/':'pokemon','/hobby/comics/':'comics','/hobby/books/':'books','/hobby/travelling/':'travel','/blog/':'blog','/hobby/games/mousehunt/':'mousehunt','/hobby/games/mobile-legends/':'mobile-legends','/hobby/games/pokemon-go/':'pokemon-go'};
  let view = views[path], slug;
  if (!view && path.startsWith('/blog/')) {view='post';slug=path==='/blog/read/'?query.get('post'):path.split('/')[2];}
  if (!view && path.startsWith('/hobby/travelling/')) {view='album';slug=path==='/hobby/travelling/album/'?query.get('country'):path.split('/')[3];}
  if (!view) return;
  const controller = new AbortController(), timer = setTimeout(()=>controller.abort(), 7000);
  try {
    const url = new URL(service+'/api/site/page');url.searchParams.set('view',view);if(slug)url.searchParams.set('slug',slug);
    const response = await fetch(url,{signal:controller.signal,credentials:'omit',cache:'no-store'});
    if(!response.ok)throw Error('Published content is unavailable.');
    const data = await response.json();
    if(typeof data.html!=='string')throw Error('Invalid content response.');
    if(data.albums)window.psrTravelAlbums=data.albums;
    const target = document.querySelector(view==='home'?'.home-latest':view==='hobby'?'.ex-teaser':'#main');
    if(!target)return;
    if(view==='home'||view==='hobby')target.outerHTML=data.html;else target.innerHTML=data.html;
    if(data.title)document.title=data.title+' · psrmalam';
    if(data.notFound)document.querySelector('meta[name=robots]')?.setAttribute('content','noindex');
  } catch {
    const status=document.querySelector('[data-cms-loading]');
    if(status){status.textContent='This page could not load. Please refresh to try again.';status.setAttribute('role','alert');}
  } finally { clearTimeout(timer); }
})();
