import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../assets/cms-live.js',import.meta.url),'utf8');
function setup(pathname,search='',reply={html:'<h1>Published</h1>'}){
 const target={innerHTML:'Static content',outerHTML:'Static content'},status={textContent:'Loading',setAttribute(){}};let request;
 const context={window:{},location:{pathname,search},URL,URLSearchParams,AbortController,setTimeout,clearTimeout,document:{title:'Original',querySelector:s=>s==='[data-cms-loading]'?status:target},fetch:async url=>{request=String(url);if(reply instanceof Error)throw reply;return {ok:true,json:async()=>reply}}};
 vm.runInNewContext(source,context);return {context,target,status,request:()=>request};
}
test('new posts use their requested address and replace the fallback after loading',async()=>{const x=setup('/blog/read/','?post=a-new-note',{html:'<h1>A new note</h1>',title:'A new note'});assert.equal(x.target.innerHTML,'Static content');await x.context.window.psrContentReady;assert.match(x.request(),/view=post&slug=a-new-note/);assert.match(x.target.innerHTML,/A new note/);assert.equal(x.context.document.title,'A new note · psrmalam');});
test('travel passes published destinations to the globe before scripts initialise',async()=>{const x=setup('/hobby/travelling/','',{html:'Updated globe',albums:[{id:'124',name:'Canada'}]});await x.context.window.psrContentReady;assert.equal(x.context.window.psrTravelAlbums[0].name,'Canada');assert.equal(x.target.innerHTML,'Updated globe');});
test('network failure preserves existing content and gives new-page readers a retry message',async()=>{const x=setup('/blog/read/','?post=note',new Error('offline'));await x.context.window.psrContentReady;assert.equal(x.target.innerHTML,'Static content');assert.match(x.status.textContent,/refresh/);});
test('unrelated pages do not request or replace CMS content',async()=>{const x=setup('/hobby/ancestry/');await x.context.window.psrContentReady;assert.equal(x.request(),undefined);assert.equal(x.target.innerHTML,'Static content');});

test('published blog photos retain image and caption without open-photo actions',async()=>{const x=setup('/blog/read/','?post=note',{html:'<figure class="post-media post-photo"><a href="/photo"><img src="/photo" alt="Jae"></a><figcaption>My caption</figcaption><a class="post-media-link" href="/photo">Open photo</a></figure>'});await x.context.window.psrContentReady;assert.match(x.target.innerHTML,/<img/);assert.match(x.target.innerHTML,/My caption/);assert.doesNotMatch(x.target.innerHTML,/<a |Open photo/);});
