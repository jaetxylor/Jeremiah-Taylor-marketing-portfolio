# psrmalam — Jeremiah Leow

Personal site: home, projects and companies, blog, about/CV, and the original marketing portfolio.

## Build and publish

Run `node scripts/build.mjs` (Node 18+; no packages required). The generated website is in `dist/`. Pushes to `main` build and publish that directory to GitHub Pages.

## Content

- `content/site.json`: author, contact details and active site URL.
- `content/projects.json`: project summaries, actual roles, contributions and links.
- `content/posts/*.json`: dated blog posts.
- `scripts/build.mjs`: page templates, static generation, RSS and sitemap.
- `assets/personal.css` and `assets/personal.js`: design and mobile navigation.
- `portfolio.html`, `portfolio-data.js`, `styles.css`, `overrides.css`, `script.js`: original marketing portfolio.
- `assets/`: original portrait, résumé, favicon and unmodified InsourceAI logo.

## Publish a blog post

Add a JSON file under `content/posts/`, following the welcome post. Required fields: `slug`, `title`, `date` (YYYY-MM-DD, Singapore), `category`, `excerpt`, `draft` (boolean), and `body`.

Body blocks support `paragraph`, `heading` and `quote` with a `text` string, or `list` with an `items` array of strings. Add photos, videos and links between any text blocks using the examples below. Text is escaped; raw HTML is not executed. Published posts get individual URLs and appear on the blog, homepage, RSS feed and sitemap after a build.

Keep `draft: true` until ready, then change it to `false` and commit. Future-dated posts are excluded until a build runs on or after that date. Scheduled publication is not configured; run the deployment manually when needed. **This repository is public: drafts are omitted from the website but remain readable on GitHub. Keep private notes outside the repository.**

There is no website admin login or database. Update content on GitHub or ask the assistant to prepare and publish a post.


### Photos, videos and links

Send the assistant your photos/video links and where they belong in the post, or edit the post JSON on GitHub. This is content support for the existing static blog, not an on-site upload/editor screen.

For a photo, use a public HTTPS image URL or add the file under `assets/blog/` and reference its path. Include descriptive `alt` text and an optional caption:

```json
{"type":"image","src":"assets/blog/my-collection.jpg","alt":"My childhood Pokémon ex collection","caption":"A few favourites from the binder."}
```

For videos, paste a full YouTube watch/Shorts/share URL, a full TikTok video URL, or a direct MP4/WebM URL. Local video files also work under `assets/blog/`. A descriptive `title` is required; `caption`, `poster` (for direct files) and `portrait` (true/false) are optional.

```json
{"type":"video","src":"https://www.youtube.com/watch?v=VIDEO_ID","title":"Opening a childhood favourite","caption":"One more pack."}
```

YouTube and TikTok players load when the reader clicks, without autoplay. Shorts and TikTok use a portrait layout. Every video keeps an external/open link. Other video links, including shortened TikTok links, display a clickable link instead of an empty player; use the full TikTok video URL for an inline player. Private or embedding-disabled videos must be watched at the source. MP4 (H.264) is the safest choice for broad playback; other file formats depend on the reader's browser. For large clips, use a video host rather than committing the file.

For a photo album, social post or any other external page:

```json
{"type":"link","url":"https://example.com/my-album","text":"See the full photo album"}
```

Captions and descriptions are included in blog search. Photos open at full size when clicked. HTTPS links are required; raw embed HTML/scripts and paths outside `assets/` are rejected. The build checks local media files exist. Before publishing, run `node --test scripts/post-blocks.test.mjs` and `node scripts/build.mjs`.

## Pokémon ex collection

The gallery lives at `/hobby/ex-collection/` and is linked from Hobby. `content/ex-collection.json` is the durable public tracker; the site has no account connection to Pokellector and no public editing controls.

For another screenshot batch, match each card by expansion plus number (or `catalogueId`), merge into the existing records, and update `batchesReceived` and `updatedAt`. Blue ticks are recorded as `collected`; grey ticks as `hunting`. A card outside the screenshots stays `unknown` until Jae confirms it. Never infer ownership from the catalogue. Keep Energy, Gold Stars and normal Pokémon cards outside this original ex collection.

All three screenshot batches have been imported. The tracker covers 16 sets and 139 original Pokémon ex cards: 81 collected and 58 still hunting, with no ownership statuses pending within these imported sets. Batch 3 added FireRed & LeafGreen, Hidden Legends, Team Magma vs Team Aqua, Dragon, Sandstorm, and Ruby & Sapphire. All Pokémon ex cards in Holon Phantoms, Dragon, Sandstorm, and Ruby & Sapphire are collected.

Keep separately numbered versions distinct: the three Deoxys ex cards #97, #98, and #99 are separate collected records, while FireRed & LeafGreen Mr. Mime ex #110 is collected and #111 is still hunting. Rocket’s Raikou ex #108 belongs to EX Deoxys. The gallery heading marks all three batches as added; this describes the completed import, not a completed collection.

Set catalogue pages and exact artwork URLs are attributed to Pokellector in the data and gallery. Displayed scans are reference artwork, not photographs of the owner’s physical cards.

`script` modules `scripts/collection.mjs` and `assets/ex-collection.js` render and enhance the collection; styles stay in `assets/ex-collection.css`. Run the normal build after changing the data.

## Comic collection

The comic shelf lives at `/hobby/comics/`, with a preview on Hobby. `content/comic-collection.json` groups the inventory by franchise, series start year, and issue. Transformers appears first, followed by Star Wars. Each accession has a stable ID and an explicit quantity; issue numbers alone are not identifiers.

The supplied inventory contains 48 entries and 54 physical copies: Transformers has 33 entries / 38 copies, and Star Wars has 15 entries / 16 copies. Parenthesised numbers and `*2` are treated as copy counts. Four entries remain labelled “Edition to confirm”: Energon Universe #1 (three copies), Transformers and G.I. Joe #3, and the Marvel 25th anniversary 75¢ entries #2 and #3. The two separately listed #3 entries are retained independently until the covers can be checked.

The 44 identified entries have cover references and source links. Named action figure and Choose Your Destiny variants are matched by their character/cover names. Other displayed covers are labelled “Reference cover” because the owned printing or variant was not supplied. Series years distinguish, for example, Star Wars (2015) from Star Wars (2020), and Image Transformers (2023) from IDW Transformers (2019). “A Bold New Era” and “War World” are issue labels within the 2019 series.

`scripts/comics.mjs` builds the gallery, Hobby preview, and `/hobby/comics/inventory.csv`; `assets/comics.js` adds search, franchise filtering and the cover viewer. Images credit public catalogues, publishers, or the linked cover source. Original inventory wording stays in each record and the export. Do not infer condition, value, printing, an additional owned variant, or a missing issue from a catalogue.

## Domain

See `HOSTING.md`. The active site URL stays on GitHub Pages until the domain is connected. Then set `content/site.json` to `https://psrmalam.com` and rebuild.

## Existing work

The original CV page is preserved at `portfolio.html`. Old section hashes redirect there from the homepage; the résumé file path is unchanged. Confidential Shopify and Squarespace client work stays unnamed. Do not add client names or assets without approval. The original reference portfolio deck is not distributed.

