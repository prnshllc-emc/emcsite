/* HeroSection — SEO-optimized institutional hero with tracking on all CTAs */
import { CheckCircle2, MessageCircle, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_BG_URL, openContact } from "@/lib/contact";
import { trackCTAClick, trackWhatsAppClick, trackCalculatorInteraction, trackNavClick } from "@/lib/analytics";

const MINI_FEATURES = [
  { title: "Importação & Exportação", desc: "Logística global porta a porta" },
  { title: "Seguro Total", desc: "All Risks incluso em toda operação" },
  { title: "Transparência", desc: "Sem surpresas, VC que Manda" },
];

export default function HeroSection() {
  function handleWhatsApp() {
    const msg = "Olá! Gostaria de saber mais sobre os serviços da Enviando Meu Carro.";
    trackCTAClick("Fale com Especialista", "hero", "whatsapp", "Fale com um Especialista");
    trackWhatsAppClick("hero_cta_principal", msg);
    openContact(msg);
  }

  function handleCalculator() {
    trackCTAClick("Simule seus Custos", "hero", "calculadora", "Simule seus Custos");
    trackCalculatorInteraction("abrir_calculadora", { origin: "hero" });
    window.open("https://calculadora.enviandomeucarro.com?utm_source=site&utm_medium=hero", "_blank");
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
      aria-label="Importação e exportação de veículos - Enviando Meu Carro"
      className="relative min-h-[90vh] flex items-center pt-28 overflow-hidden"
    >
      {/* Background Image with SEO alt */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_BG_URL}
          alt="Veículos de luxo sendo preparados para transporte internacional pela EMC - Enviando Meu Carro"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
      </div>

      <div className="container relative z-10 py-12 lg:py-20">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          {/* Left Column — Copy */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold tracking-widest uppercase animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
              +10 Anos de Logística Automotiva Internacional
            </div>

            {/* H1 — Primary keyword-rich heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
              O Jeito Mais Rápido, Seguro e{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400">
                Barato
              </span>{" "}
              <span className="sr-only">de Importar e Exportar Veículos</span>
            </h1>

            {/* Subtitle — Long-tail keywords */}
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl font-body">
              <strong>Importação e exportação de veículos</strong> com transparência total.
              Carros clássicos, 0km, motos, peças e envios aéreos — do mundo inteiro para o Brasil e do Brasil para qualquer destino.
              Envio de carros com quem entende, sabendo o que está pagando e sem surpresas.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleWhatsApp}
                className="h-14 px-8 text-lg font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-transform bg-primary text-primary-foreground hover:bg-primary/90"
                aria-label="Fale com um especialista em importação de veículos via WhatsApp"
              >
                <MessageCircle className="mr-2 w-5 h-5" aria-hidden="true" />
                Fale com um Especialista
              </Button>
              <Button
                variant="outline"
                onClick={handleCalculator}
                className="h-14 px-8 text-lg font-bold uppercase tracking-wider border-white/20 text-white hover:bg-white/10"
                aria-label="Simule os custos de importação de veículos com nossa calculadora online"
              >
                <Calculator className="mr-2 w-5 h-5" aria-hidden="true" />
                Simule seus Custos
              </Button>
            </div>

            {/* Mini Features — Semantic list */}
            <ul className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-white/10 list-none" role="list">
              {MINI_FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-white font-bold text-sm">{f.title}</p>
                    <p className="text-muted-foreground text-xs">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column — Services Card with internal links */}
          <aside className="relative group" aria-label="Lista de serviços de logística automotiva">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-red-500/20 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 rounded-2xl" aria-hidden="true" />

            {/* Card */}
            <nav className="relative bg-card/95 backdrop-blur-sm border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl" aria-label="Navegação de serviços">
              <h2 className="text-2xl font-bold text-white text-center mb-2 font-display">
                Nossos Serviços
              </h2>
              <p className="text-muted-foreground text-sm text-center mb-6 font-body">
                Soluções completas em logística automotiva internacional
              </p>

              <ul className="space-y-3 list-none" role="list">
                {[
                  { label: "Importação de Veículos", desc: "Do mundo inteiro para o Brasil", anchor: "#services" },
                  { label: "Exportação de Veículos", desc: "Do Brasil para qualquer destino", anchor: "#services" },
                  { label: "Despacho Aduaneiro", desc: "Desembaraço completo e ágil", anchor: "#services" },
                  { label: "Peças e Acessórios", desc: "Importação de peças originais", anchor: "#services" },
                  { label: "Envios Aéreos", desc: "Transporte expresso via modal aéreo", anchor: "#services" },
                  { label: "Admissão Temporária", desc: "Corrida, exposição e eventos", anchor: "#services" },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.anchor}
                      onClick={(e) => {
                        e.preventDefault();
                        handleServiceClick(item.label, item.anchor);
                      }}
                      className="w-full flex items-center gap-4 h-14 px-4 rounded-lg border border-white/10 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all group/btn text-left"
                      title={`Saiba mais sobre ${item.label}`}
                    >
                      <div className="flex-1">
                        <p className="text-white text-sm font-bold group-hover/btn:text-primary transition-colors">
                          {item.label}
                        </p>
                        <p className="text-muted-foreground text-xs">{item.desc}</p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-primary/50 group-hover/btn:text-primary transition-colors flex-shrink-0" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>

              <p className="text-center text-xs text-muted-foreground mt-4 font-body italic">
                "Desconfie de quem complica demais. O processo é mais simples do que parece."
              </p>
            </nav>
          </aside>
        </div>
      </div>
    </section>
  );
}
