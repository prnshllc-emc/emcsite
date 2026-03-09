import { createContext, useContext, useMemo } from "react";
import { trpc } from "@/lib/trpc";

/**
 * Default (fallback) values used when DB settings are not yet loaded.
 * These match the seeded values so the site works even before the first fetch.
 */
const DEFAULTS: Record<string, string> = {
  phone_primary: "+55 11 99244-8920",
  phone_secondary: "+1 (786) 600-0430",
  email_primary: "atendimento@enviandomeucarro.com",
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
  tracking_url: "https://rastreamento.enviandomeucarro.com",
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
  isLoading: true,
});

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = trpc.publicSettings.get.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  const value = useMemo(() => {
    const merged = { ...DEFAULTS, ...(data ?? {}) };
    return {
      settings: merged,
      get: (key: string) => merged[key] ?? "",
      isLoading,
    };
  }, [data, isLoading]);

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
