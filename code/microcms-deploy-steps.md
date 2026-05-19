# microCMS Proxy Worker Deploy Steps

## 1. Confirm Wrangler

Run:

```powershell
wrangler --version
```

If Wrangler is not installed:

```powershell
npm install -g wrangler
```

## 2. Login to Cloudflare

Run:

```powershell
wrangler login
```

## 3. Move into this folder

Run:

```powershell
cd C:\Users\omori\Desktop\noft_portfolio\code
```

## 4. Set microCMS secrets

Run these one by one:

```powershell
wrangler secret put MICROCMS_SERVICE_DOMAIN --config .\wrangler.microcms.jsonc
```

Value:

```text
noft-portfolio
```

Then:

```powershell
wrangler secret put MICROCMS_API_KEY --config .\wrangler.microcms.jsonc
```

Value:

```text
<microCMS read only api key>
```

## 5. Deploy the Worker

Run:

```powershell
wrangler deploy --config .\wrangler.microcms.jsonc
```

## 6. Copy the Worker URL

Expected shape:

```text
https://noft-microcms-proxy.<subdomain>.workers.dev
```

## 7. Connect the portfolio

Open:

`C:\Users\omori\Desktop\noft_portfolio\site-data.js`

Set:

```js
worksApiUrl: "https://noft-microcms-proxy.<subdomain>.workers.dev/api/works"
```

## 8. Result

After that, the portfolio site will:

- fetch works from microCMS
- keep the current design
- fall back to local works data if the API is unavailable
