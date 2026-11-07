# psrmalam — Jeremiah Leow

Personal site: home, projects and companies, blog, about/CV, and the original marketing portfolio.

## Build and publish

Run `node scripts/build.mjs` (Node 18+; no packages required). The generated website is in `dist/`. Pushes to `main` build and publish that directory to GitHub Pages.

## Content

### Homepage character intro

The homepage uses a 45-second silent cartoon film with baked-in captions. `assets/hero/` contains a 1920×1080 desktop MP4, a 960×1200 phone MP4, matching posters, the character sprite sheet, and playback controls. The player selects one video for the viewport, pauses outside the viewport or in background tabs, and waits for a click when reduced motion or data saving is enabled.

`scripts/render-hero.mjs` renders the film offline with `@napi-rs/canvas`, FFmpeg and the Nimbus Sans/P052 system fonts. Run it normally and with `--mobile` to regenerate both formats. This renderer is not part of the website build. Copy is drawn from the public Projects, Works, Hobby and Blog pages; the film intentionally avoids changing collection counts and running statistics.

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


## Travelling

`/hobby/travelling/` contains a draggable orthographic globe, with blue visited destinations, red unvisited destinations, and Singapore as home. `content/travel.json` is the source of truth for the 16 visited places. Hong Kong and Taiwan have their own albums; country/region labels are used as travel destinations.

### Add photos

Open a country album and expand **Manage this album**, then select **Upload photos**. The link opens that exact folder in GitHub, where only repository editors can upload. Commit to `main`; the existing Pages workflow builds and publishes the album. Uploads are not stored in browser local storage and public visitors cannot publish photos.

Photos belong in `assets/travel/<destination-slug>/`. JPG, JPEG, PNG, WebP, AVIF and GIF files are picked up automatically, including uppercase extensions. Convert HEIC/HEIF to JPG before uploading. Name files `01.jpg`, `02.jpg`, etc. to choose their order. No example travel photos are included.

Optional `album.json` in the same folder supplies captions and alt text, keyed by exact filename:

```json
{
  "01.jpg": {"alt": "Tokyo at night", "caption": "An evening walk in Tokyo."}
}
```

Removing a photo from the folder removes it from the next published build; remove its caption entry too. New destinations can be added to `content/travel.json` with their three-digit Natural Earth/ISO numeric ID, slug, name, and `[longitude, latitude]` centre. Create the matching folder. The visited count, map colours and album pages are generated from this list.

`assets/travel/world.json` derives from world-atlas 2.0.2 / Natural Earth 1:50m countries (public domain), simplified with topojson-simplify at the 0.65 quantile and rounded to three decimal places. Its dots are sampled from a raster of the same boundaries. The local `assets/vendor/d3-geo.mjs` bundle uses d3-geo 3.1.1; licence notices are retained in `assets/vendor/LICENSE.txt`. There are no runtime map/CDN dependencies. All map resources load only on the travel page. The albums remain usable when JavaScript or the globe fails.

Run `node --test scripts/travel.test.mjs` and `node scripts/build.mjs` to validate uploads and build all pages.


## Private ancestry archive

`/hobby/ancestry/` is an encrypted static archive. The repository and deployed assets contain only the AES-256-GCM ciphertext in `assets/ancestry.vault.json`; person records, captions and original images are all inside that payload. The key is derived from the family passphrase with PBKDF2-SHA256 (600,000 iterations and a random salt). The browser holds decrypted content in memory and clears it on lock or navigation. It does not save the passphrase or content to local storage. The page is excluded from the sitemap and marked noindex.

To update the archive, obtain the passphrase from the owner, decrypt the existing vault outside the checkout, edit the private payload, and provide `{password, payload}` as JSON on stdin to `node scripts/seal-ancestry.mjs`. Never write the passphrase or plaintext to the repository, build directory, logs or a public issue. Commit only the refreshed vault and any renderer changes. Keep source captions, uncertainty, original spellings and relationship evidence when editing. A family account is distinct from documentary evidence.

Static encryption has no server-side rate limiting or per-person access revocation. Anyone given the passphrase can view and copy the archive; changing it protects the next vault but cannot revoke copies of earlier ciphertext or content. HTTPS is required for browser decryption.

Validation: `node scripts/build.mjs && node --test scripts/ancestry.test.mjs`. Browser verification on HTTPS should cover incorrect passphrases, unlock, tree navigation/search, image zoom, explicit lock and refresh.

### Blog topics

Add a `tags` array to each post JSON, for example `"tags": ["AI", "Work"]`. Posts can have multiple topics. `content/blog-topics.json` controls the initial filter choices; additional tags appear automatically. Filters combine with search and can be linked as `/blog/?tag=AI`.

### Guest book

`/guestbook/` is an interactive book connected to the PSRMalam guest book service. Visitor submissions remain pending until approved. The **Manage entries** link opens the owner sign-in and moderation desk, with Awaiting approval, In the book and Hidden tabs. Hide and restore are reversible. The service stores entries in its database; entries do not live in this static repository.

Public UI: `scripts/guestbook.mjs`, `assets/guestbook.css`, `assets/guestbook.js`. The service origin is declared in the guest book markup. Do not place credentials in this repository.
