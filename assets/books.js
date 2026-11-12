(() => {
  'use strict';
  const boundDialogs = new WeakSet();
  const openers = new WeakMap();
  let contentReady = !window.psrContentReady;

  function coverFailed(image) {
    if (!image.matches('.book-cover-image')) return;
    image.hidden = true;
    image.closest('.book-artwork')?.classList.add('book-artwork-missing');
  }

  // Capturing also catches failed covers inserted by the live content response.
  document.addEventListener('error', event => {
    if (event.target instanceof HTMLImageElement) coverFailed(event.target);
  }, true);

  const checkLoadedCovers = () => {
    for (const image of document.querySelectorAll('.book-cover-image')) {
      if (image.complete && image.naturalWidth === 0) coverFailed(image);
    }
  };
  checkLoadedCovers();
  const contentSettled = () => { contentReady = true; checkLoadedCovers(); };
  Promise.resolve(window.psrContentReady).then(contentSettled, contentSettled);

  function bindDialog(dialog) {
    if (boundDialogs.has(dialog)) return;
    boundDialogs.add(dialog);
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('books-modal-open');
      const opener = openers.get(dialog);
      if (opener?.isConnected) opener.focus({preventScroll: true});
      openers.delete(dialog);
    });
  }

  // Delegate so covers and disclosures work after the CMS replaces the page.
  document.addEventListener('click', event => {
    // Keep the native disclosure until the initial CMS replacement is finished.
    if (!contentReady) return;
    if (!(event.target instanceof Element)) return;
    const opener = event.target.closest('[data-book-open]');
    if (!opener || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const card = opener.closest('[data-book-card]');
    const root = card?.closest('[data-books-collection]');
    const dialog = root?.querySelector('.books-dialog');
    const review = card?.querySelector('[data-book-review-copy]');
    if (!dialog || typeof dialog.showModal !== 'function' || !review) return;
    const title = dialog.querySelector('[data-book-dialog-title]');
    const author = dialog.querySelector('[data-book-dialog-author]');
    const cover = dialog.querySelector('[data-book-dialog-cover]');
    const rating = dialog.querySelector('[data-book-dialog-rating]');
    const copy = dialog.querySelector('[data-book-dialog-copy]');
    if (!title || !author || !cover || !rating || !copy) return;

    event.preventDefault();
    bindDialog(dialog);
    openers.set(dialog, opener);
    title.textContent = card.querySelector('.book-title')?.textContent || '';
    author.textContent = card.querySelector('.book-author')?.textContent || '';
    const artwork = card.querySelector('.book-artwork');
    cover.replaceChildren(...(artwork ? [artwork.cloneNode(true)] : []));
    const stars = card.querySelector('.book-rating');
    rating.replaceChildren(...(stars ? [stars.cloneNode(true)] : []));
    const fullReview = review.cloneNode(true);
    fullReview.removeAttribute('id');
    copy.replaceChildren(fullReview);
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('books-modal-open');
  });
})();
