/* HeroSection — SEO-optimized hero with dynamic settings */
import { CheckCircle2, MessageCircle, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_BG_URL, openContactWithNumber } from "@/lib/contact";
import { trackCTAClick, trackWhatsAppClick, trackCalculatorInteraction, trackNavClick } from "@/lib/analytics";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const MINI_FEATURES = [
  { title: "Importação & Exportação", desc: "Logística global porta a porta" },
  { title: "Seguro Total", desc: "All Risks incluso em toda operação" },
  { title: "Transparência", desc: "Sem surpresas, VC que Manda" },
];

export default function HeroSection() {
  const { get } = useSiteSettings();
  const whatsappNumber = get("whatsapp_number");
  const calculatorUrl = get("calculator_url");

  function handleWhatsApp() {
    const msg = "Olá! Gostaria de saber mais sobre os serviços da Enviando Meu Carro.";
    trackCTAClick("Fale com Especialista", "hero", "whatsapp", "Fale com um Especialista");
    trackWhatsAppClick("hero_cta_principal", msg);
    openContactWithNumber(whatsappNumber, msg);
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
      className="relative min-h-screen flex items-center overflow-hidden pt-24 md:pt-28 pb-16"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_BG_URL}
          alt="Navio de carga transportando veículos para importação e exportação internacional"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          width="1920"
          height="1080"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Copy */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
              +10 Anos de Logística Automotiva Internacional
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-[1.05] text-white">
              O Jeito Mais Rápido, Seguro e{" "}
              <span className="text-primary">Barato</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground font-body max-w-xl leading-relaxed">
              <strong className="text-white">Importação e exportação de veículos</strong> com transparência total.
              Carros clássicos, 0km, motos, peças e envios aéreos — do mundo inteiro para o Brasil e do Brasil para qualquer destino.
              Envio de carros com quem entende, sabendo o que está pagando e sem surpresas.
            </p>

            {/* Mini features */}
            <div className="flex flex-wrap gap-4" role="list" aria-label="Diferenciais da Enviando Meu Carro">
              {MINI_FEATURES.map((f) => (
                <div key={f.title} className="flex items-center gap-2 text-sm text-muted-foreground" role="listitem">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                  <span className="font-body">{f.title}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleWhatsApp}
                size="lg"
                className="h-14 px-8 text-lg font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-transform bg-primary text-primary-foreground hover:bg-primary/90"
                aria-label="Fale com um especialista em importação de veículos via WhatsApp"
              >
                <MessageCircle className="mr-2 w-5 h-5" aria-hidden="true" />
                Fale com um Especialista
              </Button>
              <Button
                onClick={handleCalculator}
                variant="outline"
                size="lg"
                className="h-14 px-8 text-lg font-bold uppercase tracking-wider border-white/20 text-white hover:bg-white/10"
                aria-label="Simular custos de importação de veículos com a calculadora online"
              >
                <Calculator className="mr-2 w-5 h-5" aria-hidden="true" />
                Simule seus Custos
              </Button>
            </div>
          </div>

          {/* Right — Services Card */}
          <div className="hidden lg:block">
            <nav
              className="bg-card/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl"
              aria-label="Serviços de logística automotiva da Enviando Meu Carro"
            >
              <h2 className="text-xl font-display font-bold text-white mb-2 text-center">Nossos Serviços</h2>
              <p className="text-muted-foreground text-sm text-center mb-6 font-body">
                Soluções completas em logística automotiva internacional
              </p>
              <ul className="space-y-3 list-none">
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
                      className="w-full flex items-center justify-between p-4 rounded-lg bg-background/50 border border-white/5 hover:border-primary/30 hover:bg-background/80 transition-all group text-left"
                      aria-label={`${s.label} — ${s.desc}`}
                    >
                      <div>
                        <span className="text-white font-bold text-sm group-hover:text-primary transition-colors">{s.label}</span>
                        <span className="block text-muted-foreground text-xs font-body">{s.desc}</span>
                      </div>
                      <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
