export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = buildCorsHeaders(request);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (request.method !== "GET") {
      return json(
        {
          error: "Method not allowed"
        },
        405,
        corsHeaders
      );
    }

    if (!env.MICROCMS_SERVICE_DOMAIN || !env.MICROCMS_API_KEY) {
      return json(
        {
          error: "Missing MICROCMS_SERVICE_DOMAIN or MICROCMS_API_KEY"
        },
        500,
        corsHeaders
      );
    }

    if (url.pathname === "/api/works") {
      return proxyMicrocms(
        `/api/v1/works?limit=100&orders=sortOrder`,
        env,
        corsHeaders
      );
    }

    if (url.pathname.startsWith("/api/works/")) {
      const slug = url.pathname.replace("/api/works/", "").trim();
      if (!slug) {
        return json({ error: "Missing slug" }, 400, corsHeaders);
      }

      return proxyMicrocms(
        `/api/v1/works?filters=slug[equals]${encodeURIComponent(slug)}`,
        env,
        corsHeaders
      );
    }

    return json({ error: "Not found" }, 404, corsHeaders);
  }
};

async function proxyMicrocms(path, env, corsHeaders) {
  const endpoint = `https://${env.MICROCMS_SERVICE_DOMAIN}.microcms.io${path}`;
  try {
    const response = await fetch(endpoint, {
      headers: {
        "X-MICROCMS-API-KEY": env.MICROCMS_API_KEY
      }
    });

    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json; charset=UTF-8",
        "Cache-Control": "public, max-age=60",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    return json(
      {
        error: "Failed to fetch data from microCMS"
      },
      502,
      corsHeaders
    );
  }
}

function json(payload, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "X-Content-Type-Options": "nosniff",
      ...corsHeaders
    }
  });
}

function buildCorsHeaders(request) {
  const origin = request.headers.get("Origin");
  const allowedOrigins = new Set([
    "https://portfolio.noft-designworks.com",
    "https://koomor1202.github.io",
    "http://127.0.0.1:4173",
    "http://localhost:4173",
    "null"
  ]);

  const headers = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin"
  };

  if (!origin) {
    return headers;
  }

  if (allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}
