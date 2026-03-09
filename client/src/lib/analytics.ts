/**
 * EMC — Sistema de Tracking Padrão Ouro
 * 
 * Google Tags: G-K5GHBLZBTQ, GT-5RMBD99G, AW-17154661982, GT-WPDP3HDS
 * Meta Pixel: 1460384848838281
 * 
 * Eventos rastreados:
 * - CTA clicks (nome, posição, destino)
 * - Scroll depth (25%, 50%, 75%, 100%)
 * - Section visibility (engajamento por seção)
 * - Navigation clicks (menu, anchor)
 * - Modal interactions (open, close, submit)
 * - WhatsApp clicks (com origem)
 * - Calculator interactions
 * - Outbound link clicks
 * - Page timing / engagement
 */

// ============================================================
// TYPES
// ============================================================

interface GtagEvent {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: unknown;
}

interface DataLayerEvent {
  event: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: DataLayerEvent[];
    fbq: (...args: unknown[]) => void;
  }
}

// ============================================================
// GOOGLE TAG (gtag.js) — CORE
// ============================================================

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

function pushDataLayer(event: DataLayerEvent) {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
  }
}

// ============================================================
// META PIXEL — ATIVO
// ============================================================

const META_PIXEL_ID = "1460384848838281";

function fbqTrack(eventName: string, params?: Record<string, unknown>) {
  if (META_PIXEL_ID && typeof window !== "undefined" && window.fbq) {
    if (params) {
      window.fbq("track", eventName, params);
    } else {
      window.fbq("track", eventName);
    }
  }
}

// ============================================================
// CTA TRACKING
// ============================================================

export function trackCTAClick(
  ctaName: string,
  ctaPosition: string,
  destination: string,
  ctaText?: string
) {
  // Google Analytics
  gtag("event", "cta_click", {
    event_category: "CTA",
    event_label: ctaName,
    cta_position: ctaPosition,
    cta_destination: destination,
    cta_text: ctaText || ctaName,
  });

  // Google Ads Conversion
  gtag("event", "conversion", {
    send_to: "AW-17154661982/cta_click",
    event_category: "CTA",
    event_label: ctaName,
  });

  // Data Layer
  pushDataLayer({
    event: "cta_click",
    cta_name: ctaName,
    cta_position: ctaPosition,
    cta_destination: destination,
    cta_text: ctaText || ctaName,
  });

  // Meta Pixel
  fbqTrack("Lead", {
    content_name: ctaName,
    content_category: "CTA",
  });
}

// ============================================================
// WHATSAPP TRACKING
// ============================================================

export function trackWhatsAppClick(origin: string, message?: string) {
  gtag("event", "whatsapp_click", {
    event_category: "Contato",
    event_label: origin,
    contact_method: "whatsapp",
    message_preview: message?.substring(0, 100),
  });

  gtag("event", "conversion", {
    send_to: "AW-17154661982/whatsapp_click",
    event_category: "Contato",
    event_label: origin,
  });

  pushDataLayer({
    event: "whatsapp_click",
    click_origin: origin,
    contact_method: "whatsapp",
  });

  fbqTrack("Contact", {
    content_name: "WhatsApp",
    content_category: origin,
  });
}

// ============================================================
// NAVIGATION TRACKING
// ============================================================

export function trackNavClick(label: string, anchor: string) {
  gtag("event", "navigation_click", {
    event_category: "Navegação",
    event_label: label,
    nav_destination: anchor,
  });

  pushDataLayer({
    event: "navigation_click",
    nav_label: label,
    nav_destination: anchor,
  });
}

// ============================================================
// MODAL TRACKING
// ============================================================

export function trackModalOpen(modalName: string) {
  gtag("event", "modal_open", {
    event_category: "Modal",
    event_label: modalName,
  });

  pushDataLayer({
    event: "modal_open",
    modal_name: modalName,
  });
}

export function trackModalClose(modalName: string) {
  gtag("event", "modal_close", {
    event_category: "Modal",
    event_label: modalName,
  });

  pushDataLayer({
    event: "modal_close",
    modal_name: modalName,
  });
}

export function trackModalSubmit(modalName: string, data?: Record<string, unknown>) {
  gtag("event", "modal_submit", {
    event_category: "Modal",
    event_label: modalName,
    ...data,
  });

  pushDataLayer({
    event: "modal_submit",
    modal_name: modalName,
    ...data,
  });

  fbqTrack("SubmitApplication", {
    content_name: modalName,
  });
}

// ============================================================
// CALCULATOR TRACKING
// ============================================================

export function trackCalculatorInteraction(action: string, details?: Record<string, unknown>) {
  gtag("event", "calculator_interaction", {
    event_category: "Calculadora",
    event_label: action,
    ...details,
  });

  pushDataLayer({
    event: "calculator_interaction",
    calculator_action: action,
    ...details,
  });
}

// ============================================================
// OUTBOUND LINK TRACKING
// ============================================================

export function trackOutboundLink(url: string, label: string) {
  gtag("event", "outbound_link", {
    event_category: "Outbound",
    event_label: label,
    link_url: url,
    transport_type: "beacon",
  });

  pushDataLayer({
    event: "outbound_link",
    link_url: url,
    link_label: label,
  });
}

// ============================================================
// SCROLL DEPTH TRACKING
// ============================================================

const scrollMilestones = new Set<number>();

export function initScrollTracking() {
  if (typeof window === "undefined") return;

  const thresholds = [25, 50, 75, 100];

  function checkScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    thresholds.forEach((threshold) => {
      if (scrollPercent >= threshold && !scrollMilestones.has(threshold)) {
        scrollMilestones.add(threshold);

        gtag("event", "scroll_depth", {
          event_category: "Engajamento",
          event_label: `${threshold}%`,
          scroll_percentage: threshold,
        });

        pushDataLayer({
          event: "scroll_depth",
          scroll_percentage: threshold,
        });

        if (threshold === 100) {
          fbqTrack("ViewContent", {
            content_name: "Página completa",
          });
        }
      }
    });
  }

  window.addEventListener("scroll", checkScroll, { passive: true });
}

// ============================================================
// SECTION VISIBILITY / ENGAGEMENT TRACKING
// ============================================================

const sectionTimers: Map<string, number> = new Map();
const sectionTracked: Set<string> = new Set();

export function initSectionTracking() {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const sectionId = entry.target.id || entry.target.getAttribute("data-section") || "unknown";

        if (entry.isIntersecting) {
          // Section entered viewport
          if (!sectionTracked.has(sectionId)) {
            sectionTracked.add(sectionId);

            gtag("event", "section_view", {
              event_category: "Engajamento",
              event_label: sectionId,
              section_name: sectionId,
            });

            pushDataLayer({
              event: "section_view",
              section_name: sectionId,
            });
          }

          // Start timing
          sectionTimers.set(sectionId, Date.now());
        } else {
          // Section left viewport — calculate time spent
          const startTime = sectionTimers.get(sectionId);
          if (startTime) {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            if (timeSpent >= 3) {
              // Only track if user spent at least 3 seconds
              gtag("event", "section_engagement", {
                event_category: "Engajamento",
                event_label: sectionId,
                section_name: sectionId,
                engagement_time_seconds: timeSpent,
              });

              pushDataLayer({
                event: "section_engagement",
                section_name: sectionId,
                engagement_time_seconds: timeSpent,
              });
            }
            sectionTimers.delete(sectionId);
          }
        }
      });
    },
    { threshold: 0.3 } // 30% of section visible
  );

  // Observe all sections
  setTimeout(() => {
    const sections = document.querySelectorAll("section[id], [data-section]");
    sections.forEach((section) => observer.observe(section));
  }, 1000);
}

// ============================================================
// PHONE CALL TRACKING
// ============================================================

export function trackPhoneCall(origin: string, phoneNumber: string) {
  gtag("event", "phone_call", {
    event_category: "Contato",
    event_label: origin,
    contact_method: "phone",
    phone_number: phoneNumber,
  });

  gtag("event", "conversion", {
    send_to: "AW-17154661982/phone_call",
    event_category: "Contato",
  });

  pushDataLayer({
    event: "phone_call",
    click_origin: origin,
    phone_number: phoneNumber,
  });

  fbqTrack("Contact", {
    content_name: "Telefone",
    content_category: origin,
  });
}

// ============================================================
// EMAIL TRACKING
// ============================================================

export function trackEmailClick(origin: string, email: string) {
  gtag("event", "email_click", {
    event_category: "Contato",
    event_label: origin,
    contact_method: "email",
    email_address: email,
  });

  pushDataLayer({
    event: "email_click",
    click_origin: origin,
    email_address: email,
  });
}

// ============================================================
// FAQ TRACKING
// ============================================================

export function trackFAQInteraction(question: string, action: "open" | "close") {
  gtag("event", "faq_interaction", {
    event_category: "FAQ",
    event_label: question,
    faq_action: action,
  });

  pushDataLayer({
    event: "faq_interaction",
    faq_question: question,
    faq_action: action,
  });
}

// ============================================================
// PAGE ENGAGEMENT / TIMING
// ============================================================

export function initPageEngagement() {
  if (typeof window === "undefined") return;

  const pageLoadTime = Date.now();

  // Track time on page when user leaves
  function trackTimeOnPage() {
    const timeOnPage = Math.round((Date.now() - pageLoadTime) / 1000);

    gtag("event", "page_engagement_time", {
      event_category: "Engajamento",
      event_label: "Tempo na página",
      engagement_time_seconds: timeOnPage,
    });

    pushDataLayer({
      event: "page_engagement_time",
      engagement_time_seconds: timeOnPage,
    });
  }

  window.addEventListener("beforeunload", trackTimeOnPage);

  // Track engaged users (stayed > 30 seconds)
  setTimeout(() => {
    gtag("event", "engaged_user", {
      event_category: "Engajamento",
      event_label: "30s+",
    });

    pushDataLayer({
      event: "engaged_user",
      engagement_threshold: "30s",
    });
  }, 30000);

  // Track highly engaged users (stayed > 120 seconds)
  setTimeout(() => {
    gtag("event", "highly_engaged_user", {
      event_category: "Engajamento",
      event_label: "120s+",
    });

    pushDataLayer({
      event: "highly_engaged_user",
      engagement_threshold: "120s",
    });

    fbqTrack("ViewContent", {
      content_name: "Highly Engaged User",
    });
  }, 120000);
}

// ============================================================
// SOCIAL LINK TRACKING
// ============================================================

export function trackSocialClick(platform: string, url: string) {
  gtag("event", "social_click", {
    event_category: "Social",
    event_label: platform,
    social_url: url,
  });

  pushDataLayer({
    event: "social_click",
    social_platform: platform,
    social_url: url,
  });
}

// ============================================================
// INITIALIZATION — Call once on app mount
// ============================================================

export function initAllTracking() {
  initScrollTracking();
  initSectionTracking();
  initPageEngagement();

  // Initial page view data layer push
  pushDataLayer({
    event: "page_loaded",
    page_title: document.title,
    page_url: window.location.href,
    page_path: window.location.pathname,
    timestamp: new Date().toISOString(),
  });
}
