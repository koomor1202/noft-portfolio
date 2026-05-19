export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== "GET") {
      return json(
        {
          error: "Method not allowed"
        },
        405
      );
    }

    if (!env.MICROCMS_SERVICE_DOMAIN || !env.MICROCMS_API_KEY) {
      return json(
        {
          error: "Missing MICROCMS_SERVICE_DOMAIN or MICROCMS_API_KEY"
        },
        500
      );
    }

    if (url.pathname === "/api/works") {
      return proxyMicrocms(
        `/api/v1/works?limit=100&orders=sortOrder`,
        env
      );
    }

    if (url.pathname.startsWith("/api/works/")) {
      const slug = url.pathname.replace("/api/works/", "").trim();
      if (!slug) {
        return json({ error: "Missing slug" }, 400);
      }

      return proxyMicrocms(
        `/api/v1/works?filters=slug[equals]${encodeURIComponent(slug)}`,
        env
      );
    }

    return json({ error: "Not found" }, 404);
  }
};

async function proxyMicrocms(path, env) {
  const endpoint = `https://${env.MICROCMS_SERVICE_DOMAIN}.microcms.io${path}`;
  const response = await fetch(endpoint, {
    headers: {
      "X-MICROCMS-API-KEY": env.MICROCMS_API_KEY
    }
  });

  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=60"
    }
  });
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
