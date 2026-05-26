/**
 * EMC — Cookie Consent Management (LGPD Compliant)
 * 
 * Uses Google Consent Mode v2:
 * - gtag.js and Meta Pixel are loaded in index.html with consent DENIED by default
 * - When user grants consent, we call gtag('consent', 'update', {...}) to unlock tracking
 * - This approach is recommended by Google and fully LGPD compliant
 *
 * Consent categories:
 * - necessary: Always active (session, security, basic functionality)
 * - analytics: Google Analytics, scroll tracking, section engagement
 * - marketing: Meta Pixel, Google Ads conversions, remarketing
 *
 * Consent is stored in localStorage under "emc_cookie_consent".
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

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    fbq: (...args: unknown[]) => void;
  }
}

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
 * Update Google Consent Mode based on user preferences.
 * This is the key function — it tells gtag to unlock tracking.
 * gtag.js is already loaded in index.html with consent denied by default.
 */
function updateGoogleConsent(analytics: boolean, marketing: boolean): void {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag('consent', 'update', {
    'analytics_storage': analytics ? 'granted' : 'denied',
    'ad_storage': marketing ? 'granted' : 'denied',
    'ad_user_data': marketing ? 'granted' : 'denied',
    'ad_personalization': marketing ? 'granted' : 'denied',
    'personalization_storage': marketing ? 'granted' : 'denied',
  });
}

/**
 * Update Meta Pixel consent state.
 * fbq is already loaded in index.html with consent revoked.
 */
function updateMetaConsent(marketing: boolean): void {
  if (typeof window === "undefined" || !window.fbq) return;

  if (marketing) {
    window.fbq('consent', 'grant');
  }
  // If not granted, it stays in revoked state (set in index.html)
}

/**
 * Apply consent: update Google and Meta consent states based on stored preferences.
 * Should be called after consent is given or on page load if consent exists.
 * 
 * NOTE: This no longer loads scripts dynamically — scripts are already in index.html.
 * It only updates the consent state so tracking can begin collecting data.
 */
export function applyConsent(): void {
  const consent = getConsent();
  if (!consent) return;

  // Update Google Consent Mode v2
  updateGoogleConsent(consent.analytics, consent.marketing);

  // Update Meta Pixel consent
  if (consent.marketing) {
    updateMetaConsent(true);
  }
}

// Legacy exports for backward compatibility (no longer needed but kept to avoid breaking imports)
export function loadAnalyticsScripts(): void {
  // No-op: gtag.js is now loaded in index.html
  // Consent is managed via Consent Mode v2
  updateGoogleConsent(true, hasConsent("marketing"));
}

export function loadMarketingScripts(): void {
  // No-op: Meta Pixel is now loaded in index.html
  // Consent is managed via fbq('consent', 'grant')
  updateMetaConsent(true);
  updateGoogleConsent(hasConsent("analytics"), true);
}
