import fs from 'node:fs';
import path from 'node:path';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Media is either a public HTTPS link or a file in the site's assets folder.
export function mediaURL(value, root) {
  if (typeof value !== 'string' || !value || value !== value.trim() || /[\s\\\u0000-\u001f]/.test(value)) throw new Error('Use an HTTPS media URL or an assets/ path');
  if (/^https:\/\//i.test(value)) {
    const url = new URL(value);
    if (!url.hostname || url.username || url.password || url.port) throw new Error('Invalid media URL');
    return url.href;
  }
  if (!/^\/?assets\//.test(value)) throw new Error('Local media must be inside assets/');
  const decoded = decodeURIComponent(value.replace(/^\//, ''));
  if (/[\\?#\u0000-\u001f]/.test(decoded) || decoded.split('/').some(part => !part || part === '.' || part === '..')) throw new Error('Invalid local media path');
  if (root && !fs.statSync(path.join(root, decoded), {throwIfNoEntry:false})?.isFile()) throw new Error(`Media file not found: ${value}`);
  return '/' + decoded.split('/').map(encodeURIComponent).join('/');
}

export function videoSource(src) {
  const url = new URL(src, 'https://local.invalid');
  const host = url.hostname;
  if (['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(host)) {
    const id = host === 'youtu.be' ? url.pathname.slice(1) : url.pathname === '/watch' ? url.searchParams.get('v') : url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)\/?$/)?.[1];
    if (/^[\w-]{11}$/.test(id || '')) return {kind:'embed', provider:'YouTube', portrait:url.pathname.startsWith('/shorts/'), src:`https://www.youtube-nocookie.com/embed/${id}?playsinline=1&autoplay=0`};
  }
  if (['www.tiktok.com','tiktok.com'].includes(host)) {
    const id = url.pathname.match(/^\/@[\w.]+\/video\/(\d+)\/?$/)?.[1] || url.pathname.match(/^\/player\/v1\/(\d+)\/?$/)?.[1];
    if (id) return {kind:'embed', provider:'TikTok', portrait:true, src:`https://www.tiktok.com/player/v1/${id}?autoplay=0`};
  }
  if (/\.(mp4|webm|ogv|mov|m4v)$/i.test(url.pathname)) return {kind:'file',src};
  return {kind:'link',src};
}

export function validateBlock(block, root) {
  if (!block || typeof block !== 'object') throw new Error('Invalid content block');
  const text = key => { if (typeof block[key] !== 'string' || !block[key].trim()) throw new Error(`Missing ${key} in ${block.type} block`); };
  for (const key of ['caption','title','alt']) if (block[key] !== undefined && typeof block[key] !== 'string') throw new Error(`Invalid ${key}`);
  switch (block.type) {
    case 'paragraph': case 'heading': case 'quote': text('text'); break;
    case 'list':
      if (!Array.isArray(block.items) || !block.items.every(item => typeof item === 'string')) throw new Error('List items must be text');
      break;
    case 'image': mediaURL(block.src, root); text('alt'); break;
    case 'video':
      mediaURL(block.src, root); text('title');
      if (block.poster !== undefined) mediaURL(block.poster, root);
      if (block.portrait !== undefined && typeof block.portrait !== 'boolean') throw new Error('portrait must be true or false');
      break;
    case 'link':
      text('text');
      if (!/^https:\/\//i.test(block.url || '')) throw new Error('Links must use HTTPS');
      mediaURL(block.url); break;
    default: throw new Error(`Unsupported content block: ${block.type}`);
  }
}

export function blockText(block) {
  return [block.text, ...(block.items || []), block.alt, block.title, block.caption].filter(Boolean).join(' ');
}

export function renderBlock(block) {
  if (block.type === 'paragraph') return `<p>${escape(block.text)}</p>`;
  if (block.type === 'heading') return `<h2>${escape(block.text)}</h2>`;
  if (block.type === 'quote') return `<blockquote><p>${escape(block.text)}</p></blockquote>`;
  if (block.type === 'list') return `<ul>${block.items.map(item => `<li>${escape(item)}</li>`).join('')}</ul>`;
  if (block.type === 'link') return `<p><a href="${escape(mediaURL(block.url))}" target="_blank" rel="noopener noreferrer">${escape(block.text)}</a></p>`;
  const src = mediaURL(block.src);
  const caption = block.caption ? `<figcaption>${escape(block.caption)}</figcaption>` : '';
  const link = (label) => `<a class="post-media-link" href="${escape(src)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  if (block.type === 'image') return `<figure class="post-media post-photo"><a href="${escape(src)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(`Open photo: ${block.alt}`)}"><img src="${escape(src)}" alt="${escape(block.alt)}" loading="lazy" decoding="async"></a>${caption}${link('Open photo')}</figure>`;
  const video = videoSource(src);
  const portrait = block.portrait ?? video.portrait;
  if (video.kind === 'file') return `<figure class="post-media${portrait?' post-media-portrait':''}"><video controls playsinline preload="none" src="${escape(src)}" aria-label="${escape(block.title)}"${block.poster?` poster="${escape(mediaURL(block.poster))}"`:''}>Your browser cannot play this video. ${link('Open video')}</video>${caption}${link('Open video')}</figure>`;
  if (video.kind === 'embed') return `<figure class="post-media${portrait?' post-media-portrait':''}"><div class="post-video-frame" hidden data-video-src="${escape(video.src)}" data-video-title="${escape(block.title)}"><button type="button" class="post-video-load" hidden>Load ${video.provider} video<span>${escape(block.title)}</span></button></div>${caption}${link(`Watch on ${video.provider}`)}</figure>`;
  return `<figure class="post-media post-video-link"><p>${escape(block.title)}</p>${link('Watch video')}${caption}</figure>`;
}
