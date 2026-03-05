/* ServicesSection — SEO-optimized 6 service cards with semantic HTML, keyword-rich alt text, and article structure */
import { Ship, Globe, FileText, Plane, Cog, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openContact, SERVICE_IMPORT_URL, SERVICE_EXPORT_URL, SERVICE_DESPACHO_URL, SERVICE_AEREO_URL, SERVICE_PECAS_URL, SERVICE_ADMISSAO_URL } from "@/lib/contact";

const SERVICES = [
  {
    icon: Ship,
    title: "Importação de Veículos",
    desc: "Do mundo inteiro para o Brasil. Clássicos (+30 anos), 0km, motos e utilitários. Processo completo porta a porta com assessoria em feiras e leilões internacionais.",
    image: SERVICE_IMPORT_URL,
    alt: "Navio cargueiro transportando veículos importados dos EUA para o Brasil - serviço de importação de carros da EMC",
    message: "Olá! Gostaria de saber mais sobre importação de veículos.",
  },
  {
    icon: Globe,
    title: "Exportação de Veículos",
    desc: "Do Brasil para qualquer destino. Serviço all-inclusive com logística global, incluindo frete, seguro e desembaraço no país de destino.",
    image: SERVICE_EXPORT_URL,
    alt: "Veículo brasileiro sendo preparado para exportação internacional - serviço de exportação de carros da EMC",
    message: "Olá! Gostaria de saber mais sobre exportação de veículos.",
  },
  {
    icon: FileText,
    title: "Despacho Aduaneiro",
    desc: "Desembaraço completo: DI, licenças (LI, CAT, LCVM), conferência aduaneira e toda a documentação necessária para liberação do seu veículo.",
    image: SERVICE_DESPACHO_URL,
    alt: "Documentação de despacho aduaneiro para importação de veículos - serviço de desembaraço da EMC",
    message: "Olá! Preciso de serviço de despacho aduaneiro.",
  },
  {
    icon: Cog,
    title: "Peças e Acessórios",
    desc: "Importação de peças originais e acessórios do mundo inteiro. Economize tempo e dinheiro com quem entende de logística automotiva internacional.",
    image: SERVICE_PECAS_URL,
    alt: "Motor LS V8 de Corvette - importação de peças e acessórios automotivos originais pela EMC",
    message: "Olá! Gostaria de importar peças e acessórios.",
  },
  {
    icon: Plane,
    title: "Envios Aéreos",
    desc: "Transporte expresso via modal aéreo para quem tem pressa. Ideal para peças, acessórios e veículos de menor porte com urgência.",
    image: SERVICE_AEREO_URL,
    alt: "Transporte aéreo expresso de veículos e peças automotivas - serviço de envio aéreo da EMC",
    message: "Olá! Preciso de envio aéreo.",
  },
  {
    icon: Clock,
    title: "Admissão Temporária",
    desc: "Para veículos de corrida, exposição e eventos. Importação temporária com toda a documentação e logística necessária.",
    image: SERVICE_ADMISSAO_URL,
    alt: "Carro de corrida TCR em competição - serviço de admissão temporária de veículos para eventos da EMC",
    message: "Olá! Preciso de admissão temporária para veículo.",
  },
];

export default function ServicesSection() {
  return (
    <section
      id="services"
      aria-label="Serviços de importação e exportação de veículos"
      className="py-24 bg-background relative overflow-hidden"
    >
      <div className="container">
        {/* Section Header */}
        <header className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mx-auto">
            Nossos Serviços
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Soluções Completas em{" "}
            <span className="text-primary">Logística Automotiva Internacional</span>
          </h2>
          <p className="text-muted-foreground text-lg font-body">
            Importação de veículos, exportação, despacho aduaneiro, peças, envios aéreos e admissão temporária.
            Não importa a complexidade, temos a expertise para transportar seu veículo com segurança para qualquer lugar do mundo.
          </p>
        </header>

        {/* Services Grid — 3x2 with article semantics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
          {SERVICES.map((service) => (
            <article
              key={service.title}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-card hover:border-primary/30 transition-all duration-300"
              role="listitem"
            >
              {/* Service Image */}
              <figure className="h-48 overflow-hidden m-0">
                <img
                  src={service.image}
                  alt={service.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                  decoding="async"
                  width="400"
                  height="192"
                />
              </figure>

              {/* Content */}
              <div className="p-6">
                {/* Icon */}
                <div className="w-12 h-12 rounded bg-primary/20 border border-primary/30 backdrop-blur-sm flex items-center justify-center mb-4 -mt-12 relative z-10 shadow-lg" aria-hidden="true">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>

                <h3 className="text-xl font-display font-bold text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed font-body mb-4">
                  {service.desc}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openContact(service.message)}
                  className="border-primary/30 text-primary hover:bg-primary/10"
                  aria-label={`Solicitar orçamento para ${service.title}`}
                >
                  Saiba Mais
                  <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
                </Button>
              </div>
            </article>
          ))}
        </div>

        {/* Central CTA */}
        <div className="text-center mt-12">
          <Button
            onClick={() => openContact("Olá! Gostaria de uma assessoria completa para importação/exportação de veículo.")}
            className="h-14 px-8 text-lg font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-transform bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Solicitar assessoria completa de importação e exportação de veículos"
          >
            Quero uma Assessoria Completa
            <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
          </Button>
          <p className="text-muted-foreground text-sm mt-3 font-body">
            Cuidamos de todo o processo para você, do início ao fim.
          </p>
        </div>
      </div>
    </section>
  );
}
