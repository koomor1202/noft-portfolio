# microCMS Next Steps

## 1. Cloudflare Worker

- Deploy [microcms-worker.js](./microcms-worker.js)
- Use [wrangler.microcms.jsonc](./wrangler.microcms.jsonc)
- Follow [microcms-deploy-steps.md](./microcms-deploy-steps.md)
- Set Worker secrets:
  - `MICROCMS_SERVICE_DOMAIN=noft-portfolio`
  - `MICROCMS_API_KEY=<read only api key>`

## 2. Public endpoint

Use the Worker URL as the public works endpoint.

Example:

```text
https://noft-microcms-proxy.<your-subdomain>.workers.dev/api/works
```

## 3. Portfolio config

Edit [site-data.js](../site-data.js) and set:

```js
worksApiUrl: "https://noft-microcms-proxy.<your-subdomain>.workers.dev/api/works"
```

## 4. Result

Once the endpoint is live, the portfolio site will:

- fetch `works` from microCMS
- fall back to local `site-data.js` works when the endpoint is empty or unavailable
- continue using existing `ABOUT`, `CONTACT`, and other static site content as-is
