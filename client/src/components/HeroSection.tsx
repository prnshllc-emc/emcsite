/* HeroSection — Full-height hero with copy, mini-features, and import calculator */
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_BG_URL, openContact } from "@/lib/contact";
import ImportCalculator from "./ImportCalculator";

const MINI_FEATURES = [
  { title: "Seguro Total", desc: "Internacional Incluso" },
  { title: "Rastreamento", desc: "24/7 Online" },
  { title: "Despacho", desc: "Aduaneiro Completo" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-28 overflow-hidden">
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
        <div className="grid lg:grid-cols-[1.1fr_1.3fr] gap-12 items-center">
          {/* Left Column — Copy */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold tracking-widest uppercase animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Líder em Logística Automotiva
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
              Importe seu Veículo dos Sonhos com{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400">
                Segurança Total
              </span>{" "}
              e Zero Burocracia
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl font-body">
              Cuidamos de tudo para você. Logística "porta a porta" especializada,
              com rastreamento em tempo real, seguro total incluso e assessoria completa.
            </p>

            {/* CTA Button */}
            <Button
              onClick={() => openContact("Olá! Gostaria de falar com um especialista sobre importação de veículos.")}
              className="h-14 px-8 text-lg font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-transform bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              Falar com Especialista
            </Button>

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

          {/* Right Column — Calculator */}
          <ImportCalculator />
        </div>
      </div>
    </section>
  );
}
