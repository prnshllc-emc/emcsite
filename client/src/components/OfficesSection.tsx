/* OfficesSection — SEO-optimized with semantic HTML, address elements, and local business signals */
import { MapPin, Clock, Globe } from "lucide-react";

const OFFICES = [
  {
    flag: "🇺🇸",
    city: "Miami, FL",
    role: "Sede Internacional",
    address: "1150 NW 72nd Ave, Tower 1, Ste 455 #13677, Miami, FL 33126",
    entity: "PRNSH LLC",
    hours: "9:00 AM – 5:00 PM (EST)",
    country: "Estados Unidos",
  },
  {
    flag: "🇧🇷",
    city: "São Paulo, SP",
    role: "Escritório Comercial",
    address: "Vila Olímpia, São Paulo - SP",
    entity: "Enviando Meu Carro Com. Imp. e Exp. LTDA",
    hours: "9:00 – 18:00 (BRT)",
    country: "Brasil",
  },
  {
    flag: "🇧🇷",
    city: "Itajaí, SC",
    role: "Base Operacional",
    address: "Próximo ao Porto de Itajaí, SC",
    entity: "Enviando Meu Carro Com. Imp. e Exp. LTDA",
    hours: "9:00 – 18:00 (BRT)",
    country: "Brasil",
  },
];

export default function OfficesSection() {
  return (
    <section
      id="offices"
      aria-label="Escritórios internacionais da Enviando Meu Carro para importação e exportação de veículos"
      className="py-24 bg-card border-y border-white/5 relative overflow-hidden"
    >
      <div className="container">
        {/* Section Header */}
        <header className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mx-auto">
            <Globe className="w-3 h-3" aria-hidden="true" />
            Presença Internacional
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Escritórios de <span className="text-primary">Logística Automotiva</span> no Mundo
          </h2>
          <p className="text-muted-foreground text-lg font-body">
            Presença estratégica em pontos-chave para garantir agilidade e proximidade em cada etapa
            do processo de <strong>importação e exportação de veículos</strong>, onde quer que seu veículo esteja.
          </p>
        </header>

        {/* Offices Grid — semantic address elements */}
        <div className="grid md:grid-cols-3 gap-8" role="list">
          {OFFICES.map((office) => (
            <article
              key={office.city}
              className="group p-8 rounded-xl bg-background/50 border border-white/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              role="listitem"
            >
              {/* Flag & City */}
              <div className="text-4xl mb-4" aria-hidden="true">{office.flag}</div>
              <h3 className="text-2xl font-display font-bold text-white mb-1">
                {office.city}
              </h3>
              <p className="text-primary text-sm font-bold uppercase tracking-wider mb-4">
                {office.role}
              </p>

              {/* Details — address element for local SEO */}
              <address className="not-italic space-y-3 text-sm text-muted-foreground font-body">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary/60" aria-hidden="true" />
                  <span>{office.address}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary/60" aria-hidden="true" />
                  <time>{office.hours}</time>
                </div>
              </address>

              {/* Entity */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-muted-foreground/60">{office.entity}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
