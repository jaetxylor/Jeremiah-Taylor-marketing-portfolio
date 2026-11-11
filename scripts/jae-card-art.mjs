// Extend the site's existing SVG mascot family, keeping the artwork crisp at card size.
import fs from 'node:fs';
import {CARDS} from '../assets/jae-packs-core.mjs';
import {sectionMascot} from './section-mascots.mjs';
const head=`<path d="M105 79Q85 54 65 61Q75 29 105 44Q121 18 160 19Q145 31 143 55Q178 60 181 88Q160 70 145 77" fill="none" stroke="#fa2724" stroke-width="8"/><g fill="#fa2724" stroke="none"><circle cx="65" cy="61" r="9"/><circle cx="160" cy="19" r="9"/><circle cx="181" cy="88" r="9"/></g><circle cx="115" cy="107" r="35" fill="white" stroke="#70b7ea" stroke-width="5"/><g fill="#0870b4" stroke="none"><ellipse cx="105" cy="108" rx="4" ry="5"/><ellipse cx="125" cy="108" rx="4" ry="5"/></g>`;
const flower=`<path d="M0 20V-13" stroke="#6bab48" stroke-width="5"/><path d="M0 -10C-15 -30 -28 -9 -12 -4C-32 9 -11 23 -4 9C1 32 22 17 12 4C34 2 22 -21 9 -11C17 -32 -8 -35 -8 -17Z" fill="#f7fbff" stroke="#268bd8" stroke-width="4"/>`;
const props={
 flower:`<g transform="translate(180 160)">${flower}</g>`,bouquet:`<g transform="translate(178 157)">${flower}<g transform="translate(17 -13) scale(.7)">${flower}</g><g transform="translate(-18 -13) scale(.7)">${flower}</g></g>`,
 coffee:'<path d="M159 149H199V185H159Z" fill="#f7e2ba"/><path d="M200 156Q226 153 212 174H200M167 138Q157 126 170 120M187 138Q177 126 190 120" fill="none"/>',
 book:'<path d="M153 147L180 153L207 147V188L180 194L153 188Z" fill="#8e7bb8"/><path d="M180 154V191M160 160L173 163M187 163L200 160"/>',
 bible:'<rect x="155" y="143" width="48" height="52" rx="4" fill="#203c68"/><path d="M178 152V177M168 161H188" stroke="#f7d477"/>',
 pack:'<path d="M156 137L202 143L197 196L151 190Z" fill="#a1c7f5"/><path d="M155 149L199 155M153 180L197 186"/><path d="M174 156L180 165L189 169L180 173L174 183L169 173L160 169L169 165Z" fill="#ffe19a"/>',
 camera:'<rect x="149" y="152" width="62" height="39" rx="7" fill="#334865"/><circle cx="180" cy="170" r="13" fill="#a9e8ff"/><path d="M157 151V143H175V151"/>',
 headphones:'<path d="M74 110V99Q72 60 115 60Q159 60 157 102V116" fill="none" stroke="#bd92ef" stroke-width="9"/><path d="M75 104V123M156 104V123" stroke="#334865" stroke-width="13"/>',
 umbrella:'<path d="M183 96V182Q183 203 168 191M133 105Q180 22 227 105Z" fill="#ed839a"/><path d="M133 105Q155 92 165 105Q180 92 195 105Q211 92 227 105" fill="none"/>',
 cookie:'<circle cx="180" cy="170" r="26" fill="#ddac6f"/><path d="M168 157H170M190 169H192M172 184H174M185 150H187M162 174H164" stroke="#6d4939" stroke-width="7"/>',
 controller:'<path d="M157 153Q183 148 207 155L214 185Q210 201 195 182H169Q148 202 149 184Z" fill="#b0a1e9"/><path d="M162 160V176M154 168H170M195 163H197M202 172H204"/>',
 pencil:'<path d="M164 190L180 139L190 143L174 194L161 201Z" fill="#efc86f"/><path d="M167 180L177 184"/>',
 sun:'<circle cx="183" cy="153" r="23" fill="#ffcd6c"/><path d="M183 116V109M183 197V190M146 153H139M220 153H227M157 127L152 122M209 179L214 184" stroke="#ffcd6c"/>',
 plane:'<path d="M142 154L173 161L198 136L208 140L188 169L211 180L204 188L180 181L163 196L156 191L165 176L141 162Z" fill="#d4e8f3"/>',
 house:'<path d="M150 162L181 135L212 162M157 158V194H205V158" fill="#eebba9"/><path d="M175 194V174H188V194" fill="#ffe3a1"/>',
 cloud:'<path d="M153 176C128 173 145 147 159 154C157 123 196 122 199 148C223 141 230 177 210 178Z" fill="#dceeff"/>',
 dumbbell:'<path d="M155 166H212" stroke="#66768e" stroke-width="9"/><path d="M153 149V183M165 151V181M201 151V181M213 149V183" stroke="#91a6be" stroke-width="10"/>',
 shoe:'<path d="M148 163L164 146L178 164L202 173Q216 180 210 191H148Z" fill="#99e3cf"/><path d="M149 183H211M173 163L181 158M180 170L188 165"/>',
 shoe2:'<path d="M150 149H173L182 169L207 178V193H147Z" fill="#f0b3bc"/><path d="M150 185H207M174 164H185M177 172H190"/>',
 music:'<path d="M174 178V133L211 125V169M175 144L211 136" fill="none" stroke="#b69aeb" stroke-width="7"/><ellipse cx="164" cy="180" rx="13" ry="9" fill="#b69aeb"/><ellipse cx="200" cy="172" rx="13" ry="9" fill="#b69aeb"/>',
 cake:'<path d="M151 161H210V193H151Z" fill="#eaa7bf"/><path d="M151 170Q163 181 175 170Q188 181 210 170" fill="none" stroke="#fff"/><path d="M180 162V142" stroke="#ffcd6c"/><path d="M180 140Q168 132 180 123Q192 132 180 140" fill="#ffcd6c"/>',
 plant:'<path d="M160 169H204L195 198H168Z" fill="#d49a7e"/><path d="M182 170V131M182 151Q153 151 155 128Q183 129 182 151M182 143Q208 143 207 119Q181 119 182 143" fill="#89c67d"/>',
 magnifier:'<circle cx="182" cy="150" r="23" fill="#c5efff"/><path d="M166 168L147 193" stroke="#d7ad78" stroke-width="9"/>',
 postcard:'<path d="M148 147H213V190H148Z" fill="#f6e9ce"/><path d="M182 153V183M188 171H205M188 180H201M202 154H208V162H202Z"/><path d="M154 177L163 161L175 177Z" fill="#90b7a0"/>',
 moon:'<path d="M199 120C147 115 143 184 195 191Q225 192 229 166C190 188 170 142 199 120Z" fill="#ffe5a6"/>',
 fire:'<path d="M165 188C137 164 181 144 176 119C206 146 221 174 200 188Z" fill="#ef9670"/><path d="M177 187Q161 173 187 151Q185 172 201 182Z" fill="#ffe5a6"/>',
 mountain:'<path d="M138 191L172 122L217 191Z" fill="#91b8ca"/><path d="M159 149L172 122L190 149L179 144L173 151L167 144Z" fill="#fff"/>',
 shell:'<path d="M183 192L147 160Q148 127 182 137Q216 127 217 160Z" fill="#e6adbe"/><path d="M183 190V140M183 190L159 145M183 190L205 145"/>',
 arcade:'<path d="M153 132H205L211 194H146Z" fill="#9d8bcc"/><path d="M159 141H199V166H159Z" fill="#283952"/><path d="M158 178V170M152 178H165M191 178H197" stroke="#a7f0dc"/>',
 lantern:'<path d="M181 113V134M181 185V207"/><ellipse cx="181" cy="160" rx="29" ry="29" fill="#e67b74"/><path d="M158 140H204M158 179H204M181 132V188" stroke="#fbd388"/>',
 telescope:'<path d="M155 155L200 129L210 149L166 172Z" fill="#af9de0"/><path d="M184 159V179L166 201M184 179L203 201"/>',
 binder:'<rect x="150" y="142" width="59" height="55" rx="5" fill="#c0a0d4"/><path d="M158 142V195M166 152H181V168H166ZM187 152H202V168H187ZM166 175H181V190H166ZM187 175H202V190H187Z" fill="#dbeaff"/>',
 balloons:'<path d="M178 191L164 132M178 191L202 120"/><ellipse cx="161" cy="117" rx="17" ry="22" fill="#ef9ab3"/><ellipse cx="203" cy="101" rx="18" ry="24" fill="#bbaff0"/>',
 compass:'<circle cx="182" cy="161" r="29" fill="#edcd8d"/><path d="M181 139L170 176L194 155Z" fill="#e48485"/>',
 shield:'<path d="M150 144L182 133L214 144V165Q211 190 182 201Q153 190 150 165Z" fill="#88a9d2"/><path d="M182 143V186M163 162H201" stroke="#e7d296"/>',
 wave:'<path d="M141 188Q159 172 180 183Q167 163 187 141Q208 121 220 150Q200 140 201 160Q214 175 222 188Z" fill="#7bcddd"/>',
 dragon:'<path d="M155 185Q211 205 211 160L199 135L213 114L188 123L167 113L175 143Q196 169 166 168L150 148L140 160Z" fill="#de9b78"/><path d="M192 138H194" stroke="#fff" stroke-width="7"/>',
 crown:'<path d="M66 68L62 37L91 49L115 22L138 49L168 37L163 68Z" fill="#e8c573"/><path d="M109 48L115 39L122 48L115 58Z" fill="#bca5ed"/>',
 eternal:`<g transform="translate(177 158) scale(1.35)">${flower}</g><circle cx="177" cy="147" r="44" fill="none" stroke="#e4c982" stroke-width="2"/>`
};
export function writeCardArt(out){fs.mkdirSync(out,{recursive:true});
 for(const c of CARDS){
 let figure;
 if(['laptop','writing','reading'].includes(c.art))figure=sectionMascot({laptop:'experience',writing:'blog',reading:'books'}[c.art]).match(/<svg[^>]*>([\s\S]*?)<\/svg>/)[1];
 else if(['robot','truck','rocket'].includes(c.art)){
   const file=c.art==='rocket'?'rocket':'optimus';let svg=fs.readFileSync(new URL(`../assets/hobby-characters/${file}-jae.svg`,import.meta.url),'utf8');
   if(c.art==='truck')svg=svg.replace('class="optimus-robot"','class="optimus-robot" opacity="0"').replace('class="optimus-truck" opacity="0"','class="optimus-truck" opacity="1"');
   figure=`<g transform="${c.art==='rocket'?'translate(8 55) scale(.88)':'translate(45 25) scale(1.12)'}">${svg.replace(/<svg[^>]*>/,'').replace('</svg>','')}</g>`;
 } else figure=`<g stroke="#70b7ea" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M98 138Q87 147 85 179L87 212Q99 227 113 199Q128 229 141 213L140 165Q139 146 131 138Z" fill="white"/><path d="M96 153Q75 165 68 188M135 153Q157 177 174 175" fill="none" stroke="#70b7ea" stroke-width="15"/><path d="M96 153Q75 165 68 188M135 153Q157 177 174 175" fill="none" stroke="white" stroke-width="7"/>${head}${props[c.art]||props.flower}</g>`;
 const hue=(c.id*27+190)%360;
 const special=['rare','super','secret'].includes(c.rarity);
 const sky=Array.from({length:special?22:7},(_,i)=>{const x=(i*73+c.id*11)%280+10,y=(i*41+c.id*7)%210+10;return `<path d="M${x-3} ${y}h6M${x} ${y-3}v6" stroke="#fff" opacity="${special?.55:.2}" stroke-width="1.5"/>`;}).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 290 250"><defs><linearGradient id="sky" x2="1" y2="1"><stop stop-color="hsl(${hue},${special?50:26}%,${special?22:29}%)"/><stop offset="1" stop-color="#172432"/></linearGradient><radialGradient id="halo"><stop stop-color="hsl(${hue},70%,72%)" stop-opacity=".45"/><stop offset="1" stop-color="hsl(${hue},70%,72%)" stop-opacity="0"/></radialGradient></defs><rect width="290" height="250" fill="url(#sky)"/><circle cx="145" cy="120" r="135" fill="url(#halo)"/>${sky}<circle cx="145" cy="128" r="90" fill="none" stroke="hsl(${hue},45%,70%)" opacity=".25"/><path d="M0 227Q80 203 160 226T290 220V250H0Z" fill="#13242d" opacity=".6"/>${figure}</svg>`;
 fs.writeFileSync(`${out}/${String(c.id).padStart(2,'0')}.svg`,svg);
 }
}
writeCardArt(new URL('../assets/jae-cards',import.meta.url).pathname);
