/**
 * CookieConsent — LGPD-compliant cookie consent banner
 *
 * Features:
 * - Appears at the bottom of the page on first visit
 * - Granular consent: Analytics and Marketing toggles
 * - "Aceitar Todos", "Apenas Necessários", and "Personalizar" options
 * - Links to Privacy Policy
 * - Stores consent in localStorage
 * - Conditionally loads tracking scripts based on consent
 */
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Cookie, Shield, ChevronDown, ChevronUp, X } from "lucide-react";
import { Link } from "wouter";
import {
  getConsent,
  acceptAll,
  rejectOptional,
  saveConsent,
  applyConsent,
  hasConsentChoice,
  type CookieConsent as CookieConsentType,
} from "@/lib/cookieConsent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // Check if user already made a choice
    if (!hasConsentChoice()) {
      // Small delay so the page loads first
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    } else {
      // Apply existing consent on page load
      applyConsent();
    }
  }, []);

  const handleClose = useCallback((consent: CookieConsentType) => {
    setClosing(true);
    applyConsent();
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 300);
  }, []);

  const handleAcceptAll = useCallback(() => {
    const consent = acceptAll();
    handleClose(consent);
  }, [handleClose]);

  const handleRejectOptional = useCallback(() => {
    const consent = rejectOptional();
    handleClose(consent);
  }, [handleClose]);

  const handleSavePreferences = useCallback(() => {
    const consent = saveConsent({
      analytics: analyticsEnabled,
      marketing: marketingEnabled,
    });
    handleClose(consent);
  }, [analyticsEnabled, marketingEnabled, handleClose]);

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9999] transition-all duration-300 ${
        closing ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
      role="dialog"
      aria-label="Consentimento de cookies"
      aria-modal="false"
    >
      {/* Backdrop overlay */}
      <div className="absolute inset-0 -top-screen bg-black/20 backdrop-blur-[1px] pointer-events-none" />

      <div className="relative bg-card border-t border-white/10 shadow-2xl shadow-black/50">
        <div className="container max-w-5xl mx-auto px-4 py-5">
          {/* Main banner */}
          <div className="flex flex-col gap-4">
            {/* Header row */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Cookie className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-display font-bold text-base mb-1">
                  Utilizamos Cookies
                </h3>
                <p className="text-gray-400 text-sm font-body leading-relaxed">
                  Usamos cookies para melhorar sua experiência, analisar o tráfego do site e personalizar conteúdo e anúncios.
                  Você pode escolher quais categorias de cookies deseja permitir. Para mais informações, consulte nossa{" "}
                  <Link
                    href="/politica-de-privacidade"
                    className="text-primary hover:underline font-medium"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Expandable details */}
            {showDetails && (
              <div className="bg-background/50 rounded-lg border border-white/5 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Necessary cookies — always on */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-white text-sm font-medium block">Cookies Necessários</span>
                      <span className="text-gray-500 text-xs font-body">
                        Essenciais para o funcionamento do site. Incluem sessão, segurança e preferências básicas.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-500 font-medium whitespace-nowrap">Sempre ativo</span>
                    <Switch checked={true} disabled className="opacity-60" />
                  </div>
                </div>

                {/* Analytics cookies */}
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/5">
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div>
                      <span className="text-white text-sm font-medium block">Cookies de Análise</span>
                      <span className="text-gray-500 text-xs font-body">
                        Google Analytics — nos ajudam a entender como os visitantes interagem com o site para melhorar a experiência.
                      </span>
                    </div>
                  </div>
                  <Switch
                    checked={analyticsEnabled}
                    onCheckedChange={setAnalyticsEnabled}
                    aria-label="Permitir cookies de análise"
                  />
                </div>

                {/* Marketing cookies */}
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/5">
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                    <div>
                      <span className="text-white text-sm font-medium block">Cookies de Marketing</span>
                      <span className="text-gray-500 text-xs font-body">
                        Meta Pixel e Google Ads — permitem exibir anúncios relevantes e medir a eficácia das campanhas publicitárias.
                      </span>
                    </div>
                  </div>
                  <Switch
                    checked={marketingEnabled}
                    onCheckedChange={setMarketingEnabled}
                    aria-label="Permitir cookies de marketing"
                  />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Customize toggle */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center justify-center gap-1.5 text-gray-400 hover:text-white text-xs font-body transition-colors py-2 sm:mr-auto"
                aria-expanded={showDetails}
                aria-controls="cookie-details"
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    Ocultar detalhes
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    Personalizar cookies
                  </>
                )}
              </button>

              <div className="flex flex-col sm:flex-row gap-2.5">
                {/* Reject optional */}
                <Button
                  variant="outline"
                  onClick={handleRejectOptional}
                  className="border-white/15 text-gray-300 hover:text-white hover:bg-white/5 text-xs font-bold tracking-wider uppercase h-10 px-5"
                >
                  Apenas Necessários
                </Button>

                {/* Save preferences (only when details are open) */}
                {showDetails && (
                  <Button
                    variant="outline"
                    onClick={handleSavePreferences}
                    className="border-primary/30 text-primary hover:bg-primary/10 text-xs font-bold tracking-wider uppercase h-10 px-5"
                  >
                    Salvar Preferências
                  </Button>
                )}

                {/* Accept all */}
                <Button
                  onClick={handleAcceptAll}
                  className="bg-primary hover:bg-primary/90 text-white text-xs font-bold tracking-wider uppercase h-10 px-6"
                >
                  Aceitar Todos
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
