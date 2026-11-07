(() => {
  'use strict';
  const root = document.querySelector('[data-ex-collection]');
  if (!root) return;
  const cards = [...root.querySelectorAll('[data-ex-card]')];
  const sets = [...root.querySelectorAll('[data-ex-set]')];
  const form = root.querySelector('[data-ex-filters]');
  const search = root.querySelector('#ex-search');
  const setSelect = root.querySelector('#ex-set-select');
  const filters = [...root.querySelectorAll('[data-ex-filter]')];
  const results = root.querySelector('[data-ex-results]');
  const empty = root.querySelector('[data-ex-empty]');
  const clear = root.querySelector('[data-ex-clear]');
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const searchable = new Map(cards.map(card => [card, normalize(card.dataset.search)]));
  let selectedStatus = 'all';

  function filterCards() {
    const query = normalize(search.value);
    const words = query.split(/\s+/).filter(Boolean);
    let count = 0;
    for (const card of cards) {
      const match = (selectedStatus === 'all' || selectedStatus === card.dataset.status)
        && (setSelect.value === 'all' || setSelect.value === card.dataset.set)
        && words.every(word => searchable.get(card).includes(word));
      card.hidden = !match;
      if (match) count += 1;
    }
    for (const set of sets) set.hidden = ![...set.querySelectorAll('[data-ex-card]')].some(card => !card.hidden);
    for (const filter of filters) filter.setAttribute('aria-pressed', String(filter.dataset.exFilter === selectedStatus));
    const active = selectedStatus !== 'all' || setSelect.value !== 'all' || Boolean(query);
    clear.hidden = !active;
    results.textContent = active ? `Showing ${count} of ${cards.length} cards` : `Showing all ${cards.length} cards`;
    empty.hidden = count !== 0;
  }

  if (form && search && setSelect) {
    form.hidden = false;
    form.addEventListener('submit', event => event.preventDefault());
    search.addEventListener('input', filterCards);
    setSelect.addEventListener('change', filterCards);
    for (const filter of filters) filter.addEventListener('click', () => {
      selectedStatus = filter.dataset.exFilter;
      filterCards();
    });
    form.addEventListener('reset', event => {
      event.preventDefault();
      search.value = '';
      setSelect.value = 'all';
      selectedStatus = 'all';
      filterCards();
      search.focus();
    });
    filterCards();
  }

  function observeArtwork(image) {
    const wrapper = image.closest('[data-ex-artwork]');
    const fallback = wrapper?.querySelector('[data-ex-image-fallback]');
    if (!fallback) return;
    const failed = () => { image.hidden = true; fallback.hidden = false; };
    image.addEventListener('error', failed);
    image.addEventListener('load', () => { image.hidden = false; fallback.hidden = true; });
    if (image.getAttribute('src') && image.complete && image.naturalWidth === 0) failed();
  }
  for (const image of root.querySelectorAll('[data-ex-artwork] img')) observeArtwork(image);
  for (const logo of root.querySelectorAll('[data-ex-logo]')) {
    logo.addEventListener('error', () => { logo.hidden = true; });
    if (logo.complete && logo.naturalWidth === 0) logo.hidden = true;
  }

  const dialog = root.querySelector('.ex-dialog');
  if (dialog && typeof dialog.showModal === 'function') {
    const image = dialog.querySelector('[data-ex-dialog-image]');
    const title = dialog.querySelector('#ex-dialog-title');
    const detail = dialog.querySelector('#ex-dialog-detail');
    const setLabel = dialog.querySelector('[data-ex-dialog-set]');
    const status = dialog.querySelector('[data-ex-dialog-status]');
    const source = dialog.querySelector('[data-ex-dialog-source]');
    const position = dialog.querySelector('[data-ex-dialog-position]');
    const previous = dialog.querySelector('[data-ex-previous]');
    const next = dialog.querySelector('[data-ex-next]');
    let activeCard = null;
    let returnFocus = null;
    let visibleCards = [];

    function showCard(card) {
      activeCard = card;
      const target = card.querySelector('[data-ex-open]');
      image.hidden = false;
      dialog.querySelector('[data-ex-image-fallback]').hidden = true;
      image.alt = `${card.dataset.name}, ${card.dataset.setName} ${card.dataset.number}`;
      image.src = target.dataset.image;
      title.textContent = card.dataset.name;
      detail.textContent = [card.dataset.number, card.dataset.variant].filter(Boolean).join(' · ');
      setLabel.textContent = card.dataset.setName;
      status.replaceChildren(card.querySelector('.ex-status').cloneNode(true));
      if (card.dataset.source) {
        source.href = card.dataset.source;
        source.hidden = false;
        source.textContent = new URL(card.dataset.source, location.href).hostname.endsWith('pokellector.com') ? 'View on Pokellector' : 'View card reference';
      } else {
        source.removeAttribute('href');
        source.hidden = true;
      }
      position.textContent = `${visibleCards.indexOf(card) + 1} / ${visibleCards.length}`;
      previous.disabled = next.disabled = visibleCards.length < 2;
    }

    function move(direction) {
      if (visibleCards.length < 2) return;
      const index = visibleCards.indexOf(activeCard);
      showCard(visibleCards[(index + direction + visibleCards.length) % visibleCards.length]);
    }

    for (const card of cards) {
      const target = card.querySelector('[data-ex-open]');
      target.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        returnFocus = target;
        visibleCards = cards.filter(item => !item.hidden);
        showCard(card);
        dialog.showModal();
        document.body.classList.add('ex-modal-open');
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
      document.body.classList.remove('ex-modal-open');
      returnFocus?.focus({ preventScroll: true });
    });
  }

})();
