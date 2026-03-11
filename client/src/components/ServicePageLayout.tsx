/* ServicePageLayout — Reusable layout for deep SEO service pages */
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { ArrowLeft, MessageCircle, Calculator, CheckCircle2, Clock, FileText, DollarSign, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { openContact } from "@/lib/contact";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { trackCTAClick, trackWhatsAppClick, trackCalculatorInteraction } from "@/lib/analytics";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect } from "react";

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ComparisonRow {
  feature: string;
  optionA: string;
  optionB: string;
}

export interface ServicePageData {
  slug: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  icon: React.ReactNode;
  heroImage?: string;
  definition: {
    title: string;
    content: string[];
  };
  process: {
    title: string;
    intro?: string;
    steps: { title: string; description: string }[];
  };
  costs: {
    title: string;
    intro?: string;
    items: { label: string; description: string }[];
    calculatorNote?: string;
  };
  timelines: {
    title: string;
    items: { phase: string; duration: string }[];
    totalEstimate?: string;
  };
  documentation: {
    title: string;
    groups: { groupTitle: string; items: string[] }[];
  };
  comparison: {
    title: string;
    intro?: string;
    headerA: string;
    headerB: string;
    rows: ComparisonRow[];
  };
  faqs: ServiceFAQ[];
  ctaTitle: string;
  ctaDescription: string;
  relatedServices?: { label: string; href: string }[];
}

export default function ServicePageLayout({ data }: { data: ServicePageData }) {
  const { get } = useSiteSettings();
  const whatsappNumber = get("whatsapp_number");
  const calculatorUrl = get("calculator_url");

  useEffect(() => {
    document.title = data.seoTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", data.metaDescription);
    else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = data.metaDescription;
      document.head.appendChild(meta);
    }
    window.scrollTo(0, 0);
  }, [data.seoTitle, data.metaDescription]);

  function handleWhatsApp() {
    const msg = `Olá! Gostaria de saber mais sobre ${data.h1}.`;
    trackCTAClick("WhatsApp CTA", `service_${data.slug}`, "whatsapp", data.h1);
    trackWhatsAppClick(`service_page_${data.slug}`, msg);
    const digits = whatsappNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function handleCalculator() {
    trackCTAClick("Calculadora CTA", `service_${data.slug}`, "calculadora", data.h1);
    trackCalculatorInteraction("abrir_calculadora", { origin: `service_${data.slug}` });
    window.open(`${calculatorUrl}?utm_source=site&utm_medium=service_page&utm_content=${data.slug}`, "_blank");
  }

  // FAQ Schema markup for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      {/* FAQ Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main id="main-content" className="flex-1 pt-28 pb-20">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground font-body">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Início
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/#services" className="hover:text-primary transition-colors">
                  Serviços
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-foreground font-medium truncate">{data.h1.split(":")[0]}</li>
            </ol>
          </nav>

          {/* Back link */}
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm font-body">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>

          {/* Page Header */}
          <header className="mb-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                {data.icon}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white leading-tight">
                  {data.h1}
                </h1>
              </div>
            </div>
            {/* Quick CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button onClick={handleWhatsApp} className="cta-whatsapp">
                <MessageCircle className="mr-2 w-5 h-5" />
                Fale com um Especialista
              </Button>
              <div className="cta-calculator-wrapper">
                <Button onClick={handleCalculator} className="cta-calculator" variant="ghost">
                  <Calculator className="mr-2 w-5 h-5 relative z-10" />
                  <span className="relative z-10">Simule seus Custos</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <article className="space-y-16 font-body text-muted-foreground leading-relaxed">

            {/* 1. Definition */}
            <section id="definicao">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white">{data.definition.title}</h2>
              </div>
              {data.definition.content.map((paragraph, i) => (
                <p key={i} className="mb-4 text-gray-300 leading-relaxed">{paragraph}</p>
              ))}
            </section>

            {/* 2. Process */}
            <section id="processo">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white">{data.process.title}</h2>
              </div>
              {data.process.intro && <p className="mb-6 text-gray-300">{data.process.intro}</p>}
              <div className="space-y-4">
                {data.process.steps.map((step, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-card/50 border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Costs */}
            <section id="custos">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white">{data.costs.title}</h2>
              </div>
              {data.costs.intro && <p className="mb-6 text-gray-300">{data.costs.intro}</p>}
              <div className="space-y-3">
                {data.costs.items.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-card/50 border border-white/5">
                    <h3 className="text-white font-semibold text-sm mb-1">{item.label}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
              {data.costs.calculatorNote && (
                <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-gray-300 text-sm">
                    {data.costs.calculatorNote}{" "}
                    <button onClick={handleCalculator} className="text-primary hover:underline font-medium">
                      calculadora.enviandomeucarro.com
                    </button>
                  </p>
                </div>
              )}
            </section>

            {/* 4. Timelines */}
            <section id="prazos">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white">{data.timelines.title}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white font-semibold">Etapa</th>
                      <th className="text-left py-3 px-4 text-white font-semibold">Prazo Estimado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.timelines.items.map((item, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-3 px-4 text-gray-300">{item.phase}</td>
                        <td className="py-3 px-4 text-primary font-medium">{item.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.timelines.totalEstimate && (
                <p className="mt-4 text-gray-300 font-medium bg-card/50 p-4 rounded-xl border border-white/5">
                  <strong className="text-white">Prazo Total Estimado:</strong> {data.timelines.totalEstimate}
                </p>
              )}
            </section>

            {/* 5. Documentation */}
            <section id="documentacao">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white">{data.documentation.title}</h2>
              </div>
              <div className="space-y-6">
                {data.documentation.groups.map((group, i) => (
                  <div key={i}>
                    <h3 className="text-white font-semibold mb-3">{group.groupTitle}</h3>
                    <ul className="space-y-2">
                      {group.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-gray-300 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. Comparison Table */}
            <section id="comparacao">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white">{data.comparison.title}</h2>
              </div>
              {data.comparison.intro && <p className="mb-6 text-gray-300">{data.comparison.intro}</p>}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white font-semibold">Característica</th>
                      <th className="text-left py-3 px-4 text-white font-semibold">{data.comparison.headerA}</th>
                      <th className="text-left py-3 px-4 text-white font-semibold">{data.comparison.headerB}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.comparison.rows.map((row, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-3 px-4 text-gray-300 font-medium">{row.feature}</td>
                        <td className="py-3 px-4 text-gray-400">{row.optionA}</td>
                        <td className="py-3 px-4 text-gray-400">{row.optionB}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 7. FAQ */}
            <section id="faq">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white">Perguntas Frequentes</h2>
              </div>
              <Accordion type="single" collapsible className="space-y-2">
                {data.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border border-white/5 rounded-xl px-4 bg-card/30">
                    <AccordionTrigger className="text-white text-left font-medium text-sm hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-400 text-sm leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            {/* 8. CTA */}
            <section id="cta" className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                {data.ctaTitle}
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                {data.ctaDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleWhatsApp} className="cta-whatsapp">
                  <MessageCircle className="mr-2 w-5 h-5" />
                  Fale com um Especialista
                </Button>
                <div className="cta-calculator-wrapper">
                  <Button onClick={handleCalculator} className="cta-calculator" variant="ghost">
                    <Calculator className="mr-2 w-5 h-5 relative z-10" />
                    <span className="relative z-10">Simule seus Custos</span>
                  </Button>
                </div>
              </div>
            </section>

            {/* Related Services */}
            {data.relatedServices && data.relatedServices.length > 0 && (
              <section id="servicos-relacionados">
                <h2 className="text-xl font-display font-bold text-white mb-4">Serviços Relacionados</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.relatedServices.map((service, i) => (
                    <Link
                      key={i}
                      href={service.href}
                      className="p-4 rounded-xl bg-card/50 border border-white/5 hover:border-primary/20 transition-all text-white font-medium text-sm hover:text-primary"
                    >
                      {service.label} →
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
