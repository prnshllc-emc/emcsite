/* WhyUsSection — SEO-optimized benefits section with semantic HTML, keyword-rich content, and accessibility */
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openContact, WHYUS_IMAGE_URL } from "@/lib/contact";
import { trackCTAClick, trackWhatsAppClick } from "@/lib/analytics";

const CHECKLIST = [
  "Transparência total sobre custos e prazos de importação",
  "Seguro internacional obrigatório (All Risks) em toda operação",
  "Rastreamento em tempo real de cada etapa do transporte",
  "Armazenagem gratuita por 60 dias no destino",
  "Dossiê completo de documentação aduaneira",
  "Assessoria em feiras e leilões automotivos internacionais",
  "Suporte pós-entrega contínuo e dedicado",
  "Você escolhe apenas os serviços que precisa",
];

const FLOATING_STATS = [
  { value: "10+", label: "Anos de Exp." },
  { value: "100%", label: "Seguro" },
  { value: "5.0", label: "Avaliação" },
];

export default function WhyUsSection() {
  return (
    <section
      id="whyus"
      aria-label="Por que escolher a Enviando Meu Carro para importar ou exportar seu veículo"
      className="py-24 bg-card border-y border-white/5 relative overflow-hidden"
    >
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Content */}
          <div className="space-y-8">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
              Por que nos escolher?
            </span>

            {/* Title — keyword-rich */}
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Inteligência Logística para{" "}
              <span className="text-primary">Importar e Exportar Veículos</span> com Segurança
            </h2>

            <p className="text-muted-foreground text-lg font-body leading-relaxed">
              Na <strong>Enviando Meu Carro</strong>, transformamos a complexidade da <strong>logística automotiva internacional</strong> em uma experiência fluida.
              Seja importando um carro clássico dos EUA ou exportando do Brasil para qualquer destino, nossa expertise garante segurança, agilidade e o melhor custo-benefício.
            </p>

            {/* Checklist — semantic list */}
            <ul className="grid sm:grid-cols-2 gap-4 list-none" role="list">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-center gap-3 group">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  <span className="text-gray-300 text-sm font-body">{item}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Button
              onClick={() => {
                const msg = "Olá! Gostaria de falar com um consultor sobre os serviços da EMC.";
                trackCTAClick("Falar com Consultor", "whyus_section", "whatsapp", "Falar com Consultor");
                trackWhatsAppClick("whyus_cta", msg);
                openContact(msg);
              }}
              className="h-14 px-8 text-lg font-display font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-transform bg-primary text-primary-foreground hover:bg-primary/90"
              aria-label="Falar com um consultor especialista em importação de veículos"
            >
              Falar com um Consultor
              <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
            </Button>
          </div>

          {/* Right — Image */}
          <div className="relative">
            {/* Glow */}
            <div className="absolute -inset-10 bg-primary/20 blur-3xl rounded-full opacity-20" aria-hidden="true" />

            {/* Image Container */}
            <figure className="relative rounded-2xl border border-white/10 bg-background/50 backdrop-blur-sm p-2 m-0">
              <img
                src={WHYUS_IMAGE_URL}
                alt="Veículo de luxo sendo preparado para transporte marítimo internacional pela Enviando Meu Carro - processo seguro com seguro All Risks"
                className="w-full aspect-video object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-700"
                loading="lazy"
                decoding="async"
                width="600"
                height="338"
              />
            </figure>

            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 left-4 right-4 md:left-8 md:right-8 bg-background/90 backdrop-blur-md border border-white/10 rounded-lg p-6 grid grid-cols-3 gap-4" role="group" aria-label="Estatísticas da empresa">
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
