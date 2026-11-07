// The same blue-outline, red-jester-hat character used in mascot.mjs and the
// original hero pose sheet, articulated as SVG for small, crisp hand movements.
const ink = '#70b7ea';
const hat = `<g class="pose-hat" fill="none" stroke="#fa2724" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
  <path d="M105 79Q85 54 65 61Q75 29 105 44Q121 18 160 19Q145 31 143 55Q178 60 181 88Q160 70 145 77"/>
  <g fill="#fa2724" stroke="none"><circle cx="65" cy="61" r="9"/><circle cx="160" cy="19" r="9"/><circle cx="181" cy="88" r="9"/></g>
</g>`;
const face = `<circle cx="115" cy="107" r="35" fill="#fff" stroke="${ink}" stroke-width="5"/><g class="pose-eyes" fill="#0870b4"><ellipse cx="105" cy="105" rx="3.8" ry="4.8"/><ellipse cx="125" cy="105" rx="3.8" ry="4.8"/></g>`;
const head = `<g class="pose-head">${hat}${face}</g>`;
const flower = `<path d="M-5 -12C-16 -25 -25 -9 -15 -3C-32 -7 -32 12 -17 11C-25 27 -7 29 -3 15C4 32 20 18 12 9C30 15 33 -5 17 -6C29 -20 10 -29 5 -15C3 -32 -16 -29 -12 -14Z" fill="#fff" stroke="#087bdb" stroke-width="4.5" stroke-linejoin="round"/>`;
const vase = `<g class="pose-vase"><path d="M37 214C18 214 20 201 27 191Q33 182 29 176H43Q39 183 46 193C52 205 50 214 37 214ZM36 176V144" fill="none" stroke="#64ad24" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><g transform="translate(34 146) scale(.75)">${flower}</g><g transform="translate(46 134) scale(.68)">${flower}</g></g>`;
const ground = `<path d="M20 230Q139 207 267 230" fill="none" stroke="#64ad24" stroke-width="6" stroke-linecap="round"/>`;

const board = `${ground}
 <g class="pose-board" stroke="${ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M190 190L173 220M236 190L252 220"/><path d="M173 99Q173 94 179 94H266Q270 94 270 100L265 186Q265 191 260 191H169Q164 191 165 185Z" fill="#fff"/><path d="M221 109H241V129H221Z" fill="#fff3a4" stroke="#e8ae1b" stroke-width="4"/><path d="M199 147L187 168H211Z" fill="#0085ef" stroke="#0085ef" stroke-width="3"/><circle cx="239" cy="157" r="13" fill="#ff434a" stroke="none"/></g>
 <g transform="translate(-8 0)">
  <g fill="#fff" stroke="${ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
   <path d="M102 138Q85 145 71 166L62 181Q60 190 68 187L91 167L89 204Q87 219 94 219Q100 220 108 202Q113 221 120 219Q128 218 127 204L129 163Q145 168 156 160L151 146Q139 149 129 138Z"/>
  </g>
  <g class="pose-point-arm" stroke-linecap="round" stroke-linejoin="round">
   <path d="M154 155L183 125" stroke="#64ad24" stroke-width="7"/>
   <g transform="translate(187 124) scale(.7)">${flower}</g>
   <path d="M133 151Q145 162 157 153" fill="none" stroke="${ink}" stroke-width="19"/>
   <path d="M133 151Q145 162 157 153" fill="none" stroke="#fff" stroke-width="10"/>
   <circle cx="157" cy="153" r="8" fill="#fff" stroke="${ink}" stroke-width="4"/>
  </g>${head}
 </g>`;

const laptop = `${ground}${vase}
 <g transform="translate(49 0)">
  <path d="M97 139Q79 162 78 187L77 213H153L151 183Q151 157 129 139Z" fill="#fff" stroke="${ink}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M84 213L139 213L149 192H80Z" fill="#fff" stroke="${ink}" stroke-width="5" stroke-linejoin="round"/>
  <path class="pose-keys" d="M93 197H99M107 197H113M121 197H127M133 197H139" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>
  <g class="pose-type-left"><path d="M94 161Q86 173 91 182L103 184" fill="none" stroke="${ink}" stroke-width="17" stroke-linecap="round"/><path d="M94 161Q86 173 91 182L103 184" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/><ellipse cx="103" cy="184" rx="10" ry="8" fill="#fff" stroke="${ink}" stroke-width="4"/></g>
  <g class="pose-type-right"><path d="M133 160Q148 178 136 184L122 181" fill="none" stroke="${ink}" stroke-width="18" stroke-linecap="round"/><path d="M133 160Q148 178 136 184L122 181" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/><ellipse cx="121" cy="182" rx="10" ry="8" fill="#fff" stroke="${ink}" stroke-width="4"/></g>
  ${head}
 </g>
 <path d="M73 164Q71 159 77 159H115Q120 159 122 165L138 214H88Q82 214 81 208Z" fill="#fff" stroke="${ink}" stroke-width="5" stroke-linejoin="round"/>`;

const writing = `${ground}${vase}
 <g transform="translate(39 -7)">
  <path d="M97 139Q76 158 71 183L79 213H161L155 184Q146 153 129 138Z" fill="#fff" stroke="${ink}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M56 203Q75 185 111 207Q140 185 163 202L169 225Q145 218 113 230Q83 218 51 225Z" fill="#fff" stroke="#087bdb" stroke-width="5" stroke-linejoin="round"/>
  <path d="M111 207L106 221M62 214Q78 209 96 216M120 216Q139 209 157 214" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>
  <path class="pose-ink" d="M76 205L89 207M78 209L93 211" fill="none" stroke="#0870b4" stroke-width="2" stroke-linecap="round"/>
  <path d="M136 164Q153 181 145 187L129 185" fill="none" stroke="${ink}" stroke-width="19" stroke-linecap="round"/><path d="M136 164Q153 181 145 187L129 185" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/><ellipse cx="127" cy="187" rx="11" ry="8" fill="#fff" stroke="${ink}" stroke-width="4"/>
  <g class="pose-write-arm"><path d="M93 159Q83 171 75 184" fill="none" stroke="${ink}" stroke-width="18" stroke-linecap="round"/><path d="M93 159Q83 171 75 184" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M70 163L84 204" stroke="${ink}" stroke-width="10" stroke-linecap="round"/><path d="M70 163L84 204" stroke="#0870b4" stroke-width="5" stroke-linecap="round"/><ellipse cx="75" cy="186" rx="10" ry="11" fill="#fff" stroke="${ink}" stroke-width="4"/></g>
  ${head}
 </g>`;

const poses = {projects:['board',board],experience:['laptop',laptop],blog:['writing',writing]};
export function sectionMascot(section) {
 const pose = poses[section];
 if (!pose) return '';
 return `<div class="section-mascot" data-section-mascot="${pose[0]}"><svg class="section-mascot-art" viewBox="0 0 290 250" width="290" height="250" aria-hidden="true" focusable="false">${pose[1]}</svg><button class="section-mascot-toggle" type="button" aria-label="Pause character animation" title="Pause character animation" aria-pressed="false" hidden><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path class="mascot-pause-icon" d="M8 5V19M16 5V19" fill="none" stroke="currentColor" stroke-width="3"/><path class="mascot-play-icon" d="M8 5L19 12L8 19Z" fill="currentColor"/></svg></button></div>`;
}

export function addSectionMascot(body, section) {
 if (!poses[section]) return body;
 const pattern = section === 'experience'
   ? /(<(?:div|header)\b[^>]*class=")([^"]*\bsection-head(?:ing)?\b[^"]*)("[^>]*>)/
   : /(<header\b[^>]*class=")([^"]*\b(?:page-top|article-header)\b[^"]*)("[^>]*>)/;
 if (!pattern.test(body)) throw new Error(`Missing mascot heading for ${section}`);
 return body.replace(pattern,(_,start,classes,end)=>`${start}${classes} section-mascot-host${end}${sectionMascot(section)}`);
}
