import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const code = fs.readFileSync(new URL('../assets/hero/hero.js', import.meta.url), 'utf8');
const flush = () => new Promise(resolve => setImmediate(resolve));

function setup({ compact = true, reduced = false, saveData = false, blocked = false } = {}) {
  const listeners = {};
  const player = { dataset: {} };
  const prompt = { hidden: true };
  const note = { hidden: true };
  let attempts = 0;
  let loads = 0;
  const video = {
    dataset: { mobileSrc: '/mobile.mp4', wideSrc: '/wide.mp4', mobilePoster: '/mobile.jpg', widePoster: '/wide.jpg' },
    paused: true, readyState: 0, currentTime: 0,
    getAttribute: name => video[name],
    setAttribute: (name, value) => { video[name] = value; },
    addEventListener: (name, fn) => { listeners[name] = fn; },
    play: async () => {
      attempts++;
      if (blocked) throw new Error('NotAllowedError');
      video.paused = false;
      listeners.play?.();
    },
    pause: () => { video.paused = true; listeners.pause?.(); },
    load: () => { loads++; video.paused = true; video.currentTime = 0; },
  };
  const elements = { '[data-intro-video]': video, '[data-intro-player]': player, '[data-intro-prompt]': prompt, '[data-intro-note]': note };
  const document = { hidden: false, querySelector: s => elements[s], addEventListener: () => {} };
  const window = {
    matchMedia: query => ({ matches: query.includes('reduced') ? reduced : compact, addEventListener: () => {} }),
    addEventListener: () => {},
  };
  vm.runInNewContext(code, { document, window, navigator: { connection: { saveData } } });
  return {
    video, player, prompt, note,
    get attempts() { return attempts; }, get loads() { return loads; },
    allowPlayback: () => { blocked = false; },
    emit: name => listeners[name]?.(),
    frame: () => { video.readyState = 4; video.currentTime = 0.25; listeners.timeupdate(); },
  };
}

test('blocked mobile autoplay keeps the cover visible and can be started with a tap', async () => {
  const h = setup({ blocked: true });
  await flush();
  assert.equal(h.video.src, '/mobile.mp4');
  assert.equal(h.video.poster, '/mobile.jpg');
  assert.equal(h.video.muted, true);
  assert.equal(h.video.defaultMuted, true);
  assert.equal(h.video.playsInline, true);
  assert.equal(h.prompt.hidden, false);
  assert.equal('frameReady' in h.player.dataset, false);
  h.allowPlayback();
  h.emit('click');
  await flush();
  h.frame();
  assert.equal(h.attempts, 2);
  assert.equal(h.video.paused, false);
  assert.equal(h.prompt.hidden, true);
  assert.equal('frameReady' in h.player.dataset, true);
});

for (const setting of ['reduced', 'saveData']) {
  test(`${setting} keeps the cover until the visitor requests playback`, async () => {
    const h = setup({ [setting]: true });
    await flush();
    assert.equal(h.attempts, 0);
    assert.equal(h.prompt.hidden, false);
    assert.equal('frameReady' in h.player.dataset, false);
    h.emit('click');
    await flush();
    h.frame();
    assert.equal(h.attempts, 1);
    assert.equal(h.prompt.hidden, true);
  });
}

test('desktop playback replaces the cover only after a decoded frame advances', async () => {
  const h = setup({ compact: false });
  await flush();
  assert.equal(h.video.src, '/wide.mp4');
  h.video.readyState = 4;
  h.emit('playing');
  assert.equal('frameReady' in h.player.dataset, false);
  h.frame();
  assert.equal('frameReady' in h.player.dataset, true);
  h.emit('click');
  assert.equal(h.video.paused, true);
  assert.equal('frameReady' in h.player.dataset, true);
});

test('a media error restores the cover and supports retry', async () => {
  const h = setup();
  await flush();
  h.frame();
  h.emit('error');
  assert.equal('frameReady' in h.player.dataset, false);
  assert.equal(h.prompt.hidden, false);
  assert.equal(h.note.hidden, false);
  h.emit('click');
  await flush();
  h.frame();
  assert.equal(h.loads, 1);
  assert.equal(h.video.paused, false);
  assert.equal(h.note.hidden, true);
  assert.equal('frameReady' in h.player.dataset, true);
});
