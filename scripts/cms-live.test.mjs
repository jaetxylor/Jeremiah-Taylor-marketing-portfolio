import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../assets/cms-live.js',import.meta.url),'utf8');
function element(initial={}){
 const attrs=new Map(),events=new Map();
 return {...initial,children:[],setAttribute:(name,value)=>attrs.set(name,String(value)),getAttribute:name=>attrs.get(name),removeAttribute:name=>attrs.delete(name),addEventListener:(name,listener)=>events.set(name,listener),click:()=>events.get('click')?.(),append(...children){this.children.push(...children);}};
}
function setup(pathname,search='',reply={html:'<h1>Published</h1>'},{html='Static content',ok=true}={}){
 const target=element({innerHTML:html,outerHTML:html}),status=element({textContent:'Loading'}),timers=new Map();let request,reloads=0;
 target.querySelector=s=>s==='[data-cms-loading]'&&target.innerHTML.includes('data-cms-loading')?status:null;
 const context={window:{},location:{pathname,search,reload:()=>reloads++},URL,URLSearchParams,AbortController,setTimeout:(fn,ms)=>{timers.set(1,{fn,ms});return 1;},clearTimeout:id=>timers.delete(id),document:{title:'Original',querySelector:s=>s==='[data-cms-loading]'?target.querySelector(s):target,createElement:()=>element()},fetch:async(url,options)=>{request=String(url);if(reply instanceof Error)throw reply;if(typeof reply==='function')return reply(options);return {ok,json:async()=>reply};}};
 vm.runInNewContext(source,context);return {context,target,status,request:()=>request,reloads:()=>reloads,timers,expire:()=>{for(const {fn} of timers.values())fn();}};
}
const album={id:'124',name:'Canada',url:'/hobby/travelling/canada/',center:[-106,56],photos:[]};
test('new posts use their requested address and replace the fallback after loading',async()=>{const x=setup('/blog/read/','?post=a-new-note',{html:'<h1>A new note</h1>',title:'A new note'});assert.equal(x.target.innerHTML,'Static content');await x.context.window.psrContentReady;assert.match(x.request(),/view=post&slug=a-new-note/);assert.match(x.target.innerHTML,/A new note/);assert.equal(x.context.document.title,'A new note · psrmalam');});
test('travel hides stale empty content while waiting, then publishes data and markup before readiness',async()=>{
 let resolve;const reply=new Promise(done=>{resolve=done;});
 const x=setup('/hobby/travelling/','',()=>reply,{html:'0 photos · Album coming soon'});
 assert.match(x.target.innerHTML,/data-cms-loading/);assert.doesNotMatch(x.target.innerHTML,/0 photos|Album coming soon/);assert.equal(x.target.getAttribute('aria-busy'),'true');assert.equal(x.context.window.psrTravelAlbums,undefined);
 resolve({ok:true,json:async()=>({html:'<canvas data-travel-globe></canvas>',albums:[album]})});
 await x.context.window.psrContentReady;
 assert.equal(x.context.window.psrTravelAlbums[0].name,'Canada');assert.equal(x.target.innerHTML,'<canvas data-travel-globe></canvas>');assert.equal(x.target.getAttribute('aria-busy'),undefined);assert.equal(x.timers.size,0);
});
test('an existing travel loading shell retains its heading while waiting',async()=>{
 const html='<h1>Singapore</h1><div data-cms-loading>Loading this album…</div>';
 const x=setup('/hobby/travelling/singapore/','',{html:'<div>Published</div>'},{html});
 assert.equal(x.target.innerHTML,html);await x.context.window.psrContentReady;assert.equal(x.target.innerHTML,'<div>Published</div>');
});
test('a successful empty album remains an honest empty album',async()=>{
 const html='<div class="travel-album-empty"><h2>Been here. Loved it.</h2><p>The photos have not made it here yet.</p></div>';
 const x=setup('/hobby/travelling/thailand/','',{html,title:'Thailand'});await x.context.window.psrContentReady;
 assert.equal(x.target.innerHTML,html);assert.equal(x.status.children.length,0);assert.equal(x.target.getAttribute('aria-busy'),undefined);
});
test('album photos, native videos and viewer hooks are ready before dependent scripts run',async()=>{
 const html='<a data-travel-photo="0"><img src="/photo.jpg"></a><video controls src="/video.mp4"></video><dialog class="travel-lightbox"></dialog>';
 const x=setup('/hobby/travelling/album/','?country=singapore',{html});await x.context.window.psrContentReady;
 assert.match(x.request(),/view=album&slug=singapore/);assert.equal(x.target.innerHTML,html);
});
test('travel request failure shows an error and a full-page retry, with no stale empty result',async()=>{
 for(const pathname of ['/hobby/travelling/','/hobby/travelling/singapore/']){
  const x=setup(pathname,'',new Error('offline'),{html:'0 photos · Album coming soon'});await x.context.window.psrContentReady;
  assert.match(x.status.textContent,/could not load/);assert.equal(x.status.getAttribute('role'),'alert');assert.equal(x.status.getAttribute('data-cms-error'),'');assert.doesNotMatch(x.target.innerHTML,/0 photos|Album coming soon/);assert.equal(x.target.getAttribute('aria-busy'),undefined);
  assert.equal(x.status.children.length,1);const retry=x.status.children[0];assert.equal(retry.type,'button');assert.equal(retry.textContent,'Try again');retry.click();assert.equal(x.reloads(),1);
 }
});
test('a timed-out travel request settles readiness with an error and clears its timer',async()=>{
 const x=setup('/hobby/travelling/singapore/','',({signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted')))));
 assert.equal(x.timers.get(1).ms,7000);x.expire();await x.context.window.psrContentReady;
 assert.match(x.status.textContent,/could not load/);assert.equal(x.status.children.length,1);assert.equal(x.timers.size,0);assert.equal(x.target.getAttribute('aria-busy'),undefined);
});
test('malformed travel responses never replace the loader or publish unusable globe data',async()=>{
 for(const reply of [null,{html:''},{html:'   ',albums:[album]},{html:'<div>Broken</div>'},{html:'<div>Broken</div>',albums:[{id:'124',name:'Canada'}]},{html:'<div>Broken</div>',albums:[{...album,photos:[{src:'/photo.jpg'}]}]}]){
  const x=setup('/hobby/travelling/','',reply);await x.context.window.psrContentReady;
  assert.match(x.status.textContent,/could not load/);assert.match(x.target.innerHTML,/data-cms-loading/);assert.equal(x.context.window.psrTravelAlbums,undefined);
 }
 const x=setup('/hobby/travelling/singapore/','',{html:null});await x.context.window.psrContentReady;assert.match(x.status.textContent,/could not load/);
});
test('non-travel network failure preserves existing content and gives new-page readers a retry message',async()=>{
 const x=setup('/blog/read/','?post=note',new Error('offline'),{html:'<p data-cms-loading>Loading</p>'});await x.context.window.psrContentReady;assert.equal(x.target.innerHTML,'<p data-cms-loading>Loading</p>');assert.match(x.status.textContent,/refresh/);assert.equal(x.status.children.length,0);
 const y=setup('/blog/','',new Error('offline'));await y.context.window.psrContentReady;assert.equal(y.target.innerHTML,'Static content');
});
test('unrelated pages do not request or replace CMS content',async()=>{const x=setup('/hobby/ancestry/');await x.context.window.psrContentReady;assert.equal(x.request(),undefined);assert.equal(x.target.innerHTML,'Static content');});

test('published blog photos retain image and caption without open-photo actions',async()=>{const x=setup('/blog/read/','?post=note',{html:'<figure class="post-media post-photo"><a href="/photo"><img src="/photo" alt="Jae"></a><figcaption>My caption</figcaption><a class="post-media-link" href="/photo">Open photo</a></figure>'});await x.context.window.psrContentReady;assert.match(x.target.innerHTML,/<img/);assert.match(x.target.innerHTML,/My caption/);assert.doesNotMatch(x.target.innerHTML,/<a |Open photo/);});
