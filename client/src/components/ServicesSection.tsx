/* ServicesSection — 4 service cards with background images, hover zoom, and reveal button */
import { Ship, Globe, FileText, Plane, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openContact, SERVICE_IMPORT_URL, SERVICE_EXPORT_URL, SERVICE_DESPACHO_URL, SERVICE_AEREO_URL } from "@/lib/contact";

const SERVICES = [
  {
    icon: Ship,
    title: "Importação Chave na Mão",
    desc: "Experiência completa e sem atritos. Gerenciamos cada etapa do processo para entregar seu veículo pronto para rodar, com total tranquilidade.",
    image: SERVICE_IMPORT_URL,
  },
  {
    icon: Globe,
    title: "Exportação Global",
    desc: "Leve seu patrimônio para qualquer lugar do mundo. Logística internacional completa com a segurança que seu veículo merece.",
    image: SERVICE_EXPORT_URL,
  },
  {
    icon: FileText,
    title: "Desembaraço Expresso",
    desc: "Liberação ágil e sem dores de cabeça. Nossa equipe técnica blinda seu processo contra atrasos e exigências fiscais.",
    image: SERVICE_DESPACHO_URL,
  },
  {
    icon: Plane,
    title: "Envios Aéreos",
    desc: "Para quem tem pressa. Transporte expresso de veículos via modal aéreo com máxima agilidade.",
    image: SERVICE_AEREO_URL,
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-background relative overflow-hidden">
      <div className="container">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Soluções Completas em{" "}
            <span className="text-primary">Logística Automotiva</span>
          </h2>
          <p className="text-muted-foreground text-lg font-body">
            Não importa a complexidade ou o destino. Temos a expertise necessária para transportar seu veículo com a segurança que ele merece.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="group relative h-[400px] overflow-hidden rounded-xl border border-white/10 bg-card"
            >
              {/* Background Image */}
              <img
                src={service.image}
                alt={service.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent opacity-90" />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-6">
                {/* Icon */}
                <div className="w-12 h-12 rounded bg-primary/20 border border-primary/30 backdrop-blur-sm flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>

                <h3 className="text-xl font-display font-bold text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed font-body mb-4">
                  {service.desc}
                </p>

                {/* Reveal Button on Hover */}
                <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openContact(`Olá! Gostaria de saber mais sobre o serviço de ${service.title}.`)}
                    className="border-primary/30 text-primary hover:bg-primary/10"
                  >
                    Saiba Mais
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Central CTA */}
        <div className="text-center mt-12">
          <Button
            onClick={() => openContact("Olá! Gostaria de uma assessoria completa para importação/exportação de veículo.")}
            className="h-14 px-8 text-lg font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-transform bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Quero uma Assessoria Completa
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-muted-foreground text-sm mt-3 font-body">
            Cuidamos de todo o processo para você, do início ao fim.
          </p>
        </div>
      </div>
    </section>
  );
}
