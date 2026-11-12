const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function safeLink(value, image = false) {
  if (!value) return '';
  if (typeof value !== 'string' || /[\u0000-\u0020\\]/.test(value)) throw new Error('Invalid book link');
  if (image && /^\/?assets\//.test(value)) {
    if (/[?#]/.test(value) || decodeURIComponent(value).split('/').some(part => part === '..' || part === '.')) throw new Error('Invalid book cover path');
    return '/' + value.replace(/^\//, '');
  }
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Book links must use HTTPS');
  return url.href;
}

function ratingMarkup(rating) {
  if (rating === undefined || rating === null || rating === '') return '';
  if (typeof rating !== 'number' || !Number.isFinite(rating) || rating < 0 || rating > 5) throw new Error('Book ratings must be between 0 and 5');
  const stars = Array.from({length: 5}, (_, index) => `<span class="book-rating-star">★<span class="book-rating-fill" style="width:${Math.max(0, Math.min(1, rating - index)) * 100}%">★</span></span>`).join('');
  return `<p class="book-rating" aria-label="My rating: ${rating} out of 5"><span class="book-rating-stars" aria-hidden="true">${stars}</span><span class="book-rating-value" aria-hidden="true">${rating}/5</span></p>`;
}

const bookIcon = '<svg viewBox="0 0 64 72" width="64" height="72" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 8h39v52H18a6 6 0 0 0 0 12h33M12 8v58M22 20h19M22 28h19M22 36h13"/></svg>';

function renderBook(book, index, year) {
  if (typeof book.title !== 'string' || !book.title.trim() || typeof book.author !== 'string' || !book.author.trim()) throw new Error('Books need a title and author');
  if (book.notes !== undefined && typeof book.notes !== 'string') throw new Error('Book reviews must be text');
  const imageUrl = safeLink(book.imageUrl, true);
  const sourceUrl = safeLink(book.sourceUrl);
  const reviewId = `book-review-${year}-${index + 1}`;
  const title = escape(book.title);
  const author = escape(book.author);
  const rating = ratingMarkup(book.rating);
  const review = String(book.notes || '').trim();
  const cover = `<span class="book-artwork${imageUrl ? '' : ' book-artwork-missing'}">${imageUrl ? `<img class="book-cover-image" src="${escape(imageUrl)}" alt="Cover of ${title} by ${author}" width="260" height="400" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ''}<span class="book-cover-fallback" aria-hidden="true">${bookIcon}<strong>${title}</strong><span>${author}</span></span></span>`;
  const reviewContent = review ? review.split(/\n\s*\n/).map(paragraph => `<p>${escape(paragraph)}</p>`).join('') : '<p>Review coming soon.</p>';
  return `<li class="book-card" data-book-card>
    <div class="book-cover"><a class="book-cover-link" href="#${reviewId}" data-book-open aria-label="Read my review of ${title}">${cover}</a></div>
    <div class="book-caption"><h2 class="book-title">${title}</h2><p class="book-author">${author}</p>${rating}
      <details class="book-review"><summary class="book-review-trigger" data-book-open>Read review</summary><div class="book-review-copy" id="${reviewId}" data-book-review-copy>${reviewContent}${sourceUrl ? `<p class="book-source-row"><a class="book-source" href="${escape(sourceUrl)}" target="_blank" rel="noopener noreferrer">View book</a></p>` : ''}</div></details>
    </div>
  </li>`;
}

export function renderBooks(data) {
  if (!data || !Number.isInteger(data.year) || !Array.isArray(data.books)) throw new Error('Invalid reading list');
  return `<section class="wrap books-page" data-books-collection><header class="page-top"><p class="eyebrow">Hobby / Books / ${data.year}</p><h1>A year of<br><em>good reads.</em></h1><p class="intro">The books i read in ${data.year}, and the thoughts they leave behind.</p></header>
    ${data.books.length ? `<div class="books-shelf-heading"><p>${data.books.length} ${data.books.length === 1 ? 'book' : 'books'} read</p><p>Tap a cover to read my review.</p></div><ul class="book-grid" aria-label="Books read in ${data.year}">${data.books.map((book, index) => renderBook(book, index, data.year)).join('')}</ul>
      <dialog class="books-dialog" aria-labelledby="book-dialog-title"><div class="books-dialog-panel"><form method="dialog" class="books-dialog-close-form"><button class="books-dialog-close" type="submit" aria-label="Close book review" autofocus>Close</button></form><div class="books-dialog-header"><div class="books-dialog-cover" data-book-dialog-cover></div><div><p class="books-review-label">My review</p><h2 id="book-dialog-title" data-book-dialog-title></h2><p class="book-author" data-book-dialog-author></p><div data-book-dialog-rating></div></div></div><div class="books-dialog-copy" data-book-dialog-copy></div></div></dialog>` : `<div class="reading-empty"><svg viewBox="0 0 100 76" width="100" height="76" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M50 19Q32 5 8 12V61Q31 55 50 68Q69 55 92 61V12Q68 5 50 19ZM50 19V68M20 25Q31 23 40 29M20 35Q31 33 40 39M60 29Q71 23 80 25M60 39Q71 33 80 35"/></svg><h2>Making room on the shelf.</h2><p>My ${data.year} reading list is coming soon.</p></div>`}
  </section>`;
}
