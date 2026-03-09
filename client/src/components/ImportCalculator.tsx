/* ImportCalculator — Card with glow effect, vehicle type selection buttons linking to external calculator */
import { Car, Bike, Calculator, Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const VEHICLE_TYPES = [
  {
    icon: Car,
    label: "Clássicos",
    desc: "Veículos antigos (+30 anos)",
    utm: "classicos",
  },
  {
    icon: Car,
    label: "Zero KM",
    desc: "Veículos novos",
    utm: "zerokm",
  },
  {
    icon: Bike,
    label: "Motos",
    desc: "Motocicletas e scooters",
    utm: "motos",
  },
];

export default function ImportCalculator() {
  function openCalculator(utm: string) {
    window.open(
      `https://calculadora.enviandomeucarro.com?utm_source=site&utm_medium=calculator&utm_campaign=${utm}`,
      "_blank"
    );
  }

  async function shareSimulator() {
    const shareData = {
      title: "Simulador de Importação | Enviando Meu Carro",
      text: "Simule a viabilidade estratégica da sua importação com precisão.",
      url: "https://calculadora.enviandomeucarro.com?utm_source=share&utm_medium=social",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      toast.success("Link copiado para a área de transferência!");
    }
  }

  return (
    <div className="relative group">
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/20 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 rounded-2xl" />

      {/* Card */}
      <div className="relative bg-card/95 backdrop-blur-sm border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl min-h-[400px] flex flex-col justify-center">
        {/* Calculator Icon */}
        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
          <Calculator className="w-6 h-6 text-primary" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white text-center mb-2 font-display">
          Planeje seu Investimento
        </h3>
        <p className="text-muted-foreground text-sm text-center mb-8 font-body">
          Simule a viabilidade estratégica da sua importação com precisão.
        </p>

        {/* Vehicle Type Buttons */}
        <div className="space-y-3">
          {VEHICLE_TYPES.map((type) => (
            <button
              key={type.utm}
              onClick={() => openCalculator(type.utm)}
              className="w-full flex items-center gap-4 h-14 px-4 rounded-lg border border-white/10 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all group/btn"
            >
              <type.icon className="w-5 h-5 text-muted-foreground group-hover/btn:text-primary transition-colors" />
              <div className="text-left flex-1">
                <p className="text-white text-sm font-bold group-hover/btn:text-primary transition-colors">
                  {type.label}
                </p>
                <p className="text-muted-foreground text-xs">{type.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary transition-colors" />
            </button>
          ))}
        </div>

        {/* Share Button */}
        <button
          onClick={shareSimulator}
          className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mx-auto uppercase tracking-wider font-bold"
        >
          <Share2 className="w-4 h-4" />
          Compartilhar Simulador
        </button>
      </div>
    </div>
  );
}
