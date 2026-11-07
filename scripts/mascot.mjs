const head = `
 <path d="M105 79Q85 54 65 61Q75 29 105 44Q121 18 160 19Q145 31 143 55Q178 60 181 88Q160 70 145 77" fill="none" stroke="#fa2724" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
 <g fill="#fa2724"><circle cx="65" cy="61" r="9"/><circle cx="160" cy="19" r="9"/><circle cx="181" cy="88" r="9"/></g>
 <circle cx="115" cy="107" r="35" fill="#fff" stroke="#70b7ea" stroke-width="5"/>
 <g fill="#0870b4"><ellipse cx="105" cy="105" rx="4" ry="5"/><ellipse cx="125" cy="105" rx="4" ry="5"/></g>`;

const flowers = `
 <path d="M55 178L40 136" fill="none" stroke="#64ad24" stroke-width="7" stroke-linecap="round"/>
 <g fill="#fff" stroke="#087bdb" stroke-width="4">
  <path d="M36 116C19 99 14 122 26 129C5 126 12 149 28 143C25 161 45 157 44 142C60 152 67 130 50 128C64 115 45 102 36 116Z"/>
  <path d="M43 103C37 85 56 84 59 98C75 89 83 105 68 111C83 116 74 130 62 123C60 140 43 135 45 121C28 123 28 105 43 103Z"/>
 </g>`;

export const mascotMark = `<svg class="mascot-mark" viewBox="5 5 188 143" width="56" height="43" aria-hidden="true" focusable="false">${flowers}${head}</svg>`;

export const mascotStage = `<div class="mascot-stage" data-mascot>
 <button type="button" class="mascot-trigger" data-mascot-action="surprise" aria-label="Interact with Jae's mascot">
  <svg class="mascot-art" viewBox="0 0 286 252" width="384" height="338" aria-hidden="true" focusable="false">

   <g class="mascot-queen">
    <path d="M205 218V114Q231 94 259 114V218M200 173H266M207 218H265" fill="none" stroke="#ae784c" stroke-width="8" stroke-linecap="round"/>
    <path d="M217 150Q239 141 248 159L265 214H198Q202 185 217 150Z" fill="#a950c6" stroke="#dc91e9" stroke-width="4"/>
    <circle cx="231" cy="135" r="18" fill="#ffe1ac" stroke="#d69b4a" stroke-width="5"/>
    <path d="M214 121L209 102L220 109L230 96L241 109L253 102L247 121Z" fill="#f6cd68" stroke="#ad773a" stroke-width="3"/>
    <path d="M219 136h3m12 0h3" stroke="#653c47" stroke-width="3" stroke-linecap="round"/>
   </g>
   <g class="mascot-foreground">
   <path d="M28 229Q104 210 181 228" fill="none" stroke="#64ad24" stroke-width="7" stroke-linecap="round"/>
   <g class="mascot-performer">
    <path class="mascot-arm" d="M128 158Q158 150 172 130" fill="none" stroke="#70b7ea" stroke-width="17" stroke-linecap="round"/>
    <path class="mascot-arm" d="M128 158Q158 150 172 130" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/>
    <path d="M100 137Q86 155 62 157L64 171Q84 173 98 162Q91 207 101 218Q108 224 119 198Q128 226 139 216Q147 206 141 151L129 137Z" fill="#fff" stroke="#70b7ea" stroke-width="5" stroke-linejoin="round"/>
    <g class="mascot-bouquet">${flowers}<circle cx="56" cy="164" r="8" fill="#fff" stroke="#70b7ea" stroke-width="5"/></g>
    ${head}
   </g>
   </g>
  </svg>
 </button>
 <div class="mascot-actions" aria-label="Mascot actions">
  <button type="button" data-mascot-action="wave">Wave</button>
  <button type="button" data-mascot-action="flower">Ask for a flower</button>
 </div>
 <p class="mascot-reply" data-mascot-reply aria-live="polite"></p>
</div>`;
