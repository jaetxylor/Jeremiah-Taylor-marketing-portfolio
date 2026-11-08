(() => {
  const root = document.querySelector('[data-guestbook]');
  if (!root) return;
  const api = root.dataset.api;
  const book = root.querySelector('.guest-book');
  const stage = root.querySelector('.book-stage');
  const pages = [...root.querySelectorAll('.book-page')];
  const cover = root.querySelector('.book-cover');
  const prev = root.querySelector('[data-book-prev]');
  const next = root.querySelector('[data-book-next]');
  const position = root.querySelector('[data-book-position]');
  const status = root.querySelector('[data-book-status]');
  const retry = root.querySelector('[data-book-retry]');
  const mobile = matchMedia('(max-width:640px)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let current = 0, total = 0, totalPages = 1, busy = false, retryTarget = 1;
  const maxView = () => mobile.matches ? Math.max(1, total) : totalPages;
  async function request(path, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(api + path, {...options, credentials:'omit', cache:'no-store', signal:controller.signal});
      const data = await res.json();
      if (!res.ok) { const error = new Error(data.error || 'Something went wrong. Please try again.'); error.refreshToken = data.refreshToken; throw error; }
      return data;
    } catch (error) {
      if (error.name === 'AbortError' || error instanceof TypeError) throw new Error('The book could not connect. Please try again in a moment.');
      throw error;
    } finally { clearTimeout(timeout); }
  }
  function textElement(tag, className, text) {
    const el = document.createElement(tag); el.className = className; el.textContent = text; return el;
  }
  function renderPage(page, entry, number) {
    page.replaceChildren(textElement('p','page-kicker','Notes from friends'));
    if (entry) {
      const message = textElement('p','entry-message',entry.message);
      const signature = textElement('p','entry-signature',entry.name);
      const color = /^#[0-9a-f]{6}$/i.test(entry.fontColor || '') ? entry.fontColor : '#39352b';
      message.style.color = color; signature.style.color = color;
      page.append(message,signature);
      const time = textElement('time','entry-date',new Date(entry.createdAt).toLocaleDateString('en-SG',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Singapore'}));
      time.dateTime = new Date(entry.createdAt).toISOString(); page.append(time);
    } else {
      page.append(textElement('h2','page-welcome',total ? 'A page for you.' : 'The first page is yours.'),textElement('p','page-empty-copy',total ? 'Leave a little hello, and become part of this book.' : 'Every guest book starts with a blank page. Be the first to leave a note.'));
      const sign = textElement('a','entry-date','Sign the book'); sign.href = '#sign-book'; page.append(sign);
    }
    page.append(textElement('span','page-number',String(number)));
  }
  function controls() {
    prev.disabled = busy || current === 0;
    next.disabled = busy || (current > 0 && current >= maxView());
    next.textContent = current === 0 ? 'Open book' : 'Next page';
    prev.textContent = current === 1 ? 'Close book' : 'Previous page';
    position.textContent = busy ? 'Turning the page…' : current === 0 ? 'The cover' : total === 0 ? 'Your note could be first' : mobile.matches ? `Page ${current} of ${total}` : `Pages ${(current-1)*2+1}–${current*2} · ${total} note${total===1?'':'s'}`;
    stage.setAttribute('aria-busy',String(busy));
  }
  async function turn(target, animate = true) {
    if (busy) return;
    if (target === 0) { current = 0; book.classList.add('is-closed'); controls(); return; }
    retryTarget = target;
    busy = true; status.textContent = ''; retry.hidden = true; controls();
    try {
      const apiPage = mobile.matches ? Math.ceil(target / 2) : target;
      const data = await request(`/api/entries?page=${apiPage}`);
      total = data.total; totalPages = data.pages;
      target = Math.min(target,maxView());
      const entries = mobile.matches ? [data.entries[(target-1)%2]] : data.entries;
      const backward = target < current;
      book.classList.remove('is-closed');
      book.classList.toggle('is-backward', backward);
      if (animate && !reduced.matches) book.classList.add('is-turning');
      const paint = () => pages.forEach((page,i)=>renderPage(page,entries[i],mobile.matches?target:(target-1)*2+i+1));
      if (animate && !reduced.matches) {
        await new Promise(resolve=>setTimeout(resolve,300)); paint();
        await new Promise(resolve=>setTimeout(resolve,340));
      } else paint();
      current = target;
    } catch (error) { status.textContent = error.message; retry.hidden = false; }
    finally { busy = false; book.classList.remove('is-turning','is-backward'); controls(); }
  }
  cover.addEventListener('click',()=>turn(1));
  next.addEventListener('click',()=>turn(current+1));
  prev.addEventListener('click',()=>turn(Math.max(0,current-1)));
  retry.addEventListener('click',()=>turn(retryTarget));
  stage.addEventListener('keydown',event=>{
    if (event.key === 'ArrowRight' && !next.disabled) {event.preventDefault();turn(current+1);}
    if (event.key === 'ArrowLeft' && !prev.disabled) {event.preventDefault();turn(current-1);}
  });
  let touch = null;
  stage.addEventListener('touchstart',e=>{touch={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
  stage.addEventListener('touchend',e=>{
    if (!touch) return;
    const dx=e.changedTouches[0].clientX-touch.x, dy=e.changedTouches[0].clientY-touch.y;touch=null;
    if(Math.abs(dx)<55 || Math.abs(dx)<Math.abs(dy)*1.5)return;
    if(dx<0&&!next.disabled)turn(current+1);else if(dx>0&&!prev.disabled)turn(current-1);
  },{passive:true});
  mobile.addEventListener('change',()=>{if(current)turn(1,false);});

  const form = document.querySelector('.guestbook-form');
  const message = form.elements.message;
  const submit = form.querySelector('[type="submit"]');
  const formStatus = form.querySelector('.form-status');
  const count = form.querySelector('[data-message-count]');
  const inkPreview = form.querySelector('.guestbook-note-preview');
  const previewMessage = form.querySelector('[data-ink-preview-message]');
  const previewName = form.querySelector('[data-ink-preview-name]');
  function updatePreview() {
    inkPreview.style.color = form.elements.fontColor.value;
    previewMessage.textContent = message.value.trim() || 'Your note will look like this.';
    previewName.textContent = form.elements.name.value.trim() || 'Your name';
  }
  form.addEventListener('input', updatePreview);
  form.addEventListener('change', updatePreview);
  updatePreview();
  let token = '', issued = 0, tokenRequest;
  async function challenge() {
    if (token && Date.now()-issued<25*60*1000) return token;
    if (!tokenRequest) tokenRequest = request('/api/challenge').then(data=>{token=data.token;issued=Date.now();return token;}).finally(()=>{tokenRequest=null;});
    return tokenRequest;
  }
  form.addEventListener('focusin',()=>{challenge().catch(()=>{});});
  message.addEventListener('input',()=>{count.textContent=String(message.value.length);});
  form.addEventListener('submit',async event=>{
    event.preventDefault(); if (submit.disabled || !form.reportValidity()) return;
    submit.disabled = true; submit.textContent = 'Sending your note…';
    formStatus.textContent = ''; formStatus.dataset.error = 'false';
    try {
      const signedToken = await challenge();
      const wait = Math.max(0,1700-(Date.now()-issued));
      if(wait) await new Promise(resolve=>setTimeout(resolve,wait));
      const data = await request('/api/entries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:form.elements.name.value,message:message.value,fontColor:form.elements.fontColor.value,website:form.elements.website.value,token:signedToken})});
      form.reset(); updatePreview(); count.textContent = '0'; token = ''; issued = 0;
      formStatus.textContent = data.message || 'Thank you. Your note is waiting for Jae’s approval.';
    } catch (error) {
      if(error.refreshToken){token='';issued=0;}
      formStatus.dataset.error='true';formStatus.textContent=error.message;
    } finally { submit.disabled=false;submit.textContent='Leave my note'; }
  });
})();
