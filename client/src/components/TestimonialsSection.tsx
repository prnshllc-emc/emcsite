/* TestimonialsSection — SEO-optimized review cards with consistent design */
import { Star, Quote, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackCTAClick } from "@/lib/analytics";

const TESTIMONIALS = [
  {
    name: "Marcelo Matheus",
    text: "Fiz a importação do meu carro com a empresa Enviando Meu Carro e o processo foi impecável. Transparência total em cada etapa, sem surpresas.",
  },
  {
    name: "Maykon Siqueira",
    text: "Já é o sexto trabalho que faço com o Fred. Atenção, cuidado e profissionalismo em cada detalhe. Recomendo de olhos fechados para importação e exportação.",
  },
  {
    name: "Rafael Marinho",
    text: "Processo de exportação do meu veículo foi muito mais simples do que eu imaginava. A equipe cuidou de toda a burocracia e documentação. Excelente!",
  },
];

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      aria-label="Depoimentos de clientes sobre importação e exportação de veículos"
      className="py-20 bg-background relative overflow-hidden"
    >
      <div className="container">
        {/* Section Header */}
        <header className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <span className="section-badge">Depoimentos</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Clientes que <span className="text-primary">Importaram e Exportaram</span> Veículos
          </h2>
          <p className="text-gray-300 text-lg font-body">
            <strong className="text-white">5.0 estrelas no Google</strong> com 18+ avaliações verificadas.
            Excelência comprovada em cada entrega.
          </p>
        </header>

        {/* Testimonial Cards Grid */}
        <div className="grid md:grid-cols-3 gap-5" role="list" aria-label="Avaliações de clientes">
          {TESTIMONIALS.map((t) => (
            <blockquote
              key={t.name}
              className="group p-6 rounded-xl bg-card/80 border border-white/8 hover:border-primary/20 transition-all relative"
              role="listitem"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-white/5 group-hover:text-primary/10 transition-colors" aria-hidden="true" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-4" aria-label="Avaliação 5 de 5 estrelas">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" aria-hidden="true" />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-300 italic leading-relaxed font-body mb-5 text-sm">
                "{t.text}"
              </p>

              {/* Attribution */}
              <footer>
                <cite className="not-italic">
                  <p className="text-white font-bold font-display">{t.name}</p>
                  <p className="text-[11px] uppercase tracking-wider text-primary/80 mt-0.5">
                    Cliente Enviando Meu Carro
                  </p>
                </cite>
              </footer>
            </blockquote>
          ))}
        </div>

        {/* Google Reviews Button */}
        <div className="text-center mt-10">
          <Button
            variant="outline"
            onClick={() => {
              trackCTAClick("Ver Avaliações Google", "testimonials_section", "https://www.google.com/search?q=Enviando+Meu+Carro+avaliacoes", "Google Reviews");
              window.open("https://www.google.com/search?q=Enviando+Meu+Carro+avalia%C3%A7%C3%B5es", "_blank");
            }}
            className="border-white/10 hover:border-primary/30 text-gray-400 hover:text-primary text-sm"
            aria-label="Ver todas as avaliações da Enviando Meu Carro no Google"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-4 h-4 mr-2"
              loading="lazy"
            />
            Ver todas as avaliações no Google
            <ExternalLink className="w-3 h-3 ml-2" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
