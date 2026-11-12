(() => {
  const viewer = document.querySelector('[data-static-viewer]');
  const links = [...document.querySelectorAll('a[data-static-work]')];
  if (!viewer || typeof viewer.showModal !== 'function' || !links.length) return;

  const image = viewer.querySelector('[data-static-image]');
  const title = viewer.querySelector('#static-work-viewer-title');
  const counter = viewer.querySelector('[data-static-counter]');
  const close = viewer.querySelector('[data-static-close]');
  const previous = viewer.querySelector('[data-static-prev]');
  const next = viewer.querySelector('[data-static-next]');
  const original = viewer.querySelector('[data-static-original]');
  const imageArea = viewer.querySelector('.static-work-viewer-image');
  if (![image, title, counter, close, previous, next, original, imageArea].every(Boolean)) return;

  let group = [];
  let index = 0;
  let opener = null;
  let savedScrollStyles = null;
  let touch = null;

  function render() {
    const link = group[index];
    const thumbnail = link.querySelector('img');
    title.textContent = link.dataset.title || thumbnail?.alt || 'Static work';
    image.alt = thumbnail?.alt || title.textContent;
    image.src = link.href;
    original.href = link.href;
    counter.textContent = `${index + 1} of ${group.length}`;
    previous.disabled = index === 0;
    next.disabled = index === group.length - 1;
  }

  function move(step) {
    const target = index + step;
    if (!viewer.open || target < 0 || target >= group.length) return;
    index = target;
    render();
  }

  function lockScroll() {
    const root = document.documentElement;
    const body = document.body;
    const gutter = window.innerWidth - root.clientWidth;
    savedScrollStyles = {
      rootOverflow: root.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight
    };
    if (gutter > 0) {
      body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight) + gutter}px`;
    }
    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
  }

  function restoreScroll() {
    if (!savedScrollStyles) return;
    document.documentElement.style.overflow = savedScrollStyles.rootOverflow;
    document.body.style.overflow = savedScrollStyles.bodyOverflow;
    document.body.style.paddingRight = savedScrollStyles.bodyPaddingRight;
    savedScrollStyles = null;
  }

  links.forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      // Preserve native download, new-tab and modified-click behavior.
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      group = links.filter(item => item.dataset.gallery === link.dataset.gallery);
      index = group.indexOf(link);
      opener = link;
      render();
      try {
        viewer.showModal();
      } catch {
        // If the enhanced viewer cannot open, the original image link still works.
        return;
      }
      event.preventDefault();
      lockScroll();
      close.focus({preventScroll: true});
    });
  });

  close.addEventListener('click', () => viewer.close());
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  viewer.addEventListener('close', () => {
    touch = null;
    restoreScroll();
    if (opener?.isConnected) opener.focus({preventScroll: true});
  });
  viewer.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
  });
  viewer.addEventListener('click', event => {
    if (event.target !== viewer) return;
    const bounds = viewer.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) viewer.close();
  });

  imageArea.addEventListener('touchstart', event => {
    touch = event.touches.length === 1
      ? {x: event.touches[0].clientX, y: event.touches[0].clientY, id: event.touches[0].identifier}
      : null;
  }, {passive: true});
  imageArea.addEventListener('touchend', event => {
    if (!touch) return;
    const end = [...event.changedTouches].find(item => item.identifier === touch.id);
    if (!end) return;
    const dx = end.clientX - touch.x;
    const dy = end.clientY - touch.y;
    touch = null;
    if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
  }, {passive: true});
  imageArea.addEventListener('touchcancel', () => { touch = null; }, {passive: true});
})();
