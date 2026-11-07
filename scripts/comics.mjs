const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
const noun = (count, singular, plural = `${singular}s`) => `${count} ${count === 1 ? singular : plural}`;
const counts = issues => ({ entries: issues.length, copies: issues.reduce((total, issue) => total + issue.quantity, 0) });
const countLabel = issues => { const total = counts(issues); return `${noun(total.entries, 'entry', 'entries')} · ${noun(total.copies, 'copy', 'copies')}`; };

function link(value) {
  if (!value) return '';
  if (typeof value !== 'string' || /[\u0000-\u0020\\]/.test(value)) throw new Error('Invalid comic link');
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Comic links must use HTTPS');
  return url.href;
}

function numberLabel(value) {
  const number = String(value ?? '').trim();
  return number ? `#${number.replace(/^#\s*/, '')}` : 'Issue to confirm';
}

function referenceName(url, suppliedName) {
  if (suppliedName) return suppliedName;
  if (!url) return '';
  if (url.startsWith('/')) return 'Comic reference';
  return new URL(url).hostname.replace(/^www\./, '');
}

function collection(data) {
  if (!data || !Array.isArray(data.franchises)) throw new Error('The comic collection needs a franchises array');
  const franchiseIds = new Set();
  const seriesIds = new Set();
  const issueIds = new Set();
  const checkId = (id, seen, type) => {
    if (typeof id !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/i.test(id)) throw new Error(`Invalid comic ${type} ID`);
    if (seen.has(id)) throw new Error(`Duplicate comic ${type}: ${id}`);
    seen.add(id);
  };
  const franchises = data.franchises.map(franchise => {
    checkId(franchise.id, franchiseIds, 'franchise');
    if (!franchise.name || !Array.isArray(franchise.series)) throw new Error('Invalid comic franchise');
    return { ...franchise, series: franchise.series.map(series => {
      checkId(series.id, seriesIds, 'series');
      if (!series.name || !Array.isArray(series.issues)) throw new Error('Invalid comic series');
      const sourceUrl = link(series.sourceUrl);
      const issues = series.issues.map(issue => {
        checkId(issue.id, issueIds, 'issue');
        const quantity = issue.quantity ?? 1;
        if (!Number.isSafeInteger(quantity) || quantity < 1) throw new Error(`Invalid quantity for comic ${issue.id}`);
        const imageUrl = link(issue.imageUrl);
        const imageLargeUrl = link(issue.imageLargeUrl || issue.imageUrl);
        const reference = link(issue.sourceUrl || sourceUrl);
        return {
          ...issue, quantity, number: issue.number ?? '',
          imageUrl: issue.identityPending ? '' : imageUrl,
          imageLargeUrl: issue.identityPending ? '' : imageLargeUrl,
          sourceUrl: reference,
          sourceName: referenceName(reference, issue.sourceName || series.sourceName),
          franchiseId: franchise.id, franchiseName: franchise.name,
          seriesId: series.id, seriesName: series.name,
          year: series.year ?? '', publisher: series.publisher ?? ''
        };
      }).sort((a, b) => {
        if (!String(a.number).trim()) return String(b.number).trim() ? 1 : 0;
        if (!String(b.number).trim()) return -1;
        return collator.compare(String(a.number).replace(/^#\s*/, ''), String(b.number).replace(/^#\s*/, ''));
      });
      return { ...series, sourceUrl, issues };
    }) };
  });
  const priority = franchise => ({ transformers: 0, 'star wars': 1 })[String(franchise.name).trim().toLowerCase()] ?? 2;
  franchises.sort((a, b) => priority(a) - priority(b) || collator.compare(a.name, b.name));
  const series = franchises.flatMap(franchise => franchise.series);
  const issues = series.flatMap(group => group.issues);
  return { franchises, series, issues, ...counts(issues) };
}

function artwork(issue, decorative = false) {
  const pending = Boolean(issue.identityPending);
  const label = pending ? 'Edition to confirm' : 'Cover unavailable';
  const original = pending ? issue.originalEntry || (typeof issue.identityPending === 'string' ? issue.identityPending : '') : '';
  const description = `${issue.coverReference ? 'Reference cover' : 'Cover'} of ${issue.seriesName} ${numberLabel(issue.number)}${issue.year ? ` (${issue.year})` : ''}${issue.variant ? `, ${issue.variant}` : ''}`;
  return `<span class="comic-artwork" data-comic-artwork>${issue.imageUrl ? `<img class="comic-cover-image" src="${escape(issue.imageUrl)}" alt="${decorative ? '' : escape(description)}" width="260" height="400" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ''}<span class="comic-art-fallback" data-comic-image-fallback${issue.imageUrl ? ' hidden' : ''}><span class="comic-fallback-label">${label}</span><strong>${escape(issue.seriesName)}</strong><span>${escape(numberLabel(issue.number))}</span>${original ? `<small>Listed as: ${escape(original)}</small>` : ''}</span></span>`;
}

function editionNote(issue) {
  return [...new Set([
    typeof issue.identityPending === 'string' ? issue.identityPending : '',
    issue.notes || ''
  ].filter(Boolean))].join(' ');
}

function renderIssue(issue) {
  const number = numberLabel(issue.number);
  const note = editionNote(issue);
  const coverNote = issue.coverReference && issue.imageUrl ? 'Reference cover' : '';
  const detailedCoverNote = typeof issue.coverReference === 'string' ? issue.coverReference : coverNote ? 'Reference cover. Printing to confirm.' : '';
  const search = [issue.franchiseName, issue.seriesName, issue.year, issue.publisher, issue.number, number, issue.title, issue.variant, issue.originalEntry].filter(Boolean).join(' ');
  const cover = artwork(issue);
  return `<li class="comic-card${issue.identityPending ? ' comic-edition-pending' : ''}" data-comic-card data-comic-id="${escape(issue.id)}" data-franchise="${escape(issue.franchiseId)}" data-franchise-name="${escape(issue.franchiseName)}" data-series="${escape(issue.seriesId)}" data-series-name="${escape(issue.seriesName)}" data-year="${escape(issue.year)}" data-publisher="${escape(issue.publisher)}" data-number="${escape(number)}" data-title="${escape(issue.title || '')}" data-variant="${escape(issue.variant || '')}" data-quantity="${issue.quantity}" data-search="${escape(search)}" data-source="${escape(issue.sourceUrl)}" data-source-name="${escape(issue.sourceName)}" data-cover-note="${escape(detailedCoverNote)}" data-note="${escape(note)}">
    <div class="comic-cover">${issue.imageUrl ? `<a class="comic-cover-link" href="${escape(issue.imageLargeUrl || issue.imageUrl)}" target="_blank" rel="noopener noreferrer" data-comic-open data-image="${escape(issue.imageLargeUrl || issue.imageUrl)}" aria-label="View ${escape(issue.seriesName)} ${escape(number)}${issue.year ? ` (${escape(issue.year)})` : ''}${issue.variant ? `, ${escape(issue.variant)}` : ''}. ${coverNote ? `${coverNote}. ` : ''}${noun(issue.quantity, 'copy', 'copies')}.">${cover}</a>` : cover}${issue.quantity > 1 ? `<span class="comic-quantity">${issue.quantity} copies</span>` : ''}</div>
    <div class="comic-caption"><h4>${escape(number)}</h4>${issue.title ? `<p class="comic-issue-title">${escape(issue.title)}</p>` : ''}${issue.variant ? `<p class="comic-variant">${escape(issue.variant)}</p>` : ''}${coverNote ? `<p class="comic-cover-note">${coverNote}</p>` : ''}${note ? `<details class="comic-notes"><summary>Edition note</summary><p>${escape(note)}</p></details>` : ''}${issue.sourceUrl ? `<a class="comic-source" href="${escape(issue.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escape(issue.sourceName)}</a>` : ''}</div>
  </li>`;
}

function renderSeries(series) {
  const metadata = [series.year, series.publisher].filter(Boolean).join(' / ');
  return `<section class="comics-series" id="comic-series-${escape(series.id)}" data-comics-series="${escape(series.id)}" aria-labelledby="comic-series-title-${escape(series.id)}"><header class="comics-series-header"><div>${metadata ? `<p class="comics-eyebrow">${escape(metadata)}</p>` : ''}<h3 id="comic-series-title-${escape(series.id)}">${escape(series.name)}</h3>${series.sourceUrl ? `<a class="comic-source" href="${escape(series.sourceUrl)}" target="_blank" rel="noopener noreferrer">Series reference</a>` : ''}</div><p class="comics-group-count" data-comics-series-count>${countLabel(series.issues)}</p></header><ul class="comic-grid" aria-label="${escape(series.name)}${series.year ? ` (${escape(series.year)})` : ''} issues">${series.issues.map(renderIssue).join('')}</ul></section>`;
}

function renderFranchise(franchise) {
  const issues = franchise.series.flatMap(series => series.issues);
  return `<section class="comics-franchise" id="comic-franchise-${escape(franchise.id)}" data-comics-franchise="${escape(franchise.id)}" aria-labelledby="comic-franchise-title-${escape(franchise.id)}"><header class="comics-franchise-header"><h2 id="comic-franchise-title-${escape(franchise.id)}">${escape(franchise.name)}</h2><p class="comics-group-count" data-comics-franchise-count>${countLabel(issues)}</p></header>${franchise.series.map(renderSeries).join('')}</section>`;
}

function formatDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return '';
  const date = new Date(`${value}T00:00:00+08:00`);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Singapore' });
}

export function renderComics(data) {
  const stats = collection(data);
  const date = formatDate(data.updatedAt);
  const references = stats.issues.some(issue => issue.coverReference && issue.imageUrl);
  return `<div class="wrap comics-collection" data-comics-collection>
    <header class="comics-heading"><a class="comics-back-link" href="/hobby/">Back to Hobby</a><p class="comics-eyebrow">Comics / My collection</p><h1>The comic <em>collection.</em></h1><p class="comics-intro">${escape(data.description || 'Transformers, Star Wars, and the stories i keep coming back to.')}</p>${date ? `<p class="comics-updated">Updated <time datetime="${escape(data.updatedAt)}">${escape(date)}</time></p>` : ''}</header>
    <section class="comics-overview" aria-label="Comic collection overview"><dl class="comics-stats"><div><dt>Physical copies</dt><dd>${stats.copies}</dd></div><div><dt>Collection entries</dt><dd>${stats.entries}</dd></div><div><dt>Series groups</dt><dd>${stats.series.length}</dd></div><div><dt>Franchises</dt><dd>${stats.franchises.length}</dd></div></dl><p class="comics-overview-note">Copies include duplicates.${references ? ' Reference covers may differ from my edition.' : ''}</p></section>
    <div class="comics-tools"><form class="comics-filters" id="comics-filters" data-comics-filters role="search" aria-label="Search the comic collection" hidden><div class="comics-field comics-search-field"><label for="comics-search">Find a comic</label><input id="comics-search" type="search" placeholder="Series, issue or variant" autocomplete="off" spellcheck="false"></div><div class="comics-field comics-franchise-field"><label for="comics-franchise-select">Franchise</label><select id="comics-franchise-select"><option value="all">All franchises</option>${stats.franchises.map(franchise => `<option value="${escape(franchise.id)}">${escape(franchise.name)}</option>`).join('')}</select></div></form><div class="comics-results-row"><p class="comics-results" data-comics-results role="status" aria-live="polite" aria-atomic="true">Showing all ${countLabel(stats.issues)}</p><div class="comics-result-actions"><button class="comics-clear" type="reset" form="comics-filters" data-comics-clear hidden>Clear filters</button><a class="comics-download" href="/hobby/comics/inventory.csv" download>Download inventory</a></div></div></div>
    <p class="comics-empty" data-comics-empty hidden>No comics match this search. Try another series, issue or variant.</p>
    <div class="comics-franchises">${stats.franchises.map(renderFranchise).join('')}</div>
    <p class="comics-footnote">A personal collection, organised by franchise and series. Cover scans and issue details are credited with each comic.${references ? ' “Reference cover” means the issue is identified, with the printing still to confirm.' : ''}</p>
    <dialog class="comics-dialog" aria-labelledby="comic-dialog-title" aria-describedby="comic-dialog-detail"><div class="comics-dialog-panel"><form method="dialog" class="comics-dialog-close-form"><button class="comics-dialog-close" type="submit" aria-label="Close cover viewer" autofocus>Close</button></form><div class="comics-dialog-art" data-comic-artwork><img class="comics-dialog-image" data-comic-dialog-image alt="" width="520" height="800" decoding="async" referrerpolicy="no-referrer"><span class="comic-art-fallback" data-comic-image-fallback hidden>Cover unavailable</span></div><div class="comics-dialog-info"><p class="comics-eyebrow" data-comic-dialog-group></p><h2 id="comic-dialog-title"></h2><p class="comics-dialog-detail" id="comic-dialog-detail"></p><p class="comics-dialog-reference" data-comic-dialog-reference hidden></p><p class="comics-dialog-note" data-comic-dialog-note hidden></p><a class="comic-source" data-comic-dialog-source target="_blank" rel="noopener noreferrer">View issue reference</a></div><div class="comics-dialog-navigation"><button type="button" data-comic-previous aria-label="Previous cover">Previous</button><span data-comic-dialog-position aria-live="polite"></span><button type="button" data-comic-next aria-label="Next cover">Next</button></div></div></dialog>
  </div>`;
}

export function renderComicsTeaser(data) {
  const stats = collection(data);
  const previews = stats.franchises.map(franchise => franchise.series.flatMap(series => series.issues).find(issue => issue.imageUrl)).filter(Boolean).slice(0, 3);
  for (const issue of stats.issues) {
    if (previews.length >= 3) break;
    if (issue.imageUrl && !previews.some(preview => preview.id === issue.id)) previews.push(issue);
  }
  return `<a class="comics-teaser" href="/hobby/comics/" aria-label="Open my comic collection, ${noun(stats.copies, 'copy', 'copies')} across ${noun(stats.entries, 'entry', 'entries')}"><div class="comics-teaser-copy"><p class="comics-eyebrow">On my shelf</p><h2>The comic <em>collection.</em></h2><p>${escape(data.teaserDescription || 'The stories and covers i keep coming back to.')}</p><span class="comics-teaser-count">${noun(stats.copies, 'copy', 'copies')} <span aria-hidden="true">·</span> ${noun(stats.entries, 'entry', 'entries')}</span><span class="comics-teaser-action">Browse the collection</span></div>${previews.length ? `<div class="comics-teaser-covers" aria-hidden="true">${previews.map(issue => artwork(issue, true)).join('')}</div>` : ''}</a>`;
}

export function renderComicInventory(data) {
  const stats = collection(data);
  const cell = value => {
    let text = String(value ?? '');
    if (/^\s*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const rows = [
    ['Franchise', 'Series', 'Series year', 'Publisher', 'Issue', 'Title', 'Variant', 'Quantity', 'Identification', 'Cover', 'Notes', 'Original entry', 'Source', 'Reference'],
    ...stats.issues.map(issue => [issue.franchiseName, issue.seriesName, issue.year, issue.publisher, issue.number, issue.title || '', issue.variant || '', issue.quantity, issue.identityPending ? 'Edition to confirm' : 'Issue identified', issue.identityPending ? 'Edition to confirm' : !issue.imageUrl ? 'Cover unavailable' : issue.coverReference ? 'Reference cover' : 'Matched cover', editionNote(issue), issue.originalEntry || '', issue.sourceName, issue.sourceUrl])
  ];
  return '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
}
