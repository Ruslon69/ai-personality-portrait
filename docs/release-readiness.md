# Production deployment requirements

The hosting target is not yet defined. A release deployment must serve only `frontend/dist` and satisfy the contracts below; Vite development mode and `vite preview` are not production servers. The public product brand is **Soul Arkana**; package, repository and persisted-schema identifiers may retain historical technical names.

## Build and environment

Use the pinned Node version and deterministic lockfile:

```bash
cd frontend
npm ci
npm run build
```

All `VITE_*` values are embedded in public client assets and must never contain secrets.

- `VITE_APP_ENV=production` identifies the release environment. Production builds also resolve safely to production when it is omitted.
- `VITE_APP_VERSION` should be a non-sensitive release tag or Git SHA. The source fallback is `0.0.0`, so deployment automation must supply a useful identifier.
- `VITE_API_BASE_URL` is optional while the current UI has no active API calls. Its safe fallback is the same-origin `/api`; configure an explicit HTTPS origin before enabling an API-backed feature.
- `VITE_API_TIMEOUT_MS` defaults to `10000`.
- `VITE_PRODUCT_STORAGE_V2` is optional and disabled by default in production. Do not enable it until its rollout and migration decision is approved.

## Routing and base path

The build assumes deployment at the domain root (`base: /`) and the router has no basename. A subdirectory deployment is unsupported without an explicit, separately tested configuration change.

The host must rewrite application routes to `/index.html` while preserving real static files and returning a real 404 for missing assets. Smoke at least:

- `/`, `/tarot`, `/tarot/history`, `/numerology`, `/portrait`, `/portrait/result`, `/portrait/result-preview`, `/profile`, `/settings`, `/privacy`, `/terms`, and an invalid route;
- direct entry and refresh on every route;
- client navigation plus browser Back and Forward.

`/profile` is the current Journey route. `/journey` is not an application route and currently renders the in-app not-found page.

## HTTPS and browser permissions

Production must use HTTPS. Microphone capture relies on a secure context; plain HTTP is unsupported outside the browser's localhost exception. The app does not use camera or geolocation.

Recommended policy:

```text
Permissions-Policy: microphone=(self), camera=(), geolocation=()
```

## Security headers

This policy was exercised against the production build in Chromium. React uses inline style attributes for bounded visual variables, and local voice playback uses a Blob URL.

```text
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; media-src 'self' blob:; connect-src 'self'; worker-src 'self' blob:
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: DENY
Permissions-Policy: microphone=(self), camera=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

If an external `VITE_API_BASE_URL` is introduced, add only that reviewed HTTPS origin to `connect-src`. Enable HSTS only after HTTPS and all included subdomains are confirmed. The host does not need permissive cross-origin isolation headers for current functionality.

## Cache and atomic deployment

- `/index.html`, route fallbacks, `robots.txt`, and `favicon.svg`: `Cache-Control: no-cache`.
- `/assets/*`: `Cache-Control: public, max-age=31536000, immutable` because filenames are content-hashed.
- Deploy HTML and assets atomically or retain the previous asset generation during rollout so cached HTML never references removed files.

No service worker is registered, so there is no application-managed cache or offline update path.

The current `A` favicon is an RC placeholder representing Arkana. Final logo exploration and visual identity are intentionally deferred to the Visual Identity Sprint.

## SEO and origin-dependent metadata

Public landing and legal routes use localized titles and may be indexed. Volatile results, saved-data views, Settings and unfinished flows use `noindex, nofollow` and are excluded in `robots.txt`.

A canonical URL, sitemap and social preview image are intentionally deferred until the production origin/domain and an approved share asset exist. Add them only with the selected host and verify that canonical URLs use the production HTTPS origin; do not point production metadata at a preview domain.

## Release validation

```bash
cd frontend
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

Inspect `frontend/dist` for source maps, environment files, reports, fixtures, and authoring assets. Verify the response headers and production routes from the deployed origin, not from a development server.

## Release gates and operational risks

Before a public production launch, complete the applicable privacy/security gates in `docs/privacy-security.md` and obtain owner/legal approval for the visible Privacy Policy and Terms. The demonstrational consent/export/deletion UI has been removed; current deletion disclosures now describe only working product and browser controls. Choose a hosting target and encode the rewrite, headers, HTTPS, and cache contracts in its reviewed configuration.

External crash reporting is not configured. Until an approved privacy-safe observability path exists, production runtime failures will not be remotely visible.

Deferred product decisions remain: exact Tarot pre-reveal `stepIndex` persistence, Product Storage V2 rollout, physical 200% zoom/device testing, and microphone hardware testing.
