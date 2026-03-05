/* TestimonialsSection — Video testimonial + 3 review cards with real client data */
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
    <section id="testimonials" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container">
        {/* Badge */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
            Depoimentos
          </div>
        </div>

        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Veja o que Nossos Clientes Dizem
          </h2>
          <p className="text-muted-foreground text-lg font-body">
            5.0 estrelas no Google com 18+ avaliações. Excelência comprovada em cada entrega.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Video */}
          <div className="max-w-sm mx-auto w-full">
            <div className="relative aspect-[9/16] rounded-2xl border border-white/10 bg-card shadow-2xl shadow-primary/5 overflow-hidden">
              {!playing ? (
                <div className="relative w-full h-full">
                  <img
                    src={TESTIMONIAL_POSTER_URL}
                    alt="Depoimento de cliente"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />

                  {/* Play Button */}
                  <button
                    onClick={() => setPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center"
                    aria-label="Play video"
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center hover:scale-110 transition-transform shadow-xl">
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                  </button>

                  {/* Bottom Overlay Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white font-bold font-display text-lg">Depoimento Real</p>
                    <p className="text-gray-300 text-sm font-body">
                      Veja a experiência de quem já confiou na EMC
                    </p>
                  </div>
                </div>
              ) : (
                <video
                  src={TESTIMONIAL_VIDEO_URL}
                  autoPlay
                  controls
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          {/* Right — Testimonial Cards */}
          <div className="space-y-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="group p-6 rounded-xl bg-card border border-white/5 hover:border-primary/20 transition-colors relative animate-in slide-in-from-right-4 duration-500"
                style={{ animationDelay: t.delay }}
              >
                {/* Quote Icon */}
                <Quote className="absolute top-4 right-4 w-8 h-8 text-white/10 group-hover:text-primary/20 transition-colors" />

                {/* Stars */}
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-gray-300 italic leading-relaxed text-sm font-body mb-4">
                  "{t.text}"
                </p>

                {/* Name */}
                <p className="text-white font-bold font-display">{t.name}</p>
                <p className="text-xs uppercase tracking-wider text-primary">
                  Cliente Enviando Meu Carro
                </p>
              </div>
            ))}

            {/* Google Reviews Button */}
            <Button
              variant="outline"
              onClick={() => window.open("https://www.google.com/search?q=Enviando+Meu+Carro+avalia%C3%A7%C3%B5es", "_blank")}
              className="border-white/10 hover:border-primary/50 text-muted-foreground hover:text-primary"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-4 h-4 mr-2"
              />
              Ver todas as avaliações no Google
              <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
