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
  web: '/projects/', campaigns: '/works/campaigns/',
  creative: '/works/creative/', social: '/works/social/',
  collaborations: '/works/collaborations/', personal: '/hobby/#pokemon',
  about: '/about/', resume: '/about/#resume',
  education: '/about/#education', certifications: '/about/#certifications'
};
function followMovedSection() {
  const destination = sectionDestinations[location.hash.slice(1)];
  if (document.body.dataset.page === 'home' && destination) location.replace(destination);
}
function followMovedWorksSection() {
  if (!['/works/', '/experience.html'].includes(location.pathname)) return;
  const routes = {
    '#campaigns': '/works/campaigns/',
    '#social': '/works/social/', '#creative': '/works/creative/',
    '#capabilities': '/works/creative/#capabilities', '#collaborations': '/works/collaborations/'
  };
  const destination = routes[location.hash];
  if (destination) location.replace(destination);
}
followMovedWorksSection();
window.addEventListener('hashchange', followMovedWorksSection);
function followMovedHobbySection() {
  if (location.pathname !== '/hobby/' && location.pathname !== '/hobby/index.html') return;
  const routes = { '#comics': '/hobby/comics/', '#running': '/hobby/running/', '#travelling': '/hobby/travelling/', '#travel': '/hobby/travelling/' };
  const destination = routes[location.hash];
  if (destination) location.replace(destination);
}
followMovedHobbySection();
window.addEventListener('hashchange', followMovedHobbySection);
followMovedSection();
window.addEventListener('hashchange', followMovedSection);

if (location.pathname === '/index.html') history.replaceState(null, '', '/'+location.search+location.hash);
const search = document.querySelector('#post-search');
if (search) {
  search.closest('.blog-search').hidden = false;
  const rows = [...document.querySelectorAll('.blog-list .post-row')];
  const buttons = [...document.querySelectorAll('[data-topic]')];
  const status = document.querySelector('.search-status');
  const clear = document.querySelector('#clear-search');
  let topic = '';
  const updateSearch = (writeURL = true) => {
    const query = search.value.trim().toLocaleLowerCase();
    const terms = query.split(/\s+/).filter(Boolean);
    let found = 0;
    rows.forEach(row => {
      const text = (row.dataset.search || row.textContent).toLocaleLowerCase();
      const tags = JSON.parse(row.dataset.tags || '[]');
      row.hidden = !terms.every(term => text.includes(term)) || Boolean(topic && !tags.some(t => t.toLocaleLowerCase() === topic.toLocaleLowerCase()));
      if (!row.hidden) found++;
    });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.topic.toLocaleLowerCase() === topic.toLocaleLowerCase())));
    clear.hidden = !query && !topic;
    status.textContent = found ? `${found} post${found === 1 ? '' : 's'}${topic ? ` tagged ${topic}` : ''}${query ? ' found' : ''}` : topic && !query ? `No posts tagged ${topic} yet. Check back soon, or explore another topic.` : 'No matching posts. Try another word or clear the filters.';
    if (writeURL) {
      const url = new URL(location.href);
      if (query) url.searchParams.set('q', search.value.trim()); else url.searchParams.delete('q');
      if (topic) url.searchParams.set('tag', topic); else url.searchParams.delete('tag');
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  };
  const fromURL = () => {
    const params = new URLSearchParams(location.search);
    search.value = params.get('q') || '';
    topic = params.get('tag') || '';
    updateSearch(false);
  };
  search.addEventListener('input', () => updateSearch());
  buttons.forEach(button => button.addEventListener('click', () => {
    const url = new URL(location.href);
    if (button.dataset.topic) url.searchParams.set('tag', button.dataset.topic); else url.searchParams.delete('tag');
    history.pushState(null, '', url.pathname + url.search + url.hash);
    fromURL();
  }));
  clear.addEventListener('click', () => { search.value = ''; topic = ''; updateSearch(); search.focus(); });
  window.addEventListener('popstate', fromURL);
  fromURL();
}

// Keep company names readable if an external logo is unavailable.
document.querySelectorAll('img[data-logo]').forEach(img => {
  const fallback = () => { img.hidden = true; img.nextElementSibling.hidden = false; };
  img.addEventListener('error', fallback, {once:true});
  if (img.complete && !img.naturalWidth) fallback();
});

function openAboutSubsection() {
  if (document.body.dataset.page !== 'about') return;
  const section = document.getElementById(location.hash.slice(1));
  if (section instanceof HTMLDetailsElement) section.open = true;
}
openAboutSubsection();
window.addEventListener('hashchange', openAboutSubsection);

const mascot = document.querySelector('[data-mascot]');
if (mascot) {
  const reply = mascot.querySelector('[data-mascot-reply]');
  const surprises = ['wave', 'flower', 'dance'];
  const replies = { wave: 'hey there!', flower: 'a flower for you.', dance: 'you found the court jester.' };
  let taps = 0;
  let reset;
  mascot.addEventListener('click', event => {
    const button = event.target.closest('[data-mascot-action]');
    if (!button) return;
    const action = button.dataset.mascotAction;
    const reaction = action === 'surprise' ? surprises[taps++ % surprises.length] : action;
    clearTimeout(reset);
    delete mascot.dataset.reaction;
    void mascot.offsetWidth;
    mascot.dataset.reaction = reaction;
    reply.textContent = replies[reaction];
    reset = setTimeout(() => { delete mascot.dataset.reaction; }, 2300);
  });
}
