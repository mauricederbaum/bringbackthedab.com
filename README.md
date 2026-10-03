# Bring Back the Dab

The interactive Dab museum, migrated from the original ChatGPT Sites version. The history, chapter controls, Hall of Fame, photographs, chart, funeral, campaign, sharing, responsive layouts and reduced-motion support are preserved.

## Run in VS Code

Install Node.js 24 LTS, then open a terminal:

```bash
git clone https://github.com/mauricederbaum/bringbackthedab.com.git
cd bringbackthedab.com
npm ci
npm run dev
```

Open the address printed by Vite. Change `src/App.tsx` for content and `styles.css` for appearance. `npm run build` checks TypeScript and produces the uploadable website in `dist/`. `npm run preview` previews that production build locally. `npm test` checks the pledge API's persistence, duplicate handling and failure paths.

## Publish on GitHub Pages

1. In this repository, open **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Open **Settings → Secrets and variables → Actions → Variables** and create the repository variable `PAGES_ENABLED` with value `true`.
4. Open **Actions → Build and publish website → Run workflow** on `main`.
5. The successful deployment shows the website URL. Subsequent pushes to `main` build and publish automatically. Pull requests only build and test.

Publishing is deliberately off until that variable is set, because the GitHub connection used for migration cannot configure Pages settings. The build itself runs on every push and pull request. This repository is public, so the migrated source is public. The original Sites URL remains private and unchanged.

## Connect bringbackthedab.com

After Pages works, open **Settings → Pages → Custom domain**, enter `bringbackthedab.com` and save. Follow GitHub's current DNS and domain-verification instructions:

- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages

Wait for the DNS check and certificate, then enable **Enforce HTTPS**. The website uses relative asset paths, so it works both at the repository URL and your custom domain. No DNS records or domain settings were changed during migration. With GitHub Actions publishing, the custom domain is managed in Pages settings; a CNAME file is not required by this workflow.

## Shared pledge counter

GitHub Pages cannot execute an API or host a database. The counter is therefore disabled with an honest “Pledges opening soon” message until you deploy the included backend and connect its URL. It does not fake a count or claim a local click is a global pledge. Sharing, the timeline and the rest of the museum still work.

`backend/worker.mjs` is a standalone Cloudflare Worker using a D1 database in **your own account**. See [backend/README.md](backend/README.md) for setup. Once it is deployed:

- For GitHub Pages, create the repository variable `VITE_PLEDGE_API_URL` containing the Worker origin, for example `https://your-worker.your-subdomain.workers.dev`, and rerun the Pages workflow.
- For local development, copy `.env.example` to `.env.local`, set that URL and restart `npm run dev`.

Only the API origin belongs in this public build variable, never passwords or tokens. Cross-origin requests use an anonymous local browser identifier rather than third-party cookies. The actual pledge and count are persisted in D1. Clearing browser storage allows another pledge; this is a fun counter, not a verified count of unique people. Original Sites pledge rows are **not** migrated; deploying this database starts at zero.

## Files

| File | Purpose |
| --- | --- |
| `src/App.tsx` | Museum, chapter content and interactions |
| `styles.css` | Complete responsive design |
| `src/pledges.ts` | Optional backend connection |
| `assets/*.jpg.base64` | Optimized, locally owned image payloads |
| `scripts/prepare-assets.mjs` | Restores image files before development/build |
| `public/favicon.svg` | Site icon |
| `backend/` | Portable pledge API, SQL migration and deployment guide |
| `.github/workflows/pages.yml` | Tests, build and opt-in Pages deployment |

Images are stored as base64 source files because this migration's repository connector writes text files. The preparation script produces normal JPEGs in `public/`; visitors download ordinary JPEGs, with no image-host dependency. To replace one, update its base64 source or commit a normal JPEG and adjust the script/ignore rule. Original photos were resized and compressed, not replaced with generated artwork.

The existing VS Code workspace and `hello.html` are retained. The formerly empty `index.html` and `styles.css` now serve the site; old empty `script.js` and `about.html` are retained but not used by Vite.

## Image licenses

All images retain their attribution links in the website footer. Cropping, grayscale presentation, resizing and compression are applied for display.

- Hero: Hayden Schiff, “High school soccer player dab”, 2016 — [source](https://commons.wikimedia.org/wiki/File:High_school_soccer_player_dab_(27660674672).jpg), [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/).
- Cam Newton portrait: Tammy Anthony Baker, 2015 — [source](https://commons.wikimedia.org/wiki/File:Cam_Newton_Saints_vs_Panthers_2015-12-06.jpg), CC BY 2.0.
- Migos stage photo (one member pictured): Charito Yap / The Come Up Show — [source](https://commons.wikimedia.org/wiki/File:Migos_(36471052962).jpg), CC BY 2.0.
- Paul Pogba portrait, 2018: Кирилл Венедиктов / soccer.ru — [source](https://commons.wikimedia.org/wiki/File:Paul_Pogba_2018.jpg), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). The adapted image remains under CC BY-SA 3.0.

The popularity chart is an editorial illustration, not a measured dataset. Historical source links and origin caveats remain in the museum.
