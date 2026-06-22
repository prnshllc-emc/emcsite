/**
 * Cloudflare Worker for enviandomeucarro.com
 * 
 * Architecture: Edge proxy with DEFINITIVE pattern-based routing.
 * 
 * STRATEGY: Instead of listing individual URLs (which fails as new ones appear),
 * we define ONLY the valid routes and treat everything else appropriately.
 * 
 * Valid SPA routes (whitelist):
 *   /
 *   /importacao-de-veiculos
 *   /exportacao-de-veiculos
 *   /despacho-aduaneiro
 *   /importacao-de-pecas
 *   /envios-aereos
 *   /admissao-temporaria
 *   /centro-de-conhecimento
 *   /centro-de-conhecimento/:category
 *   /centro-de-conhecimento/:category/:slug
 *   /minha-area
 *   /minha-area/*
 *   /fotos/:id
 *   /custos/quanto-custa-importar-veiculo
 *   /rotas/enviar-carro-brasil-europa
 *   /rotas/enviar-carro-brasil-eua
 *   /politica-de-privacidade
 *   /termos-de-uso
 *   /api/*
 *   Static assets: /assets/*, /robots.txt, /sitemap.xml, /favicon.ico, etc.
 */

const ORIGIN = "https://emcsite-production.up.railway.app";

// ─── VALID ROUTE PATTERNS ─────────────────────────────────────────────────────
// These are the ONLY routes that should be proxied to Railway.
// Anything not matching these patterns gets a redirect or error at the edge.

const VALID_EXACT_ROUTES = new Set([
  "/",
  "/importacao-de-veiculos",
  "/exportacao-de-veiculos",
  "/despacho-aduaneiro",
  "/importacao-de-pecas",
  "/envios-aereos",
  "/admissao-temporaria",
  "/centro-de-conhecimento",
  "/minha-area",
  "/custos/quanto-custa-importar-veiculo",
  "/rotas/enviar-carro-brasil-europa",
  "/rotas/enviar-carro-brasil-eua",
  "/politica-de-privacidade",
  "/termos-de-uso",
]);

// Prefixes that are valid (dynamic routes under these paths)
const VALID_PREFIX_ROUTES = [
  "/centro-de-conhecimento/",
  "/minha-area/",
  "/fotos/",
  "/api/",
];

// Static file extensions that should always be proxied
const STATIC_EXTENSIONS = /\.(js|css|html|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|avif|mp4|webm|json|xml|txt|map)$/i;

// ─── PATTERN-BASED REDIRECTS ──────────────────────────────────────────────────
// Generic rules that catch ALL variants, not individual URLs.

// /blog/* → Always redirect to Centro de Conhecimento (Marina generates these)
// /f/* → Old article routes
// /custos/* (unknown) → Redirect to the one valid cost page
// /rotas/* (unknown) → Redirect to the main routes page

// Specific legacy redirects for pages that had unique content
const SPECIFIC_REDIRECTS: Record<string, string> = {
  "/novo-orcamento": "/",
  "/rastrear": "/minha-area",
  "/loja": "/",
  "/lcvm-licenca-importacao": "/centro-de-conhecimento/regulamentacoes",
  "/seguro-maritimo-veiculos-cobertura": "/centro-de-conhecimento/transporte-de-veiculos",
  "/roro-vs-container-qual-melhor": "/centro-de-conhecimento/transporte-de-veiculos",
};

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

function isValidRoute(pathname: string): boolean {
  // Exact match
  if (VALID_EXACT_ROUTES.has(pathname)) return true;

  // Prefix match (dynamic routes)
  for (const prefix of VALID_PREFIX_ROUTES) {
    if (pathname.startsWith(prefix)) return true;
  }

  // Static files (assets, fonts, images, etc.)
  if (STATIC_EXTENSIONS.test(pathname)) return true;

  // Root-level static files
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml" || pathname === "/favicon.ico" || pathname === "/manifest.json") return true;

  return false;
}

function getRedirectForInvalidRoute(pathname: string, origin: string): Response | null {
  // 1. Specific redirects first
  const specific = SPECIFIC_REDIRECTS[pathname];
  if (specific) {
    return Response.redirect(new URL(specific, origin).toString(), 301);
  }

  // 2. ALL /blog/* → 301 to /centro-de-conhecimento (catches Marina-generated URLs forever)
  if (pathname.startsWith("/blog/")) {
    return Response.redirect(new URL("/centro-de-conhecimento", origin).toString(), 301);
  }

  // 3. ALL /f/* → 301 to /centro-de-conhecimento (old article format)
  if (pathname.startsWith("/f/")) {
    return Response.redirect(new URL("/centro-de-conhecimento", origin).toString(), 301);
  }

  // 4. ALL /custos/* (that aren't the valid one) → 301 to the valid cost page
  if (pathname.startsWith("/custos/")) {
    return Response.redirect(new URL("/custos/quanto-custa-importar-veiculo", origin).toString(), 301);
  }

  // 5. ALL /rotas/* (that aren't the valid ones) → 301 to the main routes page
  if (pathname.startsWith("/rotas/")) {
    return Response.redirect(new URL("/rotas/enviar-carro-brasil-europa", origin).toString(), 301);
  }

  return null;
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // ═══ STEP 1: Reject obviously malformed URLs ═══
    
    // URLs containing ":" in path (JavaScript stack traces pasted as URLs)
    // e.g., /assets/index-D-pAYgmF.js:9:116003
    if (pathname.includes(":")) {
      return new Response("404 Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain", "X-Robots-Tag": "noindex" },
      });
    }

    // URLs with $ (malformed, e.g., /$)
    if (pathname.includes("$")) {
      return new Response("404 Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain", "X-Robots-Tag": "noindex" },
      });
    }

    // ═══ STEP 2: Check if it's a valid route → proxy to Railway ═══
    
    if (isValidRoute(pathname)) {
      return proxyToOrigin(request, url, pathname);
    }

    // ═══ STEP 3: Not a valid route → try to redirect ═══
    
    const redirect = getRedirectForInvalidRoute(pathname, url.origin);
    if (redirect) {
      return redirect;
    }

    // ═══ STEP 4: Unknown route, no redirect match → 404 ═══
    // This catches EVERYTHING else that doesn't match any known pattern.
    // The X-Robots-Tag: noindex tells Google to stop trying to index these.
    
    return new Response("404 Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain", "X-Robots-Tag": "noindex" },
    });
  },
};

// ─── PROXY FUNCTION ───────────────────────────────────────────────────────────

async function proxyToOrigin(request: Request, url: URL, pathname: string): Promise<Response> {
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

  // Clone response with proper headers
  const responseHeaders = new Headers(originResponse.headers);
  
  // Add security headers
  responseHeaders.set("X-Content-Type-Options", "nosniff");
  responseHeaders.set("X-Frame-Options", "SAMEORIGIN");
  responseHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return new Response(originResponse.body, {
    status: originResponse.status,
    statusText: originResponse.statusText,
    headers: responseHeaders,
  });
}
