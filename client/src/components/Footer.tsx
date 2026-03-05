/* Footer — SEO-optimized with semantic HTML (nav, address), proper link structure, and keyword-rich content */
import { Instagram, Facebook, MapPin, Phone, Mail, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LOGO_URL, openContact, CLUB_AACA_URL, CLUB_ACB_URL } from "@/lib/contact";
import { useState } from "react";
import { toast } from "sonner";

const QUICK_LINKS = [
  { label: "Início", href: "#inicio" },
  { label: "Sobre Nós", href: "#about" },
  { label: "Serviços", href: "#services" },
  { label: "Depoimentos", href: "#testimonials" },
  { label: "Escritórios", href: "#offices" },
  { label: "FAQ", href: "#faq" },
  { label: "Calculadora de Importação", href: "https://calculadora.enviandomeucarro.com", external: true },
];

const SERVICE_LINKS = [
  { label: "Importação de Veículos", href: "#services" },
  { label: "Exportação de Veículos", href: "#services" },
  { label: "Despacho Aduaneiro", href: "#services" },
  { label: "Peças e Acessórios", href: "#services" },
  { label: "Envios Aéreos", href: "#services" },
  { label: "Admissão Temporária", href: "#services" },
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
    if (anchor === "#inicio") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.querySelector(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <footer className="bg-card border-t border-white/10 pt-20 pb-10" role="contentinfo">
      <div className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <img
              src={LOGO_URL}
              alt="EMC - Enviando Meu Carro - Importação e Exportação de Veículos"
              className="h-10 w-auto"
              loading="lazy"
              width="120"
              height="40"
            />
            <p className="text-muted-foreground text-sm font-body leading-relaxed">
              O jeito mais Rápido, Seguro e Barato de <strong>importar e exportar veículos</strong> para qualquer lugar do mundo.
              Logística automotiva internacional com transparência total há mais de 10 anos.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/enviandomeucarro"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors"
                aria-label="Siga a Enviando Meu Carro no Instagram"
              >
                <Instagram className="w-5 h-5" aria-hidden="true" />
              </a>
              <a
                href="https://www.facebook.com/enviandomeucarro"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors"
                aria-label="Siga a Enviando Meu Carro no Facebook"
              >
                <Facebook className="w-5 h-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Links de navegação do rodapé">
            <h4 className="text-white font-display font-bold text-lg mb-6">Navegação</h4>
            <ul className="space-y-3 list-none">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  {"external" in link && link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors text-sm font-body"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollTo(link.href);
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm font-body"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>

            <h4 className="text-white font-display font-bold text-lg mt-8 mb-4">Serviços</h4>
            <ul className="space-y-2 list-none">
              {SERVICE_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo(link.href);
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm font-body"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact & Offices */}
          <div>
            <h4 className="text-white font-display font-bold text-lg mb-6">Contato</h4>
            <address className="not-italic space-y-4">
              <button
                onClick={() => openContact()}
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm font-body"
                aria-label="Entrar em contato via WhatsApp"
              >
                <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                +55 (11) 99244-8920
              </button>
              <a
                href="mailto:atendimento@enviandomeucarro.com"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm font-body"
                aria-label="Enviar email para atendimento da Enviando Meu Carro"
              >
                <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                atendimento@enviandomeucarro.com
              </a>
              <div className="pt-2 space-y-3">
                {OFFICES.map((office) => (
                  <div key={office.name} className="flex items-start gap-3 text-muted-foreground text-sm font-body">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <span className="text-white font-medium">{office.flag} {office.name}</span>
                      <br />
                      <span className="text-xs">{office.addr}</span>
                    </div>
                  </div>
                ))}
              </div>
            </address>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-display font-bold text-lg mb-6">Newsletter</h4>
            <p className="text-muted-foreground text-sm font-body mb-4">
              Receba condições exclusivas e informações sobre <strong>importação e exportação de veículos</strong>,
              novidades do mercado automotivo e dicas de logística internacional.
            </p>
            <form onSubmit={handleNewsletter} className="space-y-3" aria-label="Formulário de inscrição na newsletter">
              <Input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-white/10 focus:border-primary"
                required
                aria-label="Endereço de e-mail para newsletter"
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
            <Heart className="w-4 h-4 text-primary" aria-hidden="true" />
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

        {/* Membro Afiliado */}
        <div className="border-t border-white/10 mt-8 pt-8">
          <div className="flex flex-col items-center gap-4">
            <h4 className="text-white font-display font-bold text-lg tracking-widest uppercase">Membro Afiliado</h4>
            <div className="flex items-center gap-8">
              <a
                href="https://www.aaca.org"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                aria-label="Antique Automobile Club of America"
              >
                <img
                  src={CLUB_AACA_URL}
                  alt="Antique Automobile Club of America - AACA - Fundado em 1935"
                  className="h-16 md:h-20 w-auto brightness-0 invert opacity-70 group-hover:opacity-100 transition-opacity"
                  loading="lazy"
                  width="108"
                  height="80"
                />
              </a>
              <a
                href="https://www.automovelclube.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                aria-label="Automóvel Clube do Brasil"
              >
                <img
                  src={CLUB_ACB_URL}
                  alt="Automóvel Clube do Brasil - ACB - Fundado em 1907"
                  className="h-16 md:h-20 w-auto opacity-70 group-hover:opacity-100 transition-opacity"
                  loading="lazy"
                  width="80"
                  height="80"
                />
              </a>
            </div>
            <p className="text-muted-foreground text-xs font-body text-center max-w-md">
              Orgulhosamente afiliados aos mais tradicionais clubes de automóveis clássicos do Brasil e dos Estados Unidos.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm font-body">
            © {new Date().getFullYear()} Enviando Meu Carro (EMC) — Importação e Exportação de Veículos — Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary text-sm font-body transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary text-sm font-body transition-colors">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
