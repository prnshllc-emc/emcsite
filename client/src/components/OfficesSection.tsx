/* OfficesSection — SEO-optimized with consistent design, dynamic addresses from DB */
import { MapPin, Clock, Globe } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export default function OfficesSection() {
  const { get } = useSiteSettings();

  const offices = [
    {
      flag: "🇺🇸",
      city: "Miami, FL",
      role: "Sede Internacional",
      address: get("address_miami"),
      entity: "PRNSH LLC",
      hours: "9:00 AM – 5:00 PM (EST)",
      country: "Estados Unidos",
    },
    {
      flag: "🇧🇷",
      city: "São Paulo, SP",
      role: "Escritório Comercial",
      address: get("address_sp"),
      entity: "Enviando Meu Carro Com. Imp. e Exp. LTDA",
      hours: "9:00 – 18:00 (BRT)",
      country: "Brasil",
    },
    {
      flag: "🇧🇷",
      city: "Itajaí, SC",
      role: "Base Operacional",
      address: get("address_itajai"),
      entity: "Enviando Meu Carro Com. Imp. e Exp. LTDA",
      hours: "9:00 – 18:00 (BRT)",
      country: "Brasil",
    },
  ];

  return (
    <section
      id="offices"
      aria-label="Escritórios internacionais da Enviando Meu Carro"
      className="py-20 bg-card relative overflow-hidden"
    >
      {/* Subtle top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" aria-hidden="true" />

      <div className="container">
        {/* Section Header */}
        <header className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <span className="section-badge">
            <Globe className="w-3 h-3" aria-hidden="true" />
            Presença Internacional
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Escritórios de <span className="text-primary">Logística Automotiva</span>
          </h2>
          <p className="text-gray-300 text-lg font-body leading-relaxed">
            Presença estratégica em pontos-chave para garantir agilidade e proximidade em cada etapa
            do processo de <strong className="text-white">importação e exportação de veículos</strong>.
          </p>
        </header>

        {/* Offices Grid — equalized heights with flex */}
        <div className="grid md:grid-cols-3 gap-5" role="list">
          {offices.map((office) => (
            <article
              key={office.city}
              className="group flex flex-col p-6 rounded-xl bg-background/50 border border-white/8 hover:border-primary/20 transition-all duration-300"
              role="listitem"
            >
              {/* Flag & City */}
              <div className="text-3xl mb-3" aria-hidden="true">{office.flag}</div>
              <h3 className="text-xl font-display font-bold text-white mb-1">
                {office.city}
              </h3>
              <p className="text-primary text-xs font-bold uppercase tracking-wider mb-4">
                {office.role}
              </p>

              {/* Details — address element for local SEO */}
              <address className="not-italic space-y-2.5 text-sm text-gray-300 font-body flex-1">
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
              <div className="mt-4 pt-3 border-t border-white/5">
                <p className="text-xs text-gray-500">{office.entity}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
