export function renderAncestry() {
  return `<section class="wrap ancestry" id="ancestry">
    <div id="ancestry-lock" class="ancestry-lock">
      <div class="ancestry-art" aria-hidden="true"><svg viewBox="0 0 440 300"><path d="M220 282V150M220 220L100 134M220 188L344 96M100 134V70M100 134L37 93M344 96V37M344 96L408 61M220 150L190 92M220 150L270 72"/><circle cx="100" cy="58" r="15"/><circle cx="26" cy="85" r="12"/><circle cx="183" cy="79" r="12"/><circle cx="277" cy="60" r="14"/><circle cx="344" cy="23" r="13"/><circle cx="416" cy="53" r="11"/><path class="roots" d="M220 263l-46 27m46-14 43 17m-43-16-10 20"/></svg><span>Every branch holds a story.</span></div>
      <div class="ancestry-lock-copy"><p class="eyebrow">Hobby / Private family archive</p><h1>Ancestry.</h1><p class="ancestry-intro">The people, photographs and stories<br>that connect our generations.</p>
        <form id="ancestry-unlock"><label for="ancestry-password">Family password</label><div class="password-field"><input id="ancestry-password" type="password" autocomplete="current-password" autocapitalize="none" spellcheck="false" required aria-describedby="ancestry-status"><button type="button" id="ancestry-show" aria-label="Show password" aria-pressed="false">Show</button></div><button class="anc-button anc-primary" type="submit">Unlock the archive <span aria-hidden="true">↗</span></button><p id="ancestry-status" role="status" aria-live="polite"></p></form>
        <p class="ancestry-private-note">For family and invited visitors. The archive locks again when you leave or refresh this page.</p><noscript><p>JavaScript is needed to unlock and explore the encrypted archive.</p></noscript>
      </div>
    </div>
    <div id="ancestry-content" hidden></div>
    <dialog id="ancestry-viewer" aria-labelledby="ancestry-viewer-title"></dialog>
  </section>`;
}
