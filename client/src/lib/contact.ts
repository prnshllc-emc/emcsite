const CONTACT_DESTINATION = "5511992448920";

export function openContact(message?: string) {
  const defaultMessage = "Olá! Gostaria de saber mais sobre os serviços da Enviando Meu Carro.";
  const text = encodeURIComponent(message || defaultMessage);

  // Fire Google Ads conversion event
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "conversion", {
      send_to: "AW-17154661982/b-u1CM_MpdMaEN68_fM_",
    });
  }

  const isPhone = /^\d+$/.test(CONTACT_DESTINATION);
  if (isPhone) {
    window.open(`https://wa.me/${CONTACT_DESTINATION}?text=${text}`, "_blank");
  } else {
    window.open(`mailto:${CONTACT_DESTINATION}?subject=${text}`, "_blank");
  }
}

export const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663215721079/mdqtoTdxUgyafXfA49s4Hx/logo-emc_335975b5.png";
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
