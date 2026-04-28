import { createContext, useContext, useMemo } from "react";

/**
 * Site settings — hardcoded defaults.
 * Previously fetched from DB via tRPC; now static since the site is a pure frontend.
 * To update, edit the DEFAULTS object below and redeploy.
 */
const DEFAULTS: Record<string, string> = {
  phone_primary: "+55 11 99244-8920",
  phone_secondary: "+1 (786) 600-0430",
  email_primary: "info@enviandomeucarro.com",
  email_secondary: "contato@enviandomeucarro.com",
  whatsapp_url: "https://wa.me/5511992448920",
  whatsapp_number: "+55 11 99244-8920",
  address_miami: "1150 NW 72nd Ave, Tower 1, Ste 455, Miami, FL 33126",
  address_sp: "Vila Olímpia, São Paulo, SP",
  address_itajai: "Próximo ao Porto de Itajaí, SC",
  instagram_url: "https://www.instagram.com/enviandomeucarro",
  facebook_url: "https://www.facebook.com/enviandomeucarro",
  youtube_url: "https://www.youtube.com/@enviandomeucarro",
  tiktok_url: "",
  calculator_url: "https://calculadora.enviandomeucarro.com",
  tracking_url: "/minha-area",
  google_reviews_url: "https://g.page/r/CfOy3RBqPbMVEBM/review",
};

interface SiteSettingsContextType {
  settings: Record<string, string>;
  get: (key: string) => string;
  isLoading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULTS,
  get: (key: string) => DEFAULTS[key] ?? "",
  isLoading: false,
});

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => ({
    settings: DEFAULTS,
    get: (key: string) => DEFAULTS[key] ?? "",
    isLoading: false,
  }), []);

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
