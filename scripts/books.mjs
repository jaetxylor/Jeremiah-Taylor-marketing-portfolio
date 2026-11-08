const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function renderBooks(data) {
  if (!Number.isInteger(data.year) || !Array.isArray(data.books)) throw new Error('Invalid reading list');
  for (const book of data.books) {
    if (typeof book.title !== 'string' || !book.title.trim() || typeof book.author !== 'string' || !book.author.trim()) throw new Error('Books need a title and author');
  }
  return `<section class="wrap books-page"><header class="page-top"><p class="eyebrow">Hobby / Books / ${data.year}</p><h1>A year of<br><em>good reads.</em></h1><p class="intro">The books i read in ${data.year}, and the thoughts they leave behind.</p></header>
    ${data.books.length ? `<ol class="reading-list">${data.books.map((book, i) => `<li><span class="reading-number">${String(i + 1).padStart(2, '0')}</span><div><h2>${escape(book.title)}</h2><p class="reading-author">${escape(book.author)}</p>${book.notes ? `<p class="reading-note">${escape(book.notes)}</p>` : ''}</div></li>`).join('')}</ol>` : `<div class="reading-empty"><svg viewBox="0 0 100 76" width="100" height="76" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M50 19Q32 5 8 12V61Q31 55 50 68Q69 55 92 61V12Q68 5 50 19ZM50 19V68M20 25Q31 23 40 29M20 35Q31 33 40 39M60 29Q71 23 80 25M60 39Q71 33 80 35"/></svg><h2>Making room on the shelf.</h2><p>My ${data.year} reading list is coming soon.</p></div>`}
  </section>`;
}
