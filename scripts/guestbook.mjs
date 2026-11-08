import { mascotMark } from './mascot.mjs';

export function renderGuestbook() {
  return `<section class="wrap guestbook-intro"><p class="eyebrow">A little hello, kept here</p><h1>The guest book.</h1><p class="intro">You were here. Leave your name, a memory or a little nonsense.<br>i would love to hear from you.</p><div class="guestbook-intro-links"><a class="text-link" href="#sign-book">Sign the book</a></div></section>
<section class="wrap book-section" aria-label="Read the guest book" data-guestbook data-api="https://psrmalam-guestbook.jaetxylor.chatgpt.site">
  <div class="book-stage" tabindex="0" aria-label="Guest book. Use the left and right arrow keys to turn pages.">
    <div class="guest-book is-closed">
      <div class="book-pages" aria-live="polite"><article class="book-page"></article><article class="book-page"></article></div>
      <button class="book-cover" type="button" aria-label="Open the guest book"><span class="cover-top">PSRMALAM</span><span class="cover-title">The<br>guest book</span><span class="cover-mascot" aria-hidden="true">${mascotMark}</span><span class="cover-bottom">Little notes from people who stopped by.<br><strong>Open the book</strong></span></button>
      <div class="turning-page" aria-hidden="true"></div>
    </div>
  </div>
  <div class="book-controls"><button type="button" data-book-prev disabled>Previous page</button><p data-book-position role="status">The cover</p><button type="button" data-book-next>Open book</button></div>
  <p class="book-help">Turn a page with the buttons, arrow keys or a swipe.</p>
  <div class="book-feedback"><p data-book-status role="status"></p><button type="button" data-book-retry hidden>Try again</button></div>
  <noscript><p>Turn on JavaScript to open the book and leave a message.</p></noscript>
</section>
<section class="wrap sign-book" id="sign-book"><div><p class="eyebrow">Make yourself at home</p><h2>Leave a little<br><em>something.</em></h2><p>Just your name and a note. Messages appear in the book after i approve them.</p></div>
  <form class="guestbook-form"><label for="guest-name">Your name</label><input id="guest-name" name="name" autocomplete="name" maxlength="60" required placeholder="What should i call you?">
  <label for="guest-message">Your message</label><textarea id="guest-message" name="message" maxlength="600" rows="6" required placeholder="A hello, a memory, a recommendation…"></textarea><p class="message-count"><span data-message-count>0</span> / 600</p>
  <div class="guestbook-trap" aria-hidden="true"><label for="guest-website">Leave this field empty</label><input id="guest-website" name="website" tabindex="-1" autocomplete="off"></div>
  <button class="button guestbook-submit" type="submit">Leave my note</button><p class="form-status" role="status" aria-live="polite"></p></form>
</section>`;
}
