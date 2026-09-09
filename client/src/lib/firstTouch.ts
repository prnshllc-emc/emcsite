/**
 * firstTouch.ts — primeiro toque de origem, capturado UMA vez e nunca sobrescrito.
 *
 * O que captura, na primeira visita com evidência: utm_* da URL, gclid/gbraid/
 * wbraid (Google Ads), fbclid (Meta), o referrer externo e a landing page.
 * Guarda em localStorage (90 dias) e num cookie no domínio raiz
 * (`.enviandomeucarro.com`, 90 dias) para a calculadora — outro subdomínio —
 * ler o MESMO primeiro toque.
 *
 * Por que existe (achado da mesa Ruflo, 09/09/2026): o site mandava
 * `utm_source=site_emc` para a calculadora e `[Ref: site/whatsapp/geral]` para
 * o WhatsApp — o LUGAR do clique, nunca a ORIGEM do visitante. Quem chegou por
 * anúncio do Google virava "site". Este módulo separa as duas coisas: a origem
 * (primeiro toque) viaja intacta; o lugar do clique vai como `cta=`.
 *
 * Regras: nunca sobrescreve; sem evidência não grava nada (visita direta é
 * "desconhecido", não "site"); nada aqui afirma mídia paga — quem deriva a
 * origem é o OS, a partir de gclid/fbclid/medium.
 */

export interface FirstTouch {
  src?: string;
  med?: string;
  camp?: string;
  content?: string;
  term?: string;
  gclid?: string;
  fbclid?: string;
  ref?: string;
  lp?: string;
  /** ISO — quando o toque aconteceu */
  em: string;
}

export const FIRST_TOUCH_KEY = "emc_ft";
const COOKIE_DOMAIN = ".enviandomeucarro.com";
const TTL_DAYS = 90;
const INTERNAL_HOSTS = /(^|\.)enviandomeucarro\.com$/i;

function safeStorage(): Storage | null {
  try { return typeof window !== "undefined" ? window.localStorage : null; } catch { return null; }
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function writeCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  const exp = new Date(Date.now() + TTL_DAYS * 864e5).toUTCString();
  const host = typeof location !== "undefined" ? location.hostname : "";
  const domain = INTERNAL_HOSTS.test(host) ? `; Domain=${COOKIE_DOMAIN}` : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${exp}; Path=/; SameSite=Lax; Secure${domain}`;
}

function parse(raw: string | null): FirstTouch | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw);
    if (!o || typeof o !== "object" || typeof o.em !== "string") return null;
    if (Date.now() - new Date(o.em).getTime() > TTL_DAYS * 864e5) return null; // expirado
    return o as FirstTouch;
  } catch { return null; }
}

/** Lê o primeiro toque guardado (localStorage, senão cookie). null se não há. */
export function getFirstTouch(): FirstTouch | null {
  const ls = safeStorage();
  return parse(ls?.getItem(FIRST_TOUCH_KEY) ?? null) ?? parse(readCookie(FIRST_TOUCH_KEY));
}

/** Monta um toque a partir de uma URL + referrer. null quando não há evidência nenhuma. */
export function touchFromLocation(href: string, referrer: string | null | undefined, now: Date = new Date()): FirstTouch | null {
  let u: URL;
  try { u = new URL(href); } catch { return null; }
  const p = u.searchParams;
  const pick = (k: string) => { const v = (p.get(k) ?? "").trim(); return v ? v.slice(0, 200) : undefined; };
  const t: FirstTouch = {
    src: pick("utm_source"), med: pick("utm_medium"), camp: pick("utm_campaign"),
    content: pick("utm_content"), term: pick("utm_term"),
    gclid: pick("gclid") ?? pick("gbraid") ?? pick("wbraid"),
    fbclid: pick("fbclid"),
    em: now.toISOString(),
  };
  let refHost = "";
  try { refHost = referrer ? new URL(referrer).hostname : ""; } catch { refHost = ""; }
  if (refHost && !INTERNAL_HOSTS.test(refHost)) t.ref = referrer!.slice(0, 300);
  const hasEvidence = !!(t.src || t.med || t.camp || t.gclid || t.fbclid || t.ref);
  if (!hasEvidence) return null;
  t.lp = u.pathname.slice(0, 200); // só o caminho: os parâmetros já estão nos campos acima
  for (const k of Object.keys(t) as (keyof FirstTouch)[]) if (t[k] === undefined) delete t[k];
  return t;
}

/**
 * Captura na carga da página. Nunca sobrescreve um toque existente.
 * Devolve o toque vigente (o antigo, se já havia; o novo, se acabou de gravar; null se nada).
 */
export function captureFirstTouch(): FirstTouch | null {
  if (typeof window === "undefined") return null;
  const existing = getFirstTouch();
  if (existing) {
    // cookie pode ter sido apagado; re-espelha para a calculadora enxergar
    if (!readCookie(FIRST_TOUCH_KEY)) writeCookie(FIRST_TOUCH_KEY, JSON.stringify(existing));
    return existing;
  }
  const t = touchFromLocation(window.location.href, document.referrer);
  if (!t) return null;
  const raw = JSON.stringify(t);
  safeStorage()?.setItem(FIRST_TOUCH_KEY, raw);
  writeCookie(FIRST_TOUCH_KEY, raw);
  return t;
}

/** Só para testes. */
export function _clearFirstTouchForTests(): void {
  safeStorage()?.removeItem(FIRST_TOUCH_KEY);
  if (typeof document !== "undefined") document.cookie = `${FIRST_TOUCH_KEY}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`;
}

const TAG_SAFE = /[;\]\r\n]/g;
const clean = (v: string | undefined) => (v ?? "").replace(TAG_SAFE, "_").trim();

/**
 * Tag `[Ref: …]` no formato chave=valor que o OS lê (server/growth/origemToque.ts).
 * Origem = primeiro toque; `cta` = lugar do clique. Sem toque, `src=site;med=whatsapp`
 * (o OS trata como origem desconhecida — que é a verdade).
 */
export function buildRefTag(ft: FirstTouch | null, cta: string): string {
  const parts: string[] = [];
  const add = (k: string, v: string | undefined) => { const c = clean(v); if (c) parts.push(`${k}=${c}`); };
  if (ft) {
    add("src", ft.src); add("med", ft.med); add("camp", ft.camp); add("content", ft.content); add("term", ft.term);
    add("gclid", ft.gclid); add("fbclid", ft.fbclid); add("lp", ft.lp); add("ref", ft.ref);
  }
  if (!parts.length) { add("src", "site"); add("med", "whatsapp"); }
  add("cta", cta);
  return `[Ref: ${parts.join(";")}]`;
}

/**
 * URL da calculadora carregando o primeiro toque (utm, gclid, fbclid) e o lugar
 * do clique em `emc_cta`. Nunca mais `utm_source=site_emc` por padrão: sem
 * toque, a URL vai limpa (a calculadora também lê o cookie compartilhado).
 */
export function calculadoraUrl(cta: string, base = "https://calculadora.enviandomeucarro.com"): string {
  const u = new URL(base);
  const ft = getFirstTouch();
  if (ft) {
    const map: [string, string | undefined][] = [
      ["utm_source", ft.src], ["utm_medium", ft.med], ["utm_campaign", ft.camp], ["utm_content", ft.content], ["utm_term", ft.term],
      ["gclid", ft.gclid], ["fbclid", ft.fbclid], ["ft_lp", ft.lp], ["ft_ref", ft.ref], ["ft_em", ft.em],
    ];
    for (const [k, v] of map) if (v) u.searchParams.set(k, v);
  }
  u.searchParams.set("emc_cta", cta);
  return u.toString();
}
