/* RoutePageLayout — Reusable layout for route and cost pages with SEO schema */
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Link } from "wouter";
import { ArrowRight, Clock, DollarSign, FileText, Ship, CheckCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openContact } from "@/lib/contact";

export interface RouteStep {
  title: string;
  description: string;
}

export interface CostFactor {
  item: string;
  description: string;
  estimate: string;
}

export interface RoutePageData {
  title: string;
  subtitle: string;
  metaDescription: string;
  heroImage?: string;
  origin: string;
  destination: string;
  introText: string;
  sections: {
    title: string;
    content: string;
  }[];
  steps: RouteStep[];
  costFactors: CostFactor[];
  timeline: string;
  modalities: {
    name: string;
    pros: string[];
    cons: string[];
    cost: string;
    time: string;
  }[];
  documents: string[];
  faqs: { question: string; answer: string }[];
  relatedRoutes: { label: string; href: string }[];
  ctaText: string;
  calculatorLink?: string;
}

export default function RoutePageLayout({ data }: { data: RoutePageData }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="pt-28 pb-16 bg-gradient-to-b from-card to-background">
          <div className="container max-w-5xl">
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6 font-body">
              <Link href="/" className="hover:text-primary transition-colors">Início</Link>
              <span>/</span>
              <span className="text-gray-300">Rotas</span>
            </nav>
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-8 h-8 text-primary flex-shrink-0" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-display leading-tight">
                {data.title}
              </h1>
            </div>
            <p className="text-gray-300 text-lg max-w-3xl font-body mb-6">{data.subtitle}</p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => openContact(data.ctaText)}
                className="bg-primary hover:bg-primary/90 font-bold"
                size="lg"
              >
                Solicitar Cotação
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              {data.calculatorLink && (
                <a href={data.calculatorLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/5">
                    <DollarSign className="mr-2 w-4 h-4" />
                    Simular Custos
                  </Button>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Route Summary Cards */}
        <section className="py-12 -mt-8">
          <div className="container max-w-5xl">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-card/80 border border-white/8 rounded-xl p-5 text-center">
                <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Rota</p>
                <p className="text-white font-bold font-display">{data.origin} → {data.destination}</p>
              </div>
              <div className="bg-card/80 border border-white/8 rounded-xl p-5 text-center">
                <Clock className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Prazo Estimado</p>
                <p className="text-white font-bold font-display">{data.timeline}</p>
              </div>
              <div className="bg-card/80 border border-white/8 rounded-xl p-5 text-center">
                <Ship className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Modalidades</p>
                <p className="text-white font-bold font-display">{data.modalities.map(m => m.name).join(" / ")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="py-12">
          <div className="container max-w-4xl">
            <div className="prose prose-invert prose-lg max-w-none font-body">
              <p className="text-gray-300 text-lg leading-relaxed">{data.introText}</p>
            </div>
          </div>
        </section>

        {/* Content Sections */}
        {data.sections.map((section, i) => (
          <section key={i} className={`py-10 ${i % 2 === 0 ? "" : "bg-card/30"}`}>
            <div className="container max-w-4xl">
              <h2 className="text-2xl font-bold text-white font-display mb-4">{section.title}</h2>
              <div className="text-gray-300 font-body leading-relaxed whitespace-pre-line">{section.content}</div>
            </div>
          </section>
        ))}

        {/* Step-by-Step Process */}
        <section className="py-16 bg-card">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-bold text-white font-display mb-8">Passo a Passo do Processo</h2>
            <div className="space-y-6">
              {data.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-white font-bold font-display mb-1">{step.title}</h3>
                    <p className="text-gray-400 font-body text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cost Factors */}
        <section className="py-16">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-bold text-white font-display mb-8">
              <DollarSign className="inline w-6 h-6 text-primary mr-2" />
              Fatores de Custo
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Item</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Descrição</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Estimativa</th>
                  </tr>
                </thead>
                <tbody>
                  {data.costFactors.map((cost, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/2">
                      <td className="py-3 px-4 text-white font-medium font-display text-sm">{cost.item}</td>
                      <td className="py-3 px-4 text-gray-400 font-body text-sm">{cost.description}</td>
                      <td className="py-3 px-4 text-primary font-semibold text-sm">{cost.estimate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.calculatorLink && (
              <div className="mt-6 text-center">
                <a href={data.calculatorLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
                    <DollarSign className="mr-2 w-4 h-4" />
                    Calcular Custos Exatos na Calculadora
                  </Button>
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Modalities Comparison */}
        {data.modalities.length > 1 && (
          <section className="py-16 bg-card">
            <div className="container max-w-4xl">
              <h2 className="text-2xl font-bold text-white font-display mb-8">Comparação de Modalidades</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {data.modalities.map((mod, i) => (
                  <div key={i} className="bg-background/50 border border-white/8 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white font-display mb-3">{mod.name}</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Custo</p>
                        <p className="text-primary font-semibold">{mod.cost}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Prazo</p>
                        <p className="text-white font-medium">{mod.time}</p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">Vantagens</p>
                        <ul className="space-y-1">
                          {mod.pros.map((p, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs text-red-400 uppercase tracking-wider mb-1">Desvantagens</p>
                        <ul className="space-y-1">
                          {mod.cons.map((c, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-gray-400">
                              <span className="text-red-400 flex-shrink-0">•</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Documents */}
        <section className="py-16">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-bold text-white font-display mb-6">
              <FileText className="inline w-6 h-6 text-primary mr-2" />
              Documentação Necessária
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {data.documents.map((doc, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-white/5">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm font-body">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        {data.faqs.length > 0 && (
          <section className="py-16 bg-card">
            <div className="container max-w-4xl">
              <h2 className="text-2xl font-bold text-white font-display mb-8">Perguntas Frequentes</h2>
              <div className="space-y-4">
                {data.faqs.map((faq, i) => (
                  <details key={i} className="group bg-background/50 border border-white/8 rounded-xl">
                    <summary className="cursor-pointer p-5 text-white font-semibold font-display flex items-center justify-between hover:text-primary transition-colors">
                      {faq.question}
                      <ArrowRight className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0 ml-4" />
                    </summary>
                    <div className="px-5 pb-5 text-gray-400 font-body text-sm leading-relaxed border-t border-white/5 pt-4">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Related Routes */}
        {data.relatedRoutes.length > 0 && (
          <section className="py-12">
            <div className="container max-w-4xl">
              <h2 className="text-xl font-bold text-white font-display mb-4">Rotas Relacionadas</h2>
              <div className="flex flex-wrap gap-3">
                {data.relatedRoutes.map((route) => (
                  <Link key={route.href} href={route.href}>
                    <Button variant="outline" className="border-white/15 text-gray-300 hover:text-white hover:bg-white/5">
                      {route.label}
                      <ArrowRight className="ml-2 w-3 h-3" />
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 bg-gradient-to-b from-background to-card">
          <div className="container text-center max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-display mb-4">
              Pronto para enviar seu veículo?
            </h2>
            <p className="text-gray-300 font-body mb-6">
              Solicite uma cotação personalizada para a rota {data.origin} → {data.destination}. Nossa equipe responde em até 24 horas.
            </p>
            <Button
              onClick={() => openContact(data.ctaText)}
              className="bg-primary hover:bg-primary/90 font-bold"
              size="lg"
            >
              Solicitar Cotação Gratuita
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />

      {/* JSON-LD FAQ Schema */}
      {data.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
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
            }),
          }}
        />
      )}
    </div>
  );
}
