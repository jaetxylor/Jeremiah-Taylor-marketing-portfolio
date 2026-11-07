(() => {
  const video = document.querySelector('[data-intro-video]');
  if (!video) return;
  const note = document.querySelector('[data-intro-note]');
  const player = document.querySelector('[data-intro-player]');
  const prompt = document.querySelector('[data-intro-prompt]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compact = window.matchMedia('(max-width: 640px)').matches;
  const src = compact ? video.dataset.mobileSrc : video.dataset.wideSrc;
  video.poster = compact ? video.dataset.mobilePoster : video.dataset.widePoster;
  // Set the properties as well as the HTML attributes before requesting iOS playback.
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  let wantsPlayback = !reduced.matches && !navigator.connection?.saveData;
  let inView = true;
  let failed = false;
  let playPending = false;
  const showPrompt = () => { prompt.hidden = false; };
  function revealFrame() {
    if (video.readyState < 2 || video.currentTime <= 0 || failed) return;
    player.dataset.frameReady = '';
    prompt.hidden = true;
    note.hidden = true;
  }
  const update = () => {
    const action = video.paused ? 'Play' : 'Pause';
    video.setAttribute('aria-label', action + ' the silent, captioned site introduction');
  };
  async function play() {
    if (failed || playPending || !inView || document.hidden) return;
    playPending = true;
    if (!video.getAttribute('src')) video.src = src;
    try {
      await video.play();
    } catch {
      // The independent cover stays visible when Safari refuses autoplay.
      if (inView && !document.hidden && wantsPlayback) showPrompt();
    } finally { playPending = false; }
    update();
  }
  function togglePlayback() {
    if (failed) {
      failed = false;
      video.src = src;
      video.load();
    }
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
  video.addEventListener('playing', () => {
    if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(revealFrame);
    revealFrame();
  });
  video.addEventListener('timeupdate', revealFrame);
  video.addEventListener('error', () => {
    failed = true; wantsPlayback = false;
    delete player.dataset.frameReady;
    showPrompt();
    note.hidden = false;
    note.textContent = 'Tap the intro to try again.';
    update();
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
  window.addEventListener('pageshow', () => { if (wantsPlayback && inView) play(); });
  reduced.addEventListener('change', e => { if (e.matches) { wantsPlayback = false; video.pause(); showPrompt(); } });
  update();
  if (wantsPlayback) play(); else showPrompt();
})();
