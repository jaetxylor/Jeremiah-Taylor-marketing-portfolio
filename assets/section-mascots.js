// Decorative motion has a keyboard-accessible pause control and respects the
// visitor's OS motion setting; the illustration itself does not need JS.
document.querySelectorAll('[data-section-mascot]').forEach(mascot => {
  const toggle = mascot.querySelector('.section-mascot-toggle');
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const paused = mascot.toggleAttribute('data-mascot-paused');
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Resume character animation' : 'Pause character animation');
    toggle.title = paused ? 'Resume character animation' : 'Pause character animation';
  });
});
