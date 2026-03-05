/* TestimonialsSection — SEO-optimized video testimonial + review cards with semantic HTML and accessibility */
import { useState } from "react";
import { Star, Quote, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TESTIMONIAL_POSTER_URL, TESTIMONIAL_VIDEO_URL } from "@/lib/contact";

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
  const [playing, setPlaying] = useState(false);

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

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Video */}
          <figure className="max-w-sm mx-auto w-full m-0">
            <div className="relative aspect-[9/16] rounded-2xl border border-white/10 bg-card shadow-2xl shadow-primary/5 overflow-hidden">
              {!playing ? (
                <div className="relative w-full h-full">
                  <img
                    src={TESTIMONIAL_POSTER_URL}
                    alt="Depoimento em vídeo de cliente que importou veículo com a Enviando Meu Carro - EMC"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

                  {/* Play Button */}
                  <button
                    onClick={() => setPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center"
                    aria-label="Assistir depoimento em vídeo de cliente da Enviando Meu Carro"
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center hover:scale-110 transition-transform shadow-xl">
                      <Play className="w-8 h-8 text-white ml-1" fill="white" aria-hidden="true" />
                    </div>
                  </button>

                  {/* Bottom Overlay Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white font-bold font-display text-lg">Depoimento Real</p>
                    <p className="text-gray-300 text-sm font-body">
                      Veja a experiência de quem já importou com a EMC
                    </p>
                  </div>
                </div>
              ) : (
                <video
                  src={TESTIMONIAL_VIDEO_URL}
                  autoPlay
                  controls
                  className="w-full h-full object-cover"
                  title="Depoimento de cliente sobre importação de veículo pela Enviando Meu Carro"
                />
              )}
            </div>
            <figcaption className="sr-only">Vídeo depoimento de cliente satisfeito com o serviço de importação de veículos da EMC</figcaption>
          </figure>

          {/* Right — Testimonial Cards */}
          <div className="space-y-6" role="list" aria-label="Avaliações de clientes">
            {TESTIMONIALS.map((t) => (
              <blockquote
                key={t.name}
                className="group p-6 rounded-xl bg-card border border-white/5 hover:border-primary/20 transition-colors relative animate-in slide-in-from-right-4 duration-500"
                style={{ animationDelay: t.delay }}
                role="listitem"
              >
                {/* Quote Icon */}
                <Quote className="absolute top-4 right-4 w-8 h-8 text-white/10 group-hover:text-primary/20 transition-colors" aria-hidden="true" />

                {/* Stars */}
                <div className="flex gap-1 mb-3" aria-label="Avaliação 5 de 5 estrelas">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" aria-hidden="true" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-gray-300 italic leading-relaxed text-sm font-body mb-4">
                  "{t.text}"
                </p>

                {/* Attribution */}
                <footer>
                  <cite className="not-italic">
                    <p className="text-white font-bold font-display">{t.name}</p>
                    <p className="text-xs uppercase tracking-wider text-primary">
                      Cliente Enviando Meu Carro
                    </p>
                  </cite>
                </footer>
              </blockquote>
            ))}

            {/* Google Reviews Button */}
            <Button
              variant="outline"
              onClick={() => window.open("https://www.google.com/search?q=Enviando+Meu+Carro+avalia%C3%A7%C3%B5es", "_blank")}
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
      </div>
    </section>
  );
}
