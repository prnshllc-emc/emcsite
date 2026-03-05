/* BenefitsGrid — 4 benefit cards with icons and hover lift effect */
import { ShieldCheck, TrendingUp, Smartphone, Clock } from "lucide-react";

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Importação em Seu Nome",
    desc: "Mais segurança para seu patrimônio. O veículo é importado diretamente no seu CPF/CNPJ, com total transparência e controle.",
  },
  {
    icon: TrendingUp,
    title: "Eficiência Fiscal",
    desc: "Planejamento tributário estratégico para viabilizar seu investimento com inteligência e compliance absoluto.",
  },
  {
    icon: Smartphone,
    title: "Controle Total",
    desc: "Você no comando em todas as etapas. Acompanhe o status do seu veículo 24/7 com nosso sistema de rastreamento em tempo real.",
  },
  {
    icon: Clock,
    title: "Logística de Precisão",
    desc: "Gestão de rotas otimizadas e cronogramas assertivos. Sua importação tratada com a prioridade que merece.",
  },
];

export default function BenefitsGrid() {
  return (
    <section id="benefits" className="py-24 bg-background relative overflow-hidden">
      <div className="container">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Com a Enviando Meu Carro, você garante:
          </h2>
          <p className="text-muted-foreground text-lg font-body">
            Elevamos o padrão da logística automotiva para que sua única preocupação seja escolher o próximo destino.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="group p-6 rounded-xl bg-card border border-white/10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-body">
                {benefit.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
