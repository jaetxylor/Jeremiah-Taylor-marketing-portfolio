(async()=>{
 await window.psrContentReady;
 if(!/^\/hobby\/(?:ex-collection\/)?(?:index\.html)?$/.test(location.pathname))return;
 let mascot=document.querySelector('.mascot-peek');
 if(!mascot && document.querySelector('.ex-heading')){
   mascot=document.createElement('span');mascot.className='jp-collection-mascot';
   mascot.innerHTML='<img src="/assets/jae-cards/04.svg" alt="" width="126" height="126">';
   document.querySelector('.ex-heading').append(mascot);
 }
 if(!mascot)return;
 const button=document.createElement('button');button.type='button';button.className=mascot.className+' jp-entry';
 button.setAttribute('aria-label','A little surprise from Jae');button.setAttribute('aria-haspopup','dialog');button.innerHTML=mascot.innerHTML;
 mascot.replaceWith(button);let game;
 button.addEventListener('click',async()=>{
   button.disabled=true;
   try{game ||= await import('/assets/jae-packs.mjs?v=2');game.openGame(button);}
   catch{button.setAttribute('aria-label','Could not open the surprise. Tap to retry.');}
   finally{button.disabled=false;}
 });
})();
