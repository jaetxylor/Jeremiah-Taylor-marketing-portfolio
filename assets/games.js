(() => {
 const arcade=document.querySelector('[data-arcade]');
 if(arcade){
  const destinations={mousehunt:'mousehunt','mobile-legends':'mobile-legends','pokemon-go':'pokemon-go'};
  const legacy=Object.hasOwn(destinations,location.hash.slice(1))?destinations[location.hash.slice(1)]:null;
  if(legacy){location.replace(`/hobby/games/${legacy}/`);return;}
  const control=arcade.querySelector('[data-arcade-motion]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const setPaused=paused=>{
   arcade.dataset.motion=paused?'paused':'playing';
   control.setAttribute('aria-pressed',String(paused));
   control.textContent=paused?'Play animation':'Pause animation';
  };
  setPaused(reduced.matches);
  control.hidden=false;
  control.addEventListener('click',()=>setPaused(arcade.dataset.motion!=='paused'));
  reduced.addEventListener('change',event=>setPaused(event.matches));
 }
 const toolbar=document.querySelector('[data-dex-toolbar]');
 if(!toolbar)return;
 const buttons=[...toolbar.querySelectorAll('[data-dex-filter]')];
 const regions=[...document.querySelectorAll('[data-dex-state]')];
 const status=toolbar.querySelector('[data-dex-status]');
 toolbar.hidden=false;
 for(const button of buttons)button.addEventListener('click',()=>{
  const filter=button.dataset.dexFilter;
  for(const b of buttons)b.setAttribute('aria-pressed',String(b===button));
  let count=0;
  for(const region of regions){region.hidden=filter!=='all'&&region.dataset.dexState!==filter;if(!region.hidden)count++;}
  status.textContent=filter==='all'?`Showing all ${count} collections`:`Showing ${count} ${filter==='complete'?'complete':'in-progress'} collections`;
 });
})();
