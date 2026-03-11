/**
 * Contact utilities — now supports dynamic settings from DB.
 * Components should use useSiteSettings() + openContactWithNumber() for dynamic behavior.
 * The legacy openContact() still works as a fallback with the default number.
 */

const DEFAULT_WHATSAPP = "5511992448920";

export function openContact(message?: string) {
  openContactWithNumber(DEFAULT_WHATSAPP, message);
}

export function openContactWithNumber(whatsappNumber: string, message?: string) {
  const defaultMessage = "Olá! Gostaria de saber mais sobre os serviços da Enviando Meu Carro.";
  const text = encodeURIComponent(message || defaultMessage);

  // Fire Google Ads conversion event
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "conversion", {
      send_to: "AW-17154661982/b-u1CM_MpdMaEN68_fM_",
    });
  }

  // Extract digits only for wa.me URL
  const digits = whatsappNumber.replace(/\D/g, "");
  window.open(`https://wa.me/${digits}?text=${text}`, "_blank");
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
