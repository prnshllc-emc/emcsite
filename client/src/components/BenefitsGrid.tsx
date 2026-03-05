/* BenefitsGrid — SEO-optimized "Sobre Nós" section with semantic HTML and keyword-rich content */
import { Target, Wrench, Unlock } from "lucide-react";

const PILLARS = [
  {
    icon: Target,
    title: "Nossa Missão",
    desc: "Facilitar a importação e exportação de veículos para e de qualquer lugar do mundo com transparência total, excelência operacional e compromisso inabalável com a satisfação do cliente, tornando o processo acessível, seguro e confiável.",
  },
  {
    icon: Wrench,
    title: "Nossos Serviços",
    desc: "Oferecemos todos os serviços que seu carro pode precisar em cada etapa do processo. Da importação de clássicos e 0km à exportação, despacho aduaneiro, peças e envios aéreos — cuidamos de tudo de ponta a ponta, para que seu veículo receba o cuidado que merece.",
  },
  {
    icon: Unlock,
    title: "VC que Manda",
    desc: "Sua liberdade é nossa prioridade. Utilizamos tecnologia e serviços de ponta para oferecer somente os serviços que você precisa. Sem pegadinhas, sabendo o quanto vai pagar por cada etapa. Você escolhe, você decide, você que manda.",
  },
];

export default function BenefitsGrid() {
  return (
    <section
      id="about"
      aria-label="Sobre a Enviando Meu Carro - empresa de importação e exportação de veículos"
      className="py-24 bg-background relative overflow-hidden"
    >
      <div className="container">
        {/* Section Header */}
        <header className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mx-auto">
            Sobre Nós
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Conheça a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400">
              Enviando Meu Carro
            </span>
          </h2>
          <p className="text-muted-foreground text-lg font-body">
            Há mais de 10 anos facilitando a <strong>importação e exportação de veículos</strong> ao redor do mundo,
            com a segurança e transparência que você merece. Mais de 1.500 veículos transportados com excelência.
          </p>
        </header>

        {/* 3 Pillars Grid — article semantics */}
        <div className="grid md:grid-cols-3 gap-8" role="list">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.title}
              className="group p-8 rounded-xl bg-card border border-white/10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
              role="listitem"
            >
              <div className="w-14 h-14 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-6 transition-colors" aria-hidden="true">
                <pillar.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-4">
                {pillar.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-body">
                {pillar.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
