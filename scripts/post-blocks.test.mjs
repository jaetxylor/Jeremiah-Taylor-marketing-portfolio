import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mediaURL, videoSource, validateBlock, renderBlock, blockText} from './post-blocks.mjs';

test('media URLs reject executable schemes, mixed content and asset traversal', () => {
  for (const src of ['javascript:alert(1)','data:text/html,hi','http://example.com/pic.jpg','//example.com/pic.jpg','/assets/../private.txt','assets/%2e%2e/private.txt','assets/%5cprivate.txt','https://user:pass@example.com/a',' https://example.com/a','https://example.com/\nfile']) assert.throws(() => mediaURL(src), src);
  assert.equal(mediaURL('assets/blog/my%20photo.jpg'),'/assets/blog/my%20photo.jpg');
  assert.equal(mediaURL('https://images.example.com/photo?token=a&size=large'),'https://images.example.com/photo?token=a&size=large');
});

test('local assets must exist and media descriptions are required', () => {
  assert.throws(() => validateBlock({type:'image',src:'assets/missing.jpg',alt:'Missing'},process.cwd()));
  validateBlock({type:'image',src:'assets/IMG_1170_VSCO.jpeg',alt:'Jae'},process.cwd());
  assert.throws(() => validateBlock({type:'image',src:'https://example.com/a.jpg'}));
  assert.throws(() => validateBlock({type:'video',src:'https://example.com/a.mp4'}));
  assert.throws(() => validateBlock({type:'list',items:[{text:'HTML'}]}));
});

test('YouTube and TikTok links resolve only exact allowed hosts and valid IDs', () => {
  for (const src of ['https://youtu.be/M7lc1UVf-VE','https://www.youtube.com/watch?v=M7lc1UVf-VE&autoplay=1','https://www.youtube.com/shorts/M7lc1UVf-VE']) {
    const result=videoSource(src);
    assert.equal(result.provider,'YouTube');
    assert.equal(result.src,'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?playsinline=1&autoplay=0');
  }
  assert.equal(videoSource('https://www.youtube.com/shorts/M7lc1UVf-VE').portrait,true);
  assert.equal(videoSource('https://www.tiktok.com/@scout2015/video/6718335390845095173').provider,'TikTok');
  for (const src of ['https://youtube.com.evil.example/watch?v=M7lc1UVf-VE','https://youtu.be/bad','https://vm.tiktok.com/short-link','https://www.instagram.com/reel/example/']) assert.equal(videoSource(src).kind,'link');
  assert.equal(videoSource('/assets/clip.mp4').kind,'file');
  assert.equal(videoSource('https://cdn.example.com/clip.webm?signature=123').kind,'file');
});

test('photos and video metadata are escaped and fallback links always remain', () => {
  const html=renderBlock({type:'image',src:'https://example.com/image.jpg?a=1&b=2',alt:'A "photo"',caption:'<script>alert(1)</script>'});
  assert.match(html,/alt="A &quot;photo&quot;"/);
  assert.match(html,/&lt;script&gt;/);
  assert.doesNotMatch(html,/<script>/);
  assert.match(html,/Open photo/);
  const clip=renderBlock({type:'video',src:'https://example.com/clip.mp4',title:'My video',poster:'https://example.com/poster.jpg'});
  assert.match(clip,/<video controls playsinline preload="none"/);
  assert.match(clip,/Open video/);
  const embed=renderBlock({type:'video',src:'https://youtu.be/M7lc1UVf-VE',title:'My video'});
  assert.match(embed,/Watch on YouTube/);
  assert.doesNotMatch(embed,/<iframe/);
  const fallback=renderBlock({type:'video',src:'https://vm.tiktok.com/abc',title:'A shared clip'});
  assert.match(fallback,/Watch video/);
  assert.doesNotMatch(fallback,/data-video-src/);
});

test('media remains searchable and text posts keep rendering', () => {
  assert.equal(blockText({type:'image',alt:'Charizard',caption:'My childhood collection'}),'Charizard My childhood collection');
  assert.equal(blockText({type:'video',title:'A run',caption:'Marathon training'}),'A run Marathon training');
  assert.equal(renderBlock({type:'paragraph',text:'Hello <world>'}),'<p>Hello &lt;world&gt;</p>');
  assert.equal(renderBlock({type:'list',items:['One','Two']}),'<ul><li>One</li><li>Two</li></ul>');
  validateBlock({type:'link',url:'https://example.com',text:'Photo album'});
  assert.match(renderBlock({type:'link',url:'https://example.com',text:'Photo album'}),/Photo album/);
});
