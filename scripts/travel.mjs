import fs from 'node:fs';
import path from 'node:path';

const rocketArt = fs.readFileSync(new URL('../assets/hobby-characters/rocket-jae.svg', import.meta.url), 'utf8').replace('<svg ', '<svg class="travel-rocket" width="310" height="170" role="img" aria-label="Jae flying in a horizontal rocket ship" focusable="false" ');

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const images = /\.(?:jpe?g|png|webp|avif|gif)$/i;
export const albumURL = destination => `/hobby/travelling/${destination.slug}/`;

export function loadTravel(root) {
  const {destinations} = JSON.parse(fs.readFileSync(path.join(root, 'content/travel.json'), 'utf8'));
  if (!Array.isArray(destinations)) throw new Error('Missing travel destinations');
  const ids = new Set(), slugs = new Set();
  return destinations.map(destination => {
    const {id, slug, name, center} = destination;
    if (!/^\d{3}$/.test(id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !name || ids.has(id) || slugs.has(slug)) throw new Error('Invalid or duplicate travel destination');
    if (!Array.isArray(center) || center.length !== 2 || !center.every(Number.isFinite) || Math.abs(center[0]) > 180 || Math.abs(center[1]) > 90) throw new Error(`Invalid coordinates: ${slug}`);
    ids.add(id); slugs.add(slug);
    const folder = path.join(root, 'assets/travel', slug);
    const metadataFile = path.join(folder, 'album.json');
    const metadata = fs.existsSync(metadataFile) ? JSON.parse(fs.readFileSync(metadataFile, 'utf8')) : {};
    const entries = fs.existsSync(folder) ? fs.readdirSync(folder, {withFileTypes:true}) : [];
    if (entries.some(entry => entry.isSymbolicLink())) throw new Error(`Photo symlinks are not supported: ${slug}`);
    if (entries.some(entry => /\.hei[cf]$/i.test(entry.name))) throw new Error(`Convert HEIC/HEIF photos in ${slug} to JPG before publishing`);
    const photos = entries.filter(entry => entry.isFile() && images.test(entry.name)).sort((a,b)=>a.name.localeCompare(b.name, 'en', {numeric:true})).map(({name:filename}, i) => {
      const info = metadata[filename] || {};
      if ((info.alt !== undefined && typeof info.alt !== 'string') || (info.caption !== undefined && typeof info.caption !== 'string')) throw new Error(`Invalid photo caption: ${filename}`);
      return {src:`/assets/travel/${slug}/${encodeURIComponent(filename)}`, alt:info.alt || `${name} — photo ${i+1} by Jae`, caption:info.caption || ''};
    });
    for (const filename of Object.keys(metadata)) if (!entries.some(entry=>entry.isFile() && entry.name === filename && images.test(filename))) throw new Error(`Caption refers to a missing image: ${slug}/${filename}`);
    return {...destination, photos, url:albumURL(destination)};
  });
}

export function renderTravel(destinations) {
  const home = destinations.find(d=>d.home) || destinations[0];
  return `<div class="wrap travel-page">
    <header class="travel-heading"><div><p class="eyebrow">Hobby / Travelling</p><h1>A world of <em>memories.</em></h1><p>Places i have been. Little moments i brought home.</p></div><div class="travel-heading-side"><div class="travel-count"><strong>${destinations.length}</strong><span>places visited</span></div>${rocketArt}</div></header>
    <section class="travel-explorer" aria-label="Explore my travels">
      <div class="globe-area">
        <div class="globe-topline"><span>JAE’S TRAVEL ATLAS</span><span class="globe-live">● &nbsp; Based in Singapore</span></div>
        <div class="globe-stage" data-globe-stage>
          <img class="globe-poster" src="/assets/travel/globe-preview.webp" alt="A dotted globe with visited places in blue and unvisited places in red" width="900" height="900">
          <canvas data-travel-globe hidden tabindex="0" role="img" aria-label="Interactive globe. Drag to rotate, use arrow keys to turn, plus or minus to zoom, and Enter to select the country at the centre. All destinations are also in the country selector." aria-describedby="globe-help"></canvas>
          <span class="globe-tooltip" data-globe-tooltip hidden></span>
        </div>
        <div class="globe-controls" data-globe-controls hidden><button type="button" data-globe-spin aria-pressed="true">Pause spin</button><div><button type="button" data-globe-zoom="out" aria-label="Zoom out">−</button><button type="button" data-globe-home>Home</button><button type="button" data-globe-zoom="in" aria-label="Zoom in">+</button></div></div>
        <p id="globe-help" class="globe-help">Drag to spin · tap a country to explore</p>
        <p class="globe-error" data-globe-error hidden>The interactive globe could not load. You can still open every album below.</p>
        <div class="globe-legend"><span><i class="visited-dot"></i>Visited</span><span><i class="unvisited-dot"></i>Not yet visited</span><span><i class="home-dot"></i>Home</span></div>
      </div>
      <aside class="travel-inspector" aria-label="Selected destination">
        <div class="country-picker" data-country-picker hidden><label for="travel-country">Find a country or region</label><select id="travel-country"></select></div>
        <div class="country-summary" aria-live="polite" aria-atomic="true"><span class="travel-stamp" data-country-status>HOME / VISITED</span><h2 data-country-name>${escape(home.name)}</h2><p data-country-copy>Where every adventure begins.</p><p class="travel-photo-count" data-country-count>${home.photos.length} photos</p></div>
        <div class="album-preview" data-album-preview>${home.photos.length ? `<img src="${escape(home.photos[0].src)}" alt="${escape(home.photos[0].alt)}">` : '<span class="album-outline" aria-hidden="true">＋</span><p>Memories made.<br>Photos to come.</p>'}</div>
        <a class="travel-primary" data-country-album href="${albumURL(home)}">Open album <span aria-hidden="true">↗</span></a>
      </aside>
    </section>
    <section class="travel-places" aria-labelledby="travel-places-title"><div class="travel-section-heading"><h2 id="travel-places-title">The places so far.</h2><span>One album for every stop</span></div><div class="travel-place-grid">${destinations.map(d=>`<a class="travel-place" href="${albumURL(d)}" data-destination="${d.id}"><span class="travel-place-name"><i class="visited-dot"></i>${escape(d.name)}${d.home?'<small>HOME</small>':''}</span><span>${d.photos.length ? `${d.photos.length} photo${d.photos.length===1?'':'s'}` : 'Album coming soon'} <b aria-hidden="true">↗</b></span></a>`).join('')}</div></section>
    <p class="travel-attribution">Map: <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth</a>. Countries and regions are shown as travel destinations.</p>
    <noscript><p>The albums work without JavaScript. Enable JavaScript to spin the globe.</p></noscript>
  </div>`;
}

export function renderTravelAlbum(destination) {
  const {name, slug, home, photos} = destination;
  return `<article class="wrap travel-page travel-album"><a class="back-link" href="/hobby/travelling/?country=${destination.id}">Back to the globe</a>
    <header class="travel-heading"><div><p class="eyebrow">Travelling / ${home?'Home':'Visited'}</p><h1>${escape(name)}<em>.</em></h1><p>${home?'The place i call home.':'A few moments from my time here.'}</p></div><div class="travel-count"><strong>${photos.length}</strong><span>photo${photos.length===1?'':'s'}</span></div></header>
    ${photos.length ? `<div class="travel-photo-grid">${photos.map((photo,i)=>`<figure><a href="${escape(photo.src)}" data-travel-photo="${i}" aria-label="Open photo ${i+1}: ${escape(photo.alt)}"><img src="${escape(photo.src)}" alt="${escape(photo.alt)}" loading="${i<3?'eager':'lazy'}" decoding="async"></a>${photo.caption?`<figcaption>${escape(photo.caption)}</figcaption>`:''}</figure>`).join('')}</div><dialog class="travel-lightbox" aria-label="Travel photo viewer"><button type="button" data-photo-close aria-label="Close photo">×</button><button type="button" data-photo-prev aria-label="Previous photo">‹</button><figure><img alt=""><figcaption></figcaption><p data-photo-position aria-live="polite"></p></figure><button type="button" data-photo-next aria-label="Next photo">›</button></dialog>` : `<div class="travel-album-empty"><span class="album-outline" aria-hidden="true">＋</span><h2>Been here. Loved it.</h2><p>The photos have not made it here yet. Check back for little moments from ${escape(name)}.</p><a class="text-link" href="/hobby/travelling/">Explore the other places</a></div>`}
    <details class="travel-owner"><summary>Manage this album</summary><p>For Jae: add JPG, PNG, WebP, AVIF or GIF photos to this destination’s folder. Sign in to GitHub, upload the files and commit to <strong>main</strong>. They will appear here after the site finishes publishing.</p><a class="text-link" href="https://github.com/jaetxylor/Jeremiah-Taylor-marketing-portfolio/upload/main/assets/travel/${slug}" target="_blank" rel="noopener noreferrer">Upload photos to ${escape(name)}</a><p>Visitors can view the album; only authorised repository editors can publish photos. Convert iPhone HEIC photos to JPG first.</p></details>
  </article>`;
}
