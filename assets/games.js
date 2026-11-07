(() => {
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
