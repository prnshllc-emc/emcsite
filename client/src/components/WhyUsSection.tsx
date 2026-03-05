/* WhyUsSection — Benefits checklist, consultant CTA, image with floating stats card */
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openContact, WHYUS_IMAGE_URL } from "@/lib/contact";

const CHECKLIST = [
  "Assessoria completa na documentação",
  "Inspeção detalhada do veículo na origem",
  "Seguro internacional total (All Risks)",
  "Rastreamento em tempo real",
  "Armazenagem segura em pátios próprios",
  "Desembaraço aduaneiro ágil",
  "Transporte interno (EUA e Brasil)",
  "Consultoria tributária especializada",
];

const FLOATING_STATS = [
  { value: "10+", label: "Anos de Exp." },
  { value: "100%", label: "Seguro" },
  { value: "5.0", label: "Avaliação" },
];

export default function WhyUsSection() {
  return (
    <section id="whyus" className="py-24 bg-card border-y border-white/5 relative overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
              Por que nos escolher?
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Inteligência Logística para{" "}
              <span className="text-primary">Otimizar seu Investimento</span>
            </h2>

            <p className="text-muted-foreground text-lg font-body leading-relaxed">
              Na "Enviando Meu Carro", transformamos a complexidade da importação em uma experiência fluida. Nossa expertise garante a viabilidade estratégica do seu projeto, eliminando riscos e maximizando resultados.
            </p>

            {/* Checklist */}
            <div className="grid sm:grid-cols-2 gap-4">
              {CHECKLIST.map((item) => (
                <div key={item} className="flex items-center gap-3 group">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-300 text-sm font-body">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Button
              onClick={() => openContact("Olá! Gostaria de falar com um consultor sobre importação de veículos.")}
              className="h-14 px-8 text-lg font-display font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-transform bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Falar com um Consultor
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Right — Image */}
          <div className="relative">
            {/* Glow */}
            <div className="absolute -inset-10 bg-primary/20 blur-3xl rounded-full opacity-20" />

            {/* Image Container */}
            <div className="relative rounded-2xl border border-white/10 bg-background/50 backdrop-blur-sm p-2">
              <img
                src={WHYUS_IMAGE_URL}
                alt="Inspeção de veículo de luxo"
                className="w-full aspect-video object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>

            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 left-4 right-4 md:left-8 md:right-8 bg-background/90 backdrop-blur-md border border-white/10 rounded-lg p-6 grid grid-cols-3 gap-4">
              {FLOATING_STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-display font-bold text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-primary font-bold tracking-wider uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
