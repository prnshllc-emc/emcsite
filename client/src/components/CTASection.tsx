/* CTASection — SEO-optimized reusable CTA with consistent design */
import { MessageCircle, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openContactWithNumber } from "@/lib/contact";
import { trackCTAClick, trackWhatsAppClick, trackCalculatorInteraction } from "@/lib/analytics";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

interface Props {
  title: string;
  description: string;
  buttonText: string;
  variant: "primary" | "secondary";
}

export default function CTASection({ title, description, buttonText, variant }: Props) {
  const { get } = useSiteSettings();
  const whatsappNumber = get("whatsapp_number");
  const calculatorUrl = get("calculator_url");

  const isCalculator = variant === "primary";

  function handleClick() {
    if (isCalculator) {
      trackCTAClick(buttonText, `cta_section_${variant}`, "calculadora", buttonText);
      trackCalculatorInteraction("abrir_calculadora", { origin: "cta_section" });
      window.open(`${calculatorUrl}?utm_source=site&utm_medium=cta_section`, "_blank");
    } else {
      const msg = `Olá! Vi o site e gostaria de saber mais. ${buttonText}`;
      trackCTAClick(buttonText, `cta_section_${variant}`, "whatsapp", buttonText);
      trackWhatsAppClick(`cta_section_${variant}`, msg);
      openContactWithNumber(whatsappNumber, msg, "site", "whatsapp", `cta_section_${variant}`);
    }
  }

  return (
    <section
      aria-label={title}
      data-section={`cta-${variant}`}
      className="py-14 bg-card/50 border-y border-white/5 relative overflow-hidden"
    >
      {/* Subtle accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" aria-hidden="true" />

      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <header className="text-center md:text-left max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{title}</h2>
            <p className="text-base text-gray-300 mt-2 font-body">{description}</p>
          </header>

          {isCalculator ? (
            <div className="cta-calculator-wrapper flex-shrink-0">
              <Button
                variant="ghost"
                onClick={handleClick}
                className="cta-calculator"
                aria-label={`${buttonText} - Abrir calculadora de importação`}
              >
                <Calculator className="mr-2 w-5 h-5 relative z-10" aria-hidden="true" />
                <span className="relative z-10">{buttonText}</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              onClick={handleClick}
              className="cta-whatsapp flex-shrink-0"
              aria-label={`${buttonText} - Entrar em contato via WhatsApp`}
            >
              <MessageCircle className="mr-2 w-5 h-5" aria-hidden="true" />
              {buttonText}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
