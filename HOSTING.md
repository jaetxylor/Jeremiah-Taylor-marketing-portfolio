# Hosting notes

This portfolio is a plain static site with no framework or server dependency.

## Primary hosting path
A GitHub Pages workflow is included at `.github/workflows/deploy-pages.yml`. The intended free preview URL is:

`https://jaetxylor.github.io/Jeremiah-Taylor-marketing-portfolio/`

If GitHub Pages is not yet enabled for the repository, choose **GitHub Actions** as the Pages source under repository Settings → Pages.

## Other compatible hosts
- ChatGPT / Codex Sites, if Sites publishing is enabled in the account.
- Cloudflare Pages: no build command; output directory `/`.
- Netlify: no build command; publish directory `.`.

## Custom domain
Not required. A custom domain can be added later without changing the site code.
