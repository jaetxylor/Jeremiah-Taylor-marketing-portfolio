(() => {
  'use strict';

  function watchCover(image, onError) {
    image.addEventListener('error', onError);
    if (image.getAttribute('src') && image.complete && image.naturalWidth === 0) onError();
  }

  const root = document.querySelector('[data-comics-collection]');
  if (!root) {
    for (const artwork of document.querySelectorAll('[data-comic-artwork]')) {
      watchCover(artwork.querySelector('img'), () => { artwork.hidden = true; });
    }
    return;
  }
  const optimus = root.querySelector('[data-optimus-toggle]');
  if (optimus) {
    optimus.disabled = false;
    optimus.addEventListener('click', () => {
      const truck = optimus.dataset.mode !== 'truck';
      optimus.dataset.mode = truck ? 'truck' : 'robot';
      optimus.setAttribute('aria-pressed', String(truck));
      optimus.setAttribute('aria-label', truck ? 'Transform Optimus Prime back into Jae' : 'Transform Jae into G1 Optimus Prime truck mode');
    });
  }
  const cards = [...root.querySelectorAll('[data-comic-card]')];
  const series = [...root.querySelectorAll('[data-comics-series]')];
  const franchises = [...root.querySelectorAll('[data-comics-franchise]')];
  const form = root.querySelector('[data-comics-filters]');
  const search = root.querySelector('#comics-search');
  const franchiseSelect = root.querySelector('#comics-franchise-select');
  const results = root.querySelector('[data-comics-results]');
  const empty = root.querySelector('[data-comics-empty]');
  const clear = root.querySelector('[data-comics-clear]');
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const noun = (count, singular, plural = `${singular}s`) => `${count} ${count === 1 ? singular : plural}`;
  const quantity = card => Number(card.dataset.quantity);
  const copies = list => list.reduce((total, card) => total + quantity(card), 0);
  const label = list => `${noun(list.length, 'entry', 'entries')} · ${noun(copies(list), 'copy', 'copies')}`;
  const searchable = new Map(cards.map(card => [card, {
    text: normalize(card.dataset.search),
    numbers: normalize([card.dataset.number, card.dataset.year, card.dataset.title, card.dataset.variant].join(' ')).split(/\s+/)
  }]));
  const grouped = new Map([...series, ...franchises].map(group => [group, [...group.querySelectorAll('[data-comic-card]')]]));

  function filterCards() {
    if (!form || !search || !franchiseSelect || !results || !empty || !clear) return;
    const query = normalize(search.value);
    const words = query.split(/\s+/).filter(Boolean);
    for (const card of cards) {
      const content = searchable.get(card);
      card.hidden = card.hasAttribute('data-cover-failed') || !((franchiseSelect.value === 'all' || franchiseSelect.value === card.dataset.franchise)
        && words.every(word => /^\d+$/.test(word) ? content.numbers.includes(word) : content.text.includes(word)));
    }
    for (const group of [...series, ...franchises]) {
      const visible = grouped.get(group).filter(card => !card.hidden);
      group.hidden = visible.length === 0;
      const counter = group.querySelector(group.hasAttribute('data-comics-series') ? '[data-comics-series-count]' : '[data-comics-franchise-count]');
      if (counter) counter.textContent = label(visible);
    }
    const visible = cards.filter(card => !card.hidden);
    const active = franchiseSelect.value !== 'all' || Boolean(query);
    clear.hidden = !active;
    results.textContent = active
      ? `Showing ${visible.length} of ${noun(cards.length, 'entry', 'entries')} · ${noun(copies(visible), 'copy', 'copies')}`
      : `Showing all ${label(visible)}`;
    empty.hidden = visible.length !== 0;
  }

  if (form && search && franchiseSelect && results && empty && clear) {
    form.hidden = false;
    form.addEventListener('submit', event => event.preventDefault());
    search.addEventListener('input', filterCards);
    franchiseSelect.addEventListener('change', filterCards);
    form.addEventListener('reset', event => {
      event.preventDefault();
      search.value = '';
      franchiseSelect.value = 'all';
      filterCards();
      search.focus();
    });
    filterCards();
  }

  for (const card of cards) {
    watchCover(card.querySelector('.comic-cover-image'), () => {
      card.setAttribute('data-cover-failed', '');
      card.hidden = true;
      filterCards();
    });
  }

  const dialog = root.querySelector('.comics-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('[data-comic-dialog-image]');
  const artwork = image.closest('[data-comic-artwork]');
  watchCover(image, () => { artwork.hidden = true; });
  const title = dialog.querySelector('#comic-dialog-title');
  const detail = dialog.querySelector('#comic-dialog-detail');
  const groupLabel = dialog.querySelector('[data-comic-dialog-group]');
  const coverNote = dialog.querySelector('[data-comic-dialog-reference]');
  const note = dialog.querySelector('[data-comic-dialog-note]');
  const source = dialog.querySelector('[data-comic-dialog-source]');
  const position = dialog.querySelector('[data-comic-dialog-position]');
  const previous = dialog.querySelector('[data-comic-previous]');
  const next = dialog.querySelector('[data-comic-next]');
  let activeCard = null;
  let returnFocus = null;
  let visibleCards = [];

  function showCard(card) {
    activeCard = card;
    const target = card.querySelector('[data-comic-open]');
    artwork.hidden = false;
    image.alt = `${card.dataset.coverNote ? 'Reference cover' : 'Cover'} of ${card.dataset.seriesName} ${card.dataset.number}${card.dataset.variant ? `, ${card.dataset.variant}` : ''}`;
    image.src = target.dataset.image;
    title.textContent = `${card.dataset.seriesName} ${card.dataset.number}`;
    groupLabel.textContent = [card.dataset.franchiseName, card.dataset.year, card.dataset.publisher].filter(Boolean).join(' / ');
    detail.textContent = [card.dataset.title, card.dataset.variant, noun(quantity(card), 'copy', 'copies')].filter(Boolean).join(' · ');
    coverNote.textContent = card.dataset.coverNote;
    coverNote.hidden = !card.dataset.coverNote;
    note.textContent = card.dataset.note;
    note.hidden = !card.dataset.note;
    if (card.dataset.source) {
      source.href = card.dataset.source;
      source.textContent = card.dataset.sourceName ? `View on ${card.dataset.sourceName}` : 'View issue reference';
      source.hidden = false;
    } else {
      source.removeAttribute('href');
      source.hidden = true;
    }
    position.textContent = `${visibleCards.indexOf(card) + 1} of ${noun(visibleCards.length, 'cover')}`;
    previous.disabled = next.disabled = visibleCards.length < 2;
  }

  function move(direction) {
    if (visibleCards.length < 2) return;
    const index = visibleCards.indexOf(activeCard);
    showCard(visibleCards[(index + direction + visibleCards.length) % visibleCards.length]);
  }

  for (const card of cards) {
    const target = card.querySelector('[data-comic-open]');
    if (!target) continue;
    target.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      returnFocus = target;
      visibleCards = cards.filter(item => !item.hidden && item.querySelector('[data-comic-open]'));
      showCard(card);
      if (!dialog.open) dialog.showModal();
      document.body.classList.add('comics-modal-open');
    });
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('comics-modal-open');
    returnFocus?.focus({ preventScroll: true });
  });
})();
