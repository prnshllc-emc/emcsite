/* Header — SEO-optimized with semantic nav, tracking events, and accessibility */
import { useState } from "react";
import { Menu, Truck, X } from "lucide-react";
import { LOGO_URL } from "@/lib/contact";
import { trackNavClick, trackModalOpen } from "@/lib/analytics";
import TrackingLoginModal from "./TrackingLoginModal";

const NAV_ITEMS = [
  { label: "Início", anchor: "#inicio" },
  { label: "Sobre Nós", anchor: "#about" },
  { label: "Serviços", anchor: "#services" },
  { label: "Depoimentos", anchor: "#testimonials" },
  { label: "Escritórios", anchor: "#offices" },
  { label: "FAQ", anchor: "#faq" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);

  function scrollTo(anchor: string, label: string) {
    trackNavClick(label, anchor);
    if (anchor === "#inicio") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setMobileOpen(false);
      return;
    }
    const el = document.querySelector(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  }

  function openTracking() {
    trackModalOpen("rastreamento_veiculo");
    setTrackingOpen(true);
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10" role="banner">
        <div className="container flex items-center justify-between h-28">
          {/* Logo — proper anchor with title */}
          <a
            href="https://enviandomeucarro.com/"
            title="EMC - Enviando Meu Carro | Importação e Exportação de Veículos"
            className="flex-shrink-0"
            onClick={(e) => {
              e.preventDefault();
              trackNavClick("Logo", "#inicio");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <img
              src={LOGO_URL}
              alt="EMC - Enviando Meu Carro - Importação e Exportação de Veículos"
              className="h-[6.3rem] w-auto hover:scale-105 transition-transform duration-300"
              width="120"
              height="56"
            />
          </a>

          {/* Desktop Nav — semantic nav with proper anchors */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Navegação principal">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.anchor}
                href={item.anchor}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(item.anchor, item.label);
                }}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={openTracking}
              className="text-sm font-bold text-primary hover:text-primary/80 uppercase tracking-wider flex items-center gap-2 border border-primary/20 px-3 py-1 rounded-full bg-primary/5 transition-colors"
              aria-label="Rastrear meu veículo importado"
            >
              <Truck className="w-4 h-4" aria-hidden="true" />
              Rastrear Meu Carro
            </button>
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-background/95 backdrop-blur-md border-t border-white/10 absolute top-28 left-0 right-0 z-40">
            <nav className="container py-6 flex flex-col gap-4" aria-label="Navegação mobile">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.anchor}
                  href={item.anchor}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(item.anchor, item.label);
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider text-left py-2"
                >
                  {item.label}
                </a>
              ))}
              <button
                onClick={() => {
                  openTracking();
                  setMobileOpen(false);
                }}
                className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2 border border-primary/20 px-3 py-2 rounded-full bg-primary/5 w-fit transition-colors"
                aria-label="Rastrear meu veículo importado"
              >
                <Truck className="w-4 h-4" aria-hidden="true" />
                Rastrear Meu Carro
              </button>
            </nav>
          </div>
        )}
      </header>

      <TrackingLoginModal open={trackingOpen} onOpenChange={setTrackingOpen} />
    </>
  );
}
