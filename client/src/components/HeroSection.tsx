/* HeroSection — Institutional hero with broad CTA covering all services */
import { CheckCircle2, MessageCircle, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_BG_URL, openContact } from "@/lib/contact";

const MINI_FEATURES = [
  { title: "Importação & Exportação", desc: "Logística global porta a porta" },
  { title: "Seguro Total", desc: "All Risks incluso em toda operação" },
  { title: "Transparência", desc: "Sem surpresas, VC que Manda" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_BG_URL}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
      </div>

      <div className="container relative z-10 py-12 lg:py-20">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          {/* Left Column — Copy */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold tracking-widest uppercase animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              +10 Anos de Logística Automotiva Internacional
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
              O Jeito Mais Rápido, Seguro e{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400">
                Barato
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl font-body">
              Importação, exportação e logística automotiva internacional com transparência total.
              Envio de carros com quem entende, sabendo o que está pagando e sem surpresas.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => openContact("Olá! Gostaria de saber mais sobre os serviços da Enviando Meu Carro.")}
                className="h-14 px-8 text-lg font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-transform bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                Fale com um Especialista
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open("https://calculadora.enviandomeucarro.com?utm_source=site&utm_medium=hero", "_blank")}
                className="h-14 px-8 text-lg font-bold uppercase tracking-wider border-white/20 text-white hover:bg-white/10"
              >
                <Calculator className="mr-2 w-5 h-5" />
                Simule seus Custos
              </Button>
            </div>

            {/* Mini Features */}
            <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-white/10">
              {MINI_FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-bold text-sm">{f.title}</p>
                    <p className="text-muted-foreground text-xs">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column — Highlights Card */}
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-red-500/20 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 rounded-2xl" />

            {/* Card */}
            <div className="relative bg-card/95 backdrop-blur-sm border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl">
              <h3 className="text-2xl font-bold text-white text-center mb-2 font-display">
                Nossos Serviços
              </h3>
              <p className="text-muted-foreground text-sm text-center mb-6 font-body">
                Soluções completas em logística automotiva internacional
              </p>

              <div className="space-y-3">
                {[
                  { label: "Importação de Veículos", desc: "Do mundo inteiro para o Brasil", anchor: "#services" },
                  { label: "Exportação de Veículos", desc: "Do Brasil para qualquer destino", anchor: "#services" },
                  { label: "Despacho Aduaneiro", desc: "Desembaraço completo e ágil", anchor: "#services" },
                  { label: "Peças e Acessórios", desc: "Importação de peças originais", anchor: "#services" },
                  { label: "Envios Aéreos", desc: "Transporte expresso via modal aéreo", anchor: "#services" },
                  { label: "Admissão Temporária", desc: "Corrida, exposição e eventos", anchor: "#services" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      const el = document.querySelector(item.anchor);
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full flex items-center gap-4 h-14 px-4 rounded-lg border border-white/10 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all group/btn text-left"
                  >
                    <div className="flex-1">
                      <p className="text-white text-sm font-bold group-hover/btn:text-primary transition-colors">
                        {item.label}
                      </p>
                      <p className="text-muted-foreground text-xs">{item.desc}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-primary/50 group-hover/btn:text-primary transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>

              <p className="text-center text-xs text-muted-foreground mt-4 font-body">
                "Desconfie de quem complica demais. O processo é mais simples do que parece."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
