const head = `
 <path d="M105 79Q85 54 65 61Q75 29 105 44Q121 18 160 19Q145 31 143 55Q178 60 181 88Q160 70 145 77" fill="none" stroke="#fa2724" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
 <g fill="#fa2724"><circle cx="65" cy="61" r="9"/><circle cx="160" cy="19" r="9"/><circle cx="181" cy="88" r="9"/></g>
 <circle cx="115" cy="107" r="35" fill="#fff" stroke="#70b7ea" stroke-width="5"/>
 <g fill="#0870b4"><ellipse cx="105" cy="105" rx="4" ry="5"/><ellipse cx="125" cy="105" rx="4" ry="5"/></g>`;

export { head as mascotHead };

const flowers = `
 <path d="M55 178L40 136" fill="none" stroke="#64ad24" stroke-width="7" stroke-linecap="round"/>
 <g fill="#fff" stroke="#087bdb" stroke-width="4">
  <path d="M36 116C19 99 14 122 26 129C5 126 12 149 28 143C25 161 45 157 44 142C60 152 67 130 50 128C64 115 45 102 36 116Z"/>
  <path d="M43 103C37 85 56 84 59 98C75 89 83 105 68 111C83 116 74 130 62 123C60 140 43 135 45 121C28 123 28 105 43 103Z"/>
 </g>`;

export const mascotMark = `<svg class="mascot-mark" viewBox="5 5 188 143" width="56" height="43" aria-hidden="true" focusable="false">${flowers}${head}</svg>`;

export const mascotPeek = `<span class="mascot-peek" aria-hidden="true">
 <svg viewBox="0 0 140 126" width="140" height="126" focusable="false">
  <g stroke="#101719" stroke-width="3" stroke-linejoin="round">
   <path d="M48 76C27 61 18 26 20 6C43 21 60 46 58 72Z" fill="#30383e"/>
   <path d="M82 72C80 46 97 21 120 6C122 26 113 61 92 76Z" fill="#30383e"/>
   <path d="M26 37Q36 39 44 30L51 41Q43 52 32 51Z" fill="#efce77" stroke="none"/>
   <path d="M96 30Q104 39 114 37L108 51Q97 52 89 41Z" fill="#efce77" stroke="none"/>
  </g>
  <circle cx="70" cy="85" r="33" fill="#fff" stroke="#70b7ea" stroke-width="5"/>
  <g fill="#0870b4"><ellipse cx="60" cy="86" rx="3.6" ry="4.5"/><ellipse cx="80" cy="86" rx="3.6" ry="4.5"/></g>
  <path d="M65 100Q70 104 75 100" fill="none" stroke="#0870b4" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M35 121H105" stroke="#70b7ea" stroke-width="5"/>
  <g fill="#fff" stroke="#70b7ea" stroke-width="4"><ellipse cx="42" cy="117" rx="10" ry="7"/><ellipse cx="98" cy="117" rx="10" ry="7"/></g>
 </svg>
</span>`;

export const mascotStage = `<div class="mascot-stage" data-mascot>
 <button type="button" class="mascot-trigger" data-mascot-action="surprise" aria-label="Interact with Jae's mascot">
  <svg class="mascot-art" viewBox="0 0 286 252" width="384" height="338" aria-hidden="true" focusable="false">
   <defs>
    <filter id="mascot-skin-outline" x="-20%" y="-30%" width="140%" height="160%" color-interpolation-filters="sRGB">
     <feMorphology in="SourceAlpha" operator="dilate" radius="2.5" result="outline"/>
     <feFlood flood-color="#70b7ea"/>
     <feComposite in2="outline" operator="in"/>
     <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
   </defs>

   <g class="mascot-queen">
    <path d="M205 218V114Q231 94 259 114V218M200 173H266M207 218H265" fill="none" stroke="#ae784c" stroke-width="8" stroke-linecap="round"/>
    <g class="queen-long-hair" stroke="#b67a35" stroke-width="2.5" stroke-linejoin="round">
     <path d="M211 126Q209 111 230 111Q253 109 253 134C251 147 261 153 255 165Q253 172 258 180Q247 184 241 174L218 176Q210 185 205 177C211 168 203 163 208 152Q213 141 211 126Z" fill="#e7b45f"/>
     <path d="M215 143C209 153 218 158 212 169M247 142C254 154 244 160 251 174" fill="none" stroke="#ffda8d" stroke-width="2.5" stroke-linecap="round"/>
    </g>
    <g class="queen-gown" stroke-linejoin="round">
     <path d="M222 174Q213 180 209 192L199 212Q230 220 265 212L254 192Q250 180 241 174Z" fill="#ae6ac8" stroke="#df9dea" stroke-width="3"/>
     <path d="M227 178Q220 191 216 214Q232 217 249 214Q240 192 237 178Z" fill="#e6b3ec"/>
     <path d="M222 175Q213 187 204 198Q215 198 229 180M241 175Q251 187 260 199Q248 197 234 180" fill="#814499" stroke="#ca83db" stroke-width="2"/>
     <path d="M223 184Q215 202 212 211M240 184Q248 202 252 211M232 190V213" fill="none" stroke="#c98bdb" stroke-width="1.5" stroke-linecap="round"/>
     <path d="M218 153Q224 150 230 154Q237 150 244 154L240 176Q231 181 222 176Z" fill="#9950b8" stroke="#df9dea" stroke-width="3"/>
     <path d="M220 154Q225 161 231 157Q237 161 242 154" fill="none" stroke="#f5d28a" stroke-width="2"/>
     <path d="M219 154Q210 152 212 163L218 166L223 157M243 154Q252 152 251 163L245 166L240 157" fill="#dca1e7" stroke="#ae6ac8" stroke-width="2"/>
     <path d="M215 165Q215 173 225 174M248 165Q248 173 238 174" fill="none" stroke="#ffe1ac" stroke-width="4" stroke-linecap="round"/>
     <path d="M222 176Q231 180 240 176" fill="none" stroke="#f6cd68" stroke-width="2.5"/>
     <path d="M231 173L234 177L231 181L228 177Z" fill="#f9e5a5"/>
     <path d="M202 212Q231 218 262 212" fill="none" stroke="#f5d28a" stroke-width="1.5" stroke-linecap="round"/>
    </g>
    <circle cx="231" cy="135" r="17.5" fill="#ffe1ac" stroke="#d69b4a" stroke-width="2"/>
    <path d="M211 132Q210 116 230 115Q251 114 252 134Q245 132 241 123Q230 132 215 130L214 144Q208 140 211 132Z" fill="#e7b45f" stroke="#b67a35" stroke-width="2" stroke-linejoin="round"/>
    <path d="M219 124Q229 122 233 119" fill="none" stroke="#ffda8d" stroke-width="2" stroke-linecap="round"/>
    <path d="M214 121L209 102L220 109L230 96L241 109L253 102L247 121Z" fill="#f6cd68" stroke="#ad773a" stroke-width="3"/>
    <path d="M230 106L233 111L230 116L227 111Z" fill="#a950c6"/>
    <path d="M219 136h3m12 0h3" stroke="#653c47" stroke-width="3" stroke-linecap="round"/>
    <path d="M226 143Q230 146 234 143" fill="none" stroke="#b76d6a" stroke-width="1.5" stroke-linecap="round"/>
   </g>
   <g class="mascot-foreground">
   <path d="M28 229Q104 210 181 228" fill="none" stroke="#64ad24" stroke-width="7" stroke-linecap="round"/>
   <g class="mascot-performer">
    <g class="mascot-flower-arm">${flowers}</g>
    <g filter="url(#mascot-skin-outline)" fill="#fff">
     <g class="mascot-arm">
      <path d="M128 158Q158 150 172 130" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
     </g>
     <g class="mascot-flower-arm">
      <path d="M102 147Q83 167 56 164" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round"/>
      <circle cx="56" cy="164" r="8"/>
     </g>
     <path d="M101 136C95 149 96 160 97 174C92 202 95 214 102 218C109 221 115 208 119 198C127 222 134 223 140 216C146 207 144 183 142 164C140 149 136 141 129 137Z"/>
    </g>
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
