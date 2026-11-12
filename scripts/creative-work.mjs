import fs from 'node:fs';
import path from 'node:path';

export function renderStaticWorks(groups, { root, e }) {
  for (const group of groups) {
    for (const item of group.items) {
      if (!/^\/assets\/works\/static\/[a-z0-9-]+\.jpeg$/.test(item.src) || !fs.existsSync(path.join(root, item.src.slice(1)))) {
        throw new Error(`Missing static artwork: ${item.src}`);
      }
    }
  }

  return `<div class="wrap static-work-page">
    <header class="static-work-heading section-head">
      <a class="back-link" href="/works/creative/">Back to Creative work</a>
      <p class="eyebrow">Creative work / Selected pieces</p>
      <h1>Static works</h1>
      <p class="intro">Illustrations and campaign posters, from community stories to event lineups. Select any piece to take a closer look.</p>
    </header>
    ${groups.map(group => `<section class="static-work-group" aria-labelledby="static-${e(group.id)}">
      <p class="eyebrow">${e(group.format)}</p>
      <h2 id="static-${e(group.id)}">${e(group.title)}</h2>
      <p>${e(group.description)}</p>
      <div class="static-work-grid${group.id === 'necdc' ? ' static-work-carousel' : ''}${group.layout === 'posters' ? ' static-work-grid-posters' : ''}">
        ${group.items.map((item, index) => `<figure class="static-work-item">
          <a class="static-work-open" href="${e(item.src)}" data-static-work data-gallery="${e(group.id)}" data-title="${e(item.title)}" aria-label="View ${e(item.title)}">
            <img src="${e(item.src)}" alt="${e(item.alt)}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async">
          </a>
          <figcaption><span class="static-work-number">${String(index + 1).padStart(2, '0')}</span><span class="static-work-title">${e(item.title)}</span></figcaption>
        </figure>`).join('')}
      </div>
      ${group.id === 'necdc' ? '<div class="static-carousel-controls"><button type="button" data-carousel-prev aria-label="Previous comic panel">← Previous</button><span data-carousel-count aria-live="polite">1 / 5</span><button type="button" data-carousel-next aria-label="Next comic panel">Next →</button></div>' : ''}
    </section>`).join('')}
  </div>
  <dialog class="static-work-viewer" aria-labelledby="static-work-viewer-title" data-static-viewer>
    <div class="static-work-viewer-toolbar"><h2 id="static-work-viewer-title"></h2><button type="button" data-static-close aria-label="Close image viewer">Close</button></div>
    <div class="static-work-viewer-image"><img data-static-image alt=""></div>
    <div class="static-work-viewer-footer"><button type="button" data-static-prev>Previous</button><p data-static-counter aria-live="polite"></p><button type="button" data-static-next>Next</button></div>
    <a data-static-original target="_blank" rel="noopener noreferrer">Open original image</a>
  </dialog>`;
}
