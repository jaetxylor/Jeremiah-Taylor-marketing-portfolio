const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close −' : 'Menu +';
    nav.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      toggle.click();
      toggle.focus();
    }
  });
}
// Preserve links to sections of the original single-page CV.
const legacySections = ['web', 'campaigns', 'creative', 'social', 'about', 'resume'];
if (document.body.dataset.page === 'home' && legacySections.includes(location.hash.slice(1))) {
  location.replace(`portfolio.html${location.hash}`);
}
