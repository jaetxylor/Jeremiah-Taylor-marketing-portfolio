export const CARDS = [
 ['Hello, World','flower','A small hello. A whole new beginning.'],
 ['Morning Brew','coffee','The day starts after this cup.'],
 ['One More Chapter','book','Just one more page. Probably.'],
 ['Pack Day','pack','The best sound in the world: a fresh tear.'],
 ['Shutterbug','camera','Collecting little moments.'],
 ['Sunday Best','bible','A quiet moment for a grateful heart.'],
 ['Off the Clock','headphones','Headphones on. World off.'],
 ['Rain Check','umbrella','A little shelter from the Singapore rain.'],
 ['Snack Break','cookie','Five minutes. One very important biscuit.'],
 ['Game Night','controller','One last match turns into three.'],
 ['Flower Delivery','bouquet','A little blue for someone special.'],
 ['Late Night Notes','pencil','The good ideas arrive after midnight.'],
 ['Sunny Side','sun','A good day to be outside.'],
 ['Window Seat','plane','Always looking out the window.'],
 ['Home Ground','house','Every adventure starts somewhere.'],
 ['Slow Sunday','cloud','Nothing urgent. Everything peaceful.'],
 ['Training Day','dumbbell','One more rep. Then one more.'],
 ['Five Kilometres','shoe','Small steps add up.'],
 ['Fresh Kicks','shoe2','Ready for the next detour.'],
 ['Music Break','music','A soundtrack for the everyday.'],
 ['Birthday Wish','cake','Leave room for a little magic.'],
 ['Tiny Gardener','plant','Some things need time to grow.'],
 ['Lucky Find','magnifier','It was hiding in the last binder.'],
 ['Postcard Home','postcard','Wish you were here.'],
 ['The Builder','laptop','A thought becomes a thing.'],
 ['Storyteller','writing','There is always another story to tell.'],
 ['Bookworm','reading','Entire worlds between two covers.'],
 ['Moonlight Walk','moon','The city gets quieter. The mind follows.'],
 ['Campfire Tales','fire','Good company. Better stories.'],
 ['Mountain Air','mountain','The view was worth the climb.'],
 ['Beach Day','shell','Sand between the toes. No plans.'],
 ['Arcade Regular','arcade','Insert imagination. Press start.'],
 ['Night Market','lantern','A little corner that stays up late.'],
 ['Stargazer','telescope','There is more out there.'],
 ['The Collector','binder','Every empty space has a story ahead.'],
 ['Birthday Jester','balloons','Never too old for a silly hat.'],
 ['The Explorer','compass','Take the scenic route.'],
 ['Flower Knight','shield','Kindness is a kind of courage.'],
 ['Rocket Jae','rocket','Next stop: somewhere wonderful.'],
 ['Midnight Founder','laptop','One light still on in the city.'],
 ['Blue Bloom','bouquet','A whole garden in a single gesture.'],
 ['Neon Runner','shoe','Chasing the glow of the finish line.'],
 ['Ocean Dream','wave','Let the world move a little slower.'],
 ['Golden Hour','sun','Everything looks a little kinder here.'],
 ['Moon Guardian','moon','Keeping a small light in the dark.'],
 ['Dragon Festival','dragon','A little fire in the heart.'],
 ['Jae Prime','robot','More than meets the jester.'],
 ['Jae Prime: Roll Out','truck','Same heart. Alternate form.'],
 ['Celestial Jester','crown','Some stars only appear when you least expect them.'],
 ['Eternal Hydrangea','eternal','The rarest bloom in this little corner.']
].map(([name,art,quote],i)=>({id:i+1,name,art,quote,rarity:i<24?'common':i<38?'uncommon':i<46?'rare':i<48?'super':'secret'}));
export const LABELS={common:'Common',uncommon:'Uncommon',rare:'Rare',super:'Super rare',secret:'Secret rare'};
export const KEY='psrmalam-jae-packs-v1';
export function random(){ const v=new Uint32Array(1);crypto.getRandomValues(v);return v[0]/4294967296; }
function choose(rarity,rng,used){const pool=CARDS.filter(c=>c.rarity===rarity&&!used.has(c.id));const card=pool[Math.floor(rng()*pool.length)];used.add(card.id);return card.id;}
export function rollPack(rng=random){
 const used=new Set(),ids=[];
 for(let i=0;i<3;i++)ids.push(choose('common',rng,used));
 ids.push(choose('uncommon',rng,used));
 const r=rng();
 // One chase slot per pack: 0.05% secret, 0.5% super, 80% rare, 19.45% uncommon.
 ids.push(choose(r<.0005?'secret':r<.0055?'super':r<.8055?'rare':'uncommon',rng,used));
 return ids;
}
export const emptySave=()=>({version:1,counts:{},packs:0,last:[],revealed:0});
export function parseSave(raw){
 try {const s=JSON.parse(raw);if(s?.version!==1)return emptySave();
 const counts={};for(const c of CARDS){const n=s.counts?.[c.id];if(Number.isSafeInteger(n)&&n>0)counts[c.id]=n;}
 const last=Array.isArray(s.last)&&s.last.length===5&&s.last.every(id=>Number.isInteger(id)&&id>=1&&id<=50)?s.last:[];
 return {version:1,counts,packs:Number.isSafeInteger(s.packs)&&s.packs>=0?s.packs:0,last,revealed:last.length?Math.max(0,Math.min(5,Number.isInteger(s.revealed)?s.revealed:0)):0};
 }catch{return emptySave();}
}
export function addPack(save,ids){const counts={...save.counts};for(const id of ids)counts[id]=(counts[id]||0)+1;return {...save,counts,packs:save.packs+1,last:ids,revealed:0};}
