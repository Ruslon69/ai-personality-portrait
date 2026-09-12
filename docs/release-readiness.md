# Soul Arkana — Cloudflare Pages deployment runbook

## RC1 technical freeze

- Technical freeze commit: `856d6460083d041b18d4ec74609de530988037f9`.
- Verified production origin: `https://soul-arkana.pages.dev`.
- The production release identifier, native SPA routing, security headers, cache behavior, valid and missing asset responses, and representative desktop/mobile browser flows were verified against the real Cloudflare edge.
- Legal operator, privacy contact, jurisdiction, and final legal approval remain pre-commercial launch requirements.
- Physical phone, browser UI at 200% zoom, microphone hardware/recording, and optional assistive-technology checks remain owner QA; automated viewport and browser-policy checks do not replace them.

Cloudflare Pages is the selected production host. This runbook covers the current static React/Vite application; no Pages Functions, Worker, backend, analytics, cookies, or third-party runtime service is required.

## Deployment contract

| Setting | Value |
| --- | --- |
| Framework | React / Vite SPA |
| Git production branch | `main` |
| Root directory | `frontend` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Deployment path | Domain root `/` |
| Node version | `24.18.0` (matches repository `.nvmrc`) |

The router has no basename and Vite uses `base: /`; subdirectory deployment is unsupported without a separately tested source change. Cloudflare Pages must publish only `frontend/dist`.

## Create the Pages project

1. In Cloudflare Dashboard, open **Workers & Pages**, choose **Create application**, then **Pages** and **Connect to Git**.
2. Authorize and select the Soul Arkana repository. Do not use Direct Upload for the normal release path.
3. Set the production branch to `main`.
4. Set the root directory to `frontend`, build command to `npm run build`, and output directory to `dist`.
5. Select the current Pages build system. Set `NODE_VERSION=24.18.0` so the build matches `.nvmrc` and `package.json`.
6. Add the production environment values below. Review preview values separately; do not copy future production secrets into a preview.
7. Save and run the first deployment. The deployment URL appears on the project overview and deployment detail pages.

Do not add Wrangler configuration or a Functions directory for RC1. Git-connected Pages deployments provide atomic versions and dashboard rollback without a custom deployment client.

## Environment values

All `VITE_*` values are compiled into public JavaScript and must never contain secrets.

| Variable | Production value | Status |
| --- | --- | --- |
| `NODE_VERSION` | `24.18.0` | Required Pages build setting; not exposed by Vite |
| `VITE_APP_ENV` | `production` | Required for an explicit release environment |
| `VITE_PRODUCT_STORAGE_V2` | `false` | Required until rollout and migration are approved |
| `VITE_APP_VERSION` | Release tag or Git SHA | Optional explicit override |
| `VITE_API_BASE_URL` | Unset | Optional; current UI has no active API flow and safely falls back to same-origin `/api` |
| `VITE_API_TIMEOUT_MS` | Unset | Optional; defaults to `10000` |

Cloudflare injects `CF_PAGES_COMMIT_SHA` for every Pages build. `vite.config.ts` exposes that non-sensitive SHA as `VITE_APP_VERSION` when an explicit `VITE_APP_VERSION` is absent. Local builds retain the safe `0.0.0` fallback. No API origin or credential should be invented for RC1.

## SPA routing

Cloudflare Pages automatically treats a site without a top-level `404.html` as an SPA and serves the root document for unmatched paths. Existing static files take precedence, so no `_redirects` file is required. Adding a wildcard rewrite would duplicate the platform behavior and risks obscuring asset handling.

The application router owns the visible not-found experience. Verify direct entry and refresh for:

- `/`, `/tarot`, `/tarot/history`, `/tarot/reading`, `/numerology`, `/portrait`, `/portrait/result`, `/portrait/result-preview`;
- `/profile`, `/profile/history`, `/settings`, `/privacy`, `/terms`;
- an invalid application route.

Cloudflare's native SPA fallback also handles any otherwise unmatched URL. Release smoke testing must therefore confirm that every HTML-referenced hashed asset exists and returns its real MIME type; a missing asset must be treated as a failed deployment even if the platform fallback returns the SPA document.

## Headers, permissions, and CSP

`frontend/public/_headers` is copied into `dist` and applied by Cloudflare Pages to static responses. It provides:

- a same-origin CSP with no wildcard and no `unsafe-eval`;
- `frame-ancestors 'none'` plus `X-Frame-Options: DENY` for compatibility;
- `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`;
- `microphone=(self)`, with camera and geolocation disabled.

`style-src 'unsafe-inline'` is intentionally limited to styles because the React UI uses inline style attributes and CSS custom properties. `media-src blob:` is required for temporary local voice-recording playback. Scripts, fonts, images, media, and network connections otherwise remain same-origin; workers are disabled. If an external API is later approved, add only its reviewed HTTPS origin to `connect-src` and update Privacy before enabling it.

Do not set HSTS through `_headers` before the production domain and all included subdomains are known. Cloudflare Pages provides HTTPS. Enable HSTS at the zone level only after confirming that every affected hostname supports HTTPS.

## Cache behavior

- Cloudflare's default HTML/SPA response policy revalidates (`max-age=0, must-revalidate`); `/index.html` also explicitly uses `no-cache`.
- `/assets/*` intentionally has no custom browser cache override. Vite content-hashes the files, but native Pages SPA fallback also answers missing asset URLs with `index.html`; a wildcard immutable rule would therefore cache fallback HTML under a missing asset URL for a year. Cloudflare's deployment-aware CDN cache and default browser revalidation remain active.
- `favicon.svg` uses a short one-hour lifetime with revalidation.
- `robots.txt` uses `no-cache`.

Do not create a broad custom-domain Cache Rule for HTML. Cloudflare retains prior deployment assets temporarily, but release deployment and rollback should still be treated atomically.

## Preview and production

Commits to `main` create production deployments; other configured branches and pull requests create preview deployments. Preview URLs are separate from the production `*.pages.dev` alias and any future custom domain. Cloudflare Pages adds `X-Robots-Tag: noindex` to preview responses by default; verify it with `curl -I` after the first preview. Do not use a preview URL as a canonical, sitemap, or social metadata origin. Cloudflare Access may be enabled later if previews must be private.

## Custom domain (owner action)

After the owner chooses the production origin:

1. Open the Pages project, choose **Custom domains**, then **Set up a domain**.
2. Attach the chosen apex or `www` hostname and complete Cloudflare's DNS verification; do not add a manual CNAME without first associating the domain in Pages.
3. Confirm the active HTTPS certificate before publishing the hostname.
4. Choose one canonical hostname and redirect the alternate hostname at the Cloudflare zone level.
5. Update canonical metadata, sitemap, robots policy, Open Graph URL/image, and production Privacy/Terms references using the final HTTPS origin.
6. Re-run the full deployed-origin smoke and header checks on both the canonical and alternate hostnames.

## First deployment verification

Before announcing a release:

1. Confirm the Pages build used the expected commit and Node version and that the UI exposes a non-`0.0.0` release identifier where configured.
2. Run the route list above through direct navigation, refresh, Back, and Forward.
3. Confirm `Content-Security-Policy`, `Permissions-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, and frame protection on HTML responses.
4. Confirm HTML and hashed assets revalidate, valid assets return their real MIME types, and a missing `/assets/...` request is not marked immutable.
5. Check browser console CSP errors, failed requests, mixed content, unexpected external requests, horizontal overflow, legal links, locale switching, and microphone permission on HTTPS.
6. Check `/privacy` and `/terms` in RU, EN, and UK. Owner/legal approval and real operator/contact details remain mandatory before public launch.

Use the project's **Deployments** view to locate the deployment URL and build log. If a release fails smoke, choose the last verified deployment and use **Rollback to this deployment**; then investigate before rebuilding. Do not fix a bad production deployment by weakening headers or tests.

## Local and release validation

```bash
cd frontend
npm ci
npm run lint
npm run format:check
npm run build
npm run quality
npm run quality:fast
npm audit
npm run tarot:premium:validate
cd ..
./scripts/check.sh
git diff --check
```

Inspect `frontend/dist` for source maps, environment files, reports, fixtures, authoring assets, and credentials. The current artifact is within Cloudflare Pages limits: the Free plan permits 20,000 files and a maximum of 25 MiB per file. Approved Premium Tarot artwork must not be recompressed for deployment.

## Known release boundaries

- The verified production deployment currently uses the Cloudflare Pages origin above. A custom domain still requires owner-account action and a fresh deployed-origin verification pass.
- The legal operator, privacy contact, jurisdiction, and final legal approval remain release requirements.
- Canonical URL, sitemap, and social preview image remain deferred until the final custom production origin and approved share asset exist.
- External crash reporting is not configured, so runtime failures are not remotely observable.
- Exact Tarot pre-reveal `stepIndex` persistence, Product Storage V2 rollout, physical 200% zoom/device testing, and microphone hardware testing remain deferred product decisions.
