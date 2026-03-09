/* Header — SEO-optimized with semantic nav, tracking events, and accessibility */
import { useState, useEffect } from "react";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-lg border-b border-white/10 shadow-lg shadow-black/20"
          : "bg-background/70 backdrop-blur-md border-b border-white/5"
      }`}
      role="banner"
    >
      <div className="container flex items-center justify-between h-[4.5rem] lg:h-20">
        {/* Logo */}
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
            className="h-16 lg:h-20 w-auto hover:scale-105 transition-transform duration-300"
            width="180"
            height="80"
          />
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.anchor}
              href={item.anchor}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(item.anchor, item.label);
              }}
              className="whitespace-nowrap px-3 py-2 rounded-md text-[13px] xl:text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider"
            >
              {item.label}
            </a>
          ))}

          {/* Tracking Coming Soon - subtle pill */}
          <button
            onClick={handleTrackingComingSoon}
            className="whitespace-nowrap ml-2 text-[12px] xl:text-[13px] font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5 border border-white/8 px-3 py-1.5 rounded-full bg-white/3 cursor-default hover:bg-white/5 transition-colors"
            aria-label="Rastreamento de veículos — em breve"
          >
            <Truck className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span>Rastrear</span>
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-primary/15 text-primary/80 px-1.5 py-0.5 rounded-full">
              <Clock className="w-2.5 h-2.5 flex-shrink-0" aria-hidden="true" />
              Breve
            </span>
          </button>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden text-white p-2 -mr-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-background/98 backdrop-blur-lg border-t border-white/10 absolute top-[4.5rem] left-0 right-0 z-40 shadow-xl shadow-black/30">
          <nav className="container py-4 flex flex-col gap-1" aria-label="Navegação mobile">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.anchor}
                href={item.anchor}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(item.anchor, item.label);
                }}
                className="text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider text-left py-3 px-3 rounded-md"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => {
                handleTrackingComingSoon();
                setMobileOpen(false);
              }}
              className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2 border border-white/8 px-3 py-2.5 rounded-full bg-white/3 w-fit cursor-default mt-2"
              aria-label="Rastreamento de veículos — em breve"
            >
              <Truck className="w-4 h-4" aria-hidden="true" />
              <span>Rastrear</span>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-primary/15 text-primary/80 px-1.5 py-0.5 rounded-full">
                <Clock className="w-2.5 h-2.5" aria-hidden="true" />
                Breve
              </span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
