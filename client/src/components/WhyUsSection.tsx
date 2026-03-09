/* WhyUsSection — SEO-optimized benefits section with consistent design */
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openContact, WHYUS_IMAGE_URL } from "@/lib/contact";
import { trackCTAClick, trackWhatsAppClick } from "@/lib/analytics";

const CHECKLIST = [
  "Transparência total sobre custos e prazos",
  "Seguro All Risks obrigatório em toda operação",
  "Rastreamento em tempo real de cada etapa",
  "Armazenagem gratuita por 60 dias no destino",
  "Dossiê completo de documentação aduaneira",
  "Assessoria em feiras e leilões internacionais",
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
      className="py-20 bg-card relative overflow-hidden"
    >
      {/* Subtle top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" aria-hidden="true" />

      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Content */}
          <div className="space-y-6">
            {/* Badge */}
            <span className="section-badge">Por que nos escolher?</span>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Inteligência Logística para{" "}
              <span className="text-primary">Importar e Exportar Veículos</span>
            </h2>

            <p className="text-gray-300 text-base lg:text-lg font-body leading-relaxed">
              Na <strong className="text-white">Enviando Meu Carro</strong>, transformamos a complexidade da logística automotiva internacional em uma experiência fluida.
              Seja importando um carro clássico dos EUA ou exportando do Brasil, nossa expertise garante segurança, agilidade e o melhor custo-benefício.
            </p>

            {/* Checklist */}
            <ul className="grid sm:grid-cols-2 gap-3 list-none" role="list">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-2.5 group">
                  <CheckCircle2 className="w-4.5 h-4.5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-gray-300 text-sm font-body leading-snug">{item}</span>
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
              className="cta-primary shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all bg-primary text-primary-foreground hover:bg-primary/90"
              aria-label="Falar com um consultor especialista em importação de veículos"
            >
              Falar com um Consultor
              <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
            </Button>
          </div>

          {/* Right — Image */}
          <div className="relative">
            {/* Glow */}
            <div className="absolute -inset-8 bg-primary/15 blur-3xl rounded-full opacity-20" aria-hidden="true" />

            {/* Image Container */}
            <figure className="relative rounded-2xl border border-white/8 bg-background/50 backdrop-blur-sm p-1.5 m-0 overflow-hidden">
              <img
                src={WHYUS_IMAGE_URL}
                alt="Veículo de luxo sendo preparado para transporte marítimo internacional pela Enviando Meu Carro"
                className="w-full aspect-video object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-700"
                loading="lazy"
                decoding="async"
                width="600"
                height="338"
              />
            </figure>

            {/* Floating Stats Card */}
            <div className="absolute -bottom-5 left-6 right-6 md:left-8 md:right-8 bg-background/90 backdrop-blur-md border border-white/10 rounded-lg p-5 grid grid-cols-3 gap-4" role="group" aria-label="Estatísticas da empresa">
              {FLOATING_STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-display font-bold text-white">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-primary font-bold tracking-wider uppercase">
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
