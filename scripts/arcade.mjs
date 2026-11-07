const games = [
 ['mousehunt', 'MouseHunt', 'mousehunt-icon.jpg'],
 ['mobile-legends', 'Mobile Legends', 'mobile-legends-icon.jpg'],
 ['pokemon-go', 'Pokémon GO', 'pokemon-go-icon.jpg']
];

export function renderArcade() {
 return `<div class="wrap games-page arcade-page" data-arcade>
 <div class="arcade-layout">
  <header class="arcade-intro"><p class="eyebrow">Hobby / Player one</p><h1>Welcome to <br><em>my arcade.</em></h1><p>A long-running hunt. A Cecilion main.<br>A Pokédex that is never quite finished.</p><p class="arcade-instruction"><span aria-hidden="true">↗</span> Pick a game on the screen<br>to see my stats and collection.</p><button class="arcade-motion" type="button" data-arcade-motion aria-pressed="false" hidden>Pause animation</button></header>
  <div class="arcade-scene">
   <svg class="arcade-cabinet" viewBox="0 0 720 760" role="img" aria-label="Jae’s cartoon character, seen from behind in his red jester hat, playing at an arcade machine." focusable="false">
    <defs>
     <linearGradient id="arcade-shell" x2=".8" y2="1"><stop stop-color="#434b53"/><stop offset="1" stop-color="#20272d"/></linearGradient>
     <linearGradient id="arcade-screen" x2="0" y2="1"><stop stop-color="#172c2c"/><stop offset="1" stop-color="#0e191b"/></linearGradient>
     <linearGradient id="arcade-deck" x2="0" y2="1"><stop stop-color="#8dbec7"/><stop offset="1" stop-color="#4c808e"/></linearGradient>
     <radialGradient id="arcade-halo"><stop stop-color="#71b6bc" stop-opacity=".15"/><stop offset="1" stop-color="#71b6bc" stop-opacity="0"/></radialGradient>
    </defs>
    <ellipse cx="365" cy="360" rx="350" ry="350" fill="url(#arcade-halo)"/>
    <ellipse cx="372" cy="704" rx="259" ry="27" fill="#161819"/>
    <g stroke="#101719" stroke-width="5" stroke-linejoin="round">
     <path d="M594 42L634 68V387L662 454L627 487L610 690H565V65Z" fill="#171d22"/>
     <path d="M127 42H594Q607 42 607 56V385L636 446V479H593L580 690H150L137 479H98V446L126 385V55Q126 42 139 42Z" fill="url(#arcade-shell)"/>
     <path d="M126 62H607V125H126Z" fill="#f0e7cf"/>
     <path d="M136 133V382M598 133V382" fill="none" stroke="#cf665b" stroke-width="6"/>
     <rect x="144" y="141" width="445" height="245" rx="22" fill="#0c1215"/>
     <rect x="157" y="154" width="419" height="218" rx="15" fill="url(#arcade-screen)" stroke="#6c9e9e" stroke-width="2"/>
     <path d="M126 391H607L636 446H98Z" fill="url(#arcade-deck)"/>
     <path d="M98 446H636V479H98Z" fill="#d8d0bc"/>
     <path d="M150 487H585L575 680H160Z" fill="#252c32"/>
     <path d="M155 548L239 668H277L154 492Z" fill="#cf665b" stroke="none"/>
     <path d="M172 490L295 668H320L196 490Z" fill="#8dbec7" stroke="none"/>
     <path d="M151 679H580V697H151Z" fill="#131a20"/>
     <rect x="484" y="510" width="55" height="80" rx="7" fill="#141c21" stroke="#4e5a60" stroke-width="2"/>
     <rect x="500" y="523" width="22" height="6" rx="2" fill="#d4d7c9" stroke="none"/>
     <rect x="499" y="552" width="24" height="23" rx="3" fill="#cf665b" stroke="none"/>
     <g stroke="#5d6a70" stroke-width="3"><path d="M479 622H545M479 632H545M479 642H545"/></g>
     <ellipse cx="451" cy="438" rx="28" ry="10" fill="#253c47" stroke-width="2"/>
     <ellipse cx="210" cy="426" rx="15" ry="8" fill="#cf665b" stroke-width="2"/>
     <ellipse cx="251" cy="417" rx="15" ry="8" fill="#e0ba70" stroke-width="2"/>
     <ellipse cx="245" cy="440" rx="15" ry="8" fill="#8eabd8" stroke-width="2"/>
    </g>
    <g fill="#263038" text-anchor="middle" font-family="ui-monospace,monospace"><text x="366" y="102" font-size="31" font-weight="700" letter-spacing="5">JAE’S ARCADE</text></g>
    <g fill="#d7decf" font-family="ui-monospace,monospace" font-size="10" letter-spacing="2"><text x="496" y="410">1 PLAYER</text><text x="479" y="610">FREE PLAY</text></g>
    <g class="arcade-player" stroke="#70b7ea" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
     <ellipse cx="302" cy="704" rx="75" ry="14" fill="#101719" stroke="none"/>
     <path d="M278 617Q264 658 266 690Q278 708 296 691L306 644L314 693Q332 710 344 693L334 615Z" fill="#edf5f4"/>
     <path d="M326 551Q365 563 391 501" fill="none" stroke-width="21"/>
     <path d="M326 551Q365 563 391 501" fill="none" stroke="#fff" stroke-width="12"/>
     <g class="arcade-left-arm"><path d="M276 548Q235 525 217 431" fill="none" stroke-width="21"/><path d="M276 548Q235 525 217 431" fill="none" stroke="#fff" stroke-width="12"/><ellipse cx="214" cy="430" rx="12" ry="8" fill="#fff"/></g>
     <path d="M280 520Q265 546 270 583L263 626Q301 644 343 626L336 584Q341 547 321 520Z" fill="#fff"/>
     <path d="M275 619Q305 632 335 620" fill="none" stroke="#deedef" stroke-width="4"/>
     <g class="arcade-grip">
      <path d="M451 438L445 409" stroke="#ccd8d6" stroke-width="9"/>
      <circle cx="445" cy="406" r="16" fill="#f34d47" stroke="#872c2b" stroke-width="3"/>
      <ellipse cx="440" cy="401" rx="5" ry="4" fill="#ffb1a0" stroke="none"/>
      <path d="M391 501Q422 471 443 421" fill="none" stroke-width="21"/>
      <path d="M391 501Q422 471 443 421" fill="none" stroke="#fff" stroke-width="12"/>
      <ellipse cx="443" cy="420" rx="12" ry="8" fill="#fff"/>
     </g>
     <circle cx="302" cy="481" r="46" fill="#fff"/>
     <path d="M331 452Q351 481 328 510" fill="none" stroke="#deedef" stroke-width="5"/>
     <g class="arcade-hat" stroke="#fa2724" stroke-width="9" fill="none"><path d="M276 446Q251 421 226 430Q242 387 280 408Q303 375 351 379Q330 395 333 425Q374 429 384 462Q358 443 333 450"/><g fill="#fa2724" stroke="none"><circle cx="226" cy="430" r="10"/><circle cx="351" cy="379" r="10"/><circle cx="384" cy="462" r="10"/></g></g>
    </g>
   </svg>
   <nav class="arcade-screen" aria-label="Choose a game"><p>SELECT A GAME</p><div class="arcade-options">${games.map(([slug,name,icon])=>`<a class="arcade-game" href="/hobby/games/${slug}/"><img src="/assets/games/${icon}" width="80" height="80" alt=""><span>${name}</span></a>`).join('')}</div><span class="arcade-ready"><i aria-hidden="true"></i> Ready when you are</span></nav>
  </div>
 </div>
 </div>`;
}
