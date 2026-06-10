/**
 * Cloudflare Worker for enviandomeucarro.com
 * 
 * Architecture: Edge proxy pattern
 * - Handles 301 redirects for legacy/SEO URLs at the edge (fast, no origin hit)
 * - Returns 404/410 for known dead routes at the edge
 * - Proxies all valid requests to Railway origin (nginx + SPA)
 * 
 * This Worker does NOT use ASSETS binding — the SPA is served by Railway.
 */

const ORIGIN = "https://emcsite-production.up.railway.app";

// 301 Permanent redirects for legacy/SEO URLs
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

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 1. Check for 301 redirects (handled at edge, no origin hit)
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

    // 4. Malformed URLs (containing : which are stack traces pasted as URLs)
    if (pathname.includes(":") && !pathname.startsWith("/api")) {
      return new Response("404 Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // 5. Proxy everything else to Railway origin
    const originUrl = new URL(pathname + url.search, ORIGIN);

    const proxyHeaders = new Headers(request.headers);
    proxyHeaders.set("Host", new URL(ORIGIN).host);
    proxyHeaders.set("X-Forwarded-Host", url.host);
    proxyHeaders.set("X-Forwarded-Proto", "https");

    const originResponse = await fetch(originUrl.toString(), {
      method: request.method,
      headers: proxyHeaders,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
      redirect: "manual",
    });

    // Return the origin response directly
    return new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers: originResponse.headers,
    });
  },
};
