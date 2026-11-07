const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
if (toggle && nav) {
  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Menu +';
    nav.classList.remove('is-open');
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close −' : 'Menu +';
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
  window.matchMedia('(min-width: 621px)').addEventListener('change', event => {
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
// Content remains visible without JavaScript or when motion is reduced.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06 });
  document.querySelectorAll('[data-reveal]').forEach(el => {
    if (el.getBoundingClientRect().top > window.innerHeight) el.classList.add('reveal-ready');
    observer.observe(el);
  });
  reducedMotion.addEventListener('change',event=>{
    if(event.matches){observer.disconnect();document.querySelectorAll('.reveal-ready').forEach(el=>el.classList.add('is-visible'));}
  });
}
// Preserve inbound links to the original single-page CV sections.
const legacySections = ['web', 'campaigns', 'creative', 'social', 'about', 'resume'];
const hash = location.hash.slice(1);
if (document.body.dataset.page === 'home' && legacySections.includes(hash) && !document.getElementById(hash)) {
  location.replace(`portfolio.html${location.hash}`);
}
