/* OfficesSection — 3 office locations with details */
import { MapPin, Clock, Globe } from "lucide-react";

const OFFICES = [
  {
    flag: "🇺🇸",
    city: "Miami, FL",
    role: "Sede Internacional",
    address: "1150 NW 72nd Ave, Tower 1, Ste 455 #13677, Miami, FL 33126",
    entity: "PRNSH LLC",
    hours: "9:00 AM – 5:00 PM (EST)",
  },
  {
    flag: "🇧🇷",
    city: "São Paulo, SP",
    role: "Escritório Comercial",
    address: "Vila Olímpia, São Paulo - SP",
    entity: "Enviando Meu Carro Com. Imp. e Exp. LTDA",
    hours: "9:00 – 18:00 (BRT)",
  },
  {
    flag: "🇧🇷",
    city: "Itajaí, SC",
    role: "Base Operacional",
    address: "Próximo ao Porto de Itajaí, SC",
    entity: "Enviando Meu Carro Com. Imp. e Exp. LTDA",
    hours: "9:00 – 18:00 (BRT)",
  },
];

export default function OfficesSection() {
  return (
    <section id="offices" className="py-24 bg-card border-y border-white/5 relative overflow-hidden">
      <div className="container">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mx-auto">
            <Globe className="w-3 h-3" />
            Presença Internacional
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Nossos Escritórios
          </h2>
          <p className="text-muted-foreground text-lg font-body">
            Presença estratégica nos dois países para garantir agilidade e proximidade em cada etapa do processo.
          </p>
        </div>

        {/* Offices Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {OFFICES.map((office) => (
            <div
              key={office.city}
              className="group p-8 rounded-xl bg-background/50 border border-white/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Flag & City */}
              <div className="text-4xl mb-4">{office.flag}</div>
              <h3 className="text-2xl font-display font-bold text-white mb-1">
                {office.city}
              </h3>
              <p className="text-primary text-sm font-bold uppercase tracking-wider mb-4">
                {office.role}
              </p>

              {/* Details */}
              <div className="space-y-3 text-sm text-muted-foreground font-body">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary/60" />
                  <span>{office.address}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary/60" />
                  <span>{office.hours}</span>
                </div>
              </div>

              {/* Entity */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-muted-foreground/60">{office.entity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
