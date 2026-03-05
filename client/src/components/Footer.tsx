/* Footer — 4-column layout with brand, links, contact, newsletter + Ayrton Senna */
import { Instagram, Facebook, MapPin, Phone, Mail, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LOGO_URL, openContact } from "@/lib/contact";
import { useState } from "react";
import { toast } from "sonner";

const QUICK_LINKS = [
  { label: "Início", href: "#" },
  { label: "Sobre Nós", href: "#about" },
  { label: "Serviços", href: "#services" },
  { label: "Depoimentos", href: "#testimonials" },
  { label: "Escritórios", href: "#offices" },
  { label: "FAQ", href: "#faq" },
];

const OFFICES = [
  { flag: "🇺🇸", name: "Miami, FL (Sede)", addr: "1150 NW 72nd Ave, Tower 1, Ste 455, Miami, FL 33126" },
  { flag: "🇧🇷", name: "São Paulo, SP", addr: "Vila Olímpia, São Paulo - SP" },
  { flag: "🇧🇷", name: "Itajaí, SC (Base Op.)", addr: "Próximo ao Porto de Itajaí, SC" },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (email) {
      toast.success("Obrigado! Você receberá nossas novidades em breve.");
      setEmail("");
    }
  }

  function scrollTo(anchor: string) {
    if (anchor === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.querySelector(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <footer className="bg-card border-t border-white/10 pt-20 pb-10">
      <div className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <img src={LOGO_URL} alt="EMC - Enviando Meu Carro" className="h-10 w-auto" />
            <p className="text-muted-foreground text-sm font-body leading-relaxed">
              O jeito mais Rápido, Seguro e Barato de transportar seu veículo entre Brasil e Estados Unidos. Importação, exportação e logística automotiva internacional.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/enviandomeucarro"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/enviandomeucarro"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-display font-bold text-lg mb-6">Links Rápidos</h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm font-body"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Offices */}
          <div>
            <h4 className="text-white font-display font-bold text-lg mb-6">Contato</h4>
            <div className="space-y-4">
              <button
                onClick={() => openContact()}
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm font-body"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                +55 (11) 99244-8920
              </button>
              <a
                href="mailto:atendimento@enviandomeucarro.com"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm font-body"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                atendimento@enviandomeucarro.com
              </a>
              <div className="pt-2 space-y-3">
                {OFFICES.map((office) => (
                  <div key={office.name} className="flex items-start gap-3 text-muted-foreground text-sm font-body">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white font-medium">{office.flag} {office.name}</span>
                      <br />
                      <span className="text-xs">{office.addr}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-display font-bold text-lg mb-6">Newsletter</h4>
            <p className="text-muted-foreground text-sm font-body mb-4">
              Receba condições exclusivas e informações relevantes sobre importação e exportação de veículos.
            </p>
            <form onSubmit={handleNewsletter} className="space-y-3">
              <Input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-white/10 focus:border-primary"
                required
              />
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 font-bold tracking-wider uppercase text-sm"
              >
                Inscrever-se
              </Button>
            </form>
          </div>
        </div>

        {/* Instituto Ayrton Senna */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm font-body">
            <Heart className="w-4 h-4 text-primary" />
            <span>
              Na Enviando Meu Carro apoiamos o{" "}
              <a
                href="https://www.institutoayrtonsenna.org.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Instituto Ayrton Senna
              </a>
              , acreditamos no impacto das boas ações e inspiramos outros a também transformar vidas.
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm font-body">
            © {new Date().getFullYear()} VC que Manda! — Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <button className="text-muted-foreground hover:text-primary text-sm font-body transition-colors">
              Política de Privacidade
            </button>
            <button className="text-muted-foreground hover:text-primary text-sm font-body transition-colors">
              Termos de Uso
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
