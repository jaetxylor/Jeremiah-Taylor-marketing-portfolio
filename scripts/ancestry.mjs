export function renderAncestry() {
  return `<section class="wrap ancestry" id="ancestry">
    <div id="ancestry-lock" class="ancestry-lock">
      <div class="ancestry-art" aria-hidden="true"><img class="ancestry-generations" src="/assets/hobby-characters/ancestry-jae.svg" width="600" height="285" alt=""><span>Every branch holds a story.</span></div>
      <div class="ancestry-lock-copy"><p class="eyebrow">Hobby / Private family archive</p><h1>Ancestry.</h1><p class="ancestry-intro">The people, photographs and stories<br>that connect our generations.</p>
        <form id="ancestry-unlock"><label for="ancestry-password">Family password</label><div class="password-field"><input id="ancestry-password" type="password" autocomplete="current-password" autocapitalize="none" spellcheck="false" required aria-describedby="ancestry-status"><button type="button" id="ancestry-show" aria-label="Show password" aria-pressed="false">Show</button></div><button class="anc-button anc-primary" type="submit">Unlock the archive <span aria-hidden="true">↗</span></button><p id="ancestry-status" role="status" aria-live="polite"></p></form>
        <p class="ancestry-private-note">For family and invited visitors. The archive locks again when you leave or refresh this page.</p><noscript><p>JavaScript is needed to unlock and explore the encrypted archive.</p></noscript>
      </div>
    </div>
    <div id="ancestry-content" hidden></div>
    <dialog id="ancestry-viewer" aria-labelledby="ancestry-viewer-title"></dialog>
  </section>`;
}
