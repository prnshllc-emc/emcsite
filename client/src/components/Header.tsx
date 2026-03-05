/* Header — Fixed top navigation with blur backdrop, logo, nav links, and tracking button */
import { useState } from "react";
import { Menu, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOGO_URL } from "@/lib/contact";
import TrackingLoginModal from "./TrackingLoginModal";

const NAV_ITEMS = [
  { label: "Início", anchor: "#" },
  { label: "Sobre Nós", anchor: "#about" },
  { label: "Serviços", anchor: "#services" },
  { label: "Depoimentos", anchor: "#testimonials" },
  { label: "Escritórios", anchor: "#offices" },
  { label: "FAQ", anchor: "#faq" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);

  function scrollTo(anchor: string) {
    if (anchor === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setMobileOpen(false);
      return;
    }
    const el = document.querySelector(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="container flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex-shrink-0">
            <img
              src={LOGO_URL}
              alt="EMC - Enviando Meu Carro"
              className="h-14 w-auto hover:scale-105 transition-transform duration-300"
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.anchor}
                onClick={() => scrollTo(item.anchor)}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => setTrackingOpen(true)}
              className="text-sm font-bold text-primary hover:text-primary/80 uppercase tracking-wider flex items-center gap-2 border border-primary/20 px-3 py-1 rounded-full bg-primary/5 transition-colors"
            >
              <Truck className="w-4 h-4" />
              Rastrear Meu Carro
            </button>
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-background/95 backdrop-blur-md border-t border-white/10 absolute top-20 left-0 right-0 z-40">
            <nav className="container py-6 flex flex-col gap-4">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.anchor}
                  onClick={() => scrollTo(item.anchor)}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider text-left py-2"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setTrackingOpen(true);
                  setMobileOpen(false);
                }}
                className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2 border border-primary/20 px-3 py-2 rounded-full bg-primary/5 w-fit transition-colors"
              >
                <Truck className="w-4 h-4" />
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
