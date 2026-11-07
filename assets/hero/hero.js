(() => {
  const video = document.querySelector('[data-intro-video]');
  if (!video) return;
  const note = document.querySelector('[data-intro-note]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compact = window.matchMedia('(max-width: 640px)').matches;
  const src = compact ? video.dataset.mobileSrc : video.dataset.wideSrc;
  video.poster = compact ? video.dataset.mobilePoster : video.dataset.widePoster;
  let wantsPlayback = !reduced.matches && !navigator.connection?.saveData;
  let inView = true;
  let failed = false;
  const update = () => {
    const action = video.paused ? 'Play' : 'Pause';
    video.setAttribute('aria-label', action + ' the silent, captioned site introduction');
  };
  async function play() {
    if (failed || !inView || document.hidden) return;
    if (!video.getAttribute('src')) video.src = src;
    try { await video.play(); } catch { /* Visitors can tap the video if autoplay is blocked. */ }
    update();
  }
  function togglePlayback() {
    if (failed) return;
    wantsPlayback = video.paused;
    if (wantsPlayback) play(); else video.pause();
  }
  video.addEventListener('click', togglePlayback);
  video.addEventListener('keydown', event => {
    if (event.repeat || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    togglePlayback();
  });
  video.addEventListener('play', update);
  video.addEventListener('pause', update);
  video.addEventListener('loadedmetadata', update);
  video.addEventListener('error', () => {
    failed = true; wantsPlayback = false; video.setAttribute('aria-disabled', 'true');
    note.hidden = false;
    note.textContent = 'The intro could not load. You can still browse the site from the menu.';
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (!inView) video.pause(); else if (wantsPlayback) play();
    }, { threshold: 0.1 }).observe(video);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause(); else if (wantsPlayback && inView) play();
  });
  reduced.addEventListener('change', e => { if (e.matches) { wantsPlayback = false; video.pause(); } });
  update();
  if (wantsPlayback) play();
})();
