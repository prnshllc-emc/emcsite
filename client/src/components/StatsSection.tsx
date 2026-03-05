/* StatsSection — SEO-optimized company numbers with semantic HTML and keyword-rich content */

const STATS = [
  { value: "+1.500", label: "Veículos Transportados" },
  { value: "10+", label: "Anos de Experiência" },
  { value: "5.0 ★", label: "Avaliação Google" },
  { value: "3", label: "Escritórios Internacionais" },
];

export default function StatsSection() {
  return (
    <section
      id="stats"
      aria-label="Números e resultados da Enviando Meu Carro em importação e exportação de veículos"
      className="py-24 bg-card border-y border-white/5 relative overflow-hidden"
    >
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 opacity-100"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="container relative z-10">
        {/* Section Header */}
        <header className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Quem entende de <span className="text-primary">importação de carros</span>, escolhe a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400">
              EMC
            </span>
          </h2>
          <p className="text-muted-foreground text-lg font-body">
            Nossos números refletem mais de uma década de compromisso com transparência, segurança e excelência
            em <strong>logística automotiva internacional</strong> — importação, exportação e muito mais.
          </p>
        </header>

        {/* Stats Grid — semantic list */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8" role="list" aria-label="Estatísticas da empresa">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="group relative bg-background/50 backdrop-blur-sm border border-white/10 rounded-lg p-6 text-center hover:border-primary/50 transition-all duration-300"
              role="listitem"
            >
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500 rounded-lg" aria-hidden="true" />

              {/* Decorative Corners */}
              <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-primary/30" aria-hidden="true" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-primary/30" aria-hidden="true" />

              <div className="relative z-10">
                <p className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter">
                  {stat.value}
                </p>
                <p className="text-xs font-bold text-primary tracking-widest uppercase mt-2">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
