/* Header — SEO-optimized with semantic nav, tracking events, and accessibility */
import { useState } from "react";
import { Clock, Menu, Truck, X } from "lucide-react";
import { LOGO_URL } from "@/lib/contact";
import { trackNavClick } from "@/lib/analytics";
import { toast } from "sonner";

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

  function handleTrackingComingSoon() {
    toast.info("Rastreamento em breve! Estamos finalizando esta funcionalidade para você.", {
      duration: 4000,
    });
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10" role="banner">
      <div className="container flex items-center justify-between h-20 lg:h-24">
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
            className="h-14 lg:h-[4.5rem] w-auto hover:scale-105 transition-transform duration-300"
            width="120"
            height="56"
          />
        </a>

        {/* Desktop Nav — semantic nav with proper anchors */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.anchor}
              href={item.anchor}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(item.anchor, item.label);
              }}
              className="whitespace-nowrap text-[13px] xl:text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
            >
              {item.label}
            </a>
          ))}
          <button
            onClick={handleTrackingComingSoon}
            className="whitespace-nowrap text-[13px] xl:text-sm font-bold text-muted-foreground/60 uppercase tracking-wider flex items-center gap-2 border border-white/10 px-3 py-1.5 rounded-full bg-white/5 cursor-default relative group ml-1"
            aria-label="Rastreamento de veículos — em breve"
          >
            <Truck className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span>Rastrear</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-widest">
              <Clock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
              Em Breve
            </span>
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
        <div className="lg:hidden bg-background/95 backdrop-blur-md border-t border-white/10 absolute top-20 left-0 right-0 z-40">
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
                handleTrackingComingSoon();
                setMobileOpen(false);
              }}
              className="text-sm font-bold text-muted-foreground/60 uppercase tracking-wider flex items-center gap-2 border border-white/10 px-3 py-2 rounded-full bg-white/5 w-fit cursor-default"
              aria-label="Rastreamento de veículos — em breve"
            >
              <Truck className="w-4 h-4" aria-hidden="true" />
              <span>Rastrear</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                <Clock className="w-3 h-3" aria-hidden="true" />
                Em Breve
              </span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
