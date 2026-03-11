/* Footer — SEO-optimized with consistent design, dynamic settings from DB */
import { Instagram, Facebook, MapPin, Phone, Mail, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LOGO_URL, CLUB_AACA_URL, CLUB_ACB_URL, openContactWithNumber } from "@/lib/contact";
import { useState } from "react";
import { toast } from "sonner";
import { trackCTAClick, trackNavClick, trackWhatsAppClick, trackNewsletterSubscribe } from "@/lib/analytics";
import { trpc } from "@/lib/trpc";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { Link } from "wouter";

const QUICK_LINKS = [
  { label: "Início", href: "#inicio" },
  { label: "Sobre Nós", href: "#about" },
  { label: "Serviços", href: "#services" },
  { label: "Depoimentos", href: "#testimonials" },
  { label: "Escritórios", href: "#offices" },
  { label: "FAQ", href: "#faq" },
  { label: "Calculadora de Importação", href: "https://calculadora.enviandomeucarro.com", external: true },
  { label: "Centro de Conhecimento", href: "/centro-de-conhecimento" },
];

const SERVICE_LINKS = [
  { label: "Importação de Veículos", href: "/importacao-de-veiculos" },
  { label: "Exportação de Veículos", href: "/exportacao-de-veiculos" },
  { label: "Despacho Aduaneiro", href: "/despacho-aduaneiro" },
  { label: "Transporte Internacional", href: "/transporte-internacional-de-veiculos" },
  { label: "Importação de Clássicos", href: "/importacao-de-carros-classicos" },
  { label: "Admissão Temporária", href: "/admissao-temporaria" },
];

const ROUTE_LINKS = [
  { label: "Brasil → EUA", href: "/rotas/enviar-carro-brasil-estados-unidos" },
  { label: "Brasil → Europa", href: "/rotas/enviar-carro-brasil-europa" },
  { label: "EUA → Brasil", href: "/rotas/importar-carro-estados-unidos-brasil" },
  { label: "Custo de Importação", href: "/custos/quanto-custa-importar-veiculo" },
  { label: "Custo de Exportação", href: "/custos/quanto-custa-exportar-carro" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const { get } = useSiteSettings();

  const phone = get("phone_primary");
  const emailAddr = get("email_primary");
  const whatsappNumber = get("whatsapp_number");
  const instagramUrl = get("instagram_url");
  const facebookUrl = get("facebook_url");
  const addressMiami = get("address_miami");
  const addressSP = get("address_sp");
  const addressItajai = get("address_itajai");

  const offices = [
    { flag: "🇺🇸", name: "Miami, FL (Sede)", addr: addressMiami },
    { flag: "🇧🇷", name: "São Paulo, SP", addr: addressSP },
    { flag: "🇧🇷", name: "Itajaí, SC (Base Op.)", addr: addressItajai },
  ];

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      trackCTAClick("Newsletter", "footer_newsletter", "form_submit", "Inscrever-se");
      trackNewsletterSubscribe(email);
      toast.success("Obrigado! Você receberá nossas novidades em breve.");
      setEmail("");
    },
    onError: (err) => {
      if (err.message.includes("Duplicate")) {
        toast.info("Este e-mail já está cadastrado na nossa newsletter!");
      } else {
        toast.error("Erro ao inscrever. Tente novamente.");
      }
      setEmail("");
    },
  });

  function getUtmParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get("utm_source") || undefined,
      utmMedium: params.get("utm_medium") || undefined,
      utmCampaign: params.get("utm_campaign") || undefined,
      utmContent: params.get("utm_content") || undefined,
      utmTerm: params.get("utm_term") || undefined,
      referrer: document.referrer || undefined,
      landingPage: window.location.href,
    };
  }

  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (email) {
      const tracking = getUtmParams();
      subscribeMutation.mutate({ email, ...tracking });
    }
  }

  function scrollTo(anchor: string, label?: string) {
    trackNavClick(label || anchor, anchor);
    if (anchor === "#inicio") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.querySelector(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  function handleWhatsApp() {
    trackWhatsAppClick("footer_phone");
    trackCTAClick("Telefone Footer", "footer_contact", "whatsapp", "Telefone");
    openContactWithNumber(whatsappNumber);
  }

  return (
    <footer className="bg-card pb-8" role="contentinfo">
      {/* Top accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" aria-hidden="true" />

      <div className="container pt-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <img
              src={LOGO_URL}
              alt="EMC - Enviando Meu Carro - Importação e Exportação de Veículos"
              className="h-16 w-auto"
              loading="lazy"
              width="120"
              height="40"
            />
            <p className="text-gray-400 text-sm font-body leading-relaxed">
              O jeito mais Rápido, Seguro e Inteligente de <strong className="text-gray-300">importar e exportar veículos</strong> para qualquer lugar do mundo.
            </p>
            <div className="flex gap-2.5">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCTAClick("Instagram", "footer_social", instagramUrl, "Instagram")}
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/8 hover:bg-primary hover:border-primary hover:text-white flex items-center justify-center text-gray-400 transition-all"
                  aria-label="Siga a Enviando Meu Carro no Instagram"
                >
                  <Instagram className="w-5 h-5" aria-hidden="true" />
                </a>
              )}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCTAClick("Facebook", "footer_social", facebookUrl, "Facebook")}
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/8 hover:bg-primary hover:border-primary hover:text-white flex items-center justify-center text-gray-400 transition-all"
                  aria-label="Siga a Enviando Meu Carro no Facebook"
                >
                  <Facebook className="w-5 h-5" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Links de navegação do rodapé">
            <h4 className="text-white font-display font-bold mb-5">Navegação</h4>
            <ul className="space-y-2.5 list-none">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  {"external" in link && link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-primary transition-colors text-sm font-body"
                    >
                      {link.label}
                    </a>
                  ) : link.href.startsWith("/") ? (
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-primary transition-colors text-sm font-body"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollTo(link.href);
                      }}
                      className="text-gray-400 hover:text-primary transition-colors text-sm font-body"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>

            <h4 className="text-white font-display font-bold mt-6 mb-3">Serviços</h4>
            <ul className="space-y-2 list-none">
              {SERVICE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm font-body"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="text-white font-display font-bold mt-6 mb-3">Rotas & Custos</h4>
            <ul className="space-y-2 list-none">
              {ROUTE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm font-body"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact & Offices */}
          <div>
            <h4 className="text-white font-display font-bold mb-5">Contato</h4>
            <address className="not-italic space-y-3">
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-2.5 text-gray-400 hover:text-primary transition-colors text-sm font-body"
                aria-label="Entrar em contato via WhatsApp"
              >
                <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                {phone}
              </button>
              <a
                href={`mailto:${emailAddr}`}
                onClick={() => trackCTAClick("Email Footer", "footer_contact", `mailto:${emailAddr}`, "Email")}
                className="flex items-center gap-2.5 text-gray-400 hover:text-primary transition-colors text-sm font-body"
                aria-label="Enviar email para atendimento da Enviando Meu Carro"
              >
                <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                {emailAddr}
              </a>
              <div className="pt-2 space-y-2.5">
                {offices.map((office) => (
                  <div key={office.name} className="flex items-start gap-2.5 text-gray-400 text-sm font-body">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary/50" aria-hidden="true" />
                    <div>
                      <span className="text-gray-300 font-medium">{office.flag} {office.name}</span>
                      <br />
                      <span className="text-xs text-gray-500">{office.addr}</span>
                    </div>
                  </div>
                ))}
              </div>
            </address>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-display font-bold mb-5">Newsletter</h4>
            <p className="text-gray-400 text-sm font-body mb-4 leading-relaxed">
              Receba condições exclusivas e informações sobre <strong className="text-gray-300">importação e exportação de veículos</strong>.
            </p>
            <form onSubmit={handleNewsletter} className="space-y-2.5" aria-label="Formulário de inscrição na newsletter">
              <Input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-white/15 focus:border-primary h-10 text-sm"
                required
                aria-label="Endereço de e-mail para newsletter"
              />
              <Button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90 font-bold tracking-wider uppercase text-xs h-10"
              >
                {subscribeMutation.isPending ? "Enviando..." : "Inscrever-se"}
              </Button>
            </form>
          </div>
        </div>

        {/* Instituto Ayrton Senna */}
        <div className="border-t border-white/8 mt-10 pt-8">
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm font-body">
            <Heart className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
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
              , acreditamos no impacto das boas ações.
            </span>
          </div>
        </div>

        {/* Membro Afiliado */}
        <div className="border-t border-white/8 mt-6 pt-8">
          <div className="flex flex-col items-center gap-4">
            <h4 className="text-white font-display font-bold text-sm tracking-widest uppercase">Membro Afiliado</h4>
            <div className="bg-white rounded-lg px-6 py-3 flex items-center gap-6">
              <a
                href="https://www.aaca.org"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                aria-label="Antique Automobile Club of America"
              >
                <img
                  src={CLUB_AACA_URL}
                  alt="Antique Automobile Club of America - AACA"
                  className="h-12 md:h-16 w-auto group-hover:scale-105 transition-transform"
                  loading="lazy"
                  width="108"
                  height="80"
                />
              </a>
              <div className="w-px h-10 bg-gray-300" />
              <a
                href="https://www.automovelclube.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                aria-label="Automóvel Clube do Brasil"
              >
                <img
                  src={CLUB_ACB_URL}
                  alt="Automóvel Clube do Brasil - ACB"
                  className="h-12 md:h-16 w-auto group-hover:scale-105 transition-transform"
                  loading="lazy"
                  width="80"
                  height="80"
                />
              </a>
            </div>
            <p className="text-gray-500 text-xs font-body text-center max-w-md">
              Orgulhosamente afiliados aos mais tradicionais clubes de automóveis clássicos do Brasil e dos Estados Unidos.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/8 mt-8 pt-6 pb-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm font-body">
            © {new Date().getFullYear()} Enviando Meu Carro (EMC) — Importação e Exportação de Veículos — Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <Link
              href="/politica-de-privacidade"
              className="text-gray-400 hover:text-primary text-sm font-body transition-colors"
            >
              Política de Privacidade
            </Link>
            <Link
              href="/termos-de-uso"
              className="text-gray-400 hover:text-primary text-sm font-body transition-colors"
            >
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
