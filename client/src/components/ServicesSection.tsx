/* ServicesSection — SEO-optimized 6 service cards linking to deep pages */
import { Ship, Globe, FileText, Plane, Cog, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { openContact, SERVICE_IMPORT_URL, SERVICE_EXPORT_URL, SERVICE_DESPACHO_URL, SERVICE_AEREO_URL, SERVICE_PECAS_URL, SERVICE_ADMISSAO_URL } from "@/lib/contact";
import { trackCTAClick, trackWhatsAppClick } from "@/lib/analytics";

const SERVICES = [
  {
    icon: Ship,
    title: "Importação de Veículos",
    desc: "Do mundo inteiro para o Brasil. Clássicos (+30 anos), 0km, motos e utilitários. Processo completo porta a porta com assessoria em feiras e leilões internacionais.",
    image: SERVICE_IMPORT_URL,
    alt: "Navio cargueiro transportando veículos importados dos EUA para o Brasil - serviço de importação de carros da EMC",
    href: "/importacao-de-veiculos",
    message: "Olá! Gostaria de saber mais sobre importação de veículos.",
  },
  {
    icon: Globe,
    title: "Exportação de Veículos",
    desc: "Do Brasil para qualquer destino. Serviço all-inclusive com logística global, incluindo frete, seguro e desembaraço no país de destino.",
    image: SERVICE_EXPORT_URL,
    alt: "Veículo brasileiro sendo preparado para exportação internacional - serviço de exportação de carros da EMC",
    href: "/exportacao-de-veiculos",
    message: "Olá! Gostaria de saber mais sobre exportação de veículos.",
  },
  {
    icon: FileText,
    title: "Despacho Aduaneiro",
    desc: "Desembaraço completo: DI, licenças (LI, CAT, LCVM), conferência aduaneira e toda a documentação necessária para liberação do seu veículo.",
    image: SERVICE_DESPACHO_URL,
    alt: "Documentação de despacho aduaneiro para importação de veículos - serviço de desembaraço da EMC",
    href: "/despacho-aduaneiro",
    message: "Olá! Preciso de serviço de despacho aduaneiro.",
  },
  {
    icon: Plane,
    title: "Transporte Internacional",
    desc: "Frete marítimo (RoRo e Container) e aéreo para veículos. Seguro All Risks incluso. Rotas EUA-Brasil, Europa-Brasil e Brasil-mundo.",
    image: SERVICE_AEREO_URL,
    alt: "Transporte internacional de veículos por frete marítimo e aéreo - serviço da EMC",
    href: "/transporte-internacional-de-veiculos",
    message: "Olá! Preciso de transporte internacional de veículo.",
  },
  {
    icon: Cog,
    title: "Importação de Clássicos",
    desc: "Serviço especializado para veículos com +30 anos. Laudo ACB, assessoria em feiras internacionais, documentação especial e emplacamento com placa preta.",
    image: SERVICE_PECAS_URL,
    alt: "Carro clássico importado para o Brasil - serviço de importação de veículos antigos da EMC",
    href: "/importacao-de-carros-classicos",
    message: "Olá! Gostaria de importar um carro clássico.",
  },
  {
    icon: Clock,
    title: "Admissão Temporária",
    desc: "Para veículos de corrida, exposição e eventos. Importação temporária com suspensão de tributos e toda a documentação necessária.",
    image: SERVICE_ADMISSAO_URL,
    alt: "Carro de corrida TCR em competição - serviço de admissão temporária de veículos para eventos da EMC",
    href: "/admissao-temporaria",
    message: "Olá! Preciso de admissão temporária para veículo.",
  },
];

export default function ServicesSection() {
  return (
    <section
      id="services"
      aria-label="Serviços de importação e exportação de veículos"
      className="py-20 bg-background relative overflow-hidden"
    >
      <div className="container">
        {/* Section Header */}
        <header className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <span className="section-badge">Nossos Serviços</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Soluções Completas em{" "}
            <span className="text-primary block sm:inline">Logística Automotiva</span>
          </h2>
          <p className="text-gray-300 text-lg font-body leading-relaxed">
            Importação de veículos, exportação, despacho aduaneiro, transporte internacional, clássicos e admissão temporária.
            Não importa a complexidade, temos a expertise para transportar seu veículo com segurança.
          </p>
        </header>

        {/* Services Grid — 3x2 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" role="list">
          {SERVICES.map((service) => (
            <article
              key={service.title}
              className="group relative overflow-hidden rounded-xl border border-white/8 bg-card/80 hover:border-primary/25 transition-all duration-300"
              role="listitem"
            >
              {/* Service Image — links to deep page */}
              <Link href={service.href}>
                <figure className="h-44 overflow-hidden m-0 cursor-pointer">
                  <img
                    src={service.image}
                    alt={service.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="176"
                  />
                </figure>
              </Link>

              {/* Content */}
              <div className="p-5">
                {/* Icon */}
                <div className="w-11 h-11 rounded-lg bg-primary/15 border border-primary/25 backdrop-blur-sm flex items-center justify-center mb-3 -mt-10 relative z-10 shadow-lg" aria-hidden="true">
                  <service.icon className="w-5 h-5 text-primary" />
                </div>

                <h3 className="text-lg font-display font-bold text-white mb-2">
                  <Link href={service.href} className="hover:text-primary transition-colors">
                    {service.title}
                  </Link>
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed font-body mb-4">
                  {service.desc}
                </p>

                <div className="flex gap-2">
                  <Link href={service.href}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/25 text-primary hover:bg-primary/10 hover:border-primary/40 text-xs"
                      aria-label={`Saiba mais sobre ${service.title}`}
                    >
                      Saiba Mais
                      <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      trackCTAClick(`WhatsApp - ${service.title}`, "services_section", "whatsapp", service.title);
                      trackWhatsAppClick(`service_${service.title.toLowerCase().replace(/\s+/g, '_')}`, service.message);
                      openContact(service.message);
                    }}
                    className="text-gray-400 hover:text-primary text-xs"
                    aria-label={`Falar sobre ${service.title} no WhatsApp`}
                  >
                    WhatsApp
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Central CTA */}
        <div className="text-center mt-12">
          <Button
            variant="ghost"
            onClick={() => {
              trackCTAClick("Assessoria Completa", "services_section_bottom", "whatsapp", "Quero uma Assessoria Completa");
              trackWhatsAppClick("services_section_bottom_cta", "Olá! Gostaria de uma assessoria completa para importação/exportação de veículo.");
              openContact("Olá! Gostaria de uma assessoria completa para importação/exportação de veículo.");
            }}
            className="cta-whatsapp"
            aria-label="Solicitar assessoria completa de importação e exportação de veículos"
          >
            Quero uma Assessoria Completa
            <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
          </Button>
          <p className="text-gray-400 text-sm mt-3 font-body">
            Cuidamos de todo o processo para você, do início ao fim.
          </p>
        </div>
      </div>
    </section>
  );
}
