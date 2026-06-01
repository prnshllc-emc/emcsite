/**
 * EMC Site Worker — SEO-aware routing layer
 * 
 * This Worker runs before static asset serving to handle:
 * 1. 301 redirects for legacy/moved routes
 * 2. 410 Gone for permanently removed content (old blog /f/ routes)
 * 3. 404 Not Found for malformed/invalid URLs
 * 4. Pass-through to ASSETS for valid SPA routes
 * 
 * Fixes Google Search Console "soft 404" errors by returning proper HTTP status codes
 * instead of serving index.html with 200 for non-existent routes.
 */

interface Env {
  ASSETS: Fetcher;
}

// All valid SPA routes (static paths)
const VALID_STATIC_ROUTES = new Set([
  '/',
  '/politica-de-privacidade',
  '/termos-de-uso',
  '/importacao-de-veiculos',
  '/exportacao-de-veiculos',
  '/despacho-aduaneiro',
  '/transporte-internacional-de-veiculos',
  '/importacao-de-carros-classicos',
  '/admissao-temporaria',
  '/rotas/enviar-carro-brasil-estados-unidos',
  '/rotas/enviar-carro-brasil-europa',
  '/rotas/importar-carro-estados-unidos-brasil',
  '/custos/quanto-custa-importar-veiculo',
  '/custos/quanto-custa-exportar-carro',
  '/centro-de-conhecimento',
  '/minha-area',
  '/404',
]);

// Dynamic route prefixes that accept parameters
const VALID_DYNAMIC_PREFIXES = [
  '/centro-de-conhecimento/', // /centro-de-conhecimento/:category and /:category/:article
  '/fotos/',                   // /fotos/:token
];

// 301 Permanent Redirects for legacy routes and GSC 404 URLs
const REDIRECTS: Record<string, string> = {
  // Legacy routes
  '/novo-orcamento': '/',
  '/rastrear': '/minha-area',
  '/loja': '/',

  // Blog articles → Centro de Conhecimento (articles moved)
  '/blog/guia-completo-importacao-veiculos-brasil': '/centro-de-conhecimento/importacao',
  '/blog/admissao-temporaria-veiculos-regras': '/centro-de-conhecimento/regulamentacoes',
  '/blog/portos-brasileiros-importacao-exportacao-veiculos': '/centro-de-conhecimento/transporte-de-veiculos',
  '/blog/regras-ibama-importacao-veiculos': '/centro-de-conhecimento/regulamentacoes',
  '/blog/importar-carro-japao-brasil-guia': '/centro-de-conhecimento/importacao',
  '/blog/como-exportar-veiculo-do-brasil': '/centro-de-conhecimento/exportacao',

  // Standalone content pages → relevant service/knowledge pages
  '/seguro-maritimo-veiculos-cobertura': '/centro-de-conhecimento/transporte-de-veiculos',
  '/lcvm-licenca-importacao': '/centro-de-conhecimento/regulamentacoes',

  // Cost page variants → existing cost pages
  '/custos/quanto-custa-importar-carro-classico': '/custos/quanto-custa-importar-veiculo',
  '/custos/quanto-custa-trazer-carro-portugal': '/custos/quanto-custa-importar-veiculo',
  '/custos/quanto-custa-importar-carro-eua': '/custos/quanto-custa-importar-veiculo',

  // Route variants → existing route pages
  '/rotas/enviar-carro-brasil-portugal': '/rotas/enviar-carro-brasil-europa',
};

// Check if a pathname is a valid SPA route
function isValidRoute(pathname: string): boolean {
  // Exact match
  if (VALID_STATIC_ROUTES.has(pathname)) return true;

  // Dynamic prefix match
  for (const prefix of VALID_DYNAMIC_PREFIXES) {
    if (pathname.startsWith(prefix) && pathname.length > prefix.length) {
      return true;
    }
  }

  return false;
}

// Check if the request is for a static asset (JS, CSS, images, fonts, etc.)
function isStaticAsset(pathname: string): boolean {
  // Common static asset extensions
  const assetExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif',
    '.ico', '.woff', '.woff2', '.ttf', '.eot', '.json', '.xml', '.txt',
    '.map', '.webmanifest', '.mp4', '.webm', '.pdf',
  ];
  return assetExtensions.some(ext => pathname.endsWith(ext));
}

// Generate a minimal 404 HTML page
function generate404Html(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex">
  <title>Página Não Encontrada | Enviando Meu Carro</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0c0c0e; color: #f7f5f4; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .container { text-align: center; padding: 2rem; max-width: 500px; }
    h1 { font-size: 4rem; font-weight: 700; color: #d93711; margin-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; margin-bottom: 1rem; }
    p { color: #a0a0a0; margin-bottom: 2rem; line-height: 1.6; }
    a { display: inline-block; padding: 0.75rem 2rem; background: #d93711; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; transition: background 0.2s; }
    a:hover { background: #b52e0e; }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <h2>Página Não Encontrada</h2>
    <p>A página que você está procurando não existe, foi movida ou removida.</p>
    <a href="https://enviandomeucarro.com/">Voltar ao Início</a>
  </div>
</body>
</html>`;
}

// Generate a minimal 410 Gone HTML page
function generate410Html(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex">
  <title>Conteúdo Removido | Enviando Meu Carro</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0c0c0e; color: #f7f5f4; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .container { text-align: center; padding: 2rem; max-width: 500px; }
    h1 { font-size: 4rem; font-weight: 700; color: #d93711; margin-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; margin-bottom: 1rem; }
    p { color: #a0a0a0; margin-bottom: 2rem; line-height: 1.6; }
    a { display: inline-block; padding: 0.75rem 2rem; background: #d93711; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; transition: background 0.2s; }
    a:hover { background: #b52e0e; }
  </style>
</head>
<body>
  <div class="container">
    <h1>410</h1>
    <h2>Conteúdo Removido</h2>
    <p>Este conteúdo foi permanentemente removido. Visite nosso Centro de Conhecimento para artigos atualizados.</p>
    <a href="https://enviandomeucarro.com/centro-de-conhecimento">Centro de Conhecimento</a>
  </div>
</body>
</html>`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 1. Let static assets pass through to ASSETS binding directly
    if (isStaticAsset(pathname)) {
      const assetResponse = await env.ASSETS.fetch(request);
      // If the asset exists, serve it
      if (assetResponse.status === 200) {
        return assetResponse;
      }
      // If asset doesn't exist (e.g., malformed URLs like .js:9:112628), return 404
      return new Response(generate404Html(), {
        status: 404,
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'X-Robots-Tag': 'noindex',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    // 2. Check for 301 redirects (legacy routes)
    const normalizedPath = pathname.endsWith('/') && pathname !== '/'
      ? pathname.slice(0, -1)
      : pathname;

    if (REDIRECTS[normalizedPath]) {
      return Response.redirect(
        `https://enviandomeucarro.com${REDIRECTS[normalizedPath]}`,
        301
      );
    }

    // 3. Check for removed content (/f/* routes — old blog/feed)
    if (normalizedPath.startsWith('/f/')) {
      return new Response(generate410Html(), {
        status: 410,
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'X-Robots-Tag': 'noindex',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    // 4. Check if it's a valid SPA route
    if (isValidRoute(normalizedPath)) {
      // Serve the SPA (index.html) via ASSETS binding
      return env.ASSETS.fetch(request);
    }

    // 5. Unknown route — return proper 404
    return new Response(generate404Html(), {
      status: 404,
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'X-Robots-Tag': 'noindex',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  },
};
