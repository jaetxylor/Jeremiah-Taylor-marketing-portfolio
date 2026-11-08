// Keep the original link usable with JavaScript disabled or embeds blocked.
(async () => {
await window.psrContentReady;
document.querySelectorAll('[data-video-src]').forEach(container => {
  const button = container.querySelector('button');
  if (!button) return;
  let url;
  try { url = new URL(container.dataset.videoSrc); } catch { return; }
  const allowed = (url.origin === 'https://www.youtube-nocookie.com' && /^\/embed\/[\w-]{11}$/.test(url.pathname)) || (url.origin === 'https://www.tiktok.com' && /^\/player\/v1\/\d+$/.test(url.pathname));
  if (!allowed) return;
  container.hidden = false;
  button.hidden = false;
  button.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = url.href;
    frame.title = container.dataset.videoTitle;
    frame.allow = 'fullscreen; picture-in-picture; encrypted-media';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    container.replaceChildren(frame);
    frame.focus();
  }, {once:true});
});

})();
