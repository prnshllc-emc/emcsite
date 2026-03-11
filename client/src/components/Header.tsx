/* Header — SEO-optimized with semantic nav, tracking events, and accessibility */
import { useState, useEffect } from "react";
import { Menu, Truck, X } from "lucide-react";
import { LOGO_URL } from "@/lib/contact";
import { trackNavClick } from "@/lib/analytics";
import { Link, useLocation } from "wouter";

interface NavItem {
  label: string;
  anchor?: string;
  href?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Início", anchor: "#inicio" },
  { label: "Sobre Nós", anchor: "#about" },
  { label: "Serviços", anchor: "#services" },
  { label: "Depoimentos", anchor: "#testimonials" },
  { label: "Escritórios", anchor: "#offices" },
  { label: "FAQ", anchor: "#faq" },
  { label: "Conhecimento", href: "/centro-de-conhecimento" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollTo(anchor: string, label: string) {
    trackNavClick(label, anchor);
    if (anchor === "#inicio") {
      // If not on homepage, navigate first
      if (location !== "/") {
        window.location.href = "/#inicio";
        return;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      setMobileOpen(false);
      return;
    }
    // If not on homepage, navigate to homepage with anchor
    if (location !== "/") {
      window.location.href = `/${anchor}`;
      return;
    }
    const el = document.querySelector(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  }

  function renderNavItem(item: NavItem, mobile = false) {
    const baseClass = mobile
      ? "text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider text-left py-3 px-3 rounded-md"
      : "whitespace-nowrap px-3 py-2 rounded-md text-[13px] xl:text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider";

    if (item.href) {
      return (
        <Link
          key={item.href}
          href={item.href}
          className={baseClass}
          onClick={() => {
            trackNavClick(item.label, item.href!);
            setMobileOpen(false);
          }}
        >
          {item.label}
        </Link>
      );
    }

    return (
      <a
        key={item.anchor}
        href={item.anchor}
        onClick={(e) => {
          e.preventDefault();
          scrollTo(item.anchor!, item.label);
        }}
        className={baseClass}
      >
        {item.label}
      </a>
    );
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
            if (location !== "/") {
              window.location.href = "/";
              return;
            }
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
          {NAV_ITEMS.map((item) => renderNavItem(item))}

          {/* Tracking Button — Active link to /rastrear */}
          <a
            href="/rastrear"
            className="whitespace-nowrap ml-2 text-[12px] xl:text-[13px] font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 border border-primary/40 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 hover:border-primary/60 transition-all"
            aria-label="Rastrear veículo"
          >
            <Truck className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span>Rastrear</span>
          </a>
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
            {NAV_ITEMS.map((item) => renderNavItem(item, true))}
            <a
              href="/rastrear"
              className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 border border-primary/40 px-4 py-2.5 rounded-full bg-primary/10 hover:bg-primary/20 w-fit mt-2"
              aria-label="Rastrear veículo"
            >
              <Truck className="w-4 h-4" aria-hidden="true" />
              <span>Rastrear</span>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
