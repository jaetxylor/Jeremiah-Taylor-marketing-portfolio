// The dial is playful; the recorded Strava totals never change during a rev.
export function mountRunMeter(root, win = window, doc = document) {
  const pedal = root.querySelector('[data-run-pedal]');
  const needle = root.querySelector('[data-run-needle]');
  const energy = root.querySelector('[data-run-energy]');
  const reduced = win.matchMedia('(prefers-reduced-motion: reduce)');
  const idle = .08;
  let value = idle, target = idle, frame = null, last = null, pulseTimer;
  let observer;

  const draw = () => {
    needle.setAttribute('transform', `rotate(${-120 + value * 240} 120 120)`);
    energy.setAttribute('stroke-dasharray', `${value * 100} 100`);
  };
  const animate = time => {
    frame = null;
    const delta = last === null ? 16 : Math.min(time - last, 64);
    last = time;
    value += (target - value) * (1 - Math.exp(-delta / (target > value ? 320 : 580)));
    if (Math.abs(target - value) < .001) value = target;
    draw();
    if (value !== target) frame = win.requestAnimationFrame(animate);
    else last = null;
  };
  const setTarget = next => {
    target = next;
    if (reduced.matches) {
      if (frame !== null) win.cancelAnimationFrame(frame);
      frame = null;
      last = null;
      value = target;
      draw();
    } else if (frame === null) frame = win.requestAnimationFrame(animate);
  };
  const release = () => {
    win.clearTimeout(pulseTimer);
    pedal.setAttribute('aria-pressed', 'false');
    root.classList.remove('is-revving');
    setTarget(idle);
  };
  const press = () => {
    observer?.disconnect();
    win.clearTimeout(pulseTimer);
    pedal.setAttribute('aria-pressed', 'true');
    root.classList.add('is-revving');
    setTarget(1);
  };
  const sweep = () => {
    if (reduced.matches || doc.hidden) return;
    setTarget(1);
    pulseTimer = win.setTimeout(release, 1100);
  };

  pedal.hidden = false;
  pedal.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.isPrimary === false) return;
    pedal.setPointerCapture(event.pointerId);
    press();
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture', 'blur']) {
    pedal.addEventListener(name, release);
  }
  pedal.addEventListener('keydown', event => {
    if (![' ', 'Enter'].includes(event.key)) return;
    event.preventDefault();
    if (!event.repeat) press();
  });
  pedal.addEventListener('keyup', event => {
    if (![' ', 'Enter'].includes(event.key)) return;
    event.preventDefault();
    release();
  });
  // Screen reader activation generates a click without pointer/keyboard events.
  pedal.addEventListener('click', event => {
    if (event.detail !== 0) return;
    press();
    pulseTimer = win.setTimeout(release, 1100);
  });
  win.addEventListener('blur', release);
  doc.addEventListener('visibilitychange', () => { if (doc.hidden) release(); });
  reduced.addEventListener('change', () => { release(); });
  if ('IntersectionObserver' in win) {
    observer = new win.IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        sweep();
      }
    }, { threshold: .35 });
    observer.observe(root);
  } else sweep();
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-run-meter]').forEach(root => mountRunMeter(root));
}
