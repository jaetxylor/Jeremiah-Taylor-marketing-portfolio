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
// Existing homepage sections retain their original portfolio anchors.
const legacySections = ['web', 'campaigns', 'creative', 'social', 'about', 'resume'];
const hash = location.hash.slice(1);
if (document.body.dataset.page === 'home' && legacySections.includes(hash) && !document.getElementById(hash)) {
  location.replace(`portfolio.html${location.hash}`);
}
