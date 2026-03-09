/* CTASection — SEO-optimized reusable CTA with tracking */
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openContact } from "@/lib/contact";
import { trackCTAClick, trackWhatsAppClick } from "@/lib/analytics";

interface Props {
  title: string;
  description: string;
  buttonText: string;
  variant: "primary" | "secondary";
}

export default function CTASection({ title, description, buttonText, variant }: Props) {
  function handleClick() {
    const msg = `Olá! Vi o site e gostaria de saber mais. ${buttonText}`;
    trackCTAClick(buttonText, `cta_section_${variant}`, "whatsapp", buttonText);
    trackWhatsAppClick(`cta_section_${variant}`, msg);
    openContact(msg);
  }

  return (
    <section
      aria-label={title}
      data-section={`cta-${variant}`}
      className={`py-16 ${
        variant === "primary"
          ? "bg-zinc-900/50 border-y border-white/5"
          : "bg-zinc-900"
      }`}
    >
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <header className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-white">{title}</h2>
            <p className="text-lg text-gray-400 mt-2 font-body">{description}</p>
          </header>
          <Button
            onClick={handleClick}
            className="h-14 px-8 text-lg font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-transform bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0"
            aria-label={`${buttonText} - Entrar em contato via WhatsApp`}
          >
            <MessageCircle className="mr-2 w-5 h-5" aria-hidden="true" />
            {buttonText}
          </Button>
        </div>
      </div>
    </section>
  );
}
