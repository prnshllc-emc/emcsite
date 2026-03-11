/* HeroSection — SEO-optimized hero with dynamic settings, improved layout */
import { CheckCircle2, MessageCircle, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_BG_URL, openContactWithNumber } from "@/lib/contact";
import { trackCTAClick, trackWhatsAppClick, trackCalculatorInteraction, trackNavClick } from "@/lib/analytics";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export default function HeroSection() {
  const { get } = useSiteSettings();
  const whatsappNumber = get("whatsapp_number");
  const calculatorUrl = get("calculator_url");

  function handleWhatsApp() {
    const msg = "Olá! Gostaria de saber mais sobre os serviços da Enviando Meu Carro.";
    trackCTAClick("Fale com Especialista", "hero", "whatsapp", "Fale com um Especialista");
    trackWhatsAppClick("hero_cta_principal", msg);
    openContactWithNumber(whatsappNumber, msg, "site", "whatsapp", "hero_cta_principal");
  }

  function handleCalculator() {
    trackCTAClick("Simule seus Custos", "hero", "calculadora", "Simule seus Custos");
    trackCalculatorInteraction("abrir_calculadora", { origin: "hero" });
    window.open(`${calculatorUrl}?utm_source=site&utm_medium=hero`, "_blank");
  }

  function handleServiceClick(label: string, anchor: string) {
    trackNavClick(label, anchor);
    trackCTAClick(label, "hero_services_card", anchor, label);
    const el = document.querySelector(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      id="inicio"
      data-section="hero"
      aria-label="Importação e exportação de veículos com a Enviando Meu Carro"
      className="relative min-h-[92vh] flex items-center overflow-hidden pt-24 pb-16"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <img
          src={HERO_BG_URL}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          width="1920"
          height="1080"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-10 items-center">
          {/* Left — Copy */}
          <div className="space-y-6">
            {/* Badge — consistent with section-badge class */}
            <span className="section-badge text-[11px] tracking-[0.12em]">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
              +10 Anos de Logística Automotiva Internacional
            </span>

            {/* H1 */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-display font-extrabold leading-[1.08] text-white">
              O Jeito Mais Rápido, Seguro e{" "}
              <span className="text-primary">Simples</span>
            </h1>

            {/* Entity Definition — GEO optimized */}
            <p className="text-sm sm:text-base text-gray-400 font-body max-w-2xl leading-relaxed italic border-l-2 border-primary/40 pl-4 mb-2">
              A Enviando Meu Carro é uma empresa global de logística automotiva especializada no transporte de veículos, frete internacional, serviços de importação e exportação, e consultoria logística para pessoas físicas, colecionadores e empresas.
            </p>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-300 font-body max-w-xl leading-relaxed">
              <strong className="text-white">Importação e exportação de veículos</strong> com transparência total.
              Carros clássicos, 0km, motos, peças e envios aéreos — do mundo inteiro para o Brasil e do Brasil para qualquer destino.
              Envio de carros com quem entende, sabendo o que está pagando e sem surpresas.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-x-5 gap-y-2" role="list" aria-label="Diferenciais da Enviando Meu Carro">
              {["Importação & Exportação", "Seguro Total", "Transparência"].map((badge) => (
                <span key={badge} className="flex items-center gap-2 text-sm text-gray-400 font-body" role="listitem">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                  {badge}
                </span>
              ))}
            </div>

            {/* CTAs — consistent sizing */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1 items-center sm:items-start">
              <Button
                variant="ghost"
                onClick={handleWhatsApp}
                className="cta-whatsapp"
                aria-label="Fale com um especialista em importação de veículos via WhatsApp"
              >
                <MessageCircle className="mr-2 w-5 h-5" aria-hidden="true" />
                Fale com um Especialista
              </Button>
              <div className="cta-calculator-wrapper">
                <Button
                  variant="ghost"
                  onClick={handleCalculator}
                  className="cta-calculator"
                  aria-label="Simular custos de importação de veículos com a calculadora online"
                >
                  <Calculator className="mr-2 w-5 h-5 relative z-10" aria-hidden="true" />
                  <span className="relative z-10">Simule seus Custos</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right — Services Card */}
          <aside className="hidden lg:block max-w-xs" aria-label="Resumo dos serviços de logística automotiva">
            <div className="bg-card/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl shadow-black/30">
              <h2 className="text-base font-display font-bold text-white text-center mb-1">Nossos Serviços</h2>
              <p className="text-xs text-gray-400 text-center font-body mb-3">
                Soluções completas em logística automotiva internacional
              </p>
              <ul className="space-y-1.5 list-none">
                {[
                  { label: "Importação de Veículos", desc: "Do mundo inteiro para o Brasil", anchor: "#services" },
                  { label: "Exportação de Veículos", desc: "Do Brasil para qualquer destino", anchor: "#services" },
                  { label: "Despacho Aduaneiro", desc: "Desembaraço completo e ágil", anchor: "#services" },
                  { label: "Peças e Acessórios", desc: "Importação de peças originais", anchor: "#services" },
                  { label: "Envios Aéreos", desc: "Transporte expresso via modal aéreo", anchor: "#services" },
                  { label: "Admissão Temporária", desc: "Veículos temporários no Brasil", anchor: "#services" },
                ].map((s) => (
                  <li key={s.label}>
                    <button
                      onClick={() => handleServiceClick(s.label, s.anchor)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg bg-background/50 border border-white/5 hover:border-primary/20 hover:bg-background/70 transition-all group text-left"
                      aria-label={`${s.label} — ${s.desc}`}
                    >
                      <div>
                        <span className="text-white font-medium text-xs group-hover:text-primary transition-colors">{s.label}</span>
                        <span className="block text-gray-500 text-[11px] font-body leading-tight">{s.desc}</span>
                      </div>
                      <svg className="w-3.5 h-3.5 text-gray-600 group-hover:text-primary transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
