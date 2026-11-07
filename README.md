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

Body blocks support `paragraph`, `heading` and `quote` with a `text` string, or `list` with an `items` array of strings. Text is escaped; raw HTML is not executed. Published posts get individual URLs and appear on the blog, homepage, RSS feed and sitemap after a build.

Keep `draft: true` until ready, then change it to `false` and commit. Future-dated posts are excluded until a build runs on or after that date. Scheduled publication is not configured; run the deployment manually when needed. **This repository is public: drafts are omitted from the website but remain readable on GitHub. Keep private notes outside the repository.**

There is no website admin login or database. Update content on GitHub or ask the assistant to prepare and publish a post.

## Pokémon ex collection

The gallery lives at `/hobby/ex-collection/` and is linked from Hobby. `content/ex-collection.json` is the durable public tracker; the site has no account connection to Pokellector and no public editing controls.

For another screenshot batch, match each card by expansion plus number (or `catalogueId`), merge into the existing records, and update `batchesReceived` and `updatedAt`. Blue ticks are recorded as `collected`; grey ticks as `hunting`. A card outside the screenshots stays `unknown` until Jae confirms it. Never infer ownership from the catalogue. Keep Energy, Gold Stars and normal Pokémon cards outside this original ex collection.

The initial import covers seven sets, 21 collected and 31 hunting cards. Unseen Forces also has three catalogue entries awaiting an ownership update: Umbreon ex #112, Rocket’s Persian ex #116 and Celebi ex #117. Set catalogue pages and exact artwork URLs are attributed to Pokellector in the data and gallery. Displayed scans are reference artwork, not photographs of the owner’s physical cards.

`script` modules `scripts/collection.mjs` and `assets/ex-collection.js` render and enhance the collection; styles stay in `assets/ex-collection.css`. Run the normal build after changing the data.

## Domain

See `HOSTING.md`. The active site URL stays on GitHub Pages until the domain is connected. Then set `content/site.json` to `https://psrmalam.com` and rebuild.

## Existing work

The original CV page is preserved at `portfolio.html`. Old section hashes redirect there from the homepage; the résumé file path is unchanged. Confidential Shopify and Squarespace client work stays unnamed. Do not add client names or assets without approval. The original reference portfolio deck is not distributed.

