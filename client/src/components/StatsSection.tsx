/* StatsSection — SEO-optimized company numbers with improved visual consistency */
import { Ship, Clock, Star, Globe } from "lucide-react";

const STATS = [
  { icon: Ship, value: "+1.500", label: "Veículos Transportados", desc: "Importados e exportados com segurança" },
  { icon: Clock, value: "10+", label: "Anos de Experiência", desc: "Referência em logística automotiva" },
  { icon: Star, value: "5.0 ★", label: "Avaliação Google", desc: "Nota máxima com 18+ avaliações" },
  { icon: Globe, value: "3", label: "Escritórios", desc: "Miami, São Paulo e Itajaí" },
];

export default function StatsSection() {
  return (
    <section
      id="stats"
      aria-label="Números e resultados da Enviando Meu Carro em importação e exportação de veículos"
      className="py-20 bg-card relative overflow-hidden"
    >
      {/* Subtle top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" aria-hidden="true" />

      <div className="container relative z-10">
        {/* Section Header */}
        <header className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <span className="section-badge">Nossos Números</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Quem Entende de <span className="text-primary">Importação de Carros</span>, Escolhe a EMC
          </h2>
          <p className="text-gray-300 text-lg font-body leading-relaxed">
            Nossos números refletem mais de uma década de compromisso com transparência, segurança e excelência
            em <strong className="text-white">logística automotiva internacional</strong>.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" role="list" aria-label="Estatísticas da empresa">
          {STATS.map((stat) => (
            <article
              key={stat.label}
              className="group relative p-6 md:p-8 rounded-xl bg-background/50 border border-white/8 hover:border-primary/25 transition-all duration-300 text-center"
              role="listitem"
            >
              {/* Icon */}
              <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/15 transition-colors" aria-hidden="true">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>

              {/* Value */}
              <p className="text-3xl md:text-4xl font-display font-extrabold text-white mb-1 tracking-tight">
                {stat.value}
              </p>

              {/* Label */}
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                {stat.label}
              </p>

              {/* Description */}
              <p className="text-xs text-gray-400 font-body">
                {stat.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
