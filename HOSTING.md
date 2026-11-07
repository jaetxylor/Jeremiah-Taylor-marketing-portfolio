# Hosting and domain cutover

GitHub Pages publishes `dist/` via `.github/workflows/deploy-pages.yml`. Build with `node scripts/build.mjs`; the Pages source must remain **GitHub Actions**.

Current URL: https://jaetxylor.github.io/Jeremiah-Taylor-marketing-portfolio/
Intended URL: https://psrmalam.com/

## DNS observed on 7 November 2026

Nameservers: `ns73.domaincontrol.com`, `ns74.domaincontrol.com` (GoDaddy).
Root A: `23.227.38.65` (Shopify).
www CNAME: `shops.myshopify.com`.

The owner confirmed replacing Shopify with this personal site. This does not authorize cancelling the Shopify account/subscription. Preserve nameservers and all email-related records.

## Cutover procedure

1. In the GitHub account Settings → Pages, verify `psrmalam.com` ownership. Add the exact GitHub-provided TXT challenge in GoDaddy; verify it and retain the record.
2. In repository Settings → Pages, set Custom domain to `psrmalam.com` before switching website DNS. An Actions-based deployment ignores a repository CNAME file; the setting itself must be changed.
3. Replace the root website A record with all four GitHub Pages A records (name `@`):
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
4. Set the `www` CNAME to `jaetxylor.github.io`, excluding the repository name.
5. Inspect root AAAA records for stale website targets; remove those or replace them with GitHub's documented IPv6 records. Preserve MX, SPF, DKIM, DMARC and other verification records.
6. Wait for the DNS check/certificate. Enable Enforce HTTPS when available. Verify apex/www, redirects, old Pages URL, navigation and CV download.
7. Change `url` in `content/site.json` to `https://psrmalam.com` and redeploy to update canonical links, RSS, social metadata and sitemap.

These account/DNS settings are not applied by the source update alone and require signed-in access.

Reference: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Recovery

Restore only the original website DNS records above to reverse the domain switch. Restore the previously deployed commit to undo the site-content release, without reverting unrelated work.
