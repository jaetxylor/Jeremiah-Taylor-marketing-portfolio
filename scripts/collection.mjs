const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const labels = { collected: 'Collected', hunting: 'Still hunting', unknown: 'Awaiting update' };

function link(value) {
  if (!value) return '';
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error('Collection links must use HTTPS');
  return url.href;
}

function summary(data) {
  if (!Array.isArray(data.sets)) throw new Error('The EX collection needs a sets array');
  const ids = new Set();
  const cards = data.sets.flatMap(set => {
    if (!set.id || !set.name || !Array.isArray(set.cards)) throw new Error('Invalid EX collection set');
    return set.cards.map(card => {
      if (!card.id || !card.name || !Object.hasOwn(labels, card.status)) throw new Error('Invalid EX collection card');
      if (ids.has(card.id)) throw new Error(`Duplicate EX collection card: ${card.id}`);
      ids.add(card.id);
      return { ...card, set };
    });
  });
  const count = status => cards.filter(card => card.status === status).length;
  return { cards, collected: count('collected'), hunting: count('hunting'), unknown: count('unknown'), recorded: count('collected') + count('hunting'), total: cards.length };
}

function status(card) {
  return `<span class="ex-status ex-status-${card.status}"><span aria-hidden="true"></span>${labels[card.status]}</span>`;
}

function image(card, extra = '') {
  const url = link(card.imageUrl);
  return `<span class="ex-artwork" data-ex-artwork>${url ? `<img class="ex-card-image" src="${escape(url)}" alt="${escape(card.name)}${card.variant ? ` (${escape(card.variant)})` : ''}" width="245" height="343" loading="lazy" decoding="async" referrerpolicy="no-referrer" ${extra}>` : ''}<span class="ex-art-fallback" data-ex-image-fallback${url ? ' hidden' : ''}><span>Artwork unavailable</span><small>${escape(card.name)}</small></span></span>`;
}

function renderCard(card, set) {
  const reference = link(card.sourceUrl || set.sourceUrl);
  const large = link(card.imageLargeUrl || card.imageUrl) || reference;
  const number = card.number === null || card.number === undefined ? '' : `#${card.number}`;
  return `<li class="ex-card" data-ex-card data-card-id="${escape(card.id)}" data-status="${card.status}" data-set="${escape(set.id)}" data-set-name="${escape(set.name)}" data-name="${escape(card.name)}" data-number="${escape(number)}" data-variant="${escape(card.variant || '')}" data-search="${escape([card.name, card.variant, set.name, card.number, number].filter(Boolean).join(' '))}" data-source="${escape(reference)}">
    <a class="ex-card-link" href="${escape(large)}" target="_blank" rel="noopener noreferrer" data-ex-open data-image="${escape(large)}" aria-label="View ${escape(card.name)}, ${escape(set.name)} ${escape(number)}. ${labels[card.status]}.">${image(card)}</a>
    <div class="ex-card-caption"><p class="ex-card-number">${escape(number || 'Card number to confirm')}</p><h3>${escape(card.name)}</h3>${card.variant ? `<p class="ex-card-variant">${escape(card.variant)}</p>` : ''}${status(card)}</div>
  </li>`;
}

function renderSet(set) {
  const owned = set.cards.filter(card => card.status === 'collected').length;
  const hunting = set.cards.filter(card => card.status === 'hunting').length;
  const unknown = set.cards.filter(card => card.status === 'unknown').length;
  const total = set.cards.length;
  const progress = total ? owned / total * 100 : 0;
  const partial = unknown > 0 || set.completeScreenshot === false;
  const countLabel = `${owned} collected, ${hunting} still hunting${unknown ? `, ${unknown} awaiting update` : ''}`;
  const url = link(set.sourceUrl);
  return `<section class="ex-set" id="ex-set-${escape(set.id)}" data-ex-set="${escape(set.id)}" aria-labelledby="ex-title-${escape(set.id)}">
    <header class="ex-set-header"><div class="ex-set-identity">${set.logoUrl ? `<img class="ex-set-logo" src="${escape(link(set.logoUrl))}" alt="" width="140" height="75" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-ex-logo>` : ''}<div><p class="ex-eyebrow">${set.year ? escape(set.year) + ' / ' : ''}Pokémon ex</p><h2 id="ex-title-${escape(set.id)}">${escape(set.name)}</h2>${url ? `<a class="ex-source-link" href="${escape(url)}" target="_blank" rel="noopener noreferrer">Set checklist</a>` : ''}</div></div>
    <div class="ex-set-summary"><p><strong>${owned}</strong><span> / ${total} collected</span></p><div class="ex-progress" role="progressbar" aria-label="${escape(set.name)} collection" aria-valuemin="0" aria-valuemax="${total || 1}" aria-valuenow="${owned}" aria-valuetext="${escape(countLabel)}"><span style="width:${progress.toFixed(2)}%"></span></div><small>${unknown ? `${unknown} awaiting an update` : partial ? 'More cards to confirm' : owned === total && total ? 'All ex cards collected' : `${hunting} still to find`}</small></div></header>
    <ul class="ex-card-grid" aria-label="${escape(set.name)} cards">${set.cards.map(card => renderCard(card, set)).join('')}</ul>
  </section>`;
}

function formatDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return '';
  const date = new Date(`${value}T00:00:00+08:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Singapore' });
}

export function renderCollection(data) {
  const stats = summary(data);
  const date = formatDate(data.updatedAt);
  const batches = Number.isInteger(data.batchesReceived) && Number.isInteger(data.batchesExpected) && data.batchesExpected > 0 ? `Batch ${data.batchesReceived} of ${data.batchesExpected} added` : '';
  const filters = [['all', 'All cards', stats.total], ['collected', 'Collected', stats.collected], ['hunting', 'Still hunting', stats.hunting], ...(stats.unknown ? [['unknown', 'Awaiting update', stats.unknown]] : [])];
  return `<div class="wrap ex-collection" data-ex-collection>
    <header class="ex-heading"><a class="ex-back-link" href="/hobby/">Back to Hobby</a><p class="ex-eyebrow">Pokémon TCG / My childhood collection</p><h1>The EX <em>collection.</em></h1><p class="ex-intro">${escape(data.description || 'i am hunting down the ex cards from my childhood. A place to track the collection, and enjoy it along the way.')}</p><div class="ex-heading-note"><span>${escape(batches || 'A binder in progress')}</span>${date ? `<span>Updated <time datetime="${escape(data.updatedAt)}">${escape(date)}</time></span>` : ''}</div></header>
    <section class="ex-overview" aria-label="Collection overview"><dl class="ex-stats"><div><dt>Collected</dt><dd>${stats.collected}</dd></div><div><dt>Still hunting</dt><dd>${stats.hunting}</dd></div><div><dt>Cards recorded</dt><dd>${stats.recorded}</dd></div><div><dt>Sets added</dt><dd>${data.sets.length}</dd></div></dl>${stats.unknown ? `<p class="ex-awaiting-note">${stats.unknown} more ${stats.unknown === 1 ? 'card is' : 'cards are'} awaiting an update. Their collection status is still to be confirmed.</p>` : ''}</section>
    <form class="ex-filters" data-ex-filters role="search" hidden><div class="ex-search-row"><div class="ex-field ex-search-field"><label for="ex-search">Find a card</label><input id="ex-search" type="search" placeholder="Name or card number" autocomplete="off" spellcheck="false"></div><div class="ex-field ex-set-field"><label for="ex-set-select">Expansion</label><select id="ex-set-select"><option value="all">All expansions</option>${data.sets.map(set => `<option value="${escape(set.id)}">${escape(set.name)}</option>`).join('')}</select></div></div><div class="ex-filter-bottom"><div class="ex-status-filters" role="group" aria-label="Filter by collection status">${filters.map(([value, label, count]) => `<button class="ex-filter" type="button" data-ex-filter="${value}" aria-pressed="${value === 'all'}">${label}<span aria-hidden="true">${count}</span></button>`).join('')}</div></div><div class="ex-results-row"><p class="ex-results" data-ex-results role="status" aria-live="polite" aria-atomic="true">Showing all ${stats.total} cards</p><div class="ex-result-actions"><button class="ex-clear" type="reset" data-ex-clear hidden>Clear filters</button>${stats.hunting ? '<a class="ex-download" href="/hobby/ex-collection/hunt-list.csv" download>Download hunt list</a>' : ''}</div></div></form>
    <p class="ex-empty" data-ex-empty hidden>No cards match this search. Try another name, set or collection status.</p>
    <div class="ex-sets">${data.sets.map(renderSet).join('')}</div>
    <p class="ex-footnote">A personal collection of the original Pokémon ex cards. Reference scans and set checklists: <a href="https://www.pokellector.com/" target="_blank" rel="noopener noreferrer">Pokellector</a>.</p>
    <dialog class="ex-dialog" aria-labelledby="ex-dialog-title" aria-describedby="ex-dialog-detail"><div class="ex-dialog-panel"><form method="dialog" class="ex-dialog-close-form"><button class="ex-dialog-close" type="submit" aria-label="Close card viewer" autofocus>Close</button></form><div class="ex-dialog-art" data-ex-artwork><img class="ex-dialog-image" data-ex-dialog-image alt="" width="490" height="686" decoding="async" referrerpolicy="no-referrer"><span class="ex-art-fallback" data-ex-image-fallback hidden>Artwork unavailable</span></div><div class="ex-dialog-info"><p class="ex-eyebrow" data-ex-dialog-set></p><h2 id="ex-dialog-title"></h2><p class="ex-dialog-detail" id="ex-dialog-detail"></p><p data-ex-dialog-status></p><a class="ex-source-link" data-ex-dialog-source target="_blank" rel="noopener noreferrer">View card reference</a></div><div class="ex-dialog-navigation"><button type="button" data-ex-previous aria-label="Previous card">Previous</button><span data-ex-dialog-position aria-live="polite"></span><button type="button" data-ex-next aria-label="Next card">Next</button></div></div></dialog>
  </div>`;
}

export function renderHuntList(data) {
  const hunting = summary(data).cards.filter(card => card.status === 'hunting');
  const cell = value => {
    let text = String(value ?? '');
    if (/^[=+@-]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const rows = [
    ['Expansion', 'Number', 'Card', 'Variant', 'Status', 'Reference'],
    ...hunting.map(card => [card.set.name, card.number ?? '', card.name, card.variant || '', 'Still hunting', link(card.sourceUrl || card.set.sourceUrl)])
  ];
  return '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
}

export function renderCollectionTeaser(data) {
  const stats = summary(data);
  const previews = data.sets.map(set => set.cards.find(card => card.status === 'collected' && card.imageUrl)).filter(Boolean).slice(0, 3);
  return `<a class="ex-teaser" href="/hobby/ex-collection/" aria-label="Open my EX collection, ${stats.collected} cards collected"><div class="ex-teaser-copy"><p class="ex-eyebrow">From my childhood</p><h2>The EX <em>collection.</em></h2><p>Hunting down the cards i grew up with, one find at a time.</p><span class="ex-teaser-count">${stats.collected} collected <span aria-hidden="true">·</span> ${stats.hunting} still hunting</span><span class="ex-teaser-action">Open the binder</span></div><div class="ex-teaser-cards" aria-hidden="true">${previews.map(card => `<img src="${escape(link(card.imageUrl))}" alt="" width="140" height="196" loading="lazy" decoding="async" referrerpolicy="no-referrer">`).join('')}</div></a>`;
}
