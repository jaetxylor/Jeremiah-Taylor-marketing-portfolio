document.documentElement.classList.add('js');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
if (toggle && nav) {
  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Menu';
    nav.classList.remove('is-open');
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
    nav.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggle.focus();
    }
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  window.matchMedia('(min-width: 821px)').addEventListener('change', event => {
    if(event.matches) closeMenu();
  });
}
const filters = document.querySelector('.filter-controls');
if (filters) {
  const cards = [...document.querySelectorAll('.all-projects .project-card')];
  const count = document.querySelector('.project-count');
  filters.hidden = false;
  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    const value = button.dataset.filter;
    filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    let visible = 0;
    cards.forEach(card => {
      card.hidden = value !== 'all' && value !== card.dataset.category;
      if (!card.hidden) {
        visible++;
        card.classList.add('is-visible');
      }
    });
    if (count) count.textContent = `${visible} project${visible === 1 ? '' : 's'}`;
  });
}
// Preserve bookmarked homepage sections after moving the detailed content.
const sectionDestinations = {
  web: '/projects/', campaigns: '/works/#campaigns',
  creative: '/works/#creative', social: '/works/#social',
  collaborations: '/works/#collaborations', personal: '/hobby/#pokemon',
  about: '/about/', resume: '/about/#resume',
  education: '/about/#education', certifications: '/about/#certifications'
};
function followMovedSection() {
  const destination = sectionDestinations[location.hash.slice(1)];
  if (document.body.dataset.page === 'home' && destination) location.replace(destination);
}
followMovedSection();
window.addEventListener('hashchange', followMovedSection);

if (location.pathname === '/index.html') history.replaceState(null, '', '/'+location.search+location.hash);
const search = document.querySelector('#post-search');
if (search) {
  search.closest('.blog-search').hidden = false;
  const rows = [...document.querySelectorAll('.blog-list .post-row')];
  const status = document.querySelector('.search-status');
  const clear = document.querySelector('#clear-search');
  const updateSearch = () => {
    const query = search.value.trim().toLocaleLowerCase();
    const terms = query.split(/\s+/).filter(Boolean);
    let found = 0;
    rows.forEach(row => {
      const text = (row.dataset.search || row.textContent).toLocaleLowerCase();
      row.hidden = !terms.every(term => text.includes(term));
      if (!row.hidden) found++;
    });
    clear.hidden = !query;
    status.textContent = query ? (found ? `${found} post${found === 1 ? '' : 's'} found` : 'No matching posts. Try another word.') : '';
    const url = new URL(location.href);
    if (query) url.searchParams.set('q', search.value.trim()); else url.searchParams.delete('q');
    history.replaceState(null, '', url.pathname+url.search+url.hash);
  };
  search.value = new URLSearchParams(location.search).get('q') || '';
  search.addEventListener('input', updateSearch);
  clear.addEventListener('click', () => { search.value = ''; updateSearch(); search.focus(); });
  updateSearch();
}

// Keep company names readable if an external logo is unavailable.
document.querySelectorAll('img[data-logo]').forEach(img => {
  const fallback = () => { img.hidden = true; img.nextElementSibling.hidden = false; };
  img.addEventListener('error', fallback, {once:true});
  if (img.complete && !img.naturalWidth) fallback();
});
