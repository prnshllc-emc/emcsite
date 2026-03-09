/* BenefitsGrid — SEO-optimized "Sobre Nós" section with consistent design */
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
      className="py-20 bg-background relative overflow-hidden"
    >
      <div className="container">
        {/* Section Header */}
        <header className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <span className="section-badge">Sobre Nós</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Conheça a <span className="text-primary">Enviando Meu Carro</span>
          </h2>
          <p className="text-gray-300 text-lg font-body leading-relaxed">
            Há mais de 10 anos facilitando a <strong className="text-white">importação e exportação de veículos</strong> ao redor do mundo,
            com a segurança e transparência que você merece. Mais de 1.500 veículos transportados com excelência.
          </p>
        </header>

        {/* 3 Pillars Grid */}
        <div className="grid md:grid-cols-3 gap-5 md:gap-6" role="list">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.title}
              className="group p-7 rounded-xl bg-card/80 border border-white/8 hover:border-primary/25 transition-all duration-300"
              role="listitem"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/15 flex items-center justify-center mb-5 transition-colors" aria-hidden="true">
                <pillar.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">
                {pillar.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed font-body">
                {pillar.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
