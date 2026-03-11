/**
 * Contact utilities — now supports dynamic settings from DB.
 * Components should use useSiteSettings() + openContactWithNumber() for dynamic behavior.
 * The legacy openContact() still works as a fallback with the default number.
 *
 * UTM parameters are automatically appended to WhatsApp URLs for CRM tracking.
 */

const DEFAULT_WHATSAPP = "5511992448920";

/**
 * Build a WhatsApp URL with UTM tracking parameters.
 * UTM params are embedded in the message text so they appear in HubSpot CRM.
 */
function buildWhatsAppUrl(
  digits: string,
  message: string,
  utmSource: string,
  utmMedium: string,
  utmCampaign: string
): string {
  // Append UTM tracking tag to the message for CRM attribution
  const utmTag = `\n\n[Ref: ${utmSource}/${utmMedium}/${utmCampaign}]`;
  const fullMessage = message + utmTag;
  const text = encodeURIComponent(fullMessage);
  return `https://wa.me/${digits}?text=${text}`;
}

/**
 * Open WhatsApp with UTM tracking.
 * @param message - The WhatsApp message
 * @param utmSource - Traffic source (default: "site")
 * @param utmMedium - Medium (default: "whatsapp")
 * @param utmCampaign - Campaign identifier (default: "geral")
 */
export function openContact(
  message?: string,
  utmSource: string = "site",
  utmMedium: string = "whatsapp",
  utmCampaign: string = "geral"
) {
  openContactWithNumber(DEFAULT_WHATSAPP, message, utmSource, utmMedium, utmCampaign);
}

/**
 * Open WhatsApp with a specific number and UTM tracking.
 */
export function openContactWithNumber(
  whatsappNumber: string,
  message?: string,
  utmSource: string = "site",
  utmMedium: string = "whatsapp",
  utmCampaign: string = "geral"
) {
  const defaultMessage = "Olá! Gostaria de saber mais sobre os serviços da Enviando Meu Carro.";
  const finalMessage = message || defaultMessage;

  // Fire Google Ads conversion event
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "conversion", {
      send_to: "AW-17154661982/b-u1CM_MpdMaEN68_fM_",
    });
  }

  // Push UTM data to dataLayer for GTM
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "whatsapp_open",
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      whatsapp_number: whatsappNumber,
    } as any);
  }

  // Extract digits only for wa.me URL
  const digits = whatsappNumber.replace(/\D/g, "");
  const url = buildWhatsAppUrl(digits, finalMessage, utmSource, utmMedium, utmCampaign);
  window.open(url, "_blank");
}

/** Logo for dark backgrounds (white/light subtitle text) — cropped */
export const LOGO_DARK_BG_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663215721079/mdqtoTdxUgyafXfA49s4Hx/emc-logo-dark-bg-cropped_92288254.png";
/** Logo for light backgrounds (black/dark subtitle text) — cropped */
export const LOGO_LIGHT_BG_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663215721079/mdqtoTdxUgyafXfA49s4Hx/emc-logo-light-bg-cropped_43015709.png";
/** Default logo — dark bg version (site is dark themed) */
export const LOGO_URL = LOGO_DARK_BG_URL;
export const HERO_BG_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663215721079/mdqtoTdxUgyafXfA49s4Hx/hero-bg-iguX4vEEPsn2MVYBbBBz7c.webp";
export const WHYUS_IMAGE_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663215721079/mdqtoTdxUgyafXfA49s4Hx/whyus-image-DJ6ECkTJkRKXpkEkp8tFkg.webp";
export const TESTIMONIAL_POSTER_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663215721079/mdqtoTdxUgyafXfA49s4Hx/testimonial-poster-hwCTKZTa8UZbVibYmGcVeH.webp";
export const TESTIMONIAL_VIDEO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663215721079/MlhLPKNNfTAiZnIc.mp4";
export const SERVICE_IMPORT_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663215721079/vfzHVVWpTckDpztv.png";
export const SERVICE_EXPORT_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663215721079/RzhoLwRorzlGzyGN.png";
export const SERVICE_DESPACHO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663215721079/KzbyvIXUBqNIRghh.png";
export const SERVICE_AEREO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663215721079/jdryhbFThLpMiVjn.png";
export const SERVICE_PECAS_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663215721079/mdqtoTdxUgyafXfA49s4Hx/service-pecas-v2-FFoeKajY7wG2Ghj7V994uf.webp";
export const SERVICE_ADMISSAO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663215721079/mdqtoTdxUgyafXfA49s4Hx/service-admissao-v2-oSaGkwhHnyJ5vmiLnaov3u.webp";
export const CLUB_AACA_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663215721079/mdqtoTdxUgyafXfA49s4Hx/club-aaca-original_e5ab2a8c.jpeg";
export const CLUB_ACB_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663215721079/mdqtoTdxUgyafXfA49s4Hx/club-acb-original_f9325c39.jpeg";
