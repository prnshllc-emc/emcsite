/**
 * EMC — Cookie Consent Management (LGPD Compliant)
 *
 * Manages user consent for different cookie categories:
 * - necessary: Always active (session, security, basic functionality)
 * - analytics: Google Analytics, scroll tracking, section engagement
 * - marketing: Meta Pixel, Google Ads conversions, remarketing
 *
 * Consent is stored in localStorage under "emc_cookie_consent".
 * Scripts are only loaded/activated after explicit user consent.
 */

export interface CookieConsent {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  timestamp: string; // ISO date of consent
  version: string; // Consent version for future policy changes
}

const STORAGE_KEY = "emc_cookie_consent";
const CONSENT_VERSION = "1.0";

/**
 * Get the current consent state from localStorage.
 * Returns null if no consent has been given yet.
 */
export function getConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const consent: CookieConsent = JSON.parse(stored);
    // If version changed, require new consent
    if (consent.version !== CONSENT_VERSION) return null;
    return consent;
  } catch {
    return null;
  }
}

/**
 * Save consent preferences to localStorage.
 */
export function saveConsent(consent: Omit<CookieConsent, "timestamp" | "version" | "necessary">): CookieConsent {
  const fullConsent: CookieConsent = {
    necessary: true,
    analytics: consent.analytics,
    marketing: consent.marketing,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullConsent));
  }
  return fullConsent;
}

/**
 * Accept all cookies.
 */
export function acceptAll(): CookieConsent {
  return saveConsent({ analytics: true, marketing: true });
}

/**
 * Accept only necessary cookies (reject optional).
 */
export function rejectOptional(): CookieConsent {
  return saveConsent({ analytics: false, marketing: false });
}

/**
 * Check if a specific category is consented.
 */
export function hasConsent(category: "analytics" | "marketing"): boolean {
  const consent = getConsent();
  if (!consent) return false;
  return consent[category];
}

/**
 * Check if the user has made any consent choice.
 */
export function hasConsentChoice(): boolean {
  return getConsent() !== null;
}

/**
 * Remove consent (for "manage cookies" feature).
 */
export function revokeConsent(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Load Google Tag Manager / gtag.js scripts dynamically.
 * Only called when analytics consent is given.
 */
export function loadAnalyticsScripts(): void {
  if (typeof window === "undefined") return;
  // Check if already loaded
  if (document.querySelector('script[src*="googletagmanager.com/gtag"]')) return;

  // Load gtag.js
  const gtagScript = document.createElement("script");
  gtagScript.async = true;
  gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=G-K5GHBLZBTQ";
  document.head.appendChild(gtagScript);

  // Initialize gtag
  gtagScript.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args as unknown as { event: string });
    }
    window.gtag = gtag as typeof window.gtag;

    gtag("js", new Date());
    gtag("config", "G-K5GHBLZBTQ", {
      send_page_view: true,
      cookie_flags: "SameSite=None;Secure",
      link_attribution: true,
    });
    gtag("config", "GT-5RMBD99G");
    gtag("config", "GT-WPDP3HDS");

    // Only load Google Ads if marketing is also consented
    if (hasConsent("marketing")) {
      gtag("config", "AW-17154661982");
    }
  };
}

/**
 * Load Meta Pixel script dynamically.
 * Only called when marketing consent is given.
 */
export function loadMarketingScripts(): void {
  if (typeof window === "undefined") return;
  // Check if already loaded
  if (typeof window.fbq === "function") return;

  // Meta Pixel
  (function (f: Window, b: Document, e: string, v: string) {
    const n: any = (f as any).fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!(f as any)._fbq) (f as any)._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s.parentNode?.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  (window as any).fbq("init", "1460384848838281");
  (window as any).fbq("track", "PageView");

  // Also load Google Ads if not already loaded
  if (hasConsent("analytics") && window.gtag) {
    window.gtag("config", "AW-17154661982");
  }
}

/**
 * Apply consent: load scripts based on current consent state.
 * Should be called after consent is given or on page load if consent exists.
 */
export function applyConsent(): void {
  const consent = getConsent();
  if (!consent) return;

  if (consent.analytics) {
    loadAnalyticsScripts();
  }
  if (consent.marketing) {
    loadMarketingScripts();
  }
}
