# Markdown negotiation Worker

This Cloudflare Worker provides the site's Markdown content negotiation without the paid Markdown for Agents feature.

## Behavior

- Requests to `/` or `/index.html` with `Accept: text/markdown` receive the maintained `index.md` from the repository's `master` branch as `text/markdown; charset=utf-8`.
- Other requests are passed through to the existing GitHub Pages origin. The public `/cv/cv.md` remains available directly as Markdown.
- `Vary: Accept` keeps the HTML and Markdown representations distinct to caches.

## Deploy

The zone must have an active proxied DNS record for `mnamvarpour.com`. From the repository root, authenticate Wrangler to the Cloudflare account, then deploy:

```sh
npx wrangler login
npx wrangler deploy --config worker/wrangler.jsonc
```

The configured route is `mnamvarpour.com/*`. It places the Worker in front of GitHub Pages; non-Markdown traffic passes through. Deploy only after the commit containing `index.md` has been merged to `master`, because the Worker reads that file from `master`.

## Verify after deployment

```sh
curl -i -H 'Accept: text/markdown' https://mnamvarpour.com/
curl -i -H 'Accept: text/html' https://mnamvarpour.com/
curl -i -H 'Accept: text/markdown' https://mnamvarpour.com/cv/cv.md
```

The homepage's Markdown response should be HTTP 200 with `Content-Type: text/markdown` and a body matching `/index.md`. Browser requests should remain `text/html`; the CV path should remain Markdown.

## Tests

```sh
node --test worker/test.mjs
```
