/**
 * Cloudflare Worker — EMC Site Router
 * Handles SEO redirects, proper 404s, and SPA fallback for enviandomeucarro.com
 */

interface Env {
  ASSETS: Fetcher;
}

// 301 Permanent Redirects — legacy/old URLs → current pages
const REDIRECTS: Record<string, string> = {
  // Legacy routes
  "/novo-orcamento": "/",
  "/rastrear": "/minha-area",
  "/loja": "/",

  // Blog articles → Centro de Conhecimento categories
  "/blog/guia-completo-importacao-veiculos-brasil": "/centro-de-conhecimento/importacao",
  "/blog/como-exportar-veiculo-do-brasil": "/centro-de-conhecimento/exportacao",
  "/blog/admissao-temporaria-veiculos-regras": "/centro-de-conhecimento/regulamentacoes",
  "/blog/portos-brasileiros-importacao-exportacao-veiculos": "/centro-de-conhecimento/transporte-de-veiculos",
  "/blog/regras-ibama-importacao-veiculos": "/centro-de-conhecimento/regulamentacoes",
  "/blog/importar-carro-japao-brasil-guia": "/centro-de-conhecimento/importacao",
  "/blog/como-funciona-transporte-maritimo-veiculos": "/centro-de-conhecimento/transporte-de-veiculos",
  "/blog/rastreamento-navio-roro": "/centro-de-conhecimento/transporte-de-veiculos",

  // Standalone pages → relevant sections
  "/seguro-maritimo-veiculos-cobertura": "/centro-de-conhecimento/transporte-de-veiculos",
  "/lcvm-licenca-importacao": "/centro-de-conhecimento/regulamentacoes",
  "/roro-vs-container-qual-melhor": "/centro-de-conhecimento/transporte-de-veiculos",

  // Cost page variants → existing cost page
  "/custos/quanto-custa-importar-carro-classico": "/custos/quanto-custa-importar-veiculo",
  "/custos/quanto-custa-trazer-carro-portugal": "/custos/quanto-custa-importar-veiculo",
  "/custos/quanto-custa-importar-carro-eua": "/custos/quanto-custa-importar-veiculo",

  // Route variants → existing route page
  "/rotas/enviar-carro-brasil-portugal": "/rotas/enviar-carro-brasil-europa",
};

// Valid SPA routes (paths that should serve index.html with 200)
const VALID_ROUTES: string[] = [
  "/",
  "/importacao-de-veiculos",
  "/exportacao-de-veiculos",
  "/despacho-aduaneiro",
  "/importacao-de-pecas",
  "/envios-aereos",
  "/admissao-temporaria",
  "/centro-de-conhecimento",
  "/minha-area",
  "/politica-de-privacidade",
  "/termos-de-uso",
  "/404",
];

// Route prefixes that are valid (dynamic routes)
const VALID_PREFIXES: string[] = [
  "/centro-de-conhecimento/",
  "/fotos/",
  "/custos/",
  "/rotas/",
  "/minha-area/",
];

function isValidRoute(pathname: string): boolean {
  // Exact match
  if (VALID_ROUTES.includes(pathname)) return true;
  // Prefix match (dynamic routes)
  if (VALID_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  return false;
}

function isStaticAsset(pathname: string): boolean {
  const staticExtensions = [
    ".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico",
    ".woff", ".woff2", ".ttf", ".eot", ".webp", ".avif", ".mp4",
    ".webm", ".json", ".xml", ".txt", ".pdf", ".map",
  ];
  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 1. Check for 301 redirects first
    const redirectTarget = REDIRECTS[pathname];
    if (redirectTarget) {
      return Response.redirect(new URL(redirectTarget, url.origin).toString(), 301);
    }

    // 2. Catch-all for /blog/* routes not in REDIRECTS → 410 Gone
    if (pathname.startsWith("/blog/")) {
      return new Response("410 Gone — This content has been permanently removed.", {
        status: 410,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // 3. Handle /f/* (old article routes) → 410 Gone
    if (pathname.startsWith("/f/")) {
      return new Response("410 Gone — This content has been permanently removed.", {
        status: 410,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // 4. Static assets — try to serve from ASSETS, return 404 if not found
    if (isStaticAsset(pathname)) {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status === 200) {
        return assetResponse;
      }
      return new Response("404 Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // 5. Malformed URLs (containing : which are stack traces pasted as URLs)
    if (pathname.includes(":") && !pathname.startsWith("/api")) {
      return new Response("404 Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // 6. Valid SPA routes — serve index.html
    if (isValidRoute(pathname)) {
      const indexRequest = new Request(new URL("/index.html", url.origin).toString(), request);
      return env.ASSETS.fetch(indexRequest);
    }

    // 7. Everything else — return proper 404
    // Serve the SPA's 404 page with a 404 status code
    const indexRequest = new Request(new URL("/index.html", url.origin).toString(), request);
    const response = await env.ASSETS.fetch(indexRequest);
    return new Response(response.body, {
      status: 404,
      headers: response.headers,
    });
  },
};
