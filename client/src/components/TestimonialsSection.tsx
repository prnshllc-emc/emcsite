/* TestimonialsSection — SEO-optimized review cards with semantic HTML and accessibility (no video) */
import { Star, Quote, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackCTAClick } from "@/lib/analytics";

const TESTIMONIALS = [
  {
    name: "Marcelo Matheus",
    text: "Fiz a importação do meu carro com a empresa Enviando Meu Carro e o processo foi impecável. Transparência total em cada etapa, sem surpresas.",
    delay: "0ms",
  },
  {
    name: "Maykon Siqueira",
    text: "Já é o sexto trabalho que faço com o Fred. Atenção, cuidado e profissionalismo em cada detalhe. Recomendo de olhos fechados para importação e exportação.",
    delay: "150ms",
  },
  {
    name: "Rafael Marinho",
    text: "Processo de exportação do meu veículo foi muito mais simples do que eu imaginava. A equipe cuidou de toda a burocracia e documentação. Excelente!",
    delay: "300ms",
  },
];

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      aria-label="Depoimentos de clientes sobre importação e exportação de veículos"
      className="py-24 bg-background relative overflow-hidden"
    >
      {/* Decorative Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden="true" />

      <div className="container">
        {/* Badge */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
            Depoimentos
          </span>
        </div>

        {/* Section Header */}
        <header className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Avaliações de Clientes que <span className="text-primary">Importaram e Exportaram</span> Veículos
          </h2>
          <p className="text-muted-foreground text-lg font-body">
            <strong>5.0 estrelas no Google</strong> com 18+ avaliações verificadas.
            Excelência comprovada em cada entrega de veículo importado ou exportado.
          </p>
        </header>

        {/* Testimonial Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8" role="list" aria-label="Avaliações de clientes">
          {TESTIMONIALS.map((t) => (
            <blockquote
              key={t.name}
              className="group p-8 rounded-xl bg-card border border-white/5 hover:border-primary/20 transition-colors relative animate-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: t.delay }}
              role="listitem"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 w-10 h-10 text-white/5 group-hover:text-primary/15 transition-colors" aria-hidden="true" />

              {/* Stars */}
              <div className="flex gap-1 mb-4" aria-label="Avaliação 5 de 5 estrelas">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-primary text-primary" aria-hidden="true" />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-300 italic leading-relaxed font-body mb-6">
                "{t.text}"
              </p>

              {/* Attribution */}
              <footer>
                <cite className="not-italic">
                  <p className="text-white font-bold font-display text-lg">{t.name}</p>
                  <p className="text-xs uppercase tracking-wider text-primary mt-1">
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
            className="border-white/10 hover:border-primary/50 text-muted-foreground hover:text-primary"
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
