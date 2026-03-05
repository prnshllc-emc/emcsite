/* Footer — 4-column layout with brand, links, contact, newsletter */
import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LOGO_URL, openContact } from "@/lib/contact";
import { useState } from "react";
import { toast } from "sonner";

const QUICK_LINKS = [
  { label: "Página Inicial", href: "#" },
  { label: "Sobre Nós", href: "#stats" },
  { label: "Serviços", href: "#services" },
  { label: "Galeria", href: "#testimonials" },
  { label: "Blog", href: "#" },
  { label: "Contato", href: "#faq" },
];

const ADDRESSES = [
  "1221 Brickell Ave, Suite 900, Miami, FL 33131, EUA",
  "Av. Coronel Marcos Konder, 1313, sala 607, Itajaí, SC",
  "Rua Gomes de Carvalho, 911, 1° andar, Vila Olímpia, São Paulo, SP",
];

export default function Footer() {
  const [email, setEmail] = useState("");

  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (email) {
      window.open(
        `https://calculadora.enviandomeucarro.com?utm_source=newsletter&email=${encodeURIComponent(email)}`,
        "_blank"
      );
      toast.success("Redirecionando para nosso simulador!");
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
            <img src={LOGO_URL} alt="Enviando Meu Carro" className="h-16 w-auto" />
            <p className="text-muted-foreground text-sm font-body leading-relaxed">
              O jeito mais Rápido, Seguro e Barato de importar seu veículo dos EUA para o Brasil.
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

          {/* Contact */}
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
                href="mailto:info@enviandomeucarro.com"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm font-body"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                info@enviandomeucarro.com
              </a>
              {ADDRESSES.map((addr) => (
                <div key={addr} className="flex items-start gap-3 text-muted-foreground text-sm font-body">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{addr}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-display font-bold text-lg mb-6">Newsletter</h4>
            <p className="text-muted-foreground text-sm font-body mb-4">
              Receba condições exclusivas e informações relevantes sobre importação de veículos.
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
                Quero Receber Ofertas
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm font-body">
            © {new Date().getFullYear()} Enviando Meu Carro — Todos os direitos reservados.
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
