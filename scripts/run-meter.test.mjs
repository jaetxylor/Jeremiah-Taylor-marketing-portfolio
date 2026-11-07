import test from 'node:test';
import assert from 'node:assert/strict';
import { mountRunMeter } from '../assets/run-meter.mjs';

class Element extends EventTarget {
  attrs = {};
  classList = { add() {}, remove() {} };
  setAttribute(name, value) { this.attrs[name] = value; }
  setPointerCapture() {}
}
function setup(reduce = false) {
  const pedal = new Element(), needle = new Element(), energy = new Element();
  const root = new Element();
  root.querySelector = selector => ({ '[data-run-pedal]': pedal, '[data-run-needle]': needle, '[data-run-energy]': energy })[selector];
  const win = new EventTarget(), doc = new EventTarget(), media = new EventTarget();
  media.matches = reduce;
  win.matchMedia = () => media;
  const frames = new Map(), timers = new Map();
  let id = 0, time = 0, intersection;
  win.requestAnimationFrame = callback => { frames.set(++id, callback); return id; };
  win.cancelAnimationFrame = id => frames.delete(id);
  win.setTimeout = callback => { timers.set(++id, callback); return id; };
  win.clearTimeout = id => timers.delete(id);
  win.IntersectionObserver = class {
    constructor(callback) { intersection = callback; }
    observe() {}
    disconnect() {}
  };
  const tick = count => {
    for (let i = 0; i < count; i++) {
      const pending = [...frames.values()]; frames.clear(); time += 16;
      pending.forEach(callback => callback(time));
    }
  };
  const fire = (target, name, props = {}) => {
    const event = new Event(name, { cancelable: true });
    Object.assign(event, props); target.dispatchEvent(event); return event;
  };
  mountRunMeter(root, win, doc);
  const level = () => Number(energy.attrs['stroke-dasharray'].split(' ')[0]);
  return { pedal, needle, energy, win, doc, media, frames, timers, tick, fire, level, enter: () => intersection([{ isIntersecting: true }]) };
}

test('intro waits for visibility, sweeps up and settles back to idle', () => {
  const h = setup();
  assert.equal(h.frames.size, 0);
  h.enter(); h.tick(60);
  assert.ok(h.level() > 90 && h.level() <= 100);
  [...h.timers.values()].forEach(callback => callback()); h.tick(300);
  assert.equal(h.level(), 8);
  assert.equal(h.frames.size, 0);
});

test('pointer accelerates smoothly and cancellation releases the pedal', () => {
  const h = setup();
  h.fire(h.pedal, 'pointerdown', { button: 0, pointerId: 1, isPrimary: true });
  h.tick(10); assert.ok(h.level() > 8 && h.level() < 100);
  h.tick(180); assert.equal(h.level(), 100);
  h.fire(h.pedal, 'pointercancel'); h.tick(300);
  assert.equal(h.level(), 8);
  assert.equal(h.pedal.attrs['aria-pressed'], 'false');
});

test('keyboard hold works and tab/window interruption cannot leave it held', () => {
  const h = setup();
  const event = h.fire(h.pedal, 'keydown', { key: ' ', repeat: false });
  assert.equal(event.defaultPrevented, true);
  h.tick(180); assert.equal(h.level(), 100);
  h.doc.hidden = true; h.fire(h.doc, 'visibilitychange'); h.tick(300);
  assert.equal(h.level(), 8);
  h.fire(h.pedal, 'keydown', { key: 'Enter', repeat: false }); h.tick(180);
  h.fire(h.win, 'blur'); h.tick(300); assert.equal(h.level(), 8);
});

test('reduced motion skips arrival animation and changes the dial without frames', () => {
  const h = setup(true); h.enter(); assert.equal(h.frames.size, 0);
  h.fire(h.pedal, 'keydown', { key: 'Enter', repeat: false });
  assert.equal(h.level(), 100); assert.equal(h.frames.size, 0);
  h.fire(h.pedal, 'keyup', { key: 'Enter' }); assert.equal(h.level(), 8);
});

test('assistive click activates a finite rev; secondary pointer is ignored', () => {
  const h = setup();
  h.fire(h.pedal, 'pointerdown', { button: 2, pointerId: 1 });
  assert.equal(h.frames.size, 0);
  h.fire(h.pedal, 'click', { detail: 0 }); h.tick(180);
  assert.equal(h.level(), 100);
  [...h.timers.values()].forEach(callback => callback()); h.tick(300);
  assert.equal(h.level(), 8);
});
