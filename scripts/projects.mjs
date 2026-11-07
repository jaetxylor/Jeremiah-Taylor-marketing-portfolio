// Project stories are rendered at build time so every section works without JavaScript.
export function renderProject(p, next, { e, tags, brandArt }) {
  for (const link of p.links) {
    const url = new URL(link.url);
    if (url.protocol !== 'https:') throw new Error(`Unsupported project link: ${p.slug}`);
  }
  const nav = [['story', 'The story'], ['features', 'What it does'], ['contribution', 'My contribution'], ['stack', 'Tech stack'], ['milestones', 'Milestones'], ['links', 'Explore further']];
  const external = link => `href="${e(link.url)}" target="_blank" rel="noopener noreferrer"`;
  return `<article class="wrap project-detail">
    <header class="page-top project-heading">
      <a class="back-link" href="/projects/">All projects</a>
      <p class="eyebrow">${e(p.category)} / ${e(p.status)}</p>
      <h1>${e(p.name)}</h1>
      <p class="intro">${e(p.intro)}</p>
      <div class="project-quick-links">
        ${p.links.slice(0, p.slug === 'insourceai' ? 3 : 1).map((link, i) => `<a class="button ${i === 0 ? 'button-dark' : 'button-light'}" ${external(link)}>${e(link.label)}</a>`).join('')}
      </div>
    </header>
    <div class="detail-layout project-story-layout">
      <aside class="detail-aside">
        <div class="project-rail">
          <div class="project-rail-brand">${brandArt(p.slug)}</div>
          <p class="eyebrow">Project at a glance</p>
          <dl><dt>My role</dt><dd>${e(p.role)}</dd><dt>Status</dt><dd>${e(p.status)}</dd><dt>Focus</dt><dd>${tags(p.tags)}</dd></dl>
          <nav class="project-sections" aria-label="On this project page">${nav.map(([id, label]) => `<a href="#${id}">${e(label)}</a>`).join('')}</nav>
        </div>
      </aside>
      <div class="project-story prose">
        <section id="story" class="case-section">
          <p class="eyebrow">01 / The story</p><h2>Why this project exists</h2>
          <p class="case-lead">${e(p.description)}</p><p>${e(p.story)}</p>
        </section>
        <section id="features" class="case-section">
          <p class="eyebrow">02 / The experience</p><h2>${e(p.featuresTitle)}</h2>
          <ol class="project-feature-list">${p.features.map((f, i) => `<li><span class="feature-number" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><div><h3>${e(f.title)}</h3><p>${e(f.text)}</p></div></li>`).join('')}</ol>
          <div class="project-principle"><h3>${e(p.principle.title)}</h3><p>${e(p.principle.text)}</p></div>
        </section>
        <section id="contribution" class="case-section">
          <p class="eyebrow">03 / My part</p><h2>From idea to execution</h2>
          <p>${e(p.contribution)}</p>
          <dl class="project-contributions">${p.contributions.map(c => `<div><dt>${e(c.title)}</dt><dd>${e(c.text)}</dd></div>`).join('')}</dl>
        </section>
        <section id="stack" class="case-section">
          <p class="eyebrow">04 / Behind the build</p><h2>Tech stack</h2>
          <div class="project-stack">${p.stack.map(s => `<div class="stack-row"><span class="stack-layer">${e(s.layer)}</span><div><h3>${e(s.tools)}</h3><p>${e(s.purpose)}</p></div></div>`).join('')}</div>
        </section>
        <section id="milestones" class="case-section">
          <p class="eyebrow">05 / Progress</p><h2>${e(p.milestonesTitle)}</h2>
          <ul class="project-milestones">${p.milestones.map(m => `<li><h3>${e(m.label)}</h3><p>${e(m.text)}</p></li>`).join('')}</ul>
        </section>
        <section id="links" class="case-section">
          <p class="eyebrow">06 / Keep exploring</p><h2>See it for yourself</h2>
          <div class="project-resource-list">${p.links.map(l => `<a ${external(l)}><span><strong>${e(l.label)}</strong><span>${e(l.description)}</span></span><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg></a>`).join('')}</div>
        </section>
      </div>
    </div>
    <a class="next-project" href="/projects/${e(next.slug)}/"><span class="eyebrow">Next project</span><strong>${e(next.name)}</strong></a>
  </article>`;
}
