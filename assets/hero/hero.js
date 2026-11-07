(() => {
  const video = document.querySelector('[data-intro-video]');
  if (!video) return;
  const toggle = document.querySelector('[data-intro-toggle]');
  const replay = document.querySelector('[data-intro-replay]');
  const note = document.querySelector('[data-intro-note]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compact = window.matchMedia('(max-width: 640px)').matches;
  const src = compact ? video.dataset.mobileSrc : video.dataset.wideSrc;
  video.poster = compact ? video.dataset.mobilePoster : video.dataset.widePoster;
  let wantsPlayback = !reduced.matches && !navigator.connection?.saveData;
  let inView = true;
  let failed = false;
  const update = () => {
    toggle.textContent = video.paused ? 'Play intro' : 'Pause intro';
    toggle.setAttribute('aria-label', video.paused ? 'Play the 45-second site introduction' : 'Pause the site introduction');
    replay.disabled = !video.currentSrc;
  };
  async function play() {
    if (failed || !inView || document.hidden) return;
    if (!video.getAttribute('src')) video.src = src;
    try { await video.play(); } catch { /* Autoplay restrictions leave an explicit play button. */ }
    update();
  }
  toggle.addEventListener('click', () => {
    wantsPlayback = video.paused;
    if (wantsPlayback) play(); else video.pause();
  });
  replay.addEventListener('click', () => { video.currentTime = 0; wantsPlayback = true; play(); });
  video.addEventListener('play', update);
  video.addEventListener('pause', update);
  video.addEventListener('loadedmetadata', update);
  video.addEventListener('error', () => {
    failed = true; wantsPlayback = false; toggle.disabled = true; replay.disabled = true;
    note.hidden = false;
    note.textContent = 'The intro could not load. You can still explore every section below.';
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
