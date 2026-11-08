import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function guestbook() {
  class Element {
    children = []; events = {}; dataset = {}; value = ''; textContent = ''; hidden = false;
    classList = {add() {}, remove() {}, toggle() {}};
    addEventListener(type, fn) { this.events[type] = fn; }
    setAttribute() {}
    replaceChildren(...children) { this.children = children; }
    append(...children) { this.children.push(...children); }
    fire(type) { return this.events[type]?.({preventDefault() {}}); }
  }
  const nodes = new Map();
  const get = selector => {
    if (!nodes.has(selector)) nodes.set(selector, new Element());
    return nodes.get(selector);
  };
  const pages = [new Element(), new Element()];
  const root = get('[data-guestbook]');
  root.dataset.api = 'https://guestbook.example';
  root.querySelector = get;
  root.querySelectorAll = () => pages;
  const form = get('.guestbook-form');
  form.querySelector = get;
  form.elements = {message: new Element(), name: new Element(), website: new Element()};
  const calls = [];
  let fail = false;
  vm.runInNewContext(fs.readFileSync(new URL('../assets/guestbook.js', import.meta.url), 'utf8'), {
    document: {querySelector:get, createElement:() => new Element()},
    matchMedia: query => ({matches:query.includes('reduce'), addEventListener() {}}),
    AbortController, setTimeout, clearTimeout,
    fetch: async url => {
      calls.push(url);
      if (fail) { fail = false; return {ok:false, json:async()=>({error:'Temporary failure'})}; }
      const page = Number(new URL(url).searchParams.get('page'));
      return {ok:true, json:async()=>({total:6,pages:3,entries:[0,1].map(i=>({name:'Visitor',message:`Note ${page*2-1+i}`,createdAt:'2026-11-08T00:00:00Z'}))})};
    }
  });
  return {get, form, calls, pages, failNext() {fail = true;}};
}

test('guest book retries the failed next page and preserves the current page until success', async () => {
  const app = guestbook();
  await app.get('.book-cover').fire('click');
  assert.equal(app.get('[data-book-position]').textContent, 'Pages 1–2 · 6 notes');
  app.failNext();
  await app.get('[data-book-next]').fire('click');
  assert.equal(app.get('[data-book-position]').textContent, 'Pages 1–2 · 6 notes');
  assert.equal(app.get('[data-book-retry]').hidden, false);
  await app.get('[data-book-retry]').fire('click');
  assert.equal(new URL(app.calls.at(-1)).searchParams.get('page'), '2');
  assert.equal(app.get('[data-book-position]').textContent, 'Pages 3–4 · 6 notes');
  assert.equal(app.pages[0].children[1].textContent, 'Note 3');
});

test('guest book character count follows the textarea limit for emoji', () => {
  const app = guestbook();
  app.form.elements.message.value = '👋'.repeat(300);
  app.form.elements.message.fire('input');
  assert.equal(app.get('[data-message-count]').textContent, '600');
});
